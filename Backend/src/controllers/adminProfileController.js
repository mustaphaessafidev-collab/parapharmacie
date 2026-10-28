const profileService = require("../services/adminProfileService");

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
    return handle(res, error, "ADMIN PROFILE ERROR:");
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await profileService.updateProfile(req.auth.userId, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PROFILE UPDATE ERROR:");
  }
};

const changePassword = async (req, res) => {
  try {
    const data = await profileService.changePassword(req.auth.userId, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN PASSWORD ERROR:");
  }
};

module.exports = { getProfile, updateProfile, changePassword };
