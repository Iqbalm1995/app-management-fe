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
  reqId: string;
  workProgramSource: string;
  workProgramCode?: string | null;
  workProgramName?: string | null;
  workProgramAccName?: string | null;
  workProgramAccNumber?: string | null;
  workProgramAccCc?: string | null;
  workProgramBudget: number;
  workProgramReal: number;
  workProgramLeftovers: number;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  createdAt: Date;
  createdBy: string;
}

export interface RequirementsResponse {
  // STG 1
  id: string;
  requirementType: string;
  reqStatus?: string | null;
  nextStep?: string | null;
  reffParentId?: string | null;
  senderDivisionId: string;
  senderDivisionCode?: string | null;
  senderDivisionName?: string | null;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate: string;
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
  approvalDatas: RequirementApprovalDataResponse[];

  // AREA 2
  userPicId?: string | null;
  userPicIdentityNumber?: string | null;
  userPicName?: string | null;
  userPicContanct?: string | null;
  userPicEmail?: string | null;
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
  divisionId: string;
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
  backlogId?: string | null;
  backlogName: string;
  backlogDesc?: string | null;
}

export interface RequirementsInsertPayload {
  // STG 1
  reffParentId?: string | null;
  senderDivisionId: string;
  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate: string;
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
  userPicDivisionId?: string | null;
  userPicGroupId?: string | null;

  // AREA 3
  workPrograms: WorkProgramsPayload[];

  // AREA 4
  appInitialCode?: string | null;
  appInitialName?: string | null;
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
  reffId: string | null;
  createdAt: string | null;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string;
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
}

interface useRequirements {
  List: (
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
    GetDetailById,
    InsertReq,
    ListBacklog,
    GetDetailBacklogById,
    InsertBacklog,
    UpdateBacklog,
    DeleteBacklog,
    ListReqMedia,
    isLoading,
    error,
  };
};

export default useRequirements;
