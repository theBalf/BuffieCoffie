import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/Context/CartProvider";

export default function ShopDone() {
  const navigate = useNavigate();
  const clearCart = useCart();
  const [counter, setCounter] = useState(5);

  useEffect(() => {
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
  }, [navigate, clearCart]);

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

        <div
          className="
            mt-6
            text-lg
            font-bold
          "
          style={{
            color: "var(--mui-palette-primary-main)",
          }}
        >
          بازگشت به صفحه اصلی در {counter} ثانیه
        </div>

        <Link
          to="/"
          className="
            mt-6
            inline-block
            rounded-xl
            bg-[var(--mui-palette-primary-main)]
            px-6
            py-3
            font-bold
            text-white
          "
        >
          بازگشت فوری
        </Link>
      </div>
    </main>
  );
}
