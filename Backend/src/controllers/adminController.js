const adminService = require("../services/adminService");

const PERIODS = new Set(["today", "7d", "month", "year"]);

const dashboard = async (req, res) => {
  try {
    const period = PERIODS.has(req.query.period) ? req.query.period : "month";
    const data = await adminService.getDashboard(period);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Impossible de charger le tableau de bord",
    });
  }
};

module.exports = { dashboard };
