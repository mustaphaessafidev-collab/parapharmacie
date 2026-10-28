const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const requireLivreur = async (req, res, next) => {
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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== "LIVREUR") {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux livreurs",
      });
    }

    req.auth = { userId: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session invalide",
    });
  }
};

module.exports = { requireLivreur };
