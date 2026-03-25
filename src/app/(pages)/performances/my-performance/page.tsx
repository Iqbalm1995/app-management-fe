"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ORG_CATEGORY_KEY_GROUP,
  DIVISION_ID_IT_BJB,
} from "@/app/constants/applicationConstants";
import { StatusBadge } from "@/app/components/StatusBadge";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { getCurrentQuarter } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  UserEvaluationReportListResponse,
} from "@/app/services/useReports";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  addParamFilterUpdate,
  ListSearchByParamProps,
  PaggingListPayloadCustom,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select as ChakraSelect,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiDownload } from "react-icons/fi";
import { motion } from "framer-motion";
import EvaluationAdjustModal from "../shared/EvaluationAdjustModal";

const MotionCard = motion(Card);

const HeaderDataContent: HeaderContentProps = {
  titleName: "My Performance Report",
  breadCrumb: ["Home", "Performances", "My Performance"],
};

function MyPerformancePage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [CurrentUserId, setCurrentUserId] = useState<string>("");
  const {
    ListUserEvaluationReport,
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
        setCurrentUserId(UserData.userId);
        setUserIdFilter(UserData.userId);
        
        // Set ParamFilter with userId in first place
        setParamFilter([
          {
            field: "userId",
            operator: "=",
            value: UserData.userId,
            filterLabel: "User ID Filter"
          },
          {
            field: "projectStatus",
            operator: "=",
            value: "PROJECT_CLOSED",
            filterLabel: "Project Status",
          },
        ]);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

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
  const [UserIdFilter, setUserIdFilter] = useState<string>("");

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([
    {
      field: "projectStatus",
      operator: "=",
      value: "PROJECT_CLOSED",
      filterLabel: "Project Status",
    },
  ]);
  const [FilterProjectStatus, setFilterProjectStatus] =
    useState<string>("PROJECT_CLOSED");
  const [GroupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [TeamOptions, setTeamOptions] = useState<TeamsResponse[]>([]);

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] =
    useState<number>(currentQuarter);

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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
      const filteredData = DataReport;
      const blob = await ExportUserEvaluationReportExcel(filteredData);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const currentDate = new Date().toISOString().split("T")[0];
        const filename = `My_Performance_Report_${selectedYear}_Q${selectedQuarter}_${currentDate}.xlsx`;
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

    let updatedFilters = ParamFilter.filter(
      (f) => f.field !== "yearPeriod" && f.field !== "quartalPeriod",
    );

    updatedFilters = addParamFilterUpdate(updatedFilters, yearFilter);
    updatedFilters = addParamFilterUpdate(updatedFilters, quarterFilter);

    setParamFilter(updatedFilters);
  }, [selectedYear, selectedQuarter]);

  useEffect(() => {
    if (DataAuth && tokenData && UserIdFilter) {
      // Always ensure userId is in filterWhere
      let finalFilters = ParamFilter.filter(f => f.field !== "userId");
      finalFilters.unshift({
        field: "userId",
        operator: "=",
        value: UserIdFilter,
        filterLabel: "User ID Filter"
      });

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: 99999,
        page: 0,
        filterWhere: finalFilters,
        fieldOrder: ["nama"],
        orderDir: "asc",
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
    UserIdFilter,
  ]);

  const statusOptions = useMemo(
    () => [
      { value: "PROJECT_ACTIVE", label: "Project Active" },
      { value: "PROJECT_CLOSED", label: "Project Closed" },
    ],
    [],
  );

  const totalGrandTotal = useMemo(() => {
    return DataReport.reduce((sum, item) => sum + (item.evGrandTotal || 0), 0);
  }, [DataReport]);

  const averagePoints = useMemo(() => {
    if (DataReport.length === 0) return 0;
    return totalGrandTotal / DataReport.length;
  }, [totalGrandTotal, DataReport.length]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} mb={4}>
        {/* User Information Card */}
        <GridItem colSpan={12} w={"full"}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bg={colorMode == "light" ? "white" : "gray.800"}
            borderColor={colorMode == "light" ? "gray.200" : "gray.700"}
            borderWidth="1px"
            rounded={radiusStyle}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Avatar
                  size="lg"
                  name={DataAuth?.nama}
                  src={DataAuth?.profilePict || undefined}
                  bg="blue.500"
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Heading size="md">{DataAuth?.nama}</Heading>
                  <Text fontSize="sm" color="gray.500">{DataAuth?.nip}</Text>
                  <Text fontSize="xs">{DataAuth?.jabatan || "-"}</Text>
                  <Text fontSize="xs" color="blue.500">{DataAuth?.namaUnitKerja || "-"}</Text>
                </VStack>
                <VStack align="end" spacing={1}>
                  <Badge colorScheme="blue">Active</Badge>
                  <Text fontSize="xs" color="gray.500">{selectedYear} Q{selectedQuarter}</Text>
                </VStack>
              </HStack>
            </CardBody>
          </MotionCard>
        </GridItem>

        {/* Filter Card */}
        <GridItem colSpan={12} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Heading as="h6" size="sm">
                Filter Options
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
                <GridItem colSpan={{ base: 12, lg: 8 }}>
                  <Flex alignItems={"center"} gap={4} wrap="wrap">
                    <Text fontWeight={600} minW="fit-content">
                      Period:
                    </Text>
                    <ChakraSelect
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
                    </ChakraSelect>
                    <ChakraSelect
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
                    </ChakraSelect>
                  </Flex>
                </GridItem>
                <GridItem colSpan={{ base: 12, lg: 4 }}>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={600} minW="fit-content">
                      Search:
                    </Text>
                    <Input
                      placeholder="Search..."
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
                      value={
                        statusOptions.find(
                          (option) => option.value === FilterProjectStatus,
                        ) || null
                      }
                      onChange={(selectedOption) => {
                        const value = selectedOption?.value || "";
                        setFilterProjectStatus(value);
                        const newFilters = addParamFilterUpdate(ParamFilter, {
                          field: "projectStatus",
                          value: value,
                          operator: "=",
                          filterLabel: "Project Status",
                        });
                        handleFilterChange(newFilters);
                      }}
                      options={statusOptions}
                      size="md"
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          width: "100%",
                          bg: colorMode == "light" ? "white" : "gray.800",
                        }),
                      }}
                      isClearable
                    />
                  </Flex>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>

        {/* Performance Data List + Summary */}
        <GridItem colSpan={{ base: 12, lg: 9 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading as="h5" size="md">
                  Performance Data
                </Heading>
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
                  <VStack spacing={3} w="full">
                    {DataReport.map((item, index) => (
                      <MotionCard
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -2, shadow: "lg" }}
                        w="full"
                        bg={colorMode == "light" ? "white" : "gray.800"}
                        borderLeft="4px solid"
                        borderColor="blue.500"
                        rounded={radiusStyle}
                      >
                        <CardBody p={3}>
                          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                            <GridItem colSpan={{ base: 12, md: 6 }}>
                              <VStack align="start" spacing={2}>
                                <HStack spacing={2}>
                                  <Avatar size="sm" name={item.nama} />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="sm">
                                      {item.nama}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {item.nip}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </VStack>
                            </GridItem>

                            <GridItem colSpan={{ base: 12, md: 6 }}>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="sm">
                                  {item.projectNo}
                                </Text>
                                <Text fontSize="xs">{item.projectName || "-"}</Text>
                              </VStack>
                            </GridItem>

                            <GridItem colSpan={{ base: 12, md: 3 }}>
                              <Stat>
                                <StatLabel fontSize="xs">Basic</StatLabel>
                                <StatNumber fontSize="lg">
                                  {item.evBasicPoint}
                                </StatNumber>
                              </Stat>
                            </GridItem>

                            <GridItem colSpan={{ base: 12, md: 3 }}>
                              <Stat>
                                <StatLabel fontSize="xs">Timeless</StatLabel>
                                <StatNumber fontSize="lg">
                                  {item.evTimelessPoint}
                                </StatNumber>
                              </Stat>
                            </GridItem>

                            <GridItem colSpan={{ base: 12, md: 3 }}>
                              <Stat>
                                <StatLabel fontSize="xs">Extra</StatLabel>
                                <StatNumber fontSize="lg">
                                  {item.evExtraPoint}
                                </StatNumber>
                              </Stat>
                            </GridItem>

                            <GridItem colSpan={{ base: 12, md: 3 }}>
                              <Stat>
                                <StatLabel fontSize="xs">Grand Total</StatLabel>
                                <StatNumber fontSize="lg" color="green.600">
                                  {item.evGrandTotal}
                                </StatNumber>
                              </Stat>
                            </GridItem>

                            <GridItem colSpan={12}>
                              <HStack spacing={2}>
                                <Badge colorScheme="blue" variant="solid">
                                  {item.projectStatus}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  Progress: {item.projectStatusPercentage}%
                                </Text>
                              </HStack>
                            </GridItem>
                          </Grid>
                        </CardBody>
                      </MotionCard>
                    ))}
                  </VStack>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        {/* Summary Sidebar */}
        <GridItem colSpan={{ base: 12, lg: 3 }} w={"full"}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            bg={colorMode == "light" ? "blue.50" : "blue.900"}
            rounded={radiusStyle}
          >
            <CardHeader>
              <Heading size="sm">Summary</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel fontSize="xs">Grand Total</StatLabel>
                  <StatNumber fontSize="2xl" color="green.600">
                    {totalGrandTotal}
                  </StatNumber>
                </Stat>

                <Divider />

                <Stat>
                  <StatLabel fontSize="xs">Total Records</StatLabel>
                  <StatNumber>{DataReport.length}</StatNumber>
                </Stat>

                <Stat>
                  <StatLabel fontSize="xs">Average Points</StatLabel>
                  <StatNumber>
                    {averagePoints.toFixed(2)}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel fontSize="xs">Period</StatLabel>
                  <StatNumber fontSize="sm">
                    {selectedYear} Q{selectedQuarter}
                  </StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </MotionCard>
        </GridItem>
      </Grid>

      {/* Footer Summary */}
      <Card
        w={"full"}
        rounded={radiusStyle}
        bg={colorMode == "light" ? "blue.50" : "blue.900"}
        mt={5}
      >
        <CardBody>
          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Stat>
                <StatLabel>Total Records</StatLabel>
                <StatNumber>{DataReport.length}</StatNumber>
              </Stat>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Stat>
                <StatLabel>Total Grand Total</StatLabel>
                <StatNumber color="green.600">
                  {totalGrandTotal}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Stat>
                <StatLabel>Average Points</StatLabel>
                <StatNumber>
                  {averagePoints.toFixed(2)}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Stat>
                <StatLabel>Period</StatLabel>
                <StatNumber fontSize="sm">
                  {selectedYear} Q{selectedQuarter}
                </StatNumber>
              </Stat>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>

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

export default MyPerformancePage;
