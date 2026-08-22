"use client";

import { useState } from "react";
import { ApiGenericResponse, PaggingListPayload } from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios, { AxiosError } from "axios";
import handleAxiosError from "../utils/handleAxiosError";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface MstRbbWorkProgramResponse {
  id: string;
  rbbId: string;
  itspCode: string;
  itspName: string;
  itspInit: string;
  initOrgGroupId: string;
  initOrgGroupCode: string;
  initOrgGroupName: string;
  workProgramCode: string;
  workProgramDesc: string;
  budgetValue: number;
  budgetType: string;
  note?: string | null;
  workProgramType: string;
  lgAccountNumber: string;
  lgAccountName: string;
  dataCenter: string;
  bundlingInputRembis: string;
  bundlingBudget: number;
  periodYear: string;
  periodQuartal: string;
  periodTime: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
}

export interface MstRbbWorkProgramsHistoryResponse {
  id: string;
  parentId: string;
  historyRbbId: string;
  itspCode: string;
  itspName: string;
  itspInit: string;
  initOrgGroupId: string;
  initOrgGroupCode: string;
  initOrgGroupName: string;
  workProgramCode: string;
  workProgramDesc: string;
  budgetValue: number;
  budgetType: string;
  note?: string | null;
  workProgramType: string;
  lgAccountNumber: string;
  lgAccountName: string;
  dataCenter: string;
  bundlingInputRembis: string;
  bundlingBudget: number;
  periodYear: string;
  periodQuartal: string;
  periodTime: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
}

export interface MstRbbHistoryResponse {
  id: string;
  parentId: string;
  orgDirectorateId: string;
  orgDirectorateCode: string;
  orgDirectorateName: string;
  orgDivisionId: string;
  orgDivisionCode: string;
  orgDivisionName: string;
  orgGroupId?: string | null;
  orgGroupCode?: string | null;
  orgGroupName?: string | null;
  targetCode: string;
  targetName: string;
  policyCode: string;
  policyName: string;
  strategyCode: string;
  strategyName: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  workProgramsHistoryList?: MstRbbWorkProgramsHistoryResponse[];
}

export interface MstRbbResponse {
  id: string;
  orgDirectorateId: string;
  orgDirectorateCode: string;
  orgDirectorateName: string;
  orgDivisionId: string;
  orgDivisionCode: string;
  orgDivisionName: string;
  orgGroupId?: string | null;
  orgGroupCode?: string | null;
  orgGroupName?: string | null;
  targetCode: string;
  targetName: string;
  policyCode: string;
  policyName: string;
  strategyCode: string;
  strategyName: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  workPrograms?: MstRbbWorkProgramResponse[];
  historyList?: MstRbbHistoryResponse[];
}

export interface MstRbbWorkProgramInsertPayload {
  itspCode: string;
  itspName: string;
  itspInit: string;
  initOrgGroupId: string;
  initOrgGroupCode: string;
  initOrgGroupName: string;
  workProgramCode: string;
  workProgramDesc: string;
  budgetValue: number;
  budgetType: string;
  note?: string | null;
  workProgramType: string;
  lgAccountNumber: string;
  lgAccountName: string;
  dataCenter: string;
  bundlingInputRembis: string;
  bundlingBudget: number;
  periodYear: string;
  periodQuartal: string;
  periodTime: string;
}

export interface MstRbbInsertPayload {
  orgDirectorateId: string;
  orgDirectorateCode: string;
  orgDirectorateName: string;
  orgDivisionId: string;
  orgDivisionCode: string;
  orgDivisionName: string;
  orgGroupId?: string | null;
  orgGroupCode?: string | null;
  orgGroupName?: string | null;
  targetCode: string;
  targetName: string;
  policyCode: string;
  policyName: string;
  strategyCode: string;
  strategyName: string;
  workPrograms: MstRbbWorkProgramInsertPayload[];
}

export interface MstRbbWorkProgramUpdatePayload {
  id?: string;
  itspCode: string;
  itspName: string;
  itspInit: string;
  initOrgGroupId: string;
  initOrgGroupCode: string;
  initOrgGroupName: string;
  workProgramCode: string;
  workProgramDesc: string;
  budgetValue: number;
  budgetType: string;
  note?: string | null;
  workProgramType: string;
  lgAccountNumber: string;
  lgAccountName: string;
  dataCenter: string;
  bundlingInputRembis: string;
  bundlingBudget: number;
  periodYear: string;
  periodQuartal: string;
  periodTime: string;
}

export interface MstRbbUpdatePayload {
  id: string;
  orgDirectorateId: string;
  orgDirectorateCode: string;
  orgDirectorateName: string;
  orgDivisionId: string;
  orgDivisionCode: string;
  orgDivisionName: string;
  orgGroupId?: string | null;
  orgGroupCode?: string | null;
  orgGroupName?: string | null;
  targetCode: string;
  targetName: string;
  policyCode: string;
  policyName: string;
  strategyCode: string;
  strategyName: string;
  workPrograms: MstRbbWorkProgramUpdatePayload[];
}

interface useMstRbbServices {
  ListMstRbb: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<MstRbbResponse[] | null> | null>;
  GetDetailMstRbb: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<MstRbbResponse | null> | null>;
  RegisterMstRbb: (
    payload: MstRbbInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateMstRbb: (
    payload: MstRbbUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useMstRbb = (): useMstRbbServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListMstRbb = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<MstRbbResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/MstRbb/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<MstRbbResponse[] | null>
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
        const errorResponse = handleAxiosError(err as AxiosError<any>);
        setError(
          err.response?.data?.message || "Error fetching Master RBB list."
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

  const GetDetailMstRbb = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<MstRbbResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/MstRbb/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<MstRbbResponse | null>
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
        const errorResponse = handleAxiosError(err as AxiosError<any>);
        setError(
          err.response?.data?.message || "Error fetching Master RBB detail."
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

  const RegisterMstRbb = async (
    payload: MstRbbInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/MstRbb/register";
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
        const errorResponse = handleAxiosError(err as AxiosError<any>);
        setError(
          err.response?.data?.message || "Error registering Master RBB target."
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

  const UpdateMstRbb = async (
    payload: MstRbbUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/MstRbb/update";
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
        const errorResponse = handleAxiosError(err as AxiosError<any>);
        setError(
          err.response?.data?.message || "Error updating Master RBB target."
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
    ListMstRbb,
    GetDetailMstRbb,
    RegisterMstRbb,
    UpdateMstRbb,
    isLoading,
    error,
  };
};

export default useMstRbb;
