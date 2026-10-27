const prisma = require("../config/prisma");

const LOW_STOCK_MAX = 5;
const PENDING_STATUSES = new Set([
  "en_attente",
  "preparation",
  "en_preparation",
  "en_cours",
  "pending",
]);

const periodRange = (period, now = new Date()) => {
  const start = new Date(now);
  const end = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    return { start, end, unit: "hour" };
  }

  if (period === "7d") {
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    return { start, end, unit: "day" };
  }

  if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setFullYear(start.getFullYear() + 1, 0, 1);
    end.setHours(0, 0, 0, 0);
    return { start, end, unit: "month" };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  end.setMonth(start.getMonth() + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start, end, unit: "day" };
};

const bucketStart = (date, unit) => {
  const value = new Date(date);

  if (unit === "hour") {
    value.setMinutes(0, 0, 0);
    return value;
  }

  if (unit === "month") {
    value.setDate(1);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  value.setHours(0, 0, 0, 0);
  return value;
};

const addBucket = (date, unit) => {
  const value = new Date(date);

  if (unit === "hour") {
    value.setHours(value.getHours() + 1);
    return value;
  }

  if (unit === "month") {
    value.setMonth(value.getMonth() + 1);
    return value;
  }

  value.setDate(value.getDate() + 1);
  return value;
};

const bucketLabel = (date, unit) => {
  if (unit === "hour") {
    return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit" }).format(date);
  }

  if (unit === "month") {
    return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
};

const buildSeries = (orders, range) => {
  const points = [];
  let cursor = bucketStart(range.start, range.unit);
  const limit = bucketStart(new Date(range.end.getTime() - 1), range.unit);

  while (cursor <= limit) {
    points.push({
      key: cursor.toISOString(),
      label: bucketLabel(cursor, range.unit),
      orders: 0,
      revenue: 0,
    });
    cursor = addBucket(cursor, range.unit);
  }

  for (const order of orders) {
    const key = bucketStart(order.createdAt, range.unit).toISOString();
    const point = points.find((item) => item.key === key);

    if (!point) continue;

    point.orders += 1;
    point.revenue += Number(order.totalAmount);
  }

  return points.map(({ label, orders: count, revenue }) => ({
    label,
    orders: count,
    revenue: Math.round(revenue * 100) / 100,
  }));
};

const money = (value) => Math.round(Number(value || 0) * 100) / 100;

const getDashboard = async (period) => {
  const range = periodRange(period);

  const [
    products,
    activeProducts,
    clients,
    verifiedClients,
    lowStockCount,
    lowStockProducts,
    categories,
    periodOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "CLIENT", emailVerified: true } }),
    prisma.product.count({ where: { stockQuantity: { lte: LOW_STOCK_MAX } } }),
    prisma.product.findMany({
      where: { stockQuantity: { lte: LOW_STOCK_MAX } },
      orderBy: { stockQuantity: "asc" },
      take: 6,
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: { select: { quantity: true } },
        payments: {
          select: { method: true, status: true },
          take: 1,
        },
      },
    }),
  ]);

  const pendingOrders = periodOrders.filter((order) =>
    PENDING_STATUSES.has(String(order.status || "").trim().toLowerCase())
  ).length;

  const revenue = periodOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  return {
    period,
    lowStockMax: LOW_STOCK_MAX,
    totals: {
      products,
      activeProducts,
      clients,
      verifiedClients,
      orders: periodOrders.length,
      pendingOrders,
      revenue: money(revenue),
      lowStock: lowStockCount,
    },
    series: buildSeries(periodOrders, range),
    categories: categories
      .filter((category) => category._count.products > 0)
      .map((category) => ({
        name: category.name,
        products: category._count.products,
      })),
    recentOrders: periodOrders.slice(0, 8).map((order) => ({
      id: order.id,
      date: order.orderDate,
      amount: money(order.totalAmount),
      status: order.status,
      client: `${order.user.firstName} ${order.user.lastName}`.trim(),
      articles: order.items.reduce((sum, item) => sum + item.quantity, 0),
      paymentMethod: order.payments[0]?.method || null,
      paymentStatus: order.payments[0]?.status || null,
    })),
    lowStockProducts: lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      category: product.category.name,
    })),
  };
};

module.exports = { getDashboard };
