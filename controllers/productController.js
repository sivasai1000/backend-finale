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

        // Handle multiple images
        try {
            if (product.imageUrl && (product.imageUrl.startsWith('[') || product.imageUrl.startsWith('{'))) {
                const parsed = JSON.parse(product.imageUrl);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    product.images = parsed;
                    product.imageUrl = parsed[0];
                } else {
                    product.images = [product.imageUrl];
                }
            } else {
                product.images = product.imageUrl ? [product.imageUrl] : [];
            }
        } catch (e) {
            product.images = product.imageUrl ? [product.imageUrl] : [];
        }

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

    // Handle multiple images
    try {
        if (product.imageUrl && (product.imageUrl.startsWith('[') || product.imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(product.imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                product.images = parsed;
                product.imageUrl = parsed[0];
            } else {
                product.images = [product.imageUrl];
            }
        } else {
            product.images = product.imageUrl ? [product.imageUrl] : [];
        }
    } catch (e) {
        product.images = product.imageUrl ? [product.imageUrl] : [];
    }

    res.json(product);
});

exports.getProductByName = catchAsync(async (req, res, next) => {
    // Decode the URL encoded name (e.g., "My%20Product" -> "My Product")
    const name = decodeURIComponent(req.params.name);

    // Find product by exact name
    let [rows] = await pool.query(`
        SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
        FROM Products p 
        LEFT JOIN Users u ON p.addedBy = u.id
        WHERE p.name = ? AND p.deletedAt IS NULL
    `, [name]);

    // If not found, try replacing spaces with hyphens (e.g., "T Shirt" -> "T-Shirt")
    if (rows.length === 0) {
        const hyphenatedName = name.replace(/\s+/g, '-');
        [rows] = await pool.query(`
            SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
            FROM Products p 
            LEFT JOIN Users u ON p.addedBy = u.id
            WHERE p.name = ? AND p.deletedAt IS NULL
        `, [hyphenatedName]);
    }

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

    // Handle multiple images
    try {
        if (product.imageUrl && (product.imageUrl.startsWith('[') || product.imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(product.imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                product.images = parsed;
                product.imageUrl = parsed[0];
            } else {
                product.images = [product.imageUrl];
            }
        } else {
            product.images = product.imageUrl ? [product.imageUrl] : [];
        }
    } catch (e) {
        product.images = product.imageUrl ? [product.imageUrl] : [];
    }

    res.json(product);
});

exports.getCategories = catchAsync(async (req, res, next) => {
    // Aggregation query to get categories with product count and a sample image
    const [rows] = await pool.query(`
        SELECT 
            category, 
            subcategory, 
            COUNT(*) as productCount,
            MAX(imageUrl) as sampleImage
        FROM Products 
        WHERE category IS NOT NULL AND category != '' AND deletedAt IS NULL 
        GROUP BY category, subcategory 
        ORDER BY productCount DESC
    `);

    const categoryMap = {};

    rows.forEach(row => {
        if (!categoryMap[row.category]) {
            categoryMap[row.category] = {
                name: row.category,
                subcategories: [],
                totalCount: 0,
                // Clean up the image URL (remove JSON array brackets/quotes if present)
                image: null
            };
        }
        categoryMap[row.category].totalCount += row.productCount;

        // Assign image if not already assigned (prioritizing the first non-null we encounter)
        if (!categoryMap[row.category].image && row.sampleImage) {
            let img = row.sampleImage;
            try {
                if (img.startsWith('[') || img.startsWith('{')) {
                    const parsed = JSON.parse(img);
                    img = Array.isArray(parsed) ? parsed[0] : img;
                }
            } catch (e) { }
            categoryMap[row.category].image = img;
        }

        if (row.subcategory) {
            categoryMap[row.category].subcategories.push(row.subcategory);
        }
    });

    // Convert map to array and sort by totalCount descending
    const categories = Object.values(categoryMap).sort((a, b) => b.totalCount - a.totalCount);

    categories.forEach(cat => {
        cat.subcategories = [...new Set(cat.subcategories)];
    });

    res.json(categories);
});

exports.createProduct = catchAsync(async (req, res, next) => {
    const {
        name, description, price, mrp, discount, category, subcategory, stock, isFeatured
    } = req.body;

    // Handle image slots logic
    // Handle image slots logic
    let finalImages = [];
    // Helper to get path from named file field
    const getFilePath = (field) => {
        if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            return file.path.startsWith('http') ? file.path : `http://localhost:5000/uploads/${file.filename}`;
        }
        return null;
    };

    if (req.body.imageOrder) {
        try {
            const order = JSON.parse(req.body.imageOrder);

            finalImages = order.map((item, index) => {
                if (item === 'new') {
                    // Check specifically for image1, image2, etc. corresponding to this slot
                    // actually user might send image1 for slot 0, image2 for slot 1. 
                    // But if they just send 'new' in order, we need to know which field name to look for.
                    // The frontend MUST send image{index+1} for the slot at index.
                    return getFilePath(`image${index + 1}`);
                }
                return item; // Keep existing URL or null
            }).filter(url => url !== null && url !== "");

        } catch (e) {
            console.error("Error parsing imageOrder", e);
            // Fallback: check all 4 slots
            for (let i = 1; i <= 4; i++) {
                const path = getFilePath(`image${i}`);
                if (path) finalImages.push(path);
            }
        }
    } else {
        // Fallback: just check all 4 slots
        for (let i = 1; i <= 4; i++) {
            const path = getFilePath(`image${i}`);
            if (path) finalImages.push(path);
        }
    }

    const imageUrl = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

    const addedBy = req.user ? req.user.id : null;

    const [result] = await pool.query(
        `INSERT INTO Products 
        (name, description, price, mrp, discount, imageUrl, category, subcategory, stock, isFeatured, addedBy, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, description, price, mrp, discount, imageUrl, category || null, subcategory || null, stock, isFeatured ? 1 : 0, addedBy]
    );

    const newProduct = {
        id: result.insertId,
        name, description, price, mrp, discount,
        imageUrl: finalImages.length > 0 ? finalImages[0] : null,
        images: finalImages,
        category, stock, isFeatured, addedBy
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

    // Existing images (from DB)
    let imageUrls = [];
    try {
        if (product.imageUrl && (product.imageUrl.startsWith('[') || product.imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(product.imageUrl);
            if (Array.isArray(parsed)) imageUrls = parsed;
            else imageUrls = [product.imageUrl];
        } else if (product.imageUrl) {
            imageUrls = [product.imageUrl];
        }
    } catch (e) {
        imageUrls = product.imageUrl ? [product.imageUrl] : [];
    }

    // New uploaded images: Logic - if new files are provided, REPLACE existing? Or APPEND?
    // User asked "can i add 4 images". Usually logic is: if user uploads new images, replace old ones or append.
    // Simplifying: If new images uploaded, REPLACE ALL. Or simpler: Create form sends all images? 
    // Backend logic: If req.files provided, use them. If not, keep old.
    // Wait, with 4 images, user might want to replace just one. But handling that complexity without a complex form is hard.
    // Standard simple logic: If you upload files, they replace the existing set.

    // Handle image slots logic
    // Handle image slots logic
    let finalImages = [];

    // Helper to get path from named file field
    const getFilePath = (field) => {
        if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            return file.path.startsWith('http') ? file.path : `http://localhost:5000/uploads/${file.filename}`;
        }
        return null;
    };

    // Use imageOrder if present to merge existing and new images
    if (req.body.imageOrder) {
        try {
            const order = JSON.parse(req.body.imageOrder);

            finalImages = order.map((item, index) => {
                if (item === 'new') {
                    return getFilePath(`image${index + 1}`);
                }
                return item;
            }).filter(url => url !== null && url !== "");
        } catch (e) {
            console.error("Error parsing imageOrder", e);
            // If error, just take whatever new images we have + existing?
            // Safer to just try to grab new images 1-4
            finalImages = [...imageUrls]; // Start with existing
            for (let i = 1; i <= 4; i++) {
                const path = getFilePath(`image${i}`);
                if (path) finalImages.push(path);
            }
        }
    } else {
        // No order provided, try to replace based on what's sent? 
        // Or just append? Current logic was replace all or append. 
        // With named fields, we can try to just grab them.
        let hasNew = false;
        const newImgs = [];
        for (let i = 1; i <= 4; i++) {
            const path = getFilePath(`image${i}`);
            if (path) {
                newImgs.push(path);
                hasNew = true;
            }
        }

        if (hasNew) {
            finalImages = newImgs;
        } else {
            finalImages = imageUrls;
        }
    }

    const imageUrl = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

    await pool.query(
        `UPDATE Products SET 
        name = ?, description = ?, price = ?, mrp = ?, discount = ?, 
        imageUrl = ?, category = ?, subcategory = ?, stock = ?, isFeatured = ?, updatedAt = NOW() 
        WHERE id = ?`,
        [name, description, price, mrp, discount, imageUrl, category || null, subcategory || null, stock, isFeatured ? 1 : 0, req.params.id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    const updatedProduct = { ...updatedRows[0] };

    // Formatting response
    try {
        if (updatedProduct.imageUrl && (updatedProduct.imageUrl.startsWith('[') || updatedProduct.imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(updatedProduct.imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                updatedProduct.images = parsed;
                updatedProduct.imageUrl = parsed[0];
            } else {
                updatedProduct.images = [updatedProduct.imageUrl];
            }
        } else {
            updatedProduct.images = updatedProduct.imageUrl ? [updatedProduct.imageUrl] : [];
        }
    } catch {
        updatedProduct.images = updatedProduct.imageUrl ? [updatedProduct.imageUrl] : [];
    }

    res.json(updatedProduct);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {

    const [result] = await pool.query('UPDATE Products SET deletedAt = NOW() WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
        return next(new AppError('Product not found', 404));
    }

    res.json({ message: 'Product moved to trash successfully' });
});

exports.getTrashProducts = catchAsync(async (req, res, next) => {

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
