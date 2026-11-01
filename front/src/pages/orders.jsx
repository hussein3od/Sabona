import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import Footer from "../components/footer";
import { apiUrl } from "../api";

function Orders() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const isArabic = i18n.language === "ar";
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
    try {
      const response = await fetch(
        apiUrl("/api/orders/my-orders"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("orders.loadFailed")
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Orders error:", error);

      setError(
        t("orders.errors.loadFailed")
      );
    } finally {
      setLoading(false);
    }
    };

    fetchOrders();
  }, [navigate, t, token]);

  const getStatusText = (status) => {
    const statuses = {
      pending: t("orders.status.pending"),
      confirmed: t("orders.status.confirmed"),
      processing: t("orders.status.processing"),
      shipped: t("orders.status.shipped"),
      delivered: t("orders.status.delivered"),
      cancelled: t("orders.status.cancelled"),
    };

    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f2]">
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#737a72]">
            {t("orders.loading")}
          </p>
        </main>

        <Footer />
      </div>
    );
  }
  const handleReorder = async (order) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    for (const item of order.items) {
      const response = await fetch(
        apiUrl("/api/cart"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("orders.itemsCouldNotBeAdded")
        );
      }
    }

    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/cart");
  } catch (error) {
    console.error("Reorder error:", error);

    setError(
      error.message || t("orders.errors.reorderFailed")
    );
  }
};

  return (
    <div className="min-h-screen bg-[#faf9f2]">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to="/profile"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#737a72] transition hover:text-[#173d2b]"
        >
          {isArabic ? (
            <ArrowRight size={17} strokeWidth={1.5} />
          ) : (
            <ArrowLeft size={17} strokeWidth={1.5} />
          )}

          {t("orders.backToProfile")}
        </Link>

        <div className="mb-7 sm:mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
            {t("orders.accountLabel")}
          </p>

          <h1 className="mt-2 font-serif text-3xl text-[#173d2b] sm:text-4xl">
            {t("orders.title")}
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white px-6 text-center">
            <Package
              size={42}
              strokeWidth={1.3}
              className="text-[#173d2b]"
            />

            <h2 className="mt-5 font-serif text-2xl text-[#173d2b]">
              {t("orders.empty.title")}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#737a72]">
              {t("orders.empty.description")}
            </p>

            <Link
              to="/home"
              className="mt-6 rounded-full bg-[#173d2b] px-7 py-3 text-sm text-white transition hover:bg-[#102d20]"
            >
              {t("orders.startShopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs text-[#737a72]">
                      {t("orders.orderLabel")}
                    </p>

                    <h2 className="mt-1 text-lg font-medium text-[#173d2b]">
                      #{order.id}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#eef2e9] px-4 py-2 text-xs font-medium text-[#173d2b]">
                      {getStatusText(order.status)}
                    </span>

                    <span className="text-sm text-[#737a72]">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        isArabic ? "ar-IQ" : "en-US"
                      )}
                    </span>
                  </div>
                </div>

                <div className="my-5 h-px bg-black/10" />

                <div className="space-y-3">
                  {order.items.map((item) => {
                    const name = isArabic
                      ? item.name_ar
                      : item.name_en;

                    return (
                      <div
                        key={`${order.id}-${item.product_id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#ebe9df]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-[#7b8179]">
                              {t("orders.noImage")}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="min-w-0 flex-1 break-words text-sm font-medium text-[#173d2b]">
                            {name}
                          </p>

                          <p className="mt-1 text-xs text-[#737a72]">
                            {t("orders.quantity", {
                              count: item.quantity,
                            })}
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

                <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-[#737a72]">
                      {t("orders.total")}
                    </p>

                    <p className="mt-1 text-xl font-semibold text-[#173d2b]">
                      $
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="rounded-full border border-[#173d2b] px-6 py-2.5 text-center text-sm font-medium text-[#173d2b] transition hover:bg-[#173d2b] hover:text-white"
                  >
                    {t("orders.addToCart")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;