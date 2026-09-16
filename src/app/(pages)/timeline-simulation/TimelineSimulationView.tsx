"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  Heading,
  Avatar,
  AvatarGroup,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiFolder,
  FiLayers,
  FiSliders,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle, RES_CODE_OK, WORKLOAD_ESTIMATION_RULES } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";

import { ActivityType, SimulationMember, SimulationStage } from "./types";
import {
  ACTIVITY_TYPE_META,
  STAGE_TEMPLATES,
} from "./constants/stageTemplates";
import {
  autoScheduleStages,
  computeEndDate,
  toDateString,
} from "./utils/weekBucket";
import {
  buildWorkloadMap,
  calculateSimulationContentionTotals,
  getRuleForProjectCount,
} from "./utils/workloadHelper";
import useTimelineSimulationState from "./hooks/useTimelineSimulation";
import ActivityTypeSelector from "./components/ActivityTypeSelector";
import AssignedProjectPicker from "./components/AssignedProjectPicker";
import StageInputTable from "./components/StageInputTable";
import StageFormModal from "./components/StageFormModal";
import VisualizationSwitcher from "./components/VisualizationSwitcher";
import GanttChart from "./components/GanttChart";
import TimelineChart from "./components/TimelineChart";
import SaveLoadBar from "./components/SaveLoadBar";

const TimelineSimulationView = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const sim = useTimelineSimulationState("INTERNAL DEVELOPMENT");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [editingStage, setEditingStage] = useState<SimulationStage | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Auto-schedule default template stages on mount so the visualization renders immediately
  useEffect(() => {
    if (sim.stages.length === 0) {
      const names = STAGE_TEMPLATES["INTERNAL DEVELOPMENT"] ?? [];
      const rawStages: SimulationStage[] = names.map((name, idx) => ({
        id: `stg_init_${idx}`,
        activityType: "INTERNAL DEVELOPMENT",
        projectId: null,
        stageName: name,
        order: idx,
        parties: [],
        startDate: null,
        endDate: null,
        durationDays: 7,
        backlogId: null,
        backlogName: null,
      }));
      sim.replaceStages(autoScheduleStages(rawStages));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Explicit simulation trigger: auto-schedules any missing dates and refreshes the visualization
  const handleSimulate = useCallback(() => {
    if (sim.stages.length === 0) {
      toast({
        description: "Add or claim stages before running the simulation.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSimulating(true);
    const scheduled = autoScheduleStages(sim.stages);
    sim.replaceStages(scheduled);

    setTimeout(() => {
      setIsSimulating(false);
      toast({
        title: "Simulation Updated",
        description: `Visualized ${scheduled.length} stage(s) across the timeline.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    }, 250);
  }, [sim, toast]);

  // Handle stage drag-and-drop reordering with immediate schedule refresh
  const handleReorder = useCallback(
    (reordered: SimulationStage[]) => {
      const scheduled = autoScheduleStages(reordered);
      sim.replaceStages(scheduled);
      toast({
        title: "Stage Sequence Updated",
        description: "Timeline visualization updated to reflect the new stage order.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    },
    [sim, toast]
  );

  // Auth setup (repo pattern)
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

  const userId = useMemo(
    () => DataAuth?.userId || DataAuth?.id || "",
    [DataAuth]
  );

  const { List: ListAllProjects } = useProjects();
  const listAllProjectsRef = useRef(ListAllProjects);
  listAllProjectsRef.current = ListAllProjects;
  const [allProjects, setAllProjects] = useState<ProjectDataResponse[]>([]);
  const hasFetchedProjectsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tokenData || hasFetchedProjectsRef.current === tokenData) return;
    hasFetchedProjectsRef.current = tokenData;

    listAllProjectsRef.current(
      {
        search: "",
        limit: 100,
        page: 0,
        filterWhere: [],
        fieldOrder: ["projectName"],
        orderDir: "asc",
      },
      tokenData
    ).then((res) => {
      if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
        setAllProjects(res.data);
      }
    });
  }, [tokenData]);

  const workloadMap = useMemo(() => {
    return buildWorkloadMap(allProjects);
  }, [allProjects]);

  const contentionTotals = useMemo(() => {
    return calculateSimulationContentionTotals(sim.stages);
  }, [sim.stages]);

  const handleClaim = (stages: SimulationStage[], projectId: string | null) => {
    sim.replaceStages(stages);
    sim.setProjectId(projectId);
  };

  const handleActivityChange = (type: ActivityType) => {
    sim.setActivityType(type);
    if (!sim.projectId) {
      const names = STAGE_TEMPLATES[type] ?? [];
      const rawStages: SimulationStage[] = names.map((name, idx) => ({
        id: `stg_${type.toLowerCase()}_${idx}`,
        activityType: type,
        projectId: null,
        stageName: name,
        order: idx,
        parties: [],
        members: [],
        startDate: null,
        endDate: null,
        durationDays: 7,
        extendedDays: 0,
        backlogId: null,
        backlogName: null,
      }));
      sim.replaceStages(autoScheduleStages(rawStages));
    }
  };

  const openAdd = () => {
    setEditingStage(null);
    onOpen();
  };

  const openEdit = (stage: SimulationStage) => {
    setEditingStage(stage);
    onOpen();
  };

  // The start date of a new stage defaults to the end date of the previous stage (-1 index)
  const defaultStartDateForAdd = useMemo(() => {
    if (sim.stages.length === 0) return toDateString(new Date());
    const prev = sim.stages[sim.stages.length - 1];
    return prev.endDate || prev.startDate || toDateString(new Date());
  }, [sim.stages]);

  const handleStageSubmit = (values: {
    stageName: string;
    parties: SimulationStage["parties"];
    members: SimulationMember[];
    startDate: string | null;
    endDate: string | null;
    durationDays: number | null;
    extendedDays: number | null;
    backlogId: string | null;
    backlogName: string | null;
  }) => {
    if (editingStage) {
      sim.updateStage(editingStage.id, {
        stageName: values.stageName,
        parties: values.parties,
        members: values.members,
        startDate: values.startDate,
        endDate: values.endDate,
        durationDays: values.durationDays,
        extendedDays: values.extendedDays,
        backlogId: values.backlogId,
        backlogName: values.backlogName,
      });
    } else {
      const start = values.startDate || defaultStartDateForAdd;
      const dur = values.durationDays ?? 7;
      const ext = values.extendedDays ?? 0;
      const end = values.endDate || computeEndDate(start, dur + ext);

      sim.addStage({
        activityType: sim.activityType,
        projectId: sim.projectId,
        stageName: values.stageName,
        parties: values.parties,
        members: values.members,
        startDate: start,
        endDate: end,
        durationDays: dur,
        extendedDays: ext,
        backlogId: values.backlogId,
        backlogName: values.backlogName,
      });
    }
  };

  // Derived metrics for UI/UX dashboard including contention buffer
  const totalDurationDays = useMemo(() => {
    return sim.stages.reduce(
      (acc, s) => acc + (s.durationDays || 0) + (s.extendedDays || 0),
      0
    );
  }, [sim.stages]);

  const stagesWithBacklogCount = useMemo(() => {
    return sim.stages.filter((s) => s.backlogId != null).length;
  }, [sim.stages]);

  const uniquePartiesCount = useMemo(() => {
    const ids = new Set<string>();
    sim.stages.forEach((s) => s.parties.forEach((p) => ids.add(p.id)));
    return ids.size;
  }, [sim.stages]);

  const activityMeta = ACTIVITY_TYPE_META[sim.activityType];
  const border = isDark ? "gray.700" : "gray.200";
  const cardBg = isDark ? "gray.800" : "white";

  return (
    <LayoutAdmin>
      <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
        {/* ── Page Header ── */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
          mb={6}
        >
          <HStack spacing={4}>
            <Box
              w={12}
              h={12}
              bgGradient="linear(135deg, secondary.500, secondary.700)"
              rounded={radiusStyle}
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="md"
              flexShrink={0}
            >
              <Icon as={FiClock} boxSize={6} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="lg">Timeline Simulation</Heading>
              <Text
                fontSize="sm"
                color={isDark ? "gray.400" : "gray.500"}
              >
                Build, schedule, and visualise developer milestones as Gantt or timeline charts.
              </Text>
            </VStack>
          </HStack>
          <SaveLoadBar
            token={tokenData}
            simulationName={sim.simulationName}
            onNameChange={sim.setSimulationName}
            buildPayload={(name) => sim.toSavePayload(name)}
            onLoaded={sim.hydrate}
            onSaved={sim.hydrate}
          />
        </Flex>

        {/* ── Two-column layout: sidebar (controls & metrics) + main (stages + viz) ── */}
        <Grid
          templateColumns={{ base: "1fr", lg: "320px minmax(0, 1fr)" }}
          gap={5}
          alignItems="start"
          w="100%"
          maxW="100%"
        >
          {/* ── Left Sidebar ── */}
          <VStack spacing={4} align="stretch">
            {/* 1. Configuration Hub Card */}
            <Card
              bg={cardBg}
              rounded={radiusStyle}
              shadow="lg"
              border="1px solid"
              borderColor={border}
              overflow="hidden"
            >
              <CardHeader
                pb={3}
                pt={4}
                px={4}
                borderBottom="1px solid"
                borderColor={border}
                bg={isDark ? "whiteAlpha.50" : "gray.50"}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={2.5}>
                    <Box
                      w={7}
                      h={7}
                      rounded="md"
                      bg="secondary.500"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="xs"
                    >
                      <Icon as={FiSliders} boxSize={3.5} />
                    </Box>
                    <Heading size="xs" fontWeight="bold">
                      Simulation Setup
                    </Heading>
                  </HStack>
                  <Badge
                    colorScheme={activityMeta.colorScheme}
                    variant="subtle"
                    rounded="full"
                    px={2}
                    py={0.5}
                    fontSize="2xs"
                    fontWeight="bold"
                  >
                    {activityMeta.label}
                  </Badge>
                </Flex>
              </CardHeader>

              <CardBody p={4}>
                <VStack spacing={4} align="stretch">
                  {/* Activity Stream Section */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={isDark ? "gray.400" : "gray.600"}
                      >
                        Activity Stream
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        Select flow
                      </Text>
                    </HStack>
                    <ActivityTypeSelector
                      value={sim.activityType}
                      onChange={handleActivityChange}
                    />
                  </Box>

                  <Divider borderColor={border} />

                  {/* Project Linkage Section */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={1.5}>
                        <Icon as={FiFolder} color="secondary.500" boxSize={3.5} />
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          color={isDark ? "gray.400" : "gray.600"}
                        >
                          Source Project
                        </Text>
                      </HStack>
                    </HStack>
                    <AssignedProjectPicker
                      token={tokenData}
                      userId={userId}
                      activityType={sim.activityType}
                      onClaim={handleClaim}
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* 2. Simulation Metrics & KPI Overview Card (Styled after VendorSidebar) */}
            <Card
              bg={cardBg}
              rounded={radiusStyle}
              shadow="lg"
              border="1px solid"
              borderColor={isDark ? "secondary.700" : "secondary.300"}
              overflow="hidden"
            >
              {/* Header Gradient Banner */}
              <Box
                bgGradient="linear(to-br, secondary.700, secondary.500)"
                p={4}
                color="white"
              >
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bg="whiteAlpha.200"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(10px)"
                    shadow="sm"
                  >
                    <Icon as={FiTrendingUp} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="xs" fontWeight="bold">
                      Simulation Overview
                    </Heading>
                    <Text fontSize="2xs" opacity={0.9}>
                      Live stage metrics & schedule span
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <CardBody p={4}>
                <VStack spacing={3.5} align="stretch">
                  {/* 2-Column KPI Cards */}
                  <SimpleGrid columns={2} spacing={2.5}>
                    <Box
                      textAlign="center"
                      p={3}
                      bg={isDark ? "whiteAlpha.50" : "blue.50"}
                      rounded="xl"
                      border="1px"
                      borderColor={isDark ? "whiteAlpha.100" : "blue.100"}
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="800"
                        color="secondary.500"
                        lineHeight="none"
                      >
                        {sim.stages.length}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color={isDark ? "gray.300" : "gray.600"}
                        fontWeight="bold"
                        mt={1.5}
                      >
                        Total Stages
                      </Text>
                    </Box>

                    <Box
                      textAlign="center"
                      p={3}
                      bg={isDark ? "whiteAlpha.50" : "purple.50"}
                      rounded="xl"
                      border="1px"
                      borderColor={isDark ? "whiteAlpha.100" : "purple.100"}
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="800"
                        color="purple.500"
                        lineHeight="none"
                      >
                        {totalDurationDays > 0 ? `${totalDurationDays}d` : "0d"}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color={isDark ? "gray.300" : "gray.600"}
                        fontWeight="bold"
                        mt={1.5}
                      >
                        Total Duration
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Schedule Date Span Box */}
                  <Box
                    p={3}
                    bg={isDark ? "whiteAlpha.50" : "gray.50"}
                    rounded="xl"
                    border="1px"
                    borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                  >
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={1.5}>
                          <Icon as={FiCalendar} color="secondary.500" boxSize={3.5} />
                          <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            color={isDark ? "gray.300" : "gray.600"}
                          >
                            Schedule Window
                          </Text>
                        </HStack>
                        {sim.dateRange.min && sim.dateRange.max ? (
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            rounded="full"
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                          >
                            Scheduled
                          </Badge>
                        ) : (
                          <Badge
                            colorScheme="gray"
                            variant="subtle"
                            rounded="full"
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                          >
                            Draft
                          </Badge>
                        )}
                      </Flex>

                      {sim.dateRange.min && sim.dateRange.max ? (
                        <HStack justify="space-between" fontSize="xs">
                          <Text fontFamily="mono" fontWeight="600" color={isDark ? "gray.200" : "gray.700"}>
                            {sim.dateRange.min}
                          </Text>
                          <Text color="gray.400">→</Text>
                          <Text fontFamily="mono" fontWeight="600" color={isDark ? "gray.200" : "gray.700"}>
                            {sim.dateRange.max}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontSize="2xs" color="gray.500">
                          Set stage start/end dates to view projected schedule span.
                        </Text>
                      )}
                    </VStack>
                  </Box>

                  {/* Metadata Row: Connected Backlogs & Involved Parties */}
                  <VStack spacing={2} align="stretch" pt={1}>
                    <Flex justify="space-between" align="center" fontSize="xs">
                      <HStack spacing={1.5}>
                        <Icon as={FiCheckCircle} color="teal.500" boxSize={3.5} />
                        <Text color={isDark ? "gray.300" : "gray.600"}>
                          Linked Backlogs
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme="teal"
                        variant="subtle"
                        rounded="full"
                        px={2}
                        py={0.5}
                        fontSize="2xs"
                      >
                        {stagesWithBacklogCount} / {sim.stages.length}
                      </Badge>
                    </Flex>

                    <Flex justify="space-between" align="center" fontSize="xs">
                      <HStack spacing={1.5}>
                        <Icon as={FiUsers} color="blue.500" boxSize={3.5} />
                        <Text color={isDark ? "gray.300" : "gray.600"}>
                          Assigned Parties
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        rounded="full"
                        px={2}
                        py={0.5}
                        fontSize="2xs"
                      >
                        {uniquePartiesCount} {uniquePartiesCount === 1 ? "party" : "parties"}
                      </Badge>
                    </Flex>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* 3. Resource Contention & Delay Analysis Card (Live Calculation Display) */}
            <Card
              bg={cardBg}
              rounded={radiusStyle}
              shadow="lg"
              border="1px solid"
              borderColor={contentionTotals.totalExtendedDays > 0 ? "orange.300" : border}
              overflow="hidden"
            >
              <CardHeader
                pb={2.5}
                pt={3.5}
                px={4}
                borderBottom="1px solid"
                borderColor={border}
                bg={
                  contentionTotals.totalExtendedDays > 0
                    ? isDark
                      ? "orange.950"
                      : "orange.50"
                    : isDark
                    ? "whiteAlpha.50"
                    : "gray.50"
                }
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={2.5}>
                    <Box
                      w={7}
                      h={7}
                      rounded="md"
                      bg={contentionTotals.totalExtendedDays > 0 ? "orange.500" : "gray.500"}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="xs"
                    >
                      <Icon as={FiAlertTriangle} boxSize={3.5} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="xs" fontWeight="bold">
                        Contention & Slippage
                      </Heading>
                      <Text fontSize="3xs" color="gray.500">
                        Multi-project load calculation
                      </Text>
                    </VStack>
                  </HStack>
                  {contentionTotals.totalExtendedDays > 0 ? (
                    <Badge colorScheme="orange" variant="solid" rounded="full" px={2} py={0.5} fontSize="3xs">
                      +{contentionTotals.totalExtendedDays}d Buffer
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" variant="subtle" rounded="full" px={2} py={0.5} fontSize="3xs">
                      Normal Load
                    </Badge>
                  )}
                </Flex>
              </CardHeader>

              <CardBody p={4}>
                <VStack spacing={3} align="stretch">
                  {/* 3-Column Schedule Calculation Breakdown */}
                  <SimpleGrid columns={3} spacing={2}>
                    <Box
                      textAlign="center"
                      p={2}
                      bg={isDark ? "whiteAlpha.50" : "gray.50"}
                      rounded="lg"
                      border="1px"
                      borderColor={border}
                    >
                      <Text fontSize="lg" fontWeight="800" color={isDark ? "gray.200" : "gray.700"}>
                        {contentionTotals.totalBaseDays}d
                      </Text>
                      <Text fontSize="3xs" color="gray.500" fontWeight="bold">
                        Base Work
                      </Text>
                    </Box>

                    <Box
                      textAlign="center"
                      p={2}
                      bg={
                        contentionTotals.totalExtendedDays > 0
                          ? isDark
                            ? "orange.900"
                            : "orange.50"
                          : isDark
                          ? "whiteAlpha.50"
                          : "gray.50"
                      }
                      rounded="lg"
                      border="1px"
                      borderColor={contentionTotals.totalExtendedDays > 0 ? "orange.300" : border}
                    >
                      <Text
                        fontSize="lg"
                        fontWeight="800"
                        color={contentionTotals.totalExtendedDays > 0 ? "orange.500" : "gray.500"}
                      >
                        +{contentionTotals.totalExtendedDays}d
                      </Text>
                      <Text
                        fontSize="3xs"
                        color={contentionTotals.totalExtendedDays > 0 ? "orange.400" : "gray.500"}
                        fontWeight="bold"
                      >
                        Buffer Ext.
                      </Text>
                    </Box>

                    <Box
                      textAlign="center"
                      p={2}
                      bg={isDark ? "whiteAlpha.50" : "purple.50"}
                      rounded="lg"
                      border="1px"
                      borderColor={isDark ? "whiteAlpha.100" : "purple.100"}
                    >
                      <Text fontSize="lg" fontWeight="800" color="purple.500">
                        {contentionTotals.totalEffectiveDays}d
                      </Text>
                      <Text fontSize="3xs" color="purple.600" fontWeight="bold">
                        Simulated
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Overloaded Members List */}
                  {contentionTotals.overloadedMembers.length > 0 ? (
                    <Box>
                      <Text fontSize="3xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1.5}>
                        Contention Members ({contentionTotals.overloadedMembers.length})
                      </Text>
                      <VStack align="stretch" spacing={1.5}>
                        {contentionTotals.overloadedMembers.map(({ member, count }) => {
                          const rule = getRuleForProjectCount(count);
                          return (
                            <Flex
                              key={member.id}
                              justify="space-between"
                              align="center"
                              p={2}
                              bg={isDark ? "whiteAlpha.50" : "gray.50"}
                              rounded="md"
                              border="1px solid"
                              borderColor={border}
                            >
                              <HStack spacing={2} minW="0">
                                <Avatar
                                  size="2xs"
                                  boxSize="18px"
                                  fontSize="8px"
                                  name={member.name}
                                  src={member.profilePict || undefined}
                                />
                                <VStack align="start" spacing={0} minW="0">
                                  <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                    {member.name}
                                  </Text>
                                  <Text fontSize="4xs" color="gray.500">
                                    {count} Proyek Concurrent ({rule.badgeLabel})
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge colorScheme={rule.color} fontSize="4xs" rounded="sm" px={1.5}>
                                +{Math.round(rule.overheadFactor * 100)}%
                              </Badge>
                            </Flex>
                          );
                        })}
                      </VStack>
                    </Box>
                  ) : (
                    <Box
                      p={2.5}
                      bg={isDark ? "whiteAlpha.50" : "gray.50"}
                      rounded="md"
                      textAlign="center"
                    >
                      <Text fontSize="3xs" color="gray.500">
                        Beban normal (1 proyek / user). Tidak ada bottleneck schedule terdeteksi.
                      </Text>
                    </Box>
                  )}

                  {/* Applied Rules Standard Footnote */}
                  <Box pt={1} borderTop="1px dashed" borderColor={border}>
                    <Text fontSize="4xs" color="gray.500" lineHeight="short">
                      <strong>Standar Perhitungan:</strong> {WORKLOAD_ESTIMATION_RULES.metadata.title} (Aturan 1+1+1 pada applicationConstants.ts).
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* ── Right Main ── */}
          <VStack spacing={5} align="stretch" minW="0" maxW="100%">
            {/* Stages Card */}
            <Card
              bg={cardBg}
              rounded={radiusStyle}
              shadow="lg"
              border="1px solid"
              borderColor={border}
              minW="0"
              maxW="100%"
            >
              <CardBody p={5} minW="0" maxW="100%">
                <StageInputTable
                  stages={sim.stages}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onRemove={sim.removeStage}
                  onReorder={handleReorder}
                  onSimulate={handleSimulate}
                  isSimulating={isSimulating}
                />
              </CardBody>
            </Card>

            {/* Visualization Card */}
            <Card
              bg={cardBg}
              rounded={radiusStyle}
              shadow="lg"
              border="1px solid"
              borderColor={border}
              minW="0"
              maxW="100%"
              overflow="hidden"
            >
              <CardHeader
                borderBottom="1px solid"
                borderColor={border}
                py={3.5}
                px={5}
                bg={isDark ? "whiteAlpha.50" : "gray.50"}
              >
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align={{ base: "start", sm: "center" }}
                  gap={3}
                >
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg="secondary.500"
                      color="white"
                      rounded="lg"
                      shadow="sm"
                    >
                      <Icon as={FiLayers} boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="xs" fontWeight="bold">
                        Timeline Visualization
                      </Heading>
                      <Text
                        fontSize="2xs"
                        color={isDark ? "gray.400" : "gray.500"}
                      >
                        Executive Gantt Table & Horizontal Chevron Roadmap
                      </Text>
                    </VStack>
                  </HStack>
                  <VisualizationSwitcher
                    value={sim.visualizationMode}
                    onChange={sim.setVisualizationMode}
                  />
                </Flex>
              </CardHeader>
              <CardBody p={5} minW="0" maxW="100%" overflowX="hidden">
                <Box w="100%" minW="0" maxW="100%" overflow="hidden">
                  {sim.visualizationMode === "gantt" ? (
                    <GanttChart
                      key={`gantt-${sim.stages.length}-${colorMode}`}
                      stages={sim.stages}
                    />
                  ) : (
                    <TimelineChart
                      key={`timeline-${sim.stages.length}-${colorMode}`}
                      stages={sim.stages}
                    />
                  )}
                </Box>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </Box>

      <StageFormModal
        isOpen={isOpen}
        onClose={onClose}
        token={tokenData}
        projectId={editingStage?.projectId || sim.projectId}
        workloadMap={workloadMap}
        stage={editingStage}
        defaultStartDate={defaultStartDateForAdd}
        onSubmit={handleStageSubmit}
      />
    </LayoutAdmin>
  );
};

export default TimelineSimulationView;
