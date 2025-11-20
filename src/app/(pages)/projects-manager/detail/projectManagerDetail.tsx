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
  TabIndicator,
  Collapse,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  FiExternalLink,
  FiCode,
  FiBriefcase,
  FiUpload,
  FiEye,
} from "react-icons/fi";
import { FaCircle } from "react-icons/fa6";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import { EventContentArg, EventClickArg } from "@fullcalendar/core/index.js";
import { EventImpl } from "@fullcalendar/core/internal";

// Dynamically load FullCalendar with no SSR
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

// Calendar plugins imports
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentPlugin from "@fullcalendar/moment";
import { CustomPanelAlert } from "@/app/components/customPanels";
import AppInfromationSection from "./apps/appViewSection";
import AppChangeLogSection from "./apps/appLogsViewSection";
import AppsEnvirontmentSection from "./apps/appsEnvViewSection";
import ProjectFeatureView from "./projectFeaturesView";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { InputLayoutFullHalf } from "@/app/components/layoutContentBody";
import { TabButtonCustomStyle } from "@/app/components/TabsCustom";

// Import tab components
import {
  OverviewTab,
  DetailsTab,
  FeaturesTab,
  DocumentationTab,
  TeamTab,
  AnalyticsTab,
  TimelineTab,
  EditTab,
} from "./tabs";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";

// Calendar Event Interface
interface EventInterface {
  title: string;
  start: string; // ISO date string format
  end?: string; // Optional end time
  allDay?: boolean; // Optional flag for all-day events
  [key: string]: any; // For any additional properties like `id`, `description`, etc.
  color?: string;
}

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Detail",
  breadCrumb: ["Home", "Project Manager", "Detail"],
};

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

// Workflow Level 2 Component
interface WorkflowLevel2Props {
  workflow: any;
}

function ProjectManagerDetail() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  // Add initialization state
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize component with delay
  useEffect(() => {
    const initializeComponent = async () => {
      // Wait for searchParams and auth data to be ready
      await delay(5000); // 500ms delay to ensure everything is loaded

      if (searchParams && (DataAuth || localStorage.getItem("authData"))) {
        setIsInitialized(true);
      }
    };

    initializeComponent();
  }, [searchParams, DataAuth]);

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Calendar events state
  const [calendarEvents, setCalendarEvents] = useState<EventInterface[]>([]);

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId && isInitialized) {
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
  }, [DataAuth, RefreshData, projectId, isInitialized]);

  // Fetch application data when project is loaded
  useEffect(() => {
    if (
      DataAuth &&
      DataAuth.team &&
      DataProject &&
      !DataApps &&
      isInitialized
    ) {
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
  }, [DataAuth, DataProject, tokenData, isInitialized]);

  // Initialize calendar events
  useEffect(() => {
    const initializeCalendarEvents = () => {
      const projectStartDate = DataProject?.projectRegisterDate || "2024-01-15";
      const startDate = new Date(projectStartDate);

      const events: EventInterface[] = [
        {
          title: "Project Kickoff",
          start: projectStartDate,
          allDay: true,
          color: "#38A169", // green
        },
        {
          title: "Requirements Review",
          start: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          allDay: true,
          color: "#3182CE", // blue
        },
        {
          title: "Design Phase",
          start: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          color: "#805AD5", // purple
        },
        {
          title: "Development Sprint 1",
          start: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date(startDate.getTime() + 35 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          color: "#DD6B20", // orange
        },
        {
          title: "Team Meeting",
          start:
            new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0] + "T10:00:00",
          end:
            new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0] + "T11:00:00",
          color: "#E53E3E", // red
        },
        {
          title: "Testing Phase",
          start: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          color: "#D69E2E", // yellow
        },
      ];
      setCalendarEvents(events);
    };

    if (DataProject) {
      initializeCalendarEvents();
    }
  }, [DataProject]);

  // Calendar event click handler
  const handleCalendarEventClick = (eventClickInfo: EventClickArg) => {
    console.log("Event clicked:", eventClickInfo.event);
    // You can add more functionality here like showing event details
  };

  // Show loading screen until initialized
  if (!isInitialized) {
    return (
      <LayoutAdmin>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="80vh"
        >
          <VStack spacing={6}>
            <LoadingMiniSquare />
            <VStack spacing={2}>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
              >
                Initializing Project Manager
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "light" ? "gray.500" : "gray.500"}
              >
                Please wait while we prepare your project details...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      {/* Modern Enhanced Header with Custom Gradient */}
      <Box
        bgGradient={"linear(to-br, secondary.800, secondary.600)"}
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        mx={{ base: 2, md: 4 }}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="xl"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient:
            "linear(45deg, whiteAlpha.100 0%, transparent 50%, whiteAlpha.150 100%)",
          zIndex: 0,
        }}
      >
        {/* {/* BJB Logo in Bottom Right Corner - Responsive} */}
        <Box
          position="absolute"
          bottom={{ base: 2, md: 4 }}
          right={{ base: 4, md: 6 }}
          zIndex={3}
          opacity={0.7}
          _hover={{ opacity: 1 }}
          transition="opacity 0.2s ease"
        >
          <Box
            as="img"
            src="/img/logo-bjb-black-wing.svg"
            alt="BJB Logo"
            w={{ base: "40px", md: "60px" }}
            h="auto"
            filter="brightness(0) invert(1)"
          />
        </Box>

        {/* {/* Main Header Content} */}
        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          {/* // {/* Compact Top Navigation} */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Link href={"/projects-manager"}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    bg: "whiteAlpha.200",
                    borderColor: "whiteAlpha.300",
                    transform: "translateY(-1px)",
                  }}
                  rounded="full"
                  px={4}
                  transition="all 0.2s ease"
                >
                  Back
                </Button>
              </Link>

              <Link
                href={`/projects-manager/development?projectId=${projectId}`}
              >
                <Button
                  leftIcon={<FiCode />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    bg: "whiteAlpha.200",
                    borderColor: "whiteAlpha.300",
                    transform: "translateY(-1px)",
                  }}
                  rounded="full"
                  px={4}
                  transition="all 0.2s ease"
                >
                  Dev View
                </Button>
              </Link>
            </HStack>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiHeart />}
                variant="ghost"
                size="sm"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  bg: "pink.400",
                  borderColor: "pink.300",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={3}
                transition="all 0.2s ease"
              >
                Favorite
              </Button>

              <Button
                leftIcon={<FiShare />}
                variant="ghost"
                size="sm"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  bg: "blue.400",
                  borderColor: "blue.300",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={3}
                transition="all 0.2s ease"
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
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: "whiteAlpha.200",
                  borderColor: "whiteAlpha.400",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={3}
                transition="all 0.2s ease"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* // {/* Compact Main Project Information - Responsive} */}
          {DataProject ? (
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 4, md: 6 }}
              align={{ base: "center", md: "start" }}
            >
              {/* // {/* Compact Application Avatar} */}
              <VStack spacing={3} align="center">
                <Box position="relative">
                  <Box
                    w={"75px"}
                    h={"75px"}
                    bgGradient={"linear(to-br, secondary.100, secondary.50)"}
                    rounded={"30%"}
                    display={"flex"}
                    alignItems="center"
                    justifyContent="center"
                    fontSize={"x-large"}
                    fontWeight={"bold"}
                    shadow={"lg"}
                    position="relative"
                    _hover={{
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.2s ease"
                    color={"secondary.800"}
                  >
                    {DataProject?.appsProject?.appShortName ||
                      DataApps?.appShortName ||
                      DataProject.projectName?.charAt(0) ||
                      "A"}
                  </Box>
                </Box>

                <VStack spacing={1} align="center">
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    opacity={0.95}
                    textAlign="center"
                    maxW="100px"
                    lineHeight={1}
                  >
                    {DataProject?.appsProject?.appName ||
                      DataApps?.appName ||
                      "No Application"}
                  </Text>
                </VStack>
              </VStack>

              {/* // {/* Compact Project Details} */}
              <Box flex={1}>
                <VStack spacing={3} align="start">
                  <Heading
                    size="xl"
                    fontWeight="700"
                    bgGradient="linear(to-r, white, whiteAlpha.900)"
                    bgClip="text"
                    lineHeight="shorter"
                  >
                    {DataProject.projectName}
                  </Heading>

                  <HStack spacing={3} wrap="wrap">
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
                      px={2}
                      rounded="full"
                      fontSize="small"
                      fontWeight="semibold"
                      shadow="md"
                      size={"sm"}
                    >
                      {DataProject.projectStatus}
                    </Badge>
                    <Badge
                      colorScheme="purple"
                      variant="solid"
                      px={2}
                      rounded="full"
                      fontSize="small"
                      fontWeight="semibold"
                      shadow="md"
                      size={"sm"}
                    >
                      {DataProject.projectType}
                    </Badge>
                  </HStack>

                  <HStack spacing={6} fontSize="sm" opacity={0.95}>
                    <VStack spacing={0} align="center">
                      <Text fontSize="lg" fontWeight="bold" color="green.200">
                        {DataProject.projectStatusPercentage || 0}%
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        Progress
                      </Text>
                    </VStack>
                    <VStack spacing={0} align="center">
                      <Text fontSize="lg" fontWeight="bold" color="blue.200">
                        {DataProject.userAssignment?.length || 0}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        Team
                      </Text>
                    </VStack>
                    <VStack spacing={0} align="center">
                      <Text fontSize="lg" fontWeight="bold" color="orange.200">
                        {DataProject.projectRegisterDate
                          ? calculateDurationInDays(
                              DataProject.projectRegisterDate,
                              new Date().toISOString()
                            )
                          : 0}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        Days
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>

              {/* // {/* Compact Team & Progress} */}
              <VStack spacing={3} align="center" minW="120px">
                {DataProject.userAssignment &&
                  DataProject.userAssignment.length > 0 && (
                    <AvatarGroup size={"sm"} max={4} spacing="-0.5rem">
                      {DataProject.userAssignment
                        .slice(0, 5)
                        .map((assignment, index) => (
                          <Avatar
                            key={index}
                            name={assignment.userData?.nama || "User"}
                            src={assignment.userData?.profilePict || undefined}
                            border="2px solid white"
                            shadow={"md"}
                            _hover={{
                              transform: "scale(1.05)",
                              zIndex: 10,
                            }}
                            transition="all 0.2s ease"
                          />
                        ))}
                    </AvatarGroup>
                  )}

                <VStack spacing={2} align="center">
                  <Progress
                    value={DataProject.projectStatusPercentage || 0}
                    size="md"
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.200"
                    rounded="full"
                    w="80px"
                    shadow="inner"
                  />
                  <Text fontSize="sm" fontWeight="bold" opacity={0.9}>
                    {DataProject.projectStatusPercentage || 0}%
                  </Text>
                </VStack>
              </VStack>
            </Stack>
          ) : (
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 4, md: 6 }}
              align="center"
              py={4}
            >
              <Box>
                <LoadingMiniSquare />
              </Box>
              <Box flex={1}>
                <Heading size="xl" color="whiteAlpha.800" fontWeight="700">
                  Just a moment...
                </Heading>
                <Text opacity={0.8} fontSize="sm" mt={1}>
                  Please wait while we fetch project details
                </Text>
              </Box>
            </Stack>
          )}
        </VStack>
      </Box>

      {/* // {/* Main Content Container - Fixed Responsive Layout} */}
      <Box px={{ base: 2, md: 4 }} w="full" maxW="100vw" overflow="hidden">
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: 4, md: 6 }}
          align="stretch"
          w="full"
        >
          {/* // {/* Main Content Area} */}
          <Box flex="1" minW="0" w={{ base: "full", lg: "auto" }}>
            <Card
              shadow="xl"
              rounded={radiusStyle}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              overflow="hidden"
              _hover={{
                shadow: "2xl",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s ease"
            >
              <CardBody p={0}>
                <Tabs variant="unstyled" colorScheme="secondary" size={"lg"}>
                  <TabList gap={2} p={4} overflowX={"auto"}>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiTarget size={16} />
                        <Text>Overview</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiInfo size={16} />
                        <Text>Details</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiCpu size={16} />
                        <Text>Features</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiBriefcase size={16} />
                        <Text>Documentations</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiUsers size={16} />
                        <Text>Team</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiBarChart size={16} />
                        <Text>Analytics</Text>
                      </HStack>
                    </TabButtonCustomStyle>

                    <TabButtonCustomStyle>
                      <HStack>
                        <FiCalendar size={16} />
                        <Text>Timeline</Text>
                      </HStack>
                    </TabButtonCustomStyle>

                    <TabButtonCustomStyle>
                      <HStack>
                        <FiSettings size={16} />
                        <Text>Edit</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                  </TabList>

                  <TabPanels
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    roundedBottom={radiusStyle}
                    minH="600px"
                  >
                    <OverviewTab DataProject={DataProject} />
                    <DetailsTab DataProject={DataProject} />
                    <FeaturesTab DataProject={DataProject} />
                    <DocumentationTab DataProject={DataProject} />
                    <TeamTab DataProject={DataProject} />
                    <AnalyticsTab DataProject={DataProject} />
                    <TimelineTab DataProject={DataProject} />
                    <EditTab DataProject={DataProject} />
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* // {/* Sidebar - Responsive} */}
          <Box w={{ base: "full", lg: "300px" }} flexShrink={0}>
            <VStack spacing={{ base: 4, md: 6 }}>
              {/* // {/* Application Information Card - Launcher Style} */}
              {DataProject?.appsProject && (
                <Card
                  w="full"
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor="gray.200"
                  bgGradient="linear(to-b, secondary.500, secondary.800)"
                  color="white"
                  _hover={{
                    shadow: "xl",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s ease"
                  overflow="hidden"
                  position="relative"
                >
                  {/* // {/* BJB Logo Background Overlay - Responsive} */}
                  <Box
                    position="absolute"
                    top={{ base: "-5px", md: "-10px" }}
                    right={{ base: "-20px", md: "-40px" }}
                    zIndex={0}
                    opacity={0.08}
                    transform="rotate(15deg)"
                  >
                    <Box
                      as="img"
                      src="/img/logo-bjb-black-wing.svg"
                      alt="BJB Logo Background"
                      w={{ base: "180px", md: "240px" }}
                      h="auto"
                      filter="brightness(0) invert(1)"
                    />
                  </Box>

                  {/* // {/* Floating Decorative Elements} */}
                  <Box
                    position="absolute"
                    top="15%"
                    right="10%"
                    w={6}
                    h={6}
                    bg="whiteAlpha.100"
                    rounded="full"
                    blur="sm"
                    animation="pulse 3s ease-in-out infinite"
                  />
                  <Box
                    position="absolute"
                    bottom="20%"
                    left="8%"
                    w={4}
                    h={4}
                    bg="whiteAlpha.120"
                    transform="rotate(45deg)"
                    rounded="sm"
                    animation="spin 10s linear infinite"
                  />

                  <CardBody
                    p={{ base: 6, md: 8 }}
                    position="relative"
                    zIndex={1}
                  >
                    <VStack spacing={{ base: 4, md: 6 }} align="center">
                      {/* // {/* App Icon - Launcher Style} */}
                      <Box position="relative">
                        {/* {/* Glowing Ring Effect} */}
                        <Box
                          position="absolute"
                          top="-6px"
                          left="-6px"
                          right="-6px"
                          bottom="-6px"
                          bgGradient="linear(45deg, whiteAlpha.300, whiteAlpha.100)"
                          rounded="3xl"
                          blur="md"
                          opacity={0.8}
                          animation="pulse 2s ease-in-out infinite"
                        />

                        {/* // {/* Main App Icon} */}
                        <Box
                          w={{ base: 16, md: 20 }}
                          h={{ base: 16, md: 20 }}
                          bgGradient="linear(135deg, whiteAlpha.200, whiteAlpha.400)"
                          rounded="3xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="bold"
                          shadow="2xl"
                          border="3px solid"
                          borderColor="whiteAlpha.300"
                          backdropFilter="blur(10px)"
                          position="relative"
                          _hover={{
                            transform: "scale(1.05)",
                            shadow: "3xl",
                          }}
                          transition="all 0.3s ease"
                        >
                          {DataProject.appsProject.iconApps ? (
                            <img
                              src={DataProject.appsProject.iconApps}
                              alt="App Icon"
                              style={{
                                width: "60%",
                                height: "60%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Text color="white" fontSize="2xl">
                              {DataProject.appsProject.appName?.charAt(0) ||
                                "A"}
                            </Text>
                          )}
                        </Box>

                        {/* // {/* Status Indicator Dot} */}
                        <Box
                          position="absolute"
                          top={-1}
                          right={-1}
                          w={6}
                          h={6}
                          bg={
                            DataProject.appsProject.appsStatus === "ACTIVE"
                              ? "green.400"
                              : DataProject.appsProject.appsStatus ===
                                "DEVELOPMENT"
                              ? "blue.400"
                              : DataProject.appsProject.appsStatus === "TESTING"
                              ? "orange.400"
                              : "red.400"
                          }
                          rounded="full"
                          border="2px solid white"
                          shadow="md"
                          animation="pulse 2s ease-in-out infinite"
                        />
                      </Box>

                      {/* // {/* App Name - Launcher Style} */}
                      <VStack spacing={2} align="center">
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color="white"
                          textAlign="center"
                          lineHeight="shorter"
                          noOfLines={2}
                          maxW="200px"
                        >
                          {DataProject.appsProject.appName}
                        </Text>

                        {/* // {/* App Short Name Badge} */}
                        <Badge
                          bg="whiteAlpha.200"
                          color="white"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="xs"
                          fontWeight="bold"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                        >
                          {DataProject.appsProject.appShortName}
                        </Badge>
                      </VStack>

                      {/* // {/* App Details Grid - Responsive} */}
                      <SimpleGrid
                        columns={{ base: 1, sm: 2 }}
                        spacing={4}
                        w="full"
                      >
                        {/* // {/* Status} */}
                        <VStack spacing={1} align="center">
                          <Text
                            fontSize="xs"
                            color="whiteAlpha.700"
                            fontWeight="medium"
                          >
                            STATUS
                          </Text>
                          <Badge
                            colorScheme={
                              DataProject.appsProject.appsStatus === "ACTIVE"
                                ? "green"
                                : DataProject.appsProject.appsStatus ===
                                  "DEVELOPMENT"
                                ? "blue"
                                : DataProject.appsProject.appsStatus ===
                                  "TESTING"
                                ? "orange"
                                : "red"
                            }
                            size="sm"
                            px={2}
                            py={1}
                            rounded="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {DataProject.appsProject.appsStatus}
                          </Badge>
                        </VStack>

                        {/* // {/* App Code} */}
                        <VStack spacing={1} align="center">
                          <Text
                            fontSize="xs"
                            color="whiteAlpha.700"
                            fontWeight="medium"
                          >
                            CODE
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="white"
                            fontFamily="mono"
                          >
                            {DataProject.appsProject.appCode}
                          </Text>
                        </VStack>
                      </SimpleGrid>

                      {/* // {/* Project Connection Info} */}
                      <Box
                        bg="whiteAlpha.100"
                        backdropFilter="blur(10px)"
                        p={3}
                        rounded="lg"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        w="full"
                      >
                        <VStack spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text
                              fontSize="xs"
                              color="whiteAlpha.700"
                              fontWeight="medium"
                            >
                              PROJECT
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="white">
                              {DataProject.projectName}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text
                              fontSize="xs"
                              color="whiteAlpha.700"
                              fontWeight="medium"
                            >
                              CATEGORY
                            </Text>
                            <Badge
                              bg="whiteAlpha.200"
                              color="white"
                              size="xs"
                              px={2}
                              py={1}
                              rounded="full"
                              fontSize="xs"
                            >
                              {DataProject.projectCategory}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Box>

                      {/* // {/* Quick Actions - Responsive} */}
                      <Stack
                        direction={{ base: "column", sm: "row" }}
                        spacing={3}
                        w="full"
                      >
                        <Button
                          size="sm"
                          bg="whiteAlpha.200"
                          color="white"
                          _hover={{ bg: "whiteAlpha.300" }}
                          rounded="full"
                          leftIcon={<FiExternalLink />}
                          flex={1}
                        >
                          Launch
                        </Button>
                        <Button
                          size="sm"
                          bg="whiteAlpha.200"
                          color="white"
                          _hover={{ bg: "whiteAlpha.300" }}
                          rounded="full"
                          leftIcon={<FiSettings />}
                          flex={1}
                        >
                          Settings
                        </Button>
                      </Stack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* // {/* Project Info Card} */}
              <Card
                w="full"
                shadow="lg"
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _hover={{
                  shadow: "xl",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
              >
                <CardHeader
                  bg={colorMode === "light" ? "blue.50" : "gray.700"}
                  roundedTop={radiusStyle}
                  borderBottom="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                >
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
                      <FiInfo size={16} color="white" />
                    </Box>
                    <Heading size="sm" color="blue.700">
                      Project Info
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
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

              {/* // {/* Quick Actions Card} */}
              <Card
                w="full"
                shadow="lg"
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _hover={{
                  shadow: "xl",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
              >
                <CardHeader
                  bg={colorMode === "light" ? "green.50" : "gray.700"}
                  roundedTop={radiusStyle}
                  borderBottom="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                >
                  <HStack spacing={3}>
                    <Box
                      w={8}
                      h={8}
                      bgGradient="linear(135deg, green.400, green.600)"
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FiZap size={16} color="white" />
                    </Box>
                    <Heading size="sm" color="green.700">
                      Quick Actions
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={3}>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiActivity />}
                      rounded={radiusStyle}
                      _hover={{
                        bg: "blue.50",
                        color: "blue.600",
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      View Activity
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiSettings />}
                      rounded={radiusStyle}
                      _hover={{
                        bg: "orange.50",
                        color: "orange.600",
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      Settings
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiBarChart />}
                      rounded={radiusStyle}
                      _hover={{
                        bg: "purple.50",
                        color: "purple.600",
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      Reports
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </Stack>
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
                        {/* // {/* APPS DETAILS} */}
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

function ProjectManagerDetailWithSuspense() {
  return (
    <Suspense>
      <ProjectManagerDetail />
    </Suspense>
  );
}

export default ProjectManagerDetailWithSuspense;
