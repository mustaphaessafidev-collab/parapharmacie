const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const uploadDir = path.resolve(__dirname, "../../uploads/avatars");
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(uploadDir, { recursive: true });

const storedName = (mimetype) => `${crypto.randomUUID()}${EXTENSIONS[mimetype]}`;

const isStoredAvatar = (imageUrl) =>
  /^\/uploads\/avatars\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(String(imageUrl || ""));

const absoluteStoredPath = (imageUrl) => {
  if (!isStoredAvatar(imageUrl)) return null;
  const full = path.resolve(uploadDir, path.basename(imageUrl));
  const relative = path.relative(uploadDir, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
};

const removeStoredAvatar = (imageUrl) => {
  const full = absoluteStoredPath(imageUrl);
  if (!full) return;
  fs.unlink(full, () => {});
};

const signatureMatches = (buffer, mimetype) => {
  if (mimetype === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === "image/png") {
    return buffer.length >= 8 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG";
  }
  if (mimetype === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
};

const assertImageFile = (filename, mimetype) => {
  const full = path.resolve(uploadDir, path.basename(filename));
  const relative = path.relative(uploadDir, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  const buffer = fs.readFileSync(full);
  return signatureMatches(buffer, mimetype);
};

module.exports = {
  uploadDir,
  MAX_BYTES,
  EXTENSIONS,
  storedName,
  isStoredAvatar,
  removeStoredAvatar,
  assertImageFile,
};
