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
  Icon,
  Tooltip,
  Card,
  CardBody,
  CardFooter,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { TaskViewModel } from "@/app/services/useTasks";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import {
  FiCheckSquare,
  FiMessageSquare,
  FiPaperclip,
  FiList,
  FiClock,
  FiPlay,
  FiFlag,
  FiRefreshCcw,
  FiAlertCircle,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { convertToCustomDateFormat } from "@/app/helper/MasterHelper";

interface DevKanbanCardProps {
  task: TaskViewModel;
  onTaskClick: (task: TaskViewModel) => void;
  isRecentlyMoved?: boolean;
  isCompactView?: boolean;
  dataBacklogs?: BacklogDataResponse[];
}

const formatDateDDMMYYYY = (dateString?: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getPriorityColorScheme = (priority?: string): string => {
  const p = priority?.toUpperCase();
  if (p === "HIGH" || p === "CRITICAL" || p === "URGENT") return "red";
  if (p === "MEDIUM") return "orange";
  return "green";
};

const getPriorityBarColor = (priority?: string): string => {
  const p = priority?.toUpperCase();
  if (p === "HIGH" || p === "CRITICAL" || p === "URGENT") return "red.400";
  if (p === "MEDIUM") return "orange.400";
  return "green.400";
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
      taskCode: task.taskCode,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  dragRef(cardRef);

  const priorityScheme = getPriorityColorScheme(task.taskPriority);
  const priorityBarColor = getPriorityBarColor(task.taskPriority);

  const backlog = dataBacklogs.find((b) => b.id === task.backlogId);
  const isDoneStage =
    task.boardCodeStage === "DONE" ||
    task.boardName?.toUpperCase() === "DONE";

  return (
    <div
      ref={cardRef}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        width: "100%",
      }}
      onClick={() => onTaskClick(task)}
    >
      <Card
        size="sm"
        variant="outline"
        borderRadius={radiusStyle}
        bg={
          isRecentlyMoved
            ? isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "blue.50"
            : isDark
            ? "rgba(26, 32, 44, 0.85)"
            : "white"
        }
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor={
          isRecentlyMoved
            ? "blue.400"
            : isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "gray.200"
        }
        boxShadow={isRecentlyMoved ? "md" : "sm"}
        transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        _hover={{
          borderColor: "blue.400",
          transform: "translateY(-2px)",
          boxShadow: "md",
        }}
        overflow="hidden"
        mb={3}
      >
        {/* 1. Priority Color Bar */}
        <Box h="3px" bg={priorityBarColor} />

        <CardBody px={4} py={isCompactView ? 2.5 : 3.5}>
          <VStack align="start" spacing={isCompactView ? 1.5 : 2.5}>
            {/* 2. Top Header Row: Priority Badge & Task Code/ID */}
            <HStack w="full" justify="space-between" align="center">
              <HStack spacing={2}>
                <Badge
                  size="sm"
                  rounded="full"
                  px={2.5}
                  py={0.5}
                  fontSize="3xs"
                  fontWeight={600}
                  colorScheme={priorityScheme}
                  variant="subtle"
                >
                  {task.taskPriority || "NORMAL"}
                </Badge>
                {isCompactView && (
                  <Text fontSize="xs" color="gray.500">
                    #{task.taskCode || task.id.slice(-6)}
                  </Text>
                )}
              </HStack>

              <HStack spacing={2}>
                {isCompactView && task.percentageStatus > 0 && (
                  <Text fontSize="xs" fontWeight="bold" color="gray.500">
                    {task.percentageStatus}%
                  </Text>
                )}
                {!isCompactView && (
                  <Text fontSize="xs" color="gray.500">
                    #{task.taskCode || task.id.slice(-6)}
                  </Text>
                )}
              </HStack>
            </HStack>

            {/* 3. Backlog Info and Deadline (Hidden in compact view) */}
            {!isCompactView && (
              <HStack
                w="full"
                justify="space-between"
                align="center"
                spacing={2}
              >
                {task.backlogId && (
                  <HStack spacing={1.5} noOfLines={1}>
                    <Icon as={FiList} color="blue.400" boxSize={3} />
                    <Text
                      fontSize="xs"
                      color={isDark ? "gray.300" : "gray.600"}
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {backlog?.backlogName || "Backlog"}
                    </Text>
                  </HStack>
                )}
                {backlog?.backlogEnddate && (
                  <HStack spacing={1} whiteSpace="nowrap">
                    <Icon as={FiClock} color="red.400" boxSize={3} />
                    <Text fontSize="xs" color="red.500" fontWeight="medium">
                      {formatDateDDMMYYYY(backlog.backlogEnddate)}
                    </Text>
                  </HStack>
                )}
              </HStack>
            )}

            {/* 4. Task Title */}
            <Text
              fontSize={isCompactView ? "sm" : "md"}
              fontWeight="600"
              lineHeight="1.3"
              color={isDark ? "gray.100" : "gray.800"}
              noOfLines={isCompactView ? 1 : 2}
              w="full"
            >
              {task.taskName}
            </Text>

            {/* 5. Description (Hidden in compact view) */}
            {!isCompactView && task.taskDesc && (
              <Text
                fontSize="xs"
                color={isDark ? "gray.400" : "gray.600"}
                lineHeight="1.4"
                noOfLines={2}
              >
                {task.taskDesc}
              </Text>
            )}

            {/* 6. Progress Bar (Hidden in compact view) */}
            {!isCompactView && task.percentageStatus > 0 && (
              <Box w="full" pt={0.5}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    Progress
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    {task.percentageStatus}%
                  </Text>
                </HStack>
                <Box
                  w="full"
                  h="6px"
                  bg={isDark ? "whiteAlpha.100" : "gray.100"}
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={`${task.percentageStatus}%`}
                    bg={
                      task.percentageStatus === 100
                        ? "green.400"
                        : "blue.400"
                    }
                    borderRadius="full"
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>
            )}

            {/* 7. Metadata Row: Counts and Assignees */}
            <HStack w="full" justify="space-between" align="center" pt={1}>
              <HStack spacing={3} color={isDark ? "gray.400" : "gray.500"} fontSize="xs">
                {(task.countCommnetTask || 0) > 0 && (
                  <HStack spacing={1}>
                    <Icon as={FiMessageSquare} boxSize={3} />
                    <Text fontWeight={500}>{task.countCommnetTask}</Text>
                  </HStack>
                )}

                {(task.countTaskItem || 0) > 0 && (
                  <HStack spacing={1}>
                    <Icon as={FiCheckSquare} boxSize={3} />
                    <Text fontWeight={500}>
                      {task.countTaskItemDone || 0}/{task.countTaskItem}
                    </Text>
                  </HStack>
                )}

                {(task.countTaskAttachment || 0) > 0 && (
                  <HStack spacing={1}>
                    <Icon as={FiPaperclip} boxSize={3} />
                    <Text fontWeight={500}>{task.countTaskAttachment}</Text>
                  </HStack>
                )}
              </HStack>

              {/* Assignees */}
              {task.assignUsers && task.assignUsers.length > 0 && (
                <Tooltip
                  hasArrow
                  label={
                    <VStack spacing={0.5} align="start">
                      {task.assignUsers.map((u) => (
                        <Text key={u.id} fontSize="xs">
                          {u.nama}
                        </Text>
                      ))}
                    </VStack>
                  }
                  bg="gray.800"
                  color="white"
                  borderRadius="md"
                  placement="top"
                >
                  <AvatarGroup size="2xs" max={3} spacing="-0.5">
                    {task.assignUsers.map((u) => (
                      <Avatar
                        key={u.id}
                        name={u.nama}
                        src={u.profilePict || undefined}
                      />
                    ))}
                  </AvatarGroup>
                </Tooltip>
              )}
            </HStack>

            {/* 8. Start and End Date (Hidden in compact view) */}
            {!isCompactView && (task.startDate || task.endDate) && (
              <HStack spacing={3} w="full" justify="space-between" pt={0.5}>
                {task.startDate && (
                  <HStack spacing={1.5} fontSize="3xs" color="green.500">
                    <Icon as={FiPlay} boxSize="9px" />
                    <Text fontWeight={500}>
                      Start : {formatDateDDMMYYYY(task.startDate)}
                    </Text>
                  </HStack>
                )}
                {task.endDate && (
                  <HStack spacing={1.5} fontSize="3xs" color="orange.500">
                    <Icon as={FiFlag} boxSize="9px" />
                    <Text fontWeight={500}>
                      End : {formatDateDDMMYYYY(task.endDate)}
                    </Text>
                  </HStack>
                )}
              </HStack>
            )}

            {/* 9. Last Updated (Hidden in compact view) */}
            {!isCompactView && (
              <HStack spacing={1.5} fontSize="3xs" color="gray.500" pt={0.5}>
                <Icon as={FiRefreshCcw} boxSize="9px" />
                <Text>
                  {task.updatedAt
                    ? `Updated ${convertToCustomDateFormat(task.updatedAt)}`
                    : `Created ${convertToCustomDateFormat(task.createdAt)}`}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>

        {/* 10. Warning footer if Done but percentage < 100% */}
        {task.percentageStatus < 100 && isDoneStage && (
          <CardFooter
            bg="orange.300"
            h="20px"
            p={0}
            roundedBottom={radiusStyle}
          >
            <Flex
              w="full"
              color="orange.900"
              px={3}
              align="center"
              justify="center"
              gap={1}
            >
              <Icon as={FiAlertCircle} boxSize="11px" />
              <Text fontSize="3xs" fontWeight={600}>
                Incomplete Task in Done
              </Text>
            </Flex>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default DevKanbanCard;
