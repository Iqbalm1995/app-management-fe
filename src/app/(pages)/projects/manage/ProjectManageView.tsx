"use client";

import { HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
} from "@/app/services/useProjects";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  useColorMode,
  VStack,
  Badge,
  Heading,
  SimpleGrid,
  Stack,
  Progress,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FiTarget,
  FiInfo,
  FiCpu,
  FiPlayCircle,
  FiFileText,
  FiUsers,
  FiBarChart,
  FiCalendar,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiActivity,
  FiZap,
} from "react-icons/fi";
import { TabButtonCustomStyle } from "@/app/components/TabsCustom";
import {
  OverviewTab,
  DetailsTab,
  FeaturesTab,
  WorkstageProcurementTab,
  DocumentationTab,
  TeamTab,
  AnalyticsTab,
  TimelineTab,
  EditTab,
} from "./tabs";
import { ProjectDetailHeader } from "./components/ProjectDetailHeader";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Detail",
  breadCrumb: ["Home", "Projects", "Detail"],
};

export default function ProjectManageView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const [isInitialized, setIsInitialized] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, GetDetailAppsByProjectId } = useProjects();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 300;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  useEffect(() => {
    const id = searchParams.get("projectId");
    if (id) {
      setProjectId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    const initializeComponent = async () => {
      await delay(3000);
      if (searchParams && (DataAuth || localStorage.getItem("authData"))) {
        setIsInitialized(true);
      }
    };
    initializeComponent();
  }, [searchParams, DataAuth]);

  useEffect(() => {
    if (DataAuth && projectId && isInitialized) {
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
        }

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
          breadCrumb: ["Home", "Projects", itemsData.projectCode],
        });
        setIsLoadingProcess(false);
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId, isInitialized]);

  useEffect(() => {
    if (DataAuth && DataProject && !DataApps && isInitialized) {
      const GetAppData = async () => {
        const requestData = await GetDetailAppsByProjectId(
          DataProject.id,
          tokenData
        );
        if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
          setDataApps(requestData.data as AppsResponse);
        }
      };
      GetAppData();
    }
  }, [DataAuth, DataProject, DataApps, isInitialized]);

  // Conditional rendering logic
  const isInternalDev =
    DataProject?.projectType === PROJECT_TYPE_INTERNAL_DEVELOPMENT;
  const isProcurement = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT;
  const hasRequirement = DataProject?.reqParentId !== null;
  const showFeaturesTab = isInternalDev || (isProcurement && hasRequirement);
  const showWorkstageTab = isProcurement;

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
      <ProjectDetailHeader
        DataProject={DataProject}
        DataApps={DataApps}
        projectId={projectId}
        IsLoadingProcess={IsLoadingProcess}
        onRefresh={() => setRefreshData((prev) => prev + 1)}
      />

      <Box w="full" overflow="hidden">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w={"full"}>
            <Tabs variant={"unstyled"} colorScheme={"secondary"} size={"lg"}>
              <Box mb={4}>
                <TabList
                  ref={tabsRef}
                  gap={2}
                  p={2}
                  overflowX={"auto"}
                  justifyContent="start"
                  sx={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                >
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
                  {showFeaturesTab && (
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiCpu size={16} />
                        <Text>Features</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                  )}
                  {showWorkstageTab && (
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiPlayCircle size={16} />
                        <Text>Workstage</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                  )}
                  <TabButtonCustomStyle>
                    <HStack>
                      <FiFileText size={16} />
                      <Text>Documentation</Text>
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

                <Flex justify="flex-end" mt={2}>
                  <HStack spacing={1}>
                    <Button
                      size="xs"
                      onClick={() => scrollTabs("left")}
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      shadow="md"
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.600",
                      }}
                    >
                      <FiChevronLeft />
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => scrollTabs("right")}
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      shadow="md"
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.600",
                      }}
                    >
                      <FiChevronRight />
                    </Button>
                  </HStack>
                </Flex>
              </Box>

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
                <CardBody>
                  <TabPanels minH="600px">
                    <OverviewTab DataProject={DataProject} />
                    <DetailsTab DataProject={DataProject} />
                    {showFeaturesTab && (
                      <FeaturesTab DataProject={DataProject} />
                    )}
                    {showWorkstageTab && (
                      <WorkstageProcurementTab DataProject={DataProject} />
                    )}
                    <DocumentationTab DataProject={DataProject} />
                    <TeamTab DataProject={DataProject} />
                    <AnalyticsTab DataProject={DataProject} />
                    <TimelineTab DataProject={DataProject} />
                    <EditTab DataProject={DataProject} />
                  </TabPanels>
                </CardBody>
              </Card>
            </Tabs>
          </GridItem>

          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w={"full"}>
            <Box w={"full"} flexShrink={0}>
              <VStack spacing={{ base: 4, md: 6 }}>
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
                        <Box position="relative">
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
                                : DataProject.appsProject.appsStatus ===
                                  "TESTING"
                                ? "orange.400"
                                : "red.400"
                            }
                            rounded="full"
                            border="2px solid white"
                            shadow="md"
                            animation="pulse 2s ease-in-out infinite"
                          />
                        </Box>
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
                        <SimpleGrid
                          columns={{ base: 1, sm: 2 }}
                          spacing={4}
                          w="full"
                        >
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
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="white"
                              >
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

                <Card
                  w="full"
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  bgColor={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  _hover={{
                    shadow: "xl",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s ease"
                >
                  <CardHeader
                    bg={colorMode === "light" ? "blue.50" : "gray.800"}
                    roundedTop={radiusStyle}
                    borderBottom="1px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.600"
                    }
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

                <Card
                  w="full"
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  bgColor={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  _hover={{
                    shadow: "xl",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s ease"
                >
                  <CardHeader
                    bg={colorMode === "light" ? "green.50" : "gray.800"}
                    roundedTop={radiusStyle}
                    borderBottom="1px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.600"
                    }
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
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}
