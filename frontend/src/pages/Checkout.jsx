import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';

function getCartKey() {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  const id = u?._id || u?.id || u?.email;
  return id ? `cart_${id}` : "cart_guest";
}


export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
  const src = "https://www.payhere.lk/lib/payhere.js";
  if (document.querySelector(`script[src="${src}"]`)) return;

  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.body.appendChild(s);

  return () => {
    // optional: keep it loaded (usually ok). If you want remove:
    // s.remove();
  };
}, []);

  // Form fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    postal_code: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const key = getCartKey();
    const storedCart = JSON.parse(localStorage.getItem(key) || '[]');
    if (!storedCart || storedCart.length === 0) {
      navigate('/cart');
      return;
    }

    setCart(storedCart);

    // Load user data if available
    fetch(`${API}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.log("auth/me returned non-JSON:", text);
    return { success: false };
  }
})
      .then(data => {
        if (data.success && data.user) {
          setFormData(prev => ({
            ...prev,
            email: data.user.email || prev.email,
            first_name: data.user.name?.split(' ')[0] || prev.first_name,
            last_name: data.user.name?.split(' ').slice(1).join(' ') || prev.last_name
          }));
        }
      })
      .catch(err => console.error('Failed to load user data:', err));
  }, [navigate]);

  
  // const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  const getItemPrice = (item) => {
    const raw =
      item.price ??
      item.variant?.price ??
      item.selectedVariant?.price ??
      item.basePrice ??
      0;

    // handles "Rs. 2,499" / "2,499"
    return Number(String(raw).replace(/[^0-9.]/g, "")) || 0;
  };

  const getItemQty = (item) =>
    Number(item.qty ?? item.quantity ?? item.count ?? 1) || 1;

  const subtotal = cart.reduce((sum, item) => {
    return sum + getItemPrice(item) * getItemQty(item);
  }, 0);

  const total = subtotal - discount + shipping;

  const itemCount = cart.reduce((n, item) => n + getItemQty(item), 0);

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validateForm() {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'country'];
    for (const field of required) {
      if (!formData[field] || formData[field].trim() === '') {
        setError(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  }

  async function applyPromoCode() {
  if (!promoCode.trim()) {
    setError('Please enter a promo code');
    return;
  }

  try {
    const token = localStorage.getItem('token'); // ✅ get token

    const res = await fetch(`${API}/api/promo/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ send token
      },
      body: JSON.stringify({ code: promoCode, amount: subtotal }),
    });

    const data = await res.json();

    if (data.success && data.valid) {
      setPromoApplied(data.promo);
      setDiscount(data.discount || 0);
      setError('');
    } else {
      setError(data.error || 'Invalid promo code');
      setPromoApplied(null);
      setDiscount(0);
    }
  } catch (err) {
    console.error('Promo code error:', err);
    setError('Failed to validate promo code');
  }
}

  async function handlePayment() {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setLoading(false);
        return;
      }

      // Prepare order items with proper structure
      const orderItems = cart.map(item => ({
        productId: item.productId || item._id,
        variantColor: item.variantColor || null,
        size: item.size || item.sizeLabel || null,
        sizeLabel: item.sizeLabel || item.size || null,
        sku: item.sku || null,
        price: getItemPrice(item),
        qty: getItemQty(item)
      }));

      // Create order
      const orderRes = await fetch(`${API}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          discount,
          shipping
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Check if PayHere is available
      if (typeof window.payhere === 'undefined') {
        setError('PayHere payment gateway is not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      const amount = total.toFixed(2);

      const hashRes = await fetch(`${API}/api/payhere/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderData.orderId,
          amount,
          currency: "LKR",
        }),
      });

      const hashData = await hashRes.json();
      if (!hashData.success) throw new Error(hashData.error || "Hash generation failed");

      // Prepare PayHere payment
      const payment = {
        sandbox: import.meta.env.VITE_PAYHERE_SANDBOX !== "false",
        merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
        return_url: `${import.meta.env.VITE_FRONTEND_URL}/pay/result?status=success&order_id=${orderData.orderId}`,
        cancel_url: `${import.meta.env.VITE_FRONTEND_URL}/pay/result?status=cancel&order_id=${orderData.orderId}`,
        notify_url: `https://ecommerce-mern-app-43id.onrender.com/api/orders/payhere-notify`,
        order_id: orderData.orderId,
        items: cart.map(i => i.name).join(", ").substring(0, 100) || "Cart Checkout",
        amount,
        currency: "LKR",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        hash: hashData.hash, // ✅ THIS IS THE KEY FIX
      };

    
      localStorage.setItem("last_order_id", orderData.orderId);
      
      // ✅ stop loading before redirecting out
      setLoading(false);

     const FRONT = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

      window.payhere.onCompleted = function (orderId) {
        setLoading(false);
        window.location.href = `${FRONT}/pay/result?status=success&order_id=${orderId}`;
      };
      window.payhere.onDismissed = function () {
        setLoading(false);
        window.location.href = `${FRONT}/pay/result?status=cancel&order_id=${orderData.orderId}`;
      };;

window.payhere.onError = function (error) {
  setLoading(false);
  setError(String(error || "PayHere error"));
};
      
      // Start PayHere payment
      window.payhere.startPayment(payment);

      // Clear cart after successful order creation (payment will be handled by PayHere)
      // Note: We'll clear cart on success page instead
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl mb-4">Checkout</h2>
        <p className="text-gray-600">Your cart is empty.</p>
        <button
          onClick={() => navigate('/cart')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 border rounded px-3 py-2"
                disabled={!!promoApplied}
              />
              <button
                onClick={applyPromoCode}
                disabled={!!promoApplied || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
              >
                {promoApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            {promoApplied && (
              <div className="mt-2 text-sm text-green-600">
                Promo code applied: {promoApplied.code} (-Rs. {discount.toFixed(2)})
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border rounded p-4 h-fit sticky top-4">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-semibold transition"
          >
            {loading ? 'Processing...' : 'Pay with PayHere'}
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="w-full mt-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
