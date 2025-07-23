"use client";

import React from "react";
import { HorizontalFadeDivider } from "@/app/components/divider";
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
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  TASK_BOARD_STATUS_CODE_DONE,
  TASK_BOARD_STATUS_CODE_INPROGRESS,
  TASK_BOARD_STATUS_CODE_REVIEW,
  TASK_BOARD_STATUS_CODE_TODO,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  convertToCustomDateFormat,
  generateUUIDV1,
  truncateText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
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
} from "@/app/services/useTasks";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
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
  InputGroup,
  InputRightElement,
  Icon,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  CalendarIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { setIn } from "formik";
import { u } from "framer-motion/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaCog, FaArchive } from "react-icons/fa";
import {
  FaCommentDots,
  FaEllipsisVertical,
  FaGripVertical,
  FaPlus,
} from "react-icons/fa6";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiList,
  FiLoader,
  FiNavigation,
} from "react-icons/fi";
import { LuGrip } from "react-icons/lu";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { UserShortResponse } from "@/app/services/useUsers";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Kanban",
  breadCrumb: ["Home", "Kanban"],
};

// Define item types for drag and drop
const ItemTypes = {
  TASK: "task",
};

// Define custom window interface to add our global variables
declare global {
  interface Window {
    kanbanBoards?: TaskBoardViewModel[];
    refreshKanbanData?: () => void;
    moveTaskFunction?: (
      taskId: string,
      boardId: string,
      index?: number
    ) => Promise<boolean>;
  }
}

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
  // Local state for dates (not saved until user clicks Save)
  const [startDate, setStartDate] = useState<string | null>(
    initialStartDate || null
  );
  const [endDate, setEndDate] = useState<string | null>(initialEndDate || null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset local state when initialDates change (e.g., when task changes)
  useEffect(() => {
    setStartDate(initialStartDate || null);
    setEndDate(initialEndDate || null);
  }, [initialStartDate, initialEndDate, taskId]);

  // Handle saving dates
  const handleSave = () => {
    setIsSaving(true);
    onSave(startDate, endDate);
    setIsSaving(false);

    // Close the popover
    document.body.click();
  };

  // Format date for input
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
          colorScheme="blue"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save
        </Button>
      </HStack>
    </VStack>
  );
};

// TaskItemRow component for displaying and editing task items
interface TaskItemRowProps {
  item: TaskItemResponse;
  onToggle: (id: string, isDone: string) => void;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const TaskItemRow: React.FC<TaskItemRowProps> = ({
  item,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.taskItemName);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editedName.trim() !== item.taskItemName) {
      onEdit(item.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      setEditedName(item.taskItemName);
      setIsEditing(false);
    }
  };

  return (
    <Flex
      w="full"
      alignItems="center"
      py={1}
      px={1}
      borderRadius="md"
      _hover={{ bg: "gray.50" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      position="relative"
    >
      <Checkbox
        isChecked={item.isDone === "Y"}
        onChange={() => onToggle(item.id, item.isDone === "Y" ? "N" : "Y")}
        colorScheme="blue"
        mr={2}
      />

      {isEditing ? (
        <Input
          ref={inputRef}
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={handleKeyDown}
          size="sm"
          autoFocus
          flex="1"
        />
      ) : (
        <Text
          as={item.isDone === "Y" ? "s" : "span"}
          color={item.isDone === "Y" ? "gray.500" : "inherit"}
          flex="1"
          onClick={handleEditStart}
          cursor="pointer"
        >
          {item.taskItemName}
        </Text>
      )}

      {isHovered && !isEditing && (
        <HStack spacing={1} position="absolute" right={1}>
          <IconButton
            aria-label="Edit task item"
            icon={<EditIcon />}
            size="xs"
            variant="ghost"
            onClick={handleEditStart}
          />
          <IconButton
            aria-label="Delete task item"
            icon={<DeleteIcon />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(item.id)}
          />
        </HStack>
      )}
    </Flex>
  );
};

// Define interfaces for drag and drop components
interface DraggableTaskCardProps {
  task: TaskViewModel;
  onMoveTask: (taskId: string, boardId: string) => void;
  onPositionedMove?: (taskId: string, boardId: string, index: number) => void;
  isRecentlyMoved?: boolean;
}

interface DroppableTaskItem {
  id: string;
  boardId: string;
}

interface DroppableBoardProps {
  board: TaskBoardViewModel;
  tasks: TaskViewModel[];
  onMoveTask: (taskId: string, boardId: string) => void;
  onPositionedMove?: (taskId: string, boardId: string, index: number) => void;
  setDropPreview?: React.Dispatch<
    React.SetStateAction<{
      boardId: string;
      beforeTaskId: string | null;
      afterTaskId: string | null;
    } | null>
  >;
  children: React.ReactNode;
}

interface AddTaskProps {
  boardId: string;
  projectId: string;
  backlogId: string;
  onTaskAdded: () => void;
}

// Interface for attachments
interface AttachmentProps {
  id: string;
  name: string;
  src: string;
  alt: string;
  extension?: string;
  size?: string;
}

// Interface for comments
interface TaskCommentProps {
  id: string;
  text: string;
  date: string;
  user: TaskCommentUserProps;
  attachment: AttachmentProps[];
}

interface TaskCommentUserProps {
  id: string;
  name: string;
  avatar?: string | null;
}

// Image Preview Component
const ImagePreview = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      w={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      h={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border="1px solid"
      borderColor="gray.300"
      onClick={() => ImageModalDisc.onOpen()}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      <Image
        rounded={radiusStyle}
        src={src}
        w={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        h={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        objectFit="cover"
        alt={alt}
      />
      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Preview
        </Text>
      </Box>

      {/* Modal for image preview */}
      <Modal
        isOpen={ImageModalDisc.isOpen}
        onClose={ImageModalDisc.onClose}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          maxW="90vw"
          maxH="90vh"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          boxShadow="lg"
        >
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            <Box
              w="full"
              h="80vh"
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="contain"
              backgroundImage={`url(${src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Image Add More Component
const ImageAddMore = () => {
  const AddImageModalDisc = useDisclosure();
  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      boxSize={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border="1px solid"
      borderColor="gray.300"
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      {/* Add Image Placeholder */}
      <Box
        rounded={radiusStyle}
        boxSize={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.100"
        border="2px dashed"
        color="primary.300"
      >
        <FaPlus size={50} />
      </Box>

      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
        onClick={AddImageModalDisc.onOpen}
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Add New
        </Text>
      </Box>

      {/* Modal for adding images */}
      <Modal
        isOpen={AddImageModalDisc.isOpen}
        onClose={AddImageModalDisc.onClose}
        isCentered
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent rounded={radiusStyle} boxShadow="lg">
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <Box
              border="2px dashed"
              borderColor="gray.300"
              borderRadius={radiusStyle}
              p={10}
              textAlign="center"
            >
              <VStack spacing={4}>
                <FaPlus size={30} color="gray" />
                <Text>Drag files here or click to upload</Text>
                <Button size="sm" colorScheme="blue">
                  Select Files
                </Button>
              </VStack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Task Comment Component
const TaskComment = ({ dataComments }: { dataComments: TaskCommentProps }) => {
  const limitText: number = 100;
  const [limitTextState, setlimitTextState] = useState<number>(limitText);

  const handleShowMore = () => {
    if (dataComments.text.length > limitTextState) {
      setlimitTextState(dataComments.text.length);
    } else {
      setlimitTextState(limitText);
    }
  };

  return (
    <Flex
      w="full"
      justifyContent="start"
      alignItems="start"
      as={HStack}
      spacing={2}
      p={2}
    >
      <Avatar
        size="md"
        name={dataComments.user.name}
        src={dataComments.user.avatar || undefined}
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
              {dataComments.user.name}
            </Text>
            <Text fontSize={12} color="gray.500" alignSelf="center">
              {dataComments.date}
            </Text>
          </Flex>
          <Button size="sm" variant="ghost">
            <FaEllipsisVertical />
          </Button>
        </Flex>
        <Text as="p" fontSize={15}>
          {truncateText(dataComments.text, limitTextState)}
        </Text>
        {limitText < dataComments.text.length && (
          <Button
            size="sm"
            variant="link"
            colorScheme="primary"
            onClick={() => handleShowMore()}
          >
            {dataComments.text.length === limitTextState
              ? "Hide Less"
              : "Show More"}
          </Button>
        )}
        {dataComments.attachment.length > 0 && (
          <Wrap spacing={2} pt={2}>
            {dataComments.attachment.map((attc, index) => (
              <WrapItem key={index}>
                <ImagePreview {...attc} />
              </WrapItem>
            ))}
          </Wrap>
        )}
      </Flex>
    </Flex>
  );
};

// Drop Preview Indicator Component
const DropPreviewIndicator = () => {
  return (
    <Box
      className="drop-preview"
      h="4px"
      bg="blue.500"
      w="100%"
      borderRadius="full"
      my={1}
      boxShadow="0 0 8px rgba(66, 153, 225, 0.6)"
      animation="pulse 1.5s infinite"
      sx={{
        "@keyframes pulse": {
          "0%": {
            opacity: 0.6,
            transform: "scaleY(1)",
          },
          "50%": {
            opacity: 1,
            transform: "scaleY(1.5)",
          },
          "100%": {
            opacity: 0.6,
            transform: "scaleY(1)",
          },
        },
      }}
    />
  );
};

// Add Task Component
const AddTaskForm: React.FC<AddTaskProps> = ({
  boardId,
  projectId,
  backlogId,
  onTaskAdded,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { CreateSimpleTask } = useTasks();
  const showToast = useToastHelper();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setIsAdding(true);
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTaskName("");
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("tokenData") as string;
      const payload: CreateSimpleTaskPayload = {
        backlogId: backlogId,
        projectId: projectId,
        boardId: boardId,
        taskName: taskName.trim(),
      };

      const response = await CreateSimpleTask(payload, token);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task created successfully",
          statusToast: "success",
        });
        setTaskName("");
        setIsAdding(false);
        if (onTaskAdded) onTaskAdded();
      } else {
        showToast({
          description: response?.message || "Failed to create task",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while creating the task",
        statusToast: "error",
      });
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <Button
        leftIcon={<FaPlus />}
        variant="ghost"
        size="sm"
        justifyContent="flex-start"
        onClick={handleAddClick}
        width="full"
      >
        Add task
      </Button>
    );
  }

  return (
    <Card size="sm" variant="outline" boxShadow="sm" mb={2}>
      <CardBody p={3}>
        <VStack spacing={3} align="stretch">
          <Input
            ref={inputRef}
            placeholder="Enter task name..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            size="sm"
          />
          <HStack spacing={2} justify="flex-end">
            <Button size="xs" onClick={handleCancel} variant="ghost">
              Cancel
            </Button>
            <Button
              size="xs"
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!taskName.trim()}
            >
              Add
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Draggable Task Card Component
function DraggableTaskCard({
  task,
  onMoveTask,
  isRecentlyMoved = false,
}: DraggableTaskCardProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<
    DroppableTaskItem,
    unknown,
    { isDragging: boolean }
  >({
    type: ItemTypes.TASK,
    item: { id: task.id, boardId: task.boardId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Add state and handlers for the detail modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detailedTask, setDetailedTask] = useState<TaskViewModel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [newTaskItemName, setNewTaskItemName] = useState("");
  const [isAddingTaskItem, setIsAddingTaskItem] = useState(false);
  const [taskItems, setTaskItems] = useState<TaskItemResponse[]>([]);
  const [isLoadingTaskItems, setIsLoadingTaskItems] = useState(false);
  const showToast = useToastHelper();
  const {
    GetTaskDetail,
    UpdateTask,
    CreateTaskItem,
    UpdateTaskItem,
    DeleteTaskItem,
    ListTaskItems,
    ArchiveTask,
  } = useTasks();

  // States for inline editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("tokenData") as string;

  const sampleAttachments = [
    {
      id: generateUUIDV1(),
      name: "Design mockup",
      src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      alt: "Design mockup",
      extension: "jpg",
      size: "1.2MB",
    },
    {
      id: generateUUIDV1(),
      name: "Requirements doc",
      src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12",
      alt: "Requirements doc",
      extension: "jpg",
      size: "0.8MB",
    },
  ];

  const sampleComments = [
    {
      id: generateUUIDV1(),
      text: "I've started working on this. Will update the progress soon.",
      date: new Date().toLocaleString(),
      user: {
        id: generateUUIDV1(),
        name: "John Developer",
        avatar: null,
      },
      attachment: [],
    },
    {
      id: generateUUIDV1(),
      text: "Please make sure to follow the design guidelines we discussed in the meeting.",
      date: new Date(Date.now() - 86400000).toLocaleString(), // 1 day ago
      user: {
        id: generateUUIDV1(),
        name: "Sarah Designer",
        avatar: null,
      },
      attachment: sampleAttachments.slice(0, 1),
    },
  ];

  // Handle starting to edit task name
  const handleEditName = () => {
    if (detailedTask) {
      setEditedName(detailedTask.taskName);
      setIsEditingName(true);
      // Focus the input after state update
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 0);
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

        // Calculate progress percentage based on loaded task items
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

  // Handle starting to edit task description
  const handleEditDesc = () => {
    if (detailedTask) {
      setEditedDesc(detailedTask.taskDesc || "");
      setIsEditingDesc(true);
      // Focus the textarea after state update
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
      // Create update payload
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: editedName.trim(),
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      // Add optional fields if they exist
      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setDetailedTask({
          ...detailedTask,
          taskName: editedName.trim(),
        });
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
      // Create update payload
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: editedDesc,
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      // Add optional fields if they exist
      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setDetailedTask({
          ...detailedTask,
          taskDesc: editedDesc,
        });
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

  // Handle toggling task item completion status
  const handleToggleTaskItem = async (itemId: string, newStatus: string) => {
    if (!detailedTask) return;

    try {
      // Find the task item to update
      const taskItem = taskItems.find((item) => item.id === itemId);
      if (!taskItem) return;

      // Create update payload
      const updatePayload: TaskItemUpdatePayload = {
        id: itemId,
        taskItemName: taskItem.taskItemName,
        isDone: newStatus,
      };

      const response = await UpdateTaskItem(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setTaskItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.id === itemId ? { ...item, isDone: newStatus } : item
          );

          // Calculate new progress percentage
          updateTaskProgress(updatedItems);

          return updatedItems;
        });

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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
      // Create new task item payload
      const createPayload: TaskItemCreatePayload = {
        taskId: detailedTask.id,
        taskItemName: newTaskItemName.trim(),
      };

      const response = await CreateTaskItem(createPayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Clear input
        setNewTaskItemName("");

        // Refresh task items from API to get the complete item with ID
        fetchTaskItems(detailedTask.id);

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }

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
      // Call the delete API
      const response = await DeleteTaskItem(itemId, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setTaskItems((prevItems) => {
          const updatedItems = prevItems.filter((item) => item.id !== itemId);

          // Calculate new progress percentage
          updateTaskProgress(updatedItems);

          return updatedItems;
        });

        showToast({
          description: "Task item deleted successfully",
          statusToast: "success",
        });

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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
      // Find the task item to update
      const taskItem = taskItems.find((item) => item.id === itemId);
      if (!taskItem) return;

      // Create update payload
      const updatePayload: TaskItemUpdatePayload = {
        id: itemId,
        taskItemName: newName.trim(),
        isDone: taskItem.isDone,
      };

      const response = await UpdateTaskItem(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
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

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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

  // Handle updating task dates
  const updateTaskDates = async (
    startDate: string | null | undefined,
    endDate: string | null | undefined
  ) => {
    if (!detailedTask) return;

    // Convert undefined to null
    const normalizedStartDate = startDate === undefined ? null : startDate;
    const normalizedEndDate = endDate === undefined ? null : endDate;

    // If dates are the same as current, no need to update
    if (
      normalizedStartDate === detailedTask.startDate &&
      normalizedEndDate === detailedTask.endDate
    ) {
      return;
    }

    setIsLoadingDetails(true);
    try {
      // Create update payload
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: detailedTask.taskPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      // Add dates to payload only if they are not null
      if (normalizedStartDate) updatePayload.startDate = normalizedStartDate;
      if (normalizedEndDate) updatePayload.endDate = normalizedEndDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setDetailedTask({
          ...detailedTask,
          startDate: normalizedStartDate,
          endDate: normalizedEndDate,
        });

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }

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

  // Handle key press events for inline editing
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  // Handle archiving a task
  const handleArchiveTask = async (taskId: string) => {
    if (!taskId) return;

    setIsArchiving(true);

    try {
      // Create archive payload
      const archivePayload: TaskArchivePayload = {
        taskId: taskId,
      };

      const response = await ArchiveTask(archivePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task archived successfully",
          statusToast: "success",
        });

        // Close the modal
        onClose();

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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

  // Calculate and update task progress based on completed task items
  const updateTaskProgress = async (items: TaskItemResponse[]) => {
    if (!detailedTask || items.length === 0) return;

    // Calculate percentage of completed items
    const totalItems = items.length;
    const completedItems = items.filter((item) => item.isDone === "Y").length;
    const progressPercentage = Math.round((completedItems / totalItems) * 100);

    // Only update if the percentage has changed
    if (progressPercentage === detailedTask.percentageStatus) return;

    try {
      // Create update payload
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

      // Add optional fields if they exist
      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
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

  // Handle updating task priority
  const handleUpdatePriority = async (newPriority: string) => {
    if (!detailedTask) return;

    // If priority is the same, no need to update
    if (newPriority === detailedTask.taskPriority) return;

    setIsLoadingDetails(true);

    try {
      // Create update payload
      const updatePayload: TaskUpdatePayload = {
        id: detailedTask.id,
        boardId: detailedTask.boardId,
        taskName: detailedTask.taskName,
        taskDesc: detailedTask.taskDesc || "",
        taskPriority: newPriority,
        indexTask: detailedTask.indexTask,
        taskPoint: detailedTask.taskPoint,
      };

      // Add optional fields if they exist
      if (detailedTask.startDate)
        updatePayload.startDate = detailedTask.startDate;
      if (detailedTask.endDate) updatePayload.endDate = detailedTask.endDate;

      const response = await UpdateTask(updatePayload, getToken());

      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setDetailedTask({
          ...detailedTask,
          taskPriority: newPriority,
        });

        showToast({
          description: "Task priority updated successfully",
          statusToast: "success",
        });

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
      } else {
        showToast({
          description: response?.message || "Failed to update task priority",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
      showToast({
        description: "An error occurred while updating task priority",
        statusToast: "error",
      });
    } finally {
      setIsLoadingDetails(false);
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

  // Handle click on the card
  const handleCardClick = async (e: React.MouseEvent) => {
    // Prevent click from triggering during drag operations
    if (!isDragging) {
      setIsLoadingDetails(true);
      try {
        // Fetch the latest task details
        const response = await GetTaskDetail(task.id, getToken());

        if (response?.statusCode === RES_CODE_OK && response.data) {
          setDetailedTask(response.data);

          // Fetch task items
          fetchTaskItems(task.id);
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

  return (
    <>
      <div
        ref={dragRef}
        className="task-card"
        data-task-id={task.id}
        data-index={task.indexTask}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}
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

              <Text
                fontSize={"smaller"}
                lineHeight={0.9}
                color={"gray"}
                fontWeight={600}
              >
                Last Update
                <Text fontWeight={500} lineHeight={1.4}>
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

              {/* Task assignees (if available) */}
              {task.assignUsers && task.assignUsers.length > 0 && (
                <AvatarGroup size="xs" max={3}>
                  {task.assignUsers.map((user: UserShortResponse) => (
                    <Avatar
                      key={user.id}
                      name={user.nama}
                      src={user.profilePict || undefined}
                    />
                  ))}
                </AvatarGroup>
              )}
            </VStack>
          </CardBody>
        </Card>
      </div>

      {/* Task Detail Modal */}
      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
        size="5xl"
      >
        <ModalOverlay />
        <ModalContent rounded={radiusStyle} py={4} m={2}>
          <ModalCloseButton />
          {detailedTask && (
            <Box
              width="full"
              px={6}
              pt={2}
              pb={4}
              borderBottomWidth="1px"
              borderColor="gray.200"
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
                rounded={radiusStyle}
                px={2}
                py={1}
                fontSize="sm"
              >
                {detailedTask.taskPriority} PRIORITY
              </Badge>
            </Box>
          )}
          <ModalBody>
            {isLoadingDetails ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" />
              </Flex>
            ) : detailedTask ? (
              <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">
                <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}>
                  <Flex
                    w="full"
                    as={VStack}
                    spacing={4}
                    justifyContent="start"
                    alignItems="start"
                  >
                    <Flex
                      w="full"
                      as={VStack}
                      alignItems="start"
                      justifyContent="start"
                      spacing={2}
                    >
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

                      <Text fontSize="sm" color="gray.500">
                        {detailedTask.taskCode}
                      </Text>
                    </Flex>

                    {/* Date Range Picker */}
                    <Box mt={2} mb={3}>
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
                        <PopoverContent p={4} width="300px">
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
                    </Box>

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
                        color="gray.500"
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
                            <TaskItemRow
                              key={item.id}
                              item={item}
                              onToggle={handleToggleTaskItem}
                              onEdit={handleEditTaskItem}
                              onDelete={handleDeleteTaskItem}
                            />
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
                      <Box px={4} w="full" mt={2}>
                        <form onSubmit={handleAddTaskItem}>
                          <InputGroup size="sm">
                            <Input
                              placeholder="Add a new subtask..."
                              value={newTaskItemName}
                              onChange={(e) =>
                                setNewTaskItemName(e.target.value)
                              }
                              pr="4.5rem"
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                h="1.75rem"
                                size="sm"
                                type="submit"
                                isDisabled={!newTaskItemName.trim()}
                                isLoading={isAddingTaskItem}
                              >
                                Add
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                        </form>
                      </Box>
                    </Box>

                    {/* Attachments */}
                    <Wrap spacing={2}>
                      {Array.isArray(sampleAttachments) &&
                        sampleAttachments.map((image, index) => (
                          <WrapItem key={index}>
                            <ImagePreview
                              id={image.id || `attachment-${index}`}
                              name={image.name}
                              alt={image.alt}
                              src={image.src}
                            />
                          </WrapItem>
                        ))}
                      <WrapItem>
                        <ImageAddMore />
                      </WrapItem>
                    </Wrap>

                    <HorizontalFadeDivider />

                    {/* Comments Section */}
                    <Flex
                      w="full"
                      justifyContent="start"
                      as={HStack}
                      spacing={2}
                      color="gray.500"
                    >
                      <FaCommentDots size={16} />
                      <Text fontWeight={600} fontSize={18}>
                        Comments ({sampleComments.length})
                      </Text>
                    </Flex>

                    {/* Add Comment */}
                    <Flex
                      w="full"
                      justifyContent="start"
                      as={HStack}
                      spacing={4}
                      color="gray.500"
                      p={2}
                    >
                      <Flex
                        justifyContent="center"
                        alignItems="center"
                        as={VStack}
                        spacing={2}
                      >
                        <Avatar
                          size="md"
                          name={detailedTask.userCreated?.nama || "User"}
                          src={
                            detailedTask.userCreated?.profilePict || undefined
                          }
                        />
                      </Flex>
                      <Textarea
                        placeholder="Add a comment"
                        rounded={radiusStyle}
                      />
                    </Flex>

                    {/* Comments */}
                    {sampleComments.map((comment, index) => (
                      <TaskComment key={index} dataComments={comment} />
                    ))}
                  </Flex>
                </GridItem>

                {/* Right Sidebar */}
                <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}>
                  <Flex
                    w="full"
                    as={VStack}
                    spacing={7}
                    justifyContent="start"
                    alignItems="start"
                    rounded={radiusStyle}
                    bgColor="primary.100"
                    boxShadow="lg"
                    minH="60vh"
                    p={5}
                    mt={5}
                  >
                    <Flex
                      w="full"
                      justifyContent="start"
                      as={HStack}
                      spacing={2}
                      color="gray.800"
                    >
                      <FaCog size={16} />
                      <Text fontWeight={600} fontSize={18}>
                        Task Details
                      </Text>
                    </Flex>

                    {/* Status with Board Selection using Menu */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Status
                      </Text>
                      <HStack>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            variant="outline"
                            width="full"
                            textAlign="left"
                            isLoading={isLoadingDetails}
                          >
                            {detailedTask?.boardName || "Select Board"}
                          </MenuButton>
                          <MenuList>
                            {(window.kanbanBoards || []).map((board) => (
                              <MenuItem
                                key={board.id}
                                isDisabled={board.id === detailedTask.boardId}
                                onClick={() => {
                                  const newBoardId = board.id;
                                  if (newBoardId === detailedTask.boardId)
                                    return;

                                  // Use local loading state
                                  setIsLoadingDetails(true);

                                  // Get boards from the parent component's context
                                  const boards = window.kanbanBoards || [];
                                  const targetBoard = boards.find(
                                    (b) => b.id === newBoardId
                                  );

                                  if (targetBoard) {
                                    // Use the global moveTaskFunction instead of directly calling MoveTask
                                    if (window.moveTaskFunction) {
                                      window
                                        .moveTaskFunction(
                                          detailedTask.id,
                                          newBoardId,
                                          0
                                        )
                                        .then((success) => {
                                          if (success) {
                                            // Update the detailed task with new board info
                                            setDetailedTask({
                                              ...detailedTask,
                                              boardId: newBoardId,
                                              boardName: targetBoard.boardName,
                                              boardIndexStage:
                                                targetBoard.indexStage,
                                              boardCodeStage:
                                                targetBoard.boardCodeStage,
                                            });

                                            // Notify the parent component to refresh data
                                            if (window.refreshKanbanData) {
                                              window.refreshKanbanData();
                                            }

                                            showToast({
                                              description: `Task moved to ${targetBoard.boardName}`,
                                              statusToast: "success",
                                            });
                                          } else {
                                            showToast({
                                              description:
                                                "Failed to move task",
                                              statusToast: "error",
                                            });
                                          }
                                        })
                                        .catch((error) => {
                                          console.error(
                                            "Error moving task:",
                                            error
                                          );
                                          showToast({
                                            description:
                                              "An error occurred while moving the task",
                                            statusToast: "error",
                                          });
                                        })
                                        .finally(() => {
                                          setIsLoadingDetails(false);
                                        });
                                    } else {
                                      showToast({
                                        description:
                                          "Move task function not available",
                                        statusToast: "error",
                                      });
                                      setIsLoadingDetails(false);
                                    }
                                  }
                                }}
                              >
                                {board.boardName}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                        {isLoadingDetails && <Spinner size="sm" ml={2} />}
                      </HStack>
                    </Box>

                    {/* Priority */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Priority
                      </Text>
                      <HStack>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            variant="outline"
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
                              rounded={radiusStyle}
                              px={2}
                              mr={2}
                            >
                              {detailedTask.taskPriority}
                            </Badge>
                          </MenuButton>
                          <MenuList>
                            <MenuItem
                              onClick={() => handleUpdatePriority("LOW")}
                              icon={<Badge colorScheme="green">LOW</Badge>}
                            >
                              Low Priority
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleUpdatePriority("MEDIUM")}
                              icon={<Badge colorScheme="orange">MEDIUM</Badge>}
                            >
                              Medium Priority
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleUpdatePriority("HIGH")}
                              icon={<Badge colorScheme="red">HIGH</Badge>}
                            >
                              High Priority
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleUpdatePriority("CRITICAL")}
                              icon={
                                <Badge colorScheme="purple">CRITICAL</Badge>
                              }
                            >
                              Critical Priority
                            </MenuItem>
                          </MenuList>
                        </Menu>
                        {isLoadingDetails && <Spinner size="sm" ml={2} />}
                      </HStack>
                    </Box>

                    {/* Assignees */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Assigned To
                      </Text>
                      {detailedTask.assignUsers &&
                      detailedTask.assignUsers.length > 0 ? (
                        <Wrap>
                          {detailedTask.assignUsers.map((user) => (
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

                    {/* Dates */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Timeline
                      </Text>
                      <VStack align="start" spacing={2}>
                        {detailedTask.startDate && (
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
                        )}
                        {detailedTask.endDate && (
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
                            w={`${detailedTask.percentageStatus}%`}
                            bg="blue.400"
                            borderRadius="full"
                          />
                        </Box>
                        <Text fontSize="xs" fontWeight="bold">
                          {detailedTask.percentageStatus}%
                        </Text>
                      </HStack>
                    </Box>

                    {/* Created Info */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Created By
                      </Text>
                      {detailedTask.userCreated ? (
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
                        {new Date(detailedTask.createdAt).toLocaleString()}
                      </Text>
                    </Box>

                    {/* Actions */}
                    <Box w="full" mt={4}>
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={"red"}
                        leftIcon={<Icon as={FaArchive} />}
                        onClick={() => handleArchiveTask(detailedTask.id)}
                        isLoading={isArchiving}
                      >
                        Archive Task
                      </Button>
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
    </>
  );
}

// Droppable Board Column Component
// Droppable Board Column Component
const DroppableBoard: React.FC<DroppableBoardProps> = ({
  board,
  tasks,
  onMoveTask,
  onPositionedMove,
  children,
  setDropPreview,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<
    DroppableTaskItem,
    unknown,
    { isOver: boolean }
  >({
    accept: ItemTypes.TASK,
    hover: (item, monitor) => {
      // Skip if it's the same board and we're not moving position
      if (!setDropPreview) return;

      // Get the client offset to determine hover position
      const clientOffset = monitor.getClientOffset();

      if (clientOffset && dropRef.current) {
        // Sort tasks by their current index (create a new array to avoid mutation)
        const boardTasks = [...tasks].sort(
          (a: TaskViewModel, b: TaskViewModel) => a.indexTask - b.indexTask
        );

        // Get all task card elements in this board
        const taskElements = Array.from(
          dropRef.current.querySelectorAll(".task-card")
        );

        // If there are no tasks in this board, show preview at the top
        if (taskElements.length === 0) {
          setDropPreview({
            boardId: board.id,
            beforeTaskId: null,
            afterTaskId: null,
          });
          return;
        }

        // Find where the task should be inserted based on cursor position
        let insertPosition = -1;

        for (let i = 0; i < taskElements.length; i++) {
          const taskElement = taskElements[i];
          const rect = taskElement.getBoundingClientRect();

          // If cursor is above the middle of this task, insert before it
          if (clientOffset.y < rect.top + rect.height / 2) {
            insertPosition = i;
            break;
          }
        }

        // Update the drop preview state
        if (insertPosition === -1) {
          // Dropping at the end
          setDropPreview({
            boardId: board.id,
            beforeTaskId: null,
            afterTaskId: boardTasks[boardTasks.length - 1]?.id || null,
          });
        } else if (insertPosition === 0) {
          // Dropping at the beginning
          setDropPreview({
            boardId: board.id,
            beforeTaskId: boardTasks[0]?.id || null,
            afterTaskId: null,
          });
        } else {
          // Dropping in the middle
          setDropPreview({
            boardId: board.id,
            beforeTaskId: boardTasks[insertPosition]?.id || null,
            afterTaskId: boardTasks[insertPosition - 1]?.id || null,
          });
        }
      }
    },
    drop: (item, monitor) => {
      // Clear the drop preview
      if (setDropPreview) {
        setDropPreview(null);
      }

      // Get the client offset to determine drop position
      const clientOffset = monitor.getClientOffset();

      if (clientOffset && dropRef.current && onPositionedMove) {
        // Sort tasks by their current index (create a new array to avoid mutation)
        const boardTasks = [...tasks].sort(
          (a: TaskViewModel, b: TaskViewModel) => a.indexTask - b.indexTask
        );

        // Get all task card elements in this board
        const taskElements = Array.from(
          dropRef.current.querySelectorAll(".task-card")
        );

        // If there are no tasks in this board, just add at index 0
        if (taskElements.length === 0) {
          console.log(`Dropping at beginning of empty board ${board.id}`);
          onPositionedMove(item.id, board.id, 0);
          return;
        }

        // Find where the task should be inserted based on cursor position
        let insertIndex = boardTasks.length; // Default to end
        let insertPosition = -1;

        for (let i = 0; i < taskElements.length; i++) {
          const taskElement = taskElements[i];
          const rect = taskElement.getBoundingClientRect();

          // If cursor is above the middle of this task, insert before it
          if (clientOffset.y < rect.top + rect.height / 2) {
            insertPosition = i;
            break;
          }
        }

        // Calculate the appropriate index value
        if (insertPosition === -1) {
          // Dropping at the end
          insertIndex =
            boardTasks.length > 0
              ? boardTasks[boardTasks.length - 1].indexTask + 10
              : 10;
          console.log(`Dropping at end, index: ${insertIndex}`);
        } else if (insertPosition === 0) {
          // Dropping at the beginning
          insertIndex =
            boardTasks[0]?.indexTask > 10
              ? Math.floor(boardTasks[0].indexTask / 2)
              : 0;
          console.log(`Dropping at beginning, index: ${insertIndex}`);
        } else {
          // Dropping in the middle - use the midpoint between tasks
          const prevIndex = boardTasks[insertPosition - 1].indexTask;
          const nextIndex = boardTasks[insertPosition].indexTask;
          insertIndex = Math.floor((prevIndex + nextIndex) / 2);
          console.log(
            `Dropping in middle, index: ${insertIndex} (between ${prevIndex} and ${nextIndex})`
          );
        }

        // Call the positioned move function with the calculated index
        console.log(
          `Calling onPositionedMove with taskId=${item.id}, boardId=${board.id}, index=${insertIndex}`
        );
        onPositionedMove(item.id, board.id, insertIndex);
      } else {
        // Fallback if we can't determine position or no positioned move handler
        onMoveTask(item.id, board.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Apply the drop ref to the div ref
  drop(dropRef);

  return (
    <Flex
      ref={dropRef}
      as={Stack}
      direction="column"
      spacing={4}
      width={"320px"}
      minWidth={"320px"}
      bg={"white"}
      rounded={radiusStyle}
      boxShadow={"md"}
      p={5}
      transition="all 0.3s ease"
      border={isOver ? "2px dashed blue" : "none"}
    >
      {children}
    </Flex>
  );
};

function KanbanBacklogPage() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  const { GetDetailById: GetDetailProjectById } = useProjects();
  const { GetDetailBacklogById } = useRequirements();
  const {
    ListTasksBoard,
    ListTasksBoardPaged,
    ListTasksPaged,
    CreateSimpleTask,
    MoveTask,
  } = useTasks();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Track recently moved task for visual feedback
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(
    null
  );

  // Track drop preview position for visual feedback during drag
  const [dropPreview, setDropPreview] = useState<{
    boardId: string;
    beforeTaskId: string | null;
    afterTaskId: string | null;
  } | null>(null);

  // Handle task creation - refresh data after task is created
  const handleTaskCreated = () => {
    // Trigger a refresh of the tasks
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [projectId, setProjectId] = useState<string | null>(null);
  const [backlogId, setBacklogId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const projId = searchParams.get("projectId");
    if (projId) {
      setProjectId(projId); // Set it to the state
    }

    const backId = searchParams.get("backlogId");
    if (backId) {
      setBacklogId(backId); // Set it to the state
    }
  }, [searchParams]);

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataBacklog, setDataBacklog] = useState<BacklogDataResponse | null>(
    null
  );
  const [DataBoard, setDataBoard] = useState<TaskBoardViewModel[]>([]);
  const [DataTasks, setDataTasks] = useState<TaskViewModel[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);

  // Handle moving a task to a different board (local state only)
  // Handle moving a task to a different board
  const handleMoveTaskInternal = async (
    taskId: string,
    newBoardId: string,
    newIndex?: number
  ): Promise<boolean> => {
    setIsLoadingProcess(true);

    try {
      // Find the task and target board
      const taskToMove = DataTasks.find((task) => task.id === taskId);
      const targetBoard = DataBoard.find((board) => board.id === newBoardId);

      if (taskToMove && targetBoard) {
        // Calculate the new index for the task in the target board
        // Get tasks in the target board and find the highest index
        const tasksInTargetBoard = DataTasks.filter(
          (task) => task.boardId === newBoardId
        ).sort((a, b) => a.indexTask - b.indexTask);

        let indexTask = 0;

        // If a specific index is provided, use it
        if (typeof newIndex === "number") {
          indexTask = newIndex;
          console.log(`Using provided index: ${indexTask}`);
        }
        // If no specific index is provided, add to the end
        else if (tasksInTargetBoard.length > 0) {
          const highestIndex = Math.max(
            ...tasksInTargetBoard.map((task) => task.indexTask)
          );
          indexTask = highestIndex + 10;
          console.log(`Calculated end index: ${indexTask}`);
        } else {
          indexTask = 10;
          console.log(`Using default index: ${indexTask}`);
        }

        console.log(
          `Moving task ${taskId} to board ${newBoardId} at index ${indexTask}`
        );

        // Get the board's indexStage value
        const indexStage = targetBoard.indexStage;
        console.log(`Board indexStage: ${indexStage}`);

        // Prepare the payload for the API call
        const moveTaskPayload: TaskMovePayload = {
          id: taskId,
          boardId: newBoardId,
          indexTask: indexTask,
          indexStage: indexStage, // Include the indexStage in the payload
        };

        console.log("Move task payload:", moveTaskPayload);

        // Call the API to update the task's board
        const response = await MoveTask(moveTaskPayload, tokenData);
        console.log("Move task response:", response);

        if (response?.statusCode === RES_CODE_OK) {
          // Update local state to reflect the change (optimistic UI update)
          setDataTasks((prevTasks) => {
            // First, update the moved task
            const updatedTasks = prevTasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  boardId: newBoardId,
                  boardName: targetBoard.boardName,
                  boardIndexStage: targetBoard.indexStage,
                  boardCodeStage: targetBoard.boardCodeStage,
                  indexTask: indexTask,
                };
              }
              return task;
            });

            return updatedTasks;
          });

          // Set recently moved task for visual feedback
          setRecentlyMovedTaskId(taskId);

          // Clear the highlight after 2 seconds
          setTimeout(() => {
            setRecentlyMovedTaskId(null);
          }, 2000);

          // Refresh data to ensure everything is in sync
          setRefreshData(RefreshData + 1);

          showToast({
            description: `Task moved to ${targetBoard.boardName}`,
            statusToast: "success",
          });

          return true;
        } else {
          showToast({
            description: response?.message || "Failed to move task",
            statusToast: "error",
          });
          return false;
        }
      }
    } catch (error) {
      showToast({
        description: "An error occurred while moving the task",
        statusToast: "error",
      });
      console.error("Error moving task:", error);
      return false;
    } finally {
      setIsLoadingProcess(false);
    }

    // If we reach here, it means the task or board wasn't found
    return false;
  };

  // Wrapper function with the original signature for backward compatibility
  const handleMoveTask = (taskId: string, newBoardId: string) => {
    // Get tasks in the target board
    const tasksInTargetBoard = DataTasks.filter(
      (task) => task.boardId === newBoardId
    ).sort((a, b) => a.indexTask - b.indexTask);

    // Calculate the new index (default to end of list)
    let indexTask = 0;
    if (tasksInTargetBoard.length > 0) {
      // Find the highest index and add 1
      const highestIndex = Math.max(
        ...tasksInTargetBoard.map((task) => task.indexTask)
      );
      indexTask = highestIndex + 1;
    }

    handleMoveTaskInternal(taskId, newBoardId, indexTask);
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId && backlogId) {
      setIsLoadingProcess(true);
      const GetDetailProject = async () => {
        const requestData = await GetDetailProjectById(projectId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
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
        }
      };
      const GetDetailBacklog = async () => {
        const requestData = await GetDetailBacklogById(backlogId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: BacklogDataResponse =
            requestData.data as BacklogDataResponse;

          setDataBacklog(itemsData);
          setIsLoadingProcess(false);
        }
      };
      const GetListTaskKanban = async () => {
        const requestTaskBoard = await ListTasksBoard(backlogId, tokenData);
        const isErrorResponse = requestTaskBoard?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestTaskBoard) {
          showToast({
            description: requestTaskBoard?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestTaskBoard);
          if (requestTaskBoard.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TaskBoardViewModel[] =
            requestTaskBoard.data as TaskBoardViewModel[];

          setDataBoard(itemsData);
          setIsLoadingProcess(false);
        }
      };
      const GetListTasks = async () => {
        // LOAD BACKLOGS DATA
        const PayloadGetTaskList: PaggingListPayload = {
          search: "",
          limit: MAX_SIZE_TABLE,
          page: 0,
          filterWhere: [
            {
              field: "backlogId",
              operator: "=",
              value: backlogId,
            },
            //isArchived
            {
              field: "isArchived",
              operator: "=",
              value: "N",
            },
          ],
          fieldOrder: ["indexTask"],
          orderDir: "asc",
        };
        const requestTaskBoard = await ListTasksPaged(
          PayloadGetTaskList,
          tokenData
        );
        const isErrorResponse = requestTaskBoard?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestTaskBoard) {
          showToast({
            description: requestTaskBoard?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestTaskBoard);
          if (requestTaskBoard.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TaskViewModel[] =
            requestTaskBoard.data as TaskViewModel[];

          // Log task positions for debugging
          console.log("Task positions:");
          itemsData.forEach((task) => {
            console.log(
              `Task ${task.taskName} (${task.id}): board=${task.boardId}, index=${task.indexTask}`
            );
          });

          setDataTasks(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDetailProject();
      GetDetailBacklog();
      GetListTaskKanban();
      GetListTasks();
    }
  }, [DataAuth, RefreshData, projectId, backlogId]);

  // Clear drop preview when dragging ends
  useEffect(() => {
    const handleDragEnd = () => {
      setDropPreview(null);
    };

    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  // Set up global variables for board data and refresh function
  useEffect(() => {
    // Make board data available to components that can't access it directly
    window.kanbanBoards = DataBoard;

    // Provide a refresh function for components to trigger data refresh
    window.refreshKanbanData = () => {
      setRefreshData(RefreshData + 1);
    };

    // Provide the move task function for components that need it
    window.moveTaskFunction = async (taskId, boardId, index) => {
      try {
        // Find the task and target board
        const taskToMove = DataTasks.find((task) => task.id === taskId);
        const targetBoard = DataBoard.find((board) => board.id === boardId);

        if (!taskToMove || !targetBoard) return false;

        // Calculate the index if not provided
        let indexTask = 0;
        if (typeof index === "number") {
          indexTask = index;
        } else {
          const tasksInTargetBoard = DataTasks.filter(
            (task) => task.boardId === boardId
          ).sort((a, b) => a.indexTask - b.indexTask);

          if (tasksInTargetBoard.length > 0) {
            const highestIndex = Math.max(
              ...tasksInTargetBoard.map((task) => task.indexTask)
            );
            indexTask = highestIndex + 10;
          } else {
            indexTask = 10;
          }
        }

        // Prepare the payload for the API call
        const moveTaskPayload = {
          id: taskId,
          boardId: boardId,
          indexTask: indexTask,
          indexStage: targetBoard.indexStage,
        };

        // Call the API to update the task's board
        const response = await MoveTask(moveTaskPayload, tokenData);

        if (response?.statusCode === RES_CODE_OK) {
          // Update local state to reflect the change
          setDataTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  boardId: boardId,
                  boardName: targetBoard.boardName,
                  boardIndexStage: targetBoard.indexStage,
                  boardCodeStage: targetBoard.boardCodeStage,
                  indexTask: indexTask,
                };
              }
              return task;
            });
          });

          // Set recently moved task for visual feedback
          setRecentlyMovedTaskId(taskId);

          // Clear the highlight after 2 seconds
          setTimeout(() => {
            setRecentlyMovedTaskId(null);
          }, 2000);

          return true;
        }

        return false;
      } catch (error) {
        console.error("Error moving task:", error);
        return false;
      }
    };

    return () => {
      // Clean up when component unmounts
      delete window.kanbanBoards;
      delete window.refreshKanbanData;
      delete window.moveTaskFunction;
    };
  }, [DataBoard, DataTasks, RefreshData]);

  useEffect(() => {
    setisLoading(true);
    delay(1000);

    setisLoading(false);
  }, [RefreshData]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {IsLoadingProcess && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="1000"
          justify="center"
          align="center"
        >
          <Spinner size="xl" color="white" />
        </Flex>
      )}

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
          <Flex
            w={"full"}
            as={Wrap}
            spacing={2}
            overflowX={"auto"}
            justifyContent={"start"}
          >
            <Link href={`/projects-manager/`}>
              <Button size={"lg"} leftIcon={<FiArrowLeft />}>
                Kembali
              </Button>
            </Link>
          </Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          <Flex
            as={Stack}
            w={"full"}
            justifyContent={"end"}
            alignItems={"center"}
            spacing={0}
          >
            <Text>Project Id : {projectId}</Text>
            <Text>Backlog Id : {backlogId}</Text>
          </Flex>
        </GridItem>
      </Grid>

      <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
        <DndProvider backend={HTML5Backend}>
          <Flex
            as={HStack}
            spacing={5}
            w={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            overflowX="auto"
            pb={4}
          >
            {DataBoard.length > 0
              ? DataBoard.map((board) => (
                  <DroppableBoard
                    key={board.id}
                    board={board}
                    tasks={DataTasks.filter(
                      (task) => task.boardId === board.id
                    )}
                    onMoveTask={handleMoveTask}
                    onPositionedMove={handleMoveTaskInternal}
                    setDropPreview={setDropPreview}
                  >
                    <Flex as={HStack} spacing={2}>
                      {board.boardName === "TO DO" ? (
                        <FiList size={"1.3em"} />
                      ) : board.boardName === "IN PROGRESS" ? (
                        <FiLoader size={"1.3em"} />
                      ) : board.boardName === "IN REVIEW" ? (
                        <FiNavigation size={"1.3em"} />
                      ) : board.boardName === "DONE" ? (
                        <FiCheckCircle size={"1.3em"} />
                      ) : (
                        ""
                      )}
                      <Badge
                        fontSize={"medium"}
                        fontWeight={600}
                        px={3}
                        rounded={"md"}
                        colorScheme={
                          board.boardName === "TO DO"
                            ? "gray"
                            : board.boardName === "IN PROGRESS"
                            ? "blue"
                            : board.boardName === "IN REVIEW"
                            ? "purple"
                            : board.boardName === "DONE"
                            ? "green"
                            : "gray"
                        }
                      >
                        {board.boardName}
                      </Badge>
                    </Flex>

                    {/* Task container */}
                    <VStack
                      spacing={3}
                      align="stretch"
                      minH="200px"
                      maxH="calc(75vh - 100px)"
                      overflowY="auto"
                      w="full"
                    >
                      {/* If this is the first task and we have a drop preview for this board at the beginning */}
                      {dropPreview &&
                        dropPreview.boardId === board.id &&
                        dropPreview.beforeTaskId ===
                          (DataTasks.filter((task) => task.boardId === board.id)
                            .length > 0
                            ? DataTasks.filter(
                                (task) => task.boardId === board.id
                              ).sort((a, b) => a.indexTask - b.indexTask)[0].id
                            : null) && <DropPreviewIndicator />}

                      {/* Filter tasks by boardId, sort by indexTask, and map them */}
                      {DataTasks &&
                        DataTasks.filter((task) => task.boardId === board.id)
                          .sort((a, b) => a.indexTask - b.indexTask)
                          .map((task, index, sortedTasks) => (
                            <React.Fragment key={task.id}>
                              <DraggableTaskCard
                                task={task}
                                onMoveTask={handleMoveTask}
                                onPositionedMove={handleMoveTaskInternal}
                                isRecentlyMoved={
                                  task.id === recentlyMovedTaskId
                                }
                              />

                              {/* Show drop preview indicator if needed */}
                              {dropPreview &&
                                dropPreview.boardId === board.id &&
                                ((dropPreview.beforeTaskId === task.id &&
                                  index > 0) ||
                                  (dropPreview.afterTaskId === task.id &&
                                    index < sortedTasks.length - 1)) && (
                                  <DropPreviewIndicator />
                                )}
                            </React.Fragment>
                          ))}

                      {/* If this is an empty board or we're dropping at the end */}
                      {(DataTasks.filter((task) => task.boardId === board.id)
                        .length === 0 ||
                        (dropPreview &&
                          dropPreview.boardId === board.id &&
                          dropPreview.afterTaskId ===
                            DataTasks.filter(
                              (task) => task.boardId === board.id
                            )
                              .sort((a, b) => a.indexTask - b.indexTask)
                              .slice(-1)[0]?.id)) && (
                        <Box>
                          {dropPreview && dropPreview.boardId === board.id && (
                            <DropPreviewIndicator />
                          )}

                          {/* Empty state when no tasks */}
                          {(!DataTasks ||
                            DataTasks.filter(
                              (task) => task.boardId === board.id
                            ).length === 0) && (
                            <Flex
                              h="100px"
                              w="full"
                              justify="center"
                              align="center"
                              border="1px dashed"
                              borderColor="gray.200"
                              borderRadius={radiusStyle}
                            >
                              <Text color="gray.400">No tasks</Text>
                            </Flex>
                          )}
                        </Box>
                      )}
                    </VStack>

                    {/* Add task button - only show in TO DO board */}
                    {board.boardName === "TO DO" && (
                      <AddTaskForm
                        boardId={board.id}
                        projectId={projectId || ""}
                        backlogId={backlogId || ""}
                        onTaskAdded={handleTaskCreated}
                      />
                    )}
                  </DroppableBoard>
                ))
              : "NO BOARD"}
          </Flex>
        </DndProvider>
      </GridItem>
    </LayoutAdmin>
  );
}

export default KanbanBacklogPage;
