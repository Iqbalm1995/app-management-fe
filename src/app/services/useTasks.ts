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
import { UsersResponse } from "./useUsers";
import { MediaObjectResponse } from "./useMediaObject";

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

  return {
    ListTasksBoardPaged,
    ListTasksBoard,
    isLoading,
    error,
  };
};

export default useTasks;
