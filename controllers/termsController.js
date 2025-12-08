const pool = require('../config/database');

exports.getTerms = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['terms']);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Terms and Conditions page not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching terms page:', error);
        res.status(500).json({ message: 'Server error fetching terms page' });
    }
};

exports.updateTerms = async (req, res) => {
    try {
        const { title, content } = req.body;

        await pool.query(
            'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
            [title, content, 'terms']
        );

        res.json({ message: 'Terms and Conditions updated successfully' });
    } catch (error) {
        console.error('Error updating terms page:', error);
        res.status(500).json({ message: 'Server error updating terms page' });
    }
};
