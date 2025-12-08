const pool = require('../config/database');

exports.getFAQs = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FAQs ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Server error fetching FAQs' });
    }
};

exports.createFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }

        await pool.query('INSERT INTO FAQs (question, answer) VALUES (?, ?)', [question, answer]);
        res.status(201).json({ message: 'FAQ created successfully' });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Server error creating FAQ' });
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM FAQs WHERE id = ?', [id]);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Server error deleting FAQ' });
    }
};
