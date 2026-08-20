import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, ClipboardList, Plus, IndianRupee, Clock3, Pencil, Trash2 } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import Rating from "../components/Rating.jsx";

const ORDER_STATUS_FLOW = ["Pending", "Accepted", "Preparing", "Ready", "Delivered"];

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "products", label: "My Products", icon: Package },
  { id: "orders", label: "Recent Orders", icon: ClipboardList },
];

export default function Seller() {
  const {
    user,
    sellerProducts,
    sellerOrders,
    sellerStats,
    refreshSellerData,
    updateSellerOrderStatus,
    deleteProduct,
  } = useApp();
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "seller") refreshSellerData().catch((e) => window.alert(e.message));
  }, [user]);

  if (!user) {
    return (
      <div className="container empty-state">
        <h3>Seller login required</h3>
        <p>Log in with a seller account to manage your products and orders.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Log in</Link>
      </div>
    );
  }

  if (user.role !== "seller") {
    return (
      <div className="container empty-state">
        <h3>This page is for sellers</h3>
        <p>Create or log in to a seller account to access the seller dashboard.</p>
      </div>
    );
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
    } catch (error) {
      window.alert(error.message);
    }
  }

  async function handleStatus(orderId, status) {
    try {
      await updateSellerOrderStatus(orderId, status);
      await refreshSellerData();
    } catch (error) {
      window.alert(error.message);
    }
  }

  const stats = sellerStats || {
    totalProducts: sellerProducts.length,
    totalOrders: sellerOrders.length,
    pendingOrders: 0,
    totalRevenue: 0,
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Seller Dashboard</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>
          Welcome back, {user.storeName || user.name}!
        </p>
      </div>

      <div className="dash-layout" style={{ marginTop: 26 }}>
        <aside className="dash-sidebar">
          <div className="dash-profile">
            {user.profileImage ? <img src={user.profileImage} alt={user.name} /> : <div className="review-avatar">{user.name?.charAt(0)}</div>}
            <div>
              <strong>{user.storeName || user.name}</strong>
              <span>{user.location?.city || "Local seller"}</span>
            </div>
          </div>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`dash-nav-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              <t.icon size={17} /> {t.label}
            </button>
          ))}
          <Link to="/seller/products/new" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>
            <Plus size={16} /> Add Product
          </Link>
        </aside>

        <div className="dash-content">
          {tab === "overview" && (
            <>
              <h2>Overview</h2>
              <div className="stat-grid">
                <div className="card stat-card"><span className="stat-icon"><Package size={20} /></span><strong>{stats.totalProducts}</strong><span>Total Products</span></div>
                <div className="card stat-card"><span className="stat-icon"><ClipboardList size={20} /></span><strong>{stats.totalOrders}</strong><span>Total Orders</span></div>
                <div className="card stat-card"><span className="stat-icon"><Clock3 size={20} /></span><strong>{stats.pendingOrders}</strong><span>Pending Orders</span></div>
                <div className="card stat-card"><span className="stat-icon"><IndianRupee size={20} /></span><strong>₹{stats.totalRevenue}</strong><span>Revenue</span></div>
              </div>
              <div className="dash-section-head">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Recent Orders</h3>
                <button type="button" className="link-more" style={{ border: "none", background: "none" }} onClick={() => setTab("orders")}>View all</button>
              </div>
              <OrdersTable orders={sellerOrders.slice(0, 4)} onStatusChange={handleStatus} />
            </>
          )}

          {tab === "products" && (
            <>
              <div className="dash-section-head">
                <h2 style={{ margin: 0 }}>My Products</h2>
                <Link to="/seller/products/new" className="btn btn-primary btn-sm"><Plus size={15} /> Add Product</Link>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
                  <tbody>
                    {sellerProducts.map((p) => (
                      <tr key={p.id}>
                        <td><div className="table-product-cell"><img src={p.image} alt={p.name} /><span>{p.name}</span></div></td>
                        <td>₹{p.price}</td><td>{p.stock}</td><td><Rating value={p.rating} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => navigate(`/seller/products/edit/${p.id}`)} aria-label="Edit product"><Pencil size={14} /></button>
                            <button type="button" className="icon-btn" style={{ width: 34, height: 34, color: "var(--clay)" }} onClick={() => handleDelete(p.id)} aria-label="Delete product"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <h2>Recent Orders</h2>
              <OrdersTable orders={sellerOrders} onStatusChange={handleStatus} full />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ orders, onStatusChange, full = false }) {
  const rows = orders.flatMap((order) =>
    (order.products || []).map((item, index) => ({
      id: order.id,
      customer: order.customer?.name || order.customerName || "Customer",
      product: item.name,
      productId: item.productId,
      qty: item.qty,
      amount: item.price * item.qty,
      status: item.status || order.status,
      key: `${order.id}-${item.productId}-${index}`,
    }))
  );

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th>{full && <th>Update</th>}</tr></thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.key}>
              <td>#{o.id}</td><td>{o.customer}</td><td>{o.product}</td><td>{o.qty}</td><td>₹{o.amount}</td>
              <td><span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span></td>
              {full && <td><select className="status-select" value={o.status} onChange={(e) => onStatusChange(o.id, e.target.value)}>
                {ORDER_STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
              </select></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
