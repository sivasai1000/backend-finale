const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCoupons = catchAsync(async (req, res, next) => {
    let sql = 'SELECT * FROM Coupons';
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
    await pool.query('DELETE FROM Coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted' });
});

exports.validateCoupon = catchAsync(async (req, res, next) => {
    const { code, cartTotal } = req.body;
    console.log(`Validating Coupon: ${code}`);

    const [rows] = await pool.query('SELECT * FROM Coupons WHERE code = ? AND isActive = true', [code]);
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
