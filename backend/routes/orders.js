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

router.post('/create', async (req,res)=>{
    const { userId, items, subtotal, discount=0, shipping=0 } = req.body;
    const total = subtotal - discount + shipping;
    const order = new Order({ userId, items, subtotal, discount, shipping, total, paymentStatus:'pending' });
    await order.save();
    res.json({ orderId: order._id, total });
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

module.exports = router;