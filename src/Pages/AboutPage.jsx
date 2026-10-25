import { ArrowLeft, Coffee, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router";
import FooterBar from "@/HomePageComponents/Footer";

const values = [
  {
    icon: Coffee,
    title: "برای لحظه‌های خوب",
    description:
      "قهوه فقط یک نوشیدنی نیست؛ فرصتی است برای مکث، گفت‌وگو و لذت بردن از لحظه‌های ساده.",
  },
  {
    icon: Heart,
    title: "انتخاب با سلیقهٔ تو",
    description:
      "از قهوه و نوشیدنی تا دسرهای خوشمزه، منو را برای سلیقه‌ها و حال‌وهوای مختلف کنار هم آورده‌ایم.",
  },
  {
    icon: Sparkles,
    title: "تجربه‌ای ساده و دلنشین",
    description:
      "پیدا کردن محصول دلخواه و ثبت سفارش باید به‌اندازهٔ نوشیدن یک فنجان قهوه، راحت و دوست‌داشتنی باشد.",
  },
];

export default function AboutPage() {
  return (
    <div dir="rtl">
      <div
        className="min-h-screen bg-[var(--mui-palette-background-default)] text-[var(--mui-palette-text-primary)]"
      >
        <section className="relative isolate flex min-h-[360px] items-center overflow-hidden bg-[#21140c] px-5 py-16 sm:min-h-[420px] sm:px-8 lg:px-12">
          <img
            src="/Hero/mainPageFooter.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[20%_55%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-l from-[#1b1009]/95 via-[#1b1009]/80 to-[#1b1009]/25"
          />
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-[#e8c49f] backdrop-blur-sm">
                <Coffee aria-hidden="true" size={16} />
                آشنایی با بافی کافی
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
                داستان ما، با یک
                <br className="hidden sm:block" /> فنجان قهوه شروع می‌شود
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/80 sm:text-base">
                بافی کافی جایی برای پیدا کردن نوشیدنی و خوراکی دلخواه توست؛
                انتخابی ساده برای لحظه‌هایی که دوست داری کمی خوش‌طعم‌تر باشند.
              </p>
              <Link
                to="/shop"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#d7b08a] px-5 py-3 font-bold text-[#241812] transition hover:-translate-y-0.5 hover:bg-[#e5c5a4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                دیدن منو
                <ArrowLeft aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold text-[var(--mui-palette-primary-main)]">
              چیزی که برایمان مهم است
            </span>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              قهوه، با حال خوب همراه است
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--mui-palette-text-secondary)] sm:text-base">
              ما می‌خواهیم انتخاب کردن و سفارش دادن، شروع یک تجربهٔ خوب باشد.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
                  <Icon aria-hidden="true" size={23} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-14 w-[calc(100%-2.5rem)] max-w-7xl rounded-3xl bg-[#2b1b12] px-5 py-9 text-center text-white sm:mb-20 sm:px-10 sm:py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            آماده‌ای قهوهٔ بعدی‌ات را پیدا کنی؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            سری به منو بزن و چیزی را انتخاب کن که حال امروزت را بهتر می‌کند.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d7b08a] px-5 py-3 text-sm font-bold text-[#241812] transition hover:bg-[#e5c5a4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            رفتن به فروشگاه
            <ArrowLeft aria-hidden="true" size={17} />
          </Link>
        </section>
      </div>
      <FooterBar />
    </div>
  );
}
