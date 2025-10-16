"use client";

import { useState } from "react";
import {
  ApiGenericResponse,
  PaggingListPayload,
  PaggingListPayloadCustom,
} from "../types/masterTypes";
import { buildUrlPort, localToIsoWithOffset } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";
import { UsersFullResponse, UsersResponse } from "./useUsers";
import { ApplicationMasterShortResponse } from "./useApps";
import { MediaObjectResponse } from "./useMediaObject";
import {
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
} from "./useRequirements";
import { AppsResponse, ProjectUserAssignmentResponse } from "./useProjects";

export interface ReportProjectPortofolioDataResponse {
  id: string;
  projectNo: string;
  projectCode: string;
  projectName: string;
  projectDesc: string;
  projectStatus: string;
  note?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  projectCategory: string;
  projectType: string;
  projectRegisterDate?: string | null;
  projectClosedDate?: string | null;
  projectDurationDays: number;
  projectStatusPercentage: number;
  proOwnerDivisionId: string;
  proOwnerDivisionCode?: string | null;
  proOwnerDivisionName?: string | null;
  proOwnerGroupId?: string | null;
  proOwnerGroupCode?: string | null;
  proOwnerGroupName?: string | null;
  proManageByDivisionId?: string | null;
  proManageByDivisionCode?: string | null;
  proManageByDivisionName?: string | null;
  proManageByGroupId?: string | null;
  proManageByGroupCode?: string | null;
  proManageByGroupName?: string | null;
  proManageByTeamId?: string | null;
  proManageByTeamCode?: string | null;
  proManageByTeamName?: string | null;
  reqParentId?: string | null;
  appsId?: string | null;
  proOwnerDirectorateId?: string | null;
  proOwnerDirectorateCode?: string | null;
  proOwnerDirectorateName?: string | null;
  proManageByDirectorateId?: string | null;
  proManageByDirectorateCode?: string | null;
  proManageByDirectorateName?: string | null;
  projectAcquisitionCode?: string | null;
  projectAcquisitionName?: string | null;
  projectCharasteristicCode?: string | null;
  projectCharasteristicName?: string | null;
  projectSubCharasteristicCode?: string | null;
  projectSubCharasteristicName?: string | null;
  projectSubCharasteristicDesc?: string | null;
  userAssignment: ProjectUserAssignmentResponse[];
  requirement?: RequirementsResponse | null;
  appsProject?: AppsResponse | null;
  workPrograms: RequirementWorkProgramDataResponse[];
}

interface useReportsServices {
  ListReportProjectPortofolio: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null>;

  isLoading: boolean;
  error: string | null;
}

const useReports = (): useReportsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListReportProjectPortofolio = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Report/list-report-portofolio-projects";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ReportProjectPortofolioDataResponse[]>
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

  return {
    ListReportProjectPortofolio,

    isLoading,
    error,
  };
};

export default useReports;
