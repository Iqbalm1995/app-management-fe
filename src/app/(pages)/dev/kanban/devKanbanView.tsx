"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ButtonGroup,
  IconButton,
  Badge,
  Spinner,
  useColorMode,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Checkbox,
  Avatar,
  AvatarGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Divider,
  Grid,
  GridItem,
  Heading,
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Wrap,
  WrapItem,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiPlusCircle,
  FiCode,
  FiFolder,
  FiTrello,
  FiLayers,
  FiCheck,
  FiTrash2,
  FiMessageSquare,
  FiSend,
  FiClock,
  FiLoader,
  FiEye,
  FiCheckCircle,
  FiCircle,
  FiList,
  FiInbox,
  FiX,
  FiEdit2,
  FiSettings,
  FiCornerDownLeft,
  FiArchive,
  FiRotateCcw,
  FiChevronDown,
  FiLock,
  FiCalendar,
  FiUsers,
  FiExternalLink,
  FiAlertTriangle,
  FiAlertCircle,
} from "react-icons/fi";
import { keyframes } from "@emotion/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { convertToCustomDateFormat } from "@/app/helper/MasterHelper";
import useTasks, {
  TaskBoardViewModel,
  TaskViewModel,
  CreateSimpleTaskPayload,
  TaskCreatePayload,
  TaskMovePayload,
  TaskItemResponse,
  TaskCommentResponse,
  GenerateTaskBoardPayload,
  TaskUpdatePayload,
  AssignUsersTaskPayload,
} from "@/app/services/useTasks";
import { DateTimeRangeInput } from "@/app/components/DateTimeRangeInput";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
import { UsersResponse } from "@/app/services/useUsers";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import DevFloatingTopbar from "../components/DevFloatingTopbar";
import DevKanbanColumn from "./components/DevKanbanColumn";
import { DEV_THEME } from "../constants/devThemeConstants";

interface SelectedProjectStorage {
  id: string;
  projectNo: string;
  projectName: string;
  projectStatus: string;
  backlogId?: string | null;
}

// Indeterminate top progress bar animation for the dev-mode loading state
const devLoadingBarSlide = keyframes`
  0%   { left: -40%; width: 40%; }
  50%  { left: 25%;  width: 55%; }
  100% { left: 100%; width: 40%; }
`;

const formatDateDDMMYYYY = (dateString?: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function DevKanbanView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Task services
  const {
    ListTasksBoard,
    ListTasksPaged,
    MoveTask,
    CreateSimpleTask,
    CreateTask,
    GenerateKanbanBoard,
    GetTaskDetail,
    ListTaskItems,
    CreateTaskItem,
    UpdateTaskItem,
    DeleteTaskItem,
    ListTaskComments,
    CreateTaskComment,
    UpdateTaskComment,
    DeleteTaskComment,
    ArchiveTask,
    UpdateTask,
    AssignUsersTask,
  } = useTasks();

  const { GetDetailById: GetProjectDetail, GetAssignedProjects } = useProjects();
  const { ListBacklog } = useRequirements();

  // Project selector modal for initiating state
  const [initProjects, setInitProjects] = useState<ProjectDataResponse[]>([]);
  const [isLoadingInitProjects, setIsLoadingInitProjects] = useState<boolean>(false);
  const [initSearch, setInitSearch] = useState<string>("");

  // Core project context states
  const [selectedProject, setSelectedProject] =
    useState<SelectedProjectStorage | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [projectData, setProjectData] = useState<ProjectDataResponse | null>(
    null
  );

  // Backlog states
  const [backlogs, setBacklogs] = useState<BacklogDataResponse[]>([]);
  const [currentBacklogId, setCurrentBacklogId] = useState<string>("");

  // Kanban boards, tasks and filter states matching /workspace/project?projectId=
  const [boards, setBoards] = useState<TaskBoardViewModel[]>([]);
  const [tasks, setTasks] = useState<TaskViewModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(true);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState<boolean>(false);
  const [isCompactView, setIsCompactView] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(
    null
  );
  const [isGeneratingBoard, setIsGeneratingBoard] = useState<boolean>(false);

  // Task Detail Modal states
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const [activeTask, setActiveTask] = useState<TaskViewModel | null>(null);
  const [taskItems, setTaskItems] = useState<TaskItemResponse[]>([]);
  const [taskComments, setTaskComments] = useState<TaskCommentResponse[]>([]);
  const [newChecklistText, setNewChecklistText] = useState<string>("");
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [isLoadingTaskDetails, setIsLoadingTaskDetails] =
    useState<boolean>(false);
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);

  // Inline task editing and detail states matching /workspace/project?projectId=
  const [isEditingTaskName, setIsEditingTaskName] = useState<boolean>(false);
  const [editedTaskName, setEditedTaskName] = useState<string>("");
  const [isEditingTaskDesc, setIsEditingTaskDesc] = useState<boolean>(false);
  const [editedTaskDesc, setEditedTaskDesc] = useState<string>("");
  const [isSavingTaskInline, setIsSavingTaskInline] = useState<boolean>(false);
  const [isLoadingTaskItems, setIsLoadingTaskItems] = useState<boolean>(false);
  const [isArchivingTask, setIsArchivingTask] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>("");

  const currentAuthUser = useMemo(() => {
    try {
      const userData =
        sessionStorage.getItem("userData") || localStorage.getItem("userData");
      if (userData) return JSON.parse(userData);
      const stored = localStorage.getItem("authData");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.dataLogin || null;
      }
    } catch {}
    return null;
  }, []);

  // Multi-step workspace loading state matching /workspace/project?projectId=
  const [loadingStep, setLoadingStep] = useState<
    "init" | "project" | "boards" | "backlogs" | "tasks" | "ready" | null
  >(null);

  // Date picker states inside task detail modal
  const [tempStartDate, setTempStartDate] = useState<string | null>(null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(null);
  const [isSavingTaskDates, setIsSavingTaskDates] = useState<boolean>(false);

  // Assign member modal states matching /workspace/project?projectId=
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();
  const [searchUserAssign, setSearchUserAssign] = useState<string>("");
  const [dataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [choosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);
  const [isSavingAssignments, setIsSavingAssignments] =
    useState<boolean>(false);

  // Comprehensive Task Create/Edit Modal states matching /workspace/project?projectId=
  const {
    isOpen: isTaskModalOpen,
    onOpen: onTaskModalOpen,
    onClose: onTaskModalClose,
  } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<TaskViewModel | null>(null);
  const [isSavingTask, setIsSavingTask] = useState<boolean>(false);
  const [taskForm, setTaskForm] = useState({
    taskName: "",
    taskDesc: "",
    taskPriority: "MEDIUM",
    taskStartDate: "",
    taskEndDate: "",
    boardId: "",
    backlogId: "",
  });

  // Bulk JSON Import Modal states — bulk-create tasks (+ checklist items + team) from raw JSON
  const {
    isOpen: isJsonImportOpen,
    onOpen: onJsonImportOpen,
    onClose: onJsonImportClose,
  } = useDisclosure();
  const [jsonImportText, setJsonImportText] = useState<string>("");
  const [jsonImportError, setJsonImportError] = useState<string>("");
  const [isImportingJson, setIsImportingJson] = useState<boolean>(false);
  const [jsonImportResult, setJsonImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const jsonHighlightRef = useRef<HTMLPreElement | null>(null);
  const jsonGutterRef = useRef<HTMLDivElement | null>(null);

  // Change Project Modal — lets the user switch to another assigned project from the header
  const {
    isOpen: isChangeProjectOpen,
    onOpen: onChangeProjectOpen,
    onClose: onChangeProjectClose,
  } = useDisclosure();

  // Initialize selected project from localStorage
  useEffect(() => {
    const token = localStorage.getItem("tokenData") || "";
    setTokenData(token);

    const saved = localStorage.getItem("dev_selected_project");
    if (saved) {
      try {
        const parsed: SelectedProjectStorage = JSON.parse(saved);
        setSelectedProject(parsed);
        if (parsed.backlogId) {
          setCurrentBacklogId(parsed.backlogId);
        }
      } catch (e) {
        console.error("Failed to parse dev_selected_project:", e);
      }
    }

    const handleSwitched = (e: Event) => {
      const custom = e as CustomEvent<SelectedProjectStorage>;
      if (custom.detail) {
        setSelectedProject(custom.detail);
        setCurrentBacklogId(custom.detail.backlogId || "");
        setBoards([]);
        setTasks([]);
        router.replace(`/dev/kanban?projectId=${custom.detail.id}`);
      }
    };
    window.addEventListener("dev_project_switched", handleSwitched);

    return () => {
      window.removeEventListener("dev_project_switched", handleSwitched);
    };
  }, [router]);

  // Load project from URL parameter ?projectId=... matching /workspace/project?projectId=
  useEffect(() => {
    if (!urlProjectId) return;
    const token = tokenData || localStorage.getItem("tokenData") || "";
    if (!token) return;
    if (selectedProject?.id === urlProjectId) return;

    const loadUrlProject = async () => {
      try {
        const projRes = await GetProjectDetail(urlProjectId, token);
        if (projRes?.statusCode === RES_CODE_OK && projRes.data) {
          const proj = projRes.data;
          const payload: SelectedProjectStorage = {
            id: proj.id,
            projectNo: proj.projectNo,
            projectName: proj.projectName,
            projectStatus: proj.projectStatus,
            backlogId: null,
          };
          setSelectedProject(payload);
          setProjectData(proj);
          localStorage.setItem("dev_selected_project", JSON.stringify(payload));
        }
      } catch (e) {
        console.error("Failed to load project from URL query param:", e);
      }
    };

    loadUrlProject();
  }, [urlProjectId, tokenData, selectedProject?.id, GetProjectDetail]);

  // Fetch assigned projects when no project is selected (initiating modal state)
  useEffect(() => {
    if (selectedProject?.id) return;
    const token = tokenData || localStorage.getItem("tokenData") || "";
    if (!token) return;

    const fetchInitProjects = async () => {
      setIsLoadingInitProjects(true);
      try {
        const res = await GetAssignedProjects(
          {
            search: "",
            limit: 100,
            page: 0,
            filterWhere: [],
            fieldOrder: ["projectName"],
            orderDir: "asc",
          },
          token
        );
        if (res?.statusCode === 200 && Array.isArray(res.data)) {
          setInitProjects(res.data);
        } else {
          setInitProjects([]);
        }
      } catch (err) {
        console.error("Failed to load assigned projects for selector modal:", err);
        setInitProjects([]);
      } finally {
        setIsLoadingInitProjects(false);
      }
    };

    fetchInitProjects();
  }, [selectedProject?.id, tokenData, GetAssignedProjects]);

  const handleSelectInitProject = (proj: ProjectDataResponse) => {
    const payload: SelectedProjectStorage = {
      id: proj.id,
      projectNo: proj.projectNo,
      projectName: proj.projectName,
      projectStatus: proj.projectStatus,
      backlogId: null,
    };
    setSelectedProject(payload);
    setProjectData(proj);
    localStorage.setItem("dev_selected_project", JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent("dev_project_switched", { detail: payload })
    );
    router.replace(`/dev/kanban?projectId=${proj.id}`);
  };

  const filteredInitProjects = useMemo(() => {
    if (!initSearch.trim()) return initProjects;
    const lower = initSearch.toLowerCase();
    return initProjects.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(lower) ||
        p.projectNo?.toLowerCase().includes(lower) ||
        p.projectStatus?.toLowerCase().includes(lower) ||
        p.proManageByTeamName?.toLowerCase().includes(lower)
    );
  }, [initProjects, initSearch]);

  // Fetch project details and its available backlogs
  useEffect(() => {
    if (!selectedProject?.id || !tokenData) return;

    const loadProjectAndBacklogs = async () => {
      try {
        // Fetch project full detail
        const projRes = await GetProjectDetail(selectedProject.id, tokenData);
        if (projRes?.statusCode === RES_CODE_OK && projRes.data) {
          setProjectData(projRes.data);
        }

        // Fetch backlogs linked to this project
        const backlogRes = await ListBacklog(
          {
            search: "",
            limit: 50,
            page: 0,
            filterWhere: [
              {
                field: "projectId",
                operator: "=",
                value: selectedProject.id,
              },
            ],
            fieldOrder: ["createdAt"],
            orderDir: "desc",
          },
          tokenData
        );

        if (backlogRes?.statusCode === RES_CODE_OK && Array.isArray(backlogRes.data)) {
          setBacklogs(backlogRes.data);
          // If currentBacklogId is set to an invalid ID (e.g. legacy requirementData id), reset to "" (All Backlogs)
          if (currentBacklogId && !backlogRes.data.some((b) => b.id === currentBacklogId)) {
            setCurrentBacklogId("");
            const updated = { ...selectedProject, backlogId: null };
            setSelectedProject(updated);
            localStorage.setItem(
              "dev_selected_project",
              JSON.stringify(updated)
            );
          }
        }
      } catch (err) {
        console.error("Error loading project backlogs:", err);
      }
    };

    loadProjectAndBacklogs();
  }, [selectedProject?.id, tokenData]);

  // Fetch Kanban board columns + ALL project tasks — matching /workspace/project?projectId=:
  // board columns and the task list are both scoped to the PROJECT, not to a single backlog.
  // currentBacklogId is applied afterwards as a pure client-side filter (see filteredTasks),
  // so switching the "Backlog" selector never re-fetches or regenerates a different board.
  const loadKanbanData = useCallback(async () => {
    if (!selectedProject?.id || !tokenData) {
      setIsLoadingBoards(false);
      return;
    }

    // Board columns are loaded once from a stable backlog reference (the project's primary
    // backlog) so the column structure never changes when the user picks a different backlog
    // in the filter. Prefer the currently loaded backlog list's first entry; fall back to
    // whatever backlog is already known (e.g. from the project payload) while backlogs load.
    const boardSourceBacklogId = backlogs[0]?.id || currentBacklogId;
    if (!boardSourceBacklogId) {
      setIsLoadingBoards(false);
      return;
    }

    setIsLoadingBoards(true);
    setLoadingStep("init");
    try {
      setLoadingStep("boards");
      // 1. Fetch Board Columns — once, from the project's primary backlog
      const boardRes = await ListTasksBoard(boardSourceBacklogId, tokenData);
      if (boardRes?.statusCode === RES_CODE_OK && Array.isArray(boardRes.data)) {
        setBoards(boardRes.data);
      } else {
        setBoards([]);
      }

      setLoadingStep("tasks");
      // 2. Fetch ALL tasks for the project (mixed backlogs supported), not just one backlog.
      // The backlog dropdown filters this list client-side afterwards.
      const taskRes = await ListTasksPaged(
        {
          search: "",
          limit: 1000,
          page: 0,
          filterWhere: [
            {
              field: "projectId",
              operator: "=",
              value: selectedProject.id,
            },
            {
              field: "isArchived",
              operator: "=",
              value: "N",
            },
          ],
          fieldOrder: ["indexTask"],
          orderDir: "asc",
        },
        tokenData
      );

      if (taskRes?.statusCode === RES_CODE_OK && Array.isArray(taskRes.data)) {
        setTasks(taskRes.data);
      } else {
        setTasks([]);
      }
      setLastUpdated(new Date());
      setLoadingStep("ready");
    } catch (err) {
      console.error("Failed to load kanban data:", err);
    } finally {
      setIsLoadingBoards(false);
      setLoadingStep(null);
    }
  }, [selectedProject?.id, backlogs, tokenData]);

  useEffect(() => {
    loadKanbanData();
  }, [loadKanbanData]);

  // Handle switching backlog via selector — PURE client-side filter now (matching
  // /workspace/project?projectId=). Does NOT touch boards/tasks fetching or localStorage;
  // it only changes which already-loaded tasks are displayed (see filteredTasks).
  const handleBacklogChange = (backlogId: string) => {
    setCurrentBacklogId(backlogId);
  };

  // Generate board handler if none exists — uses the same stable primary-backlog
  // reference as loadKanbanData, so it always targets the board actually being shown.
  const handleGenerateBoard = async () => {
    const boardSourceBacklogId = backlogs[0]?.id || currentBacklogId;
    if (!boardSourceBacklogId || !selectedProject?.id || !tokenData) {
      showToast({
        description: "Missing project or backlog to generate board",
        statusToast: "error",
      });
      return;
    }

    setIsGeneratingBoard(true);
    try {
      const payload: GenerateTaskBoardPayload = {
        backlogId: boardSourceBacklogId,
        projectId: selectedProject.id,
      };
      const res = await GenerateKanbanBoard(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Kanban board successfully generated!",
          statusToast: "success",
        });
        await loadKanbanData();
      } else {
        showToast({
          description: res?.message || "Failed to generate board",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Board generation error:", err);
      showToast({
        description: "Error generating board",
        statusToast: "error",
      });
    } finally {
      setIsGeneratingBoard(false);
    }
  };

  // Drag and Drop: Move task handler
  const handleMoveTask = async (taskId: string, targetBoardId: string) => {
    const movedTask = tasks.find((t) => t.id === taskId);
    if (!movedTask || movedTask.boardId === targetBoardId) return;

    // Optimistic UI update
    setRecentlyMovedTaskId(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, boardId: targetBoardId } : t))
    );

    try {
      const payload: TaskMovePayload = {
        id: taskId,
        boardId: targetBoardId,
        indexTask: 10,
      };

      const res = await MoveTask(payload, tokenData);
      if (res?.statusCode !== RES_CODE_OK) {
        // Rollback on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId: movedTask.boardId } : t
          )
        );
        showToast({
          description: res?.message || "Failed to move task",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Task move failed:", err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, boardId: movedTask.boardId } : t
        )
      );
    } finally {
      setTimeout(() => setRecentlyMovedTaskId(null), 1200);
    }
  };

  // Open Create/Edit Task Modal matching /workspace/project?projectId=
  const handleOpenCreateTaskModal = (boardId?: string) => {
    const targetBoard = boards.find((b) => b.id === boardId) || boards[0];
    setSelectedTask(null);
    setTaskForm({
      taskName: "",
      taskDesc: "",
      taskPriority: "MEDIUM",
      taskStartDate: "",
      taskEndDate: "",
      boardId: targetBoard?.id || "",
      backlogId: currentBacklogId || backlogs[0]?.id || "",
    });
    onTaskModalOpen();
  };

  const handleOpenEditTaskModal = (task: TaskViewModel) => {
    setSelectedTask(task);
    setTaskForm({
      taskName: task.taskName || "",
      taskDesc: task.taskDesc || "",
      taskPriority: task.taskPriority || "MEDIUM",
      taskStartDate: task.startDate || "",
      taskEndDate: task.endDate || "",
      boardId: task.boardId || boards[0]?.id || "",
      backlogId: task.backlogId || currentBacklogId || backlogs[0]?.id || "",
    });
    onTaskModalOpen();
  };

  // Handle Save Task from modal matching /workspace/project?projectId=
  const handleSaveTask = async () => {
    if (!taskForm.taskName.trim()) {
      showToast({
        description: "Task name is required",
        statusToast: "error",
      });
      return;
    }

    const effectiveBacklogId = taskForm.backlogId || currentBacklogId;
    if (!effectiveBacklogId) {
      showToast({
        description: "Please select a backlog for the task",
        statusToast: "error",
      });
      return;
    }

    const effectiveBoardId = taskForm.boardId || boards[0]?.id;
    if (!effectiveBoardId) {
      showToast({
        description: "Please select a stage for the task",
        statusToast: "error",
      });
      return;
    }

    setIsSavingTask(true);
    try {
      if (selectedTask) {
        // Update task
        const payload: TaskUpdatePayload = {
          id: selectedTask.id,
          boardId: effectiveBoardId,
          taskName: taskForm.taskName.trim(),
          taskDesc: taskForm.taskDesc.trim() || undefined,
          taskPriority: taskForm.taskPriority,
          startDate: taskForm.taskStartDate || undefined,
          endDate: taskForm.taskEndDate || undefined,
          indexTask: selectedTask.indexTask || 0,
          taskPoint: selectedTask.taskPoint || 0,
          percentageStatus: selectedTask.percentageStatus || 0,
        };

        const res = await UpdateTask(payload, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          showToast({
            description: "Task updated successfully",
            statusToast: "success",
          });
          onTaskModalClose();
          if (activeTask && activeTask.id === selectedTask.id) {
            const targetBoard = boards.find((b) => b.id === effectiveBoardId);
            setActiveTask({
              ...activeTask,
              taskName: payload.taskName,
              taskDesc: payload.taskDesc,
              taskPriority: payload.taskPriority,
              startDate: payload.startDate,
              endDate: payload.endDate,
              boardId: effectiveBoardId,
              boardName: targetBoard?.boardName || activeTask.boardName,
              boardCodeStage: targetBoard?.boardCodeStage || activeTask.boardCodeStage,
            });
          }
          await loadKanbanData();
        } else {
          showToast({
            description: res?.message || "Failed to update task",
            statusToast: "error",
          });
        }
      } else {
        // Create new task
        const taskCode = `TASK-${Date.now()}`;
        const payload: TaskCreatePayload = {
          taskName: taskForm.taskName.trim(),
          taskCode: taskCode,
          boardId: effectiveBoardId,
          projectId: selectedProject?.id || undefined,
          backlogId: effectiveBacklogId,
          taskDesc: taskForm.taskDesc.trim() || undefined,
          taskPriority: taskForm.taskPriority,
          startDate: taskForm.taskStartDate || undefined,
          endDate: taskForm.taskEndDate || undefined,
        };

        const res = await CreateTask(payload, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          showToast({
            description: "Task created successfully",
            statusToast: "success",
          });
          onTaskModalClose();
          await loadKanbanData();
        } else {
          showToast({
            description: res?.message || "Failed to create task",
            statusToast: "error",
          });
        }
      }
    } catch (err) {
      console.error("Error saving task:", err);
      showToast({
        description: "An error occurred while saving the task",
        statusToast: "error",
      });
    } finally {
      setIsSavingTask(false);
    }
  };

  // Inline Add Task handler
  const handleAddTask = async (
    boardId: string,
    taskName: string
  ): Promise<boolean> => {
    const effectiveBacklogId = currentBacklogId || backlogs[0]?.id;
    if (!selectedProject?.id || !effectiveBacklogId || !tokenData) return false;

    try {
      const payload: CreateSimpleTaskPayload = {
        backlogId: effectiveBacklogId,
        projectId: selectedProject.id,
        boardId,
        taskName,
      };

      const res = await CreateSimpleTask(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task created successfully",
          statusToast: "success",
        });
        loadKanbanData();
        return true;
      } else {
        showToast({
          description: res?.message || "Failed to create task",
          statusToast: "error",
        });
        return false;
      }
    } catch (err) {
      console.error("Add task error:", err);
      showToast({
        description: "An error occurred while creating the task",
        statusToast: "error",
      });
      return false;
    }
  };

  // Bulk JSON Import — creates tasks (+ checklist items + team assignment) from raw JSON,
  // reusing the exact same CreateTask / CreateTaskItem / AssignUsersTask calls as the
  // regular task form so bulk-imported cards behave identically to manually created ones.
  type BulkImportSubtaskItem =
    | string
    | {
        taskItemName?: string;
        name?: string;
        title?: string;
        text?: string;
        isChecked?: boolean | string;
        isDone?: string | boolean;
        checked?: boolean;
        done?: boolean;
        completed?: boolean;
      };

  interface BulkImportTaskEntry {
    boardName: string;
    taskName: string;
    backlogId?: string;
    backlogName?: string;
    taskDesc?: string;
    taskPriority?: string;
    startDate?: string;
    endDate?: string;
    taskItems?: BulkImportSubtaskItem[];
    subtasks?: BulkImportSubtaskItem[];
    checklist?: BulkImportSubtaskItem[];
    assignedTask?: string[];
    team?: string[];
    assignees?: string[];
  }

  const handleImportJsonTasks = async () => {
    setJsonImportError("");
    setJsonImportResult(null);

    const effectiveBacklogId = currentBacklogId || backlogs[0]?.id;
    if (!selectedProject?.id || !effectiveBacklogId || !tokenData) {
      setJsonImportError("No project or backlog available.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonImportText);
    } catch {
      setJsonImportError("Invalid JSON. Check for missing commas, quotes, or brackets.");
      return;
    }

    let entries: BulkImportTaskEntry[] = [];

    if (Array.isArray(parsed)) {
      // Filter out any metadata/header object in array (e.g. [{ projectId: ... }, { boardName: ..., taskName: ... }])
      entries = parsed.filter(
        (item): item is BulkImportTaskEntry =>
          !!item &&
          typeof item === "object" &&
          (typeof (item as any).taskName === "string" || typeof (item as any).boardName === "string")
      );
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, any>;
      // Support any envelope wrapper: tasks, items, or data
      const candidateList =
        obj.tasks ||
        obj.items ||
        (Array.isArray(obj.data) ? obj.data : null);

      if (Array.isArray(candidateList)) {
        entries = candidateList.filter(
          (item): item is BulkImportTaskEntry =>
            !!item &&
            typeof item === "object" &&
            (typeof (item as any).taskName === "string" || typeof (item as any).boardName === "string")
        );
      }
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      setJsonImportError(
        'JSON must contain a "tasks" array, or an array of task objects with "boardName" and "taskName".'
      );
      return;
    }

    setIsImportingJson(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const entry of entries) {
        if (!entry?.taskName || !entry?.boardName) {
          failedCount++;
          continue;
        }

        const targetBoard = boards.find(
          (b) => b.boardName.toLowerCase() === entry.boardName.toLowerCase()
        );
        if (!targetBoard) {
          failedCount++;
          continue;
        }

        // Determine destination backlog: use entry.backlogId directly if provided, or resolve from backlogName, or fallback to effectiveBacklogId
        let taskBacklogId = entry.backlogId?.trim() || effectiveBacklogId;
        if (!entry.backlogId && entry.backlogName) {
          const matched = backlogs.find(
            (b) => b.backlogName.toLowerCase() === entry.backlogName?.toLowerCase()
          );
          if (matched) {
            taskBacklogId = matched.id;
          }
        }

        const normalizeDateTime = (val?: string) => {
          if (!val?.trim()) return undefined;
          const trimmed = val.trim();
          return trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`;
        };

        const taskCode = `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payload: TaskCreatePayload = {
          taskName: entry.taskName.trim(),
          taskCode,
          boardId: targetBoard.id,
          projectId: selectedProject.id,
          backlogId: taskBacklogId,
          taskDesc: entry.taskDesc?.trim() || undefined,
          taskPriority: entry.taskPriority || "MEDIUM",
          startDate: normalizeDateTime(entry.startDate),
          endDate: normalizeDateTime(entry.endDate),
        };

        const res = await CreateTask(payload, tokenData);
        if (res?.statusCode !== RES_CODE_OK || !res?.data) {
          failedCount++;
          continue;
        }

        const newTaskId = res.data as string;

        // Checklist items / subtasks ("task inside it") — supports strings, objects with isChecked/isDone, and markdown checkboxes
        const rawSubtasks =
          entry.taskItems ||
          entry.subtasks ||
          entry.checklist;

        if (Array.isArray(rawSubtasks)) {
          for (const rawItem of rawSubtasks) {
            let itemName = "";
            let isItemChecked = false;

            if (typeof rawItem === "string") {
              const trimmed = rawItem.trim();
              const mdCheckedMatch = trimmed.match(/^(?:-\s*)?\[([xX ])\]\s*(.*)$/);
              if (mdCheckedMatch) {
                isItemChecked = mdCheckedMatch[1].toLowerCase() === "x";
                itemName = mdCheckedMatch[2].trim();
              } else {
                itemName = trimmed;
                isItemChecked = false;
              }
            } else if (rawItem && typeof rawItem === "object") {
              itemName = (
                rawItem.taskItemName ||
                rawItem.name ||
                rawItem.title ||
                rawItem.text ||
                ""
              ).trim();

              isItemChecked =
                rawItem.isChecked === true ||
                rawItem.isChecked === "true" ||
                rawItem.isChecked === "Y" ||
                rawItem.isDone === "Y" ||
                rawItem.isDone === true ||
                rawItem.checked === true ||
                rawItem.done === true ||
                rawItem.completed === true;
            }

            if (!itemName) continue;

            const itemRes = await CreateTaskItem(
              { taskId: newTaskId, taskItemName: itemName },
              tokenData
            );

            // If subtask was marked as completed (isChecked: true / isDone: "Y"), update completion status
            if (isItemChecked) {
              const createdItemId = itemRes?.data;
              if (createdItemId && typeof createdItemId === "string") {
                await UpdateTaskItem(
                  { id: createdItemId, taskItemName: itemName, isDone: "Y" },
                  tokenData
                );
              }
            }
          }
        }

        // Team assignment — match names/emails against the project's assigned members
        if (Array.isArray(entry.team) && entry.team.length > 0 && projectData?.userAssignment) {
          const matchedUserIds = entry.team
            .map((member) => {
              const match = projectData.userAssignment!.find(
                (a) =>
                  a.userData.nama?.toLowerCase() === member.toLowerCase() ||
                  a.userData.email?.toLowerCase() === member.toLowerCase()
              );
              return match?.userData.id;
            })
            .filter((id): id is string => !!id);

          if (matchedUserIds.length > 0) {
            await AssignUsersTask(
              {
                taskId: newTaskId,
                usersData: matchedUserIds.map((userId) => ({ userId })),
              },
              tokenData
            );
          }
        }

        successCount++;
      }

      setJsonImportResult({ success: successCount, failed: failedCount });
      if (successCount > 0) {
        await loadKanbanData();
      }
      if (failedCount === 0) {
        showToast({
          description: `Imported ${successCount} task(s) successfully`,
          statusToast: "success",
        });
        setJsonImportText("");
        onJsonImportClose();
      } else {
        showToast({
          description: `Imported ${successCount} task(s), ${failedCount} failed — check board names`,
          statusToast: "warning",
        });
      }
    } catch (err) {
      console.error("Bulk JSON import error:", err);
      setJsonImportError("An error occurred while importing tasks.");
    } finally {
      setIsImportingJson(false);
    }
  };

  const currentBacklog = useMemo(() => {
    return backlogs.find((b) => b.id === currentBacklogId) || backlogs[0] || null;
  }, [backlogs, currentBacklogId]);

  // Example JSON shown in the modal — mirrors the real TaskCreatePayload used by CreateTask,
  // plus taskItems (checklist) and team (matched by name/email against project members).
  // Includes read-only header containing project and ALL related backlogs metadata.
  const jsonImportExample = useMemo(() => {
    const exampleBoardName = boards[0]?.boardName || "TO DO";
    const exampleMember =
      projectData?.userAssignment?.[0]?.userData?.nama || "MOHAMAD IQBAL MUSYAFFA";

    const allProjectBacklogs =
      backlogs.length > 0
        ? backlogs.map((b) => ({
          backlogId: b.id,
          backlogName: b.backlogName,
        }))
        : [
          {
            backlogId: currentBacklogId || "bkl-default",
            backlogName: currentBacklog?.backlogName || "Sprint Backlog",
          },
        ];

    const examplePayload = {
      header: {
        projectId: selectedProject?.id || "",
        projectName: selectedProject?.projectName || projectData?.projectName || "",
        backlogs: allProjectBacklogs,
      },
      tasks: [
        {
          boardName: exampleBoardName,
          backlogId: allProjectBacklogs[0]?.backlogId || currentBacklogId || "",
          taskName: "Implement login page validation",
          taskDesc: "Add client-side and server-side validation for the login form",
          taskPriority: "HIGH",
          startDate: "2024-01-15T09:00:00",
          endDate: "2024-01-20T18:00:00",
          taskItems: [
            { taskItemName: "Add email format validation", isChecked: true },
            { taskItemName: "Add password strength check", isChecked: false },
            { taskItemName: "Write unit tests", isChecked: false },
          ],
          assignedTask:[exampleMember],
        },
        {
          boardName: boards[1]?.boardName || exampleBoardName,
          backlogId: allProjectBacklogs[1]?.backlogId || allProjectBacklogs[0]?.backlogId || currentBacklogId || "",
          taskName: "Fix responsive layout on mobile",
          taskDesc: "Audit breakpoints and optimize layout on smaller viewport",
          taskPriority: "MEDIUM",
          startDate: "2024-01-21T09:00:00",
          endDate: "2024-01-25T18:00:00",
          taskItems: [
            { taskItemName: "Test on iOS Safari", isChecked: true },
            { taskItemName: "Test on Android Chrome", isChecked: false },
          ],
          assignedTask:[],
        },
      ],
    };

    return JSON.stringify(examplePayload, null, 2);
  }, [boards, projectData, selectedProject, currentBacklog, currentBacklogId, backlogs]);

  // Tasks-only JSON copied when clicking "Use example" (omits the read-only header)
  const jsonImportTasksOnlyExample = useMemo(() => {
    const exampleBoardName = boards[0]?.boardName || "TO DO";
    const exampleMember =
      projectData?.userAssignment?.[0]?.userData?.nama || "MOHAMAD IQBAL MUSYAFFA";
    const targetBacklogId = currentBacklog?.id || currentBacklogId || backlogs[0]?.id || "";

    const exampleTasks = [
      {
        boardName: exampleBoardName,
        backlogId: targetBacklogId,
        taskName: "Implement login page validation",
        taskDesc: "Add client-side and server-side validation for the login form",
        taskPriority: "HIGH",
        startDate: "2024-01-15T09:00:00",
        endDate: "2024-01-20T18:00:00",
        taskItems: [
          { taskItemName: "Add email format validation", isChecked: true },
          { taskItemName: "Add password strength check", isChecked: false },
          { taskItemName: "Write unit tests", isChecked: false },
        ],
        assignedTask: [exampleMember],
      },
      {
        boardName: boards[1]?.boardName || exampleBoardName,
        backlogId: backlogs[1]?.id || targetBacklogId,
        taskName: "Fix responsive layout on mobile",
        taskDesc: "Audit breakpoints and optimize layout on smaller viewport",
        taskPriority: "MEDIUM",
        startDate: "2024-01-21T09:00:00",
        endDate: "2024-01-25T18:00:00",
        taskItems: [
          { taskItemName: "Test on iOS Safari", isChecked: true },
          { taskItemName: "Test on Android Chrome", isChecked: false },
        ],
        assignedTask:[],
      },
    ];

    return JSON.stringify(exampleTasks, null, 2);
  }, [boards, projectData, currentBacklog, currentBacklogId, backlogs]);

  // Minimal JSON syntax highlighter for the IDE-style code blocks — tokenizes a JSON
  // string into colored spans (keys, strings, numbers, booleans/null, punctuation),
  // matching a typical editor color scheme (dark: GitHub Dark, light: GitHub Light).
  const renderHighlightedJson = (line: string, keyIdx: React.Key) => {
    const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(e[+-]?\d+)?|[{}\[\],])/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      const token = match[0];
      let color = isDark ? "#c9d1d9" : "#24292f";
      if (/^"/.test(token)) {
        color = /:\s*$/.test(token)
          ? isDark ? "#79c0ff" : "#0550ae" // keys — blue
          : isDark ? "#a5d6ff" : "#0a3069"; // string values — lighter blue
      } else if (/^(true|false|null)$/.test(token)) {
        color = isDark ? "#ff7b72" : "#cf222e"; // booleans/null — red
      } else if (/^-?\d/.test(token)) {
        color = isDark ? "#79c0ff" : "#0550ae"; // numbers — blue
      } else if (/^[{}\[\],]$/.test(token)) {
        color = isDark ? "#e3b341" : "#953800"; // punctuation — amber
      }
      parts.push(
        <Text as="span" key={`${keyIdx}-${partIdx++}`} color={color}>
          {token}
        </Text>
      );
      lastIndex = tokenRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
    return parts.length > 0 ? parts : line;
  };


  // Open task detail with full details matching /workspace/project?projectId=
  const handleTaskClick = async (task: TaskViewModel) => {
    setActiveTask(task);
    setEditedTaskName(task.taskName);
    setEditedTaskDesc(task.taskDesc || "");
    setTempStartDate(task.startDate ?? null);
    setTempEndDate(task.endDate ?? null);
    setIsEditingTaskName(false);
    setIsEditingTaskDesc(false);
    setEditingCommentId(null);
    setEditedCommentText("");
    onDetailOpen();
    setIsLoadingTaskDetails(true);

    try {
      const [detailRes, itemsRes, commentsRes] = await Promise.all([
        GetTaskDetail(task.id, tokenData),
        ListTaskItems(task.id, tokenData),
        ListTaskComments(task.id, tokenData),
      ]);

      if (detailRes?.statusCode === RES_CODE_OK && detailRes.data) {
        setActiveTask(detailRes.data);
        setEditedTaskName(detailRes.data.taskName);
        setEditedTaskDesc(detailRes.data.taskDesc || "");
        setTempStartDate(detailRes.data.startDate ?? null);
        setTempEndDate(detailRes.data.endDate ?? null);
      }

      if (itemsRes?.statusCode === RES_CODE_OK && Array.isArray(itemsRes.data)) {
        setTaskItems(itemsRes.data);
      } else {
        setTaskItems([]);
      }

      if (
        commentsRes?.statusCode === RES_CODE_OK &&
        Array.isArray(commentsRes.data)
      ) {
        setTaskComments(commentsRes.data);
      } else {
        setTaskComments([]);
      }
    } catch (err) {
      console.error("Failed to load task details:", err);
    } finally {
      setIsLoadingTaskDetails(false);
    }
  };

  // Move task to board from detail modal
  const handleMoveTaskToBoard = async (targetBoard: TaskBoardViewModel) => {
    if (!activeTask || activeTask.boardId === targetBoard.id) return;
    await handleMoveTask(activeTask.id, targetBoard.id);
    setActiveTask((prev) =>
      prev
        ? {
          ...prev,
          boardId: targetBoard.id,
          boardName: targetBoard.boardName,
          boardCodeStage: targetBoard.boardCodeStage,
        }
        : null
    );
  };

  // Update task priority from detail modal
  const handleUpdateTaskPriority = async (priority: string) => {
    if (!activeTask || activeTask.taskPriority === priority) return;
    try {
      const payload: TaskUpdatePayload = {
        id: activeTask.id,
        boardId: activeTask.boardId,
        taskName: activeTask.taskName,
        taskDesc: activeTask.taskDesc || undefined,
        taskPriority: priority,
        startDate: activeTask.startDate || undefined,
        endDate: activeTask.endDate || undefined,
        indexTask: activeTask.indexTask || 0,
        taskPoint: activeTask.taskPoint || 0,
        percentageStatus: activeTask.percentageStatus || 0,
      };
      const res = await UpdateTask(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        setActiveTask((prev) => (prev ? { ...prev, taskPriority: priority } : null));
        setTasks((prev) =>
          prev.map((t) => (t.id === activeTask.id ? { ...t, taskPriority: priority } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update task priority:", err);
    }
  };

  // Save task name inline
  const handleSaveTaskName = async () => {
    if (!activeTask || !editedTaskName.trim() || editedTaskName.trim() === activeTask.taskName) {
      setIsEditingTaskName(false);
      return;
    }
    setIsSavingTaskInline(true);
    try {
      const payload: TaskUpdatePayload = {
        id: activeTask.id,
        boardId: activeTask.boardId,
        taskName: editedTaskName.trim(),
        taskDesc: activeTask.taskDesc || undefined,
        taskPriority: activeTask.taskPriority,
        startDate: activeTask.startDate || undefined,
        endDate: activeTask.endDate || undefined,
        indexTask: activeTask.indexTask || 0,
        taskPoint: activeTask.taskPoint || 0,
        percentageStatus: activeTask.percentageStatus || 0,
      };
      const res = await UpdateTask(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        setActiveTask((prev) => (prev ? { ...prev, taskName: editedTaskName.trim() } : null));
        setTasks((prev) =>
          prev.map((t) => (t.id === activeTask.id ? { ...t, taskName: editedTaskName.trim() } : t))
        );
        setIsEditingTaskName(false);
      }
    } catch (err) {
      console.error("Failed to update task name:", err);
    } finally {
      setIsSavingTaskInline(false);
    }
  };

  // Save task description inline
  const handleSaveTaskDesc = async () => {
    if (!activeTask) return;
    setIsSavingTaskInline(true);
    try {
      const payload: TaskUpdatePayload = {
        id: activeTask.id,
        boardId: activeTask.boardId,
        taskName: activeTask.taskName,
        taskDesc: editedTaskDesc.trim() || undefined,
        taskPriority: activeTask.taskPriority,
        startDate: activeTask.startDate || undefined,
        endDate: activeTask.endDate || undefined,
        indexTask: activeTask.indexTask || 0,
        taskPoint: activeTask.taskPoint || 0,
        percentageStatus: activeTask.percentageStatus || 0,
      };
      const res = await UpdateTask(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        setActiveTask((prev) => (prev ? { ...prev, taskDesc: editedTaskDesc.trim() } : null));
        setTasks((prev) =>
          prev.map((t) => (t.id === activeTask.id ? { ...t, taskDesc: editedTaskDesc.trim() } : t))
        );
        setIsEditingTaskDesc(false);
      }
    } catch (err) {
      console.error("Failed to update task description:", err);
    } finally {
      setIsSavingTaskInline(false);
    }
  };

  // Handle updating task dates matching /workspace/project?projectId=
  const updateTaskDates = async (
    startDate: string | null,
    endDate: string | null
  ) => {
    if (!activeTask) return;
    setIsSavingTaskDates(true);
    try {
      const updatePayload: TaskUpdatePayload = {
        id: activeTask.id,
        boardId: activeTask.boardId,
        taskName: activeTask.taskName,
        taskDesc: activeTask.taskDesc || "",
        taskPriority: activeTask.taskPriority,
        indexTask: activeTask.indexTask,
        taskPoint: activeTask.taskPoint,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await UpdateTask(updatePayload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task schedule updated successfully",
          statusToast: "success",
        });
        setActiveTask({
          ...activeTask,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTask.id
              ? {
                  ...t,
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                }
              : t
          )
        );
      } else {
        showToast({
          description: res?.message || "Failed to update task dates",
          statusToast: "error",
        });
      }
    } catch (e) {
      console.error("Failed to update task schedule:", e);
      showToast({
        description: "An error occurred while updating task schedule",
        statusToast: "error",
      });
    } finally {
      setIsSavingTaskDates(false);
    }
  };

  // Member assignment handlers matching /workspace/project?projectId=
  const handleSearchUserAssign = (textSearch: string) => {
    setSearchUserAssign(textSearch);
    const projectMembers: UsersResponse[] =
      (projectData?.userAssignment || [])
        .map((assignment: any) => assignment.userData)
        .filter(Boolean);

    if (textSearch.trim() !== "") {
      const lower = textSearch.toLowerCase();
      const filtered = projectMembers.filter(
        (user) =>
          user.nama?.toLowerCase().includes(lower) ||
          user.nip?.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower)
      );
      setDataUsers(filtered);
    } else {
      setDataUsers(projectMembers);
    }
  };

  const handleAddUserAssign = (data: UsersResponse) => {
    const isAlreadyAssigned = choosedMemberProjects.some(
      (user) => user.id === data.id || user.userId === data.userId
    );
    if (!isAlreadyAssigned) {
      setChoosedMemberProjects((prev) => [...prev, data]);
    }
  };

  const handleRemoveUserAssign = (idOrUserId: string) => {
    setChoosedMemberProjects((prev) =>
      prev.filter(
        (user) => user.id !== idOrUserId && user.userId !== idOrUserId
      )
    );
  };

  const handleAssignMe = () => {
    if (!currentAuthUser) return;
    const isAlreadyAssigned = choosedMemberProjects.some(
      (user) =>
        user.id === currentAuthUser.id || user.userId === currentAuthUser.userId
    );
    if (isAlreadyAssigned) return;

    const meAsUser: UsersResponse = {
      id: currentAuthUser.id || currentAuthUser.userId,
      nrp: currentAuthUser.nrp || "",
      nama: currentAuthUser.nama || "Current User",
      nip: currentAuthUser.nip || "",
      userId: currentAuthUser.userId || currentAuthUser.id,
      kodeCabang: currentAuthUser.kodeCabang,
      namaCabang: currentAuthUser.namaCabang,
      kodeInduk: currentAuthUser.kodeInduk,
      namaInduk: currentAuthUser.namaInduk,
      kodeKanwil: currentAuthUser.kodeKanwil,
      namaKanwil: currentAuthUser.namaKanwil,
      jabatan: currentAuthUser.jabatan || "",
      email: currentAuthUser.email || "",
      idFungsi: currentAuthUser.idFungsi,
      namaFungsi: currentAuthUser.namaFungsi,
      kodePenempatan: currentAuthUser.kodePenempatan,
      namaPenempatan: currentAuthUser.namaPenempatan,
      idUim: currentAuthUser.idUim,
      costCentre: currentAuthUser.costCentre,
      isApproval: currentAuthUser.isApproval,
      kodeUnitKerja: currentAuthUser.kodeUnitKerja,
      namaUnitKerja: currentAuthUser.namaUnitKerja,
      kodeJabatan: currentAuthUser.kodeJabatan,
      phoneNumber:
        currentAuthUser.phoneNumber || currentAuthUser.userPhoneNumber,
      userStatus: currentAuthUser.userStatus || currentAuthUser.isActive,
      profilePict: currentAuthUser.profilePict,
      kodeGroupKerja: null,
      namaGroupKerja: null,
      lastSync: null,
      createdAt: new Date().toISOString(),
      createdBy: currentAuthUser.userId || "",
      updatedAt: null,
      updatedBy: null,
      team: null,
      teamRole: null,
    };

    setChoosedMemberProjects((prev) => [...prev, meAsUser]);
  };

  const handleSaveAssignedUsers = async () => {
    if (!activeTask) return;
    setIsSavingAssignments(true);
    try {
      const assignPayload: AssignUsersTaskPayload = {
        taskId: activeTask.id,
        usersData: choosedMemberProjects.map((user) => ({
          userId: user.userId,
        })),
      };

      const response = await AssignUsersTask(assignPayload, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Users assigned successfully",
          statusToast: "success",
        });

        const updatedAssignUsers = choosedMemberProjects.map((user) => ({
          id: user.id,
          nama: user.nama,
          nip: user.nip,
          userId: user.userId,
          jabatan: user.jabatan || undefined,
          email: user.email,
          profilePict: user.profilePict,
        }));

        setActiveTask({
          ...activeTask,
          assignUsers: updatedAssignUsers,
        });

        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTask.id
              ? { ...t, assignUsers: updatedAssignUsers }
              : t
          )
        );

        onAssignModalClose();
      } else {
        showToast({
          description: response?.message || "Failed to assign users",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Error assigning users:", err);
      showToast({
        description: "An error occurred while assigning users",
        statusToast: "error",
      });
    } finally {
      setIsSavingAssignments(false);
    }
  };

  // Archive task
  const handleArchiveTask = async (taskId: string) => {
    setIsArchivingTask(true);
    try {
      const res = await ArchiveTask({ taskId }, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task archived successfully",
          statusToast: "success",
        });
        onDetailClose();
        await loadKanbanData();
      } else {
        showToast({
          description: res?.message || "Failed to archive task",
          statusToast: "error",
        });
      }
    } catch (err) {
      console.error("Failed to archive task:", err);
    } finally {
      setIsArchivingTask(false);
    }
  };

  // Checklist Item Toggle
  const handleToggleChecklistItem = async (
    itemId: string,
    currentStatus: string,
    itemName: string
  ) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    setTaskItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isDone: newStatus } : it))
    );

    try {
      await UpdateTaskItem(
        { id: itemId, taskItemName: itemName, isDone: newStatus },
        tokenData
      );
      if (activeTask) {
        const detailRes = await GetTaskDetail(activeTask.id, tokenData);
        if (detailRes?.statusCode === RES_CODE_OK && detailRes.data) {
          setActiveTask(detailRes.data);
          setTasks((prev) =>
            prev.map((t) => (t.id === activeTask.id ? detailRes.data! : t))
          );
        }
      }
    } catch (err) {
      console.error("Error updating checklist item:", err);
    }
  };

  // Add Checklist Item
  const handleAddChecklistItem = async () => {
    if (!newChecklistText.trim() || !activeTask) return;
    setIsAddingItem(true);
    try {
      const res = await CreateTaskItem(
        { taskId: activeTask.id, taskItemName: newChecklistText.trim() },
        tokenData
      );
      if (res?.statusCode === RES_CODE_OK) {
        setNewChecklistText("");
        const [refreshedItems, refreshedDetail] = await Promise.all([
          ListTaskItems(activeTask.id, tokenData),
          GetTaskDetail(activeTask.id, tokenData),
        ]);
        if (refreshedItems?.statusCode === RES_CODE_OK && Array.isArray(refreshedItems.data)) {
          setTaskItems(refreshedItems.data);
        }
        if (refreshedDetail?.statusCode === RES_CODE_OK && refreshedDetail.data) {
          setActiveTask(refreshedDetail.data);
          setTasks((prev) =>
            prev.map((t) => (t.id === activeTask.id ? refreshedDetail.data! : t))
          );
        }
      }
    } finally {
      setIsAddingItem(false);
    }
  };

  // Delete Checklist Item
  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!activeTask) return;
    setTaskItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      await DeleteTaskItem(itemId, tokenData);
      const refreshedDetail = await GetTaskDetail(activeTask.id, tokenData);
      if (refreshedDetail?.statusCode === RES_CODE_OK && refreshedDetail.data) {
        setActiveTask(refreshedDetail.data);
        setTasks((prev) =>
          prev.map((t) => (t.id === activeTask.id ? refreshedDetail.data! : t))
        );
      }
    } catch (err) {
      console.error("Failed to delete checklist item:", err);
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!newCommentText.trim() || !activeTask) return;
    setIsAddingComment(true);
    try {
      const res = await CreateTaskComment(
        { taskId: activeTask.id, comCaptions: newCommentText.trim() },
        tokenData
      );
      if (res?.statusCode === RES_CODE_OK) {
        setNewCommentText("");
        const refreshed = await ListTaskComments(activeTask.id, tokenData);
        if (
          refreshed?.statusCode === RES_CODE_OK &&
          Array.isArray(refreshed.data)
        ) {
          setTaskComments(refreshed.data);
        }
      }
    } finally {
      setIsAddingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!activeTask) return;
    try {
      const res = await DeleteTaskComment(commentId, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Update Comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editedCommentText.trim() || !activeTask) return;
    try {
      const res = await UpdateTaskComment(
        { id: commentId, comCaptions: editedCommentText.trim() },
        tokenData
      );
      if (res?.statusCode === RES_CODE_OK) {
        setTaskComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, comCaptions: editedCommentText.trim() } : c
          )
        );
        setEditingCommentId(null);
        setEditedCommentText("");
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  // Filter tasks matching /workspace/project?projectId=
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Backlog filter — pure client-side, matching /workspace/project?projectId=.
    // Selecting a backlog only narrows which already-loaded tasks are shown;
    // it never changes the board columns themselves.
    if (currentBacklogId) {
      result = result.filter((t) => t.backlogId === currentBacklogId);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.taskName?.toLowerCase().includes(lower) ||
          t.taskCode?.toLowerCase().includes(lower) ||
          t.taskDesc?.toLowerCase().includes(lower)
      );
    }

    if (filterPriority) {
      result = result.filter(
        (t) => t.taskPriority?.toUpperCase() === filterPriority.toUpperCase()
      );
    }

    if (filterAssignee) {
      const selectedIds = filterAssignee.split(",").filter(Boolean);
      result = result.filter((t) =>
        t.assignUsers?.some((u) => selectedIds.includes(u.id) || selectedIds.includes(u.userId))
      );
    }

    if (showMyTasksOnly) {
      let currentUserId = "";
      try {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
          const auth = JSON.parse(storedAuth);
          currentUserId = auth?.dataLogin?.id || auth?.dataLogin?.userId || "";
        }
      } catch { }
      if (currentUserId) {
        result = result.filter((t) =>
          t.assignUsers?.some((u) => u.id === currentUserId || u.userId === currentUserId)
        );
      }
    }

    if (!showCompletedTasks) {
      result = result.filter((t) => (t.percentageStatus || 0) < 100);
    }

    return result;
  }, [tasks, currentBacklogId, searchTerm, filterPriority, filterAssignee, showMyTasksOnly, showCompletedTasks]);

  // Project statistics matching /workspace/project?projectId=
  const projectStats = useMemo(() => {
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t) => {
      const stage = (t.boardCodeStage || t.boardName || "").toUpperCase();
      return stage.includes("TODO") || stage === "TO DO";
    }).length;
    const inProgressTasks = tasks.filter((t) => {
      const stage = (t.boardCodeStage || t.boardName || "").toUpperCase();
      return stage.includes("PROGRESS") || stage === "IN PROGRESS";
    }).length;
    const inReviewTasks = tasks.filter((t) => {
      const stage = (t.boardCodeStage || t.boardName || "").toUpperCase();
      return stage.includes("REVIEW") || stage === "IN REVIEW";
    }).length;
    const completedTasks = tasks.filter((t) => {
      const stage = (t.boardCodeStage || t.boardName || "").toUpperCase();
      return stage.includes("DONE") || t.percentageStatus === 100;
    }).length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      completionPercentage,
    };
  }, [tasks]);

  if (!selectedProject?.id) {
    return (
      <Box
        minH="100vh"
        position="relative"
        bg={isDark ? "#0b0813" : "#f8fafc"}
        overflow="hidden"
      >
        {/* Modern SaaS Grid Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          zIndex={0}
          opacity={isDark ? 0.35 : 0.6}
          backgroundImage={
            isDark
              ? `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
                 radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`
              : `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
                 radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px)`
          }
          backgroundSize="auto, 28px 28px"
        />

        {/* Ambient Top Glow */}
        <Box
          position="absolute"
          top="-150px"
          left="50%"
          transform="translateX(-50%)"
          w="600px"
          h="300px"
          bg="radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.1), transparent 70%)"
          filter="blur(50px)"
          pointerEvents="none"
          zIndex={0}
        />

        <DevFloatingTopbar isSelectionMode />

        {/* Centered SaaS Modal Card matching Topbar width */}
        <Flex
          minH="100vh"
          align="center"
          justify="center"
          px={{ base: 3, md: 6 }}
          position="relative"
          zIndex={1}
          pt={{ base: "90px", md: "104px" }}
          pb={8}
        >
          <Box
            w={{ base: "calc(100% - 24px)", md: "calc(100% - 48px)" }}
            maxW="1400px"
            bg={
              isDark
                ? "rgba(11, 7, 22, 0.55)"
                : "rgba(255, 255, 255, 0.65)"
            }
            backdropFilter="blur(28px) saturate(180%)"
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={
              isDark
                ? "rgba(139, 92, 246, 0.25)"
                : "rgba(255, 255, 255, 0.8)"
            }
            boxShadow={
              isDark
                ? "0 25px 60px rgba(0, 0, 0, 0.55), 0 0 50px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                : "0 20px 45px rgba(139, 92, 246, 0.08), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            }
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            {/* Modal Header */}
            <Box
              p={{ base: 5, md: 6 }}
              pb={4}
              borderBottom="1px solid"
              borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.100"}
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={4}
              >
                <HStack spacing={3.5}>
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius={radiusStyle}
                    bg="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                    align="center"
                    justify="center"
                    color="white"
                    boxShadow="0 4px 16px rgba(139, 92, 246, 0.35)"
                  >
                    <FiTrello size={22} />
                  </Flex>
                  <Box>
                    <Text
                      fontSize={{ base: "lg", md: "xl" }}
                      fontWeight={700}
                      color={isDark ? "white" : "gray.900"}
                    >
                      Select Your Project
                    </Text>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                      Choose an assigned workspace project to open its developer Kanban sprint board
                    </Text>
                  </Box>
                </HStack>

                {/* Search input inside modal */}
                <InputGroup size="md" maxW={{ base: "full", md: "380px" }}>
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <FiSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Search name, code (#FE-2024), team..."
                    value={initSearch}
                    onChange={(e) => setInitSearch(e.target.value)}
                    borderRadius={radiusStyle}
                    bg={isDark ? "rgba(255, 255, 255, 0.04)" : "white"}
                    borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "gray.200"}
                    focusBorderColor="purple.400"
                    fontSize="xs"
                    _focus={{
                      boxShadow: "0 0 0 1px #8b5cf6, 0 0 16px rgba(139, 92, 246, 0.2)",
                    }}
                  />
                </InputGroup>
              </Flex>
            </Box>

            {/* Modal Body: Responsive Project Cards Grid */}
            <Box p={{ base: 4, md: 6 }} maxH="520px" overflowY="auto">
              {isLoadingInitProjects ? (
                <Flex direction="column" align="center" justify="center" py={16} gap={3}>
                  <Spinner size="lg" color="purple.400" thickness="2.5px" />
                  <Text fontSize="xs" color="gray.400">
                    Fetching your assigned projects...
                  </Text>
                </Flex>
              ) : filteredInitProjects.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={16} gap={3}>
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius={radiusStyle}
                    bg="rgba(139, 92, 246, 0.12)"
                    align="center"
                    justify="center"
                    color="purple.300"
                  >
                    <FiLayers size={22} />
                  </Flex>
                  <Text fontSize="md" fontWeight={700} color={isDark ? "gray.200" : "gray.700"}>
                    {initSearch ? "No matching projects found" : "No assigned projects yet"}
                  </Text>
                  <Text fontSize="xs" color="gray.400" maxW="360px" textAlign="center">
                    {initSearch
                      ? "Try searching with different keywords."
                      : "You do not have any assigned projects in this workspace yet."}
                  </Text>
                </Flex>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                  {filteredInitProjects.map((p) => {
                    const statusColor =
                      p.projectStatus === "RUNNING"
                        ? "green"
                        : p.projectStatus === "INITIATING"
                          ? "blue"
                          : "gray";

                    return (
                      <Box
                        key={p.id}
                        as="button"
                        type="button"
                        textAlign="left"
                        p={5}
                        borderRadius={radiusStyle}
                        bg={isDark ? "rgba(255, 255, 255, 0.03)" : "white"}
                        backdropFilter="blur(16px)"
                        border="1px solid"
                        borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                          borderColor: "purple.500",
                          transform: "translateY(-3px)",
                          boxShadow: isDark
                            ? "0 10px 25px -5px rgba(139, 92, 246, 0.25), 0 0 15px rgba(139, 92, 246, 0.15)"
                            : "0 10px 25px -5px rgba(139, 92, 246, 0.15)",
                          bg: isDark ? "rgba(255, 255, 255, 0.06)" : "purple.50",
                        }}
                        _active={{ transform: "translateY(0)" }}
                        onClick={() => handleSelectInitProject(p)}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        minH="150px"
                      >
                        <VStack align="start" spacing={3} w="full">
                          <HStack justify="space-between" w="full">
                            <HStack spacing={2.5}>
                              <Box
                                w="10px"
                                h="10px"
                                borderRadius="full"
                                bg={
                                  p.projectStatus === "RUNNING"
                                    ? "emerald.400"
                                    : p.projectStatus === "INITIATING"
                                      ? "purple.400"
                                      : "pink.400"
                                }
                                boxShadow="0 0 8px currentColor"
                              />
                              <Text
                                fontSize="xs"
                                fontWeight={600}
                                color={isDark ? "gray.400" : "gray.500"}
                                letterSpacing="0.04em"
                              >
                                #{p.projectNo || "PROJ"}
                              </Text>
                            </HStack>

                            <Badge
                              variant="subtle"
                              colorScheme={statusColor}
                              fontSize="3xs"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                              textTransform="uppercase"
                            >
                              {p.projectStatus || "ACTIVE"}
                            </Badge>
                          </HStack>

                          <Box w="full">
                            <Text
                              fontWeight={700}
                              fontSize="md"
                              color={isDark ? "white" : "gray.900"}
                              noOfLines={2}
                              lineHeight="short"
                            >
                              {p.projectName}
                            </Text>
                            {p.projectDesc && (
                              <Text
                                fontSize="xs"
                                color={isDark ? "gray.400" : "gray.500"}
                                noOfLines={1}
                                mt={1}
                              >
                                {p.projectDesc}
                              </Text>
                            )}
                          </Box>
                        </VStack>

                        <HStack
                          justify="space-between"
                          w="full"
                          pt={3}
                          borderTop="1px solid"
                          borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "gray.100"}
                          fontSize="xs"
                          color={isDark ? "gray.400" : "gray.500"}
                        >
                          <Text noOfLines={1} maxW="70%">
                            {p.proManageByTeamName || "Dev Team"}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="purple.400"
                            fontWeight={600}
                          >
                            Open Board →
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}
            </Box>

            {/* Modal Footer */}
            <Flex
              p={4}
              px={{ base: 5, md: 6 }}
              borderTop="1px solid"
              borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.100"}
              justify="space-between"
              align="center"
              bg={isDark ? "rgba(0, 0, 0, 0.25)" : "gray.50"}
            >
              <Text fontSize="2xs" color={isDark ? "gray.400" : "gray.500"}>
                {initProjects.length} project{initProjects.length === 1 ? "" : "s"} available
              </Text>
              <Link href="/dev">
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="purple"
                  borderRadius={radiusStyle}
                  fontSize="xs"
                >
                  View All in Projects Hub
                </Button>
              </Link>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box minH="100vh" pb={8} w="full">
        {/* Top loading bar — indeterminate progress while the selected project's board loads */}
        {isLoadingBoards && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            h="3px"
            zIndex={2000}
            overflow="hidden"
            bg={isDark ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.1)"}
          >
            <Box
              position="absolute"
              top={0}
              h="full"
              borderRadius="full"
              bgGradient="linear(to-r, purple.400, pink.400, purple.500)"
              boxShadow="0 0 12px rgba(139, 92, 246, 0.7)"
              animation={`${devLoadingBarSlide} 1.1s ease-in-out infinite`}
            />
          </Box>
        )}

        {/* Topbar */}
        <DevFloatingTopbar
          showBack
          backHref="/dev"
          backLabel="Projects"
          fullWidth
        />

        {/* Main Content Area - Full Width */}
        <Box pt={{ base: "88px", md: "96px" }} px={{ base: 4, md: 6 }} w="full">
          {/* 1. Project Header & Executive Sprint Telemetry */}
          <Box
            w="full"
            borderRadius={radiusStyle}
            overflow="hidden"
            position="relative"
            bg={isDark ? "rgba(15, 23, 42, 0.65)" : "white"}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "purple.100"}
            boxShadow={isDark ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)" : "0 1px 3px rgba(139, 92, 246, 0.1)"}
            mb={4}
          >
            {/* Dev-scheme background pattern: dot-grid + soft purple/pink wash,
                purely decorative (pointer-events none), no glow/blur spread */}
            <Box
              position="absolute"
              inset={0}
              pointerEvents="none"
              zIndex={0}
              backgroundImage={
                isDark
                  ? "radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.16) 0%, transparent 45%), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
                  : "radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.16) 0%, transparent 50%), radial-gradient(rgba(139, 92, 246, 0.35) 1.2px, transparent 1.2px)"
              }
              backgroundSize="auto, 16px 16px"
            />

            <Box p={{ base: 4, md: 5 }} position="relative" zIndex={1}>
              <VStack spacing={4} align="stretch">
                {/* Top Row: Project Info + Actions */}
                <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
                  <HStack spacing={3} align="start" flex={1} minW="280px">
                    <VStack align="start" spacing={1.5}>
                      <HStack spacing={2} align="center">
                        <Heading size="md" color={isDark ? "white" : "gray.900"} fontWeight={700}>
                          {projectData?.projectName || selectedProject?.projectName || "Project Workspace"}
                        </Heading>
                        {selectedProject?.projectStatus && (
                          <Badge
                            colorScheme={
                              selectedProject.projectStatus === "RUNNING"
                                ? "green"
                                : selectedProject.projectStatus === "INITIATING"
                                  ? "purple"
                                  : "pink"
                            }
                            variant="subtle"
                            fontSize="2xs"
                            px={2}
                            py={0.5}
                            rounded="full"
                          >
                            {selectedProject.projectStatus}
                          </Badge>
                        )}
                      </HStack>

                      <HStack
                        spacing={2}
                        fontSize="xs"
                        color={isDark ? "gray.400" : "gray.500"}
                        flexWrap="wrap"
                        rowGap={1.5}
                      >
                        <HStack
                          spacing={1.5}
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          bg={isDark ? "rgba(255, 255, 255, 0.04)" : "purple.50"}
                          whiteSpace="nowrap"
                        >
                          <Text color={isDark ? "gray.500" : "purple.400"} fontSize="3xs" textTransform="uppercase" fontWeight={600}>Memo</Text>
                          <Text color={isDark ? "gray.300" : "gray.700"} fontSize="xs" fontWeight={500}>{projectData?.requirementData?.reqNumber || "-"}</Text>
                        </HStack>

                        <HStack
                          spacing={1.5}
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          bg={isDark ? "rgba(255, 255, 255, 0.04)" : "purple.50"}
                          whiteSpace="nowrap"
                        >
                          <Text color={isDark ? "gray.500" : "purple.400"} fontSize="3xs" textTransform="uppercase" fontWeight={600}>Code</Text>
                          <Text color={isDark ? "gray.300" : "gray.700"} fontSize="xs" fontWeight={500}>{projectData?.projectNo || selectedProject?.projectNo || "-"}</Text>
                        </HStack>

                        <HStack
                          spacing={1.5}
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          bg={isDark ? "rgba(255, 255, 255, 0.04)" : "purple.50"}
                          whiteSpace="nowrap"
                        >
                          <Text color={isDark ? "gray.500" : "purple.400"} fontSize="3xs" textTransform="uppercase" fontWeight={600}>Team</Text>
                          <Text color={isDark ? "gray.300" : "gray.700"} fontSize="xs" fontWeight={500}>{projectData?.proManageByDivisionName || "-"}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Right side: Change Project + Application Badge & Refresh */}
                  <HStack spacing={3} align="center">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FiFolder />}
                      onClick={onChangeProjectOpen}
                      borderRadius={radiusStyle}
                      fontSize="xs"
                      color={isDark ? "purple.300" : "purple.600"}
                      borderColor={isDark ? "purple.400" : "purple.300"}
                      _hover={{ bg: isDark ? "rgba(139, 92, 246, 0.12)" : "purple.50" }}
                    >
                      Change Project
                    </Button>

                    {projectData?.appsProject && (
                      <HStack
                        spacing={3}
                        bg={isDark ? "rgba(139, 92, 246, 0.12)" : "purple.50"}
                        border="1px solid"
                        borderColor={isDark ? "rgba(139, 92, 246, 0.3)" : "purple.200"}
                        px={3.5}
                        py={2}
                        borderRadius={radiusStyle}
                      >
                        <Box
                          bg="purple.500"
                          w="36px"
                          h="36px"
                          borderRadius={radiusStyle}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          fontSize="sm"
                          color="white"
                        >
                          {projectData.appsProject.appCode?.substring(0, 2).toUpperCase() ||
                            projectData.appsProject.appName?.substring(0, 2).toUpperCase() ||
                            "AP"}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="3xs"
                            color={isDark ? "purple.300" : "purple.500"}
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                          >
                            Application
                          </Text>
                          <Text
                            fontSize="xs"
                            color={isDark ? "white" : "gray.900"}
                            fontWeight="bold"
                            noOfLines={1}
                            maxW="160px"
                          >
                            {projectData.appsProject.appName}
                          </Text>
                        </VStack>
                      </HStack>
                    )}

                    <IconButton
                      aria-label="Refresh"
                      icon={<FiRefreshCw />}
                      size="sm"
                      variant="outline"
                      onClick={loadKanbanData}
                      isLoading={isLoadingBoards}
                      borderRadius="lg"
                      color={isDark ? "gray.200" : "gray.700"}
                      borderColor={isDark ? "whiteAlpha.300" : "gray.300"}
                    />
                  </HStack>
                </HStack>

                {/* Executive Sprint Telemetry Bar */}
                <Box
                  pt={3}
                  borderTop="1px solid"
                  borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "gray.100"}
                >
                  {/* Proportional Segmented Progress Track */}
                  <Box
                    w="full"
                    h="5px"
                    borderRadius="full"
                    overflow="hidden"
                    bg={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.100"}
                    display="flex"
                    mb={3}
                  >
                    {projectStats.totalTasks > 0 ? (
                      <>
                        <Box
                          w={`${(projectStats.completedTasks / projectStats.totalTasks) * 100}%`}
                          bg="#10b981"
                          title={`Done: ${projectStats.completedTasks}`}
                          transition="width 0.4s ease"
                        />
                        <Box
                          w={`${(projectStats.inReviewTasks / projectStats.totalTasks) * 100}%`}
                          bg="#8b5cf6"
                          title={`In Review: ${projectStats.inReviewTasks}`}
                          transition="width 0.4s ease"
                        />
                        <Box
                          w={`${(projectStats.inProgressTasks / projectStats.totalTasks) * 100}%`}
                          bg="#f59e0b"
                          title={`In Progress: ${projectStats.inProgressTasks}`}
                          transition="width 0.4s ease"
                        />
                        <Box
                          w={`${(projectStats.todoTasks / projectStats.totalTasks) * 100}%`}
                          bg={isDark ? "#475569" : "#cbd5e1"}
                          title={`To Do: ${projectStats.todoTasks}`}
                          transition="width 0.4s ease"
                        />
                      </>
                    ) : (
                      <Box w="full" bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.200"} />
                    )}
                  </Box>

                  {/* Telemetry Stage Metrics Row */}
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                    <HStack spacing={{ base: 3, md: 5 }} flexWrap="wrap" rowGap={2}>
                      {/* To Do */}
                      <HStack spacing={2} align="center">
                        <Box w="7px" h="7px" borderRadius="full" bg="#94a3b8" />
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                          To Do
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: "tabular-nums" }}
                          color={isDark ? "white" : "gray.900"}
                        >
                          {projectStats.todoTasks}
                        </Text>
                      </HStack>

                      {/* In Progress */}
                      <HStack spacing={2} align="center">
                        <Box w="7px" h="7px" borderRadius="full" bg="#f59e0b" />
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                          In Progress
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: "tabular-nums" }}
                          color={isDark ? "white" : "gray.900"}
                        >
                          {projectStats.inProgressTasks}
                        </Text>
                      </HStack>

                      {/* In Review */}
                      <HStack spacing={2} align="center">
                        <Box w="7px" h="7px" borderRadius="full" bg="#8b5cf6" />
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                          In Review
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: "tabular-nums" }}
                          color={isDark ? "white" : "gray.900"}
                        >
                          {projectStats.inReviewTasks}
                        </Text>
                      </HStack>

                      {/* Done */}
                      <HStack spacing={2} align="center">
                        <Box w="7px" h="7px" borderRadius="full" bg="#10b981" />
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                          Done
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: "tabular-nums" }}
                          color={isDark ? "white" : "gray.900"}
                        >
                          {projectStats.completedTasks}
                        </Text>
                      </HStack>

                      {/* Total indicator */}
                      <HStack
                        spacing={1.5}
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.100"}
                      >
                        <Text fontSize="2xs" color={isDark ? "gray.500" : "gray.500"}>
                          Total:
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: "tabular-nums" }}
                          color={isDark ? "gray.200" : "gray.800"}
                        >
                          {projectStats.totalTasks}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Right Telemetry: Completion & Target Date */}
                    <HStack spacing={3} align="center" flexWrap="wrap">
                      <HStack
                        spacing={2}
                        px={2.5}
                        py={1}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={isDark ? "rgba(16, 185, 129, 0.3)" : "green.200"}
                        bg={isDark ? "rgba(16, 185, 129, 0.1)" : "green.50"}
                      >
                        <Box w="6px" h="6px" borderRadius="full" bg="#10b981" />
                        <Text fontSize="xs" fontWeight={700} color={isDark ? "green.300" : "green.700"}>
                          {projectStats.completionPercentage}% Done
                        </Text>
                      </HStack>

                      {projectData?.requirementData?.appLiveTargetDate && (
                        <HStack spacing={1.5} fontSize="2xs" color={isDark ? "gray.400" : "gray.500"}>
                          <Text color={isDark ? "gray.500" : "gray.400"}>Target Live:</Text>
                          <Text fontWeight={600} color={isDark ? "gray.300" : "gray.700"}>
                            {formatDateDDMMYYYY(projectData.requirementData.appLiveTargetDate)}
                          </Text>
                        </HStack>
                      )}

                      {lastUpdated && (
                        <HStack spacing={1.5} fontSize="2xs" color={isDark ? "gray.500" : "gray.400"}>
                          <Text>Synced:</Text>
                          <Text color={isDark ? "gray.400" : "gray.600"}>
                            {lastUpdated.toLocaleTimeString()}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          </Box>

          {/* 2. Dev Console Filter Bar — command-strip layout instead of the
               regular /workspace white panel, pill toggles for the boolean filters. */}
          <Box
            bg={isDark ? "rgba(10, 8, 20, 0.85)" : "white"}
            p={3}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "purple.100"}
            boxShadow={isDark ? "none" : "0 1px 3px rgba(139, 92, 246, 0.08)"}
            mb={4}
            w="full"
          >
            <HStack spacing={3} justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <HStack spacing={2} flex={1} flexWrap="wrap" align="center">
                <InputGroup size="sm" maxW={{ base: "full", sm: "220px" }}>
                  <InputLeftElement pointerEvents="none" color="purple.400">
                    <FiSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius={radiusStyle}
                    fontSize="xs"
                    bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.50"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                    _placeholder={{ color: isDark ? "gray.500" : "gray.400" }}
                    focusBorderColor="purple.400"
                  />
                </InputGroup>

                {/* Member Filter */}
                {projectData?.userAssignment && projectData.userAssignment.length > 0 && (
                  <Select
                    placeholder="Member"
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    size="sm"
                    maxW="150px"
                    borderRadius={radiusStyle}
                    fontSize="xs"
                    bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.50"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                    focusBorderColor="purple.400"
                  >
                    {projectData.userAssignment.map((a) => (
                      <option key={a.userData.id} value={a.userData.id}>
                        {a.userData.nama}
                      </option>
                    ))}
                  </Select>
                )}

                {/* Priority Filter */}
                <Select
                  placeholder="Priority"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  size="sm"
                  maxW="120px"
                  borderRadius={radiusStyle}
                  fontSize="xs"
                  bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.50"}
                  border="1px solid"
                  borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                  focusBorderColor="purple.400"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>

                {/* Backlog Filter */}
                {backlogs.length > 0 && (
                  <Select
                    placeholder="All Backlogs"
                    value={currentBacklogId || ""}
                    onChange={(e) => handleBacklogChange(e.target.value)}
                    size="sm"
                    maxW="200px"
                    borderRadius={radiusStyle}
                    fontSize="xs"
                    bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.50"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                    focusBorderColor="purple.400"
                  >
                    {backlogs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.backlogCode ? `${b.backlogCode} - ${b.backlogName}` : b.backlogName}
                      </option>
                    ))}
                  </Select>
                )}

                {currentBacklog?.backlogEnddate && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" color={isDark ? "gray.500" : "gray.400"}>
                      Deadline:
                    </Text>
                    <Text fontSize="xs" color="blue.400" fontWeight="medium">
                      {formatDateDDMMYYYY(currentBacklog.backlogEnddate)}
                    </Text>
                  </HStack>
                )}

                {/* Toggle pills instead of plain checkboxes */}
                <HStack
                  as="button"
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  spacing={1.5}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={showCompletedTasks ? "purple.400" : isDark ? "whiteAlpha.200" : "gray.200"}
                  bg={showCompletedTasks ? (isDark ? "rgba(139, 92, 246, 0.15)" : "purple.50") : "transparent"}
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={showCompletedTasks ? "purple.400" : isDark ? "whiteAlpha.400" : "gray.300"}
                  />
                  <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                    Show completed
                  </Text>
                </HStack>

                <HStack
                  as="button"
                  onClick={() => setShowMyTasksOnly(!showMyTasksOnly)}
                  spacing={1.5}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={showMyTasksOnly ? "blue.400" : isDark ? "whiteAlpha.200" : "gray.200"}
                  bg={showMyTasksOnly ? (isDark ? "rgba(59, 130, 246, 0.15)" : "blue.50") : "transparent"}
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={showMyTasksOnly ? "blue.400" : isDark ? "whiteAlpha.400" : "gray.300"}
                  />
                  <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                    My tasks only
                  </Text>
                </HStack>

                <HStack
                  as="button"
                  onClick={() => setIsCompactView(!isCompactView)}
                  spacing={1.5}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={isCompactView ? "teal.400" : isDark ? "whiteAlpha.200" : "gray.200"}
                  bg={isCompactView ? (isDark ? "rgba(45, 212, 191, 0.15)" : "teal.50") : "transparent"}
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={isCompactView ? "teal.400" : isDark ? "whiteAlpha.400" : "gray.300"}
                  />
                  <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                    Compact view
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={2}>
                {selectedProject?.id && (
                  <Link
                    href={`/workspace/project?projectId=${selectedProject.id}`}
                    passHref
                  >
                    <Button
                      as="a"
                      leftIcon={<FiExternalLink />}
                      size="sm"
                      variant="outline"
                      borderRadius={radiusStyle}
                      fontSize="xs"
                      color={isDark ? "blue.300" : "blue.600"}
                      borderColor={isDark ? "blue.400" : "blue.300"}
                      _hover={{
                        bg: isDark ? "rgba(59, 130, 246, 0.12)" : "blue.50",
                      }}
                    >
                      Workspace
                    </Button>
                  </Link>
                )}

                <Button
                  leftIcon={<FiCode />}
                  size="sm"
                  variant="outline"
                  onClick={onJsonImportOpen}
                  isDisabled={boards.length === 0}
                  borderRadius={radiusStyle}
                  fontSize="xs"
                  color={isDark ? "purple.300" : "purple.600"}
                  borderColor={isDark ? "purple.400" : "purple.300"}
                  _hover={{ bg: isDark ? "rgba(139, 92, 246, 0.12)" : "purple.50" }}
                >
                  Input JSON
                </Button>

                <Button
                  leftIcon={<FiPlusCircle />}
                  size="sm"
                  onClick={() => handleOpenCreateTaskModal(boards[0]?.id || "")}
                  isDisabled={boards.length === 0}
                  borderRadius={radiusStyle}
                  fontSize="xs"
                  bg="purple.500"
                  color="white"
                  _hover={{ bg: "purple.600" }}
                  _active={{ bg: "purple.700" }}
                >
                  Add Task
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* 3. Kanban Board Container matching /workspace/project?projectId= */}
          {isLoadingBoards ? (
            <Flex
              justify="center"
              align="center"
              minH="420px"
              w="full"
              py={10}
            >
              <Box
                maxW="420px"
                w="full"
                p={6}
                borderRadius={radiusStyle}
                border="1px solid"
                borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"}
                bg={isDark ? "rgba(15, 23, 42, 0.75)" : "white"}
                backdropFilter="blur(20px)"
                boxShadow={
                  isDark
                    ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    : "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
                }
              >
                <VStack spacing={6} align="stretch">
                  <HStack spacing={3} justify="center">
                    <Spinner size="sm" color="blue.500" thickness="2.5px" />
                    <Heading size="sm" color={isDark ? "gray.200" : "gray.800"}>
                      Preparing Your Workspace
                    </Heading>
                  </HStack>

                  {/* Loading Steps matching /workspace/project */}
                  <VStack spacing={2.5} align="stretch" px={2}>
                    {/* Step 1: Initializing */}
                    <HStack spacing={3}>
                      {loadingStep === "init" || !loadingStep ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : (
                        <Icon as={FiCheckCircle} color="green.400" boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "init" ? 600 : 400}
                        color={loadingStep === "init" ? "blue.400" : isDark ? "gray.400" : "gray.600"}
                      >
                        Initializing workspace
                      </Text>
                    </HStack>

                    {/* Step 2: Project */}
                    <HStack spacing={3}>
                      {loadingStep === "project" ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : ["init"].includes(loadingStep || "") ? (
                        <Icon as={FiCircle} color={isDark ? "gray.600" : "gray.300"} boxSize={4} />
                      ) : (
                        <Icon as={FiCheckCircle} color="green.400" boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "project" ? 600 : 400}
                        color={
                          loadingStep === "project"
                            ? "blue.400"
                            : ["init"].includes(loadingStep || "")
                            ? isDark ? "gray.600" : "gray.400"
                            : isDark ? "gray.400" : "gray.600"
                        }
                      >
                        Loading project details
                      </Text>
                    </HStack>

                    {/* Step 3: Boards */}
                    <HStack spacing={3}>
                      {loadingStep === "boards" ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : ["init", "project"].includes(loadingStep || "") ? (
                        <Icon as={FiCircle} color={isDark ? "gray.600" : "gray.300"} boxSize={4} />
                      ) : (
                        <Icon as={FiCheckCircle} color="green.400" boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "boards" ? 600 : 400}
                        color={
                          loadingStep === "boards"
                            ? "blue.400"
                            : ["init", "project"].includes(loadingStep || "")
                            ? isDark ? "gray.600" : "gray.400"
                            : isDark ? "gray.400" : "gray.600"
                        }
                      >
                        Loading board configuration
                      </Text>
                    </HStack>

                    {/* Step 4: Backlogs */}
                    <HStack spacing={3}>
                      {loadingStep === "backlogs" ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : ["init", "project", "boards"].includes(loadingStep || "") ? (
                        <Icon as={FiCircle} color={isDark ? "gray.600" : "gray.300"} boxSize={4} />
                      ) : (
                        <Icon as={FiCheckCircle} color="green.400" boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "backlogs" ? 600 : 400}
                        color={
                          loadingStep === "backlogs"
                            ? "blue.400"
                            : ["init", "project", "boards"].includes(loadingStep || "")
                            ? isDark ? "gray.600" : "gray.400"
                            : isDark ? "gray.400" : "gray.600"
                        }
                      >
                        Loading backlogs
                      </Text>
                    </HStack>

                    {/* Step 5: Tasks */}
                    <HStack spacing={3}>
                      {loadingStep === "tasks" ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : ["init", "project", "boards", "backlogs"].includes(loadingStep || "") ? (
                        <Icon as={FiCircle} color={isDark ? "gray.600" : "gray.300"} boxSize={4} />
                      ) : (
                        <Icon as={FiCheckCircle} color="green.400" boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "tasks" ? 600 : 400}
                        color={
                          loadingStep === "tasks"
                            ? "blue.400"
                            : ["init", "project", "boards", "backlogs"].includes(loadingStep || "")
                            ? isDark ? "gray.600" : "gray.400"
                            : isDark ? "gray.400" : "gray.600"
                        }
                      >
                        Loading tasks
                      </Text>
                    </HStack>

                    {/* Step 6: Ready */}
                    <HStack spacing={3}>
                      {loadingStep === "ready" ? (
                        <Spinner size="xs" color="blue.500" />
                      ) : (
                        <Icon as={FiCircle} color={isDark ? "gray.600" : "gray.300"} boxSize={4} />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight={loadingStep === "ready" ? 600 : 400}
                        color={loadingStep === "ready" ? "blue.400" : isDark ? "gray.600" : "gray.400"}
                      >
                        Preparing kanban board
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Progress Bar */}
                  <Box w="full">
                    <Box
                      h="5px"
                      bg={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.100"}
                      rounded="full"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={
                          loadingStep === "init"
                            ? "15%"
                            : loadingStep === "project"
                            ? "35%"
                            : loadingStep === "boards"
                            ? "55%"
                            : loadingStep === "backlogs"
                            ? "75%"
                            : loadingStep === "tasks"
                            ? "90%"
                            : "100%"
                        }
                        bgGradient="linear(to-r, #3b82f6, #60a5fa)"
                        rounded="full"
                        transition="width 0.3s ease"
                      />
                    </Box>
                  </Box>
                </VStack>
              </Box>
            </Flex>
          ) : boards.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={12}
              borderRadius={radiusStyle}
              border="1px solid"
              borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"}
              bg={isDark ? "rgba(15, 23, 42, 0.65)" : "white"}
              backdropFilter="blur(20px)"
              boxShadow={isDark ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)" : "0 1px 3px rgba(0, 0, 0, 0.05)"}
              minH="350px"
              textAlign="center"
              gap={3}
              w="full"
            >
              <Flex
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.100"}
                border="1px solid"
                borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"}
                align="center"
                justify="center"
                color={isDark ? "purple.300" : "purple.600"}
              >
                <FiTrello size={22} />
              </Flex>
              <Heading size="sm" color={isDark ? "white" : "gray.900"} fontWeight={700}>
                Kanban Board Not Initialized
              </Heading>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"} maxW="420px">
                This backlog has no workflow columns yet. Initialize the standard sprint stages (To Do, In Progress, In Review, Done) to begin tracking tasks.
              </Text>
              <Button
                bg="purple.600"
                color="white"
                _hover={{
                  bg: "purple.500",
                  transform: "translateY(-1px)",
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 3px 8px 0 rgba(0, 0, 0, 0.3)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.15s ease"
                size="sm"
                leftIcon={<FiPlus />}
                onClick={handleGenerateBoard}
                isLoading={isGeneratingBoard}
                mt={2}
                borderRadius={radiusStyle}
                border="1px solid rgba(255, 255, 255, 0.12)"
                boxShadow="inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.25)"
                fontSize="xs"
                fontWeight={600}
              >
                Initialize Kanban Board
              </Button>
            </Flex>
          ) : (
            <Box
              w="full"
              bg={isDark ? "rgba(15, 23, 42, 0.7)" : "white"}
              borderRadius={radiusStyle}
              p={4}
              shadow="sm"
              border="1px solid"
              borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
              overflowX="auto"
            >
              <Grid
                templateColumns={{
                  base: "repeat(1, 1fr)",
                  md: "repeat(2, 1fr)",
                  xl: `repeat(${boards.length}, minmax(280px, 1fr))`,
                }}
                gap={6}
                minH="700px"
                w="full"
              >
                {boards.map((board) => {
                  const boardTasks = filteredTasks.filter(
                    (t) =>
                      t.boardId === board.id ||
                      (t.boardCodeStage && board.boardCodeStage && t.boardCodeStage.toUpperCase() === board.boardCodeStage.toUpperCase()) ||
                      (t.boardName && board.boardName && t.boardName.trim().toUpperCase() === board.boardName.trim().toUpperCase())
                  );

                  return (
                    <GridItem key={board.id} w="full">
                      <DevKanbanColumn
                        board={board}
                        tasks={boardTasks}
                        onMoveTask={handleMoveTask}
                        onAddTask={handleAddTask}
                        onTaskClick={handleTaskClick}
                        recentlyMovedTaskId={recentlyMovedTaskId}
                        isCompactView={isCompactView}
                        dataBacklogs={backlogs}
                        onOpenCreateModal={handleOpenCreateTaskModal}
                      />
                    </GridItem>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Task Detail Modal matching /workspace/project?projectId= */}
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="5xl"
          isCentered
          scrollBehavior="inside"
          motionPreset="slideInBottom"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
          <ModalContent
            bg={isDark ? "gray.900" : "white"}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
            overflow="hidden"
            boxShadow="2xl"
          >
            {/* Header Banner */}
            <Flex
              w="full"
              minH="56px"
              bg={
                isDark
                  ? "rgba(15, 23, 42, 0.65)"
                  : "rgba(255, 255, 255, 0.85)"
              }
              backdropFilter="blur(20px)"
              borderBottom="1px solid"
              borderColor={
                isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"
              }
              px={6}
              py={3}
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack spacing={3} minW={0} flex={1}>
                <Badge
                  bg={isDark ? "rgba(59, 130, 246, 0.15)" : "blue.50"}
                  color={isDark ? "blue.300" : "blue.600"}
                  border="1px solid"
                  borderColor={
                    isDark ? "rgba(59, 130, 246, 0.3)" : "blue.200"
                  }
                  px={2.5}
                  py={0.5}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {activeTask?.taskCode || "TASK"}
                </Badge>
                <Heading
                  as="h4"
                  size="sm"
                  noOfLines={1}
                  color={isDark ? "white" : "gray.800"}
                >
                  {activeTask?.taskName || "Task Details"}
                </Heading>
              </HStack>
            </Flex>
            <ModalCloseButton
              color={isDark ? "gray.400" : "gray.600"}
              top={3}
              right={4}
            />

            <ModalBody p={{ base: 4, md: 6 }}>
              {isLoadingTaskDetails ? (
                <Flex justify="center" align="center" minH="300px" direction="column" gap={3}>
                  <Spinner size="xl" color="purple.500" thickness="3px" />
                  <Text fontSize="sm" color="gray.500">
                    Loading task details...
                  </Text>
                </Flex>
              ) : activeTask ? (
                <Grid templateColumns="repeat(12, 1fr)" gap={6} w="full">
                  {/* Top Status & Priority Bar */}
                  <GridItem colSpan={12}>
                    <Flex
                      p={3}
                      borderRadius={radiusStyle}
                      bg={isDark ? "rgba(255, 255, 255, 0.04)" : "gray.50"}
                      border="1px solid"
                      borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                      justify="space-between"
                      align="center"
                      flexWrap="wrap"
                      gap={3}
                    >
                      <HStack spacing={4} flexWrap="wrap">
                        {/* Status / Board Selector Menu */}
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                            Status:
                          </Text>
                          <Menu>
                            <MenuButton
                              as={Button}
                              rightIcon={<FiChevronDown size={14} />}
                              size="sm"
                              variant="outline"
                              borderColor={isDark ? "purple.400" : "purple.500"}
                              color={isDark ? "purple.200" : "purple.700"}
                              borderRadius="md"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {activeTask.boardName || "Select Stage"}
                            </MenuButton>
                            <MenuList
                              bg={isDark ? "gray.800" : "white"}
                              borderColor={isDark ? "gray.700" : "gray.200"}
                              borderRadius={radiusStyle}
                            >
                              {boards.map((b) => (
                                <MenuItem
                                  key={b.id}
                                  fontSize="xs"
                                  fontWeight={b.id === activeTask.boardId ? "bold" : "normal"}
                                  isDisabled={b.id === activeTask.boardId}
                                  onClick={() => handleMoveTaskToBoard(b)}
                                >
                                  {b.boardName}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                        </HStack>

                        {/* Priority Selector Menu */}
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                            Priority:
                          </Text>
                          <Menu>
                            <MenuButton
                              as={Button}
                              rightIcon={<FiChevronDown size={14} />}
                              size="sm"
                              variant="ghost"
                              p={1}
                              borderRadius="md"
                            >
                              <Badge
                                colorScheme={
                                  activeTask.taskPriority === "HIGH"
                                    ? "red"
                                    : activeTask.taskPriority === "MEDIUM"
                                      ? "orange"
                                      : activeTask.taskPriority === "CRITICAL"
                                        ? "purple"
                                        : "green"
                                }
                                fontSize="xs"
                                px={2.5}
                                py={0.5}
                                borderRadius="md"
                              >
                                {activeTask.taskPriority}
                              </Badge>
                            </MenuButton>
                            <MenuList
                              bg={isDark ? "gray.800" : "white"}
                              borderColor={isDark ? "gray.700" : "gray.200"}
                              borderRadius={radiusStyle}
                            >
                              <MenuItem
                                fontSize="xs"
                                icon={<Badge colorScheme="green">LOW</Badge>}
                                onClick={() => handleUpdateTaskPriority("LOW")}
                              >
                                Low Priority
                              </MenuItem>
                              <MenuItem
                                fontSize="xs"
                                icon={<Badge colorScheme="orange">MEDIUM</Badge>}
                                onClick={() => handleUpdateTaskPriority("MEDIUM")}
                              >
                                Medium Priority
                              </MenuItem>
                              <MenuItem
                                fontSize="xs"
                                icon={<Badge colorScheme="red">HIGH</Badge>}
                                onClick={() => handleUpdateTaskPriority("HIGH")}
                              >
                                High Priority
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </HStack>

                      {/* Edit Full Task Shortcut */}
                      <Button
                        size="xs"
                        leftIcon={<FiEdit2 size={12} />}
                        colorScheme="purple"
                        variant="outline"
                        borderRadius="md"
                        onClick={() => handleOpenEditTaskModal(activeTask)}
                      >
                        Edit Full Task
                      </Button>
                    </Flex>
                  </GridItem>

                  {/* LEFT COLUMN: colSpan 8 (Alerts, Task Title, Description, Checklist, Comments) */}
                  <GridItem colSpan={{ base: 12, md: 8 }}>
                    <VStack spacing={5} align="stretch">
                      {/* Compact Task Notices & Status Badges */}
                      <Wrap spacing={2} mb={1}>
                        {activeTask.percentageStatus < 100 &&
                          (activeTask.boardCodeStage === "DONE" ||
                            activeTask.boardName?.toUpperCase() === "DONE") && (
                            <WrapItem>
                              <HStack
                                spacing={1.5}
                                px={2.5}
                                py={0.5}
                                borderRadius="full"
                                bg={isDark ? "rgba(245, 158, 11, 0.12)" : "orange.50"}
                                border="1px solid"
                                borderColor={isDark ? "rgba(245, 158, 11, 0.25)" : "orange.200"}
                                color={isDark ? "orange.300" : "orange.700"}
                                fontSize="2xs"
                                fontWeight={600}
                              >
                                <Icon as={FiAlertTriangle} boxSize={3} />
                                <Text>Checklist belum selesai</Text>
                              </HStack>
                            </WrapItem>
                          )}

                        {(!activeTask.assignUsers || activeTask.assignUsers.length === 0) && (
                          <WrapItem>
                            <HStack
                              spacing={1.5}
                              px={2.5}
                              py={0.5}
                              borderRadius="full"
                              bg={isDark ? "rgba(59, 130, 246, 0.12)" : "blue.50"}
                              border="1px solid"
                              borderColor={isDark ? "rgba(59, 130, 246, 0.25)" : "blue.200"}
                              color={isDark ? "blue.300" : "blue.700"}
                              fontSize="2xs"
                              fontWeight={600}
                            >
                              <Icon as={FiUsers} boxSize={3} />
                              <Text>Belum ada user ditugaskan</Text>
                            </HStack>
                          </WrapItem>
                        )}

                        {!activeTask.endDate && (
                          <WrapItem>
                            <HStack
                              spacing={1.5}
                              px={2.5}
                              py={0.5}
                              borderRadius="full"
                              bg={isDark ? "rgba(245, 158, 11, 0.12)" : "amber.50"}
                              border="1px solid"
                              borderColor={isDark ? "rgba(245, 158, 11, 0.25)" : "amber.200"}
                              color={isDark ? "amber.300" : "amber.700"}
                              fontSize="2xs"
                              fontWeight={600}
                            >
                              <Icon as={FiClock} boxSize={3} />
                              <Text>Belum ada deadline</Text>
                            </HStack>
                          </WrapItem>
                        )}

                        {activeTask.endDate &&
                          activeTask.boardCodeStage !== "DONE" &&
                          (() => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0);
                            const end = new Date(activeTask.endDate);
                            end.setHours(0, 0, 0, 0);
                            const diffTime = end.getTime() - now.getTime();
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) {
                              return (
                                <WrapItem>
                                  <HStack
                                    spacing={1.5}
                                    px={2.5}
                                    py={0.5}
                                    borderRadius="full"
                                    bg={isDark ? "rgba(239, 68, 68, 0.12)" : "red.50"}
                                    border="1px solid"
                                    borderColor={isDark ? "rgba(239, 68, 68, 0.25)" : "red.200"}
                                    color={isDark ? "red.300" : "red.700"}
                                    fontSize="2xs"
                                    fontWeight={600}
                                  >
                                    <Icon as={FiAlertCircle} boxSize={3} />
                                    <Text>Lewat deadline {Math.abs(diffDays)} hari</Text>
                                  </HStack>
                                </WrapItem>
                              );
                            } else if (diffDays <= 3) {
                              return (
                                <WrapItem>
                                  <HStack
                                    spacing={1.5}
                                    px={2.5}
                                    py={0.5}
                                    borderRadius="full"
                                    bg={isDark ? "rgba(245, 158, 11, 0.12)" : "amber.50"}
                                    border="1px solid"
                                    borderColor={isDark ? "rgba(245, 158, 11, 0.25)" : "amber.200"}
                                    color={isDark ? "amber.300" : "amber.700"}
                                    fontSize="2xs"
                                    fontWeight={600}
                                  >
                                    <Icon as={FiClock} boxSize={3} />
                                    <Text>Jatuh tempo {diffDays} hari lagi</Text>
                                  </HStack>
                                </WrapItem>
                              );
                            }
                            return (
                              <WrapItem>
                                <HStack
                                  spacing={1.5}
                                  px={2.5}
                                  py={0.5}
                                  borderRadius="full"
                                  bg={isDark ? "rgba(255, 255, 255, 0.05)" : "gray.100"}
                                  border="1px solid"
                                  borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                                  color={isDark ? "gray.300" : "gray.600"}
                                  fontSize="2xs"
                                  fontWeight={600}
                                >
                                  <Icon as={FiClock} boxSize={3} />
                                  <Text>Deadline: {formatDateDDMMYYYY(activeTask.endDate)}</Text>
                                </HStack>
                              </WrapItem>
                            );
                          })()}
                      </Wrap>

                      {/* Task Title & Action Controls (Tightly grouped) */}
                      <VStack spacing={2.5} align="stretch">
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1}>
                            Task Title
                          </Text>
                          {isEditingTaskName ? (
                            <HStack spacing={2}>
                              <Input
                                size="sm"
                                value={editedTaskName}
                                onChange={(e) => setEditedTaskName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveTaskName();
                                  if (e.key === "Escape") setIsEditingTaskName(false);
                                }}
                                autoFocus
                                borderRadius="md"
                                bg={isDark ? "gray.800" : "white"}
                              />
                              <Button size="sm" colorScheme="blue" onClick={handleSaveTaskName} isLoading={isSavingTaskInline}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setIsEditingTaskName(false)}>
                                Cancel
                              </Button>
                            </HStack>
                          ) : (
                            <HStack
                              spacing={2}
                              cursor="pointer"
                              onClick={() => {
                                setEditedTaskName(activeTask.taskName);
                                setIsEditingTaskName(true);
                              }}
                              py={1}
                              px={2}
                              borderRadius="md"
                              _hover={{ bg: isDark ? "rgba(255, 255, 255, 0.05)" : "gray.50" }}
                            >
                              <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                {activeTask.taskName}
                              </Text>
                              <FiEdit2 size={13} color="#a78bfa" />
                            </HStack>
                          )}
                        </Box>

                        {/* Schedule Dates & Assign Member Controls matching /workspace/project */}
                        <HStack spacing={2} wrap="wrap">
                          <Popover placement="bottom-start" closeOnBlur={false}>
                            <PopoverTrigger>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<FiCalendar />}
                                rightIcon={<FiChevronDown />}
                                borderRadius={radiusStyle}
                                fontSize="xs"
                                fontWeight={500}
                                borderColor={isDark ? "whiteAlpha.300" : "gray.300"}
                                _hover={{
                                  bg: isDark ? "rgba(255, 255, 255, 0.06)" : "gray.50",
                                  borderColor: "blue.400",
                                }}
                              >
                                {activeTask.startDate && activeTask.endDate
                                  ? `${formatDateDDMMYYYY(activeTask.startDate)} - ${formatDateDDMMYYYY(activeTask.endDate)}`
                                  : activeTask.startDate
                                  ? `Starts: ${formatDateDDMMYYYY(activeTask.startDate)}`
                                  : activeTask.endDate
                                  ? `Due: ${formatDateDDMMYYYY(activeTask.endDate)}`
                                  : "Set dates"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              p={4}
                              width="320px"
                              rounded={radiusStyle}
                              bg={isDark ? "gray.800" : "white"}
                              borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                              boxShadow="2xl"
                              zIndex={1400}
                            >
                              <PopoverArrow bg={isDark ? "gray.800" : "white"} />
                              <PopoverCloseButton />
                              <PopoverHeader
                                fontWeight="semibold"
                                fontSize="sm"
                                borderBottomWidth="1px"
                                borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
                              >
                                Set Task Dates
                              </PopoverHeader>
                              <PopoverBody pt={3}>
                                <VStack spacing={3} align="stretch">
                                  <DateTimeRangeInput
                                    startValue={tempStartDate}
                                    endValue={tempEndDate}
                                    onStartChange={(val) =>
                                      setTempStartDate(val ?? null)
                                    }
                                    onEndChange={(val) =>
                                      setTempEndDate(val ?? null)
                                    }
                                    placeholder="Select task schedule"
                                    size="sm"
                                  />
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    w="full"
                                    isLoading={isSavingTaskDates}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      await updateTaskDates(
                                        tempStartDate,
                                        tempEndDate
                                      );
                                      // Close popover
                                      document.body.click();
                                    }}
                                  >
                                    Save Dates
                                  </Button>
                                </VStack>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>

                          {/* Assign Task Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<FiUsers />}
                            borderRadius={radiusStyle}
                            fontSize="xs"
                            fontWeight={500}
                            borderColor={isDark ? "whiteAlpha.300" : "gray.300"}
                            _hover={{
                              bg: isDark ? "rgba(255, 255, 255, 0.06)" : "gray.50",
                              borderColor: "blue.400",
                            }}
                            onClick={() => {
                              setSearchUserAssign("");
                              const members: UsersResponse[] = (
                                projectData?.userAssignment || []
                              )
                                .map((a: any) => a.userData)
                                .filter(Boolean);
                              setDataUsers(members);
                              setChoosedMemberProjects(
                                (activeTask.assignUsers || []).map((u) => ({
                                  id: u.id,
                                  nama: u.nama,
                                  nip: u.nip,
                                  userId: u.userId,
                                  jabatan: u.jabatan,
                                  email: u.email,
                                  profilePict: u.profilePict,
                                } as any))
                              );
                              onAssignModalOpen();
                            }}
                          >
                            Assign Task
                            {activeTask.assignUsers &&
                              activeTask.assignUsers.length > 0 &&
                              ` (${activeTask.assignUsers.length})`}
                          </Button>
                        </HStack>
                      </VStack>

                      {/* Task Description (Inline editable) */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1}>
                          Description
                        </Text>
                        {isEditingTaskDesc ? (
                          <VStack spacing={2} align="stretch">
                            <Textarea
                              size="sm"
                              rows={3}
                              value={editedTaskDesc}
                              onChange={(e) => setEditedTaskDesc(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                  handleSaveTaskDesc();
                                } else if (e.key === "Escape") {
                                  setIsEditingTaskDesc(false);
                                }
                              }}
                              autoFocus
                              borderRadius="md"
                              bg={isDark ? "gray.800" : "white"}
                              placeholder="Add a more detailed description..."
                            />
                            <HStack justify="space-between">
                              <Text fontSize="2xs" color="gray.500">
                                Ctrl+Enter to save, Esc to cancel
                              </Text>
                              <HStack spacing={2}>
                                <Button size="xs" variant="ghost" onClick={() => setIsEditingTaskDesc(false)}>
                                  Cancel
                                </Button>
                                <Button size="xs" colorScheme="blue" onClick={handleSaveTaskDesc} isLoading={isSavingTaskInline}>
                                  Save Description
                                </Button>
                              </HStack>
                            </HStack>
                          </VStack>
                        ) : (
                          <Box
                            p={3}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                              setEditedTaskDesc(activeTask.taskDesc || "");
                              setIsEditingTaskDesc(true);
                            }}
                            bg={isDark ? "rgba(255, 255, 255, 0.03)" : "gray.50"}
                            border="1px solid"
                            borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                            minH="54px"
                            _hover={{ bg: isDark ? "rgba(255, 255, 255, 0.06)" : "gray.100" }}
                          >
                            {activeTask.taskDesc ? (
                              <Text fontSize="sm" color={isDark ? "gray.200" : "gray.700"} whiteSpace="pre-wrap">
                                {activeTask.taskDesc}
                              </Text>
                            ) : (
                              <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                Add a more detailed description... (Click to edit)
                              </Text>
                            )}
                          </Box>
                        )}
                      </Box>

                      <Divider borderColor={isDark ? "whiteAlpha.200" : "gray.200"} />

                      {/* Task Items (Checklist) exactly matching /workspace/project */}
                      <Box>
                        <Flex justify="space-between" align="center" mb={2}>
                          <HStack spacing={2}>
                            <FiCheckCircle size={16} color="#10b981" />
                            <Text fontWeight="bold" fontSize="sm">
                              Checklist ({taskItems.filter((i) => i.isDone === "Y").length}/{taskItems.length})
                            </Text>
                          </HStack>
                          {isLoadingTaskItems && <Spinner size="xs" color="purple.500" />}
                        </Flex>

                        {/* Checklist Progress Bar */}
                        {taskItems.length > 0 && (
                          <Box w="full" h="6px" bg={isDark ? "gray.700" : "gray.200"} borderRadius="full" mb={3}>
                            <Box
                              h="100%"
                              w={`${Math.round(
                                (taskItems.filter((i) => i.isDone === "Y").length / taskItems.length) * 100
                              )}%`}
                              bg="green.400"
                              borderRadius="full"
                              transition="width 0.3s ease"
                            />
                          </Box>
                        )}

                        {/* Checklist Items list */}
                        <VStack spacing={2} align="stretch">
                          {taskItems.map((item) => (
                            <HStack
                              key={item.id}
                              p={2.5}
                              borderRadius="md"
                              bg={isDark ? "rgba(255, 255, 255, 0.03)" : "gray.50"}
                              border="1px solid"
                              borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                              justify="space-between"
                              _hover={{ bg: isDark ? "rgba(255, 255, 255, 0.06)" : "gray.100" }}
                            >
                              <Checkbox
                                isChecked={item.isDone === "Y"}
                                colorScheme="green"
                                onChange={() =>
                                  handleToggleChecklistItem(item.id, item.isDone, item.taskItemName)
                                }
                              >
                                <Text
                                  fontSize="xs"
                                  textDecoration={item.isDone === "Y" ? "line-through" : "none"}
                                  color={
                                    item.isDone === "Y"
                                      ? "gray.500"
                                      : isDark
                                        ? "gray.200"
                                        : "gray.800"
                                  }
                                >
                                  {item.taskItemName}
                                </Text>
                              </Checkbox>

                              <IconButton
                                aria-label="Delete item"
                                icon={<FiTrash2 size={13} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteChecklistItem(item.id)}
                              />
                            </HStack>
                          ))}

                          {taskItems.length === 0 && (
                            <Text fontSize="xs" color="gray.400" py={1}>
                              No subtasks yet. Add one below.
                            </Text>
                          )}
                        </VStack>

                        {/* Add new subtask input */}
                        <HStack mt={3} spacing={2}>
                          <Input
                            size="sm"
                            placeholder="Add a new subtask..."
                            value={newChecklistText}
                            onChange={(e) => setNewChecklistText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newChecklistText.trim()) {
                                e.preventDefault();
                                handleAddChecklistItem();
                              }
                            }}
                            borderRadius="md"
                            fontSize="xs"
                            bg={isDark ? "gray.800" : "white"}
                            focusBorderColor="purple.400"
                          />
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={handleAddChecklistItem}
                            isLoading={isAddingItem}
                            isDisabled={!newChecklistText.trim()}
                            borderRadius="md"
                            fontSize="xs"
                            leftIcon={<FiCornerDownLeft size={13} />}
                            px={4}
                          >
                            Add
                          </Button>
                        </HStack>
                      </Box>

                      <Divider borderColor={isDark ? "whiteAlpha.200" : "gray.200"} />

                      {/* Comments Section exactly matching /workspace/project */}
                      <Box>
                        <Flex justify="space-between" align="center" mb={3}>
                          <HStack spacing={2}>
                            <FiMessageSquare size={16} color="#8b5cf6" />
                            <Text fontWeight="bold" fontSize="sm">
                              Comments ({taskComments.length})
                            </Text>
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="purple"
                            leftIcon={<FiRefreshCw size={12} />}
                            onClick={async () => {
                              if (activeTask) {
                                const res = await ListTaskComments(activeTask.id, tokenData);
                                if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
                                  setTaskComments(res.data);
                                }
                              }
                            }}
                          >
                            Refresh
                          </Button>
                        </Flex>

                        {/* Add Comment Box */}
                        <Box
                          p={3}
                          borderRadius="md"
                          bg={isDark ? "rgba(255, 255, 255, 0.03)" : "gray.50"}
                          border="1px solid"
                          borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                          mb={4}
                        >
                          <HStack align="start" spacing={3}>
                            <Avatar
                              size="sm"
                              name={currentAuthUser?.nama || "User"}
                              src={currentAuthUser?.profilePict || undefined}
                            />
                            <VStack w="full" spacing={2} align="stretch">
                              <Textarea
                                placeholder="Write a comment..."
                                size="sm"
                                rows={2}
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleAddComment();
                                  }
                                }}
                                borderRadius="md"
                                bg={isDark ? "gray.800" : "white"}
                                focusBorderColor="purple.400"
                                fontSize="xs"
                              />
                              <Flex justify="space-between" align="center">
                                <Text fontSize="2xs" color="gray.500">
                                  Press Ctrl+Enter to submit
                                </Text>
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  onClick={handleAddComment}
                                  isLoading={isAddingComment}
                                  isDisabled={!newCommentText.trim()}
                                  borderRadius={radiusStyle}
                                  leftIcon={<FiSend size={12} />}
                                >
                                  Add Comment
                                </Button>
                              </Flex>
                            </VStack>
                          </HStack>
                        </Box>

                        {/* Comments List */}
                        <VStack spacing={3} align="stretch">
                          {taskComments.map((com) => {
                            const isOwnComment =
                              currentAuthUser?.userId === com.userCreated?.id ||
                              currentAuthUser?.id === com.userCreated?.id;
                            return (
                              <Box
                                key={com.id}
                                p={3}
                                borderRadius="md"
                                bg={isDark ? "rgba(255, 255, 255, 0.03)" : "white"}
                                border="1px solid"
                                borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                              >
                                <HStack justify="space-between" mb={1.5}>
                                  <HStack spacing={2}>
                                    <Avatar
                                      size="xs"
                                      name={com.userCreated?.nama || "User"}
                                      src={com.userCreated?.profilePict || undefined}
                                    />
                                    <Text fontSize="xs" fontWeight="bold">
                                      {com.userCreated?.nama || "User"}
                                    </Text>
                                    <Text fontSize="2xs" color="gray.500">
                                      {convertToCustomDateFormat(com.createdAt)}
                                    </Text>
                                  </HStack>

                                  {isOwnComment && (
                                    <HStack spacing={1}>
                                      <IconButton
                                        aria-label="Edit comment"
                                        icon={<FiEdit2 size={12} />}
                                        size="2xs"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingCommentId(com.id);
                                          setEditedCommentText(com.comCaptions || "");
                                        }}
                                      />
                                      <IconButton
                                        aria-label="Delete comment"
                                        icon={<FiTrash2 size={12} />}
                                        size="2xs"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => handleDeleteComment(com.id)}
                                      />
                                    </HStack>
                                  )}
                                </HStack>

                                {editingCommentId === com.id ? (
                                  <VStack spacing={2} align="stretch" mt={2}>
                                    <Textarea
                                      size="xs"
                                      value={editedCommentText}
                                      onChange={(e) => setEditedCommentText(e.target.value)}
                                      borderRadius="md"
                                      bg={isDark ? "gray.800" : "white"}
                                    />
                                    <HStack justify="flex-end" spacing={2}>
                                      <Button
                                        size="2xs"
                                        variant="ghost"
                                        onClick={() => setEditingCommentId(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="2xs"
                                        colorScheme="blue"
                                        onClick={() => handleUpdateComment(com.id)}
                                      >
                                        Save
                                      </Button>
                                    </HStack>
                                  </VStack>
                                ) : (
                                  <Text fontSize="xs" color={isDark ? "gray.200" : "gray.700"}>
                                    {com.comCaptions}
                                  </Text>
                                )}
                              </Box>
                            );
                          })}

                          {taskComments.length === 0 && (
                            <Text fontSize="xs" color="gray.400" textAlign="center" py={3}>
                              No comments yet. Be the first to comment!
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </VStack>
                  </GridItem>

                  {/* RIGHT COLUMN: colSpan 4 ("Detail Task", Assignees, Backlog, Timeline, Progress, Created By, Archive) */}
                  <GridItem colSpan={{ base: 12, md: 4 }}>
                    <VStack
                      spacing={5}
                      align="stretch"
                      p={4}
                      borderRadius={radiusStyle}
                      bg={isDark ? "rgba(255, 255, 255, 0.03)" : "gray.50"}
                      border="1px solid"
                      borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                    >
                      <HStack spacing={2}>
                        <FiSettings size={15} color="#a78bfa" />
                        <Text fontWeight="bold" fontSize="sm">
                          Detail Task
                        </Text>
                      </HStack>

                      {/* Assigned To */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            Assigned To
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            leftIcon={<FiPlus size={12} />}
                            borderRadius={radiusStyle}
                            onClick={() => {
                              setSearchUserAssign("");
                              const members: UsersResponse[] = (
                                projectData?.userAssignment || []
                              )
                                .map((a: any) => a.userData)
                                .filter(Boolean);
                              setDataUsers(members);
                              setChoosedMemberProjects(
                                (activeTask.assignUsers || []).map((u) => ({
                                  id: u.id,
                                  nama: u.nama,
                                  nip: u.nip,
                                  userId: u.userId,
                                  jabatan: u.jabatan,
                                  email: u.email,
                                  profilePict: u.profilePict,
                                } as any))
                              );
                              onAssignModalOpen();
                            }}
                          >
                            Manage
                          </Button>
                        </HStack>
                        {activeTask.assignUsers && activeTask.assignUsers.length > 0 ? (
                          <Wrap spacing={2}>
                            {activeTask.assignUsers.map((u) => (
                              <WrapItem key={u.id}>
                                <HStack
                                  p={1.5}
                                  px={2.5}
                                  bg={isDark ? "gray.800" : "white"}
                                  border="1px solid"
                                  borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                                  borderRadius="full"
                                  spacing={2}
                                >
                                  <Avatar size="2xs" name={u.nama} src={u.profilePict || undefined} />
                                  <Text fontSize="2xs" fontWeight="semibold">
                                    {u.nama}
                                  </Text>
                                </HStack>
                              </WrapItem>
                            ))}
                          </Wrap>
                        ) : (
                          <Text fontSize="xs" color="gray.400" fontStyle="italic">
                            No assignees
                          </Text>
                        )}
                      </Box>

                      {/* Backlog Info */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1.5}>
                          Backlog
                        </Text>
                        <Box
                          p={2.5}
                          bg={isDark ? "rgba(139, 92, 246, 0.12)" : "purple.50"}
                          border="1px solid"
                          borderColor={isDark ? "rgba(139, 92, 246, 0.25)" : "purple.200"}
                          borderRadius="md"
                        >
                          <Text fontSize="xs" fontWeight="bold" color={isDark ? "purple.200" : "purple.800"} noOfLines={2}>
                            {activeTask.backlogName ||
                              backlogs.find((b) => b.id === activeTask.backlogId)?.backlogName ||
                              selectedProject?.projectName ||
                              "Backlog"}
                          </Text>
                        </Box>
                      </Box>

                      {/* Timeline */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1.5}>
                          Timeline
                        </Text>
                        <VStack align="start" spacing={1.5}>
                          <HStack spacing={2} fontSize="xs">
                            <Text fontWeight="semibold" color="gray.500" w="70px">
                              Start Date:
                            </Text>
                            <Text fontWeight="bold">
                              {formatDateDDMMYYYY(activeTask.startDate)}
                            </Text>
                          </HStack>
                          <HStack spacing={2} fontSize="xs">
                            <Text fontWeight="semibold" color="gray.500" w="70px">
                              End Date:
                            </Text>
                            <Text
                              fontWeight="bold"
                              color={
                                activeTask.endDate && new Date(activeTask.endDate).getTime() < Date.now()
                                  ? "red.400"
                                  : "inherit"
                              }
                            >
                              {formatDateDDMMYYYY(activeTask.endDate)}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>

                      {/* Progress Bar */}
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            Progress
                          </Text>
                          <Text fontSize="xs" fontWeight="bold" color={isDark ? "blue.300" : "blue.600"}>
                            {activeTask.percentageStatus || 0}%
                          </Text>
                        </HStack>
                        <Box w="full" h="8px" bg={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.100"} borderRadius="full">
                          <Box
                            h="100%"
                            w={`${activeTask.percentageStatus || 0}%`}
                            bgGradient="linear(to-r, #3b82f6, #60a5fa)"
                            borderRadius="full"
                            transition="width 0.3s ease"
                          />
                        </Box>
                      </Box>

                      {/* Created By */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1.5}>
                          Dibuat Oleh
                        </Text>
                        {activeTask.userCreated ? (
                          <HStack spacing={2}>
                            <Avatar
                              size="2xs"
                              name={activeTask.userCreated.nama}
                              src={activeTask.userCreated.profilePict || undefined}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="bold">
                                {activeTask.userCreated.nama}
                              </Text>
                              <Text fontSize="3xs" color="gray.500">
                                {new Date(activeTask.createdAt).toLocaleString()}
                              </Text>
                            </VStack>
                          </HStack>
                        ) : (
                          <Text fontSize="xs" color="gray.400">
                            {new Date(activeTask.createdAt).toLocaleDateString()}
                          </Text>
                        )}
                      </Box>

                      <Divider borderColor={isDark ? "whiteAlpha.200" : "gray.200"} />

                      {/* Archive Button */}
                      <Button
                        size="sm"
                        w="full"
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<FiArchive size={14} />}
                        borderRadius={radiusStyle}
                        fontSize="xs"
                        onClick={() => handleArchiveTask(activeTask.id)}
                        isLoading={isArchivingTask}
                      >
                        Archive Task
                      </Button>
                    </VStack>
                  </GridItem>
                </Grid>
              ) : null}
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={3}
              justifyContent="space-between"
            >
              <Button
                size="sm"
                leftIcon={<FiEdit2 />}
                colorScheme="purple"
                variant="outline"
                borderRadius={radiusStyle}
                onClick={() => {
                  if (activeTask) handleOpenEditTaskModal(activeTask);
                }}
              >
                Edit Full Task
              </Button>
              <Button size="sm" onClick={onDetailClose} borderRadius={radiusStyle}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Comprehensive Task Modal matching /workspace/project?projectId= */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={onTaskModalClose}
          size="lg"
          isCentered
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
          <ModalContent
            bg={isDark ? "gray.800" : "white"}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
            boxShadow="2xl"
          >
            <ModalHeader
              color={isDark ? "white" : "gray.800"}
              borderBottom="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={4}
            >
              {selectedTask ? "Edit Task" : "Create New Task"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={4}>
                <Box w="full">
                  <Text
                    mb={2}
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.300" : "gray.700"}
                  >
                    Task Name *
                  </Text>
                  <Input
                    value={taskForm.taskName}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        taskName: e.target.value,
                      }))
                    }
                    placeholder="Enter task name"
                    borderRadius={radiusStyle}
                    bg={isDark ? "gray.700" : "white"}
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    focusBorderColor="purple.400"
                  />
                </Box>

                <Box w="full">
                  <Text
                    mb={2}
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.300" : "gray.700"}
                  >
                    Description
                  </Text>
                  <Textarea
                    value={taskForm.taskDesc}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        taskDesc: e.target.value,
                      }))
                    }
                    placeholder="Enter task description"
                    rows={3}
                    borderRadius={radiusStyle}
                    bg={isDark ? "gray.700" : "white"}
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    focusBorderColor="purple.400"
                  />
                </Box>

                <HStack w="full" spacing={4}>
                  <Box flex={1}>
                    <Text
                      mb={2}
                      fontSize="sm"
                      fontWeight="medium"
                      color={isDark ? "gray.300" : "gray.700"}
                    >
                      Priority
                    </Text>
                    <Select
                      value={taskForm.taskPriority}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          taskPriority: e.target.value,
                        }))
                      }
                      borderRadius={radiusStyle}
                      bg={isDark ? "gray.700" : "white"}
                      borderColor={isDark ? "gray.600" : "gray.300"}
                      focusBorderColor="purple.400"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text
                      mb={2}
                      fontSize="sm"
                      fontWeight="medium"
                      color={isDark ? "gray.300" : "gray.700"}
                    >
                      Stage / Column *
                    </Text>
                    <Select
                      value={taskForm.boardId}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          boardId: e.target.value,
                        }))
                      }
                      borderRadius={radiusStyle}
                      bg={isDark ? "gray.700" : "white"}
                      borderColor={isDark ? "gray.600" : "gray.300"}
                      focusBorderColor="purple.400"
                    >
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.boardName}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>

                {!selectedTask && (
                  <Box w="full">
                    <Text
                      mb={2}
                      fontSize="sm"
                      fontWeight="medium"
                      color={isDark ? "gray.300" : "gray.700"}
                    >
                      Backlog *
                    </Text>
                    <Select
                      value={taskForm.backlogId}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          backlogId: e.target.value,
                        }))
                      }
                      borderRadius={radiusStyle}
                      bg={isDark ? "gray.700" : "white"}
                      borderColor={isDark ? "gray.600" : "gray.300"}
                      focusBorderColor="purple.400"
                      placeholder="Select backlog"
                    >
                      {backlogs.map((backlog) => (
                        <option key={backlog.id} value={backlog.id}>
                          {backlog.backlogName}
                        </option>
                      ))}
                    </Select>
                  </Box>
                )}

                <DateTimeRangeInput
                  startValue={taskForm.taskStartDate || null}
                  endValue={taskForm.taskEndDate || null}
                  onStartChange={(value) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      taskStartDate: value || "",
                    }))
                  }
                  onEndChange={(value) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      taskEndDate: value || "",
                    }))
                  }
                  label="Task Schedule"
                  placeholder="Select start and end date & time"
                  size="md"
                />
              </VStack>
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={3}
            >
              <Button variant="ghost" mr={3} onClick={onTaskModalClose} borderRadius={radiusStyle}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveTask}
                isLoading={isSavingTask}
                borderRadius={radiusStyle}
              >
                {selectedTask ? "Update" : "Create"} Task
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Bulk JSON Import Modal — dev-only power tool for bulk-creating kanban cards */}
        <Modal
          isOpen={isJsonImportOpen}
          onClose={() => {
            onJsonImportClose();
            setJsonImportError("");
            setJsonImportResult(null);
          }}
          size="6xl"
          isCentered
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
          <ModalContent
            bg={isDark ? "gray.800" : "white"}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
            boxShadow="2xl"
            maxW={{ base: "98vw", lg: "92vw", xl: "1450px" }}
            w="full"
          >
            <ModalHeader
              color={isDark ? "white" : "gray.800"}
              borderBottom="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={4}
            >
              <HStack spacing={2}>
                <Icon as={FiCode} color="purple.400" />
                <Text>Bulk Import Tasks via JSON</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                  Paste a JSON payload below containing a <strong>tasks</strong> array or an array of tasks. Each task needs a <strong>boardName</strong> matching
                  an existing board on this backlog and a <strong>taskName</strong>. Optional{" "}
                  <strong>taskItems</strong> creates checklist items (accepts strings or objects with <code>&quot;isChecked&quot;: true/false</code>), and{" "}
                  <strong>assignedTask</strong> / <strong>team</strong> assigns members by name or email.
                </Text>

                {/* Read-Only Target Context Card: Project & Backlog Header */}
                <Box
                  p={4}
                  borderRadius={radiusStyle}
                  bg={isDark ? "rgba(15, 23, 42, 0.6)" : "purple.50"}
                  border="1px solid"
                  borderColor={isDark ? "purple.900" : "purple.200"}
                >
                  <HStack justify="space-between" mb={3} align="center">
                    <HStack spacing={2} align="center">
                      <Icon as={FiLock} color="purple.400" boxSize="14px" />
                      <Text
                        fontSize="xs"
                        fontWeight={700}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        color={isDark ? "purple.300" : "purple.700"}
                      >
                        Project Context
                      </Text>
                    </HStack>
                  </HStack>

                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                    gap={3}
                  >
                    <Box
                      p={2.5}
                      borderRadius="md"
                      bg={isDark ? "rgba(255, 255, 255, 0.04)" : "white"}
                      border="1px solid"
                      borderColor={isDark ? "whiteAlpha.100" : "purple.100"}
                    >
                      <Text fontSize="2xs" fontWeight={600} color={isDark ? "gray.400" : "gray.500"} textTransform="uppercase" mb={0.5}>
                        Project ID
                      </Text>
                      <Text fontSize="xs" fontFamily="mono" fontWeight={700} color={isDark ? "white" : "gray.800"} isTruncated title={selectedProject?.id}>
                        {selectedProject?.id || "-"}
                      </Text>
                    </Box>

                    <Box
                      p={2.5}
                      borderRadius="md"
                      bg={isDark ? "rgba(255, 255, 255, 0.04)" : "white"}
                      border="1px solid"
                      borderColor={isDark ? "whiteAlpha.100" : "purple.100"}
                    >
                      <Text fontSize="2xs" fontWeight={600} color={isDark ? "gray.400" : "gray.500"} textTransform="uppercase" mb={0.5}>
                        Project Name
                      </Text>
                      <Text fontSize="xs" fontWeight={700} color={isDark ? "white" : "gray.800"} isTruncated title={selectedProject?.projectName || projectData?.projectName}>
                        {selectedProject?.projectName || projectData?.projectName || "-"}
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                <Grid templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap={5} alignItems="start">
                  {/* Left: JSON Input — IDE chrome, editable, syntax-highlighted overlay */}
                  <GridItem>
                    <Text fontSize="sm" fontWeight="bold" mb={2} color={isDark ? "white" : "gray.900"}>
                      JSON Input *
                    </Text>

                    <Box
                      borderRadius={radiusStyle}
                      border="1px solid"
                      borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                      overflow="hidden"
                      bg={isDark ? "#0d1117" : "#f6f8fa"}
                      _focusWithin={{ borderColor: "purple.400", boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)" }}
                    >
                      {/* IDE title bar */}
                      <HStack
                        px={3}
                        py={2}
                        spacing={2}
                        bg={isDark ? "#161b22" : "#eaeef2"}
                        borderBottom="1px solid"
                        borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                      >
                        <HStack spacing={1.5}>
                          <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" />
                          <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" />
                          <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" />
                        </HStack>
                        <Text fontSize="xs" fontFamily="mono" color={isDark ? "gray.300" : "gray.600"}>
                          bulk-import.json
                        </Text>
                      </HStack>

                      {/* Line-numbered editable body with syntax-highlighted overlay */}
                      <HStack spacing={0} align="stretch" h="450px">
                        <VStack
                          ref={jsonGutterRef}
                          spacing={0}
                          align="end"
                          py={3}
                          px={2.5}
                          bg={isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"}
                          borderRight="1px solid"
                          borderColor={isDark ? "whiteAlpha.50" : "gray.200"}
                          flexShrink={0}
                          overflow="hidden"
                        >
                          {Array.from({
                            length: Math.max(jsonImportText.split("\n").length, 25),
                          }).map((_, i) => (
                            <Text
                              key={i}
                              fontFamily="mono"
                              fontSize="xs"
                              lineHeight="1.7"
                              color={isDark ? "whiteAlpha.400" : "gray.400"}
                              userSelect="none"
                            >
                              {i + 1}
                            </Text>
                          ))}
                        </VStack>

                        <Box position="relative" flex={1} h="full" overflow="hidden">
                          {/* Highlighted render layer (visual only, scroll synced to textarea) */}
                          <Box
                            ref={jsonHighlightRef}
                            as="pre"
                            position="absolute"
                            inset={0}
                            fontFamily="mono"
                            fontSize="xs"
                            lineHeight="1.7"
                            py={3}
                            px={3.5}
                            m={0}
                            overflow="hidden"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                            pointerEvents="none"
                          >
                            {jsonImportText
                              ? jsonImportText.split("\n").map((line, i) => (
                                <Box as="div" key={i}>
                                  {renderHighlightedJson(line, i)}
                                  {"\n"}
                                </Box>
                              ))
                              : null}
                          </Box>

                          {/* Real editable textarea, text made transparent so the
                              highlighted layer beneath shows through while typing */}
                          <Textarea
                            value={jsonImportText}
                            onChange={(e) => setJsonImportText(e.target.value)}
                            placeholder="// Paste your task array here, or use the example on the right"
                            position="relative"
                            h="full"
                            fontFamily="mono"
                            fontSize="xs"
                            lineHeight="1.7"
                            border="none"
                            borderRadius={0}
                            bg="transparent"
                            color="transparent"
                            sx={{ caretColor: isDark ? "#c9d1d9" : "#24292f" }}
                            _placeholder={{ color: isDark ? "whiteAlpha.300" : "gray.400" }}
                            _focus={{ boxShadow: "none" }}
                            resize="none"
                            spellCheck={false}
                            py={3}
                            px={3.5}
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                            overflowY="auto"
                            onScroll={(e) => {
                              const target = e.currentTarget;
                              if (jsonHighlightRef.current) {
                                jsonHighlightRef.current.scrollTop = target.scrollTop;
                                jsonHighlightRef.current.scrollLeft = target.scrollLeft;
                              }
                              if (jsonGutterRef.current) {
                                jsonGutterRef.current.scrollTop = target.scrollTop;
                              }
                            }}
                          />
                        </Box>
                      </HStack>
                    </Box>
                  </GridItem>

                  {/* Right: Example — collapsible accordion, read-only, syntax-highlighted */}
                  <GridItem>
                    <Text fontSize="sm" fontWeight="bold" mb={2} color="transparent" userSelect="none" aria-hidden>
                      .
                    </Text>
                    <Accordion allowToggle defaultIndex={0}>
                      <AccordionItem
                        border="1px solid"
                        borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                        borderRadius={radiusStyle}
                        overflow="hidden"
                      >
                        <AccordionButton
                          px={3}
                          py={2}
                          bg={isDark ? "#161b22" : "#eaeef2"}
                          _hover={{ bg: isDark ? "#1c2128" : "#dde3e9" }}
                        >
                          <HStack flex={1} justify="space-between">
                            <HStack spacing={2} align="center">
                              <Text fontSize="xs" fontWeight="medium" color={isDark ? "gray.300" : "gray.700"}>
                                Example
                              </Text>
                            </HStack>
                            <Button
                              size="xs"
                              variant="ghost"
                              color="purple.400"
                              leftIcon={<FiCornerDownLeft size={11} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setJsonImportText(jsonImportTasksOnlyExample);
                              }}
                            >
                              Use example (Tasks only)
                            </Button>
                          </HStack>
                          <AccordionIcon ml={2} />
                        </AccordionButton>
                        <AccordionPanel p={0} bg={isDark ? "#0d1117" : "#f6f8fa"}>
                          {/* IDE title bar */}
                          <HStack
                            px={3}
                            py={2}
                            spacing={2}
                            borderBottom="1px solid"
                            borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                          >
                            <HStack spacing={1.5}>
                              <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" />
                              <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" />
                              <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" />
                            </HStack>
                            <HStack spacing={1.5} align="center">
                              <Icon as={FiLock} color="purple.400" boxSize="11px" />
                              <Text fontSize="xs" fontFamily="mono" color={isDark ? "gray.300" : "gray.600"}>
                                example.json (Header locked from active project)
                              </Text>
                            </HStack>
                          </HStack>

                          {/* Line-numbered, syntax-highlighted code body — height matches input */}
                          <HStack spacing={0} align="stretch" h="450px">
                            <VStack
                              spacing={0}
                              align="end"
                              py={3}
                              px={2.5}
                              bg={isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"}
                              borderRight="1px solid"
                              borderColor={isDark ? "whiteAlpha.50" : "gray.200"}
                              flexShrink={0}
                              overflow="hidden"
                            >
                              {jsonImportExample.split("\n").map((_, i) => (
                                <Text
                                  key={i}
                                  fontFamily="mono"
                                  fontSize="xs"
                                  lineHeight="1.7"
                                  color={isDark ? "whiteAlpha.400" : "gray.400"}
                                  userSelect="none"
                                >
                                  {i + 1}
                                </Text>
                              ))}
                            </VStack>
                            <Box
                              as="pre"
                              fontFamily="mono"
                              fontSize="xs"
                              lineHeight="1.7"
                              py={3}
                              px={3.5}
                              m={0}
                              overflow="auto"
                              whiteSpace="pre"
                              flex={1}
                            >
                              {jsonImportExample.split("\n").map((line, i) => (
                                <Box as="div" key={i}>
                                  {renderHighlightedJson(line, i)}
                                </Box>
                              ))}
                            </Box>
                          </HStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </GridItem>
                </Grid>

                {jsonImportError && (
                  <Alert status="error" borderRadius={radiusStyle} fontSize="xs">
                    <AlertIcon />
                    <AlertDescription>{jsonImportError}</AlertDescription>
                  </Alert>
                )}

                {jsonImportResult && (
                  <Alert
                    status={jsonImportResult.failed === 0 ? "success" : "warning"}
                    borderRadius={radiusStyle}
                    fontSize="xs"
                  >
                    <AlertIcon />
                    <AlertDescription>
                      {jsonImportResult.success} task(s) imported successfully
                      {jsonImportResult.failed > 0
                        ? `, ${jsonImportResult.failed} failed (check boardName matches an existing board)`
                        : ""}
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"}>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onJsonImportClose();
                  setJsonImportError("");
                  setJsonImportResult(null);
                }}
                borderRadius={radiusStyle}
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleImportJsonTasks}
                isLoading={isImportingJson}
                isDisabled={!jsonImportText.trim()}
                borderRadius={radiusStyle}
                leftIcon={<FiCode />}
              >
                Import Tasks
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Change Project Modal — pick another assigned project */}
        <Modal
          isOpen={isChangeProjectOpen}
          onClose={onChangeProjectClose}
          size="2xl"
          isCentered
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
          <ModalContent
            bg={isDark ? "gray.800" : "white"}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
            boxShadow="2xl"
          >
            <ModalHeader
              color={isDark ? "white" : "gray.800"}
              borderBottom="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={4}
            >
              <HStack spacing={2}>
                <Icon as={FiFolder} color="purple.400" />
                <Text>Change Project</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                  Select a project assigned to you to switch its Kanban workspace.
                </Text>

                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <FiSearch size={14} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search project name, code, or team..."
                    value={initSearch}
                    onChange={(e) => setInitSearch(e.target.value)}
                    borderRadius={radiusStyle}
                    fontSize="xs"
                    bg={isDark ? "gray.700" : "white"}
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    focusBorderColor="purple.400"
                  />
                </InputGroup>

                <Box maxH="420px" overflowY="auto" px={0.5}>
                  {isLoadingInitProjects ? (
                    <Flex justify="center" py={10} direction="column" align="center" gap={2}>
                      <Spinner size="md" color="purple.400" thickness="2.5px" />
                      <Text fontSize="xs" color="gray.500">
                        Loading assigned projects...
                      </Text>
                    </Flex>
                  ) : filteredInitProjects.length === 0 ? (
                    <Flex justify="center" py={10} direction="column" align="center" gap={2}>
                      <Icon as={FiInbox} boxSize={7} color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        {initSearch ? "No matching projects found" : "No projects assigned"}
                      </Text>
                    </Flex>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      {filteredInitProjects.map((proj) => {
                        const isCurrent = proj.id === selectedProject?.id;
                        const statusColor =
                          proj.projectStatus === "RUNNING"
                            ? "green"
                            : proj.projectStatus === "INITIATING"
                              ? "purple"
                              : "pink";
                        const monogram = (proj.projectName || "PR")
                          .trim()
                          .substring(0, 2)
                          .toUpperCase();
                        return (
                          <Box
                            key={proj.id}
                            as="button"
                            type="button"
                            w="full"
                            textAlign="left"
                            borderRadius={radiusStyle}
                            overflow="hidden"
                            position="relative"
                            border="1px solid"
                            borderColor={
                              isCurrent
                                ? "purple.400"
                                : isDark
                                  ? "whiteAlpha.100"
                                  : "gray.200"
                            }
                            bg={
                              isCurrent
                                ? isDark
                                  ? "rgba(139, 92, 246, 0.1)"
                                  : "purple.50"
                                : isDark
                                  ? "rgba(255, 255, 255, 0.02)"
                                  : "white"
                            }
                            _hover={{
                              borderColor: "purple.400",
                              transform: "translateY(-2px)",
                              boxShadow: isDark
                                ? "0 8px 20px -6px rgba(139, 92, 246, 0.3)"
                                : "0 8px 20px -6px rgba(139, 92, 246, 0.2)",
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.18s cubic-bezier(0.4, 0, 0.2, 1)"
                            onClick={() => {
                              if (isCurrent) return;
                              handleSelectInitProject(proj);
                              onChangeProjectClose();
                            }}
                          >
                            {/* Status accent bar */}
                            <Box h="3px" bg={`${statusColor}.400`} />

                            <Box p={3.5}>
                              <VStack align="stretch" spacing={2.5}>
                                <HStack justify="space-between" align="start">
                                  <Flex
                                    w="38px"
                                    h="38px"
                                    borderRadius={radiusStyle}
                                    align="center"
                                    justify="center"
                                    flexShrink={0}
                                    fontWeight={700}
                                    fontSize="sm"
                                    color="white"
                                    bg="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                                    boxShadow="0 4px 12px rgba(139, 92, 246, 0.3)"
                                  >
                                    {monogram}
                                  </Flex>
                                  {isCurrent ? (
                                    <Badge colorScheme="purple" variant="solid" fontSize="3xs" rounded="full" px={2}>
                                      Current
                                    </Badge>
                                  ) : (
                                    <Badge
                                      colorScheme={statusColor}
                                      variant="subtle"
                                      fontSize="3xs"
                                      rounded="full"
                                      px={2}
                                      textTransform="uppercase"
                                    >
                                      {proj.projectStatus || "ACTIVE"}
                                    </Badge>
                                  )}
                                </HStack>

                                <Box>
                                  <Text
                                    fontSize="sm"
                                    fontWeight={700}
                                    noOfLines={1}
                                    color={isDark ? "white" : "gray.900"}
                                  >
                                    {proj.projectName}
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.500" : "gray.500"}
                                    noOfLines={1}
                                    mt={0.5}
                                  >
                                    #{proj.projectNo || "PROJ"}
                                  </Text>
                                </Box>

                                <HStack
                                  spacing={2}
                                  pt={2}
                                  borderTop="1px solid"
                                  borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
                                  fontSize="2xs"
                                  color={isDark ? "gray.400" : "gray.500"}
                                >
                                  <Icon as={FiTrello} boxSize={3} color="purple.400" />
                                  <Text noOfLines={1}>
                                    {proj.proManageByTeamName || "Dev Team"}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Assign Task Modal matching /workspace/project?projectId= */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={onAssignModalClose}
          size="4xl"
          isCentered
          closeOnOverlayClick={false}
        >
          <ModalOverlay
            backdropFilter="blur(10px)"
            bg={isDark ? "rgba(0, 0, 0, 0.65)" : "rgba(0, 0, 0, 0.4)"}
          />
          <ModalContent
            rounded={radiusStyle}
            bg={isDark ? "gray.900" : "white"}
            border="1px solid"
            borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
            boxShadow="2xl"
          >
            <ModalHeader
              borderBottom="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={4}
              pr={12}
            >
              <HStack spacing={2.5} align="center">
                <Icon as={FiUsers} color="blue.400" />
                <Text fontSize="md" fontWeight={700}>
                  Assign Task
                </Text>
                <Badge
                  colorScheme="blue"
                  fontSize="xs"
                  px={2.5}
                  py={0.5}
                  rounded="full"
                >
                  {choosedMemberProjects.length} Selected
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton top={3.5} right={4} />
            <ModalBody py={5} overflow="visible">
              <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">
                {/* Left Column: Project Members */}
                <GridItem colSpan={{ base: 12, md: 6 }} w="full">
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text
                        fontWeight="semibold"
                        fontSize="xs"
                        color="gray.500"
                        textTransform="uppercase"
                        mb={2}
                      >
                        Project Members
                      </Text>
                      <Input
                        placeholder="Search by name, NIP, or email..."
                        value={searchUserAssign}
                        onChange={(e) =>
                          handleSearchUserAssign(e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                        bg={isDark ? "gray.800" : "gray.50"}
                      />
                    </Box>

                    {/* Search Results */}
                    <Box h="360px" overflowY="auto" overflowX="hidden" pr={1}>
                      {dataUsers.length > 0 ? (
                        <VStack spacing={2} w="full" align="stretch" pb={2}>
                          {dataUsers.map((user) => {
                            const isAlreadyAssigned =
                              choosedMemberProjects.some(
                                (assignedUser) =>
                                  assignedUser.id === user.id ||
                                  assignedUser.userId === user.userId
                              );
                            return (
                              <HStack
                                key={user.id || user.userId}
                                p={2.5}
                                border="1px solid"
                                borderColor={
                                  isDark ? "whiteAlpha.100" : "gray.200"
                                }
                                borderRadius="md"
                                justify="space-between"
                                bg={
                                  isAlreadyAssigned
                                    ? isDark
                                      ? "rgba(59, 130, 246, 0.08)"
                                      : "blue.50"
                                    : isDark
                                    ? "gray.800"
                                    : "white"
                                }
                              >
                                <HStack spacing={3}>
                                  <Avatar
                                    size="sm"
                                    name={user.nama}
                                    src={user.profilePict || undefined}
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {user.nama}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {user.jabatan || user.nip || user.email}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <IconButton
                                  isRound
                                  variant="ghost"
                                  colorScheme="blue"
                                  aria-label="Add"
                                  icon={<FiPlus />}
                                  size="xs"
                                  isDisabled={isAlreadyAssigned}
                                  onClick={() => handleAddUserAssign(user)}
                                />
                              </HStack>
                            );
                          })}
                        </VStack>
                      ) : (
                        <Flex justify="center" align="center" h="full">
                          <Text
                            color="gray.500"
                            fontSize="sm"
                            textAlign="center"
                          >
                            No members found
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </VStack>
                </GridItem>

                {/* Right Column: Selected Users */}
                <GridItem colSpan={{ base: 12, md: 6 }} w="full">
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text
                          fontWeight="semibold"
                          fontSize="xs"
                          color="gray.500"
                          textTransform="uppercase"
                        >
                          Selected Users ({choosedMemberProjects.length})
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiUsers size={12} />}
                          onClick={handleAssignMe}
                          isDisabled={
                            !currentAuthUser ||
                            choosedMemberProjects.some(
                              (user) =>
                                user.id === currentAuthUser?.id ||
                                user.userId === currentAuthUser?.userId
                            )
                          }
                        >
                          Assign Me
                        </Button>
                      </HStack>

                      <Box
                        h="360px"
                        overflowY="auto"
                        overflowX="hidden"
                        pr={1}
                      >
                        {choosedMemberProjects.length > 0 ? (
                          <VStack spacing={2} align="stretch">
                            {choosedMemberProjects.map((user) => (
                              <HStack
                                key={user.id || user.userId}
                                p={2.5}
                                border="1px solid"
                                borderColor={isDark ? "blue.700" : "blue.200"}
                                borderRadius="md"
                                justify="space-between"
                                bg={
                                  isDark
                                    ? "rgba(59, 130, 246, 0.12)"
                                    : "blue.50"
                                }
                              >
                                <HStack spacing={3}>
                                  <Avatar
                                    size="sm"
                                    name={user.nama}
                                    src={user.profilePict || undefined}
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {user.nama}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {user.jabatan || user.nip || user.email}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <IconButton
                                  isRound
                                  variant="ghost"
                                  colorScheme="red"
                                  aria-label="Remove"
                                  icon={<FiX />}
                                  size="xs"
                                  onClick={() =>
                                    handleRemoveUserAssign(
                                      user.id || user.userId
                                    )
                                  }
                                />
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Flex justify="center" align="center" h="full">
                            <Text
                              color="gray.500"
                              fontSize="sm"
                              textAlign="center"
                            >
                              No users selected yet
                            </Text>
                          </Flex>
                        )}
                      </Box>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </ModalBody>
            <ModalFooter
              borderTop="1px solid"
              borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
              py={3}
            >
              <HStack spacing={2}>
                <Button size="sm" variant="ghost" onClick={onAssignModalClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSaveAssignedUsers}
                  isLoading={isSavingAssignments}
                >
                  Save Assignments
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DndProvider>
  );
}
