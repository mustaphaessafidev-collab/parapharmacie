import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Livraison Express Maroc",
    text: "Casablanca sous 24h, Rabat, Marrakech, Fès, Tanger et tout le Royaume.",
    icon: "truck",
  },
  {
    title: "Paiement à la Livraison",
    text: "Réglez en espèces ou par terminal carte (TPE) à la réception du colis.",
    icon: "cash",
  },
  {
    title: "100% Origine Contrôlée",
    text: "Produits certifiés issus directement des laboratoires pharmaceutiques officiels.",
    icon: "badge",
  },
  {
    title: "Conseil Pharmaceutique 6j/7",
    text: "Une équipe de pharmaciens à votre écoute par téléphone et sur WhatsApp.",
    icon: "chat",
  },
];

function FeatureIcon({ name }) {
  const common = "h-5 w-5";
  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h11v8H3zM14 10h4.2L21 13.2V15h-7" strokeLinejoin="round" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17" cy="17.5" r="1.5" />
      </svg>
    );
  }
  if (name === "cash") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    );
  }
  if (name === "badge") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19.2a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="bg-[#f4f6f8]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-[#159447]">
            <span className="h-2 w-2 rounded-full bg-[#159447]" />
            N°1 DE LA PARAPHARMACIE CERTIFIÉ AU MAROC
          </p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[1.12] font-extrabold tracking-tight text-[#1c2430] sm:text-5xl">
            Votre santé et votre bien-être,{" "}
            <span className="relative inline-block text-[#159447]">
              notre priorité
              <svg viewBox="0 0 220 14" className="absolute -bottom-1 left-0 h-3 w-full" aria-hidden="true">
                <path
                  d="M4 8 C 30 2, 50 13, 80 7 S 140 2, 216 8"
                  fill="none"
                  stroke="#8fd18a"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-500">
            Découvrez une sélection de produits de santé, beauté, soins et bien-être de qualité,
            certifiés par des laboratoires agréés et livrés avec soin partout au Royaume.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/produits"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#159447] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#12843f]"
            >
              Découvrir nos produits
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#categories"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-[#1c2430] hover:border-[#159447]"
            >
              Voir les catégories
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-3 py-3 shadow-sm">
              <span className="text-[#f5b400]">★</span>
              <span>
                <span className="block text-sm font-bold text-[#1c2430]">4.9 / 5</span>
                <span className="block text-[11px] text-slate-500">+15 000 avis certifiés</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
              <span className="text-[#159447]">
                <FeatureIcon name="truck" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#1c2430]">Livraison 24/48h</span>
                <span className="block text-[11px] text-slate-500">Gratuite dès 300 MAD</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
              <span className="text-[#159447]">
                <FeatureIcon name="chat" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#1c2430]">Pharmaciens</span>
                <span className="block text-[11px] text-slate-500">Conseils gratuits 6j/7</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(16,24,40,0.08)]">
            <img
              src="/home/hero-shelf.jpg"
              alt="Sérums et crèmes de soin sur une étagère"
              className="h-[420px] w-full object-cover sm:h-[480px]"
            />
          </div>
          <div className="absolute top-4 right-4 rounded-2xl bg-white/95 px-3 py-2 shadow-md">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#159447]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#159447] text-[10px] text-white">✓</span>
              100% Authentique
            </p>
            <p className="mt-0.5 pl-5 text-[11px] text-slate-500">Laboratoires Agréés</p>
          </div>
          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1e6] text-[#e07a2f]">%</span>
              <span>
                <span className="block text-sm font-bold text-[#1c2430]">Offre Soins Visage</span>
                <span className="block text-xs text-slate-500">Jusqu'à -25% de remise</span>
              </span>
            </div>
            <Link
              to="/produits"
              className="rounded-full bg-[#c46a1a] px-4 py-2 text-xs font-bold text-white hover:bg-[#a85a14]"
            >
              Voir
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#159447] text-white">
              <FeatureIcon name={feature.icon} />
            </span>
            <h2 className="mt-4 text-sm font-bold text-[#1c2430]">{feature.title}</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Hero;
