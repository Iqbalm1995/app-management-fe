"use client";

import { useState } from "react";
import {
  ApiGenericResponse,
  PaggingListPayload,
} from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

// Types
export interface SysMasterSequencesConfigResponse {
  id: string;
  seqCode: string;
  seqName: string;
  sysModCode: string;
  currentSquenceNumber: number;
  nextSequenceNumber: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SysMasterSequencesConfigUpdatePayload {
  id: string;
  seqCode: string;
  seqName: string;
  sysModCode: string;
  currentSquenceNumber?: number;
  nextSequenceNumber?: number;
}

interface useSysMasterSequencesConfigService {
  GetPagedList: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<SysMasterSequencesConfigResponse[] | null> | null>;
  UpdateSequenceConfigData: (
    data: SysMasterSequencesConfigUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

// Service Hook
const useSysMasterSequencesConfig = (): useSysMasterSequencesConfigService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const GetPagedList = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<SysMasterSequencesConfigResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysMasterSequencesConfig/list";
    
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<SysMasterSequencesConfigResponse[]>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred while fetching sequence data."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return null;
      }
    }
  };

  const UpdateSequenceConfigData = async (
    data: SysMasterSequencesConfigUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysMasterSequencesConfig/update";
    
    try {
      const response = await axiosInstance.put<
        ApiGenericResponse<string>
      >(`${UrlEndpoint}${PathEndpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred while updating sequence data."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return null;
      }
    }
  };

  return {
    GetPagedList,
    UpdateSequenceConfigData,
    isLoading,
    error,
  };
};

export default useSysMasterSequencesConfig;
