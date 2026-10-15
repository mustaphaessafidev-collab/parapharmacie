
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

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

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email et mot de passe obligatoires");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  if (!user.isActive) {
    throw new Error("Votre compte est désactivé");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
};

module.exports = { register,login };
