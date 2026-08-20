const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("localroots_token");
  const headers = new Headers(options.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  login: (body) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  register: (body) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  me: () => request("/auth/me"),

  getProducts: (params = {}) => {
    const search = new URLSearchParams({ limit: "100" });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== 999) {
        search.set(key, value);
      }
    });
    const qs = search.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct: (id) => request(`/products/${id}`),
  getReviews: (id) => request(`/products/${id}/reviews`),

  getCart: () => request("/cart"),
  addCartItem: (productId, quantity = 1) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (productId, quantity) =>
    request(`/cart/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (productId) =>
    request(`/cart/items/${productId}`, { method: "DELETE" }),
  clearCart: () => request("/cart", { method: "DELETE" }),

  placeOrder: (body) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getMyOrders: () => request("/orders/my-orders"),

  getCustomerStats: () => request("/customer/stats"),

  getSellerProducts: () => request("/seller/products"),
  getSellerOrders: () => request("/seller/orders"),
  getSellerStats: () => request("/seller/stats"),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  createProduct: (formData) =>
    request("/products", {
      method: "POST",
      body: formData,
    }),
  updateProduct: (id, formData) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: formData,
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, { method: "DELETE" }),

  createReview: (productId, body) =>
    request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function normalizeProduct(p) {
  const seller = p.seller && typeof p.seller === "object" ? p.seller : null;
  const images = Array.isArray(p.images) ? p.images : [];
  return {
    ...p,
    id: p._id || p.id,
    sellerId: seller?._id || p.sellerId || p.seller,
    seller,
    image: p.image || images[0] || "",
    images,
    distance: typeof p.distance === "number" ? `${p.distance} km` : (p.distance || ""),
    city: p.city || seller?.location?.city || "",
  };
}

export function normalizeCart(data) {
  return {
    items: (data?.items || []).map((item) => ({
      productId: item.product?._id || item.product,
      qty: item.quantity,
      product: item.product,
      price: item.price,
    })),
    cartTotal: data?.cartTotal || 0,
    cartCount: data?.cartCount || 0,
  };
}

export function normalizeOrder(order) {
  return {
    ...order,
    id: order._id || order.id,
    amount: order.totalAmount ?? order.amount ?? 0,
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : order.date,
    products: (order.items || order.products || []).map((item) => ({
      productId: item.product?._id || item.product,
      name: item.productName || item.product?.name || item.name,
      qty: item.quantity ?? item.qty,
      price: item.price,
      status: item.status,
    })),
    address: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
  };
}
