import { getSession } from "./authService";

const clientRequest = async (path, { method = "GET", body } = {}) => {
  const session = getSession();
  let response;

  try {
    response = await fetch(`/api/client${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${session?.token || ""}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez que l'API est démarrée.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "La requête a échoué");
  }

  return data;
};

const publicRequest = async (path) => {
  let response;
  try {
    response = await fetch(path);
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez que l'API est démarrée.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "La requête a échoué");
  }

  return data;
};

export const fetchCatalog = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value));
  });
  return publicRequest(`/api/products?${params.toString()}`);
};

export const fetchProduct = (id) => publicRequest(`/api/products/${id}`);

export const fetchCategories = () => publicRequest("/api/categories");

export const fetchProfile = () => clientRequest("/profile");
export const updateProfile = (body) => clientRequest("/profile", { method: "PATCH", body });
export const changePassword = (body) =>
  clientRequest("/profile/password", { method: "PATCH", body });

export const uploadAvatar = async (file) => {
  const session = getSession();
  const body = new FormData();
  body.append("avatar", file);
  let response;
  try {
    response = await fetch("/api/client/profile/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.token || ""}` },
      body,
    });
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez que l'API est démarrée.");
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) throw new Error(data?.message || "La photo n'a pas pu être envoyée");
  return data;
};

export const removeAvatar = () => clientRequest("/profile/avatar", { method: "DELETE" });

export const fetchCart = () => clientRequest("/cart");
export const addCartItem = (productId, quantity = 1) =>
  clientRequest("/cart/items", { method: "POST", body: { productId, quantity } });
export const updateCartItem = (productId, quantity) =>
  clientRequest(`/cart/items/${productId}`, { method: "PATCH", body: { quantity } });
export const removeCartItem = (productId) =>
  clientRequest(`/cart/items/${productId}`, { method: "DELETE" });

export const placeOrder = (body) => clientRequest("/orders", { method: "POST", body });
export const fetchOrders = () => clientRequest("/orders");
export const fetchOrder = (id) => clientRequest(`/orders/${id}`);
export const cancelOrder = (id) => clientRequest(`/orders/${id}/cancel`, { method: "POST", body: {} });
