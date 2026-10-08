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

  const existingEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingEmail) {
    throw new Error("Cet email est déjà utilisé");
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingPhone) {
    throw new Error("Ce numéro de téléphone est déjà utilisé");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });
};

module.exports = {
  register,
};