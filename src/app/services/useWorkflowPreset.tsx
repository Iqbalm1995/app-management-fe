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
import { WorkflowGroupResponse } from "./useWorkflow";

export interface WorkflowPresetResponse {
  id: string;
  wfPresetName: string;
  wfPresetDesc: string;
  wfCategoryId: string;
  wfCategoryCode: string;
  wfCategoryName: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  workflowData: WorkflowGroupResponse[];
}

export interface WorkflowPresetInsertPayload {
  wfPresetName: string;
  wfPresetDesc: string;
  wfgCategoryId: string;
  workflowGroupDataInsert: string[];
}

export interface WorkflowPresetUpdatePayload {
  id: string;
  wfPresetName: string;
  wfPresetDesc: string;
  workflowGroupDataInsert: string[];
  workflowGroupDataRemove: string[];
}

interface useWorkflowPresetService {
  ListWorkflowPreset: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowPresetResponse[] | null> | null>;

  GetWorkflowPresetById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowPresetResponse | null> | null>;

  InsertWorkflowPreset: (
    payload: WorkflowPresetInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  UpdateWorkflowPreset: (
    payload: WorkflowPresetUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  DeleteWorkflowPreset: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useWorkflowPreset = (): useWorkflowPresetService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get list of workflow groups
   * @param payload Pagination parameters
   * @param token Authentication token
   * @returns Array of workflow groups
   */
  const ListWorkflowPreset = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<WorkflowPresetResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowPreset/list";

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<WorkflowPresetResponse[]>
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
  const GetWorkflowPresetById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowPresetResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowPreset/detail/${id}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowPresetResponse>
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
   * Insert new workflow group
   * @param payload Workflow group data to insert
   * @param token Authentication token
   * @returns ID of the newly created workflow group
   */
  const InsertWorkflowPreset = async (
    payload: WorkflowPresetInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowPreset/insert";

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
  const UpdateWorkflowPreset = async (
    payload: WorkflowPresetUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowPreset/update";

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
  const DeleteWorkflowPreset = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowPreset/delete/${id}`;

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
    ListWorkflowPreset,
    GetWorkflowPresetById,
    InsertWorkflowPreset,
    UpdateWorkflowPreset,
    DeleteWorkflowPreset,
    isLoading,
    error,
  };
};

export default useWorkflowPreset;
