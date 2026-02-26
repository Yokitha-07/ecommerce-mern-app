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
      },
      {
        color: "Red",
        colorCode: "#DC2626",
        images: ["https://picsum.photos/seed/shoes-red/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 4199,
        originalPrice: 7999,
        sizes: [
          { sizeLabel: "8", countrySizes: { US: "8", UK: "7", EU: "41" }, stock: 10, sku: "RPS-RED-8" },
          { sizeLabel: "10", countrySizes: { US: "10", UK: "9", EU: "43" }, stock: 5, sku: "RPS-RED-10" }
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
  },
  {
    name: "Smartwatch Pro S9",
    slug: "smartwatch-pro-s9",
    description: "Fitness tracking, heart-rate monitor, and AMOLED display.",
    brand: "ChronoTech",
    category: "Electronics",
    tags: ["wearable", "smartwatch"],
    basePrice: 15999,
    isDeal: true,
    dealEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    variants: [
      {
        color: "Black",
        colorCode: "#000000",
        images: ["https://picsum.photos/seed/watch-black/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 15999,
        originalPrice: 19999,
        sizes: [
          { sizeLabel: "42mm", countrySizes: {}, stock: 25, sku: "S9-BLK-42" },
          { sizeLabel: "46mm", countrySizes: {}, stock: 15, sku: "S9-BLK-46" }
        ]
      },
      {
        color: "Rose Gold",
        colorCode: "#F9A8D4",
        images: ["https://picsum.photos/seed/watch-rose/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 16999,
        originalPrice: 20999,
        sizes: [{ sizeLabel: "42mm", countrySizes: {}, stock: 12, sku: "S9-RGD-42" }]
      }
    ]
  },
  {
    name: "Premium Hoodie",
    slug: "premium-hoodie",
    description: "Soft fleece-lined hoodie for daily comfort.",
    brand: "UrbanWear",
    category: "Fashion",
    tags: ["hoodie", "casual"],
    basePrice: 5499,
    isDeal: false,
    variants: [
      {
        color: "Gray",
        colorCode: "#4B5563",
        images: ["https://picsum.photos/seed/hoodie-gray/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 5499,
        originalPrice: 6999,
        sizes: [
          { sizeLabel: "S", countrySizes: { US: "S", UK: "S", EU: "46" }, stock: 10, sku: "HD-GRY-S" },
          { sizeLabel: "M", countrySizes: { US: "M", UK: "M", EU: "48" }, stock: 15, sku: "HD-GRY-M" },
          { sizeLabel: "L", countrySizes: { US: "L", UK: "L", EU: "50" }, stock: 0, sku: "HD-GRY-L" }
        ]
      },
      {
        color: "Black",
        colorCode: "#000000",
        images: ["https://picsum.photos/seed/hoodie-black/600/400"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 5799,
        originalPrice: 7499,
        sizes: [
          { sizeLabel: "M", countrySizes: { US: "M", UK: "M", EU: "48" }, stock: 8, sku: "HD-BLK-M" },
          { sizeLabel: "L", countrySizes: { US: "L", UK: "L", EU: "50" }, stock: 5, sku: "HD-BLK-L" }
        ]
      }
    ]
  },
  {
    name: "4K Ultra HD TV 55\"",
    slug: "4k-ultra-hd-tv-55",
    description: "55-inch 4K UHD Smart TV with HDR10 support.",
    brand: "VisionMax",
    category: "Electronics",
    tags: ["tv", "4k", "smart"],
    basePrice: 89999,
    isDeal: true,
    dealEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    variants: [
      {
        color: "Black",
        colorCode: "#000000",
        images: ["https://picsum.photos/seed/tv-4k/800/450"],
        model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        price: 89999,
        originalPrice: 109999,
        sizes: [{ sizeLabel: "55-inch", countrySizes: {}, stock: 18, sku: "TV4K-55-BLK" }]
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