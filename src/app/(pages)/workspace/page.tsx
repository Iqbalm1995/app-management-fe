"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { Search2Icon } from "@chakra-ui/icons";

// Components
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
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
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetailResponse | null>(null);

  const {
    isOpen: isProjectModalOpen,
    onOpen: onProjectModalOpen,
    onClose: onProjectModalClose,
  } = useDisclosure();

  // Auth setup
  const [tokenData, setTokenData] = useState<string>("");

  // Workspace API integration
  const { GetWorkspaceStats, GetAssignedProjects, GetProjectDetail, loading } =
    useWorkspace();
  const [stats, setStats] = useState<WorkspaceStatsViewModel | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Fetch workspace stats on component mount
  // Fetch projects function
  const fetchProjects = async (
    search: string = "",
    limit: number = 4,
    page: number = 1,
    append: boolean = false
  ) => {
    const token = localStorage.getItem("tokenData");
    if (token) {
      setProjectsLoading(true);
      try {
        const payload = {
          search: search,
          limit: limit,
          page: page,
          FilterWhere: [],
          FieldOrder: ["projectName"],
          OrderDir: "asc",
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
    const fetchStats = async () => {
      const token = localStorage.getItem("tokenData");
      if (token) {
        setStatsLoading(true);
        try {
          console.log("🔄 Fetching workspace stats...");
          const response = await GetWorkspaceStats(token);
          console.log("📊 Stats response:", response);

          if (response?.statusCode === 200 && response.data) {
            console.log("✅ Stats data:", response.data);
            setStats(response.data);
          } else {
            console.log("❌ Stats API failed:", response);
          }
        } catch (error) {
          console.error("❌ Error fetching workspace stats:", error);
        } finally {
          setStatsLoading(false);
        }
      } else {
        console.log("❌ No token found");
      }
    };

    fetchStats();
    fetchProjects(); // Initial load
  }, []);

  // Initialize token
  useEffect(() => {
    const token: string = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchProjects(searchTerm, 4, 1, false);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Get current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const quarter = Math.ceil(month / 3);
    return { quarter, year };
  };

  const { quarter, year } = getCurrentQuarter();

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
    "linear(to-r, secondary.400, secondary.600)",
    "linear(to-r, secondary.600, secondary.800)"
  );

  // Mock data for prototype - using ProjectDataResponse structure
  const mockProjects: ProjectDataResponse[] = [
    {
      id: "1",
      projectNo: "PRJ-2024-001",
      projectCode: "ECOM-001",
      projectName: "E-Commerce Platform",
      projectDesc: "Modern e-commerce solution with React and Node.js",
      projectStatus: "In Progress",
      projectStatusPercentage: 75,
      projectCategory: "Web Development",
      projectType: "Internal Development",
      projectRegisterDate: "2024-01-15",
      projectClosedDate: null,
      projectDurationDays: 120,
      note: null,
      projectAcquisitionCode: null,
      projectAcquisitionName: null,
      projectCharasteristicCode: null,
      projectCharasteristicName: null,
      projectSubCharasteristicCode: null,
      projectSubCharasteristicName: null,
      projectSubCharasteristicDesc: null,
      proOwnerDirectorateId: "dir1",
      proOwnerDirectorateCode: "IT",
      proOwnerDirectorateName: "IT Directorate",
      proManageByDirectorateId: "dir1",
      proManageByDirectorateCode: "IT",
      proManageByDirectorateName: "IT Directorate",
      proOwnerDivisionId: "div1",
      proOwnerDivisionCode: "DEV",
      proOwnerDivisionName: "Development Division",
      proOwnerGroupId: "grp1",
      proOwnerGroupCode: "WEB",
      proOwnerGroupName: "Web Development Group",
      proManageByDivisionId: "div1",
      proManageByDivisionCode: "DEV",
      proManageByDivisionName: "Development Division",
      proManageByGroupId: "grp1",
      proManageByGroupCode: "WEB",
      proManageByGroupName: "Web Development Group",
      proManageByTeamId: "team1",
      proManageByTeamCode: "TEAM1",
      proManageByTeamName: "Team Alpha",
      reqParentId: null,
      createdAt: "2024-01-15T00:00:00Z",
      createdBy: "admin",
      updatedAt: "2024-11-10T00:00:00Z",
      updatedBy: "admin",
      userAssignment: [
        {
          id: "ua1",
          projectId: "1",
          userSysId: "sys1",
          userId: "user1",
          userData: { id: "user1", nama: "John Doe" } as any,
          userAssignStatus: "Active",
          assignDate: "2024-01-15",
          assignEndDate: null,
          createdAt: "2024-01-15T00:00:00Z",
          createdBy: "admin",
          updatedAt: null,
          updatedBy: null,
        },
        {
          id: "ua2",
          projectId: "1",
          userSysId: "sys2",
          userId: "user2",
          userData: { id: "user2", nama: "Jane Smith" } as any,
          userAssignStatus: "Active",
          assignDate: "2024-01-15",
          assignEndDate: null,
          createdAt: "2024-01-15T00:00:00Z",
          createdBy: "admin",
          updatedAt: null,
          updatedBy: null,
        },
      ],
      appsProject: {
        id: "app1",
        appName: "E-Commerce Platform",
        appShortName: "ECOM",
      } as any,
      workPrograms: [],
      projectWorkflowProjectData: [],
      projectWorkflowData: [],
    },
    {
      id: "2",
      projectNo: "PRJ-2024-002",
      projectCode: "BANK-001",
      projectName: "Mobile Banking App",
      projectDesc: "Secure mobile banking application",
      projectStatus: "Planning",
      projectStatusPercentage: 25,
      projectCategory: "Mobile Development",
      projectType: "Internal Development",
      projectRegisterDate: "2024-02-01",
      projectClosedDate: null,
      projectDurationDays: 90,
      note: null,
      projectAcquisitionCode: null,
      projectAcquisitionName: null,
      projectCharasteristicCode: null,
      projectCharasteristicName: null,
      projectSubCharasteristicCode: null,
      projectSubCharasteristicName: null,
      projectSubCharasteristicDesc: null,
      proOwnerDirectorateId: "dir1",
      proOwnerDirectorateCode: "IT",
      proOwnerDirectorateName: "IT Directorate",
      proManageByDirectorateId: "dir1",
      proManageByDirectorateCode: "IT",
      proManageByDirectorateName: "IT Directorate",
      proOwnerDivisionId: "div2",
      proOwnerDivisionCode: "MOB",
      proOwnerDivisionName: "Mobile Division",
      proOwnerGroupId: "grp2",
      proOwnerGroupCode: "MOB",
      proOwnerGroupName: "Mobile Development Group",
      proManageByDivisionId: "div2",
      proManageByDivisionCode: "MOB",
      proManageByDivisionName: "Mobile Division",
      proManageByGroupId: "grp2",
      proManageByGroupCode: "MOB",
      proManageByGroupName: "Mobile Development Group",
      proManageByTeamId: "team2",
      proManageByTeamCode: "TEAM2",
      proManageByTeamName: "Team Beta",
      reqParentId: null,
      createdAt: "2024-02-01T00:00:00Z",
      createdBy: "admin",
      updatedAt: "2024-11-10T00:00:00Z",
      updatedBy: "admin",
      userAssignment: [
        {
          id: "ua3",
          projectId: "2",
          userSysId: "sys3",
          userId: "user3",
          userData: { id: "user3", nama: "Sarah Wilson" } as any,
          userAssignStatus: "Active",
          assignDate: "2024-02-01",
          assignEndDate: null,
          createdAt: "2024-02-01T00:00:00Z",
          createdBy: "admin",
          updatedAt: null,
          updatedBy: null,
        },
      ],
      appsProject: {
        id: "app2",
        appName: "Mobile Banking",
        appShortName: "BANK",
      } as any,
      workPrograms: [],
      projectWorkflowProjectData: [],
      projectWorkflowData: [],
    },
  ];

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

  // Calculate real-time project status (not quarterly filtered)
  const activeProjects = projects.filter(
    (project) =>
      project.projectStatus === "In Progress" ||
      project.projectStatus === "Planning"
  );
  const closedProjects = projects.filter(
    (project) =>
      project.projectStatus === "Completed" ||
      project.projectStatus === "Closed"
  );
  const totalProjects = projects.length;
  const activeProjectPercentage =
    totalProjects > 0
      ? Math.round((activeProjects.length / totalProjects) * 100)
      : 0;
  const quarterTasks = getTasksInCurrentQuarter(mockTasks);
  const inProgressTasks = getTasksInCurrentQuarter(mockTasks, "INPROGRESS");
  const completedTasks = getTasksInCurrentQuarter(mockTasks, "DONE");
  const todoTasks = getTasksInCurrentQuarter(mockTasks, "TODO");

  const totalTasks = quarterTasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const inProgressPercentage =
    totalTasks > 0
      ? Math.round((inProgressTasks.length / totalTasks) * 100)
      : 0;

  const mockNotifications = [
    {
      id: 1,
      message: "New task assigned: API Integration",
      time: "2 hours ago",
      type: "task",
    },
    {
      id: 2,
      message: "Project deadline approaching: Mobile Banking App",
      time: "4 hours ago",
      type: "deadline",
    },
    {
      id: 3,
      message: "Team meeting scheduled for tomorrow",
      time: "1 day ago",
      type: "meeting",
    },
  ];

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
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box p={6}>
        {/* Dashboard Stats */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gap={6}
          mb={8}
        >
          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderRadius={radiusStyle}
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  bgGradient="linear(to-r, blue.400, blue.500)"
                  borderRadius="xl"
                  color="white"
                >
                  <Icon as={FiFolder} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                    {statsLoading ? "..." : stats?.totalProjects ?? 0}
                  </Text>
                  <Text color={textColor} fontSize="sm" fontWeight="medium">
                    Total Projects
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderRadius={radiusStyle}
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  bgGradient="linear(to-r, green.400, green.500)"
                  borderRadius="xl"
                  color="white"
                >
                  <Icon as={FiTarget} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {statsLoading ? "..." : stats?.activeProjects ?? 0}
                  </Text>
                  <Text color={textColor} fontSize="sm" fontWeight="medium">
                    Active Projects
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderRadius={radiusStyle}
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  bgGradient="linear(to-r, purple.400, purple.500)"
                  borderRadius="xl"
                  color="white"
                >
                  <Icon as={FiCheckCircle} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                    {statsLoading ? "..." : stats?.totalTasks ?? 0}
                  </Text>
                  <Text color={textColor} fontSize="sm" fontWeight="medium">
                    Total Tasks
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderRadius={radiusStyle}
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  bgGradient="linear(to-r, orange.400, orange.500)"
                  borderRadius="xl"
                  color="white"
                >
                  <Icon as={FiClock} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {statsLoading ? "..." : stats?.overdueTasks ?? 0}
                  </Text>
                  <Text color={textColor} fontSize="sm" fontWeight="medium">
                    Overdue Tasks
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Main Content */}
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
                <HStack justify="space-between" mb={6}>
                  <Heading size="md" color={accentColor}>
                    My Projects
                  </Heading>
                  <HStack spacing={3}>
                    <InputGroup size="sm" maxW="250px">
                      <InputLeftElement>
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search projects..."
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
                  </HStack>
                </HStack>

                <Grid
                  templateColumns={
                    viewMode === "grid"
                      ? { base: "1fr", md: "repeat(2, 1fr)" }
                      : "1fr"
                  }
                  gap={4}
                >
                  {projectsLoading && (
                    <Box gridColumn="1 / -1" py={8}>
                      <LoadingMiniSignature />
                    </Box>
                  )}
                  {!projectsLoading && projects.length === 0 && (
                    <Box gridColumn="1 / -1" textAlign="center" py={8}>
                      <Text color="gray.500">No assigned projects found.</Text>
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
                          shadow: "lg",
                          bg: cardHoverBg,
                          borderColor: accentColor,
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        borderLeft="4px solid"
                        borderLeftColor={
                          getStatusColor(project.projectStatus) + ".400"
                        }
                        onClick={() => handleProjectClick(project)}
                      >
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="full">
                              <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                  <Text
                                    fontSize="xs"
                                    color={accentColor}
                                    fontWeight="bold"
                                  >
                                    #{project.projectNo}
                                  </Text>
                                  <Badge
                                    colorScheme={getStatusColor(
                                      project.projectStatus
                                    )}
                                    variant="subtle"
                                  >
                                    {project.projectStatus}
                                  </Badge>
                                </HStack>
                                <Heading size="sm" color={accentColor}>
                                  {project.projectName}
                                </Heading>
                                <Box mt={2}>
                                  <Badge
                                    colorScheme="blue"
                                    variant="outline"
                                    size="sm"
                                  >
                                    {project.projectType}
                                  </Badge>
                                </Box>
                              </VStack>
                            </HStack>

                            <HStack justify="space-between" w="full">
                              <HStack spacing={2}>
                                <Box
                                  w="8px"
                                  h="8px"
                                  bg={accentColor}
                                  borderRadius="full"
                                />
                                <Text
                                  fontSize="xs"
                                  color={textColor}
                                  fontWeight="medium"
                                >
                                  {project.projectCategory}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color={textColor}>
                                Started:{" "}
                                {project.projectRegisterDate
                                  ? formatDateTimeBE(
                                      project.projectRegisterDate
                                    )
                                  : "N/A"}
                              </Text>
                            </HStack>

                            <Box w="full">
                              <HStack justify="space-between" mb={2}>
                                <Text
                                  fontSize="xs"
                                  color={textColor}
                                  fontWeight="medium"
                                >
                                  Progress
                                </Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color={accentColor}
                                >
                                  {project.projectStatusPercentage}%
                                </Text>
                              </HStack>
                              <Progress
                                value={project.projectStatusPercentage}
                                size="md"
                                colorScheme="blue"
                                borderRadius="full"
                                bg={useColorModeValue("gray.100", "gray.700")}
                              />
                            </Box>

                            <HStack justify="space-between" w="full">
                              <HStack spacing={2}>
                                <Box
                                  w="2px"
                                  h="16px"
                                  bg={accentColor}
                                  borderRadius="full"
                                />
                                <AvatarGroup size="xs" max={3}>
                                  {project.userAssignment?.map((assignment) => (
                                    <Avatar
                                      key={assignment.id}
                                      name={assignment.userData?.nama}
                                    />
                                  ))}
                                </AvatarGroup>
                              </HStack>
                              <Button
                                size="xs"
                                variant="ghost"
                                color={accentColor}
                                _hover={{ bg: accentColor, color: "white" }}
                                fontWeight="bold"
                                onClick={() => {
                                  handleProjectClick(project);
                                }}
                              >
                                View Details
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </Grid>

                {!projectsLoading &&
                  projects.length > 0 &&
                  projects.length < totalProjectsCount && (
                    <Button
                      variant="outline"
                      size="sm"
                      mt={4}
                      onClick={() =>
                        fetchProjects(searchTerm, 4, currentPage + 1, true)
                      }
                      colorScheme="blue"
                      borderRadius="lg"
                      _hover={{ transform: "translateY(-1px)" }}
                    >
                      Load More Projects
                    </Button>
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

                <VStack spacing={0} align="stretch">
                  {mockTasks.slice(0, taskLimit).map((task, index) => (
                    <Box key={task.id}>
                      <HStack
                        p={3}
                        _hover={{
                          bg: cardHoverBg,
                          borderLeftColor: accentColor,
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        borderLeft="3px solid transparent"
                      >
                        <VStack align="start" spacing={1} flex="1">
                          <HStack spacing={2} w="full">
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              noOfLines={1}
                              flex="1"
                            >
                              {task.taskName}
                            </Text>
                            <Badge
                              colorScheme={getStatusColor(task.boardCodeStage)}
                              size="sm"
                            >
                              {task.boardName}
                            </Badge>
                          </HStack>

                          <HStack
                            spacing={3}
                            w="full"
                            fontSize="xs"
                            color={textColor}
                          >
                            <Text>{task.taskCode}</Text>
                            <HStack spacing={1}>
                              <Icon as={FiCheckCircle} size="10px" />
                              <Text>
                                {task.countTaskItemDone}/{task.countTaskItem}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon as={FiActivity} size="10px" />
                              <Text>{task.taskPoint} pts</Text>
                            </HStack>
                            <Text>{task.endDate}</Text>
                          </HStack>
                        </VStack>

                        <VStack align="end" spacing={1}>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={accentColor}
                          >
                            {task.percentageStatus}%
                          </Text>
                          {task.assignUsers.length > 0 && (
                            <AvatarGroup size="xs" max={2} spacing="-2px">
                              {task.assignUsers.map((user) => (
                                <Avatar key={user.id} name={user.nama} />
                              ))}
                            </AvatarGroup>
                          )}
                        </VStack>
                      </HStack>

                      {index < mockTasks.slice(0, taskLimit).length - 1 && (
                        <Divider
                          borderColor={useColorModeValue(
                            "gray.200",
                            "gray.600"
                          )}
                        />
                      )}
                    </Box>
                  ))}

                  {taskLimit < mockTasks.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTaskLimit((prev) => prev + 4)}
                      colorScheme="blue"
                      borderRadius="lg"
                      _hover={{ transform: "translateY(-1px)" }}
                    >
                      Load More Tasks
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
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
                {/* Header with gradient */}
                <Box color="white" p={4} position="relative">
                  <HStack justify="space-between" mb={3}>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm">
                        Q{quarter} {year} Progress
                      </Heading>
                      <Text fontSize="xs" opacity={0.9}>
                        {inProgressTasks.length} ongoing /{" "}
                        {completedTasks.length} done
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
                        top="50%"
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
                          {completedTasks.length}
                        </Text>
                      </HStack>
                      <HStack w="full" justify="space-between">
                        <Text fontSize="xs" opacity={0.9}>
                          In Progress
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {inProgressTasks.length}
                        </Text>
                      </HStack>
                      <HStack w="full" justify="space-between">
                        <Text fontSize="xs" opacity={0.9}>
                          To Do
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {todoTasks.length}
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
                              ? `${Math.round(
                                  (completedTasks.length / totalTasks) * 100
                                )}%`
                              : "0%"
                          }
                          h="full"
                          bg="green.400"
                        />
                        <Box
                          w={
                            totalTasks > 0
                              ? `${Math.round(
                                  (inProgressTasks.length / totalTasks) * 100
                                )}%`
                              : "0%"
                          }
                          h="full"
                          bg="blue.400"
                        />
                        <Box
                          w={
                            totalTasks > 0
                              ? `${Math.round(
                                  (todoTasks.length / totalTasks) * 100
                                )}%`
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
                          {totalTasks > 0
                            ? Math.round(
                                (completedTasks.length / totalTasks) * 100
                              )
                            : 0}
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
                          {totalTasks > 0
                            ? Math.round(
                                (inProgressTasks.length / totalTasks) * 100
                              )
                            : 0}
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
                          {totalTasks > 0
                            ? Math.round((todoTasks.length / totalTasks) * 100)
                            : 0}
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
                              bg={useColorModeValue("blue.50", "blue.900")}
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
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1} flex="1">
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
                                  (completedTasks.length / totalTasks) * 100
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
                              bg={useColorModeValue("green.50", "green.900")}
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
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1} flex="1">
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
              </CardBody>
            </Card>

            {/* Current Projects Status */}
            <Card
              bg={bgColor}
              borderColor={borderColor}
              borderRadius={radiusStyle}
              shadow="sm"
              _hover={{ shadow: "md" }}
              transition="all 0.2s"
              overflow="hidden"
            >
              <CardBody p={0}>
                {/* Header with gradient */}
                <Box
                  bgGradient="linear(to-r, pink.400, pink.500)"
                  color="white"
                  p={4}
                  position="relative"
                >
                  <HStack justify="space-between" mb={3}>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm">Project Status</Heading>
                      <Text fontSize="xs" opacity={0.9}>
                        {activeProjects.length} active / {closedProjects.length}{" "}
                        closed
                      </Text>
                    </VStack>
                    <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
                      <Icon as={FiFolder} boxSize={5} />
                    </Box>
                  </HStack>

                  {/* Project Status Overview */}
                  <HStack spacing={4} align="center">
                    <Box position="relative" w="60px" h="60px">
                      <Progress
                        value={activeProjectPercentage}
                        size="lg"
                        colorScheme="purple"
                        bg="whiteAlpha.300"
                        borderRadius="full"
                        sx={{
                          "& > div": {
                            background:
                              "linear-gradient(90deg, #9F7AEA, #ED64A6)",
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
                        <Text fontSize="lg" fontWeight="bold">
                          {activeProjectPercentage}%
                        </Text>
                        <Text fontSize="xs" opacity={0.9}>
                          Active
                        </Text>
                      </Box>
                    </Box>

                    <VStack align="start" spacing={2} flex="1">
                      <HStack w="full" justify="space-between">
                        <Text fontSize="xs" opacity={0.9}>
                          Active
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {activeProjects.length}
                        </Text>
                      </HStack>
                      <HStack w="full" justify="space-between">
                        <Text fontSize="xs" opacity={0.9}>
                          Closed
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {closedProjects.length}
                        </Text>
                      </HStack>
                      <HStack w="full" justify="space-between">
                        <Text fontSize="xs" opacity={0.9}>
                          Total
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {totalProjects}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Project Status vs Bar */}
                  <Box mt={4}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="xs" opacity={0.9}>
                        Project Distribution
                      </Text>
                      <Text fontSize="xs" opacity={0.9}>
                        {totalProjects} projects
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
                            totalProjects > 0
                              ? `${Math.round(
                                  (activeProjects.length / totalProjects) * 100
                                )}%`
                              : "0%"
                          }
                          h="full"
                          bg="purple.400"
                        />
                        <Box
                          w={
                            totalProjects > 0
                              ? `${Math.round(
                                  (closedProjects.length / totalProjects) * 100
                                )}%`
                              : "0%"
                          }
                          h="full"
                          bg="gray.400"
                        />
                      </HStack>
                    </Box>
                    <HStack justify="space-between" mt={2} fontSize="xs">
                      <HStack spacing={1}>
                        <Box
                          w="8px"
                          h="8px"
                          bg="purple.400"
                          borderRadius="full"
                        />
                        <Text opacity={0.9}>
                          {totalProjects > 0
                            ? Math.round(
                                (activeProjects.length / totalProjects) * 100
                              )
                            : 0}
                          % Active
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Box
                          w="8px"
                          h="8px"
                          bg="gray.400"
                          borderRadius="full"
                        />
                        <Text opacity={0.9}>
                          {totalProjects > 0
                            ? Math.round(
                                (closedProjects.length / totalProjects) * 100
                              )
                            : 0}
                          % Closed
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Box>

                {/* Active Projects List */}
                <Box p={4}>
                  {activeProjects.length > 0 && (
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={2}>
                          <Box
                            w="3px"
                            h="16px"
                            bg="purple.500"
                            borderRadius="full"
                          />
                          <Text fontSize="sm" fontWeight="semibold">
                            Active Projects
                          </Text>
                        </HStack>
                        <Badge colorScheme="purple" variant="subtle">
                          {activeProjects.length}
                        </Badge>
                      </HStack>

                      <VStack spacing={2} align="stretch">
                        {activeProjects.slice(0, 2).map((project) => (
                          <Box
                            key={project.id}
                            p={3}
                            bg={useColorModeValue("purple.50", "purple.900")}
                            borderRadius="lg"
                            border="1px"
                            borderColor={useColorModeValue(
                              "purple.100",
                              "purple.800"
                            )}
                            _hover={{
                              borderColor: "purple.300",
                              transform: "translateY(-1px)",
                            }}
                            transition="all 0.2s"
                            cursor="pointer"
                          >
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={1} flex="1">
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  noOfLines={1}
                                >
                                  {project.projectName}
                                </Text>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" color={textColor}>
                                    {project.projectNo}
                                  </Text>
                                  <Badge
                                    size="xs"
                                    colorScheme="purple"
                                    variant="subtle"
                                  >
                                    {project.projectCategory}
                                  </Badge>
                                </HStack>
                              </VStack>
                              <VStack align="end" spacing={1}>
                                <Badge
                                  colorScheme={getStatusColor(
                                    project.projectStatus
                                  )}
                                  size="xs"
                                >
                                  {project.projectStatus}
                                </Badge>
                                <Progress
                                  value={project.projectStatusPercentage}
                                  size="sm"
                                  colorScheme="purple"
                                  w="50px"
                                  borderRadius="full"
                                />
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                        {activeProjects.length > 2 && (
                          <Text
                            fontSize="xs"
                            color={textColor}
                            textAlign="center"
                            py={1}
                          >
                            +{activeProjects.length - 2} more active projects
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}
                </Box>
              </CardBody>
            </Card>

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

                <VStack spacing={3} align="stretch">
                  {mockNotifications.map((notification) => (
                    <Box key={notification.id}>
                      <Text fontSize="sm" mb={1}>
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {notification.time}
                      </Text>
                      {notification.id < mockNotifications.length && (
                        <Divider mt={3} />
                      )}
                    </Box>
                  ))}
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

                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Box w="8px" h="8px" bg="green.500" borderRadius="full" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">Task completed</Text>
                      <Text fontSize="xs" color={textColor}>
                        2 hours ago
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <Box w="8px" h="8px" bg="blue.500" borderRadius="full" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">Project updated</Text>
                      <Text fontSize="xs" color={textColor}>
                        4 hours ago
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <Box w="8px" h="8px" bg="orange.500" borderRadius="full" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">New team member added</Text>
                      <Text fontSize="xs" color={textColor}>
                        1 day ago
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
};

export default WorkspaceProject;
