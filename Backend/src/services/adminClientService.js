const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { isStoredAvatar } = require("./avatarStorage");

const PAGE_SIZES = new Set([10, 20, 50]);
const SORTS = {
  createdAt: "u.created_at",
  name: "u.last_name",
  email: "u.email",
  orders: '"orderCount"',
  spent: '"totalSpent"',
  status: "u.is_active",
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  avatarUrl: true,
};

const recentSince = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

const isRecent = (date, since = recentSince()) => new Date(date) >= since;

const parsePage = (value) => {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const parsePageSize = (value) => {
  const size = Number.parseInt(value, 10);
  return PAGE_SIZES.has(size) ? size : 10;
};

const parseDate = (value, label) => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AdminError(400, `${label} invalide`);
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new AdminError(400, `${label} invalide`);
  }

  return date;
};

const likePattern = (value) =>
  `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();

  if (!text && required) {
    throw new AdminError(400, `${label} est obligatoire`);
  }

  if (text.length > max) {
    throw new AdminError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }

  return text;
};

const assertClientId = (id) => {
  if (!UUID.test(String(id || ""))) {
    throw new AdminError(400, "Identifiant client invalide");
  }
};

const findClient = async (id) => {
  assertClientId(id);

  const client = await prisma.user.findFirst({
    where: { id, role: "CLIENT" },
    select: { id: true },
  });

  if (!client) {
    throw new AdminError(404, "Client introuvable");
  }

  return client;
};

const mapOrder = (order) => ({
  id: order.id,
  orderDate: order.orderDate,
  status: order.status,
  totalAmount: Number(order.totalAmount),
  deliveryAddress: order.deliveryAddress,
  items: order.items.map((item) => ({
    id: item.id,
    productName: item.product?.name || "Produit indisponible",
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
  })),
});

const listClients = async (query) => {
  const pageSize = parsePageSize(query.pageSize);
  const requestedPage = parsePage(query.page);
  const sort = SORTS[query.sort] ? query.sort : "createdAt";
  const direction = query.order === "asc" ? "ASC" : "DESC";
  const search = String(query.search || "").trim().slice(0, 100);
  const status = ["all", "active", "inactive"].includes(query.status)
    ? query.status
    : "all";
  const registered = ["all", "7d", "30d", "custom"].includes(query.registered)
    ? query.registered
    : "all";

  const filters = [Prisma.sql`u.role = 'CLIENT'`];

  if (search) {
    const pattern = likePattern(search);
    filters.push(Prisma.sql`(
      u.first_name ILIKE ${pattern} ESCAPE '\\'
      OR u.last_name ILIKE ${pattern} ESCAPE '\\'
      OR u.email ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(u.phone, '') ILIKE ${pattern} ESCAPE '\\'
      OR u.id::text ILIKE ${pattern} ESCAPE '\\'
    )`);
  }

  if (status === "active") filters.push(Prisma.sql`u.is_active = TRUE`);
  if (status === "inactive") filters.push(Prisma.sql`u.is_active = FALSE`);

  if (registered === "7d" || registered === "30d") {
    const since = new Date();
    since.setDate(since.getDate() - (registered === "7d" ? 7 : 30));
    filters.push(Prisma.sql`u.created_at >= ${since}`);
  }

  if (registered === "custom") {
    const from = parseDate(query.from, "La date de début");
    const to = parseDate(query.to, "La date de fin");

    if (from && to && from > to) {
      throw new AdminError(400, "La date de début doit précéder la date de fin");
    }

    if (from) filters.push(Prisma.sql`u.created_at >= ${from}`);
    if (to) {
      const end = new Date(to);
      end.setDate(end.getDate() + 1);
      filters.push(Prisma.sql`u.created_at < ${end}`);
    }
  }

  const whereSql = Prisma.join(filters, " AND ");
  const countRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM users u
    WHERE ${whereSql}
  `;
  const total = Number(countRows[0]?.total || 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const nameOrder =
    sort === "name"
      ? `u.last_name ${direction}, u.first_name ${direction}`
      : `${SORTS[sort]} ${direction}`;
  const orderBy = Prisma.raw(`${nameOrder}, u.id ASC`);
  const since = recentSince();

  const rows = await prisma.$queryRaw`
    SELECT
      u.id,
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      u.email,
      u.phone,
      u.avatar_url AS "avatarUrl",
      u.is_active AS "isActive",
      u.email_verified AS "emailVerified",
      u.created_at AS "createdAt",
      COUNT(o.id)::int AS "orderCount",
      ROUND(COALESCE(SUM(o.total_amount), 0)::numeric, 2)::float AS "totalSpent"
    FROM users u
    LEFT JOIN orders o ON o.id_user = u.id
    WHERE ${whereSql}
    GROUP BY u.id
    ORDER BY ${orderBy}
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  const summaryRows = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE is_active)::int AS active,
      COUNT(*) FILTER (WHERE NOT is_active)::int AS inactive,
      COUNT(*) FILTER (WHERE created_at >= ${since})::int AS "recent7"
    FROM users
    WHERE role = 'CLIENT'
  `;
  const summary = summaryRows[0] || {};

  return {
    summary: {
      total: Number(summary.total || 0),
      active: Number(summary.active || 0),
      inactive: Number(summary.inactive || 0),
      recent7: Number(summary.recent7 || 0),
    },
    clients: rows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      avatarUrl: isStoredAvatar(row.avatarUrl) ? row.avatarUrl : null,
      isActive: row.isActive,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
      orderCount: Number(row.orderCount || 0),
      totalSpent: Number(row.totalSpent || 0),
      isRecent: isRecent(row.createdAt, since),
    })),
    pagination: { page, pageSize, total, pages },
  };
};

const getClient = async (id) => {
  assertClientId(id);

  const client = await prisma.user.findFirst({
    where: { id, role: "CLIENT" },
    select: {
      ...publicUserSelect,
      orders: {
        orderBy: { orderDate: "desc" },
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!client) {
    throw new AdminError(404, "Client introuvable");
  }

  const orders = client.orders.map(mapOrder);
  const totalSpent = Math.round(
    orders.reduce((sum, order) => sum + order.totalAmount, 0) * 100
  ) / 100;

  return {
    client: {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      avatarUrl: isStoredAvatar(client.avatarUrl) ? client.avatarUrl : null,
      isActive: client.isActive,
      emailVerified: client.emailVerified,
      createdAt: client.createdAt,
      isRecent: isRecent(client.createdAt),
      orderCount: orders.length,
      totalSpent,
      orders,
    },
  };
};

const updateClient = async (id, body) => {
  await findClient(id);

  const firstName = cleanText(body.firstName, 100, "Le prénom", true);
  const lastName = cleanText(body.lastName, 100, "Le nom", false);
  const email = cleanText(body.email, 255, "L'adresse e-mail", true).toLowerCase();
  const addressText = cleanText(body.address, 255, "L'adresse", false);
  const phoneText = cleanText(body.phone, 20, "Le téléphone", false);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminError(400, "Adresse e-mail invalide");
  }

  if (phoneText && !/^[0-9+\s().-]{6,20}$/.test(phoneText)) {
    throw new AdminError(400, "Numéro de téléphone invalide");
  }

  const phone = phoneText || null;
  const address = addressText || null;

  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });

  if (emailOwner) {
    throw new AdminError(409, "Cette adresse e-mail est déjà utilisée");
  }

  if (phone) {
    const phoneOwner = await prisma.user.findFirst({
      where: { phone, NOT: { id } },
      select: { id: true },
    });

    if (phoneOwner) {
      throw new AdminError(409, "Ce numéro de téléphone est déjà utilisé");
    }
  }

  try {
    const client = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, email, phone, address },
      select: publicUserSelect,
    });

    return { client };
  } catch (error) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(" ") : "";
      throw new AdminError(
        409,
        target.includes("phone")
          ? "Ce numéro de téléphone est déjà utilisé"
          : "Cette adresse e-mail est déjà utilisée"
      );
    }

    throw error;
  }
};

const updateClientStatus = async (id, body) => {
  await findClient(id);

  if (typeof body.isActive !== "boolean") {
    throw new AdminError(400, "Le statut du compte est invalide");
  }

  const client = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
    select: publicUserSelect,
  });

  return { client };
};

const deleteClient = async (id) => {
  assertClientId(id);

  const client = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      role: true,
      _count: { select: { orders: true } },
    },
  });

  if (!client || client.role !== "CLIENT") {
    throw new AdminError(404, "Client introuvable");
  }

  if (client._count.orders > 0) {
    throw new AdminError(
      409,
      "Ce client a des commandes. Le compte est conservé afin de garder l'historique des ventes."
    );
  }

  try {
    await prisma.user.delete({ where: { id: client.id } });
  } catch (error) {
    if (error.code === "P2003") {
      throw new AdminError(
        409,
        "Ce compte est lié à des enregistrements qui doivent être conservés."
      );
    }

    throw error;
  }

  return { deleted: true };
};

module.exports = {
  AdminError,
  listClients,
  getClient,
  updateClient,
  updateClientStatus,
  deleteClient,
};
