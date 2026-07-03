"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReporting, { AppsCriticalReportingPeriodResponse } from "@/app/services/useAppsCriticalReporting";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, Flex, FormControl, FormErrorMessage,
  FormLabel, Grid, GridItem, Heading, HStack, Icon, IconButton, Input,
  InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spacer,
  Spinner, Stack, Text, Textarea, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiPlusSquare, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import * as Yup from "yup";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { useRouter } from "next/navigation";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

export default function UploadReportAssessmentsView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { List, Insert, Delete } = useAppsCriticalReporting();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [periods, setPeriods] = useState<AppsCriticalReportingPeriodResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);
  const [isDeletePeriodOpen, setIsDeletePeriodOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen: isInsertOpen, onOpen: onInsertOpen, onClose: onInsertClose } = useDisclosure();

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
      if (filterQ) fw.push({ field: "reportQuartal", operator: "=", value: filterQ });
      if (filterYear) fw.push({ field: "reportYear", operator: "=", value: filterYear });
      const res = await List({ search, limit: pageSize, page: pageIndex, filterWhere: fw, fieldOrder: ["reportTime"], orderDir: "desc" } as PaggingListPayload, tokenData);
      if (res?.statusCode === RES_CODE_OK) { setPeriods(res.data || []); setTotalCount(res.countTotal || 0); setTotalPages(Math.ceil((res.countTotal || 0) / pageSize)); }
      else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
      setLoading(false);
    };
    fetchData();
  }, [DataAuth, tokenData, refresh, search, filterQ, filterYear, pageIndex, pageSize]);

  const insertFormik = useFormik({
    initialValues: { reportQuartal: "", reportYear: String(new Date().getFullYear()), note: "" },
    validationSchema: Yup.object({ reportQuartal: Yup.string().required("Quarter is required"), reportYear: Yup.string().required("Year is required") }),
    onSubmit: async (values, { resetForm }) => {
      setActionLoading(true);
      const res = await Insert({ reportQuartal: values.reportQuartal, reportYear: values.reportYear, note: values.note || undefined }, tokenData);
      setActionLoading(false);
      if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Period created", statusToast: "success" }); resetForm(); onInsertClose(); setRefresh(p => p + 1); }
      else showToast({ description: res?.message || "Failed", statusToast: "error" });
    },
  });

  const columns = useMemo<ColumnDef<AppsCriticalReportingPeriodResponse>[]>(() => [
    {
      accessorKey: "numbData",
      cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{pageIndex * pageSize + info.row.index + 1}.</Text></Flex>,
      header: () => <Flex justifyContent="center">No.</Flex>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "reportQuartal",
      cell: (info) => (
        <HStack spacing={2}>
          <Badge colorScheme="purple" fontSize="sm" px={2} py={0.5}>{info.getValue() as string}</Badge>
          <Badge colorScheme="blue" variant="outline" fontSize="sm">{info.row.original.reportYear}</Badge>
        </HStack>
      ),
      header: () => <Text>Reporting Period</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "reportTime",
      cell: (info) => (
        <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
          {new Date(info.getValue() as string).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>
      ),
      header: () => <Text>Report Date</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "documentCount",
      cell: (info) => (
        <HStack spacing={1}>
          <Icon as={FiFileText} boxSize={3.5} color={isDark ? "secondary.300" : "secondary.500"} />
          <Badge colorScheme="blue" variant="subtle">{info.getValue() as number} document(s)</Badge>
        </HStack>
      ),
      header: () => <Text>Documents</Text>,
      footer: (p) => p.column.id,
    },
    {
      accessorKey: "note",
      cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"} noOfLines={1}>{(info.getValue() as string) || "-"}</Text>,
      header: () => <Text>Note</Text>,
      footer: (p) => p.column.id,
    },
    {
      id: "actions",
      header: () => <Text>Actions</Text>,
      cell: (info) => (
        <Button size="xs" colorScheme="purple" variant="outline" _hover={{ bg: "purple.500", color: "white" }}
          onClick={() => router.push(`/report/upload-report-assessments-apps/detail?id=${info.row.original.id}`)}>
          View
        </Button>
      ),
      footer: (p) => p.column.id,
    },
  ], [pageIndex, pageSize, isDark]);

  const table = useReactTable({ data: periods, columns, pageCount: totalPages ?? 1, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), manualFiltering: true, manualPagination: true });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Upload Report Assessments Apps" breadCrumb={["Home", "Report", "Upload Report Assessments Apps"]} />
      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">

              {/* Header */}
              <HStack spacing={3} justify="space-between">
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="secondary.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <Icon as={FiFileText} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color={isDark ? "white" : "gray.800"}>Report Assessment Documents</Heading>
                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} reporting period(s) found</Text>
                  </VStack>
                </HStack>
                <Button colorScheme="blue" leftIcon={<FiPlusSquare />} size="sm" onClick={onInsertOpen}>Add Period</Button>
              </HStack>

              {/* Filters */}
              <Flex gap={3} wrap="wrap">
                <InputGroup maxW="260px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search period..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && setPagination({ pageIndex: 0, pageSize })}
                    isDisabled={loading} bg={isDark ? "gray.700" : "white"} />
                </InputGroup>
                <Select placeholder="All Quarters" value={filterQ} onChange={e => setFilterQ(e.target.value)} maxW="130px" bg={isDark ? "gray.700" : "white"}>
                  {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                </Select>
                <Select placeholder="All Years" value={filterYear} onChange={e => setFilterYear(e.target.value)} maxW="110px" bg={isDark ? "gray.700" : "white"}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
                <Button variant="outline" leftIcon={<FiX />} onClick={() => { setSearch(""); setFilterQ(""); setFilterYear(""); setPagination({ pageIndex: 0, pageSize }); }}>Clear</Button>
                <Spacer />
                <Button colorScheme="gray" leftIcon={<FiRefreshCw />} onClick={() => setRefresh(p => p + 1)} isLoading={loading}>Refresh</Button>
              </Flex>

              {/* Count */}
              <HStack>
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} period(s)</Text>
                <Spacer />
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Page {pageIndex + 1} of {totalPages || 1}</Text>
              </HStack>

              {/* Table */}
              {loading ? <Flex justify="center" py={8}><Spinner color="secondary.500" size="lg" /></Flex> : (
                <Box overflowX="auto" w="full"><Box minW="700px"><TableComponentFull table={table} /></Box></Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Insert Period Modal */}
      <Modal isOpen={isInsertOpen} onClose={() => { insertFormik.resetForm(); onInsertClose(); }} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent rounded="12px" shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} overflow="hidden" bg={isDark ? "gray.800" : "white"}>
          <form onSubmit={insertFormik.handleSubmit}>
            {/* Header — compact, solid color */}
            <Flex bg="secondary.500" px={5} py={3} align="center" justify="space-between">
              <Text fontSize="sm" fontWeight="600" color="white">New Reporting Period</Text>
              <IconButton aria-label="Close" icon={<FiX />} size="xs" variant="ghost" color="white"
                _hover={{ bg: "whiteAlpha.200" }} onClick={() => { insertFormik.resetForm(); onInsertClose(); }} />
            </Flex>
            {/* Body */}
            <Box px={5} py={5}>
              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <FormControl isInvalid={!!(insertFormik.errors.reportQuartal && insertFormik.touched.reportQuartal)}>
                  <FormLabel fontSize="xs" fontWeight="500" mb={1} color={isDark ? "gray.300" : "gray.600"}>Quarter <Text as="span" color="red.400">*</Text></FormLabel>
                  <Select name="reportQuartal" value={insertFormik.values.reportQuartal} onChange={insertFormik.handleChange}
                    placeholder="Select" size="sm" rounded="8px" bg={isDark ? "gray.700" : "white"} borderColor={isDark ? "gray.600" : "gray.200"}
                    _focus={{ borderColor: "secondary.400", boxShadow: "0 0 0 1px var(--chakra-colors-secondary-400)" }}>
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </Select>
                  <FormErrorMessage fontSize="xs">{insertFormik.errors.reportQuartal}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="500" mb={1} color={isDark ? "gray.300" : "gray.600"}>Year</FormLabel>
                  <Select name="reportYear" value={insertFormik.values.reportYear} onChange={insertFormik.handleChange}
                    size="sm" rounded="8px" bg={isDark ? "gray.700" : "white"} borderColor={isDark ? "gray.600" : "gray.200"}
                    _focus={{ borderColor: "secondary.400", boxShadow: "0 0 0 1px var(--chakra-colors-secondary-400)" }}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </FormControl>
              </Grid>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="500" mb={1} color={isDark ? "gray.300" : "gray.600"}>Note</FormLabel>
                <Textarea name="note" value={insertFormik.values.note} onChange={insertFormik.handleChange}
                  rows={2} size="sm" rounded="8px" placeholder="Optional description..."
                  bg={isDark ? "gray.700" : "white"} borderColor={isDark ? "gray.600" : "gray.200"}
                  _placeholder={{ color: isDark ? "gray.500" : "gray.400" }}
                  _focus={{ borderColor: "secondary.400", boxShadow: "0 0 0 1px var(--chakra-colors-secondary-400)" }} />
              </FormControl>
            </Box>
            {/* Footer — compact, right-aligned */}
            <Flex px={5} py={3} justify="flex-end" gap="12px" borderTop="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
              <Button variant="ghost" size="sm" fontSize="xs" fontWeight="500" color={isDark ? "gray.400" : "gray.500"}
                _hover={{ color: isDark ? "white" : "gray.700", bg: isDark ? "gray.700" : "gray.100" }}
                onClick={() => { insertFormik.resetForm(); onInsertClose(); }}>Cancel</Button>
              <Button type="submit" size="sm" fontSize="xs" fontWeight="600" bg="secondary.500" color="white"
                _hover={{ bg: "secondary.600" }} _active={{ bg: "secondary.700" }}
                rounded="8px" isLoading={actionLoading}>Create Period</Button>
            </Flex>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmationDialog isOpenTrigger={isDeletePeriodOpen} trigger={setIsDeletePeriodOpen}
        action={async () => {
          const res = await Delete(deletingId, tokenData);
          if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Period deleted", statusToast: "success" }); setRefresh(p => p + 1); }
          else showToast({ description: res?.message || "Failed", statusToast: "error" });
        }}
        captionMsg="Delete Reporting Period" questionMsg="Are you sure you want to delete this reporting period and all its documents?" />
    </LayoutAdmin>
  );
}
