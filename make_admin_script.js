const pool = require('./config/database');

async function makeAdmin() {
    try {
        const email = 'admin@gmail.com';
        console.log(`Updating role for ${email}...`);

        const [result] = await pool.query("UPDATE Users SET role = 'admin', isActive = 1 WHERE email = ?", [email]);

        if (result.affectedRows > 0) {
            console.log('Success: User updated to admin.');
        } else {
            console.log('Error: User not found.');
        }
    } catch (error) {
        console.error('Database Error:', error);
    } process.exit();
}

makeAdmin();
