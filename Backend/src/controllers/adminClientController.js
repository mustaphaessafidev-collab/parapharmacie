const adminClientService = require("../services/adminClientService");

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

const listClients = async (req, res) => {
  try {
    const data = await adminClientService.listClients(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CLIENTS LIST ERROR:");
  }
};

const getClient = async (req, res) => {
  try {
    const data = await adminClientService.getClient(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CLIENT DETAIL ERROR:");
  }
};

const updateClient = async (req, res) => {
  try {
    const data = await adminClientService.updateClient(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CLIENT UPDATE ERROR:");
  }
};

const updateClientStatus = async (req, res) => {
  try {
    const data = await adminClientService.updateClientStatus(req.params.id, req.body || {});
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CLIENT STATUS ERROR:");
  }
};

const removeClient = async (req, res) => {
  try {
    const data = await adminClientService.deleteClient(req.params.id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handle(res, error, "ADMIN CLIENT DELETE ERROR:");
  }
};

module.exports = {
  listClients,
  getClient,
  updateClient,
  updateClientStatus,
  removeClient,
};
