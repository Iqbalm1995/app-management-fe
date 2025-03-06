"use client";

import { useState } from "react";
import { ApiGenericResponse } from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

export interface AuthenticationPayload {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  apiKey: string;
  expiration: string;
}

export interface AuthDataTeamMemberResponse {
  id: string;
  teamCode: string;
  teamName: string;
  teamDesc: string;
  isActive: string;
  teamPict: string;
}

export interface AuthDataTeamRoleResponse {
  id: string;
  teamRoleCode: string;
  teamRoleName: string;
}

export interface AuthDataRoleResponse {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface AuthDataResponse {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: string;
  profilePict: string;
  userEmail: string;
  userPhoneNumber: string;
  teamMember: AuthDataTeamMemberResponse;
  teamRole: AuthDataTeamRoleResponse;
  role: AuthDataRoleResponse;
}

interface useAuthenticationsService {
  Login: (
    payload: AuthenticationPayload
  ) => Promise<ApiGenericResponse<AuthenticationResponse | null> | null>;
  GetAuth: (
    token: string
  ) => Promise<ApiGenericResponse<AuthDataResponse | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useAuthentications = (): useAuthenticationsService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const Login = async (
    payload: AuthenticationPayload
  ): Promise<ApiGenericResponse<AuthenticationResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Authenticate/Login";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AuthenticationResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, payload);
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

  const GetAuth = async (
    token: string
  ): Promise<ApiGenericResponse<AuthDataResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Authenticate/GetAuth";

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AuthDataResponse>
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
    Login,
    GetAuth,
    isLoading,
    error,
  };
};

export default useAuthentications;
