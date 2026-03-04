import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import TryOn from "../components/TryOn";
import { Helmet } from "react-helmet-async";


function getWishlistKey() {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  const id = u?._id || u?.id || u?.email;
  return id ? `wishlist_${String(id).toLowerCase()}` : "wishlist_guest";
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);

        const v0 = data?.variants?.[0];
        const firstInStockSize =
          v0?.sizes?.find(s => Number(s.stock) > 0)?.sizeLabel || v0?.sizes?.[0]?.sizeLabel || "";

        setSelectedColor(v0?.color || "");
        setSelectedSize(firstInStockSize);
      });
  }, [id]);

  const variants = product?.variants || [];

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(v => v.color === selectedColor) || variants[0];
  }, [variants, selectedColor]);

  const sizeOptions = selectedVariant?.sizes || [];

  // keep selected size valid when switching colors
  useEffect(() => {
    if (!selectedVariant) return;
    if (!sizeOptions.length) {
      setSelectedSize("");
      return;
    }

    const stillExists = sizeOptions.some(s => s.sizeLabel === selectedSize);
    if (stillExists) return;

    const firstInStock =
      sizeOptions.find(s => Number(s.stock) > 0)?.sizeLabel || sizeOptions[0]?.sizeLabel || "";
    setSelectedSize(firstInStock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.color]);

  const selectedSizeObj = useMemo(() => {
    if (!selectedVariant || !selectedSize) return null;
    return sizeOptions.find(s => s.sizeLabel === selectedSize) || null;
  }, [selectedVariant, selectedSize, sizeOptions]);

  const price = Number(selectedVariant?.price ?? product?.basePrice ?? 0);
  const img = selectedVariant?.images?.[0] || "https://picsum.photos/seed/product/600/400";
  const stock = Number(selectedSizeObj?.stock ?? 0);
  const sku = selectedSizeObj?.sku || "";
  const canAddToCart = Boolean(product?._id && selectedVariant?.color && selectedSizeObj && stock > 0);
  const modelSrc = selectedVariant?.model3d || "";

  function addToCart() {
    if (!canAddToCart) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const item = {
      // keep backward-compat fields some UIs rely on
      _id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,

      // Task 8 order/cart fields
      productId: product._id,
      variantColor: selectedVariant.color,
      size: selectedSizeObj.sizeLabel,
      sizeLabel: selectedSizeObj.sizeLabel,
      sku,
      image: img,
      price,
      qty: 1,
    };

    const existingIdx = cart.findIndex(
      i =>
        (i.productId || i._id) === product._id &&
        i.variantColor === item.variantColor &&
        (i.sizeLabel || i.size) === item.sizeLabel &&
        i.sku === item.sku
    );

    if (existingIdx >= 0) {
      cart[existingIdx].qty = Number(cart[existingIdx].qty || 1) + 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  }

  function addToWishlist() {
  if (!product?._id) return;

  const key = getWishlistKey();
  const wl = JSON.parse(localStorage.getItem(key) || "[]");

  const exists = wl.find(
    (i) =>
      (i.productId || i._id) === product._id &&
      i.variantColor === selectedVariant?.color &&
      (i.sizeLabel || i.size) === selectedSizeObj?.sizeLabel
  );

  if (exists) {
    alert("Already in wishlist");
    return;
  }

  const item = {
    _id: product._id,
    productId: product._id,
    name: product.name,
    brand: product.brand,
    description: product.description,

    // ✅ IMPORTANT: store both, so any UI works
    image: img,
    images: [img],

    // ✅ IMPORTANT: store price (not only basePrice)
    price: Number(price || product.basePrice || 0),

    variantColor: selectedVariant?.color || "",
    sizeLabel: selectedSizeObj?.sizeLabel || "",
    sku: sku || "",
  };

  wl.push(item);
  localStorage.setItem(key, JSON.stringify(wl));
  alert("Added to wishlist");
  window.dispatchEvent(new CustomEvent("wishlist_updated"));
}

  if (!product) return <div>Loading...</div>;

  const title = `${product.name} | Spacexp`;
  const description = product.description || "Shop this product on Spacexp.";
  const url = `${window.location.origin}/product/${product._id || id}`;
  const imageUrl = img;
  const currency = "LKR";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: [imageUrl],
    sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Spacexp",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: price.toFixed(2),
      availability:
        stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* OpenGraph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Product structured data */}
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      {/* ✅ 3D / AR Try-On via <model-viewer> */}
      <div className="w-full flex flex-col items-center mb-6">
        {modelSrc ? (
          <>
            <model-viewer
              src={modelSrc}
              alt={`${product.name} 3D view`}
              camera-controls
              auto-rotate
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              touch-action="pan-y"
              loading="lazy"
              reveal="auto"
              style={{ width: "100%", maxWidth: "480px", height: "360px" }}
            />
            <p className="mt-2 text-xs text-gray-500">
              Tap and drag to rotate. On mobile, use the AR button to view it in your space.
            </p>
          </>
        ) : (
          <div className="w-full max-w-md p-4 rounded border border-dashed border-gray-300 text-center text-sm text-gray-500">
            3D / AR try-on is not available for this variant yet.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Product Image */}
        <div>
          {img && (
            <img
              src={img}
              alt={product.name}
              className="w-full h-auto rounded-lg border"
            />
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="mt-4 text-gray-700">{product.description}</p>
          <p className="mt-2 text-2xl font-bold">Rs. {price.toFixed(2)}</p>
          {selectedVariant?.originalPrice && selectedVariant.originalPrice > price && (
            <p className="text-sm text-gray-500 line-through">
              Rs. {selectedVariant.originalPrice.toFixed(2)}
            </p>
          )}

          {/* ✅ Variant selection - ALWAYS SHOW */}
          <div className="mt-6">
            <div className="font-semibold mb-2">Color</div>
            {variants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {variants.map(v => {
                  const active = v.color === selectedVariant?.color;
                  return (
                    <button
                      key={v.color}
                      type="button"
                      onClick={() => setSelectedColor(v.color)}
                      className={`border-2 px-4 py-2 rounded text-sm font-medium transition ${
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-300 hover:border-gray-500"
                      }`}
                      title={v.color}
                    >
                      {v.color}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No color variants available</p>
            )}
          </div>

          {/* ✅ Size selection - ALWAYS SHOW */}
          <div className="mt-6">
            <div className="font-semibold mb-2">Size</div>
            {sizeOptions.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(s => {
                    const sStock = Number(s.stock ?? 0);
                    const disabled = sStock <= 0;
                    const active = s.sizeLabel === selectedSize;
                    return (
                      <button
                        key={s.sku || s.sizeLabel}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSize(s.sizeLabel)}
                        className={`border-2 px-4 py-2 rounded text-sm font-medium transition ${
                          active
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-300 hover:border-gray-500"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={disabled ? "Out of stock" : `${sStock} in stock`}
                      >
                        {s.sizeLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  {selectedSizeObj ? (
                    <>
                      <span className="mr-4 font-medium">Stock: {stock}</span>
                      {sku && <span className="mr-4">SKU: {sku}</span>}
                      {selectedSizeObj.countrySizes && (
                        <div className="mt-2 text-xs">
                          {selectedSizeObj.countrySizes.US && `US: ${selectedSizeObj.countrySizes.US} `}
                          {selectedSizeObj.countrySizes.UK && `UK: ${selectedSizeObj.countrySizes.UK} `}
                          {selectedSizeObj.countrySizes.EU && `EU: ${selectedSizeObj.countrySizes.EU} `}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">Please select a size</span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No sizes available</p>
            )}
          </div>

          {/* ✅ Add to Cart & Wishlist Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={addToCart}
              disabled={!canAddToCart}
              className={`w-full px-6 py-3 rounded font-semibold text-white transition ${
                canAddToCart
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {canAddToCart ? "Add to Cart" : "Select Color & Size"}
            </button>

            <button
              type="button"
              onClick={addToWishlist}
              className="w-full px-6 py-3 rounded font-semibold border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TryOn overlayText={product.name} />
      </div>
    </div>
  );
}
