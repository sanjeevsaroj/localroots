import { Minus, Plus, Trash2 } from "lucide-react";
import { sellers } from "../data/sellers.js";
import { useApp } from "../context/CartContext.jsx";

export default function CartItem({ item, product }) {
  const { updateCartQty, removeFromCart } = useApp();
  const seller = product.seller || sellers.find((s) => s.id === product.sellerId);

  return (
    <div className="card cart-item">
      <img src={product.image} alt={product.name} />
      <div className="cart-item-info">
        <div className="cart-item-name">{product.name}</div>
        <div className="cart-item-seller">{seller?.name}</div>
        <div className="cart-item-price">₹{product.price * item.qty}</div>
      </div>
      <div className="cart-item-right">
        <div className="qty-stepper">
          <button type="button" onClick={() => updateCartQty(product.id, item.qty - 1).catch((e) => window.alert(e.message))} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <span>{item.qty}</span>
          <button type="button" onClick={() => updateCartQty(product.id, item.qty + 1).catch((e) => window.alert(e.message))} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
        <button type="button" className="cart-remove" onClick={() => removeFromCart(product.id).catch((e) => window.alert(e.message))}>
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  );
}
