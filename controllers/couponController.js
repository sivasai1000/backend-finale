const pool = require('../config/database');

exports.getCoupons = async (req, res) => {
    try {
        let sql = 'SELECT * FROM Coupons';
        const params = [];

        // Simple check: if not admin, maybe check active? 
        // Logic kept similar: "where" clause based on user role
        if (!req.user || req.user.role !== 'admin') {
            sql += ' WHERE isActive = true';
        }

        const [coupons] = await pool.query(sql, params);
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'Admin'))
            return res.status(403).json({ message: 'Forbidden' });

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
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const { id } = req.params;
        await pool.query('DELETE FROM Coupons WHERE id = ?', [id]);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        console.log(`Validating Coupon: ${code}`);

        const [rows] = await pool.query('SELECT * FROM Coupons WHERE code = ? AND isActive = true', [code]);
        const coupon = rows[0];

        if (!coupon) {
            console.log("Coupon not found or inactive");
            return res.status(404).json({ message: 'Invalid coupon' });
        }

        console.log(`Found Coupon: ${JSON.stringify(coupon)}`);

        if (coupon.minOrderValue > 0) {
            if (cartTotal === undefined) {
                // pass if check skipped
            } else if (Number(cartTotal) < Number(coupon.minOrderValue)) {
                console.log(`Coupon min order value not met: ${cartTotal} < ${coupon.minOrderValue}`);
                return res.status(400).json({
                    message: `Minimum order of $${coupon.minOrderValue} required`,
                    minOrderValue: coupon.minOrderValue
                });
            }
        }

        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            console.log("Coupon expired");
            return res.status(400).json({ message: 'Coupon expired' });
        }

        res.json(coupon);
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
