import axios from "axios";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { PaggingListPayload } from "../types/masterTypes";

export interface MstAppsCriteriaCategoryResponse {
  id: string;
  crtCategoryCode: string;
  crtCategoryName: string;
  crtCategoryDesc: string | null;
  valueOperator: string;
  valueTracehold: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface MstAppsCriteriaCategoryInsertRequest {
  crtCategoryName: string;
  crtCategoryDesc?: string;
  valueOperator: string;
  valueTracehold: number;
}

export interface MstAppsCriteriaCategoryUpdateRequest {
  id: string;
  crtCategoryName: string;
  crtCategoryDesc?: string;
  valueOperator: string;
  valueTracehold: number;
}

const useMstAppsCriteriaCategory = () => {
  const base = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) + "/v1/MstAppsCriteriaCategory";

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

  const Insert = async (payload: MstAppsCriteriaCategoryInsertRequest, token: string) => {
    try {
      const response = await axios.post(`${base}/insert`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) { return handleError(error); }
  };

  const Update = async (payload: MstAppsCriteriaCategoryUpdateRequest, token: string) => {
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

  return { List, GetById, Insert, Update, Delete };
};

export default useMstAppsCriteriaCategory;
