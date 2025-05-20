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

export interface RequirementsResponse {
  id: string;
  reffParentId?: string;
  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate: string;
  reqAcceptedDate?: string;
  reqStatus?: string;
  isCarryOver: "Y" | "N";
  reqDurationDay: number;
  reqReviewStartDate?: string;
  reqReviewEndDate?: string;
  assignedFromId?: string;
  assignedFromName?: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToDate?: string;
  userPicId?: string;
  userPicName?: string;
  userPicContanct?: string;
  userPicEmail?: string;
  nextStep?: string;
  reqReviewDurationDay: number;
  workProgramCodeEx: string;
  workProgramNameEx: string;
  workProgramAccNameEx: string;
  workProgramAccNumberEx: string;
  workProgramAccCcUser: string;
  workProgramBudgetUser: number;
  workProgramRealUsers: number;
  workProgramLeftoversUsers: number;
  workProgramCodeInt: string;
  workProgramNameInt: string;
  workProgramAccNameInt: string;
  workProgramAccNumberInt: string;
  workProgramAccCcInt: string;
  workProgramBudgetInt: number;
  workProgramRealInt: number;
  workProgramLeftoversInt: number;
  appInitialCode?: string;
  appInitialName?: string;
  backlogFeature?: string;
  backlogDescription?: string;
  backlogChange?: string;
  note?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  senderDivisionId: string;
  senderDivisionData: DivisionInvolvedDataResponse;
  divisionInvolved: DivisionInvolvedDataResponse[];
  picAssignUsers: PicAssignUserDataResponse[];
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

export interface PicAssignUserDataResponse {
  userData: UsersResponse;
  isChecked: string;
}

export interface DivisionInvolvedDataResponse {
  id: string;
  divisionCode: string;
  divisionName: string;
  divisionDesc: string | null;
}

export interface ReqAssignUserPayload {
  userId: string;
  isChecked: "Y" | "N";
}

export interface ReqBacklogPayload {
  backlogId?: string | null;
  backlogName: string;
  backlogDesc?: string | null;
}

export interface RequirementsInsertPayload {
  reffParentId?: string | null;

  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate: string;
  reqAcceptedDate?: string | null;
  reqStatus: string;
  isCarryOver: "Y" | "N";

  reqReviewStartDate?: string | null;

  assignedFromId: string;
  assignedFromName: string;
  assignedToDate: string;
  assignedToId?: string | null;
  assignedToName?: string | null;

  userPicId: string;
  userPicName: string;
  userPicContanct: string;
  userPicEmail: string;

  workProgramCodeEx: string;
  workProgramNameEx: string;
  workProgramAccNameEx: string;
  workProgramAccNumberEx: string;
  workProgramAccCcUser: string;
  workProgramBudgetUser: number;
  workProgramRealUsers: number;

  workProgramCodeInt: string;
  workProgramNameInt: string;
  workProgramAccNameInt: string;
  workProgramAccNumberInt: string;
  workProgramAccCcInt: string;
  workProgramBudgetInt: number;
  workProgramRealInt: number;

  appInitialCode: string;
  appInitialName: string;
  backlogFeature?: string | null;

  backlogDescription?: string | null;
  backlogChange?: string | null;
  note?: string | null;
  involvedDivisionIds: string[];
  senderDivisionId: string;
  picAssignUsers: ReqAssignUserPayload[];
  backlogFeatures: ReqBacklogPayload[];
}

export interface RequirementsUpdatePayload {
  id: string;

  reffParentId: string | null;

  requirementType: string;
  reqNumber: string;
  reqNarative: string;
  reqInititateDate: string;
  reqAcceptedDate: string | null;
  reqStatus: string;
  isCarryOver: "Y" | "N";

  reqReviewStartDate: string | null;
  reqReviewEndDate: string | null;

  assignedFromId: string;
  assignedFromName: string;
  assignedToDate: string;

  userPicId: string;
  userPicName: string;
  userPicContanct: string;
  userPicEmail: string;

  workProgramCodeEx: string;
  workProgramNameEx: string;
  workProgramAccNameEx: string;
  workProgramAccNumberEx: string;
  workProgramAccCcUser: string;
  workProgramBudgetUser: number;
  workProgramRealUsers: number;
  workProgramLeftoversUsers: number;

  workProgramCodeInt: string;
  workProgramNameInt: string;
  workProgramAccNameInt: string;
  workProgramAccNumberInt: string;
  workProgramAccCcInt: string;
  workProgramBudgetInt: number;
  workProgramRealInt: number;
  workProgramLeftoversInt: number;

  appInitialCode: string;
  appInitialName: string;
  backlogFeature: string;
  backlogDescription?: string | null;
  backlogChange?: string | null;
  note?: string | null;

  nextStep: string;

  senderDivisionId: string;
  picAssignUsers: ReqAssignUserPayload[];
  backlogFeatures: ReqBacklogPayload[];
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

export interface RequirementsAssignProjectsPayload {
  reqId: string;
  projectId: string[];
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
  UpdateReq: (
    payload: RequirementsUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteReq: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  AssignProjects: (
    payload: RequirementsAssignProjectsPayload,
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

  const UpdateReq = async (
    payload: RequirementsUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/update`;
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

  const DeleteReq = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/delete/${id}`;
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

  const AssignProjects = async (
    payload: RequirementsAssignProjectsPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Requirement/assign-projects-requirements`;
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
    UpdateReq,
    DeleteReq,
    AssignProjects,
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
