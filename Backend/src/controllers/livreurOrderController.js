const livreurOrderService = require("../services/livreurOrderService");

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const listOrders = async (req, res) => {
  try {
    const data = await livreurOrderService.listOrders(req.auth.userId, req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR ORDERS LIST ERROR:");
  }
};

const getOrder = async (req, res) => {
  try {
    const data = await livreurOrderService.getOrder(req.auth.userId, req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR ORDER DETAIL ERROR:");
  }
};

const startDelivery = async (req, res) => {
  try {
    const data = await livreurOrderService.startDelivery(req.auth.userId, req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR ORDER START ERROR:");
  }
};

const deliverOrder = async (req, res) => {
  try {
    const data = await livreurOrderService.deliverOrder(req.auth.userId, req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR ORDER DELIVER ERROR:");
  }
};

const failDelivery = async (req, res) => {
  try {
    const data = await livreurOrderService.failDelivery(req.auth.userId, req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR ORDER FAIL ERROR:");
  }
};

module.exports = {
  listOrders,
  getOrder,
  startDelivery,
  deliverOrder,
  failDelivery,
};
