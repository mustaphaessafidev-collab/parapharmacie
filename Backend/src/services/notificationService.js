const prisma = require("../config/prisma");

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class NotificationError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const moneyLabel = (value) =>
  `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} MAD`;

const referenceOf = (id) => String(id || "").replace(/-/g, "").slice(0, 8).toUpperCase();

const pack = (orderId, text) => `${orderId}::${text}`;

const splitMessage = (message) => {
  const value = String(message || "");
  const orderId = value.slice(0, 36);
  if (value.charAt(36) === ":" && value.charAt(37) === ":" && UUID.test(orderId)) {
    return { orderId, text: value.slice(38) };
  }
  return { orderId: null, text: value };
};

const mapNotification = (notification) => {
  const parsed = splitMessage(notification.message);
  return {
    id: notification.id,
    title: notification.title,
    text: parsed.text,
    orderId: parsed.orderId,
    type: notification.type,
    createdAt: notification.createdAt,
    isRead: notification.isRead,
  };
};

const notifyNewOrder = async (order, client) => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admins.length) return;
  const name = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Client";
  const text = `${referenceOf(order.id)} · ${name} · ${moneyLabel(order.totalAmount)}`;
  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: "Nouvelle commande",
      message: pack(order.id, text),
      type: "NEW_ORDER",
    })),
  });
};

const notifyAssignment = async (order, livreurId) => {
  if (!livreurId) return;
  const text = `${order.reference} · ${order.deliveryAddress || "Adresse non renseignée"} · ${moneyLabel(order.totalAmount)}`;
  await prisma.notification.create({
    data: {
      userId: livreurId,
      title: "Nouvelle livraison",
      message: pack(order.id, text),
      type: "DELIVERY_ASSIGNED",
    },
  });
};

const listFor = async (userId, role) => {
  const notifications = await prisma.notification.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const badge =
    role === "LIVREUR"
      ? await prisma.order.count({
          where: { status: "ASSIGNED", delivery: { is: { livreurId: userId } } },
        })
      : await prisma.order.count({ where: { status: "PENDING" } });

  return {
    notifications: notifications.map(mapNotification),
    badge,
  };
};

const markRead = async (userId, id) => {
  if (!UUID.test(String(id || ""))) {
    throw new NotificationError(400, "Identifiant de notification invalide");
  }
  const updated = await prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true },
  });
  if (!updated.count) throw new NotificationError(404, "Notification introuvable");
  return { success: true };
};

module.exports = {
  NotificationError,
  notifyNewOrder,
  notifyAssignment,
  listFor,
  markRead,
};
