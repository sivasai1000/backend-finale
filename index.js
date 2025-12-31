const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user ? decoded.user.id : decoded.id;


            const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
            if (rows.length > 0) {
                req.user = rows[0];
            } else {
                req.user = decoded.user || decoded;
            }
        } catch (e) {

        }
    }
    next();
});


app.use(async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            await pool.query('UPDATE Users SET lastActiveAt = NOW() WHERE id = ?', [req.user.id]);
        }
    } catch (err) {

    }
    next();
});


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
app.use('/api/chat', chatRoutes);


const marketingController = require('./controllers/marketingController');
const { protect, admin } = require('./middleware/auth');
const upload = require('./middleware/upload');

app.get('/api/banners', marketingController.getBanners);


app.post('/api/admin/banners', protect, admin, upload.single('image'), marketingController.createBanner);
app.get('/api/admin/banners/trash', protect, admin, marketingController.getTrashBanners);
app.put('/api/admin/banners/restore/:id', protect, admin, marketingController.restoreBanner);
app.delete('/api/admin/banners/:id', protect, admin, marketingController.deleteBanner);
app.get('/api/admin/subscribers', protect, admin, marketingController.getAllSubscribers);


app.get('/api/about', marketingController.getAbout);
app.put('/api/admin/about', protect, admin, upload.single('image'), marketingController.updateAbout);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.send('API is running...');
});


app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

const verifyTables = require('./utils/dbMigrator');


const startCleanupJob = require('./utils/cleanupWorker');

async function startServer() {
    try {
        await pool.query('SELECT 1');
        await verifyTables();
        startCleanupJob();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

startServer();
