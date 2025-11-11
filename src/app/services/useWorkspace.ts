"use client";

import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import handleAxiosError from "../utils/handleAxiosError";

// Types
export interface WorkspaceStatsViewModel {
  todayTasks: number;
  weeklyTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  myTasks: number;
}

export interface WorkspaceDashboardViewModel {
  todayTasksCompleted: number;
  todayTasksTotal: number;
  weeklyTimeTracked: number;
  weeklyGoal: number;
  tasksOverdue: number;
  tasksDueTomorrow: number;
  dailyProductivityScore: number;
}

export interface WorkspaceUnreadCountViewModel {
  count: number;
}

export interface WorkspaceActivityLogViewModel {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: string;
  userName: string;
}

export interface WorkspaceNotificationViewModel {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface WorkspaceMyTasksViewModel {
  tasks: WorkspaceTaskViewModel[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface WorkspaceTaskViewModel {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectName: string;
  assignedTo: string;
}

export interface WorkspaceCalendarTaskViewModel {
  id: string;
  taskName: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  projectName: string;
  projectId: string;
  color: string;
}

export interface WorkspaceProjectViewModel {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  teamSize: number;
  priority: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const useWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const GetWorkspaceStats = async (tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      const PathEndpoint: string = "/v1/Workspace/stats";
      
      const response = await axiosInstance.get(
        `${UrlEndpoint}${PathEndpoint}`,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetWorkspaceDashboard = async (tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/dashboard`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetAssignedProjects = async (payload: any, tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/workspace/assigned-projects`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetCalendarTasks = async (payload: any, tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/calendar/tasks`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetMyTasks = async (tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/my-tasks`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetNotifications = async (payload: any, tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/notifications`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetActivityLog = async (payload: any, tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/activity-log`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetUnreadCount = async (tokenData: string) => {
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      
      const response = await axiosInstance.post(
        `${UrlEndpoint}/api/v1/workspace/unread-count`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  const GetProjectDetail = async (projectId: string, tokenData: string) => {
    console.log("[DEBUG] GetProjectDetail called with projectId:", projectId);
    setLoading(true);
    try {
      const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
      console.log("[DEBUG] Making request to:", `${UrlEndpoint}/v1/Workspace/projects/${projectId}/detail`);
      
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/Workspace/projects/${projectId}/detail`,
        {
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        }
      );

      console.log("[DEBUG] GetProjectDetail response:", response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("[DEBUG] GetProjectDetail error:", error);
      setLoading(false);
      return handleAxiosError(error);
    }
  };

  return {
    // Methods
    GetWorkspaceStats,
    GetWorkspaceDashboard,
    GetAssignedProjects,
    GetCalendarTasks,
    GetMyTasks,
    GetNotifications,
    GetActivityLog,
    GetUnreadCount,
    GetProjectDetail,
    
    // Loading states
    loading,
  };
};

export default useWorkspace;
