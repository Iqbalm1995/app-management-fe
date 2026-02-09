"use client";

import { useState } from "react";
import { ApiGenericResponse, PaggingListPayload } from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

export interface SdlcFlowResponse {
  id: string;
  projectType: string;
  sdlcCode: string;
  sdlcName: string;
  sdlcDesc: string;
  isActive: string;
  stageCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SdlcFlowInsertPayload {
  projectType: string;
  sdlcCode: string;
  sdlcName: string;
  sdlcDesc: string;
  isActive: string;
}

export interface SdlcFlowUpdatePayload {
  id: string;
  projectType: string;
  sdlcCode: string;
  sdlcName: string;
  sdlcDesc: string;
  isActive: string;
}

interface useSdlcFlowService {
  ListSdlcFlow: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<SdlcFlowResponse[] | null> | null>;
  GetSdlcFlowById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<SdlcFlowResponse | null> | null>;
  InsertSdlcFlow: (
    payload: SdlcFlowInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateSdlcFlow: (
    payload: SdlcFlowUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteSdlcFlow: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useSdlcFlow = (): useSdlcFlowService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListSdlcFlow = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<SdlcFlowResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/api/v1/SdlcFlow/list";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<SdlcFlowResponse[]>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching SDLC flows.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const GetSdlcFlowById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<SdlcFlowResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/api/v1/SdlcFlow/detail/${id}`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<SdlcFlowResponse>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching SDLC flow details.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const InsertSdlcFlow = async (
    payload: SdlcFlowInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/api/v1/SdlcFlow/insert";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error creating SDLC flow.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const UpdateSdlcFlow = async (
    payload: SdlcFlowUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/api/v1/SdlcFlow/update";

    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error updating SDLC flow.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const DeleteSdlcFlow = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/api/v1/SdlcFlow/delete/${id}`;

    try {
      const response = await axiosInstance.delete<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error deleting SDLC flow.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  return {
    ListSdlcFlow,
    GetSdlcFlowById,
    InsertSdlcFlow,
    UpdateSdlcFlow,
    DeleteSdlcFlow,
    isLoading,
    error,
  };
};

export default useSdlcFlow;
