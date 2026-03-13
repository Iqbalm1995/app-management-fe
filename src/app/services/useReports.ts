"use client";

import { useState } from "react";
import {
  ApiGenericResponse,
  PaggingListPayload,
  PaggingListPayloadCustom,
} from "../types/masterTypes";
import { buildUrlPort, localToIsoWithOffset } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
  BASE_PORT_MAIN,
  RES_CODE_OK,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";
import { UsersFullResponse, UsersResponse } from "./useUsers";
import { ApplicationMasterShortResponse } from "./useApps";
import { MediaObjectResponse } from "./useMediaObject";
import {
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
} from "./useRequirements";
import { AppsResponse, ProjectUserAssignmentResponse } from "./useProjects";

export interface UserEvaluationReportUpdatePayload {
  Id: string;
  EvBasicPoint: number;
  EvTimelessPoint: number;
  EvExtraPoint: number;
  EvTotalPoint: number;
  EvGrandTotal: number;
}

export interface RptUserEvaluationReport {
  id: string;
  timeCapture: string;
  monthPeriod: string;
  yearPeriod: string;
  quartalPeriod: string;
  userSysId: string;
  nama: string;
  nip: string;
  userId?: string | null;
  jabatan?: string | null;
  namaUnitKerja?: string | null;
  userOrgGroupCode?: string | null;
  userOrgGroupName?: string | null;
  userTeamCode?: string | null;
  userTeamName?: string | null;
  reqId?: string | null;
  requirementType?: string | null;
  reqNumber?: string | null;
  reqNarative?: string | null;
  reqAppLiveTargetDate?: string | null;
  projectId: string;
  projectNo: string;
  projectName?: string | null;
  projectRegisterDate: string;
  projectClosedDate?: string | null;
  projectCompletedDate?: string | null;
  projectType: string;
  projectCategory?: string | null;
  projectOwnerDirectorateCode?: string | null;
  projectOwnerDirectorateName?: string | null;
  projectOwnerDivisionCode?: string | null;
  projectOwnerDivisionName?: string | null;
  projectOwnerGroupCode?: string | null;
  projectOwnerGroupName?: string | null;
  projectManageByDirectorateCode?: string | null;
  projectManageByDirectorateName?: string | null;
  projectManageByDivisionCode?: string | null;
  projectManageByDivisionName?: string | null;
  projectManageByGroupCode?: string | null;
  projectManageByGroupName?: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  proSdlcStageNameActive?: string | null;
  appShortName?: string | null;
  appName?: string | null;
  userTotalTaskAssign: number;
  userTotalTaskDone: number;
  evBasicPoint: number;
  evTimelessPoint: number;
  evExtraPoint: number;
  evTotalPoint: number;
  evGrandTotal: number;
}

export interface UserEvaluationReportListResponse {
  id: string;
  timeCapture: string;
  monthPeriod: string;
  yearPeriod: string;
  quartalPeriod: string;
  userSysId: string;
  nama: string;
  nip: string;
  userId?: string | null;
  jabatan?: string | null;
  namaUnitKerja?: string | null;
  userOrgGroupCode?: string | null;
  userOrgGroupName?: string | null;
  userTeamCode?: string | null;
  userTeamName?: string | null;
  reqId?: string | null;
  requirementType?: string | null;
  reqNumber?: string | null;
  reqNarative?: string | null;
  reqAppLiveTargetDate?: string | null;
  projectId: string;
  projectNo: string;
  projectName?: string | null;
  projectRegisterDate: string;
  projectClosedDate?: string | null;
  projectCompletedDate?: string | null;
  projectType: string;
  projectCategory?: string | null;
  projectOwnerDirectorateCode?: string | null;
  projectOwnerDirectorateName?: string | null;
  projectOwnerDivisionCode?: string | null;
  projectOwnerDivisionName?: string | null;
  projectOwnerGroupCode?: string | null;
  projectOwnerGroupName?: string | null;
  projectManageByDirectorateCode?: string | null;
  projectManageByDirectorateName?: string | null;
  projectManageByDivisionCode?: string | null;
  projectManageByDivisionName?: string | null;
  projectManageByGroupCode?: string | null;
  projectManageByGroupName?: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  proSdlcStageNameActive?: string | null;
  appShortName?: string | null;
  appName?: string | null;
  userTotalTaskAssign: number;
  userTotalTaskDone: number;
  evBasicPoint: number;
  evTimelessPoint: number;
  evExtraPoint: number;
  evTotalPoint: number;
  evGrandTotal: number;
}

export interface ProjectActivePortofolioListResponse {
  id: string;
  timeCapture: string;
  monthPeriod: string;
  yearPeriod: string;
  quartalPeriod: string;
  projectId: string;
  reqNumber?: string | null;
  reqNarative?: string | null;
  reqDate?: string | null;
  reqAcceptedDate?: string | null;
  projectNo: string;
  projectName: string;
  projectRegisterDate: string;
  projectApprovedDate?: string | null;
  projectType: string;
  projectCategory?: string | null;
  projectSubCategory?: string | null;
  projectOwnerDirectorateName?: string | null;
  projectOwnerDivisionName?: string | null;
  projectOwnerGroupName?: string | null;
  projectManageByDirectorateName?: string | null;
  projectManageByDivisionName?: string | null;
  projectManageByGroupName?: string | null;
  reqUserPicName?: string | null;
  reqUserPicContanct?: string | null;
  reqUserPicEmail?: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  proSdlcStageNameActive?: string | null;
  appShortName?: string | null;
  appName?: string | null;
  proAssigns?: string | null;
  workProgramExternalCode?: string | null;
  workProgramExternalName?: string | null;
  workProgramExternalBudget?: string | null;
  workProgramInternalCode?: string | null;
  workProgramInternalName?: string | null;
  workProgramInternalBudget?: string | null;
  proSdlcStagePercentage: number;
  requirementType?: string | null;
  sdlcReportsByWeek?: Record<number, string>;
}

export interface ProjectClosePortofolioListResponse {
  id: string;
  timeCapture: string;
  monthPeriod: string;
  yearPeriod: string;
  quartalPeriod: string;
  projectId: string;
  reqNumber?: string | null;
  reqNarative?: string | null;
  reqDate?: string | null;
  reqAcceptedDate?: string | null;
  projectNo: string;
  projectName: string;
  projectRegisterDate: string;
  projectApprovedDate?: string | null;
  projectType: string;
  projectCategory?: string | null;
  projectSubCategory?: string | null;
  projectOwnerDirectorateName?: string | null;
  projectOwnerDivisionName?: string | null;
  projectOwnerGroupName?: string | null;
  projectManageByDirectorateName?: string | null;
  projectManageByDivisionName?: string | null;
  projectManageByGroupName?: string | null;
  reqUserPicName?: string | null;
  reqUserPicContanct?: string | null;
  reqUserPicEmail?: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  proSdlcStageNameActive?: string | null;
  appShortName?: string | null;
  appName?: string | null;
  proAssigns?: string | null;
  workProgramExternalCode?: string | null;
  workProgramExternalName?: string | null;
  workProgramExternalBudget?: string | null;
  workProgramInternalCode?: string | null;
  workProgramInternalName?: string | null;
  workProgramInternalBudget?: string | null;
  proSdlcStagePercentage: number;
  requirementType?: string | null;
  sdlcReportsByWeek?: Record<number, string>;
}

export interface ReportProjectPortofolioDataResponse {
  id: string;
  projectNo: string;
  projectCode: string;
  projectName: string;
  projectDesc: string;
  projectStatus: string;
  note?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  projectCategory: string;
  projectType: string;
  projectRegisterDate?: string | null;
  projectClosedDate?: string | null;
  projectDurationDays: number;
  projectStatusPercentage: number;
  proOwnerDivisionId: string;
  proOwnerDivisionCode?: string | null;
  proOwnerDivisionName?: string | null;
  proOwnerGroupId?: string | null;
  proOwnerGroupCode?: string | null;
  proOwnerGroupName?: string | null;
  proManageByDivisionId?: string | null;
  proManageByDivisionCode?: string | null;
  proManageByDivisionName?: string | null;
  proManageByGroupId?: string | null;
  proManageByGroupCode?: string | null;
  proManageByGroupName?: string | null;
  proManageByTeamId?: string | null;
  proManageByTeamCode?: string | null;
  proManageByTeamName?: string | null;
  reqParentId?: string | null;
  appsId?: string | null;
  proOwnerDirectorateId?: string | null;
  proOwnerDirectorateCode?: string | null;
  proOwnerDirectorateName?: string | null;
  proManageByDirectorateId?: string | null;
  proManageByDirectorateCode?: string | null;
  proManageByDirectorateName?: string | null;
  projectAcquisitionCode?: string | null;
  projectAcquisitionName?: string | null;
  projectCharasteristicCode?: string | null;
  projectCharasteristicName?: string | null;
  projectSubCharasteristicCode?: string | null;
  projectSubCharasteristicName?: string | null;
  projectSubCharasteristicDesc?: string | null;
  userAssignment: ProjectUserAssignmentResponse[];
  requirement?: RequirementsResponse | null;
  appsProject?: AppsResponse | null;
  workPrograms: RequirementWorkProgramDataResponse[];
}

export interface DivisionPerformanceResponse {
  userSysId: string;
  nama: string;
  nip: string;
  userId?: string | null;
  jabatan?: string | null;
  namaUnitKerja?: string | null;
  userOrgGroupCode?: string | null;
  userOrgGroupName?: string | null;
  userTeamCode?: string | null;
  userTeamName?: string | null;
  reqId?: string | null;
  requirementType?: string | null;
  reqNumber?: string | null;
  reqNarative?: string | null;
  reqAppLiveTargetDate?: string | null;
  projectId: string;
  projectNo: string;
  projectName?: string | null;
  projectRegisterDate: string;
  projectClosedDate?: string | null;
  projectCompletedDate?: string | null;
  projectType: string;
  projectCategory?: string | null;
  projectOwnerDirectorateCode?: string | null;
  projectOwnerDirectorateName?: string | null;
  projectOwnerDivisionCode?: string | null;
  projectOwnerDivisionName?: string | null;
  projectOwnerGroupCode?: string | null;
  projectOwnerGroupName?: string | null;
  projectManageByDirectorateCode?: string | null;
  projectManageByDirectorateName?: string | null;
  projectManageByDivisionCode?: string | null;
  projectManageByDivisionName?: string | null;
  projectManageByGroupCode?: string | null;
  projectManageByGroupName?: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  proSdlcStageNameActive?: string | null;
  appShortName?: string | null;
  appName?: string | null;
  userTotalTaskAssign: number;
  userTotalTaskDone: number;
  evBasicPoint: number;
  evTimelessPoint: number;
  evExtraPoint: number;
  evTotalPoint: number;
  evGrandTotal: number;
  timeCapture: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
}

export interface UserEvaluationSnapshotResponse {
  message: string;
  snapshotTime: string;
  yearPeriod: string;
  quartalPeriod: string;
  monthPeriod: string;
  recordCount: number;
  capturedBy: string;
}

interface useReportsServices {
  ListReportProjectPortofolio: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null>;
  ExportProjectPortofolioExcel: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<Blob | null>;
  ExportProjectPortofolioPDF: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<Blob | null>;
  ListProjectActivePortofolio: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<ApiGenericResponse<
    ProjectActivePortofolioListResponse[] | null
  > | null>;

  ExportProjectActivePortofolioExcel: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<Blob | null>;

  ExportProjectActivePortofolioListExcel: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<Blob | null>;

  ListProjectClosePortofolio: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<ApiGenericResponse<
    ProjectClosePortofolioListResponse[] | null
  > | null>;

  ExportProjectClosePortofolioListExcel: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<Blob | null>;

  CreateUserEvaluationSnapshot: (
    token: string,
  ) => Promise<ApiGenericResponse<UserEvaluationSnapshotResponse | null> | null>;

  ListUserEvaluationReport: (
    payload: PaggingListPayloadCustom,
    token: string,
  ) => Promise<ApiGenericResponse<
    UserEvaluationReportListResponse[] | null
  > | null>;

  UpdateUserEvaluationReport: (
    payload: UserEvaluationReportUpdatePayload,
    token: string,
  ) => Promise<ApiGenericResponse<string | null> | null>;

  GetUserEvaluationReportById: (
    id: string,
    token: string,
  ) => Promise<ApiGenericResponse<RptUserEvaluationReport | null> | null>;

  ExportUserEvaluationReportExcel: (
    data: UserEvaluationReportListResponse[],
  ) => Promise<Blob | null>;

  isLoading: boolean;
  error: string | null;
}

const useReports = (): useReportsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListReportProjectPortofolio = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = "/v1/Report/list-report-portofolio-projects";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ReportProjectPortofolioDataResponse[]>
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
          err.response?.data?.message || "An error occurred during login.",
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

  const ExportProjectPortofolioExcel = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<Blob | null> => {
    console.log("Export service called with payload:", payload);
    setIsLoading(true);
    setError(null);

    try {
      // Use existing list endpoint to get all data
      const listPayload = {
        ...payload,
        limit: -1, // Get all data
        page: 0,
      };

      const response = await ListReportProjectPortofolio(listPayload, token);

      if (response?.statusCode !== RES_CODE_OK || !response.data) {
        setError("Failed to fetch data for export");
        setIsLoading(false);
        return null;
      }

      // Import xlsx dynamically
      const XLSX = await import("xlsx");

      // Transform data for Excel export
      const excelData = response.data.map(
        (item: ReportProjectPortofolioDataResponse, index: number) => ({
          "No.": index + 1,
          "Project No": item.projectNo || "-",
          "Project Name": item.projectName || "-",
          "Project Category": item.projectCategory || "-",
          "Project Type": item.projectType || "-",
          "Project Characteristic": item.projectCharasteristicName || "-",
          "Project Sub Characteristic":
            item.projectSubCharasteristicName || "-",
          "Project Description": item.projectDesc || "-",
          "Owner Division": item.proOwnerDivisionName || "-",
          "Owner Group": item.proOwnerGroupName || "-",
          "Manage Division": item.proManageByDivisionName || "-",
          "Manage Group": item.proManageByGroupName || "-",
          "PIC Name": item.requirement?.userPicName || "-",
          "PIC Contact": item.requirement?.userPicContanct || "-",
          "PIC Email": item.requirement?.userPicEmail || "-",
          "Target Live Date": item.requirement?.appLiveTargetDate
            ? new Date(item.requirement.appLiveTargetDate).toLocaleDateString()
            : "-",
          "Project Status": item.projectStatus || "-",
          "Progress (%)": item.projectStatusPercentage || 0,
          "Duration (Days)": item.projectDurationDays || 0,
          "Register Date": item.projectRegisterDate
            ? new Date(item.projectRegisterDate).toLocaleDateString()
            : "-",
          "Closed Date": item.projectClosedDate
            ? new Date(item.projectClosedDate).toLocaleDateString()
            : "-",
          "External Programs":
            item.workPrograms
              ?.filter((wp) => wp.workProgramSource === "EXTERNAL")
              .map((wp) => `${wp.workProgramCode}: ${wp.workProgramName}`)
              .join("; ") || "-",
          "Internal Programs":
            item.workPrograms
              ?.filter((wp) => wp.workProgramSource === "INTERNAL")
              .map((wp) => `${wp.workProgramCode}: ${wp.workProgramName}`)
              .join("; ") || "-",
          "Team Members":
            item.userAssignment
              ?.map((ua) => ua.userData?.nama || ua.userId)
              .join("; ") || "-",
        }),
      );

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Project Portfolio Report");

      // Generate Excel file as blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setIsLoading(false);
      return blob;
    } catch (error) {
      console.error("Export service error:", error);
      setIsLoading(false);
      setError("Failed to export Excel file");
      return null;
    }
  };

  const ExportProjectPortofolioPDF = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<Blob | null> => {
    console.log("PDF Export service called with payload:", payload);
    setIsLoading(true);
    setError(null);

    try {
      // Use existing list endpoint to get all data
      const listPayload = {
        ...payload,
        limit: -1, // Get all data
        page: 0,
      };

      const response = await ListReportProjectPortofolio(listPayload, token);

      if (response?.statusCode !== RES_CODE_OK || !response.data) {
        setError("Failed to fetch data for export");
        setIsLoading(false);
        return null;
      }

      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("l", "mm", "a4"); // landscape orientation

      // Add title
      doc.setFontSize(16);
      doc.text("Project Portfolio Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

      // Prepare table data
      const tableData = response.data.map(
        (item: ReportProjectPortofolioDataResponse, index: number) => [
          index + 1,
          item.projectNo || "-",
          item.projectName || "-",
          item.projectCategory || "-",
          item.projectType || "-",
          // Requirement Type or Pengadaan Internal IT
          item.requirement?.requirementType ||
            (item.projectType === "PROCUREMENT"
              ? "Pengadaan Internal IT"
              : "-"),
          item.projectCharasteristicName || "-",
          item.projectSubCharasteristicName || "-",
          item.proOwnerDivisionName || "-",
          item.proOwnerGroupName || "-",
          item.proManageByDivisionName || "-",
          item.requirement?.userPicName || "-",
          item.requirement?.userPicContanct || "-",
          item.requirement?.appLiveTargetDate
            ? new Date(item.requirement.appLiveTargetDate).toLocaleDateString()
            : "-",
          item.projectStatus || "-",
          `${item.projectStatusPercentage || 0}%`,
          `${item.projectDurationDays || 0} days`,
          item.projectRegisterDate
            ? new Date(item.projectRegisterDate).toLocaleDateString()
            : "-",
          item.workPrograms?.filter((wp) => wp.workProgramSource === "EXTERNAL")
            .length || 0,
          item.workPrograms?.filter((wp) => wp.workProgramSource === "INTERNAL")
            .length || 0,
          item.userAssignment?.length || 0,
        ],
      );

      // Add table
      autoTable(doc, {
        head: [
          [
            "No.",
            "Project No",
            "Project Name",
            "Category",
            "Type",
            "Req Type",
            "Characteristic",
            "Sub Characteristic",
            "Owner Div",
            "Owner Group",
            "Manage Div",
            "PIC Name",
            "PIC Contact",
            "Target Date",
            "Status",
            "Progress",
            "Duration",
            "Register Date",
            "Ext Programs",
            "Int Programs",
            "Team Size",
          ],
        ],
        body: tableData,
        startY: 35,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 8 }, // No
          1: { cellWidth: 15 }, // Project No
          2: { cellWidth: 25 }, // Project Name
          3: { cellWidth: 12 }, // Category
          4: { cellWidth: 12 }, // Type
          5: { cellWidth: 12 }, // Req Type
          6: { cellWidth: 15 }, // Characteristic
          7: { cellWidth: 15 }, // Sub Characteristic
          8: { cellWidth: 15 }, // Owner Div
          9: { cellWidth: 12 }, // Owner Group
          10: { cellWidth: 12 }, // Manage Div
          11: { cellWidth: 15 }, // PIC Name
          12: { cellWidth: 12 }, // PIC Contact
          13: { cellWidth: 12 }, // Target Date
          14: { cellWidth: 10 }, // Status
          15: { cellWidth: 8 }, // Progress
          16: { cellWidth: 10 }, // Duration
          17: { cellWidth: 12 }, // Register Date
          18: { cellWidth: 8 }, // Ext Programs
          19: { cellWidth: 8 }, // Int Programs
          20: { cellWidth: 8 }, // Team Size
        },
      });

      // Generate PDF as blob
      const pdfBlob = doc.output("blob");

      setIsLoading(false);
      return pdfBlob;
    } catch (error) {
      console.error("PDF Export service error:", error);
      setIsLoading(false);
      setError("Failed to export PDF file");
      return null;
    }
  };

  const ListProjectActivePortofolio = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<ApiGenericResponse<
    ProjectActivePortofolioListResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = "/v1/Report/list-project-active-portfolio";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<ProjectActivePortofolioListResponse[]>
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
          err.response?.data?.message || "An error occurred during request.",
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

  const ExportProjectActivePortofolioExcel = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all data for export
      const listPayload = {
        ...payload,
        limit: -1, // Get all data
        page: 0,
      };

      const response = await ListProjectActivePortofolio(listPayload, token);

      if (response?.statusCode !== RES_CODE_OK || !response.data) {
        setError("Failed to fetch data for export");
        setIsLoading(false);
        return null;
      }

      // Import xlsx dynamically
      const XLSX = await import("xlsx");

      // Transform data for Excel export with group headers
      const excelData = response.data.map(
        (item: ProjectActivePortofolioListResponse, index: number) => ({
          "No.": index + 1,

          // Requirements Group
          "Req Number": item.reqNumber || "-",
          Narrative: item.reqNarative || "-",
          "Memo Date": item.reqDate
            ? new Date(item.reqDate).toLocaleDateString()
            : "-",
          "Memo Receive Date": item.reqAcceptedDate
            ? new Date(item.reqAcceptedDate).toLocaleDateString()
            : "-",
          "Requirement Type": item.requirementType || "-",

          // Project Group
          "Project Number": item.projectNo || "-",
          "Project Name": item.projectName || "-",
          "Project Register Date": item.projectRegisterDate
            ? new Date(item.projectRegisterDate).toLocaleDateString()
            : "-",
          "Approved Date": item.projectApprovedDate
            ? new Date(item.projectApprovedDate).toLocaleDateString()
            : "-",
          "Project Type": item.projectType || "-",
          "Project Characteristic Name": item.projectCategory || "-",
          "Project Sub Characteristic Name": item.projectSubCategory || "-",

          // Owner Group
          "Owner Directorate Name": item.projectOwnerDirectorateName || "-",
          "Owner Division Name": item.projectOwnerDivisionName || "-",
          "Owner Group Name": item.projectOwnerGroupName || "-",
          "Manage By Directorate Name":
            item.projectManageByDirectorateName || "-",
          "Manage By Division Name": item.projectManageByDivisionName || "-",
          "Manage By Group Name": item.projectManageByGroupName || "-",

          // PIC Owner Group
          "Req PIC Owner Name": item.reqUserPicName || "-",
          "Req PIC Owner Phone": item.reqUserPicContanct || "-",
          "Req PIC Owner Email": item.reqUserPicEmail || "-",

          // Proker User (External) Group
          "External Work Program Code": item.workProgramExternalCode || "-",
          "External Work Program Name": item.workProgramExternalName || "-",
          "External Work Program Budget": item.workProgramExternalBudget || "-",

          // Proker IT (Internal) Group
          "Internal Work Program Code": item.workProgramInternalCode || "-",
          "Internal Work Program Name": item.workProgramInternalName || "-",
          "Internal Work Program Budget": item.workProgramInternalBudget || "-",

          // Project Status Group
          "Project Status": item.projectStatus || "-",
          "Project Progression": `${item.projectStatusPercentage || 0}%`,

          // SDLC Status Group
          "SDLC Current Active Status": item.proSdlcStageNameActive || "-",
          "SDLC Progression": `${item.proSdlcStagePercentage || 0}%`,

          // Team Assign Group
          "Project Assign NAMA": item.proAssigns || "-",
        }),
      );

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Project Active Portfolio");

      // Generate Excel file as blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setIsLoading(false);
      return blob;
    } catch (error) {
      console.error("Export service error:", error);
      setIsLoading(false);
      setError("Failed to export Excel file");
      return null;
    }
  };

  const ExportProjectActivePortofolioListExcel = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );

    try {
      const response = await fetch(
        `${UrlEndpoint}/v1/Report/export-project-active-portfolio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        // Create Excel file using xlsx
        const XLSX = await import("xlsx");
        const workbook = XLSX.utils.book_new();

        // Transform data for Excel export with proper column structure
        const excelData = data.data.map((item: any, index: number) => {
          // Helper function to get quarter from week number
          const getQuarterFromWeek = (week: number): string => {
            if (week >= 1 && week <= 13) return 'Q1';
            if (week >= 14 && week <= 26) return 'Q2';
            if (week >= 27 && week <= 39) return 'Q3';
            if (week >= 40 && week <= 52) return 'Q4';
            return 'Q1';
          };

          // Base columns
          const baseData: any = {
            "NO.": index + 1,
            "REQ NUMBER": item.reqNumber || "",
            "NARRATIVE": item.reqNarative || "",
            "MEMO DATE": item.reqDate
              ? new Date(item.reqDate).toLocaleDateString("id-ID")
              : "",
            "MEMO RECEIVE DATE": item.reqAcceptedDate
              ? new Date(item.reqAcceptedDate).toLocaleDateString("id-ID")
              : "",
            "REQUIREMENT TYPE": item.requirementType || "",
            "PROJECT NUMBER": item.projectNo || "",
            "PROJECT NAME": item.projectName || "",
            "PROJECT REGISTER DATE": item.projectRegisterDate
              ? new Date(item.projectRegisterDate).toLocaleDateString("id-ID")
              : "",
            "APPROVED DATE": item.projectApprovedDate
              ? new Date(item.projectApprovedDate).toLocaleDateString("id-ID")
              : "",
            "PROJECT TYPE": item.projectType || "",
            "PROJECT CHARACTERISTIC NAME": item.projectCategory || "",
            "PROJECT SUB CHARACTERISTIC NAME": item.projectSubCategory || "",
            "OWNER DIRECTORATE NAME": item.projectOwnerDirectorateName || "",
            "OWNER DIVISION NAME": item.projectOwnerDivisionName || "",
            "OWNER GROUP NAME": item.projectOwnerGroupName || "",
            "MANAGE BY DIRECTORATE NAME":
              item.projectManageByDirectorateName || "",
            "MANAGE BY DIVISION NAME": item.projectManageByDivisionName || "",
            "MANAGE BY GROUP NAME": item.projectManageByGroupName || "",
            "REQ PIC OWNER NAME": item.reqUserPicName || "",
            "REQ PIC OWNER PHONE": item.reqUserPicContanct || "",
            "REQ PIC OWNER EMAIL": item.reqUserPicEmail || "",
            "EXTERNAL WORK PROGRAM CODE": item.workProgramExternalCode || "",
            "EXTERNAL WORK PROGRAM NAME": item.workProgramExternalName || "",
            "EXTERNAL WORK PROGRAM BUDGET": item.workProgramExternalBudget || "",
            "INTERNAL WORK PROGRAM CODE": item.workProgramInternalCode || "",
            "INTERNAL WORK PROGRAM NAME": item.workProgramInternalName || "",
            "INTERNAL WORK PROGRAM BUDGET": item.workProgramInternalBudget || "",
            "PROJECT STATUS": item.projectStatus || "",
            "PROJECT PROGRESSION": item.projectStatusPercentage
              ? `${item.projectStatusPercentage}%`
              : "",
            "SDLC CURRENT ACTIVE STATUS": item.proSdlcStageNameActive || "",
            "SDLC PROGRESSION": item.proSdlcStagePercentage
              ? `${item.proSdlcStagePercentage}%`
              : "",
            "PROJECT ASSIGN NAMA": item.proAssigns || "",
          };

          // Add dynamic SDLC columns (Week 1-52)
          for (let week = 1; week <= 52; week++) {
            const quarter = getQuarterFromWeek(week);
            const columnName = `${quarter} - WEEK ${week}`;
            baseData[columnName] = item.sdlcReportsByWeek?.[week] || '';
          }

          return baseData;
        });

        // Create worksheet with empty data first
        const worksheet = XLSX.utils.aoa_to_sheet([]);
        
        // Add headers manually (33 base + 52 SDLC = 85 total)
        const baseHeaders = [
          'NO.', 'REQ NUMBER', 'NARRATIVE', 'MEMO DATE', 'MEMO RECEIVE DATE', 'REQUIREMENT TYPE',
          'PROJECT NUMBER', 'PROJECT NAME', 'PROJECT REGISTER DATE', 'APPROVED DATE', 'PROJECT TYPE', 
          'PROJECT CHARACTERISTIC NAME', 'PROJECT SUB CHARACTERISTIC NAME',
          'OWNER DIRECTORATE NAME', 'OWNER DIVISION NAME', 'OWNER GROUP NAME',
          'MANAGE BY DIRECTORATE NAME', 'MANAGE BY DIVISION NAME', 'MANAGE BY GROUP NAME',
          'REQ PIC OWNER NAME', 'REQ PIC OWNER PHONE', 'REQ PIC OWNER EMAIL',
          'EXTERNAL WORK PROGRAM CODE', 'EXTERNAL WORK PROGRAM NAME', 'EXTERNAL WORK PROGRAM BUDGET',
          'INTERNAL WORK PROGRAM CODE', 'INTERNAL WORK PROGRAM NAME', 'INTERNAL WORK PROGRAM BUDGET',
          'PROJECT STATUS', 'PROJECT PROGRESSION', 'SDLC CURRENT ACTIVE STATUS', 'SDLC PROGRESSION',
          'PROJECT ASSIGN NAMA'
        ];
        
        // Add SDLC week headers (52 columns)
        const sdlcHeaders = Array.from({length: 52}, (_, i) => {
          const week = i + 1;
          const quarter = week >= 1 && week <= 13 ? 'Q1' : 
                         week >= 14 && week <= 26 ? 'Q2' : 
                         week >= 27 && week <= 39 ? 'Q3' : 'Q4';
          return `${quarter} - WEEK ${week}`;
        });
        
        const headers = [...baseHeaders, ...sdlcHeaders];
        
        // Add header row
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
        
        // Add data rows
        const dataRows = excelData.map((item: any) => [
          item['NO.'], item['REQ NUMBER'], item['NARRATIVE'], item['MEMO DATE'], item['MEMO RECEIVE DATE'], item['REQUIREMENT TYPE'],
          item['PROJECT NUMBER'], item['PROJECT NAME'], item['PROJECT REGISTER DATE'], item['APPROVED DATE'], item['PROJECT TYPE'],
          item['PROJECT CHARACTERISTIC NAME'], item['PROJECT SUB CHARACTERISTIC NAME'],
          item['OWNER DIRECTORATE NAME'], item['OWNER DIVISION NAME'], item['OWNER GROUP NAME'],
          item['MANAGE BY DIRECTORATE NAME'], item['MANAGE BY DIVISION NAME'], item['MANAGE BY GROUP NAME'],
          item['REQ PIC OWNER NAME'], item['REQ PIC OWNER PHONE'], item['REQ PIC OWNER EMAIL'],
          item['EXTERNAL WORK PROGRAM CODE'], item['EXTERNAL WORK PROGRAM NAME'], item['EXTERNAL WORK PROGRAM BUDGET'],
          item['INTERNAL WORK PROGRAM CODE'], item['INTERNAL WORK PROGRAM NAME'], item['INTERNAL WORK PROGRAM BUDGET'],
          item['PROJECT STATUS'], item['PROJECT PROGRESSION'], item['SDLC CURRENT ACTIVE STATUS'], item['SDLC PROGRESSION'],
          item['PROJECT ASSIGN NAMA'],
          // Add SDLC week columns
          ...Array.from({length: 52}, (_, i) => {
            const week = i + 1;
            const quarter = week >= 1 && week <= 13 ? 'Q1' : 
                           week >= 14 && week <= 26 ? 'Q2' : 
                           week >= 27 && week <= 39 ? 'Q3' : 'Q4';
            return item[`${quarter} - WEEK ${week}`] || '';
          })
        ]);
        
        XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A2' });
        
        // Set column widths for better readability (33 base + 52 SDLC = 85 columns)
        const baseColumnWidths = [
          { wch: 5 },   // NO.
          { wch: 15 },  // REQ NUMBER
          { wch: 30 },  // NARRATIVE
          { wch: 12 },  // MEMO DATE
          { wch: 15 },  // MEMO RECEIVE DATE
          { wch: 20 },  // REQUIREMENT TYPE
          { wch: 15 },  // PROJECT NUMBER
          { wch: 35 },  // PROJECT NAME
          { wch: 15 },  // PROJECT REGISTER DATE
          { wch: 12 },  // APPROVED DATE
          { wch: 15 },  // PROJECT TYPE
          { wch: 25 },  // PROJECT CHARACTERISTIC NAME
          { wch: 25 },  // PROJECT SUB CHARACTERISTIC NAME
          { wch: 25 },  // OWNER DIRECTORATE NAME
          { wch: 25 },  // OWNER DIVISION NAME
          { wch: 25 },  // OWNER GROUP NAME
          { wch: 25 },  // MANAGE BY DIRECTORATE NAME
          { wch: 25 },  // MANAGE BY DIVISION NAME
          { wch: 25 },  // MANAGE BY GROUP NAME
          { wch: 20 },  // REQ PIC OWNER NAME
          { wch: 15 },  // REQ PIC OWNER PHONE
          { wch: 25 },  // REQ PIC OWNER EMAIL
          { wch: 20 },  // EXTERNAL WORK PROGRAM CODE
          { wch: 30 },  // EXTERNAL WORK PROGRAM NAME
          { wch: 20 },  // EXTERNAL WORK PROGRAM BUDGET
          { wch: 20 },  // INTERNAL WORK PROGRAM CODE
          { wch: 30 },  // INTERNAL WORK PROGRAM NAME
          { wch: 20 },  // INTERNAL WORK PROGRAM BUDGET
          { wch: 15 },  // PROJECT STATUS
          { wch: 15 },  // PROJECT PROGRESSION
          { wch: 25 },  // SDLC CURRENT ACTIVE STATUS
          { wch: 15 },  // SDLC PROGRESSION
          { wch: 30 },  // PROJECT ASSIGN NAMA
        ];
        
        // Add SDLC week column widths (52 columns)
        const sdlcColumnWidths = Array(52).fill({ wch: 18 }); // Q1 - WEEK 1 format
        
        const columnWidths = [...baseColumnWidths, ...sdlcColumnWidths];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Project Active Portfolio",
        );

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        setIsLoading(false);
        return blob;
      } else {
        throw new Error(data.message || "Failed to export data");
      }
    } catch (error) {
      console.error("Export service error:", error);
      setIsLoading(false);
      setError("Failed to export Excel file");
      return null;
    }
  };

  const ListProjectClosePortofolio = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<ApiGenericResponse<
    ProjectClosePortofolioListResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );

    try {
      const response = await axiosInstance.post(
        `${UrlEndpoint}/v1/Report/project-close-portfolio`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      const errorResponse = handleAxiosError(error as any);
      setError(errorResponse.message);
      return null;
    }
  };

  const ExportProjectClosePortofolioListExcel = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);

    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );

    try {
      const response = await fetch(
        `${UrlEndpoint}/v1/Report/export-project-close-portfolio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        // Create Excel file using xlsx - same structure as active portfolio
        const XLSX = await import("xlsx");
        const workbook = XLSX.utils.book_new();

        // Transform data for Excel export with proper column structure
        const excelData = data.data.map((item: any, index: number) => {
          const getQuarterFromWeek = (week: number): string => {
            if (week >= 1 && week <= 13) return 'Q1';
            if (week >= 14 && week <= 26) return 'Q2';
            if (week >= 27 && week <= 39) return 'Q3';
            if (week >= 40 && week <= 52) return 'Q4';
            return 'Q1';
          };

          const baseData: any = {
            "NO.": index + 1,
            "REQ NUMBER": item.reqNumber || "",
            "NARRATIVE": item.reqNarative || "",
            "MEMO DATE": item.reqDate ? new Date(item.reqDate).toLocaleDateString("id-ID") : "",
            "MEMO RECEIVE DATE": item.reqAcceptedDate ? new Date(item.reqAcceptedDate).toLocaleDateString("id-ID") : "",
            "REQUIREMENT TYPE": item.requirementType || "",
            "PROJECT NUMBER": item.projectNo || "",
            "PROJECT NAME": item.projectName || "",
            "PROJECT REGISTER DATE": item.projectRegisterDate ? new Date(item.projectRegisterDate).toLocaleDateString("id-ID") : "",
            "APPROVED DATE": item.projectApprovedDate ? new Date(item.projectApprovedDate).toLocaleDateString("id-ID") : "",
            "PROJECT TYPE": item.projectType || "",
            "PROJECT CHARACTERISTIC NAME": item.projectCategory || "",
            "PROJECT SUB CHARACTERISTIC NAME": item.projectSubCategory || "",
            "OWNER DIRECTORATE NAME": item.projectOwnerDirectorateName || "",
            "OWNER DIVISION NAME": item.projectOwnerDivisionName || "",
            "OWNER GROUP NAME": item.projectOwnerGroupName || "",
            "MANAGE BY DIRECTORATE NAME": item.projectManageByDirectorateName || "",
            "MANAGE BY DIVISION NAME": item.projectManageByDivisionName || "",
            "MANAGE BY GROUP NAME": item.projectManageByGroupName || "",
            "REQ PIC OWNER NAME": item.reqUserPicName || "",
            "REQ PIC OWNER PHONE": item.reqUserPicContanct || "",
            "REQ PIC OWNER EMAIL": item.reqUserPicEmail || "",
            "EXTERNAL WORK PROGRAM CODE": item.workProgramExternalCode || "",
            "EXTERNAL WORK PROGRAM NAME": item.workProgramExternalName || "",
            "EXTERNAL WORK PROGRAM BUDGET": item.workProgramExternalBudget || "",
            "INTERNAL WORK PROGRAM CODE": item.workProgramInternalCode || "",
            "INTERNAL WORK PROGRAM NAME": item.workProgramInternalName || "",
            "INTERNAL WORK PROGRAM BUDGET": item.workProgramInternalBudget || "",
            "PROJECT STATUS": item.projectStatus || "",
            "PROJECT PROGRESSION": item.projectStatusPercentage ? `${item.projectStatusPercentage}%` : "",
            "SDLC CURRENT ACTIVE STATUS": item.proSdlcStageNameActive || "",
            "SDLC PROGRESSION": item.proSdlcStagePercentage ? `${item.proSdlcStagePercentage}%` : "",
            "PROJECT ASSIGN NAMA": item.proAssigns || "",
          };

          // Add dynamic SDLC columns (Week 1-52)
          for (let week = 1; week <= 52; week++) {
            const quarter = getQuarterFromWeek(week);
            const columnName = `${quarter} - WEEK ${week}`;
            baseData[columnName] = item.sdlcReportsByWeek?.[week] || '';
          }

          return baseData;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([]);
        
        const baseHeaders = [
          'NO.', 'REQ NUMBER', 'NARRATIVE', 'MEMO DATE', 'MEMO RECEIVE DATE', 'REQUIREMENT TYPE',
          'PROJECT NUMBER', 'PROJECT NAME', 'PROJECT REGISTER DATE', 'APPROVED DATE', 'PROJECT TYPE', 
          'PROJECT CHARACTERISTIC NAME', 'PROJECT SUB CHARACTERISTIC NAME',
          'OWNER DIRECTORATE NAME', 'OWNER DIVISION NAME', 'OWNER GROUP NAME',
          'MANAGE BY DIRECTORATE NAME', 'MANAGE BY DIVISION NAME', 'MANAGE BY GROUP NAME',
          'REQ PIC OWNER NAME', 'REQ PIC OWNER PHONE', 'REQ PIC OWNER EMAIL',
          'EXTERNAL WORK PROGRAM CODE', 'EXTERNAL WORK PROGRAM NAME', 'EXTERNAL WORK PROGRAM BUDGET',
          'INTERNAL WORK PROGRAM CODE', 'INTERNAL WORK PROGRAM NAME', 'INTERNAL WORK PROGRAM BUDGET',
          'PROJECT STATUS', 'PROJECT PROGRESSION', 'SDLC CURRENT ACTIVE STATUS', 'SDLC PROGRESSION',
          'PROJECT ASSIGN NAMA'
        ];
        
        const sdlcHeaders = Array.from({length: 52}, (_, i) => {
          const week = i + 1;
          const quarter = week >= 1 && week <= 13 ? 'Q1' : 
                         week >= 14 && week <= 26 ? 'Q2' : 
                         week >= 27 && week <= 39 ? 'Q3' : 'Q4';
          return `${quarter} - WEEK ${week}`;
        });
        
        const headers = [...baseHeaders, ...sdlcHeaders];
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
        
        const dataRows = excelData.map((item: any) => [
          item['NO.'], item['REQ NUMBER'], item['NARRATIVE'], item['MEMO DATE'], item['MEMO RECEIVE DATE'], item['REQUIREMENT TYPE'],
          item['PROJECT NUMBER'], item['PROJECT NAME'], item['PROJECT REGISTER DATE'], item['APPROVED DATE'], item['PROJECT TYPE'],
          item['PROJECT CHARACTERISTIC NAME'], item['PROJECT SUB CHARACTERISTIC NAME'],
          item['OWNER DIRECTORATE NAME'], item['OWNER DIVISION NAME'], item['OWNER GROUP NAME'],
          item['MANAGE BY DIRECTORATE NAME'], item['MANAGE BY DIVISION NAME'], item['MANAGE BY GROUP NAME'],
          item['REQ PIC OWNER NAME'], item['REQ PIC OWNER PHONE'], item['REQ PIC OWNER EMAIL'],
          item['EXTERNAL WORK PROGRAM CODE'], item['EXTERNAL WORK PROGRAM NAME'], item['EXTERNAL WORK PROGRAM BUDGET'],
          item['INTERNAL WORK PROGRAM CODE'], item['INTERNAL WORK PROGRAM NAME'], item['INTERNAL WORK PROGRAM BUDGET'],
          item['PROJECT STATUS'], item['PROJECT PROGRESSION'], item['SDLC CURRENT ACTIVE STATUS'], item['SDLC PROGRESSION'],
          item['PROJECT ASSIGN NAMA'],
          ...Array.from({length: 52}, (_, i) => {
            const week = i + 1;
            const quarter = week >= 1 && week <= 13 ? 'Q1' : 
                           week >= 14 && week <= 26 ? 'Q2' : 
                           week >= 27 && week <= 39 ? 'Q3' : 'Q4';
            return item[`${quarter} - WEEK ${week}`] || '';
          })
        ]);
        
        XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A2' });
        
        const baseColumnWidths = [
          { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
          { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 25 },
          { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
          { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 20 },
          { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 30 }
        ];
        
        const sdlcColumnWidths = Array(52).fill({ wch: 18 });
        const columnWidths = [...baseColumnWidths, ...sdlcColumnWidths];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Project Close Portfolio");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        setIsLoading(false);
        return blob;
      } else {
        throw new Error(data.message || "Failed to export data");
      }
    } catch (error) {
      console.error("Export service error:", error);
      setIsLoading(false);
      setError("Failed to export Excel file");
      return null;
    }
  };

  const CreateUserEvaluationSnapshot = async (
    token: string,
  ): Promise<ApiGenericResponse<UserEvaluationSnapshotResponse | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = "/v1/Report/create-user-evaluation-snapshot";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<UserEvaluationSnapshotResponse>
      >(`${UrlEndpoint}${PathEndpoint}`, {}, {
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
          err.response?.data?.message || "An error occurred during snapshot creation.",
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

  const ListUserEvaluationReport = async (
    payload: PaggingListPayloadCustom,
    token: string,
  ): Promise<ApiGenericResponse<
    UserEvaluationReportListResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = "/v1/Report/list-user-evaluation-report";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<UserEvaluationReportListResponse[]>
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
          err.response?.data?.message || "An error occurred during request.",
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

  const UpdateUserEvaluationReport = async (
    payload: UserEvaluationReportUpdatePayload,
    token: string,
  ): Promise<ApiGenericResponse<string | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = "/v1/Report/user-evaluation-report/update";
    
    console.log("Service payload:", payload);
    
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
          err.response?.data?.message || "An error occurred during request.",
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

  const GetUserEvaluationReportById = async (
    id: string,
    token: string,
  ): Promise<ApiGenericResponse<RptUserEvaluationReport | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC,
    );
    const PathEndpoint: string = `/v1/Report/user-evaluation-report/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<RptUserEvaluationReport | null>
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
          err.response?.data?.message || "An error occurred during request.",
        );
        return errorResponse;
      } else {
        setError("An unexpected error occurred.");
        return null;
      }
    }
  };

  const ExportUserEvaluationReportExcel = async (
    data: UserEvaluationReportListResponse[],
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Import xlsx dynamically
      const XLSX = await import("xlsx");

      // Transform data for Excel export with all required columns
      const excelData = data.map((item: UserEvaluationReportListResponse, index: number) => ({
        "NO.": index + 1,
        "NAMA": item.nama || "",
        "NIP": item.nip || "",
        "USER_ID": item.userId || "",
        "JABATAN": item.jabatan || "",
        "NAMA_UNIT_KERJA": item.namaUnitKerja || "",
        "USER_ORG_GROUP_CODE": item.userOrgGroupCode || "",
        "USER_ORG_GROUP_NAME": item.userOrgGroupName || "",
        "USER_TEAM_CODE": item.userTeamCode || "",
        "USER_TEAM_NAME": item.userTeamName || "",
        "REQ_ID": item.reqId || "",
        "REQUIREMENT_TYPE": item.requirementType || "",
        "REQ_NUMBER": item.reqNumber || "",
        "REQ_NARATIVE": item.reqNarative || "",
        "REQ_APP_LIVE_TARGET_DATE": item.reqAppLiveTargetDate ? new Date(item.reqAppLiveTargetDate).toLocaleDateString("id-ID") : "",
        "PROJECT_ID": item.projectId || "",
        "PROJECT_NO": item.projectNo || "",
        "PROJECT_NAME": item.projectName || "",
        "PROJECT_REGISTER_DATE": item.projectRegisterDate ? new Date(item.projectRegisterDate).toLocaleDateString("id-ID") : "",
        "PROJECT_CLOSED_DATE": item.projectClosedDate ? new Date(item.projectClosedDate).toLocaleDateString("id-ID") : "",
        "PROJECT_COMPLETED_DATE": item.projectCompletedDate ? new Date(item.projectCompletedDate).toLocaleDateString("id-ID") : "",
        "PROJECT_TYPE": item.projectType || "",
        "PROJECT_CATEGORY": item.projectCategory || "",
        "PROJECT_OWNER_DIRECTORATE_CODE": item.projectOwnerDirectorateCode || "",
        "PROJECT_OWNER_DIRECTORATE_NAME": item.projectOwnerDirectorateName || "",
        "PROJECT_OWNER_DIVISION_CODE": item.projectOwnerDivisionCode || "",
        "PROJECT_OWNER_DIVISION_NAME": item.projectOwnerDivisionName || "",
        "PROJECT_OWNER_GROUP_CODE": item.projectOwnerGroupCode || "",
        "PROJECT_OWNER_GROUP_NAME": item.projectOwnerGroupName || "",
        "PROJECT_MANAGE_BY_DIRECTORATE_CODE": item.projectManageByDirectorateCode || "",
        "PROJECT_MANAGE_BY_DIRECTORATE_NAME": item.projectManageByDirectorateName || "",
        "PROJECT_MANAGE_BY_DIVISION_CODE": item.projectManageByDivisionCode || "",
        "PROJECT_MANAGE_BY_DIVISION_NAME": item.projectManageByDivisionName || "",
        "PROJECT_MANAGE_BY_GROUP_CODE": item.projectManageByGroupCode || "",
        "PROJECT_MANAGE_BY_GROUP_NAME": item.projectManageByGroupName || "",
        "PROJECT_STATUS": item.projectStatus || "",
        "PROJECT_STATUS_PERCENTAGE": item.projectStatusPercentage || 0,
        "PRO_SDLC_STAGE_NAME_ACTIVE": item.proSdlcStageNameActive || "",
        "APP_SHORT_NAME": item.appShortName || "",
        "APP_NAME": item.appName || "",
        "USER_TOTAL_TASK_ASSIGN": item.userTotalTaskAssign || 0,
        "USER_TOTAL_TASK_DONE": item.userTotalTaskDone || 0,
        "EV_BASIC_POINT": item.evBasicPoint || 0,
        "EV_TIMELESS_POINT": item.evTimelessPoint || 0,
        "EV_EXTRA_POINT": item.evExtraPoint || 0,
        "EV_TOTAL_POINT": item.evTotalPoint || 0,
        "EV_GRAND_TOTAL": item.evGrandTotal || 0,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
        { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
        { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
        { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "User Evaluation Report");

      // Generate Excel file as blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setIsLoading(false);
      return blob;
    } catch (error) {
      console.error("Export service error:", error);
      setIsLoading(false);
      setError("Failed to export Excel file");
      return null;
    }
  };

  return {
    ListReportProjectPortofolio,
    ExportProjectPortofolioExcel,
    ExportProjectPortofolioPDF,
    ListProjectActivePortofolio,
    ExportProjectActivePortofolioExcel,
    ExportProjectActivePortofolioListExcel,
    ListProjectClosePortofolio,
    ExportProjectClosePortofolioListExcel,
    CreateUserEvaluationSnapshot,
    ListUserEvaluationReport,
    UpdateUserEvaluationReport,
    GetUserEvaluationReportById,
    ExportUserEvaluationReportExcel,

    isLoading,
    error,
  };
};

export default useReports;
