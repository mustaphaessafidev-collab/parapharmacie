
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../services/authService";

function VerifyEmailForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const email =
    location.state?.email ||
    sessionStorage.getItem("pendingVerificationEmail") ||
    "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputsRef = useRef([]);

  // Saisie d'un chiffre et passage à la case suivante
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const digits = value.slice(-1);
    const newCode = [...code];
    newCode[index] = digits;

    setCode(newCode);
    setError("");
    setSuccess("");

    if (digits && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Navigation entre les cases avec le clavier
  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Coller les 6 chiffres reçus par email
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedText = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedText) return;

    const newCode = Array(6).fill("");

    pastedText.split("").forEach((digit, index) => {
      newCode[index] = digit;
    });

    setCode(newCode);
    setError("");
    setSuccess("");

    const nextIndex = Math.min(pastedText.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  // Vérification auprès du backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Adresse e-mail introuvable. Veuillez recommencer l'inscription."
      );
      return;
    }

    const verificationCode = code.join("");

    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Le code doit contenir exactement 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmail(
        email,
        verificationCode
      );

      setSuccess(
        response.message ||
          "Votre adresse e-mail a été vérifiée avec succès."
      );

      sessionStorage.removeItem("pendingVerificationEmail");
    } catch (err) {
      setError(
        err.message ||
          "Code invalide ou expiré. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = (value) => {
    const [name, domain] = value.split("@");

    if (!domain) return value;

    const visibleName =
      name.length > 2
        ? `${name.slice(0, 2)}${"*".repeat(
            Math.min(name.length - 2, 6)
          )}`
        : `${name[0] || ""}*`;

    return `${visibleName}@${domain}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-[430px] rounded-2xl bg-white px-5 py-8 shadow-xl sm:px-7">

        {/* Icône de vérification */}
        <div className="mb-5 flex justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300">
            <span className="text-3xl text-emerald-800">
              ✉
            </span>

            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] text-white">
              ✓
            </div>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Vérifiez votre adresse e-mail
          </h1>

          <p className="mx-auto mt-2 max-w-[340px] text-xs leading-5 text-gray-500">
            Saisissez le code de vérification à 6 chiffres
            envoyé à votre adresse e-mail pour activer votre compte.
          </p>
        </div>

        {/* Email dynamique */}
        <div className="mt-5 flex min-h-9 items-center justify-between gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-[10px]">
          <span className="break-all font-medium text-slate-700">
            <span className="mr-1 text-emerald-700">@</span>
            {email ? maskedEmail(email) : "Adresse e-mail introuvable"}
          </span>

          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading || Boolean(success)}
            className="shrink-0 font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
          >
            Modifier ✎
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        {/* Succès */}
        {success && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700"
          >
            ✓ {success}
          </div>
        )}

        {/* Formulaire OTP */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mt-6 flex justify-center gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index === 0 ? "one-time-code" : "off"
                  }
                  aria-label={`Chiffre ${index + 1} du code`}
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  onPaste={handlePaste}
                  disabled={loading}
                  required
                  className={`h-11 w-10 rounded-lg border bg-white text-center text-lg font-medium text-slate-800 outline-none transition sm:h-12 sm:w-12 ${
                    digit
                      ? "border-emerald-500"
                      : "border-gray-200"
                  } focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 disabled:bg-gray-100`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  Vérifier mon email
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Après vérification réussie */}
        {success && (
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-800"
          >
            Se connecter
            <span>→</span>
          </button>
        )}

        {/* Renvoi du code */}
        {!success && (
          <div className="mt-7 text-center text-[10px] text-gray-500">
            <p>Vous n'avez pas reçu le code ?</p>

            <p className="mt-1 leading-4">
              Vérifiez votre dossier Spam. Le code expire après
              10 minutes.
            </p>

            <p className="mt-2 text-gray-400">
              Le renvoi du code sera disponible après
              l'ajout d'un endpoint dédié dans le backend.
            </p>
          </div>
        )}

        {/* Information */}
        <div className="mt-5 rounded-xl bg-indigo-50 px-3 py-3 text-[10px] leading-4 text-gray-600">
          <div className="flex gap-2">
            <span className="text-orange-500">ⓘ</span>

            <p>
              Si vous ne trouvez pas l'e-mail, vérifiez les
              courriers indésirables (Spam).
            </p>
          </div>
        </div>

        {/* Retour */}
        {!success && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailForm;
