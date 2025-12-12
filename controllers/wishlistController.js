const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getWishlist = catchAsync(async (req, res, next) => {
    // Auth check usually handled by middleware, but if code checks explicitly:
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const sql = `
        SELECT w.*, 
               p.name as productName, p.price, p.imageUrl, p.description, p.stock
        FROM Wishlists w
        JOIN Products p ON w.productId = p.id
        WHERE w.userId = ?
    `;
    const [rows] = await pool.query(sql, [req.user.id]);

    const formattedWishlist = rows.map(row => {
        const item = {
            id: row.id, userId: row.userId, productId: row.productId,
            createdAt: row.createdAt, updatedAt: row.updatedAt
        };
        item.Product = {
            id: row.productId,
            name: row.productName,
            price: row.price,
            imageUrl: row.imageUrl,
            description: row.description,
            stock: row.stock
        };
        return item;
    });

    res.json(formattedWishlist);
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { productId } = req.body;

    const [existing] = await pool.query(
        'SELECT * FROM Wishlists WHERE userId = ? AND productId = ?',
        [req.user.id, productId]
    );

    if (existing.length > 0) {
        return next(new AppError('Item already in wishlist', 400));
    }

    const [result] = await pool.query(
        'INSERT INTO Wishlists (userId, productId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
        [req.user.id, productId]
    );

    // Fetch full product details to return
    const sql = `
        SELECT w.*, 
               p.name as productName, p.price, p.imageUrl, p.description, p.stock
        FROM Wishlists w
        JOIN Products p ON w.productId = p.id
        WHERE w.id = ?
    `;
    const [rows] = await pool.query(sql, [result.insertId]);

    if (rows.length === 0) return next(new AppError('Error retrieving added wishlist item', 404));

    const row = rows[0];
    const item = {
        id: row.id, userId: row.userId, productId: row.productId,
        createdAt: row.createdAt, updatedAt: row.updatedAt
    };
    item.Product = {
        id: row.productId,
        name: row.productName,
        price: row.price,
        imageUrl: row.imageUrl,
        description: row.description,
        stock: row.stock
    };

    res.status(201).json(item);
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { productId } = req.params;

    await pool.query(
        'DELETE FROM Wishlists WHERE userId = ? AND productId = ?',
        [req.user.id, productId]
    );

    res.json({ message: 'Device removed from wishlist' });
});
