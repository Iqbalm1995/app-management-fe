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
import { SysModuleStatusFlowResponse } from "./useSysModuleGroup";

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

export interface RequirementHistoryResponse {
  id: string;
  parentId: string;
  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate?: string | null;
  reqAcceptedDate?: string | null;
  reqStatus?: string | null;
  reqDurationDay: number;
  reqReviewStartDate?: string | null;
  reqReviewEndDate?: string | null;
  assignedFromId?: string | null;
  assignedFromName?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  userPicId?: string | null;
  userPicName?: string | null;
  userPicContanct?: string | null;
  userPicEmail?: string | null;
  appInitialCode?: string | null;
  appInitialName?: string | null;
  backlogFeature?: string | null;
  backlogDescription?: string | null;
  backlogChange?: string | null;
  note?: string | null;
  nextStep?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  reffParentId?: string | null;
  assignedToDate?: string | null;
  reqReviewDurationDay: number;
  isCarryOver: string;
  senderDivisionId?: string | null;
  senderDivisionCode?: string | null;
  senderDivisionName?: string | null;
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
  userPicIdentityNumber?: string | null;
  userPicDivisionId?: string | null;
  userPicDivisionCode?: string | null;
  userPicDivisionName?: string | null;
  userPicGroupId?: string | null;
  userPicGroupCode?: string | null;
  userPicGroupName?: string | null;
  appEnvLocations?: string | null;
  appEnvLocationsOthers?: string | null;
  appPrivateAuth: string;
  appHightAvailability: string;
  appIntegrationOthersApps?: string | null;
  isHaveMemo: string;
  appTargetUsers: string;
  appAccessFrontsiteDns?: string | null;
  appAccessFrontsiteIp?: string | null;
  appAccessBacksiteDns?: string | null;
  appAccessBacksiteIp?: string | null;
  senderDirectorateId?: string | null;
  senderDirectorateCode?: string | null;
  senderDirectorateName?: string | null;
  userPicDirectorateId?: string | null;
  userPicDirectorateCode?: string | null;
  userPicDirectorateName?: string | null;
  reqManageByDirectorateId?: string | null;
  reqManageByDirectorateCode?: string | null;
  reqManageByDirectorateName?: string | null;
  reqManageByDivisionId?: string | null;
  reqManageByDivisionCode?: string | null;
  reqManageByDivisionName?: string | null;
  reqManageByGroupId?: string | null;
  reqManageByGroupCode?: string | null;
  reqManageByGroupName?: string | null;
  approvalBy?: string | null;
  approvalAt?: string | null;
  approvalNote?: string | null;
  approvalNama?: string | null;
  approvalJabatan?: string | null;
  approvalNamaUnitKerja?: string | null;
  approvalOrgDirectorateId?: string | null;
  approvalOrgDirectorateCode?: string | null;
  approvalOrgDirectorateName?: string | null;
  approvalOrgDivisionId?: string | null;
  approvalOrgDivisionCode?: string | null;
  approvalOrgDivisionName?: string | null;
  approvalOrgGroupId?: string | null;
  approvalOrgGroupCode?: string | null;
  approvalOrgGroupName?: string | null;
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

  // Manage By
  reqManageByDirectorateId?: string | null;
  reqManageByDirectorateCode?: string | null;
  reqManageByDirectorateName?: string | null;
  reqManageByDivisionId?: string | null;
  reqManageByDivisionCode?: string | null;
  reqManageByDivisionName?: string | null;
  reqManageByGroupId?: string | null;
  reqManageByGroupCode?: string | null;
  reqManageByGroupName?: string | null;

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

  // HISTORY
  requirementHistories?: RequirementHistoryResponse[];

  // STATUS INFO
  isStatusFinal?: boolean;

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
  id?: string; // Backend expects 'id' field (maps to Id in C#)
  localId?: string; // For client-side operations only
  backlogId?: string | null; // Database ID (same as id, kept for compatibility)
  parentBacklogId?: string | null;
  backlogName: string;
  backlogDesc?: string | null;
  note?: string | null;
  posOrder: number;
  urgency?: string | null;
  impact?: string | null;
  priority?: string | null;
  backlogHistories?: ReqBacklogPayload[];
  reffData?: BacklogDataResponse | null; // Parent backlog data for RFC
  rfcBacklogChanges?: string | null;
  rfcBacklogImportant?: string | null;
  rfcBacklogImpactOthers?: string | null;
  rfcPriorities?: string | null;
  rfcPrioritiesIndex?: number | null;
}

export interface RequirementApprovalPayload {
  id: string;
  statusApprove: string;
  noteApproval?: string | null;
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
  assignedFromEmail?: string | null;
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

  // Manage By
  reqManageByDirectorateId?: string | null;
  reqManageByDivisionId?: string | null;
  reqManageByGroupId?: string | null;

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
  backlogImplementStartdate: string | null;
  backlogImplementEnddate: string | null;
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
  rfcBacklogChanges?: string | null;
  rfcBacklogImportant?: string | null;
  rfcBacklogImpactOthers?: string | null;
  rfcPriorities?: string | null;
  rfcPrioritiesIndex?: number | null;
  reffData?: BacklogDataResponse | null;
  backlogHistories?: BacklogHistoryDataResponse[];
}

export interface BacklogHistoryDataResponse {
  id: string;
  backlogIdParent: string;
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
  backlogImplementStartdate: string | null;
  backlogImplementEnddate: string | null;
  procurementWorkflowId: string | null;
  projectId: string | null;
  reqId: string | null;
  reffId: string | null;
  appsId: string | null;
  note: string | null;
  version: string;
  isLive: string;
  posOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  rfcBacklogChanges?: string | null;
  rfcBacklogImportant?: string | null;
  rfcBacklogImpactOthers?: string | null;
  rfcPriorities?: string | null;
  rfcPrioritiesIndex?: number | null;
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
  rfcBacklogChanges?: string | null;
  rfcBacklogImportant?: string | null;
  rfcBacklogImpactOthers?: string | null;
  rfcPriorities?: string | null;
  rfcPrioritiesIndex?: number | null;
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
  version: string;
  isLive: string;
  rfcBacklogChanges?: string | null;
  rfcBacklogImportant?: string | null;
  rfcBacklogImpactOthers?: string | null;
  rfcPriorities?: string | null;
  rfcPrioritiesIndex?: number | null;
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
    version: data.version,
    isLive: data.isLive,
    rfcBacklogChanges: data.rfcBacklogChanges,
    rfcBacklogImportant: data.rfcBacklogImportant,
    rfcBacklogImpactOthers: data.rfcBacklogImpactOthers,
    rfcPriorities: data.rfcPriorities,
    rfcPrioritiesIndex: data.rfcPrioritiesIndex,
  }));
}

interface useRequirements {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<RequirementsResponse[] | null> | null>;
  ListMyAssigned: (
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
  ApproveRequirement: (
    payload: RequirementApprovalPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetApprovalStatusChoices: (
    token: string
  ) => Promise<ApiGenericResponse<SysModuleStatusFlowResponse[] | null> | null>;
  StartReview: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RequestApproval: (
    id: string,
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
  GetProjectsByRequirementId: (
    requirementId: string,
    token: string
  ) => Promise<ApiGenericResponse<any[] | null> | null>;
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

  const ListMyAssigned = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<RequirementsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.post<ApiGenericResponse<RequirementsResponse[]>>(
        `${UrlEndpoint}/v1/Requirement/my-assigned`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return handleAxiosError(err);
      }
      setError("An unknown error occurred. Please try again.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connect to api", error: null };
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

  const ApproveRequirement = async (
    payload: RequirementApprovalPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/approve`;
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
          err.response?.data?.message || "An error occurred."
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

  const GetApprovalStatusChoices = async (
    token: string
  ): Promise<ApiGenericResponse<SysModuleStatusFlowResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/approval-status-choices`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<SysModuleStatusFlowResponse[]>
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
          err.response?.data?.message || "An error occurred."
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

  const StartReview = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/start-review/${id}`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
      >(`${UrlEndpoint}${PathEndpoint}`, {}, {
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
          err.response?.data?.message || "An error occurred."
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

  const RequestApproval = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/request-approval`;
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
      >(`${UrlEndpoint}${PathEndpoint}`, { id }, {
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
          err.response?.data?.message || "An error occurred."
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

  const GetProjectsByRequirementId = async (
    requirementId: string,
    token: string
  ): Promise<ApiGenericResponse<any[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/${requirementId}/projects`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<any[]>
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
          err.response?.data?.message || "An error occurred during get projects."
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
    ListMyAssigned,
    ListUnregistProject,
    GetDetailById,
    InsertReq,
    RegisterDraft,
    RegisterUpdate,
    ApproveRequirement,
    GetApprovalStatusChoices,
    StartReview,
    RequestApproval,
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
    GetProjectsByRequirementId,
    isLoading,
    error,
  };
};

export default useRequirements;
