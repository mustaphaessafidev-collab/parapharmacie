const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body || {};

    const user = await authService.register({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Inscription réussie",
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de l'inscription",
    });
  }
};

module.exports = { register };
