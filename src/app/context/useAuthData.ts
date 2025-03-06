import { useState, useEffect } from "react";
import { AuthDataModelInterface, useAuth } from "./AuthContext";
import { useToastHelper } from "../helper/ToastMessagesHelper";
import { AuthDataResponse } from "../services/useAuthentications";

const useAuthData = () => {
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [TokenData, setTokenData] = useState<string>("");

  const showToast = useToastHelper();
  const { isAuthenticated, goLogout } = useAuth();

  useEffect(() => {
    if (DataAuth == null) {
      const storedData = localStorage.getItem("authData");
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        if (StorageAuth.dataAuth != null) {
          setDataAuth(UserData);
          setTokenData(StorageAuth.dataAuth.apiKey);
        } else {
          showToast({
            description: "Login session not found.",
            statusToast: "error",
          });
          goLogout();
        }
      } else {
        showToast({
          description: "Login session not found.",
          statusToast: "error",
        });
        goLogout();
      }
    }
  }, [DataAuth, TokenData, showToast, goLogout]);

  return { DataAuth, TokenData, isAuthenticated };
};

export default useAuthData;
