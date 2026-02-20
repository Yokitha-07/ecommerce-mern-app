import React, { useEffect, useState } from 'react';
export default function Filters({ onChange }) { const [category, setCategory] = useState(''); const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState(''); const [brand, setBrand] = useState('');
const [inStock, setInStock] = useState(false);

useEffect(() => { onChange({
category: category || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, brand: brand || undefined,
inStock: inStock ? true : undefined
});
}, [category, minPrice, maxPrice, brand, inStock]);

return (
<div className="p-4 border rounded">
<h3 className="font-semibold mb-3">Filters</h3>
<div className="mb-3">
<label className="block text-sm">Category</label>
<input value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Electronics" />
</div>

<div className="mb-3">
<label className="block text-sm">Price range</label>
<div className="flex gap-2">
<input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="w-1/2 border p-2 rounded" />
<input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="w-1/2 border p-2 rounded" />
</div>
</div>

<div className="mb-3">
<label className="block text-sm">Brand</label>
<input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border p-2 rounded" placeholder="Brand name" />
</div>

<div className="mb-3">
<label className="inline-flex items-center">
<input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
<span className="ml-2 text-sm">In stock only</span>
</label>
</div>
</div>
);
}
