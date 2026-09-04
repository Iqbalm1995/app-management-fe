"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiTrello,
  FiLayers,
  FiCheck,
  FiTrash2,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTasks, {
  TaskBoardViewModel,
  TaskViewModel,
  CreateSimpleTaskPayload,
  TaskMovePayload,
  TaskItemResponse,
  TaskCommentResponse,
  GenerateTaskBoardPayload,
  TaskUpdatePayload,
} from "@/app/services/useTasks";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import DevFloatingTopbar from "../components/DevFloatingTopbar";
import DevKanbanColumn from "./components/DevKanbanColumn";

interface SelectedProjectStorage {
  id: string;
  projectNo: string;
  projectName: string;
  projectStatus: string;
  backlogId?: string | null;
}

export default function DevKanbanView() {
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Task services
  const {
    ListTasksBoard,
    ListTasksPaged,
    MoveTask,
    CreateSimpleTask,
    GenerateKanbanBoard,
    ListTaskItems,
    CreateTaskItem,
    UpdateTaskItem,
    DeleteTaskItem,
    ListTaskComments,
    CreateTaskComment,
    UpdateTask,
  } = useTasks();

  const { GetDetailById: GetProjectDetail } = useProjects();
  const { ListBacklog } = useRequirements();

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

  // Kanban boards and tasks
  const [boards, setBoards] = useState<TaskBoardViewModel[]>([]);
  const [tasks, setTasks] = useState<TaskViewModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
  }, []);

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
          if (!currentBacklogId && backlogRes.data.length > 0) {
            const firstBacklogId = backlogRes.data[0].id;
            setCurrentBacklogId(firstBacklogId);

            // Update localStorage
            const updated = { ...selectedProject, backlogId: firstBacklogId };
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

  // Fetch Kanban board & tasks whenever currentBacklogId changes
  const loadKanbanData = useCallback(async () => {
    if (!currentBacklogId || !tokenData) {
      setIsLoadingBoards(false);
      return;
    }

    setIsLoadingBoards(true);
    try {
      // 1. Fetch Board Columns
      const boardRes = await ListTasksBoard(currentBacklogId, tokenData);
      if (boardRes?.statusCode === RES_CODE_OK && Array.isArray(boardRes.data)) {
        setBoards(boardRes.data);
      } else {
        setBoards([]);
      }

      // 2. Fetch Tasks list
      const taskRes = await ListTasksPaged(
        {
          search: "",
          limit: 300,
          page: 0,
          filterWhere: [
            {
              field: "backlogId",
              operator: "=",
              value: currentBacklogId,
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
    } catch (err) {
      console.error("Failed to load kanban data:", err);
    } finally {
      setIsLoadingBoards(false);
    }
  }, [currentBacklogId, tokenData]);

  useEffect(() => {
    loadKanbanData();
  }, [loadKanbanData]);

  // Handle switching backlog via selector
  const handleBacklogChange = (backlogId: string) => {
    setCurrentBacklogId(backlogId);
    if (selectedProject) {
      const updated = { ...selectedProject, backlogId };
      setSelectedProject(updated);
      localStorage.setItem("dev_selected_project", JSON.stringify(updated));
    }
  };

  // Generate board handler if none exists
  const handleGenerateBoard = async () => {
    if (!currentBacklogId || !selectedProject?.id || !tokenData) {
      showToast({
        description: "Missing project or backlog to generate board",
        statusToast: "error",
      });
      return;
    }

    setIsGeneratingBoard(true);
    try {
      const payload: GenerateTaskBoardPayload = {
        backlogId: currentBacklogId,
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

  // Inline Add Task handler
  const handleAddTask = async (
    boardId: string,
    taskName: string
  ): Promise<boolean> => {
    if (!selectedProject?.id || !currentBacklogId || !tokenData) return false;

    try {
      const payload: CreateSimpleTaskPayload = {
        backlogId: currentBacklogId,
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

  // Open task detail
  const handleTaskClick = async (task: TaskViewModel) => {
    setActiveTask(task);
    onDetailOpen();
    setIsLoadingTaskDetails(true);

    try {
      const [itemsRes, commentsRes] = await Promise.all([
        ListTaskItems(task.id, tokenData),
        ListTaskComments(task.id, tokenData),
      ]);

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
        const refreshed = await ListTaskItems(activeTask.id, tokenData);
        if (refreshed?.statusCode === RES_CODE_OK && Array.isArray(refreshed.data)) {
          setTaskItems(refreshed.data);
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

  // Filter tasks by search keyword
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const lower = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.taskName?.toLowerCase().includes(lower) ||
        t.taskCode?.toLowerCase().includes(lower)
    );
  }, [tasks, searchTerm]);

  // Total task & done counts
  const totalTasksCount = tasks.length;
  const doneTasksCount = tasks.filter((t) => {
    const board = boards.find((b) => b.id === t.boardId);
    return board?.boardCodeStage === "DONE" || t.isCompleted === "Y";
  }).length;

  if (!selectedProject?.id) {
    return (
      <Box minH="100vh">
        <DevFloatingTopbar showBack backHref="/dev" backLabel="Projects" />
        <Flex
          pt="120px"
          direction="column"
          align="center"
          justify="center"
          gap={4}
          px={6}
        >
          <Text fontSize="lg" fontWeight={600}>
            No project selected
          </Text>
          <Text fontSize="sm" color="gray.500">
            Please pick a project first to open its developer kanban board.
          </Text>
          <Link href="/dev">
            <Button colorScheme="purple" size="sm">
              Go to Project Selector
            </Button>
          </Link>
        </Flex>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box minH="100vh" pb={8}>
        {/* Topbar */}
        <DevFloatingTopbar
          projectName={`${selectedProject.projectNo} - ${selectedProject.projectName}`}
          showBack
          backHref="/dev"
          backLabel="Projects"
        />

        {/* Main Content Area */}
        <Box pt={{ base: "74px", md: "80px" }} px={{ base: 4, md: 6 }}>
          {/* Action / Toolbar strip */}
          <Flex
            mb={4}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
            bg={isDark ? "gray.900" : "white"}
            p={3}
            borderRadius="xl"
            border="1px solid"
            borderColor={isDark ? "gray.800" : "gray.200"}
          >
            {/* Left: Backlog selector and quick counts */}
            <HStack spacing={3} flexWrap="wrap">
              {backlogs.length > 1 ? (
                <Select
                  size="sm"
                  w="220px"
                  borderRadius="lg"
                  value={currentBacklogId}
                  onChange={(e) => handleBacklogChange(e.target.value)}
                >
                  {backlogs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.backlogCode || b.backlogName}
                    </option>
                  ))}
                </Select>
              ) : (
                <HStack spacing={2}>
                  <Badge colorScheme="purple" variant="subtle" fontSize="2xs">
                    BACKLOG
                  </Badge>
                  <Text fontSize="xs" fontWeight={600} noOfLines={1}>
                    {backlogs[0]?.backlogName || "Default Backlog"}
                  </Text>
                </HStack>
              )}

              <HStack spacing={2}>
                <Badge
                  colorScheme="gray"
                  variant="subtle"
                  fontSize="2xs"
                  fontFamily="mono"
                  px={2}
                >
                  {totalTasksCount} tasks
                </Badge>
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="2xs"
                  fontFamily="mono"
                  px={2}
                >
                  {doneTasksCount} done
                </Badge>
              </HStack>
            </HStack>

            {/* Right: Search & Refresh */}
            <HStack spacing={2} w={{ base: "full", md: "auto" }}>
              <InputGroup size="sm" w={{ base: "full", md: "240px" }}>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Filter tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="lg"
                />
              </InputGroup>

              <IconButton
                aria-label="Refresh board"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                onClick={loadKanbanData}
                isLoading={isLoadingBoards}
              />
            </HStack>
          </Flex>

          {/* Kanban Board Container */}
          {isLoadingBoards ? (
            <Flex justify="center" align="center" minH="400px" direction="column" gap={3}>
              <Spinner size="lg" color="purple.500" thickness="3px" />
              <Text fontSize="sm" color="gray.500">
                Loading Kanban board...
              </Text>
            </Flex>
          ) : boards.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={12}
              borderRadius="2xl"
              border="1px dashed"
              borderColor={isDark ? "gray.800" : "gray.200"}
              bg={isDark ? "gray.900" : "white"}
              minH="350px"
              textAlign="center"
              gap={3}
            >
              <Flex
                w="52px"
                h="52px"
                borderRadius="xl"
                bg={isDark ? "gray.800" : "gray.100"}
                align="center"
                justify="center"
                color="purple.400"
              >
                <FiTrello size={26} />
              </Flex>
              <Text fontWeight={700} fontSize="lg">
                No Kanban Board Generated
              </Text>
              <Text fontSize="sm" color="gray.500" maxW="420px">
                This backlog does not have a task board initialized yet. You can
                generate the standard workflow columns now.
              </Text>
              <Button
                colorScheme="purple"
                size="sm"
                leftIcon={<FiPlus />}
                onClick={handleGenerateBoard}
                isLoading={isGeneratingBoard}
                mt={2}
              >
                Generate Kanban Board
              </Button>
            </Flex>
          ) : (
            <Flex
              gap={4}
              overflowX="auto"
              pb={4}
              align="start"
              sx={{
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: isDark ? "gray.700" : "gray.300",
                  borderRadius: "4px",
                },
              }}
            >
              {boards.map((board) => {
                const boardTasks = filteredTasks.filter(
                  (t) => t.boardId === board.id
                );

                return (
                  <DevKanbanColumn
                    key={board.id}
                    board={board}
                    tasks={boardTasks}
                    onMoveTask={handleMoveTask}
                    onAddTask={handleAddTask}
                    onTaskClick={handleTaskClick}
                    recentlyMovedTaskId={recentlyMovedTaskId}
                  />
                );
              })}
            </Flex>
          )}
        </Box>

        {/* Task Detail Modal */}
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="2xl"
          isCentered
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
          <ModalContent
            bg={isDark ? "gray.900" : "white"}
            borderRadius="2xl"
            border="1px solid"
            borderColor={isDark ? "gray.800" : "gray.200"}
          >
            <ModalHeader pb={2}>
              <HStack justify="space-between" pr={6}>
                <HStack spacing={2}>
                  <Badge
                    fontFamily="mono"
                    colorScheme="purple"
                    variant="subtle"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                  >
                    {activeTask?.taskCode || "TASK"}
                  </Badge>
                  <Text fontSize="md" fontWeight={700} noOfLines={1}>
                    {activeTask?.taskName}
                  </Text>
                </HStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody pt={2}>
              {isLoadingTaskDetails ? (
                <Flex justify="center" align="center" minH="220px">
                  <Spinner size="md" color="purple.500" />
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  {/* Task Meta details */}
                  <HStack spacing={4} fontSize="xs" color="gray.500" flexWrap="wrap">
                    <HStack>
                      <Text fontWeight={600}>Priority:</Text>
                      <Badge size="sm" variant="subtle">
                        {activeTask?.taskPriority || "Normal"}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight={600}>Stage:</Text>
                      <Badge size="sm" variant="outline" colorScheme="purple">
                        {activeTask?.boardName || "Board"}
                      </Badge>
                    </HStack>
                    {activeTask?.startDate && (
                      <HStack>
                        <Text fontWeight={600}>Start:</Text>
                        <Text fontFamily="mono">{activeTask.startDate}</Text>
                      </HStack>
                    )}
                  </HStack>

                  {activeTask?.taskDesc && (
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={isDark ? "gray.850" : "gray.50"}
                      border="1px solid"
                      borderColor={isDark ? "gray.800" : "gray.200"}
                    >
                      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1}>
                        DESCRIPTION
                      </Text>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {activeTask.taskDesc}
                      </Text>
                    </Box>
                  )}

                  <Divider borderColor={isDark ? "gray.800" : "gray.200"} />

                  {/* Tabs: Checklist & Comments */}
                  <Tabs colorScheme="purple" size="sm" isFitted>
                    <TabList>
                      <Tab fontWeight={600}>
                        Checklist ({taskItems.length})
                      </Tab>
                      <Tab fontWeight={600}>
                        Comments ({taskComments.length})
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* Checklist Panel */}
                      <TabPanel px={0} pt={4}>
                        <VStack spacing={2.5} align="stretch">
                          {taskItems.map((item) => (
                            <HStack
                              key={item.id}
                              p={2.5}
                              borderRadius="md"
                              bg={isDark ? "gray.850" : "gray.50"}
                              border="1px solid"
                              borderColor={isDark ? "gray.800" : "gray.200"}
                              justify="space-between"
                            >
                              <Checkbox
                                isChecked={item.isDone === "Y"}
                                colorScheme="purple"
                                onChange={() =>
                                  handleToggleChecklistItem(
                                    item.id,
                                    item.isDone,
                                    item.taskItemName
                                  )
                                }
                              >
                                <Text
                                  fontSize="sm"
                                  textDecoration={
                                    item.isDone === "Y"
                                      ? "line-through"
                                      : "none"
                                  }
                                  color={
                                    item.isDone === "Y" ? "gray.400" : undefined
                                  }
                                >
                                  {item.taskItemName}
                                </Text>
                              </Checkbox>

                              <IconButton
                                aria-label="Delete item"
                                icon={<FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() =>
                                  handleDeleteChecklistItem(item.id)
                                }
                              />
                            </HStack>
                          ))}

                          {taskItems.length === 0 && (
                            <Text fontSize="xs" color="gray.500" py={2}>
                              No subtask items yet.
                            </Text>
                          )}

                          {/* Add item input */}
                          <HStack pt={2}>
                            <Input
                              size="sm"
                              placeholder="Add checklist item..."
                              value={newChecklistText}
                              onChange={(e) =>
                                setNewChecklistText(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddChecklistItem();
                                }
                              }}
                              borderRadius="md"
                            />
                            <Button
                              size="sm"
                              colorScheme="purple"
                              onClick={handleAddChecklistItem}
                              isLoading={isAddingItem}
                              isDisabled={!newChecklistText.trim()}
                            >
                              Add
                            </Button>
                          </HStack>
                        </VStack>
                      </TabPanel>

                      {/* Comments Panel */}
                      <TabPanel px={0} pt={4}>
                        <VStack spacing={3} align="stretch">
                          {taskComments.map((com) => (
                            <Box
                              key={com.id}
                              p={3}
                              borderRadius="lg"
                              bg={isDark ? "gray.850" : "gray.50"}
                              border="1px solid"
                              borderColor={isDark ? "gray.800" : "gray.200"}
                            >
                              <HStack justify="space-between" mb={1.5}>
                                <HStack spacing={2}>
                                  <Avatar
                                    size="2xs"
                                    name={com.userCreated?.nama || "User"}
                                    src={com.userCreated?.profilePict || undefined}
                                  />
                                  <Text fontSize="xs" fontWeight={600}>
                                    {com.userCreated?.nama || "User"}
                                  </Text>
                                </HStack>
                                <Text fontSize="2xs" color="gray.400">
                                  {com.createdAt ? com.createdAt.slice(0, 10) : ""}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color={isDark ? "gray.200" : "gray.700"}>
                                {com.comCaptions}
                              </Text>
                            </Box>
                          ))}

                          {taskComments.length === 0 && (
                            <Text fontSize="xs" color="gray.500" py={2}>
                              No comments yet.
                            </Text>
                          )}

                          {/* Add comment */}
                          <HStack pt={2} align="end">
                            <Textarea
                              size="sm"
                              placeholder="Write a comment..."
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              rows={2}
                              borderRadius="md"
                            />
                            <IconButton
                              aria-label="Send comment"
                              icon={<FiSend />}
                              colorScheme="purple"
                              size="sm"
                              onClick={handleAddComment}
                              isLoading={isAddingComment}
                              isDisabled={!newCommentText.trim()}
                            />
                          </HStack>
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter pt={2}>
              <Button size="sm" onClick={onDetailClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DndProvider>
  );
}
