"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  AppsCriticalReportBatchSummary,
  AppsCriticalReportBatchDetailViewModel,
  AppsCriticalReportPendingListRequest,
  ApproveAssessmentRequest,
  ApproveBatchRequest,
} from "@/app/services/useAppsCriticalReport";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, Checkbox, Divider, Flex, Heading, HStack,
  Icon, IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  SimpleGrid, Spacer, Spinner, Stack, Text, Textarea, Tooltip, useColorMode,
  useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiCheckCircle, FiClock, FiEye, FiRefreshCw, FiX } from "react-icons/fi";

type TabMode = "WA1" | "WA2" | "FINAL";

const statusColor = (s: string) => ({ "WAITING APPROVAL 1": "orange", "WAITING APPROVAL 2": "blue", "APPROVED": "green", "DECLINE": "red", DRAFT: "gray" }[s] || "gray");

export default function AppsPendingApproveView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { ListByStatus, CanApproveAssessment, ApproveAssessment, List, GetBatchDetail, ApproveBatch } = useAppsCriticalReport();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [tabMode, setTabMode] = useState<TabMode>("WA1");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // Tab 1 state
  const [wa1Data, setWa1Data] = useState<AppsCriticalReportAssessmentViewModel[]>([]);
  const [canApproveMap, setCanApproveMap] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();

  // Tab 2 state
  const [wa2Batches, setWa2Batches] = useState<AppsCriticalReportBatchSummary[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<AppsCriticalReportBatchSummary | null>(null);
  const [batchDetail, setBatchDetail] = useState<AppsCriticalReportBatchDetailViewModel | null>(null);
  const [batchNote, setBatchNote] = useState("");
  const [batchApproving, setBatchApproving] = useState(false);
  const { isOpen: isBatchModalOpen, onOpen: onBatchModalOpen, onClose: onBatchModalClose } = useDisclosure();

  // Tab 3 state
  const [finalData, setFinalData] = useState<AppsCriticalReportAssessmentViewModel[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    // WA1 is fully client-side — skip refetch when only page changes
    if (tabMode === "WA1" && wa1Data.length > 0) return;
    const load = async () => {
      setLoading(true);
      setSelectedIds(new Set()); // Clear selections on every page/tab load

      if (tabMode === "WA1") {
        // Load ALL WA1 data — client-side pagination via TanStack
        const res = await ListByStatus({ status: "WAITING APPROVAL 1", search, page: 0, limit: 9999 }, tokenData);        if (res?.statusCode === RES_CODE_OK) {
          const items: AppsCriticalReportAssessmentViewModel[] = res.data || [];
          setWa1Data(items);
          setTotalCount(items.length);
          setTotalPages(Math.ceil(items.length / pageSize));
          // Check canApprove per item
          const checks = await Promise.all(items.map(async (i) => {
            const r = await CanApproveAssessment(i.id, tokenData);
            return { id: i.id, can: r?.statusCode === RES_CODE_OK && r?.data === "true" };
          }));
          const map: Record<string, boolean> = {};
          checks.forEach(({ id, can }) => { map[id] = can; });
          setCanApproveMap(map);
        }
      } else if (tabMode === "WA2") {
        const fw: any[] = [{ field: "statusReport", operator: "=", value: "WAITING APPROVAL 2" }];
        const res = await List({ search, limit: pageSize, page: pageIndex, filterWhere: fw, fieldOrder: ["timeReport"], orderDir: "desc" }, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          setWa2Batches(res.data || []);
          setTotalCount(res.countTotal || 0);
          setTotalPages(Math.ceil((res.countTotal || 0) / pageSize));
        }
      } else {
        const resApp = await ListByStatus({ status: "APPROVED", search, page: pageIndex, limit: pageSize }, tokenData);
        const resDec = await ListByStatus({ status: "DECLINE", search, page: 0, limit: 1000 }, tokenData);
        const merged = [...(resApp?.data || []), ...(resDec?.data || [])];
        setFinalData(merged);
        setTotalCount(merged.length);
        setTotalPages(Math.ceil(merged.length / pageSize));
      }
      setLoading(false);
    };
    load();
  }, [DataAuth, tokenData, tabMode, refresh, pageIndex, pageSize, search]);

  // Ensure pagination resets when switching tabs
  useEffect(() => {
    setPagination({ pageIndex: 0, pageSize });
    if (tabMode !== "WA1") setWa1Data([]); // clear so re-fetch on switch back
  }, [tabMode]);

  const handleBulkApprove = async (isApproved: boolean) => {
    setBulkApproving(true);
    for (const id of selectedIds) {
      await ApproveAssessment({ id, isApproved, note: approveNote || (isApproved ? "Approved" : "Declined") }, tokenData);
    }
    setBulkApproving(false);
    onBulkClose();
    setApproveNote("");
    setSelectedIds(new Set());
    setWa1Data([]); // force refetch
    setRefresh(p => p + 1);
    showToast({ description: `${isApproved ? "Approved" : "Declined"} ${selectedIds.size} assessment(s)`, statusToast: isApproved ? "success" : "warning" });
  };

  const handleOpenBatchDetail = async (batch: AppsCriticalReportBatchSummary) => {
    if (!tokenData) {
      const token = localStorage.getItem("tokenData") as string;
      if (token) setTokenData(token);
    }
    setSelectedBatch(batch);
    setBatchDetail(null);
    onBatchModalOpen();
    const token = tokenData || (localStorage.getItem("tokenData") as string);
    const res = await GetBatchDetail(batch.batchCode, token);
    if (res?.statusCode === RES_CODE_OK) setBatchDetail(res.data);
  };

  const handleBatchApprove = async (isApproved: boolean) => {
    if (!selectedBatch) return;
    setBatchApproving(true);
    const res = await ApproveBatch({ batchCode: selectedBatch.batchCode, isApproved, note: batchNote || (isApproved ? "Batch Approved" : "Batch Declined") }, tokenData);
    setBatchApproving(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: isApproved ? "Batch approved" : "Batch declined", statusToast: isApproved ? "success" : "warning" });
      onBatchModalClose();
      setBatchNote("");
      setWa1Data([]); // force refetch if switching tabs
      setRefresh(p => p + 1);
    } else showToast({ description: res?.message || "Failed", statusToast: "error" });
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const approvableIds = wa1Data.filter(i => canApproveMap[i.id]).map(i => i.id);
  const selectAll = () => setSelectedIds(new Set(approvableIds));
  const clearAll = () => setSelectedIds(new Set());

  // WA1 columns
  const wa1Columns = useMemo<ColumnDef<AppsCriticalReportAssessmentViewModel>[]>(() => [
    {
      id: "select",
      header: () => (
        <Tooltip label="Select all on this page">
          <Checkbox isChecked={approvableIds.length > 0 && approvableIds.every(id => selectedIds.has(id))} onChange={e => e.target.checked ? selectAll() : clearAll()} />
        </Tooltip>
      ),
      cell: (info: any) => canApproveMap[info.row.original.id]
        ? <Checkbox isChecked={selectedIds.has(info.row.original.id)} onChange={() => toggleSelect(info.row.original.id)} />
        : null,
      footer: (p: any) => p.column.id,
    },
    {
      accessorKey: "appShortName",
      cell: (info) => <VStack align="start" spacing={0}><Text fontSize="sm" fontWeight="semibold">{info.getValue() as string}</Text><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{info.row.original.appName || "-"}</Text></VStack>,
      header: () => <Text>App</Text>,
      footer: (p) => p.column.id,
    },
    { accessorKey: "appManageByGroupName", cell: (info) => <Text fontSize="sm" noOfLines={1}>{(info.getValue() as string) || "-"}</Text>, header: () => <Text>Group</Text>, footer: (p) => p.column.id },
    { accessorKey: "batchCode", cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{info.getValue() as string}</Badge>, header: () => <Text>Batch</Text>, footer: (p) => p.column.id },
    { accessorKey: "statusReport", cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>, header: () => <Text>Status</Text>, footer: (p) => p.column.id },
    { accessorKey: "crtAssessmentFinalScore", cell: (info) => <Badge colorScheme="teal">{Number(info.getValue()).toFixed(3)}</Badge>, header: () => <Text>Score</Text>, footer: (p) => p.column.id },
    {
      id: "approver",
      header: () => <Text>Approver</Text>,
      cell: (info) => canApproveMap[info.row.original.id]
        ? <Badge colorScheme="green" variant="subtle">Can Approve</Badge>
        : <Badge colorScheme="gray" variant="outline" fontSize="xs">Not Assigned</Badge>,
      footer: (p) => p.column.id,
    },
    {
      id: "actions",
      header: () => <Text>Detail</Text>,
      cell: (info) => <IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost"
        onClick={() => router.push(`/report/apps-assessments/assessment?id=${info.row.original.id}&source=pending`)} />,
      footer: (p) => p.column.id,
    },
  ], [selectedIds, canApproveMap, approvableIds, isDark]);

  // WA2 batch columns
  const wa2Columns = useMemo<ColumnDef<AppsCriticalReportBatchSummary>[]>(() => [
    { accessorKey: "batchCode", cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{info.getValue() as string}</Badge>, header: () => <Text>Batch Code</Text>, footer: (p) => p.column.id },
    { accessorKey: "quartalReport", cell: (info) => <Text fontSize="sm">{info.getValue() as string} {info.row.original.yearReport}</Text>, header: () => <Text>Period</Text>, footer: (p) => p.column.id },
    { accessorKey: "statusReport", cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>, header: () => <Text>Status</Text>, footer: (p) => p.column.id },
    { accessorKey: "assessmentCount", cell: (info) => <Badge colorScheme="teal">{info.getValue() as number} apps</Badge>, header: () => <Text>Apps</Text>, footer: (p) => p.column.id },
    {
      id: "actions", header: () => <Text>Review</Text>,
      cell: (info) => <Button size="sm" colorScheme="blue" leftIcon={<FiEye />} onClick={() => handleOpenBatchDetail(info.row.original)}>Review</Button>,
      footer: (p) => p.column.id,
    },
  ], []);

  const wa1Table = useReactTable({ data: wa1Data, columns: wa1Columns, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const wa2Table = useReactTable({ data: wa2Batches, columns: wa2Columns, pageCount: totalPages, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), manualFiltering: true, manualPagination: true });

  const tabConfig = [
    { mode: "WA1" as TabMode, label: "Waiting Approval 1", icon: FiClock },
    { mode: "WA2" as TabMode, label: "Waiting Approval 2", icon: FiClock },
    { mode: "FINAL" as TabMode, label: "Approved / Decline", icon: FiCheckCircle },
  ];

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Pending Approve — Apps Assessment" breadCrumb={["Home", "Report", "Pending Approve Assessment Apps"]} />
      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <HStack spacing={3}>
                <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FiActivity} boxSize={5} /></Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={isDark ? "white" : "gray.800"}>Apps Assessment Approval</Heading>
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Review and approve assessment reports</Text>
                </VStack>
              </HStack>

              {/* Tabs */}
              <HStack spacing={1} bg={isDark ? "gray.700" : "gray.100"} rounded="lg" p={1} w="fit-content">
                {tabConfig.map(({ mode, label, icon }) => (
                  <Button key={mode} size="sm" px={4} variant={tabMode === mode ? "solid" : "ghost"} colorScheme={tabMode === mode ? "purple" : "gray"} leftIcon={<Icon as={icon} />}
                    onClick={() => { setTabMode(mode); setPagination({ pageIndex: 0, pageSize }); }}>
                    {label}
                  </Button>
                ))}
              </HStack>

              {/* Filters + bulk action for WA1 */}
              <Flex gap={3} wrap="wrap" align="center">
                <InputGroup maxW="280px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setRefresh(p => p + 1)} bg={isDark ? "gray.700" : "white"} />
                </InputGroup>
                <Button variant="outline" leftIcon={<FiX />} onClick={() => { setSearch(""); setRefresh(p => p + 1); }}>Clear</Button>
                <Spacer />
                {tabMode === "WA1" && selectedIds.size > 0 && (
                  <Button colorScheme="green" size="sm" onClick={onBulkOpen}>
                    Bulk Approve ({selectedIds.size} selected)
                  </Button>
                )}
                <Button colorScheme="gray" leftIcon={<FiRefreshCw />} onClick={() => { setWa1Data([]); setRefresh(p => p + 1); }}>Refresh</Button>
              </Flex>

              <HStack>
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} record(s)</Text>
                <Spacer />
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Page {pageIndex + 1} of {totalPages || 1}</Text>
              </HStack>

              {loading ? <Flex justify="center" py={8}><VStack spacing={3}><Spinner size="xl" color="purple.500" thickness="4px" /><Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Loading data, please wait...</Text></VStack></Flex> : (
                <>
                  {tabMode === "WA1" && <TableComponentFull table={wa1Table} />}
                  {tabMode === "WA2" && <TableComponentFull table={wa2Table} />}
                  {tabMode === "FINAL" && (
                    <Stack spacing={3}>
                      {finalData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map(a => (
                        <Flex key={a.id} p={3} bg={isDark ? "gray.750" : "gray.50"} rounded="lg" border="1px" borderColor={isDark ? "gray.600" : "gray.200"} align="center" gap={4}>
                          <VStack align="start" spacing={0} flex={1}><Text fontWeight="semibold" fontSize="sm">{a.appShortName}</Text><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{a.appName}</Text></VStack>
                          <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{a.batchCode}</Badge>
                          <Badge colorScheme={statusColor(a.statusReport)} variant="solid">{a.statusReport}</Badge>
                          <IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost"
                            onClick={() => router.push(`/report/apps-assessments/assessment?id=${a.id}&source=pending`)} />
                        </Flex>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Bulk Approve Modal */}
      <Modal isOpen={isBulkOpen} onClose={onBulkClose} size="md">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>Bulk Approval — {selectedIds.size} Assessment(s)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>You are about to approve/decline {selectedIds.size} selected assessment(s). This action follows the approval flow.</Text>
              <Textarea placeholder="Note (optional)" value={approveNote} onChange={e => setApproveNote(e.target.value)} rows={3} bg={isDark ? "gray.700" : "white"} />
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onBulkClose}>Cancel</Button>
            <Button colorScheme="red" variant="outline" isLoading={bulkApproving} onClick={() => handleBulkApprove(false)}>Decline All</Button>
            <Button colorScheme="green" isLoading={bulkApproving} onClick={() => handleBulkApprove(true)}>Approve All</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Batch Review Modal */}
      <Modal isOpen={isBatchModalOpen} onClose={onBatchModalClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            <HStack>
              <Badge colorScheme="purple" fontFamily="mono">{selectedBatch?.batchCode}</Badge>
              <Badge colorScheme="blue" variant="outline">{selectedBatch?.quartalReport} {selectedBatch?.yearReport}</Badge>
              <Badge colorScheme={statusColor(selectedBatch?.statusReport || "")} variant="subtle">{selectedBatch?.statusReport}</Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!batchDetail ? <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex> : (
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  {[
                    { label: "Batch", value: batchDetail.batchCode },
                    { label: "Quarter", value: batchDetail.quartalReport },
                    { label: "Year", value: batchDetail.yearReport },
                    { label: "Total Apps", value: String(batchDetail.assessments?.length || 0) },
                  ].map(({ label, value }) => (
                    <Box key={label} p={3} bg={isDark ? "gray.700" : "gray.50"} rounded="md">
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>{label}</Text>
                      <Text fontSize="sm" fontWeight="semibold">{value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
                <Divider />
                <Text fontWeight="semibold" fontSize="sm">Assessments ({batchDetail.assessments?.length}):</Text>
                <Stack spacing={2} maxH="350px" overflowY="auto">
                  {batchDetail.assessments?.map(a => (
                    <Flex key={a.id} p={3} bg={isDark ? "gray.750" : "white"} rounded="md" border="1px" borderColor={isDark ? "gray.600" : "gray.100"} gap={3} align="center">
                      <VStack align="start" spacing={0} flex={1}><Text fontSize="sm" fontWeight="medium">{a.appShortName}</Text><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{a.appName}</Text></VStack>
                      <Badge colorScheme={statusColor(a.statusReport)} variant="subtle" fontSize="xs">{a.statusReport}</Badge>
                      <Badge colorScheme="teal" fontSize="xs">{Number(a.crtAssessmentFinalScore).toFixed(3)}</Badge>
                    </Flex>
                  ))}
                </Stack>
                <Divider />
                <Textarea placeholder="Approval note (optional)" value={batchNote} onChange={e => setBatchNote(e.target.value)} rows={3} bg={isDark ? "gray.700" : "white"} />
              </Stack>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onBatchModalClose}>Cancel</Button>
            <Button colorScheme="red" variant="outline" isLoading={batchApproving} isDisabled={!batchDetail} onClick={() => handleBatchApprove(false)}>Decline Batch</Button>
            <Button colorScheme="green" isLoading={batchApproving} isDisabled={!batchDetail} onClick={() => handleBatchApprove(true)}>Approve Batch</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
