const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const md5Upper = (s) => crypto.createHash("md5").update(s).digest("hex").toUpperCase();

router.post("/hash", (req, res) => {
  const { order_id, amount, currency } = req.body;

  const merchant_id = process.env.PAYHERE_MERCHANT_ID;
  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchant_id || !merchant_secret) {
    return res.status(500).json({ success: false, error: "Missing PayHere env vars" });
  }

  // PayHere: hash = MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret).upper ).upper
  const inner = md5Upper(merchant_secret);
  const hash = md5Upper(merchant_id + order_id + amount + currency + inner);

  res.json({ success: true, hash });
});

module.exports = router;