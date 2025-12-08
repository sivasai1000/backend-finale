const pool = require('../config/database');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Ensure table exists (simple check for robustness)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Newsletters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if already subscribed
        const [existing] = await pool.query('SELECT * FROM Newsletters WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        await pool.query('INSERT INTO Newsletters (email) VALUES (?)', [email]);
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ message: 'Server error subscribing to newsletter' });
    }
};
