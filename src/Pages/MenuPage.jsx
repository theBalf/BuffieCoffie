import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useCart } from "../Context/CartProvider";
import { getCafeTableByQrToken } from "../api/accountAPI";
import { getAllProducts } from "../api/productsAPI";

const menuCategories = [
  { slug: "desserts", name: "دسر" },
  { slug: "coffee", name: "قهوه" },
  { slug: "hot-drinks", name: "نوشیدنی گرم" },
  { slug: "cold-drinks", name: "نوشیدنی سرد" },
];

const formatPrice = (price) =>
  `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTableToken = searchParams.get("table") || "";
  const [storedQrToken, setStoredQrToken] = useState(
    () =>
      queryTableToken ||
      window.sessionStorage.getItem("cafe-table-qr-token") ||
      ""
  );
  const qrToken = queryTableToken || storedQrToken;
  const featuredOnly = searchParams.get("featured") === "true";
  const {
    cartItems,
    addToCart,
    increaseProductInCart,
    reduceProductInCart,
    totalProducts,
    totalPrice,
  } = useCart();

  const {
    data: productsByCategory = {},
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["cafe-menu-products"],
    queryFn: async () => {
      const entries = await Promise.all(
        menuCategories.map(async ({ slug }) => [
          slug,
          await getAllProducts(slug),
        ])
      );
      return Object.fromEntries(entries);
    },
  });
  const qrTableQuery = useQuery({
    queryKey: ["cafe-table-qr", qrToken],
    queryFn: () => getCafeTableByQrToken(qrToken),
    enabled: Boolean(qrToken),
    retry: false,
  });

  useEffect(() => {
    if (queryTableToken) {
      window.sessionStorage.setItem("cafe-table-qr-token", queryTableToken);
    }
  }, [queryTableToken]);

  function clearQrTable() {
    const params = new URLSearchParams(searchParams);
    params.delete("table");
    setSearchParams(params, { replace: true });
    setStoredQrToken("");
    window.sessionStorage.removeItem("cafe-table-qr-token");
  }

  if (isError) {
    return (
      <main
        dir="rtl"
        className="min-h-screen px-4 py-16 text-center text-[var(--mui-palette-error-main)]"
      >
        {error.message}
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className={`min-h-screen py-8 sm:py-12 ${totalProducts > 0 ? "pb-32" : ""}`}
      style={{ backgroundColor: "var(--mui-palette-background-default)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold text-[var(--mui-palette-text-primary)] sm:text-3xl">
            منوی کافه
          </h1>
        </header>

        {qrToken && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--mui-palette-primary-main)]/30 bg-[var(--mui-palette-primary-main)]/5 px-4 py-3 text-sm">
            <p className="font-semibold text-[var(--mui-palette-text-primary)]">
              {qrTableQuery.isPending
                ? "در حال بررسی میز…"
                : qrTableQuery.isError
                  ? qrTableQuery.error.message
                  : qrTableQuery.data.is_occupied
                    ? `میز ${new Intl.NumberFormat("fa-IR").format(qrTableQuery.data.table_number)} اشغال است`
                    : `سفارش برای میز ${new Intl.NumberFormat("fa-IR").format(qrTableQuery.data.table_number)} ثبت خواهد شد.`}
            </p>
            <button
              type="button"
              onClick={clearQrTable}
              className="font-semibold text-[var(--mui-palette-primary-main)]"
            >
              لغو انتخاب میز
            </button>
          </div>
        )}

        <nav
          aria-label="دسته‌بندی‌های منو"
          className="sticky top-0 z-20 mb-6 flex gap-2 overflow-x-auto bg-[var(--mui-palette-background-default)] py-2"
        >
          {menuCategories.map((category) => (
            <a
              key={category.slug}
              href={`#${category.slug}`}
              className="shrink-0 rounded-full border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-4 py-2 text-sm font-semibold text-[var(--mui-palette-text-primary)] transition-colors hover:border-[var(--mui-palette-primary-main)] hover:text-[var(--mui-palette-primary-main)]"
            >
              {category.name}
            </a>
          ))}
        </nav>

        {isPending ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {menuCategories.map((category) => (
              <section
                key={category.slug}
                className="rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-4 sm:p-5"
              >
                <div className="mb-4 h-6 w-28 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 animate-pulse rounded bg-black/5 dark:bg-white/5"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {menuCategories.map((category) => {
              const products = (productsByCategory[category.slug] ?? []).filter(
                (product) => !featuredOnly || product.is_featured
              );

              return (
                <section
                  key={category.slug}
                  id={category.slug}
                  className="scroll-mt-20 rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-4 shadow-sm sm:p-5"
                >
                  <h2 className="mb-3 border-b border-[var(--mui-palette-divider)] pb-3 text-lg font-bold text-[var(--mui-palette-primary-main)] sm:text-xl">
                    {category.name}
                  </h2>

                  {products.length === 0 ? (
                    <p className="py-3 text-sm text-[var(--mui-palette-text-secondary)]">
                      محصولی در این دسته موجود نیست.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[var(--mui-palette-divider)]">
                      {products.map((product) => {
                        const cartItem = cartItems.find(
                          (item) => item.id === product.id
                        );
                        const quantity = cartItem?.quantity ?? 0;
                        const available =
                          product.is_available && Number(product.stock) > 0;
                        const stockLimitReached =
                          quantity >= Number(product.stock);
                        const hasDiscount =
                          Number(product.discount_percentage) > 0;

                        return (
                          <li
                            key={product.id}
                            className="flex min-h-14 items-center gap-2 py-2.5 sm:gap-4"
                          >
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--mui-palette-text-primary)] sm:text-base">
                              {product.name}
                            </span>

                            <span className="flex shrink-0 flex-col items-end leading-tight">
                              <span className="text-sm font-bold text-[var(--mui-palette-text-primary)]">
                                {formatPrice(
                                  product.discounted_price ?? product.price
                                )}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-[var(--mui-palette-text-secondary)] line-through">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </span>

                            {quantity === 0 ? (
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                disabled={!available}
                                aria-label={`افزودن ${product.name} به سبد خرید`}
                                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--mui-palette-primary-main)] transition-colors hover:bg-[var(--mui-palette-primary-main)]/10 disabled:cursor-not-allowed disabled:text-[var(--mui-palette-text-secondary)]"
                              >
                                {available ? (
                                  <>
                                    <Plus size={15} aria-hidden="true" />
                                    افزودن
                                  </>
                                ) : (
                                  "ناموجود"
                                )}
                              </button>
                            ) : (
                              <div
                                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg bg-[var(--mui-palette-primary-main)]/10 px-1"
                                aria-label={`تعداد ${product.name} در سبد: ${quantity}`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseProductInCart(product.id)
                                  }
                                  disabled={!available || stockLimitReached}
                                  aria-label={`افزودن یک ${product.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--mui-palette-primary-main)] transition-colors hover:bg-[var(--mui-palette-primary-main)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Plus size={15} aria-hidden="true" />
                                </button>
                                <span className="min-w-4 text-center text-sm font-bold text-[var(--mui-palette-text-primary)]">
                                  {new Intl.NumberFormat("fa-IR").format(
                                    quantity
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reduceProductInCart(product.id)
                                  }
                                  aria-label={`کم‌کردن یک ${product.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--mui-palette-primary-main)] transition-colors hover:bg-[var(--mui-palette-primary-main)]/10"
                                >
                                  <Minus size={15} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
      {totalProducts > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:bottom-5 md:px-4 md:pb-0">
          <button
            type="button"
            onClick={() =>
              navigate(
                qrToken ? `/check?table=${encodeURIComponent(qrToken)}` : "/check"
              )
            }
            className="mx-auto flex min-h-14 w-full max-w-lg items-center justify-between gap-3 rounded-2xl bg-[var(--mui-palette-primary-main)] px-4 py-3 text-white shadow-[0_6px_0_rgba(57,35,22,0.9),0_10px_18px_rgba(0,0,0,0.2)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_7px_0_rgba(57,35,22,0.9),0_12px_20px_rgba(0,0,0,0.22)] active:translate-y-1 active:shadow-[0_2px_0_rgba(57,35,22,0.9),0_4px_10px_rgba(0,0,0,0.2)] dark:text-[#241812]"
          >
            <span className="flex items-center gap-2 font-bold">
              <ShoppingBag size={20} aria-hidden="true" />
              <span>تکمیل سفارش</span>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-sm">
                {new Intl.NumberFormat("fa-IR").format(totalProducts)}
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm font-bold sm:text-base">
              <span>
                {new Intl.NumberFormat("fa-IR").format(totalPrice)} تومان
              </span>
              <ArrowLeft size={18} aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
    </main>
  );
}
