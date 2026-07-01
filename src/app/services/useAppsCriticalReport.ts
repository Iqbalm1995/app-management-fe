import axios from "axios";
import { ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC } from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { PaggingListPayload } from "../types/masterTypes";

export interface AppsCriticalReportBatchSummary {
  batchCode: string;
  quartalReport: string;
  yearReport: string;
  timeReport: string;
  statusReport: string;
  versionNote: string;
  assessmentCount: number;
}

export interface AppsCriticalReportDetailItem {
  id: string;
  appsCriteriaId: string | null;
  appsCriteriaCode: string | null;
  appsCriteriaName: string;
  appsCriteriaDesc: string | null;
  appsCriteriaPos: number;
  appsCriteriaValuesId: string | null;
  appsCriteriaScaleValue: number | null;
  appsCriteriaScaleDesc: string | null;
}

export interface AppsCriticalReportAssessmentViewModel {
  id: string;
  batchCode: string;
  quartalReport: string;
  yearReport: string;
  timeReport: string;
  statusReport: string;
  versionNote: string;
  parentRefId: string | null;
  appId: string;
  appCode: string;
  appShortName: string;
  appName: string | null;
  appManageByGroupId: string | null;
  appManageByGroupCode: string | null;
  appManageByGroupName: string | null;
  isRelationWithCustomers: string;
  isTransactionalApp: string;
  isStrictCutoffTime: string;
  isOnDevelopment: string;
  isSkipReview: string;
  totalIsAdditionalFlag: number;
  countTrueIsAdditionalFlag: number;
  weightTrueIsAdditionalFlag: number;
  crtAssessmentScore: number;
  crtAssessmentAverageScore: number;
  crtAssessmentFinalScore: number;
  appCrtCategoryId: string | null;
  appCrtCategoryCode: string | null;
  appCrtCategoryName: string | null;
  appCrtCategoryValueOperator: string | null;
  appCrtCategoryValueTracehold: number;
  appsRtoSuggestionOperator: string | null;
  appsRtoSuggestionMinutes: number | null;
  appsRtoItOperator: string | null;
  appsRtoItMinutes: number | null;
  appsRpoOperator: string | null;
  appsRpoMinutes: number | null;
  isFullyReviewed: boolean;
  filledCount: number;
  totalCount: number;
  details: AppsCriticalReportDetailItem[];
}

export interface AppsCriticalReportBatchDetailViewModel {
  batchCode: string;
  quartalReport: string;
  yearReport: string;
  timeReport: string;
  statusReport: string;
  assessments: AppsCriticalReportAssessmentViewModel[];
}

export interface AppsCriticalReportGenerateResponse {
  batchCode: string;
  assessmentCount: number;
  detailCount: number;
}

export interface UpdateAssessmentRequest {
  id: string;
  isRelationWithCustomers: string;
  isTransactionalApp: string;
  isStrictCutoffTime: string;
  isRelationWithGov: string;
  isOnDevelopment: string;
  isSkipReview: string;
  appCrtCategoryId: string | null;
  appCrtCategoryCode: string | null;
  appCrtCategoryName: string | null;
  appCrtCategoryDesc: string | null;
  appCrtCategoryValueOperator: string | null;
  appCrtCategoryValueTracehold: number;
  appsRtoSuggestionOperator: string | null;
  appsRtoSuggestionMinutes: number | null;
  appsRtoItOperator: string | null;
  appsRtoItMinutes: number | null;
  appsRpoOperator: string | null;
  appsRpoMinutes: number | null;
}

export interface UpdateAssessmentDetailRequest {
  id: string;
  appsCriteriaValuesId: string | null;
  appsCriteriaScaleValue: number | null;
  appsCriteriaScaleDesc: string | null;
}

export interface ApproveAssessmentRequest {
  id: string;
  isApproved: boolean;
  note?: string;
}

export interface ApproveBatchRequest {
  batchCode: string;
  isApproved: boolean;
  note?: string;
}

export interface AppsCriticalReportPendingListRequest {
  status: string;
  search?: string;
  page: number;
  limit: number;
}

const useAppsCriticalReport = () => {
  const base = buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) + "/v1/AppsCriticalReport";

  const handleError = (error: any) => {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Network error occurred" };
  };

  const Generate = async (token: string) => {
    try {
      const res = await axios.post(`${base}/generate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const List = async (payload: PaggingListPayload, token: string) => {
    try {
      const res = await axios.post(`${base}/list`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const GetBatchDetail = async (batchCode: string, token: string) => {
    try {
      const res = await axios.get(`${base}/batch/${batchCode}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const GetAssessmentDetail = async (id: string, token: string) => {
    try {
      const res = await axios.get(`${base}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const UpdateAssessment = async (payload: UpdateAssessmentRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/update-assessment`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const UpdateAssessmentDetail = async (payload: UpdateAssessmentDetailRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/update-detail`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const SubmitForApproval = async (id: string, token: string) => {
    try {
      const res = await axios.post(`${base}/submit-approval/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const SubmitBatchForApproval = async (batchCode: string, token: string) => {
    try {
      const res = await axios.post(`${base}/submit-batch-approval/${batchCode}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const SyncBatchStatus = async (batchCode: string, token: string) => {
    try {
      const res = await axios.post(`${base}/sync-batch-status/${batchCode}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const ListByStatus = async (payload: AppsCriticalReportPendingListRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/list-by-status`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const CanApproveAssessment = async (id: string, token: string) => {
    try {
      const res = await axios.get(`${base}/${id}/can-approve`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const ApproveAssessment = async (payload: ApproveAssessmentRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/approve`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const ApproveBatch = async (payload: ApproveBatchRequest, token: string) => {
    try {
      const res = await axios.post(`${base}/approve-batch`, payload, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const ResubmitAssessment = async (id: string, token: string) => {
    try {
      const res = await axios.post(`${base}/resubmit/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  const ReviseBatch = async (batchCode: string, token: string) => {
    try {
      const res = await axios.post(`${base}/revise-batch/${batchCode}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e: any) { return handleError(e); }
  };

  return { Generate, List, GetBatchDetail, GetAssessmentDetail, UpdateAssessment, UpdateAssessmentDetail, SubmitForApproval, SubmitBatchForApproval, SyncBatchStatus, ListByStatus, CanApproveAssessment, ApproveAssessment, ApproveBatch, ResubmitAssessment, ReviseBatch };
};

export default useAppsCriticalReport;
