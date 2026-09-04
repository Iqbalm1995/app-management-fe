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
  useColorMode,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useDrop } from "react-dnd";
import { TaskBoardViewModel, TaskViewModel } from "@/app/services/useTasks";
import DevKanbanCard from "./DevKanbanCard";
import { FiPlus, FiX } from "react-icons/fi";

interface DevKanbanColumnProps {
  board: TaskBoardViewModel;
  tasks: TaskViewModel[];
  onMoveTask: (taskId: string, targetBoardId: string) => void;
  onAddTask: (boardId: string, taskName: string) => Promise<boolean>;
  onTaskClick: (task: TaskViewModel) => void;
  recentlyMovedTaskId?: string | null;
}

const stageColorMap: Record<string, string> = {
  TODO: "gray.400",
  INPROGRESS: "blue.400",
  REVIEW: "yellow.400",
  DONE: "green.400",
};

export const DevKanbanColumn: React.FC<DevKanbanColumnProps> = ({
  board,
  tasks,
  onMoveTask,
  onAddTask,
  onTaskClick,
  recentlyMovedTaskId,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const columnRef = useRef<HTMLDivElement>(null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [{ isOver }, dropRef] = useDrop({
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

  dropRef(columnRef);

  const stageColor = stageColorMap[board.boardCodeStage] || "purple.400";

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
    <Box
      ref={columnRef}
      w="320px"
      minW="320px"
      maxW="320px"
      borderRadius="xl"
      bg={isDark ? "gray.925" : "gray.100"}
      border="1px solid"
      borderColor={
        isOver
          ? "purple.400"
          : isDark
          ? "gray.800"
          : "gray.200"
      }
      p={3.5}
      display="flex"
      flexDirection="column"
      maxH="calc(100vh - 170px)"
      transition="border-color 0.15s ease"
      sx={{
        backgroundColor: isDark
          ? isOver
            ? "rgba(128, 90, 213, 0.08)"
            : "gray.900"
          : isOver
          ? "rgba(128, 90, 213, 0.05)"
          : "gray.50",
      }}
    >
      {/* Column Header */}
      <HStack mb={3} px={1}>
        <Box w="3px" h="14px" borderRadius="full" bg={stageColor} />
        <Text
          fontWeight={700}
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="0.05em"
          color={isDark ? "gray.300" : "gray.700"}
        >
          {board.boardName}
        </Text>
        <Spacer />
        <Badge
          borderRadius="full"
          px={2}
          py={0.5}
          fontSize="2xs"
          fontFamily="mono"
          variant="subtle"
          colorScheme="gray"
        >
          {tasks.length}
        </Badge>
      </HStack>

      {/* Task Cards List */}
      <VStack
        spacing={2.5}
        align="stretch"
        flex={1}
        overflowY="auto"
        pr={1}
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "gray.700" : "gray.300",
            borderRadius: "4px",
          },
        }}
      >
        {tasks.map((task) => (
          <DevKanbanCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            isRecentlyMoved={recentlyMovedTaskId === task.id}
          />
        ))}

        {tasks.length === 0 && !isAddingTask && (
          <Flex
            h="90px"
            border="1px dashed"
            borderColor={isDark ? "gray.800" : "gray.300"}
            borderRadius="lg"
            align="center"
            justify="center"
          >
            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
              Drag tasks here
            </Text>
          </Flex>
        )}
      </VStack>

      {/* Quick Add Task */}
      <Box pt={3}>
        {isAddingTask ? (
          <VStack spacing={2} align="stretch">
            <Input
              size="sm"
              placeholder="Task name... (Enter to save)"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              borderRadius="md"
              bg={isDark ? "gray.800" : "white"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.300"}
              _focus={{
                borderColor: "purple.500",
              }}
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
                colorScheme="purple"
                onClick={handleCreateTask}
                isLoading={isSubmitting}
                isDisabled={!newTaskName.trim()}
              >
                Add
              </Button>
            </HStack>
          </VStack>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            w="full"
            justifyContent="start"
            leftIcon={<FiPlus />}
            fontSize="xs"
            color={isDark ? "gray.400" : "gray.600"}
            _hover={{
              bg: isDark ? "gray.800" : "gray.200",
              color: isDark ? "white" : "gray.800",
            }}
            borderRadius="md"
            onClick={() => setIsAddingTask(true)}
          >
            Add task
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DevKanbanColumn;
