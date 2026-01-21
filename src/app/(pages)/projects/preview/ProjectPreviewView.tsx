"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
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
  Card,
  CardBody,
  Grid,
  GridItem,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  useColorMode,
  VStack,
  Button,
  Badge,
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
  FiChevronLeft,
  FiChevronRight,
  FiEye,
} from "react-icons/fi";
import { TabButtonCustomStyle } from "@/app/components/TabsCustom";
import {
  OverviewTabPreview,
  DetailsTabPreview,
  FeaturesTabPreview,
  WorkstageTabPreview,
  DocumentationTabPreview,
  TeamTabPreview,
  AnalyticsTabPreview,
  TimelineTabPreview,
} from "./tabs";
import { ProjectPreviewHeader } from "./components/ProjectPreviewHeader";
import { ProjectPreviewSidebar } from "./components/ProjectPreviewSidebar";

export default function ProjectPreviewView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const [isInitialized, setIsInitialized] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, GetDetailAppsByProjectId } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
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
        setIsLoadingProcess(false);
      };
      GetDataList();
    }
  }, [DataAuth, projectId, isInitialized]);

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
                Loading Project Preview
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "light" ? "gray.500" : "gray.500"}
              >
                Please wait while we prepare the project details...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <ProjectPreviewHeader
        DataProject={DataProject}
        DataApps={DataApps}
        projectId={projectId}
        IsLoadingProcess={IsLoadingProcess}
      />

      <Box w="full" overflow="hidden">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w={"full"}>
            <Tabs variant={"unstyled"} colorScheme={"secondary"} size={"lg"}>
              <Box mb={4}>
                <HStack justify="space-between" mb={2}>
                  <Badge
                    colorScheme="gray"
                    fontSize="sm"
                    px={3}
                    py={1}
                    rounded="full"
                  >
                    <HStack spacing={1}>
                      <FiEye size={14} />
                      <Text>View Only Mode</Text>
                    </HStack>
                  </Badge>
                </HStack>
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
                  {showWorkstageTab && (
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiPlayCircle size={16} />
                        <Text>Procurements</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                  )}
                  {showFeaturesTab && (
                    <TabButtonCustomStyle>
                      <HStack>
                        <FiCpu size={16} />
                        <Text>Work Progress</Text>
                      </HStack>
                    </TabButtonCustomStyle>
                  )}
                  <TabButtonCustomStyle>
                    <HStack>
                      <FiFileText size={16} />
                      <Text>Work Documentation</Text>
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
                </TabList>

                <HStack justify="flex-end" mt={2}>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("left")}
                    bg={
                      colorMode === "light" ? "secondary.500" : "secondary.700"
                    }
                    shadow="md"
                    _hover={{
                      bg:
                        colorMode === "light"
                          ? "secondary.400"
                          : "secondary.600",
                    }}
                    color={"white"}
                  >
                    <FiChevronLeft />
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("right")}
                    bg={
                      colorMode === "light" ? "secondary.500" : "secondary.700"
                    }
                    shadow="md"
                    _hover={{
                      bg:
                        colorMode === "light"
                          ? "secondary.400"
                          : "secondary.600",
                    }}
                    color={"white"}
                  >
                    <FiChevronRight />
                  </Button>
                </HStack>
              </Box>

              <Card
                shadow="md"
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
                transition="all 0.3s ease"
              >
                <CardBody>
                  <TabPanels minH="600px">
                    <OverviewTabPreview DataProject={DataProject} />
                    <DetailsTabPreview DataProject={DataProject} />
                    {showWorkstageTab && (
                      <WorkstageTabPreview DataProject={DataProject} />
                    )}
                    {showFeaturesTab && (
                      <FeaturesTabPreview DataProject={DataProject} />
                    )}
                    <DocumentationTabPreview DataProject={DataProject} />
                    <TeamTabPreview DataProject={DataProject} />
                    <AnalyticsTabPreview DataProject={DataProject} />
                    <TimelineTabPreview DataProject={DataProject} />
                  </TabPanels>
                </CardBody>
              </Card>
            </Tabs>
          </GridItem>

          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w={"full"}>
            <ProjectPreviewSidebar
              DataProject={DataProject}
              DataApps={DataApps}
            />
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}
