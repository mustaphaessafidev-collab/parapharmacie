const prisma = require("../config/prisma");
const {
  STATUS,
  orderInclude,
  assertUuid,
  mapOrder,
  lockOrder,
  restoreStock,
  closePendingPayment,
} = require("./orderWorkflow");
const { notifyAssignment } = require("./notificationService");

const PAGE_SIZES = new Set([10, 20, 50]);
const STATUS_FILTERS = new Set([
  "all",
  STATUS.PENDING,
  STATUS.CONFIRMED,
  STATUS.ASSIGNED,
  STATUS.OUT_FOR_DELIVERY,
  STATUS.DELIVERED,
  STATUS.CANCELLED,
  STATUS.REJECTED,
  STATUS.DELIVERY_FAILED,
]);

class AdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new AdminError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new AdminError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const parsePage = (value) => {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const parsePageSize = (value) => {
  const size = Number.parseInt(value, 10);
  return PAGE_SIZES.has(size) ? size : 10;
};

const summaryFrom = (grouped) => {
  const countOf = (status) => grouped.find((row) => row.status === status)?._count._all || 0;
  return {
    total: grouped.reduce((sum, row) => sum + row._count._all, 0),
    pending: countOf(STATUS.PENDING),
    confirmed: countOf(STATUS.CONFIRMED),
    assigned: countOf(STATUS.ASSIGNED),
    outForDelivery: countOf(STATUS.OUT_FOR_DELIVERY),
    delivered: countOf(STATUS.DELIVERED),
    cancelled: countOf(STATUS.CANCELLED),
    rejected: countOf(STATUS.REJECTED),
    failed: countOf(STATUS.DELIVERY_FAILED),
  };
};

const listOrders = async (query) => {
  const pageSize = parsePageSize(query.pageSize);
  const requestedPage = parsePage(query.page);
  const status = STATUS_FILTERS.has(query.status) ? query.status : "all";
  const search = String(query.search || "").trim().slice(0, 100);
  const where = {};

  if (status !== "all") where.status = status;

  if (search) {
    const or = [
      { deliveryAddress: { contains: search, mode: "insensitive" } },
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search, mode: "insensitive" } } },
    ];

    if (/^[0-9a-f-]{4,}$/i.test(search)) {
      const compact = search.replace(/-/g, "");
      const rows = await prisma.$queryRaw`
        SELECT id FROM orders
        WHERE REPLACE(id::text, '-', '') ILIKE ${`%${compact}%`}
        LIMIT 100
      `;
      if (rows.length) or.push({ id: { in: rows.map((row) => row.id) } });
    }

    where.OR = or;
  }

  const total = await prisma.order.count({ where });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const [orders, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { orderDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return {
    summary: summaryFrom(grouped),
    orders: orders.map((order) => mapOrder(order, "admin")),
    pagination: { page, pageSize, total, pages },
  };
};

const getOrder = async (orderId) => {
  assertUuid(orderId, "Identifiant de commande");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  if (!order) throw new AdminError(404, "Commande introuvable");
  return { order: mapOrder(order, "admin") };
};

const listAssignees = async () => {
  const livreurs = await prisma.user.findMany({
    where: { role: "LIVREUR", isActive: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      deliveries: {
        where: { status: { in: [STATUS.ASSIGNED, STATUS.OUT_FOR_DELIVERY] } },
        select: { id: true },
      },
    },
  });

  return {
    livreurs: livreurs.map((livreur) => ({
      id: livreur.id,
      firstName: livreur.firstName,
      lastName: livreur.lastName,
      phone: livreur.phone,
      activeDeliveries: livreur.deliveries.length,
    })),
  };
};

const withLockedOrder = async (orderId, mutate) => {
  assertUuid(orderId, "Identifiant de commande");
  const order = await prisma.$transaction(async (tx) => {
    const current = await lockOrder(tx, orderId);
    if (!current) throw new AdminError(404, "Commande introuvable");
    await mutate(tx, current);
    return tx.order.findUnique({ where: { id: current.id }, include: orderInclude });
  });
  return { order: mapOrder(order, "admin") };
};

const validateOrder = (orderId) =>
  withLockedOrder(orderId, async (tx, current) => {
    if (current.status !== STATUS.PENDING) {
      throw new AdminError(400, "Seule une commande en attente peut être validée");
    }
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.CONFIRMED },
    });
  });

const rejectOrder = (orderId, body = {}) =>
  withLockedOrder(orderId, async (tx, current) => {
    if (current.status !== STATUS.PENDING) {
      throw new AdminError(400, "Seule une commande en attente peut être refusée");
    }
    const reason = cleanText(body.reason, 500, "Le motif", false);
    await restoreStock(tx, current.items);
    await closePendingPayment(tx, current.id);
    await tx.delivery.upsert({
      where: { orderId: current.id },
      create: {
        orderId: current.id,
        status: STATUS.REJECTED,
        deliveryAddress: current.deliveryAddress,
        deliveryNotes: reason || null,
      },
      update: {
        status: STATUS.REJECTED,
        livreurId: null,
        deliveryNotes: reason || null,
      },
    });
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.REJECTED },
    });
  });

const assignOrder = async (orderId, body = {}) => {
  let livreurId = null;
  const result = await withLockedOrder(orderId, async (tx, current) => {
    if (current.status === STATUS.PENDING) {
      throw new AdminError(400, "Validez la commande avant de l'assigner à un livreur");
    }
    if ([STATUS.DELIVERED, STATUS.CANCELLED, STATUS.REJECTED].includes(current.status)) {
      throw new AdminError(400, "Cette commande ne peut plus être assignée");
    }
    if (
      current.status === STATUS.OUT_FOR_DELIVERY &&
      current.delivery?.livreur?.isActive !== false
    ) {
      throw new AdminError(400, "La livraison est déjà en cours");
    }
    if (
      ![STATUS.CONFIRMED, STATUS.ASSIGNED, STATUS.DELIVERY_FAILED, STATUS.OUT_FOR_DELIVERY].includes(
        current.status
      )
    ) {
      throw new AdminError(400, "Cette commande ne peut pas être assignée");
    }

    assertUuid(body.livreurId, "Identifiant livreur");
    const livreur = await tx.user.findFirst({
      where: { id: body.livreurId, role: "LIVREUR", isActive: true },
      select: { id: true },
    });
    if (!livreur) throw new AdminError(400, "Sélectionnez un livreur actif");
    livreurId = livreur.id;
    if (current.delivery?.livreurId === livreur.id && current.status === STATUS.ASSIGNED) {
      throw new AdminError(400, "Ce livreur est déjà assigné à cette commande");
    }

    const previous = current.delivery?.deliveryNotes;
    const notes =
      current.status === STATUS.DELIVERY_FAILED && previous
        ? `Réassignée après un échec. Motif précédent : ${previous}`.slice(0, 2000)
        : null;

    await tx.delivery.upsert({
      where: { orderId: current.id },
      create: {
        orderId: current.id,
        livreurId: livreur.id,
        status: STATUS.ASSIGNED,
        assignedAt: new Date(),
        deliveryAddress: current.deliveryAddress,
        deliveryNotes: notes,
      },
      update: {
        livreurId: livreur.id,
        status: STATUS.ASSIGNED,
        assignedAt: new Date(),
        deliveredAt: null,
        deliveryAddress: current.deliveryAddress,
        deliveryNotes: notes,
      },
    });
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.ASSIGNED },
    });
  });
  try {
    await notifyAssignment(result.order, livreurId);
  } catch (error) {
    console.error("ASSIGNMENT NOTIFICATION:", error.message);
  }
  return result;
};

const cancelOrder = (orderId, body = {}) =>
  withLockedOrder(orderId, async (tx, current) => {
    if (![STATUS.CONFIRMED, STATUS.ASSIGNED, STATUS.DELIVERY_FAILED].includes(current.status)) {
      throw new AdminError(
        400,
        "Seule une commande validée, assignée ou en échec de livraison peut être annulée"
      );
    }
    const reason = cleanText(body.reason, 500, "Le motif", false);
    await restoreStock(tx, current.items);
    await closePendingPayment(tx, current.id);
    if (current.delivery || reason) {
      await tx.delivery.upsert({
        where: { orderId: current.id },
        create: {
          orderId: current.id,
          status: STATUS.CANCELLED,
          deliveryAddress: current.deliveryAddress,
          deliveryNotes: reason || null,
        },
        update: {
          status: STATUS.CANCELLED,
          deliveryNotes: reason || current.delivery?.deliveryNotes || null,
        },
      });
    }
    await tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.CANCELLED },
    });
  });

module.exports = {
  AdminError,
  listOrders,
  getOrder,
  listAssignees,
  validateOrder,
  rejectOrder,
  assignOrder,
  cancelOrder,
};
