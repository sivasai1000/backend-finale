const pool = require('../config/database');

async function createPagesTable() {
    try {
        console.log('Creating Pages table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed initial data
        const [rows] = await pool.query('SELECT * FROM Pages LIMIT 1');
        if (rows.length === 0) {
            console.log('Seeding initial Pages...');
            await pool.query(`
                INSERT INTO Pages (slug, title, content) VALUES 
                ('privacy', 'Privacy Policy', 'Your privacy is important to us. We do not share your data with third parties without consent.'),
                ('shipping', 'Shipping & Returns', 'We ship worldwide. Returns are accepted within 30 days of purchase.'),
                ('contact', 'Contact Us', 'Reach us at support@sivasai.com or +1 (555) 123-4567.'),
('terms', 'Terms and Conditions', 'These are the terms and conditions. Please read them carefully.')
            `);
        }

        console.log('Pages table created and seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating Pages table:', error);
        process.exit(1);
    }
}

createPagesTable();
