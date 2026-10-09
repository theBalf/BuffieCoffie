import { NavLink } from "react-router";
import navItems from "./navItems";
import { X } from "lucide-react";
import { useMenu } from "../Context/MenuContext";

export default function NavLinks() {
  const desktopItems = navItems.filter((item) => item.desktop);

  const linkClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 transition-colors ${
      isActive
        ? "bg-[#6F4E37] text-white dark:bg-[#D7B08A] dark:text-[#241812]"
        : "text-[var(--mui-palette-text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
    }`;

  const { state, dispatch } = useMenu();

  const closeMenu = () => {
    dispatch({ type: "CLOSE_MENU" });
  };

  return (
    <>
      {/* ----------------------- منو دسکتاپ------------------- */}
      <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
        {desktopItems.map((item) => (
          <NavLink key={item.id} to={item.path} className={linkClass}>
            {item.title}
          </NavLink>
        ))}
      </nav>
      {/* ----------------------- منو موبایل------------------- */}

      <div
        id="mobile-navigation-backdrop"
        className={`fixed inset-0 z-50 lg:hidden ${
          state.isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={closeMenu}
          aria-label="بستن منو"
          tabIndex={state.isMenuOpen ? 0 : -1}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
            state.isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id="mobile-navigation"
          aria-label="منوی اصلی"
          aria-hidden={!state.isMenuOpen}
          inert={!state.isMenuOpen}
          className={`absolute right-0 top-0 h-dvh w-72 max-w-[calc(100vw-2rem)] overflow-y-auto bg-[#D7B08A] px-4 py-4 shadow-xl transition-transform duration-300 ease-in-out ${
            state.isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={closeMenu}
            className="
        rounded-full p-2
        transition-all duration-300
        hover:rotate-90 hover:bg-black/10
      "
            aria-label="بستن منو"
          >
            <X />
          </button>

          <nav className="mt-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <Icon size={20} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
