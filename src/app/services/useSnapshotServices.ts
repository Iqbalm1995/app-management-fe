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
    isLoading,
    error,
  };
};

export default useSnapshotServices;
