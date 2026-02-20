// run: node seed.js
const mongoose = require('mongoose'); 
require('dotenv').config();
const Product = require('./models/Product'); 
const Ad = require('./models/Ad');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI); 
    console.log('Connected to Mongo');

    await Product.deleteMany({}); 
    await Ad.deleteMany({});

    const now = Date.now(); 
    const products = [
        {
            name: "Wireless Earbuds X1",
            description: "True wireless earbuds with noise cancellation.", 
            price: 24.99,
            originalPrice: 49.99, 
            category: "Electronics", 
            brand: "SoundX",
            sizes: [],
            colors: ["Black", "White"],
            images: ["https://picsum.photos/seed/earbuds/600/400"], 
            inStock: true,
            rating: 4.4,
            totalRatings: 128, 
            isDeal: true,
            dealEnd: new Date(now + 1000 * 60 * 60 * 12) // 12 hours from now
        },
        {
            name: "Comfort Running Shoes",
            description: "Breathable, lightweight running shoes.", 
            price: 39.99,
            originalPrice: 79.99, 
            category: "Fashion", 
            brand: "RunPro",
            sizes: ["7","8","9","10"],
            colors: ["Blue","Gray"],
            images: ["https://picsum.photos/seed/shoes/600/400"], 
            inStock: true,
            rating: 4.6,
            totalRatings: 220, 
            isDeal: true,
            dealEnd: new Date(now + 1000 * 60 * 60 * 48) // 48 hours
        },
        {
            name: "Kitchen Knife Set (5pcs)",
            description: "Stainless steel knives with wooden block.", 
            price: 29.50,
            originalPrice: 59.00, 
            category: "Home", 
            brand: "ChefMate", 
            sizes: [],
            colors: ["Silver"],
            images: ["https://picsum.photos/seed/knife/600/400"], 
            inStock: true,
            rating: 4.2,
            totalRatings: 86, 
            isDeal: false
        }
// add more...
];


    const ads = [
        { title: "Mega Summer Sale — Up to 60% OFF", 
        image: "https://picsum.photos/seed/sale1/1200/300", 
        link: "/products?isDeal=true", priority: 10, active: true },
        { title: "Free Shipping Over $50", image: "https://picsum.photos/seed/sale2/1200/300", 
                link: "/products", priority: 5, active: true }
    ];

    await Product.insertMany(products); 
    await Ad.insertMany(ads);

    console.log('Seeded products and ads'); 
    mongoose.disconnect();
}
seed().catch(err => { console.error(err); mongoose.disconnect(); });