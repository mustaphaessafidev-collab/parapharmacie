import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ProductImage, money } from "../../components/client/catalog";
import { fetchCart, removeCartItem, updateCartItem } from "../../services/clientService";

function ClientCart() {
  const { refreshCart } = useOutletContext();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = () => {
    setLoading(true);
    fetchCart()
      .then(async (result) => {
        setCart(result.cart);
        await refreshCart();
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeQty = async (item, quantity) => {
    setBusyId(item.productId);
    setError("");
    try {
      const result = await updateCartItem(item.productId, quantity);
      setCart(result.cart);
      await refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item) => {
    setBusyId(item.productId);
    setError("");
    try {
      const result = await removeCartItem(item.productId);
      setCart(result.cart);
      await refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Chargement du panier…</p>;

  const ready = cart?.items?.length > 0 && cart.items.every((item) => item.available);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold">Panier</h1>
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {!cart?.items?.length ? (
        <div className="mt-6 border border-neutral-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Votre panier est vide.</p>
          <Link to="/client/produits" className="mt-4 inline-flex rounded-full bg-[#159447] px-5 py-2.5 text-sm font-semibold text-white">
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <article key={item.id} className="flex gap-3 border border-neutral-200 bg-white p-3">
                <ProductImage src={item.imageUrl} name={item.name} className="h-20 w-20 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Link to={`/client/produits/${item.productId}`} className="font-bold hover:text-[#159447]">
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500">{item.category}</p>
                  <p className="mt-1 text-sm font-semibold text-[#159447]">{money(item.price)}</p>
                  {!item.available && (
                    <p className="text-xs text-rose-600">Cet article n'est plus disponible dans cette quantité.</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" disabled={busyId === item.productId || item.quantity <= 1} onClick={() => changeQty(item, item.quantity - 1)} className="h-8 w-8 rounded-full border">-</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button type="button" disabled={busyId === item.productId} onClick={() => changeQty(item, item.quantity + 1)} className="h-8 w-8 rounded-full border">+</button>
                    <button type="button" onClick={() => remove(item)} className="ml-2 text-xs font-semibold text-slate-500">Retirer</button>
                  </div>
                </div>
                <p className="text-sm font-bold">{money(item.lineTotal)}</p>
              </article>
            ))}
          </div>
          <aside className="h-fit border border-neutral-200 bg-white p-5">
            <p className="flex justify-between text-sm"><span>Sous-total</span><span>{money(cart.subtotal)}</span></p>
            <p className="mt-2 flex justify-between text-sm"><span>Livraison</span><span>Offerte</span></p>
            <p className="mt-4 flex justify-between text-lg font-extrabold"><span>Total</span><span>{money(cart.total)}</span></p>
            <p className="mt-2 text-xs text-slate-400">Aucun frais de livraison n'est configuré. Le paiement se fait à la livraison.</p>
            <Link
              to="/client/commander"
              aria-disabled={!ready}
              className={`mt-4 flex h-11 items-center justify-center text-sm font-medium text-white ${ready ? "bg-[#0e7a45] hover:bg-[#0c693b]" : "pointer-events-none bg-neutral-300"}`}
            >
              Commander
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default ClientCart;
