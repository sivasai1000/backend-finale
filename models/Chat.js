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
        
        
        const [rows] = await pool.query(
            `SELECT * FROM Chats 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at ASC`,
            [userId, userId]
        );
        return rows;
    }

    static async getConversations() {
        
        
        
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                u.id, u.name, u.email
             FROM Users u
             JOIN Chats c ON c.sender_id = u.id OR c.receiver_id = u.id
             WHERE c.is_admin_sender = false` 
        );
        return rows;
    }

    static async markAsRead(userId, isAdminReading) {
        let query = '';
        if (isAdminReading) {
            
            query = 'UPDATE Chats SET is_read = true WHERE sender_id = ? AND is_admin_sender = false';
        } else {
            
            query = 'UPDATE Chats SET is_read = true WHERE receiver_id = ? AND is_admin_sender = true';
        }
        await pool.query(query, [userId]);
    }
}

module.exports = Chat;
