const prisma = require("../config/prisma");
const {
  STATUS,
  orderInclude,
  assertUuid,
  mapOrder,
  lockOrder,
  collectCashPayment,
} = require("./orderWorkflow");

const BUCKETS = {
  waiting: [STATUS.ASSIGNED],
  progress: [STATUS.OUT_FOR_DELIVERY],
  done: [STATUS.DELIVERED, STATUS.DELIVERY_FAILED],
};

class LivreurError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new LivreurError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new LivreurError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const ownedWhere = (livreurId, orderId) => ({
  id: orderId,
  delivery: { is: { livreurId } },
});

const listOrders = async (livreurId, query) => {
  const bucket = BUCKETS[query.bucket] ? query.bucket : "all";
  const where = { delivery: { is: { livreurId } } };
  if (bucket !== "all") where.status = { in: BUCKETS[bucket] };

  const [orders, waiting, progress, done] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { orderDate: "desc" },
    }),
    prisma.order.count({
      where: { delivery: { is: { livreurId } }, status: STATUS.ASSIGNED },
    }),
    prisma.order.count({
      where: { delivery: { is: { livreurId } }, status: STATUS.OUT_FOR_DELIVERY },
    }),
    prisma.order.count({
      where: {
        delivery: { is: { livreurId } },
        status: { in: [STATUS.DELIVERED, STATUS.DELIVERY_FAILED] },
      },
    }),
  ]);

  return {
    summary: { waiting, progress, done },
    orders: orders.map((order) => mapOrder(order, "livreur")),
  };
};

const getOrder = async (livreurId, orderId) => {
  assertUuid(orderId, "Identifiant de commande");
  const order = await prisma.order.findFirst({
    where: ownedWhere(livreurId, orderId),
    include: orderInclude,
  });
  if (!order) throw new LivreurError(404, "Commande introuvable");
  return { order: mapOrder(order, "livreur") };
};

const transitionMessage = (action, status) => {
  if (action === "start") {
    if (status === STATUS.OUT_FOR_DELIVERY) return "La livraison est déjà en cours";
    if (status === STATUS.DELIVERED) return "Une commande livrée ne peut pas être relancée";
    if (status === STATUS.DELIVERY_FAILED) return "Signalez d'abord la commande à l'administrateur pour une réassignation";
    return "La livraison ne peut démarrer que lorsqu'elle vous est assignée";
  }
  if (action === "deliver") {
    if (status === STATUS.ASSIGNED) return "Démarrez la livraison avant de confirmer la remise";
    if (status === STATUS.DELIVERED) return "Cette commande est déjà livrée";
    return "La commande ne peut pas être marquée comme livrée dans son état actuel";
  }
  if (status === STATUS.ASSIGNED) return "Démarrez la livraison avant de signaler un échec";
  if (status === STATUS.DELIVERED) return "Une commande livrée ne peut pas être marquée en échec";
  if (status === STATUS.DELIVERY_FAILED) return "L'échec de livraison est déjà enregistré";
  return "L'échec ne peut pas être signalé dans l'état actuel";
};

const withOwnedOrder = async (livreurId, orderId, action, allowed, mutate) => {
  assertUuid(orderId, "Identifiant de commande");
  const order = await prisma.$transaction(async (tx) => {
    const current = await lockOrder(tx, orderId);
    if (!current || current.delivery?.livreurId !== livreurId) {
      throw new LivreurError(404, "Commande introuvable");
    }
    if (!allowed.includes(current.status)) {
      throw new LivreurError(400, transitionMessage(action, current.status));
    }
    await mutate(tx, current);
    return tx.order.findFirst({
      where: ownedWhere(livreurId, current.id),
      include: orderInclude,
    });
  });
  return { order: mapOrder(order, "livreur") };
};

const startDelivery = (livreurId, orderId) =>
  withOwnedOrder(livreurId, orderId, "start", [STATUS.ASSIGNED], async (tx, current) => {
    await tx.delivery.update({
      where: { orderId: current.id },
      data: { status: STATUS.OUT_FOR_DELIVERY },
    });
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.OUT_FOR_DELIVERY },
    });
  });

const deliverOrder = (livreurId, orderId) =>
  withOwnedOrder(livreurId, orderId, "deliver", [STATUS.OUT_FOR_DELIVERY], async (tx, current) => {
    await collectCashPayment(tx, current.id);
    await tx.delivery.update({
      where: { orderId: current.id },
      data: { status: STATUS.DELIVERED, deliveredAt: new Date() },
    });
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.DELIVERED },
    });
  });

const failDelivery = (livreurId, orderId, body = {}) =>
  withOwnedOrder(livreurId, orderId, "fail", [STATUS.OUT_FOR_DELIVERY], async (tx, current) => {
    const reason = cleanText(body.reason, 500, "Le motif", true);
    if (reason.length < 5) {
      throw new LivreurError(400, "Indiquez le motif de l'échec (5 caractères minimum)");
    }
    await tx.delivery.update({
      where: { orderId: current.id },
      data: { status: STATUS.DELIVERY_FAILED, deliveryNotes: reason, deliveredAt: null },
    });
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.DELIVERY_FAILED },
    });
  });

module.exports = {
  LivreurError,
  listOrders,
  getOrder,
  startDelivery,
  deliverOrder,
  failDelivery,
};
