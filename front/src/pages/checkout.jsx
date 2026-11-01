import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import Footer from "../components/footer";
import { apiUrl } from "../api";

function Checkout() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const isArabic = i18n.language === "ar";
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
    try {
      const response = await fetch(
        apiUrl("/api/cart"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("checkout.errors.loadCart")
        );
      }

      setCart(data.cart || []);
    } catch (error) {
      console.error("Checkout cart error:", error);
      setError(t("checkout.errors.loadCart"));
    } finally {
      setLoading(false);
    }
    };

    fetchCart();
  }, [navigate, t, token]);

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );

  const placeOrder = async (e) => {
    e.preventDefault();

    setError("");
    const phoneRegex = /^07\d{9}$/;

    if (!phoneRegex.test(phone)) {
      setError(t("checkout.validation.invalidPhone"));

      return;
    }
    if (!phone.trim() || !city.trim() || !address.trim()) {
        setError(t("checkout.validation.requiredFields"));

      return;
    }

    if (cart.length === 0) {
      setError(t("checkout.validation.emptyCart"));

      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        apiUrl("/api/orders"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: phone.trim(),
            city: city.trim(),
            address: address.trim(),
            }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("checkout.errors.placeOrder")
        );
      }

      // Update cart counter immediately
      window.dispatchEvent(
        new Event("cartUpdated")
      );

      // Go to order details
      navigate(`/orders/${data.order.id}`);
    } catch (error) {
      console.error("Place order error:", error);

      setError(
        error.message || t("checkout.errors.placeOrder")
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#737a72]">
            {t("checkout.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <main className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4 sm:px-6">
          <div className="max-w-xl text-center">
            <h1 className="font-serif text-2xl text-[#173d2b] sm:text-3xl">
              {t("checkout.emptyTitle")}
            </h1>

            <p className="mt-3 text-sm text-[#737a72]">
              {t("checkout.emptyDescription")}
            </p>

            <Link
              to="/home"
              className="mt-6 inline-block rounded-full bg-[#173d2b] px-7 py-3 text-sm text-white transition hover:bg-[#102d20]"
            >
              {t("checkout.continueShopping")}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f2]">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* BACK TO CART */}

        <Link
          to="/cart"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#737a72] transition hover:text-[#173d2b]"
        >
          {isArabic ? (
            <ArrowRight
              size={17}
              strokeWidth={1.5}
            />
          ) : (
            <ArrowLeft
              size={17}
              strokeWidth={1.5}
            />
          )}

          {t("checkout.backToCart")}
        </Link>

        {/* TITLE */}

        <div className="mb-7 sm:mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
            {t("checkout.eyebrow")}
          </p>

          <h1 className="mt-2 font-serif text-3xl text-[#173d2b] sm:text-4xl">
            {t("checkout.title")}
          </h1>
        </div>

        <div className="grid min-w-0 gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* FORM */}

          <form
            onSubmit={placeOrder}
            className="rounded-2xl border border-black/5 bg-white p-4 sm:p-8"
          >
            <h2 className="font-serif text-xl text-[#173d2b] sm:text-2xl">
              {t("checkout.yourInformation")}
            </h2>

            {/* PHONE */}

            <div className="mt-7">
              <label className="mb-2 block text-sm font-medium text-[#173d2b]">
                {t("checkout.phone")}
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPhone(value);
                }}
                maxLength={11}
                placeholder={t("checkout.phonePlaceholder")}
                className="w-full rounded-xl border border-black/10 bg-[#faf9f2] px-4 py-3 text-sm text-[#263d32] outline-none transition placeholder:text-[#999f98] focus:border-[#173d2b]"
              />
            </div>
            <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-[#173d2b]">
                    {t("checkout.city")}
                </label>

                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("checkout.cityPlaceholder")}
                    className="w-full rounded-xl border border-black/10 bg-[#faf9f2] px-4 py-3 text-sm text-[#263d32] outline-none transition placeholder:text-[#999f98] focus:border-[#173d2b]"
                />
            </div>

            {/* ADDRESS */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#173d2b]">
                {t("checkout.address")}
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                rows={5}
                placeholder={t("checkout.addressPlaceholder")}
                className="w-full resize-none rounded-xl border border-black/10 bg-[#faf9f2] px-4 py-3 text-sm leading-6 text-[#263d32] outline-none transition placeholder:text-[#999f98] focus:border-[#173d2b]"
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* PLACE ORDER */}

            <button
              type="submit"
              disabled={placingOrder}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#173d2b] py-3.5 text-sm font-medium text-white transition hover:bg-[#102d20] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check
                size={18}
                strokeWidth={1.6}
              />

              {placingOrder
                ? t("checkout.placingOrder")
                : t("checkout.placeOrder")}
            </button>
          </form>

          {/* ORDER SUMMARY */}

          <aside className="h-fit rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="font-serif text-xl text-[#173d2b] sm:text-2xl">
              {t("checkout.orderSummary")}
            </h2>

            <div className="mt-6 space-y-4">
              {cart.map((item) => {
                const name = isArabic
                  ? item.name_ar
                  : item.name_en;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#ebe9df]">
                      {item.main_image ? (
                        <img
                          src={item.main_image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-[#7b8179]">
                          {t("checkout.noImage")}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#173d2b]">
                        {name}
                      </p>

                      <p className="mt-1 text-xs text-[#737a72]">
                        {item.quantity} × $
                        {Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-[#173d2b]">
                      $
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#737a72]">
                {t("checkout.items")}
              </span>

              <span className="text-[#263d32]">
                {totalItems}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#737a72]">
                {t("checkout.subtotal")}
              </span>

              <span className="text-[#263d32]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
              <span className="font-medium text-[#173d2b]">
                {t("checkout.total")}
              </span>

              <span className="text-xl font-semibold text-[#173d2b]">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;