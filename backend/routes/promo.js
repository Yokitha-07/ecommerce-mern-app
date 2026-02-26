const express = require("express");
const router = express.Router();
const Promo = require("../models/Promo");
const Order = require("../models/Order");
const { verifyToken, authorize } = require("../middleware/auth");

/**
 * Shared validation logic for promo codes.
 * Does NOT mutate DB or increment usage.
 * Returns a normalized result object to keep /validate and /apply in sync.
 */
async function validatePromoForUser({ code, amount = 0, userId }) {
  if (!code) {
    return { valid: false, status: 400, error: "Promo code is required." };
  }

  const promo = await Promo.findOne({ code: code.toUpperCase(), active: true });

  if (!promo) {
    return { valid: false, status: 200, error: "Invalid promo code." };
  }

  const now = new Date();

  // Validity window
  if (promo.validFrom && now < promo.validFrom) {
    return { valid: false, status: 200, error: "Promo code not yet valid." };
  }

  if (promo.validTo && now > promo.validTo) {
    return { valid: false, status: 200, error: "Promo code has expired." };
  }

  // Global usage limit
  if (promo.maxUses && promo.uses >= promo.maxUses) {
    return { valid: false, status: 200, error: "Promo code usage limit reached." };
  }

  // Amount restrictions
  const numericAmount = Number(amount) || 0;
  if (promo.minAmount && numericAmount < promo.minAmount) {
    return {
      valid: false,
      status: 200,
      error: `Minimum purchase of Rs. ${promo.minAmount} required.`,
    };
  }

  // User / loyalty restrictions
  if ((promo.firstTimeOnly || promo.recurringCustomerDiscount) && !userId) {
    return {
      valid: false,
      status: 401,
      error: "Login required to use this promo code.",
    };
  }

  if (userId && (promo.firstTimeOnly || promo.recurringCustomerDiscount)) {
    // Count previous successful (paid) orders for this user
    const previousOrdersCount = await Order.countDocuments({
      userId,
      paymentStatus: "paid",
    });

    if (promo.firstTimeOnly && previousOrdersCount > 0) {
      return {
        valid: false,
        status: 200,
        error: "This promo code is only for first-time customers.",
      };
    }

    if (promo.recurringCustomerDiscount && previousOrdersCount === 0) {
      return {
        valid: false,
        status: 200,
        error: "This promo code is only for returning customers.",
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (promo.discountType === "percent") {
    discount = (numericAmount * promo.discountValue) / 100;
  } else if (promo.discountType === "fixed") {
    discount = Math.min(promo.discountValue, numericAmount);
  }

  // Never allow negative discounts, and round to 2 decimals
  discount = Math.max(0, Number(discount.toFixed(2)));

  return {
    valid: true,
    status: 200,
    promo,
    discount,
  };
}

/**
 * @route   POST /api/promo/validate
 * @desc    Validate promo code and compute discount without applying it
 * @access  Private (requires token for user-specific rules)
 */
router.post("/validate", verifyToken, async (req, res) => {
  try {
    const { code, amount = 0 } = req.body;
    // const userId = req.user && req.user.userId;
    const userId = req.user?.id;

    const result = await validatePromoForUser({ code, amount, userId });

    if (!result.valid) {
      return res.status(result.status).json({
        success: true,
        valid: false,
        error: result.error,
      });
    }

    const { promo, discount } = result;

    res.json({
      success: true,
      valid: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        firstTimeOnly: promo.firstTimeOnly,
        recurringCustomerDiscount: promo.recurringCustomerDiscount,
      },
      discount,
    });
  } catch (error) {
    console.error("Validate promo error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

/**
 * @route   POST /api/promo/apply
 * @desc    Apply promo code and increment global usage (server-side re-validation)
 * @access  Private (requires token)
 */
router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { code, amount = 0 } = req.body;
    // const userId = req.user && req.user.userId;
    const userId = req.user?.id;

    const result = await validatePromoForUser({ code, amount, userId });

    if (!result.valid) {
      return res.status(result.status).json({
        success: false,
        error: result.error,
      });
    }

    const promo = result.promo;

    // Race-safe increment of usage with validity + maxUses checks in the query
    const now = new Date();
    const updateQuery = {
      _id: promo._id,
      active: true,
    };

    if (promo.validFrom) {
      updateQuery.validFrom = { $lte: now };
    }
    if (promo.validTo) {
      updateQuery.validTo = { $gte: now };
    }
    if (promo.maxUses) {
      updateQuery.uses = { $lt: promo.maxUses };
    }

    const updated = await Promo.findOneAndUpdate(
      updateQuery,
      { $inc: { uses: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        error: "Promo code can no longer be used (limit reached or expired).",
      });
    }

    res.json({ success: true, message: "Promo code applied." });
  } catch (error) {
    console.error("Apply promo error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

/**
 * @route   GET /api/promo
 * @desc    Get all promo codes (admin/marketing only)
 * @access  Private (admin, marketing)
 */
router.get("/", authorize(["admin", "marketing"]), async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (error) {
    console.error("Get promos error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

/**
 * @route   POST /api/promo/create
 * @desc    Create new promo code (admin/marketing only)
 * @access  Private (admin, marketing)
 */
router.post("/create", authorize(["admin", "marketing"]), async (req, res) => {
  try {
    const {
      code,
      discountType = "percent",
      discountValue,
      minAmount,
      maxUses,
      validFrom,
      validTo,
      active = true,
      firstTimeOnly = false,
      recurringCustomerDiscount = false,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: "Code and discount value are required." });
    }

    const numericDiscount = Number(discountValue);
    if (!Number.isFinite(numericDiscount) || numericDiscount <= 0) {
      return res.status(400).json({ error: "Discount value must be a positive number." });
    }

    if (discountType === "percent" && (numericDiscount <= 0 || numericDiscount > 100)) {
      return res
        .status(400)
        .json({ error: "Percentage discount must be greater than 0 and at most 100." });
    }

    const existing = await Promo.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: "Promo code already exists." });
    }

    const promo = new Promo({
      code: code.toUpperCase(),
      discountType,
      discountValue: numericDiscount,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: validTo ? new Date(validTo) : undefined,
      active,
      firstTimeOnly,
      recurringCustomerDiscount,
    });

    await promo.save();

    res.status(201).json({ success: true, promo });
  } catch (error) {
    console.error("Create promo error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Promo code already exists." });
    }
    res.status(500).json({ error: "Server error." });
  }
});

/**
 * @route   PUT /api/promo/:id
 * @desc    Update promo code (admin/marketing only)
 * @access  Private (admin, marketing)
 */
router.put("/:id", authorize(["admin", "marketing"]), async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: "Promo code not found." });
    }

    const {
      code,
      discountType,
      discountValue,
      minAmount,
      maxUses,
      validFrom,
      validTo,
      active,
      firstTimeOnly,
      recurringCustomerDiscount,
    } = req.body;

    if (code && code.toUpperCase() !== promo.code) {
      const existing = await Promo.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ error: "Promo code already exists." });
      }
      promo.code = code.toUpperCase();
    }

    if (discountType) promo.discountType = discountType;
    if (discountValue !== undefined) {
      const numericDiscount = Number(discountValue);
      if (!Number.isFinite(numericDiscount) || numericDiscount <= 0) {
        return res.status(400).json({ error: "Discount value must be a positive number." });
      }

      if (discountType ? discountType === "percent" : promo.discountType === "percent") {
        if (numericDiscount <= 0 || numericDiscount > 100) {
          return res.status(400).json({
            error: "Percentage discount must be greater than 0 and at most 100.",
          });
        }
      }

      promo.discountValue = numericDiscount;
    }
    if (minAmount !== undefined) promo.minAmount = minAmount ? Number(minAmount) : undefined;
    if (maxUses !== undefined) promo.maxUses = maxUses ? Number(maxUses) : undefined;
    if (validFrom !== undefined) promo.validFrom = validFrom ? new Date(validFrom) : undefined;
    if (validTo !== undefined) promo.validTo = validTo ? new Date(validTo) : undefined;
    if (active !== undefined) promo.active = active;
    if (firstTimeOnly !== undefined) promo.firstTimeOnly = !!firstTimeOnly;
    if (recurringCustomerDiscount !== undefined)
      promo.recurringCustomerDiscount = !!recurringCustomerDiscount;

    await promo.save();

    res.json({ success: true, promo });
  } catch (error) {
    console.error("Update promo error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

/**
 * @route   DELETE /api/promo/:id
 * @desc    Delete promo code (admin/marketing only)
 * @access  Private (admin, marketing)
 */
router.delete("/:id", authorize(["admin", "marketing"]), async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Promo code deleted." });
  } catch (error) {
    console.error("Delete promo error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
