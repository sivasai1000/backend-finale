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
    const conn = await mysql.createConnection(dbConfig);
    const tables = ['Banners', 'Pages', 'Blogs', 'Products', 'FeaturedProducts', 'Reviews', 'Users', 'Orders', 'OrderItems'];

    console.log('--- Table Counts ---');
    for (const t of tables) {
        try {
            const [rows] = await conn.query(`SELECT COUNT(*) as count FROM ${t}`);
            console.log(`${t}: ${rows[0].count}`);
        } catch (e) {
            console.log(`${t}: ERROR - ${e.message}`);
        }
    }
    await conn.end();
}

check().catch(console.error);
