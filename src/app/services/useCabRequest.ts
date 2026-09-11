// src/app/services/useCabRequest.ts
"use client";

import { useState } from "react";
import {
  ApproveCabPayload,
  BulkScheduleCabItemPayload,
  BulkScheduleCabPayload,
  CabActivityItem,
  CabCategory,
  CabCommitteeMember,
  CabFormData,
  CabPicInternalIT,
  CabRequestDetail,
  CabRequestItem,
  CabScheduleHistoryItem,
  CabScheduleItem,
  CabSoftwareApplicationItem,
  CreateCabRequestPayload,
  RescheduleCabRequestPayload,
  ScheduleCabPayload,
  UpdateCabResultPayload,
} from "../types/cabTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";

interface CabListResponse {
  data: CabRequestItem[];
  countTotal: number;
}

interface CabDetailResponse {
  data: CabRequestDetail | null;
}

interface BackendResponseList<T> {
  statusCode: number;
  message: string;
  data: T[];
  countTotal: number;
}

interface BackendResponseOne<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Generates a fallback CAB Request Number in format: {NNNN}/CAB/{MM}/{YYYY}
 */
export const generateCabRequestNo = (
  dateInput?: Date | string,
  existingList: CabRequestItem[] = []
): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const mm = String(validDate.getMonth() + 1).padStart(2, "0");
  const yyyy = String(validDate.getFullYear());
  const monthYearSuffix = `/CAB/${mm}/${yyyy}`;

  let maxSeq = 0;

  existingList.forEach((item) => {
    if (!item.requestNo) return;
    const match = item.requestNo.match(/^(\d{4})\/CAB\/(\d{2})\/(\d{4})$/i);
    if (match) {
      const itemSeq = parseInt(match[1], 10);
      const itemMm = match[2];
      const itemYyyy = match[3];
      if (itemMm === mm && itemYyyy === yyyy) {
        if (!isNaN(itemSeq) && itemSeq > maxSeq) {
          maxSeq = itemSeq;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(4, "0");

  return `${seqStr}${monthYearSuffix}`;
};

// ─── Helper mapping functions ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendItemToFrontendItem = (item: any): CabRequestItem => {
  return {
    id: item.id || item.Id,
    requestNo: item.requestNo || item.RequestNo || "",
    requestTitle: item.requestTitle || item.RequestTitle || "",
    requestType: item.requestType || item.RequestType || "SOFTWARE",
    category: item.category || item.Category || "SOFTWARE",
    priority: item.priority || item.Priority || "MEDIUM",
    status: item.status || item.Status || "DRAFT",
    requestDate: item.requestDate || item.RequestDate || new Date().toISOString().slice(0, 10),
    targetDate: item.targetDate || item.TargetDate || new Date().toISOString().slice(0, 10),
    requestedCabDate: item.requestedCabDate || item.RequestedCabDate || null,
    scheduledDate: item.scheduledDate || item.ScheduledDate || null,
    scheduledEndDate: item.scheduledEndDate || item.ScheduledEndDate || null,
    cabLocation: item.cabLocation || item.CabLocation || "",
    requesterName: item.requesterName || item.RequesterName || "User",
    approverName: item.approverName || item.ApproverName || "Reviewer",
    projectName: item.projectName || item.ProjectName || "-",
    rekomendasiUat: item.rekomendasiUat || item.RekomendasiUat || "REKOMENDASI_MIGRASI",
    cabResult: item.cabResult || item.CabResult || "",
    cabNotes: item.cabNotes || item.CabNotes || "",
    implementationStatus: item.implementationStatus || item.ImplementationStatus || null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendDetailToFrontendDetail = (d: any): CabRequestDetail => {
  const baseItem = mapBackendItemToFrontendItem(d);
  
  // Parse HasilUat
  let parsedHasilUat: ("BERHASIL_BAIK" | "BERHASIL_CATATAN" | "TIDAK_BERHASIL")[] = ["BERHASIL_BAIK"];
  const rawUat = d.hasilUat || d.HasilUat;
  if (Array.isArray(rawUat)) {
    parsedHasilUat = rawUat;
  } else if (typeof rawUat === "string" && rawUat.trim()) {
    parsedHasilUat = rawUat.split(",").map((s: string) => s.trim()) as any;
  }

  // Parse Applications
  const applications: CabSoftwareApplicationItem[] = (d.applications || d.Applications || []).map((app: any) => ({
    id: app.id || app.Id,
    applicationId: app.applicationId || app.ApplicationId || "",
    applicationName: app.applicationName || app.ApplicationName || "",
    aplikasiKategori: app.aplikasiKategori || app.AplikasiKategori || "",
    rfcKodeProject: app.rfcKodeProject || app.RfcKodeProject || "",
    projectId: app.projectId || app.ProjectId,
    itspKode: app.itspKode || app.ItspKode || "",
  }));

  // Parse PICs
  const pics: CabPicInternalIT[] = (d.pics || d.Pics || []).map((pic: any) => ({
    type: "INTERNAL_IT" as const,
    userId: pic.userId || pic.UserId || "",
    userName: pic.userName || pic.UserName || "",
    divisi: pic.divisi || pic.Divisi || pic.asalDivisi || pic.AsalDivisi || "",
  }));

  // Parse Committees
  const committees: CabCommitteeMember[] = (d.committees || d.Committees || []).map((c: any) => ({
    id: c.id || c.Id,
    type: (c.memberType || c.MemberType || "INTERNAL_IT") as any,
    userId: c.userId || c.UserId,
    userName: c.userName || c.UserName || "",
    jabatan: c.jabatan || c.Jabatan || "",
    divisi: c.divisi || c.Divisi || "",
    asalInstitusi: c.asalInstitusi || c.AsalInstitusi || "",
    asalDivisi: c.asalDivisi || c.AsalDivisi || "",
  }));

  // Parse Activities
  const activities: CabActivityItem[] = (d.activities || d.Activities || []).map((a: any) => ({
    id: a.activityKey || a.ActivityKey || a.id || a.Id,
    activityKey: a.activityKey || a.ActivityKey || a.id || a.Id,
    label: a.label || a.Label || "",
    shortLabel: a.shortLabel || a.ShortLabel || "",
    description: a.description || a.Description || "",
    isDone: Boolean(a.isDone ?? a.IsDone),
    doneAt: a.doneAt || a.DoneAt || null,
    doneBy: a.doneBy || a.DoneBy || null,
    isPendingInitial: Boolean(a.isPendingInitial ?? a.IsPendingInitial),
  }));

  // Parse Approvals
  const approvals = (d.approvals || d.Approvals || []).map((ap: any) => ({
    id: ap.id || ap.Id,
    stepOrder: ap.stepOrder || ap.StepOrder || 1,
    approverName: ap.approverName || ap.ApproverName || "",
    approverRole: ap.approverRole || ap.ApproverRole || "",
    status: ap.status || ap.Status || "PENDING",
    actionDate: ap.actionDate || ap.ActionDate || null,
    note: ap.note || ap.Note || null,
  }));

  // Parse Schedules
  const schedules: CabScheduleItem[] = (d.schedules || d.Schedules || []).map((s: any) => ({
    id: s.id || s.Id,
    cabRequestId: s.cabRequestId || s.CabRequestId,
    scheduleOrder: s.scheduleOrder || s.ScheduleOrder || 1,
    scheduleType: s.scheduleType || s.ScheduleType || "CAB_MEETING",
    scheduleTitle: s.scheduleTitle || s.ScheduleTitle || "",
    startDate: s.startDate || s.StartDate,
    endDate: s.endDate || s.EndDate,
    location: s.location || s.Location,
    status: s.status || s.Status || "ACTIVE",
    note: s.note || s.Note,
    createdAt: s.createdAt || s.CreatedAt,
    createdBy: s.createdBy || s.CreatedBy,
  }));

  // Parse Schedule Histories
  const scheduleHistories: CabScheduleHistoryItem[] = (d.scheduleHistories || d.ScheduleHistories || []).map((sh: any) => ({
    id: sh.id || sh.Id,
    cabScheduleParentId: sh.cabScheduleParentId || sh.CabScheduleParentId,
    cabRequestId: sh.cabRequestId || sh.CabRequestId,
    cabRequestHistoryId: sh.cabRequestHistoryId || sh.CabRequestHistoryId,
    scheduleOrder: sh.scheduleOrder || sh.ScheduleOrder || 1,
    scheduleType: sh.scheduleType || sh.ScheduleType || "CAB_MEETING",
    scheduleTitle: sh.scheduleTitle || sh.ScheduleTitle || "",
    startDate: sh.startDate || sh.StartDate,
    endDate: sh.endDate || sh.EndDate,
    location: sh.location || sh.Location,
    status: sh.status || sh.Status,
    note: sh.note || sh.Note,
    revisionReason: sh.revisionReason || sh.RevisionReason,
    createdAt: sh.createdAt || sh.CreatedAt,
    createdBy: sh.createdBy || sh.CreatedBy,
  }));

  return {
    ...baseItem,
    category: (d.category || d.Category || "SOFTWARE") as CabCategory,
    tipeCab: d.requestType || d.RequestType || "NEW FEATURE",
    requesterEmail: d.requesterEmail || d.RequesterEmail || "",
    description: d.description || d.Description || "",
    impactAnalysis: d.impactAnalysis || d.ImpactAnalysis || "",
    rollbackPlan: d.rollbackPlan || d.RollbackPlan || "",
    cabLocation: d.cabLocation || d.CabLocation || "",
    cabResult: d.cabResult || d.CabResult || "",
    cabNotes: d.cabNotes || d.CabNotes || "",
    implementationStatus: d.implementationStatus || d.ImplementationStatus || null,
    
    // UAT & Memo
    hasilUat: parsedHasilUat,
    hasilUatCatatan: d.hasilUatCatatan || d.HasilUatCatatan || "",
    rekomendasiUat: d.rekomendasiUat || d.RekomendasiUat || "REKOMENDASI_MIGRASI",
    isHaveMemo: d.isHaveMemo || d.IsHaveMemo || "Y",
    perihalSementara: d.perihalSementara || d.PerihalSementara || "",
    memoNomor: d.memoNomor || d.MemoNomor || "",
    memoPerihal: d.memoPerihal || d.MemoPerihal || "",
    memoTanggal: d.memoTanggal || d.MemoTanggal || "",
    memoTanggalDiterima: d.memoTanggalDiterima || d.MemoTanggalDiterima || "",
    memoDurasiHari: d.memoDurasiHari || d.MemoDurasiHari,
    memoDirektoratPengirim: d.memoDirektoratPengirim || d.MemoDirektoratPengirim || "",
    memoDivisiPengirim: d.memoDivisiPengirim || d.MemoDivisiPengirim || "",
    tanggalPermohonanMigrasi: d.tanggalPermohonanMigrasi || d.TanggalPermohonanMigrasi || null,

    // Downtime & Execution
    ceklistMigrasi: d.ceklistMigrasi || d.CeklistMigrasi || "ADA",
    ceklistMigrasiRundown: d.ceklistMigrasiRundown || d.CeklistMigrasiRundown || "",
    downtime: d.downtime || d.Downtime || "ADA",
    downtimeDurasi: d.downtimeDurasi || d.DowntimeDurasi || "",
    risikoKonflik: d.risikoKonflik || d.RisikoKonflik || "TIDAK_ADA",
    instalasiAreaDrc: d.instalasiAreaDrc || d.InstalasiAreaDrc || "YA",

    // Readiness & Security
    sast: d.sastStatus || d.SastStatus || "ADA",
    sastFile: null,
    dokumenArsitektur: d.dokumenArsitekturStatus || d.DokumenArsitekturStatus || "ADA",
    dokumenArsitekturLink: d.dokumenArsitekturLink || d.DokumenArsitekturLink || "",
    dokumenArsitekturFile: null,
    kesiapanInfrastruktur: d.kesiapanInfraStatus || d.KesiapanInfraStatus || "YA",
    sourceAplikasi: d.sourceAplikasiStatus || d.SourceAplikasiStatus || "ADA",
    userMatriks: d.userMatriksStatus || d.UserMatriksStatus || "ADA",
    toolsMonitoring: d.toolsMonitoringStatus || d.ToolsMonitoringStatus || "ADA",
    securityChecklist: d.securityChecklistStatus || d.SecurityChecklistStatus || "ADA",
    persetujuanItSecurity: d.persetujuanItSecStatus || d.PersetujuanItSecStatus || "YA",
    persetujuanItSecurityAlasan: d.persetujuanItSecAlasan || d.PersetujuanItSecAlasan || "",
    petunjukTeknis: d.petunjukTeknisStatus || d.PetunjukTeknisStatus || "ADA",

    // Hardware
    namaHardware: d.namaHardware || d.NamaHardware || "",
    deskripsiPerubahan: d.deskripsiPerubahan || d.DeskripsiPerubahan || "",
    dampakOperasional: d.dampakOperasional || d.DampakOperasional || "",
    dasarUpgrade: d.dasarUpgrade || d.DasarUpgrade || "",
    catatanKomitmen: d.catatanKomitmen || d.CatatanKomitmen || "",

    // Nested relations
    applications,
    picMigrasi: pics,
    committeeCab: committees,
    activityChecklist: activities,
    approvalHistory: approvals,
    schedules,
    scheduleHistories,
  };
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

const useCabRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBaseUrl = () => buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC);

  const ListCabRequests = async (
    token: string,
    params?: { search?: string; status?: string; category?: string; priority?: string; page?: number; limit?: number }
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const filterWhere: Array<{ field: string; value: string; operator: string }> = [];
      if (params?.status && params.status !== "ALL") {
        filterWhere.push({ field: "status", value: params.status, operator: "eq" });
      }
      if (params?.category && params.category !== "ALL") {
        filterWhere.push({ field: "category", value: params.category, operator: "eq" });
      }
      if (params?.priority && params.priority !== "ALL") {
        filterWhere.push({ field: "priority", value: params.priority, operator: "eq" });
      }

      const payload = {
        search: params?.search || "",
        limit: params?.limit || 100,
        page: (params?.page ?? 0) + 1,
        filterWhere: filterWhere,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const url = `${getBaseUrl()}/v1/Cab/list`;
      const response = await axiosInstance.post<BackendResponseList<any>>(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      if (response.data && response.data.data) {
        const mappedList = response.data.data.map(mapBackendItemToFrontendItem);
        return {
          data: mappedList,
          countTotal: response.data.countTotal || mappedList.length,
        };
      }
      return { data: [], countTotal: 0 };
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to fetch CAB requests");
      }
      return null;
    }
  };

  const GetCabRequestById = async (
    token: string,
    id: string
  ): Promise<CabDetailResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/${id}`;
      const response = await axiosInstance.get<BackendResponseOne<any>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      if (response.data && response.data.data) {
        const detail = mapBackendDetailToFrontendDetail(response.data.data);
        return { data: detail };
      }
      return { data: null };
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to fetch CAB detail");
      }
      return null;
    }
  };

  const GetCabCalendar = async (
    token: string,
    params?: { startDate?: string; endDate?: string; status?: string }
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;
      if (params?.status && params.status !== "ALL") queryParams.status = params.status;

      const url = `${getBaseUrl()}/v1/Cab/calendar`;
      const response = await axiosInstance.get<BackendResponseOne<any[]>>(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      setLoading(false);
      if (response.data && response.data.data) {
        const events = response.data.data.map((evt) => ({
          id: evt.extendedProps?.cabRequestId || evt.extendedProps?.CabRequestId || (evt.id || evt.Id)?.split("_")[0] || evt.id || evt.Id,
          requestNo: evt.extendedProps?.requestNo || evt.ExtendedProps?.RequestNo || "",
          requestTitle: evt.title || evt.Title || "",
          requestType: evt.extendedProps?.requestType || evt.ExtendedProps?.RequestType || "DEPLOYMENT",
          category: evt.extendedProps?.category || evt.ExtendedProps?.Category || "SOFTWARE",
          priority: evt.extendedProps?.priority || evt.ExtendedProps?.Priority || "MEDIUM",
          status: evt.extendedProps?.status || evt.ExtendedProps?.Status || "PELAKSANAAN",
          requestDate: evt.start ? evt.start.slice(0, 10) : "",
          targetDate: evt.start ? evt.start.slice(0, 10) : "",
          requestedCabDate: evt.start || null,
          scheduledDate: evt.start || null,
          scheduledEndDate: evt.end || null,
          cabLocation: evt.extendedProps?.cabLocation || evt.ExtendedProps?.CabLocation || "",
          requesterName: evt.extendedProps?.requesterName || evt.ExtendedProps?.RequesterName || "User",
          approverName: "Reviewer",
          projectName: evt.extendedProps?.projectName || evt.ExtendedProps?.ProjectName || "-",
        }));
        return { data: events, countTotal: events.length };
      }
      return { data: [], countTotal: 0 };
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to fetch CAB calendar");
      }
      return null;
    }
  };

  const GetPendingApprovals = async (
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/pending-approvals`;
      const response = await axiosInstance.get<BackendResponseList<any>>(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: (params?.page ?? 0) + 1,
          limit: params?.limit || 50,
        },
      });

      setLoading(false);
      if (response.data && response.data.data) {
        const mappedList = response.data.data.map(mapBackendItemToFrontendItem);
        return {
          data: mappedList,
          countTotal: response.data.countTotal || mappedList.length,
        };
      }
      return { data: [], countTotal: 0 };
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to fetch pending approvals");
      }
      return null;
    }
  };

  const CreateCabRequest = async (
    token: string,
    payload: CreateCabRequestPayload | CabFormData | Record<string, any>,
    isDraft?: boolean
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const form = payload as any;
      const isSw = form.category === "SOFTWARE";
      const isHw = form.category === "HARDWARE";

      let requestTitle = form.requestTitle || "Permohonan CAB";
      let requestType = form.requestType || "DEPLOYMENT";
      let priority = form.priority || "MEDIUM";
      let jenisCab = "NORMAL";
      let jenisCabEmergencyAlasan = "";
      let targetDate: string | null = form.targetDate || null;
      let requestedCabDate: string | null = null;
      let description = form.description || "";
      let impactAnalysis = form.impactAnalysis || "";
      let rollbackPlan = form.rollbackPlan || "";

      let hasilUat = "BERHASIL_BAIK";
      let hasilUatCatatan = "";
      let rekomendasiUat = "REKOMENDASI_MIGRASI";
      let isHaveMemo = "Y";
      let perihalSementara = "";
      let memoNomor = "";
      let memoPerihal = "";
      let memoTanggal: string | null = null;
      let memoTanggalDiterima: string | null = null;
      let memoDurasiHari: number | null = null;
      let memoDirektoratPengirim = "";
      let memoDivisiPengirim = "";
      let tanggalPermohonanMigrasi: string | null = null;

      let ceklistMigrasi = "ADA";
      let ceklistMigrasiRundown = "";
      let downtime = "ADA";
      let downtimeDurasi = "60 Menit";
      let risikoKonflik = "TIDAK_ADA";
      let instalasiAreaDrc = "YA";

      let sastStatus = "ADA";
      let sastLink = "";
      let dokumenArsitekturStatus = "ADA";
      let dokumenArsitekturLink = "";
      let kesiapanInfraStatus = "YA";
      let sourceAplikasiStatus = "ADA";
      let userMatriksStatus = "ADA";
      let toolsMonitoringStatus = "ADA";
      let securityChecklistStatus = "ADA";
      let persetujuanItSecStatus = "YA";
      let persetujuanItSecAlasan = "";
      let petunjukTeknisStatus = "ADA";

      let namaHardware = "";
      let deskripsiPerubahan = "";
      let dampakOperasional = "";
      let dasarUpgrade = "";

      let applications: any[] = [];
      let pics: any[] = [];
      let committees: any[] = [];

      if (isSw && form.step1) {
        requestTitle = form.step1.applicationName || requestTitle;
        requestType = form.step1.tipeCab || form.step1.aplikasiKategori || requestType;
        jenisCab = form.step1.jenisCab || "NORMAL";
        jenisCabEmergencyAlasan = form.step1.jenisCabEmergencyAlasan || "";
        requestedCabDate = form.step1.requestedCabDate || null;
        targetDate = form.step2?.tanggalPermohonanMigrasi || form.step1.dayDate || targetDate;
        description = `Implementasi perubahan software pada aplikasi ${form.step1.applicationName}. RFC: ${form.step1.rfcKodeProject || "-"}, ITSP: ${form.step1.itspKode || "-"}.`;
        impactAnalysis = form.step3?.downtime === "ADA"
          ? `Terdapat estimasi downtime berdurasi ${form.step3.downtimeDurasi || "60 Menit"}. Risiko konflik: ${form.step3.risikoKonflik || "TIDAK_ADA"}.`
          : "Zero-downtime implementation.";
        rollbackPlan = form.step4?.rollbackPlan === "ADA"
          ? "Rencana rollback tersedia melalui restore snapshot database & binary aplikasi versi sebelumnya."
          : "-";

        if (form.step2) {
          hasilUat = Array.isArray(form.step2.hasilUat) ? form.step2.hasilUat.join(",") : form.step2.hasilUat;
          hasilUatCatatan = form.step2.hasilUatCatatan || "";
          rekomendasiUat = form.step2.rekomendasiUat || "REKOMENDASI_MIGRASI";
          isHaveMemo = form.step2.isHaveMemo || "Y";
          perihalSementara = form.step2.perihalSementara || "";
          memoNomor = form.step2.memoNomor || "";
          memoPerihal = form.step2.memoPerihal || "";
          memoTanggal = form.step2.memoTanggal || null;
          memoTanggalDiterima = form.step2.memoTanggalDiterima || null;
          memoDurasiHari = form.step2.memoDurasiHari || null;
          memoDirektoratPengirim = form.step2.memoDirektoratPengirim || "";
          memoDivisiPengirim = form.step2.memoDivisiPengirim || "";
          tanggalPermohonanMigrasi = form.step2.tanggalPermohonanMigrasi || null;
        }

        if (form.step3) {
          ceklistMigrasi = form.step3.ceklistMigrasi || "ADA";
          ceklistMigrasiRundown = form.step3.ceklistMigrasiRundown || "";
          downtime = form.step3.downtime || "ADA";
          downtimeDurasi = form.step3.downtimeDurasi || "";
          risikoKonflik = form.step3.risikoKonflik || "TIDAK_ADA";
          instalasiAreaDrc = form.step3.instalasiAreaDrc || "YA";
        }

        if (form.step4) {
          sastStatus = form.step4.sast || "ADA";
          sastLink = form.step4.sastLink || "";
          dokumenArsitekturStatus = form.step4.dokumenArsitektur || "ADA";
          dokumenArsitekturLink = form.step4.dokumenArsitekturLink || "";
          kesiapanInfraStatus = form.step4.kesiapanInfrastruktur || "YA";
          sourceAplikasiStatus = form.step4.sourceAplikasi || "ADA";
          userMatriksStatus = form.step4.userMatriks || "ADA";
          toolsMonitoringStatus = form.step4.toolsMonitoring || "ADA";
          securityChecklistStatus = form.step4.securityChecklist || "ADA";
          persetujuanItSecStatus = form.step4.persetujuanItSecurity || "YA";
          persetujuanItSecAlasan = form.step4.persetujuanItSecurityAlasan || "";
          petunjukTeknisStatus = form.step4.petunjukTeknis || "ADA";
        }

        if (form.step1.applications && form.step1.applications.length > 0) {
          applications = form.step1.applications.map((a: any) => ({
            applicationId: a.applicationId,
            applicationName: a.applicationName,
            aplikasiKategori: a.aplikasiKategori,
            rfcKodeProject: a.rfcKodeProject,
            projectId: a.projectId,
            itspKode: a.itspKode,
          }));
        } else if (form.step1.applicationName) {
          applications = [{
            applicationId: form.step1.applicationId,
            applicationName: form.step1.applicationName,
            aplikasiKategori: form.step1.aplikasiKategori,
            rfcKodeProject: form.step1.rfcKodeProject,
            projectId: form.step1.projectId,
            itspKode: form.step1.itspKode,
          }];
        }

        if (form.step5?.picMigrasi) {
          pics = form.step5.picMigrasi.map((p: any) => ({
            picType: "INTERNAL_IT",
            userId: p.userId,
            userName: p.userName,
            divisi: p.divisi,
          }));
        }

        if (form.step5?.committeeCab) {
          committees = form.step5.committeeCab.map((c: any) => ({
            memberType: c.type || "INTERNAL_IT",
            userId: c.userId,
            userName: c.userName || c.name || c.nama,
            jabatan: c.jabatan,
            divisi: c.divisi || c.asalDivisi,
            asalInstitusi: c.asalInstitusi,
            asalDivisi: c.asalDivisi,
          }));
        }
      } else if (isHw && form.step1) {
        requestTitle = form.step1.namaHardware || requestTitle;
        requestType = form.step1.kodeProjectType || "INFRASTRUCTURE";
        jenisCab = form.step1.jenisCab || "NORMAL";
        jenisCabEmergencyAlasan = form.step1.jenisCabEmergencyAlasan || "";
        namaHardware = form.step1.namaHardware || "";
        deskripsiPerubahan = form.step1.deskripsiPerubahan || "";
        dampakOperasional = form.step1.dampakOperasional || "";
        dasarUpgrade = form.step1.dasarUpgrade || "";
        requestedCabDate = form.step1.requestedCabDate || null;
        targetDate = form.step2?.tanggalPermohonanImplementasi || form.step1.dayDate || targetDate;
        tanggalPermohonanMigrasi = form.step2?.tanggalPermohonanImplementasi || null;
        description = form.step1.deskripsiPerubahan || description;
        impactAnalysis = form.step1.dampakOperasional || impactAnalysis;
        rollbackPlan = form.step3?.rollbackPlan === "ADA" ? "Rencana rollback hardware & fallback cluster siap." : "-";

        if (form.step3) {
          ceklistMigrasi = form.step3.checklist || "ADA";
          dokumenArsitekturStatus = form.step3.dokumenArsitektur || "ADA";
          kesiapanInfraStatus = form.step3.testFungsional || "YA";
          toolsMonitoringStatus = form.step3.perangkatMonitoring || "ADA";
          persetujuanItSecStatus = form.step3.persetujuanItSecurity || "YA";
        }

        if (form.step4?.picMigrasi) {
          pics = form.step4.picMigrasi.map((p: any) => ({
            picType: "INTERNAL_IT",
            userId: p.userId,
            userName: p.userName,
            divisi: p.divisi,
          }));
        }

        if (form.step4?.committeeCab) {
          committees = form.step4.committeeCab.map((c: any) => ({
            memberType: c.type || "INTERNAL_IT",
            userId: c.userId,
            userName: c.userName || c.name || c.nama,
            jabatan: c.jabatan,
            divisi: c.divisi || c.asalDivisi,
            asalInstitusi: c.asalInstitusi,
            asalDivisi: c.asalDivisi,
          }));
        }
      }

      const body = {
        requestTitle,
        category: form.category || "SOFTWARE",
        requestType,
        priority,
        jenisCab,
        jenisCabEmergencyAlasan,
        targetDate,
        requestedCabDate,
        description,
        impactAnalysis,
        rollbackPlan,
        hasilUat,
        hasilUatCatatan,
        rekomendasiUat,
        isHaveMemo,
        perihalSementara,
        memoNomor,
        memoPerihal,
        memoTanggal,
        memoTanggalDiterima,
        memoDurasiHari,
        memoDirektoratPengirim,
        memoDivisiPengirim,
        tanggalPermohonanMigrasi,
        ceklistMigrasi,
        ceklistMigrasiRundown,
        downtime,
        downtimeDurasi,
        risikoKonflik,
        instalasiAreaDrc,
        sastStatus,
        sastLink,
        dokumenArsitekturStatus,
        dokumenArsitekturLink,
        kesiapanInfraStatus,
        sourceAplikasiStatus,
        userMatriksStatus,
        toolsMonitoringStatus,
        securityChecklistStatus,
        persetujuanItSecStatus,
        persetujuanItSecAlasan,
        petunjukTeknisStatus,
        namaHardware,
        deskripsiPerubahan,
        dampakOperasional,
        dasarUpgrade,
        applications,
        pics,
        committees,
      };

      const url = `${getBaseUrl()}/v1/Cab/create`;
      const response = await axiosInstance.post<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200 || response.data?.statusCode === 201;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to create CAB request");
      }
      return false;
    }
  };

  const UpdateCabRequest = async (
    token: string,
    id: string,
    payload: Partial<CabRequestDetail> | Record<string, any>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/update`;

      let hasilUatVal: string | undefined = undefined;
      if (payload.hasilUat !== undefined && payload.hasilUat !== null) {
        hasilUatVal = Array.isArray(payload.hasilUat) ? payload.hasilUat[0] : String(payload.hasilUat);
      }

      const body: Record<string, any> = {
        id,
        ...payload,
        ...(hasilUatVal !== undefined ? { hasilUat: hasilUatVal } : {}),
        ...(payload.sast !== undefined ? { sastStatus: payload.sast } : {}),
        ...(payload.dokumenArsitektur !== undefined ? { dokumenArsitekturStatus: payload.dokumenArsitektur } : {}),
        ...(payload.kesiapanInfrastruktur !== undefined ? { kesiapanInfraStatus: payload.kesiapanInfrastruktur } : {}),
        ...(payload.sourceAplikasi !== undefined ? { sourceAplikasiStatus: payload.sourceAplikasi } : {}),
        ...(payload.userMatriks !== undefined ? { userMatriksStatus: payload.userMatriks } : {}),
        ...(payload.toolsMonitoring !== undefined ? { toolsMonitoringStatus: payload.toolsMonitoring } : {}),
        ...(payload.securityChecklist !== undefined ? { securityChecklistStatus: payload.securityChecklist } : {}),
        ...(payload.persetujuanItSecurity !== undefined ? { persetujuanItSecStatus: payload.persetujuanItSecurity } : {}),
        ...(payload.petunjukTeknis !== undefined ? { petunjukTeknisStatus: payload.petunjukTeknis } : {}),
      };

      if (Array.isArray(payload.picMigrasi)) {
        body.pics = payload.picMigrasi.map((p: any) => ({
          picType: p.picType || p.type || "INTERNAL_IT",
          userId: p.userId,
          userName: p.userName,
          divisi: p.divisi,
          asalDivisi: p.asalDivisi,
          namaVendor: p.namaVendor,
          alamatVendor: p.alamatVendor,
          namaPicVendor: p.namaPicVendor,
        }));
      }

      if (Array.isArray(payload.committeeCab)) {
        body.committees = payload.committeeCab.map((c: any) => ({
          memberType: c.memberType || c.type || "INTERNAL_IT",
          userId: c.userId,
          userName: c.userName || c.name || c.nama,
          jabatan: c.jabatan,
          divisi: c.divisi || c.asalDivisi,
          asalInstitusi: c.asalInstitusi,
          asalDivisi: c.asalDivisi,
        }));
      }

      if (Array.isArray(payload.applications)) {
        body.applications = payload.applications.map((a: any) => ({
          applicationId: a.applicationId,
          applicationName: a.applicationName,
          aplikasiKategori: a.aplikasiKategori,
          rfcKodeProject: a.rfcKodeProject,
          projectId: a.projectId,
          itspKode: a.itspKode,
        }));
      }

      const response = await axiosInstance.put<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to update CAB request");
      }
      return false;
    }
  };

  const ScheduleCabRequest = async (
    token: string,
    id: string,
    payload: ScheduleCabPayload
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/reschedule`;
      const body = {
        cabRequestId: id,
        revisionReason: "Penjadwalan Sidang CAB",
        schedules: [
          {
            scheduleOrder: 1,
            scheduleType: "CAB_MEETING",
            scheduleTitle: "Sidang Komite CAB",
            startDate: payload.scheduledDate,
            endDate: payload.scheduledEndDate,
            location: payload.cabLocation || "Meeting Room / Hybrid",
            note: payload.note || "Jadwal sidang CAB telah ditetapkan",
          },
        ],
      };
      const response = await axiosInstance.put<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to schedule CAB request");
      }
      return false;
    }
  };

  const RescheduleCabRequest = async (
    token: string,
    payload: RescheduleCabRequestPayload
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/reschedule`;
      const response = await axiosInstance.put<BackendResponseOne<string>>(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to reschedule CAB request");
      }
      return false;
    }
  };

  const BulkScheduleCabRequests = async (
    token: string,
    payload: BulkScheduleCabPayload | BulkScheduleCabItemPayload[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const items = Array.isArray(payload) ? payload : payload.items;
      const url = `${getBaseUrl()}/v1/Cab/bulk-schedule`;
      const body = {
        items: items.map((i) => ({
          id: i.id,
          scheduledDate: i.scheduledDate,
          scheduledEndDate: i.scheduledEndDate,
          cabLocation: i.cabLocation || "Meeting Room / Online",
        })),
      };
      const response = await axiosInstance.post<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to bulk schedule CAB requests");
      }
      return false;
    }
  };

  const ConfirmCabMeeting = async (
    token: string,
    id: string
  ): Promise<boolean> => {
    return UpdateCabRequest(token, id, { status: "IMPLEMENTASI" });
  };

  const SetCabImplementStatus = async (
    token: string,
    id: string,
    isCabDone: "Y" | "N" = "Y"
  ): Promise<boolean> => {
    const status = isCabDone === "Y" ? "IMPLEMENTASI" : "PELAKSANAAN";
    return UpdateCabRequest(token, id, { status });
  };

  const SetCabDoneStatus = SetCabImplementStatus;

  const UpdateCabResult = async (
    token: string,
    id: string,
    payload: UpdateCabResultPayload
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/implementation-result`;
      const body = {
        cabRequestId: id,
        implementationStatus: payload.implementationStatus || "SUCCESS",
        cabResult: payload.cabResult || "",
        cabNotes: payload.cabNotes || "",
        evidenceAttachments: (payload.buktiImplementasi || []).map((b) => ({
          fileName: b.name,
          filePathMinio: b.url,
          attachmentType: "BUKTI_IMPLEMENTASI",
          fileSize: b.size,
          mimeType: b.type,
        })),
      };
      const response = await axiosInstance.post<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to save implementation result");
      }
      return false;
    }
  };

  const CompleteCabRequest = async (
    token: string,
    id: string
  ): Promise<boolean> => {
    return UpdateCabRequest(token, id, { status: "COMPLETED" });
  };

  const BulkCompleteCabRequest = async (
    token: string,
    ids: string[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        ids.map((id) => UpdateCabRequest(token, id, { status: "COMPLETED" }))
      );
      setLoading(false);
      return results.every(Boolean);
    } catch (err) {
      setLoading(false);
      return false;
    }
  };

  const SendToApproval = CompleteCabRequest;
  const BulkSendToApproval = BulkCompleteCabRequest;

  const ActionCabRequest = async (
    token: string,
    id: string,
    payload: ApproveCabPayload
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${getBaseUrl()}/v1/Cab/approve`;
      const body = {
        cabRequestId: id,
        action: payload.action,
        note: payload.note,
      };
      const response = await axiosInstance.post<BackendResponseOne<string>>(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      return response.data?.statusCode === 200;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(errorResponse.message || "Failed to process approval");
      }
      return false;
    }
  };

  const ToggleCabActivity = async (
    token: string,
    requestId: string,
    activityId: string,
    isDone: boolean = true,
    _userName?: string
  ): Promise<boolean> => {
    try {
      const url = `${getBaseUrl()}/v1/Cab/${requestId}/activity/${activityId}`;
      const response = await axiosInstance.patch<BackendResponseOne<string>>(
        url,
        { activityId, isDone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data?.statusCode === 200;
    } catch (err) {
      return false;
    }
  };

  const GetScheduleHistories = async (
    token: string,
    id: string
  ): Promise<CabScheduleHistoryItem[] | null> => {
    try {
      const url = `${getBaseUrl()}/v1/Cab/${id}/schedule-history`;
      const response = await axiosInstance.get<BackendResponseOne<CabScheduleHistoryItem[]>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      return null;
    }
  };

  return {
    loading,
    error,
    ListCabRequests,
    GetCabRequestById,
    GetCabCalendar,
    GetPendingApprovals,
    CreateCabRequest,
    UpdateCabRequest,
    RescheduleCabRequest,
    ScheduleCabRequest,
    BulkScheduleCabRequests,
    ConfirmCabMeeting,
    SetCabImplementStatus,
    SetCabDoneStatus,
    UpdateCabResult,
    CompleteCabRequest,
    BulkCompleteCabRequest,
    SendToApproval,
    BulkSendToApproval,
    ActionCabRequest,
    ToggleCabActivity,
    GetScheduleHistories,
    generateCabRequestNo,
  };
};

export default useCabRequest;
