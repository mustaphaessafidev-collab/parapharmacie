const advantages = [
  {
    title: "Produits de parapharmacie",
    text: "Dermocosmétique, hygiène et nutrition réunis dans une seule sélection.",
  },
  {
    title: "Compte personnel",
    text: "Inscription, vérification de l'e-mail et connexion sécurisée par jeton.",
  },
  {
    title: "Livraison au Maroc",
    text: "Le numéro de téléphone sert au suivi de livraison lors de vos commandes.",
  },
  {
    title: "Données protégées",
    text: "Les informations de compte sont transmises selon les pratiques déjà affichées (CNDP, loi 09-08).",
  },
];

function Advantages() {
  return (
    <section id="avantages" className="bg-indigo-50/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Pourquoi AtlasPara
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {advantages.map((item) => (
            <li key={item.title} className="rounded-2xl bg-white px-5 py-5 shadow-sm">
              <h3 className="text-base font-semibold text-emerald-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Advantages;
