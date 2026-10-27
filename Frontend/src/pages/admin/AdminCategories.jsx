import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchCategories } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");

function AdminCategories() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    sort: "name",
    order: "asc",
    page: 1,
    pageSize: 10,
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(location.state?.notice || "");

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
    fetchCategories(filters)
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

  const categories = data?.categories || [];
  const pagination = data?.pagination;
  const sortMark = (key) =>
    filters.sort === key ? (filters.order === "asc" ? "↑" : "↓") : "";

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Catégories"
      badges={{ categories: data?.summary?.total || 0 }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catégories</h1>
          <p className="mt-1 text-sm text-slate-400">
            Familles de produits du catalogue.
          </p>
        </div>
        <Link
          to="/admin/categories/nouveau"
          className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white"
        >
          Nouvelle catégorie
        </Link>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <label className="block max-w-md">
          <span className="sr-only">Rechercher une catégorie</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nom ou description"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
          />
        </label>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Identifiant</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("name")}>
                    Nom {sortMark("name")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Description</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("products")}>
                    Produits {sortMark("products")}
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                    Chargement des catégories…
                  </td>
                </tr>
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                    {filters.search
                      ? "Aucune catégorie ne correspond à cette recherche."
                      : "Aucune catégorie enregistrée."}
                  </td>
                </tr>
              )}
              {!loading &&
                categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800" title={category.id}>
                      #{category.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3">
                      <Link to={`/admin/categories/${category.id}`} className="font-medium text-slate-800">
                        {category.name}
                      </Link>
                    </td>
                    <td className="max-w-xs px-3 py-3 text-slate-500">
                      {category.description || "—"}
                    </td>
                    <td className="px-3 py-3">{numberFormat.format(category.productCount)}</td>
                    <td className="px-5 py-3">
                      <Link to={`/admin/categories/${category.id}`} className="font-medium text-[#1f9d55]">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <p>
            {numberFormat.format(pagination?.total || 0)}{" "}
            {(pagination?.total || 0) > 1 ? "catégories" : "catégorie"}
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
    </AdminLayout>
  );
}

export default AdminCategories;
