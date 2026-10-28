const multer = require("multer");
const {
  uploadDir,
  MAX_BYTES,
  EXTENSIONS,
  storedName,
} = require("../services/avatarStorage");

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      callback(null, storedName(file.mimetype));
    },
  }),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!EXTENSIONS[file.mimetype]) {
      const error = new Error("Format d'image non accepté. Utilisez JPG, PNG ou WEBP.");
      error.status = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

const avatarImage = (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(error.status || 400).json({
      success: false,
      message: tooLarge
        ? "L'image ne doit pas dépasser 2 Mo."
        : error.message || "Image invalide",
    });
  });
};

module.exports = { avatarImage };
