import { useProducts } from "../Components/hooks/ReactQuery/useProducts";
import ShelfCard from "../Components/ShelfCard";
import ProductGridSkeleton from "../Components/ProductGridSkeleton";

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
        {isPending ? (
          <ProductGridSkeleton carousel />
        ) : (
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
                  price={product.discounted_price ?? product.price}
                  originalPrice={product.price}
                  discountPercentage={product.discount_percentage ?? 0}
                  preparationTime={product.preparation_time}
                  isStock={product.stock > 0}
                  isAvailable={product.is_available}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
