import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LivreurLayout from "../../components/livreur/LivreurLayout";
import { OrderStatusBadge, OrderTimeline, orderMoney } from "../../components/orders/OrderProgress";
import { completeDelivery, failDelivery, fetchDelivery, startDelivery } from "../../services/livreurService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function LivreurOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    let active = true;
    fetchDelivery(id)
      .then((result) => {
        if (active) setOrder(result.order);
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

  const run = async (action, success) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      setOrder(result.order);
      setNotice(success);
      setConfirm(null);
      setReason("");
    } catch (err) {
      setError(err.message);
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LivreurLayout section="Détail">
      <Link to="/livreur" className="text-sm font-medium text-[#1f9d55]">
        Mes livraisons
      </Link>
      {loading && <p className="mt-4 text-sm text-slate-500">Chargement de la livraison…</p>}
      {!loading && !order && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Commande introuvable"}</p>
      )}
      {order && (
        <div className="mx-auto mt-3 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Commande {order.reference}</h1>
              <p className="mt-1 text-sm text-slate-400">{dateFormat.format(new Date(order.orderDate))}</p>
            </div>
            <OrderStatusBadge status={order.status} label={order.statusLabel} />
          </div>
          <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5">
            <OrderTimeline progress={order.progress} />
          </section>
          {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5">
            <h2 className="text-base font-semibold">Client</h2>
            <p className="mt-2 text-sm">
              {order.client?.firstName} {order.client?.lastName}
            </p>
            <p className="mt-1 text-sm text-slate-600">{order.phone || "Téléphone non renseigné"}</p>
            <p className="mt-1 text-sm text-slate-600">{order.deliveryAddress}</p>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-5">
            <h2 className="text-base font-semibold">Produits</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {item.name}
                    <span className="mt-0.5 block text-xs text-slate-400">Quantité {item.quantity}</span>
                  </span>
                  <span>{orderMoney(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-lg font-semibold">Total {orderMoney(order.totalAmount)}</p>
            <p className="mt-1 text-right text-xs text-slate-400">
              {order.payment?.paid ? "Paiement encaissé à la livraison" : "À encaisser à la livraison"}
            </p>
          </section>

          {order.failureReason && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Motif : {order.failureReason}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {order.actions?.canStart && (
              <button type="button" onClick={() => setConfirm("start")} className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white">
                Démarrer la livraison
              </button>
            )}
            {order.actions?.canDeliver && (
              <button type="button" onClick={() => setConfirm("deliver")} className="rounded-full bg-[#1f9d55] px-4 py-2 text-sm font-medium text-white">
                Marquer comme livrée
              </button>
            )}
            {order.actions?.canFail && (
              <button type="button" onClick={() => setConfirm("fail")} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                Signaler un échec
              </button>
            )}
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {confirm === "start" && "Prendre en charge cette livraison ?"}
              {confirm === "deliver" && "Confirmer la remise au client ?"}
              {confirm === "fail" && "Signaler un échec de livraison ?"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {confirm === "start" && "La commande passera en cours de livraison."}
              {confirm === "deliver" && "Le paiement à la livraison sera marqué comme encaissé."}
              {confirm === "fail" && "L'administrateur pourra ensuite réassigner la commande."}
            </p>
            {confirm === "fail" && (
              <label className="mt-4 block text-sm text-slate-600">
                Motif
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirm(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
                Fermer
              </button>
              <button
                type="button"
                disabled={busy || (confirm === "fail" && reason.trim().length < 5)}
                onClick={() => {
                  if (confirm === "start") run(() => startDelivery(id), "Livraison démarrée.");
                  if (confirm === "deliver") run(() => completeDelivery(id), "Commande marquée comme livrée.");
                  if (confirm === "fail") run(() => failDelivery(id, reason), "Échec de livraison enregistré.");
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  confirm === "fail" ? "bg-rose-600" : "bg-[#1f9d55]"
                }`}
              >
                {busy ? "Enregistrement…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LivreurLayout>
  );
}

export default LivreurOrderDetail;
