import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import TryOn from "../components/TryOn";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  if (!product) return <div>Loading...</div>;

  // Use first variant (for now)
  const variant = product.variants?.[0];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      {/* ✅ 3D MODEL HERE */}
      {variant?.model3d && (
        <model-viewer
          src={variant.model3d}
          camera-controls
          auto-rotate
          style={{ width: "400px", height: "400px" }}
        />
      )}

      <p className="mt-4">{product.description}</p>
      <p className="mt-2 font-semibold">Rs. {product.basePrice}</p>
      <div className="mt-6">
        <TryOn overlayText={product.name} />
    </div>
    </div>
    
    
  );
}