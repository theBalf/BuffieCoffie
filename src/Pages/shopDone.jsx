import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

export default function ShopDone() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isGuestOrder = searchParams.get("guest") === "true";
  const { orderId, guestOrderSaved, guestOrderError } = location.state ?? {};
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    if (isGuestOrder) return undefined;

    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGuestOrder, navigate]);

  return (
    <main
      dir="rtl"
      className="
        flex
        min-h-screen
        items-center
        justify-center
        px-4
      "
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-[var(--mui-palette-background-paper)]
          p-8
          text-center
          shadow-lg
        "
      >
        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-green-100
            text-4xl
          "
        >
          ✓
        </div>

        <h1
          className="
            mt-6
            text-2xl
            font-bold
          "
          style={{
            color: "var(--mui-palette-text-primary)",
          }}
        >
          سفارش شما ثبت شد 🎉
        </h1>

        <p
          className="
            mt-4
            leading-8
          "
          style={{
            color: "var(--mui-palette-text-secondary)",
          }}
        >
          ممنون که از فروشگاه ما خرید کردید.
          <br />
          سفارش شما در حال آماده‌سازی است.
        </p>

        {isGuestOrder ? (
          <>
            {orderId && (
              <p className="mt-3 text-sm font-bold text-[var(--mui-palette-text-primary)]">
                شماره سفارش: {new Intl.NumberFormat("fa-IR").format(orderId)}
              </p>
            )}
            <p className="mt-4 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
              با ما همراه شوید تا پیگیری سفارش‌هایتان در حساب کاربری راحت‌تر باشد.
            </p>
            {guestOrderSaved === false && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                سفارش ثبت شد، اما ذخیرهٔ اطلاعات پیگیری در این مرورگر انجام نشد.
                {guestOrderError ? ` ${guestOrderError}` : ""}
              </p>
            )}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/account?next=orders"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--mui-palette-primary-main)] px-6 py-3 font-bold text-white dark:text-[#241812]"
              >
                ورود یا ثبت‌نام برای پیگیری سفارش
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--mui-palette-divider)] px-6 py-3 font-bold text-[var(--mui-palette-text-primary)]"
              >
                بعداً
              </Link>
            </div>
          </>
        ) : (
          <>
            <div
              className="mt-6 text-lg font-bold"
              style={{ color: "var(--mui-palette-primary-main)" }}
            >
              بازگشت به صفحه اصلی در {counter} ثانیه
            </div>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-[var(--mui-palette-primary-main)] px-6 py-3 font-bold text-white"
            >
              بازگشت فوری
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
