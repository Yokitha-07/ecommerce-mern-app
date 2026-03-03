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

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const promoRoutes = require('./routes/promo');
const userRoutes = require('./routes/users');


const app = express();
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/contact', contactRoutes);
app.use('/api/products', productsRoutes); 
app.use('/api/reviews', reviewsRoutes); 
app.use('/api/wishlist', wishlistRoutes); 
app.use('/api/ads', adsRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/users', userRoutes);

app.use("/api/payhere", require("./routes/payhere"));



app.get("/", (req, res) => {
  res.send("API is running ✅");
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));


