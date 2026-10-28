import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import ProductThumb from "../../components/admin/ProductThumb";
import {
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProductStatus,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");
const money = (value) => `${numberFormat.format(value || 0)} MAD`;
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    status: "",
    sort: "created",
    order: "desc",
    page: 1,
    pageSize: 10,
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCategories({ options: 1 })
      .then((result) => setCategories(result.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput.trim()
          ? current
          : { ...current, search: searchInput.trim(), page: 1 }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchProducts(filters)
      .then((result) => {
        if (active) setData(result);
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
  }, [filters]);

  const updateFilter = (patch) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page || 1 }));
  };

  const toggleSort = (key) => {
    setFilters((current) => ({
      ...current,
      sort: key,
      order: current.sort === key && current.order === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const reload = () => setFilters((current) => ({ ...current }));

  const changeStatus = async (product) => {
    setBusy(true);
    setError("");
    try {
      await updateProductStatus(product.id, !product.isActive);
      setNotice(product.isActive ? "Produit bloqué." : "Produit réactivé.");
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      await deleteProduct(pending.id);
      setPending(null);
      setNotice("Produit supprimé.");
      reload();
    } catch (err) {
      setPending((current) => (current ? { ...current, error: err.message } : current));
    } finally {
      setBusy(false);
    }
  };

  const products = data?.products || [];
  const pagination = data?.pagination;
  const filtered = Boolean(filters.search || filters.categoryId || filters.status);
  const sortMark = (key) =>
    filters.sort === key ? (filters.order === "asc" ? "↑" : "↓") : "";

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Produits"
      badges={{ products: data?.summary?.total || 0 }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Produits</h1>
          <p className="mt-1 text-sm text-slate-400">
            Catalogue, prix en MAD et disponibilité à la vente.
          </p>
        </div>
        <Link
          to="/admin/products/nouveau"
          className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white"
        >
          Nouveau produit
        </Link>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-3">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nom ou description"
            aria-label="Rechercher un produit"
            className="h-10 min-w-[220px] flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
          />
          <select
            aria-label="Filtrer par catégorie"
            value={filters.categoryId}
            onChange={(event) => updateFilter({ categoryId: event.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrer par statut"
            value={filters.status}
            onChange={(event) => updateFilter({ status: event.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="blocked">Bloqués</option>
          </select>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Image</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("name")}>
                    Produit {sortMark("name")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Catégorie</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("price")}>
                    Prix {sortMark("price")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("stock")}>
                    Stock {sortMark("stock")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("created")}>
                    Création {sortMark("created")}
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-400">
                    Chargement des produits…
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-400">
                    {filtered
                      ? "Aucun produit ne correspond à cette recherche."
                      : "Aucun produit enregistré."}
                  </td>
                </tr>
              )}
              {!loading &&
                products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <ProductThumb src={product.imageUrl} name={product.name} />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="font-medium text-slate-800"
                      >
                        {product.name}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-slate-400" title={product.id}>
                        #{product.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{product.category?.name || "—"}</td>
                    <td className="px-3 py-3">{money(product.price)}</td>
                    <td className="px-3 py-3">{numberFormat.format(product.stockQuantity)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {product.isActive ? "Actif" : "Bloqué"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {product.createdAt ? dateFormat.format(new Date(product.createdAt)) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="font-medium text-[#1f9d55]"
                        >
                          Voir
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(product)}
                          className="font-medium text-slate-600 disabled:opacity-40"
                        >
                          {product.isActive ? "Bloquer" : "Débloquer"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setPending(product)}
                          className="font-medium text-rose-600 disabled:opacity-40"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <p>
            {numberFormat.format(pagination?.total || 0)}{" "}
            {(pagination?.total || 0) > 1 ? "produits" : "produit"}
            {pagination ? ` · page ${pagination.page} / ${pagination.pages}` : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination || pagination.page <= 1}
              onClick={() => updateFilter({ page: pagination.page - 1 })}
              className="rounded-full border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={!pagination || pagination.page >= pagination.pages}
              onClick={() => updateFilter({ page: pagination.page + 1 })}
              className="rounded-full border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </section>

      {pending && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Supprimer ce produit ?</h2>
            <p className="mt-2 text-sm text-slate-500">
              {pending.orderCount > 0
                ? `${pending.name} figure dans ${pending.orderCount} ligne${
                    pending.orderCount > 1 ? "s" : ""
                  } de commande. La suppression est refusée pour conserver l'historique. Bloquez-le pour le retirer de la vente.`
                : `${pending.name} sera retiré du catalogue. Les commandes existantes ne sont pas modifiées.`}
            </p>
            {pending.error && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {pending.error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              >
                Annuler
              </button>
              {pending.orderCount > 0 && pending.isActive ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const product = pending;
                    setPending(null);
                    changeStatus(product);
                  }}
                  className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Bloquer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || pending.orderCount > 0}
                  onClick={confirmDelete}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;
