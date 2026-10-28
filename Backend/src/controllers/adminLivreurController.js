const adminLivreurService = require("../services/adminLivreurService");

const handle = (res, error, fallback) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  console.error(fallback, error.message);

  return res.status(500).json({
    success: false,
    message: "Une erreur est survenue",
  });
};

const listLivreurs = async (req, res) => {
  try {
    const data = await adminLivreurService.listLivreurs(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREURS LIST ERROR:");
  }
};

const createLivreur = async (req, res) => {
  try {
    const data = await adminLivreurService.createLivreur(req.body || {});
    return res.status(201).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREUR CREATE ERROR:");
  }
};

const getLivreur = async (req, res) => {
  try {
    const data = await adminLivreurService.getLivreur(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREUR DETAIL ERROR:");
  }
};

const updateLivreur = async (req, res) => {
  try {
    const data = await adminLivreurService.updateLivreur(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREUR UPDATE ERROR:");
  }
};

const updateLivreurStatus = async (req, res) => {
  try {
    const data = await adminLivreurService.updateLivreurStatus(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREUR STATUS ERROR:");
  }
};

const removeLivreur = async (req, res) => {
  try {
    const data = await adminLivreurService.deleteLivreur(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN LIVREUR DELETE ERROR:");
  }
};

module.exports = {
  listLivreurs,
  createLivreur,
  getLivreur,
  updateLivreur,
  updateLivreurStatus,
  removeLivreur,
};
