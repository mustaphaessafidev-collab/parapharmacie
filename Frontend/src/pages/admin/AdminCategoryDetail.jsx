import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  deleteCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");

function AdminCategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [category, setCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [reassignToId, setReassignToId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");

  const apply = (result) => {
    setCategory(result.category);
    setForm({
      name: result.category.name || "",
      description: result.category.description || "",
    });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([fetchCategory(id), fetchCategories({ options: 1 })])
      .then(([detail, list]) => {
        if (!active) return;
        apply(detail);
        setOptions((list.categories || []).filter((item) => item.id !== id));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await updateCategory(id, form);
      apply(result);
      setEditing(false);
      setNotice("Catégorie enregistrée.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");

    try {
      const result = await deleteCategory(
        id,
        category.productCount > 0 ? { reassignToId } : undefined
      );
      const moved = result.reassigned || 0;
      const message =
        moved > 0
          ? `Catégorie supprimée. ${moved} produit${moved > 1 ? "s réassignés" : " réassigné"}.`
          : "Catégorie supprimée.";
      navigate("/admin/categories", { state: { notice: message } });
    } catch (err) {
      setError(err.message);
      setConfirm(false);
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
      section="Fiche catégorie"
    >
      <Link to="/admin/categories" className="text-sm font-medium text-[#1f9d55]">
        Retour aux catégories
      </Link>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}
      {loading && <p className="mt-8 text-sm text-slate-400">Chargement de la catégorie…</p>}

      {!loading && category && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{category.name}</h1>
              <p className="mt-1 text-sm text-slate-400" title={category.id}>
                #{category.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white"
              >
                {editing ? "Fermer" : "Modifier"}
              </button>
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600"
              >
                Supprimer
              </button>
            </div>
          </div>

          <article className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs text-slate-400">Produits associés</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {numberFormat.format(category.productCount)}
            </p>
          </article>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            {!editing && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Nom</p>
                  <p className="mt-1 text-sm text-slate-800">{category.name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400">Description</p>
                  <p className="mt-1 text-sm text-slate-800">{category.description || "—"}</p>
                </div>
              </div>
            )}
            {editing && (
              <form onSubmit={handleSave} className="grid gap-4">
                <label className="text-sm text-slate-600">
                  Nom
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    maxLength={100}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    maxLength={2000}
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}

      {confirm && category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Supprimer cette catégorie ?</h2>
            {category.productCount === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                {category.name} sera retirée. Aucun produit n'y est associé.
              </p>
            ) : (
              <div className="mt-2 text-sm text-slate-500">
                <p>
                  {category.productCount} produit{category.productCount > 1 ? "s doivent" : " doit"}{" "}
                  être déplacé{category.productCount > 1 ? "s" : ""} avant la suppression. Les
                  produits ne sont pas effacés.
                </p>
                {options.length === 0 ? (
                  <p className="mt-3 text-rose-600">
                    Créez d'abord une autre catégorie pour recevoir ces produits.
                  </p>
                ) : (
                  <label className="mt-3 block text-slate-600">
                    Nouvelle catégorie
                    <select
                      value={reassignToId}
                      onChange={(event) => setReassignToId(event.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                    >
                      <option value="">Choisir</option>
                      {options.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={
                  saving ||
                  (category.productCount > 0 && (!reassignToId || options.length === 0))
                }
                onClick={handleDelete}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCategoryDetail;
