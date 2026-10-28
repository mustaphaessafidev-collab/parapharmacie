import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import UserAvatar from "../../components/UserAvatar";
import { OrderStatusBadge, orderMoney } from "../../components/orders/OrderProgress";
import { fetchOrders } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const filters = [
  { id: "all", label: "Toutes" },
  { id: "PENDING", label: "En attente" },
  { id: "CONFIRMED", label: "Validées" },
  { id: "ASSIGNED", label: "Assignées" },
  { id: "OUT_FOR_DELIVERY", label: "En livraison" },
  { id: "DELIVERED", label: "Livrées" },
  { id: "DELIVERY_FAILED", label: "Échecs" },
  { id: "CANCELLED", label: "Annulées" },
  { id: "REJECTED", label: "Refusées" },
];

const clientName = (order) =>
  `${order.client?.firstName || ""} ${order.client?.lastName || ""}`.trim() || "Client";

const livreurName = (order) =>
  order.livreur
    ? `${order.livreur.firstName || ""} ${order.livreur.lastName || ""}`.trim()
    : "Non assigné";

function AdminOrders() {
  const navigate = useNavigate();
  const session = getSession();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState({ search: "", status: "all", page: 1, pageSize: 10 });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchInput.trim();
      setQuery((current) => (current.search === search ? current : { ...current, search, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchOrders(query)
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
  }, [query, pulse]);

  useEffect(() => {
    const refresh = () => setPulse((value) => value + 1);
    window.addEventListener("atlaspara-orders", refresh);
    return () => window.removeEventListener("atlaspara-orders", refresh);
  }, []);

  const summary = data?.summary;
  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Commandes"
      badges={{ orders: summary?.pending || 0 }}
    >
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Commandes</h1>
        <p className="mt-1 text-sm text-slate-400">
          Validation, assignation et suivi des commandes clients.
        </p>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["En attente", summary?.pending, "PENDING"],
          ["Validées", summary?.confirmed, "CONFIRMED"],
          ["Assignées", summary?.assigned, "ASSIGNED"],
          ["Livrées", summary?.delivered, "DELIVERED"],
        ].map(([label, value, status]) => (
          <button
            key={label}
            type="button"
            onClick={() => setQuery((current) => ({ ...current, status, page: 1 }))}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? "…" : value || 0}</p>
          </button>
        ))}
      </section>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setQuery((current) => ({ ...current, status: filter.id, page: 1 }))}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                query.status === filter.id ? "bg-[#1f9d55] text-white" : "bg-white text-slate-500"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="flex h-10 min-w-[220px] items-center rounded-full border border-slate-200 bg-white px-4 text-sm">
          <span className="sr-only">Rechercher une commande</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Client, téléphone, référence"
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Commande</th>
                <th className="px-3 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Livreur</th>
                <th className="px-3 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                    Chargement des commandes…
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                    Aucune commande ne correspond à ce filtre.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <Link to={`/admin/commandes/${order.id}`} className="font-medium text-[#1f9d55]">
                        {order.reference}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {dateFormat.format(new Date(order.orderDate))}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <UserAvatar user={order.client} className="h-8 w-8 text-xs" />
                        <span>
                          <span className="block">{clientName(order)}</span>
                          <span className="block text-[11px] text-slate-400">{order.phone || "Téléphone non renseigné"}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{livreurName(order)}</td>
                    <td className="px-3 py-3">{orderMoney(order.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} label={order.statusLabel} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
              className="text-slate-500 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-slate-400">
              Page {pagination.page} / {pagination.pages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
              className="text-slate-500 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminOrders;
