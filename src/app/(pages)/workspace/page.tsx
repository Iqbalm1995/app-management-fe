"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  VStack,
  Icon,
  Divider,
  Progress,
  Spinner,
  Avatar,
  AvatarGroup,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiTarget,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiFolder,
  FiMonitor,
  FiClipboard,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiActivity,
  FiBell,
  FiCalendar,
  FiPlus,
  FiArrowRightCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { Search2Icon } from "@chakra-ui/icons";

// Components
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import ProjectStatusCard from "@/app/components/ProjectStatusCard";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  ProjectDataResponse,
  ProjectDetailResponse,
} from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import { TaskViewModel } from "@/app/services/useTasks";
import useWorkspace, {
  WorkspaceStatsViewModel,
} from "@/app/services/useWorkspace";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  convertToCustomDateFormat,
  formatDateTimeBE,
} from "@/app/helper/MasterHelper";
import Link from "next/link";
import LayoutAdminWorkspace from "@/app/components/layoutAdminWorkspace";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Workspace",
  breadCrumb: ["Home", "Workspace"],
};

const WorkspaceProject = () => {
  useDocumentTitle("Workspace");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [taskLimit, setTaskLimit] = useState(4);
  const [projectLimit, setProjectLimit] = useState(4);
  const isInitialMount = useRef(true);
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetailResponse | null>(null);

  const { colorMode } = useColorMode();

  const {
    isOpen: isProjectModalOpen,
    onOpen: onProjectModalOpen,
    onClose: onProjectModalClose,
  } = useDisclosure();

  // Auth setup
  const [tokenData, setTokenData] = useState<string>("");

  // Workspace API integration
  const {
    GetWorkspaceStats,
    GetAssignedProjects,
    GetProjectDetail,
    GetQuarterProgress,
    GetProjectTypeCounts,
    loading,
  } = useWorkspace();
  const [stats, setStats] = useState<WorkspaceStatsViewModel | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [quarterProgress, setQuarterProgress] = useState<any>(null);
  const [quarterProgressLoading, setQuarterProgressLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Project type filter
  const [selectedProjectType, setSelectedProjectType] = useState<string>("All");
  const [projectTypeCounts, setProjectTypeCounts] = useState({
    all: 0,
    internalDev: 0,
    procurement: 0,
    deployment: 0,
  });

  // Fetch workspace stats on component mount
  // Fetch projects function
  const fetchProjects = async (
    search: string = "",
    limit: number = 9,
    page: number = 0,
    append: boolean = false,
    projectType: string = "All"
  ) => {
    const token = localStorage.getItem("tokenData");
    if (token) {
      setProjectsLoading(true);
      try {
        const payload = {
          search: search,
          limit: limit,
          page: page,
          projectType: projectType !== "All" ? projectType : null,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        };
        const response = await GetAssignedProjects(payload, token);
        if (response?.statusCode === 200 && response.data) {
          if (append) {
            setProjects((prev) => [...prev, ...response.data]);
          } else {
            setProjects(response.data);
          }
          setTotalProjectsCount(response.countTotal || 0);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      } finally {
        setProjectsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("tokenData");
      if (!token) return;

      setTokenData(token);
      setStatsLoading(true);
      setQuarterProgressLoading(true);
      setProjectsLoading(true);

      try {
        const { quarter: q, year: y } = getCurrentQuarter();

        const [statsRes, typeCountsRes, projectsRes, quarterRes] = await Promise.all([
          GetWorkspaceStats(token),
          GetProjectTypeCounts(token),
          GetAssignedProjects({ search: "", limit: 9, page: 0, projectType: null, filterWhere: [], fieldOrder: ["createdAt"], orderDir: "desc" }, token),
          GetQuarterProgress(q, y, token),
        ]);

        if (statsRes?.statusCode === 200 && statsRes.data) setStats(statsRes.data);
        if (typeCountsRes?.statusCode === 200 && typeCountsRes.data) setProjectTypeCounts(typeCountsRes.data);
        if (projectsRes?.statusCode === 200 && projectsRes.data) {
          setProjects(projectsRes.data);
          setTotalProjectsCount(projectsRes.countTotal || 0);
        }
        if (quarterRes?.statusCode === 200) setQuarterProgress(quarterRes.data);
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      } finally {
        setStatsLoading(false);
        setQuarterProgressLoading(false);
        setProjectsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Get current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const quarter = Math.ceil(month / 3);
    return { quarter, year };
  };

  const { quarter, year } = getCurrentQuarter();

  // Search effect
  useEffect(() => {
    // Skip on initial mount to avoid duplicate call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchProjects(searchTerm, 9, 0, false, selectedProjectType);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedProjectType]);

  // Filter tasks by current quarter
  const getTasksInCurrentQuarter = (
    tasks: TaskViewModel[],
    status?: string
  ) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      const taskMonth = taskDate.getMonth() + 1;
      const taskYear = taskDate.getFullYear();
      const taskQuarter = Math.ceil(taskMonth / 3);

      const isCurrentQuarter = taskQuarter === quarter && taskYear === year;

      if (status) {
        return isCurrentQuarter && task.boardCodeStage === status;
      }
      return isCurrentQuarter;
    });
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const cardHoverBg = useColorModeValue("gray.50", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, secondary.500, secondary.800)",
    "linear(to-r, secondary.600, secondary.800)"
  );

  const mockTasks: TaskViewModel[] = [
    {
      id: "task1",
      projectId: "1",
      taskCode: "TSK-001",
      taskName: "API Integration",
      taskDesc: "Integrate payment gateway API with the e-commerce platform",
      taskPriority: "High",
      startDate: "2024-11-01",
      endDate: "2024-11-15",
      isArchived: null,
      indexTask: 1,
      isCompleted: "N",
      percentageStatus: 75,
      backlogId: "backlog1",
      boardId: "board1",
      boardCodeStage: "INPROGRESS",
      boardName: "In Progress",
      boardIndexStage: 2,
      taskPoint: 8,
      countCommnetTask: 3,
      countTaskItem: 5,
      countTaskItemDone: 3,
      countTaskAttachment: 2,
      countRelatedTask: 0,
      createdAt: "2024-11-01T00:00:00Z",
      createdBy: "user1",
      updatedAt: "2024-11-10T00:00:00Z",
      updatedBy: "user1",
      assignUsers: [
        { id: "user1", nama: "John Doe" } as any,
        { id: "user2", nama: "Jane Smith" } as any,
      ],
      userCreated: { id: "user1", nama: "John Doe" } as any,
      taskItems: [],
    },
    {
      id: "task2",
      projectId: "2",
      taskCode: "TSK-002",
      taskName: "UI Design Review",
      taskDesc: "Review and approve mobile banking app UI designs",
      taskPriority: "Medium",
      startDate: "2024-11-05",
      endDate: "2024-11-12",
      isArchived: null,
      indexTask: 2,
      isCompleted: "N",
      percentageStatus: 30,
      backlogId: "backlog2",
      boardId: "board2",
      boardCodeStage: "TODO",
      boardName: "To Do",
      boardIndexStage: 1,
      taskPoint: 5,
      countCommnetTask: 1,
      countTaskItem: 3,
      countTaskItemDone: 1,
      countTaskAttachment: 4,
      countRelatedTask: 0,
      createdAt: "2024-11-05T00:00:00Z",
      createdBy: "user3",
      updatedAt: "2024-11-10T00:00:00Z",
      updatedBy: "user3",
      assignUsers: [{ id: "user3", nama: "Sarah Wilson" } as any],
      userCreated: { id: "user3", nama: "Sarah Wilson" } as any,
      taskItems: [],
    },
    {
      id: "task3",
      projectId: "3",
      taskCode: "TSK-003",
      taskName: "Database Optimization",
      taskDesc: "Optimize database queries for analytics dashboard",
      taskPriority: "Low",
      startDate: "2024-11-08",
      endDate: "2024-11-10",
      isArchived: null,
      indexTask: 3,
      isCompleted: "Y",
      percentageStatus: 100,
      backlogId: "backlog3",
      boardId: "board3",
      boardCodeStage: "DONE",
      boardName: "Done",
      boardIndexStage: 4,
      taskPoint: 3,
      countCommnetTask: 2,
      countTaskItem: 4,
      countTaskItemDone: 4,
      countTaskAttachment: 1,
      countRelatedTask: 0,
      createdAt: "2024-11-08T00:00:00Z",
      createdBy: "user4",
      updatedAt: "2024-11-10T00:00:00Z",
      updatedBy: "user4",
      assignUsers: [
        { id: "user4", nama: "Alex Chen" } as any,
        { id: "user5", nama: "Lisa Wang" } as any,
      ],
      userCreated: { id: "user4", nama: "Alex Chen" } as any,
      taskItems: [],
    },
    {
      id: "task4",
      projectId: "1",
      taskCode: "TSK-004",
      taskName: "Security Testing",
      taskDesc: "Perform security testing on e-commerce platform",
      taskPriority: "High",
      startDate: "2024-11-12",
      endDate: "2024-11-18",
      isArchived: null,
      indexTask: 4,
      isCompleted: "N",
      percentageStatus: 20,
      backlogId: "backlog1",
      boardId: "board1",
      boardCodeStage: "INPROGRESS",
      boardName: "In Progress",
      boardIndexStage: 2,
      taskPoint: 13,
      countCommnetTask: 0,
      countTaskItem: 8,
      countTaskItemDone: 2,
      countTaskAttachment: 0,
      countRelatedTask: 0,
      createdAt: "2024-11-12T00:00:00Z",
      createdBy: "user1",
      updatedAt: "2024-11-12T00:00:00Z",
      updatedBy: "user1",
      assignUsers: [{ id: "user1", nama: "John Doe" } as any],
      userCreated: { id: "user1", nama: "John Doe" } as any,
      taskItems: [],
    },
    {
      id: "task5",
      projectId: "2",
      taskCode: "TSK-005",
      taskName: "Code Review",
      taskDesc: "Review mobile banking app codebase",
      taskPriority: "Medium",
      startDate: "2024-11-15",
      endDate: "2024-11-20",
      isArchived: null,
      indexTask: 5,
      isCompleted: "N",
      percentageStatus: 0,
      backlogId: "backlog2",
      boardId: "board2",
      boardCodeStage: "TODO",
      boardName: "To Do",
      boardIndexStage: 1,
      taskPoint: 5,
      countCommnetTask: 0,
      countTaskItem: 6,
      countTaskItemDone: 0,
      countTaskAttachment: 0,
      countRelatedTask: 0,
      createdAt: "2024-11-15T00:00:00Z",
      createdBy: "user3",
      updatedAt: "2024-11-15T00:00:00Z",
      updatedBy: "user3",
      assignUsers: [
        { id: "user3", nama: "Sarah Wilson" } as any,
        { id: "user6", nama: "Tom Brown" } as any,
      ],
      userCreated: { id: "user3", nama: "Sarah Wilson" } as any,
      taskItems: [],
    },
    {
      id: "task6",
      projectId: "3",
      taskCode: "TSK-006",
      taskName: "Performance Testing",
      taskDesc: "Test analytics dashboard performance under load",
      taskPriority: "High",
      startDate: "2024-11-18",
      endDate: "2024-11-22",
      isArchived: null,
      indexTask: 6,
      isCompleted: "N",
      percentageStatus: 10,
      backlogId: "backlog3",
      boardId: "board3",
      boardCodeStage: "INPROGRESS",
      boardName: "In Progress",
      boardIndexStage: 2,
      taskPoint: 8,
      countCommnetTask: 1,
      countTaskItem: 10,
      countTaskItemDone: 1,
      countTaskAttachment: 3,
      countRelatedTask: 0,
      createdAt: "2024-11-18T00:00:00Z",
      createdBy: "user4",
      updatedAt: "2024-11-18T00:00:00Z",
      updatedBy: "user4",
      assignUsers: [
        { id: "user4", nama: "Alex Chen" } as any,
        { id: "user5", nama: "Lisa Wang" } as any,
        { id: "user7", nama: "David Kim" } as any,
      ],
      userCreated: { id: "user4", nama: "Alex Chen" } as any,
      taskItems: [],
    },
    {
      id: "task7",
      projectId: "1",
      taskCode: "TSK-007",
      taskName: "Documentation Update",
      taskDesc: "Update API documentation for e-commerce platform",
      taskPriority: "Low",
      startDate: "2024-11-20",
      endDate: "2024-11-25",
      isArchived: null,
      indexTask: 7,
      isCompleted: "N",
      percentageStatus: 0,
      backlogId: "backlog1",
      boardId: "board1",
      boardCodeStage: "TODO",
      boardName: "To Do",
      boardIndexStage: 1,
      taskPoint: 2,
      countCommnetTask: 0,
      countTaskItem: 3,
      countTaskItemDone: 0,
      countTaskAttachment: 0,
      countRelatedTask: 0,
      createdAt: "2024-11-20T00:00:00Z",
      createdBy: "user2",
      updatedAt: "2024-11-20T00:00:00Z",
      updatedBy: "user2",
      assignUsers: [{ id: "user2", nama: "Jane Smith" } as any],
      userCreated: { id: "user2", nama: "Jane Smith" } as any,
      taskItems: [],
    },
    {
      id: "task8",
      projectId: "2",
      taskCode: "TSK-008",
      taskName: "Bug Fixes",
      taskDesc: "Fix critical bugs in mobile banking app",
      taskPriority: "Medium",
      startDate: "2024-11-22",
      endDate: "2024-11-28",
      isArchived: null,
      indexTask: 8,
      isCompleted: "N",
      percentageStatus: 0,
      backlogId: "backlog2",
      boardId: "board2",
      boardCodeStage: "TODO",
      boardName: "To Do",
      boardIndexStage: 1,
      taskPoint: 5,
      countCommnetTask: 0,
      countTaskItem: 7,
      countTaskItemDone: 0,
      countTaskAttachment: 0,
      countRelatedTask: 0,
      createdAt: "2024-11-22T00:00:00Z",
      createdBy: "user3",
      updatedAt: "2024-11-22T00:00:00Z",
      updatedBy: "user3",
      assignUsers: [
        { id: "user3", nama: "Sarah Wilson" } as any,
        { id: "user6", nama: "Tom Brown" } as any,
      ],
      userCreated: { id: "user3", nama: "Sarah Wilson" } as any,
      taskItems: [],
    },
  ];

  // Calculate real-time project status using correct backend status values
  const activeProjects = projects.filter((project) =>
    ["INITIATING", "RUNNING", "TEMPORARY CLOSED", "ON HOLD"].includes(project.projectStatus)
  );
  const closedProjects = projects.filter((project) =>
    ["CANCELED", "COMPLETED"].includes(project.projectStatus)
  );
  const totalProjects = projects.length;
  const activeProjectPercentage =
    totalProjects > 0
      ? Math.round((activeProjects.length / totalProjects) * 100)
      : 0;
  // Use real API data or fallback to mock data
  const quarterTasks = quarterProgress
    ? []
    : getTasksInCurrentQuarter(mockTasks);
  const inProgressTasks = quarterProgress
    ? []
    : getTasksInCurrentQuarter(mockTasks, "INPROGRESS");
  const completedTasks = quarterProgress
    ? []
    : getTasksInCurrentQuarter(mockTasks, "DONE");
  const todoTasks = quarterProgress
    ? []
    : getTasksInCurrentQuarter(mockTasks, "TODO");

  const totalTasks = quarterProgress?.totalTasks || quarterTasks.length;
  const completionPercentage =
    quarterProgress?.donePercentage ||
    (totalTasks > 0
      ? Math.round((completedTasks.length / totalTasks) * 100)
      : 0);
  const doneCount = quarterProgress?.doneCount || completedTasks.length;
  const inProgressCount =
    quarterProgress?.inProgressCount || inProgressTasks.length;
  const todoCount = quarterProgress?.todoCount || todoTasks.length;
  const inProgressPercentage =
    totalTasks > 0
      ? Math.round((inProgressTasks.length / totalTasks) * 100)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "DONE":
        return "green";
      case "In Progress":
      case "INPROGRESS":
        return "blue";
      case "Planning":
        return "yellow";
      case "Pending":
      case "TODO":
        return "orange";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  };

  const handleProjectClick = async (project: ProjectDataResponse) => {
    // Open modal immediately with basic project data

    console.log(project);
    setSelectedProject(project as ProjectDetailResponse);
    onProjectModalOpen();

    // Then load detailed data from workspace endpoint
    setProjectDetailLoading(true);
    try {
      if (tokenData) {
        console.log(
          "Calling workspace project detail for project:",
          project.id
        );
        const data = await GetProjectDetail(project.id, tokenData);
        console.log("Workspace project detail response:", data);

        if (data?.statusCode === 200 && data.data) {
          setSelectedProject(data.data);
        } else {
          console.error("API call failed:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching project detail:", error);
    } finally {
      setProjectDetailLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "orange";
    return "red";
  };

  return (
    <LayoutAdminWorkspace>
      <HeaderContent {...HeaderDataContent} />

      <Box p={6}>
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          {/* Main Content */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }} w={"full"}>
            <VStack spacing={6} align="stretch">
              {/* Projects Section */}
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderRadius={radiusStyle}
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md" color={accentColor}>
                      My Projects
                    </Heading>
                    <HStack spacing={3}>
                      <InputGroup size="sm" maxW="200px">
                        <InputLeftElement>
                          <Search2Icon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          borderRadius="lg"
                          _focus={{
                            borderColor: accentColor,
                            shadow: "0 0 0 1px " + accentColor,
                          }}
                        />
                      </InputGroup>
                      <Button
                        size="sm"
                        variant={viewMode === "grid" ? "solid" : "ghost"}
                        onClick={() => setViewMode("grid")}
                        colorScheme="blue"
                        borderRadius="lg"
                      >
                        <Icon as={FiGrid} />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === "list" ? "solid" : "ghost"}
                        onClick={() => setViewMode("list")}
                        colorScheme="blue"
                        borderRadius="lg"
                      >
                        <Icon as={FiList} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const token = localStorage.getItem("tokenData");
                          if (token) {
                            setProjectsLoading(true);
                            setStatsLoading(true);
                            try {
                              await Promise.all([
                                GetWorkspaceStats(token).then((res) => {
                                  if (res?.statusCode === 200 && res.data) {
                                    setStats(res.data);
                                  }
                                }),
                                GetProjectTypeCounts(token).then((res) => {
                                  if (res?.statusCode === 200 && res.data) {
                                    setProjectTypeCounts(res.data);
                                  }
                                }),
                                fetchProjects(
                                  searchTerm,
                                  9,
                                  0,
                                  false,
                                  selectedProjectType
                                ),
                              ]);
                            } finally {
                              setProjectsLoading(false);
                              setStatsLoading(false);
                            }
                          }
                        }}
                        colorScheme="blue"
                        borderRadius="lg"
                        isLoading={projectsLoading || statsLoading}
                      >
                        <Icon as={FiRefreshCw} />
                      </Button>
                    </HStack>
                  </HStack>

                  {/* Tab Filters */}
                  <HStack spacing={2} mb={4} flexWrap="wrap">
                    <Button
                      size="sm"
                      variant={
                        selectedProjectType === "All" ? "solid" : "ghost"
                      }
                      colorScheme="blue"
                      onClick={() => setSelectedProjectType("All")}
                      borderRadius="lg"
                    >
                      All ({projectTypeCounts.all})
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        selectedProjectType === "INTERNAL DEVELOPMENT"
                          ? "solid"
                          : "ghost"
                      }
                      colorScheme="blue"
                      onClick={() =>
                        setSelectedProjectType("INTERNAL DEVELOPMENT")
                      }
                      borderRadius="lg"
                    >
                      Internal Dev ({projectTypeCounts.internalDev})
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        selectedProjectType === "PROCUREMENT"
                          ? "solid"
                          : "ghost"
                      }
                      colorScheme="blue"
                      onClick={() => setSelectedProjectType("PROCUREMENT")}
                      borderRadius="lg"
                    >
                      Procurement ({projectTypeCounts.procurement})
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        selectedProjectType === "DEPLOYMENT" ? "solid" : "ghost"
                      }
                      colorScheme="blue"
                      onClick={() => setSelectedProjectType("DEPLOYMENT")}
                      borderRadius="lg"
                    >
                      Deployment ({projectTypeCounts.deployment})
                    </Button>
                  </HStack>

                  <Grid
                    templateColumns={
                      viewMode === "grid"
                        ? { base: "1fr", md: "repeat(3, 1fr)" }
                        : "1fr"
                    }
                    gap={5}
                  >
                    {projectsLoading && (
                      <Box gridColumn="1 / -1" py={8}>
                        <LoadingMiniSignature />
                      </Box>
                    )}
                    {!projectsLoading && projects.length === 0 && (
                      <Box gridColumn="1 / -1" textAlign="center" py={8}>
                        <Text color="gray.500">
                          No assigned projects found.
                        </Text>
                      </Box>
                    )}
                    {!projectsLoading &&
                      projects.map((project) => (
                        <Card
                          key={project.id}
                          variant="outline"
                          size="sm"
                          borderRadius={radiusStyle}
                          _hover={{
                            transform: "translateY(-2px)",
                            shadow: "md",
                            borderColor: accentColor,
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                          // borderLeft="3px solid"
                          // borderLeftColor={
                          //   getStatusColor(project.projectStatus) + ".500"
                          // }
                          onClick={() => handleProjectClick(project)}
                          position="relative"
                          overflow="hidden"
                        >
                          {/* Static Wave Background */}
                          <Box
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            height="180px"
                            pointerEvents="none"
                          >
                            <svg
                              viewBox="0 0 1200 200"
                              preserveAspectRatio="none"
                              style={{ width: "100%", height: "100%" }}
                            >
                              {/* Diagonal wave layer 1 */}
                              <path
                                d="M0,100 C300,20 500,140 800,80 L1200,40 L1200,200 L0,200 Z"
                                fill={
                                  colorMode === "dark" ? "#0051ad" : "#f2f8ff"
                                }
                                opacity={0.3}
                              />
                              {/* Diagonal wave layer 2 */}
                              <path
                                d="M0,140 C400,80 600,160 900,100 L1200,70 L1200,200 L0,200 Z"
                                fill={
                                  colorMode === "dark" ? "#004593" : "#cae3ff"
                                }
                                opacity={0.4}
                              />
                              {/* Abstract curved shape */}
                              <path
                                d="M0,180 C200,120 600,180 1200,120 L1200,200 L0,200 Z"
                                fill={
                                  colorMode === "dark" ? "#00326b" : "#9acaff"
                                }
                                opacity={0.5}
                              />
                            </svg>
                          </Box>
                          <CardBody p={4} zIndex={2}>
                            <VStack align="start" spacing={3} w="full">
                              {/* Header: Project No + Status */}
                              <HStack justify="space-between" w="full">
                                <Text
                                  fontSize="2xs"
                                  color={useColorModeValue(
                                    "secondary.700",
                                    "secondary.200"
                                  )}
                                  fontWeight="bold"
                                >
                                  No. {project.projectNo}
                                </Text>
                                <Badge
                                  colorScheme={getStatusColor(
                                    project.projectStatus
                                  )}
                                  variant="subtle"
                                  fontSize="xs"
                                >
                                  {project.projectStatus}
                                </Badge>
                              </HStack>

                              {/* Project Name */}
                              <Box h={"40px"}>
                                <Heading
                                  size="sm"
                                  color={accentColor}
                                  noOfLines={2}
                                >
                                  {project.projectName}
                                </Heading>
                              </Box>

                              {/* Progress Bar */}
                              <Box w="full">
                                <HStack justify="space-between" mb={1}>
                                  <Text fontSize="xs" color={textColor}>
                                    Progress
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={accentColor}
                                  >
                                    {project.projectStatusPercentage}%
                                  </Text>
                                </HStack>
                                <Progress
                                  value={project.projectStatusPercentage}
                                  size="sm"
                                  colorScheme="blue"
                                  borderRadius="full"
                                  bg={useColorModeValue("gray.100", "gray.700")}
                                />
                              </Box>

                              {/* Footer: Team + Type */}
                              <HStack justify="space-between" w="full">
                                <AvatarGroup size="xs" max={3}>
                                  {project.userAssignment?.map((assignment) => (
                                    <Avatar
                                      key={assignment.id}
                                      name={assignment.userData?.nama}
                                      src={
                                        assignment.userData?.profilePict ||
                                        undefined
                                      }
                                    />
                                  ))}
                                </AvatarGroup>
                                <Badge
                                  colorScheme="secondary"
                                  variant="subtle"
                                  fontSize="xs"
                                >
                                  {project.projectType}
                                </Badge>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                  </Grid>

                  {/* Pagination */}
                  {!projectsLoading && projects.length > 0 && (
                    <HStack justify="space-between" mt={6} flexWrap="wrap">
                      <Text fontSize="sm" color={textColor}>
                        Showing {currentPage * 9 + 1} to{" "}
                        {Math.min((currentPage + 1) * 9, totalProjectsCount)} of{" "}
                        {totalProjectsCount} projects
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            fetchProjects(
                              searchTerm,
                              9,
                              newPage,
                              false,
                              selectedProjectType
                            );
                          }}
                          isDisabled={currentPage === 0}
                          borderRadius="lg"
                        >
                          Previous
                        </Button>
                        <HStack spacing={1}>
                          {Array.from(
                            { length: Math.ceil(totalProjectsCount / 9) },
                            (_, i) => i
                          )
                            .filter((page) => {
                              const totalPages = Math.ceil(
                                totalProjectsCount / 9
                              );
                              if (totalPages <= 5) return true;
                              if (page === 0 || page === totalPages - 1)
                                return true;
                              if (Math.abs(page - currentPage) <= 1)
                                return true;
                              return false;
                            })
                            .map((page, index, array) => {
                              const prevPage = array[index - 1];
                              const showEllipsis =
                                prevPage !== undefined && page - prevPage > 1;
                              return (
                                <Fragment key={page}>
                                  {showEllipsis && (
                                    <Text px={2} color={textColor}>
                                      ...
                                    </Text>
                                  )}
                                  <Button
                                    size="sm"
                                    variant={
                                      currentPage === page ? "solid" : "outline"
                                    }
                                    colorScheme="blue"
                                    onClick={() => {
                                      setCurrentPage(page);
                                      fetchProjects(
                                        searchTerm,
                                        9,
                                        page,
                                        false,
                                        selectedProjectType
                                      );
                                    }}
                                    borderRadius="lg"
                                    minW="40px"
                                  >
                                    {page + 1}
                                  </Button>
                                </Fragment>
                              );
                            })}
                        </HStack>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            fetchProjects(
                              searchTerm,
                              9,
                              newPage,
                              false,
                              selectedProjectType
                            );
                          }}
                          isDisabled={
                            currentPage >= Math.ceil(totalProjectsCount / 9) - 1
                          }
                          borderRadius="lg"
                        >
                          Next
                        </Button>
                      </HStack>
                    </HStack>
                  )}
                </CardBody>
              </Card>

              {/* Recent Tasks */}
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderRadius={radiusStyle}
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md" color={accentColor}>
                      Recent Tasks
                    </Heading>
                  </HStack>

                  <VStack spacing={4} py={8}>
                    <Icon
                      as={FiClock}
                      boxSize={12}
                      color={textColor}
                      opacity={0.5}
                    />
                    <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                      Coming Soon
                    </Text>
                    <Text
                      fontSize="sm"
                      color={textColor}
                      textAlign="center"
                      opacity={0.7}
                    >
                      Task management features will be available in the next
                      update
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
            <VStack spacing={6} align="stretch">
              {/* Quick Stats */}
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                <Card
                  bg={bgColor}
                  borderColor={borderColor}
                  borderRadius={radiusStyle}
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  transition="all 0.3s"
                  shadow="md"
                >
                  <CardBody p={5}>
                    <VStack spacing={3} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiFolder} boxSize={5} color="blue.500" />
                        <Text
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          Total Projects
                        </Text>
                      </HStack>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color={accentColor}
                        lineHeight="1"
                      >
                        {statsLoading ? "..." : stats?.totalProjects ?? 0}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card
                  bg={bgColor}
                  borderColor={borderColor}
                  borderRadius={radiusStyle}
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  transition="all 0.3s"
                  shadow="md"
                >
                  <CardBody p={5}>
                    <VStack spacing={3} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiTarget} boxSize={5} color="green.500" />
                        <Text
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          Active Projects
                        </Text>
                      </HStack>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color="green.500"
                        lineHeight="1"
                      >
                        {statsLoading ? "..." : stats?.activeProjects ?? 0}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card
                  bg={bgColor}
                  borderColor={borderColor}
                  borderRadius={radiusStyle}
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  transition="all 0.3s"
                  shadow="md"
                >
                  <CardBody p={5}>
                    <VStack spacing={3} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiCheckCircle} boxSize={5} color="purple.500" />
                        <Text
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          Total Tasks
                        </Text>
                      </HStack>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color="purple.500"
                        lineHeight="1"
                      >
                        {statsLoading ? "..." : stats?.totalTasks ?? 0}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card
                  bg={bgColor}
                  borderColor={borderColor}
                  borderRadius={radiusStyle}
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  transition="all 0.3s"
                  shadow="md"
                >
                  <CardBody p={5}>
                    <VStack spacing={3} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiClock} boxSize={5} color="orange.500" />
                        <Text
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          Overdue Tasks
                        </Text>
                      </HStack>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color="orange.500"
                        lineHeight="1"
                      >
                        {statsLoading ? "..." : stats?.overdueTasks ?? 0}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>

              {/* Current Quarter Progress */}
              <Card
                bg={bgColor}
                bgGradient={gradientBg}
                borderColor={borderColor}
                borderRadius={radiusStyle}
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
                overflow="hidden"
              >
                <CardBody p={0}>
                  {quarterProgressLoading ? (
                    <Box p={6} textAlign="center">
                      <Spinner size="lg" color="blue.500" />
                      <Text mt={2} fontSize="sm" color="gray.500">
                        Loading quarter progress...
                      </Text>
                    </Box>
                  ) : (
                    <>
                      {/* Header with gradient */}
                      <Box color="white" p={4} position="relative">
                        <HStack justify="space-between" mb={3}>
                          <VStack align="start" spacing={0}>
                            <Heading size="sm">
                              Q{quarter} {year} Progress
                            </Heading>
                            <Text fontSize="xs" opacity={0.9}>
                              {inProgressCount} ongoing / {doneCount} done
                            </Text>
                          </VStack>
                          <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
                            <Icon as={FiTrendingUp} boxSize={5} />
                          </Box>
                        </HStack>

                        {/* Overall Progress Circle */}
                        <HStack spacing={4} align="center">
                          <Box position="relative" w="60px" h="60px">
                            <Progress
                              value={completionPercentage}
                              size="lg"
                              colorScheme="green"
                              bg="whiteAlpha.300"
                              borderRadius="full"
                              sx={{
                                "& > div": {
                                  background:
                                    "linear-gradient(90deg, #48BB78, #38A169)",
                                },
                              }}
                            />
                            <Box
                              position="absolute"
                              top="65%"
                              left="50%"
                              transform="translate(-50%, -50%)"
                              textAlign="center"
                            >
                              <Text fontSize="lg" fontWeight="bold">
                                {completionPercentage}%
                              </Text>
                              <Text fontSize="xs" opacity={0.9}>
                                Done
                              </Text>
                            </Box>
                          </Box>

                          <VStack align="start" spacing={2} flex="1">
                            <HStack w="full" justify="space-between">
                              <Text fontSize="xs" opacity={0.9}>
                                Completed
                              </Text>
                              <Text fontSize="xs" fontWeight="bold">
                                {doneCount}
                              </Text>
                            </HStack>
                            <HStack w="full" justify="space-between">
                              <Text fontSize="xs" opacity={0.9}>
                                In Progress
                              </Text>
                              <Text fontSize="xs" fontWeight="bold">
                                {inProgressCount}
                              </Text>
                            </HStack>
                            <HStack w="full" justify="space-between">
                              <Text fontSize="xs" opacity={0.9}>
                                To Do
                              </Text>
                              <Text fontSize="xs" fontWeight="bold">
                                {todoCount}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        {/* Progress vs Bar */}
                        <Box mt={4}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs" opacity={0.9}>
                              Progress Distribution
                            </Text>
                            <Text fontSize="xs" opacity={0.9}>
                              {totalTasks} tasks
                            </Text>
                          </HStack>
                          <Box
                            position="relative"
                            h="8px"
                            bg="whiteAlpha.300"
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <HStack spacing={0} h="full">
                              <Box
                                w={
                                  totalTasks > 0
                                    ? `${
                                        quarterProgress?.donePercentage ||
                                        Math.round(
                                          (doneCount / totalTasks) * 100
                                        )
                                      }%`
                                    : "0%"
                                }
                                h="full"
                                bg="green.400"
                              />
                              <Box
                                w={
                                  totalTasks > 0
                                    ? `${
                                        quarterProgress?.inProgressPercentage ||
                                        Math.round(
                                          (inProgressCount / totalTasks) * 100
                                        )
                                      }%`
                                    : "0%"
                                }
                                h="full"
                                bg="blue.400"
                              />
                              <Box
                                w={
                                  totalTasks > 0
                                    ? `${
                                        quarterProgress?.todoPercentage ||
                                        Math.round(
                                          (todoCount / totalTasks) * 100
                                        )
                                      }%`
                                    : "0%"
                                }
                                h="full"
                                bg="orange.400"
                              />
                            </HStack>
                          </Box>
                          <HStack justify="space-between" mt={2} fontSize="xs">
                            <HStack spacing={1}>
                              <Box
                                w="8px"
                                h="8px"
                                bg="green.400"
                                borderRadius="full"
                              />
                              <Text opacity={0.9}>
                                {quarterProgress?.donePercentage ||
                                  (totalTasks > 0
                                    ? Math.round((doneCount / totalTasks) * 100)
                                    : 0)}
                                % Done
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Box
                                w="8px"
                                h="8px"
                                bg="blue.400"
                                borderRadius="full"
                              />
                              <Text opacity={0.9}>
                                {quarterProgress?.inProgressPercentage ||
                                  (totalTasks > 0
                                    ? Math.round(
                                        (inProgressCount / totalTasks) * 100
                                      )
                                    : 0)}
                                % Progress
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Box
                                w="8px"
                                h="8px"
                                bg="orange.400"
                                borderRadius="full"
                              />
                              <Text opacity={0.9}>
                                {quarterProgress?.todoPercentage ||
                                  (totalTasks > 0
                                    ? Math.round((todoCount / totalTasks) * 100)
                                    : 0)}
                                % Todo
                              </Text>
                            </HStack>
                          </HStack>
                        </Box>
                      </Box>

                      {/* Task Lists */}
                      <Box p={4}>
                        <VStack spacing={4} align="stretch">
                          {/* In Progress Section */}
                          {inProgressTasks.length > 0 && (
                            <Box>
                              <HStack justify="space-between" mb={3}>
                                <HStack spacing={2}>
                                  <Box
                                    w="3px"
                                    h="16px"
                                    bg="blue.500"
                                    borderRadius="full"
                                  />
                                  <Text fontSize="sm" fontWeight="semibold">
                                    In Progress
                                  </Text>
                                </HStack>
                                <Badge colorScheme="blue" variant="subtle">
                                  {inProgressPercentage}%
                                </Badge>
                              </HStack>

                              <VStack spacing={2} align="stretch">
                                {inProgressTasks.slice(0, 2).map((task) => (
                                  <Box
                                    key={task.id}
                                    p={3}
                                    bg={useColorModeValue(
                                      "blue.50",
                                      "blue.900"
                                    )}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor={useColorModeValue(
                                      "blue.100",
                                      "blue.800"
                                    )}
                                    _hover={{
                                      borderColor: "blue.300",
                                      transform: "translateY(-1px)",
                                    }}
                                    transition="all 0.2s"
                                    cursor="pointer"
                                  >
                                    <HStack
                                      justify="space-between"
                                      align="start"
                                    >
                                      <VStack
                                        align="start"
                                        spacing={1}
                                        flex="1"
                                      >
                                        <Text
                                          fontSize="sm"
                                          fontWeight="medium"
                                          noOfLines={1}
                                        >
                                          {task.taskName}
                                        </Text>
                                        <HStack spacing={2}>
                                          <Text fontSize="xs" color={textColor}>
                                            {task.taskCode}
                                          </Text>
                                          <Badge
                                            size="xs"
                                            colorScheme="blue"
                                            variant="subtle"
                                          >
                                            {task.taskPoint} pts
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                      <VStack align="end" spacing={1}>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color="blue.500"
                                        >
                                          {task.percentageStatus}%
                                        </Text>
                                        <Progress
                                          value={task.percentageStatus}
                                          size="sm"
                                          colorScheme="blue"
                                          w="50px"
                                          borderRadius="full"
                                        />
                                      </VStack>
                                    </HStack>
                                  </Box>
                                ))}
                                {inProgressTasks.length > 2 && (
                                  <Text
                                    fontSize="xs"
                                    color={textColor}
                                    textAlign="center"
                                    py={1}
                                  >
                                    +{inProgressTasks.length - 2} more tasks
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}

                          {/* Completed Section */}
                          {completedTasks.length > 0 && (
                            <Box>
                              <HStack justify="space-between" mb={3}>
                                <HStack spacing={2}>
                                  <Box
                                    w="3px"
                                    h="16px"
                                    bg="green.500"
                                    borderRadius="full"
                                  />
                                  <Text fontSize="sm" fontWeight="semibold">
                                    Completed
                                  </Text>
                                </HStack>
                                <Badge colorScheme="green" variant="subtle">
                                  {totalTasks > 0
                                    ? Math.round(
                                        (completedTasks.length / totalTasks) *
                                          100
                                      )
                                    : 0}
                                  %
                                </Badge>
                              </HStack>

                              <VStack spacing={2} align="stretch">
                                {completedTasks.slice(0, 2).map((task) => (
                                  <Box
                                    key={task.id}
                                    p={3}
                                    bg={useColorModeValue(
                                      "green.50",
                                      "green.900"
                                    )}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor={useColorModeValue(
                                      "green.100",
                                      "green.800"
                                    )}
                                    _hover={{
                                      borderColor: "green.300",
                                      transform: "translateY(-1px)",
                                    }}
                                    transition="all 0.2s"
                                    cursor="pointer"
                                  >
                                    <HStack
                                      justify="space-between"
                                      align="start"
                                    >
                                      <VStack
                                        align="start"
                                        spacing={1}
                                        flex="1"
                                      >
                                        <Text
                                          fontSize="sm"
                                          fontWeight="medium"
                                          noOfLines={1}
                                        >
                                          {task.taskName}
                                        </Text>
                                        <HStack spacing={2}>
                                          <Text fontSize="xs" color={textColor}>
                                            {task.taskCode}
                                          </Text>
                                          <Badge
                                            size="xs"
                                            colorScheme="green"
                                            variant="subtle"
                                          >
                                            {task.taskPoint} pts
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                      <VStack align="end" spacing={1}>
                                        <Icon
                                          as={FiCheckCircle}
                                          color="green.500"
                                          boxSize={4}
                                        />
                                        <Text
                                          fontSize="xs"
                                          color="green.500"
                                          fontWeight="bold"
                                        >
                                          Done
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </Box>
                                ))}
                                {completedTasks.length > 2 && (
                                  <Text
                                    fontSize="xs"
                                    color={textColor}
                                    textAlign="center"
                                    py={1}
                                  >
                                    +{completedTasks.length - 2} more completed
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Project Status API */}
              <ProjectStatusCard tokenData={tokenData} />

              {/* Notifications */}
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderRadius={radiusStyle}
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="sm" color={accentColor}>
                      Notifications
                    </Heading>
                    <Icon as={FiBell} color={accentColor} />
                  </HStack>

                  <VStack spacing={4} py={6}>
                    <Icon
                      as={FiBell}
                      boxSize={10}
                      color={textColor}
                      opacity={0.5}
                    />
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Coming Soon
                    </Text>
                    <Text
                      fontSize="sm"
                      color={textColor}
                      textAlign="center"
                      opacity={0.7}
                    >
                      Notification system will be available soon
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Activity Feed */}
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderRadius={radiusStyle}
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="sm" color={accentColor}>
                      Recent Activity
                    </Heading>
                    <Icon as={FiActivity} color={accentColor} />
                  </HStack>

                  <VStack spacing={4} py={6}>
                    <Icon
                      as={FiActivity}
                      boxSize={10}
                      color={textColor}
                      opacity={0.5}
                    />
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Coming Soon
                    </Text>
                    <Text
                      fontSize="sm"
                      color={textColor}
                      textAlign="center"
                      opacity={0.7}
                    >
                      Activity tracking will be available soon
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Project Details Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={onProjectModalClose}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent borderRadius={radiusStyle}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box w="4px" h="24px" bg={accentColor} borderRadius="full" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedProject?.projectName}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {selectedProject?.projectNo}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={8}>
            {projectDetailLoading ? (
              <VStack spacing={4} py={8}>
                <Spinner size="lg" color={accentColor} />
                <Text color={textColor}>Loading project details...</Text>
              </VStack>
            ) : (
              <Grid templateColumns="1fr auto 1fr" gap={12}>
                {/* Left Column */}
                <VStack spacing={8} align="stretch">
                  {/* Project Overview */}
                  <Box>
                    <HStack justify="space-between" mb={6}>
                      <Heading size="sm" color={accentColor}>
                        Project Overview
                      </Heading>
                      <Badge
                        colorScheme={getStatusColor(
                          selectedProject?.projectStatus || ""
                        )}
                        size="lg"
                      >
                        {selectedProject?.projectStatus}
                      </Badge>
                    </HStack>

                    <Text fontSize="sm" color={textColor} mb={6}>
                      {selectedProject?.projectDesc}
                    </Text>

                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <Box>
                        <Text fontSize="xs" color={textColor} mb={2}>
                          Category
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedProject?.projectCategory}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textColor} mb={2}>
                          Type
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedProject?.projectType}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textColor} mb={2}>
                          Start Date
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedProject?.projectRegisterDate
                            ? formatDateTimeBE(
                                selectedProject.projectRegisterDate
                              )
                            : "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textColor} mb={2}>
                          Duration
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedProject?.projectDurationDays} days
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Team Information */}
                  <Box>
                    <Heading size="sm" color={accentColor} mb={6}>
                      Team Members
                    </Heading>

                    <HStack spacing={6} align="center">
                      <AvatarGroup size="md" max={4}>
                        {selectedProject?.userAssignment?.map((assignment) => (
                          <Avatar
                            key={assignment.id}
                            name={assignment.userData?.nama}
                            bg={accentColor}
                          />
                        ))}
                      </AvatarGroup>

                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedProject?.userAssignment?.length || 0} team
                          members
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          {selectedProject?.userAssignment
                            ?.map((a) => a.userData?.nama)
                            .join(", ")}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>

                {/* Vertical Divider */}
                <Divider orientation="vertical" />

                {/* Right Column */}
                <VStack spacing={8} align="stretch">
                  {/* Progress Summary */}
                  <Box>
                    <Heading size="sm" color={accentColor} mb={6}>
                      Progress Summary
                    </Heading>

                    <HStack spacing={8} align="center">
                      <Box position="relative" w="80px" h="80px">
                        <Progress
                          value={selectedProject?.projectStatusPercentage || 0}
                          size="lg"
                          colorScheme="blue"
                          bg={useColorModeValue("gray.100", "gray.700")}
                          borderRadius="full"
                        />
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          textAlign="center"
                        >
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color={accentColor}
                          >
                            {selectedProject?.projectStatusPercentage}%
                          </Text>
                          <Text fontSize="xs" color={textColor}>
                            Complete
                          </Text>
                        </Box>
                      </Box>

                      <VStack align="start" spacing={3} flex="1">
                        <HStack w="full" justify="space-between">
                          <Text fontSize="sm" color={textColor}>
                            Project Progress
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={accentColor}
                          >
                            {selectedProject?.projectStatusPercentage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={selectedProject?.projectStatusPercentage || 0}
                          size="md"
                          colorScheme="blue"
                          w="full"
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color={textColor}>
                          {selectedProject?.projectStatusPercentage &&
                          selectedProject.projectStatusPercentage >= 80
                            ? "Excellent progress!"
                            : selectedProject?.projectStatusPercentage &&
                              selectedProject.projectStatusPercentage >= 50
                            ? "Good progress"
                            : "Getting started"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Task Board Summary */}
                  <Box>
                    <Heading size="sm" color={accentColor} mb={6}>
                      Task Board Summary
                    </Heading>

                    <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                      <VStack spacing={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {selectedProject?.taskSummary?.toDo || 0}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          To Do
                        </Text>
                      </VStack>
                      <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {selectedProject?.taskSummary?.inProgress || 0}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          In Progress
                        </Text>
                      </VStack>
                      <VStack spacing={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="purple.500"
                        >
                          {selectedProject?.taskSummary?.inReview || 0}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          In Review
                        </Text>
                      </VStack>
                      <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="bold" color="green.500">
                          {selectedProject?.taskSummary?.done || 0}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Done
                        </Text>
                      </VStack>
                    </Grid>

                    <HStack
                      justify="space-between"
                      mt={6}
                      p={4}
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" fontWeight="medium">
                        Total Tasks
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                        {selectedProject?.taskSummary?.all || 0}
                      </Text>
                    </HStack>

                    <HStack justify="space-between" mt={4}>
                      <Text fontSize="sm" fontWeight="medium">
                        Total Backlogs
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                        {selectedProject?.backlogCount || 0}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </Grid>
            )}
          </ModalBody>

          <ModalFooter>
            <Link href={`/workspace/project?projectId=${selectedProject?.id}`}>
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={FiArrowRightCircle} />}
                borderRadius="lg"
                size="lg"
                fontWeight="bold"
                width="full"
                _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
              >
                Go To Project
              </Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdminWorkspace>
  );
};

export default WorkspaceProject;
