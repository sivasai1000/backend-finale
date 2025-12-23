const pool = require('./config/database');

const products = [
    {
        name: "iPhone 15 Pro Max",
        description: "Titanium design, A17 Pro chip, 48MP Main camera.",
        price: 159900,
        mrp: 169900,
        discount: 5,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
            "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/2.webp",
            "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/3.webp"
        ]),
        category: "Electronics",
        subcategory: "Smartphones",
        stock: 50,
        isFeatured: 1
    },
    {
        name: "MacBook Air M2",
        description: "Supercharged by M2 chip. 18 hours battery life.",
        price: 99900,
        mrp: 119900,
        discount: 16,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp",
            "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/2.webp",
            "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/3.webp"
        ]),
        category: "Electronics",
        subcategory: "Laptops",
        stock: 30,
        isFeatured: 1
    },
    {
        name: "Sony WH-1000XM5",
        description: "Industry leading noise canceling headphones.",
        price: 29990,
        mrp: 34990,
        discount: 14,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp",
            "https://placehold.co/600x400?text=Sony+Headphones+Side",
            "https://placehold.co/600x400?text=Sony+Headphones+Case"
        ]),
        category: "Electronics",
        subcategory: "Audio",
        stock: 100,
        isFeatured: 0
    },
    {
        name: "Men's Slim Fit T-Shirt",
        description: "100% Cotton, comfortable and breathable.",
        price: 499,
        mrp: 999,
        discount: 50,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp",
            "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/2.webp",
            "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/3.webp",
            "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/4.webp"
        ]),
        category: "Fashion",
        subcategory: "Men's Wear",
        stock: 200,
        isFeatured: 0
    },
    {
        name: "Women's Floral Dress",
        description: "Perfect for summer outings. Lightweight fabric.",
        price: 1299,
        mrp: 2499,
        discount: 48,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/1.webp",
            "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/2.webp",
            "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/3.webp",
            "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/4.webp"
        ]),
        category: "Fashion",
        subcategory: "Women's Wear",
        stock: 75,
        isFeatured: 1
    },
    {
        name: "Nike Air Jordan 1",
        description: "Iconic style, premium comfort.",
        price: 11995,
        mrp: 11995,
        discount: 0,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp",
            "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/2.webp",
            "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/3.webp",
            "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/4.webp"
        ]),
        category: "Fashion",
        subcategory: "Footwear",
        stock: 20,
        isFeatured: 1
    },
    {
        name: "Wooden Coffee Table",
        description: "Minimalist design, solid oak wood.",
        price: 5999,
        mrp: 8999,
        discount: 33,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp",
            "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/2.webp",
            "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/3.webp"
        ]),
        category: "Home & Furniture",
        subcategory: "Furniture",
        stock: 15,
        isFeatured: 0
    },
    {
        name: "Ceramic Vase Set",
        description: "Handcrafted ceramic vases for home decor.",
        price: 1499,
        mrp: 2999,
        discount: 50,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp",
            "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/2.webp",
            "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/3.webp",
            "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/4.webp"
        ]),
        category: "Home & Furniture",
        subcategory: "Decor",
        stock: 40,
        isFeatured: 0
    },
    {
        name: "Samsung 55\" 4K TV",
        description: "Crystal Processor 4K, Smart TV features.",
        price: 45990,
        mrp: 69900,
        discount: 34,
        imageUrl: JSON.stringify([
            "https://placehold.co/600x400?text=Samsung+TV+Front",
            "https://placehold.co/600x400?text=Samsung+TV+Side",
            "https://placehold.co/600x400?text=Samsung+TV+Remote"
        ]),
        category: "Electronics",
        subcategory: "Television",
        stock: 25,
        isFeatured: 1
    },
    {
        name: "Protein Powder 1kg",
        description: "Whey protein isolate, chocolate flavor.",
        price: 2499,
        mrp: 3500,
        discount: 28,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/groceries/protein-powder/1.webp",
            "https://placehold.co/600x400?text=Protein+Powder+Back",
            "https://placehold.co/600x400?text=Nutritional+Facts"
        ]),
        category: "Health & Beauty",
        subcategory: "Supplements",
        stock: 150,
        isFeatured: 0
    },
    {
        name: "Apple Watch Series 4 Gold",
        description: "Stylish and advanced smartwatch with heart rate monitoring.",
        price: 28990,
        mrp: 34990,
        discount: 17,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp",
            "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/2.webp",
            "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/3.webp"
        ]),
        category: "Electronics",
        subcategory: "Wearables",
        stock: 35,
        isFeatured: 1
    },
    {
        name: "Compact Power Blender",
        description: "Powerful and compact blender for smoothies and shakes.",
        price: 3499,
        mrp: 4999,
        discount: 30,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp",
            "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/2.webp",
            "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/3.webp"
        ]),
        category: "Home & Furniture",
        subcategory: "Kitchen",
        stock: 20,
        isFeatured: 0
    },
    {
        name: "White Faux Leather Backpack",
        description: "Trendy and practical backpack with ample storage.",
        price: 2999,
        mrp: 3999,
        discount: 25,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp",
            "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/2.webp",
            "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/3.webp"
        ]),
        category: "Fashion",
        subcategory: "Accessories",
        stock: 40,
        isFeatured: 0
    },
    {
        name: "Classic UV Sunglasses",
        description: "Timeless design with UV-protected lenses.",
        price: 1999,
        mrp: 2999,
        discount: 33,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp",
            "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/2.webp",
            "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/3.webp"
        ]),
        category: "Fashion",
        subcategory: "Accessories",
        stock: 60,
        isFeatured: 0
    },
    {
        name: "Vaseline Men Body Lotion",
        description: "Long-lasting moisture for healthy skin.",
        price: 499,
        mrp: 699,
        discount: 28,
        imageUrl: JSON.stringify([
            "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp",
            "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/2.webp",
            "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/3.webp"
        ]),
        category: "Health & Beauty",
        subcategory: "Skincare",
        stock: 100,
        isFeatured: 0
    }
];

async function seedProducts() {
    try {
        console.log("Seeding products...");
        // Clear existing products to avoid duplicates
        await pool.query('DELETE FROM Products');
        console.log("Cleared existing products.");

        // Clear existing banners
        await pool.query('DELETE FROM Banners');
        console.log("Cleared existing banners.");

        for (const product of products) {
            await pool.query(
                `INSERT INTO Products (name, description, price, mrp, discount, imageUrl, category, subcategory, stock, isFeatured, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [product.name, product.description, product.price, product.mrp, product.discount, product.imageUrl, product.category, product.subcategory, product.stock, product.isFeatured]
            );
        }
        console.log("Products seeded successfully!");

        // Seed Banners based on products
        const banners = [
            {
                title: "Latest Smartphones",
                subtitle: "Upgrade to the newest tech",
                imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80",
                linkUrl: "/products?category=Electronics"
            },
            {
                title: "Summer Fashion Collection",
                subtitle: "Trendy styles for every occasion",
                imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80",
                linkUrl: "/products?category=Fashion"
            },
            {
                title: "Modern Home Furniture",
                subtitle: "Elevate your living space",
                imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80",
                linkUrl: "/products?category=Home%20%26%20Furniture"
            }
        ];

        for (const banner of banners) {
            await pool.query(
                `INSERT INTO Banners (title, subtitle, imageUrl, linkUrl, isActive, createdAt) 
                 VALUES (?, ?, ?, ?, TRUE, NOW())`,
                [banner.title, banner.subtitle, banner.imageUrl, banner.linkUrl]
            );
        }
        console.log("Banners seeded successfully!");
    } catch (error) {
        console.error("Error seeding products:", error);
    }
    process.exit();
}

seedProducts();
