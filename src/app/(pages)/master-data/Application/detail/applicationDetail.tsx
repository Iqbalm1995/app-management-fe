"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
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
  InputGroup,
  InputLeftElement,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
  TagLabel,
  Text,
  Textarea,
  Tooltip,
  useClipboard,
  useColorMode,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiClock,
  FiCopy,
  FiCpu,
  FiDatabase,
  FiEdit,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiFolder,
  FiGlobe,
  FiInfo,
  FiLayers,
  FiLock,
  FiPlus,
  FiRefreshCcw,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiServer,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { Select } from "chakra-react-select";

// Components & Layout
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { WeekdaySelector } from "@/app/components/inputProps/WeekDaySelector";
import UserSearchSelect from "@/app/components/inputProps/userSearchSelect";
import { ControlTable } from "@/app/components/tableComponents";

// Constants & Helpers
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  APP_TYPE_OPTIONS,
  APP_ENV_LOCATION_OPTIONS,
  APP_OPERATIONAL_OPTIONS,
  APP_RELATED_OPTIONS,
  APP_TRANSACTIONAL_OPTIONS,
  APP_INTEGRATED_OTHER_APPS,
  APP_CRITICAL_LEVEL_OPTIONS,
  APP_DEVELOPMENT_METHOD_OPTIONS,
  APP_PROGRAMMING_LANGUAGES,
  APP_PROGRAMMING_FRAMEWORKS,
  ORG_CATEGORY_KEY_DIRECTORATE,
  ORG_CATEGORY_KEY_DIVISION,
  ORG_CATEGORY_KEY_GROUP,
  MAX_SIZE_TABLE,
  SERVER_PRIMARY_DC_OPTIONS,
  SERVER_SITE_OPTIONS,
  SERVER_ROLE_OPTIONS,
  SERVER_STATUS_OPTIONS,
  SERVER_ENVIRONMENT_OPTIONS,
  SERVER_SEGMENT_OPTIONS,
  VM_CPU_OPTIONS,
  VM_MEMORY_OPTIONS,
  VM_STORAGE_OPTIONS,
  VM_STORAGE_UNIT_OPTIONS,
  VM_OS_OPTIONS,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";

// Services & Types
import useApps, {
  ApplicationMasterResponse,
  ServerSoftwareItemResponse,
  AppInstalledSoftwareResponse,
  AddAppSoftwarePayload,
  CreateServerSoftwarePayload,
} from "@/app/services/useApps";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useConstants, { ConstantDataResponse } from "@/app/services/useConstants";
import useRequirements, { BacklogDataResponse } from "@/app/services/useRequirements";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useAppsCriticalReport, { AppsCriticalReportAssessmentViewModel } from "@/app/services/useAppsCriticalReport";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { OptionListProps, PaggingListPayload, ListSearchByParam } from "@/app/types/masterTypes";

export interface AppServerVmDetail {
  namaVm: string;
  ipAddress: string;
  os: string;
  cpu: string;
  memory: string;
  storage: string;
  note?: string;
}

export interface AppServerEnvironmentItem {
  id: string;
  roleServer: string;
  roleServerOther?: string;
  roleDetail: string;
  status: "Aktif" | "Pasif";
  ipAddress: string;
  primary: "DC1" | "DC2" | "-";
  site: string;
  siteOther?: string;
  segment: string;
  environment: string;
  environmentOther?: string;
  joinDomain: "Ya" | "Tidak";
  hardening: "Ya" | "Tidak";
  pam: "Ya" | "Tidak";
  dualDeploy: "Ya" | "Tidak";
  vmDetail?: AppServerVmDetail;
}

export interface RelatedAppItem {
  id: string;
  appName: string;
  appShortName: string;
  appVersion: string;
  appInitaiteYear: string;
  appsStatus?: string;
}

export interface AppAccessParameterItem {
  id?: string;
  appsId?: string;
  appsEnvId?: string;
  targetEnvironment: "Dev" | "Prod";
  paramCategory: string;
  paramLabel: string;
  paramKey: string;
  paramValue: string;
  fieldType: "text" | "password" | "textarea";
  isMasked?: "Y" | "N";
  displayOrder: number;
}

export const STANDARD_ROLE_SERVERS = SERVER_ROLE_OPTIONS;

export const detectDcFromIp = (ip?: string): "DC1" | "DC2" | "-" => {
  if (!ip) return "-";
  const parts = ip.trim().split(".");
  if (parts.length >= 3) {
    const octet3 = parts[2].trim();
    if (octet3.startsWith("1")) return "DC1";
    if (octet3.startsWith("2")) return "DC2";
  }
  return "-";
};

const HeaderDataContent: HeaderContentProps = {
  titleName: "Application Detail",
  breadCrumb: ["Master Data", "Applications", "Detail"],
};

export default function ApplicationDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // ID & Auth State
  const appId = searchParams.get("id") || "";
  useDocumentTitle("Application Detail");

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data & Edit Mode State
  const [DataApplication, setDataApplication] = useState<ApplicationMasterResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  // Active Tab Index State (0: Overview, 1: Specs, 2: Governance, 3: Projects, 4: Assessment, 5: Environment)
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    appName: "",
    appShortName: "",
    appsStatus: "ACTIVE",
    appsDesc: "",
    note: "",
    appTargetUsers: "INTERNAL",
    appAccessFrontsiteDns: "",
    appAccessFrontsiteIp: "",
    appAccessBacksiteDns: "",
    appAccessBacksiteIp: "",
    appAccessMedia: "",
    appTypes: "",
    appTypeCustom: "",
    appRelatedness: "",
    appRelatednessDesc: "",
    appTransactionals: "",
    appOperational24hrs: "",
    appOperationalDays: "",
    appOperationalHourOpen: "",
    appOperationalHourClosed: "",
    appEnvLocations: "",
    appEnvLocationsOthers: "",
    appPrivateAuth: "Y",
    appHightAvailability: "Y",
    appIntegrationOthersApps: "",
    appOwnerDivisionId: "",
    appOwnerGroupId: "",
    appManageByDivisionId: "",
    appManageByGroupId: "",
    appBusinessOwnerDivisionId: "",
    appBusinessOwnerGroupId: "",
    appOwnerPicUserId: "",
    appManagePicUserId: "",
    appBusinessOwnerPicUserId: "",
    appOwnerPicName: "",
    appManagePicName: "",
    appBusinessOwnerPicName: "",
    appIsCritical: "N",
    appCriticalLevel: "",
    appStatusProject: "",
    appInitaiteYear: "",
    appProgrammingLanguages: "",
    appProgrammingFrameworks: "",
    appDevelopmentMethod: "",
  });

  // Organization & PIC State
  const [OrganizationData, setOrganizationData] = useState<OrganizationResponse[]>([]);
  const [DataUsersOwnerPIC, setDataUsersOwnerPIC] = useState<UsersResponse[]>([]);
  const [OwnerPICSearch, setOwnerPICSearch] = useState<string>("");

  const [DataUsersManagerPIC, setDataUsersManagerPIC] = useState<UsersResponse[]>([]);
  const [ManagerPICSearch, setManagerPICSearch] = useState<string>("");

  const [DataUsersBusinessOwnerPIC, setDataUsersBusinessOwnerPIC] = useState<UsersResponse[]>([]);
  const [BusinessOwnerPICSearch, setBusinessOwnerPICSearch] = useState<string>("");

  // Checkbox Selection States
  const [SelectedAppsTypes, setSelectedAppsTypes] = useState<string>("");
  const [SelectedAppsEnvLoc, setSelectedAppsEnvLoc] = useState<string>("");
  const [OperationalDays, setOperationalDays] = useState<string>("");
  const [SelectedTargetUsers, setSelectedTargetUsers] = useState<string>("");

  // Projects & Backlogs State
  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [IsLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("ALL");
  const [projectTotalCount, setProjectTotalCount] = useState(0);
  const [projectPageIndex, setProjectPageIndex] = useState(0);
  const [projectPageSize, setProjectPageSize] = useState(10);

  const [DataBacklogs, setDataBacklogs] = useState<BacklogDataResponse[]>([]);
  const [IsLoadingBacklogs, setIsLoadingBacklogs] = useState(false);
  const [backlogSearchQuery, setBacklogSearchQuery] = useState("");
  const [ProjectStatuses, setProjectStatuses] = useState<ConstantDataResponse[]>([]);

  // Assessment Report State
  const [assessmentData, setAssessmentData] = useState<AppsCriticalReportAssessmentViewModel[]>([]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentTotal, setAssessmentTotal] = useState(0);
  const [assessmentRefresh, setAssessmentRefresh] = useState(0);

  // Server Environment State
  const [serverEnvironments, setServerEnvironments] = useState<AppServerEnvironmentItem[]>([]);
  const [isTopologyLoading, setIsTopologyLoading] = useState<boolean>(false);
  const [activeEnvFilter, setActiveEnvFilter] = useState<"PROD" | "DEV" | "DRC" | "ALL">("PROD");

  const prodServers = useMemo(() => {
    return serverEnvironments.filter((s) => {
      const env = (s.environment || "").toLowerCase();
      return env.includes("prod");
    });
  }, [serverEnvironments]);

  const devServers = useMemo(() => {
    return serverEnvironments.filter((s) => {
      const env = (s.environment || "").toLowerCase();
      return env.includes("dev") || env.includes("uat") || env.includes("test");
    });
  }, [serverEnvironments]);

  const drcServers = useMemo(() => {
    return serverEnvironments.filter((s) => {
      const env = (s.environment || "").toLowerCase();
      return (
        env.includes("drc") ||
        (!env.includes("prod") &&
          !env.includes("dev") &&
          !env.includes("uat") &&
          !env.includes("test"))
      );
    });
  }, [serverEnvironments]);

  const displayedServers = useMemo(() => {
    if (activeEnvFilter === "PROD") return prodServers;
    if (activeEnvFilter === "DEV") return devServers;
    if (activeEnvFilter === "DRC") return drcServers;
    return serverEnvironments;
  }, [activeEnvFilter, prodServers, devServers, drcServers, serverEnvironments]);

  const handleNavigateCreateServer = (targetEnv?: string) => {
    const envVal =
      targetEnv ||
      (activeEnvFilter === "PROD"
        ? "Production"
        : activeEnvFilter === "DEV"
        ? "Development"
        : activeEnvFilter === "DRC"
        ? "DRC"
        : "Production");
    router.push(`/master-data/Application/create-environment?appId=${appId}&env=${envVal}`);
  };

  // Link Akses & Environment Test Parameters State
  const [linkAksesEnv, setLinkAksesEnv] = useState<"Dev" | "Prod">("Dev");
  const [linkAksesDevUrl, setLinkAksesDevUrl] = useState<string>("");
  const [linkAksesProdUrl, setLinkAksesProdUrl] = useState<string>("");
  const [testingParameters, setTestingParameters] = useState<AppAccessParameterItem[]>([]);
  const [isAccessLoading, setIsAccessLoading] = useState<boolean>(false);
  const [maskedVisibility, setMaskedVisibility] = useState<{ [key: string]: boolean }>({});

  // Software, Runtime & Middleware Pendukung State (Option B)
  const [installedSoftwares, setInstalledSoftwares] = useState<AppInstalledSoftwareResponse[]>([]);
  const [isInstalledSoftwaresLoading, setIsInstalledSoftwaresLoading] = useState<boolean>(false);
  const [connectedSoftwaresSearch, setConnectedSoftwaresSearch] = useState<string>("");
  const [isSoftwareCatalogOpen, setIsSoftwareCatalogOpen] = useState<boolean>(false);
  const [softwareCatalog, setSoftwareCatalog] = useState<ServerSoftwareItemResponse[]>([]);
  const [isSoftwareCatalogLoading, setIsSoftwareCatalogLoading] = useState<boolean>(false);
  const [softwareCatalogSearch, setSoftwareCatalogSearch] = useState<string>("");
  const [softwareCategoryFilter, setSoftwareCategoryFilter] = useState<string>("ALL");
  const [isAddingSoftwareId, setIsAddingSoftwareId] = useState<string | null>(null);
  const [isRemovingSoftwareId, setIsRemovingSoftwareId] = useState<string | null>(null);

  // Create New Master Software Modal State
  const [isCreateSoftwareModalOpen, setIsCreateSoftwareModalOpen] = useState<boolean>(false);
  const [newSoftwareName, setNewSoftwareName] = useState<string>("");
  const [newSoftwareCategory, setNewSoftwareCategory] = useState<string>("LANGUAGE_RUNTIME");
  const [newSoftwareVendor, setNewSoftwareVendor] = useState<string>("");
  const [newSoftwareIsStandardBank, setNewSoftwareIsStandardBank] = useState<string>("Y");
  const [newSoftwareDescription, setNewSoftwareDescription] = useState<string>("");
  const [autoConnectNewSoftware, setAutoConnectNewSoftware] = useState<boolean>(true);
  const [isSubmittingNewSoftware, setIsSubmittingNewSoftware] = useState<boolean>(false);

  // Testing Parameter Dynamic Form Handlers
  const handleAddTestingParameter = () => {
    setTestingParameters((prev) => [
      ...prev,
      {
        targetEnvironment: "Dev",
        paramCategory: "TESTING",
        paramLabel: `Parameter ${prev.length + 1}`,
        paramKey: `param_${prev.length + 1}`,
        paramValue: "",
        fieldType: "text",
        isMasked: "N",
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const handleUpdateTestingParameter = (
    index: number,
    field: keyof AppAccessParameterItem,
    value: any
  ) => {
    setTestingParameters((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "paramLabel") {
        updated[index].paramKey = (value || "").toLowerCase().trim().replace(/\s+/g, "_");
      }
      return updated;
    });
  };

  const handleDeleteTestingParameter = (index: number) => {
    setTestingParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMaskVisibility = (key: string) => {
    setMaskedVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateServer = (
    index: number,
    field: keyof AppServerEnvironmentItem,
    value: any
  ) => {
    setServerEnvironments((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "ipAddress") {
        const detected = detectDcFromIp(value);
        if (detected !== "-") {
          item.primary = detected;
        }
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleUpdateServerVm = (
    index: number,
    field: keyof AppServerVmDetail,
    value: string
  ) => {
    setServerEnvironments((prev) => {
      const updated = [...prev];
      const curVm = updated[index].vmDetail || {
        namaVm: "",
        ipAddress: "",
        os: "",
        cpu: "",
        memory: "",
        storage: "",
        note: "",
      };
      updated[index] = {
        ...updated[index],
        vmDetail: {
          ...curVm,
          [field]: value,
        },
      };
      return updated;
    });
  };

  const handleAddServer = () => {
    if (!IsEditMode) setIsEditMode(true);
    const newServer: AppServerEnvironmentItem = {
      id: `srv-${Date.now()}`,
      roleServer: "App Server",
      roleDetail: "",
      status: "Aktif",
      ipAddress: "",
      primary: "-",
      site: "DC Narogong",
      segment: "",
      environment: "Production",
      joinDomain: "Ya",
      hardening: "Ya",
      pam: "Ya",
      dualDeploy: "Tidak",
      vmDetail: {
        namaVm: "",
        ipAddress: "",
        os: "",
        cpu: "",
        memory: "",
        storage: "",
        note: "",
      },
    };
    setServerEnvironments((prev) => [...prev, newServer]);
  };

  const handleDeleteServer = (index: number) => {
    setServerEnvironments((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy app code helper
  const { hasCopied, onCopy } = useClipboard(DataApplication?.appCode || "");

  // API Hooks
  const {
    GetDetailById,
    UpdateData,
    List: ListApplications,
    GetTopologyOverview,
    SyncAppServers,
    GetAccessParameters,
    SyncAccessParameters,
    GetServerSoftwaresCatalog,
    CreateServerSoftware,
    GetAppSoftwares,
    AddAppSoftware,
    RemoveAppSoftware,
  } = useApps();

  // Load Installed Softwares from Database
  const LoadInstalledSoftwaresData = useCallback(async () => {
    if (!appId || !tokenData) return;
    try {
      setIsInstalledSoftwaresLoading(true);
      const res = await GetAppSoftwares(appId, tokenData);
      if (res && res.data && Array.isArray(res.data)) {
        setInstalledSoftwares(res.data);
      } else {
        setInstalledSoftwares([]);
      }
    } catch (err) {
      console.error("Failed to load installed softwares from database:", err);
      setInstalledSoftwares([]);
    } finally {
      setIsInstalledSoftwaresLoading(false);
    }
  }, [appId, tokenData, GetAppSoftwares]);

  // Fetch Software Catalog from Master Data
  const fetchSoftwareCatalog = useCallback(
    async (searchKeyword: string = "") => {
      if (!tokenData) return;
      try {
        setIsSoftwareCatalogLoading(true);
        const res = await GetServerSoftwaresCatalog(searchKeyword, tokenData);
        if (res && res.data && Array.isArray(res.data)) {
          setSoftwareCatalog(res.data);
        } else {
          setSoftwareCatalog([]);
        }
      } catch (err) {
        console.error("Failed to fetch software catalog:", err);
        setSoftwareCatalog([]);
      } finally {
        setIsSoftwareCatalogLoading(false);
      }
    },
    [tokenData, GetServerSoftwaresCatalog]
  );

  const handleOpenAddCatalog = () => {
    const nextState = !isSoftwareCatalogOpen;
    setIsSoftwareCatalogOpen(nextState);
    if (nextState) {
      fetchSoftwareCatalog(softwareCatalogSearch);
    }
  };

  const handleAddSoftware = async (software: ServerSoftwareItemResponse) => {
    if (
      installedSoftwares.some(
        (item) =>
          item.softwareId === software.id ||
          item.softwareName.toLowerCase() === software.softwareName.toLowerCase()
      )
    ) {
      showToast({
        description: `${software.softwareName} sudah terhubung ke aplikasi ini`,
        statusToast: "info",
      });
      return;
    }

    if (!appId || !tokenData) return;

    try {
      setIsAddingSoftwareId(software.id);
      const payload: AddAppSoftwarePayload = {
        softwareId: software.id,
        installedVersion: "Latest",
        portNumber: software.softwareCategory === "WEB_SERVER" ? "8080" : undefined,
        serviceStatus: "Running",
        notes: `Standar Bank: ${software.isStandardBank}`,
      };
      const res = await AddAppSoftware(appId, payload, tokenData);

      if (res && (res.statusCode === RES_CODE_OK || res.statusCode === 200)) {
        showToast({
          description: `${software.softwareName} berhasil ditambahkan ke topology aplikasi`,
          statusToast: "success",
        });
        await LoadInstalledSoftwaresData();
      } else {
        showToast({
          description: res?.message || "Gagal menambahkan software pendukung",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Failed to add software:", err);
      showToast({
        description: "Terjadi kesalahan saat menambahkan software pendukung",
        statusToast: "error",
      });
    } finally {
      setIsAddingSoftwareId(null);
    }
  };

  const handleRemoveSoftware = async (softwareId: string, softwareName: string) => {
    if (!appId || !tokenData) return;

    try {
      setIsRemovingSoftwareId(softwareId);
      const res = await RemoveAppSoftware(appId, softwareId, tokenData);

      if (res && (res.statusCode === RES_CODE_OK || res.statusCode === 200)) {
        showToast({
          description: `${softwareName} berhasil dihapus dari topology aplikasi`,
          statusToast: "info",
        });
        await LoadInstalledSoftwaresData();
      } else {
        showToast({
          description: res?.message || "Gagal menghapus software",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Failed to remove software:", err);
      showToast({
        description: "Terjadi kesalahan saat menghapus software",
        statusToast: "error",
      });
    } finally {
      setIsRemovingSoftwareId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setNewSoftwareName("");
    setNewSoftwareCategory("LANGUAGE_RUNTIME");
    setNewSoftwareVendor("");
    setNewSoftwareIsStandardBank("Y");
    setNewSoftwareDescription("");
    setAutoConnectNewSoftware(true);
    setIsCreateSoftwareModalOpen(true);
  };

  const handleCreateNewSoftware = async () => {
    const trimmedName = newSoftwareName.trim();
    if (!trimmedName) {
      showToast({
        description: "Nama Software / Runtime wajib diisi",
        statusToast: "error",
      });
      return;
    }

    // Client-side duplicate check (case-insensitive)
    const isDuplicate = softwareCatalog.some(
      (s) => s.softwareName.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showToast({
        description: `Software/Runtime "${trimmedName}" sudah terdaftar dalam katalog master`,
        statusToast: "error",
      });
      return;
    }

    if (!tokenData) return;

    try {
      setIsSubmittingNewSoftware(true);
      const payload: CreateServerSoftwarePayload = {
        softwareName: trimmedName,
        softwareCategory: newSoftwareCategory,
        vendor: newSoftwareVendor.trim() || undefined,
        isStandardBank: newSoftwareIsStandardBank,
        description: newSoftwareDescription.trim() || undefined,
      };

      const res = await CreateServerSoftware(payload, tokenData);
      if (res && (res.statusCode === RES_CODE_OK || res.statusCode === 200) && res.data) {
        showToast({
          description: `Software ${trimmedName} berhasil ditambahkan ke katalog master`,
          statusToast: "success",
        });

        const createdItem = res.data;
        setIsCreateSoftwareModalOpen(false);

        // Refresh catalog list
        await fetchSoftwareCatalog(softwareCatalogSearch);

        // If autoConnect is selected, connect it right away to this application
        if (autoConnectNewSoftware && appId) {
          await handleAddSoftware(createdItem);
        }
      } else {
        showToast({
          description: res?.message || "Gagal menambahkan software ke katalog master",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Failed to create master software:", err);
      showToast({
        description: "Terjadi kesalahan saat menambahkan master software",
        statusToast: "error",
      });
    } finally {
      setIsSubmittingNewSoftware(false);
    }
  };

  const { List: ListOrganization } = useOrganization();
  const { List: ListUsers } = useUsers();
  const { ListConstantData } = useConstants();
  const { ListBacklog } = useRequirements();
  const { ListByApp: ListProjectsByApp } = useProjects();
  const { GetListByApp } = useAppsCriticalReport();

  // Sync OperationalDays with formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, appOperationalDays: OperationalDays }));
  }, [OperationalDays]);

  // Auth Initialization
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      try {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
      } catch (e) {
        console.error("Failed to parse auth data", e);
      }
    }
    if (token) setTokenData(token);
  }, []);

  // Load Application Detail
  const LoadApplicationData = useCallback(async () => {
    if (!appId || !tokenData) return;

    try {
      setIsLoadingProcess(true);
      const requestData = await GetDetailById(appId, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as ApplicationMasterResponse;
      setDataApplication(data);

      setFormData({
        appName: data.appName || "",
        appShortName: data.appShortName || "",
        appsStatus: data.appsStatus || "ACTIVE",
        appsDesc: data.appsDesc || "",
        note: data.note || "",
        appTargetUsers: data.appTargetUsers || "INTERNAL",
        appAccessFrontsiteDns: data.appAccessFrontsiteDns || "",
        appAccessFrontsiteIp: data.appAccessFrontsiteIp || "",
        appAccessBacksiteDns: data.appAccessBacksiteDns || "",
        appAccessBacksiteIp: data.appAccessBacksiteIp || "",
        appAccessMedia: data.appAccessMedia || "",
        appTypes: data.appTypes || "",
        appTypeCustom: data.appTypeCustom || "",
        appRelatedness: data.appRelatedness || "",
        appRelatednessDesc: data.appRelatednessDesc || "",
        appTransactionals: data.appTransactionals || "",
        appOperational24hrs: data.appOperational24hrs || "",
        appOperationalDays: data.appOperationalDays || "",
        appOperationalHourOpen: data.appOperationalHourOpen || "",
        appOperationalHourClosed: data.appOperationalHourClosed || "",
        appEnvLocations: data.appEnvLocations || "",
        appEnvLocationsOthers: data.appEnvLocationsOthers || "",
        appPrivateAuth: data.appPrivateAuth || "Y",
        appHightAvailability: data.appHightAvailability || "Y",
        appIntegrationOthersApps: data.appIntegrationOthersApps || "",
        appOwnerDivisionId: data.appOwnerDivisionId || "",
        appOwnerGroupId: data.appOwnerGroupId || "",
        appManageByDivisionId: data.appManageByDivisionId || "",
        appManageByGroupId: data.appManageByGroupId || "",
        appBusinessOwnerDivisionId: data.appBusinessOwnerDivisionId || "",
        appBusinessOwnerGroupId: data.appBusinessOwnerGroupId || "",
        appOwnerPicUserId: data.appOwnerPicUserId || "",
        appManagePicUserId: data.appManagePicUserId || "",
        appBusinessOwnerPicUserId: data.appBusinessOwnerPicUserId || "",
        appOwnerPicName: data.appOwnerPicName || "",
        appManagePicName: data.appManagePicName || "",
        appBusinessOwnerPicName: data.appBusinessOwnerPicName || "",
        appIsCritical: data.appIsCritical || "N",
        appCriticalLevel: data.appCriticalLevel || "",
        appStatusProject: data.appStatusProject || "",
        appInitaiteYear: data.appInitaiteYear || "",
        appProgrammingLanguages: data.appProgrammingLanguages || "",
        appProgrammingFrameworks: data.appProgrammingFrameworks || "",
        appDevelopmentMethod: data.appDevelopmentMethod || "",
      });

      setSelectedAppsTypes(data.appTypes || "");
      setSelectedTargetUsers(data.appTargetUsers || "");
      setSelectedAppsEnvLoc(data.appEnvLocations || "");
      setOperationalDays(data.appOperationalDays || "");

      if (data.appOwnerPicUserId) {
        setOwnerPICSearch(data.appOwnerPicUserId);
      }
      if (data.appManagePicUserId) {
        setManagerPICSearch(data.appManagePicUserId);
      }
      if (data.appBusinessOwnerPicUserId) {
        setBusinessOwnerPICSearch(data.appBusinessOwnerPicUserId);
      }

      // Load connected software, runtime & middleware from database
      await LoadInstalledSoftwaresData();
    } catch (error) {
      console.error("Error loading application detail:", error);
      showToast({
        description: "Failed to load application data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  }, [appId, tokenData, LoadInstalledSoftwaresData]);

  // Load Organizations
  const LoadOrganizations = useCallback(async () => {
    if (!tokenData) return;
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };
      const res = await ListOrganization(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOrganizationData(res.data as OrganizationResponse[]);
      }
    } catch (e) {
      console.error("Error loading organizations:", e);
    }
  }, [tokenData]);

  // Load Project Statuses
  const LoadProjectStatuses = useCallback(async () => {
    if (!tokenData) return;
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [{ field: "groupCode", operator: "=", value: "PROJECT_STATUS" }],
        fieldOrder: ["index"],
        orderDir: "asc",
      };
      const res = await ListConstantData(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setProjectStatuses(res.data as ConstantDataResponse[]);
      }
    } catch (e) {
      console.error("Error loading project statuses:", e);
    }
  }, [tokenData]);

  // Load Backlogs
  const LoadBacklogs = useCallback(async () => {
    if (!appId || !tokenData) return;
    try {
      setIsLoadingBacklogs(true);
      const payload: PaggingListPayload = {
        search: "",
        limit: 50,
        page: 0,
        filterWhere: [{ field: "AppsId", operator: "=", value: appId }],
        fieldOrder: ["PosOrder", "CreatedAt"],
        orderDir: "desc",
      };
      const res = await ListBacklog(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setDataBacklogs(res.data as BacklogDataResponse[]);
      }
    } catch (e) {
      console.error("Error loading backlogs:", e);
    } finally {
      setIsLoadingBacklogs(false);
    }
  }, [appId, tokenData]);

  // Load Connected Projects
  const LoadProjects = useCallback(
    async (
      search = projectSearchQuery,
      status = projectStatusFilter,
      page = projectPageIndex,
      limit = projectPageSize
    ) => {
      if (!appId || !tokenData) return;
      try {
        setIsLoadingProjects(true);
        const payload: PaggingListPayload = {
          search: search || "",
          limit: limit,
          page: page,
          filterWhere: status && status !== "ALL" ? [{ field: "projectStatus", operator: "=", value: status }] : [],
          fieldOrder: ["ProjectRegisterDate", "CreatedAt"],
          orderDir: "desc",
        };
        const res = await ListProjectsByApp(appId, payload, tokenData);
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setDataProjects(res.data as ProjectDataResponse[]);
          setProjectTotalCount(res.countTotal ?? res.data.length);
        } else {
          setDataProjects([]);
          setProjectTotalCount(0);
        }
      } catch (e) {
        console.error("Error loading connected projects:", e);
        setDataProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    },
    [appId, tokenData, projectSearchQuery, projectStatusFilter, projectPageIndex, projectPageSize]
  );

  // Load Assessments
  const LoadAssessments = useCallback(async () => {
    if (!appId || !tokenData) return;
    try {
      setAssessmentLoading(true);
      const res = await GetListByApp(appId, tokenData);
      if (res?.statusCode === 200 && res.data) {
        setAssessmentData(res.data || []);
        setAssessmentTotal(res.countTotal || 0);
      }
    } catch (e) {
      console.error("Error loading assessments:", e);
    } finally {
      setAssessmentLoading(false);
    }
  }, [appId, tokenData]);

  // Load Server Topology & Environments
  const LoadTopologyData = useCallback(async () => {
    if (!appId || !tokenData) return;
    try {
      setIsTopologyLoading(true);
      const res = await GetTopologyOverview(appId, tokenData);
      if (res && res.statusCode === RES_CODE_OK && res.data && Array.isArray(res.data.servers) && res.data.servers.length > 0) {
        setServerEnvironments(res.data.servers as AppServerEnvironmentItem[]);
        if (typeof window !== "undefined") {
          localStorage.setItem(`app_env_servers_${appId}`, JSON.stringify(res.data.servers));
        }
      } else {
        const localRaw = typeof window !== "undefined" ? localStorage.getItem(`app_env_servers_${appId}`) : null;
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServerEnvironments(parsed);
              return;
            }
          } catch (e) {}
        }
        setServerEnvironments([]);
      }
    } catch (e) {
      console.error("Error loading server topology:", e);
      const localRaw = typeof window !== "undefined" ? localStorage.getItem(`app_env_servers_${appId}`) : null;
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServerEnvironments(parsed);
            return;
          }
        } catch (err) {}
      }
      setServerEnvironments([]);
    } finally {
      setIsTopologyLoading(false);
    }
  }, [appId, tokenData]);

  // Load Access Links & Testing Parameters
  const LoadAccessData = useCallback(async () => {
    if (!appId || !tokenData) return;
    try {
      setIsAccessLoading(true);
      const res = await GetAccessParameters(appId, tokenData);
      if (res && res.statusCode === RES_CODE_OK && res.data) {
        setLinkAksesDevUrl(res.data.devUrl || "");
        setLinkAksesProdUrl(res.data.prodUrl || "");
        setTestingParameters(
          (res.data.parameters || []).map((p: any) => ({
            ...p,
            paramValue: p.paramValue || "",
          })) as AppAccessParameterItem[]
        );
      } else {
        setLinkAksesDevUrl("");
        setLinkAksesProdUrl("");
        setTestingParameters([]);
      }
    } catch (e) {
      console.error("Error loading access parameters:", e);
    } finally {
      setIsAccessLoading(false);
    }
  }, [appId, tokenData]);

  // Initial Core Data Fetch (Lightweight)
  useEffect(() => {
    if (tokenData && appId) {
      LoadApplicationData();
      LoadOrganizations();
      LoadProjectStatuses();
      LoadTopologyData();
      LoadAccessData();
      LoadInstalledSoftwaresData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData, appId]);

  // Lazy Fetch Tab-Specific Data On-Demand
  useEffect(() => {
    if (!tokenData || !appId) return;
    if (activeTabIndex === 3) {
      LoadBacklogs();
      LoadProjects(projectSearchQuery, projectStatusFilter, projectPageIndex, projectPageSize);
    } else if (activeTabIndex === 4) {
      LoadAssessments();
    } else if (activeTabIndex === 5) {
      LoadTopologyData();
      LoadAccessData();
      LoadInstalledSoftwaresData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex, tokenData, appId]);

  // Load Projects on Pagination / Search / Filter Change (Debounced)
  useEffect(() => {
    if (tokenData && appId && activeTabIndex === 3) {
      const timer = setTimeout(() => {
        LoadProjects(projectSearchQuery, projectStatusFilter, projectPageIndex, projectPageSize);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tokenData, appId, activeTabIndex, projectPageIndex, projectPageSize, projectStatusFilter, projectSearchQuery]);

  // PIC User Search Handler
  const GetDataUser = async (searchValue: string): Promise<UsersResponse[]> => {
    if (!tokenData) return [];
    try {
      const payload: PaggingListPayload = {
        search: searchValue,
        limit: 5,
        page: 0,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc",
      };
      const res = await ListUsers(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        return res.data as UsersResponse[];
      }
    } catch (e) {
      console.error("Error searching user:", e);
    }
    return [];
  };

  const handleSearchUser = async (
    textSearch: string,
    key: "ownerPIC" | "managerPIC" | "businessOwnerPIC" | "clear"
  ) => {
    if (key === "clear") {
      setDataUsersOwnerPIC([]);
      setOwnerPICSearch("");
      setDataUsersManagerPIC([]);
      setManagerPICSearch("");
      setDataUsersBusinessOwnerPIC([]);
      setBusinessOwnerPICSearch("");
      return;
    }

    const loadedUsers = await GetDataUser(textSearch);

    if (key === "ownerPIC") {
      setOwnerPICSearch(textSearch);
      setDataUsersOwnerPIC(textSearch.length >= 2 ? loadedUsers : []);
    } else if (key === "managerPIC") {
      setManagerPICSearch(textSearch);
      setDataUsersManagerPIC(textSearch.length >= 2 ? loadedUsers : []);
    } else if (key === "businessOwnerPIC") {
      setBusinessOwnerPICSearch(textSearch);
      setDataUsersBusinessOwnerPIC(textSearch.length >= 2 ? loadedUsers : []);
    }
  };

  // Checkbox helpers
  const handleAppTypesCheckboxChange = (value: string) => {
    const list = SelectedAppsTypes.split(",").map((i) => i.trim()).filter(Boolean);
    const updated = list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
    const joined = updated.join(", ") + (updated.length > 0 ? "," : "");
    setSelectedAppsTypes(joined);
    setFormData((prev) => ({ ...prev, appTypes: joined }));
  };

  const handleTargetUsersCheckboxChange = (value: string) => {
    const list = SelectedTargetUsers.split(",").map((i) => i.trim()).filter(Boolean);
    const updated = list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
    const joined = updated.join(", ") + (updated.length > 0 ? "," : "");
    setSelectedTargetUsers(joined);
    setFormData((prev) => ({ ...prev, appTargetUsers: joined }));
  };

  const handleAppEnvLocCheckboxChange = (value: string) => {
    const list = SelectedAppsEnvLoc.split(",").map((i) => i.trim()).filter(Boolean);
    const updated = list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
    const joined = updated.join(", ") + (updated.length > 0 ? "," : "");
    setSelectedAppsEnvLoc(joined);
    setFormData((prev) => ({ ...prev, appEnvLocations: joined }));
  };

  const handleQuickAddTagIntegratedApps = (tag: string) => {
    const list = (formData.appIntegrationOthersApps || "").split(",").map((t) => t.trim()).filter(Boolean);
    if (!list.includes(tag)) {
      setFormData((prev) => ({ ...prev, appIntegrationOthersApps: [...list, tag].join(", ") }));
    }
  };

  // Save Handler
  const handleSave = async () => {
    if (!tokenData || !appId) return;

    try {
      setIsLoadingProcess(true);

      const payload = {
        id: appId,
        appName: formData.appName,
        appShortName: formData.appShortName,
        appsStatus: formData.appsStatus || "ACTIVE",
        appsDesc: formData.appsDesc,
        note: formData.note,
        appTargetUsers: formData.appTargetUsers.trim().replace(/,\s*$/, ""),
        appAccessFrontsiteDns: formData.appAccessFrontsiteDns,
        appAccessFrontsiteIp: formData.appAccessFrontsiteIp,
        appAccessBacksiteDns: formData.appAccessBacksiteDns,
        appAccessBacksiteIp: formData.appAccessBacksiteIp,
        appAccessMedia: formData.appAccessMedia,
        appTypes: formData.appTypes.trim().replace(/,\s*$/, ""),
        appTypeCustom: formData.appTypeCustom,
        appRelatedness: formData.appRelatedness,
        appRelatednessDesc: formData.appRelatednessDesc,
        appTransactionals: formData.appTransactionals,
        appOperational24hrs: formData.appOperational24hrs,
        appOperationalDays: formData.appOperationalDays,
        appOperationalHourOpen: formData.appOperationalHourOpen,
        appOperationalHourClosed: formData.appOperationalHourClosed,
        appEnvLocations: formData.appEnvLocations.trim().replace(/,\s*$/, ""),
        appEnvLocationsOthers: formData.appEnvLocationsOthers,
        appPrivateAuth: formData.appPrivateAuth,
        appHightAvailability: formData.appHightAvailability,
        appIntegrationOthersApps: formData.appIntegrationOthersApps,
        appOwnerDivisionId: formData.appOwnerDivisionId || null,
        appOwnerGroupId: formData.appOwnerGroupId || null,
        appManageByDivisionId: formData.appManageByDivisionId || null,
        appManageByGroupId: formData.appManageByGroupId || null,
        appBusinessOwnerDivisionId: formData.appBusinessOwnerDivisionId || null,
        appBusinessOwnerGroupId: formData.appBusinessOwnerGroupId || null,
        appOwnerPicUserId: formData.appOwnerPicUserId || null,
        appManagePicUserId: formData.appManagePicUserId || null,
        appBusinessOwnerPicUserId: formData.appBusinessOwnerPicUserId || null,
        appOwnerPicName: formData.appOwnerPicName || null,
        appManagePicName: formData.appManagePicName || null,
        appBusinessOwnerPicName: formData.appBusinessOwnerPicName || null,
        appIsCritical: formData.appIsCritical || "N",
        appCriticalLevel: formData.appIsCritical === "Y" ? formData.appCriticalLevel || null : null,
        appStatusProject: formData.appStatusProject || null,
        appInitaiteYear: formData.appInitaiteYear || null,
        appProgrammingLanguages: formData.appProgrammingLanguages || null,
        appProgrammingFrameworks: formData.appProgrammingFrameworks || null,
        appDevelopmentMethod: formData.appDevelopmentMethod || null,
      };

      const res = await UpdateData(payload, tokenData);

      if (!res || res.statusCode !== RES_CODE_OK) {
        showToast({
          description: res?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      if (appId) {
        // Sync server environments to database
        try {
          await SyncAppServers(appId, serverEnvironments as any, tokenData);
        } catch (errSync) {
          console.error("Failed to sync server topology to database", errSync);
        }

        // Sync access links and dynamic testing parameters to database
        try {
          await SyncAccessParameters(
            appId,
            {
              devUrl: linkAksesDevUrl,
              prodUrl: linkAksesProdUrl,
              parameters: testingParameters as any,
            },
            tokenData
          );
        } catch (errAccess) {
          console.error("Failed to sync access parameters to database", errAccess);
        }
      }

      showToast({
        description: "Application data successfully updated",
        statusToast: "success",
      });

      setIsEditMode(false);
      LoadApplicationData();
      LoadTopologyData();
    } catch (error) {
      console.error("Error updating application:", error);
      showToast({
        description: "Failed to update application data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Memoized Calculated Values
  const isCritical = DataApplication?.appIsCritical === "true" || DataApplication?.appIsCritical === "1" || formData.appIsCritical === "Y";
  const initials = (DataApplication?.appShortName || DataApplication?.appName || "APP")
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const totalProjects = DataApplication?.countProjectAll || 0;
  const completedProjects = DataApplication?.countProjectCompleted || 0;
  const onGoingProjects = DataApplication?.countProjectOnGoing || 0;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Governance Alert Calculations (Check if IT Management or Business Owner are empty/null)
  const isITManagementEmpty = IsEditMode
    ? !formData.appManageByDivisionId
    : !DataApplication?.appManageByDivisionId && !DataApplication?.appManageByDivisionName;

  const isBusinessOwnerEmpty = IsEditMode
    ? !formData.appBusinessOwnerDivisionId
    : !DataApplication?.appBusinessOwnerDivisionId && !DataApplication?.appBusinessOwnerDivisionName;

  const hasGovernanceAlert = isITManagementEmpty || isBusinessOwnerEmpty;

  // Filtered Backlogs
  const filteredBacklogs = useMemo(() => {
    if (!backlogSearchQuery.trim()) return DataBacklogs;
    const q = backlogSearchQuery.toLowerCase();
    return DataBacklogs.filter(
      (b) =>
        b.backlogName?.toLowerCase().includes(q) ||
        b.backlogCode?.toLowerCase().includes(q) ||
        b.backlogDesc?.toLowerCase().includes(q)
    );
  }, [DataBacklogs, backlogSearchQuery]);

  // Filtered Connected Projects
  const filteredProjects = useMemo(() => {
    return DataProjects.filter((p) => {
      if (projectStatusFilter !== "ALL" && p.projectStatus !== projectStatusFilter) {
        return false;
      }
      if (!projectSearchQuery.trim()) return true;
      const q = projectSearchQuery.toLowerCase();
      return (
        (p.projectName && p.projectName.toLowerCase().includes(q)) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(q)) ||
        (p.projectNo && p.projectNo.toLowerCase().includes(q)) ||
        (p.projectDesc && p.projectDesc.toLowerCase().includes(q)) ||
        (p.sdlcStageName && p.sdlcStageName.toLowerCase().includes(q)) ||
        (p.userAssignment && p.userAssignment.some((u) => u.userData?.nama?.toLowerCase().includes(q)))
      );
    });
  }, [DataProjects, projectSearchQuery, projectStatusFilter]);

  const projectsTotal = projectTotalCount > 0 ? projectTotalCount : (DataProjects.length > 0 ? DataProjects.length : totalProjects);
  const projectsOngoing = onGoingProjects || DataProjects.filter((p) => p.projectStatus !== "COMPLETED" && p.projectStatus !== "PROJECT_COMPLETED").length;
  const projectsCompleted = completedProjects || DataProjects.filter((p) => p.projectStatus === "COMPLETED" || p.projectStatus === "PROJECT_COMPLETED").length;
  const avgProgress = DataProjects.length > 0 
    ? Math.round(DataProjects.reduce((acc, curr) => acc + (curr.projectStatusPercentage || 0), 0) / DataProjects.length)
    : (completionRate || 0);

  // Standard React-Table Adapter for ControlTable
  const projectTableAdapter = useMemo(() => {
    const pageCount = Math.ceil((projectTotalCount || 0) / projectPageSize) || 1;
    return {
      getPageCount: () => pageCount,
      getCanPreviousPage: () => projectPageIndex > 0,
      getCanNextPage: () => projectPageIndex < pageCount - 1,
      previousPage: () => {
        setProjectPageIndex((prev) => Math.max(0, prev - 1));
      },
      nextPage: () => {
        setProjectPageIndex((prev) => Math.min(pageCount - 1, prev + 1));
      },
      setPageIndex: (index: number) => {
        setProjectPageIndex(Math.max(0, Math.min(pageCount - 1, index)));
      },
      setPageSize: (size: number) => {
        setProjectPageSize(size);
        setProjectPageIndex(0);
      },
      getState: () => ({
        pagination: {
          pageIndex: projectPageIndex,
          pageSize: projectPageSize,
        },
      }),
    };
  }, [projectTotalCount, projectPageSize, projectPageIndex]);



  const getProjectStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PROJECT_COMPLETED":
      case "DONE":
        return { label: "Completed", colorScheme: "green", bg: isDark ? "rgba(16, 185, 129, 0.2)" : "green.50", color: isDark ? "green.300" : "green.700" };
      case "IN_PROGRESS":
      case "DEVELOPMENT":
      case "ONGOING":
      case "PROJECT_ONGOING":
        return { label: "In Progress", colorScheme: "blue", bg: isDark ? "rgba(59, 130, 246, 0.2)" : "blue.50", color: isDark ? "blue.300" : "blue.700" };
      case "WAITING_APPROVAL":
      case "SUBMITTED":
        return { label: "Waiting Approval", colorScheme: "yellow", bg: isDark ? "rgba(234, 179, 8, 0.2)" : "yellow.50", color: isDark ? "yellow.300" : "yellow.700" };
      case "HOLD":
      case "ON_HOLD":
        return { label: "On Hold", colorScheme: "orange", bg: isDark ? "rgba(249, 115, 22, 0.2)" : "orange.50", color: isDark ? "orange.300" : "orange.700" };
      case "CANCELLED":
      case "REJECTED":
        return { label: "Cancelled", colorScheme: "red", bg: isDark ? "rgba(239, 68, 68, 0.2)" : "red.50", color: isDark ? "red.300" : "red.700" };
      default:
        return { label: status || "Draft", colorScheme: "gray", bg: isDark ? "gray.750" : "gray.100", color: isDark ? "gray.300" : "gray.700" };
    }
  };

  // Options for Organization Dropdowns
  const divisionOptions = useMemo(() => {
    return OrganizationData.filter((org) => org.orgType === ORG_CATEGORY_KEY_DIVISION).map((org) => ({
      label: `${org.orgName} (${org.orgCode})`,
      value: org.id,
    }));
  }, [OrganizationData]);

  const groupOptions = useMemo(() => {
    return OrganizationData.filter((org) => org.orgType === ORG_CATEGORY_KEY_GROUP).map((org) => ({
      label: `${org.orgName} (${org.orgCode})`,
      value: org.id,
      parentId: org.parentId,
    }));
  }, [OrganizationData]);

  if (!appId) {
    return (
      <LayoutAdmin>
        <HeaderContent {...HeaderDataContent} />
        <Card rounded={radiusStyle} p={8} textAlign="center">
          <CardBody>
            <Icon as={FiTarget} boxSize={12} color="red.400" mb={3} />
            <Heading size="md" mb={2}>Application ID Parameter Not Found</Heading>
            <Text color="gray.500" mb={4}>Make sure the URL includes a valid application ID.</Text>
            <Button leftIcon={<FiArrowLeft />} colorScheme="secondary" onClick={() => router.push("/master-data/Application")}>
              Back to Application Directory
            </Button>
          </CardBody>
        </Card>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      {IsLoadingProcess && !DataApplication ? (
        <Flex justify="center" align="center" minH="500px">
          <LoadingMiniSignature />
        </Flex>
      ) : (
        <Box px={{ base: 2, md: 4 }} py={2}>
          {/* ══════════════════════════════════════════════════════════════════
              HERO HEADER SECTION
              ══════════════════════════════════════════════════════════════════ */}
          <Box
            bgGradient="linear(to-br, secondary.800, secondary.600)"
            color="white"
            px={{ base: 4, md: 6 }}
            py={{ base: 5, md: 6 }}
            rounded={radiusStyle}
            position="relative"
            overflow="hidden"
            shadow="xl"
            mb={4}
          >
            {/* Ambient glass shapes */}
            <Box position="absolute" top="-20px" right="-20px" w="140px" h="140px" bg="whiteAlpha.150" rounded="full" pointerEvents="none" />
            <Box position="absolute" bottom="-30px" right="160px" w="100px" h="100px" bg="whiteAlpha.100" transform="rotate(45deg)" pointerEvents="none" />

            <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "start", lg: "center" }} gap={4} position="relative" zIndex={1}>
              {/* Left Identity Strip */}
              <HStack spacing={{ base: 3, md: 4 }} align="center" flex={1}>
                {/* Back Button */}
                <IconButton
                  aria-label="Back to Applications Directory"
                  icon={<FiArrowLeft />}
                  variant="ghost"
                  size="md"
                  color="white"
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  _hover={{
                    bg: "whiteAlpha.350",
                    transform: "translateX(-2px)",
                  }}
                  rounded="full"
                  onClick={() => router.push("/master-data/Application")}
                  transition="all 0.2s ease"
                  flexShrink={0}
                />

                {/* Frosted Avatar Box */}
                <Box
                  w={{ base: "52px", md: "60px" }}
                  h={{ base: "52px", md: "60px" }}
                  bg="whiteAlpha.250"
                  backdropFilter="blur(12px)"
                  border="1.5px solid"
                  borderColor="whiteAlpha.400"
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="extrabold"
                  letterSpacing="wider"
                  shadow="lg"
                  flexShrink={0}
                >
                  {initials}
                </Box>

                <VStack align="start" spacing={1} overflow="hidden">
                  <HStack spacing={2} wrap="wrap">
                    {/* App Code Badge with copy button */}
                    <Tooltip label={hasCopied ? "Copied!" : "Copy Application Code"} hasArrow placement="top">
                      <Badge
                        bg="whiteAlpha.300"
                        color="white"
                        px={2.5}
                        py={0.5}
                        rounded="md"
                        fontSize="2xs"
                        fontWeight="bold"
                        cursor="pointer"
                        onClick={onCopy}
                        _hover={{ bg: "whiteAlpha.450" }}
                      >
                        <HStack spacing={1}>
                          <Text>{DataApplication?.appCode || "APP-CODE"}</Text>
                          <Icon as={FiCopy} boxSize={2.5} />
                        </HStack>
                      </Badge>
                    </Tooltip>

                    {DataApplication?.appShortName && (
                      <Badge bg="blackAlpha.400" color="white" px={2.5} py={0.5} rounded="md" fontSize="2xs" fontWeight="semibold">
                        {DataApplication.appShortName}
                      </Badge>
                    )}

                    {/* Status Badge */}
                    <Badge
                      colorScheme={
                        DataApplication?.appsStatus === "ACTIVE"
                          ? "green"
                          : DataApplication?.appsStatus === "ON DEVELOPMENT"
                          ? "purple"
                          : "red"
                      }
                      variant="solid"
                      px={2.5}
                      py={0.5}
                      rounded="full"
                      fontSize="2xs"
                      fontWeight="bold"
                    >
                      {DataApplication?.appsStatus || "ACTIVE"}
                    </Badge>

                    {/* Critical Mission Badge */}
                    {isCritical && (
                      <Badge bg="red.500" color="white" px={2.5} py={0.5} rounded="full" fontSize="2xs" fontWeight="extrabold" shadow="sm">
                        CRITICAL {DataApplication?.appCriticalLevel ? `(L${DataApplication.appCriticalLevel})` : ""}
                      </Badge>
                    )}

                    {/* 24/7 SLA Pill */}
                    {DataApplication?.appOperational24hrs === "true" && (
                      <Badge bg="green.400" color="green.950" px={2} py={0.5} rounded="md" fontSize="3xs" fontWeight="extrabold">
                        24/7 SLA
                      </Badge>
                    )}

                    {/* Governance Incomplete Warning Tag in Hero */}
                    {hasGovernanceAlert && (
                      <Badge bg="orange.400" color="orange.950" px={2} py={0.5} rounded="full" fontSize="3xs" fontWeight="extrabold">
                        GOVERNANCE INCOMPLETE
                      </Badge>
                    )}
                  </HStack>

                  <Heading size={{ base: "sm", md: "md" }} fontWeight="800" color="white" lineHeight="shorter">
                    {DataApplication?.appName || "Loading Application..."}
                  </Heading>

                  <HStack spacing={2} fontSize="2xs" color="whiteAlpha.850" wrap="wrap">
                    <HStack spacing={1}>
                      <Text opacity={0.75}>IT Management:</Text>
                      {isITManagementEmpty ? (
                        <Badge colorScheme="red" variant="solid" fontSize="3xs" px={1.5} py={0} rounded="sm">
                          Not Assigned
                        </Badge>
                      ) : (
                        <Text fontWeight="bold">
                          {DataApplication?.appManageByDivisionName || "IT Division"} {DataApplication?.appManageByGroupName ? `• ${DataApplication.appManageByGroupName}` : ""}
                        </Text>
                      )}
                    </HStack>
                    <Text opacity={0.6}>|</Text>
                    <HStack spacing={1}>
                      <Text opacity={0.75}>Business Owner:</Text>
                      {isBusinessOwnerEmpty ? (
                        <Badge colorScheme="red" variant="solid" fontSize="3xs" px={1.5} py={0} rounded="sm">
                          Not Assigned
                        </Badge>
                      ) : (
                        <Text fontWeight="bold">
                          {DataApplication?.appBusinessOwnerDivisionName} {DataApplication?.appBusinessOwnerGroupName ? `• ${DataApplication.appBusinessOwnerGroupName}` : ""}
                        </Text>
                      )}
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>

              {/* Right Hero Actions */}
              <HStack spacing={2.5} alignSelf={{ base: "flex-end", lg: "center" }}>
                <Button
                  leftIcon={<FiRefreshCcw />}
                  size="md"
                  h="40px"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.300"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(8px)"
                  _hover={{ bg: "whiteAlpha.250", borderColor: "whiteAlpha.450", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={4}
                  isLoading={IsLoadingProcess}
                  onClick={() => {
                    LoadApplicationData();
                    LoadBacklogs();
                    LoadAssessments();
                    setAssessmentRefresh((p) => p + 1);
                  }}
                  transition="all 0.2s ease"
                >
                  Refresh
                </Button>

                <Button
                  leftIcon={<FiCopy />}
                  size="md"
                  h="40px"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.300"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(8px)"
                  _hover={{ bg: "whiteAlpha.250", borderColor: "whiteAlpha.450", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={4}
                  onClick={onCopy}
                  transition="all 0.2s ease"
                >
                  {hasCopied ? "Copied!" : "Copy Code"}
                </Button>

                {IsEditMode ? (
                  <>
                    <Button
                      leftIcon={<FiX />}
                      size="md"
                      h="40px"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "whiteAlpha.250" }}
                      rounded="full"
                      px={4}
                      onClick={() => {
                        setIsEditMode(false);
                        LoadApplicationData();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftIcon={<FiSave />}
                      size="md"
                      h="40px"
                      bg="green.400"
                      color="green.950"
                      _hover={{ bg: "green.300", transform: "translateY(-1px)" }}
                      rounded="full"
                      px={5}
                      fontWeight="bold"
                      shadow="lg"
                      isLoading={IsLoadingProcess}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    leftIcon={<FiEdit />}
                    size="md"
                    h="40px"
                    bg="secondary.400"
                    color="white"
                    _hover={{ bg: "secondary.300", transform: "translateY(-1px)" }}
                    rounded="full"
                    px={5}
                    fontSize="sm"
                    fontWeight="bold"
                    shadow="md"
                    onClick={() => setIsEditMode(true)}
                    transition="all 0.2s ease"
                  >
                    Edit Data
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Sub-hero 4 Quick Metrics Grid */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={5} pt={4} borderTop="1px solid" borderColor="whiteAlpha.200">
              <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                      Operations & SLA
                    </Text>
                    <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                      {DataApplication?.appOperational24hrs === "true" ? "24/7 Full Standby" : DataApplication?.appOperationalDays || "Standard Working Days"}
                    </Text>
                  </VStack>
                  <Icon as={FiClock} boxSize={4} color="green.300" />
                </HStack>
              </Box>

              <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                      Criticality Level
                    </Text>
                    <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                      {isCritical ? `Critical (Level ${DataApplication?.appCriticalLevel || "1"})` : "Standard Tier"}
                    </Text>
                  </VStack>
                  <Icon as={FiShield} boxSize={4} color={isCritical ? "red.300" : "blue.300"} />
                </HStack>
              </Box>

              <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                      Project Portfolio
                    </Text>
                    <Text fontSize="xs" fontWeight="extrabold" color="white">
                      {totalProjects} Projects ({completedProjects} Done)
                    </Text>
                  </VStack>
                  <Icon as={FiBriefcase} boxSize={4} color="yellow.300" />
                </HStack>
              </Box>

              <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                      Access & Platform
                    </Text>
                    <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                      {DataApplication?.appTargetUsers || "INTERNAL"} • {DataApplication?.appAccessMedia || "Web / Service"}
                    </Text>
                  </VStack>
                  <Icon as={FiGlobe} boxSize={4} color="cyan.300" />
                </HStack>
              </Box>
            </SimpleGrid>
          </Box>

          {/* ══════════════════════════════════════════════════════════════════
              ALERT SECTION: GOVERNANCE MISSING / EMPTY WARNING
              ══════════════════════════════════════════════════════════════════ */}
          {hasGovernanceAlert && (
            <Box
              mb={5}
              p={4}
              rounded={radiusStyle}
              bg={isDark ? "rgba(237, 137, 54, 0.12)" : "orange.50"}
              border="1.5px solid"
              borderColor={isDark ? "orange.600" : "orange.300"}
              shadow="md"
            >
              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={3}>
                <HStack spacing={3.5} align="start">
                  <Box
                    p={2.5}
                    rounded="xl"
                    bg={isDark ? "orange.900" : "orange.100"}
                    color="orange.500"
                    mt={0.5}
                    shadow="sm"
                  >
                    <Icon as={FiAlertTriangle} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} wrap="wrap">
                      <Heading size="xs" fontWeight="800" color={isDark ? "orange.200" : "orange.800"}>
                        Attention: Application Governance Data Incomplete
                      </Heading>
                      <Badge colorScheme="orange" variant="solid" fontSize="3xs" px={2} py={0.5} rounded="full">
                        Organization Structure Incomplete
                      </Badge>
                    </HStack>
                    <VStack align="start" spacing={0.5} fontSize="xs" color={isDark ? "orange.300" : "orange.800"}>
                      {isITManagementEmpty && (
                        <HStack spacing={1.5}>
                          <Icon as={FiAlertCircle} boxSize={3.5} color="red.500" />
                          <Text>
                            <strong>IT Managing Division (IT Management)</strong> has not been assigned or is empty.
                          </Text>
                        </HStack>
                      )}
                      {isBusinessOwnerEmpty && (
                        <HStack spacing={1.5}>
                          <Icon as={FiAlertCircle} boxSize={3.5} color="red.500" />
                          <Text>
                            <strong>Business Owner Division</strong> has not been assigned or is empty.
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                </HStack>

                <Button
                  leftIcon={<FiSettings />}
                  size="sm"
                  colorScheme="orange"
                  variant="solid"
                  rounded="xl"
                  px={4}
                  h="36px"
                  fontSize="xs"
                  fontWeight="bold"
                  shadow="sm"
                  onClick={() => {
                    setActiveTabIndex(2); // Jump to Tab 3: Governance & Team
                    if (!IsEditMode) {
                      setIsEditMode(true);
                    }
                  }}
                  flexShrink={0}
                >
                  {IsEditMode ? "Open Governance Tab" : "Complete Governance Data Now"}
                </Button>
              </Flex>
            </Box>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              FULL WIDTH WORKSPACE CONTAINER
              ══════════════════════════════════════════════════════════════════ */}
          <Card
            w="full"
            shadow="md"
            rounded={radiusStyle}
            border="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "white"}
            overflow="hidden"
          >
                <Tabs
                  variant="unstyled"
                  index={activeTabIndex}
                  onChange={(index) => setActiveTabIndex(index)}
                  colorScheme="secondary"
                  isLazy
                >
                  {/* Clean Thematic TabList with Scroll Control */}
                  <TabList
                    px={{ base: 3, md: 5 }}
                    pt={3}
                    pb={2}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderBottom="1px"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    gap={2}
                    overflowX="auto"
                    css={{
                      "&::-webkit-scrollbar": { height: "4px" },
                      "&::-webkit-scrollbar-thumb": {
                        background: isDark ? "#4A5568" : "#CBD5E0",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiEye} />
                        <Text>Executive Summary</Text>
                      </HStack>
                    </Tab>

                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiFileText} />
                        <Text>Specs & Architecture</Text>
                      </HStack>
                    </Tab>

                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiUsers} />
                        <Text>Governance & Team</Text>
                        {hasGovernanceAlert && (
                          <Box w={2} h={2} bg="orange.400" rounded="full" />
                        )}
                      </HStack>
                    </Tab>

                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiBriefcase} />
                        <Text>Project Portfolio ({DataProjects.length || totalProjects})</Text>
                      </HStack>
                    </Tab>

                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiActivity} />
                        <Text>Assessment Report ({assessmentTotal})</Text>
                      </HStack>
                    </Tab>

                    <Tab
                      fontSize="xs"
                      fontWeight="bold"
                      px={4}
                      py={2.5}
                      rounded="xl"
                      color={isDark ? "gray.400" : "gray.600"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                      }}
                      _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                      transition="all 0.2s"
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={2}>
                        <Icon as={FiServer} />
                        <Text>Application Environment ({serverEnvironments.length})</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  {/* ════════════════════════════════════════════════════════════
                      TAB PANELS
                      ════════════════════════════════════════════════════════════ */}
                  <TabPanels>
                    {/* ──────────────────────────────────────────────────────────
                        TAB 1: RINGKASAN EKSEKUTIF (OVERVIEW)
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={6} align="stretch">
                        {/* Section 1: Profil Aplikasi */}
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <HStack spacing={2} mb={4} color="secondary.500">
                            <Icon as={FiTarget} boxSize={5} />
                            <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                              Profile & Executive Summary
                            </Heading>
                          </HStack>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">FULL APPLICATION NAME</Text>
                              <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                {DataApplication?.appName || "-"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">SHORT NAME & CODE</Text>
                              <HStack spacing={2} mt={0.5}>
                                <Badge colorScheme="purple">{DataApplication?.appShortName || "-"}</Badge>
                                <Badge colorScheme="blue">{DataApplication?.appCode || "-"}</Badge>
                              </HStack>
                            </Box>
                            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">APPLICATION DESCRIPTION</Text>
                              <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"} mt={1} lineHeight="tall">
                                {DataApplication?.appsDesc || "No detailed description provided for this application."}
                              </Text>
                            </Box>
                            {DataApplication?.note && (
                              <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">SPECIAL NOTES</Text>
                                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"} mt={1} fontStyle="italic">
                                  {DataApplication.note}
                                </Text>
                              </Box>
                            )}
                          </SimpleGrid>
                        </Box>

                        {/* Section 2: Arsitektur & Teknologi */}
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <HStack spacing={2} mb={4} color="secondary.500">
                            <Icon as={FiCpu} boxSize={5} />
                            <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                              Technology, Stack & Development Method
                            </Heading>
                          </HStack>

                          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">PROGRAMMING LANGUAGES</Text>
                              <Wrap mt={1}>
                                {DataApplication?.appProgrammingLanguages?.split(",").map((item, idx) => (
                                  <Badge key={idx} colorScheme="blue" variant="subtle" fontSize="2xs" rounded="md" px={2} py={0.5}>
                                    {item.trim()}
                                  </Badge>
                                )) || <Text fontSize="xs" color="gray.400">-</Text>}
                              </Wrap>
                            </Box>

                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">FRAMEWORKS & RUNTIME</Text>
                              <Wrap mt={1}>
                                {DataApplication?.appProgrammingFrameworks?.split(",").map((item, idx) => (
                                  <Badge key={idx} colorScheme="purple" variant="subtle" fontSize="2xs" rounded="md" px={2} py={0.5}>
                                    {item.trim()}
                                  </Badge>
                                )) || <Text fontSize="xs" color="gray.400">-</Text>}
                              </Wrap>
                            </Box>

                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">DEVELOPMENT METHOD</Text>
                              <Text fontSize="xs" fontWeight="bold" mt={1}>
                                {DataApplication?.appDevelopmentMethod || "Agile / Scrum"}
                              </Text>
                            </Box>

                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">APPLICATION TYPES</Text>
                              <Wrap mt={1}>
                                {DataApplication?.appTypes?.split(",").map((type, idx) => (
                                  <Tag key={idx} size="sm" colorScheme="teal" rounded="md">
                                    <TagLabel fontSize="2xs">{type.trim()}</TagLabel>
                                  </Tag>
                                )) || <Text fontSize="xs" color="gray.400">-</Text>}
                              </Wrap>
                            </Box>

                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">SERVER & HOSTING LOCATION</Text>
                              <Wrap mt={1}>
                                {DataApplication?.appEnvLocations?.split(",").map((loc, idx) => (
                                  <Tag key={idx} size="sm" colorScheme="orange" rounded="md">
                                    <TagLabel fontSize="2xs">{loc.trim()}</TagLabel>
                                  </Tag>
                                )) || <Text fontSize="xs" color="gray.400">-</Text>}
                              </Wrap>
                            </Box>

                            <Box>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">PRIVATE AUTH & HIGH AVAILABILITY</Text>
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme={DataApplication?.appPrivateAuth === "Y" ? "green" : "gray"}>
                                  Auth: {DataApplication?.appPrivateAuth === "Y" ? "Private" : "Public"}
                                </Badge>
                                <Badge colorScheme={DataApplication?.appHightAvailability === "Y" ? "green" : "gray"}>
                                  HA: {DataApplication?.appHightAvailability === "Y" ? "Enabled" : "Standard"}
                                </Badge>
                              </HStack>
                            </Box>
                          </SimpleGrid>
                        </Box>

                        {/* Section 3: Jaringan & Lingkungan Akses */}
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <HStack spacing={2} mb={4} color="secondary.500">
                            <Icon as={FiServer} boxSize={5} />
                            <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                              Network, DNS & Access Environment
                            </Heading>
                          </HStack>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="2xs" fontWeight="bold" color="blue.500">FRONTSITE (PUBLIC ACCESS)</Text>
                                <Icon as={FiGlobe} color="blue.500" />
                              </HStack>
                              <Text fontSize="xs" color="gray.500">DNS:</Text>
                              <Text fontSize="xs" fontWeight="bold" fontFamily="mono">{DataApplication?.appAccessFrontsiteDns || "-"}</Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>IP:</Text>
                              <Text fontSize="xs" fontWeight="bold" fontFamily="mono">{DataApplication?.appAccessFrontsiteIp || "-"}</Text>
                            </Box>

                            <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="2xs" fontWeight="bold" color="purple.500">BACKSITE (INTERNAL / BACKEND)</Text>
                                <Icon as={FiLock} color="purple.500" />
                              </HStack>
                              <Text fontSize="xs" color="gray.500">DNS:</Text>
                              <Text fontSize="xs" fontWeight="bold" fontFamily="mono">{DataApplication?.appAccessBacksiteDns || "-"}</Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>IP:</Text>
                              <Text fontSize="xs" fontWeight="bold" fontFamily="mono">{DataApplication?.appAccessBacksiteIp || "-"}</Text>
                            </Box>
                          </SimpleGrid>
                        </Box>

                        {/* Section 4: Project SDLC Ratio & Audit Metadata */}
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                          {/* Project SDLC Ratio Card */}
                          <Box
                            p={5}
                            rounded="xl"
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            bg={isDark ? "gray.850" : "gray.50"}
                          >
                            <HStack spacing={2} mb={4} color="secondary.500">
                              <Icon as={FiBriefcase} boxSize={5} />
                              <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                Project SDLC Ratio
                              </Heading>
                            </HStack>

                            <VStack spacing={3.5} align="stretch">
                              <Flex justify="space-between" align="center" fontSize="xs">
                                <Text color="gray.500" fontWeight="bold">Completion Rate</Text>
                                <Text fontWeight="extrabold" color="secondary.500" fontSize="sm">{completionRate}%</Text>
                              </Flex>
                              <Progress
                                value={completionRate}
                                size="md"
                                colorScheme={completionRate === 100 ? "green" : "secondary"}
                                rounded="full"
                                bg={isDark ? "gray.700" : "gray.200"}
                              />
                              <HStack justify="space-between" fontSize="xs" pt={1}>
                                <VStack align="start" spacing={0.5}>
                                  <Text color="gray.500" fontSize="2xs" fontWeight="bold">TOTAL PROJECTS</Text>
                                  <Text fontWeight="extrabold" fontSize="md">{totalProjects}</Text>
                                </VStack>
                                <VStack align="center" spacing={0.5}>
                                  <Text color="orange.500" fontSize="2xs" fontWeight="bold">ON GOING</Text>
                                  <Text fontWeight="extrabold" color="orange.500" fontSize="md">{onGoingProjects}</Text>
                                </VStack>
                                <VStack align="end" spacing={0.5}>
                                  <Text color="green.500" fontSize="2xs" fontWeight="bold">COMPLETED</Text>
                                  <Text fontWeight="extrabold" color="green.500" fontSize="md">{completedProjects}</Text>
                                </VStack>
                              </HStack>
                            </VStack>
                          </Box>

                          {/* Audit & Metadata Card */}
                          <Box
                            p={5}
                            rounded="xl"
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            bg={isDark ? "gray.850" : "gray.50"}
                          >
                            <HStack spacing={2} mb={4} color="secondary.500">
                              <Icon as={FiActivity} boxSize={5} />
                              <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                Audit & Metadata
                              </Heading>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5}>
                              <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">CREATED AT</Text>
                                <Text fontSize="xs" fontWeight="bold" mt={0.5}>
                                  {DataApplication?.createdAt ? new Date(DataApplication.createdAt).toLocaleDateString("en-US") : "-"}
                                </Text>
                              </Box>

                              <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">CREATED BY</Text>
                                <Text fontSize="xs" fontWeight="bold" mt={0.5} noOfLines={1}>
                                  {DataApplication?.createdBy || "-"}
                                </Text>
                              </Box>

                              <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">UPDATED AT</Text>
                                <Text fontSize="xs" fontWeight="bold" mt={0.5}>
                                  {DataApplication?.updatedAt ? new Date(DataApplication.updatedAt).toLocaleDateString("en-US") : "-"}
                                </Text>
                              </Box>

                              <Box p={3} rounded="lg" bg={isDark ? "gray.800" : "white"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">DATA STATUS</Text>
                                <Badge
                                  mt={1}
                                  colorScheme={
                                    DataApplication?.appsStatus === "ACTIVE"
                                      ? "green"
                                      : DataApplication?.appsStatus === "ON DEVELOPMENT"
                                      ? "purple"
                                      : "red"
                                  }
                                  fontSize="2xs"
                                  rounded="md"
                                  px={2}
                                  py={0.5}
                                >
                                  {DataApplication?.appsStatus || "ACTIVE"}
                                </Badge>
                              </Box>
                            </SimpleGrid>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>

                    {/* ──────────────────────────────────────────────────────────
                        TAB 2: SPESIFIKASI & ARSITEKTUR (VIEW / EDIT FORM)
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={6} align="stretch">
                        {/* Section Header */}
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                              {IsEditMode ? "Edit Application Specifications & Architecture" : "Architecture & Technical Specifications"}
                            </Heading>
                            <Text fontSize="2xs" color="gray.500">
                              {IsEditMode ? "Update technical information and system configuration." : "Detailed technical information regarding architecture, programming languages, and environment."}
                            </Text>
                          </VStack>
                        </Flex>

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        {/* Form Grid */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isRequired={IsEditMode}>
                            <FormLabel fontSize="xs" fontWeight="bold">Application Name</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appName}
                                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                placeholder="Example: Core Banking System"
                              />
                            ) : (
                              <Text fontSize="sm" fontWeight="bold">{DataApplication?.appName || "-"}</Text>
                            )}
                          </FormControl>

                          {/* Short Name: DISABLED ON EDIT */}
                          <FormControl>
                            <HStack justify="space-between" align="center" mb={1}>
                              <FormLabel fontSize="xs" fontWeight="bold" mb={0}>Short Name</FormLabel>
                              {IsEditMode && (
                                <Badge colorScheme="gray" fontSize="3xs" rounded="md">
                                  Locked (Read Only)
                                </Badge>
                              )}
                            </HStack>
                            {IsEditMode ? (
                              <Box>
                                <Tooltip label="Application short name cannot be changed once created" placement="top" hasArrow>
                                  <Input
                                    size="md"
                                    rounded="xl"
                                    value={formData.appShortName}
                                    isDisabled={true}
                                    isReadOnly={true}
                                    bg={isDark ? "gray.700" : "gray.100"}
                                    opacity={0.8}
                                    cursor="not-allowed"
                                    placeholder="Example: CBS"
                                  />
                                </Tooltip>
                                <Text fontSize="3xs" color="gray.500" mt={1}>
                                  *Application short name is permanent and cannot be edited.
                                </Text>
                              </Box>
                            ) : (
                              <Text fontSize="sm" fontWeight="semibold">{DataApplication?.appShortName || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl isRequired={IsEditMode}>
                            <FormLabel fontSize="xs" fontWeight="bold">Operational Status</FormLabel>
                            {IsEditMode ? (
                              <ChakraSelect
                                size="md"
                                rounded="xl"
                                value={formData.appsStatus}
                                onChange={(e) => setFormData({ ...formData, appsStatus: e.target.value })}
                              >
                                <option value="ON DEVELOPMENT">ON DEVELOPMENT (Dalam Pengembangan)</option>
                                <option value="ACTIVE">ACTIVE (Operasional Aktif)</option>
                                <option value="INACTIVE">INACTIVE (Non-Aktif)</option>
                              </ChakraSelect>
                            ) : (
                              <Box mt={1}>
                                <Badge
                                  colorScheme={
                                    DataApplication?.appsStatus === "ACTIVE"
                                      ? "green"
                                      : DataApplication?.appsStatus === "ON DEVELOPMENT"
                                      ? "purple"
                                      : "red"
                                  }
                                  variant="subtle"
                                  px={2.5}
                                  py={1}
                                  rounded="md"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  {DataApplication?.appsStatus || "ACTIVE"}
                                </Badge>
                              </Box>
                            )}
                          </FormControl>

                          <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                            <FormLabel fontSize="xs" fontWeight="bold">Application Description</FormLabel>
                            {IsEditMode ? (
                              <Textarea
                                rows={3}
                                rounded="xl"
                                value={formData.appsDesc}
                                onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                                placeholder="Describe functional requirements and system objectives..."
                              />
                            ) : (
                              <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"}>{DataApplication?.appsDesc || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                            <FormLabel fontSize="xs" fontWeight="bold">Additional Notes</FormLabel>
                            {IsEditMode ? (
                              <Textarea
                                rows={2}
                                rounded="xl"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Internal notes or supporting information..."
                              />
                            ) : (
                              <Text fontSize="xs" color="gray.500">{DataApplication?.note || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Programming Languages</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appProgrammingLanguages}
                                onChange={(e) => setFormData({ ...formData, appProgrammingLanguages: e.target.value })}
                                placeholder="C#, TypeScript, Java, Python (comma separated)"
                              />
                            ) : (
                              <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appProgrammingLanguages || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Frameworks & Runtime</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appProgrammingFrameworks}
                                onChange={(e) => setFormData({ ...formData, appProgrammingFrameworks: e.target.value })}
                                placeholder=".NET 8, Next.js, Spring Boot (comma separated)"
                              />
                            ) : (
                              <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appProgrammingFrameworks || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Development Method</FormLabel>
                            {IsEditMode ? (
                              <ChakraSelect
                                size="md"
                                rounded="xl"
                                value={formData.appDevelopmentMethod}
                                onChange={(e) => setFormData({ ...formData, appDevelopmentMethod: e.target.value })}
                              >
                                <option value="">Select Method</option>
                                <option value="Scrum">Scrum / Agile</option>
                                <option value="Kanban">Kanban</option>
                                <option value="Waterfall">Waterfall</option>
                                <option value="Hybrid">Hybrid</option>
                              </ChakraSelect>
                            ) : (
                              <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appDevelopmentMethod || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Criticality Level</FormLabel>
                            {IsEditMode ? (
                              <HStack spacing={3}>
                                <RadioGroup
                                  value={formData.appIsCritical}
                                  onChange={(val) => setFormData({ ...formData, appIsCritical: val })}
                                >
                                  <HStack spacing={3}>
                                    <Radio value="Y" colorScheme="red">Critical</Radio>
                                    <Radio value="N" colorScheme="gray">Standard</Radio>
                                  </HStack>
                                </RadioGroup>
                                {formData.appIsCritical === "Y" && (
                                  <ChakraSelect
                                    size="sm"
                                    w="120px"
                                    rounded="lg"
                                    value={formData.appCriticalLevel}
                                    onChange={(e) => setFormData({ ...formData, appCriticalLevel: e.target.value })}
                                  >
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                  </ChakraSelect>
                                )}
                              </HStack>
                            ) : (
                              <Badge colorScheme={isCritical ? "red" : "gray"}>
                                {isCritical ? `Critical (Level ${DataApplication?.appCriticalLevel || "1"})` : "Standard"}
                              </Badge>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">DNS Frontsite (Public)</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appAccessFrontsiteDns}
                                onChange={(e) => setFormData({ ...formData, appAccessFrontsiteDns: e.target.value })}
                                placeholder="app.bankkaltimtara.co.id"
                              />
                            ) : (
                              <Text fontSize="xs" fontFamily="mono">{DataApplication?.appAccessFrontsiteDns || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">IP Frontsite (Public)</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appAccessFrontsiteIp}
                                onChange={(e) => setFormData({ ...formData, appAccessFrontsiteIp: e.target.value })}
                                placeholder="103.xxx.xxx.xxx"
                              />
                            ) : (
                              <Text fontSize="xs" fontFamily="mono">{DataApplication?.appAccessFrontsiteIp || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">DNS Backsite (Backend/Internal)</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appAccessBacksiteDns}
                                onChange={(e) => setFormData({ ...formData, appAccessBacksiteDns: e.target.value })}
                                placeholder="api-internal.bankkaltimtara.co.id"
                              />
                            ) : (
                              <Text fontSize="xs" fontFamily="mono">{DataApplication?.appAccessBacksiteDns || "-"}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">IP Backsite (Backend/Internal)</FormLabel>
                            {IsEditMode ? (
                              <Input
                                size="md"
                                rounded="xl"
                                value={formData.appAccessBacksiteIp}
                                onChange={(e) => setFormData({ ...formData, appAccessBacksiteIp: e.target.value })}
                                placeholder="192.168.xxx.xxx"
                              />
                            ) : (
                              <Text fontSize="xs" fontFamily="mono">{DataApplication?.appAccessBacksiteIp || "-"}</Text>
                            )}
                          </FormControl>
                        </SimpleGrid>

                        {/* Save Button if in Edit Mode */}
                        {IsEditMode && (
                          <Flex justify="flex-end" pt={4}>
                            <Button
                              leftIcon={<FiSave />}
                              colorScheme="secondary"
                              size="md"
                              h="42px"
                              rounded="xl"
                              px={6}
                              fontWeight="bold"
                              isLoading={IsLoadingProcess}
                              onClick={handleSave}
                            >
                              Save Specifications
                            </Button>
                          </Flex>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* ──────────────────────────────────────────────────────────
                        TAB 3: PENGELOLA & TATA KELOLA (OWNER & GOVERNANCE)
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={6} align="stretch">
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                              Governance Structure & Management Team
                            </Heading>
                            <Text fontSize="2xs" color="gray.500">
                              Configuration for IT managing division, business owner, assigned PICs, and operational hours.
                            </Text>
                          </VStack>
                        </Flex>

                        {/* In-tab Warning Banner if Governance is Incomplete */}
                        {hasGovernanceAlert && (
                          <Box
                            p={3.5}
                            rounded="xl"
                            bg={isDark ? "rgba(237, 137, 54, 0.15)" : "orange.50"}
                            border="1px dashed"
                            borderColor={isDark ? "orange.600" : "orange.300"}
                          >
                            <HStack spacing={3} align="start">
                              <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                              <VStack align="start" spacing={0.5} fontSize="xs">
                                <Text fontWeight="bold" color={isDark ? "orange.200" : "orange.800"}>
                                  Governance & Business Owner Data Incomplete
                                </Text>
                                <Text color={isDark ? "orange.300" : "orange.700"}>
                                  Please assign the IT Managing Division and Business Owner Division to ensure operational accountability and escalation pathways.
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        )}

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                          {/* Pengelola TI (Manage By) */}
                          <Box
                            p={4}
                            rounded="xl"
                            border="1.5px solid"
                            borderColor={isITManagementEmpty ? (isDark ? "orange.600" : "orange.300") : (isDark ? "gray.700" : "gray.200")}
                            bg={isDark ? "gray.850" : "gray.50"}
                          >
                            <Flex justify="space-between" align="center" mb={3}>
                              <HStack spacing={2} color="secondary.500">
                                <Icon as={FiUsers} />
                                <Heading size="xs" fontWeight="bold">IT Management Division</Heading>
                              </HStack>
                              {isITManagementEmpty && (
                                <Badge colorScheme="red" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                  Required
                                </Badge>
                              )}
                            </Flex>

                            <VStack spacing={3} align="stretch">
                              <FormControl isRequired={IsEditMode}>
                                <FormLabel fontSize="2xs" fontWeight="bold">IT Managing Division</FormLabel>
                                {IsEditMode ? (
                                  <Select
                                    options={divisionOptions}
                                    value={divisionOptions.find((o) => o.value === formData.appManageByDivisionId)}
                                    onChange={(opt: any) => setFormData({ ...formData, appManageByDivisionId: opt?.value || "" })}
                                    placeholder="Select IT Managing Division..."
                                  />
                                ) : DataApplication?.appManageByDivisionName ? (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication.appManageByDivisionName}</Text>
                                ) : (
                                  <HStack spacing={1.5} color="red.500">
                                    <Icon as={FiAlertCircle} boxSize={3.5} />
                                    <Text fontSize="xs" fontWeight="bold">Not Assigned (Empty)</Text>
                                  </HStack>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">IT Managing Group</FormLabel>
                                {IsEditMode ? (
                                  <Select
                                    options={groupOptions.filter((g) => !formData.appManageByDivisionId || g.parentId === formData.appManageByDivisionId)}
                                    value={groupOptions.find((o) => o.value === formData.appManageByGroupId)}
                                    onChange={(opt: any) => setFormData({ ...formData, appManageByGroupId: opt?.value || "" })}
                                    placeholder="Select IT Group..."
                                  />
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appManageByGroupName || "-"}</Text>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">IT Managing PIC</FormLabel>
                                {IsEditMode ? (
                                  <VStack align="stretch" spacing={2}>
                                    <InputGroup size="sm">
                                      <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                      </InputLeftElement>
                                      <Input
                                        placeholder="Search IT PIC user..."
                                        value={ManagerPICSearch}
                                        onChange={(e) => handleSearchUser(e.target.value, "managerPIC")}
                                        rounded="lg"
                                      />
                                    </InputGroup>
                                    <UserSearchSelect
                                      selectedUserCode={formData.appManagePicUserId}
                                      onUserSelect={(user) => {
                                        setFormData({
                                          ...formData,
                                          appManagePicUserId: user?.userId || "",
                                          appManagePicName: user?.nama || "",
                                        });
                                      }}
                                      usersData={DataUsersManagerPIC}
                                      editMode={IsEditMode}
                                    />
                                    {formData.appManagePicName && (
                                      <Text fontSize="2xs" color="green.500" fontWeight="bold">
                                        Selected: {formData.appManagePicName} ({formData.appManagePicUserId})
                                      </Text>
                                    )}
                                  </VStack>
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appManagePicName || "-"}</Text>
                                )}
                              </FormControl>
                            </VStack>
                          </Box>

                          {/* Pemilik Bisnis (Business Owner) */}
                          <Box
                            p={4}
                            rounded="xl"
                            border="1.5px solid"
                            borderColor={isBusinessOwnerEmpty ? (isDark ? "orange.600" : "orange.300") : (isDark ? "gray.700" : "gray.200")}
                            bg={isDark ? "gray.850" : "gray.50"}
                          >
                            <Flex justify="space-between" align="center" mb={3}>
                              <HStack spacing={2} color="purple.500">
                                <Icon as={FiTarget} />
                                <Heading size="xs" fontWeight="bold">Business Owner Division</Heading>
                              </HStack>
                              {isBusinessOwnerEmpty && (
                                <Badge colorScheme="red" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                  Required
                                </Badge>
                              )}
                            </Flex>

                            <VStack spacing={3} align="stretch">
                              <FormControl isRequired={IsEditMode}>
                                <FormLabel fontSize="2xs" fontWeight="bold">Business Owner Division</FormLabel>
                                {IsEditMode ? (
                                  <Select
                                    options={divisionOptions}
                                    value={divisionOptions.find((o) => o.value === formData.appBusinessOwnerDivisionId)}
                                    onChange={(opt: any) => setFormData({ ...formData, appBusinessOwnerDivisionId: opt?.value || "" })}
                                    placeholder="Select Business Owner Division..."
                                  />
                                ) : DataApplication?.appBusinessOwnerDivisionName ? (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication.appBusinessOwnerDivisionName}</Text>
                                ) : (
                                  <HStack spacing={1.5} color="red.500">
                                    <Icon as={FiAlertCircle} boxSize={3.5} />
                                    <Text fontSize="xs" fontWeight="bold">Not Assigned (Empty)</Text>
                                  </HStack>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">Business Owner Group</FormLabel>
                                {IsEditMode ? (
                                  <Select
                                    options={groupOptions.filter((g) => !formData.appBusinessOwnerDivisionId || g.parentId === formData.appBusinessOwnerDivisionId)}
                                    value={groupOptions.find((o) => o.value === formData.appBusinessOwnerGroupId)}
                                    onChange={(opt: any) => setFormData({ ...formData, appBusinessOwnerGroupId: opt?.value || "" })}
                                    placeholder="Select Business Group..."
                                  />
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appBusinessOwnerGroupName || "-"}</Text>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">Business Owner PIC</FormLabel>
                                {IsEditMode ? (
                                  <VStack align="stretch" spacing={2}>
                                    <InputGroup size="sm">
                                      <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                      </InputLeftElement>
                                      <Input
                                        placeholder="Search Business PIC user..."
                                        value={BusinessOwnerPICSearch}
                                        onChange={(e) => handleSearchUser(e.target.value, "businessOwnerPIC")}
                                        rounded="lg"
                                      />
                                    </InputGroup>
                                    <UserSearchSelect
                                      selectedUserCode={formData.appBusinessOwnerPicUserId}
                                      onUserSelect={(user) => {
                                        setFormData({
                                          ...formData,
                                          appBusinessOwnerPicUserId: user?.userId || "",
                                          appBusinessOwnerPicName: user?.nama || "",
                                        });
                                      }}
                                      usersData={DataUsersBusinessOwnerPIC}
                                      editMode={IsEditMode}
                                    />
                                    {formData.appBusinessOwnerPicName && (
                                      <Text fontSize="2xs" color="purple.500" fontWeight="bold">
                                        Selected: {formData.appBusinessOwnerPicName} ({formData.appBusinessOwnerPicUserId})
                                      </Text>
                                    )}
                                  </VStack>
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appBusinessOwnerPicName || "-"}</Text>
                                )}
                              </FormControl>
                            </VStack>
                          </Box>

                          {/* Operasional & SLA */}
                          <Box gridColumn={{ base: "1", md: "1 / -1" }} p={4} rounded="xl" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.850" : "gray.50"}>
                            <HStack spacing={2} mb={3} color="green.500">
                              <Icon as={FiClock} />
                              <Heading size="xs" fontWeight="bold">Operational Schedule & Working Hours</Heading>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">24/7 Full Service (24/7)</FormLabel>
                                {IsEditMode ? (
                                  <RadioGroup
                                    value={formData.appOperational24hrs}
                                    onChange={(val) => setFormData({ ...formData, appOperational24hrs: val })}
                                  >
                                    <HStack spacing={4} mt={1}>
                                      <Radio value="true" colorScheme="green">Yes (24/7)</Radio>
                                      <Radio value="false" colorScheme="gray">No</Radio>
                                    </HStack>
                                  </RadioGroup>
                                ) : (
                                  <Badge colorScheme={DataApplication?.appOperational24hrs === "true" ? "green" : "gray"}>
                                    {DataApplication?.appOperational24hrs === "true" ? "24/7 SLA Active" : "Standard Working Hours"}
                                  </Badge>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">Opening Hours</FormLabel>
                                {IsEditMode ? (
                                  <Input
                                    size="sm"
                                    rounded="lg"
                                    type="time"
                                    value={formData.appOperationalHourOpen}
                                    onChange={(e) => setFormData({ ...formData, appOperationalHourOpen: e.target.value })}
                                  />
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appOperationalHourOpen || "08:00"}</Text>
                                )}
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">Closing Hours</FormLabel>
                                {IsEditMode ? (
                                  <Input
                                    size="sm"
                                    rounded="lg"
                                    type="time"
                                    value={formData.appOperationalHourClosed}
                                    onChange={(e) => setFormData({ ...formData, appOperationalHourClosed: e.target.value })}
                                  />
                                ) : (
                                  <Text fontSize="xs" fontWeight="semibold">{DataApplication?.appOperationalHourClosed || "17:00"}</Text>
                                )}
                              </FormControl>
                            </SimpleGrid>
                          </Box>
                        </SimpleGrid>

                        {IsEditMode && (
                          <Flex justify="flex-end" pt={2}>
                            <Button
                              leftIcon={<FiSave />}
                              colorScheme="secondary"
                              size="md"
                              h="42px"
                              rounded="xl"
                              px={6}
                              fontWeight="bold"
                              isLoading={IsLoadingProcess}
                              onClick={handleSave}
                            >
                              Save Governance & Team
                            </Button>
                          </Flex>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* ──────────────────────────────────────────────────────────
                        TAB 4: PORTOFOLIO PROYEK TERHUBUNG
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={6} align="stretch">
                        {/* Header Toolbar & Actions */}
                        <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2.5}>
                              <Box w={8} h={8} rounded="lg" bg="purple.500" display="flex" alignItems="center" justifyContent="center" color="white">
                                <Icon as={FiBriefcase} boxSize={4} />
                              </Box>
                              <Box>
                                <HStack spacing={2}>
                                  <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                    Connected Projects Portfolio
                                  </Heading>
                                  <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                    {projectsTotal} Projects
                                  </Badge>
                                </HStack>
                                <Text fontSize="2xs" color="gray.500">
                                  List of project initiations, SDLC implementations, and system procurements linked to this application.
                                </Text>
                              </Box>
                            </HStack>
                          </VStack>

                          <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                            <Button
                              leftIcon={<FiRefreshCw />}
                              size="sm"
                              rounded="xl"
                              variant="outline"
                              isLoading={IsLoadingProjects}
                              onClick={() => LoadProjects()}
                              fontSize="xs"
                            >
                              Refresh
                            </Button>
                          </HStack>
                        </Flex>

                        {/* 4 Summary Metric Cards */}
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                          <Card rounded="xl" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "gray.50"} shadow="none">
                            <CardBody p={3.5}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="3xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                                    Total Projects
                                  </Text>
                                  <Heading size="md" color={isDark ? "white" : "gray.800"}>
                                    {projectsTotal}
                                  </Heading>
                                </VStack>
                                <Box p={2} rounded="lg" bg={isDark ? "gray.700" : "gray.200"} color="purple.500">
                                  <Icon as={FiFolder} boxSize={4} />
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>

                          <Card rounded="xl" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "gray.50"} shadow="none">
                            <CardBody p={3.5}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="3xs" fontWeight="bold" textTransform="uppercase" color="blue.500" letterSpacing="wider">
                                    Ongoing
                                  </Text>
                                  <Heading size="md" color="blue.500">
                                    {projectsOngoing}
                                  </Heading>
                                </VStack>
                                <Box p={2} rounded="lg" bg={isDark ? "rgba(59, 130, 246, 0.15)" : "blue.50"} color="blue.500">
                                  <Icon as={FiClock} boxSize={4} />
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>

                          <Card rounded="xl" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "gray.50"} shadow="none">
                            <CardBody p={3.5}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="3xs" fontWeight="bold" textTransform="uppercase" color="green.500" letterSpacing="wider">
                                    Completed (Done)
                                  </Text>
                                  <Heading size="md" color="green.500">
                                    {projectsCompleted}
                                  </Heading>
                                </VStack>
                                <Box p={2} rounded="lg" bg={isDark ? "rgba(16, 185, 129, 0.15)" : "green.50"} color="green.500">
                                  <Icon as={FiCheckCircle} boxSize={4} />
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>

                          <Card rounded="xl" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "gray.50"} shadow="none">
                            <CardBody p={3.5}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="3xs" fontWeight="bold" textTransform="uppercase" color="secondary.500" letterSpacing="wider">
                                    Average Progress
                                  </Text>
                                  <Heading size="md" color="secondary.500">
                                    {avgProgress}%
                                  </Heading>
                                </VStack>
                                <Box p={2} rounded="lg" bg={isDark ? "rgba(227, 24, 55, 0.15)" : "red.50"} color="secondary.500">
                                  <Icon as={FiTrendingUp} boxSize={4} />
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Search & Filter Controls */}
                        <Flex
                          direction={{ base: "column", md: "row" }}
                          gap={3}
                          align={{ base: "stretch", md: "center" }}
                          justify="space-between"
                          p={3}
                          rounded="xl"
                          bg={isDark ? "gray.850" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                        >
                          <InputGroup size="sm" maxW={{ base: "full", md: "380px" }}>
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              rounded="lg"
                              placeholder="Search project code, name, SDLC stage, or PIC..."
                              value={projectSearchQuery}
                              onChange={(e) => {
                                setProjectSearchQuery(e.target.value);
                                setProjectPageIndex(0);
                              }}
                            />
                          </InputGroup>

                          <HStack spacing={2} overflowX="auto" pb={{ base: 1, md: 0 }}>
                            <Button
                              size="xs"
                              rounded="full"
                              px={3}
                              colorScheme={projectStatusFilter === "ALL" ? "purple" : "gray"}
                              variant={projectStatusFilter === "ALL" ? "solid" : "outline"}
                              onClick={() => {
                                setProjectStatusFilter("ALL");
                                setProjectPageIndex(0);
                              }}
                            >
                              All ({projectsTotal})
                            </Button>
                            <Button
                              size="xs"
                              rounded="full"
                              px={3}
                              colorScheme={projectStatusFilter === "PROJECT_ONGOING" ? "blue" : "gray"}
                              variant={projectStatusFilter === "PROJECT_ONGOING" ? "solid" : "outline"}
                              onClick={() => {
                                setProjectStatusFilter(projectStatusFilter === "PROJECT_ONGOING" ? "ALL" : "PROJECT_ONGOING");
                                setProjectPageIndex(0);
                              }}
                            >
                              Ongoing
                            </Button>
                            <Button
                              size="xs"
                              rounded="full"
                              px={3}
                              colorScheme={projectStatusFilter === "COMPLETED" ? "green" : "gray"}
                              variant={projectStatusFilter === "COMPLETED" ? "solid" : "outline"}
                              onClick={() => {
                                setProjectStatusFilter(projectStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED");
                                setProjectPageIndex(0);
                              }}
                            >
                              Completed
                            </Button>
                          </HStack>
                        </Flex>

                        {/* Project List Content */}
                        {IsLoadingProjects ? (
                          <Flex justify="center" align="center" py={16} direction="column" gap={3}>
                            <Spinner size="xl" thickness="3px" color="secondary.500" />
                            <Text fontSize="xs" color="gray.500">Loading connected projects portfolio...</Text>
                          </Flex>
                        ) : filteredProjects.length === 0 ? (
                          <Box
                            p={10}
                            textAlign="center"
                            rounded="2xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.300"}
                          >
                            <Icon as={FiFolder} boxSize={12} color="gray.400" mb={3} />
                            <Heading size="xs" mb={1} color={isDark ? "white" : "gray.700"}>
                              {projectSearchQuery ? "No Projects Match Your Search" : "No Connected Projects Yet"}
                            </Heading>
                            <Text fontSize="xs" color="gray.500" maxW="450px" mx="auto">
                              {projectSearchQuery
                                ? `No projects found matching "${projectSearchQuery}". Try using different keywords.`
                                : "This application does not have any connected project initiations or SDLC developments yet."}
                            </Text>
                          </Box>
                        ) : (
                          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                            {filteredProjects.map((prj) => {
                              const statusStyle = getProjectStatusBadge(prj.projectStatus);
                              const progress = prj.projectStatusPercentage || 0;
                              return (
                                <Card
                                  key={prj.id}
                                  rounded="xl"
                                  border="1px solid"
                                  borderColor={isDark ? "gray.700" : "gray.200"}
                                  bg={isDark ? "gray.800" : "white"}
                                  shadow="sm"
                                  _hover={{
                                    shadow: "md",
                                    borderColor: "purple.300",
                                    transform: "translateY(-1px)",
                                  }}
                                  transition="all 0.2s"
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="space-between"
                                >
                                  <CardBody p={5} display="flex" flexDirection="column" gap={3}>
                                    {/* Top Row: Code, Category, Status */}
                                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                      <HStack spacing={2}>
                                        <Badge
                                          px={2.5}
                                          py={0.5}
                                          rounded="md"
                                          bg={isDark ? "rgba(147, 51, 234, 0.2)" : "purple.50"}
                                          color={isDark ? "purple.300" : "purple.700"}
                                          fontWeight="bold"
                                          fontSize="2xs"
                                        >
                                          {prj.projectNo || prj.projectCode || "PRJ"}
                                        </Badge>
                                        {prj.projectType && (
                                          <Badge fontSize="3xs" variant="outline" colorScheme="gray" rounded="md">
                                            {prj.projectType.replace(/_/g, " ")}
                                          </Badge>
                                        )}
                                      </HStack>

                                      <Badge
                                        px={2.5}
                                        py={0.5}
                                        rounded="full"
                                        bg={statusStyle.bg}
                                        color={statusStyle.color}
                                        fontWeight="semibold"
                                        fontSize="3xs"
                                      >
                                        {statusStyle.label}
                                      </Badge>
                                    </Flex>

                                    {/* Project Name & Description */}
                                    <Box>
                                      <Heading
                                        size="xs"
                                        fontWeight="bold"
                                        color={isDark ? "white" : "gray.800"}
                                        mb={1}
                                        lineHeight="short"
                                      >
                                        {prj.projectName}
                                      </Heading>
                                      <Text fontSize="2xs" color="gray.500" noOfLines={2} lineHeight="tall">
                                        {prj.projectDesc || "No detailed project description available."}
                                      </Text>
                                    </Box>

                                    {/* SDLC Stage & Progress */}
                                    <Box bg={isDark ? "gray.750" : "gray.50"} p={2.5} rounded="lg">
                                      <Flex justify="space-between" align="center" mb={1.5}>
                                        <HStack spacing={1.5}>
                                          <Icon as={FiLayers} boxSize={3} color="purple.500" />
                                          <Text fontSize="3xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                            Stage: {prj.sdlcStageName || "SDLC Initiation"}
                                          </Text>
                                        </HStack>
                                        <Text fontSize="3xs" fontWeight="bold" color={progress === 100 ? "green.500" : "purple.500"}>
                                          {progress}%
                                        </Text>
                                      </Flex>
                                      <Progress
                                        value={progress}
                                        size="xs"
                                        rounded="full"
                                        colorScheme={progress === 100 ? "green" : "purple"}
                                        bg={isDark ? "gray.700" : "gray.200"}
                                      />
                                    </Box>

                                    {/* Requirement Ref & PIC/Team */}
                                    <Flex justify="space-between" align="center" pt={1}>
                                      {prj.requirementData?.reqNumber ? (
                                        <HStack spacing={1} fontSize="3xs" color="gray.500">
                                          <Icon as={FiFileText} />
                                          <Text fontWeight="medium">{prj.requirementData.reqNumber}</Text>
                                        </HStack>
                                      ) : (
                                        <HStack spacing={1} fontSize="3xs" color="gray.500">
                                          <Icon as={FiCalendar} />
                                          <Text>
                                            {prj.projectRegisterDate
                                              ? new Date(prj.projectRegisterDate).toLocaleDateString("en-US", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                                  })
                                              : "-"}
                                          </Text>
                                        </HStack>
                                      )}

                                      {/* Assigned Users Avatar Stack */}
                                      {prj.userAssignment && prj.userAssignment.length > 0 ? (
                                        <AvatarGroup size="2xs" max={3} spacing="-0.75rem">
                                          {prj.userAssignment.map((assign, idx) => (
                                            <Tooltip
                                              key={assign.id || idx}
                                              label={`${assign.userData?.nama || "User"} (${assign.userData?.teamRole?.specName || "Team Member"})`}
                                              fontSize="3xs"
                                              rounded="md"
                                            >
                                              <Avatar
                                                name={assign.userData?.nama || "U"}
                                                bg="purple.500"
                                                color="white"
                                              />
                                            </Tooltip>
                                          ))}
                                        </AvatarGroup>
                                      ) : (
                                        <Text fontSize="3xs" color="gray.400" fontStyle="italic">
                                          No PIC assigned
                                        </Text>
                                      )}
                                    </Flex>

                                    <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                                    {/* Action Link to Project Detail */}
                                    <Flex justify="space-between" align="center">
                                      <Text fontSize="3xs" color="gray.400" noOfLines={1} maxW="60%">
                                        {prj.proManageByDivisionName || prj.proOwnerDivisionName || "IT Division"}
                                      </Text>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="purple"
                                        rightIcon={<FiExternalLink />}
                                        fontSize="3xs"
                                        onClick={() => router.push(`/project-development/detail?id=${prj.id}`)}
                                      >
                                        Project Details
                                      </Button>
                                    </Flex>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </SimpleGrid>
                        )}

                        {/* Standard Application ControlTable Pagination */}
                        {projectTotalCount > 0 && (
                          <Box pt={2}>
                            <ControlTable table={projectTableAdapter} />
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* ──────────────────────────────────────────────────────────
                        TAB 5: ASSESSMENT REPORT (CRITICALITY & COMPLIANCE)
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={5} align="stretch">
                        <Flex justify="space-between" align="center">
                          <HStack spacing={3}>
                            <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                              <Icon as={FiActivity} boxSize={4} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color={isDark ? "white" : "gray.800"}>Assessment Reports</Heading>
                              <Text fontSize="2xs" color="gray.500">{assessmentTotal} application criticality assessment reports</Text>
                            </VStack>
                          </HStack>

                          <Button
                            size="sm"
                            leftIcon={<FiRefreshCw />}
                            variant="outline"
                            rounded="full"
                            isLoading={assessmentLoading}
                            onClick={() => setAssessmentRefresh((p) => p + 1)}
                          >
                            Refresh
                          </Button>
                        </Flex>

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        {assessmentLoading ? (
                          <Flex justify="center" py={12}>
                            <Spinner size="lg" color="purple.500" />
                          </Flex>
                        ) : assessmentData.length === 0 ? (
                          <Box p={8} textAlign="center" rounded="xl" bg={isDark ? "gray.850" : "gray.50"} border="1px dashed" borderColor={isDark ? "gray.700" : "gray.300"}>
                            <Icon as={FiActivity} boxSize={10} color="gray.400" mb={3} />
                            <Heading size="xs" mb={1} color={isDark ? "white" : "gray.700"}>
                              No Assessment Reports Yet
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              This application does not have any batch criticality assessment review history yet.
                            </Text>
                          </Box>
                        ) : (
                          <VStack spacing={3} align="stretch">
                            {assessmentData.map((a) => (
                              <Box
                                key={a.id}
                                p={4}
                                bg={isDark ? "gray.850" : "gray.50"}
                                rounded="xl"
                                border="1px solid"
                                borderColor={isDark ? "gray.700" : "gray.200"}
                                _hover={{ shadow: "md", borderColor: "purple.400" }}
                                transition="all 0.2s"
                              >
                                <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={3}>
                                  <VStack align="start" spacing={1.5} flex={1}>
                                    <HStack spacing={2} wrap="wrap">
                                      <Badge colorScheme="purple" fontFamily="mono" fontSize="2xs" px={2} rounded="md">
                                        {a.batchCode}
                                      </Badge>
                                      <Badge colorScheme="blue" variant="outline" fontSize="2xs" px={2} rounded="md">
                                        {a.quartalReport} {a.yearReport}
                                      </Badge>
                                      <Badge
                                        colorScheme={
                                          a.statusReport === "APPROVED" ? "green" :
                                          a.statusReport === "DECLINE" ? "red" :
                                          a.statusReport?.includes("WAITING") ? "orange" : "gray"
                                        }
                                        fontSize="2xs"
                                        rounded="full"
                                      >
                                        {a.statusReport}
                                      </Badge>
                                      {a.isFullyReviewed ? (
                                        <Badge colorScheme="green" variant="subtle" fontSize="2xs" rounded="full">
                                          Reviewed ({a.filledCount}/{a.totalCount})
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="orange" variant="subtle" fontSize="2xs" rounded="full">
                                          Pending ({a.filledCount}/{a.totalCount})
                                        </Badge>
                                      )}
                                    </HStack>
                                    <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                      Batch {a.batchCode} • {a.quartalReport} {a.yearReport}
                                    </Text>
                                  </VStack>

                                  <Button
                                    size="xs"
                                    colorScheme="purple"
                                    variant="outline"
                                    rounded="full"
                                    onClick={() => router.push(`/report/apps-assessments/assessment?batchCode=${a.batchCode}&appId=${appId}`)}
                                  >
                                    View Details
                                  </Button>
                                </Flex>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* ──────────────────────────────────────────────────────────
                        TAB 6: APPLICATION ENVIRONMENT
                        ────────────────────────────────────────────────────────── */}
                    <TabPanel p={{ base: 4, md: 6 }}>
                      <VStack spacing={6} align="stretch">
                        {/* Header & Controls */}
                        <Flex
                          justify="space-between"
                          align={{ base: "start", sm: "center" }}
                          direction={{ base: "column", sm: "row" }}
                          gap={3}
                        >
                          <HStack spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              bg="secondary.500"
                              rounded="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              shadow="sm"
                            >
                              <Icon as={FiServer} boxSize={5} />
                            </Box>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2}>
                                <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                  Application Environment & Server Topology
                                </Heading>
                                <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                  {serverEnvironments.length} Nodes
                                </Badge>
                              </HStack>
                              <Text fontSize="2xs" color="gray.500">
                                Server role configurations, site segments, DC1/DC2 primary flags, hardening posture & dual deploy architecture.
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={2} alignSelf={{ base: "flex-end", sm: "center" }}>
                            <Button
                              leftIcon={<FiPlus />}
                              colorScheme="purple"
                              size="sm"
                              rounded="xl"
                              px={4}
                              fontSize="xs"
                              fontWeight="bold"
                              onClick={() => handleNavigateCreateServer()}
                            >
                              Tambah Server Node
                            </Button>
                            {IsEditMode ? (
                              <>
                                <Button
                                  leftIcon={<FiX />}
                                  size="sm"
                                  variant="ghost"
                                  rounded="xl"
                                  fontSize="xs"
                                  onClick={() => {
                                    setIsEditMode(false);
                                    LoadTopologyData();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  leftIcon={<FiSave />}
                                  colorScheme="secondary"
                                  size="sm"
                                  rounded="xl"
                                  px={4}
                                  fontSize="xs"
                                  fontWeight="bold"
                                  isLoading={IsLoadingProcess}
                                  onClick={handleSave}
                                >
                                  Save
                                </Button>
                              </>
                            ) : (
                              <Button
                                leftIcon={<FiEdit />}
                                size="sm"
                                colorScheme="secondary"
                                variant="outline"
                                rounded="xl"
                                px={4}
                                fontSize="xs"
                                fontWeight="bold"
                                onClick={() => setIsEditMode(true)}
                              >
                                Edit Environment
                              </Button>
                            )}
                          </HStack>
                        </Flex>

                        {/* Summary Stats Strip */}
                        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
                          <Box
                            p={3}
                            rounded="xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="3xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                  Total Servers
                                </Text>
                                {isTopologyLoading ? (
                                  <Skeleton height="20px" width="36px" rounded="md" mt={1} />
                                ) : (
                                  <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                                    {serverEnvironments.length}
                                  </Heading>
                                )}
                              </VStack>
                              <Box p={2} rounded="lg" bg={isDark ? "gray.750" : "gray.200"} color="gray.400">
                                <Icon as={FiServer} boxSize={4} />
                              </Box>
                            </HStack>
                          </Box>

                          <Box
                            p={3}
                            rounded="xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="3xs" fontWeight="bold" color="green.500" textTransform="uppercase">
                                  Status Aktif
                                </Text>
                                {isTopologyLoading ? (
                                  <Skeleton height="20px" width="36px" rounded="md" mt={1} />
                                ) : (
                                  <Heading size="sm" color="green.500">
                                    {serverEnvironments.filter((s) => s.status === "Aktif").length}
                                  </Heading>
                                )}
                              </VStack>
                              <Box p={2} rounded="lg" bg="green.50" color="green.600">
                                <Icon as={FiCheckCircle} boxSize={4} />
                              </Box>
                            </HStack>
                          </Box>

                          <Box
                            p={3}
                            rounded="xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="3xs" fontWeight="bold" color="blue.500" textTransform="uppercase">
                                  Primary DC1 Nodes
                                </Text>
                                {isTopologyLoading ? (
                                  <Skeleton height="20px" width="36px" rounded="md" mt={1} />
                                ) : (
                                  <Heading size="sm" color="blue.500">
                                    {serverEnvironments.filter((s) => s.primary === "DC1").length}
                                  </Heading>
                                )}
                              </VStack>
                              <Box p={2} rounded="lg" bg="blue.50" color="blue.600">
                                <Icon as={FiGlobe} boxSize={4} />
                              </Box>
                            </HStack>
                          </Box>

                          <Box
                            p={3}
                            rounded="xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="3xs" fontWeight="bold" color="purple.500" textTransform="uppercase">
                                  Primary DC2 Nodes
                                </Text>
                                {isTopologyLoading ? (
                                  <Skeleton height="20px" width="36px" rounded="md" mt={1} />
                                ) : (
                                  <Heading size="sm" color="purple.500">
                                    {serverEnvironments.filter((s) => s.primary === "DC2").length}
                                  </Heading>
                                )}
                              </VStack>
                              <Box p={2} rounded="lg" bg="purple.50" color="purple.600">
                                <Icon as={FiLayers} boxSize={4} />
                              </Box>
                            </HStack>
                          </Box>
                        </SimpleGrid>

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        {/* ══════════════════════════════════════════════════════════
                            1. SEGMENTED ENVIRONMENT CONTROL
                            ══════════════════════════════════════════════════════════ */}
                        <Box
                          p={2}
                          rounded="2xl"
                          bg={isDark ? "gray.850" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          shadow="xs"
                        >
                          <Flex
                            justify="space-between"
                            align={{ base: "stretch", md: "center" }}
                            direction={{ base: "column", md: "row" }}
                            gap={3}
                          >
                            <HStack spacing={2} wrap="wrap">
                              <Button
                                size="sm"
                                rounded="xl"
                                leftIcon={<Icon as={FiGlobe} color={activeEnvFilter === "PROD" ? "green.300" : "gray.400"} />}
                                variant={activeEnvFilter === "PROD" ? "solid" : "ghost"}
                                colorScheme={activeEnvFilter === "PROD" ? "green" : "gray"}
                                bg={activeEnvFilter === "PROD" ? (isDark ? "green.700" : "green.500") : "transparent"}
                                color={activeEnvFilter === "PROD" ? "white" : isDark ? "gray.300" : "gray.600"}
                                onClick={() => {
                                  setActiveEnvFilter("PROD");
                                  setLinkAksesEnv("Prod");
                                }}
                                fontWeight="bold"
                                fontSize="xs"
                                px={3.5}
                              >
                                Production
                                <Badge
                                  ml={2}
                                  rounded="full"
                                  px={2}
                                  fontSize="3xs"
                                  colorScheme={activeEnvFilter === "PROD" ? "blackAlpha" : "green"}
                                >
                                  {prodServers.length}
                                </Badge>
                              </Button>

                              <Button
                                size="sm"
                                rounded="xl"
                                leftIcon={<Icon as={FiActivity} color={activeEnvFilter === "DEV" ? "blue.300" : "gray.400"} />}
                                variant={activeEnvFilter === "DEV" ? "solid" : "ghost"}
                                colorScheme={activeEnvFilter === "DEV" ? "blue" : "gray"}
                                bg={activeEnvFilter === "DEV" ? (isDark ? "blue.700" : "blue.500") : "transparent"}
                                color={activeEnvFilter === "DEV" ? "white" : isDark ? "gray.300" : "gray.600"}
                                onClick={() => {
                                  setActiveEnvFilter("DEV");
                                  setLinkAksesEnv("Dev");
                                }}
                                fontWeight="bold"
                                fontSize="xs"
                                px={3.5}
                              >
                                Development & UAT
                                <Badge
                                  ml={2}
                                  rounded="full"
                                  px={2}
                                  fontSize="3xs"
                                  colorScheme={activeEnvFilter === "DEV" ? "blackAlpha" : "blue"}
                                >
                                  {devServers.length}
                                </Badge>
                              </Button>

                              {drcServers.length > 0 && (
                                <Button
                                  size="sm"
                                  rounded="xl"
                                  leftIcon={<Icon as={FiLayers} color={activeEnvFilter === "DRC" ? "purple.300" : "gray.400"} />}
                                  variant={activeEnvFilter === "DRC" ? "solid" : "ghost"}
                                  colorScheme={activeEnvFilter === "DRC" ? "purple" : "gray"}
                                  bg={activeEnvFilter === "DRC" ? (isDark ? "purple.700" : "purple.500") : "transparent"}
                                  color={activeEnvFilter === "DRC" ? "white" : isDark ? "gray.300" : "gray.600"}
                                  onClick={() => setActiveEnvFilter("DRC")}
                                  fontWeight="bold"
                                  fontSize="xs"
                                  px={3.5}
                                >
                                  DRC / Staging
                                  <Badge
                                    ml={2}
                                    rounded="full"
                                    px={2}
                                    fontSize="3xs"
                                    colorScheme={activeEnvFilter === "DRC" ? "blackAlpha" : "purple"}
                                  >
                                    {drcServers.length}
                                  </Badge>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                rounded="xl"
                                leftIcon={<Icon as={FiServer} color={activeEnvFilter === "ALL" ? "purple.300" : "gray.400"} />}
                                variant={activeEnvFilter === "ALL" ? "solid" : "ghost"}
                                colorScheme={activeEnvFilter === "ALL" ? "purple" : "gray"}
                                bg={activeEnvFilter === "ALL" ? (isDark ? "purple.700" : "purple.500") : "transparent"}
                                color={activeEnvFilter === "ALL" ? "white" : isDark ? "gray.300" : "gray.600"}
                                onClick={() => setActiveEnvFilter("ALL")}
                                fontWeight="bold"
                                fontSize="xs"
                                px={3.5}
                              >
                                Semua Environment
                                <Badge
                                  ml={2}
                                  rounded="full"
                                  px={2}
                                  fontSize="3xs"
                                  colorScheme={activeEnvFilter === "ALL" ? "blackAlpha" : "gray"}
                                >
                                  {serverEnvironments.length}
                                </Badge>
                              </Button>
                            </HStack>

                            <HStack spacing={2}>
                              <Button
                                leftIcon={<FiPlus />}
                                colorScheme="purple"
                                size="sm"
                                rounded="xl"
                                px={4}
                                fontSize="xs"
                                fontWeight="bold"
                                onClick={() => handleNavigateCreateServer()}
                              >
                                Tambah Server Node
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>

                        {/* ══════════════════════════════════════════════════════════
                            2. DIVIDED ENVIRONMENT CARDS: PROD / DEV / DRC
                            ══════════════════════════════════════════════════════════ */}
                        {/* A. PRODUCTION ENVIRONMENT CARD */}
                        {(activeEnvFilter === "PROD" || activeEnvFilter === "ALL") && (
                          <Box
                            p={{ base: 4, md: 5 }}
                            rounded="2xl"
                            border="1px solid"
                            borderColor={isDark ? "green.800" : "green.200"}
                            bg={isDark ? "gray.850" : "white"}
                            shadow="sm"
                          >
                            <Flex
                              justify="space-between"
                              align={{ base: "start", sm: "center" }}
                              direction={{ base: "column", sm: "row" }}
                              gap={3}
                              mb={4}
                              pb={3}
                              borderBottom="1px dashed"
                              borderColor={isDark ? "gray.700" : "green.200"}
                            >
                              <HStack spacing={3}>
                                <Box
                                  p={2.5}
                                  rounded="xl"
                                  bg={isDark ? "green.900" : "green.50"}
                                  color="green.500"
                                >
                                  <Icon as={FiGlobe} boxSize={5} />
                                </Box>
                                <VStack align="start" spacing={0.5}>
                                  <HStack spacing={2}>
                                    <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                      Production Environment
                                    </Heading>
                                    <Badge colorScheme="green" fontSize="3xs" rounded="md" px={2} fontWeight="bold">
                                      LIVE PRODUCTION
                                    </Badge>
                                    <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                      {prodServers.length} Nodes
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="2xs" color="gray.500">
                                    Infrastruktur live production, arsitektur High Availability & DNS Domain resmi.
                                  </Text>
                                </VStack>
                              </HStack>

                              <Button
                                leftIcon={<FiPlus />}
                                size="xs"
                                colorScheme="green"
                                variant="outline"
                                rounded="lg"
                                fontWeight="bold"
                                onClick={() => handleNavigateCreateServer("Production")}
                              >
                                Tambah Server Production
                              </Button>
                            </Flex>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                                  URL Link Akses Production
                                </FormLabel>
                                {IsEditMode ? (
                                  <Input
                                    size="sm"
                                    rounded="lg"
                                    placeholder="https://apps.bankbki.co.id"
                                    value={linkAksesProdUrl}
                                    onChange={(e) => setLinkAksesProdUrl(e.target.value)}
                                  />
                                ) : (
                                  <HStack
                                    p={2.5}
                                    rounded="lg"
                                    bg={isDark ? "gray.800" : "green.50"}
                                    border="1px solid"
                                    borderColor={isDark ? "gray.700" : "green.200"}
                                    justify="space-between"
                                  >
                                    <HStack spacing={2} minW={0}>
                                      <Icon as={FiGlobe} color="green.500" />
                                      <Text fontSize="xs" fontWeight="bold" color="green.600" noOfLines={1}>
                                        {linkAksesProdUrl ||
                                          `https://${DataApplication?.appShortName?.toLowerCase() || "app"}.bankbki.co.id`}
                                      </Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <IconButton
                                        aria-label="Salin URL"
                                        icon={<FiCopy />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="green"
                                        onClick={() => {
                                          const url =
                                            linkAksesProdUrl ||
                                            `https://${DataApplication?.appShortName?.toLowerCase() || "app"}.bankbki.co.id`;
                                          navigator.clipboard.writeText(url);
                                          showToast({
                                            description: "URL Production berhasil disalin",
                                            statusToast: "info",
                                          });
                                        }}
                                      />
                                      <IconButton
                                        aria-label="Buka URL Akses"
                                        icon={<FiExternalLink />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="green"
                                        onClick={() => {
                                          const target =
                                            linkAksesProdUrl ||
                                            `https://${DataApplication?.appShortName?.toLowerCase() || "app"}.bankbki.co.id`;
                                          window.open(target.startsWith("http") ? target : `https://${target}`, "_blank");
                                        }}
                                      />
                                    </HStack>
                                  </HStack>
                                )}
                              </FormControl>

                              <Box
                                p={2.5}
                                rounded="lg"
                                bg={isDark ? "gray.800" : "gray.50"}
                                border="1px solid"
                                borderColor={isDark ? "gray.700" : "gray.200"}
                              >
                                <Text fontSize="3xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1.5}>
                                  Metrik Node Production
                                </Text>
                                <HStack spacing={3} wrap="wrap">
                                  <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    DC1 Primary: {prodServers.filter((s) => s.primary === "DC1").length}
                                  </Badge>
                                  <Badge colorScheme="purple" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    DC2 Primary: {prodServers.filter((s) => s.primary === "DC2").length}
                                  </Badge>
                                  <Badge colorScheme="green" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    Aktif: {prodServers.filter((s) => s.status === "Aktif").length}
                                  </Badge>
                                </HStack>
                              </Box>
                            </SimpleGrid>
                          </Box>
                        )}

                        {/* B. DEVELOPMENT & UAT ENVIRONMENT CARD */}
                        {(activeEnvFilter === "DEV" || activeEnvFilter === "ALL") && (
                          <Box
                            p={{ base: 4, md: 5 }}
                            rounded="2xl"
                            border="1px solid"
                            borderColor={isDark ? "blue.800" : "blue.200"}
                            bg={isDark ? "gray.850" : "white"}
                            shadow="sm"
                          >
                            <Flex
                              justify="space-between"
                              align={{ base: "start", sm: "center" }}
                              direction={{ base: "column", sm: "row" }}
                              gap={3}
                              mb={4}
                              pb={3}
                              borderBottom="1px dashed"
                              borderColor={isDark ? "gray.700" : "blue.200"}
                            >
                              <HStack spacing={3}>
                                <Box
                                  p={2.5}
                                  rounded="xl"
                                  bg={isDark ? "blue.900" : "blue.50"}
                                  color="blue.500"
                                >
                                  <Icon as={FiActivity} boxSize={5} />
                                </Box>
                                <VStack align="start" spacing={0.5}>
                                  <HStack spacing={2}>
                                    <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                      Development & UAT Environment
                                    </Heading>
                                    <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={2} fontWeight="bold">
                                      DEV / UAT / TESTING
                                    </Badge>
                                    <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                      {devServers.length} Nodes
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="2xs" color="gray.500">
                                    Lingkungan staging, user acceptance test, integrasi API & konfigurasi kredensial uji.
                                  </Text>
                                </VStack>
                              </HStack>

                              <Button
                                leftIcon={<FiPlus />}
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                rounded="lg"
                                fontWeight="bold"
                                onClick={() => handleNavigateCreateServer("Development")}
                              >
                                Tambah Server Development
                              </Button>
                            </Flex>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                                  URL Link Akses Development
                                </FormLabel>
                                {IsEditMode ? (
                                  <Input
                                    size="sm"
                                    rounded="lg"
                                    placeholder="https://apps-dev.bankbki.co.id"
                                    value={linkAksesDevUrl}
                                    onChange={(e) => setLinkAksesDevUrl(e.target.value)}
                                  />
                                ) : (
                                  <HStack
                                    p={2.5}
                                    rounded="lg"
                                    bg={isDark ? "gray.800" : "blue.50"}
                                    border="1px solid"
                                    borderColor={isDark ? "gray.700" : "blue.200"}
                                    justify="space-between"
                                  >
                                    <HStack spacing={2} minW={0}>
                                      <Icon as={FiGlobe} color="blue.500" />
                                      <Text fontSize="xs" fontWeight="bold" color="blue.600" noOfLines={1}>
                                        {linkAksesDevUrl ||
                                          `https://${DataApplication?.appShortName?.toLowerCase() || "app"}-dev.bankbki.co.id`}
                                      </Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <IconButton
                                        aria-label="Salin URL"
                                        icon={<FiCopy />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="blue"
                                        onClick={() => {
                                          const url =
                                            linkAksesDevUrl ||
                                            `https://${DataApplication?.appShortName?.toLowerCase() || "app"}-dev.bankbki.co.id`;
                                          navigator.clipboard.writeText(url);
                                          showToast({
                                            description: "URL Development berhasil disalin",
                                            statusToast: "info",
                                          });
                                        }}
                                      />
                                      <IconButton
                                        aria-label="Buka URL Akses"
                                        icon={<FiExternalLink />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="blue"
                                        onClick={() => {
                                          const target =
                                            linkAksesDevUrl ||
                                            `https://${DataApplication?.appShortName?.toLowerCase() || "app"}-dev.bankbki.co.id`;
                                          window.open(target.startsWith("http") ? target : `https://${target}`, "_blank");
                                        }}
                                      />
                                    </HStack>
                                  </HStack>
                                )}
                              </FormControl>

                              <Box
                                p={2.5}
                                rounded="lg"
                                bg={isDark ? "gray.800" : "gray.50"}
                                border="1px solid"
                                borderColor={isDark ? "gray.700" : "gray.200"}
                              >
                                <Text fontSize="3xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1.5}>
                                  Status Pengujian
                                </Text>
                                <HStack spacing={3} wrap="wrap">
                                  <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    Total Nodes: {devServers.length}
                                  </Badge>
                                  <Badge colorScheme="teal" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    Parameter Uji: {testingParameters.length} Parameter
                                  </Badge>
                                  <Badge colorScheme="green" fontSize="3xs" rounded="md" px={2} py={0.5}>
                                    Aktif: {devServers.filter((s) => s.status === "Aktif").length}
                                  </Badge>
                                </HStack>
                              </Box>
                            </SimpleGrid>

                            {/* Testing Parameters Sub-section */}
                            <Box
                              p={4}
                              rounded="xl"
                              bg={isDark ? "gray.800" : "white"}
                              border="1px dashed"
                              borderColor={isDark ? "gray.700" : "blue.300"}
                            >
                              <Flex justify="space-between" align="center" mb={3}>
                                <HStack spacing={2} color="blue.500">
                                  <Icon as={FiCheckCircle} boxSize={4} />
                                  <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                                    Parameter Pengujian (Environment Development)
                                  </Text>
                                  <Badge colorScheme="blue" variant="subtle" fontSize="3xs" rounded="full" px={2}>
                                    {testingParameters.length}
                                  </Badge>
                                </HStack>
                                {IsEditMode && (
                                  <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="solid"
                                    leftIcon={<FiPlus />}
                                    rounded="lg"
                                    onClick={handleAddTestingParameter}
                                  >
                                    Tambah Parameter
                                  </Button>
                                )}
                              </Flex>

                              {IsEditMode ? (
                                <VStack spacing={3} align="stretch">
                                  {testingParameters.length === 0 ? (
                                    <Box
                                      p={4}
                                      textAlign="center"
                                      rounded="lg"
                                      bg={isDark ? "gray.850" : "gray.50"}
                                      border="1px dashed"
                                      borderColor={isDark ? "gray.700" : "gray.300"}
                                    >
                                      <Text fontSize="xs" color="gray.500" mb={2}>
                                        Belum ada parameter pengujian yang ditambahkan.
                                      </Text>
                                      <Button
                                        size="xs"
                                        colorScheme="blue"
                                        leftIcon={<FiPlus />}
                                        onClick={handleAddTestingParameter}
                                      >
                                        Tambah Parameter Pertama
                                      </Button>
                                    </Box>
                                  ) : (
                                    testingParameters.map((param, index) => (
                                      <HStack
                                        key={param.id || `param-item-${index}`}
                                        p={3}
                                        rounded="lg"
                                        bg={isDark ? "gray.850" : "gray.50"}
                                        border="1px solid"
                                        borderColor={isDark ? "gray.700" : "gray.200"}
                                        spacing={3}
                                        align="flex-start"
                                      >
                                        <FormControl flex={{ base: "1", md: "1.2" }}>
                                          <FormLabel fontSize="3xs" fontWeight="bold" color="gray.500" mb={1}>
                                            Nama Parameter
                                          </FormLabel>
                                          <Input
                                            size="sm"
                                            rounded="md"
                                            placeholder="misal: Test User, CIF, API Key"
                                            value={param.paramLabel}
                                            onChange={(e) =>
                                              handleUpdateTestingParameter(index, "paramLabel", e.target.value)
                                            }
                                          />
                                        </FormControl>

                                        <FormControl w={{ base: "90px", md: "110px" }}>
                                          <FormLabel fontSize="3xs" fontWeight="bold" color="gray.500" mb={1}>
                                            Tipe
                                          </FormLabel>
                                          <ChakraSelect
                                            size="sm"
                                            rounded="md"
                                            value={param.fieldType}
                                            onChange={(e) =>
                                              handleUpdateTestingParameter(
                                                index,
                                                "fieldType",
                                                e.target.value as "text" | "password" | "textarea"
                                              )
                                            }
                                          >
                                            <option value="text">Text</option>
                                            <option value="password">Password</option>
                                            <option value="textarea">Textarea</option>
                                          </ChakraSelect>
                                        </FormControl>

                                        <FormControl flex={{ base: "1.5", md: "2" }}>
                                          <FormLabel fontSize="3xs" fontWeight="bold" color="gray.500" mb={1}>
                                            Nilai Parameter
                                          </FormLabel>
                                          {param.fieldType === "textarea" ? (
                                            <Textarea
                                              size="sm"
                                              rounded="md"
                                              rows={2}
                                              placeholder="Nilai parameter"
                                              value={param.paramValue || ""}
                                              onChange={(e) =>
                                                handleUpdateTestingParameter(index, "paramValue", e.target.value)
                                              }
                                            />
                                          ) : (
                                            <Input
                                              size="sm"
                                              rounded="md"
                                              type={param.fieldType === "password" ? "password" : "text"}
                                              placeholder="Nilai parameter"
                                              value={param.paramValue || ""}
                                              onChange={(e) =>
                                                handleUpdateTestingParameter(index, "paramValue", e.target.value)
                                              }
                                            />
                                          )}
                                        </FormControl>

                                        <Box pt={6}>
                                          <IconButton
                                            aria-label="Hapus Parameter"
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => handleDeleteTestingParameter(index)}
                                          />
                                        </Box>
                                      </HStack>
                                    ))
                                  )}
                                </VStack>
                              ) : (
                                <>
                                  {isAccessLoading ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                      <Skeleton height="54px" rounded="lg" />
                                      <Skeleton height="54px" rounded="lg" />
                                    </SimpleGrid>
                                  ) : testingParameters.length === 0 ? (
                                    <Box
                                      p={3}
                                      rounded="lg"
                                      bg={isDark ? "gray.850" : "gray.50"}
                                      border="1px dashed"
                                      borderColor={isDark ? "gray.700" : "gray.200"}
                                      textAlign="center"
                                    >
                                      <Text fontSize="xs" color="gray.500">
                                        Belum ada parameter pengujian yang dikonfigurasi untuk environment Development.
                                      </Text>
                                    </Box>
                                  ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                      {testingParameters.map((param, index) => {
                                        const paramId = param.id || `param-${index}`;
                                        const isRevealed = maskedVisibility[paramId] || false;
                                        const isSecret = param.fieldType === "password";
                                        const displayVal =
                                          isSecret && !isRevealed
                                            ? "••••••••"
                                            : param.paramValue || "-";

                                        return (
                                          <Box
                                            key={paramId}
                                            p={2.5}
                                            rounded="lg"
                                            bg={isDark ? "gray.750" : "white"}
                                            border="1px solid"
                                            borderColor={isDark ? "gray.700" : "gray.200"}
                                          >
                                            <Flex justify="space-between" align="center" mb={1}>
                                              <Text
                                                fontSize="3xs"
                                                fontWeight="bold"
                                                color="gray.500"
                                                textTransform="uppercase"
                                                noOfLines={1}
                                              >
                                                {param.paramLabel}
                                              </Text>
                                              <HStack spacing={1}>
                                                {isSecret && (
                                                  <IconButton
                                                    aria-label={isRevealed ? "Sembunyikan" : "Tampilkan"}
                                                    icon={isRevealed ? <FiEyeOff /> : <FiEye />}
                                                    size="xs"
                                                    variant="ghost"
                                                    colorScheme="gray"
                                                    onClick={() => toggleMaskVisibility(paramId)}
                                                  />
                                                )}
                                                {param.paramValue && (
                                                  <IconButton
                                                    aria-label="Salin nilai"
                                                    icon={<FiCopy />}
                                                    size="xs"
                                                    variant="ghost"
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                      navigator.clipboard.writeText(param.paramValue || "");
                                                      showToast({
                                                        description: `${param.paramLabel} berhasil disalin`,
                                                        statusToast: "info",
                                                      });
                                                    }}
                                                  />
                                                )}
                                              </HStack>
                                            </Flex>
                                            <Text
                                              fontSize="xs"
                                              fontFamily="mono"
                                              fontWeight="medium"
                                              color={isDark ? "white" : "gray.800"}
                                              noOfLines={param.fieldType === "textarea" ? 3 : 1}
                                              wordBreak="break-all"
                                            >
                                              {displayVal}
                                            </Text>
                                          </Box>
                                        );
                                      })}
                                    </SimpleGrid>
                                  )}
                                </>
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* C. DRC / STAGING ENVIRONMENT CARD (WHEN ACTIVE OR HAS NODES) */}
                        {activeEnvFilter === "DRC" && (
                          <Box
                            p={{ base: 4, md: 5 }}
                            rounded="2xl"
                            border="1px solid"
                            borderColor={isDark ? "purple.800" : "purple.200"}
                            bg={isDark ? "gray.850" : "white"}
                            shadow="sm"
                          >
                            <Flex
                              justify="space-between"
                              align={{ base: "start", sm: "center" }}
                              direction={{ base: "column", sm: "row" }}
                              gap={3}
                            >
                              <HStack spacing={3}>
                                <Box
                                  p={2.5}
                                  rounded="xl"
                                  bg={isDark ? "purple.900" : "purple.50"}
                                  color="purple.500"
                                >
                                  <Icon as={FiLayers} boxSize={5} />
                                </Box>
                                <VStack align="start" spacing={0.5}>
                                  <HStack spacing={2}>
                                    <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                      Disaster Recovery (DRC) Environment
                                    </Heading>
                                    <Badge colorScheme="purple" fontSize="3xs" rounded="md" px={2} fontWeight="bold">
                                      DRC / SECONDARY
                                    </Badge>
                                    <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                      {drcServers.length} Nodes
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="2xs" color="gray.500">
                                    Node failover dan mitigasi bencana kontinuitas operasional perbankan.
                                  </Text>
                                </VStack>
                              </HStack>

                              <Button
                                leftIcon={<FiPlus />}
                                size="xs"
                                colorScheme="purple"
                                variant="outline"
                                rounded="lg"
                                fontWeight="bold"
                                onClick={() => handleNavigateCreateServer("DRC")}
                              >
                                Tambah Server DRC
                              </Button>
                            </Flex>
                          </Box>
                        )}

                        {/* ══════════════════════════════════════════════════════════
                            2. CONTAINERED SECTION: DAFTAR SERVER NODES & VM
                            ══════════════════════════════════════════════════════════ */}
                        <Box
                          p={{ base: 4, md: 5 }}
                          rounded="xl"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                          shadow="sm"
                        >
                          <Flex
                            justify="space-between"
                            align={{ base: "start", sm: "center" }}
                            direction={{ base: "column", sm: "row" }}
                            gap={3}
                            mb={4}
                            pb={3}
                            borderBottom="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                rounded="lg"
                                bg="purple.50"
                                color="purple.600"
                              >
                                <Icon as={FiServer} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0.5}>
                                <HStack spacing={2}>
                                  <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                    Daftar Server Node & Virtual Machine ({activeEnvFilter === "PROD" ? "Production" : activeEnvFilter === "DEV" ? "Development & UAT" : activeEnvFilter === "DRC" ? "DRC" : "Semua Environment"})
                                  </Heading>
                                  <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                    {displayedServers.length} Nodes
                                  </Badge>
                                </HStack>
                                <Text fontSize="2xs" color="gray.500">
                                  Konfigurasi server role, site segment, DC1/DC2 primary flag, hardening, PAM, dual deploy & spesifikasi VM.
                                </Text>
                              </VStack>
                            </HStack>

                            <Button
                              leftIcon={<FiPlus />}
                              size="sm"
                              colorScheme="purple"
                              variant={IsEditMode ? "solid" : "outline"}
                              rounded="xl"
                              px={3.5}
                              fontSize="xs"
                              fontWeight="bold"
                              onClick={() => handleNavigateCreateServer()}
                            >
                              Tambah Server Node
                            </Button>
                          </Flex>

                          {/* Accordion List */}
                        {displayedServers.length === 0 ? (
                          <Box
                            p={8}
                            textAlign="center"
                            rounded="xl"
                            bg={isDark ? "gray.850" : "gray.50"}
                            border="1.5px dashed"
                            borderColor={isDark ? "gray.700" : "gray.300"}
                          >
                            <Icon as={FiServer} boxSize={10} color="gray.400" mb={3} />
                            <Heading size="xs" mb={1} color={isDark ? "white" : "gray.700"}>
                              Belum Ada Server di Environment {activeEnvFilter === "PROD" ? "Production" : activeEnvFilter === "DEV" ? "Development & UAT" : activeEnvFilter === "DRC" ? "DRC / Staging" : "ini"}
                            </Heading>
                            <Text fontSize="xs" color="gray.500" mb={4}>
                              Aplikasi ini belum memiliki node server yang dikonfigurasi untuk lingkungan {activeEnvFilter === "PROD" ? "Production" : activeEnvFilter === "DEV" ? "Development & UAT" : activeEnvFilter === "DRC" ? "DRC / Staging" : "ini"}.
                            </Text>
                            <Button
                              leftIcon={<FiPlus />}
                              size="sm"
                              colorScheme="purple"
                              rounded="xl"
                              onClick={() => handleNavigateCreateServer()}
                            >
                              Tambah Server Node
                            </Button>
                          </Box>
                        ) : (
                          <Accordion allowMultiple defaultIndex={[0]} w="full">
                            {displayedServers.map((srv, srvIdx) => {
                              const targetIdx = serverEnvironments.findIndex((item, i) =>
                                item.id && srv.id ? item.id === srv.id : i === srvIdx
                              );
                              const index = targetIdx >= 0 ? targetIdx : srvIdx;
                              const isDc1 = srv.primary === "DC1";
                              const isDc2 = srv.primary === "DC2";
                              const displayRoleServer =
                                srv.roleServer === "Other" && srv.roleServerOther?.trim()
                                  ? srv.roleServerOther.trim()
                                  : srv.roleServer;
                              const isCustomRole =
                                srv.roleServer === "Other" ||
                                !STANDARD_ROLE_SERVERS.includes(srv.roleServer as any);
                              const displaySite =
                                (srv.site === "Other Site" || srv.site === "Other") && srv.siteOther?.trim()
                                  ? srv.siteOther.trim()
                                  : srv.site;
                              const displayEnvironment =
                                srv.environment === "Other" && srv.environmentOther?.trim()
                                  ? srv.environmentOther.trim()
                                  : srv.environment;

                              return (
                                <AccordionItem
                                  key={srv.id || index}
                                  mb={4}
                                  rounded="xl"
                                  border="1px solid"
                                  borderColor={isDark ? "gray.700" : "gray.200"}
                                  overflow="hidden"
                                  bg={isDark ? "gray.850" : "white"}
                                  shadow="sm"
                                  _hover={{ shadow: "md", borderColor: isDark ? "gray.600" : "gray.300" }}
                                  transition="all 0.2s ease"
                                >
                                  {/* ══════════════════════════════════════════
                                      PARENT ACCORDION (Opener in Grey)
                                      ══════════════════════════════════════════ */}
                                  {IsEditMode ? (
                                    /* Edit Mode: Parent fields as inputs */
                                    <Box
                                      p={4}
                                      bg={isDark ? "gray.800" : "gray.50"}
                                      borderBottom="1px solid"
                                      borderColor={isDark ? "gray.700" : "gray.200"}
                                    >
                                      <Flex justify="space-between" align="center" mb={3}>
                                        <HStack spacing={2}>
                                          <Box p={1.5} rounded="md" bg="secondary.500" color="white">
                                            <Icon as={FiServer} boxSize={3.5} />
                                          </Box>
                                          <Text fontSize="xs" fontWeight="bold">
                                            Server Node #{index + 1}
                                          </Text>
                                          <Badge
                                            colorScheme={isDc1 ? "blue" : isDc2 ? "purple" : "gray"}
                                            fontSize="3xs"
                                            rounded="full"
                                            px={2}
                                          >
                                            Primary: {srv.primary}
                                          </Badge>
                                        </HStack>
                                        <HStack spacing={2}>
                                          <IconButton
                                            size="xs"
                                            colorScheme="red"
                                            variant="ghost"
                                            aria-label="Delete Server"
                                            icon={<FiTrash2 />}
                                            onClick={() => handleDeleteServer(index)}
                                          />
                                        </HStack>
                                      </Flex>

                                      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                                        {/* Role Server */}
                                        <FormControl isRequired>
                                          <FormLabel fontSize="2xs" fontWeight="bold">Role Server</FormLabel>
                                          <ChakraSelect
                                            size="sm"
                                            rounded="lg"
                                            value={
                                              STANDARD_ROLE_SERVERS.includes(srv.roleServer as any)
                                                ? srv.roleServer
                                                : "Other"
                                            }
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              handleUpdateServer(index, "roleServer", val);
                                              if (val !== "Other") {
                                                handleUpdateServer(index, "roleServerOther", "");
                                              }
                                            }}
                                          >
                                            {SERVER_ROLE_OPTIONS.map((role) => (
                                              <option key={role} value={role}>
                                                {role}
                                              </option>
                                            ))}
                                          </ChakraSelect>
                                          {(srv.roleServer === "Other" ||
                                            !STANDARD_ROLE_SERVERS.includes(srv.roleServer as any)) && (
                                            <Input
                                              mt={1.5}
                                              size="sm"
                                              rounded="lg"
                                              placeholder="Role Server"
                                              value={
                                                srv.roleServerOther ||
                                                (srv.roleServer !== "Other" ? srv.roleServer : "")
                                              }
                                              onChange={(e) =>
                                                handleUpdateServer(index, "roleServerOther", e.target.value)
                                              }
                                            />
                                          )}
                                        </FormControl>

                                        {/* Role Detail */}
                                        <FormControl isRequired>
                                          <FormLabel fontSize="2xs" fontWeight="bold">Role Detail</FormLabel>
                                          <Input
                                            size="sm"
                                            rounded="lg"
                                            value={srv.roleDetail}
                                            onChange={(e) => handleUpdateServer(index, "roleDetail", e.target.value)}
                                            placeholder="Role Detail"
                                          />
                                        </FormControl>

                                        {/* Status */}
                                        <FormControl isRequired>
                                          <FormLabel fontSize="2xs" fontWeight="bold">Status</FormLabel>
                                          <ChakraSelect
                                            size="sm"
                                            rounded="lg"
                                            value={srv.status}
                                            onChange={(e) =>
                                              handleUpdateServer(index, "status", e.target.value as "Aktif" | "Pasif")
                                            }
                                          >
                                            {SERVER_STATUS_OPTIONS.map((st) => (
                                              <option key={st} value={st}>
                                                {st}
                                              </option>
                                            ))}
                                          </ChakraSelect>
                                        </FormControl>

                                        {/* IP Address & Primary */}
                                        <FormControl isRequired>
                                          <HStack justify="space-between" mb={1}>
                                            <FormLabel fontSize="2xs" fontWeight="bold" mb={0}>
                                              IP Address
                                            </FormLabel>
                                            <Tooltip
                                              label="Primary flag DC1 / DC2 auto-detected: 3rd octet starts with 1 -> DC1, starts with 2 -> DC2"
                                              placement="top"
                                              hasArrow
                                            >
                                              <Badge
                                                colorScheme={isDc1 ? "blue" : isDc2 ? "purple" : "gray"}
                                                fontSize="3xs"
                                                rounded="md"
                                                cursor="help"
                                              >
                                                Flag: {srv.primary}
                                              </Badge>
                                            </Tooltip>
                                          </HStack>
                                          <Input
                                            size="sm"
                                            rounded="lg"
                                            fontFamily="mono"
                                            value={srv.ipAddress}
                                            onChange={(e) => handleUpdateServer(index, "ipAddress", e.target.value)}
                                            placeholder="IP Address"
                                          />
                                          <HStack justify="space-between" mt={1}>
                                            <Text fontSize="3xs" color="gray.500">
                                              Primary Override:
                                            </Text>
                                            <ChakraSelect
                                              size="xs"
                                              w="85px"
                                              rounded="md"
                                              value={srv.primary}
                                              onChange={(e) =>
                                                handleUpdateServer(
                                                  index,
                                                  "primary",
                                                  e.target.value as "DC1" | "DC2" | "-"
                                                )
                                              }
                                            >
                                              {SERVER_PRIMARY_DC_OPTIONS.map((dc) => (
                                                <option key={dc} value={dc}>
                                                  {dc}
                                                </option>
                                              ))}
                                            </ChakraSelect>
                                          </HStack>
                                        </FormControl>
                                      </SimpleGrid>

                                      <AccordionButton
                                        py={2}
                                        px={3}
                                        mt={3}
                                        rounded="lg"
                                        bg={isDark ? "gray.750" : "gray.100"}
                                        _hover={{ bg: isDark ? "gray.700" : "gray.200" }}
                                      >
                                        <HStack spacing={1.5} fontSize="3xs" color={isDark ? "gray.300" : "gray.600"} fontWeight="bold">
                                          <Icon as={FiLayers} color="gray.500" />
                                          <Text>Edit Child Parameters (Network, Governance, Dual Deploy & VM Specification)</Text>
                                        </HStack>
                                        <AccordionIcon ml="auto" color="gray.500" />
                                      </AccordionButton>
                                    </Box>
                                  ) : (
                                    /* View Mode: Parent fields as clean grey header */
                                    <AccordionButton
                                      py={3.5}
                                      px={{ base: 4, md: 5 }}
                                      bg={isDark ? "gray.800" : "gray.50"}
                                      _hover={{
                                        bg: isDark ? "gray.750" : "gray.100",
                                      }}
                                      _expanded={{
                                        bg: isDark ? "gray.750" : "gray.100",
                                        borderBottom: "1px solid",
                                        borderColor: isDark ? "gray.700" : "gray.200",
                                      }}
                                      transition="all 0.2s ease"
                                    >
                                      <Flex
                                        justify="space-between"
                                        align="center"
                                        w="full"
                                        wrap="wrap"
                                        gap={3}
                                        textAlign="left"
                                      >
                                        {/* Left: Role Server & Role Detail */}
                                        <HStack spacing={3} flex={1} minW="220px">
                                          <Box
                                            p={2}
                                            rounded="lg"
                                            bg={
                                              displayRoleServer.includes("Web")
                                                ? "blue.500"
                                                : displayRoleServer.includes("DB")
                                                ? "orange.500"
                                                : displayRoleServer.includes("App")
                                                ? "purple.500"
                                                : "secondary.500"
                                            }
                                            color="white"
                                            shadow="sm"
                                          >
                                            <Icon as={FiServer} boxSize={4} />
                                          </Box>
                                          <VStack align="start" spacing={0.5}>
                                            <HStack spacing={2} wrap="wrap">
                                              <Text fontSize="3xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                                SERVER #{srvIdx + 1} • {srv.environment || "Production"}
                                              </Text>
                                              <Text fontSize="sm" fontWeight="800" color={isDark ? "white" : "gray.800"}>
                                                {displayRoleServer}
                                              </Text>
                                              {isCustomRole && srv.roleServerOther?.trim() && (
                                                <Badge colorScheme="purple" variant="outline" fontSize="3xs" rounded="md">
                                                  Other Role
                                                </Badge>
                                              )}
                                              <Badge
                                                colorScheme={srv.status === "Aktif" ? "green" : "gray"}
                                                variant="solid"
                                                fontSize="3xs"
                                                rounded="full"
                                                px={2}
                                              >
                                                {srv.status}
                                              </Badge>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                              {srv.roleDetail || "No role detail specified"}
                                            </Text>
                                          </VStack>
                                        </HStack>

                                        {/* Right: IP, Primary (DC1/DC2), Dual Deploy & Expand Icon */}
                                        <HStack spacing={2.5}>
                                          {/* IP Address */}
                                          {srv.ipAddress && (
                                            <Badge
                                              variant="subtle"
                                              colorScheme="blue"
                                              fontFamily="mono"
                                              fontSize="2xs"
                                              px={2}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              {srv.ipAddress}
                                            </Badge>
                                          )}

                                          {/* Dual Deploy quick tag */}
                                          {srv.dualDeploy === "Ya" && (
                                            <Badge
                                              colorScheme="teal"
                                              variant="subtle"
                                              fontSize="3xs"
                                              px={1.5}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              Dual Deploy
                                            </Badge>
                                          )}

                                          {/* Primary DC1/DC2 Flag */}
                                          <Tooltip
                                            label={`Primary Site: ${srv.primary} (flagged from IP ${srv.ipAddress || "-"})`}
                                            placement="top"
                                            hasArrow
                                          >
                                            <Badge
                                              colorScheme={isDc1 ? "blue" : isDc2 ? "purple" : "gray"}
                                              variant="solid"
                                              fontSize="2xs"
                                              fontWeight="extrabold"
                                              px={2.5}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              {srv.primary}
                                            </Badge>
                                          </Tooltip>

                                          <AccordionIcon color="gray.500" boxSize={5} />
                                        </HStack>
                                      </Flex>
                                    </AccordionButton>
                                  )}

                                  {/* ══════════════════════════════════════════
                                      CHILD ACCORDION (Styled like Network, DNS & Access Environment)
                                      ══════════════════════════════════════════ */}
                                  <AccordionPanel p={{ base: 4, md: 5 }} bg={isDark ? "gray.850" : "gray.50"}>
                                    <VStack spacing={4} align="stretch">
                                      {/* Section Header */}
                                      <HStack spacing={2} color="secondary.500">
                                        <Icon as={FiServer} boxSize={5} />
                                        <Heading size="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                          Server Environment & Infrastructure Details
                                        </Heading>
                                      </HStack>

                                      {/* Side-by-side Two Cards Layout */}
                                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                                        {/* ──────────────────────────────────────────────────────────
                                            CARD 1: NETWORK, SECURITY & GOVERNANCE ENVIRONMENT
                                            ────────────────────────────────────────────────────────── */}
                                        <Box
                                          p={4}
                                          rounded="xl"
                                          bg={isDark ? "gray.800" : "white"}
                                          border="1px solid"
                                          borderColor={isDark ? "gray.700" : "gray.200"}
                                        >
                                          <HStack
                                            justify="space-between"
                                            mb={3}
                                            pb={2}
                                            borderBottom="1px solid"
                                            borderColor={isDark ? "gray.700" : "gray.100"}
                                          >
                                            <HStack spacing={2}>
                                              <Icon as={FiGlobe} color="blue.500" boxSize={4} />
                                              <Text fontSize="2xs" fontWeight="800" color="blue.500" textTransform="uppercase" letterSpacing="wider">
                                                Network & Governance Environment
                                              </Text>
                                            </HStack>
                                            <Badge
                                              colorScheme={
                                                displayEnvironment === "Production"
                                                  ? "green"
                                                  : displayEnvironment === "DRC"
                                                  ? "orange"
                                                  : displayEnvironment === "Staging"
                                                  ? "purple"
                                                  : displayEnvironment === "UAT" || displayEnvironment === "Development"
                                                  ? "blue"
                                                  : "teal"
                                              }
                                              fontSize="3xs"
                                              rounded="md"
                                              px={2}
                                              py={0.5}
                                            >
                                              {displayEnvironment || "Production"}
                                            </Badge>
                                          </HStack>

                                          {IsEditMode ? (
                                            /* Edit Mode: Network & Governance */
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Site</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.site}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleUpdateServer(index, "site", val);
                                                    if (val !== "Other Site" && val !== "Other") {
                                                      handleUpdateServer(index, "siteOther", "");
                                                    }
                                                  }}
                                                >
                                                  {SERVER_SITE_OPTIONS.map((site) => (
                                                    <option key={site} value={site}>
                                                      {site}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {(srv.site === "Other Site" || srv.site === "Other") && (
                                                  <Input
                                                    mt={1.5}
                                                    size="sm"
                                                    rounded="lg"
                                                    placeholder="Site"
                                                    value={srv.siteOther || ""}
                                                    onChange={(e) =>
                                                      handleUpdateServer(index, "siteOther", e.target.value)
                                                    }
                                                  />
                                                )}
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Segment</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.segment}
                                                  onChange={(e) => handleUpdateServer(index, "segment", e.target.value)}
                                                  placeholder="Segment"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Environment</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.environment}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleUpdateServer(index, "environment", val);
                                                    if (val !== "Other") {
                                                      handleUpdateServer(index, "environmentOther", "");
                                                    }
                                                  }}
                                                >
                                                  {SERVER_ENVIRONMENT_OPTIONS.map((env) => (
                                                    <option key={env} value={env}>
                                                      {env}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {srv.environment === "Other" && (
                                                  <Input
                                                    mt={1.5}
                                                    size="sm"
                                                    rounded="lg"
                                                    placeholder="Environment"
                                                    value={srv.environmentOther || ""}
                                                    onChange={(e) =>
                                                      handleUpdateServer(index, "environmentOther", e.target.value)
                                                    }
                                                  />
                                                )}
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Join Domain</FormLabel>
                                                <RadioGroup
                                                  value={srv.joinDomain}
                                                  onChange={(val) =>
                                                    handleUpdateServer(index, "joinDomain", val as "Ya" | "Tidak")
                                                  }
                                                >
                                                  <HStack spacing={4} mt={1}>
                                                    <Radio value="Ya" size="sm" colorScheme="green">Ya</Radio>
                                                    <Radio value="Tidak" size="sm" colorScheme="gray">Tidak</Radio>
                                                  </HStack>
                                                </RadioGroup>
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Hardening</FormLabel>
                                                <RadioGroup
                                                  value={srv.hardening}
                                                  onChange={(val) =>
                                                    handleUpdateServer(index, "hardening", val as "Ya" | "Tidak")
                                                  }
                                                >
                                                  <HStack spacing={4} mt={1}>
                                                    <Radio value="Ya" size="sm" colorScheme="green">Ya</Radio>
                                                    <Radio value="Tidak" size="sm" colorScheme="gray">Tidak</Radio>
                                                  </HStack>
                                                </RadioGroup>
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">PAM (Privileged Access)</FormLabel>
                                                <RadioGroup
                                                  value={srv.pam}
                                                  onChange={(val) =>
                                                    handleUpdateServer(index, "pam", val as "Ya" | "Tidak")
                                                  }
                                                >
                                                  <HStack spacing={4} mt={1}>
                                                    <Radio value="Ya" size="sm" colorScheme="green">Ya</Radio>
                                                    <Radio value="Tidak" size="sm" colorScheme="gray">Tidak</Radio>
                                                  </HStack>
                                                </RadioGroup>
                                              </FormControl>

                                              <FormControl gridColumn={{ base: "1", sm: "1 / -1" }}>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Dual Deploy Architecture</FormLabel>
                                                <RadioGroup
                                                  value={srv.dualDeploy}
                                                  onChange={(val) =>
                                                    handleUpdateServer(index, "dualDeploy", val as "Ya" | "Tidak")
                                                  }
                                                >
                                                  <HStack spacing={4} mt={1}>
                                                    <Radio value="Ya" size="sm" colorScheme="teal" fontWeight="bold">
                                                      Ya (Dual Deploy)
                                                    </Radio>
                                                    <Radio value="Tidak" size="sm" colorScheme="gray">
                                                      Tidak
                                                    </Radio>
                                                  </HStack>
                                                </RadioGroup>
                                              </FormControl>
                                            </SimpleGrid>
                                          ) : (
                                            /* View Mode: Clean fields like Executive Summary */
                                            <VStack align="stretch" spacing={3}>
                                              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Site:</Text>
                                                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                                    {displaySite || "-"}
                                                  </Text>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Segment:</Text>
                                                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                                    {srv.segment || "-"}
                                                  </Text>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Environment:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge
                                                      colorScheme={
                                                        displayEnvironment === "Production"
                                                          ? "green"
                                                          : displayEnvironment === "DRC"
                                                          ? "orange"
                                                          : displayEnvironment === "Staging"
                                                          ? "purple"
                                                          : displayEnvironment === "UAT" || displayEnvironment === "Development"
                                                          ? "blue"
                                                          : "teal"
                                                      }
                                                      px={2}
                                                      py={0.5}
                                                      rounded="md"
                                                      fontSize="2xs"
                                                      fontWeight="bold"
                                                    >
                                                      {displayEnvironment || "-"}
                                                    </Badge>
                                                  </Box>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Primary Data Center:</Text>
                                                  <HStack spacing={1.5} mt={0.5}>
                                                    <Badge
                                                      colorScheme={isDc1 ? "blue" : isDc2 ? "purple" : "gray"}
                                                      fontSize="2xs"
                                                      fontWeight="bold"
                                                      px={2}
                                                      py={0.5}
                                                      rounded="md"
                                                    >
                                                      {srv.primary}
                                                    </Badge>
                                                    <Text fontSize="3xs" color="gray.400">
                                                      {isDc1 ? "(DC1 Subnet)" : isDc2 ? "(DC2 Subnet)" : ""}
                                                    </Text>
                                                  </HStack>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Join Domain:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge
                                                      colorScheme={srv.joinDomain === "Ya" ? "green" : "gray"}
                                                      px={2}
                                                      py={0.5}
                                                      rounded="md"
                                                      fontSize="2xs"
                                                      fontWeight="bold"
                                                    >
                                                      {srv.joinDomain === "Ya" ? "Ya (Domain Joined)" : "Tidak"}
                                                    </Badge>
                                                  </Box>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Hardening:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge
                                                      colorScheme={srv.hardening === "Ya" ? "green" : "orange"}
                                                      px={2}
                                                      py={0.5}
                                                      rounded="md"
                                                      fontSize="2xs"
                                                      fontWeight="bold"
                                                    >
                                                      {srv.hardening === "Ya" ? "Ya (Hardened)" : "Tidak"}
                                                    </Badge>
                                                  </Box>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">PAM Access:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge
                                                      colorScheme={srv.pam === "Ya" ? "green" : "orange"}
                                                      px={2}
                                                      py={0.5}
                                                      rounded="md"
                                                      fontSize="2xs"
                                                      fontWeight="bold"
                                                    >
                                                      {srv.pam === "Ya" ? "Ya (PAM Managed)" : "Tidak"}
                                                    </Badge>
                                                  </Box>
                                                </Box>
                                              </SimpleGrid>

                                              {/* Dual Deploy Highlight Row */}
                                              <Box
                                                pt={2.5}
                                                mt={1}
                                                borderTop="1px dashed"
                                                borderColor={isDark ? "gray.700" : "gray.200"}
                                              >
                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                                  <HStack spacing={1.5}>
                                                    <Icon
                                                      as={FiLayers}
                                                      color={srv.dualDeploy === "Ya" ? "teal.500" : "gray.400"}
                                                      boxSize={3.5}
                                                    />
                                                    <Text fontSize="xs" color="gray.500">Dual Deploy Architecture:</Text>
                                                  </HStack>
                                                  <Badge
                                                    colorScheme={srv.dualDeploy === "Ya" ? "teal" : "gray"}
                                                    variant={srv.dualDeploy === "Ya" ? "solid" : "subtle"}
                                                    fontSize="2xs"
                                                    px={2.5}
                                                    py={0.5}
                                                    rounded="full"
                                                    fontWeight="bold"
                                                  >
                                                    {srv.dualDeploy === "Ya"
                                                      ? "Ya (Dual Active / Redundant)"
                                                      : "Tidak (Single Deployment)"}
                                                  </Badge>
                                                </Flex>
                                              </Box>
                                            </VStack>
                                          )}
                                        </Box>

                                        {/* ──────────────────────────────────────────────────────────
                                            CARD 2: VIRTUAL MACHINE (VM) SPECIFICATION
                                            ────────────────────────────────────────────────────────── */}
                                        <Box
                                          p={4}
                                          rounded="xl"
                                          bg={isDark ? "gray.800" : "white"}
                                          border="1px solid"
                                          borderColor={isDark ? "gray.700" : "gray.200"}
                                        >
                                          <HStack
                                            justify="space-between"
                                            mb={3}
                                            pb={2}
                                            borderBottom="1px solid"
                                            borderColor={isDark ? "gray.700" : "gray.100"}
                                          >
                                            <HStack spacing={2}>
                                              <Icon as={FiCpu} color="purple.500" boxSize={4} />
                                              <Text fontSize="2xs" fontWeight="800" color="purple.500" textTransform="uppercase" letterSpacing="wider">
                                                Virtual Machine (VM) Specification
                                              </Text>
                                            </HStack>
                                            <Badge
                                              colorScheme="purple"
                                              fontSize="3xs"
                                              rounded="md"
                                              px={2}
                                              py={0.5}
                                              fontFamily="mono"
                                            >
                                              {srv.vmDetail?.namaVm || "VM Node"}
                                            </Badge>
                                          </HStack>

                                          {IsEditMode ? (
                                            /* Edit Mode: VM Details */
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Nama VM</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  fontFamily="mono"
                                                  value={srv.vmDetail?.namaVm || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "namaVm", e.target.value)}
                                                  placeholder="Nama VM"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">IP Address</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  fontFamily="mono"
                                                  value={srv.vmDetail?.ipAddress || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "ipAddress", e.target.value)}
                                                  placeholder="IP Address"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">OS (Operating System)</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={
                                                    VM_OS_OPTIONS.filter((o) => o !== "Other").includes((srv.vmDetail?.os || "") as any)
                                                      ? srv.vmDetail?.os
                                                      : (srv.vmDetail?.os ? "Other" : "")
                                                  }
                                                  placeholder="Pilih Operating System"
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Other") {
                                                      handleUpdateServerVm(index, "os", "");
                                                    } else {
                                                      handleUpdateServerVm(index, "os", val);
                                                    }
                                                  }}
                                                >
                                                  {VM_OS_OPTIONS.map((os) => (
                                                    <option key={os} value={os}>
                                                      {os}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {(srv.vmDetail?.os === "Other" ||
                                                  (!VM_OS_OPTIONS.filter((o) => o !== "Other").includes((srv.vmDetail?.os || "") as any) &&
                                                    srv.vmDetail?.os !== undefined && srv.vmDetail?.os !== "")) && (
                                                  <Input
                                                    mt={1.5}
                                                    size="sm"
                                                    rounded="lg"
                                                    placeholder="Ketik nama OS kustom..."
                                                    value={srv.vmDetail?.os === "Other" ? "" : (srv.vmDetail?.os || "")}
                                                    onChange={(e) => handleUpdateServerVm(index, "os", e.target.value)}
                                                  />
                                                )}
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">CPU Compute</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={
                                                    VM_CPU_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.cpu || "") as any)
                                                      ? srv.vmDetail?.cpu
                                                      : ((srv.vmDetail?.cpu || "").trim() ? "Custom" : "")
                                                  }
                                                  placeholder="Pilih vCPU"
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Custom") {
                                                      const curNum = (srv.vmDetail?.cpu || "").replace(/\D/g, "") || "4";
                                                      handleUpdateServerVm(index, "cpu", `${curNum} vCPU`);
                                                    } else {
                                                      handleUpdateServerVm(index, "cpu", val);
                                                    }
                                                  }}
                                                >
                                                  {VM_CPU_OPTIONS.map((cpu) => (
                                                    <option key={cpu} value={cpu}>
                                                      {cpu}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {(!VM_CPU_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.cpu || "") as any) &&
                                                  (srv.vmDetail?.cpu || "").trim().length > 0) && (
                                                  <InputGroup size="sm" mt={1.5}>
                                                    <Input
                                                      rounded="lg"
                                                      type="number"
                                                      min={1}
                                                      placeholder="Jumlah core"
                                                      value={(srv.vmDetail?.cpu || "").replace(/\D/g, "")}
                                                      onChange={(e) => {
                                                        const num = e.target.value;
                                                        handleUpdateServerVm(index, "cpu", num ? `${num} vCPU` : "");
                                                      }}
                                                    />
                                                    <InputRightAddon rounded="lg" fontSize="2xs" fontWeight="bold">
                                                      vCPU
                                                    </InputRightAddon>
                                                  </InputGroup>
                                                )}
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Memory (RAM)</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={
                                                    VM_MEMORY_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.memory || "") as any)
                                                      ? srv.vmDetail?.memory
                                                      : ((srv.vmDetail?.memory || "").trim() ? "Custom" : "")
                                                  }
                                                  placeholder="Pilih Kapasitas RAM"
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Custom") {
                                                      const curNum = (srv.vmDetail?.memory || "").replace(/\D/g, "") || "16";
                                                      handleUpdateServerVm(index, "memory", `${curNum} GB RAM`);
                                                    } else {
                                                      handleUpdateServerVm(index, "memory", val);
                                                    }
                                                  }}
                                                >
                                                  {VM_MEMORY_OPTIONS.map((mem) => (
                                                    <option key={mem} value={mem}>
                                                      {mem}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {(!VM_MEMORY_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.memory || "") as any) &&
                                                  (srv.vmDetail?.memory || "").trim().length > 0) && (
                                                  <InputGroup size="sm" mt={1.5}>
                                                    <Input
                                                      rounded="lg"
                                                      type="number"
                                                      min={1}
                                                      placeholder="Kapasitas RAM"
                                                      value={(srv.vmDetail?.memory || "").replace(/\D/g, "")}
                                                      onChange={(e) => {
                                                        const num = e.target.value;
                                                        handleUpdateServerVm(index, "memory", num ? `${num} GB RAM` : "");
                                                      }}
                                                    />
                                                    <InputRightAddon rounded="lg" fontSize="2xs" fontWeight="bold">
                                                      GB RAM
                                                    </InputRightAddon>
                                                  </InputGroup>
                                                )}
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Storage Capacity</FormLabel>
                                                <ChakraSelect
                                                  size="sm"
                                                  rounded="lg"
                                                  value={
                                                    VM_STORAGE_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.storage || "") as any)
                                                      ? srv.vmDetail?.storage
                                                      : ((srv.vmDetail?.storage || "").trim() ? "Custom" : "")
                                                  }
                                                  placeholder="Pilih Kapasitas Storage"
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Custom") {
                                                      const curNum = (srv.vmDetail?.storage || "").replace(/[^\d.]/g, "") || "250";
                                                      handleUpdateServerVm(index, "storage", `${curNum} GB SSD`);
                                                    } else {
                                                      handleUpdateServerVm(index, "storage", val);
                                                    }
                                                  }}
                                                >
                                                  {VM_STORAGE_OPTIONS.map((stg) => (
                                                    <option key={stg} value={stg}>
                                                      {stg}
                                                    </option>
                                                  ))}
                                                </ChakraSelect>
                                                {(!VM_STORAGE_OPTIONS.filter((o) => o !== "Custom").includes((srv.vmDetail?.storage || "") as any) &&
                                                  (srv.vmDetail?.storage || "").trim().length > 0) && (
                                                  <HStack mt={1.5} spacing={2}>
                                                    <Input
                                                      size="sm"
                                                      rounded="lg"
                                                      type="number"
                                                      min={1}
                                                      placeholder="Ukuran"
                                                      value={(srv.vmDetail?.storage || "").split(" ")[0] || ""}
                                                      onChange={(e) => {
                                                        const num = e.target.value;
                                                        const currentUnit =
                                                          (srv.vmDetail?.storage || "").split(" ").slice(1).join(" ") || "GB SSD";
                                                        handleUpdateServerVm(index, "storage", num ? `${num} ${currentUnit}` : "");
                                                      }}
                                                    />
                                                    <ChakraSelect
                                                      size="sm"
                                                      rounded="lg"
                                                      w="130px"
                                                      value={
                                                        (srv.vmDetail?.storage || "").split(" ").slice(1).join(" ") || "GB SSD"
                                                      }
                                                      onChange={(e) => {
                                                        const currentNum =
                                                          (srv.vmDetail?.storage || "").split(" ")[0] || "100";
                                                        const newUnit = e.target.value;
                                                        handleUpdateServerVm(index, "storage", `${currentNum} ${newUnit}`);
                                                      }}
                                                    >
                                                      {VM_STORAGE_UNIT_OPTIONS.map((unit) => (
                                                        <option key={unit} value={unit}>
                                                          {unit}
                                                        </option>
                                                      ))}
                                                    </ChakraSelect>
                                                  </HStack>
                                                )}
                                              </FormControl>

                                              <FormControl gridColumn={{ base: "1", sm: "1 / -1" }}>
                                                <FormLabel fontSize="2xs" fontWeight="bold">Note (opsional)</FormLabel>
                                                <Textarea
                                                  rows={2}
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.vmDetail?.note || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "note", e.target.value)}
                                                  placeholder="Note (opsional)"
                                                />
                                              </FormControl>
                                            </SimpleGrid>
                                          ) : (
                                            /* View Mode: VM Details */
                                            <VStack align="stretch" spacing={3}>
                                              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Nama VM:</Text>
                                                  <Text fontSize="xs" fontWeight="bold" fontFamily="mono" color={isDark ? "white" : "gray.800"}>
                                                    {srv.vmDetail?.namaVm || "-"}
                                                  </Text>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">IP Address:</Text>
                                                  <Text fontSize="xs" fontWeight="bold" fontFamily="mono" color="blue.500">
                                                    {srv.vmDetail?.ipAddress || srv.ipAddress || "-"}
                                                  </Text>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">OS (Operating System):</Text>
                                                  <Text fontSize="xs" fontWeight="semibold" color={isDark ? "white" : "gray.800"}>
                                                    {srv.vmDetail?.os || "-"}
                                                  </Text>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">CPU Compute:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                                                      {srv.vmDetail?.cpu || "-"}
                                                    </Badge>
                                                  </Box>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Memory (RAM):</Text>
                                                  <Box mt={0.5}>
                                                    <Badge colorScheme="teal" fontSize="2xs" px={2} py={0.5} rounded="md">
                                                      {srv.vmDetail?.memory || "-"}
                                                    </Badge>
                                                  </Box>
                                                </Box>

                                                <Box>
                                                  <Text fontSize="xs" color="gray.500">Storage Capacity:</Text>
                                                  <Box mt={0.5}>
                                                    <Badge colorScheme="cyan" fontSize="2xs" px={2} py={0.5} rounded="md">
                                                      {srv.vmDetail?.storage || "-"}
                                                    </Badge>
                                                  </Box>
                                                </Box>
                                              </SimpleGrid>

                                              {srv.vmDetail?.note && (
                                                <Box
                                                  pt={2.5}
                                                  mt={1}
                                                  borderTop="1px dashed"
                                                  borderColor={isDark ? "gray.700" : "gray.200"}
                                                >
                                                  <Text fontSize="xs" color="gray.500">Note:</Text>
                                                  <Text fontSize="xs" mt={0.5} color={isDark ? "gray.300" : "gray.700"}>
                                                    {srv.vmDetail.note}
                                                  </Text>
                                                </Box>
                                              )}
                                            </VStack>
                                          )}
                                        </Box>
                                      </SimpleGrid>
                                    </VStack>
                                  </AccordionPanel>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        )}

                        {/* Add Server Button below accordion when in Edit Mode */}
                        {IsEditMode && (
                          <Flex
                            justify="space-between"
                            align="center"
                            pt={3}
                            borderTop="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            wrap="wrap"
                            gap={3}
                          >
                            <Button
                              leftIcon={<FiPlus />}
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              rounded="xl"
                              fontWeight="bold"
                              onClick={handleAddServer}
                            >
                              Tambah Server Node
                            </Button>
                            <Button
                              leftIcon={<FiSave />}
                              size="md"
                              colorScheme="secondary"
                              rounded="xl"
                              px={6}
                              fontWeight="bold"
                              isLoading={IsLoadingProcess}
                              onClick={handleSave}
                            >
                              Simpan Konfigurasi Server
                            </Button>
                          </Flex>
                        )}
                      </Box>

                      {/* ══════════════════════════════════════════════════════════
                          3. SECTION: SOFTWARE, RUNTIME & MIDDLEWARE PENDUKUNG (OPTION B)
                          ══════════════════════════════════════════════════════════ */}
                      <Box
                        p={{ base: 4, md: 5 }}
                        rounded="xl"
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        bg={isDark ? "gray.850" : "gray.50"}
                        shadow="sm"
                      >
                        <Flex
                          justify="space-between"
                          align={{ base: "start", sm: "center" }}
                          direction={{ base: "column", sm: "row" }}
                          gap={3}
                          mb={4}
                          pb={3}
                          borderBottom="1px dashed"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                        >
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              rounded="lg"
                              bg="cyan.50"
                              color="cyan.600"
                            >
                              <Icon as={FiCpu} boxSize={5} />
                            </Box>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2}>
                                <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                  Software, Runtime & Middleware Pendukung
                                </Heading>
                                <Badge colorScheme="cyan" fontSize="3xs" rounded="full" px={2}>
                                  {installedSoftwares.length} Terhubung
                                </Badge>
                              </HStack>
                              <Text fontSize="2xs" color="gray.500">
                                Komponen perangkat lunak, runtime engine (.NET, Java, NodeJS, Python), database client, web server, dan middleware pada topology server.
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                            <InputGroup size="sm" maxW={{ base: "full", sm: "200px" }}>
                              <InputLeftElement pointerEvents="none">
                                <Icon as={FiSearch} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                rounded="lg"
                                placeholder="Cari software terpasang..."
                                value={connectedSoftwaresSearch}
                                onChange={(e) => setConnectedSoftwaresSearch(e.target.value)}
                              />
                            </InputGroup>
                            <Button
                              size="sm"
                              colorScheme={isSoftwareCatalogOpen ? "gray" : "cyan"}
                              variant={isSoftwareCatalogOpen ? "outline" : "solid"}
                              leftIcon={isSoftwareCatalogOpen ? <FiX /> : <FiPlus />}
                              rounded="lg"
                              fontWeight="semibold"
                              onClick={handleOpenAddCatalog}
                            >
                              {isSoftwareCatalogOpen ? "Tutup Katalog" : "Tambah Software"}
                            </Button>
                          </HStack>
                        </Flex>

                        {/* Table 1: Connected / Installed Softwares Table */}
                        <TableContainer
                          rounded="lg"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.800" : "white"}
                        >
                          <Table size="sm" variant="simple">
                            <Thead bg={isDark ? "gray.750" : "gray.50"}>
                              <Tr>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Nama Software / Runtime
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Kategori
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Standar Bank
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Versi & Port
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Status Service
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"} textAlign="center" w="80px">
                                  Aksi
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {isInstalledSoftwaresLoading ? (
                                <Tr>
                                  <Td colSpan={6} textAlign="center" py={8}>
                                    <VStack spacing={2}>
                                      <Spinner size="sm" color="cyan.500" />
                                      <Text fontSize="xs" color="gray.500">
                                        Memuat daftar software dan runtime...
                                      </Text>
                                    </VStack>
                                  </Td>
                                </Tr>
                              ) : installedSoftwares.filter((sw) => {
                                if (!connectedSoftwaresSearch.trim()) return true;
                                const q = connectedSoftwaresSearch.toLowerCase().trim();
                                return (
                                  sw.softwareName.toLowerCase().includes(q) ||
                                  sw.softwareCategory.toLowerCase().includes(q) ||
                                  (sw.vendor && sw.vendor.toLowerCase().includes(q)) ||
                                  (sw.installedVersion && sw.installedVersion.toLowerCase().includes(q))
                                );
                              }).length === 0 ? (
                                <Tr>
                                  <Td colSpan={6} textAlign="center" py={8}>
                                    <VStack spacing={2}>
                                      <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                                        {connectedSoftwaresSearch.trim()
                                          ? `Tidak ditemukan software yang cocok dengan "${connectedSoftwaresSearch}"`
                                          : "Belum ada software atau runtime yang terhubung"}
                                      </Text>
                                      <Text fontSize="2xs" color="gray.400">
                                        {connectedSoftwaresSearch.trim()
                                          ? "Coba gunakan kata kunci pencarian yang lain."
                                          : 'Klik tombol "Hubungkan Software / Runtime" di atas untuk menambahkan komponen standar.'}
                                      </Text>
                                      {!isSoftwareCatalogOpen && !connectedSoftwaresSearch.trim() && (
                                        <Button
                                          size="xs"
                                          colorScheme="cyan"
                                          variant="outline"
                                          leftIcon={<FiPlus />}
                                          mt={1}
                                          rounded="md"
                                          onClick={handleOpenAddCatalog}
                                        >
                                          Buka Katalog Software
                                        </Button>
                                      )}
                                    </VStack>
                                  </Td>
                                </Tr>
                              ) : (
                                installedSoftwares
                                  .filter((sw) => {
                                    if (!connectedSoftwaresSearch.trim()) return true;
                                    const q = connectedSoftwaresSearch.toLowerCase().trim();
                                    return (
                                      sw.softwareName.toLowerCase().includes(q) ||
                                      sw.softwareCategory.toLowerCase().includes(q) ||
                                      (sw.vendor && sw.vendor.toLowerCase().includes(q)) ||
                                      (sw.installedVersion && sw.installedVersion.toLowerCase().includes(q))
                                    );
                                  })
                                  .map((sw) => {
                                    const getCatColor = (cat: string) => {
                                      switch (cat) {
                                        case "LANGUAGE_RUNTIME":
                                          return { scheme: "blue", label: "Runtime Engine" };
                                        case "WEB_SERVER":
                                          return { scheme: "cyan", label: "Web Server" };
                                        case "DATABASE_CLIENT":
                                          return { scheme: "orange", label: "Database Client" };
                                        case "CACHE_BROKER":
                                          return { scheme: "purple", label: "Cache / Broker" };
                                        default:
                                          return { scheme: "teal", label: cat };
                                      }
                                    };
                                    const catInfo = getCatColor(sw.softwareCategory);

                                    return (
                                      <Tr
                                        key={sw.id}
                                        _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                                        transition="background-color 0.15s"
                                      >
                                        {/* Column 1: Nama Software */}
                                        <Td py={3}>
                                          <HStack spacing={2.5}>
                                            <Avatar
                                              name={sw.softwareName}
                                              size="xs"
                                              bg="cyan.500"
                                              color="white"
                                              fontSize="3xs"
                                              icon={<Icon as={FiServer} fontSize="xs" />}
                                            />
                                            <VStack align="start" spacing={0.5}>
                                              <Text
                                                fontSize="xs"
                                                fontWeight="bold"
                                                color={isDark ? "white" : "gray.800"}
                                              >
                                                {sw.softwareName}
                                              </Text>
                                              {sw.vendor && (
                                                <Badge colorScheme="gray" fontSize="3xs" rounded="md" px={1.5}>
                                                  {sw.vendor}
                                                </Badge>
                                              )}
                                            </VStack>
                                          </HStack>
                                        </Td>

                                        {/* Column 2: Kategori */}
                                        <Td py={3}>
                                          <Badge
                                            colorScheme={catInfo.scheme}
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            rounded="md"
                                          >
                                            {catInfo.label}
                                          </Badge>
                                        </Td>

                                        {/* Column 3: Standar Bank */}
                                        <Td py={3}>
                                          <Badge
                                            colorScheme={sw.isStandardBank === "Y" || sw.isStandardBank === "Ya" ? "green" : "gray"}
                                            variant="subtle"
                                            fontSize="2xs"
                                            px={2}
                                            py={0.5}
                                            rounded="md"
                                          >
                                            {sw.isStandardBank === "Y" || sw.isStandardBank === "Ya" ? "Standar Bank" : "Kustom"}
                                          </Badge>
                                        </Td>

                                        {/* Column 4: Versi & Port */}
                                        <Td py={3}>
                                          <HStack spacing={1.5}>
                                            <Badge
                                              colorScheme="purple"
                                              variant="subtle"
                                              fontSize="2xs"
                                              px={2}
                                              py={0.5}
                                              rounded="md"
                                              fontFamily="mono"
                                            >
                                              {sw.installedVersion || "Latest"}
                                            </Badge>
                                            {sw.portNumber && (
                                              <Badge
                                                colorScheme="teal"
                                                variant="outline"
                                                fontSize="3xs"
                                                px={1.5}
                                                rounded="md"
                                              >
                                                Port: {sw.portNumber}
                                              </Badge>
                                            )}
                                          </HStack>
                                        </Td>

                                        {/* Column 5: Status Service */}
                                        <Td py={3}>
                                          <Badge
                                            colorScheme={sw.serviceStatus === "Running" ? "green" : "gray"}
                                            variant="solid"
                                            fontSize="3xs"
                                            px={2}
                                            py={0.5}
                                            rounded="md"
                                          >
                                            {sw.serviceStatus || "Active"}
                                          </Badge>
                                        </Td>

                                        {/* Column 6: Aksi */}
                                        <Td py={3} textAlign="center">
                                          <IconButton
                                            aria-label="Hapus software"
                                            icon={<FiTrash2 />}
                                            size="xs"
                                            colorScheme="red"
                                            variant="ghost"
                                            rounded="md"
                                            isLoading={isRemovingSoftwareId === sw.softwareId}
                                            onClick={() => handleRemoveSoftware(sw.softwareId, sw.softwareName)}
                                          />
                                        </Td>
                                      </Tr>
                                    );
                                  })
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>

                        {/* Stage 2: Master Software & Runtime Catalog (Revealed when clicked) */}
                        {isSoftwareCatalogOpen && (
                          <Box
                            mt={5}
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor={isDark ? "cyan.700" : "cyan.200"}
                            bg={isDark ? "gray.800" : "white"}
                            shadow="sm"
                          >
                            <Flex
                              justify="space-between"
                              align={{ base: "start", sm: "center" }}
                              direction={{ base: "column", sm: "row" }}
                              gap={3}
                              mb={3}
                              pb={2}
                              borderBottom="1px dashed"
                              borderColor={isDark ? "gray.700" : "gray.200"}
                            >
                              <VStack align="start" spacing={0.5}>
                                <HStack spacing={2}>
                                  <Heading size="xs" color={isDark ? "cyan.300" : "cyan.700"}>
                                    Katalog Master Software, Runtime & Middleware
                                  </Heading>
                                  <Badge colorScheme="cyan" fontSize="3xs" rounded="full" px={2}>
                                    {softwareCatalog.length} Komponen Tersedia
                                  </Badge>
                                </HStack>
                                <Text fontSize="2xs" color="gray.500">
                                  Pilih teknologi atau runtime standar bank untuk dihubungkan ke server aplikasi.
                                </Text>
                              </VStack>

                              <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                                <InputGroup size="sm" maxW={{ base: "full", sm: "220px" }}>
                                  <InputLeftElement pointerEvents="none">
                                    <Icon as={FiSearch} color="gray.400" />
                                  </InputLeftElement>
                                  <Input
                                    rounded="lg"
                                    placeholder="Cari software, runtime..."
                                    value={softwareCatalogSearch}
                                    onChange={(e) => setSoftwareCatalogSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        fetchSoftwareCatalog(softwareCatalogSearch);
                                      }
                                    }}
                                  />
                                </InputGroup>
                                <IconButton
                                  aria-label="Refresh Katalog"
                                  icon={<FiRefreshCw />}
                                  size="sm"
                                  rounded="lg"
                                  variant="outline"
                                  isLoading={isSoftwareCatalogLoading}
                                  onClick={() => fetchSoftwareCatalog(softwareCatalogSearch)}
                                />
                                <Button
                                  size="sm"
                                  colorScheme="cyan"
                                  leftIcon={<FiPlus />}
                                  rounded="lg"
                                  fontWeight="semibold"
                                  onClick={handleOpenCreateModal}
                                >
                                  Software Baru
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  rounded="lg"
                                  leftIcon={<FiX />}
                                  onClick={() => setIsSoftwareCatalogOpen(false)}
                                >
                                  Tutup
                                </Button>
                              </HStack>
                            </Flex>

                            {/* Category Filter Pills */}
                            <HStack spacing={2} mb={3} overflowX="auto" pb={1}>
                              {[
                                { key: "ALL", label: "Semua Kategori" },
                                { key: "LANGUAGE_RUNTIME", label: "Runtime Engine" },
                                { key: "WEB_SERVER", label: "Web Server" },
                                { key: "DATABASE_CLIENT", label: "Database Client" },
                                { key: "CACHE_BROKER", label: "Cache & Broker" },
                              ].map((cat) => (
                                <Button
                                  key={cat.key}
                                  size="xs"
                                  variant={softwareCategoryFilter === cat.key ? "solid" : "outline"}
                                  colorScheme="cyan"
                                  rounded="full"
                                  px={3}
                                  onClick={() => setSoftwareCategoryFilter(cat.key)}
                                >
                                  {cat.label}
                                </Button>
                              ))}
                            </HStack>

                            {/* Catalog Table */}
                            <TableContainer
                              rounded="lg"
                              border="1px solid"
                              borderColor={isDark ? "gray.700" : "gray.200"}
                              bg={isDark ? "gray.850" : "gray.50"}
                            >
                              <Table size="sm" variant="simple">
                                <Thead bg={isDark ? "gray.750" : "gray.100"}>
                                  <Tr>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Nama Komponen & Vendor
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Kategori
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Standar Bank
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Deskripsi
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"} textAlign="center" w="110px">
                                      Aksi
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {isSoftwareCatalogLoading ? (
                                    <Tr>
                                      <Td colSpan={5} textAlign="center" py={8}>
                                        <VStack spacing={2}>
                                          <Spinner size="sm" color="cyan.500" />
                                          <Text fontSize="xs" color="gray.500">
                                            Memuat data katalog software standar...
                                          </Text>
                                        </VStack>
                                      </Td>
                                    </Tr>
                                  ) : softwareCatalog.filter((item) => {
                                    const matchCat = softwareCategoryFilter === "ALL" || item.softwareCategory === softwareCategoryFilter;
                                    const q = softwareCatalogSearch.toLowerCase().trim();
                                    const matchSearch = !q || item.softwareName.toLowerCase().includes(q) || (item.vendor && item.vendor.toLowerCase().includes(q)) || (item.description && item.description.toLowerCase().includes(q));
                                    return matchCat && matchSearch;
                                  }).length === 0 ? (
                                    <Tr>
                                      <Td colSpan={5} textAlign="center" py={8}>
                                        <VStack spacing={1}>
                                          <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                                            Tidak ada komponen yang ditemukan
                                          </Text>
                                          <Text fontSize="2xs" color="gray.400">
                                            Gunakan kotak pencarian atau pilih kategori lain di atas.
                                          </Text>
                                        </VStack>
                                      </Td>
                                    </Tr>
                                  ) : (
                                    softwareCatalog
                                      .filter((item) => {
                                        const matchCat = softwareCategoryFilter === "ALL" || item.softwareCategory === softwareCategoryFilter;
                                        const q = softwareCatalogSearch.toLowerCase().trim();
                                        const matchSearch = !q || item.softwareName.toLowerCase().includes(q) || (item.vendor && item.vendor.toLowerCase().includes(q)) || (item.description && item.description.toLowerCase().includes(q));
                                        return matchCat && matchSearch;
                                      })
                                      .map((sw) => {
                                        const isAlreadyConnected = installedSoftwares.some(
                                          (inst) => inst.softwareId === sw.id || inst.softwareName.toLowerCase() === sw.softwareName.toLowerCase()
                                        );

                                        const getCatColor = (cat: string) => {
                                          switch (cat) {
                                            case "LANGUAGE_RUNTIME":
                                              return { scheme: "blue", label: "Runtime Engine" };
                                            case "WEB_SERVER":
                                              return { scheme: "cyan", label: "Web Server" };
                                            case "DATABASE_CLIENT":
                                              return { scheme: "orange", label: "Database Client" };
                                            case "CACHE_BROKER":
                                              return { scheme: "purple", label: "Cache / Broker" };
                                            default:
                                              return { scheme: "teal", label: cat };
                                          }
                                        };
                                        const catInfo = getCatColor(sw.softwareCategory);

                                        return (
                                          <Tr
                                            key={sw.id}
                                            _hover={{ bg: isDark ? "gray.700" : "white" }}
                                            transition="background-color 0.15s"
                                          >
                                            {/* Column 1: Nama & Vendor */}
                                            <Td py={3}>
                                              <HStack spacing={2.5}>
                                                <Avatar
                                                  name={sw.softwareName}
                                                  size="xs"
                                                  bg="cyan.500"
                                                  color="white"
                                                  fontSize="3xs"
                                                  icon={<Icon as={FiCpu} fontSize="xs" />}
                                                />
                                                <VStack align="start" spacing={0.5}>
                                                  <Text
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    color={isDark ? "white" : "gray.800"}
                                                  >
                                                    {sw.softwareName}
                                                  </Text>
                                                  {sw.vendor && (
                                                    <Badge colorScheme="gray" fontSize="3xs" rounded="md" px={1.5}>
                                                      {sw.vendor}
                                                    </Badge>
                                                  )}
                                                </VStack>
                                              </HStack>
                                            </Td>

                                            {/* Column 2: Kategori */}
                                            <Td py={3}>
                                              <Badge
                                                colorScheme={catInfo.scheme}
                                                fontSize="2xs"
                                                px={2}
                                                py={0.5}
                                                rounded="md"
                                              >
                                                {catInfo.label}
                                              </Badge>
                                            </Td>

                                            {/* Column 3: Standar Bank */}
                                            <Td py={3}>
                                              <Badge
                                                colorScheme={sw.isStandardBank === "Y" || sw.isStandardBank === "Ya" ? "green" : "gray"}
                                                variant="subtle"
                                                fontSize="2xs"
                                                px={2}
                                                py={0.5}
                                                rounded="md"
                                              >
                                                {sw.isStandardBank === "Y" || sw.isStandardBank === "Ya" ? "Standar Bank" : "Kustom"}
                                              </Badge>
                                            </Td>

                                            {/* Column 4: Deskripsi */}
                                            <Td py={3}>
                                              <Text
                                                fontSize="2xs"
                                                color={isDark ? "gray.300" : "gray.600"}
                                                maxW="280px"
                                                isTruncated
                                              >
                                                {sw.description || "-"}
                                              </Text>
                                            </Td>

                                            {/* Column 5: Aksi */}
                                            <Td py={3} textAlign="center">
                                              {isAlreadyConnected ? (
                                                <Badge colorScheme="green" variant="solid" fontSize="3xs" px={2} py={1} rounded="md">
                                                  Terhubung
                                                </Badge>
                                              ) : (
                                                <Button
                                                  size="xs"
                                                  colorScheme="cyan"
                                                  leftIcon={<FiPlus />}
                                                  rounded="md"
                                                  isLoading={isAddingSoftwareId === sw.id}
                                                  onClick={() => handleAddSoftware(sw)}
                                                >
                                                  Hubungkan
                                                </Button>
                                              )}
                                            </Td>
                                          </Tr>
                                        );
                                      })
                                  )}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}
                      </Box>

                      {/* ── MODAL: TAMBAH MASTER SOFTWARE & RUNTIME BARU ── */}
                      <Modal
                        isOpen={isCreateSoftwareModalOpen}
                        onClose={() => setIsCreateSoftwareModalOpen(false)}
                        isCentered
                        size="lg"
                      >
                        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
                        <ModalContent
                          rounded="xl"
                          bg={isDark ? "gray.800" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          shadow="2xl"
                        >
                          <ModalHeader
                            pb={2}
                            borderBottom="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack spacing={2.5}>
                              <Box p={2} rounded="lg" bg="cyan.50" color="cyan.600">
                                <Icon as={FiCpu} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                                  Tambah Master Software / Runtime
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  Daftarkan teknologi, runtime engine, atau middleware baru ke katalog master.
                                </Text>
                              </VStack>
                            </HStack>
                          </ModalHeader>
                          <ModalCloseButton />

                          <ModalBody py={4}>
                            <VStack spacing={4} align="stretch">
                              {/* Nama Software */}
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                  Nama Software / Runtime
                                </FormLabel>
                                <Input
                                  size="sm"
                                  rounded="lg"
                                  placeholder="Contoh: Ruby 3.3 YJIT, MariaDB 11.2, Kong Gateway"
                                  value={newSoftwareName}
                                  onChange={(e) => setNewSoftwareName(e.target.value)}
                                />
                              </FormControl>

                              {/* Kategori */}
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                  Kategori Perangkat Lunak
                                </FormLabel>
                                <ChakraSelect
                                  size="sm"
                                  rounded="lg"
                                  value={newSoftwareCategory}
                                  onChange={(e) => setNewSoftwareCategory(e.target.value)}
                                >
                                  <option value="LANGUAGE_RUNTIME">Runtime Engine (Node.js, .NET, Java, Python, Go, dll)</option>
                                  <option value="WEB_SERVER">Web & App Server (Nginx, Tomcat, Apache, IIS, dll)</option>
                                  <option value="DATABASE_CLIENT">Database Client (Oracle, PostgreSQL, MySQL, dll)</option>
                                  <option value="CACHE_BROKER">Cache & Message Broker (Redis, Kafka, RabbitMQ, dll)</option>
                                  <option value="MIDDLEWARE">Middleware / API Gateway / Tools</option>
                                  <option value="OTHER">Lainnya</option>
                                </ChakraSelect>
                              </FormControl>

                              {/* Vendor & Standar Bank Grid */}
                              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                <GridItem>
                                  <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                      Vendor / Publisher
                                    </FormLabel>
                                    <Input
                                      size="sm"
                                      rounded="lg"
                                      placeholder="Contoh: Oracle, Microsoft, Apache"
                                      value={newSoftwareVendor}
                                      onChange={(e) => setNewSoftwareVendor(e.target.value)}
                                    />
                                  </FormControl>
                                </GridItem>
                                <GridItem>
                                  <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                      Standar Bank
                                    </FormLabel>
                                    <ChakraSelect
                                      size="sm"
                                      rounded="lg"
                                      value={newSoftwareIsStandardBank}
                                      onChange={(e) => setNewSoftwareIsStandardBank(e.target.value)}
                                    >
                                      <option value="Y">Ya - Standar Disetujui Bank</option>
                                      <option value="N">Tidak - Kustom / Third-Party</option>
                                    </ChakraSelect>
                                  </FormControl>
                                </GridItem>
                              </Grid>

                              {/* Deskripsi */}
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                                  Deskripsi / Catatan Penggunaan
                                </FormLabel>
                                <Textarea
                                  size="sm"
                                  rounded="lg"
                                  rows={2}
                                  placeholder="Keterangan versi, kegunaan, atau kompatibilitas..."
                                  value={newSoftwareDescription}
                                  onChange={(e) => setNewSoftwareDescription(e.target.value)}
                                />
                              </FormControl>

                              {/* Auto-connect checkbox */}
                              <Box
                                p={3}
                                rounded="lg"
                                bg={isDark ? "gray.750" : "cyan.50"}
                                border="1px solid"
                                borderColor={isDark ? "gray.600" : "cyan.200"}
                              >
                                <Checkbox
                                  size="sm"
                                  colorScheme="cyan"
                                  isChecked={autoConnectNewSoftware}
                                  onChange={(e) => setAutoConnectNewSoftware(e.target.checked)}
                                >
                                  <Text fontSize="xs" fontWeight="semibold" color={isDark ? "white" : "gray.800"}>
                                    Langsung hubungkan software ini ke aplikasi setelah disimpan
                                  </Text>
                                </Checkbox>
                              </Box>
                            </VStack>
                          </ModalBody>

                          <ModalFooter
                            pt={2}
                            borderTop="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="ghost"
                                rounded="lg"
                                onClick={() => setIsCreateSoftwareModalOpen(false)}
                              >
                                Batal
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="cyan"
                                rounded="lg"
                                leftIcon={<FiSave />}
                                isLoading={isSubmittingNewSoftware}
                                onClick={handleCreateNewSoftware}
                              >
                                Simpan ke Katalog
                              </Button>
                            </HStack>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </Box>
      )}
    </LayoutAdmin>
  );
}
