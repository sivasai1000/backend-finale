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

async function check() {
    console.log("Checking Schema...");
    const conn = await mysql.createConnection(dbConfig);

    try {
        const [ordersCols] = await conn.query("SHOW COLUMNS FROM Orders");
        console.log("--- Orders Columns ---");
        ordersCols.forEach(c => console.log(c.Field, c.Type));

        const [itemsCols] = await conn.query("SHOW COLUMNS FROM OrderItems");
        console.log("--- OrderItems Columns ---");
        itemsCols.forEach(c => console.log(c.Field, c.Type));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await conn.end();
    }
}

check();
