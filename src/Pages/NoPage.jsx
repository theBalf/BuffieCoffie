import { Coffee, Home } from "lucide-react";
import { NavLink } from "react-router";

export default function NotFoundPage() {
  return (
    <>
      <main
        dir="rtl"
        className="
        flex min-h-[calc(100vh-64px)] items-center justify-center
        bg-[#F8F3EC] px-5 py-12
        text-[#2B1B12]
        dark:bg-[#17100C]
        dark:text-[#F8F3EC]
      "
      >
        <section className="w-full max-w-xl text-center">
          <div
            className="
            mx-auto mb-6 flex h-24 w-24
            items-center justify-center rounded-full
            bg-[#E8D5C5]
            dark:bg-[#3A281F]
          "
          >
            <Coffee size={48} className="text-[#6F4E37] dark:text-[#D7B08A]" />
          </div>

          <p className="text-7xl font-extrabold text-[#C98A4B]">۴۰۴</p>

          <h1 className="mt-4 text-2xl font-bold md:text-4xl">
            این صفحه پیدا نشد!
          </h1>

          <p
            className="
            mx-auto mt-4 max-w-md
            text-sm leading-7 text-[#7C6A5F]
            md:text-base
            dark:text-[#C8B8AA]
          "
          >
            انگار آدرس را اشتباه آمدی؛ بیا برگردیم به کافه و با هم یک فنجان قهوه
            بزنیم.
          </p>

          <NavLink
            to="/"
            className="
            mt-8 inline-flex min-h-11
            items-center justify-center gap-2
            rounded-xl bg-[#6F4E37]
            px-6 py-3 text-sm font-bold text-white
            transition-all duration-300
            hover:-translate-y-1 hover:bg-[#8B6A55]
            hover:shadow-lg active:scale-95
            dark:bg-[#D7B08A]
            dark:text-[#241812]
          "
          >
            <Home size={19} />
            برگشت به کافه
          </NavLink>
        </section>
      </main>
    </>
  );
}
