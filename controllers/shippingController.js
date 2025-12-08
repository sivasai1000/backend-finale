const pool = require('../config/database');

exports.getShipping = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['shipping']);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Shipping page not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching shipping page:', error);
        res.status(500).json({ message: 'Server error fetching shipping page' });
    }
};

exports.updateShipping = async (req, res) => {
    try {
        const { title, content } = req.body;

        await pool.query(
            'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
            [title, content, 'shipping']
        );

        res.json({ message: 'Shipping page updated successfully' });
    } catch (error) {
        console.error('Error updating shipping page:', error);
        res.status(500).json({ message: 'Server error updating shipping page' });
    }
};
