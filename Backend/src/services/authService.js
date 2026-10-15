
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const register = async ({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
}) => {
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    throw new Error("Tous les champs sont obligatoires");
  }

  if (password !== confirmPassword) {
    throw new Error("Les mots de passe ne correspondent pas");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingEmail) {
    throw new Error("Cet email est déjà utilisé");
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (existingPhone) {
    throw new Error("Ce numéro de téléphone est déjà utilisé");
  }

  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift();
  const lastName = parts.join(" ");

  if (!lastName) {
    throw new Error("Veuillez saisir le prénom et le nom");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: hashedPassword,
      role: "CLIENT",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
    },
  });
};

module.exports = { register };
