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
import { UserShortResponse } from "./useUsers";

// Response interface for Notification
export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  targetUrl: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  userId: string;
  user: UserShortResponse | null;
}

// Payload interface for creating a notification
export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: string;
  targetUrl?: string | null;
  userId: string;
}

// Payload interface for updating a notification
export interface UpdateNotificationPayload {
  id: string;
  isRead: boolean;
}

// Payload interface for bulk updating notifications
export interface BulkUpdateNotificationsPayload {
  userIds: string[];
  isRead: boolean;
}

// Interface for the service hook
interface useNotificationsService {
  GetUserNotifications: (
    userId: string,
    token: string
  ) => Promise<ApiGenericResponse<NotificationResponse[] | null> | null>;

  GetUserNotificationsPaged: (
    userId: string,
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<NotificationResponse[] | null> | null>;

  GetNotificationById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<NotificationResponse | null> | null>;

  CreateNotification: (
    payload: CreateNotificationPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  UpdateNotification: (
    payload: UpdateNotificationPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  BulkUpdateNotifications: (
    payload: BulkUpdateNotificationsPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  DeleteNotification: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useNotifications = (): useNotificationsService => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all notifications for a user
   * @param userId User ID
   * @param token Authentication token
   * @returns Array of notifications
   */
  const GetUserNotifications = async (
    userId: string,
    token: string
  ): Promise<ApiGenericResponse<NotificationResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Notifications/user/${userId}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<NotificationResponse[]>
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
            "An error occurred while fetching notifications."
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
   * Get paginated notifications for a user
   * @param userId User ID
   * @param payload Pagination parameters
   * @param token Authentication token
   * @returns Paginated array of notifications
   */
  const GetUserNotificationsPaged = async (
    userId: string,
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<NotificationResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Notifications/user/${userId}/paged`;

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<NotificationResponse[]>
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
            "An error occurred while fetching paginated notifications."
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
   * Get notification details by ID
   * @param id Notification ID
   * @param token Authentication token
   * @returns Single notification details
   */
  const GetNotificationById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<NotificationResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Notifications/${id}`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<NotificationResponse>
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
            "An error occurred while fetching notification details."
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
   * Create a new notification
   * @param payload Notification data to create
   * @param token Authentication token
   * @returns ID of the newly created notification
   */
  const CreateNotification = async (
    payload: CreateNotificationPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Notifications";

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
            "An error occurred while creating notification."
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
   * Update notification read status
   * @param payload Notification data to update
   * @param token Authentication token
   * @returns ID of the updated notification
   */
  const UpdateNotification = async (
    payload: UpdateNotificationPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Notifications";

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
            "An error occurred while updating notification."
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
   * Bulk update notifications read status
   * @param payload Bulk update data
   * @param token Authentication token
   * @returns Success message
   */
  const BulkUpdateNotifications = async (
    payload: BulkUpdateNotificationsPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Notifications/bulk-update";

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
            "An error occurred while bulk updating notifications."
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
   * Delete notification by ID
   * @param id Notification ID to delete
   * @param token Authentication token
   * @returns Success message
   */
  const DeleteNotification = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Notifications/${id}`;

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
            "An error occurred while deleting notification."
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
    GetUserNotifications,
    GetUserNotificationsPaged,
    GetNotificationById,
    CreateNotification,
    UpdateNotification,
    BulkUpdateNotifications,
    DeleteNotification,
    isLoading,
    error,
  };
};

export default useNotifications;
