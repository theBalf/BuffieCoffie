import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/Context/CartProvider";
import { createOrder } from "@/api/ordersAPI";

export default function CheckoutPage() {
  const { cartItems, totalProducts, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState("takeaway");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("سبد خرید شما خالی است.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const order = {
      customer_name: formData.get("customer_name").trim(),
      phone: formData.get("phone").trim(),
      order_type: orderType,
      note: formData.get("note").trim(),
      items: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
    };

    if (orderType === "dine_in") {
      order.table_number = Number(formData.get("table_number"));
    }
    if (orderType === "delivery") {
      order.address = formData.get("address").trim();
    }

    setIsSubmitting(true);
    try {
      await createOrder(order);
      clearCart();
      navigate("/done");
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
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                  >
                    <option value="takeaway">بیرون‌بر</option>
                    <option value="dine_in">صرف در کافه</option>
                    <option value="delivery">ارسال با پیک</option>
                  </select>
                </label>

                {orderType === "dine_in" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">شماره میز</span>
                    <input
                      name="table_number"
                      type="number"
                      min="1"
                      required
                      className="min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]"
                    />
                  </label>
                )}

                {orderType === "delivery" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">نشانی ارسال</span>
                    <textarea
                      name="address"
                      rows="3"
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
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[var(--mui-palette-primary-main)] px-4 py-3 font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
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
