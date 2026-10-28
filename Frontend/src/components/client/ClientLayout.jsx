import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { fetchCart } from "../../services/clientService";
import { clearSession, getSession } from "../../services/authService";
import SoundToggle from "../SoundToggle";
import UserAvatar from "../UserAvatar";

function Icon({ name }) {
  const paths = {
    shop: "M4 9h16l-1.2 10H5.2L4 9zm3-3h10l1 3H6l1-3z",
    box: "M4 8l8-4 8 4-8 4-8-4zm0 3l8 4 8-4M12 12v8",
    cart: "M5 7h15l-1.4 8.2a2 2 0 01-2 1.6H8.2a2 2 0 01-2-1.6L5 7zM9 20a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8zm8 0a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8z",
    orders: "M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  };

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClientLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => getSession()?.user);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    const result = await fetchCart();
    setCartCount(result.cart?.itemCount || 0);
    return result.cart;
  };

  useEffect(() => {
    refreshCart().catch(() => setCartCount(0));
  }, []);

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const items = [
    { label: "Boutique", icon: "shop", to: "/client", end: true },
    { label: "Produits", icon: "box", to: "/client/produits" },
    { label: "Panier", icon: "cart", to: "/client/panier", badge: cartCount },
    { label: "Mes commandes", icon: "orders", to: "/client/commandes" },
    { label: "Mon profil", icon: "user", to: "/client/profil" },
  ];

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Client";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-neutral-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/client" className="flex items-center gap-3 px-5 py-5" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#159447] text-sm font-bold text-white">
            AP
          </span>
          <span>
            <span className="block text-sm font-extrabold">AtlasPara</span>
            <span className="block text-[11px] text-slate-400">Espace client</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                  isActive ? "bg-[#159447] font-medium text-white" : "text-slate-500 hover:bg-slate-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon name={item.icon} />
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive ? "bg-white/20" : "bg-emerald-50 text-[#159447]"}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <Link to="/client/profil" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <UserAvatar user={user} className="h-9 w-9 text-xs" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{fullName}</span>
              <span className="block truncate text-xs font-normal text-slate-400">{user?.email}</span>
            </span>
          </Link>
          <button type="button" onClick={logout} className="mt-3 text-xs font-semibold text-slate-500 hover:text-[#159447]">
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <Link to="/" className="text-sm text-slate-500 hover:text-[#159447]">
            Retour à l'accueil
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <SoundToggle />
            <Link to="/client/panier" className="text-sm font-semibold text-[#159447]">
              Panier{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">
          <Outlet context={{ user, setUser, refreshCart }} />
        </main>
      </div>
    </div>
  );
}

export default ClientLayout;
