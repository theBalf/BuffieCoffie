import NotFoundPage from "./Pages/NoPage";
import HomePage from "./Pages/Homepage";
import MainLayOut from "./Pages/MainLayOut";
import ShopPage from "./Pages/Shoppage";
import CartPage from "./Pages/CartPage";
import ShopDone from "./Pages/shopDone";
import CheckoutPage from "./Pages/CheckOut";
// //////////////
import { Route, Routes } from "react-router";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayOut />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/done" element={<ShopDone />} />
          <Route path="/check" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
