import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  UserRound,
  Heart,
  Package,
  ShoppingCart,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import { apiUrl } from "../api";

function Wishlist() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadWishlist = async () => {
      try {
        // Get wishlist
        const wishlistResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const wishlistData = await wishlistResponse.json();

        if (!wishlistResponse.ok) {
          throw new Error(
            wishlistData.message || t("wishlist.errors.loadWishlist")
          );
        }

        const wishlistIds = wishlistData.wishlist.map(
          (item) => Number(item.product_id)
        );

        // No products in wishlist
        if (wishlistIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Get all products
        const productsResponse = await fetch(
          apiUrl("/api/products")
        );

        const productsData = await productsResponse.json();

        if (!productsResponse.ok) {
          throw new Error(
            productsData.message || t("wishlist.errors.loadProducts")
          );
        }

        // Only wishlist products
        const wishlistProducts =
          productsData.products.filter((product) =>
            wishlistIds.includes(Number(product.id))
          );

        setProducts(wishlistProducts);
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [navigate, t]);

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/wishlist/${productId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("wishlist.errors.removeProduct")
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => Number(product.id) !== Number(productId)
        )
      );
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
    }
  };

  if (loading) {
    return (
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="min-h-screen bg-[#f5f3e9]"
      >
        <Header />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-[#52655c]">
            {t("wishlist.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f5f3e9] text-[#173d2b]"
    >
      <Header />

      <main className="relative overflow-hidden bg-[#f5f3e9] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="relative z-10 mx-auto w-full max-w-[1200px]">

          {/* Page Heading */}
          <div className="mb-8 px-1 sm:mb-12 sm:px-6 lg:px-10">
            <div className="mb-4 flex items-center gap-4">
              <p className="text-[13px] font-medium uppercase tracking-[5px] text-[#173d2b]">
                {t("wishlist.pageLabel")}
              </p>

              <div className="h-[1px] w-[48px] bg-[#718077]" />
            </div>

            <h1 className="font-serif text-3xl leading-tight text-[#173d2b] sm:text-[42px] lg:text-[48px]">
              {t("wishlist.welcome")}
            </h1>

            <p className="mt-2 text-[16px] text-[#52655c]">
              {t("wishlist.subtitle")}
            </p>
          </div>

          {/* Main Container */}
          <div className="rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[0_10px_45px_rgba(23,61,43,0.08)] backdrop-blur-sm sm:rounded-[20px] sm:p-5 lg:p-8">

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">

              {/* Sidebar */}
              <aside className="rounded-[16px] border border-[#d9ddd4] bg-white/45 p-3">

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <UserRound
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("wishlist.sidebar.profile")}
                  </span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] bg-[#e5e6da] px-5 text-[#173d2b]"
                >
                  <Heart
                    size={27}
                    strokeWidth={1.5}
                    className="fill-[#173d2b]"
                  />

                  <span className="text-[15px] font-medium">
                    {t("wishlist.sidebar.wishlist")}
                  </span>
                </Link>

                {/* Orders */}
                <Link
                  to="/orders"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <Package
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("wishlist.sidebar.orders")}
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <ShoppingCart
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("wishlist.sidebar.cart")}
                  </span>
                </Link>

                {/* Sidebar bottom */}
                <div className="mt-auto hidden min-h-[330px] flex-col justify-end px-6 pb-5 lg:flex">

                  <div className="mb-8 h-[1px] w-[48px] bg-[#aeb7af]" />

                  <p className="font-serif text-[24px] tracking-[7px] text-[#173d2b]">
                    SABONA
                  </p>

                  <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[#718077]">
                    {t("wishlist.sidebar.tagline")}
                  </p>
                </div>
              </aside>

              {/* Wishlist Content */}
              <section className="rounded-[16px] border border-white/70 bg-white/60 p-4 sm:p-7 lg:p-10">

                {/* Title */}
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <Heart
                      size={25}
                      strokeWidth={1.5}
                      className="text-[#173d2b]"
                    />

                    <h2 className="font-serif text-2xl text-[#173d2b] sm:text-[28px]">
                      {t("wishlist.title")}
                    </h2>
                  </div>

                  <p className="mt-2 text-[14px] text-[#718077]">
                    {t("wishlist.description")}
                  </p>
                </div>

                {/* Empty Wishlist */}
                {products.length === 0 ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                    <div className="mb-6 flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#e8e9df]">
                      <Heart
                        size={36}
                        strokeWidth={1.3}
                        className="text-[#718077]"
                      />
                    </div>

                    <h3 className="font-serif text-[24px] text-[#173d2b]">
                      {t("wishlist.empty.title")}
                    </h3>

                    <p className="mt-2 max-w-[400px] text-[14px] leading-6 text-[#718077]">
                      {t("wishlist.empty.description")}
                    </p>

                    <Link
                      to="/home"
                      className="mt-7 rounded-full bg-[#173d2b] px-7 py-3 text-[14px] font-medium text-white transition hover:opacity-90"
                    >
                      {t("wishlist.explore")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {products.map((product) => {
                      const productName = isArabic
                        ? product.name_ar
                        : product.name_en;

                      const productDescription = isArabic
                        ? product.description_ar
                        : product.description_en;

                      return (
                        <div
                          key={product.id}
                          className="overflow-hidden rounded-[16px] border border-[#e0e3dc] bg-[#f8f7f0]"
                        >
                          {/* Image */}
                          <div className="relative aspect-[1.35/1] overflow-hidden bg-[#ebe9df]">

                            {product.images?.length > 0 ? (
                              <Link to={`/products/${product.id}`}>
                                <img
                                  src={product.images[0]}
                                  alt={productName}
                                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                                />
                              </Link>
                            ) : (
                              <Link
                                to={`/products/${product.id}`}
                                className="flex h-full items-center justify-center text-sm text-[#7b8179]"
                              >
                                {t("wishlist.noImage")}
                              </Link>
                            )}

                            {/* Wishlist Button */}
                            <button
                              type="button"
                              onClick={() =>
                                removeFromWishlist(product.id)
                              }
                              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white"
                              aria-label={
                                t("wishlist.removeAria")
                              }
                            >
                              <Heart
                                size={19}
                                strokeWidth={1.7}
                                className="fill-red-500 text-red-500"
                              />
                            </button>
                          </div>

                          {/* Product Info */}
                          <div className="px-5 py-5">

                            <div className="flex items-start justify-between gap-3">
                              <Link
                                to={`/products/${product.id}`}
                                className="text-[15px] font-medium leading-6 text-[#173d2b] transition hover:opacity-70"
                              >
                                {productName}
                              </Link>

                              <span className="shrink-0 text-[14px] font-medium text-[#173d2b]">
                                ${product.price}
                              </span>
                            </div>

                            <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#737a72]">
                              {productDescription}
                            </p>

                          </div>
                        </div>
                      );
                    })}

                  </div>
                )}

              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;