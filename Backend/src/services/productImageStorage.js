const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const uploadDir = path.resolve(__dirname, "../../uploads/products");
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(uploadDir, { recursive: true });

const storedName = (mimetype) => `${crypto.randomUUID()}${EXTENSIONS[mimetype]}`;

const isStoredProductImage = (imageUrl) =>
  /^\/uploads\/products\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(String(imageUrl || ""));

const absoluteStoredPath = (imageUrl) => {
  if (!isStoredProductImage(imageUrl)) return null;
  const full = path.resolve(uploadDir, path.basename(imageUrl));
  const relative = path.relative(uploadDir, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
};

const removeStoredImage = (imageUrl) => {
  const full = absoluteStoredPath(imageUrl);
  if (!full) return;
  fs.unlink(full, () => {});
};

module.exports = {
  uploadDir,
  MAX_BYTES,
  EXTENSIONS,
  storedName,
  isStoredProductImage,
  removeStoredImage,
};
