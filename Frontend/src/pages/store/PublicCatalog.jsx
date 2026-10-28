import ProductBrowser from "../../components/store/ProductBrowser";
import StoreFooter from "../../components/store/StoreFooter";
import StoreHeader from "../../components/store/StoreHeader";

function PublicCatalog() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <StoreHeader />
      <main>
        <ProductBrowser />
      </main>
      <StoreFooter />
    </div>
  );
}

export default PublicCatalog;
