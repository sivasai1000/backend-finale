const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    // Total Revenue
    const [revenueRows] = await pool.query('SELECT SUM(totalAmount) as total FROM Orders');
    const totalRevenue = revenueRows[0].total || 0;

    // Active Users (Total users for now)
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM Users');
    const activeUsers = userRows[0].count;

    // Total Products
    const [productRows] = await pool.query('SELECT COUNT(*) as count FROM Products');
    const totalProducts = productRows[0].count;

    // Recent Orders
    const [recentOrders] = await pool.query(`
        SELECT o.*, u.name as userName, u.email as userEmail
        FROM Orders o
        LEFT JOIN Users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
        LIMIT 5
    `);
    const formattedRecentOrders = recentOrders.map(r => ({
        ...r,
        User: { name: r.userName, email: r.userEmail }
    }));

    // Active Now (Users active in last 5 minutes)
    const [activeRows] = await pool.query('SELECT COUNT(*) as count FROM Users WHERE lastActiveAt >= NOW() - INTERVAL 5 MINUTE');
    const activeNow = activeRows[0].count;

    res.json({
        totalRevenue,
        activeUsers,
        totalProducts,
        activeNow,
        recentOrders: formattedRecentOrders
    });
});
