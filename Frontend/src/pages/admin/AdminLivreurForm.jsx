import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { createLivreur } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

function AdminLivreurForm() {
  const navigate = useNavigate();
  const session = getSession();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await createLivreur(form);
      navigate(`/admin/livreurs/${result.livreur.id}`, {
        state: { notice: "Livreur créé. Le compte peut se connecter à l'espace livreur." },
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Nouveau livreur"
    >
      <Link to="/admin/livreurs" className="text-sm font-medium text-[#1f9d55]">
        Retour aux livreurs
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Nouveau livreur</h1>
      <p className="mt-1 text-sm text-slate-400">
        Le compte reçoit le rôle livreur et peut se connecter immédiatement.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-4 max-w-3xl rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-600 sm:col-span-2">
            Nom complet
            <input
              value={form.fullName}
              onChange={update("fullName")}
              required
              maxLength={201}
              placeholder="Prénom et nom"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
          <label className="text-sm text-slate-600">
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              maxLength={255}
              autoComplete="off"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
          <label className="text-sm text-slate-600">
            Téléphone
            <input
              value={form.phone}
              onChange={update("phone")}
              required
              maxLength={20}
              placeholder="06XXXXXXXX"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
          <label className="text-sm text-slate-600 sm:col-span-2">
            Adresse
            <input
              value={form.address}
              onChange={update("address")}
              maxLength={255}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
          <label className="text-sm text-slate-600">
            Mot de passe
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              required
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
          <label className="text-sm text-slate-600">
            Confirmer le mot de passe
            <input
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          8 caractères minimum, une majuscule et un chiffre. Le mot de passe n'est pas affiché après l'enregistrement.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Créer le compte
          </button>
          <Link
            to="/admin/livreurs"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            Annuler
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminLivreurForm;
