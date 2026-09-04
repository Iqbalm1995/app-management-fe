"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
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

  // Active Tab Index State (0: Overview, 1: Specs, 2: Governance, 3: Projects, 4: Assessment)
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    appName: "",
    appShortName: "",
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

  // Copy app code helper
  const { hasCopied, onCopy } = useClipboard(DataApplication?.appCode || "");

  // API Hooks
  const { GetDetailById, UpdateData } = useApps();
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

      showToast({
        description: "Application data successfully updated",
        statusToast: "success",
      });

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
                      colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
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
                        <Badge colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"} fontSize="3xs" rounded="md">
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
