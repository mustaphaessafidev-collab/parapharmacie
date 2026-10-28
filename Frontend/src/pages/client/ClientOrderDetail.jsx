import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ProductImage, StatusBadge, money } from "../../components/client/catalog";
import { OrderTimeline } from "../../components/orders/OrderProgress";
import { cancelOrder, fetchOrder } from "../../services/clientService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function ClientOrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    fetchOrder(id)
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

  const cancel = async () => {
    if (!window.confirm("Annuler cette commande en attente ?")) return;
    setCancelling(true);
    setError("");
    try {
      const result = await cancelOrder(id);
      setOrder(result.order);
      setNotice("La commande a été annulée et le stock a été rétabli.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Chargement de la commande…</p>;
  if (!order) return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Commande introuvable"}</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/client/commandes" className="text-sm font-semibold text-[#159447]">
        Toutes mes commandes
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Commande {order.reference}</h1>
        <StatusBadge status={order.status} label={order.statusLabel} />
      </div>
      <p className="mt-2 text-sm text-slate-500">{dateFormat.format(new Date(order.orderDate))}</p>
      {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <section className="mt-6 border border-neutral-200 bg-white p-5">
        <OrderTimeline progress={order.progress} />
        {order.statusMessage && <p className="mt-4 text-sm text-slate-600">{order.statusMessage}</p>}
        {order.livreur && (
          <p className="mt-2 text-sm text-slate-500">
            Livreur : {order.livreur.firstName} {order.livreur.lastName}
          </p>
        )}
      </section>

      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <article key={item.id} className="flex items-center gap-3 border border-neutral-200 bg-white p-3">
            <ProductImage src={item.imageUrl} name={item.name} className="h-16 w-16 rounded-2xl" />
            <div className="flex-1">
              <p className="font-bold">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.quantity} × {money(item.unitPrice)}
              </p>
            </div>
            <p className="font-semibold">{money(item.subtotal)}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 border border-neutral-200 bg-white p-5 text-sm">
        <p><span className="text-slate-500">Adresse : </span>{order.deliveryAddress}</p>
        <p className="mt-2"><span className="text-slate-500">Téléphone : </span>{order.phone || "Non renseigné"}</p>
        <p className="mt-2"><span className="text-slate-500">Livraison : </span>Offerte</p>
        <p className="mt-2"><span className="text-slate-500">Paiement : </span>{order.payment?.label || "Paiement à la livraison"} · {order.payment?.paid ? "Payé" : "À encaisser à la livraison"}</p>
        <p className="mt-4 text-lg font-extrabold">Total {money(order.totalAmount)}</p>
      </div>

      {order.canCancel && (
        <button
          type="button"
          onClick={cancel}
          disabled={cancelling}
          className="mt-4 rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50"
        >
          {cancelling ? "Annulation…" : "Annuler la commande"}
        </button>
      )}
    </div>
  );
}

export default ClientOrderDetail;
