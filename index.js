const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const blogRoutes = require('./routes/blog');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const faqRoutes = require('./routes/faqs');
const pageRoutes = require('./routes/pages');
const contactRoutes = require('./routes/contact');
const privacyRoutes = require('./routes/privacy');
const shippingRoutes = require('./routes/shipping');
const termsRoutes = require('./routes/terms');
const reviewRoutes = require('./routes/reviews');
const newsletterRoutes = require('./routes/newsletter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Global User Identification Middleware (Direct SQL)
app.use(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user ? decoded.user.id : decoded.id;

            // Fetch fresh user to ensure role/status validity
            const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
            if (rows.length > 0) {
                req.user = rows[0];
            } else {
                req.user = decoded.user || decoded;
            }
        } catch (e) {
            // console.error("Token verification failed:", e.message);
        }
    }
    next();
});

// Simple Activity Tracker (Direct SQL)
app.use(async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            await pool.query('UPDATE Users SET lastActiveAt = NOW() WHERE id = ?', [req.user.id]);
        }
    } catch (err) {
        // console.error('Error tracking activity:', err);
    }
    next();
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Marketing Routes
const marketingController = require('./controllers/marketingController');
const { protect, admin } = require('./middleware/auth');
const upload = require('./middleware/upload'); // Import upload middleware

app.get('/api/banners', marketingController.getBanners);

// Admin Marketing Routes
app.post('/api/admin/banners', protect, admin, upload.single('image'), marketingController.createBanner);
app.delete('/api/admin/banners/:id', protect, admin, marketingController.deleteBanner);
app.get('/api/admin/subscribers', protect, admin, marketingController.getAllSubscribers);

// About Us Routes
app.get('/api/about', marketingController.getAbout);
app.put('/api/admin/about', protect, admin, upload.single('image'), marketingController.updateAbout);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/', (req, res) => {
    res.send('API is running...');
});

const verifyTables = require('./utils/dbMigrator');

// Start Server with DB Check
async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected (mysql2 pool)');

        // Run Auto-Migrations
        await verifyTables();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("--- Config Check ---");
            console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "Loaded (" + process.env.RAZORPAY_KEY_ID.substring(0, 5) + "...)" : "MISSING");
            console.log("Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "MISSING");
            console.log("--------------------");
        });
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

startServer();
