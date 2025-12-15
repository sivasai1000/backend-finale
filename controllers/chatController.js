const Chat = require('../models/Chat');
const AppError = require('../utils/appError');

exports.sendMessage = async (req, res, next) => {
    try {
        const { message, receiverId } = req.body;
        const senderId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin; // Handle different role flags if any

        let receiver_id = null;
        let is_admin_sender = false;

        if (isAdmin && receiverId) {
            // Admin replying to a user
            receiver_id = receiverId;
            is_admin_sender = true;
        } else {
            // User sending to support (receiver is null)
            receiver_id = null; // Represents 'Support'
            is_admin_sender = false;
        }

        const chatId = await Chat.createMessage({
            sender_id: senderId,
            receiver_id,
            message,
            is_admin_sender
        });

        // --- BOT AUTO REPLIES ---
        // Only if user is sender (not admin)
        let botReply = null;
        if (!isAdmin && receiverId === null) {
            let replyText = "";
            const lowerMsg = message.toLowerCase();

            if (lowerMsg === "track order") {
                replyText = "To track your order, please go to the 'Orders' page in your profile. You will see the status there!";
            } else if (lowerMsg === "shipping info") {
                replyText = "We ship worldwide! Standard shipping takes 5-7 days. Express shipping takes 2-3 days.";
            } else if (lowerMsg === "returns") {
                replyText = "You can return items within 30 days of receipt. Please contact us for a return label.";
            }

            if (replyText) {
                await Chat.createMessage({
                    sender_id: senderId, // Admin is replying TO this user, but in our DB model:
                    // sender_id is the "Actor". If admin sends, sender_id is usually admin ID.
                    // But here the SYSTEM is sending. We can use NULL or a special ID.
                    // However, our Schema requires sender_id to be a User ID.
                    // Let's assume ID 1 is the main admin, OR we just set is_admin_sender=true 
                    // and use the User's ID as receiver.
                    // WAIT: My Chat Model: sender_id, receiver_id.
                    // If Admin sends: sender_id = AdminID, receiver_id = UserID.
                    // If I don't have an AdminID handy (req.user is user), I might need to query one or use a dummy.
                    // BETTER: Let's use the first Admin found, or just NULL if schema allows (Schema says sender_id INT).
                    // Schema: FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE SET NULL.
                    // So I can use NULL for sender_id if it represents "System".
                    sender_id: null,
                    receiver_id: senderId,
                    message: replyText,
                    is_admin_sender: true
                });
                botReply = {
                    message: replyText,
                    is_admin_sender: 1,
                    created_at: new Date()
                };
            }
        }
        // ------------------------

        res.status(201).json({
            status: 'success',
            data: {
                id: chatId,
                message,
                createdAt: new Date(),
                botReply // Return this so FE can show it immediately
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin;
        let targetUserId = req.user.id;

        // If admin and requesting specific user history
        if (isAdmin && req.params.userId) {
            targetUserId = req.params.userId;
        }

        const messages = await Chat.getMessagesForUser(targetUserId);

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: messages
        });
    } catch (err) {
        next(err);
    }
};

exports.getConversations = async (req, res, next) => {
    try {
        const conversations = await Chat.getConversations();
        res.status(200).json({
            status: 'success',
            results: conversations.length,
            data: conversations
        });
    } catch (err) {
        next(err);
    }
};

exports.markRead = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin;

        // If user is calling, they are reading messages FROM admin
        // If admin is calling, they are reading messages FROM user

        // If admin is reading, expected 'userId' in body or param to know WHICH user's chat they read
        if (isAdmin) {
            if (!req.body.userId) {
                return next(new AppError('User ID required to mark conversation as read', 400));
            }
            await Chat.markAsRead(req.body.userId, true);
        } else {
            await Chat.markAsRead(req.user.id, false);
        }

        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};
