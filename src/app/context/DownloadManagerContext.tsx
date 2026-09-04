"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import useDownloadManager, {
  ExportRequestPayload,
} from "../services/useDownloadManager";
import { useToastHelper } from "../helper/ToastMessagesHelper";
import { RES_CODE_OK } from "../constants/applicationConstants";
import DownloadManagerDrawer from "../components/DownloadManagerDrawer";

interface DownloadManagerContextInterface {
  isDownloadManagerOpen: boolean;
  openDownloadManager: () => void;
  closeDownloadManager: () => void;
  toggleDownloadManager: () => void;
  activeJobsCount: number;
  requestExport: (payload: ExportRequestPayload) => Promise<boolean>;
  refreshActiveCount: () => Promise<void>;
}

const DownloadManagerContext = createContext<DownloadManagerContextInterface | undefined>(
  undefined
);

export const DownloadManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const showToast = useToastHelper();
  const { RequestExportJob, ListDownloadJobs } = useDownloadManager();
  const activeCountRef = useRef(activeJobsCount);
  activeCountRef.current = activeJobsCount;

  // Stable token getter without triggering React state re-render
  const getStoredToken = useCallback((): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("tokenData") || "";
  }, []);

  // Check active jobs without heavy overhead (fetch top 5 jobs only)
  const refreshActiveCount = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await ListDownloadJobs(
        {
          search: "",
          limit: 5,
          page: 0,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        },
        token
      );

      if (res?.statusCode === RES_CODE_OK && res.data) {
        const count = res.data.filter(
          (j) => j.status === "QUEUED" || j.status === "PROCESSING"
        ).length;
        setActiveJobsCount(count);
      }
    } catch {
      // Ignore background errors
    }
  }, [getStoredToken, ListDownloadJobs]);

  // Initial single check on mount
  useEffect(() => {
    refreshActiveCount();
  }, []); // Run only once on mount

  // Smart polling: Only poll when activeJobsCount > 0
  useEffect(() => {
    if (activeJobsCount <= 0) return;

    const interval = setInterval(() => {
      refreshActiveCount();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeJobsCount, refreshActiveCount]);

  const openDownloadManager = useCallback(() => setIsOpen(true), []);
  const closeDownloadManager = useCallback(() => setIsOpen(false), []);
  const toggleDownloadManager = useCallback(() => setIsOpen((prev) => !prev), []);

  const requestExport = useCallback(
    async (payload: ExportRequestPayload): Promise<boolean> => {
      const token = getStoredToken();
      if (!token) {
        showToast({
          description: "Sesi autentikasi tidak valid. Silakan login kembali.",
          statusToast: "error",
        });
        return false;
      }

      const res = await RequestExportJob(payload, token);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Permintaan ekspor ${payload.exportType} telah dijadwalkan di latar belakang.`,
          statusToast: "success",
        });
        setIsOpen(true);
        setActiveJobsCount((prev) => prev + 1);
        refreshActiveCount();
        return true;
      } else {
        showToast({
          description: res?.message || "Gagal menjadwalkan ekspor.",
          statusToast: "error",
        });
        return false;
      }
    },
    [getStoredToken, RequestExportJob, refreshActiveCount, showToast]
  );

  return (
    <DownloadManagerContext.Provider
      value={{
        isDownloadManagerOpen: isOpen,
        openDownloadManager,
        closeDownloadManager,
        toggleDownloadManager,
        activeJobsCount,
        requestExport,
        refreshActiveCount,
      }}
    >
      {children}
      <DownloadManagerDrawer
        isOpen={isOpen}
        onClose={closeDownloadManager}
        tokenData={typeof window !== "undefined" ? localStorage.getItem("tokenData") || "" : ""}
        onActiveJobsChange={setActiveJobsCount}
      />
    </DownloadManagerContext.Provider>
  );
};

export const useDownloadManagerModal = (): DownloadManagerContextInterface => {
  const context = useContext(DownloadManagerContext);
  if (!context) {
    throw new Error(
      "useDownloadManagerModal must be used within a DownloadManagerProvider"
    );
  }
  return context;
};
