import React, { useState } from 'react';
import { API } from '../api';

export default function Checkout({ token }) {
    const [cart] = useState(JSON.parse(localStorage.getItem('cart')||'[]'));
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);

    function pay() {
        fetch(`${API}/api/orders/create`, {
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({ items:cart, subtotal })
        }).then(r=>r.json()).then(order=>{
            const payment = {
                sandbox:true,
                merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
                return_url: window.location.origin + "/pay/success",
                cancel_url: window.location.origin + "/pay/cancel",
                notify_url: `${API}/api/orders/payhere-notify`,
                order_id: order.orderId,
                items: "Cart Checkout",
                amount: subtotal.toFixed(2),
                currency: "LKR",
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                phone: "0771234567",
                address: "Colombo",
                city: "Colombo",
                country: "Sri Lanka"
            };
            window.payhere.startPayment(payment);
        });
    }

    return (
        <div className="container p-6">
            <h2 className="text-2xl mb-4">Checkout</h2>
            <div className="mb-4">Total: Rs. {subtotal.toFixed(2)}</div>
            <button onClick={pay} className="bg-green-600 text-white px-4 py-2 rounded">
                Pay with PayHere
            </button>
        </div>
    );
}
