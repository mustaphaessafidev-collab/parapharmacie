const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

class AdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const cleanText = (value, max, label, required) => {
  const text = String(value ?? "").trim();
  if (!text && required) throw new AdminError(400, `${label} est obligatoire`);
  if (text.length > max) {
    throw new AdminError(400, `${label} ne peut pas dépasser ${max} caractères`);
  }
  return text;
};

const normalizeEmail = (value) => {
  const email = cleanText(value, 255, "L'adresse e-mail", true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminError(400, "Adresse e-mail invalide");
  }
  return email;
};

const normalizePhone = (value) => {
  const text = cleanText(value, 20, "Le téléphone", false);
  if (!text) return null;

  const digits = text.replace(/\D/g, "");
  if (!/^(?:0\d{9}|[5-7]\d{8}|212\d{9}|00212\d{9})$/.test(digits)) {
    throw new AdminError(400, "Veuillez saisir un numéro de téléphone marocain valide");
  }

  return text;
};

const mapProfile = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  emailVerified: user.emailVerified,
});

const findAdmin = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new AdminError(404, "Profil administrateur introuvable");
  }

  return user;
};

const getProfile = async (userId) => {
  const user = await findAdmin(userId);
  return { profile: mapProfile(user) };
};

const updateProfile = async (userId, body) => {
  const current = await findAdmin(userId);
  if (body.role !== undefined && body.role !== current.role) {
    throw new AdminError(400, "Le rôle ne peut pas être modifié depuis le profil");
  }

  const firstName = cleanText(body.firstName, 100, "Le prénom", true);
  const lastName = cleanText(body.lastName, 100, "Le nom", true);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (emailOwner) throw new AdminError(409, "Cette adresse e-mail est déjà utilisée");

  if (phone) {
    const phoneOwner = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (phoneOwner) throw new AdminError(409, "Ce numéro de téléphone est déjà utilisé");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, email, phone },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return { profile: mapProfile(user) };
};

const changePassword = async (userId, body) => {
  const current = await findAdmin(userId);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!current.passwordHash) {
    throw new AdminError(400, "Ce compte n'utilise pas de mot de passe local");
  }
  if (!currentPassword) throw new AdminError(400, "Le mot de passe actuel est obligatoire");

  const matches = await bcrypt.compare(currentPassword, current.passwordHash);
  if (!matches) throw new AdminError(400, "Le mot de passe actuel est incorrect");
  if (newPassword.length < 8) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/\d/.test(newPassword)) {
    throw new AdminError(400, "Le mot de passe doit contenir au moins un chiffre");
  }
  if (newPassword !== confirmPassword) {
    throw new AdminError(400, "Les mots de passe ne correspondent pas");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { message: "Mot de passe mis à jour" };
};

module.exports = {
  AdminError,
  getProfile,
  updateProfile,
  changePassword,
};
