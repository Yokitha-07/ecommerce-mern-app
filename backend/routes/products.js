const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authorize } = require('../middleware/auth'); // adjust path if needed


router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort,
      category,
      brand,
      tags,
      minPrice,
      maxPrice,
      colors,
      sizes,
      rating,
      inStock,
      search,
      isDeal,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const filter = {};

    // top-level filters
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length) {
        filter.tags = { $in: tagList };
      }
    }

    // price range - support Task 8 basePrice but stay compatible with legacy price + variants.price
    const priceRange = {};
    if (minPrice && !isNaN(minPrice)) priceRange.$gte = Number(minPrice);
    if (maxPrice && !isNaN(maxPrice)) priceRange.$lte = Number(maxPrice);

    // nested variant filters
    if (colors) {
      const colorList = colors.split(',').map(c => c.trim()).filter(Boolean);
      if (colorList.length) {
        filter['variants.color'] = { $in: colorList };
      }
    }

    if (sizes) {
      const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeList.length) {
        // match any SizeStock.sizeLabel
        filter['variants.sizes.sizeLabel'] = { $in: sizeList };
      }
    }

    if (rating) {
      const r = Number(rating);
      if (!isNaN(r)) {
        filter.rating = { $gte: r };
      }
    }

    // "inStock" for Task 8 means at least one size with stock > 0
    if (inStock === 'true') {
      filter['variants.sizes.stock'] = { $gt: 0 };
    } else if (inStock === 'false') {
      filter['variants.sizes.stock'] = { $lte: 0 };
    }

    if (isDeal === 'true') filter.isDeal = true;
    if (isDeal === 'false') filter.isDeal = false;

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { name: re },
        { description: re },
        { brand: re },
        { category: re },
        { tags: re },
      ];
    }

    // Build final Mongo filter combining base filters, search $or, and price-range $or
    const andConds = [];
    const { $or: searchOr, ...restFilters } = filter;

    if (Object.keys(restFilters).length) andConds.push(restFilters);
    if (searchOr && searchOr.length) andConds.push({ $or: searchOr });

    if (Object.keys(priceRange).length) {
      andConds.push({
        $or: [
          { basePrice: priceRange },
          { price: priceRange }, // legacy products
          { 'variants.price': priceRange }, // safety net for variant-level prices
        ],
      });
    }

    const finalFilter =
      andConds.length === 0
        ? {}
        : andConds.length === 1
        ? andConds[0]
        : { $and: andConds };

    let query = Product.find(finalFilter);

    // sorting – prefer basePrice, but fall back to legacy price / variants.price
    if (sort === 'price_asc' || sort === 'basePrice_asc') {
      query = query.sort({ basePrice: 1, price: 1, 'variants.price': 1 });
    } else if (sort === 'price_desc' || sort === 'basePrice_desc') {
      query = query.sort({ basePrice: -1, price: -1, 'variants.price': -1 });
    } else if (sort === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sort === 'best_selling') {
      query = query.sort({ totalSold: -1 });
    }

    const total = await Product.countDocuments(finalFilter);

    const data = await query
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

// ✅ POST /api/products  (ADD product)
// CREATE product (admin only)
router.post("/", authorize(['admin']), async (req, res) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json({ data: created });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// ✅ DELETE /api/products/:id  (DELETE product)
// DELETE product (admin only)
router.delete("/:id", authorize(['admin']), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// ✅ PATCH /api/products/:id/stock  (UPDATE stock => controls "inStock")
//
// body: { variantIndex: 0, sizeIndex: 1, stock: 15 }
// UPDATE stock (admin only)
router.patch("/:id/stock", authorize(['admin']), async (req, res) => {
  try {
    const { variantIndex, sizeIndex, stock } = req.body;

    const path = `variants.${variantIndex}.sizes.${sizeIndex}.stock`;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { [path]: Number(stock || 0) } },
      { new: true }
    );

    res.json({ data: updated });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;