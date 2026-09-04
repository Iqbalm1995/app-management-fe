"use client";

import { useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import handleAxiosError from "../utils/handleAxiosError";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_OK,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import { ApiGenericResponse, PaggingListPayloadCustom } from "../types/masterTypes";

export interface DownloadManagerItemResponse {
  id: string;
  userId: string;
  userName?: string | null;
  moduleName: string;
  reportTitle: string;
  exportType: "XLSX" | "PDF" | string;
  filterParamsJson?: string | null;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | string;
  progressPercentage: number;
  totalRecords?: number | null;
  mediaId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  expiredAt?: string | null;
  downloadUrl?: string | null;
  fileName?: string | null;
  fileSizeKb?: number | null;
}

export interface ExportRequestPayload {
  moduleName: string;
  reportTitle: string;
  exportType: "XLSX" | "PDF" | string;
  filterParams?: any;
}

const useDownloadManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const RequestExportJob = useCallback(
    async (
      payload: ExportRequestPayload,
      token: string,
    ): Promise<ApiGenericResponse<DownloadManagerItemResponse>> => {
      setIsLoading(true);
      setError(null);

      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/export-request`;

      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<DownloadManagerItemResponse>
        >(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setIsLoading(false);
        return response.data;
      } catch (err: any) {
        const parsedError = handleAxiosError(err);
        setError(parsedError.message);
        setIsLoading(false);
        return {
          statusCode: parsedError.statusCode || RES_CODE_SERVER_ERROR,
          message: parsedError.message,
          data: undefined as any,
        };
      }
    },
    []
  );

  const ListDownloadJobs = useCallback(
    async (
      payload: PaggingListPayloadCustom,
      token: string,
    ): Promise<ApiGenericResponse<DownloadManagerItemResponse[]>> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/list`;

      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<DownloadManagerItemResponse[]>
        >(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        return response.data;
      } catch (err: any) {
        const parsedError = handleAxiosError(err);
        return {
          statusCode: parsedError.statusCode || RES_CODE_SERVER_ERROR,
          message: parsedError.message,
          data: [],
        };
      }
    },
    []
  );

  const GetDownloadJobStatus = useCallback(
    async (
      jobId: string,
      token: string,
    ): Promise<ApiGenericResponse<DownloadManagerItemResponse>> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/status/${jobId}`;

      try {
        const response = await axiosInstance.get<
          ApiGenericResponse<DownloadManagerItemResponse>
        >(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (err: any) {
        const parsedError = handleAxiosError(err);
        return {
          statusCode: parsedError.statusCode || RES_CODE_SERVER_ERROR,
          message: parsedError.message,
          data: undefined as any,
        };
      }
    },
    []
  );

  const DeleteDownloadJob = useCallback(
    async (
      jobId: string,
      token: string,
    ): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);

      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/${jobId}`;

      try {
        const response = await axiosInstance.delete<ApiGenericResponse<any>>(
          url,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsLoading(false);
        return response.data;
      } catch (err: any) {
        const parsedError = handleAxiosError(err);
        setError(parsedError.message);
        setIsLoading(false);
        return {
          statusCode: parsedError.statusCode || RES_CODE_SERVER_ERROR,
          message: parsedError.message,
          data: null,
        };
      }
    },
    []
  );

  const DownloadExportFile = useCallback(
    async (
      jobId: string,
      fileName: string,
      token: string,
    ): Promise<boolean> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/download/${jobId}`;

      try {
        const response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });

        if (response.data) {
          const contentDisposition = response.headers?.["content-disposition"] || response.headers?.["Content-Disposition"];
          let downloadName = fileName;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
              downloadName = match[1].replace(/['"]/g, "").trim();
            }
          }
          if (!downloadName) {
            downloadName = `Export_${jobId}.zip`;
          }

          const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = blobUrl;
          link.setAttribute("download", downloadName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          return true;
        }
        return false;
      } catch (err: any) {
        return false;
      }
    },
    []
  );

  return {
    RequestExportJob,
    ListDownloadJobs,
    GetDownloadJobStatus,
    DeleteDownloadJob,
    DownloadExportFile,
    isLoading,
    error,
  };
};

export default useDownloadManager;
