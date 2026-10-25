import NavLinks from "./NavlinkMenu";
import { useMenu } from "../Context/MenuContext";
import {
  ShoppingCart,
  MenuIcon,
  UserRound,
  ChevronDown,
} from "lucide-react";

import logoNavLight from "../Assets/buffiecoffee-logo-light-hq.png";
import ToggleDarkMode from "../Components/ToggleDarkMode";
import { useCart } from "@/Context/CartProvider";
import { useAuth } from "@/Context/AuthContext";
import { Link } from "react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function NavBar() {
  const { state, dispatch } = useMenu();
  const { totalProducts } = useCart();
  const { user } = useAuth();

  const [showTheme, setShowTheme] = useState(false);

  // برای تشخیص کلیک بیرون منوی تم
  const themeMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target)
      ) {
        setShowTheme(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <>
      <div
        id="navBarWrapper"
        className="
          flex
          flex-row-reverse
          items-center
          justify-between
          gap-2
          px-3
          py-2
          sm:px-5
          navbar-desktop-layout
        "
        style={{
          color: "var(--mui-palette-text-primary)",
        }}
      >
        {/* Action Buttons */}
        <div
          id="actionBtnsWrapper"
          className="flex items-center gap-2 sm:gap-4"
        >
          {/* Login */}
          <Link
            to="/account"
            aria-label={user ? "حساب کاربری" : "ورود یا ثبت‌نام"}
            className="
              group
              relative
              flex
              h-11
              w-11
              shrink-0
              cursor-pointer
              items-center
              justify-center
              rounded-full
              border
              border-transparent
              transition-colors
              duration-300
              hover:border-[#6F4E37]
              dark:hover:border-white
            "
          >
            <UserRound className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />
            <span
              className="
                pointer-events-none
                absolute
                left-1/2
                top-full
                z-50
                mt-2
                -translate-x-1/2
                whitespace-nowrap
                rounded-lg
                bg-[var(--mui-palette-background-paper)]
                px-3
                py-1.5
                text-sm
                font-bold
                text-[var(--mui-palette-primary-main)]
                opacity-0
                shadow-lg
                transition-opacity
                duration-200
                group-hover:opacity-100
                group-focus-visible:opacity-100
              "
            >
              {user ? "حساب کاربری" : "ورود یا ثبت‌نام"}
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              cursor-pointer
              text-[var(--mui-palette-primary-main)]
            "
            aria-label="سبد خرید"
          >
            <ShoppingCart />

            {totalProducts > 0 && (
              <span
                className="
                  absolute
                  -right-2
                  -top-2

                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center

                  rounded-full
                  bg-red-500
                  px-1

                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {totalProducts}
              </span>
            )}
          </Link>

          {/* Theme Dropdown */}
          <div
            ref={themeMenuRef}
            className="relative flex items-center"
          >
            {/* Chevron */}
            <button
              type="button"
              onClick={() =>
                setShowTheme((prev) => !prev)
              }
              className="
                flex
                h-11
                w-11
                cursor-pointer
                items-center
                justify-center

                rounded-full

                transition-all
                duration-300

                hover:bg-[#EFE5D8]

                dark:hover:bg-[#3A281F]
              "
            >
              <ChevronDown
                className={`
                  text-[var(--mui-palette-primary-main)]
                  transition-transform
                  duration-300

                  ${
                    showTheme
                      ? "rotate-180"
                      : "rotate-0"
                  }
                `}
              />
            </button>

            {/* Theme Menu */}
            <div
              className={`
                absolute
                left-1
                right-auto
                top-12
                z-50

                max-w-[calc(100vw-1.5rem)]
                whitespace-nowrap

                rounded-2xl
                border

                px-4
                py-2

                shadow-lg
                backdrop-blur-md

                transition-all
                duration-300
                ease-in-out

                ${
                  showTheme
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-3 opacity-0 pointer-events-none"
                }
              `}
              style={{
                backgroundColor:
                  "var(--mui-palette-background-paper)",

                borderColor:
                  "var(--mui-palette-divider)",
              }}
            >
              <ToggleDarkMode />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div id="navBarLogo">
          <Link to="/">
            <img
              src={logoNavLight}
              alt="BuffieCoffee"
              className="w-16 sm:w-20"
            />
          </Link>
        </div>

        {/* Menu */}
        <div
          id="NavBarMenu"
          className="flex items-center"
        >
          <NavLinks />

          <button
            type="button"
            aria-label="باز کردن منو"
            aria-expanded={state.isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              dispatch({
                type: "OPEN_MENU",
              });
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--mui-palette-primary-main)] transition-colors hover:bg-[#EFE5D8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)] lg:hidden dark:hover:bg-[#3A281F]"
          >
            <MenuIcon aria-hidden="true" />
          </button>

          <div id="NavLinks-bar" />
        </div>
      </div>
    </>
  );
}