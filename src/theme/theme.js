import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Vazirmatn Variable", sans-serif',
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },

  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#6F4E37",
        },
        background: {
          default: "#F8F3EC",
          paper: "#FFFFFF",
        },
        text: {
          primary: "#2B1B12",
        },
      },
    },

    dark: {
      palette: {
        primary: {
          main: "#D7B08A",
        },
        background: {
          default: "#17100C",
          paper: "#241812",
        },
        text: {
          primary: "#F8F3EC",
        },
      },
    },
  },
});

export default theme;