require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
};

async function createTables() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Create Banners Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                subtitle VARCHAR(255),
                imageUrl VARCHAR(500) NOT NULL,
                linkUrl VARCHAR(500),
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Banners table created or already exists.');

        // Create Subscribers Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Subscribers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                subscribedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Subscribers table created or already exists.');

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createTables();
