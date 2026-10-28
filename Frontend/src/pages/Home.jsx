import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryImage } from "../components/store/categoryVisual";
import ProductCard, { ProductSkeleton } from "../components/store/ProductCard";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { fetchCatalog, fetchCategories } from "../services/clientService";

function Shelf({ title, subtitle, to, products, loading }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <Link to={to} className="shrink-0 text-sm font-medium text-[#0e7a45] hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }, (_, index) => <ProductSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {!loading && products.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">Aucun produit à afficher pour le moment.</p>
      )}
    </section>
  );
}

function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCategories(),
      fetchCatalog({ featured: "true", page: 1, pageSize: 8, sort: "name", order: "asc" }),
      fetchCatalog({ page: 1, pageSize: 8, sort: "created", order: "desc" }),
      fetchCatalog({ page: 1, pageSize: 8, sort: "popular", order: "desc" }),
    ])
      .then(([categoryResult, featuredResult, newestResult, popularResult]) => {
        if (!active) return;
        setCategories(categoryResult.categories || []);
        setFeatured(featuredResult.products || []);
        setNewest(newestResult.products || []);
        setPopular((popularResult.products || []).filter((product) => product.orderCount > 0));
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
    <div className="min-h-screen bg-white text-neutral-950">
      <StoreHeader />
      <main>
        <section className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[#0e7a45] uppercase">Parapharmacie</p>
            <h1 className="mt-3 max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              Soins, hygiène et bien-être, livrés chez vous.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-600">
              Parcourez le catalogue sans compte. Les prix sont en dirhams et le stock affiché est celui du magasin. La commande se valide après connexion.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/produits" className="inline-flex h-11 items-center bg-[#0e7a45] px-5 text-sm font-medium text-white hover:bg-[#0c693b]">
                Acheter maintenant
              </Link>
              <a href="#rayons" className="inline-flex h-11 items-center border border-neutral-300 px-5 text-sm font-medium hover:border-neutral-950">
                Voir les catégories
              </a>
            </div>
          </div>
          <div className="bg-neutral-100">
            <img src="/home/hero-shelf.jpg" alt="Produits de soin présentés sur une étagère" className="aspect-[5/4] w-full object-cover" />
          </div>
        </section>

        <section className="border-y border-neutral-200">
          <ul className="mx-auto grid max-w-[1440px] gap-px bg-neutral-200 sm:grid-cols-3">
            {[
              ["Livraison offerte", "Aucun frais de livraison n'est ajouté au panier."],
              ["Paiement à la réception", "Espèces ou TPE, uniquement à la livraison."],
              ["Catalogue public", "La consultation reste ouverte sans compte."],
            ].map(([title, text]) => (
              <li key={title} className="bg-white px-6 py-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {error && (
          <p className="mx-auto mt-6 max-w-[1440px] px-4 text-sm text-rose-700 sm:px-6">{error}</p>
        )}

        <section id="rayons" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-xl font-semibold tracking-tight">Catégories</h2>
            <Link to="/produits" className="text-sm font-medium text-[#0e7a45] hover:underline">
              Tout le catalogue
            </Link>
          </div>
          {loading ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="aspect-[4/5] animate-pulse bg-neutral-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} to={`/produits?categoryId=${category.id}`} className="group border border-neutral-200">
                  <img src={categoryImage(category.name)} alt="" className="aspect-[4/5] w-full object-cover" />
                  <span className="block px-3 py-3">
                    <span className="block text-sm font-medium group-hover:underline">{category.name}</span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {category.productCount} {category.productCount > 1 ? "produits" : "produit"}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Shelf title="En vedette" subtitle="Produits mis en avant dans le catalogue." to="/produits?featured=true" products={featured} loading={loading} />
        {popular.length > 0 && (
          <Shelf title="Les plus commandés" subtitle="Classement selon les quantités déjà commandées." to="/produits?sort=popular&order=desc" products={popular} loading={loading} />
        )}
        <Shelf title="Nouveautés" subtitle="Derniers produits ajoutés au catalogue." to="/produits?sort=created&order=desc" products={newest} loading={loading} />
      </main>
      <StoreFooter />
    </div>
  );
}

export default Home;
