import { useState } from "react";
import { Link } from "react-router-dom";

export const money = (value) =>
  `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)} MAD`;

export function ProductImage({ src, name, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={`flex items-center justify-center bg-neutral-100 font-semibold text-neutral-400 ${className}`}>
        {(name || "P").slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return <img src={src} alt="" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export function ProductCard({ product }) {
  const available = product.isActive && product.stockQuantity > 0;

  return (
    <article className="flex h-full flex-col border border-neutral-200 bg-white">
      <Link to={`/client/produits/${product.id}`} className="bg-neutral-100">
        <ProductImage src={product.imageUrl} name={product.name} className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] tracking-wide text-neutral-500 uppercase">
          {product.category?.name || "Parapharmacie"}
        </p>
        <Link to={`/client/produits/${product.id}`} className="mt-1 line-clamp-2 text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <p className="mt-3 text-base font-semibold">{money(product.price)}</p>
        <p className={`mt-1 text-xs ${available ? "text-neutral-500" : "text-rose-700"}`}>
          {available ? "En stock" : "Rupture de stock"}
        </p>
        <Link to={`/client/produits/${product.id}`} className="mt-3 inline-flex h-9 items-center justify-center border border-neutral-950 text-xs font-medium hover:bg-neutral-950 hover:text-white">
          Voir le produit
        </Link>
      </div>
    </article>
  );
}

export function StatusBadge({ status, label }) {
  const tones = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    PREPARING: "bg-sky-50 text-sky-700",
    ASSIGNED: "bg-indigo-50 text-indigo-700",
    OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700",
    DELIVERED: "bg-emerald-50 text-emerald-800",
    CANCELLED: "bg-slate-100 text-slate-500",
    REJECTED: "bg-rose-50 text-rose-700",
    DELIVERY_FAILED: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] || "bg-slate-100 text-slate-600"}`}>
      {label || status}
    </span>
  );
}

export function Notice({ error, message }) {
  if (!error && !message) return null;
  return (
    <p className={`rounded-2xl px-4 py-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>
      {error || message}
    </p>
  );
}
