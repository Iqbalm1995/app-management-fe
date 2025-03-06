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

export interface MasterUserResponse {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  password: string;
  isActive: string;
  profilePict: string | null;
  lastLogin: string | null;
  divisionId: string | null;
  createdAt: string;
  createdBy: string;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: MasterUserRoleResponse;
}

export interface MasterUserRoleResponse {
  id: string;
  roleCode: string;
  roleName: string;
}

interface useMasterUsersService {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<MasterUserResponse[] | null> | null>;
  GetDetailById: (
    roleId: string,
    token: string
  ) => Promise<ApiGenericResponse<MasterUserResponse | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useMasterUsers = (): useMasterUsersService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<MasterUserResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Users/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<MasterUserResponse[]>
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
          err.response?.data?.message || "An error occurred during login."
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

  const GetDetailById = async (
    userId: string,
    token: string
  ): Promise<ApiGenericResponse<MasterUserResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Users/${userId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<MasterUserResponse>
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
          err.response?.data?.message || "An error occurred during login."
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
    List,
    GetDetailById,
    isLoading,
    error,
  };
};

export default useMasterUsers;
