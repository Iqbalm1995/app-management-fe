"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  DELAY_LOW,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useLogActivityUsers, {
  LogActivityUserSummaryResponse,
} from "@/app/services/useLogActivityUsers";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Text,
  useColorMode,
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
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

function AuditTrailPage() {
  useDocumentTitle("Audit Trail");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data State
  const [Data, setData] = useState<LogActivityUserSummaryResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Pagination
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Filters
  const [FilterModule, setFilterModule] = useState<string>("");
  const [FilterStatus, setFilterStatus] = useState<string>("");
  const [ModuleOptions, setModuleOptions] = useState<string[]>([]);

  // Services
  const { GetPagedList, GetModules } = useLogActivityUsers();

  // Column Definitions
  const columnsData = useMemo<ColumnDef<LogActivityUserSummaryResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text>{pageIndex * pageSize + info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "timestampAct",
        cell: (info) => (
          <Text fontSize="sm">
            {new Date(info.getValue() as string).toLocaleString()}
          </Text>
        ),
        header: () => <Text>Timestamp</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "actoinType",
        cell: (info) => (
          <Badge colorScheme="blue" variant="subtle">
            {info.getValue() as string}
          </Badge>
        ),
        header: () => <Text>Action</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "moduleName",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium">
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Module</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "descriptions",
        cell: (info) => (
          <Text fontSize="sm" noOfLines={2}>
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Description</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue() as string;
          const getStatusColor = (status: string) => {
            switch (status) {
              case "SUCCESS":
                return "green";
              case "FAILED":
                return "red";
              case "ERROR":
                return "orange";
              default:
                return "gray";
            }
          };
          return <Badge colorScheme={getStatusColor(status)}>{status}</Badge>;
        },
        header: () => <Text>Status</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "ipAddress",
        cell: (info) => (
          <Text fontSize="sm" fontFamily="mono">
            {(info.getValue() as string) || "N/A"}
          </Text>
        ),
        header: () => <Text>IP Address</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "sourceEnvirontment",
        cell: (info) => (
          <Badge variant="outline">{info.getValue() as string}</Badge>
        ),
        header: () => <Text>Source</Text>,
        footer: (props) => props.column.id,
      },
    ],
    [pageIndex, pageSize]
  );

  // React Table
  const table = useReactTable({
    data: Data,
    columns: columnsData,
    pageCount: totalPages ?? 1,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  // Auth Effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Data Fetching Effect
  useEffect(() => {
    if (DataAuth && tokenData) {
      fetchData();
      loadModules();
    }
  }, [
    DataAuth,
    tokenData,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    FilterModule,
    FilterStatus,
  ]);

  const loadModules = async () => {
    if (!tokenData) return;
    
    try {
      const response = await GetModules(tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setModuleOptions(response.data);
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  };

  const fetchData = async () => {
    if (!DataAuth || !tokenData) return;

    setIsLoadingProcess(true);

    try {
      const filterWhere = [
        { field: "UserIdUim", operator: "=" as const, value: DataAuth.userId },
      ];

      if (FilterModule) {
        filterWhere.push({
          field: "ModuleName",
          operator: "=" as const,
          value: FilterModule,
        });
      }

      if (FilterStatus) {
        filterWhere.push({
          field: "Status",
          operator: "=" as const,
          value: FilterStatus,
        });
      }

      const PayloadList: PaggingListPayload = {
        page: pageIndex,
        limit: pageSize,
        search: globalFilter,
        filterWhere: filterWhere,
        fieldOrder: ["TimestampAct"],
        orderDir: "desc",
      };

      const requestData = await GetPagedList(PayloadList, tokenData);

      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setData(requestData.data);
        setTotalPageData(Math.ceil((requestData.countTotal || 0) / pageSize));
      } else {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      showToast({
        description: "Failed to fetch audit trail data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const refreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  const handleSearch = () => {
    setPagination({ pageIndex: 0, pageSize });
    refreshAction();
  };

  const handleClearFilters = () => {
    setGlobalFilter("");
    setFilterModule("");
    setFilterStatus("");
    setPagination({ pageIndex: 0, pageSize });
    setTimeout(() => refreshAction(), DELAY_LOW);
  };

  const HeaderContentData: HeaderContentProps = {
    titleName: "Audit Trail",
    breadCrumb: ["Dashboard", "Audit Trail"],
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderContentData} />

      <Box p={6}>
        <Card
          shadow="sm"
          rounded={radiusStyle}
          bgColor={colorMode == "light" ? "white" : "gray.800"}
        >
          <CardBody>
            {/* Filters */}
            <VStack spacing={4} align="stretch" mb={6}>
              <Flex gap={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <Search2Icon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search activities..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </InputGroup>

                <Select
                  placeholder="All Modules"
                  maxW="200px"
                  value={FilterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                >
                  {ModuleOptions.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="All Status"
                  maxW="150px"
                  value={FilterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="ERROR">Error</option>
                </Select>

                <Button
                  colorScheme="blue"
                  onClick={handleSearch}
                  leftIcon={<FiSearch />}
                >
                  Search
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  leftIcon={<FiX />}
                >
                  Clear
                </Button>

                <Spacer />

                <Button
                  colorScheme="gray"
                  onClick={refreshAction}
                  leftIcon={<FiRefreshCw />}
                >
                  Refresh
                </Button>
              </Flex>
            </VStack>

            {/* Results Info */}
            <HStack mb={4}>
              <Text fontSize="sm" color="gray.600">
                Showing your personal activity logs
              </Text>
              <Spacer />
              <Text fontSize="sm" color="gray.600">
                Page {pageIndex + 1} of {totalPages}
              </Text>
            </HStack>

            {/* Table */}
            <TableComponentFull table={table} />
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}

export default AuditTrailPage;
