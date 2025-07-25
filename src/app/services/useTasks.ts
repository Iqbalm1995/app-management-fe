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
import { UserShortResponse, UsersResponse } from "./useUsers";
import { MediaObjectResponse } from "./useMediaObject";

export interface TaskItemResponse {
  id: string;
  taskId: string;
  taskItemName: string;
  isDone: string;
  createdAt: string;
}

export interface TaskCommentResponse {
  id: string;
  taskId: string;
  userIdSys: string;
  comCaptions?: string | null;
  createdAt: string;
  createdBy: string;
  taskCommentAttachments: MediaObjectResponse[];
  userCreated: UserShortResponse;
}

export interface TaskCommentInsertPayload {
  taskId: string;
  comCaptions: string;
}

export interface TaskCommentUpdatePayload {
  id: string;
  comCaptions: string;
}

export interface TaskBoardViewModel {
  id: string;
  projectId?: string | null;
  backlogId?: string | null;
  boardCodeStage: string;
  boardName: string;
  indexStage: number; // byte → number
  isDisplay: string;
  boardPoint: number; // byte → number
  isCompleteFlag: string;
  createdAt: string; // or Date if using Date objects in JS
  createdBy: string;
  updatedAt?: string | null; // or Date
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
  countCommnetTask: number;
  countTaskItem: number;
  countTaskItemDone: number;
  countTaskAttachment: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  assignUsers: UserShortResponse[];
  userCreated: UserShortResponse | null;
  taskItems: TaskItemResponse[];
}

export interface CreateSimpleTaskPayload {
  backlogId: string;
  projectId: string;
  boardId: string;
  taskName: string;
}

export interface TaskCreatePayload {
  backlogId?: string;
  projectId?: string;
  boardId: string;
  taskCode: string;
  taskName: string;
  taskDesc?: string;
  taskPriority: string;
  startDate?: string;
  endDate?: string;
}

export interface TaskUpdatePayload {
  id: string;
  boardId: string;
  taskName: string;
  taskDesc?: string;
  taskPriority: string;
  startDate?: string;
  endDate?: string;
  indexTask: number;
  taskPoint: number;
  percentageStatus?: number;
}

export interface TaskArchivePayload {
  taskId: string;
}

export interface TaskMovePayload {
  id: string;
  boardId: string;
  indexTask: number;
  indexStage?: number;
}

export interface TaskItemCreatePayload {
  taskId: string;
  taskItemName: string;
}

export interface TaskItemUpdatePayload {
  id: string;
  taskItemName: string;
  isDone: string;
}

export interface TaskAssignMemberPayload {
  taskId: string;
  userIDs: string[];
}

export interface AssignUsersTaskPayload {
  taskId: string;
  usersData: {
    userId: string;
  }[];
}

interface useTasks {
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
  ListTaskItemsPaged: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<TaskItemResponse[] | null> | null>;
  ListTaskItems: (
    taskId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskItemResponse[] | null> | null>;
  ListTaskCommentsPaged: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<TaskCommentResponse[] | null> | null>;
  ListTaskComments: (
    taskId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskCommentResponse[] | null> | null>;
  GetTaskCommentDetail: (
    taskCommentId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskCommentResponse | null> | null>;
  CreateTaskComment: (
    payload: TaskCommentInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTaskComment: (
    payload: TaskCommentUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteTaskComment: (
    taskCommentId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetTaskItemDetail: (
    taskItemId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskItemResponse | null> | null>;
  GetTaskDetail: (
    taskId: string,
    token: string
  ) => Promise<ApiGenericResponse<TaskViewModel | null> | null>;
  CreateSimpleTask: (
    payload: CreateSimpleTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  CreateTask: (
    payload: TaskCreatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  CreateTaskItem: (
    payload: TaskItemCreatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTaskItem: (
    payload: TaskItemUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteTaskItem: (
    taskItemId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTask: (
    payload: TaskUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ArchiveTask: (
    payload: TaskArchivePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  MoveTask: (
    payload: TaskMovePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  AssignUsersTask: (
    payload: AssignUsersTaskPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  // UPDATE TASK BOARD

  isLoading: boolean;
  error: string | null;
}

const useTasks = (): useTasks => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const ListTaskItemsPaged = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<TaskItemResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Task/paged-list-task-item";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TaskItemResponse[]>
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
            "An error occurred while fetching task items."
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

  const ListTaskItems = async (
    taskId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskItemResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/list-task-item?taskId=${taskId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskItemResponse[]>
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
            "An error occurred while fetching task items."
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

  const ListTaskCommentsPaged = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<TaskCommentResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Task/paged-list-task-comments";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TaskCommentResponse[]>
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
            "An error occurred while fetching task comments."
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

  const ListTaskComments = async (
    taskId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskCommentResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/list-task-comments?taskId=${taskId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskCommentResponse[]>
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
          err.response?.data?.message ||
            "An error occurred while fetching task comments."
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

  const GetTaskCommentDetail = async (
    taskCommentId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskCommentResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/detail-task-comment/id/${taskCommentId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskCommentResponse>
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
          err.response?.data?.message ||
            "An error occurred while fetching task comment details."
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

  const CreateTaskComment = async (
    payload: TaskCommentInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/create-task-comment`;
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
          err.response?.data?.message ||
            "An error occurred while creating task comment."
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

  const UpdateTaskComment = async (
    payload: TaskCommentUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/update-task-comment`;
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
          err.response?.data?.message ||
            "An error occurred while updating task comment."
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

  const DeleteTaskComment = async (
    taskCommentId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/delete-task-comment/id/${taskCommentId}`;
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
        setError(
          err.response?.data?.message ||
            "An error occurred while deleting task comment."
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

  const GetTaskItemDetail = async (
    taskItemId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskItemResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/detail-task-item/id/${taskItemId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TaskItemResponse>
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
            "An error occurred while fetching task item details."
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

  const GetTaskDetail = async (
    taskId: string,
    token: string
  ): Promise<ApiGenericResponse<TaskViewModel | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/detail-task/id/${taskId}`;
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
          err.response?.data?.message ||
            "An error occurred while fetching task details."
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

  const CreateTask = async (
    payload: TaskCreatePayload,
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
          err.response?.data?.message ||
            "An error occurred while creating task."
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

  const CreateTaskItem = async (
    payload: TaskItemCreatePayload,
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
          err.response?.data?.message ||
            "An error occurred while creating task item."
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

  const UpdateTaskItem = async (
    payload: TaskItemUpdatePayload,
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
          err.response?.data?.message ||
            "An error occurred while updating task item."
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

  const DeleteTaskItem = async (
    taskItemId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/delete-task-item/id/${taskItemId}`;
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
          err.response?.data?.message ||
            "An error occurred while deleting task item."
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

  const UpdateTask = async (
    payload: TaskUpdatePayload,
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
          err.response?.data?.message ||
            "An error occurred while updating task."
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

  const ArchiveTask = async (
    payload: TaskArchivePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/archive-task`;
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
          err.response?.data?.message ||
            "An error occurred while archiving task."
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

  const MoveTask = async (
    payload: TaskMovePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/move-task`;
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
          err.response?.data?.message || "An error occurred while moving task."
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

  const AssignUsersTask = async (
    payload: AssignUsersTaskPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Task/task-assign-user`;
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
          err.response?.data?.message ||
            "An error occurred while assigning users to task."
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
    ListTasksBoardPaged,
    ListTasksBoard,
    ListTasksPaged,
    ListTaskItemsPaged,
    ListTaskItems,
    ListTaskCommentsPaged,
    ListTaskComments,
    GetTaskCommentDetail,
    CreateTaskComment,
    UpdateTaskComment,
    DeleteTaskComment,
    GetTaskItemDetail,
    GetTaskDetail,
    CreateSimpleTask,
    CreateTask,
    CreateTaskItem,
    UpdateTask,
    UpdateTaskItem,
    DeleteTaskItem,
    ArchiveTask,
    MoveTask,
    AssignUsersTask,
    isLoading,
    error,
  };
};

export default useTasks;
