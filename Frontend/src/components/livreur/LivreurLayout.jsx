import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import OrderAlertCenter from "../OrderAlertCenter";
import SoundToggle from "../SoundToggle";
import { clearSession, getSession } from "../../services/authService";
import { fetchNotifications, markNotificationRead } from "../../services/livreurService";
import { SOUNDS } from "../../services/sounds";

export function LivreurAvatar({ user, className = "" }) {
  const initial = (`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "L")
    .slice(0, 1)
    .toUpperCase();
  const src =
    typeof user?.avatarUrl === "string" && user.avatarUrl.startsWith("/uploads/avatars/")
      ? user.avatarUrl
      : "";

  if (src) {
    return <img src={src} alt="" className={`rounded-full object-cover ${className}`} />;
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-emerald-50 font-semibold text-[#1f9d55] ${className}`}
    >
      {initial}
    </span>
  );
}

function LivreurLayout({ section = "Livraisons", children }) {
  const navigate = useNavigate();
  const session = getSession();
  const [user, setUser] = useState(session?.user);
  const [open, setOpen] = useState(false);
  const [waitingBadge, setWaitingBadge] = useState(0);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Livreur";
  const items = [
    { label: "Mes livraisons", to: "/livreur", end: true, badge: true },
    { label: "Mon profil", to: "/livreur/profil" },
  ];

  useEffect(() => {
    const sync = () => setUser(getSession()?.user);
    window.addEventListener("atlaspara-user", sync);
    return () => window.removeEventListener("atlaspara-user", sync);
  }, []);

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
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f9d55] text-sm font-semibold text-white">AP</span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">AtlasPara</span>
            <span className="block text-[11px] text-slate-400">Livreur</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                  isActive ? "bg-[#1f9d55] font-medium text-white" : "text-slate-500 hover:bg-slate-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {item.badge && waitingBadge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {waitingBadge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <NavLink
            to="/livreur/profil"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-2 py-2 ${isActive ? "bg-emerald-50" : "hover:bg-slate-50"}`
            }
          >
            <LivreurAvatar user={user} className="h-9 w-9 text-xs" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-800">{fullName}</span>
              <span className="block text-xs text-slate-400">Livreur</span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={() => {
              clearSession();
              navigate("/login");
            }}
            className="mt-3 px-2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:hidden" onClick={() => setOpen(true)}>
              Menu
            </button>
            <p className="text-sm text-slate-400">
              Livraisons <span className="text-slate-300">/</span> <span className="text-slate-700">{section}</span>
            </p>
            <div className="ml-auto flex items-center gap-2">
              <SoundToggle />
              <Link
                to="/livreur/profil"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
              >
                <LivreurAvatar user={user} className="h-8 w-8 text-xs" />
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:block">
                  {fullName}
                </span>
              </Link>
              <Link to="/" className="text-sm font-medium text-[#1f9d55]">
                Accueil
              </Link>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6">{children}</main>
        <OrderAlertCenter
          userId={user?.id}
          sound={SOUNDS.assignment}
          load={fetchNotifications}
          markRead={markNotificationRead}
          hrefFor={(item) => `/livreur/livraisons/${item.orderId}`}
          onBadge={setWaitingBadge}
          onArrive={() => window.dispatchEvent(new CustomEvent("atlaspara-deliveries"))}
        />
      </div>
    </div>
  );
}

export default LivreurLayout;
