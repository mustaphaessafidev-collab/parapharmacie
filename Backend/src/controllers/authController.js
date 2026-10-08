const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

module.exports = {
  register,
};