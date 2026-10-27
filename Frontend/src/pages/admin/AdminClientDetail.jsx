import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  deleteClient,
  fetchClient,
  fetchClients,
  updateClient,
  updateClientStatus,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const numberFormat = new Intl.NumberFormat("fr-FR");
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const money = (value) => `${numberFormat.format(value || 0)} MAD`;

const fullName = (client) =>
  `${client?.firstName || ""} ${client?.lastName || ""}`.trim() || "Client";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [client, setClient] = useState(null);
  const [clientCount, setClientCount] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    setError("");

    return fetchClient(id)
      .then((result) => {
        setClient(result.client);
        setForm({
          firstName: result.client.firstName || "",
          lastName: result.client.lastName || "",
          email: result.client.email || "",
          phone: result.client.phone || "",
          address: result.client.address || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    fetchClient(id)
      .then((result) => {
        if (!active) return;
        setClient(result.client);
        setForm({
          firstName: result.client.firstName || "",
          lastName: result.client.lastName || "",
          email: result.client.email || "",
          phone: result.client.phone || "",
          address: result.client.address || "",
        });
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

  useEffect(() => {
    let active = true;

    fetchClients({ page: 1, pageSize: 10 })
      .then((result) => {
        if (active) setClientCount(result.summary?.total || 0);
      })
      .catch(() => {
        if (active) setClientCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateClient(id, form);
      setEditing(false);
      setNotice("Informations enregistrées.");
      await load();
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
      await updateClientStatus(id, !client.isActive);
      setConfirm("");
      setNotice(client.isActive ? "Compte désactivé." : "Compte activé.");
      await load();
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
      await deleteClient(id);
      navigate("/admin/clients", { state: { notice: "Client supprimé." } });
    } catch (err) {
      setError(err.message);
      setConfirm("");
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
      section="Fiche client"
      badges={{ clients: clientCount }}
    >
      <Link to="/admin/clients" className="text-sm font-medium text-[#1f9d55]">
        Retour aux clients
      </Link>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>
      )}

      {loading && <p className="mt-8 text-sm text-slate-400">Chargement de la fiche…</p>}

      {!loading && client && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{fullName(client)}</h1>
              <p className="mt-1 text-sm text-slate-400">{client.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    client.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {client.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {client.emailVerified ? "E-mail vérifié" : "E-mail non vérifié"}
                </span>
                {client.isRecent && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Nouveau
                  </span>
                )}
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
                onClick={() => (client.isActive ? setConfirm("status") : handleStatus())}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                {client.isActive ? "Désactiver" : "Activer"}
              </button>
              {client.orderCount === 0 ? (
                <button
                  type="button"
                  onClick={() => setConfirm("delete")}
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600"
                >
                  Supprimer
                </button>
              ) : (
                <p className="max-w-xs text-xs text-slate-400">
                  Suppression indisponible : ce client a des commandes à conserver.
                </p>
              )}
            </div>
          </div>

          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Commandes</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {numberFormat.format(client.orderCount)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Montant dépensé</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{money(client.totalSpent)}</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs text-slate-400">Inscrit le</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {dateFormat.format(new Date(client.createdAt))}
              </p>
            </article>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
            {!editing && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info label="Identifiant" value={client.id} />
                <Info label="Nom complet" value={fullName(client)} />
                <Info label="E-mail" value={client.email} />
                <Info label="Téléphone" value={client.phone} />
                <Info label="Adresse" value={client.address} />
                <Info label="Statut du compte" value={client.isActive ? "Actif" : "Inactif"} />
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
                  L'adresse e-mail sert aussi à la connexion. Le mot de passe n'est pas modifiable ici.
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

          <section id="commandes" className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">Historique des commandes</h2>
            <p className="mt-1 text-xs text-slate-400">
              Produits, quantités, montants et statuts enregistrés pour ce client.
            </p>
            {client.orders.length === 0 && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                Aucune commande enregistrée.
              </p>
            )}
            <div className="mt-4 space-y-3">
              {client.orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800" title={order.id}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {dateFormat.format(new Date(order.orderDate))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{money(order.totalAmount)}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.status}</p>
                    </div>
                  </div>
                  {order.deliveryAddress && (
                    <p className="mt-2 text-xs text-slate-400">{order.deliveryAddress}</p>
                  )}
                  <ul className="mt-3 divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span>
                          <span className="text-slate-800">{item.productName}</span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {item.quantity} × {money(item.unitPrice)}
                          </span>
                        </span>
                        <span className="font-medium text-slate-700">{money(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
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
              {confirm === "delete" ? "Supprimer ce client ?" : "Désactiver ce compte ?"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {confirm === "delete"
                ? `${fullName(client)} sera retiré. Cette action est possible uniquement parce qu'aucune commande n'est liée à ce compte.`
                : `${fullName(client)} ne pourra plus se connecter tant que le compte reste inactif.`}
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

export default AdminClientDetail;
