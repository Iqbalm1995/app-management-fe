"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Textarea,
  Tr,
  useColorMode,
  useSteps,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiGlobe,
  FiInfo,
  FiLayers,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiServer,
  FiShield,
  FiTarget,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { Select } from "chakra-react-select";

// Components & Layout
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import UserSearchSelect from "@/app/components/inputProps/userSearchSelect";

// Constants & Helpers
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ORG_CATEGORY_KEY_DIVISION,
  ORG_CATEGORY_KEY_GROUP,
  MAX_SIZE_TABLE,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";

// Services & Types
import useApps, { ApplicationMasterInsertDataPayload } from "@/app/services/useApps";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { PaggingListPayload } from "@/app/types/masterTypes";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Tambah Aplikasi Baru",
  breadCrumb: ["Master Data", "Applications", "Tambah Baru"],
};

// Wizard Steps Definition
const steps = [
  { title: "Step 1", description: "Profil & Identitas" },
  { title: "Step 2", description: "Tata Kelola & Organisasi" },
  { title: "Step 3", description: "Arsitektur & Tech Stack" },
  { title: "Step 4", description: "Jaringan & Kritikalitas" },
];

// Presets for quick input
const PRESET_LANGUAGES = ["C#", "TypeScript", "JavaScript", "Java", "Python", "Go", "PHP", "Kotlin", "Swift", "Dart", "SQL"];
const PRESET_FRAMEWORKS = [".NET 8", ".NET 6", "Next.js", "React", "Spring Boot", "FastAPI", "Node.js", "Express", "Angular", "Vue.js", "Laravel", "Flutter"];
const PRESET_ENV_LOCATIONS = ["Data Center 1 (DC1)", "Data Center 2 (DC2)", "Disaster Recovery Center (DRC)", "Cloud AWS", "Cloud GCP", "Cloud Azure", "Hybrid Cloud"];
const PRESET_APP_TYPES = ["Core Banking", "Digital Channel / Mobile Banking", "Internet Banking", "Payment Gateway", "Backoffice / ERP", "Reporting / Data Warehouse", "Security & IAM", "Customer Relationship (CRM)"];

export default function AddApplicationPage() {
  useDocumentTitle("Tambah Aplikasi Baru");
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Chakra UI useSteps hook (Matching /requirements/brd/register pattern)
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  // Auth & Token State
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [isLoadingProcess, setIsLoadingProcess] = useState<boolean>(false);

  // Form Initial State
  const initialFormState = {
    appName: "",
    appShortName: "",
    appsDesc: "",
    note: "",
    appInitaiteYear: new Date().getFullYear().toString(),
    appTargetUsers: "INTERNAL",
    appAccessMedia: "Web Browser",
    appTypes: "",
    appTypeCustom: "",
    appRelatedness: "N",
    appRelatednessDesc: "",
    appTransactionals: "Y",
    appOperational24hrs: "false",
    appOperationalDays: "Senin - Jumat",
    appOperationalHourOpen: "08:00",
    appOperationalHourClosed: "17:00",
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
    appCriticalLevel: "1",
    appStatusProject: "ACTIVE",
    appProgrammingLanguages: "",
    appProgrammingFrameworks: "",
    appDevelopmentMethod: "Scrum / Agile",
    appAccessFrontsiteDns: "",
    appAccessFrontsiteIp: "",
    appAccessBacksiteDns: "",
    appAccessBacksiteIp: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  // Organization Directory State
  const [organizationList, setOrganizationList] = useState<OrganizationResponse[]>([]);

  // User Search State for PIC
  const [dataUsersManagerPIC, setDataUsersManagerPIC] = useState<UsersResponse[]>([]);
  const [managerPICSearch, setManagerPICSearch] = useState<string>("");

  const [dataUsersBusinessOwnerPIC, setDataUsersBusinessOwnerPIC] = useState<UsersResponse[]>([]);
  const [businessOwnerPICSearch, setBusinessOwnerPICSearch] = useState<string>("");

  // Services Hooks
  const { InsertData } = useApps();
  const { List: ListOrganization } = useOrganization();
  const { List: ListUsers } = useUsers();

  // Load Auth & Token
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      try {
        const storageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setDataAuth(storageAuth.dataLogin as AuthDataResponse);
      } catch (e) {
        console.error("Failed to parse auth data", e);
      }
    }
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Load Organization Directory
  const loadOrganizations = useCallback(async (token: string) => {
    try {
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };
      const res = await ListOrganization(payload, token);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOrganizationList(res.data as OrganizationResponse[]);
      }
    } catch (e) {
      console.error("Error loading organizations:", e);
    }
  }, []);

  useEffect(() => {
    if (tokenData) {
      loadOrganizations(tokenData);
    }
  }, [tokenData, loadOrganizations]);

  // Options for Division & Group Dropdowns
  const divisionOptions = useMemo(() => {
    return organizationList
      .filter((org) => org.orgType === ORG_CATEGORY_KEY_DIVISION)
      .map((org) => ({
        label: `${org.orgName} (${org.orgCode})`,
        value: org.id,
      }));
  }, [organizationList]);

  const groupOptions = useMemo(() => {
    return organizationList
      .filter((org) => org.orgType === ORG_CATEGORY_KEY_GROUP)
      .map((org) => ({
        label: `${org.orgName} (${org.orgCode})`,
        value: org.id,
        parentId: org.parentId,
      }));
  }, [organizationList]);

  // Find IT Division to provide default IT Management
  const itDivision = useMemo(() => {
    return organizationList.find((org) => {
      const isDiv = org.orgType === ORG_CATEGORY_KEY_DIVISION;
      if (!isDiv) return false;
      const code = (org.orgCode || "").toUpperCase();
      const name = (org.orgName || "").toUpperCase();
      return (
        code === "IT" ||
        code === "DIV_IT" ||
        code === "DIV-IT" ||
        code === "D440" ||
        name.includes("TEKNOLOGI INFORMASI") ||
        name.includes("INFORMATION TECHNOLOGY") ||
        name === "DIVISI IT"
      );
    });
  }, [organizationList]);

  // Set default IT division for IT Management if found
  useEffect(() => {
    if (itDivision && !formData.appManageByDivisionId) {
      setFormData((prev) => ({ ...prev, appManageByDivisionId: itDivision.id }));
    }
  }, [itDivision]);

  // User Search Function for PIC
  const searchUserAsync = async (query: string): Promise<UsersResponse[]> => {
    if (!tokenData || !query.trim()) return [];
    try {
      const payload: PaggingListPayload = {
        search: query.trim(),
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

  const handleSearchManagerPIC = async (query: string) => {
    setManagerPICSearch(query);
    if (query.trim().length >= 2) {
      const results = await searchUserAsync(query);
      setDataUsersManagerPIC(results);
    } else {
      setDataUsersManagerPIC([]);
    }
  };

  const handleSearchBusinessOwnerPIC = async (query: string) => {
    setBusinessOwnerPICSearch(query);
    if (query.trim().length >= 2) {
      const results = await searchUserAsync(query);
      setDataUsersBusinessOwnerPIC(results);
    } else {
      setDataUsersBusinessOwnerPIC([]);
    }
  };

  // Helper to toggle multi-value tags
  const toggleCommaItem = (currentValue: string, item: string): string => {
    const list = currentValue
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    return updated.join(", ");
  };

  // Live Initials calculation
  const previewInitials = useMemo(() => {
    const source = formData.appShortName || formData.appName || "APP";
    return source
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  }, [formData.appShortName, formData.appName]);

  // ══════════════════════════════════════════════════════════════════
  // STEP VALIDATION LOGIC
  // ══════════════════════════════════════════════════════════════════

  const validateStep = useCallback(
    (stepIndex: number): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (stepIndex === 0) {
        // Step 1: Profil & Identitas
        if (!formData.appName.trim()) {
          errors.push("Nama Lengkap Aplikasi wajib diisi.");
        }
        if (!formData.appShortName.trim()) {
          errors.push("Nama Singkat (Short Name) wajib diisi.");
        }
      } else if (stepIndex === 1) {
        // Step 2: Tata Kelola
        if (!formData.appManageByDivisionId) {
          errors.push("Divisi Pengelola TI (IT Management) wajib dipilih.");
        }
        if (!formData.appBusinessOwnerDivisionId) {
          errors.push("Divisi Pemilik Bisnis (Business Owner) wajib dipilih.");
        }
      } else if (stepIndex === 2) {
        // Step 3: Tech Stack
        if (!formData.appDevelopmentMethod) {
          errors.push("Metode Pengembangan SDLC wajib dipilih.");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [formData]
  );

  // Stepper Next Handler
  const goToNext = () => {
    const validation = validateStep(activeStep);

    if (!validation.isValid) {
      setStepErrors((prev) => ({ ...prev, [activeStep]: validation.errors }));
      showToast({
        description: validation.errors[0] || "Mohon lengkapi data yang diperlukan sebelum melanjutkan.",
        statusToast: "warning",
      });
      return;
    }

    setStepErrors((prev) => ({ ...prev, [activeStep]: [] }));

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  // Stepper Prev Handler
  const goToPrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Stepper Jump Handler
  const handleJumpToStep = (targetIndex: number) => {
    if (targetIndex < activeStep) {
      setActiveStep(targetIndex);
      return;
    }

    // Validate all preceding steps
    for (let i = 0; i < targetIndex; i++) {
      const validation = validateStep(i);
      if (!validation.isValid) {
        setStepErrors((prev) => ({ ...prev, [i]: validation.errors }));
        setActiveStep(i);
        showToast({
          description: `Silakan lengkapi ${steps[i].title} (${steps[i].description}) terlebih dahulu: ${validation.errors[0]}`,
          statusToast: "warning",
        });
        return;
      }
    }

    setActiveStep(targetIndex);
  };

  // Overall Form Progress Calculation
  const formProgress = useMemo(() => {
    let score = 0;
    const maxScore = 7;

    if (formData.appName.trim()) score++;
    if (formData.appShortName.trim()) score++;
    if (formData.appManageByDivisionId) score++;
    if (formData.appBusinessOwnerDivisionId) score++;
    if (formData.appProgrammingLanguages.trim()) score++;
    if (formData.appDevelopmentMethod) score++;
    if (formData.appOperational24hrs) score++;

    return Math.round((score / maxScore) * 100);
  }, [formData]);

  // Final Submit Handler
  const handleSubmit = async () => {
    if (!tokenData) {
      showToast({
        description: "Sesi otentikasi tidak ditemukan. Silakan login kembali.",
        statusToast: "error",
      });
      return;
    }

    // Verify all 4 steps
    for (let s = 0; s < steps.length; s++) {
      const validation = validateStep(s);
      if (!validation.isValid) {
        setStepErrors((prev) => ({ ...prev, [s]: validation.errors }));
        setActiveStep(s);
        showToast({
          description: `Mohon lengkapi field wajib pada ${steps[s].title}: ${validation.errors[0]}`,
          statusToast: "error",
        });
        return;
      }
    }

    try {
      setIsLoadingProcess(true);

      const payload: ApplicationMasterInsertDataPayload = {
        appName: formData.appName.trim().toUpperCase(),
        appShortName: formData.appShortName.trim().toUpperCase(),
        appsDesc: formData.appsDesc.trim() || null,
        note: formData.note.trim() || null,
        appTargetUsers: formData.appTargetUsers || "INTERNAL",
        appAccessMedia: formData.appAccessMedia || "Web Browser",
        appTypes: formData.appTypes.trim() || null,
        appTypeCustom: formData.appTypeCustom.trim() || null,
        appRelatedness: formData.appRelatedness || "N",
        appRelatednessDesc: formData.appRelatednessDesc.trim() || null,
        appTransactionals: formData.appTransactionals || "Y",
        appOperational24hrs: formData.appOperational24hrs,
        appOperationalDays: formData.appOperationalDays || "Senin - Jumat",
        appOperationalHourOpen: formData.appOperational24hrs === "true" ? "00:00" : formData.appOperationalHourOpen,
        appOperationalHourClosed: formData.appOperational24hrs === "true" ? "23:59" : formData.appOperationalHourClosed,
        appEnvLocations: formData.appEnvLocations.trim() || null,
        appEnvLocationsOthers: formData.appEnvLocationsOthers.trim() || null,
        appPrivateAuth: formData.appPrivateAuth || "Y",
        appHightAvailability: formData.appHightAvailability || "Y",
        appIntegrationOthersApps: formData.appIntegrationOthersApps.trim() || null,
        appOwnerDivisionId: formData.appBusinessOwnerDivisionId || null,
        appOwnerGroupId: formData.appBusinessOwnerGroupId || null,
        appManageByDivisionId: formData.appManageByDivisionId || null,
        appManageByGroupId: formData.appManageByGroupId || null,
        appManageByTeamId: null,
        appOwnerPicUserId: formData.appBusinessOwnerPicUserId || null,
        appOwnerPicName: formData.appBusinessOwnerPicName || null,
        appManagePicUserId: formData.appManagePicUserId || null,
        appManagePicName: formData.appManagePicName || null,
        appBusinessOwnerPicUserId: formData.appBusinessOwnerPicUserId || null,
        appBusinessOwnerPicName: formData.appBusinessOwnerPicName || null,
        appIsCritical: formData.appIsCritical || "N",
        appCriticalLevel: formData.appIsCritical === "Y" ? formData.appCriticalLevel || "1" : null,
        appStatusProject: formData.appStatusProject || "ACTIVE",
        appInitaiteYear: formData.appInitaiteYear || new Date().getFullYear().toString(),
        appProgrammingLanguages: formData.appProgrammingLanguages.trim() || null,
        appProgrammingFrameworks: formData.appProgrammingFrameworks.trim() || null,
        appDevelopmentMethod: formData.appDevelopmentMethod || "Scrum / Agile",
        appAccessFrontsiteDns: formData.appAccessFrontsiteDns.trim() || null,
        appAccessFrontsiteIp: formData.appAccessFrontsiteIp.trim() || null,
        appAccessBacksiteDns: formData.appAccessBacksiteDns.trim() || null,
        appAccessBacksiteIp: formData.appAccessBacksiteIp.trim() || null,
      };

      const res = await InsertData(payload, tokenData);

      if (!res || res.statusCode !== RES_CODE_OK) {
        showToast({
          description: res?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: `Aplikasi "${formData.appName}" berhasil didaftarkan ke repositori`,
        statusToast: "success",
      });

      const createdApp = res.data as any;
      if (createdApp?.id) {
        router.push(`/master-data/Application/detail?id=${createdApp.id}`);
      } else {
        router.push("/master-data/Application");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      showToast({
        description: "Gagal mendaftarkan aplikasi baru.",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box px={{ base: 2, md: 4 }} py={2}>
        {/* ══════════════════════════════════════════════════════════════════
            HERO HEADER BANNER
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
          mb={5}
        >
          {/* Ambient glass background decor */}
          <Box position="absolute" top="-20px" right="-20px" w="140px" h="140px" bg="whiteAlpha.150" rounded="full" pointerEvents="none" />
          <Box position="absolute" bottom="-30px" right="160px" w="100px" h="100px" bg="whiteAlpha.100" transform="rotate(45deg)" pointerEvents="none" />

          <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "start", lg: "center" }} gap={4} position="relative" zIndex={1}>
            {/* Left Identity Strip */}
            <HStack spacing={{ base: 3, md: 4 }} align="center" flex={1}>
              <IconButton
                aria-label="Kembali ke Daftar Aplikasi"
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
                {previewInitials}
              </Box>

              <VStack align="start" spacing={1} overflow="hidden">
                <HStack spacing={2} wrap="wrap">
                  <Badge bg="whiteAlpha.300" color="white" px={2.5} py={0.5} rounded="md" fontSize="2xs" fontWeight="bold">
                    {formData.appShortName || "KODE-APP"}
                  </Badge>

                  <Badge colorScheme="green" variant="solid" px={2.5} py={0.5} rounded="full" fontSize="2xs" fontWeight="bold">
                    WIZARD REGISTRASI (STEP {activeStep + 1}/4)
                  </Badge>

                  {formData.appIsCritical === "Y" && (
                    <Badge bg="red.500" color="white" px={2.5} py={0.5} rounded="full" fontSize="2xs" fontWeight="extrabold" shadow="sm">
                      CRITICAL (L{formData.appCriticalLevel})
                    </Badge>
                  )}

                  {formData.appOperational24hrs === "true" && (
                    <Badge bg="green.400" color="green.950" px={2} py={0.5} rounded="md" fontSize="3xs" fontWeight="extrabold">
                      24/7 SLA
                    </Badge>
                  )}
                </HStack>

                <Heading size={{ base: "sm", md: "md" }} fontWeight="800" color="white" lineHeight="shorter">
                  {formData.appName || "Pendaftaran Aplikasi Baru"}
                </Heading>

                <Text fontSize="2xs" color="whiteAlpha.800">
                  {steps[activeStep].title}: {steps[activeStep].description}
                </Text>
              </VStack>
            </HStack>

            {/* Right Header Action Buttons */}
            <HStack spacing={2.5} alignSelf={{ base: "flex-end", lg: "center" }}>
              <Button
                leftIcon={<FiX />}
                size="md"
                h="40px"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.250" }}
                rounded="full"
                px={4}
                onClick={() => router.push("/master-data/Application")}
              >
                Batal
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  leftIcon={<FiSave />}
                  size="md"
                  h="40px"
                  bg="secondary.300"
                  color="secondary.950"
                  _hover={{ bg: "secondary.200", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={6}
                  fontSize="sm"
                  fontWeight="extrabold"
                  shadow="lg"
                  isLoading={isLoadingProcess}
                  onClick={handleSubmit}
                  transition="all 0.2s ease"
                >
                  Simpan & Daftarkan
                </Button>
              ) : (
                <Button
                  rightIcon={<FiArrowRight />}
                  size="md"
                  h="40px"
                  bg="secondary.300"
                  color="secondary.950"
                  _hover={{ bg: "secondary.200", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={5}
                  fontSize="sm"
                  fontWeight="extrabold"
                  shadow="lg"
                  onClick={goToNext}
                  transition="all 0.2s ease"
                >
                  Lanjut ke Step {activeStep + 2}
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            80 / 20 MAIN WORKSPACE LAYOUT
            ══════════════════════════════════════════════════════════════════ */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={5}>
          {/* ── LEFT 80% FORM WORKSPACE (COL-SPAN 9) ── */}
          <GridItem colSpan={{ base: 12, lg: 9, xl: 9 }}>
            <Card
              w="full"
              rounded={radiusStyle}
              bgColor={colorMode === "light" ? "white" : "gray.800"}
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardHeader pb={3}>
                <Heading as="h5" size="md" w="full">
                  Form Registrasi Aplikasi
                </Heading>
              </CardHeader>

              <CardBody pt={0}>
                <Flex w="full" as={Stack} spacing={4}>
                  {/* Stepper Header (Mobile Responsive) */}
                  <Stepper
                    index={steps.length}
                    orientation="horizontal"
                    height="full"
                    pb={4}
                    overflowX="auto"
                    colorScheme="blue"
                    display={{
                      base: "flex",
                      sm: "flex",
                      md: "flex",
                      lg: "none",
                    }}
                  >
                    <Step>
                      <StepIndicator>
                        <StepStatus />
                      </StepIndicator>

                      <Box flexShrink="0">
                        <StepTitle fontWeight={600}>
                          {steps[activeStep].title} / {steps.length}
                        </StepTitle>
                        <StepDescription>
                          {steps[activeStep].description}
                        </StepDescription>
                      </Box>

                      <StepSeparator />
                    </Step>
                  </Stepper>

                  {/* Stepper Header (Desktop Responsive) */}
                  <Stepper
                    index={activeStep}
                    orientation="horizontal"
                    height="full"
                    pb={4}
                    overflowX="auto"
                    colorScheme="blue"
                    display={{
                      base: "none",
                      sm: "none",
                      md: "none",
                      lg: "flex",
                    }}
                  >
                    {steps.map((step, index) => (
                      <Step
                        key={index}
                        onClick={() => handleJumpToStep(index)}
                        style={{ cursor: "pointer" }}
                      >
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>

                        <Box flexShrink="0">
                          <StepTitle fontWeight={600}>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>

                  {/* Per-step Active Error Alert */}
                  {(stepErrors[activeStep] || []).length > 0 && (
                    <Alert status="warning" rounded="xl" mb={2}>
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle fontSize="xs" fontWeight="bold">
                          Perhatian: Field Wajib Belum Lengkap
                        </AlertTitle>
                        <AlertDescription fontSize="2xs">
                          {stepErrors[activeStep].join(" ")}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {/* ────────────────────────────────────────────────────────
                      STEP 1 (INDEX 0): PROFIL & IDENTITAS
                      ──────────────────────────────────────────────────────── */}
                  {activeStep === 0 && (
                    <Flex as={Stack} w="full" spacing={5}>
                      <InputGroupPanel headerTitle="Profil & Identitas Utama Aplikasi">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl
                            isRequired
                            isInvalid={!formData.appName.trim() && Boolean(stepErrors[0])}
                          >
                            <InputLayout>
                              <FormLabel mt={2}>Nama Lengkap Aplikasi</FormLabel>
                              <Stack spacing={0} w="full">
                                <Input
                                  placeholder="Contoh: INTEGRATED CORE BANKING SYSTEM"
                                  value={formData.appName}
                                  onChange={(e) => {
                                    const uppercaseVal = e.target.value.toUpperCase();
                                    setFormData({ ...formData, appName: uppercaseVal });
                                    if (uppercaseVal.trim()) setStepErrors((prev) => ({ ...prev, 0: [] }));
                                  }}
                                  textTransform="uppercase"
                                />
                                <FormHelperText as="i" fontSize="xs">
                                  Nama resmi lengkap aplikasi (otomatis kapital).
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            isRequired
                            isInvalid={!formData.appShortName.trim() && Boolean(stepErrors[0])}
                          >
                            <InputLayout>
                              <FormLabel mt={2}>Nama Singkat (Short Name)</FormLabel>
                              <Stack spacing={0} w="full">
                                <Input
                                  placeholder="Contoh: ICBS"
                                  value={formData.appShortName}
                                  onChange={(e) => {
                                    const uppercaseVal = e.target.value.toUpperCase();
                                    setFormData({ ...formData, appShortName: uppercaseVal });
                                    if (uppercaseVal.trim()) setStepErrors((prev) => ({ ...prev, 0: [] }));
                                  }}
                                  textTransform="uppercase"
                                />
                                <FormHelperText as="i" fontSize="xs">
                                  *Nama singkat dikunci permanen sebagai kode identitas sistem.
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Tahun Inisiasi</FormLabel>
                              <Input
                                type="number"
                                placeholder="2024"
                                value={formData.appInitaiteYear}
                                onChange={(e) => setFormData({ ...formData, appInitaiteYear: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Target Segmen Pengguna</FormLabel>
                              <ChakraSelect
                                value={formData.appTargetUsers}
                                onChange={(e) => setFormData({ ...formData, appTargetUsers: e.target.value })}
                              >
                                <option value="INTERNAL">Internal Bank</option>
                                <option value="EXTERNAL">Eksternal / Nasabah</option>
                                <option value="HYBRID">Hybrid (Internal & Eksternal)</option>
                              </ChakraSelect>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Media Akses Platform</FormLabel>
                              <ChakraSelect
                                value={formData.appAccessMedia}
                                onChange={(e) => setFormData({ ...formData, appAccessMedia: e.target.value })}
                              >
                                <option value="Web Browser">Web Browser</option>
                                <option value="Mobile App">Mobile App (Android / iOS)</option>
                                <option value="API / Web Service">API / Web Service</option>
                                <option value="Desktop Client">Desktop Client</option>
                                <option value="Multi Platform">Multi Platform (Web + Mobile)</option>
                              </ChakraSelect>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Tipe Transaksional</FormLabel>
                              <RadioGroup
                                value={formData.appTransactionals}
                                onChange={(val) => setFormData({ ...formData, appTransactionals: val })}
                              >
                                <HStack spacing={6} mt={2}>
                                  <Radio value="Y" colorScheme="blue">Finansial / Transaksional</Radio>
                                  <Radio value="N" colorScheme="gray">Non-Transaksional</Radio>
                                </HStack>
                              </RadioGroup>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Kategori / Jenis Aplikasi</FormLabel>
                              <Stack spacing={2} w="full">
                                <Wrap spacing={2}>
                                  {PRESET_APP_TYPES.map((type) => {
                                    const isSelected = formData.appTypes.includes(type);
                                    return (
                                      <Tag
                                        key={type}
                                        size="md"
                                        rounded="md"
                                        cursor="pointer"
                                        colorScheme={isSelected ? "blue" : "gray"}
                                        variant={isSelected ? "solid" : "outline"}
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            appTypes: toggleCommaItem(formData.appTypes, type),
                                          })
                                        }
                                      >
                                        <TagLabel fontSize="xs">{type}</TagLabel>
                                        {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                      </Tag>
                                    );
                                  })}
                                </Wrap>
                                <Input
                                  placeholder="Ketik kategori aplikasi lainnya..."
                                  value={formData.appTypes}
                                  onChange={(e) => setFormData({ ...formData, appTypes: e.target.value })}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Deskripsi Aplikasi</FormLabel>
                              <Textarea
                                rows={3}
                                placeholder="Jelaskan tujuan bisnis, fungsi operasional, dan fitur utama dari aplikasi ini..."
                                value={formData.appsDesc}
                                onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                              />
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Catatan Khusus (Internal Note)</FormLabel>
                              <Textarea
                                rows={2}
                                placeholder="Catatan tambahan, arsitektur historis, atau instruksi khusus tim..."
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                              />
                            </InputLayoutFull>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* ────────────────────────────────────────────────────────
                      STEP 2 (INDEX 1): TATA KELOLA & PENGELOLA
                      ──────────────────────────────────────────────────────── */}
                  {activeStep === 1 && (
                    <Flex as={Stack} w="full" spacing={5}>
                      {/* Pengelola Divisi TI */}
                      <InputGroupPanel headerTitle="Pengelola Divisi TI (IT Management)">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl
                            isRequired
                            isInvalid={!formData.appManageByDivisionId && Boolean(stepErrors[1])}
                          >
                            <InputLayout>
                              <FormLabel mt={2}>Divisi Pengelola TI</FormLabel>
                              <Stack spacing={0} w="full">
                                <Select
                                  options={divisionOptions}
                                  value={divisionOptions.find((o) => o.value === formData.appManageByDivisionId)}
                                  onChange={(opt: any) => {
                                    setFormData({ ...formData, appManageByDivisionId: opt?.value || "" });
                                    if (opt?.value) setStepErrors((prev) => ({ ...prev, 1: [] }));
                                  }}
                                  placeholder="Pilih Divisi Pengelola TI..."
                                />
                                <FormHelperText as="i" fontSize="xs">
                                  Divisi TI yang bertanggung jawab atas pengembangan dan operasional teknis.
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Group Pengelola TI</FormLabel>
                              <Select
                                options={groupOptions.filter(
                                  (g) => !formData.appManageByDivisionId || g.parentId === formData.appManageByDivisionId
                                )}
                                value={groupOptions.find((o) => o.value === formData.appManageByGroupId)}
                                onChange={(opt: any) =>
                                  setFormData({ ...formData, appManageByGroupId: opt?.value || "" })
                                }
                                placeholder="Pilih Group TI..."
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>PIC Pengelola TI</FormLabel>
                              <Stack spacing={2} w="full">
                                <InputGroup size="md">
                                  <InputLeftElement pointerEvents="none">
                                    <Icon as={FiSearch} color="gray.400" />
                                  </InputLeftElement>
                                  <Input
                                    placeholder="Cari nama atau NPK PIC TI..."
                                    value={managerPICSearch}
                                    onChange={(e) => handleSearchManagerPIC(e.target.value)}
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
                                  usersData={dataUsersManagerPIC}
                                  editMode={true}
                                />
                                {formData.appManagePicName && (
                                  <Text fontSize="xs" color="green.500" fontWeight="bold">
                                    Terpilih: {formData.appManagePicName} ({formData.appManagePicUserId})
                                  </Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>

                      {/* Pemilik Bisnis (Business Owner) */}
                      <InputGroupPanel headerTitle="Pemilik Bisnis (Business Owner)">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl
                            isRequired
                            isInvalid={!formData.appBusinessOwnerDivisionId && Boolean(stepErrors[1])}
                          >
                            <InputLayout>
                              <FormLabel mt={2}>Divisi Pemilik Bisnis</FormLabel>
                              <Stack spacing={0} w="full">
                                <Select
                                  options={divisionOptions}
                                  value={divisionOptions.find((o) => o.value === formData.appBusinessOwnerDivisionId)}
                                  onChange={(opt: any) => {
                                    setFormData({ ...formData, appBusinessOwnerDivisionId: opt?.value || "" });
                                    if (opt?.value) setStepErrors((prev) => ({ ...prev, 1: [] }));
                                  }}
                                  placeholder="Pilih Divisi Pemilik Bisnis..."
                                />
                                <FormHelperText as="i" fontSize="xs">
                                  Divisi bisnis pemilik proses kerja sistem.
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Group Pemilik Bisnis</FormLabel>
                              <Select
                                options={groupOptions.filter(
                                  (g) => !formData.appBusinessOwnerDivisionId || g.parentId === formData.appBusinessOwnerDivisionId
                                )}
                                value={groupOptions.find((o) => o.value === formData.appBusinessOwnerGroupId)}
                                onChange={(opt: any) =>
                                  setFormData({ ...formData, appBusinessOwnerGroupId: opt?.value || "" })
                                }
                                placeholder="Pilih Group Bisnis..."
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>PIC Pemilik Bisnis</FormLabel>
                              <Stack spacing={2} w="full">
                                <InputGroup size="md">
                                  <InputLeftElement pointerEvents="none">
                                    <Icon as={FiSearch} color="gray.400" />
                                  </InputLeftElement>
                                  <Input
                                    placeholder="Cari nama atau NPK PIC Bisnis..."
                                    value={businessOwnerPICSearch}
                                    onChange={(e) => handleSearchBusinessOwnerPIC(e.target.value)}
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
                                  usersData={dataUsersBusinessOwnerPIC}
                                  editMode={true}
                                />
                                {formData.appBusinessOwnerPicName && (
                                  <Text fontSize="xs" color="purple.500" fontWeight="bold">
                                    Terpilih: {formData.appBusinessOwnerPicName} ({formData.appBusinessOwnerPicUserId})
                                  </Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>

                      {/* SLA Layanan */}
                      <InputGroupPanel headerTitle="Jadwal Operasional & SLA Layanan">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Layanan Siaga 24 Jam Penuh</FormLabel>
                              <RadioGroup
                                value={formData.appOperational24hrs}
                                onChange={(val) => setFormData({ ...formData, appOperational24hrs: val })}
                              >
                                <HStack spacing={6} mt={2}>
                                  <Radio value="true" colorScheme="green">Ya (24/7 SLA)</Radio>
                                  <Radio value="false" colorScheme="gray">Jam Terbatas</Radio>
                                </HStack>
                              </RadioGroup>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Hari Kerja Operasional</FormLabel>
                              <Input
                                placeholder="Senin - Jumat"
                                value={formData.appOperationalDays}
                                onChange={(e) => setFormData({ ...formData, appOperationalDays: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl isDisabled={formData.appOperational24hrs === "true"}>
                            <InputLayout>
                              <FormLabel mt={2}>Jam Operasional</FormLabel>
                              <HStack spacing={3}>
                                <Input
                                  type="time"
                                  value={formData.appOperationalHourOpen}
                                  onChange={(e) => setFormData({ ...formData, appOperationalHourOpen: e.target.value })}
                                />
                                <Text>s/d</Text>
                                <Input
                                  type="time"
                                  value={formData.appOperationalHourClosed}
                                  onChange={(e) => setFormData({ ...formData, appOperationalHourClosed: e.target.value })}
                                />
                              </HStack>
                            </InputLayout>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* ────────────────────────────────────────────────────────
                      STEP 3 (INDEX 2): SPESIFIKASI ARSITEKTUR & TECH STACK
                      ──────────────────────────────────────────────────────── */}
                  {activeStep === 2 && (
                    <Flex as={Stack} w="full" spacing={5}>
                      <InputGroupPanel headerTitle="Spesifikasi Arsitektur & Tech Stack">
                        <VStack spacing={4} align="stretch" w="full">
                          {/* Bahasa Pemrograman */}
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Bahasa Pemrograman</FormLabel>
                              <Stack spacing={2} w="full">
                                <Wrap spacing={2}>
                                  {PRESET_LANGUAGES.map((lang) => {
                                    const isSelected = formData.appProgrammingLanguages.includes(lang);
                                    return (
                                      <Tag
                                        key={lang}
                                        size="md"
                                        rounded="md"
                                        cursor="pointer"
                                        colorScheme={isSelected ? "blue" : "gray"}
                                        variant={isSelected ? "solid" : "outline"}
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            appProgrammingLanguages: toggleCommaItem(formData.appProgrammingLanguages, lang),
                                          })
                                        }
                                      >
                                        <TagLabel fontSize="xs">{lang}</TagLabel>
                                        {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                      </Tag>
                                    );
                                  })}
                                </Wrap>
                                <Input
                                  placeholder="C#, TypeScript, Python (pisahkan koma)"
                                  value={formData.appProgrammingLanguages}
                                  onChange={(e) => setFormData({ ...formData, appProgrammingLanguages: e.target.value })}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          {/* Frameworks */}
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Frameworks & Engine</FormLabel>
                              <Stack spacing={2} w="full">
                                <Wrap spacing={2}>
                                  {PRESET_FRAMEWORKS.map((fw) => {
                                    const isSelected = formData.appProgrammingFrameworks.includes(fw);
                                    return (
                                      <Tag
                                        key={fw}
                                        size="md"
                                        rounded="md"
                                        cursor="pointer"
                                        colorScheme={isSelected ? "purple" : "gray"}
                                        variant={isSelected ? "solid" : "outline"}
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            appProgrammingFrameworks: toggleCommaItem(formData.appProgrammingFrameworks, fw),
                                          })
                                        }
                                      >
                                        <TagLabel fontSize="xs">{fw}</TagLabel>
                                        {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                      </Tag>
                                    );
                                  })}
                                </Wrap>
                                <Input
                                  placeholder=".NET 8, Next.js, Spring Boot (pisahkan koma)"
                                  value={formData.appProgrammingFrameworks}
                                  onChange={(e) => setFormData({ ...formData, appProgrammingFrameworks: e.target.value })}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl isRequired>
                            <InputLayout>
                              <FormLabel mt={2}>Metode Pengembangan SDLC</FormLabel>
                              <ChakraSelect
                                value={formData.appDevelopmentMethod}
                                onChange={(e) => setFormData({ ...formData, appDevelopmentMethod: e.target.value })}
                              >
                                <option value="Scrum / Agile">Scrum / Agile</option>
                                <option value="Kanban">Kanban</option>
                                <option value="Waterfall">Waterfall</option>
                                <option value="Hybrid">Hybrid</option>
                              </ChakraSelect>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Private Authentication</FormLabel>
                              <RadioGroup
                                value={formData.appPrivateAuth}
                                onChange={(val) => setFormData({ ...formData, appPrivateAuth: val })}
                              >
                                <HStack spacing={6} mt={2}>
                                  <Radio value="Y" colorScheme="blue">Private Auth (SSO / IAM)</Radio>
                                  <Radio value="N" colorScheme="gray">Public Auth</Radio>
                                </HStack>
                              </RadioGroup>
                            </InputLayout>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>

                      <InputGroupPanel headerTitle="Infrastruktur & Lingkungan Server">
                        <VStack spacing={4} align="stretch" w="full">
                          {/* Environment Locations */}
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Lokasi Hosting Server</FormLabel>
                              <Stack spacing={2} w="full">
                                <Wrap spacing={2}>
                                  {PRESET_ENV_LOCATIONS.map((loc) => {
                                    const isSelected = formData.appEnvLocations.includes(loc);
                                    return (
                                      <Tag
                                        key={loc}
                                        size="md"
                                        rounded="md"
                                        cursor="pointer"
                                        colorScheme={isSelected ? "orange" : "gray"}
                                        variant={isSelected ? "solid" : "outline"}
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            appEnvLocations: toggleCommaItem(formData.appEnvLocations, loc),
                                          })
                                        }
                                      >
                                        <TagLabel fontSize="xs">{loc}</TagLabel>
                                        {isSelected && <Icon as={FiCheck} ml={1} boxSize={3} />}
                                      </Tag>
                                    );
                                  })}
                                </Wrap>
                                <Input
                                  placeholder="Data Center 1 (DC1), DRC (pisahkan koma)"
                                  value={formData.appEnvLocations}
                                  onChange={(e) => setFormData({ ...formData, appEnvLocations: e.target.value })}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel mt={2}>Integrasi Aplikasi Lain</FormLabel>
                              <Input
                                placeholder="Contoh: BI-FAST, SKNBI, RTGS, Dukcapil, Payment Gateway (pisahkan koma)"
                                value={formData.appIntegrationOthersApps}
                                onChange={(e) => setFormData({ ...formData, appIntegrationOthersApps: e.target.value })}
                              />
                            </InputLayoutFull>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* ────────────────────────────────────────────────────────
                      STEP 4 (INDEX 3): JARINGAN, DNS & KRITIKALITAS
                      ──────────────────────────────────────────────────────── */}
                  {activeStep === 3 && (
                    <Flex as={Stack} w="full" spacing={5}>
                      <InputGroupPanel headerTitle="Akses Jaringan, Domain & IP">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>DNS Frontsite (Public)</FormLabel>
                              <Input
                                placeholder="app.bankkaltimtara.co.id"
                                value={formData.appAccessFrontsiteDns}
                                onChange={(e) => setFormData({ ...formData, appAccessFrontsiteDns: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>IP Frontsite (Public)</FormLabel>
                              <Input
                                placeholder="103.xxx.xxx.xxx"
                                value={formData.appAccessFrontsiteIp}
                                onChange={(e) => setFormData({ ...formData, appAccessFrontsiteIp: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>DNS Backsite (Internal API)</FormLabel>
                              <Input
                                placeholder="api-internal.bankkaltimtara.co.id"
                                value={formData.appAccessBacksiteDns}
                                onChange={(e) => setFormData({ ...formData, appAccessBacksiteDns: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>IP Backsite (Internal API)</FormLabel>
                              <Input
                                placeholder="192.168.xxx.xxx"
                                value={formData.appAccessBacksiteIp}
                                onChange={(e) => setFormData({ ...formData, appAccessBacksiteIp: e.target.value })}
                              />
                            </InputLayout>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>

                      <InputGroupPanel headerTitle="Klasifikasi Kritikalitas Sistem">
                        <VStack spacing={4} align="stretch" w="full">
                          <FormControl>
                            <InputLayout>
                              <FormLabel mt={2}>Tingkat Kritikalitas</FormLabel>
                              <Stack spacing={3} w="full">
                                <RadioGroup
                                  value={formData.appIsCritical}
                                  onChange={(val) => setFormData({ ...formData, appIsCritical: val })}
                                >
                                  <HStack spacing={6} mt={2}>
                                    <Radio value="Y" colorScheme="red">Aplikasi Kritikal</Radio>
                                    <Radio value="N" colorScheme="gray">Aplikasi Standard</Radio>
                                  </HStack>
                                </RadioGroup>

                                {formData.appIsCritical === "Y" && (
                                  <ChakraSelect
                                    w="200px"
                                    value={formData.appCriticalLevel}
                                    onChange={(e) => setFormData({ ...formData, appCriticalLevel: e.target.value })}
                                  >
                                    <option value="1">Kritikal Level 1 (High)</option>
                                    <option value="2">Kritikal Level 2 (Medium)</option>
                                    <option value="3">Kritikal Level 3 (Low)</option>
                                  </ChakraSelect>
                                )}
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </VStack>
                      </InputGroupPanel>

                      {/* Ringkasan Review Sebelum Submit */}
                      <InputGroupPanel headerTitle="Ringkasan Data Registrasi Aplikasi">
                        <Table size="sm" variant="simple">
                          <Tbody>
                            <Tr>
                              <Td fontWeight="bold" w="30%">Nama Aplikasi</Td>
                              <Td>{formData.appName || "-"}</Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Nama Singkat (Kode)</Td>
                              <Td><Badge colorScheme="blue">{formData.appShortName || "-"}</Badge></Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Pengelola Divisi TI</Td>
                              <Td>
                                {divisionOptions.find((o) => o.value === formData.appManageByDivisionId)?.label || "-"}
                              </Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Pemilik Bisnis</Td>
                              <Td>
                                {divisionOptions.find((o) => o.value === formData.appBusinessOwnerDivisionId)?.label || "-"}
                              </Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">SLA Operasional</Td>
                              <Td>
                                <Badge colorScheme={formData.appOperational24hrs === "true" ? "green" : "gray"}>
                                  {formData.appOperational24hrs === "true" ? "24/7 Siaga Penuh" : `${formData.appOperationalDays} (${formData.appOperationalHourOpen} - ${formData.appOperationalHourClosed})`}
                                </Badge>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Kritikalitas</Td>
                              <Td>
                                <Badge colorScheme={formData.appIsCritical === "Y" ? "red" : "gray"}>
                                  {formData.appIsCritical === "Y" ? `Kritikal Level ${formData.appCriticalLevel}` : "Standard"}
                                </Badge>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* ────────────────────────────────────────────────────────
                      BOTTOM NAVIGATION CONTROLS (Matching BRD Register)
                      ──────────────────────────────────────────────────────── */}
                  <Flex mt={10} w="full" justifyContent="space-between">
                    <Button
                      onClick={goToPrev}
                      isDisabled={activeStep === 0}
                      variant="outline"
                      leftIcon={<FiArrowLeft />}
                      size="lg"
                      rounded="xl"
                    >
                      Previous
                    </Button>

                    <Flex w="full" justifyContent="end" as={HStack}>
                      {activeStep < steps.length - 1 ? (
                        <Button
                          onClick={goToNext}
                          colorScheme="blue"
                          rightIcon={<FiArrowRight />}
                          size="lg"
                          rounded="xl"
                          px={8}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          colorScheme="green"
                          leftIcon={<FiSave />}
                          size="lg"
                          rounded="xl"
                          px={8}
                          isLoading={isLoadingProcess}
                        >
                          Save
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* ── RIGHT 20% STICKY SIDEBAR (COL-SPAN 3) ── */}
          <GridItem colSpan={{ base: 12, lg: 3, xl: 3 }}>
            <VStack spacing={4} align="stretch" position="sticky" top="85px">
              {/* Card 1: Live Card Preview */}
              <Card
                shadow="md"
                rounded={radiusStyle}
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                bg={isDark ? "gray.800" : "white"}
                overflow="hidden"
              >
                <Box
                  p={4}
                  bgGradient="linear(to-r, secondary.600, secondary.500)"
                  color="white"
                >
                  <HStack spacing={3}>
                    <Box
                      w="40px"
                      h="40px"
                      bg="whiteAlpha.300"
                      rounded="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                    >
                      {previewInitials}
                    </Box>
                    <VStack align="start" spacing={0} overflow="hidden">
                      <Badge bg="whiteAlpha.350" color="white" fontSize="3xs" rounded="md">
                        {formData.appShortName || "APP-CODE"}
                      </Badge>
                      <Text fontWeight="bold" fontSize="xs" noOfLines={1}>
                        {formData.appName || "NAMA APLIKASI"}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <CardBody p={4}>
                  <VStack align="stretch" spacing={2.5} fontSize="2xs">
                    <Flex justify="space-between">
                      <Text color="gray.500">Status:</Text>
                      <Badge colorScheme="green" fontSize="3xs">ACTIVE</Badge>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.500">SLA 24/7:</Text>
                      <Badge colorScheme={formData.appOperational24hrs === "true" ? "green" : "gray"} fontSize="3xs">
                        {formData.appOperational24hrs === "true" ? "24/7 Siaga" : "Hari Kerja"}
                      </Badge>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.500">Kritikal:</Text>
                      <Badge colorScheme={formData.appIsCritical === "Y" ? "red" : "gray"} fontSize="3xs">
                        {formData.appIsCritical === "Y" ? `Level ${formData.appCriticalLevel}` : "Standard"}
                      </Badge>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.500">Metode:</Text>
                      <Text fontWeight="bold">{formData.appDevelopmentMethod}</Text>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>

              {/* Card 2: Form Completion Meter */}
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
                      Kelengkapan Data
                    </Heading>
                  </HStack>
                </CardHeader>

                <CardBody px={4} pb={4} pt={2}>
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center" fontSize="2xs">
                      <Text color="gray.500">Progress Total</Text>
                      <Text fontWeight="extrabold" color="secondary.500">{formProgress}%</Text>
                    </Flex>
                    <Progress
                      value={formProgress}
                      size="sm"
                      colorScheme={formProgress === 100 ? "green" : "secondary"}
                      rounded="full"
                      bg={isDark ? "gray.700" : "gray.100"}
                    />

                    <VStack align="start" spacing={1.5} fontSize="3xs" pt={1}>
                      <HStack spacing={2} color={formData.appName.trim() ? "green.500" : "gray.400"}>
                        <Icon as={formData.appName.trim() ? FiCheckCircle : FiAlertCircle} />
                        <Text>Step 1: Nama Lengkap Aplikasi</Text>
                      </HStack>
                      <HStack spacing={2} color={formData.appShortName.trim() ? "green.500" : "gray.400"}>
                        <Icon as={formData.appShortName.trim() ? FiCheckCircle : FiAlertCircle} />
                        <Text>Step 1: Nama Singkat (Short Name)</Text>
                      </HStack>
                      <HStack spacing={2} color={formData.appManageByDivisionId ? "green.500" : "red.400"}>
                        <Icon as={formData.appManageByDivisionId ? FiCheckCircle : FiAlertCircle} />
                        <Text>Step 2: Divisi Pengelola TI (Wajib)</Text>
                      </HStack>
                      <HStack spacing={2} color={formData.appBusinessOwnerDivisionId ? "green.500" : "red.400"}>
                        <Icon as={formData.appBusinessOwnerDivisionId ? FiCheckCircle : FiAlertCircle} />
                        <Text>Step 2: Divisi Pemilik Bisnis (Wajib)</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Card 3: Form Actions */}
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
                      Aksi Cepat
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody px={4} pb={4} pt={2}>
                  <VStack spacing={2.5} align="stretch">
                    {activeStep < steps.length - 1 ? (
                      <Button
                        rightIcon={<FiArrowRight />}
                        size="md"
                        h="44px"
                        colorScheme="secondary"
                        w="full"
                        rounded="xl"
                        fontWeight="bold"
                        shadow="md"
                        onClick={goToNext}
                      >
                        Lanjut ke Step {activeStep + 2}
                      </Button>
                    ) : (
                      <Button
                        leftIcon={<FiSave />}
                        size="md"
                        h="44px"
                        colorScheme="secondary"
                        w="full"
                        rounded="xl"
                        fontWeight="bold"
                        shadow="md"
                        isLoading={isLoadingProcess}
                        onClick={handleSubmit}
                      >
                        Daftarkan Aplikasi
                      </Button>
                    )}

                    <Button
                      leftIcon={<FiRotateCcw />}
                      size="sm"
                      variant="outline"
                      w="full"
                      rounded="xl"
                      onClick={() => {
                        setFormData(initialFormState);
                        setActiveStep(0);
                        setStepErrors({});
                      }}
                    >
                      Reset Form
                    </Button>

                    <Button
                      leftIcon={<FiX />}
                      size="sm"
                      variant="ghost"
                      w="full"
                      rounded="xl"
                      onClick={() => router.push("/master-data/Application")}
                    >
                      Batal
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}
