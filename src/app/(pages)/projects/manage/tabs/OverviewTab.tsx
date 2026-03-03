"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import useProjects, {
  ProjectDataResponse,
  ProjectQuickStatsResponse,
  ProjectBacklogStatsResponse,
  ProjectDocumentationStatsResponse,
  ProjectProcurementStatsResponse,
  ProjectMemberTaskStatsResponse,
  ProjectDeadlineStatsResponse,
  ProjectSdlcStageResponse,
} from "@/app/services/useProjects";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Box,
  Text,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Avatar,
  AvatarGroup,
  Divider,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import {
  FiUsers,
  FiAlertCircle,
  FiFileText,
  FiShoppingCart,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

interface OverviewTabProps {
  DataProject: ProjectDataResponse | null;
  onRefreshProject: () => void;
}

const OverviewTab = ({ DataProject, onRefreshProject }: OverviewTabProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const {
    GetProjectQuickStats,
    GetProjectBacklogStats,
    GetProjectDocumentationStats,
    GetProjectProcurementStats,
    GetProjectMemberTaskStats,
    GetProjectDeadlineStats,
    UpdateProjectProgressionAndStatus,
    GetProjectSdlcStages,
  } = useProjects();
  const { GetDetailById: GetRequirementDetailById } = useRequirements();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  // Stats State
  const [QuickStats, setQuickStats] = useState<ProjectQuickStatsResponse | null>(null);
  const [BacklogStats, setBacklogStats] = useState<ProjectBacklogStatsResponse | null>(null);
  const [DocumentationStats, setDocumentationStats] = useState<ProjectDocumentationStatsResponse | null>(null);
  const [ProcurementStats, setProcurementStats] = useState<ProjectProcurementStatsResponse | null>(null);
  const [MemberStats, setMemberStats] = useState<ProjectMemberTaskStatsResponse | null>(null);
  const [DeadlineStats, setDeadlineStats] = useState<ProjectDeadlineStatsResponse | null>(null);
  const [SdlcStages, setSdlcStages] = useState<ProjectSdlcStageResponse[]>([]);
  const [IsLoadingStats, setIsLoadingStats] = useState(false);
  const [IsUpdatingProgression, setIsUpdatingProgression] = useState(false);
  const [RequirementData, setRequirementData] = useState<RequirementsResponse | null>(null);

  // Check if project is procurement type
  const isProcurement = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT;

  // Check if project has SDLC setup
  const hasSdlcSetup = DataProject?.sdlcId != null;

  // Check if project has requirement (for showing backlog statistics)
  const hasRequirement = DataProject?.reqParentId != null;

  // Calculate SDLC progression
  const stageProgression = useMemo(() => {
    const totalStages = SdlcStages.length;
    const completedStages = SdlcStages.filter(
      (stage) => stage.startDate !== null && stage.endDate !== null
    ).length;
    const inProgressStages = SdlcStages.filter(
      (stage) => stage.startDate !== null && stage.endDate === null
    ).length;
    const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return {
      totalStages,
      completedStages,
      inProgressStages,
      percentage,
    };
  }, [SdlcStages]);

  // Fetch All Stats Function
  const fetchAllStats = async () => {
    if (!DataAuth || !DataProject || !tokenData) return;

    setIsLoadingStats(true);
    try {
      const [quick, backlog, documentation, procurement, member, deadline] = await Promise.all([
        GetProjectQuickStats(DataProject.id, tokenData),
        GetProjectBacklogStats(DataProject.id, tokenData),
        GetProjectDocumentationStats(DataProject.id, tokenData),
        GetProjectProcurementStats(DataProject.id, tokenData),
        GetProjectMemberTaskStats(DataProject.id, tokenData),
        GetProjectDeadlineStats(DataProject.id, tokenData),
      ]);

      if (quick?.statusCode === RES_CODE_OK && quick.data) setQuickStats(quick.data);
      if (backlog?.statusCode === RES_CODE_OK && backlog.data) setBacklogStats(backlog.data);
      if (documentation?.statusCode === RES_CODE_OK && documentation.data) setDocumentationStats(documentation.data);
      if (procurement?.statusCode === RES_CODE_OK && procurement.data) setProcurementStats(procurement.data);
      if (member?.statusCode === RES_CODE_OK && member.data) setMemberStats(member.data);
      if (deadline?.statusCode === RES_CODE_OK && deadline.data) setDeadlineStats(deadline.data);

      // Fetch SDLC stages separately if project has SDLC setup
      if (hasSdlcSetup) {
        const sdlcStages = await GetProjectSdlcStages(DataProject.id, tokenData);
        if (sdlcStages?.statusCode === RES_CODE_OK && sdlcStages.data) {
          setSdlcStages(sdlcStages.data);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      showToast({
        description: "Failed to load statistics",
        statusToast: "error",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch All Stats on mount
  useEffect(() => {
    if (DataAuth && DataProject && tokenData) {
      fetchAllStats();
    }
  }, [DataAuth, DataProject, tokenData]);

  // Fetch requirement data
  useEffect(() => {
    const fetchRequirementData = async () => {
      if (DataProject?.reqParentId && tokenData) {
        try {
          const response = await GetRequirementDetailById(
            DataProject.reqParentId,
            tokenData
          );
          if (response && response.statusCode === RES_CODE_OK) {
            setRequirementData(response.data);
          }
        } catch (error) {
          console.error("Error fetching requirement data:", error);
        }
      }
    };

    fetchRequirementData();
  }, [DataProject?.reqParentId, tokenData]);

  const handleUpdateProgression = async () => {
    if (!DataProject || !tokenData) return;

    setIsUpdatingProgression(true);
    try {
      const response = await UpdateProjectProgressionAndStatus(DataProject.id, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: response.data || "Project progression updated successfully",
          statusToast: "success",
        });
        onRefreshProject();
        fetchAllStats();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    } finally {
      setIsUpdatingProgression(false);
    }
  };

  // Chart Options
  const priorityChartOptions = {
    chart: { type: "pie" },
    labels: ["Critical", "High", "Medium", "Low"],
    colors: ["#C53030", "#F56565", "#ED8936", "#48BB78"],
    legend: { position: "bottom" },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" }
      }
    }]
  };

  const taskStatusChartOptions = {
    chart: { type: "donut" },
    labels: ["To Do", "In Progress", "In Review", "Done"],
    colors: ["#A0AEC0", "#4299E1", "#ED8936", "#48BB78"],
    legend: { position: "bottom" },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" }
      }
    }]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "red";
      case "HIGH": return "red";
      case "MEDIUM": return "orange";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  return (
    <TabPanel>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={colorMode === "light" ? "gray.800" : "white"}>
            Project Overview
          </Heading>
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Icon as={FiRefreshCw} />}
              rounded="full"
              onClick={handleUpdateProgression}
              isLoading={IsUpdatingProgression}
              loadingText="Updating..."
            >
              Update Progression
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={FiRefreshCw} />}
              colorScheme="gray"
              rounded="full"
              onClick={fetchAllStats}
              isLoading={IsLoadingStats}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {IsLoadingStats ? (
          <Box textAlign="center" py={12}>
            <LoadingMiniSignature />
            <Text mt={4} color="gray.500">Loading statistics...</Text>
          </Box>
        ) : (
          <>
            {/* Imported Project Alert */}
            {DataProject?.isImported === "Y" && 
             !(RequirementData && RequirementData.isHaveMemo === "Y") && (
              <Alert
                status="warning"
                variant="subtle"
                rounded="xl"
                bg={colorMode === "light" ? "red.50" : "red.900"}
                borderColor={colorMode === "light" ? "red.300" : "red.600"}
                borderWidth="2px"
              >
                <AlertIcon boxSize={5} color="red.500" />
                <Box flex="1">
                  <AlertTitle fontSize="md" fontWeight="bold" mb={1}>
                    Imported Project
                  </AlertTitle>
                  <AlertDescription fontSize="sm">
                    Some project features are currently limited. Complete the Requirements Details to get the best experience.
                  </AlertDescription>
                </Box>
                <Link target="_blank" rel="noopener noreferrer" href={`/requirements/brd/register?id=${DataProject.reqParentId}`}>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    _hover={{
                      bg: "red.500",
                      color: "white",
                      transform: "translateY(-2px)",
                      shadow: "md",
                    }}
                    transition="all 0.5s"
                  >
                    Edit Requirement
                  </Button>
                </Link>
              </Alert>
            )}

            {/* Quick Stats Section */}
            <Box>
              <Heading size="md" mb={4} color={colorMode === "light" ? "gray.700" : "gray.200"}>
                Quick Stats
              </Heading>
              {QuickStats && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: isProcurement ? 5 : 4 }} spacing={4}>
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
                    <CardBody>
                      <Stat>
                        <HStack justify="space-between" mb={2}>
                          <Icon as={FiLayers} boxSize={6} color="blue.500" />
                        </HStack>
                        <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">{QuickStats.totalBacklogs}</StatNumber>
                        <StatLabel fontSize="sm" color="gray.500">Total Backlogs</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
                    <CardBody>
                      <Stat>
                        <HStack justify="space-between" mb={2}>
                          <Icon as={FiFileText} boxSize={6} color="purple.500" />
                        </HStack>
                        <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">{QuickStats.documentationProgressPercentage}%</StatNumber>
                        <StatLabel fontSize="sm" color="gray.500">Documentation</StatLabel>
                        <StatHelpText fontSize="xs" color="gray.400">{QuickStats.completedDocumentations}/{QuickStats.totalDocumentations} completed</StatHelpText>
                        <Progress value={QuickStats.documentationProgressPercentage} size="sm" colorScheme="purple" rounded="full" mt={2} />
                      </Stat>
                    </CardBody>
                  </Card>

                  {isProcurement && (
                    <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
                      <CardBody>
                        <Stat>
                          <HStack justify="space-between" mb={2}>
                            <Icon as={FiShoppingCart} boxSize={6} color="green.500" />
                          </HStack>
                          <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">{QuickStats.procurementProgressPercentage}%</StatNumber>
                          <StatLabel fontSize="sm" color="gray.500">Procurement</StatLabel>
                          <StatHelpText fontSize="xs" color="gray.400">{QuickStats.completedProcurementStages}/{QuickStats.totalProcurementStages} stages</StatHelpText>
                          <Progress value={QuickStats.procurementProgressPercentage} size="sm" colorScheme="green" rounded="full" mt={2} />
                        </Stat>
                      </CardBody>
                    </Card>
                  )}

                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
                    <CardBody>
                      <Stat>
                        <HStack justify="space-between" mb={2}>
                          <Icon as={FiUsers} boxSize={6} color="cyan.500" />
                        </HStack>
                        <StatNumber fontSize="3xl" fontWeight="bold" color="cyan.500">{QuickStats.activeMembers}</StatNumber>
                        <StatLabel fontSize="sm" color="gray.500">Active Members</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={QuickStats.backlogsNearDeadline > 0 ? "orange.300" : colorMode === "light" ? "gray.200" : "gray.700"} _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
                    <CardBody>
                      <Stat>
                        <HStack justify="space-between" mb={2}>
                          <Icon as={FiAlertCircle} boxSize={6} color={QuickStats.backlogsNearDeadline > 0 ? "orange.500" : "gray.400"} />
                        </HStack>
                        <StatNumber fontSize="3xl" fontWeight="bold" color={QuickStats.backlogsNearDeadline > 0 ? "orange.500" : "gray.400"}>{QuickStats.backlogsNearDeadline}</StatNumber>
                        <StatLabel fontSize="sm" color="gray.500">Near Deadline</StatLabel>
                        {QuickStats.backlogsNearDeadline > 0 && (
                          <StatHelpText fontSize="xs" color="orange.500">Requires attention</StatHelpText>
                        )}
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )}
            </Box>

            <Divider />

            {/* Statistic Breakdown Section */}
            <Box>
              <Heading size="md" mb={4} color={colorMode === "light" ? "gray.700" : "gray.200"}>
                Statistic Breakdown
              </Heading>

              <VStack spacing={6} align="stretch">
                {/* 0. Stage Progression (if SDLC setup) */}
                {hasSdlcSetup && SdlcStages.length > 0 && (
                  <Card 
                    rounded={radiusStyle} 
                    shadow="md" 
                    bg={colorMode === "light" ? "white" : "gray.800"} 
                    borderWidth="1px" 
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm">
                            SDLC Progression - {DataProject?.sdlcStageName || "N/A"}
                          </Heading>
                          <Badge colorScheme="blue" fontSize="md">
                            {stageProgression.percentage}%
                          </Badge>
                        </HStack>
                        <Progress
                          value={stageProgression.percentage}
                          size="lg"
                          colorScheme="blue"
                          rounded="full"
                        />
                        <Text fontSize="sm" color="gray.500">
                          {stageProgression.completedStages} of {stageProgression.totalStages} stages completed
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Completed Stages</Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              {stageProgression.completedStages}/{stageProgression.totalStages}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">In Progress</Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              {stageProgression.inProgressStages}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* 1. Backlog Statistics */}
                {/* Hide for procurement projects without requirement */}
                {BacklogStats && !(isProcurement && !hasRequirement) && (
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm">Backlog Statistics</Heading>
                          <Badge colorScheme="blue">{BacklogStats.progressionPercentage}%</Badge>
                        </HStack>
                        <Progress value={BacklogStats.progressionPercentage} size="lg" colorScheme="blue" rounded="full" />
                        <Text fontSize="sm" color="gray.500">{BacklogStats.completedBacklogs} of {BacklogStats.totalBacklogs} backlogs completed</Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>Backlogs by Priority</Text>
                            <Chart
                              options={priorityChartOptions}
                              series={[BacklogStats.backlogsByPriority.critical, BacklogStats.backlogsByPriority.high, BacklogStats.backlogsByPriority.medium, BacklogStats.backlogsByPriority.low]}
                              type="pie"
                              height={250}
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>Tasks Status Distribution</Text>
                            <Chart
                              options={taskStatusChartOptions}
                              series={[BacklogStats.taskCounts.toDo, BacklogStats.taskCounts.inProgress, BacklogStats.taskCounts.inReview, BacklogStats.taskCounts.done]}
                              type="donut"
                              height={250}
                            />
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* 2. Documentation Statistics */}
                {DocumentationStats && (
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm">Documentation Statistics</Heading>
                          <Badge colorScheme="purple">{DocumentationStats.progressionPercentage}%</Badge>
                        </HStack>
                        <Progress value={DocumentationStats.progressionPercentage} size="lg" colorScheme="purple" rounded="full" />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Total Documents</Text>
                            <Text fontSize="2xl" fontWeight="bold">{DocumentationStats.completedDocumentations}/{DocumentationStats.totalDocumentations}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Parent Workflows</Text>
                            <Text fontSize="2xl" fontWeight="bold">{DocumentationStats.completedParentWorkflows}/{DocumentationStats.totalParentWorkflows}</Text>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* 3. Procurement Statistics - Only show for procurement projects */}
                {isProcurement && ProcurementStats && (
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm">Procurement Statistics</Heading>
                          <Badge colorScheme="green">{ProcurementStats.progressionPercentage}%</Badge>
                        </HStack>
                        <Progress value={ProcurementStats.progressionPercentage} size="lg" colorScheme="green" rounded="full" />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Total Stages</Text>
                            <Text fontSize="2xl" fontWeight="bold">{ProcurementStats.completedProcurementStages}/{ProcurementStats.totalProcurementStages}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Parent Workflows</Text>
                            <Text fontSize="2xl" fontWeight="bold">{ProcurementStats.completedParentWorkflows}/{ProcurementStats.totalParentWorkflows}</Text>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* 4. Member Task Statistics */}
                {MemberStats && MemberStats.members.length > 0 && (
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm">Member Task Statistics</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                          {MemberStats.members.map((member) => (
                            <Box key={member.userId} p={4} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} rounded={radiusStyle}>
                              <VStack align="start" spacing={2}>
                                <HStack>
                                  <Avatar size="sm" name={member.userName} />
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="bold">{member.userName}</Text>
                                    <Text fontSize="xs" color="gray.500">{member.userEmail}</Text>
                                  </VStack>
                                </HStack>
                                <Divider />
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="xs" color="gray.500">Tasks Owned</Text>
                                  <Text fontSize="sm" fontWeight="bold">{member.totalTasksOwned}</Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="xs" color="gray.500">Completed</Text>
                                  <Text fontSize="sm" fontWeight="bold" color="green.500">{member.tasksCompleted}</Text>
                                </HStack>
                                <Progress value={member.completionPercentage} size="sm" colorScheme="green" rounded="full" w="full" />
                                <Text fontSize="xs" color="gray.500" alignSelf="end">{member.completionPercentage}%</Text>
                              </VStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* 5. Deadline Statistics */}
                {DeadlineStats && (
                  <Card rounded={radiusStyle} shadow="md" bg={colorMode === "light" ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm">Items Near Deadline</Heading>

                        {/* Top 3 Backlogs */}
                        {DeadlineStats.topBacklogsNearDeadline.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>Top 3 Backlogs</Text>
                            <VStack spacing={2} align="stretch">
                              {DeadlineStats.topBacklogsNearDeadline.map((backlog) => (
                                <Box key={backlog.id} p={2} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} rounded="md">
                                  <HStack justify="space-between" align="start">
                                    <VStack align="start" spacing={0} flex={1}>
                                      <Text fontSize="sm" fontWeight="medium">{backlog.backlogName}</Text>
                                      <HStack spacing={2} mt={1}>
                                        <Badge colorScheme={getPriorityColor(backlog.priority)} size="sm">{backlog.priority}</Badge>
                                        <Text fontSize="xs" color="gray.500">{backlog.progressionPercentage}%</Text>
                                      </HStack>
                                    </VStack>
                                    <VStack align="end" spacing={0}>
                                      <Text fontSize="xs" color={backlog.daysUntilDeadline < 0 ? "red.500" : "orange.500"} fontWeight="bold">
                                        {backlog.daysUntilDeadline < 0 ? `${Math.abs(backlog.daysUntilDeadline)}d overdue` : `${backlog.daysUntilDeadline}d left`}
                                      </Text>
                                      <Text fontSize="xs" color="gray.400">{backlog.backlogEnddate ? new Date(backlog.backlogEnddate).toLocaleDateString() : "-"}</Text>
                                    </VStack>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {/* Top 3 Tasks */}
                        {DeadlineStats.topTasksNearDeadline.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>Top 3 Tasks</Text>
                            <VStack spacing={2} align="stretch">
                              {DeadlineStats.topTasksNearDeadline.map((task) => (
                                <Box key={task.id} p={2} borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} rounded="md">
                                  <HStack justify="space-between" align="start" mb={1}>
                                    <VStack align="start" spacing={0} flex={1}>
                                      <Text fontSize="sm" fontWeight="medium">{task.taskName}</Text>
                                      <HStack spacing={2} mt={1}>
                                        <Badge colorScheme={getPriorityColor(task.taskPriority)} size="sm">{task.taskPriority}</Badge>
                                        <Badge colorScheme="blue" size="sm" fontSize="xs">{task.boardName}</Badge>
                                      </HStack>
                                    </VStack>
                                    <VStack align="end" spacing={0}>
                                      <Text fontSize="xs" color={task.daysUntilDeadline < 0 ? "red.500" : "orange.500"} fontWeight="bold">
                                        {task.daysUntilDeadline < 0 ? `${Math.abs(task.daysUntilDeadline)}d overdue` : `${task.daysUntilDeadline}d left`}
                                      </Text>
                                      <Text fontSize="xs" color="gray.400">{task.endDate ? new Date(task.endDate).toLocaleDateString() : "-"}</Text>
                                    </VStack>
                                  </HStack>
                                  <HStack justify="space-between" mt={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiCheckCircle} boxSize={3} color="gray.400" />
                                      <Text fontSize="xs" color="gray.500">{task.taskItemsCompleted}/{task.taskItemsTotal}</Text>
                                    </HStack>
                                    {task.assignedUsers.length > 0 && (
                                      <AvatarGroup size="xs" max={3}>
                                        {task.assignedUsers.map((user) => (
                                          <Tooltip key={user.userId} label={user.userName} fontSize="xs">
                                            <Avatar name={user.userName} />
                                          </Tooltip>
                                        ))}
                                      </AvatarGroup>
                                    )}
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                            {DeadlineStats.additionalDeadlineTasksCount > 0 && (
                              <Text fontSize="xs" color="gray.500" mt={2}>
                                + {DeadlineStats.additionalDeadlineTasksCount} more
                              </Text>
                            )}
                          </Box>
                        )}

                        {DeadlineStats.topBacklogsNearDeadline.length === 0 && DeadlineStats.topTasksNearDeadline.length === 0 && (
                          <Box textAlign="center" py={6}>
                            <Icon as={FiCheckCircle} boxSize={10} color="green.500" mb={2} />
                            <Text fontSize="sm" color="gray.500">No items near deadline</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </TabPanel>
  );
};

export default OverviewTab;
