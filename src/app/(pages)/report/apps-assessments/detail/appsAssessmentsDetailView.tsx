"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, { AppsCriticalReportAssessmentViewModel, AppsCriticalReportBatchDetailViewModel } from "@/app/services/useAppsCriticalReport";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex,
  Heading, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  Select, SimpleGrid, Spacer, Spinner, Stack, Text,
  useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiActivity, FiEye, FiInfo, FiX } from "react-icons/fi";

const boolBadge = (v: string) => <Badge colorScheme={v === "TRUE" ? "green" : "gray"} variant="subtle" fontSize="xs">{v}</Badge>;
const statusColor = (s: string) => ({ DRAFT: "gray", PUBLISHED: "green", APPROVED: "blue", ARCHIVED: "orange" }[s] || "gray");

export default function AppsAssessmentsDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchCode = searchParams.get("batchCode");

  const { GetBatchDetail, SubmitBatchForApproval, SyncBatchStatus, ReviseBatch } = useAppsCriticalReport();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [batchData, setBatchData] = useState<AppsCriticalReportBatchDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AppsCriticalReportAssessmentViewModel | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter states
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReview, setFilterReview] = useState<"" | "reviewed" | "pending">("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    if (!tokenData || !batchCode) return;
    const load = async () => {
      setLoading(true);
      const res = await GetBatchDetail(batchCode, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) setBatchData(res.data);
      else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
      setLoading(false);
    };
    load();
  }, [tokenData, batchCode]);

  // Unique group options from loaded data
  const groupOptions = useMemo(() => {
    const names = (batchData?.assessments || [])
      .map(a => a.appManageByGroupName)
      .filter((v): v is string => !!v);
    return [...new Set(names)].sort();
  }, [batchData]);

  // Client-side filtered data
  const filteredAssessments = useMemo(() => {
    const all = batchData?.assessments || [];
    return all.filter(a => {
      const q = search.toLowerCase();
      if (q && !(
        a.appShortName?.toLowerCase().includes(q) ||
        a.appName?.toLowerCase().includes(q) ||
        a.appManageByGroupName?.toLowerCase().includes(q)
      )) return false;
      if (filterGroup && a.appManageByGroupName !== filterGroup) return false;
      if (filterStatus && a.statusReport !== filterStatus) return false;
      if (filterReview === "reviewed" && !a.isFullyReviewed) return false;
      if (filterReview === "pending" && a.isFullyReviewed) return false;
      return true;
    });
  }, [batchData, search, filterGroup, filterStatus, filterReview]);

  const clearFilters = () => { setSearch(""); setFilterGroup(""); setFilterStatus(""); setFilterReview(""); };

  const assessmentColumns = useMemo<ColumnDef<AppsCriticalReportAssessmentViewModel>[]>(() => [
    {
      accessorKey: "numbData",
      cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{info.row.index + 1}.</Text></Flex>,
      header: () => <Flex justifyContent="center">No.</Flex>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "appShortName",
      cell: (info) => <Text fontSize="sm" fontWeight="semibold">{info.getValue() as string}</Text>,
      header: () => <Text>App Short Name</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "appName",
      cell: (info) => <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"} noOfLines={2}>{(info.getValue() as string) || "-"}</Text>,
      header: () => <Text>App Name</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "appManageByGroupName",
      cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"} noOfLines={1}>{(info.getValue() as string) || "-"}</Text>,
      header: () => <Text>Manage Group</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "statusReport",
      cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>,
      header: () => <Text>Status</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "isRelationWithCustomers",
      cell: (info) => boolBadge(info.getValue() as string),
      header: () => <Text fontSize="xs">Customer Rel.</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "isTransactionalApp",
      cell: (info) => boolBadge(info.getValue() as string),
      header: () => <Text fontSize="xs">Transactional</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "isStrictCutoffTime",
      cell: (info) => boolBadge(info.getValue() as string),
      header: () => <Text fontSize="xs">Cutoff</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "isRelationWithGov",
      cell: (info) => boolBadge(info.getValue() as string),
      header: () => <Text fontSize="xs">Gov Rel.</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "crtAssessmentFinalScore",
      cell: (info) => (
        <Badge colorScheme="purple" variant="solid" fontSize="sm" px={2}>{info.getValue() as number}</Badge>
      ),
      header: () => <Text>Final Score</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "isFullyReviewed",
      cell: (info) => {
        const row = info.row.original;
        return row.isFullyReviewed ? (
          <Badge colorScheme="green" variant="subtle">✓ Reviewed ({row.filledCount}/{row.totalCount})</Badge>
        ) : (
          <Badge colorScheme="orange" variant="subtle">⚠ Pending ({row.filledCount}/{row.totalCount})</Badge>
        );
      },
      header: () => <Text>Review Status</Text>,
      footer: (p) => p.column.id,
    },
    ...([
      { key: "appsRtoSuggestionOperator", mKey: "appsRtoSuggestionMinutes", label: "RTO Suggestion" },
      { key: "appsRtoItOperator", mKey: "appsRtoItMinutes", label: "RTO IT" },
      { key: "appsRpoOperator", mKey: "appsRpoMinutes", label: "RPO" },
    ] as { key: keyof AppsCriticalReportAssessmentViewModel; mKey: keyof AppsCriticalReportAssessmentViewModel; label: string }[]).map(({ key, mKey, label }) => ({
      accessorKey: key,
      cell: (info: any) => {
        const op = info.row.original[key] as string | null;
        const min = info.row.original[mKey] as number | null;
        if (!op && min === null) return <Badge colorScheme="gray" variant="outline" fontSize="2xs">Not set</Badge>;
        return (
          <HStack spacing={1}>
            {op && <Badge colorScheme="orange" fontFamily="mono" fontSize="xs">{op}</Badge>}
            {min !== null && min !== undefined && <Text fontSize="sm" fontWeight="medium">{min} <Text as="span" fontSize="2xs" color={isDark ? "gray.400" : "gray.500"}>min</Text></Text>}
          </HStack>
        );
      },
      header: () => <Text fontSize="xs">{label}</Text>,
      footer: (p: any) => p.column.id,
    })),
    {
      id: "actions",
      header: () => <Text>Details</Text>,
      cell: (info) => (
        <IconButton aria-label="View criteria" icon={<FiEye />} size="sm" colorScheme="teal" variant="ghost"
          onClick={() => router.push(`/report/apps-assessments/assessment?id=${info.row.original.id}`)} />
      ),
      footer: (p) => p.column.id,
    },
  ], [isDark]);

  const table = useReactTable({
    data: filteredAssessments,
    columns: assessmentColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Batch Assessment Detail" breadCrumb={["Home", "Report", "Assessment of Critical Apps", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Header */}
          <HStack spacing={3}>
            <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm" onClick={() => router.push("/report/apps-assessments")} />
            <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiActivity} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={isDark ? "white" : "gray.800"}>{batchCode || "Loading..."}</Heading>
              {batchData && (
                <HStack spacing={2}>
                  <Badge colorScheme="blue" variant="outline">{batchData.quartalReport}</Badge>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{batchData.yearReport}</Text>
                  <Badge colorScheme={statusColor(batchData.statusReport)} variant="subtle">{batchData.statusReport}</Badge>
                </HStack>
              )}
            </VStack>
            <Box flex={1} />
            {/* Sync button — show when batch is DRAFT or WAITING APPROVAL 1 */}
            {(batchData?.statusReport === "DRAFT" || batchData?.statusReport === "WAITING APPROVAL 1") && (
              <Button colorScheme="blue" size="sm" variant="outline" isLoading={isSyncing}
                onClick={async () => {
                  setIsSyncing(true);
                  const res = await SyncBatchStatus(batchCode!, tokenData);
                  setIsSyncing(false);
                  if (res?.statusCode === RES_CODE_OK) {
                    showToast({ description: res.message || "Sync complete", statusToast: "success" });
                    const reload = await GetBatchDetail(batchCode!, tokenData);
                    if (reload?.statusCode === RES_CODE_OK && reload.data) setBatchData(reload.data);
                  } else showToast({ description: res?.message || "Sync failed", statusToast: "error" });
                }}>
                Sync Status
              </Button>
            )}
            {/* Revise button — show when batch is DECLINE */}
            {batchData?.statusReport === "DECLINE" && (
              <Button colorScheme="yellow" size="sm" isLoading={isRevising}
                onClick={async () => {
                  setIsRevising(true);
                  const res = await ReviseBatch(batchCode!, tokenData);
                  setIsRevising(false);
                  if (res?.statusCode === RES_CODE_OK) {
                    showToast({ description: "Batch reset to revision — all assessments back to WAITING APPROVAL 1", statusToast: "success" });
                    const reload = await GetBatchDetail(batchCode!, tokenData);
                    if (reload?.statusCode === RES_CODE_OK && reload.data) setBatchData(reload.data);
                  } else showToast({ description: res?.message || "Revise failed", statusToast: "error" });
                }}>
                Revise Batch
              </Button>
            )}
            {/* Submit for Approval — only when batch is WAITING APPROVAL 2 */}
            {batchData?.statusReport === "WAITING APPROVAL 2" && (
              <Button colorScheme="orange" size="sm" onClick={() => setIsSubmitConfirmOpen(true)}>
                Submit for Approval
              </Button>
            )}
          </HStack>

          {/* Batch Info */}
          {batchData && (
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardBody p={4}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {[
                    { label: "Batch Code", value: <Badge colorScheme="purple" fontFamily="mono">{batchData.batchCode}</Badge> },
                    { label: "Quarter", value: <Badge colorScheme="blue" variant="outline">{batchData.quartalReport}</Badge> },
                    { label: "Year", value: <Text fontWeight="semibold">{batchData.yearReport}</Text> },
                    { label: "Total Apps", value: <Badge colorScheme="teal" fontSize="sm">{batchData.assessments.length}</Badge> },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1} textTransform="uppercase" letterSpacing="wider">{label}</Text>
                      {value}
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Assessments Table */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={4} px={6}>
              <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>App Assessments ({filteredAssessments.length}/{batchData?.assessments.length || 0})</Heading>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              {/* Filter Row */}
              <Flex gap={3} wrap="wrap" mb={4}>
                <InputGroup maxW="260px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search app name or group..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    bg={isDark ? "gray.700" : "white"} />
                </InputGroup>
                <Select placeholder="All Groups" value={filterGroup} onChange={e => setFilterGroup(e.target.value)} maxW="200px" bg={isDark ? "gray.700" : "white"}>
                  {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
                <Select placeholder="All Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} maxW="180px" bg={isDark ? "gray.700" : "white"}>
                  {["DRAFT", "WAITING APPROVAL 1", "WAITING APPROVAL 2", "APPROVED", "DECLINE"].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </Select>
                <Select placeholder="All Review" value={filterReview} onChange={e => setFilterReview(e.target.value as any)} maxW="160px" bg={isDark ? "gray.700" : "white"}>
                  <option value="reviewed">✓ Reviewed</option>
                  <option value="pending">⚠ Not Yet</option>
                </Select>
                {(search || filterGroup || filterStatus || filterReview) && (
                  <Button variant="outline" leftIcon={<FiX />} size="md" onClick={clearFilters}>Clear</Button>
                )}
                <Spacer />
                <HStack>
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                    Showing {filteredAssessments.length} of {batchData?.assessments.length || 0}
                  </Text>
                </HStack>
              </Flex>
              <Box overflowX="auto" w="full">
                <Box minW="1800px">
                  <TableComponentFull table={table} />
                </Box>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* Criteria Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box w={7} h={7} bg="teal.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiInfo} boxSize={3.5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md">{selectedAssessment?.appShortName}</Text>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">{selectedAssessment?.appCode}</Badge>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAssessment && (
              <Stack spacing={4}>
                {/* Criteria detail rows */}
                {selectedAssessment.details.map((d, i) => (
                  <Flex key={d.id} gap={3} p={3} bg={isDark ? "gray.750" : "gray.50"} rounded="md" border="1px" borderColor={isDark ? "gray.600" : "gray.200"} align="center">
                    <Badge colorScheme="purple" variant="solid" minW="24px" textAlign="center">{d.appsCriteriaPos}</Badge>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold">{d.appsCriteriaName}</Text>
                      {d.appsCriteriaDesc && <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{d.appsCriteriaDesc}</Text>}
                    </VStack>
                    <VStack align="end" spacing={0}>
                      {d.appsCriteriaScaleValue !== null ? (
                        <Badge colorScheme="green" fontSize="sm">{d.appsCriteriaScaleValue}</Badge>
                      ) : (
                        <Badge colorScheme="gray" variant="outline" fontSize="xs">Not filled</Badge>
                      )}
                    </VStack>
                  </Flex>
                ))}
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        isOpenTrigger={isSubmitConfirmOpen}
        trigger={setIsSubmitConfirmOpen}
        action={async () => {
          const res = await SubmitBatchForApproval(batchCode!, tokenData);
          if (res?.statusCode === RES_CODE_OK) {
            showToast({ description: "Batch submitted for approval", statusToast: "success" });
            const reload = await GetBatchDetail(batchCode!, tokenData);
            if (reload?.statusCode === RES_CODE_OK && reload.data) setBatchData(reload.data);
          } else showToast({ description: res?.message || "Submit failed", statusToast: "error" });
        }}
        captionMsg="Submit for Approval"
        questionMsg={`Are you sure you want to submit batch "${batchCode}" for the next approval level? All remaining assessments will be advanced.`}
      />
    </LayoutAdmin>
  );
}
