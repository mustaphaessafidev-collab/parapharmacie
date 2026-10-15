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


const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const result = await authService.login({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      ...result,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    const statusCode =
      error.message === "Votre compte est désactivé" ? 403 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Erreur lors de la connexion",
    });
  }
};


module.exports = { register,login };
