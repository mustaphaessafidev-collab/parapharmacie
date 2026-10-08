import { useState } from "react";

function RegisterForm() {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Register data:", formData);

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      console.log("❌ Tous les champs sont obligatoires");
      return;
    }

    if (!formData.terms) {
      console.log("❌ Vous devez accepter les conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log("❌ Les mots de passe ne correspondent pas");
      return;
    }

    console.log("✅ Inscription valide");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-3 py-4 text-slate-800">

      <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-lg">

        {/* Top security bar */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-7 py-3 text-[10px]">

          <span className="font-medium tracking-wide text-emerald-700">
            ● PARAPHARMACIE OFFICIELLE • CERTIFIÉE CNDP
          </span>

          <span className="text-gray-600">
            🛡 Données Protégées (Loi 09–08)
          </span>

        </div>

        <div className="px-7 py-5">

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
              cosmétiques certifiés et à nos conseils personnalisés.
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
                10% de réduction immédiate sur votre 1ère commande dès validation de votre inscription.
              </p>

            </div>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">

            {/* Full name */}
            <div>

              <div className="mb-1 flex justify-between text-[11px]">

                <label className="font-medium text-slate-700">
                  Nom complet (Nom & Prénom)
                </label>

                <span className="text-emerald-600">
                  Requis
                </span>

              </div>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">

                <span className="mr-2 text-gray-500">
                  ♙
                </span>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="ex: Amina El Fassi"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

              </div>

            </div>

            {/* Email */}
            <div>

              <label className="mb-1 block text-[11px] font-medium text-slate-700">
                Adresse e-mail
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">

                <span className="mr-2 font-semibold text-gray-500">
                  @
                </span>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="amina.elfassi@gmail.com"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

              </div>

              <p className="mt-1 text-[10px] text-gray-500">
                Votre reçu de commande et ordonnance numérique y seront transmis.
              </p>

            </div>

            {/* Phone */}
            <div>

              <div className="mb-1 flex items-center justify-between">

                <label className="text-[11px] font-medium text-slate-700">
                  Numéro de téléphone
                </label>

                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] text-slate-600">
                  ▣ Suivi livraison SMS
                </span>

              </div>

              <div className="flex h-10 overflow-hidden rounded-lg bg-indigo-50">

                <div className="flex items-center border-r border-white px-3 text-xs text-gray-600">
                  🇲🇦 +212
                </div>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-transparent px-3 text-xs outline-none placeholder:text-gray-400"
                />

              </div>

              <p className="mt-1 text-[10px] text-gray-500">
                Indispensable pour contacter le livreur Amana / Aramex partout au Maroc.
              </p>

            </div>

            {/* Password */}
            <div>

              <label className="mb-1 block text-[11px] font-medium text-slate-700">
                Mot de passe
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">

                <span className="mr-2 text-gray-500">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-500"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

              {/* Password strength */}
              <div className="mt-1 rounded-lg bg-indigo-50 px-2 py-1.5">

                <div className="mb-1 flex justify-between text-[9px]">
                  <span className="text-gray-500">
                    Force du mot de passe :
                  </span>

                  <span className="font-medium text-red-500">
                    {formData.password.length === 0
                      ? "Trop court"
                      : formData.password.length < 8
                        ? "Trop court"
                        : "Bon"}
                  </span>
                </div>

                <div className="mb-1 h-1 rounded-full bg-indigo-200">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      formData.password.length >= 8
                        ? "w-full bg-emerald-500"
                        : formData.password.length >= 4
                          ? "w-1/2 bg-orange-400"
                          : "w-1/4 bg-red-400"
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>◯ 8 caractères min.</span>
                  <span>◯ 1 majuscule</span>
                  <span>◯ 1 chiffre min.</span>
                </div>

              </div>

            </div>

            {/* Confirm password */}
            <div>

              <label className="mb-1 block text-[11px] font-medium text-slate-700">
                Confirmer le mot de passe
              </label>

              <div className="flex h-10 items-center rounded-lg bg-indigo-50 px-3">

                <span className="mr-2 text-gray-500">
                  🔄
                </span>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="text-sm text-gray-500"
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-gray-500">

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-700"
              />

              <span>
                J'accepte les{" "}
                <a
                  href="#"
                  className="font-medium text-emerald-700"
                >
                  Conditions Générales d'Utilisation
                </a>{" "}
                et la{" "}
                <a
                  href="#"
                  className="font-medium text-emerald-700"
                >
                  Politique de Confidentialité
                </a>{" "}
                AtlasPara, conformément aux normes de protection des données de la loi marocaine 09–08 (CNDP).
              </span>

            </label>

            {/* Newsletter */}
            <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-gray-500">

              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-700"
              />

              <span>
                Recevez nos conseils santé rédigés par nos pharmaciens agréés,
                diagnostics de peau et offres exclusives sur-mesure par e-mail.
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-800"
            >
              ♙
              Créer mon compte
            </button>

            {/* Secure payment */}
            <p className="text-center text-[9px] text-gray-500">
              🛡 Chiffrement bancaire SSL 256 bits garanti
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