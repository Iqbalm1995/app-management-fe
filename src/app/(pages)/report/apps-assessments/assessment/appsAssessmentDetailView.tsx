"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  CRITERIA_VALUE_OPERATORS,
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
import {
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
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiActivity, FiSave } from "react-icons/fi";

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
  const isEditable = isDraft || isDeclined;
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

    // 2. Save assessment with flags + matched category
    const assessPayload: UpdateAssessmentRequest = {
      id: assessmentId,
      ...flags,
      appCrtCategoryId: matchedCategory?.id || null,
      appCrtCategoryCode: matchedCategory?.crtCategoryCode || null,
      appCrtCategoryName: matchedCategory?.crtCategoryName || null,
      appCrtCategoryDesc: matchedCategory?.crtCategoryDesc || null,
      appCrtCategoryValueOperator: matchedCategory?.valueOperator || null,
      appCrtCategoryValueTracehold: matchedCategory?.valueTracehold || 0,
      appsRtoSuggestionOperator: rtoRpo.appsRtoSuggestionOperator || null,
      appsRtoSuggestionMinutes: rtoRpo.appsRtoSuggestionMinutes,
      appsRtoItOperator: rtoRpo.appsRtoItOperator || null,
      appsRtoItMinutes: rtoRpo.appsRtoItMinutes,
      appsRpoOperator: rtoRpo.appsRpoOperator || null,
      appsRpoMinutes: rtoRpo.appsRpoMinutes,
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
                      {isDraft && (
                        <Button
                          size="sm"
                          bg="orange.400"
                          color="white"
                          _hover={{ bg: "orange.300" }}
                          isLoading={submitting}
                          onClick={() => setIsSubmitConfirmOpen(true)}
                        >
                          Submit for Approval
                        </Button>
                      )}
                      {isDeclined && (
                        <Button
                          size="sm"
                          bg="yellow.400"
                          color="gray.800"
                          _hover={{ bg: "yellow.300" }}
                          isLoading={submitting}
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
                    <Heading size="sm">Application On Development?</Heading>
                    {flags.isOnDevelopment === "TRUE" && (
                      <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                        ON DEVELOPMENT
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                    Indicates this application is currently under active
                    development
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  {(["TRUE", "FALSE"] as const).map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      px={5}
                      variant={
                        flags.isOnDevelopment === opt ? "solid" : "outline"
                      }
                      colorScheme={opt === "TRUE" ? "yellow" : "gray"}
                      isDisabled={!isEditable}
                      onClick={() =>
                        isEditable &&
                        setFlags((prev) => ({ ...prev, isOnDevelopment: opt }))
                      }
                    >
                      {opt}
                    </Button>
                  ))}
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
                        Skip Review for this Assessment?
                      </Heading>
                      {flags.isSkipReview === "TRUE" && (
                        <Badge
                          colorScheme="orange"
                          variant="solid"
                          fontSize="xs"
                        >
                          SKIP REVIEW
                        </Badge>
                      )}
                    </HStack>
                    <Text
                      fontSize="xs"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      If skipped, this assessment will bypass the normal review
                      process
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    {(["TRUE", "FALSE"] as const).map((opt) => (
                      <Button
                        key={opt}
                        size="sm"
                        px={5}
                        variant={
                          flags.isSkipReview === opt ? "solid" : "outline"
                        }
                        colorScheme={opt === "TRUE" ? "orange" : "gray"}
                        isDisabled={!isEditable}
                        onClick={() =>
                          isEditable &&
                          setFlags((prev) => ({ ...prev, isSkipReview: opt }))
                        }
                      >
                        {opt}
                      </Button>
                    ))}
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* App Info + Flags side by side */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
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
                  {[
                    { label: "Short Name", value: data?.appShortName },
                    { label: "App Name", value: data?.appName || "-" },
                    {
                      label: "Manage Group",
                      value: data?.appManageByGroupName || "-",
                    },
                  ].map(({ label, value }) => (
                    <HStack
                      key={label}
                      justify="space-between"
                      py={2}
                      borderBottom="1px"
                      borderColor={isDark ? "gray.700" : "gray.100"}
                    >
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.500"}
                      >
                        {label}
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {value}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </CardBody>
            </Card>

            {/* Additional Flags */}
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
                          disabled={!isEditable}
                          onClick={() =>
                            isEditable &&
                            setFlags((prev) => ({ ...prev, [key]: "TRUE" }))
                          }
                          px={3}
                          py={1}
                          rounded="md"
                          cursor={isEditable ? "pointer" : "default"}
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
                          opacity={!isEditable ? 0.6 : 1}
                        >
                          Ya
                        </Box>
                        <Box
                          as="button"
                          disabled={!isEditable}
                          onClick={() =>
                            isEditable &&
                            setFlags((prev) => ({ ...prev, [key]: "FALSE" }))
                          }
                          px={3}
                          py={1}
                          rounded="md"
                          cursor={isEditable ? "pointer" : "default"}
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
                          opacity={!isEditable ? 0.6 : 1}
                        >
                          Tidak
                        </Box>
                      </HStack>
                    </HStack>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Grid>

          {/* BSC Criteria Assessment */}
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
                              disabled={!isEditable}
                              onClick={() =>
                                isEditable &&
                                setDetailSelections((prev) => ({
                                  ...prev,
                                  [d.id]: v.id,
                                }))
                              }
                              w="100%"
                              py={2}
                              px={2}
                              rounded="md"
                              cursor={isEditable ? "pointer" : "default"}
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
                                isEditable
                                  ? {
                                      borderColor: "secondary.300",
                                      bg: "secondary.50",
                                    }
                                  : {}
                              }
                              transition="all 0.15s"
                              opacity={!isEditable ? 0.6 : 1}
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

          {/* Criteria Category & Scores — auto calculated, at bottom */}
          <Card
            rounded={radiusStyle}
            shadow="md"
            border="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "white"}
          >
            <CardHeader py={3} px={5}>
              <HStack justify="space-between">
                <Heading size="sm">Assessment Result</Heading>
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
                      },
                      {
                        label: "RTO IT",
                        opKey: "appsRtoItOperator",
                        minKey: "appsRtoItMinutes",
                      },
                      {
                        label: "RPO",
                        opKey: "appsRpoOperator",
                        minKey: "appsRpoMinutes",
                      },
                    ] as {
                      label: string;
                      opKey: keyof typeof rtoRpo;
                      minKey: keyof typeof rtoRpo;
                    }[]
                  ).map(({ label, opKey, minKey }) => (
                    <Box
                      key={opKey}
                      p={4}
                      bg={isDark ? "secondary.900" : "secondary.50"}
                      rounded="lg"
                      border="1px"
                      borderColor={isDark ? "secondary.700" : "secondary.200"}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color={isDark ? "secondary.200" : "secondary.700"}
                        mb={3}
                        letterSpacing="wider"
                      >
                        {label}
                      </Text>
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
                                disabled={!isEditable}
                                onClick={() =>
                                  isEditable &&
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
                                cursor={isEditable ? "pointer" : "default"}
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
                                  isEditable
                                    ? {
                                        borderColor: "secondary.300",
                                        bg: "secondary.50",
                                      }
                                    : {}
                                }
                                transition="all 0.15s"
                                opacity={!isEditable ? 0.6 : 1}
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
                                isEditable &&
                                setRtoRpo((prev) => ({
                                  ...prev,
                                  [minKey]: val,
                                }))
                              }
                              isDisabled={!isEditable}
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
                              isDisabled={!isEditable}
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
