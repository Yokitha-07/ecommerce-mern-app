const express = require('express'); 
const router = express.Router(); 
const Ad = require('../models/Ad');

// GET /api/ads -> active ads sorted by priority 
router.get('/', async (req, res) => {
    const now = new Date(); 
    try {
        // simple: return active ads (you may add date filtering)
        const ads = await Ad.find({ active: true }).sort({ priority: -1 }); 
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;