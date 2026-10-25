import { Clock, Percent } from "lucide-react";
import { premadeStyles } from "../JSRefs/responsiveParameters.js";
import ButtonComponent from "./Button";
import StockLimitButton from "./StockLimitButton";
import StarRate from "./RatingStar";
import { useCart } from "../Context/CartProvider";

const cardStyle = premadeStyles.ProductCard;

export default function ShelfCard({
  product,
  image,
  title,
  description,
  price,
  originalPrice = product.price,
  discountPercentage = product.discount_percentage ?? 0,
  preparationTime,
  isStock = true,
  isAvailable = true,
}) {
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(price);
  const formattedOriginalPrice = new Intl.NumberFormat("fa-IR").format(originalPrice);
  const formattedDiscount = new Intl.NumberFormat("fa-IR").format(discountPercentage);
  const rating = Number(product.rating) || 0;
  const formattedRating = new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 1,
  }).format(rating);

  const { cartItems, addToCart, increaseProductInCart, reduceProductInCart } =
    useCart();

  const cartItem = cartItems.find((item) => item.id === product.id);

  const quantity = cartItem?.quantity ?? 0;
  const isAtStockLimit = quantity >= product.stock;
  const isOutOfStock = !isStock || Number(product.stock) <= 0;

  return (
    <article
      className={`
      ${cardStyle.card}
      items-center
      ${isOutOfStock ? "opacity-70 grayscale-[0.65]" : ""}
    `}
    >
      {/* Image */}
      <div id="imageWrapper" className={`${cardStyle.imageWrapper} relative`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className={`${cardStyle.image} ${isOutOfStock ? "grayscale brightness-75" : ""}`}
        />
        {discountPercentage > 0 && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#6F4E37] px-2 py-1 text-xs font-bold text-white shadow-sm dark:bg-[#D7B08A] dark:text-[#2B1B12]"
            aria-label={`${formattedDiscount} درصد تخفیف`}
            title={`${formattedDiscount}٪ تخفیف`}
          >
            <Percent size={14} aria-hidden="true" />
            {formattedDiscount}٪
          </span>
        )}
      </div>

      {/* Content */}
      <div
        id="productInfo"
        className={`
          ${cardStyle.content}
          min-h-[5.5rem]
        `}
      >
        <h3 className={cardStyle.title}>{title}</h3>

        <p
          className="
            mt-2
            line-clamp-2
            text-center
            text-[clamp(0.7rem,2.4vw,0.8rem)]
            leading-5
            text-[var(--mui-palette-text-secondary)]
          "
        >
          {description}
        </p>
      </div>

      {/* Price, preparation time, and rating */}
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          px-3
          pb-2
        "
      >
        <div className="flex w-full flex-col items-center gap-0.5 text-center">
          {discountPercentage > 0 && (
            <span className="flex min-w-0 items-center gap-1 text-[0.6rem] leading-4 text-[var(--mui-palette-text-secondary)]">
              <span className="line-through">{formattedOriginalPrice} تومان</span>
              <span className="shrink-0">{formattedDiscount}٪ تخفیف</span>
            </span>
          )}
          <span className={cardStyle.price}>
            {formattedPrice} تومان
          </span>
        </div>

        <div
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            text-[clamp(0.8rem,2.6vw,0.9rem)]
            text-[var(--mui-palette-text-secondary)]
          "
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={16} aria-hidden="true" />
            <span>{preparationTime} دقیقه</span>
          </span>
          <span
            className="group relative flex h-8 w-10 shrink-0 items-center justify-center"
            aria-label={`امتیاز ${formattedRating} از ۵`}
          >
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out group-hover:opacity-0 motion-reduce:transition-none">
              <StarRate rating={rating} size={28} />
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--mui-palette-text-primary)] opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 motion-reduce:transition-none"
            >
              {formattedRating}
            </span>
          </span>
        </div>
      </div>

      {/* Cart Button */}
      <div
        className="
    mt-auto
    w-full
    px-3
    pb-3
    pt-2
  "
      >
        {quantity === 0 ? (
          <ButtonComponent
            text={!isAvailable || isOutOfStock ? "ناموجود" : "افزودن به سبد"}
            onClick={() => addToCart(product)}
            disabled={!isAvailable || isOutOfStock}
            style={`
              ${cardStyle.button}
              w-[9rem]
              mx-auto
              !min-h-10
              box-border
              !p-0
            `}
          />
        ) : (
          <div
            className="
              flex
              mx-auto
              h-10
              w-[9rem]
              items-center
              justify-between
              overflow-hidden
              rounded-xl

              bg-[var(--mui-palette-primary-main)]
              text-white

              dark:text-[var(--mui-palette-primary-contrastText)]
            "
          >
            <button
              type="button"
              onClick={() => reduceProductInCart(product.id)}
              className="
                flex
                h-full
                w-10
                items-center
                justify-center
                text-lg
                font-bold
                transition
                hover:bg-black/10
              "
            >
              -
            </button>

            <span
              className="
                text-sm
                font-bold
              "
            >
              {quantity}
            </span>

            <StockLimitButton
              itemName={title}
              onClick={() => increaseProductInCart(product.id)}
              disabled={isAtStockLimit || !isAvailable}
              className={`
                flex
                h-full
                w-10
                items-center
                justify-center
                text-lg
                font-bold
                transition
                hover:bg-black/10
                disabled:opacity-40
              `}
            />
          </div>
        )}
      </div>
    </article>
  );
}
