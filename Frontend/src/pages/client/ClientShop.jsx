import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../components/client/catalog";
import { fetchCatalog, fetchCategories } from "../../services/clientService";

function ClientShop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCategories(), fetchCatalog({ page: 1, pageSize: 8, sort: "created", order: "desc" })])
      .then(([categoryResult, productResult]) => {
        if (!active) return;
        setCategories(categoryResult.categories || []);
        setProducts(productResult.products || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-bold tracking-[0.16em] text-[#159447]">ESPACE CLIENT</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Boutique</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Parcourez les produits actifs du catalogue. Les prix affichés sont ceux enregistrés en dirhams.
      </p>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Chargement du catalogue…</p>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/client/produits?categoryId=${category.id}`}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:text-[#159447]"
              >
                {category.name}
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-slate-500">Aucune catégorie publiée.</p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">Produits disponibles</h2>
            <Link to="/client/produits" className="text-sm font-semibold text-[#159447]">
              Tout voir
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="mt-6 border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              Aucun produit actif n'est disponible pour le moment.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClientShop;
