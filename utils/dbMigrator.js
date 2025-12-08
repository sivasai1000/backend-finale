const pool = require('../config/database');

async function verifyTables() {
    console.log('Verifying database schema...');
    const connection = await pool.getConnection();
    try {
        // 1. Check Reviews Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                userId INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        // 2. Check Pages Table (for Terms, Privacy, etc.)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 3. Check Orders Table Columns (Migration for address/paymentId)
        const [orderColumns] = await connection.query("SHOW COLUMNS FROM Orders");
        const hasAddress = orderColumns.some(col => col.Field === 'address');
        const hasPaymentId = orderColumns.some(col => col.Field === 'paymentId');

        if (!hasAddress) {
            console.log("Migrating Orders: Adding 'address' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN address JSON");
        }

        if (!hasPaymentId) {
            console.log("Migrating Orders: Adding 'paymentId' column...");
            await connection.query("ALTER TABLE Orders ADD COLUMN paymentId VARCHAR(255)");
        }

        console.log('Database schema verification complete.');
    } catch (error) {
        console.error('Database migration error:', error);
        // Don't exit process, let server try to start, but log critical error
    } finally {
        connection.release();
    }
}

module.exports = verifyTables;
