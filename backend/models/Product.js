// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({ 
//     name: { type: String, required: true }, 
//     description: String,
//     price: { type: Number, required: true }, 
//     originalPrice: Number,
//     category: String, 
//     brand: String, 
//     sizes: [String], 
//     colors: [String], 
//     images: [String],
//     inStock: { type: Boolean, default: true }, 
//     rating: { type: Number, default: 0 }, 
//     totalRatings: { type: Number, default: 0 }, 
//     totalSold: { type: Number, default: 0 }, 
//     isDeal: { type: Boolean, default: false }, 
//     dealEnd: Date,
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', ProductSchema);

const mongoose = require('mongoose');

const SizeStockSchema = new mongoose.Schema({
    sizeLabel: String,
    countrySizes: { US:String, UK:String, EU:String, AU:String, JP:String },
    stock: { type: Number, default: 0 },
    sku: String
});

const VariantSchema = new mongoose.Schema({
    color: String,
    colorCode: String,
    images: [String],
    model3d: String,
    arOverlay: String,
    price: Number,
    originalPrice: Number,
    sizes: [SizeStockSchema]
});

const ProductSchema = new mongoose.Schema({
    name: String,
    slug: { type: String, index: true },
    description: String,
    brand: String,
    category: String,
    tags: [String],
    basePrice: Number,
    variants: [VariantSchema],
    rating: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    isDeal: Boolean,
    dealEnd: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
