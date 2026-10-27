const prisma = require("../config/prisma");
const {
  isStoredProductImage,
  removeStoredImage,
} = require("./productImageStorage");

const PAGE_SIZES = new Set([10, 20, 50]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const parsePage = (value) => {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const parsePageSize = (value) => {
  const size = Number.parseInt(value, 10);
  return PAGE_SIZES.has(size) ? size : 10;
};

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new AdminError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new AdminError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const assertId = (id, label) => {
  if (!UUID.test(String(id || ""))) throw new AdminError(400, `${label} invalide`);
};

const mapCategory = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  productCount: category._count?.products ?? 0,
});

const assertUniqueName = async (name, id) => {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });

  if (existing) throw new AdminError(409, "Une catégorie porte déjà ce nom");
};

const listCategories = async (query) => {
  if (query.options === "1") {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { categories };
  }

  const pageSize = parsePageSize(query.pageSize);
  const requestedPage = parsePage(query.page);
  const search = String(query.search || "").trim().slice(0, 100);
  const sort = query.sort === "products" ? "products" : "name";
  const direction = query.order === "desc" ? "desc" : "asc";
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const total = await prisma.category.count({ where });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const rows = await prisma.category.findMany({
    where,
    include: { _count: { select: { products: true } } },
    orderBy:
      sort === "products"
        ? { products: { _count: direction } }
        : { name: direction },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    summary: { total: await prisma.category.count() },
    categories: rows.map(mapCategory),
    pagination: { page, pageSize, total, pages },
  };
};

const listPublicCategories = async () => {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return { categories: rows.map(mapCategory) };
};

const getCategory = async (id) => {
  assertId(id, "Identifiant de catégorie");
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AdminError(404, "Catégorie introuvable");
  return { category: mapCategory(category) };
};

const createCategory = async (body) => {
  const name = cleanText(body.name, 100, "Le nom", true);
  const description = cleanText(body.description, 2000, "La description", false) || null;
  await assertUniqueName(name);

  const category = await prisma.category.create({
    data: { name, description },
    include: { _count: { select: { products: true } } },
  });

  return { category: mapCategory(category) };
};

const updateCategory = async (id, body) => {
  await getCategory(id);
  const name = cleanText(body.name, 100, "Le nom", true);
  const description = cleanText(body.description, 2000, "La description", false) || null;
  await assertUniqueName(name, id);

  const category = await prisma.category.update({
    where: { id },
    data: { name, description },
    include: { _count: { select: { products: true } } },
  });

  return { category: mapCategory(category) };
};

const deleteCategory = async (id, body = {}) => {
  const current = await getCategory(id);
  const productCount = current.category.productCount;

  if (productCount > 0) {
    const targetId = String(body.reassignToId || "");
    if (!targetId) {
      throw new AdminError(
        409,
        "Cette catégorie contient des produits. Réassignez-les vers une autre catégorie avant la suppression."
      );
    }
    if (targetId === id) throw new AdminError(400, "Choisissez une catégorie différente");
    assertId(targetId, "Catégorie de destination");
    const target = await prisma.category.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (!target) throw new AdminError(400, "Catégorie de destination introuvable");

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: targetId },
      }),
      prisma.category.delete({ where: { id } }),
    ]);

    return { deleted: true, reassigned: productCount };
  }

  await prisma.category.delete({ where: { id } });
  return { deleted: true, reassigned: 0 };
};

const money = (value) => Math.round(Number(value) * 100) / 100;

const productInclude = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  _count: { select: { orderItems: true, cartItems: true } },
};

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: money(product.price),
  imageUrl: product.imageUrl,
  stockQuantity: product.stockQuantity,
  isActive: product.isActive,
  status: product.isActive ? "active" : "blocked",
  createdAt: product.createdAt,
  orderCount: product._count?.orderItems ?? 0,
  category: product.category
    ? { id: product.category.id, name: product.category.name }
    : null,
  brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
});

const releaseImage = async (imageUrl, productId) => {
  if (!isStoredProductImage(imageUrl)) return;
  const shared = await prisma.product.count({
    where: {
      imageUrl,
      ...(productId ? { NOT: { id: productId } } : {}),
    },
  });
  if (shared === 0) removeStoredImage(imageUrl);
};

const parseActive = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new AdminError(400, "Le statut du produit est invalide");
};

const resolveBrand = async ({ brandId, brandName }) => {
  if (brandId) {
    assertId(brandId, "Marque");
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });
    if (!brand) throw new AdminError(400, "Marque introuvable");
    return brand.id;
  }

  const name = cleanText(brandName, 100, "La marque", true);
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.brand.create({ data: { name }, select: { id: true } });
  return created.id;
};

const resolveCategoryId = async (categoryId) => {
  assertId(categoryId, "Catégorie");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) throw new AdminError(400, "Catégorie introuvable");
  return category.id;
};

const resolveImage = (body, current, file) => {
  if (file) return `/uploads/products/${file.filename}`;

  const remove = body.removeImage === true || body.removeImage === "true";
  if (remove) return null;

  const imageText = cleanText(body.imageUrl, 500, "L'image", false);
  if (!imageText) return current?.imageUrl || null;
  if (/^https?:\/\/\S+$/i.test(imageText)) return imageText;
  if (imageText === current?.imageUrl && isStoredProductImage(imageText)) return imageText;
  throw new AdminError(400, "L'adresse de l'image est invalide");
};

const productData = async (body, { creating, current, file }) => {
  const name = cleanText(body.name, 150, "Le nom du produit", true);
  const description = cleanText(body.description, 5000, "La description", false) || null;
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0 || price > 99999999.99) {
    throw new AdminError(400, "Le prix est invalide");
  }
  const stockQuantity = Number(body.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new AdminError(400, "Le stock doit être un nombre entier positif ou nul");
  }

  return {
    name,
    description,
    price: money(price).toFixed(2),
    stockQuantity,
    imageUrl: resolveImage(body, current, file),
    isActive: parseActive(body.isActive, creating ? true : Boolean(current?.isActive)),
    categoryId: await resolveCategoryId(body.categoryId),
    brandId: await resolveBrand(body),
  };
};

const listBrands = async () => ({
  brands: await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  }),
});

const listProducts = async (query) => {
  const pageSize = parsePageSize(query.pageSize);
  const requestedPage = parsePage(query.page);
  const search = String(query.search || "").trim().slice(0, 100);
  const sort = ["name", "price", "stock", "created"].includes(query.sort)
    ? query.sort
    : "created";
  const direction = query.order === "asc" ? "asc" : "desc";
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) {
    assertId(query.categoryId, "Catégorie");
    where.categoryId = query.categoryId;
  }
  if (query.status === "active") where.isActive = true;
  if (query.status === "blocked" || query.status === "inactive") where.isActive = false;

  const total = await prisma.product.count({ where });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const orderBy =
    sort === "price"
      ? { price: direction }
      : sort === "stock"
        ? { stockQuantity: direction }
        : sort === "name"
          ? { name: direction }
          : { createdAt: direction };

  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    summary: { total: await prisma.product.count() },
    products: rows.map(mapProduct),
    pagination: { page, pageSize, total, pages },
  };
};

const findProduct = async (id) => {
  assertId(id, "Identifiant produit");
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) throw new AdminError(404, "Produit introuvable");
  return product;
};

const getProduct = async (id) => ({ product: mapProduct(await findProduct(id)) });

const createProduct = async (body, file) => {
  const data = await productData(body, { creating: true, file });
  const product = await prisma.product.create({ data, include: productInclude });
  return { product: mapProduct(product) };
};

const updateProduct = async (id, body, file) => {
  const current = await findProduct(id);
  const data = await productData(body, { creating: false, current, file });
  const product = await prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });
  if (current.imageUrl && current.imageUrl !== product.imageUrl) {
    try {
      await releaseImage(current.imageUrl, id);
    } catch (error) {
      console.error("PRODUCT IMAGE CLEANUP:", error.message);
    }
  }
  return { product: mapProduct(product) };
};

const updateProductStatus = async (id, body) => {
  await findProduct(id);
  const isActive = parseActive(body.isActive, null);
  if (isActive === null) throw new AdminError(400, "Le statut du produit est invalide");
  const product = await prisma.product.update({
    where: { id },
    data: { isActive },
    include: productInclude,
  });
  return { product: mapProduct(product) };
};

const deleteProduct = async (id) => {
  const current = await findProduct(id);
  if (current._count.orderItems > 0) {
    throw new AdminError(
      409,
      "Ce produit figure dans des commandes. Bloquez-le pour le retirer de la vente sans effacer l'historique."
    );
  }

  await prisma.product.delete({ where: { id } });
  try {
    await releaseImage(current.imageUrl);
  } catch (error) {
    console.error("PRODUCT IMAGE CLEANUP:", error.message);
  }
  return { deleted: true };
};

const listPublicProducts = async (query) => {
  const where = { isActive: true };
  if (query.categoryId) {
    assertId(query.categoryId, "Catégorie");
    where.categoryId = query.categoryId;
  }

  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { name: "asc" },
  });

  return { products: rows.map(mapProduct) };
};

const getPublicProduct = async (id) => {
  const product = await findProduct(id);
  if (!product.isActive) throw new AdminError(404, "Produit indisponible");
  return { product: mapProduct(product) };
};

module.exports = {
  AdminError,
  listCategories,
  listPublicCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  listBrands,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  listPublicProducts,
  getPublicProduct,
};
