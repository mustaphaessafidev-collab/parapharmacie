import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge, money } from "../../components/client/catalog";
import { fetchOrders } from "../../services/clientService";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchOrders()
      .then((result) => {
        if (active) setOrders(result.orders || []);
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
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold">Mes commandes</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Chargement des commandes…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-neutral-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Vous n'avez pas encore passé de commande.</p>
          <Link to="/client/produits" className="mt-4 inline-flex text-sm font-semibold text-[#159447]">
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/client/commandes/${order.id}`} className="block border border-neutral-200 bg-white p-4 hover:shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">Commande {order.reference}</p>
                  <p className="text-xs text-slate-500">{dateFormat.format(new Date(order.orderDate))}</p>
                </div>
                <StatusBadge status={order.status} label={order.statusLabel} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s) · {order.deliveryAddress}
              </p>
              <p className="mt-1 text-sm text-slate-600">{order.statusMessage}</p>
              <p className="mt-1 font-extrabold text-[#159447]">{money(order.totalAmount)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientOrders;
