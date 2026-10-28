const profileService = require("../services/livreurProfileService");
const { removeStoredAvatar } = require("../services/avatarStorage");

const handle = (res, error, label) => {
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  console.error(label, error.message);
  return res.status(500).json({ success: false, message: "Une erreur est survenue" });
};

const getProfile = async (req, res) => {
  try {
    const data = await profileService.getProfile(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR PROFILE ERROR:");
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await profileService.updateProfile(req.auth.userId, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR PROFILE UPDATE ERROR:");
  }
};

const changePassword = async (req, res) => {
  try {
    const data = await profileService.changePassword(req.auth.userId, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR PASSWORD ERROR:");
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const data = await profileService.uploadAvatar(req.auth.userId, req.file);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    if (req.file?.filename) removeStoredAvatar(`/uploads/avatars/${req.file.filename}`);
    return handle(res, error, "LIVREUR AVATAR ERROR:");
  }
};

const removeAvatar = async (req, res) => {
  try {
    const data = await profileService.removeAvatar(req.auth.userId);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "LIVREUR AVATAR REMOVE ERROR:");
  }
};

module.exports = { getProfile, updateProfile, changePassword, uploadAvatar, removeAvatar };
