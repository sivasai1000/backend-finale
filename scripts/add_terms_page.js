const pool = require('../config/database');

async function addTermsPage() {
    try {
        console.log('Checking for Terms page...');
        const [rows] = await pool.query('SELECT * FROM Pages WHERE slug = ?', ['terms']);

        if (rows.length === 0) {
            console.log('Terms page not found. Inserting...');
            await pool.query(`
                INSERT INTO Pages (slug, title, content) VALUES 
                ('terms', 'Terms and Conditions', 'These are the terms and conditions. Please read them carefully.')
            `);
            console.log('Terms page added successfully.');
        } else {
            console.log('Terms page already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error adding Terms page:', error);
        process.exit(1);
    }
}

addTermsPage();
