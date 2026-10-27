import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchLivreurs } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const fullName = (livreur) =>
  `${livreur.firstName || ""} ${livreur.lastName || ""}`.trim() || "Livreur";

function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

function AdminLivreurs() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    deliveries: "all",
    sort: "createdAt",
    order: "desc",
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

    fetchLivreurs(filters)
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
      order:
        current.sort === key
          ? current.order === "asc"
            ? "desc"
            : "asc"
          : key === "name" || key === "email"
            ? "asc"
            : "desc",
      page: 1,
    }));
  };

  const summary = data?.summary;
  const pagination = data?.pagination;
  const livreurs = data?.livreurs || [];
  const filtered = Boolean(
    filters.search || filters.status !== "all" || filters.deliveries !== "all"
  );
  const sortMark = (key) =>
    filters.sort === key ? (filters.order === "asc" ? "↑" : "↓") : "";

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Livreurs"
      badges={{ livreurs: summary?.total || 0 }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Livreurs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Personnel de livraison, du plus récent au plus ancien.
          </p>
        </div>
        <Link
          to="/admin/livreurs/nouveau"
          className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white"
        >
          Nouveau livreur
        </Link>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Livreurs", summary?.total],
          ["Comptes actifs", summary?.active],
          ["Comptes inactifs", summary?.inactive],
          ["Avec livraisons", summary?.withDeliveries],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {numberFormat.format(value || 0)}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Rechercher un livreur</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nom, e-mail, téléphone ou identifiant"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
          </label>
          <select
            aria-label="Statut du compte"
            value={filters.status}
            onChange={(event) => updateFilter({ status: event.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <select
            aria-label="Livraisons assignées"
            value={filters.deliveries}
            onChange={(event) => updateFilter({ deliveries: event.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value="all">Toutes les affectations</option>
            <option value="assigned">Avec livraisons</option>
            <option value="none">Sans livraison</option>
          </select>
          <select
            aria-label="Taille de page"
            value={filters.pageSize}
            onChange={(event) => updateFilter({ pageSize: Number(event.target.value) })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setFilters((current) => ({
                  ...current,
                  search: "",
                  status: "all",
                  deliveries: "all",
                  page: 1,
                }));
              }}
              className="text-sm font-medium text-slate-500"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Identifiant</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("name")}>
                    Livreur {sortMark("name")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("email")}>
                    E-mail {sortMark("email")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Téléphone</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("createdAt")}>
                    Inscription {sortMark("createdAt")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("status")}>
                    Statut {sortMark("status")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("assigned")}>
                    Assignées {sortMark("assigned")}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("completed")}>
                    Terminées {sortMark("completed")}
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-400">
                    Chargement des livreurs…
                  </td>
                </tr>
              )}
              {!loading && livreurs.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-400">
                    {filtered
                      ? "Aucun livreur ne correspond à ces critères."
                      : "Aucun livreur enregistré."}
                  </td>
                </tr>
              )}
              {!loading &&
                livreurs.map((livreur) => (
                  <tr key={livreur.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800" title={livreur.id}>
                      #{livreur.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/admin/livreurs/${livreur.id}`}
                        className="font-medium text-slate-800"
                      >
                        {fullName(livreur)}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{livreur.email}</td>
                    <td className="px-3 py-3 text-slate-500">{livreur.phone || "—"}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {dateFormat.format(new Date(livreur.createdAt))}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge active={livreur.isActive} />
                    </td>
                    <td className="px-3 py-3">{numberFormat.format(livreur.assignedCount)}</td>
                    <td className="px-3 py-3">{numberFormat.format(livreur.completedCount)}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/livreurs/${livreur.id}`}
                        className="font-medium text-[#1f9d55]"
                      >
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
            {(pagination?.total || 0) > 1 ? "livreurs" : "livreur"}
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

export default AdminLivreurs;
