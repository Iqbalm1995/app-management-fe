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
  topDate: string;
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
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  items: ContractItemResponse[];
  topList: ContractTopResponse[];
  mediaList: VendorMediaResponse[];
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

  return {
    List,
    GetDetailById,
    Register,
    isLoading,
    error,
  };
};

export default useVendor;
