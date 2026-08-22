import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, MapPin, ShoppingBag, Zap, Truck, BadgeCheck } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import { api, normalizeProduct } from "../services/api.js";
import Rating from "../components/Rating.jsx";
import SellerCard from "../components/SellerCard.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const { products, addToCart, user, customerOrders, refreshCustomerData } = useApp();
  const navigate = useNavigate();
  const productFromList = products.find((p) => p.id === id);
  const [product, setProduct] = useState(productFromList || null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(!productFromList);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    api.getProduct(id)
      .then((res) => {
        if (alive) setProduct(normalizeProduct(res.data.product));
      })
      .catch((error) => console.error(error))
      .finally(() => alive && setLoading(false));

    api.getReviews(id)
      .then((res) => {
        if (alive) {
          setReviews((res.data.reviews || []).map((r) => ({
            ...r,
            id: r._id,
            customerName: r.user?.name || "Customer",
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "",
          })));
        }
      })
      .catch((error) => console.error(error));

    return () => { alive = false; };
  }, [id]);

  const reviewOrder =
  user?.role === "customer"
    ? customerOrders.find((order) =>
        order.products?.some(
          (item) =>
            item.productId === product?.id &&
            item.status === "Delivered"
        )
      )
    : null;

  if (loading && !product) {
    return <div className="container empty-state"><h3>Loading product...</h3></div>;
  }

  if (!product) {
    return (
      <div className="container empty-state">
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to marketplace
        </Link>
      </div>
    );
  }

  const seller = product.seller || null;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const images = product.images?.length ? product.images : [product.image];

  async function handleAdd() {
    try {
      await addToCart(product.id, qty);
    } catch (error) {
      window.alert(error.message);
    }
  }

  async function handleBuyNow() {
    try {
      await addToCart(product.id, qty);
      navigate("/cart");
    } catch (error) {
      window.alert(error.message);
    }
  }
  
  async function handleSubmitReview(e) {
  e.preventDefault();

  if (!reviewOrder) {
    setReviewError("You can only review this product after it has been delivered.");
    return;
  }

  setReviewError("");
  setReviewLoading(true);

  try {
    await api.createReview(product.id, {
      rating: reviewRating,
      comment: reviewComment,
      orderId: reviewOrder.id,
    });

    setReviewComment("");

    // Reload reviews so the new review appears immediately
    const res = await api.getReviews(product.id);

    setReviews(
      (res.data.reviews || []).map((r) => ({
        ...r,
        id: r._id,
        customerName: r.user?.name || "Customer",
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-IN")
          : "",
      }))
    );

    // Refresh dashboard/order data
    await refreshCustomerData();
  } catch (error) {
    setReviewError(error.message);
  } finally {
    setReviewLoading(false);
  }
}

  return (
    <div className="container">
      <div className="breadcrumb" style={{ marginTop: 24 }}>
        <Link to="/">Home</Link>
        <ChevronRight size={13} />
        <Link to="/products">Products</Link>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </div>

      <div className="pd-layout" style={{ marginTop: 18 }}>
        <div>
          <div className="pd-gallery-main">
            <img src={images[activeImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="pd-gallery-thumbs">
              {images.map((img, i) => (
                <button key={img} type="button" className={i === activeImage ? "active" : ""} onClick={() => setActiveImage(i)}>
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="pd-category">{product.category}</span>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-meta-row">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
            <span className="divider-dot" />
            <span className="pd-distance">
              <MapPin size={14} /> {product.distance || product.city}
            </span>
            <span className="divider-dot" />
            {seller?.name || seller?.storeName || "Local seller"}
          </div>

          <div className="pd-price">₹{product.price} <span>/ {product.unit}</span></div>
          <p className="pd-description">{product.description}</p>

          <div className="pd-qty-row">
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <span className="pd-stock">{product.stock} in stock</span>
          </div>

          <div className="pd-actions">
            <button type="button" className="btn btn-secondary" onClick={handleAdd}>
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
              <Zap size={16} /> Buy Now
            </button>
          </div>

          <div className="pd-badges">
            <span className="stamp"><BadgeCheck size={13} /> 100% homemade</span>
            {product.deliveryAvailable && <span className="stamp stamp-alt"><Truck size={13} /> Delivery available</span>}
          </div>
        </div>
      </div>

      <div id="seller-info" className="section" style={{ paddingBottom: 20 }}>
        <h2 className="pd-section-title">About the Seller</h2>
        {seller ? (
          <SellerCard seller={{
            id: seller._id,
            name: seller.storeName || seller.name,
            avatar: seller.profileImage || "",
            location: seller.location?.city || product.city,
            distance: product.distance || "",
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            joined: seller.createdAt ? new Date(seller.createdAt).getFullYear() : "",
          }} />
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>Seller information unavailable.</p>
        )}
      </div>

     <div className="section" style={{ paddingTop: 0 }}>
  <h2 className="pd-section-title">Customer Reviews</h2>

  {reviewOrder && (
    <form
      className="card form-card"
      style={{ marginBottom: 20 }}
      onSubmit={handleSubmitReview}
    >
      <h3 style={{ marginTop: 0 }}>Leave a Review</h3>

      {reviewError && (
        <p style={{ color: "var(--clay)" }}>{reviewError}</p>
      )}

      <div className="form-field" style={{ marginTop: 14 }}>
        <label>Rating</label>
        <select
          value={reviewRating}
          onChange={(e) => setReviewRating(Number(e.target.value))}
        >
          <option value={5}>★★★★★ — 5</option>
          <option value={4}>★★★★ — 4</option>
          <option value={3}>★★★ — 3</option>
          <option value={2}>★★ — 2</option>
          <option value={1}>★ — 1</option>
        </select>
      </div>

      <div className="form-field" style={{ marginTop: 14 }}>
        <label>Comment</label>
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        disabled={reviewLoading}
      >
        {reviewLoading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )}

  {reviews.length === 0 ? (
    <p style={{ color: "var(--ink-soft)" }}>
      No reviews yet for this product.
    </p>
  ) : (
    reviews.map((r) => <ReviewCard key={r.id} review={r} />)
  )}
</div>

      {related.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <h2 className="pd-section-title">You may also like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
