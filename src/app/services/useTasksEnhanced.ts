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
import { UserShortResponse } from "./useUsers";
import { MediaObjectResponse } from "./useMediaObject";

// Re-export existing interfaces from useTasks
export interface TaskItemViewModel {
  id: string;
  taskId: string;
  taskItemName: string;
  isDone: string;
  createdAt: string;
}

export interface TaskBoardViewModel {
  id: string;
  projectId?: string | null;
  backlogId?: string | null;
  boardCodeStage: string;
  boardName: string;
  indexStage: number;
  isDisplay: string;
  boardPoint: number;
  isCompleteFlag: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface TaskViewModel {
  id: string;
  projectId?: string | null;
  taskCode: string;
  taskName: string;
  taskDesc?: string | null;
  taskPriority: string;
  startDate?: string | null;
  endDate?: string | null;
  isArchived?: string | null;
  indexTask: number;
  isCompleted: string;
  percentageStatus: number;
  backlogId?: string | null;
  boardId: string;
  boardCodeStage: string;
  boardName: string;
  boardIndexStage: number;
  taskPoint: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  assignUsers: UserShortResponse[];
  userCreated: UserShortResponse | null;
  taskItems: TaskItemViewModel[];
}

// New interfaces for enhanced functionality

export interface CreateTaskPayload {
  backlogId: string;
  projectId: string;
  boardId: string;
  taskName: string;
  taskDesc?: string;
  taskPriority: string;
  startDate?: string;
  endDate?: string;
  taskPoint?: number;
  assignUserIds?: string[];
}

export interface CreateSimpleTaskPayload {
  backlogId: string;
  projectId: string;
  boardId: string;
  taskName: string;
}

export interface UpdateTaskPayload {
  id: string;
  taskName: string;
  taskDesc?: string;
  taskPriority: string;
  startDate?: string;
  endDate?: string;
  taskPoint?: number;
  percentageStatus?: number;
  isCompleted?: string;
}

export interface UpdateTaskBoardPayload {
  taskId: string;
  boardId: string;
}

export interface CreateTaskItemPayload {
  taskId: string;
  taskItemName: string;
}

export interface UpdateTaskItemPayload {
  id: string;
  taskItemName: string;
  isDone: string;
}

export interface AssignUsersToTaskPayload {
  taskId: string;
  userIds: string[];
}

interface useTasksEnhanced {
  // TASK BOARD
  ListTasksBoardPaged: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<TaskBoardViewModel[] | null> | null>;
  
  ListTasksBoard: (
    backlogId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskBoardViewModel[] | null> | null>;
  
  // TASKS
  ListTasksPaged: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<TaskViewModel[] | null> | null>;
  
  GetTaskById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskViewModel | null> | null>;
  
  CreateTask: (
    payload: CreateTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  CreateSimpleTask: (
    payload: CreateSimpleTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  UpdateTask: (
    payload: UpdateTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  DeleteTask: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  // TASK BOARD OPERATIONS
  UpdateTaskBoard: (
    payload: UpdateTaskBoardPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  // TASK ITEMS
  CreateTaskItem: (
    payload: CreateTaskItemPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  UpdateTaskItem: (
    payload: UpdateTaskItemPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  DeleteTaskItem: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  // USER ASSIGNMENTS
  AssignUsersToTask: (
    payload: AssignUsersToTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  RemoveUserFromTask: (
    taskId: string,
    userId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  
  isLoading: boolean;
  error: string | null;
}

const useTasksEnhanced = (): useTasksEnhanced => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get paginated list of task boards
   * @param payload Pagination and filter parameters
   * @param token Authentication token
   * @returns Array of task boards
   */
  const ListTasksBoardPaged = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<TaskBoardViewModel[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Task/paged-list-task-board";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TaskBoardViewModel[]>
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
          err.response?.data?.message || "An error occurred while fetching task boards."
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
   * Get list of task boards for a specific backlog
   * @param backlogId Backlog ID
   * @param token Authentication token
   * @returns Array of task boards
   */
  const ListTasksBoard = async (
    backlogId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskBoardViewModel[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/list-task-board?backlogId=${backlogId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskBoardViewModel[]>
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
          err.response?.data?.message || "An error occurred while fetching task boards."
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
   * Get paginated list of tasks
   * @param payload Pagination and filter parameters
   * @param token Authentication token
   * @returns Array of tasks
   */
  const ListTasksPaged = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<TaskViewModel[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Task/paged-list-task";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TaskViewModel[]>
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
          err.response?.data?.message || "An error occurred while fetching tasks."
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
   * Get task details by ID
   * @param id Task ID
   * @param token Authentication token
   * @returns Task details
   */
  const GetTaskById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<TaskViewModel | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskViewModel>
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
          err.response?.data?.message || "An error occurred while fetching task details."
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
   * Create a new task with full details
   * @param payload Task data
   * @param token Authentication token
   * @returns ID of the created task
   */
  const CreateTask = async (
    payload: CreateTaskPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/create-task`;
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
          err.response?.data?.message || "An error occurred while creating task."
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
   * Create a simple task with minimal details
   * @param payload Simple task data
   * @param token Authentication token
   * @returns ID of the created task
   */
  const CreateSimpleTask = async (
    payload: CreateSimpleTaskPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/create-task-simple`;
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
          err.response?.data?.message || "An error occurred while creating simple task."
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
   * Update an existing task
   * @param payload Task data to update
   * @param token Authentication token
   * @returns ID of the updated task
   */
  const UpdateTask = async (
    payload: UpdateTaskPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/update-task`;
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
          err.response?.data?.message || "An error occurred while updating task."
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
   * Delete a task
   * @param id Task ID to delete
   * @param token Authentication token
   * @returns Success message
   */
  const DeleteTask = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/${id}`;
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
          err.response?.data?.message || "An error occurred while deleting task."
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
   * Update task board assignment (move task to different board)
   * @param payload Task and board data
   * @param token Authentication token
   * @returns Success message
   */
  const UpdateTaskBoard = async (
    payload: UpdateTaskBoardPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/update-task-board`;
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
          err.response?.data?.message || "An error occurred while updating task board."
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
   * Create a new task item (checklist item)
   * @param payload Task item data
   * @param token Authentication token
   * @returns ID of the created task item
   */
  const CreateTaskItem = async (
    payload: CreateTaskItemPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/create-task-item`;
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
          err.response?.data?.message || "An error occurred while creating task item."
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
   * Update an existing task item
   * @param payload Task item data to update
   * @param token Authentication token
   * @returns ID of the updated task item
   */
  const UpdateTaskItem = async (
    payload: UpdateTaskItemPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/update-task-item`;
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
          err.response?.data?.message || "An error occurred while updating task item."
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
   * Delete a task item
   * @param id Task item ID to delete
   * @param token Authentication token
   * @returns Success message
   */
  const DeleteTaskItem = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/task-item/${id}`;
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
          err.response?.data?.message || "An error occurred while deleting task item."
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
   * Assign users to a task
   * @param payload Task and user IDs
   * @param token Authentication token
   * @returns Success message
   */
  const AssignUsersToTask = async (
    payload: AssignUsersToTaskPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/assign-users`;
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
          err.response?.data?.message || "An error occurred while assigning users to task."
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
   * Remove a user from a task
   * @param taskId Task ID
   * @param userId User ID to remove
   * @param token Authentication token
   * @returns Success message
   */
  const RemoveUserFromTask = async (
    taskId: string,
    userId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/${taskId}/remove-user/${userId}`;
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
          err.response?.data?.message || "An error occurred while removing user from task."
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
    ListTasksBoardPaged,
    ListTasksBoard,
    ListTasksPaged,
    GetTaskById,
    CreateTask,
    CreateSimpleTask,
    UpdateTask,
    DeleteTask,
    UpdateTaskBoard,
    CreateTaskItem,
    UpdateTaskItem,
    DeleteTaskItem,
    AssignUsersToTask,
    RemoveUserFromTask,
    isLoading,
    error,
  };
};

export default useTasksEnhanced;
