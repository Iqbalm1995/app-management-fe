"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReporting, {
  AppsCriticalReportingDocumentResponse,
  AppsCriticalReportingPeriodDetailResponse,
  AppsCriticalReportingPeriodResponse,
} from "@/app/services/useAppsCriticalReporting";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge, Box, Button, Card, CardBody, Divider, Flex, FormControl,
  FormErrorMessage, FormLabel, Grid, GridItem, Heading, HStack, Icon,
  IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Select, Spacer, Spinner, Stack, Text, Textarea, useColorMode,
  useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEdit, FiEye, FiFile, FiFileText, FiPlusSquare, FiRefreshCw, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import * as Yup from "yup";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { useRouter } from "next/navigation";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

export default function UploadReportAssessmentsView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const { List, Insert, Delete } = useAppsCriticalReporting();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const router = useRouter();
  const [periods, setPeriods] = useState<AppsCriticalReportingPeriodResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);
  const [selectedPeriod, setSelectedPeriod] = useState<AppsCriticalReportingPeriodDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [attachMethod, setAttachMethod] = useState<"file" | "link">("file");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState("");
  const [isDeletePeriodOpen, setIsDeletePeriodOpen] = useState(false);
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const { isOpen: isInsertOpen, onOpen: onInsertOpen, onClose: onInsertClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isEditDocOpen, onOpen: onEditDocOpen, onClose: onEditDocClose } = useDisclosure();

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
      const res = await List({ search, limit: pageSize, page: pageIndex, filterWhere: [], fieldOrder: ["reportTime"], orderDir: "desc" } as PaggingListPayload, tokenData);
      if (res?.statusCode === RES_CODE_OK) { setPeriods(res.data || []); setTotalCount(res.countTotal || 0); setTotalPages(Math.ceil((res.countTotal || 0) / pageSize)); }
      else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
      setLoading(false);
    };
    fetchData();
  }, [DataAuth, tokenData, refresh, search, pageIndex, pageSize]);

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
    { accessorKey: "numbData", cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{pageIndex * pageSize + info.row.index + 1}.</Text></Flex>, header: () => <Flex justifyContent="center">No.</Flex>, footer: (p) => p.column.id },
    { accessorKey: "reportQuartal", cell: (info) => <HStack spacing={2}><Badge colorScheme="purple" px={2}>{info.getValue() as string}</Badge><Badge colorScheme="blue" variant="outline">{info.row.original.reportYear}</Badge></HStack>, header: () => <Text>Period</Text>, footer: (p) => p.column.id },
    { accessorKey: "reportTime", cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{new Date(info.getValue() as string).toLocaleDateString("id-ID")}</Text>, header: () => <Text>Report Time</Text>, footer: (p) => p.column.id },
    { accessorKey: "documentCount", cell: (info) => <Badge colorScheme="teal" variant="subtle">{info.getValue() as number} doc(s)</Badge>, header: () => <Text>Documents</Text>, footer: (p) => p.column.id },
    { accessorKey: "note", cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"} noOfLines={1}>{(info.getValue() as string) || "-"}</Text>, header: () => <Text>Note</Text>, footer: (p) => p.column.id },
    { id: "actions", header: () => <Text>Actions</Text>, cell: (info) => (<HStack spacing={1}><IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost" onClick={() => router.push(`/report/upload-report-assessments-apps/detail?id=${info.row.original.id}`)} /><IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => { setDeletingId(info.row.original.id); setIsDeletePeriodOpen(true); }} /></HStack>), footer: (p) => p.column.id },
  ], [pageIndex, pageSize, isDark]);

  const table = useReactTable({ data: periods, columns, pageCount: totalPages ?? 1, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), manualFiltering: true, manualPagination: true });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Upload Report Assessments Apps" breadCrumb={["Home", "Report", "Upload Report Assessments Apps"]} />
      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Section Header */}
              <HStack spacing={3} align="center">
                <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                  <Icon as={FiFileText} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={isDark ? "white" : "gray.800"}>Report Assessment Documents</Heading>
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} reporting period(s) found</Text>
                </VStack>
              </HStack>

              {/* Filters */}
              <Flex gap={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search quarter or year..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && setPagination({ pageIndex: 0, pageSize })}
                    isDisabled={loading} bg={isDark ? "gray.700" : "white"} />
                </InputGroup>
                <Button variant="outline" leftIcon={<FiX />} onClick={() => { setSearch(""); setPagination({ pageIndex: 0, pageSize }); }}>Clear</Button>
                <Spacer />
                <Button colorScheme="gray" leftIcon={<FiRefreshCw />} onClick={() => setRefresh(p => p + 1)} isLoading={loading}>Refresh</Button>
                <Button colorScheme="purple" leftIcon={<FiPlusSquare />} onClick={onInsertOpen}>Add Period</Button>
              </Flex>

              {/* Results info */}
              <HStack>
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{totalCount} record(s)</Text>
                <Spacer />
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Page {pageIndex + 1} of {totalPages || 1}</Text>
              </HStack>

              {/* Table */}
              {loading ? (
                <Flex justify="center" py={10}><Spinner color="purple.500" size="lg" /></Flex>
              ) : (
                <Box overflowX="auto" w="full">
                  <Box minW="800px">
                    <TableComponentFull table={table} />
                  </Box>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Insert Period Modal */}
      <Modal isOpen={isInsertOpen} onClose={() => { insertFormik.resetForm(); onInsertClose(); }} size="md">
        <ModalOverlay /><ModalContent rounded={radiusStyle}>
          <form onSubmit={insertFormik.handleSubmit}>
            <ModalHeader>Add Reporting Period</ModalHeader><ModalCloseButton />
            <ModalBody><Stack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!(insertFormik.errors.reportQuartal && insertFormik.touched.reportQuartal)}>
                    <FormLabel fontSize="sm">Quarter <Text as="span" color="red.400">*</Text></FormLabel>
                    <Select name="reportQuartal" value={insertFormik.values.reportQuartal} onChange={insertFormik.handleChange} placeholder="Select" bg={isDark ? "gray.700" : "white"}>
                      {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                    </Select>
                    <FormErrorMessage>{insertFormik.errors.reportQuartal}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">Year</FormLabel>
                    <Select name="reportYear" value={insertFormik.values.reportYear} onChange={insertFormik.handleChange} bg={isDark ? "gray.700" : "white"}>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>
              <FormControl>
                <FormLabel fontSize="sm">Note</FormLabel>
                <Textarea name="note" value={insertFormik.values.note} onChange={insertFormik.handleChange} rows={3} placeholder="Optional" bg={isDark ? "gray.700" : "white"} />
              </FormControl>
            </Stack></ModalBody>
            <ModalFooter gap={2}><Button variant="ghost" onClick={() => { insertFormik.resetForm(); onInsertClose(); }}>Cancel</Button><Button type="submit" colorScheme="purple" isLoading={actionLoading}>Create</Button></ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmationDialog isOpenTrigger={isDeletePeriodOpen} trigger={setIsDeletePeriodOpen}
        action={async () => { const res = await Delete(deletingId, tokenData); if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Period deleted", statusToast: "success" }); setRefresh(p => p + 1); } else showToast({ description: res?.message || "Failed", statusToast: "error" }); }}
        captionMsg="Delete Reporting Period" questionMsg="Are you sure you want to delete this reporting period and all its documents?" />
    </LayoutAdmin>
  );
}
