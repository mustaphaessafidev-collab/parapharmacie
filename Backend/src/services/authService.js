
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("./emailService");

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

  // 1. Générer un code de vérification à 6 chiffres
  const code = crypto.randomInt(100000, 1000000).toString();

  // 2. Hasher le code avant de le sauvegarder
  const tokenHash = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  // 3. Expiration du code après 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 4. Créer le compte sans vérifier l'email
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: hashedPassword,
      role: "CLIENT",
      emailVerified: false,
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

  // 5. Sauvegarder le hash du code dans la base de données
  await prisma.emailVerification.create({
    data: {
      tokenHash,
      expiresAt,
      userId: user.id,
    },
  });

  // 6. Envoyer le code à l'adresse email du client
  await sendVerificationEmail(normalizedEmail, code);

  // 7. Retourner les informations du compte
  return {
    ...user,
    message: "Compte créé. Vérifiez votre email pour activer votre compte.",
  };
};


const verifyEmail = async ({ email, code }) => {
  if (!email || !code) {
    throw new Error("Email et code de vérification obligatoires");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = String(code).trim();

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error("Le code doit contenir 6 chiffres");
  }

  // 1. Rechercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  if (user.emailVerified) {
    throw new Error("Cette adresse email est déjà vérifiée");
  }

  // 2. Calculer le hash du code reçu
  const tokenHash = crypto
    .createHash("sha256")
    .update(normalizedCode)
    .digest("hex");

  // 3. Rechercher un code valide et non utilisé
  const verification = await prisma.emailVerification.findFirst({
    where: {
      userId: user.id,
      tokenHash,
      expiresAt: { gt: new Date() },
      verifiedAt: null,
    },
  });

  if (!verification) {
    throw new Error("Code invalide ou expiré");
  }

  // 4. Activer le compte et marquer le code comme utilisé
  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    }),

    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
  ]);

  return {
    message: "Adresse email vérifiée avec succès",
  };
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

  if (!user.emailVerified) {
  throw new Error(
    "Veuillez vérifier votre adresse email avant de vous connecter"
  );
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

module.exports = { register,login ,verifyEmail };
