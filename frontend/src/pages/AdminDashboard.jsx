
import { useEffect, useState } from "react";
import { api, normalizeProduct } from "../services/api.js";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadPendingProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getPendingProducts();
      const pendingProducts = response?.data?.products || [];

      setProducts(pendingProducts.map(normalizeProduct));
    } catch (err) {
      setError(err.message || "Failed to load pending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingProducts();
  }, []);

  const handleApprove = async (productId) => {
    if (!window.confirm("Approve this product?")) return;

    try {
      setActionLoading(productId);

      await api.approveProduct(productId);

      setProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
    } catch (err) {
      window.alert(err.message || "Failed to approve product");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (productId) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this product:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      window.alert("Rejection reason is required.");
      return;
    }

    try {
      setActionLoading(productId);

      await api.rejectProduct(productId, reason.trim());

      setProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
    } catch (err) {
      window.alert(err.message || "Failed to reject product");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-header">
            <span className="eyebrow">LocalRoots Admin</span>
            <h1>Moderation</h1>
          </div>

          <div className="empty-state">
            <p>Loading pending products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin-page">
      <div className="container">

        {/* Header */}
        <div className="section-head admin-section-head">
          <div>
            <span className="eyebrow">LocalRoots Admin</span>

            <h1 className="admin-title">
              Product moderation
            </h1>

            <p className="admin-subtitle">
              Review seller submissions before they appear on the marketplace.
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={loadPendingProducts}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="admin-stats">
          <div className="card admin-stat-card">
            <span className="eyebrow">Pending review</span>

            <strong className="admin-stat-number">
              {products.length}
            </strong>

            <span className="admin-stat-text">
              {products.length === 1
                ? "product waiting for approval"
                : "products waiting for approval"}
            </span>
          </div>

          <div className="card admin-stat-card admin-stat-highlight">
            <span className="eyebrow">Moderation</span>

            <strong className="admin-stat-number">
              Review
            </strong>

            <span className="admin-stat-text">
              Check products before publishing.
            </span>
          </div>
        </div>

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="card admin-empty">
            <div className="admin-empty-icon">✓</div>

            <h2>All caught up</h2>

            <p>
              There are no products waiting for approval right now.
            </p>
          </div>
        ) : (
          <div className="admin-product-grid">
            {products.map((product) => {
              const seller = product.seller;

              return (
                <article
                  className="admin-product-card"
                  key={product.id}
                >
                  {/* Image */}
                  <div className="admin-product-image-wrap">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="admin-product-image"
                      />
                    ) : (
                      <div className="admin-no-image">
                        No image
                      </div>
                    )}

                    <span className="status-badge status-pending admin-status">
                      Pending
                    </span>
                  </div>

                  {/* Content */}
                  <div className="admin-product-body">

                    <div className="admin-product-heading">
                      <div>
                        <span className="admin-category">
                          {product.category || "Uncategorized"}
                        </span>

                        <h2>{product.name}</h2>
                      </div>

                      <div className="admin-price">
                        ₹{product.price}
                      </div>
                    </div>

                    <p className="admin-description">
                      {product.description ||
                        "No description provided."}
                    </p>

                    {/* Product information */}
                    <div className="admin-info-grid">
                      <div>
                        <span>Stock</span>
                        <strong>{product.stock ?? 0}</strong>
                      </div>

                      <div>
                        <span>Unit</span>
                        <strong>{product.unit || "—"}</strong>
                      </div>

                      <div>
                        <span>City</span>
                        <strong>{product.city || "—"}</strong>
                      </div>

                      <div>
                        <span>Delivery</span>
                        <strong>
                          {product.deliveryAvailable
                            ? "Available"
                            : "No"}
                        </strong>
                      </div>
                    </div>

                    {/* Seller */}
                    <div className="admin-seller">
                      <div className="admin-seller-avatar">
                        {(seller?.name || "S").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <span className="admin-seller-label">
                          Seller
                        </span>

                        <strong>
                          {seller?.name || "Unknown seller"}
                        </strong>

                        {seller?.storeName && (
                          <small>{seller.storeName}</small>
                        )}

                        {seller?.email && (
                          <small>{seller.email}</small>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="admin-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleApprove(product.id)
                        }
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        className="btn btn-danger admin-reject-btn"
                        onClick={() =>
                          handleReject(product.id)
                        }
                        disabled={actionLoading === product.id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
