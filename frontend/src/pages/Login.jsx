import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { api } from "../services/api.js";
import { useApp } from "../context/CartContext.jsx";

export default function Login() {
  const { loginSuccess, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "customer@localroots.com",
    password: "password123",
    phone: "",
    role: "customer",
    city: "Prayagraj",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="container empty-state">
        <h3>You are already logged in</h3>
        <Link to={user.role === "seller" ? "/seller" : "/dashboard"} className="btn btn-primary" style={{ marginTop: 16 }}>
          Continue
        </Link>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: form.role,
            city: form.city,
          });

      loginSuccess(res);

      const destination = location.state?.from || (res.data.user.role === "seller" ? "/seller" : "/products");
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 620, paddingTop: 50, paddingBottom: 70 }}>
      <div className="page-header">
        <h1>{mode === "login" ? "Welcome back" : "Create your LocalRoots account"}</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>
          {mode === "login" ? "Log in to shop, manage your cart and place orders." : "Join the local marketplace as a customer or seller."}
        </p>
      </div>

      <form className="card form-card" style={{ marginTop: 24 }} onSubmit={submit}>
        {error && <div className="success-toast" style={{ color: "var(--clay)" }}>{error}</div>}

        {mode === "register" && (
          <>
            <div className="form-field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-field" style={{ marginTop: 14 }}>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-field" style={{ marginTop: 14 }}>
              <label>Account type</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </>
        )}

        <div className="form-field" style={{ marginTop: 14 }}>
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-field" style={{ marginTop: 14 }}>
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={loading}>
          {mode === "login" ? <><LogIn size={16} /> {loading ? "Logging in..." : "Log in"}</> : <><UserPlus size={16} /> {loading ? "Creating..." : "Create account"}</>}
        </button>

        {mode === "login" && (
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 14 }}>
            Demo customer: <strong>customer@localroots.com</strong> / <strong>password123</strong>
          </p>
        )}

        <button
          type="button"
          className="link-more"
          style={{ border: 0, background: "none", marginTop: 16 }}
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Create one" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
