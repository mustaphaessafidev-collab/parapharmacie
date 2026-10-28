import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../services/clientService";

const visuals = [
  { test: /visage|peau|beauté|beaute/, image: "/home/cat-visage.jpg", icon: "drop" },
  { test: /cheveu|capillaire/, image: "/home/cat-cheveux.jpg", icon: "spark" },
  { test: /bébé|bebe|maman/, image: "/home/cat-bebe.jpg", icon: "baby" },
  { test: /vitamin|complément|complement|vital/, image: "/home/cat-vitalite.jpg", icon: "pulse" },
  { test: /hygiène|hygiene/, image: "/home/cat-hygiene.jpg", icon: "shield" },
  { test: /médical|medical|matériel|materiel/, image: "/home/story-pharmacy.jpg", icon: "shield" },
  { test: /bio|bien/, image: "/home/cat-bio.jpg", icon: "leaf" },
  { test: /corps/, image: "/home/cat-corps.jpg", icon: "leaf" },
];

const visualFor = (name) => visuals.find((item) => item.test.test(name.toLowerCase())) || {
  image: "/home/cat-beaute.jpg",
  icon: "drop",
};

function CatIcon({ name }) {
  const common = "h-5 w-5";
  if (name === "drop") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3.5s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10Z" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v6M12 15v6M4.5 7.5 8.7 10M15.3 14l4.2 2.5M4.5 16.5 8.7 14M15.3 10l4.2-2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "baby") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3" />
        <path d="M6 19.5c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2L12 3.5Z" />
      </svg>
    );
  }
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19c8-1 13-7 14-14-7 1-13 6-14 14Z" strokeLinejoin="round" />
        <path d="M9 15c2-2 4-4 7-6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13c2.5-6 6-8 8-8s5.5 2 8 8" strokeLinecap="round" />
      <path d="M12 5v14" strokeLinecap="round" />
    </svg>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((result) => setCategories(result.categories || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section id="categories" className="bg-[#f4f6f8] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#7d8da3]">EXPLOREZ NOTRE CATALOGUE</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1c2430] sm:text-4xl">
              Découvrez nos catégories
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Des solutions ciblées pour votre routine de santé et dermo-cosmétique quotidienne.
            </p>
          </div>
          <Link to="/produits" className="hidden shrink-0 text-sm font-semibold text-[#159447] sm:inline">
            Tous les rayons →
          </Link>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {categories.length === 0 && !error ? (
          <p className="mt-6 text-sm text-slate-500">Aucune catégorie publiée pour le moment.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const visual = visualFor(category.name);
              return (
                <Link
                  key={category.id}
                  to={`/produits?categoryId=${category.id}`}
                  className="rounded-[24px] bg-white p-3 shadow-[0_8px_24px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f8ee] text-[#159447]">
                      <CatIcon name={visual.icon} />
                    </span>
                    <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[11px] font-semibold text-[#159447]">
                      {category.productCount} {category.productCount > 1 ? "produits" : "produit"}
                    </span>
                  </div>
                  <img src={visual.image} alt="" className="h-40 w-full rounded-2xl object-cover" />
                  <h3 className="mt-3 px-1 text-base font-bold text-[#1c2430]">{category.name}</h3>
                  <p className="mt-1 px-1 pb-2 text-xs leading-5 text-slate-500">
                    {category.description || "Voir les produits de cette catégorie."}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;
