import { lazy, Suspense, useEffect, useState } from "react";
// //////////////
import { Route, Routes } from "react-router";
import CoffeeCakeLoader from "./Components/CoffeeCakeLoader";

import "./App.css";

const NotFoundPage = lazy(() => import("./Pages/NoPage"));
const HomePage = lazy(() => import("./Pages/Homepage"));
const MainLayOut = lazy(() => import("./Pages/MainLayOut"));
const ShopPage = lazy(() => import("./Pages/Shoppage"));
const MenuPage = lazy(() => import("./Pages/MenuPage"));
const CartPage = lazy(() => import("./Pages/CartPage"));
const OrdersPage = lazy(() => import("./Pages/OrdersPage"));
const ShopDone = lazy(() => import("./Pages/shopDone"));
const CheckoutPage = lazy(() => import("./Pages/CheckOut"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const ContactPage = lazy(() => import("./Pages/ContactPage"));
const AccountPage = lazy(() => import("./Pages/AccountPage"));
const AdminDashboardPage = lazy(() => import("./Pages/AdminDashboardPage"));

function LoadingScreen() {
  return (
    <div className="app-loading-screen">
      <CoffeeCakeLoader />
    </div>
  );
}

function App() {
  const [minimumLoadingComplete, setMinimumLoadingComplete] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingComplete(true);
    }, 1_000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {!minimumLoadingComplete && <LoadingScreen />}
      <Suspense fallback={minimumLoadingComplete ? <LoadingScreen /> : null}>
        <Routes>
          <Route element={<MainLayOut />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/done" element={<ShopDone />} />
            <Route path="/check" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin-panel" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
