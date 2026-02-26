import React, { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) { 
    const [q, setQ] = useState('');
    useEffect(() => {
        const t = setTimeout(() => onSearch(q), 450); 
        return () => clearTimeout(t);
    }, [q]);

    return (
        <div className="mb-4">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="w-full border p-3 rounded" />
        </div>
    );
}