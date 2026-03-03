import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = useMemo(
    () => (searchParams.get("status") || "").toLowerCase(),
    [searchParams]
  );

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
  if (status === "success") {
    const orderIdParam = searchParams.get("order_id");
    const stored = localStorage.getItem("last_order_id");

    setOrderId(orderIdParam || stored || "");

    // ✅ Remove correct cart key
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const id = u?._id || u?.id || u?.email;
    const cartKey = id ? `cart_${id}` : "cart_guest";

    localStorage.removeItem(cartKey);
    localStorage.removeItem("cart"); // optional fallback

    // console.log("Cart cleared:", cartKey);

    // Redirect to cart so it reloads clean
    setTimeout(() => {
      window.location.href = "/cart";
    }, 100);
  }
}, [status, searchParams]);

  
  const isSuccess = status === "success";
  const isCancel = status === "cancel";

  // fallback if status missing/wrong
  const title = isSuccess
    ? "Payment Successful!"
    : isCancel
    ? "Payment Cancelled"
    : "Payment Result";

  const icon = isSuccess ? "✅" : isCancel ? "❌" : "ℹ️";
  

  return (
    <div className="container mx-auto p-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">{icon}</div>

        <h1
          className={`text-3xl font-bold mb-4 ${
            isSuccess
              ? "text-green-600"
              : isCancel
              ? "text-red-600"
              : "text-gray-700"
          }`}
        >
          {title}
        </h1>

        <p className="text-gray-600 mb-6">
          {isSuccess
            ? "Thank you for your purchase. Your order has been confirmed."
            : isCancel
            ? "Your payment was cancelled. No charges were made."
            : "We couldn't determine your payment status."}
        </p>

        {isSuccess && orderId && (
          <div className="bg-gray-100 rounded p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID:</p>
            <p className="font-mono font-semibold">{orderId}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {isCancel && (
            <button
              onClick={() => navigate("/cart")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Cart
            </button>
          )}

          <button
            onClick={() => navigate("/products")}
            className={`px-6 py-2 rounded ${
              isCancel
                ? "border border-gray-300 hover:bg-gray-50 text-gray-700"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Continue Shopping
          </button>

          {isSuccess && (
            <button
              onClick={() => navigate("/orders")}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded"
            >
              View Orders
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
