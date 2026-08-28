"use client";

import React, { useState, useEffect, useRef, Fragment, useMemo } from "react";
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
  Select,
  IconButton,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
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
  FiEye,
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
import { ControlTable } from "@/app/components/tableComponents";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  ProjectDataResponse,
  ProjectDetailResponse,
} from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import useTasks, {
  TaskViewModel,
  TaskActivityResponse,
} from "@/app/services/useTasks";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import useWorkspace, {
  WorkspaceStatsViewModel,
  WorkspaceTaskViewModel,
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

const formatDateDDMMYYYY = (dateString: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
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
    GetMyTasks,
    loading,
  } = useWorkspace();
  const { ListTaskActivitiesPaged } = useTasks();
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [recentActivities, setRecentActivities] = useState<TaskActivityResponse[]>([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false);

  const [stats, setStats] = useState<WorkspaceStatsViewModel | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [quarterProgress, setQuarterProgress] = useState<any>(null);
  const [quarterProgressLoading, setQuarterProgressLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [myTasks, setMyTasks] = useState<WorkspaceTaskViewModel[]>([]);
  const [myTasksLoading, setMyTasksLoading] = useState(false);

  // Task search, filter, and pagination states
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [taskCurrentPage, setTaskCurrentPage] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [taskPageSize, setTaskPageSize] = useState<number>(5);

  const fetchRecentActivities = async (userSysId?: string) => {
    const token = localStorage.getItem("tokenData");
    if (!token) return;

    setRecentActivitiesLoading(true);
    try {
      const filterWhereList: any[] = [];
      if (userSysId) {
        filterWhereList.push({
          field: "UserIdSys",
          operator: "=",
          value: userSysId,
        });
      }

      const payload: PaggingListPayloadCustom = {
        page: 0,
        limit: 5,
        search: "",
        filterWhere: filterWhereList,
        fieldOrder: ["CreatedAt"],
        orderDir: "desc",
      };

      const response = await ListTaskActivitiesPaged(payload, token);
      if (response?.statusCode === 200 && Array.isArray(response.data)) {
        setRecentActivities(response.data);
      } else {
        setRecentActivities([]);
      }
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      setRecentActivities([]);
    } finally {
      setRecentActivitiesLoading(false);
    }
  };

  const fetchMyTasks = async (
    search: string = "",
    priority: string = "All",
    status: string = "All",
    page: number = 0,
    limit: number = taskPageSize
  ) => {
    const token = localStorage.getItem("tokenData");
    if (token) {
      setMyTasksLoading(true);
      try {
        const filterWhereList: any[] = [];
        if (priority !== "All") {
          filterWhereList.push({
            Field: "TaskPriority",
            Value: priority,
            Operator: "="
          });
        }
        if (status !== "All") {
          filterWhereList.push({
            Field: "IsCompleted",
            Value: status === "Completed" ? "Y" : "N",
            Operator: "="
          });
        }
        const payload = {
          search: search,
          limit: limit,
          page: page,
          filterWhere: filterWhereList,
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        };
        const response = await GetMyTasks(payload, token);
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          setMyTasks(response.data);
          setTotalTasksCount(response.countTotal || response.data.length);
        }
      } catch (err) {
        console.error("Error fetching my tasks:", err);
      } finally {
        setMyTasksLoading(false);
      }
    }
  };

  const myTaskTableAdapter = useMemo(() => {
    const totalPages = Math.ceil(totalTasksCount / taskPageSize) || 1;
    return {
      getPageCount: () => totalPages,
      getState: () => ({
        pagination: {
          pageIndex: taskCurrentPage,
          pageSize: taskPageSize,
        },
      }),
      setPageIndex: (index: number) => {
        setTaskCurrentPage(index);
        fetchMyTasks(taskSearchTerm, taskPriorityFilter, taskStatusFilter, index, taskPageSize);
      },
      previousPage: () => {
        const prev = Math.max(0, taskCurrentPage - 1);
        setTaskCurrentPage(prev);
        fetchMyTasks(taskSearchTerm, taskPriorityFilter, taskStatusFilter, prev, taskPageSize);
      },
      nextPage: () => {
        const next = Math.min(totalPages - 1, taskCurrentPage + 1);
        setTaskCurrentPage(next);
        fetchMyTasks(taskSearchTerm, taskPriorityFilter, taskStatusFilter, next, taskPageSize);
      },
      getCanPreviousPage: () => taskCurrentPage > 0,
      getCanNextPage: () => taskCurrentPage < totalPages - 1,
      setPageSize: (size: number) => {
        setTaskPageSize(size);
        setTaskCurrentPage(0);
        fetchMyTasks(taskSearchTerm, taskPriorityFilter, taskStatusFilter, 0, size);
      },
    };
  }, [taskCurrentPage, taskPageSize, totalTasksCount, taskSearchTerm, taskPriorityFilter, taskStatusFilter]);

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
      setMyTasksLoading(true);

      // Parse user auth from localStorage
      let currentUserIdSys = "";
      const storedAuth = localStorage.getItem("AuthData");
      if (storedAuth) {
        try {
          const parsed: AuthDataModelInterface = JSON.parse(storedAuth);
          if (parsed.dataLogin) {
            const uData = parsed.dataLogin as AuthDataResponse;
            setDataAuth(uData);
            currentUserIdSys = uData.id || "";
          }
        } catch (e) {
          console.error("Error parsing AuthData:", e);
        }
      }

      try {
        const { quarter: q, year: y } = getCurrentQuarter();

        const [statsRes, typeCountsRes, projectsRes, quarterRes, myTasksRes] = await Promise.all([
          GetWorkspaceStats(token),
          GetProjectTypeCounts(token),
          GetAssignedProjects({ search: "", limit: 9, page: 0, projectType: null, filterWhere: [], fieldOrder: ["createdAt"], orderDir: "desc" }, token),
          GetQuarterProgress(q, y, token),
          GetMyTasks({ search: "", limit: 5, page: 0, filterWhere: [], fieldOrder: ["createdAt"], orderDir: "desc" }, token),
          fetchRecentActivities(currentUserIdSys),
        ]);

        if (statsRes?.statusCode === 200 && statsRes.data) setStats(statsRes.data);
        if (typeCountsRes?.statusCode === 200 && typeCountsRes.data) setProjectTypeCounts(typeCountsRes.data);
        if (projectsRes?.statusCode === 200 && projectsRes.data) {
          setProjects(projectsRes.data);
          setTotalProjectsCount(projectsRes.countTotal || 0);
        }
        if (quarterRes?.statusCode === 200) setQuarterProgress(quarterRes.data);
        if (myTasksRes?.statusCode === 200 && Array.isArray(myTasksRes.data)) {
          setMyTasks(myTasksRes.data);
          setTotalTasksCount(myTasksRes.countTotal || myTasksRes.data.length);
        }
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      } finally {
        setStatsLoading(false);
        setQuarterProgressLoading(false);
        setProjectsLoading(false);
        setMyTasksLoading(false);
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
  const borderColor = useColorModeValue("gray.200", "gray.700");
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
        <VStack spacing={6} align="stretch" mb={6}>
          {/* Executive Command Hero Banner */}
          <Box
            position="relative"
            bg={colorMode === "dark" ? "rgba(15, 23, 42, 0.85)" : "white"}
            backdropFilter="blur(16px)"
            rounded="2xl"
            shadow="2xl"
            border="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "blue.100"}
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="5px"
              bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
            />
            <Box p={6} position="relative" zIndex={1}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={5}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-br, cyan.500, blue.600)"
                    rounded="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shadow="0 8px 20px 0 rgba(0, 180, 216, 0.3)"
                    flexShrink={0}
                  >
                    <Icon as={FiMonitor} boxSize={7} color="white" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} align="center">
                      <Heading size="lg" color={colorMode === "dark" ? "white" : "gray.800"} letterSpacing="tight">
                        Executive Workspace
                      </Heading>
                      <HStack spacing={1.5} bg={colorMode === "dark" ? "gray.900" : "cyan.50"} px={2.5} py={0.5} rounded="full" border="1px" borderColor={colorMode === "dark" ? "gray.700" : "cyan.200"}>
                        <Box w={2} h={2} bg="cyan.400" rounded="full" />
                        <Text fontSize="2xs" fontWeight="bold" color={colorMode === "dark" ? "cyan.300" : "cyan.700"}>
                          LIVE PLATFORM
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                      Monitor, manage, and track your active project assignments & task progress in real time.
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={3}>
                  <Badge colorScheme="cyan" variant="solid" rounded="full" px={3} py={1} fontSize="xs">
                    {stats?.totalProjects ?? 0} Projects Assigned
                  </Badge>
                  <Badge colorScheme="green" variant="subtle" rounded="full" px={3} py={1} fontSize="xs">
                    {stats?.activeProjects ?? 0} Active
                  </Badge>
                </HStack>
              </Flex>
            </Box>
          </Box>
        </VStack>

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
                                GetMyTasks({ search: "", limit: 10, page: 0, filterWhere: [], fieldOrder: ["createdAt"], orderDir: "desc" }, token).then((res) => {
                                  if (res?.statusCode === 200 && Array.isArray(res.data)) {
                                    setMyTasks(res.data);
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

                  {/* Executive Segmented Tab Filters */}
                  <HStack spacing={2} mb={5} flexWrap="wrap" bg={colorMode === "dark" ? "gray.900" : "gray.100"} p={1.5} rounded="2xl" border="1px" borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}>
                    {[
                      { key: "All", label: "All Projects", count: projectTypeCounts.all, icon: FiFolder },
                      { key: "INTERNAL DEVELOPMENT", label: "Internal Dev", count: projectTypeCounts.internalDev, icon: FiMonitor },
                      { key: "PROCUREMENT", label: "Procurement", count: projectTypeCounts.procurement, icon: FiClipboard },
                      { key: "DEPLOYMENT", label: "Deployment", count: projectTypeCounts.deployment, icon: FiTrendingUp },
                    ].map(({ key, label, count, icon }) => {
                      const isSelected = selectedProjectType === key;
                      return (
                        <Button
                          key={key}
                          size="sm"
                          variant={isSelected ? "solid" : "ghost"}
                          colorScheme="cyan"
                          bg={isSelected ? "cyan.500" : "transparent"}
                          color={isSelected ? "white" : textColor}
                          onClick={() => setSelectedProjectType(key)}
                          borderRadius="xl"
                          px={4}
                          py={2}
                          leftIcon={<Icon as={icon} boxSize={4} />}
                          _hover={{
                            bg: isSelected ? "cyan.600" : (colorMode === "dark" ? "whiteAlpha.100" : "white"),
                            transform: "translateY(-1px)",
                          }}
                          transition="all 0.2s"
                        >
                          <HStack spacing={2}>
                            <Text fontSize="xs" fontWeight={isSelected ? "bold" : "semibold"}>
                              {label}
                            </Text>
                            <Badge
                              colorScheme={isSelected ? "whiteAlpha" : "cyan"}
                              variant={isSelected ? "solid" : "subtle"}
                              bg={isSelected ? "whiteAlpha.300" : undefined}
                              color={isSelected ? "white" : "cyan.400"}
                              fontSize="2xs"
                              fontFamily="mono"
                              rounded="full"
                              px={2}
                            >
                              {count}
                            </Badge>
                          </HStack>
                        </Button>
                      );
                    })}
                  </HStack>

                  {projectsLoading && (
                    <Box py={8}>
                      <LoadingMiniSignature />
                    </Box>
                  )}

                  {!projectsLoading && projects.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">
                        No assigned projects found.
                      </Text>
                    </Box>
                  )}

                  {!projectsLoading && projects.length > 0 && viewMode === "grid" && (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5}>
                      {projects.map((project) => (
                        <Card
                          key={project.id}
                          variant="outline"
                          size="sm"
                          rounded="xl"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                          shadow="sm"
                          _hover={{
                            transform: "translateY(-4px)",
                            shadow: "2xl",
                            borderColor: "cyan.400",
                          }}
                          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                          cursor="pointer"
                          onClick={() => handleProjectClick(project)}
                          position="relative"
                          overflow="hidden"
                        >
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            h="3px"
                            bgGradient="linear(to-r, cyan.400, blue.500)"
                          />
                          <CardBody p={4} zIndex={2}>
                            <VStack align="start" spacing={3} w="full">
                              <HStack justify="space-between" w="full">
                                <Text
                                  fontSize="2xs"
                                  color={colorMode === "dark" ? "cyan.300" : "cyan.700"}
                                  fontWeight="bold"
                                  fontFamily="mono"
                                >
                                  {project.projectNo}
                                </Text>
                                <Badge
                                  colorScheme={getStatusColor(
                                    project.projectStatus
                                  )}
                                  variant="subtle"
                                  fontSize="xs"
                                  rounded="full"
                                  px={2.5}
                                >
                                  {project.projectStatus}
                                </Badge>
                              </HStack>

                              <Box h={"40px"}>
                                <Heading
                                  size="sm"
                                  color={colorMode === "dark" ? "white" : "gray.800"}
                                  noOfLines={2}
                                  letterSpacing="tight"
                                >
                                  {project.projectName}
                                </Heading>
                              </Box>

                              <Box w="full">
                                <HStack justify="space-between" mb={1}>
                                  <Text fontSize="2xs" color={textColor} fontWeight="medium">
                                    Progress
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="cyan.400"
                                    fontFamily="mono"
                                  >
                                    {project.projectStatusPercentage}%
                                  </Text>
                                </HStack>
                                <Progress
                                  value={project.projectStatusPercentage}
                                  size="xs"
                                  colorScheme="cyan"
                                  borderRadius="full"
                                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                />
                              </Box>

                              <HStack justify="space-between" w="full" pt={1}>
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
                                  colorScheme="blue"
                                  variant="subtle"
                                  fontSize="2xs"
                                  rounded="full"
                                  px={2}
                                >
                                  {project.projectType}
                                </Badge>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  )}

                  {!projectsLoading && projects.length > 0 && viewMode === "list" && (
                    <TableContainer rounded="xl" border="1px" borderColor={colorMode === "dark" ? "gray.700" : "gray.200"} overflow="hidden">
                      <Table variant="simple" size="sm">
                        <Thead bg={colorMode === "dark" ? "gray.900" : "gray.50"}>
                          <Tr>
                            <Th py={3} color={textColor} fontSize="xs">No.</Th>
                            <Th py={3} color={textColor} fontSize="xs">Project Info</Th>
                            <Th py={3} color={textColor} fontSize="xs">Category & Type</Th>
                            <Th py={3} color={textColor} fontSize="xs">Status & Timeline</Th>
                            <Th py={3} color={textColor} fontSize="xs">Assigned Team</Th>
                            <Th py={3} color={textColor} fontSize="xs" textAlign="center">Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {projects.map((project, idx) => (
                            <Tr
                              key={project.id}
                              _hover={{ bg: colorMode === "dark" ? "whiteAlpha.50" : "cyan.50/30" }}
                              transition="background 0.15s"
                              cursor="pointer"
                              onClick={() => handleProjectClick(project)}
                            >
                              <Td py={3}>
                                <Text fontSize="xs" fontFamily="mono" color={textColor}>
                                  {currentPage * 9 + idx + 1}.
                                </Text>
                              </Td>
                              <Td py={3}>
                                <VStack align="start" spacing={0.5}>
                                  <Text fontSize="2xs" fontWeight="bold" fontFamily="mono" color="cyan.400">
                                    {project.projectNo}
                                  </Text>
                                  <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "white" : "gray.800"} noOfLines={1}>
                                    {project.projectName}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td py={3}>
                                <VStack align="start" spacing={1}>
                                  <Badge colorScheme="blue" variant="subtle" fontSize="2xs" rounded="full" px={2}>
                                    {project.projectType}
                                  </Badge>
                                  {project.projectCategory && (
                                    <Text fontSize="2xs" color={textColor}>
                                      {project.projectCategory}
                                    </Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td py={3}>
                                <VStack align="start" spacing={1} minW="140px">
                                  <HStack spacing={2} w="full" justify="space-between">
                                    <Badge
                                      colorScheme={getStatusColor(project.projectStatus)}
                                      variant="subtle"
                                      fontSize="2xs"
                                      rounded="full"
                                      px={2}
                                    >
                                      {project.projectStatus}
                                    </Badge>
                                    <Text fontSize="2xs" fontWeight="bold" fontFamily="mono" color="cyan.400">
                                      {project.projectStatusPercentage}%
                                    </Text>
                                  </HStack>
                                  <Progress
                                    value={project.projectStatusPercentage}
                                    size="xs"
                                    colorScheme="cyan"
                                    borderRadius="full"
                                    w="full"
                                    bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                  />
                                </VStack>
                              </Td>
                              <Td py={3}>
                                <AvatarGroup size="xs" max={3}>
                                  {project.userAssignment?.map((assignment) => (
                                    <Avatar
                                      key={assignment.id}
                                      name={assignment.userData?.nama}
                                      src={assignment.userData?.profilePict || undefined}
                                    />
                                  ))}
                                </AvatarGroup>
                              </Td>
                              <Td py={3} textAlign="center">
                                <Button
                                  size="xs"
                                  leftIcon={<FiEye />}
                                  colorScheme="cyan"
                                  variant="subtle"
                                  rounded="lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProjectClick(project);
                                  }}
                                >
                                  Preview
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}

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

              {/* My Ongoing Assigned Tasks Section */}
              <Card
                bg={colorMode === "dark" ? "gray.800" : "white"}
                border="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                rounded="2xl"
                shadow="sm"
                overflow="hidden"
                position="relative"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="3px"
                  bgGradient="linear(to-r, cyan.400, blue.500)"
                />
                <CardBody p={5}>
                  <Flex
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap={3}
                    mb={5}
                  >
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(to-br, cyan.500, blue.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        shadow="md"
                      >
                        <Icon as={FiCheckCircle} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="md" color={colorMode === "dark" ? "white" : "gray.800"} letterSpacing="tight">
                          My Ongoing Assigned Tasks
                        </Heading>
                        <Text fontSize="2xs" color={textColor}>
                          Active tasks assigned to you across projects
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Executive Filter Bar */}
                    <HStack
                      spacing={2}
                      w={{ base: "full", md: "auto" }}
                      p={1.5}
                      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
                      rounded="xl"
                      border="1px solid"
                      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                      flexWrap="wrap"
                    >
                      <InputGroup size="sm" maxW={{ base: "full", md: "190px" }}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiSearch} color="gray.400" boxSize={3.5} />
                        </InputLeftElement>
                        <Input
                          placeholder="Search task..."
                          value={taskSearchTerm}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTaskSearchTerm(val);
                            setTaskCurrentPage(0);
                            fetchMyTasks(val, taskPriorityFilter, taskStatusFilter, 0, taskPageSize);
                          }}
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                          borderRadius="lg"
                          fontSize="xs"
                          _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #00B5D8" }}
                        />
                      </InputGroup>

                      <Select
                        size="sm"
                        maxW={{ base: "full", sm: "125px" }}
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                        borderRadius="lg"
                        fontSize="xs"
                        value={taskPriorityFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTaskPriorityFilter(val);
                          setTaskCurrentPage(0);
                          fetchMyTasks(taskSearchTerm, val, taskStatusFilter, 0, taskPageSize);
                        }}
                        _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #00B5D8" }}
                      >
                        <option value="All">All Priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </Select>

                      <Select
                        size="sm"
                        maxW={{ base: "full", sm: "125px" }}
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                        borderRadius="lg"
                        fontSize="xs"
                        value={taskStatusFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTaskStatusFilter(val);
                          setTaskCurrentPage(0);
                          fetchMyTasks(taskSearchTerm, taskPriorityFilter, val, 0, taskPageSize);
                        }}
                        _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #00B5D8" }}
                      >
                        <option value="All">All Status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </Select>

                      <Tooltip label="Refresh tasks" placement="top" hasArrow>
                        <IconButton
                          aria-label="Refresh tasks"
                          icon={<FiRefreshCw />}
                          size="sm"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                          variant="outline"
                          colorScheme="cyan"
                          borderRadius="lg"
                          onClick={() => fetchMyTasks(taskSearchTerm, taskPriorityFilter, taskStatusFilter, taskCurrentPage, taskPageSize)}
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>

                  {myTasksLoading ? (
                    <Box py={8}>
                      <LoadingMiniSignature />
                    </Box>
                  ) : myTasks.length === 0 ? (
                    <VStack spacing={3} py={8} textAlign="center">
                      <Icon as={FiCheckCircle} boxSize={10} color="gray.400" />
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        No ongoing assigned tasks found.
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        You have completed all your assigned tasks!
                      </Text>
                    </VStack>
                  ) : (
                    <>
                      <TableContainer
                        rounded="xl"
                        border="1px"
                        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                      >
                        <Table variant="simple" size="sm" style={{ tableLayout: "fixed", width: "100%" }}>
                          <Thead bg={colorMode === "dark" ? "whiteAlpha.05" : "blackAlpha.50"}>
                            <Tr>
                              <Th py={3} color={textColor} fontSize="xs" w="32%">Task Info</Th>
                              <Th py={3} color={textColor} fontSize="xs" w="20%">Project</Th>
                              <Th py={3} color={textColor} fontSize="xs" w="12%">Priority</Th>
                              <Th py={3} color={textColor} fontSize="xs" w="14%">Stage / Status</Th>
                              <Th py={3} color={textColor} fontSize="xs" w="12%">Due Date</Th>
                              <Th py={3} color={textColor} fontSize="xs" w="10%" textAlign="center">Action</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {myTasks.map((task) => {
                              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                              return (
                                <Tr
                                  key={task.id}
                                  _hover={{ bg: colorMode === "dark" ? "whiteAlpha.50" : "cyan.50/30" }}
                                  transition="background 0.15s"
                                >
                                  {/* Task Title & Description - Clean text with strict truncation */}
                                  <Td py={3} maxW="240px" style={{ overflow: "hidden" }}>
                                    <VStack align="start" spacing={0.5} w="100%" style={{ overflow: "hidden" }}>
                                      <Tooltip label={task.title} placement="top-start" hasArrow>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="semibold"
                                          color={colorMode === "dark" ? "white" : "gray.800"}
                                          noOfLines={1}
                                          isTruncated
                                          w="100%"
                                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                        >
                                          {task.title}
                                        </Text>
                                      </Tooltip>
                                      {task.description && (
                                        <Tooltip label={task.description} placement="top-start" hasArrow>
                                          <Text
                                            fontSize="2xs"
                                            color={textColor}
                                            noOfLines={1}
                                            isTruncated
                                            w="100%"
                                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                          >
                                            {task.description}
                                          </Text>
                                        </Tooltip>
                                      )}
                                    </VStack>
                                  </Td>

                                  {/* Project Name - Clean text with icon, NEVER wrapped inside badge */}
                                  <Td py={3} maxW="160px" style={{ overflow: "hidden" }}>
                                    <Tooltip label={task.projectName} placement="top" hasArrow>
                                      <HStack spacing={1.5} w="100%" style={{ overflow: "hidden" }}>
                                        <Icon as={FiFolder} color="cyan.400" boxSize={3.5} flexShrink={0} />
                                        <Text
                                          fontSize="xs"
                                          fontWeight="medium"
                                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                                          noOfLines={1}
                                          isTruncated
                                          w="100%"
                                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                        >
                                          {task.projectName || "General"}
                                        </Text>
                                      </HStack>
                                    </Tooltip>
                                  </Td>

                                  {/* Priority Badge - Compact Pill for Short Text */}
                                  <Td py={3}>
                                    <Badge
                                      colorScheme={
                                        task.priority?.toUpperCase() === "HIGH" || task.priority?.toUpperCase() === "CRITICAL"
                                          ? "red"
                                          : task.priority?.toUpperCase() === "MEDIUM"
                                          ? "orange"
                                          : "green"
                                      }
                                      variant="subtle"
                                      fontSize="2xs"
                                      rounded="full"
                                      px={2.5}
                                      py={0.5}
                                      fontWeight="bold"
                                    >
                                      {task.priority || "MEDIUM"}
                                    </Badge>
                                  </Td>

                                  {/* Stage / Status Badge - Compact Badge */}
                                  <Td py={3}>
                                    <Badge
                                      colorScheme={task.status === "Completed" ? "green" : "purple"}
                                      variant="subtle"
                                      fontSize="2xs"
                                      rounded="full"
                                      px={2.5}
                                      py={0.5}
                                    >
                                      {task.boardName || task.status}
                                    </Badge>
                                  </Td>

                                  {/* Due Date */}
                                  <Td py={3}>
                                    {task.dueDate ? (
                                      <HStack spacing={1}>
                                        <Icon as={FiClock} boxSize={3} color={isOverdue ? "red.400" : "gray.400"} />
                                        <Text
                                          fontSize="2xs"
                                          fontFamily="mono"
                                          color={isOverdue ? "red.400" : textColor}
                                          fontWeight={isOverdue ? "bold" : "normal"}
                                        >
                                          {convertToCustomDateFormat(task.dueDate)}
                                        </Text>
                                      </HStack>
                                    ) : (
                                      <Text fontSize="2xs" color="gray.400">-</Text>
                                    )}
                                  </Td>

                                  {/* Kanban Board Direct Link Button */}
                                  <Td py={3} textAlign="center">
                                    {task.projectId ? (
                                      <Link href={`/workspace/project?projectId=${task.projectId}&taskId=${task.id}`} passHref>
                                        <Button
                                          size="xs"
                                          leftIcon={<FiArrowRightCircle />}
                                          colorScheme="cyan"
                                          variant="subtle"
                                          rounded="lg"
                                        >
                                          Task Board
                                        </Button>
                                      </Link>
                                    ) : (
                                      <Text fontSize="2xs" color="gray.400">-</Text>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </TableContainer>

                      {/* Standard Project Table Pagination Component */}
                      {totalTasksCount > 0 && (
                        <Box mt={2}>
                          <ControlTable table={myTaskTableAdapter} />
                        </Box>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
            <VStack spacing={6} align="stretch">
              {/* Quick Stats Grid (2x2) */}
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }}
                gap={3}
              >
                {[
                  { label: "Total Projects", value: stats?.totalProjects ?? 0, color: "blue", icon: FiFolder },
                  { label: "Active Projects", value: stats?.activeProjects ?? 0, color: "green", icon: FiTarget },
                  { label: "Total Tasks", value: stats?.totalTasks ?? 0, color: "purple", icon: FiCheckCircle },
                  { label: "Overdue Tasks", value: stats?.overdueTasks ?? 0, color: "orange", icon: FiClock },
                ].map(({ label, value, color, icon }) => (
                  <Card
                    key={label}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    border="1px"
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                    rounded="xl"
                    shadow="sm"
                    _hover={{ transform: "translateY(-3px)", shadow: "xl", borderColor: `${color}.400` }}
                    transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    overflow="hidden"
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="3px"
                      bgGradient={`linear(to-r, ${color}.400, ${color}.600)`}
                    />
                    <CardBody p={4}>
                      <VStack spacing={2} align="start">
                        <HStack spacing={2}>
                          <Box
                            w={8}
                            h={8}
                            bgGradient={`linear(to-br, ${color}.400, ${color}.600)`}
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            flexShrink={0}
                          >
                            <Icon as={icon} boxSize={4} />
                          </Box>
                          <Text
                            color={textColor}
                            fontSize="2xs"
                            fontWeight="semibold"
                            noOfLines={1}
                          >
                            {label}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="2xl"
                          fontWeight="extrabold"
                          color={`${color}.400`}
                          fontFamily="mono"
                          lineHeight="1"
                        >
                          {statsLoading ? "..." : value}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
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
                <CardBody p={5}>
                  <HStack justify="space-between" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FiActivity} color={accentColor} />
                      <Heading size="sm" color={accentColor}>
                        Recent Activity
                      </Heading>
                    </HStack>
                    <Tooltip label="Refresh activity" fontSize="xs" placement="top">
                      <IconButton
                        aria-label="Refresh activity"
                        icon={<FiRefreshCw />}
                        size="xs"
                        variant="ghost"
                        color={textColor}
                        isLoading={recentActivitiesLoading}
                        onClick={() => fetchRecentActivities(dataAuth?.id)}
                      />
                    </Tooltip>
                  </HStack>

                  {recentActivitiesLoading ? (
                    <VStack spacing={3} py={6}>
                      <Spinner size="md" color={accentColor} />
                      <Text fontSize="xs" color={textColor}>
                        Loading activities...
                      </Text>
                    </VStack>
                  ) : recentActivities.length > 0 ? (
                    <VStack
                      spacing={0}
                      align="stretch"
                      w="full"
                      divider={
                        <Divider
                          borderColor={
                            colorMode === "light"
                              ? "gray.100"
                              : "gray.700"
                          }
                        />
                      }
                    >
                      {recentActivities.map((act) => {
                        const userName =
                          act.userData?.nama ||
                          act.userData?.userId ||
                          dataAuth?.nama ||
                          "You";
                        const userAvatar =
                          act.userData?.profilePict || dataAuth?.profilePict || undefined;

                        return (
                          <Box key={act.id} py={2.5}>
                            <HStack spacing={2.5} align="start">
                              <Avatar
                                size="xs"
                                name={userName}
                                src={userAvatar}
                                mt="1px"
                              />
                              <VStack spacing={0.5} align="start" flex={1} minW={0}>
                                <HStack
                                  justify="space-between"
                                  w="full"
                                  spacing={1}
                                >
                                  <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={
                                      colorMode === "light"
                                        ? "gray.700"
                                        : "gray.200"
                                    }
                                    noOfLines={1}
                                  >
                                    {userName}
                                  </Text>
                                  <HStack
                                    spacing={1}
                                    color={
                                      colorMode === "light"
                                        ? "gray.400"
                                        : "gray.500"
                                    }
                                    flexShrink={0}
                                  >
                                    <Icon as={FiClock} boxSize="10px" />
                                    <Text fontSize="10px">
                                      {formatDateDDMMYYYY(act.createdAt)}
                                    </Text>
                                  </HStack>
                                </HStack>
                                <Text
                                  fontSize="xs"
                                  color={
                                    colorMode === "light"
                                      ? "gray.600"
                                      : "gray.300"
                                  }
                                  wordBreak="break-word"
                                  lineHeight="shorter"
                                >
                                  {act.activity}
                                </Text>
                                {act.taskName && (
                                  <HStack spacing={1} mt="2px">
                                    <Badge
                                      variant="subtle"
                                      colorScheme="blue"
                                      fontSize="10px"
                                      px={1.5}
                                      py={0.5}
                                      borderRadius="sm"
                                      maxW="220px"
                                      isTruncated
                                    >
                                      {act.taskName}
                                    </Badge>
                                  </HStack>
                                )}
                              </VStack>
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  ) : (
                    <VStack spacing={3} py={6}>
                      <Icon
                        as={FiActivity}
                        boxSize={8}
                        color={textColor}
                        opacity={0.4}
                      />
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color={textColor}
                        opacity={0.8}
                      >
                        No recent activity recorded
                      </Text>
                    </VStack>
                  )}
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
