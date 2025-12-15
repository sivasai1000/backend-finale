const pool = require('../config/database');

class Chat {
    static async createMessage({ sender_id, receiver_id, message, is_admin_sender }) {
        const [result] = await pool.query(
            'INSERT INTO Chats (sender_id, receiver_id, message, is_admin_sender) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, message, is_admin_sender]
        );
        return result.insertId;
    }

    static async getMessagesForUser(userId) {
        // Fetch messages where the user is either sender or receiver
        // We join with Users to get basic info if needed, but for now raw messages are enough
        const [rows] = await pool.query(
            `SELECT * FROM Chats 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at ASC`,
            [userId, userId]
        );
        return rows;
    }

    static async getConversations() {
        // This is for Admin: Get list of users who have chatted
        // We group by the OTHER user (who is not admin/null, or if we assume admin is looking)
        // Actually, better to just get all unique users who have participated in a chat
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                u.id, u.name, u.email, u.avatar
             FROM Users u
             JOIN Chats c ON c.sender_id = u.id OR c.receiver_id = u.id
             WHERE c.is_admin_sender = false` // Only users who have initiated or received messages from support
        );
        return rows;
    }

    static async markAsRead(userId, isAdminReading) {
        let query = '';
        if (isAdminReading) {
            // Admin reads user's messages (where user is sender)
            query = 'UPDATE Chats SET is_read = true WHERE sender_id = ? AND is_admin_sender = false';
        } else {
            // User reads admin's messages (where user is receiver)
            query = 'UPDATE Chats SET is_read = true WHERE receiver_id = ? AND is_admin_sender = true';
        }
        await pool.query(query, [userId]);
    }
}

module.exports = Chat;
