const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getContact = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['contact']);

    if (rows.length === 0) {
        return next(new AppError('Contact page not found', 404));
    }
    res.json(rows[0]);
});

exports.updateContact = catchAsync(async (req, res, next) => {
    const { title, content } = req.body;

    await pool.query(
        'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
        [title, content, 'contact']
    );

    res.json({ message: 'Contact page updated successfully' });
});
