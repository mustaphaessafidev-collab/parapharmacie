import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import OrderAlertCenter from "../OrderAlertCenter";
import SoundToggle from "../SoundToggle";
import { fetchNotifications, markNotificationRead } from "../../services/adminService";
import { SOUNDS } from "../../services/sounds";

const periods = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7d", label: "7 jours" },
  { id: "month", label: "Ce mois" },
  { id: "year", label: "Cette année" },
];

function Icon({ name }) {
  const paths = {
    board: "M4 5h7v6H4V5zm9 0h7v4h-7V5zM4 13h7v6H4v-6zm9-2h7v8h-7v-8z",
    box: "M4 8l8-4 8 4-8 4-8-4zm0 3l8 4 8-4M12 12v8",
    tag: "M4 12V6h6l8 8-6 6-8-8zM8 8h.01",
    alert: "M12 4l8 14H4L12 4zm0 5v4m0 3h.01",
    users: "M9 11a3 3 0 100-6 3 3 0 000 6zm6 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 19a5 5 0 0110 0M15 19a4 4 0 014-4",
    chart: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
    truck: "M3 7h11v8H3V7zm11 2h4l3 3v3h-7V9zM7 18a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z",
  };

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavItem({ item, onNavigate }) {
  const className = (active) =>
    `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
      active
        ? "bg-[#1f9d55] font-medium text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-50"
    }`;

  const content = (active) => (
    <>
      <span className="flex items-center gap-3">
        <Icon name={item.icon} />
        {item.label}
      </span>
      {item.badge > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {item.badge}
        </span>
      )}
    </>
  );

  if (!item.to) {
    return <div className={className(false)}>{content(false)}</div>;
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => className(isActive)}
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}

function AdminLayout({
  user,
  onLogout,
  period,
  onPeriodChange,
  search,
  onSearch,
  badges = {},
  section = "Tableau de bord",
  children,
}) {
  const [open, setOpen] = useState(false);
  const [pendingBadge, setPendingBadge] = useState(null);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin";

  const items = [
    { label: "Tableau de bord", icon: "board", to: "/admin", end: true },
    { label: "Commandes", icon: "chart", to: "/admin/commandes", badge: pendingBadge ?? badges.orders },
    { label: "Produits", icon: "box", to: "/admin/products", badge: badges.products },
    { label: "Catégories", icon: "tag", to: "/admin/categories", badge: badges.categories },
    { label: "Stocks", icon: "alert", badge: badges.lowStock },
    { label: "Clients", icon: "users", to: "/admin/clients", badge: badges.clients },
    { label: "Livreurs", icon: "truck", to: "/admin/livreurs", badge: badges.livreurs },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f9d55] text-sm font-semibold text-white">
            AP
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">AtlasPara</span>
            <span className="block text-[11px] text-slate-400">Parapharmacie</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => (
            <NavItem key={item.label} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <NavLink
            to="/admin/profile"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-2 py-2 ${
                isActive ? "bg-emerald-50" : "hover:bg-slate-50"
              }`
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-[#1f9d55]">
              {fullName.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-800">{fullName}</span>
              <span className="block text-xs text-slate-400">Admin</span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 px-2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <p className="text-sm text-slate-400">
              Administration <span className="text-slate-300">/</span>{" "}
              <span className="text-slate-700">{section}</span>
            </p>
            {typeof onSearch === "function" && (
              <label className="ml-auto flex h-10 min-w-[180px] flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm sm:max-w-sm">
                <span className="sr-only">Filtrer les commandes</span>
                <input
                  value={search}
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder="Filtrer les commandes affichées"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
            )}
            {typeof onPeriodChange === "function" && (
              <div className="flex rounded-full bg-slate-100 p-1">
                {periods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPeriodChange(item.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      period === item.id
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <div className={`flex items-center gap-2 ${typeof onSearch === "function" ? "" : "ml-auto"}`}>
              <SoundToggle />
              <Link
                to="/admin/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
              >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-[#1f9d55]">
                {fullName.slice(0, 1)}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:block">
                {fullName}
              </span>
              </Link>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6">{children}</main>
        <OrderAlertCenter
          userId={user?.id}
          sound={SOUNDS.newOrder}
          load={fetchNotifications}
          markRead={markNotificationRead}
          hrefFor={(item) => `/admin/commandes/${item.orderId}`}
          onBadge={setPendingBadge}
          onArrive={() => window.dispatchEvent(new CustomEvent("atlaspara-orders"))}
        />
      </div>
    </div>
  );
}

export default AdminLayout;
