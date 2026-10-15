
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
    newsletter: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
  };

  // Convertir le numéro marocain au format international
  const normalizePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("00212")) {
      return `+${digits.slice(2)}`;
    }

    if (digits.startsWith("212")) {
      return `+${digits}`;
    }

    if (digits.startsWith("0")) {
      return `+212${digits.slice(1)}`;
    }

    return `+212${digits}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phoneDigits = formData.phone.replace(/\D/g, "");

    // Validation des champs
    if (
      !fullName ||
      !email ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (!/^(?:0\d{9}|[5-7]\d{8}|212\d{9}|00212\d{9})$/.test(phoneDigits)) {
      setError("Veuillez saisir un numéro de téléphone marocain valide.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins une majuscule.");
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins un chiffre.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!formData.terms) {
      setError("Vous devez accepter les conditions générales.");
      return;
    }

    setLoading(true);

    try {
      // Envoyer uniquement les champs attendus par le backend
      const userData = {
        fullName,
        email,
        phone: normalizePhone(formData.phone),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await register(userData);

      setSuccess(
        response.message || "Inscription réussie !"
      );

      // Garder l'email pour la page de vérification
      sessionStorage.setItem("pendingVerificationEmail", email);

      // Redirection vers la vérification de l'email
      navigate("/verify-email", {
        state: { email },
      });
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordLength = formData.password.length;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const passwordValid =
    passwordLength >= 8 && hasUppercase && hasNumber;

  const passwordStrength = !passwordLength
    ? "Non renseigné"
    : passwordLength < 8
      ? "Trop court"
      : !hasUppercase || !hasNumber
        ? "À renforcer"
        : "Bon";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-3 py-4 text-slate-800">
      <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-lg">

        {/* Top security bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-white px-5 py-3 text-[10px]">
          <span className="font-medium tracking-wide text-emerald-700">
            ● PARAPHARMACIE OFFICIELLE • CERTIFIÉE CNDP
          </span>

          <span className="text-gray-600">
            🛡 Données Protégées (Loi 09–08)
          </span>
        </div>

        <div className="px-5 py-5 sm:px-7">

          {/* Welcome badge */}
          <div className="mb-2 flex justify-center">
            <span className="rounded-full bg-emerald-300 px-4 py-1 text-xs font-semibold text-emerald-900">
              ♧ Bienvenue chez AtlasPara
            </span>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Créer un compte
            </h1>

            <p className="mx-auto mt-1 max-w-[400px] text-sm leading-5 text-gray-500">
              Créez votre compte pour accéder à nos produits dermo-
              cosmétiques et à nos conseils personnalisés.
            </p>
          </div>

          {/* Welcome offer */}
          <div className="mt-7 flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
              🎁
            </div>

            <div className="text-[11px]">
              <div className="font-semibold text-slate-700">
                Avantage Bienvenue
                <span className="ml-2 rounded-sm bg-orange-400 px-1.5 py-0.5 text-[9px] text-white">
                  -10% IMMÉDIAT
                </span>
              </div>

              <p className="mt-0.5 text-gray-500">
                Profitez de votre offre de bienvenue selon les
                conditions de la parapharmacie.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700"
            >
              <span className="font-semibold">Erreur : </span>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700"
            >
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">

            {/* Full name */}
            <div>
              <div className="mb-1 flex justify-between text-[11px]">
                <label
                  htmlFor="fullName"
                  className="font-medium text-slate-700"
                >
                  Nom complet (Nom & Prénom)
                </label>

                <span className="text-emerald-600">Requis</span>
              </div>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">
                <span className="mr-2 text-gray-500">♙</span>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="ex: Amina El Fassi"
                  autoComplete="name"
                  maxLength={100}
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-[11px] font-medium text-slate-700"
              >
                Adresse e-mail
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">
                <span className="mr-2 font-semibold text-gray-500">@</span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="amina.elfassi@gmail.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />
              </div>

              <p className="mt-1 text-[10px] text-gray-500">
                Votre adresse e-mail sera utilisée pour vérifier
                votre compte.
              </p>
            </div>

            {/* Phone */}
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label
                  htmlFor="phone"
                  className="text-[11px] font-medium text-slate-700"
                >
                  Numéro de téléphone
                </label>

                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] text-slate-600">
                  ▣ Suivi livraison SMS
                </span>
              </div>

              <div className="flex h-10 overflow-hidden rounded-lg bg-indigo-50">
                <div className="flex shrink-0 items-center border-r border-white px-3 text-xs text-gray-600">
                  🇲🇦 +212
                </div>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  autoComplete="tel-national"
                  maxLength={20}
                  required
                  disabled={loading}
                  className="w-full min-w-0 bg-transparent px-3 text-xs outline-none placeholder:text-gray-400"
                />
              </div>

              <p className="mt-1 text-[10px] text-gray-500">
                Saisissez votre numéro marocain, avec ou sans le 0 initial.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[11px] font-medium text-slate-700"
              >
                Mot de passe
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">
                <span className="mr-2 text-gray-500">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="ml-2 text-sm text-gray-500"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {/* Password strength */}
              <div className="mt-1 rounded-lg bg-indigo-50 px-2 py-2">
                <div className="mb-1 flex justify-between text-[9px]">
                  <span className="text-gray-500">
                    Force du mot de passe :
                  </span>

                  <span
                    className={`font-medium ${
                      passwordValid
                        ? "text-emerald-600"
                        : passwordLength >= 8
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>

                <div className="mb-2 h-1 rounded-full bg-indigo-200">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      passwordValid
                        ? "w-full bg-emerald-500"
                        : passwordLength >= 8
                          ? "w-2/3 bg-orange-400"
                          : passwordLength >= 4
                            ? "w-1/2 bg-orange-400"
                            : passwordLength > 0
                              ? "w-1/4 bg-red-400"
                              : "w-0"
                    }`}
                  />
                </div>

                <div className="flex flex-wrap justify-between gap-1 text-[9px] text-gray-500">
                  <span className={passwordLength >= 8 ? "text-emerald-600" : ""}>
                    {passwordLength >= 8 ? "✓" : "○"} 8 caractères min.
                  </span>

                  <span className={hasUppercase ? "text-emerald-600" : ""}>
                    {hasUppercase ? "✓" : "○"} 1 majuscule
                  </span>

                  <span className={hasNumber ? "text-emerald-600" : ""}>
                    {hasNumber ? "✓" : "○"} 1 chiffre min.
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-[11px] font-medium text-slate-700"
              >
                Confirmer le mot de passe
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">
                <span className="mr-2 text-gray-500">🔄</span>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  maxLength={128}
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                  className="ml-2 text-sm text-gray-500"
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>

              {formData.confirmPassword.length > 0 && (
                <p
                  className={`mt-1 text-[10px] ${
                    formData.password === formData.confirmPassword
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {formData.password === formData.confirmPassword
                    ? "✓ Les mots de passe correspondent"
                    : "Les mots de passe ne correspondent pas"}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-gray-500">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
                disabled={loading}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-700"
              />

              <span>
                J'accepte les{" "}
                <a
                  href="/conditions-generales"
                  className="font-medium text-emerald-700"
                >
                  Conditions Générales d'Utilisation
                </a>{" "}
                et la{" "}
                <a
                  href="/politique-confidentialite"
                  className="font-medium text-emerald-700"
                >
                  Politique de Confidentialité
                </a>{" "}
                d'AtlasPara.
              </span>
            </label>

            {/* Newsletter */}
            <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-gray-500">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                disabled={loading}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-700"
              />

              <span>
                Recevez nos conseils et nos offres exclusives par e-mail.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création du compte...
                </>
              ) : (
                <>♙ Créer mon compte</>
              )}
            </button>

            <p className="text-center text-[9px] text-gray-500">
              🛡 Vos informations sont transmises de manière sécurisée.
            </p>
          </form>
        </div>

        {/* Bottom login */}
        <div className="bg-indigo-50 px-5 py-4 text-center text-xs text-gray-500">
          Vous avez déjà un compte ?

          <a
            href="/login"
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Se connecter →
          </a>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
