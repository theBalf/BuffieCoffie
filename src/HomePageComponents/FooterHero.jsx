import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function FooterHero() {
  return (
    <section
      dir="rtl"
      aria-labelledby="footer-promo-title"
      className="mx-auto my-12 w-[calc(100%-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-[#21140c] shadow-[0_24px_70px_-35px_rgba(48,26,12,0.7)] sm:my-16 sm:w-[calc(100%-3rem)]"
    >
      <div className="relative isolate flex min-h-[340px] items-end overflow-hidden px-6 py-8 sm:min-h-[390px] sm:items-center sm:px-10 sm:py-12 lg:min-h-[430px] lg:px-16">
        <img
          src="/Hero/mainPageFooter.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[20%_65%] sm:object-[left_68%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1b1009]/95 via-[#1b1009]/75 to-[#1b1009]/10 sm:bg-gradient-to-l sm:from-[#1b1009]/95 sm:via-[#1b1009]/80 sm:to-[#1b1009]/5"
        />

        <div className="max-w-xl text-right text-white">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-medium text-[#e8c49f] backdrop-blur-sm sm:text-sm">
            <Sparkles aria-hidden="true" size={15} />
            تجربه‌ای گرم، از اولین جرعه
          </span>

          <h2
            id="footer-promo-title"
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            قهوه‌ی بعدی‌ات
            <br className="hidden sm:block" /> منتظر توست
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-7 text-white/80 sm:mt-4 sm:text-base">
            از میان قهوه‌های تازه‌دم و خوراکی‌های محبوبت انتخاب کن؛ ما با دقت
            آماده‌شان می‌کنیم.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#d7b08a] px-5 py-3 text-sm font-bold text-[#241812] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#e5c5a4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-7 sm:px-6 sm:text-base"
          >
            دیدن منو
            <ArrowLeft aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
