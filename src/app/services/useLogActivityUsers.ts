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
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

export interface LogActivityUserSummaryResponse {
  id: string;
  userFullname: string;
  actoinType: string;
  moduleName: string;
  descriptions: string;
  timestampAct: string;
  status: string;
  ipAddress?: string;
  sourceEnvirontment: string;
}

export interface LogActivityUserDetailResponse {
  id: string;
  userIdUim: string;
  userFullname: string;
  actoinType: string;
  moduleName: string;
  descriptions: string;
  timestampAct: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  sessionToken?: string;
  sourceEnvirontment: string;
  oldDataValuesJson?: string;
  newDataValuesJson?: string;
  errorJson?: string;
}

interface useLogActivityUsersService {
  GetPagedList: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<LogActivityUserSummaryResponse[] | null> | null>;
  GetDetail: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<LogActivityUserDetailResponse | null> | null>;
  GetModules: (
    token: string
  ) => Promise<ApiGenericResponse<string[] | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useLogActivityUsers = (): useLogActivityUsersService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const GetPagedList = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<LogActivityUserSummaryResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/LogActivityUsers/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<LogActivityUserSummaryResponse[]>
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
          err.response?.data?.message || "An error occurred while fetching log data."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  const GetDetail = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<LogActivityUserDetailResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/LogActivityUsers/detail/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<LogActivityUserDetailResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, {
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
          err.response?.data?.message || "An error occurred while fetching log detail."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  const GetModules = async (
    token: string
  ): Promise<ApiGenericResponse<string[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/LogActivityUsers/modules";
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<string[]>
      >(`${UrlEndpoint}${PathEndpoint}`, {
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
          err.response?.data?.message || "An error occurred while fetching modules."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  return {
    GetPagedList,
    GetDetail,
    GetModules,
    isLoading,
    error,
  };
};

export default useLogActivityUsers;
