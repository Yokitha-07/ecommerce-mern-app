import React, { useEffect, useState } from 'react'; 
import Filters from '../components/Filters';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar'; 
import { API } from '../api';


export default function Products() {
    const [products, setProducts] = useState([]); 
    const [filters, setFilters] = useState({}); 
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { 
        fetchProducts();
// eslint-disable-next-line
    }, [filters, page, sort]);

    async function fetchProducts() {
  try {
    setLoading(true);

    const qs = new URLSearchParams();

    // ✅ only add filters if they have real values
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === "string" && value.trim() === "") return;
      if (value === "undefined") return;
      qs.set(key, String(value));
    });

    qs.set("page", String(page));
    qs.set("limit", "24");
    qs.set("sort", sort || "");

    const url = `${API}/api/products?${qs.toString()}`;

    const res = await fetch(url);

    // ✅ if backend returns error, show it
    if (!res.ok) {
      const errText = await res.text();
      console.log("API error:", res.status, errText);
      setProducts([]);
      return;
    }

    const json = await res.json();
    setProducts(Array.isArray(json.data) ? json.data : []);
  } catch (e) {
    console.log(e);
    setProducts([]);
  } finally {
    setLoading(false);
  }
}

    return (
    <div className="container mx-auto p-4">
        <SearchBar onSearch={q => setFilters(prev => ({ ...prev, search: q }))}
    />
        <div className="flex gap-6">
            <aside className="w-72">
                <Filters onChange={f => { setFilters(f); setPage(1); }} />
            </aside>
            <main className="flex-1">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">Showing {products.length}
                results</div>
                    <div>
                        <select className="border p-2 rounded" value={sort} onChange={e=> setSort(e.target.value)}>
                            <option value="">Sort</option>
                            <option value="price_asc">Price: low to high</option>
                            <option value="price_desc">Price: high to low</option>
                            <option value="newest">Newest</option>
                            <option value="best_selling">Best selling</option>
                        </select>
                    </div>
                </div>

                {loading ? <div>Loading...</div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                )}
            </main>
        </div>
    </div>
    );
}