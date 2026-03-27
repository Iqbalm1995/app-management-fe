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
  BacklogDataResponse,
  BacklogInsertPayload,
  BacklogUpdatePayload,
  RequirementWorkProgramDataResponse,
  WorkProgramsPayload,
} from "./useRequirements";

// Project Import Interfaces
export interface ProjectImportDataBindModel {
  MemoNumber?: string;
  MemoNarrative?: string;
  PicUserId?: string;
  PicUserNip?: string;
  PicFullName?: string;
  PicPhone?: string;
  PicEmail?: string;
  PicDivisionCode?: string;
  PicGroupCode?: string;
  RbbCodeExternal?: string;
  WorkprogramNameExternal?: string;
  AccountNameExternal?: string;
  AccountNumberExternal?: string;
  CcExternal?: string;
  WorkprogramAmountExternal?: number;
  WorkprogramRealizationExtenal?: number;
  WorkprogramDivisionCodeExternal?: string;
  WorkprogramGroupCodeExternal?: string;
  RbbCodeInternal?: string;
  WorkprogramNameInternal?: string;
  AccountNameInternal?: string;
  AccountNumberInternal?: string;
  CcInternal?: string;
  WorkprogramAmountInternal?: number;
  WorkprogramRealizationInternal?: number;
  ProjectNumber?: string;
  ProjectName?: string;
  DivisionCodeInitiation?: string;
  GroupCodeInvolved?: string;
  ProjectCharacteristic?: string;
  ProjetType?: string;
  ProjectCurrentStatus?: string;
  ProjectStartDate?: string;
  ProjectGoLivePlanDate?: string;
  ProjectGoLiveRealizationDate?: string;
  ProjectClosingDate?: string;
  Note?: string;
  ProjectAssigmentUserIds?: string;
  ProjectAppInitial?: string;
  ProjectAppName?: string;
  ProjectFeatures?: string;
}

export interface ProjectImportDataBatchBindModel {
  batchData: ProjectImportDataBindModel[];
}

// Legacy Import Interfaces
export interface ProjectImportLegacyDataBindModel {
  ProjectNumber?: string;
  ProjectName?: string;
  DivisionCodeInitiation?: string;
  ProjetType?: string;
  ProjectCurrentStatus?: string;
  ProjectStartDate?: string;
  ProjectGoLivePlanDate?: string;
  ProjectGoLiveRealizationDate?: string;
  ProjectClosingDate?: string;
}

export interface ProjectImportLegacyDataBatchBindModel {
  batchData: ProjectImportLegacyDataBindModel[];
}

export interface ProjectImportLegacyValidationResponse {
  ProjectNumber?: string;
  ProjectName?: string;
  DivisionCodeInitiation?: string;
  ProjetType?: string;
  ProjectCurrentStatus?: string;
  ProjectStartDate?: string;
  ProjectGoLivePlanDate?: string;
  ProjectGoLiveRealizationDate?: string;
  ProjectClosingDate?: string;
}

export interface ProjectImportLegacyResponse {
  dataImport?: ProjectImportLegacyDataBindModel;
  validationResponse?: ProjectImportLegacyValidationResponse;
  isValid: boolean;
}

export interface ProjectLegacyImportBatchResponse {
  batchResponse: ProjectImportLegacyResponse[];
  isStatus: boolean;
  countValid: number;
  countInvalid: number;
}

export interface ProjectImportValidationResponse {
  MemoNumber?: string;
  MemoNarrative?: string;
  PicUserId?: string;
  PicUserNip?: string;
  PicFullName?: string;
  PicPhone?: string;
  PicEmail?: string;
  PicDivisionCode?: string;
  PicGroupCode?: string;
  RbbCodeExternal?: string;
  WorkprogramNameExternal?: string;
  AccountNameExternal?: string;
  AccountNumberExternal?: string;
  CcExternal?: string;
  WorkprogramAmountExternal?: string;
  WorkprogramRealizationExtenal?: string;
  WorkprogramDivisionCodeExternal?: string;
  WorkprogramGroupCodeExternal?: string;
  RbbCodeInternal?: string;
  WorkprogramNameInternal?: string;
  AccountNameInternal?: string;
  AccountNumberInternal?: string;
  CcInternal?: string;
  WorkprogramAmountInternal?: string;
  WorkprogramRealizationInternal?: string;
  ProjectNumber?: string;
  ProjectName?: string;
  DivisionCodeInitiation?: string;
  GroupCodeInvolved?: string;
  ProjectCharacteristic?: string;
  ProjetType?: string;
  ProjectCurrentStatus?: string;
  ProjectStartDate?: string;
  ProjectGoLivePlanDate?: string;
  ProjectGoLiveRealizationDate?: string;
  ProjectClosingDate?: string;
  Note?: string;
  ProjectAssigmentUserIds?: string;
  ProjectAppInitial?: string;
  ProjectAppName?: string;
  ProjectFeatures?: string;
}

export interface ProjectImportResponse {
  dataImport?: ProjectImportDataBindModel;
  validationResponse?: ProjectImportValidationResponse;
  isValid: boolean;
}

export interface ProjectImportBatchResponse {
  batchResponse: ProjectImportResponse[];
  isStatus: boolean;
  countValid: number;
  countInvalid: number;
}

export interface ProjectDataResponse {
  id: string;
  projectNo: string;
  projectCode: string;
  projectName: string;
  projectDesc: string;
  projectStatus: string;
  approvalStatus: string | null;
  note: string | null;
  projectCategory: string;
  projectType: string;
  projectRegisterDate: string | null;
  projectClosedDate: string | null;
  projectDurationDays: number;
  projectStatusPercentage: number;
  projectAcquisitionCode: string | null;
  projectAcquisitionName: string | null;
  projectCharasteristicCode: string | null;
  projectCharasteristicName: string | null;
  projectSubCharasteristicCode: string | null;
  projectSubCharasteristicName: string | null;
  projectSubCharasteristicDesc: string | null;
  proOwnerDirectorateId: string;
  proOwnerDirectorateCode: string;
  proOwnerDirectorateName: string;
  proManageByDirectorateId: string;
  proManageByDirectorateCode: string;
  proManageByDirectorateName: string;
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
  isImported: string;
  reqParentId: string | null;
  sdlcId: string | null;
  sdlcCode: string | null;
  sdlcName: string | null;
  sdlcStageId: string | null;
  sdlcStageCode: string | null;
  sdlcStageName: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  userAssignment: ProjectUserAssignmentResponse[];
  appsProject: ApplicationMasterShortResponse | null;
  requirementData: RequirementShortResponse | null;
  workPrograms: RequirementWorkProgramDataResponse[];
  projectWorkflowProjectData: ProjectWorkflowResponse[];
  projectWorkflowData: ProjectWorkflowResponse[];
}

export interface ProjectSdlcStageResponse {
  id: string;
  projectId: string;
  sdlcFlowId: string;
  stageCode: string | null;
  stageName: string;
  stagePosOrder: number;
  stageStatusBeforeTiggerChange: string | null;
  stageStatusAfterTriggerChange: string | null;
  stageTriggerStatus: string;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ProjectSdlcStageReportResponse {
  id: string;
  projectId: string;
  projectFlowStagesId: string;
  reportNote: string;
  tagsReport: string | null;
  statusLabel: string;
  reportStartDate: string | null;
  reportEndDate: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  createdByName: string;
  stageName: string;
}

export interface ProjectSdlcStageWithReportsResponse {
  id: string;
  stageName: string;
  stageCode?: string;
  stagePosOrder: number;
  stageTriggerStatus: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  reports: ProjectSdlcStageReportResponse[];
}

export interface ProjectStatusHistoryResponse {
  id: string;
  projectId: string;
  projectStatus: string;
  createdAt: string;
  approvalBy: string | null;
  approvalAt: string | null;
  approvalNote: string | null;
  approvalNama: string | null;
  approvalJabatan: string | null;
  approvalNamaUnitKerja: string | null;
  approvalOrgDirectorateId: string | null;
  approvalOrgDirectorateCode: string | null;
  approvalOrgDirectorateName: string | null;
  approvalOrgDivisionId: string | null;
  approvalOrgDivisionCode: string | null;
  approvalOrgDivisionName: string | null;
  approvalOrgGroupId: string | null;
  approvalOrgGroupCode: string | null;
  approvalOrgGroupName: string | null;
  isApprovalPhase: boolean;
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

export interface RequirementShortResponse {
  id: string;
  requirementType: string;
  reqNumber: string;
  reqStatus: string | null;
  reqNarative?: string;
  reqInititateDate?: string;
  reqAcceptedDate?: string;
  isCarryOver?: string;
  appLiveTargetDate?: string;
  senderDirectorateName?: string;
  senderDivisionName?: string;
  reqManageByDirectorateName?: string;
  reqManageByDivisionName?: string;
  reqManageByGroupName?: string;
  note?: string;
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
  workflowBacklog?: BacklogDataResponse | null;
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
  mediaObjectData?: MediaObjectResponse | null;
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
  projectAcquisitionCode?: string | null;
  projectCharasteristicCode?: string | null;
  projectSubCharasteristicCode?: string | null;
  proOwnerDirectorateId?: string | null;
  proOwnerDivisionId?: string | null;
  proOwnerGroupId?: string | null;
  proManageByDirectorateId?: string | null;
  proManageByDivisionId?: string | null;
  proManageByGroupId?: string | null;
  proManageByTeamId?: string | null;
  reqParentId?: string | null;
  userAssigns: ProjectUserInsertPayload[];
  projectPlanWorkflowIds: string[];
  projectPlanWorkflowBacklogsIds: string[];
  workProgramsBacklogs: BacklogInsertPayload[];
  workPrograms: WorkProgramsPayload[];
}

export interface ProjectRegisterPayload {
  reqParentId?: string | null;
  projectType: string;
  projectNo?: string | null;
  projectName: string;
  projectDesc?: string | null;
  note?: string | null;
  projectCategory: string;
  projectRegisterDate: string;
  projectClosedDate?: string | null;
  projectAcquisitionCode?: string | null;
  projectCharasteristicCode?: string | null;
  projectSubCharasteristicCode?: string | null;
  proOwnerDirectorateId?: string | null;
  proManageByDirectorateId?: string | null;
  proOwnerDivisionId?: string | null;
  proOwnerGroupId?: string | null;
  proManageByDivisionId?: string | null;
  proManageByGroupId?: string | null;
  proManageByTeamId?: string | null;
  userAssigns: ProjectUserInsertPayload[];
  projectPlanWorkflowBacklogsIds: string[];
  projectPlanWorkflowIds: string[];
  backlogsProject: BacklogUpdatePayload[];
  workProgramsBacklogs: WorkProgramsPayload[];
  workPrograms: WorkProgramsPayload[];
}

export interface ProjectWorkflowValueInsertPayload {
  // id: string;
  ReffParentId?: string | null;
  ProjectWorkflowId: string;
  DocumentType: string;
  DocumentName: string;
  DocumentNumber: string;
  DocumentDate: string;
  DocumentVersion: string;
  LinkAttachment?: string | null;
  file?: File | null;
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
  projectAcquisitionCode: string | null;
  projectCharasteristicCode: string | null;
  projectSubCharasteristicCode: string | null;
  proOwnerDirectorateId: string | null;
  proManageByDirectorateId: string | null;
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

export interface ProjectMemberAssignmentPayload {
  projectId: string;
  assignUsers: string[];
  unassignUsers: string[];
}

export interface ProjectMemberAssignmentResult {
  assigned: number;
  unassigned: number;
  failed: string[];
}

export interface ProjectCountResponse {
  countAllProjects: number;
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

export interface ProjectDetailResponse extends ProjectDataResponse {
  taskSummary: {
    all: number;
    toDo: number;
    inProgress: number;
    inReview: number;
    done: number;
    archived: number;
  };
  backlogCount: number;
}

export interface ProjectBacklogProgressionResponse {
  totalBacklogs: number;
  totalBacklogsDone: number;
  progressionBacklog: number;
}

export interface ProjectQuickStatsResponse {
  totalBacklogs: number;
  completedDocumentations: number;
  totalDocumentations: number;
  documentationProgressPercentage: number;
  completedProcurementStages: number;
  totalProcurementStages: number;
  procurementProgressPercentage: number;
  activeMembers: number;
  backlogsNearDeadline: number;
}

export interface ProjectBacklogStatsResponse {
  progressionPercentage: number;
  totalBacklogs: number;
  completedBacklogs: number;
  backlogsByPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  taskCounts: {
    total: number;
    toDo: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
}

export interface ProjectDocumentationStatsResponse {
  progressionPercentage: number;
  totalDocumentations: number;
  completedDocumentations: number;
  totalParentWorkflows: number;
  completedParentWorkflows: number;
}

export interface ProjectProcurementStatsResponse {
  progressionPercentage: number;
  totalProcurementStages: number;
  completedProcurementStages: number;
  totalParentWorkflows: number;
  completedParentWorkflows: number;
}

export interface ProjectMemberTaskStatsResponse {
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    totalTasksOwned: number;
    tasksCompleted: number;
    completionPercentage: number;
  }>;
}

export interface ProjectDeadlineStatsResponse {
  topBacklogsNearDeadline: Array<{
    id: string;
    backlogName: string;
    backlogEnddate: string | null;
    daysUntilDeadline: number;
    priority: string;
    progressionPercentage: number;
  }>;
  topTasksNearDeadline: Array<{
    id: string;
    taskName: string;
    taskPriority: string;
    boardName: string;
    boardCode: string;
    endDate: string | null;
    daysUntilDeadline: number;
    taskItemsCompleted: number;
    taskItemsTotal: number;
    assignedUsers: Array<{
      userId: string;
      userName: string;
      userEmail: string;
    }>;
  }>;
  additionalDeadlineTasksCount: number;
}

export interface BulkProgressionUpdateResult {
  totalProcessed: number;
  totalUpdated: number;
  totalErrors: number;
  totalSkipped: number;
  processingTimeSeconds: number;
}

export interface ProjectWorkflowBacklogInitializePayload {
  projectWorkflowId: string;
}

interface useProjectsServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null>;
  GetAssignedProjects: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null>;
  GetWaitingApproval: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null>;
  ApproveProject: (
    payload: { projectId: string; isApproved: boolean; note?: string },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  CanApproveProject: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<object | null> | null>;
  GetDetailById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDataResponse | null> | null>;
  GetProjectDetail: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDetailResponse | null> | null>;
  GetProjectStatusHistory: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectStatusHistoryResponse[] | null> | null>;
  GetProjectQuickStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectQuickStatsResponse | null> | null>;
  GetProjectBacklogStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectBacklogStatsResponse | null> | null>;
  GetProjectDocumentationStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDocumentationStatsResponse | null> | null>;
  GetProjectProcurementStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectProcurementStatsResponse | null> | null>;
  GetProjectMemberTaskStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectMemberTaskStatsResponse | null> | null>;
  GetProjectDeadlineStats: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectDeadlineStatsResponse | null> | null>;
  UpdateProjectProgressionAndStatus: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateAllProjectsProgressionSnapshot: (
    token: string
  ) => Promise<ApiGenericResponse<BulkProgressionUpdateResult | null> | null>;
  GetProjectCount: (
    token: string
  ) => Promise<ApiGenericResponse<ProjectCountResponse | null> | null>;
  InsertProjects: (
    payload: ProjectInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RegisterProjectNew: (
    payload: ProjectRegisterPayload,
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
  AssignUnassignMembers: (
    payload: ProjectMemberAssignmentPayload,
    token: string
  ) => Promise<ApiGenericResponse<ProjectMemberAssignmentResult | null> | null>;
  RemoveProjectMember: (
    payload: { projectId: string; userId: string },
    token: string
  ) => Promise<ApiGenericResponse<object | null> | null>;
  GetProjectMembers: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<
    ProjectUserAssignmentResponse[] | null
  > | null>;
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

  // project workflow data

  ProjectWorkflowBacklogInitialize: (
    pauload: ProjectWorkflowBacklogInitializePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  ListProjectWorkflowBacklog: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectWorkflowResponse[] | null> | null>;

  ListProjectWorkflow: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectWorkflowResponse[] | null> | null>;

  ListProjectWorkflowValue: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<
    ProjectWorkflowValueResponse[] | null
  > | null>;

  GetDetailProjectWorkflowValueById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectWorkflowValueResponse | null> | null>;

  InsertProjectWorkflowValue: (
    payload: ProjectWorkflowValueInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  ProjectImportValidationBatch: (
    payload: ProjectImportDataBatchBindModel,
    token: string
  ) => Promise<ApiGenericResponse<ProjectImportBatchResponse>>;

  ProjectImportBatch: (
    payload: ProjectImportDataBatchBindModel,
    token: string
  ) => Promise<ApiGenericResponse<ProjectImportBatchResponse>>;

  ProjectImportLegacyValidationBatch: (
    payload: ProjectImportLegacyDataBatchBindModel,
    token: string
  ) => Promise<ApiGenericResponse<ProjectLegacyImportBatchResponse | null> | null>;

  ProjectImportLegacyBatch: (
    payload: ProjectImportLegacyDataBatchBindModel,
    token: string
  ) => Promise<ApiGenericResponse<ProjectLegacyImportBatchResponse | null> | null>;

  AssignBacklogsToProject: (
    payload: { projectId: string; backlogIds: string[] },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  AssignWorkflowsToProject: (
    payload: { projectId: string; workflowIds: string[] },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  AssignProcurementStagesToProject: (
    payload: { projectId: string; workflowIds: string[] },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  SetupProjectSdlc: (
    projectId: string,
    sdlcFlowId: string,
    selectedStageIds: string[],
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  GetProjectSdlcStages: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectSdlcStageResponse[] | null> | null>;

  UpdateProjectSdlcStageDates: (
    stageId: string,
    startDate: string | null,
    endDate: string | null,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  ListProjectSdlcStageReports: (
    projectFlowStagesId: string,
    page: number,
    pageSize: number,
    token: string
  ) => Promise<ApiGenericResponse<ProjectSdlcStageReportResponse[] | null> | null>;

  GetProjectSdlcStagesWithReports: (
    projectId: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectSdlcStageWithReportsResponse[] | null> | null>;

  GetProjectSdlcStageReportById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<ProjectSdlcStageReportResponse | null> | null>;

  InsertProjectSdlcStageReport: (
    data: {
      projectId: string;
      projectFlowStagesId: string;
      reportNote: string;
      tagsReport?: string;
      statusLabel: string;
      reportStartDate?: string;
      reportEndDate?: string;
    },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  UpdateProjectSdlcStageReport: (
    data: {
      id: string;
      reportNote: string;
      tagsReport?: string;
      statusLabel: string;
      reportStartDate?: string;
      reportEndDate?: string;
    },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  DeleteProjectSdlcStageReport: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

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

  const GetAssignedProjects = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<ProjectDataResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/assigned-projects";
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetWaitingApproval = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<ProjectDataResponse[]> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/waiting-approval";
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
        handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred during request."
        );
        return {
          statusCode: err.response?.status || RES_CODE_SERVER_ERROR,
          data: null,
          message: err.response?.data?.message || "Error occurred",
          error: null,
        };
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

  const ApproveProject = async (
    payload: { projectId: string; isApproved: boolean; note?: string },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/approve";
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
        handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred during request."
        );
        return {
          statusCode: err.response?.status || RES_CODE_SERVER_ERROR,
          data: null,
          message: err.response?.data?.message || "Error occurred",
          error: null,
        };
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

  const CanApproveProject = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<object | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/can-approve`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<object>
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
        handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred during request."
        );
        return {
          statusCode: err.response?.status || RES_CODE_SERVER_ERROR,
          data: null,
          message: err.response?.data?.message || "Error occurred",
          error: null,
        };
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

  const GetDetailById = async(
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

  const GetProjectDetail = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectDetailResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/detail`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectDetailResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectStatusHistory = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectStatusHistoryResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/status-history`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectStatusHistoryResponse[]>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectQuickStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectQuickStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/quick-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectQuickStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectBacklogStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectBacklogStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/backlog-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectBacklogStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectDocumentationStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectDocumentationStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/documentation-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectDocumentationStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectProcurementStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectProcurementStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/procurement-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectProcurementStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectMemberTaskStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectMemberTaskStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/member-task-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectMemberTaskStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectDeadlineStats = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectDeadlineStatsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/deadline-stats`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectDeadlineStatsResponse>
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
          err.response?.data?.message || "An error occurred during request."
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

  const UpdateProjectProgressionAndStatus = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/update/progression-status`;
    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { projectId },
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
          err.response?.data?.message || "An error occurred during request."
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

  const UpdateAllProjectsProgressionSnapshot = async (
    token: string
  ): Promise<ApiGenericResponse<BulkProgressionUpdateResult | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/snapshot/progressions-update`;
    try {
      const response = await axiosInstance.post<ApiGenericResponse<BulkProgressionUpdateResult>>(
        `${UrlEndpoint}${PathEndpoint}`,
        {},
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
          err.response?.data?.message || "An error occurred during request."
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

  const GetProjectCount = async (
    token: string
  ): Promise<ApiGenericResponse<ProjectCountResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/count`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectCountResponse>
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

  const RegisterProjectNew = async (
    payload: ProjectRegisterPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/register-new";

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
        setError(err.response?.data?.message || "An error occurred.");
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

  const AssignUnassignMembers = async (
    payload: ProjectMemberAssignmentPayload,
    token: string
  ): Promise<ApiGenericResponse<ProjectMemberAssignmentResult | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/member/assignment";

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectMemberAssignmentResult | null>
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
        setError(err.response?.data?.message || "An error occurred.");
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

  const GetProjectMembers = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<
    ProjectUserAssignmentResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/${projectId}/members`;

    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectUserAssignmentResponse[] | null>
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
        setError(err.response?.data?.message || "An error occurred.");
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

  const RemoveProjectMember = async (
    payload: { projectId: string; userId: string },
    token: string
  ): Promise<ApiGenericResponse<object | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/member/remove";

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<object | null>
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
        setError(err.response?.data?.message || "An error occurred.");
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

  const ProjectWorkflowBacklogInitialize = async (
    payload: ProjectWorkflowBacklogInitializePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string =
      "/v1/Projects/projectWorkflowBacklog/initialize";

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

  const ListProjectWorkflowBacklog = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectWorkflowResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/ProjectWorkflowBacklogData/list/${projectId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectWorkflowResponse[]>
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

  const ListProjectWorkflow = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectWorkflowResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/ProjectWorkflowData/list/${projectId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectWorkflowResponse[]>
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

  const ListProjectWorkflowValue = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<
    ProjectWorkflowValueResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/ProjectWorkflowValue/list-paged";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectWorkflowValueResponse[]>
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

  const GetDetailProjectWorkflowValueById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectWorkflowValueResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Projects/ProjectWorkflowValue/detail/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<ProjectWorkflowValueResponse>
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

  const InsertProjectWorkflowValue = async (
    payload: ProjectWorkflowValueInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/ProjectWorkflowValue/insert";

    // Create FormData and append payload fields
    const formData = new FormData();

    formData.append("ProjectWorkflowId", payload.ProjectWorkflowId);
    formData.append("DocumentType", payload.DocumentType);
    formData.append("DocumentName", payload.DocumentName);
    formData.append("DocumentNumber", payload.DocumentNumber);
    formData.append("DocumentDate", payload.DocumentDate);
    formData.append("DocumentVersion", payload.DocumentVersion);

    if (payload.ReffParentId) {
      formData.append("ReffParentId", payload.ReffParentId);
    }

    if (payload.LinkAttachment) {
      formData.append("LinkAttachment", payload.LinkAttachment);
    }

    if (payload.file) {
      formData.append("file", payload.file);
    }

    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<string | null>
      >(`${UrlEndpoint}${PathEndpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for file upload
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message || "An error occurred during operation."
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

  const ProjectImportValidationBatch = async (
    payload: ProjectImportDataBatchBindModel,
    token: string
  ): Promise<ApiGenericResponse<ProjectImportBatchResponse>> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${buildUrlPort(
          ENDPOINT_API_BASEURL,
          ENDPOINT_PORT_BASIC
        )}/v1/projects/import/internal-dev/validation`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error as any
      ) as unknown as ApiGenericResponse<ProjectImportBatchResponse>;
    } finally {
      setIsLoading(false);
    }
  };

  const ProjectImportBatch = async (
    payload: ProjectImportDataBatchBindModel,
    token: string
  ): Promise<ApiGenericResponse<ProjectImportBatchResponse>> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${buildUrlPort(
          ENDPOINT_API_BASEURL,
          ENDPOINT_PORT_BASIC
        )}/v1/projects/import/internal-dev/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error as any
      ) as unknown as ApiGenericResponse<ProjectImportBatchResponse>;
    } finally {
      setIsLoading(false);
    }
  };

  const ProjectImportLegacyValidationBatch = async (
    payload: ProjectImportLegacyDataBatchBindModel,
    token: string
  ): Promise<ApiGenericResponse<ProjectLegacyImportBatchResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/projects/import/legacy/validation";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectLegacyImportBatchResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 0, // No timeout limit
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
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

  const ProjectImportLegacyBatch = async (
    payload: ProjectImportLegacyDataBatchBindModel,
    token: string
  ): Promise<ApiGenericResponse<ProjectLegacyImportBatchResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/projects/import/legacy/";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectLegacyImportBatchResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 0, // No timeout limit
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
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

  const AssignBacklogsToProject = async (
    payload: { projectId: string; backlogIds: string[] },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/assign-backlogs";
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

  const AssignWorkflowsToProject = async (
    payload: { projectId: string; workflowIds: string[] },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/assign-workflows";
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

  const AssignProcurementStagesToProject = async (
    payload: { projectId: string; workflowIds: string[] },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Projects/assign-procurement-stages";
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

  const SetupProjectSdlc = async (
    projectId: string,
    sdlcFlowId: string,
    selectedStageIds: string[],
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/v1/Projects/setup-sdlc";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        {
          projectId,
          sdlcFlowId,
          selectedStageIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error setting up SDLC");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const GetProjectSdlcStages = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectSdlcStageResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/v1/Projects/${projectId}/sdlc-stages`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<ProjectSdlcStageResponse[]>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching SDLC stages");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const UpdateProjectSdlcStageDates = async (
    stageId: string,
    startDate: string | null,
    endDate: string | null,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/v1/Projects/sdlc-stage/update-dates";

    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { stageId, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error updating stage dates");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const ListProjectSdlcStageReports = async (
    projectFlowStagesId: string,
    page: number,
    pageSize: number,
    token: string
  ): Promise<ApiGenericResponse<ProjectSdlcStageReportResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/v1/Projects/sdlc-stage-reports/list";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<ProjectSdlcStageReportResponse[]>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { projectFlowStagesId, page, pageSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching reports");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const GetProjectSdlcStagesWithReports = async (
    projectId: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectSdlcStageWithReportsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/v1/Projects/sdlc-stages-with-reports/${projectId}`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<ProjectSdlcStageWithReportsResponse[]>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
      return null;
    }
  };

  const GetProjectSdlcStageReportById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<ProjectSdlcStageReportResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/v1/Projects/sdlc-stage-reports/${id}`;

    try {
      const response = await axiosInstance.get<ApiGenericResponse<ProjectSdlcStageReportResponse>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error fetching report");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const InsertProjectSdlcStageReport = async (
    data: {
      projectId: string;
      projectFlowStagesId: string;
      reportNote: string;
      tagsReport?: string;
      statusLabel: string;
    },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/v1/Projects/sdlc-stage-reports";

    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error creating report");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const UpdateProjectSdlcStageReport = async (
    data: {
      id: string;
      reportNote: string;
      tagsReport?: string;
      statusLabel: string;
    },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = "/v1/Projects/sdlc-stage-reports";

    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error updating report");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  const DeleteProjectSdlcStageReport = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint = `/v1/Projects/sdlc-stage-reports/${id}`;

    try {
      const response = await axiosInstance.delete<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "Error deleting report");
        return errorResponse;
      }
      setError("Unknown error occurred");
      return {
        statusCode: RES_CODE_SERVER_ERROR,
        data: null,
        message: "Error connect to api",
        error: null,
      };
    }
  };

  return {
    List,
    GetAssignedProjects,
    GetWaitingApproval,
    ApproveProject,
    CanApproveProject,
    GetDetailById,
    GetProjectDetail,
    GetProjectStatusHistory,
    GetProjectQuickStats,
    GetProjectBacklogStats,
    GetProjectDocumentationStats,
    GetProjectProcurementStats,
    GetProjectMemberTaskStats,
    GetProjectDeadlineStats,
    UpdateProjectProgressionAndStatus,
    UpdateAllProjectsProgressionSnapshot,
    GetProjectCount,
    InsertProjects,
    RegisterProjectNew,
    UpdateProjects,
    DeleteProjects,
    ListPIC,
    UpdatePIC,
    AssignUnassignMembers,
    RemoveProjectMember,
    GetProjectMembers,
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

    ProjectWorkflowBacklogInitialize,
    ListProjectWorkflowBacklog,

    GetProjectBacklogProgression,

    ProjectImportValidationBatch,
    ProjectImportBatch,
    ProjectImportLegacyValidationBatch,
    ProjectImportLegacyBatch,

    AssignBacklogsToProject,
    AssignWorkflowsToProject,
    AssignProcurementStagesToProject,

    ListProjectWorkflow,
    ListProjectWorkflowValue,
    GetDetailProjectWorkflowValueById,
    InsertProjectWorkflowValue,

    SetupProjectSdlc,
    GetProjectSdlcStages,
    UpdateProjectSdlcStageDates,
    ListProjectSdlcStageReports,
    GetProjectSdlcStagesWithReports,
    GetProjectSdlcStageReportById,
    InsertProjectSdlcStageReport,
    UpdateProjectSdlcStageReport,
    DeleteProjectSdlcStageReport,

    isLoading,
    error,
  };
};

export default useProjects;
