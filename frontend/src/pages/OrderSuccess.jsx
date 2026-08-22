import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ClipboardList } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function OrderSuccess() {
  const { customerOrders } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

 const order = location.state?.order || customerOrders[0];

  if (!order) {
    return (
      <div className="container empty-state">
        <h3>No recent orders found</h3>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="order-success-wrap">
        <div className="success-icon">
          <CheckCircle2 size={44} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className="sub">
          Thank you for supporting local makers. Your order has been sent to the seller.
        </p>

        <div className="card order-detail-card">
          <div className="order-detail-row">
            <span className="label">Order ID</span>
            <span className="value">#{order.id}</span>
          </div>
          <div className="order-detail-row">
            <span className="label">Products</span>
            <span className="value">
              {order.products.map((p) => `${p.name} × ${p.qty}`).join(", ")}
            </span>
          </div>
          <div className="order-detail-row">
            <span className="label">Total</span>
            <span className="value">₹{order.amount}</span>
          </div>
          {order.address && (
            <div className="order-detail-row">
              <span className="label">Delivery Address</span>
              <span className="value">
                {order.address.address}, {order.address.city} - {order.address.pincode}
              </span>
            </div>
          )}
          <div className="order-detail-row">
            <span className="label">Estimated Delivery</span>
            <span className="value">{order.estimatedDelivery || "Within 24-48 hours"}</span>
          </div>
          <div className="order-detail-row">
            <span className="label">Order Status</span>
            <span className="value">
              <StatusBadge status={order.status} />
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            <ClipboardList size={16} /> View Orders
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/products")}>
            <ShoppingBag size={16} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
