import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
            Parapharmacie officielle · Données protégées
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Le soin dermatologique, sélectionné pour le Maroc.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            AtlasPara réunit dermocosmétique, hygiène et nutrition.
            Créez votre compte pour suivre vos commandes et recevoir
            vos conseils.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-700 px-5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white shadow-md hover:bg-emerald-800"
            >
              Créer un compte
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Offre de bienvenue affichée lors de l'inscription, selon les
            conditions de la parapharmacie.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Sélection du moment
          </p>
          <ul className="mt-4 space-y-3">
            {[
              ["Soin visage", "Peaux sensibles et solaires"],
              ["Hygiène familiale", "Essentiels du quotidien"],
              ["Nutrition", "Compléments et bien-être"],
            ].map(([title, detail]) => (
              <li
                key={title}
                className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    {title}
                  </span>
                  <span className="block text-xs text-slate-500">{detail}</span>
                </span>
                <span className="text-xs font-medium text-emerald-800">
                  En rayon
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;
