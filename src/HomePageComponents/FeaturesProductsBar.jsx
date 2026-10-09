import { useProducts } from "../Components/hooks/ReactQuery/useProducts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ShelfCard from "../Components/ShelfCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function FeaturesProductsSection() {
  const { data, isPending, isError, error } = useProducts(
    undefined,
    undefined,
    true
  );

  if (isPending) {
    return (
      <div className="px-4 py-8">
        <Skeleton height={320} />
      </div>
    );
  }

  if (isError) {
    return <p className="py-8 text-center">{error.message}</p>;
  }

  return (
    <section
      dir="rtl"
      className="w-full overflow-hidden py-8"
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/*  */}
        <div className="mb-6 w-full">
          <h2
            className="
      w-full
      text-center
      text-xl
      font-bold
      sm:text-2xl
    "
            style={{
              color: "var(--mui-palette-text-primary)",
              fontFamily: "var(--font-vazir)",
            }}
          >
            محبوب‌ترین‌ها
          </h2>
        </div>
        {/*  */}
        <Swiper
          modules={[Navigation]}
          navigation
          grabCursor
          slidesPerView="auto"
          spaceBetween={0}
          className="
    featured-swiper
    !overflow-hidden
    !px-12
    !py-4
  "
          style={{
            "--swiper-navigation-color": "var(--mui-palette-primary-main)",
            "--swiper-navigation-size": "22px",
          }}
        >
          {data.map((product) => (
            <SwiperSlide
              key={product.id}
              className="
        !w-[210px]
        px-1
        py-2

        sm:!w-[230px]
        md:!w-[245px]
        lg:!w-[255px]
      "
            >
              <ShelfCard
                key={product.id}
                product={product}
                image={product.image_url}
                title={product.name}
                description={product.description}
                price={product.price}
                preparationTime={product.preparation_time}
                isStock={product.stock > 0}
                isAvailable={product.is_available}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
