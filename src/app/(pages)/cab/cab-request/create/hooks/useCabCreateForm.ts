"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useCabRequest from "@/app/services/useCabRequest";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import {
  MAX_SIZE_TABLE,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  CabCategory,
  CabFormData,
  CabHardwareFormData,
  CabHardwareStep1,
  CabHardwareStep2,
  CabHardwareStep3,
  CabHardwareStep4,
  CabSoftwareFormData,
  CabSoftwareStep1,
  CabSoftwareStep2,
  CabSoftwareStep3,
  CabSoftwareStep4,
  CabSoftwareStep5,
} from "@/app/types/cabTypes";

// ─── Initial Values ──────────────────────────────────────────────────────────
const INITIAL_SW_STEP1: CabSoftwareStep1 = {
  dayDate: "",
  applicationId: "",
  applicationName: "",
  rfcKodeProject: "",
  itspKode: "",
  aplikasiKategori: "",
  tipeCab: "",
  appSide: "",
  appSideOther: "",
  applications: [],
  requestedCabDate: "",
  jenisCab: "",
  jenisCabEmergencyAlasan: "",
};

const INITIAL_SW_STEP2: CabSoftwareStep2 = {
  hasilUat: [],
  hasilUatCatatan: "",
  rekomendasiUat: "",
  isHaveMemo: "" as any,
  perihalSementara: "",
  memoDirektoratPengirim: "Direktorat IT & Operasional",
  memoDivisiPengirim: "",
  memoNomor: "",
  memoPerihal: "",
  memoTanggal: "",
  memoTanggalDiterima: "",
  memoDurasiHari: 0,
  tanggalPermohonanMigrasi: "",
};

const INITIAL_SW_STEP3: CabSoftwareStep3 = {
  ceklistMigrasi: "",
  ceklistMigrasiFile: null,
  ceklistMigrasiRundown: "",
  downtime: "",
  downtimeDurasi: "",
  risikoKonflik: "",
  risikoKonflikAplikasi: [],
  instalasiAreaDrc: "",
};

const INITIAL_SW_STEP4: CabSoftwareStep4 = {
  sast: "",
  dokumenArsitektur: "",
  dokumenArsitekturLink: "",
  dokumenArsitekturFile: null,
  kesiapanInfrastruktur: "",
  sourceAplikasi: "",
  userMatriks: "",
  rollbackPlan: "",
  toolsMonitoring: "",
  securityChecklist: "",
  persetujuanItSecurity: "",
  persetujuanItSecurityAlasan: "",
  petunjukTeknis: "",
};

const INITIAL_SW_STEP5: CabSoftwareStep5 = {
  picMigrasi: [],
  committeeCab: [],
};

const INITIAL_HW_STEP1: CabHardwareStep1 = {
  dayDate: "",
  kodeProject: "",
  kodeProjectType: "",
  namaHardware: "",
  deskripsiPerubahan: "",
  dampakOperasional: "",
  dasarUpgrade: "",
  requestedCabDate: "",
  jenisCab: "",
  jenisCabEmergencyAlasan: "",
};

const INITIAL_HW_STEP2: CabHardwareStep2 = {
  tanggalPermohonanImplementasi: "",
  ketersediaanWaktuMigrasiData: "",
  keputusanMigrasi: "",
  kesepakatanWaktuPelaksanaan: "",
};

const INITIAL_HW_STEP3: CabHardwareStep3 = {
  checklist: "",
  checklistFile: null,
  dokumenArsitektur: "",
  dokumenArsitekturFile: null,
  testFungsional: "",
  testFungsionalFile: null,
  rollbackPlan: "",
  rollbackPlanFile: null,
  perangkatMonitoring: "",
  perangkatMonitoringDetail: "",
  perangkatMonitoringFile: null,
  persetujuanItSecurity: "",
  persetujuanItSecurityFile: null,
};

const INITIAL_HW_STEP4: CabHardwareStep4 = {
  picMigrasi: [],
  committeeCab: [],
};

// ─── Step Labels ─────────────────────────────────────────────────────────────
export const SOFTWARE_STEPS = [
  "Identitas Request",
  "Hasil UAT",
  "Migrasi & Kesiapan Teknis",
  "PIC & Komite",
  "Review & Submit",
];

export const HARDWARE_STEPS = [
  "Identitas Request",
  "Jadwal Implementasi",
  "Kesiapan Teknis",
  "PIC & Komite",
  "Review & Submit",
];

// ─── Hook ────────────────────────────────────────────────────────────────────
const useCabCreateForm = () => {
  const router = useRouter();
  const showToast = useToastHelper();
  const { CreateCabRequest, loading } = useCabRequest();
  const { List: ListUsers } = useUsers();
  const { List: ListApps } = useApps();
  const { List: ListRequirements } = useRequirements();
  const { List: ListProjects } = useProjects();

  // ─── Core State ─────────────────────────────────────────────────────────
  const [category, setCategory] = useState<CabCategory | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Software form data
  const [swStep1, setSwStep1] = useState<CabSoftwareStep1>(INITIAL_SW_STEP1);
  const [swStep2, setSwStep2] = useState<CabSoftwareStep2>(INITIAL_SW_STEP2);
  const [swStep3, setSwStep3] = useState<CabSoftwareStep3>(INITIAL_SW_STEP3);
  const [swStep4, setSwStep4] = useState<CabSoftwareStep4>(INITIAL_SW_STEP4);
  const [swStep5, setSwStep5] = useState<CabSoftwareStep5>(INITIAL_SW_STEP5);

  // Hardware form data
  const [hwStep1, setHwStep1] = useState<CabHardwareStep1>(INITIAL_HW_STEP1);
  const [hwStep2, setHwStep2] = useState<CabHardwareStep2>(INITIAL_HW_STEP2);
  const [hwStep3, setHwStep3] = useState<CabHardwareStep3>(INITIAL_HW_STEP3);
  const [hwStep4, setHwStep4] = useState<CabHardwareStep4>(INITIAL_HW_STEP4);

  const totalSteps = category === "SOFTWARE" ? SOFTWARE_STEPS.length : HARDWARE_STEPS.length;
  const isLastStep = currentStep === totalSteps - 1;
  const stepLabels = category === "SOFTWARE" ? SOFTWARE_STEPS : HARDWARE_STEPS;

  // ─── Navigation ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectCategory = (cat: CabCategory) => {
    setCategory(cat);
    setCurrentStep(0);
  };

  const handleResetCategory = () => {
    setCategory(null);
    setCurrentStep(0);
  };

  // ─── Data Fetchers (Real API) ───────────────────────────────────────────
  const fetchUsers = async (search: string, token: string): Promise<UsersResponse[]> => {
    const payload: PaggingListPayload = {
      search,
      limit: 15,
      page: 0,
      filterWhere: [],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const res = await ListUsers(payload, token);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      return res.data as UsersResponse[];
    }
    return [];
  };

  const fetchApplications = async (search: string, token: string): Promise<ApplicationMasterResponse[]> => {
    const payload: PaggingListPayload = {
      search,
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [{ field: "appsStatus", operator: "=", value: "ACTIVE" }],
      fieldOrder: ["appName"],
      orderDir: "asc",
    };
    const res = await ListApps(payload, token);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      return res.data as ApplicationMasterResponse[];
    }
    return [];
  };

  const fetchRequirements = async (search: string, token: string, reqType?: string): Promise<RequirementsResponse[]> => {
    const filterWhere: PaggingListPayload["filterWhere"] = [];
    if (reqType) filterWhere.push({ field: "requirementType", operator: "=", value: reqType });
    const payload: PaggingListPayload = {
      search,
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere,
      fieldOrder: ["reqNumber"],
      orderDir: "desc",
    };
    const res = await ListRequirements(payload, token);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      return res.data as RequirementsResponse[];
    }
    return [];
  };

  const fetchProjects = async (search: string, token: string, reqParentId?: string): Promise<ProjectDataResponse[]> => {
    const filterWhere: PaggingListPayload["filterWhere"] = [];
    if (reqParentId) filterWhere.push({ field: "reqParentId", operator: "=", value: reqParentId });
    const payload: PaggingListPayload = {
      search,
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere,
      fieldOrder: ["projectCode"],
      orderDir: "desc",
    };
    const res = await ListProjects(payload, token);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      return res.data as ProjectDataResponse[];
    }
    return [];
  };

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (isDraft: boolean) => {
    const token = localStorage.getItem("tokenData") || "";

    let formData: CabFormData;
    if (category === "SOFTWARE") {
      formData = { category: "SOFTWARE", step1: swStep1, step2: swStep2, step3: swStep3, step4: swStep4, step5: swStep5 };
    } else {
      formData = { category: "HARDWARE", step1: hwStep1, step2: hwStep2, step3: hwStep3, step4: hwStep4 };
    }

    const success = await CreateCabRequest(token, formData, isDraft);
    if (success) {
      showToast({
        description: isDraft ? "Draft berhasil disimpan" : "Request berhasil disubmit",
        statusToast: "success",
      });
      router.push("/cab/cab-request");
    }
  };

  return {
    // State
    category,
    currentStep,
    totalSteps,
    isLastStep,
    stepLabels,
    loading,

    // Software step data + setters
    swStep1, setSwStep1,
    swStep2, setSwStep2,
    swStep3, setSwStep3,
    swStep4, setSwStep4,
    swStep5, setSwStep5,

    // Hardware step data + setters
    hwStep1, setHwStep1,
    hwStep2, setHwStep2,
    hwStep3, setHwStep3,
    hwStep4, setHwStep4,

    // Actions
    handleNext,
    handleBack,
    handleSelectCategory,
    handleResetCategory,
    handleSubmit,

    // Data fetchers
    fetchUsers,
    fetchApplications,
    fetchRequirements,
    fetchProjects,
  };
};

export default useCabCreateForm;
