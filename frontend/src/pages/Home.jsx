import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, ArrowRight, Users, Sparkles, ShieldCheck } from "lucide-react";
import { categories } from "../data/categories.js";
import { sellers } from "../data/sellers.js";
import { useApp } from "../context/CartContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CategoryCard from "../components/CategoryCard.jsx";

export default function Home() {
  const { products } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const popular = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

  function handleSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
  }

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-eyebrow">
              <span className="dot" /> Now live in Prayagraj &amp; nearby
            </span>
            <h1>
              Discover <em>homemade</em> goodness near you
            </h1>
            <p className="hero-sub">
              Support local makers and discover authentic homemade products from your
              community — pickles, cakes, candles, crafts and more, made by hand a few
              streets away.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-field">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search for mango pickle, candles, kurtas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search products"
                />
              </div>
              <span className="hero-search-divider" />
              <div className="hero-search-field" style={{ maxWidth: 200 }}>
                <MapPin size={18} />
                <input type="text" defaultValue="Prayagraj, UP" aria-label="Location" />
              </div>
              <button type="submit" className="btn btn-primary">
                Explore Products
              </button>
            </form>

            <div className="hero-cta-row">
              <Link to="/products" className="btn btn-secondary">
                Browse Marketplace <ArrowRight size={16} />
              </Link>
              <Link to="/seller" className="btn btn-ghost">
                Become a Seller
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>420+</strong>
                <span>Local sellers</span>
              </div>
              <div className="hero-stat">
                <strong>3,100+</strong>
                <span>Homemade products</span>
              </div>
              <div className="hero-stat">
                <strong>4.8★</strong>
                <span>Average rating</span>
              </div>
            </div>
          </div>

          
        </div>
        <div className="scallop-divider" style={{ marginTop: 56 }} />
      </section>

      {/* CATEGORIES */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2>Shop by category</h2>
            </div>
          </div>
          <div className="category-scroll">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR NEAR YOU */}
      <section className="section" style={{ background: "var(--cream-2)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Nearby</span>
              <h2>Popular near you</h2>
            </div>
            <Link to="/products" className="link-more">
              View all products <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY LOCALROOTS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our promise</span>
              <h2>Why LocalRoots?</h2>
            </div>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <span className="why-icon">
                <Users size={24} />
              </span>
              <h3>Support Local Sellers</h3>
              <p>
                Every purchase goes straight to a home-based maker in your city, helping
                small kitchens and workshops grow.
              </p>
            </div>
            <div className="why-card">
              <span className="why-icon">
                <MapPin size={24} />
              </span>
              <h3>Discover Nearby Products</h3>
              <p>
                Find sellers within a few kilometres, so what you order is fresher and
                arrives faster than a warehouse ever could.
              </p>
            </div>
            <div className="why-card">
              <span className="why-icon">
                <ShieldCheck size={24} />
              </span>
              <h3>Build Community Trust</h3>
              <p>
                Verified seller profiles, honest ratings and real reviews from your
                neighbours — no anonymous storefronts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SELLERS */}
      <section className="section" style={{ background: "var(--cream-2)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Meet the makers</span>
              <h2>Sellers near Prayagraj</h2>
            </div>
          </div>
          <div className="why-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {sellers.slice(0, 3).map((seller) => (
              <div className="card" key={seller.id} style={{ padding: 22 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    style={{ width: 58, height: 58, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--forest-dark)" }}>{seller.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>
                      {seller.location}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 14, lineHeight: 1.6 }}>
                  {seller.bio}
                </p>
                <span className="stamp" style={{ marginTop: 14 }}>
                  <Sparkles size={13} /> {seller.rating}★ · {seller.reviewCount} reviews
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
