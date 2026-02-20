const express = require('express'); 
const router = express.Router();
const Review = require('../models/Review'); 
const Product = require('../models/Product');

// POST /api/reviews { productId, name, rating, comment } 
router.post('/', async (req, res) => {
    try {
        const { productId, name, rating, comment } = req.body;
        const review = new Review({ productId, name, rating, comment });
        await review.save();

        // recompute avg rating and count 
        const agg = await Review.aggregate([
            { $match: { productId: review.productId } },
            { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, count: {
        $sum: 1 } } }
        ]);
        if (agg.length) {
            await Product.findByIdAndUpdate(productId, { 
                rating: agg[0].avgRating,
                totalRatings: agg[0].count
            });
        }
        res.json({ success: true, review });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    });

    // GET reviews for product: /api/reviews?productId=... 
    router.get('/', async (req, res) => {
        try {
            const { productId } = req.query;
            if (!productId) return res.status(400).json({ error: "productId required"
        });
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 }); 
        res.json(reviews);
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    });
module.exports = router;