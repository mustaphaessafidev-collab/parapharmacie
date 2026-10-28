import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/client/catalog";
import { fetchCatalog, fetchCategories } from "../../services/clientService";

function ClientProducts() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState(params.get("search") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryId = params.get("categoryId") || "";
  const sort = params.get("sort") || "name";
  const order = params.get("order") || "asc";
  const page = params.get("page") || "1";

  useEffect(() => {
    fetchCategories()
      .then((result) => setCategories(result.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCatalog({
      search: params.get("search") || "",
      categoryId,
      sort,
      order,
      page,
      pageSize: 12,
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
  }, [params, categoryId, sort, order, page]);

  const update = (next) => {
    const values = {
      search: params.get("search") || "",
      categoryId,
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

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Produits</h1>
      <form
        className="mt-4 grid gap-3 border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_160px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          update({ search });
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un produit"
          className="h-11 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#159447]"
        />
        <select
          value={categoryId}
          onChange={(event) => update({ categoryId: event.target.value, search })}
          className="h-11 rounded-full border border-slate-200 px-3 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={`${sort}:${order}`}
          onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(":");
            update({ sort: nextSort, order: nextOrder, search });
          }}
          className="h-11 rounded-full border border-slate-200 px-3 text-sm"
        >
          <option value="name:asc">Nom A-Z</option>
          <option value="name:desc">Nom Z-A</option>
          <option value="price:asc">Prix croissant</option>
          <option value="price:desc">Prix décroissant</option>
          <option value="created:desc">Plus récents</option>
        </select>
        <button type="submit" className="h-11 rounded-full bg-[#159447] px-5 text-sm font-semibold text-white">
          Rechercher
        </button>
      </form>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Chargement des produits…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Aucun produit ne correspond à cette recherche.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => update({ page: String(pagination.page - 1), search: params.get("search") || "" })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Précédent
          </button>
          <span>
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => update({ page: String(pagination.page + 1), search: params.get("search") || "" })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientProducts;
