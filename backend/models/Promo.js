const mongoose = require('mongoose');

const PromoSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    discountType: { type: String, enum: ['percent','fixed'], default: 'percent' },
    discountValue: Number,
    minAmount: Number,
    maxUses: Number,
    uses: { type: Number, default: 0 },
    firstTimeOnly: { type: Boolean, default: false },
    recurringCustomerDiscount: { type: Boolean, default: false },
    validFrom: Date,
    validTo: Date,
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Promo', PromoSchema);