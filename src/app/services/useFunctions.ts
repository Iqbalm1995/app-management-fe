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

// FUNCTIONS IDS
export interface FunctionIdsResponse {
  id: string;
  functionId: string;
  functionName: string;
  desc?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface FunctionIdsShortResponse {
  id: string;
  functionId: string;
  functionName: string;
  desc?: string | null;
}

export interface FunctionIdsRegisterPayload {
  functionId: string;
  functionName: string;
  desc?: string | null;
}

export interface FunctionIdsUpdatePayload {
  id: string;
  functionId: string;
  functionName: string;
  desc?: string | null;
}

// FUNCTIONS GROUPS
export interface FunctionGroupsResponse {
  id: string;
  funcGroupCode: string;
  funcGroupName: string;
  funcGroupDesc?: string | null;
  allowMaker: string;
  allowChecker: string;
  allowApprover: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  assignedFunctions: FunctionIdsShortResponse[];
}

export interface FunctionGroupsRegisterPayload {
  funcGroupCode: string;
  funcGroupName: string;
  funcGroupDesc?: string | null;
  allowMaker: string;
  allowChecker: string;
  allowApprover: string;
}

export interface FunctionGroupsUpdatePayload {
  id: string;
  funcGroupCode: string;
  funcGroupName: string;
  funcGroupDesc?: string | null;
  allowMaker: string;
  allowChecker: string;
  allowApprover: string;
}

export interface FunctionGroupsManagePayload {
  functionGroupId: string;
  assignFunctionIds: string[];
  removeFunctionIds: string[];
}

export interface FunctionGroupsManageResponse {
  functionGroupId: string;
  assignedCount: number;
  removedCount: number;
  totalFunctions: number;
  invalidAssignFunctionIds: string[];
  invalidRemoveFunctionIds: string[];
  finalAssignedFunctionIds: string[];
}

interface useFunctionsDataServices {
  // FUNCTIONS
  ListFunctionData: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<FunctionIdsResponse[] | null> | null>;
  GetDetailFunctionData: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<FunctionIdsResponse | null> | null>;
  RegiterFunctionData: (
    payload: FunctionIdsRegisterPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateFunctionData: (
    payload: FunctionIdsUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteFunctionData: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  // FUNCTION GROUP
  ListFunctionGroupData: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<FunctionGroupsResponse[] | null> | null>;
  GetDetailFunctionGroupData: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<FunctionGroupsResponse | null> | null>;
  RegiterFunctionGroupData: (
    payload: FunctionGroupsRegisterPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateFunctionGroupData: (
    payload: FunctionGroupsUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteFunctionGroupData: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ManageFunctionGroupData: (
    payload: FunctionGroupsManagePayload,
    token: string
  ) => Promise<ApiGenericResponse<FunctionGroupsManageResponse | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useFunctionData = (): useFunctionsDataServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const UrlEndpoint: string = buildUrlPort(
    ENDPOINT_API_BASEURL,
    ENDPOINT_PORT_BASIC
  );

  // ------------------ FUNCTIONS ------------------

  const ListFunctionData: useFunctionsDataServices["ListFunctionData"] = async (
    payload,
    token
  ) => {
    setIsLoading(true);
    setError(null);
    const PathEndpoint = "/v1/FunctionIds/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<FunctionIdsResponse[]>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message || "Failed to fetch function list."
        );
        return errorResponse;
      }
      setError("Unexpected error occurred.");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to API",
        error: null,
      };
    }
  };

  const GetDetailFunctionData: useFunctionsDataServices["GetDetailFunctionData"] =
    async (id, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = `/v1/FunctionIds/${id}`;
      try {
        const response = await axiosInstance.get<
          ApiGenericResponse<FunctionIdsResponse>
        >(`${UrlEndpoint}${PathEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(
            err.response?.data?.message || "Failed to fetch function detail."
          );
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const RegiterFunctionData: useFunctionsDataServices["RegiterFunctionData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = "/v1/FunctionIds/register";
      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(
            err.response?.data?.message || "Failed to register function."
          );
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const UpdateFunctionData: useFunctionsDataServices["UpdateFunctionData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = "/v1/FunctionIds/update";
      try {
        const response = await axiosInstance.put<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(err.response?.data?.message || "Failed to update function.");
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const DeleteFunctionData: useFunctionsDataServices["DeleteFunctionData"] =
    async (id, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = `/v1/FunctionIds/delete/${id}`;
      try {
        const response = await axiosInstance.delete<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(err.response?.data?.message || "Failed to delete function.");
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  // ------------------ FUNCTION GROUP ------------------

  const ListFunctionGroupData: useFunctionsDataServices["ListFunctionGroupData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = "/v1/FunctionGroups/list";
      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<FunctionGroupsResponse[]>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(
            err.response?.data?.message || "Failed to fetch group list."
          );
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const GetDetailFunctionGroupData: useFunctionsDataServices["GetDetailFunctionGroupData"] =
    async (id, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = `/v1/FunctionGroups/${id}`;
      try {
        const response = await axiosInstance.get<
          ApiGenericResponse<FunctionGroupsResponse>
        >(`${UrlEndpoint}${PathEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(
            err.response?.data?.message || "Failed to fetch group detail."
          );
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const RegiterFunctionGroupData: useFunctionsDataServices["RegiterFunctionGroupData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = "/v1/FunctionGroups/register";
      try {
        const response = await axiosInstance.post<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(err.response?.data?.message || "Failed to register group.");
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const UpdateFunctionGroupData: useFunctionsDataServices["UpdateFunctionGroupData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = "/v1/FunctionGroups/update";
      try {
        const response = await axiosInstance.put<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(err.response?.data?.message || "Failed to update group.");
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const DeleteFunctionGroupData: useFunctionsDataServices["DeleteFunctionGroupData"] =
    async (id, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = `/v1/FunctionGroups/delete/${id}`;
      try {
        const response = await axiosInstance.delete<
          ApiGenericResponse<string | null>
        >(`${UrlEndpoint}${PathEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(err.response?.data?.message || "Failed to delete group.");
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  const ManageFunctionGroupData: useFunctionsDataServices["ManageFunctionGroupData"] =
    async (payload, token) => {
      setIsLoading(true);
      setError(null);
      const PathEndpoint = `/v1/FunctionGroups/manage-functions/${payload.functionGroupId}`;
      try {
        const response = await axiosInstance.put<
          ApiGenericResponse<FunctionGroupsManageResponse | null>
        >(`${UrlEndpoint}${PathEndpoint}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        if (axios.isAxiosError(err)) {
          const errorResponse = handleAxiosError(err);
          setError(
            err.response?.data?.message || "Failed to manage group functions."
          );
          return errorResponse;
        }
        setError("Unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to API",
          error: null,
        };
      }
    };

  // ------------------ RETURN ------------------
  return {
    ListFunctionData,
    GetDetailFunctionData,
    RegiterFunctionData,
    UpdateFunctionData,
    DeleteFunctionData,
    ListFunctionGroupData,
    GetDetailFunctionGroupData,
    RegiterFunctionGroupData,
    UpdateFunctionGroupData,
    DeleteFunctionGroupData,
    ManageFunctionGroupData,
    isLoading,
    error,
  };
};

export default useFunctionData;
