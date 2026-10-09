import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({
  count,
  page,
  onPageChange,
}) {
  const PAGE_SIZE = 12;

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // وقتی فقط یک صفحه داریم، اصلاً pagination نمایش داده نشه
  if (totalPages <= 1) return null;

  return (
    <div
      dir="rtl"
      className="
        mt-8
        flex
        items-center
        justify-center
        gap-4
      "
    >
      {/* صفحه قبلی */}
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-[var(--mui-palette-divider)]

          text-[#6F4E37]
          transition-all

          hover:bg-[#EFE5D8]

          disabled:cursor-not-allowed
          disabled:opacity-30

          dark:text-[#D7B08A]
          dark:hover:bg-[#3A281F]
        "
      >
        <ChevronRight size={18} />
      </button>

      {/* شماره صفحه */}
      <span
        className="
          min-w-20
          text-center
          text-sm
          font-bold
        "
        style={{
          color: "var(--mui-palette-text-primary)",
        }}
      >
        صفحه {page} از {totalPages}
      </span>

      {/* صفحه بعدی */}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-[var(--mui-palette-divider)]

          text-[#6F4E37]
          transition-all

          hover:bg-[#EFE5D8]

          disabled:cursor-not-allowed
          disabled:opacity-30

          dark:text-[#D7B08A]
          dark:hover:bg-[#3A281F]
        "
      >
        <ChevronLeft size={18} />
      </button>
    </div>
  );
}