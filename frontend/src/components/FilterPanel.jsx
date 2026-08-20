import { SlidersHorizontal } from "lucide-react";
import { categories } from "../data/categories.js";

const DISTANCE_OPTIONS = [
  { label: "Within 2 km", value: 2 },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
  { label: "Any distance", value: 999 },
];

const RATING_OPTIONS = [4.5, 4, 3.5];

export default function FilterPanel({ filters, setFilters, className = "" }) {
  function toggleCategory(id) {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === id ? null : id,
    }));
  }

  return (
    <aside className={`filter-panel ${className}`}>
      <h3>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={16} /> Filters
        </span>
        <button
          type="button"
          className="link-more"
          style={{ fontSize: 12.5, border: "none" }}
          onClick={() =>
            setFilters({ category: null, distance: 999, maxPrice: 2000, minRating: 0, sort: filters.sort })
          }
        >
          Clear all
        </button>
      </h3>

      <div className="filter-group">
        <div className="filter-group-title">Category</div>
        {categories.map((cat) => (
          <label className="filter-option" key={cat.id}>
            <input
              type="radio"
              name="category"
              checked={filters.category === cat.id}
              onChange={() => toggleCategory(cat.id)}
            />
            {cat.name}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Distance</div>
        {DISTANCE_OPTIONS.map((opt) => (
          <label className="filter-option" key={opt.value}>
            <input
              type="radio"
              name="distance"
              checked={filters.distance === opt.value}
              onChange={() => setFilters((prev) => ({ ...prev, distance: opt.value }))}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Max price: ₹{filters.maxPrice}</div>
        <input
          type="range"
          min="100"
          max="2000"
          step="50"
          value={filters.maxPrice}
          className="price-slider"
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
        />
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Minimum rating</div>
        {RATING_OPTIONS.map((r) => (
          <label className="filter-option" key={r}>
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r}
              onChange={() => setFilters((prev) => ({ ...prev, minRating: r }))}
            />
            {r}+ stars
          </label>
        ))}
        <label className="filter-option">
          <input
            type="radio"
            name="rating"
            checked={filters.minRating === 0}
            onChange={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
          />
          Any rating
        </label>
      </div>
    </aside>
  );
}
