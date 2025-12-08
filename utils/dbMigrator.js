const pool = require('../config/database');

async function verifyTables() {
    console.log('Verifying database schema...');
    const connection = await pool.getConnection();
    try {
        // 1. Check Reviews Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                userId INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        // 2. Check Pages Table (for Terms, Privacy, etc.)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 3. Check Banners Table
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

        // Check Banners for extra columns
        const [bannerColumns] = await connection.query("SHOW COLUMNS FROM Banners");
        const hasIsActive = bannerColumns.some(col => col.Field === 'isActive');
        if (!hasIsActive) {
            console.log("Migrating Banners: Adding 'isActive' column...");
            await connection.query("ALTER TABLE Banners ADD COLUMN isActive BOOLEAN DEFAULT true");
        }

        const hasBannerCreated = bannerColumns.some(col => col.Field === 'createdAt');
        if (!hasBannerCreated) {
            console.log("Migrating Banners: Adding 'createdAt' column...");
            await connection.query("ALTER TABLE Banners ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        const hasBannerUpdated = bannerColumns.some(col => col.Field === 'updatedAt');
        if (!hasBannerUpdated) {
            console.log("Migrating Banners: Adding 'updatedAt' column...");
            await connection.query("ALTER TABLE Banners ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        // 4. Check FeaturedProducts Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS FeaturedProducts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                featuredType ENUM('hero', 'deal', 'trending') NOT NULL,
                displayOrder INT DEFAULT 0,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        // 3. Check Orders Table Columns (Migration for address/paymentId)
        const [orderColumns] = await connection.query("SHOW COLUMNS FROM Orders");
        const hasAddress = orderColumns.some(col => col.Field === 'address');
        const hasPaymentId = orderColumns.some(col => col.Field === 'paymentId');

        if (!hasAddress) {
            console.log("Migrating Orders: Adding 'address' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN address JSON");
        }

        if (!hasPaymentId) {
            console.log("Migrating Orders: Adding 'paymentId' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN paymentId VARCHAR(255)");
        }

        const hasUpdatedAt = orderColumns.some(col => col.Field === 'updatedAt');
        if (!hasUpdatedAt) {
            console.log("Migrating Orders: Adding 'updatedAt' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        const hasCreatedAt = orderColumns.some(col => col.Field === 'createdAt');
        if (!hasCreatedAt) {
            console.log("Migrating Orders: Adding 'createdAt' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        // 5. Check OrderItems Table
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

        // Check OrderItems for extra columns if table exists
        const [itemColumns] = await connection.query("SHOW COLUMNS FROM OrderItems");
        const hasItemsUpdatedAt = itemColumns.some(col => col.Field === 'updatedAt');
        if (!hasItemsUpdatedAt) {
            console.log("Migrating OrderItems: Adding 'updatedAt' column...");
            await connection.query("ALTER TABLE OrderItems ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        const hasItemsCreatedAt = itemColumns.some(col => col.Field === 'createdAt');
        if (!hasItemsCreatedAt) {
            console.log("Migrating OrderItems: Adding 'createdAt' column...");
            await connection.query("ALTER TABLE OrderItems ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        // 6. Check Products Table Columns (Migration for isFeatured, addedBy)
        const [productColumns] = await connection.query("SHOW COLUMNS FROM Products");
        const hasIsFeatured = productColumns.some(col => col.Field === 'isFeatured');
        const hasAddedBy = productColumns.some(col => col.Field === 'addedBy');

        if (!hasIsFeatured) {
            console.log("Migrating Products: Adding 'isFeatured' column...");
            await connection.query("ALTER TABLE Products ADD COLUMN isFeatured BOOLEAN DEFAULT false");
        }

        if (!hasAddedBy) {
            console.log("Migrating Products: Adding 'addedBy' column...");
            await connection.query("ALTER TABLE Products ADD COLUMN addedBy INT DEFAULT NULL, ADD FOREIGN KEY (addedBy) REFERENCES Users(id) ON DELETE SET NULL");
        }

        console.log('Database schema verification complete.');
    } catch (error) {
        console.error('Database migration error:', error);
        // Don't exit process, let server try to start, but log critical error
    } finally {
        connection.release();
    }
}

module.exports = verifyTables;
