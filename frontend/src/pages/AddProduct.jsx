import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ImagePlus, CheckCircle2, ChevronRight } from "lucide-react";
import { useApp } from "../context/CartContext.jsx";
import { categories } from "../data/categories.js";

export default function AddProduct() {
  const { user, addProduct } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: categories[0].id,
    price: "",
    description: "",
    stock: "",
    city: user?.location?.city || "Prayagraj",
    deliveryAvailable: true,
    unit: "1 piece",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role !== "seller") {
    return (
      <div className="container empty-state">
        <h3>Seller login required</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Log in</Link>
      </div>
    );
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectImage(file) {
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!imageFile) {
      window.alert("Please select a product image.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("category", form.category);
      data.append("price", form.price);
      data.append("description", form.description.trim());
      data.append("stock", form.stock);
      data.append("city", form.city);
      data.append("unit", form.unit);
      data.append("deliveryAvailable", String(form.deliveryAvailable));
      data.append("images", imageFile);

      await addProduct(data);
      setShowSuccess(true);
      setTimeout(() => navigate("/seller"), 900);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      {showSuccess && <div className="success-toast"><CheckCircle2 size={18} /> Product added successfully!</div>}

      <div className="breadcrumb" style={{ marginTop: 24 }}>
        <Link to="/seller">Seller Dashboard</Link><ChevronRight size={13} /><span>Add Product</span>
      </div>

      <div className="page-header" style={{ paddingTop: 8 }}>
        <h1>Add a New Product</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>Publish a real product to the LocalRoots marketplace.</p>
      </div>

      <form className="add-product-wrap" style={{ marginTop: 24 }} onSubmit={handleSubmit}>
        <div className="card form-card">
          <h3><ImagePlus size={18} /> Product Image</h3>
          <div className="image-upload-preview" style={{ minHeight: 260 }}>
            {preview ? <img src={preview} alt="Product preview" /> : <p style={{ color: "var(--ink-soft)" }}>Choose an image below</p>}
          </div>
          <input type="file" accept="image/*" onChange={(e) => selectImage(e.target.files?.[0] || null)} required />
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 8 }}>Maximum 5MB. The backend stores the image locally unless Cloudinary is configured.</p>
        </div>

        <div className="card form-card">
          <h3>Product Details</h3>
          <div className="form-grid">
            <div className="form-field full"><label>Product Name</label><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Homemade Ghee Laddu" required /></div>
            <div className="form-field"><label>Category</label><select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-field"><label>Price (₹)</label><input type="number" min="1" value={form.price} onChange={(e) => update("price", e.target.value)} required /></div>
            <div className="form-field"><label>Unit</label><input value={form.unit} onChange={(e) => update("unit", e.target.value)} /></div>
            <div className="form-field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} required /></div>
            <div className="form-field"><label>City</label><input value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
            <div className="form-field full"><label>Description</label><textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} required /></div>
          </div>

          <div className="toggle-row">
            <div><div style={{ fontWeight: 600, fontSize: 14.5 }}>Delivery Available</div><div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Turn on if you can deliver this product.</div></div>
            <button type="button" className={`toggle-switch${form.deliveryAvailable ? " on" : ""}`} role="switch" aria-checked={form.deliveryAvailable} onClick={() => update("deliveryAvailable", !form.deliveryAvailable)} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 10 }} disabled={submitting}>
            {submitting ? "Publishing..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
