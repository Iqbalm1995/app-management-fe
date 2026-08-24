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
  Input,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Tag,
  TagLabel,
  Text,
  Textarea,
  Tooltip,
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
  FiList,
  FiMapPin,
  FiRefreshCcw,
  FiSave,
  FiSend,
  FiShield,
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
import { CabCommitteeMember, CabPicInternalIT, CabRequestDetail } from "@/app/types/cabTypes";
import PicMigrasiField from "../create/components/PicMigrasiField";
import CommitteeCabField from "../create/components/CommitteeCabField";

type MockRole = "maker" | "scheduler" | "approver";

export const CAB_LIFECYCLE_STAGES = [
  { stage: 1, key: "REQUEST", label: "Pengajuan CAB", role: "Maker", desc: "Pengajuan Permohonan" },
  { stage: 2, key: "SCHEDULED", label: "Penjadwalan", role: "Scheduler", desc: "Penjadwalan Rapat" },
  { stage: 3, key: "CONFIRM", label: "Pelaksanaan", role: "Scheduler & Tim", desc: "Pelaksanaan Sidang CAB" },
  { stage: 4, key: "IMPLEMENT", label: "Evaluasi Migrasi", role: "Scheduler", desc: "Mark as Done" },
  { stage: 5, key: "WAITING APPROVAL", label: "Send to Approval", role: "Scheduler", desc: "Menunggu Persetujuan" },
  { stage: 6, key: "COMPLETED", label: "Approve / Selesai", role: "Approver", desc: "Keputusan Final" },
];

export const getStageIndex = (status?: string): number => {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "REQUEST":
      return 1;
    case "SCHEDULED":
    case "SUBMITTED":
      return 2;
    case "CONFIRM":
      return 3;
    case "IMPLEMENT":
      return 4;
    case "WAITING APPROVAL":
    case "WAITING APPROVE":
    case "PENDING_APPROVAL":
      return 5;
    case "COMPLETED":
    case "APPROVED":
      return 6;
    case "REJECTED":
      return 6;
    default:
      return 1;
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

  // Edit Request form (for scheduler in WAITING APPROVE status to modify any created fields)
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [requestEditForm, setRequestEditForm] = useState({
    requestTitle: "",
    requestType: "DEPLOYMENT",
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
    if (token) setTokenData(token);
  }, []);

  useEffect(() => {
    if (!DataAuth || !requestId || !tokenData) return;
    loadDetail();
  }, [DataAuth, requestId, tokenData]);

  const mapDetailToEditForm = (d: CabRequestDetail) => ({
    requestTitle: d.requestTitle || "",
    requestType: d.requestType || "DEPLOYMENT",
    projectName: d.projectName || "",
    targetDate: d.targetDate ? d.targetDate.slice(0, 10) : "",
    rfcKodeProject: d.rfcKodeProject || "RFC-2026-088",
    itspKode: d.itspKode || "ITSP-BJB-990",
    aplikasiKategori: d.aplikasiKategori || "CORE_BANKING",
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
    ceklistMigrasiRundown: d.ceklistMigrasiRundown || "1. Backup database snapshot (01:00)\n2. Stop service gateway (01:30)\n3. Deploy release binary (01:45)\n4. Database migration script (02:00)\n5. Smoke test & health check (02:20)\n6. Start traffic routing (02:30)",
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
  });

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
        setScheduleForm({ scheduledDate: res.data.requestedCabDate.slice(0, 16), scheduledEndDate: "", cabLocation: "" });
      }
      // Initialize edit form with all fields if not actively editing
      if (!isEditingRequest) {
        setRequestEditForm(mapDetailToEditForm(res.data));
      }
    }
    if (!silent) setIsLoading(false);
  };

  const startEditRequest = () => {
    if (!Data) return;
    setRequestEditForm(mapDetailToEditForm(Data));
    setIsEditingRequest(true);
  };

  const handleSaveRequestEdit = async () => {
    if (!requestEditForm.requestTitle.trim()) {
      showToast({ description: "Judul request wajib diisi", statusToast: "error" });
      return;
    }
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
    const success = await UpdateCabRequest(tokenData, requestId!, payloadToSave);
    if (success) {
      showToast({ description: "Data request CAB (termasuk durasi downtime & detail teknis) berhasil diperbarui", statusToast: "success" });
      setIsEditingRequest(false);
      loadDetail();
    }
  };

  // Activity checklist calculations
  const activities = Data?.activityChecklist || [];
  const completedActivitiesCount = activities.filter((a) => a.isDone).length;
  const totalActivitiesCount = activities.length;
  const allActivitiesDone = totalActivitiesCount > 0 && completedActivitiesCount === totalActivitiesCount;
  const activityPercent = totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0;

  const handleToggleActivity = async (activityId: string) => {
    if (!requestId || !Data) return;
    const userDoneBy = DataAuth?.nama || "Scheduler";
    const currentActivity = (Data.activityChecklist || []).find((a) => a.id === activityId);
    const willBeDone = !currentActivity?.isDone;

    // 1. Optimistic local state update (instant UI change without re-rendering/refreshing full page)
    setData((prev) => {
      if (!prev) return prev;
      const updatedChecklist = (prev.activityChecklist || []).map((act) => {
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

    // 2. Persist in background
    const success = await ToggleCabActivity(tokenData, requestId, activityId, userDoneBy);
    if (success) {
      // Background silent sync without flashing loading skeleton
      loadDetail(true);
    } else {
      // Revert if failed
      setData((prev) => {
        if (!prev) return prev;
        const revertedChecklist = (prev.activityChecklist || []).map((act) => {
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

  // Handlers
  const handleSaveSchedule = async () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledEndDate) {
      showToast({ description: "Tanggal mulai dan selesai wajib diisi", statusToast: "error" });
      return;
    }
    const success = await ScheduleCabRequest(tokenData, requestId!, scheduleForm);
    if (success) {
      showToast({ description: "Jadwal CAB berhasil disimpan. Status sekarang SCHEDULED.", statusToast: "success" });
      loadDetail();
    }
  };

  const handleConfirmMeeting = async () => {
    if (!requestId) return;
    const success = await ConfirmCabMeeting(tokenData, requestId);
    if (success) {
      showToast({
        description: "Status berhasil diubah menjadi CONFIRM. Sidang rapat CAB siap dilaksanakan bersama tim.",
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
        description: "Pelaksanaan rapat dan evaluasi migrasi telah ditandai selesai (Status: IMPLEMENT, isCabDone = Y).",
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
    if (Data?.status !== "IMPLEMENT" && Data?.isCabDone !== "Y") {
      showToast({
        description: "Scheduler wajib menandai evaluasi migrasi selesai (Status: IMPLEMENT) sebelum mengirim request ini ke Approver.",
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
      showToast({ description: "Request berhasil dikirim ke approver (Status: WAITING APPROVAL)", statusToast: "success" });
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
                {Data.status !== "DRAFT" && Data.status !== "REQUEST" && (
                  <Badge
                    colorScheme={Data.isCabDone === "Y" ? "green" : "yellow"}
                    variant="solid"
                    px={2}
                    rounded="full"
                    fontSize="xs"
                  >
                    Rapat CAB: {Data.isCabDone === "Y" ? "Selesai (Y)" : "Belum Selesai (N)"}
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

              {/* Stepper Summary & Prominent Edit Action Bar */}
              <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.800"} bg={colorMode === "light" ? "blue.50" : "gray.850"}>
                <CardBody px={5} py={3.5}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                    <VStack align="start" spacing={0.5}>
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="xs">
                          {Data.category || (Data.requestType?.toUpperCase().includes("INFRA") ? "HARDWARE" : "SOFTWARE")} REQUEST
                        </Badge>
                        <Heading size="xs" color={colorMode === "light" ? "blue.900" : "blue.200"}>
                          Data Formulir Permohonan CAB (5 Stepper Steps)
                        </Heading>
                      </HStack>
                      <Text fontSize="xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                        Seluruh data yang diisi dari proses create ditampilkan di bawah dan dapat diedit oleh Scheduler saat/setelah meeting CAB.
                      </Text>
                    </VStack>

                    {canSchedule && ["REQUEST", "SCHEDULED", "CONFIRM", "IMPLEMENT", "SUBMITTED", "WAITING APPROVAL", "WAITING APPROVE", "IN_REVIEW"].includes(Data.status) && (
                      !isEditingRequest ? (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          bg="blue.600"
                          color="white"
                          _hover={{ bg: "blue.700", transform: "translateY(-1px)", shadow: "lg" }}
                          shadow="md"
                          border="2px solid"
                          borderColor="blue.300"
                          leftIcon={<FiEdit2 />}
                          fontWeight="bold"
                          px={5}
                          onClick={startEditRequest}
                        >
                          Edit Data Request
                        </Button>
                      ) : (
                        <HStack spacing={2}>
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
                            Simpan Perubahan
                          </Button>
                        </HStack>
                      )
                    )}
                  </Flex>
                </CardBody>
              </Card>

              {/* STEP 1: Identitas Permohonan CAB */}
              <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                  <Flex justify="space-between" align="center" w="full">
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} fontSize="2xs">STEP 1</Badge>
                      <Box w="4px" h="18px" bg="secondary.400" rounded="full" />
                      <Heading size="sm">Identitas Permohonan CAB</Heading>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody px={5} py={4}>
                  {isEditingRequest ? (
                    <VStack spacing={4} align="stretch">
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
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>RFC / Kode Project</FormLabel>
                          <Input
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.rfcKodeProject}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, rfcKodeProject: e.target.value })}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Kode ITSP</FormLabel>
                          <Input
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.itspKode}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, itspKode: e.target.value })}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Kategori Aplikasi</FormLabel>
                          <Input
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.aplikasiKategori}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, aplikasiKategori: e.target.value })}
                          />
                        </FormControl>
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
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Nama Project / Aplikasi</FormLabel>
                          <Input
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.projectName}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, projectName: e.target.value })}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <InfoItem label="Nomor Request" value={Data.requestNo} />
                        <InfoItem label="Tipe Perubahan" value={Data.requestType} />
                        <InfoItem label="Sisi Aplikasi" value={Data.appSide === "OTHER" ? `OTHER (${Data.appSideOther || "-"})` : (Data.appSide || "WEB")} />
                        <InfoItem label="RFC / Kode Project" value={Data.rfcKodeProject || "RFC-2026-088"} />
                        <InfoItem label="Kode ITSP" value={Data.itspKode || "ITSP-BJB-990"} />
                        <InfoItem label="Kategori Aplikasi" value={Data.aplikasiKategori || "CORE_BANKING"} />
                        <InfoItem label="Jenis CAB" value={Data.jenisCab || "WEEKLY"} />
                        <InfoItem label="Nama Project" value={Data.projectName} />
                        <InfoItem label="Target Date" value={new Date(Data.targetDate).toLocaleDateString("id-ID")} />
                        <InfoItem label="Requester" value={`${Data.requesterName} (${Data.requesterEmail})`} />
                        <InfoItem label="Tanggal Request" value={new Date(Data.requestDate).toLocaleDateString("id-ID")} />
                      </SimpleGrid>

                      {Data.applications && Data.applications.length > 0 && (
                        <Box mt={2} p={3.5} bg={colorMode === "light" ? "blue.50/40" : "gray.750"} rounded="lg" border="1px solid" borderColor={colorMode === "light" ? "blue.100" : "gray.650"}>
                          <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={2}>
                            Daftar Aplikasi & Proyek Terkait ({Data.applications.length})
                          </Text>
                          <VStack spacing={2} align="stretch">
                            {Data.applications.map((app, idx) => (
                              <Flex key={idx} justify="space-between" align="center" p={2} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" fontSize="3xs" rounded="md">#{idx + 1}</Badge>
                                  <Text fontSize="xs" fontWeight="semibold">{app.applicationName || "Aplikasi"}</Text>
                                  {app.aplikasiKategori && <Badge colorScheme="purple" fontSize="3xs" rounded="full">{app.aplikasiKategori}</Badge>}
                                </HStack>
                                <HStack spacing={3} fontSize="xs" color="gray.500">
                                  {app.rfcKodeProject && <Text><Text as="span" fontWeight="medium">Project:</Text> {app.rfcKodeProject}</Text>}
                                  {app.itspKode && <Text><Text as="span" fontWeight="medium">ITSP:</Text> {app.itspKode}</Text>}
                                </HStack>
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )}
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
                    <HStack spacing={2}>
                      {Data.downtime === "ADA" && (
                        <Badge colorScheme="purple" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="xs">
                          Downtime: {isEditingRequest ? requestEditForm.downtimeDurasi : (Data.downtimeDurasi || "60 Menit")}
                        </Badge>
                      )}
                    </HStack>
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
                            value={requestEditForm.ceklistMigrasi || (requestEditForm.ceklistMigrasiRundown ? "ADA" : "TIDAK")}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, ceklistMigrasi: e.target.value as any })}
                          >
                            <option value="ADA">ADA</option>
                            <option value="TIDAK">TIDAK ADA</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      {(requestEditForm.ceklistMigrasi === "ADA" || requestEditForm.ceklistMigrasiRundown) && (
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Rundown & Langkah Eksekusi Migrasi</FormLabel>
                          <Textarea
                            size="sm"
                            rows={4}
                            rounded="lg"
                            value={requestEditForm.ceklistMigrasiRundown}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, ceklistMigrasiRundown: e.target.value })}
                            placeholder="Rundown langkah eksekusi migrasi..."
                          />
                        </FormControl>
                      )}
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
                              {Data.downtime === "ADA" && (
                                <Badge colorScheme="purple" variant="solid" rounded="full" px={2}>
                                  {Data.downtimeDurasi || "60 Menit"}
                                </Badge>
                              )}
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
                            <Badge colorScheme={(Data.ceklistMigrasi === "ADA" || Data.ceklistMigrasiRundown) ? "green" : "gray"} variant="subtle" rounded="full" px={2}>
                              {Data.ceklistMigrasi || (Data.ceklistMigrasiRundown ? "ADA" : "TIDAK")}
                            </Badge>
                          }
                        />
                      </SimpleGrid>
                      {Data.ceklistMigrasiRundown && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>Rundown Langkah Eksekusi Migrasi:</Text>
                            <Box p={3} rounded="md" bg={colorMode === "light" ? "gray.50" : "gray.750"} border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                              <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-line" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                                {Data.ceklistMigrasiRundown}
                              </Text>
                            </Box>
                          </Box>
                        </>
                      )}
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
                          Simpan Semua Perubahan (5 Step)
                        </Button>
                      </Flex>
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>
                          PIC Pelaksana Migrasi (Internal IT):
                        </Text>
                        {Array.isArray(Data.picMigrasi) && Data.picMigrasi.length > 0 ? (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2.5}>
                            {Data.picMigrasi.map((pic, idx) => (
                              <HStack
                                key={idx}
                                p={2.5}
                                bg={colorMode === "light" ? "blue.50" : "gray.750"}
                                border="1px solid"
                                borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                                rounded="lg"
                                justify="space-between"
                              >
                                <HStack spacing={2.5}>
                                  <Avatar size="xs" name={pic.userName} bg="blue.400" />
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="xs" fontWeight="bold">
                                      {pic.userName}
                                    </Text>
                                    <Text fontSize="3xs" color="gray.500">
                                      {pic.divisi || "Divisi IT"}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Badge colorScheme="blue" fontSize="3xs" rounded="full" px={1.5}>
                                  Internal IT
                                </Badge>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        ) : (
                          <HStack spacing={3} p={2.5} bg={colorMode === "light" ? "gray.50" : "gray.750"} rounded="lg">
                            <Icon as={FiUser} color="secondary.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="bold">
                                {(Data.picMigrasi as any)?.userName || Data.requesterName || "Iqbal Maulana"}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {(Data.picMigrasi as any)?.divisi || "Divisi IT Digital Banking"}
                              </Text>
                            </VStack>
                          </HStack>
                        )}
                      </Box>

                      {Data.committeeCab && Data.committeeCab.length > 0 && (
                        <Box>
                          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>Anggota Komite CAB yang Hadir / Terlibat:</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2.5}>
                            {Data.committeeCab.map((cm, idx) => (
                              <HStack key={idx} p={2} bg={colorMode === "light" ? "white" : "gray.800"} border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} rounded="md">
                                <Box w="6px" h="6px" rounded="full" bg="teal.400" />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="xs" fontWeight="semibold">{cm.userName}</Text>
                                  <Text fontSize="3xs" color="gray.500">{cm.asalDivisi || cm.asalInstitusi || cm.type}</Text>
                                </VStack>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* ─── SECTION: Schedule CAB (Scheduler only, status REQUEST) ─── */}
              {canSchedule && Data.status === "REQUEST" && (() => {
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
                            Jadwalkan CAB Meeting
                          </Heading>
                        </HStack>
                        <Badge colorScheme="purple" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="bold">
                          STATUS: REQUEST
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody px={5} py={4}>
                      <VStack spacing={4} align="stretch">
                        {/* History / Perbandingan Tanggal Pengajuan Maker vs Penetapan Scheduler (Jira-style Vertical Timeline) */}
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

                              {/* Vertical Timeline Activity Stream */}
                              <VStack spacing={0} align="stretch" position="relative" pl={1} pt={1}>
                                {/* Timeline Item 1: Maker Request */}
                                <HStack align="start" spacing={3.5} position="relative" pb={isDateDifferent && scheduleForm.scheduledDate ? 4 : 0}>
                                  {/* Vertical connecting line */}
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

                                  {/* Node icon */}
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

                                  {/* Timeline Item Content */}
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

                                {/* Timeline Item 2: Scheduler Modification (when different) */}
                                {isDateDifferent && scheduleForm.scheduledDate && (
                                  <HStack align="start" spacing={3.5} position="relative" pt={2}>
                                    {/* Node icon */}
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

                                    {/* Timeline Item Content */}
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
                              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
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
                              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEndDate: e.target.value })}
                            />
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
                            Tetapkan Jadwal CAB (Status ➔ SCHEDULED)
                          </Button>
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })()}

              {/* ─── SECTION: Activity Checklist CAB (Verifikasi Pra-Approval, only shown in status IMPLEMENT) ─── */}
              {!canMake && Data.status === "IMPLEMENT" && (
                <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <HStack spacing={2}>
                        <Icon as={FiCheckSquare} color="secondary.500" />
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
                          const canToggle = canSchedule && Data.status === "IMPLEMENT";
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
                                      textDecoration={act.isDone ? "none" : "none"}
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
              )}

              {/* ─── STAGE 3: Konfirmasi Pelaksanaan Rapat CAB (Scheduler, status SCHEDULED) ─── */}
              {canSchedule && (Data.status === "SCHEDULED" || Data.status === "SUBMITTED") && (
                <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="teal.300" bg={colorMode === "light" ? "teal.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "teal.100" : "gray.700"}>
                    <Flex justify="space-between" align="center" w="full">
                      <HStack spacing={2}>
                        <Icon as={FiUsers} color="teal.500" />
                        <Heading size="sm" color="teal.700">Pelaksanaan Rapat CAB (Scheduler & All Tim)</Heading>
                      </HStack>
                      <Badge colorScheme="teal" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                        STAGE 3: CONFIRM
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="xs" color={colorMode === "light" ? "teal.900" : "teal.200"}>
                        Jadwal rapat CAB telah ditetapkan. Klik tombol di bawah saat sidang rapat CAB dimulai bersama seluruh tim dan stakeholder terkait untuk mengonfirmasi pelaksanaan (Status ➔ <strong>CONFIRM</strong>).
                      </Text>
                      <Flex justify="end" pt={2}>
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
                          Konfirmasi Pelaksanaan Rapat CAB (Status ➔ CONFIRM)
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── STAGE 4: Evaluasi Migrasi & Mark as Done (Scheduler, status CONFIRM) ─── */}
              {canSchedule && Data.status === "CONFIRM" && (
                <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="purple.300" bg={colorMode === "light" ? "purple.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "purple.100" : "gray.700"}>
                    <Flex justify="space-between" align="center" w="full">
                      <HStack spacing={2}>
                        <Icon as={FiFileText} color="purple.500" />
                        <Heading size="sm" color="purple.700">Evaluasi Migrasi & Hasil Sidang CAB (Mark as Done)</Heading>
                      </HStack>
                      <Badge colorScheme="purple" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                        STAGE 4: IMPLEMENT
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={4} align="stretch">
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
                      <HStack justify="end" spacing={3} pt={2}>
                        <Button variant="outline" size="sm" onClick={handleSaveResult} isLoading={loading}>
                          Simpan Catatan
                        </Button>
                        <Button
                          colorScheme="purple"
                          bg="purple.600"
                          color="white"
                          _hover={{ bg: "purple.700" }}
                          size="sm"
                          leftIcon={<FiCheck />}
                          onClick={handleSetImplementStatus}
                          isLoading={loading}
                        >
                          Tandai Implementasi Selesai (Mark as Done ➔ IMPLEMENT)
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── STAGE 5: Send to Approval (Scheduler, status IMPLEMENT) ─── */}
              {canSchedule && Data.status === "IMPLEMENT" && (
                <Card rounded={radiusStyle} shadow="sm" border="2px solid" borderColor="orange.300" bg={colorMode === "light" ? "orange.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "orange.100" : "gray.700"}>
                    <Flex justify="space-between" align="center" w="full">
                      <HStack spacing={2}>
                        <Icon as={FiSend} color="orange.500" />
                        <Heading size="sm" color="orange.700">Kirim ke Approver (Send to Approval)</Heading>
                      </HStack>
                      <Badge colorScheme="orange" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="2xs">
                        STAGE 5: WAITING APPROVAL
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={4} align="stretch">
                      <Box p={3.5} bg={colorMode === "light" ? "white" : "gray.750"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "orange.200" : "gray.600"}>
                        <HStack spacing={2.5} mb={1}>
                          <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                          <Text fontSize="xs" fontWeight="bold" color="green.600">
                            Evaluasi Migrasi Selesai (Mark as Done - IMPLEMENT)
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          Hasil evaluasi migrasi dan checklist verifikasi pra-approval telah siap. Pastikan seluruh poin checklist di atas telah dicentang sebelum mengirim berkas permohonan ke Approver.
                        </Text>
                      </Box>

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
                          isDisabled={!allActivitiesDone}
                          px={6}
                        >
                          Kirim ke Approver (Status ➔ WAITING APPROVAL)
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── STAGE 6: Approval Action (Approver, status WAITING APPROVAL) ─── */}
              {canApprove && ["WAITING APPROVAL", "WAITING APPROVE", "PENDING_APPROVAL"].includes(Data.status) && (
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
                      {Data.cabResult && (
                        <Box p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Hasil CAB Meeting & Evaluasi Migrasi:</Text>
                          <Text fontSize="sm">{Data.cabResult}</Text>
                          {Data.implementationStatus && (
                            <Badge mt={2} colorScheme={Data.implementationStatus === "SUCCESS" ? "green" : Data.implementationStatus === "FAILED" ? "red" : "orange"}>
                              Status Implementasi: {Data.implementationStatus}
                            </Badge>
                          )}
                        </Box>
                      )}
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
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── Completed Summary (when COMPLETED / APPROVED) ─── */}
              {(Data.status === "COMPLETED" || Data.status === "APPROVED") && (
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
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                        Permohonan CAB ini telah disetujui secara resmi dan seluruh alur proses telah selesai.
                      </Text>
                      {Data.cabResult && (
                        <Box p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "green.200" : "gray.600"}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Ringkasan Hasil CAB:</Text>
                          <Text fontSize="sm">{Data.cabResult}</Text>
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
              {Data.scheduledDate && ["SCHEDULED", "CONFIRM", "IMPLEMENT", "SUBMITTED", "WAITING APPROVAL", "WAITING APPROVE", "COMPLETED", "APPROVED", "IN_REVIEW"].includes(Data.status) && (() => {
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
