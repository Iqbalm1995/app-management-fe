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
  AUTO_SAVE_DELAY,
  TASK_BOARD_STATUS_CODE_DONE,
  TASK_BOARD_STATUS_CODE_INPROGRESS,
  TASK_BOARD_STATUS_CODE_REVIEW,
  TASK_BOARD_STATUS_CODE_TODO,
  TASK_BOARD_STATUS_NAME_TODO,
  TASK_BOARD_STATUS_NAME_DONE,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  convertToCustomDateFormat,
  generateUUIDV1,
  truncateText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import {
  getKanbanBackUrl,
  getKanbanBackLabel,
} from "@/app/config/kanbanRoutes";

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
  TaskCommentResponse,
  TaskCommentInsertPayload,
  TaskCommentUpdatePayload,
  AssignUsersTaskPayload,
  GenerateTaskBoardPayload,
} from "@/app/services/useTasks";
import { PaggingListPayload, ListSearchByParam } from "@/app/types/masterTypes";
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
  ButtonGroup,
  InputLeftElement,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CardFooter,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  CalendarIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { setIn } from "formik";
import { u } from "framer-motion/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCog,
  FaArchive,
  FaSync,
  FaEdit,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import {
  FaCommentDots,
  FaEllipsisVertical,
  FaGripVertical,
  FaPlus,
} from "react-icons/fa6";
import {
  FiAlertCircle,
  FiArchive,
  FiArrowLeft,
  FiCheckCircle,
  FiCheckSquare,
  FiCircle,
  FiCornerDownLeft,
  FiFilter,
  FiInbox,
  FiList,
  FiLoader,
  FiMessageSquare,
  FiNavigation,
  FiPaperclip,
  FiPlusCircle,
  FiRefreshCcw,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiShare2,
  FiTrello,
} from "react-icons/fi";
import { LuGrip } from "react-icons/lu";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useUsers, {
  UserShortResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { GoFilter } from "react-icons/go";
import { MdOutlineSort } from "react-icons/md";

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
  const { colorMode } = useColorMode();
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
      _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      position="relative"
    >
      <Checkbox
        isChecked={item.isDone === "Y"}
        onChange={() => onToggle(item.id, item.isDone === "Y" ? "N" : "Y")}
        colorScheme={item.isDone === "Y" ? "green" : "blue"}
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
          color={
            item.isDone === "Y"
              ? colorMode === "light"
                ? "gray.500"
                : "gray.400"
              : "inherit"
          }
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
  getEffectiveIndex?: (task: TaskViewModel) => number;
  isRecentlyMoved?: boolean;
  localTaskIndices?: Map<string, number>;
  DataProject?: ProjectDataResponse | null;
  onMoveUp?: (taskId: string) => void;
  onMoveDown?: (taskId: string) => void;
  isDragDisabled?: boolean;
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
  getEffectiveIndex?: (task: TaskViewModel) => number;
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

// Image Preview Component
const ImagePreview = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();
  const { colorMode } = useColorMode();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      w={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      h={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border="1px solid"
      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
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
          bg={
            colorMode === "light"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.3)"
          }
          backdropFilter="blur(10px)"
          boxShadow="lg"
        >
          <ModalCloseButton
            color={colorMode === "light" ? "white" : "gray.300"}
          />
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
  const { colorMode } = useColorMode();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      boxSize={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border="1px solid"
      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
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
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
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
        <ModalContent
          rounded={radiusStyle}
          boxShadow="lg"
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <Box
              border="2px dashed"
              borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
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
const TaskComment = ({
  dataComments,
  currentUserId,
  isEditing,
  editedText,
  isUpdating,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onUpdateComment,
  onDeleteComment,
  onEditTextChange,
}: {
  dataComments: TaskCommentResponse;
  currentUserId?: string;
  isEditing: boolean;
  editedText: string;
  isUpdating: boolean;
  isDeleting: boolean;
  onStartEdit: (commentId: string, currentText: string) => void;
  onCancelEdit: () => void;
  onUpdateComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEditTextChange: (text: string) => void;
}) => {
  const { colorMode } = useColorMode();
  const limitText: number = 100;
  const [limitTextState, setlimitTextState] = useState<number>(limitText);

  const handleShowMore = () => {
    if ((dataComments.comCaptions || "").length > limitTextState) {
      setlimitTextState((dataComments.comCaptions || "").length);
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
        name={dataComments.userCreated.nama}
        src={dataComments.userCreated.profilePict || undefined}
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
              {dataComments.userCreated.nama}
            </Text>
            <Text
              fontSize={12}
              color={colorMode === "light" ? "gray.500" : "gray.400"}
              alignSelf="center"
            >
              {convertToCustomDateFormat(dataComments.createdAt)}
            </Text>
          </Flex>
          {/* Show menu only if user owns the comment */}
          {currentUserId === dataComments.userCreated.id && (
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="ghost"
                isLoading={isDeleting}
                isDisabled={isUpdating}
              >
                <FaEllipsisVertical />
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<FaEdit />}
                  onClick={() =>
                    onStartEdit(dataComments.id, dataComments.comCaptions || "")
                  }
                  isDisabled={isEditing || isUpdating || isDeleting}
                >
                  Edit Comment
                </MenuItem>
                <MenuItem
                  icon={<FaTrash />}
                  color="red.500"
                  onClick={() => onDeleteComment(dataComments.id)}
                  isDisabled={isEditing || isUpdating || isDeleting}
                >
                  Delete Comment
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>

        {/* Comment text or edit input */}
        {isEditing ? (
          <VStack w="full" spacing={2} align="stretch">
            <Textarea
              value={editedText}
              onChange={(e) => onEditTextChange(e.target.value)}
              placeholder="Edit your comment..."
              size="sm"
              resize="vertical"
              minH="60px"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  onUpdateComment(dataComments.id);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelEdit();
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
                onClick={onCancelEdit}
                isDisabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme={isUpdating ? "yellow" : "blue"}
                onClick={() => onUpdateComment(dataComments.id)}
                isLoading={isUpdating}
                isDisabled={!editedText.trim() || isUpdating}
              >
                Save
              </Button>
            </HStack>
          </VStack>
        ) : (
          <>
            <Text as="p" fontSize={15}>
              {truncateText(dataComments.comCaptions || "", limitTextState)}
            </Text>
            {limitText < (dataComments.comCaptions || "").length && (
              <Button
                size="sm"
                variant="link"
                colorScheme="primary"
                onClick={() => handleShowMore()}
              >
                {(dataComments.comCaptions || "").length === limitTextState
                  ? "Hide Less"
                  : "Show More"}
              </Button>
            )}
          </>
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
  const { colorMode } = useColorMode();
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { CreateSimpleTask } = useTasks();
  const { List: ListUsers } = useUsers();
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
        justifyContent="flex-start"
        onClick={handleAddClick}
        width="full"
        bg={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        boxShadow={"sm"}
        px={5}
        py={4}
        _hover={{
          bgColor: "secondary.200",
          color: "secondary.800",
        }}
        _active={{
          color: "secondary.800",
          bgColor: "transparent",
        }}
      >
        Add task
      </Button>
    );
  }

  return (
    <Card
      size="sm"
      variant="outline"
      boxShadow="sm"
      mb={2}
      bg={colorMode === "light" ? "white" : "gray.800"}
      rounded={radiusStyle}
    >
      <CardBody p={3}>
        <VStack spacing={3} align="stretch">
          <Input
            ref={inputRef}
            placeholder="Enter task name..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            size="md"
          />
          <HStack spacing={2} justify="flex-end">
            <Button size="xs" onClick={handleCancel} variant="ghost">
              Cancel
            </Button>
            <Button
              size="xs"
              colorScheme={isSubmitting ? "yellow" : "blue"}
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
  DataProject,
  getEffectiveIndex,
  localTaskIndices,
  onMoveUp,
  onMoveDown,
}: DraggableTaskCardProps) {
  const { colorMode } = useColorMode();
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

  const { List: ListUsers } = useUsers();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ActionLoading, setActionLoading] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

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

  // Add state and handlers for the detail modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Listen for drag position updates
  useEffect(() => {
    const handleDragPositionUpdate = (event: CustomEvent) => {
      if (event.detail.taskId === task.id) {
        setDragPosition(event.detail.position);
      }
    };
    window.addEventListener(
      "dragPositionUpdate",
      handleDragPositionUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "dragPositionUpdate",
        handleDragPositionUpdate as EventListener
      );
    };
  }, [task.id]);
  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);

  const GetDataUser = async (
    searchValue: string,
    limit: number = 3
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
      // Prepare the payload for AssignUsersTask
      const assignPayload: AssignUsersTaskPayload = {
        taskId: detailedTask.id,
        usersData: ChoosedMemberProjects.map((user) => ({
          userId: user.userId,
        })),
      };

      console.log("Assigning users with payload:", assignPayload);

      // Call the API to assign users
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

        // Refresh the kanban board to show updated assignments
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }

        // Close the assign modal
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

  // Handle assign modal close with unsaved changes check
  const handleAssignModalClose = () => {
    // Check if there are unsaved changes
    const currentAssignedIds = (detailedTask?.assignUsers || [])
      .map((user) => user.id)
      .sort();
    const selectedIds = ChoosedMemberProjects.map((user) => user.id).sort();

    const hasUnsavedChanges =
      JSON.stringify(currentAssignedIds) !== JSON.stringify(selectedIds);

    if (hasUnsavedChanges && !isSavingAssignments) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) {
        return;
      }
    }

    // Reset search state
    setSearchUserInput("");
    setDataUsers([]);

    // Close modal
    onAssignModalClose();
  };

  // Check if there are unsaved changes
  const hasUnsavedAssignmentChanges = () => {
    if (!detailedTask) return false;

    const currentAssignedIds = (detailedTask.assignUsers || [])
      .map((user) => user.id)
      .sort();
    const selectedIds = ChoosedMemberProjects.map((user) => user.id).sort();

    return JSON.stringify(currentAssignedIds) !== JSON.stringify(selectedIds);
  };

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
    ListTaskCommentsPaged,
    CreateTaskComment,
    UpdateTaskComment,
    DeleteTaskComment,
    AssignUsersTask,
    MoveTask,
  } = useTasks();

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
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();

  // Handle keyboard shortcuts in assign modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAssignModalOpen && event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (!isSavingAssignments && hasUnsavedAssignmentChanges()) {
          handleSaveAssignedUsers();
        }
      }
    };

    if (isAssignModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isAssignModalOpen,
    isSavingAssignments,
    ChoosedMemberProjects,
    detailedTask,
  ]);

  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("tokenData") as string;

  // Auth utility functions
  const getCompleteAuthData = (): CompleteAuthDataResponse | null => {
    try {
      const storedData = localStorage.getItem("authData");
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Error parsing auth data:", error);
      return null;
    }
  };

  const getCurrentUser = (): AuthDataResponse | null => {
    const authData = getCompleteAuthData();
    return authData?.dataLogin || null;
  };

  const getAuthToken = (): AuthTokenResponse | null => {
    const authData = getCompleteAuthData();
    return authData?.dataAuth || null;
  };

  const isUserLoggedIn = (): boolean => {
    const authData = getCompleteAuthData();
    return authData?.statusLogin === "logged_in";
  };

  // Additional auth utility functions
  const getCurrentUserName = (): string => {
    const user = getCurrentUser();
    return user?.nama || "Unknown User";
  };

  const getCurrentUserAvatar = (): string | undefined => {
    const user = getCurrentUser();
    return user?.profilePict || undefined;
  };

  const getCurrentUserEmail = (): string => {
    const user = getCurrentUser();
    return user?.email || "";
  };

  const getCurrentUserTeam = (): string => {
    const user = getCurrentUser();
    return user?.team?.teamName || "No Team";
  };

  // Debug function to log complete auth data (for development)
  const logAuthData = () => {
    const completeAuth = getCompleteAuthData();
    const currentUser = getCurrentUser();
    const authToken = getAuthToken();

    console.log("Complete Auth Data:", completeAuth);
    console.log("Current User:", currentUser);
    console.log("Auth Token:", authToken);
    console.log("Is Logged In:", isUserLoggedIn());
    console.log("User Name:", getCurrentUserName());
    console.log("User Email:", getCurrentUserEmail());
    console.log("User Team:", getCurrentUserTeam());
  };

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

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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

        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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
        handleModalClose();

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

  // Load task comments with pagination
  const loadTaskComments = async (
    taskId: string,
    page: number = 0,
    append: boolean = false
  ) => {
    if (!taskId) return;

    setIsLoadingComments(true);
    try {
      const token = getToken();
      const payload: PaggingListPayload = {
        page: page,
        limit: commentsPageSize,
        search: "",
        filterWhere: [
          {
            field: "taskId",
            value: taskId,
            operator: "=",
          },
        ],
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

        // Check if there are more comments to load
        setHasMoreComments(comments.length === commentsPageSize);

        // Update current page state
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
        // Clear the input
        setNewComment("");

        // Refresh comments to show the new comment
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
        // Update the comment in local state
        setTaskComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, comCaptions: editedCommentText.trim() }
              : comment
          )
        );

        // Clear edit state
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
        // Remove the comment from local state
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
  }; // Calculate and update task progress based on completed task items
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
        // Refresh the kanban board
        if (window.refreshKanbanData) {
          window.refreshKanbanData();
        }
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
        {/* Drag Position Tooltip */}
        {isDragging && dragPosition !== null && (
          <Box
            position="absolute"
            top="-45px"
            left="50%"
            transform="translateX(-50%)"
            bg="blue.600"
            color="white"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight="bold"
            zIndex={1000}
            boxShadow="0 4px 12px rgba(0,0,0,0.3)"
            whiteSpace="nowrap"
            _before={{
              content: '""',
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid",
              borderTopColor: "blue.600",
            }}
          >
            Position {dragPosition}
          </Box>
        )}{" "}
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
          {/* <Flex w={"full"} bg={"orange.300"} h={"10px"}></Flex> */}
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
                {/* Index Display - API vs Local */}
                <HStack spacing={1}>
                  <Badge
                    rounded={"md"}
                    px={2}
                    fontSize="xs"
                    colorScheme="gray"
                    variant="outline"
                    display={"none"}
                  >
                    API: {task.indexTask}
                  </Badge>
                  {getEffectiveIndex && localTaskIndices && (
                    <HStack spacing={1}>
                      <Badge
                        display={"none"}
                        rounded={"md"}
                        px={2}
                        fontSize="xs"
                        colorScheme={
                          localTaskIndices.has(task.id) ? "blue" : "gray"
                        }
                        variant={
                          localTaskIndices.has(task.id) ? "solid" : "outline"
                        }
                      >
                        Local: {getEffectiveIndex(task)}
                      </Badge>

                      {/* Up/Down Arrow Buttons */}
                      <VStack spacing={0}>
                        <IconButton
                          aria-label="Move task up"
                          icon={<ChevronUpIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp?.(task.id);
                          }}
                          _hover={{ bg: "blue.100" }}
                          h="12px"
                          minH="12px"
                          w="16px"
                          minW="16px"
                        />
                        <IconButton
                          aria-label="Move task down"
                          icon={<ChevronDownIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveDown?.(task.id);
                          }}
                          _hover={{ bg: "blue.100" }}
                          h="12px"
                          minH="12px"
                          w="16px"
                          minW="16px"
                        />
                      </VStack>
                    </HStack>
                  )}
                </HStack>{" "}
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
                      {/* <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {
                          task.taskItems.filter((item) => item.isDone === "Y")
                            .length
                        }
                        /{task.taskItems.length}
                      </Text> */}
                    </HStack>
                  )}
                  {/* Share task */}
                  {/* <Icon as={FiShare2} color="gray.600" boxSize={4} /> */}
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

      {/* Task Detail Modal */}
      <Modal
        isCentered
        onClose={handleModalClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
        size="5xl"
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
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
                          {(window.kanbanBoards || []).map((board) => (
                            <MenuItem
                              fontWeight={600}
                              key={board.id}
                              isDisabled={board.id === detailedTask.boardId}
                              onClick={() => {
                                const newBoardId = board.id;
                                if (newBoardId === detailedTask.boardId) return;

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
                                            description: "Failed to move task",
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
                            icon={<Badge colorScheme="purple">CRITICAL</Badge>}
                          >
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
                          // height={"180px"}
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
                      color={colorMode === "light" ? "gray.700" : "gray.200"}
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
                          // Clear search state when opening modal
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
                        _hover={{ bg: "gray.50" }}
                        p={2}
                        borderRadius="md"
                        transition="all 0.2s"
                        minH="60px"
                      >
                        {detailedTask.taskDesc ? (
                          <Text>{detailedTask.taskDesc}</Text>
                        ) : (
                          <Text
                            color={
                              colorMode === "light" ? "gray.400" : "gray.500"
                            }
                          >
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
                        color={colorMode === "light" ? "gray.700" : "gray.200"}
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
                            colorMode === "light" ? "gray.700" : "gray.200"
                          }
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
                          <InputGroup size="sm">
                            <Flex as={HStack} spacing={3}>
                              <Input
                                placeholder="Add a new subtask..."
                                value={newTaskItemName}
                                onChange={(e) =>
                                  setNewTaskItemName(e.target.value)
                                }
                                pr="4.5rem"
                                variant={"flushed"}
                                px={3}
                              />
                              <Button
                                h="1.75rem"
                                size="sm"
                                type="submit"
                                variant="solid"
                                colorScheme="secondary"
                                isDisabled={!newTaskItemName.trim()}
                                isLoading={isAddingTaskItem}
                                leftIcon={<FiCornerDownLeft />}
                                px={5}
                              >
                                Enter
                              </Button>
                            </Flex>
                          </InputGroup>
                        </form>
                      </Box>
                    </Box>
                    <Box mb={10}></Box>
                    {/* Attachments - Temorary Hide Feature*/}
                    <Box w="full" display={"none"}>
                      <Flex
                        w="full"
                        justifyContent="space-between"
                        as={HStack}
                        spacing={2}
                        color={colorMode === "light" ? "gray.700" : "gray.200"}
                        mb={3}
                      >
                        <HStack>
                          <FiPaperclip size={16} />
                          <Text fontWeight={600} fontSize={18}>
                            Attachment
                          </Text>
                        </HStack>
                        {isLoadingTaskItems && <Spinner size="sm" />}
                      </Flex>

                      <Wrap spacing={2}>
                        {/* {Array.isArray(sampleAttachments) &&
                          sampleAttachments.map((image, index) => (
                            <WrapItem key={index}>
                              <ImagePreview
                                id={image.id || `attachment-${index}`}
                                name={image.name}
                                alt={image.alt}
                                src={image.src}
                              />
                            </WrapItem>
                          ))} */}
                        <WrapItem>
                          <ImageAddMore />
                        </WrapItem>
                      </Wrap>
                    </Box>
                    <HorizontalFadeDivider />
                    {/* Comments Section */}
                    <Flex
                      w="full"
                      justifyContent="space-between"
                      alignItems="center"
                      as={HStack}
                      spacing={2}
                      color={colorMode === "light" ? "gray.700" : "gray.200"}
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
                      <TaskComment
                        key={comment.id}
                        dataComments={comment}
                        currentUserId={getCurrentUser()?.id}
                        isEditing={editingCommentId === comment.id}
                        editedText={editedCommentText}
                        isUpdating={isUpdatingComment}
                        isDeleting={deletingCommentId === comment.id}
                        onStartEdit={handleStartEditComment}
                        onCancelEdit={handleCancelEditComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        onEditTextChange={setEditedCommentText}
                      />
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
                    // rounded={radiusStyle}
                    // bgColor="primary.100"
                    // boxShadow="lg"
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

                    {/* Dates */}
                    <Box w="full">
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Timeline
                      </Text>
                      <VStack align="start" spacing={2}>
                        {detailedTask.startDate ? (
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
                        Dibuat Oleh
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

                    <HorizontalFadeDivider />

                    {/* Actions */}
                    <Flex as={Stack} w="full">
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={
                          detailedTask.isArchived != null &&
                          detailedTask.isArchived == "Y"
                            ? "teal"
                            : "red"
                        }
                        leftIcon={
                          <Icon
                            as={
                              detailedTask.isArchived != null &&
                              detailedTask.isArchived == "Y"
                                ? FiRotateCcw
                                : FiArchive
                            }
                          />
                        }
                        onClick={() => handleArchiveTask(detailedTask.id)}
                        isLoading={isArchiving}
                      >
                        {" "}
                        {detailedTask.isArchived != null &&
                        detailedTask.isArchived == "Y"
                          ? "Restore"
                          : "Archive"}
                      </Button>
                      <Button
                        size={"sm"}
                        w={"full"}
                        colorScheme={"blue"}
                        variant={"outline"}
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
        onClose={handleAssignModalClose}
        size="2xl"
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          rounded={radiusStyle}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>
            <HStack spacing={2} justify="space-between" w="full">
              <HStack spacing={2}>
                <Text>Assign Task</Text>
                {hasUnsavedAssignmentChanges() && (
                  <Badge colorScheme="orange" fontSize="xs">
                    Unsaved Changes
                  </Badge>
                )}
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
                            <Flex
                              key={user.id}
                              p={3}
                              bg="gray.50"
                              borderRadius="md"
                              align="center"
                              justify="space-between"
                            >
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={user.nama}
                                  src={user.profilePict || undefined}
                                />
                                <Box>
                                  <Text fontWeight="medium">{user.nama}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {user.email}
                                  </Text>
                                </Box>
                              </HStack>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                isDisabled={!!isAlreadyAssigned}
                                leftIcon={<FaPlus />}
                                onClick={() => handleAddUserAssign(user)}
                              >
                                {isAlreadyAssigned ? "Added" : "Add"}
                              </Button>
                            </Flex>
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
                      Assigned Users ({ChoosedMemberProjects.length})
                    </Text>
                  </Box>

                  {/* Assigned Users List */}
                  <Box>
                    {ChoosedMemberProjects.length <= 0 ? (
                      <Flex
                        w="full"
                        justifyContent="center"
                        alignItems="center"
                        minH="100px"
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Text color="gray.500">No users assigned yet</Text>
                      </Flex>
                    ) : (
                      <VStack spacing={2} align="stretch">
                        {ChoosedMemberProjects.map((user) => (
                          <Flex
                            key={user.id}
                            p={3}
                            bg="blue.50"
                            borderRadius="md"
                            align="center"
                            justify="space-between"
                          >
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={user.nama}
                                src={user.profilePict || undefined}
                              />
                              <Box>
                                <Text fontWeight="medium">{user.nama}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {user.email}
                                </Text>
                              </Box>
                            </HStack>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              leftIcon={<FaTrash />}
                              onClick={() => handleRemoveUserAssign(user.id)}
                            >
                              Remove
                            </Button>
                          </Flex>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2} w="full" justify="space-between">
              <Text fontSize="xs" color="gray.500">
                Press Ctrl+S to save quickly
              </Text>
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  onClick={handleAssignModalClose}
                  isDisabled={isSavingAssignments}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveAssignedUsers}
                  isLoading={isSavingAssignments}
                  loadingText="Saving..."
                  isDisabled={
                    !hasUnsavedAssignmentChanges() || isSavingAssignments
                  }
                >
                  Save Assignments
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
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
  getEffectiveIndex,
  children,
  setDropPreview,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  // Helper function to sort tasks by effective index
  const getSortedBoardTasks = (
    boardTasks: TaskViewModel[]
  ): TaskViewModel[] => {
    if (getEffectiveIndex) {
      return [...boardTasks].sort(
        (a, b) => getEffectiveIndex(a) - getEffectiveIndex(b)
      );
    }
    // Fallback to API index if getEffectiveIndex is not available
    return [...boardTasks].sort((a, b) => a.indexTask - b.indexTask);
  };

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
        // Sort tasks by their effective index (local or API)
        const boardTasks = getSortedBoardTasks(tasks);

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
          // Dispatch position update event for tooltip
          let displayPosition = 1;
          if (insertPosition === -1) {
            displayPosition = boardTasks.length + 1;
          } else if (insertPosition === 0) {
            displayPosition = 1;
          } else {
            displayPosition = insertPosition + 1;
          }

          window.dispatchEvent(
            new CustomEvent("dragPositionUpdate", {
              detail: {
                taskId: item.id,
                position: displayPosition,
              },
            })
          );
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
        // Sort tasks by their effective index (local or API)
        const boardTasks = getSortedBoardTasks(tasks);

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

        // Calculate the appropriate index value using effective indices
        if (insertPosition === -1) {
          // Dropping at the end
          if (boardTasks.length > 0) {
            const lastTaskEffectiveIndex = getEffectiveIndex
              ? getEffectiveIndex(boardTasks[boardTasks.length - 1])
              : boardTasks[boardTasks.length - 1].indexTask;
            insertIndex = lastTaskEffectiveIndex + 10;
          } else {
            insertIndex = 10;
          }
          console.log(`🎯 Dropping at END, calculated index: ${insertIndex}`);
        } else if (insertPosition === 0) {
          // Dropping at the beginning
          if (boardTasks[0]) {
            const firstTaskEffectiveIndex = getEffectiveIndex
              ? getEffectiveIndex(boardTasks[0])
              : boardTasks[0].indexTask;
            insertIndex =
              firstTaskEffectiveIndex > 10
                ? Math.floor(firstTaskEffectiveIndex / 2)
                : 5; // Ensure we have space before first task
          } else {
            insertIndex = 10;
          }
          console.log(
            `🎯 Dropping at BEGINNING, calculated index: ${insertIndex}`
          );
        } else {
          // Dropping in the middle - use the midpoint between effective indices
          const prevTask = boardTasks[insertPosition - 1];
          const nextTask = boardTasks[insertPosition];

          const prevEffectiveIndex = getEffectiveIndex
            ? getEffectiveIndex(prevTask)
            : prevTask.indexTask;
          const nextEffectiveIndex = getEffectiveIndex
            ? getEffectiveIndex(nextTask)
            : nextTask.indexTask;

          insertIndex = Math.floor(
            (prevEffectiveIndex + nextEffectiveIndex) / 2
          );

          // Ensure we have a valid index (not the same as existing ones)
          if (insertIndex <= prevEffectiveIndex) {
            insertIndex = prevEffectiveIndex + 1;
          }
          if (insertIndex >= nextEffectiveIndex) {
            insertIndex = nextEffectiveIndex - 1;
          }

          console.log(
            `🎯 Dropping in MIDDLE, calculated index: ${insertIndex} (between effective ${prevEffectiveIndex} and ${nextEffectiveIndex})`
          );
        }

        // Call the positioned move function with the calculated index
        console.log(
          `Calling onPositionedMove with taskId=${item.id}, boardId=${board.id}, index=${insertIndex}`
        );
        onPositionedMove?.(item.id, board.id, insertIndex);
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
      width={"full"}
      minWidth={"320px"}
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
    GenerateKanbanBoard,
  } = useTasks();
  const { List: ListUsers } = useUsers();

  // toggle for edit mode or view mode
  const [EditMode, setEditMode] = useState<"1" | "0">("1");

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

  // Archived tasks drawer state
  const [archivedTasks, setArchivedTasks] = useState<TaskViewModel[]>([]);
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Handle task creation - refresh data after task is created
  const handleTaskCreated = () => {
    // Trigger a refresh of the tasks
    setRefreshData(RefreshData + 1);
  };

  // GENERATE KANBAN BOARD HANDLER
  const handleGenerateKanbanBoard = async () => {
    if (!tokenData || !backlogId || !projectId) {
      showToast({
        description: "Missing required data to generate Kanban board",
        statusToast: "error",
      });
      return;
    }

    try {
      console.log("🚀 GENERATE KANBAN: Starting board generation...");

      const payload: GenerateTaskBoardPayload = {
        backlogId: backlogId,
        projectId: projectId,
      };

      const response = await GenerateKanbanBoard(payload, tokenData);

      if (response && response.statusCode === RES_CODE_OK) {
        console.log("✅ GENERATE KANBAN: Board generated successfully");

        showToast({
          description: "Kanban board berhasil dibuat!",
          statusToast: "success",
        });

        // Refresh the kanban board data
        console.log("🔄 GENERATE KANBAN: Refreshing board data...");
        setRefreshData((prev) => prev + 1);
      } else {
        console.error("❌ GENERATE KANBAN: Failed to generate board");
        showToast({
          description: response?.message || "Failed to generate Kanban board",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("❌ GENERATE KANBAN: Error during generation:", error);
      showToast({
        description: "An error occurred while generating the Kanban board",
        statusToast: "error",
      });
    }
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  // LOCAL INDEX MANAGEMENT - Track local indices separately from API indices
  const [localTaskIndices, setLocalTaskIndices] = useState<Map<string, number>>(
    new Map()
  );

  // PENDING CHANGES MANAGEMENT - Track all task changes before sending to API
  const [pendingTaskChanges, setPendingTaskChanges] = useState<
    TaskMovePayload[]
  >([]);

  // Helper function to get effective index (local if exists, otherwise API index)
  const getEffectiveIndex = (task: TaskViewModel): number => {
    const localIndex = localTaskIndices.get(task.id);
    return localIndex !== undefined ? localIndex : task.indexTask;
  };

  // Initialize local indices based on sorted order of tasks
  const initializeLocalIndices = (tasks: TaskViewModel[]) => {
    console.log(
      "🔧 Initializing local indices using actual API indexTask values..."
    );
    console.log("🔧 Input tasks count:", tasks.length);

    // Clear existing local indices first
    console.log("🧹 Clearing existing local indices...");
    setLocalTaskIndices(new Map());

    const newLocalIndices = new Map<string, number>();

    // Group tasks by board
    const tasksByBoard = tasks.reduce((acc, task) => {
      if (!acc[task.boardId]) {
        acc[task.boardId] = [];
      }
      acc[task.boardId].push(task);
      return acc;
    }, {} as Record<string, TaskViewModel[]>);

    // For each board, sort tasks by their API index and assign local indices
    Object.entries(tasksByBoard).forEach(([boardId, boardTasks]) => {
      // Sort tasks by their API index (ascending)
      const sortedTasks = [...boardTasks].sort(
        (a, b) => a.indexTask - b.indexTask
      );

      console.log(
        `📋 Board ${boardId}: Initializing ${sortedTasks.length} tasks`
      );
      console.log(
        `📋 Board ${boardId} API indices:`,
        sortedTasks.map((t) => `${t.taskName}=${t.indexTask}`)
      );

      // Use the actual API indexTask as the local index (no conversion)
      sortedTasks.forEach((task) => {
        const apiIndex = task.indexTask;
        newLocalIndices.set(task.id, apiIndex);

        console.log(
          `  📌 Task "${task.taskName}" (${task.id}): API=${apiIndex} → Local=${apiIndex} (same)`
        );
      });
    }); // Close the Object.entries forEach loop

    setLocalTaskIndices(newLocalIndices);

    console.log(
      `✅ Local indices initialized for ${newLocalIndices.size} tasks using actual API values`
    );
    console.log("✅ Local indices map:", Array.from(newLocalIndices.entries()));
  };
  // Semi-automated save: Auto-save after ${AUTO_SAVE_DELAY / 1000} seconds of inactivity
  useEffect(() => {
    // Only trigger if there are pending changes
    if (pendingTaskChanges.length === 0) {
      return;
    }

    console.log(
      `⏰ SEMI-AUTO SAVE: ${
        pendingTaskChanges.length
      } pending changes detected, starting ${
        AUTO_SAVE_DELAY / 1000
      }-second timer...`
    );

    // Set a 3-second timer
    const autoSaveTimer = setTimeout(async () => {
      console.log(
        `🚀 SEMI-AUTO SAVE: ${
          AUTO_SAVE_DELAY / 1000
        } seconds of inactivity, triggering auto-save...`
      );

      if (!tokenData) {
        console.error(
          "❌ SEMI-AUTO SAVE: No token available, keeping manual save option"
        );
        return;
      }

      try {
        setIsAutoSaving(true);
        console.log("📤 SEMI-AUTO SAVE: Attempting to save pending changes...");

        const saveResult = await sendPendingChangesToAPI();
        console.log("✅ SEMI-AUTO SAVE: Save result:", saveResult);

        if (saveResult && saveResult.length > 0) {
          // showToast({
          //   description: `Auto-saved ${saveResult.length} task changes after ${
          //     AUTO_SAVE_DELAY / 1000
          //   } seconds`,
          //   statusToast: "success",
          // });
          console.log(
            "✅ SEMI-AUTO SAVE: Successfully saved changes automatically"
          );

          // Refresh task list after successful save
          console.log("🔄 SEMI-AUTO SAVE: Refreshing task list...");
          setRefreshData((prev) => prev + 1);
        }

        setIsAutoSaving(false);
      } catch (error) {
        console.error("❌ SEMI-AUTO SAVE: Failed, keeping manual save option");
        console.error("❌ SEMI-AUTO SAVE Error details:", error);

        showToast({
          description: `Auto-save failed after ${
            AUTO_SAVE_DELAY / 1000
          } seconds. Please use the Save Changes button.`,
          statusToast: "warning",
        });

        setIsAutoSaving(false);
      }
    }, AUTO_SAVE_DELAY); // Auto-save delay from constants

    // Cleanup function: cancel timer if component unmounts or dependencies change
    return () => {
      console.log("🔄 SEMI-AUTO SAVE: Timer reset due to new changes");
      clearTimeout(autoSaveTimer);
    };
  }, [pendingTaskChanges.length, tokenData]); // Re-run when pending changes count changes

  // PENDING CHANGES MANAGEMENT FUNCTIONS

  // Add or update a task change in pending changes
  const addPendingTaskChange = (
    taskId: string,
    boardId: string,
    newIndex: number
  ) => {
    console.log("🚨 DEBUG: addPendingTaskChange CALLED!");
    console.log("🚨 DEBUG: Parameters:", { taskId, boardId, newIndex });
    const task = DataTasks.find((t) => t.id === taskId);
    if (!task) return;

    const board = DataBoard.find((b) => b.id === boardId);
    if (!board) return;

    console.log("🚨 DEBUG: Creating TaskMovePayload with:");
    console.log("🚨 DEBUG: - id:", taskId);
    console.log("🚨 DEBUG: - boardId:", boardId);
    console.log("🚨 DEBUG: - indexTask (new):", newIndex);
    console.log("🚨 DEBUG: - indexStage:", board.indexStage);

    const taskMovePayload: TaskMovePayload = {
      id: taskId,
      boardId: boardId,
      indexTask: newIndex,
      indexStage: board.indexStage,
    };

    setPendingTaskChanges((prevChanges) => {
      // Remove existing change for this task if it exists
      const filteredChanges = prevChanges.filter(
        (change) => change.id !== taskId
      );

      // Add the new change
      const updatedChanges = [...filteredChanges, taskMovePayload];

      console.log(
        `📝 Added pending change for task ${taskId}:`,
        taskMovePayload
      );
      console.log(`📋 Total pending changes: ${updatedChanges.length}`);

      return updatedChanges;
    });
  };

  // Generate all necessary task changes to maintain proper index alignment
  const generateAlignmentChanges = (
    boardId: string,
    excludeTaskId?: string
  ) => {
    console.log(`🔧 Generating alignment changes for board ${boardId}...`);

    const boardTasks = getTasksSortedByEffectiveIndex(boardId).filter(
      (task) => task.id !== excludeTaskId
    );

    const board = DataBoard.find((b) => b.id === boardId);
    if (!board) return [];

    const alignmentChanges: TaskMovePayload[] = [];

    boardTasks.forEach((task, index) => {
      const expectedIndex = (index + 1) * 10; // 10, 20, 30, etc.
      const currentEffectiveIndex = getEffectiveIndex(task);

      // Only create change if the index needs to be updated
      if (currentEffectiveIndex !== expectedIndex) {
        const taskMovePayload: TaskMovePayload = {
          id: task.id,
          boardId: boardId,
          indexTask: expectedIndex,
          indexStage: board.indexStage,
        };

        alignmentChanges.push(taskMovePayload);

        console.log(
          `  📌 Task "${task.taskName}" (${task.id}): ${currentEffectiveIndex} → ${expectedIndex}`
        );
      }
    });

    console.log(
      `✅ Generated ${alignmentChanges.length} alignment changes for board ${boardId}`
    );
    return alignmentChanges;
  };

  // Add alignment changes for all affected tasks in a board
  const addBoardAlignmentChanges = (
    boardId: string,
    excludeTaskId?: string
  ) => {
    const alignmentChanges = generateAlignmentChanges(boardId, excludeTaskId);

    if (alignmentChanges.length > 0) {
      setPendingTaskChanges((prevChanges) => {
        // Remove existing changes for tasks that will be realigned
        const taskIdsToRealign = alignmentChanges.map((change) => change.id);
        const filteredChanges = prevChanges.filter(
          (change) => !taskIdsToRealign.includes(change.id)
        );

        // Add all alignment changes
        const updatedChanges = [...filteredChanges, ...alignmentChanges];

        console.log(`📋 Added ${alignmentChanges.length} alignment changes`);
        console.log(`📋 Total pending changes: ${updatedChanges.length}`);

        return updatedChanges;
      });
    }
  };

  // Clear all pending changes
  const clearPendingChanges = () => {
    console.log("🧹 Clearing all pending changes");
    console.log("🚨 DEBUG: clearPendingChanges CALLED!");
    console.log("🚨 DEBUG: Stack trace:", new Error().stack);
    setPendingTaskChanges([]);
  };

  // Get pending changes summary for debugging
  const getPendingChangesSummary = () => {
    console.log(
      `📊 PENDING CHANGES SUMMARY (${pendingTaskChanges.length} changes):`
    );

    const changesByBoard = pendingTaskChanges.reduce((acc, change) => {
      if (!acc[change.boardId]) {
        acc[change.boardId] = [];
      }
      acc[change.boardId].push(change);
      return acc;
    }, {} as Record<string, TaskMovePayload[]>);

    Object.entries(changesByBoard).forEach(([boardId, changes]) => {
      const board = DataBoard.find((b) => b.id === boardId);
      console.log(
        `  📋 Board ${board?.boardName || boardId}: ${changes.length} changes`
      );

      changes.forEach((change) => {
        const task = DataTasks.find((t) => t.id === change.id);
        console.log(
          `    📌 Task "${task?.taskName || change.id}": index=${
            change.indexTask
          }`
        );
      });
    });
  };

  // Send all pending changes to API
  const sendPendingChangesToAPI = async () => {
    console.log("🚨 DEBUG: sendPendingChangesToAPI CALLED!");
    console.log("🚨 DEBUG: pendingTaskChanges:", pendingTaskChanges);
    console.log(
      "🚨 DEBUG: pendingTaskChanges.length:",
      pendingTaskChanges.length
    );
    if (pendingTaskChanges.length === 0) {
      console.log("📭 No pending changes to send");
      return []; // Return empty array instead of undefined
    }

    console.log(
      `🚀 Sending ${pendingTaskChanges.length} pending changes to API...`
    );
    getPendingChangesSummary();

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Send each change to the API
    for (const change of pendingTaskChanges) {
      try {
        console.log(`📤 Sending change for task ${change.id}:`, change);
        console.log("🚨 DEBUG: About to call MoveTask...");
        console.log("🚨 DEBUG: tokenData:", tokenData);
        console.log("🚨 DEBUG: MoveTask function:", typeof MoveTask);

        const response = await MoveTask(change, tokenData);

        console.log("🚨 DEBUG: MoveTask response:", response);

        if (response?.statusCode === RES_CODE_OK) {
          console.log(`✅ Successfully updated task ${change.id}`);
          successCount++;
          results.push({ taskId: change.id, success: true, response });
        } else {
          console.error(
            `❌ Failed to update task ${change.id}:`,
            response?.message
          );
          errorCount++;
          results.push({
            taskId: change.id,
            success: false,
            error: response?.message,
          });
        }
      } catch (error) {
        console.error(`❌ Error updating task ${change.id}:`, error);
        errorCount++;
        results.push({ taskId: change.id, success: false, error });
      }
    }

    // Show results summary
    console.log(`📊 BATCH UPDATE RESULTS:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    console.log(`  📋 Total: ${pendingTaskChanges.length}`);

    // Show toast notification
    if (errorCount === 0) {
      showToast({
        description: `Successfully updated ${successCount} tasks`,
        statusToast: "success",
      });
    } else if (successCount > 0) {
      showToast({
        description: `Updated ${successCount} tasks, ${errorCount} failed`,
        statusToast: "warning",
      });
    } else {
      showToast({
        description: `Failed to update ${errorCount} tasks`,
        statusToast: "error",
      });
    }

    // Clear pending changes after sending (regardless of success/failure)
    clearPendingChanges();

    // Refresh task data to get latest state from server
    console.log("🔄 Refreshing data after API save...");
    setRefreshData((prev) => prev + 1);

    return results;
  };
  // GET LOCAL CHANGES - Get all tasks that have local index changes
  const getLocalChanges = (): Array<{
    taskId: string;
    localIndex: number;
    apiIndex: number;
  }> => {
    const changes: Array<{
      taskId: string;
      localIndex: number;
      apiIndex: number;
    }> = [];

    localTaskIndices.forEach((localIndex, taskId) => {
      const task = DataTasks.find((t) => t.id === taskId);
      if (task && task.indexTask !== localIndex) {
        changes.push({
          taskId: taskId,
          localIndex: localIndex,
          apiIndex: task.indexTask,
        });
      }
    });

    console.log(
      `📊 Found ${changes.length} tasks with local changes:`,
      changes
    );
    return changes;
  };

  // CLEAR LOCAL CHANGES - Reset local indices (useful after API sync)
  const clearLocalChanges = (): void => {
    setLocalTaskIndices(new Map());
    console.log(`🧹 Local index changes cleared`);
  };

  // Helper function to get tasks sorted by effective index
  const getTasksSortedByEffectiveIndex = (boardId: string): TaskViewModel[] => {
    return DataTasks.filter((task) => task.boardId === boardId).sort(
      (a, b) => getEffectiveIndex(a) - getEffectiveIndex(b)
    );
  };
  const [SerachTasks, setSerachTasks] = useState<string>("");

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
        );

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
    );

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

  // ADVANCED INDEX REORDERING - Recalculate all task indices in a board
  const reorderBoardIndices = (
    boardId: string,
    movedTaskId: string,
    newPosition: number
  ): void => {
    console.log(
      `🔄 REORDERING BOARD: ${boardId}, moving task ${movedTaskId} to position ${newPosition}`
    );

    // Get all tasks in the board (excluding the moved task)
    const boardTasks = DataTasks.filter(
      (task) => task.boardId === boardId && task.id !== movedTaskId
    ).sort((a, b) => getEffectiveIndex(a) - getEffectiveIndex(b));

    // If newPosition is -1, it means the task is being removed from this board
    if (newPosition === -1) {
      console.log(
        `📋 Removing task ${movedTaskId} from board ${boardId}, reordering remaining tasks`
      );

      // Update local indices for remaining tasks
      setLocalTaskIndices((prevIndices) => {
        const newIndices = new Map(prevIndices);

        boardTasks.forEach((task, index) => {
          const newIndex = (index + 1) * 10; // Use spacing of 10
          newIndices.set(task.id, newIndex);
          console.log(`  ${index}: ${task.taskName} -> index ${newIndex}`);
        });

        // Remove the moved task from local indices if it was there
        newIndices.delete(movedTaskId);

        return newIndices;
      });

      console.log(`✅ Board ${boardId} cleanup complete`);
      return;
    }

    // Get the moved task
    const movedTask = DataTasks.find((task) => task.id === movedTaskId);
    if (!movedTask) {
      console.error(`❌ Moved task ${movedTaskId} not found`);
      return;
    }

    // Create new ordered list with moved task inserted at new position
    const newOrderedTasks = [...boardTasks];
    newOrderedTasks.splice(newPosition, 0, movedTask);

    console.log(`📋 New task order for board ${boardId}:`);

    // Update local indices for all tasks in this board
    setLocalTaskIndices((prevIndices) => {
      const newIndices = new Map(prevIndices);

      newOrderedTasks.forEach((task, index) => {
        const newIndex = (index + 1) * 10; // Use spacing of 10
        newIndices.set(task.id, newIndex);
        console.log(`  ${index}: ${task.taskName} -> index ${newIndex}`);
      });

      return newIndices;
    });

    console.log(`✅ Board ${boardId} reordering complete`);
  };

  // LOCAL TASK MANAGEMENT - Handle task reordering locally without API calls
  // LOCAL TASK MANAGEMENT - Handle task reordering locally and track changes for API
  const handleMoveTaskLocal = (
    taskId: string,
    newBoardId: string,
    newIndex?: number
  ): boolean => {
    console.log("🚨 DEBUG: handleMoveTaskLocal CALLED!");
    console.log("🚨 DEBUG: Parameters:", { taskId, newBoardId, newIndex });
    console.log(
      "🚨 DEBUG: Current pendingTaskChanges length:",
      pendingTaskChanges.length
    );
    console.log(
      `🔄 LOCAL MOVE: Task ${taskId} to board ${newBoardId} at index ${newIndex}`
    );

    try {
      // Find the task and target board
      const taskToMove = DataTasks.find((task) => task.id === taskId);
      const targetBoard = DataBoard.find((board) => board.id === newBoardId);

      if (!taskToMove || !targetBoard) {
        console.error("❌ Task or board not found");
        return false;
      }

      const isSameBoard = taskToMove.boardId === newBoardId;
      const originalBoardId = taskToMove.boardId;

      // Calculate target position in the board
      let targetPosition = 0;
      let finalIndex = newIndex;

      if (typeof newIndex === "number") {
        // Use provided index
        const boardTasks = getTasksSortedByEffectiveIndex(newBoardId);
        const tasksBeforeIndex = boardTasks.filter(
          (task) => task.id !== taskId && getEffectiveIndex(task) < newIndex
        );
        targetPosition = tasksBeforeIndex.length;
        console.log(
          `📍 Calculated position ${targetPosition} from index ${newIndex}`
        );
      } else {
        // Default to end of board and calculate appropriate index
        const boardTasks = getTasksSortedByEffectiveIndex(newBoardId);
        const filteredTasks = boardTasks.filter((task) => task.id !== taskId);
        targetPosition = filteredTasks.length;

        // Calculate index for end position
        if (filteredTasks.length === 0) {
          finalIndex = 10; // First task
        } else {
          const lastTask = filteredTasks[filteredTasks.length - 1];
          finalIndex = getEffectiveIndex(lastTask) + 10;
        }

        console.log(
          `📍 Default position: ${targetPosition} (end of board), index: ${finalIndex}`
        );
      }

      // Update local task indices immediately for visual feedback
      setLocalTaskIndices((prevIndices) => {
        const newIndices = new Map(prevIndices);
        newIndices.set(taskId, finalIndex!);
        return newIndices;
      });

      // Add the main task change to pending changes
      console.log(
        "🚨 DEBUG: About to add pending change with finalIndex:",
        finalIndex
      );
      console.log("🚨 DEBUG: Task being moved:", taskToMove?.taskName);
      console.log("🚨 DEBUG: Target board:", targetBoard?.boardName);
      console.log("🚨 DEBUG: Original task index:", taskToMove?.indexTask);
      console.log("🚨 DEBUG: New calculated index:", finalIndex);
      addPendingTaskChange(taskId, newBoardId, finalIndex!);

      // Update task's board if moving to different board
      if (!isSameBoard) {
        setDataTasks((prevTasks) => {
          return prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                boardId: newBoardId,
                boardName: targetBoard.boardName,
                boardIndexStage: targetBoard.indexStage,
                boardCodeStage: targetBoard.boardCodeStage,
              };
            }
            return task;
          });
        });

        console.log(`📋 Task moved from ${originalBoardId} to ${newBoardId}`);

        // Add alignment changes for both boards
        addBoardAlignmentChanges(newBoardId, taskId);
        addBoardAlignmentChanges(originalBoardId, taskId);
      } else {
        // Same board - only need to align this board
        addBoardAlignmentChanges(newBoardId, taskId);
      }

      // Visual feedback
      setRecentlyMovedTaskId(taskId);
      setTimeout(() => {
        setRecentlyMovedTaskId(null);
      }, 1500);

      // Show different messages for same board vs cross board moves
      if (isSameBoard) {
        console.log(
          `✅ LOCAL MOVE: Task reordered within ${targetBoard.boardName} at position ${targetPosition}`
        );
      } else {
        console.log(
          `✅ LOCAL MOVE: Task moved to ${targetBoard.boardName} at position ${targetPosition}`
        );
      }

      // Show pending changes summary
      setTimeout(() => {
        getPendingChangesSummary();
      }, 100);

      console.log(
        "✅ Task moved locally. Auto-save will be triggered from addPendingTaskChange."
      );

      return true;
    } catch (error) {
      console.error("❌ LOCAL MOVE ERROR:", error);
      return false;
    }
  };

  // MOVE TASK UP - Move task one position up in the same board
  const handleMoveTaskUp = (taskId: string) => {
    const task = DataTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Get all tasks in the same board sorted by effective index
    const boardTasks = getTasksSortedByEffectiveIndex(task.boardId);
    const currentIndex = boardTasks.findIndex((t) => t.id === taskId);

    // Cant move up if already at the top
    if (currentIndex <= 0) return;

    const taskAbove = boardTasks[currentIndex - 1];
    const currentEffectiveIndex = getEffectiveIndex(task);
    const aboveEffectiveIndex = getEffectiveIndex(taskAbove);

    // Calculate new index to place task above the previous task
    let newIndex: number;
    if (currentIndex === 1) {
      // Moving to the top
      newIndex = Math.max(1, aboveEffectiveIndex - 10);
    } else {
      // Moving between two tasks
      const taskAboveAbove = boardTasks[currentIndex - 2];
      const aboveAboveEffectiveIndex = getEffectiveIndex(taskAboveAbove);
      newIndex = Math.floor(
        (aboveAboveEffectiveIndex + aboveEffectiveIndex) / 2
      );

      // Ensure we have a valid index
      if (newIndex <= aboveAboveEffectiveIndex) {
        newIndex = aboveAboveEffectiveIndex + 1;
      }
      if (newIndex >= aboveEffectiveIndex) {
        newIndex = aboveEffectiveIndex - 1;
      }
    }

    console.log(
      `🔼 Moving task ${taskId} UP: ${currentEffectiveIndex} → ${newIndex}`
    );
    handleMoveTaskLocal(taskId, task.boardId, newIndex);
  };

  // MOVE TASK DOWN - Move task one position down in the same board
  const handleMoveTaskDown = (taskId: string) => {
    const task = DataTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Get all tasks in the same board sorted by effective index
    const boardTasks = getTasksSortedByEffectiveIndex(task.boardId);
    const currentIndex = boardTasks.findIndex((t) => t.id === taskId);

    // Cant move down if already at the bottom
    if (currentIndex >= boardTasks.length - 1) return;

    const taskBelow = boardTasks[currentIndex + 1];
    const currentEffectiveIndex = getEffectiveIndex(task);
    const belowEffectiveIndex = getEffectiveIndex(taskBelow);

    // Calculate new index to place task below the next task
    let newIndex: number;
    if (currentIndex === boardTasks.length - 2) {
      // Moving to the bottom
      newIndex = belowEffectiveIndex + 10;
    } else {
      // Moving between two tasks
      const taskBelowBelow = boardTasks[currentIndex + 2];
      const belowBelowEffectiveIndex = getEffectiveIndex(taskBelowBelow);
      newIndex = Math.floor(
        (belowEffectiveIndex + belowBelowEffectiveIndex) / 2
      );

      // Ensure we have a valid index
      if (newIndex <= belowEffectiveIndex) {
        newIndex = belowEffectiveIndex + 1;
      }
      if (newIndex >= belowBelowEffectiveIndex) {
        newIndex = belowBelowEffectiveIndex - 1;
      }
    }

    console.log(
      `🔽 Moving task ${taskId} DOWN: ${currentEffectiveIndex} → ${newIndex}`
    );
    handleMoveTaskLocal(taskId, task.boardId, newIndex);
  };
  // IMPROVED INDEX CALCULATION for precise positioning
  const calculatePreciseIndex = (
    targetBoardId: string,
    insertPosition: number,
    excludeTaskId?: string
  ): number => {
    // Get tasks in target board (excluding the task being moved)
    const boardTasks = DataTasks.filter(
      (task) => task.boardId === targetBoardId && task.id !== excludeTaskId
    );

    console.log(`📊 Board ${targetBoardId} has ${boardTasks.length} tasks`);
    console.log(`📍 Insert position: ${insertPosition}`);

    // If empty board
    if (boardTasks.length === 0) {
      console.log(`📍 Empty board, using index: 10`);
      return 10;
    }

    // If inserting at the beginning
    if (insertPosition <= 0) {
      const firstIndex = boardTasks[0].indexTask;
      const newIndex = Math.max(1, firstIndex - 10);
      console.log(`📍 Beginning insertion, using index: ${newIndex}`);
      return newIndex;
    }

    // If inserting at the end
    if (insertPosition >= boardTasks.length) {
      const lastIndex = boardTasks[boardTasks.length - 1].indexTask;
      const newIndex = lastIndex + 10;
      console.log(`📍 End insertion, using index: ${newIndex}`);
      return newIndex;
    }

    // If inserting in the middle
    const prevTask = boardTasks[insertPosition - 1];
    const nextTask = boardTasks[insertPosition];

    if (prevTask && nextTask) {
      const gap = nextTask.indexTask - prevTask.indexTask;

      if (gap > 2) {
        // Enough space, use midpoint
        const newIndex = Math.floor(
          (prevTask.indexTask + nextTask.indexTask) / 2
        );
        console.log(
          `📍 Middle insertion with gap ${gap}, using index: ${newIndex}`
        );
        return newIndex;
      } else {
        // Not enough space, use fallback
        console.log(`📍 Insufficient gap (${gap}), using fallback`);
        return insertPosition * 10 + 10;
      }
    }

    // Fallback
    console.log(`📍 Fallback, using index: ${insertPosition * 10 + 10}`);
    return insertPosition * 10 + 10;
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId && backlogId) {
      setIsLoadingProcess(true);
      const GetDetailProject = async () => {
        if (!projectId) {
          console.error("❌ Cannot load project data: projectId is null");
          return;
        }

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

          const itemsData: ProjectDataResponse = requestData!
            .data as ProjectDataResponse;

          setDataProject(itemsData);
          setIsLoadingProcess(false);
        }
      };

      const GetDetailBacklog = async () => {
        if (!backlogId) {
          console.error("❌ Cannot load backlog data: backlogId is null");
          return;
        }

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

          setHeaderContentState({
            titleName: `${itemsData.backlogName}`,
            breadCrumb: ["Home", "Kanban", `Feature ${itemsData.backlogName}`],
          });

          setDataBacklog(itemsData);
          setIsLoadingProcess(false);
        }
      };

      const GetListTaskKanban = async () => {
        if (!backlogId) {
          console.error("❌ Cannot load board data: backlogId is null");
          return;
        }

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
          search: SerachTasks,
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
          initializeLocalIndices(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDetailProject();
      GetDetailBacklog();
      GetListTaskKanban();
      GetListTasks();
    }
  }, [DataAuth, projectId, backlogId, tokenData]);

  // Task list refresh ONLY - when RefreshData or search changes
  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId && backlogId && tokenData) {
      const GetListTasks = async () => {
        console.log("🔄 Refreshing task list and board data (optimized)...");
        setIsLoadingProcess(true);

        // First refresh board data
        if (backlogId && tokenData) {
          try {
            const requestTaskBoard = await ListTasksBoard(backlogId, tokenData);
            if (
              requestTaskBoard?.statusCode === RES_CODE_OK &&
              requestTaskBoard.data
            ) {
              const itemsData: TaskBoardViewModel[] =
                requestTaskBoard.data as TaskBoardViewModel[];
              console.log(
                "✅ Board data refreshed:",
                itemsData.length,
                "boards"
              );
              setDataBoard(itemsData);
            } else {
              console.log("📋 No board data available");
              setDataBoard([]);
            }
          } catch (error) {
            console.error("❌ Failed to refresh board data:", error);
          }
        }

        // Then refresh task data
        const PayloadGetTaskList: PaggingListPayload = {
          search: SerachTasks,
          limit: MAX_SIZE_TABLE,
          page: 0,
          filterWhere: [
            {
              field: "backlogId",
              operator: "=",
              value: backlogId,
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
          } else {
            const itemsData: TaskViewModel[] =
              requestTaskBoard.data as TaskViewModel[];

            console.log("✅ Task positions after refresh:");
            itemsData.forEach((task) => {
              console.log(
                `Task ${task.taskName} (${task.id}): board=${task.boardId}, index=${task.indexTask}`
              );
            });

            setDataTasks(itemsData);
            initializeLocalIndices(itemsData);
          }
        }
        setIsLoadingProcess(false);

        loadArchivedTasks;
      };

      GetListTasks();
    }
  }, [DataAuth, RefreshData, SerachTasks, projectId, backlogId, tokenData]);

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
          );

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

  const loadArchivedTasks = async () => {
    if (!DataAuth || !tokenData || !backlogId) return;

    setIsLoadingArchived(true);
    try {
      const PayloadGetArchivedTasks: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "backlogId",
            operator: "=",
            value: backlogId,
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

  const RefreshAction = () => {
    setSerachTasks("");
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
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

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} py={2}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
          <Flex
            w={"full"}
            as={Wrap}
            spacing={2}
            overflowX={"auto"}
            justifyContent={"start"}
          >
            <Link href={getKanbanBackUrl(searchParams.get("from"), projectId!)}>
              <Button size={"lg"} leftIcon={<FiArrowLeft />}>
                {getKanbanBackLabel(searchParams.get("from"))}
              </Button>
            </Link>
          </Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
          <Flex w={"full"} as={HStack} justifyContent={"end"} h={"full"}>
            {/* MANUAL SAVE BUTTON: Show when there are pending changes or auto-save failed */}
            {pendingTaskChanges.length > 0 && (
              <Button
                size="lg"
                colorScheme={isAutoSaving ? "yellow" : "blue"}
                leftIcon={isAutoSaving ? <Spinner size="sm" /> : <FiSave />}
                onClick={async () => {
                  console.log("💾 Manual save button clicked");
                  try {
                    const saveResult = await sendPendingChangesToAPI();
                  } catch (error) {}
                }}
                ml={3}
                isDisabled={isAutoSaving}
              >
                {isAutoSaving
                  ? `Auto-saving ${pendingTaskChanges.length} change${
                      pendingTaskChanges.length !== 1 ? "s" : ""
                    }...`
                  : `${pendingTaskChanges.length} Change${
                      pendingTaskChanges.length !== 1 ? "s" : ""
                    } (Auto-save in ${AUTO_SAVE_DELAY / 1000}s)`}
              </Button>
            )}
            <Button size={"lg"} colorScheme="secondary" display={"none"}>
              {EditMode ? "Edit Mode" : "View Mode"}
            </Button>
          </Flex>
        </GridItem>
      </Grid>

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Flex
            as={HStack}
            w={"full"}
            px={4}
            py={3}
            rounded={radiusStyle}
            bgColor={colorMode === "light" ? "white" : "gray.800"}
            boxShadow={"sm"}
            justifyContent={"space-between"}
          >
            <Flex as={HStack}>
              <ButtonGroup isAttached variant="outline">
                <Flex
                  as={Button}
                  px={3}
                  py={2}
                  cursor={"pointer"}
                  _hover={{
                    bgColor: "secondary.200",
                    color: "secondary.500",
                  }}
                  _active={{
                    color: "secondary.500",
                    bgColor: "transparent",
                  }}
                  isActive={true}
                  leftIcon={<FiTrello />}
                >
                  Board
                </Flex>
              </ButtonGroup>

              <Box>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    id="serachTask"
                    name="serachTask"
                    type="text"
                    onChange={(e) => {
                      setSerachTasks(e.target.value);
                    }}
                    value={SerachTasks}
                    placeholder={`Cari Task`}
                  />
                </InputGroup>
              </Box>
            </Flex>
            <Flex as={HStack}>
              <Flex
                as={Button}
                variant="outline"
                px={3}
                py={2}
                cursor={"pointer"}
                _hover={{
                  bgColor: "secondary.200",
                  color: "secondary.500",
                }}
                _active={{
                  color: "secondary.500",
                  bgColor: "transparent",
                }}
                isActive={false}
                leftIcon={<FiInbox />}
                onClick={() => {
                  setIsArchivedDrawerOpen(true);
                  loadArchivedTasks();
                }}
              >
                Archived
              </Flex>
              <Flex
                as={Button}
                variant="outline"
                px={3}
                py={2}
                cursor={"pointer"}
                colorScheme={"secondary"}
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
              >
                Refresh
              </Flex>
            </Flex>
          </Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <DndProvider backend={HTML5Backend}>
            <Flex
              as={HStack}
              spacing={5}
              w={"full"}
              justifyContent={"start"}
              alignItems={"start"}
              overflowX="auto"
              py={2}
            >
              {DataBoard.length > 0 ? (
                DataBoard.map((board) => (
                  <DroppableBoard
                    key={board.id}
                    board={board}
                    tasks={DataTasks.filter(
                      (task) => task.boardId === board.id
                    )}
                    onMoveTask={handleMoveTask}
                    onPositionedMove={handleMoveTaskLocal}
                    getEffectiveIndex={getEffectiveIndex}
                    setDropPreview={setDropPreview}
                  >
                    <Flex
                      as={HStack}
                      spacing={2}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      rounded={radiusStyle}
                      boxShadow={"sm"}
                      px={5}
                      py={3}
                    >
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
                      minH="500px"
                      maxH="calc(75vh - 100px)"
                      overflowY="auto"
                      w="full"
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      rounded={radiusStyle}
                      boxShadow={"sm"}
                      p={5}
                    >
                      {/* If this is the first task and we have a drop preview for this board at the beginning */}
                      {dropPreview &&
                        dropPreview.boardId === board.id &&
                        dropPreview.beforeTaskId ===
                          (getTasksSortedByEffectiveIndex(board.id).length > 0
                            ? DataTasks.filter(
                                (task) => task.boardId === board.id
                              )[0].id
                            : null) && <DropPreviewIndicator />}

                      {/* Filter tasks by boardId, sort by indexTask, and map them */}
                      {DataTasks &&
                        getTasksSortedByEffectiveIndex(board.id).map(
                          (task, index, sortedTasks) => (
                            <React.Fragment key={task.id}>
                              <DraggableTaskCard
                                task={task}
                                onMoveTask={handleMoveTask}
                                onPositionedMove={handleMoveTaskLocal}
                                getEffectiveIndex={getEffectiveIndex}
                                isRecentlyMoved={
                                  task.id === recentlyMovedTaskId
                                }
                                DataProject={DataProject}
                                localTaskIndices={localTaskIndices}
                                onMoveUp={handleMoveTaskUp}
                                onMoveDown={handleMoveTaskDown}
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
                          )
                        )}

                      {/* If this is an empty board or we're dropping at the end */}
                      {(getTasksSortedByEffectiveIndex(board.id).length === 0 ||
                        (dropPreview &&
                          dropPreview.boardId === board.id &&
                          dropPreview.afterTaskId ===
                            DataTasks.filter(
                              (task) => task.boardId === board.id
                            ).slice(-1)[0]?.id)) && (
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
              ) : (
                <Flex
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  w="full"
                  rounded={radiusStyle}
                  boxShadow="sm"
                  py={20}
                  px={8}
                  direction="column"
                  align="center"
                  justify="center"
                  minH="400px"
                >
                  <Text
                    fontSize="lg"
                    color="gray.500"
                    textAlign="center"
                    mb={6}
                    fontWeight="medium"
                  >
                    Fitur ini belum mempunyai Kanban Board
                  </Text>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleGenerateKanbanBoard}
                    isLoading={IsLoadingProcess}
                    loadingText="Membuat Kanban..."
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="semibold"
                  >
                    Buat Kanban
                  </Button>
                </Flex>
              )}
            </Flex>
          </DndProvider>
        </GridItem>
      </Grid>

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
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    onMoveTask={() => {}}
                    isRecentlyMoved={false}
                    DataProject={DataProject}
                    getEffectiveIndex={() => 0}
                    localTaskIndices={new Map()}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    isDragDisabled={true}
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
    </LayoutAdmin>
  );
}

export default KanbanBacklogPage;
