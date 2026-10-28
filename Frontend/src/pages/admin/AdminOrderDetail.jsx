import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import UserAvatar from "../../components/UserAvatar";
import { OrderStatusBadge, OrderTimeline, orderMoney } from "../../components/orders/OrderProgress";
import {
  assignOrder,
  cancelAdminOrder,
  fetchAssignees,
  fetchOrder,
  rejectOrder,
  validateOrder,
} from "../../services/adminService";
import { clearSession, getSession } from "../../services/authService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function ConfirmDialog({ title, text, confirmLabel, danger, reason, onReason, busy, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
        {typeof onReason === "function" && (
          <label className="mt-4 block text-sm text-slate-600">
            Motif
            <textarea
              value={reason}
              onChange={(event) => onReason(event.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
            Fermer
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              danger ? "bg-rose-600" : "bg-[#1f9d55]"
            }`}
          >
            {busy ? "Enregistrement…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [order, setOrder] = useState(null);
  const [livreurs, setLivreurs] = useState([]);
  const [livreurId, setLivreurId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");

  const load = () =>
    fetchOrder(id)
      .then((result) => {
        setOrder(result.order);
        setLivreurId(result.order.livreur?.id || "");
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    let active = true;
    fetchOrder(id)
      .then((result) => {
        if (!active) return;
        setOrder(result.order);
        setLivreurId(result.order.livreur?.id || "");
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    fetchAssignees()
      .then((result) => {
        if (active) setLivreurs(result.livreurs || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);

  const run = async (action) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      setOrder(result.order);
      setLivreurId(result.order.livreur?.id || "");
      setDialog(null);
      setReason("");
      setNotice("La commande a été mise à jour.");
    } catch (err) {
      setError(err.message);
      setDialog(null);
    } finally {
      setBusy(false);
    }
  };

  const layout = (children) => (
    <AdminLayout
      user={session?.user}
      onLogout={() => {
        clearSession();
        navigate("/login");
      }}
      section="Commandes"
    >
      {children}
    </AdminLayout>
  );

  if (loading) return layout(<p className="text-sm text-slate-500">Chargement de la commande…</p>);
  if (!order) return layout(<p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Commande introuvable"}</p>);

  const client = `${order.client?.firstName || ""} ${order.client?.lastName || ""}`.trim();

  return layout(
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/commandes" className="text-sm font-medium text-[#1f9d55]">
        Toutes les commandes
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Commande {order.reference}</h1>
          <p className="mt-1 text-sm text-slate-400">{dateFormat.format(new Date(order.orderDate))}</p>
        </div>
        <OrderStatusBadge status={order.status} label={order.statusLabel} />
      </div>

      <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <OrderTimeline progress={order.progress} />
        {order.statusMessage && <p className="mt-4 text-sm text-slate-600">{order.statusMessage}</p>}
      </section>

      {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-900">Produits</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-medium text-slate-800">{item.name}</span>
                  <span className="text-xs text-slate-400">
                    {item.quantity} × {orderMoney(item.unitPrice)}
                  </span>
                </span>
                <span className="font-medium">{orderMoney(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-lg font-semibold text-slate-900">Total {orderMoney(order.totalAmount)}</p>
          <p className="mt-1 text-right text-xs text-slate-400">
            {order.payment?.label || "Paiement à la livraison"} · {order.payment?.paid ? "Encaissé" : "À encaisser à la livraison"}
          </p>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">Client et livraison</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Client</dt>
                <dd className="flex items-center gap-2">
                  <UserAvatar
                    user={{ ...(order.client || {}), firstName: client || "Client" }}
                    className="h-8 w-8 text-xs"
                  />
                  {client || "Client"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">E-mail</dt>
                <dd>{order.client?.email || "Non renseigné"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Téléphone de livraison</dt>
                <dd>{order.phone || "Non renseigné"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Adresse</dt>
                <dd>{order.deliveryAddress || "Non renseignée"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Livreur</dt>
                <dd>
                  {order.livreur
                    ? `${order.livreur.firstName} ${order.livreur.lastName}`
                    : "Aucun livreur assigné"}
                </dd>
              </div>
            </dl>
            {order.failureReason && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Motif : {order.failureReason}
              </p>
            )}
            {!order.failureReason && order.delivery?.notes && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {order.delivery.notes}
              </p>
            )}
          </section>

          {order.actions?.canAssign && (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-base font-semibold text-slate-900">Assigner un livreur</h2>
              <label className="mt-3 block text-sm text-slate-600">
                Livreur actif
                <select
                  value={livreurId}
                  onChange={(event) => setLivreurId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3"
                >
                  <option value="">Choisir un livreur</option>
                  {livreurs.map((livreur) => (
                    <option key={livreur.id} value={livreur.id}>
                      {livreur.firstName} {livreur.lastName} · {livreur.activeDeliveries} en cours
                    </option>
                  ))}
                </select>
              </label>
              {livreurs.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">Aucun livreur actif n'est disponible.</p>
              )}
              <button
                type="button"
                disabled={!livreurId || busy || (order.status === "ASSIGNED" && livreurId === order.livreur?.id)}
                onClick={() => setDialog("assign")}
                className="mt-3 rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Assigner
              </button>
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            {order.actions?.canValidate && (
              <button type="button" onClick={() => setDialog("validate")} className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white">
                Valider
              </button>
            )}
            {order.actions?.canReject && (
              <button type="button" onClick={() => setDialog("reject")} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                Refuser
              </button>
            )}
            {order.actions?.canCancel && (
              <button type="button" onClick={() => setDialog("cancel")} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
                Annuler
              </button>
            )}
            <button type="button" onClick={load} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {dialog === "validate" && (
        <ConfirmDialog
          title="Valider cette commande ?"
          text="Elle pourra ensuite être assignée à un livreur actif."
          confirmLabel="Valider"
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() => run(() => validateOrder(order.id))}
        />
      )}
      {dialog === "reject" && (
        <ConfirmDialog
          title="Refuser cette commande ?"
          text="Le stock des produits sera rétabli. Le client verra la commande comme refusée."
          confirmLabel="Refuser"
          danger
          reason={reason}
          onReason={setReason}
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() => run(() => rejectOrder(order.id, reason))}
        />
      )}
      {dialog === "cancel" && (
        <ConfirmDialog
          title="Annuler cette commande ?"
          text="Le stock sera rétabli. Une commande déjà en cours de livraison ne peut pas être annulée ici."
          confirmLabel="Annuler la commande"
          danger
          reason={reason}
          onReason={setReason}
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() => run(() => cancelAdminOrder(order.id, reason))}
        />
      )}
      {dialog === "assign" && (
        <ConfirmDialog
          title="Assigner ce livreur ?"
          text="Le livreur verra la commande dans son espace et pourra démarrer la livraison."
          confirmLabel="Assigner"
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() => run(() => assignOrder(order.id, livreurId))}
        />
      )}
    </div>
  );
}

export default AdminOrderDetail;
