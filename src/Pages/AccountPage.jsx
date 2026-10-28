import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import { getMyOrders, rateProduct } from "../api/accountAPI";
import StarRate from "../Components/RatingStar";
import TurnstileWidget from "../Components/TurnstileWidget";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const inputClass =
  "min-h-11 w-full rounded-xl border border-[var(--mui-palette-divider)] bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)]";

const orderStatus = {
  pending: "در انتظار",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};

export default function AccountPage() {
  const { user, isLoading, loadError, login, register, logout, saveProfile } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);
  const [ratingProductSlug, setRatingProductSlug] = useState("");
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["my-orders", user?.username],
    queryFn: getMyOrders,
    enabled: Boolean(user),
  });
  const orders = ordersQuery.data?.results ?? ordersQuery.data ?? [];

  useEffect(() => {
    if (user) {
      if (searchParams.get("next") === "orders") {
        navigate("/orders", { replace: true });
      } else if (searchParams.get("next") === "delivery") {
        navigate("/check?orderType=delivery", { replace: true });
      }
    }
  }, [navigate, searchParams, user]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      if (isRegister) {
        await register({
          username: data.get("username").trim(),
          phone: data.get("phone").trim(),
          password: data.get("password"),
        });
      } else {
        await login(
          data.get("identifier").trim(),
          data.get("password"),
          captchaToken
        );
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
      if (!isRegister) {
        setCaptchaToken("");
        setCaptchaWidgetKey((key) => key + 1);
      }
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");
    setIsSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await saveProfile({
        first_name: data.get("first_name").trim(),
        last_name: data.get("last_name").trim(),
        email: data.get("email").trim(),
        phone: data.get("phone").trim(),
        address: data.get("address").trim(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["my-orders", user.username],
      });
      setMessage("اطلاعات حساب با موفقیت ذخیره شد.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    try {
      await logout();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRateProduct(productSlug, rating) {
    setErrorMessage("");
    setRatingProductSlug(productSlug);
    try {
      await rateProduct(productSlug, rating);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-orders", user.username] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["paginated-products"] }),
      ]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setRatingProductSlug("");
    }
  }

  if (isLoading) {
    return <AccountMessage>در حال بررسی حساب کاربری…</AccountMessage>;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--mui-palette-background-default)] px-4 py-10 text-[var(--mui-palette-text-primary)] sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        {!user ? (
          <section className="mx-auto max-w-lg rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-6 shadow-sm sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
              <UserRound aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-bold">
              {isRegister ? "ساخت حساب کاربری" : "ورود به حساب"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
              {isRegister
                ? "حساب بساز تا اطلاعات و سفارش‌هایت را یکجا مدیریت کنی."
                : "برای دیدن صفحهٔ شخصی و سفارش‌هایت وارد شو."}
            </p>

            {(errorMessage || loadError) && (
              <FormMessage error>{errorMessage || loadError}</FormMessage>
            )}
            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {isRegister ? (
                <>
                  <FormField label="نام کاربری">
                    <input
                      className={inputClass}
                      name="username"
                      autoComplete="username"
                      minLength={3}
                      required
                    />
                  </FormField>
                  <FormField label="شماره تماس">
                    <input
                      className={inputClass}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </FormField>
                </>
              ) : (
                <FormField label="نام کاربری یا شماره تماس">
                  <input
                    className={inputClass}
                    name="identifier"
                    autoComplete="username tel"
                    required
                  />
                </FormField>
              )}
              <FormField label="رمز عبور">
                <input
                  className={inputClass}
                  name="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  minLength={isRegister ? 8 : undefined}
                  required
                />
              </FormField>
              {!isRegister && turnstileSiteKey && (
              <TurnstileWidget
                key={captchaWidgetKey}
                siteKey={turnstileSiteKey}
                onToken={setCaptchaToken}
              />
              )}
              {!isRegister && import.meta.env.PROD && !turnstileSiteKey && (
              <p className="text-sm text-red-600" role="alert">
                کلید عمومی Cloudflare Turnstile برای ورود تنظیم نشده است.
              </p>
              )}
              <button
                className="min-h-11 w-full rounded-xl bg-[var(--mui-palette-primary-main)] px-4 py-3 font-bold text-white disabled:opacity-60 dark:text-[#241812]"
                type="submit"
                disabled={
                  isSubmitting ||
                  (!isRegister &&
                    import.meta.env.PROD &&
                    (!turnstileSiteKey || !captchaToken))
                }
              >
                {isSubmitting
                  ? "لطفاً صبر کنید…"
                  : isRegister
                    ? "ثبت‌نام"
                    : "ورود"}
              </button>
            </form>
            <button
              type="button"
              className="mt-5 w-full text-center text-sm font-bold text-[var(--mui-palette-primary-main)]"
              onClick={() => {
                setIsRegister((current) => !current);
                setErrorMessage("");
                setCaptchaToken("");
              }}
            >
              {isRegister
                ? "قبلاً حساب ساخته‌ای؟ وارد شو"
                : "حساب نداری؟ ثبت‌نام کن"}
            </button>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="flex flex-col gap-4 rounded-3xl bg-[#2b1b12] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <span className="text-sm text-[#e2bc96]">
                  {user.is_staff ? "پنل مدیریت" : "حساب کاربری"}
                </span>
                <h1 className="mt-2 text-2xl font-bold">
                  سلام، {user.first_name || user.username}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  اطلاعات شخصی و سفارش‌هایت را از اینجا مدیریت کن.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {user.is_staff && (
                  <Link
                    to="/admin-panel"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d7b08a] px-4 py-2 font-bold text-[#241812]"
                  >
                    <ShieldCheck size={18} />
                    داشبورد مدیریت
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-bold text-white"
                >
                  <LogOut size={18} />
                  خروج
                </button>
              </div>
            </section>

            {errorMessage && <FormMessage error>{errorMessage}</FormMessage>}
            {message && <FormMessage>{message}</FormMessage>}

            <section className="rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5 sm:p-8">
              <h2 className="text-xl font-bold">اطلاعات شخصی</h2>
              <form
                onSubmit={handleProfileSubmit}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <FormField label="نام">
                  <input
                    className={inputClass}
                    name="first_name"
                    defaultValue={user.first_name}
                    autoComplete="given-name"
                  />
                </FormField>
                <FormField label="نام خانوادگی">
                  <input
                    className={inputClass}
                    name="last_name"
                    defaultValue={user.last_name}
                    autoComplete="family-name"
                  />
                </FormField>
                <FormField label="ایمیل">
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    autoComplete="email"
                    required
                  />
                </FormField>
                <FormField label="شماره تماس">
                  <input
                    className={inputClass}
                    name="phone"
                    type="tel"
                    defaultValue={user.phone}
                    autoComplete="tel"
                  />
                </FormField>
                <FormField label="نشانی" className="sm:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-24`}
                    name="address"
                    defaultValue={user.address}
                    autoComplete="street-address"
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 w-full rounded-xl bg-[var(--mui-palette-primary-main)] px-4 py-3 font-bold text-white disabled:opacity-60 dark:text-[#241812] sm:col-span-2 sm:w-fit"
                >
                  ذخیرهٔ اطلاعات
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5 sm:p-8">
              <h2 className="text-xl font-bold">سفارش‌های من</h2>
              {ordersQuery.error ? (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {ordersQuery.error.message}
                </p>
              ) : ordersQuery.isPending ? (
                <p className="mt-4 text-sm text-[var(--mui-palette-text-secondary)]">
                  در حال دریافت سفارش‌ها…
                </p>
              ) : orders.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--mui-palette-text-secondary)]">
                  هنوز سفارشی با این حساب ثبت نشده است.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-[var(--mui-palette-divider)]">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="space-y-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">سفارش شمارهٔ {order.id}</p>
                          <p className="mt-1 text-sm text-[var(--mui-palette-text-secondary)]">
                            {new Intl.NumberFormat("fa-IR").format(order.total_price)}{" "}
                            تومان ·{" "}
                            {new Date(order.created_at).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--mui-palette-primary-main)]/10 px-3 py-1 text-sm font-bold text-[var(--mui-palette-primary-main)]">
                          {orderStatus[order.status] || order.status}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(order.items ?? []).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mui-palette-divider)] p-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {item.product_name}
                              </p>
                              <p className="mt-1 text-xs text-[var(--mui-palette-text-secondary)]">
                                تعداد: {new Intl.NumberFormat("fa-IR").format(item.quantity)}
                              </p>
                            </div>
                            <div className="shrink-0 text-center">
                              <StarRate
                                rating={Number(item.user_rating ?? 0)}
                                size={24}
                                disabled={ratingProductSlug === item.product_slug}
                                onChange={(rating) =>
                                  handleRateProduct(item.product_slug, rating)
                                }
                              />
                              {ratingProductSlug === item.product_slug && (
                                <p className="mt-1 text-xs text-[var(--mui-palette-text-secondary)]">
                                  در حال ثبت امتیاز…
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function AccountMessage({ children }) {
  return (
    <main
      dir="rtl"
      className="grid min-h-[50vh] place-items-center px-4 text-center text-[var(--mui-palette-text-primary)]"
    >
      {children}
    </main>
  );
}

function FormField({ label, className = "", children }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function FormMessage({ error = false, children }) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-4 rounded-xl p-3 text-sm ${
        error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
      }`}
    >
      {children}
    </p>
  );
}
