const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const {
  isStoredAvatar,
  removeStoredAvatar,
  assertImageFile,
} = require("./avatarStorage");

class LivreurError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new LivreurError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new LivreurError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const normalizeEmail = (value) => {
  const email = cleanText(value, 255, "L'adresse e-mail", true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new LivreurError(400, "Adresse e-mail invalide");
  }
  return email;
};

const normalizePhone = (value) => {
  const text = cleanText(value, 20, "Le téléphone", false);
  if (!text) return null;

  const digits = text.replace(/\D/g, "");
  if (!/^(?:0\d{9}|[5-7]\d{8}|212\d{9}|00212\d{9})$/.test(digits)) {
    throw new LivreurError(400, "Veuillez saisir un numéro de téléphone marocain valide");
  }

  return text;
};

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  emailVerified: true,
  isActive: true,
  passwordHash: true,
};

const mapProfile = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
  avatarUrl: isStoredAvatar(user.avatarUrl) ? user.avatarUrl : null,
  role: user.role,
  createdAt: user.createdAt,
  emailVerified: user.emailVerified,
});

const findLivreur = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: profileSelect,
  });

  if (!user || user.role !== "LIVREUR" || !user.isActive) {
    throw new LivreurError(404, "Profil livreur introuvable");
  }

  return user;
};

const rejectProtectedFields = (body) => {
  const blocked = ["role", "isActive", "emailVerified", "password", "passwordHash", "googleId"];
  if (blocked.some((key) => body[key] !== undefined)) {
    throw new LivreurError(400, "Cette information ne peut pas être modifiée depuis le profil");
  }
  if (body.avatarUrl !== undefined || body.avatar !== undefined) {
    throw new LivreurError(400, "La photo doit être envoyée comme fichier");
  }
};

const getProfile = async (userId) => {
  const user = await findLivreur(userId);
  return { profile: mapProfile(user) };
};

const updateProfile = async (userId, body) => {
  await findLivreur(userId);
  rejectProtectedFields(body);

  const firstName = cleanText(body.firstName, 100, "Le prénom", true);
  const lastName = cleanText(body.lastName, 100, "Le nom", true);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailOwner) throw new LivreurError(409, "Cette adresse e-mail est déjà utilisée");

  if (phone) {
    const phoneOwner = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (phoneOwner) throw new LivreurError(409, "Ce numéro de téléphone est déjà utilisé");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, email, phone },
    select: profileSelect,
  });

  return { profile: mapProfile(user) };
};

const changePassword = async (userId, body) => {
  const current = await findLivreur(userId);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!current.passwordHash) {
    throw new LivreurError(400, "Ce compte n'utilise pas de mot de passe local");
  }
  if (!currentPassword) throw new LivreurError(400, "Le mot de passe actuel est obligatoire");

  const matches = await bcrypt.compare(currentPassword, current.passwordHash);
  if (!matches) throw new LivreurError(400, "Le mot de passe actuel est incorrect");
  if (newPassword.length < 8) {
    throw new LivreurError(400, "Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new LivreurError(400, "Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/\d/.test(newPassword)) {
    throw new LivreurError(400, "Le mot de passe doit contenir au moins un chiffre");
  }
  if (newPassword !== confirmPassword) {
    throw new LivreurError(400, "Les mots de passe ne correspondent pas");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { message: "Mot de passe mis à jour" };
};

const uploadAvatar = async (userId, file) => {
  const current = await findLivreur(userId);
  if (!file?.filename) throw new LivreurError(400, "Image obligatoire");

  const imageUrl = `/uploads/avatars/${file.filename}`;
  if (!isStoredAvatar(imageUrl) || !assertImageFile(file.filename, file.mimetype)) {
    removeStoredAvatar(imageUrl);
    throw new LivreurError(400, "Format d'image non accepté. Utilisez JPG, PNG ou WEBP.");
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: imageUrl },
      select: profileSelect,
    });
    if (current.avatarUrl && current.avatarUrl !== imageUrl) {
      removeStoredAvatar(current.avatarUrl);
    }
    return { profile: mapProfile(user) };
  } catch (error) {
    removeStoredAvatar(imageUrl);
    throw error;
  }
};

const removeAvatar = async (userId) => {
  const current = await findLivreur(userId);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: profileSelect,
  });
  removeStoredAvatar(current.avatarUrl);
  return { profile: mapProfile(user) };
};

module.exports = {
  LivreurError,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
};
