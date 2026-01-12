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

export interface SysModuleGroupResponse {
  id: string;
  modCode: string;
  modName: string;
  modDescriptions?: string | null;
  isActive: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface SysModuleGroupInsertPayload {
  modCode: string;
  modName: string;
  modDescriptions?: string | null;
}

export interface SysModuleGroupUpdatePayload {
  id: string;
  modCode: string;
  modName: string;
  modDescriptions?: string | null;
  isActive: string;
}

export interface ModuleMenuAssignPayload {
  moduleId: string;
  menuIds: string[];
}

interface useSysModuleGroupServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<SysModuleGroupResponse[] | null> | null>;
  GetDetailById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<SysModuleGroupResponse | null> | null>;
  GetDetailByCode: (
    code: string,
    token: string
  ) => Promise<ApiGenericResponse<SysModuleGroupResponse | null> | null>;
  Insert: (
    payload: SysModuleGroupInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Update: (
    payload: SysModuleGroupUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Delete: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetAssignedMenus: (
    moduleId: string,
    token: string
  ) => Promise<ApiGenericResponse<string[] | null> | null>;
  AssignMenus: (
    payload: ModuleMenuAssignPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useSysModuleGroup = (): useSysModuleGroupServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<SysModuleGroupResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysModuleGroup/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<SysModuleGroupResponse[]>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const GetDetailById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<SysModuleGroupResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/SysModuleGroup/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<SysModuleGroupResponse>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const GetDetailByCode = async (
    code: string,
    token: string
  ): Promise<ApiGenericResponse<SysModuleGroupResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/SysModuleGroup/code/${code}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<SysModuleGroupResponse>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const Insert = async (
    payload: SysModuleGroupInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysModuleGroup/insert";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const Update = async (
    payload: SysModuleGroupUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysModuleGroup/update";
    try {
      const response = await axiosInstance.put<
        ApiGenericResponse<string>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
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
    const PathEndpoint: string = `/v1/SysModuleGroup/${id}`;
    try {
      const response = await axiosInstance.delete<
        ApiGenericResponse<string>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const GetAssignedMenus = async (
    moduleId: string,
    token: string
  ): Promise<ApiGenericResponse<string[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/SysModuleGroup/assigned-menus/${moduleId}`;
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  const AssignMenus = async (
    payload: ModuleMenuAssignPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/SysModuleGroup/assign-menus";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
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
          err.response?.data?.message || "An error occurred."
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          message: "An unexpected error occurred.",
          data: null,
        };
      }
    }
  };

  return {
    List,
    GetDetailById,
    GetDetailByCode,
    Insert,
    Update,
    Delete,
    GetAssignedMenus,
    AssignMenus,
    isLoading,
    error,
  };
};

export default useSysModuleGroup;
