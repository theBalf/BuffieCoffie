import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/Context/CartProvider";
import { createOrder } from "@/api/ordersAPI";
import { useAuth } from "../Context/AuthContext";
import {
  getCafeTableByQrToken,
  getCafeTables,
  rememberGuestOrder,
} from "../api/accountAPI";

export default function CheckoutPage() {
  const { cartItems, totalProducts, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableToken =
    searchParams.get("table") ||
    window.sessionStorage.getItem("cafe-table-qr-token") ||
    "";
  const [orderType, setOrderType] = useState(
    tableToken
      ? "dine_in"
      : user && searchParams.get("orderType") === "delivery"
        ? "delivery"
        : "takeaway"
  );
  const [selectedTable, setSelectedTable] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const qrTableQuery = useQuery({
    queryKey: ["cafe-table-qr", tableToken],
    queryFn: () => getCafeTableByQrToken(tableToken),
    enabled: Boolean(tableToken),
    retry: false,
  });
  const tablesQuery = useQuery({
    queryKey: ["cafe-tables"],
    queryFn: getCafeTables,
    enabled: orderType === "dine_in" && !tableToken,
  });
  const effectiveOrderType = tableToken ? "dine_in" : orderType;

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("سبد خرید شما خالی است.");
      return;
    }
    if (!user && orderType === "delivery") {
      setErrorMessage("برای سفارش با پیک، ابتدا وارد حساب کاربری شوید.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const order = {
      customer_name: formData.get("customer_name").trim(),
      phone: formData.get("phone").trim(),
      order_type: effectiveOrderType,
      note: formData.get("note").trim(),
      items: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
    };

    if (effectiveOrderType === "dine_in") {
      order.table_number = tableToken
        ? qrTableQuery.data?.table_number
        : Number(formData.get("table_number"));
      if (tableToken) {
        order.table_token = tableToken;
      }
    }
    if (effectiveOrderType === "delivery") {
      order.address = formData.get("address").trim();
    }

    setIsSubmitting(true);
    try {
      const createdOrder = await createOrder(order);
      clearCart();
      window.sessionStorage.removeItem("cafe-table-qr-token");
      let guestOrderSaved = true;
      let guestOrderError = "";
      if (!user) {
        try {
          rememberGuestOrder(createdOrder);
        } catch (error) {
          guestOrderSaved = false;
          guestOrderError = error.message;
        }
      }
      navigate(user ? "/done" : "/done?guest=true", {
        state: {
          orderId: createdOrder.id,
          guestOrderSaved,
          guestOrderError,
        },
      });
    } catch (error) {
      setErrorMessage(error.message || "ثبت سفارش انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen py-6 sm:py-10"
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1
          className="mb-8 text-center text-2xl font-bold"
          style={{
            color: "var(--mui-palette-text-primary)",
          }}
        >
          تکمیل سفارش
        </h1>

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-[1fr_320px]
          "
        >
          <section
            className="
              rounded-2xl
              border
              border-[var(--mui-palette-divider)]
              bg-[var(--mui-palette-background-paper)]
              p-4 sm:p-6
            "
          >
            {cartItems.length === 0 ? (
              <div className="text-center">
                <p className="mb-4">سبد خرید شما خالی است.</p>
                <Link
                  to="/shop"
                  className="font-bold text-[var(--mui-palette-primary-main)]"
                >
                  بازگشت به فروشگاه
                </Link>
              </div>
            ) : (
              <form
                key={user?.username ?? "guest"}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold">اطلاعات سفارش</h2>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    {errorMessage}
                  </p>
                )}

                <label className="block space-y-2">
                  <span className="text-sm font-medium">نام و نام خانوادگی</span>
                  <input
                    name="customer_name"
                    type="text"
                    maxLength={120}
                    autoComplete="name"
                    defaultValue={
                      user
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : ""
                    }
                    required
                    className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">شماره تماس</span>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={30}
                    autoComplete="tel"
                    defaultValue={user?.phone ?? ""}
                    required
                    className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">نوع سفارش</span>
                  <select
                    name="order_type"
                    value={orderType}
                    onChange={(event) => setOrderType(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-4 py-3 text-base text-[var(--mui-palette-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                  >
                    {tableToken ? (
                      <option
                        className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-text-primary)]"
                        value="dine_in"
                      >
                        صرف در کافه
                      </option>
                    ) : (
                      <>
                        <option className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-text-primary)]" value="takeaway">بیرون‌بر</option>
                        <option className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-text-primary)]" value="dine_in">صرف در کافه</option>
                        <option className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-text-primary)]" value="delivery" disabled={!user}>
                          {user ? "ارسال با پیک" : "ارسال با پیک (نیازمند ورود)"}
                        </option>
                      </>
                    )}
                  </select>
                  {!user && !tableToken && (
                    <p className="text-sm text-[var(--mui-palette-text-secondary)]">
                      برای سفارش با پیک،{" "}
                      <Link
                        to="/account?next=delivery"
                        className="font-bold text-[var(--mui-palette-primary-main)] underline"
                      >
                        وارد حساب کاربری شوید
                      </Link>
                      . صرف در کافه و بیرون‌بر بدون ورود فعال است.
                    </p>
                  )}
                </label>

                {effectiveOrderType === "dine_in" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">شماره میز</span>
                    {tableToken ? (
                      <div
                        className="min-h-11 rounded-xl border border-[var(--mui-palette-divider)] bg-black/5 px-4 py-3 dark:bg-white/5"
                        aria-live="polite"
                      >
                        {qrTableQuery.isPending
                          ? "در حال بررسی QR میز…"
                          : qrTableQuery.isError
                            ? qrTableQuery.error.message
                            : qrTableQuery.data.is_occupied
                              ? `میز ${new Intl.NumberFormat("fa-IR").format(qrTableQuery.data.table_number)} اشغال است`
                              : `میز ${new Intl.NumberFormat("fa-IR").format(qrTableQuery.data.table_number)}`}
                      </div>
                    ) : (
                      <>
                        <select
                          name="table_number"
                          value={selectedTable}
                          onChange={(event) => setSelectedTable(event.target.value)}
                          required
                          disabled={tablesQuery.isPending || tablesQuery.isError}
                          className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-4 py-3 text-base text-[var(--mui-palette-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)] disabled:opacity-60"
                        >
                          <option value="">
                            {tablesQuery.isPending
                              ? "در حال دریافت میزها…"
                              : "انتخاب میز"}
                          </option>
                          {(tablesQuery.data ?? []).map((table) => (
                            <option
                              key={table.id}
                              value={table.table_number}
                              disabled={table.is_occupied}
                            >
                              میز {new Intl.NumberFormat("fa-IR").format(table.table_number)}
                              {table.is_occupied ? " (اشغال)" : ""}
                            </option>
                          ))}
                        </select>
                        {tablesQuery.isError && (
                          <span role="alert" className="text-sm text-red-600">
                            دریافت وضعیت میزها انجام نشد: {tablesQuery.error.message}
                          </span>
                        )}
                      </>
                    )}
                  </label>
                )}

                {effectiveOrderType === "delivery" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">نشانی ارسال</span>
                    <textarea
                      name="address"
                      rows="3"
                      defaultValue={user?.address ?? ""}
                      required
                      className="min-h-11 w-full resize-y rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                    />
                  </label>
                )}

                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    توضیحات سفارش (اختیاری)
                  </span>
                  <textarea
                    name="note"
                    rows="3"
                    className="min-h-11 w-full resize-y rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (effectiveOrderType === "dine_in" &&
                      (tableToken
                        ? qrTableQuery.isPending ||
                          qrTableQuery.isError ||
                          qrTableQuery.data?.is_occupied
                        : tablesQuery.isPending ||
                          tablesQuery.isError ||
                          !selectedTable))
                  }
                  className="w-full rounded-xl bg-[var(--mui-palette-primary-main)] px-4 py-3 font-bold text-white transition-opacity disabled:opacity-60"
                >
                  {isSubmitting ? "در حال ثبت سفارش..." : "ثبت سفارش"}
                </button>
              </form>
            )}
          </section>

          <aside
            className="
              order-first
              h-fit
              rounded-2xl
              border
              border-[var(--mui-palette-divider)]
              bg-[var(--mui-palette-background-paper)]
              p-5
              lg:order-last
            "
          >
            <h2 className="font-bold">خلاصه سفارش</h2>

            <p className="mt-4">تعداد: {totalProducts}</p>

            {cartItems.map((item) => (
              <p key={item.id} className="mt-2 text-sm">
                {item.name} × {item.quantity}
              </p>
            ))}

            <p className="mt-2 font-bold">
              {Number(totalPrice).toLocaleString("fa-IR")} تومان
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
