import StatusBadge from "./StatusBadge.jsx";

export default function OrderCard({ order }) {
  const productNames = order.products.map((p) => `${p.name} x${p.qty}`).join(", ");
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--forest-dark)" }}>#{order.id}</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{productNames}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 6 }}>{order.date}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>₹{order.amount}</div>
          <StatusBadge status={order.status} />
        </div>
      </div>
    </div>
  );
}
