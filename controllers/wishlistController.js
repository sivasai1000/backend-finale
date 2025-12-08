const pool = require('../config/database');

exports.getWishlist = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

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
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { productId } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM Wishlists WHERE userId = ? AND productId = ?',
            [req.user.id, productId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Item already in wishlist' });
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

        if (rows.length === 0) return res.status(404).json({ message: "Error retrieving added wishlist item" });

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
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { productId } = req.params;

        await pool.query(
            'DELETE FROM Wishlists WHERE userId = ? AND productId = ?',
            [req.user.id, productId]
        );

        res.json({ message: 'Device removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
