const pool = require('../config/database');

async function verifyTables() {

    const connection = await pool.getConnection();
    try {


        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                mobile VARCHAR(20) UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                isActive BOOLEAN DEFAULT true,
                profilePicture TEXT,
                address JSON,
                bio TEXT,
                gender VARCHAR(20),
                dateOfBirth VARCHAR(20),
                resetPasswordToken VARCHAR(255),
                resetPasswordExpires BIGINT,
                lastActiveAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check for new columns in existing Users users table
        const [userColumns] = await connection.query("SHOW COLUMNS FROM Users");
        const hasProfilePicture = userColumns.some(col => col.Field === 'profilePicture');
        const hasUserAddress = userColumns.some(col => col.Field === 'address');
        const hasBio = userColumns.some(col => col.Field === 'bio');
        const hasGender = userColumns.some(col => col.Field === 'gender');
        const hasDob = userColumns.some(col => col.Field === 'dateOfBirth');

        if (!hasProfilePicture) await connection.query("ALTER TABLE Users ADD COLUMN profilePicture TEXT");
        if (!hasUserAddress) await connection.query("ALTER TABLE Users ADD COLUMN address JSON");
        if (!hasBio) await connection.query("ALTER TABLE Users ADD COLUMN bio TEXT");
        if (!hasGender) await connection.query("ALTER TABLE Users ADD COLUMN gender VARCHAR(20)");
        if (!hasDob) await connection.query("ALTER TABLE Users ADD COLUMN dateOfBirth VARCHAR(20)");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                mrp DECIMAL(10, 2),
                discount INT DEFAULT 0,
                imageUrl TEXT,
                category VARCHAR(100),
                subcategory VARCHAR(100),
                stock INT DEFAULT 0,
                isFeatured BOOLEAN DEFAULT false,
                addedBy INT,
                deletedAt DATETIME DEFAULT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (addedBy) REFERENCES Users(id) ON DELETE SET NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                totalAmount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                paymentId VARCHAR(255),
                address JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

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
        const hasTrackingId = orderColumns.some(col => col.Field === 'trackingId');
        const hasCourierName = orderColumns.some(col => col.Field === 'courierName');

        if (!hasAddress) {
            await connection.query("ALTER TABLE Orders ADD COLUMN address JSON");
        }

        if (!hasPaymentId) {
            await connection.query("ALTER TABLE Orders ADD COLUMN paymentId VARCHAR(255)");
        }

        if (!hasTrackingId) {
            await connection.query("ALTER TABLE Orders ADD COLUMN trackingId VARCHAR(100)");
        }

        if (!hasCourierName) {
            await connection.query("ALTER TABLE Orders ADD COLUMN courierName VARCHAR(100)");
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

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                productId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        // Seed Pages if not exist
        const defaultPages = [
            { slug: 'contact', title: 'Contact Us', content: 'Contact us content here...' },
            { slug: 'about', title: 'About Us', content: 'About us content here...' },
            { slug: 'privacy', title: 'Privacy Policy', content: 'Privacy policy content here...' },
            { slug: 'terms', title: 'Terms & Conditions', content: 'Terms content here...' }
        ];

        for (const page of defaultPages) {
            const [rows] = await connection.query('SELECT id FROM Pages WHERE slug = ?', [page.slug]);
            if (rows.length === 0) {
                await connection.query('INSERT INTO Pages (slug, title, content) VALUES (?, ?, ?)',
                    [page.slug, page.title, page.content]);
                console.log(`Seeded page: ${page.slug}`);
            }
        }


    } catch (error) {
        console.error('Database migration error:', error);

    } finally {
        connection.release();
    }
}

module.exports = verifyTables;
