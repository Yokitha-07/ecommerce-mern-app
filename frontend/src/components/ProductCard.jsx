// import React, { useState } from 'react'; 
// import QuickViewModal from './QuickViewModal';

// export default function ProductCard({ product }) { 
//     const [open, setOpen] = useState(false);

//     const discount = product.originalPrice ?
// Math.round((1 - (product.price / product.originalPrice)) * 100) : 0;

// return (
//     <div className="border rounded p-3 flex flex-col">
//         <div className="relative">
//             <img className="w-full h-44 object-cover rounded" src={product.images?.[0] || 'https://picsum.photos/seed/p/400/300'} alt={product.name} />
//             {product.isDeal && <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">DEAL</div>}
//         </div>

//     <div className="mt-3 flex-1">
//         <div className="font-semibold text-sm">{product.name}</div>
//         <div className="text-xs text-gray-500">{product.brand}</div>
//     </div>

//     <div className="mt-3 flex items-center justify-between">
//         <div>
//             <div className="font-bold">${product.price.toFixed(2)}</div>
// {product.originalPrice && <div className="text-xs line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>}
// {discount > 0 && <div className="text-xs text-red-500">{discount}% OFF</div>}
// </div>

// <div className="flex flex-col gap-2">
// <button onClick={() => setOpen(true)} className="bg-blue-600 text- white px-3 py-1 rounded text-xs">Quick view</button>
// <button onClick={() => {
// // add to cart — keep it simple: localStorage cart
// const cart = JSON.parse(localStorage.getItem('cart') || '[]'); cart.push({ ...product, qty: 1 }); localStorage.setItem('cart', JSON.stringify(cart)); alert('Added to cart');
// }} className="border px-3 py-1 rounded text-xs">Add</button>
// </div>

// </div>
// {open && <QuickViewModal product={product} onClose={() => setOpen(false)} />}
// </div>
// );
// }

import React from "react";
import { Link } from "react-router-dom";

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

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

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
      i =>
        (i.productId || i._id) === product._id &&
        i.variantColor === item.variantColor &&
        (i.sizeLabel || i.size) === item.sizeLabel &&
        i.sku === item.sku
    );

    if (existingIdx >= 0) {
      cart[existingIdx].qty = Number(cart[existingIdx].qty || 1) + 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
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
    </div>
  );
}
