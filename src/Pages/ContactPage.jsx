import { ArrowUpLeft, Code2, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import FooterBar from "@/HomePageComponents/Footer";

const email = "Arashhosseiny8@gmail.com";
const repositoryUrl = "https://github.com/theBalf/BuffieCoffie";
const emailUrl = `mailto:${email}?subject=${encodeURIComponent("پیام به بافی کافی")}`;

const contactOptions = [
  {
    icon: Mail,
    eyebrow: "ایمیل",
    title: email,
    description: "برای پرسش‌ها و پیشنهادها، برایمان ایمیل بفرست.",
    href: emailUrl,
    action: "ارسال ایمیل",
    external: false,
  },
  {
    icon: Code2,
    eyebrow: "گیت‌هاب",
    title: "پروژهٔ بافی کافی",
    description: "کد و تغییرات پروژه را در مخزن گیت‌هاب ببین.",
    href: repositoryUrl,
    action: "مشاهدهٔ مخزن",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div dir="rtl">
      <div className="min-h-screen bg-[var(--mui-palette-background-default)] text-[var(--mui-palette-text-primary)]">
        <section className="relative isolate overflow-hidden bg-[#21140c] px-5 py-16 text-white sm:px-8 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(215,176,138,0.2),transparent_55%)]"
          />
          <div className="mx-auto max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-[#e8c49f]">
              <MessageCircle aria-hidden="true" size={16} />
              همیشه خوشحال می‌شویم صدایت را بشنویم
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              ارتباط با ما
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75 sm:text-base">
              سوال، پیشنهاد یا نظری داری؟ از راه‌های زیر با ما در تماس باش؛
              پیام‌هایت به ما کمک می‌کنند تجربهٔ بافی کافی بهتر شود.
            </p>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 lg:gap-7 lg:px-12">
          {contactOptions.map(
            ({
              icon: Icon,
              eyebrow,
              title,
              description,
              href,
              action,
              external,
            }) => (
              <article
                key={eyebrow}
                className="flex flex-col rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] p-6 shadow-sm sm:p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mui-palette-primary-main)]/10 text-[var(--mui-palette-primary-main)]">
                  <Icon aria-hidden="true" size={26} />
                </span>
                <span className="mt-6 text-xs font-bold uppercase tracking-wider text-[var(--mui-palette-primary-main)]">
                  {eyebrow}
                </span>
                <h2 className="mt-2 break-words text-xl font-bold sm:text-2xl">
                  {title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
                  {description}
                </p>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[var(--mui-palette-primary-main)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mui-palette-primary-main)] dark:text-[#241812]"
                >
                  {action}
                  <ArrowUpLeft aria-hidden="true" size={17} />
                </a>
              </article>
            )
          )}
        </section>

        <section className="mx-auto mb-14 w-[calc(100%-2.5rem)] max-w-7xl rounded-3xl border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] px-5 py-7 sm:mb-20 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                دنبال قهوهٔ موردعلاقه‌ات می‌گردی؟
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--mui-palette-text-secondary)]">
                منو را ببین و انتخابت را به سبد خرید اضافه کن.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#493323] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mui-palette-primary-main)] dark:bg-[#d7b08a] dark:text-[#241812] dark:hover:bg-[#e5c5a4]"
            >
              دیدن فروشگاه
            </Link>
          </div>
        </section>
      </div>
      <FooterBar />
    </div>
  );
}
