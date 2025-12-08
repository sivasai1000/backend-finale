const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, mobile, role, lastActiveAt, isActive, createdAt, updatedAt FROM Users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        await pool.query('UPDATE Users SET isActive = ? WHERE id = ?', [isActive, id]);

        res.json({ message: 'User status updated', user: { id, isActive } });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
