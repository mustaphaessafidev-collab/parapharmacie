const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, code) => {
  return transporter.sendMail({
    from: {
      name: "Parapharmacie",
      address: process.env.EMAIL_FROM,
    },
    to: email,
    subject: "Code de vérification - Parapharmacie",
    text: `Votre code de vérification est ${code}. Il expire dans 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Bienvenue chez Parapharmacie !</h2>
        <p>Voici votre code de vérification :</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };