import React, { useEffect, useState } from 'react';

export default function WishlistPage() { const [items, setItems] = useState([]); useEffect(() => {
const raw = localStorage.getItem('wishlist'); if (raw) setItems(JSON.parse(raw));
}, []);

function remove(id) {
const newItems = items.filter(i => i._id !== id); setItems(newItems);
localStorage.setItem('wishlist', JSON.stringify(newItems));
}

return (
<div className="container mx-auto p-4">
<h2 className="text-2xl font-bold mb-4">Wishlist</h2>
{items.length === 0 ? <div>No items in wishlist</div> : (
<div className="grid md:grid-cols-3 gap-4">
{items.map(it => (
<div className="border p-3 rounded" key={it._id}>
<img src={it.images?.[0]} alt={it.name} className="w-full h-36 object-cover rounded mb-2"/>
<div className="font-semibold">{it.name}</div>
<div className="mt-2"> ${it.price.toFixed(2)}</div>
<button onClick={() => remove(it._id)} className="mt-2 border px-3 py-1 rounded">Remove</button>
</div>

))}
</div>
)}
</div>
);
}