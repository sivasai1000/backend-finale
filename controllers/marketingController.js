const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getBanners = catchAsync(async (req, res, next) => {
    const [banners] = await pool.query('SELECT * FROM Banners WHERE isActive = TRUE AND deletedAt IS NULL ORDER BY createdAt DESC');
    res.json(banners);
});

exports.subscribeNewsletter = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    // Check if already subscribed
    const [existing] = await pool.query('SELECT * FROM Subscribers WHERE email = ?', [email]);
    if (existing.length > 0) {
        return next(new AppError('Already subscribed', 409));
    }

    await pool.query('INSERT INTO Subscribers (email) VALUES (?)', [email]);

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
});

exports.createBanner = catchAsync(async (req, res, next) => {
    const { title, subtitle, linkUrl } = req.body;

    let imageUrl = null;
    if (req.file) {
        if (req.file.path.startsWith('http')) {
            imageUrl = req.file.path;
        } else {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
    }

    if (!imageUrl) {
        return next(new AppError('Image is required', 400));
    }

    await pool.query(
        'INSERT INTO Banners (title, subtitle, imageUrl, linkUrl) VALUES (?, ?, ?, ?)',
        [title, subtitle, imageUrl, linkUrl]
    );

    res.status(201).json({ message: 'Banner created successfully' });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // SOFT DELETE
    const [result] = await pool.query('UPDATE Banners SET deletedAt = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Banner not found', 404));
    }

    res.json({ message: 'Banner moved to trash successfully' });
});

exports.getTrashBanners = catchAsync(async (req, res, next) => {
    const [banners] = await pool.query('SELECT * FROM Banners WHERE deletedAt IS NOT NULL');
    res.json(banners);
});

exports.restoreBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE Banners SET deletedAt = NULL WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Banner not found in trash', 404));
    }

    res.json({ message: 'Banner restored successfully' });
});

exports.getAllSubscribers = catchAsync(async (req, res, next) => {
    const [subscribers] = await pool.query('SELECT * FROM Subscribers ORDER BY subscribedAt DESC');
    res.json(subscribers);
});

exports.getAbout = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM About LIMIT 1');
    if (rows.length === 0) {
        return res.json({ title: '', description: '', imageUrl: '' });
    }
    res.json(rows[0]);
});

exports.updateAbout = catchAsync(async (req, res, next) => {
    const { title, description } = req.body;

    let imageUrl = undefined;
    if (req.file) {
        if (req.file.path.startsWith('http')) {
            imageUrl = req.file.path;
        } else {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
    }

    // Check if row exists
    const [rows] = await pool.query('SELECT * FROM About LIMIT 1');

    if (rows.length === 0) {
        // Insert
        await pool.query(
            'INSERT INTO About (title, description, imageUrl) VALUES (?, ?, ?)',
            [title, description, imageUrl || null]
        );
    } else {
        // Update
        let sql = 'UPDATE About SET title = ?, description = ?';
        const params = [title, description];

        if (imageUrl) {
            sql += ', imageUrl = ?';
            params.push(imageUrl);
        }

        sql += ' WHERE id = ?';
        params.push(rows[0].id);

        await pool.query(sql, params);
    }

    res.json({ message: 'About content updated successfully' });
});
