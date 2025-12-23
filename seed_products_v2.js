const pool = require('./config/database');

// Real Cloudinary demo images or reliable placeholders
const demoImages = [
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/bag.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/watch.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/sunglasses.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1688037803/shoes/running_shoes.jpg"
];

const products = [
    {
        name: "Premium Wireless Headphones",
        description: "Experience high-fidelity audio with our latest wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 8999,
        mrp: 12999,
        discount: 30,
        imageUrl: JSON.stringify([
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/watch.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/shoes/running_shoes.jpg"
        ]),
        category: "Electronics",
        subcategory: "Audio",
        stock: 45,
        isFeatured: 1
    },
    {
        name: "Ergonomic Office Chair",
        description: "Designed for comfort and productivity. Adjustable height, lumbar support, and breathable mesh back.",
        price: 15499,
        mrp: 22000,
        discount: 29,
        imageUrl: JSON.stringify([
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/watch.jpg"
        ]),
        category: "Home & Furniture",
        subcategory: "Office Furniture",
        stock: 20,
        isFeatured: 0
    },
    {
        name: "Smart Fitness Watch",
        description: "Track your fitness goals with precision. Heart rate monitor, GPS, and water resistance up to 50m.",
        price: 4999,
        mrp: 7999,
        discount: 37,
        imageUrl: JSON.stringify([
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/watch.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/sunglasses.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/shoes/running_shoes.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
        ]),
        category: "Electronics",
        subcategory: "Wearables",
        stock: 120,
        isFeatured: 1
    },
    {
        name: "Running Shoes - Pro Series",
        description: "Lightweight and durable running shoes for professional athletes. Enhanced grip and cushioning.",
        price: 3499,
        mrp: 4999,
        discount: 30,
        imageUrl: JSON.stringify([
            "https://res.cloudinary.com/demo/image/upload/v1688037803/shoes/running_shoes.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1688037803/accessories/sunglasses.jpg"
        ]),
        category: "Fashion",
        subcategory: "Footwear",
        stock: 80,
        isFeatured: 1
    }
];

async function seedProductsV2() {
    try {
        console.log("Seeding products with multiple images...");
        for (const product of products) {
            await pool.query(
                `INSERT INTO Products (name, description, price, mrp, discount, imageUrl, category, subcategory, stock, isFeatured, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [product.name, product.description, product.price, product.mrp, product.discount, product.imageUrl, product.category, product.subcategory, product.stock, product.isFeatured]
            );
        }
        console.log("Products V2 seeded successfully!");
    } catch (error) {
        console.error("Error seeding products:", error);
    } process.exit();
}

seedProductsV2();
