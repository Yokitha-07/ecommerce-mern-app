const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');

function verifyPayHereMd5(body, merchantSecret) {
    const { merchant_id='', order_id='', payhere_amount='', payhere_currency='', status_code='', md5sig='' } = body;
    const innerHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const concat = merchant_id + order_id + payhere_amount + payhere_currency + status_code + innerHash;
    const localMd5 = crypto.createHash('md5').update(concat).digest('hex').toUpperCase();
    return localMd5 === (md5sig || '').toUpperCase();
}


const md5Upper = (str) =>
  crypto.createHash("md5").update(str).digest("hex").toUpperCase();

router.post("/payhere/hash", (req, res) => {
  const { order_id, amount, currency } = req.body;

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    return res.status(500).json({ error: "Missing PAYHERE env vars" });
  }

  const formattedAmount = Number(amount).toFixed(2);
  const secretHash = md5Upper(merchantSecret);

  const hash = md5Upper(
    merchantId + String(order_id) + formattedAmount + String(currency) + secretHash
  );

  res.json({ hash });
});

const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, async (req, res) => {
  const { items, subtotal, discount = 0, shipping = 0 } = req.body;

  const total = Number(subtotal || 0) - Number(discount || 0) + Number(shipping || 0);

  const order = new Order({
    userId: req.user.id,          // ✅ from token
    items,
    subtotal,
    discount,
    shipping,
    total,
    paymentStatus: "pending",
  });

  await order.save();

  res.json({ success: true, orderId: order._id, total });
});

router.post('/payhere-notify', async (req,res)=>{
    try {
        const body = req.body;
        if (!verifyPayHereMd5(body, process.env.PAYHERE_MERCHANT_SECRET))
            return res.status(400).send('Invalid signature');

        const o = await Order.findById(body.order_id);
        if(!o) return res.status(404).send('Order not found');

        const status = parseInt(body.status_code,10);
        o.paymentStatus = status === 2 ? 'paid' : (status===0?'pending':'failed');
        o.payherePaymentId = body.payment_id;
        await o.save();
        res.sendStatus(200);
    } catch(e){ res.status(500).send('error'); }
});

router.get("/payhere-notify", (req, res) => {
  res.status(200).json({ ok: true, msg: "PayHere notify endpoint is reachable (GET ping)" });
});

module.exports = router;
