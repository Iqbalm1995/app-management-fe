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
  FiExternalLink,
  FiCode,
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
  breadCrumb: ["Home", "Project Development", "Detail"],
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

  // Calendar events state
  const [calendarEvents, setCalendarEvents] = useState<EventInterface[]>([]);

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
            breadCrumb: ["Home", "Project Development", itemsData.projectCode],
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
          start: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          allDay: true,
          color: "#3182CE", // blue
        },
        {
          title: "Design Phase",
          start: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: "#805AD5", // purple
        },
        {
          title: "Development Sprint 1",
          start: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(startDate.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: "#DD6B20", // orange
        },
        {
          title: "Team Meeting",
          start: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T10:00:00",
          end: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T11:00:00",
          color: "#E53E3E", // red
        },
        {
          title: "Testing Phase",
          start: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  return (
    <LayoutAdmin>
      {/* Modern Enhanced Header with Custom Gradient */}
      <Box
        bgGradient="linear(135deg, #0B79CA 0%, #0078FF 50%, #EDC817 100%)"
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
        {/* Simplified Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.06}
          bgImage="radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)"
          bgSize="80px 80px, 80px 80px"
        />

        {/* Reduced Floating Elements */}
        <Box
          position="absolute"
          top="15%"
          right="10%"
          w={8}
          h={8}
          bg="whiteAlpha.100"
          rounded="full"
          blur="sm"
          animation="pulse 4s ease-in-out infinite"
        />
        <Box
          position="absolute"
          bottom="20%"
          left="8%"
          w={6}
          h={6}
          bg="whiteAlpha.120"
          transform="rotate(45deg)"
          rounded="md"
          animation="spin 15s linear infinite"
        />

        {/* BJB Logo in Bottom Right Corner - Responsive */}
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

        {/* Main Header Content */}
        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          {/* Compact Top Navigation */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Link href={"/project-development"}>
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

              <Link href={`/project-development/development?projectId=${projectId}`}>
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

          {/* Compact Main Project Information - Responsive */}
          {DataProject ? (
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 4, md: 6 }}
              align={{ base: "center", md: "start" }}
            >
              {/* Compact Application Avatar */}
              <VStack spacing={3} align="center">
                <Box position="relative">
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(135deg, blue.300, purple.400, pink.300)"
                    rounded="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xl"
                    fontWeight="bold"
                    shadow="lg"
                    border="3px solid"
                    borderColor="whiteAlpha.300"
                    backdropFilter="blur(10px)"
                    position="relative"
                    _hover={{
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.2s ease"
                  >
                    {DataProject?.appsProject?.appName?.charAt(0) ||
                      DataApps?.appName?.charAt(0) ||
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
                    noOfLines={1}
                  >
                    {DataProject?.appsProject?.appName ||
                      DataApps?.appName ||
                      "Application"}
                  </Text>
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
                    fontWeight="bold"
                  >
                    {DataProject?.appsProject?.appsStatus ||
                      DataApps?.appsStatus ||
                      "Unknown"}
                  </Badge>
                </VStack>
              </VStack>

              {/* Compact Project Details */}
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
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                      fontWeight="semibold"
                      shadow="md"
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
                      shadow="md"
                    >
                      {DataProject.projectType}
                    </Badge>
                  </HStack>

                  <Box
                    bg="whiteAlpha.100"
                    backdropFilter="blur(10px)"
                    p={3}
                    rounded="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    maxW="500px"
                  >
                    <Text
                      fontSize="sm"
                      opacity={0.95}
                      lineHeight="base"
                      noOfLines={2}
                    >
                      {DataProject.projectDesc ||
                        "Modern application with advanced features and best practices implementation."}
                    </Text>
                  </Box>

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

              {/* Compact Team & Progress */}
              <VStack spacing={3} align="center" minW="120px">
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
              <Box
                w={16}
                h={16}
                bg="whiteAlpha.200"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                backdropFilter="blur(10px)"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <LoadingMiniSignature />
              </Box>
              <Box flex={1}>
                <Heading size="xl" color="whiteAlpha.800" fontWeight="700">
                  Loading project...
                </Heading>
                <Text opacity={0.8} fontSize="sm" mt={1}>
                  Please wait while we fetch project details
                </Text>
              </Box>
            </Stack>
          )}
        </VStack>
      </Box>

      {/* Main Content Container - Fixed Responsive Layout */}
      <Box px={{ base: 2, md: 4 }} w="full" maxW="100vw" overflow="hidden">
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: 4, md: 6 }}
          align="stretch"
          w="full"
        >
          {/* Main Content Area */}
          <Box flex="1" minW="0" w={{ base: "full", lg: "auto" }}>
            <Card
              shadow="xl"
              rounded={radiusStyle}
              border="1px"
              borderColor="gray.200"
              bg="white"
              overflow="hidden"
              _hover={{
                shadow: "2xl",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s ease"
            >
              <CardBody p={0}>
                <Tabs variant="unstyled" colorScheme="blue">
                  <TabList
                    bg="white"
                    px={6}
                    py={4}
                    borderBottom="1px"
                    borderColor="gray.200"
                    roundedTop={radiusStyle}
                    gap={2}
                  >
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white",
                        },
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiTarget size={16} />
                        </Box>
                        <Text>Overview</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white",
                        },
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiInfo size={16} />
                        </Box>
                        <Text>Details</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      isDisabled={!DataProject}
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white",
                        },
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: {
                          bg: "gray.100",
                          color: "gray.400",
                        },
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiCpu size={16} />
                        </Box>
                        <Text>Features</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      isDisabled={!DataProject}
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white",
                        },
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: {
                          bg: "gray.100",
                          color: "gray.400",
                        },
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiUsers size={16} />
                        </Box>
                        <Text>Team</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      isDisabled={!DataProject}
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white",
                        },
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: {
                          bg: "gray.100",
                          color: "gray.400",
                        },
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiBarChart size={16} />
                        </Box>
                        <Text>Analytics</Text>
                      </HStack>
                    </Tab>

                    {/* Timeline Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg="gray.100"
                      color="gray.600"
                      _selected={{
                        color: "white",
                        bg: "blue.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "blue.100",
                        color: "gray.800",
                        _selected: {
                          bg: "purple.500",
                          color: "white"
                        }
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box
                          w={5}
                          h={5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiCalendar size={16} />
                        </Box>
                        <Text>Timeline</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels
                    bg="white"
                    roundedBottom={radiusStyle}
                    minH="600px"
                  >
                    {/* Overview Tab */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack spacing={8} align="stretch">
                        <HStack justify="space-between" align="center">
                          <Heading size="lg" color="gray.800">
                            Project Overview
                          </Heading>
                          <Badge
                            colorScheme="blue"
                            px={4}
                            py={2}
                            rounded="full"
                            fontSize="md"
                          >
                            Dashboard
                          </Badge>
                        </HStack>

                        {DataProject ? (
                          <>
                            {/* Enhanced Quick Stats Cards */}
                            <SimpleGrid
                              columns={{ base: 2, md: 4 }}
                              spacing={6}
                            >
                              {/* Progress Card */}
                              <Card
                                bg="blue.50"
                                textAlign="center"
                                shadow="lg"
                                rounded="xl"
                                border="2px"
                                borderColor="blue.200"
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="blue.600"
                                  >
                                    {DataProject.projectStatusPercentage || 0}%
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="green.600"
                                  >
                                    {DataProject.userAssignment?.length || 0}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    {DataProject.projectRegisterDate
                                      ? calculateDurationInDays(
                                          DataProject.projectRegisterDate,
                                          new Date().toISOString()
                                        )
                                      : 0}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="purple.600"
                                  >
                                    {DataProject.projectStatus === "ACTIVE"
                                      ? "Active"
                                      : "Inactive"}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
                                    Status
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Charts Section */}
                            <SimpleGrid
                              columns={{ base: 1, lg: 2 }}
                              spacing={6}
                            >
                              {/* Progress Chart */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="blue.700">
                                      Project Progress
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="radialBar"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: "radialBar",
                                          toolbar: { show: false },
                                        },
                                        plotOptions: {
                                          radialBar: {
                                            startAngle: -90,
                                            endAngle: 90,
                                            hollow: {
                                              margin: 15,
                                              size: "70%",
                                            },
                                            dataLabels: {
                                              name: {
                                                offsetY: -10,
                                                show: true,
                                                color: "#888",
                                                fontSize: "17px",
                                              },
                                              value: {
                                                offsetY: 16,
                                                color: "#111",
                                                fontSize: "36px",
                                                show: true,
                                              },
                                            },
                                          },
                                        },
                                        fill: {
                                          type: "gradient",
                                          gradient: {
                                            shade: "light",
                                            shadeIntensity: 0.4,
                                            inverseColors: false,
                                            opacityFrom: 1,
                                            opacityTo: 1,
                                            stops: [0, 50, 53, 91],
                                          },
                                        },
                                        labels: ["Progress"],
                                        colors: ["#3182CE"],
                                      }}
                                      series={[
                                        Number(
                                          DataProject?.projectStatusPercentage ||
                                            0
                                        ),
                                      ]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Task Distribution Chart (Dummy Data) */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="green.700">
                                      Task Distribution
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="donut"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: "donut",
                                          toolbar: { show: false },
                                        },
                                        labels: [
                                          "Completed",
                                          "In Progress",
                                          "Pending",
                                          "On Hold",
                                        ],
                                        colors: [
                                          "#38A169",
                                          "#3182CE",
                                          "#ED8936",
                                          "#E53E3E",
                                        ],
                                        legend: {
                                          position: "bottom",
                                          horizontalAlign: "center",
                                        },
                                        plotOptions: {
                                          pie: {
                                            donut: {
                                              size: "65%",
                                            },
                                          },
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          formatter: function (val: number) {
                                            return Math.round(val) + "%";
                                          },
                                        },
                                        responsive: [
                                          {
                                            breakpoint: 480,
                                            options: {
                                              chart: {
                                                width: 200,
                                              },
                                              legend: {
                                                position: "bottom",
                                              },
                                            },
                                          },
                                        ],
                                      }}
                                      series={[45, 30, 15, 10]} // Dummy data
                                    />
                                  </Box>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Additional Information Cards */}
                            <SimpleGrid
                              columns={{ base: 1, md: 3 }}
                              spacing={6}
                            >
                              {/* Recent Activity Card */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="sm" color="orange.700">
                                      Recent Activity
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="green.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.600">
                                        Task completed
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="blue.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.600">
                                        Team member added
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="orange.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.600">
                                        Status updated
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="purple.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.600">
                                        Feature deployed
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Milestones Card */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="sm" color="purple.700">
                                      Milestones
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Planning
                                      </Text>
                                      <Badge colorScheme="green" size="sm">
                                        Done
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Development
                                      </Text>
                                      <Badge colorScheme="blue" size="sm">
                                        Active
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Testing
                                      </Text>
                                      <Badge colorScheme="orange" size="sm">
                                        Pending
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Deployment
                                      </Text>
                                      <Badge colorScheme="gray" size="sm">
                                        Waiting
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Quick Actions Card */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="sm" color="blue.700">
                                      Quick Actions
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={2}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      w="full"
                                      justifyContent="flex-start"
                                      leftIcon={<FiUsers />}
                                    >
                                      Add Team Member
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      w="full"
                                      justifyContent="flex-start"
                                      leftIcon={<FiCpu />}
                                    >
                                      Create Feature
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      w="full"
                                      justifyContent="flex-start"
                                      leftIcon={<FiBarChart />}
                                    >
                                      View Reports
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      w="full"
                                      justifyContent="flex-start"
                                      leftIcon={<FiSettings />}
                                    >
                                      Project Settings
                                    </Button>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Project Description - Enhanced */}
                            <Card
                              shadow="lg"
                              rounded="xl"
                              border="1px"
                              borderColor="gray.100"
                            >
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
                                  <Heading size="md" color="gray.700">
                                    Project Description
                                  </Heading>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <Text
                                  color="gray.600"
                                  lineHeight="tall"
                                  fontSize="md"
                                >
                                  {DataProject.projectDesc ||
                                    "No description available for this project. Consider adding a detailed description to help team members understand the project goals and objectives."}
                                </Text>
                                {DataProject.projectDesc && (
                                  <HStack mt={4} spacing={4}>
                                    <Badge
                                      colorScheme="blue"
                                      px={3}
                                      py={1}
                                      rounded="full"
                                    >
                                      {DataProject.projectCategory}
                                    </Badge>
                                    <Badge
                                      colorScheme="purple"
                                      px={3}
                                      py={1}
                                      rounded="full"
                                    >
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
                            <Text mt={4} color="gray.500">
                              Loading project overview...
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Details Tab */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <Suspense fallback={<LoadingMiniSignature />}>
                        <ProjectInfoSection projectId={projectId} />
                      </Suspense>
                    </TabPanel>

                    {/* Features Tab */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <Suspense fallback={<LoadingMiniSignature />}>
                        <ProjectFeatureView DataProject={DataProject} />
                      </Suspense>
                    </TabPanel>

                    {/* Team Tab */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack spacing={8} align="stretch">
                        {/* Header Section */}
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="lg" color="gray.800">
                              Team Management
                            </Heading>
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
                              _hover={{
                                transform: "translateY(-1px)",
                                shadow: "lg",
                              }}
                            >
                              Add Member
                            </Button>
                          </HStack>
                        </HStack>

                        {DataProject?.userAssignment &&
                        DataProject.userAssignment.length > 0 ? (
                          <>
                            {/* Team Statistics */}
                            <SimpleGrid
                              columns={{ base: 2, md: 4 }}
                              spacing={6}
                            >
                              <Card
                                bg="blue.50"
                                textAlign="center"
                                shadow="lg"
                                rounded="xl"
                                border="2px"
                                borderColor="blue.200"
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="blue.600"
                                  >
                                    {DataProject.userAssignment.length}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="green.600"
                                  >
                                    {
                                      DataProject.userAssignment.filter(
                                        (m) => m.userAssignStatus === "ACTIVE"
                                      ).length
                                    }
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    {Math.round(
                                      (DataProject.userAssignment.filter(
                                        (m) => m.userAssignStatus === "ACTIVE"
                                      ).length /
                                        DataProject.userAssignment.length) *
                                        100
                                    )}
                                    %
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="purple.600"
                                  >
                                    {DataProject.userAssignment.length > 0
                                      ? Math.ceil(
                                          DataProject.userAssignment.length / 2
                                        )
                                      : 0}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
                                    Avg. Load
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Team Members Grid */}
                            <Card
                              shadow="lg"
                              rounded="xl"
                              border="1px"
                              borderColor="gray.100"
                            >
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
                                    <Heading size="md" color="blue.700">
                                      Team Members
                                    </Heading>
                                  </HStack>
                                  <Badge
                                    colorScheme="blue"
                                    px={3}
                                    py={1}
                                    rounded="full"
                                  >
                                    {DataProject.userAssignment.length} Members
                                  </Badge>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <SimpleGrid
                                  columns={{ base: 1, md: 2, lg: 3 }}
                                  spacing={6}
                                >
                                  {DataProject.userAssignment.map(
                                    (member, index) => (
                                      <Card
                                        key={index}
                                        shadow="md"
                                        rounded="xl"
                                        border="1px"
                                        borderColor="gray.200"
                                        _hover={{
                                          transform: "translateY(-4px)",
                                          shadow: "xl",
                                          borderColor: "blue.300",
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
                                                name={
                                                  member.userData?.nama ||
                                                  "User"
                                                }
                                                src={
                                                  member.userData
                                                    ?.profilePict || undefined
                                                }
                                                border="4px solid"
                                                borderColor={
                                                  member.userAssignStatus ===
                                                  "ACTIVE"
                                                    ? "green.200"
                                                    : "gray.200"
                                                }
                                                shadow="lg"
                                              />
                                              <Box
                                                position="absolute"
                                                bottom={0}
                                                right={0}
                                                w={6}
                                                h={6}
                                                bg={
                                                  member.userAssignStatus ===
                                                  "ACTIVE"
                                                    ? "green.400"
                                                    : "gray.400"
                                                }
                                                rounded="full"
                                                border="2px solid white"
                                                shadow="md"
                                              />
                                            </Box>

                                            {/* Member Info */}
                                            <VStack
                                              spacing={2}
                                              textAlign="center"
                                            >
                                              <Text
                                                fontWeight="bold"
                                                fontSize="lg"
                                                color="gray.800"
                                              >
                                                {member.userData?.nama ||
                                                  "Unknown User"}
                                              </Text>
                                              <Text
                                                fontSize="sm"
                                                color="gray.600"
                                              >
                                                {member.userData?.email ||
                                                  "No email"}
                                              </Text>
                                              <Badge
                                                colorScheme={
                                                  member.userAssignStatus ===
                                                  "ACTIVE"
                                                    ? "green"
                                                    : "gray"
                                                }
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
                                            <VStack
                                              spacing={2}
                                              w="full"
                                              pt={2}
                                              borderTop="1px"
                                              borderColor="gray.100"
                                            >
                                              <HStack
                                                justify="space-between"
                                                w="full"
                                              >
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                >
                                                  Role:
                                                </Text>
                                                <Badge
                                                  size="sm"
                                                  colorScheme="purple"
                                                  rounded="md"
                                                >
                                                  {member.userData?.team
                                                    ?.teamName || "Developer"}
                                                </Badge>
                                              </HStack>
                                              <HStack
                                                justify="space-between"
                                                w="full"
                                              >
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                >
                                                  Joined:
                                                </Text>
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.600"
                                                >
                                                  {member.assignDate
                                                    ? new Date(
                                                        member.assignDate
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                                </Text>
                                              </HStack>
                                            </VStack>
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    )
                                  )}
                                </SimpleGrid>
                              </CardBody>
                            </Card>

                            {/* Team Roles Distribution */}
                            <SimpleGrid
                              columns={{ base: 1, lg: 2 }}
                              spacing={6}
                            >
                              {/* Roles Chart */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="green.700">
                                      Team Roles
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="250px">
                                    <Chart
                                      type="pie"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: "pie",
                                          toolbar: { show: false },
                                        },
                                        labels: [
                                          "Developers",
                                          "Designers",
                                          "Managers",
                                          "QA",
                                        ],
                                        colors: [
                                          "#3182CE",
                                          "#38A169",
                                          "#ED8936",
                                          "#E53E3E",
                                        ],
                                        legend: {
                                          position: "bottom",
                                          horizontalAlign: "center",
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          formatter: function (val: number) {
                                            return Math.round(val) + "%";
                                          },
                                        },
                                        responsive: [
                                          {
                                            breakpoint: 480,
                                            options: {
                                              chart: {
                                                width: 200,
                                              },
                                              legend: {
                                                position: "bottom",
                                              },
                                            },
                                          },
                                        ],
                                      }}
                                      series={[60, 20, 15, 5]} // Dummy data for roles
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Team Activity */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="orange.700">
                                      Recent Activity
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="John Doe" />
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex={1}
                                      >
                                        <Text fontSize="sm" fontWeight="medium">
                                          John Doe joined the project
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          2 hours ago
                                        </Text>
                                      </VStack>
                                      <Badge colorScheme="green" size="sm">
                                        New
                                      </Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Jane Smith" />
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex={1}
                                      >
                                        <Text fontSize="sm" fontWeight="medium">
                                          Jane Smith completed a task
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          5 hours ago
                                        </Text>
                                      </VStack>
                                      <Badge colorScheme="blue" size="sm">
                                        Task
                                      </Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Mike Johnson" />
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex={1}
                                      >
                                        <Text fontSize="sm" fontWeight="medium">
                                          Mike Johnson updated status
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          1 day ago
                                        </Text>
                                      </VStack>
                                      <Badge colorScheme="orange" size="sm">
                                        Update
                                      </Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack spacing={3}>
                                      <Avatar size="sm" name="Sarah Wilson" />
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex={1}
                                      >
                                        <Text fontSize="sm" fontWeight="medium">
                                          Sarah Wilson left a comment
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          2 days ago
                                        </Text>
                                      </VStack>
                                      <Badge colorScheme="purple" size="sm">
                                        Comment
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>
                          </>
                        ) : (
                          <Card
                            shadow="lg"
                            rounded="xl"
                            border="1px"
                            borderColor="gray.100"
                          >
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
                                  <Heading size="md" color="gray.600">
                                    No Team Members
                                  </Heading>
                                  <Text
                                    color="gray.500"
                                    fontSize="sm"
                                    maxW="400px"
                                  >
                                    This project doesn't have any team members
                                    assigned yet. Start building your team by
                                    adding members to collaborate on this
                                    project.
                                  </Text>
                                </VStack>
                                <Button
                                  colorScheme="blue"
                                  size="lg"
                                  leftIcon={<FiUsers />}
                                  rounded="full"
                                  shadow="lg"
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    shadow: "xl",
                                  }}
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
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack spacing={8} align="stretch">
                        {/* Header Section */}
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="lg" color="gray.800">
                              Project Analytics
                            </Heading>
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
                              _hover={{
                                transform: "translateY(-1px)",
                                shadow: "lg",
                              }}
                            >
                              Export Report
                            </Button>
                          </HStack>
                        </HStack>

                        {DataProject ? (
                          <>
                            {/* Key Performance Indicators */}
                            <SimpleGrid
                              columns={{ base: 2, md: 4 }}
                              spacing={6}
                            >
                              {/* Completion Rate */}
                              <Card
                                bg="blue.50"
                                textAlign="center"
                                shadow="lg"
                                rounded="xl"
                                border="2px"
                                borderColor="blue.200"
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="blue.600"
                                  >
                                    {DataProject.projectStatusPercentage || 0}%
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="green.600"
                                  >
                                    {DataProject.userAssignment?.length
                                      ? Math.round(
                                          (DataProject.projectStatusPercentage ||
                                            0) /
                                            DataProject.userAssignment.length
                                        )
                                      : 0}
                                    %
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    {DataProject.projectRegisterDate
                                      ? calculateDurationInDays(
                                          DataProject.projectRegisterDate,
                                          new Date().toISOString()
                                        )
                                      : 0}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
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
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "xl",
                                }}
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
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color="purple.600"
                                  >
                                    {Math.min(
                                      95,
                                      Math.max(
                                        70,
                                        (DataProject.projectStatusPercentage ||
                                          0) + 15
                                      )
                                    )}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    fontWeight="medium"
                                  >
                                    Quality Score
                                  </Text>
                                  <Text fontSize="xs" color="green.500" mt={1}>
                                    Excellent
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Charts Section */}
                            <SimpleGrid
                              columns={{ base: 1, lg: 2 }}
                              spacing={6}
                            >
                              {/* Progress Timeline Chart */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="blue.700">
                                      Progress Timeline
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="line"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: "line",
                                          toolbar: { show: false },
                                          zoom: { enabled: false },
                                        },
                                        stroke: {
                                          curve: "smooth",
                                          width: 3,
                                        },
                                        colors: ["#3182CE"],
                                        xaxis: {
                                          categories: [
                                            "Week 1",
                                            "Week 2",
                                            "Week 3",
                                            "Week 4",
                                            "Week 5",
                                            "Week 6",
                                          ],
                                          labels: {
                                            style: {
                                              colors: "#718096",
                                            },
                                          },
                                        },
                                        yaxis: {
                                          min: 0,
                                          max: 100,
                                          labels: {
                                            formatter: function (val: number) {
                                              return val + "%";
                                            },
                                            style: {
                                              colors: "#718096",
                                            },
                                          },
                                        },
                                        grid: {
                                          borderColor: "#E2E8F0",
                                          strokeDashArray: 3,
                                        },
                                        markers: {
                                          size: 6,
                                          colors: ["#3182CE"],
                                          strokeColors: "#fff",
                                          strokeWidth: 2,
                                        },
                                        tooltip: {
                                          y: {
                                            formatter: function (val: number) {
                                              return val + "% completed";
                                            },
                                          },
                                        },
                                      }}
                                      series={[
                                        {
                                          name: "Progress",
                                          data: [
                                            10,
                                            25,
                                            45,
                                            60,
                                            75,
                                            DataProject.projectStatusPercentage ||
                                              0,
                                          ],
                                        },
                                      ]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>

                              {/* Team Performance Chart */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="md" color="green.700">
                                      Team Performance
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                  <Box h="300px">
                                    <Chart
                                      type="bar"
                                      height="100%"
                                      options={{
                                        chart: {
                                          type: "bar",
                                          toolbar: { show: false },
                                        },
                                        colors: [
                                          "#38A169",
                                          "#3182CE",
                                          "#ED8936",
                                        ],
                                        xaxis: {
                                          categories: [
                                            "Tasks Completed",
                                            "In Progress",
                                            "Pending",
                                          ],
                                          labels: {
                                            style: {
                                              colors: "#718096",
                                            },
                                          },
                                        },
                                        yaxis: {
                                          labels: {
                                            style: {
                                              colors: "#718096",
                                            },
                                          },
                                        },
                                        grid: {
                                          borderColor: "#E2E8F0",
                                          strokeDashArray: 3,
                                        },
                                        plotOptions: {
                                          bar: {
                                            borderRadius: 8,
                                            horizontal: false,
                                            columnWidth: "60%",
                                          },
                                        },
                                        dataLabels: {
                                          enabled: true,
                                          style: {
                                            colors: ["#fff"],
                                          },
                                        },
                                      }}
                                      series={[
                                        {
                                          name: "Tasks",
                                          data: [45, 30, 15], // Dummy data
                                        },
                                      ]}
                                    />
                                  </Box>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Detailed Analytics Cards */}
                            <SimpleGrid
                              columns={{ base: 1, md: 3 }}
                              spacing={6}
                            >
                              {/* Performance Insights */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="sm" color="orange.700">
                                      Performance Insights
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Velocity
                                      </Text>
                                      <HStack spacing={2}>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          color="green.600"
                                        >
                                          +12%
                                        </Text>
                                        <FiTrendingUp size={14} color="green" />
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Code Quality
                                      </Text>
                                      <HStack spacing={2}>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          color="blue.600"
                                        >
                                          95%
                                        </Text>
                                        <Badge colorScheme="blue" size="sm">
                                          Excellent
                                        </Badge>
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Bug Rate
                                      </Text>
                                      <HStack spacing={2}>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          color="green.600"
                                        >
                                          0.2%
                                        </Text>
                                        <Badge colorScheme="green" size="sm">
                                          Low
                                        </Badge>
                                      </HStack>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Test Coverage
                                      </Text>
                                      <HStack spacing={2}>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          color="blue.600"
                                        >
                                          87%
                                        </Text>
                                        <Badge colorScheme="blue" size="sm">
                                          Good
                                        </Badge>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Resource Utilization */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                    <Heading size="sm" color="purple.700">
                                      Resource Utilization
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={4} align="stretch">
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">
                                          Team Capacity
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold">
                                          85%
                                        </Text>
                                      </HStack>
                                      <Progress
                                        value={85}
                                        colorScheme="purple"
                                        size="sm"
                                        rounded="full"
                                      />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">
                                          Budget Used
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold">
                                          72%
                                        </Text>
                                      </HStack>
                                      <Progress
                                        value={72}
                                        colorScheme="blue"
                                        size="sm"
                                        rounded="full"
                                      />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">
                                          Time Allocated
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold">
                                          68%
                                        </Text>
                                      </HStack>
                                      <Progress
                                        value={68}
                                        colorScheme="green"
                                        size="sm"
                                        rounded="full"
                                      />
                                    </VStack>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="gray.600">
                                          Resources
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold">
                                          91%
                                        </Text>
                                      </HStack>
                                      <Progress
                                        value={91}
                                        colorScheme="orange"
                                        size="sm"
                                        rounded="full"
                                      />
                                    </VStack>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Risk Assessment */}
                              <Card
                                shadow="lg"
                                rounded="xl"
                                border="1px"
                                borderColor="gray.100"
                              >
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
                                      <FiAlertTriangle
                                        size={16}
                                        color="white"
                                      />
                                    </Box>
                                    <Heading size="sm" color="red.700">
                                      Risk Assessment
                                    </Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody p={4}>
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Schedule Risk
                                      </Text>
                                      <Badge colorScheme="green" size="sm">
                                        Low
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Budget Risk
                                      </Text>
                                      <Badge colorScheme="yellow" size="sm">
                                        Medium
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Technical Risk
                                      </Text>
                                      <Badge colorScheme="green" size="sm">
                                        Low
                                      </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" color="gray.600">
                                        Resource Risk
                                      </Text>
                                      <Badge colorScheme="green" size="sm">
                                        Low
                                      </Badge>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between">
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="gray.700"
                                      >
                                        Overall Risk
                                      </Text>
                                      <Badge
                                        colorScheme="green"
                                        size="sm"
                                        px={3}
                                        py={1}
                                      >
                                        LOW RISK
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Recommendations */}
                            <Card
                              shadow="lg"
                              rounded="xl"
                              border="1px"
                              borderColor="gray.100"
                            >
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
                                  <Heading size="md" color="blue.700">
                                    AI-Powered Recommendations
                                  </Heading>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <SimpleGrid
                                  columns={{ base: 1, md: 2 }}
                                  spacing={6}
                                >
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="green.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="green.600"
                                        >
                                          Optimize team allocation:
                                        </Text>{" "}
                                        Consider redistributing tasks to balance
                                        workload across team members.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="blue.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="blue.600"
                                        >
                                          Increase test coverage:
                                        </Text>{" "}
                                        Add more unit tests to reach the target
                                        of 90% code coverage.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="orange.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="orange.600"
                                        >
                                          Monitor budget:
                                        </Text>{" "}
                                        Current spending rate may exceed budget
                                        by 8% if maintained.
                                      </Text>
                                    </HStack>
                                  </VStack>
                                  <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="purple.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="purple.600"
                                        >
                                          Schedule review:
                                        </Text>{" "}
                                        Plan a milestone review meeting to
                                        assess progress and adjust timeline.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="pink.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="pink.600"
                                        >
                                          Documentation update:
                                        </Text>{" "}
                                        Update project documentation to reflect
                                        recent changes and decisions.
                                      </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                      <Box
                                        w={2}
                                        h={2}
                                        bg="teal.400"
                                        rounded="full"
                                      />
                                      <Text fontSize="sm" color="gray.700">
                                        <Text
                                          as="span"
                                          fontWeight="bold"
                                          color="teal.600"
                                        >
                                          Performance optimization:
                                        </Text>{" "}
                                        Consider implementing caching to improve
                                        application performance.
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
                            <Text mt={4} color="gray.500">
                              Loading analytics data...
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Timeline Tab Panel */}
                    <TabPanel p={0} bg="gray.50" roundedBottom={radiusStyle}>
                      <Box p={8}>
                        <VStack spacing={8} align="stretch">
                          {/* Timeline Header */}
                          <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Heading size="lg" color="gray.800">
                                Project Timeline
                              </Heading>
                              <Text color="gray.600" fontSize="md">
                                Track project milestones and important dates
                              </Text>
                            </VStack>
                            <HStack spacing={3}>
                              <Badge colorScheme="blue" px={3} py={1} rounded="full">
                                {DataProject && DataProject.projectRegisterDate ? 
                                  `${Math.ceil((new Date().getTime() - new Date(DataProject.projectRegisterDate).getTime()) / (1000 * 60 * 60 * 24))} days active`
                                  : "Active"
                                }
                              </Badge>
                              <Badge colorScheme="green" px={3} py={1} rounded="full">
                                On Track
                              </Badge>
                            </HStack>
                          </HStack>

                          {/* Timeline Stats Cards */}
                          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                            <Card bg="white" shadow="md" rounded="xl" border="1px" borderColor="gray.200">
                              <CardBody p={6}>
                                <VStack spacing={3}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bg="blue.100"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiCalendar size={24} color="#3182CE" />
                                  </Box>
                                  <VStack spacing={1} textAlign="center">
                                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                      {DataProject && DataProject.projectRegisterDate ? 
                                        Math.ceil((new Date().getTime() - new Date(DataProject.projectRegisterDate).getTime()) / (1000 * 60 * 60 * 24))
                                        : 45
                                      }
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">Days Active</Text>
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>

                            <Card bg="white" shadow="md" rounded="xl" border="1px" borderColor="gray.200">
                              <CardBody p={6}>
                                <VStack spacing={3}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bg="green.100"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiTarget size={24} color="#38A169" />
                                  </Box>
                                  <VStack spacing={1} textAlign="center">
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                      8
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">Milestones</Text>
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>

                            <Card bg="white" shadow="md" rounded="xl" border="1px" borderColor="gray.200">
                              <CardBody p={6}>
                                <VStack spacing={3}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bg="orange.100"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiClock size={24} color="#DD6B20" />
                                  </Box>
                                  <VStack spacing={1} textAlign="center">
                                    <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                                      3
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">Upcoming</Text>
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>

                            <Card bg="white" shadow="md" rounded="xl" border="1px" borderColor="gray.200">
                              <CardBody p={6}>
                                <VStack spacing={3}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bg="purple.100"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiTrendingUp size={24} color="#805AD5" />
                                  </Box>
                                  <VStack spacing={1} textAlign="center">
                                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                      {DataProject?.projectStatusPercentage || 75}%
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">Progress</Text>
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          </SimpleGrid>

                          {/* Calendar and Timeline Section */}
                          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                            {/* Calendar Section */}
                            <Card bg="white" shadow="lg" rounded="xl" border="1px" borderColor="gray.200">
                              <CardHeader bg="gradient.100" roundedTop="xl" borderBottom="1px" borderColor="gray.200">
                                <HStack spacing={3}>
                                  <Box
                                    w={8}
                                    h={8}
                                    bg="blue.500"
                                    rounded="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiCalendar size={16} color="white" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Heading size="md" color="gray.800">
                                      Project Calendar
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                      Important dates and milestones
                                    </Text>
                                  </VStack>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <Box bg="white" p={4} rounded="lg" minH="400px" className="fullcalendar-container">
                                  <style jsx global>{`
                                    .fullcalendar-container {
                                      width: 100% !important;
                                      max-width: 100% !important;
                                    }
                                    
                                    .fullcalendar-container .fc {
                                      font-family: inherit;
                                      width: 100% !important;
                                      max-width: 100% !important;
                                    }
                                    
                                    .fullcalendar-container .fc-view-harness {
                                      width: 100% !important;
                                    }
                                    
                                    .fullcalendar-container .fc-view {
                                      width: 100% !important;
                                    }
                                    
                                    /* Force table to full width */
                                    .fullcalendar-container .fc-scrollgrid {
                                      border: 1px solid #e2e8f0;
                                      border-radius: 8px;
                                      overflow: hidden;
                                      width: 100% !important;
                                      table-layout: fixed !important;
                                    }
                                    
                                    .fullcalendar-container .fc-scrollgrid-sync-table {
                                      width: 100% !important;
                                      table-layout: fixed !important;
                                      border-collapse: separate;
                                      border-spacing: 0;
                                    }
                                    
                                    .fullcalendar-container .fc-scrollgrid-sync-table td,
                                    .fullcalendar-container .fc-scrollgrid-sync-table th {
                                      width: 14.285714% !important; /* 100% / 7 days */
                                      min-width: 0 !important;
                                      max-width: none !important;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-body {
                                      width: 100% !important;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-body table {
                                      width: 100% !important;
                                      table-layout: fixed !important;
                                    }
                                    
                                    /* Header styling */
                                    .fullcalendar-container .fc-col-header {
                                      background-color: #f7fafc;
                                      width: 100% !important;
                                    }
                                    
                                    .fullcalendar-container .fc-col-header-cell {
                                      background-color: #f7fafc;
                                      font-weight: 600;
                                      color: #4a5568;
                                      padding: 12px 8px;
                                      border-right: 1px solid #e2e8f0;
                                      border-bottom: 1px solid #e2e8f0;
                                      text-align: center;
                                      width: 14.285714% !important;
                                      box-sizing: border-box;
                                    }
                                    
                                    .fullcalendar-container .fc-col-header-cell:last-child {
                                      border-right: none;
                                    }
                                    
                                    /* Day cells */
                                    .fullcalendar-container .fc-daygrid-day {
                                      background-color: white;
                                      min-height: 100px;
                                      border-right: 1px solid #e2e8f0;
                                      border-bottom: 1px solid #e2e8f0;
                                      position: relative;
                                      vertical-align: top;
                                      width: 14.285714% !important;
                                      padding: 0;
                                      box-sizing: border-box;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day:last-child {
                                      border-right: none;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day:hover {
                                      background-color: #f7fafc;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day-frame {
                                      padding: 6px;
                                      height: 100%;
                                      position: relative;
                                      min-height: 94px;
                                      width: 100%;
                                      box-sizing: border-box;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day-top {
                                      display: flex;
                                      justify-content: flex-end;
                                      margin-bottom: 4px;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day-number {
                                      color: #2d3748;
                                      font-weight: 500;
                                      padding: 4px 6px;
                                      font-size: 14px;
                                      line-height: 1;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-day-events {
                                      margin-top: 4px;
                                      width: 100%;
                                    }
                                    
                                    /* Today highlighting */
                                    .fullcalendar-container .fc-day-today {
                                      background-color: #ebf8ff !important;
                                    }
                                    
                                    .fullcalendar-container .fc-day-today .fc-daygrid-day-number {
                                      background-color: #3182ce;
                                      color: white;
                                      border-radius: 50%;
                                      width: 24px;
                                      height: 24px;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                    }
                                    
                                    /* Toolbar styling */
                                    .fullcalendar-container .fc-toolbar {
                                      margin-bottom: 16px;
                                      display: flex;
                                      justify-content: space-between;
                                      align-items: center;
                                      width: 100%;
                                    }
                                    
                                    .fullcalendar-container .fc-toolbar-chunk {
                                      display: flex;
                                      align-items: center;
                                      gap: 8px;
                                    }
                                    
                                    .fullcalendar-container .fc-button {
                                      background-color: #3182ce;
                                      border: 1px solid #3182ce;
                                      color: white;
                                      border-radius: 6px;
                                      padding: 6px 12px;
                                      font-size: 14px;
                                      cursor: pointer;
                                      transition: all 0.2s ease;
                                      font-family: inherit;
                                    }
                                    
                                    .fullcalendar-container .fc-button:hover {
                                      background-color: #2c5aa0;
                                      border-color: #2c5aa0;
                                    }
                                    
                                    .fullcalendar-container .fc-button:disabled {
                                      background-color: #a0aec0;
                                      border-color: #a0aec0;
                                      cursor: not-allowed;
                                    }
                                    
                                    .fullcalendar-container .fc-button-primary:not(:disabled):active,
                                    .fullcalendar-container .fc-button-primary:not(:disabled).fc-button-active {
                                      background-color: #2c5aa0;
                                      border-color: #2c5aa0;
                                    }
                                    
                                    .fullcalendar-container .fc-toolbar-title {
                                      font-size: 1.25rem;
                                      font-weight: 600;
                                      color: #2d3748;
                                      margin: 0;
                                    }
                                    
                                    /* Event styling */
                                    .fullcalendar-container .fc-event {
                                      border: none;
                                      border-radius: 4px;
                                      margin: 1px 0;
                                      font-size: 11px;
                                      cursor: pointer;
                                      transition: all 0.2s ease;
                                      padding: 2px 4px;
                                      width: calc(100% - 4px);
                                      box-sizing: border-box;
                                    }
                                    
                                    .fullcalendar-container .fc-event:hover {
                                      opacity: 0.8;
                                      transform: scale(1.02);
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-event {
                                      margin-top: 1px;
                                      margin-bottom: 1px;
                                      white-space: nowrap;
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                      width: 100%;
                                    }
                                    
                                    .fullcalendar-container .fc-daygrid-event-harness {
                                      margin-bottom: 2px;
                                      width: 100%;
                                    }
                                    
                                    .fullcalendar-container .fc-event-title {
                                      font-weight: 500;
                                    }
                                    
                                    /* More link styling */
                                    .fullcalendar-container .fc-more-link {
                                      color: #3182ce;
                                      font-size: 11px;
                                      font-weight: 500;
                                      cursor: pointer;
                                      padding: 2px 4px;
                                      border-radius: 3px;
                                      text-decoration: none;
                                    }
                                    
                                    .fullcalendar-container .fc-more-link:hover {
                                      background-color: #ebf8ff;
                                    }
                                    
                                    /* Other month days */
                                    .fullcalendar-container .fc-day-other .fc-daygrid-day-number {
                                      color: #a0aec0;
                                    }
                                    
                                    .fullcalendar-container .fc-day-other {
                                      background-color: #fafafa;
                                    }
                                    
                                    /* Week view adjustments */
                                    .fullcalendar-container .fc-timegrid-slot {
                                      height: 2em;
                                      border-bottom: 1px solid #e2e8f0;
                                    }
                                    
                                    .fullcalendar-container .fc-timegrid-axis {
                                      border-right: 1px solid #e2e8f0;
                                      background-color: #f7fafc;
                                    }
                                    
                                    /* Responsive adjustments */
                                    @media (max-width: 768px) {
                                      .fullcalendar-container .fc-toolbar {
                                        flex-direction: column;
                                        gap: 12px;
                                      }
                                      
                                      .fullcalendar-container .fc-toolbar-chunk {
                                        justify-content: center;
                                      }
                                      
                                      .fullcalendar-container .fc-daygrid-day {
                                        min-height: 80px;
                                      }
                                      
                                      .fullcalendar-container .fc-daygrid-day-frame {
                                        padding: 4px;
                                        min-height: 76px;
                                      }
                                      
                                      .fullcalendar-container .fc-button {
                                        padding: 4px 8px;
                                        font-size: 12px;
                                      }
                                      
                                      .fullcalendar-container .fc-toolbar-title {
                                        font-size: 1.1rem;
                                      }
                                    }
                                  `}</style>
                                  <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={calendarEvents}
                                    timeZone="Asia/Jakarta"
                                    locale="en"
                                    height={450}
                                    headerToolbar={{
                                      left: "prev,next today",
                                      center: "title",
                                      right: "dayGridMonth,timeGridWeek",
                                    }}
                                    buttonText={{
                                      today: "Today",
                                      month: "Month",
                                      week: "Week",
                                    }}
                                    dayMaxEvents={2}
                                    moreLinkClick="popover"
                                    eventDisplay="block"
                                    displayEventTime={false}
                                    dayHeaderFormat={{ weekday: 'short' }}
                                    titleFormat={{ year: 'numeric', month: 'long' }}
                                    eventClick={handleCalendarEventClick}
                                    fixedWeekCount={false}
                                    showNonCurrentDates={true}
                                  />
                                </Box>
                              </CardBody>
                            </Card>

                            {/* Timeline Events */}
                            <Card bg="white" shadow="lg" rounded="xl" border="1px" borderColor="gray.200">
                              <CardHeader bg="gradient.100" roundedTop="xl" borderBottom="1px" borderColor="gray.200">
                                <HStack spacing={3}>
                                  <Box
                                    w={8}
                                    h={8}
                                    bg="green.500"
                                    rounded="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <FiActivity size={16} color="white" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Heading size="md" color="gray.800">
                                      Recent Activity
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                      Latest project updates
                                    </Text>
                                  </VStack>
                                </HStack>
                              </CardHeader>
                              <CardBody p={6}>
                                <VStack spacing={4} align="stretch">
                                  {/* Timeline Events */}
                                  {[
                                    {
                                      title: "Project Started",
                                      date: DataProject?.projectRegisterDate || "2024-01-15",
                                      type: "start",
                                      color: "green",
                                      icon: FiPlayCircle
                                    },
                                    {
                                      title: "Requirements Finalized",
                                      date: "2024-01-22",
                                      type: "milestone",
                                      color: "blue",
                                      icon: FiFileText
                                    },
                                    {
                                      title: "Development Phase",
                                      date: "2024-02-01",
                                      type: "phase",
                                      color: "purple",
                                      icon: FiZap
                                    },
                                    {
                                      title: "Team Meeting",
                                      date: "2024-02-15",
                                      type: "meeting",
                                      color: "orange",
                                      icon: FiUsers
                                    },
                                    {
                                      title: "Testing Phase",
                                      date: "2024-03-01",
                                      type: "upcoming",
                                      color: "yellow",
                                      icon: FiTarget
                                    }
                                  ].map((event, index) => (
                                    <HStack key={index} spacing={4} align="start">
                                      <Box
                                        w={10}
                                        h={10}
                                        bg={`${event.color}.100`}
                                        rounded="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                      >
                                        <event.icon size={16} color={`var(--chakra-colors-${event.color}-500)`} />
                                      </Box>
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                                          {event.title}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                          {new Date(event.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </Text>
                                        <Badge 
                                          size="sm" 
                                          colorScheme={event.color}
                                          rounded="full"
                                          px={2}
                                        >
                                          {event.type}
                                        </Badge>
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              </CardBody>
                            </Card>
                          </Grid>

                          {/* Project Phases Timeline */}
                          <Card bg="white" shadow="lg" rounded="xl" border="1px" borderColor="gray.200">
                            <CardHeader bg="gradient.100" roundedTop="xl" borderBottom="1px" borderColor="gray.200">
                              <HStack spacing={3}>
                                <Box
                                  w={8}
                                  h={8}
                                  bg="purple.500"
                                  rounded="lg"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <FiTrendingUp size={16} color="white" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Heading size="md" color="gray.800">
                                    Project Phases
                                  </Heading>
                                  <Text fontSize="sm" color="gray.600">
                                    Development lifecycle progress
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardHeader>
                            <CardBody p={6}>
                              <HStack spacing={4} align="center" overflowX="auto" pb={2}>
                                {[
                                  { phase: "Planning", status: "completed", progress: 100 },
                                  { phase: "Design", status: "completed", progress: 100 },
                                  { phase: "Development", status: "active", progress: DataProject?.projectStatusPercentage || 75 },
                                  { phase: "Testing", status: "upcoming", progress: 0 },
                                  { phase: "Deployment", status: "upcoming", progress: 0 }
                                ].map((phase, index) => (
                                  <VStack key={index} spacing={3} minW="120px" align="center">
                                    <Box
                                      w={12}
                                      h={12}
                                      bg={
                                        phase.status === "completed" ? "green.500" :
                                        phase.status === "active" ? "blue.500" : "gray.300"
                                      }
                                      rounded="full"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      position="relative"
                                    >
                                      <Text color="white" fontWeight="bold" fontSize="sm">
                                        {index + 1}
                                      </Text>
                                      {index < 4 && (
                                        <Box
                                          position="absolute"
                                          left="100%"
                                          top="50%"
                                          transform="translateY(-50%)"
                                          w="20px"
                                          h="2px"
                                          bg={phase.status === "completed" ? "green.500" : "gray.300"}
                                        />
                                      )}
                                    </Box>
                                    <VStack spacing={1} textAlign="center">
                                      <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                        {phase.phase}
                                      </Text>
                                      <Text fontSize="xs" color="gray.600">
                                        {phase.progress}%
                                      </Text>
                                      <Badge
                                        size="sm"
                                        colorScheme={
                                          phase.status === "completed" ? "green" :
                                          phase.status === "active" ? "blue" : "gray"
                                        }
                                        rounded="full"
                                      >
                                        {phase.status}
                                      </Badge>
                                    </VStack>
                                  </VStack>
                                ))}
                              </HStack>
                            </CardBody>
                          </Card>
                        </VStack>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* Sidebar - Responsive */}
          <Box w={{ base: "full", lg: "300px" }} flexShrink={0}>
            <VStack spacing={{ base: 4, md: 6 }}>
              {/* Application Information Card - Launcher Style */}
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
                  {/* BJB Logo Background Overlay - Responsive */}
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

                  {/* Floating Decorative Elements */}
                  {/* <Box
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
                  /> */}

                  <CardBody
                    p={{ base: 6, md: 8 }}
                    position="relative"
                    zIndex={1}
                  >
                    <VStack spacing={{ base: 4, md: 6 }} align="center">
                      {/* App Icon - Launcher Style */}
                      <Box position="relative">
                        {/* Glowing Ring Effect */}
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

                        {/* Main App Icon */}
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

                        {/* Status Indicator Dot */}
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

                      {/* App Name - Launcher Style */}
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

                        {/* App Short Name Badge */}
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

                      {/* App Details Grid - Responsive */}
                      <SimpleGrid
                        columns={{ base: 1, sm: 2 }}
                        spacing={4}
                        w="full"
                      >
                        {/* Status */}
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

                        {/* App Code */}
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

                      {/* Project Connection Info */}
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

                      {/* Quick Actions - Responsive */}
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

              {/* Project Info Card */}
              <Card
                w="full"
                shadow="lg"
                rounded={radiusStyle}
                border="1px"
                borderColor="gray.200"
                _hover={{
                  shadow: "xl",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
              >
                <CardHeader
                  bg="blue.50"
                  roundedTop={radiusStyle}
                  borderBottom="1px"
                  borderColor="gray.200"
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

              {/* Quick Actions Card */}
              <Card
                w="full"
                shadow="lg"
                rounded={radiusStyle}
                border="1px"
                borderColor="gray.200"
                _hover={{
                  shadow: "xl",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
              >
                <CardHeader
                  bg="green.50"
                  roundedTop={radiusStyle}
                  borderBottom="1px"
                  borderColor="gray.200"
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
  projectAcquisitionCode: null,
  projectCharasteristicCode: null,
  projectSubCharasteristicCode: null,
  proOwnerDirectorateId: null,
  proManageByDirectorateId: null,
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
    setRefreshData((prev) => prev + 1);
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
              <Text mt={4} color="gray.500">
                Loading project information...
              </Text>
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
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                      <Heading size="md" color="blue.700">
                        Basic Information
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Project Number:
                        </Text>
                        <Badge
                          colorScheme="blue"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectNo || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Project Name:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="gray.800"
                          textAlign="right"
                          maxW="200px"
                        >
                          {DataProject.projectName || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <VStack align="stretch" spacing={2}>
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Description:
                        </Text>
                        <Box
                          bg="gray.50"
                          p={3}
                          rounded="lg"
                          border="1px"
                          borderColor="gray.200"
                          minH="60px"
                        >
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            lineHeight="tall"
                          >
                            {DataProject.projectDesc ||
                              "No description available"}
                          </Text>
                        </Box>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Project Classification Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                      <Heading size="md" color="green.700">
                        Classification
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Category:
                        </Text>
                        <Badge
                          colorScheme="green"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectCategory || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Type:
                        </Text>
                        <Badge
                          colorScheme="purple"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectType || "N/A"}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Status:
                        </Text>
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
                        >
                          {DataProject.projectStatus || "N/A"}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Timeline Information Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                      <Heading size="md" color="orange.700">
                        Timeline
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Register Date:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate
                            ? new Date(
                                DataProject.projectRegisterDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Closed Date:
                        </Text>
                        {DataProject.projectClosedDate ? (
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.800"
                          >
                            {new Date(
                              DataProject.projectClosedDate
                            ).toLocaleDateString()}
                          </Text>
                        ) : (
                          <Badge
                            colorScheme="green"
                            px={3}
                            py={1}
                            rounded="full"
                            fontSize="sm"
                          >
                            ON GOING
                          </Badge>
                        )}
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Duration:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate
                            ? calculateDurationInDays(
                                DataProject.projectRegisterDate,
                                DataProject.projectClosedDate ||
                                  new Date().toISOString()
                              )
                            : 0}{" "}
                          days
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Additional Information Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                      <Heading size="md" color="purple.700">
                        Additional Info
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <VStack align="stretch" spacing={2}>
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Notes:
                        </Text>
                        <Box
                          bg="gray.50"
                          p={3}
                          rounded="lg"
                          border="1px"
                          borderColor="gray.200"
                          minH="60px"
                        >
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            lineHeight="tall"
                          >
                            {DataProject.note || "No additional notes"}
                          </Text>
                        </Box>
                      </VStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Project ID:
                        </Text>
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color="gray.500"
                          bg="gray.100"
                          px={2}
                          py={1}
                          rounded="md"
                        >
                          {DataProject.id}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Progress Section */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
              >
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
                    <Heading size="md" color="blue.700">
                      Project Progress
                    </Heading>
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
                    <HStack
                      justify="space-between"
                      w="full"
                      fontSize="sm"
                      color="gray.600"
                    >
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
              <Text color="gray.500" fontSize="lg">
                No project data available
              </Text>
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
