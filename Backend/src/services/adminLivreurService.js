const bcrypt = require("bcryptjs");
const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

const PAGE_SIZES = new Set([10, 20, 50]);
const SORTS = {
  createdAt: "u.created_at",
  name: "u.last_name",
  email: "u.email",
  assigned: '"assignedCount"',
  completed: '"completedCount"',
  status: "u.is_active",
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMPLETED_STATUSES = new Set([
  "livre",
  "livré",
  "livree",
  "livrée",
  "delivered",
  "terminee",
  "terminée",
]);

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
};

const parsePage = (value) => {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const parsePageSize = (value) => {
  const size = Number.parseInt(value, 10);
  return PAGE_SIZES.has(size) ? size : 10;
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

const assertLivreurId = (id) => {
  if (!UUID.test(String(id || ""))) {
    throw new AdminError(400, "Identifiant livreur invalide");
  }
};

const normalizePhone = (value, required) => {
  const text = cleanText(value, 20, "Le téléphone", required);
  if (!text) return null;

  const digits = text.replace(/\D/g, "");
  if (!/^(?:0\d{9}|[5-7]\d{8}|212\d{9}|00212\d{9})$/.test(digits)) {
    throw new AdminError(400, "Veuillez saisir un numéro de téléphone marocain valide");
  }

  return text;
};

const normalizeEmail = (value) => {
  const email = cleanText(value, 255, "L'adresse e-mail", true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminError(400, "Adresse e-mail invalide");
  }
  return email;
};

const assertPassword = (password, confirmPassword) => {
  if (!password) {
    throw new AdminError(400, "Le mot de passe est obligatoire");
  }
  if (password.length < 8) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/\d/.test(password)) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins un chiffre");
  }
  if (password !== confirmPassword) {
    throw new AdminError(400, "Les mots de passe ne correspondent pas");
  }
};

const splitName = (fullName) => {
  const parts = cleanText(fullName, 201, "Le nom complet", true).split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");

  if (!firstName || !lastName) {
    throw new AdminError(400, "Veuillez saisir le prénom et le nom");
  }
  if (firstName.length > 100 || lastName.length > 100) {
    throw new AdminError(400, "Le prénom et le nom ne peuvent pas dépasser 100 caractères");
  }

  return { firstName, lastName };
};

const isCompleted = (delivery) =>
  Boolean(delivery.deliveredAt) ||
  COMPLETED_STATUSES.has(String(delivery.status || "").toLowerCase());

const uniqueConflict = (error) => {
  if (error.code !== "P2002") return null;
  const target = Array.isArray(error.meta?.target) ? error.meta.target.join(" ") : "";
  return new AdminError(
    409,
    target.includes("phone")
      ? "Ce numéro de téléphone est déjà utilisé"
      : "Cette adresse e-mail est déjà utilisée"
  );
};

const ensureAvailable = async ({ email, phone, id }) => {
  const emailOwner = await prisma.user.findFirst({
    where: { email, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (emailOwner) {
    throw new AdminError(409, "Cette adresse e-mail est déjà utilisée");
  }

  if (!phone) return;

  const phoneOwner = await prisma.user.findFirst({
    where: { phone, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (phoneOwner) {
    throw new AdminError(409, "Ce numéro de téléphone est déjà utilisé");
  }
};

const findLivreur = async (id) => {
  assertLivreurId(id);
  const livreur = await prisma.user.findFirst({
    where: { id, role: "LIVREUR" },
    select: { id: true },
  });
  if (!livreur) throw new AdminError(404, "Livreur introuvable");
  return livreur;
};

const mapDelivery = (delivery) => ({
  id: delivery.id,
  status: delivery.status,
  deliveryAddress: delivery.deliveryAddress,
  assignedAt: delivery.assignedAt,
  deliveredAt: delivery.deliveredAt,
  deliveryNotes: delivery.deliveryNotes,
  completed: isCompleted(delivery),
  order: delivery.order
    ? {
        id: delivery.order.id,
        orderDate: delivery.order.orderDate,
        status: delivery.order.status,
        totalAmount: Number(delivery.order.totalAmount),
        deliveryAddress: delivery.order.deliveryAddress,
      }
    : null,
});

const listLivreurs = async (query) => {
  const pageSize = parsePageSize(query.pageSize);
  const requestedPage = parsePage(query.page);
  const sort = SORTS[query.sort] ? query.sort : "createdAt";
  const direction = query.order === "asc" ? "ASC" : "DESC";
  const search = String(query.search || "").trim().slice(0, 100);
  const status = ["all", "active", "inactive"].includes(query.status) ? query.status : "all";
  const deliveries = ["all", "assigned", "none"].includes(query.deliveries)
    ? query.deliveries
    : "all";
  const filters = [Prisma.sql`u.role = 'LIVREUR'`];

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
  if (deliveries === "assigned") {
    filters.push(Prisma.sql`EXISTS (SELECT 1 FROM deliveries d2 WHERE d2.id_livreur = u.id)`);
  }
  if (deliveries === "none") {
    filters.push(Prisma.sql`NOT EXISTS (SELECT 1 FROM deliveries d2 WHERE d2.id_livreur = u.id)`);
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

  const rows = await prisma.$queryRaw`
    SELECT
      u.id,
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      u.email,
      u.phone,
      u.is_active AS "isActive",
      u.email_verified AS "emailVerified",
      u.created_at AS "createdAt",
      COUNT(d.id)::int AS "assignedCount",
      COUNT(d.id) FILTER (
        WHERE d.delivered_at IS NOT NULL
          OR lower(d.status) IN (
            'livre', 'livré', 'livree', 'livrée', 'delivered', 'terminee', 'terminée'
          )
      )::int AS "completedCount"
    FROM users u
    LEFT JOIN deliveries d ON d.id_livreur = u.id
    WHERE ${whereSql}
    GROUP BY u.id
    ORDER BY ${orderBy}
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  const summaryRows = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE u.is_active)::int AS active,
      COUNT(*) FILTER (WHERE NOT u.is_active)::int AS inactive,
      COUNT(*) FILTER (
        WHERE EXISTS (SELECT 1 FROM deliveries d WHERE d.id_livreur = u.id)
      )::int AS "withDeliveries"
    FROM users u
    WHERE u.role = 'LIVREUR'
  `;
  const summary = summaryRows[0] || {};

  return {
    summary: {
      total: Number(summary.total || 0),
      active: Number(summary.active || 0),
      inactive: Number(summary.inactive || 0),
      withDeliveries: Number(summary.withDeliveries || 0),
    },
    livreurs: rows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      isActive: row.isActive,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
      assignedCount: Number(row.assignedCount || 0),
      completedCount: Number(row.completedCount || 0),
    })),
    pagination: { page, pageSize, total, pages },
  };
};

const getLivreur = async (id) => {
  assertLivreurId(id);

  const livreur = await prisma.user.findFirst({
    where: { id, role: "LIVREUR" },
    select: {
      ...publicUserSelect,
      deliveries: {
        include: {
          order: {
            select: {
              id: true,
              orderDate: true,
              status: true,
              totalAmount: true,
              deliveryAddress: true,
            },
          },
        },
      },
    },
  });

  if (!livreur) throw new AdminError(404, "Livreur introuvable");

  const deliveries = livreur.deliveries.map(mapDelivery).sort((left, right) => {
    const leftTime = left.assignedAt ? new Date(left.assignedAt).getTime() : 0;
    const rightTime = right.assignedAt ? new Date(right.assignedAt).getTime() : 0;
    return rightTime - leftTime;
  });
  const livreurCount = await prisma.user.count({ where: { role: "LIVREUR" } });

  return {
    livreurCount,
    livreur: {
      id: livreur.id,
      firstName: livreur.firstName,
      lastName: livreur.lastName,
      email: livreur.email,
      phone: livreur.phone,
      address: livreur.address,
      isActive: livreur.isActive,
      emailVerified: livreur.emailVerified,
      createdAt: livreur.createdAt,
      assignedCount: deliveries.length,
      completedCount: deliveries.filter((delivery) => delivery.completed).length,
      deliveries,
    },
  };
};

const createLivreur = async (body) => {
  const { firstName, lastName } = splitName(body.fullName);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone, true);
  const address = cleanText(body.address, 255, "L'adresse", false) || null;
  assertPassword(String(body.password || ""), String(body.confirmPassword || ""));
  await ensureAvailable({ email, phone });

  try {
    const livreur = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        passwordHash: await bcrypt.hash(String(body.password), 10),
        role: "LIVREUR",
        emailVerified: true,
        isActive: true,
      },
      select: publicUserSelect,
    });

    return { livreur };
  } catch (error) {
    const conflict = uniqueConflict(error);
    if (conflict) throw conflict;
    throw error;
  }
};

const updateLivreur = async (id, body) => {
  await findLivreur(id);

  const firstName = cleanText(body.firstName, 100, "Le prénom", true);
  const lastName = cleanText(body.lastName, 100, "Le nom", true);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone, false);
  const address = cleanText(body.address, 255, "L'adresse", false) || null;
  await ensureAvailable({ email, phone, id });

  try {
    const livreur = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, email, phone, address },
      select: publicUserSelect,
    });
    return { livreur };
  } catch (error) {
    const conflict = uniqueConflict(error);
    if (conflict) throw conflict;
    throw error;
  }
};

const updateLivreurStatus = async (id, body) => {
  await findLivreur(id);

  if (typeof body.isActive !== "boolean") {
    throw new AdminError(400, "Le statut du compte est invalide");
  }

  const livreur = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
    select: publicUserSelect,
  });

  return { livreur };
};

const deleteLivreur = async (id) => {
  assertLivreurId(id);

  const livreur = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      role: true,
      _count: { select: { deliveries: true, orders: true } },
    },
  });

  if (!livreur || livreur.role !== "LIVREUR") {
    throw new AdminError(404, "Livreur introuvable");
  }

  if (livreur._count.deliveries > 0 || livreur._count.orders > 0) {
    throw new AdminError(
      409,
      "Ce livreur a un historique de livraisons. Désactivez le compte pour le conserver."
    );
  }

  try {
    await prisma.user.delete({ where: { id: livreur.id } });
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
  listLivreurs,
  getLivreur,
  createLivreur,
  updateLivreur,
  updateLivreurStatus,
  deleteLivreur,
};
