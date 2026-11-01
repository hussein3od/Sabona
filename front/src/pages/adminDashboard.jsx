import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import { apiUrl } from "../api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isArabic =
    i18n.language?.startsWith("ar");

  const currencyFormatter = new Intl.NumberFormat(
    isArabic ? "ar-IQ" : "en-US",
    {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(userData);
    } catch {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    const controller = new AbortController();

    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          apiUrl("/api/admin/stats"),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401 ||
            response.status === 403) {
          navigate("/", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(t("adminDashboard.errors.fetchFailed"));
        }

        const data = await response.json();

        if (!data.stats) {
          throw new Error(t("adminDashboard.errors.invalidResponse"));
        }

        setStats({
          totalSales: Number(data.stats.totalSales) || 0,
          totalOrders: Number(data.stats.totalOrders) || 0,
          totalCustomers: Number(data.stats.totalCustomers) || 0,
          totalProducts: Number(data.stats.totalProducts) || 0,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Dashboard stats error:", err);
          setError(t("adminDashboard.errors.fetchFailed"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => controller.abort();
  }, [navigate, isArabic, t]);

  const cards = [
    {
      title: t("adminDashboard.stats.totalSales"),
      value: currencyFormatter.format(stats.totalSales),
      icon: ShoppingBag,
      color: "bg-green-100 text-green-700",
    },
    {
      title: t("adminDashboard.stats.orders"),
      value: stats.totalOrders.toLocaleString(
        isArabic ? "ar-IQ" : "en-US"
      ),
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: t("adminDashboard.stats.customers"),
      value: stats.totalCustomers.toLocaleString(
        isArabic ? "ar-IQ" : "en-US"
      ),
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: t("adminDashboard.stats.products"),
      value: stats.totalProducts.toLocaleString(
        isArabic ? "ar-IQ" : "en-US"
      ),
      icon: Package,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  const refreshStats = () => {
    window.location.reload();
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-gray-50"
    >
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("adminDashboard.title")}
            </h1>

            <p className="mt-2 text-gray-500">
              {t("adminDashboard.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={refreshStats}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            {t("adminDashboard.refresh")}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={refreshStats}
              className="font-semibold underline"
            >
              {t("adminDashboard.tryAgain")}
            </button>
          </div>
        )}

        <section
          aria-label={t("adminDashboard.statsLabel")}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10"
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-gray-900 break-words">
                      {loading ? (
                        <span className="inline-block h-7 w-24 animate-pulse rounded bg-gray-200" />
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>


        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className={`rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#173d2b]/20 sm:p-6 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <h2 className="font-serif text-2xl text-[#173d2b]">
              {t("adminDashboard.cards.products.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#737a72]">
              {t("adminDashboard.cards.products.description")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className={`rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#173d2b]/20 sm:p-6 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <h2 className="font-serif text-2xl text-[#173d2b]">
              {t("adminDashboard.cards.orders.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#737a72]">
              {t("adminDashboard.cards.orders.description")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            className={`rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#173d2b]/20 sm:p-6 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <h2 className="font-serif text-2xl text-[#173d2b]">
              {t("adminDashboard.cards.customers.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#737a72]">
              {t("adminDashboard.cards.customers.description")}
            </p>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;