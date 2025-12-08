const pool = require('../config/database');

async function createFaqsTable() {
    try {
        console.log('Creating FAQs table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS FAQs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed initial data
        const [rows] = await pool.query('SELECT * FROM FAQs LIMIT 1');
        if (rows.length === 0) {
            console.log('Seeding initial FAQs...');
            await pool.query(`
                INSERT INTO FAQs (question, answer) VALUES 
                ('What is your return policy?', 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.'),
                ('How long does shipping take?', 'Standard shipping takes 3-5 business days. Express options are available at checkout.')
            `);
        }

        console.log('FAQs table created and seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating FAQs table:', error);
        process.exit(1);
    }
}

createFaqsTable();
