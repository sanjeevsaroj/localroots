import { MapPin } from "lucide-react";
import Rating from "./Rating.jsx";

export default function SellerCard({ seller }) {
  return (
    <div className="card seller-panel">
      <img src={seller.avatar} alt={seller.name} />
      <div className="seller-panel-info">
        <h4>{seller.name}</h4>
        <p>
          <MapPin size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />
          {seller.location} · {seller.distance}
        </p>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <Rating value={seller.rating} count={seller.reviewCount} />
          <span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Since {seller.joined}</span>
        </div>
      </div>
    </div>
  );
}
