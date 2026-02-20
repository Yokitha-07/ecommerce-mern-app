import React, { useEffect, useState } from 'react'; 
import { API } from '../api';

function Countdown({ end }) {
    const [timeLeft, setTimeLeft] = useState(calc(end)); 
    function calc(endTime) {
        const diff = new Date(endTime) - new Date(); 
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000); 
        const s = Math.floor((diff % 60000) / 1000); 
        return
`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    useEffect(() => {
        const id = setInterval(() => setTimeLeft(calc(end)), 1000); 
        return () => clearInterval(id);
    }, [end]);
    return <span className="text-red-600 font-semibold">{timeLeft}</span>;
}

export default function DealsSection() { 
    const [deals, setDeals] = useState([]);

    useEffect(() => { 
        fetch(`${API}/api/products?isDeal=true&limit=8`)
            .then(r => r.json())
            .then(json => setDeals(json.data || []))
            .catch(err => console.error(err));
    }, []);

return (
    <div className="my-6">
        <h2 className="text-2xl font-bold mb-3">Flash Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deals.map(d => (
                <div key={d._id} className="border p-3 rounded">
                    <img src={d.images?.[0]} alt={d.name} className="w-full h-36 object-cover rounded mb-2" />
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-sm">{d.name}</div>
                            <div className="text-xs text-gray-500">{d.brand}</div>
                        </div>
                        <Countdown end={d.dealEnd} />
                    </div>
                    <div className="mt-2">
                        <div className="font-bold">${d.price.toFixed(2)}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
}