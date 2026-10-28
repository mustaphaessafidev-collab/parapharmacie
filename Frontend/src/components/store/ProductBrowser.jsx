import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCatalog, fetchCategories } from "../../services/clientService";
import ProductCard, { ProductSkeleton } from "./ProductCard";

const sorts = [
  { value: "popular:desc", label: "Les plus commandés" },
  { value: "created:desc", label: "Nouveautés" },
  { value: "price:asc", label: "Prix croissant" },
  { value: "price:desc", label: "Prix décroissant" },
  { value: "name:asc", label: "Nom A-Z" },
];

function ProductBrowser() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get("search") || "");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const search = params.get("search") || "";
  const categoryId = params.get("categoryId") || "";
  const availability = params.get("availability") || "";
  const featured = params.get("featured") === "true";
  const sortValue = `${params.get("sort") || "name"}:${params.get("order") || "asc"}`;
  const page = params.get("page") || "1";
  const activeCategory = categories.find((category) => category.id === categoryId);

  useEffect(() => {
    fetchCategories()
      .then((result) => setCategories(result.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setDraft(params.get("search") || "");
  }, [params]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const [sort, order] = sortValue.split(":");
    fetchCatalog({
      search,
      categoryId,
      availability,
      sort,
      order,
      page,
      pageSize: 24,
      ...(featured ? { featured: "true" } : {}),
    })
      .then((result) => {
        if (!active) return;
        setProducts(result.products || []);
        setPagination(result.pagination || null);
        setError("");
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
  }, [search, categoryId, availability, sortValue, page, featured]);

  const apply = (next) => {
    const [sort, order] = sortValue.split(":");
    const values = {
      search,
      categoryId,
      availability,
      featured: featured ? "true" : "",
      sort,
      order,
      page: "1",
      ...next,
    };
    const query = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    setParams(query);
  };

  const title = search
    ? `Résultats pour « ${search} »`
    : activeCategory
      ? activeCategory.name
      : featured
        ? "En vedette"
        : "Tous les produits";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
      <nav className="text-xs text-neutral-500">
        <Link to="/" className="hover:text-neutral-950">Accueil</Link>
        <span className="px-2">/</span>
        <Link to="/produits" className="hover:text-neutral-950">Produits</Link>
        {activeCategory && (
          <>
            <span className="px-2">/</span>
            <span className="text-neutral-950">{activeCategory.name}</span>
          </>
        )}
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {pagination ? `${pagination.total} produit${pagination.total > 1 ? "s" : ""}` : "Catalogue"}
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-2 border border-neutral-200 bg-neutral-50 p-3 md:grid-cols-[1fr_180px_160px_180px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          apply({ search: draft, featured: "" });
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Rechercher"
          aria-label="Rechercher un produit"
          className="h-10 border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
        />
        <select
          value={categoryId}
          aria-label="Catégorie"
          onChange={(event) => apply({ categoryId: event.target.value, search: draft })}
          className="h-10 border border-neutral-300 bg-white px-2 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={availability}
          aria-label="Disponibilité"
          onChange={(event) => apply({ availability: event.target.value, search: draft })}
          className="h-10 border border-neutral-300 bg-white px-2 text-sm"
        >
          <option value="">Tout le stock</option>
          <option value="in">En stock</option>
          <option value="out">Rupture</option>
        </select>
        <select
          value={sorts.some((option) => option.value === sortValue) ? sortValue : "name:asc"}
          aria-label="Trier"
          onChange={(event) => {
            const [sort, order] = event.target.value.split(":");
            apply({ sort, order, search: draft });
          }}
          className="h-10 border border-neutral-300 bg-white px-2 text-sm"
        >
          {sorts.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button type="submit" className="h-10 bg-neutral-950 px-4 text-sm font-medium text-white">
          Appliquer
        </button>
      </form>

      <div id="rayons" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => apply({ categoryId: "", search: draft })}
          className={`shrink-0 border px-3 py-1.5 text-xs ${categoryId ? "border-neutral-300" : "border-neutral-950 bg-neutral-950 text-white"}`}
        >
          Tous
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => apply({ categoryId: category.id, search: draft })}
            className={`shrink-0 border px-3 py-1.5 text-xs ${categoryId === category.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {notice && (
        <p className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}{" "}
          <Link to="/client/panier" className="font-medium underline">Voir le panier</Link>
        </p>
      )}
      {error && <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => <ProductSkeleton key={index} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 border border-dashed border-neutral-300 px-4 py-16 text-center">
          <p className="text-sm text-neutral-600">Aucun produit ne correspond à cette recherche.</p>
          <button type="button" onClick={() => apply({ search: "", categoryId: "", availability: "", featured: "" })} className="mt-4 text-sm font-medium text-[#0e7a45]">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onNotice={setNotice} onError={setError} />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => apply({ page: String(pagination.page - 1), search })}
            className="h-10 border border-neutral-300 px-4 disabled:opacity-40"
          >
            Précédent
          </button>
          <span>Page {pagination.page} / {pagination.pages}</span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => apply({ page: String(pagination.page + 1), search })}
            className="h-10 border border-neutral-300 px-4 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductBrowser;
