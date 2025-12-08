const pool = require('../config/database');

exports.getPrivacy = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['privacy']);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Privacy Policy page not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching privacy page:', error);
        res.status(500).json({ message: 'Server error fetching privacy page' });
    }
};

exports.updatePrivacy = async (req, res) => {
    try {
        const { title, content } = req.body;

        await pool.query(
            'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
            [title, content, 'privacy']
        );

        res.json({ message: 'Privacy Policy updated successfully' });
    } catch (error) {
        console.error('Error updating privacy page:', error);
        res.status(500).json({ message: 'Server error updating privacy page' });
    }
};
