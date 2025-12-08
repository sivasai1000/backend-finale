const pool = require('../config/database');

exports.getContact = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['contact']);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Contact page not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching contact page:', error);
        res.status(500).json({ message: 'Server error fetching contact page' });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { title, content } = req.body;
        // Ensure the page exists or create it if missing (optional safety)
        // For now, we assume it exists as per migration script.

        await pool.query(
            'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
            [title, content, 'contact']
        );

        res.json({ message: 'Contact page updated successfully' });
    } catch (error) {
        console.error('Error updating contact page:', error);
        res.status(500).json({ message: 'Server error updating contact page' });
    }
};
