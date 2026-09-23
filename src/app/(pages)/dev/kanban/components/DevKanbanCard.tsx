"use client";

import React, { useRef, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  AvatarGroup,
  Icon,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { TaskViewModel } from "@/app/services/useTasks";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import {
  FiCheckSquare,
  FiMessageSquare,
  FiPaperclip,
  FiClock,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { normalizeStageName } from "../kanbanUtils";

interface DevKanbanCardProps {
  task: TaskViewModel;
  onTaskClick: (task: TaskViewModel) => void;
  isRecentlyMoved?: boolean;
  isCompactView?: boolean;
  dataBacklogs?: BacklogDataResponse[];
}

interface PriorityConfig {
  label: string;
  accentColor: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textColor: string;
}

const getPriorityConfig = (priority?: string): PriorityConfig => {
  const p = priority?.toUpperCase();
  switch (p) {
    case "URGENT":
    case "CRITICAL":
      return {
        label: "Critical",
        accentColor: "#ef4444",
        bgLight: "rgba(239, 68, 68, 0.08)",
        bgDark: "rgba(239, 68, 68, 0.15)",
        borderLight: "rgba(239, 68, 68, 0.25)",
        borderDark: "rgba(239, 68, 68, 0.35)",
        textColor: "red.400",
      };
    case "HIGH":
      return {
        label: "High",
        accentColor: "#f97316",
        bgLight: "rgba(249, 115, 22, 0.08)",
        bgDark: "rgba(249, 115, 22, 0.15)",
        borderLight: "rgba(249, 115, 22, 0.25)",
        borderDark: "rgba(249, 115, 22, 0.35)",
        textColor: "orange.400",
      };
    case "MEDIUM":
      return {
        label: "Medium",
        accentColor: "#eab308",
        bgLight: "rgba(234, 179, 8, 0.08)",
        bgDark: "rgba(234, 179, 8, 0.15)",
        borderLight: "rgba(234, 179, 8, 0.25)",
        borderDark: "rgba(234, 179, 8, 0.35)",
        textColor: "yellow.500",
      };
    case "LOW":
      return {
        label: "Low",
        accentColor: "#3b82f6",
        bgLight: "rgba(59, 130, 246, 0.08)",
        bgDark: "rgba(59, 130, 246, 0.15)",
        borderLight: "rgba(59, 130, 246, 0.22)",
        borderDark: "rgba(59, 130, 246, 0.3)",
        textColor: "blue.400",
      };
    default:
      return {
        label: p || "Normal",
        accentColor: "#94a3b8",
        bgLight: "rgba(148, 163, 184, 0.08)",
        bgDark: "rgba(148, 163, 184, 0.12)",
        borderLight: "rgba(148, 163, 184, 0.2)",
        borderDark: "rgba(148, 163, 184, 0.25)",
        textColor: "gray.400",
      };
  }
};

const getDeadlineInfo = (endDateString?: string | null) => {
  if (!endDateString) return null;
  const date = new Date(endDateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formatted = `${day} ${monthNames[date.getMonth()]}`;

  if (diffDays < 0) {
    return {
      label: `${formatted} (${Math.abs(diffDays)}d overdue)`,
      isOverdue: true,
      isUpcoming: false,
    };
  }
  if (diffDays === 0) {
    return {
      label: "Due today",
      isOverdue: false,
      isUpcoming: true,
    };
  }
  if (diffDays <= 3) {
    return {
      label: `${formatted} (${diffDays}d left)`,
      isOverdue: false,
      isUpcoming: true,
    };
  }
  return {
    label: formatted,
    isOverdue: false,
    isUpcoming: false,
  };
};

export const DevKanbanCard: React.FC<DevKanbanCardProps> = ({
  task,
  onTaskClick,
  isRecentlyMoved = false,
  isCompactView = false,
  dataBacklogs = [],
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag({
    type: "task",
    item: {
      id: task.id,
      boardId: task.boardId,
      boardName: task.boardName,
      taskCode: task.taskCode,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  dragRef(cardRef);

  const priority = useMemo(
    () => getPriorityConfig(task.taskPriority),
    [task.taskPriority]
  );
  const deadline = useMemo(
    () => getDeadlineInfo(task.endDate),
    [task.endDate]
  );
  const backlog = useMemo(
    () => dataBacklogs.find((b) => b.id === task.backlogId),
    [dataBacklogs, task.backlogId]
  );
  const isDoneStage = normalizeStageName(task.boardName) === "DONE";

  const taskCodeDisplay = task.taskCode || task.id.slice(0, 8).toUpperCase();

  return (
    <Box
      ref={cardRef}
      role="group"
      position="relative"
      w="full"
      cursor="grab"
      _active={{ cursor: "grabbing" }}
      opacity={isDragging ? 0.35 : 1}
      transform={isDragging ? "scale(0.98)" : "none"}
      transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
      onClick={() => onTaskClick(task)}
      mb={3}
    >
      <Box
        position="relative"
        bg={
          isRecentlyMoved
            ? isDark
              ? "rgba(59, 130, 246, 0.18)"
              : "blue.50"
            : isDark
            ? "rgba(15, 23, 42, 0.78)"
            : "white"
        }
        backdropFilter="blur(16px)"
        borderRadius={radiusStyle}
        border="1px solid"
        borderColor={
          isRecentlyMoved
            ? "blue.400"
            : isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(226, 232, 240, 0.9)"
        }
        boxShadow={
          isRecentlyMoved
            ? isDark
              ? "0 0 0 1px rgba(96, 165, 250, 0.5), 0 8px 24px -4px rgba(0, 0, 0, 0.5)"
              : "0 0 0 1px rgba(59, 130, 246, 0.4), 0 6px 20px -2px rgba(59, 130, 246, 0.2)"
            : isDark
            ? "0 2px 6px -1px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)"
            : "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)"
        }
        pl={4}
        pr={3.5}
        py={isCompactView ? 2.5 : 3.5}
        transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        _hover={{
          transform: "translateY(-2px)",
          borderColor: isDark
            ? "rgba(168, 85, 247, 0.45)"
            : "rgba(129, 140, 248, 0.5)",
          boxShadow: isDark
            ? "0 12px 28px -6px rgba(0, 0, 0, 0.65), 0 0 14px rgba(168, 85, 247, 0.12)"
            : "0 10px 24px -4px rgba(99, 102, 241, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)",
        }}
        overflow="hidden"
      >
        {/* Sleek Vertical Left Accent Pill for Priority */}
        <Box
          position="absolute"
          left="0"
          top="10px"
          bottom="10px"
          w="3px"
          borderTopRightRadius="full"
          borderBottomRightRadius="full"
          bg={priority.accentColor}
          opacity={0.85}
          _groupHover={{ opacity: 1, w: "3.5px" }}
          transition="all 0.2s ease"
        />

        <VStack align="stretch" spacing={isCompactView ? 1.5 : 2.5}>
          {/* Header Row: Backlog context / Task Code & Priority Tag */}
          <HStack justify="space-between" align="center" spacing={2}>
            <HStack spacing={1.5} minW={0} overflow="hidden">
              {/* Backlog mini badge if present */}
              {backlog?.backlogName && !isCompactView && (
                <Text
                  fontSize="3xs"
                  fontWeight="600"
                  color={isDark ? "gray.400" : "gray.600"}
                  bg={isDark ? "whiteAlpha.100" : "gray.100"}
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  noOfLines={1}
                  maxW="110px"
                  title={backlog.backlogName}
                >
                  {backlog.backlogName}
                </Text>
              )}

              {/* Task Code */}
              <Text
                fontSize="2xs"
                fontFamily="SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                fontWeight="600"
                color={isDark ? "gray.400" : "gray.500"}
                letterSpacing="-0.02em"
                noOfLines={1}
              >
                #{taskCodeDisplay}
              </Text>
            </HStack>

            {/* Priority Micro Tag with Glow Dot */}
            <HStack
              spacing={1.5}
              px={2}
              py={0.5}
              borderRadius="full"
              bg={isDark ? priority.bgDark : priority.bgLight}
              border="1px solid"
              borderColor={isDark ? priority.borderDark : priority.borderLight}
              flexShrink={0}
            >
              <Box
                w="5px"
                h="5px"
                borderRadius="full"
                bg={priority.accentColor}
              />
              <Text
                fontSize="3xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.04em"
                color={priority.textColor}
              >
                {priority.label}
              </Text>
            </HStack>
          </HStack>

          {/* Task Title */}
          <Text
            fontSize={isCompactView ? "xs" : "sm"}
            fontWeight="600"
            lineHeight="1.4"
            letterSpacing="-0.01em"
            color={isDark ? "gray.100" : "gray.850"}
            noOfLines={isCompactView ? 1 : 2}
            _groupHover={{
              color: isDark ? "purple.300" : "purple.600",
            }}
            transition="color 0.15s ease"
          >
            {task.taskName}
          </Text>

          {/* Task Description (Full view only) */}
          {!isCompactView && task.taskDesc && (
            <Text
              fontSize="xs"
              color={isDark ? "gray.400" : "gray.600"}
              lineHeight="1.45"
              noOfLines={2}
            >
              {task.taskDesc}
            </Text>
          )}

          {/* Slim Progress Bar */}
          {!isCompactView && task.percentageStatus > 0 && (
            <Box w="full" pt={0.5}>
              <HStack justify="space-between" align="center" mb={1}>
                <Text
                  fontSize="3xs"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                  color={isDark ? "gray.400" : "gray.500"}
                >
                  Progress
                </Text>
                <Text
                  fontSize="3xs"
                  fontFamily="mono"
                  fontWeight="700"
                  color={
                    task.percentageStatus === 100
                      ? "green.400"
                      : isDark
                      ? "green.300"
                      : "green.600"
                  }
                >
                  {task.percentageStatus}%
                </Text>
              </HStack>
              <Box
                w="full"
                h="3px"
                bg={isDark ? "whiteAlpha.100" : "gray.100"}
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  w={`${task.percentageStatus}%`}
                  bg="linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                  boxShadow="0 0 6px rgba(16, 185, 129, 0.4)"
                  borderRadius="full"
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>
          )}

          {/* Bottom Row: Metadata Chips (Checklist, Comments, Attachments, Due Date) & Avatars */}
          <HStack
            justify="space-between"
            align="center"
            pt={1.5}
            borderTop="1px solid"
            borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"}
          >
            {/* Left: Metadata micro chips */}
            <HStack
              spacing={2.5}
              fontSize="2xs"
              color={isDark ? "gray.400" : "gray.500"}
            >
              {/* Due Date Indicator */}
              {deadline && !isCompactView && (
                <Tooltip label={`Deadline: ${task.endDate}`} hasArrow placement="top">
                  <HStack
                    spacing={1}
                    px={1.5}
                    py={0.5}
                    borderRadius="sm"
                    bg={
                      deadline.isOverdue
                        ? isDark
                          ? "rgba(239, 68, 68, 0.15)"
                          : "red.50"
                        : deadline.isUpcoming
                        ? isDark
                          ? "rgba(245, 158, 11, 0.15)"
                          : "orange.50"
                        : "transparent"
                    }
                    color={
                      deadline.isOverdue
                        ? "red.400"
                        : deadline.isUpcoming
                        ? "orange.400"
                        : isDark
                        ? "gray.400"
                        : "gray.500"
                    }
                  >
                    <Icon as={deadline.isOverdue ? FiAlertCircle : FiClock} boxSize={3} />
                    <Text
                      fontSize="3xs"
                      fontWeight={deadline.isOverdue || deadline.isUpcoming ? 700 : 500}
                    >
                      {deadline.label}
                    </Text>
                  </HStack>
                </Tooltip>
              )}

              {/* Sub-tasks / Checklist items */}
              {(task.countTaskItem || 0) > 0 && (
                <Tooltip
                  label={`Checklist: ${task.countTaskItemDone || 0} of ${task.countTaskItem} done`}
                  hasArrow
                  placement="top"
                >
                  <HStack
                    spacing={1}
                    color={
                      (task.countTaskItemDone || 0) === task.countTaskItem
                        ? "green.400"
                        : undefined
                    }
                  >
                    <Icon as={FiCheckSquare} boxSize={3} />
                    <Text fontWeight={600} fontFamily="mono" fontSize="3xs">
                      {task.countTaskItemDone || 0}/{task.countTaskItem}
                    </Text>
                  </HStack>
                </Tooltip>
              )}

              {/* Comments count */}
              {(task.countCommnetTask || 0) > 0 && (
                <Tooltip label={`${task.countCommnetTask} comments`} hasArrow placement="top">
                  <HStack spacing={1}>
                    <Icon as={FiMessageSquare} boxSize={3} />
                    <Text fontWeight={600} fontFamily="mono" fontSize="3xs">
                      {task.countCommnetTask}
                    </Text>
                  </HStack>
                </Tooltip>
              )}

              {/* Attachments count */}
              {(task.countTaskAttachment || 0) > 0 && (
                <Tooltip
                  label={`${task.countTaskAttachment} attachments`}
                  hasArrow
                  placement="top"
                >
                  <HStack spacing={1}>
                    <Icon as={FiPaperclip} boxSize={3} />
                    <Text fontWeight={600} fontFamily="mono" fontSize="3xs">
                      {task.countTaskAttachment}
                    </Text>
                  </HStack>
                </Tooltip>
              )}
            </HStack>

            {/* Right: Overlapping Assignee Avatars */}
            {task.assignUsers && task.assignUsers.length > 0 && (
              <Tooltip
                hasArrow
                label={
                  <VStack spacing={0.5} align="start" py={1}>
                    {task.assignUsers.map((u) => (
                      <Text key={u.id} fontSize="xs" fontWeight="500">
                        {u.nama}
                      </Text>
                    ))}
                  </VStack>
                }
                bg={isDark ? "gray.800" : "gray.900"}
                color="white"
                borderRadius="md"
                placement="top"
              >
                <AvatarGroup size="2xs" max={3} spacing="-1.5">
                  {task.assignUsers.map((u) => (
                    <Avatar
                      key={u.id}
                      name={u.nama}
                      src={u.profilePict || undefined}
                      border="1.5px solid"
                      borderColor={isDark ? "gray.800" : "white"}
                      bg={isDark ? "purple.900" : "purple.100"}
                      color={isDark ? "purple.200" : "purple.700"}
                      fontWeight="600"
                    />
                  ))}
                </AvatarGroup>
              </Tooltip>
            )}
          </HStack>

          {/* Incomplete Task warning in DONE column */}
          {task.percentageStatus < 100 && isDoneStage && (
            <HStack
              mt={1}
              px={2.5}
              py={1}
              borderRadius="md"
              bg={isDark ? "rgba(245, 158, 11, 0.12)" : "orange.50"}
              border="1px solid"
              borderColor={isDark ? "rgba(245, 158, 11, 0.25)" : "orange.200"}
              color={isDark ? "orange.300" : "orange.700"}
              fontSize="3xs"
              fontWeight={600}
              spacing={1.5}
            >
              <Icon as={FiAlertCircle} boxSize="11px" />
              <Text noOfLines={1}>Checklist belum selesai</Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default DevKanbanCard;
