import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Container from "../components/container.jsx";
import Header from "../components/header";
import Footer from "../components/footer.jsx";
import ProductFilters from "../components/ProductFilters";
import ProductCard from "../components/ProductCard";
function Home() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedUsageTypes, setSelectedUsageTypes] = useState([]);

    const { i18n, t } = useTranslation();
    const isArabic = i18n.language === "ar";

    useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);

        const data = await response.json();

        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

const filteredProducts = products.filter((product) => {
  const productName = isArabic
    ? product.name_ar
    : product.name_en;

  const matchesSearch = productName
    ?.toLowerCase()
    .includes(search.toLowerCase());

  const matchesSkin =
    selectedSkinTypes.length === 0 ||
    selectedSkinTypes.some((skin) =>
      product.skin_types?.includes(skin)
    );

  const matchesUsage =
    selectedUsageTypes.length === 0 ||
    selectedUsageTypes.some((usage) =>
      product.usage_types?.includes(usage)
    );

  return matchesSearch && matchesSkin && matchesUsage;
});
  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="flex min-h-screen flex-col">
      <Header />
      <ProductFilters
        search={search}
        setSearch={setSearch}
        selectedSkinTypes={selectedSkinTypes}
        setSelectedSkinTypes={setSelectedSkinTypes}
        selectedUsageTypes={selectedUsageTypes}
        setSelectedUsageTypes={setSelectedUsageTypes}
      />
      <Container className="mt-6 w-full flex-1 sm:mt-8">
        {filteredProducts.length > 0 && (
          <section className="pb-6 pt-7 sm:pb-10 sm:pt-12">
                <div className="mb-3 flex items-center gap-3 sm:gap-4">
                <span className="text-xs font-medium tracking-[0.2em] text-[#365747] sm:text-[13px] sm:tracking-[4px]">
                    {t("productsSection.label")}
                </span>

                <span className="h-px w-10 bg-[#365747]/30 sm:w-14" />
                </div>

                <h1 className="font-serif text-3xl leading-[1.1] text-[#173d2b] sm:text-5xl lg:text-[52px]">
                {t("productsSection.title")}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#365747] sm:mt-4 sm:text-lg sm:leading-7">
                {t("productsSection.description")}
                </p>
          </section>
        )}
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
                <ProductCard
                key={product.id}
                product={product}
                />
            ))
            ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <h3 className="font-serif text-2xl text-[#173d2b]">
                {t("productsSection.emptyTitle")}
                </h3>

                <p className="mt-2 text-sm text-[#737a72]">
                {t("productsSection.emptyDescription")}
                </p>
            </div>
            )}
        </div>
      </Container>
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default Home;