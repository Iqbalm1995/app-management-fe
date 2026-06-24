import axios from "axios";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { PaggingListPayload } from "../types/masterTypes";

export interface MstAppsCriteriaValueResponse {
  id: string;
  criteriaId: string;
  scaleValue: number;
  scaleLabel: string;
  scaleDesc: string | null;
}

export interface MstAppsCriteriaResponse {
  id: string;
  criteriaCode: string;
  criteriaName: string;
  criteriaDesc: string | null;
  criteriaPos: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  values: MstAppsCriteriaValueResponse[];
}

export interface MstAppsCriteriaValueInputRequest {
  scaleValue: number;
  scaleLabel: string;
  scaleDesc?: string;
}

export interface MstAppsCriteriaInsertRequest {
  criteriaName: string;
  criteriaDesc?: string;
  criteriaPos: number;
  values: MstAppsCriteriaValueInputRequest[];
}

export interface MstAppsCriteriaUpdateRequest {
  id: string;
  criteriaName: string;
  criteriaDesc?: string;
  criteriaPos: number;
}

export interface MstAppsCriteriaValueInsertRequest {
  criteriaId: string;
  scaleValue: number;
  scaleLabel: string;
  scaleDesc?: string;
}

export interface MstAppsCriteriaValueUpdateRequest {
  id: string;
  scaleValue: number;
  scaleLabel: string;
  scaleDesc?: string;
}

const useMstAppsCriteria = () => {
  const base = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) + "/v1/MstAppsCriteria";

  const handleError = (error: any) => {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Network error occurred" };
  };

  const List = async (payload: PaggingListPayload, token: string) => {
    try {
      const response = await axios.post(`${base}/list`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const GetById = async (id: string, token: string) => {
    try {
      const response = await axios.get(`${base}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const Insert = async (payload: MstAppsCriteriaInsertRequest, token: string) => {
    try {
      const response = await axios.post(`${base}/insert`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const Update = async (payload: MstAppsCriteriaUpdateRequest, token: string) => {
    try {
      const response = await axios.post(`${base}/update`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const Delete = async (id: string, token: string) => {
    try {
      const response = await axios.delete(`${base}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const InsertValue = async (payload: MstAppsCriteriaValueInsertRequest, token: string) => {
    try {
      const response = await axios.post(`${base}/values/insert`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const UpdateValue = async (payload: MstAppsCriteriaValueUpdateRequest, token: string) => {
    try {
      const response = await axios.post(`${base}/values/update`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const DeleteValue = async (id: string, token: string) => {
    try {
      const response = await axios.delete(`${base}/values/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  return { List, GetById, Insert, Update, Delete, InsertValue, UpdateValue, DeleteValue };
};

export default useMstAppsCriteria;
