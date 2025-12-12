const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const [users] = await pool.query('SELECT id, name, email, mobile, role, lastActiveAt, isActive, createdAt, updatedAt FROM Users');
    res.json(users);
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
    if (rows.length === 0) return next(new AppError('User not found', 404));

    await pool.query('UPDATE Users SET isActive = ? WHERE id = ?', [isActive, id]);

    res.json({ message: 'User status updated', user: { id, isActive } });
});
