import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchClients } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const money = (value) => `${numberFormat.format(value || 0)} MAD`;

const fullName = (client) =>
  `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Client";

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

function AdminClients() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    registered: "all",
    from: "",
    to: "",
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

    const query = {
      search: filters.search,
      status: filters.status,
      registered: filters.registered,
      sort: filters.sort,
      order: filters.order,
      page: filters.page,
      pageSize: filters.pageSize,
    };

    if (filters.registered === "custom") {
      query.from = filters.from;
      query.to = filters.to;
    }

    fetchClients(query)
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
  const clients = data?.clients || [];
  const filtered = Boolean(
    filters.search || filters.status !== "all" || filters.registered !== "all"
  );

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Clients"
      badges={{ clients: summary?.total || 0 }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-400">
            Comptes clients enregistrés, du plus récent au plus ancien.
          </p>
        </div>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-400">Clients</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {numberFormat.format(summary?.total || 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-400">Comptes actifs</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {numberFormat.format(summary?.active || 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-400">Comptes inactifs</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {numberFormat.format(summary?.inactive || 0)}
          </p>
        </article>
        <button
          type="button"
          onClick={() =>
            updateFilter({ registered: filters.registered === "7d" ? "all" : "7d" })
          }
          className={`rounded-2xl border px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${
            filters.registered === "7d"
              ? "border-[#1f9d55] bg-emerald-50"
              : "border-slate-100 bg-white"
          }`}
        >
          <p className="text-xs text-slate-400">Nouveaux sur 7 jours</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {numberFormat.format(summary?.recent7 || 0)}
          </p>
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Rechercher un client</span>
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
            aria-label="Date d'inscription"
            value={filters.registered}
            onChange={(event) => updateFilter({ registered: event.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600"
          >
            <option value="all">Toutes les inscriptions</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="custom">Période personnalisée</option>
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
                  registered: "all",
                  from: "",
                  to: "",
                  page: 1,
                }));
              }}
              className="text-sm font-medium text-slate-500"
            >
              Réinitialiser
            </button>
          )}
        </div>
        {filters.registered === "custom" && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-500">
              Du
              <input
                type="date"
                value={filters.from}
                onChange={(event) => updateFilter({ from: event.target.value, registered: "custom" })}
                className="ml-2 h-10 rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="text-sm text-slate-500">
              Au
              <input
                type="date"
                value={filters.to}
                onChange={(event) => updateFilter({ to: event.target.value, registered: "custom" })}
                className="ml-2 h-10 rounded-xl border border-slate-200 px-3"
              />
            </label>
          </div>
        )}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Identifiant</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1">
                    Client {filters.sort === "name" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("email")} className="inline-flex items-center gap-1">
                    E-mail {filters.sort === "email" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Téléphone</th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-1">
                    Inscription {filters.sort === "createdAt" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("status")} className="inline-flex items-center gap-1">
                    Statut {filters.sort === "status" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("orders")} className="inline-flex items-center gap-1">
                    Commandes {filters.sort === "orders" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort("spent")} className="inline-flex items-center gap-1">
                    Dépensé {filters.sort === "spent" ? (filters.order === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-400">
                    Chargement des clients…
                  </td>
                </tr>
              )}
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-400">
                    {filtered
                      ? "Aucun client ne correspond à ces critères."
                      : "Aucun client enregistré."}
                  </td>
                </tr>
              )}
              {!loading &&
                clients.map((client) => (
                  <tr key={client.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800" title={client.id}>
                      #{client.id.slice(0, 8).toUpperCase()}
                      {client.isRecent && (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Link to={`/admin/clients/${client.id}`} className="font-medium text-slate-800">
                        {fullName(client)}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {client.emailVerified ? "E-mail vérifié" : "E-mail non vérifié"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{client.email}</td>
                    <td className="px-3 py-3 text-slate-500">{client.phone || "—"}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {dateFormat.format(new Date(client.createdAt))}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge active={client.isActive} />
                    </td>
                    <td className="px-3 py-3">{numberFormat.format(client.orderCount)}</td>
                    <td className="px-3 py-3">{money(client.totalSpent)}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/clients/${client.id}`}
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
            {(pagination?.total || 0) > 1 ? "clients" : "client"}
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

export default AdminClients;
