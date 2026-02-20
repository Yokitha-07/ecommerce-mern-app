const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({ 
    name: { type: String, required: true }, 
    description: String,
    price: { type: Number, required: true }, 
    originalPrice: Number,
    category: String, 
    brand: String, 
    sizes: [String], 
    colors: [String], 
    images: [String],
    inStock: { type: Boolean, default: true }, 
    rating: { type: Number, default: 0 }, 
    totalRatings: { type: Number, default: 0 }, 
    totalSold: { type: Number, default: 0 }, 
    isDeal: { type: Boolean, default: false }, 
    dealEnd: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);