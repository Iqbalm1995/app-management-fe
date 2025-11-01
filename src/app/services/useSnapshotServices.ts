"use client";

import { useState } from "react";
import { ApiGenericResponse } from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

export interface SnapshotRequest {
  snapshotDate: string;
}

export interface DashboardFilterRequest {
  startDate: string;
  endDate: string;
}

export interface ProjectSummaryDashboardResponse {
  projectStatus: string;
  projectCount: number;
  percentage: number;
  lastUpdated?: string;
}

export interface ProjectQuarterlyDashboardResponse {
  monthPeriod: number;
  monthName?: string;
  projectCount: number;
  yearPeriod?: number;
  quartalPeriod?: number;
  lastUpdated?: string;
}

export interface DivisionOwnerQuartileDashboardResponse {
  divisionName: string;
  monthPeriod: number;
  monthName?: string;
  projectCount: number;
  yearPeriod?: number;
  quartalPeriod?: number;
  lastUpdated?: string;
}

export interface ProjectCharacteristicsDashboardResponse {
  characteristicName: string;
  projectCount: number;
  lastUpdated?: string;
}

export interface ProjectTypeDashboardResponse {
  projectTypeName: string;
  projectCount: number;
}

export interface ProcurementWorkProgramDashboardResponse {
  procurementWorkProgramFlag: string;
  projectCount: number;
}

export interface SnapshotProjectSummaryResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectQuartalResponse {
  message: string;
  snapshotTime: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
  projectCount: number;
  capturedBy: string;
}

export interface SnapshotProjectCharacteristicResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectTypeResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectProcurementResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectAcquisitionResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectByGroupManageResponse {
  message: string;
  snapshotTime: string;
  totalRecordsProcessed: number;
}

export interface SnapshotProjectDivisionOwnerQuartalResponse {
  message: string;
  snapshotTime: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
  totalRecordsProcessed: number;
  capturedBy: string;
}

export interface SnapshotUserProjectClosedQuartalResponse {
  message: string;
  snapshotTime: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
  totalRecordsProcessed: number;
  capturedBy: string;
}

export interface SnapshotUserProjectActiveQuartalResponse {
  message: string;
  snapshotTime: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
  totalRecordsProcessed: number;
  capturedBy: string;
}

export interface useSnapshotServicesServices {
  projectSummary: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectSummaryResponse> | null>;
  projectCharacteristic: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectCharacteristicResponse> | null>;
  projectType: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectTypeResponse> | null>;
  projectProcurementFlag: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectProcurementResponse> | null>;
  projectAcquisition: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectAcquisitionResponse> | null>;
  projectByGroupManage: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectByGroupManageResponse> | null>;
  projectQuartal: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectQuartalResponse> | null>;
  projectDivisionOwnerQuartal: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotProjectDivisionOwnerQuartalResponse> | null>;
  userProjectClosedQuartal: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotUserProjectClosedQuartalResponse> | null>;
  userProjectActiveQuartal: (payload: SnapshotRequest, token: string) => Promise<ApiGenericResponse<SnapshotUserProjectActiveQuartalResponse> | null>;
  // Dashboard methods
  getProjectSummaryDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<ProjectSummaryDashboardResponse[]> | null>;
  getProjectQuarterlyDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<ProjectQuarterlyDashboardResponse[]> | null>;
  getDivisionOwnerQuartileDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<DivisionOwnerQuartileDashboardResponse[]> | null>;
  getProjectCharacteristicsDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<ProjectCharacteristicsDashboardResponse[]> | null>;
  getProjectTypeDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<ProjectTypeDashboardResponse[]> | null>;
  getProcurementWorkProgramDashboard: (payload: DashboardFilterRequest, token: string) => Promise<ApiGenericResponse<ProcurementWorkProgramDashboardResponse[]> | null>;
  isLoading: boolean;
  error: string | null;
}

const useSnapshotServices = (): useSnapshotServicesServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const callSnapshot = async <T>(endpoint: string, payload: SnapshotRequest, token: string): Promise<ApiGenericResponse<T> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint: string = `/v1/Report/${endpoint}`;
    try {
      const response = await axiosInstance.post<ApiGenericResponse<T>>(
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
        setError(err.response?.data?.message || "Snapshot request failed");
        return errorResponse as ApiGenericResponse<T>;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null as T,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  const callDashboard = async <T>(endpoint: string, payload: DashboardFilterRequest, token: string): Promise<ApiGenericResponse<T> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint: string = `/v1/Report/${endpoint}`;
    try {
      const response = await axiosInstance.post<ApiGenericResponse<T>>(
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
        setError(err.response?.data?.message || "Dashboard request failed");
        return errorResponse as ApiGenericResponse<T>;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null as T,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  return {
    projectSummary: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectSummaryResponse>('snapshot-project-summary', payload, token),
    projectCharacteristic: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectCharacteristicResponse>('snapshot-project-characteristic', payload, token),
    projectType: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectTypeResponse>('snapshot-project-type', payload, token),
    projectProcurementFlag: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectProcurementResponse>('snapshot-project-procurement-workprogram-flag', payload, token),
    projectAcquisition: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectAcquisitionResponse>('snapshot-project-acquisition', payload, token),
    projectByGroupManage: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectByGroupManageResponse>('snapshot-project-by-group-manage', payload, token),
    projectQuartal: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectQuartalResponse>('snapshot-project-quartal', payload, token),
    projectDivisionOwnerQuartal: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotProjectDivisionOwnerQuartalResponse>('snapshot-project-division-owner-quartal', payload, token),
    userProjectClosedQuartal: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotUserProjectClosedQuartalResponse>('snapshot-user-project-closed-quartal', payload, token),
    userProjectActiveQuartal: (payload: SnapshotRequest, token: string) => callSnapshot<SnapshotUserProjectActiveQuartalResponse>('snapshot-user-project-active-quartal', payload, token),
    // Dashboard methods
    getProjectSummaryDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<ProjectSummaryDashboardResponse[]>('dashboard/project-summary', payload, token),
    getProjectQuarterlyDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<ProjectQuarterlyDashboardResponse[]>('dashboard/project-quarterly', payload, token),
    getDivisionOwnerQuartileDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<DivisionOwnerQuartileDashboardResponse[]>('dashboard/division-owner-quartile', payload, token),
    getProjectCharacteristicsDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<ProjectCharacteristicsDashboardResponse[]>('dashboard/project-characteristics', payload, token),
    getProjectTypeDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<ProjectTypeDashboardResponse[]>('dashboard/project-type', payload, token),
    getProcurementWorkProgramDashboard: (payload: DashboardFilterRequest, token: string) => callDashboard<ProcurementWorkProgramDashboardResponse[]>('dashboard/procurement-work-program', payload, token),
    isLoading,
    error,
  };
};

export default useSnapshotServices;
