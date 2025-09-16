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
import { MediaObjectResponse } from "./useMediaObject";

// Response interface for Workflow Group
export interface WorkflowGroupResponse {
  id: string;
  parentId?: string | null;
  wfgLevel: number;
  wfgOrder: number;
  wfgCode: string;
  wfgName: string;
  wfgDesc?: string | null;
  wfgCategoryId: string;
  wfgCategoryName: string;
  wfgCategoryCode: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  workflowChild: WorkflowGroupResponse[];
}

// Payload interface for inserting workflow group
export interface WorkflowGroupInsertPayload {
  parentId?: string | null;
  wfgOrder: number;
  wfgName: string;
  wfgDesc?: string | null;
  wfgLevel: number;
  wfgCategoryId: string;
}

// Payload interface for updating workflow group
export interface WorkflowGroupUpdatePayload {
  id: string;
  wfgName: string;
  wfgDesc?: string | null;
  wfgOrder: number;
}

// Interface for the service hook
interface useWorkflowService {
  ListWorkflowGroups: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowGroupResponse[] | null> | null>;
  GetWorkflowGroupByParentId: (
    parentId: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowGroupResponse[] | null> | null>;
  GetWorkflowGroupById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowGroupResponse | null> | null>;
  GetWorkflowGroupByCode: (
    code: string,
    token: string
  ) => Promise<ApiGenericResponse<WorkflowGroupResponse | null> | null>;
  InsertWorkflowGroup: (
    payload: WorkflowGroupInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateWorkflowGroup: (
    payload: WorkflowGroupUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteWorkflowGroup: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useWorkflow = (): useWorkflowService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get list of workflow groups
   * @param payload Pagination parameters
   * @param token Authentication token
   * @returns Array of workflow groups
   */
  const ListWorkflowGroups = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<WorkflowGroupResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowGroup/group/list";

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<WorkflowGroupResponse[]>
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
   * Get list of workflow groups
   * @param parentId parameters
   * @param token Authentication token
   * @returns Array of workflow groups
   */
  const GetWorkflowGroupByParentId = async (
    parentId: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowGroupResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowGroup/group/parent/${parentId}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowGroupResponse[]>
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
  const GetWorkflowGroupById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowGroupResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowGroup/group/detail/${id}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowGroupResponse>
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
  const GetWorkflowGroupByCode = async (
    code: string,
    token: string
  ): Promise<ApiGenericResponse<WorkflowGroupResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowGroup/group/detail/code/${code}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<WorkflowGroupResponse>
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
  const InsertWorkflowGroup = async (
    payload: WorkflowGroupInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowGroup/group/insert";

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
  const UpdateWorkflowGroup = async (
    payload: WorkflowGroupUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/api/v1/WorkflowGroup/group/update";

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
  const DeleteWorkflowGroup = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/api/v1/WorkflowGroup/group/delete/${id}`;

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
    ListWorkflowGroups,
    GetWorkflowGroupByParentId,
    GetWorkflowGroupById,
    GetWorkflowGroupByCode,
    InsertWorkflowGroup,
    UpdateWorkflowGroup,
    DeleteWorkflowGroup,
    isLoading,
    error,
  };
};

export default useWorkflow;
