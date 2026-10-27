const categoryService = require("../services/adminCategoryService");
const { removeStoredImage } = require("../services/productImageStorage");

const discardUpload = (file) => {
  if (file?.filename) removeStoredImage(`/uploads/products/${file.filename}`);
};

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const listCategories = async (req, res) => {
  try {
    const data = await categoryService.listCategories(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CATEGORIES LIST ERROR:");
  }
};

const listPublicCategories = async (req, res) => {
  try {
    const data = await categoryService.listPublicCategories();
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "PUBLIC CATEGORIES ERROR:");
  }
};

const getCategory = async (req, res) => {
  try {
    const data = await categoryService.getCategory(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CATEGORY DETAIL ERROR:");
  }
};

const createCategory = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body || {});
    return res.status(201).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CATEGORY CREATE ERROR:");
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = await categoryService.updateCategory(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CATEGORY UPDATE ERROR:");
  }
};

const removeCategory = async (req, res) => {
  try {
    const data = await categoryService.deleteCategory(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CATEGORY DELETE ERROR:");
  }
};

const listBrands = async (req, res) => {
  try {
    const data = await categoryService.listBrands();
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN BRANDS ERROR:");
  }
};

const listProducts = async (req, res) => {
  try {
    const data = await categoryService.listProducts(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PRODUCTS LIST ERROR:");
  }
};

const getProduct = async (req, res) => {
  try {
    const data = await categoryService.getProduct(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PRODUCT DETAIL ERROR:");
  }
};

const createProduct = async (req, res) => {
  try {
    const data = await categoryService.createProduct(req.body || {}, req.file);
    return res.status(201).json({ success: true, ...data });
  } catch (error) {
    discardUpload(req.file);
    return handle(res, error, "ADMIN PRODUCT CREATE ERROR:");
  }
};

const updateProduct = async (req, res) => {
  try {
    const data = await categoryService.updateProduct(req.params.id, req.body || {}, req.file);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    discardUpload(req.file);
    return handle(res, error, "ADMIN PRODUCT UPDATE ERROR:");
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const data = await categoryService.updateProductStatus(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PRODUCT STATUS ERROR:");
  }
};

const removeProduct = async (req, res) => {
  try {
    const data = await categoryService.deleteProduct(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PRODUCT DELETE ERROR:");
  }
};

const listPublicProducts = async (req, res) => {
  try {
    const data = await categoryService.listPublicProducts(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "PUBLIC PRODUCTS ERROR:");
  }
};

const getPublicProduct = async (req, res) => {
  try {
    const data = await categoryService.getPublicProduct(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "PUBLIC PRODUCT ERROR:");
  }
};

module.exports = {
  listCategories,
  listPublicCategories,
  getCategory,
  createCategory,
  updateCategory,
  removeCategory,
  listBrands,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  removeProduct,
  listPublicProducts,
  getPublicProduct,
};
