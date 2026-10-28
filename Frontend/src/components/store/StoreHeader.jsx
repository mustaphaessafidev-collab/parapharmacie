import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { money } from "../client/catalog";
import {
  clearSession,
  getSession,
  pathForRole,
  rememberReturn,
  roleLabel,
} from "../../services/authService";
import { fetchCart, fetchCatalog } from "../../services/clientService";

const NAV = [
  { to: "/", label: "Accueil", match: (path) => path.pathname === "/" },
  { to: "/produits", label: "Produits", match: (path) => path.pathname === "/produits" && new URLSearchParams(path.search).get("featured") !== "true" && new URLSearchParams(path.search).get("sort") !== "created" && path.hash !== "#rayons" },
  { to: "/produits#rayons", label: "Catégories", match: (path) => path.pathname === "/produits" && path.hash === "#rayons" },
  { to: "/produits?featured=true", label: "En vedette", match: (path) => path.pathname === "/produits" && new URLSearchParams(path.search).get("featured") === "true" },
  { to: "/produits?sort=created&order=desc", label: "Nouveautés", match: (path) => path.pathname === "/produits" && new URLSearchParams(path.search).get("sort") === "created" },
];

function Mark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center bg-[#0e7a45] text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v16M4 12h16" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function StoreHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);

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

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      fetchCatalog({ search: term, page: 1, pageSize: 8, sort: "name", order: "asc" })
        .then((result) => setSuggestions(result.products || []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const close = (event) => {
      if (!searchRef.current?.contains(event.target)) setOpenSuggest(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    setOpenSuggest(false);
    setMenuOpen(false);
    const value = query.trim();
    navigate(value ? `/produits?search=${encodeURIComponent(value)}` : "/produits");
  };

  const openCart = () => {
    setAccountOpen(false);
    setMenuOpen(false);
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

  const logout = () => {
    clearSession();
    setSession(null);
    setAccountOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="bg-[#14211b] text-[11px] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <p>Livraison offerte partout au Maroc</p>
          <p className="hidden sm:block">Paiement à la réception, en espèces ou par TPE</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Mark />
          <span className="leading-none">
            <span className="block text-[15px] font-semibold tracking-tight text-neutral-950">AtlasPara</span>
            <span className="mt-1 block text-[10px] tracking-[0.14em] text-neutral-500 uppercase">Parapharmacie</span>
          </span>
        </Link>

        <form ref={searchRef} className="relative hidden min-w-0 flex-1 md:block" onSubmit={submitSearch}>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenSuggest(true);
            }}
            onFocus={() => setOpenSuggest(true)}
            placeholder="Rechercher un soin, une vitamine, une marque…"
            aria-label="Rechercher un produit"
            aria-expanded={openSuggest && suggestions.length > 0}
            className="h-11 w-full border border-neutral-300 bg-neutral-50 pr-24 pl-4 text-sm outline-none focus:border-neutral-950"
          />
          <button type="submit" className="absolute top-1 right-1 bottom-1 bg-[#0e7a45] px-4 text-sm font-medium text-white hover:bg-[#0c693b]">
            Rechercher
          </button>
          {openSuggest && suggestions.length > 0 && (
            <ul className="absolute top-full right-0 left-0 z-20 mt-1 border border-neutral-200 bg-white shadow-lg">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/produits/${product.id}`}
                    onClick={() => setOpenSuggest(false)}
                    className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm hover:bg-neutral-50"
                  >
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 font-medium">{money(product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {session?.user ? (
            <div className="relative">
              <button
                type="button"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                className="hidden h-10 items-center px-3 text-sm font-medium hover:bg-neutral-100 sm:inline-flex"
              >
                {roleLabel(session.user.role)}
              </button>
              {accountOpen && (
                <div className="absolute right-0 z-20 mt-1 w-48 border border-neutral-200 bg-white py-1 text-sm shadow-lg">
                  <Link to={pathForRole(session.user.role)} onClick={() => setAccountOpen(false)} className="block px-3 py-2 hover:bg-neutral-50">
                    Mon espace
                  </Link>
                  <button type="button" onClick={logout} className="block w-full px-3 py-2 text-left hover:bg-neutral-50">
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center sm:flex">
              <Link to="/login" className="h-10 px-3 text-sm font-medium leading-10 hover:bg-neutral-100">
                Connexion
              </Link>
              <Link to="/register" className="h-10 px-3 text-sm font-medium leading-10 text-[#0e7a45] hover:bg-neutral-100">
                Créer un compte
              </Link>
            </div>
          )}

          <button type="button" aria-label="Panier" onClick={openCart} className="relative inline-flex h-10 w-10 items-center justify-center hover:bg-neutral-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 7h15l-1.4 9.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8L5.2 4H3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center bg-[#0e7a45] px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="h-10 px-3 text-sm font-medium md:hidden"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>

      <nav className="mx-auto hidden max-w-[1440px] items-center gap-1 px-6 pb-2 md:flex">
        {NAV.map((item) => {
          const active = item.match(location);
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-2 text-sm ${active ? "font-semibold text-neutral-950" : "text-neutral-600 hover:text-neutral-950"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {menuOpen && (
        <div className="border-t border-neutral-200 px-4 py-4 md:hidden">
          <form onSubmit={submitSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
              className="h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-950"
            />
          </form>
          <div className="mt-3 flex flex-col">
            {NAV.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} className="py-2 text-sm">
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link to={pathForRole(session.user.role)} onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  {roleLabel(session.user.role)}
                </Link>
                <button type="button" onClick={logout} className="py-2 text-left text-sm">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  Connexion
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-[#0e7a45]">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreHeader;
