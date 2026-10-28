import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { createCategory } from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

function AdminCategoryForm() {
  const navigate = useNavigate();
  const session = getSession();
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await createCategory(form);
      navigate(`/admin/categories/${result.category.id}`, {
        state: { notice: "Catégorie créée." },
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
      section="Nouvelle catégorie"
    >
      <Link to="/admin/categories" className="text-sm font-medium text-[#1f9d55]">
        Retour aux catégories
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Nouvelle catégorie</h1>
      <p className="mt-1 text-sm text-slate-400">
        Le nom doit être unique. L'image et la date de création ne sont pas prévues dans le catalogue.
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="mt-4 max-w-2xl rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
      >
        <label className="block text-sm text-slate-600">
          Nom
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            maxLength={100}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
          />
        </label>
        <label className="mt-4 block text-sm text-slate-600">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            maxLength={2000}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Créer
          </button>
          <Link to="/admin/categories" className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
            Annuler
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminCategoryForm;
