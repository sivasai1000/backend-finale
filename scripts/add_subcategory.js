const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'tramway.proxy.rlwy.net',
    port: 54139,
    user: 'root',
    password: 'yyhaCcSMQTxUhHzNaypCbMejwSRRySFC',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function addSubcategoryColumn() {
    try {
        const connection = await pool.getConnection();
        await connection.query('ALTER TABLE Products ADD COLUMN subcategory VARCHAR(255) NULL AFTER category');
        console.log('Subcategory column added successfully');
        connection.release();
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error('Error adding column:', error);
        }
        process.exit(1);
    }
}

addSubcategoryColumn();
