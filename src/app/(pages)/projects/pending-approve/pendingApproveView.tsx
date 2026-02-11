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
} from "@chakra-ui/react";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiCheck, FiSearch, FiX, FiRefreshCw } from "react-icons/fi";

type ProjectViewMode = "PENDING" | "ALL";

export default function PendingApproveView() {
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const { GetWaitingApproval, List } = useProjects();
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

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

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
            {/* Requirement Number */}
            {info.row.original.requirementData && (
              <Flex as={Stack} spacing={0}>
                <Text fontSize="sm" color="gray.500">
                  {info.row.original.requirementData.reqNumber}
                </Text>
              </Flex>
            )}
            {/* Project Name */}
            <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>{info.row.original.projectName}</Text>
            </Flex>
            {/* Perihal/Narrative */}
            {info.row.original.requirementData && (
              <Flex as={Stack} spacing={0}>
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {info.row.original.requirementData.reqNarative || "N/A"}
                </Text>
              </Flex>
            )}
            {/* Hidden - Project Code and Number */}
            {/* <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>{info.row.original.projectCode}</Text>
              <Text>{info.row.original.projectName}</Text>
            </Flex>
            {info.row.original.projectNo && (
              <Flex as={Stack} spacing={0}>
                <Text fontSize="sm" color="gray.500">
                  No: {info.row.original.projectNo}
                </Text>
              </Flex>
            )} */}
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
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Badge
              variant="solid"
              colorScheme={
                info.row.original.projectType === "INTERNAL_DEVELOPMENT"
                  ? "blue"
                  : info.row.original.projectType === "PROCUREMENT"
                    ? "green"
                    : "purple"
              }
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.projectType}
            </Badge>
            {info.row.original.requirementData?.requirementType && (
              <Badge
                variant="solid"
                colorScheme="blue"
                fontSize={"small"}
                rounded={radiusStyle}
                px={4}
              >
                {info.row.original.requirementData.requirementType}
              </Badge>
            )}
            <Badge
              variant="outline"
              colorScheme="gray"
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.projectCategory}
            </Badge>
          </Flex>
        ),
        header: () => <span>Tipe</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.approvalStatus,
        id: "approvalStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Badge
              variant="solid"
              colorScheme="orange"
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.approvalStatus || "PENDING"}
            </Badge>
          </Flex>
        ),
        header: () => <span>Status Approval</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Dibuat :</Text>
              <Text fontWeight={600}>
                {info.row.original.createdAt
                  ? stringToDateFormatedReverse(info.row.original.createdAt)
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
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
                    `/projects/preview?projectId=${info.row.original.id}`
                  );
                }}
              >
                Preview
              </Button>
              {viewMode === "PENDING" && (
                <Button
                  leftIcon={<FiCheck />}
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
                  onClick={() => {
                    router.push(
                      `/projects/preview?projectId=${info.row.original.id}&approvalMode=true`
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
    [pageIndex, pageSize, router, viewMode]
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

            return updatedProject;
          })
        );

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
        <Card>
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
              <Text fontSize="lg" fontWeight="bold">
                {viewMode === "PENDING" ? "Daftar Project Menunggu Persetujuan" : "Daftar Semua Project"}
              </Text>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  colorScheme={viewMode === "PENDING" ? "blue" : "gray"}
                  onClick={() => setViewMode("PENDING")}
                  fontWeight={viewMode === "PENDING" ? "bold" : "normal"}
                >
                  Pending Approval
                </Button>
                <Button
                  colorScheme={viewMode === "ALL" ? "blue" : "gray"}
                  onClick={() => setViewMode("ALL")}
                  fontWeight={viewMode === "ALL" ? "bold" : "normal"}
                >
                  All Projects
                </Button>
              </ButtonGroup>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* Filters - Only show in ALL tab */}
            {viewMode === "ALL" && (
              <VStack spacing={4} align="stretch" mb={6}>
                <Flex gap={4} wrap="wrap">
                  {/* Search Input */}
                  <InputGroup maxW="300px">
                    <InputLeftElement>
                      <Search2Icon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search projects..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </InputGroup>

                  {/* Project Type Filter */}
                  <Select
                    placeholder="All Types"
                    maxW="200px"
                    value={FilterProjectType}
                    onChange={(e) => setFilterProjectType(e.target.value)}
                  >
                    {ProjectTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>

                  {/* Project Status Filter */}
                  <Select
                    placeholder="All Status"
                    maxW="180px"
                    value={FilterProjectStatus}
                    onChange={(e) => setFilterProjectStatus(e.target.value)}
                  >
                    {ProjectStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>

                  {/* Approval Status Filter */}
                  <Select
                    placeholder="All Approval Status"
                    maxW="200px"
                    value={FilterApprovalStatus}
                    onChange={(e) => setFilterApprovalStatus(e.target.value)}
                  >
                    {ApprovalStatusOptions.map((status) => (
                      <option key={status.code} value={status.code}>
                        {status.name}
                      </option>
                    ))}
                  </Select>

                  {/* Action Buttons */}
                  <Button
                    colorScheme="blue"
                    onClick={handleSearch}
                    leftIcon={<FiSearch />}
                    size="sm"
                  >
                    Search
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    leftIcon={<FiX />}
                    size="sm"
                  >
                    Clear
                  </Button>

                  <Spacer />

                  <Button
                    colorScheme="gray"
                    onClick={refreshAction}
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                  >
                    Refresh
                  </Button>
                </Flex>
              </VStack>
            )}

            <TableComponentFull
              table={table}
              isLoading={IsLoadingProcess}
              colorMode={colorMode}
            />
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
