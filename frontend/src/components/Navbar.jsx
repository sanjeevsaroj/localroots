import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, Sprout, Store } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/products" },
  { label: "Categories", to: "/products" },
  { label: "Become a Seller", to: "/seller" },
];

export default function Navbar() {
  const { cartCount, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    setMenuOpen(false);
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          DHAAGA
        </Link>

        <nav className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form className="nav-search-inline" onSubmit={handleSearchSubmit}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <div className="nav-actions">
          <Link to="/seller" className="icon-btn" aria-label="Seller dashboard" title="Seller dashboard">
            <Store size={19} />
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to={user.role === "seller" ? "/seller" : "/dashboard"} className="icon-btn" aria-label="Profile">
                <User size={19} />
              </Link>
              <button type="button" className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
                <span style={{ fontSize: 11, fontWeight: 700 }}>OUT</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="icon-btn" aria-label="Login" title="Login">
              <User size={19} />
            </Link>
          )}
          <button
            type="button"
            className="icon-btn hamburger-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <form className="nav-search-inline" onSubmit={handleSearchSubmit}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link to="/cart" onClick={() => setMenuOpen(false)}>
          Cart {cartCount > 0 ? `(${cartCount})` : ""}
        </Link>
        {user ? (
          <>
            <Link to={user.role === "seller" ? "/seller" : "/dashboard"} onClick={() => setMenuOpen(false)}>
              {user.name || "Profile"}
            </Link>
            <button type="button" onClick={() => { logout(); setMenuOpen(false); }}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Profile / Login
          </Link>
        )}
      </div>
    </header>
  );
}
