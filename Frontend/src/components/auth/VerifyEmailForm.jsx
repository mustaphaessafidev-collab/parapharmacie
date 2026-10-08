import { useState, useRef } from "react";

function VerifyEmailForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    // Accept only one digit
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Go back when pressing Backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const verificationCode = code.join("");

    console.log("Verification code:", verificationCode);

    if (verificationCode.length !== 6) {
      console.log("❌ Le code doit contenir 6 chiffres");
      return;
    }

    console.log("✅ Code de vérification envoyé");
  };

  const handleResend = () => {
    console.log("📩 Nouveau code envoyé à l'adresse e-mail");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">

      {/* Card */}
      <div className="w-full max-w-[430px] rounded-2xl bg-white px-7 py-8 shadow-xl">

        {/* Email verification icon */}
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

        {/* Header */}
        <div className="text-center">

          <h1 className="text-xl font-semibold text-slate-900">
            Vérifiez votre adresse e-mail
          </h1>

          <p className="mx-auto mt-1 max-w-[340px] text-xs leading-5 text-gray-500">
            Nous avons envoyé un code de vérification sécurisé à
            votre adresse e-mail pour activer votre compte santé.
          </p>

        </div>

        {/* Email */}
        <div className="mt-5 flex h-8 items-center justify-between rounded-lg bg-indigo-50 px-3 text-[10px]">

          <span className="font-medium text-slate-700">
            <span className="mr-1 text-emerald-700">@</span>
            amina.elfassi@gmail.com
          </span>

          <button
            type="button"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Modifier ✎
          </button>

        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit}>

          <div className="mt-5 flex justify-between gap-2">

            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                className={`h-12 w-12 rounded-lg border bg-white text-center text-lg font-medium text-slate-800 outline-none transition
                  ${
                    digit
                      ? "border-emerald-500"
                      : "border-gray-100"
                  }
                  focus:border-slate-700 focus:ring-1 focus:ring-slate-700
                `}
              />
            ))}

          </div>

          {/* Verify */}
          <button
            type="submit"
            className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-800"
          >
            Vérifier
            <span>→</span>
          </button>

        </form>

        {/* Resend */}
        <div className="mt-7 text-center text-[10px] text-gray-500">

          <p>
            Vous n'avez pas reçu le code ?
          </p>

          <button
            type="button"
            onClick={handleResend}
            className="mt-1 font-medium text-gray-500 hover:text-emerald-700"
          >
            ↻ Renvoyer le code (00:44)
          </button>

        </div>

        {/* Spam warning */}
        <div className="mt-5 rounded-xl bg-indigo-50 px-3 py-3 text-[10px] leading-4 text-gray-600">

          <div className="flex gap-2">

            <span className="text-orange-500">
              ⓘ
            </span>

            <p>
              Pensez à vérifier votre dossier courriers indésirables
              (Spam) ou contactez notre support client au{" "}
              <strong>+212 5 22 00 00 00</strong> si le problème persiste.
            </p>

          </div>

        </div>

        {/* Back */}
        <div className="mt-5 text-center">

          <a
            href="/login"
            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Retour à la connexion
          </a>

        </div>

      </div>

    </div>
  );
}

export default VerifyEmailForm;