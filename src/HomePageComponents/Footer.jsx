import { ArrowUp, Coffee } from "lucide-react";
import { Link } from "react-router";

const footerLinks = [
  { label: "صفحه اصلی", to: "/" },
  { label: "فروشگاه", to: "/shop" },
  { label: "سبد خرید", to: "/cart" },
];

export default function FooterBar() {
  return (
    <footer
      dir="rtl"
      className="border-t border-white/10 bg-[#1b120d] text-[#f7eee5]"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-9 px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12 lg:px-12">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg text-[#e2bc96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2bc96]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d7b08a]/10">
              <Coffee aria-hidden="true" size={23} />
            </span>
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              BuffieCoffee
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#c8b8aa]">
            یک فنجان قهوه‌ی خوب، بهانه‌ای برای مکث و لذت بردن از لحظه‌هاست.
          </p>
        </div>

        <nav aria-label="لینک‌های فروشگاه">
          <h2 className="text-sm font-bold text-white sm:text-base">
            دسترسی سریع
          </h2>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex min-h-8 items-center text-sm text-[#c8b8aa] transition-colors hover:text-[#e2bc96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2bc96]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-white sm:text-base">
            همراه ما باشید
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#c8b8aa]">
            برای دیدن محصولات و انتخاب قهوه‌ی موردعلاقه‌ات، به فروشگاه سر بزن.
          </p>
          <Link
            to="/shop"
            className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#e2bc96] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2bc96]"
          >
            رفتن به فروشگاه
            <ArrowUp aria-hidden="true" size={16} className="rotate-45" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 text-center text-xs text-[#aa9787] sm:flex-row sm:px-8 sm:text-right lg:px-12">
          <p>© {new Date().getFullYear()} BuffieCoffee. تمامی حقوق محفوظ است.</p>
          <a
            href="#navBarWrapper"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2bc96]"
          >
            بازگشت به بالا
            <ArrowUp aria-hidden="true" size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
