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

        res.status(201).json({
            status: 'success',
            data: {
                id: chatId,
                message,
                createdAt: new Date()
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
