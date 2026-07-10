"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, { AppsCriticalReportBatchSummary } from "@/app/services/useAppsCriticalReport";
import useApps from "@/app/services/useApps";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, Divider, Flex, Heading, HStack, Icon,
  IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, SimpleGrid, Spacer,
  Spinner, Text, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiEye, FiGrid, FiRefreshCw, FiZap, FiX } from "react-icons/fi";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

const statusColor = (s: string) => ({ DRAFT: "gray", PUBLISHED: "green", APPROVED: "blue", ARCHIVED: "orange" }[s] || "gray");

type TabMode = "ONGOING" | "COMPLETED";
const TAB_STATUS: Record<TabMode, string> = {
  ONGOING: "DRAFT,WAITING APPROVAL 1,WAITING APPROVAL 2",
  COMPLETED: "APPROVED,DECLINE",
};

export default function AppsAssessmentsView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabMode, setTabMode] = useState<TabMode>("ONGOING");

  // Sync tab from URL param
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "ONGOING" || t === "COMPLETED") setTabMode(t as TabMode);
  }, [searchParams]);
  const { Generate, List } = useAppsCriticalReport();
  const { List: ListApps } = useApps();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<AppsCriticalReportBatchSummary[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [appCount, setAppCount] = useState<number | null>(null);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  // Compute current period for confirmation display
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const currentPeriodLabel = `Q${currentQuarter} ${currentYear}`;
  const [search, setSearch] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    const fetchData = async () => {
      setLoading(true);
      const fw: any[] = [];
      if (filterQ) fw.push({ field: "quartalReport", operator: "=", value: filterQ });
      if (filterYear) fw.push({ field: "yearReport", operator: "=", value: filterYear });
      // Tab-locked status filter
      fw.push({ field: "statusReport", operator: "in", value: TAB_STATUS[tabMode] });
      const payload: PaggingListPayload = { search, limit: pageSize, page: pageIndex, filterWhere: fw, fieldOrder: ["timeReport"], orderDir: "desc" };
      const res = await List(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        setData(res.data || []);
        setTotalCount(res.countTotal || 0);
        setTotalPages(Math.ceil((res.countTotal || 0) / pageSize));
      } else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
      setLoading(false);
    };
    fetchData();
  }, [DataAuth, tokenData, refresh, pageIndex, pageSize, search, filterQ, filterYear, tabMode]);

  const handleOpenConfirm = async () => {
    setAppCount(null);
    onConfirmOpen();
    if (tokenData) {
      const res = await ListApps({ search: "", limit: 1, page: 0, filterWhere: [], fieldOrder: [], orderDir: "asc" }, tokenData);
      if (res?.statusCode === RES_CODE_OK) setAppCount(res.countTotal ?? 0);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await Generate(tokenData);
    setGenerating(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: `Generated ${res.data?.batchCode} — ${res.data?.assessmentCount} assessments`, statusToast: "success" });
      setRefresh(p => p + 1);
    } else showToast({ description: res?.message || "Generate failed", statusToast: "error" });
  };

  const columns = useMemo<ColumnDef<AppsCriticalReportBatchSummary>[]>(() => [
    {
      accessorKey: "numbData",
      cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{pageIndex * pageSize + info.row.index + 1}.</Text></Flex>,
      header: () => <Flex justifyContent="center">No.</Flex>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "batchCode",
      cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{info.getValue() as string}</Badge>,
      header: () => <Text>Batch Code</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "quartalReport",
      cell: (info) => <Badge colorScheme="blue" variant="outline">{info.getValue() as string}</Badge>,
      header: () => <Text>Quarter</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "yearReport",
      cell: (info) => <Text fontSize="sm" fontWeight="medium">{info.getValue() as string}</Text>,
      header: () => <Text>Year</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "timeReport",
      cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{new Date(info.getValue() as string).toLocaleString("id-ID")}</Text>,
      header: () => <Text>Generated At</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "statusReport",
      cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>,
      header: () => <Text>Status</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "assessmentCount",
      cell: (info) => (
        <HStack spacing={1}>
          <Badge colorScheme="teal">{info.getValue() as number}</Badge>
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>apps</Text>
        </HStack>
      ),
      header: () => <Text>Apps</Text>,
      footer: (p) => p.column.id,
    },
    {
      id: "actions",
      header: () => <Text>Actions</Text>,
      cell: (info) => (
        <Button size="xs" colorScheme="blue" variant="outline"
          _hover={{ bg: "blue.500", color: "white" }}
          onClick={() => router.push(`/report/apps-assessments/detail?batchCode=${info.row.original.batchCode}`)}>
          Show
        </Button>
      ),
      footer: (p) => p.column.id,
    },
  ], [pageIndex, pageSize, isDark]);

  const table = useReactTable({
    data, columns,
    pageCount: totalPages ?? 1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Assessment of Critical Apps" breadCrumb={["Home", "Report", "Assessment of Critical Apps"]} />
      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">

              {/* Header */}
              <HStack spacing={3} justify="space-between">
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <Icon as={FiActivity} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color={isDark ? "white" : "gray.800"}>Report Assessment Apps</Heading>
                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} batch(es) found</Text>
                  </VStack>
                </HStack>
                <Button colorScheme="purple" leftIcon={generating ? <Spinner size="xs" /> : <FiZap />}
                  isLoading={generating} onClick={handleOpenConfirm} size="sm">
                  Generate Report
                </Button>
              </HStack>

              {/* Tab Toggle */}
              <HStack
                spacing={1}
                bg={isDark ? "gray.700" : "gray.100"}
                rounded="lg"
                p={1}
                w="fit-content"
              >
                <Button
                  size="sm"
                  variant={tabMode === "ONGOING" ? "solid" : "ghost"}
                  colorScheme={tabMode === "ONGOING" ? "blue" : "gray"}
                  leftIcon={<Icon as={FiClock} />}
                  fontSize="sm"
                  px={4}
                  onClick={() => { setTabMode("ONGOING"); setPagination({ pageIndex: 0, pageSize }); router.replace("/report/apps-assessments?tab=ONGOING"); }}
                >
                  On Going Review
                </Button>
                <Button
                  size="sm"
                  variant={tabMode === "COMPLETED" ? "solid" : "ghost"}
                  colorScheme={tabMode === "COMPLETED" ? "blue" : "gray"}
                  leftIcon={<Icon as={FiCheckCircle} />}
                  fontSize="sm"
                  px={4}
                  onClick={() => { setTabMode("COMPLETED"); setPagination({ pageIndex: 0, pageSize }); router.replace("/report/apps-assessments?tab=COMPLETED"); }}
                >
                  Completed
                </Button>
              </HStack>

              {/* Filters */}
              <Flex gap={3} wrap="wrap">
                <InputGroup maxW="260px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search batch code..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setPagination({ pageIndex: 0, pageSize })}
                    bg={isDark ? "gray.700" : "white"} />
                </InputGroup>
                <Select placeholder="All Quarters" value={filterQ} onChange={(e) => setFilterQ(e.target.value)} maxW="130px" bg={isDark ? "gray.700" : "white"}>
                  {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                </Select>
                <Select placeholder="All Years" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} maxW="110px" bg={isDark ? "gray.700" : "white"}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
                <Button variant="outline" size="md" leftIcon={<FiX />} onClick={() => { setSearch(""); setFilterQ(""); setFilterYear(""); setPagination({ pageIndex: 0, pageSize }); }}>Clear</Button>
                <Spacer />
                <Button colorScheme="gray" leftIcon={<FiRefreshCw />} onClick={() => setRefresh(p => p + 1)}>Refresh</Button>
              </Flex>

              {/* Count info */}
              <HStack>
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} batch(es)</Text>
                <Spacer />
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Page {pageIndex + 1} of {totalPages || 1}</Text>
              </HStack>

              <TableComponentFull table={table} />
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Generate Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box w={8} h={8} bg="purple.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiZap} boxSize={4} />
              </Box>
              <Text fontWeight="bold">Generate Assessment Report</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <VStack spacing={4} align="stretch">
              <HStack p={4} bg={isDark ? "purple.900" : "purple.50"} rounded="lg"
                border="1px" borderColor={isDark ? "purple.700" : "purple.200"}>
                <Icon as={FiAlertCircle} color="purple.500" boxSize={5} flexShrink={0} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="semibold" color={isDark ? "purple.200" : "purple.700"}>
                    Period: {currentPeriodLabel}
                  </Text>
                  <Text fontSize="xs" color={isDark ? "purple.300" : "purple.600"}>
                    This will generate a new assessment batch for the current quarter and year.
                  </Text>
                </VStack>
              </HStack>
              <Divider />
              <SimpleGrid columns={2} spacing={3}>
                {[
                  { label: "Quarter", value: `Q${currentQuarter}` },
                  { label: "Year", value: String(currentYear) },
                  { label: "Batch Code", value: `RPQ${currentQuarter}${currentYear}-APPS????` },
                  { label: "Status", value: "DRAFT" },
                  { label: "Applications", value: appCount === null ? "Loading..." : `${appCount} apps` },
                ].map(({ label, value }) => (
                  <Box key={label} p={3} bg={isDark ? "gray.700" : "gray.50"} rounded="md">
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>{label}</Text>
                    <Text fontSize="sm" fontWeight="semibold" fontFamily={label === "Batch Code" ? "mono" : "inherit"}>{value}</Text>
                  </Box>
                ))}
              </SimpleGrid>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                A new batch will be created for ALL active applications. Each app will get an assessment record with all criteria to be filled in.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onConfirmClose}>Cancel</Button>
            <Button colorScheme="purple" leftIcon={<FiZap />} isLoading={generating}
              onClick={async () => {
                onConfirmClose();
                await handleGenerate();
              }}>
              Confirm Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
