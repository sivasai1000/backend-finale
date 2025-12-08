const pool = require('../config/database');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, address } = req.body;
        const userId = req.user.id;

        // Create Razorpay order
        const options = {
            amount: Math.round(totalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

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
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error placing order' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
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

            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        // Fetch fresh user data from DB
        const [users] = await pool.query('SELECT * FROM Users WHERE id = ?', [req.user.id]);
        const user = users[0];

        let sql = `
            SELECT o.*, 
                   u.name as userName, u.email as userEmail,
                   oi.id as itemId, oi.quantity, oi.price as itemPrice,
                   p.name as productName, p.price as productPrice, p.imageUrl as productImageUrl
            FROM Orders o
            LEFT JOIN Users u ON o.userId = u.id
            LEFT JOIN OrderItems oi ON o.id = oi.orderId
            LEFT JOIN Products p ON oi.productId = p.id
        `;

        const params = [];

        // If NOT admin, scope to user
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
                ordersMap.get(row.id).OrderItems.push({
                    id: row.itemId,
                    quantity: row.quantity,
                    price: row.itemPrice,
                    Product: {
                        name: row.productName,
                        price: row.productPrice,
                        imageUrl: row.productImageUrl
                    }
                });
            }
        }

        res.json(Array.from(ordersMap.values()));
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [result] = await pool.query('UPDATE Orders SET status = ?, updatedAt = NOW() WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch updated order
        const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error updating order status' });
    }
};
