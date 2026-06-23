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
import { getStatusColor } from "@/app/utils/statusUtils";
import { StatusBadge } from "@/app/components/StatusBadge";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  getCurrentQuarter,
  getQuarterDateRange,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  ReportProjectPortofolioDataResponse,
} from "@/app/services/useReports";
import { PROJECT_STATUS_OPTIONS } from "@/app/constants/masterStatusConstants";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
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
import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiDownload } from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Portfolio Report",
  breadCrumb: ["Home", "Reports", "Project Portfolio"],
};

function ProjectPortfolioReportPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const {
    ListReportProjectPortofolio,
    ExportProjectPortofolioExcel,
    ExportProjectPortofolioPDF,
    isLoading: exportLoading,
  } = useReports();
  const { List: ListOrganization } = useOrganization();

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
          // Show all organizations, let user choose GROUP types
          setGroupOptions(response.data);
        }
      } catch (error) {
        console.error("Failed to load groups:", error);
      }
    };

    loadGroups();
  }, [tokenData]);
  // End SetUp auth data on current page

  const [DataReport, setDataReport] = useState<
    ReportProjectPortofolioDataResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
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
    [pageIndex, pageSize],
  );

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [FilterProjectStatus, setFilterProjectStatus] = useState<string>("");
  const [FilterManageGroup, setFilterManageGroup] = useState<string>("");
  const [FilterProjectType, setFilterProjectType] = useState<string>("");
  const [GroupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);

  // Quarterly filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number | "all">(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">("all");
  const [StartDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [EndDateFilter, setEndDateFilter] = useState<Date>(new Date());

  const years = Array.from({ length: currentYear - 2012 + 1 }, (_, i) => currentYear - i);

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    // Preserve quarterly date filters when updating other filters
    const dateFilters = ParamFilter.filter(
      (f) => f.field === "projectRegisterDate",
    );
    const combinedFilters = [...newFilters, ...dateFilters];
    setParamFilter(combinedFilters);
  };

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataReport([]);
    setRefreshData(RefreshData + 1);
  };

  const ExportToExcel = async () => {
    console.log("Export button clicked");
    if (!DataAuth || !tokenData) {
      console.log("No auth data or token");
      return;
    }

    const exportPayload: PaggingListPayloadCustom = {
      search: globalFilter,
      limit: -1, // Get all records
      page: 0,
      filterWhere: ParamFilter,
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    console.log("Export payload:", exportPayload);

    try {
      console.log("Calling export service...");
      const blob = await ExportProjectPortofolioExcel(exportPayload, tokenData);
      console.log("Export response:", blob);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Project_Portfolio_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast({
          description: "Excel file exported successfully",
          statusToast: "success",
        });
      } else {
        console.log("No blob returned");
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
    }
  };

  const ExportToPDF = async () => {
    console.log("Export PDF button clicked");
    if (!DataAuth || !tokenData) {
      console.log("No auth data or token");
      return;
    }

    const exportPayload: PaggingListPayloadCustom = {
      search: globalFilter,
      limit: -1, // Get all records
      page: 0,
      filterWhere: ParamFilter,
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    try {
      const blob = await ExportProjectPortofolioPDF(exportPayload, tokenData);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Project_Portfolio_Report_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast({
          description: "PDF file exported successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: "No data to export",
          statusToast: "warning",
        });
      }
    } catch (error) {
      console.error("PDF Export error:", error);
      showToast({
        description: "Failed to export PDF file",
        statusToast: "error",
      });
    }
  };

  const columnsData = useMemo<ColumnDef<ReportProjectPortofolioDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text fontSize="sm">
              {pageIndex * pageSize + info.row.index + 1}.
            </Text>
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
            <Text fontSize="sm">{info.row.original.projectName}</Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.projectCategory}
            </Text>
            {info.row.original.requirement?.requirementType && (
              <Text fontSize="xs" color="blue.500">
                Requirement Type:{" "}
                {info.row.original.requirement.requirementType}
              </Text>
            )}
            {info.row.original.projectType === "PROCUREMENT" &&
              !info.row.original.requirement && (
                <Text fontSize="xs" color="orange.500">
                  Pengadaan Internal IT
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
        accessorFn: (row) => row.projectType,
        id: "projectCharacteristics",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
            minW="150px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>Type:</Text>
              <Text>{info.row.original.projectType || "-"}</Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Project Details</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.proOwnerDivisionName,
        id: "organization",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
            minW="200px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Owner Division:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proOwnerDivisionName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Owner Group:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proOwnerGroupName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Division:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proManageByDivisionName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Group:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proManageByGroupName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Organization Structure</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "proOwnerDivisionName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Owner Division",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.requirement?.userPicName,
        id: "picInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="180px"
          >
            <Flex fontSize={"xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>PIC Name:</Text>
              <Text>{info.row.original.requirement?.userPicName || "-"}</Text>
            </Flex>
            <Flex fontSize={"xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>Phone:</Text>
              <Text>
                {info.row.original.requirement?.userPicContanct || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"xs"} as={Stack} spacing={0}>
              <Text fontWeight={600}>Email:</Text>
              <Text>{info.row.original.requirement?.userPicEmail || "-"}</Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>PIC Contact</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.workPrograms,
        id: "externalPrograms",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="220px"
          >
            <Text fontWeight={600} color="blue.500" fontSize="xs">
              External RBB Programs:
            </Text>
            {info.row.original.workPrograms?.filter(
              (wp) => wp.workProgramSource === "EXTERNAL",
            ).length > 0 ? (
              info.row.original.workPrograms
                .filter((wp) => wp.workProgramSource === "EXTERNAL")
                .map((wp, idx) => (
                  <Flex key={idx} as={Stack} spacing={0} fontSize="xs">
                    <Text fontWeight={600}>{wp.workProgramCode}</Text>
                    <Text>{wp.workProgramName}</Text>
                    <Text color="green.500">
                      Budget: Rp {wp.workProgramBudget?.toLocaleString() || "0"}
                    </Text>
                  </Flex>
                ))
            ) : (
              <Text fontSize={"xs"} color="gray.500">
                No external programs
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>External RBB</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.workPrograms,
        id: "internalPrograms",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="220px"
          >
            <Text fontWeight={600} color="green.500" fontSize="xs">
              Internal RBB Programs:
            </Text>
            {info.row.original.workPrograms?.filter(
              (wp) => wp.workProgramSource === "INTERNAL",
            ).length > 0 ? (
              info.row.original.workPrograms
                .filter((wp) => wp.workProgramSource === "INTERNAL")
                .map((wp, idx) => (
                  <Flex key={idx} as={Stack} spacing={0} fontSize="xs">
                    <Text fontWeight={600}>{wp.workProgramCode}</Text>
                    <Text>{wp.workProgramName}</Text>
                    <Text color="green.500">
                      Budget: Rp {wp.workProgramBudget?.toLocaleString() || "0"}
                    </Text>
                  </Flex>
                ))
            ) : (
              <Text fontSize={"xs"} color="gray.500">
                No internal programs
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Internal RBB (Div.IT)</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
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
            <Text fontSize="xs">
              Duration: {info.row.original.projectDurationDays} days
            </Text>
            {info.row.original.projectRegisterDate && (
              <Text fontSize="xs" color="gray.500">
                Registered:{" "}
                {stringToDateFormatedReverse(
                  info.row.original.projectRegisterDate,
                )}
              </Text>
            )}
            {info.row.original.projectClosedDate && (
              <Text fontSize="xs" color="gray.500">
                Closed:{" "}
                {stringToDateFormatedReverse(
                  info.row.original.projectClosedDate,
                )}
              </Text>
            )}
            {info.row.original.requirement?.appLiveTargetDate && (
              <Text fontSize="xs" color="blue.500">
                Target Live:{" "}
                {stringToDateFormatedReverse(
                  info.row.original.requirement.appLiveTargetDate,
                )}
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Status & Timeline</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectStatus",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Project Status",
              sourceListData: [
                { label: "ACTIVE", value: "ACTIVE" },
                { label: "COMPLETED", value: "COMPLETED" },
                { label: "ONHOLD", value: "ONHOLD" },
                { label: "INACTIVE", value: "INACTIVE" },
              ],
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.userAssignment,
        id: "teamInfo",
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
            <Text
              fontSize="2xs"
              fontWeight={600}
              color="purple.500"
              lineHeight="1.2"
            >
              Team Members ({info.row.original.userAssignment?.length || 0}):
            </Text>
            {info.row.original.userAssignment?.map((user, idx) => (
              <Text key={idx} fontSize="2xs" lineHeight="1.2">
                {idx + 1}. {user.userData?.nama || user.userId}
              </Text>
            ))}
            {(info.row.original.userAssignment?.length || 0) === 0 && (
              <Text fontSize="2xs" color="gray.500" lineHeight="1.2">
                No team members assigned
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Team Assignment</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [pageIndex, pageSize, colorMode],
  );

  // Quarterly filter effect
  useEffect(() => {
    if (selectedYear === "all") return;
    const { startDate, endDate } = getQuarterDateRange(
      selectedYear,
      selectedQuarter,
    );

    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    if (DataAuth && tokenData) {
      // Build date range filters directly from selectedYear/selectedQuarter
      let activeFilters = ParamFilter.filter(
        (f) => f.field !== "projectRegisterDate",
      );

      if (selectedYear !== "all") {
        const { startDate, endDate } = getQuarterDateRange(selectedYear as number, selectedQuarter);
        activeFilters = [
          ...activeFilters,
          {
            field: "projectRegisterDate",
            operator: ">=",
            value: startDate.toISOString().split("T")[0],
            filterLabel: "Start Date Filter",
          },
          {
            field: "projectRegisterDate",
            operator: "<=",
            value: endDate.toISOString().split("T")[0],
            filterLabel: "End Date Filter",
          },
        ];
      }

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: activeFilters,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      console.log("[DEBUG] API Payload - filterWhere:", activeFilters);
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListReportProjectPortofolio(
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

          const itemsData: ReportProjectPortofolioDataResponse[] =
            requestData.data as ReportProjectPortofolioDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataReport(itemsData);
          setTotalPageData(totalPages);
          setTotalCount(totalData);
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
    ParamFilter,
    tokenData,
    selectedYear,
    selectedQuarter,
  ]);

  const table = useReactTable({
    data: DataReport,
    columns: columnsData,
    pageCount: totalPages ?? 1,
    state: {
      globalFilter,
      pagination,
      columnVisibility: {
        picInfo: false,
        externalPrograms: false,
        internalPrograms: false,
        teamInfo: false,
      },
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

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Quarterly Filter Card */}
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
                <Flex gap={2}>
                  <Button
                    size={"sm"}
                    colorScheme="green"
                    onClick={ExportToExcel}
                    isDisabled={DataReport.length === 0 || exportLoading}
                    isLoading={exportLoading}
                    leftIcon={<FaFileExcel />}
                  >
                    Export Excel
                  </Button>
                  <Button
                    size={"sm"}
                    colorScheme="red"
                    onClick={ExportToPDF}
                    isDisabled={DataReport.length === 0 || exportLoading}
                    isLoading={exportLoading}
                    leftIcon={<FaFilePdf />}
                  >
                    Export PDF
                  </Button>
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
                <GridItem colSpan={{ base: 12, lg: 6 }}>
                  <Flex alignItems={"center"} gap={4} wrap="wrap">
                    <Text fontWeight={600} minW="fit-content">
                      Register Date:
                    </Text>
                    <Select
                      value={selectedYear}
                      size={"md"}
                      onChange={(e) => {
                        const val = e.target.value === "all" ? "all" : Number(e.target.value);
                        setSelectedYear(val);
                        if (val === "all") setSelectedQuarter("all");
                      }}
                      w="100px"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      <option value="all">All</option>
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
                        setSelectedQuarter(
                          e.target.value === "all"
                            ? "all"
                            : Number(e.target.value),
                        )
                      }
                      w="80px"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                      isDisabled={selectedYear === "all"}
                    >
                      <option value="all">All</option>
                      <option value="1">Q1</option>
                      <option value="2">Q2</option>
                      <option value="3">Q3</option>
                      <option value="4">Q4</option>
                    </Select>
                    {selectedQuarter !== "all" && (
                      <Text fontSize={"xs"} color="gray.500" minW="fit-content">
                        {formatDateToDDMMYYYY(StartDateFilter)} -{" "}
                        {formatDateToDDMMYYYY(EndDateFilter)}
                      </Text>
                    )}
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 6 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Search:
                    </Text>
                    <Input
                      placeholder="Search projects..."
                      value={globalFilter ?? ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      size="md"
                      flex={1}
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    />
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
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
                      Manage Group:
                    </Text>
                    <Select
                      placeholder="All Groups"
                      value={FilterManageGroup}
                      onChange={(e) => {
                        setFilterManageGroup(e.target.value);
                        const newFilters = addParamFilterUpdate(ParamFilter, {
                          field: "proManageByGroupName",
                          value: e.target.value,
                          operator: "=",
                          filterLabel: "Manage Group",
                        });
                        handleFilterChange(newFilters);
                      }}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      {GroupOptions.map((group) => (
                        <option key={group.id} value={group.orgName}>
                          {group.orgName} ({group.orgType})
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 3 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Type:
                    </Text>
                    <Select
                      placeholder="All Types"
                      value={FilterProjectType}
                      onChange={(e) => {
                        setFilterProjectType(e.target.value);
                        let newFilters = ParamFilter;

                        // First, remove any existing project type filters
                        newFilters = ParamFilter.filter(
                          (f) =>
                            f.field !== "projectType" &&
                            f.field !== "requirementType",
                        );

                        if (e.target.value === "RFC") {
                          // For RFC, filter by requirementType field
                          newFilters = addParamFilterUpdate(newFilters, {
                            field: "requirementType",
                            value: "RFC",
                            operator: "=",
                            filterLabel: "Project Type RFC",
                          });
                        } else if (e.target.value) {
                          // For other types, filter by projectType
                          newFilters = addParamFilterUpdate(newFilters, {
                            field: "projectType",
                            value: e.target.value,
                            operator: "=",
                            filterLabel: "Project Type",
                          });
                        }

                        handleFilterChange(newFilters);
                      }}
                      size="md"
                      bgColor={colorMode == "light" ? "white" : "gray.800"}
                    >
                      <option value="INTERNAL DEVELOPMENT">
                        Internal Development
                      </option>
                      <option value="PROCUREMENT">Procurement</option>
                      <option value="RFC">RFC</option>
                    </Select>
                  </Flex>
                </GridItem>
              </Grid>
              <Grid
                templateColumns="repeat(12, 1fr)"
                gap={5}
                w={"full"}
                mt={3}
              ></Grid>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={12} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center" w="full">
                <Flex alignItems="center" gap={3}>
                  <Heading as="h5" size="md">
                    Project Portfolio Report Data
                  </Heading>
                  <Badge
                    colorScheme="blue"
                    fontSize="sm"
                    px={3}
                    py={1}
                    rounded={radiusStyle}
                  >
                    {totalCount} Projects
                  </Badge>
                </Flex>
                <Button
                  size={"md"}
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => RefreshAction()}
                >
                  Refresh
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {IsLoadingProcess ? (
                  <LoadingMiniSignature />
                ) : (
                  <TableComponentWithFilterCTX
                    table={table}
                    handleFilterChange={handleFilterChange}
                  />
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default ProjectPortfolioReportPage;
