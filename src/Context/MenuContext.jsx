import { createContext, useContext, useReducer } from "react";

const MenuContext = createContext();
const initialState = { isMenuOpen: false };

function NavMenuReducer(state, action) {
  switch (action.type) {
    case "OPEN_MENU":
      return { ...state, isMenuOpen: true };

    case "CLOSE_MENU":
      return { ...state, isMenuOpen: false };
    case "TOGGLE_MENU":
      return { ...state, isMenuOpen: !state.isMenuOpen };
    default:
      return state;
  }
}

export function NavMenuProvider({ children }) {
  const [state, dispatch] = useReducer(NavMenuReducer, initialState);
  return (
    <MenuContext.Provider value={{ state, dispatch }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
    return useContext(MenuContext);
  }