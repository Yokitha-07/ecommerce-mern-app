require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/spacexp";

const products = [
  {
    name: "Wireless Earbuds X1",
    slug: "wireless-earbuds-x1",
    description: "True wireless earbuds with noise cancellation.",
    brand: "SoundX",
    category: "Electronics",
    tags: ["audio", "earbuds"],
    basePrice: 2499,
    isDeal: true,
    dealEnd: new Date(Date.now() + 6 * 60 * 60 * 1000),
    variants: [
      {
        color: "Black",
        colorCode: "#000000",
        images: ["https://picsum.photos/seed/earbuds-black/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 2499,
        originalPrice: 4999,
        sizes: [{ sizeLabel: "One Size", countrySizes: {}, stock: 50, sku: "EBX1-BLK-OS" }]
      },
      {
        color: "White",
        colorCode: "#FFFFFF",
        images: ["https://picsum.photos/seed/earbuds-white/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 2599,
        originalPrice: 4999,
        sizes: [{ sizeLabel: "One Size", countrySizes: {}, stock: 30, sku: "EBX1-WHT-OS" }]
      }
    ]
  },
  {
    name: "Comfort Running Shoes",
    slug: "comfort-running-shoes",
    description: "Breathable, lightweight running shoes.",
    brand: "RunPro",
    category: "Fashion",
    tags: ["shoes", "sport"],
    basePrice: 3999,
    isDeal: true,
    dealEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    variants: [
      {
        color: "Blue",
        colorCode: "#1E40AF",
        images: ["https://picsum.photos/seed/shoes-blue/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 3999,
        originalPrice: 7999,
        sizes: [
          { sizeLabel: "8", countrySizes: { US: "8", UK: "7", EU: "41" }, stock: 20, sku: "RPS-BLU-8" },
          { sizeLabel: "9", countrySizes: { US: "9", UK: "8", EU: "42" }, stock: 15, sku: "RPS-BLU-9" }
        ]
      }
    ]
  },
  {
    name: "Kitchen Knife Set (5pcs)",
    slug: "kitchen-knife-set-5pcs",
    description: "Stainless steel knives with wooden block.",
    brand: "ChefMate",
    category: "Home",
    tags: ["kitchen", "knife"],
    basePrice: 2950,
    isDeal: false,
    variants: [
      {
        color: "Silver",
        colorCode: "#A1A1AA",
        images: ["https://picsum.photos/seed/knife-set/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 2950,
        originalPrice: 5900,
        sizes: [{ sizeLabel: "Standard", countrySizes: {}, stock: 40, sku: "KNS-SLV-STD" }]
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected");

    await Product.deleteMany();
    console.log("Cleared old products");

    await Product.insertMany(products);
    console.log("Seeded Task 8 products successfully");

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();