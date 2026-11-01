import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import { apiUrl } from "../api";

function AdminProducts() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(
    () =>
      fetch(apiUrl("/api/products"))
        .then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to load products");
          }

          setProducts(data.products || data);
        })
        .catch((error) => {
          console.error("Failed to load products:", error);
          setError(t("adminProducts.errors.loadFailed"));
        })
        .finally(() => setLoading(false)),
    [t]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/home");
      return;
    }

    fetchProducts();
  }, [fetchProducts, navigate]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      t("adminProducts.delete.confirm")
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(apiUrl(`/api/products/${id}`),
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
          data.message || "Failed to delete product"
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );
    } catch (error) {
      console.error("Delete product error:", error);
      setError(
        error.message || t("adminProducts.errors.deleteFailed")
      );
    }
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#faf9f2]"
    >
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
              {t("adminProducts.administration")}
            </p>

            <h1 className="mt-2 font-serif text-3xl text-[#173d2b] sm:text-4xl">
              {t("adminProducts.title")}
            </h1>

            <p className="mt-3 text-sm text-[#737a72]">
              {t("adminProducts.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/products/new")}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173d2b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24563d] sm:w-auto"
          >
            <Plus size={18} />
            {t("adminProducts.addProduct")}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Products */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-[#737a72]">
                {t("adminProducts.loading")}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4ed] text-[#173d2b]">
                <Package size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#173d2b]">
                {t("adminProducts.empty.title")}
              </h2>

              <p className="mt-2 text-sm text-[#737a72]">
                {t("adminProducts.empty.description")}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/products/new")
                }
                className="mt-5 rounded-full bg-[#173d2b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#24563d]"
              >
                {t("adminProducts.addProduct")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#faf9f2]">
                    <th
                      className={`px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#737a72] ${
                        isArabic
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {t("adminProducts.table.product")}
                    </th>

                    <th
                      className={`px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#737a72] ${
                        isArabic
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {t("adminProducts.table.price")}
                    </th>

                    <th
                      className={`px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#737a72] ${
                        isArabic
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {t("adminProducts.table.stock")}
                    </th>

                    <th
                      className={`px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#737a72] ${
                        isArabic
                          ? "text-left"
                          : "text-right"
                      }`}
                    >
                      {t("adminProducts.table.actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {    
                    const image =
                      product.images?.[0]?.image_url ||
                      product.main_image ||
                      product.image_url ||
                      "";
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-black/5 last:border-b-0"
                      >
                        {/* Product */}
                        <td className="px-6 py-5">
                          <div
                            className={`flex items-center gap-4 ${
                              isArabic
                                ? "flex-row-reverse justify-end"
                                : ""
                            }`}
                          >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f3f4ed]">
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.name_en}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#9aa095]">
                                  <Package size={22} />
                                </div>
                              )}
                            </div>

                            <div
                              className={
                                isArabic
                                  ? "text-right"
                                  : "text-left"
                              }
                            >
                              <p className="font-medium text-[#173d2b]">
                                {product.name_en}
                              </p>

                              {product.name_ar && (
                                <p
                                  dir="rtl"
                                  className="mt-1 text-sm text-[#737a72]"
                                >
                                  {product.name_ar}
                                </p>
                              )}

                              <p
                                dir="ltr"
                                className="mt-1 text-xs text-[#9aa095]"
                              >
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td
                          dir="ltr"
                          className="px-6 py-5 text-sm font-medium text-[#173d2b]"
                        >
                          {Number(
                            product.price
                          ).toLocaleString()}{" "}
                          IQD
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-5">
                          <span
                            className={`text-sm font-medium ${
                              Number(product.stock) <= 0
                                ? "text-red-600"
                                : Number(product.stock) <= 5
                                ? "text-orange-600"
                                : "text-[#173d2b]"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div
                            className={`flex gap-2 ${
                              isArabic
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/products/edit/${product.id}`
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#173d2b] transition hover:bg-[#f3f4ed]"
                              title={t(
                                "adminProducts.actions.edit"
                              )}
                              aria-label={t(
                                "adminProducts.actions.edit"
                              )}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(product.id)
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
                              title={t(
                                "adminProducts.actions.delete"
                              )}
                              aria-label={t(
                                "adminProducts.actions.delete"
                              )}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminProducts;