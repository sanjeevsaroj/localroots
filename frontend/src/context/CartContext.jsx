import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, normalizeCart, normalizeOrder, normalizeProduct } from "../services/api.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("localroots_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [customerOrders, setCustomerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("localroots_user") || "null");
    } catch {
      return null;
    }
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("localroots_token")));

  const isAuthenticated = Boolean(localStorage.getItem("localroots_token"));

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthLoading(false);
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
      return;
    }

    api.me()
      .then((res) => {
        const currentUser = res.data.user;
        setUser(currentUser);
        localStorage.setItem("localroots_user", JSON.stringify(currentUser));
        return currentUser;
      })
      .then((currentUser) => {
        if (currentUser.role === "customer") return refreshCustomerData();
        if (currentUser.role === "seller") return refreshSellerData();
      })
      .catch(() => logout())
      .finally(() => setAuthLoading(false));
  }, [isAuthenticated]);

  async function loadProducts(params = {}) {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts(params);
      setProducts((res.data.products || []).map(normalizeProduct));
    } catch (error) {
      console.error("Could not load products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function refreshCart() {
    if (!localStorage.getItem("localroots_token")) return;
    const res = await api.getCart();
    const normalized = normalizeCart(res.data);
    setCart(normalized.items);
    setCartTotal(normalized.cartTotal);
    setCartCount(normalized.cartCount);
  }

  async function refreshCustomerData() {
    await Promise.all([
      refreshCart(),
      api.getMyOrders().then((res) => {
        setCustomerOrders((res.data.orders || []).map(normalizeOrder));
      }),
    ]);
  }

  async function refreshSellerData() {
    const [productsRes, ordersRes, statsRes] = await Promise.all([
      api.getSellerProducts(),
      api.getSellerOrders(),
      api.getSellerStats(),
    ]);

    setSellerProducts((productsRes.data.products || []).map(normalizeProduct));
    setSellerOrders((ordersRes.data.orders || []).map(normalizeOrder));
    setSellerStats(statsRes.data);
  }

  function loginSuccess(res) {
    const currentUser = res.data.user;
    localStorage.setItem("localroots_token", res.data.token);
    localStorage.setItem("localroots_user", JSON.stringify(currentUser));
    setUser(currentUser);
    setAuthLoading(false);

    if (currentUser.role === "customer") refreshCustomerData();
    if (currentUser.role === "seller") refreshSellerData();
  }

  function logout() {
    localStorage.removeItem("localroots_token");
    localStorage.removeItem("localroots_user");
    setUser(null);
    setCart([]);
    setCartTotal(0);
    setCartCount(0);
    setCustomerOrders([]);
    setSellerOrders([]);
    setSellerProducts([]);
    setSellerStats(null);
  }

  function toggleWishlist(productId) {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("localroots_wishlist", JSON.stringify(next));
      return next;
    });
  }

  async function addToCart(productId, qty = 1) {
    if (!user) throw new Error("Please log in as a customer to use the cart.");
    if (user.role !== "customer") throw new Error("Only customer accounts can use the cart.");
    const res = await api.addCartItem(productId, qty);
    const normalized = normalizeCart(res.data);
    setCart(normalized.items);
    setCartTotal(normalized.cartTotal);
    setCartCount(normalized.cartCount);
  }

  async function updateCartQty(productId, qty) {
    const res = await api.updateCartItem(productId, qty);
    const normalized = normalizeCart(res.data);
    setCart(normalized.items);
    setCartTotal(normalized.cartTotal);
    setCartCount(normalized.cartCount);
  }

  async function removeFromCart(productId) {
    const res = await api.removeCartItem(productId);
    const normalized = normalizeCart(res.data);
    setCart(normalized.items);
    setCartTotal(normalized.cartTotal);
    setCartCount(normalized.cartCount);
  }

  async function clearCart() {
    const res = await api.clearCart();
    const normalized = normalizeCart(res.data);
    setCart(normalized.items);
    setCartTotal(normalized.cartTotal);
    setCartCount(normalized.cartCount);
  }

  async function placeOrder({ address, paymentMethod }) {
    if (!user) throw new Error("Please log in before placing an order.");

    const res = await api.placeOrder({
      deliveryAddress: address,
      paymentMethod,
    });

    const order = normalizeOrder(res.data.order);
    setCustomerOrders((prev) => [order, ...prev]);
    setCart([]);
    setCartTotal(0);
    setCartCount(0);

    // Product stock changed after checkout.
    await loadProducts();
    return order;
  }

  async function updateSellerOrderStatus(orderId, status) {
    const res = await api.updateOrderStatus(orderId, status);
    const updated = normalizeOrder(res.data.order);
    setSellerOrders((prev) =>
      prev.map((order) => (order.id === orderId ? updated : order))
    );
    return updated;
  }

  async function addProduct(formData) {
    const res = await api.createProduct(formData);
    const product = normalizeProduct(res.data.product);
    setProducts((prev) => [product, ...prev]);
    setSellerProducts((prev) => [product, ...prev]);
    await refreshSellerData();
    return product;
  }

  async function deleteProduct(id) {
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSellerProducts((prev) => prev.filter((p) => p.id !== id));
    await refreshSellerData();
  }

  const value = {
    products,
    loadingProducts,
    user,
    isAuthenticated: Boolean(user),
    authLoading,
    loginSuccess,
    logout,
    loadProducts,
    refreshCart,
    refreshCustomerData,
    refreshSellerData,

    addProduct,
    deleteProduct,

    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,

    wishlist,
    toggleWishlist,

    customerOrders,
    placeOrder,

    sellerOrders,
    sellerProducts,
    sellerStats,
    updateSellerOrderStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
