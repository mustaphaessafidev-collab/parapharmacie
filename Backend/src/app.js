
const express = require("express");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const clientRoutes = require("./routes/clientRoutes");
const livreurRoutes = require("./routes/livreurRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    index: false,
    dotfiles: "deny",
    fallthrough: false,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/livreur", livreurRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Parapharmacie API fonctionne",
  });
});

module.exports = app;
