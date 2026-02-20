const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const contactRoutes = require('./routes/contact');
require('dotenv').config();

const productsRoutes = require('./routes/products'); 
const reviewsRoutes = require('./routes/reviews'); 
const wishlistRoutes = require('./routes/wishlist'); 
const adsRoutes = require('./routes/ads');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/contact', contactRoutes);
app.use('/api/products', productsRoutes); 
app.use('/api/reviews', reviewsRoutes); 
app.use('/api/wishlist', wishlistRoutes); 
app.use('/api/ads', adsRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));


