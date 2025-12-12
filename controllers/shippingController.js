const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getShipping = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['shipping']);

    if (rows.length === 0) {
        return next(new AppError('Shipping page not found', 404));
    }
    res.json(rows[0]);
});

exports.updateShipping = catchAsync(async (req, res, next) => {
    const { title, content } = req.body;

    await pool.query(
        'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
        [title, content, 'shipping']
    );

    res.json({ message: 'Shipping page updated successfully' });
});
