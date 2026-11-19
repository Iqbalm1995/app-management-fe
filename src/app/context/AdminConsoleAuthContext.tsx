"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { WORKER_QUEUE_PASSKEY } from "@/app/constants/applicationConstants";

export const CONF_ADMIN_CONSOLE_UNLOCKED_KEY = "conf_admin_console_unlocked";

interface AdminConsoleAuthContextType {
  isUnlocked: boolean;
  isVerifyingKey: boolean;
  passkeyError: string | null;
  unlockConsole: (passkey: string) => boolean;
  lockConsole: () => void;
  clearPasskeyError: () => void;
}

const AdminConsoleAuthContext = createContext<AdminConsoleAuthContextType>({
  isUnlocked: false,
  isVerifyingKey: false,
  passkeyError: null,
  unlockConsole: () => false,
  lockConsole: () => {},
  clearPasskeyError: () => {},
});

export function AdminConsoleAuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Sync session unlock status on mount with backward-compatibility for legacy keys
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isSaved =
          sessionStorage.getItem(CONF_ADMIN_CONSOLE_UNLOCKED_KEY) === "true" ||
          sessionStorage.getItem("admin_mode_unlocked") === "true" ||
          sessionStorage.getItem("worker_queue_unlocked") === "true" ||
          sessionStorage.getItem("conf_user_manage_unlocked") === "true";

        if (isSaved) {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error("Failed to read admin console session storage:", err);
      }
    }
  }, []);

  const unlockConsole = useCallback((passkey: string): boolean => {
    setIsVerifyingKey(true);
    setPasskeyError(null);

    const isValid = passkey.trim() === WORKER_QUEUE_PASSKEY;
    if (isValid) {
      setIsUnlocked(true);
      setPasskeyError(null);
      try {
        sessionStorage.setItem(CONF_ADMIN_CONSOLE_UNLOCKED_KEY, "true");
        sessionStorage.setItem("admin_mode_unlocked", "true");
        sessionStorage.setItem("worker_queue_unlocked", "true");
        sessionStorage.setItem("conf_user_manage_unlocked", "true");
      } catch (err) {
        console.error("Failed to write to sessionStorage:", err);
      }
    } else {
      setPasskeyError("Passkey tidak valid. Akses ditolak.");
    }

    setIsVerifyingKey(false);
    return isValid;
  }, []);

  const lockConsole = useCallback(() => {
    setIsUnlocked(false);
    setPasskeyError(null);
    try {
      sessionStorage.removeItem(CONF_ADMIN_CONSOLE_UNLOCKED_KEY);
      sessionStorage.removeItem("admin_mode_unlocked");
      sessionStorage.removeItem("worker_queue_unlocked");
      sessionStorage.removeItem("conf_user_manage_unlocked");
    } catch (err) {
      console.error("Failed to clear sessionStorage:", err);
    }
  }, []);

  const clearPasskeyError = useCallback(() => {
    setPasskeyError(null);
  }, []);

  return (
    <AdminConsoleAuthContext.Provider
      value={{
        isUnlocked,
        isVerifyingKey,
        passkeyError,
        unlockConsole,
        lockConsole,
        clearPasskeyError,
      }}
    >
      {children}
    </AdminConsoleAuthContext.Provider>
  );
}

export function useAdminConsoleAuth() {
  const context = useContext(AdminConsoleAuthContext);
  if (!context) {
    throw new Error("useAdminConsoleAuth must be used within an AdminConsoleAuthProvider");
  }
  return context;
}
