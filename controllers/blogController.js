const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllBlogs = catchAsync(async (req, res, next) => {
    const { q, category } = req.query;

    let sql = 'SELECT * FROM Blogs WHERE deletedAt IS NULL';
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
});

exports.getBlogById = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ? AND deletedAt IS NULL', [req.params.id]);
    if (rows.length === 0) {
        return next(new AppError('Blog not found', 404));
    }
    res.json(rows[0]);
});

exports.getCategories = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT DISTINCT category FROM Blogs WHERE deletedAt IS NULL');
    const categoryList = rows.map(c => c.category).filter(Boolean);
    res.json(categoryList);
});

exports.createBlog = catchAsync(async (req, res, next) => {
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
});

exports.updateBlog = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
        return next(new AppError('Blog not found', 404));
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
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
    // SOFT DELETE
    const [result] = await pool.query('UPDATE Blogs SET deletedAt = NOW() WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
        return next(new AppError('Blog not found', 404));
    }
    res.json({ message: 'Blog moved to trash successfully' });
});

exports.getTrashBlogs = catchAsync(async (req, res, next) => {
    const [blogs] = await pool.query('SELECT * FROM Blogs WHERE deletedAt IS NOT NULL');
    res.json(blogs);
});

exports.restoreBlog = catchAsync(async (req, res, next) => {
    const [result] = await pool.query('UPDATE Blogs SET deletedAt = NULL WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
        return next(new AppError('Blog not found in trash', 404));
    }
    res.json({ message: 'Blog restored successfully' });
});
