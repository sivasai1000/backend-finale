const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const register = catchAsync(async (req, res, next) => {
    let { name, email, mobile, password } = req.body;
    if (!name || !password || (!email && !mobile)) {
        return next(new AppError('name, password, and either email or mobile are required', 400));
    }

    // Check if user exists
    const [existing] = await pool.query(
        "SELECT * FROM Users WHERE email = ? OR mobile = ?",
        [email || null, mobile || null]
    );

    if (existing.length > 0) {
        return next(new AppError('Email or mobile already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        "INSERT INTO Users (name, email, mobile, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())",
        [name, email || null, mobile || null, hashedPassword]
    );

    const user = {
        id: result.insertId,
        name,
        email: email || null,
        mobile: mobile || null,
        role: 'user'
    };

    // Create Token
    const payload = {
        user: {
            id: user.id,
            role: user.role
        }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
            if (err) return next(new AppError('Token generation failed', 500));
            return res.status(200).json({
                status: "success",
                message: "Registered successfully",
                token,
                user
            });
        }
    );
});

const login = catchAsync(async (req, res, next) => {
    const { email, mobile, password } = req.body;

    if ((!email && !mobile) || !password) {
        return next(new AppError('email or mobile and password are required', 400));
    }
    const [result] = await pool.query(
        "SELECT * FROM Users WHERE email = ? OR mobile = ?",
        [email || null, mobile || null]
    );

    if (result.length === 0) {
        return next(new AppError('User not found', 404));
    }

    const user = result[0];

    // Active check
    if (user.isActive === 0) {
        return next(new AppError('Your account is deactivated. Please contact admin.', 403));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new AppError('Incorrect password', 401));
    }

    // Create Token
    const payload = {
        user: {
            id: user.id,
            role: user.role
        }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
            if (err) return next(new AppError('Token generation failed', 500));
            return res.status(200).json({
                status: "success",
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role
                },
            });
        }
    );
});

const changePassword = catchAsync(async (req, res, next) => {
    const { email, mobile, password, newpassword } = req.body;

    if ((!email && !mobile) || !password || !newpassword) {
        return next(new AppError('email or mobile, current password, and new password are required', 400));
    }

    const [rows] = await pool.query(
        "SELECT * FROM Users WHERE email = ? OR mobile = ?",
        [email || null, mobile || null]
    );

    if (rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new AppError('Current password is incorrect', 401));
    }

    const newHashedPassword = await bcrypt.hash(newpassword, 10);
    await pool.query("UPDATE Users SET password = ? WHERE id = ?", [newHashedPassword, user.id]);

    return res.status(200).json({
        status: "success",
        message: "Password updated successfully",
    });
});

const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?", [email]);
    if (rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    const user = rows[0];

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await pool.query(
        "UPDATE Users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?",
        [resetPasswordToken, resetPasswordExpires, user.id]
    );

    // Construct reset URL for frontend
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    return res.status(200).json({
        status: "success",
        message: "Reset token generated",
        resetToken: resetToken, // EXPOSING FOR TESTING ONLY
        resetUrl // Helper
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return next(new AppError('Token and new password required', 400));
    }

    // Hash token to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const [rows] = await pool.query(
        "SELECT * FROM Users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?",
        [resetPasswordToken, Date.now()]
    );

    if (rows.length === 0) {
        return next(new AppError('Invalid or expired token', 400));
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear columns
    await pool.query(
        "UPDATE Users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?",
        [hashedPassword, user.id]
    );

    return res.status(200).json({ status: "success", message: "Password reset successfully" });
});

module.exports = { register, login, changePassword, forgotPassword, resetPassword };