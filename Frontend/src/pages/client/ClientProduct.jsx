import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ProductImage, money } from "../../components/client/catalog";
import { addCartItem, fetchProduct } from "../../services/clientService";

function ClientProduct() {
  const { id } = useParams();
  const { refreshCart } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProduct(id)
      .then((result) => {
        if (active) setProduct(result.product);
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

  const add = async () => {
    setAdding(true);
    setError("");
    setNotice("");
    try {
      await addCartItem(product.id, quantity);
      await refreshCart();
      setNotice("Produit ajouté au panier.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Chargement du produit…</p>;
  if (!product) return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Produit introuvable"}</p>;

  const available = product.isActive && product.stockQuantity > 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <ProductImage src={product.imageUrl} name={product.name} className="aspect-square w-full bg-neutral-100" />
      <div>
        <Link to="/client/produits" className="text-sm font-semibold text-[#159447]">
          Retour aux produits
        </Link>
        <p className="mt-3 text-xs font-semibold tracking-wide text-slate-400">
          {product.category?.name || "Sans catégorie"}
          {product.brand?.name ? ` · ${product.brand.name}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{product.name}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          {product.description || "Aucune description n'est renseignée pour ce produit."}
        </p>
        <p className="mt-5 text-3xl font-extrabold text-[#159447]">{money(product.price)}</p>
        <p className={`mt-1 text-sm ${available ? "text-slate-500" : "text-rose-600"}`}>
          {available ? `${product.stockQuantity} en stock` : "Rupture de stock"}
        </p>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min="1"
            max={Math.min(99, product.stockQuantity || 1)}
            value={quantity}
            disabled={!available}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="h-11 w-20 rounded-full border border-slate-200 px-3 text-center"
          />
          <button
            type="button"
            disabled={!available || adding}
            onClick={add}
            className="h-11 rounded-full bg-[#159447] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {adding ? "Ajout…" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientProduct;
