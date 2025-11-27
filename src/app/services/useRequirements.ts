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

export interface RequirementApprovalDataResponse {
  id: string;
  reqIq: string;
  reqIqHistory: string;
  approverUserId: string;
  approverUserCode: string;
  approverUserFirstName: string;
  approverUserLastnameName?: string | null;
  approverUserUsername: string;
  approverUserEmail: string;
  approverUserPhoneNumber: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  groupId: string;
  groupCode: string;
  groupName: string;
  teamId: string;
  teamCode: string;
  teamName: string;
  isChecked: string;
  note: string;
  nextAction: string;
  approvedAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface RequirementWorkProgramDataResponse {
  id: string;
  reqId?: string | null;
  projectId?: string | null;
  workProgramSource: string;
  workProgramCode?: string | null;
  workProgramName?: string | null;
  workProgramAccName?: string | null;
  workProgramAccNumber?: string | null;
  workProgramAccCc?: string | null;
  workProgramBudget: number;
  workProgramReal: number;
  workProgramLeftovers: number;
  directorateId?: string | null;
  directorateCode?: string | null;
  directorateName?: string | null;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  groupId?: string | null;
  groupCode?: string | null;
  groupName?: string | null;
  createdAt: Date;
  createdBy: string;
}

export interface RequirementsResponse {
  // STG 1
  id: string;
  isHaveMemo: string;
  requirementType: string;
  reqStatus?: string | null;
  nextStep?: string | null;
  reffParentId?: string | null;
  senderDirectorateId?: string | null;
  senderDirectorateCode?: string | null;
  senderDirectorateName?: string | null;
  senderDivisionId?: string | null;
  senderDivisionCode?: string | null;
  senderDivisionName?: string | null;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate?: string | null;
  reqAcceptedDate?: string | null;
  reqDurationDay: number;
  isCarryOver: string;
  reqReviewStartDate?: string | null;
  reqReviewEndDate?: string | null;
  reqReviewDurationDay: number;

  // STG 2 - AREA 1
  assignedToDate?: string | null;
  assignedFromId?: string | null;
  assignedFromName?: string | null;
  approvalDatas?: RequirementApprovalDataResponse[];

  // AREA 2
  userPicId?: string | null;
  userPicIdentityNumber?: string | null;
  userPicName?: string | null;
  userPicContanct?: string | null;
  userPicEmail?: string | null;

  userPicDirectorateId?: string | null;
  userPicDirectorateCode?: string | null;
  userPicDirectorateName?: string | null;
  userPicDivisionId?: string | null;
  userPicDivisionCode?: string | null;
  userPicDivisionName?: string | null;
  userPicGroupId?: string | null;
  userPicGroupCode?: string | null;
  userPicGroupName?: string | null;

  // STG 3
  workPrograms: RequirementWorkProgramDataResponse[];

  // STG 4 - APP INFORMATION
  appInitialCode?: string | null;
  appInitialName?: string | null;

  appTargetUsers: string;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;

  backlogFeature?: string | null;
  backlogDescription?: string | null;
  backlogChange?: string | null;
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
  appLiveTargetDate?: string | null;

  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth?: string | null;
  appHightAvailability?: string | null;
  appIntegrationOthersApps?: string | null;

  note?: string | null;

  // BACKLOG COUNTS
  backlogCount?: number;
  backlogAvailableCount?: number;
  backlogTakenCount?: number;

  // ADDITIONAL
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PICAssignUserPayload {
  userId: string;
}

export interface WorkProgramsPayload {
  directorateId: string;
  divisionId: string;
  groupId?: string | null;
  workProgramSource: string; // INTERNAL / EXTERNAL
  workProgramCode?: string | null;
  workProgramName?: string | null;
  workProgramAccName?: string | null;
  workProgramAccNumber?: string | null;
  workProgramAccCc?: string | null;
  workProgramBudget: number;
  workProgramReal: number;
  // workProgramLeftovers: number;
}

export interface ReqBacklogPayload {
  localId?: string; // For client-side operations only
  backlogId?: string | null; // Database ID
  parentBacklogId?: string | null;
  backlogName: string;
  backlogDesc?: string | null;
  note?: string | null;
  posOrder: number;
}

export interface RequirementsInsertPayload {
  // STG 1
  isHaveMemo: string;
  reffParentId?: string | null;
  senderDirectorateId?: string | null;
  senderDivisionId?: string | null;
  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate?: string | null;
  reqAcceptedDate?: string | null;
  isCarryOver: string;

  // STG 2

  // AREA 1
  assignedToDate?: string | null;
  assignedFromId?: string | null;
  assignedFromName?: string | null;
  picAssignUsers: PICAssignUserPayload[];

  // AREA 2
  userPicId?: string | null;
  userPicIdentityNumber?: string | null;
  userPicName?: string | null;
  userPicContanct?: string | null;
  userPicEmail?: string | null;
  userPicDirectorateId?: string | null;
  userPicDivisionId?: string | null;
  userPicGroupId?: string | null;

  // AREA 3
  workPrograms: WorkProgramsPayload[];

  // AREA 4
  appInitialCode?: string | null;
  appInitialName?: string | null;

  appTargetUsers: string;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;

  backlogChange?: string | null;
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
  appLiveTargetDate?: string | null;

  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth?: string | null;
  appHightAvailability?: string | null;
  appIntegrationOthersApps?: string | null;

  note?: string | null;
  isDraft: boolean;
  backlogFeatures: ReqBacklogPayload[];
}

export interface BacklogDataResponse {
  id: string;
  reqId: string;
  backlogCode: string;
  backlogName: string;
  backlogDesc: string | null;
  envSide: string | null;
  maintenanceCategory: string | null;
  maintenanceType: string | null;
  rppb: string;
  licensing: string;
  backogRegistered: string | null;
  backlogStartdate: string | null;
  backlogEnddate: string | null;
  urgency: string;
  impact: string;
  priority: string;
  developmentStatus: string;
  progressionPercentage: number;
  reffId: string | null;
  projectId: string | null;
  note: string | null;
  version: string;
  isLive: string;
  appsId: string;
  posOrder: number;
  createdAt: string | null;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string;
  reffData?: BacklogDataResponse | null;
}

export interface BacklogInsertPayload {
  backlogName: string;
  backlogDesc: string | null;
  envSide: string | null;
  maintenanceCategory: string | null;
  maintenanceType: string | null;
  rppb: string;
  licensing: string;
  backogRegistered: string | null;
  backlogStartdate: string | null;
  backlogEnddate: string | null;
  urgency: string;
  impact: string;
  priority: string;
  developmentStatus: string;
  reffId: string | null;
  reqId: string;
}

export interface BacklogUpdatePayload {
  id: string;
  backlogName: string;
  backlogDesc?: string | null;
  envSide?: string | null;
  maintenanceCategory?: string | null;
  maintenanceType?: string | null;
  rppb: string;
  licensing: string;
  backogRegistered?: string | null;
  backlogStartdate?: string | null;
  backlogEnddate?: string | null;
  urgency: string;
  impact: string;
  priority: string;
  developmentStatus: string;
  backlogImplementStartdate?: string | null;
  backlogImplementEnddate?: string | null;
  reffId?: string | null;
  posOrder: number;
}

export interface BacklogUpdateOrderPayload {
  id: string;
  posOrder: number;
}

export function mapBacklogArrayToUpdatePayload(
  dataArray: BacklogDataResponse[]
): BacklogUpdatePayload[] {
  return dataArray.map((data) => ({
    id: data.id,
    backlogName: data.backlogName,
    backlogDesc: data.backlogDesc,
    envSide: data.envSide,
    maintenanceCategory: data.maintenanceCategory,
    maintenanceType: data.maintenanceType,
    rppb: data.rppb,
    licensing: data.licensing,
    backogRegistered: data.backogRegistered,
    backlogStartdate: data.backlogStartdate,
    backlogEnddate: data.backlogEnddate,
    urgency: data.urgency,
    impact: data.impact,
    priority: data.priority,
    developmentStatus: data.developmentStatus,
    reffId: data.reffId,
    posOrder: data.posOrder,
  }));
}

interface useRequirements {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse[] | null> | null>;
  ListUnregistProject: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse[] | null> | null>;
  GetDetailById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse | null> | null>;
  InsertReq: (
    payload: RequirementsInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RegisterDraft: (
    payload: RequirementsInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RegisterUpdate: (
    payload: RequirementsInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetReqParentAppsByAppsId: (
    appsId: string,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse | null> | null>;
  GetReqParentAppsByAppsCode: (
    appsCode: string,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse | null> | null>;
  GetReqParentAppsByAppsInitial: (
    appsInitial: string,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse | null> | null>;

  ListBacklog: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<BacklogDataResponse[] | null> | null>;
  GetDetailBacklogById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<BacklogDataResponse | null> | null>;
  InsertBacklog: (
    payload: BacklogInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateBacklog: (
    payload: BacklogUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateBacklogOrder: (
    payload: BacklogUpdateOrderPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateBacklogBatch: (
    payload: BacklogUpdatePayload[],
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteBacklog: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ListReqMedia: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<MediaObjectResponse[] | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useRequirements = (): useRequirements => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Requirement/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<RequirementsResponse[]>
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

  const ListUnregistProject = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Requirement/list-unregister-project";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<RequirementsResponse[]>
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
    id: string,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RequirementsResponse>
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

  const InsertReq = async (
    payload: RequirementsInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/insert`;
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

  const RegisterDraft = async (
    payload: RequirementsInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/register-draft`;
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

  const RegisterUpdate = async (
    payload: RequirementsInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/register-update`;
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

  const GetReqParentAppsByAppsId = async (
    appsId: string,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/req-parent-apps-by-appsId?appsId=${appsId}`;
    console.log(`${UrlEndpoint}${PathEndpoint}`);
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RequirementsResponse>
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

  const GetReqParentAppsByAppsCode = async (
    appsCode: string,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `v1/Requirement/req-parent-apps-by-appsCode?appsCode=${appsCode}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RequirementsResponse>
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

  const GetReqParentAppsByAppsInitial = async (
    appsInitial: string,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `v1/Requirement/req-parent-apps-by-appsInitial?appsInitial=${appsInitial}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RequirementsResponse>
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

  const ListBacklog = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<BacklogDataResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Requirement/backlog/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<BacklogDataResponse[]>
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

  const GetDetailBacklogById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<BacklogDataResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<BacklogDataResponse>
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

  const InsertBacklog = async (
    payload: BacklogInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/insert`;
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

  const UpdateBacklog = async (
    payload: BacklogUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/update`;
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

  const UpdateBacklogOrder = async (
    payload: BacklogUpdateOrderPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/update/order`;
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

  const UpdateBacklogBatch = async (
    payload: BacklogUpdatePayload[],
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/update-batch`;
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

  const DeleteBacklog = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/backlog/delete/${id}`;
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

  const ListReqMedia = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<MediaObjectResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Requirement/media-object/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<MediaObjectResponse[]>
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
    List,
    ListUnregistProject,
    GetDetailById,
    InsertReq,
    RegisterDraft,
    RegisterUpdate,
    GetReqParentAppsByAppsId,
    GetReqParentAppsByAppsCode,
    GetReqParentAppsByAppsInitial,
    ListBacklog,
    GetDetailBacklogById,
    InsertBacklog,
    UpdateBacklog,
    UpdateBacklogOrder,
    UpdateBacklogBatch,
    DeleteBacklog,
    ListReqMedia,
    isLoading,
    error,
  };
};

export default useRequirements;
