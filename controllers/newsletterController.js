const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.subscribe = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    // Ensure table exists (simple check for robustness)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Newsletters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Check if already subscribed
    const [existing] = await pool.query('SELECT * FROM Newsletters WHERE email = ?', [email]);
    if (existing.length > 0) {
        return next(new AppError('Email already subscribed', 400));
    }

    await pool.query('INSERT INTO Newsletters (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Subscribed successfully' });
});
