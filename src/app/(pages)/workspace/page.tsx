"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorMode,
  VStack,
  Icon,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTarget,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiZap,
  FiFolder,
  FiX,
  FiMonitor,
  FiClipboard,
  FiGrid,
  FiList,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlusSquare,
  FiArrowRightCircle,
} from "react-icons/fi";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { Search2Icon } from "@chakra-ui/icons";
import { FiRefreshCcw } from "react-icons/fi";

// Components
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentFullHeadlessGrid,
  ControlTable,
} from "@/app/components/tableComponents";

// Services and Hooks
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";

// Constants and Types
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
} from "@/app/constants/applicationConstants";
import {
  PROJECT_STATUSES,
  PRO_STATUS_RUNNING,
} from "@/app/constants/masterStatusConstants";
import { StatusBadge } from "@/app/components/StatusBadge";
import {
  PaggingListPayloadCustom,
  ListSearchByParam,
} from "@/app/types/masterTypes";

// Local Components
import CardProject from "@/app/components/CardProject";
import LayoutAdminWorkspace from "@/app/components/layoutAdminWorkspace";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Workspace Projects",
  breadCrumb: ["Home", "Workspace Projects"],
};

const WorkspaceProject = () => {
  useDocumentTitle("Workspace Projects");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { List } = useProjects();

  // Auth state
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data state
  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Table state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]); // Fixed: array instead of string
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // View mode state

  // Memoized values
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Auth setup effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []); // Empty dependency array - run only once on mount

  // Data fetching effect
  useEffect(() => {
    setIsEditMode(false);
    // if (DataAuth && DataAuth.team) {
    if (DataAuth) {
      // Build filter conditions
      const filterWhere: ListSearchByParam[] = [];

      // Add status filter if selected
      if (statusFilter.length > 0) {
        statusFilter.forEach((status: string) => {
          filterWhere.push({
            field: "projectStatus",
            operator: "=",
            value: status, // Handle each status filter
          });
        });
      }

      filterWhere.push({
        field: "projectType",
        operator: "=",
        value: PROJECT_TYPE_INTERNAL_DEVELOPMENT,
      });

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        // teamId: DataAuth.team.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhere,
        fieldOrder: ["createdAt"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        try {
          const requestData = await List(PayloadList, tokenData);
          const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

          if (isErrorResponse || !requestData) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: ProjectDataResponse[] =
            requestData.data as ProjectDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;

          setDataProjects(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showToast({
            description: "Failed to fetch projects",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
        }
      };

      GetDataList();
    }
  }, [
    DataAuth,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    statusFilter,
    tokenData,
  ]);

  // Table configuration
  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.projectCode,
        id: "projectCode",
        cell: (info) => (
          <CardProject
            data={info.row.original}
            key={info.row.original.projectCode}
            variant="manager"
          />
        ),
        header: () => <span>Projects</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  const table = useReactTable({
    data: DataProjects,
    columns: columnsData,
    pageCount: totalPages ?? 0,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  // Event handlers
  const RefreshAction = useCallback(() => {
    setTotalPageData(0);
    setDataProjects([]);
    setRefreshData(RefreshData + 1);
  }, [RefreshData]);

  // Status filter handler
  const handleStatusFilter = useCallback(
    (status: string) => {
      if (statusFilter.includes(status)) {
        setStatusFilter(statusFilter.filter((s) => s !== status));
      } else {
        setStatusFilter([...statusFilter, status]);
      } // Toggle filter
      setPagination({ pageIndex: 0, pageSize }); // Reset to first page
    },
    [statusFilter, pageSize]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setStatusFilter([]);
    setPagination({ pageIndex: 0, pageSize });
  }, [pageSize]);

  const ModalForm = useDisclosure();

  const handleAddNew = () => {
    if (DataAuth && DataAuth.team) {
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Enhanced Main Content - Grid Layout with Sidebar */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <Grid
          templateColumns="repeat(12, 1fr)"
          // gap={{ base: 4, lg: 6 }}
          w="full"
          gap={5}
        >
          {/* Enhanced Manager Sidebar */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w={"full"}>
            Side bar
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w={"full"}>
            {/* Main Content Area */}
            <VStack spacing={{ base: 4, md: 6 }} w="full">
              
              List Project
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

WorkspaceProject.displayName = "WorkspaceProject";

export default WorkspaceProject;
