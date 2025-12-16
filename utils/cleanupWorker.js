const cron = require('node-cron');
const pool = require('../config/database');

const startCleanupJob = () => {
    
    cron.schedule('* * * * *', async () => {
        

        const tablesToClean = ['Users', 'Products', 'Reviews', 'Banners', 'Coupons', 'Blogs'];

        for (const tableName of tablesToClean) {
            try {
                
                const [tableExists] = await pool.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    
                    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
                    const hasDeletedAt = columns.some(col => col.Field === 'deletedAt');

                    if (hasDeletedAt) {

                        const [result] = await pool.query(`
                            DELETE FROM ${tableName} 
                            WHERE deletedAt IS NOT NULL 
                            AND deletedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
                        `);

                        if (result.affectedRows > 0) {
                            
                        }
                    }
                }
            } catch (error) {
                console.error(`Error cleaning up ${tableName}:`, error.message);
            }
        }
    });

    
};

module.exports = startCleanupJob;
