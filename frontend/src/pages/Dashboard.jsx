import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  Heart,
  Star,
  UserCircle,
  ShoppingBag,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import { reviews } from "../data/reviews.js";
import OrderCard from "../components/OrderCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ReviewCard from "../components/ReviewCard.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "profile", label: "Profile", icon: UserCircle },
];

export default function Dashboard() {
  const { customerOrders, wishlist, products } = useApp();
  const [tab, setTab] = useState("overview");

  const activeOrders = customerOrders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));
  const completedOrders = customerOrders.filter((o) => o.status === "Delivered");
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const myReviews = reviews.slice(0, 3);

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>Welcome back, Priya!</p>
      </div>

      <div className="dash-layout" style={{ marginTop: 26 }}>
        <aside className="dash-sidebar">
          <div className="dash-profile">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
              alt="Priya Sharma"
            />
            <div>
              <strong>Priya Sharma</strong>
              <span>Prayagraj, UP</span>
            </div>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`dash-nav-item${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </aside>

        <div className="dash-content">
          {tab === "overview" && (
            <>
              <h2>Overview</h2>
              <div className="stat-grid">
                <div className="card stat-card">
                  <span className="stat-icon">
                    <ShoppingBag size={20} />
                  </span>
                  <strong>{customerOrders.length}</strong>
                  <span>Total Orders</span>
                </div>
                <div className="card stat-card">
                  <span className="stat-icon">
                    <Clock size={20} />
                  </span>
                  <strong>{activeOrders.length}</strong>
                  <span>Active Orders</span>
                </div>
                <div className="card stat-card">
                  <span className="stat-icon">
                    <CheckCircle size={20} />
                  </span>
                  <strong>{completedOrders.length}</strong>
                  <span>Completed Orders</span>
                </div>
                <div className="card stat-card">
                  <span className="stat-icon">
                    <Heart size={20} />
                  </span>
                  <strong>{wishlistProducts.length}</strong>
                  <span>Wishlist</span>
                </div>
              </div>

              <div className="dash-section-head">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Recent Orders</h3>
                <button type="button" className="link-more" style={{ border: "none", background: "none" }} onClick={() => setTab("orders")}>
                  View all
                </button>
              </div>
              {customerOrders.slice(0, 3).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </>
          )}

          {tab === "orders" && (
            <>
              <h2>My Orders</h2>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.products.map((p) => `${p.name} ×${p.qty}`).join(", ")}</td>
                        <td>₹{order.amount}</td>
                        <td>{order.date}</td>
                        <td>
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "wishlist" && (
            <>
              <h2>Wishlist</h2>
              {wishlistProducts.length === 0 ? (
                <div className="empty-state">
                  <Heart size={48} strokeWidth={1.2} />
                  <h3>Your wishlist is empty</h3>
                  <p>Tap the heart icon on any product to save it here.</p>
                  <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "reviews" && (
            <>
              <h2>My Reviews</h2>
              {myReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </>
          )}

          {tab === "profile" && (
            <>
              <h2>Profile</h2>
              <div className="card form-card">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input type="text" defaultValue="Priya Sharma" />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input type="text" defaultValue="9876543210" />
                  </div>
                  <div className="form-field full">
                    <label>Email</label>
                    <input type="email" defaultValue="priya.sharma@example.com" />
                  </div>
                  <div className="form-field full">
                    <label>Default Address</label>
                    <textarea rows={2} defaultValue="12 Civil Lines, Prayagraj, UP - 211001" />
                  </div>
                </div>
                <button type="button" className="btn btn-primary" style={{ marginTop: 18 }}>
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
