"use client";

import { useState } from "react";
import {
  ApiGenericResponse,
  PaggingListPayload,
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

// ─── Request Interfaces ──────────────────────────────────────────────────────

export interface VendorTdrInsertPayload {
  trdNumber: string;
  tdrType: string;
  npwpNumber: string;
  yearRegistered: string;
  businessType: string;
  businessSectorCode: string;
  businessSectorName: string;
  subBusinessSector?: string | null;
  qualifications?: string | null;
  timeInEffect: string;
  expiredAt: string;
}

export interface VendorInsertPayload {
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  city: string;
  country: string;
  postalCode?: string | null;
  website?: string | null;
  picBusinessName: string;
  picBusinessEmail: string;
  picBusinessNumberHotline?: string | null;
  picTechnicalName: string;
  picTechnicalEmail: string;
  picTechnicalNumberHotline?: string | null;
  status: string;
  reasonStatus?: string | null;
  depedencyLevel: string;
  businessImpact: string;
  tdr: VendorTdrInsertPayload[];
}

export interface VendorUpdatePayload {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  city: string;
  country: string;
  postalCode?: string | null;
  website?: string | null;
  picBusinessName: string;
  picBusinessEmail: string;
  picBusinessNumberHotline?: string | null;
  picTechnicalName: string;
  picTechnicalEmail: string;
  picTechnicalNumberHotline?: string | null;
  status: string;
  reasonStatus?: string | null;
  depedencyLevel: string;
  businessImpact: string;
}

// ─── Response Interfaces ────────────────────────────────────────────────────

export interface VendorMediaResponse {
  relId: string;
  mediaId: string;
  objectCode: string;
  objectName: string;
  objectRawName: string;
  objectData: string;
  objectExtension?: string | null;
  objectSize?: number | null;
  createdAt: string;
}

export interface ContractItemResponse {
  id: string;
  venContractId: string;
  itemCode?: string | null;
  itemName: string;
  itemDesc?: string | null;
  itemType: string;
  brand?: string | null;
  itemValues: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ContractTopResponse {
  id: string;
  venContractId: string;
  stepOrder: number;
  topValues: number;
  topDate?: string | null;
  topDescriptions?: string | null;
  topStatus?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  mediaList: VendorMediaResponse[];
}

export interface VendorContractResponse {
  id: string;
  vendorId: string;
  corpNumber: string;
  corpName: string;
  contractNumber: string;
  contractDate: string;
  workValue: number;
  note?: string | null;
  contractStartDate: string;
  contractEndDate: string;
  worksStartDate?: string | null;
  worksEndDate?: string | null;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceStartDate?: string | null;
  maintenanceEndDate?: string | null;
  othersTimeline?: string | null;
  termOfPayment?: string | null;
  performanceGuaranteeStartDate: string;
  performanceGuaranteeEndDate: string;
  performanceGuaranteeValues: number;
  maintenanceWarrantyStartDate: string;
  maintenanceWarrantyEndDate: string;
  maintenanceWarrantyValues: number;
  cavexValues: number;
  capexPercentage: number;
  ovexValues: number;
  ovexPercentage: number;
  status: string;
  vendorCode?: string | null;
  vendorName?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  items: ContractItemResponse[];
  topList: ContractTopResponse[];
  mediaList: VendorMediaResponse[];
  historyList?: VendorContractHistoryResponse[];
  vendor?: VendorResponse | null;
}

export interface ContractTopHistoryResponse {
  id: string;
  venContractParentId?: string | null;
  venContractId?: string | null;
  venContractHistoryId?: string | null;
  stepOrder?: number | null;
  topValues?: number | null;
  topDate?: string | null;
  topDescriptions?: string | null;
  topStatus?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface VendorContractHistoryResponse {
  id: string;
  venContractParentId: string;
  vendorId: string;
  corpNumber: string;
  corpName: string;
  contractNumber: string;
  contractDate: string;
  workValue: number;
  note?: string | null;
  contractStartDate: string;
  contractEndDate: string;
  worksStartDate?: string | null;
  worksEndDate?: string | null;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceStartDate?: string | null;
  maintenanceEndDate?: string | null;
  othersTimeline?: string | null;
  termOfPayment?: string | null;
  performanceGuaranteeStartDate: string;
  performanceGuaranteeEndDate: string;
  performanceGuaranteeValues: number;
  maintenanceWarrantyStartDate: string;
  maintenanceWarrantyEndDate: string;
  maintenanceWarrantyValues: number;
  cavexValues: number;
  capexPercentage: number;
  ovexValues: number;
  ovexPercentage: number;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  topHistoryList?: ContractTopHistoryResponse[];
}

export interface VendorTdrResponse {
  id: string;
  vendorId: string;
  trdNumber: string;
  tdrType: string;
  npwpNumber: string;
  yearRegistered: string;
  businessType: string;
  businessSectorCode: string;
  businessSectorName: string;
  subBusinessSector?: string | null;
  qualifications?: string | null;
  timeInEffect: string;
  expiredAt: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  mediaList: VendorMediaResponse[];
}

export interface VendorResponse {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  city: string;
  country: string;
  postalCode?: string | null;
  vendorLogo?: string | null;
  website?: string | null;
  picBusinessName: string;
  picBusinessEmail: string;
  picBusinessNumberHotline?: string | null;
  picTechnicalName: string;
  picTechnicalEmail: string;
  picTechnicalNumberHotline?: string | null;
  status: string;
  reasonStatus?: string | null;
  depedencyLevel: string;
  businessImpact: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  tdrList: VendorTdrResponse[];
  contractList: VendorContractResponse[];
}

export interface ContractItemInsertPayload {
  itemCode?: string;
  itemName: string;
  itemDesc?: string;
  itemType: string;
  brand?: string;
  itemValues: number;
}

export interface ContractTopInsertPayload {
  stepOrder: number;
  topValues: number;
  topDate?: string;
  topDescriptions?: string;
  topStatus?: string;
}

export interface VendorContractInsertPayload {
  id?: string;
  vendorId: string;
  corpNumber: string;
  corpName: string;
  contractNumber: string;
  contractDate: string;
  workValue: number;
  note?: string;
  contractStartDate: string;
  contractEndDate: string;
  worksStartDate?: string;
  worksEndDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  maintenanceStartDate?: string;
  maintenanceEndDate?: string;
  othersTimeline?: string;
  termOfPayment?: string;
  performanceGuaranteeStartDate?: string;
  performanceGuaranteeEndDate?: string;
  performanceGuaranteeValues?: number;
  maintenanceWarrantyStartDate?: string;
  maintenanceWarrantyEndDate?: string;
  maintenanceWarrantyValues?: number;
  cavexValues?: number;
  capexPercentage?: number;
  ovexValues?: number;
  ovexPercentage?: number;
  status?: string;
  items?: ContractItemInsertPayload[];
  topList?: ContractTopInsertPayload[];
}

// ─── Service Interface ───────────────────────────────────────────────────────

interface useVendorServices {
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<VendorResponse[] | null> | null>;
  GetDetailById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<VendorResponse | null> | null>;
  Register: (
    payload: VendorInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  Update: (
    payload: VendorUpdatePayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  ListTdr: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<VendorTdrResponse[] | null> | null>;
  ListContract: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<VendorContractResponse[] | null> | null>;
  InsertContract: (
    payload: VendorContractInsertPayload,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  GetContractDetail: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<VendorContractResponse | null> | null>;
  InsertTdr: (
    formData: FormData,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  UpdateTdr: (
    formData: FormData,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  DeleteTdrMedia: (
    relId: string,
    token: string
  ) => Promise<ApiGenericResponse<string | null> | null>;
  isLoading: boolean;
  error: string | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const useVendor = (): useVendorServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<VendorResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/Vendor/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<VendorResponse[]>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "An error occurred during request.");
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
  ): Promise<ApiGenericResponse<VendorResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/Vendor/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<VendorResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "An error occurred during request.");
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

  const Register = async (
    payload: VendorInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint: string = "/v1/Vendor/register";
    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "An error occurred during request.");
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connect to api", error: null };
      }
    }
  };

  const Update = async (
    payload: VendorUpdatePayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    const PathEndpoint: string = "/v1/Vendor/update";
    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}${PathEndpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(err.response?.data?.message || "An error occurred during request.");
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connect to api", error: null };
      }
    }
  };

  const ListTdr = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<VendorTdrResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.post<ApiGenericResponse<VendorTdrResponse[]>>(
        `${UrlEndpoint}/v1/Vendor/tdr/list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error", error: null };
    }
  };

  const InsertTdr = async (
    formData: FormData,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}/v1/Vendor/tdr/insert`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connect to api", error: null };
    }
  };

  const UpdateTdr = async (
    formData: FormData,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.put<ApiGenericResponse<string>>(
        `${UrlEndpoint}/v1/Vendor/tdr/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error connect to api", error: null };
    }
  };

  const DeleteTdrMedia = async (
    relId: string,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.delete<ApiGenericResponse<string>>(
        `${UrlEndpoint}/v1/Vendor/tdr/media/delete/${relId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error", error: null };
    }
  };

  const ListContract = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<VendorContractResponse[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.post<ApiGenericResponse<VendorContractResponse[]>>(
        `${UrlEndpoint}/v1/Vendor/contract/list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error", error: null };
    }
  };

  const InsertContract = async (
    payload: VendorContractInsertPayload,
    token: string
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.post<ApiGenericResponse<string>>(
        `${UrlEndpoint}/v1/Vendor/contract/insert`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error", error: null };
    }
  };

  const GetContractDetail = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<VendorContractResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);
    try {
      const response = await axiosInstance.get<ApiGenericResponse<VendorContractResponse>>(
        `${UrlEndpoint}/v1/Vendor/contract/detail/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
        return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: err.response?.data?.message || "Error", error: null };
      }
      setError("An unknown error occurred.");
      return { statusCode: RES_CODE_SERVER_ERROR, data: null, message: "Error", error: null };
    }
  };

  return {
    List,
    ListTdr,
    ListContract,
    InsertContract,
    GetContractDetail,
    GetDetailById,
    Register,
    Update,
    InsertTdr,
    UpdateTdr,
    DeleteTdrMedia,
    isLoading,
    error,
  };
};

export default useVendor;
