const jwt = require("jsonwebtoken");

const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé",
      });
    }

    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session invalide",
    });
  }
};

module.exports = { requireAdmin };
