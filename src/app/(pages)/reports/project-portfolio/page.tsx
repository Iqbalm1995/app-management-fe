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
} from "@/app/constants/applicationConstants";
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
import {
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParamProps,
  PaggingListPayloadCustom,
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
import { FiRefreshCcw } from "react-icons/fi";

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
  const { ListReportProjectPortofolio } = useReports();

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
  // End SetUp auth data on current page

  const [DataReport, setDataReport] = useState<ReportProjectPortofolioDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

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

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Quarterly filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">(
    currentQuarter
  );
  const [StartDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [EndDateFilter, setEndDateFilter] = useState<Date>(new Date());

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    setParamFilter(newFilters);
  };

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataReport([]);
    setRefreshData(RefreshData + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "COMPLETED":
        return "blue";
      case "ONHOLD":
        return "orange";
      case "INACTIVE":
        return "red";
      default:
        return "gray";
    }
  };

  const columnsData = useMemo<ColumnDef<ReportProjectPortofolioDataResponse>[]>(
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
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>{info.row.original.projectNo}</Text>
              <Text>{info.row.original.projectName}</Text>
              <Text fontSize="sm" color="gray.500">
                {info.row.original.projectDesc}
              </Text>
            </Flex>
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
            {
              field: "projectNo",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Project Number",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectCategory,
        id: "projectCategory",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Text fontWeight={600}>{info.row.original.projectCategory}</Text>
            <Text fontSize="sm">{info.row.original.projectType}</Text>
          </Flex>
        ),
        header: () => <span>Category & Type</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectCategory",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Project Category",
            },
            {
              field: "projectType",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Project Type",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectRegisterDate,
        id: "projectDates",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Register Date:</Text>
              <Text fontWeight={600}>
                {info.row.original.projectRegisterDate
                  ? stringToDateFormatedReverse(
                      info.row.original.projectRegisterDate
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Closed Date:</Text>
              <Text fontWeight={600}>
                {info.row.original.projectClosedDate
                  ? stringToDateFormatedReverse(
                      info.row.original.projectClosedDate
                    )
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Project Dates</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectRegisterDate",
              operator: ">=",
              value: "",
              filterType: "date",
              filterLabel: "Start Register Date",
            },
            {
              field: "projectRegisterDate",
              operator: "<=",
              value: "",
              filterType: "date",
              filterLabel: "End Register Date",
            },
          ],
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
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Owner Division:</Text>
              <Text fontWeight={600} fontSize={"smaller"}>
                {info.row.original.proOwnerDivisionName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Manage By:</Text>
              <Text fontWeight={600} fontSize={"smaller"}>
                {info.row.original.proManageByDivisionName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Organization</span>,
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
            {
              field: "proManageByDivisionName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Manage By Division",
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
          >
            <Badge
              colorScheme={getStatusColor(info.row.original.projectStatus)}
              variant="solid"
              rounded={radiusStyle}
              px={3}
              py={1}
            >
              {info.row.original.projectStatus}
            </Badge>
            <Text fontSize="sm">
              Progress: {info.row.original.projectStatusPercentage}%
            </Text>
            <Text fontSize="sm">
              Duration: {info.row.original.projectDurationDays} days
            </Text>
          </Flex>
        ),
        header: () => <span>Status & Progress</span>,
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
        id: "userAssignment",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Text fontSize="sm" fontWeight={600}>
              Team Members: {info.row.original.userAssignment?.length || 0}
            </Text>
            {info.row.original.userAssignment?.slice(0, 2).map((user, idx) => (
              <Text key={idx} fontSize="xs">
                {idx + 1}. {user.userData?.nama || user.userId}
              </Text>
            ))}
            {(info.row.original.userAssignment?.length || 0) > 2 && (
              <Text fontSize="xs" color="gray.500">
                +{(info.row.original.userAssignment?.length || 0) - 2} more...
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
    [pageIndex, pageSize, colorMode]
  );

  // Quarterly filter effect
  useEffect(() => {
    const { startDate, endDate } = getQuarterDateRange(
      selectedYear,
      selectedQuarter
    );

    setStartDateFilter(startDate);
    setEndDateFilter(endDate);

    // Add date range filters to ParamFilter
    if (selectedQuarter !== "all") {
      const startDateFilter: ListSearchByParamProps = {
        field: "projectRegisterDate",
        operator: ">=",
        value: startDate.toISOString().split('T')[0],
        filterLabel: "Start Date Filter",
      };

      const endDateFilter: ListSearchByParamProps = {
        field: "projectRegisterDate",
        operator: "<=",
        value: endDate.toISOString().split('T')[0],
        filterLabel: "End Date Filter",
      };

      // Remove existing date filters and add new ones
      let updatedFilters = ParamFilter.filter(
        f => f.field !== "projectRegisterDate"
      );
      
      updatedFilters = addParamFilterUpdate(updatedFilters, startDateFilter);
      updatedFilters = addParamFilterUpdate(updatedFilters, endDateFilter);
      
      setParamFilter(updatedFilters);
    } else {
      // Remove date filters when "all" is selected
      const updatedFilters = ParamFilter.filter(
        f => f.field !== "projectRegisterDate"
      );
      setParamFilter(updatedFilters);
    }
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    if (DataAuth && tokenData) {
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex * pageSize, // Convert to offset
        filterWhere: ParamFilter,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListReportProjectPortofolio(PayloadList, tokenData);
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
  ]);

  const table = useReactTable({
    data: DataReport,
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
      
      {/* Quarterly Filter */}
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} mb={4}>
        <GridItem colSpan={{ base: 12, md: 8 }} w={"full"}>
          <Flex
            as={Wrap}
            w={"full"}
            justifyContent={"start"}
            alignItems={"center"}
            spacing={4}
          >
            <WrapItem alignItems={"center"}>
              <Text fontWeight={600} pr={2}>
                Filter by Register Date:
              </Text>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedYear}
                size={"md"}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                minW={"120px"}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedQuarter}
                size={"md"}
                onChange={(e) =>
                  setSelectedQuarter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                minW={"100px"}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                <option value="all">All</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </Select>
            </WrapItem>
            <WrapItem>
              <Text fontSize={"sm"} color="gray.500">
                {selectedQuarter !== "all" && (
                  <>
                    {formatDateToDDMMYYYY(StartDateFilter)} - {formatDateToDDMMYYYY(EndDateFilter)}
                  </>
                )}
              </Text>
            </WrapItem>
          </Flex>
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
                <Heading as="h5" size="md">
                  Project Portfolio Report Data
                </Heading>
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
