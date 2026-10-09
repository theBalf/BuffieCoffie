import NavBar from "../NavBar/NavBar";

// //////////////////
import { Outlet } from "react-router";

export default function MainLayOut() {
  return (
    <div
      className="
    min-h-screen
    bg-[var(--mui-palette-background-default)]
    text-[var(--mui-palette-text-primary)]
    transition-colors duration-300
  "
    >
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
