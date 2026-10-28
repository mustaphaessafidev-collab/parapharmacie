const express = require("express");
const { requireLivreur } = require("../middlewares/requireLivreur");
const {
  listOrders,
  getOrder,
  startDelivery,
  deliverOrder,
  failDelivery,
} = require("../controllers/livreurOrderController");
const {
  listLivreurNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
} = require("../controllers/livreurProfileController");
const { avatarImage } = require("../middlewares/uploadAvatar");

const router = express.Router();

router.use(requireLivreur);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/password", changePassword);
router.post("/profile/avatar", avatarImage, uploadAvatar);
router.delete("/profile/avatar", removeAvatar);
router.get("/notifications", listLivreurNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.post("/orders/:id/start", startDelivery);
router.post("/orders/:id/deliver", deliverOrder);
router.post("/orders/:id/fail", failDelivery);

module.exports = router;
