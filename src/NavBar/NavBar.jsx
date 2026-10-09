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
import { Link } from "react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function NavBar() {
  const { state, dispatch } = useMenu();
  const { totalProducts } = useCart();

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
          items-center
          justify-between
          gap-2
          px-3
          py-2
          sm:px-5
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
          <a
  href="http://127.0.0.1:8000/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="
    group
    flex
    cursor-pointer
    items-center
    gap-2
    rounded-full
    border
    border-transparent
    p-2
    transition-all
    duration-300

    hover:border-[#6F4E37]
    hover:px-4

    dark:hover:border-white
  "
>
  <UserRound
    className="
      h-5
      w-5
      text-[var(--mui-palette-primary-main)]
    "
  />

  <span
    className="
      max-w-0
      overflow-hidden
      whitespace-nowrap
      text-sm
      font-bold
      text-[var(--mui-palette-primary-main)]
      opacity-0
      transition-all
      duration-300

      group-hover:max-w-32
      group-hover:opacity-100

    "
  >
    پنل ادمین
  </span>
</a>

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
                right-0
                top-12
                z-50

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
        <div className="order-2 md:order-3">
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
          className="order-3 lg:order-2"
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