"use client";

import { useState } from "react";
import {
  ApiGenericResponse,
  PaggingListPayload,
  PaggingListPayloadCustom,
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

export interface UsersResponse {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  lastLogin: string | null;
  divisionId: string | null;
  createdAt: string;
  createdBy: string;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: UserRoleResponse;
  team: UserTeamResponse | null;
  teamRole: UserTeamRoleResponse | null;
}

export interface UsersFullResponse {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  lastLogin: string | null;
  divisionId: string | null;
  createdAt: string;
  createdBy: string;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: UserRoleResponse;
  team: UserTeamResponse | null;
  teamRole: UserTeamRoleResponse | null;
}

export interface UserRoleResponse {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface UserTeamResponse {
  id: string;
  teamCode: string;
  teamName: string;
}

export interface UserTeamRoleResponse {
  id: string;
  teamRoleCode: string;
  teamRoleName: string;
}

interface useUsersServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse[] | null> | null>;
  GetDetailById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useUsers = (): useUsersServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<UsersResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Users/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<UsersResponse[]>
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
    teamId: string,
    token: string
  ): Promise<ApiGenericResponse<UsersResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Users/${teamId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<UsersResponse>
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

export default useUsers;
