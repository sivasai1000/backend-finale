const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCoupons = catchAsync(async (req, res, next) => {
    let sql = 'SELECT * FROM Coupons WHERE deletedAt IS NULL';
    const params = [];

    if (!req.user || req.user.role !== 'admin') {
        sql += ' WHERE isActive = true';
    }

    const [coupons] = await pool.query(sql, params);
    res.json(coupons);
});

exports.createCoupon = catchAsync(async (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'Admin'))
        return next(new AppError('Forbidden', 403));

    const { code, discountType, value, expiryDate, minOrderValue, isActive = true } = req.body;

    const [result] = await pool.query(
        `INSERT INTO Coupons 
        (code, discountType, value, expiryDate, minOrderValue, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [code, discountType, value, expiryDate, minOrderValue, isActive]
    );

    res.status(201).json({
        id: result.insertId,
        ...req.body
    });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return next(new AppError('Forbidden', 403));

    const { id } = req.params;
    const [result] = await pool.query('UPDATE Coupons SET deletedAt = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Coupon not found', 404));
    }

    res.json({ message: 'Coupon moved to trash' });
});

exports.getTrashCoupons = catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return next(new AppError('Forbidden', 403));
    const [coupons] = await pool.query('SELECT * FROM Coupons WHERE deletedAt IS NOT NULL');
    res.json(coupons);
});

exports.restoreCoupon = catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return next(new AppError('Forbidden', 403));
    const { id } = req.params;
    const [result] = await pool.query('UPDATE Coupons SET deletedAt = NULL WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Coupon not found in trash', 404));
    }

    res.json({ message: 'Coupon restored successfully' });
});

exports.validateCoupon = catchAsync(async (req, res, next) => {
    const { code, cartTotal } = req.body;
    

    const [rows] = await pool.query('SELECT * FROM Coupons WHERE code = ? AND isActive = true AND deletedAt IS NULL', [code]);
    const coupon = rows[0];

    if (!coupon) {
        return next(new AppError('Invalid coupon', 404));
    }

    if (coupon.minOrderValue > 0) {
        if (cartTotal !== undefined && Number(cartTotal) < Number(coupon.minOrderValue)) {
            return next(new AppError(`Minimum order of $${coupon.minOrderValue} required`, 400));
        }
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        return next(new AppError('Coupon expired', 400));
    }

    res.json(coupon);
});
