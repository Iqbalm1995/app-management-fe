"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
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
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
} from "@/app/services/useProjects";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BsKanban } from "react-icons/bs";
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart,
  FiCalendar,
  FiCode,
  FiCpu,
  FiExternalLink,
  FiGitBranch,
  FiLayers,
  FiList,
  FiRefreshCcw,
  FiSettings,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Development Dashboard",
  breadCrumb: ["Home", "Project Development", "Development"],
};

function ProjectDevelopmentDetailContent() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const { GetDetailById } = useProjects();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Project Data
  const [projectId, setProjectId] = useState<string | null>(null);
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Get project ID from URL params
  useEffect(() => {
    const projectIdParam = searchParams.get("projectId");
    if (projectIdParam) {
      setProjectId(projectIdParam);
    }
  }, [searchParams]);

  // Auth Effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Fetch Project Data
  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);

        if (!requestData || requestData.statusCode !== RES_CODE_OK) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        const itemsData = requestData.data as ProjectDataResponse;
        setDataProject(itemsData);
        setIsLoadingProcess(false);
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  const refreshAction = () => setRefreshData((prev) => prev + 1);

  if (IsLoadingProcess) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName={HeaderDataContent.titleName}
          breadCrumb={HeaderDataContent.breadCrumb}
        />
        <LoadingMiniSignature />
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      {/* Development Header */}
      <Box
        // bgGradient="linear(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
        bgGradient={
          "linear(to-br, secondary.800, secondary.600, secondary.400)"
        }
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
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgImage="radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)"
          bgSize="30px 30px"
        />

        <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
          {/* Navigation & Actions */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Link href="/project-development">
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  size="sm"
                >
                  Back to Projects
                </Button>
              </Link>

              <Badge colorScheme="purple" px={3} py={1} rounded="full">
                Development View
              </Badge>
            </HStack>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiRefreshCcw />}
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                size="sm"
                onClick={refreshAction}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Project Info */}
          {DataProject && (
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr auto" }}
              gap={6}
              alignItems="center"
            >
              <VStack align="start" spacing={3}>
                <HStack spacing={4} align="center">
                  <Box
                    w={16}
                    h={16}
                    bg="whiteAlpha.200"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    <FiCode size={32} />
                  </Box>

                  <VStack align="start" spacing={1}>
                    <Heading size="xl" color="white">
                      {DataProject.projectName}
                    </Heading>
                    <Text fontSize="lg" opacity="0.9">
                      {DataProject.projectCode} • Development Dashboard
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={4} wrap="wrap">
                  <Badge
                    colorScheme={
                      DataProject.projectStatus === "ACTIVE"
                        ? "green"
                        : "orange"
                    }
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                  >
                    {DataProject.projectStatus}
                  </Badge>

                  <Badge
                    colorScheme="blue"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                  >
                    {DataProject.projectCategory}
                  </Badge>

                  <Badge
                    colorScheme="purple"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                  >
                    {DataProject.projectType}
                  </Badge>
                </HStack>
              </VStack>

              {/* Progress Circle */}
              <VStack spacing={2} align="center">
                <Box position="relative" w={20} h={20}>
                  <Progress
                    value={DataProject.projectStatusPercentage}
                    size="lg"
                    colorScheme="green"
                    bg="whiteAlpha.200"
                    rounded="full"
                    sx={{
                      "& > div": {
                        background: "linear-gradient(90deg, #48bb78, #38a169)",
                      },
                    }}
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    textAlign="center"
                  >
                    <Text fontSize="xl" fontWeight="bold" color="white">
                      {DataProject.projectStatusPercentage}%
                    </Text>
                  </Box>
                </Box>
                <Text fontSize="sm" opacity="0.9" textAlign="center">
                  Development Progress
                </Text>
              </VStack>
            </Grid>
          )}
        </VStack>
      </Box>

      {/* Main Content */}
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
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              overflow="hidden"
            >
              <CardBody p={0}>
                <Tabs variant="unstyled" colorScheme="purple">
                  <TabList
                    px={6}
                    py={4}
                    border="1px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.700"
                    }
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    roundedTop={radiusStyle}
                    gap={2}
                  >
                    {/* Development Dashboard Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                      color={colorMode === "light" ? "gray.700" : "white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "secondary.100",
                        color: "gray.800",
                        _selected: {
                          bg: "secondary.600",
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
                          <FiActivity size={16} />
                        </Box>
                        <Text>Dashboard</Text>
                      </HStack>
                    </Tab>

                    {/* Kanban Board Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                      color={colorMode === "light" ? "gray.700" : "white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "secondary.100",
                        color: "gray.800",
                        _selected: {
                          bg: "secondary.600",
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
                          <BsKanban size={16} />
                        </Box>
                        <Text>Kanban</Text>
                      </HStack>
                    </Tab>

                    {/* Backlog Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                      color={colorMode === "light" ? "gray.700" : "white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "secondary.100",
                        color: "gray.800",
                        _selected: {
                          bg: "secondary.600",
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
                          <FiList size={16} />
                        </Box>
                        <Text>Backlog</Text>
                      </HStack>
                    </Tab>

                    {/* Code & Deployment Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                      color={colorMode === "light" ? "gray.700" : "white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "secondary.100",
                        color: "gray.800",
                        _selected: {
                          bg: "secondary.600",
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
                          <FiGitBranch size={16} />
                        </Box>
                        <Text>Code & Deploy</Text>
                      </HStack>
                    </Tab>

                    {/* Analytics Tab */}
                    <Tab
                      fontWeight="semibold"
                      fontSize="sm"
                      px={6}
                      py={3}
                      rounded={radiusStyle}
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                      color={colorMode === "light" ? "gray.700" : "white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      _hover={{
                        bg: "secondary.100",
                        color: "gray.800",
                        _selected: {
                          bg: "secondary.600",
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
                          <FiBarChart size={16} />
                        </Box>
                        <Text>Analytics</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels roundedBottom={radiusStyle} minH="600px">
                    {/* Development Dashboard Tab Panel */}
                    <TabPanel p={8} roundedBottom={radiusStyle}>
                      <VStack spacing={8} align="stretch">
                        {/* Development Stats */}
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 4 }}
                          spacing={6}
                        >
                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
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
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="green.600"
                                  >
                                    12
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Features Done
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
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
                                  <FiZap size={24} color="#3182CE" />
                                </Box>
                                <VStack spacing={1} textAlign="center">
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="blue.600"
                                  >
                                    8
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    In Progress
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
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
                                  <FiLayers size={24} color="#DD6B20" />
                                </Box>
                                <VStack spacing={1} textAlign="center">
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    15
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Backlog Items
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
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
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="purple.600"
                                  >
                                    {DataProject?.projectStatusPercentage || 75}
                                    %
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Completion
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Quick Actions */}
                        <Card
                          shadow="md"
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "white" : "gray.800"}
                        >
                          <CardHeader bg="gradient.100" roundedTop="xl">
                            <Heading size="md">Quick Actions</Heading>
                          </CardHeader>
                          <CardBody p={6}>
                            <SimpleGrid
                              columns={{ base: 1, md: 2, lg: 3 }}
                              spacing={4}
                            >
                              <Link href={`/kanban?projectId=${projectId}`}>
                                <Button
                                  leftIcon={<BsKanban />}
                                  colorScheme="purple"
                                  size="lg"
                                  w="full"
                                  h="60px"
                                  rounded="xl"
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    shadow: "lg",
                                  }}
                                  transition="all 0.2s"
                                >
                                  Open Kanban Board
                                </Button>
                              </Link>

                              <Button
                                leftIcon={<FiList />}
                                colorScheme="blue"
                                variant="outline"
                                size="lg"
                                w="full"
                                h="60px"
                                rounded="xl"
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "lg",
                                }}
                                transition="all 0.2s"
                              >
                                View Backlog
                              </Button>

                              <Button
                                leftIcon={<FiGitBranch />}
                                colorScheme="green"
                                variant="outline"
                                size="lg"
                                w="full"
                                h="60px"
                                rounded="xl"
                                _hover={{
                                  transform: "translateY(-2px)",
                                  shadow: "lg",
                                }}
                                transition="all 0.2s"
                              >
                                Code Repository
                              </Button>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Development Progress */}
                        <Grid
                          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                          gap={8}
                        >
                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
                            <CardHeader bg="gradient.100" roundedTop="xl">
                              <Heading size="md">Sprint Progress</Heading>
                            </CardHeader>
                            <CardBody p={6}>
                              <VStack spacing={6} align="stretch">
                                {[
                                  {
                                    name: "User Authentication",
                                    progress: 100,
                                    status: "completed",
                                  },
                                  {
                                    name: "Dashboard UI",
                                    progress: 85,
                                    status: "active",
                                  },
                                  {
                                    name: "API Integration",
                                    progress: 60,
                                    status: "active",
                                  },
                                  {
                                    name: "Testing Suite",
                                    progress: 30,
                                    status: "active",
                                  },
                                  {
                                    name: "Documentation",
                                    progress: 0,
                                    status: "pending",
                                  },
                                ].map((item, index) => (
                                  <Box key={index}>
                                    <HStack justify="space-between" mb={2}>
                                      <Text fontWeight="medium">
                                        {item.name}
                                      </Text>
                                      <Badge
                                        colorScheme={
                                          item.status === "completed"
                                            ? "green"
                                            : item.status === "active"
                                            ? "blue"
                                            : "gray"
                                        }
                                        rounded="full"
                                      >
                                        {item.progress}%
                                      </Badge>
                                    </HStack>
                                    <Progress
                                      value={item.progress}
                                      colorScheme={
                                        item.status === "completed"
                                          ? "green"
                                          : item.status === "active"
                                          ? "blue"
                                          : "gray"
                                      }
                                      rounded="full"
                                      size="sm"
                                    />
                                  </Box>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card
                            shadow="md"
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "white" : "gray.800"}
                          >
                            <CardHeader bg="gradient.100" roundedTop="xl">
                              <Heading size="md">Recent Activity</Heading>
                            </CardHeader>
                            <CardBody p={6}>
                              <VStack spacing={4} align="stretch">
                                {[
                                  {
                                    action: "Feature completed",
                                    time: "2 hours ago",
                                    type: "success",
                                  },
                                  {
                                    action: "Code review requested",
                                    time: "4 hours ago",
                                    type: "info",
                                  },
                                  {
                                    action: "Bug fixed",
                                    time: "6 hours ago",
                                    type: "success",
                                  },
                                  {
                                    action: "New task assigned",
                                    time: "1 day ago",
                                    type: "info",
                                  },
                                  {
                                    action: "Sprint planning",
                                    time: "2 days ago",
                                    type: "warning",
                                  },
                                ].map((activity, index) => (
                                  <HStack key={index} spacing={3}>
                                    <Box
                                      w={3}
                                      h={3}
                                      bg={
                                        activity.type === "success"
                                          ? "green.500"
                                          : activity.type === "info"
                                          ? "blue.500"
                                          : "orange.500"
                                      }
                                      rounded="full"
                                      flexShrink={0}
                                    />
                                    <VStack align="start" spacing={0} flex={1}>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {activity.action}
                                      </Text>
                                      <Text fontSize="xs" color="gray.600">
                                        {activity.time}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </VStack>
                    </TabPanel>

                    {/* Kanban Tab Panel */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack
                        spacing={6}
                        align="center"
                        justify="center"
                        minH="400px"
                      >
                        <Box
                          w={20}
                          h={20}
                          bg="purple.100"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <BsKanban size={40} color="#805AD5" />
                        </Box>
                        <VStack spacing={3} textAlign="center">
                          <Heading size="lg" color="gray.800">
                            Kanban Board Integration
                          </Heading>
                          <Text color="gray.600" maxW="500px">
                            Access your project's Kanban board to manage tasks,
                            track progress, and collaborate with your team.
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Link href={`/kanban?projectId=${projectId}`}>
                            <Button
                              colorScheme="purple"
                              size="lg"
                              leftIcon={<BsKanban />}
                            >
                              Open Kanban Board
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="lg"
                            leftIcon={<FiSettings />}
                          >
                            Configure Board
                          </Button>
                        </HStack>
                      </VStack>
                    </TabPanel>

                    {/* Backlog Tab Panel */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack
                        spacing={6}
                        align="center"
                        justify="center"
                        minH="400px"
                      >
                        <Box
                          w={20}
                          h={20}
                          bg="blue.100"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiList size={40} color="#3182CE" />
                        </Box>
                        <VStack spacing={3} textAlign="center">
                          <Heading size="lg" color="gray.800">
                            Product Backlog
                          </Heading>
                          <Text color="gray.600" maxW="500px">
                            Manage your product backlog, prioritize features,
                            and plan sprints effectively.
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Button
                            colorScheme="blue"
                            size="lg"
                            leftIcon={<FiList />}
                          >
                            View Backlog
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            leftIcon={<FiTarget />}
                          >
                            Plan Sprint
                          </Button>
                        </HStack>
                      </VStack>
                    </TabPanel>

                    {/* Code & Deploy Tab Panel */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack
                        spacing={6}
                        align="center"
                        justify="center"
                        minH="400px"
                      >
                        <Box
                          w={20}
                          h={20}
                          bg="green.100"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiGitBranch size={40} color="#38A169" />
                        </Box>
                        <VStack spacing={3} textAlign="center">
                          <Heading size="lg" color="gray.800">
                            Code & Deployment
                          </Heading>
                          <Text color="gray.600" maxW="500px">
                            Access code repositories, manage deployments, and
                            monitor application performance.
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Button
                            colorScheme="green"
                            size="lg"
                            leftIcon={<FiGitBranch />}
                          >
                            View Repository
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            leftIcon={<FiCpu />}
                          >
                            Deployment Status
                          </Button>
                        </HStack>
                      </VStack>
                    </TabPanel>

                    {/* Analytics Tab Panel */}
                    <TabPanel p={8} bg="gray.50" roundedBottom={radiusStyle}>
                      <VStack
                        spacing={6}
                        align="center"
                        justify="center"
                        minH="400px"
                      >
                        <Box
                          w={20}
                          h={20}
                          bg="orange.100"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FiBarChart size={40} color="#DD6B20" />
                        </Box>
                        <VStack spacing={3} textAlign="center">
                          <Heading size="lg" color="gray.800">
                            Development Analytics
                          </Heading>
                          <Text color="gray.600" maxW="500px">
                            Track development metrics, team performance, and
                            project insights.
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Button
                            colorScheme="orange"
                            size="lg"
                            leftIcon={<FiBarChart />}
                          >
                            View Analytics
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            leftIcon={<FiTrendingUp />}
                          >
                            Performance Reports
                          </Button>
                        </HStack>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* Development Sidebar */}
          <Box w={{ base: "full", lg: "300px" }} flexShrink={0}>
            <VStack spacing={{ base: 4, md: 6 }}>
              {/* Application Information Card */}
              {DataProject && DataProject.appsProject && (
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  w="full"
                >
                  <CardHeader bg="gradient.100" roundedTop="xl">
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
                        <FiCpu size={16} color="white" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Application Info</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {DataProject.appsProject.appName}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      {/* Application Avatar & Name */}
                      <HStack spacing={4} align="center">
                        <Box
                          w={12}
                          h={12}
                          bg="blue.100"
                          rounded="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="lg"
                          fontWeight="bold"
                          color="blue.600"
                        >
                          {DataProject.appsProject.appName?.charAt(0) || "A"}
                        </Box>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="md" fontWeight="bold">
                            {DataProject.appsProject.appName}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {DataProject.appsProject.appCode}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Application Details */}
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            APPLICATION CODE
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.800"
                          >
                            {DataProject.appsProject.appCode}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            SHORT NAME
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.800"
                          >
                            {DataProject.appsProject.appShortName}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            STATUS
                          </Text>
                          <Badge
                            colorScheme={
                              DataProject.appsProject.appsStatus === "ACTIVE"
                                ? "green"
                                : "orange"
                            }
                            rounded="full"
                            size="sm"
                          >
                            {DataProject.appsProject.appsStatus || "ACTIVE"}
                          </Badge>
                        </Box>

                        {DataProject.appsProject.iconApps && (
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              ICON
                            </Text>
                            <HStack spacing={2}>
                              <Box
                                w={6}
                                h={6}
                                bg="gray.100"
                                rounded="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="xs">📱</Text>
                              </Box>
                              <Text fontSize="sm" color="gray.700">
                                Custom Icon
                              </Text>
                            </HStack>
                          </Box>
                        )}
                      </VStack>

                      {/* Quick Actions */}
                      <VStack spacing={2} align="stretch" pt={2}>
                        <Button
                          leftIcon={<FiExternalLink />}
                          variant="outline"
                          colorScheme="blue"
                          size="sm"
                          justifyContent="flex-start"
                          _hover={{ bg: "blue.50" }}
                        >
                          View Application
                        </Button>

                        <Button
                          leftIcon={<FiSettings />}
                          variant="ghost"
                          size="sm"
                          justifyContent="flex-start"
                          _hover={{ bg: "gray.100" }}
                        >
                          App Settings
                        </Button>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Development Team Card */}
              {DataProject && (
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  w="full"
                >
                  <CardHeader bg="gradient.100" roundedTop="xl">
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
                        <FiUsers size={16} color="white" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Development Team</Heading>
                        <Text fontSize="sm">
                          {DataProject.userAssignment?.length || 0} members
                        </Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      {DataProject.userAssignment
                        ?.slice(0, 4)
                        .map((user, index) => (
                          <HStack key={index} spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              bg="purple.100"
                              rounded="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="sm"
                              fontWeight="bold"
                              color="purple.600"
                            >
                              {user.userData?.nama?.charAt(0) || "U"}
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight="medium">
                                {user.userData?.nama || "Unknown User"}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                Developer
                              </Text>
                            </VStack>
                            <Badge
                              size="sm"
                              colorScheme={
                                user.userAssignStatus === "ACTIVE"
                                  ? "green"
                                  : "gray"
                              }
                              rounded="full"
                            >
                              {user.userAssignStatus}
                            </Badge>
                          </HStack>
                        ))}

                      {DataProject.userAssignment &&
                        DataProject.userAssignment.length > 4 && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            textAlign="center"
                          >
                            +{DataProject.userAssignment.length - 4} more
                            members
                          </Text>
                        )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Sprint Information */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                w="full"
              >
                <CardHeader bg="gradient.100" roundedTop="xl">
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
                      <Heading size="md">Current Sprint</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Sprint #3
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">
                          Progress
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          65%
                        </Text>
                      </HStack>
                      <Progress
                        value={65}
                        colorScheme="blue"
                        rounded="full"
                        size="sm"
                      />
                    </Box>

                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Start Date
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          Dec 1, 2024
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          End Date
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          Dec 15, 2024
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Days Left
                        </Text>
                        <Badge colorScheme="orange" rounded="full">
                          5 days
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Development Tools */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                w="full"
              >
                <CardHeader bg="gradient.100" roundedTop="xl">
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
                      <FiSettings size={16} color="white" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="md">Dev Tools</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Quick access
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={3} align="stretch">
                    <Button
                      leftIcon={<FiGitBranch />}
                      variant="ghost"
                      justifyContent="flex-start"
                      size="sm"
                      _hover={{ bg: "gray.100" }}
                    >
                      Git Repository
                    </Button>

                    <Button
                      leftIcon={<FiCpu />}
                      variant="ghost"
                      justifyContent="flex-start"
                      size="sm"
                      _hover={{ bg: "gray.100" }}
                    >
                      CI/CD Pipeline
                    </Button>

                    <Button
                      leftIcon={<FiBarChart />}
                      variant="ghost"
                      justifyContent="flex-start"
                      size="sm"
                      _hover={{ bg: "gray.100" }}
                    >
                      Code Quality
                    </Button>

                    <Button
                      leftIcon={<FiTarget />}
                      variant="ghost"
                      justifyContent="flex-start"
                      size="sm"
                      _hover={{ bg: "gray.100" }}
                    >
                      Testing Suite
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Project Information */}
              {DataProject && (
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  w="full"
                >
                  <CardHeader bg="gradient.100" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={8}
                        h={8}
                        bg="orange.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiActivity size={16} color="white" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Project Info</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Key details
                        </Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          PROJECT CODE
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {DataProject.projectCode}
                        </Text>
                      </Box>

                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          CATEGORY
                        </Text>
                        <Badge colorScheme="blue" rounded="full" size="sm">
                          {DataProject.projectCategory}
                        </Badge>
                      </Box>

                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          TYPE
                        </Text>
                        <Badge colorScheme="purple" rounded="full" size="sm">
                          {DataProject.projectType}
                        </Badge>
                      </Box>

                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          STATUS
                        </Text>
                        <Badge
                          colorScheme={
                            DataProject.projectStatus === "ACTIVE"
                              ? "green"
                              : "orange"
                          }
                          rounded="full"
                          size="sm"
                        >
                          {DataProject.projectStatus}
                        </Badge>
                      </Box>

                      {DataProject.projectRegisterDate && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            START DATE
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {new Date(
                              DataProject.projectRegisterDate
                            ).toLocaleDateString()}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </Box>
        </Stack>
      </Box>
    </LayoutAdmin>
  );
}

export default function ProjectDevelopmentDetail() {
  return (
    <Suspense fallback={<LoadingMiniSignature />}>
      <ProjectDevelopmentDetailContent />
    </Suspense>
  );
}
