import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { money } from "../../components/client/catalog";
import { fetchCart, fetchProfile, placeOrder } from "../../services/clientService";
import { playSound, primeSound, releasePrimed, SOUNDS } from "../../services/sounds";

function ClientCheckout() {
  const navigate = useNavigate();
  const { refreshCart } = useOutletContext();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({
    city: "",
    addressLine: "",
    addressDetails: "",
    phone: "",
    saveToProfile: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCart(), fetchProfile()])
      .then(([cartResult, profileResult]) => {
        if (!active) return;
        setCart(cartResult.cart);
        const profile = profileResult.profile;
        setForm((current) => ({
          ...current,
          city: profile.city || "",
          addressLine: profile.addressLine || "",
          addressDetails: profile.addressDetails || "",
          phone: profile.phone || "",
        }));
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

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    primeSound(SOUNDS.orderSuccess);
    try {
      const result = await placeOrder(form);
      if (result.created) await playSound(SOUNDS.orderSuccess);
      else releasePrimed();
      await refreshCart();
      navigate(`/client/commandes/${result.order.id}`, {
        state: {
          notice: `Commande ${result.order.reference} enregistrée. Elle est en attente de validation.`,
        },
      });
    } catch (err) {
      releasePrimed();
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Préparation de la commande…</p>;
  if (!cart?.items?.length) {
    return (
      <div className="border border-neutral-200 bg-white px-4 py-12 text-center">
        <p className="text-sm text-slate-500">Votre panier est vide.</p>
        <Link to="/client/produits" className="mt-4 inline-flex text-sm font-semibold text-[#159447]">
          Retour aux produits
        </Link>
      </div>
    );
  }

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="border border-neutral-200 bg-white p-5">
        <h1 className="text-2xl font-extrabold">Livraison</h1>
        <p className="mt-2 text-sm text-slate-500">
          Le paiement en ligne n'est pas activé. Vous réglerez à la livraison, en espèces ou par TPE.
        </p>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            Adresse
            <input required value={form.addressLine} onChange={set("addressLine")} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="text-sm">
            Complément
            <input value={form.addressDetails} onChange={set("addressDetails")} placeholder="Immeuble, étage, appartement" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="text-sm">
            Ville
            <input required value={form.city} onChange={set("city")} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="text-sm sm:col-span-2">
            Téléphone
            <input required value={form.phone} onChange={set("phone")} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3" />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.saveToProfile} onChange={set("saveToProfile")} />
            Enregistrer ces informations dans mon profil
          </label>
        </div>
      </div>
      <aside className="h-fit border border-neutral-200 bg-white p-5">
        <h2 className="font-bold">Récapitulatif</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.name} × {item.quantity}</span>
              <span>{money(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-sm"><span>Livraison</span><span>Offerte</span></p>
        <p className="mt-2 flex justify-between font-extrabold"><span>Total</span><span>{money(cart.total)}</span></p>
        <p className="mt-3 text-xs text-slate-400">Paiement à la livraison. Aucun paiement en ligne n'est encaissé.</p>
        <button
          type="submit"
          disabled={submitting || cart.items.some((item) => !item.available)}
          className="mt-4 h-11 w-full bg-[#0e7a45] text-sm font-medium text-white hover:bg-[#0c693b] disabled:opacity-50"
        >
          {submitting ? "Confirmation…" : "Confirmer la commande"}
        </button>
      </aside>
    </form>
  );
}

export default ClientCheckout;
