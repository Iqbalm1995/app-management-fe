"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdminWorkspace from "@/app/components/layoutAdminWorkspace";
import {
  boardDoneLabel,
  boardInProgressLabel,
  boardInReview,
  boardToDoLabel,
  MAX_SIZE_TABLE,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  AUTO_SAVE_DELAY,
  TASK_BOARD_STATUS_CODE_DONE,
  TASK_BOARD_STATUS_CODE_INPROGRESS,
  TASK_BOARD_STATUS_CODE_REVIEW,
  TASK_BOARD_STATUS_CODE_TODO,
  TASK_BOARD_STATUS_NAME_TODO,
  TASK_BOARD_STATUS_NAME_DONE,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import { generateUUIDV1 } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { AuthDataModelInterface } from "@/app/context/AuthContext";

import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
import useMasterBoardTask, {
  MasterBoardTaskResponse,
} from "@/app/services/useMasterBoardTask";
import useTasks, {
  CreateSimpleTaskPayload,
  TaskCreatePayload,
  TaskBoardViewModel,
  TaskMovePayload,
  TaskUpdatePayload,
  TaskViewModel,
  TaskItemCreatePayload,
  TaskItemUpdatePayload,
  TaskItemResponse,
  TaskArchivePayload,
  TaskCommentResponse,
  TaskCommentInsertPayload,
  TaskCommentUpdatePayload,
  TaskActivityResponse,
  AssignUsersTaskPayload,
  GenerateTaskBoardPayload,
  TaskRelatedPayload,
  TasksBulkCreatePayload,
  TaskBulkItemPayload,
} from "@/app/services/useTasks";
import {
  PaggingListPayload,
  PaggingListPayloadCustom,
  ListSearchByParam,
} from "@/app/types/masterTypes";
import { DateTimeInput, DateTimeRangeInput } from "@/app/components/dateInputs";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Stack,
  StackDivider,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
  Checkbox,
  InputRightElement,
  Icon,
  ButtonGroup,
  InputLeftElement,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { setIn } from "formik";
import {
  FaCommentDots,
  FaEllipsisVertical,
  FaGripVertical,
  FaPlus,
  FaUsers,
  FaTrash,
} from "react-icons/fa6";
import { FaSync, FaEdit, FaArchive, FaCog, FaPills } from "react-icons/fa";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArchive,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronDown,
  FiChevronRight,
  FiCircle,
  FiClock,
  FiCode,
  FiCopy,
  FiCornerDownLeft,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFilter,
  FiFlag,
  FiFolder,
  FiHash,
  FiInbox,
  FiLink,
  FiLoader,
  FiList,
  FiLock,
  FiMessageSquare,
  FiNavigation,
  FiPackage,
  FiPaperclip,
  FiPlay,
  FiPlus,
  FiPlusCircle,
  FiRefreshCcw,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiSettings,
  FiShare2,
  FiSquare,
  FiTrash2,
  FiTrello,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { HorizontalFadeDivider } from "@/app/components/divider";
import {
  convertToCustomDateFormat,
  truncateText,
} from "@/app/helper/MasterHelper";
import { LuGrip } from "react-icons/lu";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useUsers, {
  UserShortResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { GoFilter } from "react-icons/go";
import { MdOutlineSort } from "react-icons/md";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { Select as ChakraReactSelect } from "chakra-react-select";

// Complete auth data structure interfaces
interface AuthTokenResponse {
  apiKey: string;
  expiration: string;
}

interface CompleteAuthDataResponse {
  dataLogin: AuthDataResponse;
  dataAuth: AuthTokenResponse;
  statusLogin: string;
}

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Workspace",
  breadCrumb: ["Home", "Workspace", "Project"],
};

const ItemTypes = {
  TASK: "task",
};

const formatDateDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Define custom window interface to add our global variables
declare global {
  interface Window {
    projectKanbanBoards?: MasterBoardTaskResponse[];
    refreshProjectKanbanData?: () => void;
    moveProjectTaskFunction?: (
      taskId: string,
      boardId: string,
      index?: number,
    ) => Promise<boolean>;
  }
}

// Task Card Component with exact design from original kanban
interface TaskCardProps {
  task: TaskViewModel;
  onEdit: (task: TaskViewModel) => void;
  onDelete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskViewModel>) => void;
  onRefreshTasks: () => void;
  isRecentlyMoved?: boolean;
  DataProject?: ProjectDataResponse | null;
  DataBacklogs?: BacklogDataResponse[];
  isCompactView?: boolean;
}

const TaskCard = React.memo<TaskCardProps>(({
  task,
  onEdit,
  onDelete,
  onUpdateTask,
  onRefreshTasks,
  isRecentlyMoved = false,
  DataProject,
  DataBacklogs = [],
  isCompactView = false,
}) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const dragRef = useRef<HTMLDivElement>(null);

  // SetUp auth data
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id, boardName: task.boardName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Complete modal structure from original DraggableTaskCard
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detailedTask, setDetailedTask] = useState<TaskViewModel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [taskBoards, setTaskBoards] = useState<TaskBoardViewModel[]>([]);
  const [newTaskItemName, setNewTaskItemName] = useState("");
  const [isAddingTaskItem, setIsAddingTaskItem] = useState(false);
  const [taskItems, setTaskItems] = useState<TaskItemResponse[]>([]);
  const [isLoadingTaskItems, setIsLoadingTaskItems] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  // States for inline editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Task item inline editing
  const [editingTaskItemId, setEditingTaskItemId] = useState<string | null>(
    null,
  );
  const [editedTaskItemName, setEditedTaskItemName] = useState("");
  const taskItemInputRef = useRef<HTMLInputElement>(null);

  // Comments state management
  const [taskComments, setTaskComments] = useState<TaskCommentResponse[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);

  // Add comment state
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  // State for saving assignments
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const commentsPageSize = 5;

  // Delete comment state
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  // User assignment states and handlers
  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);

  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();

  const { List: ListUsers } = useUsers();

  // Get user data for assignment
  const GetDataUser = async (
    searchValue: string,
    limit: number = 3,
  ): Promise<UsersResponse[]> => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const requestData = await ListUsers(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      return [];
    } else {
      if (requestData.data == null) {
        return [];
      }
      const itemsData: UsersResponse[] = requestData.data as UsersResponse[];
      return itemsData;
    }
  };

  const handleSearchUserAssign = async (textSearch: string) => {
    setSearchUserInput(textSearch);

    const projectMembers =
      DataProject?.userAssignment?.map((assignment) => assignment.userData) ||
      [];

    if (textSearch.length > 0) {
      const filtered = projectMembers.filter(
        (user) =>
          user.nama.toLowerCase().includes(textSearch.toLowerCase()) ||
          user.nip?.toLowerCase().includes(textSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(textSearch.toLowerCase()),
      );
      setDataUsers(filtered);
    } else {
      setDataUsers(projectMembers);
    }
  };

  const handleAddUserAssign = (data: UsersResponse) => {
    setChoosedMemberProjects([...ChoosedMemberProjects, data]);
  };

  const handleRemoveUserAssign = (id: string) => {
    const updatedProjects = ChoosedMemberProjects.filter(
      (project) => project.id !== id,
    );
    setChoosedMemberProjects(updatedProjects);
  };

  const handleAssignMe = () => {
    if (!DataAuth) return;

    const isAlreadyAssigned = ChoosedMemberProjects.find(
      (user) => user.id === DataAuth.id,
    );

    if (isAlreadyAssigned) return;

    const currentUserAsUsersResponse: UsersResponse = {
      id: DataAuth.id,
      nrp: DataAuth.nrp || "",
      nama: DataAuth.nama,
      nip: DataAuth.nip || "",
      userId: DataAuth.userId,
      kodeCabang: DataAuth.kodeCabang,
      namaCabang: DataAuth.namaCabang,
      kodeInduk: DataAuth.kodeInduk,
      namaInduk: DataAuth.namaInduk,
      kodeKanwil: DataAuth.kodeKanwil,
      namaKanwil: DataAuth.namaKanwil,
      jabatan: DataAuth.jabatan,
      email: DataAuth.email,
      idFungsi: DataAuth.idFungsi,
      namaFungsi: DataAuth.namaFungsi,
      kodePenempatan: DataAuth.kodePenempatan,
      namaPenempatan: DataAuth.namaPenempatan,
      idUim: DataAuth.idUim,
      costCentre: DataAuth.costCentre,
      isApproval: DataAuth.isApproval,
      kodeUnitKerja: DataAuth.kodeUnitKerja,
      namaUnitKerja: DataAuth.namaUnitKerja,
      kodeJabatan: DataAuth.kodeJabatan,
      phoneNumber: DataAuth.userPhoneNumber,
      userStatus: DataAuth.isActive,
      profilePict: DataAuth.profilePict,
      kodeGroupKerja: null,
      namaGroupKerja: null,
      lastSync: null,
      createdAt: new Date().toISOString(),
      createdBy: DataAuth.userId,
      updatedAt: null,
      updatedBy: null,
      team: null,
      teamRole: null,
    };

    setChoosedMemberProjects([
      ...ChoosedMemberProjects,
      currentUserAsUsersResponse,
    ]);
  };

  // Handle saving assigned users
  const handleSaveAssignedUsers = async () => {
    if (!detailedTask) {
      showToast({
        description: "No task selected",
        statusToast: "error",
      });
      return;
    }

    setIsSavingAssignments(true);

    try {
      const assignPayload: AssignUsersTaskPayload = {
        taskId: detailedTask.id,
        usersData: ChoosedMemberProjects.map((user) => ({
          userId: user.userId,
        })),
      };

      const response = await AssignUsersTask(assignPayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Users assigned successfully",
          statusToast: "success",
        });

        // Update the detailed task with new assigned users
        if (detailedTask) {
          const updatedAssignUsers = ChoosedMemberProjects.map((user) => ({
            id: user.id,
            nrp: user.nrp,
            nama: user.nama,
            nip: user.nip,
            userId: user.userId,
            jabatan: user.jabatan,
            email: user.email,
            kodeUnitKerja: user.kodeUnitKerja,
            namaUnitKerja: user.namaUnitKerja,
            kodeJabatan: user.kodeJabatan,
            profilePict: user.profilePict,
          }));

          setDetailedTask({
            ...detailedTask,
            assignUsers: updatedAssignUsers,
          });
        }

        onAssignModalClose();
        if (detailedTask?.id) {
          fetchTaskActivities(detailedTask.id);
        }
      } else {
        showToast({
          description: response?.message || "Failed to assign users",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error assigning users:", error);
      showToast({
        description: "An error occurred while assigning users",
        statusToast: "error",
      });
    } finally {
      setIsSavingAssignments(false);
    }
  };

  // Handle updating task dates
  const updateTaskDates = async (
    startDate: string | null,
    endDate: string | null,
  ) => {
    if (!detailedTask) return;

    const normalizedStartDate = startDate === undefined ? null : startDate;
    const normalizedEndDate = endDate === undefined ? null : endDate;

    setIsLoadingDetails(true);
    try {
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      if (normalizedStartDate) updatePayload.startDate = normalizedStartDate;
      if (normalizedEndDate) updatePayload.endDate = normalizedEndDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({
          ...detailedTask,
          startDate: normalizedStartDate,
          endDate: normalizedEndDate,
        });

        showToast({
          description: "Task dates updated successfully",
          statusToast: "success",
        });

        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to update task dates",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task dates:", error);
      showToast({
        description: "An error occurred while updating task dates",
        statusToast: "error",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("tokenData") as string;

  // Handle click on the card - exact copy from original
  const handleCardClick = async (e?: React.MouseEvent) => {
    // Prevent click from triggering during drag operations
    if (!isDragging) {
      setIsLoadingDetails(true);
      try {
        // Fetch the latest task details
        const response = await GetTaskDetail(task.id, getToken());

        if (response?.statusCode === RES_CODE_OK && response.data) {
          setDetailedTask(response.data);

          // Populate ChoosedMemberProjects with current assignUsers
          if (
            response.data.assignUsers &&
            response.data.assignUsers.length > 0
          ) {
            const assignedUsers: UsersResponse[] =
              response.data.assignUsers.map((user) => ({
                id: user.id,
                nrp: user.nrp,
                nama: user.nama,
                nip: user.nip,
                userId: user.userId,
                kodeCabang: null,
                namaCabang: null,
                kodeInduk: null,
                namaInduk: null,
                kodeKanwil: null,
                namaKanwil: null,
                jabatan: user.jabatan,
                email: user.email,
                idFungsi: null,
                namaFungsi: null,
                kodePenempatan: null,
                namaPenempatan: null,
                idUim: null,
                costCentre: null,
                isApproval: null,
                kodeUnitKerja: user.kodeUnitKerja,
                namaUnitKerja: user.namaUnitKerja,
                kodeJabatan: user.kodeJabatan,
                phoneNumber: null,
                userStatus: "1", // Default active status
                profilePict: user.profilePict,
                lastSync: null,
                createdAt: new Date().toISOString(), // Default current date
                createdBy: "system", // Default value
                updatedAt: null,
                updatedBy: null,
                team: null,
                teamRole: null,
              }));
            setChoosedMemberProjects(assignedUsers);
          } else {
            setChoosedMemberProjects([]);
          }

          // Fetch task items
          fetchTaskItems(task.id);

          // Fetch task boards for board selection
          if (response.data.backlogId) {
            fetchTaskBoards(response.data.backlogId);
          }

          // Reset and load comments
          resetCommentsState();
          loadTaskComments(task.id);
        } else {
          // If API call fails, use the current task data
          setDetailedTask(task);
          showToast({
            description: "Could not fetch latest task details",
            statusToast: "warning",
          });
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        // Fallback to current task data
        setDetailedTask(task);
      } finally {
        setIsLoadingDetails(false);
        onOpen();
      }
    }
  };

  // Auto-open detail modal if this task matches taskId in URL searchParams
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    const taskIdFromUrl = searchParams.get("taskId");
    if (taskIdFromUrl && task.id === taskIdFromUrl && !hasAutoOpened && !isOpen) {
      setHasAutoOpened(true);
      handleCardClick();
    }
  }, [searchParams, task.id, hasAutoOpened, isOpen]);

  // Apply the drag ref to the div ref
  drag(dragRef);

  // Complete handler functions from original DraggableTaskCard
  const {
    GetTaskDetail,
    UpdateTask,
    CreateTaskItem,
    UpdateTaskItem,
    DeleteTaskItem,
    ListTaskItems,
    ArchiveTask,
    ListTaskCommentsPaged,
    CreateTaskComment,
    UpdateTaskComment,
    DeleteTaskComment,
    ListTaskActivitiesPaged,
    AssignUsersTask,
    MoveTask,
    ListTasksBoard,
    ListRelatedTasks,
    AssignRelatedTasks,
    ListTasksPaged,
  } = useTasks();

  // Task activities state
  const [taskActivities, setTaskActivities] = useState<TaskActivityResponse[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [totalActivitiesCount, setTotalActivitiesCount] = useState(0);

  // Related tasks state
  const [relatedTasks, setRelatedTasks] = useState<TaskViewModel[]>([]);
  const [searchTasksResults, setSearchTasksResults] = useState<TaskViewModel[]>(
    [],
  );
  const [searchTaskTerm, setSearchTaskTerm] = useState("");
  const [isLoadingRelatedTasks, setIsLoadingRelatedTasks] = useState(false);
  const {
    isOpen: isTaskPickerOpen,
    onOpen: onTaskPickerOpen,
    onClose: onTaskPickerClose,
  } = useDisclosure();

  // Helper functions for current user
  const getCurrentUser = () => DataAuth;
  const getCurrentUserName = () => DataAuth?.nama || "User";
  const getCurrentUserAvatar = () => DataAuth?.profilePict || "";

  // Fetch related tasks
  const fetchRelatedTasks = async (taskId: string) => {
    const token = getToken();
    if (!token) return;

    setIsLoadingRelatedTasks(true);
    try {
      const response = await ListRelatedTasks(taskId, token);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setRelatedTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching related tasks:", error);
    } finally {
      setIsLoadingRelatedTasks(false);
    }
  };

  // Fetch task activities (latest 5)
  const fetchTaskActivities = async (taskId: string) => {
    const token = getToken();
    if (!taskId || !token) return;

    setIsLoadingActivities(true);
    try {
      const payload: PaggingListPayloadCustom = {
        page: 0,
        limit: 5,
        search: "",
        filterWhere: [
          {
            field: "TaskId",
            operator: "=",
            value: taskId,
          },
        ],
        fieldOrder: ["CreatedAt"],
        orderDir: "desc",
      };

      const response = await ListTaskActivitiesPaged(payload, token);
      if (response && response.statusCode === RES_CODE_OK && response.data) {
        setTaskActivities(response.data);
        setTotalActivitiesCount(response.countTotal || response.data.length);
      } else {
        setTaskActivities([]);
        setTotalActivitiesCount(0);
      }
    } catch (error) {
      console.error("Error fetching task activities:", error);
      setTaskActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Search tasks for picker
  const handleSearchTasks = async () => {
    const token = getToken();
    if (!token || !searchTaskTerm || searchTaskTerm.length < 3) {
      setSearchTasksResults([]);
      return;
    }

    try {
      const payload: PaggingListPayload = {
        search: searchTaskTerm,
        limit: 5,
        page: 0,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const response = await ListTasksPaged(payload, token);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setSearchTasksResults(response.data);
      }
    } catch (error) {
      console.error("Error searching tasks:", error);
    }
  };

  // Auto-search when typing > 2 chars
  useEffect(() => {
    if (searchTaskTerm.length > 2) {
      const debounceTimer = setTimeout(() => {
        handleSearchTasks();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchTasksResults([]);
    }
  }, [searchTaskTerm]);

  // Add related task
  const handleAddRelatedTask = async (relatedTaskId: string) => {
    const token = getToken();
    if (!detailedTask || !token) return;

    try {
      const currentRelatedIds = relatedTasks.map((t) => t.id);
      const payload: TaskRelatedPayload = {
        taskParentId: detailedTask.id,
        tasksRelatedId: [...currentRelatedIds, relatedTaskId],
      };

      const response = await AssignRelatedTasks(payload, token);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Related task added successfully",
          statusToast: "success",
        });
        fetchRelatedTasks(detailedTask.id);
        fetchTaskActivities(detailedTask.id);
        onTaskPickerClose();
        setSearchTaskTerm("");
        setSearchTasksResults([]);
      } else {
        showToast({
          description: response?.message || "Failed to add related task",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error adding related task:", error);
      showToast({
        description: "An error occurred while adding related task",
        statusToast: "error",
      });
    }
  };

  // Remove related task
  const handleRemoveRelatedTask = async (relatedTaskId: string) => {
    const token = getToken();
    if (!detailedTask || !token) return;

    try {
      const updatedRelatedIds = relatedTasks
        .filter((t) => t.id !== relatedTaskId)
        .map((t) => t.id);

      const payload: TaskRelatedPayload = {
        taskParentId: detailedTask.id,
        tasksRelatedId: updatedRelatedIds,
      };

      const response = await AssignRelatedTasks(payload, token);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Related task removed successfully",
          statusToast: "success",
        });
        fetchRelatedTasks(detailedTask.id);
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to remove related task",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error removing related task:", error);
      showToast({
        description: "An error occurred while removing related task",
        statusToast: "error",
      });
    }
  };

  // Fetch related tasks and activities when task detail opens
  useEffect(() => {
    if (detailedTask?.id && isOpen) {
      fetchRelatedTasks(detailedTask.id);
      fetchTaskActivities(detailedTask.id);
    }
  }, [detailedTask?.id, isOpen]);

  // Handle starting to edit task name
  const handleEditName = () => {
    if (detailedTask) {
      setEditedName(detailedTask.taskName);
      setIsEditingName(true);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 0);
    }
  };

  // Handle starting to edit task description
  const handleEditDesc = () => {
    if (detailedTask) {
      setEditedDesc(detailedTask.taskDesc || "");
      setIsEditingDesc(true);
      setTimeout(() => {
        if (descTextareaRef.current) {
          descTextareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle saving task name
  const handleSaveName = async () => {
    // Validate empty name
    if (!editedName.trim()) {
      showToast({
        description: "Task name cannot be empty",
        statusToast: "warning",
      });
      setEditedName(detailedTask?.taskName || "");
      return;
    }

    if (!detailedTask || editedName.trim() === detailedTask.taskName) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: editedName.trim(),
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({ ...detailedTask, taskName: editedName.trim() });
        showToast({
          description: "Task name updated successfully",
          statusToast: "success",
        });
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to update task name",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task name:", error);
      showToast({
        description: "An error occurred while updating task name",
        statusToast: "error",
      });
    } finally {
      setIsSaving(false);
      setIsEditingName(false);
    }
  };

  // Handle saving task description
  const handleSaveDesc = async () => {
    if (!detailedTask || editedDesc === detailedTask.taskDesc) {
      setIsEditingDesc(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: editedDesc,
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({ ...detailedTask, taskDesc: editedDesc });
        showToast({
          description: "Task description updated successfully",
          statusToast: "success",
        });
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to update task description",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task description:", error);
      showToast({
        description: "An error occurred while updating task description",
        statusToast: "error",
      });
    } finally {
      setIsSaving(false);
      setIsEditingDesc(false);
    }
  };

  // Fetch task items for a task
  const fetchTaskItems = async (taskId: string) => {
    if (!taskId) return;

    setIsLoadingTaskItems(true);
    try {
      const response = await ListTaskItems(taskId, getToken());

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setTaskItems(response.data);
        updateTaskProgress(response.data);
      } else {
        console.error("Failed to fetch task items:", response?.message);
        setTaskItems([]);
      }
    } catch (error) {
      console.error("Error fetching task items:", error);
      setTaskItems([]);
    } finally {
      setIsLoadingTaskItems(false);
    }
  };

  // Fetch task boards for the task's backlog
  const fetchTaskBoards = async (backlogId: string) => {
    if (!backlogId) return;

    try {
      const response = await ListTasksBoard(backlogId, getToken());

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setTaskBoards(response.data as TaskBoardViewModel[]);
      } else {
        console.error("Failed to fetch task boards:", response?.message);
        setTaskBoards([]);
      }
    } catch (error) {
      console.error("Error fetching task boards:", error);
      setTaskBoards([]);
    }
  };

  // Calculate and update task progress based on completed task items
  const updateTaskProgress = async (items: TaskItemResponse[]) => {
    if (!detailedTask || items.length === 0) return;

    const totalItems = items.length;
    const completedItems = items.filter((item) => item.isDone === "Y").length;
    const progressPercentage = Math.round((completedItems / totalItems) * 100);

    if (progressPercentage === detailedTask.percentageStatus) return;

    try {
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
        percentageStatus: progressPercentage,
      };

      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({
          ...detailedTask,
          percentageStatus: progressPercentage,
        });
        console.log(`Task progress updated to ${progressPercentage}%`);
      } else {
        console.error("Failed to update task progress:", response?.message);
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
    }
  };

  // Handle toggling task item completion status
  const handleToggleTaskItem = async (itemId: string, newStatus: string) => {
    if (!detailedTask) return;

    setTogglingItemId(itemId);
    try {
      const taskItem = taskItems.find((item) => item.id === itemId);
      if (!taskItem) return;

      const updatePayload: TaskItemUpdatePayload = {
        id: itemId,
        taskItemName: taskItem.taskItemName,
        isDone: newStatus,
      };

      const response = await UpdateTaskItem(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        const updatedItems = taskItems.map((item) =>
          item.id === itemId ? { ...item, isDone: newStatus } : item,
        );
        setTaskItems(updatedItems);

        const completedCount = updatedItems.filter(
          (item) => item.isDone === "Y",
        ).length;
        const percentage =
          updatedItems.length > 0
            ? Math.round((completedCount / updatedItems.length) * 100)
            : 0;

        setDetailedTask((prev) =>
          prev ? { ...prev, percentageStatus: percentage } : null,
        );
        onUpdateTask(detailedTask.id, { percentageStatus: percentage });
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to update task item",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task item:", error);
      showToast({
        description: "An error occurred while updating task item",
        statusToast: "error",
      });
    } finally {
      setTogglingItemId(null);
    }
  };

  // Handle adding a new task item
  const handleAddTaskItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detailedTask || !newTaskItemName.trim()) return;

    setIsAddingTaskItem(true);
    try {
      const createPayload: TaskItemCreatePayload = {
        taskId: detailedTask.id,
        taskItemName: newTaskItemName.trim(),
      };

      const response = await CreateTaskItem(createPayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setNewTaskItemName("");
        fetchTaskItems(detailedTask.id);
        fetchTaskActivities(detailedTask.id);
        onRefreshTasks(); // Refresh tasks data
        showToast({
          description: "Task item added successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to add task item",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error adding task item:", error);
      showToast({
        description: "An error occurred while adding task item",
        statusToast: "error",
      });
    } finally {
      setIsAddingTaskItem(false);
    }
  };

  // Handle deleting a task item
  const handleDeleteTaskItem = async (itemId: string) => {
    if (!detailedTask) return;

    try {
      const response = await DeleteTaskItem(itemId, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setTaskItems((prevItems) => {
          const updatedItems = prevItems.filter((item) => item.id !== itemId);
          updateTaskProgress(updatedItems);
          return updatedItems;
        });

        onRefreshTasks(); // Refresh tasks data
        fetchTaskActivities(detailedTask.id);
        showToast({
          description: "Task item deleted successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to delete task item",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting task item:", error);
      showToast({
        description: "An error occurred while deleting task item",
        statusToast: "error",
      });
    }
  };

  // Handle starting to edit task item
  const handleStartEditTaskItem = (itemId: string, currentName: string) => {
    setEditedTaskItemName(currentName);
    setEditingTaskItemId(itemId);
    setTimeout(() => {
      if (taskItemInputRef.current) {
        taskItemInputRef.current.focus();
        taskItemInputRef.current.select();
      }
    }, 0);
  };

  // Handle saving task item
  const handleSaveTaskItem = async (itemId: string) => {
    if (!editedTaskItemName.trim()) {
      showToast({
        description: "Task item name cannot be empty",
        statusToast: "warning",
      });
      setEditingTaskItemId(null);
      return;
    }

    const taskItem = taskItems.find((item) => item.id === itemId);
    if (!taskItem || editedTaskItemName.trim() === taskItem.taskItemName) {
      setEditingTaskItemId(null);
      return;
    }

    setTogglingItemId(itemId);
    try {
      const updatePayload: TaskItemUpdatePayload = {
        id: itemId,
        taskItemName: editedTaskItemName.trim(),
        isDone: taskItem.isDone,
      };

      const response = await UpdateTaskItem(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setTaskItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? { ...item, taskItemName: editedTaskItemName.trim() }
              : item,
          ),
        );

        onRefreshTasks();
        if (detailedTask?.id) {
          fetchTaskActivities(detailedTask.id);
        }
        showToast({
          description: "Task item updated successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to update task item",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task item:", error);
      showToast({
        description: "An error occurred while updating task item",
        statusToast: "error",
      });
    } finally {
      setTogglingItemId(null);
      setEditingTaskItemId(null);
    }
  };

  // Handle canceling task item edit
  const handleCancelEditTaskItem = () => {
    setEditingTaskItemId(null);
    setEditedTaskItemName("");
  };

  // Handle keyboard shortcuts for task item edit
  const handleTaskItemKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTaskItem(itemId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEditTaskItem();
    }
  };

  // Load task comments with pagination
  const loadTaskComments = async (
    taskId: string,
    page: number = 0,
    append: boolean = false,
  ) => {
    if (!taskId) return;

    setIsLoadingComments(true);
    try {
      const token = getToken();
      const payload: PaggingListPayload = {
        page: page,
        limit: commentsPageSize,
        search: "",
        filterWhere: [{ field: "taskId", value: taskId, operator: "=" }],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const response = await ListTaskCommentsPaged(payload, token);

      if (
        response?.statusCode === RES_CODE_OK &&
        response.data &&
        Array.isArray(response.data)
      ) {
        const comments = response.data as TaskCommentResponse[];
        if (append) {
          setTaskComments((prev) => [...prev, ...comments]);
        } else {
          setTaskComments(comments);
        }

        setHasMoreComments(comments.length === commentsPageSize);

        if (!append) {
          setCommentsPage(page);
        }
      } else {
        if (!append) {
          setTaskComments([]);
        }
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error loading task comments:", error);
      if (!append) {
        setTaskComments([]);
      }
      setHasMoreComments(false);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Refresh comments for current task
  const refreshTaskComments = () => {
    if (detailedTask?.id) {
      loadTaskComments(detailedTask.id, 0, false);
    }
  };

  // Add new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detailedTask?.id || !newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const token = getToken();
      const payload: TaskCommentInsertPayload = {
        taskId: detailedTask.id,
        comCaptions: newComment.trim(),
      };

      const response = await CreateTaskComment(payload, token);

      if (response?.statusCode === RES_CODE_OK) {
        setNewComment("");
        refreshTaskComments();
        onRefreshTasks(); // Refresh tasks data
        fetchTaskActivities(detailedTask.id);
        showToast({
          description: "Comment added successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to add comment",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast({
        description: "An error occurred while adding comment",
        statusToast: "error",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  // Start editing a comment
  const handleStartEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  // Cancel editing a comment
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  // Update a comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editedCommentText.trim()) return;

    setIsUpdatingComment(true);
    try {
      const token = getToken();
      const payload: TaskCommentUpdatePayload = {
        id: commentId,
        comCaptions: editedCommentText.trim(),
      };

      const response = await UpdateTaskComment(payload, token);

      if (response?.statusCode === RES_CODE_OK) {
        setTaskComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, comCaptions: editedCommentText.trim() }
              : comment,
          ),
        );

        setEditingCommentId(null);
        setEditedCommentText("");

        onRefreshTasks(); // Refresh tasks data
        if (detailedTask?.id) {
          fetchTaskActivities(detailedTask.id);
        }
        showToast({
          description: "Comment updated successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to update comment",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast({
        description: "An error occurred while updating comment",
        statusToast: "error",
      });
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // Delete a comment with confirmation
  const handleDeleteComment = async (commentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingCommentId(commentId);
    try {
      const token = getToken();
      const response = await DeleteTaskComment(commentId, token);

      if (response?.statusCode === RES_CODE_OK) {
        setTaskComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        );

        onRefreshTasks(); // Refresh tasks data
        if (detailedTask?.id) {
          fetchTaskActivities(detailedTask.id);
        }
        showToast({
          description: "Comment deleted successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to delete comment",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast({
        description: "An error occurred while deleting comment",
        statusToast: "error",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Load more comments
  const loadMoreComments = async () => {
    if (!detailedTask?.id || isLoadingComments || !hasMoreComments) return;

    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    await loadTaskComments(detailedTask.id, nextPage, true);
  };

  // Reset comments state when modal opens
  const resetCommentsState = () => {
    setTaskComments([]);
    setCommentsPage(0);
    setHasMoreComments(true);
    setIsLoadingComments(false);
    setNewComment("");
    setIsAddingComment(false);
    setEditingCommentId(null);
    setEditedCommentText("");
    setIsUpdatingComment(false);
    setDeletingCommentId(null);
  };

  // Handle modal close cleanup
  const handleModalClose = () => {
    resetCommentsState();
    onClose();
  };

  // Handle key press events for inline editing
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSaveDesc();
    } else if (e.key === "Escape") {
      setIsEditingDesc(false);
    }
  };

  // Handle moving task to different board
  const handleMoveTaskToBoard = async (targetBoard: TaskBoardViewModel) => {
    if (!detailedTask) return;

    try {
      setIsLoadingDetails(true);

      const payload: TaskMovePayload = {
        id: detailedTask.id,
        boardId: targetBoard.id,
        indexTask: detailedTask.indexTask,
        indexStage: targetBoard.indexStage,
      };

      const response = await MoveTask(payload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({
          ...detailedTask,
          boardId: targetBoard.id,
          boardName: targetBoard.boardName,
        });

        showToast({
          description: `Task moved to ${targetBoard.boardName}`,
          statusToast: "success",
        });

        // Refresh tasks data
        onRefreshTasks();
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to move task",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error moving task:", error);
      showToast({
        description: "An error occurred while moving task",
        statusToast: "error",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateTaskPriority = async (priority: string) => {
    if (!detailedTask) return;

    try {
      setIsLoadingDetails(true);

      const updatePayload: any = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: priority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      if (detailedTask.startDate) updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({
          ...detailedTask,
          taskPriority: priority,
        });

        showToast({
          description: `Priority updated to ${priority}`,
          statusToast: "success",
        });

        onRefreshTasks();
        fetchTaskActivities(detailedTask.id);
      } else {
        showToast({
          description: response?.message || "Failed to update priority",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      showToast({
        description: "An error occurred while updating priority",
        statusToast: "error",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle archiving a task
  const handleArchiveTask = async (taskId: string) => {
    if (!taskId) return;

    setIsArchiving(true);

    try {
      const archivePayload: TaskArchivePayload = {
        taskId: taskId,
      };

      const response = await ArchiveTask(archivePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        const isArchived = detailedTask?.isArchived === "Y";
        showToast({
          description: isArchived
            ? "Task restored successfully"
            : "Task archived successfully",
          statusToast: "success",
        });

        handleModalClose();
        onRefreshTasks();
      } else {
        showToast({
          description: response?.message || "Failed to archive task",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      showToast({
        description: "An error occurred while archiving the task",
        statusToast: "error",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <div
        ref={dragRef}
        className="task-card"
        data-task-id={task.id}
        data-index={task.indexTask}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          position: "relative",
        }}
        onClick={handleCardClick}
      >
        <Card
          size="sm"
          variant="outline"
          boxShadow={isRecentlyMoved ? "lg" : "sm"}
          _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          bg={
            isRecentlyMoved
              ? "blue.50"
              : colorMode === "light"
                ? "white"
                : "gray.800"
          }
          borderColor={
            isRecentlyMoved
              ? "blue.300"
              : colorMode === "light"
                ? "gray.200"
                : "gray.600"
          }
          transition="all 0.3s ease"
          rounded={radiusStyle}
          mb={3}
          overflow="hidden"
        >
          {/* Priority Color Bar */}
          <Box
            h="3px"
            bg={
              task.taskPriority === "HIGH" || task.taskPriority === "CRITICAL"
                ? "red.400"
                : task.taskPriority === "MEDIUM"
                  ? "orange.400"
                  : "green.400"
            }
          />

          <CardBody px={4} py={isCompactView ? 2 : 3}>
            <VStack align="start" spacing={isCompactView ? 1 : 3}>
              {/* Header with Priority and Menu */}
              <HStack w="full" justify="space-between" align="start">
                <HStack spacing={2}>
                  <Badge
                    size="sm"
                    rounded="full"
                    px={3}
                    py={1}
                    colorScheme={
                      task.taskPriority === "HIGH" ||
                      task.taskPriority === "CRITICAL"
                        ? "red"
                        : task.taskPriority === "MEDIUM"
                          ? "orange"
                          : "green"
                    }
                    variant="subtle"
                  >
                    {task.taskPriority}
                  </Badge>
                  {isCompactView && (
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      #{task.id.slice(-6)}
                    </Text>
                  )}
                </HStack>

                <HStack spacing={2}>
                  {isCompactView && task.percentageStatus > 0 && (
                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                      {task.percentageStatus}%
                    </Text>
                  )}
                  {!isCompactView && (
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      #{task.id.slice(-6)}
                    </Text>
                  )}
                </HStack>
              </HStack>

              {/* Backlog Info and Deadline */}
              {!isCompactView && (
                <HStack
                  w="full"
                  justify="space-between"
                  align="center"
                  spacing={2}
                >
                  {task.backlogId && DataBacklogs.length > 0 && (
                    <HStack spacing={2}>
                      <Icon as={FiList} color="secondary.500" boxSize={3} />
                      <Text
                        fontSize="xs"
                        color="secondary.600"
                        fontWeight="medium"
                      >
                        {DataBacklogs.find((b) => b.id === task.backlogId)
                          ?.backlogName || "Unknown"}
                      </Text>
                    </HStack>
                  )}
                  {task.backlogId &&
                    DataBacklogs.find((b) => b.id === task.backlogId)
                      ?.backlogEnddate && (
                      <HStack spacing={1} whiteSpace="nowrap">
                        <Icon as={FiClock} color="red.500" boxSize={3} />
                        <Text fontSize="xs" color="red.600" fontWeight="medium">
                          {formatDateDDMMYYYY(
                            DataBacklogs.find((b) => b.id === task.backlogId)!
                              .backlogEnddate!,
                          )}
                        </Text>
                      </HStack>
                    )}
                </HStack>
              )}

              {/* Task Title */}
              <Text
                fontWeight="600"
                fontSize={isCompactView ? "sm" : "md"}
                lineHeight="1.3"
                color={colorMode === "light" ? "gray.800" : "white"}
                noOfLines={isCompactView ? 1 : 2}
                w="full"
              >
                {task.taskName}
              </Text>

              {/* Description */}
              {!isCompactView && task.taskDesc && (
                <Text
                  fontSize="sm"
                  color="gray.600"
                  lineHeight="1.4"
                  noOfLines={2}
                >
                  {task.taskDesc}
                </Text>
              )}

              {/* Progress Bar */}
              {!isCompactView && task.percentageStatus > 0 && (
                <Box w="full">
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Progress
                    </Text>
                    <Text fontSize="xs" color="gray.600" fontWeight="bold">
                      {task.percentageStatus}%
                    </Text>
                  </HStack>
                  <Box
                    w="full"
                    h="6px"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${task.percentageStatus}%`}
                      bg={
                        task.percentageStatus === 100
                          ? "green.400"
                          : "secondary.400"
                      }
                      borderRadius="full"
                      transition="width 0.3s ease"
                    />
                  </Box>
                </Box>
              )}

              {/* Metadata Row */}
              <HStack w="full" justify="space-between" align="center" pt={1}>
                {/* Left side - Counts */}
                <HStack spacing={3}>
                  {task.countCommnetTask > 0 && (
                    <HStack spacing={1}>
                      <Icon as={FiMessageSquare} color="gray.500" boxSize={3} />
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {task.countCommnetTask}
                      </Text>
                    </HStack>
                  )}

                  {task.countTaskItem > 0 && (
                    <HStack spacing={1}>
                      <Icon as={FiCheckSquare} color="gray.500" boxSize={3} />
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {task.countTaskItemDone}/{task.countTaskItem}
                      </Text>
                    </HStack>
                  )}

                  {task.countRelatedTask > 0 && (
                    <HStack spacing={1}>
                      <Icon as={FiLink} color="gray.500" boxSize={3} />
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {task.countRelatedTask}
                      </Text>
                    </HStack>
                  )}
                </HStack>

                {/* Right side - Assignees */}
                {task.assignUsers && task.assignUsers.length > 0 && (
                  <Tooltip
                    hasArrow
                    label={
                      <VStack spacing={1} align="start">
                        {task.assignUsers.map(
                          (user: UserShortResponse, index: number) => (
                            <Text key={index} fontSize="xs">
                              {user.nama}
                            </Text>
                          ),
                        )}
                      </VStack>
                    }
                    bg="gray.700"
                    color="white"
                    borderRadius="md"
                    placement="top"
                  >
                    <AvatarGroup size="xs" max={3} spacing="-0.5">
                      {task.assignUsers.map((user: UserShortResponse) => (
                        <Avatar
                          key={user.id}
                          name={user.nama}
                          src={user.profilePict || undefined}
                          border="2px solid white"
                        />
                      ))}
                    </AvatarGroup>
                  </Tooltip>
                )}
              </HStack>

              {/* Start Date and End Date */}
              {!isCompactView && (
                <HStack spacing={2} w="full" justify="space-between">
                  {task.startDate && (
                    <HStack spacing={2}>
                      <Icon as={FiPlay} color="green.500" boxSize={3} />
                      <Text fontSize="xs" color="green.600" fontWeight="medium">
                        Start Date : {formatDateDDMMYYYY(task.startDate)}
                      </Text>
                    </HStack>
                  )}
                  {task.endDate && (
                    <HStack spacing={2}>
                      <Icon as={FiFlag} color="orange.500" boxSize={3} />
                      <Text
                        fontSize="xs"
                        color="orange.600"
                        fontWeight="medium"
                      >
                        End Date : {formatDateDDMMYYYY(task.endDate)}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              )}

              {/* Last Updated */}
              {!isCompactView && (
                <HStack spacing={2} w="full">
                  <Icon as={FiRefreshCcw} color="gray.400" boxSize={3} />
                  <Text fontSize="xs" color="gray.500">
                    {task.updatedAt
                      ? `Updated ${convertToCustomDateFormat(task.updatedAt)}`
                      : `Created ${convertToCustomDateFormat(task.createdAt)}`}
                  </Text>
                </HStack>
              )}
            </VStack>
          </CardBody>
          {task.percentageStatus < 100 &&
            task.boardName == TASK_BOARD_STATUS_NAME_DONE && (
              <CardFooter
                bg={"orange.300"}
                h={"5px"}
                roundedBottom={radiusStyle}
              >
                <Flex
                  as={HStack}
                  w={"full"}
                  color={"orange.700"}
                  px={3}
                  justifyContent={"center"}
                >
                  <FiAlertCircle size={".8em"} />
                  <Text lineHeight={0} fontSize={"small"}>
                    Warning
                  </Text>
                </Flex>
              </CardFooter>
            )}
        </Card>
      </div>

      {/* Task Detail Modal - Exact copy from original kanban */}
      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
        size="5xl"
      >
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <Flex
            w={"full"}
            minH={"50px"}
            bgGradient={"linear(to-br, secondary.500, secondary.600)"}
            roundedTop={radiusStyle}
            justifyContent={"center"}
            alignItems={"center"}
            color={"white"}
          >
            <Box>
              <Heading as="h4" size="md">
                {detailedTask ? detailedTask.taskName : "TASK"}
              </Heading>
            </Box>
          </Flex>
          <ModalCloseButton />
          <ModalBody p={4} m={2}>
            {isLoadingDetails ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : detailedTask ? (
              <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">
                <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}>
                  <Flex pt={2} alignItems={"center"} as={HStack} spacing={4}>
                    {/* Status with Board Selection using Menu */}
                    <HStack>
                      <Menu>
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          size="md"
                          variant="outline"
                          width="full"
                          textAlign="left"
                          isLoading={isLoadingDetails}
                          color={"secondary.500"}
                        >
                          {detailedTask?.boardName || "Select Board"}
                        </MenuButton>
                        <MenuList fontWeight={600}>
                          {taskBoards.map((board: TaskBoardViewModel) => (
                            <MenuItem
                              fontWeight={600}
                              key={board.id}
                              isDisabled={
                                board.boardName === detailedTask.boardName
                              }
                              onClick={() => handleMoveTaskToBoard(board)}
                            >
                              {board.boardName}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                      {isLoadingDetails && <Spinner size="sm" ml={2} />}
                    </HStack>
                    {/* Priority */}
                    <HStack>
                      <Menu>
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          size={"md"}
                          variant="ghost"
                          width="full"
                          textAlign="left"
                          isLoading={isLoadingDetails}
                          _hover={{}}
                        >
                          <Badge
                            colorScheme={
                              detailedTask.taskPriority === "HIGH"
                                ? "red"
                                : detailedTask.taskPriority === "MEDIUM"
                                  ? "orange"
                                  : detailedTask.taskPriority === "CRITICAL"
                                    ? "purple"
                                    : "green"
                            }
                            fontSize={"large"}
                            rounded={"md"}
                            px={3}
                            py={1}
                            mr={2}
                          >
                            {detailedTask.taskPriority}
                          </Badge>
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            icon={<Badge colorScheme="green">LOW</Badge>}
                            onClick={() => handleUpdateTaskPriority("LOW")}
                          >
                            Low Priority
                          </MenuItem>
                          <MenuItem
                            icon={<Badge colorScheme="orange">MEDIUM</Badge>}
                            onClick={() => handleUpdateTaskPriority("MEDIUM")}
                          >
                            Medium Priority
                          </MenuItem>
                          <MenuItem
                            icon={<Badge colorScheme="red">HIGH</Badge>}
                            onClick={() => handleUpdateTaskPriority("HIGH")}
                          >
                            High Priority
                          </MenuItem>
                          {/* <MenuItem
                            icon={<Badge colorScheme="purple">CRITICAL</Badge>}
                          >
                            Critical Priority
                          </MenuItem> */}
                        </MenuList>
                      </Menu>
                      {isLoadingDetails && <Spinner size="sm" ml={2} />}
                    </HStack>
                  </Flex>
                </GridItem>

                <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}>
                  <Flex
                    w="full"
                    as={VStack}
                    spacing={4}
                    justifyContent="start"
                    alignItems="start"
                  >
                    {detailedTask.percentageStatus < 100 &&
                      detailedTask.boardName == TASK_BOARD_STATUS_NAME_DONE && (
                        <Alert
                          status={"warning"}
                          variant={"subtle"}
                          flexDirection={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          textAlign={"center"}
                          rounded={radiusStyle}
                          py={5}
                        >
                          <AlertIcon boxSize="35px" mr={0} />
                          <AlertDescription maxWidth={"sm"} mt={3}>
                            Task tidak dianggap berhasil jika seluruh checklist
                            belum terselesaikan, meskipun telah berada di board
                            'DONE'
                          </AlertDescription>
                        </Alert>
                      )}

                    {/* Alert for no assigned users */}
                    {ChoosedMemberProjects.length === 0 && (
                      <Alert
                        status="warning"
                        variant="left-accent"
                        rounded={radiusStyle}
                      >
                        <AlertIcon />
                        <AlertDescription>
                          Task belum memiliki user yang ditugaskan. Silakan
                          assign user untuk task ini.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Alert for no due date */}
                    {!detailedTask.endDate && (
                      <Alert
                        status="warning"
                        variant="left-accent"
                        rounded={radiusStyle}
                      >
                        <AlertIcon />
                        <AlertDescription>
                          Task belum memiliki due date. Silakan set tanggal
                          deadline untuk task ini.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Alert for overdue or approaching deadline */}
                    {detailedTask.endDate &&
                      detailedTask.boardName !== TASK_BOARD_STATUS_NAME_DONE &&
                      (() => {
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        const endDate = new Date(detailedTask.endDate);
                        endDate.setHours(0, 0, 0, 0);
                        const diffTime = endDate.getTime() - now.getTime();
                        const diffDays = Math.floor(
                          diffTime / (1000 * 60 * 60 * 24),
                        );

                        if (diffDays < 0) {
                          return (
                            <Alert
                              status="error"
                              variant="left-accent"
                              rounded={radiusStyle}
                            >
                              <AlertIcon />
                              <AlertDescription>
                                Task sudah melewati deadline{" "}
                                {Math.abs(diffDays)} hari yang lalu!
                              </AlertDescription>
                            </Alert>
                          );
                        } else if (diffDays <= 3) {
                          return (
                            <Alert
                              status="warning"
                              variant="left-accent"
                              rounded={radiusStyle}
                            >
                              <AlertIcon />
                              <AlertDescription>
                                Task akan jatuh tempo dalam {diffDays} hari!
                              </AlertDescription>
                            </Alert>
                          );
                        } else {
                          return (
                            <Alert
                              status="info"
                              variant="left-accent"
                              rounded={radiusStyle}
                            >
                              <AlertIcon />
                              <AlertDescription>
                                Task memiliki deadline pada{" "}
                                {formatDateDDMMYYYY(detailedTask.endDate)}.
                              </AlertDescription>
                            </Alert>
                          );
                        }
                      })()}

                    <Flex
                      w="full"
                      as={HStack}
                      alignItems="center"
                      justifyContent="start"
                      spacing={2}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <FiCircle size={16} />
                      {/* Editable Task Name */}
                      {isEditingName ? (
                        <Box w="full" position="relative">
                          <Input
                            ref={nameInputRef}
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleNameKeyDown}
                            fontSize="23px"
                            fontWeight="600"
                            variant="flushed"
                            isDisabled={isSaving}
                            placeholder="Task name"
                            autoFocus
                          />
                          {isSaving && (
                            <Spinner
                              size="sm"
                              position="absolute"
                              right="2"
                              top="50%"
                              transform="translateY(-50%)"
                            />
                          )}
                        </Box>
                      ) : (
                        <HStack
                          spacing={2}
                          onClick={handleEditName}
                          cursor="pointer"
                          _hover={{
                            bg: colorMode === "light" ? "gray.50" : "gray.700",
                          }}
                          p={1}
                          borderRadius="md"
                          transition="all 0.2s"
                          role="group"
                          flex={1}
                        >
                          <Text fontWeight={600} fontSize={23}>
                            {detailedTask.taskName}
                          </Text>
                          <Icon
                            as={FaEdit}
                            color="gray.400"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            transition="opacity 0.2s"
                          />
                        </HStack>
                      )}
                    </Flex>
                    {/* Date Range Picker and Assign Task */}
                    <HStack spacing={2}>
                      <Popover placement="bottom-start" closeOnBlur={false}>
                        <PopoverTrigger>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<CalendarIcon />}
                            rightIcon={<ChevronDownIcon />}
                          >
                            {detailedTask.startDate && detailedTask.endDate
                              ? `${formatDateDDMMYYYY(detailedTask.startDate)} - ${formatDateDDMMYYYY(detailedTask.endDate)}`
                              : detailedTask.startDate
                                ? `Starts: ${formatDateDDMMYYYY(detailedTask.startDate)}`
                                : detailedTask.endDate
                                  ? `Due: ${formatDateDDMMYYYY(detailedTask.endDate)}`
                                  : "Set dates"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          p={4}
                          width="300px"
                          rounded={radiusStyle}
                        >
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader fontWeight="semibold">
                            Set Task Dates
                          </PopoverHeader>
                          <PopoverBody>
                            <VStack spacing={3} align="stretch">
                              <DateTimeRangeInput
                                startValue={detailedTask.startDate ?? null}
                                endValue={detailedTask.endDate ?? null}
                                onStartChange={(value) => {
                                  if (detailedTask) {
                                    setDetailedTask({
                                      ...detailedTask,
                                      startDate: value ?? undefined,
                                    });
                                  }
                                }}
                                onEndChange={(value) => {
                                  if (detailedTask) {
                                    setDetailedTask({
                                      ...detailedTask,
                                      endDate: value ?? undefined,
                                    });
                                  }
                                }}
                                placeholder="Select task schedule"
                                size="sm"
                              />
                              <Button
                                size="sm"
                                colorScheme="blue"
                                w="full"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  const startDate =
                                    detailedTask.startDate ?? null;
                                  const endDate = detailedTask.endDate ?? null;

                                  await updateTaskDates(startDate, endDate);
                                  onRefreshTasks();

                                  // Close popover
                                  document.body.click();
                                }}
                              >
                                Save
                              </Button>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>

                      {/* Assign Task Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<FaUsers />}
                        onClick={() => {
                          setSearchUserInput("");
                          const projectMembers =
                            DataProject?.userAssignment?.map(
                              (assignment) => assignment.userData,
                            ) || [];
                          setDataUsers(projectMembers);
                          onAssignModalOpen();
                        }}
                      >
                        Assign Task
                        {ChoosedMemberProjects.length > 0 &&
                          ` (${ChoosedMemberProjects.length})`}
                      </Button>
                    </HStack>
                    {/* Editable Task Description */}
                    {isEditingDesc ? (
                      <Box w="full" position="relative">
                        <Textarea
                          ref={descTextareaRef}
                          value={editedDesc}
                          onChange={(e) => setEditedDesc(e.target.value)}
                          onBlur={handleSaveDesc}
                          onKeyDown={handleDescKeyDown}
                          minH="100px"
                          variant="filled"
                          isDisabled={isSaving}
                          placeholder="Add a more detailed description..."
                          resize="vertical"
                        />
                        {isSaving && (
                          <Spinner
                            size="sm"
                            position="absolute"
                            right="2"
                            top="2"
                          />
                        )}
                        <Text
                          fontSize="xs"
                          color={
                            colorMode === "light" ? "gray.500" : "gray.400"
                          }
                          mt={1}
                        >
                          Press Ctrl+Enter to save, Esc to cancel
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        w="full"
                        onClick={handleEditDesc}
                        cursor="pointer"
                        _hover={{
                          bg: colorMode === "light" ? "gray.50" : "gray.700",
                        }}
                        p={2}
                        borderRadius="md"
                        transition="all 0.2s"
                        minH="60px"
                        position="relative"
                        role="group"
                      >
                        {detailedTask.taskDesc ? (
                          <Text>{detailedTask.taskDesc}</Text>
                        ) : (
                          <Text color="gray.400">
                            Add a more detailed description...
                          </Text>
                        )}
                        <Icon
                          as={FaEdit}
                          color="gray.400"
                          position="absolute"
                          top={2}
                          right={2}
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="opacity 0.2s"
                        />
                      </Box>
                    )}
                    {/* Task Items (Checklist) */}
                    <Box mt={4}>
                      <Flex
                        w="full"
                        justifyContent="space-between"
                        as={HStack}
                        spacing={2}
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
                        mb={2}
                      >
                        <HStack>
                          <FaCheckCircle size={16} />
                          <Text fontWeight={600} fontSize={18}>
                            Checklist (
                            {
                              taskItems.filter((item) => item.isDone === "Y")
                                .length
                            }
                            /{taskItems.length})
                          </Text>
                        </HStack>
                        {isLoadingTaskItems && <Spinner size="sm" />}
                      </Flex>

                      {isLoadingTaskItems ? (
                        <Flex justify="center" py={4}>
                          <Spinner />
                        </Flex>
                      ) : taskItems.length > 0 ? (
                        <Flex
                          w="full"
                          justifyContent="start"
                          alignItems="start"
                          as={VStack}
                          spacing={2}
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                          px={4}
                        >
                          {taskItems.map((item) => (
                            <Flex
                              key={item.id}
                              w="full"
                              alignItems="center"
                              py={1}
                              px={1}
                              borderRadius="md"
                              _hover={{
                                bg:
                                  colorMode === "light"
                                    ? "gray.50"
                                    : "gray.700",
                              }}
                              opacity={togglingItemId ? 0.6 : 1}
                            >
                              {togglingItemId === item.id ? (
                                <Spinner size="sm" mr={2} />
                              ) : (
                                <Checkbox
                                  isChecked={item.isDone === "Y"}
                                  onChange={() =>
                                    handleToggleTaskItem(
                                      item.id,
                                      item.isDone === "Y" ? "N" : "Y",
                                    )
                                  }
                                  colorScheme={
                                    item.isDone === "Y" ? "green" : "blue"
                                  }
                                  isDisabled={
                                    togglingItemId !== null ||
                                    editingTaskItemId === item.id
                                  }
                                  mr={2}
                                />
                              )}
                              {editingTaskItemId === item.id ? (
                                <Input
                                  ref={taskItemInputRef}
                                  value={editedTaskItemName}
                                  onChange={(e) =>
                                    setEditedTaskItemName(e.target.value)
                                  }
                                  onBlur={() => handleSaveTaskItem(item.id)}
                                  onKeyDown={(e) =>
                                    handleTaskItemKeyDown(e, item.id)
                                  }
                                  size="sm"
                                  variant="flushed"
                                  isDisabled={togglingItemId === item.id}
                                  autoFocus
                                  flex="1"
                                />
                              ) : (
                                <Text
                                  as={item.isDone === "Y" ? "s" : "span"}
                                  color={
                                    item.isDone === "Y" ? "gray.500" : "inherit"
                                  }
                                  flex="1"
                                  cursor="pointer"
                                  onClick={() =>
                                    handleStartEditTaskItem(
                                      item.id,
                                      item.taskItemName,
                                    )
                                  }
                                >
                                  {item.taskItemName}
                                </Text>
                              )}
                              <IconButton
                                aria-label="Delete task item"
                                icon={<DeleteIcon />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteTaskItem(item.id)}
                                isDisabled={editingTaskItemId === item.id}
                              />
                            </Flex>
                          ))}
                        </Flex>
                      ) : (
                        <Box px={4} py={2}>
                          <Text
                            color={
                              colorMode === "light" ? "gray.500" : "gray.400"
                            }
                          >
                            No subtasks yet. Add one below.
                          </Text>
                        </Box>
                      )}

                      {/* Add new task item */}
                      <Box px={4} w="full" my={4}>
                        <form onSubmit={handleAddTaskItem}>
                          <Flex as={HStack}>
                            <Input
                              placeholder="Add a new subtask..."
                              value={newTaskItemName}
                              onChange={(e) =>
                                setNewTaskItemName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  newTaskItemName.trim()
                                ) {
                                  e.preventDefault();
                                  handleAddTaskItem(e as any);
                                }
                              }}
                              pr="4.5rem"
                              variant={"flushed"}
                              px={2}
                            />
                            <Button
                              h="1.75rem"
                              size="sm"
                              type="submit"
                              colorScheme="secondary"
                              isDisabled={!newTaskItemName.trim()}
                              isLoading={isAddingTaskItem}
                              leftIcon={<FiCornerDownLeft />}
                              px={5}
                            >
                              Enter
                            </Button>
                          </Flex>
                        </form>
                      </Box>
                    </Box>
                    <Box mb={10}></Box>
                    {/* Comments Section */}
                    <Flex
                      w="full"
                      justifyContent="space-between"
                      alignItems="center"
                      as={HStack}
                      spacing={2}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <Flex as={HStack} spacing={2} alignItems="center">
                        <FaCommentDots size={16} />
                        <Text fontWeight={600} fontSize={18}>
                          Comments ({taskComments.length})
                        </Text>
                        {isLoadingComments && <Spinner size="sm" />}
                      </Flex>

                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<FaSync />}
                        onClick={refreshTaskComments}
                        isLoading={isLoadingComments}
                        isDisabled={isLoadingComments}
                      >
                        Refresh
                      </Button>
                    </Flex>
                    {/* Add Comment */}
                    <Box as="form" onSubmit={handleAddComment} w="full">
                      <Flex
                        w="full"
                        justifyContent="start"
                        as={HStack}
                        spacing={4}
                        color="gray.500"
                        p={2}
                        alignItems="flex-start"
                      >
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          as={VStack}
                          spacing={2}
                        >
                          <Avatar
                            size="md"
                            name={getCurrentUserName()}
                            src={getCurrentUserAvatar()}
                          />
                        </Flex>
                        <VStack w="full" spacing={2} align="stretch">
                          <Textarea
                            placeholder="Add a comment..."
                            rounded={radiusStyle}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.ctrlKey || e.metaKey)
                              ) {
                                e.preventDefault();
                                if (newComment.trim()) {
                                  handleAddComment(e as any);
                                }
                              }
                            }}
                            isDisabled={isAddingComment}
                            minH="80px"
                            resize="vertical"
                          />
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            textAlign="right"
                          >
                            Press Ctrl+Enter to submit
                          </Text>
                          <Flex justifyContent="flex-end" gap={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setNewComment("")}
                              isDisabled={isAddingComment || !newComment.trim()}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              type="submit"
                              isLoading={isAddingComment}
                              isDisabled={!newComment.trim()}
                              loadingText="Adding..."
                            >
                              Add Comment
                            </Button>
                          </Flex>
                        </VStack>
                      </Flex>
                    </Box>
                    {/* Comments */}
                    {taskComments.map((comment, index) => (
                      <Flex
                        key={comment.id}
                        w="full"
                        justifyContent="start"
                        alignItems="start"
                        as={HStack}
                        spacing={2}
                        p={2}
                      >
                        <Avatar
                          size="md"
                          name={comment.userCreated.nama}
                          src={comment.userCreated.profilePict || undefined}
                        />
                        <Flex
                          as={VStack}
                          spacing={1}
                          alignItems="start"
                          w="full"
                          pl={3}
                        >
                          <Flex
                            as={HStack}
                            w="full"
                            justifyContent="space-between"
                            alignItems="start"
                          >
                            <Flex as={Wrap} spacing={2}>
                              <Text fontWeight={600} fontSize={15}>
                                {comment.userCreated.nama}
                              </Text>
                              <Text
                                fontSize={12}
                                color={
                                  colorMode === "light"
                                    ? "gray.500"
                                    : "gray.400"
                                }
                                alignSelf="center"
                              >
                                {convertToCustomDateFormat(comment.createdAt)}
                              </Text>
                            </Flex>
                            {/* Show menu only if user owns the comment */}
                            {getCurrentUser()?.id ===
                              comment.userCreated.id && (
                              <Menu>
                                <MenuButton
                                  as={Button}
                                  size="sm"
                                  variant="ghost"
                                  isLoading={deletingCommentId === comment.id}
                                  isDisabled={isUpdatingComment}
                                >
                                  <FaEllipsisVertical />
                                </MenuButton>
                                <MenuList>
                                  <MenuItem
                                    icon={<FaEdit />}
                                    onClick={() =>
                                      handleStartEditComment(
                                        comment.id,
                                        comment.comCaptions || "",
                                      )
                                    }
                                    isDisabled={
                                      editingCommentId === comment.id ||
                                      isUpdatingComment ||
                                      deletingCommentId === comment.id
                                    }
                                  >
                                    Edit Comment
                                  </MenuItem>
                                  <MenuItem
                                    icon={<FaTrash />}
                                    color="red.500"
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                    isDisabled={
                                      editingCommentId === comment.id ||
                                      isUpdatingComment ||
                                      deletingCommentId === comment.id
                                    }
                                  >
                                    Delete Comment
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            )}
                          </Flex>

                          {/* Comment text or edit input */}
                          {editingCommentId === comment.id ? (
                            <VStack w="full" spacing={2} align="stretch">
                              <Textarea
                                value={editedCommentText}
                                onChange={(e) =>
                                  setEditedCommentText(e.target.value)
                                }
                                placeholder="Edit your comment..."
                                size="sm"
                                resize="vertical"
                                minH="60px"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (e.ctrlKey || e.metaKey)
                                  ) {
                                    e.preventDefault();
                                    handleUpdateComment(comment.id);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelEditComment();
                                  }
                                }}
                              />
                              <Text
                                fontSize="xs"
                                color={
                                  colorMode === "light"
                                    ? "gray.500"
                                    : "gray.400"
                                }
                                textAlign="right"
                              >
                                Press Ctrl+Enter to save, Esc to cancel
                              </Text>
                              <HStack spacing={2} justify="flex-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditComment}
                                  isDisabled={isUpdatingComment}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme={
                                    isUpdatingComment ? "yellow" : "blue"
                                  }
                                  onClick={() =>
                                    handleUpdateComment(comment.id)
                                  }
                                  isLoading={isUpdatingComment}
                                  isDisabled={
                                    !editedCommentText.trim() ||
                                    isUpdatingComment
                                  }
                                >
                                  Save
                                </Button>
                              </HStack>
                            </VStack>
                          ) : (
                            <Text as="p" fontSize={15}>
                              {comment.comCaptions || ""}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    ))}
                    {/* Load More Comments Button */}
                    {hasMoreComments && (
                      <Flex w="full" justifyContent="center" pt={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMoreComments}
                          isLoading={isLoadingComments}
                          loadingText="Loading..."
                        >
                          Load More Comments
                        </Button>
                      </Flex>
                    )}
                    {/* No Comments Message */}
                    {!isLoadingComments && taskComments.length === 0 && (
                      <Flex w="full" justifyContent="center" py={4}>
                        <Text
                          color={
                            colorMode === "light" ? "gray.500" : "gray.400"
                          }
                          fontSize="sm"
                        >
                          No comments yet. Be the first to comment!
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </GridItem>

                <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}>
                  <Flex
                    w="full"
                    as={VStack}
                    spacing={7}
                    justifyContent="start"
                    alignItems="start"
                    minH="60vh"
                    px={5}
                  >
                    <Flex
                      w="full"
                      justifyContent="start"
                      as={HStack}
                      spacing={2}
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                    >
                      <FaCog size={16} />
                      <Text fontWeight={600} fontSize={18}>
                        Detail Task
                      </Text>
                    </Flex>

                    {/* Assignees */}
                    <Box w="full">
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mb={1}
                      >
                        Assigned To
                      </Text>
                      {ChoosedMemberProjects &&
                      ChoosedMemberProjects.length > 0 ? (
                        <Wrap>
                          {ChoosedMemberProjects.map((user) => (
                            <WrapItem key={user.id}>
                              <HStack
                                p={2}
                                bg={
                                  colorMode === "light" ? "gray.50" : "gray.700"
                                }
                                borderRadius="full"
                                spacing={2}
                              >
                                <Avatar
                                  size="xs"
                                  name={user.nama}
                                  src={user.profilePict || undefined}
                                />
                                <Text fontSize="sm">{user.nama}</Text>
                              </HStack>
                            </WrapItem>
                          ))}
                        </Wrap>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No assignees
                        </Text>
                      )}
                    </Box>

                    {/* Backlog Information */}
                    <Box w="full">
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mb={2}
                      >
                        Backlog
                      </Text>
                      {detailedTask?.backlogId ? (
                        <Box
                          p={3}
                          bg="secondary.50"
                          border="1px solid"
                          borderColor="secondary.200"
                          rounded={radiusStyle}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="secondary.700"
                          >
                            {DataBacklogs.find(
                              (b: BacklogDataResponse) =>
                                b.id === detailedTask.backlogId,
                            )?.backlogName || "Unknown Backlog"}
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No backlog assigned
                        </Text>
                      )}
                    </Box>

                    {/* Related Tasks */}
                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text
                          fontSize="sm"
                          color={
                            colorMode === "light" ? "gray.500" : "gray.400"
                          }
                        >
                          Related Tasks
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={onTaskPickerOpen}
                          leftIcon={<FaPlus />}
                        >
                          Add
                        </Button>
                      </HStack>
                      {isLoadingRelatedTasks ? (
                        <Text fontSize="sm" color="gray.400">
                          Loading...
                        </Text>
                      ) : relatedTasks.length > 0 ? (
                        <VStack align="stretch" spacing={2} w={"full"}>
                          {relatedTasks.map((relTask) => (
                            <Box
                              key={relTask.id}
                              p={3}
                              bg={
                                colorMode === "light" ? "gray.50" : "gray.700"
                              }
                              border="1px solid"
                              borderColor={
                                colorMode === "light" ? "gray.200" : "gray.600"
                              }
                              rounded={radiusStyle}
                              w={"full"}
                            >
                              <HStack
                                justify="space-between"
                                align="start"
                                spacing={2}
                              >
                                <VStack
                                  align="start"
                                  spacing={1}
                                  flex={1}
                                  minW={0}
                                >
                                  <HStack spacing={2}>
                                    <Badge
                                      size="sm"
                                      colorScheme={
                                        relTask.taskPriority === "HIGH"
                                          ? "red"
                                          : relTask.taskPriority === "MEDIUM"
                                            ? "orange"
                                            : "green"
                                      }
                                    >
                                      {relTask.taskPriority}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" fontWeight="bold">
                                    {relTask.taskName}
                                  </Text>
                                  <VStack
                                    align="start"
                                    spacing={0}
                                    fontSize="xs"
                                    color="gray.600"
                                  >
                                    {relTask.projectId && (
                                      <HStack spacing={1}>
                                        <Text fontWeight="medium">
                                          Project:
                                        </Text>
                                        {relTask.projectNo &&
                                        relTask.projectName ? (
                                          <Tooltip
                                            label={`${relTask.projectNo} - ${relTask.projectName}`}
                                            placement="top"
                                          >
                                            <Text isTruncated maxW="200px">
                                              {relTask.projectNo} -{" "}
                                              {relTask.projectName}
                                            </Text>
                                          </Tooltip>
                                        ) : DataProject?.id ===
                                          relTask.projectId ? (
                                          <Tooltip
                                            label={`${DataProject.projectNo} - ${DataProject.projectName}`}
                                            placement="top"
                                          >
                                            <Text isTruncated maxW="200px">
                                              {DataProject.projectNo} -{" "}
                                              {DataProject.projectName}
                                            </Text>
                                          </Tooltip>
                                        ) : (
                                          <Text
                                            color="orange.600"
                                            fontWeight="medium"
                                          >
                                            {relTask.projectId} (Other Project)
                                          </Text>
                                        )}
                                      </HStack>
                                    )}
                                    {relTask.backlogId && (
                                      <HStack spacing={1}>
                                        <Text fontWeight="medium">
                                          Backlog:
                                        </Text>
                                        <Text>
                                          {relTask.backlogName ||
                                            DataBacklogs.find(
                                              (b) => b.id === relTask.backlogId,
                                            )?.backlogName ||
                                            relTask.backlogId}
                                        </Text>
                                      </HStack>
                                    )}
                                    {relTask.boardName && (
                                      <HStack spacing={1}>
                                        <Text fontWeight="medium">Status:</Text>
                                        <Text>{relTask.boardName}</Text>
                                      </HStack>
                                    )}
                                  </VStack>
                                  {relTask.assignUsers &&
                                    relTask.assignUsers.length > 0 && (
                                      <HStack spacing={2} mt={1}>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          fontWeight="medium"
                                        >
                                          Assigned:
                                        </Text>
                                        <AvatarGroup size="xs" max={3}>
                                          {relTask.assignUsers.map((user) => (
                                            <Avatar
                                              key={user.id}
                                              name={user.nama}
                                              src={
                                                user.profilePict || undefined
                                              }
                                            />
                                          ))}
                                        </AvatarGroup>
                                      </HStack>
                                    )}
                                </VStack>
                                <IconButton
                                  aria-label="Remove related task"
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() =>
                                    handleRemoveRelatedTask(relTask.id)
                                  }
                                />
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No related tasks
                        </Text>
                      )}
                    </Box>

                    {/* Dates */}
                    <Box w="full">
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mb={1}
                      >
                        Timeline
                      </Text>
                      <VStack align="start" spacing={2}>
                        {detailedTask?.startDate ? (
                          <HStack>
                            <Text fontSize="xs" fontWeight="bold" w="80px">
                              Start Date:
                            </Text>
                            <Text fontSize="sm">
                              {formatDateDDMMYYYY(detailedTask.startDate)}
                            </Text>
                          </HStack>
                        ) : (
                          <Text fontSize={"md"} fontWeight={600}>
                            -
                          </Text>
                        )}
                        {detailedTask?.endDate && (
                          <HStack>
                            <Text fontSize="xs" fontWeight="bold" w="80px">
                              End Date:
                            </Text>
                            <Text fontSize="sm">
                              {formatDateDDMMYYYY(detailedTask.endDate)}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>

                    {/* Progress */}
                    <Box w="full">
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mb={1}
                      >
                        Progress
                      </Text>
                      <HStack spacing={2}>
                        <Box w="full" h="8px" bg="gray.100" borderRadius="full">
                          <Box
                            h="100%"
                            w={`${detailedTask?.percentageStatus || 0}%`}
                            bg="secondary.400"
                            borderRadius="full"
                          />
                        </Box>
                        <Text fontSize="xs" fontWeight="bold">
                          {detailedTask?.percentageStatus || 0}%
                        </Text>
                      </HStack>
                    </Box>

                    {/* Created Info */}
                    <Box w="full">
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mb={1}
                      >
                        Dibuat Oleh
                      </Text>

                      {detailedTask?.userCreated ? (
                        <HStack>
                          <Avatar
                            size="xs"
                            name={detailedTask.userCreated.nama}
                            src={
                              detailedTask.userCreated.profilePict || undefined
                            }
                          />
                          <Text fontSize="sm">
                            {detailedTask.userCreated.nama}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          Unknown
                        </Text>
                      )}
                      <Text
                        fontSize="xs"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        mt={1}
                      >
                        {detailedTask &&
                          new Date(detailedTask.createdAt).toLocaleString()}
                      </Text>
                    </Box>

                    <HorizontalFadeDivider />

                    {/* Actions */}
                    <Flex as={Stack} w="full">
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={
                          detailedTask?.isArchived != null &&
                          detailedTask?.isArchived == "Y"
                            ? "teal"
                            : "red"
                        }
                        leftIcon={
                          <Icon
                            as={
                              detailedTask?.isArchived != null &&
                              detailedTask?.isArchived == "Y"
                                ? FiRotateCcw
                                : FiArchive
                            }
                          />
                        }
                        onClick={() =>
                          detailedTask && handleArchiveTask(detailedTask.id)
                        }
                        isLoading={isArchiving}
                      >
                        {detailedTask?.isArchived != null &&
                        detailedTask?.isArchived == "Y"
                          ? "Restore"
                          : "Archive"}
                      </Button>
                    </Flex>

                    <HorizontalFadeDivider />

                    {/* Aktivitas Task */}
                    <Box w="full">
                      <Flex
                        w="full"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                      >
                        <HStack spacing={2}>
                          <Icon as={FiActivity} size={16} color="secondary.500" />
                          <Text
                            fontWeight={600}
                            fontSize={16}
                            color={colorMode === "light" ? "gray.700" : "gray.300"}
                          >
                            Aktivitas Task
                          </Text>
                          {totalActivitiesCount > 0 && (
                            <Badge
                              colorScheme="secondary"
                              variant="subtle"
                              rounded="full"
                              fontSize="xs"
                              px={2}
                            >
                              {totalActivitiesCount}
                            </Badge>
                          )}
                        </HStack>

                        <IconButton
                          aria-label="Refresh aktivitas"
                          icon={<Icon as={FiRefreshCw} />}
                          size="xs"
                          variant="ghost"
                          isLoading={isLoadingActivities}
                          onClick={() => {
                            if (detailedTask?.id) {
                              fetchTaskActivities(detailedTask.id);
                            }
                          }}
                        />
                      </Flex>

                      {isLoadingActivities ? (
                        <Flex justify="center" align="center" py={3}>
                          <Spinner size="xs" color="secondary.500" />
                        </Flex>
                      ) : taskActivities && taskActivities.length > 0 ? (
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
                          {taskActivities.map((act) => {
                            const userName =
                              act.userData?.nama ||
                              act.userData?.userId ||
                              act.userIdSys ||
                              "User";
                            const userAvatar =
                              act.userData?.profilePict || undefined;

                            return (
                              <Box key={act.id} py={2}>
                                <HStack spacing={2} align="start">
                                  <Avatar
                                    size="2xs"
                                    name={userName}
                                    src={userAvatar}
                                    mt="2px"
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
                                  </VStack>
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      ) : (
                        <Box
                          py={2.5}
                          px={3}
                          rounded="md"
                          bg={
                            colorMode === "light"
                              ? "gray.50"
                              : "gray.800"
                          }
                          border="1px dashed"
                          borderColor={
                            colorMode === "light"
                              ? "gray.200"
                              : "gray.700"
                          }
                          textAlign="center"
                        >
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light"
                                ? "gray.400"
                                : "gray.500"
                            }
                          >
                            Belum ada aktivitas tercatat
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Flex>
                </GridItem>
              </Grid>
            ) : (
              <Flex justify="center" align="center" p={10}>
                <Text>Could not load task details</Text>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={onAssignModalClose}
        size="4xl"
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            <HStack spacing={2} justify="space-between" w="full">
              <HStack spacing={2}>
                <Text>Assign Task</Text>
              </HStack>
              <Badge colorScheme="blue" fontSize="sm">
                {ChoosedMemberProjects.length} Selected
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalBody overflow="visible">
            <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Project Members
                    </Text>
                    <Input
                      placeholder="Search by name, NIP, or email..."
                      value={SearchUserInput}
                      onChange={(e) => handleSearchUserAssign(e.target.value)}
                    />
                  </Box>

                  {/* Search Results */}
                  <Box
                    h="40vh"
                    overflowY="auto"
                    overflowX="hidden"
                    css={{
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#888",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#555",
                      },
                    }}
                  >
                    {DataUsers.length > 0 ? (
                      <VStack spacing={2} w="full" align="stretch" pb={2}>
                        {DataUsers.map((user) => {
                          const isAlreadyAssigned = ChoosedMemberProjects.find(
                            (assignedUser) => assignedUser.id === user.id,
                          );
                          return (
                            <HStack
                              key={user.id}
                              p={3}
                              border="1px solid"
                              borderColor={
                                colorMode === "light" ? "gray.200" : "gray.600"
                              }
                              borderRadius={radiusStyle}
                              justify="space-between"
                              bg={
                                isAlreadyAssigned
                                  ? colorMode === "light"
                                    ? "gray.50"
                                    : "gray.700"
                                  : colorMode === "light"
                                    ? "white"
                                    : "gray.800"
                              }
                            >
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={user.nama}
                                  src={user.profilePict || undefined}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{user.nama}</Text>
                                  <Text
                                    fontSize="x-small"
                                    fontWeight={600}
                                    color="secondary.500"
                                  >
                                    {user.jabatan}
                                  </Text>
                                </VStack>
                              </HStack>
                              <IconButton
                                isRound={true}
                                variant="solid"
                                colorScheme="secondary"
                                aria-label="Add"
                                fontSize="20px"
                                icon={<FiPlus />}
                                size={"xs"}
                                isDisabled={!!isAlreadyAssigned}
                                onClick={() => handleAddUserAssign(user)}
                              />
                            </HStack>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        textAlign="center"
                        py={4}
                      >
                        No members found
                      </Text>
                    )}
                  </Box>
                </VStack>
              </GridItem>

              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold">
                        Selected Users ({ChoosedMemberProjects.length})
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<FaUsers />}
                        onClick={handleAssignMe}
                        isDisabled={
                          !DataAuth ||
                          ChoosedMemberProjects.some(
                            (user) => user.id === DataAuth?.id,
                          )
                        }
                      >
                        Assign Me
                      </Button>
                    </HStack>
                    {ChoosedMemberProjects.length > 0 ? (
                      <VStack spacing={2} align="stretch">
                        {ChoosedMemberProjects.map((user) => (
                          <HStack
                            key={user.id}
                            p={3}
                            border="1px solid"
                            borderColor="blue.200"
                            borderRadius={radiusStyle}
                            justify="space-between"
                            // bg="blue.50"
                            bgGradient={
                              "linear(to-br, secondary.500, secondary.600)"
                            }
                            color={"white"}
                          >
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={user.nama}
                                src={user.profilePict || undefined}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">{user.nama}</Text>
                                <Text
                                  fontSize={"x-small"}
                                  fontWeight={600}
                                  color="secondary.900"
                                >
                                  {user.jabatan}
                                </Text>
                              </VStack>
                            </HStack>
                            <IconButton
                              isRound={true}
                              variant="solid"
                              colorScheme="red"
                              aria-label="Remove"
                              fontSize="20px"
                              icon={<FiX />}
                              size={"xs"}
                              onClick={() => handleRemoveUserAssign(user.id)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                        textAlign="center"
                        py={4}
                      >
                        No users selected
                      </Text>
                    )}
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveAssignedUsers}
              isLoading={isSavingAssignments}
              isDisabled={ChoosedMemberProjects.length === 0}
            >
              Save Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Picker Modal for Related Tasks */}
      <Modal
        isOpen={isTaskPickerOpen}
        onClose={() => {
          onTaskPickerClose();
          setSearchTaskTerm("");
          setSearchTasksResults([]);
        }}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Related Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Type at least 3 characters to search tasks..."
                value={searchTaskTerm}
                onChange={(e) => setSearchTaskTerm(e.target.value)}
              />

              {searchTasksResults.length > 0 ? (
                <VStack
                  align="stretch"
                  spacing={3}
                  maxH="500px"
                  overflowY="auto"
                >
                  {searchTasksResults
                    .filter((task) => task.id !== detailedTask?.id)
                    .filter(
                      (task) => !relatedTasks.some((rt) => rt.id === task.id),
                    )
                    .map((task) => (
                      <Box
                        key={task.id}
                        p={4}
                        border="1px solid"
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.600"
                        }
                        rounded="md"
                        _hover={{
                          bg: colorMode === "light" ? "gray.50" : "gray.700",
                        }}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack spacing={2}>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="medium"
                              >
                                {task.taskCode}
                              </Text>
                              <Badge
                                colorScheme={
                                  task.taskPriority === "HIGH"
                                    ? "red"
                                    : task.taskPriority === "MEDIUM"
                                      ? "orange"
                                      : "green"
                                }
                              >
                                {task.taskPriority}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                              {task.taskName}
                            </Text>
                            <VStack
                              align="start"
                              spacing={1}
                              fontSize="xs"
                              color={
                                colorMode === "light" ? "gray.600" : "gray.400"
                              }
                            >
                              {task.projectId && (
                                <HStack spacing={1}>
                                  <Text fontWeight="medium">Project:</Text>
                                  {task.projectNo && task.projectName ? (
                                    <Tooltip
                                      label={`${task.projectNo} - ${task.projectName}`}
                                      placement="top"
                                    >
                                      <Text isTruncated maxW="300px">
                                        {task.projectNo} - {task.projectName}
                                      </Text>
                                    </Tooltip>
                                  ) : DataProject?.id === task.projectId ? (
                                    <Tooltip
                                      label={`${DataProject.projectNo} - ${DataProject.projectName}`}
                                      placement="top"
                                    >
                                      <Text isTruncated maxW="300px">
                                        {DataProject.projectNo} -{" "}
                                        {DataProject.projectName}
                                      </Text>
                                    </Tooltip>
                                  ) : (
                                    <Text
                                      color="orange.600"
                                      fontWeight="medium"
                                    >
                                      {task.projectId} (Other Project)
                                    </Text>
                                  )}
                                </HStack>
                              )}
                              {task.backlogId && (
                                <HStack spacing={1}>
                                  <Text fontWeight="medium">Backlog:</Text>
                                  <Text>
                                    {task.backlogName ||
                                      DataBacklogs.find(
                                        (b) => b.id === task.backlogId,
                                      )?.backlogName ||
                                      task.backlogId}
                                  </Text>
                                </HStack>
                              )}
                              {task.boardName && (
                                <HStack spacing={1}>
                                  <Text fontWeight="medium">Status:</Text>
                                  <Text>{task.boardName}</Text>
                                </HStack>
                              )}
                            </VStack>
                            {task.assignUsers &&
                              task.assignUsers.length > 0 && (
                                <HStack spacing={2}>
                                  <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    fontWeight="medium"
                                  >
                                    Assigned:
                                  </Text>
                                  <AvatarGroup size="xs" max={3}>
                                    {task.assignUsers.map((user) => (
                                      <Avatar
                                        key={user.id}
                                        name={user.nama}
                                        src={user.profilePict || undefined}
                                      />
                                    ))}
                                  </AvatarGroup>
                                </HStack>
                              )}
                          </VStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleAddRelatedTask(task.id)}
                          >
                            Add
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                </VStack>
              ) : searchTaskTerm.length > 0 && searchTaskTerm.length < 3 ? (
                <Text
                  color={colorMode === "light" ? "gray.500" : "gray.400"}
                  textAlign="center"
                  py={4}
                >
                  Type at least 3 characters to search
                </Text>
              ) : searchTaskTerm.length >= 3 ? (
                <Text
                  color={colorMode === "light" ? "gray.500" : "gray.400"}
                  textAlign="center"
                  py={4}
                >
                  No tasks found. Try a different search term.
                </Text>
              ) : (
                <Text
                  color={colorMode === "light" ? "gray.500" : "gray.400"}
                  textAlign="center"
                  py={4}
                >
                  Enter at least 3 characters to search for tasks
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

// Kanban Column Component
interface KanbanColumnProps {
  board: MasterBoardTaskResponse;
  tasks: TaskViewModel[];
  onTaskDrop: (taskId: string, boardName: string) => void;
  onAddTask: (boardName: string) => void;
  onEditTask: (task: TaskViewModel) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskViewModel>) => void;
  onRefreshTasks: () => void;
  recentlyMovedTaskId?: string | null;
  DataProject?: ProjectDataResponse | null;
  DataBacklogs?: BacklogDataResponse[];
  isCompactView?: boolean;
}

const KanbanColumn = React.memo<KanbanColumnProps>(({
  board,
  tasks,
  onTaskDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onRefreshTasks,
  recentlyMovedTaskId,
  DataProject,
  DataBacklogs = [],
  isCompactView = false,
}) => {
  const { colorMode } = useColorMode();
  const [newTaskName, setNewTaskName] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string; boardName: string }) => {
      if (item.boardName !== board.boardName) {
        onTaskDrop(item.id, board.boardName);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const getBoardColor = (indexStage: number) => {
    switch (indexStage) {
      case 1:
        return "gray"; // TODO
      case 2:
        return "blue"; // IN PROGRESS
      case 3:
        return "orange"; // REVIEW
      case 4:
        return "green"; // DONE
      default:
        return "purple";
    }
  };

  const handleQuickAddTask = () => {
    if (newTaskName.trim()) {
      // Create a simple task payload
      const quickTask = {
        taskName: newTaskName.trim(),
        taskDesc: "",
        taskPriority: "MEDIUM",
        boardId: board.id,
      };

      // Call the add task function
      onAddTask(board.id);
      setNewTaskName("");
      setIsAddingTask(false);
    }
  };

  const getCompletionStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.percentageStatus === 100,
    ).length;
    const inProgress = tasks.filter(
      (task) => task.percentageStatus > 0 && task.percentageStatus < 100,
    ).length;

    return { total, completed, inProgress };
  };

  const stats = getCompletionStats();

  return (
    <Card
      size="sm"
      variant="outline"
      boxShadow={isOver ? "lg" : colorMode === "light" ? "sm" : "md"}
      _hover={{ boxShadow: "xl" }}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      minH="600px"
      transition="all 0.2s ease"
      rounded={radiusStyle}
    >
      <div ref={dropRef}>
        <CardHeader
          bg={
            colorMode === "light"
              ? `${getBoardColor(board.indexStage)}.50`
              : `${getBoardColor(board.indexStage)}.900`
          }
          roundedTop={radiusStyle}
          borderBottom="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          p={4}
          h="70px"
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading
                  size="sm"
                  color={
                    colorMode === "light"
                      ? `${getBoardColor(board.indexStage)}.600`
                      : `${getBoardColor(board.indexStage)}.200`
                  }
                >
                  {board.boardName}
                </Heading>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getBoardColor(board.indexStage)}
                    size="sm"
                  >
                    {tasks.length} tasks
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </CardHeader>

        <CardBody flex={1} p={2} overflowY="auto">
          <VStack spacing={3} align="stretch">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onRefreshTasks={onRefreshTasks}
                isRecentlyMoved={recentlyMovedTaskId === task.id}
                DataProject={DataProject}
                DataBacklogs={DataBacklogs}
                isCompactView={isCompactView}
              />
            ))}

            {tasks.length === 0 && !isAddingTask && (
              <Box
                p={8}
                textAlign="center"
                color={colorMode === "light" ? "gray.500" : "gray.400"}
                border="2px dashed"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                rounded={radiusStyle}
              >
                <VStack spacing={2}>
                  <FiInbox size={24} />
                  <Text fontSize="sm" fontWeight="medium">
                    No tasks yet
                  </Text>
                  <Text fontSize="xs">
                    Drag tasks here or click "Add a task"
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Drop indicator when dragging over */}
            {isOver && (
              <Box
                p={4}
                border="2px dashed"
                borderColor="blue.400"
                rounded={radiusStyle}
                bg="blue.50"
                textAlign="center"
              >
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Drop task here
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </div>
    </Card>
  );
});

// Main Project Workspace Component with comprehensive features
interface ProjectWorkspaceViewProps {
  isLocked?: boolean;
  backUrl?: string;
}

function ProjectWorkspaceView({
  isLocked = false,
  backUrl = "/workspace",
}: ProjectWorkspaceViewProps) {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  // Project ID and Backlog ID from URL
  const [projectId, setProjectId] = useState<string | null>(null);
  const [backlogIdFromUrl, setBacklogIdFromUrl] = useState<string | null>(null);
  const lockBacklog = isLocked; // Use prop instead of URL parameter

  useEffect(() => {
    const projId = searchParams.get("projectId");
    const backlogId = searchParams.get("backlogId");

    if (projId) {
      setProjectId(projId);
    }
    if (backlogId) {
      setBacklogIdFromUrl(backlogId);
    }
  }, [searchParams]);

  // Data States
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null,
  );
  const [DataBoard, setDataBoard] = useState<MasterBoardTaskResponse[]>([]);
  const [DataTasks, setDataTasks] = useState<TaskViewModel[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Loading steps for initialization
  type LoadingStep =
    | "init"
    | "project"
    | "boards"
    | "backlogs"
    | "tasks"
    | "ready";
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("init");
  const [isInitializing, setIsInitializing] = useState(true);

  // Track recently moved task for visual feedback
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(
    null,
  );

  // Track drop preview position for visual feedback during drag
  const [dropPreview, setDropPreview] = useState<{
    boardId: string;
    beforeTaskId: string | null;
    afterTaskId: string | null;
  } | null>(null);

  // Archived tasks drawer state
  const [archivedTasks, setArchivedTasks] = useState<TaskViewModel[]>([]);
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Modal States
  const {
    isOpen: isTaskModalOpen,
    onOpen: onTaskModalOpen,
    onClose: onTaskModalClose,
  } = useDisclosure();
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
  } = useDisclosure();

  const [selectedTask, setSelectedTask] = useState<TaskViewModel | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [taskForm, setTaskForm] = useState({
    taskName: "",
    taskDesc: "",
    taskPriority: "MEDIUM",
    taskStartDate: "",
    taskEndDate: "",
    boardName: "",
    backlogId: "",
  });

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterBacklog, setFilterBacklog] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

  // API Hooks
  const { GetDetailById: GetProjectDetail } = useProjects();
  const { List: GetMasterBoardTasks } = useMasterBoardTask();
  const { ListBacklog, GetDetailById: GetRequirementDetail } =
    useRequirements();
  const {
    ListTasksBoard,
    ListTasksBoardPaged,
    ListTasksPaged,
    CreateSimpleTask,
    CreateTask,
    CreateBulkTasks,
    CreateTaskItem,
    UpdateTaskItem,
    AssignUsersTask,
    MoveTask,
    UpdateTask,
    GenerateKanbanBoard,
  } = useTasks();
  const { List: ListUsers } = useUsers();

  // Bulk JSON Import Modal states & 3-Step Wizard
  const {
    isOpen: isJsonImportOpen,
    onOpen: onJsonImportOpen,
    onClose: onJsonImportClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmBulkOpen,
    onOpen: onConfirmBulkOpen,
    onClose: onConfirmBulkClose,
  } = useDisclosure();
  const [wizardStep, setWizardStep] = useState<"input" | "preview" | "summary">("input");
  const [jsonImportText, setJsonImportText] = useState<string>("");
  const [jsonImportError, setJsonImportError] = useState<string>("");
  const [isImportingJson, setIsImportingJson] = useState<boolean>(false);
  const [jsonImportResult, setJsonImportResult] = useState<{
    total?: number;
    success: number;
    failed: number;
  } | null>(null);
  const [stagedTasks, setStagedTasks] = useState<any[]>([]);
  const [previewFilter, setPreviewFilter] = useState<"all" | "duplicates" | "excluded">("all");
  const [previewSearch, setPreviewSearch] = useState<string>("");
  const [editingStagedTaskId, setEditingStagedTaskId] = useState<string | null>(null);
  const [editingTaskDraft, setEditingTaskDraft] = useState<any>({});
  const [assignOption, setAssignOption] = useState<"currentUser" | "custom" | "original">("currentUser");
  const [customAssigneeIds, setCustomAssigneeIds] = useState<string[]>([]);
  const jsonGutterRef = useRef<HTMLDivElement>(null);
  const jsonHighlightRef = useRef<HTMLPreElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Users data for assignment
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [DataBacklogs, setDataBacklogs] = useState<BacklogDataResponse[]>([]);

  // Handle backlog filter change and update URL
  const handleBacklogFilterChange = (backlogId: string) => {
    setFilterBacklog(backlogId);

    if (projectId) {
      const params = new URLSearchParams();
      params.set("projectId", projectId);

      if (backlogId) {
        params.set("backlogId", backlogId);
      }

      router.push(`?${params.toString()}`);
    }
  };

  // Handle task creation - refresh data after task is created
  const handleTaskCreated = () => {
    setRefreshData(RefreshData + 1);
  };

  // Load archived tasks
  const loadArchivedTasks = async () => {
    if (!DataAuth || !tokenData || !projectId) return;

    setIsLoadingArchived(true);
    try {
      const PayloadGetArchivedTasks: PaggingListPayloadCustom = {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [
          {
            field: "projectId",
            operator: "=",
            value: projectId,
          },
          {
            field: "isArchived",
            operator: "=",
            value: "Y",
          },
        ],
        fieldOrder: ["updatedAt"],
        orderDir: "desc",
      };

      const response = await ListTasksPaged(PayloadGetArchivedTasks, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setArchivedTasks(response.data);
      } else {
        setArchivedTasks([]);
      }
    } catch (error) {
      console.error("Error loading archived tasks:", error);
      setArchivedTasks([]);
    } finally {
      setIsLoadingArchived(false);
    }
  };

  // Consolidated initialization function - optimized with parallel fetching
  const initializeKanban = async () => {
    if (!DataAuth || !projectId || !tokenData) return;

    try {
      setIsInitializing(true);
      setLoadingStep("init");
      await delay(200);

      // Prepare payloads
      const boardPayload: PaggingListPayloadCustom = {
        search: "",
        limit: 100,
        page: 0,
        filterWhere: [{ field: "isDisplay", operator: "=", value: "Y" }],
        fieldOrder: ["indexStage"],
        orderDir: "asc",
      };

      const backlogPayload: PaggingListPayload = {
        search: "",
        limit: 100,
        page: 0,
        filterWhere: [
          {
            field: "projectId",
            operator: "=",
            value: projectId,
          },
        ],
        fieldOrder: ["backlogName"],
        orderDir: "asc",
      };

      const taskPayload: PaggingListPayloadCustom = {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [
          { field: "projectId", operator: "=", value: projectId },
          { field: "isArchived", operator: "=", value: "N" },
        ],
        fieldOrder: ["indexTask"],
        orderDir: "asc",
      };

      // Show loading progress
      setLoadingStep("project");
      await delay(200);
      
      // Fetch all data in parallel
      const [projectResponse, boardResponse, backlogResponse, taskResponse] = 
        await Promise.all([
          GetProjectDetail(projectId, tokenData),
          GetMasterBoardTasks(boardPayload, tokenData),
          ListBacklog(backlogPayload, tokenData),
          ListTasksPaged(taskPayload, tokenData),
        ]);

      // Update loading step
      setLoadingStep("boards");
      await delay(200);

      // Handle project response
      if (projectResponse?.statusCode === 404) {
        router.push("/not-found");
        return;
      }

      if (projectResponse?.statusCode === RES_CODE_OK) {
        setDataProject(projectResponse.data as ProjectDataResponse);
      } else {
        throw new Error(projectResponse?.message || "Failed to load project");
      }

      // Update loading step
      setLoadingStep("backlogs");
      await delay(200);

      // Handle board response
      if (boardResponse?.statusCode === RES_CODE_OK) {
        setDataBoard(boardResponse.data as MasterBoardTaskResponse[]);
      } else {
        throw new Error(
          boardResponse?.message || "Failed to load board configuration",
        );
      }

      // Update loading step
      setLoadingStep("tasks");
      await delay(200);

      // Handle backlog response
      if (backlogResponse?.statusCode === RES_CODE_OK) {
        setDataBacklogs(backlogResponse.data as BacklogDataResponse[]);
      }

      // Handle task response
      if (taskResponse?.statusCode === RES_CODE_OK) {
        setDataTasks(taskResponse.data as TaskViewModel[]);
        setLastUpdated(new Date());
      } else {
        throw new Error(taskResponse?.message || "Failed to load tasks");
      }

      setLoadingStep("ready");
      await delay(200);
    } catch (error: any) {
      console.error("Error initializing kanban:", error);
      showToast({
        description:
          error.message || "An error occurred while loading workspace",
        statusToast: "error",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (
      DataAuth &&
      projectId &&
      tokenData &&
      isInitializing &&
      loadingStep === "init"
    ) {
      initializeKanban();
    }
  }, [DataAuth, projectId, tokenData]);

  // Validate backlogId from URL and auto-select if valid
  useEffect(() => {
    if (projectId && backlogIdFromUrl && DataBacklogs.length > 0) {
      const backlogExists = DataBacklogs.some(
        (backlog) => backlog.id === backlogIdFromUrl,
      );

      if (backlogExists) {
        setFilterBacklog(backlogIdFromUrl);
      } else {
        router.push("/not-found");
      }
    }
  }, [DataBacklogs, projectId, backlogIdFromUrl, router]);

  // Fetch requirement data if project has reqParentId
  useEffect(() => {
    if (DataProject?.reqParentId && tokenData) {
      const LoadRequirementData = async () => {
        const response = await GetRequirementDetail(
          DataProject.reqParentId!,
          tokenData,
        );
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setDataProject((prev) =>
            prev ? { ...prev, requirementData: response.data as any } : null,
          );
        }
      };
      LoadRequirementData();
    }
  }, [DataProject?.reqParentId, tokenData]);

  // Refresh Project Tasks (triggered by RefreshData changes after initialization)
  useEffect(() => {
    if (
      DataAuth &&
      projectId &&
      tokenData &&
      !isInitializing &&
      RefreshData > 0
    ) {
      const fetchProjectTasks = async () => {
        try {
          setIsLoadingProcess(true);

          const PayloadList: PaggingListPayloadCustom = {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [
              {
                field: "projectId",
                operator: "=",
                value: projectId,
              },
              {
                field: "isArchived",
                operator: "=",
                value: "N",
              },
            ],
            fieldOrder: ["indexTask"],
            orderDir: "asc",
          };

          const response = await ListTasksPaged(PayloadList, tokenData);

          if (response?.statusCode === RES_CODE_OK) {
            const tasks = response.data as TaskViewModel[];
            setDataTasks(tasks);
            setLastUpdated(new Date());
          } else {
            showToast({
              description: response?.message || "Failed to load project tasks",
              statusToast: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching project tasks:", error);
          showToast({
            description: "An error occurred while loading project tasks",
            statusToast: "error",
          });
        } finally {
          setIsLoadingProcess(false);
        }
      };

      fetchProjectTasks();
    }
  }, [RefreshData]);

  // Smart Polling for Real-time Updates (Multi-device sync)
  useEffect(() => {
    if (!DataAuth || !projectId || !tokenData) return;

    let pollInterval: NodeJS.Timeout;

    const startPolling = () => {
      pollInterval = setInterval(() => {
        // Only poll when tab is visible and not currently loading
        if (!document.hidden && !IsLoadingProcess) {
          setRefreshData((prev) => prev + 1);
        }
      }, 5000); // 5 seconds interval
    };

    // Start polling
    startPolling();

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(pollInterval);
      } else {
        startPolling();
      }
    };

    // Handle window focus (immediate refresh when user returns)
    const handleFocus = () => {
      if (!IsLoadingProcess) {
        setRefreshData((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [DataAuth, projectId, tokenData, IsLoadingProcess]);

  // Handle Task Drop with dynamic board loading from task's backlog
  const handleTaskDrop = async (taskId: string, targetBoardName: string) => {
    // 1. Find the task being moved
    const taskToMove = DataTasks.find((task) => task.id === taskId);
    if (!taskToMove) {
      showToast({
        description: "Task not found",
        statusToast: "error",
      });
      return;
    }

    // Save original task for rollback
    const originalTask = { ...taskToMove };

    console.log(
      "Moving task:",
      taskToMove.taskName,
      "to board:",
      targetBoardName,
    );
    console.log("Task backlogId:", taskToMove.backlogId);

    try {
      setIsLoadingProcess(true);

      // 2. Load task boards from the task's backlog
      const taskBoardResponse = await ListTasksBoard(
        taskToMove.backlogId!,
        tokenData,
      );

      if (taskBoardResponse?.statusCode !== RES_CODE_OK) {
        showToast({
          description: "Failed to load task board configuration from backlog",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      const taskBoards = taskBoardResponse.data as TaskBoardViewModel[];

      console.log(
        "Loaded task boards from backlog:",
        taskBoards.map((b) => b.boardName),
      );

      // 3. Find target board
      const targetBoard = taskBoards.find(
        (board) => board.boardName === targetBoardName,
      );
      if (!targetBoard) {
        console.error(
          "Available boards:",
          taskBoards.map((b) => b.boardName),
        );
        console.error("Looking for board:", targetBoardName);
        showToast({
          description: `Target board "${targetBoardName}" not found in task's backlog configuration`,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      console.log("Found target board:", targetBoard);

      // 4. Calculate new index
      const tasksInTargetBoard = DataTasks.filter(
        (task) =>
          task.boardName === targetBoardName &&
          task.backlogId === taskToMove.backlogId,
      );
      const newIndex =
        tasksInTargetBoard.length > 0
          ? Math.max(...tasksInTargetBoard.map((t) => t.indexTask)) + 10
          : 10;

      // 5. OPTIMISTIC UPDATE - Update state immediately
      const optimisticTasks = DataTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            boardName: targetBoardName,
            indexTask: newIndex,
            indexStage: targetBoard.indexStage,
          };
        }
        return task;
      });

      setDataTasks(optimisticTasks);
      setRecentlyMovedTaskId(taskId);
      setIsLoadingProcess(false);

      // 6. Call API in background
      const payload: TaskMovePayload = {
        id: taskId,
        boardId: targetBoard.id,
        indexTask: newIndex,
        indexStage: targetBoard.indexStage,
      };

      console.log("Move task payload:", payload);

      const response = await MoveTask(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        // Success - task already in correct position
        showToast({
          description: `Task moved to ${targetBoard.boardName}`,
          statusToast: "success",
        });

        // Clear highlight after 2 seconds
        setTimeout(() => {
          setRecentlyMovedTaskId(null);
        }, 2000);
      } else {
        // API failed - rollback to original position
        throw new Error(response?.message || "Failed to move task");
      }
    } catch (error: any) {
      console.error("Error moving task:", error);

      // ROLLBACK - Restore original task position
      const rolledBackTasks = DataTasks.map((task) =>
        task.id === taskId ? originalTask : task
      );

      setDataTasks(rolledBackTasks);
      setRecentlyMovedTaskId(null);

      showToast({
        description: error.message || "An error occurred while moving task",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Handle Add Task
  const handleAddTask = (boardName: string) => {
    const targetBoard = DataBoard.find(
      (board) => board.boardName === boardName,
    );

    setSelectedTask(null);
    setSelectedBoardId("");
    setTaskForm({
      taskName: "",
      taskDesc: "",
      taskPriority: "MEDIUM",
      taskStartDate: "",
      taskEndDate: "",
      boardName: targetBoard?.boardName || boardName,
      backlogId: lockBacklog && filterBacklog ? filterBacklog : "",
    });
    onTaskModalOpen();
  };

  // Handle Edit Task
  const handleEditTask = (task: TaskViewModel) => {
    setSelectedTask(task);
    setSelectedBoardId(task.boardId);
    setTaskForm({
      taskName: task.taskName,
      taskDesc: task.taskDesc || "",
      taskPriority: task.taskPriority || "MEDIUM",
      taskStartDate: task.startDate || "",
      taskEndDate: task.endDate || "",
      boardName: task.boardName || "",
      backlogId: task.backlogId || "",
    });
    onTaskModalOpen();
  };

  // Handle Update Task (for inline edits)
  const handleUpdateTask = async (
    taskId: string,
    updates: Partial<TaskViewModel>,
  ) => {
    try {
      setIsAutoSaving(true);

      const task = DataTasks.find((t) => t.id === taskId);
      if (!task) return;

      const payload: TaskUpdatePayload = {
        id: taskId,
        boardId: task.boardId || "",
        taskName: updates.taskName || task.taskName,
        taskDesc: updates.taskDesc || task.taskDesc || "",
        taskPriority: updates.taskPriority || task.taskPriority || "MEDIUM",
        startDate: updates.startDate || task.startDate || undefined,
        endDate: updates.endDate || task.endDate || undefined,
        indexTask: task.indexTask || 0,
        taskPoint: task.taskPoint || 0,
        percentageStatus:
          updates.percentageStatus || task.percentageStatus || 0,
      };

      const response = await UpdateTask(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state immediately for better UX
        setDataTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task,
          ),
        );

        showToast({
          description: "Task updated successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to update task",
          statusToast: "error",
        });
        // Refresh to get correct data
        setRefreshData((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast({
        description: "An error occurred while updating task",
        statusToast: "error",
      });
      // Refresh to get correct data
      setRefreshData((prev) => prev + 1);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Handle Save Task (from modal)
  const handleSaveTask = async () => {
    if (!taskForm.taskName.trim()) {
      showToast({
        description: "Task name is required",
        statusToast: "error",
      });
      return;
    }

    if (!selectedTask && !taskForm.backlogId) {
      showToast({
        description: "Please select a backlog for the task",
        statusToast: "error",
      });
      return;
    }

    try {
      setIsLoadingProcess(true);

      if (selectedTask) {
        // Update existing task
        const payload: TaskUpdatePayload = {
          id: selectedTask.id,
          boardId: selectedTask.boardId || "",
          taskName: taskForm.taskName,
          taskDesc: taskForm.taskDesc,
          taskPriority: taskForm.taskPriority,
          startDate: taskForm.taskStartDate || undefined,
          endDate: taskForm.taskEndDate || undefined,
          indexTask: selectedTask.indexTask || 0,
          taskPoint: selectedTask.taskPoint || 0,
          percentageStatus: selectedTask.percentageStatus || 0,
        };

        const response = await UpdateTask(payload, tokenData);

        if (response?.statusCode === RES_CODE_OK) {
          setRefreshData((prev) => prev + 1);
          showToast({
            description: "Task updated successfully",
            statusToast: "success",
          });
          onTaskModalClose();
        } else {
          showToast({
            description: response?.message || "Failed to update task",
            statusToast: "error",
          });
        }
      } else {
        // Create new task
        if (!taskForm.backlogId) {
          showToast({
            description: "Please select a backlog",
            statusToast: "warning",
          });
          setIsLoadingProcess(false);
          return;
        }

        // Try to get boardId from existing tasks first
        const tasksInBoard = DataTasks.filter(
          (task) =>
            task.boardName === taskForm.boardName &&
            task.backlogId === taskForm.backlogId,
        );
        let actualBoardId =
          tasksInBoard.length > 0 ? tasksInBoard[0].boardId : "";

        // If no boardId found from tasks, fetch boards for this backlog
        if (!actualBoardId && projectId && tokenData) {
          const boardPayload: PaggingListPayloadCustom = {
            search: "",
            limit: 100,
            page: 0,
            filterWhere: [
              { field: "projectId", value: projectId, operator: "=" },
              { field: "backlogId", value: taskForm.backlogId, operator: "=" },
              { field: "boardName", value: taskForm.boardName, operator: "=" },
            ],
            fieldOrder: ["indexStage"],
            orderDir: "asc",
          };

          const boardResponse = await ListTasksBoardPaged(
            boardPayload,
            tokenData,
          );

          if (
            boardResponse?.statusCode === RES_CODE_OK &&
            boardResponse.data &&
            boardResponse.data.length > 0
          ) {
            // Board exists, use it
            actualBoardId = boardResponse.data[0].id;
          } else {
            // Board doesn't exist, generate it
            const genPayload: GenerateTaskBoardPayload = {
              backlogId: taskForm.backlogId,
              projectId,
            };
            const genResponse = await GenerateKanbanBoard(
              genPayload,
              tokenData,
            );

            if (genResponse?.statusCode !== RES_CODE_OK) {
              showToast({
                description: genResponse?.message || "Failed to generate board",
                statusToast: "error",
              });
              setIsLoadingProcess(false);
              return;
            }

            // Fetch the newly created board
            await new Promise((resolve) => setTimeout(resolve, 500));
            const newBoardResponse = await ListTasksBoardPaged(
              boardPayload,
              tokenData,
            );
            if (
              newBoardResponse?.statusCode === RES_CODE_OK &&
              newBoardResponse.data &&
              newBoardResponse.data.length > 0
            ) {
              actualBoardId = newBoardResponse.data[0].id;
            }
          }
        }

        if (!actualBoardId) {
          showToast({
            description: "Failed to initialize board",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        const taskCode = `TASK-${Date.now()}`;
        const payload: TaskCreatePayload = {
          taskName: taskForm.taskName,
          taskCode: taskCode,
          boardId: actualBoardId,
          projectId: projectId || undefined,
          backlogId: taskForm.backlogId || undefined,
          taskDesc: taskForm.taskDesc || undefined,
          taskPriority: taskForm.taskPriority,
          startDate: taskForm.taskStartDate || undefined,
          endDate: taskForm.taskEndDate || undefined,
        };

        const response = await CreateTask(payload, tokenData);

        if (response?.statusCode === RES_CODE_OK) {
          setRefreshData((prev) => prev + 1);
          showToast({
            description: "Task created successfully",
            statusToast: "success",
          });
          onTaskModalClose();
        } else {
          showToast({
            description: response?.message || "Failed to create task",
            statusToast: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
      showToast({
        description: "An error occurred while saving task",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Handle Delete Task (not available in useTasks)
  const handleDeleteTask = async (taskId: string) => {
    showToast({
      description: "Delete functionality not available",
      statusToast: "warning",
    });
  };

  interface BulkImportTaskEntry {
    boardName: string;
    taskName: string;
    taskDesc?: string;
    taskPriority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    startDate?: string;
    endDate?: string;
    backlogId?: string;
    backlogName?: string;
    taskItems?: (
      | string
      | {
          taskItemName?: string;
          name?: string;
          title?: string;
          text?: string;
          isChecked?: boolean | string;
          isDone?: boolean | string;
          checked?: boolean;
          done?: boolean;
          completed?: boolean;
        }
    )[];
    subtasks?: (
      | string
      | {
          taskItemName?: string;
          name?: string;
          title?: string;
          text?: string;
          isChecked?: boolean | string;
          isDone?: boolean | string;
          checked?: boolean;
          done?: boolean;
          completed?: boolean;
        }
    )[];
    checklist?: (
      | string
      | {
          taskItemName?: string;
          name?: string;
          title?: string;
          text?: string;
          isChecked?: boolean | string;
          isDone?: boolean | string;
          checked?: boolean;
          done?: boolean;
          completed?: boolean;
        }
    )[];
    assignedTask?: string[];
    team?: string[];
    assignees?: string[];
  }

  const handleExecuteBulkImport = async () => {
    setJsonImportError("");
    setJsonImportResult(null);

    const activeTasks = stagedTasks.filter((t) => !t.isExcluded);
    if (activeTasks.length === 0) {
      showToast({
        description: "Please include at least one task to proceed.",
        statusToast: "warning",
      });
      return;
    }

    if (!projectId || !tokenData) {
      setJsonImportError("No project or authentication session available.");
      showToast({
        description: "Authentication or project context missing.",
        statusToast: "error",
      });
      return;
    }

    setIsImportingJson(true);

    const normalizeDateTime = (val?: string) => {
      if (!val?.trim()) return undefined;
      const trimmed = val.trim();
      return trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`;
    };

    const effectiveBacklogId = filterBacklog || DataBacklogs[0]?.id || null;
    const defaultBoardId = DataBoard[0]?.id || null;

    const payload: TasksBulkCreatePayload = {
      projectId: projectId,
      defaultBacklogId: effectiveBacklogId,
      defaultBoardId: defaultBoardId,
      globalAssignOption: assignOption,
      globalCustomUserIds: assignOption === "custom" ? customAssigneeIds : undefined,
      tasks: activeTasks.map((t) => {
        const targetBoard = DataBoard.find(
          (b) => b.boardName.toLowerCase() === (t.boardName || "").toLowerCase()
        );
        return {
          backlogId: t.backlogId || null,
          boardId: targetBoard?.id || null,
          boardName: t.boardName || null,
          taskName: t.taskName.trim(),
          taskDesc: t.taskDesc?.trim() || null,
          taskPriority: t.taskPriority || "MEDIUM",
          startDate: normalizeDateTime(t.startDate),
          endDate: normalizeDateTime(t.endDate),
          taskPoint: t.taskPoint || 0,
          taskItems:
            t.taskItems
              ?.map((ti: any) =>
                typeof ti === "string" ? ti.trim() : (ti.taskItemName || ti.name || "").trim()
              )
              .filter(Boolean) || [],
          assigneeUserIds:
            assignOption === "original"
              ? Array.isArray(t.assignedTask)
                ? t.assignedTask
                : t.assignedTask
                ? [t.assignedTask]
                : undefined
              : undefined,
        };
      }),
    };

    try {
      const res = await CreateBulkTasks(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK && res?.data) {
        const createdCount = res.data.totalTasksCreated || activeTasks.length;
        const subtasksCount = res.data.totalSubtasksCreated || 0;
        setJsonImportResult({ success: createdCount, failed: 0 });
        showToast({
          description:
            res.message ||
            `Successfully imported ${createdCount} task(s) and ${subtasksCount} checklist item(s)!`,
          statusToast: "success",
        });
        onConfirmBulkClose();
        onJsonImportClose();
        setJsonImportText("");
        setWizardStep("input");
        setStagedTasks([]);
        setRefreshData((prev) => prev + 1);
      } else {
        const errMsg = res?.message || "Failed to bulk create tasks";
        setJsonImportError(errMsg);
        showToast({
          description: errMsg,
          statusToast: "error",
        });
        onConfirmBulkClose();
      }
    } catch (err: any) {
      console.error("Bulk JSON import error:", err);
      const errMsg = err?.message || "An error occurred while executing bulk task import.";
      setJsonImportError(errMsg);
      showToast({
        description: errMsg,
        statusToast: "error",
      });
      onConfirmBulkClose();
    } finally {
      setIsImportingJson(false);
    }
  };

  const currentBacklog = useMemo(() => {
    return (
      DataBacklogs.find((b) => b.id === filterBacklog) ||
      DataBacklogs[0] ||
      null
    );
  }, [DataBacklogs, filterBacklog]);

  const jsonImportExample = useMemo(() => {
    const exampleBoardName = DataBoard[0]?.boardName || "TO DO";
    const exampleSecondBoardName = DataBoard[1]?.boardName || exampleBoardName;

    const allProjectBacklogs =
      DataBacklogs.length > 0
        ? DataBacklogs.map((b) => ({
            backlogId: b.id,
            backlogName: b.backlogName,
          }))
        : [
            {
              backlogId: filterBacklog || "bkl-default",
              backlogName: currentBacklog?.backlogName || "Sprint Backlog",
            },
          ];

    const examplePayload = {
      header: {
        projectId: projectId || "",
        projectName: DataProject?.projectName || "",
        backlogs: allProjectBacklogs,
      },
      tasks: [
        {
          boardName: exampleBoardName,
          backlogId: allProjectBacklogs[0]?.backlogId || filterBacklog || "",
          taskName: "Implement Hard Token OTP Validation Service",
          taskDesc:
            "Integrate challenge-response OTP service with authentication gateway following security standards and PCI-DSS requirements.",
          taskPriority: "HIGH",
          startDate: "2026-10-01T09:00:00",
          endDate: "2026-10-05T18:00:00",
          taskItems: [
            {
              taskItemName: "Define OTP challenge-response DTO schema",
              isChecked: true,
            },
            {
              taskItemName:
                "Implement token validation logic in AuthService",
              isChecked: false,
            },
            {
              taskItemName:
                "Add rate limiting (max 3 failed attempts in 5 mins)",
              isChecked: false,
            },
            {
              taskItemName: "Write unit and integration tests",
              isChecked: false,
            },
          ],
        },
        {
          boardName: exampleSecondBoardName,
          backlogId:
            allProjectBacklogs[1]?.backlogId ||
            allProjectBacklogs[0]?.backlogId ||
            filterBacklog ||
            "",
          taskName: "Biometric Authentication Fallback Mechanism",
          taskDesc:
            "Provide PIN fallback when biometric authentication fails or is disabled by user settings.",
          taskPriority: "MEDIUM",
          startDate: "2026-10-06T09:00:00",
          endDate: "2026-10-08T18:00:00",
          taskItems: [
            {
              taskItemName: "Handle FaceID / Fingerprint failure callbacks",
              isChecked: true,
            },
            {
              taskItemName: "Create 6-digit MPIN input keypad UI",
              isChecked: true,
            },
            {
              taskItemName: "Verify fallback flow end-to-end",
              isChecked: false,
            },
          ],
        },
      ],
    };

    return JSON.stringify(examplePayload, null, 2);
  }, [
    DataBoard,
    DataProject,
    projectId,
    currentBacklog,
    filterBacklog,
    DataBacklogs,
  ]);

  const jsonImportTasksOnlyExample = useMemo(() => {
    const exampleBoardName = DataBoard[0]?.boardName || "TO DO";
    const exampleSecondBoardName = DataBoard[1]?.boardName || exampleBoardName;
    const targetBacklogId =
      currentBacklog?.id || filterBacklog || DataBacklogs[0]?.id || "";

    const exampleTasks = [
      {
        boardName: exampleBoardName,
        backlogId: targetBacklogId,
        taskName: "Implement Hard Token OTP Validation Service",
        taskDesc:
          "Integrate challenge-response OTP service with authentication gateway following security standards and PCI-DSS requirements.",
        taskPriority: "HIGH",
        startDate: "2026-10-01T09:00:00",
        endDate: "2026-10-05T18:00:00",
        taskItems: [
          {
            taskItemName: "Define OTP challenge-response DTO schema",
            isChecked: true,
          },
          {
            taskItemName: "Implement token validation logic in AuthService",
            isChecked: false,
          },
          {
            taskItemName:
              "Add rate limiting (max 3 failed attempts in 5 mins)",
            isChecked: false,
          },
          {
            taskItemName: "Write unit and integration tests",
            isChecked: false,
          },
        ],
      },
      {
        boardName: exampleSecondBoardName,
        backlogId: DataBacklogs[1]?.id || targetBacklogId,
        taskName: "Biometric Authentication Fallback Mechanism",
        taskDesc:
          "Provide PIN fallback when biometric authentication fails or is disabled by user settings.",
        taskPriority: "MEDIUM",
        startDate: "2026-10-06T09:00:00",
        endDate: "2026-10-08T18:00:00",
        taskItems: [
          {
            taskItemName: "Handle FaceID / Fingerprint failure callbacks",
            isChecked: true,
          },
          {
            taskItemName: "Create 6-digit MPIN input keypad UI",
            isChecked: true,
          },
          {
            taskItemName: "Verify fallback flow end-to-end",
            isChecked: false,
          },
        ],
      },
    ];

    return JSON.stringify(exampleTasks, null, 2);
  }, [DataBoard, currentBacklog, filterBacklog, DataBacklogs]);

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonImportText(content);
        setJsonImportError("");
        showToast({
          description: `Loaded file: ${file.name}`,
          statusToast: "info",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(jsonImportExample);
    showToast({
      description: "JSON template copied to clipboard",
      statusToast: "success",
    });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([jsonImportExample], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeProjectNo = (DataProject?.projectNo || "project").replace(/[/\\?%*:|"<>]/g, "-");
    link.download = `kanban-template-${safeProjectNo}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({
      description: "JSON template downloaded",
      statusToast: "success",
    });
  };

  const renderHighlightedJson = (line: string, keyIdx: React.Key) => {
    const isDark = colorMode === "dark";
    const tokenRegex =
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(e[+-]?\d+)?|[{}\[\],])/g;
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
          ? isDark
            ? "#79c0ff"
            : "#0550ae"
          : isDark
          ? "#a5d6ff"
          : "#0a3069";
      } else if (/^(true|false|null)$/.test(token)) {
        color = isDark ? "#ff7b72" : "#cf222e";
      } else if (/^-?\d/.test(token)) {
        color = isDark ? "#79c0ff" : "#0550ae";
      } else if (/^[{}\[\],]$/.test(token)) {
        color = isDark ? "#e3b341" : "#953800";
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

  const computeStringSimilarity = (s1: string, s2: string): number => {
    const norm1 = s1.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const norm2 = s2.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!norm1 || !norm2) return 0;
    if (norm1 === norm2) return 1;
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return (Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length)) * 0.95;
    }

    const getBigrams = (str: string) => {
      const map = new Map<string, number>();
      for (let i = 0; i < str.length - 1; i++) {
        const bg = str.substring(i, i + 2);
        map.set(bg, (map.get(bg) || 0) + 1);
      }
      return map;
    };

    const b1 = getBigrams(norm1);
    const b2 = getBigrams(norm2);
    let intersection = 0;
    let total = 0;

    b1.forEach((count, bg) => {
      total += count;
      if (b2.has(bg)) {
        intersection += Math.min(count, b2.get(bg)!);
      }
    });
    b2.forEach((count) => {
      total += count;
    });

    return total > 0 ? (2 * intersection) / total : 0;
  };

  const handleProceedToPreview = () => {
    setJsonImportError("");
    setJsonImportResult(null);

    const effectiveBacklogId = filterBacklog || DataBacklogs[0]?.id;
    if (!projectId) {
      setJsonImportError("No project session available.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonImportText);
    } catch {
      setJsonImportError(
        "Invalid JSON format. Please verify missing quotes, brackets, or trailing commas."
      );
      return;
    }

    let entries: BulkImportTaskEntry[] = [];
    if (Array.isArray(parsed)) {
      entries = parsed.filter(
        (item): item is BulkImportTaskEntry =>
          !!item &&
          typeof item === "object" &&
          (typeof (item as any).taskName === "string" ||
            typeof (item as any).boardName === "string")
      );
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, any>;
      const candidateList =
        obj.tasks || obj.items || (Array.isArray(obj.data) ? obj.data : null);

      if (Array.isArray(candidateList)) {
        entries = candidateList.filter(
          (item): item is BulkImportTaskEntry =>
            !!item &&
            typeof item === "object" &&
            (typeof (item as any).taskName === "string" ||
              typeof (item as any).boardName === "string")
        );
      }
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      setJsonImportError(
        'JSON must contain a "tasks" array or an array of task objects with "boardName" and "taskName".'
      );
      return;
    }

    const headerBacklogs: Array<{ backlogId?: string; id?: string; backlogName?: string; name?: string }> =
      parsed && typeof parsed === "object" && Array.isArray((parsed as any).header?.backlogs)
        ? (parsed as any).header.backlogs
        : [];

    const stagedList: any[] = [];

    entries.forEach((entry, idx) => {
      if (!entry.taskName?.trim() || !entry.boardName?.trim()) return;

      const targetBoard = DataBoard.find(
        (b) => b.boardName.toLowerCase() === entry.boardName.trim().toLowerCase()
      );

      let taskBacklogId = entry.backlogId?.trim() || "";
      let matchedBacklogName = entry.backlogName?.trim() || "";

      if (taskBacklogId) {
        const inProject = DataBacklogs.find((b) => b.id === taskBacklogId);
        const inHeader = headerBacklogs.find((b) => (b.backlogId || b.id) === taskBacklogId);
        matchedBacklogName = inProject?.backlogName || inHeader?.backlogName || inHeader?.name || matchedBacklogName || "Backlog";
      } else if (matchedBacklogName) {
        const inProject = DataBacklogs.find((b) => b.backlogName.toLowerCase() === matchedBacklogName.toLowerCase());
        const inHeader = headerBacklogs.find((b) => (b.backlogName || b.name || "").toLowerCase() === matchedBacklogName.toLowerCase());
        if (inProject) {
          taskBacklogId = inProject.id;
          matchedBacklogName = inProject.backlogName;
        } else if (inHeader) {
          taskBacklogId = inHeader.backlogId || inHeader.id || "";
          matchedBacklogName = inHeader.backlogName || inHeader.name || matchedBacklogName;
        }
      }

      if (!taskBacklogId) {
        taskBacklogId = effectiveBacklogId || "";
        matchedBacklogName = DataBacklogs.find((b) => b.id === taskBacklogId)?.backlogName || currentBacklog?.backlogName || "General Backlog";
      }

      // Parse subtasks / checklists
      const subtasks: { taskItemName: string; isChecked: boolean }[] = [];
      const rawSubtasks = entry.taskItems || entry.subtasks || entry.checklist;
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

          if (itemName) {
            subtasks.push({ taskItemName: itemName, isChecked: isItemChecked });
          }
        }
      }

      // Duplicate detection against existing board tasks and batch items
      let highestSim = 0;
      let bestMatchName = "";
      let matchSource: "board" | "batch" = "board";

      for (const existing of DataTasks) {
        const sim = computeStringSimilarity(entry.taskName, existing.taskName);
        if (sim > highestSim) {
          highestSim = sim;
          bestMatchName = existing.taskName;
          matchSource = "board";
        }
      }

      for (const prior of stagedList) {
        const sim = computeStringSimilarity(entry.taskName, prior.taskName);
        if (sim > highestSim) {
          highestSim = sim;
          bestMatchName = prior.taskName;
          matchSource = "batch";
        }
      }

      const duplicateInfo =
        highestSim >= 0.70
          ? {
              isDuplicate: true,
              similarityScore: Math.round(highestSim * 100),
              matchedName: bestMatchName,
              source: matchSource,
            }
          : undefined;

      stagedList.push({
        stagedId: `staged-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        taskName: entry.taskName.trim(),
        boardName: targetBoard ? targetBoard.boardName : entry.boardName.trim(),
        boardId: targetBoard?.id,
        backlogId: taskBacklogId,
        backlogName: matchedBacklogName,
        taskDesc: entry.taskDesc?.trim() || "",
        taskPriority: entry.taskPriority || "MEDIUM",
        startDate: entry.startDate,
        endDate: entry.endDate,
        taskItems: subtasks,
        assignedTask: entry.assignedTask || entry.team || entry.assignees,
        isExcluded: false,
        duplicateInfo,
      });
    });

    if (stagedList.length === 0) {
      setJsonImportError("No valid task entries found in JSON.");
      return;
    }

    setStagedTasks(stagedList);
    setWizardStep("preview");
  };

  const handleToggleExclude = (stagedId: string) => {
    setStagedTasks((prev) =>
      prev.map((t) =>
        t.stagedId === stagedId ? { ...t, isExcluded: !t.isExcluded } : t
      )
    );
  };

  const handleRenameWithSuffix = (stagedId: string) => {
    setStagedTasks((prev) =>
      prev.map((t) => {
        if (t.stagedId === stagedId) {
          return {
            ...t,
            taskName: `${t.taskName} (Rev ${Date.now().toString().slice(-3)})`,
            duplicateInfo: undefined,
          };
        }
        return t;
      })
    );
  };

  const handleStartEdit = (task: any) => {
    setEditingStagedTaskId(task.stagedId);
    setEditingTaskDraft({ ...task });
  };

  const handleSaveEdit = () => {
    if (!editingStagedTaskId) return;
    setStagedTasks((prev) =>
      prev.map((t) =>
        t.stagedId === editingStagedTaskId
          ? {
              ...t,
              taskName: editingTaskDraft.taskName || t.taskName,
              boardName: editingTaskDraft.boardName || t.boardName,
              taskPriority: editingTaskDraft.taskPriority || t.taskPriority,
              taskDesc: editingTaskDraft.taskDesc,
            }
          : t
      )
    );
    setEditingStagedTaskId(null);
    setEditingTaskDraft({});
  };

  const handleCancelEdit = () => {
    setEditingStagedTaskId(null);
    setEditingTaskDraft({});
  };

  const handleProceedToSummary = () => {
    const activeTasks = stagedTasks.filter((t) => !t.isExcluded);
    if (activeTasks.length === 0) {
      showToast({
        description: "Please include at least one task to proceed.",
        statusToast: "warning",
      });
      return;
    }

    if (assignOption === "custom" && customAssigneeIds.length === 0) {
      showToast({
        description: "Please select at least one custom project member to assign.",
        statusToast: "warning",
      });
      return;
    }

    setWizardStep("summary");
  };

  const availableProjectMembers = useMemo(() => {
    if (DataProject?.userAssignment && DataProject.userAssignment.length > 0) {
      return DataProject.userAssignment;
    }
    if (DataUsers && DataUsers.length > 0) {
      return DataUsers;
    }
    if (DataAuth) {
      return [{ id: DataAuth.id, userData: DataAuth }];
    }
    return [];
  }, [DataProject?.userAssignment, DataUsers, DataAuth]);

  const currentLoggedInUserName = DataAuth?.nama || DataAuth?.email || "Current User";

  const getEffectiveAssignees = useCallback(
    (task: any) => {
      if (assignOption === "currentUser") {
        return [currentLoggedInUserName];
      }
      if (assignOption === "custom") {
        return customAssigneeIds.length > 0
          ? customAssigneeIds
          : ["(No custom member selected)"];
      }
      if (
        task.assignedTask &&
        Array.isArray(task.assignedTask) &&
        task.assignedTask.length > 0
      ) {
        return task.assignedTask;
      }
      if (typeof task.assignedTask === "string" && task.assignedTask.trim()) {
        return [task.assignedTask.trim()];
      }
      return ["Unassigned"];
    },
    [assignOption, customAssigneeIds, currentLoggedInUserName]
  );

  const groupedStagedTasks = useMemo(() => {
    const filtered = stagedTasks
      .filter((task) => {
        if (previewFilter === "duplicates") return !!task.duplicateInfo?.isDuplicate;
        if (previewFilter === "excluded") return !!task.isExcluded;
        return true;
      })
      .filter((task) =>
        previewSearch
          ? task.taskName.toLowerCase().includes(previewSearch.toLowerCase()) ||
            task.boardName.toLowerCase().includes(previewSearch.toLowerCase()) ||
            task.backlogName.toLowerCase().includes(previewSearch.toLowerCase())
          : true
      );

    const map = new Map<string, { backlogId: string; backlogName: string; tasks: any[] }>();

    filtered.forEach((task) => {
      const key = task.backlogId || task.backlogName || "unassigned";
      if (!map.has(key)) {
        map.set(key, {
          backlogId: task.backlogId || "",
          backlogName: task.backlogName || "General Backlog",
          tasks: [],
        });
      }
      map.get(key)!.tasks.push(task);
    });

    return Array.from(map.values());
  }, [stagedTasks, previewFilter, previewSearch]);

  const allBacklogSummary = useMemo(() => {
    const map = new Map<string, { backlogId: string; backlogName: string; taskCount: number; subtaskCount: number; duplicateCount: number }>();

    stagedTasks.forEach((task) => {
      if (task.isExcluded) return;
      const key = task.backlogId || task.backlogName || "unassigned";
      if (!map.has(key)) {
        map.set(key, {
          backlogId: task.backlogId || "",
          backlogName: task.backlogName || "General Backlog",
          taskCount: 0,
          subtaskCount: 0,
          duplicateCount: 0,
        });
      }
      const curr = map.get(key)!;
      curr.taskCount += 1;
      curr.subtaskCount += task.taskItems?.length || 0;
      if (task.duplicateInfo?.isDuplicate) {
        curr.duplicateCount += 1;
      }
    });

    return Array.from(map.values());
  }, [stagedTasks]);

  // Get tasks for specific board with filtering - memoized for performance
  const filteredTasksByBoard = useMemo(() => {
    const result: Record<string, TaskViewModel[]> = {};
    
    DataBoard.forEach(board => {
      // Filter tasks by boardName from master board
      let filteredTasks = DataTasks.filter(
        (task) => task.boardName === board.boardName,
      );

      // Apply search filter
      if (searchTerm) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.taskDesc &&
              task.taskDesc.toLowerCase().includes(searchTerm.toLowerCase())),
        );
      }

      // Apply priority filter
      if (filterPriority) {
        filteredTasks = filteredTasks.filter(
          (task) => task.taskPriority === filterPriority,
        );
      }

      // Apply backlog filter
      if (filterBacklog) {
        filteredTasks = filteredTasks.filter(
          (task) => task.backlogId === filterBacklog,
        );
      }

      // Apply assignee filter
      if (filterAssignee) {
        const selectedIds = filterAssignee.split(",").filter(Boolean);
        filteredTasks = filteredTasks.filter((task) =>
          task.assignUsers?.some((user) => selectedIds.includes(user.id)),
        );
      }

      // Apply "My Tasks Only" filter
      if (showMyTasksOnly && DataAuth) {
        filteredTasks = filteredTasks.filter((task) =>
          task.assignUsers?.some((user) => user.userId === DataAuth.userId),
        );
      }

      // Apply completed tasks filter
      if (!showCompletedTasks) {
        filteredTasks = filteredTasks.filter(
          (task) => task.percentageStatus < 100,
        );
      }

      result[board.boardName] = filteredTasks.sort((a, b) => a.indexTask - b.indexTask);
    });
    
    return result;
  }, [DataTasks, DataBoard, searchTerm, filterPriority, filterBacklog, filterAssignee, showMyTasksOnly, showCompletedTasks, DataAuth]);

  const getTasksForBoard = (boardName: string) => {
    return filteredTasksByBoard[boardName] || [];
  };

  // Get project statistics
  const getProjectStats = () => {
    const totalTasks = DataTasks.length;

    const todoTasks = DataTasks.filter(
      (task) => task.boardName?.toUpperCase() === "TO DO",
    ).length;

    const inProgressTasks = DataTasks.filter(
      (task) => task.boardName?.toUpperCase() === "IN PROGRESS",
    ).length;

    const inReviewTasks = DataTasks.filter(
      (task) => task.boardName?.toUpperCase() === "IN REVIEW",
    ).length;

    const completedTasks = DataTasks.filter(
      (task) => task.boardName?.toUpperCase() === "DONE",
    ).length;

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
  };

  const projectStats = getProjectStats();

  if (!projectId) {
    return (
      <LayoutAdminWorkspace>
        <Alert status="error" rounded={radiusStyle}>
          <AlertIcon />
          <AlertTitle>Missing Project ID!</AlertTitle>
          <AlertDescription>
            Please provide a valid project ID in the URL parameters.
          </AlertDescription>
        </Alert>
      </LayoutAdminWorkspace>
    );
  }

  return (
    <>
      {/* Loading Overlay */}
      {isInitializing && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={colorMode === "light" ? "white" : "gray.900"}
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          sx={{
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            "@keyframes wave1": {
              "0%": { transform: "translateX(0) translateZ(0) scaleY(1)" },
              "50%": {
                transform: "translateX(-25%) translateZ(0) scaleY(0.55)",
              },
              "100%": { transform: "translateX(-50%) translateZ(0) scaleY(1)" },
            },
            "@keyframes wave2": {
              "0%": { transform: "translateX(0) translateZ(0) scaleY(1)" },
              "50%": {
                transform: "translateX(-15%) translateZ(0) scaleY(0.65)",
              },
              "100%": { transform: "translateX(-30%) translateZ(0) scaleY(1)" },
            },
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          {/* Wave Background - Layer 1 */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            width="200%"
            height="250px"
            sx={{
              animation:
                "wave1 10s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite",
            }}
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
                fill={colorMode === "light" ? "#004593" : "#0065d7"}
              />
            </svg>
          </Box>

          {/* Wave Background - Layer 2 */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            width="200%"
            height="220px"
            sx={{
              animation:
                "wave2 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite",
            }}
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                d="M0,50 C200,0 400,100 600,50 C800,0 1000,100 1200,50 L1200,120 L0,120 Z"
                fill={colorMode === "light" ? "#0051ad" : "#0077fe"}
              />
            </svg>
          </Box>

          {/* Wave Background - Layer 3 */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            width="200%"
            height="190px"
            sx={{
              animation:
                "wave1 13s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite",
            }}
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                d="M0,30 C300,80 500,20 600,40 C700,60 900,10 1200,40 L1200,120 L0,120 Z"
                fill={colorMode === "light" ? "#00326b" : "#004593"}
              />
            </svg>
          </Box>

          <VStack
            spacing={8}
            maxW="400px"
            w="full"
            px={6}
            zIndex={1}
            position="relative"
            animation="slideUp 0.5s ease-out"
            sx={{
              "@keyframes slideUp": {
                from: {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {/* Logo */}
            <Box>
              <Image
                src="/img/logo-bjb.png"
                alt="Logo"
                boxSize="64px"
                objectFit="contain"
              />
            </Box>

            {/* Title */}
            <Heading
              size="md"
              color={colorMode === "light" ? "gray.700" : "gray.200"}
            >
              Preparing Your Workspace
            </Heading>

            {/* Loading Steps */}
            <VStack spacing={3} w="full" align="stretch">
              {/* Step 1: Initializing */}
              <HStack spacing={3}>
                {loadingStep === "init" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={loadingStep === "init" ? "blue.500" : "gray.500"}
                >
                  Initializing workspace
                </Text>
              </HStack>

              {/* Step 2: Project */}
              <HStack spacing={3}>
                {loadingStep === "project" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : loadingStep === "init" ? (
                  <Icon as={FiCircle} color="gray.300" boxSize={5} />
                ) : (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={
                    loadingStep === "project"
                      ? "blue.500"
                      : loadingStep === "init"
                        ? "gray.400"
                        : "gray.500"
                  }
                >
                  Loading project details
                </Text>
              </HStack>

              {/* Step 3: Boards */}
              <HStack spacing={3}>
                {loadingStep === "boards" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : ["init", "project"].includes(loadingStep) ? (
                  <Icon as={FiCircle} color="gray.300" boxSize={5} />
                ) : (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={
                    loadingStep === "boards"
                      ? "blue.500"
                      : ["init", "project"].includes(loadingStep)
                        ? "gray.400"
                        : "gray.500"
                  }
                >
                  Loading board configuration
                </Text>
              </HStack>

              {/* Step 4: Backlogs */}
              <HStack spacing={3}>
                {loadingStep === "backlogs" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : ["init", "project", "boards"].includes(loadingStep) ? (
                  <Icon as={FiCircle} color="gray.300" boxSize={5} />
                ) : (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={
                    loadingStep === "backlogs"
                      ? "blue.500"
                      : ["init", "project", "boards"].includes(loadingStep)
                        ? "gray.400"
                        : "gray.500"
                  }
                >
                  Loading backlogs
                </Text>
              </HStack>

              {/* Step 5: Tasks */}
              <HStack spacing={3}>
                {loadingStep === "tasks" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : ["init", "project", "boards", "backlogs"].includes(
                    loadingStep,
                  ) ? (
                  <Icon as={FiCircle} color="gray.300" boxSize={5} />
                ) : (
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={
                    loadingStep === "tasks"
                      ? "blue.500"
                      : ["init", "project", "boards", "backlogs"].includes(
                            loadingStep,
                          )
                        ? "gray.400"
                        : "gray.500"
                  }
                >
                  Loading tasks
                </Text>
              </HStack>

              {/* Step 6: Ready */}
              <HStack spacing={3}>
                {loadingStep === "ready" ? (
                  <Spinner size="sm" color="blue.500" />
                ) : (
                  <Icon as={FiCircle} color="gray.300" boxSize={5} />
                )}
                <Text
                  fontSize="sm"
                  color={loadingStep === "ready" ? "blue.500" : "gray.400"}
                >
                  Preparing kanban board
                </Text>
              </HStack>
            </VStack>

            {/* Progress Bar */}
            <Box w="full">
              <Box
                h="6px"
                bg={colorMode === "light" ? "gray.200" : "gray.700"}
                rounded="full"
                overflow="hidden"
              >
                <Box
                  h="full"
                  bg="blue.500"
                  rounded="full"
                  transition="all 0.5s ease-out"
                  w={
                    loadingStep === "init"
                      ? "16%"
                      : loadingStep === "project"
                        ? "33%"
                        : loadingStep === "boards"
                          ? "50%"
                          : loadingStep === "backlogs"
                            ? "66%"
                            : loadingStep === "tasks"
                              ? "83%"
                              : "100%"
                  }
                />
              </Box>
              <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                {loadingStep === "init"
                  ? "16%"
                  : loadingStep === "project"
                    ? "33%"
                    : loadingStep === "boards"
                      ? "50%"
                      : loadingStep === "backlogs"
                        ? "66%"
                        : loadingStep === "tasks"
                          ? "83%"
                          : "100%"}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Main Content */}
      <LayoutAdminWorkspace>
        <DndProvider backend={HTML5Backend}>
          <Box
            p={4}
            animation={!isInitializing ? "fadeIn 0.5s ease-in" : undefined}
            sx={{
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            {/* Simple Clean Header */}
            <Card
              shadow="sm"
              rounded={radiusStyle}
              bg={colorMode === "light" ? "white" : "gray.800"}
              mb={4}
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
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
                    fill={colorMode === "dark" ? "#004593" : "#9acaff"}
                  />
                  {/* Diagonal wave layer 2 */}
                  <path
                    d="M0,140 C400,80 600,160 900,100 L1200,70 L1200,200 L0,200 Z"
                    fill={colorMode === "dark" ? "#0051ad" : "#0077fe"}
                  />
                  {/* Abstract curved shape */}
                  <path
                    d="M0,180 C200,120 600,180 1200,120 L1200,200 L0,200 Z"
                    fill={colorMode === "dark" ? "#00326b" : "#004593"}
                  />
                </svg>
              </Box>

              <CardBody p={4} position="relative" zIndex={1}>
                <VStack spacing={4} align="stretch">
                  {/* Top Row: Back Button + Project Info + Actions */}
                  <HStack justify="space-between" align="center">
                    <HStack spacing={4}>
                      <IconButton
                        aria-label="Back"
                        icon={<FiArrowLeft />}
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(backUrl)}
                      />
                      <VStack align="start" spacing={2}>
                        <Heading size="md">
                          {DataProject?.projectName || "Project Workspace"}
                        </Heading>

                        <HStack
                          spacing={3}
                          fontSize="sm"
                          color="gray.600"
                          wrap="wrap"
                        >
                          <HStack spacing={1}>
                            <Text fontWeight="500">Memo No:</Text>
                            <Text>
                              {DataProject?.requirementData?.reqNumber || "-"}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Text fontWeight="500">Project No:</Text>
                            <Text>{DataProject?.projectNo || "-"}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Text fontWeight="500">Inisiator:</Text>
                            <Text>
                              {DataProject?.proOwnerDivisionName || "-"}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Text fontWeight="500">Pengelola:</Text>
                            <Text>
                              {DataProject?.proManageByDivisionName || "-"}
                            </Text>
                          </HStack>
                        </HStack>

                        {/* Application Info - Prominent Display */}
                        {DataProject?.appsProject && (
                          <HStack
                            spacing={3}
                            bg="linear-gradient(135deg, #0077fe 0%, #00326b 100%)"
                            px={3}
                            py={2}
                            rounded={radiusStyle}
                            shadow="md"
                          >
                            <Box
                              bg="white"
                              w="40px"
                              h="40px"
                              rounded={radiusStyle}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontWeight="bold"
                              fontSize="lg"
                              color="purple.600"
                              shadow="sm"
                            >
                              {DataProject.appsProject.appCode
                                ?.substring(0, 2)
                                .toUpperCase() ||
                                DataProject.appsProject.appName
                                  ?.substring(0, 2)
                                  .toUpperCase() ||
                                "AP"}
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="xs"
                                color="whiteAlpha.800"
                                fontWeight="medium"
                              >
                                Application
                              </Text>
                              <Text
                                fontSize="sm"
                                color="white"
                                fontWeight="bold"
                              >
                                {DataProject.appsProject.appName}
                              </Text>
                            </VStack>
                          </HStack>
                        )}
                      </VStack>
                    </HStack>

                    <HStack spacing={2}>
                      <Button
                        leftIcon={<FiInbox />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsArchivedDrawerOpen(true);
                          loadArchivedTasks();
                        }}
                      >
                        Archived
                      </Button>
                      <Button
                        leftIcon={<FiRefreshCcw />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setRefreshData((prev) => prev + 1)}
                        isLoading={IsLoadingProcess}
                      >
                        Refresh
                      </Button>
                    </HStack>
                  </HStack>

                  {/* Stats Row */}
                  <HStack
                    spacing={6}
                    p={3}
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    rounded={radiusStyle}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="gray.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        {projectStats.todoTasks} To Do
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiLoader} color="orange.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        {projectStats.inProgressTasks} In Progress
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiEye} color="purple.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        {projectStats.inReviewTasks} In Review
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        {projectStats.completedTasks} Done
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiList} color="blue.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        {projectStats.totalTasks} Total
                      </Text>
                    </HStack>
                    <Divider orientation="vertical" h="20px" />
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600">
                        {projectStats.completionPercentage}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Complete
                      </Text>
                    </HStack>
                    {DataProject?.requirementData?.appLiveTargetDate && (
                      <>
                        <Divider orientation="vertical" h="20px" />
                        <HStack spacing={1}>
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Target Live:
                          </Text>
                          <Text
                            fontSize="xs"
                            color="blue.600"
                            fontWeight="bold"
                          >
                            {formatDateDDMMYYYY(
                              DataProject.requirementData.appLiveTargetDate,
                            )}
                          </Text>
                        </HStack>
                      </>
                    )}
                    {lastUpdated && (
                      <>
                        <Divider orientation="vertical" h="20px" />
                        <Text fontSize="xs" color="gray.500">
                          Updated: {lastUpdated.toLocaleTimeString()}
                        </Text>
                      </>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Filters Section - Separate Panel */}
            <Box
              bg={colorMode === "light" ? "white" : "gray.800"}
              p={3}
              rounded={radiusStyle}
              shadow="sm"
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              mb={4}
            >
              <HStack spacing={3} justify="space-between" align="center">
                <HStack spacing={3} flex={1}>
                  <InputGroup maxW="300px">
                    <InputLeftElement mt={-1} pr={2}>
                      <FiSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="sm"
                      rounded={radiusStyle}
                    />
                  </InputGroup>

                  <Box minW="200px" maxW="300px">
                    <ChakraReactSelect
                      placeholder="Member"
                      value={
                        filterAssignee
                          ? filterAssignee.split(",").filter(Boolean).map((id) => ({
                              value: id,
                              label: DataProject?.userAssignment?.find(
                                (a) => a.userData.id === id,
                              )?.userData.nama || id,
                            }))
                          : []
                      }
                      onChange={(options) =>
                        setFilterAssignee(
                          options?.map((o: any) => o.value).join(",") || ""
                        )
                      }
                      options={
                        DataProject?.userAssignment?.map((a) => ({
                          value: a.userData.id,
                          label: a.userData.nama,
                        })) || []
                      }
                      size="sm"
                      isMulti
                      isClearable
                      isSearchable
                      controlShouldRenderValue={false}
                      chakraStyles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: "9999px",
                          minHeight: "32px",
                          height: "32px",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          padding: "0 8px",
                        }),
                      }}
                    />
                  </Box>

                  <Select
                    placeholder="Priority"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    maxW="140px"
                    size="sm"
                    rounded={radiusStyle}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </Select>

                  <Select
                    placeholder="Backlog"
                    value={filterBacklog}
                    onChange={(e) => handleBacklogFilterChange(e.target.value)}
                    isDisabled={lockBacklog}
                    maxW="180px"
                    size="sm"
                    rounded={radiusStyle}
                  >
                    {DataBacklogs.map((backlog) => (
                      <option key={backlog.id} value={backlog.id}>
                        {backlog.backlogName}
                      </option>
                    ))}
                  </Select>

                  {filterBacklog && (
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Deadline:
                      </Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {DataBacklogs.find((b) => b.id === filterBacklog)
                          ?.backlogEnddate
                          ? formatDateDDMMYYYY(
                              DataBacklogs.find((b) => b.id === filterBacklog)!
                                .backlogEnddate!,
                            )
                          : "-"}
                      </Text>
                    </HStack>
                  )}
                  <Checkbox
                    isChecked={showCompletedTasks}
                    onChange={(e) => setShowCompletedTasks(e.target.checked)}
                    colorScheme="secondary"
                    size="md"
                  >
                    <Text fontSize="md">Show completed</Text>
                  </Checkbox>
                  <Checkbox
                    isChecked={showMyTasksOnly}
                    onChange={(e) => setShowMyTasksOnly(e.target.checked)}
                    colorScheme="blue"
                    size="md"
                  >
                    <Text fontSize="md">My tasks only</Text>
                  </Checkbox>
                  <Checkbox
                    isChecked={isCompactView}
                    onChange={(e) => setIsCompactView(e.target.checked)}
                    colorScheme="purple"
                    size="md"
                  >
                    <Text fontSize="md">Compact view</Text>
                  </Checkbox>
                </HStack>

                {filterAssignee && (
                  <HStack spacing={-1}>
                    {filterAssignee
                      .split(",")
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((id) => {
                        const user = DataProject?.userAssignment?.find(
                          (a) => a.userData.id === id,
                        )?.userData;
                        return (
                          <Tooltip key={id} label={user?.nama || id} hasArrow>
                            <Box
                              position="relative"
                              cursor="pointer"
                              sx={{
                                "&:hover .remove-overlay": { opacity: 1 },
                              }}
                              onClick={() => {
                                const updated = filterAssignee
                                  .split(",")
                                  .filter((i) => i !== id)
                                  .join(",");
                                setFilterAssignee(updated);
                              }}
                            >
                              <Avatar name={user?.nama || ""} size="xs" />
                              <Flex
                                className="remove-overlay"
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                align="center"
                                justify="center"
                                bg="blackAlpha.700"
                                rounded="full"
                                opacity={0}
                                transition="opacity 0.15s"
                              >
                                <Icon as={FiX} color="white" boxSize={3} />
                              </Flex>
                            </Box>
                          </Tooltip>
                        );
                      })}
                  </HStack>
                )}
                <Button
                  leftIcon={<FiCode />}
                  colorScheme="secondary"
                  variant="outline"
                  size="sm"
                  onClick={onJsonImportOpen}
                  isDisabled={DataBoard.length === 0}
                  rounded={radiusStyle}
                  fontSize="sm"
                >
                  Import JSON
                </Button>
                <Button
                  leftIcon={<FiPlusCircle />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleAddTask(DataBoard[0]?.boardName || "")}
                  isDisabled={DataBoard.length === 0}
                  rounded={radiusStyle}
                  fontSize="sm"
                >
                  Add Task
                </Button>
              </HStack>
            </Box>

            {/* Auto-saving indicator */}
            {isAutoSaving && (
              <Box
                position="fixed"
                top="20px"
                right="20px"
                bg="blue.500"
                color="white"
                px={4}
                py={2}
                rounded="md"
                shadow="lg"
                zIndex="1000"
              >
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm">Auto-saving...</Text>
                </HStack>
              </Box>
            )}

            {/* Kanban Board */}
            {IsLoadingProcess && DataBoard.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Spinner size="xl" color="blue.500" />
                <Text
                  mt={4}
                  color={colorMode === "light" ? "gray.500" : "gray.400"}
                >
                  Loading kanban board...
                </Text>
              </Box>
            ) : DataBoard.length > 0 ? (
              <Box
                bg={colorMode === "light" ? "white" : "gray.800"}
                rounded={radiusStyle}
                p={4}
                shadow="sm"
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              >
                <Grid
                  templateColumns={`repeat(${DataBoard.length}, 1fr)`}
                  gap={8}
                  minH="700px"
                  w="full"
                >
                  {DataBoard.map((board) => (
                    <GridItem key={board.id}>
                      <KanbanColumn
                        board={board}
                        tasks={getTasksForBoard(board.boardName)}
                        onTaskDrop={handleTaskDrop}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                        onRefreshTasks={() =>
                          setRefreshData((prev) => prev + 1)
                        }
                        recentlyMovedTaskId={recentlyMovedTaskId}
                        DataProject={DataProject}
                        DataBacklogs={DataBacklogs}
                        isCompactView={isCompactView}
                      />
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Alert status="info" rounded={radiusStyle}>
                <AlertIcon />
                <AlertTitle>No Kanban Board Configuration Found!</AlertTitle>
                <AlertDescription>
                  Please configure the master board tasks in the system settings
                  to use the kanban board.
                </AlertDescription>
              </Alert>
            )}

            {/* Comprehensive Task Modal */}
            <Modal
              isOpen={isTaskModalOpen}
              onClose={onTaskModalClose}
              size="lg"
            >
              <ModalOverlay />
              <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  {selectedTask ? "Edit Task" : "Create New Task"}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4}>
                    <Box w="full">
                      <Text
                        mb={2}
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
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
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={
                          colorMode === "light" ? "gray.300" : "gray.600"
                        }
                      />
                    </Box>

                    <Box w="full">
                      <Text
                        mb={2}
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
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
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={
                          colorMode === "light" ? "gray.300" : "gray.600"
                        }
                      />
                    </Box>

                    <Box w="full">
                      <Text
                        mb={2}
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
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
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={
                          colorMode === "light" ? "gray.300" : "gray.600"
                        }
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                      </Select>
                    </Box>

                    {!selectedTask && (
                      <Box w="full">
                        <Text
                          mb={2}
                          fontSize="sm"
                          fontWeight="medium"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
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
                          isDisabled={lockBacklog}
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          borderColor={
                            colorMode === "light" ? "gray.300" : "gray.600"
                          }
                          placeholder="Select backlog"
                        >
                          {DataBacklogs.map((backlog) => (
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

                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onTaskModalClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSaveTask}
                    isLoading={IsLoadingProcess}
                  >
                    {selectedTask ? "Update" : "Create"} Task
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Bulk JSON Import Modal — bulk-create tasks, checklists, and assign members */}
            <Modal
              isOpen={isJsonImportOpen}
              onClose={() => {
                onJsonImportClose();
                setJsonImportError("");
                setJsonImportResult(null);
              }}
              size="6xl"
              isCentered
              scrollBehavior="inside"
            >
              <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
              <ModalContent
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderRadius={radiusStyle}
                border="1px solid"
                borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.200"}
                boxShadow="2xl"
                maxW={{ base: "98vw", lg: "92vw", xl: "1450px" }}
                maxH={{ base: "94vh", lg: "90vh" }}
                w="full"
                display="flex"
                flexDirection="column"
                my="auto"
              >
                <ModalHeader
                  color={colorMode === "dark" ? "white" : "gray.800"}
                  borderBottom="1px solid"
                  borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.100"}
                  py={4}
                  px={6}
                >
                  <VStack spacing={3.5} align="stretch">
                    <Flex justify="space-between" align="center" pr={8} flexWrap="wrap" gap={3}>
                      <HStack spacing={3} align="center">
                        <Icon as={FiCode} color={colorMode === "dark" ? "secondary.400" : "secondary.500"} boxSize={6} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="lg" fontWeight="bold">
                            Bulk Import Tasks via JSON
                          </Text>
                          <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                            {DataProject?.projectName || "Project Kanban"} • {DataProject?.projectNo || ""}
                          </Text>
                        </VStack>
                      </HStack>
                    </Flex>

                    {/* Connected Flow Stepper */}
                    <Box
                      p={3}
                      borderRadius={radiusStyle}
                      bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "gray.50"}
                      border="1px solid"
                      borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                    >
                      <Flex align="center" justify="space-between" maxW="720px" mx="auto" position="relative">
                        {/* Step 1 */}
                        <Flex
                          align="center"
                          cursor="pointer"
                          onClick={() => setWizardStep("input")}
                          role="group"
                        >
                          <Flex
                            w="36px"
                            h="36px"
                            rounded="full"
                            align="center"
                            justify="center"
                            bg={
                              wizardStep === "input"
                                ? "secondary.500"
                                : stagedTasks.length > 0
                                ? "green.500"
                                : colorMode === "dark"
                                ? "gray.700"
                                : "gray.300"
                            }
                            color="white"
                            fontWeight="bold"
                            fontSize="md"
                            transition="all 0.2s"
                            boxShadow={wizardStep === "input" ? "0 0 0 4px var(--chakra-colors-secondary-200)" : undefined}
                          >
                            {stagedTasks.length > 0 && wizardStep !== "input" ? (
                              <Icon as={FiCheck} boxSize={5} />
                            ) : (
                              "1"
                            )}
                          </Flex>
                          <Box ml={3}>
                            <Text
                              fontSize="md"
                              fontWeight={wizardStep === "input" ? "bold" : "semibold"}
                              color={
                                wizardStep === "input"
                                  ? colorMode === "dark"
                                    ? "white"
                                    : "secondary.700"
                                  : colorMode === "dark"
                                  ? "gray.300"
                                  : "gray.600"
                              }
                            >
                              1. Input & Upload
                            </Text>
                            <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                              JSON Payload
                            </Text>
                          </Box>
                        </Flex>

                        {/* Connector Line 1-2 */}
                        <Box
                          flex={1}
                          h="2px"
                          mx={4}
                          bg={
                            wizardStep === "preview" || wizardStep === "summary"
                              ? "secondary.500"
                              : colorMode === "dark"
                              ? "whiteAlpha.200"
                              : "gray.200"
                          }
                          transition="all 0.3s"
                        />

                        {/* Step 2 */}
                        <Flex
                          align="center"
                          cursor={stagedTasks.length > 0 ? "pointer" : "not-allowed"}
                          onClick={() => {
                            if (stagedTasks.length > 0) setWizardStep("preview");
                          }}
                          role="group"
                          opacity={stagedTasks.length > 0 ? 1 : 0.6}
                        >
                          <Flex
                            w="36px"
                            h="36px"
                            rounded="full"
                            align="center"
                            justify="center"
                            bg={
                              wizardStep === "preview"
                                ? "secondary.500"
                                : wizardStep === "summary"
                                ? "green.500"
                                : colorMode === "dark"
                                ? "gray.700"
                                : "gray.300"
                            }
                            color="white"
                            fontWeight="bold"
                            fontSize="md"
                            transition="all 0.2s"
                            boxShadow={wizardStep === "preview" ? "0 0 0 4px var(--chakra-colors-secondary-200)" : undefined}
                          >
                            {wizardStep === "summary" ? (
                              <Icon as={FiCheck} boxSize={5} />
                            ) : (
                              "2"
                            )}
                          </Flex>
                          <Box ml={3}>
                            <Text
                              fontSize="md"
                              fontWeight={wizardStep === "preview" ? "bold" : "semibold"}
                              color={
                                wizardStep === "preview"
                                  ? colorMode === "dark"
                                    ? "white"
                                    : "secondary.700"
                                  : colorMode === "dark"
                                  ? "gray.300"
                                  : "gray.600"
                              }
                            >
                              2. Preview & Assign
                            </Text>
                            <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                              Review & Config
                            </Text>
                          </Box>
                        </Flex>

                        {/* Connector Line 2-3 */}
                        <Box
                          flex={1}
                          h="2px"
                          mx={4}
                          bg={
                            wizardStep === "summary"
                              ? "secondary.500"
                              : colorMode === "dark"
                              ? "whiteAlpha.200"
                              : "gray.200"
                          }
                          transition="all 0.3s"
                        />

                        {/* Step 3 */}
                        <Flex
                          align="center"
                          cursor={stagedTasks.length > 0 && wizardStep === "summary" ? "pointer" : "not-allowed"}
                          role="group"
                          opacity={wizardStep === "summary" ? 1 : 0.6}
                        >
                          <Flex
                            w="36px"
                            h="36px"
                            rounded="full"
                            align="center"
                            justify="center"
                            bg={
                              wizardStep === "summary"
                                ? "secondary.500"
                                : colorMode === "dark"
                                ? "gray.700"
                                : "gray.300"
                            }
                            color="white"
                            fontWeight="bold"
                            fontSize="md"
                            transition="all 0.2s"
                            boxShadow={wizardStep === "summary" ? "0 0 0 4px var(--chakra-colors-secondary-200)" : undefined}
                          >
                            3
                          </Flex>
                          <Box ml={3}>
                            <Text
                              fontSize="md"
                              fontWeight={wizardStep === "summary" ? "bold" : "semibold"}
                              color={
                                wizardStep === "summary"
                                  ? colorMode === "dark"
                                    ? "white"
                                    : "secondary.700"
                                  : colorMode === "dark"
                                  ? "gray.300"
                                  : "gray.600"
                              }
                            >
                              3. Manifest Summary
                            </Text>
                            <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                              Final Validation
                            </Text>
                          </Box>
                        </Flex>
                      </Flex>
                    </Box>
                  </VStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody py={4} px={6} overflowY="auto" flex={1}>
                  <VStack spacing={4} align="stretch">
                    {/* STEP 1: JSON INPUT & FILE UPLOAD */}
                    {wizardStep === "input" && (
                      <>
                        <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                          Paste a JSON payload below containing a <strong>tasks</strong> array or an array of tasks. Each task needs a <strong>boardName</strong> matching
                          an existing board on this backlog and a <strong>taskName</strong>. Optional{" "}
                          <strong>taskItems</strong> creates checklist items (accepts strings or objects with <code>&quot;isChecked&quot;: true/false</code>), and{" "}
                          <strong>assignedTask</strong> / <strong>team</strong> assigns members by name or email.
                        </Text>

                        {/* Read-Only Target Context Card */}
                        <Box
                          p={4}
                          borderRadius={radiusStyle}
                          bg={colorMode === "dark" ? "rgba(15, 23, 42, 0.6)" : "secondary.50"}
                          border="1px solid"
                          borderColor={colorMode === "dark" ? "secondary.900" : "secondary.200"}
                        >
                          <HStack justify="space-between" mb={3} align="center">
                            <HStack spacing={2} align="center">
                              <Icon as={FiLock} color="secondary.400" boxSize={4} />
                              <Text
                                fontSize="md"
                                fontWeight={700}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                                color={colorMode === "dark" ? "secondary.300" : "secondary.700"}
                              >
                                Project Context
                              </Text>
                            </HStack>
                          </HStack>

                          <Grid
                            templateColumns={{
                              base: "1fr",
                              md: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                            gap={3}
                          >
                            <Box
                              p={3}
                              borderRadius={radiusStyle}
                              bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.04)" : "white"}
                              border="1px solid"
                              borderColor={colorMode === "dark" ? "whiteAlpha.100" : "secondary.100"}
                            >
                              <Text
                                fontSize="md"
                                fontWeight={600}
                                color={colorMode === "dark" ? "gray.400" : "gray.500"}
                                mb={1}
                              >
                                Project Number
                              </Text>
                              <Text
                                fontSize="md"
                                fontFamily="mono"
                                fontWeight={700}
                                color={colorMode === "dark" ? "white" : "gray.800"}
                                isTruncated
                                title={DataProject?.projectNo || "-"}
                              >
                                {DataProject?.projectNo || "-"}
                              </Text>
                            </Box>

                            <Box
                              p={3}
                              borderRadius={radiusStyle}
                              bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.04)" : "white"}
                              border="1px solid"
                              borderColor={colorMode === "dark" ? "whiteAlpha.100" : "secondary.100"}
                            >
                              <Text
                                fontSize="md"
                                fontWeight={600}
                                color={colorMode === "dark" ? "gray.400" : "gray.500"}
                                mb={1}
                              >
                                Project Name
                              </Text>
                              <Text
                                fontSize="md"
                                fontWeight={700}
                                color={colorMode === "dark" ? "white" : "gray.800"}
                                isTruncated
                                title={DataProject?.projectName || "-"}
                              >
                                {DataProject?.projectName || "-"}
                              </Text>
                            </Box>

                            <Box
                              p={3}
                              borderRadius={radiusStyle}
                              bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.04)" : "white"}
                              border="1px solid"
                              borderColor={colorMode === "dark" ? "whiteAlpha.100" : "secondary.100"}
                            >
                              <Text
                                fontSize="md"
                                fontWeight={600}
                                color={colorMode === "dark" ? "gray.400" : "gray.500"}
                                mb={1}
                              >
                                Active Backlog
                              </Text>
                              <Text
                                fontSize="md"
                                fontWeight={700}
                                color={colorMode === "dark" ? "white" : "gray.800"}
                                isTruncated
                                title={currentBacklog?.backlogName || "-"}
                              >
                                {currentBacklog?.backlogName || "-"}
                              </Text>
                            </Box>
                          </Grid>
                        </Box>

                        <Grid
                          templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
                          gap={4}
                          alignItems="stretch"
                          w="full"
                        >
                          {/* Left: JSON Input */}
                          <GridItem display="flex" flexDirection="column" minW={0} w="full">
                            <HStack justify="space-between" mb={2} align="center" minH="36px" flexWrap="wrap" gap={2}>
                              <Text
                                fontSize="md"
                                fontWeight="bold"
                                color={colorMode === "dark" ? "white" : "gray.900"}
                              >
                                JSON Input *
                              </Text>
                              <HStack spacing={2}>
                                <input
                                  type="file"
                                  ref={jsonFileInputRef}
                                  accept=".json,application/json"
                                  style={{ display: "none" }}
                                  onChange={handleJsonFileUpload}
                                />
                                <Button
                                  size="md"
                                  variant="outline"
                                  colorScheme="secondary"
                                  leftIcon={<FiUpload />}
                                  rounded={radiusStyle}
                                  fontSize="md"
                                  onClick={() => jsonFileInputRef.current?.click()}
                                  title="Upload .json file"
                                >
                                  Upload JSON
                                </Button>
                                {jsonImportText && (
                                  <Button
                                    size="md"
                                    variant="ghost"
                                    colorScheme="gray"
                                    fontSize="md"
                                    rounded={radiusStyle}
                                    onClick={() => setJsonImportText("")}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </HStack>
                            </HStack>

                            <Box
                              flex={1}
                              borderRadius={radiusStyle}
                              border="1px solid"
                              borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                              overflow="hidden"
                              bg={colorMode === "dark" ? "#0d1117" : "#f6f8fa"}
                              _focusWithin={{
                                borderColor: "secondary.400",
                                boxShadow: "0 0 0 1px var(--chakra-colors-secondary-400)",
                              }}
                              display="flex"
                              flexDirection="column"
                            >
                              <HStack
                                px={4}
                                py={2.5}
                                justify="space-between"
                                bg={colorMode === "dark" ? "#161b22" : "#eaeef2"}
                                borderBottom="1px solid"
                                borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                              >
                                <HStack spacing={2} align="center">
                                  <Icon as={FiCode} color={colorMode === "dark" ? "secondary.400" : "secondary.500"} boxSize={4} />
                                  <Text
                                    fontSize="md"
                                    fontFamily="mono"
                                    fontWeight="medium"
                                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                                  >
                                    tasks-import.json
                                  </Text>
                                </HStack>
                                <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                                  Type, paste, or upload JSON
                                </Text>
                              </HStack>

                              <HStack spacing={0} align="stretch" h={{ base: "320px", lg: "360px", xl: "400px" }} flex={1}>
                                <VStack
                                  ref={jsonGutterRef}
                                  spacing={0}
                                  align="end"
                                  py={3}
                                  px={3}
                                  bg={
                                    colorMode === "dark"
                                      ? "rgba(255, 255, 255, 0.02)"
                                      : "rgba(0, 0, 0, 0.02)"
                                  }
                                  borderRight="1px solid"
                                  borderColor={colorMode === "dark" ? "whiteAlpha.50" : "gray.200"}
                                  flexShrink={0}
                                  overflow="hidden"
                                >
                                  {Array.from({
                                    length: Math.max(
                                      jsonImportText.split("\n").length,
                                      20
                                    ),
                                  }).map((_, i) => (
                                    <Text
                                      key={i}
                                      fontFamily="mono"
                                      fontSize="md"
                                      lineHeight="1.7"
                                      color={colorMode === "dark" ? "whiteAlpha.400" : "gray.400"}
                                      userSelect="none"
                                    >
                                      {i + 1}
                                    </Text>
                                  ))}
                                </VStack>

                                <Box position="relative" flex={1} h="full" overflow="hidden">
                                  <Box
                                    ref={jsonHighlightRef}
                                    as="pre"
                                    position="absolute"
                                    inset={0}
                                    fontFamily="mono"
                                    fontSize="md"
                                    lineHeight="1.7"
                                    py={3}
                                    px={4}
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

                                  <Textarea
                                    value={jsonImportText}
                                    onChange={(e) => setJsonImportText(e.target.value)}
                                    placeholder="// Paste your JSON task array here, click 'Upload JSON', or use template on right"
                                    position="relative"
                                    h="full"
                                    fontFamily="mono"
                                    fontSize="md"
                                    lineHeight="1.7"
                                    border="none"
                                    borderRadius={0}
                                    bg="transparent"
                                    color="transparent"
                                    sx={{
                                      caretColor: colorMode === "dark" ? "#c9d1d9" : "#24292f",
                                    }}
                                    _placeholder={{
                                      color: colorMode === "dark" ? "whiteAlpha.300" : "gray.400",
                                    }}
                                    _focus={{ boxShadow: "none" }}
                                    resize="none"
                                    spellCheck={false}
                                    py={3}
                                    px={4}
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

                          {/* Right: Example / Template Code Panel */}
                          <GridItem display="flex" flexDirection="column" minW={0} w="full">
                            <HStack justify="space-between" mb={2} align="center" minH="36px" flexWrap="wrap" gap={2}>
                              <Text
                                fontSize="md"
                                fontWeight="bold"
                                color={colorMode === "dark" ? "white" : "gray.900"}
                              >
                                Template & Reference
                              </Text>
                              <HStack spacing={2}>
                                <Button
                                  size="md"
                                  variant="outline"
                                  colorScheme="secondary"
                                  leftIcon={<FiCopy />}
                                  rounded={radiusStyle}
                                  fontSize="md"
                                  onClick={handleCopyTemplate}
                                  title="Copy full JSON template to clipboard"
                                >
                                  Copy JSON
                                </Button>
                                <Button
                                  size="md"
                                  variant="outline"
                                  colorScheme="secondary"
                                  leftIcon={<FiDownload />}
                                  rounded={radiusStyle}
                                  fontSize="md"
                                  onClick={handleDownloadTemplate}
                                  title="Download JSON template file"
                                >
                                  Download
                                </Button>
                                <Button
                                  size="md"
                                  variant="solid"
                                  colorScheme="secondary"
                                  leftIcon={<FiCornerDownLeft />}
                                  rounded={radiusStyle}
                                  fontSize="md"
                                  onClick={() => setJsonImportText(jsonImportTasksOnlyExample)}
                                >
                                  Use template
                                </Button>
                              </HStack>
                            </HStack>

                            <Box
                              flex={1}
                              borderRadius={radiusStyle}
                              border="1px solid"
                              borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                              overflow="hidden"
                              bg={colorMode === "dark" ? "#0d1117" : "#f6f8fa"}
                              display="flex"
                              flexDirection="column"
                            >
                              <HStack
                                px={4}
                                py={2.5}
                                justify="space-between"
                                bg={colorMode === "dark" ? "#161b22" : "#eaeef2"}
                                borderBottom="1px solid"
                                borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                              >
                                <HStack spacing={2} align="center">
                                  <Icon as={FiLock} color={colorMode === "dark" ? "secondary.400" : "secondary.500"} boxSize={4} />
                                  <Text
                                    fontSize="md"
                                    fontFamily="mono"
                                    fontWeight="medium"
                                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                                  >
                                    example-payload.json
                                  </Text>
                                </HStack>
                                <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                                  Read-only schema
                                </Text>
                              </HStack>

                              <HStack spacing={0} align="stretch" h={{ base: "320px", lg: "360px", xl: "400px" }} flex={1}>
                                <VStack
                                  spacing={0}
                                  align="end"
                                  py={3}
                                  px={3}
                                  bg={
                                    colorMode === "dark"
                                      ? "rgba(255, 255, 255, 0.02)"
                                      : "rgba(0, 0, 0, 0.02)"
                                  }
                                  borderRight="1px solid"
                                  borderColor={colorMode === "dark" ? "whiteAlpha.50" : "gray.200"}
                                  flexShrink={0}
                                  overflow="hidden"
                                >
                                  {jsonImportExample.split("\n").map((_, i) => (
                                    <Text
                                      key={i}
                                      fontFamily="mono"
                                      fontSize="md"
                                      lineHeight="1.7"
                                      color={colorMode === "dark" ? "whiteAlpha.400" : "gray.400"}
                                      userSelect="none"
                                    >
                                      {i + 1}
                                    </Text>
                                  ))}
                                </VStack>
                                <Box
                                  as="pre"
                                  fontFamily="mono"
                                  fontSize="md"
                                  lineHeight="1.7"
                                  py={3}
                                  px={4}
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
                            </Box>
                          </GridItem>
                        </Grid>
                      </>
                    )}

                    {/* STEP 2: GIT-COMMIT-STYLE PREVIEW & DEDUPLICATION (MAPPED BY BACKLOG PARENT) */}
                    {wizardStep === "preview" && (
                      <VStack spacing={4} align="stretch">
                        {/* Task Assignment Configuration Card (Required) */}
                        <Box
                          p={4}
                          borderRadius={radiusStyle}
                          bg={colorMode === "dark" ? "rgba(15, 23, 42, 0.6)" : "secondary.50"}
                          border="1px solid"
                          borderColor={colorMode === "dark" ? "secondary.900" : "secondary.200"}
                        >
                          <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                              <HStack spacing={2} align="center">
                                <Icon as={FiUser} color="secondary.400" boxSize={5} />
                                <Text fontSize="md" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.900"}>
                                  Task Assignment Strategy *
                                </Text>
                                <Badge colorScheme="secondary" fontSize="md" px={2} py={0.5} borderRadius="md">
                                  Required Configuration
                                </Badge>
                              </HStack>
                            </Flex>

                            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                              {/* Option 1: Current User (Default) */}
                              <Box
                                p={3.5}
                                borderRadius={radiusStyle}
                                cursor="pointer"
                                border="2px solid"
                                borderColor={assignOption === "currentUser" ? "secondary.500" : colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                                bg={assignOption === "currentUser" ? (colorMode === "dark" ? "rgba(0, 101, 215, 0.15)" : "blue.50") : (colorMode === "dark" ? "gray.800" : "white")}
                                onClick={() => setAssignOption("currentUser")}
                                transition="all 0.2s ease"
                              >
                                <VStack align="start" spacing={1.5}>
                                  <HStack justify="space-between" w="full">
                                    <HStack spacing={2}>
                                      <Icon as={FiUser} color={assignOption === "currentUser" ? "secondary.400" : "gray.400"} boxSize={4} />
                                      <Text fontSize="md" fontWeight="bold" color={assignOption === "currentUser" ? "secondary.400" : undefined}>
                                        Assign to Me (Default)
                                      </Text>
                                    </HStack>
                                    {assignOption === "currentUser" && <Icon as={FiCheckCircle} color="secondary.400" boxSize={4} />}
                                  </HStack>
                                  <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                                    Assign all tasks to <strong>{currentLoggedInUserName}</strong>
                                  </Text>
                                </VStack>
                              </Box>

                              {/* Option 2: Custom Project Assignee(s) */}
                              <Box
                                p={3.5}
                                borderRadius={radiusStyle}
                                cursor="pointer"
                                border="2px solid"
                                borderColor={assignOption === "custom" ? "secondary.500" : colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                                bg={assignOption === "custom" ? (colorMode === "dark" ? "rgba(0, 101, 215, 0.15)" : "blue.50") : (colorMode === "dark" ? "gray.800" : "white")}
                                onClick={() => setAssignOption("custom")}
                                transition="all 0.2s ease"
                              >
                                <VStack align="start" spacing={1.5}>
                                  <HStack justify="space-between" w="full">
                                    <HStack spacing={2}>
                                      <Icon as={FiUsers} color={assignOption === "custom" ? "secondary.400" : "gray.400"} boxSize={4} />
                                      <Text fontSize="md" fontWeight="bold" color={assignOption === "custom" ? "secondary.400" : undefined}>
                                        Custom Assignee(s)
                                      </Text>
                                    </HStack>
                                    {assignOption === "custom" && <Icon as={FiCheckCircle} color="secondary.400" boxSize={4} />}
                                  </HStack>
                                  <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                                    Select specific member(s) from this project
                                  </Text>
                                </VStack>
                              </Box>

                              {/* Option 3: Original JSON / Unassigned */}
                              <Box
                                p={3.5}
                                borderRadius={radiusStyle}
                                cursor="pointer"
                                border="2px solid"
                                borderColor={assignOption === "original" ? "secondary.500" : colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                                bg={assignOption === "original" ? (colorMode === "dark" ? "rgba(0, 101, 215, 0.15)" : "blue.50") : (colorMode === "dark" ? "gray.800" : "white")}
                                onClick={() => setAssignOption("original")}
                                transition="all 0.2s ease"
                              >
                                <VStack align="start" spacing={1.5}>
                                  <HStack justify="space-between" w="full">
                                    <HStack spacing={2}>
                                      <Icon as={FiPackage} color={assignOption === "original" ? "secondary.400" : "gray.400"} boxSize={4} />
                                      <Text fontSize="md" fontWeight="bold" color={assignOption === "original" ? "secondary.400" : undefined}>
                                        Original JSON / None
                                      </Text>
                                    </HStack>
                                    {assignOption === "original" && <Icon as={FiCheckCircle} color="secondary.400" boxSize={4} />}
                                  </HStack>
                                  <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                                    Keep assignees defined in JSON payload
                                  </Text>
                                </VStack>
                              </Box>
                            </Grid>

                            {/* Custom Assignee Selector when Option 2 is Active */}
                            {assignOption === "custom" && (
                              <Box
                                p={3.5}
                                borderRadius={radiusStyle}
                                bg={colorMode === "dark" ? "gray.800" : "white"}
                                border="1px solid"
                                borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.300"}
                              >
                                <VStack spacing={2.5} align="stretch">
                                  <Text fontSize="md" fontWeight="semibold" color={colorMode === "dark" ? "gray.200" : "gray.700"}>
                                    Select Project Member(s) to Assign:
                                  </Text>
                                  <Wrap spacing={2}>
                                    {availableProjectMembers.map((member: any) => {
                                      const memberName = member.userData?.nama || member.nama || member.name || member.email || "Member";
                                      const isSelected = customAssigneeIds.includes(memberName);
                                      return (
                                        <Button
                                          key={member.id || member.userData?.id || memberName}
                                          size="md"
                                          variant={isSelected ? "solid" : "outline"}
                                          colorScheme={isSelected ? "secondary" : "gray"}
                                          leftIcon={isSelected ? <FiCheck /> : <FiUser />}
                                          onClick={() => {
                                            setCustomAssigneeIds((prev) =>
                                              prev.includes(memberName)
                                                ? prev.filter((n) => n !== memberName)
                                                : [...prev, memberName]
                                            );
                                          }}
                                          fontSize="md"
                                        >
                                          {memberName}
                                        </Button>
                                      );
                                    })}
                                  </Wrap>
                                  {customAssigneeIds.length === 0 && (
                                    <Text fontSize="md" color="orange.400">
                                      * Please select at least one team member above to apply custom assignment.
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            )}
                          </VStack>
                        </Box>

                        {/* Staging Summary Bar */}
                        <Flex
                          p={3.5}
                          borderRadius={radiusStyle}
                          bg={colorMode === "dark" ? "rgba(15, 23, 42, 0.6)" : "secondary.50"}
                          border="1px solid"
                          borderColor={colorMode === "dark" ? "secondary.900" : "secondary.200"}
                          justify="space-between"
                          align="center"
                          flexWrap="wrap"
                          gap={3}
                        >
                          <HStack spacing={3} align="center">
                            <Badge colorScheme="secondary" fontSize="md" px={3} py={1} borderRadius="md">
                              <HStack spacing={1.5} align="center">
                                <Icon as={FiPackage} boxSize={4} />
                                <Text>{stagedTasks.filter((t) => !t.isExcluded).length} Staged Tasks</Text>
                              </HStack>
                            </Badge>
                            <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="md">
                              <HStack spacing={1.5} align="center">
                                <Icon as={FiCheckSquare} boxSize={4} />
                                <Text>{stagedTasks.filter((t) => !t.isExcluded).reduce((acc, t) => acc + (t.taskItems?.length || 0), 0)} Subtasks</Text>
                              </HStack>
                            </Badge>
                            <Badge colorScheme="teal" fontSize="md" px={3} py={1} borderRadius="md">
                              <HStack spacing={1.5} align="center">
                                <Icon as={FiFolder} boxSize={4} />
                                <Text>{groupedStagedTasks.length} Backlogs Mapped</Text>
                              </HStack>
                            </Badge>
                            {stagedTasks.some((t) => t.duplicateInfo?.isDuplicate) && (
                              <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="md">
                                <HStack spacing={1.5} align="center">
                                  <Icon as={FiAlertTriangle} boxSize={4} />
                                  <Text>{stagedTasks.filter((t) => t.duplicateInfo?.isDuplicate).length} Potential Duplicates</Text>
                                </HStack>
                              </Badge>
                            )}
                          </HStack>

                          {/* Filter Tabs & Search */}
                          <HStack spacing={2}>
                            <InputGroup size="md" maxW="260px">
                              <InputLeftElement pointerEvents="none">
                                <Icon as={FiSearch} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                placeholder="Search staged tasks..."
                                value={previewSearch}
                                onChange={(e) => setPreviewSearch(e.target.value)}
                                borderRadius={radiusStyle}
                                bg={colorMode === "dark" ? "gray.700" : "white"}
                                fontSize="md"
                              />
                            </InputGroup>

                            <ButtonGroup size="md" isAttached variant="outline">
                              <Button
                                colorScheme={previewFilter === "all" ? "secondary" : "gray"}
                                variant={previewFilter === "all" ? "solid" : "outline"}
                                onClick={() => setPreviewFilter("all")}
                                fontSize="md"
                              >
                                All ({stagedTasks.length})
                              </Button>
                              <Button
                                colorScheme={previewFilter === "duplicates" ? "orange" : "gray"}
                                variant={previewFilter === "duplicates" ? "solid" : "outline"}
                                onClick={() => setPreviewFilter("duplicates")}
                                fontSize="md"
                                leftIcon={<FiAlertTriangle />}
                              >
                                Duplicates ({stagedTasks.filter((t) => t.duplicateInfo?.isDuplicate).length})
                              </Button>
                              <Button
                                colorScheme={previewFilter === "excluded" ? "red" : "gray"}
                                variant={previewFilter === "excluded" ? "solid" : "outline"}
                                onClick={() => setPreviewFilter("excluded")}
                                fontSize="md"
                              >
                                Excluded ({stagedTasks.filter((t) => t.isExcluded).length})
                              </Button>
                            </ButtonGroup>
                          </HStack>
                        </Flex>

                        {/* Staged Tasks Grouped by Backlog Parent */}
                        <Box maxH="460px" overflowY="auto" pr={1}>
                          <VStack spacing={4} align="stretch">
                            {groupedStagedTasks.length === 0 ? (
                              <Box p={6} textAlign="center" borderRadius={radiusStyle} bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
                                <Text fontSize="md" color="gray.500">
                                  No tasks match the active filters.
                                </Text>
                              </Box>
                            ) : (
                              groupedStagedTasks.map((group) => {
                                const activeCount = group.tasks.filter((t: any) => !t.isExcluded).length;
                                const subtaskCount = group.tasks
                                  .filter((t: any) => !t.isExcluded)
                                  .reduce((acc: number, t: any) => acc + (t.taskItems?.length || 0), 0);

                                return (
                                  <Box
                                    key={group.backlogId || group.backlogName}
                                    borderRadius={radiusStyle}
                                    border="1px solid"
                                    borderColor={colorMode === "dark" ? "purple.900" : "purple.200"}
                                    overflow="hidden"
                                    bg={colorMode === "dark" ? "rgba(30, 27, 75, 0.25)" : "purple.50"}
                                  >
                                    {/* Backlog Parent Group Header */}
                                    <Flex
                                      px={4}
                                      py={3}
                                      justify="space-between"
                                      align="center"
                                      bg={colorMode === "dark" ? "rgba(88, 28, 135, 0.25)" : "purple.100"}
                                      borderBottom="1px solid"
                                      borderColor={colorMode === "dark" ? "purple.800" : "purple.200"}
                                      flexWrap="wrap"
                                      gap={2}
                                    >
                                      <HStack spacing={2.5} align="center">
                                        <Icon as={FiFolder} color="purple.400" boxSize={5} />
                                        <Text fontSize="md" fontWeight="bold" color={colorMode === "dark" ? "white" : "purple.950"}>
                                          {group.backlogName}
                                        </Text>
                                        {group.backlogId && (
                                          <Badge colorScheme="purple" fontSize="md" px={2} py={0.5} borderRadius="md" fontFamily="mono">
                                            {group.backlogId}
                                          </Badge>
                                        )}
                                      </HStack>

                                      <HStack spacing={2}>
                                        <Badge colorScheme="secondary" fontSize="md" px={2.5} py={0.5} borderRadius="md">
                                          {activeCount} Active Tasks
                                        </Badge>
                                        <Badge colorScheme="teal" fontSize="md" px={2.5} py={0.5} borderRadius="md">
                                          {subtaskCount} Subtasks
                                        </Badge>
                                      </HStack>
                                    </Flex>

                                    {/* Tasks under this Backlog */}
                                    <VStack p={3.5} spacing={3} align="stretch">
                                      {group.tasks.map((task: any, idx: number) => {
                                        const isEditing = editingStagedTaskId === task.stagedId;
                                        const hasDuplicate = task.duplicateInfo?.isDuplicate;
                                        const effectiveAssignees = getEffectiveAssignees(task);

                                        return (
                                          <Box
                                            key={task.stagedId || idx}
                                            p={3.5}
                                            borderRadius={radiusStyle}
                                            bg={
                                              task.isExcluded
                                                ? colorMode === "dark"
                                                  ? "rgba(255, 255, 255, 0.02)"
                                                  : "gray.100"
                                                : colorMode === "dark"
                                                ? "#161b22"
                                                : "white"
                                            }
                                            border="1px solid"
                                            borderColor={
                                              task.isExcluded
                                                ? colorMode === "dark"
                                                  ? "whiteAlpha.100"
                                                  : "gray.300"
                                                : hasDuplicate
                                                ? "orange.400"
                                                : colorMode === "dark"
                                                ? "whiteAlpha.200"
                                                : "secondary.200"
                                            }
                                            opacity={task.isExcluded ? 0.6 : 1}
                                            transition="all 0.2s ease"
                                          >
                                            {isEditing ? (
                                              <VStack spacing={3} align="stretch">
                                                <Text fontSize="md" fontWeight="bold" color="secondary.400">
                                                  Edit Staged Task
                                                </Text>
                                                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={3}>
                                                  <Input
                                                    size="md"
                                                    value={editingTaskDraft.taskName || ""}
                                                    onChange={(e) =>
                                                      setEditingTaskDraft((prev: any) => ({ ...prev, taskName: e.target.value }))
                                                    }
                                                    placeholder="Task Name"
                                                    borderRadius={radiusStyle}
                                                    fontSize="md"
                                                  />
                                                  <Select
                                                    size="md"
                                                    value={editingTaskDraft.boardName || ""}
                                                    onChange={(e) =>
                                                      setEditingTaskDraft((prev: any) => ({ ...prev, boardName: e.target.value }))
                                                    }
                                                    borderRadius={radiusStyle}
                                                    fontSize="md"
                                                  >
                                                    {DataBoard.map((b) => (
                                                      <option key={b.id} value={b.boardName}>
                                                        {b.boardName}
                                                      </option>
                                                    ))}
                                                  </Select>
                                                  <Select
                                                    size="md"
                                                    value={editingTaskDraft.taskPriority || "MEDIUM"}
                                                    onChange={(e) =>
                                                      setEditingTaskDraft((prev: any) => ({ ...prev, taskPriority: e.target.value }))
                                                    }
                                                    borderRadius={radiusStyle}
                                                    fontSize="md"
                                                  >
                                                    <option value="LOW">LOW</option>
                                                    <option value="MEDIUM">MEDIUM</option>
                                                    <option value="HIGH">HIGH</option>
                                                    <option value="URGENT">URGENT</option>
                                                  </Select>
                                                </Grid>
                                                <Textarea
                                                  size="md"
                                                  value={editingTaskDraft.taskDesc || ""}
                                                  onChange={(e) =>
                                                    setEditingTaskDraft((prev: any) => ({ ...prev, taskDesc: e.target.value }))
                                                  }
                                                  placeholder="Task Description"
                                                  borderRadius={radiusStyle}
                                                  rows={2}
                                                  fontSize="md"
                                                />
                                                <HStack justify="flex-end" spacing={2}>
                                                  <Button size="md" variant="ghost" onClick={handleCancelEdit} fontSize="md">
                                                    Cancel
                                                  </Button>
                                                  <Button size="md" colorScheme="secondary" onClick={handleSaveEdit} fontSize="md">
                                                    Save Changes
                                                  </Button>
                                                </HStack>
                                              </VStack>
                                            ) : (
                                              <VStack spacing={2.5} align="stretch">
                                                {/* Task Staged Header */}
                                                <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                                  <HStack spacing={2.5} align="center" flex={1}>
                                                    <Badge
                                                      colorScheme={hasDuplicate ? "orange" : task.isExcluded ? "gray" : "green"}
                                                      variant="subtle"
                                                      fontSize="md"
                                                      px={2}
                                                      py={0.5}
                                                      borderRadius="md"
                                                      fontFamily="mono"
                                                      fontWeight="bold"
                                                    >
                                                      {task.isExcluded ? "[EXCLUDED]" : hasDuplicate ? "[! DIFF]" : "[+ STAGED]"}
                                                    </Badge>
                                                    <Text
                                                      fontSize="md"
                                                      fontWeight="bold"
                                                      color={colorMode === "dark" ? "white" : "gray.800"}
                                                      textDecoration={task.isExcluded ? "line-through" : "none"}
                                                    >
                                                      {task.taskName}
                                                    </Text>
                                                  </HStack>

                                                  <HStack spacing={2}>
                                                    <Badge colorScheme="blue" fontSize="md" px={2.5} py={0.5} borderRadius="md">
                                                      {task.boardName}
                                                    </Badge>
                                                    <Badge
                                                      colorScheme={
                                                        task.taskPriority === "HIGH" || task.taskPriority === "URGENT"
                                                          ? "red"
                                                          : task.taskPriority === "MEDIUM"
                                                          ? "orange"
                                                          : "gray"
                                                      }
                                                      fontSize="md"
                                                      px={2.5}
                                                      py={0.5}
                                                      borderRadius="md"
                                                      fontWeight="semibold"
                                                    >
                                                      {task.taskPriority}
                                                    </Badge>
                                                    <IconButton
                                                      aria-label="Edit Staged Task"
                                                      icon={<FiEdit2 />}
                                                      size="md"
                                                      variant="ghost"
                                                      onClick={() => handleStartEdit(task)}
                                                      title="Edit task parameters"
                                                    />
                                                    <IconButton
                                                      aria-label={task.isExcluded ? "Include task" : "Exclude task"}
                                                      icon={task.isExcluded ? <FiPlus /> : <FiTrash2 />}
                                                      size="md"
                                                      colorScheme={task.isExcluded ? "green" : "red"}
                                                      variant="ghost"
                                                      onClick={() => handleToggleExclude(task.stagedId)}
                                                      title={task.isExcluded ? "Include in import" : "Exclude from import"}
                                                    />
                                                  </HStack>
                                                </Flex>

                                                {/* Duplicate Warning Alert */}
                                                {hasDuplicate && !task.isExcluded && (
                                                  <Box
                                                    p={3}
                                                    borderRadius={radiusStyle}
                                                    bg={colorMode === "dark" ? "rgba(237, 137, 54, 0.12)" : "orange.50"}
                                                    border="1px dashed"
                                                    borderColor="orange.400"
                                                  >
                                                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                                      <HStack spacing={2} align="center">
                                                        <Icon as={FiAlertTriangle} color="orange.400" boxSize={5} />
                                                        <Text fontSize="md" color={colorMode === "dark" ? "orange.200" : "orange.800"}>
                                                          <strong>Potential Duplicate ({task.duplicateInfo?.similarityScore}% match)</strong>: Similar to{" "}
                                                          {task.duplicateInfo?.source === "board" ? "existing task on board" : "another task in this batch"}{" "}
                                                          <em>"{task.duplicateInfo?.matchedName}"</em>
                                                        </Text>
                                                      </HStack>
                                                      <HStack spacing={2}>
                                                        <Button
                                                          size="sm"
                                                          variant="outline"
                                                          colorScheme="orange"
                                                          fontSize="md"
                                                          onClick={() => handleRenameWithSuffix(task.stagedId)}
                                                        >
                                                          Auto-Rename
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          colorScheme="red"
                                                          fontSize="md"
                                                          onClick={() => handleToggleExclude(task.stagedId)}
                                                        >
                                                          Exclude
                                                        </Button>
                                                      </HStack>
                                                    </Flex>
                                                  </Box>
                                                )}

                                                {/* Task Assignment Badge */}
                                                {!task.isExcluded && (
                                                  <HStack spacing={2} align="center">
                                                    <Icon as={FiUser} color="secondary.400" boxSize={4} />
                                                    <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                                                      <strong>Assignee:</strong> {effectiveAssignees.join(", ")}
                                                    </Text>
                                                  </HStack>
                                                )}

                                                {/* Task Description */}
                                                {task.taskDesc && (
                                                  <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"} noOfLines={2}>
                                                    {task.taskDesc}
                                                  </Text>
                                                )}

                                                {/* Subtasks Git Tree */}
                                                {task.taskItems && task.taskItems.length > 0 && (
                                                  <Box
                                                    pl={3.5}
                                                    py={2}
                                                    borderLeft="2px solid"
                                                    borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.200"}
                                                  >
                                                    <VStack spacing={1.5} align="stretch">
                                                      {task.taskItems.map((item: any, sIdx: number) => (
                                                        <HStack key={sIdx} spacing={2.5} align="center">
                                                          <Icon
                                                            as={item.isChecked ? FiCheckSquare : FiSquare}
                                                            color={item.isChecked ? "green.400" : "gray.400"}
                                                            boxSize={4}
                                                          />
                                                          <Text
                                                            fontSize="md"
                                                            color={
                                                              item.isChecked
                                                                ? colorMode === "dark"
                                                                  ? "gray.300"
                                                                  : "gray.700"
                                                                : "gray.500"
                                                            }
                                                          >
                                                            {item.taskItemName}
                                                          </Text>
                                                          {item.isChecked && (
                                                            <Badge colorScheme="green" variant="outline" fontSize="md" px={1.5}>
                                                              Done
                                                            </Badge>
                                                          )}
                                                        </HStack>
                                                      ))}
                                                    </VStack>
                                                  </Box>
                                                )}
                                              </VStack>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </VStack>
                                  </Box>
                                );
                              })
                            )}
                          </VStack>
                        </Box>
                      </VStack>
                    )}

                    {/* STEP 3: SUMMARY MANIFEST (MAPPED BY BACKLOG PARENT) */}
                    {wizardStep === "summary" && (
                      <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius={radiusStyle} fontSize="md">
                          <AlertIcon />
                          <AlertDescription fontSize="md">
                            <strong>Preview Manifest Mode</strong>: All staged tasks and subtasks are verified and mapped to their respective project backlog parents. (Safe mode: backend save is decoupled).
                          </AlertDescription>
                        </Alert>

                        <Box
                          p={4}
                          borderRadius={radiusStyle}
                          bg={colorMode === "dark" ? "rgba(15, 23, 42, 0.6)" : "secondary.50"}
                          border="1px solid"
                          borderColor={colorMode === "dark" ? "secondary.900" : "secondary.200"}
                        >
                          <VStack spacing={4} align="stretch">
                            <Flex justify="space-between" align="center">
                              <Text fontSize="md" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.900"}>
                                Staged Import Manifest
                              </Text>
                              <Badge colorScheme="secondary" fontSize="md" px={3} py={1} borderRadius="md">
                                {stagedTasks.filter((t) => !t.isExcluded).length} Validated Tasks Ready
                              </Badge>
                            </Flex>

                            <Divider borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"} />

                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3}>
                              <Box p={3} borderRadius={radiusStyle} bg={colorMode === "dark" ? "gray.700" : "white"}>
                                <Text fontSize="md" color="gray.500" mb={1}>
                                  Target Project
                                </Text>
                                <Text fontSize="md" fontWeight="bold" isTruncated>
                                  {DataProject?.projectName || "-"}
                                </Text>
                              </Box>

                              <Box p={3} borderRadius={radiusStyle} bg={colorMode === "dark" ? "gray.700" : "white"}>
                                <Text fontSize="md" color="gray.500" mb={1}>
                                  Assignment Strategy
                                </Text>
                                <Text fontSize="md" fontWeight="bold" color="secondary.400" isTruncated>
                                  {assignOption === "currentUser"
                                    ? `Assigned to Me (${currentLoggedInUserName})`
                                    : assignOption === "custom"
                                    ? `Custom (${customAssigneeIds.join(", ")})`
                                    : "Original JSON / Unassigned"}
                                </Text>
                              </Box>

                              <Box p={3} borderRadius={radiusStyle} bg={colorMode === "dark" ? "gray.700" : "white"}>
                                <Text fontSize="md" color="gray.500" mb={1}>
                                  Total Subtasks (Checklists)
                                </Text>
                                <Text fontSize="md" fontWeight="bold" color="green.400">
                                  {stagedTasks.filter((t) => !t.isExcluded).reduce((acc, t) => acc + (t.taskItems?.length || 0), 0)} Items
                                </Text>
                              </Box>

                              <Box p={3} borderRadius={radiusStyle} bg={colorMode === "dark" ? "gray.700" : "white"}>
                                <Text fontSize="md" color="gray.500" mb={1}>
                                  Duplicates Retained
                                </Text>
                                <Text fontSize="md" fontWeight="bold" color="orange.400">
                                  {stagedTasks.filter((t) => t.duplicateInfo?.isDuplicate && !t.isExcluded).length} Tasks
                                </Text>
                              </Box>
                            </Grid>

                            {/* Backlog Breakdown Mapping Section */}
                            <Box mt={2}>
                              <Text fontSize="md" fontWeight="bold" mb={2.5} color={colorMode === "dark" ? "gray.200" : "gray.800"}>
                                Backlog Parent Mapping Breakdown ({allBacklogSummary.length} Backlogs)
                              </Text>
                              <VStack spacing={2.5} align="stretch">
                                {allBacklogSummary.map((b) => (
                                  <Flex
                                    key={b.backlogId || b.backlogName}
                                    p={3}
                                    borderRadius={radiusStyle}
                                    bg={colorMode === "dark" ? "gray.800" : "white"}
                                    border="1px solid"
                                    borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                                    justify="space-between"
                                    align="center"
                                  >
                                    <HStack spacing={2.5}>
                                      <Icon as={FiFolder} color="purple.400" boxSize={5} />
                                      <Text fontSize="md" fontWeight="semibold">
                                        {b.backlogName}
                                      </Text>
                                      {b.backlogId && (
                                        <Badge colorScheme="purple" fontSize="md" px={2} py={0.5} borderRadius="md" fontFamily="mono">
                                          {b.backlogId}
                                        </Badge>
                                      )}
                                    </HStack>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="secondary" fontSize="md" px={2.5} py={0.5} borderRadius="md">
                                        {b.taskCount} Tasks
                                      </Badge>
                                      <Badge colorScheme="teal" fontSize="md" px={2.5} py={0.5} borderRadius="md">
                                        {b.subtaskCount} Subtasks
                                      </Badge>
                                    </HStack>
                                  </Flex>
                                ))}
                              </VStack>
                            </Box>
                          </VStack>
                        </Box>
                      </VStack>
                    )}

                    {jsonImportError && (
                      <Alert status="error" borderRadius={radiusStyle} fontSize="md">
                        <AlertIcon />
                        <AlertDescription fontSize="md">{jsonImportError}</AlertDescription>
                      </Alert>
                    )}

                    {jsonImportResult && (
                      <Alert
                        status={jsonImportResult.failed === 0 ? "success" : "warning"}
                        borderRadius={radiusStyle}
                        fontSize="md"
                      >
                        <AlertIcon />
                        <AlertDescription fontSize="md">
                          {jsonImportResult.success} task(s) imported successfully
                          {jsonImportResult.failed > 0
                            ? `, ${jsonImportResult.failed} failed (check board names match available stages)`
                            : ""}
                        </AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                </ModalBody>
                <ModalFooter
                  borderTop="1px solid"
                  borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.100"}
                  py={3.5}
                  justifyContent="space-between"
                >
                  <HStack spacing={2}>
                    {wizardStep === "preview" && (
                      <Button
                        size="md"
                        variant="outline"
                        leftIcon={<FiArrowLeft />}
                        onClick={() => setWizardStep("input")}
                        rounded={radiusStyle}
                        fontSize="md"
                      >
                        Back to JSON
                      </Button>
                    )}
                    {wizardStep === "summary" && (
                      <Button
                        size="md"
                        variant="outline"
                        leftIcon={<FiArrowLeft />}
                        onClick={() => setWizardStep("preview")}
                        rounded={radiusStyle}
                        fontSize="md"
                      >
                        Back to Preview
                      </Button>
                    )}
                  </HStack>

                  <HStack spacing={3}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onJsonImportClose();
                        setJsonImportError("");
                        setJsonImportResult(null);
                        setWizardStep("input");
                      }}
                      rounded={radiusStyle}
                      fontSize="md"
                    >
                      {wizardStep === "summary" ? "Close" : "Cancel"}
                    </Button>

                    {wizardStep === "input" && (
                      <Button
                        colorScheme="secondary"
                        onClick={handleProceedToPreview}
                        isDisabled={!jsonImportText.trim()}
                        rounded={radiusStyle}
                        fontSize="md"
                        rightIcon={<FiChevronRight />}
                      >
                        Proceed to Preview
                      </Button>
                    )}

                    {wizardStep === "preview" && (
                      <Button
                        colorScheme="secondary"
                        onClick={handleProceedToSummary}
                        isDisabled={stagedTasks.filter((t) => !t.isExcluded).length === 0}
                        rounded={radiusStyle}
                        fontSize="md"
                        rightIcon={<FiChevronRight />}
                      >
                        Proceed to Summary ({stagedTasks.filter((t) => !t.isExcluded).length})
                      </Button>
                    )}

                    {wizardStep === "summary" && (
                      <Button
                        colorScheme="secondary"
                        onClick={onConfirmBulkOpen}
                        isLoading={isImportingJson}
                        rounded={radiusStyle}
                        fontSize="md"
                        leftIcon={<FiCheckSquare />}
                      >
                        Confirm & Save Bulk Tasks ({stagedTasks.filter((t) => !t.isExcluded).length})
                      </Button>
                    )}
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* CONFIRMATION ACTION MODAL BEFORE BULK SUBMIT */}
            <Modal
              isOpen={isConfirmBulkOpen}
              onClose={() => {
                if (!isImportingJson) onConfirmBulkClose();
              }}
              isCentered
              size="xl"
              closeOnOverlayClick={!isImportingJson}
            >
              <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
              <ModalContent
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderRadius={radiusStyle}
                boxShadow="2xl"
                border="1px solid"
                borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.200"}
              >
                <ModalHeader
                  borderBottom="1px solid"
                  borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.100"}
                  py={4}
                >
                  <HStack spacing={3} align="center">
                    <Icon as={FiAlertCircle} color="secondary.400" boxSize={6} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="lg" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                        Confirm Bulk Task Creation
                      </Text>
                      <Text fontSize="md" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                        Verify import scope before committing to project database
                      </Text>
                    </VStack>
                  </HStack>
                </ModalHeader>
                <ModalCloseButton isDisabled={isImportingJson} top={4} right={4} />

                <ModalBody py={5}>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius={radiusStyle} fontSize="md">
                      <AlertIcon />
                      <AlertDescription fontSize="md">
                        You are about to create <strong>{stagedTasks.filter((t) => !t.isExcluded).length} tasks</strong> and{" "}
                        <strong>{stagedTasks.filter((t) => !t.isExcluded).reduce((acc, t) => acc + (t.taskItems?.length || 0), 0)} subtasks</strong>{" "}
                        in project <strong>{DataProject?.projectName || "-"}</strong>. This will update the project Kanban board and mark parent backlogs as in-progress.
                      </AlertDescription>
                    </Alert>

                    <Box
                      p={4}
                      borderRadius={radiusStyle}
                      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
                      border="1px solid"
                      borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                    >
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3.5}>
                        <Box>
                          <Text fontSize="md" color="gray.500">
                            Target Project:
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                            {DataProject?.projectName || "-"}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="md" color="gray.500">
                            Assignment Mode:
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="secondary.400">
                            {assignOption === "currentUser"
                              ? `Assigned to Me (${currentLoggedInUserName})`
                              : assignOption === "custom"
                              ? `Custom Assignees (${customAssigneeIds.join(", ")})`
                              : "Original JSON / Unassigned"}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="md" color="gray.500">
                            Total New Tasks:
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="green.400">
                            {stagedTasks.filter((t) => !t.isExcluded).length} Tasks
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="md" color="gray.500">
                            Total Subtask Checklists:
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="teal.400">
                            {stagedTasks.filter((t) => !t.isExcluded).reduce((acc, t) => acc + (t.taskItems?.length || 0), 0)} Items
                          </Text>
                        </Box>
                      </Grid>

                      <Divider my={3} borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"} />

                      <Text fontSize="md" fontWeight="semibold" mb={2} color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                        Backlog Parent Distribution ({allBacklogSummary.length} Backlogs):
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {allBacklogSummary.map((b) => (
                          <Flex
                            key={b.backlogId || b.backlogName}
                            p={2.5}
                            borderRadius={radiusStyle}
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            justify="space-between"
                            align="center"
                            border="1px solid"
                            borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.200"}
                          >
                            <HStack spacing={2}>
                              <Icon as={FiFolder} color="purple.400" boxSize={4} />
                              <Text fontSize="md" fontWeight="medium">
                                {b.backlogName}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Badge colorScheme="secondary" fontSize="md" px={2} py={0.5} borderRadius="md">
                                {b.taskCount} tasks
                              </Badge>
                              <Badge colorScheme="teal" fontSize="md" px={2} py={0.5} borderRadius="md">
                                {b.subtaskCount} subtasks
                              </Badge>
                            </HStack>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </ModalBody>

                <ModalFooter
                  borderTop="1px solid"
                  borderColor={colorMode === "dark" ? "whiteAlpha.100" : "gray.100"}
                  py={3.5}
                  justifyContent="space-between"
                >
                  <Button
                    variant="ghost"
                    onClick={onConfirmBulkClose}
                    isDisabled={isImportingJson}
                    fontSize="md"
                    rounded={radiusStyle}
                  >
                    Cancel / Review Again
                  </Button>
                  <Button
                    colorScheme="secondary"
                    onClick={handleExecuteBulkImport}
                    isLoading={isImportingJson}
                    leftIcon={<FiCheck />}
                    fontSize="md"
                    rounded={radiusStyle}
                  >
                    Yes, Execute & Save Tasks
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </DndProvider>

        {/* Archived Tasks Drawer */}
        <Drawer
          isOpen={isArchivedDrawerOpen}
          placement="right"
          onClose={() => setIsArchivedDrawerOpen(false)}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <HStack>
                <Icon as={FaArchive} />
                <Text>Archived Tasks</Text>
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              {isLoadingArchived ? (
                <Flex justify="center" align="center" h="200px">
                  <Spinner size="lg" />
                </Flex>
              ) : archivedTasks.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {archivedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onUpdateTask={() => {}}
                      onRefreshTasks={() => {}}
                      isRecentlyMoved={false}
                      DataProject={DataProject}
                      DataBacklogs={DataBacklogs}
                      isCompactView={isCompactView}
                    />
                  ))}
                </VStack>
              ) : (
                <Flex
                  justify="center"
                  align="center"
                  h="200px"
                  direction="column"
                  color="gray.500"
                >
                  <Icon as={FaArchive} boxSize={8} mb={2} />
                  <Text>No archived tasks</Text>
                </Flex>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </LayoutAdminWorkspace>
    </>
  );
}

export default ProjectWorkspaceView;
