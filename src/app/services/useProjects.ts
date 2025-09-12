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
import { UsersFullResponse, UsersResponse } from "./useUsers";
import { ApplicationMasterShortResponse } from "./useApps";

export interface ProjectDataResponse {
  id: string;
  projectNo: string;
  projectCode: string;
  projectName: string;
  projectDesc: string;
  projectStatus: string;
  note: string | null;
  projectCategory: string;
  projectType: string;
  projectRegisterDate: string | null;
  projectClosedDate: string | null;
  projectDurationDays: number;
  projectStatusPercentage: number;
  proOwnerDivisionId: string;
  proOwnerDivisionCode: string;
  proOwnerDivisionName: string;
  proOwnerGroupId: string;
  proOwnerGroupCode: string;
  proOwnerGroupName: string;
  proManageByDivisionId: string;
  proManageByDivisionCode: string;
  proManageByDivisionName: string;
  proManageByGroupId: string;
  proManageByGroupCode: string;
  proManageByGroupName: string;
  proManageByTeamId: string;
  proManageByTeamCode: string;
  proManageByTeamName: string;
  reqParentId: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  userAssignment: ProjectUserAssignmentResponse[];
  appsProject: ApplicationMasterShortResponse;
}

export interface ProjectUserAssignmentResponse {
  id: string;
  projectId: string;
  userSysId: string;
  userId: string;
  userData: UsersResponse;
  userAssignStatus: string;
  assignDate: string;
  assignEndDate: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface ProjectWorkflowResponse {
  id: string;
  projectId: string;
  wfPresetId?: string | null;
  wfPresetName?: string | null;
  wfCategoryId: string;
  wfCategoryCode: string;
  wfCategoryName: string;
  wfgId: string;
  wfgOrder: number;
  wfgCode: string;
  wfgName: string;
  wfgDesc?: string | null;
  wfgLevel: number;
  parentId?: string | null;
  workflowChild: ProjectWorkflowResponse[];
  workflowValues: ProjectWorkflowValueResponse[];
}

export interface ProjectWorkflowValueResponse {
  id: string;
  projectWorkflowId: string;
  documentType: string;
  documentName: string;
  documentNumber: string;
  documentDate: string;
  documentVersion: string;
  linkAttachment?: string | null;
  mediaObjectId?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  reffParentId?: string | null;
  workflowReffValues: ProjectWorkflowValueResponse[];
}

export interface ProjectInsertPayload {
  // id: string;
  projectNo?: string | null;
  projectName: string;
  projectDesc?: string | null;
  note?: string | null;
  projectCategory: string;
  projectType: string;
  projectRegisterDate: string;
  projectClosedDate?: string | null;
  proOwnerDivisionId?: string | null;
  proOwnerGroupId?: string | null;
  proManageByDivisionId?: string | null;
  proManageByGroupId?: string | null;
  proManageByTeamId?: string | null;
  reqParentId?: string | null;
  userAssigns: ProjectUserInsertPayload[];
}

export interface ProjectUserInsertPayload {
  userId: string;
}

export interface ProjectUpdatePayload {
  id: string;
  projectNo: string;
  projectName: string;
  projectDesc: string | null;
  note: string | null;
  projectCategory: string;
  projectType: string;
  projectRegisterDate: string | null;
  projectClosedDate: string | null;
  proOwnerDivisionId: string | null;
  proOwnerGroupId: string | null;
  proManageByDivisionId: string | null;
  proManageByGroupId: string | null;
  proManageByTeamId: string | null;
}

export interface ProjectUpdatePICPayload {
  projectId: string;
  dataUserId: string[];
}

export interface AppsResponse {
  id: string;
  projectId: string;
  appCode: string;
  appShortName: string;
  appName: string;
  appsDesc: string | null;
  note: string | null;
  iconApps: string | null;
  appsStatus: string;
  readyToLaunch: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  project: AppsProjectShortResponse;
}

export interface AppsProjectShortResponse {
  id: string;
  projectNo: string | null;
  projectCode: string;
  projectName: string;
  projectStatus: string;
}

export interface AppsInsertDataPayload {
  projectId: string;
  appCode: string;
  appShortName: string;
  appName: string;
  appsDesc: string | null;
  note: string | null;
}

export interface AppsUpdateDataPayload {
  id: string;
  appShortName: string;
  appName: string;
  appsDesc: string | null;
  note: string | null;
  appsStatus: string;
  readyToLaunch: string;
}

export interface AppsUploadDataPayload {
  id: string;
  iconApps: File;
}

export interface AppsLogsResponse {
  id: string;
  appsId: string;
  categoryChange: string;
  logCode: string;
  logTitle: string;
  logDesc: string | null;
  changeDate: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface AppsLogsInsertPayload {
  appsId: string;
  categoryChange: string;
  logCode: string;
  logTitle: string;
  logDesc: string;
  changeDate: string;
}

export interface AppsLogsUpdatePayload {
  id: string;
  categoryChange: string;
  logCode: string;
  logTitle: string;
  logDesc: string;
  changeDate: string;
}

export interface AppsLogsPayload {
  id: string | null;
  appsId: string | null;
  categoryChange: string;
  logCode: string;
  logTitle: string;
  logDesc: string;
  changeDate: string;
}

export interface AppsEnvDataResponse {
  id: string;
  appsId: string;
  envName: string;
  envDesc: string | null;
  isActive: string;
  links: AppsEnvLinkResponse[];
  accounts: AppsEnvAccountResponse[];
}

export interface AppsEnvLinkResponse {
  id: string;
  appsEnvId: string;
  linksSource: string;
}

export interface AppsEnvAccountResponse {
  id: string;
  appsEnvId: string;
  accountsName: string;
  accountsDesc: string;
}

export interface AppsEnvInsertPayload {
  appsId: string;
  envName: string;
  envDesc: string | null;
  isActive: string;
}

export interface AppsEnvUpdatePayload {
  id: string;
  envName: string;
  envDesc: string | null;
  isActive: string;
}

export interface AppsEnvLinkInsertPayload {
  appsEnvId: string;
  linksSource: string;
}

export interface AppsEnvLinkUpdatePayload {
  id: string;
  linksSource: string;
}

export interface AppsEnvLinkAccountInsertPayload {
  appsEnvId: string;
  accountsName: string;
  accountsDesc: string;
}

export interface AppsEnvLinkAccountUpdatePayload {
  id: string;
  accountsName: string;
  accountsDesc: string;
}

export interface AppsEnvUpdateAllPayload {
  id: string;
  envName: string;
  envDesc: string | null;
  isActive: string;
  links: AppsEnvUpdateLinkAllPayload[];
  accounts: AppsEnvUpdateAccountAllPayload[];
}

export interface AppsEnvUpdateLinkAllPayload {
  id: string | null;
  linksSource: string;
}

export interface AppsEnvUpdateAccountAllPayload {
  id: string | null;
  accountsName: string;
  accountsDesc: string | null;
}

export interface ProjectFeatureResponse {
  id: string;
  projectId: string;
  featureName: string;
  featureDesc: string | null;
  featureSide: string | null;
  maintenanceCategory: string;
  maintenanceType: string;
  rppb: string | null;
  licensing: string | null;
  featureStartDate: string | null;
  featureEndDate: string | null;
  urgency: string;
  impact: string;
  priority: string;
  developmentStatus: string;
  createdAt: string;
  createdBy: string;
}

export interface ProjectFeatureInsertPayload {
  projectId: string;
  featureName: string;
  featureDesc: string | null;
  featureSide: string | null;
  maintenanceCategory: string | null;
  maintenanceType: string | null;
  rppb: string | null;
  licensing: string | null;
  featureStartDate: string | null;
  featureEndDate: string | null;
  urgency: string | null;
  impact: string | null;
  priority: string | null;
  developmentStatus: string | null;
}

export interface ProjectFeatureUpdatePayload {
  id: string;
  featureName: string;
  featureDesc: string | null;
  featureSide: string | null;
  maintenanceCategory: string | null;
  maintenanceType: string | null;
  rppb: string | null;
  licensing: string | null;
  featureStartDate: string | null;
  featureEndDate: string | null;
  urgency: string | null;
  impact: string | null;
  priority: string | null;
  developmentStatus: string | null;
}

export interface ProjectBacklogProgressionResponse {
  totalBacklogs: number;
  totalBacklogsDone: number;
  progressionBacklog: number;
}

interface useProjectsServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null>;
  GetDetailById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse | null> | null>;
  InsertProjects: (
    payload: ProjectInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateProjects: (
    payload: ProjectUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteProjects: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ListPIC: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<UsersFullResponse[] | null> | null>;
  UpdatePIC: (
    payload: ProjectUpdatePICPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  // APPS
  ListApps: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AppsResponse[] | null> | null>;
  GetDetailAppsById: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsResponse | null> | null>;
  GetDetailAppsByProjectId: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsResponse | null> | null>;
  InsertProjectsApps: (
    payload: AppsInsertDataPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateProjectsApps: (
    payload: AppsUpdateDataPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UploadIconProjectsApps: (
    payload: AppsUploadDataPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  // logs
  ListLogsApps: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AppsLogsResponse[] | null> | null>;
  GetDetailLogAppsById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsLogsResponse | null> | null>;
  InsertAppsLog: (
    payload: AppsLogsInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAppsLog: (
    payload: AppsLogsUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteAppsLog: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  // ENV
  ListAppsEnv: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvDataResponse[] | null> | null>;
  GetDetailAppsEnvById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvDataResponse | null> | null>;
  InsertAppsEnv: (
    payload: AppsEnvInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAppsEnv: (
    payload: AppsEnvUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteAppsEnv: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  // ENV LINK
  ListAppsEnvLink: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvLinkResponse[] | null> | null>;
  GetDetailAppsEnvLinkById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvLinkResponse | null> | null>;
  InsertAppsEnvLink: (
    payload: AppsEnvLinkInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAppsEnvLink: (
    payload: AppsEnvLinkUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteAppsEnvLink: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  // ENV ACCOUNT
  ListAppsEnvAccount: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvAccountResponse[] | null> | null>;
  GetDetailAppsEnvAccountById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppsEnvAccountResponse | null> | null>;
  InsertAppsEnvAccount: (
    payload: AppsEnvLinkAccountInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAppsEnvAccount: (
    payload: AppsEnvLinkAccountUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteAppsEnvAccount: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAppsEnvAll: (
    payload: AppsEnvUpdateAllPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  // logs
  ListProjectFeatures: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<ProjectFeatureResponse[] | null> | null>;
  GetDetailProjectFeatureById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectFeatureResponse | null> | null>;
  InsertProjectFeature: (
    payload: ProjectFeatureInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateProjectFeature: (
    payload: ProjectFeatureUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteProjectFeature: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  GetProjectBacklogProgression: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectBacklogProgressionResponse | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useProjects = (): useProjectsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectDataResponse[]>
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

  const GetDetailById = async (
    teamId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectDataResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${teamId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectDataResponse>
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

  const InsertProjects = async (
    payload: ProjectInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/register";

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

  const UpdateProjects = async (
    payload: ProjectUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/update";

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

  const DeleteProjects = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/delete/${id}`;
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

  const ListPIC = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<UsersFullResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/list/pic?projectId=${projectId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<UsersFullResponse[]>
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

  const UpdatePIC = async (
    payload: ProjectUpdatePICPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/update/pic";

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

  const ListApps = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AppsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AppsResponse[]>
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

  const GetDetailAppsById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AppsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsResponse>
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

  const GetDetailAppsByProjectId = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<AppsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/project/${projectId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsResponse>
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

  const InsertProjectsApps = async (
    payload: AppsInsertDataPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/insert";

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

  const UpdateProjectsApps = async (
    payload: AppsUpdateDataPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/update";

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

  const UploadIconProjectsApps = async (
    payload: AppsUploadDataPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/update-icon";

    const formData = new FormData();
    formData.append("Id", payload.id);
    formData.append("IconApps", payload.iconApps);

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
      >(`${UrlEndpoint}${PathEndpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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

  const ListLogsApps = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AppsLogsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/logs/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AppsLogsResponse[]>
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

  const GetDetailLogAppsById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AppsLogsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/logs/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsLogsResponse>
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

  const InsertAppsLog = async (
    payload: AppsLogsInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/logs/insert";

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

  const UpdateAppsLog = async (
    payload: AppsLogsUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/logs/update";

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

  const DeleteAppsLog = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/logs/${id}`;
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

  const ListAppsEnv = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvDataResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AppsEnvDataResponse[]>
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

  const GetDetailAppsEnvById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvDataResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsEnvDataResponse>
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

  const InsertAppsEnv = async (
    payload: AppsEnvInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/insert";

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

  const UpdateAppsEnv = async (
    payload: AppsEnvUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/update";

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

  const DeleteAppsEnv = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/${id}`;
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

  const ListAppsEnvLink = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvLinkResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/link/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AppsEnvLinkResponse[]>
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

  const GetDetailAppsEnvLinkById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvLinkResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/link/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsEnvLinkResponse>
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

  const InsertAppsEnvLink = async (
    payload: AppsEnvLinkInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/link/insert";

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

  const UpdateAppsEnvLink = async (
    payload: AppsEnvLinkUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/link/update";

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

  const DeleteAppsEnvLink = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/link/${id}`;
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

  const ListAppsEnvAccount = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvAccountResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/account/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<AppsEnvAccountResponse[]>
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

  const GetDetailAppsEnvAccountById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<AppsEnvAccountResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/account/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppsEnvAccountResponse>
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

  const InsertAppsEnvAccount = async (
    payload: AppsEnvLinkAccountInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/account/insert";

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

  const UpdateAppsEnvAccount = async (
    payload: AppsEnvLinkAccountUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/account/update";

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

  const DeleteAppsEnvAccount = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/env/account/${id}`;
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

  const UpdateAppsEnvAll = async (
    payload: AppsEnvUpdateAllPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/apps/env/update/all";

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

  const ListProjectFeatures = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<ProjectFeatureResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/ProjectFeatures/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectFeatureResponse[]>
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

  const GetDetailProjectFeatureById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectFeatureResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/ProjectFeatures/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectFeatureResponse>
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

  const InsertProjectFeature = async (
    payload: ProjectFeatureInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/ProjectFeatures/insert";

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

  const UpdateProjectFeature = async (
    payload: ProjectFeatureUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/ProjectFeatures/update";

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

  const DeleteProjectFeature = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/apps/logs/${id}`;
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

  const GetProjectBacklogProgression = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectBacklogProgressionResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/project-backlog-progressions?projectId=${projectId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectBacklogProgressionResponse>
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
    List,
    GetDetailById,
    InsertProjects,
    UpdateProjects,
    DeleteProjects,
    ListPIC,
    UpdatePIC,
    ListApps,
    GetDetailAppsById,
    GetDetailAppsByProjectId,
    InsertProjectsApps,
    UpdateProjectsApps,
    UploadIconProjectsApps,
    ListLogsApps,
    GetDetailLogAppsById,
    InsertAppsLog,
    UpdateAppsLog,
    DeleteAppsLog,
    ListAppsEnv,
    GetDetailAppsEnvById,
    InsertAppsEnv,
    UpdateAppsEnv,
    DeleteAppsEnv,
    ListAppsEnvLink,
    GetDetailAppsEnvLinkById,
    InsertAppsEnvLink,
    UpdateAppsEnvLink,
    DeleteAppsEnvLink,
    ListAppsEnvAccount,
    GetDetailAppsEnvAccountById,
    InsertAppsEnvAccount,
    UpdateAppsEnvAccount,
    DeleteAppsEnvAccount,
    UpdateAppsEnvAll,

    ListProjectFeatures,
    GetDetailProjectFeatureById,
    InsertProjectFeature,
    UpdateProjectFeature,
    DeleteProjectFeature,

    GetProjectBacklogProgression,

    isLoading,
    error,
  };
};

export default useProjects;
