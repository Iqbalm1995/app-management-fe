"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import useProjects, { ProjectUpdatePICPayload } from "@/app/services/useProjects";
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
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC } from "@/app/constants/applicationConstants";
import { FiUsers, FiUserPlus, FiSettings, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";

interface TeamTabProps {
  DataProject: ProjectDataResponse | null;
}

const TeamTab = ({ DataProject }: TeamTabProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UpdatePIC } = useProjects();
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

  // Add member state
  const [availableUsers, setAvailableUsers] = useState<UsersResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Load available users
  const loadAvailableUsers = async () => {
    if (!tokenData) return;

    setIsLoadingUsers(true);
    try {
      const response = await List(
        {
          search: searchUser,
          limit: 50,
          page: 1,
          filterWhere: [],
          fieldOrder: ["nama"],
          orderDir: "asc",
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK && response.data) {
        // Filter out users already in the project
        const currentMemberIds = DataProject?.userAssignment?.map(member => member.userId) || [];
        const filteredUsers = response.data.filter(
          (user: any) => !currentMemberIds.includes(user.id)
        );
        setAvailableUsers(filteredUsers);
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
    setSelectedUserIds([]);
    onAddModalOpen();
    loadAvailableUsers();
  };

  // Confirm add members
  const confirmAddMembers = async () => {
    if (!DataProject || !tokenData || selectedUserIds.length === 0) return;

    setIsAddingMembers(true);
    try {
      const payload: ProjectUpdatePICPayload = {
        projectId: DataProject.id,
        dataUserId: selectedUserIds, // Only new members
      };

      const response = await UpdatePIC(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: `${selectedUserIds.length} member(s) added successfully`,
          statusToast: "success",
        });
        onAddModalClose();
        setSelectedUserIds([]);
        window.location.reload();
      } else {
        showToast({
          description: response?.message || "Failed to add team members",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error adding members:", error);
      showToast({
        description: "Failed to add team members",
        statusToast: "error",
      });
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Note: Add member functionality disabled - API endpoint not available

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter users based on search
  const filteredUsers = availableUsers.filter((user: UsersResponse) =>
    user.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
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
            >
              Add Member
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiSettings />}
              colorScheme="gray"
              rounded="full"
            >
              Settings
            </Button>
          </HStack>
        </HStack>

        {/* Team Members Grid */}
        {DataProject?.userAssignment &&
          DataProject.userAssignment.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {DataProject.userAssignment.map((member, index) => (
              <Card
                key={index}
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Avatar
                      size="lg"
                      name={member.userData?.nama || "Team Member"}
                      bg="blue.500"
                    />
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {member.userData?.nama || "Team Member"}
                      </Text>
                      <Badge colorScheme="blue" px={3} py={1} rounded="full">
                        Member
                      </Badge>
                    </VStack>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {member.userData?.email || "No email provided"}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
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
        size="md"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          mx={4}
          rounded="2xl"
          shadow="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader
            fontSize="xl"
            fontWeight="bold"
            color={colorMode === "light" ? "gray.800" : "white"}
            pb={4}
          >
            <HStack spacing={3}>
              <Box w="12px" h="12px" rounded="full" bg="secondary.400" />
              <Text>Add Team Member</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color={colorMode === "light" ? "gray.600" : "gray.300"}>
                Select users to add to this project team:
              </Text>

              {/* Search Users */}
              <FormControl>
                <FormLabel
                  fontWeight="medium"
                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                >
                  Search Users
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      loadAvailableUsers();
                    }}
                    placeholder="Search by name or email..."
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    border="2px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                    _focus={{
                      borderColor: "secondary.500",
                    }}
                  />
                </InputGroup>
              </FormControl>

              {/* User List */}
              <Box
                maxH="300px"
                overflowY="auto"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                rounded="xl"
                p={3}
              >
                {isLoadingUsers ? (
                  <VStack py={4}>
                    <Spinner size="md" color="secondary.500" />
                    <Text fontSize="sm" color="gray.500">
                      Loading users...
                    </Text>
                  </VStack>
                ) : filteredUsers.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {filteredUsers.map((user) => (
                      <HStack
                        key={user.id}
                        p={3}
                        rounded="lg"
                        _hover={{
                          bg: colorMode === "light" ? "gray.50" : "gray.700",
                        }}
                        cursor="pointer"
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <Checkbox
                          isChecked={selectedUserIds.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          colorScheme="secondary"
                        />
                        <Avatar size="sm" name={user.nama} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {user.nama}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text
                    textAlign="center"
                    color="gray.500"
                    fontSize="sm"
                    py={4}
                  >
                    No users found
                  </Text>
                )}
              </Box>

              {selectedUserIds.length > 0 && (
                <Text fontSize="sm" color="secondary.500" fontWeight="medium">
                  {selectedUserIds.length} user(s) selected
                </Text>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter
            pt={4}
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          >
            <HStack spacing={3} w="full" justify="flex-end">
              <Button
                variant="outline"
                colorScheme="gray"
                rounded="xl"
                px={6}
                onClick={onAddModalClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="secondary"
                rounded="xl"
                px={6}
                onClick={confirmAddMembers}
                isLoading={isAddingMembers}
                loadingText="Adding..."
                isDisabled={selectedUserIds.length === 0}
              >
                Add {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ""}Member{selectedUserIds.length !== 1 ? "s" : ""}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TabPanel>
  );
};

export default TeamTab;
