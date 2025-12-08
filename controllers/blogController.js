const pool = require('../config/database');

exports.getAllBlogs = async (req, res) => {
    try {
        const { q, category } = req.query;

        let sql = 'SELECT * FROM Blogs';
        const params = [];
        const conditions = [];

        if (q) {
            conditions.push('(title LIKE ? OR content LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY createdAt DESC';

        const [blogs] = await pool.query(sql, params);
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error fetching blogs' });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Server error fetching blog' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT category FROM Blogs');
        const categoryList = rows.map(c => c.category).filter(Boolean);
        res.json(categoryList);
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        res.status(500).json({ message: 'Server error fetching blog categories' });
    }
};

exports.createBlog = async (req, res) => {
    try {
        const { title, content, author = 'Admin', category, tags } = req.body;

        let imageUrl = null;
        if (req.file) {
            // If using local storage, construct full URL
            if (!req.file.path.startsWith('http')) {
                imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            } else {
                imageUrl = req.file.path; // Cloudinary URL
            }
        }

        const [result] = await pool.query(
            'INSERT INTO Blogs (title, content, author, category, imageUrl, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [title, content, author, category, imageUrl, tags]
        );

        res.status(201).json({
            id: result.insertId,
            title, content, author, category, imageUrl, tags
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: 'Server error creating blog' });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const blog = rows[0];

        const { title, content, author, category, tags } = req.body;
        let imageUrl = blog.imageUrl;

        if (req.file) {
            if (!req.file.path.startsWith('http')) {
                imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
            } else {
                imageUrl = req.file.path;
            }
        }

        // Only update fields that are provided
        // But for simplicity of this SQL, we'll update all with current values fallback

        await pool.query(
            `UPDATE Blogs SET 
            title = ?, content = ?, author = ?, category = ?, 
            imageUrl = ?, tags = ?, updatedAt = NOW() 
            WHERE id = ?`,
            [
                title || blog.title,
                content || blog.content,
                author || blog.author,
                category || blog.category,
                imageUrl,
                tags || blog.tags,
                req.params.id
            ]
        );

        const [updatedRows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [req.params.id]);
        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Server error updating blog' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Blogs WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server error deleting blog' });
    }
};
