import React, { useState } from 'react'; import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) { const [open, setOpen] = useState(false);

    const discount = product.originalPrice ?
Math.round((1 - (product.price / product.originalPrice)) * 100) : 0;

return (
<div className="border rounded p-3 flex flex-col">
<div className="relative">
<img className="w-full h-44 object-cover rounded" src={product.images?.[0] || 'https://picsum.photos/seed/p/400/300'} alt={product.name} />
{product.isDeal && <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">DEAL</div>}
</div>

<div className="mt-3 flex-1">
<div className="font-semibold text-sm">{product.name}</div>
<div className="text-xs text-gray-500">{product.brand}</div>
</div>

<div className="mt-3 flex items-center justify-between">
<div>
<div className="font-bold">${product.price.toFixed(2)}</div>
{product.originalPrice && <div className="text-xs line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>}
{discount > 0 && <div className="text-xs text-red-500">{discount}% OFF</div>}
</div>

<div className="flex flex-col gap-2">
<button onClick={() => setOpen(true)} className="bg-blue-600 text- white px-3 py-1 rounded text-xs">Quick view</button>
<button onClick={() => {
// add to cart — keep it simple: localStorage cart
const cart = JSON.parse(localStorage.getItem('cart') || '[]'); cart.push({ ...product, qty: 1 }); localStorage.setItem('cart', JSON.stringify(cart)); alert('Added to cart');
}} className="border px-3 py-1 rounded text-xs">Add</button>
</div>

</div>
{open && <QuickViewModal product={product} onClose={() => setOpen(false)} />}
</div>
);
}
