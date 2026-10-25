import { Link } from "react-router";
import { useCart } from "@/Context/CartProvider";
import { useNavigate } from "react-router";
import StockLimitButton from "@/Components/StockLimitButton";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    increaseProductInCart,
    reduceProductInCart,
    clearCart,
    totalProducts,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  // سبد خالی
  if (cartItems.length === 0) {
    return (
      <main
        dir="rtl"
        className="
          flex
          min-h-[70vh]
          items-center
          justify-center
          px-4
        "
        style={{
          backgroundColor: "var(--mui-palette-background-default)",
        }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold"
            style={{
              color: "var(--mui-palette-text-primary)",
            }}
          >
            سبد خریدت خالیه
          </h1>

          <p
            className="mt-3"
            style={{
              color: "var(--mui-palette-text-secondary)",
            }}
          >
            هنوز محصولی به سبد اضافه نکردید
          </p>

          <Link
            to="/shop"
            className="
              mt-6
              inline-block
              rounded-xl
              bg-[var(--mui-palette-primary-main)]
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:opacity-90
            "
          >
            رفتن به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen py-10"
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold md:text-3xl"
              style={{
                color: "var(--mui-palette-text-primary)",
              }}
            >
              سبد خرید
            </h1>

            <p
              className="mt-2 text-sm"
              style={{
                color: "var(--mui-palette-text-secondary)",
              }}
            >
              {totalProducts} محصول در سبد
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="
              self-start
              rounded-xl
              border
              border-red-400
              px-4
              py-2
              text-sm
              text-red-500
              transition
              hover:bg-red-500/10
            "
          >
            پاک کردن سبد
          </button>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-[1fr_320px]
          "
        >
          {/* Cart Items */}
          <section className="space-y-4">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="
                  flex
                  flex-col
                  gap-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[var(--mui-palette-divider)]
                  bg-[var(--mui-palette-background-paper)]
                  p-4

                  sm:flex-row
                  sm:items-center
                "
              >
                {/* Image */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="
                    h-36
                    w-full
                    rounded-xl
                    object-cover

                    sm:h-24
                    sm:w-24
                  "
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h2
                    className="font-bold"
                    style={{
                      color: "var(--mui-palette-text-primary)",
                    }}
                  >
                    {item.name}
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--mui-palette-text-secondary)",
                    }}
                  >
                    {Number(item.price).toLocaleString("fa-IR")} تومان
                  </p>
                </div>

                {/* Quantity */}
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--mui-palette-divider)]
                  "
                >
                  <StockLimitButton
                    itemName={item.name}
                    onClick={() => increaseProductInCart(item.id)}
                    disabled={
                      !item.is_available || item.quantity >= Number(item.stock)
                    }
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-lg
                      font-bold
                      text-[var(--mui-palette-text-primary)]
                      transition
                      hover:bg-black/5
                      disabled:opacity-40
                    `}
                  />

                  <span
                    className="
                      flex
                      h-10
                      min-w-10
                      items-center
                      justify-center
                      border-x
                      border-[var(--mui-palette-divider)]
                      px-2
                      font-bold
                    "
                    style={{
                      color: "var(--mui-palette-text-primary)",
                    }}
                  >
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => reduceProductInCart(item.id)}
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-lg
                      font-bold
                      transition
                      hover:bg-black/5
                    "
                    style={{
                      color: "var(--mui-palette-text-primary)",
                    }}
                  >
                    -
                  </button>
                </div>

                {/* Price + Remove */}
                <div className="flex w-full flex-row items-center justify-between gap-2 sm:w-auto sm:min-w-[120px] sm:flex-col sm:items-end">
                  <span
                    className="
                      whitespace-nowrap
                      font-bold
                      text-[var(--mui-palette-primary-main)]
                    "
                  >
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "fa-IR"
                    )}{" "}
                    تومان
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="
                      text-xs
                      text-red-500
                      transition
                      hover:underline
                    "
                  >
                    حذف محصول
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* Order Summary */}
          <aside
            className="
              h-fit
              rounded-2xl
              border
              border-[var(--mui-palette-divider)]
              bg-[var(--mui-palette-background-paper)]
              p-5

              lg:sticky
              lg:top-6
            "
          >
            <h2
              className="text-lg font-bold"
              style={{
                color: "var(--mui-palette-text-primary)",
              }}
            >
              خلاصه سفارش
            </h2>

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-b
                border-[var(--mui-palette-divider)]
                pb-4
                text-sm
              "
            >
              <span
                style={{
                  color: "var(--mui-palette-text-secondary)",
                }}
              >
                تعداد محصولات
              </span>

              <span
                style={{
                  color: "var(--mui-palette-text-primary)",
                }}
              >
                {totalProducts}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span
                className="font-bold"
                style={{
                  color: "var(--mui-palette-text-primary)",
                }}
              >
                مبلغ کل
              </span>

              <span
                className="
                  font-bold
                  text-[var(--mui-palette-primary-main)]
                "
              >
                {Number(totalPrice).toLocaleString("fa-IR")} تومان
              </span>
            </div>

            <button
              type="button"
              className="
    mt-6
    w-full
    rounded-xl
    bg-[var(--mui-palette-primary-main)]
    px-4
    py-3
    font-bold
    text-white
    transition
    hover:opacity-90
  "
              onClick={() => navigate("/check")}
            >
              تکمیل سفارش
            </button>

            <Link
              to="/shop"
              className="
                mt-3
                block
                text-center
                text-sm
                text-[var(--mui-palette-text-secondary)]
                hover:text-[var(--mui-palette-primary-main)]
              "
            >
              ادامه خرید
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
