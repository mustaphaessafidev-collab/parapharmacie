import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
      rememberMe,
    };

    console.log("Login data:", loginData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">

      {/* Card */}
      <div className="w-full max-w-[500px] rounded-2xl bg-white px-10 py-9 shadow-xl">

        {/* Security top */}
        <div className="mb-14 flex items-center justify-between text-sm">

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-gray-600">
            🛡️ Espace Sécurisé
          </span>

          <span className="text-gray-600">
            <span className="mr-1 text-emerald-600">●</span>
            SSL 256-Bit
          </span>

        </div>

        {/* Header */}
        <div className="mb-7 text-center">

          <h1 className="text-4xl font-medium text-slate-900">
            Connexion
          </h1>

          <p className="mt-2 text-base text-gray-500">
            Connectez-vous à votre compte parapharmacie
          </p>

        </div>

        {/* Error */}
        <div className="mb-6 flex gap-3 rounded-xl bg-red-100 p-4 text-red-600">

          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-red-500 text-xs font-bold">
            !
          </div>

          <div className="flex-1">
            <p className="font-medium">
              Identifiants invalides
            </p>

            <p className="mt-1 text-sm leading-5">
              L'adresse e-mail ou le mot de passe renseigné est incorrect.
            </p>
          </div>

          <button
            type="button"
            className="text-xl leading-none text-red-500 hover:text-red-700"
          >
            ×
          </button>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-5">

            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Adresse e-mail
              </label>

              <span className="text-xs text-gray-500">
                Requis
              </span>

            </div>

            <div className="flex h-12 items-center rounded-lg bg-indigo-50 px-4">

              <span className="mr-3 text-lg text-gray-500">
                ✉
              </span>

              <input
                id="email"
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-gray-400"
              />

              {email && (
                <span className="text-xl font-bold text-emerald-600">
                  ✓
                </span>
              )}

            </div>

          </div>

          {/* Password */}
          <div className="mb-5">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mot de passe
            </label>

            <div className="flex h-12 items-center rounded-lg bg-indigo-50 px-4">

              <span className="mr-3 text-lg text-gray-500">
                🔒
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-lg text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>

          </div>

          {/* Remember + Forgot */}
          <div className="mb-6 flex items-center justify-between text-sm">

            <label className="flex cursor-pointer items-center gap-2 text-gray-600">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />

              Se souvenir de moi

            </label>

            <a
              href="/forgot-password"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Mot de passe oublié ?
            </a>

          </div>

          {/* Login button */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-800"
          >
            🔒
            Se connecter
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-500">
            OU
          </span>

          <div className="h-px flex-1 bg-gray-200" />

        </div>

        {/* Google */}
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-indigo-50 text-sm font-medium text-slate-700 transition hover:bg-indigo-100"
        >
          <span className="text-xl font-bold text-blue-600">
            G
          </span>

          Continuer avec Google
        </button>

        {/* Register */}
        <p className="mt-10 text-center text-sm text-gray-500">

          Vous n'avez pas encore de compte ?

          <a
            href="/register"
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Créer un compte
          </a>

        </p>

        {/* CNDP */}
        <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-center text-xs text-gray-600">

          🛡️

          <span>
            Données de santé protégées et cryptées selon la norme CNDP Maroc
          </span>

        </div>

      </div>

    </div>
  );
}

export default LoginForm;