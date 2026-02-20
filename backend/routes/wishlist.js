const express = require('express'); 
const router = express.Router();
const Wishlist = require('../models/Wishlist'); 
const Product = require('../models/Product');

// GET /api/wishlist?userId=xxx 
router.get('/', async (req, res) => {
    const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId required" }); 
        let w = await Wishlist.findOne({ userId }).populate('products');
        if (!w) return res.json({ products: [] }); 
        res.json(w);
});

// POST /api/wishlist/toggle { userId, productId } 
router.post('/toggle', async (req, res) => {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: "userId & productId required" });

    let w = await Wishlist.findOne({ userId }); 
    if (!w) {
        w = new Wishlist({ userId, products: [productId] }); 
        await w.save();
        await w.populate('products'); 
        return res.json(w);
    }
    const exists = w.products.find(p => p.toString() === productId); 
    if (exists) {
        w.products = w.products.filter(p => p.toString() !== productId);
    } else { 
        w.products.push(productId);
    }
    await w.save();
    await w.populate('products'); 
    res.json(w);
});

module.exports = router;