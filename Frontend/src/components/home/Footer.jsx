import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-base font-semibold text-white">AtlasPara</p>
          <p className="mt-2 max-w-sm text-sm leading-6">
            Parapharmacie en ligne. Vos accès compte passent par les
            pages de connexion et d'inscription.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-5">
          <Link to="/login" className="hover:text-white">
            Se connecter
          </Link>
          <Link to="/register" className="hover:text-white">
            Créer un compte
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AtlasPara
      </div>
    </footer>
  );
}

export default Footer;
