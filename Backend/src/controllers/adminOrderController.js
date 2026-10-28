const adminOrderService = require("../services/adminOrderService");

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const listOrders = async (req, res) => {
  try {
    const data = await adminOrderService.listOrders(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDERS LIST ERROR:");
  }
};

const getOrder = async (req, res) => {
  try {
    const data = await adminOrderService.getOrder(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER DETAIL ERROR:");
  }
};

const listAssignees = async (req, res) => {
  try {
    const data = await adminOrderService.listAssignees();
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER ASSIGNEES ERROR:");
  }
};

const validateOrder = async (req, res) => {
  try {
    const data = await adminOrderService.validateOrder(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER VALIDATE ERROR:");
  }
};

const rejectOrder = async (req, res) => {
  try {
    const data = await adminOrderService.rejectOrder(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER REJECT ERROR:");
  }
};

const assignOrder = async (req, res) => {
  try {
    const data = await adminOrderService.assignOrder(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER ASSIGN ERROR:");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const data = await adminOrderService.cancelOrder(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN ORDER CANCEL ERROR:");
  }
};

module.exports = {
  listOrders,
  getOrder,
  listAssignees,
  validateOrder,
  rejectOrder,
  assignOrder,
  cancelOrder,
};
