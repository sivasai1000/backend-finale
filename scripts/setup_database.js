require('dotenv').config();
const pool = require('../config/database');

async function createTables() {
    try {
        console.log('Starting database setup...');

        // 1. Users Table
        console.log('Creating Users table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                mobile VARCHAR(255) UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                isActive BOOLEAN DEFAULT TRUE,
                lastActiveAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Products Table
        console.log('Creating Products table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                mrp DECIMAL(10, 2),
                discount INT DEFAULT 0,
                imageUrl VARCHAR(255),
                category VARCHAR(255),
                stock INT DEFAULT 0,
                addedBy INT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (addedBy) REFERENCES Users(id) ON DELETE SET NULL
            )
        `);

        // 3. Orders Table
        console.log('Creating Orders table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                totalAmount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                paymentId VARCHAR(255),
                address TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
            )
        `);

        // 4. OrderItems Table
        console.log('Creating OrderItems table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId INT,
                productId INT,
                quantity INT DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE SET NULL
            )
        `);

        // 5. Blogs Table
        console.log('Creating Blogs table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                author VARCHAR(255) DEFAULT 'Admin',
                category VARCHAR(255),
                imageUrl VARCHAR(255),
                tags VARCHAR(255),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 6. Wishlists Table
        console.log('Creating Wishlists table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                productId INT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        // 7. Coupons Table
        console.log('Creating Coupons table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discountType ENUM('percentage', 'flat') DEFAULT 'flat',
                value DECIMAL(10, 2) NOT NULL,
                expiryDate DATETIME,
                minOrderValue DECIMAL(10, 2) DEFAULT 0,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

createTables();
