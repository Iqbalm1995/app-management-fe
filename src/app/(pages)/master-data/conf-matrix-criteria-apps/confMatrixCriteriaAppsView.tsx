"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMstAppsCriteriaCategory, {
  MstAppsCriteriaCategoryResponse,
} from "@/app/services/useMstAppsCriteriaCategory";
import useMstAppsCriteria, {
  MstAppsCriteriaResponse,
} from "@/app/services/useMstAppsCriteria";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiEdit,
  FiEye,
  FiGrid,
  FiLayers,
  FiPlusSquare,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  CriteriaCategoryDeleteConfirm,
  CriteriaCategoryDetailModal,
  CriteriaCategoryEditModal,
  CriteriaCategoryInsertModal,
} from "./CriteriaCategoryModals";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";

type TabMode = "CATEGORY" | "CRITERIA";

export default function ConfMatrixCriteriaAppsView() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const [tabMode, setTabMode] = useState<TabMode>("CRITERIA");
  const isDark = colorMode === "dark";

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Category state
  const [categoryData, setCategoryData] = useState<
    MstAppsCriteriaCategoryResponse[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryRefresh, setCategoryRefresh] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryTotalPages, setCategoryTotalPages] = useState(0);
  const [categoryTotalCount, setCategoryTotalCount] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );

  const { List: ListCategory } = useMstAppsCriteriaCategory();
  const { List: ListCriteria } = useMstAppsCriteria();
  const { Delete: DeleteCriteria } = useMstAppsCriteria();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "CRITERIA" || tabParam === "CATEGORY") {
      setTabMode(tabParam as TabMode);
    }
  }, [searchParams]);

  // Criteria state
  const [criteriaData, setCriteriaData] = useState<MstAppsCriteriaResponse[]>(
    [],
  );
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaRefresh, setCriteriaRefresh] = useState(0);
  const [criteriaSearch, setCriteriaSearch] = useState("");
  const [criteriaTotalPages, setCriteriaTotalPages] = useState(0);
  const [criteriaTotalCount, setCriteriaTotalCount] = useState(0);
  const [{ pageIndexC, pageSizeC }, setPaginationC] = useState<{
    pageIndexC: number;
    pageSizeC: number;
  }>({ pageIndexC: 0, pageSizeC: 10 });
  const [isCriteriaDeleteOpen, setIsCriteriaDeleteOpen] = useState(false);
  const [deletingCriteriaId, setDeletingCriteriaId] = useState("");

  // Modal state
  const {
    isOpen: isInsertOpen,
    onOpen: onInsertOpen,
    onClose: onInsertClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MstAppsCriteriaCategoryResponse | null>(null);
  const [deletingId, setDeletingId] = useState("");

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

  // Fetch category data
  useEffect(() => {
    if (!DataAuth || !tokenData || tabMode !== "CATEGORY") return;

    const fetchCategory = async () => {
      setCategoryLoading(true);
      try {
        const payload: PaggingListPayload = {
          search: categorySearch,
          limit: pageSize,
          page: pageIndex,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        };
        const res = await ListCategory(payload, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          setCategoryData(res.data || []);
          setCategoryTotalCount(res.countTotal || 0);
          setCategoryTotalPages(Math.ceil((res.countTotal || 0) / pageSize));
        } else {
          showToast({
            description: res?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      } catch {
        showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategory();
  }, [
    DataAuth,
    tokenData,
    tabMode,
    categoryRefresh,
    pageIndex,
    pageSize,
    categorySearch,
  ]);

  // Fetch criteria data
  useEffect(() => {
    if (!DataAuth || !tokenData || tabMode !== "CRITERIA") return;
    const fetchCriteria = async () => {
      setCriteriaLoading(true);
      try {
        const payload: PaggingListPayload = {
          search: criteriaSearch,
          limit: pageSizeC,
          page: pageIndexC,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        };
        const res = await ListCriteria(payload, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          setCriteriaData(res.data || []);
          setCriteriaTotalCount(res.countTotal || 0);
          setCriteriaTotalPages(Math.ceil((res.countTotal || 0) / pageSizeC));
        } else {
          showToast({
            description: res?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      } catch {
        showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
      } finally {
        setCriteriaLoading(false);
      }
    };
    fetchCriteria();
  }, [
    DataAuth,
    tokenData,
    tabMode,
    criteriaRefresh,
    pageIndexC,
    pageSizeC,
    criteriaSearch,
  ]);

  const categoryColumns = useMemo<ColumnDef<MstAppsCriteriaCategoryResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="flex-start" h="full">
            <Text fontSize="sm">
              {pageIndex * pageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (props) => props.column.id,
      },
      // {
      //   accessorKey: "crtCategoryCode",
      //   cell: (info) => (
      //     <Badge colorScheme="blue" variant="subtle" fontSize="xs">
      //       {info.getValue() as string}
      //     </Badge>
      //   ),
      //   header: () => <Text>Code</Text>,
      //   footer: (props) => props.column.id,
      // },
      {
        accessorKey: "crtCategoryName",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="bold">
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Category Name</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "crtCategoryDesc",
        cell: (info) => (
          <Text
            fontSize="sm"
            color={isDark ? "gray.400" : "gray.600"}
            noOfLines={2}
          >
            {(info.getValue() as string) || "-"}
          </Text>
        ),
        header: () => <Text>Description</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "valueOperator",
        cell: (info) => {
          const row = info.row.original;
          return (
            <Flex
              as={HStack}
              spacing={1}
              w={"full"}
              justifyContent="center"
              alignItems="flex-start"
            >
              <Text fontSize={"lg"} fontWeight={"bold"}>
                {row.valueOperator}
              </Text>

              <Text fontSize="sm" fontWeight="medium">
                {Number(row.valueTracehold).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 3,
                })}
              </Text>
            </Flex>
          );
        },
        header: () => (
          <Flex w={"full"} justifyContent="center" >
            <Text>Value Condition</Text>
          </Flex>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "createdAt",
        cell: (info) => (
          <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
            {new Date(info.getValue() as string).toLocaleDateString("id-ID")}
          </Text>
        ),
        header: () => <Text>Created At</Text>,
        footer: (props) => props.column.id,
      },
      {
        id: "actions",
        header: () => <Text>Actions</Text>,
        cell: (info) => (
          <HStack spacing={1}>
            <IconButton
              aria-label="Detail"
              icon={<FiEye />}
              size="sm"
              variant="ghost"
              colorScheme="teal"
              onClick={() => {
                setSelectedCategory(info.row.original);
                onDetailOpen();
              }}
            />
            <IconButton
              aria-label="Edit"
              icon={<FiEdit />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => {
                setSelectedCategory(info.row.original);
                onEditOpen();
              }}
            />
            <IconButton
              aria-label="Delete"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                setDeletingId(info.row.original.id);
                setIsDeleteOpen(true);
              }}
            />
          </HStack>
        ),
        footer: (props) => props.column.id,
      },
    ],
    [pageIndex, pageSize, isDark],
  );

  const categoryTable = useReactTable({
    data: categoryData,
    columns: categoryColumns,
    pageCount: categoryTotalPages ?? 1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  const criteriaColumns = useMemo<ColumnDef<MstAppsCriteriaResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="flex-start" h="full">
            <Text fontSize="sm">
              {pageIndexC * pageSizeC + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (props) => props.column.id,
      },
      // {
      //   accessorKey: "criteriaCode",
      //   cell: (info) => <Badge colorScheme="purple" variant="subtle" fontSize="xs">{info.getValue() as string}</Badge>,
      //   header: () => <Text>Code</Text>,
      //   footer: (props) => props.column.id,
      // },
      {
        accessorKey: "criteriaName",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium">
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Criteria Name</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "criteriaDesc",
        cell: (info) => (
          <Text
            fontSize="sm"
            color={isDark ? "gray.400" : "gray.600"}
            noOfLines={2}
          >
            {(info.getValue() as string) || "-"}
          </Text>
        ),
        header: () => <Text>Description</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "criteriaPos",
        cell: (info) => (
          <Badge colorScheme="gray" variant="outline">
            #{info.getValue() as number}
          </Badge>
        ),
        header: () => <Text>Position</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "values",
        cell: (info) => (
          <Badge colorScheme="teal">
            {(info.getValue() as any[])?.length || 0} values
          </Badge>
        ),
        header: () => <Text>Values</Text>,
        footer: (props) => props.column.id,
      },
      {
        id: "actions",
        header: () => <Text>Actions</Text>,
        cell: (info) => (
          <HStack spacing={1}>
            <IconButton
              aria-label="Detail/Edit"
              icon={<FiEye />}
              size="sm"
              variant="ghost"
              colorScheme="purple"
              onClick={() =>
                router.push(
                  `/master-data/conf-matrix-criteria-apps/criteria/detail?id=${info.row.original.id}`,
                )
              }
            />
            <IconButton
              aria-label="Delete"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                setDeletingCriteriaId(info.row.original.id);
                setIsCriteriaDeleteOpen(true);
              }}
            />
          </HStack>
        ),
        footer: (props) => props.column.id,
      },
    ],
    [pageIndexC, pageSizeC, isDark],
  );

  const criteriaTable = useReactTable({
    data: criteriaData,
    columns: criteriaColumns,
    pageCount: criteriaTotalPages ?? 1,
    state: { pagination: { pageIndex: pageIndexC, pageSize: pageSizeC } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: pageIndexC, pageSize: pageSizeC })
          : updater;
      setPaginationC({ pageIndexC: next.pageIndex, pageSizeC: next.pageSize });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Configuration Matrix Criteria Apps"
        breadCrumb={[
          "Home",
          "Master Data",
          "Configuration Matrix Criteria Apps",
        ]}
      />

      <Box p={4}>
        <Card
          rounded={radiusStyle}
          shadow="lg"
          border="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          bg={isDark ? "gray.800" : "white"}
        >
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Section Header */}
              <HStack spacing={3} align="center">
                <Box
                  w={10}
                  h={10}
                  bg="blue.500"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                >
                  <Icon as={FiGrid} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={isDark ? "white" : "gray.800"}>
                    {tabMode === "CATEGORY"
                      ? "Criteria Scope"
                      : "Criteria Category"}
                  </Heading>
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
                    {tabMode === "CATEGORY"
                      ? "Manage criteria categories"
                      : "Manage criteria and their scale values"}
                  </Text>
                </VStack>
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
                  variant={tabMode === "CRITERIA" ? "solid" : "ghost"}
                  colorScheme={tabMode === "CRITERIA" ? "blue" : "gray"}
                  onClick={() => {
                    setTabMode("CRITERIA");
                    router.replace(
                      "/master-data/conf-matrix-criteria-apps?tab=CRITERIA",
                    );
                  }}
                  leftIcon={<Icon as={FiGrid} />}
                  fontSize="sm"
                  px={4}
                >
                  Criteria Category
                </Button>
                <Button
                  size="sm"
                  variant={tabMode === "CATEGORY" ? "solid" : "ghost"}
                  colorScheme={tabMode === "CATEGORY" ? "blue" : "gray"}
                  onClick={() => {
                    setTabMode("CATEGORY");
                    router.replace(
                      "/master-data/conf-matrix-criteria-apps?tab=CATEGORY",
                    );
                  }}
                  leftIcon={<Icon as={FiLayers} />}
                  fontSize="sm"
                  px={4}
                >
                  Criteria Scope
                </Button>
              </HStack>

              {/* CATEGORY TAB */}
              {tabMode === "CATEGORY" && (
                <Box>
                  <VStack spacing={4} align="stretch">
                    {/* Filters */}
                    <Flex gap={4} wrap="wrap">
                      <InputGroup maxW="300px">
                        <InputLeftElement>
                          <Search2Icon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search category..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            setPagination({ pageIndex: 0, pageSize })
                          }
                          bg={isDark ? "gray.800" : "white"}
                        />
                      </InputGroup>
                      <Button
                        variant="outline"
                        leftIcon={<FiX />}
                        onClick={() => {
                          setCategorySearch("");
                          setPagination({ pageIndex: 0, pageSize });
                        }}
                      >
                        Clear
                      </Button>
                      <Spacer />
                      <Button
                        colorScheme="gray"
                        leftIcon={<FiRefreshCw />}
                        onClick={() => setCategoryRefresh((p) => p + 1)}
                      >
                        Refresh
                      </Button>
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiPlusSquare />}
                        onClick={onInsertOpen}
                      >
                        Add New
                      </Button>
                    </Flex>

                    {/* Results info */}
                    <HStack>
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.600"}
                      >
                        {categoryTotalCount} record(s) found
                      </Text>
                      <Spacer />
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.600"}
                      >
                        Page {pageIndex + 1} of {categoryTotalPages || 1}
                      </Text>
                    </HStack>

                    {/* Table */}
                    <TableComponentFull table={categoryTable} />
                  </VStack>
                </Box>
              )}

              {/* CRITERIA TAB */}
              {tabMode === "CRITERIA" && (
                <Box>
                  <VStack spacing={4} align="stretch">
                    <Flex gap={4} wrap="wrap">
                      <InputGroup maxW="300px">
                        <InputLeftElement>
                          <Search2Icon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search criteria..."
                          value={criteriaSearch}
                          onChange={(e) => setCriteriaSearch(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            setPaginationC({ pageIndexC: 0, pageSizeC })
                          }
                          bg={isDark ? "gray.800" : "white"}
                        />
                      </InputGroup>
                      <Button
                        variant="outline"
                        leftIcon={<FiX />}
                        onClick={() => {
                          setCriteriaSearch("");
                          setPaginationC({ pageIndexC: 0, pageSizeC });
                        }}
                      >
                        Clear
                      </Button>
                      <Spacer />
                      <Button
                        colorScheme="gray"
                        leftIcon={<FiRefreshCw />}
                        onClick={() => setCriteriaRefresh((p) => p + 1)}
                      >
                        Refresh
                      </Button>
                      <Button
                        colorScheme="purple"
                        leftIcon={<FiPlusSquare />}
                        onClick={() =>
                          router.push(
                            "/master-data/conf-matrix-criteria-apps/criteria/new",
                          )
                        }
                      >
                        Add New
                      </Button>
                    </Flex>
                    <HStack>
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.600"}
                      >
                        {criteriaTotalCount} record(s) found
                      </Text>
                      <Spacer />
                      <Text
                        fontSize="sm"
                        color={isDark ? "gray.400" : "gray.600"}
                      >
                        Page {pageIndexC + 1} of {criteriaTotalPages || 1}
                      </Text>
                    </HStack>
                    <TableComponentFull table={criteriaTable} />
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
      {/* Modals */}
      <CriteriaCategoryInsertModal
        isOpen={isInsertOpen}
        onClose={onInsertClose}
        token={tokenData}
        onSuccess={() => setCategoryRefresh((p) => p + 1)}
      />
      <CriteriaCategoryEditModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        token={tokenData}
        data={selectedCategory}
        onSuccess={() => setCategoryRefresh((p) => p + 1)}
      />
      <CriteriaCategoryDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        data={selectedCategory}
      />
      <CriteriaCategoryDeleteConfirm
        isOpen={isDeleteOpen}
        trigger={setIsDeleteOpen}
        token={tokenData}
        deletingId={deletingId}
        onSuccess={() => setCategoryRefresh((p) => p + 1)}
      />
      <ConfirmationDialog
        isOpenTrigger={isCriteriaDeleteOpen}
        trigger={setIsCriteriaDeleteOpen}
        action={async () => {
          const res = await DeleteCriteria(deletingCriteriaId, tokenData);
          if (res?.statusCode === RES_CODE_OK) {
            showToast({
              description: "Criteria deleted",
              statusToast: "success",
            });
            setCriteriaRefresh((p) => p + 1);
          } else
            showToast({
              description: res?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
        }}
        captionMsg="Delete Criteria"
        questionMsg="Are you sure you want to delete this criteria? All related values will also be deleted."
      />
    </LayoutAdmin>
  );
}
