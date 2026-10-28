const ITEMS = [
  {
    title: "Produits de qualité",
    text: "100% de nos références proviennent directement des laboratoires fabricants officiels au Maroc et en Europe. Traçabilité totale garantie.",
    icon: "shield",
  },
  {
    title: "Livraison rapide",
    text: "Expédition le jour même. Livraison sous 24h à Casablanca et Rabat, 48h dans toutes les villes du Royaume (Marrakech, Fès, Tanger, Agadir…).",
    icon: "rocket",
  },
  {
    title: "Paiement sécurisé",
    text: "Payez en toute sérénité à la livraison en espèces ou par terminal carte (TPE), ou en ligne via la plateforme nationale sécurisée CMI.",
    icon: "lock",
  },
  {
    title: "Service client à l'écoute",
    text: "Une équipe d'experts et de pharmaciens joignables du lundi au samedi par téléphone, WhatsApp ou e-mail pour des conseils personnalisés.",
    icon: "chat",
  },
];

function ItemIcon({ name }) {
  const common = "h-5 w-5";
  if (name === "rocket") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 4c3 1 5 4 6 7-3 1-6 1-8 0-1-2-1-5 2-7Z" strokeLinejoin="round" />
        <path d="M9 15 4 20M8 10 4 12l2 3 3-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V8a4 4 0 0 1 8 0v2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 17.5 4 20V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H8Z" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2L12 3.5Z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Advantages() {
  return (
    <section id="avantages" className="bg-[#f4f6f8] py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-[#7d8da3]">NOS ENGAGEMENTS</p>
        <h2 className="mx-auto mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-[#1c2430] sm:text-4xl">
          Pourquoi choisir notre parapharmacie ?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Les garanties d'un service d'excellence dédié à votre santé et bien-être partout au Maroc.
        </p>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 xl:grid-cols-4">
          {ITEMS.map((item) => (
            <article key={item.title} className="rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)]">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f8ee] text-[#159447]">
                <ItemIcon name={item.icon} />
              </span>
              <h3 className="mt-4 text-sm font-bold text-[#1c2430]">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Advantages;
