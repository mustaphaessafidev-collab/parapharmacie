import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LivreurLayout from "../../components/livreur/LivreurLayout";
import { OrderStatusBadge, orderMoney } from "../../components/orders/OrderProgress";
import { fetchDeliveries } from "../../services/livreurService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const buckets = [
  { id: "waiting", label: "À livrer" },
  { id: "progress", label: "En cours" },
  { id: "done", label: "Terminées" },
  { id: "all", label: "Toutes" },
];

function LivreurOrders() {
  const [bucket, setBucket] = useState("waiting");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchDeliveries(bucket)
      .then((result) => {
        if (active) setData(result);
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
  }, [bucket]);

  useEffect(() => {
    const refresh = () => {
      fetchDeliveries(bucket)
        .then(setData)
        .catch((err) => setError(err.message));
    };
    window.addEventListener("atlaspara-deliveries", refresh);
    return () => window.removeEventListener("atlaspara-deliveries", refresh);
  }, [bucket]);

  const orders = data?.orders || [];
  const summary = data?.summary;

  return (
    <LivreurLayout section="Mes livraisons">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Mes livraisons</h1>
      <p className="mt-1 text-sm text-slate-400">Seules les commandes qui vous sont assignées apparaissent ici.</p>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {buckets.map((item) => {
          const count =
            item.id === "waiting"
              ? summary?.waiting
              : item.id === "progress"
                ? summary?.progress
                : item.id === "done"
                  ? summary?.done
                  : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setBucket(item.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                bucket === item.id ? "bg-[#1f9d55] text-white" : "bg-white text-slate-500"
              }`}
            >
              {item.label}
              {count != null ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Chargement des livraisons…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white px-4 py-12 text-center text-sm text-slate-400">
          Aucune livraison dans cette liste.
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/livreur/livraisons/${order.id}`}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">Commande {order.reference}</p>
                  <p className="text-xs text-slate-400">{dateFormat.format(new Date(order.orderDate))}</p>
                </div>
                <OrderStatusBadge status={order.status} label={order.statusLabel} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {order.client?.firstName} {order.client?.lastName} · {order.phone || "Téléphone non renseigné"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{order.deliveryAddress}</p>
              <p className="mt-2 font-semibold text-slate-900">{orderMoney(order.totalAmount)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
    </LivreurLayout>
  );
}

export default LivreurOrders;
