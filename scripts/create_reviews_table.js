const pool = require('../config/database');

async function createReviewsTable() {
    try {
        await pool.query(`
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
        console.log('Reviews table created successfully');
    } catch (error) {
        console.error('Error creating Reviews table:', error);
    } finally {
        process.exit();
    }
}

createReviewsTable();
