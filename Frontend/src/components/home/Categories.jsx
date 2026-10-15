const categories = [
  {
    name: "Dermocosmétique",
    detail: "Visage, corps et soins ciblés.",
  },
  {
    name: "Hygiène",
    detail: "Soins quotidiens pour toute la famille.",
  },
  {
    name: "Solaire",
    detail: "Protection adaptée au climat marocain.",
  },
  {
    name: "Maman et bébé",
    detail: "Hygiène douce et soins de la peau.",
  },
  {
    name: "Nutrition",
    detail: "Compléments et équilibre alimentaire.",
  },
  {
    name: "Premiers soins",
    detail: "Indispensables à garder à la maison.",
  },
];

function Categories() {
  return (
    <section id="categories" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-slate-900">
            Catégories de produits
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Un rayon clair pour trouver le soin adapté, sans catalogue
            inventé : les fiches produits arriveront avec l'API catalogue.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.name}
              className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 px-5 py-5"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {category.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Categories;
