import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { NavMenuProvider } from "./Context/MenuContext.jsx";
import "@fontsource-variable/vazirmatn";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme/theme.js";
import CssBaseline from "@mui/material/CssBaseline";
import { CartProvider } from "./Context/CartProvider";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <CartProvider>
          <NavMenuProvider>
            <App />
          </NavMenuProvider>
          </CartProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  </BrowserRouter>
);
