const express = require("express");
const {
  listPublicProducts,
  getPublicProduct,
} = require("../controllers/adminCategoryController");

const router = express.Router();

router.get("/", listPublicProducts);
router.get("/:id", getPublicProduct);

module.exports = router;
