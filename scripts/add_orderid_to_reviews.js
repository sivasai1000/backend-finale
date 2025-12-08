const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306
};

async function addOrderIdColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        const [columns] = await connection.query("SHOW COLUMNS FROM Reviews LIKE 'orderId'");
        if (columns.length === 0) {
            console.log("Adding orderId column to Reviews table...");
            await connection.query("ALTER TABLE Reviews ADD COLUMN orderId INT NULL AFTER userId");
            console.log("orderId column added successfully.");
        } else {
            console.log("orderId column already exists.");
        }

    } catch (error) {
        console.error("Error adding orderId column:", error);
    } finally {
        if (connection) await connection.end();
    }
}

addOrderIdColumn();
