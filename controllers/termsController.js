const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getTerms = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['terms']);

    if (rows.length === 0) {
        return next(new AppError('Terms and Conditions page not found', 404));
    }
    res.json(rows[0]);
});

exports.updateTerms = catchAsync(async (req, res, next) => {
    const { title, content } = req.body;

    await pool.query(
        'UPDATE Pages SET title = ?, content = ? WHERE slug = ?',
        [title, content, 'terms']
    );

    res.json({ message: 'Terms and Conditions updated successfully' });
});
