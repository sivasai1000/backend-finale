const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
    const { productId, rating, comment, orderId } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!productId || !rating) {
        return next(new AppError('Product ID and Rating are required', 400));
    }

    // Check for verified purchase (Completed Order)
    let query = `
        SELECT oi.id, o.id as orderId
        FROM OrderItems oi
        JOIN Orders o ON oi.orderId = o.id
        WHERE o.userId = ? 
        AND oi.productId = ? 
        AND o.status = 'completed'
    `;
    const params = [userId, productId];

    if (orderId) {
        query += ' AND o.id = ?';
        params.push(orderId);
    }

    query += ' LIMIT 1';

    const [orders] = await pool.query(query, params);

    if (orders.length === 0) {
        return next(new AppError('You can only review products you have purchased and received.', 403));
    }

    // Use the validated orderId
    const validOrderId = orders[0].orderId;

    await pool.query(
        'INSERT INTO Reviews (productId, userId, rating, comment, status, createdAt, orderId) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
        [productId, userId, rating, comment, 'pending', validOrderId]
    );

    res.status(201).json({ message: 'Review submitted successfully and is pending approval.' });
});

exports.checkEligibility = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const [orders] = await pool.query(`
        SELECT oi.id 
        FROM OrderItems oi
        JOIN Orders o ON oi.orderId = o.id
        WHERE o.userId = ? 
        AND oi.productId = ? 
        AND o.status = 'completed'
        LIMIT 1
    `, [userId, productId]);

    // Also check if they already reviewed? Maybe let's just return if they can review.
    const canReview = orders.length > 0;

    res.json({ canReview });
});

exports.getProductReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const [reviews] = await pool.query(`
        SELECT r.*, u.name as userName 
        FROM Reviews r 
        JOIN Users u ON r.userId = u.id 
        WHERE r.productId = ? AND r.status = 'approved' AND r.deletedAt IS NULL
        ORDER BY r.createdAt DESC
    `, [productId]);

    res.json(reviews);
});

exports.getAllReviewsAdmin = catchAsync(async (req, res, next) => {
    const [reviews] = await pool.query(`
        SELECT r.*, u.name as userName, p.name as productName, p.imageUrl as productImage
        FROM Reviews r 
        JOIN Users u ON r.userId = u.id 
        JOIN Products p ON r.productId = p.id 
        WHERE r.deletedAt IS NULL
        ORDER BY r.createdAt DESC
    `);
    res.json(reviews);
});

exports.updateReviewStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    await pool.query('UPDATE Reviews SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: `Review ${status} successfully` });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    // SOFT DELETE
    const { id } = req.params;
    const [result] = await pool.query('UPDATE Reviews SET deletedAt = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Review not found', 404));
    }

    res.json({ message: 'Review moved to trash' });
});

exports.getTrashReviews = catchAsync(async (req, res, next) => {
    const [reviews] = await pool.query(`
        SELECT r.*, u.name as userName, p.name as productName 
        FROM Reviews r 
        JOIN Users u ON r.userId = u.id 
        JOIN Products p ON r.productId = p.id 
        WHERE r.deletedAt IS NOT NULL
    `);
    res.json(reviews);
});

exports.restoreReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE Reviews SET deletedAt = NULL WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Review not found in trash', 404));
    }

    res.json({ message: 'Review restored successfully' });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await pool.query('DELETE FROM Reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
});
