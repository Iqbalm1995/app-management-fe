"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToastHelper } from "../helper/ToastMessagesHelper";
import {
  DELAY_LOW,
  INACTIVITY_LIMIT_DEFAULT,
  LINK_MENU_HOME,
  LINK_MENU_ROOT,
  STATUS_LOGIN_OFF,
  STATUS_LOGIN_ON,
} from "../constants/applicationConstants";
import { redirect, usePathname } from "next/navigation";

export interface AuthDataModelInterface {
  dataLogin: object | null;
  dataAuth: loginReturn | null;
  statusLogin: string;
}

interface AuthContextInterface {
  authData: AuthDataModelInterface;
  goLogin: (data: object, dataAuth: loginReturn) => void;
  goLogout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface loginReturn {
  apiKey: string;
  expiration: string;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [authData, setAuthData] = useState<AuthDataModelInterface>({
    dataLogin: null,
    dataAuth: null,
    statusLogin: STATUS_LOGIN_OFF,
  });
  const [loading, setLoading] = useState(true); // Add loading state

  // Public routes that don't require authentication
  const publicRoutes = ['/tentang-kami', '/hubungi-kami'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Skip auth check for public routes
      if (isPublicRoute) {
        setLoading(false);
        isFirstRender.current = false;
        return;
      }

      const storedData = localStorage.getItem("authData");

      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setAuthData(StorageAuth);
        if (
          StorageAuth.statusLogin === STATUS_LOGIN_OFF &&
          pathname !== LINK_MENU_ROOT
        ) {
          redirect(LINK_MENU_ROOT); // redirect to login
        }
      } else {
        localStorage.setItem("authData", JSON.stringify(authData));
        redirect(LINK_MENU_ROOT); // redirect to login
      }
      setLoading(false); // Set loading to false once data is checked
      isFirstRender.current = false;
    }
  }, [authData, pathname, isPublicRoute]);

  const handleLogin = async (data: object, dataAuth: loginReturn) => {
    // const DataLogin: loginReturn = data as loginReturn;
    const authData: AuthDataModelInterface = {
      dataLogin: data,
      dataAuth: dataAuth,
      statusLogin: STATUS_LOGIN_ON,
    };
    
    // Check if need to redirect to change password BEFORE setTimeout
    const shouldRedirectToChangePassword = localStorage.getItem("redirectToChangePassword");
    console.log("Checking redirect flag:", shouldRedirectToChangePassword);
    
    setTimeout(() => {
      localStorage.setItem("authData", JSON.stringify(authData));
      localStorage.setItem("tokenData", dataAuth.apiKey);
      setAuthData(authData);
      
      if (shouldRedirectToChangePassword === "true") {
        localStorage.removeItem("redirectToChangePassword");
        console.log("Redirecting to change-password");
        redirect("/change-password");
      } else {
        console.log("Redirecting to home");
        redirect(LINK_MENU_HOME);
      }
    }, DELAY_LOW); // 1-second delay
  };

  const handleLogout = async () => {
    setLoading(true);
    setTimeout(() => {
      const authData: AuthDataModelInterface = {
        dataLogin: null,
        dataAuth: null,
        statusLogin: STATUS_LOGIN_OFF,
      };

      // Clear auth data
      localStorage.setItem("authData", JSON.stringify(authData));
      localStorage.setItem("tokenData", "");
      localStorage.removeItem("accessData"); // Clear access data

      // // Clear team data from localStorage
      // // First get the current auth data to extract team ID if available
      // const storedData = localStorage.getItem("authData");
      // if (storedData) {
      //   try {
      //     const currentAuthData: AuthDataModelInterface = JSON.parse(storedData);
      //     if (currentAuthData.dataLogin &&
      //         (currentAuthData.dataLogin as any).team &&
      //         (currentAuthData.dataLogin as any).team.id) {
      //       const teamId = (currentAuthData.dataLogin as any).team.id;

      //       // Remove team data
      //       localStorage.removeItem(`teamData_${teamId}`);
      //       localStorage.removeItem(`teamData_${teamId}_timestamp`);

      //       console.log(`Cleared team data for team ID: ${teamId}`);
      //     }
      //   } catch (error) {
      //     console.error("Error clearing team data from localStorage:", error);
      //   }
      // }

      // // Clear any other potential team data by scanning localStorage
      // try {
      //   // Find and remove all items that start with "teamData_"
      //   Object.keys(localStorage).forEach(key => {
      //     if (key.startsWith("teamData_")) {
      //       localStorage.removeItem(key);
      //       console.log(`Removed localStorage item: ${key}`);
      //     }
      //   });
      // } catch (error) {
      //   console.error("Error scanning localStorage for team data:", error);
      // }

      setAuthData(authData);
      setLoading(false);
      redirect(LINK_MENU_ROOT);
    }, DELAY_LOW);
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        goLogin: handleLogin,
        goLogout: handleLogout,
        isAuthenticated: authData.statusLogin === STATUS_LOGIN_ON,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
