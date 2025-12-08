const pool = require('../config/database');
require('dotenv').config();

async function addResetTokenColumns() {
    console.log('--- Adding Reset Token Columns to Users Table ---');
    try {
        // Check if columns exist first to avoid errors? Or just try ADD COLUMN
        // We'll use IF NOT EXISTS logic if possible, or just catch error.
        // MySQL specific: 

        await pool.query(`
            ALTER TABLE Users 
            ADD COLUMN resetPasswordToken VARCHAR(255) NULL,
            ADD COLUMN resetPasswordExpires BIGINT NULL;
        `);

        console.log('Successfully added resetPasswordToken and resetPasswordExpires columns.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping.');
        } else {
            console.error('Error adding columns:', error.message);
        }
    } finally {
        process.exit();
    }
}

addResetTokenColumns();
