
import React from "react";
import { Link } from "react-router-dom";

function getCartKey() {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  const id = u?._id || u?.id || u?.email;
  return id ? `cart_${String(id).toLowerCase()}` : "cart_guest";
}

function getWishlistKey() {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  const id = u?._id || u?.id || u?.email;
  return id ? `wishlist_${String(id).toLowerCase()}` : "wishlist_guest";
}

export default function ProductCard({ product }) {
  const v0 = product?.variants?.[0];

  const price = Number(product?.price ?? v0?.price ?? product?.basePrice ?? 0);
  const original = Number(product?.originalPrice ?? v0?.originalPrice ?? price);

  const img =
    product?.images?.[0] ||
    v0?.images?.[0] ||
    "https://picsum.photos/seed/product/600/400";

  const firstSize =
    v0?.sizes?.find(s => Number(s.stock) > 0) || v0?.sizes?.[0] || null;

  const canQuickAdd = Boolean(product?._id && v0 && firstSize && Number(firstSize.stock) > 0);


  function addToCart(e) {
  e.stopPropagation();
  e.preventDefault();
  if (!canQuickAdd) return;

  const key = getCartKey();
  const cart = JSON.parse(localStorage.getItem(key) || "[]");

  const item = {
    _id: product._id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    productId: product._id,
    variantColor: v0.color,
    size: firstSize.sizeLabel,
    sizeLabel: firstSize.sizeLabel,
    sku: firstSize.sku,
    image: img,
    price,
    qty: 1,
  };

  const existingIdx = cart.findIndex(
    (i) =>
      (i.productId || i._id) === product._id &&
      i.variantColor === item.variantColor &&
      (i.sizeLabel || i.size) === item.sizeLabel &&
      i.sku === item.sku
  );

  if (existingIdx >= 0) {
    cart[existingIdx].qty = Math.min(999, Number(cart[existingIdx].qty || 1) + 1);
  } else {
    cart.push(item);
  }

  localStorage.setItem(key, JSON.stringify(cart));
  alert("Added to cart");

  // optional: so Cart page can auto-refresh if it's open
  window.dispatchEvent(new CustomEvent("cart_updated"));
}

function addToWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    const key = getWishlistKey();
    const wl = JSON.parse(localStorage.getItem(key) || "[]");

    const exists = wl.some((i) => (i.productId || i._id) === product._id);
    if (exists) {
      alert("Already in wishlist");
      return;
    }

    wl.push({
      _id: product._id,
      productId: product._id,
      name: product.name,
      brand: product.brand,
      image: img,
      images: [img],
      price: Number(price || 0),
    });

    localStorage.setItem(key, JSON.stringify(wl));
    alert("Added to wishlist");
    window.dispatchEvent(new CustomEvent("wishlist_updated"));
  }

  return (
    <div className="border rounded p-3 hover:shadow flex flex-col">
      <Link to={`/product/${product._id}`} className="block">
        <img
          src={img}
          alt={product.name}
          className="w-full h-40 object-cover rounded"
        />

        <div className="mt-2">
          <div className="font-semibold">{product.name}</div>
          <div className="text-sm text-gray-500">{product.brand}</div>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-bold">Rs. {price.toFixed(2)}</span>
            {original > price && (
              <span className="text-sm text-gray-500 line-through">
                Rs. {original.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <button
          type="button"
          onClick={addToCart}
          disabled={!canQuickAdd}
          className={`w-full text-sm px-3 py-2 rounded border ${
            canQuickAdd
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {canQuickAdd ? "Add to cart" : "View details"}
        </button>
      </div>
       <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="border rounded py-2 text-sm hover:bg-gray-100"
          onClick={addToWishlist}
        >
          Wishlist
        </button>

        <Link
          to={`/product/${product._id}`}
          className="bg-green-600 text-white rounded py-2 text-sm text-center hover:bg-green-700"
        >
          View
        </Link>
      </div>
    </div>
  );
}
