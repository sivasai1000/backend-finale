require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
};

const banners = [
    {
        title: "Curated for Elegance.",
        subtitle: "Discover a selection of premium fashion and lifestyle products designed to elevate your everyday moments.",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/products"
    },
    {
        title: "Summer Collection 2025",
        subtitle: "Embrace the season with lightweight textures and vibrant colors. Shop the new arrival now.",
        imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/products?category=Summer"
    },
    {
        title: "Minimalist Essentials",
        subtitle: "Clean lines, quality fabrics, and timeless designs for the modern wardrobe.",
        imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/products?category=Men"
    }
];

async function seedBanners() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Clear existing banners
        await connection.execute('TRUNCATE TABLE Banners');

        for (const banner of banners) {
            await connection.execute(
                'INSERT INTO Banners (title, subtitle, imageUrl, linkUrl) VALUES (?, ?, ?, ?)',
                [banner.title, banner.subtitle, banner.imageUrl, banner.linkUrl]
            );
        }

        console.log('Successfully seeded banners.');

    } catch (error) {
        console.error('Error seeding banners:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedBanners();
