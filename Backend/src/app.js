const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test
app.get("/", (req, res) => {
  res.json({
    message: "Parapharmacie API fonctionne",
  });
});

module.exports = app;