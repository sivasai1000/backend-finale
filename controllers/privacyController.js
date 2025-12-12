const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getPrivacy = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['privacy']);

    if (rows.length === 0) {
        return next(new AppError('Privacy Policy page not found', 404));
    }
    res.json(rows[0]);
});

exports.updatePrivacy = catchAsync(async (req, res, next) => {
    const { title, content } = req.body;

    await pool.query(
        'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
        [title, content, 'privacy']
    );

    res.json({ message: 'Privacy Policy updated successfully' });
});
