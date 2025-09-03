"use client";

import React, { useEffect, useRef, useState } from "react";
import { DropZoneComponent } from "@/app/components/dropzone";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import SidebarWithHeader from "@/app/components/sidebar";
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
import {
  generateUUIDV1,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { AuthDataModelInterface } from "@/app/context/AuthContext";

import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
import useMasterBoardTask, { MasterBoardTaskResponse } from "@/app/services/useMasterBoardTask";
import useTasks, {
  CreateSimpleTaskPayload,
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
  AssignUsersTaskPayload,
  GenerateTaskBoardPayload,
} from "@/app/services/useTasks";
import { PaggingListPayload, PaggingListPayloadCustom, ListSearchByParam } from "@/app/types/masterTypes";
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
import {
  FaSync,
  FaEdit,
  FaArchive,
  FaCog,
} from "react-icons/fa";
import {
  FiAlertCircle,
  FiArchive,
  FiArrowLeft,
  FiCheckCircle,
  FiCheckSquare,
  FiCircle,
  FiFilter,
  FiInbox,
  FiList,
  FiLoader,
  FiMessageSquare,
  FiNavigation,
  FiPaperclip,
  FiPlusCircle,
  FiRefreshCcw,
  FiSave,
  FiSearch,
  FiSettings,
  FiShare2,
  FiTrello,
  FiUser,
} from "react-icons/fi";
import { HorizontalFadeDivider } from "@/app/components/divider";
import { convertToCustomDateFormat, truncateText } from "@/app/helper/MasterHelper";
import { LuGrip } from "react-icons/lu";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useUsers, {
  UserShortResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { GoFilter } from "react-icons/go";
import { MdOutlineSort } from "react-icons/md";
import { CalendarIcon, CheckIcon, ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

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
  titleName: "Project Kanban",
  breadCrumb: ["Home", "Project Development", "Kanban"],
};

// DateRangePicker component for selecting start and end dates
interface DateRangePickerProps {
  taskId: string;
  initialStartDate: string | null | undefined;
  initialEndDate: string | null | undefined;
  onSave: (startDate: string | null, endDate: string | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  taskId,
  initialStartDate,
  initialEndDate,
  onSave,
}) => {
  const [startDate, setStartDate] = useState<string | null>(
    initialStartDate || null
  );
  const [endDate, setEndDate] = useState<string | null>(initialEndDate || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStartDate(initialStartDate || null);
    setEndDate(initialEndDate || null);
  }, [initialStartDate, initialEndDate, taskId]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(startDate, endDate);
    setIsSaving(false);
    document.body.click();
  };

  const formatDateForInput = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <HStack justify="space-between" align="center">
          <FormLabel fontSize="sm" mb={0}>
            Start Date
          </FormLabel>
          {startDate && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={() => setStartDate(null)}
            >
              Clear
            </Button>
          )}
        </HStack>
        <Input
          type="datetime-local"
          size="sm"
          value={formatDateForInput(startDate)}
          onChange={(e) => {
            const newDate = e.target.value
              ? new Date(e.target.value).toISOString()
              : null;
            setStartDate(newDate);
          }}
          mt={1}
        />
      </FormControl>

      <FormControl>
        <HStack justify="space-between" align="center">
          <FormLabel fontSize="sm" mb={0}>
            Due Date
          </FormLabel>
          {endDate && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={() => setEndDate(null)}
            >
              Clear
            </Button>
          )}
        </HStack>
        <Input
          type="datetime-local"
          size="sm"
          value={formatDateForInput(endDate)}
          onChange={(e) => {
            const newDate = e.target.value
              ? new Date(e.target.value).toISOString()
              : null;
            setEndDate(newDate);
          }}
          mt={1}
        />
      </FormControl>

      <HStack justify="space-between">
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        >
          Clear All
        </Button>
        <Button
          size="sm"
          colorScheme={isSaving ? "yellow" : "blue"}
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save
        </Button>
      </HStack>
    </VStack>
  );
};
const ItemTypes = {
  TASK: "task",
};

// Define custom window interface to add our global variables
declare global {
  interface Window {
    projectKanbanBoards?: MasterBoardTaskResponse[];
    refreshProjectKanbanData?: () => void;
    moveProjectTaskFunction?: (
      taskId: string,
      boardId: string,
      index?: number
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
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onUpdateTask,
  onRefreshTasks,
  isRecentlyMoved = false,
  DataProject,
  DataBacklogs = []
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
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detailedTask, setDetailedTask] = useState<TaskViewModel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [taskBoards, setTaskBoards] = useState<TaskBoardViewModel[]>([]);
  const [newTaskItemName, setNewTaskItemName] = useState("");
  const [isAddingTaskItem, setIsAddingTaskItem] = useState(false);
  const [taskItems, setTaskItems] = useState<TaskItemResponse[]>([]);
  const [isLoadingTaskItems, setIsLoadingTaskItems] = useState(false);
  
  // States for inline editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

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
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  // User assignment states and handlers
  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<UsersResponse[]>([]);
  
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();

  const { List: ListUsers } = useUsers();

  // Get user data for assignment
  const GetDataUser = async (searchValue: string, limit: number = 3): Promise<UsersResponse[]> => {
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
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 2) {
      const ListUserData: UsersResponse[] = await GetDataUser(textSearch, 3);
      setDataUsers(ListUserData);
    } else if (textSearch.length <= 0) {
      setDataUsers([]);
    }
  };

  const handleAddUserAssign = (data: UsersResponse) => {
    setChoosedMemberProjects([...ChoosedMemberProjects, data]);
    setDataUsers([]);
    setSearchUserInput("");
  };

  const handleRemoveUserAssign = (id: string) => {
    const updatedProjects = ChoosedMemberProjects.filter(
      (project) => project.id !== id
    );
    setChoosedMemberProjects(updatedProjects);
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
  const updateTaskDates = async (startDate: string | null, endDate: string | null) => {
    if (!detailedTask) return;

    const normalizedStartDate = startDate === undefined ? null : startDate;
    const normalizedEndDate = endDate === undefined ? null : endDate;

    if (
      normalizedStartDate === detailedTask.startDate &&
      normalizedEndDate === detailedTask.endDate
    ) {
      return;
    }

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
  const handleCardClick = async (e: React.MouseEvent) => {
    // Prevent click from triggering during drag operations
    if (!isDragging) {
      setIsLoadingDetails(true);
      try {
        // Fetch the latest task details
        const response = await GetTaskDetail(task.id, getToken());

        if (response?.statusCode === RES_CODE_OK && response.data) {
          setDetailedTask(response.data);

          // Populate ChoosedMemberProjects with current assignUsers
          if (response.data.assignUsers && response.data.assignUsers.length > 0) {
            const assignedUsers: UsersResponse[] = response.data.assignUsers.map((user) => ({
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
    AssignUsersTask,
    MoveTask,
    ListTasksBoard,
  } = useTasks();

  // Helper functions for current user
  const getCurrentUser = () => DataAuth;
  const getCurrentUserName = () => DataAuth?.nama || "User";
  const getCurrentUserAvatar = () => DataAuth?.profilePict || "";

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

      if (detailedTask.startDate) updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({ ...detailedTask, taskName: editedName.trim() });
        showToast({
          description: "Task name updated successfully",
          statusToast: "success",
        });
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

      if (detailedTask.startDate) updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({ ...detailedTask, taskDesc: editedDesc });
        showToast({
          description: "Task description updated successfully",
          statusToast: "success",
        });
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

      if (detailedTask.startDate) updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setDetailedTask({ ...detailedTask, percentageStatus: progressPercentage });
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
        setTaskItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.id === itemId ? { ...item, isDone: newStatus } : item
          );
          updateTaskProgress(updatedItems);
          return updatedItems;
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

  // Handle editing a task item
  const handleEditTaskItem = async (itemId: string, newName: string) => {
    if (!detailedTask || !newName.trim()) return;

    try {
      const taskItem = taskItems.find((item) => item.id === itemId);
      if (!taskItem) return;

      const updatePayload: TaskItemUpdatePayload = {
        id: itemId,
        taskItemName: newName.trim(),
        isDone: taskItem.isDone,
      };

      const response = await UpdateTaskItem(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        setTaskItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? { ...item, taskItemName: newName.trim() }
              : item
          )
        );

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
    }
  };

  // Load task comments with pagination
  const loadTaskComments = async (taskId: string, page: number = 0, append: boolean = false) => {
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

      if (response?.statusCode === RES_CODE_OK && response.data && Array.isArray(response.data)) {
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
              : comment
          )
        );

        setEditingCommentId(null);
        setEditedCommentText("");

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
      "Are you sure you want to delete this comment? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingCommentId(commentId);
    try {
      const token = getToken();
      const response = await DeleteTaskComment(commentId, token);

      if (response?.statusCode === RES_CODE_OK) {
        setTaskComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );

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
        showToast({
          description: "Task archived successfully",
          statusToast: "success",
        });

        handleModalClose();
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
          boxShadow={isRecentlyMoved ? "md" : "sm"}
          _hover={{ boxShadow: "md" }}
          bg={isRecentlyMoved ? "blue.50" : undefined}
          borderColor={isRecentlyMoved ? "blue.300" : undefined}
          transition="all 0.3s ease"
          rounded={radiusStyle}
          mb={3}
        >
          <CardBody px={3}>
            <VStack align="start" spacing={2}>
              {/* Task metadata */}
              <HStack w="full" justify="space-between">
                <Badge
                  rounded={"md"}
                  px={2}
                  colorScheme={
                    task.taskPriority === "HIGH"
                      ? "red"
                      : task.taskPriority === "MEDIUM"
                      ? "orange"
                      : task.taskPriority === "CRITICAL"
                      ? "purple"
                      : "green"
                  }
                >
                  {task.taskPriority}
                </Badge>
              </HStack>
              
              <Text fontWeight={600} fontSize={"medium"}>
                {task.taskName}
              </Text>
              
              {/* Project Information */}
              {DataProject && (
                <Text
                  fontSize={"xs"}
                  color={"blue.600"}
                  fontWeight={500}
                  bg={"blue.50"}
                  px={2}
                  py={1}
                  rounded={"md"}
                  border={"1px solid"}
                  borderColor={"blue.200"}
                  display={"none"}
                >
                  {DataProject.projectName}
                </Text>
              )}
              
              <Text
                fontSize={"smaller"}
                lineHeight={1.3}
                color={"gray"}
                fontWeight={600}
              >
                Last Update
                <Text fontWeight={500}>
                  {task.updatedAt == null
                    ? convertToCustomDateFormat(task.createdAt)
                    : convertToCustomDateFormat(task.updatedAt)}
                </Text>
              </Text>

              <Text fontSize={"small"} color={"gray"} as={"p"}>
                {truncateText(task.taskDesc, 100)}
              </Text>

              {/* Task progress */}
              {task.percentageStatus > 0 && (
                <Box w="full" h="4px" bg="gray.100" borderRadius="full">
                  <Box
                    h="100%"
                    w={`${task.percentageStatus}%`}
                    bg="blue.400"
                    borderRadius="full"
                  />
                </Box>
              )}

              <Flex
                as={HStack}
                w={"full"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Flex as={HStack} w={"full"} justifyContent={"start"}>
                  {task.countCommnetTask > 0 && (
                    <HStack spacing={1} alignItems="center">
                      <Icon as={FiMessageSquare} color="gray.600" boxSize={4} />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {task.countCommnetTask}
                      </Text>
                    </HStack>
                  )}
                  {/* Task item count (if available) */}
                  {task.countTaskItem > 0 && (
                    <HStack spacing={1} alignItems="center">
                      <Icon as={FiCheckSquare} color="gray.600" boxSize={4} />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {task.countTaskItemDone}/{task.countTaskItem}
                      </Text>
                    </HStack>
                  )}
                </Flex>
                <Flex as={HStack} w={"full"} justifyContent={"end"} spacing={1}>
                  {/* Task assignees (if available) */}
                  {task.assignUsers && task.assignUsers.length > 0 && (
                    <Tooltip
                      hasArrow
                      label={
                        <Box>
                          {task.assignUsers.map(
                            (user: UserShortResponse, index: number) => (
                              <Text key={index} fontSize="x-small">
                                {user.nama}
                              </Text>
                            )
                          )}
                        </Box>
                      }
                      bg="secondary.500"
                      color="white"
                      borderRadius={"md"}
                    >
                      <AvatarGroup size="sm" max={4}>
                        {task.assignUsers.map((user: UserShortResponse) => (
                          <Avatar
                            key={user.id}
                            name={user.nama}
                            src={user.profilePict || undefined}
                          />
                        ))}
                      </AvatarGroup>
                    </Tooltip>
                  )}
                </Flex>
              </Flex>
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
                              isDisabled={board.boardName === detailedTask.boardName}
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
                          <MenuItem icon={<Badge colorScheme="green">LOW</Badge>}>
                            Low Priority
                          </MenuItem>
                          <MenuItem icon={<Badge colorScheme="orange">MEDIUM</Badge>}>
                            Medium Priority
                          </MenuItem>
                          <MenuItem icon={<Badge colorScheme="red">HIGH</Badge>}>
                            High Priority
                          </MenuItem>
                          <MenuItem icon={<Badge colorScheme="purple">CRITICAL</Badge>}>
                            Critical Priority
                          </MenuItem>
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
                    <Flex
                      w="full"
                      as={HStack}
                      alignItems="center"
                      justifyContent="start"
                      spacing={2}
                      color={"gray.700"}
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
                        <Text
                          fontWeight={600}
                          fontSize={23}
                          onClick={handleEditName}
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                          p={1}
                          borderRadius="md"
                          transition="all 0.2s"
                        >
                          {detailedTask.taskName}
                        </Text>
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
                              ? `${new Date(
                                  detailedTask.startDate
                                ).toLocaleDateString()} - ${new Date(
                                  detailedTask.endDate
                                ).toLocaleDateString()}`
                              : detailedTask.startDate
                              ? `Starts: ${new Date(
                                  detailedTask.startDate
                                ).toLocaleDateString()}`
                              : detailedTask.endDate
                              ? `Due: ${new Date(
                                  detailedTask.endDate
                                ).toLocaleDateString()}`
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
                            <DateRangePicker
                              taskId={detailedTask.id}
                              initialStartDate={detailedTask.startDate}
                              initialEndDate={detailedTask.endDate}
                              onSave={(startDate, endDate) => {
                                updateTaskDates(startDate, endDate);
                              }}
                            />
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
                          setDataUsers([]);
                          onAssignModalOpen();
                        }}
                      >
                        Assign Task
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
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Press Ctrl+Enter to save, Esc to cancel
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        w="full"
                        onClick={handleEditDesc}
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        p={2}
                        borderRadius="md"
                        transition="all 0.2s"
                        minH="60px"
                      >
                        {detailedTask.taskDesc ? (
                          <Text>{detailedTask.taskDesc}</Text>
                        ) : (
                          <Text color="gray.400">
                            Add a more detailed description...
                          </Text>
                        )}
                      </Box>
                    )}
                    {/* Task Items (Checklist) */}
                    <Box mt={4}>
                      <Flex
                        w="full"
                        justifyContent="space-between"
                        as={HStack}
                        spacing={2}
                        color={"gray.700"}
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
                          color="gray.700"
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
                              _hover={{ bg: "gray.50" }}
                            >
                              <Checkbox
                                isChecked={item.isDone === "Y"}
                                onChange={() => handleToggleTaskItem(item.id, item.isDone === "Y" ? "N" : "Y")}
                                colorScheme={item.isDone === "Y" ? "green" : "blue"}
                                mr={2}
                              />
                              <Text
                                as={item.isDone === "Y" ? "s" : "span"}
                                color={item.isDone === "Y" ? "gray.500" : "inherit"}
                                flex="1"
                                cursor="pointer"
                                onClick={() => handleEditTaskItem(item.id, item.taskItemName)}
                              >
                                {item.taskItemName}
                              </Text>
                              <IconButton
                                aria-label="Delete task item"
                                icon={<DeleteIcon />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteTaskItem(item.id)}
                              />
                            </Flex>
                          ))}
                        </Flex>
                      ) : (
                        <Box px={4} py={2}>
                          <Text color="gray.500">
                            No subtasks yet. Add one below.
                          </Text>
                        </Box>
                      )}

                      {/* Add new task item */}
                      <Box px={4} w="full" my={4}>
                        <form onSubmit={handleAddTaskItem}>
                          <InputGroup size="sm">
                            <Input
                              placeholder="Add a new subtask..."
                              value={newTaskItemName}
                              onChange={(e) =>
                                setNewTaskItemName(e.target.value)
                              }
                              pr="4.5rem"
                              variant={"unstyled"}
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                h="1.75rem"
                                size="sm"
                                type="submit"
                                colorScheme="secondary"
                                isDisabled={!newTaskItemName.trim()}
                                isLoading={isAddingTaskItem}
                              >
                                Tambah
                              </Button>
                            </InputRightElement>
                          </InputGroup>
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
                      color={"gray.700"}
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
                        <Flex as={VStack} spacing={1} alignItems="start" w="full" pl={3}>
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
                              <Text fontSize={12} color="gray.500" alignSelf="center">
                                {convertToCustomDateFormat(comment.createdAt)}
                              </Text>
                            </Flex>
                            {/* Show menu only if user owns the comment */}
                            {getCurrentUser()?.id === comment.userCreated.id && (
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
                                      handleStartEditComment(comment.id, comment.comCaptions || "")
                                    }
                                    isDisabled={editingCommentId === comment.id || isUpdatingComment || deletingCommentId === comment.id}
                                  >
                                    Edit Comment
                                  </MenuItem>
                                  <MenuItem
                                    icon={<FaTrash />}
                                    color="red.500"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    isDisabled={editingCommentId === comment.id || isUpdatingComment || deletingCommentId === comment.id}
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
                                onChange={(e) => setEditedCommentText(e.target.value)}
                                placeholder="Edit your comment..."
                                size="sm"
                                resize="vertical"
                                minH="60px"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleUpdateComment(comment.id);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelEditComment();
                                  }
                                }}
                              />
                              <Text fontSize="xs" color="gray.500" textAlign="right">
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
                                  colorScheme={isUpdatingComment ? "yellow" : "blue"}
                                  onClick={() => handleUpdateComment(comment.id)}
                                  isLoading={isUpdatingComment}
                                  isDisabled={!editedCommentText.trim() || isUpdatingComment}
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
                        <Text color="gray.500" fontSize="sm">
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
                      color={"gray.700"}
                    >
                      <FaCog size={16} />
                      <Text fontWeight={600} fontSize={18}>
                        Detail Task
                      </Text>
                    </Flex>

                    {/* Assignees */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Assigned To
                      </Text>
                      {ChoosedMemberProjects &&
                      ChoosedMemberProjects.length > 0 ? (
                        <Wrap>
                          {ChoosedMemberProjects.map((user) => (
                            <WrapItem key={user.id}>
                              <HStack
                                p={2}
                                bg="gray.50"
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
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Backlog
                      </Text>
                      {detailedTask?.backlogId ? (
                        <Box
                          p={3}
                          bg="blue.50"
                          border="1px solid"
                          borderColor="blue.200"
                          rounded="md"
                        >
                          <Text fontSize="sm" fontWeight="bold" color="blue.700">
                            {DataBacklogs.find((b: BacklogDataResponse) => b.id === detailedTask.backlogId)?.backlogName || "Unknown Backlog"}
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No backlog assigned
                        </Text>
                      )}
                    </Box>

                    {/* Dates */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Timeline
                      </Text>
                      <VStack align="start" spacing={2}>
                        {detailedTask?.startDate ? (
                          <HStack>
                            <Text fontSize="xs" fontWeight="bold" w="80px">
                              Start Date:
                            </Text>
                            <Text fontSize="sm">
                              {new Date(
                                detailedTask.startDate
                              ).toLocaleDateString()}
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
                              Due Date:
                            </Text>
                            <Text fontSize="sm">
                              {new Date(
                                detailedTask.endDate
                              ).toLocaleDateString()}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>

                    {/* Progress */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Progress
                      </Text>
                      <HStack spacing={2}>
                        <Box w="full" h="8px" bg="gray.100" borderRadius="full">
                          <Box
                            h="100%"
                            w={`${detailedTask?.percentageStatus || 0}%`}
                            bg="blue.400"
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
                      <Text fontSize="sm" color="gray.500" mb={1}>
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
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {detailedTask && new Date(detailedTask.createdAt).toLocaleString()}
                      </Text>
                    </Box>

                    <HorizontalFadeDivider />

                    {/* Actions */}
                    <Flex as={Stack} w="full">
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={"red"}
                        leftIcon={<Icon as={FaArchive} />}
                        onClick={() => detailedTask && handleArchiveTask(detailedTask.id)}
                        isLoading={isArchiving}
                      >
                        Archive
                      </Button>
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={"blue"}
                        leftIcon={<Icon as={FiShare2} />}
                      >
                        Share
                      </Button>
                    </Flex>

                    <Flex
                      w="full"
                      justifyContent="start"
                      as={HStack}
                      spacing={2}
                      color={"gray.700"}
                    >
                      <FaCog size={16} />
                      <Text fontWeight={600} fontSize={18}>
                        Aktivitas Task
                      </Text>
                    </Flex>
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
        size="2xl"
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
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Search Users
                    </Text>
                    <Input
                      placeholder="Search by name or ID..."
                      value={SearchUserInput}
                      onChange={(e) => handleSearchUserAssign(e.target.value)}
                    />
                  </Box>

                  {/* Search Results */}
                  <Box>
                    {DataUsers.length > 0 && (
                      <VStack spacing={2} align="stretch">
                        {DataUsers.map((user) => {
                          const isAlreadyAssigned = ChoosedMemberProjects.find(
                            (assignedUser) => assignedUser.id === user.id
                          );
                          return (
                            <HStack
                              key={user.id}
                              p={3}
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              justify="space-between"
                              bg={isAlreadyAssigned ? "gray.50" : "white"}
                            >
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={user.nama}
                                  src={user.profilePict || undefined}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{user.nama}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {user.email}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleAddUserAssign(user)}
                                isDisabled={!!isAlreadyAssigned}
                              >
                                {isAlreadyAssigned ? "Added" : "Add"}
                              </Button>
                            </HStack>
                          );
                        })}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </GridItem>

              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Selected Users ({ChoosedMemberProjects.length})
                    </Text>
                    {ChoosedMemberProjects.length > 0 ? (
                      <VStack spacing={2} align="stretch">
                        {ChoosedMemberProjects.map((user) => (
                          <HStack
                            key={user.id}
                            p={3}
                            border="1px solid"
                            borderColor="blue.200"
                            borderRadius="md"
                            justify="space-between"
                            bg="blue.50"
                          >
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={user.nama}
                                src={user.profilePict || undefined}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">{user.nama}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {user.email}
                                </Text>
                              </VStack>
                            </HStack>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveUserAssign(user.id)}
                            >
                              Remove
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={4}>
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
    </>
  );
};

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
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
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
      case 1: return "gray";   // TODO
      case 2: return "blue";   // IN PROGRESS  
      case 3: return "orange"; // REVIEW
      case 4: return "green";  // DONE
      default: return "purple";
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
    const completed = tasks.filter(task => task.percentageStatus === 100).length;
    const inProgress = tasks.filter(task => task.percentageStatus > 0 && task.percentageStatus < 100).length;
    
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
          bg={`${getBoardColor(board.indexStage)}.50`}
          roundedTop={radiusStyle}
          borderBottom="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          p={4}
        >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="sm" color={`${getBoardColor(board.indexStage)}.600`}>
                {board.boardName}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getBoardColor(board.indexStage)} size="sm">
                  {tasks.length} tasks
                </Badge>
              </HStack>
            </VStack>
            
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Column options"
                icon={<FaEllipsisVertical />}
                size="sm"
                variant="ghost"
                colorScheme={getBoardColor(board.indexStage)}
              />
              <MenuList>
                <MenuItem icon={<FaPlus />} onClick={() => onAddTask(board.id)}>
                  Add Task
                </MenuItem>
                <MenuItem icon={<FiFilter />}>
                  Filter Tasks
                </MenuItem>
                <MenuItem icon={<MdOutlineSort />}>
                  Sort Tasks
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Quick Stats */}
          {tasks.length > 0 && (
            <HStack spacing={4} fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.400"}>
              <HStack spacing={1}>
                <FiCheckCircle />
                <Text>{stats.completed} done</Text>
              </HStack>
              <HStack spacing={1}>
                <FiLoader />
                <Text>{stats.inProgress} in progress</Text>
              </HStack>
            </HStack>
          )}
        </VStack>
      </CardHeader>

      <CardBody p={4} maxH="calc(100vh - 300px)" overflowY="auto">
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
                <Text fontSize="sm" fontWeight="medium">No tasks yet</Text>
                <Text fontSize="xs">Drag tasks here or click "Add a task"</Text>
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
};

// Main Project Kanban Component with comprehensive features
function ProjectKanbanView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
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
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Project ID from URL (no backlogId needed)
  const [projectId, setProjectId] = useState<string | null>(null);
  
  useEffect(() => {
    const projId = searchParams.get("projectId");
    if (projId) {
      setProjectId(projId);
    }
  }, [searchParams]);

  // Data States
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(null);
  const [DataBoard, setDataBoard] = useState<MasterBoardTaskResponse[]>([]);
  const [DataTasks, setDataTasks] = useState<TaskViewModel[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Track recently moved task for visual feedback
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);

  // Track drop preview position for visual feedback during drag
  const [dropPreview, setDropPreview] = useState<{
    boardId: string;
    beforeTaskId: string | null;
    afterTaskId: string | null;
  } | null>(null);

  // Modal States
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  
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

  // API Hooks
  const { GetDetailById: GetProjectDetail } = useProjects();
  const { List: GetMasterBoardTasks } = useMasterBoardTask();
  const { ListBacklog } = useRequirements();
  const { 
    ListTasksBoard,
    ListTasksPaged, 
    CreateSimpleTask, 
    MoveTask, 
    UpdateTask
  } = useTasks();
  const { List: ListUsers } = useUsers();

  // Users data for assignment
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [DataBacklogs, setDataBacklogs] = useState<BacklogDataResponse[]>([]);

  // Handle task creation - refresh data after task is created
  const handleTaskCreated = () => {
    setRefreshData(RefreshData + 1);
  };

  // Fetch Project Data
  useEffect(() => {
    if (DataAuth && projectId && tokenData) {
      const fetchProjectData = async () => {
        try {
          setIsLoadingProcess(true);
          const response = await GetProjectDetail(projectId, tokenData);
          
          if (response?.statusCode === RES_CODE_OK) {
            setDataProject(response.data as ProjectDataResponse);
          } else {
            showToast({
              description: response?.message || "Failed to load project",
              statusToast: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          showToast({
            description: "An error occurred while loading project",
            statusToast: "error",
          });
        } finally {
          setIsLoadingProcess(false);
        }
      };

      fetchProjectData();
    }
  }, [DataAuth, projectId, tokenData]);

  // Fetch Master Board Tasks (for board configuration)
  useEffect(() => {
    if (DataAuth && tokenData) {
      const fetchMasterBoards = async () => {
        try {
          const PayloadList: PaggingListPayloadCustom = {
            search: "",
            limit: 100,
            page: 0,
            filterWhere: [
              {
                field: "isDisplay",
                operator: "=",
                value: "Y",
              },
            ],
            fieldOrder: ["indexStage"],
            orderDir: "asc",
          };

          const response = await GetMasterBoardTasks(PayloadList, tokenData);
          
          if (response?.statusCode === RES_CODE_OK) {
            const boards = response.data as MasterBoardTaskResponse[];
            setDataBoard(boards);
          } else {
            showToast({
              description: response?.message || "Failed to load board configuration",
              statusToast: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching master boards:", error);
          showToast({
            description: "An error occurred while loading board configuration",
            statusToast: "error",
          });
        }
      };

      fetchMasterBoards();
    }
  }, [DataAuth, tokenData]);

  // Fetch Backlogs for filtering
  useEffect(() => {
    if (DataAuth && DataProject?.reqParentId && tokenData) {
      const fetchBacklogs = async () => {
        try {
          const PayloadList: PaggingListPayload = {
            search: "",
            limit: 100,
            page: 0,
            filterWhere: [
              {
                field: "reqId",
                value: DataProject.reqParentId!,
                operator: "=",
              },
            ],
            fieldOrder: ["backlogName"],
            orderDir: "asc",
          };

          const response = await ListBacklog(PayloadList, tokenData);
          
          if (response?.statusCode === RES_CODE_OK) {
            const backlogs = response.data as BacklogDataResponse[];
            setDataBacklogs(backlogs);
          }
        } catch (error) {
          console.error("Error fetching backlogs:", error);
        }
      };

      fetchBacklogs();
    }
  }, [DataAuth, DataProject, tokenData]);

  // Fetch Project Tasks (by projectId only)
  useEffect(() => {
    if (DataAuth && projectId && tokenData) {
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
            ],
            fieldOrder: ["indexTask"],
            orderDir: "asc",
          };

          const response = await ListTasksPaged(PayloadList, tokenData);
          
          if (response?.statusCode === RES_CODE_OK) {
            const tasks = response.data as TaskViewModel[];
            setDataTasks(tasks);
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
  }, [DataAuth, projectId, tokenData, RefreshData]);

  // Handle Task Drop with dynamic board loading from task's backlog
  const handleTaskDrop = async (taskId: string, targetBoardName: string) => {
    try {
      setIsLoadingProcess(true);
      
      // 1. Find the task being moved
      const taskToMove = DataTasks.find(task => task.id === taskId);
      if (!taskToMove) {
        showToast({
          description: "Task not found",
          statusToast: "error",
        });
        return;
      }

      console.log("Moving task:", taskToMove.taskName, "to board:", targetBoardName);
      console.log("Task backlogId:", taskToMove.backlogId);

      // 2. Load task boards from the task's backlog using v1/Task/list-task-board
      const taskBoardResponse = await ListTasksBoard(taskToMove.backlogId!, tokenData);
      
      if (taskBoardResponse?.statusCode !== RES_CODE_OK) {
        showToast({
          description: "Failed to load task board configuration from backlog",
          statusToast: "error",
        });
        return;
      }

      // The API returns boards directly in data array, not { boards: [], tasks: [] }
      const taskBoards = taskBoardResponse.data as TaskBoardViewModel[];

      console.log("Loaded task boards from backlog:", taskBoards.map(b => b.boardName));

      // 3. Find target board by matching boardName in the task's backlog boards
      const targetBoard = taskBoards.find(board => board.boardName === targetBoardName);
      if (!targetBoard) {
        console.error("Available boards:", taskBoards.map(b => b.boardName));
        console.error("Looking for board:", targetBoardName);
        showToast({
          description: `Target board "${targetBoardName}" not found in task's backlog configuration`,
          statusToast: "error",
        });
        return;
      }

      console.log("Found target board:", targetBoard);

      // 4. Calculate new index for the task
      const tasksInTargetBoard = DataTasks.filter(task => 
        task.boardName === targetBoardName && task.backlogId === taskToMove.backlogId
      );
      const newIndex = tasksInTargetBoard.length > 0 
        ? Math.max(...tasksInTargetBoard.map(t => t.indexTask)) + 10 
        : 10;

      // 5. Update task with target board data from backlog task board
      const payload: TaskMovePayload = {
        id: taskId,
        boardId: targetBoard.id,                        // ✅ From backlog task board
        indexTask: newIndex,
        indexStage: targetBoard.indexStage,
      };

      console.log("Move task payload:", payload);

      const response = await MoveTask(payload, tokenData);
      
      if (response?.statusCode === RES_CODE_OK) {
        // Set recently moved task for visual feedback
        setRecentlyMovedTaskId(taskId);
        
        // Clear the highlight after 2 seconds
        setTimeout(() => {
          setRecentlyMovedTaskId(null);
        }, 2000);

        setRefreshData(prev => prev + 1);
        showToast({
          description: `Task moved to ${targetBoard.boardName}`,
          statusToast: "success",
        });
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
      setIsLoadingProcess(false);
    }
  };

  // Handle Add Task
  const handleAddTask = (boardId: string) => {
    // Find the target board to get its name
    const targetBoard = DataBoard.find(board => board.id === boardId);
    
    setSelectedTask(null);
    setSelectedBoardId(boardId);
    setTaskForm({
      taskName: "",
      taskDesc: "",
      taskPriority: "MEDIUM",
      taskStartDate: "",
      taskEndDate: "",
      boardName: targetBoard?.boardName || "", // Include boardName in form
      backlogId: "",
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
  const handleUpdateTask = async (taskId: string, updates: Partial<TaskViewModel>) => {
    try {
      setIsAutoSaving(true);
      
      const task = DataTasks.find(t => t.id === taskId);
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
        percentageStatus: updates.percentageStatus || task.percentageStatus || 0,
      };

      const response = await UpdateTask(payload, tokenData);
      
      if (response?.statusCode === RES_CODE_OK) {
        // Update local state immediately for better UX
        setDataTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
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
        setRefreshData(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast({
        description: "An error occurred while updating task",
        statusToast: "error",
      });
      // Refresh to get correct data
      setRefreshData(prev => prev + 1);
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
          setRefreshData(prev => prev + 1);
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
        const targetBoard = DataBoard.find(board => board.id === selectedBoardId);
        
        const payload: CreateSimpleTaskPayload = {
          taskName: taskForm.taskName,
          boardId: selectedBoardId,
          projectId: projectId!,
          backlogId: taskForm.backlogId,
        };

        const response = await CreateSimpleTask(payload, tokenData);
        
        if (response?.statusCode === RES_CODE_OK) {
          setRefreshData(prev => prev + 1);
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

  // Get tasks for specific board with filtering
  const getTasksForBoard = (boardName: string) => {
    // Filter tasks by boardName from master board
    let filteredTasks = DataTasks.filter(task => task.boardName === boardName);

    // Apply search filter
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.taskDesc && task.taskDesc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (filterPriority) {
      filteredTasks = filteredTasks.filter(task => task.taskPriority === filterPriority);
    }

    // Apply backlog filter
    if (filterBacklog) {
      filteredTasks = filteredTasks.filter(task => task.backlogId === filterBacklog);
    }

    // Apply completed tasks filter
    if (!showCompletedTasks) {
      filteredTasks = filteredTasks.filter(task => task.percentageStatus < 100);
    }

    return filteredTasks.sort((a, b) => a.indexTask - b.indexTask);
  };

  // Get project statistics
  const getProjectStats = () => {
    const totalTasks = DataTasks.length;
    const completedTasks = DataTasks.filter(task => task.percentageStatus === 100).length;
    const inProgressTasks = DataTasks.filter(task => task.percentageStatus > 0 && task.percentageStatus < 100).length;
    const todoTasks = DataTasks.filter(task => task.percentageStatus === 0).length;
    
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionPercentage,
    };
  };

  const projectStats = getProjectStats();

  if (!projectId) {
    return (
      <LayoutAdmin>
        <Alert status="error" rounded={radiusStyle}>
          <AlertIcon />
          <AlertTitle>Missing Project ID!</AlertTitle>
          <AlertDescription>
            Please provide a valid project ID in the URL parameters.
          </AlertDescription>
        </Alert>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <DndProvider backend={HTML5Backend}>
        <Box p={6}>
          {/* Header with Project Info and Controls */}
          <Card
            shadow="xl"
            rounded={radiusStyle}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            mb={6}
            overflow="hidden"
          >
            {/* Gradient Header */}
            <Box
              bgGradient="linear(135deg, blue.500, purple.600, pink.500)"
              p={6}
              color="white"
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={4}>
                  <Link href={`/project-development/development?projectId=${projectId}`}>
                    <IconButton
                      aria-label="Back to project"
                      icon={<FiArrowLeft />}
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                    />
                  </Link>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color="white">
                      Project Kanban Board
                    </Heading>
                    {DataProject && (
                      <Text color="whiteAlpha.900" fontSize="sm">
                        {DataProject.projectName}
                      </Text>
                    )}
                  </VStack>
                </HStack>

                <HStack spacing={3}>
                  {/* Project Stats */}
                  <HStack spacing={4} color="whiteAlpha.900" fontSize="sm">
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">{projectStats.totalTasks}</Text>
                      <Text fontSize="xs">Total</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">{projectStats.completedTasks}</Text>
                      <Text fontSize="xs">Done</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">{projectStats.completionPercentage}%</Text>
                      <Text fontSize="xs">Complete</Text>
                    </VStack>
                  </HStack>

                  <Button
                    leftIcon={<FiRefreshCcw />}
                    variant="outline"
                    size="sm"
                    onClick={() => setRefreshData(prev => prev + 1)}
                    isLoading={IsLoadingProcess}
                    color="white"
                    borderColor="whiteAlpha.300"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>
            </Box>

            {/* Filters and Search */}
            <CardBody p={6}>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FiSearch color={colorMode === "light" ? "gray.400" : "gray.500"} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                  />
                </InputGroup>

                <Select
                  placeholder="All Priorities"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  maxW="150px"
                  bg={colorMode === "light" ? "white" : "gray.700"}
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </Select>

                <Select
                  placeholder="All Backlogs"
                  value={filterBacklog}
                  onChange={(e) => setFilterBacklog(e.target.value)}
                  maxW="200px"
                  bg={colorMode === "light" ? "white" : "gray.700"}
                >
                  {DataBacklogs.map((backlog) => (
                    <option key={backlog.id} value={backlog.id}>
                      {backlog.backlogName}
                    </option>
                  ))}
                </Select>

                <Checkbox
                  isChecked={showCompletedTasks}
                  onChange={(e) => setShowCompletedTasks(e.target.checked)}
                  colorScheme="blue"
                >
                  Show completed tasks
                </Checkbox>

                <Button
                  leftIcon={<FiPlusCircle />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleAddTask(DataBoard[0]?.id || "")}
                  isDisabled={DataBoard.length === 0}
                >
                  Add Task
                </Button>
              </HStack>
            </CardBody>
          </Card>

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
              <Text mt={4} color={colorMode === "light" ? "gray.500" : "gray.400"}>
                Loading kanban board...
              </Text>
            </Box>
          ) : DataBoard.length > 0 ? (
            <Grid
              templateColumns={`repeat(${DataBoard.length}, 1fr)`}
              gap={6}
              minH="600px"
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
                    onRefreshTasks={() => setRefreshData(prev => prev + 1)}
                    recentlyMovedTaskId={recentlyMovedTaskId}
                    DataProject={DataProject}
                    DataBacklogs={DataBacklogs}
                  />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Alert status="info" rounded={radiusStyle}>
              <AlertIcon />
              <AlertTitle>No Kanban Board Configuration Found!</AlertTitle>
              <AlertDescription>
                Please configure the master board tasks in the system settings to use the kanban board.
              </AlertDescription>
            </Alert>
          )}

          {/* Comprehensive Task Modal */}
          <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose} size="lg">
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
              <ModalHeader color={colorMode === "light" ? "gray.800" : "white"}>
                {selectedTask ? "Edit Task" : "Create New Task"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <Box w="full">
                    <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                      Task Name *
                    </Text>
                    <Input
                      value={taskForm.taskName}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, taskName: e.target.value }))}
                      placeholder="Enter task name"
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                    />
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                      Description
                    </Text>
                    <Textarea
                      value={taskForm.taskDesc}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, taskDesc: e.target.value }))}
                      placeholder="Enter task description"
                      rows={3}
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                    />
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                      Priority
                    </Text>
                    <Select
                      value={taskForm.taskPriority}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, taskPriority: e.target.value }))}
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </Select>
                  </Box>

                  {!selectedTask && (
                    <Box w="full">
                      <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                        Backlog *
                      </Text>
                      <Select
                        value={taskForm.backlogId}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, backlogId: e.target.value }))}
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
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

                  <HStack spacing={4} w="full">
                    <Box flex={1}>
                      <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                        Start Date
                      </Text>
                      <Input
                        type="datetime-local"
                        value={taskForm.taskStartDate}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, taskStartDate: e.target.value }))}
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                      />
                    </Box>

                    <Box flex={1}>
                      <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                        Due Date
                      </Text>
                      <Input
                        type="datetime-local"
                        value={taskForm.taskEndDate}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, taskEndDate: e.target.value }))}
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                      />
                    </Box>
                  </HStack>
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
        </Box>
      </DndProvider>
    </LayoutAdmin>
  );
}

export default ProjectKanbanView;
