const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { isStoredAvatar, removeStoredAvatar, assertImageFile } = require("./avatarStorage");
const { notifyNewOrder } = require("./notificationService");
const {
  ADDRESS_SEP,
  PHONE_MARK,
  STATUS,
  orderInclude,
  assertUuid,
  mapOrder,
  lockOrder,
  restoreStock,
  closePendingPayment,
} = require("./orderWorkflow");

const DELIVERY_FEE = 0;
const ORDER_STATUS = STATUS.PENDING;

class ClientError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const money = (value) => Math.round(Number(value) * 100) / 100;

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new ClientError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new ClientError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const normalizeEmail = (value) => {
  const email = cleanText(value, 255, "L'adresse e-mail", true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ClientError(400, "Adresse e-mail invalide");
  }
  return email;
};

const normalizePhone = (value, required) => {
  const text = cleanText(value, 20, "Le téléphone", required);
  if (!text) return null;
  const digits = text.replace(/\D/g, "");
  if (!/^(?:0\d{9}|[5-7]\d{8}|212\d{9}|00212\d{9})$/.test(digits)) {
    throw new ClientError(400, "Veuillez saisir un numéro de téléphone marocain valide");
  }
  return text;
};

const joinAddress = ({ city, addressLine, addressDetails }) =>
  [city, addressLine, addressDetails]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(ADDRESS_SEP);

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

const parseQuantity = (value) => {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new ClientError(400, "La quantité doit être comprise entre 1 et 99");
  }
  return quantity;
};

const findClient = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT" || !user.isActive) {
    throw new ClientError(403, "Accès réservé aux clients");
  }
  return user;
};

const mapProfile = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
  address: user.address,
  ...splitAddress(user.address),
  role: user.role,
  createdAt: user.createdAt,
  emailVerified: user.emailVerified,
  avatarUrl: isStoredAvatar(user.avatarUrl) ? user.avatarUrl : null,
});

const getProfile = async (userId) => {
  const user = await findClient(userId);
  return { profile: mapProfile(user) };
};

const updateProfile = async (userId, body) => {
  const current = await findClient(userId);
  if (body.role !== undefined && body.role !== current.role) {
    throw new ClientError(400, "Le rôle ne peut pas être modifié depuis le profil");
  }

  const firstName = cleanText(body.firstName, 100, "Le prénom", true);
  const lastName = cleanText(body.lastName, 100, "Le nom", true);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone, false);
  const city = cleanText(body.city, 80, "La ville", false);
  const addressLine = cleanText(body.addressLine, 160, "L'adresse", false);
  const addressDetails = cleanText(body.addressDetails, 80, "Le complément d'adresse", false);
  const address = joinAddress({ city, addressLine, addressDetails });
  if (address.length > 255) {
    throw new ClientError(400, "L'adresse complète est trop longue");
  }

  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailOwner) throw new ClientError(409, "Cette adresse e-mail est déjà utilisée");

  if (phone) {
    const phoneOwner = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (phoneOwner) throw new ClientError(409, "Ce numéro de téléphone est déjà utilisé");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      email,
      phone,
      address: address || null,
      emailVerified: true,
    },
  });

  return { profile: mapProfile(user) };
};

const changePassword = async (userId, body) => {
  const current = await findClient(userId);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!current.passwordHash) {
    throw new ClientError(400, "Ce compte n'utilise pas de mot de passe local");
  }
  if (!currentPassword) throw new ClientError(400, "Le mot de passe actuel est obligatoire");

  const matches = await bcrypt.compare(currentPassword, current.passwordHash);
  if (!matches) throw new ClientError(400, "Le mot de passe actuel est incorrect");
  if (newPassword.length < 8) {
    throw new ClientError(400, "Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new ClientError(400, "Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/\d/.test(newPassword)) {
    throw new ClientError(400, "Le mot de passe doit contenir au moins un chiffre");
  }
  if (newPassword !== confirmPassword) {
    throw new ClientError(400, "Les mots de passe ne correspondent pas");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { message: "Mot de passe mis à jour" };
};

const uploadAvatar = async (userId, file) => {
  const current = await findClient(userId);
  if (!file?.filename) throw new ClientError(400, "Image obligatoire");

  const imageUrl = `/uploads/avatars/${file.filename}`;
  if (!isStoredAvatar(imageUrl) || !assertImageFile(file.filename, file.mimetype)) {
    removeStoredAvatar(imageUrl);
    throw new ClientError(400, "Format d'image non accepté. Utilisez JPG, PNG ou WEBP.");
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: imageUrl },
    });
    if (current.avatarUrl && current.avatarUrl !== imageUrl) {
      removeStoredAvatar(current.avatarUrl);
    }
    return { profile: mapProfile(user) };
  } catch (error) {
    removeStoredAvatar(imageUrl);
    throw error;
  }
};

const removeAvatar = async (userId) => {
  const current = await findClient(userId);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });
  removeStoredAvatar(current.avatarUrl);
  return { profile: mapProfile(user) };
};

const cartInclude = {
  items: {
    include: {
      product: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
    orderBy: { id: "asc" },
  },
};

const mapCart = (cart) => {
  const items = (cart?.items || []).map((item) => {
    const price = money(item.product.price);
    const purchasable = item.product.isActive && item.product.stockQuantity >= item.quantity;
    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      category: item.product.category?.name || null,
      price,
      quantity: item.quantity,
      stockQuantity: item.product.stockQuantity,
      isActive: item.product.isActive,
      available: purchasable && item.product.stockQuantity > 0,
      lineTotal: money(price * item.quantity),
    };
  });
  const subtotal = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total: money(subtotal + DELIVERY_FEE),
  };
};

const ensureCart = async (userId, db = prisma) => {
  return db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });
};

const getCart = async (userId) => {
  await findClient(userId);
  const cart = await ensureCart(userId);
  return { cart: mapCart(cart) };
};

const loadSellableProduct = async (productId) => {
  assertUuid(productId);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new ClientError(404, "Produit indisponible");
  }
  if (product.stockQuantity < 1) {
    throw new ClientError(400, "Ce produit est en rupture de stock");
  }
  return product;
};

const addCartItem = async (userId, body) => {
  await findClient(userId);
  const product = await loadSellableProduct(body.productId);
  const quantity = parseQuantity(body.quantity || 1);
  const cart = await ensureCart(userId);
  const existing = cart.items.find((item) => item.productId === product.id);
  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (nextQuantity > product.stockQuantity) {
    throw new ClientError(400, "La quantité demandée dépasse le stock disponible");
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, quantity },
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId, productId, body) => {
  await findClient(userId);
  assertUuid(productId);
  const quantity = parseQuantity(body.quantity);
  const cart = await ensureCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (!existing) throw new ClientError(404, "Article absent du panier");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw new ClientError(400, "Produit indisponible");
  if (quantity > product.stockQuantity) {
    throw new ClientError(400, "La quantité demandée dépasse le stock disponible");
  }

  await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity },
  });
  return getCart(userId);
};

const removeCartItem = async (userId, productId) => {
  await findClient(userId);
  assertUuid(productId);
  const cart = await ensureCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
  }
  return getCart(userId);
};

const presentOrder = (order) => mapOrder(order, "client");

const deliveryFromBody = (body) => {
  const city = cleanText(body.city, 80, "La ville", true);
  const addressLine = cleanText(body.addressLine, 160, "L'adresse", true);
  const addressDetails = cleanText(body.addressDetails, 80, "Le complément d'adresse", false);
  const phone = normalizePhone(body.phone, true);
  const address = joinAddress({ city, addressLine, addressDetails });
  const deliveryAddress = `${address}${PHONE_MARK}${phone}`;
  if (deliveryAddress.length > 255) {
    throw new ClientError(400, "L'adresse de livraison est trop longue");
  }
  return { deliveryAddress, phone, address };
};

const sameLines = (order, lines) => {
  if (order.items.length !== lines.length) return false;
  return lines.every((line) =>
    order.items.some(
      (item) => item.productId === line.productId && item.quantity === line.quantity
    )
  );
};

const placeOrder = async (userId, body) => {
  const client = await findClient(userId);
  const destination = deliveryFromBody(body);
  if (body.saveToProfile) {
    const phoneOwner = await prisma.user.findFirst({
      where: { phone: destination.phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (phoneOwner) throw new ClientError(409, "Ce numéro de téléphone est déjà utilisé");
  }
  const cart = await ensureCart(userId);
  if (cart.items.length === 0) throw new ClientError(400, "Votre panier est vide");

  const outcome = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;
    const lines = [];

    for (const item of cart.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        throw new ClientError(400, "Un article du panier n'est plus disponible");
      }
      if (product.stockQuantity < item.quantity) {
        throw new ClientError(
          400,
          `Stock insuffisant pour « ${product.name} ». Disponible : ${product.stockQuantity}`
        );
      }
      const unitPrice = money(product.price);
      lines.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: money(unitPrice * item.quantity),
      });
    }

    const recent = await tx.order.findFirst({
      where: {
        userId,
        status: ORDER_STATUS,
        deliveryAddress: destination.deliveryAddress,
        createdAt: { gt: new Date(Date.now() - 20000) },
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    if (recent && sameLines(recent, lines)) return { order: recent, created: false };

    for (const line of lines) {
      const updated = await tx.product.updateMany({
        where: {
          id: line.productId,
          isActive: true,
          stockQuantity: { gte: line.quantity },
        },
        data: { stockQuantity: { decrement: line.quantity } },
      });
      if (updated.count !== 1) {
        throw new ClientError(409, `Stock insuffisant pour « ${line.name} »`);
      }
    }

    const subtotal = money(lines.reduce((sum, line) => sum + line.subtotal, 0));
    const totalAmount = money(subtotal + DELIVERY_FEE);
    const created = await tx.order.create({
      data: {
        userId,
        status: ORDER_STATUS,
        totalAmount,
        deliveryAddress: destination.deliveryAddress,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal,
          })),
        },
        payments: {
          create: {
            amount: totalAmount,
            method: "CASH_ON_DELIVERY",
            status: "PENDING",
          },
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { order: created, created: true };
  });

  if (outcome.created) {
    try {
      await notifyNewOrder(outcome.order, client);
    } catch (error) {
      console.error("ORDER NOTIFICATION:", error.message);
    }
  }

  if (body.saveToProfile) {
    await prisma.user.update({
      where: { id: client.id },
      data: {
        phone: destination.phone,
        address: destination.address,
      },
    });
  }

  return { order: presentOrder(outcome.order), created: outcome.created };
};

const listOrders = async (userId) => {
  await findClient(userId);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { orderDate: "desc" },
  });
  return { orders: orders.map(presentOrder) };
};

const getOrder = async (userId, orderId) => {
  await findClient(userId);
  assertUuid(orderId);
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });
  if (!order) throw new ClientError(404, "Commande introuvable");
  return { order: presentOrder(order) };
};

const cancelOrder = async (userId, orderId) => {
  await findClient(userId);
  assertUuid(orderId);

  const order = await prisma.$transaction(async (tx) => {
    const current = await lockOrder(tx, orderId);
    if (!current || current.userId !== userId) {
      throw new ClientError(404, "Commande introuvable");
    }
    if (current.status !== STATUS.PENDING) {
      throw new ClientError(400, "Seule une commande en attente peut être annulée");
    }

    await restoreStock(tx, current.items);
    await closePendingPayment(tx, current.id);

    return tx.order.update({
      where: { id: current.id },
      data: { status: STATUS.CANCELLED },
      include: orderInclude,
    });
  });

  return { order: presentOrder(order) };
};

module.exports = {
  ClientError,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  placeOrder,
  listOrders,
  getOrder,
  cancelOrder,
};
