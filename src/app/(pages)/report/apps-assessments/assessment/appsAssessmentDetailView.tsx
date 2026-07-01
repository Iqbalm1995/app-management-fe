"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, CRITERIA_VALUE_OPERATORS } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  UpdateAssessmentDetailRequest,
  UpdateAssessmentRequest,
} from "@/app/services/useAppsCriticalReport";
import useMstAppsCriteriaCategory, { MstAppsCriteriaCategoryResponse } from "@/app/services/useMstAppsCriteriaCategory";
import useMstAppsCriteria, { MstAppsCriteriaResponse, MstAppsCriteriaValueResponse } from "@/app/services/useMstAppsCriteria";
import {
  Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex,
  FormLabel, Grid, Heading, HStack, Icon, IconButton, Input, Select, SimpleGrid,
  Spinner, Stack, Switch, Text, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiActivity, FiSave } from "react-icons/fi";

// --- helpers ---
const evalOperator = (score: number, op: string, tracehold: number): boolean => {
  switch (op) {
    case "=": return score === tracehold;
    case ">": return score > tracehold;
    case "<": return score < tracehold;
    case ">=": return score >= tracehold;
    case "<=": return score <= tracehold;
    case "!=": return score !== tracehold;
    default: return false;
  }
};

// Group categories by name → check all conditions for that name pass
const matchCategory = (score: number, categories: MstAppsCriteriaCategoryResponse[]): MstAppsCriteriaCategoryResponse | null => {
  const grouped = categories.reduce((acc, c) => {
    if (!acc[c.crtCategoryName]) acc[c.crtCategoryName] = [];
    acc[c.crtCategoryName].push(c);
    return acc;
  }, {} as Record<string, MstAppsCriteriaCategoryResponse[]>);

  for (const [, group] of Object.entries(grouped)) {
    const allPass = group.every(c => evalOperator(score, c.valueOperator, c.valueTracehold ?? 0));
    if (allPass) return group[0]; // return first row of the matching group
  }
  return null;
};

const weightMap: Record<number, number> = { 0: 0.2, 1: 0.4, 2: 0.6, 3: 0.8, 4: 1.0 };

export default function AppsAssessmentDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id");
  const sourceParam = searchParams.get("source") || "detail"; // "pending" or "detail"

  const { GetAssessmentDetail, UpdateAssessment, UpdateAssessmentDetail, SubmitForApproval, CanApproveAssessment, ApproveAssessment, ResubmitAssessment } = useAppsCriticalReport();
  const { List: ListCategory } = useMstAppsCriteriaCategory();
  const { List: ListCriteria } = useMstAppsCriteria();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<AppsCriticalReportAssessmentViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const [categories, setCategories] = useState<MstAppsCriteriaCategoryResponse[]>([]);
  const [criteriaList, setCriteriaList] = useState<MstAppsCriteriaResponse[]>([]);

  // Editable state
  const [flags, setFlags] = useState({ isRelationWithCustomers: "FALSE", isTransactionalApp: "FALSE", isStrictCutoffTime: "FALSE", isRelationWithGov: "FALSE", isOnDevelopment: "FALSE", isSkipReview: "FALSE" });
  // detailId -> selected valueId
  const [detailSelections, setDetailSelections] = useState<Record<string, string>>({});
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
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    if (!tokenData) return;
    ListCategory({ search: "", limit: 1000, page: 0, filterWhere: [], fieldOrder: ["valueTracehold"], orderDir: "asc" }, tokenData)
      .then(r => { if (r?.statusCode === RES_CODE_OK) setCategories(r.data || []); });
    ListCriteria({ search: "", limit: 1000, page: 0, filterWhere: [], fieldOrder: ["criteriaPos"], orderDir: "asc" }, tokenData)
      .then(r => { if (r?.statusCode === RES_CODE_OK) setCriteriaList(r.data || []); });
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
      res.data.details?.forEach((d: any) => { if (d.appsCriteriaValuesId) init[d.id] = d.appsCriteriaValuesId; });
      setDetailSelections(init);
      // Check if user can approve this assessment
      if (assessmentId) {
        const approveCheck = await CanApproveAssessment(assessmentId, tokenData);
        setCanApprove(approveCheck?.statusCode === RES_CODE_OK && approveCheck?.data === "true");
      }
    } else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    setLoading(false);
  };

  useEffect(() => { if (tokenData) loadData(); }, [tokenData, assessmentId]);

  // Derived calculations
  const isDraft = data?.statusReport === "DRAFT";
  const isDeclined = data?.statusReport === "DECLINE";
  const isEditable = isDraft || isDeclined;
  const trueCount = Object.values(flags).filter(v => v === "TRUE").length;
  const weight = weightMap[trueCount] ?? 0.2;

  const detailScores = useMemo(() => {
    if (!data?.details) return {};
    const scores: Record<string, number | null> = {};
    data.details.forEach(d => {
      const criteria = criteriaList.find(c => c.id === d.appsCriteriaId);
      const selId = detailSelections[d.id];
      const val = criteria?.values?.find(v => v.id === selId);
      scores[d.id] = val ? val.scaleValue : (d.appsCriteriaScaleValue ?? null);
    });
    return scores;
  }, [data, detailSelections, criteriaList]);

  const totalDetails = data?.details?.length || 0;
  const filledScores = Object.values(detailScores).filter(v => v !== null) as number[];
  const crtScore = filledScores.reduce((s, v) => s + v, 0);
  const crtAverage = totalDetails > 0 ? crtScore / totalDetails : 0;
  const crtFinal = crtAverage + weight;

  const matchedCategory = useMemo(() => matchCategory(crtFinal, categories), [crtFinal, categories]);

  const handleSubmitApproval = async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    const res = await SubmitForApproval(assessmentId, tokenData);
    setSubmitting(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Submitted for approval", statusToast: "success" });
      loadData();
    } else showToast({ description: res?.message || "Submit failed", statusToast: "error" });
  };

  const handleSave = async () => {
    if (!assessmentId || !data) return;
    setSaving(true);

    // 1. Save all detail rows
    for (const detail of data.details || []) {
      const selId = detailSelections[detail.id];
      const criteria = criteriaList.find(c => c.id === detail.appsCriteriaId);
      const val = criteria?.values?.find(v => v.id === selId);
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
      showToast({ description: "Assessment saved successfully", statusToast: "success" });
      loadData();
    } else showToast({ description: res?.message || "Save failed", statusToast: "error" });
  };

  if (loading) return <LayoutAdmin><Box p={10} textAlign="center"><Spinner size="xl" color="purple.500" /></Box></LayoutAdmin>;

  return (
    <LayoutAdmin>
      <HeaderContent titleName="App Assessment Detail" breadCrumb={["Home", "Report", "Assessment", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Page Header */}
          <HStack spacing={3}>
            <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm"
              onClick={() => {
                if (sourceParam === "pending") router.push("/report/apps-assessments-pending-approve");
                else router.back();
              }} />
            <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiActivity} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={isDark ? "white" : "gray.800"}>{data?.appShortName}</Heading>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{data?.appName}</Text>
            </VStack>
            <Box flex={1} />
            <HStack spacing={2}>
              <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{data?.batchCode}</Badge>
              <Badge colorScheme="blue" variant="outline">{data?.quartalReport} {data?.yearReport}</Badge>
              <Badge colorScheme="gray" variant="subtle">{data?.statusReport}</Badge>
              {/* Save/Submit — only from non-pending source when editable */}
              {isEditable && sourceParam !== "pending" && <>
                <Button colorScheme="purple" size="sm" leftIcon={<FiSave />} isLoading={saving} onClick={() => setIsSaveConfirmOpen(true)}>Save Changes</Button>
                {isDraft && <Button colorScheme="orange" size="sm" isLoading={submitting} onClick={() => setIsSubmitConfirmOpen(true)}>Submit for Approval</Button>}
                {isDeclined && <Button colorScheme="yellow" size="sm" isLoading={submitting} onClick={async () => {
                  setSubmitting(true);
                  const res = await ResubmitAssessment(assessmentId!, tokenData);
                  setSubmitting(false);
                  if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Re-submitted successfully", statusToast: "success" }); loadData(); }
                  else showToast({ description: res?.message || "Re-submit failed", statusToast: "error" });
                }}>Re-submit</Button>}
              </>}
              {/* Approve/Decline — only for assigned approvers from pending page */}
              {sourceParam === "pending" && canApprove && (data?.statusReport === "WAITING APPROVAL 1" || data?.statusReport === "WAITING APPROVAL 2") && <>
                <Button colorScheme="green" size="sm" isLoading={approving} onClick={async () => {
                  setApproving(true);
                  const res = await ApproveAssessment({ id: assessmentId!, isApproved: true, note: "Approved" }, tokenData);
                  setApproving(false);
                  if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Approved", statusToast: "success" }); loadData(); }
                  else showToast({ description: res?.message || "Failed", statusToast: "error" });
                }}>Approve</Button>
                <Button colorScheme="red" size="sm" variant="outline" isLoading={approving} onClick={async () => {
                  setApproving(true);
                  const res = await ApproveAssessment({ id: assessmentId!, isApproved: false, note: "Declined" }, tokenData);
                  setApproving(false);
                  if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Declined", statusToast: "warning" }); loadData(); }
                  else showToast({ description: res?.message || "Failed", statusToast: "error" });
                }}>Decline</Button>
              </>}
            </HStack>
          </HStack>

          {/* On Development Section */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={flags.isOnDevelopment === "TRUE" ? (isDark ? "yellow.600" : "yellow.300") : (isDark ? "gray.700" : "gray.200")} bg={isDark ? "gray.800" : "white"}>
            <CardBody py={4} px={5}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Heading size="sm">Application On Development?</Heading>
                    {flags.isOnDevelopment === "TRUE" && <Badge colorScheme="yellow" variant="solid" fontSize="xs">ON DEVELOPMENT</Badge>}
                  </HStack>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Indicates this application is currently under active development</Text>
                </VStack>
                <HStack spacing={2}>
                  {(["TRUE", "FALSE"] as const).map(opt => (
                    <Button key={opt} size="sm" px={5}
                      variant={flags.isOnDevelopment === opt ? "solid" : "outline"}
                      colorScheme={opt === "TRUE" ? "yellow" : "gray"}
                      isDisabled={!isEditable}
                      onClick={() => isEditable && setFlags(prev => ({ ...prev, isOnDevelopment: opt }))}>
                      {opt}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            </CardBody>
          </Card>

          {/* Skip Review Section — only relevant when On Development */}
          {flags.isOnDevelopment === "TRUE" && (
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={flags.isSkipReview === "TRUE" ? (isDark ? "orange.600" : "orange.300") : (isDark ? "gray.700" : "gray.200")} bg={isDark ? "gray.800" : "white"}>
              <CardBody py={4} px={5}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Heading size="sm">Skip Review for this Assessment?</Heading>
                      {flags.isSkipReview === "TRUE" && <Badge colorScheme="orange" variant="solid" fontSize="xs">SKIP REVIEW</Badge>}
                    </HStack>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>If skipped, this assessment will bypass the normal review process</Text>
                  </VStack>
                  <HStack spacing={2}>
                    {(["TRUE", "FALSE"] as const).map(opt => (
                      <Button key={opt} size="sm" px={5}
                        variant={flags.isSkipReview === opt ? "solid" : "outline"}
                        colorScheme={opt === "TRUE" ? "orange" : "gray"}
                        isDisabled={!isEditable}
                        onClick={() => isEditable && setFlags(prev => ({ ...prev, isSkipReview: opt }))}>
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
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardHeader py={3} px={5}><Heading size="sm">App Information</Heading></CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody px={5} py={4}>
                <Stack spacing={3}>
                  {[
                    { label: "Short Name", value: data?.appShortName },
                    { label: "App Name", value: data?.appName || "-" },
                    { label: "Manage Group", value: data?.appManageByGroupName || "-" },
                  ].map(({ label, value }) => (
                    <HStack key={label} justify="space-between" py={2} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
                      <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>{label}</Text>
                      <Text fontSize="sm" fontWeight="medium">{value}</Text>
                    </HStack>
                  ))}
                </Stack>
              </CardBody>
            </Card>

            {/* Additional Flags — radio style */}
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardHeader py={3} px={5}>
                <HStack justify="space-between">
                  <Heading size="sm">Additional Flags</Heading>
                  <HStack>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>TRUE: {trueCount}/4</Text>
                    <Badge colorScheme="purple">Weight: {weight}</Badge>
                  </HStack>
                </HStack>
              </CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody px={5} py={4}>
                <Stack spacing={3}>
                  {([
                    ["isRelationWithCustomers", "Relation With Customers"],
                    ["isTransactionalApp", "Transactional App"],
                    ["isStrictCutoffTime", "Strict Cutoff Time"],
                    ["isRelationWithGov", "Relation With Government"],
                  ] as [keyof typeof flags, string][]).map(([key, label]) => (
                    <HStack key={key} justify="space-between" py={2} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
                      <Text fontSize="sm" fontWeight="medium">{label}</Text>
                      <HStack spacing={2}>
                        {(["TRUE", "FALSE"] as const).map(opt => (
                          <Button key={opt} size="xs" px={4}
                            variant={flags[key] === opt ? "solid" : "outline"}
                            colorScheme={opt === "TRUE" ? "green" : "red"}
                            isDisabled={!isEditable}
                            onClick={() => isEditable && setFlags(prev => ({ ...prev, [key]: opt }))}>
                            {opt}
                          </Button>
                        ))}
                      </HStack>
                    </HStack>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Grid>

          {/* BSC Criteria Assessment */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={3} px={5}>
              <HStack justify="space-between">
                <Heading size="sm">Criteria Assessment ({totalDetails} criteria)</Heading>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Select scale value per criteria</Text>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody px={5} py={4}>
              <Stack spacing={4}>
                {data?.details?.map((d, i) => {
                  const criteria = criteriaList.find(c => c.id === d.appsCriteriaId);
                  const selId = detailSelections[d.id] || d.appsCriteriaValuesId || "";
                  const selectedVal = criteria?.values?.find((v: MstAppsCriteriaValueResponse) => v.id === selId);
                  return (
                    <Box key={d.id} p={4} bg={isDark ? "gray.750" : "gray.50"} rounded="lg"
                      border="1px" borderColor={isDark ? "gray.600" : "gray.200"}>
                      <HStack mb={3} justify="space-between">
                        <HStack spacing={2}>
                          <Badge colorScheme="purple" variant="solid">{d.appsCriteriaPos}</Badge>
                          <Badge colorScheme="blue" variant="subtle" fontSize="xs">{d.appsCriteriaCode}</Badge>
                          <Text fontSize="sm" fontWeight="semibold">{d.appsCriteriaName}</Text>
                        </HStack>
                        {selectedVal ? (
                          <HStack spacing={2}>
                            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>{selectedVal.scaleLabel}</Text>
                            <Badge colorScheme="green" fontSize="sm" px={3}>{selectedVal.scaleValue}</Badge>
                          </HStack>
                        ) : (
                          <Badge colorScheme="gray" variant="outline" fontSize="xs">Not selected</Badge>
                        )}
                      </HStack>
                      {/* Radio-style value buttons */}
                      <Flex gap={2} wrap="wrap">
                        {criteria?.values?.slice().sort((a, b) => a.scaleValue - b.scaleValue).map((v: MstAppsCriteriaValueResponse) => (
                          <Button key={v.id} size="sm" px={4}
                            variant={selId === v.id ? "solid" : "outline"}
                            colorScheme={selId === v.id ? "purple" : "gray"}
                            isDisabled={!isEditable}
                            onClick={() => isEditable && setDetailSelections(prev => ({ ...prev, [d.id]: v.id }))}>
                            <VStack spacing={0}>
                              <Text fontSize="xs" fontWeight="bold">{v.scaleValue}</Text>
                              <Text fontSize="2xs">{v.scaleLabel}</Text>
                            </VStack>
                          </Button>
                        ))}
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            </CardBody>
          </Card>

          {/* Criteria Category & Scores — auto calculated, at bottom */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={3} px={5}>
              <HStack justify="space-between">
                <Heading size="sm">Assessment Result</Heading>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Auto-calculated</Text>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody px={5} py={4}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                {/* Scores */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={isDark ? "gray.400" : "gray.500"} mb={3} letterSpacing="wider">Score Breakdown</Text>
                  <Stack spacing={3}>
                    {[
                      { label: "CRT Assessment Score", value: crtScore.toFixed(3), desc: `Sum of ${filledScores.length}/${totalDetails} criteria values`, color: "blue" },
                      { label: "Average Score", value: crtAverage.toFixed(3), desc: `${crtScore.toFixed(3)} / ${totalDetails} criteria`, color: "teal" },
                      { label: "Weight (IS Flags)", value: `+ ${weight}`, desc: `${trueCount} TRUE flags`, color: "orange" },
                      { label: "Final Score", value: crtFinal.toFixed(3), desc: `Average + Weight`, color: "purple" },
                    ].map(({ label, value, desc, color }) => (
                      <HStack key={label} justify="space-between" p={3} bg={isDark ? "gray.700" : "white"} rounded="md"
                        border="1px" borderColor={isDark ? "gray.600" : "gray.100"}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold">{label}</Text>
                          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{desc}</Text>
                        </VStack>
                        <Badge colorScheme={color} fontSize="md" px={3} py={1}>{value}</Badge>
                      </HStack>
                    ))}
                  </Stack>
                </Box>

                {/* Matched Category */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={isDark ? "gray.400" : "gray.500"} mb={3} letterSpacing="wider">Matched Criteria Category</Text>
                  {matchedCategory ? (
                    <Box p={4} bg={isDark ? "gray.700" : "purple.50"} rounded="lg"
                      border="2px" borderColor={isDark ? "purple.500" : "purple.200"}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>{matchedCategory.crtCategoryName}</Badge>
                          <Badge colorScheme="blue" variant="outline" fontFamily="mono">{matchedCategory.crtCategoryCode}</Badge>
                        </HStack>
                        {matchedCategory.crtCategoryDesc && (
                          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>{matchedCategory.crtCategoryDesc}</Text>
                        )}
                        <HStack>
                          <Badge colorScheme="orange" fontFamily="mono">{matchedCategory.valueOperator}</Badge>
                          <Text fontSize="sm" fontWeight="semibold">{matchedCategory.valueTracehold}</Text>
                        </HStack>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                          Final score {crtFinal.toFixed(3)} matches: {matchedCategory.crtCategoryName}
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box p={4} bg={isDark ? "gray.700" : "gray.50"} rounded="lg" border="1px" borderColor={isDark ? "gray.600" : "gray.200"} textAlign="center">
                      <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                        {filledScores.length === 0 ? "Select criteria values to calculate category" : `No category matches score ${crtFinal.toFixed(3)}`}
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
                  <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color={isDark ? "gray.400" : "gray.500"}>RTO / RPO Configuration</Heading>
                </HStack>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={5}>
                  {([
                    { label: "RTO Suggestion", opKey: "appsRtoSuggestionOperator", minKey: "appsRtoSuggestionMinutes" },
                    { label: "RTO IT", opKey: "appsRtoItOperator", minKey: "appsRtoItMinutes" },
                    { label: "RPO", opKey: "appsRpoOperator", minKey: "appsRpoMinutes" },
                  ] as { label: string; opKey: keyof typeof rtoRpo; minKey: keyof typeof rtoRpo }[]).map(({ label, opKey, minKey }) => (
                    <Box key={opKey} p={4} bg={isDark ? "gray.750" : "gray.50"} rounded="lg" border="1px" borderColor={isDark ? "gray.600" : "gray.200"}>
                      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={isDark ? "gray.400" : "gray.500"} mb={3} letterSpacing="wider">{label}</Text>
                      <Stack spacing={3}>
                        <Box>
                          <FormLabel fontSize="xs" mb={1} color={isDark ? "gray.400" : "gray.500"}>Operator</FormLabel>
                          <Select size="sm" value={rtoRpo[opKey] as string || ""}
                            onChange={e => setRtoRpo(prev => ({ ...prev, [opKey]: e.target.value || null }))}
                            placeholder="Select operator" bg={isDark ? "gray.700" : "white"} isDisabled={!isEditable}>
                            {CRITERIA_VALUE_OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                          </Select>
                        </Box>
                        <Box>
                          <FormLabel fontSize="xs" mb={1} color={isDark ? "gray.400" : "gray.500"}>Minutes (decimal)</FormLabel>
                          <Input size="sm"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={rtoRpo[minKey] !== null && rtoRpo[minKey] !== undefined ? String(rtoRpo[minKey]) : ""}
                            onChange={e => {
                              const v = e.target.value;
                              if (v === "" || /^\d*\.?\d*$/.test(v))
                                setRtoRpo(prev => ({ ...prev, [minKey]: v === "" ? null : parseFloat(v) || 0 }));
                            }}
                            placeholder="e.g. 60.5" bg={isDark ? "gray.700" : "white"} isDisabled={!isEditable} />
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
