
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  CalendarDays,
  UserRound,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  LoaderCircle,
} from "lucide-react";
import { apiUrl } from "../api";

const API_URL = apiUrl("/api/orders");

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  pending: Clock3,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} د.ع`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  return (
    STATUS_OPTIONS.find((item) => item.value === status)?.label ||
    status ||
    "غير محدد"
  );
}

function getItems(order) {
  if (Array.isArray(order.items)) return order.items;
  return [];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchOrders = useCallback(() => Promise.resolve().then(async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "فشل تحميل الطلبات");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "صار خطأ أثناء تحميل الطلبات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }), []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const searchableText = [
        order.id,
        order.customer_name,
        order.customer_phone,
        order.phone,
        order.city,
        order.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const currentOrder = orders.find((order) => order.id === orderId);

    if (!currentOrder || currentOrder.status === newStatus) return;

    setSavingOrder(orderId);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث حالة الطلب");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order?.status || newStatus,
                updated_at: data.order?.updated_at || order.updated_at,
              }
            : order
        )
      );

      setSuccess(`تم تحديث حالة الطلب #${orderId} بنجاح`);
    } catch (err) {
      setError(err.message || "صار خطأ أثناء تحديث الحالة");
    } finally {
      setSavingOrder(null);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#166700]">
              <ShoppingBag size={18} />
              لوحة تحكم سبونا
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              إدارة الطلبات
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              تابع طلبات الزبائن وحدّث حالة كل طلب.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setRefreshing(true);
              fetchOrders();
            }}
            disabled={refreshing || loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            تحديث الطلبات
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="إغلاق رسالة الخطأ"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="إغلاق رسالة النجاح"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="كل الطلبات"
            value={stats.total}
            icon={ShoppingBag}
            iconClass="bg-gray-100 text-gray-700"
          />
          <StatCard
            title="قيد الانتظار"
            value={stats.pending}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-700"
          />
          <StatCard
            title="قيد التجهيز"
            value={stats.processing}
            icon={Package}
            iconClass="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="تم التوصيل"
            value={stats.delivered}
            icon={CheckCircle2}
            iconClass="bg-green-50 text-green-700"
          />
        </section>

        {/* Search and filter */}
        <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث برقم الطلب أو اسم الزبون أو الهاتف..."
                className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-10 pl-3 text-sm outline-none transition focus:border-[#166700] focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#166700] focus:ring-2 focus:ring-green-100 sm:w-auto"
            >
              <option value="all">كل الحالات</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            عرض {filteredOrders.length} من أصل {orders.length} طلب
          </p>
        </section>

        {/* Orders */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white">
            <LoaderCircle className="animate-spin text-[#166700]" size={32} />
            <p className="text-sm text-gray-500">جاري تحميل الطلبات...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center">
            <div className="mb-4 rounded-2xl bg-gray-100 p-4 text-gray-500">
              <Package size={30} />
            </div>
            <h2 className="font-bold text-gray-800">ماكو طلبات هنا</h2>
            <p className="mt-2 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "جرّب تغيّر البحث أو فلتر الحالة."
                : "لحد الآن ما وصلت أي طلبات."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const isSaving = savingOrder === order.id;
              const items = getItems(order);
              const StatusIcon = STATUS_ICONS[order.status] || Package;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Order summary */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            طلب #{order.id}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              STATUS_STYLES[order.status] ||
                              "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            <StatusIcon size={14} />
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={15} />
                            {order.customer_name || "بدون اسم"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {formatDate(order.created_at)}
                          </span>

                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                            {formatMoney(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <label
                          htmlFor={`status-${order.id}`}
                          className="text-xs font-semibold text-gray-600"
                        >
                          تغيير الحالة
                        </label>

                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          disabled={isSaving}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                          className="min-h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#166700] focus:ring-2 focus:ring-green-100 disabled:opacity-60 sm:w-auto"
                        >
                          {!STATUS_OPTIONS.some(
                            (option) => option.value === order.status
                          ) && (
                            <option value={order.status}>
                              {getStatusLabel(order.status)}
                            </option>
                          )}

                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>

                        {isSaving && (
                          <LoaderCircle
                            size={18}
                            className="animate-spin text-[#166700]"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrder(isExpanded ? null : order.id)
                          }
                          aria-expanded={isExpanded}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#166700]/10 px-4 py-2 text-sm font-semibold text-[#166700] transition hover:bg-[#166700]/15 sm:w-auto"
                        >
                          {isExpanded ? "إخفاء التفاصيل" : "تفاصيل الطلب"}
                          {isExpanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
                      <div className="mb-5 grid gap-4 md:grid-cols-2">
                        <InfoCard title="معلومات الزبون">
                          <InfoRow
                            icon={UserRound}
                            label="الاسم"
                            value={order.customer_name || "—"}
                          />
                          <InfoRow
                            icon={Phone}
                            label="رقم الهاتف"
                            value={
                              order.customer_phone || order.phone || "—"
                            }
                          />
                          <InfoRow
                            icon={MapPin}
                            label="المحافظة"
                            value={order.city || "—"}
                          />
                          <InfoRow
                            icon={MapPin}
                            label="العنوان"
                            value={order.address || "—"}
                          />
                        </InfoCard>

                        <InfoCard title="ملخص الفاتورة">
                          <InfoRow
                            label="المجموع الفرعي"
                            value={formatMoney(order.subtotal)}
                          />
                          <InfoRow
                            label="الخصم"
                            value={formatMoney(order.discount_amount)}
                          />
                          <InfoRow
                            label="طريقة الدفع"
                            value={
                              order.payment_method === "cash_on_delivery"
                                ? "الدفع عند الاستلام"
                                : order.payment_method || "—"
                            }
                          />

                          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <span className="font-bold text-gray-800">
                              المجموع النهائي
                            </span>
                            <span className="text-lg font-bold text-[#166700]">
                              {formatMoney(order.total_amount)}
                            </span>
                          </div>
                        </InfoCard>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                          <h3 className="font-bold text-gray-800">
                            المنتجات المطلوبة
                          </h3>
                          <span className="text-xs text-gray-500">
                            {items.length} منتج
                          </span>
                        </div>

                        {items.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500">
                            ماكو تفاصيل منتجات لهذا الطلب.
                          </p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {items.map((item, index) => {
                              const itemName =
                                item.product_name_ar ||
                                item.product_name_en ||
                                `منتج ${index + 1}`;

                              return (
                                <div
                                  key={item.id || `${item.product_id}-${index}`}
                                  className="flex items-center gap-3 p-4"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={itemName}
                                      className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                      <Package size={23} />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <p className="break-words text-sm font-semibold text-gray-800">
                                      {itemName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      الكمية: {item.quantity} ×{" "}
                                      {formatMoney(item.price)}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-bold text-gray-900">
                                    {formatMoney(item.total)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500 sm:text-sm">{title}</p>
        <div className={`rounded-xl p-2 ${iconClass}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-4 font-bold text-gray-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon size={16} className="mt-0.5 shrink-0 text-gray-400" />}
      <span className="shrink-0 text-gray-500">{label}:</span>
      <span className="min-w-0 break-words font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}
