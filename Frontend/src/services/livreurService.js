import { getSession } from "./authService";

const livreurRequest = async (path, { method = "GET", body } = {}) => {
  const session = getSession();
  let response;

  try {
    response = await fetch(`/api/livreur${path}`, {
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

export const fetchDeliveries = (bucket = "all") =>
  livreurRequest(`/orders?bucket=${encodeURIComponent(bucket)}`);

export const fetchDelivery = (id) => livreurRequest(`/orders/${id}`);

export const startDelivery = (id) =>
  livreurRequest(`/orders/${id}/start`, { method: "POST", body: {} });

export const completeDelivery = (id) =>
  livreurRequest(`/orders/${id}/deliver`, { method: "POST", body: {} });

export const failDelivery = (id, reason) =>
  livreurRequest(`/orders/${id}/fail`, { method: "POST", body: { reason } });

export const fetchNotifications = () => livreurRequest("/notifications");
export const markNotificationRead = (id) =>
  livreurRequest(`/notifications/${id}/read`, { method: "PATCH", body: {} });

export const fetchProfile = () => livreurRequest("/profile");
export const updateProfile = (body) => livreurRequest("/profile", { method: "PATCH", body });
export const changePassword = (body) =>
  livreurRequest("/profile/password", { method: "PATCH", body });

export const uploadAvatar = async (file) => {
  const session = getSession();
  const body = new FormData();
  body.append("avatar", file);
  let response;
  try {
    response = await fetch("/api/livreur/profile/avatar", {
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

export const removeAvatar = () => livreurRequest("/profile/avatar", { method: "DELETE" });
