"use client";

import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import { ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC } from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { ApiGenericResponse } from "../types/masterTypes";

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  nodeType: "root" | "module" | "category" | "year" | "quarter" | "entity";
  referenceId?: string | null;
  moduleKey?: string | null;
  fileCount: number;
  totalSizeBytes: number;
  children: FolderNode[];
}

export interface FileManagerItem {
  id: string;
  objectCode: string;
  objectName: string;
  objectRawName: string;
  objectExtension?: string | null;
  objectSize?: number | null;
  objectSizeFormatted?: string | null;
  createdAt: string;
  createdBy: string;
  moduleName: string;
  categoryName?: string | null;
  yearQuarter?: string | null;
  referenceId?: string | null;
  referenceCode?: string | null;
  referenceName?: string | null;
  virtualPath: string;
}

export interface FileManagerQueryParams {
  module?: string;
  category?: string;
  quarter?: string;
  year?: string;
  referenceId?: string;
  search?: string;
  virtualPath?: string;
  page?: number;
  pageSize?: number;
}

export interface FileManagerFilesResponse {
  data: FileManagerItem[];
  count: number;
  countTotal: number;
  statusCode: number;
  message: string;
}

export interface FileAvailabilityResult {
  mediaId: string;
  objectName: string;
  objectRawName: string;
  isAvailable: boolean;
  storageSource: string;
  bucketName: string;
  objectKey: string;
  sizeBytes?: number;
  sizeFormatted?: string;
  lastModified?: string;
  message: string;
}

interface useFileManagerServices {
  GetFolderTree: (token: string) => Promise<FolderNode | null>;
  GetFiles: (params: FileManagerQueryParams, token: string) => Promise<FileManagerFilesResponse | null>;
  CheckFileAvailability: (mediaId: string, token: string) => Promise<FileAvailabilityResult | null>;
  SecureDownloadFiles: (
    mediaObjectIds: string[],
    token: string,
    referenceId?: string,
    referenceModule?: string,
    zipFileName?: string
  ) => Promise<Blob | null>;
  isLoading: boolean;
  error: string | null;
}

const useFileManager = (): useFileManagerServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);

  const GetFolderTree = async (token: string): Promise<FolderNode | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/FileManager/tree`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data?.data || null;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal memuat struktur folder");
      } else {
        setError("Terjadi kesalahan saat memuat folder");
      }
      return null;
    }
  };

  const GetFiles = async (
    params: FileManagerQueryParams,
    token: string
  ): Promise<FileManagerFilesResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/FileManager/files`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data || null;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal memuat daftar file");
      } else {
        setError("Terjadi kesalahan saat memuat file");
      }
      return null;
    }
  };

  const CheckFileAvailability = async (
    mediaId: string,
    token: string
  ): Promise<FileAvailabilityResult | null> => {
    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/FileManager/check-file/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  };

  const SecureDownloadFiles = async (
    mediaObjectIds: string[],
    token: string,
    referenceId: string = "FILE-MANAGER",
    referenceModule: string = "FileManager",
    zipFileName: string = "FileManager_Export.zip"
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/MediaObjects/secure-download`,
        { mediaObjectIds, referenceId, referenceModule, zipFileName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      let errorMsg = "Terjadi kesalahan saat mengunduh file.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            errorMsg = json.message || json.title || errorMsg;
          } catch {
            errorMsg = "Download gagal. Respon server tidak valid.";
          }
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    GetFolderTree,
    GetFiles,
    CheckFileAvailability,
    SecureDownloadFiles,
    isLoading,
    error,
  };
};

export default useFileManager;
