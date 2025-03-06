import { AuthDataModelInterface } from "../context/AuthContext";

export const saveToLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

export const removeFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

const AUTH_STORAGE_KEY = "AuthData";

export const logout = () => {
  const authData: AuthDataModelInterface = {
    DataLogin: null,
    statusLogin: "logged_out",
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }
};

export const getAuthData = (): AuthDataModelInterface => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedData
      ? JSON.parse(storedData)
      : { DataLogin: null, statusLogin: "logged_out" };
  }
  return { DataLogin: null, statusLogin: "logged_out" };
};

export const isAuthenticated = (): boolean => {
  const authData = getAuthData();
  return authData.statusLogin === "logged_in";
};
