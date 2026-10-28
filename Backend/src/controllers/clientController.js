const clientService = require("../services/clientService");
const { removeStoredAvatar } = require("../services/avatarStorage");

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const getProfile = async (req, res) => {
  try {
    const data = await clientService.getProfile(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT PROFILE ERROR:");
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await clientService.updateProfile(req.auth.userId, req.body);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT PROFILE UPDATE ERROR:");
  }
};

const changePassword = async (req, res) => {
  try {
    const data = await clientService.changePassword(req.auth.userId, req.body);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT PASSWORD ERROR:");
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const data = await clientService.uploadAvatar(req.auth.userId, req.file);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    if (req.file?.filename) removeStoredAvatar(`/uploads/avatars/${req.file.filename}`);
    return handle(res, error, "CLIENT AVATAR ERROR:");
  }
};

const removeAvatar = async (req, res) => {
  try {
    const data = await clientService.removeAvatar(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT AVATAR REMOVE ERROR:");
  }
};

const getCart = async (req, res) => {
  try {
    const data = await clientService.getCart(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT CART ERROR:");
  }
};

const addCartItem = async (req, res) => {
  try {
    const data = await clientService.addCartItem(req.auth.userId, req.body);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT CART ADD ERROR:");
  }
};

const updateCartItem = async (req, res) => {
  try {
    const data = await clientService.updateCartItem(
      req.auth.userId,
      req.params.productId,
      req.body
    );
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT CART UPDATE ERROR:");
  }
};

const removeCartItem = async (req, res) => {
  try {
    const data = await clientService.removeCartItem(req.auth.userId, req.params.productId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT CART REMOVE ERROR:");
  }
};

const placeOrder = async (req, res) => {
  try {
    const data = await clientService.placeOrder(req.auth.userId, req.body);
    return res.status(201).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT ORDER ERROR:");
  }
};

const listOrders = async (req, res) => {
  try {
    const data = await clientService.listOrders(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT ORDERS ERROR:");
  }
};

const getOrder = async (req, res) => {
  try {
    const data = await clientService.getOrder(req.auth.userId, req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT ORDER DETAIL ERROR:");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const data = await clientService.cancelOrder(req.auth.userId, req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "CLIENT ORDER CANCEL ERROR:");
  }
};

module.exports = {
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
