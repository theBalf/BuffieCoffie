import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { useCategories } from "../Components/hooks/ReactQuery/useCategories";

export default function CategoryBar() {
  const { data, isPending, isError, error } = useCategories();

  // Loading
  if (isPending) {
    return (
      <section
        className="w-full py-5"
        style={{
          backgroundColor: "var(--mui-palette-background-default)",
        }}
      >
        <div
          className="
            flex gap-3 overflow-x-auto px-4
            md:grid md:grid-cols-3 md:overflow-visible
            lg:grid-cols-6
          "
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[120px] rounded-2xl p-4 md:min-w-0"
              style={{
                backgroundColor: "var(--mui-palette-background-paper)",
              }}
            >
              <Skeleton height={70} />
              <Skeleton className="mt-3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error
  if (isError) {
    return (
      <div
        className="py-6 text-center"
        style={{
          backgroundColor: "var(--mui-palette-background-default)",
          color: "var(--mui-palette-error-main)",
        }}
      >
        {error.message}
      </div>
    );
  }

  return (
    <section
      className="
        w-full
        py-5
        transition-colors
        duration-300
      "
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div
  id="CategoryBarWrapper"
  className="
    grid
    grid-cols-2
    gap-3
    px-4

    sm:grid-cols-3
    sm:gap-4

    lg:grid-cols-6
  "
>
  {data.map((item) => {
    return (
      <Link
        key={item.id}
        to={`/shop?category=${item.slug}`}
        className="
          group

          flex
          w-full
          flex-col
          items-center
          justify-center

          rounded-2xl
          border

          px-2
          py-4

          transition-all
          duration-300

          hover:-translate-y-1
          hover:shadow-lg
          hover:opacity-90
        "
        style={{
          backgroundColor: "var(--mui-palette-background-paper)",
          borderColor: "var(--mui-palette-divider)",
          color: "var(--mui-palette-text-primary)",
        }}
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            sm:h-16
            sm:w-16

            lg:h-18
            lg:w-18
          "
        >
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-contain

              transition-transform
              duration-300

              group-hover:scale-110
            "
          />
        </div>

        <p
          className="
            mt-3
            text-center
            text-sm
            font-bold
            leading-6

            sm:text-base
          "
          style={{
            color: "var(--mui-palette-text-primary)",
          }}
        >
          {item.name}
        </p>
      </Link>
    );
  })}
</div>
    </section>
  );
}