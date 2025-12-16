const pool = require('../config/database');

async function verifyTables() {
    
    const connection = await pool.getConnection();
    try {
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                userId INT NOT NULL,
                orderId INT,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        
        const [reviewColumns] = await connection.query("SHOW COLUMNS FROM Reviews");
        const hasOrderId = reviewColumns.some(col => col.Field === 'orderId');
        if (!hasOrderId) {
            
            await connection.query("ALTER TABLE Reviews ADD COLUMN orderId INT NULL AFTER userId");
        }

        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                imageUrl TEXT NOT NULL,
                linkUrl VARCHAR(255),
                isActive BOOLEAN DEFAULT true,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        
        const [bannerColumns] = await connection.query("SHOW COLUMNS FROM Banners");
        const hasIsActive = bannerColumns.some(col => col.Field === 'isActive');
        if (!hasIsActive) {
            
            await connection.query("ALTER TABLE Banners ADD COLUMN isActive BOOLEAN DEFAULT true");
        }

        const hasBannerCreated = bannerColumns.some(col => col.Field === 'createdAt');
        if (!hasBannerCreated) {
            
            await connection.query("ALTER TABLE Banners ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        const hasBannerUpdated = bannerColumns.some(col => col.Field === 'updatedAt');
        if (!hasBannerUpdated) {
            
            await connection.query("ALTER TABLE Banners ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS FeaturedProducts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                featuredType ENUM('hero', 'deal', 'trending') NOT NULL,
                displayOrder INT DEFAULT 0,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        
        const [orderColumns] = await connection.query("SHOW COLUMNS FROM Orders");
        const hasAddress = orderColumns.some(col => col.Field === 'address');
        const hasPaymentId = orderColumns.some(col => col.Field === 'paymentId');

        if (!hasAddress) {
            
            await connection.query("ALTER TABLE Orders ADD COLUMN address JSON");
        }

        if (!hasPaymentId) {
            
            await connection.query("ALTER TABLE Orders ADD COLUMN paymentId VARCHAR(255)");
        }

        const hasUpdatedAt = orderColumns.some(col => col.Field === 'updatedAt');
        if (!hasUpdatedAt) {
            
            await connection.query("ALTER TABLE Orders ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        const hasCreatedAt = orderColumns.some(col => col.Field === 'createdAt');
        if (!hasCreatedAt) {
            
            await connection.query("ALTER TABLE Orders ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId INT NOT NULL,
                productId INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        
        const [itemColumns] = await connection.query("SHOW COLUMNS FROM OrderItems");
        const hasItemsUpdatedAt = itemColumns.some(col => col.Field === 'updatedAt');
        if (!hasItemsUpdatedAt) {
            
            await connection.query("ALTER TABLE OrderItems ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        const hasItemsCreatedAt = itemColumns.some(col => col.Field === 'createdAt');
        if (!hasItemsCreatedAt) {
            
            await connection.query("ALTER TABLE OrderItems ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        
        const [productColumns] = await connection.query("SHOW COLUMNS FROM Products");
        const hasIsFeatured = productColumns.some(col => col.Field === 'isFeatured');
        const hasAddedBy = productColumns.some(col => col.Field === 'addedBy');

        if (!hasIsFeatured) {
            
            await connection.query("ALTER TABLE Products ADD COLUMN isFeatured BOOLEAN DEFAULT false");
        }

        if (!hasAddedBy) {
            
            await connection.query("ALTER TABLE Products ADD COLUMN addedBy INT DEFAULT NULL, ADD FOREIGN KEY (addedBy) REFERENCES Users(id) ON DELETE SET NULL");
        }

        
        const tablesToCheck = ['Users', 'Products', 'Reviews', 'Banners', 'Coupons', 'Blogs'];

        for (const tableName of tablesToCheck) {
            try {
                
                const [tableExists] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
                    const hasDeletedAt = columns.some(col => col.Field === 'deletedAt');

                    if (!hasDeletedAt) {
                        
                        await connection.query(`ALTER TABLE ${tableName} ADD COLUMN deletedAt DATETIME DEFAULT NULL`);
                    }
                }
            } catch (err) {
                console.error(`Error checking/migrating ${tableName}:`, err.message);
            }
        }

        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT,
                receiver_id INT,
                message TEXT,
                is_admin_sender BOOLEAN DEFAULT false,
                is_read BOOLEAN DEFAULT false,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE SET NULL,
                FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE SET NULL
            )
        `);

        
    } catch (error) {
        console.error('Database migration error:', error);
        
    } finally {
        connection.release();
    }
}

module.exports = verifyTables;
