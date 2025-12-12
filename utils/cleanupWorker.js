const cron = require('node-cron');
const pool = require('../config/database');

const startCleanupJob = () => {
    // Schedule task to run at midnight every day
    cron.schedule('0 0 * * *', async () => {
        console.log('🧹 Running Daily Soft Delete Cleanup...');

        const tablesToClean = ['Users', 'Products', 'Reviews', 'Banners', 'Coupons', 'Blogs'];

        for (const tableName of tablesToClean) {
            try {
                // Check if table exists
                const [tableExists] = await pool.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    // Check if deletedAt column exists
                    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
                    const hasDeletedAt = columns.some(col => col.Field === 'deletedAt');

                    if (hasDeletedAt) {
                        // Delete records where deletedAt is older than 30 days
                        const [result] = await pool.query(`
                            DELETE FROM ${tableName} 
                            WHERE deletedAt IS NOT NULL 
                            AND deletedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
                        `);

                        if (result.affectedRows > 0) {
                            console.log(`🗑️ Permanently deleted ${result.affectedRows} old records from ${tableName}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error cleaning up ${tableName}:`, error.message);
            }
        }
    });

    console.log('✅ Daily Cleanup Worker Scheduled (00:00)');
};

module.exports = startCleanupJob;
