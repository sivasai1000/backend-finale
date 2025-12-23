const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {

    const [users] = await pool.query('SELECT id, name, email, mobile, role, lastActiveAt, isActive, createdAt, updatedAt FROM Users WHERE deletedAt IS NULL');
    res.json(users);
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;


    const [rows] = await pool.query('SELECT * FROM Users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (rows.length === 0) return next(new AppError('User not found', 404));

    await pool.query('UPDATE Users SET isActive = ? WHERE id = ?', [isActive, id]);

    res.json({ message: 'User status updated', user: { id, isActive } });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    const [rows] = await pool.query('SELECT * FROM Users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (rows.length === 0) return next(new AppError('User not found', 404));

    await pool.query('UPDATE Users SET role = ? WHERE id = ?', [role, id]);

    res.json({ message: 'User role updated', user: { id, role } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const [result] = await pool.query('UPDATE Users SET deletedAt = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('User not found', 404));
    }

    res.json({ message: 'User moved to trash successfully' });
});

exports.getTrashUsers = catchAsync(async (req, res, next) => {

    const [users] = await pool.query('SELECT * FROM Users WHERE deletedAt IS NOT NULL');
    res.json(users);
});

exports.restoreUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const [result] = await pool.query('UPDATE Users SET deletedAt = NULL WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('User not found in trash', 404));
    }

    res.json({ message: 'User restored successfully' });
});
