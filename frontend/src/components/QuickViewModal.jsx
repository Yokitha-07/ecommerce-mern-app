import React from 'react';

export default function QuickViewModal({ product, onClose }) { return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg- black/40">
<div className="bg-white p-4 rounded w-11/12 md:w-3/4 lg:w-1/2">
<div className="flex justify-between items-start mb-3">
<h3 className="text-lg font-bold">{product.name}</h3>
<button onClick={onClose} className="text-gray-600">X</button>
</div>

<div className="flex gap-4">
<img src={product.images?.[0]} alt="" className="w-1/3 object-cover rounded" />
<div className="flex-1">
<p className="text-sm text-gray-700">{product.description}</p>
<div className="mt-3">
<div className="font-bold">${product.price.toFixed(2)}</div>
{product.originalPrice && <div className="text-xs line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>}
</div>

<div className="mt-4 flex gap-2">
<button onClick={() => {
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
cart.push({ ...product, qty: 1 }); localStorage.setItem('cart', JSON.stringify(cart)); alert('Added to cart');
}} className="bg-green-600 text-white px-4 py-2 rounded">Add to
cart</button>

<button onClick={() => {
const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
// avoid duplicates
if (!wl.find(i => i._id === product._id)) { wl.push(product);
localStorage.setItem('wishlist', JSON.stringify(wl)); alert('Added to wishlist');
} else {
alert('Already in wishlist');

}
}} className="border px-4 py-2 rounded">Wishlist</button>
</div>
</div>
</div>
</div>
</div>
);
}