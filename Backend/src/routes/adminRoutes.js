const express = require("express");
const { dashboard } = require("../controllers/adminController");
const {
  listClients,
  getClient,
  updateClient,
  updateClientStatus,
  removeClient,
} = require("../controllers/adminClientController");
const {
  listLivreurs,
  createLivreur,
  getLivreur,
  updateLivreur,
  updateLivreurStatus,
  removeLivreur,
} = require("../controllers/adminLivreurController");
const {
  listCategories,
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
} = require("../controllers/adminCategoryController");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/adminProfileController");
const {
  listOrders,
  getOrder,
  listAssignees,
  validateOrder,
  rejectOrder,
  assignOrder,
  cancelOrder,
} = require("../controllers/adminOrderController");
const {
  listAdminNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");
const { requireAdmin } = require("../middlewares/requireAdmin");
const { productImage } = require("../middlewares/uploadProductImage");

const router = express.Router();

router.use(requireAdmin);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/password", changePassword);
router.get("/dashboard", dashboard);
router.get("/notifications", listAdminNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.get("/orders/assignees", listAssignees);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.post("/orders/:id/validate", validateOrder);
router.post("/orders/:id/reject", rejectOrder);
router.post("/orders/:id/assign", assignOrder);
router.post("/orders/:id/cancel", cancelOrder);
router.get("/clients", listClients);
router.get("/clients/:id", getClient);
router.patch("/clients/:id", updateClient);
router.patch("/clients/:id/status", updateClientStatus);
router.delete("/clients/:id", removeClient);
router.get("/livreurs", listLivreurs);
router.post("/livreurs", createLivreur);
router.get("/livreurs/:id", getLivreur);
router.patch("/livreurs/:id", updateLivreur);
router.patch("/livreurs/:id/status", updateLivreurStatus);
router.delete("/livreurs/:id", removeLivreur);
router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.get("/categories/:id", getCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", removeCategory);
router.get("/brands", listBrands);
router.get("/products", listProducts);
router.post("/products", productImage, createProduct);
router.get("/products/:id", getProduct);
router.patch("/products/:id/status", updateProductStatus);
router.patch("/products/:id", productImage, updateProduct);
router.delete("/products/:id", removeProduct);

module.exports = router;
