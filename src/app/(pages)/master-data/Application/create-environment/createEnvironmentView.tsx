"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiCopy,
  FiCpu,
  FiDatabase,
  FiExternalLink,
  FiGlobe,
  FiInfo,
  FiLayers,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiServer,
  FiShield,
  FiTarget,
  FiTrash2,
  FiX,
} from "react-icons/fi";
// Components & Layout
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";

// Services & Constants
import useApps, { ApplicationMasterResponse, AppAccessOverviewResponse } from "@/app/services/useApps";
import {
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import {
  SERVER_ROLE_OPTIONS,
  SERVER_SITE_OPTIONS,
  SERVER_STATUS_OPTIONS,
  SERVER_ENVIRONMENT_OPTIONS,
  SERVER_SEGMENT_OPTIONS,
  VM_OS_OPTIONS,
} from "@/app/constants/applicationConstants";
import {
  AppServerEnvironmentItem,
  detectDcFromIp,
  ServerSupportingToolItem,
} from "@/app/(pages)/master-data/Application/detail/applicationDetail";


export interface EnvConfigItem {
  code: string;
  label: string;
  sublabel: string;
  icon: any;
  colorScheme: string;
  activeBorder: string;
  activeBgLight: string;
  activeBgDark: string;
  activeDot: string;
  cardBorderLight: string;
  iconBgLight: string;
  iconBgDark: string;
  iconColor: string;
  gradient: string;
}

export const DEFAULT_ENVIRONMENTS = [
  "Production",
  "Stagging",
  "Dev",
  "SIT",
  "UAT",
  "RnD",
] as const;

export const ENV_CONFIGS: Record<string, EnvConfigItem> = {
  Production: {
    code: "PROD",
    label: "Production",
    sublabel: "Live High Availability",
    icon: FiShield,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  Stagging: {
    code: "STG",
    label: "Stagging",
    sublabel: "Pre-Release Mirror Tier",
    icon: FiLayers,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  Dev: {
    code: "DEV",
    label: "Dev",
    sublabel: "Active Feature Sandbox",
    icon: FiCpu,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  SIT: {
    code: "SIT",
    label: "SIT",
    sublabel: "System Integration Testing",
    icon: FiActivity,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  UAT: {
    code: "UAT",
    label: "UAT",
    sublabel: "User Acceptance Testing",
    icon: FiTarget,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  RnD: {
    code: "RND",
    label: "RnD",
    sublabel: "Research & Development",
    icon: FiCompass,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  // Backward compatibility aliases
  Staging: {
    code: "STG",
    label: "Stagging",
    sublabel: "Pre-Release Mirror Tier",
    icon: FiLayers,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  Development: {
    code: "DEV",
    label: "Dev",
    sublabel: "Active Feature Sandbox",
    icon: FiCpu,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
  DRC: {
    code: "DRC",
    label: "DRC",
    sublabel: "Disaster Recovery Failover",
    icon: FiRefreshCw,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  },
};

export default function CreateEnvironmentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId") || searchParams.get("id") || "";
  const initialEnv = searchParams.get("env") || "Production";

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();

  const [tokenData, setTokenData] = useState<string>("");
  const [dataApplication, setDataApplication] = useState<ApplicationMasterResponse | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State: 1 by 1 Server Creation
  const isStandardInitial = DEFAULT_ENVIRONMENTS.some((e) =>
    initialEnv.toLowerCase() === e.toLowerCase() ||
    (e === "Dev" && initialEnv.toLowerCase().includes("dev")) ||
    (e === "Stagging" && (initialEnv.toLowerCase().includes("stag") || initialEnv.toLowerCase().includes("stg"))) ||
    (e === "SIT" && initialEnv.toLowerCase().includes("sit")) ||
    (e === "RnD" && initialEnv.toLowerCase().includes("rnd"))
  );

  const [targetEnvironment, setTargetEnvironment] = useState<string>(
    initialEnv.toLowerCase().includes("dev")
      ? "Dev"
      : initialEnv.toLowerCase().includes("stag") || initialEnv.toLowerCase().includes("stg")
      ? "Stagging"
      : initialEnv.toLowerCase().includes("sit")
      ? "SIT"
      : initialEnv.toLowerCase().includes("uat")
      ? "UAT"
      : initialEnv.toLowerCase().includes("rnd")
      ? "RnD"
      : initialEnv.toLowerCase().includes("prod")
      ? "Production"
      : initialEnv || "Production"
  );
  const [customEnvironments, setCustomEnvironments] = useState<string[]>(
    isStandardInitial || !initialEnv ? [] : [initialEnv]
  );
  const [isAddingCustomEnv, setIsAddingCustomEnv] = useState<boolean>(false);
  const [targetEnvironmentOther, setTargetEnvironmentOther] = useState<string>(
    isStandardInitial || !initialEnv ? "" : initialEnv
  );

  const handleConfirmCustomEnv = (nameToConfirm?: string) => {
    const rawName = nameToConfirm !== undefined ? nameToConfirm : targetEnvironmentOther;
    const trimmed = rawName.trim();
    if (!trimmed) return;

    if (!customEnvironments.includes(trimmed)) {
      setCustomEnvironments((prev) => [...prev, trimmed]);
    }
    handleEnvChange(trimmed);
    setTargetEnvironmentOther(trimmed);
    setIsAddingCustomEnv(false);
  };

  // Custom Site Data Center State & Confirmation Handler (matching target environment)
  const [customSites, setCustomSites] = useState<string[]>([]);
  const [isAddingCustomSite, setIsAddingCustomSite] = useState<boolean>(false);
  const [customSiteInput, setCustomSiteInput] = useState<string>("");

  const handleConfirmCustomSite = (nameToConfirm?: string) => {
    const rawName = nameToConfirm !== undefined ? nameToConfirm : customSiteInput;
    const trimmed = rawName.trim();
    if (!trimmed) return;

    if (!customSites.includes(trimmed)) {
      setCustomSites((prev) => [...prev, trimmed]);
    }
    handleSiteChange(trimmed);
    setSiteOther(trimmed);
    setDcSelectionOther(trimmed);
    setIsAddingCustomSite(false);
    setCustomSiteInput("");
  };

  const [roleServer, setRoleServer] = useState<string>("App Server");
  const [roleServerOther, setRoleServerOther] = useState<string>("");
  const [roleDetail, setRoleDetail] = useState<string>("Application Service Node");
  const [status, setStatus] = useState<"Aktif" | "Pasif" | "Non Aktif">("Aktif");

  // VM Specs
  const [namaVm, setNamaVm] = useState<string>(`VM-${initialEnv.slice(0, 3).toUpperCase()}-NODE-${Date.now().toString().slice(-4)}`);
  const [ipAddress, setIpAddress] = useState<string>("10.20.101.50");
  const [vmIpAddress, setVmIpAddress] = useState<string>("10.20.101.50");
  const [dcSelection, setDcSelection] = useState<string>("DC 1");
  const [dcSelectionOther, setDcSelectionOther] = useState<string>("");
  const [os, setOs] = useState<string>("Red Hat Enterprise Linux 9");
  const [osOther, setOsOther] = useState<string>("");
  const [cpu, setCpu] = useState<string>("4");
  const [memory, setMemory] = useState<string>("16");
  const [storage, setStorage] = useState<string>("250");
  const [note, setNote] = useState<string>("");

  // Summary & Confirmation Modal Disclosure
  const {
    isOpen: isOpenSummaryModal,
    onOpen: onOpenSummaryModal,
    onClose: onCloseSummaryModal,
  } = useDisclosure();

  // Network & Governance
  const [site, setSite] = useState<string>("DC 1");
  const [siteOther, setSiteOther] = useState<string>("");
  const [primarySite, setPrimarySite] = useState<"DC1" | "DC2" | "-">("DC1");
  const [segment, setSegment] = useState<string>("Internal App Farm");
  const [joinDomain, setJoinDomain] = useState<"Ya" | "Tidak">("Ya");
  const [hardening, setHardening] = useState<"Ya" | "Tidak">("Ya");
  const [pam, setPam] = useState<"Ya" | "Tidak">("Ya");
  const [dualDeploy, setDualDeploy] = useState<"Ya" | "Tidak">("Tidak");

  // Optional Environment Access Link & Testing Parameters
  const [envLinkUrl, setEnvLinkUrl] = useState<string>("");
  const [testUser, setTestUser] = useState<string>("");
  const [testData, setTestData] = useState<string>("");
  const [showTestingParams, setShowTestingParams] = useState<boolean>(false);

  // Aplikasi & Tools Pendukung (Per Server Node)
  const [supportingTools, setSupportingTools] = useState<ServerSupportingToolItem[]>([
    { id: "tool-1", name: "nodejs", version: "v20.x" },
    { id: "tool-2", name: "npm", version: "v10.x" },
    { id: "tool-3", name: "pm2", version: "v5.x" },
    { id: "tool-4", name: "git", version: "2.x" },
  ]);
  const [newToolName, setNewToolName] = useState<string>("");
  const [newToolVersion, setNewToolVersion] = useState<string>("");
  const [newToolYear, setNewToolYear] = useState<string>("");

  const handleAddSupportingTool = (nameToAdd?: string) => {
    const name = (nameToAdd || newToolName).trim().toLowerCase();
    if (!name) return;
    if (supportingTools.some((t) => t.name.toLowerCase() === name)) {
      toast({
        title: "Sudah Ada",
        description: `Tool "${name}" sudah terdaftar pada server node ini.`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const version = nameToAdd ? "Latest" : newToolVersion.trim() || "Latest";
    const year = nameToAdd ? undefined : (newToolYear.trim() || undefined);
    setSupportingTools((prev) => [
      ...prev,
      { id: `tool-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, name, version, year },
    ]);
    if (!nameToAdd) {
      setNewToolName("");
      setNewToolVersion("");
      setNewToolYear("");
    }
  };

  const handleRemoveSupportingTool = (id?: string, name?: string) => {
    setSupportingTools((prev) => prev.filter((t) => (id ? t.id !== id : t.name !== name)));
  };

  // API Hooks
  const { GetDetailById, GetTopologyOverview, SyncAppServers, GetAccessParameters, SyncAccessParameters } = useApps();

  // Read Token on Mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tokenData") : null;
    if (token) setTokenData(token);
  }, []);

  const initialFetchDoneRef = useRef<string>("");
  const accessDataRef = useRef<AppAccessOverviewResponse | null>(null);

  // Fetch Application Context & Access URL once per appId + tokenData
  useEffect(() => {
    if (!appId || !tokenData) return;
    const key = `${appId}-${tokenData}`;
    if (initialFetchDoneRef.current === key) return;
    initialFetchDoneRef.current = key;

    setIsLoadingApp(true);
    GetDetailById(appId, tokenData)
      .then((res) => {
        if (res && res.statusCode === RES_CODE_OK && res.data) {
          setDataApplication(res.data as ApplicationMasterResponse);
        }
      })
      .catch((e) => console.error("Failed to fetch app detail:", e))
      .finally(() => setIsLoadingApp(false));

    GetAccessParameters(appId, tokenData)
      .then((res) => {
        if (res && res.statusCode === RES_CODE_OK && res.data) {
          accessDataRef.current = res.data;
          if (targetEnvironment === "Production" && res.data.prodUrl) {
            setEnvLinkUrl(res.data.prodUrl);
          } else if ((targetEnvironment === "Development" || targetEnvironment === "Dev") && res.data.devUrl) {
            setEnvLinkUrl(res.data.devUrl);
          }
        }
      })
      .catch((e) => console.error("Failed to fetch access parameters:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, tokenData]);

  // Sync access URL when targetEnvironment is changed
  useEffect(() => {
    const access = accessDataRef.current;
    if (!access) return;
    if (targetEnvironment === "Production" && access.prodUrl) {
      setEnvLinkUrl(access.prodUrl);
    } else if ((targetEnvironment === "Development" || targetEnvironment === "Dev") && access.devUrl) {
      setEnvLinkUrl(access.devUrl);
    }
  }, [targetEnvironment]);

  // Auto-detect DC1/DC2 from IP
  const handleIpChange = (newIp: string) => {
    setIpAddress(newIp);
    setVmIpAddress(newIp);
    const detected = detectDcFromIp(newIp);
    if (detected === "DC1") {
      setPrimarySite("DC1");
      setDcSelection("DC 1");
    } else if (detected === "DC2") {
      setPrimarySite("DC2");
      setDcSelection("DC 2");
    }
  };

  // Sync default VM naming when target environment changes
  const handleEnvChange = (newEnv: string) => {
    setTargetEnvironment(newEnv);
    const prefix =
      newEnv === "Production"
        ? "PRD"
        : newEnv === "Stagging" || newEnv === "Staging"
        ? "STG"
        : newEnv === "Dev" || newEnv === "Development"
        ? "DEV"
        : newEnv === "SIT"
        ? "SIT"
        : newEnv === "UAT"
        ? "UAT"
        : newEnv === "RnD"
        ? "RND"
        : newEnv.slice(0, 3).toUpperCase();
    setNamaVm(`VM-${prefix}-NODE-${Date.now().toString().slice(-4)}`);
  };

  // Filtered default environments based on selected Site Data Center
  const availableDefaultEnvs = useMemo(() => {
    if (site === "Google Cloud" || site === "AWS Cloud") {
      return ["Production", "Dev"] as const;
    }
    return DEFAULT_ENVIRONMENTS;
  }, [site]);

  // Handle Site Data Center change with automatic environment realignment
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    if (newSite === "DC 1") {
      setPrimarySite("DC1");
      setDcSelection("DC 1");
    } else if (newSite === "DC 2") {
      setPrimarySite("DC2");
      setDcSelection("DC 2");
    } else {
      setPrimarySite("-");
      setDcSelection(newSite);
    }
    if (newSite !== "Other" && newSite !== "Other Site") {
      setSiteOther("");
      setDcSelectionOther("");
    }

    // When switching to Cloud provider, if current target environment is not in [Production, Dev] and not custom, switch to Production
    if (newSite === "Google Cloud" || newSite === "AWS Cloud") {
      const isCustom = customEnvironments.includes(targetEnvironment);
      if (!isCustom && targetEnvironment !== "Production" && targetEnvironment !== "Dev" && targetEnvironment !== "Development") {
        handleEnvChange("Production");
      }
    }
  };

  // Form Submit Handler
  // Comprehensive Input Validation
  const validateInputs = (): boolean => {
    if (!appId) {
      toast({
        title: "Parameter Error",
        description: "Application ID tidak ditemukan.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!namaVm.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Virtual Machine (VM) wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!ipAddress.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "IP Address server wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (os === "Other" && !osOther.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Operating System (OS) kustom wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!cpu.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Kapasitas CPU Core wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!memory.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Kapasitas Memory RAM wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!storage.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Kapasitas Storage Disk wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (roleServer === "Other" && !roleServerOther.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Role Server kustom wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (dcSelection === "Other" && !dcSelectionOther.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Data Center kustom wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if ((site === "Other" || site === "Other Site") && !siteOther.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Lokasi Site kustom wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const isStandardEnv = (DEFAULT_ENVIRONMENTS as readonly string[]).includes(targetEnvironment) || ["Development", "Staging"].includes(targetEnvironment);
    if (!isStandardEnv && !targetEnvironment.trim() && !targetEnvironmentOther.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Environment kustom wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  // Trigger Summary Modal
  const handleOpenSummary = () => {
    if (validateInputs()) {
      onOpenSummaryModal();
    }
  };

  // Form Submit Handler (Executed upon user confirmation in Summary Modal)
  const handleSaveEnvironmentServer = async () => {
    if (!validateInputs()) return;

    try {
      setIsSubmitting(true);

      const resolvedRole =
        roleServer === "Other" && roleServerOther.trim()
          ? roleServerOther.trim()
          : roleServer;

      const resolvedSite =
        (site === "Other" || site === "Other Site") && siteOther.trim()
          ? siteOther.trim()
          : site;

      const resolvedEnv =
        targetEnvironment === "Other" && targetEnvironmentOther.trim()
          ? targetEnvironmentOther.trim()
          : targetEnvironment;

      const resolvedOs =
        os === "Other" && osOther.trim()
          ? osOther.trim()
          : os;

      const resolvedDc =
        dcSelectionOther.trim()
          ? dcSelectionOther.trim()
          : dcSelection === "Tanpa Flag"
          ? "-"
          : dcSelection;

      const primarySiteResolved: "DC1" | "DC2" | "-" =
        dcSelection === "DC 1"
          ? "DC1"
          : dcSelection === "DC 2"
          ? "DC2"
          : "-";

      const newServerItem: AppServerEnvironmentItem = {
        id: `srv-${Date.now()}`,
        roleServer: resolvedRole,
        roleServerOther: roleServer === "Other" ? roleServerOther : undefined,
        roleDetail: roleDetail.trim() || `${resolvedRole} for ${resolvedEnv}`,
        status: status,
        ipAddress: ipAddress.trim(),
        primary: primarySiteResolved,
        site: resolvedSite,
        siteOther: (site === "Other" || site === "Other Site") ? siteOther : (dcSelectionOther.trim() ? dcSelectionOther.trim() : undefined),
        segment: segment,
        environment: resolvedEnv,
        environmentOther: targetEnvironment === "Other" ? targetEnvironmentOther : undefined,
        joinDomain: joinDomain,
        hardening: hardening,
        pam: pam,
        dualDeploy: dualDeploy,
        vmDetail: {
          namaVm: namaVm.trim(),
          ipAddress: (vmIpAddress || ipAddress).trim(),
          os: resolvedOs.trim(),
          cpu: `${cpu.replace(/\D/g, "") || "4"} CPU`,
          memory: `${memory.replace(/\D/g, "") || "16"} GB`,
          storage: `${storage.replace(/\D/g, "") || "250"} GB`,
          note: dcSelectionOther.trim()
            ? (note.trim() ? `${note.trim()} [DC: ${dcSelectionOther.trim()}]` : `DC: ${dcSelectionOther.trim()}`)
            : note.trim(),
        },
        supportingApps: supportingTools,
      };
      (newServerItem as any).dataCenter = resolvedDc;

      // 1. Load existing servers from API or LocalStorage
      let existingServers: AppServerEnvironmentItem[] = [];
      try {
        if (tokenData) {
          const topoRes = await GetTopologyOverview(appId, tokenData);
          if (topoRes && topoRes.statusCode === RES_CODE_OK && topoRes.data?.servers) {
            existingServers = topoRes.data.servers as AppServerEnvironmentItem[];
          }
        }
      } catch (e) {
        console.warn("Could not fetch remote topology, checking localStorage fallback", e);
      }

      if (existingServers.length === 0) {
        try {
          const stored = localStorage.getItem(`app_env_servers_${appId}`);
          if (stored) {
            existingServers = JSON.parse(stored);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Append new server
      const updatedServers = [...existingServers, newServerItem];

      // 3. Save to localStorage immediately
      localStorage.setItem(`app_env_servers_${appId}`, JSON.stringify(updatedServers));

      // 4. Sync to database API if authenticated
      if (tokenData) {
        try {
          await SyncAppServers(appId, updatedServers as any, tokenData);
        } catch (errSync) {
          console.error("Failed to sync server to database:", errSync);
        }

        // 5. If Access Link was provided, update access parameter
        if (envLinkUrl.trim() || testUser.trim() || testData.trim()) {
          try {
            const accessRes = await GetAccessParameters(appId, tokenData);
            const currentDevUrl = accessRes?.data?.devUrl || "";
            const currentProdUrl = accessRes?.data?.prodUrl || "";
            const currentParams = accessRes?.data?.parameters || [];

            let nextDevUrl = currentDevUrl;
            let nextProdUrl = currentProdUrl;

            if (resolvedEnv === "Production" && envLinkUrl.trim()) {
              nextProdUrl = envLinkUrl.trim();
            } else if (resolvedEnv === "Development" && envLinkUrl.trim()) {
              nextDevUrl = envLinkUrl.trim();
            }

            const updatedParams = [...currentParams];
            if (testUser.trim()) {
              const existingIdx = updatedParams.findIndex((p: any) => p.paramKey === "test_user");
              if (existingIdx >= 0) {
                updatedParams[existingIdx].paramValue = testUser.trim();
              } else {
                updatedParams.push({
                  targetEnvironment: "Dev",
                  paramCategory: "TESTING",
                  paramLabel: "Test User",
                  paramKey: "test_user",
                  paramValue: testUser.trim(),
                  fieldType: "textarea",
                  displayOrder: 1,
                });
              }
            }

            if (testData.trim()) {
              const existingIdx = updatedParams.findIndex((p: any) => p.paramKey === "test_data");
              if (existingIdx >= 0) {
                updatedParams[existingIdx].paramValue = testData.trim();
              } else {
                updatedParams.push({
                  targetEnvironment: "Dev",
                  paramCategory: "TESTING",
                  paramLabel: "Test Data",
                  paramKey: "test_data",
                  paramValue: testData.trim(),
                  fieldType: "text",
                  displayOrder: 2,
                });
              }
            }

            await SyncAccessParameters(
              appId,
              {
                devUrl: nextDevUrl,
                prodUrl: nextProdUrl,
                parameters: updatedParams as any,
              },
              tokenData
            );
          } catch (e) {
            console.error("Failed to update access parameters:", e);
          }
        }
      }

      toast({
        title: "Server Node Berhasil Dibuat",
        description: `Server ${namaVm} telah ditambahkan ke environment ${resolvedEnv}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Route back to Application Detail page
      router.push(`/master-data/Application/detail?id=${appId}`);
    } catch (err: any) {
      console.error("Error creating server environment node:", err);
      toast({
        title: "Gagal Menambahkan Server",
        description: err?.message || "Terjadi kesalahan saat menyimpan data server node.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProd = targetEnvironment === "Production";
  const isDev = targetEnvironment === "Development";

  const activeMeta = ENV_CONFIGS[targetEnvironment] || {
    code: targetEnvironment === "Other" ? "CUSTOM" : (targetEnvironment.length <= 4 ? targetEnvironment.toUpperCase() : targetEnvironment.slice(0, 4).toUpperCase()),
    label: targetEnvironment === "Other" ? (targetEnvironmentOther || "Custom Environment") : targetEnvironment,
    sublabel: "Custom Environment Node",
    icon: FiGlobe,
    colorScheme: "blue",
    activeBorder: "blue.500",
    activeBgLight: "#eff6ff",
    activeBgDark: "rgba(59, 130, 246, 0.15)",
    activeDot: "#2563eb",
    cardBorderLight: "#bfdbfe",
    iconBgLight: "#dbeafe",
    iconBgDark: "rgba(59, 130, 246, 0.2)",
    iconColor: "#1d4ed8",
    gradient: "linear(to-br, secondary.800, secondary.600)",
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Tambah Server Environment"
        breadCrumb={[
          "Home",
          "Master Data",
          "Application",
          dataApplication?.appName || dataApplication?.appCode || "Detail",
          "Tambah Environment",
        ]}
      />

      <Box px={{ base: 2, md: 4 }} py={2} w="full">
        {/* ── HERO BANNER: CREATE SERVER NODE (With Integrated Back Button & Target Selector) ── */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.600)"
          color="white"
          px={{ base: 5, md: 6 }}
          py={{ base: 5, md: 6 }}
          mb={5}
          rounded="xl"
          position="relative"
          overflow="hidden"
          shadow="sm"
          w="full"
          transition="all 0.3s ease"
        >
          {/* Subtle Ambient Shapes */}
          <Box position="absolute" top="-20px" right="-20px" w="140px" h="140px" bg="whiteAlpha.100" rounded="full" pointerEvents="none" />
          <Box position="absolute" bottom="-30px" right="160px" w="100px" h="100px" bg="whiteAlpha.080" transform="rotate(45deg)" pointerEvents="none" />

          <VStack align="stretch" spacing={4} position="relative" zIndex={1}>
            {/* Top Row: Back Button, Title & App Info */}
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={3}>
              <HStack spacing={{ base: 3, md: 4 }} align="start" flex={1}>
                {/* Back Button (Frosted Glass, matching applicationDetail & add pages) */}
                <Tooltip label="Kembali ke Detail Aplikasi" hasArrow placement="top">
                  <IconButton
                    aria-label="Kembali ke Detail Aplikasi"
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
                    onClick={() => router.push(appId ? `/master-data/Application/detail?id=${appId}` : "/master-data/Application")}
                    transition="all 0.2s ease"
                    flexShrink={0}
                    mt={1}
                  />
                </Tooltip>

                <VStack align="start" spacing={1}>
                  <HStack spacing={2} wrap="wrap">
                    <Tag size="sm" bg="whiteAlpha.300" color="white" rounded="md" px={2.5} py={0.5}>
                      <TagLabel fontWeight="extrabold" textTransform="uppercase" fontSize="xs">
                        {dataApplication?.appShortName || "KOBRA"} &bull; {dataApplication?.appName || "Application"}
                      </TagLabel>
                    </Tag>
                    {dataApplication?.appsStatus && (
                      <Badge
                        colorScheme={dataApplication.appsStatus === "ACTIVE" ? "green" : "orange"}
                        px={2}
                        py={0.5}
                        rounded="md"
                        fontSize="xs"
                      >
                        {dataApplication.appsStatus}
                      </Badge>
                    )}
                  </HStack>

                  <Heading size="md" fontWeight="800" letterSpacing="tight">
                    Tambah Server Environment Node
                  </Heading>

                  <Text fontSize="xs" color="whiteAlpha.900" maxW="2xl" lineHeight="short">
                    Pilih target environment di bawah ini, lalu lengkapi konfigurasi VM, IP address, peran server, dan parameter keamanan.
                  </Text>
                </VStack>
              </HStack>

              <Box
                p={2.5}
                rounded="lg"
                bg="whiteAlpha.200"
                border="1px solid"
                borderColor="whiteAlpha.300"
                display={{ base: "none", md: "block" }}
              >
                <Icon as={activeMeta.icon} boxSize={6} color="white" />
              </Box>
            </Flex>

            {/* Stacked Vertical Header: 1. Site Data Center -> 2. Target Environment */}
            <VStack spacing={3} align="stretch" w="full">
              {/* STACK 1: Site Data Center Selection */}
              <Box
                bg="blackAlpha.200"
                p={3}
                rounded="lg"
                border="1px solid"
                borderColor="whiteAlpha.300"
                backdropFilter="blur(6px)"
              >
                <Flex justify="space-between" align="center" mb={2.5} wrap="wrap" gap={2}>
                  <HStack spacing={2} wrap="wrap">
                    <Icon as={FiDatabase} color="white" boxSize={4} />
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="whiteAlpha.900">
                      1. Site Data Center / Cloud Provider:
                    </Text>
                    <Tag size="sm" bg="white" color="blue.800" rounded="md" px={2.5} shadow="xs">
                      <TagLabel fontSize="xs" fontWeight="bold">
                        Aktif: {site}
                      </TagLabel>
                    </Tag>
                  </HStack>

                  {/* Custom Site Toggle Button */}
                  <Button
                    size="xs"
                    variant={isAddingCustomSite ? "solid" : "outline"}
                    bg={isAddingCustomSite ? "white" : "transparent"}
                    color={isAddingCustomSite ? "blue.800" : "white"}
                    borderColor="whiteAlpha.400"
                    _hover={{ bg: isAddingCustomSite ? "gray.100" : "whiteAlpha.300" }}
                    rounded="md"
                    fontSize="xs"
                    leftIcon={isAddingCustomSite ? <FiX /> : <FiPlus />}
                    onClick={() => {
                      setIsAddingCustomSite(!isAddingCustomSite);
                      if (!isAddingCustomSite) {
                        setCustomSiteInput("");
                      }
                    }}
                  >
                    {isAddingCustomSite ? "Tutup Input Kustom" : "+ Custom Site"}
                  </Button>
                </Flex>

                <SimpleGrid
                  columns={{
                    base: 2,
                    sm: (SERVER_SITE_OPTIONS.filter((s) => s !== "Other").length + customSites.length) <= 3 ? 3 : 3,
                    md: (SERVER_SITE_OPTIONS.filter((s) => s !== "Other").length + customSites.length) <= 4 ? 4 : 5,
                    xl: 5,
                  }}
                  spacing={2}
                  w="full"
                >
                  {SERVER_SITE_OPTIONS.filter((s) => s !== "Other").map((siteOpt) => {
                    const isSelected = site === siteOpt;
                    return (
                      <Box
                        key={siteOpt}
                        as="button"
                        type="button"
                        onClick={() => handleSiteChange(siteOpt)}
                        px={3}
                        py={2}
                        rounded="md"
                        textAlign="left"
                        border="1px solid"
                        borderColor={isSelected ? "white" : "whiteAlpha.300"}
                        bg={isSelected ? "white" : "whiteAlpha.150"}
                        color={isSelected ? "blue.800" : "white"}
                        shadow={isSelected ? "sm" : "none"}
                        transition="all 0.18s ease"
                        _hover={{
                          bg: isSelected ? "white" : "whiteAlpha.250",
                          borderColor: "white",
                          transform: "translateY(-1px)",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                      >
                        <Flex align="center" justify="space-between" mb={0.5}>
                          <Text fontSize="xs" fontWeight="extrabold">
                            {siteOpt}
                          </Text>
                          {isSelected && (
                            <Icon as={FiCheckCircle} boxSize={3.5} color="blue.600" />
                          )}
                        </Flex>
                        <Text fontSize="2xs" color={isSelected ? "blue.600" : "whiteAlpha.800"}>
                          {siteOpt === "DC 1" || siteOpt === "DC 2"
                            ? "On-Premise DC"
                            : "Public Cloud"}
                        </Text>
                      </Box>
                    );
                  })}

                  {/* Confirmed Custom Site Cards */}
                  {customSites.map((customSite) => {
                    const isSelected = site === customSite;
                    const code = customSite.length <= 4 ? customSite.toUpperCase() : customSite.slice(0, 4).toUpperCase();
                    return (
                      <Box
                        key={customSite}
                        as="button"
                        type="button"
                        onClick={() => handleSiteChange(customSite)}
                        px={3}
                        py={2}
                        rounded="md"
                        textAlign="left"
                        border="1px solid"
                        borderColor={isSelected ? "white" : "whiteAlpha.300"}
                        bg={isSelected ? "white" : "whiteAlpha.150"}
                        color={isSelected ? "blue.800" : "white"}
                        shadow={isSelected ? "sm" : "none"}
                        transition="all 0.18s ease"
                        position="relative"
                        _hover={{
                          bg: isSelected ? "white" : "whiteAlpha.250",
                          borderColor: "white",
                          transform: "translateY(-1px)",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                      >
                        <Flex align="center" justify="space-between" mb={0.5}>
                          <HStack spacing={1.5}>
                            <Icon as={FiDatabase} boxSize={3.5} color={isSelected ? "blue.600" : "whiteAlpha.900"} />
                            <Text fontSize="xs" fontWeight="bold">
                              {code}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            {isSelected && (
                              <Icon as={FiCheckCircle} boxSize={3.5} color="blue.600" />
                            )}
                            <IconButton
                              aria-label="Hapus custom site"
                              icon={<FiX />}
                              size="xs"
                              variant="ghost"
                              color={isSelected ? "gray.500" : "whiteAlpha.700"}
                              _hover={{ color: "red.500" }}
                              minW="18px"
                              h="18px"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomSites((prev) => prev.filter((s) => s !== customSite));
                                if (site === customSite) {
                                  handleSiteChange("DC 1");
                                }
                              }}
                            />
                          </HStack>
                        </Flex>
                        <Text
                          fontSize="xs"
                          fontWeight="800"
                          lineHeight="short"
                          noOfLines={1}
                          color={isSelected ? "blue.800" : "white"}
                        >
                          {customSite}
                        </Text>
                        <Text
                          fontSize="2xs"
                          color={isSelected ? "blue.600" : "whiteAlpha.800"}
                          noOfLines={1}
                        >
                          Custom Site
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {/* Custom Site Input Form (Press Tab or Enter to confirm) */}
                {isAddingCustomSite && (
                  <Box mt={3} pt={2.5} borderTop="1px dashed" borderColor="whiteAlpha.400">
                    <FormControl isRequired>
                      <HStack justify="space-between" mb={1}>
                        <FormLabel fontSize="xs" fontWeight="bold" color="white" mb={0}>
                          Nama Data Center / Cloud Kustom (Tekan Tab atau Enter untuk konfirmasi)
                        </FormLabel>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          Tekan <b>Tab</b> atau <b>Enter</b> untuk menyimpan
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Input
                          size="sm"
                          rounded="md"
                          bg="white"
                          color="gray.900"
                          _placeholder={{ color: "gray.400" }}
                          placeholder="Contoh: Azure Cloud, DC Surabaya, Alibaba Cloud..."
                          value={customSiteInput}
                          onChange={(e) => setCustomSiteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              if (customSiteInput.trim()) {
                                e.preventDefault();
                                handleConfirmCustomSite();
                              }
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          colorScheme="blue"
                          bg="white"
                          color="blue.700"
                          _hover={{ bg: "gray.100" }}
                          fontWeight="bold"
                          onClick={() => handleConfirmCustomSite()}
                          isDisabled={!customSiteInput.trim()}
                        >
                          Simpan
                        </Button>
                      </HStack>
                    </FormControl>
                  </Box>
                )}
              </Box>

              {/* STACK 2: Target Environment Selection (Conditioned by Site Data Center) */}
              <Box
                bg="blackAlpha.200"
                p={3}
                rounded="lg"
                border="1px solid"
                borderColor="whiteAlpha.300"
                backdropFilter="blur(6px)"
              >
                <Flex justify="space-between" align="center" mb={2.5} wrap="wrap" gap={2}>
                  <HStack spacing={2}>
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="whiteAlpha.900">
                      2. Pilih Target Environment:
                    </Text>
                    <Tag size="sm" bg="white" color="blue.800" rounded="md" px={2.5} shadow="xs">
                      <TagLabel fontSize="xs" fontWeight="bold">
                        Aktif: {targetEnvironment} ({activeMeta.code})
                      </TagLabel>
                    </Tag>
                  </HStack>

                  {/* Custom Environment Toggle */}
                  <Button
                    size="xs"
                    variant={isAddingCustomEnv ? "solid" : "outline"}
                    bg={isAddingCustomEnv ? "white" : "transparent"}
                    color={isAddingCustomEnv ? "blue.800" : "white"}
                    borderColor="whiteAlpha.400"
                    _hover={{ bg: isAddingCustomEnv ? "gray.100" : "whiteAlpha.300" }}
                    rounded="md"
                    fontSize="xs"
                    leftIcon={isAddingCustomEnv ? <FiX /> : <FiGlobe />}
                    onClick={() => {
                      setIsAddingCustomEnv(!isAddingCustomEnv);
                      if (!isAddingCustomEnv) {
                        setTargetEnvironmentOther("");
                      }
                    }}
                  >
                    {isAddingCustomEnv ? "Tutup Input Kustom" : "+ Custom Environment"}
                  </Button>
                </Flex>

                {/* Responsive environment cards (Filtered by Site + Confirmed Custom Cards) */}
                <SimpleGrid
                  columns={{
                    base: 2,
                    sm: (availableDefaultEnvs.length + customEnvironments.length) <= 3 ? 3 : 3,
                    md: (availableDefaultEnvs.length + customEnvironments.length) <= 4 ? 4 : 6,
                    xl: 6,
                  }}
                  spacing={2}
                  w="full"
                >
                  {availableDefaultEnvs.map((envOption) => {
                    const isSelected =
                      targetEnvironment === envOption ||
                      (envOption === "Dev" && targetEnvironment === "Development") ||
                      (envOption === "Stagging" && targetEnvironment === "Staging");
                    const cfg = ENV_CONFIGS[envOption] || {
                      code: envOption.slice(0, 3).toUpperCase(),
                      label: envOption,
                      sublabel: "Environment Tier",
                      icon: FiLayers,
                    };

                    return (
                      <Box
                        key={envOption}
                        as="button"
                        type="button"
                        onClick={() => handleEnvChange(envOption)}
                        px={3}
                        py={2}
                        rounded="md"
                        textAlign="left"
                        border="1px solid"
                        borderColor={isSelected ? "white" : "whiteAlpha.300"}
                        bg={isSelected ? "white" : "whiteAlpha.150"}
                        color={isSelected ? "blue.800" : "white"}
                        shadow={isSelected ? "sm" : "none"}
                        transition="all 0.18s ease"
                        _hover={{
                          bg: isSelected ? "white" : "whiteAlpha.250",
                          borderColor: "white",
                          transform: "translateY(-1px)",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                      >
                        <Flex align="center" justify="space-between" mb={1}>
                          <HStack spacing={1.5}>
                            <Icon as={cfg.icon} boxSize={3.5} color={isSelected ? "blue.600" : "whiteAlpha.900"} />
                            <Text fontSize="xs" fontWeight="bold">
                              {cfg.code}
                            </Text>
                          </HStack>
                          {isSelected && (
                            <HStack spacing={1} align="center">
                              <Badge
                                display="inline-flex"
                                alignItems="center"
                                gap={1}
                                colorScheme={status === "Aktif" ? "green" : status === "Non Aktif" ? "red" : "gray"}
                                fontSize="3xs"
                                px={1.5}
                                py={0.5}
                                rounded="full"
                                fontWeight="bold"
                              >
                                <Box
                                  w="6px"
                                  h="6px"
                                  rounded="full"
                                  bg={status === "Aktif" ? "green.500" : status === "Non Aktif" ? "red.500" : "gray.400"}
                                />
                                {status}
                              </Badge>
                              <Icon as={FiCheckCircle} boxSize={3.5} color="blue.600" />
                            </HStack>
                          )}
                        </Flex>
                        <Text
                          fontSize="xs"
                          fontWeight="800"
                          lineHeight="short"
                          noOfLines={1}
                          color={isSelected ? "blue.800" : "white"}
                        >
                          {cfg.label}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={isSelected ? "blue.600" : "whiteAlpha.800"}
                          noOfLines={1}
                        >
                          {cfg.sublabel}
                        </Text>
                      </Box>
                    );
                  })}

                  {/* Confirmed Custom Environment Cards */}
                  {customEnvironments.map((customEnv) => {
                    const isSelected = targetEnvironment === customEnv;
                    const code = customEnv.length <= 4 ? customEnv.toUpperCase() : customEnv.slice(0, 4).toUpperCase();
                    return (
                      <Box
                        key={customEnv}
                        as="button"
                        type="button"
                        onClick={() => handleEnvChange(customEnv)}
                        px={3}
                        py={2}
                        rounded="md"
                        textAlign="left"
                        border="1px solid"
                        borderColor={isSelected ? "white" : "whiteAlpha.300"}
                        bg={isSelected ? "white" : "whiteAlpha.150"}
                        color={isSelected ? "blue.800" : "white"}
                        shadow={isSelected ? "sm" : "none"}
                        transition="all 0.18s ease"
                        position="relative"
                        _hover={{
                          bg: isSelected ? "white" : "whiteAlpha.250",
                          borderColor: "white",
                          transform: "translateY(-1px)",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                      >
                        <Flex align="center" justify="space-between" mb={1}>
                          <HStack spacing={1.5}>
                            <Icon as={FiGlobe} boxSize={3.5} color={isSelected ? "blue.600" : "whiteAlpha.900"} />
                            <Text fontSize="xs" fontWeight="bold">
                              {code}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            {isSelected && (
                              <>
                                <Badge
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                  colorScheme={status === "Aktif" ? "green" : status === "Non Aktif" ? "red" : "gray"}
                                  fontSize="3xs"
                                  px={1.5}
                                  py={0.5}
                                  rounded="full"
                                  fontWeight="bold"
                                >
                                  <Box
                                    w="6px"
                                    h="6px"
                                    rounded="full"
                                    bg={status === "Aktif" ? "green.500" : status === "Non Aktif" ? "red.500" : "gray.400"}
                                  />
                                  {status}
                                </Badge>
                                <Icon as={FiCheckCircle} boxSize={3.5} color="blue.600" />
                              </>
                            )}
                            <IconButton
                              aria-label="Hapus custom environment"
                              icon={<FiX />}
                              size="xs"
                              variant="ghost"
                              color={isSelected ? "gray.500" : "whiteAlpha.700"}
                              _hover={{ color: "red.500" }}
                              minW="18px"
                              h="18px"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomEnvironments((prev) => prev.filter((c) => c !== customEnv));
                                if (targetEnvironment === customEnv) {
                                  handleEnvChange("Production");
                                }
                              }}
                            />
                          </HStack>
                        </Flex>
                        <Text
                          fontSize="xs"
                          fontWeight="800"
                          lineHeight="short"
                          noOfLines={1}
                          color={isSelected ? "blue.800" : "white"}
                        >
                          {customEnv}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={isSelected ? "blue.600" : "whiteAlpha.800"}
                          noOfLines={1}
                        >
                          Custom Environment
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {isAddingCustomEnv && (
                  <Box mt={3} pt={2.5} borderTop="1px dashed" borderColor="whiteAlpha.400">
                    <FormControl isRequired>
                      <HStack justify="space-between" mb={1}>
                        <FormLabel fontSize="xs" fontWeight="bold" color="white" mb={0}>
                          Nama Environment Kustom (Tekan Tab atau Enter untuk konfirmasi)
                        </FormLabel>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          Tekan <b>Tab</b> atau <b>Enter</b> untuk menyimpan
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Input
                          size="sm"
                          rounded="md"
                          bg="white"
                          color="gray.900"
                          _placeholder={{ color: "gray.400" }}
                          placeholder="Contoh: Hotfix, Sandbox, Pre-DRC, QA-Automated..."
                          value={targetEnvironmentOther}
                          onChange={(e) => setTargetEnvironmentOther(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              if (targetEnvironmentOther.trim()) {
                                e.preventDefault();
                                handleConfirmCustomEnv();
                              }
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          colorScheme="blue"
                          bg="white"
                          color="blue.700"
                          _hover={{ bg: "gray.100" }}
                          fontWeight="bold"
                          onClick={() => handleConfirmCustomEnv()}
                          isDisabled={!targetEnvironmentOther.trim()}
                        >
                          Simpan
                        </Button>
                      </HStack>
                    </FormControl>
                  </Box>
                )}
              </Box>
            </VStack>
          </VStack>
        </Box>


        {/* ── 1 MAIN CONTAINER ENCLOSING TARGET TILL URL LINK AKSES ── */}
        <Box
          w="full"
          rounded="xl"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "white"}
          p={{ base: 4, md: 5 }}
          shadow="sm"
        >
          <VStack spacing={4} align="stretch" w="full">
            {/* ════════════════════════════════════════════════════════════
                CARD SECTION 1: PERAN & STATUS SERVER
                ════════════════════════════════════════════════════════════ */}
            <Box
              as="section"
              rounded="lg"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
              p={{ base: 4, md: 5 }}
              shadow="none"
            >
              <Flex justify="space-between" align={{ base: "start", sm: "center" }} mb={5} direction={{ base: "column", sm: "row" }} gap={2}>
                <HStack spacing={2.5}>
                  <Box
                    p={2}
                    rounded="lg"
                    bg={isDark ? activeMeta.iconBgDark : activeMeta.iconBgLight}
                    color={activeMeta.iconColor}
                    transition="all 0.25s ease"
                  >
                    <Icon as={activeMeta.icon} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0.5}>
                    <Heading size="sm" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                      1. Peran & Status Server
                    </Heading>
                    <Text fontSize="xs" color="gray.500">
                      Tentukan peran operasional server, status ketersediaan, dan redundansi high availability (HA).
                    </Text>
                  </VStack>
                </HStack>

                <Badge
                  colorScheme={activeMeta.colorScheme}
                  variant="subtle"
                  px={2.5}
                  py={1}
                  rounded="md"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  Target: {targetEnvironment} ({activeMeta.code})
                </Badge>
              </Flex>
              <VStack spacing={5} align="stretch" w="full">
              {/* Role Server - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Role Server</FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="lg"
                  value={roleServer}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoleServer(val);
                    if (val !== "Other") setRoleServerOther("");
                  }}
                >
                  {SERVER_ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </ChakraSelect>
                {roleServer === "Other" && (
                  <Input
                    mt={2}
                    size="md"
                    rounded="lg"
                    placeholder="Ketik role server custom"
                    value={roleServerOther}
                    onChange={(e) => setRoleServerOther(e.target.value)}
                  />
                )}
              </FormControl>

              {/* Status Server - Vertical */}
              <FormControl isRequired>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <FormLabel fontSize="xs" fontWeight="bold" mb={0}>Status Server</FormLabel>
                  <Badge
                    colorScheme={status === "Aktif" ? "green" : status === "Non Aktif" ? "red" : "gray"}
                    px={2.5}
                    py={0.5}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {status}
                  </Badge>
                </Flex>
                <ChakraSelect
                  size="md"
                  rounded="lg"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Aktif" | "Pasif" | "Non Aktif")}
                >
                  {SERVER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>

              {/* Role Server Detail - Vertical */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Role Server Detail & Deskripsi Fungsi
                </FormLabel>
                <Textarea
                  rows={3}
                  size="md"
                  rounded="lg"
                  placeholder="Contoh: Reverse proxy Nginx dengan SSL Termination & load balancer front-end..."
                  value={roleDetail}
                  onChange={(e) => setRoleDetail(e.target.value)}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Deskripsi.
                </FormHelperText>
              </FormControl>
            </VStack>
          </Box>

            {/* ════════════════════════════════════════════════════════════
                CARD SECTION 2: VIRTUAL MACHINE (VM) SPECIFICATION
                ════════════════════════════════════════════════════════════ */}
            <Box
              as="section"
              rounded="lg"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
              p={{ base: 4, md: 5 }}
              shadow="none"
            >
            <HStack spacing={2.5} mb={5}>
              <Box p={2} rounded="lg" bg={isDark ? "blue.900" : "blue.50"} color="blue.600">
                <Icon as={FiCpu} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0.5}>
                <Heading size="sm" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                  2. Virtual Machine (VM) Specification
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Konfigurasi kapasitas CPU, RAM, disk storage, dan sistem operasi VM.
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={5} align="stretch" w="full">
              {/* Nama VM Node - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Nama VM Node</FormLabel>
                <Input
                  size="md"
                  rounded="lg"
                  fontFamily="mono"
                  placeholder="Contoh: VM-PRD-NODE-01"
                  value={namaVm}
                  onChange={(e) => setNamaVm(e.target.value)}
                />
              </FormControl>

              {/* IP Address - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">IP Address</FormLabel>
                <Input
                  size="md"
                  rounded="lg"
                  fontFamily="mono"
                  placeholder="Contoh: 10.20.101.50"
                  value={ipAddress}
                  onChange={(e) => handleIpChange(e.target.value)}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Auto Detect
                </FormHelperText>
              </FormControl>

              {/* Data Center (DC 1 / DC 2 / Other) - Vertical */}

              {/* Operating System (OS) - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Operating System (OS)</FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="lg"
                  value={
                    VM_OS_OPTIONS.filter((o) => o !== "Other").includes(os as any)
                      ? os
                      : (os ? "Other" : "")
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setOs("Other");
                      setOsOther("");
                    } else {
                      setOs(val);
                      setOsOther("");
                    }
                  }}
                >
                  {VM_OS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </ChakraSelect>
                {(os === "Other" || (!VM_OS_OPTIONS.filter((o) => o !== "Other").includes(os as any) && os !== "")) && (
                  <Input
                    mt={2}
                    size="md"
                    rounded="lg"
                    placeholder="Ketik nama OS kustom..."
                    value={osOther}
                    onChange={(e) => setOsOther(e.target.value)}
                  />
                )}
              </FormControl>

              {/* CPU Core - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">CPU Core</FormLabel>
                <InputGroup size="md">
                  <Input
                    rounded="lg"
                    type="number"
                    placeholder="CPU"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                  />
                  <InputRightAddon roundedRight="lg" fontSize="xs" fontWeight="bold">
                    vCPU
                  </InputRightAddon>
                </InputGroup>
              </FormControl>

              {/* Memory RAM - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Memory RAM</FormLabel>
                <InputGroup size="md">
                  <Input
                    rounded="lg"
                    type="number"
                    placeholder="... GB"
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                  />
                  <InputRightAddon roundedRight="lg" fontSize="xs" fontWeight="bold">
                    GB
                  </InputRightAddon>
                </InputGroup>
              </FormControl>

              {/* Storage Disk - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Storage Disk</FormLabel>
                <InputGroup size="md">
                  <Input
                    rounded="lg"
                    type="number"
                    placeholder="... GB"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                  />
                  <InputRightAddon roundedRight="lg" fontSize="xs" fontWeight="bold">
                    GB
                  </InputRightAddon>
                </InputGroup>
              </FormControl>

              {/* Catatan Teknis VM - Vertical */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Catatan Teknis VM</FormLabel>
                <Textarea
                  rows={3}
                  size="md"
                  rounded="lg"
                  placeholder="Catatan tambahan spesifikasi, storage mount, partition..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </FormControl>
            </VStack>
          </Box>

            {/* ════════════════════════════════════════════════════════════
                CARD SECTION 3: NETWORK, SECURITY & GOVERNANCE
                ════════════════════════════════════════════════════════════ */}
            <Box
              as="section"
              rounded="lg"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
              p={{ base: 4, md: 5 }}
              shadow="none"
            >
            <HStack spacing={2.5} mb={5}>
              <Box p={2} rounded="lg" bg="blue.50" color="blue.600">
                <Icon as={FiGlobe} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0.5}>
                <Heading size="sm" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                  3. Network, Security & Governance
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Penempatan data center, segmen jaringan, dan kepatuhan security posture.
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={5} align="stretch" w="full">
              {/* Site Data Center Display (Configured in Header) */}
              <Box p={3} rounded="lg" bg={isDark ? "gray.750" : "gray.50"} border="1px dashed" borderColor={isDark ? "gray.700" : "gray.200"}>
                <HStack justify="space-between" fontSize="xs">
                  <HStack spacing={2}>
                    <Icon as={FiDatabase} color={isDark ? "blue.400" : "blue.600"} boxSize={3.5} />
                    <Text color="gray.500" fontWeight="medium">Site Data Center / Cloud Provider:</Text>
                  </HStack>
                  <Badge colorScheme={site === "DC 1" ? "blue" : site === "DC 2" ? "purple" : "cyan"} px={2.5} py={1} rounded="md" fontWeight="bold">
                    {(site === "Other" || site === "Other Site") ? (siteOther || "Other") : site}
                  </Badge>
                </HStack>
              </Box>


              {/* Site Segment - Vertical */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Segment</FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="lg"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                >
                  <option value="Internal App Farm">Internal App Farm</option>
                  <option value="DMZ Web Tier">DMZ Web Tier</option>
                  <option value="Database Secure Zone">Database Secure Zone</option>
                  <option value="Middleware & Integration">Middleware & Integration</option>
                  <option value="Management & Monitoring">Management & Monitoring</option>
                  <option value="Other">Other</option>
                </ChakraSelect>
              </FormControl>

              {/* Domain Joining - Vertical */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Domain Joining</FormLabel>
                <RadioGroup value={joinDomain} onChange={(val: "Ya" | "Tidak") => setJoinDomain(val)}>
                  <HStack spacing={6} mt={1}>
                    <Radio value="Ya" colorScheme="blue"><Text fontSize="xs">Ya</Text></Radio>
                    <Radio value="Tidak" colorScheme="gray"><Text fontSize="xs">Tidak</Text></Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {/* Hardening - Vertical */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Hardening</FormLabel>
                <RadioGroup value={hardening} onChange={(val: "Ya" | "Tidak") => setHardening(val)}>
                  <HStack spacing={6} mt={1}>
                    <Radio value="Ya" colorScheme="blue"><Text fontSize="xs">Ya</Text></Radio>
                    <Radio value="Tidak" colorScheme="gray"><Text fontSize="xs">Tidak</Text></Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {/* PAM Integration - Vertical */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">PAM Integration</FormLabel>
                <RadioGroup value={pam} onChange={(val: "Ya" | "Tidak") => setPam(val)}>
                  <HStack spacing={6} mt={1}>
                    <Radio value="Ya" colorScheme="blue"><Text fontSize="xs">Ya</Text></Radio>
                    <Radio value="Tidak" colorScheme="gray"><Text fontSize="xs">Tidak</Text></Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </Box>

            {/* ════════════════════════════════════════════════════════════
                CARD SECTION 4: APLIKASI & TOOLS PENDUKUNG (PER SERVER NODE)
                ════════════════════════════════════════════════════════════ */}
            <Box
              as="section"
              rounded="lg"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
              p={{ base: 4, md: 5 }}
              shadow="none"
            >
              <HStack spacing={2.5} mb={4}>
                <Box p={2} rounded="lg" bg={isDark ? "blue.900" : "blue.50"} color="blue.600">
                  <Icon as={FiLayers} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0.5}>
                  <HStack spacing={2}>
                    <Heading size="sm" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                      4. Aplikasi & Tools Pendukung Server
                    </Heading>
                    <Badge colorScheme="blue" fontSize="xs" rounded="md" px={2} py={0.5}>
                      {supportingTools.length} Terdaftar
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Daftar developer tools, runtime, dan package pendukung yang terpasang pada node ini (misalnya: nodejs, npm, pm2, git, docker, nginx).
                  </Text>
                </VStack>
              </HStack>

              {/* Quick Add Presets */}
              <Box mb={4} p={3} rounded="lg" bg={isDark ? "gray.750" : "gray.50"} border="1px dashed" borderColor={isDark ? "gray.650" : "gray.200"}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wider">
                  Preset Cepat (Klik untuk memilih tool, lalu lengkapi versi & tahun di bawah):
                </Text>
                <Wrap spacing={2}>
                  {["nodejs", "npm", "pm2", "git", "docker", "nginx", "python", "java", "redis"].map((preset) => {
                    const isAdded = supportingTools.some((t) => t.name.toLowerCase() === preset.toLowerCase());
                    const isSelected = newToolName.toLowerCase() === preset.toLowerCase();
                    return (
                      <WrapItem key={preset}>
                        <Button
                          size="xs"
                          variant={isAdded ? "solid" : isSelected ? "solid" : "outline"}
                          colorScheme={isSelected ? "cyan" : "blue"}
                          rounded="md"
                          leftIcon={isAdded ? <FiCheckCircle /> : isSelected ? <FiCheckCircle /> : <FiPlus />}
                          onClick={() => {
                            setNewToolName(preset);
                            const verInput = document.getElementById("input-tool-version") as HTMLInputElement;
                            if (verInput) verInput.focus();
                          }}
                          isDisabled={isAdded}
                        >
                          {preset}
                        </Button>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </Box>

              {/* Custom Add Tool Input Form */}
              <SimpleGrid columns={{ base: 1, sm: 12 }} spacing={3} mb={4} alignItems="end">
                <Box gridColumn={{ base: "span 12", sm: "span 5" }}>
                  <FormLabel fontSize="xs" fontWeight="bold">Nama Tool / Aplikasi</FormLabel>
                  <Input
                    id="input-tool-name"
                    size="sm"
                    rounded="lg"
                    placeholder="Contoh: pm2, nodejs, git, kong..."
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSupportingTool();
                      }
                    }}
                  />
                </Box>
                <Box gridColumn={{ base: "span 12", sm: "span 3" }}>
                  <FormLabel fontSize="xs" fontWeight="bold">Versi (Opsional)</FormLabel>
                  <Input
                    id="input-tool-version"
                    size="sm"
                    rounded="lg"
                    placeholder="Contoh: v20.x, 5.3.0, Latest"
                    value={newToolVersion}
                    onChange={(e) => setNewToolVersion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSupportingTool();
                      }
                    }}
                  />
                </Box>
                <Box gridColumn={{ base: "span 12", sm: "span 2" }}>
                  <FormLabel fontSize="xs" fontWeight="bold">Tahun</FormLabel>
                  <Input
                    id="input-tool-year"
                    size="sm"
                    rounded="lg"
                    placeholder="YYYY"
                    maxLength={4}
                    value={newToolYear}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setNewToolYear(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSupportingTool();
                      }
                    }}
                  />
                </Box>
                <Box gridColumn={{ base: "span 12", sm: "span 2" }}>
                  <Button
                    size="sm"
                    w="full"
                    colorScheme="blue"
                    rounded="lg"
                    leftIcon={<FiPlus />}
                    onClick={() => handleAddSupportingTool()}
                    isDisabled={!newToolName.trim()}
                  >
                    Tambah
                  </Button>
                </Box>
              </SimpleGrid>

              {/* Active Installed Tools Chips List */}
              <Box pt={2} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                  Tools yang Terpasang pada Server Node Ini:
                </Text>
                {supportingTools.length === 0 ? (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">
                    Belum ada tools pendukung yang ditambahkan.
                  </Text>
                ) : (
                  <Wrap spacing={2.5}>
                    {supportingTools.map((tool) => (
                      <WrapItem key={tool.id}>
                        <Tag
                          size="md"
                          rounded="lg"
                          variant="subtle"
                          colorScheme="blue"
                          py={1.5}
                          px={3}
                          border="1px solid"
                          borderColor={isDark ? "blue.700" : "blue.200"}
                        >
                          <TagLabel fontWeight="bold" fontSize="xs">
                            {tool.name}
                            {tool.version && (
                              <Text as="span" ml={1.5} fontWeight="normal" fontSize="xs" opacity={0.85}>
                                ({tool.version})
                              </Text>
                            )}
                            {tool.year && (
                              <Badge ml={1.5} colorScheme="blue" variant="solid" fontSize="xs" rounded="md" px={1.5}>
                                {tool.year}
                              </Badge>
                            )}
                          </TagLabel>
                          <TagCloseButton onClick={() => handleRemoveSupportingTool(tool.id, tool.name)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </Box>
            </Box>

            {/* ════════════════════════════════════════════════════════════
                CARD SECTION 5: URL LINK AKSES & TESTING PARAMETERS
                ════════════════════════════════════════════════════════════ */}
            <Box
              as="section"
              rounded="lg"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
              p={{ base: 4, md: 5 }}
              shadow="none"
            >
            <HStack spacing={2.5} mb={5}>
              <Box
                p={2}
                rounded="lg"
                bg={isDark ? activeMeta.iconBgDark : activeMeta.iconBgLight}
                color={activeMeta.iconColor}
                transition="all 0.25s ease"
              >
                <Icon as={FiGlobe} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0.5}>
                <Heading size="sm" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                  5. URL Link Akses & Kredensial Pengujian ({targetEnvironment})
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Konfigurasi URL akses browser dan kredensial pengujian akun untuk lingkungan ini.
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={5} align="stretch" w="full">
              {/* URL Link Akses - Vertical */}
              <FormControl>
                <FormLabel fontSize="small" fontWeight="bold">
                  URL Environment ({targetEnvironment})
                </FormLabel>
                <Input
                  size="md"
                  rounded="lg"
                  placeholder="https://example.com"
                  value={envLinkUrl}
                  onChange={(e) => setEnvLinkUrl(e.target.value)}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Endpoint URL yang dapat diakses oleh tim pengembang atau user akhir.
                </FormHelperText>
              </FormControl>

              {/* Test User & Test Data: Visible for Development, UAT, Staging, or when toggled/existing in Production */}
              {(() => {
                const isTestDefaultEnv = ["dev", "development", "uat", "stagging", "staging", "sit", "rnd"].includes(targetEnvironment.toLowerCase());
                const isVisible = isTestDefaultEnv || showTestingParams || Boolean(testUser.trim() || testData.trim());

                if (!isVisible) {
                  return (
                    <Box pt={1}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        rounded="lg"
                        leftIcon={<FiPlus />}
                        onClick={() => setShowTestingParams(true)}
                      >
                        Tambah Test User & Test Data ({targetEnvironment})
                      </Button>
                    </Box>
                  );
                }

                return (
                  <Box
                    p={isTestDefaultEnv ? 0 : 3.5}
                    rounded="lg"
                    border={isTestDefaultEnv ? "none" : "1px solid"}
                    borderColor={isDark ? "gray.700" : "blue.200"}
                    bg={isTestDefaultEnv ? "transparent" : (isDark ? "gray.750" : "blue.50")}
                  >
                    {!isTestDefaultEnv && (
                      <Flex justify="space-between" align="center" mb={3} pb={2} borderBottom="1px dashed" borderColor={isDark ? "gray.700" : "blue.200"}>
                        <HStack spacing={2}>
                          <Icon as={FiTarget} color="blue.500" />
                          <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "blue.800"}>
                            Parameter Pengujian Tambahan ({targetEnvironment})
                          </Text>
                        </HStack>
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          rounded="md"
                          leftIcon={<FiX />}
                          onClick={() => {
                            setShowTestingParams(false);
                            setTestUser("");
                            setTestData("");
                          }}
                        >
                          Batal / Tutup Field
                        </Button>
                      </Flex>
                    )}

                    <VStack spacing={4} align="stretch" pt={isTestDefaultEnv ? 1 : 0}>
                      {/* Test User - Description Box */}
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Test User</FormLabel>
                        <Textarea
                          rows={3}
                          size="md"
                          rounded="lg"
                          bg={isDark ? "gray.800" : "white"}
                          placeholder="Contoh: dev_maker01 / User CS Maker..."
                          value={testUser}
                          onChange={(e) => setTestUser(e.target.value)}
                        />
                      </FormControl>

                      {/* Test Data - Description Box */}
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Test Data</FormLabel>
                        <Textarea
                          rows={3}
                          size="md"
                          rounded="lg"
                          bg={isDark ? "gray.800" : "white"}
                          placeholder="Contoh: CIF: 902188201 / Rekening: 1029384756 / Keterangan data uji..."
                          value={testData}
                          onChange={(e) => setTestData(e.target.value)}
                        />
                        <FormHelperText fontSize="3xs" color="gray.500">
                          Deskripsi data uji yang digunakan untuk verifikasi sistem pada environment ini.
                        </FormHelperText>
                      </FormControl>

                      {!isTestDefaultEnv && (
                        <Flex justify="flex-end" pt={1}>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FiX />}
                            onClick={() => {
                              setShowTestingParams(false);
                              setTestUser("");
                              setTestData("");
                            }}
                          >
                            Batalkan & Sembunyikan Parameter Pengujian
                          </Button>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                );
              })()}
            </VStack>
            </Box>
          </VStack>
        </Box>

        {/* ── ACTION FOOTER (SIMPAN / BATAL) ── */}
        <Flex
          as="footer"
          mt={4}
          p={4}
          rounded="xl"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.850" : "white"}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={3}
          shadow="sm"
        >
          <Button
            leftIcon={<FiArrowLeft />}
            variant="outline"
            size="md"
            rounded="lg"
            onClick={() => router.push(appId ? `/master-data/Application/detail?id=${appId}` : "/master-data/Application")}
          >
            Kembali
          </Button>

          <Button
            leftIcon={<FiSave />}
            colorScheme="secondary"
            size="md"
            rounded="lg"
            px={6}
            fontWeight="bold"
            isLoading={isSubmitting}
            onClick={handleOpenSummary}
          >
            Simpan 
          </Button>
        </Flex>

        {/* ── MODAL SUMMARY KONFIGURASI SERVER SEBELUM SIMPAN ── */}
        <Modal
          isOpen={isOpenSummaryModal}
          onClose={onCloseSummaryModal}
          size="2xl"
          isCentered
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent
            rounded="xl"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.850" : "white"}
            shadow="xl"
          >
            <ModalHeader borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} pb={3}>
              <HStack spacing={2.5}>
                <Box p={2} rounded="lg" bg={isDark ? "blue.900" : "blue.50"} color="blue.600">
                  <Icon as={FiServer} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0.5}>
                  <Heading size="sm" fontWeight="800">
                    Ringkasan Konfigurasi Server Node
                  </Heading>
                  <Text fontSize="xs" color="gray.500" fontWeight="normal">
                    Pastikan seluruh parameter Virtual Machine, peran, dan postur jaringan sudah tepat sebelum konfirmasi.
                  </Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton mt={1} />

            <ModalBody py={4}>
              <VStack spacing={3.5} align="stretch">
                {/* 1. Target & Peran Server */}
                <Box
                  p={3.5}
                  rounded="lg"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="xs"
                >
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="blue.600" mb={2}>
                    1. Target Environment & Peran
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5} fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.500">Target Environment:</Text>
                      <Badge colorScheme="blue" px={2} py={0.5} rounded="md" fontWeight="bold">
                        {targetEnvironment === "Other" ? targetEnvironmentOther : targetEnvironment} ({activeMeta.code})
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Status Server:</Text>
                      <Badge colorScheme={status === "Aktif" ? "green" : status === "Non Aktif" ? "red" : "gray"} px={2} py={0.5} rounded="md">
                        {status}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Role Server:</Text>
                      <Text fontWeight="bold">
                        {roleServer === "Other" ? (roleServerOther || "Custom") : roleServer}
                      </Text>
                    </HStack>

                  </SimpleGrid>

                  {roleDetail && (
                    <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Text fontSize="xs" color="gray.500" mb={0.5}>Deskripsi Fungsi:</Text>
                      <Text fontSize="xs" color={isDark ? "gray.200" : "gray.700"} noOfLines={2}>
                        {roleDetail}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* 2. Virtual Machine Specs */}
                <Box
                  p={3.5}
                  rounded="lg"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="xs"
                >
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="blue.600" mb={2}>
                    2. Spesifikasi Virtual Machine (VM)
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5} fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.500">Nama VM:</Text>
                      <Text fontFamily="mono" fontWeight="bold">{namaVm}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">IP Address:</Text>
                      <Text fontFamily="mono" fontWeight="bold" color="blue.600">{ipAddress}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Data Center:</Text>
                      <Badge colorScheme={dcSelection === "DC 1" ? "blue" : dcSelection === "DC 2" ? "purple" : "gray"} px={2} py={0.5} rounded="md" fontWeight="bold">
                        {dcSelectionOther.trim() ? dcSelectionOther : dcSelection}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Operating System:</Text>
                      <Text fontWeight="semibold">{os === "Other" ? (osOther || "Custom") : os}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">CPU Compute:</Text>
                      <Text fontWeight="bold">{cpu} CPU</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Memory (RAM):</Text>
                      <Text fontWeight="bold">{memory} GB</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Storage Disk:</Text>
                      <Text fontWeight="bold">{storage} GB</Text>
                    </HStack>
                  </SimpleGrid>

                  {note && (
                    <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Text fontSize="xs" color="gray.500" mb={0.5}>Catatan Teknis:</Text>
                      <Text fontSize="xs" color={isDark ? "gray.200" : "gray.700"} noOfLines={2}>
                        {note}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* 3. Network, Data Center & Security Posture */}
                <Box
                  p={3.5}
                  rounded="lg"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="xs"
                >
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="blue.600" mb={2}>
                    3. Network & Security Posture
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5} fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.500">Site Data Center:</Text>
                      <Text fontWeight="bold">{(site === "Other" || site === "Other Site") ? (siteOther || "Other") : site}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Segment:</Text>
                      <Text fontWeight="bold">{segment}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Domain Joining:</Text>
                      <Badge colorScheme={joinDomain === "Ya" ? "blue" : "gray"} px={2} py={0.5} rounded="md">
                        {joinDomain}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">Hardening Security:</Text>
                      <Badge colorScheme={hardening === "Ya" ? "blue" : "gray"} px={2} py={0.5} rounded="md">
                        {hardening}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text color="gray.500">PAM Integration:</Text>
                      <Badge colorScheme={pam === "Ya" ? "blue" : "gray"} px={2} py={0.5} rounded="md">
                        {pam}
                      </Badge>
                    </HStack>
                  </SimpleGrid>
                </Box>

                {/* 4. Aplikasi & Tools Pendukung Server */}
                <Box
                  p={3.5}
                  rounded="lg"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="xs"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="blue.600">
                      4. Aplikasi & Tools Pendukung Server
                    </Text>
                    <Badge colorScheme="blue" fontSize="xs" rounded="md" px={2} py={0.5}>
                      {supportingTools.length} Tools
                    </Badge>
                  </HStack>
                  {supportingTools.length === 0 ? (
                    <Text fontSize="xs" color="gray.400" fontStyle="italic">
                      Tidak ada tools pendukung yang didaftarkan.
                    </Text>
                  ) : (
                    <Wrap spacing={2}>
                      {supportingTools.map((t) => (
                        <WrapItem key={t.id}>
                          <Tag size="md" colorScheme="blue" variant="subtle" px={2.5} py={1} rounded="md">
                            <TagLabel fontSize="xs" fontWeight="bold">
                              {t.name}
                              {t.version ? ` (${t.version})` : ""}
                              {t.year ? ` • ${t.year}` : ""}
                            </TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>

                {/* 5. Link Akses & Kredensial (jika diisi) */}
                {(envLinkUrl || testUser || testData) && (
                  <Box
                    p={3.5}
                    rounded="lg"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    bg={isDark ? "gray.800" : "white"}
                    shadow="xs"
                  >
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="blue.600" mb={2}>
                      5. Akses Endpoint & Data Pengujian
                    </Text>
                    <VStack align="stretch" spacing={2} fontSize="xs">
                      {envLinkUrl && (
                        <HStack justify="space-between" wrap="wrap">
                          <Text color="gray.500">URL Akses:</Text>
                          <Text fontWeight="bold" color="blue.600" wordBreak="break-all">{envLinkUrl}</Text>
                        </HStack>
                      )}
                      {testUser && (
                        <HStack justify="space-between" wrap="wrap">
                          <Text color="gray.500">Test User:</Text>
                          <Text fontWeight="semibold">{testUser}</Text>
                        </HStack>
                      )}
                      {testData && (
                        <HStack justify="space-between" wrap="wrap">
                          <Text color="gray.500">Test Data:</Text>
                          <Text fontWeight="semibold">{testData}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} pt={3} justifyContent="flex-end">
              <Button
                colorScheme="secondary"
                size="md"
                rounded="lg"
                px={6}
                leftIcon={<FiCheckCircle />}
                fontWeight="bold"
                isLoading={isSubmitting}
                loadingText="Menyimpan..."
                onClick={handleSaveEnvironmentServer}
              >
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </LayoutAdmin>
  );
}
