"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_MEDIUM,
  PROJEC_CATEGORY_OPTIONS,
  PROJEC_TYPE_OPTIONS,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
  ProjectUpdatePayload,
} from "@/app/services/useProjects";
import { OptionListProps } from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Wrap,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  useColorMode,
  Divider,
  HStack,
  StackDivider,
  Progress,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Select as SelectC,
  Badge,
  Avatar,
  AvatarGroup,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BsKanban } from "react-icons/bs";
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiArrowLeft,
  FiCpu,
  FiEdit3,
  FiInfo,
  FiPlayCircle,
  FiRefreshCcw,
  FiSave,
  FiServer,
  FiShare,
  FiXCircle,
  FiZap,
  FiUsers,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiClock,
  FiBarChart,
  FiFileText,
  FiSettings,
  FiHeart,
} from "react-icons/fi";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import { CustomPanelAlert } from "@/app/components/customPanels";
import AppInfromationSection from "./apps/appViewSection";
import AppChangeLogSection from "./apps/appLogsViewSection";
import AppsEnvirontmentSection from "./apps/appsEnvViewSection";
import ProjectFeatureView from "./projectFeaturesView";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { InputLayoutFullHalf } from "@/app/components/layoutContentBody";

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Detail",
  breadCrumb: ["Home", "Project Manager", "Detail"],
};

const OptionDataProjectStatus: OptionListProps[] = [
  {
    label: "NEW",
    value: "NEW",
  },
  {
    label: "ACTIVE",
    value: "ACTIVE",
  },
  {
    label: "ON HOLD",
    value: "ONHOLD",
  },
  {
    label: "IN ACTIVE",
    value: "INACTIVE",
  },
];

const FormSchemaEditProject = Yup.object().shape({
  id: Yup.string().required("ID is required"),
  projectNo: Yup.string().required("Project Number is required"),
  projectName: Yup.string()
    .required("Project Name is required")
    .min(3, "Minimum 3 characters")
    .max(100, "Maximum 100 characters"),
  projectDesc: Yup.string().nullable(),
  note: Yup.string().nullable(),
  projectCategory: Yup.string().required("Project Category is required"),
  projectType: Yup.string().required("Project Type is required"),
  projectRegisterDate: Yup.string().nullable(),
  projectClosedDate: Yup.string().nullable(),
  proOwnerDivisionId: Yup.string().nullable(),
  proOwnerGroupId: Yup.string().nullable(),
  proManageByDivisionId: Yup.string().nullable(),
  proManageByGroupId: Yup.string().nullable(),
  proManageByTeamId: Yup.string().nullable(),
});

function ProjectManagerDetail() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, UpdateProjects, GetDetailAppsByProjectId } =
    useProjects();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("projectId");
    if (id) {
      setProjectId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: ProjectDataResponse =
            requestData.data as ProjectDataResponse;

          setDataProject(itemsData);
          setHeaderContentState({
            titleName: `Project Detail`,
            breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          });
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  // Fetch application data when project is loaded
  useEffect(() => {
    if (DataAuth && DataAuth.team && DataProject && !DataApps) {
      const GetAppData = async () => {
        try {
          const requestData = await GetDetailAppsByProjectId(
            DataProject.id,
            tokenData
          );

          if (!requestData || requestData.statusCode !== RES_CODE_OK) {
            return;
          }

          const appsData: AppsResponse = requestData.data as AppsResponse;
          setDataApps(appsData);
        } catch (error) {
          console.error("Error fetching app data:", error);
        }
      };
      GetAppData();
    }
  }, [DataAuth, DataProject, tokenData]);

  return (
    <LayoutAdmin>
      {/* Beautiful Header with Gradient - Aligned Margins */}
      <Box
        bgGradient="linear(135deg, blue.500, purple.600, pink.500)"
        color="white"
        px={6}
        py={6}
        mt={4}
        mb={6}
        mx={4}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)"
          bgSize="100px 100px"
        />

        {/* Header Content */}
        <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
          {/* Top Navigation */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Link href={"/projects-manager"}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  rounded="full"
                >
                  Back
                </Button>
              </Link>
            </HStack>

            <HStack spacing={2}>
              {/* Favorite Project Button */}
              <Button
                leftIcon={<FiHeart />}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: "whiteAlpha.200", color: "pink.200" }}
                rounded="full"
              >
                Favorite
              </Button>

              {/* Share Project Button */}
              <Button
                leftIcon={<FiShare />}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                rounded="full"
              >
                Share
              </Button>

              <Button
                leftIcon={<FiRefreshCcw />}
                variant="outline"
                size="sm"
                onClick={() => setRefreshData((prev) => prev + 1)}
                isLoading={IsLoadingProcess}
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.500" }}
                rounded="full"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Main Project Information */}
          {DataProject ? (
            <HStack spacing={6} align="start">
              {/* Application Avatar with Name and Status */}
              <VStack spacing={2} align="center">
                <Box
                  w={16}
                  h={16}
                  bgGradient="linear(to-br, blue.400, purple.500)"
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                  fontWeight="bold"
                  shadow="lg"
                  border="3px solid"
                  borderColor="whiteAlpha.300"
                >
                  {DataProject?.appsProject?.appName?.charAt(0) ||
                    DataApps?.appName?.charAt(0) ||
                    DataProject.projectName?.charAt(0) ||
                    "A"}
                </Box>

                {/* App Name and Status Below Avatar */}
                <VStack spacing={1} align="center">
                  <Box
                    as="span"
                    fontSize="sm"
                    fontWeight="semibold"
                    opacity={0.9}
                  >
                    {DataProject?.appsProject?.appName ||
                      DataApps?.appName ||
                      "Application"}
                  </Box>
                  <Badge
                    colorScheme={
                      (DataProject?.appsProject?.appsStatus ||
                        DataApps?.appsStatus) === "ACTIVE"
                        ? "green"
                        : (DataProject?.appsProject?.appsStatus ||
                            DataApps?.appsStatus) === "INACTIVE"
                        ? "red"
                        : (DataProject?.appsProject?.appsStatus ||
                            DataApps?.appsStatus) === "DEVELOPMENT"
                        ? "blue"
                        : (DataProject?.appsProject?.appsStatus ||
                            DataApps?.appsStatus) === "TESTING"
                        ? "orange"
                        : "gray"
                    }
                    size="sm"
                    px={2}
                    py={1}
                    rounded="full"
                    fontSize="xs"
                  >
                    {DataProject?.appsProject?.appsStatus ||
                      DataApps?.appsStatus ||
                      "Unknown"}
                  </Badge>
                </VStack>
              </VStack>

              {/* Project Details */}
              <Box flex={1}>
                <Heading size="xl" mb={2} fontWeight="700">
                  {DataProject.projectName}
                </Heading>

                <HStack spacing={3} mb={3}>
                  <Badge
                    colorScheme={
                      DataProject.projectStatus === "ACTIVE"
                        ? "green"
                        : DataProject.projectStatus === "ONHOLD"
                        ? "orange"
                        : DataProject.projectStatus === "COMPLETED"
                        ? "blue"
                        : "gray"
                    }
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    {DataProject.projectStatus}
                  </Badge>
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    {DataProject.projectType}
                  </Badge>
                </HStack>

                {/* Short Application Information */}
                <Box fontSize="sm" opacity={0.9} mb={3} maxW="500px">
                  <Text noOfLines={2}>
                    {DataProject.projectDesc ||
                      "Modern application with advanced features and best practices implementation."}
                  </Text>
                </Box>

                {/* Quick Stats */}
                <HStack spacing={6} fontSize="sm" opacity={0.9}>
                  <HStack spacing={1}>
                    <Box as="span" fontWeight="bold">
                      {DataProject.projectStatusPercentage || 0}%
                    </Box>
                    <Box as="span">Progress</Box>
                  </HStack>
                  <HStack spacing={1}>
                    <Box as="span" fontWeight="bold">
                      {DataProject.userAssignment?.length || 0}
                    </Box>
                    <Box as="span">Team</Box>
                  </HStack>
                  <HStack spacing={1}>
                    <Box as="span" fontWeight="bold">
                      {DataProject.projectRegisterDate
                        ? calculateDurationInDays(
                            DataProject.projectRegisterDate,
                            new Date().toISOString()
                          )
                        : 0}
                    </Box>
                    <Box as="span">Days</Box>
                  </HStack>
                </HStack>
              </Box>

              {/* Team Avatars & Progress */}
              <VStack spacing={3} align="center">
                {DataProject.userAssignment &&
                  DataProject.userAssignment.length > 0 && (
                    <AvatarGroup size="md" max={4} spacing="-0.5rem">
                      {DataProject.userAssignment
                        .slice(0, 5)
                        .map((assignment, index) => (
                          <Avatar
                            key={index}
                            name={assignment.userData?.nama || "User"}
                            src={assignment.userData?.profilePict || undefined}
                            border="2px solid white"
                            shadow="md"
                          />
                        ))}
                    </AvatarGroup>
                  )}

                <Box textAlign="center">
                  <Progress
                    value={DataProject.projectStatusPercentage || 0}
                    size="sm"
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.200"
                    rounded="full"
                    w="80px"
                  />
                  <Box fontSize="xs" mt={1} opacity={0.8}>
                    {DataProject.projectStatusPercentage || 0}%
                  </Box>
                </Box>
              </VStack>
            </HStack>
          ) : (
            <HStack spacing={6} align="center" py={4}>
              <Box
                w={16}
                h={16}
                bg="whiteAlpha.200"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <LoadingMiniSignature />
              </Box>
              <Box flex={1}>
                <Heading size="xl" color="whiteAlpha.700">
                  Loading project...
                </Heading>
                <Box opacity={0.7} fontSize="sm">
                  Please wait while we fetch project details
                </Box>
              </Box>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Main Content Container */}
      <Box px={4}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
          {/* Main Content Area */}
          <GridItem>
            <Card shadow="sm" rounded="lg">
              <CardBody p={0}>
                <Tabs variant="enclosed" colorScheme="blue">
                  <TabList bg="gray.50" px={4}>
                    <Tab fontWeight="medium" fontSize="sm">
                      <HStack spacing={2}>
                        <FiTarget size={16} />
                        <Text>Overview</Text>
                      </HStack>
                    </Tab>
                    <Tab fontWeight="medium" fontSize="sm">
                      <HStack spacing={2}>
                        <FiInfo size={16} />
                        <Text>Details</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="medium"
                      fontSize="sm"
                      isDisabled={!DataProject}
                    >
                      <HStack spacing={2}>
                        <FiCpu size={16} />
                        <Text>Features</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="medium"
                      fontSize="sm"
                      isDisabled={!DataProject}
                    >
                      <HStack spacing={2}>
                        <FiUsers size={16} />
                        <Text>Team</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="medium"
                      fontSize="sm"
                      isDisabled={!DataProject}
                    >
                      <HStack spacing={2}>
                        <FiBarChart size={16} />
                        <Text>Analytics</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Overview Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={8} align="stretch">
                        <HStack justify="space-between" align="center">
                          <Heading size="lg" color="gray.800">Project Overview</Heading>
                          <Badge colorScheme="blue" px={4} py={2} rounded="full" fontSize="md">
                            Dashboard
                          </Badge>
                        </HStack>

                        {DataProject ? (
                          <>
                            {/* Enhanced Quick Stats Cards */}
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                              {/* Progress Card */}
                              <Card 
                                bg="blue.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="blue.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, blue.400, blue.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiTrendingUp size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {DataProject.projectStatusPercentage || 0}%
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Progress
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Team Card */}
                              <Card 
                                bg="green.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="green.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, green.400, green.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiUsers size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {DataProject.userAssignment?.length || 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Team Members
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Duration Card */}
                              <Card 
                                bg="orange.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="orange.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, orange.400, orange.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiClock size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {DataProject.projectRegisterDate
                                      ? calculateDurationInDays(
                                          DataProject.projectRegisterDate,
                                          new Date().toISOString()
                                        )
                                      : 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Days Active
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Status Card */}
                              <Card 
                                bg="purple.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="purple.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, purple.400, purple.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiActivity size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {DataProject.projectStatus === "ACTIVE" ? "Active" : "Inactive"}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Status
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Charts Section */}
                            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                              {/* Progress Chart */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="blue.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, blue.400, blue.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiBarChart size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="blue.700">Project Progress</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="radialBar"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: 'radialBar',
                                          toolbar: { show: false }
                                        },
                                        plotOptions: {
                                          radialBar: {
                                            startAngle: -90,
                                            endAngle: 90,
                                            hollow: {
                                              margin: 15,
                                              size: '70%'
                                            },
                                            dataLabels: {
                                              name: {
                                                offsetY: -10,
                                                show: true,
                                                color: '#888',
                                                fontSize: '17px'
                                              },
                                              value: {
                                                offsetY: 16,
                                                color: '#111',
                                                fontSize: '36px',
                                                show: true,
                                              }
                                            }
                                          }
                                        },
                                        fill: {
                                          type: 'gradient',
                                          gradient: {
                                            shade: 'light',
                                            shadeIntensity: 0.4,
                                            inverseColors: false,
                                            opacityFrom: 1,
                                            opacityTo: 1,
                                            stops: [0, 50, 53, 91]
                                          },
                                        },
                                        labels: ['Progress'],
                                        colors: ['#3182CE']
                                      }}
                                      series={[Number(DataProject?.projectStatusPercentage || 0)]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Task Distribution Chart (Dummy Data) */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="green.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, green.400, green.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiTarget size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="green.700">Task Distribution</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="donut"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: 'donut',
                                          toolbar: { show: false }
                                        },
                                        labels: ['Completed', 'In Progress', 'Pending', 'On Hold'],
                                        colors: ['#38A169', '#3182CE', '#ED8936', '#E53E3E'],
                                        legend: {
                                          position: 'bottom',
                                          horizontalAlign: 'center',
                                        },
                                        plotOptions: {
                                          pie: {
                                            donut: {
                                              size: '65%'
                                            }
                                          }
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          formatter: function (val: number) {
                                            return Math.round(val) + "%"
                                          }
                                        },
                                        responsive: [{
                                          breakpoint: 480,
                                          options: {
                                            chart: {
                                              width: 200
                                            },
                                            legend: {
                                              position: 'bottom'
                                            }
                                          }
                                        }]
                                      }}
                                      series={[45, 30, 15, 10]} // Dummy data
                                    />
                                  </Box>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Additional Information Cards */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                              {/* Recent Activity Card */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="orange.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, orange.400, orange.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiActivity size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="orange.700">Recent Activity</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="green.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.600">Task completed</Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="blue.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.600">Team member added</Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="orange.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.600">Status updated</Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="purple.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.600">Feature deployed</Text>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Milestones Card */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="purple.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, purple.400, purple.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiTarget size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="purple.700">Milestones</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Planning</Text>
                                      <Badge colorScheme="green" size="sm">Done</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Development</Text>
                                      <Badge colorScheme="blue" size="sm">Active</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Testing</Text>
                                      <Badge colorScheme="orange" size="sm">Pending</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Deployment</Text>
                                      <Badge colorScheme="gray" size="sm">Waiting</Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Quick Actions Card */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="blue.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, blue.400, blue.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiZap size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="blue.700">Quick Actions</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={2}>
                                    <Button size="sm" variant="ghost" w="full" justifyContent="flex-start" leftIcon={<FiUsers />}>
                                      Add Team Member
                                    </Button>
                                    <Button size="sm" variant="ghost" w="full" justifyContent="flex-start" leftIcon={<FiCpu />}>
                                      Create Feature
                                    </Button>
                                    <Button size="sm" variant="ghost" w="full" justifyContent="flex-start" leftIcon={<FiBarChart />}>
                                      View Reports
                                    </Button>
                                    <Button size="sm" variant="ghost" w="full" justifyContent="flex-start" leftIcon={<FiSettings />}>
                                      Project Settings
                                    </Button>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Project Description - Enhanced */}
                            <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                              <CardHeader bg="gray.50" roundedTop="xl">
                                <HStack spacing={3}>
                                  <Box
                                    w={10}
                                    h={10}
                                    bgGradient="linear(135deg, gray.400, gray.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiFileText size={20} color="white" />
                                  </Box>
                                  <Heading size="md" color="gray.700">Project Description</Heading>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <Text color="gray.600" lineHeight="tall" fontSize="md">
                                  {DataProject.projectDesc || "No description available for this project. Consider adding a detailed description to help team members understand the project goals and objectives."}
                                </Text>
                                {DataProject.projectDesc && (
                                  <HStack mt={4} spacing={4}>
                                    <Badge colorScheme="blue" px={3} py={1} rounded="full">
                                      {DataProject.projectCategory}
                                    </Badge>
                                    <Badge colorScheme="purple" px={3} py={1} rounded="full">
                                      {DataProject.projectType}
                                    </Badge>
                                  </HStack>
                                )}
                              </CardBody>
                            </Card>
                          </>
                        ) : (
                          <Box textAlign="center" py={12}>
                            <LoadingMiniSignature />
                            <Text mt={4} color="gray.500">Loading project overview...</Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Details Tab */}
                    <TabPanel p={6}>
                      <Suspense fallback={<LoadingMiniSignature />}>
                        <ProjectInfoSection projectId={projectId} />
                      </Suspense>
                    </TabPanel>

                    {/* Features Tab */}
                    <TabPanel p={6}>
                      <Suspense fallback={<LoadingMiniSignature />}>
                        <ProjectFeatureView DataProject={DataProject} />
                      </Suspense>
                    </TabPanel>

                    {/* Team Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={8} align="stretch">
                        {/* Header Section */}
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="lg" color="gray.800">Team Management</Heading>
                            <Text color="gray.600" fontSize="sm">
                              Manage project team members and their roles
                            </Text>
                          </VStack>
                          <HStack spacing={3}>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<FiRefreshCcw />}
                              colorScheme="gray"
                              rounded="full"
                            >
                              Refresh
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiUsers />}
                              rounded="full"
                              shadow="md"
                              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
                            >
                              Add Member
                            </Button>
                          </HStack>
                        </HStack>

                        {DataProject?.userAssignment && DataProject.userAssignment.length > 0 ? (
                          <>
                            {/* Team Statistics */}
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                              <Card 
                                bg="blue.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="blue.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, blue.400, blue.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiUsers size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {DataProject.userAssignment.length}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Total Members
                                  </Text>
                                </CardBody>
                              </Card>

                              <Card 
                                bg="green.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="green.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, green.400, green.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiActivity size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {DataProject.userAssignment.filter(m => m.userAssignStatus === "ACTIVE").length}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Active Members
                                  </Text>
                                </CardBody>
                              </Card>

                              <Card 
                                bg="orange.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="orange.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, orange.400, orange.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiTarget size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {Math.round((DataProject.userAssignment.filter(m => m.userAssignStatus === "ACTIVE").length / DataProject.userAssignment.length) * 100)}%
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Active Rate
                                  </Text>
                                </CardBody>
                              </Card>

                              <Card 
                                bg="purple.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="purple.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, purple.400, purple.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiClock size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {DataProject.userAssignment.length > 0 ? Math.ceil(DataProject.userAssignment.length / 2) : 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Avg. Load
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Team Members Grid */}
                            <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                              <CardHeader bg="blue.50" roundedTop="xl">
                                <HStack justify="space-between">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, blue.400, blue.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiUsers size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="blue.700">Team Members</Heading>
                                  </HStack>
                                  <Badge colorScheme="blue" px={3} py={1} rounded="full">
                                    {DataProject.userAssignment.length} Members
                                  </Badge>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                  {DataProject.userAssignment.map((member, index) => (
                                    <Card 
                                      key={index}
                                      shadow="md"
                                      rounded="xl"
                                      border="1px"
                                      borderColor="gray.200"
                                      _hover={{ 
                                        transform: "translateY(-4px)", 
                                        shadow: "xl",
                                        borderColor: "blue.300"
                                      }}
                                      transition="all 0.2s"
                                      bg="white"
                                    >
                                      <CardBody p={6}>
                                        <VStack spacing={4}>
                                          {/* Avatar Section */}
                                          <Box position="relative">
                                            <Avatar
                                              size="xl"
                                              name={member.userData?.nama || "User"}
                                              src={member.userData?.profilePict || undefined}
                                              border="4px solid"
                                              borderColor={member.userAssignStatus === "ACTIVE" ? "green.200" : "gray.200"}
                                              shadow="lg"
                                            />
                                            <Box
                                              position="absolute"
                                              bottom={0}
                                              right={0}
                                              w={6}
                                              h={6}
                                              bg={member.userAssignStatus === "ACTIVE" ? "green.400" : "gray.400"}
                                              rounded="full"
                                              border="2px solid white"
                                              shadow="md"
                                            />
                                          </Box>

                                          {/* Member Info */}
                                          <VStack spacing={2} textAlign="center">
                                            <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                              {member.userData?.nama || "Unknown User"}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                              {member.userData?.email || "No email"}
                                            </Text>
                                            <Badge
                                              colorScheme={member.userAssignStatus === "ACTIVE" ? "green" : "gray"}
                                              px={3}
                                              py={1}
                                              rounded="full"
                                              fontWeight="semibold"
                                              fontSize="xs"
                                            >
                                              {member.userAssignStatus}
                                            </Badge>
                                          </VStack>

                                          {/* Member Actions */}
                                          <HStack spacing={2} w="full">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              colorScheme="blue"
                                              flex={1}
                                              leftIcon={<FiInfo />}
                                              rounded="lg"
                                            >
                                              View
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              colorScheme="orange"
                                              flex={1}
                                              leftIcon={<FiEdit3 />}
                                              rounded="lg"
                                            >
                                              Edit
                                            </Button>
                                          </HStack>

                                          {/* Additional Info */}
                                          <VStack spacing={2} w="full" pt={2} borderTop="1px" borderColor="gray.100">
                                            <HStack justify="space-between" w="full">
                                              <Text fontSize="xs" color="gray.500">Role:</Text>
                                              <Badge size="sm" colorScheme="purple" rounded="md">
                                                {member.userData?.team?.teamName || "Developer"}
                                              </Badge>
                                            </HStack>
                                            <HStack justify="space-between" w="full">
                                              <Text fontSize="xs" color="gray.500">Joined:</Text>
                                              <Text fontSize="xs" color="gray.600">
                                                {member.assignDate 
                                                  ? new Date(member.assignDate).toLocaleDateString()
                                                  : "N/A"}
                                              </Text>
                                            </HStack>
                                          </VStack>
                                        </VStack>
                                      </CardBody>
                                    </Card>
                                  ))}
                                </SimpleGrid>
                              </CardBody>
                            </Card>

                            {/* Team Roles Distribution */}
                            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                              {/* Roles Chart */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="green.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, green.400, green.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiTarget size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="green.700">Team Roles</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="250px">
                                    <Chart
                                      type="pie"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: 'pie',
                                          toolbar: { show: false }
                                        },
                                        labels: ['Developers', 'Designers', 'Managers', 'QA'],
                                        colors: ['#3182CE', '#38A169', '#ED8936', '#E53E3E'],
                                        legend: {
                                          position: 'bottom',
                                          horizontalAlign: 'center',
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          formatter: function (val: number) {
                                            return Math.round(val) + "%"
                                          }
                                        },
                                        responsive: [{
                                          breakpoint: 480,
                                          options: {
                                            chart: {
                                              width: 200
                                            },
                                            legend: {
                                              position: 'bottom'
                                            }
                                          }
                                        }]
                                      }}
                                      series={[60, 20, 15, 5]} // Dummy data for roles
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Team Activity */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="orange.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, orange.400, orange.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiActivity size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="orange.700">Recent Activity</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="John Doe" />
                                      <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="medium">John Doe joined the project</Text>
                                        <Text fontSize="xs" color="gray.500">2 hours ago</Text>
                                      </VStack>
                                      <Badge colorScheme="green" size="sm">New</Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Jane Smith" />
                                      <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="medium">Jane Smith completed a task</Text>
                                        <Text fontSize="xs" color="gray.500">5 hours ago</Text>
                                      </VStack>
                                      <Badge colorScheme="blue" size="sm">Task</Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Mike Johnson" />
                                      <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="medium">Mike Johnson updated status</Text>
                                        <Text fontSize="xs" color="gray.500">1 day ago</Text>
                                      </VStack>
                                      <Badge colorScheme="orange" size="sm">Update</Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Sarah Wilson" />
                                      <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="medium">Sarah Wilson left a comment</Text>
                                        <Text fontSize="xs" color="gray.500">2 days ago</Text>
                                      </VStack>
                                      <Badge colorScheme="purple" size="sm">Comment</Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>
                          </>
                        ) : (
                          <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                            <CardBody p={12} textAlign="center">
                              <VStack spacing={6}>
                                <Box
                                  w={20}
                                  h={20}
                                  bgGradient="linear(135deg, gray.300, gray.500)"
                                  rounded="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <FiUsers size={40} color="white" />
                                </Box>
                                <VStack spacing={2}>
                                  <Heading size="md" color="gray.600">No Team Members</Heading>
                                  <Text color="gray.500" fontSize="sm" maxW="400px">
                                    This project doesn't have any team members assigned yet. 
                                    Start building your team by adding members to collaborate on this project.
                                  </Text>
                                </VStack>
                                <Button
                                  colorScheme="blue"
                                  size="lg"
                                  leftIcon={<FiUsers />}
                                  rounded="full"
                                  shadow="lg"
                                  _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                >
                                  Add First Team Member
                                </Button>
                              </VStack>
                            </CardBody>
                          </Card>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={8} align="stretch">
                        {/* Header Section */}
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="lg" color="gray.800">Project Analytics</Heading>
                            <Text color="gray.600" fontSize="sm">
                              Comprehensive insights and performance metrics
                            </Text>
                          </VStack>
                          <HStack spacing={3}>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<FiRefreshCcw />}
                              colorScheme="gray"
                              rounded="full"
                            >
                              Refresh
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="purple"
                              leftIcon={<FiBarChart />}
                              rounded="full"
                              shadow="md"
                              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
                            >
                              Export Report
                            </Button>
                          </HStack>
                        </HStack>

                        {DataProject ? (
                          <>
                            {/* Key Performance Indicators */}
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                              {/* Completion Rate */}
                              <Card 
                                bg="blue.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="blue.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, blue.400, blue.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiTrendingUp size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {DataProject.projectStatusPercentage || 0}%
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Completion Rate
                                  </Text>
                                  <Text fontSize="xs" color="green.500" mt={1}>
                                    +5% from last week
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Team Productivity */}
                              <Card 
                                bg="green.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="green.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, green.400, green.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiActivity size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {DataProject.userAssignment?.length ? Math.round((DataProject.projectStatusPercentage || 0) / DataProject.userAssignment.length) : 0}%
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Team Efficiency
                                  </Text>
                                  <Text fontSize="xs" color="green.500" mt={1}>
                                    Above average
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Time Performance */}
                              <Card 
                                bg="orange.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="orange.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, orange.400, orange.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiClock size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {DataProject.projectRegisterDate
                                      ? calculateDurationInDays(
                                          DataProject.projectRegisterDate,
                                          new Date().toISOString()
                                        )
                                      : 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Days Active
                                  </Text>
                                  <Text fontSize="xs" color="orange.500" mt={1}>
                                    On schedule
                                  </Text>
                                </CardBody>
                              </Card>

                              {/* Quality Score */}
                              <Card 
                                bg="purple.50" 
                                textAlign="center" 
                                shadow="lg" 
                                rounded="xl" 
                                border="2px" 
                                borderColor="purple.200"
                                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                              >
                                <CardBody py={6}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, purple.400, purple.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mx="auto"
                                    mb={3}
                                  >
                                    <FiTarget size={24} color="white" />
                                  </Box>
                                  <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {Math.min(95, Math.max(70, (DataProject.projectStatusPercentage || 0) + 15))}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    Quality Score
                                  </Text>
                                  <Text fontSize="xs" color="green.500" mt={1}>
                                    Excellent
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Charts Section */}
                            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                              {/* Progress Timeline Chart */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="blue.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, blue.400, blue.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiTrendingUp size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="blue.700">Progress Timeline</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="line"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: 'line',
                                          toolbar: { show: false },
                                          zoom: { enabled: false }
                                        },
                                        stroke: {
                                          curve: 'smooth',
                                          width: 3
                                        },
                                        colors: ['#3182CE'],
                                        xaxis: {
                                          categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                                          labels: {
                                            style: {
                                              colors: '#718096'
                                            }
                                          }
                                        },
                                        yaxis: {
                                          min: 0,
                                          max: 100,
                                          labels: {
                                            formatter: function (val: number) {
                                              return val + "%"
                                            },
                                            style: {
                                              colors: '#718096'
                                            }
                                          }
                                        },
                                        grid: {
                                          borderColor: '#E2E8F0',
                                          strokeDashArray: 3
                                        },
                                        markers: {
                                          size: 6,
                                          colors: ['#3182CE'],
                                          strokeColors: '#fff',
                                          strokeWidth: 2
                                        },
                                        tooltip: {
                                          y: {
                                            formatter: function (val: number) {
                                              return val + "% completed"
                                            }
                                          }
                                        }
                                      }}
                                      series={[{
                                        name: 'Progress',
                                        data: [10, 25, 45, 60, 75, DataProject.projectStatusPercentage || 0]
                                      }]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Team Performance Chart */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="green.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={10}
                                      h={10}
                                      bgGradient="linear(135deg, green.400, green.600)"
                                      rounded="xl"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiUsers size={20} color="white" />
                                    </Box>
                                    <Heading size="md" color="green.700">Team Performance</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="bar"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: 'bar',
                                          toolbar: { show: false }
                                        },
                                        colors: ['#38A169', '#3182CE', '#ED8936'],
                                        xaxis: {
                                          categories: ['Tasks Completed', 'In Progress', 'Pending'],
                                          labels: {
                                            style: {
                                              colors: '#718096'
                                            }
                                          }
                                        },
                                        yaxis: {
                                          labels: {
                                            style: {
                                              colors: '#718096'
                                            }
                                          }
                                        },
                                        grid: {
                                          borderColor: '#E2E8F0',
                                          strokeDashArray: 3
                                        },
                                        plotOptions: {
                                          bar: {
                                            borderRadius: 8,
                                            horizontal: false,
                                            columnWidth: '60%'
                                          }
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          style: {
                                            colors: ['#fff']
                                          }
                                        }
                                      }}
                                      series={[{
                                        name: 'Tasks',
                                        data: [45, 30, 15] // Dummy data
                                      }]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Detailed Analytics Cards */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                              {/* Performance Insights */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="orange.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, orange.400, orange.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiActivity size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="orange.700">Performance Insights</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Velocity</Text>
                                      <HStack spacing={2}>
                                        <Text fontSize="sm" fontWeight="bold" color="green.600">+12%</Text>
                                        <FiTrendingUp size={14} color="green" />
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Code Quality</Text>
                                      <HStack spacing={2}>
                                        <Text fontSize="sm" fontWeight="bold" color="blue.600">95%</Text>
                                        <Badge colorScheme="blue" size="sm">Excellent</Badge>
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Bug Rate</Text>
                                      <HStack spacing={2}>
                                        <Text fontSize="sm" fontWeight="bold" color="green.600">0.2%</Text>
                                        <Badge colorScheme="green" size="sm">Low</Badge>
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Test Coverage</Text>
                                      <HStack spacing={2}>
                                        <Text fontSize="sm" fontWeight="bold" color="blue.600">87%</Text>
                                        <Badge colorScheme="blue" size="sm">Good</Badge>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Resource Utilization */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="purple.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, purple.400, purple.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiCpu size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="purple.700">Resource Utilization</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={4} align="stretch">
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Team Capacity</Text>
                                        <Text fontSize="sm" fontWeight="bold">85%</Text>
                                      </HStack>
                                      <Progress value={85} colorScheme="purple" size="sm" rounded="full" />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Budget Used</Text>
                                        <Text fontSize="sm" fontWeight="bold">72%</Text>
                                      </HStack>
                                      <Progress value={72} colorScheme="blue" size="sm" rounded="full" />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Time Allocated</Text>
                                        <Text fontSize="sm" fontWeight="bold">68%</Text>
                                      </HStack>
                                      <Progress value={68} colorScheme="green" size="sm" rounded="full" />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Resources</Text>
                                        <Text fontSize="sm" fontWeight="bold">91%</Text>
                                      </HStack>
                                      <Progress value={91} colorScheme="orange" size="sm" rounded="full" />
                                    </VStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Risk Assessment */}
                              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                                <CardHeader bg="red.50" roundedTop="xl">
                                  <HStack spacing={3}>
                                    <Box
                                      w={8}
                                      h={8}
                                      bgGradient="linear(135deg, red.400, red.600)"
                                      rounded="lg"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <FiAlertTriangle size={16} color="white" />
                                    </Box>
                                    <Heading size="sm" color="red.700">Risk Assessment</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Schedule Risk</Text>
                                      <Badge colorScheme="green" size="sm">Low</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Budget Risk</Text>
                                      <Badge colorScheme="yellow" size="sm">Medium</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Technical Risk</Text>
                                      <Badge colorScheme="green" size="sm">Low</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">Resource Risk</Text>
                                      <Badge colorScheme="green" size="sm">Low</Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" fontWeight="bold" color="gray.700">Overall Risk</Text>
                                      <Badge colorScheme="green" size="sm" px={3} py={1}>
                                        LOW RISK
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Recommendations */}
                            <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                              <CardHeader bg="blue.50" roundedTop="xl">
                                <HStack spacing={3}>
                                  <Box
                                    w={10}
                                    h={10}
                                    bgGradient="linear(135deg, blue.400, blue.600)"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiZap size={20} color="white" />
                                  </Box>
                                  <Heading size="md" color="blue.700">AI-Powered Recommendations</Heading>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="green.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="green.600">Optimize team allocation:</Text> Consider redistributing tasks to balance workload across team members.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="blue.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="blue.600">Increase test coverage:</Text> Add more unit tests to reach the target of 90% code coverage.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="orange.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="orange.600">Monitor budget:</Text> Current spending rate may exceed budget by 8% if maintained.
                                      </Text>
                                    </HStack>
                                  </VStack>
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="purple.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="purple.600">Schedule review:</Text> Plan a milestone review meeting to assess progress and adjust timeline.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="pink.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="pink.600">Documentation update:</Text> Update project documentation to reflect recent changes and decisions.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box w={2} h={2} bg="teal.400" rounded="full" />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text as="span" fontWeight="bold" color="teal.600">Performance optimization:</Text> Consider implementing caching to improve application performance.
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </SimpleGrid>
                              </CardBody>
                            </Card>
                          </>
                        ) : (
                          <Box textAlign="center" py={12}>
                            <LoadingMiniSignature />
                            <Text mt={4} color="gray.500">Loading analytics data...</Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack spacing={4}>
              {/* Project Info Card */}
              <Card w="full">
                <CardHeader>
                  <Heading size="sm">Project Info</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {DataProject ? (
                      <>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Code:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {DataProject.projectCode}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Type:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {DataProject.projectType}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Status:
                          </Text>
                          <Badge
                            size="sm"
                            colorScheme={
                              DataProject.projectStatus === "ACTIVE"
                                ? "green"
                                : DataProject.projectStatus === "ONHOLD"
                                ? "orange"
                                : DataProject.projectStatus === "COMPLETED"
                                ? "blue"
                                : "gray"
                            }
                          >
                            {DataProject.projectStatus}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Progress:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {DataProject.projectStatusPercentage || 0}%
                          </Text>
                        </HStack>
                        <Box>
                          <Progress
                            value={DataProject.projectStatusPercentage || 0}
                            colorScheme="blue"
                            size="sm"
                            rounded="md"
                          />
                        </Box>
                      </>
                    ) : (
                      <LoadingMiniSignature />
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Actions Card */}
              <Card w="full">
                <CardHeader>
                  <Heading size="sm">Quick Actions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiActivity />}
                    >
                      View Activity
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiSettings />}
                    >
                      Settings
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiBarChart />}
                    >
                      Reports
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}

const stepsProgress = [
  { title: "Initiation", description: "Project start" },
  { title: "Planning", description: "Set roadmap" },
  { title: "Development", description: "Code features" },
  { title: "Testing", description: "Bug checks" },
  { title: "Deployment", description: "Go live" },
];

export const initialProjectUpdateValues: ProjectUpdatePayload = {
  id: "",
  projectNo: "",
  projectName: "",
  projectDesc: null,
  note: null,
  projectCategory: "",
  projectType: "",
  projectRegisterDate: null,
  projectClosedDate: null,
  proOwnerDivisionId: null,
  proOwnerGroupId: null,
  proManageByDivisionId: null,
  proManageByGroupId: null,
  proManageByTeamId: null,
};

const ProjectInfoSection = ({ projectId }: { projectId: string | null }) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailById } = useProjects();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const RefreshAction = () => {
    setRefreshData(prev => prev + 1);
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: ProjectDataResponse =
            requestData.data as ProjectDataResponse;

          setDataProject(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  return (
    <VStack spacing={6} align="stretch">
      {!projectId && !DataProject ? (
        <CustomPanelAlert type={"error"}>
          <FiAlertTriangle color={"red"} size={70} />
          <Text>No project ID found in the URL</Text>
        </CustomPanelAlert>
      ) : (
        <>
          {IsLoadingProcess ? (
            <Box textAlign="center" py={12}>
              <LoadingMiniSignature />
              <Text mt={4} color="gray.500">Loading project information...</Text>
            </Box>
          ) : DataProject ? (
            <>
              {/* Header Section */}
              <HStack justify="space-between" align="center">
                <Heading size="lg" color="gray.800">
                  Project Information
                </Heading>
                <Button
                  leftIcon={<FiRefreshCcw />}
                  variant="outline"
                  size="sm"
                  onClick={RefreshAction}
                  colorScheme="blue"
                  rounded="full"
                >
                  Refresh
                </Button>
              </HStack>

              {/* Beautiful Information Cards */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Basic Information Card */}
                <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                  <CardHeader bg="blue.50" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(135deg, blue.400, blue.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiInfo size={20} color="white" />
                      </Box>
                      <Heading size="md" color="blue.700">Basic Information</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Project Number:</Text>
                        <Badge colorScheme="blue" px={3} py={1} rounded="full" fontSize="sm">
                          {DataProject.projectNo || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Project Name:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800" textAlign="right" maxW="200px">
                          {DataProject.projectName || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Description:</Text>
                        <Box
                          bg="gray.50"
                          p={3}
                          rounded="lg"
                          border="1px"
                          borderColor="gray.200"
                          minH="60px"
                        >
                          <Text fontSize="sm" color="gray.700" lineHeight="tall">
                            {DataProject.projectDesc || "No description available"}
                          </Text>
                        </Box>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Project Classification Card */}
                <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                  <CardHeader bg="green.50" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(135deg, green.400, green.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiTarget size={20} color="white" />
                      </Box>
                      <Heading size="md" color="green.700">Classification</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Category:</Text>
                        <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="sm">
                          {DataProject.projectCategory || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Type:</Text>
                        <Badge colorScheme="purple" px={3} py={1} rounded="full" fontSize="sm">
                          {DataProject.projectType || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Status:</Text>
                        <Badge
                          colorScheme={
                            DataProject.projectStatus === "ACTIVE" ? "green" :
                            DataProject.projectStatus === "ONHOLD" ? "orange" :
                            DataProject.projectStatus === "COMPLETED" ? "blue" :
                            "gray"
                          }
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectStatus || "N/A"}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Timeline Information Card */}
                <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                  <CardHeader bg="orange.50" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(135deg, orange.400, orange.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiCalendar size={20} color="white" />
                      </Box>
                      <Heading size="md" color="orange.700">Timeline</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Register Date:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate 
                            ? new Date(DataProject.projectRegisterDate).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Closed Date:</Text>
                        {DataProject.projectClosedDate ? (
                          <Text fontSize="sm" fontWeight="bold" color="gray.800">
                            {new Date(DataProject.projectClosedDate).toLocaleDateString()}
                          </Text>
                        ) : (
                          <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="sm">
                            ON GOING
                          </Badge>
                        )}
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Duration:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate
                            ? calculateDurationInDays(
                                DataProject.projectRegisterDate,
                                DataProject.projectClosedDate || new Date().toISOString()
                              )
                            : 0} days
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Additional Information Card */}
                <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                  <CardHeader bg="purple.50" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(135deg, purple.400, purple.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiFileText size={20} color="white" />
                      </Box>
                      <Heading size="md" color="purple.700">Additional Info</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Notes:</Text>
                        <Box
                          bg="gray.50"
                          p={3}
                          rounded="lg"
                          border="1px"
                          borderColor="gray.200"
                          minH="60px"
                        >
                          <Text fontSize="sm" color="gray.700" lineHeight="tall">
                            {DataProject.note || "No additional notes"}
                          </Text>
                        </Box>
                      </VStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">Project ID:</Text>
                        <Text fontSize="xs" fontFamily="mono" color="gray.500" bg="gray.100" px={2} py={1} rounded="md">
                          {DataProject.id}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Progress Section */}
              <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
                <CardHeader bg="blue.50" roundedTop="xl">
                  <HStack spacing={3}>
                    <Box
                      w={10}
                      h={10}
                      bgGradient="linear(135deg, blue.400, blue.600)"
                      rounded="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FiTrendingUp size={20} color="white" />
                    </Box>
                    <Heading size="md" color="blue.700">Project Progress</Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        Overall Progress
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {DataProject.projectStatusPercentage || 0}%
                      </Text>
                    </HStack>
                    <Progress
                      value={DataProject.projectStatusPercentage || 0}
                      size="lg"
                      colorScheme="blue"
                      rounded="full"
                      w="full"
                      bg="gray.100"
                    />
                    <HStack justify="space-between" w="full" fontSize="sm" color="gray.600">
                      <Text>Started</Text>
                      <Text>In Progress</Text>
                      <Text>Completed</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </>
          ) : (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">No project data available</Text>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};

interface AppsInfoDetailProps {
  DataProject: ProjectDataResponse | null;
}

const AppsInfoDetail = ({ DataProject }: AppsInfoDetailProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailAppsByProjectId } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const storedData = localStorage.getItem("authData");
  const tokenData: string = localStorage.getItem("tokenData") as string;
  useEffect(() => {
    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }
  }, [DataAuth]);

  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && DataProject && DataApps == null) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailAppsByProjectId(
          DataProject.id,
          tokenData
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
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: AppsResponse = requestData.data as AppsResponse;

          setDataApps(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataProject, DataApps]);

  return (
    <Flex w={"full"}>
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <Flex w={"full"}>
          {DataProject && DataApps ? (
            <Flex w={"full"} as={Stack}>
              <Tabs
                orientation="vertical"
                variant={"unstyled"}
                isFitted
                w={"full"}
              >
                <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }}
                    w={"full"}
                  >
                    <TabPanels w={"full"}>
                      <TabPanel px={0}>
                        <Suspense>
                          <AppInfromationSection />
                        </Suspense>
                      </TabPanel>
                      <TabPanel px={0}>
                        {DataApps && (
                          <Suspense>
                            <AppChangeLogSection AppsId={DataApps.id} />
                          </Suspense>
                        )}
                      </TabPanel>
                      <TabPanel px={0}>
                        {DataApps && (
                          <Suspense>
                            <AppsEnvirontmentSection AppsId={DataApps.id} />
                          </Suspense>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }}
                    w={"full"}
                    minH={"500px"}
                  >
                    <Flex
                      w={"full"}
                      px={4}
                      py={6}
                      as={Stack}
                      // rounded={radiusStyle}
                      minH={"320px"}
                      borderLeft={"2px"}
                      borderColor={"gray.200"}
                    >
                      <Heading as="h5" size="sm">
                        Options
                      </Heading>
                      <TabList w={"full"} gap={4} pt={3}>
                        {/* APPS DETAILS */}
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiInfo /> <Text pl={3}>Details</Text>
                        </Tab>
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiActivity /> <Text pl={3}>Change Log</Text>
                        </Tab>
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiServer /> <Text pl={3}>Environtment Links</Text>
                        </Tab>
                      </TabList>
                    </Flex>
                  </GridItem>
                </Grid>
              </Tabs>
            </Flex>
          ) : (
            <CustomPanelAlert type={"info"}>
              <FiAlertOctagon size={70} />
              <Text>Application not found. Register now?</Text>
              <Button
                size={"lg"}
                leftIcon={<FiZap />}
                colorScheme={"primary"}
                rounded={radiusStyle}
              >
                Register Apps Now
              </Button>
            </CustomPanelAlert>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default ProjectManagerDetail;
