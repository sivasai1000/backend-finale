const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getFAQs = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM FAQs ORDER BY createdAt DESC');
    res.json(rows);
});

exports.createFAQ = catchAsync(async (req, res, next) => {
    const { question, answer } = req.body;
    if (!question || !answer) {
        return next(new AppError('Question and answer are required', 400));
    }

    await pool.query('INSERT INTO FAQs (question, answer) VALUES (?, ?)', [question, answer]);
    res.status(201).json({ message: 'FAQ created successfully' });
});

exports.deleteFAQ = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await pool.query('DELETE FROM FAQs WHERE id = ?', [id]);
    res.json({ message: 'FAQ deleted successfully' });
});
