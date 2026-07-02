import axios from "axios";
import { ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC } from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { PaggingListPayload } from "../types/masterTypes";

export interface AppsCriticalReportingDocumentResponse {
  id: string;
  reportPeriodId: string;
  posOrder: number;
  reportName: string;
  reportDesc: string | null;
  reportNumber: string | null;
  reportUploadDate: string;
  reportVersion: string;
  linkAttachment: string | null;
  mediaObjectId: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  createdBy: string;
}

export interface AppsCriticalReportingPeriodResponse {
  id: string;
  reportTime: string;
  reportQuartal: string;
  reportYear: string;
  note: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  documentCount: number;
}

export interface AppsCriticalReportingPeriodDetailResponse extends AppsCriticalReportingPeriodResponse {
  documents: AppsCriticalReportingDocumentResponse[];
}

export interface AppsCriticalReportingInsertRequest {
  reportQuartal: string;
  reportYear: string;
  note?: string;
}

export interface AppsCriticalReportingUpdateRequest {
  id: string;
  note?: string;
}

export interface AppsCriticalReportingDocumentUpdateRequest {
  id: string;
  reportName: string;
  reportDesc?: string;
  reportNumber?: string;
  reportVersion: string;
  reportUploadDate: string;
  linkAttachment?: string;
}

const useAppsCriticalReporting = () => {
  const base = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) + "/v1/AppsCriticalReporting";

  const handleError = (error: any) => {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Network error occurred" };
  };

  const List = async (payload: PaggingListPayload, token: string) => {
    try {
      const res = await axios.post(`${base}/list`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const GetDetail = async (id: string, token: string) => {
    try {
      const res = await axios.get(`${base}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const Insert = async (payload: AppsCriticalReportingInsertRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/insert`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const Update = async (payload: AppsCriticalReportingUpdateRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/update`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const Delete = async (id: string, token: string) => {
    try {
      const res = await axios.delete(`${base}/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const UploadDocument = async (formData: FormData, token: string) => {
    try {
      const res = await axios.post(`${base}/document/upload`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const UpdateDocument = async (payload: AppsCriticalReportingDocumentUpdateRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/document/update`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const DeleteDocument = async (id: string, token: string) => {
    try {
      const res = await axios.delete(`${base}/document/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  return { List, GetDetail, Insert, Update, Delete, UploadDocument, UpdateDocument, DeleteDocument };
};

export default useAppsCriticalReporting;
