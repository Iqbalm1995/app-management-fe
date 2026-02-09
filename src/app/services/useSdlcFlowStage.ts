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

export interface SdlcFlowStageResponse {
  id: string;
  sdlcFlowId: string;
  stageCode: string;
  stageName: string;
  stagePosOrder: number;
  stageStatusBeforeTiggerChange: string;
  stageStatusAfterTriggerChange: string;
  stageTriggerStatus: string;
  isRequired: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SdlcFlowStageInsertPayload {
  sdlcFlowId: string;
  stageCode: string;
  stageName: string;
  stagePosOrder: number;
  stageStatusBeforeTiggerChange: string;
  stageStatusAfterTriggerChange: string;
  stageTriggerStatus: string;
  isRequired: string;
}

export interface SdlcFlowStageUpdatePayload {
  id: string;
  sdlcFlowId: string;
  stageCode: string;
  stageName: string;
  stagePosOrder: number;
  stageStatusBeforeTiggerChange: string;
  stageStatusAfterTriggerChange: string;
  stageTriggerStatus: string;
  isRequired: string;
}

interface useSdlcFlowStageService {
  ListByFlowId: (
    flowId: string,
    token: string
  ) => Promise<ApiGenericResponse<SdlcFlowStageResponse[] | null> | null>;
  GetById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<SdlcFlowStageResponse | null> | null>;
  Insert: (
    payload: SdlcFlowStageInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Update: (
    payload: SdlcFlowStageUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Delete: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useSdlcFlowStage = (): useSdlcFlowStageService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListByFlowId = async (
    flowId: string,
    token: string
  ): Promise<ApiGenericResponse<SdlcFlowStageResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/api/v1/SdlcFlowStage/flow/${flowId}`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<SdlcFlowStageResponse[]>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching stages.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const GetById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<SdlcFlowStageResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/api/v1/SdlcFlowStage/${id}`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<SdlcFlowStageResponse>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching stage.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const Insert = async (
    payload: SdlcFlowStageInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/api/v1/SdlcFlowStage/insert";

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
        setError(err.response?.data?.message || "Error creating stage.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const Update = async (
    payload: SdlcFlowStageUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/api/v1/SdlcFlowStage/update";

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
        setError(err.response?.data?.message || "Error updating stage.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  const Delete = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/api/v1/SdlcFlowStage/delete/${id}`;

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
        setError(err.response?.data?.message || "Error deleting stage.");
        return errorResponse;
      }
      setError("Unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connecting to API", error: null };
    }
  };

  return {
    ListByFlowId,
    GetById,
    Insert,
    Update,
    Delete,
    isLoading,
    error,
  };
};

export default useSdlcFlowStage;
