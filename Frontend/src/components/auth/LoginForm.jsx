import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  clearReturn,
  login,
  pathForRole,
  rememberReturn,
  safeReturnPath,
  saveSession,
  storedReturnPath,
} from "../../services/authService";
import { GoogleLogin } from "@react-oauth/google";
function LoginForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedReturn = safeReturnPath(params.get("next")) || storedReturnPath();
  const purchasePrompt = params.get("reason") === "order" || Boolean(requestedReturn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("L'adresse e-mail et le mot de passe sont obligatoires.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: normalizedEmail,
        password,
      });

      if (!response?.token || !response?.user) {
        setError("Réponse de connexion incomplète.");
        return;
      }

      saveSession(response, rememberMe);
      const next = response.user.role === "CLIENT" ? requestedReturn : "";
      clearReturn();
      navigate(next || pathForRole(response.user.role));
    } catch (err) {
      const message = err.message || "Erreur lors de la connexion";
      setError(message);

      if (message.toLowerCase().includes("vérifier")) {
        sessionStorage.setItem("pendingVerificationEmail", normalizedEmail);
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  
const handleGoogleSuccess = async (googleResponse) => {
  setError("");
  setNeedsVerification(false);
  setLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: googleResponse.credential,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Erreur lors de la connexion Google"
      );
    }

    if (!data.token || !data.user) {
      throw new Error("Réponse de connexion incomplète.");
    }

    saveSession(data, rememberMe);
    const next = data.user.role === "CLIENT" ? requestedReturn : "";
    clearReturn();
    navigate(next || pathForRole(data.user.role));
  } catch (err) {
    setError(
      err.message || "Erreur lors de la connexion avec Google"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">

      {/* Card */}
      <div className="w-full max-w-[440px] border border-neutral-200 bg-white px-8 py-8">

        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <span className="flex h-8 w-8 items-center justify-center bg-[#0e7a45] text-white">+</span>
          AtlasPara
        </Link>

        {/* Header */}
        <div className="mb-7 text-center">

          <h1 className="text-4xl font-medium text-slate-900">
            Connexion
          </h1>

          <p className="mt-2 text-base text-gray-500">
            Connectez-vous à votre compte parapharmacie
          </p>

        </div>

        {purchasePrompt && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">Connexion requise pour commander</p>
            <p className="mt-1 leading-5">
              Vous pouvez consulter les produits sans compte. Connectez-vous pour ajouter un article au panier et passer commande.
            </p>
            <Link
              to={requestedReturn ? `/register?reason=order&next=${encodeURIComponent(requestedReturn)}` : "/register"}
              onClick={() => rememberReturn(requestedReturn)}
              className="mt-2 inline-block font-semibold text-emerald-800"
            >
              Créer un compte
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-xl bg-red-100 p-4 text-red-600"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-red-500 text-xs font-bold">
              !
            </div>

            <div className="flex-1">
              <p className="font-medium">Connexion impossible</p>
              <p className="mt-1 text-sm leading-5">{error}</p>
              {needsVerification && (
                <Link
                  to="/verify-email"
                  className="mt-2 inline-block text-sm font-semibold text-emerald-800"
                >
                  Saisir le code de vérification
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xl leading-none text-red-500 hover:text-red-700"
              aria-label="Fermer le message"
            >
              ×
            </button>
          </div>
        )}

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

            <div className="flex h-12 items-center border border-neutral-300 px-3 focus-within:border-neutral-950">

              <input
                id="email"
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-gray-400"
              />

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

            <div className="flex h-12 items-center border border-neutral-300 px-3 focus-within:border-neutral-950">

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
                className="text-xs font-medium text-neutral-600 hover:text-neutral-950"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "Masquer" : "Afficher"}
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
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#0e7a45] text-base font-semibold text-white transition hover:bg-[#0c693b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
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
        {/* <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-indigo-50 text-sm font-medium text-slate-700 transition hover:bg-indigo-100"
        >
          <span className="text-xl font-bold text-blue-600">
            G
          </span>

          Continuer avec Google
        </button> */}

        <div className="flex h-12 w-full items-center justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("La connexion avec Google a échoué.");
            }}
            text="continue_with"
            shape="rectangular"
            theme="filled_blue"
            size="large"
            width="400"
          />
        </div>
        {/* Register */}
        <p className="mt-10 text-center text-sm text-gray-500">

          Vous n'avez pas encore de compte ?

          <Link
            to={requestedReturn ? `/register?reason=order&next=${encodeURIComponent(requestedReturn)}` : "/register"}
            onClick={() => rememberReturn(requestedReturn)}
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Créer un compte
          </Link>

        </p>

      </div>

    </div>
  );
}

export default LoginForm;