const prisma = require("../config/prisma");
const { isStoredAvatar } = require("./avatarStorage");

const ADDRESS_SEP = " · ";
const PHONE_MARK = " · Tél ";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  ASSIGNED: "ASSIGNED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
};

const STATUS_LABELS = {
  PENDING: "En attente de validation",
  CONFIRMED: "Confirmée",
  ASSIGNED: "Assignée à un livreur",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REJECTED: "Refusée",
  DELIVERY_FAILED: "Livraison échouée",
};

const STATUS_MESSAGES = {
  PENDING: "Votre commande attend la validation de l'administrateur.",
  CONFIRMED: "Votre commande a été validée. Elle sera bientôt assignée à un livreur.",
  ASSIGNED: "Un livreur a été assigné à votre commande.",
  OUT_FOR_DELIVERY: "Votre commande est en cours de livraison.",
  DELIVERED: "Votre commande a été livrée.",
  CANCELLED: "Cette commande a été annulée.",
  REJECTED: "Cette commande a été refusée. Le stock a été rétabli.",
  DELIVERY_FAILED: "La livraison n'a pas pu être effectuée.",
};

const FLOW = [
  { key: STATUS.PENDING, label: "Commande passée" },
  { key: STATUS.CONFIRMED, label: "Validée par l'admin" },
  { key: STATUS.ASSIGNED, label: "Livreur assigné" },
  { key: STATUS.OUT_FOR_DELIVERY, label: "En cours de livraison" },
  { key: STATUS.DELIVERED, label: "Livrée" },
];

const orderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
  payments: true,
  delivery: {
    include: {
      livreur: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
};

const money = (value) => Math.round(Number(value) * 100) / 100;

const assertUuid = (id, label = "Identifiant") => {
  if (!UUID.test(String(id || ""))) {
    const error = new Error(`${label} invalide`);
    error.status = 400;
    throw error;
  }
};

const parseStoredAddress = (stored) => {
  const text = String(stored || "");
  const phoneIndex = text.lastIndexOf(PHONE_MARK);
  const phone = phoneIndex >= 0 ? text.slice(phoneIndex + PHONE_MARK.length) : null;
  const deliveryAddress = phoneIndex >= 0 ? text.slice(0, phoneIndex) : text;
  return { phone, deliveryAddress };
};

const splitAddress = (stored) => {
  const parts = String(stored || "").split(ADDRESS_SEP);
  if (parts.length < 2) {
    return { city: "", addressLine: parts[0] || "", addressDetails: "" };
  }
  return {
    city: parts[0] || "",
    addressLine: parts[1] || "",
    addressDetails: parts.slice(2).join(ADDRESS_SEP),
  };
};

const reachedIndex = (status, delivery) => {
  if (status === STATUS.DELIVERED) return 4;
  if (status === STATUS.OUT_FOR_DELIVERY || status === STATUS.DELIVERY_FAILED) return 3;
  if (status === STATUS.ASSIGNED) return 2;
  if (status === STATUS.CONFIRMED) return 1;
  if (status === STATUS.CANCELLED && delivery?.assignedAt) return 2;
  return 0;
};

const buildProgress = (status, delivery) => {
  const current = reachedIndex(status, delivery);
  const stopped = [STATUS.CANCELLED, STATUS.REJECTED, STATUS.DELIVERY_FAILED].includes(status);

  return {
    current,
    stopped,
    steps: FLOW.map((step, index) => {
      let state = "upcoming";
      if (index < current) state = "done";
      else if (index === current) {
        if (stopped) state = "stopped";
        else if (status === STATUS.DELIVERED) state = "done";
        else state = "active";
      }
      return { key: step.key, label: step.label, state };
    }),
  };
};

const paymentLabel = (method) =>
  method === "CASH_ON_DELIVERY" ? "Paiement à la livraison" : method || "Non précisé";

const mapPayment = (payment) =>
  payment
    ? {
        method: payment.method,
        status: payment.status,
        label: paymentLabel(payment.method),
        paid: payment.status === "PAID",
      }
    : null;

const mapOrder = (order, audience = "client") => {
  const parsed = parseStoredAddress(order.deliveryAddress);
  const parts = splitAddress(parsed.deliveryAddress);
  const items = (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product?.name || "Produit",
    imageUrl: item.product?.imageUrl || null,
    quantity: item.quantity,
    unitPrice: money(item.unitPrice),
    subtotal: money(item.subtotal),
  }));
  const status = order.status;
  const delivery = order.delivery || null;
  const note = delivery?.deliveryNotes || null;
  const failureReason = status === STATUS.DELIVERY_FAILED ? note : null;
  const clientMessage =
    status === STATUS.DELIVERY_FAILED && failureReason
      ? `${STATUS_MESSAGES.DELIVERY_FAILED} Motif : ${failureReason}`
      : STATUS_MESSAGES[status] || "";
  const staffMessage = {
    [STATUS.PENDING]: "En attente de validation.",
    [STATUS.CONFIRMED]: "Validée, en attente d'un livreur.",
    [STATUS.ASSIGNED]: "Un livreur est assigné.",
    [STATUS.OUT_FOR_DELIVERY]: "Livraison en cours.",
    [STATUS.DELIVERED]: "Livraison terminée.",
    [STATUS.CANCELLED]: "Commande annulée.",
    [STATUS.REJECTED]: "Commande refusée. Le stock a été rétabli.",
    [STATUS.DELIVERY_FAILED]: failureReason
      ? `Livraison échouée. Motif : ${failureReason}`
      : "Livraison échouée.",
  }[status] || clientMessage;
  const livreurName = delivery?.livreur
    ? {
        id: delivery.livreur.id,
        firstName: delivery.livreur.firstName,
        lastName: delivery.livreur.lastName,
      }
    : null;

  const mapped = {
    id: order.id,
    reference: order.id.replace(/-/g, "").slice(0, 8).toUpperCase(),
    orderDate: order.orderDate,
    status,
    statusLabel: STATUS_LABELS[status] || status,
    statusMessage: audience === "client" ? clientMessage : staffMessage,
    progress: buildProgress(status, delivery),
    subtotal: money(items.reduce((sum, item) => sum + item.subtotal, 0)),
    deliveryFee: 0,
    totalAmount: money(order.totalAmount),
    deliveryAddress: parsed.deliveryAddress,
    city: parts.city,
    addressLine: parts.addressLine,
    addressDetails: parts.addressDetails,
    phone: parsed.phone,
    items,
    payment: mapPayment(order.payments?.[0] || null),
    failureReason,
    livreur: livreurName,
  };

  if (audience === "client") {
    mapped.canCancel = status === STATUS.PENDING;
  }

  if (audience === "admin") {
    mapped.client = order.user
      ? {
          id: order.user.id,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
      email: order.user.email,
      phone: order.user.phone,
      avatarUrl: isStoredAvatar(order.user.avatarUrl) ? order.user.avatarUrl : null,
        }
      : null;
    mapped.livreur = delivery?.livreur
      ? {
          id: delivery.livreur.id,
          firstName: delivery.livreur.firstName,
          lastName: delivery.livreur.lastName,
          phone: delivery.livreur.phone,
          isActive: delivery.livreur.isActive,
        }
      : null;
    mapped.delivery = delivery
      ? {
          id: delivery.id,
          status: delivery.status,
          assignedAt: delivery.assignedAt,
          deliveredAt: delivery.deliveredAt,
          notes: note,
        }
      : null;
    mapped.actions = {
      canValidate: status === STATUS.PENDING,
      canReject: status === STATUS.PENDING,
      canAssign:
        status === STATUS.CONFIRMED ||
        status === STATUS.ASSIGNED ||
        status === STATUS.DELIVERY_FAILED ||
        (status === STATUS.OUT_FOR_DELIVERY && delivery?.livreur?.isActive === false),
      canCancel:
        status === STATUS.CONFIRMED ||
        status === STATUS.ASSIGNED ||
        status === STATUS.DELIVERY_FAILED,
    };
  }

  if (audience === "livreur") {
    mapped.client = order.user
      ? {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          phone: parsed.phone || order.user.phone,
        }
      : null;
    mapped.delivery = delivery
      ? {
          id: delivery.id,
          status: delivery.status,
          assignedAt: delivery.assignedAt,
          deliveredAt: delivery.deliveredAt,
          notes: note,
        }
      : null;
    mapped.actions = {
      canStart: status === STATUS.ASSIGNED,
      canDeliver: status === STATUS.OUT_FOR_DELIVERY,
      canFail: status === STATUS.OUT_FOR_DELIVERY,
    };
  }

  return mapped;
};

const lockOrder = async (tx, orderId) => {
  const rows = await tx.$queryRaw`
    SELECT id FROM orders WHERE id = ${orderId}::uuid FOR UPDATE
  `;
  if (!rows.length) return null;
  return tx.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
};

const restoreStock = async (tx, items) => {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
};

const closePendingPayment = async (tx, orderId) => {
  await tx.payment.updateMany({
    where: { orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
};

const collectCashPayment = async (tx, orderId) => {
  await tx.payment.updateMany({
    where: { orderId, method: "CASH_ON_DELIVERY", status: "PENDING" },
    data: { status: "PAID", paymentDate: new Date() },
  });
};

const loadOrder = (orderId) =>
  prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

module.exports = {
  ADDRESS_SEP,
  PHONE_MARK,
  STATUS,
  STATUS_LABELS,
  orderInclude,
  money,
  assertUuid,
  mapOrder,
  lockOrder,
  restoreStock,
  closePendingPayment,
  collectCashPayment,
  loadOrder,
};
