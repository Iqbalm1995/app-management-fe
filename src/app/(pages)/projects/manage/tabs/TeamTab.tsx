"use client";

import {
  ProjectDataResponse,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Box,
  Spinner,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "@/app/constants/applicationConstants";
import {
  FiUsers,
  FiUserPlus,
  FiRefreshCw,
  FiSearch,
  FiUserMinus,
  FiMoreVertical,
  FiPenTool,
  FiEdit,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";

interface TeamTabProps {
  DataProject: ProjectDataResponse | null;
  canMake: boolean;
}

const TeamTab = ({ DataProject, canMake }: TeamTabProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { AssignUnassignMembers, GetProjectMembers, RemoveProjectMember } =
    useProjects();
  const { List } = useUsers();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Modal state
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  const {
    isOpen: isRemoveAlertOpen,
    onOpen: onRemoveAlertOpen,
    onClose: onRemoveAlertClose,
  } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  // Add member state
  const [availableUsers, setAvailableUsers] = useState<UsersResponse[]>([]);
  const [allLoadedUsers, setAllLoadedUsers] = useState<UsersResponse[]>([]); // Preserve all loaded users
  const [projectMembers, setProjectMembers] = useState<
    ProjectUserAssignmentResponse[]
  >([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [processingTeam, setProcessingTeam] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Confirmation dialog states
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCaption, setConfirmCaption] = useState("");

  // Remove member state
  const [userToRemove, setUserToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Load project members on mount
  useEffect(() => {
    console.log("[TeamTab] useEffect triggered", {
      hasProjectId: !!DataProject?.id,
      projectId: DataProject?.id,
      hasToken: !!tokenData,
      tokenLength: tokenData?.length,
    });

    if (DataProject?.id && tokenData) {
      console.log("[TeamTab] Calling loadProjectMembers");
      loadProjectMembers();
    } else {
      console.log(
        "[TeamTab] Skipping loadProjectMembers - missing requirements"
      );
    }
  }, [DataProject?.id, tokenData]);

  // Load project members
  const loadProjectMembers = async () => {
    console.log("[loadProjectMembers] Starting", {
      projectId: DataProject?.id,
      hasToken: !!tokenData,
    });

    if (!DataProject?.id || !tokenData) {
      console.log("[loadProjectMembers] Aborted - missing data");
      return;
    }

    setIsLoadingMembers(true);
    try {
      console.log("[loadProjectMembers] Calling API...");
      const response = await GetProjectMembers(DataProject.id, tokenData);
      console.log("[loadProjectMembers] API Response:", response);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        console.log("[loadProjectMembers] Raw data:", response.data);
        setProjectMembers(response.data);
        console.log(
          "[loadProjectMembers] State updated with",
          response.data.length,
          "members"
        );
      } else {
        console.log(
          "[loadProjectMembers] Failed - statusCode:",
          response?.statusCode,
          "message:",
          response?.message
        );
      }
    } catch (error) {
      console.error("[loadProjectMembers] Error:", error);
    } finally {
      setIsLoadingMembers(false);
      console.log("[loadProjectMembers] Finished");
    }
  };

  // Load available users
  const loadAvailableUsers = async () => {
    if (!tokenData || searchUser.length < 3) {
      setAvailableUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const response = await List(
        {
          search: searchUser,
          limit: 50,
          page: 0,
          filterWhere: [],
          fieldOrder: ["nama"],
          orderDir: "asc",
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setAvailableUsers(response.data);
        // Preserve all loaded users for local state persistence
        setAllLoadedUsers(prev => {
          const newUsers = response.data!.filter(
            newUser => !prev.some(existingUser => existingUser.id === newUser.id)
          );
          return [...prev, ...newUsers];
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Open add member modal
  const handleAddMember = () => {
    setSearchUser("");
    setAvailableUsers([]);
    const currentMemberIds = projectMembers.map((m) => m.userData.id);
    setSelectedUserIds(currentMemberIds);
    // Initialize allLoadedUsers with existing project members
    setAllLoadedUsers(projectMembers.map((m) => m.userData));
    onAddModalOpen();
  };

  // Confirm add members
  const confirmAddMembers = async () => {
    if (!DataProject || !tokenData) return;

    const currentMemberIds = projectMembers.map((m) => m.userData.id);
    const assignUsers = selectedUserIds.filter(
      (id) => !currentMemberIds.includes(id)
    );
    const unassignUsers = currentMemberIds.filter(
      (id) => !selectedUserIds.includes(id)
    );

    if (assignUsers.length === 0 && unassignUsers.length === 0) {
      showToast({
        description: "No changes to save",
        statusToast: "info",
      });
      return;
    }

    setIsAddingMembers(true);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers,
          unassignUsers,
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK && response.data) {
        showToast({
          description: `Updated: ${response.data.assigned} added, ${response.data.unassigned} removed`,
          statusToast: "success",
        });
        onAddModalClose();
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to update team members",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating members:", error);
      showToast({
        description: "Failed to update team members",
        statusToast: "error",
      });
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Note: Add member functionality disabled - API endpoint not available

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle user status (ACTIVE <-> INACTIVE)
  const toggleUserStatus = async (
    userGuid: string,
    userName: string,
    currentStatus: string
  ) => {
    if (!DataProject || !tokenData) return;

    setTogglingUserId(userGuid);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers: currentStatus === "INACTIVE" ? [userGuid] : [],
          unassignUsers: currentStatus === "ACTIVE" ? [userGuid] : [],
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `User status changed to ${currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            }`,
          statusToast: "success",
        });
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to update status",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast({
        description: "Failed to update status",
        statusToast: "error",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  // Remove user (soft delete)
  const removeUser = async (userGuid: string, userName: string) => {
    if (!DataProject || !tokenData) return;

    setTogglingUserId(userGuid);
    try {
      const response = await RemoveProjectMember(
        {
          projectId: DataProject.id,
          userId: userGuid,
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "User removed from project",
          statusToast: "success",
        });
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to remove user",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error removing user:", error);
      showToast({
        description: "Failed to remove user",
        statusToast: "error",
      });
    } finally {
      setTogglingUserId(null);
    }
  };


  // Deactivate entire team
  const deactivateTeam = async (groupCode: string, groupName: string, members: ProjectUserAssignmentResponse[]) => {
    if (!DataProject || !tokenData) return;

    const activeUserIds = members
      .filter(m => m.userAssignStatus === "ACTIVE")
      .map(m => m.userData.id);

    if (activeUserIds.length === 0) {
      showToast({
        description: "No active members to deactivate",
        statusToast: "info",
      });
      return;
    }

    setProcessingTeam(groupCode);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers: [],
          unassignUsers: activeUserIds,
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Deactivated ${activeUserIds.length} members from ${groupName}`,
          statusToast: "success",
        });
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to deactivate team",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error deactivating team:", error);
      showToast({
        description: "Failed to deactivate team",
        statusToast: "error",
      });
    } finally {
      setProcessingTeam(null);
    }
  };

  // Remove entire team
  const removeTeam = async (groupCode: string, groupName: string, members: ProjectUserAssignmentResponse[]) => {
    if (!DataProject || !tokenData) return;

    setProcessingTeam(groupCode);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const member of members) {
        try {
          const response = await RemoveProjectMember(
            {
              projectId: DataProject.id,
              userId: member.userData.id,
            },
            tokenData
          );

          if (response?.statusCode === RES_CODE_OK) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast({
          description: `Removed ${successCount} members from ${groupName}${failCount > 0 ? ` (${failCount} failed)` : ''}`,
          statusToast: successCount === members.length ? "success" : "warning",
        });
        await loadProjectMembers();
      } else {
        showToast({
          description: "Failed to remove team members",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error removing team:", error);
      showToast({
        description: "Failed to remove team",
        statusToast: "error",
      });
    } finally {
      setProcessingTeam(null);
    }
  };

  // Activate entire team
  const activateTeam = async (groupCode: string, groupName: string, members: ProjectUserAssignmentResponse[]) => {
    if (!DataProject || !tokenData) return;

    const inactiveUserIds = members
      .filter(m => m.userAssignStatus === "INACTIVE")
      .map(m => m.userData.id);

    if (inactiveUserIds.length === 0) {
      showToast({
        description: "No inactive members to activate",
        statusToast: "info",
      });
      return;
    }

    setProcessingTeam(groupCode);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers: inactiveUserIds,
          unassignUsers: [],
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Activated ${inactiveUserIds.length} members from ${groupName}`,
          statusToast: "success",
        });
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to activate team",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error activating team:", error);
      showToast({
        description: "Failed to activate team",
        statusToast: "error",
      });
    } finally {
      setProcessingTeam(null);
    }
  };

  // Show confirmation dialog
  const showConfirmation = (
    caption: string,
    message: string,
    action: () => void
  ) => {
    setConfirmCaption(caption);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setOpenConfirmDialog(true);
  };

  const handleConfirmedAction = () => {
    if (confirmAction) {
      confirmAction();
    }
  };

  // Bulk deactivate members
  const bulkDeactivateMembers = async () => {
    if (!DataProject || !tokenData || selectedMemberIds.length === 0) return;

    setBulkProcessing(true);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers: [],
          unassignUsers: selectedMemberIds,
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Deactivated ${selectedMemberIds.length} members`,
          statusToast: "success",
        });
        setSelectedMemberIds([]);
        setIsEditMode(false);
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to deactivate members",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error deactivating members:", error);
      showToast({
        description: "Failed to deactivate members",
        statusToast: "error",
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Bulk activate members
  const bulkActivateMembers = async () => {
    if (!DataProject || !tokenData || selectedMemberIds.length === 0) return;

    setBulkProcessing(true);
    try {
      const response = await AssignUnassignMembers(
        {
          projectId: DataProject.id,
          assignUsers: selectedMemberIds,
          unassignUsers: [],
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Activated ${selectedMemberIds.length} members`,
          statusToast: "success",
        });
        setSelectedMemberIds([]);
        setIsEditMode(false);
        await loadProjectMembers();
      } else {
        showToast({
          description: response?.message || "Failed to activate members",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error activating members:", error);
      showToast({
        description: "Failed to activate members",
        statusToast: "error",
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Toggle member selection with status validation
  const toggleMemberSelection = (memberId: string, memberStatus: string) => {
    setSelectedMemberIds((prev) => {
      // If no members selected yet, allow selection
      if (prev.length === 0) {
        return [memberId];
      }

      // Get status of first selected member
      const firstSelectedMember = projectMembers.find(
        (m) => m.userData.id === prev[0]
      );
      const firstSelectedStatus = firstSelectedMember?.userAssignStatus;

      // If trying to select member with different status, show toast
      if (memberStatus !== firstSelectedStatus) {
        showToast({
          description: `Cannot mix ${firstSelectedStatus} and ${memberStatus} members. Deselect all first.`,
          statusToast: "warning",
        });
        return prev;
      }

      // Same status, allow selection/deselection
      return prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId];
    });
  };

  const handleDialogTrigger = () => {
    setOpenConfirmDialog(!openConfirmDialog);
  };

  // Filter users based on search - combine available and existing members
  const allUsers = [
    ...allLoadedUsers, // Use all loaded users instead of just current search results
    // Include ALL project members (both ACTIVE and INACTIVE) in modal selection
    ...projectMembers.map((m) => m.userData),
  ];
  
  const uniqueUsers = allUsers.filter(
    (user, index, self) => index === self.findIndex((u) => u?.id === user?.id)
  );

  const filteredUsers = uniqueUsers.filter(
    (user) => {
      // Always show users that are currently selected (locally)
      if (selectedUserIds.includes(user?.id || "")) {
        return true;
      }
      // For non-selected users, only show if they match current search AND are in current search results
      if (searchUser.length < 3) {
        return false; // Don't show any non-selected users if no search
      }
      const matchesSearch = user?.nama?.toLowerCase().includes(searchUser.toLowerCase()) ||
                           user?.email?.toLowerCase().includes(searchUser.toLowerCase());
      const isInCurrentSearch = availableUsers.some(au => au.id === user?.id);
      return matchesSearch && isInCurrentSearch;
    }
  );

  return (
    <TabPanel>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading
              size="lg"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              Team Management
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Manage project team members and their roles
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FiUserPlus />}
              rounded="full"
              onClick={handleAddMember}
              isDisabled={!canMake}
            >
              Update Member
            </Button>
            <Button
              size="sm"
              colorScheme={isEditMode ? "orange" : "gray"}
              variant={isEditMode ? "solid" : "outline"}
              leftIcon={<FiEdit />}
              rounded="full"
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedMemberIds([]);
              }}
              isDisabled={!canMake}
            >
              {isEditMode ? "Done" : "Select"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiRefreshCw />}
              colorScheme="gray"
              rounded="full"
              onClick={loadProjectMembers}
              isLoading={isLoadingMembers}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Bulk Actions Bar */}
        {isEditMode && selectedMemberIds.length > 0 && (() => {
          const selectedMember = projectMembers.find(
            (m) => m.userData.id === selectedMemberIds[0]
          );
          const selectedStatus = selectedMember?.userAssignStatus;

          return (
            <HStack
              bg={colorMode === "light" ? "blue.50" : "blue.900"}
              p={4}
              rounded="lg"
              spacing={3}
              justify="space-between"
            >
              <Text fontWeight="bold" color={colorMode === "light" ? "blue.800" : "blue.100"}>
                {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? "s" : ""} selected ({selectedStatus})
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => setSelectedMemberIds([])}
                  isDisabled={bulkProcessing}
                >
                  Unselect All
                </Button>
                {selectedStatus === "ACTIVE" ? (
                  <Button
                    size="sm"
                    colorScheme="orange"
                    onClick={() =>
                      showConfirmation(
                        "Deactivate Members",
                        `Are you sure you want to deactivate ${selectedMemberIds.length} selected member${selectedMemberIds.length !== 1 ? "s" : ""}?`,
                        bulkDeactivateMembers
                      )
                    }
                    isLoading={bulkProcessing}
                    isDisabled={bulkProcessing}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() =>
                        showConfirmation(
                          "Activate Members",
                          `Are you sure you want to activate ${selectedMemberIds.length} selected member${selectedMemberIds.length !== 1 ? "s" : ""}?`,
                          bulkActivateMembers
                        )
                      }
                      isLoading={bulkProcessing}
                      isDisabled={bulkProcessing}
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() =>
                        showConfirmation(
                          "Remove Members",
                          `Are you sure you want to permanently remove ${selectedMemberIds.length} selected member${selectedMemberIds.length !== 1 ? "s" : ""}? This action cannot be undone.`,
                          async () => {
                            setBulkProcessing(true);
                            try {
                              let successCount = 0;
                              for (const memberId of selectedMemberIds) {
                                const response = await RemoveProjectMember(
                                  {
                                    projectId: DataProject!.id,
                                    userId: memberId,
                                  },
                                  tokenData
                                );
                                if (response?.statusCode === RES_CODE_OK) {
                                  successCount++;
                                }
                              }
                              if (successCount > 0) {
                                showToast({
                                  description: `Removed ${successCount} members`,
                                  statusToast: "success",
                                });
                                setSelectedMemberIds([]);
                                setIsEditMode(false);
                                await loadProjectMembers();
                              }
                            } catch (error) {
                              showToast({
                                description: "Failed to remove members",
                                statusToast: "error",
                              });
                            } finally {
                              setBulkProcessing(false);
                            }
                          }
                        )
                      }
                      isLoading={bulkProcessing}
                      isDisabled={bulkProcessing}
                    >
                      Remove
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedMemberIds([]);
                  }}
                  isDisabled={bulkProcessing}
                >
                  Cancel
                </Button>
              </HStack>
            </HStack>
          );
        })()}

        {/* Team Members Grid */}
        {isLoadingMembers ? (
          <VStack py={8}>
            <Spinner size="lg" color="secondary.500" />
            <Text color="gray.500">Loading team members...</Text>
          </VStack>
        ) : projectMembers && projectMembers.length > 0 ? (
          <VStack spacing={8} align="stretch">
            {(() => {
              // First level: Group by status
              const statusGroups = projectMembers.reduce((acc, assignment) => {
                const status = assignment.userAssignStatus || "ACTIVE";
                if (!acc[status]) {
                  acc[status] = [];
                }
                acc[status].push(assignment);
                return acc;
              }, {} as Record<string, typeof projectMembers>);

              // Sort to show ACTIVE first
              const sortedStatuses = Object.entries(statusGroups).sort(
                ([a], [b]) => {
                  if (a === "ACTIVE") return -1;
                  if (b === "ACTIVE") return 1;
                  return 0;
                }
              );

              return sortedStatuses.map(([status, statusMembers]) => (
                <Box key={status}>
                  {/* Status Header */}
                  <HStack mb={4} spacing={3}>
                    <Heading
                      size="md"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >
                      {status} MEMBERS
                    </Heading>
                    <Badge
                      colorScheme={status === "ACTIVE" ? "green" : "red"}
                      fontSize="md"
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      {statusMembers.length}
                    </Badge>
                  </HStack>

                  {/* Second level: Group by organization */}
                  <VStack spacing={6} align="stretch" pl={4}>
                    {(() => {
                      const orgGroups = statusMembers.reduce(
                        (acc, assignment) => {
                          const member = assignment.userData;
                          const groupCode =
                            member?.team?.organization?.group?.orgCode ||
                            "UNREGISTERED";
                          const groupName =
                            member?.team?.organization?.group?.orgName ||
                            "UNREGISTERED MEMBER GROUP";
                          if (!acc[groupCode]) {
                            acc[groupCode] = { groupName, members: [] };
                          }
                          acc[groupCode].members.push(assignment);
                          return acc;
                        },
                        {} as Record<
                          string,
                          { groupName: string; members: typeof statusMembers }
                        >
                      );

                      return Object.entries(orgGroups).map(
                        ([groupCode, { groupName, members }]) => (
                          <Box key={groupCode}>
                            <HStack mb={3} spacing={3} justify="space-between">
                              <HStack spacing={3}>
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color={
                                    colorMode === "light"
                                      ? "gray.700"
                                      : "gray.300"
                                  }
                                >
                                  {groupName}
                                </Text>
                                <Badge
                                  colorScheme="blue"
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  rounded="full"
                                >
                                  {members.length}
                                </Badge>
                              </HStack>
                              {canMake && status !== "ACTIVE" && (
                                <HStack spacing={2}>
                                </HStack>
                              )}
                            </HStack>
                            <VStack spacing={3} align="stretch">
                              {members.map((assignment, index) => {
                                const member = assignment.userData;
                                return (
                                  <Card
                                    key={index}
                                    shadow="md"
                                    rounded={radiusStyle}
                                    border="1px"
                                    borderColor={
                                      colorMode === "light"
                                        ? "gray.200"
                                        : "gray.700"
                                    }
                                    bg={
                                      colorMode === "light"
                                        ? "white"
                                        : "gray.800"
                                    }
                                    _hover={{
                                      shadow: "lg",
                                      borderColor: "blue.400",
                                    }}
                                    transition="all 0.2s"
                                  >
                                    <CardBody p={4}>
                                      <HStack spacing={4}>
                                        <Avatar
                                          size="md"
                                          name={member.nama || "Team Member"}
                                          bg="blue.500"
                                        />
                                        <VStack
                                          align="start"
                                          spacing={1}
                                          flex={1}
                                        >
                                          <Text
                                            fontWeight="bold"
                                            fontSize="md"
                                            color={
                                              colorMode === "light"
                                                ? "gray.800"
                                                : "white"
                                            }
                                          >
                                            {member.nama || "Team Member"}
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            color={
                                              colorMode === "light"
                                                ? "gray.600"
                                                : "gray.400"
                                            }
                                          >
                                            {member.team?.teamName ||
                                              member.jabatan ||
                                              "No team"}
                                          </Text>
                                          <Text
                                            fontSize="xs"
                                            color={
                                              colorMode === "light"
                                                ? "gray.500"
                                                : "gray.500"
                                            }
                                          >
                                            {member.email || "No email"}
                                          </Text>
                                        </VStack>
                                        <VStack align="end" spacing={1}>
                                          <Text fontSize="xs" color="gray.500">
                                            User Assign Status
                                          </Text>
                                          <HStack spacing={2}>
                                            <Badge
                                              colorScheme={
                                                assignment.userAssignStatus ===
                                                  "ACTIVE"
                                                  ? "green"
                                                  : "red"
                                              }
                                              px={3}
                                              py={1}
                                              rounded="full"
                                            >
                                              {assignment.userAssignStatus}
                                            </Badge>
                                            {isEditMode ? (
                                              <Checkbox
                                                isChecked={selectedMemberIds.includes(
                                                  member.id
                                                )}
                                                onChange={() =>
                                                  toggleMemberSelection(
                                                    member.id,
                                                    assignment.userAssignStatus
                                                  )
                                                }
                                                size="lg"
                                              />
                                            ) : (
                                              <Menu>
                                                <MenuButton
                                                  as={IconButton}
                                                  icon={<FiMoreVertical />}
                                                  size="xs"
                                                  variant="ghost"
                                                  isLoading={
                                                    togglingUserId === member.id
                                                  }
                                                />
                                                <MenuList>
                                                  {assignment.userAssignStatus ===
                                                    "ACTIVE" ? (
                                                    <MenuItem
                                                      onClick={() =>
                                                        showConfirmation(
                                                          "Deactivate User",
                                                          `Are you sure you want to deactivate "${member.nama}" from this project?`,
                                                          () =>
                                                            toggleUserStatus(
                                                              member.id,
                                                              member.nama,
                                                              assignment.userAssignStatus
                                                            )
                                                        )
                                                      }
                                                      color="orange.500"
                                                    >
                                                      Deactivate
                                                    </MenuItem>
                                                  ) : (
                                                    <>
                                                      <MenuItem
                                                        onClick={() =>
                                                          showConfirmation(
                                                            "Activate User",
                                                            `Are you sure you want to activate "${member.nama}" for this project?`,
                                                            () =>
                                                              toggleUserStatus(
                                                                member.id,
                                                                member.nama,
                                                                assignment.userAssignStatus
                                                              )
                                                          )
                                                        }
                                                        color="green.500"
                                                      >
                                                        Activate
                                                      </MenuItem>
                                                      <MenuItem
                                                        onClick={() =>
                                                          showConfirmation(
                                                            "Remove User",
                                                            `Are you sure you want to permanently remove "${member.nama}" from this project? This action cannot be undone.`,
                                                            () =>
                                                              removeUser(
                                                                member.id,
                                                                member.nama
                                                              )
                                                          )
                                                        }
                                                        color="red.500"
                                                      >
                                                        Remove
                                                      </MenuItem>
                                                    </>
                                                  )}
                                                </MenuList>
                                              </Menu>
                                            )}
                                          </HStack>
                                        </VStack>
                                      </HStack>
                                    </CardBody>
                                  </Card>
                                );
                              })}
                            </VStack>
                          </Box>
                        )
                      );
                    })()}
                  </VStack>
                </Box>
              ));
            })()}
          </VStack>
        ) : (
          <Card
            p={8}
            textAlign="center"
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
            rounded="lg"
            border="2px dashed"
            borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          >
            <VStack spacing={4}>
              <FiUsers size={48} color="gray" />
              <Text color="gray.500" fontSize="lg" fontWeight="medium">
                No team members assigned
              </Text>
              <Text color="gray.400" fontSize="sm">
                Add team members to start collaborating on this project
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<FiUserPlus />}
                rounded="full"
                mt={4}
                onClick={handleAddMember}
              >
                Add First Member
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        isCentered
        size="4xl"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          mx={4}
          rounded={radiusStyle}
          shadow="2xl"
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader
            fontSize="xl"
            fontWeight="bold"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Team Management
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Left: Project Assigns */}
              <Card
                rounded={radiusStyle}
                boxShadow="md"
                bgGradient="linear(to-br, secondary.800, secondary.500)"
                color="white"
                minH="50vh"
              >
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Text pb={1} fontWeight={600}>
                      Project Assigns ({selectedUserIds.length})
                    </Text>
                    <Box overflowY="auto" minH="50vh" maxH="60vh">
                      {selectedUserIds.length === 0 ? (
                        <Text pt={5} textAlign="center">
                          No users assigned
                        </Text>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {(() => {
                            const selectedUsers = uniqueUsers.filter((u) =>
                              selectedUserIds.includes(u?.id || "")
                            );
                            const grouped = selectedUsers.reduce(
                              (acc, member) => {
                                const groupCode =
                                  member?.team?.organization?.group?.orgCode ||
                                  "UNREGISTERED";
                                const groupName =
                                  member?.team?.organization?.group?.orgName ||
                                  "UNREGISTERED MEMBER GROUP";
                                if (!acc[groupCode]) {
                                  acc[groupCode] = { groupName, members: [] };
                                }
                                acc[groupCode].members.push(member);
                                return acc;
                              },
                              {} as Record<
                                string,
                                {
                                  groupName: string;
                                  members: typeof selectedUsers;
                                }
                              >
                            );

                            return Object.entries(grouped).map(
                              ([groupCode, { groupName, members }]) => (
                                <Box key={groupCode} w="full">
                                  <Text
                                    pb={2}
                                    fontWeight={700}
                                    fontSize="md"
                                    color="white"
                                  >
                                    {groupName} ({members.length})
                                  </Text>
                                  <SimpleGrid columns={1} spacing={2}>
                                    {members.map((dt) => (
                                      <Card
                                        key={dt?.id}
                                        shadow="md"
                                        rounded="lg"
                                        border="1px"
                                        borderColor="gray.200"
                                        bg={
                                          colorMode === "light"
                                            ? "white"
                                            : "gray.800"
                                        }
                                        _hover={{
                                          transform: "translateY(-1px)",
                                          shadow: "lg",
                                        }}
                                        transition="all 0.2s"
                                      >
                                        <CardBody p={3}>
                                          <HStack spacing={3}>
                                            <Avatar name={dt?.nama} size="sm" />
                                            <VStack
                                              align="start"
                                              spacing={0}
                                              flex={1}
                                            >
                                              <Text
                                                color={
                                                  colorMode === "light"
                                                    ? "gray.900"
                                                    : "gray.100"
                                                }
                                                fontWeight={600}
                                                fontSize="sm"
                                              >
                                                {dt?.nama}
                                              </Text>
                                              <Text
                                                fontWeight={500}
                                                fontSize="xs"
                                                color={
                                                  colorMode === "light"
                                                    ? "secondary.800"
                                                    : "secondary.200"
                                                }
                                              >
                                                {dt?.team?.teamName ||
                                                  dt?.jabatan}
                                              </Text>
                                            </VStack>
                                            <IconButton
                                              aria-label="Remove user"
                                              icon={<FiUserMinus />}
                                              colorScheme="red"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleUserSelect(dt?.id || "")
                                              }
                                            />
                                          </HStack>
                                        </CardBody>
                                      </Card>
                                    ))}
                                  </SimpleGrid>
                                </Box>
                              )
                            );
                          })()}
                        </VStack>
                      )}
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Right: Assign New User */}
              <VStack align="stretch" spacing={4}>
                <Card rounded={radiusStyle} boxShadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight={600} fontSize="lg">
                        Assign New User
                      </Text>

                      <FormControl>
                        <FormLabel fontSize="sm">
                          Search Users (min 3 characters)
                        </FormLabel>
                        <Input
                          value={searchUser}
                          onChange={(e) => {
                            setSearchUser(e.target.value);
                            if (e.target.value.length >= 3) {
                              loadAvailableUsers();
                            } else {
                              setAvailableUsers([]);
                            }
                          }}
                          placeholder="Search by ID or Name"
                        />
                      </FormControl>

                      <Box overflowY="auto" minH="50vh" maxH="60vh">
                        {searchUser.length < 3 ? (
                          <Text
                            textAlign="center"
                            color="gray.500"
                            py={4}
                            fontSize="sm"
                          >
                            Type at least 3 characters to search
                          </Text>
                        ) : isLoadingUsers ? (
                          <VStack py={4}>
                            <Spinner size="md" color="secondary.500" />
                            <Text fontSize="sm" color="gray.500">
                              Loading users...
                            </Text>
                          </VStack>
                        ) : filteredUsers.length > 0 ? (
                          <VStack spacing={2}>
                            {filteredUsers.map((dt) => {
                              const isSelected = selectedUserIds.includes(
                                dt?.id || ""
                              );
                              return (
                                <HStack
                                  key={dt?.id}
                                  bg={
                                    colorMode === "light"
                                      ? "gray.100"
                                      : "gray.700"
                                  }
                                  w="full"
                                  py={3}
                                  px={4}
                                  rounded={radiusStyle}
                                  boxShadow="md"
                                  spacing={4}
                                >
                                  <Avatar name={dt?.nama} size="sm" />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text
                                      color="gray.900"
                                      fontWeight={600}
                                      fontSize="sm"
                                    >
                                      {dt?.nama}
                                    </Text>
                                    <Text
                                      fontWeight={500}
                                      fontSize="xs"
                                      color="gray.700"
                                    >
                                      {dt?.team?.teamName || dt?.jabatan}
                                    </Text>
                                  </VStack>
                                  <Button
                                    rounded={radiusStyle}
                                    colorScheme="green"
                                    size="sm"
                                    isDisabled={isSelected}
                                    onClick={() =>
                                      handleUserSelect(dt?.id || "")
                                    }
                                  >
                                    <FiUserPlus />
                                  </Button>
                                </HStack>
                              );
                            })}
                          </VStack>
                        ) : (
                          <Text
                            textAlign="center"
                            color="gray.500"
                            py={4}
                            fontSize="sm"
                          >
                            No users found
                          </Text>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={confirmAddMembers}
              isLoading={isAddingMembers}
            >
              Update Member{selectedUserIds.length !== 1 ? "s" : ""}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpenTrigger={openConfirmDialog}
        action={handleConfirmedAction}
        trigger={handleDialogTrigger}
        questionMsg={confirmMessage}
        captionMsg={confirmCaption}
      />
    </TabPanel>
  );
};

export default TeamTab;
