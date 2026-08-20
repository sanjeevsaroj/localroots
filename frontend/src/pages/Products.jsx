import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, PackageSearch } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import SearchBar from "../components/SearchBar.jsx";

function parseDistance(distanceStr) {
  return parseFloat(distanceStr);
}

export default function Products() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || null,
    distance: 999,
    maxPrice: 2000,
    minRating: 0,
    sort: "popularity",
  });

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("q");
    if (cat) setFilters((prev) => ({ ...prev, category: cat }));
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (parseDistance(p.distance) > filters.distance) return false;
      if (p.price > filters.maxPrice) return false;
      if (p.rating < filters.minRating) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    switch (filters.sort) {
      case "price-low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "distance":
        list = [...list].sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
        break;
      default:
        list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [products, filters, query]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Explore the Marketplace</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 8, maxWidth: 560 }}>
          Browse homemade products from sellers near you — filter by category, distance,
          price and rating to find exactly what you're craving.
        </p>
      </div>

      <div style={{ margin: "26px 0" }}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="products-layout">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          className={mobileFilterOpen ? "open" : ""}
        />

        <div>
          <div className="products-toolbar">
            <span className="results-count">{filtered.length} products found</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost mobile-filter-toggle"
                onClick={() => setMobileFilterOpen((v) => !v)}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
              <select
                className="sort-select"
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                aria-label="Sort products"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="distance">Sort: Distance</option>
                <option value="price-low">Sort: Price - Low to High</option>
                <option value="price-high">Sort: Price - High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <PackageSearch size={48} strokeWidth={1.3} />
              <h3>No products found</h3>
              <p>Try adjusting your filters or search for something else.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
