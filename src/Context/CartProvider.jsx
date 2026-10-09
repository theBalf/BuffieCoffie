import { useState, useMemo, createContext, useContext, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem("finalCart");
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  function addToCart(product) {
    setCartItems((currentProducts) => {
      const existingProduct = currentProducts.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentProducts.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentProducts, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCartItems((currentProducts) =>
      currentProducts.filter((item) => item.id !== productId)
    );
  }

  function increaseProductInCart(productId) {
    setCartItems((currentProducts) =>
      currentProducts.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
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
    (total, item) => total + Number(item.price) * item.quantity,
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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("مشکلی در خواندن محتوا پیش آمده");
  }
  return context;
}
