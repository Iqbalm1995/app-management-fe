"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  Select as ChakraSelect,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDatabase,
  FiDollarSign,
  FiEdit3,
  FiEye,
  FiFileText,
  FiGlobe,
  FiHardDrive,
  FiHelpCircle,
  FiInfo,
  FiLayers,
  FiLock,
  FiSave,
  FiSend,
  FiServer,
  FiShield,
  FiSliders,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";

import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { StatusBadge } from "@/app/components/StatusBadge";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  UpdateAssessmentDetailRequest,
  UpdateAssessmentRequest,
} from "@/app/services/useAppsCriticalReport";
import useMstAppsCriteriaCategory, {
  MstAppsCriteriaCategoryResponse,
} from "@/app/services/useMstAppsCriteriaCategory";
import useMstAppsCriteria, {
  MstAppsCriteriaResponse,
} from "@/app/services/useMstAppsCriteria";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  CRITERIA_VALUE_OPERATORS,
  DIVISION_ID_IT_BJB,
  ORG_CATEGORY_KEY_GROUP,
  ORG_GROUP_WHITELIST_ALL_ACCESS,
  ORG_GROUP_WHITELIST_ASSESMENT_RPO,
  ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS,
  ORG_GROUP_WHITELIST_FULL_OVERRIDE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";

// --- Mathematical Scoring Helpers ---
const evalOperator = (
  score: number,
  op: string,
  tracehold: number
): boolean => {
  switch (op) {
    case "=":
      return score === tracehold;
    case ">":
      return score > tracehold;
    case "<":
      return score < tracehold;
    case ">=":
      return score >= tracehold;
    case "<=":
      return score <= tracehold;
    case "!=":
      return score !== tracehold;
    default:
      return false;
  }
};

const matchCategory = (
  score: number,
  categories: MstAppsCriteriaCategoryResponse[]
): MstAppsCriteriaCategoryResponse | null => {
  const grouped = categories.reduce(
    (acc, c) => {
      if (!acc[c.crtCategoryName]) acc[c.crtCategoryName] = [];
      acc[c.crtCategoryName].push(c);
      return acc;
    },
    {} as Record<string, MstAppsCriteriaCategoryResponse[]>
  );

  for (const [, group] of Object.entries(grouped)) {
    const allPass = group.every((c) =>
      evalOperator(score, c.valueOperator, c.valueTracehold ?? 0)
    );
    if (allPass) return group[0];
  }
  return null;
};

const weightMap: Record<number, number> = {
  0: 0.2,
  1: 0.4,
  2: 0.6,
  3: 0.8,
  4: 1.0,
};

const STEP_ITEMS = [
  { step: 1, title: "General & SLA", desc: "App info, development & SLA readiness" },
  { step: 2, title: "Impact Flags", desc: "4 core business criticality flags" },
  { step: 3, title: "Criteria Scales", desc: "10 architecture & operational questions" },
  { step: 4, title: "Recovery Targets", desc: "RTO IT commitment & RPO" },
  { step: 5, title: "Review & Submit", desc: "Score calculation & action dispatch" },
];

export default function AssessmentWizardView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id");
  const sourceParam = searchParams.get("source") || "workspace";

  // Backend API Services
  const {
    GetAssessmentDetail,
    UpdateAssessment,
    UpdateAssessmentDetail,
    SubmitForApproval,
    CanApproveAssessment,
    ApproveAssessment,
    ResubmitAssessment,
    ReviseBatch,
  } = useAppsCriticalReport();
  const { List: ListCategory } = useMstAppsCriteriaCategory();
  const { List: ListCriteria } = useMstAppsCriteria();
  const { List: ListOrganization } = useOrganization();

  // Active Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Auth State
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Assessment Data & Master Reference Data
  const [data, setData] = useState<AppsCriticalReportAssessmentViewModel | null>(null);
  const [categories, setCategories] = useState<MstAppsCriteriaCategoryResponse[]>([]);
  const [criteriaList, setCriteriaList] = useState<MstAppsCriteriaResponse[]>([]);
  const [itGroupOptions, setItGroupOptions] = useState<OrganizationResponse[]>([]);

  // Loading & Action States
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [revising, setRevising] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);

  // Dialog States
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);

  // Form Field States: Flags
  const [flags, setFlags] = useState({
    isRelationWithCustomers: "FALSE",
    isTransactionalApp: "FALSE",
    isStrictCutoffTime: "FALSE",
    isRelationWithGov: "FALSE",
    isOnDevelopment: "FALSE",
    isSkipReview: "FALSE",
  });

  // Form Field States: Criteria Detail Selection (detailId -> valueId)
  const [detailSelections, setDetailSelections] = useState<Record<string, string>>({});

  // Form Field States: RTO / RPO
  const [rtoRpo, setRtoRpo] = useState({
    appsRtoSuggestionOperator: "" as string | null,
    appsRtoSuggestionMinutes: null as number | null,
    appsRtoItOperator: "" as string | null,
    appsRtoItMinutes: null as number | null,
    appsRpoOperator: "" as string | null,
    appsRpoMinutes: null as number | null,
  });

  // Manage Group Selection State
  const [selectedManageGroupId, setSelectedManageGroupId] = useState<string>("");
  const [selectedManageGroupCode, setSelectedManageGroupCode] = useState<string>("");
  const [selectedManageGroupName, setSelectedManageGroupName] = useState<string>("");

  // Load Auth from LocalStorage
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (!DataAuth && storedData) {
      setDataAuth(
        (JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse
      );
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

  // Load Reference Categories & Criteria List
  useEffect(() => {
    if (!tokenData) return;
    ListCategory(
      {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [],
        fieldOrder: ["valueTracehold"],
        orderDir: "asc",
      },
      tokenData
    ).then((r) => {
      if (r?.statusCode === RES_CODE_OK) setCategories(r.data || []);
    });

    ListCriteria(
      {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [],
        fieldOrder: ["criteriaPos"],
        orderDir: "asc",
      },
      tokenData
    ).then((r) => {
      if (r?.statusCode === RES_CODE_OK) setCriteriaList(r.data || []);
    });

    ListOrganization(
      {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [
          { field: "orgType", operator: "=", value: ORG_CATEGORY_KEY_GROUP },
          { field: "parentId", operator: "=", value: DIVISION_ID_IT_BJB },
        ],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      } as PaggingListPayload,
      tokenData
    ).then((r) => {
      if (r?.statusCode === RES_CODE_OK && r.data) {
        setItGroupOptions(r.data);
      }
    });
  }, [tokenData]);

  // Load Assessment Detail
  const loadData = useCallback(async () => {
    if (!tokenData || !assessmentId) return;
    setLoading(true);
    const res = await GetAssessmentDetail(assessmentId, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setData(res.data);
      setFlags({
        isRelationWithCustomers: res.data.isRelationWithCustomers || "FALSE",
        isTransactionalApp: res.data.isTransactionalApp || "FALSE",
        isStrictCutoffTime: res.data.isStrictCutoffTime || "FALSE",
        isRelationWithGov: res.data.isRelationWithGov || "FALSE",
        isOnDevelopment: res.data.isOnDevelopment || "FALSE",
        isSkipReview: res.data.isSkipReview || "FALSE",
      });
      setSelectedManageGroupId(res.data.appManageByGroupId || "");
      setSelectedManageGroupCode(res.data.appManageByGroupCode || "");
      setSelectedManageGroupName(res.data.appManageByGroupName || "");
      setRtoRpo({
        appsRtoSuggestionOperator: res.data.appsRtoSuggestionOperator || "",
        appsRtoSuggestionMinutes: res.data.appsRtoSuggestionMinutes ?? null,
        appsRtoItOperator: res.data.appsRtoItOperator || "",
        appsRtoItMinutes: res.data.appsRtoItMinutes ?? null,
        appsRpoOperator: res.data.appsRpoOperator || "",
        appsRpoMinutes: res.data.appsRpoMinutes ?? null,
      });

      const init: Record<string, string> = {};
      res.data.details?.forEach((d: any) => {
        if (d.appsCriteriaValuesId) init[d.id] = d.appsCriteriaValuesId;
      });
      setDetailSelections(init);

      // Check approver authorization
      const approveCheck = await CanApproveAssessment(assessmentId, tokenData);
      setCanApprove(
        approveCheck?.statusCode === RES_CODE_OK && approveCheck?.data === "true"
      );
    } else {
      showToast({
        description: res?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }
    setLoading(false);
  }, [tokenData, assessmentId]);

  useEffect(() => {
    if (tokenData && assessmentId) {
      loadData();
    }
  }, [tokenData, assessmentId, loadData]);

  // --- Whitelist & Permission Computation ---
  const userOrgGroupId =
    DataAuth?.team?.orgGroupId && DataAuth.team.orgGroupId !== "-"
      ? DataAuth.team.orgGroupId
      : null;

  const isWhitelisted = userOrgGroupId
    ? ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId)
    : false;

  const isDraft = data?.statusReport === "DRAFT";
  const isDeclined = data?.statusReport === "DECLINE";
  const isWaitingApproval1 = data?.statusReport === "WAITING APPROVAL 1";
  const isWaitingApproval2 = data?.statusReport === "WAITING APPROVAL 2";
  const isApproved = data?.statusReport === "APPROVED";

  const canOverrideWA2 = isWaitingApproval2 && isWhitelisted;

  const isRpoOnlyUser =
    DataAuth && userOrgGroupId
      ? ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) &&
        !ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId) &&
        !isWhitelisted
      : false;

  const rpoUserOwnsAssessment =
    isRpoOnlyUser &&
    !!userOrgGroupId &&
    !!data?.appManageByGroupId &&
    data.appManageByGroupId === userOrgGroupId;

  const isSubmitBlockedBase = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ALL_ACCESS.includes(userOrgGroupId) && !isWhitelisted
    : false;

  const isSubmitBlocked = isSubmitBlockedBase && !rpoUserOwnsAssessment;

  const canEditRtoSuggestion = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId)
    : false;

  const canEditRpo = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) ||
      ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId)
    : false;

  const canEditRtoIt = userOrgGroupId
    ? !ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) ||
      rpoUserOwnsAssessment
    : true;

  const canEditRpoWA2 =
    isWaitingApproval2 && canEditRpo && !isWhitelisted && !rpoUserOwnsAssessment;

  const isEditable =
    (isDraft || isDeclined || canOverrideWA2) &&
    (!isRpoOnlyUser || rpoUserOwnsAssessment);

  const canEditManageGroup =
    isEditable && userOrgGroupId
      ? ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId)
      : false;

  const isRtoSuggestionFilled =
    !!rtoRpo.appsRtoSuggestionOperator &&
    (rtoRpo.appsRtoSuggestionMinutes ?? 0) > 0;

  const isRpoFilled =
    !!rtoRpo.appsRpoOperator &&
    (rtoRpo.appsRpoMinutes ?? 0) > 0;

  const isSkipActive =
    flags.isOnDevelopment === "TRUE" && flags.isSkipReview === "TRUE";

  // --- Score & Calculation Engine ---
  const trueCount = useMemo(() => {
    return [
      flags.isRelationWithCustomers,
      flags.isTransactionalApp,
      flags.isStrictCutoffTime,
      flags.isRelationWithGov,
    ].filter((v) => v === "TRUE").length;
  }, [flags]);

  const weight = weightMap[trueCount] ?? 0.2;

  const detailScores = useMemo(() => {
    if (!data?.details) return {};
    const scores: Record<string, number | null> = {};
    data.details.forEach((d) => {
      const criteria = criteriaList.find((c) => c.id === d.appsCriteriaId);
      const selId = detailSelections[d.id];
      const val = criteria?.values?.find((v) => v.id === selId);
      scores[d.id] = val ? val.scaleValue : (d.appsCriteriaScaleValue ?? null);
    });
    return scores;
  }, [data, detailSelections, criteriaList]);

  const totalDetails = data?.details?.length || 0;
  const filledScores = Object.values(detailScores).filter(
    (v) => v !== null
  ) as number[];
  const crtScore = filledScores.reduce((s, v) => s + v, 0);
  const crtAverage = totalDetails > 0 ? crtScore / totalDetails : 0;
  const crtFinal = crtAverage + weight;

  const matchedCategory = useMemo(() => {
    if (isSkipActive || categories.length === 0) return null;
    return matchCategory(crtFinal, categories);
  }, [crtFinal, categories, isSkipActive]);

  const isScoreComplete =
    crtScore > 0 && crtAverage > 0 && weight > 0 && crtFinal > 0;

  const isRtoRpoComplete =
    !!rtoRpo.appsRtoSuggestionOperator &&
    (rtoRpo.appsRtoSuggestionMinutes ?? 0) > 0 &&
    !!rtoRpo.appsRtoItOperator &&
    (rtoRpo.appsRtoItMinutes ?? 0) > 0;

  const canSubmit = isSkipActive || (isScoreComplete && isRtoRpoComplete);

  // --- Save Handler ---
  const handleSave = async () => {
    if (!tokenData || !assessmentId || !data) return;
    setSaving(true);

    try {
      // 1. Save criteria details
      for (const detail of data.details || []) {
        const selId = detailSelections[detail.id];
        const criteria = criteriaList.find((c) => c.id === detail.appsCriteriaId);
        const val = criteria?.values?.find((v) => v.id === selId);
        const payload: UpdateAssessmentDetailRequest = {
          id: detail.id,
          appsCriteriaValuesId: selId || null,
          appsCriteriaScaleValue: val ? val.scaleValue : null,
          appsCriteriaScaleDesc: val ? val.scaleLabel : null,
        };
        await UpdateAssessmentDetail(payload, tokenData);
      }

      // 2. Save assessment header
      const assessPayload: UpdateAssessmentRequest = {
        id: assessmentId,
        ...flags,
        appManageByGroupId: selectedManageGroupId || null,
        appManageByGroupCode: selectedManageGroupCode || null,
        appManageByGroupName: selectedManageGroupName || null,
        appCrtCategoryId: isSkipActive ? null : (matchedCategory?.id || null),
        appCrtCategoryCode: isSkipActive ? null : (matchedCategory?.crtCategoryCode || null),
        appCrtCategoryName: isSkipActive ? null : (matchedCategory?.crtCategoryName || null),
        appCrtCategoryDesc: isSkipActive ? null : (matchedCategory?.crtCategoryDesc || null),
        appCrtCategoryValueOperator: isSkipActive ? null : (matchedCategory?.valueOperator || null),
        appCrtCategoryValueTracehold: isSkipActive ? 0 : (matchedCategory?.valueTracehold || 0),
        appsRtoSuggestionOperator: isSkipActive ? null : (rtoRpo.appsRtoSuggestionOperator || null),
        appsRtoSuggestionMinutes: isSkipActive ? null : rtoRpo.appsRtoSuggestionMinutes,
        appsRtoItOperator: isSkipActive ? null : (rtoRpo.appsRtoItOperator || null),
        appsRtoItMinutes: isSkipActive ? null : rtoRpo.appsRtoItMinutes,
        appsRpoOperator: isSkipActive ? null : (rtoRpo.appsRpoOperator || null),
        appsRpoMinutes: isSkipActive ? null : rtoRpo.appsRpoMinutes,
      };

      const res = await UpdateAssessment(assessPayload, tokenData);
      setSaving(false);

      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Assessment progress saved successfully",
          statusToast: "success",
        });
        loadData();
      } else {
        showToast({
          description: res?.message || "Failed to save assessment",
          statusToast: "error",
        });
      }
    } catch (err) {
      setSaving(false);
      console.error("Save error:", err);
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }
  };

  // --- Submit for Approval Handler ---
  const handleSubmitApproval = async () => {
    if (!tokenData || !assessmentId) return;
    setSubmitting(true);
    const res = await SubmitForApproval(assessmentId, tokenData);
    setSubmitting(false);

    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Assessment successfully submitted for Approval",
        statusToast: "success",
      });
      loadData();
    } else {
      showToast({
        description: res?.message || "Failed to submit assessment",
        statusToast: "error",
      });
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="500px">
          <VStack spacing={4}>
            <Spinner size="xl" color="secondary.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">
              Loading Application Assessment Wizard...
            </Text>
          </VStack>
        </Flex>
      </LayoutAdmin>
    );
  }

  const cardBg = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Application Criticality Assessment"
        breadCrumb={["Workspace", "Applications", "Assessment Wizard"]}
      />

      <Box p={{ base: 3, md: 6 }}>
        <VStack spacing={6} align="stretch" maxW="1320px" mx="auto">
          {/* Top Banner Header */}
          <Card
            borderRadius={radiusStyle}
            overflow="hidden"
            bgGradient="linear(to-br, secondary.800, secondary.600)"
            color="white"
            boxShadow="md"
            border="0"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <Flex
                direction={{ base: "column", lg: "row" }}
                justify="space-between"
                align={{ base: "start", lg: "center" }}
                gap={4}
              >
                <HStack spacing={4} align="center">
                  <IconButton
                    aria-label="Back to Applications"
                    icon={<FiArrowLeft />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => {
                      if (sourceParam === "workspace") {
                        router.push("/workspace/applications?tab=assessments");
                      } else {
                        router.back();
                      }
                    }}
                  />
                  <Avatar
                    size="md"
                    name={data?.appShortName || data?.appName || "APP"}
                    bg="whiteAlpha.300"
                    color="white"
                    borderRadius="xl"
                  />
                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={2} wrap="wrap">
                      <Heading size="md" color="white">
                        {data?.appName || "Application Assessment"}
                      </Heading>
                      {data?.appShortName && (
                        <Badge
                          bg="whiteAlpha.300"
                          color="white"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          {data.appShortName}
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={2} wrap="wrap">
                      <Badge fontSize="2xs" bg="whiteAlpha.200" color="white" fontFamily="mono">
                        {data?.batchCode}
                      </Badge>
                      <Badge fontSize="2xs" bg="whiteAlpha.200" color="white">
                        {data?.quartalReport} {data?.yearReport}
                      </Badge>
                      <Badge
                        fontSize="2xs"
                        colorScheme={
                          data?.statusReport === "APPROVED"
                            ? "green"
                            : data?.statusReport === "DECLINE"
                            ? "red"
                            : "yellow"
                        }
                        variant="solid"
                      >
                        {data?.statusReport}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>

                {/* Top Quick Actions */}
                <HStack spacing={2} wrap="wrap">
                  {isEditable && (
                    <Button
                      size="sm"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{ bg: "whiteAlpha.300" }}
                      leftIcon={<FiSave />}
                      isLoading={saving}
                      onClick={() => setIsSaveConfirmOpen(true)}
                    >
                      Save Draft
                    </Button>
                  )}
                  {isDraft && !isSubmitBlocked && !isWhitelisted && (
                    <Button
                      size="sm"
                      bg="orange.400"
                      color="white"
                      _hover={{ bg: "orange.300" }}
                      leftIcon={<FiSend />}
                      isLoading={submitting}
                      isDisabled={!canSubmit}
                      onClick={() => setIsSubmitConfirmOpen(true)}
                    >
                      Submit for Approval
                    </Button>
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Stepper Navigation Bar */}
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={radiusStyle}
            p={4}
            boxShadow="sm"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={3}
            >
              {STEP_ITEMS.map((item, idx) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;

                return (
                  <React.Fragment key={item.step}>
                    <Flex
                      align="center"
                      cursor="pointer"
                      onClick={() => setCurrentStep(item.step)}
                      p={2}
                      borderRadius="lg"
                      _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }}
                      transition="all 0.15s"
                      flex={1}
                      minW="160px"
                    >
                      <HStack spacing={3}>
                        <Flex
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          align="center"
                          justify="center"
                          fontSize="xs"
                          fontWeight="bold"
                          bg={
                            isCompleted
                              ? "green.500"
                              : isActive
                              ? "secondary.500"
                              : isDark
                              ? "gray.700"
                              : "gray.100"
                          }
                          color={
                            isCompleted || isActive
                              ? "white"
                              : isDark
                              ? "gray.400"
                              : "gray.600"
                          }
                          boxShadow={
                            isActive
                              ? "0 0 0 3px rgba(66, 153, 225, 0.35)"
                              : "none"
                          }
                          transition="all 0.2s"
                        >
                          {isCompleted ? <Icon as={FiCheck} /> : item.step}
                        </Flex>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            fontWeight={isActive ? "bold" : "semibold"}
                            color={
                              isActive
                                ? isDark
                                  ? "blue.300"
                                  : "secondary.600"
                                : isCompleted
                                ? isDark
                                  ? "green.300"
                                  : "green.600"
                                : isDark
                                ? "gray.400"
                                : "gray.500"
                            }
                          >
                            Step {item.step}: {item.title}
                          </Text>
                          <Text
                            fontSize="2xs"
                            color="gray.400"
                            noOfLines={1}
                            display={{ base: "none", lg: "block" }}
                          >
                            {item.desc}
                          </Text>
                        </VStack>
                      </HStack>
                    </Flex>
                    {idx < STEP_ITEMS.length - 1 && (
                      <Box
                        w={{ base: "full", md: "24px" }}
                        h={{ base: "1px", md: "2px" }}
                        bg={
                          currentStep > item.step
                            ? "green.500"
                            : isDark
                            ? "gray.700"
                            : "gray.200"
                        }
                        display={{ base: "none", md: "block" }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Flex>
          </Card>

          {/* STEP 1: General & Governance SLA Setup */}
          {currentStep === 1 && (
            <VStack spacing={5} align="stretch">
              {/* Alert: Unassigned Manage Group */}
              {(!selectedManageGroupId ||
                !selectedManageGroupName ||
                selectedManageGroupName === "-") && (
                <Card
                  rounded={radiusStyle}
                  shadow="sm"
                  border="1px"
                  borderColor={isDark ? "red.600" : "red.300"}
                  bg={isDark ? "gray.800" : "red.50"}
                >
                  <CardBody py={4} px={5}>
                    <HStack spacing={4} align="flex-start">
                      <Box
                        p={2.5}
                        bg={isDark ? "red.900" : "red.100"}
                        rounded="lg"
                        color="red.500"
                      >
                        <Icon as={FiAlertTriangle} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={2}>
                          <Heading size="sm" color={isDark ? "red.300" : "red.800"}>
                            Aplikasi Belum Memiliki Group Pengelola (Unassigned Manage Group)
                          </Heading>
                          <Badge colorScheme="red" variant="solid" fontSize="xs">
                            UNASSIGNED GROUP
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color={isDark ? "gray.300" : "red.700"}>
                          Aplikasi ini belum terhubung dengan Group IT Pengelola. Silakan
                          pilih Group IT Pengelola di bawah ini lalu simpan perubahan.
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              )}

              {/* Special Input: Aplikasi Masih Dalam Tahap Pengembangan? */}
              <Card
                rounded={radiusStyle}
                shadow="sm"
                border="1px"
                borderColor={
                  flags.isOnDevelopment === "TRUE"
                    ? isDark
                      ? "yellow.600"
                      : "yellow.300"
                    : borderColor
                }
                bg={cardBg}
              >
                <CardBody py={4} px={5}>
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "start", sm: "center" }}
                    gap={3}
                  >
                    <VStack align="start" spacing={0.5}>
                      <HStack spacing={2}>
                        <Heading size="sm">
                          Aplikasi Masih Dalam Tahap Pengembangan?
                        </Heading>
                        {flags.isOnDevelopment === "TRUE" && (
                          <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                            DALAM PENGEMBANGAN
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                        Indicates whether this application is currently in active development or non-production state.
                      </Text>
                    </VStack>
                    <HStack
                      spacing={0}
                      bg={isDark ? "gray.700" : "gray.100"}
                      rounded="md"
                      p={0.5}
                    >
                      <Box
                        as="button"
                        disabled={!isEditable}
                        onClick={() =>
                          isEditable &&
                          setFlags((prev) => ({ ...prev, isOnDevelopment: "TRUE" }))
                        }
                        px={4}
                        py={1.5}
                        rounded="md"
                        cursor={isEditable ? "pointer" : "default"}
                        bg={
                          flags.isOnDevelopment === "TRUE"
                            ? "yellow.500"
                            : "transparent"
                        }
                        color={
                          flags.isOnDevelopment === "TRUE"
                            ? "white"
                            : isDark
                            ? "gray.400"
                            : "gray.500"
                        }
                        fontWeight="semibold"
                        fontSize="xs"
                        transition="all 0.15s"
                        opacity={!isEditable ? 0.6 : 1}
                      >
                        Ya
                      </Box>
                      <Box
                        as="button"
                        disabled={!isEditable}
                        onClick={() =>
                          isEditable &&
                          setFlags((prev) => ({
                            ...prev,
                            isOnDevelopment: "FALSE",
                            isSkipReview: "FALSE",
                          }))
                        }
                        px={4}
                        py={1.5}
                        rounded="md"
                        cursor={isEditable ? "pointer" : "default"}
                        bg={
                          flags.isOnDevelopment === "FALSE"
                            ? "gray.500"
                            : "transparent"
                        }
                        color={
                          flags.isOnDevelopment === "FALSE"
                            ? "white"
                            : isDark
                            ? "gray.400"
                            : "gray.500"
                        }
                        fontWeight="semibold"
                        fontSize="xs"
                        transition="all 0.15s"
                        opacity={!isEditable ? 0.6 : 1}
                      >
                        Tidak
                      </Box>
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>

              {/* Special Input: Lewati Review untuk Assessment Ini? (Only if On Development) */}
              {flags.isOnDevelopment === "TRUE" && (
                <Card
                  rounded={radiusStyle}
                  shadow="sm"
                  border="1px"
                  borderColor={
                    flags.isSkipReview === "TRUE"
                      ? isDark
                        ? "orange.600"
                        : "orange.300"
                      : borderColor
                  }
                  bg={cardBg}
                >
                  <CardBody py={4} px={5}>
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "start", sm: "center" }}
                      gap={3}
                    >
                      <VStack align="start" spacing={0.5}>
                        <HStack spacing={2}>
                          <Heading size="sm">
                            Lewati Review untuk Assessment Ini?
                          </Heading>
                          {flags.isSkipReview === "TRUE" && (
                            <Badge colorScheme="orange" variant="solid" fontSize="xs">
                              LEWATI REVIEW
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                          Jika dilewati, assessment ini akan melewati proses kriteria dan langsung dapat disubmit tanpa mengisi 10 kriteria.
                        </Text>
                      </VStack>
                      <HStack
                        spacing={0}
                        bg={isDark ? "gray.700" : "gray.100"}
                        rounded="md"
                        p={0.5}
                      >
                        <Box
                          as="button"
                          disabled={!isEditable}
                          onClick={() => {
                            if (isEditable) {
                              setFlags((prev) => ({ ...prev, isSkipReview: "TRUE" }));
                              showToast({
                                description:
                                  "Tahap review dilewati. Anda dapat langsung submit draft.",
                                statusToast: "info",
                              });
                            }
                          }}
                          px={4}
                          py={1.5}
                          rounded="md"
                          cursor={isEditable ? "pointer" : "default"}
                          bg={
                            flags.isSkipReview === "TRUE"
                              ? "orange.500"
                              : "transparent"
                          }
                          color={
                            flags.isSkipReview === "TRUE"
                              ? "white"
                              : isDark
                              ? "gray.400"
                              : "gray.500"
                          }
                          fontWeight="semibold"
                          fontSize="xs"
                          transition="all 0.15s"
                          opacity={!isEditable ? 0.6 : 1}
                        >
                          Ya
                        </Box>
                        <Box
                          as="button"
                          disabled={!isEditable}
                          onClick={() => {
                            if (isEditable) {
                              setFlags((prev) => ({ ...prev, isSkipReview: "FALSE" }));
                            }
                          }}
                          px={4}
                          py={1.5}
                          rounded="md"
                          cursor={isEditable ? "pointer" : "default"}
                          bg={
                            flags.isSkipReview === "FALSE"
                              ? "gray.500"
                              : "transparent"
                          }
                          color={
                            flags.isSkipReview === "FALSE"
                              ? "white"
                              : isDark
                              ? "gray.400"
                              : "gray.500"
                          }
                          fontWeight="semibold"
                          fontSize="xs"
                          transition="all 0.15s"
                          opacity={!isEditable ? 0.6 : 1}
                        >
                          Tidak
                        </Box>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              )}

              {/* Governance Review Proof & SLA Prerequisite Section (RTO Suggestion & RPO) */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                {/* 1. RTO Suggestion (IAG Benchmark SLA Proof - Detailed with Operator & Value) */}
                <Card
                  rounded={radiusStyle}
                  shadow="sm"
                  border="1px solid"
                  borderColor={
                    isRtoSuggestionFilled
                      ? isDark
                        ? "green.600"
                        : "green.300"
                      : isDark
                      ? "orange.600"
                      : "orange.300"
                  }
                  bg={
                    isRtoSuggestionFilled
                      ? isDark
                        ? "whiteAlpha.50"
                        : "green.50"
                      : isDark
                      ? "gray.800"
                      : "orange.50"
                  }
                >
                  <CardHeader py={3.5} px={5} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2.5}>
                        <Icon
                          as={isRtoSuggestionFilled ? FiCheckCircle : FiShield}
                          color={isRtoSuggestionFilled ? "green.500" : "orange.500"}
                          boxSize={5}
                        />
                        <Heading size="xs">
                          RTO Suggestion (IAG Benchmark SLA)
                        </Heading>
                      </HStack>
                      <Badge
                        colorScheme={isRtoSuggestionFilled ? "green" : "orange"}
                        variant="solid"
                        fontSize="2xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                      >
                        {isRtoSuggestionFilled ? "REVIEWED BY IAG" : "BELUM DIREVIEW"}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody p={5}>
                    {isRtoSuggestionFilled ? (
                      <VStack align="stretch" spacing={3}>
                        {/* Operator & Value Breakdown Cards */}
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                          <Card p={3} bg={isDark ? "gray.900" : "white"} borderRadius="md" border="1px solid" borderColor={isDark ? "gray.700" : "green.200"}>
                            <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                              Operator
                            </Text>
                            <HStack spacing={2} mt={1}>
                              <Badge colorScheme="blue" fontSize="sm" px={2} py={0.5} fontFamily="mono" borderRadius="md">
                                {rtoRpo.appsRtoSuggestionOperator || "<="}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {rtoRpo.appsRtoSuggestionOperator === "<="
                                  ? "Less than / equal"
                                  : rtoRpo.appsRtoSuggestionOperator === "<"
                                  ? "Strictly less than"
                                  : "Exact match"}
                              </Text>
                            </HStack>
                          </Card>

                          <Card p={3} bg={isDark ? "gray.900" : "white"} borderRadius="md" border="1px solid" borderColor={isDark ? "gray.700" : "green.200"}>
                            <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                              Benchmark Value
                            </Text>
                            <HStack spacing={2} mt={1}>
                              <Heading size="sm" color={isDark ? "green.300" : "green.700"}>
                                {rtoRpo.appsRtoSuggestionMinutes} Mins
                              </Heading>
                              <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                                {rtoRpo.appsRtoSuggestionMinutes! >= 60
                                  ? `${(rtoRpo.appsRtoSuggestionMinutes! / 60).toFixed(1)} Hours`
                                  : `${rtoRpo.appsRtoSuggestionMinutes}m`}
                              </Badge>
                            </HStack>
                          </Card>
                        </SimpleGrid>

                        <HStack spacing={2} p={2.5} bg={isDark ? "whiteAlpha.100" : "white"} borderRadius="md" border="1px dashed" borderColor={isDark ? "gray.600" : "green.300"}>
                          <Icon as={FiCheck} color="green.500" />
                          <Text fontSize="xs" fontWeight="semibold" color={isDark ? "green.300" : "green.800"}>
                            Combined Target: {rtoRpo.appsRtoSuggestionOperator || "<="} {rtoRpo.appsRtoSuggestionMinutes} Minutes
                          </Text>
                        </HStack>

                        <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"}>
                          RTO Suggestion telah ditinjau dan ditetapkan oleh IT Assurance & Governance (IAG). Pada Step 4, IT Group Pengelola dapat menyanggupi target <b>RTO IT</b> sesuai baseline ini.
                        </Text>

                        {canEditRtoSuggestion && (
                          <Box pt={2} borderTop="1px dashed" borderColor={borderColor}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={2}>
                              IAG Whitelist Edit Controls:
                            </Text>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                              <Box>
                                <Text fontSize="2xs" color="gray.500" mb={1}>
                                  Operator:
                                </Text>
                                <ChakraSelect
                                  size="xs"
                                  borderRadius="md"
                                  value={rtoRpo.appsRtoSuggestionOperator || "<="}
                                  onChange={(e) =>
                                    setRtoRpo((p) => ({
                                      ...p,
                                      appsRtoSuggestionOperator: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="<=">&le; (Less than or equal)</option>
                                  <option value="<">&lt; (Less than)</option>
                                  <option value="=">= (Equal)</option>
                                </ChakraSelect>
                              </Box>
                              <Box>
                                <Text fontSize="2xs" color="gray.500" mb={1}>
                                  Value (Minutes):
                                </Text>
                                <Input
                                  size="xs"
                                  placeholder="Minutes"
                                  type="number"
                                  value={rtoRpo.appsRtoSuggestionMinutes ?? ""}
                                  onChange={(e) =>
                                    setRtoRpo((p) => ({
                                      ...p,
                                      appsRtoSuggestionMinutes: parseInt(e.target.value) || null,
                                    }))
                                  }
                                />
                              </Box>
                            </SimpleGrid>
                          </Box>
                        )}
                      </VStack>
                    ) : (
                      <VStack align="start" spacing={3}>
                        <Text
                          fontSize="xs"
                          color={isDark ? "orange.200" : "orange.800"}
                          lineHeight="relaxed"
                        >
                          <b>RTO Pada Aplikasi ini Belum Dilakukan Review oleh IAG.</b>{" "}
                          Aplikasi ini belum melalui proses peninjauan dan pengisian RTO
                          Suggestion (Operator dan Nilai Benchmark) oleh IAG. Silakan hubungi tim IAG untuk melengkapi RTO
                          Suggestion sebelum final submission. Anda tetap dapat melanjutkan
                          pengisian kriteria lainnya.
                        </Text>

                        {canEditRtoSuggestion && (
                          <Box w="full" pt={2} borderTop="1px dashed" borderColor="orange.300">
                            <Text fontSize="xs" fontWeight="bold" mb={2} color="orange.600">
                              Isi RTO Suggestion (IAG Access):
                            </Text>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                              <Box>
                                <Text fontSize="2xs" color="gray.500" mb={1}>
                                  Operator:
                                </Text>
                                <ChakraSelect
                                  size="xs"
                                  borderRadius="md"
                                  value={rtoRpo.appsRtoSuggestionOperator || "<="}
                                  onChange={(e) =>
                                    setRtoRpo((p) => ({
                                      ...p,
                                      appsRtoSuggestionOperator: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="<=">&le; (Less than or equal)</option>
                                  <option value="<">&lt; (Less than)</option>
                                  <option value="=">= (Equal)</option>
                                </ChakraSelect>
                              </Box>
                              <Box>
                                <Text fontSize="2xs" color="gray.500" mb={1}>
                                  Value (Minutes):
                                </Text>
                                <Input
                                  size="xs"
                                  placeholder="Minutes"
                                  type="number"
                                  value={rtoRpo.appsRtoSuggestionMinutes ?? ""}
                                  onChange={(e) =>
                                    setRtoRpo((p) => ({
                                      ...p,
                                      appsRtoSuggestionMinutes: parseInt(e.target.value) || null,
                                    }))
                                  }
                                />
                              </Box>
                            </SimpleGrid>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </CardBody>
                </Card>

                {/* 2. RPO Target (BMT / DR SLA Proof - Detailed with Operator & Value) */}
                <Card
                  rounded={radiusStyle}
                  shadow="sm"
                  border="1px solid"
                  borderColor={
                    isRpoFilled
                      ? isDark
                        ? "purple.600"
                        : "purple.300"
                      : isDark
                      ? "gray.700"
                      : "gray.200"
                  }
                  bg={
                    isRpoFilled
                      ? isDark
                        ? "whiteAlpha.50"
                        : "purple.50"
                      : cardBg
                  }
                >
                  <CardHeader py={3.5} px={5} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2.5}>
                        <Icon as={FiHardDrive} color="purple.500" boxSize={5} />
                        <Heading size="xs">
                          RPO Target (Business Continuity / BMT)
                        </Heading>
                      </HStack>
                      <Badge
                        colorScheme={isRpoFilled ? "purple" : "gray"}
                        variant={isRpoFilled ? "solid" : "subtle"}
                        fontSize="2xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                      >
                        {isRpoFilled ? "REVIEWED BY BMT" : "STAGE 2 REVIEW"}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={3}>
                      {isRpoFilled ? (
                        <>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                            <Card p={3} bg={isDark ? "gray.900" : "white"} borderRadius="md" border="1px solid" borderColor={isDark ? "gray.700" : "purple.200"}>
                              <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                                Operator
                              </Text>
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme="purple" fontSize="sm" px={2} py={0.5} fontFamily="mono" borderRadius="md">
                                  {rtoRpo.appsRpoOperator || "<="}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  {rtoRpo.appsRpoOperator === "<="
                                    ? "Less than / equal"
                                    : rtoRpo.appsRpoOperator === "<"
                                    ? "Strictly less than"
                                    : "Exact match"}
                                </Text>
                              </HStack>
                            </Card>

                            <Card p={3} bg={isDark ? "gray.900" : "white"} borderRadius="md" border="1px solid" borderColor={isDark ? "gray.700" : "purple.200"}>
                              <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                                RPO Value
                              </Text>
                              <HStack spacing={2} mt={1}>
                                <Heading size="sm" color="purple.500">
                                  {rtoRpo.appsRpoMinutes} Mins
                                </Heading>
                                <Badge colorScheme="purple" variant="subtle" fontSize="2xs">
                                  {rtoRpo.appsRpoMinutes! >= 60
                                    ? `${(rtoRpo.appsRpoMinutes! / 60).toFixed(1)} Hours`
                                    : `${rtoRpo.appsRpoMinutes}m`}
                                </Badge>
                              </HStack>
                            </Card>
                          </SimpleGrid>

                          <HStack spacing={2} p={2.5} bg={isDark ? "whiteAlpha.100" : "white"} borderRadius="md" border="1px dashed" borderColor={isDark ? "gray.600" : "purple.300"}>
                            <Icon as={FiCheck} color="purple.500" />
                            <Text fontSize="xs" fontWeight="semibold" color={isDark ? "purple.300" : "purple.800"}>
                              Combined Target: {rtoRpo.appsRpoOperator || "<="} {rtoRpo.appsRpoMinutes} Minutes
                            </Text>
                          </HStack>
                        </>
                      ) : (
                        <Text fontSize="xs" color="gray.500" lineHeight="relaxed">
                          <b>RPO (Recovery Point Objective)</b> ditinjau dan ditentukan oleh tim BMT (Business Continuity Management & Disaster Recovery) pada tahap Approval 2 (WAITING APPROVAL 2).
                        </Text>
                      )}

                      {canEditRpo && (
                        <Box pt={2} borderTop="1px dashed" borderColor={borderColor}>
                          <Text fontSize="2xs" color="purple.500" fontWeight="bold" mb={2}>
                            BMT Whitelist Override:
                          </Text>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                            <Box>
                              <Text fontSize="2xs" color="gray.500" mb={1}>
                                Operator:
                              </Text>
                              <ChakraSelect
                                size="xs"
                                borderRadius="md"
                                value={rtoRpo.appsRpoOperator || "<="}
                                onChange={(e) =>
                                  setRtoRpo((p) => ({
                                    ...p,
                                    appsRpoOperator: e.target.value,
                                  }))
                                }
                              >
                                <option value="<=">&le; (Less than or equal)</option>
                                <option value="<">&lt; (Less than)</option>
                                <option value="=">= (Equal)</option>
                              </ChakraSelect>
                            </Box>
                            <Box>
                              <Text fontSize="2xs" color="gray.500" mb={1}>
                                Value (Minutes):
                              </Text>
                              <Input
                                size="xs"
                                placeholder="Minutes"
                                type="number"
                                value={rtoRpo.appsRpoMinutes ?? ""}
                                onChange={(e) =>
                                  setRtoRpo((p) => ({
                                    ...p,
                                    appsRpoMinutes: parseInt(e.target.value) || null,
                                  }))
                                }
                              />
                            </Box>
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Application Details Summary Grid */}
              <Card
                rounded={radiusStyle}
                shadow="sm"
                border="1px"
                borderColor={borderColor}
                bg={cardBg}
              >
                <CardHeader py={3.5} px={5} borderBottom="1px solid" borderColor={borderColor}>
                  <Heading size="sm">Application Profile & Ownership</Heading>
                </CardHeader>
                <CardBody p={5}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    <Box>
                      <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                        Application Name
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {data?.appName || "—"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                        Short Name / Code
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {data?.appShortName || "—"} ({data?.appCode || "NO CODE"})
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                        Managing IT Group
                      </Text>
                      {canEditManageGroup ? (
                        <ChakraSelect
                          size="xs"
                          borderRadius="md"
                          mt={1}
                          value={selectedManageGroupId}
                          onChange={(e) => {
                            const id = e.target.value;
                            setSelectedManageGroupId(id);
                            const org = itGroupOptions.find((g) => g.id === id);
                            if (org) {
                              setSelectedManageGroupCode(org.orgCode || "");
                              setSelectedManageGroupName(org.orgName || "");
                            }
                          }}
                        >
                          <option value="">-- Select Group --</option>
                          {itGroupOptions.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.orgName}
                            </option>
                          ))}
                        </ChakraSelect>
                      ) : (
                        <Text fontSize="sm" fontWeight="semibold">
                          {selectedManageGroupName || data?.appManageByGroupName || "—"}
                        </Text>
                      )}
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          )}

          {/* STEP 2: Business & Operational Impact Flags */}
          {currentStep === 2 && (
            <VStack spacing={5} align="stretch">
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "start", md: "center" }}
                  gap={4}
                  mb={4}
                >
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">Business Impact Flags (Weight Modifiers)</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Select the business characteristics applicable to this system. Each positive flag increases the criticality weight score.
                    </Text>
                  </VStack>
                  <Card bg={isDark ? "blue.900" : "blue.50"} p={3} borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <HStack spacing={3}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="2xs" color="gray.500" textTransform="uppercase">
                          Calculated Weight
                        </Text>
                        <Heading size="md" color="secondary.500">
                          +{weight.toFixed(2)}
                        </Heading>
                      </VStack>
                      <Divider orientation="vertical" h="30px" />
                      <Text fontSize="xs" color="gray.600">
                        <b>{trueCount} of 4</b> flags active
                      </Text>
                    </HStack>
                  </Card>
                </Flex>

                <Divider mb={4} />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Flag 1: Customer Relation */}
                  <Card
                    p={4}
                    border="1px solid"
                    borderColor={
                      flags.isRelationWithCustomers === "TRUE" ? "blue.400" : borderColor
                    }
                    bg={
                      flags.isRelationWithCustomers === "TRUE"
                        ? isDark
                          ? "whiteAlpha.50"
                          : "blue.50"
                        : cardBg
                    }
                    borderRadius="lg"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiUsers} fontSize="20px" color="blue.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            Direct Customer Relation
                          </Text>
                          <Text fontSize="2xs" color="gray.500">
                            Aplikasi Berhubungan Langsung dengan Nasabah
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={flags.isRelationWithCustomers === "TRUE"}
                        isDisabled={!isEditable}
                        colorScheme="blue"
                        onChange={(e) =>
                          setFlags((p) => ({
                            ...p,
                            isRelationWithCustomers: e.target.checked ? "TRUE" : "FALSE",
                          }))
                        }
                      />
                    </Flex>
                  </Card>

                  {/* Flag 2: Transactional */}
                  <Card
                    p={4}
                    border="1px solid"
                    borderColor={
                      flags.isTransactionalApp === "TRUE" ? "green.400" : borderColor
                    }
                    bg={
                      flags.isTransactionalApp === "TRUE"
                        ? isDark
                          ? "whiteAlpha.50"
                          : "green.50"
                        : cardBg
                    }
                    borderRadius="lg"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiDollarSign} fontSize="20px" color="green.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            Transactional Processing
                          </Text>
                          <Text fontSize="2xs" color="gray.500">
                            Aplikasi Memproses Transaksi Finansial / Core
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={flags.isTransactionalApp === "TRUE"}
                        isDisabled={!isEditable}
                        colorScheme="green"
                        onChange={(e) =>
                          setFlags((p) => ({
                            ...p,
                            isTransactionalApp: e.target.checked ? "TRUE" : "FALSE",
                          }))
                        }
                      />
                    </Flex>
                  </Card>

                  {/* Flag 3: Strict Cutoff */}
                  <Card
                    p={4}
                    border="1px solid"
                    borderColor={
                      flags.isStrictCutoffTime === "TRUE" ? "orange.400" : borderColor
                    }
                    bg={
                      flags.isStrictCutoffTime === "TRUE"
                        ? isDark
                          ? "whiteAlpha.50"
                          : "orange.50"
                        : cardBg
                    }
                    borderRadius="lg"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiClock} fontSize="20px" color="orange.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            Strict Cutoff Time SLA
                          </Text>
                          <Text fontSize="2xs" color="gray.500">
                            Memiliki Batas Waktu Cut-Off Harian / Kliring
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={flags.isStrictCutoffTime === "TRUE"}
                        isDisabled={!isEditable}
                        colorScheme="orange"
                        onChange={(e) =>
                          setFlags((p) => ({
                            ...p,
                            isStrictCutoffTime: e.target.checked ? "TRUE" : "FALSE",
                          }))
                        }
                      />
                    </Flex>
                  </Card>

                  {/* Flag 4: Regulatory / Gov */}
                  <Card
                    p={4}
                    border="1px solid"
                    borderColor={
                      flags.isRelationWithGov === "TRUE" ? "purple.400" : borderColor
                    }
                    bg={
                      flags.isRelationWithGov === "TRUE"
                        ? isDark
                          ? "whiteAlpha.50"
                          : "purple.50"
                        : cardBg
                    }
                    borderRadius="lg"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiShield} fontSize="20px" color="purple.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            Government / Regulatory Compliance
                          </Text>
                          <Text fontSize="2xs" color="gray.500">
                            Kepatuhan Pelaporan Regulator (BI / OJK / Pajak)
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={flags.isRelationWithGov === "TRUE"}
                        isDisabled={!isEditable}
                        colorScheme="purple"
                        onChange={(e) =>
                          setFlags((p) => ({
                            ...p,
                            isRelationWithGov: e.target.checked ? "TRUE" : "FALSE",
                          }))
                        }
                      />
                    </Flex>
                  </Card>
                </SimpleGrid>
              </Card>
            </VStack>
          )}

          {/* STEP 3: 10 Architectural Criteria Scales (Showing Points per Assessment Question) */}
          {currentStep === 3 && (
            <VStack spacing={5} align="stretch">
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "start", md: "center" }}
                  gap={4}
                  mb={4}
                >
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">Architectural & Operational Criteria</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Answer all 10 criteria questions. Each scale grants 1 to 5 points which calculate your criteria average.
                    </Text>
                  </VStack>
                  <HStack spacing={3} wrap="wrap">
                    <Card p={2.5} px={3.5} bg={isDark ? "blue.900" : "blue.50"} borderRadius="md" border="1px solid" borderColor="blue.200">
                      <HStack spacing={2}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                          Total Points:
                        </Text>
                        <Heading size="xs" color="secondary.500">
                          {crtScore} / {totalDetails * 5} pts
                        </Heading>
                      </HStack>
                    </Card>
                    <Card p={2.5} px={3.5} bg={isDark ? "purple.900" : "purple.50"} borderRadius="md" border="1px solid" borderColor="purple.200">
                      <HStack spacing={2}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                          Average:
                        </Text>
                        <Heading size="xs" color="purple.500">
                          {crtAverage.toFixed(2)} / 5.00
                        </Heading>
                      </HStack>
                    </Card>
                  </HStack>
                </Flex>

                <HStack justify="space-between" mb={2}>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                    Completion Progress ({filledScores.length} of {totalDetails} Answered)
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color={filledScores.length === totalDetails ? "green.500" : "blue.500"}>
                    {totalDetails > 0 ? Math.round((filledScores.length / totalDetails) * 100) : 0}%
                  </Text>
                </HStack>

                <Progress
                  value={totalDetails > 0 ? (filledScores.length / totalDetails) * 100 : 0}
                  size="xs"
                  colorScheme={filledScores.length === totalDetails ? "green" : "blue"}
                  borderRadius="full"
                  mb={6}
                />

                {/* Criteria Cards List */}
                <VStack spacing={4} align="stretch">
                  {data?.details?.map((detail, idx) => {
                    const criteria = criteriaList.find(
                      (c) => c.id === detail.appsCriteriaId
                    );
                    const selectedValId = detailSelections[detail.id];
                    const selectedVal = criteria?.values?.find(
                      (v) => v.id === selectedValId
                    );
                    const currentPoints = selectedVal ? selectedVal.scaleValue : (detail.appsCriteriaScaleValue ?? 0);

                    return (
                      <Card
                        key={detail.id}
                        p={4}
                        border="1px solid"
                        borderColor={selectedVal ? "blue.300" : borderColor}
                        bg={
                          selectedVal
                            ? isDark
                              ? "whiteAlpha.50"
                              : "blue.50"
                            : cardBg
                        }
                        borderRadius="xl"
                        transition="all 0.15s"
                      >
                        <VStack align="stretch" spacing={3}>
                          {/* Card Header with Question Points */}
                          <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={2}>
                            <HStack spacing={2} wrap="wrap">
                              <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={0.5} borderRadius="md">
                                Question #{idx + 1}
                              </Badge>
                              <Heading size="xs">
                                {detail.appsCriteriaName || criteria?.criteriaName}
                              </Heading>
                            </HStack>
                            <HStack spacing={2}>
                              {currentPoints > 0 ? (
                                <Badge colorScheme="green" variant="solid" fontSize="xs" px={2.5} py={1} borderRadius="md">
                                  Score: +{currentPoints} Pts ({selectedVal?.scaleLabel || detail.appsCriteriaScaleDesc || "Selected"})
                                </Badge>
                              ) : (
                                <Badge colorScheme="orange" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                                  0 Pts (Pending Answer)
                                </Badge>
                              )}
                            </HStack>
                          </Flex>

                          <Text fontSize="xs" color="gray.500">
                            {detail.appsCriteriaDesc || criteria?.criteriaDesc}
                          </Text>

                          {/* Scale Choice Buttons with Point Highlights */}
                          <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={2.5}>
                            {criteria?.values?.map((val) => {
                              const isValSelected = selectedValId === val.id;
                              return (
                                <Button
                                  key={val.id}
                                  size="sm"
                                  variant={isValSelected ? "solid" : "outline"}
                                  colorScheme={isValSelected ? "blue" : "gray"}
                                  isDisabled={!isEditable}
                                  onClick={() => {
                                    if (isEditable) {
                                      setDetailSelections((p) => ({
                                        ...p,
                                        [detail.id]: val.id,
                                      }));
                                    }
                                  }}
                                  justifyContent="start"
                                  p={3}
                                  h="auto"
                                  whiteSpace="normal"
                                  textAlign="left"
                                  borderRadius="lg"
                                  border="1.5px solid"
                                  borderColor={isValSelected ? "blue.500" : isDark ? "gray.600" : "gray.200"}
                                  boxShadow={isValSelected ? "0 0 0 2px rgba(66, 153, 225, 0.3)" : "none"}
                                >
                                  <VStack align="start" spacing={1} w="full">
                                    <Flex justify="space-between" align="center" w="full">
                                      <Text fontWeight="bold" fontSize="xs">
                                        Scale {val.scaleValue}
                                      </Text>
                                      <Badge
                                        colorScheme={isValSelected ? "white" : "blue"}
                                        variant={isValSelected ? "outline" : "subtle"}
                                        fontSize="2xs"
                                        px={1.5}
                                      >
                                        +{val.scaleValue} Pts
                                      </Badge>
                                    </Flex>
                                    <Text fontSize="2xs" opacity={0.9} noOfLines={3}>
                                      {val.scaleLabel}
                                    </Text>
                                  </VStack>
                                </Button>
                              );
                            })}
                          </SimpleGrid>
                        </VStack>
                      </Card>
                    );
                  })}
                </VStack>
              </Card>
            </VStack>
          )}

          {/* STEP 4: IT Recovery Targets (RTO IT & SLA Commitment with SLA Alignment Comparison) */}
          {currentStep === 4 && (
            <VStack spacing={5} align="stretch">
              {/* SLA Benchmark Alignment Banner */}
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={isRtoSuggestionFilled ? "blue.300" : borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Heading size="sm" mb={1}>
                  SLA Benchmark Alignment & Recovery Targets
                </Heading>
                <Text fontSize="xs" color="gray.500" mb={4}>
                  Compare the IAG RTO Suggestion benchmark against the IT Group recovery commitments.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {/* IAG Benchmark Display */}
                  <Card p={4} bg={isDark ? "gray.900" : "blue.50"} borderRadius="lg" border="1px solid" borderColor={isDark ? "gray.700" : "blue.200"}>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      IAG RTO Suggestion (Benchmark)
                    </Text>
                    <HStack spacing={2} mt={2}>
                      <Badge colorScheme="blue" fontSize="sm" px={2} py={0.5} fontFamily="mono" borderRadius="md">
                        {rtoRpo.appsRtoSuggestionOperator || "<="}
                      </Badge>
                      <Heading size="md" color="secondary.500">
                        {rtoRpo.appsRtoSuggestionMinutes ? `${rtoRpo.appsRtoSuggestionMinutes}m` : "Not Set"}
                      </Heading>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      {rtoRpo.appsRtoSuggestionMinutes
                        ? `Official baseline target set by IAG (${(rtoRpo.appsRtoSuggestionMinutes / 60).toFixed(1)} hrs)`
                        : "Pending review by IAG"}
                    </Text>
                  </Card>

                  {/* Committed RTO IT Display */}
                  <Card p={4} bg={isDark ? "gray.900" : "teal.50"} borderRadius="lg" border="1px solid" borderColor={isDark ? "gray.700" : "teal.200"}>
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      RTO IT (IT Group Commitment)
                    </Text>
                    <HStack spacing={2} mt={2}>
                      <Badge colorScheme="teal" fontSize="sm" px={2} py={0.5} fontFamily="mono" borderRadius="md">
                        {rtoRpo.appsRtoItOperator || "<="}
                      </Badge>
                      <Heading size="md" color="teal.500">
                        {rtoRpo.appsRtoItMinutes ? `${rtoRpo.appsRtoItMinutes}m` : "Not Configured"}
                      </Heading>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      {rtoRpo.appsRtoItMinutes
                        ? `Committed recovery duration (${(rtoRpo.appsRtoItMinutes / 60).toFixed(1)} hrs)`
                        : "Select or input target below"}
                    </Text>
                  </Card>

                  {/* SLA Alignment Status */}
                  <Card
                    p={4}
                    bg={
                      !rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                        ? isDark
                          ? "gray.900"
                          : "gray.50"
                        : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                        ? isDark
                          ? "green.900"
                          : "green.50"
                        : isDark
                        ? "orange.900"
                        : "orange.50"
                    }
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={
                      !rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                        ? borderColor
                        : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                        ? "green.300"
                        : "orange.300"
                    }
                  >
                    <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                      SLA Alignment Status
                    </Text>
                    <HStack spacing={2} mt={2}>
                      <Icon
                        as={
                          !rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                            ? FiAlertCircle
                            : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                            ? FiCheckCircle
                            : FiAlertTriangle
                        }
                        color={
                          !rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                            ? "gray.400"
                            : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                            ? "green.500"
                            : "orange.500"
                        }
                        boxSize={5}
                      />
                      <Heading
                        size="sm"
                        color={
                          !rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                            ? "gray.500"
                            : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                            ? "green.600"
                            : "orange.600"
                        }
                      >
                        {!rtoRpo.appsRtoItMinutes || !rtoRpo.appsRtoSuggestionMinutes
                          ? "Pending Alignment"
                          : rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                          ? "Satisfies IAG SLA"
                          : "Exceeds IAG Suggestion"}
                      </Heading>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      {rtoRpo.appsRtoItMinutes && rtoRpo.appsRtoSuggestionMinutes
                        ? rtoRpo.appsRtoItMinutes <= rtoRpo.appsRtoSuggestionMinutes
                          ? "Committed recovery time meets or outperforms benchmark."
                          : "Committed recovery time exceeds the IAG benchmark target."
                        : "Complete both RTO inputs to evaluate alignment."}
                    </Text>
                  </Card>
                </SimpleGrid>
              </Card>

              {/* RTO IT Input Box & RPO Box */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* RTO IT Input Box */}
                <Card p={5} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius={radiusStyle} boxShadow="sm">
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="secondary.500" />
                      <Heading size="xs">RTO IT (Committed Recovery Time)</Heading>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500">
                      Target waktu pemulihan sistem yang disanggupi oleh IT Group Pengelola.
                    </Text>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} pt={2}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={1}>
                          Operator:
                        </Text>
                        <ChakraSelect
                          size="sm"
                          borderRadius="md"
                          value={rtoRpo.appsRtoItOperator || "<="}
                          isDisabled={!canEditRtoIt}
                          onChange={(e) =>
                            setRtoRpo((p) => ({
                              ...p,
                              appsRtoItOperator: e.target.value,
                            }))
                          }
                        >
                          <option value="<=">&le; (Less than or equal)</option>
                          <option value="<">&lt; (Less than)</option>
                          <option value="=">= (Equal)</option>
                        </ChakraSelect>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={1}>
                          Value (Minutes):
                        </Text>
                        <Input
                          size="sm"
                          placeholder="Minutes"
                          type="number"
                          value={rtoRpo.appsRtoItMinutes ?? ""}
                          isDisabled={!canEditRtoIt}
                          onChange={(e) =>
                            setRtoRpo((p) => ({
                              ...p,
                              appsRtoItMinutes: parseInt(e.target.value) || null,
                            }))
                          }
                        />
                      </Box>
                    </SimpleGrid>

                    {/* Redesigned Clean Quick Presets */}
                    {canEditRtoIt && (
                      <Box pt={2}>
                        <Text fontSize="xs" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"} mb={2}>
                          Quick Presets:
                        </Text>
                        <WrapPresets
                          selectedMinutes={rtoRpo.appsRtoItMinutes}
                          onSelect={(mins) =>
                            setRtoRpo((p) => ({
                              ...p,
                              appsRtoItMinutes: mins,
                              appsRtoItOperator: p.appsRtoItOperator || "<=",
                            }))
                          }
                        />
                      </Box>
                    )}
                  </VStack>
                </Card>

                {/* RPO Section (BMT Authority) */}
                <Card p={5} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius={radiusStyle} boxShadow="sm">
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Icon as={FiHardDrive} color="purple.500" />
                      <Heading size="xs">RPO (Recovery Point Objective)</Heading>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500">
                      Maksimum toleransi kehilangan data. Ditinjau dan diatur oleh tim BMT / Disaster Recovery.
                    </Text>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} pt={2}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={1}>
                          Operator:
                        </Text>
                        <ChakraSelect
                          size="sm"
                          borderRadius="md"
                          value={rtoRpo.appsRpoOperator || "<="}
                          isDisabled={!canEditRpo && !canEditRpoWA2}
                          onChange={(e) =>
                            setRtoRpo((p) => ({
                              ...p,
                              appsRpoOperator: e.target.value,
                            }))
                          }
                        >
                          <option value="<=">&le; (Less than or equal)</option>
                          <option value="<">&lt; (Less than)</option>
                          <option value="=">= (Equal)</option>
                        </ChakraSelect>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" mb={1}>
                          Value (Minutes):
                        </Text>
                        <Input
                          size="sm"
                          placeholder="Minutes"
                          type="number"
                          value={rtoRpo.appsRpoMinutes ?? ""}
                          isDisabled={!canEditRpo && !canEditRpoWA2}
                          onChange={(e) =>
                            setRtoRpo((p) => ({
                              ...p,
                              appsRpoMinutes: parseInt(e.target.value) || null,
                            }))
                          }
                        />
                      </Box>
                    </SimpleGrid>

                    {!canEditRpo && !canEditRpoWA2 && (
                      <Badge colorScheme="purple" variant="subtle" fontSize="2xs" alignSelf="start" mt={2}>
                        Managed by BMT / Disaster Recovery Group (WA2 Stage)
                      </Badge>
                    )}
                  </VStack>
                </Card>
              </SimpleGrid>
            </VStack>
          )}

          {/* STEP 5: Review Summary, Tier Preview & Actions */}
          {currentStep === 5 && (
            <VStack spacing={5} align="stretch">
              {/* Criticality Score Dashboard */}
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Heading size="sm" mb={4}>
                  Assessment Score & Criticality Tier Determination
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                  <Card p={4} bg={isDark ? "gray.900" : "gray.50"} borderRadius="lg">
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                      Criteria Average
                    </Text>
                    <Heading size="lg" color={isDark ? "white" : "gray.800"}>
                      {crtAverage.toFixed(2)}
                    </Heading>
                    <Text fontSize="2xs" color="gray.500">
                      Total points: {crtScore} / {totalDetails * 5} pts
                    </Text>
                  </Card>

                  <Card p={4} bg={isDark ? "blue.900" : "blue.50"} borderRadius="lg">
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                      Impact Weight
                    </Text>
                    <Heading size="lg" color="secondary.500">
                      +{weight.toFixed(2)}
                    </Heading>
                    <Text fontSize="2xs" color="gray.500">
                      {trueCount} of 4 flags active
                    </Text>
                  </Card>

                  <Card p={4} bg={isDark ? "purple.900" : "purple.50"} borderRadius="lg">
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
                      Final Criticality Score
                    </Text>
                    <Heading size="lg" color="purple.500">
                      {crtFinal.toFixed(2)}
                    </Heading>
                    <Text fontSize="2xs" color="gray.500">
                      Category: {matchedCategory?.crtCategoryName || "Pending Evaluation"}
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* Criticality Tier Result Banner */}
                {matchedCategory && (
                  <Card
                    p={4}
                    borderRadius="lg"
                    bg={
                      matchedCategory.crtCategoryName.toUpperCase().includes("CRITICAL")
                        ? "red.500"
                        : "secondary.500"
                    }
                    color="white"
                  >
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="2xs" textTransform="uppercase" opacity={0.9}>
                          Determined Criticality Classification
                        </Text>
                        <Heading size="md">{matchedCategory.crtCategoryName}</Heading>
                        <Text fontSize="xs" opacity={0.9}>
                          {matchedCategory.crtCategoryDesc || "Classified based on mathematical criteria scoring thresholds."}
                        </Text>
                      </VStack>
                      <Badge bg="white" color="gray.900" fontSize="sm" px={3} py={1} borderRadius="md">
                        Score {matchedCategory.valueOperator} {matchedCategory.valueTracehold}
                      </Badge>
                    </Flex>
                  </Card>
                )}
              </Card>

              {/* Recovery SLA Targets Summary Table */}
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3}>
                  Recovery SLA Targets Summary
                </Heading>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Metric</Th>
                      <Th>Operator</Th>
                      <Th>Value (Minutes)</Th>
                      <Th>Duration</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td fontWeight="semibold">
                        <HStack spacing={2}>
                          <Icon as={FiShield} color="blue.500" />
                          <Text>RTO Suggestion (IAG)</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" fontFamily="mono">
                          {rtoRpo.appsRtoSuggestionOperator || "<="}
                        </Badge>
                      </Td>
                      <Td>{rtoRpo.appsRtoSuggestionMinutes ? `${rtoRpo.appsRtoSuggestionMinutes} Mins` : "—"}</Td>
                      <Td>
                        {rtoRpo.appsRtoSuggestionMinutes
                          ? `${(rtoRpo.appsRtoSuggestionMinutes / 60).toFixed(1)} Hours`
                          : "—"}
                      </Td>
                      <Td>
                        <Badge colorScheme={isRtoSuggestionFilled ? "green" : "orange"}>
                          {isRtoSuggestionFilled ? "Reviewed" : "Pending IAG"}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="semibold">
                        <HStack spacing={2}>
                          <Icon as={FiClock} color="secondary.500" />
                          <Text>RTO IT (IT Group Commitment)</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="teal" fontFamily="mono">
                          {rtoRpo.appsRtoItOperator || "<="}
                        </Badge>
                      </Td>
                      <Td>{rtoRpo.appsRtoItMinutes ? `${rtoRpo.appsRtoItMinutes} Mins` : "—"}</Td>
                      <Td>
                        {rtoRpo.appsRtoItMinutes
                          ? `${(rtoRpo.appsRtoItMinutes / 60).toFixed(1)} Hours`
                          : "—"}
                      </Td>
                      <Td>
                        <Badge colorScheme={rtoRpo.appsRtoItMinutes ? "green" : "orange"}>
                          {rtoRpo.appsRtoItMinutes ? "Configured" : "Pending IT"}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="semibold">
                        <HStack spacing={2}>
                          <Icon as={FiHardDrive} color="purple.500" />
                          <Text>RPO (Business Continuity / BMT)</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" fontFamily="mono">
                          {rtoRpo.appsRpoOperator || "<="}
                        </Badge>
                      </Td>
                      <Td>{rtoRpo.appsRpoMinutes ? `${rtoRpo.appsRpoMinutes} Mins` : "—"}</Td>
                      <Td>
                        {rtoRpo.appsRpoMinutes
                          ? `${(rtoRpo.appsRpoMinutes / 60).toFixed(1)} Hours`
                          : "—"}
                      </Td>
                      <Td>
                        <Badge colorScheme={isRpoFilled ? "purple" : "gray"}>
                          {isRpoFilled ? "Configured" : "Stage 2"}
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Card>

              {/* Pre-flight Validation Checklist */}
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={5}
                boxShadow="sm"
              >
                <Heading size="sm" mb={3}>
                  Pre-Submission Validation Checklist
                </Heading>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon
                        as={filledScores.length === totalDetails ? FiCheckCircle : FiAlertCircle}
                        color={filledScores.length === totalDetails ? "green.500" : "orange.500"}
                      />
                      <Text fontSize="xs">All 10 Architectural Criteria Answered</Text>
                    </HStack>
                    <Badge colorScheme={filledScores.length === totalDetails ? "green" : "orange"}>
                      {filledScores.length} / {totalDetails} ({crtScore} pts)
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon
                        as={isRtoSuggestionFilled ? FiCheckCircle : FiAlertCircle}
                        color={isRtoSuggestionFilled ? "green.500" : "orange.500"}
                      />
                      <Text fontSize="xs">
                        RTO Suggestion: {rtoRpo.appsRtoSuggestionOperator || "<="} {rtoRpo.appsRtoSuggestionMinutes ? `${rtoRpo.appsRtoSuggestionMinutes}m` : "Not Set"}
                      </Text>
                    </HStack>
                    <Badge colorScheme={isRtoSuggestionFilled ? "green" : "orange"}>
                      {isRtoSuggestionFilled ? "Ready" : "Pending IAG"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon
                        as={rtoRpo.appsRtoItMinutes ? FiCheckCircle : FiAlertCircle}
                        color={rtoRpo.appsRtoItMinutes ? "green.500" : "orange.500"}
                      />
                      <Text fontSize="xs">
                        RTO IT Committed: {rtoRpo.appsRtoItOperator || "<="} {rtoRpo.appsRtoItMinutes ? `${rtoRpo.appsRtoItMinutes}m` : "Not Set"}
                      </Text>
                    </HStack>
                    <Badge colorScheme={rtoRpo.appsRtoItMinutes ? "green" : "orange"}>
                      {rtoRpo.appsRtoItMinutes ? `${rtoRpo.appsRtoItMinutes}m` : "Not Set"}
                    </Badge>
                  </HStack>
                </VStack>
              </Card>
            </VStack>
          )}

          {/* Sticky Bottom Stepper Controls & Action Dispatch */}
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={radiusStyle}
            p={4}
            boxShadow="md"
            position="sticky"
            bottom={4}
            zIndex={10}
          >
            <Flex justify="space-between" align="center">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiChevronLeft />}
                isDisabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              >
                Previous Step
              </Button>

              <HStack spacing={3}>
                {isEditable && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="secondary"
                    leftIcon={<FiSave />}
                    isLoading={saving}
                    onClick={() => setIsSaveConfirmOpen(true)}
                  >
                    Save Draft
                  </Button>
                )}

                {currentStep < 5 ? (
                  <Button
                    size="sm"
                    colorScheme="secondary"
                    rightIcon={<FiChevronRight />}
                    onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                  >
                    Next Step
                  </Button>
                ) : (
                  <>
                    {isDraft && !isSubmitBlocked && !isWhitelisted && (
                      <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<FiSend />}
                        isLoading={submitting}
                        isDisabled={!canSubmit}
                        onClick={() => setIsSubmitConfirmOpen(true)}
                      >
                        Submit for Approval
                      </Button>
                    )}
                    {isDeclined && !isSubmitBlocked && !isWhitelisted && (
                      <Button
                        size="sm"
                        colorScheme="yellow"
                        isLoading={submitting}
                        isDisabled={!canSubmit}
                        onClick={async () => {
                          setSubmitting(true);
                          const res = await ResubmitAssessment(
                            assessmentId!,
                            tokenData
                          );
                          setSubmitting(false);
                          if (res?.statusCode === RES_CODE_OK) {
                            showToast({
                              description: "Re-submitted successfully",
                              statusToast: "success",
                            });
                            loadData();
                          }
                        }}
                      >
                        Re-submit Assessment
                      </Button>
                    )}
                  </>
                )}
              </HStack>
            </Flex>
          </Card>
        </VStack>
      </Box>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpenTrigger={isSaveConfirmOpen}
        trigger={setIsSaveConfirmOpen}
        action={handleSave}
        captionMsg="Save Assessment Draft"
        questionMsg="Are you sure you want to save your current assessment inputs? This will persist flags, criteria scores, category, and SLA targets."
      />

      <ConfirmationDialog
        isOpenTrigger={isSubmitConfirmOpen}
        trigger={setIsSubmitConfirmOpen}
        action={async () => {
          await handleSave();
          await handleSubmitApproval();
        }}
        captionMsg="Submit Assessment for Approval"
        questionMsg="This will save your assessment and submit it for Approval (WAITING APPROVAL 1). Are you sure?"
      />
    </LayoutAdmin>
  );
}

// Redesigned Spacious Quick Preset Chips for RTO IT
function WrapPresets({
  selectedMinutes,
  onSelect,
}: {
  selectedMinutes: number | null;
  onSelect: (mins: number) => void;
}) {
  const presets = [
    { label: "15 Mins", mins: 15 },
    { label: "30 Mins", mins: 30 },
    { label: "1 Hour (60m)", mins: 60 },
    { label: "2 Hours (120m)", mins: 120 },
    { label: "4 Hours (240m)", mins: 240 },
    { label: "8 Hours (480m)", mins: 480 },
    { label: "24 Hours (1440m)", mins: 1440 },
  ];

  return (
    <Wrap spacing={2}>
      {presets.map((p) => {
        const isSelected = selectedMinutes === p.mins;
        return (
          <WrapItem key={p.mins}>
            <Button
              size="xs"
              px={3}
              py={2}
              borderRadius="md"
              variant={isSelected ? "solid" : "outline"}
              colorScheme={isSelected ? "secondary" : "gray"}
              fontWeight={isSelected ? "bold" : "medium"}
              onClick={() => onSelect(p.mins)}
              _hover={{ transform: "translateY(-1px)", shadow: "xs" }}
              transition="all 0.15s"
            >
              {p.label}
            </Button>
          </WrapItem>
        );
      })}
    </Wrap>
  );
}
