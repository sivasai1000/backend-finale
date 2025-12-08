const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
};

async function fix() {
    console.log("Fixing columns...");
    const conn = await mysql.createConnection(dbConfig);

    try {
        console.log("Checking Orders...");
        const [ordersCols] = await conn.query("SHOW COLUMNS FROM Orders LIKE 'updatedAt'");
        if (ordersCols.length === 0) {
            console.log("Adding updatedAt to Orders");
            await conn.query("ALTER TABLE Orders ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        } else {
            console.log("Orders already has updatedAt");
        }

        console.log("Checking OrderItems...");
        const [itemsCols] = await conn.query("SHOW COLUMNS FROM OrderItems LIKE 'updatedAt'");
        if (itemsCols.length === 0) {
            console.log("Adding updatedAt to OrderItems");
            await conn.query("ALTER TABLE OrderItems ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        } else {
            console.log("OrderItems already has updatedAt");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await conn.end();
    }
}

fix();
