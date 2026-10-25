import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { getMyOrders } from "../api/accountAPI";

const orderStatus = {
  pending: "در انتظار",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};

const formatPrice = (price) =>
  `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;

function CenteredMessage({ children }) {
  return (
    <div
      dir="rtl"
      className="grid min-h-[60vh] place-items-center px-4 py-12 text-center text-[var(--mui-palette-text-primary)]"
    >
      {children}
    </div>
  );
}

function ActionLink({ to, children, icon: Icon }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--mui-palette-primary-main)] px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 dark:text-[#241812]"
    >
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </Link>
  );
}

export default function OrdersPage() {
  const { user, isLoading, loadError } = useAuth();
  const ordersQuery = useQuery({
    queryKey: ["my-orders", user?.username],
    queryFn: getMyOrders,
    enabled: Boolean(user),
  });
  const orders = ordersQuery.data?.results ?? ordersQuery.data ?? [];

  if (isLoading) {
    return (
      <CenteredMessage>
        <p>در حال بررسی حساب کاربری…</p>
      </CenteredMessage>
    );
  }

  if (!user) {
    return (
      <CenteredMessage>
        <section className="w-full max-w-lg rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-8 shadow-sm sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
            <UserRound aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">با ما همراه شوید</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
            برای مشاهدهٔ سفارش‌هایتان وارد حساب کاربری شوید یا یک حساب بسازید.
          </p>
          {loadError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {loadError}
            </p>
          )}
          <div className="mt-6">
            <ActionLink to="/account" icon={UserRound}>
              ورود یا ثبت‌نام
            </ActionLink>
          </div>
        </section>
      </CenteredMessage>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen px-4 py-8 text-[var(--mui-palette-text-primary)] sm:px-6 sm:py-10"
      style={{ backgroundColor: "var(--mui-palette-background-default)" }}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">سفارش‌های من</h1>
          <p className="mt-2 text-sm text-[var(--mui-palette-text-secondary)]">
            سفارش‌های ثبت‌شده با حساب کاربری شما
          </p>
        </header>

        {ordersQuery.isPending ? (
          <div className="space-y-4" aria-label="در حال دریافت سفارش‌ها">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)]"
              />
            ))}
          </div>
        ) : ordersQuery.isError ? (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            دریافت سفارش‌ها انجام نشد: {ordersQuery.error.message}
          </p>
        ) : orders.length === 0 ? (
          <section className="rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-6 py-12 text-center shadow-sm sm:px-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
              <ShoppingBag aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold sm:text-2xl">
              اولین سفارش شما افتخار ماست
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
              برای دیدن محصولات و ثبت سفارش، سری به فروشگاه بزنید.
            </p>
            <div className="mt-6">
              <ActionLink to="/shop">افتخار می‌دهید؟</ActionLink>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-4 shadow-sm sm:p-6"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mui-palette-divider)] pb-4">
                  <div>
                    <h2 className="font-bold">سفارش شمارهٔ {order.id}</h2>
                    <p className="mt-1 text-sm text-[var(--mui-palette-text-secondary)]">
                      {new Date(order.created_at).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--mui-palette-primary-main)]/10 px-3 py-1 text-sm font-bold text-[var(--mui-palette-primary-main)]">
                    {orderStatus[order.status] || order.status}
                  </span>
                </header>

                <ul className="divide-y divide-[var(--mui-palette-divider)]">
                  {(order.items ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {item.product_name}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--mui-palette-text-secondary)]">
                          تعداد: {new Intl.NumberFormat("fa-IR").format(item.quantity)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatPrice(item.total_price)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 border-t border-[var(--mui-palette-divider)] pt-4 text-left font-bold">
                  مبلغ کل: {formatPrice(order.total_price)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
