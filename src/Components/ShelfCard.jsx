import { Clock } from "lucide-react";
import { premadeStyles } from "../JSRefs/responsiveParameters.js";
import ButtonComponent from "./Button";
import { useCart } from "../Context/CartProvider";

const cardStyle = premadeStyles.ProductCard;

export default function ShelfCard({
  product,
  image,
  title,
  description,
  price,
  preparationTime,
  isStock = true,
  isAvailable = true,
}) {
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(price);

  const { cartItems, addToCart, increaseProductInCart, reduceProductInCart } =
    useCart();

  const cartItem = cartItems.find((item) => item.id === product.id);

  const quantity = cartItem?.quantity ?? 0;

  return (
    <article
      className={`
      ${cardStyle.card}
      items-center
    `}
    >
      {/* Image */}
      <div id="imageWrapper" className={cardStyle.imageWrapper}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className={cardStyle.image}
        />
      </div>

      {/* Content */}
      <div
        id="productInfo"
        className={`
          ${cardStyle.content}
          min-h-[100px]
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

      {/* Price + Time */}
      <div
        className="
          flex
          items-center
          justify-between
          px-3
          pb-2
        "
      >
        <span className={cardStyle.price}>{formattedPrice} تومان</span>

        <div
          className="
            flex
            items-center
            gap-1
            text-[clamp(0.7rem,2.4vw,0.8rem)]
            text-[var(--mui-palette-text-secondary)]
          "
        >
          <Clock size={14} />

          <span>{preparationTime} دقیقه</span>
        </div>
      </div>

      {/* Cart Button */}
      <div
        className="
    mt-auto
    px-3
    pb-3
    pt-2
  "
      >
        {quantity === 0 ? (
          <ButtonComponent
            text={!isAvailable || !isStock ? "ناموجود" : "افزودن به سبد"}
            onClick={() => addToCart(product)}
            disabled={!isAvailable || !isStock}
            style={`
              ${cardStyle.button}
              w-full
              h-10
            `}
          />
        ) : (
          <div
            className="
              flex
              h-10
              w-full
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

            <button
              type="button"
              onClick={() => increaseProductInCart(product.id)}
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
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
