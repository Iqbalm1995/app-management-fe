"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  CRITERIA_VALUE_OPERATORS,
  ORG_GROUP_WHITELIST_ALL_ACCESS,
  ORG_GROUP_WHITELIST_FULL_OVERRIDE,
  ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS,
  ORG_GROUP_WHITELIST_ASSESMENT_RPO,
  DIVISION_ID_IT_BJB,
  ORG_CATEGORY_KEY_GROUP,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
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
  MstAppsCriteriaValueResponse,
} from "@/app/services/useMstAppsCriteria";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  Stack,
  Switch,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiActivity, FiAlertTriangle, FiCheck, FiInfo, FiLock, FiSave } from "react-icons/fi";

// --- helpers ---
const evalOperator = (
  score: number,
  op: string,
  tracehold: number,
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

// Group categories by name → check all conditions for that name pass
const matchCategory = (
  score: number,
  categories: MstAppsCriteriaCategoryResponse[],
): MstAppsCriteriaCategoryResponse | null => {
  const grouped = categories.reduce(
    (acc, c) => {
      if (!acc[c.crtCategoryName]) acc[c.crtCategoryName] = [];
      acc[c.crtCategoryName].push(c);
      return acc;
    },
    {} as Record<string, MstAppsCriteriaCategoryResponse[]>,
  );

  for (const [, group] of Object.entries(grouped)) {
    const allPass = group.every((c) =>
      evalOperator(score, c.valueOperator, c.valueTracehold ?? 0),
    );
    if (allPass) return group[0]; // return first row of the matching group
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

export default function AppsAssessmentDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id");
  const sourceParam = searchParams.get("source") || "detail"; // "pending" or "detail"

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

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] =
    useState<AppsCriticalReportAssessmentViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revising, setRevising] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const [categories, setCategories] = useState<
    MstAppsCriteriaCategoryResponse[]
  >([]);
  const [criteriaList, setCriteriaList] = useState<MstAppsCriteriaResponse[]>(
    [],
  );

  // Editable state
  const [flags, setFlags] = useState({
    isRelationWithCustomers: "FALSE",
    isTransactionalApp: "FALSE",
    isStrictCutoffTime: "FALSE",
    isRelationWithGov: "FALSE",
    isOnDevelopment: "FALSE",
    isSkipReview: "FALSE",
  });
  // detailId -> selected valueId
  const [detailSelections, setDetailSelections] = useState<
    Record<string, string>
  >({});
  const [rtoRpo, setRtoRpo] = useState({
    appsRtoSuggestionOperator: "" as string | null,
    appsRtoSuggestionMinutes: null as number | null,
    appsRtoItOperator: "" as string | null,
    appsRtoItMinutes: null as number | null,
    appsRpoOperator: "" as string | null,
    appsRpoMinutes: null as number | null,
  });

  // Manage Group Edit State & Options (IT Division Groups)
  const { List: ListOrganization } = useOrganization();
  const [itGroupOptions, setItGroupOptions] = useState<OrganizationResponse[]>([]);
  const [selectedManageGroupId, setSelectedManageGroupId] = useState<string>("");
  const [selectedManageGroupCode, setSelectedManageGroupCode] = useState<string>("");
  const [selectedManageGroupName, setSelectedManageGroupName] = useState<string>("");

  // Load IT Division Group options for Manage Group selector
  useEffect(() => {
    if (!tokenData) return;
    const loadItGroups = async () => {
      try {
        const res = await ListOrganization(
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
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setItGroupOptions(res.data);
        }
      } catch {
        /* silent */
      }
    };
    loadItGroups();
  }, [tokenData]);

  // Note: JWT encodes null as "-" — treat "-" as no group
  const userOrgGroupId = (DataAuth?.team?.orgGroupId && DataAuth.team.orgGroupId !== "-")
    ? DataAuth.team.orgGroupId
    : null;

  // Full override access (audit/edit all fields, WA2 override, no submit restriction)
  const isWhitelisted = userOrgGroupId
    ? ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId)
    : false;

  // Cannot submit to approval:
  // - User is in ALL_ACCESS (list-only/executive access) 
  // - BUT NOT in FULL_OVERRIDE (admin/IAG)
  // - AND NOT an RPO group user who owns this assessment (they can submit for their own apps)
  // NOTE: defined after rpoUserOwnsAssessment below
  const isSubmitBlockedBase = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ALL_ACCESS.includes(userOrgGroupId) && !isWhitelisted
    : false;

  // Per-field RTO/RPO edit access
  const canEditRtoSuggestion = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId)
    : false;

  const canEditRpo = userOrgGroupId
    ? ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) ||
      ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId)
    : false;

  // RTO/RPO completeness check for submit:
  // RTO Suggestion: operator required + minutes > 0
  // RTO IT: operator required + minutes > 0
  // RPO: operator and value optional (can be null/0)
  const isRtoRpoComplete =
    !!rtoRpo.appsRtoSuggestionOperator &&
    (rtoRpo.appsRtoSuggestionMinutes ?? 0) > 0 &&
    !!rtoRpo.appsRtoItOperator &&
    (rtoRpo.appsRtoItMinutes ?? 0) > 0;

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData)
      setDataAuth(
        (JSON.parse(storedData) as AuthDataModelInterface)
          .dataLogin as AuthDataResponse,
      );
    if (token) setTokenData(token);
  }, [DataAuth]);

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
      tokenData,
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
      tokenData,
    ).then((r) => {
      if (r?.statusCode === RES_CODE_OK) setCriteriaList(r.data || []);
    });
  }, [tokenData]);

  const loadData = async () => {
    if (!tokenData || !assessmentId) return;
    setLoading(true);
    const res = await GetAssessmentDetail(assessmentId, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setData(res.data);
      setFlags({
        isRelationWithCustomers: res.data.isRelationWithCustomers,
        isTransactionalApp: res.data.isTransactionalApp,
        isStrictCutoffTime: res.data.isStrictCutoffTime,
        isRelationWithGov: res.data.isRelationWithGov,
        isOnDevelopment: res.data.isOnDevelopment,
        isSkipReview: res.data.isSkipReview,
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
      // Check if user can approve this assessment
      if (assessmentId) {
        const approveCheck = await CanApproveAssessment(
          assessmentId,
          tokenData,
        );
        setCanApprove(
          approveCheck?.statusCode === RES_CODE_OK &&
            approveCheck?.data === "true",
        );
      }
    } else
      showToast({
        description: res?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    setLoading(false);
  };

  useEffect(() => {
    if (tokenData) loadData();
  }, [tokenData, assessmentId]);

  // Derived calculations
  const isDraft = data?.statusReport === "DRAFT";
  const isDeclined = data?.statusReport === "DECLINE";
  const isWaitingApproval2 = data?.statusReport === "WAITING APPROVAL 2";

  // Base editable = DRAFT or DECLINED
  // Extended: WA2 + ALL_ACCESS can fully override; WA2 + RPO group can edit RPO only
  const canOverrideWA2 = isWaitingApproval2 && isWhitelisted;

  // RPO-only user: in RPO whitelist but NOT in RTO_SUGGESTIONS and NOT in ALL_ACCESS
  // Only compute after auth is loaded — prevents false-positive on initial render
  const isRpoOnlyUser = (DataAuth && userOrgGroupId)
    ? ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) &&
      !ORG_GROUP_WHITELIST_ASSESMENT_RTO_SUGGESTIONS.includes(userOrgGroupId) &&
      !isWhitelisted
    : false;

  // RPO-only user OWNS this assessment if their orgGroupId matches appManageByGroupId
  // In that case they get full access like a normal group user
  const rpoUserOwnsAssessment = isRpoOnlyUser &&
    !!userOrgGroupId &&
    !!data?.appManageByGroupId &&
    data.appManageByGroupId === userOrgGroupId;

  // Final submit blocked check — RPO user who owns the assessment CAN submit
  const isSubmitBlocked = isSubmitBlockedBase && !rpoUserOwnsAssessment;

  // RTO IT: anyone except RPO group — UNLESS RPO group user owns this assessment
  const canEditRtoIt = userOrgGroupId
    ? !ORG_GROUP_WHITELIST_ASSESMENT_RPO.includes(userOrgGroupId) || rpoUserOwnsAssessment
    : true;

  // WA2 + RPO group can edit RPO only (when they don't own the assessment)
  const canEditRpoWA2 = isWaitingApproval2 && canEditRpo && !isWhitelisted && !rpoUserOwnsAssessment;

  // isEditable:
  // - Normal: DRAFT or DECLINE (non RPO-only users, or RPO user who owns the assessment)
  // - WA2 ALL_ACCESS override
  // - RPO-only users: read-only EXCEPT on WA2 (canEditRpoWA2) or if they own the assessment
  const isEditable = (isDraft || isDeclined || canOverrideWA2) &&
    (!isRpoOnlyUser || rpoUserOwnsAssessment);

  // Manage Group can only be changed by users in ORG_GROUP_WHITELIST_FULL_OVERRIDE when form is editable
  const canEditManageGroup = isEditable && userOrgGroupId
    ? ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId)
    : false;

  // RTO Suggestion filled = prerequisite for RTO IT in DRAFT
  const isRtoSuggestionFilled =
    !!rtoRpo.appsRtoSuggestionOperator &&
    (rtoRpo.appsRtoSuggestionMinutes ?? 0) > 0;

  // Eligible to fill RTO / RPO fields check
  const canEditAnyRtoRpo =
    (isEditable && (canEditRtoSuggestion || rpoUserOwnsAssessment)) ||
    (isEditable && canEditRtoIt && (isRtoSuggestionFilled || rpoUserOwnsAssessment)) ||
    ((isEditable && canEditRpo) || canEditRpoWA2);
  const trueCount = Object.values(flags).filter((v) => v === "TRUE").length;
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
    (v) => v !== null,
  ) as number[];
  const crtScore = filledScores.reduce((s, v) => s + v, 0);
  const crtAverage = totalDetails > 0 ? crtScore / totalDetails : 0;
  const crtFinal = crtAverage + weight;

  // Assessment result score completeness check for submit
  const isScoreComplete =
    crtScore > 0 &&
    crtAverage > 0 &&
    weight > 0 &&
    crtFinal > 0;

  // Skip review flag — active ONLY when isOnDevelopment === "TRUE" AND isSkipReview === "TRUE"
  const isSkipActive =
    flags.isOnDevelopment === "TRUE" && flags.isSkipReview === "TRUE";

  // Final submit gate: skip bypasses all checks
  const canSubmit = isSkipActive || (isRtoRpoComplete && isScoreComplete);

  // Fields editable only when not skipped (criteria scoring, IS flags)
  const isFieldEditable = isEditable && !isSkipActive;

  const matchedCategory = useMemo(
    () => matchCategory(crtFinal, categories),
    [crtFinal, categories],
  );

  const handleSubmitApproval = async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    const res = await SubmitForApproval(assessmentId, tokenData);
    setSubmitting(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Submitted for approval",
        statusToast: "success",
      });
      loadData();
    } else
      showToast({
        description: res?.message || "Submit failed",
        statusToast: "error",
      });
  };

  const handleSave = async () => {
    if (!assessmentId || !data) return;

    // Guard: RPO-only users who don't own this assessment cannot save general changes
    if (isRpoOnlyUser && !rpoUserOwnsAssessment && !canEditRpoWA2) {
      showToast({ description: "You do not have permission to save changes on this assessment.", statusToast: "error" });
      return;
    }

    setSaving(true);

    // 1. Save all detail rows
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

    // 2. Save assessment with flags + matched category (clear RTO/RPO if skip review is active)
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
        description: "Assessment saved successfully",
        statusToast: "success",
      });
      loadData();
    } else
      showToast({
        description: res?.message || "Save failed",
        statusToast: "error",
      });
  };

  if (loading)
    return (
      <LayoutAdmin>
        <Box p={10} textAlign="center">
          <Spinner size="xl" color="purple.500" />
        </Box>
      </LayoutAdmin>
    );

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="App Assessment Detail"
        breadCrumb={["Home", "Report", "Assessment", "Detail"]}
      />
      <Box p={4}>
        <VStack spacing={5} align="stretch">
          {/* Page Header */}
          <Card rounded={radiusStyle} overflow="hidden" shadow="md" border="0">
            <Box bg="secondary.500" px={6} py={5}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <IconButton
                    aria-label="Back"
                    icon={<FaArrowLeft />}
                    variant="ghost"
                    size="sm"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => {
                      if (sourceParam === "pending")
                        router.push("/report/apps-assessments-pending-approve");
                      else if (sourceParam === "workspace")
                        router.push("/workspace/applications?tab=assessments");
                      else router.back();
                    }}
                  />
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color="white">
                      {data?.appShortName}
                    </Heading>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      {data?.appName}
                    </Text>
                  </VStack>
                  <HStack spacing={2} ml={3}>
                    <Badge
                      bg="whiteAlpha.200"
                      color="white"
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      {data?.batchCode}
                    </Badge>
                    <Badge
                      bg="whiteAlpha.200"
                      color="white"
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                    >
                      {data?.quartalReport} {data?.yearReport}
                    </Badge>
                    <Badge
                      colorScheme={
                        data?.statusReport === "APPROVED" ? "green" : "yellow"
                      }
                      variant="solid"
                      fontSize="xs"
                    >
                      {data?.statusReport}
                    </Badge>
                  </HStack>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {/* Save/Submit — only from non-pending source when editable */}
                  {isEditable && sourceParam !== "pending" && (
                    <>
                      <Button
                        size="sm"
                        bg="whiteAlpha.200"
                        color="white"
                        _hover={{ bg: "whiteAlpha.300" }}
                        leftIcon={<FiSave />}
                        isLoading={saving}
                        onClick={() => setIsSaveConfirmOpen(true)}
                      >
                        Save Changes
                      </Button>
                      {isDraft && !isSubmitBlocked && !isWhitelisted && (
                        <Button
                          size="sm"
                          bg="orange.400"
                          color="white"
                          _hover={{ bg: "orange.300" }}
                          isLoading={submitting}
                          isDisabled={!canSubmit}
                          title={
                            isSkipActive ? "" :
                            !isScoreComplete
                              ? "Assessment scores (CRT Score, Average, Weight, Final) must all be > 0"
                              : !isRtoRpoComplete
                              ? "RTO Suggestion and RTO IT must have operator and value > 0"
                              : ""
                          }
                          onClick={() => setIsSubmitConfirmOpen(true)}
                        >
                          Submit for Approval
                        </Button>
                      )}
                      {isDeclined && !isSubmitBlocked && !isWhitelisted && (
                        <Button
                          size="sm"
                          bg="yellow.400"
                          color="gray.800"
                          _hover={{ bg: "yellow.300" }}
                          isLoading={submitting}
                          isDisabled={!canSubmit}
                          title={
                            isSkipActive ? "" :
                            !isScoreComplete
                              ? "Assessment scores (CRT Score, Average, Weight, Final) must all be > 0"
                              : !isRtoRpoComplete
                              ? "RTO Suggestion and RTO IT must have operator and value > 0"
                              : ""
                          }
                          onClick={async () => {
                            setSubmitting(true);
                            const res = await ResubmitAssessment(
                              assessmentId!,
                              tokenData,
                            );
                            setSubmitting(false);
                            if (res?.statusCode === RES_CODE_OK) {
                              showToast({
                                description: "Re-submitted successfully",
                                statusToast: "success",
                              });
                              loadData();
                            } else
                              showToast({
                                description: res?.message || "Re-submit failed",
                                statusToast: "error",
                              });
                          }}
                        >
                          Re-submit
                        </Button>
                      )}
                    </>
                  )}

                  {/* WA2: RPO group — Save Changes only (RPO field edit) */}
                  {canEditRpoWA2 && sourceParam !== "pending" && (
                    <Button
                      size="sm"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{ bg: "whiteAlpha.300" }}
                      leftIcon={<FiSave />}
                      isLoading={saving}
                      onClick={() => setIsSaveConfirmOpen(true)}
                    >
                      Save RPO
                    </Button>
                  )}

                  {/* WA2: ALL_ACCESS — Revision (send batch back to DRAFT) */}
                  {canOverrideWA2 && sourceParam !== "pending" && (
                    <Button
                      size="sm"
                      bg="yellow.500"
                      color="white"
                      _hover={{ bg: "yellow.400" }}
                      isLoading={revising}
                      onClick={async () => {
                        if (!data?.batchCode) return;
                        setRevising(true);
                        const res = await ReviseBatch(data.batchCode, tokenData);
                        setRevising(false);
                        if (res?.statusCode === RES_CODE_OK) {
                          showToast({ description: "Batch revised back to DRAFT", statusToast: "success" });
                          loadData();
                        } else {
                          showToast({ description: res?.message || "Revision failed", statusToast: "error" });
                        }
                      }}
                    >
                      Revision
                    </Button>
                  )}

                  {/* Approve/Decline — only for assigned approvers from pending page */}
                  {sourceParam === "pending" &&
                    canApprove &&
                    (data?.statusReport === "WAITING APPROVAL 1" ||
                      data?.statusReport === "WAITING APPROVAL 2") && (
                      <>
                        <Button
                          size="sm"
                          bg="green.400"
                          color="white"
                          _hover={{ bg: "green.300" }}
                          isLoading={approving}
                          onClick={async () => {
                            setApproving(true);
                            const res = await ApproveAssessment(
                              {
                                id: assessmentId!,
                                isApproved: true,
                                note: "Approved",
                              },
                              tokenData,
                            );
                            setApproving(false);
                            if (res?.statusCode === RES_CODE_OK) {
                              showToast({
                                description: "Approved",
                                statusToast: "success",
                              });
                              loadData();
                            } else
                              showToast({
                                description: res?.message || "Failed",
                                statusToast: "error",
                              });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          bg="whiteAlpha.200"
                          color="white"
                          _hover={{ bg: "red.400" }}
                          isLoading={approving}
                          onClick={async () => {
                            setApproving(true);
                            const res = await ApproveAssessment(
                              {
                                id: assessmentId!,
                                isApproved: false,
                                note: "Declined",
                              },
                              tokenData,
                            );
                            setApproving(false);
                            if (res?.statusCode === RES_CODE_OK) {
                              showToast({
                                description: "Declined",
                                statusToast: "warning",
                              });
                              loadData();
                            } else
                              showToast({
                                description: res?.message || "Failed",
                                statusToast: "error",
                              });
                          }}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                </HStack>
              </Flex>
            </Box>
          </Card>

          {/* Alert Section: Missing App Manage Group */}
          {(!selectedManageGroupId || !selectedManageGroupName || selectedManageGroupName === "-") && (
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
                      <Heading
                        size="sm"
                        color={isDark ? "red.300" : "red.800"}
                      >
                        Aplikasi Belum Memiliki Group Pengelola (Unassigned Manage Group)
                      </Heading>
                      <Badge colorScheme="red" variant="solid" fontSize="xs">
                        UNASSIGNED GROUP
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={isDark ? "gray.300" : "red.700"}>
                      Aplikasi ini belum terhubung dengan Group IT Pengelola. Silakan pilih Group IT Pengelola di bagian <b>App Information</b> di bawah ini lalu klik tombol <b>Save Changes</b>.
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Alert Section: Application Not Reviewed by IAG (RTO Suggestion not filled) */}
          {!isRtoSuggestionFilled && (
            <Card
              rounded={radiusStyle}
              shadow="sm"
              border="1px"
              borderColor={isDark ? "orange.600" : "orange.300"}
              bg={isDark ? "gray.800" : "orange.50"}
            >
              <CardBody py={4} px={5}>
                <HStack spacing={4} align="flex-start">
                  <Box
                    p={2.5}
                    bg={isDark ? "orange.900" : "orange.100"}
                    rounded="lg"
                    color="orange.500"
                  >
                    <Icon as={FiAlertTriangle} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Heading
                        size="sm"
                        color={isDark ? "orange.300" : "orange.800"}
                      >
                        RTO Pada Aplikasi ini Belum Dilakukan Review oleh IAG
                      </Heading>
                      <Badge colorScheme="orange" variant="solid" fontSize="xs">
                        BELUM DIREVIEW
                      </Badge>
                    </HStack>
                    <Text
                      fontSize="xs"
                      color={isDark ? "orange.200" : "orange.700"}
                      lineHeight="relaxed"
                    >
                      Aplikasi ini belum melalui proses peninjauan dan pengisian RTO Suggestion oleh IAG, Tetapi anda masih bisa mengisi data lainnya.
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* On Development Section */}
          <Card
            rounded={radiusStyle}
            shadow="md"
            border="1px"
            borderColor={
              flags.isOnDevelopment === "TRUE"
                ? isDark
                  ? "yellow.600"
                  : "yellow.300"
                : isDark
                  ? "gray.700"
                  : "gray.200"
            }
            bg={isDark ? "gray.800" : "white"}
          >
            <CardBody py={4} px={5}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Heading size="sm">Aplikasi Masih Dalam Tahap Pengembangan?</Heading>
                    {flags.isOnDevelopment === "TRUE" && (
                      <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                        DALAM PENGEMBANGAN
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                    Indicates this application is currently under active
                    development
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
              </HStack>
            </CardBody>
          </Card>

          {/* Skip Review Section — only relevant when On Development */}
          {flags.isOnDevelopment === "TRUE" && (
            <Card
              rounded={radiusStyle}
              shadow="md"
              border="1px"
              borderColor={
                flags.isSkipReview === "TRUE"
                  ? isDark
                    ? "orange.600"
                    : "orange.300"
                  : isDark
                    ? "gray.700"
                    : "gray.200"
              }
              bg={isDark ? "gray.800" : "white"}
            >
              <CardBody py={4} px={5}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Heading size="sm">
                        Lewati Review untuk Assessment Ini?
                      </Heading>
                      {flags.isSkipReview === "TRUE" && (
                        <Badge
                          colorScheme="orange"
                          variant="solid"
                          fontSize="xs"
                        >
                          LEWATI REVIEW
                        </Badge>
                      )}
                    </HStack>
                    <Text
                      fontSize="xs"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      Jika dilewati, assessment ini akan melewati proses review normal
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
                              "Tahap review dilewati. Jangan lupa simpan perubahan.",
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
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* App Info + Flags side by side */}
          <Grid templateColumns={{ base: "1fr", lg: isSkipActive ? "1fr" : "1fr 1fr" }} gap={5}>
            {/* App Info */}
            <Card
              rounded={radiusStyle}
              shadow="md"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
            >
              <CardHeader py={3} px={5}>
                <HStack spacing={2}>
                  <Box w="4px" h="20px" bg="secondary.400" rounded="full" />
                  <Heading size="sm">App Information</Heading>
                </HStack>
              </CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody px={5} py={4}>
                <Stack spacing={3}>
                  <HStack
                    justify="space-between"
                    py={2}
                    borderBottom="1px"
                    borderColor={isDark ? "gray.700" : "gray.100"}
                  >
                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                      Short Name
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {data?.appShortName || "-"}
                    </Text>
                  </HStack>

                  <HStack
                    justify="space-between"
                    py={2}
                    borderBottom="1px"
                    borderColor={isDark ? "gray.700" : "gray.100"}
                  >
                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                      App Name
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {data?.appName || "-"}
                    </Text>
                  </HStack>

                  <HStack
                    justify="space-between"
                    align="center"
                    py={2}
                    borderBottom="1px"
                    borderColor={isDark ? "gray.700" : "gray.100"}
                  >
                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                      Manage Group
                    </Text>
                    {canEditManageGroup ? (
                      <Select
                        size="sm"
                        w="220px"
                        rounded="md"
                        value={selectedManageGroupId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedManageGroupId(id);
                          const org = itGroupOptions.find((g) => g.id === id);
                          if (org) {
                            setSelectedManageGroupCode(org.orgCode || "");
                            setSelectedManageGroupName(org.orgName || "");
                          } else {
                            setSelectedManageGroupCode("");
                            setSelectedManageGroupName("");
                          }
                        }}
                      >
                        <option value="">-- Select IT Group --</option>
                        {itGroupOptions.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.orgName} ({g.orgCode})
                          </option>
                        ))}
                      </Select>
                    ) : !selectedManageGroupId || !selectedManageGroupName || selectedManageGroupName === "-" ? (
                      <Badge colorScheme="red" variant="subtle" rounded="md" px={2} py={0.5} fontSize="2xs">
                        <HStack spacing={1}>
                          <FiAlertTriangle size={10} />
                          <Text as="span">Unassigned Group</Text>
                        </HStack>
                      </Badge>
                    ) : (
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedManageGroupName}
                      </Text>
                    )}
                  </HStack>
                </Stack>
              </CardBody>
            </Card>

            {/* Additional Flags — hidden when skip review is active */}
            {!isSkipActive && (
              <Card
                rounded={radiusStyle}
                shadow="sm"
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                bg={isDark ? "gray.800" : "white"}
              >
                <CardHeader py={3} px={5}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Box w="4px" h="20px" bg="secondary.400" rounded="full" />
                      <Heading size="sm">Additional Flags</Heading>
                    </HStack>
                    <HStack>
                      <Text
                        fontSize="xs"
                        color={isDark ? "gray.400" : "gray.500"}
                      >
                        TRUE: {trueCount}/4
                      </Text>
                      <Badge colorScheme="purple">Weight: {weight}</Badge>
                    </HStack>
                  </HStack>
                </CardHeader>
                <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
                <CardBody px={5} py={4}>
                  <Stack spacing={3}>
                    {(
                      [
                        [
                          "isRelationWithCustomers",
                          "Berhubungan Langsung dengan Nasabah",
                        ],
                        ["isTransactionalApp", "Bersifat Transaksional"],
                        [
                          "isStrictCutoffTime",
                          "Memiliki Cut Off Time yang Ketat",
                        ],
                        ["isRelationWithGov", "Berhubungan dengan PEMDA"],
                      ] as [keyof typeof flags, string][]
                    ).map(([key, label]) => (
                      <HStack
                        key={key}
                        justify="space-between"
                        py={2}
                        borderBottom="1px"
                        borderColor={isDark ? "gray.700" : "gray.100"}
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {label}
                        </Text>
                        <HStack
                          spacing={0}
                          bg={isDark ? "gray.700" : "gray.100"}
                          rounded="md"
                          p={0.5}
                        >
                          <Box
                            as="button"
                            disabled={!isFieldEditable}
                            onClick={() =>
                              isFieldEditable &&
                              setFlags((prev) => ({ ...prev, [key]: "TRUE" }))
                            }
                            px={3}
                            py={1}
                            rounded="md"
                            cursor={isFieldEditable ? "pointer" : "default"}
                            bg={
                              flags[key] === "TRUE" ? "green.500" : "transparent"
                            }
                            color={
                              flags[key] === "TRUE"
                                ? "white"
                                : isDark
                                  ? "gray.400"
                                  : "gray.500"
                            }
                            fontWeight="semibold"
                            fontSize="xs"
                            transition="all 0.15s"
                            opacity={!isFieldEditable ? 0.6 : 1}
                          >
                            Ya
                          </Box>
                          <Box
                            as="button"
                            disabled={!isFieldEditable}
                            onClick={() =>
                              isFieldEditable &&
                              setFlags((prev) => ({ ...prev, [key]: "FALSE" }))
                            }
                            px={3}
                            py={1}
                            rounded="md"
                            cursor={isFieldEditable ? "pointer" : "default"}
                            bg={
                              flags[key] === "FALSE" ? "red.500" : "transparent"
                            }
                            color={
                              flags[key] === "FALSE"
                                ? "white"
                                : isDark
                                  ? "gray.400"
                                  : "gray.500"
                            }
                            fontWeight="semibold"
                            fontSize="xs"
                            transition="all 0.15s"
                            opacity={!isFieldEditable ? 0.6 : 1}
                          >
                            Tidak
                          </Box>
                        </HStack>
                      </HStack>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            )}
          </Grid>

          {/* BSC Criteria Assessment — hidden when skip review is active */}
          {!isSkipActive && (
            <Card
              rounded={radiusStyle}
              shadow="sm"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
            >
            <CardHeader py={3} px={5}>
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Box w="4px" h="20px" bg="secondary.400" rounded="full" />
                  <Heading size="sm">Criteria Assessment</Heading>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                    ({totalDetails} criteria)
                  </Text>
                </HStack>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                  Select scale value per criteria
                </Text>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody px={0} py={0}>
              {data?.details?.map((d, i) => {
                const criteria = criteriaList.find(
                  (c) => c.id === d.appsCriteriaId,
                );
                const selId =
                  detailSelections[d.id] || d.appsCriteriaValuesId || "";
                const selectedVal = criteria?.values?.find(
                  (v: MstAppsCriteriaValueResponse) => v.id === selId,
                );
                return (
                  <Box
                    key={d.id}
                    px={5}
                    py={4}
                    borderBottom={
                      i < (data?.details?.length || 0) - 1 ? "1px" : "0"
                    }
                    borderColor={isDark ? "gray.700" : "gray.100"}
                    _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                    transition="background 0.1s"
                  >
                    <HStack spacing={2} mb={3}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color="secondary.500"
                        w="24px"
                      >
                        {d.appsCriteriaPos}.
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {d.appsCriteriaName}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color={isDark ? "gray.500" : "gray.400"}
                      >
                        {d.appsCriteriaCode}
                      </Text>
                    </HStack>
                    <Grid templateColumns="1fr auto 160px" gap={4}>
                      {/* Left: Point Selection */}
                      <Grid
                        templateColumns={`repeat(${criteria?.values?.length || 5}, 1fr)`}
                        gap={2}
                      >
                        {criteria?.values
                          ?.slice()
                          .sort((a, b) => a.scaleValue - b.scaleValue)
                          .map((v: MstAppsCriteriaValueResponse) => (
                            <Box
                              key={v.id}
                              as="button"
                              disabled={!isFieldEditable}
                              onClick={() =>
                                isFieldEditable &&
                                setDetailSelections((prev) => ({
                                  ...prev,
                                  [d.id]: v.id,
                                }))
                              }
                              w="100%"
                              py={2}
                              px={2}
                              rounded="md"
                              cursor={isFieldEditable ? "pointer" : "default"}
                              border="1px"
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              borderColor={
                                selId === v.id
                                  ? "secondary.400"
                                  : isDark
                                    ? "gray.600"
                                    : "gray.200"
                              }
                              bg={
                                selId === v.id ? "secondary.50" : "transparent"
                              }
                              color={
                                selId === v.id
                                  ? "secondary.700"
                                  : isDark
                                    ? "gray.300"
                                    : "gray.600"
                              }
                              _hover={
                                isFieldEditable
                                  ? {
                                      borderColor: "secondary.300",
                                      bg: "secondary.50",
                                    }
                                  : {}
                              }
                              transition="all 0.15s"
                              opacity={!isFieldEditable ? 0.6 : 1}
                            >
                              <Text fontSize="xs" fontWeight="bold">
                                {v.scaleLabel}
                              </Text>
                              {v.scaleDesc && (
                                <Text
                                  fontSize="xs"
                                  color={isDark ? "gray.400" : "gray.500"}
                                  textAlign="center"
                                  fontWeight="medium"
                                  mt={1}
                                >
                                  {v.scaleDesc}
                                </Text>
                              )}
                            </Box>
                          ))}
                      </Grid>
                      {/* Separator */}
                      <Flex align="center" justify="center">
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={isDark ? "gray.400" : "gray.500"}
                        >
                          =
                        </Text>
                      </Flex>
                      {/* Right: Result */}
                      <Flex align="center" justify="center">
                        {selectedVal ? (
                          <Text
                            fontWeight="bold"
                            fontSize="4xl"
                            color="purple.500"
                          >
                            {Number(selectedVal.scaleValue).toFixed(3)}
                          </Text>
                        ) : (
                          <Text
                            fontWeight="bold"
                            fontSize="4xl"
                            color="gray.300"
                          >
                            —
                          </Text>
                        )}
                      </Flex>
                    </Grid>
                  </Box>
                );
              })}
            </CardBody>
          </Card>
          )}

          {/* Criteria Category & Scores — auto calculated, hidden when skip review is active */}
          {!isSkipActive && (
            <Card
              rounded={radiusStyle}
              shadow="md"
              border={canEditAnyRtoRpo ? "2px" : "1px"}
              borderColor={
                canEditAnyRtoRpo
                  ? isDark
                    ? "blue.400"
                    : "blue.500"
                  : isDark
                  ? "gray.700"
                  : "gray.200"
              }
              bg={isDark ? "gray.800" : "white"}
              transition="all 0.2s"
            >
            <CardHeader py={3} px={5}>
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Heading size="sm">Assessment Result</Heading>
                  {canEditAnyRtoRpo && (
                    <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                      ELIGIBLE TO FILL
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                  Auto-calculated
                </Text>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody px={5} py={4}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                {/* Scores */}
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color={isDark ? "gray.400" : "gray.500"}
                    mb={3}
                    letterSpacing="wider"
                  >
                    Score Breakdown
                  </Text>
                  <Stack spacing={3}>
                    {[
                      {
                        label: "CRT Assessment Score",
                        value: crtScore.toFixed(3),
                        desc: `Sum of ${filledScores.length}/${totalDetails} criteria values`,
                        color: "blue",
                      },
                      {
                        label: "Average Score",
                        value: crtAverage.toFixed(3),
                        desc: `${crtScore.toFixed(3)} / ${totalDetails} criteria`,
                        color: "teal",
                      },
                      {
                        label: "Weight (IS Flags)",
                        value: `+ ${weight}`,
                        desc: `${trueCount} TRUE flags`,
                        color: "orange",
                      },
                      {
                        label: "Final Score",
                        value: crtFinal.toFixed(3),
                        desc: `Average + Weight`,
                        color: "purple",
                      },
                    ].map(({ label, value, desc, color }) => (
                      <HStack
                        key={label}
                        justify="space-between"
                        p={3}
                        bg={isDark ? "gray.700" : "white"}
                        rounded="md"
                        border="1px"
                        borderColor={isDark ? "gray.600" : "gray.100"}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {label}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={isDark ? "gray.400" : "gray.500"}
                          >
                            {desc}
                          </Text>
                        </VStack>
                        <Badge colorScheme={color} fontSize="md" px={3} py={1}>
                          {value}
                        </Badge>
                      </HStack>
                    ))}
                  </Stack>
                </Box>

                {/* Matched Category */}
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color={isDark ? "gray.400" : "gray.500"}
                    mb={3}
                    letterSpacing="wider"
                  >
                    Matched Criteria Category
                  </Text>
                  {matchedCategory ? (
                    <Box
                      p={4}
                      bg={isDark ? "gray.700" : "purple.50"}
                      rounded="lg"
                      border="2px"
                      borderColor={isDark ? "purple.500" : "purple.200"}
                    >
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge
                            colorScheme="purple"
                            fontSize="3xl"
                            rounded="lg"
                            px={3}
                            py={1}
                          >
                            {matchedCategory.crtCategoryName}
                          </Badge>
                        </HStack>
                        {matchedCategory.crtCategoryDesc && (
                          <Text
                            fontSize="xs"
                            color={isDark ? "gray.400" : "gray.600"}
                          >
                            {matchedCategory.crtCategoryDesc}
                          </Text>
                        )}
                        <HStack>
                          <Badge colorScheme="orange" fontFamily="mono">
                            {matchedCategory.valueOperator}
                          </Badge>
                          <Text fontSize="sm" fontWeight="semibold">
                            {Number(matchedCategory.valueTracehold).toFixed(3)}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="xs"
                          color={isDark ? "gray.400" : "gray.500"}
                        >
                          Final score {crtFinal.toFixed(3)} matches:{" "}
                          {matchedCategory.crtCategoryName}
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box
                      p={4}
                      bg={isDark ? "gray.700" : "gray.50"}
                      rounded="lg"
                      border="1px"
                      borderColor={isDark ? "gray.600" : "gray.200"}
                      textAlign="center"
                    >
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.500"}
                      >
                        {filledScores.length === 0
                          ? "Select criteria values to calculate category"
                          : `No category matches score ${crtFinal.toFixed(3)}`}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Divider separating RTO/RPO from scores */}
              <Divider my={5} borderColor={isDark ? "gray.600" : "gray.200"} />

              {/* RTO / RPO Configuration */}
              <Box mb={2}>
                <HStack mb={4}>
                  <Heading
                    size="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={isDark ? "gray.400" : "gray.500"}
                  >
                    RTO / RPO Configuration
                  </Heading>
                </HStack>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                  gap={5}
                >
                  {(
                    [
                      {
                        label: "RTO Suggestion",
                        opKey: "appsRtoSuggestionOperator",
                        minKey: "appsRtoSuggestionMinutes",
                        canEdit: isEditable && (canEditRtoSuggestion || rpoUserOwnsAssessment),
                        lockReason: !canEditRtoSuggestion && !rpoUserOwnsAssessment
                          ? "Only RTO Suggestion group can edit this field"
                          : undefined,
                        isFilled: !!rtoRpo.appsRtoSuggestionOperator && (rtoRpo.appsRtoSuggestionMinutes ?? 0) > 0,
                        isRequired: true,
                      },
                      {
                        label: "RTO IT",
                        opKey: "appsRtoItOperator",
                        minKey: "appsRtoItMinutes",
                        canEdit: isEditable && canEditRtoIt && (isRtoSuggestionFilled || rpoUserOwnsAssessment),
                        lockReason: !canEditRtoIt
                          ? "RPO group cannot edit RTO IT on apps they don't manage"
                          : (!isRtoSuggestionFilled && !rpoUserOwnsAssessment)
                          ? "Fill RTO Suggestion first before editing RTO IT"
                          : undefined,
                        isFilled: !!rtoRpo.appsRtoItOperator && (rtoRpo.appsRtoItMinutes ?? 0) > 0,
                        isRequired: true,
                      },
                      {
                        label: "RPO",
                        opKey: "appsRpoOperator",
                        minKey: "appsRpoMinutes",
                        canEdit: (isEditable && canEditRpo) || canEditRpoWA2,
                        lockReason: !canEditRpo && !canEditRpoWA2
                          ? "Only RPO group or RTO Suggestion group can edit this field"
                          : undefined,
                        isFilled: !!rtoRpo.appsRpoOperator,
                        isRequired: false,
                      },
                    ] as {
                      label: string;
                      opKey: keyof typeof rtoRpo;
                      minKey: keyof typeof rtoRpo;
                      canEdit: boolean;
                      lockReason?: string;
                      isFilled: boolean;
                      isRequired: boolean;
                    }[]
                  ).map(({ label, opKey, minKey, canEdit, lockReason, isFilled, isRequired }) => (
                    <Box
                      key={opKey}
                      p={4}
                      bg={canEdit
                        ? (isDark ? "secondary.900" : "secondary.50")
                        : (isDark ? "gray.800" : "gray.50")}
                      rounded="lg"
                      border="1px"
                      borderColor={
                        isFilled
                          ? (isDark ? "green.600" : "green.300")
                          : canEdit
                          ? (isDark ? "secondary.700" : "secondary.200")
                          : (isDark ? "gray.600" : "gray.200")
                      }
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between" mb={3}>
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          color={canEdit
                            ? (isDark ? "secondary.200" : "secondary.700")
                            : (isDark ? "gray.400" : "gray.500")}
                          letterSpacing="wider"
                        >
                          {label}
                        </Text>
                        <HStack spacing={1}>
                          {isFilled ? (
                            <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                              <HStack spacing={0.5}>
                                <Icon as={FiCheck} boxSize={2.5} />
                                <Text>Filled</Text>
                              </HStack>
                            </Badge>
                          ) : (
                            <Badge colorScheme={isRequired ? "orange" : "gray"} variant="subtle" fontSize="2xs">
                              {isRequired ? "Required" : "Optional"}
                            </Badge>
                          )}
                          {lockReason ? (
                            <Tooltip label={lockReason} placement="top" hasArrow>
                              <Box cursor="help">
                                <Icon as={FiLock} boxSize={3} color={isDark ? "orange.400" : "orange.500"} />
                              </Box>
                            </Tooltip>
                          ) : !canEdit ? (
                            <Tooltip label="Read only in current status" placement="top" hasArrow>
                              <Box cursor="help">
                                <Icon as={FiInfo} boxSize={3} color={isDark ? "gray.500" : "gray.400"} />
                              </Box>
                            </Tooltip>
                          ) : null}
                        </HStack>
                      </HStack>
                      <Stack spacing={3}>
                        <Box>
                          <FormLabel
                            fontSize="xs"
                            mb={1}
                            color={isDark ? "gray.400" : "gray.500"}
                          >
                            Operator
                          </FormLabel>
                          <HStack spacing={1}>
                            {CRITERIA_VALUE_OPERATORS.map((op) => (
                              <Box
                                key={op.value}
                                as="button"
                                disabled={!canEdit}
                                onClick={() =>
                                  canEdit &&
                                  setRtoRpo((prev) => ({
                                    ...prev,
                                    [opKey]:
                                      rtoRpo[opKey] === op.value
                                        ? null
                                        : op.value,
                                  }))
                                }
                                px={2.5}
                                py={1.5}
                                rounded="md"
                                cursor={canEdit ? "pointer" : "default"}
                                border="1px"
                                borderColor={
                                  rtoRpo[opKey] === op.value
                                    ? "secondary.400"
                                    : isDark
                                      ? "gray.600"
                                      : "gray.200"
                                }
                                bg={
                                  rtoRpo[opKey] === op.value
                                    ? "secondary.50"
                                    : isDark
                                      ? "gray.700"
                                      : "white"
                                }
                                color={
                                  rtoRpo[opKey] === op.value
                                    ? "secondary.700"
                                    : isDark
                                      ? "gray.300"
                                      : "gray.600"
                                }
                                _hover={
                                  canEdit
                                    ? {
                                        borderColor: "secondary.300",
                                        bg: "secondary.50",
                                      }
                                    : {}
                                }
                                transition="all 0.15s"
                                opacity={!canEdit ? 0.6 : 1}
                                fontWeight="bold"
                                fontSize="sm"
                              >
                                {op.value}
                              </Box>
                            ))}
                          </HStack>
                        </Box>
                        <Box>
                          <FormLabel
                            fontSize="xs"
                            mb={1}
                            color={isDark ? "gray.400" : "gray.500"}
                          >
                            Minutes
                          </FormLabel>
                          <HStack spacing={3}>
                            <Slider
                              flex={1}
                              min={0}
                              max={360}
                              step={1}
                              value={Math.min(
                                rtoRpo[minKey] !== null &&
                                  rtoRpo[minKey] !== undefined
                                  ? Number(rtoRpo[minKey])
                                  : 0,
                                360,
                              )}
                              onChange={(val) =>
                                canEdit &&
                                setRtoRpo((prev) => ({
                                  ...prev,
                                  [minKey]: val,
                                }))
                              }
                              isDisabled={!canEdit}
                              colorScheme="secondary"
                            >
                              <SliderTrack
                                bg={isDark ? "gray.600" : "gray.200"}
                                rounded="full"
                              >
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb boxSize={4} />
                            </Slider>
                            <Input
                              size="sm"
                              w="80px"
                              flexShrink={0}
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]*"
                              defaultValue={
                                rtoRpo[minKey] !== null &&
                                rtoRpo[minKey] !== undefined
                                  ? String(rtoRpo[minKey])
                                  : ""
                              }
                              key={`${opKey}-${rtoRpo[minKey]}-slider`}
                              onBlur={(e) => {
                                const v = e.target.value;
                                if (v === "")
                                  setRtoRpo((prev) => ({
                                    ...prev,
                                    [minKey]: null,
                                  }));
                                else if (/^\d*\.?\d*$/.test(v))
                                  setRtoRpo((prev) => ({
                                    ...prev,
                                    [minKey]: parseFloat(v) || 0,
                                  }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const v = (e.target as HTMLInputElement)
                                    .value;
                                  if (v === "")
                                    setRtoRpo((prev) => ({
                                      ...prev,
                                      [minKey]: null,
                                    }));
                                  else if (/^\d*\.?\d*$/.test(v))
                                    setRtoRpo((prev) => ({
                                      ...prev,
                                      [minKey]: parseFloat(v) || 0,
                                    }));
                                }
                              }}
                              placeholder="0"
                              bg={isDark ? "gray.700" : "white"}
                              isDisabled={!canEdit}
                              textAlign="center"
                            />
                          </HStack>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </CardBody>
          </Card>
          )}

          {/* Status History / Approval Notes Timeline */}
          {(data?.statusHistories?.length ?? 0) > 0 && (
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardHeader py={4} px={6}>
                <HStack spacing={2}>
                  <Icon as={FiActivity} boxSize={4} color={isDark ? "gray.300" : "gray.600"} />
                  <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Approval History</Heading>
                  <Badge colorScheme="gray" variant="subtle" fontSize="xs">{data?.statusHistories?.length} entries</Badge>
                </HStack>
              </CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody px={6} py={4}>
                <VStack spacing={0} align="stretch">
                  {data?.statusHistories?.map((h, i) => {
                    const isLast = i === (data.statusHistories.length - 1);
                    const colorScheme =
                      h.statusReport === "APPROVED" ? "green" :
                      h.statusReport === "DECLINE" ? "red" :
                      h.statusReport?.includes("WAITING") ? "orange" : "gray";
                    return (
                      <HStack key={h.id} align="start" spacing={4} pb={isLast ? 0 : 4}>
                        {/* Timeline dot + line */}
                        <VStack spacing={0} align="center" flexShrink={0} pt={1}>
                          <Box
                            w={3} h={3} rounded="full"
                            bg={colorScheme === "green" ? "green.400" :
                                colorScheme === "red" ? "red.400" :
                                colorScheme === "orange" ? "orange.400" : "gray.400"}
                          />
                          {!isLast && <Box w="1px" flex={1} minH="32px" bg={isDark ? "gray.600" : "gray.200"} mt={1} />}
                        </VStack>
                        {/* Content */}
                        <Box flex={1} pb={isLast ? 0 : 1}>
                          <HStack spacing={2} mb={1} flexWrap="wrap">
                            <Badge colorScheme={colorScheme} variant="subtle" fontSize="xs">{h.statusReport}</Badge>
                            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                              {new Date(h.statusTime).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </Text>
                            {h.createdByName && (
                              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                                by <Text as="span" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"}>{h.createdByName}</Text>
                              </Text>
                            )}
                          </HStack>
                          {h.note && (
                            <Box
                              px={3} py={2} rounded="md"
                              bg={isDark ? "gray.700" : "gray.50"}
                              border="1px" borderColor={isDark ? "gray.600" : "gray.200"}
                            >
                              <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>{h.note}</Text>
                            </Box>
                          )}
                        </Box>
                      </HStack>
                    );
                  })}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>

      {/* Save Changes Confirmation */}
      <ConfirmationDialog
        isOpenTrigger={isSaveConfirmOpen}
        trigger={setIsSaveConfirmOpen}
        action={handleSave}
        captionMsg="Save Changes"
        questionMsg="Are you sure you want to save all changes to this assessment? This will update flags, criteria scores, category, and RTO/RPO values."
      />

      {/* Submit for Approval Confirmation — saves first then submits */}
      <ConfirmationDialog
        isOpenTrigger={isSubmitConfirmOpen}
        trigger={setIsSubmitConfirmOpen}
        action={async () => {
          // Save changes first
          await handleSave();
          // Then submit to approval
          await handleSubmitApproval();
        }}
        captionMsg="Submit for Approval"
        questionMsg="This will first save all current changes, then submit this assessment for approval (WAITING APPROVAL 1). Are you sure?"
      />
    </LayoutAdmin>
  );
}
