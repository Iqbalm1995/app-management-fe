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
import { CustomPanelAlert } from "@/app/components/customPanels";
import AppInfromationSection from "./apps/appViewSection";
import AppChangeLogSection from "./apps/appLogsViewSection";
import AppsEnvirontmentSection from "./apps/appsEnvViewSection";
import ProjectFeatureView from "./projectFeaturesView";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { InputLayoutFullHalf } from "@/app/components/layoutContentBody";

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
                      <VStack spacing={6} align="stretch">
                        <Heading size="md">Project Overview</Heading>

                        {DataProject ? (
                          <>
                            {/* Quick Stats */}
                            <SimpleGrid
                              columns={{ base: 2, md: 4 }}
                              spacing={4}
                            >
                              <Card bg="blue.50" textAlign="center">
                                <CardBody py={4}>
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="blue.600"
                                  >
                                    {DataProject.projectStatusPercentage || 0}%
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Progress
                                  </Text>
                                </CardBody>
                              </Card>
                              <Card bg="green.50" textAlign="center">
                                <CardBody py={4}>
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="green.600"
                                  >
                                    {DataProject.userAssignment?.length || 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Team
                                  </Text>
                                </CardBody>
                              </Card>
                              <Card bg="orange.50" textAlign="center">
                                <CardBody py={4}>
                                  <Text
                                    fontSize="2xl"
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
                                  <Text fontSize="sm" color="gray.600">
                                    Days
                                  </Text>
                                </CardBody>
                              </Card>
                              <Card bg="purple.50" textAlign="center">
                                <CardBody py={4}>
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="purple.600"
                                  >
                                    {DataProject.projectStatus === "ACTIVE"
                                      ? "Active"
                                      : "Inactive"}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Status
                                  </Text>
                                </CardBody>
                              </Card>
                            </SimpleGrid>

                            {/* Project Description */}
                            <Card>
                              <CardHeader>
                                <Heading size="sm">Description</Heading>
                              </CardHeader>
                              <CardBody>
                                <Text color="gray.600">
                                  {DataProject.projectDesc ||
                                    "No description available"}
                                </Text>
                              </CardBody>
                            </Card>
                          </>
                        ) : (
                          <Box textAlign="center" py={8}>
                            <LoadingMiniSignature />
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
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md">Team Members</Heading>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FiUsers />}
                          >
                            Add Member
                          </Button>
                        </HStack>

                        {DataProject?.userAssignment &&
                        DataProject.userAssignment.length > 0 ? (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {DataProject.userAssignment.map((member, index) => (
                              <Card key={index}>
                                <CardBody>
                                  <HStack spacing={3}>
                                    <Avatar
                                      name={member.userData?.nama || "User"}
                                      src={
                                        member.userData?.profilePict ||
                                        undefined
                                      }
                                    />
                                    <Box flex={1}>
                                      <Text fontWeight="medium">
                                        {member.userData?.nama ||
                                          "Unknown User"}
                                      </Text>
                                      <Badge
                                        size="sm"
                                        colorScheme={
                                          member.userAssignStatus === "ACTIVE"
                                            ? "green"
                                            : "gray"
                                        }
                                      >
                                        {member.userAssignStatus}
                                      </Badge>
                                    </Box>
                                  </HStack>
                                </CardBody>
                              </Card>
                            ))}
                          </SimpleGrid>
                        ) : (
                          <Box textAlign="center" py={8}>
                            <Text color="gray.500">
                              No team members assigned
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">Analytics</Heading>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Card>
                            <CardBody textAlign="center">
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="blue.600"
                              >
                                {DataProject?.projectStatusPercentage || 0}%
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Completion
                              </Text>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody textAlign="center">
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="green.600"
                              >
                                {DataProject?.userAssignment?.length || 0}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Team Size
                              </Text>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody textAlign="center">
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="orange.600"
                              >
                                {DataProject?.projectRegisterDate
                                  ? calculateDurationInDays(
                                      DataProject.projectRegisterDate,
                                      new Date().toISOString()
                                    )
                                  : 0}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Days Active
                              </Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
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

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, UpdateProjects, GetDetailAppsByProjectId } =
    useProjects();

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
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] =
    useState<ProjectUpdatePayload | null>(null);

  const formik = useFormik<ProjectUpdatePayload>({
    initialValues: initialProjectUpdateValues,
    validationSchema: FormSchemaEditProject,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleConfirmSaveData(values);
    },
  });

  const handleConfirmSaveData = async (data: ProjectUpdatePayload) => {
    setCaptionDialog("Confirm Save");
    setQuestionMsgDialog(`Are you sure want update project info?`);
    setOpenConfirmUpdateDialog(true);
    setUpdatePayload(data);
  };

  const handleConfirmSaveDataTrigger = () => {
    setOpenConfirmUpdateDialog(!openConfirmUpdateDialog);
  };

  const handleUpdateData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && UpdatePayload) {
      await UpdateTeamServ();
      setIsEditMode(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setUpdatePayload(null);
      setIsEditMode(false);
    }
  };

  const UpdateTeamServ = async () => {
    if (UpdatePayload) {
      const requestData = await UpdateProjects(UpdatePayload, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        return;
      } else {
        console.log(requestData);
        showToast({
          description: `Data project update successfully`,
          statusToast: "success",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        setIsEditMode(false);
        RefreshAction();
        return;
      }
    }
  };

  const RefreshAction = () => {
    setUpdatePayload(null);
    setRefreshData(RefreshData + 1);
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

          // set in form
          formik.setFieldValue("id", itemsData.id);
          formik.setFieldValue("projectNo", itemsData.projectNo);
          formik.setFieldValue("projectName", itemsData.projectName);
          formik.setFieldValue("projectDesc", itemsData.projectDesc);
          formik.setFieldValue("note", itemsData.note);
          formik.setFieldValue("projectCategory", itemsData.projectCategory);
          formik.setFieldValue("projectType", itemsData.projectType);
          formik.setFieldValue(
            "projectRegisterDate",
            itemsData.projectRegisterDate
          );
          formik.setFieldValue(
            "projectClosedDate",
            itemsData.projectClosedDate
          );
          formik.setFieldValue(
            "proOwnerDivisionId",
            itemsData.proOwnerDivisionId
          );
          formik.setFieldValue("proOwnerGroupId", itemsData.proOwnerGroupId);
          formik.setFieldValue(
            "proManageByDivisionId",
            itemsData.proManageByDivisionId
          );
          formik.setFieldValue(
            "proManageByGroupId",
            itemsData.proManageByGroupId
          );
          formik.setFieldValue(
            "proManageByTeamId",
            itemsData.proManageByTeamId
          );

          setDataProject(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  // Stepper
  const { activeStep } = useSteps({
    index: 4,
    count: stepsProgress.length,
  });

  return (
    <Flex w={"full"}>
      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
      {!projectId && !DataProject ? (
        <CustomPanelAlert type={"error"}>
          <FiAlertTriangle color={"red"} size={70} />
          <Text>No project ID found in the URL</Text>
        </CustomPanelAlert>
      ) : (
        <Flex w={"full"}>
          {IsLoadingProcess ? (
            <LoadingMiniSignature />
          ) : (
            <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
              <Flex
                as={Stack}
                w={"full"}
                // divider={<StackDivider borderColor="gray.200" />}
                spacing={6}
                px={4}
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  <Heading as="h5" size="md" w={"full"}>
                    Project Information
                  </Heading>
                  <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                    <Button
                      display={IsEditMode ? "none" : "flex"}
                      size={"sm"}
                      leftIcon={<FiRefreshCcw />}
                      onClick={() => RefreshAction()}
                      isLoading={ActionLoading}
                    >
                      Refresh
                    </Button>
                    <Button
                      display={IsEditMode ? "flex" : "none"}
                      size={"sm"}
                      colorScheme={"red"}
                      leftIcon={<FiXCircle />}
                      onClick={() => {
                        setIsEditMode(false);
                        RefreshAction();
                      }}
                      isLoading={ActionLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      display={IsEditMode ? "none" : "flex"}
                      size={"sm"}
                      leftIcon={<FiEdit3 />}
                      colorScheme={"secondary"}
                      onClick={() => setIsEditMode(true)}
                      isLoading={ActionLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      display={IsEditMode ? "flex" : "none"}
                      size={"sm"}
                      colorScheme={"green"}
                      leftIcon={<FiSave />}
                      // type={"submit"}
                      onClick={() => {
                        formik.submitForm();
                      }}
                      isLoading={ActionLoading}
                    >
                      Save
                    </Button>
                  </Flex>
                </Flex>
                <Flex
                  minH={"420px"}
                  as={Stack}
                  py={4}
                  px={2}
                  divider={<StackDivider borderColor="gray.200" />}
                >
                  <FormControl
                    id="projectNo"
                    isInvalid={formik.errors.projectNo ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Nomor Project
                      </FormLabel>
                      <Stack spacing={0}>
                        <Input
                          id="projectNo"
                          name="projectNo"
                          type="text"
                          onChange={(e) => {
                            const uppercaseValue = e.target.value.toUpperCase(); // Convert to uppercase
                            formik.setFieldValue("projectNo", uppercaseValue); // Update Formik's value
                          }}
                          value={formik.values.projectNo ?? ""}
                          placeholder="Project No."
                          readOnly={!IsEditMode}
                          variant={IsEditMode ? "outline" : "unstyled"}
                          minLength={3}
                          maxLength={80}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.projectNo}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectName"
                    isInvalid={formik.errors.projectName ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Nama Project
                      </FormLabel>
                      <Stack spacing={0}>
                        <Input
                          id="projectName"
                          name="projectName"
                          type="text"
                          onChange={(e) => {
                            const uppercaseValue = e.target.value.toUpperCase(); // Convert to uppercase
                            formik.setFieldValue("projectName", uppercaseValue); // Update Formik's value
                          }}
                          value={formik.values.projectName ?? ""}
                          placeholder="Project Name"
                          readOnly={!IsEditMode}
                          variant={IsEditMode ? "outline" : "unstyled"}
                          minLength={3}
                          maxLength={80}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.projectName}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectDesc"
                    isInvalid={formik.errors.projectDesc ? true : false}
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Deskripsi Project
                      </FormLabel>
                      <Stack spacing={0}>
                        <Textarea
                          id="projectDesc"
                          name="projectDesc"
                          onChange={(e) => {
                            formik.setFieldValue("projectDesc", e.target.value);
                          }}
                          readOnly={!IsEditMode}
                          variant={IsEditMode ? "outline" : "unstyled"}
                          defaultValue={formik.values.projectDesc ?? ""}
                          placeholder="Project Descriptions"
                          isDisabled={ActionLoading}
                          minH={"30px"}
                        ></Textarea>
                        <FormErrorMessage>
                          {formik.errors.projectDesc}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectCategory"
                    isInvalid={formik.errors.projectCategory ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Karakteristik Project
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <SelectC
                          value={formik.values.projectCategory}
                          id="projectCategory"
                          name="projectCategory"
                          onChange={(e) => {
                            formik.setFieldValue(
                              `projectCategory`,
                              e.target.value
                            );
                          }}
                          placeholder="Select Karakteristik Project"
                          variant={IsEditMode ? "outline" : "unstyled"}
                          pointerEvents={!IsEditMode ? "none" : "auto"} // disable interaction
                          tabIndex={!IsEditMode ? -1 : undefined} // prevent tabbing
                          cursor={!IsEditMode ? "default" : "pointer"} // keep consistent cursor
                          color={
                            colorMode === "light"
                              ? "gray.800"
                              : "whiteAlpha.900"
                          }
                          bg="transparent"
                        >
                          {PROJEC_CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </SelectC>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectType"
                    isInvalid={formik.errors.projectType ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Tipe Project
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <SelectC
                          value={formik.values.projectType}
                          id="projectType"
                          name="projectType"
                          onChange={(e) => {
                            formik.setFieldValue(`projectType`, e.target.value);
                          }}
                          placeholder="Select Tipe Project"
                          variant={IsEditMode ? "outline" : "unstyled"}
                          pointerEvents={!IsEditMode ? "none" : "auto"} // disable interaction
                          tabIndex={!IsEditMode ? -1 : undefined} // prevent tabbing
                          cursor={!IsEditMode ? "default" : "pointer"} // keep consistent cursor
                          color={
                            colorMode === "light"
                              ? "gray.800"
                              : "whiteAlpha.900"
                          }
                          bg="transparent"
                        >
                          {PROJEC_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </SelectC>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectRegisterDate"
                    isInvalid={formik.errors.projectRegisterDate ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Tanggal Register Project
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Input
                          id="projectRegisterDate"
                          name="projectRegisterDate"
                          type="date"
                          onChange={formik.handleChange}
                          value={
                            formik.values.projectRegisterDate
                              ? formik.values.projectRegisterDate.split("T")[0]
                              : ""
                          }
                          isReadOnly={!IsEditMode}
                          variant={IsEditMode ? "outline" : "unstyled"}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.projectRegisterDate}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projectClosedDate"
                    isInvalid={formik.errors.projectClosedDate ? true : false}
                    isRequired
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Tanggal Closed Project
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        {formik.values.projectClosedDate != null ? (
                          <>
                            <Input
                              id="projectClosedDate"
                              name="projectClosedDate"
                              type="date"
                              isReadOnly={true}
                              variant={"unstyled"}
                              isDisabled={true}
                            />
                            <FormErrorMessage>
                              {formik.errors.projectClosedDate}
                            </FormErrorMessage>
                          </>
                        ) : (
                          <Text px={2} fontWeight={600}>
                            ON GOING
                          </Text>
                        )}
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="projDateDuration"
                    isInvalid={
                      calculateDurationInDays(
                        formik.values.projectRegisterDate ??
                          new Date().toISOString().slice(0, 10),
                        formik.values.projectClosedDate ??
                          new Date().toISOString().slice(0, 10)
                      ) < 0
                    }
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h="full"
                        display="flex"
                        alignItems="center"
                      >
                        Durasi Project
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        {formik.values.projectClosedDate != null ? (
                          <>
                            <Text px={2} fontWeight={600}>
                              {calculateDurationInDays(
                                formik.values.projectRegisterDate ??
                                  new Date().toISOString().slice(0, 10),
                                formik.values.projectClosedDate ??
                                  new Date().toISOString().slice(0, 10)
                              )}{" "}
                              Hari Kalendar (CLOSED)
                            </Text>
                            <FormErrorMessage>
                              {calculateDurationInDays(
                                formik.values.projectRegisterDate ??
                                  new Date().toISOString().slice(0, 10),
                                formik.values.projectClosedDate ??
                                  new Date().toISOString().slice(0, 10)
                              ) < 0 && "Durasi tidak boleh negatif"}
                            </FormErrorMessage>
                          </>
                        ) : (
                          <Text px={2} fontWeight={600}>
                            ON GOING
                          </Text>
                        )}
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl
                    id="note"
                    isInvalid={formik.errors.note ? true : false}
                  >
                    <InputLayoutFullHalf>
                      <FormLabel
                        fontWeight={600}
                        h={"full"}
                        display="flex"
                        alignItems="center"
                      >
                        Note
                      </FormLabel>
                      <Stack spacing={0}>
                        <Textarea
                          id="note"
                          name="note"
                          onChange={(e) => {
                            formik.setFieldValue("note", e.target.value);
                          }}
                          readOnly={!IsEditMode}
                          variant={IsEditMode ? "outline" : "unstyled"}
                          defaultValue={formik.values.note ?? ""}
                          placeholder="Notes"
                          isDisabled={ActionLoading}
                          minH={"30px"}
                        ></Textarea>
                        <FormErrorMessage>
                          {formik.errors.note}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  {/* <p>Project ID: {projectId}</p> */}
                  <Box overflowY={"auto"}>
                    {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                  </Box>
                </Flex>
              </Flex>
            </form>
          )}
        </Flex>
      )}
    </Flex>
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
