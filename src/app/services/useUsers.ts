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
import { OrganizationShortResponse } from "./useOrganization";
import { TeamsShortResponse } from "./useTeams";

export interface UsersResponse {
  id: string;
  nrp: string;
  nama: string;
  nip: string;
  userId: string;
  kodeCabang?: string | null;
  namaCabang?: string | null;
  kodeInduk?: string | null;
  namaInduk?: string | null;
  kodeKanwil?: string | null;
  namaKanwil?: string | null;
  jabatan?: string | null;
  email: string;
  idFungsi?: string | null;
  namaFungsi?: string | null;
  kodePenempatan?: string | null;
  namaPenempatan?: string | null;
  idUim?: string | null;
  costCentre?: string | null;
  isApproval?: string | null;
  kodeUnitKerja?: string | null;
  namaUnitKerja?: string | null;
  kodeJabatan?: string | null;
  phoneNumber?: string | null;
  userStatus: string;
  mainPwd?: string | null;
  isContained?: boolean;
  profilePict?: string | null;
  kodeGroupKerja?: string | null;
  namaGroupKerja?: string | null;
  lastSync?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  team: UserTeamResponse | null;
  teamRole: UserTeamRoleResponse | null;
}

export interface TableBreakdownItem {
  tableName: string;
  columnName: string;
  affectedRows: number;
  domainCategory: string;
  roleDescription: string;
}

export interface UserCascadeRenamePreviewResponse {
  oldUserId: string;
  newUserId: string;
  userFullname: string;
  totalAffectedTables: number;
  totalAffectedRows: number;
  tableBreakdown: TableBreakdownItem[];
}

export interface UserShortResponse {
  id: string;
  nrp: string;
  nama: string;
  nip: string;
  userId: string;
  email: string;
  kodeUnitKerja?: string | null;
  namaUnitKerja?: string | null;
  kodeJabatan?: string | null;
  jabatan?: string | null;
  profilePict?: string | null;
  kodeGroupKerja?: string | null;
  namaGroupKerja?: string | null;
}

export interface UsersFullResponse {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  lastLogin: string | null;
  divisionId: string | null;
  createdAt: string;
  createdBy: string;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: UserRoleResponse;
  team: UserTeamResponse | null;
  teamRole: UserTeamRoleResponse | null;
}

export interface UserRoleResponse {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface UserTeamResponse {
  id: string;
  teamCode: string;
  teamName: string;
  teamPict?: string | null;
  orgGroupId?: string | null;
  orgGroupCode?: string | null;
  organization?: TeamOrganizationHierarchy | null;
}

export interface TeamOrganizationHierarchy {
  directorate?: OrganizationShortResponse | null;
  division?: OrganizationShortResponse | null;
  group?: OrganizationShortResponse | null;
}

export interface UserTeamRoleResponse {
  id: string;
  parentId?: string | null;
  category: string;
  specCode: string;
  specName: string;
  specDesc?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
}

export interface UserOrganizationResponse {
  division: OrganizationShortResponse;
  group?: OrganizationShortResponse | null;
  team?: TeamsShortResponse | null;
}

export interface UserUpdateOrgGroupPayload {
  userSysId: string;
  orgCode: string;
}

export interface UserAdminUpdatePayload {
  id: string;
  nama: string;
  nrp?: string | null;
  nip?: string | null;
  email: string;
  phoneNumber?: string | null;
  userStatus?: string | null;
  kodeGroupKerja?: string | null;
  namaGroupKerja?: string | null;
  teamId?: string | null;
  teamRoleId?: string | null;
  jabatan?: string | null;
  kodeJabatan?: string | null;
  namaUnitKerja?: string | null;
  kodeUnitKerja?: string | null;
  costCentre?: string | null;
  isApproval?: string | null;
  kodeCabang?: string | null;
  namaCabang?: string | null;
  kodeInduk?: string | null;
  namaInduk?: string | null;
  kodeKanwil?: string | null;
  namaKanwil?: string | null;
  idFungsi?: string | null;
  namaFungsi?: string | null;
  kodePenempatan?: string | null;
  namaPenempatan?: string | null;
}

interface useUsersServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse[] | null> | null>;
  GetDetailById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse | null> | null>;
  GetDetailByUserId: (
    UserId: string,
    token: string
  ) => Promise<ApiGenericResponse<UsersResponse | null> | null>;
  GetDetailOrgById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<UserOrganizationResponse | null> | null>;
  GetDetailOrgByUserId: (
    UserId: string,
    token: string
  ) => Promise<ApiGenericResponse<UserOrganizationResponse | null> | null>;
  EditUserPassword: (
    userId: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  AdminResetPassword: (
    userId: string,
    newPassword: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateOrgUser: (
    payload: UserUpdateOrgGroupPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  AdminUpdateUser: (
    payload: UserAdminUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  EditUserStatus: (
    userId: string,
    status: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ContainUser: (
    userId: string,
    reason: string | undefined,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  RestoreUser: (
    userId: string,
    defaultPassword: string | undefined,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  SoftDeleteUser: (
    userId: string,
    reason: string | undefined,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  PreviewCascadeRenameUser: (
    payload: { oldUserId: string; newUserId: string },
    token: string
  ) => Promise<ApiGenericResponse<UserCascadeRenamePreviewResponse | null> | null>;
  ExecuteCascadeRenameUser: (
    payload: {
      oldUserId: string;
      newUserId: string;
      reason?: string;
      cascadeAuditFields?: boolean;
    },
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

const useUsers = (): useUsersServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<UsersResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/list`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
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
  ): Promise<ApiGenericResponse<UsersResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/Users/integrated/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
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

  const GetDetailByUserId = async (
    UserId: string,
    token: string
  ): Promise<ApiGenericResponse<UsersResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/Users/integrated/user-id/${UserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
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

  const GetDetailOrgById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<UserOrganizationResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/Users/detail-organization/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
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

  const GetDetailOrgByUserId = async (
    UserId: string,
    token: string
  ): Promise<ApiGenericResponse<UserOrganizationResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.get(
        `${UrlEndpoint}/v1/Users/integrated/organization/user-id/${UserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
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

  const EditUserPassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.put(
        `${UrlEndpoint}/v1/Authenticate/change-password`,
        {
          userId: userId,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during password change."
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

  const UpdateOrgUser = async (
    payload: UserUpdateOrgGroupPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Users/integrated/edit-user-group-code`;
    try {
      const response = await axiosInstance.put<
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

  const AdminResetPassword = async (
    userId: string,
    newPassword: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.put(
        `${UrlEndpoint}/v1/Authenticate/admin-reset-password`,
        {
          userId: userId,
          newPassword: newPassword,
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during password reset."
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

  const AdminUpdateUser = async (
    payload: UserAdminUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/admin-update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during updating user profile."
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

  const EditUserStatus = async (
    userId: string,
    status: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.put(
        `${UrlEndpoint}/v1/Users/integrated/edit-status`,
        {
          userId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during updating user status."
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

  const ContainUser = async (
    userId: string,
    reason: string | undefined,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/contain-user`,
        {
          userId,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during containing user account."
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

  const RestoreUser = async (
    userId: string,
    defaultPassword: string | undefined,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/restore-user`,
        {
          userId,
          defaultPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during restoring user account."
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

  const SoftDeleteUser = async (
    userId: string,
    reason: string | undefined,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/soft-delete`,
        {
          userId,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred during soft deleting user."
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

  const PreviewCascadeRenameUser = async (
    payload: { oldUserId: string; newUserId: string },
    token: string
  ): Promise<ApiGenericResponse<UserCascadeRenamePreviewResponse | null> | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/cascade-rename/preview`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "Gagal melakukan preview migrasi cascade USER_ID."
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

  const ExecuteCascadeRenameUser = async (
    payload: {
      oldUserId: string;
      newUserId: string;
      reason?: string;
      cascadeAuditFields?: boolean;
    },
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Users/integrated/cascade-rename/execute`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "Gagal mengeksekusi migrasi cascade USER_ID."
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
    GetDetailByUserId,
    GetDetailOrgById,
    GetDetailOrgByUserId,
    EditUserPassword,
    AdminResetPassword,
    UpdateOrgUser,
    AdminUpdateUser,
    EditUserStatus,
    ContainUser,
    RestoreUser,
    SoftDeleteUser,
    PreviewCascadeRenameUser,
    ExecuteCascadeRenameUser,
    isLoading,
    error,
  };
};

export default useUsers;
