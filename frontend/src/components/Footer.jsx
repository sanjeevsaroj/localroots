import { Link } from "react-router-dom";
import { Sprout, Camera, Users2, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark">
                <Sprout size={20} />
              </span>
              LocalRoots
            </Link>
            <p>
              A hyperlocal marketplace connecting neighbourhood makers with people who
              value homemade, handcrafted goods — from pickles to pottery.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=food">Food</Link></li>
              <li><Link to="/products?category=crafts">Handmade Crafts</Link></li>
              <li><Link to="/products?category=candles">Candles</Link></li>
            </ul>
          </div>

          <div>
            <h4>Sell</h4>
            <ul>
              <li><Link to="/seller">Seller Dashboard</Link></li>
              <li><Link to="/seller/products/new">Add a Product</Link></li>
              <li><Link to="/seller">How it works</Link></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About LocalRoots</Link></li>
              <li><Link to="/">Community Stories</Link></li>
              <li><Link to="/">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 LocalRoots. Made with care in Prayagraj.</span>
          <div className="footer-socials">
            <a href="#" aria-label="Photos"><Camera size={16} /></a>
            <a href="#" aria-label="Community"><Users2 size={16} /></a>
            <a href="#" aria-label="Messages"><MessageCircle size={16} /></a>
            <a href="#" aria-label="Email"><Mail size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
