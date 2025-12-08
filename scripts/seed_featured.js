require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
};

async function seedFeaturedProducts() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Mark 4 random products as featurd
        const updateQuery = `
            UPDATE Products 
            SET isFeatured = 1 
            ORDER BY RAND() 
            LIMIT 4;
        `;

        await connection.execute(updateQuery);
        console.log('Successfully marked 4 random products as featured.');

    } catch (error) {
        console.error('Error seeding featured products:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedFeaturedProducts();
