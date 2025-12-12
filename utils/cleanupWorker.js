const cron = require('node-cron');
const pool = require('../config/database');

const startCleanupJob = () => {
    // Schedule task to run EVERY MINUTE (For testing)
    cron.schedule('* * * * *', async () => {
        console.log('🧹 Running Cleanup Worker (Every Minute Check)...');

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

    console.log('✅ Cleanup Worker Scheduled (Running every minute for validation)');
};

module.exports = startCleanupJob;
