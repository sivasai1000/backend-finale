const pool = require('../config/database');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.placeOrder = catchAsync(async (req, res, next) => {
    const { items, totalAmount, address } = req.body;
    const userId = req.user.id;

    // Create Razorpay order
    const options = {
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    // Check stock availability before creating order
    for (const item of items) {
        const [rows] = await pool.query('SELECT stock, name FROM Products WHERE id = ?', [item.productId]);
        if (rows.length === 0) {
            return next(new AppError(`Product not found: ${item.productId}`, 404));
        }
        if (rows[0].stock < item.quantity) {
            return next(new AppError(`Insufficient stock for product: ${rows[0].name}. Available: ${rows[0].stock}`, 400));
        }
    }

    const razorpayOrder = await razorpay.orders.create(options);

    // Create Order in DB (Status: pending)
    const [orderResult] = await pool.query(
        'INSERT INTO Orders (totalAmount, status, paymentId, address, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [totalAmount, 'pending', razorpayOrder.id, JSON.stringify(address), userId]
    );
    const orderId = orderResult.insertId;

    // Create OrderItems
    const orderItemsValues = items.map(item => [
        orderId, item.productId, item.quantity, item.price
    ]);

    if (orderItemsValues.length > 0) {
        // Bulk insert
        await pool.query(
            'INSERT INTO OrderItems (orderId, productId, quantity, price, createdAt, updatedAt) VALUES ?',
            [orderItemsValues.map(v => [...v, new Date(), new Date()])]
        );
    }

    res.json({
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
        orderId: orderId // Internal Order ID
    });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        internal_order_id // We should pass this from frontend
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

    if (razorpay_signature === expectedSign) {
        // Payment success, update order status
        await pool.query(
            "UPDATE Orders SET status = 'completed', updatedAt = NOW() WHERE paymentId = ?",
            [razorpay_order_id]
        );

        // Decrease stock
        // 1. Get order ID and items
        const [orderRows] = await pool.query('SELECT id FROM Orders WHERE paymentId = ?', [razorpay_order_id]);
        if (orderRows.length > 0) {
            const orderId = orderRows[0].id;
            const [orderItems] = await pool.query('SELECT productId, quantity FROM OrderItems WHERE orderId = ?', [orderId]);

            // 2. Update stock for each item
            for (const item of orderItems) {
                await pool.query('UPDATE Products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
            }
        }

        return res.status(200).json({ message: 'Payment verified successfully' });
    } else {
        return next(new AppError('Invalid signature sent!', 400));
    }
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
    // Fetch fresh user data from DB
    const [users] = await pool.query('SELECT * FROM Users WHERE id = ?', [req.user.id]);
    const user = users[0];

    let sql = `
        SELECT o.*, 
               u.name as userName, u.email as userEmail,
               oi.id as itemId, oi.productId, oi.quantity, oi.price as itemPrice,
               p.name as productName, p.price as productPrice, p.imageUrl as productImageUrl,
               r.id as reviewId
        FROM Orders o
        LEFT JOIN Users u ON o.userId = u.id
        LEFT JOIN OrderItems oi ON o.id = oi.orderId
        LEFT JOIN Products p ON oi.productId = p.id
        LEFT JOIN Reviews r ON r.orderId = o.id AND r.productId = oi.productId
    `;

    const params = [];
    const isAdmin = user && (user.role === 'admin' || user.role === 'Admin');
    if (!isAdmin) {
        sql += ' WHERE o.userId = ?';
        params.push(req.user.id);
    }

    sql += ' ORDER BY o.createdAt DESC';

    const [rows] = await pool.query(sql, params);

    // Group items by order
    const ordersMap = new Map();

    for (const row of rows) {
        if (!ordersMap.has(row.id)) {
            ordersMap.set(row.id, {
                id: row.id,
                totalAmount: row.totalAmount,
                status: row.status,
                paymentId: row.paymentId,
                address: typeof row.address === 'string' && row.address.startsWith('{') ? JSON.parse(row.address) : row.address,
                userId: row.userId,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                User: { name: row.userName, email: row.userEmail },
                OrderItems: []
            });
        }

        if (row.itemId) {
            const existingItem = ordersMap.get(row.id).OrderItems.find(i => i.id === row.itemId);
            if (!existingItem) {
                ordersMap.get(row.id).OrderItems.push({
                    id: row.itemId,
                    productId: row.productId,
                    quantity: row.quantity,
                    price: row.itemPrice,
                    isReviewed: !!row.reviewId, // True if review exists
                    Product: {
                        name: row.productName,
                        price: row.productPrice,
                        imageUrl: row.productImageUrl
                    }
                });
            } else if (row.reviewId && !existingItem.isReviewed) {
                existingItem.isReviewed = true;
            }
        }
    }

    res.json(Array.from(ordersMap.values()));
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query('UPDATE Orders SET status = ?, updatedAt = NOW() WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Order not found', 404));
    }

    // Fetch updated order
    const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [id]);
    res.json(rows[0]);
});
