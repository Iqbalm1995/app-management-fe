"use client";

import { RequirementsResponse } from "./useRequirements";
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

export interface ApplicationMasterResponse {
  id: string;
  appCode: string;
  appShortName: string;
  appName: string;
  appsDesc?: string | null;
  note?: string | null;
  iconApps?: string | null;
  appsStatus: string;
  appOwnerDivisionId?: string | null;
  appOwnerDivisionCode?: string | null;
  appOwnerDivisionName?: string | null;
  appOwnerGroupId?: string | null;
  appOwnerGroupCode?: string | null;
  appOwnerGroupName?: string | null;
  appManageByDivisionId?: string | null;
  appManageByDivisionCode?: string | null;
  appManageByDivisionName?: string | null;
  appManageByGroupId?: string | null;
  appManageByGroupCode?: string | null;
  appManageByGroupName?: string | null;
  appManageByTeamId?: string | null;
  appManageByTeamCode?: string | null;
  appManageByTeamName?: string | null;
  reqParentId?: string | null;
  appAccessMedia?: string | null;
  appTypes?: string | null;
  appTypeCustom?: string | null;
  appRelatedness: string;
  appRelatednessDesc?: string | null;
  appTransactionals?: string | null;
  appOperational24hrs: string;
  appOperationalDays?: string | null;
  appOperationalHourOpen?: string | null;
  appOperationalHourClosed?: string | null;
  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth: string;
  appHightAvailability: string;
  appIntegrationOthersApps?: string | null;
  appTargetUsers: string;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;
  appOwnerPicUserId?: string | null;
  appOwnerPicName?: string | null;
  appManagePicUserId?: string | null;
  appManagePicName?: string | null;
  appBusinessOwnerPicUserId?: string | null;
  appBusinessOwnerPicName?: string | null;
  appBusinessOwnerDivisionId?: string | null;
  appBusinessOwnerDivisionCode?: string | null;
  appBusinessOwnerDivisionName?: string | null;
  appBusinessOwnerGroupId?: string | null;
  appBusinessOwnerGroupCode?: string | null;
  appBusinessOwnerGroupName?: string | null;
  appIsCritical: string;
  appCriticalLevel?: string | null;
  appStatusProject?: string | null;
  appInitaiteYear?: string | null;
  appProgrammingLanguages?: string | null;
  appProgrammingFrameworks?: string | null;
  appDevelopmentMethod?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  requirementData?: RequirementsResponse | null;
  countProjectAll: number;
  countProjectCompleted: number;
  countProjectOnGoing: number;
}

export interface ApplicationMasterShortResponse {
  id: string;
  appCode: string;
  appShortName: string;
  appName: string;
  iconApps?: string | null;
  appsStatus: string;
  reqParentId?: string | null;
}

export interface AppTopologyQuickStatsResponse {
  totalServers: number;
  activeServers: number;
  primaryDc1Nodes: number;
  primaryDc2Nodes: number;
  pamCompliantCount: number;
  hardenedCount: number;
  dualDeployCount: number;
}

export interface AppServerVmDetailResponse {
  namaVm: string;
  ipAddress: string;
  os: string;
  cpu: string;
  memory: string;
  storage: string;
  note?: string;
}

export interface AppServerItemResponse {
  id: string;
  appsId?: string;
  appsEnvId?: string;
  roleServer: string;
  roleServerOther?: string;
  roleDetail: string;
  status: "Aktif" | "Pasif";
  ipAddress: string;
  primary: "DC1" | "DC2" | "-";
  site: string;
  siteOther?: string;
  segment: string;
  environment: string;
  environmentOther?: string;
  joinDomain: "Ya" | "Tidak";
  hardening: "Ya" | "Tidak";
  pam: "Ya" | "Tidak";
  dualDeploy: "Ya" | "Tidak";
  vmDetail?: AppServerVmDetailResponse;
}

export interface AppTopologyOverviewResponse {
  quickStats: AppTopologyQuickStatsResponse;
  servers: AppServerItemResponse[];
}

export interface AppAccessParameterItemResponse {
  id?: string;
  appsId?: string;
  appsEnvId?: string;
  targetEnvironment: "Dev" | "Prod";
  paramCategory: string;
  paramLabel: string;
  paramKey: string;
  paramValue?: string | null;
  fieldType: "text" | "password" | "textarea";
  isMasked?: "Y" | "N";
  displayOrder: number;
}

export interface AppAccessOverviewResponse {
  devUrl: string;
  prodUrl: string;
  parameters: AppAccessParameterItemResponse[];
}

export interface SyncAppAccessParametersPayload {
  devUrl: string;
  prodUrl: string;
  parameters: AppAccessParameterItemResponse[];
}

export interface RelatedSupportingAppResponse {
  id: string;
  supportingAppId: string;
  appName: string;
  appShortName: string;
  appVersion: string;
  appInitaiteYear: string;
  appsStatus: string;
  dependencyRole?: string | null;
  description?: string | null;
}

export interface AddSupportingAppPayload {
  supportingAppId: string;
  dependencyRole?: string;
  description?: string;
}

export interface ServerSoftwareItemResponse {
  id: string;
  softwareName: string;
  softwareCategory: string;
  vendor?: string | null;
  isStandardBank: string;
  description?: string | null;
}

export interface AppInstalledSoftwareResponse {
  id: string;
  softwareId: string;
  softwareName: string;
  softwareCategory: string;
  vendor?: string | null;
  installedVersion?: string | null;
  portNumber?: string | null;
  serviceStatus: string;
  isStandardBank: string;
  notes?: string | null;
}

export interface AddAppSoftwarePayload {
  softwareId: string;
  installedVersion?: string;
  portNumber?: string;
  serviceStatus?: string;
  notes?: string;
}

export interface CreateServerSoftwarePayload {
  softwareName: string;
  softwareCategory: string;
  vendor?: string;
  isStandardBank?: string;
  description?: string;
}

export interface ApplicationMasterInsertDataPayload {
  appShortName: string;
  appName: string;
  appsStatus?: string | null;
  appsDesc?: string | null;
  note?: string | null;
  appOwnerDivisionId?: string | null;
  appOwnerGroupId?: string | null;
  appManageByDivisionId?: string | null;
  appManageByGroupId?: string | null;
  appManageByTeamId?: string | null;
  reqParentId?: string | null;
  appAccessMedia?: string | null;
  appTypes?: string | null;
  appTypeCustom?: string | null;
  appRelatedness?: string | null;
  appRelatednessDesc?: string | null;
  appTransactionals?: string | null;
  appOperational24hrs?: string | null;
  appOperationalDays?: string | null;
  appOperationalHourOpen?: string | null;
  appOperationalHourClosed?: string | null;
  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth?: string | null;
  appHightAvailability?: string | null;
  appIntegrationOthersApps?: string | null;
  appTargetUsers?: string | null;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;
  appOwnerPicUserId?: string | null;
  appOwnerPicName?: string | null;
  appManagePicUserId?: string | null;
  appManagePicName?: string | null;
  appBusinessOwnerPicUserId?: string | null;
  appBusinessOwnerPicName?: string | null;
  appIsCritical?: string | null;
  appCriticalLevel?: string | null;
  appStatusProject?: string | null;
  appInitaiteYear?: string | null;
  appProgrammingLanguages?: string | null;
  appProgrammingFrameworks?: string | null;
  appDevelopmentMethod?: string | null;
}

export interface ApplicationMasterUpdateDataPayload {
  id: string;
  appShortName: string;
  appName: string;
  appsStatus?: string | null;
  appsDesc?: string | null;
  note?: string | null;
  appOwnerDivisionId?: string | null;
  appOwnerGroupId?: string | null;
  appManageByDivisionId?: string | null;
  appManageByGroupId?: string | null;
  appManageByTeamId?: string | null;
  reqParentId?: string | null;
  appAccessMedia?: string | null;
  appTypes?: string | null;
  appTypeCustom?: string | null;
  appRelatedness?: string | null;
  appRelatednessDesc?: string | null;
  appTransactionals?: string | null;
  appOperational24hrs?: string | null;
  appOperationalDays?: string | null;
  appOperationalHourOpen?: string | null;
  appOperationalHourClosed?: string | null;
  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth?: string | null;
  appHightAvailability?: string | null;
  appIntegrationOthersApps?: string | null;
  appTargetUsers?: string | null;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;
  appOwnerPicUserId?: string | null;
  appOwnerPicName?: string | null;
  appManagePicUserId?: string | null;
  appManagePicName?: string | null;
  appBusinessOwnerPicUserId?: string | null;
  appBusinessOwnerPicName?: string | null;
  appIsCritical?: string | null;
  appCriticalLevel?: string | null;
  appStatusProject?: string | null;
  appInitaiteYear?: string | null;
  appProgrammingLanguages?: string | null;
  appProgrammingFrameworks?: string | null;
  appDevelopmentMethod?: string | null;
}

export interface ApplicationMasterUpdatePictPayload {
  id: string;
  uploadPict?: File | null;
}

export interface ApplicationMasterUpdateStatusPayload {
  id: string;
  appsStatus: string;
}

interface useAppsServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<ApplicationMasterResponse[] | null> | null>;
  InsertData: (
    payload: ApplicationMasterInsertDataPayload,
    token: string
  ) => Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null>;  GetDetailById: (
    appId: string,
    token: string
  ) => Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null>;
  GetDetailByInitial: (
    initial: string,
    token: string
  ) => Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null>;
  UpdateData: (
    payload: ApplicationMasterUpdateDataPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdatePict: (
    payload: ApplicationMasterUpdatePictPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateStatus: (
    payload: ApplicationMasterUpdateStatusPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetTopologyOverview: (
    appId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppTopologyOverviewResponse | null> | null>;
  SyncAppServers: (
    appId: string,
    servers: AppServerItemResponse[],
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetAccessParameters: (
    appId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppAccessOverviewResponse | null> | null>;
  SyncAccessParameters: (
    appId: string,
    payload: SyncAppAccessParametersPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetSupportingApps: (
    appId: string,
    token: string
  ) => Promise<ApiGenericResponse<RelatedSupportingAppResponse[]> | null>;
  AddSupportingApp: (
    appId: string,
    payload: AddSupportingAppPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RemoveSupportingApp: (
    appId: string,
    supportingAppId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetServerSoftwaresCatalog: (
    search: string,
    token: string
  ) => Promise<ApiGenericResponse<ServerSoftwareItemResponse[]> | null>;
  CreateServerSoftware: (
    payload: CreateServerSoftwarePayload,
    token: string
  ) => Promise<ApiGenericResponse<ServerSoftwareItemResponse | null> | null>;
  GetAppSoftwares: (
    appId: string,
    token: string
  ) => Promise<ApiGenericResponse<AppInstalledSoftwareResponse[]> | null>;
  AddAppSoftware: (
    appId: string,
    payload: AddAppSoftwarePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RemoveAppSoftware: (
    appId: string,
    softwareId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useApps = (): useAppsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<ApplicationMasterResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Application/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ApplicationMasterResponse[]>
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
    appId: string,
    token: string
  ): Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ApplicationMasterResponse>
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

  const GetDetailByInitial = async (
    initial: string,
    token: string
  ): Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/initial/${initial}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ApplicationMasterResponse>
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

  const UpdateData = async (
    payload: ApplicationMasterUpdateDataPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/update`;
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

  const UpdatePict = async (
    payload: ApplicationMasterUpdatePictPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Application/update/pict";

    // Create FormData and append payload fields

    const formData = new FormData();
    formData.append("Id", payload.id);
    // Only append if uploadPict is not null
    if (payload.uploadPict !== null && payload.uploadPict !== undefined) {
      formData.append("uploadPict", payload.uploadPict);
    }

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
      >(`${UrlEndpoint}${PathEndpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for file uploads
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

  const UpdateStatus = async (
    payload: ApplicationMasterUpdateStatusPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/update/pict`;
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

  const InsertData = async (
    payload: ApplicationMasterInsertDataPayload,
    token: string
  ): Promise<ApiGenericResponse<ApplicationMasterResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Application/insert";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ApplicationMasterResponse>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const GetTopologyOverview = async (
    appId: string,
    token: string
  ): Promise<ApiGenericResponse<AppTopologyOverviewResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/topology-overview`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppTopologyOverviewResponse>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const SyncAppServers = async (
    appId: string,
    servers: AppServerItemResponse[],
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/servers/sync`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
      >(`${UrlEndpoint}${PathEndpoint}`, servers, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const GetAccessParameters = async (
    appId: string,
    token: string
  ): Promise<ApiGenericResponse<AppAccessOverviewResponse | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/access-parameters`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppAccessOverviewResponse>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const SyncAccessParameters = async (
    appId: string,
    payload: SyncAppAccessParametersPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/access-parameters/sync`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const GetSupportingApps = async (
    appId: string,
    token: string
  ): Promise<ApiGenericResponse<RelatedSupportingAppResponse[]> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/supporting-apps`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RelatedSupportingAppResponse[]>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: [],
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: [],
          error: null,
        };
      }
    }
  };

  const AddSupportingApp = async (
    appId: string,
    payload: AddSupportingAppPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/supporting-apps`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const RemoveSupportingApp = async (
    appId: string,
    supportingAppId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/supporting-apps/${supportingAppId}`;
    try {
      const response = await axiosInstance.delete<
        ApiGenericResponse<string>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const GetServerSoftwaresCatalog = async (
    search: string = "",
    token: string
  ): Promise<ApiGenericResponse<ServerSoftwareItemResponse[]> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const queryParam = search ? `?search=${encodeURIComponent(search)}` : "";
    const PathEndpoint: string = `/v1/Application/server-softwares/catalog${queryParam}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ServerSoftwareItemResponse[]>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: [],
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: [],
          error: null,
        };
      }
    }
  };

  const CreateServerSoftware = async (
    payload: CreateServerSoftwarePayload,
    token: string
  ): Promise<ApiGenericResponse<ServerSoftwareItemResponse | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/server-softwares/catalog`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ServerSoftwareItemResponse>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const GetAppSoftwares = async (
    appId: string,
    token: string
  ): Promise<ApiGenericResponse<AppInstalledSoftwareResponse[]> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/server-softwares`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<AppInstalledSoftwareResponse[]>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: [],
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: [],
          error: null,
        };
      }
    }
  };

  const AddAppSoftware = async (
    appId: string,
    payload: AddAppSoftwarePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/server-softwares`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  const RemoveAppSoftware = async (
    appId: string,
    softwareId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Application/${appId}/server-softwares/${softwareId}`;
    try {
      const response = await axiosInstance.delete<
        ApiGenericResponse<string>
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
        setError(err.response?.data?.message || err.message);
        return {
          statusCode: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
          data: null,
          error: err.response?.data?.error || null,
        };
      } else {
        setError("An unexpected error occurred");
        return {
          statusCode: 500,
          message: "Error connect to api",
          data: null,
          error: null,
        };
      }
    }
  };

  return {
    List,
    InsertData,
    GetDetailById,
    GetDetailByInitial,
    UpdateData,
    UpdatePict,
    UpdateStatus,
    GetTopologyOverview,
    SyncAppServers,
    GetAccessParameters,
    SyncAccessParameters,
    GetSupportingApps,
    AddSupportingApp,
    RemoveSupportingApp,
    GetServerSoftwaresCatalog,
    CreateServerSoftware,
    GetAppSoftwares,
    AddAppSoftware,
    RemoveAppSoftware,
    isLoading,
    error,
  };
};

export default useApps;
