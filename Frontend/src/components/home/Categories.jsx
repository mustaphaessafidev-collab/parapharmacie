import { useEffect, useState } from "react";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/categories")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) setCategories(data.categories || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="categories" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-slate-900">
            Catégories de produits
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Les familles de soins enregistrées dans le catalogue.
          </p>
        </div>
        {loading && <p className="mt-8 text-sm text-slate-400">Chargement des catégories…</p>}
        {!loading && categories.length === 0 && (
          <p className="mt-8 text-sm text-slate-500">
            Aucune catégorie n'est publiée pour le moment.
          </p>
        )}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 px-5 py-5"
            >
              <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.description || "Sans description."}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {category.productCount} produit{category.productCount > 1 ? "s" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Categories;
