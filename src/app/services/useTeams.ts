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

export interface TeamsResponse {
  id: string;
  teamCode: string;
  teamName: string;
  teamDesc?: string | null;
  isActive: string;
  teamPict?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  orgGroupId: string;
  orgGroupCode: string;
  directorate: TeamOrganization;
  division: TeamOrganization;
  group: TeamOrganization;
}

export interface TeamsShortResponse {
  id: string;
  teamCode: string;
  teamName: string;
  teamPict?: string | null;
  orgGroupId: string;
  orgGroupCode: string;
}

export interface TeamOrganization {
  id: string;
  orgType: string;
  orgCode: string;
  orgName: string;
}

export interface TeamInsertPayload {
  teamCode: string;
  teamName: string;
  teamDesc: string | null;
  isActive: string;
  uploadPict: File | null;
  orgGroupId: string;
  orgGroupCode: string;
}

export interface TeamUpdatePayload {
  id: string;
  teamName: string;
  teamDesc: string | null;
  isActive: string;
  uploadPict: File | null;
  deletePict: boolean;
  orgGroupId: string;
  orgGroupCode: string;
}

export interface TeamMemberPayload {
  userId: string;
  teamId: string;
  teamRoleId: string;
}

////////////////////////////////////////////////////////////

export interface TeamsRoleMember {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface TeamsUserRole {
  id: string;
  teamRoleCode: string;
  teamRoleName: string;
}

export interface TeamsUserMember {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: TeamsRoleMember | null;
  teamRole: TeamsUserRole | null;
}

export interface TeamUpdatePayload {
  id: string;
  teamName: string;
  teamDesc: string | null;
  isActive: string;
  uploadPict: File | null;
  deletePict: boolean;
}

export interface TeamsUserRoleShort {
  id: string;
  teamCode: string;
  teamName: string;
}

export interface TeamsUserMemberResponse {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  userEmail: string | null;
  userPhoneNumber: string | null;
  team: TeamsUserRoleShort;
  role: TeamsRoleMember;
  teamRole: TeamsUserRole | null;
}

export interface TeamRoleFullResponse {
  id: string;
  teamRoleCode: string;
  teamRoleName: string;
  teamId: string;
  teamCode: string;
  teamName: string;
}

export interface TeamRoleInsertPayload {
  teamId: string;
  teamRoleCode: string;
  teamRoleName: string;
}

export interface TeamRoleUpdatePayload {
  id: string;
  teamRoleName: string;
}

export interface TeamMemberPayload {
  userId: string;
  teamId: string;
  teamRoleId: string;
}

interface useTeamsServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<TeamsResponse[] | null> | null>;
  GetDetailById: (
    teamId: string,
    token: string
  ) => Promise<ApiGenericResponse<TeamsResponse | null> | null>;
  GetDetailByCode: (
    teamCode: string,
    token: string
  ) => Promise<ApiGenericResponse<TeamsResponse | null> | null>;
  InsertTeams: (
    payload: TeamInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTeams: (
    payload: TeamUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  ListMembers: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse[] | null> | null>;
  InsertTeamMember: (
    payload: TeamMemberPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTeamMember: (
    payload: TeamMemberPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RemoveTeamMember: (
    payload: TeamMemberPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useTeams = (): useTeamsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<TeamsResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TeamsResponse[]>
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
  ): Promise<ApiGenericResponse<TeamsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Teams/${teamId}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TeamsResponse>
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

  const GetDetailByCode = async (
    teamCode: string,
    token: string
  ): Promise<ApiGenericResponse<TeamsResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Teams/GetByCode/${teamCode}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TeamsResponse>
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

  const InsertTeams = async (
    payload: TeamInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/insert";

    // Create FormData and append payload fields

    const formData = new FormData();
    formData.append("TeamCode", payload.teamCode);
    formData.append("TeamName", payload.teamName);
    // Only append if TeamDesc is not null or undefined
    if (payload.teamDesc !== null && payload.teamDesc !== undefined) {
      formData.append("TeamDesc", payload.teamDesc);
    } else {
      formData.append("TeamDesc", "");
    }
    formData.append("IsActive", payload.isActive);
    // Only append if uploadPict is not null
    if (payload.uploadPict !== null && payload.uploadPict !== undefined) {
      formData.append("uploadPict", payload.uploadPict);
    }

    formData.append("orgGroupId", payload.orgGroupId);
    formData.append("orgGroupCode", payload.orgGroupCode);

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

  const UpdateTeams = async (
    payload: TeamUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/update";

    // Create FormData and append payload fields

    const formData = new FormData();
    formData.append("Id", payload.id);
    formData.append("TeamName", payload.teamName);
    // Only append if TeamDesc is not null or undefined
    if (payload.teamDesc !== null && payload.teamDesc !== undefined) {
      formData.append("TeamDesc", payload.teamDesc);
    } else {
      formData.append("TeamDesc", "");
    }
    formData.append("IsActive", payload.isActive);
    // Only append if uploadPict is not null
    if (payload.uploadPict !== null && payload.uploadPict !== undefined) {
      formData.append("uploadPict", payload.uploadPict);
    }
    // Boolean field handling - convert to string
    formData.append("deletePict", payload.deletePict.toString());

    formData.append("orgGroupId", payload.orgGroupId);
    formData.append("orgGroupCode", payload.orgGroupCode);

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

  const ListMembers = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<UsersResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/member/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<UsersResponse[]>
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

  const InsertTeamMember = async (
    payload: TeamMemberPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/member/insert";

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

  const UpdateTeamMember = async (
    payload: TeamMemberPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Teams/member/update";

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

  const RemoveTeamMember = async (
    payload: TeamMemberPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Teams/member/delete`;

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

  return {
    List,
    GetDetailById,
    GetDetailByCode,
    InsertTeams,
    UpdateTeams,
    ListMembers,
    InsertTeamMember,
    UpdateTeamMember,
    RemoveTeamMember,

    isLoading,
    error,
  };
};

export default useTeams;
