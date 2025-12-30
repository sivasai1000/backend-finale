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

exports.updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { name, mobile, address, bio, gender, dateOfBirth } = req.body;
    let profilePicture = req.body.profilePicture; // If not updating image

    if (req.file) {
        // If image is uploaded
        if (req.file.path) {
            // Cloudinary or Disk storage
            profilePicture = req.file.path;
        } else {
            // Fallback for some disk storage configs might be just filename
            profilePicture = `/uploads/${req.file.filename}`;
        }
    }

    // Prepare update query
    let updateFields = [];
    let queryParams = [];

    if (name) { updateFields.push('name = ?'); queryParams.push(name); }
    if (mobile) { updateFields.push('mobile = ?'); queryParams.push(mobile); }
    if (address) { updateFields.push('address = ?'); queryParams.push(address); } // Expecting JSON string or object
    if (bio) { updateFields.push('bio = ?'); queryParams.push(bio); }
    if (gender) { updateFields.push('gender = ?'); queryParams.push(gender); }
    if (dateOfBirth) { updateFields.push('dateOfBirth = ?'); queryParams.push(dateOfBirth); }
    if (profilePicture) { updateFields.push('profilePicture = ?'); queryParams.push(profilePicture); }

    if (updateFields.length === 0) {
        return res.json({ message: 'No changes made', user: req.user });
    }

    queryParams.push(userId);

    const query = `UPDATE Users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(query, queryParams);

    // Fetch updated user
    const [rows] = await pool.query('SELECT id, name, email, mobile, role, isActive, profilePicture, address, bio, gender, dateOfBirth, createdAt FROM Users WHERE id = ?', [userId]);

    res.json({
        message: 'Profile updated successfully',
        user: rows[0]
    });
});
