require('dotenv').config();
const pool = require('../config/database');

async function addMobileColumn() {
    try {
        console.log('Adding mobile column to Users table...');
        await pool.query("ALTER TABLE Users ADD COLUMN mobile VARCHAR(255) UNIQUE AFTER email;");
        console.log('Column added successfully.');
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Error adding column:', e.message);
        process.exit(1);
    }
}

addMobileColumn();
