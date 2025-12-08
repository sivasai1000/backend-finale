require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

const createAdminUser = async () => {
    const name = 'Admin User';
    const email = 'admin@gmail.com';
    const password = 'admin@123';

    try {
        console.log(`Checking for user with email: ${email}`);

        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        const existingUser = rows[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (existingUser) {
            console.log('User found. Updating to admin role and resetting password...');
            await pool.query(
                'UPDATE Users SET name = ?, password = ?, role = ?, isActive = ? WHERE email = ?',
                [name, hashedPassword, 'admin', true, email]
            );
            console.log(`User ${email} updated successfully.`);
        } else {
            console.log('User not found. Creating new admin user...');
            await pool.query(
                `INSERT INTO Users (name, email, password, role, isActive, createdAt, updatedAt) 
                 VALUES (?, ?, ?, 'admin', true, NOW(), NOW())`,
                [name, email, hashedPassword]
            );
            console.log(`Admin user ${email} created successfully.`);
        }

        console.log('Login credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating/updating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
