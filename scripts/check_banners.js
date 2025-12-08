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

async function check() {
    const conn = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await conn.query("SELECT id, title, isActive, createdAt FROM Banners");
        console.log("--- Banners Data ---");
        rows.forEach(r => console.log(`${r.id}: ${r.title.substring(0, 20)}... | Active: ${r.isActive} | Created: ${r.createdAt}`));
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await conn.end();
    }
}
check();
