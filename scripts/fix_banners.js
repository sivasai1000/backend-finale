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
    console.log("Fixing Banners schema...");
    const conn = await mysql.createConnection(dbConfig);

    try {
        console.log("Checking isActive...");
        const [activeCols] = await conn.query("SHOW COLUMNS FROM Banners LIKE 'isActive'");
        if (activeCols.length === 0) {
            console.log("Adding isActive to Banners");
            await conn.query("ALTER TABLE Banners ADD COLUMN isActive BOOLEAN DEFAULT TRUE");
        }

        console.log("Checking createdAt...");
        const [createdCols] = await conn.query("SHOW COLUMNS FROM Banners LIKE 'createdAt'");
        if (createdCols.length === 0) {
            console.log("Adding createdAt to Banners");
            await conn.query("ALTER TABLE Banners ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        console.log("Checking updatedAt...");
        const [updatedCols] = await conn.query("SHOW COLUMNS FROM Banners LIKE 'updatedAt'");
        if (updatedCols.length === 0) {
            console.log("Adding updatedAt to Banners");
            await conn.query("ALTER TABLE Banners ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await conn.end();
    }
}

fix();
