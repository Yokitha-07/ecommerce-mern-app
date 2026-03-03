import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api";

function getCartKey() {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  const id = u?._id || u?.id || u?.email;
  return id ? `cart_${id}` : "cart_guest";
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  // function loadCart() {
  //   try {
  //     const stored = JSON.parse(localStorage.getItem("cart") || "[]");
  //     setItems(Array.isArray(stored) ? stored : []);
  //     setError("");
  //   } catch (e) {
  //     console.error("Cart load error:", e);
  //     setError("Failed to load cart.");
  //     setItems([]);
  //   }
  // }

  function loadCart() {
  try {
    const key = getCartKey();
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    setItems(Array.isArray(stored) ? stored : []);
    setError("");
  } catch (e) {
    console.error("Cart load error:", e);
    setError("Failed to load cart.");
    setItems([]);
  }
}

  function updateQty(index, qty) {
    const q = Math.max(1, Math.min(999, Number(qty) || 1));
    const next = [...items];
    next[index] = { ...next[index], qty: q };
    setItems(next);
    saveCart(next);
  }

  function removeItem(index) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    saveCart(next);
  }

  // function saveCart(cartItems) {
  //   try {
  //     localStorage.setItem("cart", JSON.stringify(cartItems));
  //     setError("");
  //   } catch (e) {
  //     console.error("Cart save error:", e);
  //     setError("Failed to save cart.");
  //   }
  // }

  function saveCart(cartItems) {
  try {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cartItems));
    setError("");
  } catch (e) {
    console.error("Cart save error:", e);
    setError("Failed to save cart.");
  }
}

  // function clearCart() {
  //   setItems([]);
  //   localStorage.removeItem("cart");
  // }

  function clearCart() {
  const key = getCartKey();
  setItems([]);
  localStorage.removeItem(key);
}

  // Validate cart items before checkout
  function validateCart() {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return false;
    }

    for (const item of items) {
      if (!item.productId && !item._id) {
        setError("Some items are missing product information.");
        return false;
      }
      if (!item.price || item.price <= 0) {
        setError("Some items have invalid prices.");
        return false;
      }
      if (!item.qty || item.qty <= 0) {
        setError("Some items have invalid quantities.");
        return false;
      }
    }

    return true;
  }

  function handleCheckout() {
    if (!validateCart()) return;

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      if (confirm("You need to login to checkout. Redirect to login?")) {
        navigate("/login");
      }
      return;
    }

    navigate("/checkout");
  }

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
    0
  );

  if (!items.length) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <p className="text-gray-600 mb-4">Your cart is currently empty.</p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => {
            const itemTotal = Number(item.price || 0) * Number(item.qty || 1);
            return (
              <div
                key={`${item.productId || item._id}-${item.sku || item.variantColor || idx}`}
                className="flex gap-4 border rounded p-4 items-center hover:shadow-md transition"
              >
                <Link to={`/product/${item.productId || item._id}`}>
                  <img
                    src={item.image || "https://picsum.photos/seed/cart/120/120"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded cursor-pointer"
                  />
                </Link>

                <div className="flex-1">
                  <Link to={`/product/${item.productId || item._id}`}>
                    <div className="font-semibold hover:text-blue-600 cursor-pointer">
                      {item.name}
                    </div>
                  </Link>
                  {item.brand && (
                    <div className="text-xs text-gray-500">{item.brand}</div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">
                    {item.variantColor && (
                      <span className="mr-3">
                        <span className="font-medium">Color:</span> {item.variantColor}
                      </span>
                    )}
                    {(item.sizeLabel || item.size) && (
                      <span className="mr-3">
                        <span className="font-medium">Size:</span> {item.sizeLabel || item.size}
                      </span>
                    )}
                    {item.sku && (
                      <span className="text-xs text-gray-400">SKU: {item.sku}</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 flex-wrap">
                    <div className="font-bold text-lg">
                      Rs. {itemTotal.toFixed(2)}
                    </div>
                    {item.price && item.qty > 1 && (
                      <div className="text-sm text-gray-500">
                        Rs. {Number(item.price).toFixed(2)} × {item.qty}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <label className="font-medium">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={item.qty || 1}
                        onChange={e => updateQty(idx, e.target.value)}
                        className="w-20 border rounded px-2 py-1 text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border rounded p-4 h-fit sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-semibold transition"
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>

          <Link
            to="/products"
            className="block text-center text-blue-600 hover:text-blue-800 mt-3 text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
