const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const { category, subcategory, minPrice, maxPrice, search, isFeatured } = req.query;

    let sql = `
        SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
        FROM Products p 
        LEFT JOIN Users u ON p.addedBy = u.id
        WHERE p.deletedAt IS NULL
    `;
    const params = [];

    if (category) {
        sql += ' AND p.category = ?';
        params.push(category);
    }

    if (subcategory) {
        sql += ' AND p.subcategory = ?';
        params.push(subcategory);
    }

    if (isFeatured) {
        sql += ' AND p.isFeatured = ?';
        params.push(isFeatured === 'true' ? 1 : 0);
    }

    if (minPrice) {
        sql += ' AND p.price >= ?';
        params.push(minPrice);
    }

    if (maxPrice) {
        sql += ' AND p.price <= ?';
        params.push(maxPrice);
    }

    if (search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    // Add sorting (optional, but good for UX)
    sql += ' ORDER BY p.createdAt DESC';

    const [products] = await pool.query(sql, params);

    const formattedProducts = products.map(row => {
        const product = { ...row };
        if (row.creatorId) {
            product.creator = { id: row.creatorId, name: row.creatorName, email: row.creatorEmail };
        }
        delete product.creatorId;
        delete product.creatorName;
        delete product.creatorEmail;
        return product;
    });

    res.json(formattedProducts);
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query(`
        SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
        FROM Products p 
        LEFT JOIN Users u ON p.addedBy = u.id
        WHERE p.id = ? AND p.deletedAt IS NULL
    `, [req.params.id]);

    if (rows.length === 0) {
        return next(new AppError('Product not found', 404));
    }

    const row = rows[0];
    const product = { ...row };
    if (row.creatorId) {
        product.creator = { id: row.creatorId, name: row.creatorName, email: row.creatorEmail };
    }
    delete product.creatorId;
    delete product.creatorName;
    delete product.creatorEmail;

    res.json(product);
});

exports.getCategories = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query("SELECT DISTINCT category, subcategory FROM Products WHERE category IS NOT NULL AND category != '' AND deletedAt IS NULL");

    const categoryMap = {};

    rows.forEach(row => {
        if (!categoryMap[row.category]) {
            categoryMap[row.category] = new Set();
        }
        if (row.subcategory) {
            categoryMap[row.category].add(row.subcategory);
        }
    });

    const categories = Object.keys(categoryMap).map(cat => ({
        name: cat,
        subcategories: Array.from(categoryMap[cat])
    }));

    res.json(categories);
});

exports.createProduct = catchAsync(async (req, res, next) => {
    const {
        name, description, price, mrp, discount, category, subcategory, stock, isFeatured
    } = req.body;

    let imageUrl = null;
    if (req.file) {
        if (req.file.path.startsWith('http')) {
            imageUrl = req.file.path;
        } else {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
    }

    const addedBy = req.user ? req.user.id : null;

    const [result] = await pool.query(
        `INSERT INTO Products 
        (name, description, price, mrp, discount, imageUrl, category, subcategory, stock, isFeatured, addedBy, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, description, price, mrp, discount, imageUrl, category || null, subcategory || null, stock, isFeatured ? 1 : 0, addedBy]
    );

    const newProduct = {
        id: result.insertId,
        name, description, price, mrp, discount, imageUrl, category, stock, isFeatured, addedBy
    };

    res.status(201).json(newProduct);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
        return next(new AppError('Product not found', 404));
    }
    const product = rows[0];

    const {
        name, description, price, mrp, discount, category, subcategory, stock, isFeatured
    } = req.body;

    let imageUrl = product.imageUrl;
    if (req.file) {
        if (req.file.path.startsWith('http')) {
            imageUrl = req.file.path;
        } else {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
    }

    await pool.query(
        `UPDATE Products SET 
        name = ?, description = ?, price = ?, mrp = ?, discount = ?, 
        imageUrl = ?, category = ?, subcategory = ?, stock = ?, isFeatured = ?, updatedAt = NOW() 
        WHERE id = ?`,
        [name, description, price, mrp, discount, imageUrl, category || null, subcategory || null, stock, isFeatured ? 1 : 0, req.params.id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    // SOFT DELETE
    const [result] = await pool.query('UPDATE Products SET deletedAt = NOW() WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Product not found', 404));
    }

    res.json({ message: 'Product moved to trash successfully' });
});

exports.getTrashProducts = catchAsync(async (req, res, next) => {
    // Admin only - Get deleted products
    const [products] = await pool.query('SELECT * FROM Products WHERE deletedAt IS NOT NULL');
    res.json(products);
});

exports.restoreProduct = catchAsync(async (req, res, next) => {
    const [result] = await pool.query('UPDATE Products SET deletedAt = NULL WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Product not found in trash', 404));
    }

    res.json({ message: 'Product restored successfully' });
});

exports.getFamousProducts = catchAsync(async (req, res, next) => {
    const sql = `
        SELECT p.*, SUM(oi.quantity) as totalSold 
        FROM OrderItems oi 
        JOIN Products p ON oi.productId = p.id 
        WHERE p.deletedAt IS NULL
        GROUP BY oi.productId 
        ORDER BY totalSold DESC 
        LIMIT 8
    `;
    const [products] = await pool.query(sql);
    res.json(products);
});

exports.getDeals = catchAsync(async (req, res, next) => {
    const [products] = await pool.query('SELECT * FROM Products WHERE discount > 0 AND deletedAt IS NULL ORDER BY discount DESC');
    res.json(products);
});
