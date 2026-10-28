const notificationService = require("../services/notificationService");

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const listNotifications = (role) => async (req, res) => {
  try {
    const data = await notificationService.listFor(req.auth.userId, role);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "NOTIFICATIONS LIST ERROR:");
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const data = await notificationService.markRead(req.auth.userId, req.params.id);
    return res.status(200).json(data);
  } catch (error) {
    return handle(res, error, "NOTIFICATION READ ERROR:");
  }
};

module.exports = {
  listAdminNotifications: listNotifications("ADMIN"),
  listLivreurNotifications: listNotifications("LIVREUR"),
  markNotificationRead,
};
