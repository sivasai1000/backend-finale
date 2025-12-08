const { User } = require('../models');

const activityTracker = async (req, res, next) => {
    try {
        // Check if user is authenticated (assuming req.user is set by auth middleware)
        // If your auth middleware sets req.user.id, use that.
        // If this runs BEFORE auth middleware, we might need to verify token here or run it AFTER auth.
        // For now, let's assume it runs after auth or we check for a header if we want to track unauth users (harder).
        // Let's assume we only track logged-in users for "Active Users".

        if (req.user && req.user.id) {
            await User.update({ lastActiveAt: new Date() }, {
                where: { id: req.user.id }
            });
        }
        next();
    } catch (error) {
        console.error('Error in activity tracker:', error);
        next();
    }
};

module.exports = activityTracker;
