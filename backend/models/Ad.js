const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({ 
    title: String,
    image: String, 
    link: String, 
    startDate: Date, 
    endDate: Date,
    active: { type: Boolean, default: true }, 
    priority: { type: Number, default: 0 }
});

module.exports = mongoose.model('Ad', AdSchema);
