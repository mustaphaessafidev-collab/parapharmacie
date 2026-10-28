import { Link } from "react-router-dom";

const year = new Date().getFullYear();

const columns = [
  {
    title: "Boutique",
    links: [
      { label: "Accueil", to: "/" },
      { label: "Tous les produits", to: "/produits" },
      { label: "En vedette", to: "/produits?featured=true" },
      { label: "Nouveautés", to: "/produits?sort=created&order=desc" },
      { label: "Les plus commandés", to: "/produits?sort=popular&order=desc" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Connexion", to: "/login" },
      { label: "Créer un compte", to: "/register" },
      { label: "Panier", to: "/client/panier" },
      { label: "Mes commandes", to: "/client/commandes" },
    ],
  },
];

function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-[#121816] text-neutral-300">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-white">AtlasPara</p>
          <p className="mt-3 max-w-xs text-sm leading-6">
            Parapharmacie en ligne. Les prix affichés sont ceux du catalogue, en dirhams. Le paiement se fait à la livraison.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-white">{column.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-4 py-4 text-xs text-neutral-500 sm:px-6">
          © {year} AtlasPara. Vente de produits de parapharmacie.
        </p>
      </div>
    </footer>
  );
}

export default StoreFooter;
