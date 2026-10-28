import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import {
  AlertTriangle,
  Boxes,
  Bell,
  ClipboardList,
  ExternalLink,
  PackageCheck,
  Plus,
  Printer,
  QrCode,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import { API_BASE_URL } from "../api/apiBase";
import {
  getAdminCategories,
  getAdminCafeTables,
  getAdminAttentionOrders,
  getAdminOrders,
  getAdminProducts,
  createCafeTable,
  updateCafeTable,
  updateAdminOrder,
} from "../api/accountAPI";

const statusLabels = {
  pending: "در انتظار",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function printOrderReceipt(order) {
  const printWindow = window.open("", "_blank", "width=420,height=700");
  if (!printWindow) {
    throw new Error("پنجرهٔ چاپ باز نشد. اجازهٔ بازشدن پنجره را فعال کنید.");
  }

  const orderTime = new Date(order.created_at).toLocaleString("fa-IR");
  const orderTypeLabel =
    order.order_type === "dine_in"
      ? "داخل سالن"
      : order.order_type === "delivery"
        ? "ارسال با پیک"
        : "بیرون‌بر";
  const orderDetails =
    order.order_type === "dine_in" && order.table_number
      ? `<div>شماره میز: ${escapeHtml(new Intl.NumberFormat("fa-IR").format(order.table_number))}</div>`
      : order.order_type === "delivery" && order.address
        ? `<div class="address">آدرس: ${escapeHtml(order.address)}</div>`
        : "";
  const items = (order.items ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.product_name)}</td>
          <td>${new Intl.NumberFormat("fa-IR").format(item.quantity)}</td>
          <td>${new Intl.NumberFormat("fa-IR").format(item.total_price)}</td>
        </tr>`
    )
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>فیش سفارش ${escapeHtml(order.id)}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          body { width: 72mm; margin: 0 auto; color: #111; font: 12px sans-serif; }
          h1, p { text-align: center; }
          h1 { font-size: 16px; }
          .meta { line-height: 1.9; border-bottom: 1px dashed #333; padding-bottom: 8px; }
          .address { white-space: pre-wrap; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 6px 2px; text-align: right; border-bottom: 1px dashed #aaa; }
          .total { margin-top: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>BuffieCoffee · فیش سفارش</h1>
        <div class="meta">
          <div>شماره سفارش: ${escapeHtml(order.id)}</div>
          <div>زمان ثبت: ${escapeHtml(orderTime)}</div>
          <div>مشتری: ${escapeHtml(order.customer_name)}</div>
          <div>تماس: ${escapeHtml(order.phone)}</div>
          <div>نوع سفارش: ${orderTypeLabel}</div>
          ${orderDetails}
          ${order.note ? `<div>توضیحات: ${escapeHtml(order.note)}</div>` : ""}
        </div>
        <table>
          <thead><tr><th>محصول</th><th>تعداد</th><th>مبلغ</th></tr></thead>
          <tbody>${items}</tbody>
        </table>
        <p class="total">مبلغ کل: ${new Intl.NumberFormat("fa-IR").format(order.total_price)} تومان</p>
        <script>
          window.addEventListener("load", () => {
            window.print();
            window.addEventListener("afterprint", () => window.close(), { once: true });
          }, { once: true });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const previousOrderIds = useRef(null);
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [orderData, attentionOrders, productData, categoryData] =
        await Promise.all([
          getAdminOrders(),
          getAdminAttentionOrders(),
          getAdminProducts(),
          getAdminCategories(),
        ]);
      return { orderData, attentionOrders, productData, categoryData };
    },
    enabled: Boolean(user?.is_staff),
    refetchInterval: 15_000,
  });
  const orders = useMemo(
    () => dashboardQuery.data?.orderData.results ?? [],
    [dashboardQuery.data]
  );
  const tablesQuery = useQuery({
    queryKey: ["admin-cafe-tables"],
    queryFn: getAdminCafeTables,
    enabled: Boolean(user?.is_staff),
  });

  useEffect(() => {
    if (!dashboardQuery.data) return;

    const currentIds = new Set(orders.map((order) => order.id));
    if (previousOrderIds.current === null) {
      previousOrderIds.current = currentIds;
      return;
    }

    const newOrder = orders.find(
      (order) => !previousOrderIds.current.has(order.id)
    );
    previousOrderIds.current = currentIds;

    if (newOrder) {
      setIncomingOrder(newOrder);
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("سفارش جدید کافه", {
          body: `سفارش شماره ${newOrder.id} از ${newOrder.customer_name} ثبت شد.`,
        });
        notification.onclick = () => window.focus();
      }
    }
  }, [dashboardQuery.data, orders]);

  async function changeOrderStatus(orderId, status) {
    setErrorMessage("");
    try {
      const updatedOrder = await updateAdminOrder(orderId, { status });
      queryClient.setQueryData(["admin-dashboard"], (current) =>
        current
          ? {
              ...current,
              orderData: {
                ...current.orderData,
                results: current.orderData.results.map((order) =>
                  order.id === orderId ? updatedOrder : order
                ),
              },
            }
          : current
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-cafe-tables"] });
      await queryClient.invalidateQueries({ queryKey: ["cafe-tables"] });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateTable(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsCreatingTable(true);
    try {
      const table = await createCafeTable(Number(newTableNumber));
      queryClient.setQueryData(["admin-cafe-tables"], (tables = []) =>
        [...tables, table].sort((first, second) =>
          first.table_number - second.table_number
        )
      );
      setNewTableNumber("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCreatingTable(false);
    }
  }

  async function changeTableAvailability(tableId, isOccupied) {
    setErrorMessage("");
    try {
      const updatedTable = await updateCafeTable(tableId, isOccupied);
      queryClient.setQueryData(["admin-cafe-tables"], (tables = []) =>
        tables.map((table) =>
          table.id === tableId ? updatedTable : table
        )
      );
      await queryClient.invalidateQueries({ queryKey: ["cafe-tables"] });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setErrorMessage("این مرورگر از اعلان‌های دسکتاپ پشتیبانی نمی‌کند.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setErrorMessage("اجازهٔ نمایش اعلان مرورگر داده نشد.");
    } else {
      setErrorMessage("");
    }
  }

  function handlePrintOrder(order) {
    setErrorMessage("");
    try {
      printOrderReceipt(order);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return <DashboardNotice>در حال بررسی دسترسی…</DashboardNotice>;
  }
  if (!user) {
    return <Navigate to="/account" replace />;
  }
  if (!user.is_staff) {
    return <Navigate to="/account" replace />;
  }

  const dashboard = dashboardQuery.data;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--mui-palette-background-default)] px-4 py-8 text-[var(--mui-palette-text-primary)] sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-[#2b1b12] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm text-[#e2bc96]">مدیریت بافی کافی</p>
            <h1 className="mt-2 text-3xl font-bold">داشبورد مدیریت</h1>
            <p className="mt-2 text-sm text-white/70">
              سفارش‌ها و آمار کلی فروشگاه را از یک جا بررسی کن.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${API_BASE_URL}/admin/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d7b08a] px-4 py-2 font-bold text-[#241812]"
            >
              مدیریت کامل داده‌ها
              <ExternalLink size={17} />
            </a>
            <Link
              to="/account"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 font-bold text-white"
            >
              حساب کاربری
            </Link>
          </div>
        </header>

        {(errorMessage || dashboardQuery.error) && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {errorMessage || dashboardQuery.error.message}
          </p>
        )}

        {incomingOrder && (
          <aside
            role="status"
            className="fixed left-4 top-4 z-50 max-w-sm rounded-2xl border border-[var(--mui-palette-primary-main)]/30 bg-[var(--mui-palette-background-paper)] p-4 shadow-xl"
          >
            <div className="font-bold">سفارش جدید ثبت شد</div>
            <p className="mt-1 text-sm text-[var(--mui-palette-text-secondary)]">
              سفارش #{incomingOrder.id} · {incomingOrder.customer_name}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePrintOrder(incomingOrder)}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[var(--mui-palette-primary-main)] px-3 text-sm font-bold text-white dark:text-[#241812]"
              >
                <Printer size={15} aria-hidden="true" />
                چاپ فیش
              </button>
              <button
                type="button"
                onClick={() => setIncomingOrder(null)}
                className="text-sm text-[var(--mui-palette-text-secondary)]"
              >
                بستن
              </button>
            </div>
          </aside>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={ClipboardList}
            label="کل سفارش‌ها"
            value={dashboard?.orderData.count ?? "—"}
          />
          <SummaryCard
            icon={Boxes}
            label="محصولات"
            value={dashboard?.productData.count ?? "—"}
          />
          <SummaryCard
            icon={PackageCheck}
            label="دسته‌بندی‌ها"
            value={dashboard?.categoryData.count ?? "—"}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <QrCode size={22} aria-hidden="true" />
                میزها و QR سفارش حضوری
              </h2>
              <p className="mt-2 text-sm text-[var(--mui-palette-text-secondary)]">
                هر QR به یک میز متصل است. با اسکن آن، میز در صفحهٔ سفارش قفل می‌شود.
              </p>
            </div>
            <form
              onSubmit={handleCreateTable}
              className="flex flex-wrap items-end gap-2"
            >
              <label className="space-y-1 text-sm">
                <span className="block">شماره میز جدید</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNumber}
                  onChange={(event) => setNewTableNumber(event.target.value)}
                  className="min-h-10 w-32 rounded-lg border border-[var(--mui-palette-divider)] bg-transparent px-3"
                />
              </label>
              <button
                type="submit"
                disabled={isCreatingTable || !newTableNumber}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-[var(--mui-palette-primary-main)] px-3 text-sm font-bold text-white disabled:opacity-50 dark:text-[#241812]"
              >
                <Plus size={16} aria-hidden="true" />
                ساخت میز و QR
              </button>
            </form>
          </div>

          {tablesQuery.isPending ? (
            <p className="py-8 text-center text-sm text-[var(--mui-palette-text-secondary)]">
              در حال دریافت میزها…
            </p>
          ) : tablesQuery.isError ? (
            <p role="alert" className="py-6 text-sm text-red-600">
              دریافت میزها انجام نشد: {tablesQuery.error.message}
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tablesQuery.data.map((table) => {
                const qrUrl = `${window.location.origin}/menu?table=${table.qr_token}`;
                return (
                  <article
                    key={table.id}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--mui-palette-divider)] p-4"
                  >
                    <div className="shrink-0 rounded-lg bg-white p-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          const canvas = event.currentTarget.querySelector("canvas");
                          if (!canvas) {
                            setErrorMessage("ساخت تصویر QR انجام نشد.");
                            return;
                          }
                          const downloadLink = document.createElement("a");
                          downloadLink.download = `buffiecoffee-table-${table.table_number}.png`;
                          downloadLink.href = canvas.toDataURL("image/png");
                          downloadLink.click();
                        }}
                        aria-label={`دانلود تصویر QR میز ${table.table_number}`}
                        title="برای دانلود PNG کلیک کنید"
                        className="shrink-0 rounded-lg bg-white p-2 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                      >
                      <QRCodeCanvas
                        value={qrUrl}
                        size={120}
                        level="M"
                        title={`QR سفارش میز ${table.table_number}`}
                      />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold">
                        میز {new Intl.NumberFormat("fa-IR").format(table.table_number)}
                      </h3>
                      <p
                        className={`mt-1 text-xs ${
                          table.is_occupied ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {table.is_occupied ? "اشغال" : "آزاد"}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          changeTableAvailability(table.id, !table.is_occupied)
                        }
                        className="mt-2 text-xs font-semibold text-[var(--mui-palette-primary-main)] underline-offset-2 hover:underline"
                      >
                        علامت‌گذاری به‌عنوان {table.is_occupied ? "آزاد" : "اشغال"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">آخرین سفارش‌ها</h2>
              <p className="mt-1 text-sm text-[var(--mui-palette-text-secondary)]">
                وضعیت هر سفارش را همین‌جا به‌روز کن.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dashboardQuery.refetch()}
              className="min-h-10 rounded-lg border border-[var(--mui-palette-divider)] px-4 text-sm font-bold"
            >
              تازه‌سازی
            </button>
            {"Notification" in window && Notification.permission !== "granted" && (
              <button
                type="button"
                onClick={enableNotifications}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--mui-palette-divider)] px-3 text-sm font-bold"
              >
                <Bell size={16} aria-hidden="true" />
                فعال‌سازی اعلان‌ها
              </button>
            )}
          </div>

          {dashboardQuery.isPending ? (
            <p className="py-10 text-center text-[var(--mui-palette-text-secondary)]">
              در حال دریافت اطلاعات…
            </p>
          ) : orders.length === 0 ? (
            <p className="py-10 text-center text-[var(--mui-palette-text-secondary)]">
              هنوز سفارشی ثبت نشده است.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-secondary)]">
                    <th className="px-3 py-3 font-medium">شماره</th>
                    <th className="px-3 py-3 font-medium">مشتری</th>
                    <th className="px-3 py-3 font-medium">تماس</th>
                    <th className="px-3 py-3 font-medium">میز</th>
                    <th className="px-3 py-3 font-medium">مبلغ</th>
                    <th className="px-3 py-3 font-medium">زمان ثبت</th>
                    <th className="px-3 py-3 font-medium">وضعیت سفارش</th>
                    <th className="px-3 py-3 font-medium">فیش</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--mui-palette-divider)] last:border-0"
                    >
                      <td className="px-3 py-4 font-bold">#{order.id}</td>
                      <td className="px-3 py-4">{order.customer_name}</td>
                      <td className="px-3 py-4" dir="ltr">
                        {order.phone}
                      </td>
                      <td className="px-3 py-4">
                        {order.order_type === "dine_in" && order.table_number
                          ? `میز ${new Intl.NumberFormat("fa-IR").format(order.table_number)}`
                          : "—"}
                      </td>
                      <td className="px-3 py-4">
                        {new Intl.NumberFormat("fa-IR").format(order.total_price)}{" "}
                        تومان
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString("fa-IR")}
                      </td>
                      <td className="px-3 py-4">
                        <select
                          aria-label={`وضعیت سفارش ${order.id}`}
                          value={order.status}
                          onChange={(event) =>
                            changeOrderStatus(order.id, event.target.value)
                          }
                          className="min-h-10 rounded-lg border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-3"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => handlePrintOrder(order)}
                          aria-label={`چاپ فیش سفارش ${order.id}`}
                          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--mui-palette-divider)] px-2 text-xs font-bold"
                        >
                          <Printer size={15} aria-hidden="true" />
                          چاپ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </section>
          <aside className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle size={20} aria-hidden="true" />
            آماده و در معرض تأخیر
          </h2>
          <p className="mt-2 text-xs leading-6 opacity-80">
            سفارش‌های آماده و سفارش‌های در انتظار/آماده‌سازی که بیش از ۵ دقیقه از ثبتشان گذشته.
          </p>
          <div className="mt-4 space-y-3">
            {dashboardQuery.data?.attentionOrders.map((order) => {
                const isDelayed = order.status !== "ready";
                return (
                  <article
                    key={order.id}
                    className="rounded-xl border border-amber-900/10 bg-white/70 p-3 dark:bg-black/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">
                        سفارش #{order.id}
                        {order.order_type === "dine_in" && order.table_number
                          ? ` · میز ${new Intl.NumberFormat("fa-IR").format(order.table_number)}`
                          : ""}
                      </p>
                      <span className="text-xs font-bold">
                        {isDelayed ? "در معرض تأخیر" : "آماده"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{order.customer_name}</p>
                    <p className="mt-1 text-xs opacity-75">
                      ثبت: {new Date(order.created_at).toLocaleTimeString("fa-IR")}
                    </p>
                  </article>
                );
              })}
            {dashboardQuery.data?.attentionOrders.length === 0 && (
              <p className="py-4 text-center text-sm opacity-75">
                فعلاً سفارشی در این فهرست نیست.
              </p>
            )}
          </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
        <Icon aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-[var(--mui-palette-text-secondary)]">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
    </article>
  );
}

function DashboardNotice({ children }) {
  return (
    <main
      dir="rtl"
      className="grid min-h-[50vh] place-items-center px-4 text-center text-[var(--mui-palette-text-primary)]"
    >
      {children}
    </main>
  );
}
