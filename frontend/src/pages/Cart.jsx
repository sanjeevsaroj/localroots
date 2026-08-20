import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import CartItem from "../components/CartItem.jsx";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function Cart() {
  const { cart, products, cartTotal } = useApp();
  const navigate = useNavigate();

  const deliveryFee = cartTotal >= FREE_DELIVERY_THRESHOLD || cartTotal === 0 ? 0 : DELIVERY_FEE;
  const total = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty">
          <ShoppingBag size={56} strokeWidth={1.2} />
          <h2>Your cart is empty</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>
            Looks like you haven't added any homemade goodies yet.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 22 }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Your Cart</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>{cart.length} item(s) in your cart</p>
      </div>

      <div className="cart-layout" style={{ marginTop: 26 }}>
        <div>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return <CartItem key={item.productId} item={item} product={product} />;
          })}
        </div>

        <div className="card order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
          </div>
          {deliveryFee > 0 && (
            <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
              Add ₹{FREE_DELIVERY_THRESHOLD - cartTotal} more for free delivery
            </p>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
