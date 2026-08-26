"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiEdit2,
  FiFileText,
  FiInfo,
  FiLayers,
  FiList,
  FiMapPin,
  FiPlus,
  FiRefreshCcw,
  FiSave,
  FiSend,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { CreatableSelect, Select as ChakraReactSelect } from "chakra-react-select";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { StatusBadge } from "@/app/components/StatusBadge";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useCabRequest from "@/app/services/useCabRequest";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { MAX_SIZE_TABLE, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { CabCommitteeMember, CabPicInternalIT, CabRequestDetail, CabSoftwareApplicationItem } from "@/app/types/cabTypes";
import { getDynamicCabActivities } from "@/app/json/cabRequestMock";
import PicMigrasiField from "../create/components/PicMigrasiField";
import CommitteeCabField from "../create/components/CommitteeCabField";

interface ProjectOption {
  label: string;
  value: string;
  projectId?: string;
  type?: "BRD" | "RFC" | "PROJECT";
}

type MockRole = "maker" | "scheduler" | "approver";

export const CAB_LIFECYCLE_STAGES = [
  { stage: 1, key: "PENGAJUAN", label: "Pengajuan", role: "Maker", desc: "Pengajuan Permohonan" },
  { stage: 2, key: "PELAKSANAAN", label: "Pelaksanaan", role: "Scheduler & Tim", desc: "Pelaksanaan Sidang CAB" },
  { stage: 3, key: "IMPLEMENTASI", label: "Implementasi", role: "Scheduler", desc: "Evaluasi & Checklist Implementasi" },
  { stage: 4, key: "SEND TO APPROVAL", label: "Send to Approval", role: "Scheduler", desc: "Menunggu Persetujuan" },
  { stage: 5, key: "COMPLETED", label: "Completed", role: "Approver", desc: "Keputusan Final" },
];

export const getStageIndex = (status?: string): number => {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "PENGAJUAN":
    case "REQUEST":
      return 1;
    case "PELAKSANAAN":
    case "CONFIRM":
    case "PENJADWALAN":
    case "SCHEDULED":
    case "SUBMITTED":
      return 2;
    case "IMPLEMENTASI":
    case "IMPLEMENT":
      return 3;
    case "SEND TO APPROVAL":
    case "SEND_TO_APPROVAL":
    case "WAITING APPROVAL":
    case "WAITING APPROVE":
    case "PENDING_APPROVAL":
    case "IN_REVIEW":
      return 4;
    case "COMPLETED":
    case "APPROVED":
    case "REJECTED":
    case "CANCELED":
      return 5;
    default:
      return 1;
  }
};

export const getStep2Title = (status?: string): string => {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "PENGAJUAN":
    case "REQUEST":
      return "Penetapan Jadwal";
    case "PELAKSANAAN":
    case "CONFIRM":
    case "PENJADWALAN":
    case "SCHEDULED":
    case "SUBMITTED":
      return "Pelaksanaan Rapat";
    case "IMPLEMENTASI":
    case "IMPLEMENT":
      return "Evaluasi & Checklist Implementasi";
    case "SEND TO APPROVAL":
    case "SEND_TO_APPROVAL":
    case "WAITING APPROVAL":
    case "WAITING APPROVE":
    case "PENDING_APPROVAL":
    case "IN_REVIEW":
      return "Keputusan Persetujuan";
    case "COMPLETED":
    case "APPROVED":
      return "Hasil Persetujuan";
    case "REJECTED":
      return "Hasil Penolakan";
    default:
      return "Aksi Tahapan";
  }
};

export const getStep2Desc = (status?: string): string => {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "PENGAJUAN":
    case "REQUEST":
      return "Penetapan jadwal sidang & link meeting oleh Scheduler";
    case "PELAKSANAAN":
    case "CONFIRM":
    case "PENJADWALAN":
    case "SCHEDULED":
    case "SUBMITTED":
      return "Pencatatan kesepakatan & komitmen pelaksanaan migrasi bersama tim";
    case "IMPLEMENTASI":
    case "IMPLEMENT":
      return "Evaluasi hasil sidang CAB, verifikasi checklist & pengiriman ke Approver";
    case "SEND TO APPROVAL":
    case "SEND_TO_APPROVAL":
    case "WAITING APPROVAL":
    case "WAITING APPROVE":
    case "PENDING_APPROVAL":
    case "IN_REVIEW":
      return "Tinjauan berkas & keputusan resmi Approver";
    case "COMPLETED":
    case "APPROVED":
      return "Permohonan CAB telah resmi disetujui & selesai";
    case "REJECTED":
      return "Permohonan CAB telah ditolak oleh Approver";
    default:
      return "Detail dan eksekusi tindakan tahapan CAB";
  }
};

// ─── Component ───────────────────────────────────────────────────────────────
const CabRequestDetailView = () => {
  useDocumentTitle("CAB Request Detail");
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const showToast = useToastHelper();
  const { List: ListUsers } = useUsers();
  const { List: ListApps } = useApps();
  const { List: ListRequirements } = useRequirements();
  const { List: ListProjects } = useProjects();
  const {
    GetCabRequestById,
    ScheduleCabRequest,
    SetCabDoneStatus,
    UpdateCabRequest,
    UpdateCabResult,
    SendToApproval,
    ActionCabRequest,
    ConfirmCabMeeting,
    SetCabImplementStatus,
    ToggleCabActivity,
    loading,
  } = useCabRequest();

  // Master App and Project options for editing
  const [appList, setAppList] = useState<ApplicationMasterResponse[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [globalProjectOptions, setGlobalProjectOptions] = useState<ProjectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [appProjectMap, setAppProjectMap] = useState<Record<string, ProjectOption[]>>({});

  const loadAppsAndProjects = async (token: string) => {
    if (!token) return;
    setAppLoading(true);
    setProjectLoading(true);
    try {
      const appPayload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [{ field: "appsStatus", operator: "=", value: "ACTIVE" }],
        fieldOrder: ["appName"],
        orderDir: "asc",
      };
      const brdPayload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [{ field: "requirementType", operator: "=", value: "BRD" }],
        fieldOrder: ["reqNumber"],
        orderDir: "desc",
      };
      const rfcPayload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [{ field: "requirementType", operator: "=", value: "RFC" }],
        fieldOrder: ["reqNumber"],
        orderDir: "desc",
      };
      const projPayload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["projectCode"],
        orderDir: "desc",
      };

      const [appsRes, brdRes, rfcRes, projRes] = await Promise.all([
        ListApps(appPayload, token),
        ListRequirements(brdPayload, token),
        ListRequirements(rfcPayload, token),
        ListProjects(projPayload, token),
      ]);

      if (appsRes?.statusCode === RES_CODE_OK && appsRes.data) {
        setAppList(appsRes.data as ApplicationMasterResponse[]);
      }

      const pOptions: ProjectOption[] = [];
      if (brdRes?.statusCode === RES_CODE_OK && brdRes.data) {
        (brdRes.data as RequirementsResponse[]).forEach((r) =>
          pOptions.push({
            label: `[BRD] ${r.reqNumber} — ${r.reqNarative || r.appInitialName || "BRD Document"}`,
            value: r.reqNumber,
            projectId: r.id || r.reqNumber,
            type: "BRD",
          })
        );
      }
      if (rfcRes?.statusCode === RES_CODE_OK && rfcRes.data) {
        (rfcRes.data as RequirementsResponse[]).forEach((r) =>
          pOptions.push({
            label: `[RFC] ${r.reqNumber} — ${r.reqNarative || r.appInitialName || "RFC Change Request"}`,
            value: r.reqNumber,
            projectId: r.id || r.reqNumber,
            type: "RFC",
          })
        );
      }
      if (projRes?.statusCode === RES_CODE_OK && projRes.data) {
        (projRes.data as ProjectDataResponse[]).forEach((p) =>
          pOptions.push({
            label: `[PROJECT] ${p.projectCode} — ${p.projectName}`,
            value: p.projectCode,
            projectId: p.id,
            type: "PROJECT",
          })
        );
      }
      setGlobalProjectOptions(pOptions);
    } catch (e) {
      console.error("Failed loading master apps and projects", e);
    } finally {
      setAppLoading(false);
      setProjectLoading(false);
    }
  };

  const fetchAppSpecificProjects = async (appId: string, reqParentId?: string) => {
    if (!tokenData || !reqParentId || appProjectMap[appId]) return;
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [{ field: "reqParentId", operator: "=", value: reqParentId }],
        fieldOrder: ["projectCode"],
        orderDir: "desc",
      };
      const res = await ListProjects(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        const mapped: ProjectOption[] = (res.data as ProjectDataResponse[]).map((p) => ({
          label: `[PROJECT] ${p.projectCode} — ${p.projectName}`,
          value: p.projectCode,
          projectId: p.id,
          type: "PROJECT",
        }));
        setAppProjectMap((prev) => ({ ...prev, [appId]: mapped }));
      }
    } catch (e) {
      console.error("Error fetching app-specific projects", e);
    }
  };

  const getProjectOptionsForRow = (appId?: string): ProjectOption[] => {
    if (!appId) return globalProjectOptions;
    const specific = appProjectMap[appId];
    if (specific && specific.length > 0) {
      const specificValues = new Set(specific.map((s) => s.value));
      const rest = globalProjectOptions.filter((g) => !specificValues.has(g.value));
      return [...specific, ...rest];
    }
    return globalProjectOptions;
  };

  const appOptions = appList.map((a) => ({
    label: `${a.appShortName} — ${a.appName}`,
    value: a.id,
    data: a,
  }));

  const filterAppOption = (candidate: any, input: string) => {
    if (!input) return true;
    const search = input.toLowerCase().trim();
    const app = candidate.data?.data;
    const label = (candidate.label || "").toLowerCase();
    const shortName = (app?.appShortName || "").toLowerCase();
    const appName = (app?.appName || "").toLowerCase();
    const appInitial = (app?.appInitialName || "").toLowerCase();
    const appTypes = (app?.appTypes || "").toLowerCase();
    const appCode = (app?.appCode || "").toLowerCase();
    return (
      label.includes(search) ||
      shortName.includes(search) ||
      appName.includes(search) ||
      appInitial.includes(search) ||
      appTypes.includes(search) ||
      appCode.includes(search)
    );
  };

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      bg: colorMode === "dark" ? "gray.700" : "white",
      borderColor: colorMode === "dark" ? "gray.600" : "gray.200",
      rounded: "md",
      minHeight: "36px",
      fontSize: "xs",
    }),
    menu: (provided: any) => ({
      ...provided,
      bg: colorMode === "dark" ? "gray.700" : "white",
      zIndex: 9999,
    }),
  };

  const fetchUsers = async (search: string, token: string): Promise<UsersResponse[]> => {
    const payload = {
      search,
      filterWhere: [],
      limit: 30,
      page: 0,
      fieldOrder: ["nama"],
      orderDir: "asc" as const,
    };
    const res = await ListUsers(payload, token);
    if (res && (res.statusCode === 200 || (res.statusCode as any) === "200") && res.data) {
      return res.data as UsersResponse[];
    }
    return [];
  };

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Role switcher
  const [mockRole, setMockRole] = useState<MockRole>("scheduler");
  const canMake = mockRole === "maker";
  const canSchedule = mockRole === "scheduler";
  const canApprove = mockRole === "approver";

  // Data
  const [Data, setData] = useState<CabRequestDetail | null>(null);
  const [IsLoading, setIsLoading] = useState(true);

  // 2-Stepper navigation state (1 = Formulir Permohonan, 2 = Detail & Aksi Tahapan)
  const [activeDetailStep, setActiveDetailStep] = useState<1 | 2>(1);

  // Edit Request form (for scheduler in WAITING APPROVE status to modify any created fields)
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [requestEditForm, setRequestEditForm] = useState({
    requestTitle: "",
    requestType: "DEPLOYMENT",
    applicationId: "",
    applicationName: "",
    applications: [] as CabSoftwareApplicationItem[],
    projectName: "",
    targetDate: "",
    rfcKodeProject: "",
    itspKode: "",
    aplikasiKategori: "",
    jenisCab: "WEEKLY",
    jenisCabEmergencyAlasan: "",
    description: "",
    impactAnalysis: "",
    rollbackPlan: "",
    hasilUat: "BERHASIL_BAIK",
    hasilUatCatatan: "",
    rekomendasiUat: "REKOMENDASI_MIGRASI",
    isHaveMemo: "Y",
    perihalSementara: "",
    memoDirektoratPengirim: "",
    memoDivisiPengirim: "",
    memoNomor: "",
    memoPerihal: "",
    memoTanggal: "",
    memoTanggalDiterima: "",
    tanggalPermohonanMigrasi: "",
    downtime: "ADA",
    downtimeDurasi: "60 Menit",
    risikoKonflik: "TIDAK_ADA",
    risikoKonflikAplikasi: [] as string[],
    instalasiAreaDrc: "YA",
    ceklistMigrasi: "ADA",
    ceklistMigrasiRundown: "",
    sast: "ADA",
    dokumenArsitektur: "ADA",
    kesiapanInfrastruktur: "YA",
    sourceAplikasi: "ADA",
    userMatriks: "ADA",
    toolsMonitoring: "ADA",
    securityChecklist: "ADA",
    persetujuanItSecurity: "YA",
    petunjukTeknis: "ADA",
    picMigrasi: [] as CabPicInternalIT[],
    committeeCab: [] as CabCommitteeMember[],
  });

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    scheduledEndDate: "",
    cabLocation: "",
  });

  // Commitment & Migration Decision form (Scheduler - Step 2 / SCHEDULED status)
  const [commitmentForm, setCommitmentForm] = useState({
    pir: "",
    ketersediaanWaktuMigrasiDc: "",
    keputusanMigrasi: "YA" as "YA" | "TIDAK" | "",
    kesepakatanWaktuPelaksanaanMigrasi: "",
    catatanKomitmen: "",
  });
  const [isSavingCommitment, setIsSavingCommitment] = useState(false);

  // Result form
  const [resultForm, setResultForm] = useState({
    cabResult: "",
    cabNotes: "",
    implementationStatus: "",
  });

  // Approval
  const [approvalNote, setApprovalNote] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    if (token) {
      setTokenData(token);
      loadAppsAndProjects(token);
    }
  }, []);

  useEffect(() => {
    if (!DataAuth || !requestId || !tokenData) return;
    loadDetail();
  }, [DataAuth, requestId, tokenData]);

  const mapDetailToEditForm = (d: CabRequestDetail) => {
    const rawApps: CabSoftwareApplicationItem[] =
      d.applications && d.applications.length > 0
        ? d.applications
        : (d.applicationName || d.projectName)
          ? [
              {
                id: "app-main-0",
                applicationId: d.applicationId || "app-001",
                applicationName: d.applicationName || d.projectName || "",
                aplikasiKategori: d.aplikasiKategori || "Transaksional",
                rfcKodeProject: d.rfcKodeProject || "RFC-2026-088",
                itspKode: d.itspKode || "ITSP-BJB-990",
              },
            ]
          : [];

    return {
      requestTitle: d.requestTitle || "",
      requestType: d.requestType || "DEPLOYMENT",
      applicationId: d.applicationId || rawApps[0]?.applicationId || "app-001",
      applicationName: d.applicationName || rawApps[0]?.applicationName || d.projectName || "",
      applications: rawApps,
      projectName: d.projectName || rawApps[0]?.applicationName || "",
      targetDate: d.targetDate ? d.targetDate.slice(0, 10) : "",
      rfcKodeProject: d.rfcKodeProject || rawApps[0]?.rfcKodeProject || "RFC-2026-088",
      itspKode: d.itspKode || rawApps[0]?.itspKode || "ITSP-BJB-990",
      aplikasiKategori: d.aplikasiKategori || rawApps[0]?.aplikasiKategori || "Transaksional",
      jenisCab: d.jenisCab || "WEEKLY",
      jenisCabEmergencyAlasan: d.jenisCabEmergencyAlasan || "",
      description: d.description || "",
      impactAnalysis: d.impactAnalysis || "",
      rollbackPlan: d.rollbackPlan || "",
      hasilUat: (Array.isArray(d.hasilUat) ? d.hasilUat[0] : (d.hasilUat as any)) || "BERHASIL_BAIK",
      hasilUatCatatan: d.hasilUatCatatan || "",
      rekomendasiUat: d.rekomendasiUat || "REKOMENDASI_MIGRASI",
      isHaveMemo: d.isHaveMemo || (d.memoNomor ? "Y" : "Y"),
      perihalSementara: d.perihalSementara || d.memoPerihal || "",
      memoDirektoratPengirim: d.memoDirektoratPengirim || "Direktorat IT & Operasional",
      memoDivisiPengirim: d.memoDivisiPengirim || "Divisi IT Digital Banking",
      memoNomor: d.memoNomor || "0128/IT-DB/MEMO/2026",
      memoPerihal: d.memoPerihal || "Permohonan Migrasi Perubahan Sistem ke Lingkungan Production",
      memoTanggal: d.memoTanggal || (d.requestDate ? d.requestDate.slice(0, 10) : "2026-08-15"),
      memoTanggalDiterima: d.memoTanggalDiterima || (d.targetDate ? d.targetDate.slice(0, 10) : "2026-08-16"),
      tanggalPermohonanMigrasi: d.tanggalPermohonanMigrasi || (d.targetDate ? d.targetDate.slice(0, 10) : ""),
      downtime: d.downtime || "ADA",
      downtimeDurasi: d.downtimeDurasi || "60 Menit",
      risikoKonflik: d.risikoKonflik || "TIDAK_ADA",
      risikoKonflikAplikasi: d.risikoKonflikAplikasi || [],
      instalasiAreaDrc: d.instalasiAreaDrc || "YA",
      ceklistMigrasi: d.ceklistMigrasi || "ADA",
      ceklistMigrasiRundown: d.ceklistMigrasiRundown || "",
      sast: d.sast || "ADA",
      dokumenArsitektur: (d.dokumenArsitektur as any) || "ADA",
      kesiapanInfrastruktur: d.kesiapanInfrastruktur || "YA",
      sourceAplikasi: d.sourceAplikasi || "ADA",
      userMatriks: d.userMatriks || "ADA",
      toolsMonitoring: (d.toolsMonitoring as any) || "ADA",
      securityChecklist: (d.securityChecklist as any) || "ADA",
      persetujuanItSecurity: d.persetujuanItSecurity || "YA",
      petunjukTeknis: (d.petunjukTeknis as any) || "ADA",
      picMigrasi: (Array.isArray(d.picMigrasi)
        ? d.picMigrasi
        : d.picMigrasi
          ? [d.picMigrasi as any]
          : [{ type: "INTERNAL_IT", userId: "usr-01", userName: d.requesterName || "Iqbal Maulana", divisi: "Divisi IT Digital Banking" }]) as CabPicInternalIT[],
      committeeCab: d.committeeCab || [],
    };
  };

  const loadDetail = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const res = await GetCabRequestById(tokenData, requestId!);
    if (res?.data) {
      setData(res.data);
      // Pre-fill result form if data exists
      if (res.data.cabResult) setResultForm({ cabResult: res.data.cabResult, cabNotes: res.data.cabNotes || "", implementationStatus: res.data.implementationStatus || "" });
      if (res.data.scheduledDate) {
        setScheduleForm({ scheduledDate: res.data.scheduledDate.slice(0, 16), scheduledEndDate: res.data.scheduledEndDate?.slice(0, 16) || "", cabLocation: res.data.cabLocation || "" });
      } else if (res.data.requestedCabDate) {
        // Pre-fill with maker's requested date as suggestion
        const sDate = res.data.requestedCabDate.slice(0, 16);
        const startDatePart = sDate.slice(0, 10);
        let sEndDate = "";
        try {
          const dt = new Date(sDate);
          if (!isNaN(dt.getTime())) {
            const endDt = new Date(dt.getTime() + 60 * 60 * 1000);
            const pad = (n: number) => String(n).padStart(2, "0");
            const endDay = `${endDt.getFullYear()}-${pad(endDt.getMonth() + 1)}-${pad(endDt.getDate())}`;
            if (endDay !== startDatePart) {
              sEndDate = `${startDatePart}T23:59`;
            } else {
              sEndDate = `${startDatePart}T${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`;
            }
          }
        } catch {
          sEndDate = "";
        }
        setScheduleForm({ scheduledDate: sDate, scheduledEndDate: sEndDate, cabLocation: "" });
      }
      // Pre-fill commitment form if data exists or default
      setCommitmentForm({
        pir: res.data.pir || "",
        ketersediaanWaktuMigrasiDc: res.data.ketersediaanWaktuMigrasiDc ? res.data.ketersediaanWaktuMigrasiDc.slice(0, 16) : "",
        keputusanMigrasi: (res.data.keputusanMigrasi as "YA" | "TIDAK") || "YA",
        kesepakatanWaktuPelaksanaanMigrasi: res.data.kesepakatanWaktuPelaksanaanMigrasi
          ? res.data.kesepakatanWaktuPelaksanaanMigrasi.slice(0, 16)
          : res.data.kesepakatanWaktuPelaksanaan
            ? res.data.kesepakatanWaktuPelaksanaan.slice(0, 16)
            : "",
        catatanKomitmen: res.data.catatanKomitmen || "",
      });
      // Initialize edit form with all fields if not actively editing
      if (!isEditingRequest) {
        setRequestEditForm(mapDetailToEditForm(res.data));
      }
    }
    if (!silent) setIsLoading(false);
  };

  const canEditRequest = Boolean(
    Data &&
    !["COMPLETED", "REJECTED", "APPROVED"].includes(String(Data.status || "").toUpperCase())
  );

  const startEditRequest = () => {
    if (!Data || ["COMPLETED", "REJECTED", "APPROVED"].includes(String(Data.status || "").toUpperCase())) return;
    setRequestEditForm(mapDetailToEditForm(Data));
    setIsEditingRequest(true);
  };

  const handleSaveRequestEdit = async () => {
    if (!requestEditForm.requestTitle.trim()) {
      showToast({ description: "Judul request wajib diisi", statusToast: "error" });
      return;
    }
    const firstApp = requestEditForm.applications?.[0];
    const payloadToSave: Partial<CabRequestDetail> = {
      ...requestEditForm,
      applicationId: firstApp?.applicationId || requestEditForm.applicationId,
      applicationName: firstApp?.applicationName || requestEditForm.applicationName || requestEditForm.projectName,
      projectName: firstApp?.applicationName || requestEditForm.projectName,
      aplikasiKategori: firstApp?.aplikasiKategori || requestEditForm.aplikasiKategori,
      rfcKodeProject: firstApp?.rfcKodeProject || requestEditForm.rfcKodeProject,
      itspKode: firstApp?.itspKode || requestEditForm.itspKode,
      applications: requestEditForm.applications,
      isHaveMemo: (requestEditForm.isHaveMemo || "Y") as "Y" | "N",
      jenisCab: requestEditForm.jenisCab as any,
      ceklistMigrasi: requestEditForm.ceklistMigrasi as any,
      hasilUat: [requestEditForm.hasilUat as any],
      hasilUatCatatan: requestEditForm.hasilUat === "BERHASIL_CATATAN" ? requestEditForm.hasilUatCatatan : (requestEditForm.hasilUatCatatan || ""),
      rekomendasiUat: requestEditForm.rekomendasiUat as any,
      downtime: requestEditForm.downtime as any,
      risikoKonflik: requestEditForm.risikoKonflik as any,
      instalasiAreaDrc: requestEditForm.instalasiAreaDrc as any,
      sast: requestEditForm.sast as any,
      dokumenArsitektur: requestEditForm.dokumenArsitektur as any,
      kesiapanInfrastruktur: requestEditForm.kesiapanInfrastruktur as any,
      sourceAplikasi: requestEditForm.sourceAplikasi as any,
      userMatriks: requestEditForm.userMatriks as any,
      toolsMonitoring: requestEditForm.toolsMonitoring as any,
      securityChecklist: requestEditForm.securityChecklist as any,
      persetujuanItSecurity: requestEditForm.persetujuanItSecurity as any,
      petunjukTeknis: requestEditForm.petunjukTeknis as any,
    };
    const success = await UpdateCabRequest(tokenData, requestId!, payloadToSave);
    if (success) {
      showToast({ description: "Data request CAB (termasuk aplikasi utama & terkait) berhasil diperbarui", statusToast: "success" });
      setIsEditingRequest(false);
      loadDetail();
    }
  };

  // Dynamic Activity checklist calculations based on Step 3 inputs (Hardware / Software)
  const activities = Data ? getDynamicCabActivities(Data, Data.activityChecklist) : [];
  const completedActivitiesCount = activities.filter((a) => a.isDone).length;
  const totalActivitiesCount = activities.length;
  const allActivitiesDone = totalActivitiesCount > 0 && completedActivitiesCount === totalActivitiesCount;
  const activityPercent = totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0;

  const handleToggleActivity = async (activityId: string) => {
    if (!requestId || !Data) return;
    const userDoneBy = DataAuth?.nama || "Scheduler";
    const currentActivity = activities.find((a) => a.id === activityId);
    const willBeDone = !currentActivity?.isDone;

    // 1. Optimistic local state update (instant UI change without re-rendering/refreshing full page)
    setData((prev) => {
      if (!prev) return prev;
      const baseList = getDynamicCabActivities(prev, prev.activityChecklist);
      const updatedChecklist = baseList.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            isDone: willBeDone,
            doneAt: willBeDone ? new Date().toISOString() : null,
            doneBy: willBeDone ? userDoneBy : null,
          };
        }
        return act;
      });
      return { ...prev, activityChecklist: updatedChecklist };
    });

    // 2. Persist in background silently (no page refresh or full state reload)
    const success = await ToggleCabActivity(tokenData, requestId, activityId, userDoneBy);
    if (!success) {
      // Revert if failed
      setData((prev) => {
        if (!prev) return prev;
        const baseList = getDynamicCabActivities(prev, prev.activityChecklist);
        const revertedChecklist = baseList.map((act) => {
          if (act.id === activityId) {
            return {
              ...act,
              isDone: !willBeDone,
              doneAt: !willBeDone ? new Date().toISOString() : null,
              doneBy: !willBeDone ? userDoneBy : null,
            };
          }
          return act;
        });
        return { ...prev, activityChecklist: revertedChecklist };
      });
      showToast({
        description: "Gagal memperbarui status checklist aktivitas",
        statusToast: "error",
      });
    }
  };

  const handleToggleAllActivities = async (shouldSelectAll: boolean) => {
    if (!requestId || !Data) return;
    const userDoneBy = DataAuth?.nama || "Scheduler";
    const nowIso = new Date().toISOString();

    setData((prev) => {
      if (!prev) return prev;
      const baseList = getDynamicCabActivities(prev, prev.activityChecklist);
      const updatedChecklist = baseList.map((act) => ({
        ...act,
        isDone: shouldSelectAll,
        doneAt: shouldSelectAll ? nowIso : null,
        doneBy: shouldSelectAll ? userDoneBy : null,
      }));
      return { ...prev, activityChecklist: updatedChecklist };
    });

    for (const act of activities) {
      if (act.isDone !== shouldSelectAll) {
        await ToggleCabActivity(tokenData, requestId, act.id, userDoneBy);
      }
    }
  };

  const handleToggleCabDone = async () => {
    if (!requestId || !Data) return;
    const nextStatus: "Y" | "N" = Data.isCabDone === "Y" ? "N" : "Y";

    // Optimistic local update
    setData((prev) => (prev ? { ...prev, isCabDone: nextStatus } : prev));

    const success = await SetCabDoneStatus(tokenData, requestId, nextStatus);
    if (success) {
      showToast({
        description:
          nextStatus === "Y"
            ? "Pelaksanaan rapat CAB telah ditandai SELESAI (isCabDone = Y)."
            : "Pelaksanaan rapat CAB diubah menjadi BELUM SELESAI (isCabDone = N).",
        statusToast: nextStatus === "Y" ? "success" : "info",
      });
      loadDetail(true); // Silent sync
    } else {
      // Revert on failure
      setData((prev) => (prev ? { ...prev, isCabDone: Data.isCabDone } : prev));
    }
  };

  // Handlers for schedule inputs enforcing same-day (cannot exceed 24 hours / must be today of meeting)
  const handleScheduleStartDateChange = (newStartDate: string) => {
    const startDatePart = newStartDate ? newStartDate.slice(0, 10) : "";
    let updatedEndDate = scheduleForm.scheduledEndDate;

    if (newStartDate) {
      if (!updatedEndDate || updatedEndDate.slice(0, 10) !== startDatePart || updatedEndDate <= newStartDate) {
        try {
          const startDt = new Date(newStartDate);
          if (!isNaN(startDt.getTime())) {
            const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);
            const pad = (n: number) => String(n).padStart(2, "0");
            const endDay = `${endDt.getFullYear()}-${pad(endDt.getMonth() + 1)}-${pad(endDt.getDate())}`;
            if (endDay !== startDatePart) {
              updatedEndDate = `${startDatePart}T23:59`;
            } else {
              updatedEndDate = `${startDatePart}T${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`;
            }
          } else {
            updatedEndDate = `${startDatePart}T23:59`;
          }
        } catch {
          updatedEndDate = `${startDatePart}T23:59`;
        }
      }
    }

    setScheduleForm((prev) => ({
      ...prev,
      scheduledDate: newStartDate,
      scheduledEndDate: updatedEndDate,
    }));
  };

  const handleScheduleEndDateChange = (newEndDate: string) => {
    let finalEndDate = newEndDate;
    if (scheduleForm.scheduledDate && newEndDate) {
      const startDatePart = scheduleForm.scheduledDate.slice(0, 10);
      const endDatePart = newEndDate.slice(0, 10);
      // Ensure date cannot exceed the start date (must be same date)
      if (endDatePart !== startDatePart) {
        const timePart = newEndDate.includes("T") ? newEndDate.slice(11, 16) : "23:59";
        finalEndDate = `${startDatePart}T${timePart}`;
      }
    }
    setScheduleForm((prev) => ({
      ...prev,
      scheduledEndDate: finalEndDate,
    }));
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledEndDate) {
      showToast({ description: "Tanggal mulai dan selesai wajib diisi", statusToast: "error" });
      return;
    }

    const startDt = new Date(scheduleForm.scheduledDate);
    const endDt = new Date(scheduleForm.scheduledEndDate);

    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      showToast({ description: "Format tanggal & jam tidak valid", statusToast: "error" });
      return;
    }

    if (endDt <= startDt) {
      showToast({ description: "Jam selesai harus setelah jam mulai", statusToast: "error" });
      return;
    }

    const startDateStr = scheduleForm.scheduledDate.slice(0, 10);
    const endDateStr = scheduleForm.scheduledEndDate.slice(0, 10);
    if (startDateStr !== endDateStr) {
      showToast({
        description: "Jadwal sidang CAB tidak boleh melebihi 24 jam dan harus diselesaikan pada hari yang sama.",
        statusToast: "error",
      });
      return;
    }

    const success = await ScheduleCabRequest(tokenData, requestId!, scheduleForm);
    if (success) {
      showToast({ description: "Jadwal CAB berhasil disimpan. Status sekarang Pelaksanaan.", statusToast: "success" });
      loadDetail();
    }
  };

  const handleSaveCommitment = async () => {
    if (!requestId) return;
    setIsSavingCommitment(true);
    const success = await UpdateCabRequest(tokenData, requestId, {
      ketersediaanWaktuMigrasiDc: commitmentForm.ketersediaanWaktuMigrasiDc,
      keputusanMigrasi: commitmentForm.keputusanMigrasi as any,
      kesepakatanWaktuPelaksanaanMigrasi: commitmentForm.kesepakatanWaktuPelaksanaanMigrasi,
      catatanKomitmen: commitmentForm.catatanKomitmen,
    });
    setIsSavingCommitment(false);
    if (success) {
      showToast({
        description: "Data kesepakatan & komitmen migrasi berhasil disimpan.",
        statusToast: "success",
      });
      loadDetail(true);
    }
  };

  const handleConfirmMeeting = async () => {
    if (!requestId) return;
    if (
      commitmentForm.ketersediaanWaktuMigrasiDc ||
      commitmentForm.kesepakatanWaktuPelaksanaanMigrasi ||
      commitmentForm.catatanKomitmen
    ) {
      await UpdateCabRequest(tokenData, requestId, {
        ketersediaanWaktuMigrasiDc: commitmentForm.ketersediaanWaktuMigrasiDc,
        keputusanMigrasi: commitmentForm.keputusanMigrasi as any,
        kesepakatanWaktuPelaksanaanMigrasi: commitmentForm.kesepakatanWaktuPelaksanaanMigrasi,
        catatanKomitmen: commitmentForm.catatanKomitmen,
      });
    }
    const success = await ConfirmCabMeeting(tokenData, requestId);
    if (success) {
      showToast({
        description: "Kesepakatan migrasi berhasil disimpan. Status sekarang Implementasi.",
        statusToast: "success",
      });
      loadDetail();
    }
  };

  const handleSetImplementStatus = async () => {
    if (!requestId) return;
    if (resultForm.cabResult) {
      await UpdateCabResult(tokenData, requestId, {
        cabResult: resultForm.cabResult,
        cabNotes: resultForm.cabNotes,
        implementationStatus: (resultForm.implementationStatus || "SUCCESS") as "SUCCESS" | "FAILED" | "PARTIAL",
      });
    }
    const success = await SetCabImplementStatus(tokenData, requestId);
    if (success) {
      showToast({
        description: "Pelaksanaan rapat dan evaluasi migrasi telah ditandai selesai (Status: Implementasi, isCabDone = Y).",
        statusToast: "success",
      });
      loadDetail();
    }
  };

  const handleSaveResult = async () => {
    if (!resultForm.cabResult || !resultForm.implementationStatus) {
      showToast({ description: "Hasil dan status implementasi wajib diisi", statusToast: "error" });
      return;
    }
    const success = await UpdateCabResult(tokenData, requestId!, {
      cabResult: resultForm.cabResult,
      cabNotes: resultForm.cabNotes,
      implementationStatus: resultForm.implementationStatus as "SUCCESS" | "FAILED" | "PARTIAL",
    });
    if (success) showToast({ description: "Hasil CAB berhasil disimpan", statusToast: "success" });
  };

  const handleSendToApproval = async () => {
    if (Data?.status !== "IMPLEMENTASI" && Data?.status !== "IMPLEMENT") {
      showToast({
        description: "Status permohonan harus Implementasi sebelum mengirim request ini ke Approver.",
        statusToast: "warning",
      });
      return;
    }
    if (!resultForm.cabResult || !resultForm.implementationStatus) {
      showToast({
        description: "Hasil Evaluasi dan Status Implementasi wajib diisi sebelum mengirim ke Approver.",
        statusToast: "warning",
      });
      return;
    }
    if (!allActivitiesDone) {
      showToast({
        description: `Harap selesaikan seluruh aktivitas checklist CAB (${completedActivitiesCount}/${totalActivitiesCount} selesai) sebelum mengirim ke Approver.`,
        statusToast: "warning",
      });
      return;
    }
    if (isEditingRequest) {
      const payloadToSave: Partial<CabRequestDetail> = {
        ...requestEditForm,
        isHaveMemo: (requestEditForm.isHaveMemo || "Y") as "Y" | "N",
        jenisCab: requestEditForm.jenisCab as any,
        ceklistMigrasi: requestEditForm.ceklistMigrasi as any,
        hasilUat: [requestEditForm.hasilUat as any],
        rekomendasiUat: requestEditForm.rekomendasiUat as any,
        downtime: requestEditForm.downtime as any,
        risikoKonflik: requestEditForm.risikoKonflik as any,
        instalasiAreaDrc: requestEditForm.instalasiAreaDrc as any,
        sast: requestEditForm.sast as any,
        dokumenArsitektur: requestEditForm.dokumenArsitektur as any,
        kesiapanInfrastruktur: requestEditForm.kesiapanInfrastruktur as any,
        sourceAplikasi: requestEditForm.sourceAplikasi as any,
        userMatriks: requestEditForm.userMatriks as any,
        toolsMonitoring: requestEditForm.toolsMonitoring as any,
        securityChecklist: requestEditForm.securityChecklist as any,
        persetujuanItSecurity: requestEditForm.persetujuanItSecurity as any,
        petunjukTeknis: requestEditForm.petunjukTeknis as any,
      };
      await UpdateCabRequest(tokenData, requestId!, payloadToSave);
    }
    if (resultForm.cabResult) {
      await UpdateCabResult(tokenData, requestId!, {
        cabResult: resultForm.cabResult,
        cabNotes: resultForm.cabNotes,
        implementationStatus: (resultForm.implementationStatus || "SUCCESS") as "SUCCESS" | "FAILED" | "PARTIAL",
      });
    }
    const success = await SendToApproval(tokenData, requestId!);
    if (success) {
      showToast({ description: "Request berhasil dikirim ke approver (Status: Send to Approval)", statusToast: "success" });
      setIsEditingRequest(false);
      loadDetail();
    }
  };

  const handleApprovalAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !approvalNote) {
      showToast({ description: "Catatan wajib diisi untuk reject", statusToast: "error" });
      return;
    }
    const success = await ActionCabRequest(tokenData, requestId!, { action, note: approvalNote });
    if (success) {
      showToast({ description: action === "APPROVE" ? "Request berhasil disetujui (COMPLETED)" : "Request ditolak (REJECTED)", statusToast: "success" });
      loadDetail();
    }
  };

  if (IsLoading) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px"><LoadingMiniSignature /></Flex>
      </LayoutAdmin>
    );
  }

  if (!Data) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px" direction="column" gap={4}>
          <Text color="gray.500">Request not found</Text>
          <Button onClick={() => router.push("/cab/cab-request")}>Back</Button>
        </Flex>
      </LayoutAdmin>
    );
  }

  const isApproved = String(Data.status || "").toUpperCase() === "APPROVED" || String(Data.status || "").toUpperCase() === "COMPLETED";

  return (
    <LayoutAdmin>
      <HeaderContent titleName="CAB Request Detail" breadCrumb={["CAB", "CAB Request", "Detail"]} />

      {/* Role Switcher */}
      <Box mx={{ base: 4, md: 6 }} mt={3} mb={2}>
        <Card rounded="lg" shadow="sm" border="1px" borderColor="purple.200" bg={colorMode === "light" ? "purple.50" : "gray.800"} p={3}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Icon as={FiShield} color="purple.500" />
              <Text fontSize="xs" fontWeight="bold" color="purple.700">MOCK ROLE SWITCHER</Text>
              <Badge colorScheme="gray" fontSize="2xs">Status: {Data.status}</Badge>
            </HStack>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button leftIcon={<FiUser />} colorScheme={mockRole === "maker" ? "blue" : "gray"} variant={mockRole === "maker" ? "solid" : "outline"} onClick={() => setMockRole("maker")}>Maker</Button>
              <Button leftIcon={<FiUsers />} colorScheme={mockRole === "scheduler" ? "green" : "gray"} variant={mockRole === "scheduler" ? "solid" : "outline"} onClick={() => setMockRole("scheduler")}>Scheduler</Button>
              <Button leftIcon={<FiCheckCircle />} colorScheme={mockRole === "approver" ? "orange" : "gray"} variant={mockRole === "approver" ? "solid" : "outline"} onClick={() => setMockRole("approver")}>Approver</Button>
            </ButtonGroup>
          </Flex>
        </Card>
      </Box>

      {/* Header Banner */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}
        mx={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}
        rounded={radiusStyle} position="relative" overflow="hidden" shadow="xl"
      >
        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          <HStack justify="space-between" align="center">
            <Link href="/cab/cab-request">
              <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm" color="white" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" _hover={{ bg: "whiteAlpha.200" }} rounded="full" px={4}>Back</Button>
            </Link>
            <Button leftIcon={<FiRefreshCcw />} variant="ghost" size="sm" color="white" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" _hover={{ bg: "whiteAlpha.200" }} rounded="full" px={3} onClick={() => loadDetail()}>Refresh</Button>
          </HStack>
          <HStack spacing={4} align="center">
            <Box w="60px" h="60px" bg="whiteAlpha.200" rounded="xl" display="flex" alignItems="center" justifyContent="center">
              <FiFileText size={28} />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" fontWeight="700">{Data.requestTitle}</Heading>
              <HStack spacing={2} wrap="wrap">
                <Badge colorScheme="blue" variant="solid" px={2} rounded="full" fontSize="xs">{Data.requestNo}</Badge>
                <Badge colorScheme="purple" variant="solid" px={2} rounded="full" fontSize="xs">{Data.requestType}</Badge>
                <StatusBadge status={Data.status} variant="solid" px={2} rounded="full" fontSize="xs" />
                {Data.status !== "DRAFT" && Data.status !== "REQUEST" && Data.status !== "PENGAJUAN" && (
                  <Badge
                    colorScheme={Data.isCabDone === "Y" ? "green" : "yellow"}
                    variant="solid"
                    px={2}
                    rounded="full"
                    fontSize="xs"
                  >
                    Rapat CAB: {Data.isCabDone === "Y" ? "Selesai" : "Belum Selesai"}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* ─── ALUR CAB Pipeline Stepper ─── */}
      <Box mx={{ base: 4, md: 6 }} mb={5}>
        <Card
          rounded={radiusStyle}
          shadow="sm"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <CardBody px={{ base: 3, md: 5 }} py={3}>
            <VStack align="stretch" spacing={2.5}>
              {/* Header: Title only */}
              <HStack spacing={2}>
                <Box w="3px" h="14px" bg="blue.500" rounded="full" />
                <Heading
                  size="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color={colorMode === "light" ? "gray.700" : "gray.200"}
                  fontWeight="700"
                >
                  Alur CAB
                </Heading>
              </HStack>

              {/* Horizontal Connected Timeline Stepper */}
              <Box
                overflowX="auto"
                py={1}
                sx={{
                  "&::-webkit-scrollbar": { height: "4px" },
                  "&::-webkit-scrollbar-thumb": {
                    bg: colorMode === "light" ? "gray.300" : "gray.600",
                    borderRadius: "full",
                  },
                }}
              >
                <Box
                  w="full"
                  minW={{ base: "640px", md: "100%" }}
                  position="relative"
                  pt={1}
                >
                  {/* Connecting Line Layer spanning between first and last node */}
                  <Flex
                    position="absolute"
                    top="14px"
                    left="13px"
                    right="13px"
                    align="center"
                    zIndex={1}
                  >
                    {CAB_LIFECYCLE_STAGES.slice(0, -1).map((st) => {
                      const currentIdx = getStageIndex(Data.status);
                      const isPassed =
                        st.stage < currentIdx ||
                        (currentIdx === 6 && (Data.status === "COMPLETED" || Data.status === "APPROVED"));
                      const isCurrent = st.stage === currentIdx;

                      return (
                        <Box
                          key={`line-${st.stage}`}
                          flex={1}
                          h="0px"
                          borderTop={isCurrent ? "2px dashed" : "2px solid"}
                          borderColor={
                            isPassed
                              ? "green.500"
                              : isCurrent
                                ? colorMode === "light"
                                  ? "gray.300"
                                  : "gray.600"
                                : colorMode === "light"
                                  ? "gray.200"
                                  : "gray.700"
                          }
                        />
                      );
                    })}
                  </Flex>

                  {/* Nodes and Labels Layer */}
                  <Flex
                    w="full"
                    justify="space-between"
                    align="flex-start"
                    position="relative"
                    zIndex={2}
                  >
                    {CAB_LIFECYCLE_STAGES.map((st, idx) => {
                      const currentIdx = getStageIndex(Data.status);
                      const isPassed =
                        st.stage < currentIdx ||
                        (currentIdx === 6 && (Data.status === "COMPLETED" || Data.status === "APPROVED"));
                      const isCurrent = st.stage === currentIdx;
                      const isRejected = currentIdx === 6 && Data.status === "REJECTED";
                      const isFirst = idx === 0;
                      const isLast = idx === CAB_LIFECYCLE_STAGES.length - 1;

                      return (
                        <Flex
                          key={st.stage}
                          direction="column"
                          align={isFirst ? "flex-start" : isLast ? "flex-end" : "center"}
                          maxW={{ base: "90px", md: "115px" }}
                          textAlign={isFirst ? "left" : isLast ? "right" : "center"}
                        >
                          {/* Step Node */}
                          <Flex
                            align="center"
                            justify={isFirst ? "flex-start" : isLast ? "flex-end" : "center"}
                            w="full"
                            h="26px"
                            mb={1.5}
                          >
                            {isPassed && !isCurrent ? (
                              <Flex
                                w="22px"
                                h="22px"
                                rounded="full"
                                bg="green.500"
                                color="white"
                                align="center"
                                justify="center"
                                shadow="xs"
                              >
                                <Icon as={FiCheck} boxSize={3.5} strokeWidth={3} />
                              </Flex>
                            ) : isCurrent ? (
                              <Flex
                                w="26px"
                                h="26px"
                                rounded="full"
                                bg={isRejected ? "red.500" : "blue.500"}
                                border="2.5px solid"
                                borderColor={
                                  isRejected
                                    ? "red.200"
                                    : colorMode === "light"
                                      ? "blue.100"
                                      : "blue.900"
                                }
                                color="white"
                                align="center"
                                justify="center"
                                fontSize="xs"
                                fontWeight="bold"
                                shadow="md"
                              >
                                {isRejected ? (
                                  <Icon as={FiX} boxSize={3.5} strokeWidth={3} />
                                ) : (
                                  st.stage
                                )}
                              </Flex>
                            ) : (
                              <Flex
                                w="22px"
                                h="22px"
                                rounded="full"
                                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                                border="1.5px solid"
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                color={colorMode === "light" ? "gray.400" : "gray.500"}
                                align="center"
                                justify="center"
                                fontSize="2xs"
                                fontWeight="semibold"
                              >
                                {st.stage}
                              </Flex>
                            )}
                          </Flex>

                          {/* Step Title */}
                          <Box w="full" px={0.5}>
                            <Text
                              fontSize="xs"
                              fontWeight={isCurrent ? "semibold" : isPassed ? "medium" : "normal"}
                              color={
                                isCurrent
                                  ? isRejected
                                    ? "red.500"
                                    : colorMode === "light"
                                      ? "blue.600"
                                      : "blue.300"
                                  : isPassed
                                    ? colorMode === "light"
                                      ? "gray.800"
                                      : "gray.200"
                                    : colorMode === "light"
                                      ? "gray.400"
                                      : "gray.500"
                              }
                              noOfLines={1}
                            >
                              {st.label}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Box>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 6 }} w="full">
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">

          {/* Left — Main Info + Actions */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <VStack spacing={5} align="stretch">

              {/* ─── SEGMENTED TAB SWITCHER (Only shown when NOT APPROVED) ─── */}
              {!isApproved && (
                <Box
                  p={1}
                  bg={colorMode === "light" ? "gray.100" : "gray.850"}
                  rounded="lg"
                  border="1px solid"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                >
                  <SimpleGrid columns={2} spacing={1}>
                    <Button
                      size="sm"
                      variant="ghost"
                      rounded="md"
                      fontWeight={activeDetailStep === 1 ? "bold" : "medium"}
                      bg={activeDetailStep === 1 ? (colorMode === "light" ? "white" : "gray.700") : "transparent"}
                      color={activeDetailStep === 1 ? (colorMode === "light" ? "blue.600" : "blue.300") : (colorMode === "light" ? "gray.600" : "gray.400")}
                      shadow={activeDetailStep === 1 ? "sm" : "none"}
                      _hover={{ bg: activeDetailStep === 1 ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.200" : "gray.750") }}
                      leftIcon={<Icon as={FiFileText} />}
                      onClick={() => setActiveDetailStep(1)}
                    >
                      1. Data Permohonan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      rounded="md"
                      fontWeight={activeDetailStep === 2 ? "bold" : "medium"}
                      bg={activeDetailStep === 2 ? (colorMode === "light" ? "white" : "gray.700") : "transparent"}
                      color={activeDetailStep === 2 ? (colorMode === "light" ? "blue.600" : "blue.300") : (colorMode === "light" ? "gray.600" : "gray.400")}
                      shadow={activeDetailStep === 2 ? "sm" : "none"}
                      _hover={{ bg: activeDetailStep === 2 ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.200" : "gray.750") }}
                      leftIcon={<Icon as={FiCheckSquare} />}
                      onClick={() => setActiveDetailStep(2)}
                    >
                      2. Schedule
                    </Button>
                  </SimpleGrid>
                </Box>
              )}

              {/* ─── DATA PERMOHONAN (Shown when activeDetailStep === 1 OR when isApproved) ─── */}
              {(isApproved || activeDetailStep === 1) && (
                <>
                  {/* STEP 1: Identitas Permohonan CAB */}
                  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={2}>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 1</Badge>
                          <Box w="4px" h="18px" bg="secondary.400" rounded="full" />
                          <Heading size="sm">Identitas Permohonan CAB</Heading>
                        </HStack>

                        {canEditRequest && (
                          !isEditingRequest ? (
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FiEdit2 />}
                              fontWeight="semibold"
                              px={3}
                              rounded="md"
                              onClick={startEditRequest}
                            >
                              Edit Data
                            </Button>
                          ) : (
                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setIsEditingRequest(false)}
                              >
                                Batal
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                bg="blue.600"
                                color="white"
                                _hover={{ bg: "blue.700" }}
                                leftIcon={<FiSave />}
                                fontWeight="bold"
                                onClick={handleSaveRequestEdit}
                                isLoading={loading}
                              >
                                Simpan Perubahan
                              </Button>
                            </HStack>
                          )
                        )}
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      {isEditingRequest ? (
                        <VStack spacing={5} align="stretch">
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Judul Permohonan</FormLabel>
                            <Input
                              size="sm"
                              rounded="lg"
                              value={requestEditForm.requestTitle}
                              onChange={(e) => setRequestEditForm({ ...requestEditForm, requestTitle: e.target.value })}
                            />
                          </FormControl>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem label="Nomor Request" value={Data.requestNo} />
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tipe Perubahan</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.requestType}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, requestType: e.target.value })}
                              >
                                <option value="NEW FEATURE">NEW FEATURE</option>
                                <option value="ENHANCEMENT">ENHANCEMENT</option>
                                <option value="BUG FIXING">BUG FIXING</option>
                                <option value="TOOLS">TOOLS</option>
                                <option value="DEPLOYMENT">DEPLOYMENT</option>
                                <option value="CHANGE REQUEST">CHANGE REQUEST</option>
                                <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                                <option value="MAINTENANCE">MAINTENANCE</option>
                                <option value="HOTFIX">HOTFIX</option>
                                <option value="EMERGENCY CHANGE">EMERGENCY CHANGE</option>
                              </Select>
                            </FormControl>
                            <InfoItem label="Sisi Aplikasi" value={Data.appSide === "OTHER" ? `OTHER (${Data.appSideOther || "-"})` : (Data.appSide || "WEB")} />
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Jenis CAB</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.jenisCab}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, jenisCab: e.target.value })}
                              >
                                <option value="WEEKLY">WEEKLY</option>
                                <option value="EMERGENCY">EMERGENCY</option>
                              </Select>
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Target Date</FormLabel>
                              <Input
                                type="date"
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.targetDate}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, targetDate: e.target.value })}
                              />
                            </FormControl>
                            <InfoItem label="Requester" value={`${Data.requesterName} (${Data.requesterEmail})`} />
                            <InfoItem label="Tanggal Request" value={new Date(Data.requestDate).toLocaleDateString("id-ID")} />
                          </SimpleGrid>

                          {/* ─── EDIT APLIKASI UTAMA & APLIKASI TERKAIT ─── */}
                          <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                          {(() => {
                            const apps = requestEditForm.applications && requestEditForm.applications.length > 0
                              ? requestEditForm.applications
                              : [
                                  {
                                    id: "app-main-0",
                                    applicationId: requestEditForm.applicationId || "app-001",
                                    applicationName: requestEditForm.applicationName || requestEditForm.projectName || "",
                                    aplikasiKategori: requestEditForm.aplikasiKategori || "Transaksional",
                                    rfcKodeProject: requestEditForm.rfcKodeProject || "",
                                    itspKode: requestEditForm.itspKode || "",
                                  },
                                ];

                            const handleUpdateApp = (index: number, field: keyof CabSoftwareApplicationItem, val: string) => {
                              const updated = [...apps];
                              updated[index] = { ...updated[index], [field]: val };
                              const first = updated[0];
                              setRequestEditForm({
                                ...requestEditForm,
                                applications: updated,
                                applicationId: first?.applicationId || requestEditForm.applicationId,
                                applicationName: first?.applicationName || requestEditForm.applicationName,
                                projectName: first?.applicationName || requestEditForm.projectName,
                                aplikasiKategori: first?.aplikasiKategori || requestEditForm.aplikasiKategori,
                                rfcKodeProject: first?.rfcKodeProject || requestEditForm.rfcKodeProject,
                                itspKode: first?.itspKode || requestEditForm.itspKode,
                              });
                            };

                            const handleSelectApp = (index: number, selectedOpt: any) => {
                              const updated = [...apps];
                              if (!selectedOpt) {
                                updated[index] = {
                                  ...updated[index],
                                  applicationId: "",
                                  applicationName: "",
                                  aplikasiKategori: "",
                                  rfcKodeProject: "",
                                };
                              } else {
                                const foundApp = appList.find((a) => a.id === selectedOpt.value);
                                const appName = foundApp?.appName || selectedOpt.label;
                                const category = foundApp?.appTypes || updated[index]?.aplikasiKategori || "Transaksional";
                                updated[index] = {
                                  ...updated[index],
                                  applicationId: selectedOpt.value,
                                  applicationName: appName,
                                  aplikasiKategori: category,
                                  rfcKodeProject: "",
                                };
                                if (foundApp?.reqParentId) {
                                  fetchAppSpecificProjects(foundApp.id, foundApp.reqParentId);
                                }
                              }

                              const first = updated[0];
                              setRequestEditForm({
                                ...requestEditForm,
                                applications: updated,
                                applicationId: first?.applicationId || requestEditForm.applicationId,
                                applicationName: first?.applicationName || requestEditForm.applicationName,
                                projectName: first?.applicationName || requestEditForm.projectName,
                                aplikasiKategori: first?.aplikasiKategori || requestEditForm.aplikasiKategori,
                                rfcKodeProject: first?.rfcKodeProject || requestEditForm.rfcKodeProject,
                                itspKode: first?.itspKode || requestEditForm.itspKode,
                              });
                            };

                            const handleSelectProject = (index: number, opt: any) => {
                              const updated = [...apps];
                              const projectVal = typeof opt === "string" ? opt : opt?.value || "";
                              updated[index] = {
                                ...updated[index],
                                rfcKodeProject: projectVal,
                              };
                              const first = updated[0];
                              setRequestEditForm({
                                ...requestEditForm,
                                applications: updated,
                                rfcKodeProject: first?.rfcKodeProject || requestEditForm.rfcKodeProject,
                              });
                            };

                            const handleAddApp = () => {
                              const newItem: CabSoftwareApplicationItem = {
                                id: `app-item-${Date.now()}`,
                                applicationId: `app-${Date.now()}`,
                                applicationName: "",
                                aplikasiKategori: "Transaksional",
                                rfcKodeProject: "",
                                itspKode: requestEditForm.itspKode || "",
                              };
                              const updated = [...apps, newItem];
                              setRequestEditForm({
                                ...requestEditForm,
                                applications: updated,
                              });
                            };

                            const handleRemoveApp = (index: number) => {
                              if (index === 0) return;
                              const updated = apps.filter((_, i) => i !== index);
                              setRequestEditForm({
                                ...requestEditForm,
                                applications: updated,
                              });
                            };

                            return (
                              <VStack spacing={4} align="stretch">
                                {/* 1. Edit Aplikasi Utama */}
                                <Box
                                  p={4}
                                  bg={colorMode === "light" ? "blue.50/40" : "gray.750"}
                                  rounded="lg"
                                  border="1.5px solid"
                                  borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                                >
                                  <Flex justify="space-between" align="center" mb={3}>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="blue" variant="solid" rounded="md" px={2} py={0.5} fontSize="2xs" fontWeight="bold">
                                        Aplikasi Utama
                                      </Badge>
                                      {apps[0]?.applicationName && (
                                        <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "blue.800" : "blue.200"}>
                                          {apps[0].applicationName}
                                        </Text>
                                      )}
                                    </HStack>
                                    {apps[0]?.aplikasiKategori && (
                                      <Badge colorScheme="teal" variant="subtle" rounded="md" px={2} py={0.5} fontSize="3xs">
                                        {apps[0].aplikasiKategori}
                                      </Badge>
                                    )}
                                  </Flex>

                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                    <FormControl isRequired>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                        Pilih Aplikasi Utama
                                      </FormLabel>
                                      <ChakraReactSelect
                                        isClearable
                                        isLoading={appLoading}
                                        placeholder="Cari atau pilih aplikasi..."
                                        options={appOptions}
                                        value={
                                          apps[0]?.applicationId
                                            ? appOptions.find((opt) => opt.value === apps[0].applicationId) || {
                                                label: apps[0].applicationName || "Aplikasi",
                                                value: apps[0].applicationId,
                                                data: { appName: apps[0].applicationName } as any,
                                              }
                                            : null
                                        }
                                        onChange={(opt: any) => handleSelectApp(0, opt)}
                                        filterOption={filterAppOption}
                                        chakraStyles={selectStyles}
                                      />
                                    </FormControl>

                                    <FormControl>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                        Project / RFC / BRD Terkait
                                      </FormLabel>
                                      <CreatableSelect
                                        isClearable
                                        isLoading={projectLoading}
                                        placeholder="Pilih atau ketik Project/RFC/BRD..."
                                        options={getProjectOptionsForRow(apps[0]?.applicationId)}
                                        value={
                                          apps[0]?.rfcKodeProject
                                            ? {
                                                label: apps[0].rfcKodeProject,
                                                value: apps[0].rfcKodeProject,
                                              }
                                            : null
                                        }
                                        onChange={(opt: any) => handleSelectProject(0, opt)}
                                        onCreateOption={(val: string) => handleSelectProject(0, val)}
                                        chakraStyles={selectStyles}
                                      />
                                    </FormControl>

                                    <FormControl>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                        Kategori Aplikasi
                                      </FormLabel>
                                      <Select
                                        size="sm"
                                        rounded="lg"
                                        value={apps[0]?.aplikasiKategori || "Transaksional"}
                                        onChange={(e) => handleUpdateApp(0, "aplikasiKategori", e.target.value)}
                                      >
                                        <option value="Transaksional">Transaksional</option>
                                        <option value="Monitoring">Monitoring</option>
                                        <option value="Regulatory">Regulatory</option>
                                        <option value="Pelaporan">Pelaporan</option>
                                        <option value="CORE_BANKING">CORE_BANKING</option>
                                        <option value="PAYMENT_GATEWAY">PAYMENT_GATEWAY</option>
                                      </Select>
                                    </FormControl>

                                    <FormControl>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                        Kode ITSP
                                      </FormLabel>
                                      <Input
                                        size="sm"
                                        rounded="lg"
                                        placeholder="Contoh: ITSP-BJB-990"
                                        value={apps[0]?.itspKode || ""}
                                        onChange={(e) => handleUpdateApp(0, "itspKode", e.target.value)}
                                      />
                                    </FormControl>
                                  </SimpleGrid>
                                </Box>

                                {/* 2. Edit Aplikasi Terkait */}
                                <Box>
                                  <Flex justify="space-between" align="center" mb={2.5}>
                                    <HStack spacing={2}>
                                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                        Aplikasi Terkait
                                      </Text>
                                      <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="3xs">
                                        {apps.slice(1).length} Terpilih
                                      </Badge>
                                    </HStack>
                                    <Button
                                      size="xs"
                                      leftIcon={<FiPlus />}
                                      colorScheme="purple"
                                      variant="outline"
                                      rounded="md"
                                      onClick={handleAddApp}
                                    >
                                      Tambah Aplikasi Terkait
                                    </Button>
                                  </Flex>

                                  {apps.slice(1).length > 0 ? (
                                    <VStack spacing={3} align="stretch">
                                      {apps.slice(1).map((app, relIdx) => {
                                        const actualIndex = relIdx + 1;
                                        return (
                                          <Box
                                            key={app.id || actualIndex}
                                            p={3.5}
                                            bg={colorMode === "light" ? "purple.50/20" : "gray.750"}
                                            rounded="lg"
                                            border="1px solid"
                                            borderColor={colorMode === "light" ? "purple.200" : "purple.900"}
                                          >
                                            <Flex justify="space-between" align="center" mb={2.5}>
                                              <HStack spacing={2}>
                                                <Badge colorScheme="purple" variant="solid" rounded="md" px={2} py={0.5} fontSize="3xs" fontWeight="bold">
                                                  Aplikasi Terkait #{relIdx + 1}
                                                </Badge>
                                                {app.applicationName && (
                                                  <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "purple.800" : "purple.200"}>
                                                    {app.applicationName}
                                                  </Text>
                                                )}
                                                {app.aplikasiKategori && (
                                                  <Badge colorScheme="teal" variant="subtle" rounded="md" px={2} py={0.5} fontSize="3xs">
                                                    {app.aplikasiKategori}
                                                  </Badge>
                                                )}
                                              </HStack>
                                              <IconButton
                                                aria-label="Hapus aplikasi terkait"
                                                icon={<FiTrash2 />}
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleRemoveApp(actualIndex)}
                                              />
                                            </Flex>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                              <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                                  Pilih Aplikasi Terkait
                                                </FormLabel>
                                                <ChakraReactSelect
                                                  isClearable
                                                  isLoading={appLoading}
                                                  placeholder="Cari atau pilih aplikasi terkait..."
                                                  options={appOptions}
                                                  value={
                                                    app.applicationId
                                                      ? appOptions.find((opt) => opt.value === app.applicationId) || {
                                                          label: app.applicationName || "Aplikasi",
                                                          value: app.applicationId,
                                                          data: { appName: app.applicationName } as any,
                                                        }
                                                      : null
                                                  }
                                                  onChange={(opt: any) => handleSelectApp(actualIndex, opt)}
                                                  filterOption={filterAppOption}
                                                  chakraStyles={selectStyles}
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                                  Project / RFC / BRD Terkait
                                                </FormLabel>
                                                <CreatableSelect
                                                  isClearable
                                                  isLoading={projectLoading}
                                                  placeholder="Pilih atau ketik Project/RFC/BRD..."
                                                  options={getProjectOptionsForRow(app.applicationId)}
                                                  value={
                                                    app.rfcKodeProject
                                                      ? {
                                                          label: app.rfcKodeProject,
                                                          value: app.rfcKodeProject,
                                                        }
                                                      : null
                                                  }
                                                  onChange={(opt: any) => handleSelectProject(actualIndex, opt)}
                                                  onCreateOption={(val: string) => handleSelectProject(actualIndex, val)}
                                                  chakraStyles={selectStyles}
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                                  Kategori Aplikasi
                                                </FormLabel>
                                                <Select
                                                  size="sm"
                                                  rounded="lg"
                                                  value={app.aplikasiKategori || "Transaksional"}
                                                  onChange={(e) => handleUpdateApp(actualIndex, "aplikasiKategori", e.target.value)}
                                                >
                                                  <option value="Transaksional">Transaksional</option>
                                                  <option value="Monitoring">Monitoring</option>
                                                  <option value="Regulatory">Regulatory</option>
                                                  <option value="Pelaporan">Pelaporan</option>
                                                  <option value="CORE_BANKING">CORE_BANKING</option>
                                                  <option value="PAYMENT_GATEWAY">PAYMENT_GATEWAY</option>
                                                </Select>
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                                                  Kode ITSP
                                                </FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  placeholder="Kode ITSP"
                                                  value={app.itspKode || ""}
                                                  onChange={(e) => handleUpdateApp(actualIndex, "itspKode", e.target.value)}
                                                />
                                              </FormControl>
                                            </SimpleGrid>
                                          </Box>
                                        );
                                      })}
                                    </VStack>
                                  ) : (
                                    <Box
                                      p={3}
                                      bg={colorMode === "light" ? "gray.50" : "gray.800"}
                                      rounded="md"
                                      border="1px dashed"
                                      borderColor={colorMode === "light" ? "gray.300" : "gray.650"}
                                    >
                                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        Belum ada aplikasi terkait. Klik tombol &ldquo;Tambah Aplikasi Terkait&rdquo; di atas untuk menambahkan.
                                      </Text>
                                    </Box>
                                  )}
                                </Box>
                              </VStack>
                            );
                          })()}
                        </VStack>
                      ) : (
                        <VStack spacing={5} align="stretch">
                          {/* General Information Grid */}
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem label="Nomor Request" value={Data.requestNo} />
                            <InfoItem label="Tipe Perubahan" value={Data.requestType} />
                            <InfoItem label="Sisi Aplikasi" value={Data.appSide === "OTHER" ? `OTHER (${Data.appSideOther || "-"})` : (Data.appSide || "WEB")} />
                            <InfoItem label="Jenis CAB" value={Data.jenisCab || "WEEKLY"} />
                            <InfoItem label="Target Date" value={new Date(Data.targetDate).toLocaleDateString("id-ID")} />
                            <InfoItem label="Requester" value={`${Data.requesterName} (${Data.requesterEmail})`} />
                            <InfoItem label="Tanggal Request" value={new Date(Data.requestDate).toLocaleDateString("id-ID")} />
                          </SimpleGrid>

                          {/* ─── APLIKASI UTAMA & APLIKASI TERKAIT ─── */}
                          <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                          {(() => {
                            const appsList: CabSoftwareApplicationItem[] =
                              Data.applications && Data.applications.length > 0
                                ? Data.applications
                                : (Data.applicationName || Data.projectName)
                                  ? [
                                      {
                                        id: "app-main-0",
                                        applicationId: Data.applicationId || "app-001",
                                        applicationName: Data.applicationName || Data.projectName || "-",
                                        aplikasiKategori: Data.aplikasiKategori || "CORE_BANKING",
                                        rfcKodeProject: Data.rfcKodeProject || "-",
                                        itspKode: Data.itspKode || "-",
                                      },
                                    ]
                                  : [];

                            const mainApp = appsList[0] || {
                              applicationId: Data.applicationId || "app-001",
                              applicationName: Data.applicationName || Data.projectName || "-",
                              aplikasiKategori: Data.aplikasiKategori || "CORE_BANKING",
                              rfcKodeProject: Data.rfcKodeProject || "-",
                              itspKode: Data.itspKode || "-",
                            };

                            const relatedApps = appsList.slice(1);

                            return (
                              <VStack spacing={4} align="stretch">
                                {/* 1. Aplikasi Utama Section */}
                                <Box>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                                    Aplikasi Utama
                                  </Text>
                                  <Box
                                    p={4}
                                    bg={colorMode === "light" ? "blue.50/50" : "gray.750"}
                                    rounded="lg"
                                    border="1.5px solid"
                                    borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                                    position="relative"
                                  >
                                    <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
                                      <HStack spacing={2.5}>
                                        <Badge colorScheme="blue" variant="solid" rounded="md" px={2.5} py={0.5} fontSize="2xs" fontWeight="bold">
                                          Aplikasi Utama
                                        </Badge>
                                        <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "blue.900" : "blue.100"}>
                                          {mainApp.applicationName || Data.projectName || "-"}
                                        </Text>
                                      </HStack>
                                      {(mainApp.aplikasiKategori || Data.aplikasiKategori) && (
                                        <Badge colorScheme="blue" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="semibold">
                                          {mainApp.aplikasiKategori || Data.aplikasiKategori}
                                        </Badge>
                                      )}
                                    </Flex>

                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3} fontSize="xs">
                                      <Box p={2.5} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                        <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>Kategori Aplikasi</Text>
                                        <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                          {mainApp.aplikasiKategori || Data.aplikasiKategori || "-"}
                                        </Text>
                                      </Box>
                                      <Box p={2.5} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                        <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>RFC / Kode Project</Text>
                                        <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                          {mainApp.rfcKodeProject || Data.rfcKodeProject || "-"}
                                        </Text>
                                      </Box>
                                      <Box p={2.5} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                        <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>Kode ITSP</Text>
                                        <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                          {mainApp.itspKode || Data.itspKode || "-"}
                                        </Text>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>
                                </Box>

                                {/* 2. Aplikasi Terkait Section */}
                                <Box>
                                  <Flex justify="space-between" align="center" mb={2}>
                                    <HStack spacing={2}>
                                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                        Aplikasi Terkait
                                      </Text>
                                      <Badge colorScheme={relatedApps.length > 0 ? "purple" : "gray"} variant="subtle" rounded="full" px={2} fontSize="3xs">
                                        {relatedApps.length} Terpilih
                                      </Badge>
                                    </HStack>
                                  </Flex>

                                  {relatedApps.length > 0 ? (
                                    <VStack spacing={2.5} align="stretch">
                                      {relatedApps.map((app, idx) => (
                                        <Box
                                          key={app.id || idx}
                                          p={3.5}
                                          bg={colorMode === "light" ? "purple.50/25" : "gray.750"}
                                          rounded="lg"
                                          border="1px solid"
                                          borderColor={colorMode === "light" ? "purple.200" : "purple.900"}
                                        >
                                          <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={2.5}>
                                            <HStack spacing={2}>
                                              <Badge colorScheme="purple" variant="solid" rounded="md" px={2} py={0.5} fontSize="3xs" fontWeight="bold">
                                                Aplikasi Terkait #{idx + 1}
                                              </Badge>
                                              <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                                {app.applicationName || "Aplikasi"}
                                              </Text>
                                            </HStack>
                                            {app.aplikasiKategori && (
                                              <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} py={0.5} fontSize="3xs" fontWeight="semibold">
                                                {app.aplikasiKategori}
                                              </Badge>
                                            )}
                                          </Flex>

                                          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={2.5} fontSize="xs">
                                            <Box p={2} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                              <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>Kategori Aplikasi</Text>
                                              <Text fontWeight="medium" color={colorMode === "light" ? "gray.800" : "gray.200"}>{app.aplikasiKategori || "-"}</Text>
                                            </Box>
                                            <Box p={2} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                              <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>RFC / Kode Project</Text>
                                              <Text fontWeight="medium" color={colorMode === "light" ? "gray.800" : "gray.200"}>{app.rfcKodeProject || "-"}</Text>
                                            </Box>
                                            <Box p={2} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                              <Text color="gray.500" fontSize="2xs" fontWeight="semibold" mb={0.5}>Kode ITSP</Text>
                                              <Text fontWeight="medium" color={colorMode === "light" ? "gray.800" : "gray.200"}>{app.itspKode || "-"}</Text>
                                            </Box>
                                          </SimpleGrid>
                                        </Box>
                                      ))}
                                    </VStack>
                                  ) : (
                                    <Box
                                      p={3}
                                      bg={colorMode === "light" ? "gray.50" : "gray.800"}
                                      rounded="md"
                                      border="1px dashed"
                                      borderColor={colorMode === "light" ? "gray.300" : "gray.650"}
                                    >
                                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        Tidak ada aplikasi terkait yang dipilih pada permohonan ini.
                                      </Text>
                                    </Box>
                                  )}
                                </Box>
                              </VStack>
                            );
                          })()}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* STEP 2: Hasil UAT & Kesiapan Implementasi */}
                  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                          <Badge colorScheme="green" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 2</Badge>
                          <Box w="4px" h="18px" bg="green.500" rounded="full" />
                          <Heading size="sm">Hasil UAT</Heading>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      {isEditingRequest ? (
                        <VStack spacing={4} align="stretch">
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Hasil Pengujian UAT</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.hasilUat}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, hasilUat: e.target.value })}
                              >
                                <option value="BERHASIL_BAIK">BERHASIL BAIK (100%)</option>
                                <option value="BERHASIL_CATATAN">BERHASIL DENGAN CATATAN</option>
                                <option value="TIDAK_BERHASIL">TIDAK BERHASIL</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Rekomendasi UAT</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.rekomendasiUat}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, rekomendasiUat: e.target.value })}
                              >
                                <option value="REKOMENDASI_MIGRASI">DIREKOMENDASIKAN MIGRASI</option>
                                <option value="PENGUJIAN_ULANG">PERLU PENGUJIAN ULANG</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>

                          {requestEditForm.hasilUat === "BERHASIL_CATATAN" && (
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Catatan Hasil UAT</FormLabel>
                              <Textarea
                                size="sm"
                                rounded="lg"
                                rows={3}
                                placeholder="Tuliskan catatan hasil pengujian UAT..."
                                value={requestEditForm.hasilUatCatatan}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, hasilUatCatatan: e.target.value })}
                              />
                            </FormControl>
                          )}

                          {/* Memo Permohonan Migrasi Form */}
                          {requestEditForm.rekomendasiUat === "REKOMENDASI_MIGRASI" && (
                            <Box p={3.5} bg={colorMode === "light" ? "gray.50" : "gray.750"} rounded="lg" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.650"}>
                              <VStack spacing={3.5} align="stretch">
                                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider">
                                  Informasi Umum (Memo Permohonan Migrasi)
                                </Text>

                                {/* Radio Sudah Memiliki Memo Pengantar */}
                                <FormControl isRequired>
                                  <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Sudah Memiliki Memo Pengantar</FormLabel>
                                  <RadioGroup
                                    value={requestEditForm.isHaveMemo || "Y"}
                                    onChange={(val) => setRequestEditForm({ ...requestEditForm, isHaveMemo: val as "Y" | "N" })}
                                  >
                                    <HStack spacing={6}>
                                      <Radio size="sm" value="Y">Sudah</Radio>
                                      <Radio size="sm" value="N">Belum</Radio>
                                    </HStack>
                                  </RadioGroup>
                                  <Text fontSize="2xs" color="gray.500" fontStyle="italic" mt={1}>
                                    Jika belum memiliki Memo pengantar, ada beberapa informasi yang akan diinputkan lain waktu jika Memo pengantar sudah ada.*
                                  </Text>
                                </FormControl>

                                <Divider borderColor={colorMode === "dark" ? "gray.650" : "gray.200"} />

                                {requestEditForm.isHaveMemo === "N" ? (
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                    <FormControl isRequired gridColumn={{ base: "span 1", md: "span 2" }}>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Perihal Sementara*</FormLabel>
                                      <Textarea
                                        size="sm"
                                        rounded="lg"
                                        rows={2}
                                        placeholder="Perihal Sementara..."
                                        value={requestEditForm.perihalSementara || requestEditForm.memoPerihal}
                                        onChange={(e) =>
                                          setRequestEditForm({
                                            ...requestEditForm,
                                            perihalSementara: e.target.value.toUpperCase(),
                                            memoPerihal: e.target.value.toUpperCase(),
                                          })
                                        }
                                      />
                                    </FormControl>
                                    <FormControl isRequired>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tanggal Permohonan Migrasi*</FormLabel>
                                      <Input
                                        type="date"
                                        size="sm"
                                        rounded="lg"
                                        value={requestEditForm.tanggalPermohonanMigrasi}
                                        onChange={(e) => setRequestEditForm({ ...requestEditForm, tanggalPermohonanMigrasi: e.target.value })}
                                      />
                                    </FormControl>
                                  </SimpleGrid>
                                ) : (
                                  <>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Direktorat Pengirim*</FormLabel>
                                        <ChakraReactSelect
                                          options={[
                                            { label: "Direktorat IT & Operasional", value: "Direktorat IT & Operasional" },
                                            { label: "Direktorat Konsumer dan Ritel", value: "Direktorat Konsumer dan Ritel" },
                                            { label: "Direktorat Komersial & UMKM", value: "Direktorat Komersial & UMKM" },
                                            { label: "Direktorat Operasional", value: "Direktorat Operasional" },
                                            { label: "Direktorat Kepatuhan", value: "Direktorat Kepatuhan" },
                                            { label: "Direktorat Manajemen Risiko", value: "Direktorat Manajemen Risiko" },
                                            { label: "Direktorat Keuangan", value: "Direktorat Keuangan" },
                                          ]}
                                          isSearchable={true}
                                          placeholder="Direktorat (Auto)"
                                          value={
                                            requestEditForm.memoDirektoratPengirim
                                              ? { label: requestEditForm.memoDirektoratPengirim, value: requestEditForm.memoDirektoratPengirim }
                                              : { label: "Direktorat IT & Operasional", value: "Direktorat IT & Operasional" }
                                          }
                                          isDisabled={true}
                                          chakraStyles={{
                                            control: (provided: any) => ({
                                              ...provided,
                                              bg: colorMode === "dark" ? "gray.800" : "gray.100",
                                              borderColor: colorMode === "dark" ? "gray.600" : "gray.200",
                                              rounded: "lg",
                                            }),
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Divisi Pengirim*</FormLabel>
                                        <ChakraReactSelect
                                          options={[
                                            { label: "Divisi Information Technology", value: "Divisi Information Technology" },
                                            { label: "Divisi IT Digital Banking", value: "Divisi IT Digital Banking" },
                                            { label: "Divisi Digital Banking", value: "Divisi Digital Banking" },
                                            { label: "Divisi Komersial", value: "Divisi Komersial" },
                                            { label: "Divisi Operasional", value: "Divisi Operasional" },
                                            { label: "Divisi Kepatuhan", value: "Divisi Kepatuhan" },
                                            { label: "Divisi Manajemen Risiko", value: "Divisi Manajemen Risiko" },
                                            { label: "Divisi Keuangan & Akuntansi", value: "Divisi Keuangan & Akuntansi" },
                                            { label: "Divisi Treasury", value: "Divisi Treasury" },
                                          ]}
                                          isSearchable={true}
                                          isClearable
                                          placeholder="Pilih Divisi Pengirim"
                                          value={
                                            requestEditForm.memoDivisiPengirim
                                              ? { label: requestEditForm.memoDivisiPengirim, value: requestEditForm.memoDivisiPengirim }
                                              : null
                                          }
                                          onChange={(opt: any) => {
                                            const dirMap: Record<string, string> = {
                                              "Divisi Information Technology": "Direktorat IT & Operasional",
                                              "Divisi IT Digital Banking": "Direktorat IT & Operasional",
                                              "Divisi Digital Banking": "Direktorat Konsumer dan Ritel",
                                              "Divisi Komersial": "Direktorat Komersial & UMKM",
                                              "Divisi Operasional": "Direktorat Operasional",
                                              "Divisi Kepatuhan": "Direktorat Kepatuhan",
                                              "Divisi Manajemen Risiko": "Direktorat Manajemen Risiko",
                                              "Divisi Keuangan & Akuntansi": "Direktorat Keuangan",
                                              "Divisi Treasury": "Direktorat Keuangan",
                                            };
                                            if (opt) {
                                              setRequestEditForm({
                                                ...requestEditForm,
                                                memoDivisiPengirim: opt.value,
                                                memoDirektoratPengirim: dirMap[opt.value] || "Direktorat IT & Operasional",
                                              });
                                            } else {
                                              setRequestEditForm({
                                                ...requestEditForm,
                                                memoDivisiPengirim: "",
                                                memoDirektoratPengirim: "",
                                              });
                                            }
                                          }}
                                          chakraStyles={{
                                            control: (provided: any) => ({
                                              ...provided,
                                              bg: colorMode === "dark" ? "gray.700" : "white",
                                              borderColor: colorMode === "dark" ? "gray.600" : "gray.200",
                                              rounded: "lg",
                                            }),
                                            menu: (provided: any) => ({
                                              ...provided,
                                              zIndex: 9999,
                                            }),
                                          }}
                                          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                        />
                                      </FormControl>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Nomor Memo*</FormLabel>
                                        <Input
                                          size="sm"
                                          rounded="lg"
                                          placeholder="0000/XXX-XXX/X/YYYY"
                                          value={requestEditForm.memoNomor}
                                          onChange={(e) => setRequestEditForm({ ...requestEditForm, memoNomor: e.target.value.toUpperCase() })}
                                        />
                                      </FormControl>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tanggal Permohonan Migrasi*</FormLabel>
                                        <Input
                                          type="date"
                                          size="sm"
                                          rounded="lg"
                                          value={requestEditForm.tanggalPermohonanMigrasi}
                                          onChange={(e) => setRequestEditForm({ ...requestEditForm, tanggalPermohonanMigrasi: e.target.value })}
                                        />
                                      </FormControl>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tanggal Memo*</FormLabel>
                                        <Input
                                          type="date"
                                          size="sm"
                                          rounded="lg"
                                          value={requestEditForm.memoTanggal}
                                          onChange={(e) => setRequestEditForm({ ...requestEditForm, memoTanggal: e.target.value })}
                                        />
                                      </FormControl>
                                      <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tanggal Memo Diterima*</FormLabel>
                                        <Input
                                          type="date"
                                          size="sm"
                                          rounded="lg"
                                          value={requestEditForm.memoTanggalDiterima}
                                          onChange={(e) => setRequestEditForm({ ...requestEditForm, memoTanggalDiterima: e.target.value })}
                                        />
                                      </FormControl>
                                    </SimpleGrid>

                                    <FormControl>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Perihal*</FormLabel>
                                      <Textarea
                                        size="sm"
                                        rounded="lg"
                                        rows={2}
                                        placeholder="Perihal memo..."
                                        value={requestEditForm.memoPerihal}
                                        onChange={(e) => setRequestEditForm({ ...requestEditForm, memoPerihal: e.target.value })}
                                      />
                                    </FormControl>

                                    <HStack spacing={2} p={2} bg={colorMode === "light" ? "white" : "gray.800"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                                      <Text fontSize="2xs" color="gray.500" fontWeight="bold">Durasi Memo:</Text>
                                      <Text fontSize="xs" fontWeight="bold" color="blue.600">
                                        {requestEditForm.memoTanggal && requestEditForm.memoTanggalDiterima
                                          ? `${calculateDurationInDays(requestEditForm.memoTanggal, requestEditForm.memoTanggalDiterima)} Hari Kalendar`
                                          : "-"}
                                      </Text>
                                    </HStack>
                                  </>
                                )}
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <VStack spacing={3.5} align="stretch">
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <InfoItem
                              label="Hasil UAT"
                              value={
                                <Badge colorScheme={Data.hasilUat?.includes("BERHASIL_CATATAN") ? "yellow" : Data.hasilUat?.includes("TIDAK_BERHASIL") ? "red" : "green"} variant="subtle" rounded="full" px={2}>
                                  {Array.isArray(Data.hasilUat) ? Data.hasilUat.join(", ") : (Data.hasilUat || "BERHASIL BAIK")}
                                </Badge>
                              }
                            />
                            <InfoItem
                              label="Rekomendasi UAT"
                              value={
                                <Badge colorScheme="blue" variant="subtle" rounded="full" px={2}>
                                  {Data.rekomendasiUat || "DIREKOMENDASIKAN MIGRASI"}
                                </Badge>
                              }
                            />
                            <InfoItem
                              label="Tgl Permohonan Migrasi"
                              value={Data.tanggalPermohonanMigrasi ? new Date(Data.tanggalPermohonanMigrasi).toLocaleDateString("id-ID") : new Date(Data.targetDate).toLocaleDateString("id-ID")}
                            />
                          </SimpleGrid>

                          {Data.hasilUatCatatan && (
                            <Box p={3} rounded="md" bg={colorMode === "light" ? "yellow.50" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "yellow.200" : "yellow.800"}>
                              <Text fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "yellow.800" : "yellow.300"} mb={0.5}>
                                Catatan Hasil Pengujian UAT:
                              </Text>
                              <Text fontSize="xs" color={colorMode === "light" ? "gray.800" : "gray.200"} whiteSpace="pre-wrap">
                                {Data.hasilUatCatatan}
                              </Text>
                            </Box>
                          )}

                          {/* Memo Permohonan Migrasi (Informasi Umum) View */}
                          {(Data.rekomendasiUat === "REKOMENDASI_MIGRASI" || Data.memoNomor || Data.perihalSementara) && (
                            <>
                              <Divider />
                              <Box p={3.5} bg={colorMode === "light" ? "gray.50" : "gray.750"} rounded="lg" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.650"}>
                                <VStack spacing={3} align="stretch">
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider">
                                      Informasi Umum (Memo Permohonan Migrasi)
                                    </Text>
                                    <Badge colorScheme={Data.isHaveMemo === "N" ? "orange" : "green"} variant="subtle" rounded="full" px={2}>
                                      {Data.isHaveMemo === "N" ? "Belum Memiliki Memo" : "Sudah Memiliki Memo"}
                                    </Badge>
                                  </Flex>

                                  {Data.isHaveMemo === "N" ? (
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                                        <Text fontSize="xs" color="gray.500" mb={0.5}>Perihal Sementara:</Text>
                                        <Text fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                                          {Data.perihalSementara || Data.memoPerihal || "-"}
                                        </Text>
                                      </Box>
                                      <InfoItem
                                        label="Tanggal Permohonan Migrasi"
                                        value={Data.tanggalPermohonanMigrasi ? new Date(Data.tanggalPermohonanMigrasi).toLocaleDateString("id-ID") : "-"}
                                      />
                                    </SimpleGrid>
                                  ) : (
                                    <>
                                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                        <InfoItem label="Direktorat Pengirim" value={Data.memoDirektoratPengirim || "Direktorat IT & Operasional"} />
                                        <InfoItem label="Divisi Pengirim" value={Data.memoDivisiPengirim || "Divisi IT Digital Banking"} />
                                        <InfoItem label="Nomor Memo" value={Data.memoNomor || "0128/IT-DB/MEMO/2026"} />
                                        <InfoItem label="Tanggal Memo" value={Data.memoTanggal ? new Date(Data.memoTanggal).toLocaleDateString("id-ID") : "15 Agustus 2026"} />
                                        <InfoItem label="Tanggal Memo Diterima" value={Data.memoTanggalDiterima ? new Date(Data.memoTanggalDiterima).toLocaleDateString("id-ID") : "16 Agustus 2026"} />
                                        <InfoItem
                                          label="Durasi Memo"
                                          value={
                                            Data.memoTanggal && Data.memoTanggalDiterima
                                              ? `${calculateDurationInDays(Data.memoTanggal, Data.memoTanggalDiterima)} Hari Kalendar`
                                              : "1 Hari Kalendar"
                                          }
                                        />
                                      </SimpleGrid>
                                      <Box pt={1}>
                                        <Text fontSize="xs" color="gray.500" mb={0.5}>Perihal:</Text>
                                        <Text fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                                          {Data.memoPerihal || "Permohonan Migrasi Perubahan Sistem ke Lingkungan Production"}
                                        </Text>
                                      </Box>
                                    </>
                                  )}
                                </VStack>
                              </Box>
                            </>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* STEP 3: Waktu Pelaksanaan & Rencana Downtime */}
                  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.800"} bg={colorMode === "light" ? "white" : "gray.800"}>
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                          <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 3</Badge>
                          <Box w="4px" h="18px" bg="blue.500" rounded="full" />
                          <Heading size="sm">Waktu Pelaksanaan & Rencana Downtime</Heading>
                        </HStack>
                        {/* <HStack spacing={2}>
                          {Data.downtime === "ADA" && (
                            <Badge colorScheme="purple" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="xs">
                              Downtime: {isEditingRequest ? requestEditForm.downtimeDurasi : (Data.downtimeDurasi || "60 Menit")}
                            </Badge>
                          )}
                        </HStack> */}
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      {isEditingRequest ? (
                        <VStack spacing={4} align="stretch">
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Status Downtime</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.downtime}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, downtime: e.target.value as any })}
                              >
                                <option value="ADA">ADA DOWNTIME</option>
                                <option value="TIDAK">TIDAK ADA DOWNTIME (ZERO DOWNTIME)</option>
                              </Select>
                            </FormControl>

                            {requestEditForm.downtime === "ADA" && (
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Durasi Estimasi Downtime</FormLabel>
                                <Input
                                  size="sm"
                                  rounded="lg"
                                  value={requestEditForm.downtimeDurasi}
                                  onChange={(e) => setRequestEditForm({ ...requestEditForm, downtimeDurasi: e.target.value })}
                                  placeholder="Contoh: 60 Menit, 70 Menit, 2 Jam..."
                                />
                              </FormControl>
                            )}

                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Potensi Risiko Konflik</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.risikoKonflik}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, risikoKonflik: e.target.value as any })}
                              >
                                <option value="TIDAK_ADA">TIDAK ADA</option>
                                <option value="ADA">ADA RISIKO KONFLIK</option>
                              </Select>
                            </FormControl>

                            {requestEditForm.risikoKonflik === "ADA" && (
                              <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Aplikasi Berpotensi Konflik (Tags)</FormLabel>
                                <CreatableSelect
                                  isMulti
                                  isSearchable
                                  isClearable
                                  placeholder="Pilih atau ketik nama aplikasi (tekan Enter)..."
                                  noOptionsMessage={() => "Ketik nama aplikasi dan tekan Enter"}
                                  formatCreateLabel={(inputValue) => `+ Tambah aplikasi "${inputValue}"`}
                                  options={[
                                    { label: "Core Banking System (CBS)", value: "Core Banking System (CBS)" },
                                    { label: "DIGI Mobile Banking", value: "DIGI Mobile Banking" },
                                    { label: "Corporate Internet Banking (IBC)", value: "Corporate Internet Banking (IBC)" },
                                    { label: "Payment Gateway (BI-FAST / RTGS / SKN)", value: "Payment Gateway (BI-FAST / RTGS / SKN)" },
                                    { label: "ATM Switching & ISO8583 Gateway", value: "ATM Switching & ISO8583 Gateway" },
                                    { label: "Card Management System (CMS)", value: "Card Management System (CMS)" },
                                    { label: "Loan Origination System (LOS)", value: "Loan Origination System (LOS)" },
                                    { label: "Treasury System (Kondor+)", value: "Treasury System (Kondor+)" },
                                    { label: "Customer Relationship Management (CRM)", value: "Customer Relationship Management (CRM)" },
                                    { label: "Enterprise Data Warehouse (DWH)", value: "Enterprise Data Warehouse (DWH)" },
                                    { label: "Anti-Money Laundering (AML)", value: "Anti-Money Laundering (AML)" },
                                    { label: "Enterprise Service Bus (ESB / API Gateway)", value: "Enterprise Service Bus (ESB / API Gateway)" },
                                  ]}
                                  value={(requestEditForm.risikoKonflikAplikasi || []).map((app: string) => ({ label: app, value: app }))}
                                  onChange={(newValue: any) => {
                                    const selectedApps = (newValue || []).map((item: any) => item.value);
                                    setRequestEditForm({ ...requestEditForm, risikoKonflikAplikasi: selectedApps });
                                  }}
                                  chakraStyles={{
                                    control: (provided: any) => ({
                                      ...provided,
                                      bg: colorMode === "dark" ? "gray.700" : "white",
                                      borderColor: colorMode === "dark" ? "gray.600" : "gray.200",
                                      rounded: "lg",
                                    }),
                                    multiValue: (provided: any) => ({
                                      ...provided,
                                      bg: colorMode === "dark" ? "blue.900" : "blue.50",
                                      color: colorMode === "dark" ? "blue.200" : "blue.700",
                                      border: "1px solid",
                                      borderColor: colorMode === "dark" ? "blue.700" : "blue.200",
                                      rounded: "md",
                                    }),
                                    multiValueLabel: (provided: any) => ({
                                      ...provided,
                                      color: colorMode === "dark" ? "blue.200" : "blue.700",
                                      fontWeight: "semibold",
                                    }),
                                    multiValueRemove: (provided: any) => ({
                                      ...provided,
                                      color: colorMode === "dark" ? "blue.300" : "blue.600",
                                      ":hover": {
                                        bg: colorMode === "dark" ? "blue.800" : "blue.100",
                                        color: "blue.500",
                                      },
                                    }),
                                    menu: (provided: any) => ({
                                      ...provided,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                />
                              </FormControl>
                            )}

                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Instalasi di Area DRC</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.instalasiAreaDrc}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, instalasiAreaDrc: e.target.value as any })}
                              >
                                <option value="YA">YA (AREA DRC)</option>
                                <option value="TIDAK">TIDAK</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Ceklist Migrasi (SW) & Rundown</FormLabel>
                              <Select
                                size="sm"
                                rounded="lg"
                                value={requestEditForm.ceklistMigrasi || "ADA"}
                                onChange={(e) => setRequestEditForm({ ...requestEditForm, ceklistMigrasi: e.target.value as any })}
                              >
                                <option value="ADA">ADA</option>
                                <option value="TIDAK">TIDAK ADA</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem
                              label="Status Downtime"
                              value={
                                <HStack spacing={2}>
                                  <Badge colorScheme={Data.downtime === "ADA" ? "orange" : "green"} variant="subtle" rounded="full" px={2}>
                                    {Data.downtime === "ADA" ? "ADA DOWNTIME" : "ZERO DOWNTIME"}
                                  </Badge>
                                  {/* {Data.downtime === "ADA" && (
                                    <Badge colorScheme="purple" variant="solid" rounded="full" px={2}>
                                      {Data.downtimeDurasi || "60 Menit"}
                                    </Badge>
                                  )} */}
                                </HStack>
                              }
                            />
                            <InfoItem label="Estimasi Durasi Downtime" value={Data.downtimeDurasi || "60 Menit"} />
                            <InfoItem
                              label="Risiko Konflik"
                              value={
                                <VStack align="start" spacing={1}>
                                  <Badge colorScheme={Data.risikoKonflik === "ADA" ? "orange" : "green"} variant="subtle" rounded="full" px={2}>
                                    {Data.risikoKonflik === "ADA" ? "ADA RISIKO KONFLIK" : "TIDAK ADA"}
                                  </Badge>
                                  {Data.risikoKonflik === "ADA" && Data.risikoKonflikAplikasi && Data.risikoKonflikAplikasi.length > 0 && (
                                    <Wrap spacing={1} pt={0.5}>
                                      {Data.risikoKonflikAplikasi.map((app, idx) => (
                                        <WrapItem key={idx}>
                                          <Tag size="xs" colorScheme="blue" variant="subtle" rounded="md">
                                            <TagLabel>{app}</TagLabel>
                                          </Tag>
                                        </WrapItem>
                                      ))}
                                    </Wrap>
                                  )}
                                </VStack>
                              }
                            />
                            <InfoItem label="Instalasi Area DRC" value={Data.instalasiAreaDrc === "YA" ? "YA" : "TIDAK"} />
                            <InfoItem
                              label="Ceklist Migrasi (SW) & Rundown"
                              value={
                                <Badge colorScheme={Data.ceklistMigrasi === "TIDAK" ? "gray" : "green"} variant="subtle" rounded="full" px={2}>
                                  {Data.ceklistMigrasi === "TIDAK" ? "TIDAK ADA" : "ADA"}
                                </Badge>
                              }
                            />
                          </SimpleGrid>
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* STEP 4: Kelengkapan Dokumen & Security Assessment */}
                  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                          <Badge colorScheme="cyan" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 4</Badge>
                          <Box w="4px" h="18px" bg="purple.500" rounded="full" />
                          <Heading size="sm">Kelengkapan Dokumen & Security Assessment</Heading>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      {isEditingRequest ? (
                        <VStack spacing={4} align="stretch">
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Hasil SAST</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.sast} onChange={(e) => setRequestEditForm({ ...requestEditForm, sast: e.target.value as any })}>
                                <option value="ADA">ADA / VALID</option>
                                <option value="TIDAK">TIDAK</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Dokumen Arsitektur</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.dokumenArsitektur} onChange={(e) => setRequestEditForm({ ...requestEditForm, dokumenArsitektur: e.target.value as any })}>
                                <option value="ADA">ADA</option>
                                <option value="TIDAK">TIDAK ADA</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Kesiapan Infra</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.kesiapanInfrastruktur} onChange={(e) => setRequestEditForm({ ...requestEditForm, kesiapanInfrastruktur: e.target.value as any })}>
                                <option value="YA">SIAP (YA)</option>
                                <option value="TIDAK">BELUM SIAP</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Source Code Repository</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.sourceAplikasi} onChange={(e) => setRequestEditForm({ ...requestEditForm, sourceAplikasi: e.target.value as any })}>
                                <option value="ADA">TERSEDIA (ADA)</option>
                                <option value="TIDAK">TIDAK</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Tools Monitoring</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.toolsMonitoring} onChange={(e) => setRequestEditForm({ ...requestEditForm, toolsMonitoring: e.target.value as any })}>
                                <option value="ADA">TERSEDIA (ADA)</option>
                                <option value="TIDAK_ADA">TIDAK ADA</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Persetujuan IT Security</FormLabel>
                              <Select size="sm" rounded="lg" value={requestEditForm.persetujuanItSecurity} onChange={(e) => setRequestEditForm({ ...requestEditForm, persetujuanItSecurity: e.target.value as any })}>
                                <option value="YA">DISETUJUI (YA)</option>
                                <option value="TIDAK">BELUM</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Deskripsi Perubahan</FormLabel>
                            <Textarea
                              size="sm"
                              rows={2}
                              rounded="lg"
                              value={requestEditForm.description}
                              onChange={(e) => setRequestEditForm({ ...requestEditForm, description: e.target.value })}
                              placeholder="Deskripsi request..."
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Analisis Dampak & Risiko</FormLabel>
                            <Textarea
                              size="sm"
                              rows={2}
                              rounded="lg"
                              value={requestEditForm.impactAnalysis}
                              onChange={(e) => setRequestEditForm({ ...requestEditForm, impactAnalysis: e.target.value })}
                              placeholder="Analisis dampak..."
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Rencana Rollback</FormLabel>
                            <Textarea
                              size="sm"
                              rows={2}
                              rounded="lg"
                              value={requestEditForm.rollbackPlan}
                              onChange={(e) => setRequestEditForm({ ...requestEditForm, rollbackPlan: e.target.value })}
                              placeholder="Rencana rollback..."
                            />
                          </FormControl>
                        </VStack>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                            <InfoItem label="Hasil SAST" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.sast || "ADA"}</Badge>} />
                            <InfoItem label="Dokumen Arsitektur" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.dokumenArsitektur || "ADA"}</Badge>} />
                            <InfoItem label="Kesiapan Infra" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.kesiapanInfrastruktur || "YA"}</Badge>} />
                            <InfoItem label="Source Code Repo" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.sourceAplikasi || "ADA"}</Badge>} />
                            <InfoItem label="Tools Monitoring" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.toolsMonitoring || "ADA"}</Badge>} />
                            <InfoItem label="Persetujuan Security" value={<Badge colorScheme="green" variant="subtle" rounded="full" px={2}>{Data.persetujuanItSecurity || "YA"}</Badge>} />
                          </SimpleGrid>
                          <Divider />
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Deskripsi Perubahan:</Text>
                              <Text fontSize="xs" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.description}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Analisis Dampak:</Text>
                              <Text fontSize="xs" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.impactAnalysis}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Rencana Rollback:</Text>
                              <Text fontSize="xs" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.rollbackPlan}</Text>
                            </Box>
                          </SimpleGrid>
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* STEP 5: PIC Migrasi & Komite CAB */}
                  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                          <Badge colorScheme="teal" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 5</Badge>
                          <Box w="4px" h="18px" bg="teal.500" rounded="full" />
                          <Heading size="sm">PIC Migrasi & Komite CAB</Heading>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      {isEditingRequest ? (
                        <VStack spacing={6} align="stretch">
                          <PicMigrasiField
                            value={requestEditForm.picMigrasi}
                            onChange={(pics) => setRequestEditForm({ ...requestEditForm, picMigrasi: pics })}
                            fetchUsers={fetchUsers}
                            tokenData={tokenData}
                          />
                          <CommitteeCabField
                            value={requestEditForm.committeeCab}
                            onChange={(members) => setRequestEditForm({ ...requestEditForm, committeeCab: members })}
                            fetchUsers={fetchUsers}
                            tokenData={tokenData}
                          />
                          <Divider />
                          <Flex justify="flex-end" gap={3} pt={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsEditingRequest(false)}
                            >
                              Batal
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              bg="blue.600"
                              color="white"
                              _hover={{ bg: "blue.700" }}
                              shadow="md"
                              leftIcon={<FiSave />}
                              fontWeight="bold"
                              onClick={handleSaveRequestEdit}
                              isLoading={loading}
                            >
                              Simpan Semua Perubahan
                            </Button>
                          </Flex>
                        </VStack>
                      ) : (
                        <VStack spacing={5} align="stretch">
                          {/* 1. PIC Pelaksana Migrasi Table */}
                          {(() => {
                            const picList = Array.isArray(Data.picMigrasi) && Data.picMigrasi.length > 0
                              ? Data.picMigrasi
                              : (Data.picMigrasi as any)?.userName
                                ? [Data.picMigrasi as any]
                                : Data.requesterName
                                  ? [{ userName: Data.requesterName, divisi: "Divisi IT Digital Banking", type: "INTERNAL_IT" }]
                                  : [];

                            return (
                              <Box>
                                <Flex justify="space-between" align="center" mb={2.5}>
                                  <HStack spacing={2}>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                      PIC Pelaksana Migrasi (Internal IT)
                                    </Text>
                                    <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} fontSize="3xs">
                                      {picList.length} PIC
                                    </Badge>
                                  </HStack>
                                </Flex>

                                {picList.length > 0 ? (
                                  <TableContainer
                                    w="full"
                                    border="1px solid"
                                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                    rounded="lg"
                                    overflow="hidden"
                                    bg={colorMode === "light" ? "white" : "gray.800"}
                                  >
                                    <Table size="sm" variant="simple">
                                      <Thead bg={colorMode === "light" ? "gray.50" : "gray.750"}>
                                        <Tr>
                                          <Th w="60px" textAlign="center" fontSize="2xs" color="gray.500">
                                            NO
                                          </Th>
                                          <Th fontSize="2xs" color="gray.500">
                                            NAMA PIC
                                          </Th>
                                          <Th fontSize="2xs" color="gray.500">
                                            ASAL DIVISI
                                          </Th>
                                          <Th w="120px" textAlign="center" fontSize="2xs" color="gray.500">
                                            TIPE
                                          </Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {picList.map((pic, idx) => (
                                          <Tr
                                            key={idx}
                                            _hover={{ bg: colorMode === "light" ? "blue.50/40" : "gray.750" }}
                                            transition="background 0.15s ease"
                                          >
                                            <Td textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.500">
                                              {idx + 1}
                                            </Td>
                                            <Td fontSize="xs">
                                              <HStack spacing={2.5}>
                                                <Avatar size="xs" name={pic.userName} bg="blue.500" color="white" />
                                                <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                                  {pic.userName}
                                                </Text>
                                              </HStack>
                                            </Td>
                                            <Td fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.300"}>
                                              {pic.divisi || "Divisi IT"}
                                            </Td>
                                            <Td textAlign="center">
                                              <Badge colorScheme="blue" variant="subtle" fontSize="3xs" rounded="full" px={2} py={0.5}>
                                                Internal IT
                                              </Badge>
                                            </Td>
                                          </Tr>
                                        ))}
                                      </Tbody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Box
                                    p={3}
                                    bg={colorMode === "light" ? "gray.50" : "gray.800"}
                                    rounded="md"
                                    border="1px dashed"
                                    borderColor={colorMode === "light" ? "gray.300" : "gray.650"}
                                  >
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                      Belum ada PIC pelaksana migrasi yang ditentukan.
                                    </Text>
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}

                          {/* 2. Anggota Komite CAB Table */}
                          {(() => {
                            const committeeList = Array.isArray(Data.committeeCab) && Data.committeeCab.length > 0
                              ? Data.committeeCab
                              : [];

                            return (
                              <Box>
                                <Flex justify="space-between" align="center" mb={2.5}>
                                  <HStack spacing={2}>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                      Anggota Komite CAB yang Hadir / Terlibat
                                    </Text>
                                    <Badge colorScheme="teal" variant="subtle" rounded="full" px={2} fontSize="3xs">
                                      {committeeList.length} Anggota
                                    </Badge>
                                  </HStack>
                                </Flex>

                                {committeeList.length > 0 ? (
                                  <TableContainer
                                    w="full"
                                    border="1px solid"
                                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                    rounded="lg"
                                    overflow="hidden"
                                    bg={colorMode === "light" ? "white" : "gray.800"}
                                  >
                                    <Table size="sm" variant="simple">
                                      <Thead bg={colorMode === "light" ? "gray.50" : "gray.750"}>
                                        <Tr>
                                          <Th w="60px" textAlign="center" fontSize="2xs" color="gray.500">
                                            NO
                                          </Th>
                                          <Th fontSize="2xs" color="gray.500">
                                            NAMA ANGGOTA
                                          </Th>
                                          <Th fontSize="2xs" color="gray.500">
                                            ASAL DIVISI / INSTITUSI
                                          </Th>
                                          <Th w="120px" textAlign="center" fontSize="2xs" color="gray.500">
                                            KATEGORI
                                          </Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {committeeList.map((cm, idx) => {
                                          const divisionOrInstitution =
                                            cm.type === "EXTERNAL"
                                              ? cm.asalInstitusi || cm.asalDivisi || "-"
                                              : cm.asalDivisi || "-";
                                          return (
                                            <Tr
                                              key={idx}
                                              _hover={{ bg: colorMode === "light" ? "teal.50/40" : "gray.750" }}
                                              transition="background 0.15s ease"
                                            >
                                              <Td textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.500">
                                                {idx + 1}
                                              </Td>
                                              <Td fontSize="xs">
                                                <HStack spacing={2}>
                                                  <Avatar size="xs" name={cm.userName} bg="teal.500" color="white" />
                                                  <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                                    {cm.userName}
                                                  </Text>
                                                </HStack>
                                              </Td>
                                              <Td fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.300"}>
                                                {divisionOrInstitution}
                                              </Td>
                                              <Td textAlign="center">
                                                <Badge
                                                  fontSize="3xs"
                                                  rounded="full"
                                                  px={2}
                                                  py={0.5}
                                                  colorScheme={
                                                    cm.type === "INTERNAL_IT"
                                                      ? "blue"
                                                      : cm.type === "INTERNAL_BJB"
                                                      ? "green"
                                                      : "purple"
                                                  }
                                                  variant="subtle"
                                                >
                                                  {cm.type === "INTERNAL_IT"
                                                    ? "Internal IT"
                                                    : cm.type === "INTERNAL_BJB"
                                                    ? "Internal BJB"
                                                    : "Eksternal"}
                                                </Badge>
                                              </Td>
                                            </Tr>
                                          );
                                        })}
                                      </Tbody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Box
                                    p={3}
                                    bg={colorMode === "light" ? "gray.50" : "gray.800"}
                                    rounded="md"
                                    border="1px dashed"
                                    borderColor={colorMode === "light" ? "gray.300" : "gray.650"}
                                  >
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                      Belum ada anggota komite CAB yang ditambahkan.
                                    </Text>
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* Bottom Navigation for Step 1 (Only when NOT APPROVED) */}
                  {!isApproved && (
                    <Card
                      rounded={radiusStyle}
                      shadow="sm"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      w="full"
                    >
                      <CardBody px={{ base: 4, md: 5 }} py={3}>
                        <Flex justify="flex-end" align="center" w="full">
                          <Button
                            colorScheme="blue"
                            bg="blue.600"
                            color="white"
                            _hover={{ bg: "blue.700", transform: "translateY(-1px)", shadow: "md" }}
                            size="sm"
                            rightIcon={<FiArrowRight />}
                            onClick={() => {
                              setActiveDetailStep(2);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            px={6}
                            shadow="sm"
                            fontWeight="bold"
                          >
                           Selanjutnya
                          </Button>
                        </Flex>
                      </CardBody>
                    </Card>
                  )}

                  {/* ─── Consolidated History/Results (Only when APPROVED) ─── */}
                  {isApproved && (
                    <>
                      {/* Jadwal Rapat CAB */}
                      {Data.scheduledDate && (
                        <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                            <HStack spacing={2}>
                              <Box w="4px" h="18px" bg="teal.400" rounded="full" />
                              <Heading size="sm">Jadwal Sidang Rapat CAB</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody px={5} py={4}>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" fontWeight="bold">
                                {new Date(Data.scheduledDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                {" "}• {new Date(Data.scheduledDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                {Data.scheduledEndDate ? ` - ${new Date(Data.scheduledEndDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : " WIB"}
                              </Text>
                              {Data.cabLocation && (
                                <HStack spacing={2}>
                                  <Icon as={FiMapPin} color="teal.500" boxSize={3.5} />
                                  <Text fontSize="xs" color="gray.600">{Data.cabLocation}</Text>
                                </HStack>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      )}

                      {/* Hasil Evaluasi CAB & Catatan Sidang */}
                      {Data.cabResult && (
                        <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                            <HStack spacing={2}>
                              <Box w="4px" h="18px" bg="purple.400" rounded="full" />
                              <Heading size="sm">Hasil Sidang CAB & Evaluasi Migrasi</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody px={5} py={4}>
                            <VStack align="start" spacing={2.5}>
                              <Text fontSize="sm" lineHeight="tall">{Data.cabResult}</Text>
                              {Data.implementationStatus && (
                                <Badge colorScheme={Data.implementationStatus === "SUCCESS" ? "green" : Data.implementationStatus === "FAILED" ? "red" : "orange"} px={2} py={0.5} rounded="md">
                                  Status Implementasi: {Data.implementationStatus}
                                </Badge>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      )}

                      {/* Completed Approval Decision Card */}
                      <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="green.300" bg={colorMode === "light" ? "green.50" : "gray.800"}>
                        <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "green.100" : "gray.700"}>
                          <Flex justify="space-between" align="center" w="full">
                            <HStack spacing={2}>
                              <Icon as={FiCheckCircle} color="green.500" />
                              <Heading size="sm" color="green.700">Permohonan CAB Selesai (COMPLETED)</Heading>
                            </HStack>
                            <Badge colorScheme="green" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                              SELESAI / COMPLETED
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack spacing={2} align="stretch">
                            <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                              Permohonan CAB ini telah disetujui secara resmi oleh Approver dan seluruh alur proses telah selesai.
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </>
                  )}
                </>
              )}

              {/* ─── STEP 2 CONTENT: DETAIL TAHAPAN & AKSI EKSEKUSI ─── */}
              {!isApproved && activeDetailStep === 2 && (
                <>
                  {/* Top Context & Summary Dossier Card */}
                  {/* <Card
                    rounded={radiusStyle}
                    shadow="sm"
                    border="1px"
                    borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                    bg={colorMode === "light" ? "blue.50" : "gray.850"}
                  > */}
                    {/* <CardBody px={5} py={4}>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3.5}>
                        <HStack spacing={2.5}>
                          <Box w="4px" h="20px" bg="blue.500" rounded="full" />
                          <VStack align="start" spacing={0}>
                            <Heading size="xs" color={colorMode === "light" ? "blue.900" : "blue.200"}>
                              Konteks & Ringkasan Permohonan CAB
                            </Heading>
                            <Text fontSize="2xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                              {getStep2Desc(Data.status)}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="blue" variant="solid" rounded="full" px={3} py={0.5} fontSize="2xs">
                          TAHAPAN: {getStep2Title(Data.status).toUpperCase()}
                        </Badge>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                        <Box p={2.5} rounded="md" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <Text fontSize="3xs" color="gray.400" fontWeight="bold" textTransform="uppercase">No. Permohonan</Text>
                          <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>{Data.requestNo || "-"}</Text>
                        </Box>
                        <Box p={2.5} rounded="md" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <Text fontSize="3xs" color="gray.400" fontWeight="bold" textTransform="uppercase">Pemohon / Maker</Text>
                          <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} noOfLines={1}>{Data.requesterName || "Maker"}</Text>
                        </Box>
                        <Box p={2.5} rounded="md" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <Text fontSize="3xs" color="gray.400" fontWeight="bold" textTransform="uppercase">Kategori / Tipe</Text>
                          <HStack spacing={1} mt={0.5}>
                            <Badge colorScheme="purple" fontSize="3xs">{Data.category || "SOFTWARE"}</Badge>
                            <Badge colorScheme="blue" fontSize="3xs">{Data.requestType || "DEPLOYMENT"}</Badge>
                          </HStack>
                        </Box>
                        <Box p={2.5} rounded="md" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <Text fontSize="3xs" color="gray.400" fontWeight="bold" textTransform="uppercase">Estimasi Downtime</Text>
                          <Text fontSize="xs" fontWeight="bold" color={Data.downtime === "ADA" ? "orange.500" : "green.500"}>
                            {Data.downtime === "ADA" ? (Data.downtimeDurasi || "Ada Downtime") : "Tanpa Downtime"}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody> */}
                  

                  {/* ─── STAGE 2: Penjadwalan Rapat CAB (Status: REQUEST / PENGAJUAN) ─── */}
                  {(Data.status === "PENGAJUAN" || Data.status === "REQUEST") && (
                    canSchedule ? (
                      (() => {
                        const isDateDifferent = Boolean(
                          Data.requestedCabDate &&
                          scheduleForm.scheduledDate &&
                          new Date(Data.requestedCabDate).toISOString().slice(0, 16) !== new Date(scheduleForm.scheduledDate).toISOString().slice(0, 16)
                        );

                        return (
                          <Card
                            rounded={radiusStyle}
                            shadow="sm"
                            border="1px solid"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
                            <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                              <Flex justify="space-between" align="center" w="full">
                                <HStack spacing={2}>
                                  <Box w="4px" h="18px" bg="blue.500" rounded="full" />
                                  <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                    Penetapan Jadwal CAB Meeting (Scheduler)
                                  </Heading>
                                </HStack>

                              </Flex>
                            </CardHeader>
                            <CardBody px={5} py={4}>
                              <VStack spacing={4} align="stretch">
                                {/* Usulan Jadwal Awal & Perbandingan Timeline */}
                                {Data.requestedCabDate && (
                                  <Box
                                    p={4}
                                    bg={colorMode === "light" ? "gray.50" : "gray.750"}
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor={colorMode === "light" ? "gray.200" : "gray.650"}
                                  >
                                    <VStack align="stretch" spacing={3}>
                                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                        <HStack spacing={2}>
                                          <Icon as={FiList} color="blue.500" boxSize={3.5} />
                                          <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                                            Riwayat Usulan & Penyesuaian Jadwal
                                          </Text>
                                        </HStack>
                                        {isDateDifferent && (
                                          <Badge colorScheme="orange" variant="subtle" px={2} py={0.5} rounded="full" fontSize="3xs" fontWeight="bold">
                                            RESCHEDULED (DISESUAIKAN)
                                          </Badge>
                                        )}
                                      </Flex>

                                      <VStack spacing={0} align="stretch" position="relative" pl={1} pt={1}>
                                        <HStack align="start" spacing={3.5} position="relative" pb={isDateDifferent && scheduleForm.scheduledDate ? 4 : 0}>
                                          {isDateDifferent && scheduleForm.scheduledDate && (
                                            <Box
                                              position="absolute"
                                              left="13px"
                                              top="26px"
                                              bottom="-4px"
                                              w="2px"
                                              bg={colorMode === "light" ? "gray.300" : "gray.600"}
                                            />
                                          )}

                                          <Box
                                            w="28px"
                                            h="28px"
                                            rounded="full"
                                            bg={colorMode === "light" ? "blue.50" : "blue.900"}
                                            border="2px solid"
                                            borderColor="blue.500"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            flexShrink={0}
                                            zIndex={1}
                                          >
                                            <Icon as={FiCalendar} color="blue.500" boxSize={3.5} />
                                          </Box>

                                          <VStack align="start" spacing={1.5} flex={1}>
                                            <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={1}>
                                              <HStack spacing={1.5}>
                                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                                  {Data.requesterName || "Maker"}
                                                </Text>
                                                <Text fontSize="2xs" color="gray.500">
                                                  mengajukan jadwal CAB
                                                </Text>
                                              </HStack>
                                              <Badge colorScheme="blue" variant="subtle" fontSize="3xs" px={1.5} rounded="sm">
                                                USULAN AWAL
                                              </Badge>
                                            </Flex>

                                            <Box
                                              p={2.5}
                                              bg={colorMode === "light" ? "white" : "gray.800"}
                                              rounded="md"
                                              border="1px solid"
                                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                              w="full"
                                            >
                                              <HStack spacing={2} wrap="wrap">
                                                <Text fontSize="2xs" color="gray.500" fontWeight="semibold">
                                                  Tanggal & Jam:
                                                </Text>
                                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                                  {new Date(Data.requestedCabDate).toLocaleDateString("id-ID", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                  })}{" "}
                                                  • {new Date(Data.requestedCabDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                                                </Text>
                                              </HStack>
                                            </Box>
                                          </VStack>
                                        </HStack>

                                        {isDateDifferent && scheduleForm.scheduledDate && (
                                          <HStack align="start" spacing={3.5} position="relative" pt={2}>
                                            <Box
                                              w="28px"
                                              h="28px"
                                              rounded="full"
                                              bg={colorMode === "light" ? "orange.50" : "orange.950"}
                                              border="2px solid"
                                              borderColor="orange.500"
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="center"
                                              flexShrink={0}
                                              zIndex={1}
                                            >
                                              <Icon as={FiClock} color="orange.500" boxSize={3.5} />
                                            </Box>

                                            <VStack align="start" spacing={1.5} flex={1}>
                                              <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={1}>
                                                <HStack spacing={1.5}>
                                                  <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                                    Scheduler (PIC CAB)
                                                  </Text>
                                                  <Text fontSize="2xs" color="gray.500">
                                                    menetapkan jadwal baru
                                                  </Text>
                                                </HStack>
                                                <Badge colorScheme="orange" variant="solid" fontSize="3xs" px={1.5} rounded="sm">
                                                  JADWAL PENETAPAN
                                                </Badge>
                                              </Flex>

                                              <Box
                                                p={2.5}
                                                bg={colorMode === "light" ? "white" : "gray.800"}
                                                rounded="md"
                                                border="1px solid"
                                                borderColor={colorMode === "light" ? "orange.300" : "orange.800"}
                                                w="full"
                                              >
                                                <VStack align="start" spacing={1}>
                                                  <HStack spacing={2} wrap="wrap">
                                                    <Text fontSize="2xs" color="gray.500" fontWeight="semibold">
                                                      Perubahan Tanggal:
                                                    </Text>
                                                    <Text fontSize="2xs" as="s" color="gray.400">
                                                      {new Date(Data.requestedCabDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                    </Text>
                                                    <Icon as={FiArrowRight} color="orange.500" boxSize={3} />
                                                    <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                                                      {new Date(scheduleForm.scheduledDate).toLocaleDateString("id-ID", {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                      })}
                                                    </Text>
                                                  </HStack>
                                                  <HStack spacing={2} wrap="wrap">
                                                    <Text fontSize="2xs" color="gray.500" fontWeight="semibold">
                                                      Rentang Waktu:
                                                    </Text>
                                                    <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                                      {new Date(scheduleForm.scheduledDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                      {scheduleForm.scheduledEndDate
                                                        ? ` - ${new Date(scheduleForm.scheduledEndDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                                                        : " WIB"}
                                                    </Text>
                                                  </HStack>
                                                </VStack>
                                              </Box>
                                            </VStack>
                                          </HStack>
                                        )}
                                      </VStack>
                                    </VStack>
                                  </Box>
                                )}

                                {/* Form Input Penetapan Jadwal */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                      Tanggal & Jam Mulai Rapat CAB
                                    </FormLabel>
                                    <Input
                                      type="datetime-local"
                                      size="sm"
                                      rounded="lg"
                                      bg={colorMode === "light" ? "white" : "gray.750"}
                                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                      value={scheduleForm.scheduledDate}
                                      onChange={(e) => handleScheduleStartDateChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                      Tanggal & Jam Selesai Rapat CAB
                                    </FormLabel>
                                    <Input
                                      type="datetime-local"
                                      size="sm"
                                      rounded="lg"
                                      bg={colorMode === "light" ? "white" : "gray.750"}
                                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                      value={scheduleForm.scheduledEndDate}
                                      min={scheduleForm.scheduledDate || undefined}
                                      max={scheduleForm.scheduledDate ? `${scheduleForm.scheduledDate.slice(0, 10)}T23:59` : undefined}
                                      onChange={(e) => handleScheduleEndDateChange(e.target.value)}
                                    />
                                    <Text fontSize="2xs" color="blue.500" mt={1}>
                                      * Waktu selesai pada hari yang sama dengan tanggal mulai (maks. 24 jam).
                                    </Text>
                                  </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                  <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                    Lokasi Ruangan / Link Meeting Online (Zoom/Teams)
                                  </FormLabel>
                                  <Input
                                    placeholder="Contoh: Ruang Rapat IT Lt. 3 / https://zoom.us/j/..."
                                    size="sm"
                                    rounded="lg"
                                    bg={colorMode === "light" ? "white" : "gray.750"}
                                    borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                    value={scheduleForm.cabLocation}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, cabLocation: e.target.value })}
                                  />
                                </FormControl>

                                <Flex justify="end" pt={2}>
                                  <Button
                                    colorScheme="blue"
                                    bg="blue.600"
                                    color="white"
                                    _hover={{ bg: "blue.700", transform: "translateY(-1px)", shadow: "md" }}
                                    size="sm"
                                    leftIcon={<FiCalendar />}
                                    onClick={handleSaveSchedule}
                                    isLoading={loading}
                                    px={6}
                                    shadow="sm"
                                  >
                                    Schedule
                                  </Button>
                                </Flex>
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })()
                    ) : (
                      <Card rounded={radiusStyle} shadow="sm" border="1px solid" borderColor={colorMode === "light" ? "blue.200" : "blue.800"} bg={colorMode === "light" ? "white" : "gray.800"}>
                        <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                          <HStack spacing={2}>
                            <Icon as={FiClock} color="blue.500" />
                            <Heading size="sm">Menunggu Penetapan Jadwal Rapat CAB</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack align="start" spacing={3}>
                            <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                              Permohonan CAB telah berhasil diajukan dan saat ini berada di tahapan <strong>Penjadwalan CAB</strong>. Petugas Scheduler (PIC CAB) akan menetapkan tanggal, jam pelaksanaan rapat sidang, dan ruangan / link meeting online.
                            </Text>
                            {Data.requestedCabDate && (
                              <Box p={3.5} bg={colorMode === "light" ? "gray.50" : "gray.750"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.650"} w="full">
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={1}>
                                  USULAN JADWAL AWAL DARI MAKER:
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                  {new Date(Data.requestedCabDate).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}{" "}
                                  • {new Date(Data.requestedCabDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    )
                  )}

                  {/* ─── STAGE 2: Pelaksanaan Rapat CAB (Status: PELAKSANAAN / CONFIRM) ─── */}
                  {(Data.status === "PELAKSANAAN" || Data.status === "CONFIRM" || Data.status === "PENJADWALAN" || Data.status === "SCHEDULED" || Data.status === "SUBMITTED") && (
                    <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="teal.300" bg={colorMode === "light" ? "teal.50" : "gray.800"}>
                      <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "teal.100" : "gray.700"}>
                        <Flex justify="space-between" align="center" w="full">
                          <HStack spacing={2}>
                            <Icon as={FiUsers} color="teal.500" />
                            <Heading size="sm" color="teal.700">Pelaksanaan Rapat CAB (Scheduler & All Tim)</Heading>
                          </HStack>
                          <Badge colorScheme="teal" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                            TAHAP: PELAKSANAAN
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <VStack spacing={4} align="stretch">
                          {/* Context Details of the Confirmed Schedule */}
                          {Data.scheduledDate && (
                            <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.750"} rounded="lg" border="1px solid" borderColor={colorMode === "light" ? "teal.200" : "gray.650"}>
                              <VStack align="start" spacing={1.5}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Jadwal Sidang Terkonfirmasi:</Text>
                                <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                  {new Date(Data.scheduledDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                  {" "}• {new Date(Data.scheduledDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                  {Data.scheduledEndDate ? ` - ${new Date(Data.scheduledEndDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : " WIB"}
                                </Text>
                                {Data.cabLocation && (
                                  <HStack spacing={2} pt={1}>
                                    <Icon as={FiMapPin} color="teal.500" boxSize={3.5} />
                                    <Text fontSize="xs" color={colorMode === "light" ? "teal.900" : "teal.200"}>
                                      {Data.cabLocation}
                                    </Text>
                                  </HStack>
                                )}
                              </VStack>
                            </Box>
                          )}

                          {/* ─── Form / Data: Kesepakatan & Komitmen Pelaksanaan Migrasi ─── */}
                          <Box
                            p={4}
                            bg={colorMode === "light" ? "white" : "gray.750"}
                            rounded="lg"
                            border="1px solid"
                            borderColor={colorMode === "light" ? "teal.200" : "gray.650"}
                          >
                            <VStack spacing={3.5} align="stretch">
                              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                <HStack spacing={2}>
                                  <Icon as={FiFileText} color="teal.500" />
                                  <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "teal.800" : "teal.200"} textTransform="uppercase" letterSpacing="wider">
                                    Kesepakatan & Komitmen Pelaksanaan Migrasi
                                  </Text>
                                </HStack>
                                <Badge colorScheme="teal" variant="subtle" fontSize="3xs" rounded="md">
                                  Scheduler Action
                                </Badge>
                              </Flex>

                              {canSchedule ? (
                                <VStack spacing={3.5} align="stretch">
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
                                    {/* Keputusan Migrasi (Ya / Tidak) */}
                                    <FormControl isRequired>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                        Keputusan Migrasi
                                      </FormLabel>
                                      <RadioGroup
                                        value={commitmentForm.keputusanMigrasi || "YA"}
                                        onChange={(val) => setCommitmentForm((prev) => ({ ...prev, keputusanMigrasi: val as "YA" | "TIDAK" }))}
                                      >
                                        <HStack spacing={6} h="32px">
                                          <Radio size="sm" value="YA" colorScheme="teal">Ya (Disetujui)</Radio>
                                          <Radio size="sm" value="TIDAK" colorScheme="teal">Tidak (Ditolak / Ditunda)</Radio>
                                        </HStack>
                                      </RadioGroup>
                                    </FormControl>

                                    {/* Ketersediaan Waktu Migrasi Data Center */}
                                    <FormControl isRequired>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                        Ketersediaan Waktu Migrasi Data Center
                                      </FormLabel>
                                      <Input
                                        type="datetime-local"
                                        size="sm"
                                        rounded="lg"
                                        bg={colorMode === "light" ? "white" : "gray.700"}
                                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                        value={commitmentForm.ketersediaanWaktuMigrasiDc}
                                        onChange={(e) => setCommitmentForm((prev) => ({ ...prev, ketersediaanWaktuMigrasiDc: e.target.value }))}
                                      />
                                    </FormControl>

                                    {/* Kesepakatan Waktu Pelaksanaan Migrasi */}
                                    <FormControl isRequired gridColumn={{ base: "span 1", md: "span 2" }}>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                        Kesepakatan Waktu Pelaksanaan Migrasi
                                      </FormLabel>
                                      <Input
                                        type="datetime-local"
                                        size="sm"
                                        rounded="lg"
                                        bg={colorMode === "light" ? "white" : "gray.700"}
                                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                        value={commitmentForm.kesepakatanWaktuPelaksanaanMigrasi}
                                        onChange={(e) => setCommitmentForm((prev) => ({ ...prev, kesepakatanWaktuPelaksanaanMigrasi: e.target.value }))}
                                      />
                                    </FormControl>

                                    {/* PIR (Post Implementation Review) */}
                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                        PIR (Post Implementation Review)
                                      </FormLabel>
                                      <Textarea
                                        size="sm"
                                        rounded="lg"
                                        rows={3}
                                        isReadOnly
                                        isDisabled
                                        bg={colorMode === "light" ? "gray.100" : "gray.800"}
                                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                        color={colorMode === "light" ? "gray.700" : "gray.300"}
                                        value={"Diajukan oleh Product Owner.\nBila >90 hari tidak ada pengajuan PIR, maka Product Owner agar melengkapi Berita Acara (BA) Post Implementation Review (PIR) dan disampaikan kepada Divisi Information Technology"}
                                        cursor="not-allowed"
                                      />
                                    </FormControl>

                                    {/* Catatan Komitmen */}
                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                      <FormLabel fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                                        Catatan Komitmen
                                      </FormLabel>
                                      <Textarea
                                        size="sm"
                                        rounded="lg"
                                        rows={3}
                                        placeholder="Tuliskan catatan komitmen pelaksanaan migrasi..."
                                        bg={colorMode === "light" ? "white" : "gray.700"}
                                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                        value={commitmentForm.catatanKomitmen}
                                        onChange={(e) => setCommitmentForm((prev) => ({ ...prev, catatanKomitmen: e.target.value }))}
                                      />
                                    </FormControl>
                                  </SimpleGrid>
                                </VStack>
                              ) : (
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                  <InfoItem label="Keputusan Migrasi" value={Data.keputusanMigrasi === "TIDAK" ? "Tidak" : (Data.keputusanMigrasi || "Ya")} />
                                  <InfoItem
                                    label="Ketersediaan Waktu Migrasi Data Center"
                                    value={Data.ketersediaanWaktuMigrasiDc ? `${new Date(Data.ketersediaanWaktuMigrasiDc).toLocaleDateString("id-ID")} ${new Date(Data.ketersediaanWaktuMigrasiDc).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : "-"}
                                  />
                                  <InfoItem
                                    label="Kesepakatan Waktu Pelaksanaan Migrasi"
                                    value={Data.kesepakatanWaktuPelaksanaanMigrasi ? `${new Date(Data.kesepakatanWaktuPelaksanaanMigrasi).toLocaleDateString("id-ID")} ${new Date(Data.kesepakatanWaktuPelaksanaanMigrasi).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : (Data.kesepakatanWaktuPelaksanaan ? `${new Date(Data.kesepakatanWaktuPelaksanaan).toLocaleDateString("id-ID")} ${new Date(Data.kesepakatanWaktuPelaksanaan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : "-")}
                                  />
                                  <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                                    <InfoItem label="PIR (Post Implementation Review)" value="Diajukan oleh Product Owner. Bila >90 hari tidak ada pengajuan PIR, maka Product Owner agar melengkapi Berita Acara (BA) Post Implementation Review (PIR) dan disampaikan kepada Divisi Information Technology" />
                                  </Box>
                                  <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                                    <InfoItem label="Catatan Komitmen" value={Data.catatanKomitmen || "-"} />
                                  </Box>
                                </SimpleGrid>
                              )}
                            </VStack>
                          </Box>

                          {canSchedule ? (
                            <Flex justify="end" pt={2} gap={3} wrap="wrap">
                              <Button
                                colorScheme="teal"
                                bg="teal.600"
                                color="white"
                                _hover={{ bg: "teal.700" }}
                                size="sm"
                                leftIcon={<FiCheckCircle />}
                                onClick={handleConfirmMeeting}
                                isLoading={loading}
                                px={6}
                              >
                                Submit
                              </Button>
                            </Flex>
                          ) : (
                            <Box p={3} bg={colorMode === "light" ? "white" : "gray.750"} rounded="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.650"}>
                              <Text fontSize="xs" color="gray.500">
                                ℹ Menunggu Scheduler mengisikan komitmen migrasi saat rapat sidang CAB berlangsung bersama tim.
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* ─── STAGE 3: Evaluasi Migrasi, Checklist & Send to Approval (Status: IMPLEMENTASI / IMPLEMENT) ─── */}
                  {(Data.status === "IMPLEMENTASI" || Data.status === "IMPLEMENT") && (
                    <VStack spacing={5} align="stretch">
                      {/* Summary of Commitment from Pelaksanaan */}
                      {(Data.ketersediaanWaktuMigrasiDc || Data.kesepakatanWaktuPelaksanaanMigrasi || Data.pir || Data.catatanKomitmen) && (
                        <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.750"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "teal.200" : "gray.600"}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={2}>
                            Kesepakatan & Komitmen Migrasi Terkonfirmasi:
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            <InfoItem label="Keputusan Migrasi" value={Data.keputusanMigrasi === "TIDAK" ? "Tidak" : (Data.keputusanMigrasi || "Ya")} />
                            <InfoItem
                              label="Ketersediaan Waktu Migrasi Data Center"
                              value={Data.ketersediaanWaktuMigrasiDc ? `${new Date(Data.ketersediaanWaktuMigrasiDc).toLocaleDateString("id-ID")} ${new Date(Data.ketersediaanWaktuMigrasiDc).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : "-"}
                            />
                            <InfoItem
                              label="Kesepakatan Waktu Pelaksanaan Migrasi"
                              value={Data.kesepakatanWaktuPelaksanaanMigrasi ? `${new Date(Data.kesepakatanWaktuPelaksanaanMigrasi).toLocaleDateString("id-ID")} ${new Date(Data.kesepakatanWaktuPelaksanaanMigrasi).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : (Data.kesepakatanWaktuPelaksanaan ? `${new Date(Data.kesepakatanWaktuPelaksanaan).toLocaleDateString("id-ID")} ${new Date(Data.kesepakatanWaktuPelaksanaan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : "-")}
                            />
                            <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                              <InfoItem label="PIR (Post Implementation Review)" value="Diajukan oleh Product Owner. Bila >90 hari tidak ada pengajuan PIR, maka Product Owner agar melengkapi Berita Acara (BA) Post Implementation Review (PIR) dan disampaikan kepada Divisi Information Technology" />
                            </Box>
                            {Data.catatanKomitmen && (
                              <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                                <InfoItem label="Catatan Komitmen" value={Data.catatanKomitmen} />
                              </Box>
                            )}
                          </SimpleGrid>
                        </Box>
                      )}

                      {/* Activity Checklist CAB (Verifikasi Pra-Approval) */}
                      <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                        <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack spacing={2.5}>
                              <Icon as={FiCheckSquare} color="blue.500" />
                              <Heading size="sm">Activity Checklist CAB (Verifikasi Pra-Approval)</Heading>
                            </HStack>
                            <Badge
                              colorScheme={allActivitiesDone ? "green" : "orange"}
                              variant="subtle"
                              rounded="full"
                              px={2.5}
                              py={0.5}
                              fontSize="xs"
                            >
                              {completedActivitiesCount} / {totalActivitiesCount} Selesai ({activityPercent}%)
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack spacing={4} align="stretch">
                            <Box
                              p={3}
                              rounded="md"
                              bg={colorMode === "light" ? "blue.50" : "blue.950"}
                              border="1px solid"
                              borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                            >
                              <HStack spacing={2} mb={1}>
                                <Icon as={FiInfo} color="blue.500" />
                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "blue.800" : "blue.200"}>
                                  Daftar Verifikasi Kesiapan & Compliance
                                </Text>
                              </HStack>
                              <Text fontSize="2xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                                Verifikasi Terakhir
                              </Text>
                            </Box>

                            <Box>
                              <Progress
                                value={activityPercent}
                                size="xs"
                                colorScheme={allActivitiesDone ? "green" : "blue"}
                                rounded="full"
                                mb={1.5}
                              />
                              <Text fontSize="2xs" color="gray.500">
                                {allActivitiesDone
                                  ? "✓ Seluruh aktivitas telah diverifikasi dan selesai."
                                  : "Scheduler wajib mencentang seluruh aktivitas verifikasi sebelum mengirim request ke approval."}
                              </Text>
                            </Box>

                            <VStack spacing={2.5} align="stretch">
                              {activities.map((act) => {
                                const isFinalStatus = ["COMPLETED", "APPROVED", "REJECTED"].includes(Data.status);
                                const canToggle = !isFinalStatus;
                                return (
                                  <Box
                                    key={act.id}
                                    p={3}
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor={
                                      act.isDone
                                        ? colorMode === "light" ? "green.200" : "green.800"
                                        : colorMode === "light" ? "gray.200" : "gray.700"
                                    }
                                    bg={
                                      act.isDone
                                        ? colorMode === "light" ? "green.50" : "gray.800"
                                        : colorMode === "light" ? "white" : "gray.800"
                                    }
                                    cursor={canToggle ? "pointer" : "default"}
                                    onClick={() => canToggle && handleToggleActivity(act.id)}
                                    transition="all 0.15s ease"
                                    _hover={canToggle ? { borderColor: "blue.300", bg: colorMode === "light" ? "blue.50" : "gray.750" } : {}}
                                  >
                                    <Flex align="start" justify="space-between" gap={3}>
                                      <HStack align="start" spacing={3} flex={1}>
                                        <Checkbox
                                          isChecked={act.isDone}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            if (canToggle) handleToggleActivity(act.id);
                                          }}
                                          isDisabled={!canToggle}
                                          colorScheme="green"
                                          size="md"
                                          mt={0.5}
                                        />
                                        <VStack align="start" spacing={0.5} flex={1}>
                                          <Text
                                            fontSize="sm"
                                            fontWeight={act.isDone ? "semibold" : "medium"}
                                            color={
                                              act.isDone
                                                ? colorMode === "light" ? "green.900" : "green.200"
                                                : colorMode === "light" ? "gray.800" : "gray.200"
                                            }
                                          >
                                            {act.label}
                                          </Text>
                                          {act.description && (
                                            <Text fontSize="xs" color="gray.500">
                                              {act.description}
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>

                                      {act.isDone && (
                                        <Badge colorScheme="green" variant="solid" rounded="full" px={2} py={0.5} fontSize="3xs">
                                          Done {act.doneBy ? `by ${act.doneBy}` : ""}
                                        </Badge>
                                      )}
                                    </Flex>
                                  </Box>
                                );
                              })}
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Evaluasi Migrasi & Hasil Sidang CAB (Mark as Done) */}
                      <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="purple.300" bg={colorMode === "light" ? "purple.50" : "gray.800"}>
                        <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "purple.100" : "gray.700"}>
                          <Flex justify="space-between" align="center" w="full">
                            <HStack spacing={2}>
                              <Icon as={FiFileText} color="purple.500" />
                              <Heading size="sm" color="purple.700">Evaluasi Migrasi & Hasil Sidang CAB (Mark as Done)</Heading>
                            </HStack>
                            <Badge colorScheme="purple" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                              TAHAP: IMPLEMENTASI
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack spacing={4} align="stretch">
                            <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.750"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "purple.200" : "gray.600"}>
                              <HStack spacing={2} mb={1}>
                                <Icon as={FiCheckCircle} color="purple.500" boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                  Evaluasi & Hasil Sidang Rapat CAB
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.600">
                                Masukkan hasil evaluasi teknis, kesimpulan mitigasi, dan tentukan status implementasi migrasi sebelum mengirim permohonan ke Approver.
                              </Text>
                            </Box>

                            {canSchedule ? (
                              <VStack spacing={3.5} align="stretch">
                                <FormControl isRequired>
                                  <FormLabel fontSize="sm" fontWeight="semibold">Hasil Evaluasi / Catatan Sidang Meeting</FormLabel>
                                  <Textarea
                                    placeholder="Tuliskan hasil evaluasi migrasi & pembahasan CAB..."
                                    rows={4}
                                    size="sm"
                                    rounded="lg"
                                    bg={colorMode === "light" ? "white" : "gray.750"}
                                    value={resultForm.cabResult}
                                    onChange={(e) => setResultForm({ ...resultForm, cabResult: e.target.value })}
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="semibold">Catatan Tambahan CAB</FormLabel>
                                  <Textarea
                                    placeholder="Catatan opsional..."
                                    rows={3}
                                    size="sm"
                                    rounded="lg"
                                    bg={colorMode === "light" ? "white" : "gray.750"}
                                    value={resultForm.cabNotes}
                                    onChange={(e) => setResultForm({ ...resultForm, cabNotes: e.target.value })}
                                  />
                                </FormControl>
                                <FormControl isRequired>
                                  <FormLabel fontSize="sm" fontWeight="semibold">Status Implementasi</FormLabel>
                                  <Select
                                    size="sm"
                                    rounded="lg"
                                    bg={colorMode === "light" ? "white" : "gray.750"}
                                    value={resultForm.implementationStatus}
                                    onChange={(e) => setResultForm({ ...resultForm, implementationStatus: e.target.value })}
                                  >
                                    <option value="">-- Pilih Status --</option>
                                    <option value="SUCCESS">SUCCESS</option>
                                    <option value="FAILED">FAILED</option>
                                    <option value="PARTIAL">PARTIAL</option>
                                  </Select>
                                </FormControl>
                              </VStack>
                            ) : (
                              <Box p={3} bg={colorMode === "light" ? "white" : "gray.750"} rounded="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.650"}>
                                <Text fontSize="xs" color="gray.500">
                                  ℹ Menunggu Scheduler mengisikan catatan evaluasi migrasi dan status implementasi.
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Send to Approval Action Card */}
                      {canSchedule && (
                        <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="orange.300" bg={colorMode === "light" ? "orange.50" : "gray.800"}>
                          <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "orange.100" : "gray.700"}>
                            <Flex justify="space-between" align="center" w="full">
                              <HStack spacing={2}>
                                <Icon as={FiSend} color="orange.500" />
                                <Heading size="sm" color="orange.700">Kirim ke Approver (Send to Approval)</Heading>
                              </HStack>
                            </Flex>
                          </CardHeader>
                          <CardBody px={5} py={4}>
                            <VStack spacing={4} align="stretch">
                              <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.750"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "orange.200" : "gray.600"}>
                                <Text fontSize="xs" color="gray.600">
                                  Hasil evaluasi migrasi dan checklist verifikasi pra-approval telah siap. Pastikan seluruh poin checklist di atas telah dicentang dan form evaluasi terisi sebelum mengirim berkas permohonan ke Approver.
                                </Text>
                              </Box>

                              {(!resultForm.cabResult || !resultForm.implementationStatus) && (
                                <HStack p={3} bg={colorMode === "light" ? "purple.50" : "purple.950"} border="1px solid" borderColor="purple.300" rounded="lg" spacing={2.5}>
                                  <Icon as={FiAlertTriangle} color="purple.500" boxSize={4} flexShrink={0} />
                                  <Text fontSize="xs" color={colorMode === "light" ? "purple.800" : "purple.200"}>
                                    Perhatian: Anda wajib mengisi <strong>Hasil Evaluasi Sidang</strong> dan <strong>Status Implementasi</strong> pada form di atas.
                                  </Text>
                                </HStack>
                              )}

                              {!allActivitiesDone && (
                                <HStack p={3} bg={colorMode === "light" ? "orange.50" : "orange.950"} border="1px solid" borderColor="orange.300" rounded="lg" spacing={2.5}>
                                  <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} flexShrink={0} />
                                  <Text fontSize="xs" color={colorMode === "light" ? "orange.800" : "orange.200"}>
                                    Perhatian: Anda wajib mencentang seluruh <strong>Activity Checklist CAB ({completedActivitiesCount}/{totalActivitiesCount})</strong> di atas sebelum mengirim permohonan ke Approver.
                                  </Text>
                                </HStack>
                              )}

                              <Flex justify="end" pt={2}>
                                <Button
                                  colorScheme="orange"
                                  bg="orange.500"
                                  color="white"
                                  _hover={{ bg: "orange.600" }}
                                  size="sm"
                                  leftIcon={<FiSend />}
                                  onClick={handleSendToApproval}
                                  isLoading={loading}
                                  isDisabled={!allActivitiesDone || !resultForm.cabResult || !resultForm.implementationStatus}
                                  px={6}
                                >
                                  Submit
                                </Button>
                              </Flex>
                            </VStack>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  )}

                  {/* ─── STAGE 6: Approval Action (Status: SEND TO APPROVAL / WAITING APPROVAL) ─── */}
                  {["SEND TO APPROVAL", "SEND_TO_APPROVAL", "WAITING APPROVAL", "WAITING APPROVE", "PENDING_APPROVAL", "IN_REVIEW"].includes(Data.status) && (
                    <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="orange.300" bg={colorMode === "light" ? "orange.50" : "gray.800"}>
                      <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "orange.100" : "gray.700"}>
                        <Flex justify="space-between" align="center" w="full">
                          <HStack spacing={2}>
                            <Icon as={FiCheckCircle} color="orange.500" />
                            <Heading size="sm" color="orange.700">Keputusan Persetujuan (Approval Action)</Heading>
                          </HStack>
                          <Badge colorScheme="orange" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                            STAGE 6: APPROVAL DECISION
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <VStack spacing={4} align="stretch">
                          {/* Executive Dossier for Approver */}
                          {Data.cabResult && (
                            <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Hasil CAB Meeting & Evaluasi Migrasi:</Text>
                              <Text fontSize="sm" lineHeight="tall">{Data.cabResult}</Text>
                              <HStack spacing={2} mt={2.5} wrap="wrap">
                                {Data.implementationStatus && (
                                  <Badge colorScheme={Data.implementationStatus === "SUCCESS" ? "green" : Data.implementationStatus === "FAILED" ? "red" : "orange"}>
                                    Status Implementasi: {Data.implementationStatus}
                                  </Badge>
                                )}
                                <Badge colorScheme="green" variant="subtle">
                                  ✓ Checklist Pra-Approval: Terverifikasi Selesai
                                </Badge>
                              </HStack>
                            </Box>
                          )}

                          {canApprove ? (
                            <>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold">Catatan Approver</FormLabel>
                                <Textarea
                                  placeholder="Tambahkan catatan persetujuan (wajib jika menolak/reject)..."
                                  size="sm"
                                  rounded="lg"
                                  bg={colorMode === "light" ? "white" : "gray.750"}
                                  value={approvalNote}
                                  onChange={(e) => setApprovalNote(e.target.value)}
                                  rows={3}
                                />
                              </FormControl>
                              <HStack justify="end" spacing={3} pt={2}>
                                <Button colorScheme="red" variant="outline" size="sm" leftIcon={<FiX />} onClick={() => handleApprovalAction("REJECT")} isLoading={loading}>
                                  Tolak (REJECTED)
                                </Button>
                                <Button colorScheme="green" bg="green.600" color="white" _hover={{ bg: "green.700" }} size="sm" leftIcon={<FiCheck />} onClick={() => handleApprovalAction("APPROVE")} isLoading={loading}>
                                  Setujui Permohonan (COMPLETED)
                                </Button>
                              </HStack>
                            </>
                          ) : (
                            <Box p={3} bg={colorMode === "light" ? "white" : "gray.750"} rounded="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.650"}>
                              <Text fontSize="xs" color="gray.500">
                                ℹ Permohonan CAB telah diajukan ke Approver dan sedang menunggu keputusan persetujuan resmi.
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* ─── Rejected Summary (when REJECTED) ─── */}
                  {Data.status === "REJECTED" && (
                    <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="red.300" bg={colorMode === "light" ? "red.50" : "gray.800"}>
                      <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "red.100" : "gray.700"}>
                        <Flex justify="space-between" align="center" w="full">
                          <HStack spacing={2}>
                            <Icon as={FiXCircle} color="red.500" />
                            <Heading size="sm" color="red.700">Permohonan CAB Ditolak (REJECTED)</Heading>
                          </HStack>
                          <Badge colorScheme="red" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                            DITOLAK / REJECTED
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <VStack spacing={3} align="stretch">
                          <Text fontSize="sm" color={colorMode === "light" ? "red.800" : "red.300"}>
                            Permohonan CAB ini telah ditolak oleh Approver. Silakan periksa catatan penolakan untuk evaluasi lebih lanjut.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* Bottom Navigation for Step 2 */}
                  <Card
                    rounded={radiusStyle}
                    shadow="sm"
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    w="full"
                  >
                    <CardBody px={{ base: 4, md: 5 }} py={3}>
                      <Flex justify="flex-start" align="center" w="full">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FiArrowLeft />}
                          onClick={() => {
                            setActiveDetailStep(1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          px={5}
                          fontWeight="semibold"
                        >
                          Sebelumnya
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                </>
              )}
            </VStack>
          </GridItem>

          {/* Right — Sidebar */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack spacing={5} align="stretch">

              {/* Status Card */}
              <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                  <HStack spacing={2}><Box w="4px" h="20px" bg="secondary.400" rounded="full" /><Heading size="sm">Status</Heading></HStack>
                </CardHeader>
                <CardBody px={5} py={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Status</Text><StatusBadge status={Data.status} rounded="full" px={2} fontSize="xs" /></HStack>
                    <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Type</Text><Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">{Data.requestType}</Badge></HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* ─── SECTION: Jadwal Rapat CAB (High Contrast Highlight) ─── */}
              {Data.scheduledDate && ["PENJADWALAN", "SCHEDULED", "PELAKSANAAN", "CONFIRM", "IMPLEMENTASI", "IMPLEMENT", "SUBMITTED", "SEND TO APPROVAL", "SEND_TO_APPROVAL", "WAITING APPROVAL", "WAITING APPROVE", "COMPLETED", "APPROVED", "IN_REVIEW"].includes(Data.status) && (() => {
                const schedDate = new Date(Data.scheduledDate);
                const monthName = schedDate.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
                const dayNumber = schedDate.getDate();
                const fullDateStr = schedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const startTime = schedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const endTime = Data.scheduledEndDate ? new Date(Data.scheduledEndDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
                const timeRangeStr = endTime ? `${startTime} - ${endTime} WIB` : `${startTime} WIB`;

                return (
                  <Card
                    rounded={radiusStyle}
                    shadow="sm"
                    border="1px solid"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  >
                    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Flex justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                          <Box w="4px" h="18px" bg="blue.500" rounded="full" />
                          <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                            Jadwal Rapat CAB
                          </Heading>
                        </HStack>
                        <Badge colorScheme="blue" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="bold">
                          CONFIRMED
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      <VStack spacing={3.5} align="stretch">
                        {/* High-Contrast Calendar Tile & Schedule Row */}
                        <Flex
                          p={3.5}
                          bg={colorMode === "light" ? "gray.50" : "gray.750"}
                          border="1px solid"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.650"}
                          rounded="lg"
                          align="center"
                          gap={3.5}
                        >
                          {/* Calendar Tile */}
                          <Box
                            w="52px"
                            rounded="md"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="blue.600"
                            flexShrink={0}
                            shadow="xs"
                          >
                            <Box bg="blue.600" color="white" fontSize="3xs" fontWeight="bold" textAlign="center" py={0.5} letterSpacing="wider">
                              {monthName}
                            </Box>
                            <Box
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              color={colorMode === "light" ? "gray.800" : "white"}
                              fontSize="lg"
                              fontWeight="extrabold"
                              textAlign="center"
                              py={0.5}
                              lineHeight="none"
                            >
                              {dayNumber}
                            </Box>
                          </Box>

                          {/* Date and Time Details */}
                          <VStack align="start" spacing={1.5} flex={1}>
                            <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.850" : "white"} lineHeight="short">
                              {fullDateStr}
                            </Text>
                            <HStack spacing={1.5}>
                              <Icon as={FiClock} color="blue.500" boxSize={3.5} />
                              <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                                {timeRangeStr}
                              </Text>
                            </HStack>
                          </VStack>
                        </Flex>

                        {/* Location / Meeting Room */}
                        {Data.cabLocation && (
                          <HStack align="start" spacing={2.5} px={1}>
                            <Icon as={FiMapPin} color="gray.400" boxSize={4} mt={0.5} flexShrink={0} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="3xs" color="gray.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                                Link Meeting
                              </Text>
                              <Text fontSize="xs" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                                {Data.cabLocation}
                              </Text>
                            </VStack>
                          </HStack>
                        )}

                        {/* <Text fontSize="3xs" color="gray.400" fontStyle="italic" px={1}>
                          * Jadwal pelaksanaan rapat CAB telah ditetapkan oleh Scheduler.
                        </Text> */}
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })()}

              {/* Approval Timeline */}
              {Data.approvalHistory.length > 0 && (
                <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                    <HStack spacing={2}><Box w="4px" h="20px" bg="secondary.400" rounded="full" /><Heading size="sm">Approval Flow</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={0} align="stretch">
                      {Data.approvalHistory.map((step, idx) => {
                        const isLast = idx === Data.approvalHistory.length - 1;
                        const stepColor = step.status === "APPROVED" ? "green" : step.status === "REJECTED" ? "red" : "gray";
                        const StepIcon = step.status === "APPROVED" ? FiCheckCircle : step.status === "REJECTED" ? FiXCircle : FiClock;
                        return (
                          <HStack key={step.id} spacing={3} align="start" position="relative">
                            {!isLast && <Box position="absolute" left="15px" top="32px" bottom="-8px" w="2px" bg={colorMode === "light" ? "gray.200" : "gray.600"} />}
                            <Box w="32px" h="32px" bg={`${stepColor}.100`} rounded="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0} zIndex={1}>
                              <Icon as={StepIcon} color={`${stepColor}.600`} boxSize={4} />
                            </Box>
                            <VStack align="start" spacing={0} pb={4} flex={1}>
                              <Text fontSize="sm" fontWeight="semibold">{step.approverName}</Text>
                              <Text fontSize="xs" color="gray.500">{step.approverRole}</Text>
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme={stepColor} fontSize="2xs" rounded="full" px={2}>{step.status}</Badge>
                                {step.actionDate && <Text fontSize="2xs" color="gray.400">{new Date(step.actionDate).toLocaleDateString("id-ID")}</Text>}
                              </HStack>
                              {step.note && (
                                <Box mt={2} p={2} bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded="md" w="full">
                                  <Text fontSize="xs" color="gray.600" fontStyle="italic">&ldquo;{step.note}&rdquo;</Text>
                                </Box>
                              )}
                            </VStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

// ─── Reusable Components ─────────────────────────────────────────────────────
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
  const { colorMode } = useColorMode();
  return (
    <VStack align="start" spacing={0}>
      <Text fontSize="xs" color="gray.500">{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.100"}>{value || "-"}</Text>
      ) : (
        <Box mt={0.5}>{value || "-"}</Box>
      )}
    </VStack>
  );
};

const SectionCard = ({ title, accentColor, colorMode, children }: { title: string; accentColor: string; colorMode: string; children: React.ReactNode }) => (
  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
      <HStack spacing={2}><Box w="4px" h="20px" bg={accentColor} rounded="full" /><Heading size="sm">{title}</Heading></HStack>
    </CardHeader>
    <CardBody px={5} py={4}>{children}</CardBody>
  </Card>
);

export default CabRequestDetailView;
