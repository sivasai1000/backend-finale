const pool = require('../config/database');

exports.getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ message: 'Server error fetching page' });
    }
};

exports.getAllPages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, slug, title, updatedAt FROM Pages');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ message: 'Server error fetching pages' });
    }
};

exports.updatePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content } = req.body;

        await pool.query(
            'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
            [title, content, slug]
        );

        res.json({ message: 'Page updated successfully' });
    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({ message: 'Server error updating page' });
    }
};

exports.createPage = async (req, res) => {
    try {
        const { slug, title, content } = req.body;
        await pool.query(
            'INSERT INTO Pages (slug, title, content) VALUES (?, ?, ?)',
            [slug, title, content]
        );
        res.status(201).json({ message: 'Page created successfully' });
    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ message: 'Server error creating page' });
    }
};

exports.deletePage = async (req, res) => {
    try {
        const { slug } = req.params;
        await pool.query('DELETE FROM Pages WHERE slug = ?', [slug]);
        res.json({ message: 'Page deleted successfully' });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ message: 'Server error deleting page' });
    }
};
