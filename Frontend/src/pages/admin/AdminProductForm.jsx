import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import ProductThumb from "../../components/admin/ProductThumb";
import {
  createProduct,
  deleteProduct,
  fetchBrands,
  fetchCategories,
  fetchProduct,
  updateProduct,
  updateProductStatus,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const MAX_IMAGE = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "0",
  imageUrl: "",
  isActive: true,
  categoryId: "",
  brandId: "",
  brandName: "",
};

function AdminProductForm() {
  const { id } = useParams();
  const creating = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [meta, setMeta] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");

  useEffect(() => {
    if (location.state?.notice) setNotice(location.state.notice);
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchCategories({ options: 1 }),
      fetchBrands(),
      creating ? Promise.resolve(null) : fetchProduct(id),
    ])
      .then(([categoryResult, brandResult, productResult]) => {
        if (!active) return;
        setCategories(categoryResult.categories || []);
        setBrands(brandResult.brands || []);
        if (productResult?.product) {
          const product = productResult.product;
          setMeta(product);
          setForm({
            name: product.name || "",
            description: product.description || "",
            price: String(product.price ?? ""),
            stockQuantity: String(product.stockQuantity ?? 0),
            imageUrl: product.imageUrl || "",
            isActive: product.isActive,
            categoryId: product.category?.id || "",
            brandId: product.brand?.id || "",
            brandName: "",
          });
        }
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
  }, [creating, id]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Format non accepté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE) {
      setError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    setError("");
    setRemoveImage(false);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      isActive: form.isActive,
      categoryId: form.categoryId,
      brandId: form.brandId === "new" ? "" : form.brandId,
      brandName: form.brandId === "new" ? form.brandName : "",
      removeImage,
    };

    try {
      const result = creating
        ? await createProduct(payload, imageFile)
        : await updateProduct(id, payload, imageFile);
      if (creating) {
        navigate(`/admin/products/${result.product.id}`, {
          state: { notice: "Produit créé." },
        });
        return;
      }
      setNotice("Produit enregistré.");
      setMeta(result.product);
      setImageFile(null);
      setPreview("");
      setRemoveImage(false);
      setForm((current) => ({
        ...current,
        imageUrl: result.product.imageUrl || "",
        isActive: result.product.isActive,
        brandId: result.product.brand?.id || current.brandId,
        brandName: "",
        categoryId: result.product.category?.id || current.categoryId,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await updateProductStatus(id, !form.isActive);
      setForm((current) => ({ ...current, isActive: result.product.isActive }));
      setMeta(result.product);
      setNotice(result.product.isActive ? "Produit réactivé." : "Produit bloqué.");
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
      await deleteProduct(id);
      navigate("/admin/products", { state: { notice: "Produit supprimé." } });
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
      setSaving(false);
    }
  };

  const shownImage = removeImage ? "" : preview || form.imageUrl;

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section={creating ? "Nouveau produit" : "Fiche produit"}
    >
      <Link to="/admin/products" className="text-sm font-medium text-[#1f9d55]">
        Retour aux produits
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {creating ? "Nouveau produit" : form.name || "Produit"}
          </h1>
          {!creating && meta && (
            <p className="mt-1 text-sm text-slate-400">
              #{meta.id.slice(0, 8).toUpperCase()}
              {meta.createdAt ? ` · créé le ${dateFormat.format(new Date(meta.createdAt))}` : ""}
              {meta.category?.name ? ` · ${meta.category.name}` : ""}
            </p>
          )}
        </div>
        {!creating && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={changeStatus}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:opacity-60"
            >
              {form.isActive ? "Bloquer" : "Débloquer"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmDelete(true)}
              className="rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-700 disabled:opacity-60"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}
      {loading && <p className="mt-8 text-sm text-slate-400">Chargement…</p>}
      {!loading && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-3xl rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        >
          <div className="flex flex-wrap items-start gap-4">
            <ProductThumb src={shownImage} name={form.name || "Produit"} large />
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-medium text-slate-700">Image du produit</p>
              <p className="mt-1 text-sm text-slate-400">JPG, PNG ou WEBP, 2 Mo maximum.</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImage}
                aria-label="Image du produit"
                className="mt-3 block w-full text-sm text-slate-600"
              />
              {(preview || form.imageUrl) && !removeImage && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreview("");
                    setRemoveImage(true);
                  }}
                  className="mt-2 text-sm font-medium text-rose-600"
                >
                  Retirer l'image
                </button>
              )}
              {removeImage && (
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="mt-2 text-sm font-medium text-[#1f9d55]"
                >
                  Conserver l'image actuelle
                </button>
              )}
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-600 sm:col-span-2">
              Nom
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                maxLength={150}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="text-sm text-slate-600">
              Catégorie
              <select
                value={form.categoryId}
                onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                required
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Marque
              <select
                value={form.brandId}
                onChange={(event) => setForm({ ...form, brandId: event.target.value })}
                required
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              >
                <option value="">Choisir une marque</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
                <option value="new">Nouvelle marque</option>
              </select>
            </label>
            {form.brandId === "new" && (
              <label className="text-sm text-slate-600 sm:col-span-2">
                Nom de la marque
                <input
                  value={form.brandName}
                  onChange={(event) => setForm({ ...form, brandName: event.target.value })}
                  required
                  maxLength={100}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
            )}
            <label className="text-sm text-slate-600">
              Prix (MAD)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="text-sm text-slate-600">
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })}
                required
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <label className="text-sm text-slate-600 sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600">
              Statut
              <select
                value={form.isActive ? "active" : "blocked"}
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.value === "active" })
                }
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
              >
                <option value="active">Actif</option>
                <option value="blocked">Bloqué</option>
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Un produit bloqué reste dans l'historique, mais il n'est plus proposé à la vente.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {creating ? "Créer" : "Enregistrer"}
            </button>
            <Link
              to="/admin/products"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
            >
              Annuler
            </Link>
          </div>
          {categories.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Créez d'abord une catégorie pour pouvoir enregistrer un produit.
            </p>
          )}
        </form>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Supprimer ce produit ?</h2>
            <p className="mt-2 text-sm text-slate-500">
              {meta?.orderCount > 0
                ? "Ce produit figure dans des commandes. La suppression est refusée. Bloquez-le pour le retirer de la vente."
                : "Le produit sera retiré du catalogue. Son image n'est effacée que si aucun autre produit ne l'utilise."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              >
                Annuler
              </button>
              {meta?.orderCount > 0 ? (
                <button
                  type="button"
                  disabled={saving || !form.isActive}
                  onClick={() => {
                    setConfirmDelete(false);
                    if (form.isActive) changeStatus();
                  }}
                  className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {form.isActive ? "Bloquer" : "Déjà bloqué"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDelete}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProductForm;
