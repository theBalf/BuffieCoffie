import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateAccountProfile,
} from "../api/accountAPI";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState({
    isLoading: true,
    loadError: "",
  });

  useEffect(() => {
    let isActive = true;
    getCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser);
          setSession({ isLoading: false, loadError: "" });
        }
      })
      .catch((error) => {
        if (isActive) {
          setSession({ isLoading: false, loadError: error.message });
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const currentUser = await loginAccount(identifier, password);
    setUser(currentUser);
    setSession({ isLoading: false, loadError: "" });
    return currentUser;
  }, []);

  const register = useCallback(async (values) => {
    const currentUser = await registerAccount(values);
    setUser(currentUser);
    setSession({ isLoading: false, loadError: "" });
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutAccount();
    setUser(null);
  }, []);

  const saveProfile = useCallback(async (values) => {
    const currentUser = await updateAccountProfile(values);
    setUser(currentUser);
    return currentUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading: session.isLoading,
      loadError: session.loadError,
      login,
      register,
      logout,
      saveProfile,
    }),
    [user, session, login, register, logout, saveProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("برای استفاده از حساب کاربری، AuthProvider لازم است.");
  }
  return context;
}
