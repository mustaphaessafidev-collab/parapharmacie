const TRUST = [
  { title: "Livraison 24-48H", text: "Partout au Maroc avec suivi direct", icon: "truck" },
  { title: "100% Authentique", text: "Laboratoires agréés & certifiés", icon: "shield" },
  { title: "Conseils Pharmaciens", text: "Équipe médicale dédiée 6j/7", icon: "chat" },
  { title: "Paiement à la livraison", text: "Cash ou Carte Bancaire CMI", icon: "card" },
];

function Mini({ name }) {
  const common = "h-4 w-4";
  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h11v8H3zM14 10h4.2L21 13.2V15h-7" />
        <circle cx="7" cy="17.5" r="1.3" />
        <circle cx="17" cy="17.5" r="1.3" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 17.5 4 20V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H8Z" />
      </svg>
    );
  }
  if (name === "card") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2L12 3.5Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-[#f4f6f8]">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 pt-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {TRUST.map((item) => (
          <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span className="text-[#159447]">
              <Mini name={item.icon} />
            </span>
            <span>
              <span className="block text-sm font-bold text-[#1c2430]">{item.title}</span>
              <span className="block text-[11px] text-slate-500">{item.text}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="flex items-center gap-2 text-base font-extrabold text-[#159447]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#159447] text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-9.5Z" />
              </svg>
            </span>
            AtlasPara
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Votre parapharmacie en ligne de confiance au Maroc. Soins dermo-cosmétiques certifiés, compléments alimentaires et bien-être livrés à domicile.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1c2430]">Navigation rapide</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li><a href="/" className="hover:text-[#159447]">Accueil</a></li>
            <li><a href="#produits" className="hover:text-[#159447]">Tous les produits</a></li>
            <li><a href="#produits" className="hover:text-[#159447]">Meilleures ventes</a></li>
            <li><a href="#produits" className="hover:text-[#159447]">Nouveautés</a></li>
            <li><a href="#produits" className="hover:text-[#159447]">Promotions du mois</a></li>
            <li><a href="#apropos" className="hover:text-[#159447]">Marques partenaires</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1c2430]">Catégories populaires</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li><a href="#categories" className="hover:text-[#159447]">Soins du visage</a></li>
            <li><a href="#categories" className="hover:text-[#159447]">Dermo-cosmétique</a></li>
            <li><a href="#categories" className="hover:text-[#159447]">Santé &amp; Vitalité</a></li>
            <li><a href="#categories" className="hover:text-[#159447]">Maman &amp; Bébé</a></li>
            <li><a href="#categories" className="hover:text-[#159447]">Soins capillaires</a></li>
            <li><a href="#categories" className="hover:text-[#159447]">Protection solaire</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1c2430]">Service Client &amp; Contact</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li><a href="#contact" className="hover:text-[#159447]">Centre d'aide &amp; FAQ</a></li>
            <li><a href="#contact" className="hover:text-[#159447]">Livraison &amp; Retours</a></li>
            <li><a href="#contact" className="hover:text-[#159447]">Pharmacien conseil en direct</a></li>
            <li className="pt-2">+212 5 22 00 00 00</li>
            <li>contact@atlaspara.ma</li>
            <li>Casablanca, Maroc</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1c2430]">Certifications &amp; Paiements</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Plateforme certifiée respectant les normes de santé marocaine.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#e8f1ff] px-2.5 py-1 text-[11px] font-semibold text-[#2563eb]">CNDP Loi 09-08</span>
            <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[11px] font-semibold text-[#159447]">Ministère Santé</span>
            <span className="rounded-full bg-[#f3e8ff] px-2.5 py-1 text-[11px] font-semibold text-[#7c3aed]">Centre Monétique CMI</span>
            <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#4338ca]">Visa / Mastercard</span>
            <span className="rounded-full bg-[#fff1e4] px-2.5 py-1 text-[11px] font-semibold text-[#c46a1a]">Cash Livraison</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2025 AtlasPara Maroc - Tous droits réservés. Vente de produits parapharmaceutiques et dermo-cosmétiques certifiés.</p>
          <p className="flex gap-4">
            <a href="#contact" className="hover:text-[#159447]">Mentions Légales</a>
            <a href="#contact" className="hover:text-[#159447]">Politique de Confidentialité</a>
            <a href="#contact" className="hover:text-[#159447]">CGV</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
