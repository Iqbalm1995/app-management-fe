"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements from "@/app/services/useRequirements";
import useSysModuleGroup from "@/app/services/useSysModuleGroup";
import {
  ColumnMetaCustom,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Stack,
  Text,
  useColorMode,
  VStack,
  Spinner,
  Heading,
  Icon,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiCheck, FiSearch, FiX, FiRefreshCw, FiClipboard, FiFileText, FiFilter, FiFolder } from "react-icons/fi";

type ProjectViewMode = "PENDING" | "ALL";

// Helper functions
const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    "INTERNAL_DEVELOPMENT": "Internal Dev",
    "PROCUREMENT": "Procurement",
    "DEPLOYMENT": "Deployment"
  };
  return labels[type] || type;
};

const getProjectStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "RUNNING": "blue",
    "COMPLETED": "green",
    "ON HOLD": "yellow",
    "CANCELED": "red",
    "CLOSED": "gray",
    "INITIATING": "purple",
    "TEMPORARY CLOSED": "orange"
  };
  return colors[status] || "gray";
};

const getApprovalStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "PENDING": "orange",
    "APPROVED": "green",
    "REJECTED": "red",
    "REVISION": "yellow"
  };
  return colors[status] || "gray";
};

export default function PendingApproveView() {
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const { GetWaitingApproval, List, CanApproveProject } = useProjects();
  const { GetDetailById: GetRequirementDetail } = useRequirements();
  const { GetDetailByCode, GetStatusFlows } = useSysModuleGroup();

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ProjectViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("projectsViewMode");
      return saved === "ALL" ? "ALL" : "PENDING";
    }
    return "PENDING";
  });

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("projectsViewMode", viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Load approval statuses dynamically
  useEffect(() => {
    const loadApprovalStatuses = async () => {
      if (!tokenData) return;

      try {
        const moduleResponse = await GetDetailByCode("sys_projects", tokenData);
        if (moduleResponse?.statusCode === RES_CODE_OK && moduleResponse.data) {
          const flowsResponse = await GetStatusFlows(
            moduleResponse.data.id,
            tokenData
          );

          if (flowsResponse?.statusCode === RES_CODE_OK && flowsResponse.data) {
            const options = flowsResponse.data.map((flow: any) => ({
              code: flow.codeStatus,
              name: flow.nameStatus,
            }));

            setApprovalStatusOptions(options);
          }
        }
      } catch (error) {
        console.error("Error loading approval statuses:", error);
      }
    };

    loadApprovalStatuses();
  }, [tokenData]);

  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter states
  const [FilterProjectType, setFilterProjectType] = useState<string>("");
  const [FilterProjectStatus, setFilterProjectStatus] = useState<string>("");
  const [FilterApprovalStatus, setFilterApprovalStatus] = useState<string>("");

  // Filter options
  const ProjectTypeOptions = [
    "INTERNAL DEVELOPMENT",
    "PROCUREMENT",
    "DEPLOYMENT",
  ];

  const ProjectStatusOptions = [
    "INITIATING",
    "RUNNING",
    "TEMPORARY CLOSED",
    "CLOSED",
    "ON HOLD",
    "CANCELED",
    "COMPLETED",
  ];

  const [ApprovalStatusOptions, setApprovalStatusOptions] = useState<
    { code: string; name: string }[]
  >([]);
  const [canApproveProjects, setCanApproveProjects] = useState<Set<string>>(new Set());

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const checkApprovalPermissions = async (projects: ProjectDataResponse[]) => {
    if (!tokenData) return;

    const approvalChecks = projects.map(async (project) => {
      const response = await CanApproveProject(project.id, tokenData);
      return {
        projectId: project.id,
        canApprove: response?.statusCode === RES_CODE_OK && response.data
      };
    });

    const results = await Promise.all(approvalChecks);
    const approveableProjects = new Set(
      results.filter(r => r.canApprove).map(r => r.projectId)
    );

    setCanApproveProjects(approveableProjects);
  };

  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
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
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectName,
        id: "projectName",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            {/* Requirement Number - Prominent */}
            {info.row.original.requirementData?.reqNumber && (
              <HStack spacing={2}>
                <Icon as={FiFileText} boxSize={3} color="purple.500" />
                <Text fontSize="sm" fontWeight={600} color="purple.600">
                  {info.row.original.requirementData.reqNumber}
                </Text>
              </HStack>
            )}

            {/* Project Name */}
            <Text fontWeight={600} fontSize="md">
              {info.row.original.projectName}
            </Text>

            {/* Project Number */}
            {info.row.original.projectNo && (
              <Text fontSize="xs" color="gray.500">
                No. Pro: {info.row.original.projectNo}
              </Text>
            )}

            {/* Narrative */}
            {info.row.original.requirementData?.reqNarative && (
              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                {info.row.original.requirementData.reqNarative}
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Nama Project</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Project",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectType,
        id: "projectType",
        cell: (info) => (
          <VStack align="start" spacing={1} w="full">
            {/* Project Type */}
            <Badge
              fontSize="1em"
              px={2}
              py={1}
              rounded="md"
              colorScheme={
                info.row.original.projectType === "INTERNAL_DEVELOPMENT"
                  ? "blue"
                  : info.row.original.projectType === "PROCUREMENT"
                    ? "green"
                    : "purple"
              }
            >
              {getProjectTypeLabel(info.row.original.projectType)}
            </Badge>

            {/* Category */}
            <Tooltip
              label={info.row.original.projectCategory}
              isDisabled={info.row.original.projectCategory.length <= 20}
              hasArrow
              placement="top"
            >
              <Badge
                fontSize="1em"
                px={2}
                py={1}
                rounded="md"
                variant="outline"
                colorScheme="gray"
              >
                {info.row.original.projectCategory.length > 20
                  ? `${info.row.original.projectCategory.substring(0, 20)}...`
                  : info.row.original.projectCategory}
              </Badge>
            </Tooltip>
          </VStack>
        ),
        header: () => <span>Tipe Project</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.requirementData?.requirementType,
        id: "requirementType",
        cell: (info) => (
          <VStack align="start" spacing={1} w="full">
            {/* Requirement Type */}
            {info.row.original.requirementData?.requirementType ? (
              <Badge
                fontSize="1em"
                px={2}
                py={1}
                rounded="md"
                colorScheme="purple"
              >
                {info.row.original.requirementData.requirementType}
              </Badge>
            ) : (
              <Text fontSize="xs" color="gray.500">
                -
              </Text>
            )}
          </VStack>
        ),
        header: () => <span>Tipe Requirement</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.appsProject?.appName,
        id: "appInfo",
        cell: (info) => {
          const app = info.row.original.appsProject;
          const acquisition = info.row.original.projectAcquisitionName;
          const characteristic = info.row.original.projectCharasteristicName;
          const subChar = info.row.original.projectSubCharasteristicName;

          // Build tooltip content
          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              {app && (
                <>
                  <Text fontWeight="600">{app.appShortName}</Text>
                  <Text>{app.appName}</Text>
                </>
              )}
              {acquisition && <Text>Akuisisi: {acquisition}</Text>}
              {characteristic && <Text>Karakteristik: {characteristic}</Text>}
              {subChar && <Text>Sub-Karakteristik: {subChar}</Text>}
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <HStack spacing={2} w="full">
                {app && (
                  <>
                    <Box
                      w={6}
                      h={6}
                      bg="blue.500"
                      rounded="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      {app.appShortName?.substring(0, 2)}
                    </Box>
                    <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                      {app.appShortName}
                    </Text>
                  </>
                )}
              </HStack>
            </Tooltip>
          );
        },
        header: () => <span>Aplikasi</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.proOwnerDivisionName,
        id: "organization",
        cell: (info) => {
          const ownerDiv = info.row.original.proOwnerDivisionName;
          const ownerGrp = info.row.original.proOwnerGroupName;
          const manageDiv = info.row.original.proManageByDivisionName;
          const manageGrp = info.row.original.proManageByGroupName;

          // Build tooltip content
          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              {ownerDiv && <Text>Owner Div: {ownerDiv}</Text>}
              {ownerGrp && <Text>Owner Grp: {ownerGrp}</Text>}
              {manageDiv && <Text>Manage Div: {manageDiv}</Text>}
              {manageGrp && <Text>Manage Grp: {manageGrp}</Text>}
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <VStack align="start" spacing={0} w="full">
                {ownerDiv && (
                  <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                    {ownerDiv}
                  </Text>
                )}
                {manageDiv && (
                  <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                    Managed: {manageDiv}
                  </Text>
                )}
              </VStack>
            </Tooltip>
          );
        },
        header: () => <span>Organisasi</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectStatus,
        id: "status",
        cell: (info) => (
          <VStack align="start" spacing={2} w="full">
            {/* Project Status */}
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="600" color="gray.600">
                Status Project:
              </Text>
              <Badge
                fontSize="1em"
                px={2}
                py={1}
                rounded="md"
                colorScheme={getProjectStatusColor(
                  info.row.original.projectStatus,
                )}
              >
                {info.row.original.projectStatus}
              </Badge>
            </VStack>

            {/* Approval Status */}
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="600" color="gray.600">
                Status Approval:
              </Text>
              <Badge
                fontSize="1em"
                px={2}
                py={1}
                rounded="md"
                colorScheme={getApprovalStatusColor(
                  info.row.original.approvalStatus || "PENDING",
                )}
              >
                {info.row.original.approvalStatus || "PENDING"}
              </Badge>
            </VStack>
          </VStack>
        ),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "additionalInfo",
        cell: (info) => {
          // Find creator in userAssignment
          const creatorData = info.row.original.userAssignment?.find(
            (assignment) => assignment.userId === info.row.original.createdBy,
          );

          return (
            <VStack align="start" spacing={1} fontSize="xs" w="full">
              {/* Register Date */}
              {info.row.original.projectRegisterDate && (
                <HStack spacing={1}>
                  <Text fontWeight="600" color="gray.600">
                    Tgl. Registrasi:
                  </Text>
                  <Text>
                    {stringToDateFormatedReverse(
                      info.row.original.projectRegisterDate,
                    )}
                  </Text>
                </HStack>
              )}

              {/* Created Date */}
              <HStack spacing={1}>
                <Text fontWeight="600" color="gray.600">
                  Tgl. Pengajuan:
                </Text>
                <Text>
                  {info.row.original.createdAt
                    ? stringToDateFormatedReverse(info.row.original.createdAt)
                    : "-"}
                </Text>
              </HStack>

              {/* Created By */}
              {creatorData?.userData ? (
                <VStack align="start" spacing={0}>
                  <HStack spacing={1}>
                    <Text fontWeight="600" color="gray.600">
                      Oleh:
                    </Text>
                    <Text fontWeight="600">{creatorData.userData.nama}</Text>
                  </HStack>
                  {creatorData.userData.jabatan && (
                    <Text fontSize="2xs" color="gray.500" pl={10} noOfLines={1}>
                      {creatorData.userData.jabatan}
                    </Text>
                  )}
                </VStack>
              ) : (
                <HStack spacing={1}>
                  <Text fontWeight="600" color="gray.600">
                    Oleh:
                  </Text>
                  <Text>{info.row.original.createdBy}</Text>
                </HStack>
              )}
            </VStack>
          );
        },
        header: () => <span>Info Tambahan</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "action",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <VStack spacing={1} w="full">
              <Button
                size="xs"
                py={4}
                fontSize="sm"
                w="full"
                bg="purple.50"
                color="purple.700"
                _hover={{
                  bg: "purple.300",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
                colorScheme="blue"
                leftIcon={<FiEye />}
                onClick={() => {
                  router.push(
                    `/projects/preview?projectId=${info.row.original.id}`,
                  );
                }}
              >
                Preview
              </Button>
              {viewMode === "PENDING" &&
                canApproveProjects.has(info.row.original.id) && (
                  <Button
                    bg="green.50"
                    color="green.700"
                    size="xs"
                    py={4}
                    fontSize="sm"
                    w="full"
                    _hover={{
                      bg: "green.300",
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    leftIcon={<FiCheck />}
                    onClick={() => {
                      router.push(
                        `/projects/preview?projectId=${info.row.original.id}&approvalMode=true`,
                      );
                    }}
                  >
                    Approve
                  </Button>
                )}
            </VStack>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Aksi</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [pageIndex, pageSize, router, viewMode, canApproveProjects],
  );

  const table = useReactTable({
    data: DataProjects,
    columns: columnsData,
    pageCount: totalPages,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
  });

  const GetDataList = async () => {
    setIsLoadingProcess(true);

    const filterWhere: any[] = [];

    // Add filters only for ALL tab
    if (viewMode === "ALL") {
      if (FilterProjectType) {
        filterWhere.push({
          field: "ProjectType",
          operator: "=" as const,
          value: FilterProjectType,
        });
      }

      if (FilterProjectStatus) {
        filterWhere.push({
          field: "ProjectStatus",
          operator: "=" as const,
          value: FilterProjectStatus,
        });
      }

      if (FilterApprovalStatus) {
        filterWhere.push({
          field: "ApprovalStatus",
          operator: "=" as const,
          value: FilterApprovalStatus,
        });
      }
    }

    const PayloadList: PaggingListPayloadCustom = {
      search: globalFilter,
      limit: pageSize,
      page: pageIndex,
      projectType: "",
      requirementType: "",
      filterWhere: filterWhere,
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    let response;

    if (viewMode === "PENDING") {
      // Use waiting-approval endpoint
      response = await GetWaitingApproval(PayloadList, tokenData);
    } else {
      // Use list endpoint for all projects
      response = await List(PayloadList, tokenData);
    }

    if (response) {
      if (response.statusCode === RES_CODE_OK) {
        let dataList: ProjectDataResponse[] =
          response.data as ProjectDataResponse[];

        // Fetch requirement data and work programs for projects (only if not already populated)
        dataList = await Promise.all(
          dataList.map(async (project) => {
            let updatedProject = { ...project };

            // Fetch requirement data for projects with reqParentId but no requirementData
            if (project.reqParentId && !project.requirementData) {
              const reqResponse = await GetRequirementDetail(project.reqParentId, tokenData);
              if (reqResponse?.statusCode === RES_CODE_OK && reqResponse.data) {
                updatedProject.requirementData = {
                  id: reqResponse.data.id,
                  reqNumber: reqResponse.data.reqNumber,
                  requirementType: reqResponse.data.requirementType,
                  reqStatus: reqResponse.data.reqStatus || null,
                  reqNarative: reqResponse.data.reqNarative,
                };
                // Also get work programs from requirement
                if (reqResponse.data.workPrograms) {
                  updatedProject.workPrograms = reqResponse.data.workPrograms;
                }
              }
            }

            // If requirementData exists but reqNarative is missing, fetch it
            if (project.reqParentId && updatedProject.requirementData && !updatedProject.requirementData.reqNarative) {
              const reqResponse = await GetRequirementDetail(project.reqParentId, tokenData);
              if (reqResponse?.statusCode === RES_CODE_OK && reqResponse.data) {
                updatedProject.requirementData.reqNarative = reqResponse.data.reqNarative;
              }
            }

            return updatedProject;
          })
        );

        // Check approval permissions for pending projects
        if (viewMode === "PENDING") {
          checkApprovalPermissions(dataList);
        }

        setDataProjects(dataList);

        const totalData = response.countTotal || 0;
        const totalPage = Math.ceil(totalData / pageSize);
        setTotalPageData(totalPage);
      } else {
        showToast({
          description: response.message || "Failed to load data",
          statusToast: "error",
        });
      }
    }

    setIsLoadingProcess(false);
  };

  const handleSearch = () => {
    setPagination({ pageIndex: 0, pageSize });
    setRefreshData((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setGlobalFilter("");
    setFilterProjectType("");
    setFilterProjectStatus("");
    setFilterApprovalStatus("");
    setPagination({ pageIndex: 0, pageSize });
    setTimeout(() => setRefreshData((prev) => prev + 1), 100);
  };

  const refreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  useEffect(() => {
    if (tokenData) {
      GetDataList();
    }
  }, [
    tokenData,
    pageIndex,
    pageSize,
    globalFilter,
    RefreshData,
    viewMode,
    FilterProjectType,
    FilterProjectStatus,
    FilterApprovalStatus,
  ]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={viewMode === "PENDING" ? "Project Menunggu Persetujuan" : "Daftar Project"}
        breadCrumb={["Home", "Projects", viewMode === "PENDING" ? "Pending Approval" : "List"]}
      />

      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
          <CardBody p={6}>
            {/* Section Header */}
            <VStack spacing={6} align="stretch">
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
                  <Icon as={FiClipboard} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                    {viewMode === "PENDING" ? "Pending Approval Projects" : "All Projects"}
                  </Heading>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    {DataProjects.length} projects found
                    {viewMode === "PENDING" && " waiting for approval"}
                  </Text>
                </VStack>
              </HStack>

              {/* View Mode Toggle */}
              <HStack spacing={1} bg={colorMode === "light" ? "gray.100" : "gray.700"} rounded="lg" p={1} w="fit-content">
                <Button
                  size="sm"
                  variant={viewMode === "PENDING" ? "solid" : "ghost"}
                  colorScheme={viewMode === "PENDING" ? "blue" : "gray"}
                  onClick={() => setViewMode("PENDING")}
                  fontSize="sm"
                  px={4}
                >
                  Pending Approval
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "ALL" ? "solid" : "ghost"}
                  colorScheme={viewMode === "ALL" ? "blue" : "gray"}
                  onClick={() => setViewMode("ALL")}
                  fontSize="sm"
                  px={4}
                >
                  All Projects
                </Button>
              </HStack>

              {/* Filters */}
              <VStack spacing={4} align="stretch">
                <Flex gap={4} wrap="wrap">
                  {/* Search Input */}
                  <InputGroup maxW="300px">
                    <InputLeftElement>
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search projects..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      isDisabled={IsLoadingProcess}
                    />
                  </InputGroup>

                  {/* Filters - Only show for ALL view */}
                  {viewMode === "ALL" && (
                    <>
                      <Select
                        placeholder="All Project Types"
                        maxW="200px"
                        value={FilterProjectType}
                        onChange={(e) => setFilterProjectType(e.target.value)}
                        isDisabled={IsLoadingProcess}
                      >
                        {ProjectTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {getProjectTypeLabel(type)}
                          </option>
                        ))}
                      </Select>

                      <Select
                        placeholder="All Project Status"
                        maxW="200px"
                        value={FilterProjectStatus}
                        onChange={(e) => setFilterProjectStatus(e.target.value)}
                        isDisabled={IsLoadingProcess}
                      >
                        {ProjectStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>

                      <Select
                        placeholder="All Approval Status"
                        maxW="200px"
                        value={FilterApprovalStatus}
                        onChange={(e) => setFilterApprovalStatus(e.target.value)}
                        isDisabled={IsLoadingProcess}
                      >
                        {ApprovalStatusOptions.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.name}
                          </option>
                        ))}
                      </Select>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Button
                    colorScheme="blue"
                    onClick={handleSearch}
                    leftIcon={<FiSearch />}
                    size="sm"
                    isLoading={IsLoadingProcess}
                  >
                    Search
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    leftIcon={<FiX />}
                    size="sm"
                    isDisabled={IsLoadingProcess}
                  >
                    Clear
                  </Button>

                  <Spacer />

                  <Button
                    colorScheme="gray"
                    onClick={refreshAction}
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    isLoading={IsLoadingProcess}
                  >
                    Refresh
                  </Button>
                </Flex>

                {/* Active Filters Display */}
                {(globalFilter || FilterProjectType || FilterProjectStatus || FilterApprovalStatus) && (
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" color="gray.600">Active filters:</Text>
                    {globalFilter && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        Search: "{globalFilter}"
                      </Badge>
                    )}
                    {FilterProjectType && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        Type: {getProjectTypeLabel(FilterProjectType)}
                      </Badge>
                    )}
                    {FilterProjectStatus && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        Status: {FilterProjectStatus}
                      </Badge>
                    )}
                    {FilterApprovalStatus && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        Approval: {ApprovalStatusOptions.find(o => o.code === FilterApprovalStatus)?.name}
                      </Badge>
                    )}
                  </HStack>
                )}
              </VStack>

              <Divider />

              {/* Table with Loading States */}
              {IsLoadingProcess && DataProjects.length === 0 ? (
                <VStack spacing={6} py={16}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="medium" color={colorMode === "light" ? "gray.800" : "white"}>
                      Loading Projects
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Please wait while we fetch {viewMode === "PENDING" ? "pending approval" : "all"} projects...
                    </Text>
                  </VStack>
                </VStack>
              ) : DataProjects.length === 0 ? (
                <VStack spacing={8} py={20} textAlign="center">
                  <Box
                    w={24}
                    h={24}
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiFolder} boxSize={12} color={colorMode === "light" ? "gray.400" : "gray.500"} />
                  </Box>
                  <VStack spacing={3}>
                    <Heading size="lg" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                      {viewMode === "PENDING" ? "No Pending Approvals" : "No Projects Found"}
                    </Heading>
                    <Text color="gray.500" maxW="500px">
                      {viewMode === "PENDING"
                        ? "You don't have any projects waiting for approval."
                        : globalFilter || FilterProjectType || FilterProjectStatus || FilterApprovalStatus
                          ? "No projects match your current filters. Try adjusting your filters or clearing them."
                          : "No projects available."}
                    </Text>
                  </VStack>
                  {(globalFilter || FilterProjectType || FilterProjectStatus || FilterApprovalStatus) && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </VStack>
              ) : (
                <Box position="relative">
                  <TableComponentFull table={table} colorMode={colorMode} />
                  {IsLoadingProcess && DataProjects.length > 0 && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg={colorMode === "light" ? "whiteAlpha.800" : "blackAlpha.800"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={10}
                      rounded={radiusStyle}
                    >
                      <VStack spacing={3}>
                        <Spinner size="lg" color="blue.500" thickness="3px" />
                        <Text fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.800" : "white"}>
                          {globalFilter ? "Searching..." : "Loading..."}
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
