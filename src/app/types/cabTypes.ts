// src/app/types/cabTypes.ts

export type CabStatus =
  | "DRAFT"
  | "PENGAJUAN"
  | "REQUEST"
  | "PENJADWALAN"
  | "SCHEDULED"
  | "PELAKSANAAN"
  | "CONFIRM"
  | "IMPLEMENTASI"
  | "IMPLEMENT"
  | "SEND TO APPROVAL"
  | "WAITING APPROVAL"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELED"
  | "SUBMITTED"
  | "WAITING APPROVE"
  | "APPROVED";

export type CabRequestType =
  | "NEW FEATURE"
  | "ENHANCEMENT"
  | "BUG FIXING"
  | "TOOLS"
  | "DEPLOYMENT"
  | "CHANGE REQUEST"
  | "INFRASTRUCTURE"
  | "MAINTENANCE"
  | "HOTFIX"
  | "EMERGENCY CHANGE"
  | string;

export type CabTipeCab = "NEW FEATURE" | "ENHANCEMENT" | "BUG FIXING" | "TOOLS";

export type CabPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ─── Activity Item (Checklist sebelum dikirim ke approval) ────────────────────
export interface CabActivityItem {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  isDone: boolean;
  doneAt?: string | null;
  doneBy?: string | null;
  isPendingInitial?: boolean;
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
  category?: "SOFTWARE" | "HARDWARE" | string;
  priority?: CabPriority | string;
  isCabDone?: "Y" | "N" | null;
  cabResult?: string;
  cabNotes?: string;
  cabLocation?: string;
  tanggalPermohonanMigrasi?: string | null;
  tanggalImplementasi?: string | null;
  rekomendasiUat?: "REKOMENDASI_MIGRASI" | "PENGUJIAN_ULANG" | string;
  rekomendasiMigrasi?: "YA" | "TIDAK" | "Y" | "N" | boolean | string;
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

  // ─── Extended fields from Create Request ───
  category?: CabCategory;
  tipeCab?: CabTipeCab | string;
  appSide?: "WEB" | "APP" | "DB" | "OTHER" | string;
  appSideOther?: string;
  applicationId?: string;
  applicationName?: string;
  applications?: CabSoftwareApplicationItem[];
  rfcKodeProject?: string;
  itspKode?: string;
  aplikasiKategori?: string;
  jenisCab?: CabJenisCab | "";
  jenisCabEmergencyAlasan?: string;
  
  // UAT & Implementation Step
  hasilUat?: ("BERHASIL_BAIK" | "BERHASIL_CATATAN" | "TIDAK_BERHASIL")[];
  hasilUatCatatan?: string;
  rekomendasiUat?: "REKOMENDASI_MIGRASI" | "PENGUJIAN_ULANG" | "" | string;
  isHaveMemo?: "Y" | "N";
  perihalSementara?: string;
  memoDirektoratPengirim?: string;
  memoDivisiPengirim?: string;
  memoNomor?: string;
  memoPerihal?: string;
  memoTanggal?: string;
  memoTanggalDiterima?: string;
  memoDurasiHari?: number;
  tanggalPermohonanMigrasi?: string | null;
  
  // Downtime & Execution Step
  ceklistMigrasi?: "ADA" | "TIDAK" | "TIDAK_ADA" | "";
  ceklistMigrasiFile?: string | null;
  ceklistMigrasiRundown?: string;
  downtime?: "TIDAK" | "ADA" | "";
  downtimeDurasi?: string;
  risikoKonflik?: "ADA" | "TIDAK_ADA" | "YA" | "TIDAK" | "";
  risikoKonflikAplikasi?: string[];
  instalasiAreaDrc?: "YA" | "TIDAK" | "";
  
  // Readiness & Security Assessment Step
  sast?: "ADA" | "TIDAK" | "";
  sastFile?: string | null;
  dokumenArsitektur?: "ADA" | "TIDAK" | "TIDAK_ADA" | "";
  dokumenArsitekturLink?: string;
  dokumenArsitekturFile?: string | null;
  kesiapanInfrastruktur?: "YA" | "TIDAK" | "";
  kesiapanInfrastrukturFile?: string | null;
  sourceAplikasi?: "ADA" | "TIDAK" | "";
  sourceAplikasiFile?: string | null;
  userMatriks?: "ADA" | "TIDAK" | "";
  userMatriksFile?: string | null;
  toolsMonitoring?: "ADA" | "TIDAK_ADA" | "";
  toolsMonitoringFile?: string | null;
  securityChecklist?: "ADA" | "TIDAK_ADA" | "";
  securityChecklistFile?: string | null;
  persetujuanItSecurity?: "YA" | "TIDAK" | "";
  persetujuanItSecurityAlasan?: string;
  persetujuanItSecurityFile?: string | null;
  petunjukTeknis?: "ADA" | "TIDAK_ADA" | "";
  petunjukTeknisFile?: string | null;
  
  // Hardware specific fields
  namaHardware?: string;
  deskripsiPerubahan?: string;
  dampakOperasional?: string;
  dasarUpgrade?: string;
  checklist?: "ADA" | "TIDAK_ADA" | "TIDAK" | "";
  checklistFile?: string | null;
  testFungsional?: "ADA" | "TIDAK_ADA" | "TIDAK" | "";
  testFungsionalFile?: string | null;
  perangkatMonitoring?: "YA" | "TIDAK" | "";
  perangkatMonitoringFile?: string | null;
  // Scheduler Commitment & Migration Decision (Step 2 / SCHEDULED stage)
  pir?: "ADA" | "TIDAK_ADA" | "YA" | "TIDAK" | string;
  ketersediaanWaktuMigrasiDc?: string;
  keputusanMigrasi?: "YA" | "TIDAK" | "";
  kesepakatanWaktuPelaksanaan?: string;
  kesepakatanWaktuPelaksanaanMigrasi?: string;
  catatanKomitmen?: string;

  // PIC & Committee
  picMigrasi?: CabPicInternalIT[] | CabPic | null;
  committeeCab?: CabCommitteeMember[];
}

// ─── Approval Step ────────────────────────────────────────────────────────────
export interface CabApprovalStep {
  id: string;
  stepOrder: number;
  approverName: string;
  approverRole: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "WAITING APPROVAL";
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

export interface BulkScheduleCabItemPayload {
  id: string;
  scheduledDate: string;
  scheduledEndDate: string;
  cabLocation?: string;
}

export interface BulkScheduleCabPayload {
  items: BulkScheduleCabItemPayload[];
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

// ─── Software Application Item (Multiple Applications per Request) ───────────
export interface CabSoftwareApplicationItem {
  id?: string;
  applicationId: string;
  applicationName: string;
  aplikasiKategori?: string;
  rfcKodeProject: string;
  projectId?: string;
  rfcKodeProjectLabel?: string;
  itspKode?: string;
}

// ─── Software Step Interfaces ────────────────────────────────────────────────
export interface CabSoftwareStep1 {
  dayDate: string;
  applicationId: string;
  applicationName: string;
  rfcKodeProject: string;
  projectId?: string;
  itspKode: string;
  aplikasiKategori: string;
  tipeCab?: CabTipeCab | string;
  appSide?: "WEB" | "APP" | "DB" | "OTHER" | string;
  appSideOther?: string;
  applications?: CabSoftwareApplicationItem[];
  requestedCabDate: string;
  jenisCab: CabJenisCab | "";
  jenisCabEmergencyAlasan?: string;
}

export interface CabSoftwareStep2 {
  hasilUat: ("BERHASIL_BAIK" | "BERHASIL_CATATAN" | "TIDAK_BERHASIL")[];
  hasilUatCatatan?: string;
  rekomendasiUat: "REKOMENDASI_MIGRASI" | "PENGUJIAN_ULANG" | "";
  isHaveMemo?: "Y" | "N";
  perihalSementara?: string;
  memoDirektoratPengirim?: string;
  memoDivisiPengirim?: string;
  memoNomor?: string;
  memoPerihal?: string;
  memoTanggal?: string;
  memoTanggalDiterima?: string;
  memoDurasiHari?: number;
  tanggalPermohonanMigrasi?: string;
}

export interface CabSoftwareStep3 {
  ceklistMigrasi: "ADA" | "TIDAK" | "";
  ceklistMigrasiFile?: File | string | null;
  ceklistMigrasiRundown: string;
  downtime: "TIDAK" | "ADA" | "";
  downtimeDurasi?: string;
  risikoKonflik: "ADA" | "TIDAK_ADA" | "YA" | "TIDAK" | "";
  risikoKonflikAplikasi?: string[];
  instalasiAreaDrc: "YA" | "TIDAK" | "";
}

export interface CabSoftwareStep4 {
  sast: "ADA" | "TIDAK" | "";
  sastLink?: string;
  sastFile?: File | string | null;
  dokumenArsitektur: "ADA" | "TIDAK" | "";
  dokumenArsitekturLink?: string;
  dokumenArsitekturFile?: File | string | null;
  kesiapanInfrastruktur: "YA" | "TIDAK" | "";
  kesiapanInfrastrukturFile?: File | string | null;
  sourceAplikasi: "ADA" | "TIDAK" | "";
  sourceAplikasiFile?: File | string | null;
  userMatriks: "ADA" | "TIDAK" | "";
  userMatriksFile?: File | string | null;
  rollbackPlan: "ADA" | "TIDAK_ADA" | "";
  rollbackPlanFile?: File | string | null;
  toolsMonitoring: "ADA" | "TIDAK_ADA" | "";
  toolsMonitoringFile?: File | string | null;
  securityChecklist: "ADA" | "TIDAK_ADA" | "";
  securityChecklistFile?: File | string | null;
  persetujuanItSecurity: "YA" | "TIDAK" | "";
  persetujuanItSecurityAlasan?: string;
  persetujuanItSecurityFile?: File | string | null;
  petunjukTeknis: "ADA" | "TIDAK_ADA" | "";
  petunjukTeknisFile?: File | string | null;
}

export interface CabSoftwareStep5 {
  picMigrasi: CabPicInternalIT[];
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
  projectId?: string;
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
  checklistFile?: File | string | null;
  dokumenArsitektur: "ADA" | "TIDAK_ADA" | "";
  dokumenArsitekturFile?: File | string | null;
  testFungsional: "ADA" | "TIDAK_ADA" | "";
  testFungsionalFile?: File | string | null;
  rollbackPlan: "ADA" | "TIDAK_ADA" | "";
  rollbackPlanFile?: File | string | null;
  perangkatMonitoring: "YA" | "TIDAK" | "";
  perangkatMonitoringDetail?: string;
  perangkatMonitoringFile?: File | string | null;
  persetujuanItSecurity: "YA" | "TIDAK" | "";
  persetujuanItSecurityFile?: File | string | null;
}

export interface CabHardwareStep4 {
  picMigrasi: CabPicInternalIT[];
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
