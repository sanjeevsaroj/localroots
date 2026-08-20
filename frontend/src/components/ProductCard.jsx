import { Link } from "react-router-dom";
import { Heart, MapPin, ShoppingBag } from "lucide-react";
import Rating from "./Rating.jsx";
import Button from "./Button.jsx";
import { sellers } from "../data/sellers.js";
import { useApp } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const seller = product.seller || sellers.find((s) => s.id === product.sellerId);
  const isWished = wishlist.includes(product.id);

  async function handleAdd() {
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="product-card">
      <div className="product-card-img">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <button
          type="button"
          className="product-card-wish"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={isWished}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} fill={isWished ? "currentColor" : "none"} />
        </button>
        <span className="product-card-distance">
          <MapPin size={11} /> {product.distance}
        </span>
      </div>
      <div className="product-card-body">
        <span className="product-card-seller">{seller?.name}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <div className="product-card-meta">
          <span className="product-card-price">
            ₹{product.price} <span>/ {product.unit}</span>
          </span>
          <Rating value={product.rating} />
        </div>
        <div className="product-card-actions">
          <Button variant="ghost" as={Link} to={`/products/${product.id}`}>
            View
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            <ShoppingBag size={15} /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
