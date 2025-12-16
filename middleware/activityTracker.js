const { User } = require('../models');

const activityTracker = async (req, res, next) => {
    try {
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
