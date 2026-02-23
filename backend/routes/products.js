const express = require('express'); 
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
// supports query params: page, limit, sort, category, brand, minPrice, maxPrice, colors (csv), sizes (csv), rating, inStock, search, isDeal 
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort,
      category,
      brand,
      minPrice,
      maxPrice,
      colors,
      sizes,
      rating,
      inStock,
      search,
      isDeal
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    if (colors) filter.colors = { $in: colors.split(',') };
    if (sizes) filter.sizes = { $in: sizes.split(',') };
    if (rating) filter.rating = { $gte: Number(rating) };

    if (inStock === 'true') filter.inStock = true;
    if (inStock === 'false') filter.inStock = false;

    if (isDeal === 'true') filter.isDeal = true;
    if (isDeal === 'false') filter.isDeal = false;

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { name: re },
        { description: re },
        { brand: re }
      ];
    }

    let query = Product.find(filter);

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else if (sort === 'best_selling') query = query.sort({ totalSold: -1 });

    // ✅ THIS WAS MISSING
    const total = await Product.countDocuments(filter);

    const data = await query
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
    
module.exports = router;