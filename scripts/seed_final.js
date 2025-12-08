const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('Environment Variables Loaded:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
    passLength: process.env.DB_PASS ? process.env.DB_PASS.length : 0
});

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
};

const bannersData = [
    {
        title: "Summer Collection 2025",
        subtitle: "Embrace the sun with our exclusive summer wear.",
        imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/products?category=Women"
    },
    {
        title: "Urban Streetwear",
        subtitle: "Redefine your style with bold and comfort-first designs.",
        imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop",
        linkUrl: "/products?category=Men"
    },
    {
        title: "Elegant Accessories",
        subtitle: "The perfect finishing touch for any outfit.",
        imageUrl: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965&auto=format&fit=crop",
        linkUrl: "/products?category=Accessories"
    }
];

const pagesData = [
    {
        slug: "about",
        title: "About Us",
        content: "<p>Welcome to <strong>SIVA SAI</strong>, where fashion meets elegance. Established in 2025, we are dedicated to providing high-quality clothing and accessories that empower you to express your unique style.</p><p>Our mission is to create a sustainable and inclusive fashion ecosystem. We source the finest materials and work with skilled artisans to bring you products that last.</p><h2>Our Story</h2><p>It started with a simple idea: Fashion should be accessible, durable, and beautiful. From our humble beginnings, we have grown into a global brand, loved by thousands of customers worldwide.</p>"
    },
    {
        slug: "contact",
        title: "Contact Us",
        content: "<p>We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to say hello, our team is ready to help.</p><ul><li><strong>Email:</strong> support@sivasai.com</li><li><strong>Phone:</strong> +1 (555) 123-4567</li><li><strong>Address:</strong> 123 Fashion Ave, Design District, New York, NY 10001</li></ul><p>Customer Support Hours: Mon-Fri, 9 AM - 6 PM EST</p>"
    },
    {
        slug: "terms",
        title: "Terms and Conditions",
        content: "<h2>1. Introduction</h2><p>Welcome to SIVA SAI. By accessing our website, you agree to bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p><h2>2. Use License</h2><p>Permission is granted to temporarily download one copy of the materials (information or software) on SIVA SAI's website for personal, non-commercial transitory viewing only.</p><h2>3. Disclaimer</h2><p>The materials on SIVA SAI's website are provided on an 'as is' basis. SIVA SAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>"
    },
    {
        slug: "privacy",
        title: "Privacy Policy",
        content: "<h2>1. Your Privacy Matters</h2><p>Your privacy is important to us. It is SIVA SAI's policy to respect your privacy regarding any information we may collect from you across our website.</p><h2>2. Information We Collect</h2><p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p><h2>3. How We Use Information</h2><p>We use the information we collect to operate and maintain our website, send you newsletters, and respond to your comments and questions.</p>"
    },
    {
        slug: "shipping",
        title: "Shipping & Returns",
        content: "<h2>Shipping Policy</h2><p>We offer free shipping on all orders over $200. Standard shipping takes 3-5 business days. Express shipping options are available at checkout.</p><h2>Return Policy</h2><p>We accept returns within 30 days of purchase. Items must be unused and in original packaging. To initiate a return, please contact our support team.</p>"
    }
];

const blogsData = [
    {
        title: "Top 5 Fashion Trends of 2025",
        content: "The year 2025 brings a refreshing mix of nostalgia and futurism. <br><br><strong>1. Digital Lavender:</strong> This color is everywhere, evoking calmness and serenity.<br><strong>2. Cargo Pants 2.0:</strong> Utility meets luxury with silk and tailored cargo designs.<br><strong>3. Sheer Fabrics:</strong> Layering is key this season, with sheer tops adding depth to any outfit.<br><br>Stay ahead of the curve by incorporating these pieces into your wardrobe.",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        author: "Emily Fashionista"
    },
    {
        title: "Sustainable Fashion: Why It Matters",
        content: "Fast fashion is out; sustainability is in. Making conscious choices about what we wear has a massive impact on the planet.<br><br>At SIVA SAI, we are committed to using eco-friendly materials and ethical manufacturing processes. Learn how you can build a sustainable wardrobe without compromising on style.",
        imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
        author: "Green Earth"
    },
    {
        title: "How to Style Accessories",
        content: "Accessories can make or break an outfit. In this guide, we explore the art of minimalism vs. maximalism.<br><br>Discover how a simple watch or a statement necklace can elevate a basic tee and jeans combo into a runway-ready look.",
        imageUrl: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965&auto=format&fit=crop",
        author: "Style Guru"
    }
];

const productsData = [
    {
        name: "Classic Leather Watch",
        description: "A timeless piece for the modern gentleman. Features a genuine leather strap and minimalist dial.",
        price: 129.99,
        mrp: 199.99,
        discount: 35,
        category: "Accessories",
        subcategory: "Watches",
        imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop",
        stock: 50,
        isFeatured: true
    },
    {
        name: "Premium Denim Jacket",
        description: "Rugged yet refined. This denim jacket is perfect for layering in any season.",
        price: 89.99,
        mrp: 129.99,
        discount: 30,
        category: "Men",
        subcategory: "Jackets",
        imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1974&auto=format&fit=crop",
        stock: 30,
        isFeatured: true
    },
    {
        name: "Floral Summer Dress",
        description: "Light, airy, and beautiful. This floral dress is your go-to for summer brunches.",
        price: 59.99,
        mrp: 79.99,
        discount: 25,
        category: "Women",
        subcategory: "Dresses",
        imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop",
        stock: 100,
        isFeatured: true
    },
    {
        name: "Running Sneakers",
        description: "High-performance sneakers designed for comfort and speed. Breathable mesh upper.",
        price: 110.00,
        mrp: 150.00,
        discount: 26,
        category: "Shoes",
        subcategory: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        stock: 45,
        isFeatured: false
    },
    {
        name: "Leather Tote Bag",
        description: "Spacious and stylish. Carry your essentials in luxury with our premium leather tote.",
        price: 149.50,
        mrp: 199.50,
        discount: 25,
        category: "Accessories",
        subcategory: "Bags",
        imageUrl: "https://images.unsplash.com/photo-1590874102907-7354876a9289?q=80&w=1974&auto=format&fit=crop",
        stock: 20,
        isFeatured: true
    },
    {
        name: "Silk Blouse",
        description: "Elegant silk blouse suitable for office wear or evening outings.",
        price: 75.00,
        mrp: 100.00,
        discount: 25,
        category: "Women",
        subcategory: "Tops",
        imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1974&auto=format&fit=crop",
        stock: 60,
        isFeatured: false
    },
    {
        name: "Slim Fit Chinos",
        description: "Versatile chinos that pair well with anything. Available in beige.",
        price: 49.99,
        mrp: 69.99,
        discount: 28,
        category: "Men",
        subcategory: "Pants",
        imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1974&auto=format&fit=crop",
        stock: 80,
        isFeatured: false
    },
    {
        name: "Aviator Sunglasses",
        description: "Classic aviator style with UV400 protection.",
        price: 120.00,
        mrp: 180.00,
        discount: 33,
        category: "Accessories",
        subcategory: "Eyewear",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
        stock: 15,
        isFeatured: true
    }
];

async function seedDatabase() {
    let connection;
    try {
        console.log('Connecting to database...');
        // Do not verify connection config here to avoid leaking secrets in logs if failed
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        // 1. Ensure Tables Exist (DDL)
        console.log('Ensuring tables exist...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                role ENUM('user', 'admin') DEFAULT 'user',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                subtitle VARCHAR(255),
                imageUrl VARCHAR(2048),
                linkUrl VARCHAR(255)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(50) UNIQUE,
                title VARCHAR(255),
                content TEXT
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                content TEXT,
                imageUrl VARCHAR(2048),
                author VARCHAR(255),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                description TEXT,
                price DECIMAL(10,2),
                mrp DECIMAL(10,2),
                discount INT,
                category VARCHAR(100),
                subcategory VARCHAR(100),
                imageUrl VARCHAR(2048),
                stock INT DEFAULT 0,
                isFeatured BOOLEAN DEFAULT FALSE,
                addedBy INT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS FeaturedProducts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT,
                FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Reviews (
                 id INT AUTO_INCREMENT PRIMARY KEY,
                 userId INT,
                 productId INT,
                 rating INT,
                 comment TEXT,
                 status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                 createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                items JSON,
                totalAmount DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'pending',
                paymentId VARCHAR(255),
                address JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId INT,
                productId INT,
                quantity INT,
                price DECIMAL(10,2),
                FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
            )
        `);

        // 2. Get a User ID (for addedBy/author)
        const [users] = await connection.execute('SELECT id FROM Users LIMIT 1');
        let adminId = 1; // Default
        if (users.length > 0) {
            adminId = users[0].id;
        } else {
            // Create admin if missing
            const [res] = await connection.execute("INSERT INTO Users (name, email, password, role) VALUES ('Admin', 'admin@example.com', 'hashedpassword', 'admin')");
            adminId = res.insertId;
        }

        // 3. Clean Tables
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Truncating tables...');

        await connection.query('DELETE FROM OrderItems');
        await connection.query('DELETE FROM Orders');
        await connection.query('TRUNCATE TABLE Reviews');
        await connection.query('TRUNCATE TABLE FeaturedProducts');
        await connection.query('TRUNCATE TABLE Banners');
        await connection.query('TRUNCATE TABLE Blogs');
        await connection.query('TRUNCATE TABLE Pages');
        await connection.query('TRUNCATE TABLE Products');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 4. Insert Banners
        console.log('Seeding Banners...');
        for (const banner of bannersData) {
            await connection.execute(
                'INSERT INTO Banners (title, subtitle, imageUrl, linkUrl) VALUES (?, ?, ?, ?)',
                [banner.title, banner.subtitle, banner.imageUrl, banner.linkUrl]
            );
        }

        // 5. Insert Pages
        console.log('Seeding Pages...');
        for (const page of pagesData) {
            await connection.execute(
                'INSERT INTO Pages (slug, title, content) VALUES (?, ?, ?)',
                [page.slug, page.title, page.content]
            );
        }

        // 6. Insert Blogs
        console.log('Seeding Blogs...');
        for (const blog of blogsData) {
            await connection.execute(
                'INSERT INTO Blogs (title, content, imageUrl, author) VALUES (?, ?, ?, ?)',
                [blog.title, blog.content, blog.imageUrl, blog.author]
            );
        }

        // 7. Insert Products
        console.log('Seeding Products...');
        for (const p of productsData) {
            await connection.execute(
                `INSERT INTO Products 
                (name, description, price, mrp, discount, category, subcategory, imageUrl, stock, isFeatured, addedBy, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [p.name, p.description, p.price, p.mrp, p.discount, p.category, p.subcategory, p.imageUrl, p.stock, p.isFeatured, adminId]
            );
        }

        console.log('Database seeded successfully!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedDatabase();
