// src/app/types/cabTypes.ts

export type CabStatus =
  | "DRAFT"
  | "REQUEST"
  | "WAITING APPROVE"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED";

export type CabRequestType =
  | "DEPLOYMENT"
  | "CHANGE REQUEST"
  | "INFRASTRUCTURE"
  | "MAINTENANCE"
  | "HOTFIX"
  | "EMERGENCY CHANGE";

export type CabPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ─── Activity Item (Checklist sebelum dikirim ke approval) ────────────────────
export interface CabActivityItem {
  id: string;
  label: string;
  description?: string;
  isDone: boolean;
  doneAt?: string | null;
  doneBy?: string | null;
}

// ─── List Item (untuk tabel & kalender) ──────────────────────────────────────
export interface CabRequestItem {
  id: string;
  requestNo: string;
  requestTitle: string;
  requestType: CabRequestType | string;
  requestDate: string;
  targetDate: string;
  requestedCabDate: string | null;
  scheduledDate: string | null;
  scheduledEndDate: string | null;
  status: CabStatus | string;
  requesterName: string;
  approverName: string;
  projectName: string;
  priority?: CabPriority | string;
}

// ─── Detail (untuk halaman detail) ───────────────────────────────────────────
export interface CabRequestDetail extends CabRequestItem {
  requesterEmail: string;
  description: string;
  impactAnalysis: string;
  rollbackPlan: string;
  cabLocation?: string;
  cabResult?: string;
  cabNotes?: string;
  implementationStatus?: "SUCCESS" | "FAILED" | "PARTIAL" | null;
  approvalHistory: CabApprovalStep[];
  checklistItems?: CabChecklistItem[];
  activityChecklist?: CabActivityItem[];
}

// ─── Approval Step ────────────────────────────────────────────────────────────
export interface CabApprovalStep {
  id: string;
  stepOrder: number;
  approverName: string;
  approverRole: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  actionDate: string | null;
  note: string | null;
}

// ─── Checklist Item (placeholder) ────────────────────────────────────────────
export interface CabChecklistItem {
  id: string;
  itemKey: string;
  itemLabel: string;
  itemValue: string | boolean | null;
  isRequired: boolean;
  inputType: "text" | "textarea" | "boolean" | "select";
  options?: string[];
}

// ─── Payloads ────────────────────────────────────────────────────────────────
export interface CreateCabRequestPayload {
  requestTitle: string;
  requestType: string;
  priority: string;
  targetDate: string;
  projectName: string;
  description: string;
  impactAnalysis: string;
  rollbackPlan: string;
}

export interface ScheduleCabPayload {
  scheduledDate: string;
  scheduledEndDate: string;
  cabLocation?: string;
}

export interface UpdateCabResultPayload {
  cabResult: string;
  cabNotes: string;
  implementationStatus: "SUCCESS" | "FAILED" | "PARTIAL";
}

export interface ApproveCabPayload {
  action: "APPROVE" | "REJECT";
  note: string;
}

// ─── CAB Create Form — Category & Jenis ──────────────────────────────────────
export type CabCategory = "SOFTWARE" | "HARDWARE";
export type CabJenisCab = "WEEKLY" | "EMERGENCY";

// ─── PIC Types ───────────────────────────────────────────────────────────────
export interface CabPicInternalIT {
  type: "INTERNAL_IT";
  userId: string;
  userName: string;
  divisi: string;
}
export interface CabPicInternalBJB {
  type: "INTERNAL_BJB";
  userId: string;
  userName: string;
  asalDivisi: string;
}
export interface CabPicVendor {
  type: "VENDOR";
  namaVendor: string;
  alamatVendor: string;
  namaPicVendor: string;
}
export type CabPic = CabPicInternalIT | CabPicInternalBJB | CabPicVendor;

// ─── Committee ───────────────────────────────────────────────────────────────
export interface CabCommitteeMember {
  type: "INTERNAL_IT" | "INTERNAL_BJB" | "EXTERNAL";
  userId?: string;
  userName: string;
  asalInstitusi?: string;
  asalDivisi?: string;
}

// ─── Software Step Interfaces ────────────────────────────────────────────────
export interface CabSoftwareStep1 {
  dayDate: string;
  applicationId: string;
  applicationName: string;
  rfcKodeProject: string;
  itspKode: string;
  aplikasiKategori: string;
  requestedCabDate: string;
  jenisCab: CabJenisCab | "";
  jenisCabEmergencyAlasan?: string;
}

export interface CabSoftwareStep2 {
  hasilUat: ("BERHASIL_BAIK" | "BERHASIL_CATATAN" | "TIDAK_BERHASIL")[];
  rekomendasiUat: "REKOMENDASI_MIGRASI" | "PENGUJIAN_ULANG" | "";
  tanggalPermohonanMigrasi?: string;
}

export interface CabSoftwareStep3 {
  ceklistMigrasiRundown: string;
  downtime: "TIDAK" | "ADA" | "";
  downtimeDurasi?: string;
  risikoKonflik: "ADA" | "TIDAK_ADA" | "";
  instalasiAreaDrc: "YA" | "TIDAK" | "";
}

export interface CabSoftwareStep4 {
  sast: "ADA" | "TIDAK" | "";
  dokumenArsitektur: "ADA" | "TIDAK" | "";
  dokumenArsitekturLink?: string;
  dokumenArsitekturFile?: File | null;
  kesiapanInfrastruktur: "YA" | "TIDAK" | "";
  sourceAplikasi: "ADA" | "TIDAK" | "";
  userMatriks: "ADA" | "TIDAK" | "";
  rollbackPlan: "ADA" | "TIDAK_ADA" | "";
  toolsMonitoring: "ADA" | "TIDAK_ADA" | "";
  securityChecklist: "ADA" | "TIDAK_ADA" | "";
  persetujuanItSecurity: "YA" | "TIDAK" | "";
  persetujuanItSecurityAlasan?: string;
  petunjukTeknis: "ADA" | "TIDAK_ADA" | "";
}

export interface CabSoftwareStep5 {
  picMigrasi: CabPic | null;
  committeeCab: CabCommitteeMember[];
}

export interface CabSoftwareFormData {
  category: "SOFTWARE";
  step1: CabSoftwareStep1;
  step2: CabSoftwareStep2;
  step3: CabSoftwareStep3;
  step4: CabSoftwareStep4;
  step5: CabSoftwareStep5;
}

// ─── Hardware Step Interfaces ────────────────────────────────────────────────
export interface CabHardwareStep1 {
  dayDate: string;
  kodeProject: string;
  kodeProjectType: "BRD" | "RFC" | "PROCUREMENT" | "";
  namaHardware: string;
  deskripsiPerubahan: string;
  dampakOperasional: string;
  dasarUpgrade: string;
  requestedCabDate: string;
  jenisCab: CabJenisCab | "";
  jenisCabEmergencyAlasan?: string;
}

export interface CabHardwareStep2 {
  tanggalPermohonanImplementasi: string;
  ketersediaanWaktuMigrasiData: string;
  keputusanMigrasi: "YA" | "TIDAK" | "";
  kesepakatanWaktuPelaksanaan: string;
}

export interface CabHardwareStep3 {
  checklist: "ADA" | "TIDAK_ADA" | "";
  dokumenArsitektur: "ADA" | "TIDAK_ADA" | "";
  testFungsional: "ADA" | "TIDAK_ADA" | "";
  rollbackPlan: "ADA" | "TIDAK_ADA" | "";
  perangkatMonitoring: "YA" | "TIDAK" | "";
  perangkatMonitoringDetail?: string;
  persetujuanItSecurity: "YA" | "TIDAK" | "";
}

export interface CabHardwareStep4 {
  picMigrasi: CabPic | null;
  committeeCab: CabCommitteeMember[];
}

export interface CabHardwareFormData {
  category: "HARDWARE";
  step1: CabHardwareStep1;
  step2: CabHardwareStep2;
  step3: CabHardwareStep3;
  step4: CabHardwareStep4;
}

export type CabFormData = CabSoftwareFormData | CabHardwareFormData;

// ─── FullCalendar Event Shape ─────────────────────────────────────────────────
export interface CabCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    requestNo: string;
    requestType: string;
    priority: string;
    status: CabStatus | string;
    requesterName: string;
    projectName: string;
  };
}
