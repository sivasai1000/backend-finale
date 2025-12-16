const Chat = require('../models/Chat');
const AppError = require('../utils/appError');

exports.sendMessage = async (req, res, next) => {
    try {
        const { message, receiverId } = req.body;
        const senderId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin; 

        let receiver_id = null;
        let is_admin_sender = false;

        if (isAdmin && receiverId) {
            
            receiver_id = receiverId;
            is_admin_sender = true;
        } else {
            
            receiver_id = null; 
            is_admin_sender = false;
        }

        const chatId = await Chat.createMessage({
            sender_id: senderId,
            receiver_id,
            message,
            is_admin_sender
        });

        
        
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
                    sender_id: senderId, 
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
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
        

        res.status(201).json({
            status: 'success',
            data: {
                id: chatId,
                message,
                createdAt: new Date(),
                botReply 
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
