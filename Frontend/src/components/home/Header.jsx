import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearSession,
  getSession,
  pathForRole,
  rememberReturn,
  roleLabel,
} from "../../services/authService";
import { fetchCart } from "../../services/clientService";

const NAV = [
  { href: "/", label: "Accueil", home: true },
  { href: "/produits", label: "Produits", route: true },
  { href: "/produits#categories", label: "Catégories", route: true },
  { href: "#apropos", label: "À propos" },
  { href: "#contact", label: "Contact" },
];

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h15l-1.4 8.2a2 2 0 0 1-2 1.6H8.2a2 2 0 0 1-2-1.6L5 7Z" strokeLinejoin="round" />
      <path d="M8 7 9.2 4.8A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .9.8L16 7" strokeLinecap="round" />
      <circle cx="9" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="1.6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2L12 3.5Z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function LogoMark() {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#159447] text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-5.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
        <path d="M12 11.2v4.2M10 13.3h4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [cartCount, setCartCount] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (session?.user?.role !== "CLIENT") {
      setCartCount(0);
      return undefined;
    }
    let active = true;
    fetchCart()
      .then((result) => {
        if (active) setCartCount(result.cart?.itemCount || 0);
      })
      .catch(() => {
        if (active) setCartCount(0);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id, session?.user?.role]);

  const openCart = () => {
    setAccountOpen(false);
    closeMenu();
    if (session?.user?.role === "CLIENT") {
      navigate("/client/panier");
      return;
    }
    if (!session?.user) {
      rememberReturn("/client/panier");
      navigate("/login?reason=order&next=%2Fclient%2Fpanier");
      return;
    }
    navigate(pathForRole(session.user.role));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    closeMenu();
    const value = query.trim();
    navigate(value ? `/produits?search=${encodeURIComponent(value)}` : "/produits");
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAccountOpen(false);
    closeMenu();
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-[#0e7a3c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-4 py-2 text-[11px] font-medium whitespace-nowrap sm:px-6 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <IconPin />
            Livraison express partout au Maroc (Casablanca, Rabat, Marrakech, Tanger…)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconShield />
            100% Produits Authentiques Certifiés &amp; Laboratoires Agréés
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCard />
            Paiement Sécurisé à la Livraison (Cash/TPE) ou par Carte CMI
          </span>
        </div>
      </div>

      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={closeMenu}>
            <LogoMark />
            <span className="min-w-0 leading-tight">
              <span className="flex items-center gap-1.5">
                <span className="text-[17px] font-extrabold tracking-tight text-[#1c2430]">
                  AtlasPara
                </span>
                <span className="rounded-md bg-[#f4a23a] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                  MAROC
                </span>
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                Parapharmacie en ligne N°1 au Maroc
              </span>
            </span>
          </Link>

          <form className="hidden min-w-0 flex-1 md:block" onSubmit={submitSearch}>
            <label className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                <IconSearch />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un produit"
                aria-label="Rechercher un produit"
                className="h-10 w-full rounded-full border border-slate-200 pr-4 pl-10 text-sm outline-none focus:border-[#159447]"
              />
            </label>
          </form>

          <nav className="ml-2 hidden items-center gap-1 text-sm text-slate-600 lg:flex">
            {NAV.map((item) =>
              item.home ? (
                <Link
                  key={item.label}
                  to="/"
                  className="rounded-full bg-[#159447] px-4 py-2 font-semibold text-white"
                >
                  {item.label}
                </Link>
              ) : item.route ? (
                <Link key={item.label} to={item.href} className="rounded-full px-3 py-2 hover:text-[#159447]">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="rounded-full px-3 py-2 hover:text-[#159447]">
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 xl:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#159447]" />
              Maroc (MAD / د.م)
            </span>

            <button
              type="button"
              aria-label="Panier"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-50"
            >
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f4a23a] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {session?.user ? (
              <Link
                to={pathForRole(session.user.role)}
                className="hidden items-center gap-2 rounded-full bg-[#159447] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12843f] sm:inline-flex"
              >
                {roleLabel(session.user.role)}
              </Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#159447] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12843f]"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-full border border-[#159447] px-4 py-2.5 text-sm font-semibold text-[#159447] hover:bg-emerald-50"
                >
                  Créer un compte
                </Link>
              </div>
            )}

            <div className="relative">
              {session?.user ? (
                <button
                  type="button"
                  aria-label="Compte"
                  aria-expanded={accountOpen}
                  onClick={() => {
                  setAccountOpen((open) => !open);
                }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#159447] text-white"
                >
                  <IconUser />
                </button>
              ) : (
                <Link
                  to="/register"
                  aria-label="Créer un compte"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#159447] text-white"
                >
                  <IconUser />
                </Link>
              )}
              {accountOpen && session?.user && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 text-sm shadow-xl">
                  <Link
                    to={pathForRole(session.user.role)}
                    onClick={() => setAccountOpen(false)}
                    className="block rounded-xl px-3 py-2 font-semibold text-[#159447] hover:bg-emerald-50"
                  >
                    {roleLabel(session.user.role)}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
            <form className="mb-3" onSubmit={submitSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un produit"
                aria-label="Rechercher un produit"
                className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#159447]"
              />
            </form>
            <nav className="flex flex-col gap-1 text-sm">
              {NAV.map((item) =>
                item.home ? (
                  <Link key={item.label} to="/" onClick={closeMenu} className="rounded-xl px-3 py-2 font-semibold text-[#159447]">
                    {item.label}
                  </Link>
                ) : item.route ? (
                  <Link key={item.label} to={item.href} onClick={closeMenu} className="rounded-xl px-3 py-2 text-slate-700">
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} onClick={closeMenu} className="rounded-xl px-3 py-2 text-slate-700">
                    {item.label}
                  </a>
                ),
              )}
              {session?.user ? (
                <>
                  <Link
                    to={pathForRole(session.user.role)}
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 font-semibold text-[#159447]"
                  >
                    {roleLabel(session.user.role)}
                  </Link>
                  <button type="button" onClick={handleLogout} className="rounded-xl px-3 py-2 text-left text-slate-700">
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="rounded-xl px-3 py-2 font-semibold text-[#159447]">
                    Se connecter
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="rounded-xl px-3 py-2 font-semibold text-[#159447]">
                    Créer un compte
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}

export default Header;
