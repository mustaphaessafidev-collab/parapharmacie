const express = require("express");
const { requireClient } = require("../middlewares/requireClient");
const { avatarImage } = require("../middlewares/uploadAvatar");
const {
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
} = require("../controllers/clientController");

const router = express.Router();

router.use(requireClient);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/password", changePassword);
router.post("/profile/avatar", avatarImage, uploadAvatar);
router.delete("/profile/avatar", removeAvatar);

router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.patch("/cart/items/:productId", updateCartItem);
router.delete("/cart/items/:productId", removeCartItem);

router.get("/orders", listOrders);
router.post("/orders", placeOrder);
router.get("/orders/:id", getOrder);
router.post("/orders/:id/cancel", cancelOrder);

module.exports = router;
