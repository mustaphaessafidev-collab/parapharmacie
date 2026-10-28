import { getSession } from "./authService";

const adminRequest = async (path, { method = "GET", body } = {}) => {
  const session = getSession();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let response;

  try {
    response = await fetch(`/api/admin${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${session?.token || ""}`,
        ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
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

export const fetchProfile = () => adminRequest("/profile");
export const updateProfile = (body) =>
  adminRequest("/profile", { method: "PATCH", body });
export const changePassword = (body) =>
  adminRequest("/profile/password", { method: "PATCH", body });

export const fetchDashboard = (period) =>
  adminRequest(`/dashboard?period=${encodeURIComponent(period)}`);

export const fetchClients = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value));
  });

  return adminRequest(`/clients?${params.toString()}`);
};

export const fetchClient = (id) => adminRequest(`/clients/${id}`);

export const updateClient = (id, body) =>
  adminRequest(`/clients/${id}`, { method: "PATCH", body });

export const updateClientStatus = (id, isActive) =>
  adminRequest(`/clients/${id}/status`, { method: "PATCH", body: { isActive } });

export const deleteClient = (id) =>
  adminRequest(`/clients/${id}`, { method: "DELETE" });

export const fetchLivreurs = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value));
  });

  return adminRequest(`/livreurs?${params.toString()}`);
};

export const fetchLivreur = (id) => adminRequest(`/livreurs/${id}`);

export const createLivreur = (body) =>
  adminRequest("/livreurs", { method: "POST", body });

export const updateLivreur = (id, body) =>
  adminRequest(`/livreurs/${id}`, { method: "PATCH", body });

export const updateLivreurStatus = (id, isActive) =>
  adminRequest(`/livreurs/${id}/status`, { method: "PATCH", body: { isActive } });

export const deleteLivreur = (id) =>
  adminRequest(`/livreurs/${id}`, { method: "DELETE" });

const withQuery = (path, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value));
  });
  const query = params.toString();
  return adminRequest(query ? `${path}?${query}` : path);
};

export const fetchCategories = (filters) => withQuery("/categories", filters);
export const fetchCategory = (id) => adminRequest(`/categories/${id}`);
export const createCategory = (body) =>
  adminRequest("/categories", { method: "POST", body });
export const updateCategory = (id, body) =>
  adminRequest(`/categories/${id}`, { method: "PATCH", body });
export const deleteCategory = (id, body) =>
  adminRequest(`/categories/${id}`, { method: "DELETE", body });

export const fetchBrands = () => adminRequest("/brands");
const productFormData = (payload, file) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  if (file) form.append("image", file);
  return form;
};

export const fetchProducts = (filters) => withQuery("/products", filters);
export const fetchProduct = (id) => adminRequest(`/products/${id}`);
export const createProduct = (payload, file) =>
  adminRequest("/products", { method: "POST", body: productFormData(payload, file) });
export const updateProduct = (id, payload, file) =>
  adminRequest(`/products/${id}`, { method: "PATCH", body: productFormData(payload, file) });
export const updateProductStatus = (id, isActive) =>
  adminRequest(`/products/${id}/status`, { method: "PATCH", body: { isActive } });
export const deleteProduct = (id) =>
  adminRequest(`/products/${id}`, { method: "DELETE" });

export const fetchNotifications = () => adminRequest("/notifications");
export const markNotificationRead = (id) =>
  adminRequest(`/notifications/${id}/read`, { method: "PATCH", body: {} });

export const fetchOrders = (filters) => withQuery("/orders", filters);
export const fetchOrder = (id) => adminRequest(`/orders/${id}`);
export const fetchAssignees = () => adminRequest("/orders/assignees");
export const validateOrder = (id) =>
  adminRequest(`/orders/${id}/validate`, { method: "POST", body: {} });
export const rejectOrder = (id, reason) =>
  adminRequest(`/orders/${id}/reject`, { method: "POST", body: { reason } });
export const assignOrder = (id, livreurId) =>
  adminRequest(`/orders/${id}/assign`, { method: "POST", body: { livreurId } });
export const cancelAdminOrder = (id, reason) =>
  adminRequest(`/orders/${id}/cancel`, { method: "POST", body: { reason } });
