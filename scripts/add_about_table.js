const pool = require('../config/database');

async function createAboutTable() {
    try {
        console.log('Creating About table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS About (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                imageUrl VARCHAR(255),
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if data exists, if not seed initial data
        const [rows] = await pool.query('SELECT * FROM About LIMIT 1');
        if (rows.length === 0) {
            console.log('Seeding initial About data...');
            await pool.query(`
                INSERT INTO About (title, description, imageUrl) 
                VALUES ('About Us', 'Welcome to our store. We provide quality products.', NULL)
            `);
        }

        console.log('About table created and seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating About table:', error);
        process.exit(1);
    }
}

createAboutTable();
