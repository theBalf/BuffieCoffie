import { useState, useMemo, createContext, useContext, useEffect } from "react";

const CartContext = createContext(null);

function getStockLimit(product) {
  const stock = Number(product.stock);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem("finalCart");
      const items = savedItems ? JSON.parse(savedItems) : [];
      return items
        .map((item) => ({
          ...item,
          quantity: Math.min(
            Math.max(0, Number(item.quantity) || 0),
            getStockLimit(item)
          ),
        }))
        .filter((item) => item.quantity > 0);
    } catch {
      return [];
    }
  });

  function addToCart(product) {
    const stockLimit = getStockLimit(product);
    if (!product.is_available || stockLimit === 0) {
      return;
    }

    setCartItems((currentProducts) => {
      const existingProduct = currentProducts.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        if (existingProduct.quantity >= stockLimit) {
          return currentProducts;
        }

        return currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                stock: stockLimit,
                quantity: item.quantity + 1,
              }
            : item
        );
      }
      return [...currentProducts, { ...product, stock: stockLimit, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCartItems((currentProducts) =>
      currentProducts.filter((item) => item.id !== productId)
    );
  }

  function increaseProductInCart(productId) {
    setCartItems((currentProducts) =>
      currentProducts.map((item) => {
        if (
          item.id !== productId ||
          !item.is_available ||
          item.quantity >= getStockLimit(item)
        ) {
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  }

  function reduceProductInCart(productId) {
    setCartItems((currentProducts) =>
      currentProducts
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  //---------------------------    تعریف متغییر ها

  const totalProducts = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.discounted_price ?? item.price) * item.quantity,
    0
  );
  useEffect(() => {
    localStorage.setItem("finalCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      increaseProductInCart,
      reduceProductInCart,
      clearCart,
      totalProducts,
      totalPrice,
    }),
    [cartItems, totalProducts, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("مشکلی در خواندن محتوا پیش آمده");
  }
  return context;
}
