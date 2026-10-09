import { useSearchParams } from "react-router";
import ShelfCard from "../Components/ShelfCard";
import { premadeStyles } from "../JSRefs/responsiveParameters";
import { usePaginatedProducts } from "../Components/hooks/ReactQuery/usePaginatedProducts";
import ProductPagination from "../Components/ProductPagination";
import ShopSearch from "@/Components/ShopSearch";

const cardStyle = premadeStyles.ProductCard;

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL params
  const category = searchParams.get("category");
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;

  // گرفتن محصولات صفحه‌بندی شده
  const { data, isPending, isError, error } = usePaginatedProducts(
    category,
    search,
    page
  );

  const products = data?.results ?? [];
  // /////////////////// سرچ
  function handleSearch(value) {
    const params = new URLSearchParams(searchParams);

    params.delete("page");

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  }
  // ====================
  // تغییر صفحه
  function handlePageChange(newPage) {
    const params = new URLSearchParams(searchParams);

    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", newPage);
    }

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (isPending) {
    return <div className="py-20 text-center">در حال دریافت محصولات...</div>;
  }

  if (isError) {
    return <div className="py-20 text-center">{error.message}</div>;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen py-10"
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* ----------سرچ */}
        <ShopSearch initialValue={search} onSearch={handleSearch} />
        {/* ----------سرچ */}

        <div className="mb-8">
          <h1
            className="text-center text-2xl font-bold md:text-3xl"
            style={{
              color: "var(--mui-palette-text-primary)",
              fontFamily: '"Vazirmatn Variable", sans-serif',
            }}
          >
            {category ? category : "همه محصولات"}
          </h1>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <p
            className="text-center"
            style={{
              color: "var(--mui-palette-text-secondary)",
            }}
          >
            محصولی پیدا نشد.
          </p>
        ) : (
          <div className={cardStyle.grid}>
            {products.map((product) => (
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.count > 0 && (
          <ProductPagination
            count={data.count}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
}
