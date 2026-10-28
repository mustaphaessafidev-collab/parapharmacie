import { Link, useNavigate } from "react-router-dom";
import { ProductImage, money } from "../client/catalog";
import { getSession, pathForRole, rememberReturn } from "../../services/authService";
import { addCartItem } from "../../services/clientService";

function ProductCard({ product, onNotice, onError }) {
  const navigate = useNavigate();
  const available = product.isActive && product.stockQuantity > 0;
  const href = `/produits/${product.id}`;

  const add = async (event) => {
    event.preventDefault();
    const session = getSession();
    if (!session?.user) {
      rememberReturn(href);
      navigate(`/login?reason=order&next=${encodeURIComponent(href)}`);
      return;
    }
    if (session.user.role !== "CLIENT") {
      onError?.("Un compte client est nécessaire pour commander.");
      navigate(pathForRole(session.user.role));
      return;
    }
    try {
      await addCartItem(product.id, 1);
      onNotice?.(`${product.name} a été ajouté au panier.`);
    } catch (err) {
      if (/authentification|session/i.test(err.message)) {
        rememberReturn(href);
        navigate(`/login?reason=order&next=${encodeURIComponent(href)}`);
        return;
      }
      onError?.(err.message);
    }
  };

  return (
    <article className="group flex h-full flex-col border border-neutral-200 bg-white transition hover:border-neutral-950">
      <Link to={href} className="block bg-neutral-100">
        <ProductImage src={product.imageUrl} name={product.name} className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] tracking-wide text-neutral-500 uppercase">
          {product.brand?.name || product.category?.name || "Parapharmacie"}
        </p>
        <Link to={href} className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-medium text-neutral-950 hover:underline">
          {product.name}
        </Link>
        <p className="mt-3 text-base font-semibold text-neutral-950">{money(product.price)}</p>
        <p className={`mt-1 text-xs ${available ? "text-neutral-500" : "text-rose-700"}`}>
          {available ? "En stock" : "Rupture de stock"}
        </p>
        <button
          type="button"
          disabled={!available}
          onClick={add}
          className="mt-3 h-9 border border-neutral-950 text-xs font-medium text-neutral-950 hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
        >
          Ajouter au panier
        </button>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse border border-neutral-200">
      <div className="aspect-square bg-neutral-100" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 bg-neutral-100" />
        <div className="h-4 w-4/5 bg-neutral-100" />
        <div className="h-4 w-1/2 bg-neutral-100" />
      </div>
    </div>
  );
}

export default ProductCard;
