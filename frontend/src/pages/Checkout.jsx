import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Wallet, Smartphone, MapPin } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function Checkout() {
  const { cart, products, cartTotal, placeOrder, user } = useApp();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Prayagraj",
    pincode: "",
  });
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const deliveryFee = cartTotal >= FREE_DELIVERY_THRESHOLD || cartTotal === 0 ? 0 : DELIVERY_FEE;
  const total = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container empty-state">
        <h3>Your cart is empty</h3>
        <p>Add some products before checking out.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Explore Products
        </Link>
      </div>
    );
  }

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!address.name.trim()) errs.name = "Name is required";
    if (!/^\d{10}$/.test(address.phone.trim())) errs.phone = "Enter a valid 10-digit phone number";
    if (!address.address.trim()) errs.address = "Address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await placeOrder({
        address,
        paymentMethod: payment === "cod" ? "COD" : "DEMO_ONLINE",
      });
      navigate("/order-success", { state: { order } });
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="container empty-state">
        <h3>Please log in to checkout</h3>
        <p>You need a customer account before placing an order.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Log in</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      <form className="checkout-layout" style={{ marginTop: 26 }} onSubmit={handlePlaceOrder}>
        <div>
          <div className="card form-card">
            <h3>
              <MapPin size={18} /> Delivery Address
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={address.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
                {errors.name && <span style={{ color: "var(--clay)", fontSize: 12 }}>{errors.name}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <span style={{ color: "var(--clay)", fontSize: 12 }}>{errors.phone}</span>}
              </div>
              <div className="form-field full">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  rows={3}
                  value={address.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="House no., street, locality"
                />
                {errors.address && <span style={{ color: "var(--clay)", fontSize: 12 }}>{errors.address}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={address.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                {errors.city && <span style={{ color: "var(--clay)", fontSize: 12 }}>{errors.city}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  type="text"
                  value={address.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  placeholder="e.g. 211001"
                />
                {errors.pincode && <span style={{ color: "var(--clay)", fontSize: 12 }}>{errors.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="card form-card">
            <h3>
              <Wallet size={18} /> Payment
            </h3>
            <div className="payment-options">
              <label className={`payment-option${payment === "cod" ? " selected" : ""}`}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <span className="payment-option-icon">
                  <Truck size={18} />
                </span>
                <span>
                  <span className="payment-option-title" style={{ display: "block" }}>Cash on Delivery</span>
                  <span className="payment-option-sub">Pay when your order arrives</span>
                </span>
              </label>
              <label className={`payment-option${payment === "online" ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "online"}
                  onChange={() => setPayment("online")}
                />
                <span className="payment-option-icon">
                  <Smartphone size={18} />
                </span>
                <span>
                  <span className="payment-option-title" style={{ display: "block" }}>Demo Online Payment</span>
                  <span className="payment-option-sub">Simulated UPI / card payment for this demo</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="card order-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <div className="summary-row" key={item.productId}>
                <span>
                  {product.name} × {item.qty}
                </span>
                <span>₹{product.price * item.qty}</span>
              </div>
            );
          })}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={submitting}>
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}
