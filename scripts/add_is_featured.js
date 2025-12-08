require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
};

async function addIsFeaturedColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Add isFeatured column
        // We use BOOLEAN (which is TINYINT(1) in MySQL) and default to FALSE (0)
        const addColumnQuery = `
            ALTER TABLE Products
            ADD COLUMN isFeatured BOOLEAN DEFAULT FALSE;
        `;

        await connection.execute(addColumnQuery);
        console.log('Successfully added isFeatured column to Products table.');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column isFeatured already exists. Skipping.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        if (connection) await connection.end();
    }
}

addIsFeaturedColumn();
