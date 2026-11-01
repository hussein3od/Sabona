import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import Footer from "../components/footer";

function Cart() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const isArabic = i18n.language === "ar";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("cart.errors.loadFailed")
        );
      }

      setCart(data.cart || []);
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setLoading(false);
    }
    };

    fetchCart();
  }, [navigate, t, token]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingProduct(productId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || t("cart.errors.updateFailed"));
        return;
      }

      setCart((currentCart) =>
        currentCart.map((item) =>
          Number(item.product_id) === Number(productId)
            ? {
                ...item,
                quantity: data.item.quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Update cart error:", error);
    } finally {
      setUpdatingProduct(null);
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromCart = async (productId) => {
    try {
      setUpdatingProduct(productId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || t("cart.errors.removeFailed"));
        return;
      }

      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            Number(item.product_id) !== Number(productId)
        )
      );
    } catch (error) {
      console.error("Remove cart error:", error);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#737a72]">
            {t("cart.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f2]">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* PAGE TITLE */}

        <div className="mb-7 sm:mb-10">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
            {t("cart.pageLabel")}
          </p>

          <h1 className="font-serif text-3xl tracking-wide text-[#173d2b] sm:text-4xl">
            {t("cart.title")}
          </h1>

          <p className="mt-3 text-sm text-[#737a72]">
            {t("cart.itemCount", { count: totalItems })}
          </p>
        </div>

        {/* EMPTY CART */}

        {cart.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f1e9]">
              <ShoppingBag
                size={34}
                strokeWidth={1.3}
                className="text-[#173d2b]"
              />
            </div>

            <h2 className="font-serif text-2xl text-[#173d2b]">
              {t("cart.empty.title")}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#737a72]">
              {t("cart.empty.description")}
            </p>

            <Link
              to="/home"
              className="mt-7 rounded-full bg-[#173d2b] px-7 py-3 text-sm text-white transition hover:bg-[#102d20]"
            >
              {t("cart.startShopping")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

            <div className="space-y-4">
              {cart.map((item) => {
                const productName = isArabic
                  ? item.name_ar
                  : item.name_en;

                const image = item.main_image;

                const itemTotal =
                  Number(item.price) *
                  Number(item.quantity);

                return (
                  <div
                    key={item.id}
                    className="flex min-w-0 gap-3 rounded-2xl border border-black/5 bg-white p-3 sm:gap-5 sm:p-5"
                  >
                    {/* IMAGE */}

                    <Link
                      to={`/products/${item.product_id}`}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#ebe9df] min-[380px]:h-24 min-[380px]:w-24 sm:h-32 sm:w-32"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#858b84]">
                          {t("cart.noImage")}
                        </div>
                      )}
                    </Link>

                    {/* DETAILS */}

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <Link
                            to={`/products/${item.product_id}`}
                            className="min-w-0 break-words text-sm font-medium text-[#173d2b] transition hover:text-[#315c46] sm:text-base"
                          >
                            {productName}
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.product_id
                              )
                            }
                            disabled={
                              updatingProduct ===
                              item.product_id
                            }
                            className="text-[#8a8f88] transition hover:text-red-500 disabled:opacity-40"
                            aria-label={
                              t("cart.removeProduct")
                            }
                          >
                            <Trash2
                              size={18}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>

                        <p className="mt-2 text-sm text-[#737a72]">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        {/* QUANTITY */}

                        <div className="flex items-center rounded-full border border-black/10 bg-[#faf9f2]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                Number(item.quantity) - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updatingProduct ===
                                item.product_id
                            }
                            className="flex h-9 w-9 items-center rounded-full justify-center text-[#173d2b] transition hover:bg-[#f0f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus
                              size={15}
                              strokeWidth={1.7}
                            />
                          </button>

                          <span className="w-9 text-center text-sm font-medium text-[#173d2b]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                Number(item.quantity) + 1
                              )
                            }
                            disabled={
                              item.quantity >=
                                Number(item.stock) ||
                              updatingProduct ===
                                item.product_id
                            }
                            className="flex h-9 w-9 items-center rounded-full justify-center text-[#173d2b] transition hover:bg-[#f0f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus
                              size={15}
                              strokeWidth={1.7}
                            />
                          </button>
                        </div>

                        {/* ITEM TOTAL */}

                        <p className="text-sm font-medium text-[#173d2b]">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}

            <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 lg:sticky lg:top-6">
              <h2 className="font-serif text-xl text-[#173d2b] sm:text-2xl">
                {t("cart.orderSummary")}
              </h2>

              <div className="mt-6 space-y-4 border-b border-black/10 pb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#737a72]">
                    {t("cart.items")}
                  </span>

                  <span className="text-[#263d32]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#737a72]">
                    {t("cart.subtotal")}
                  </span>

                  <span className="text-[#263d32]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#737a72]">
                    {t("cart.shipping")}
                  </span>

                  <span className="text-[#263d32]">
                    {t("cart.shippingCalculated")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-6">
                <span className="font-medium text-[#173d2b]">
                  {t("cart.total")}
                </span>

                <span className="text-xl font-semibold text-[#173d2b]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="w-full rounded-full bg-[#173d2b] py-3.5 text-sm font-medium text-white transition hover:bg-[#102d20]"
              >
                {t("cart.checkout")}
              </button>

              <Link
                to="/home"
                className="mt-4 block text-center text-sm text-[#737a72] transition hover:text-[#173d2b]"
              >
                {t("cart.continueShopping")}
              </Link>
            </aside>
          </div>
        )}
      </main>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default Cart;