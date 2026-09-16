"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  HStack,
  VStack,
  Box,
  Text,
  Heading,
  Icon,
  Badge,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  useColorMode,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiExternalLink,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import useWorkspace from "@/app/services/useWorkspace";
import { TaskActivityResponse } from "@/app/services/useTasks";
import { UserShortResponse } from "@/app/services/useUsers";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";
import { ControlTable } from "@/app/components/tableComponents";

const formatDateDDMMYYYY = (dateString?: string | null): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

interface WorkspaceTaskActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  radiusStyle?: string;
  accentColor?: string;
}

export const WorkspaceTaskActivitiesModal: React.FC<WorkspaceTaskActivitiesModalProps> = ({
  isOpen,
  onClose,
  radiusStyle = "xl",
  accentColor = "blue.500",
}) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { GetAssignedProjectsActivities, GetAssignedProjectsMembers } = useWorkspace();

  // State
  const [activities, setActivities] = useState<TaskActivityResponse[]>([]);
  const [members, setMembers] = useState<UserShortResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("All");
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Theme colors
  const bgModal = useColorModeValue("white", "gray.850");
  const tableBorderColor = useColorModeValue("gray.200", "gray.700");
  const hoverRowBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");
  const headerBg = useColorModeValue("gray.50", "gray.800");

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load project members for dropdown (only when modal is open)
  const loadMembers = useCallback(async () => {
    const token = localStorage.getItem("tokenData");
    if (!token) return;

    setIsMembersLoading(true);
    try {
      const res = await GetAssignedProjectsMembers(token);
      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error("Error loading project members for activities filter:", err);
    } finally {
      setIsMembersLoading(false);
    }
  }, [GetAssignedProjectsMembers]);

  // Fetch activities (only when modal is open)
  const fetchActivities = useCallback(async () => {
    const token = localStorage.getItem("tokenData");
    if (!token) return;

    setIsLoading(true);
    try {
      const filterWhereList: any[] = [];
      if (selectedMemberId && selectedMemberId !== "All") {
        filterWhereList.push({
          field: "UserIdSys",
          operator: "=",
          value: selectedMemberId,
        });
      }

      const payload: PaggingListPayloadCustom = {
        page: page,
        limit: limit,
        search: debouncedSearch,
        filterWhere: filterWhereList,
        fieldOrder: ["CreatedAt"],
        orderDir: "desc",
      };

      const res = await GetAssignedProjectsActivities(payload, token);
      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        setActivities(res.data);
        setTotalCount(res.countTotal ?? res.data.length);
      } else {
        setActivities([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Error fetching assigned projects task activities:", err);
      setActivities([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [GetAssignedProjectsActivities, debouncedSearch, selectedMemberId, page, limit]);

  // Load members once whenever modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, loadMembers]);

  // Fetch activities whenever modal is open and filter/pagination dependencies update
  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, fetchActivities]);

  // ControlTable adapter for pagination
  const tableAdapter = useMemo(() => {
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return {
      getPageCount: () => totalPages,
      getState: () => ({
        pagination: {
          pageIndex: page,
          pageSize: limit,
        },
      }),
      setPageIndex: (index: number) => {
        setPage(index);
      },
      previousPage: () => {
        setPage((prev) => Math.max(0, prev - 1));
      },
      nextPage: () => {
        setPage((prev) => Math.min(totalPages - 1, prev + 1));
      },
      getCanPreviousPage: () => page > 0,
      getCanNextPage: () => page < totalPages - 1,
      setPageSize: (newSize: number) => {
        setLimit(newSize);
        setPage(0);
      },
    };
  }, [page, limit, totalCount]);

  const handleNavigateToTask = (projectId?: string | null, taskId?: string | null) => {
    if (!projectId) return;
    const taskQuery = taskId ? `&taskId=${taskId}` : "";
    router.push(`/workspace/project?projectId=${projectId}${taskQuery}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgModal} borderRadius={radiusStyle} maxH="88vh">
        <ModalHeader borderBottom="1px" borderColor={tableBorderColor} pb={4}>
          <HStack justify="space-between" align="center" pr={8}>
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="lg"
                bg={colorMode === "light" ? "blue.50" : "blue.900"}
                color={accentColor}
              >
                <Icon as={FiActivity} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="md">Assigned Projects Activity Log</Heading>
                  <Badge colorScheme="blue" borderRadius="full" px={2.5}>
                    {totalCount} Total
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={subtleTextColor}>
                  Real-time timeline of task events and updates across all your assigned projects
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={5} px={6}>
          <VStack spacing={4} align="stretch">
            {/* Filters Row */}
            <HStack spacing={3} wrap={{ base: "wrap", md: "nowrap" }} justify="space-between">
              <HStack spacing={3} flex={1} minW={{ base: "100%", md: "auto" }}>
                <InputGroup size="sm" maxW={{ base: "100%", md: "320px" }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search task or activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius="md"
                  />
                </InputGroup>

                <HStack spacing={2} minW={{ base: "100%", md: "260px" }}>
                  <Icon as={FiUser} color={subtleTextColor} />
                  <Select
                    size="sm"
                    borderRadius="md"
                    value={selectedMemberId}
                    onChange={(e) => {
                      setSelectedMemberId(e.target.value);
                      setPage(0);
                    }}
                  >
                    <option value="All">All Team Members ({members.length})</option>
                    {members.map((m) => (
                      <option key={m.id || m.userId} value={m.id || m.userId}>
                        {m.nama || m.userId} {m.nip ? `(${m.nip})` : ""}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </HStack>

              <Tooltip label="Refresh activity data" fontSize="xs">
                <IconButton
                  aria-label="Refresh"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="outline"
                  borderRadius="md"
                  isLoading={isLoading}
                  onClick={() => {
                    loadMembers();
                    fetchActivities();
                  }}
                />
              </Tooltip>
            </HStack>

            {/* Table Content */}
            <TableContainer
              border="1px"
              borderColor={tableBorderColor}
              borderRadius="lg"
              minH="350px"
              position="relative"
            >
              {isLoading ? (
                <VStack spacing={3} py={20} justify="center" align="center">
                  <Spinner size="lg" color={accentColor} thickness="3px" />
                  <Text fontSize="sm" color={subtleTextColor}>
                    Loading activity timeline...
                  </Text>
                </VStack>
              ) : activities.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th width="22%" py={3}>Team Member</Th>
                      <Th width="45%" py={3}>Activity & Task</Th>
                      <Th width="18%" py={3}>Project</Th>
                      <Th width="15%" py={3} textAlign="center">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {activities.map((act) => {
                      const userName =
                        act.userData?.nama ||
                        act.userData?.userId ||
                        "Member";
                      const userAvatar = act.userData?.profilePict || undefined;
                      const userNip = act.userData?.nip || "";

                      return (
                        <Tr
                          key={act.id}
                          _hover={{ bg: hoverRowBg }}
                          transition="background 0.15s ease"
                        >
                          {/* Member Column */}
                          <Td py={3}>
                            <HStack spacing={2.5} align="center">
                              <Avatar
                                size="sm"
                                name={userName}
                                src={userAvatar}
                                borderRadius="full"
                              />
                              <VStack spacing={0} align="start" minW={0}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  noOfLines={1}
                                  title={userName}
                                >
                                  {userName}
                                </Text>
                                {userNip ? (
                                  <Text fontSize="10px" color={subtleTextColor}>
                                    {userNip}
                                  </Text>
                                ) : (
                                  <Text fontSize="10px" color={subtleTextColor}>
                                    {act.userData?.userId || "User"}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Td>

                          {/* Activity & Task Column */}
                          <Td py={3}>
                            <VStack spacing={1} align="start">
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                color={colorMode === "light" ? "gray.800" : "gray.100"}
                                wordBreak="break-word"
                                lineHeight="tall"
                              >
                                {act.activity}
                              </Text>
                              <HStack spacing={2} wrap="wrap">
                                {act.taskName && (
                                  <Badge
                                    colorScheme="blue"
                                    variant="subtle"
                                    fontSize="10px"
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                  >
                                    {act.taskName}
                                  </Badge>
                                )}
                                <HStack spacing={1} color={subtleTextColor} fontSize="11px">
                                  <Icon as={FiClock} boxSize="11px" />
                                  <Text fontSize="11px">
                                    {formatDateDDMMYYYY(act.createdAt)}
                                  </Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Td>

                          {/* Project Column */}
                          <Td py={3}>
                            {act.projectName ? (
                              <HStack spacing={1.5} align="center">
                                <Icon as={FiLayers} boxSize="12px" color={accentColor} />
                                <Text
                                  fontSize="xs"
                                  fontWeight="medium"
                                  color={colorMode === "light" ? "gray.700" : "gray.200"}
                                  noOfLines={1}
                                  title={act.projectName}
                                >
                                  {act.projectName}
                                </Text>
                              </HStack>
                            ) : (
                              <Text fontSize="xs" color={subtleTextColor}>
                                -
                              </Text>
                            )}
                          </Td>

                          {/* Action Column */}
                          <Td py={3} textAlign="center">
                            {act.projectId ? (
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                leftIcon={<FiExternalLink />}
                                borderRadius="md"
                                onClick={() => handleNavigateToTask(act.projectId, act.taskId)}
                              >
                                Board
                              </Button>
                            ) : (
                              <Text fontSize="xs" color={subtleTextColor}>
                                -
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <VStack spacing={3} py={16} justify="center" align="center">
                  <Icon
                    as={FiActivity}
                    boxSize={10}
                    color={subtleTextColor}
                    opacity={0.3}
                  />
                  <Text fontSize="sm" fontWeight="medium" color={subtleTextColor}>
                    No activities found matching the criteria
                  </Text>
                  {(searchTerm || selectedMemberId !== "All") && (
                    <Button
                      size="xs"
                      variant="link"
                      colorScheme="blue"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedMemberId("All");
                        setPage(0);
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </VStack>
              )}
            </TableContainer>

            {/* Pagination Controls */}
            {activities.length > 0 && (
              <Box pt={2}>
                <ControlTable table={tableAdapter} />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={tableBorderColor} py={3}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WorkspaceTaskActivitiesModal;
