import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  deleteLivreur,
  fetchLivreur,
  updateLivreur,
  updateLivreurStatus,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const money = (value) => `${numberFormat.format(value || 0)} MAD`;
const fullName = (livreur) =>
  `${livreur?.firstName || ""} ${livreur?.lastName || ""}`.trim() || "Livreur";

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

function AdminLivreurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const [livreur, setLivreur] = useState(null);
  const [livreurCount, setLivreurCount] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");

  const apply = (result) => {
    setLivreur(result.livreur);
    setLivreurCount(result.livreurCount || 0);
    setForm({
      firstName: result.livreur.firstName || "",
      lastName: result.livreur.lastName || "",
      email: result.livreur.email || "",
      phone: result.livreur.phone || "",
      address: result.livreur.address || "",
    });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchLivreur(id)
      .then((result) => {
        if (active) apply(result);
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

  const reload = () => fetchLivreur(id).then(apply);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateLivreur(id, form);
      setEditing(false);
      setNotice("Informations enregistrées.");
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateLivreurStatus(id, !livreur.isActive);
      setConfirm("");
      setNotice(livreur.isActive ? "Compte désactivé." : "Compte activé.");
      await reload();
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
      await deleteLivreur(id);
      navigate("/admin/livreurs", { state: { notice: "Livreur supprimé." } });
    } catch (err) {
      setError(err.message);
      setConfirm("");
      setSaving(false);
    }
  };

  const canDelete = livreur && livreur.assignedCount === 0;

  return (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Fiche livreur"
      badges={{ livreurs: livreurCount }}
    >
      <Link to="/admin/livreurs" className="text-sm font-medium text-[#1f9d55]">
        Retour aux livreurs
      </Link>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}

      {loading && <p className="mt-8 text-sm text-slate-400">Chargement de la fiche…</p>}

      {!loading && livreur && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{fullName(livreur)}</h1>
              <p className="mt-1 text-sm text-slate-400">{livreur.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    livreur.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {livreur.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Livreur
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing((current) => !current);
                  setNotice("");
                }}
                className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white"
              >
                {editing ? "Fermer" : "Modifier"}
              </button>
              <button
                type="button"
                onClick={() => (livreur.isActive ? setConfirm("status") : handleStatus())}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                {livreur.isActive ? "Désactiver" : "Activer"}
              </button>
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirm("delete")}
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600"
                >
                  Supprimer
                </button>
              ) : (
                <p className="max-w-xs text-xs text-slate-400">
                  Suppression indisponible : désactivez ce compte pour conserver l'historique des livraisons.
                </p>
              )}
            </div>
          </div>

          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Livraisons assignées</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {numberFormat.format(livreur.assignedCount)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Livraisons terminées</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {numberFormat.format(livreur.completedCount)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Inscrit le</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {dateFormat.format(new Date(livreur.createdAt))}
              </p>
            </article>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
            {!editing && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info label="Identifiant" value={livreur.id} />
                <Info label="Nom complet" value={fullName(livreur)} />
                <Info label="E-mail" value={livreur.email} />
                <Info label="Téléphone" value={livreur.phone} />
                <Info label="Adresse" value={livreur.address} />
                <Info label="Statut du compte" value={livreur.isActive ? "Actif" : "Inactif"} />
              </div>
            )}
            {editing && (
              <form onSubmit={handleSave} className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Prénom
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                    required
                    maxLength={100}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Nom
                  <input
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                    required
                    maxLength={100}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  E-mail
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                    maxLength={255}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Téléphone
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    maxLength={20}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="text-sm text-slate-600 sm:col-span-2">
                  Adresse
                  <input
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    maxLength={255}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <p className="text-xs text-slate-400 sm:col-span-2">
                  Le mot de passe n'est pas modifiable depuis cette fiche.
                </p>
                <div className="flex gap-2 sm:col-span-2">
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

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">Historique des livraisons</h2>
            <p className="mt-1 text-xs text-slate-400">
              Commandes assignées, statuts et livraisons terminées.
            </p>
            {livreur.deliveries.length === 0 && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                Aucune livraison assignée.
              </p>
            )}
            <div className="mt-4 space-y-3">
              {livreur.deliveries.map((delivery) => (
                <article key={delivery.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800" title={delivery.order?.id || delivery.id}>
                        #{(delivery.order?.id || delivery.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {delivery.order?.orderDate
                          ? dateFormat.format(new Date(delivery.order.orderDate))
                          : "Date de commande indisponible"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {delivery.order ? money(delivery.order.totalAmount) : "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Commande : {delivery.order?.status || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-medium ${
                        delivery.completed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {delivery.completed ? "Livraison terminée" : delivery.status}
                    </span>
                    {delivery.assignedAt && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                        Assignée le {dateFormat.format(new Date(delivery.assignedAt))}
                      </span>
                    )}
                    {delivery.deliveredAt && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                        Terminée le {dateFormat.format(new Date(delivery.deliveredAt))}
                      </span>
                    )}
                  </div>
                  {(delivery.deliveryAddress || delivery.order?.deliveryAddress) && (
                    <p className="mt-2 text-xs text-slate-400">
                      {delivery.deliveryAddress || delivery.order.deliveryAddress}
                    </p>
                  )}
                  {delivery.deliveryNotes && (
                    <p className="mt-2 text-sm text-slate-600">{delivery.deliveryNotes}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {confirm === "delete" ? "Supprimer ce livreur ?" : "Désactiver ce compte ?"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {confirm === "delete"
                ? `${fullName(livreur)} sera retiré. Cette action est possible uniquement parce qu'aucune livraison n'est liée à ce compte.`
                : `${fullName(livreur)} ne pourra plus se connecter tant que le compte reste inactif.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm("")}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirm === "delete" ? handleDelete : handleStatus}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                  confirm === "delete" ? "bg-rose-600" : "bg-[#1f9d55]"
                }`}
              >
                {confirm === "delete" ? "Supprimer" : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLivreurDetail;
