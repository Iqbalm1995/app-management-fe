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

export interface AuthorizeGroupResponse {
  id: string;
  agCode: string;
  agName: string;
  agDescriptions?: string | null;
  functionIdLink?: string | null;
  isActive: string;
  agAccessMaker: string;
  agAccessReview: string;
  agAccessApprove: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface AuthorizeGroupInsertPayload {
  agCode: string;
  agName: string;
  agDescriptions?: string | null;
  functionIdLink?: string | null;
  isActive: string;
  agAccessMaker: string;
  agAccessReview: string;
  agAccessApprove: string;
}

export interface AuthorizeGroupUpdatePayload {
  id: string;
  agCode: string;
  agName: string;
  agDescriptions?: string | null;
  functionIdLink?: string | null;
  isActive: string;
  agAccessMaker: string;
  agAccessReview: string;
  agAccessApprove: string;
}

export interface UserAssignResponse {
  id: string;
  userUimSysId: string;
  nama?: string | null;
  userId?: string | null;
  email?: string | null;
  jabatan?: string | null;
  orgName?: string | null;
}

export interface UserAssignPayload {
  authGroupId: string;
  userUimSysIds: string[];
}

interface useAuthorizeGroups {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AuthorizeGroupResponse[] | null> | null>;
  GetDetailById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<AuthorizeGroupResponse | null> | null>;
  Insert: (
    payload: AuthorizeGroupInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Update: (
    payload: AuthorizeGroupUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Delete: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetAssignedUsers: (
    authGroupId: string,
    token: string
  ) => Promise<ApiGenericResponse<UserAssignResponse[] | null> | null>;
  AssignUsers: (
    payload: UserAssignPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UnassignUsers: (
    payload: UserAssignPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useAuthorizeGroups = (): useAuthorizeGroups => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AuthorizeGroupResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/AuthorizeGroup/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AuthorizeGroupResponse[]>
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
          err.response?.data?.message || "An error occurred during request."
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
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AuthorizeGroupResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AuthorizeGroupResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const Insert = async (
    payload: AuthorizeGroupInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/register`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
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
          err.response?.data?.message || "An error occurred during request."
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

  const Update = async (
    payload: AuthorizeGroupUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/update`;
    try {
      const response = await axiosInstance.put<
        ApiGenericResponse<string | null>
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
          err.response?.data?.message || "An error occurred during request."
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

  const Delete = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/delete/${id}`;
    try {
      const response = await axiosInstance.delete<
        ApiGenericResponse<string | null>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetAssignedUsers = async (
    authGroupId: string,
    token: string
  ): Promise<ApiGenericResponse<UserAssignResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/${authGroupId}/users`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<UserAssignResponse[] | null>
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
          err.response?.data?.message || "An error occurred during request."
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

  const AssignUsers = async (
    payload: UserAssignPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/assign-user`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
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
          err.response?.data?.message || "An error occurred during request."
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

  const UnassignUsers = async (
    payload: UserAssignPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/AuthorizeGroup/unassign-user`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
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
          err.response?.data?.message || "An error occurred during request."
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
    Insert,
    Update,
    Delete,
    GetAssignedUsers,
    AssignUsers,
    UnassignUsers,
    isLoading,
    error,
  };
};

export default useAuthorizeGroups;
