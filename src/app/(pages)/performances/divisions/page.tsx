"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ORG_CATEGORY_KEY_GROUP,
  DIVISION_ID_IT_BJB,
} from "@/app/constants/applicationConstants";
import { StatusBadge } from "@/app/components/StatusBadge";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  getCurrentQuarter,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  UserEvaluationReportListResponse,
} from "@/app/services/useReports";
import { PROJECT_STATUS_OPTIONS } from "@/app/constants/masterStatusConstants";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParamProps,
  PaggingListPayloadCustom,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiCamera, FiEdit3, FiDownload } from "react-icons/fi";
import EvaluationAdjustModal from "./components/EvaluationAdjustModal";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Division Performance Report",
  breadCrumb: ["Home", "Performances", "Divisions"],
};

function DivisionPerformancePage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const {
    ListUserEvaluationReport,
    CreateUserEvaluationSnapshot,
    ExportUserEvaluationReportExcel,
    isLoading: reportsLoading,
  } = useReports();
  const { List: ListOrganization } = useOrganization();
  const { List: ListTeams } = useTeams();

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

  // Load organization groups
  useEffect(() => {
    const loadGroups = async () => {
      if (!tokenData) return;

      try {
        const response = await ListOrganization(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [
              {
                field: "orgType",
                operator: "=",
                value: ORG_CATEGORY_KEY_GROUP,
              },
              {
                field: "parentId",
                operator: "=",
                value: DIVISION_ID_IT_BJB,
              },
            ],
            fieldOrder: ["orgName"],
            orderDir: "asc",
          } as PaggingListPayload,
          tokenData,
        );
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setGroupOptions(response.data);
        }
      } catch (error) {
        console.error("Failed to load groups:", error);
      }
    };

    loadGroups();
  }, [tokenData]);

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      if (!tokenData) return;

      try {
        const response = await ListTeams(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [],
            fieldOrder: ["teamName"],
            orderDir: "asc",
          } as PaggingListPayload,
          tokenData,
        );
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setTeamOptions(response.data);
        }
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    };

    loadTeams();
  }, [tokenData]);

  const [DataReport, setDataReport] = useState<
    UserEvaluationReportListResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [FilterProjectStatus, setFilterProjectStatus] = useState<string>("");
  const [FilterManageGroup, setFilterManageGroup] = useState<string>("");
  const [FilterTeamCode, setFilterTeamCode] = useState<string>("");
  const [GroupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [TeamOptions, setTeamOptions] = useState<TeamsResponse[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>("nama");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  // Quarterly filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] =
    useState<number>(currentQuarter);

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  // Modal state
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserEvaluationReportListResponse | null>(null);

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    setParamFilter(newFilters);
  };

  const RefreshAction = () => {
    setDataReport([]);
    setRefreshData(RefreshData + 1);
  };

  const handleOpenEvaluationModal = (
    user: UserEvaluationReportListResponse,
  ) => {
    setSelectedUser(user);
    setIsEvaluationModalOpen(true);
  };

  const handleCloseEvaluationModal = () => {
    setIsEvaluationModalOpen(false);
    setSelectedUser(null);
  };

  const handleEvaluationSuccess = () => {
    RefreshAction();
  };

  const CreateSnapshot = async () => {
    if (!DataAuth || !tokenData) return;

    try {
      const response = await CreateUserEvaluationSnapshot(tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Snapshot created successfully",
          statusToast: "success",
        });
        RefreshAction();
      } else {
        showToast({
          description: response?.message || "Failed to create snapshot",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Snapshot error:", error);
      showToast({
        description: "Error creating snapshot",
        statusToast: "error",
      });
    }
  };

  const handleExportToExcel = async () => {
    if (!DataReport || DataReport.length === 0) {
      showToast({
        description: "No data available to export",
        statusToast: "warning",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Get current filtered data from table
      const filteredData = table.getFilteredRowModel().rows.map(row => row.original);
      
      const blob = await ExportUserEvaluationReportExcel(filteredData);
      
      if (blob) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        // Generate filename with current date and filters
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `User_Evaluation_Report_${selectedYear}_Q${selectedQuarter}_${currentDate}.xlsx`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast({
          description: "Excel file exported successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: "No data to export",
          statusToast: "warning",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        description: "Failed to export Excel file",
        statusToast: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Filter teams based on selected group
  const filteredTeams = useMemo(() => {
    if (!FilterManageGroup) return TeamOptions;
    return TeamOptions.filter(
      (team) => team.orgGroupCode === FilterManageGroup,
    );
  }, [TeamOptions, FilterManageGroup]);

  // Quarterly filter effect
  useEffect(() => {
    const yearFilter: ListSearchByParamProps = {
      field: "yearPeriod",
      operator: "=",
      value: selectedYear.toString(),
      filterLabel: "Year Filter",
    };

    const quarterFilter: ListSearchByParamProps = {
      field: "quartalPeriod",
      operator: "=",
      value: selectedQuarter.toString(),
      filterLabel: "Quarter Filter",
    };

    // Remove existing period filters and add new ones
    let updatedFilters = ParamFilter.filter(
      (f) => f.field !== "yearPeriod" && f.field !== "quartalPeriod",
    );

    updatedFilters = addParamFilterUpdate(updatedFilters, yearFilter);
    updatedFilters = addParamFilterUpdate(updatedFilters, quarterFilter);

    setParamFilter(updatedFilters);
  }, [selectedYear, selectedQuarter]);

  const columnsData = useMemo<ColumnDef<UserEvaluationReportListResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text fontSize="sm">{info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.nama,
        id: "userInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="200px"
          >
            <Text fontWeight={600} fontSize="sm">
              {info.row.original.nama}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {info.row.original.nip}
            </Text>
            <Text fontSize="xs" color="blue.500">
              {info.row.original.jabatan || "-"}
            </Text>
            <Text fontSize="xs">{info.row.original.namaUnitKerja || "-"}</Text>
          </Flex>
        ),
        header: () => <span>User Information</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "nama",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "User Name",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.userOrgGroupName,
        id: "organization",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
            minW="180px"
          >
            <Flex fontSize={"xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>Group:</Text>
              <Text>{info.row.original.userOrgGroupName || "-"}</Text>
            </Flex>
            <Flex fontSize={"xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>Team:</Text>
              <Text>{info.row.original.userTeamName || "-"}</Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Organization</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectNo,
        id: "projectInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="250px"
          >
            <Text fontWeight={600} fontSize="sm">
              {info.row.original.projectNo}
            </Text>
            <Text fontSize="sm">{info.row.original.projectName || "-"}</Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.projectType}
            </Text>
            {info.row.original.requirementType ? (
              <Flex as={HStack} spacing={2}>
                <Badge colorScheme="secondary" variant={"solid"}>
                  {info.row.original.requirementType}{" "}
                </Badge>
                <Text fontSize="xs" color="blue.500" gap={2}>
                  {"No. " + info.row.original.reqNumber || "-"}
                </Text>
              </Flex>
            ) : (
              <Text fontSize="xs" color="gray.500">
                No Requirement
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Project Information</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Project Name",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectStatus,
        id: "projectStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="160px"
          >
            <StatusBadge
              status={info.row.original.projectStatus}
              variant="solid"
              rounded={radiusStyle}
              px={3}
              py={1}
            />
            <Text fontSize="xs">
              Progress: {info.row.original.projectStatusPercentage}%
            </Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.proSdlcStageNameActive || "-"}
            </Text>
          </Flex>
        ),
        header: () => <span>Project Status</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.userTotalTaskAssign,
        id: "taskInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
            minW="120px"
          >
            <Text fontSize="xs">
              Assigned: {info.row.original.userTotalTaskAssign}
            </Text>
            <Text fontSize="xs">
              Done: {info.row.original.userTotalTaskDone}
            </Text>
          </Flex>
        ),
        header: () => <span>Tasks</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evBasicPoint,
        id: "basicPoint",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium" textAlign="center">
            {info.row.original.evBasicPoint}
          </Text>
        ),
        header: () => <span>Basic Point</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evTimelessPoint,
        id: "timelessPoint",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium" textAlign="center">
            {info.row.original.evTimelessPoint}
          </Text>
        ),
        header: () => <span>Timeless Point</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evExtraPoint,
        id: "extraPoint",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium" textAlign="center">
            {info.row.original.evExtraPoint}
          </Text>
        ),
        header: () => <span>Extra Point</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evTotalPoint,
        id: "totalPoint",
        cell: (info) => (
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="blue.600"
            textAlign="center"
          >
            {info.row.original.evTotalPoint}
          </Text>
        ),
        header: () => <span>Total Point</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evGrandTotal,
        id: "grandTotal",
        cell: (info) => (
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="green.600"
            textAlign="center"
          >
            {info.row.original.evGrandTotal}
          </Text>
        ),
        header: () => <span>Grand Total</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        id: "actions",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="center">
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<FiEdit3 />}
              onClick={() => handleOpenEvaluationModal(info.row.original)}
            >
              Adjust Points
            </Button>
          </Flex>
        ),
        header: () => <span>Actions</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [colorMode],
  );

  useEffect(() => {
    if (DataAuth && tokenData) {
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: 10000, // Large number to get all records
        page: 0,
        filterWhere: ParamFilter,
        fieldOrder: [sortField],
        orderDir: sortOrder as "asc" | "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListUserEvaluationReport(
          PayloadList,
          tokenData,
        );
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: UserEvaluationReportListResponse[] =
            requestData.data as UserEvaluationReportListResponse[];
          setDataReport(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [
    DataAuth,
    RefreshData,
    globalFilter,
    ParamFilter,
    tokenData,
    sortField,
    sortOrder,
  ]);

  const table = useReactTable({
    data: DataReport,
    columns: columnsData,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Filter Card */}
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} mb={4}>
        <GridItem colSpan={12} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center" w="full">
                <Heading as="h6" size="sm">
                  Filter Options
                </Heading>
                <Button
                  size={"sm"}
                  colorScheme="blue"
                  onClick={CreateSnapshot}
                  isLoading={reportsLoading}
                  leftIcon={<FiCamera />}
                >
                  Create Snapshot
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
                <GridItem colSpan={{ base: 12, lg: 8 }}>
                  <Flex alignItems={"center"} gap={4} wrap="wrap">
                    <Text fontWeight={600} minW="fit-content">
                      Period:
                    </Text>
                    <Select
                      value={selectedYear}
                      size={"md"}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      w="100px"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={selectedQuarter}
                      size={"md"}
                      onChange={(e) =>
                        setSelectedQuarter(Number(e.target.value))
                      }
                      w="80px"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      <option value="1">Q1</option>
                      <option value="2">Q2</option>
                      <option value="3">Q3</option>
                      <option value="4">Q4</option>
                    </Select>
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 4 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Search:
                    </Text>
                    <Input
                      placeholder="Search users..."
                      value={globalFilter ?? ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    />
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 3 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Status:
                    </Text>
                    <Select
                      placeholder="All Status"
                      value={FilterProjectStatus}
                      onChange={(e) => {
                        setFilterProjectStatus(e.target.value);
                        const newFilters = addParamFilterUpdate(ParamFilter, {
                          field: "projectStatus",
                          value: e.target.value,
                          operator: "=",
                          filterLabel: "Project Status",
                        });
                        handleFilterChange(newFilters);
                      }}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      {PROJECT_STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 3 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Group:
                    </Text>
                    <Select
                      placeholder="All Groups"
                      value={FilterManageGroup}
                      onChange={(e) => {
                        setFilterManageGroup(e.target.value);
                        setFilterTeamCode("");

                        let newFilters = ParamFilter.filter(
                          (f) => f.field !== "userOrgGroupCode",
                        );
                        if (e.target.value) {
                          newFilters = addParamFilterUpdate(newFilters, {
                            field: "userOrgGroupCode",
                            value: e.target.value,
                            operator: "=",
                            filterLabel: "User Group",
                          });
                        }
                        handleFilterChange(newFilters);
                      }}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      {GroupOptions.map((group) => (
                        <option key={group.id} value={group.orgCode}>
                          {group.orgName}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 3 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Team:
                    </Text>
                    <Select
                      placeholder="All Teams"
                      value={FilterTeamCode}
                      onChange={(e) => {
                        setFilterTeamCode(e.target.value);

                        let newFilters = ParamFilter.filter(
                          (f) => f.field !== "userTeamCode",
                        );
                        if (e.target.value) {
                          newFilters = addParamFilterUpdate(newFilters, {
                            field: "userTeamCode",
                            value: e.target.value,
                            operator: "=",
                            filterLabel: "User Team",
                          });
                        }
                        handleFilterChange(newFilters);
                      }}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                      isDisabled={!FilterManageGroup}
                    >
                      {filteredTeams.map((team) => (
                        <option key={team.id} value={team.teamCode}>
                          {team.teamName}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Data Table */}
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={12} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center" w="full">
                <Heading as="h5" size="md">
                  Division Performance Data
                </Heading>
                <HStack spacing={2}>
                  <Button
                    size={"md"}
                    leftIcon={<FiDownload />}
                    onClick={handleExportToExcel}
                    isLoading={isExporting}
                    isDisabled={isExporting || DataReport.length === 0}
                    loadingText="Exporting..."
                    variant="outline"
                    colorScheme="green"
                  >
                    Export Excel
                  </Button>
                  <Button
                    size={"md"}
                    leftIcon={<FiRefreshCcw />}
                    onClick={() => RefreshAction()}
                  >
                    Refresh
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {IsLoadingProcess ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={20}
                  >
                    <LoadingMiniSignature />
                    <Text mt={4} fontSize="sm" color="gray.500">
                      Loading performance data...
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Please wait while we fetch all records
                    </Text>
                  </Flex>
                ) : DataReport.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={20}
                  >
                    <Text fontSize="lg" color="gray.500" mb={2}>
                      No Data Available
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      No performance data found for the selected period
                    </Text>
                  </Flex>
                ) : (
                  <>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="sm" fontWeight="medium">
                        Total: {DataReport.length} records
                      </Text>
                      <Flex align="center" gap={3}>
                        <Text fontSize="sm" fontWeight="medium">
                          Sort by:
                        </Text>
                        <Select
                          value={sortField}
                          onChange={(e) => setSortField(e.target.value)}
                          size="sm"
                          w="180px"
                          bgColor={colorMode == "light" ? "white" : "gray.800"}
                        >
                          <option value="nama">NAMA</option>
                          <option value="usertotaltaskdone">
                            TOTAL TASK DONE
                          </option>
                          <option value="evgrandtotal">GRAND TOTAL</option>
                        </Select>
                        <Select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          size="sm"
                          w="80px"
                          bgColor={colorMode == "light" ? "white" : "gray.800"}
                        >
                          <option value="asc">ASC</option>
                          <option value="desc">DESC</option>
                        </Select>
                      </Flex>
                    </Flex>
                    <TableComponentWithFilterCTX
                      table={table}
                      handleFilterChange={handleFilterChange}
                    />
                  </>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Evaluation Adjustment Modal */}
      <EvaluationAdjustModal
        isOpen={isEvaluationModalOpen}
        onClose={handleCloseEvaluationModal}
        user={selectedUser}
        onSuccess={handleEvaluationSuccess}
      />
    </LayoutAdmin>
  );
}

export default DivisionPerformancePage;
