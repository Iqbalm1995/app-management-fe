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

interface useReportsServices {
  ListReportProjectPortofolio: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null>;
  ExportProjectPortofolioExcel: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<Blob | null>;
  ExportProjectPortofolioPDF: (
    payload: PaggingListPayloadCustom,
    token: string
  ) => Promise<Blob | null>;

  isLoading: boolean;
  error: string | null;
}

const useReports = (): useReportsServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ListReportProjectPortofolio = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<ApiGenericResponse<
    ReportProjectPortofolioDataResponse[] | null
  > | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
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

  const ExportProjectPortofolioExcel = async (
    payload: PaggingListPayloadCustom,
    token: string
  ): Promise<Blob | null> => {
    console.log("Export service called with payload:", payload);
    setIsLoading(true);
    setError(null);

    try {
      // Use existing list endpoint to get all data
      const listPayload = {
        ...payload,
        limit: -1, // Get all data
        page: 0
      };

      const response = await ListReportProjectPortofolio(listPayload, token);
      
      if (response?.statusCode !== RES_CODE_OK || !response.data) {
        setError("Failed to fetch data for export");
        setIsLoading(false);
        return null;
      }

      // Import xlsx dynamically
      const XLSX = await import('xlsx');
      
      // Transform data for Excel export
      const excelData = response.data.map((item: ReportProjectPortofolioDataResponse, index: number) => ({
        'No.': index + 1,
        'Project No': item.projectNo || '-',
        'Project Name': item.projectName || '-',
        'Project Category': item.projectCategory || '-',
        'Project Type': item.projectType || '-',
        'Project Characteristic': item.projectCharasteristicName || '-',
        'Project Sub Characteristic': item.projectSubCharasteristicName || '-',
        'Project Description': item.projectDesc || '-',
        'Owner Division': item.proOwnerDivisionName || '-',
        'Owner Group': item.proOwnerGroupName || '-',
        'Manage Division': item.proManageByDivisionName || '-',
        'Manage Group': item.proManageByGroupName || '-',
        'PIC Name': item.requirement?.userPicName || '-',
        'PIC Contact': item.requirement?.userPicContanct || '-',
        'PIC Email': item.requirement?.userPicEmail || '-',
        'Target Live Date': item.requirement?.appLiveTargetDate ? new Date(item.requirement.appLiveTargetDate).toLocaleDateString() : '-',
        'Project Status': item.projectStatus || '-',
        'Progress (%)': item.projectStatusPercentage || 0,
        'Duration (Days)': item.projectDurationDays || 0,
        'Register Date': item.projectRegisterDate ? new Date(item.projectRegisterDate).toLocaleDateString() : '-',
        'Closed Date': item.projectClosedDate ? new Date(item.projectClosedDate).toLocaleDateString() : '-',
        'External Programs': item.workPrograms?.filter(wp => wp.workProgramSource === 'EXTERNAL').map(wp => `${wp.workProgramCode}: ${wp.workProgramName}`).join('; ') || '-',
        'Internal Programs': item.workPrograms?.filter(wp => wp.workProgramSource === 'INTERNAL').map(wp => `${wp.workProgramCode}: ${wp.workProgramName}`).join('; ') || '-',
        'Team Members': item.userAssignment?.map(ua => ua.userData?.nama || ua.userId).join('; ') || '-'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Project Portfolio Report');
      
      // Generate Excel file as blob
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
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
    token: string
  ): Promise<Blob | null> => {
    console.log("PDF Export service called with payload:", payload);
    setIsLoading(true);
    setError(null);

    try {
      // Use existing list endpoint to get all data
      const listPayload = {
        ...payload,
        limit: -1, // Get all data
        page: 0
      };

      const response = await ListReportProjectPortofolio(listPayload, token);
      
      if (response?.statusCode !== RES_CODE_OK || !response.data) {
        setError("Failed to fetch data for export");
        setIsLoading(false);
        return null;
      }

      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(16);
      doc.text('Project Portfolio Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

      // Prepare table data
      const tableData = response.data.map((item: ReportProjectPortofolioDataResponse, index: number) => [
        index + 1,
        item.projectNo || '-',
        item.projectName || '-',
        item.projectCategory || '-',
        item.projectType || '-',
        item.projectCharasteristicName || '-',
        item.projectSubCharasteristicName || '-',
        item.proOwnerDivisionName || '-',
        item.proOwnerGroupName || '-',
        item.proManageByDivisionName || '-',
        item.requirement?.userPicName || '-',
        item.requirement?.userPicContanct || '-',
        item.requirement?.appLiveTargetDate ? new Date(item.requirement.appLiveTargetDate).toLocaleDateString() : '-',
        item.projectStatus || '-',
        `${item.projectStatusPercentage || 0}%`,
        `${item.projectDurationDays || 0} days`,
        item.projectRegisterDate ? new Date(item.projectRegisterDate).toLocaleDateString() : '-',
        item.workPrograms?.filter(wp => wp.workProgramSource === 'EXTERNAL').length || 0,
        item.workPrograms?.filter(wp => wp.workProgramSource === 'INTERNAL').length || 0,
        item.userAssignment?.length || 0
      ]);

      // Add table
      autoTable(doc, {
        head: [['No.', 'Project No', 'Project Name', 'Category', 'Type', 'Characteristic', 'Sub Characteristic', 'Owner Div', 'Owner Group', 'Manage Div', 'PIC Name', 'PIC Contact', 'Target Date', 'Status', 'Progress', 'Duration', 'Register Date', 'Ext Programs', 'Int Programs', 'Team Size']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 8 },   // No
          1: { cellWidth: 15 },  // Project No
          2: { cellWidth: 25 },  // Project Name
          3: { cellWidth: 12 },  // Category
          4: { cellWidth: 12 },  // Type
          5: { cellWidth: 15 },  // Characteristic
          6: { cellWidth: 15 },  // Sub Characteristic
          7: { cellWidth: 15 },  // Owner Div
          8: { cellWidth: 12 },  // Owner Group
          9: { cellWidth: 12 },  // Manage Div
          10: { cellWidth: 15 }, // PIC Name
          11: { cellWidth: 12 }, // PIC Contact
          12: { cellWidth: 12 }, // Target Date
          13: { cellWidth: 10 }, // Status
          14: { cellWidth: 8 },  // Progress
          15: { cellWidth: 10 }, // Duration
          16: { cellWidth: 12 }, // Register Date
          17: { cellWidth: 8 },  // Ext Programs
          18: { cellWidth: 8 },  // Int Programs
          19: { cellWidth: 8 }   // Team Size
        }
      });

      // Generate PDF as blob
      const pdfBlob = doc.output('blob');
      
      setIsLoading(false);
      return pdfBlob;

    } catch (error) {
      console.error("PDF Export service error:", error);
      setIsLoading(false);
      setError("Failed to export PDF file");
      return null;
    }
  };

  return {
    ListReportProjectPortofolio,
    ExportProjectPortofolioExcel,
    ExportProjectPortofolioPDF,

    isLoading,
    error,
  };
};

export default useReports;
