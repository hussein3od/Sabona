import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import Footer from "../components/footer";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const isArabic = i18n.language === "ar";

  const [product, setProduct] = useState(null);
  const [loadedProductId, setLoadedProductId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || t("productDetails.notFound")
          );
        }

        setProduct(data.product || data);
      } catch (error) {
        console.error("Product details error:", error);
      } finally {
        setLoadedProductId(id);
      }
    };

    fetchProduct();
  }, [id, t]);

  const loading = String(loadedProductId) !== String(id);

  const addToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      setMessage("");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || t("productDetails.failedToAdd"));
        return;
      }

      setMessage(t("productDetails.addedToCart"));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Add to cart error:", error);

      setMessage(t("productDetails.somethingWentWrong"));
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    if (!product) return;

    if (quantity < Number(product.stock)) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#737a72]">
            {t("productDetails.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="px-4 text-center font-serif text-2xl text-[#173d2b] sm:text-3xl">
            {t("productDetails.notFound")}
          </h1>

          <Link
            to="/home"
            className="mt-6 rounded-full bg-[#173d2b] px-7 py-3 text-sm text-white"
          >
            {t("productDetails.backToShop")}
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  const productName = isArabic
    ? product.name_ar
    : product.name_en;

  const description = isArabic
    ? product.description_ar
    : product.description_en;

  const ingredients = isArabic
    ? product.ingredients_ar
    : product.ingredients_en;

  const usage = isArabic
    ? product.usage_ar
    : product.usage_en;

  const benefits = isArabic
    ? product.benefits_ar
    : product.benefits_en;

  const warnings = isArabic
    ? product.warnings_ar
    : product.warnings_en;

const images = [
  ...new Set(
    (
      product.images?.length > 0
        ? product.images
        : product.image_url
        ? [product.image_url]
        : []
    )
      .map((img) =>
        typeof img === "string" ? img : img.image_url || img.url
      )
      .filter(Boolean)
  ),
];

  const currentImage = images[selectedImage];

  const outOfStock = Number(product.stock) <= 0;

  return (
    <div className="min-h-screen bg-[#faf9f2]">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* BACK */}

        <Link
          to="/home"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#737a72] transition hover:text-[#173d2b]"
        >
          {isArabic ? (
            <ArrowRight size={17} strokeWidth={1.5} />
          ) : (
            <ArrowLeft size={17} strokeWidth={1.5} />
          )}

          {t("productDetails.backToShop")}
        </Link>

        {/* PRODUCT */}

        <section className="grid min-w-0 gap-6 sm:gap-10 lg:grid-cols-2">
          {/* IMAGES */}

          <div>
            <div className="mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl bg-[#ebe9df]">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#7b8179]">
                  {t("productDetails.noImage")}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === index
                        ? "border-[#173d2b]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATION */}

          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
              {t("productDetails.category")}
            </p>

            <h1 className="mt-3 break-words font-serif text-3xl leading-tight text-[#173d2b] sm:text-4xl lg:text-5xl">
              {productName}
            </h1>

            <p className="mt-5 text-2xl font-medium text-[#173d2b]">
              ${Number(product.price).toFixed(2)}
            </p>

            <div className="my-7 h-px w-full bg-black/10" />

            {/* DESCRIPTION */}

            {description && (
              <div>
                <h2 className="text-sm font-medium text-[#173d2b]">
                  {t("productDetails.description")}
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#737a72]">
                  {description}
                </p>
              </div>
            )}

            {/* STOCK */}

            <div className="mt-6 flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  outOfStock
                    ? "bg-red-500"
                    : "bg-green-600"
                }`}
              />

              <span className="text-[#737a72]">
                {outOfStock
                  ? t("productDetails.outOfStock")
                  : t("productDetails.stockAvailable", {
                      count: product.stock,
                    })}
              </span>
            </div>

            {/* QUANTITY + CART */}

            {!outOfStock && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-medium text-[#173d2b]">
                  {t("productDetails.quantity")}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-full border border-black/10 bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="flex h-11 w-11 items-center justify-center text-[#173d2b] transition hover:bg-[#f0f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus
                        size={16}
                        strokeWidth={1.7}
                      />
                    </button>

                    <span className="w-10 text-center text-sm font-medium text-[#173d2b]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= Number(product.stock)
                      }
                      className="flex h-11 w-11 items-center justify-center text-[#173d2b] transition hover:bg-[#f0f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus
                        size={16}
                        strokeWidth={1.7}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={addingToCart}
                    className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#173d2b] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#102d20] disabled:cursor-not-allowed disabled:opacity-60 sm:px-7"
                  >
                    <ShoppingCart
                      size={18}
                      strokeWidth={1.6}
                    />

                    {addingToCart
                      ? t("productDetails.adding")
                      : t("productDetails.addToCart")}
                  </button>
                </div>

                {message && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#315c46]">
                    <Check
                      size={17}
                      strokeWidth={1.7}
                    />

                    <span>{message}</span>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT META */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.usage_types?.length > 0 && (
                <div className="rounded-xl bg-[#f0f1e9] p-4">
                  <p className="text-xs text-[#7b8179]">
                    {t("productDetails.use")}
                  </p>

                  <p className="mt-2 text-sm text-[#173d2b]">
                    {product.usage_types
                      .map((type) => {
                        const labels = {
                          face: t("productDetails.usageTypes.face"),
                          body: t("productDetails.usageTypes.body"),
                          hair: t("productDetails.usageTypes.hair"),
                        };

                        return labels[type] || type;
                      })
                      .join(" • ")}
                  </p>
                </div>
              )}

              {product.skin_types?.length > 0 && (
                <div className="rounded-xl bg-[#f0f1e9] p-4">
                  <p className="text-xs text-[#7b8179]">
                    {t("productDetails.skinType")}
                  </p>

                  <p className="mt-2 text-sm text-[#173d2b]">
                    {product.skin_types
                      .map((type) => {
                        const labels = {
                          oily: t("productDetails.skinTypes.oily"),
                          dry: t("productDetails.skinTypes.dry"),
                          normal: t("productDetails.skinTypes.normal"),
                          sensitive: t("productDetails.skinTypes.sensitive"),
                        };

                        return labels[type] || type;
                      })
                      .join(" • ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EXTRA INFORMATION */}

        <section className="mt-10 grid gap-4 border-t border-black/10 pt-7 sm:mt-16 sm:gap-6 sm:pt-10 md:grid-cols-2">
          {ingredients && (
            <div className="rounded-2xl bg-white p-4 sm:p-6">
              <h2 className="font-serif text-2xl text-[#173d2b]">
                {t("productDetails.ingredients")}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#737a72]">
                {ingredients}
              </p>
            </div>
          )}

          {usage && (
            <div className="rounded-2xl bg-white p-4 sm:p-6">
              <h2 className="font-serif text-2xl text-[#173d2b]">
                {t("productDetails.howToUse")}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#737a72]">
                {usage}
              </p>
            </div>
          )}

          {benefits && (
            <div className="rounded-2xl bg-white p-4 sm:p-6">
              <h2 className="font-serif text-2xl text-[#173d2b]">
                {t("productDetails.benefits")}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#737a72]">
                {benefits}
              </p>
            </div>
          )}

          {warnings && (
            <div className="rounded-2xl bg-white p-4 sm:p-6">
              <h2 className="font-serif text-2xl text-[#173d2b]">
                {t("productDetails.warnings")}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#737a72]">
                {warnings}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;