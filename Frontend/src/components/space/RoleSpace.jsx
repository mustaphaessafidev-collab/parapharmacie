import { Link, useNavigate } from "react-router-dom";
import { clearSession } from "../../services/authService";

function RoleSpace({ title, roleLabel, description }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 text-slate-800">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="." className="text-sm font-semibold text-slate-900">
            AtlasPara
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              {roleLabel}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-emerald-800"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="text-sm font-semibold text-emerald-800">{roleLabel}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </main>
    </div>
  );
}

export default RoleSpace;
