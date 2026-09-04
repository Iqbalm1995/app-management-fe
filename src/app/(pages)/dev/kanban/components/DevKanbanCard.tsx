"use client";

import React, { useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  AvatarGroup,
  useColorMode,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { TaskViewModel } from "@/app/services/useTasks";
import { FiCheckSquare, FiMessageSquare, FiPaperclip } from "react-icons/fi";

interface DevKanbanCardProps {
  task: TaskViewModel;
  onTaskClick: (task: TaskViewModel) => void;
  isRecentlyMoved?: boolean;
}

const priorityColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: "red.50", text: "red.600", dot: "red.500" },
  Urgent: { bg: "red.50", text: "red.600", dot: "red.500" },
  Medium: { bg: "orange.50", text: "orange.600", dot: "orange.500" },
  Low: { bg: "blue.50", text: "blue.600", dot: "blue.500" },
};

export const DevKanbanCard: React.FC<DevKanbanCardProps> = ({
  task,
  onTaskClick,
  isRecentlyMoved = false,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag({
    type: "task",
    item: {
      id: task.id,
      boardId: task.boardId,
      taskCode: task.taskCode,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  dragRef(cardRef);

  const priorityStyle = priorityColorMap[task.taskPriority] || {
    bg: "gray.50",
    text: "gray.600",
    dot: "gray.400",
  };

  return (
    <Box
      ref={cardRef}
      p={3.5}
      borderRadius="lg"
      bg={isDark ? "gray.900" : "white"}
      border="1px solid"
      borderColor={
        isRecentlyMoved
          ? "purple.400"
          : isDark
          ? "gray.800"
          : "gray.200"
      }
      opacity={isDragging ? 0.4 : 1}
      cursor="grab"
      _active={{ cursor: "grabbing" }}
      transition="all 0.15s ease"
      _hover={{
        borderColor: isDark ? "purple.400" : "purple.500",
        transform: "translateY(-1.5px)",
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.06)",
      }}
      onClick={() => onTaskClick(task)}
    >
      <VStack align="start" spacing={2.5} w="full">
        {/* Top: Task Code & Priority */}
        <HStack justify="space-between" w="full">
          <Text
            fontFamily="mono"
            fontSize="2xs"
            fontWeight={600}
            color={isDark ? "gray.400" : "gray.500"}
            letterSpacing="0.04em"
          >
            {task.taskCode || "TASK"}
          </Text>

          {task.taskPriority && (
            <HStack spacing={1.5}>
              <Box
                w="6px"
                h="6px"
                borderRadius="full"
                bg={priorityStyle.dot}
              />
              <Text
                fontSize="2xs"
                fontWeight={600}
                color={isDark ? "gray.300" : priorityStyle.text}
              >
                {task.taskPriority}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Task Title */}
        <Text
          fontSize="sm"
          fontWeight={600}
          lineHeight="shorter"
          color={isDark ? "gray.100" : "gray.800"}
          noOfLines={2}
        >
          {task.taskName}
        </Text>

        {/* Bottom meta row */}
        <HStack justify="space-between" w="full" pt={1} align="center">
          <HStack spacing={3} color={isDark ? "gray.400" : "gray.500"} fontSize="2xs">
            {task.countTaskItem > 0 && (
              <HStack spacing={1}>
                <Icon as={FiCheckSquare} />
                <Text fontFamily="mono">
                  {task.countTaskItemDone || 0}/{task.countTaskItem}
                </Text>
              </HStack>
            )}

            {(task.countCommnetTask || 0) > 0 && (
              <HStack spacing={1}>
                <Icon as={FiMessageSquare} />
                <Text fontFamily="mono">{task.countCommnetTask}</Text>
              </HStack>
            )}

            {(task.countTaskAttachment || 0) > 0 && (
              <HStack spacing={1}>
                <Icon as={FiPaperclip} />
                <Text fontFamily="mono">{task.countTaskAttachment}</Text>
              </HStack>
            )}
          </HStack>

          {/* Assignees */}
          {task.assignUsers && task.assignUsers.length > 0 ? (
            <AvatarGroup size="2xs" max={2}>
              {task.assignUsers.map((u) => (
                <Avatar
                  key={u.id}
                  name={u.nama}
                  src={u.profilePict || undefined}
                />
              ))}
            </AvatarGroup>
          ) : (
            <Box />
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default DevKanbanCard;
