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
import { DownloadManagerItemResponse } from "./useDownloadManager";

export interface QueueMetricsResponse {
  TOTAL: number;
  QUEUED: number;
  PROCESSING: number;
  COMPLETED: number;
  FAILED: number;
  CANCELLED: number;
  DISMISSED: number;
  STUCK: number;
}

const useWorkerQueue = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBaseHeaders = (token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const ListAdminJobs = useCallback(
    async (
      payload: PaggingListPayloadCustom,
      statusFilter?: string,
      token?: string
    ): Promise<ApiGenericResponse<DownloadManagerItemResponse[]>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const queryParam = statusFilter && statusFilter !== "ALL" ? `?statusFilter=${encodeURIComponent(statusFilter)}` : "";
      const url = `${baseUrl}/api/v1/download-manager/admin/list${queryParam}`;

      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<DownloadManagerItemResponse[]>
        >(url, payload, {
          headers: getBaseHeaders(token),
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
          data: [],
        };
      }
    },
    []
  );

  const GetQueueMetrics = useCallback(
    async (token?: string): Promise<ApiGenericResponse<QueueMetricsResponse>> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/admin/metrics`;

      try {
        const response = await axiosInstance.get<
          ApiGenericResponse<QueueMetricsResponse>
        >(url, {
          headers: getBaseHeaders(token),
        });
        return response.data;
      } catch (err: any) {
        const parsedError = handleAxiosError(err);
        return {
          statusCode: parsedError.statusCode || RES_CODE_SERVER_ERROR,
          message: parsedError.message,
          data: {
            TOTAL: 0,
            QUEUED: 0,
            PROCESSING: 0,
            COMPLETED: 0,
            FAILED: 0,
            CANCELLED: 0,
            DISMISSED: 0,
            STUCK: 0,
          },
        };
      }
    },
    []
  );

  const CancelJob = useCallback(
    async (jobId: string, token?: string): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/admin/cancel/${jobId}`;

      try {
        const response = await axiosInstance.post<ApiGenericResponse<any>>(
          url,
          {},
          { headers: getBaseHeaders(token) }
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

  const DismissJob = useCallback(
    async (jobId: string, token?: string): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/admin/dismiss/${jobId}`;

      try {
        const response = await axiosInstance.post<ApiGenericResponse<any>>(
          url,
          {},
          { headers: getBaseHeaders(token) }
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

  const RetryJob = useCallback(
    async (jobId: string, token?: string): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/admin/retry/${jobId}`;

      try {
        const response = await axiosInstance.post<ApiGenericResponse<any>>(
          url,
          {},
          { headers: getBaseHeaders(token) }
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

  const PurgeStuckJobs = useCallback(
    async (thresholdMinutes: number = 5, token?: string): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/admin/purge-stuck?thresholdMinutes=${thresholdMinutes}`;

      try {
        const response = await axiosInstance.post<ApiGenericResponse<any>>(
          url,
          {},
          { headers: getBaseHeaders(token) }
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
    async (jobId: string, fileName?: string, token?: string): Promise<boolean> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/download/${jobId}`;

      try {
        const response = await axiosInstance.get(url, {
          headers: getBaseHeaders(token),
          responseType: "blob",
        });

        if (response.data) {
          const contentDisposition =
            response.headers?.["content-disposition"] || response.headers?.["Content-Disposition"];
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
      } catch {
        return false;
      }
    },
    []
  );

  const ResendOtpAdmin = useCallback(
    async (
      jobId: string,
      customEmail?: string,
      token?: string
    ): Promise<ApiGenericResponse<any>> => {
      setIsLoading(true);
      setError(null);
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const queryParam = customEmail ? `?customEmail=${encodeURIComponent(customEmail)}` : "";
      const url = `${baseUrl}/api/v1/download-manager/admin/resend-otp/${jobId}${queryParam}`;

      try {
        const response = await axiosInstance.post<ApiGenericResponse<any>>(
          url,
          {},
          { headers: getBaseHeaders(token) }
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

  const GetJobOtpLogs = useCallback(
    async (
      jobId: string,
      token?: string
    ): Promise<ApiGenericResponse<any[]>> => {
      const baseUrl = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const url = `${baseUrl}/api/v1/download-manager/otp-logs/${jobId}`;

      try {
        const response = await axiosInstance.get<ApiGenericResponse<any[]>>(
          url,
          { headers: getBaseHeaders(token) }
        );
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

  return {
    ListAdminJobs,
    GetQueueMetrics,
    CancelJob,
    DismissJob,
    RetryJob,
    PurgeStuckJobs,
    DownloadExportFile,
    ResendOtpAdmin,
    GetJobOtpLogs,
    isLoading,
    error,
  };
};

export default useWorkerQueue;
