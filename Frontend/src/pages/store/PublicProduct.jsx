import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductImage, money } from "../../components/client/catalog";
import ProductCard from "../../components/store/ProductCard";
import StoreFooter from "../../components/store/StoreFooter";
import StoreHeader from "../../components/store/StoreHeader";
import { getSession, pathForRole, rememberReturn } from "../../services/authService";
import { addCartItem, fetchCatalog, fetchProduct } from "../../services/clientService";

function PublicProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotice("");
    fetchProduct(id)
      .then(async (result) => {
        if (!active) return;
        setProduct(result.product);
        if (result.product?.category?.id) {
          const catalog = await fetchCatalog({
            categoryId: result.product.category.id,
            page: 1,
            pageSize: 8,
            sort: "name",
            order: "asc",
          });
          if (active) {
            setRelated((catalog.products || []).filter((item) => item.id !== result.product.id).slice(0, 5));
          }
        }
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
    setError("");
    setNotice("");
    const next = `/produits/${id}`;
    const session = getSession();
    if (!session?.user) {
      rememberReturn(next);
      navigate(`/login?reason=order&next=${encodeURIComponent(next)}`);
      return;
    }
    if (session.user.role !== "CLIENT") {
      setError("Un compte client est nécessaire pour ajouter un produit au panier.");
      navigate(pathForRole(session.user.role));
      return;
    }
    setAdding(true);
    try {
      await addCartItem(product.id, quantity);
      setNotice("Produit ajouté au panier.");
    } catch (err) {
      if (/authentification|session/i.test(err.message)) {
        rememberReturn(next);
        navigate(`/login?reason=order&next=${encodeURIComponent(next)}`);
        return;
      }
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const available = product?.isActive && product.stockQuantity > 0;

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <StoreHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-950">Accueil</Link>
          <span className="px-2">/</span>
          <Link to="/produits" className="hover:text-neutral-950">Produits</Link>
          {product?.category?.id && (
            <>
              <span className="px-2">/</span>
              <Link to={`/produits?categoryId=${product.category.id}`} className="hover:text-neutral-950">
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        {loading && <p className="mt-8 text-sm text-neutral-500">Chargement du produit…</p>}
        {!loading && !product && (
          <p className="mt-8 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || "Produit introuvable"}</p>
        )}

        {product && (
          <>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div className="bg-neutral-100">
                <ProductImage src={product.imageUrl} name={product.name} className="aspect-square w-full" />
              </div>
              <div>
                <p className="text-xs tracking-wide text-neutral-500 uppercase">
                  {product.brand?.name || "Parapharmacie"}
                  {product.category?.name ? ` · ${product.category.name}` : ""}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
                <p className="mt-5 text-3xl font-semibold">{money(product.price)}</p>
                <p className={`mt-2 text-sm ${available ? "text-neutral-600" : "text-rose-700"}`}>
                  {available ? `${product.stockQuantity} en stock` : "Rupture de stock"}
                </p>
                <p className="mt-5 max-w-xl text-sm leading-7 whitespace-pre-line text-neutral-600">
                  {product.description || "Aucune description n'est renseignée pour ce produit."}
                </p>
                {error && <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                {notice && (
                  <p className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    {notice}{" "}
                    <Link to="/client/panier" className="font-medium underline">Continuer vers le panier</Link>
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <label className="text-sm">
                    Quantité
                    <input
                      type="number"
                      min="1"
                      max={Math.min(99, product.stockQuantity || 1)}
                      value={quantity}
                      disabled={!available}
                      onChange={(event) => setQuantity(Number(event.target.value))}
                      className="mt-1 block h-11 w-20 border border-neutral-300 text-center"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!available || adding}
                    onClick={add}
                    className="mt-6 h-11 bg-[#0e7a45] px-6 text-sm font-medium text-white hover:bg-[#0c693b] disabled:opacity-50"
                  >
                    {adding ? "Ajout…" : "Ajouter au panier"}
                  </button>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="border-b border-neutral-200 pb-3 text-xl font-semibold">Dans la même catégorie</h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {related.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}

export default PublicProduct;
