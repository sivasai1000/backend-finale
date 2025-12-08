const pool = require('../config/database');

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment, orderId } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!productId || !rating) {
            return res.status(400).json({ message: 'Product ID and Rating are required' });
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
            return res.status(403).json({ message: 'You can only review products you have purchased and received.' });
        }

        // Use the validated orderId
        const validOrderId = orders[0].orderId;

        await pool.query(
            'INSERT INTO Reviews (productId, userId, rating, comment, status, createdAt, orderId) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
            [productId, userId, rating, comment, 'pending', validOrderId]
        );

        res.status(201).json({ message: 'Review submitted successfully and is pending approval.' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error creating review' });
    }
};

exports.checkEligibility = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({ message: 'Server error checking eligibility' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const [reviews] = await pool.query(`
            SELECT r.*, u.name as userName 
            FROM Reviews r 
            JOIN Users u ON r.userId = u.id 
            WHERE r.productId = ? AND r.status = 'approved' 
            ORDER BY r.createdAt DESC
        `, [productId]);

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};

exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as userName, p.name as productName, p.imageUrl as productImage
            FROM Reviews r 
            JOIN Users u ON r.userId = u.id 
            JOIN Products p ON r.productId = p.id 
            ORDER BY r.createdAt DESC
        `);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};

exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        await pool.query('UPDATE Reviews SET status = ? WHERE id = ?', [status, id]);

        res.json({ message: `Review ${status} successfully` });
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ message: 'Server error updating review status' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Reviews WHERE id = ?', [id]);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
};
