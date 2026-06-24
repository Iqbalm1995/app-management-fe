"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, { AppsCriticalReportBatchSummary } from "@/app/services/useAppsCriticalReport";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, Flex, Heading, HStack, Icon,
  IconButton, Input, InputGroup, InputLeftElement, Select, Spacer,
  Spinner, Text, useColorMode, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiEye, FiRefreshCw, FiZap, FiX } from "react-icons/fi";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

const statusColor = (s: string) => ({ DRAFT: "gray", PUBLISHED: "green", APPROVED: "blue", ARCHIVED: "orange" }[s] || "gray");

export default function AppsAssessmentsView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { Generate, List } = useAppsCriticalReport();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<AppsCriticalReportBatchSummary[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
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
      if (filterStatus) fw.push({ field: "statusReport", operator: "=", value: filterStatus });
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
  }, [DataAuth, tokenData, refresh, pageIndex, pageSize, search, filterQ, filterYear, filterStatus]);

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
        <IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost"
          onClick={() => router.push(`/report/apps-assessments/detail?batchCode=${info.row.original.batchCode}`)} />
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
                  isLoading={generating} onClick={handleGenerate} size="sm">
                  Generate Report
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
                <Select placeholder="All Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} maxW="130px" bg={isDark ? "gray.700" : "white"}>
                  {["DRAFT", "PUBLISHED", "APPROVED", "ARCHIVED"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Button variant="outline" size="md" leftIcon={<FiX />} onClick={() => { setSearch(""); setFilterQ(""); setFilterYear(""); setFilterStatus(""); setPagination({ pageIndex: 0, pageSize }); }}>Clear</Button>
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
    </LayoutAdmin>
  );
}
