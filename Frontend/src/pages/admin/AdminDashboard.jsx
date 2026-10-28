import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import UserAvatar from "../../components/UserAvatar";
import { fetchDashboard } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");

const money = (value) =>
  `${numberFormat.format(value || 0)} MAD`;

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const longDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const palette = ["#1f9d55", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

function statusClass(status) {
  const value = String(status || "").toUpperCase();
  if (value === "DELIVERED" || value === "CONFIRMED") return "bg-emerald-50 text-emerald-700";
  if (value === "CANCELLED" || value === "REJECTED" || value === "DELIVERY_FAILED") return "bg-rose-50 text-rose-700";
  if (value === "PENDING") return "bg-amber-50 text-amber-700";
  if (value === "ASSIGNED" || value === "OUT_FOR_DELIVERY") return "bg-indigo-50 text-indigo-700";

  const legacy = String(status || "").toLowerCase();
  if (legacy.includes("livr")) return "bg-emerald-50 text-emerald-700";
  if (legacy.includes("annul")) return "bg-rose-50 text-rose-700";
  if (legacy.includes("attente") || legacy.includes("prepar") || legacy.includes("cours")) {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-slate-100 text-slate-600";
}

function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-[11px] text-slate-400">{detail}</p>
    </article>
  );
}

function SalesChart({ series }) {
  const active = series.some((point) => point.orders > 0 || point.revenue > 0);

  if (!active) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        Aucune vente enregistrée sur cette période.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const max = Math.max(...series.map((point) => point.revenue), 1);
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const points = series.map((point, index) => {
    const x = series.length > 1 ? index * step : width / 2;
    const y = height - (point.revenue / max) * (height - 24) - 8;
    return `${x},${y}`;
  });

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <polyline
          fill="none"
          stroke="#1f9d55"
          strokeWidth="3"
          points={points.join(" ")}
        />
      </svg>
      <div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-400">
        {series
          .filter((_, index) => {
            const step = Math.ceil(series.length / 6);
            return index % step === 0 || index === series.length - 1;
          })
          .map((point) => (
            <span key={`${point.label}-${point.orders}`} className="truncate">
              {point.label}
            </span>
          ))}
      </div>
    </div>
  );
}

function CategorySplit({ categories, productCount }) {
  const total = categories.reduce((sum, category) => sum + category.products, 0);

  if (!total) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        Aucun produit classé pour le moment.
      </div>
    );
  }

  let offset = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-36 w-36">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#eef2f6" strokeWidth="14" />
        {categories.map((category, index) => {
          const length = (category.products / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const circle = (
            <circle
              key={category.name}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={palette[index % palette.length]}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += length;
          return circle;
        })}
        <text x="60" y="58" textAnchor="middle" className="fill-slate-900 text-lg font-semibold">
          {productCount}
        </text>
        <text x="60" y="74" textAnchor="middle" className="fill-slate-400 text-[8px]">
          Produits
        </text>
      </svg>
      <ul className="w-full space-y-2">
        {categories.map((category, index) => (
          <li key={category.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              {category.name}
            </span>
            <span className="font-medium text-slate-800">
              {category.products} · {Math.round((category.products / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [period, setPeriod] = useState("month");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    fetchDashboard(period)
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
  }, [period]);

  useEffect(() => {
    const refresh = () => {
      fetchDashboard(period).then(setData).catch(() => {});
    };
    window.addEventListener("atlaspara-orders", refresh);
    return () => window.removeEventListener("atlaspara-orders", refresh);
  }, [period]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const totals = data?.totals;
  const orders = (data?.recentOrders || []).filter((order) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      order.client.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      String(order.status).toLowerCase().includes(query) ||
      String(order.statusLabel || "").toLowerCase().includes(query)
    );
  });

  return (
    <AdminLayout
      user={session?.user}
      onLogout={handleLogout}
      period={period}
      onPeriodChange={setPeriod}
      search={search}
      onSearch={setSearch}
      badges={{
        products: totals?.products || 0,
        clients: totals?.clients || 0,
        lowStock: totals?.lowStock || 0,
        orders: totals?.pendingOrders || 0,
      }}
    >
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          Bonjour {session?.user?.firstName} {session?.user?.lastName}
        </h1>
        <p className="mt-1 text-sm capitalize text-slate-400">{longDate.format(new Date())}</p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Produits"
          value={loading ? "…" : numberFormat.format(totals?.products || 0)}
          detail={`${numberFormat.format(totals?.activeProducts || 0)} actifs au catalogue`}
        />
        <StatCard
          label="Clients"
          value={loading ? "…" : numberFormat.format(totals?.clients || 0)}
          detail={`${numberFormat.format(totals?.verifiedClients || 0)} e-mails vérifiés`}
        />
        <StatCard
          label="Chiffre d'affaires"
          value={loading ? "…" : money(totals?.revenue)}
          detail="Total des commandes de la période"
        />
        <StatCard
          label="Commandes"
          value={loading ? "…" : numberFormat.format(totals?.orders || 0)}
          detail={`${numberFormat.format(totals?.pendingOrders || 0)} en attente ou en cours`}
        />
        <StatCard
          label="Alertes stock"
          value={loading ? "…" : numberFormat.format(totals?.lowStock || 0)}
          detail={`Stock inférieur ou égal à ${data?.lowStockMax || 5}`}
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-900">Évolution des ventes</h2>
          <p className="mt-1 text-xs text-slate-400">
            Commandes et chiffre d'affaires enregistrés sur la période choisie.
          </p>
          <div className="mt-4">
            <SalesChart series={data?.series || []} />
          </div>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-900">Répartition par catégorie</h2>
          <p className="mt-1 text-xs text-slate-400">Part des produits enregistrés.</p>
          <div className="mt-4">
            <CategorySplit
              categories={data?.categories || []}
              productCount={totals?.products || 0}
            />
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Commandes récentes</h2>
            <p className="mt-1 text-xs text-slate-400">Commandes de la période sélectionnée.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Commande</th>
                  <th className="px-3 py-3 font-medium">Client</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                      {search.trim()
                        ? "Aucune commande ne correspond à ce filtre."
                        : "Aucune commande enregistrée."}
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <Link to={`/admin/commandes/${order.id}`} className="text-[#1f9d55]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-400">
                        {order.articles} article{order.articles > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <UserAvatar
                          user={{ firstName: order.client, avatarUrl: order.clientAvatarUrl }}
                          className="h-8 w-8 text-xs"
                        />
                        {order.client}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{dateFormat.format(new Date(order.date))}</td>
                    <td className="px-3 py-3">{money(order.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.status)}`}>
                        {order.statusLabel || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-900">Stocks bas</h2>
          <p className="mt-1 text-xs text-slate-400">
            Produits dont le stock est inférieur ou égal à {data?.lowStockMax || 5}.
          </p>
          <ul className="mt-4 space-y-3">
            {(data?.lowStockProducts || []).length === 0 && (
              <li className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                Aucun produit sous ce seuil.
              </li>
            )}
            {(data?.lowStockProducts || []).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3">
                <span>
                  <span className="block text-sm font-medium text-slate-800">{product.name}</span>
                  <span className="block text-xs text-slate-400">{product.category}</span>
                </span>
                <span className="text-sm font-semibold text-rose-600">{product.stockQuantity}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
