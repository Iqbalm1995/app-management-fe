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
  Progress,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  SimpleGrid,
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
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";

// Services & Types
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
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

export const STANDARD_ROLE_SERVERS = [
  "Web Server",
  "App Server",
  "DB Server",
  "Middleware",
  "API Gateway",
  "Cache / Redis",
  "Storage / NAS",
  "Batch / Worker",
  "Other",
] as const;

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

const DEFAULT_SERVER_ENVIRONMENTS: AppServerEnvironmentItem[] = [
  {
    id: "srv-1",
    roleServer: "Web Server",
    roleDetail: "Reverse Proxy & SSL Termination (Nginx)",
    status: "Aktif",
    ipAddress: "10.20.101.15",
    primary: "DC1",
    site: "DC Narogong",
    segment: "DMZ Web Tier",
    environment: "Production",
    joinDomain: "Ya",
    hardening: "Ya",
    pam: "Ya",
    dualDeploy: "Ya",
    vmDetail: {
      namaVm: "VM-PRD-WEB-01",
      ipAddress: "10.20.101.15",
      os: "Red Hat Enterprise Linux 9.2",
      cpu: "4 vCPU",
      memory: "16 GB RAM",
      storage: "150 GB NVMe SSD",
      note: "Primary Web Reverse Proxy Instance with SSL Offloading",
    },
  },
  {
    id: "srv-2",
    roleServer: "App Server",
    roleDetail: "Core Application Microservices (.NET 8)",
    status: "Aktif",
    ipAddress: "10.20.102.24",
    primary: "DC1",
    site: "DC Narogong",
    segment: "Internal App Farm",
    environment: "Production",
    joinDomain: "Ya",
    hardening: "Ya",
    pam: "Ya",
    dualDeploy: "Ya",
    vmDetail: {
      namaVm: "VM-PRD-APP-01",
      ipAddress: "10.20.102.24",
      os: "Ubuntu Server 22.04 LTS",
      cpu: "8 vCPU",
      memory: "32 GB RAM",
      storage: "500 GB NVMe SSD",
      note: "Core Microservices and Background Workers Instance",
    },
  },
  {
    id: "srv-3",
    roleServer: "DB Server",
    roleDetail: "PostgreSQL Database Cluster Standby Node",
    status: "Pasif",
    ipAddress: "10.20.201.32",
    primary: "DC2",
    site: "DRC Surabaya",
    segment: "Database Secure Zone",
    environment: "DRC",
    joinDomain: "Ya",
    hardening: "Ya",
    pam: "Ya",
    dualDeploy: "Tidak",
    vmDetail: {
      namaVm: "VM-DRC-DB-02",
      ipAddress: "10.20.201.32",
      os: "Red Hat Enterprise Linux 9.2",
      cpu: "16 vCPU",
      memory: "64 GB RAM",
      storage: "2 TB Enterprise SSD (RAID 10)",
      note: "Standby Replication Node at DRC Surabaya",
    },
  },
];

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
  const [serverEnvironments, setServerEnvironments] = useState<AppServerEnvironmentItem[]>(DEFAULT_SERVER_ENVIRONMENTS);

  // Link Akses & Environment Test Parameters State
  const [linkAksesEnv, setLinkAksesEnv] = useState<"Dev" | "Prod">("Dev");
  const [linkAksesUrl, setLinkAksesUrl] = useState<string>("");
  const [testUser, setTestUser] = useState<string>("");
  const [testData, setTestData] = useState<string>("");

  // Supporting Applications (Aplikasi Pendukung) State
  const [supportingApps, setSupportingApps] = useState<ApplicationMasterResponse[]>([]);
  const [isSupportingAppsLoading, setIsSupportingAppsLoading] = useState<boolean>(false);
  const [supportingAppsSearch, setSupportingAppsSearch] = useState<string>("");
  const [supportingAppsPageIndex, setSupportingAppsPageIndex] = useState<number>(0);
  const [supportingAppsPageSize, setSupportingAppsPageSize] = useState<number>(5);
  const [supportingAppsTotal, setSupportingAppsTotal] = useState<number>(0);
  const [relatedSupportingApps, setRelatedSupportingApps] = useState<RelatedAppItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

  // Add Server Button Visibility State
  const [isAddServerHidden, setIsAddServerHidden] = useState<boolean>(false);

  useEffect(() => {
    if (!appId) return;
    try {
      const stored = localStorage.getItem(`app_env_servers_${appId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServerEnvironments(parsed);
        }
      }
      const storedAccess = localStorage.getItem(`app_env_access_${appId}`);
      if (storedAccess) {
        const parsedAccess = JSON.parse(storedAccess);
        if (parsedAccess.linkAksesEnv) setLinkAksesEnv(parsedAccess.linkAksesEnv);
        if (parsedAccess.linkAksesUrl !== undefined) setLinkAksesUrl(parsedAccess.linkAksesUrl);
        if (parsedAccess.testUser !== undefined) setTestUser(parsedAccess.testUser);
        if (parsedAccess.testData !== undefined) setTestData(parsedAccess.testData);
      }
      const storedRelated = localStorage.getItem(`app_related_supporting_${appId}`);
      if (storedRelated) {
        const parsedRelated = JSON.parse(storedRelated);
        if (Array.isArray(parsedRelated)) {
          setRelatedSupportingApps(parsedRelated);
        }
      }
    } catch (e) {
      console.error("Failed to load server environments and link access from localStorage", e);
    }
  }, [appId]);

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
    setIsAddServerHidden(true);
    const newServer: AppServerEnvironmentItem = {
      id: `srv-${Date.now()}`,
      roleServer: "App Server",
      roleDetail: "Application Service Node",
      status: "Aktif",
      ipAddress: "10.20.101.50",
      primary: "DC1",
      site: "DC Narogong",
      segment: "Internal App Farm",
      environment: "Production",
      joinDomain: "Ya",
      hardening: "Ya",
      pam: "Ya",
      dualDeploy: "Ya",
      vmDetail: {
        namaVm: `VM-PRD-NODE-${Date.now().toString().slice(-4)}`,
        ipAddress: "10.20.101.50",
        os: "Red Hat Enterprise Linux 9",
        cpu: "4 vCPU",
        memory: "16 GB RAM",
        storage: "250 GB SSD",
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
  const { GetDetailById, UpdateData, List: ListApplications } = useApps();

  // Fetch Supporting Applications from existing Master Data Application endpoint
  const fetchSupportingApps = useCallback(
    async (pageIndex: number, pageSize: number, searchKeyword: string) => {
      if (!tokenData) return;
      try {
        setIsSupportingAppsLoading(true);
        const payload: PaggingListPayload = {
          search: searchKeyword,
          limit: pageSize,
          page: pageIndex,
          fieldOrder: ["createdAt"],
          orderDir: "desc",
          filterWhere: [],
        };
        const res = await ListApplications(payload, tokenData);
        if (res && res.statusCode === RES_CODE_OK && res.data) {
          setSupportingApps(res.data);
          setSupportingAppsTotal(res.countTotal || res.count || res.data.length);
        } else if (res && res.data) {
          setSupportingApps(res.data);
          setSupportingAppsTotal(res.countTotal || res.count || res.data.length);
        }
      } catch (err) {
        console.error("Failed to fetch supporting apps:", err);
      } finally {
        setIsSupportingAppsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenData]
  );

  const handleOpenAddCatalog = () => {
    setIsCatalogOpen(true);
    fetchSupportingApps(0, supportingAppsPageSize, supportingAppsSearch);
  };

  const handleAddSupportingApp = (app: ApplicationMasterResponse) => {
    if (relatedSupportingApps.some((item) => item.id === app.id || item.appName.toLowerCase() === app.appName.toLowerCase())) {
      showToast({
        description: "Aplikasi sudah ada dalam daftar aplikasi pendukung",
        statusToast: "info",
      });
      return;
    }
    const displayVersion =
      (app as any).appVersion ||
      (app as any).version ||
      app.appStatusProject ||
      "v1.0.0";
    const displayYear =
      app.appInitaiteYear ||
      (app.createdAt ? new Date(app.createdAt).getFullYear().toString() : "-");

    const newItem: RelatedAppItem = {
      id: app.id,
      appName: app.appName,
      appShortName: app.appShortName || app.appCode || app.appName.slice(0, 4).toUpperCase(),
      appVersion: displayVersion,
      appInitaiteYear: displayYear,
      appsStatus: app.appsStatus || "ACTIVE",
    };

    const updated = [...relatedSupportingApps, newItem];
    setRelatedSupportingApps(updated);
    const namesStr = updated.map((a) => a.appName).join(", ");
    setFormData((prev) => ({ ...prev, appIntegrationOthersApps: namesStr }));
    if (appId) {
      localStorage.setItem(`app_related_supporting_${appId}`, JSON.stringify(updated));
    }
    showToast({
      description: `${app.appName} berhasil ditambahkan ke aplikasi pendukung`,
      statusToast: "success",
    });
  };

  const handleRemoveSupportingApp = (id: string) => {
    const updated = relatedSupportingApps.filter((item) => item.id !== id);
    setRelatedSupportingApps(updated);
    const namesStr = updated.map((a) => a.appName).join(", ");
    setFormData((prev) => ({ ...prev, appIntegrationOthersApps: namesStr }));
    if (appId) {
      localStorage.setItem(`app_related_supporting_${appId}`, JSON.stringify(updated));
    }
    showToast({
      description: "Aplikasi pendukung berhasil dihapus",
      statusToast: "info",
    });
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

    if (DataAuth == null && storedData) {
      try {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
      } catch (e) {
        console.error("Failed to parse auth data", e);
      }
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

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

      try {
        const storedRelated = localStorage.getItem(`app_related_supporting_${appId}`);
        if (storedRelated) {
          const parsedRelated = JSON.parse(storedRelated);
          if (Array.isArray(parsedRelated) && parsedRelated.length > 0) {
            setRelatedSupportingApps(parsedRelated);
          }
        } else if (data.appIntegrationOthersApps) {
          const names = data.appIntegrationOthersApps.split(",").map((s) => s.trim()).filter(Boolean);
          if (names.length > 0) {
            const fallbackApps: RelatedAppItem[] = names.map((name, idx) => ({
              id: `rel-${idx}-${name.replace(/\s+/g, "_")}`,
              appName: name,
              appShortName: name.length > 4 ? name.substring(0, 4).toUpperCase() : name.toUpperCase(),
              appVersion: "v1.0.0",
              appInitaiteYear: "-",
              appsStatus: "ACTIVE",
            }));
            setRelatedSupportingApps(fallbackApps);
          }
        }
      } catch (err) {
        console.error("Failed to parse stored supporting apps", err);
      }
    } catch (error) {
      console.error("Error loading application detail:", error);
      showToast({
        description: "Failed to load application data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  }, [appId, tokenData]);

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

  // Initial Data Fetch
  useEffect(() => {
    if (tokenData && appId) {
      LoadApplicationData();
      LoadOrganizations();
      LoadProjectStatuses();
      LoadBacklogs();
      LoadAssessments();
    }
  }, [tokenData, appId, assessmentRefresh]);

  // Load Projects on Pagination / Search / Filter Change (Debounced)
  useEffect(() => {
    if (tokenData && appId) {
      const timer = setTimeout(() => {
        LoadProjects(projectSearchQuery, projectStatusFilter, projectPageIndex, projectPageSize);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tokenData, appId, projectPageIndex, projectPageSize, projectStatusFilter, projectSearchQuery]);

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
        appIntegrationOthersApps:
          relatedSupportingApps.length > 0
            ? relatedSupportingApps.map((a) => a.appName).join(", ")
            : formData.appIntegrationOthersApps,
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
        localStorage.setItem(`app_env_servers_${appId}`, JSON.stringify(serverEnvironments));
        localStorage.setItem(
          `app_env_access_${appId}`,
          JSON.stringify({
            linkAksesEnv,
            linkAksesUrl,
            testUser,
            testData,
          })
        );
        localStorage.setItem(`app_related_supporting_${appId}`, JSON.stringify(relatedSupportingApps));
      }

      showToast({
        description: "Application data successfully updated",
        statusToast: "success",
      });

      setIsAddServerHidden(false);
      setIsEditMode(false);
      LoadApplicationData();
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

  // Standard React-Table Adapter for ControlTable (Aplikasi Pendukung)
  const supportingAppsPageCount = Math.ceil((supportingAppsTotal || 0) / supportingAppsPageSize) || 1;

  const supportingAppsTableAdapter = useMemo(() => {
    return {
      getPageCount: () => supportingAppsPageCount,
      getCanPreviousPage: () => supportingAppsPageIndex > 0,
      getCanNextPage: () => supportingAppsPageIndex < supportingAppsPageCount - 1,
      previousPage: () => {
        const nextIdx = Math.max(0, supportingAppsPageIndex - 1);
        setSupportingAppsPageIndex(nextIdx);
        fetchSupportingApps(nextIdx, supportingAppsPageSize, supportingAppsSearch);
      },
      nextPage: () => {
        const nextIdx = Math.min(supportingAppsPageCount - 1, supportingAppsPageIndex + 1);
        setSupportingAppsPageIndex(nextIdx);
        fetchSupportingApps(nextIdx, supportingAppsPageSize, supportingAppsSearch);
      },
      setPageIndex: (index: number) => {
        const targetIdx = Math.max(0, Math.min(supportingAppsPageCount - 1, index));
        setSupportingAppsPageIndex(targetIdx);
        fetchSupportingApps(targetIdx, supportingAppsPageSize, supportingAppsSearch);
      },
      setPageSize: (size: number) => {
        setSupportingAppsPageSize(size);
        setSupportingAppsPageIndex(0);
        fetchSupportingApps(0, size, supportingAppsSearch);
      },
      getState: () => ({
        pagination: {
          pageIndex: supportingAppsPageIndex,
          pageSize: supportingAppsPageSize,
        },
      }),
    };
  }, [supportingAppsPageCount, supportingAppsPageIndex, supportingAppsPageSize, supportingAppsSearch, fetchSupportingApps]);

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
              80 / 20 RESPONSIVE LAYOUT
              ══════════════════════════════════════════════════════════════════ */}
          <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={5}>
            {/* ── LEFT 80% WORKSPACE (COL-SPAN 9/10) ── */}
            <GridItem colSpan={{ base: 12, lg: 9, xl: 9 }}>
              <Card
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
                        <Text>Application Environment</Text>
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
                                    setIsAddServerHidden(false);
                                    const stored = localStorage.getItem(`app_env_servers_${appId}`);
                                    if (stored) {
                                      try {
                                        setServerEnvironments(JSON.parse(stored));
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }
                                    const storedAccess = localStorage.getItem(`app_env_access_${appId}`);
                                    if (storedAccess) {
                                      try {
                                        const parsedAccess = JSON.parse(storedAccess);
                                        if (parsedAccess.linkAksesEnv) setLinkAksesEnv(parsedAccess.linkAksesEnv);
                                        if (parsedAccess.linkAksesUrl !== undefined) setLinkAksesUrl(parsedAccess.linkAksesUrl);
                                        if (parsedAccess.testUser !== undefined) setTestUser(parsedAccess.testUser);
                                        if (parsedAccess.testData !== undefined) setTestData(parsedAccess.testData);
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }
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
                                <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                                  {serverEnvironments.length}
                                </Heading>
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
                                <Heading size="sm" color="green.500">
                                  {serverEnvironments.filter((s) => s.status === "Aktif").length}
                                </Heading>
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
                                <Heading size="sm" color="blue.500">
                                  {serverEnvironments.filter((s) => s.primary === "DC1").length}
                                </Heading>
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
                                <Heading size="sm" color="purple.500">
                                  {serverEnvironments.filter((s) => s.primary === "DC2").length}
                                </Heading>
                              </VStack>
                              <Box p={2} rounded="lg" bg="purple.50" color="purple.600">
                                <Icon as={FiLayers} boxSize={4} />
                              </Box>
                            </HStack>
                          </Box>
                        </SimpleGrid>

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        {/* ══════════════════════════════════════════════════════════
                            1. LINK AKSES & TESTING PARAMETERS CONTAINER
                            ══════════════════════════════════════════════════════════ */}
                        {/* ══════════════════════════════════════════════════════════
                            1. LINK AKSES & TESTING PARAMETERS ACCORDION
                            ══════════════════════════════════════════════════════════ */}
                        <Accordion allowToggle defaultIndex={[0]} w="full">
                          <AccordionItem
                            rounded="xl"
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            bg={isDark ? "gray.850" : "white"}
                            overflow="hidden"
                            shadow="sm"
                          >
                            <h2>
                              <AccordionButton
                                p={4}
                                bg={isDark ? "gray.800" : "gray.50"}
                                _hover={{ bg: isDark ? "gray.750" : "gray.100" }}
                              >
                                <Flex justify="space-between" align="center" w="full" pr={2}>
                                  <HStack spacing={3}>
                                    <Box
                                      p={2}
                                      rounded="lg"
                                      bg={linkAksesEnv === "Dev" ? "blue.50" : "green.50"}
                                      color={linkAksesEnv === "Dev" ? "blue.600" : "green.600"}
                                    >
                                      <Icon as={FiGlobe} boxSize={5} />
                                    </Box>
                                    <VStack align="start" spacing={0.5}>
                                      <HStack spacing={2}>
                                        <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                          Link Akses & Parameter Pengujian
                                        </Heading>
                                        <Badge
                                          colorScheme={linkAksesEnv === "Dev" ? "blue" : "green"}
                                          fontSize="3xs"
                                          rounded="md"
                                          px={2}
                                          fontWeight="bold"
                                        >
                                          {linkAksesEnv}
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="2xs" color="gray.500">
                                        Pilih lingkungan Dev atau Prod untuk konfigurasi URL akses dan kredensial pengujian.
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Flex>
                                <AccordionIcon color="gray.400" />
                              </AccordionButton>
                            </h2>

                            <AccordionPanel p={{ base: 4, md: 5 }} bg={isDark ? "gray.850" : "white"}>
                              <VStack spacing={4} align="stretch">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  {/* Selection: Dev / Prod */}
                                  <FormControl>
                                    <FormLabel fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                                      Link Akses Lingkungan
                                    </FormLabel>
                                    <HStack spacing={2} mt={1}>
                                      <Button
                                        size="sm"
                                        rounded="lg"
                                        variant={linkAksesEnv === "Dev" ? "solid" : "outline"}
                                        colorScheme={linkAksesEnv === "Dev" ? "blue" : "gray"}
                                        onClick={() => setLinkAksesEnv("Dev")}
                                        px={5}
                                        fontSize="xs"
                                        fontWeight="bold"
                                      >
                                        Dev
                                      </Button>
                                      <Button
                                        size="sm"
                                        rounded="lg"
                                        variant={linkAksesEnv === "Prod" ? "solid" : "outline"}
                                        colorScheme={linkAksesEnv === "Prod" ? "green" : "gray"}
                                        onClick={() => setLinkAksesEnv("Prod")}
                                        px={5}
                                        fontSize="xs"
                                        fontWeight="bold"
                                      >
                                        Prod
                                      </Button>
                                    </HStack>
                                  </FormControl>

                                  {/* URL Link Akses */}
                                  <FormControl>
                                    <FormLabel fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                                      URL Link Akses ({linkAksesEnv})
                                    </FormLabel>
                                    {IsEditMode ? (
                                      <Input
                                        size="sm"
                                        rounded="lg"
                                        placeholder="URL Link Akses"
                                        value={linkAksesUrl}
                                        onChange={(e) => setLinkAksesUrl(e.target.value)}
                                      />
                                    ) : (
                                      <HStack
                                        p={2}
                                        rounded="lg"
                                        bg={isDark ? "gray.800" : "white"}
                                        border="1px solid"
                                        borderColor={isDark ? "gray.700" : "gray.200"}
                                        justify="space-between"
                                      >
                                        <Text fontSize="xs" fontWeight="bold" color="blue.500" noOfLines={1}>
                                          {linkAksesUrl ||
                                            (linkAksesEnv === "Dev"
                                              ? `https://${DataApplication?.appShortName?.toLowerCase() || "app"}-dev.bankbki.co.id`
                                              : `https://${DataApplication?.appShortName?.toLowerCase() || "app"}.bankbki.co.id`)}
                                        </Text>
                                        {(linkAksesUrl || DataApplication?.appShortName) && (
                                          <IconButton
                                            aria-label="Buka URL Akses"
                                            icon={<FiExternalLink />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="blue"
                                            onClick={() => {
                                              const target =
                                                linkAksesUrl ||
                                                (linkAksesEnv === "Dev"
                                                  ? `https://${DataApplication?.appShortName?.toLowerCase() || "app"}-dev.bankbki.co.id`
                                                  : `https://${DataApplication?.appShortName?.toLowerCase() || "app"}.bankbki.co.id`);
                                              window.open(target.startsWith("http") ? target : `https://${target}`, "_blank");
                                            }}
                                          />
                                        )}
                                      </HStack>
                                    )}
                                  </FormControl>
                                </SimpleGrid>

                                {/* IF DEV = TRUE: SHOW FIELD TEST USER AND TEST DATA FIELD */}
                                {linkAksesEnv === "Dev" && (
                                  <Box
                                    p={3.5}
                                    rounded="lg"
                                    bg={isDark ? "gray.800" : "white"}
                                    border="1px dashed"
                                    borderColor="blue.300"
                                  >
                                    <HStack mb={2.5} spacing={1.5} color="blue.500">
                                      <Icon as={FiCheckCircle} boxSize={4} />
                                      <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                                        Parameter Pengujian (Environment Development)
                                      </Text>
                                    </HStack>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                      <FormControl>
                                        <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">
                                          Test User
                                        </FormLabel>
                                        {IsEditMode ? (
                                          <Input
                                            size="sm"
                                            rounded="lg"
                                            placeholder="Test User"
                                            value={testUser}
                                            onChange={(e) => setTestUser(e.target.value)}
                                          />
                                        ) : (
                                          <Box
                                            p={2}
                                            rounded="md"
                                            bg={isDark ? "gray.750" : "gray.50"}
                                            border="1px solid"
                                            borderColor={isDark ? "gray.700" : "gray.200"}
                                          >
                                            <Text fontSize="xs" fontFamily="mono" color={isDark ? "white" : "gray.800"}>
                                              {testUser || "dev_test_user01"}
                                            </Text>
                                          </Box>
                                        )}
                                      </FormControl>

                                      <FormControl>
                                        <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">
                                          Test Data
                                        </FormLabel>
                                        {IsEditMode ? (
                                          <Input
                                            size="sm"
                                            rounded="lg"
                                            placeholder="Test Data"
                                            value={testData}
                                            onChange={(e) => setTestData(e.target.value)}
                                          />
                                        ) : (
                                          <Box
                                            p={2}
                                            rounded="md"
                                            bg={isDark ? "gray.750" : "gray.50"}
                                            border="1px solid"
                                            borderColor={isDark ? "gray.700" : "gray.200"}
                                          >
                                            <Text fontSize="xs" fontFamily="mono" color={isDark ? "white" : "gray.800"}>
                                              {testData || "CIF: 902188201 / Rekening: 1029384756"}
                                            </Text>
                                          </Box>
                                        )}
                                      </FormControl>
                                    </SimpleGrid>
                                  </Box>
                                )}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>

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
                                    Daftar Server Node & Virtual Machine
                                  </Heading>
                                  <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                                    {serverEnvironments.length} Nodes
                                  </Badge>
                                </HStack>
                                <Text fontSize="2xs" color="gray.500">
                                  Konfigurasi server role, site segment, DC1/DC2 primary flag, hardening, PAM, dual deploy & spesifikasi VM.
                                </Text>
                              </VStack>
                            </HStack>

                            {!isAddServerHidden && (
                              <Button
                                leftIcon={<FiPlus />}
                                size="sm"
                                colorScheme="purple"
                                variant="outline"
                                rounded="xl"
                                px={3.5}
                                fontSize="xs"
                                fontWeight="bold"
                                onClick={handleAddServer}
                              >
                                Add Server
                              </Button>
                            )}
                          </Flex>

                          {/* Accordion List */}
                        {serverEnvironments.length === 0 ? (
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
                              No Server Nodes Configured
                            </Heading>
                            <Text fontSize="xs" color="gray.500" mb={4}>
                              This application does not have any server nodes in its environment list.
                            </Text>
                            <Button
                              leftIcon={<FiPlus />}
                              size="sm"
                              colorScheme="secondary"
                              rounded="xl"
                              onClick={handleAddServer}
                            >
                              Add First Server Node
                            </Button>
                          </Box>
                        ) : (
                          <Accordion allowMultiple defaultIndex={[0]} w="full">
                            {serverEnvironments.map((srv, index) => {
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
                                            <option value="Web Server">Web Server</option>
                                            <option value="App Server">App Server</option>
                                            <option value="DB Server">DB Server</option>
                                            <option value="Middleware">Middleware</option>
                                            <option value="API Gateway">API Gateway</option>
                                            <option value="Cache / Redis">Cache / Redis</option>
                                            <option value="Storage / NAS">Storage / NAS</option>
                                            <option value="Batch / Worker">Batch / Worker</option>
                                            <option value="Other">Other</option>
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
                                            <option value="Aktif">Aktif</option>
                                            <option value="Pasif">Pasif</option>
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
                                              <option value="DC1">DC1</option>
                                              <option value="DC2">DC2</option>
                                              <option value="-">-</option>
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
                                                SERVER #{index + 1}
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
                                                  <option value="DC Narogong">DC Narogong</option>
                                                  <option value="DRC Surabaya">DRC Surabaya</option>
                                                  <option value="Head Office">Head Office</option>
                                                  <option value="AWS Cloud">AWS Cloud</option>
                                                  <option value="Google Cloud">Google Cloud</option>
                                                  <option value="Other Site">Other Site</option>
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
                                                  <option value="Production">Production</option>
                                                  <option value="DRC">DRC</option>
                                                  <option value="Staging">Staging</option>
                                                  <option value="UAT">UAT</option>
                                                  <option value="Development">Development</option>
                                                  <option value="Other">Other</option>
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
                                                <FormLabel fontSize="2xs" fontWeight="bold">OS</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.vmDetail?.os || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "os", e.target.value)}
                                                  placeholder="OS"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">CPU</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.vmDetail?.cpu || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "cpu", e.target.value)}
                                                  placeholder="CPU"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">MEMORY</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.vmDetail?.memory || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "memory", e.target.value)}
                                                  placeholder="MEMORY"
                                                />
                                              </FormControl>

                                              <FormControl>
                                                <FormLabel fontSize="2xs" fontWeight="bold">STORAGE</FormLabel>
                                                <Input
                                                  size="sm"
                                                  rounded="lg"
                                                  value={srv.vmDetail?.storage || ""}
                                                  onChange={(e) => handleUpdateServerVm(index, "storage", e.target.value)}
                                                  placeholder="STORAGE"
                                                />
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
                            justify={!isAddServerHidden ? "space-between" : "flex-end"}
                            align="center"
                            pt={3}
                            borderTop="1px dashed"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          >
                            {!isAddServerHidden && (
                              <Button
                                leftIcon={<FiPlus />}
                                size="sm"
                                variant="outline"
                                colorScheme="purple"
                                rounded="xl"
                                fontWeight="bold"
                                onClick={handleAddServer}
                              >
                                Add Server
                              </Button>
                            )}
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
                              Save Environment Changes
                            </Button>
                          </Flex>
                        )}
                      </Box>

                      {/* ══════════════════════════════════════════════════════════
                          3. SECTION: APLIKASI PENDUKUNG (DATA TABLE LIST)
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
                              bg="teal.50"
                              color="teal.600"
                            >
                              <Icon as={FiLayers} boxSize={5} />
                            </Box>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2}>
                                <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                                  Aplikasi Pendukung
                                </Heading>
                                <Badge colorScheme="teal" fontSize="3xs" rounded="full" px={2}>
                                  {relatedSupportingApps.length} Terhubung
                                </Badge>
                              </HStack>
                              <Text fontSize="2xs" color="gray.500">
                                Daftar aplikasi terhubung dan dependensi dari katalog Master Data Application.
                              </Text>
                            </VStack>
                          </HStack>

                          <Button
                            size="sm"
                            colorScheme="teal"
                            leftIcon={<FiPlus />}
                            rounded="lg"
                            fontWeight="semibold"
                            onClick={handleOpenAddCatalog}
                          >
                            Add Aplikasi Pendukung
                          </Button>
                        </Flex>

                        {/* Table 1: Related Applications Table */}
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
                                  Nama
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Versi
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                  Tahun
                                </Th>
                                <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"} textAlign="center" w="80px">
                                  Aksi
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {relatedSupportingApps.length === 0 ? (
                                <Tr>
                                  <Td colSpan={4} textAlign="center" py={8}>
                                    <VStack spacing={2}>
                                      <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                                        Belum ada aplikasi pendukung yang terhubung
                                      </Text>
                                      <Text fontSize="2xs" color="gray.400">
                                        Klik tombol &quot;Add Aplikasi Pendukung&quot; di atas untuk menghubungkan aplikasi dari katalog.
                                      </Text>
                                    </VStack>
                                  </Td>
                                </Tr>
                              ) : (
                                relatedSupportingApps.map((app) => (
                                  <Tr
                                    key={app.id}
                                    _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                                    transition="background-color 0.15s"
                                  >
                                    {/* Column 1: Nama */}
                                    <Td py={3}>
                                      <HStack spacing={2.5}>
                                        <Avatar
                                          name={app.appShortName || app.appName}
                                          size="xs"
                                          bg="teal.500"
                                          color="white"
                                          fontSize="3xs"
                                        />
                                        <VStack align="start" spacing={0.5}>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color={isDark ? "white" : "gray.800"}
                                          >
                                            {app.appName}
                                          </Text>
                                          <HStack spacing={1.5}>
                                            <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={1.5}>
                                              {app.appShortName || "APP"}
                                            </Badge>
                                            {app.appsStatus && (
                                              <Badge
                                                colorScheme={
                                                  app.appsStatus === "ACTIVE"
                                                    ? "green"
                                                    : app.appsStatus === "ON DEVELOPMENT"
                                                    ? "orange"
                                                    : "gray"
                                                }
                                                fontSize="3xs"
                                                rounded="md"
                                                px={1.5}
                                              >
                                                {app.appsStatus}
                                              </Badge>
                                            )}
                                          </HStack>
                                        </VStack>
                                      </HStack>
                                    </Td>

                                    {/* Column 2: Versi */}
                                    <Td py={3}>
                                      <Badge
                                        colorScheme="purple"
                                        variant="subtle"
                                        fontSize="2xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        fontFamily="mono"
                                      >
                                        {app.appVersion || "v1.0.0"}
                                      </Badge>
                                    </Td>

                                    {/* Column 3: Tahun */}
                                    <Td py={3}>
                                      <Text
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        color={isDark ? "gray.300" : "gray.700"}
                                      >
                                        {app.appInitaiteYear || "-"}
                                      </Text>
                                    </Td>

                                    {/* Column 4: Aksi */}
                                    <Td py={3} textAlign="center">
                                      <IconButton
                                        aria-label="Hapus aplikasi pendukung"
                                        icon={<FiTrash2 />}
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        rounded="md"
                                        onClick={() => handleRemoveSupportingApp(app.id)}
                                      />
                                    </Td>
                                  </Tr>
                                ))
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>

                        {/* Stage 2: Catalog Data Table (Revealed when "Add Aplikasi Pendukung" is clicked) */}
                        {isCatalogOpen && (
                          <Box
                            mt={5}
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor={isDark ? "teal.700" : "teal.200"}
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
                                  <Heading size="xs" color={isDark ? "teal.300" : "teal.700"}>
                                    Katalog Master Data Application
                                  </Heading>
                                  <Badge colorScheme="teal" fontSize="3xs" rounded="full" px={2}>
                                    {supportingAppsTotal} Tersedia
                                  </Badge>
                                </HStack>
                                <Text fontSize="2xs" color="gray.500">
                                  Pilih aplikasi untuk dihubungkan sebagai aplikasi pendukung.
                                </Text>
                              </VStack>

                              <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                                <InputGroup size="sm" maxW={{ base: "full", sm: "220px" }}>
                                  <InputLeftElement pointerEvents="none">
                                    <Icon as={FiSearch} color="gray.400" />
                                  </InputLeftElement>
                                  <Input
                                    rounded="lg"
                                    placeholder="Cari nama aplikasi..."
                                    value={supportingAppsSearch}
                                    onChange={(e) => setSupportingAppsSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setSupportingAppsPageIndex(0);
                                        fetchSupportingApps(0, supportingAppsPageSize, supportingAppsSearch);
                                      }
                                    }}
                                  />
                                </InputGroup>
                                <IconButton
                                  aria-label="Refresh Katalog Aplikasi"
                                  icon={<FiRefreshCw />}
                                  size="sm"
                                  rounded="lg"
                                  variant="outline"
                                  isLoading={isSupportingAppsLoading}
                                  onClick={() => fetchSupportingApps(supportingAppsPageIndex, supportingAppsPageSize, supportingAppsSearch)}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  rounded="lg"
                                  leftIcon={<FiX />}
                                  onClick={() => setIsCatalogOpen(false)}
                                >
                                  Tutup
                                </Button>
                              </HStack>
                            </Flex>

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
                                      Nama
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Versi
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"}>
                                      Tahun
                                    </Th>
                                    <Th py={3} fontSize="2xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.600"} textAlign="center" w="110px">
                                      Aksi
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {isSupportingAppsLoading ? (
                                    <Tr>
                                      <Td colSpan={4} textAlign="center" py={8}>
                                        <VStack spacing={2}>
                                          <Spinner size="sm" color="teal.500" />
                                          <Text fontSize="xs" color="gray.500">
                                            Memuat data aplikasi dari katalog...
                                          </Text>
                                        </VStack>
                                      </Td>
                                    </Tr>
                                  ) : supportingApps.length === 0 ? (
                                    <Tr>
                                      <Td colSpan={4} textAlign="center" py={8}>
                                        <VStack spacing={1}>
                                          <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                                            Tidak ada aplikasi yang ditemukan
                                          </Text>
                                          <Text fontSize="2xs" color="gray.400">
                                            Gunakan kotak pencarian di atas untuk menyaring data aplikasi.
                                          </Text>
                                        </VStack>
                                      </Td>
                                    </Tr>
                                  ) : (
                                    supportingApps.map((app) => {
                                      const displayVersion =
                                        (app as any).appVersion ||
                                        (app as any).version ||
                                        app.appStatusProject ||
                                        "v1.0.0";
                                      const displayYear =
                                        app.appInitaiteYear ||
                                        (app.createdAt ? new Date(app.createdAt).getFullYear().toString() : "-");
                                      const isAlreadyConnected = relatedSupportingApps.some(
                                        (rel) => rel.id === app.id || rel.appName.toLowerCase() === app.appName.toLowerCase()
                                      );

                                      return (
                                        <Tr
                                          key={app.id}
                                          _hover={{ bg: isDark ? "gray.700" : "white" }}
                                          transition="background-color 0.15s"
                                        >
                                          {/* Column 1: Nama */}
                                          <Td py={3}>
                                            <HStack spacing={2.5}>
                                              <Avatar
                                                name={app.appShortName || app.appName}
                                                size="xs"
                                                bg="teal.500"
                                                color="white"
                                                fontSize="3xs"
                                              />
                                              <VStack align="start" spacing={0.5}>
                                                <Text
                                                  fontSize="xs"
                                                  fontWeight="bold"
                                                  color={isDark ? "white" : "gray.800"}
                                                >
                                                  {app.appName}
                                                </Text>
                                                <HStack spacing={1.5}>
                                                  <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={1.5}>
                                                    {app.appShortName || app.appCode || "APP"}
                                                  </Badge>
                                                  {app.appsStatus && (
                                                    <Badge
                                                      colorScheme={
                                                        app.appsStatus === "ACTIVE"
                                                          ? "green"
                                                          : app.appsStatus === "ON DEVELOPMENT"
                                                          ? "orange"
                                                          : "gray"
                                                      }
                                                      fontSize="3xs"
                                                      rounded="md"
                                                      px={1.5}
                                                    >
                                                      {app.appsStatus}
                                                    </Badge>
                                                  )}
                                                </HStack>
                                              </VStack>
                                            </HStack>
                                          </Td>

                                          {/* Column 2: Versi */}
                                          <Td py={3}>
                                            <Badge
                                              colorScheme="purple"
                                              variant="subtle"
                                              fontSize="2xs"
                                              px={2}
                                              py={0.5}
                                              rounded="md"
                                              fontFamily="mono"
                                            >
                                              {displayVersion}
                                            </Badge>
                                          </Td>

                                          {/* Column 3: Tahun */}
                                          <Td py={3}>
                                            <Text
                                              fontSize="xs"
                                              fontWeight="semibold"
                                              color={isDark ? "gray.300" : "gray.700"}
                                            >
                                              {displayYear}
                                            </Text>
                                          </Td>

                                          {/* Column 4: Aksi */}
                                          <Td py={3} textAlign="center">
                                            {isAlreadyConnected ? (
                                              <Badge colorScheme="green" variant="solid" fontSize="3xs" px={2} py={1} rounded="md">
                                                Terhubung
                                              </Badge>
                                            ) : (
                                              <Button
                                                size="xs"
                                                colorScheme="teal"
                                                leftIcon={<FiPlus />}
                                                rounded="md"
                                                onClick={() => handleAddSupportingApp(app)}
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

                            {/* Compact Section Pagination */}
                            {supportingAppsTotal > 0 && (
                              <Flex
                                direction={{ base: "column", sm: "row" }}
                                justify="space-between"
                                align={{ base: "start", sm: "center" }}
                                gap={2}
                                pt={3}
                                px={1}
                              >
                                {/* Left: Info & Rows per page */}
                                <HStack spacing={2} fontSize="2xs" color={isDark ? "gray.400" : "gray.600"}>
                                  <Text>
                                    Menampilkan{" "}
                                    <Text as="span" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                      {supportingAppsPageIndex * supportingAppsPageSize + 1}-
                                      {Math.min((supportingAppsPageIndex + 1) * supportingAppsPageSize, supportingAppsTotal)}
                                    </Text>{" "}
                                    dari{" "}
                                    <Text as="span" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                      {supportingAppsTotal}
                                    </Text>
                                  </Text>
                                  <Text color="gray.400">|</Text>
                                  <HStack spacing={1}>
                                    <Text>Per hal:</Text>
                                    <ChakraSelect
                                      size="xs"
                                      w="65px"
                                      h="26px"
                                      rounded="md"
                                      fontSize="2xs"
                                      value={supportingAppsPageSize}
                                      onChange={(e) => supportingAppsTableAdapter.setPageSize(Number(e.target.value))}
                                    >
                                      <option value={5}>5</option>
                                      <option value={10}>10</option>
                                      <option value={20}>20</option>
                                    </ChakraSelect>
                                  </HStack>
                                </HStack>

                                {/* Right: Compact Page Buttons */}
                                <HStack spacing={1} alignSelf={{ base: "flex-end", sm: "center" }}>
                                  <IconButton
                                    aria-label="Halaman Pertama"
                                    icon={<FiChevronsLeft />}
                                    size="xs"
                                    variant="ghost"
                                    rounded="md"
                                    isDisabled={supportingAppsPageIndex === 0}
                                    onClick={() => supportingAppsTableAdapter.setPageIndex(0)}
                                  />
                                  <IconButton
                                    aria-label="Halaman Sebelumnya"
                                    icon={<FiChevronLeft />}
                                    size="xs"
                                    variant="ghost"
                                    rounded="md"
                                    isDisabled={!supportingAppsTableAdapter.getCanPreviousPage()}
                                    onClick={() => supportingAppsTableAdapter.previousPage()}
                                  />

                                  {/* Numbered Page Buttons */}
                                  {(() => {
                                    const maxVisible = 5;
                                    let start = Math.max(1, supportingAppsPageIndex + 1 - 2);
                                    let end = Math.min(supportingAppsPageCount, start + maxVisible - 1);
                                    if (end - start + 1 < maxVisible) {
                                      start = Math.max(1, end - maxVisible + 1);
                                    }
                                    const pages: number[] = [];
                                    for (let i = start; i <= end; i++) {
                                      pages.push(i);
                                    }

                                    return pages.map((page) => {
                                      const isCurrent = page === supportingAppsPageIndex + 1;
                                      return (
                                        <Button
                                          key={page}
                                          size="xs"
                                          minW="26px"
                                          h="26px"
                                          px={1.5}
                                          rounded="md"
                                          fontSize="2xs"
                                          fontWeight={isCurrent ? "bold" : "normal"}
                                          colorScheme={isCurrent ? "teal" : "gray"}
                                          variant={isCurrent ? "solid" : "ghost"}
                                          onClick={() => supportingAppsTableAdapter.setPageIndex(page - 1)}
                                        >
                                          {page}
                                        </Button>
                                      );
                                    });
                                  })()}

                                  <IconButton
                                    aria-label="Halaman Berikutnya"
                                    icon={<FiChevronRight />}
                                    size="xs"
                                    variant="ghost"
                                    rounded="md"
                                    isDisabled={!supportingAppsTableAdapter.getCanNextPage()}
                                    onClick={() => supportingAppsTableAdapter.nextPage()}
                                  />
                                  <IconButton
                                    aria-label="Halaman Terakhir"
                                    icon={<FiChevronsRight />}
                                    size="xs"
                                    variant="ghost"
                                    rounded="md"
                                    isDisabled={supportingAppsPageIndex >= supportingAppsPageCount - 1}
                                    onClick={() => supportingAppsTableAdapter.setPageIndex(supportingAppsPageCount - 1)}
                                  />
                                </HStack>
                              </Flex>
                            )}
                          </Box>
                        )}
                      </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </GridItem>

            {/* ── RIGHT 20% STICKY SIDEBAR (COL-SPAN 3) ── */}
            <GridItem colSpan={{ base: 12, lg: 3, xl: 3 }}>
              <VStack spacing={4} align="stretch" position="sticky" top="85px">
                {/* 1. Card Aksi Cepat */}
                <Card
                  shadow="md"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                >
                  <CardHeader pb={2} pt={4} px={4}>
                    <HStack spacing={2}>
                      <Icon as={FiZap} color="secondary.500" />
                      <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                        Actions & Operations
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody px={4} pb={4} pt={2}>
                    <VStack spacing={2.5} align="stretch">
                      {IsEditMode ? (
                        <>
                          <Button
                            leftIcon={<FiSave />}
                            size="md"
                            h="42px"
                            colorScheme="green"
                            w="full"
                            rounded="xl"
                            fontWeight="bold"
                            isLoading={IsLoadingProcess}
                            onClick={handleSave}
                          >
                            Save Changes
                          </Button>
                          <Button
                            leftIcon={<FiX />}
                            size="sm"
                            variant="outline"
                            w="full"
                            rounded="xl"
                            onClick={() => {
                              setIsEditMode(false);
                              LoadApplicationData();
                            }}
                          >
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <Button
                          leftIcon={<FiEdit />}
                          size="md"
                          h="42px"
                          colorScheme="secondary"
                          w="full"
                          rounded="xl"
                          fontWeight="bold"
                          shadow="sm"
                          onClick={() => setIsEditMode(true)}
                        >
                          Edit Mode
                        </Button>
                      )}

                      <Button
                        leftIcon={<FiCopy />}
                        size="sm"
                        variant="outline"
                        w="full"
                        rounded="xl"
                        onClick={onCopy}
                      >
                        {hasCopied ? "Copied!" : "Copy App Code"}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* 2. Card Status Portofolio Proyek */}
                <Card
                  shadow="md"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                >
                  <CardHeader pb={2} pt={4} px={4}>
                    <HStack spacing={2}>
                      <Icon as={FiBriefcase} color="secondary.500" />
                      <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                        Project SDLC Ratio
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody px={4} pb={4} pt={2}>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center" fontSize="2xs">
                        <Text color="gray.500">Completion Rate</Text>
                        <Text fontWeight="extrabold" color="secondary.500">{completionRate}%</Text>
                      </Flex>
                      <Progress
                        value={completionRate}
                        size="sm"
                        colorScheme={completionRate === 100 ? "green" : "secondary"}
                        rounded="full"
                        bg={isDark ? "gray.700" : "gray.100"}
                      />
                      <HStack justify="space-between" fontSize="2xs" pt={1}>
                        <VStack align="start" spacing={0}>
                          <Text color="gray.500">Total Projects</Text>
                          <Text fontWeight="bold">{totalProjects}</Text>
                        </VStack>
                        <VStack align="center" spacing={0}>
                          <Text color="orange.500">Running</Text>
                          <Text fontWeight="bold" color="orange.500">{onGoingProjects}</Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text color="green.500">Completed</Text>
                          <Text fontWeight="bold" color="green.500">{completedProjects}</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* 3. Card Metadata & Audit Log */}
                <Card
                  shadow="md"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                >
                  <CardHeader pb={2} pt={4} px={4}>
                    <HStack spacing={2}>
                      <Icon as={FiActivity} color="secondary.500" />
                      <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                        Audit & Metadata
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody px={4} pb={4} pt={2}>
                    <VStack spacing={2.5} align="stretch" fontSize="2xs">
                      <Flex justify="space-between">
                        <Text color="gray.500">Created At:</Text>
                        <Text fontWeight="semibold">
                          {DataApplication?.createdAt ? new Date(DataApplication.createdAt).toLocaleDateString("en-US") : "-"}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Created By:</Text>
                        <Text fontWeight="semibold" noOfLines={1} maxW="120px">
                          {DataApplication?.createdBy || "-"}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Updated At:</Text>
                        <Text fontWeight="semibold">
                          {DataApplication?.updatedAt ? new Date(DataApplication.updatedAt).toLocaleDateString("en-US") : "-"}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Data Status:</Text>
                        <Badge
                          colorScheme={
                            DataApplication?.appsStatus === "ACTIVE"
                              ? "green"
                              : DataApplication?.appsStatus === "ON DEVELOPMENT"
                              ? "purple"
                              : "red"
                          }
                          fontSize="3xs"
                          rounded="md"
                        >
                          {DataApplication?.appsStatus || "ACTIVE"}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      )}
    </LayoutAdmin>
  );
}
