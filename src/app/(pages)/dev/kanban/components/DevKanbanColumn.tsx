"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  useColorMode,
} from "@chakra-ui/react";
import { useDrop } from "react-dnd";
import { TaskBoardViewModel, TaskViewModel } from "@/app/services/useTasks";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import DevKanbanCard from "./DevKanbanCard";
import { FiPlus, FiX, FiInbox } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface DevKanbanColumnProps {
  board: TaskBoardViewModel;
  tasks: TaskViewModel[];
  onMoveTask: (taskId: string, targetBoardId: string) => void;
  onAddTask: (boardId: string, taskName: string) => Promise<boolean>;
  onTaskClick: (task: TaskViewModel) => void;
  recentlyMovedTaskId?: string | null;
  isCompactView?: boolean;
  dataBacklogs?: BacklogDataResponse[];
  onOpenCreateModal?: (boardId: string) => void;
}

const stageThemeMap: Record<
  string,
  {
    barColor: string;
    badgeScheme: string;
    headerBgDark: string;
    headerBgLight: string;
    borderColorDark: string;
    borderColorLight: string;
    iconColor: string;
  }
> = {
  TODO: {
    barColor: "#818cf8",
    badgeScheme: "purple",
    headerBgDark: "linear-gradient(180deg, rgba(129, 140, 248, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
    headerBgLight: "linear-gradient(180deg, rgba(129, 140, 248, 0.08) 0%, rgba(248, 250, 252, 0.95) 100%)",
    borderColorDark: "rgba(129, 140, 248, 0.18)",
    borderColorLight: "rgba(129, 140, 248, 0.2)",
    iconColor: "#818cf8",
  },
  INPROGRESS: {
    barColor: "#f59e0b",
    badgeScheme: "orange",
    headerBgDark: "linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
    headerBgLight: "linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(254, 252, 232, 0.95) 100%)",
    borderColorDark: "rgba(245, 158, 11, 0.25)",
    borderColorLight: "rgba(245, 158, 11, 0.25)",
    iconColor: "#f59e0b",
  },
  REVIEW: {
    barColor: "#ec4899",
    badgeScheme: "pink",
    headerBgDark: "linear-gradient(180deg, rgba(236, 72, 153, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
    headerBgLight: "linear-gradient(180deg, rgba(236, 72, 153, 0.08) 0%, rgba(253, 242, 248, 0.95) 100%)",
    borderColorDark: "rgba(236, 72, 153, 0.18)",
    borderColorLight: "rgba(236, 72, 153, 0.2)",
    iconColor: "#ec4899",
  },
  DONE: {
    barColor: "#10b981",
    badgeScheme: "green",
    headerBgDark: "linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
    headerBgLight: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(240, 253, 244, 0.95) 100%)",
    borderColorDark: "rgba(16, 185, 129, 0.18)",
    borderColorLight: "rgba(16, 185, 129, 0.2)",
    iconColor: "#10b981",
  },
};

export const DevKanbanColumn: React.FC<DevKanbanColumnProps> = ({
  board,
  tasks,
  onMoveTask,
  onAddTask,
  onTaskClick,
  recentlyMovedTaskId,
  isCompactView = false,
  dataBacklogs = [],
  onOpenCreateModal,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const dropRef = useRef<HTMLDivElement>(null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: (item: { id: string; boardId: string }) => {
      if (item.boardId !== board.id) {
        onMoveTask(item.id, board.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drop(dropRef);

  const stageTheme =
    stageThemeMap[board.boardCodeStage] ||
    (board.boardName?.toUpperCase().includes("TODO") || board.boardName?.toUpperCase() === "TO DO"
      ? stageThemeMap.TODO
      : board.boardName?.toUpperCase().includes("PROGRESS")
      ? stageThemeMap.INPROGRESS
      : board.boardName?.toUpperCase().includes("REVIEW")
      ? stageThemeMap.REVIEW
      : board.boardName?.toUpperCase().includes("DONE")
      ? stageThemeMap.DONE
      : {
          barColor: "#8b5cf6",
          badgeScheme: "purple",
          headerBgDark: "linear-gradient(180deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
          headerBgLight: "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(250, 245, 255, 0.95) 100%)",
          borderColorDark: "rgba(139, 92, 246, 0.18)",
          borderColorLight: "rgba(139, 92, 246, 0.2)",
          iconColor: "#8b5cf6",
        });

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const success = await onAddTask(board.id, newTaskName.trim());
      if (success) {
        setNewTaskName("");
        setIsAddingTask(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTask();
    } else if (e.key === "Escape") {
      setIsAddingTask(false);
      setNewTaskName("");
    }
  };

  return (
    <Card
      size="sm"
      variant="outline"
      boxShadow={isOver ? "lg" : isDark ? "md" : "sm"}
      _hover={{ boxShadow: "xl" }}
      bg={isDark ? "rgba(15, 23, 42, 0.75)" : "white"}
      backdropFilter="blur(16px)"
      minH="600px"
      w="full"
      transition="all 0.2s ease"
      rounded={radiusStyle}
      overflow="hidden"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={
        isOver
          ? "blue.400"
          : isDark
          ? "rgba(255, 255, 255, 0.08)"
          : "gray.200"
      }
      style={{
        borderTopWidth: "3px",
        borderTopStyle: "solid",
        borderTopColor: stageTheme.barColor,
      }}
      sx={{
        borderTopWidth: "3px !important",
        borderTopStyle: "solid !important",
        borderTopColor: `${stageTheme.barColor} !important`,
      }}
    >
      <div
        ref={dropRef}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "600px",
        }}
      >
        {/* Column Header: calibrated subtle tint wash (not bland, not over gradient) */}
        <CardHeader
          bg={isDark ? stageTheme.headerBgDark : stageTheme.headerBgLight}
          borderBottom="1px solid"
          borderColor={isDark ? stageTheme.borderColorDark : stageTheme.borderColorLight}
          px={3.5}
          py={3}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={2} align="center">
              <Badge
                colorScheme={stageTheme.badgeScheme}
                variant="subtle"
                fontSize="xs"
                fontWeight={700}
                borderRadius="md"
                px={2.5}
                py={0.5}
                letterSpacing="0.04em"
                textTransform="uppercase"
              >
                {board.boardName}
              </Badge>
              <Text
                fontSize="xs"
                fontWeight={600}
                color={isDark ? "gray.400" : "gray.500"}
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tasks.length}
              </Text>
            </HStack>

            <IconButton
              aria-label="Add task"
              icon={<FiPlus size={14} />}
              size="xs"
              variant="ghost"
              borderRadius="md"
              color={isDark ? "gray.400" : "gray.600"}
              _hover={{
                bg: isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200",
                color: isDark ? "white" : "gray.900",
              }}
              onClick={() => {
                if (onOpenCreateModal) {
                  onOpenCreateModal(board.id);
                } else {
                  setIsAddingTask(true);
                }
              }}
            />
          </HStack>
        </CardHeader>

        {/* Scrollable Column Body */}
        <CardBody flex={1} p={3} overflowY="auto" maxH="calc(100vh - 350px)">
          <VStack spacing={2.5} align="stretch">
            {/* Quick Add Inline Task Form */}
            {isAddingTask && (
              <Box
                p={3}
                bg={isDark ? "rgba(30, 41, 59, 0.9)" : "white"}
                borderRadius={radiusStyle}
                border="1px solid"
                borderColor="blue.400"
                boxShadow="sm"
              >
                <Input
                  size="sm"
                  placeholder="Task name... (Enter to save, Esc to cancel)"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  borderRadius="md"
                  bg={isDark ? "gray.900" : "white"}
                  fontSize="xs"
                  mb={2}
                />
                <HStack justify="flex-end" spacing={2}>
                  <IconButton
                    aria-label="Cancel"
                    size="xs"
                    variant="ghost"
                    icon={<FiX />}
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskName("");
                    }}
                  />
                  <Button
                    size="xs"
                    colorScheme="blue"
                    onClick={handleCreateTask}
                    isLoading={isSubmitting}
                    isDisabled={!newTaskName.trim()}
                  >
                    Add
                  </Button>
                </HStack>
              </Box>
            )}

            {/* Task list */}
            {tasks.map((task) => (
              <DevKanbanCard
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                isRecentlyMoved={recentlyMovedTaskId === task.id}
                isCompactView={isCompactView}
                dataBacklogs={dataBacklogs}
              />
            ))}

            {/* Empty state */}
            {tasks.length === 0 && !isAddingTask && (
              <Box
                p={8}
                textAlign="center"
                color={isDark ? "gray.500" : "gray.400"}
                border="2px dashed"
                borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                rounded={radiusStyle}
              >
                <VStack spacing={2}>
                  <FiInbox size={24} />
                  <Text fontSize="sm" fontWeight="medium">
                    No tasks yet
                  </Text>
                  <Text fontSize="xs">
                    Drag tasks here or click "+" to add
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Drag hover drop indicator */}
            {isOver && (
              <Box
                p={4}
                border="2px dashed"
                borderColor="blue.400"
                rounded={radiusStyle}
                bg={isDark ? "rgba(59, 130, 246, 0.1)" : "blue.50"}
                textAlign="center"
              >
                <Text fontSize="xs" color="blue.500" fontWeight="medium">
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

export default DevKanbanColumn;
