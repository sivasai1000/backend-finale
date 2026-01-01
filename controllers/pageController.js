const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getPageBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', [slug]);

    if (rows.length === 0) {
        return next(new AppError('Page not found', 404));
    }
    const page = rows[0];
    try {
        if (page.content) {
            page.content = JSON.parse(page.content);
        }
    } catch (e) {
        // Keep as string if parsing fails
    }
    res.json(page);
});

exports.getAllPages = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT id, slug, title, updatedAt FROM Pages');
    res.json(rows);
});

exports.updatePage = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { title, content } = req.body;

    await pool.query(
        'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
        [title, content, slug]
    );

    res.json({ message: 'Page updated successfully' });
});

exports.createPage = catchAsync(async (req, res, next) => {
    const { slug, title, content } = req.body;
    await pool.query(
        'INSERT INTO Pages (slug, title, content) VALUES (?, ?, ?)',
        [slug, title, content]
    );
    res.status(201).json({ message: 'Page created successfully' });
});

exports.deletePage = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    await pool.query('DELETE FROM Pages WHERE slug = ?', [slug]);
    res.json({ message: 'Page deleted successfully' });
});
