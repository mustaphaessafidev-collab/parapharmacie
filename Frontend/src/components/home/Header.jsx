import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../services/authService";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    closeMenu();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
            AP
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-slate-900">
              AtlasPara
            </span>
            <span className="block text-[10px] text-emerald-700">
              Parapharmacie
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#categories" className="hover:text-emerald-800">
            Catégories
          </a>
          <a href="#avantages" className="hover:text-emerald-800">
            Avantages
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <>
              <span className="text-sm text-slate-600">
                Bonjour, {session.user.firstName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-emerald-100 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2 text-sm">
            <a href="#categories" onClick={closeMenu} className="py-1 text-slate-700">
              Catégories
            </a>
            <a href="#avantages" onClick={closeMenu} className="py-1 text-slate-700">
              Avantages
            </a>
            {session?.user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="py-1 text-left font-medium text-emerald-800"
              >
                Se déconnecter
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="py-1 font-semibold text-emerald-800"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="py-1 font-semibold text-emerald-800"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
