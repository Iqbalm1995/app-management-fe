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

export interface WorkflowCategoryResponse {
  id: string;
  wfcCode: string;
  wfcName: string;
  wfcDesc: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkflowCategoryInsertPayload {
  wfcName: string;
  wfcDesc: string;
}

export interface WorkflowCategoryUpdatePayload {
  id: string;
  wfcName: string;
  wfcDesc: string;
}

interface useWorkflowCategoryService {
  ListWorkflowCategory: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowCategoryResponse[] | null> | null>;

  GetWorkflowCategoryById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowCategoryResponse | null> | null>;
  GetWorkflowCategoryByCode: (
    code: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowCategoryResponse | null> | null>;
  InsertWorkflowCategory: (
    payload: WorkflowCategoryInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateWorkflowCategory: (
    payload: WorkflowCategoryUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteWorkflowCategory: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useWorkflowCategory = (): useWorkflowCategoryService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get list of workflow groups
   * @param payload Pagination parameters
   * @param token Authentication token
   * @returns Array of workflow groups
   */
  const ListWorkflowCategory = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<WorkflowCategoryResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowCategory/list";

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<WorkflowCategoryResponse[]>
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
          err.response?.data?.message ||
            "An error occurred while fetching workflow groups."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  /**
   * Get workflow group details by ID
   * @param id Workflow group ID
   * @param token Authentication token
   * @returns Single workflow group details
   */
  const GetWorkflowCategoryById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowCategoryResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowCategory/detail/${id}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowCategoryResponse>
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
          err.response?.data?.message ||
            "An error occurred while fetching workflow group details."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  /**
   * Get workflow group details by code
   * @param code Workflow group code
   * @param token Authentication token
   * @returns Single workflow group details
   */
  const GetWorkflowCategoryByCode = async (
    code: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowCategoryResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowCategory/detail/code/${code}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowCategoryResponse>
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
          err.response?.data?.message ||
            "An error occurred while fetching workflow group details by code."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  /**
   * Insert new workflow group
   * @param payload Workflow group data to insert
   * @param token Authentication token
   * @returns ID of the newly created workflow group
   */
  const InsertWorkflowCategory = async (
    payload: WorkflowCategoryInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowCategory/insert";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while inserting workflow group."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  /**
   * Update existing workflow group
   * @param payload Workflow group data to update
   * @param token Authentication token
   * @returns ID of the updated workflow group
   */
  const UpdateWorkflowCategory = async (
    payload: WorkflowCategoryUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowCategory/update";

    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while updating workflow group."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  /**
   * Delete workflow group by ID
   * @param id Workflow group ID to delete
   * @param token Authentication token
   * @returns ID of the deleted workflow group
   */
  const DeleteWorkflowCategory = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowCategory/delete/${id}`;

    try {
      const response = await axiosInstance.delete<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while deleting workflow group."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connecting to API",
          error: null,
        };
      }
    }
  };

  return {
    ListWorkflowCategory,
    GetWorkflowCategoryById,
    GetWorkflowCategoryByCode,
    InsertWorkflowCategory,
    UpdateWorkflowCategory,
    DeleteWorkflowCategory,
    isLoading,
    error,
  };
};

export default useWorkflowCategory;
