const pool = require('../config/database');

exports.getAllProducts = async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, search, isFeatured } = req.query;

        let sql = `
            SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
            FROM Products p 
            LEFT JOIN Users u ON p.addedBy = u.id
            WHERE 1=1
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
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.id as creatorId, u.name as creatorName, u.email as creatorEmail 
            FROM Products p 
            LEFT JOIN Users u ON p.addedBy = u.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
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
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT DISTINCT category, subcategory FROM Products WHERE category IS NOT NULL AND category != ''");

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
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
};

exports.createProduct = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
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
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

exports.getFamousProducts = async (req, res) => {
    try {
        const sql = `
            SELECT p.*, SUM(oi.quantity) as totalSold 
            FROM OrderItems oi 
            JOIN Products p ON oi.productId = p.id 
            GROUP BY oi.productId 
            ORDER BY totalSold DESC 
            LIMIT 8
        `;
        const [products] = await pool.query(sql);
        res.json(products);
    } catch (error) {
        console.error('Error fetching famous products:', error);
        res.status(500).json({ message: 'Server error fetching famous products' });
    }
};

exports.getDeals = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM Products WHERE discount > 0 ORDER BY discount DESC');
        res.json(products);
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Server error fetching deals' });
    }
};
