import { premadeStyles } from "../JSRefs/responsiveParameters";

const cardStyle = premadeStyles.ProductCard;

function ProductCardSkeleton({ carousel = false }) {
  return (
    <article
      aria-hidden="true"
      className={`product-skeleton-card ${carousel ? "product-skeleton-card-carousel" : cardStyle.card}`}
    >
      <div className="product-skeleton-shape product-skeleton-image" />
      <div className="product-skeleton-details">
        <div className="product-skeleton-shape product-skeleton-title" />
        <div className="product-skeleton-shape product-skeleton-description" />
        <div className="product-skeleton-shape product-skeleton-description product-skeleton-description-short" />
      </div>
      <div className="product-skeleton-meta">
        <div className="product-skeleton-shape product-skeleton-price" />
        <div className="product-skeleton-shape product-skeleton-time" />
      </div>
      <div className="product-skeleton-shape product-skeleton-button" />
    </article>
  );
}

export default function ProductGridSkeleton({ count = 6, carousel = false }) {
  return (
    <div
      className={
        carousel
          ? "product-skeleton-carousel"
          : `product-skeleton-grid ${cardStyle.grid}`
      }
      role="status"
      aria-label="در حال بارگذاری محصولات"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} carousel={carousel} />
      ))}
    </div>
  );
}
