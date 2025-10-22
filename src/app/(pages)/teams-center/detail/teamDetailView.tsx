"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, {
  TeamsResponse,
  TeamsUserMemberResponse,
} from "@/app/services/useTeams";
import { UsersResponse } from "@/app/services/useUsers";
import useUsers from "@/app/services/useUsers";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useSpecialization, {
  SpecializationResponse,
} from "@/app/services/useSpecialization";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  useColorMode,
  Icon,
  Badge,
  Avatar,
  Button,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaUsersRays, FaArrowLeft } from "react-icons/fa6";
import {
  FiCalendar,
  FiUser,
  FiEdit,
  FiUsers,
  FiHome,
  FiSave,
  FiX,
  FiPlus,
} from "react-icons/fi";

interface TeamDetailViewProps { }

function TeamDetailView({ }: TeamDetailViewProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("id");

  const {
    GetDetailById,
    ListMembers,
    UpdateTeams,
    RemoveTeamMember,
    InsertTeamMember,
  } = useTeams();
  const { List: ListUsers } = useUsers();
  const { List: ListOrganizations } = useOrganization();
  const { List: ListSpecializations } = useSpecialization();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Team data
  const [TeamData, setTeamData] = useState<TeamsResponse | null>(null);
  const [MembersData, setMembersData] = useState<UsersResponse[]>([]);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Members pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const membersPerPage = 5;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [GroupData, setGroupData] = useState<OrganizationResponse[]>([]);
  const [DirectorateData, setDirectorateData] = useState<
    OrganizationResponse[]
  >([]);
  const [DivisionData, setDivisionData] = useState<OrganizationResponse[]>([]);
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // Confirmation dialog state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const cancelRef = useRef<any>(null);

  // Add member modal state
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const [availableUsers, setAvailableUsers] = useState<UsersResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchUser, setSearchUser] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UsersResponse[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationResponse[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Header content
  const [HeaderDataContent, setHeaderDataContent] =
    useState<HeaderContentProps>({
      titleName: "Team Details",
      breadCrumb: ["Home", "Teams Center", "Team Details"],
    });

  // Form validation schema
  const ValidationSchema = Yup.object().shape({
    teamName: Yup.string()
      .required("Team name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    teamDesc: Yup.string().max(500, "Maximum 500 characters"),
    orgGroupId: Yup.string().required("Organization group is required"),
    isActive: Yup.string().required("Status is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      teamName: "",
      teamDesc: "",
      orgGroupId: "",
      isActive: "ACTIVE",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleUpdateTeam(values);
    },
  });

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

  // Load team data
  useEffect(() => {
    if (teamId && tokenData && DataAuth) {
      GetTeamData();
      GetTeamMembers();
      LoadGroupData();
    }
  }, [teamId, tokenData, DataAuth]);

  // Update form values when TeamData changes
  useEffect(() => {
    if (TeamData) {
      formik.setValues({
        teamName: TeamData.teamName,
        teamDesc: TeamData.teamDesc || "",
        orgGroupId: TeamData.orgGroupId,
        isActive: TeamData.isActive,
      });
    }
  }, [TeamData]);

  // Initialize selections when entering edit mode and data is available
  useEffect(() => {
    if (
      isEditMode &&
      TeamData &&
      DirectorateData.length > 0 &&
      DivisionData.length > 0 &&
      GroupData.length > 0
    ) {
      if (TeamData.directorate?.id) {
        setSelectedDirectorate(TeamData.directorate.id);
      }
      if (TeamData.division?.id) {
        setSelectedDivision(TeamData.division.id);
      }
      if (TeamData.group?.id) {
        setSelectedGroup(TeamData.group.id);
      }
    }
  }, [isEditMode, TeamData, DirectorateData, DivisionData, GroupData]);

  // Reset division and group when directorate changes
  useEffect(() => {
    if (selectedDirectorate !== "") {
      setSelectedDivision("");
      setSelectedGroup("");
      formik.setFieldValue("orgGroupId", "");
    }
  }, [selectedDirectorate]);

  // Reset group when division changes
  useEffect(() => {
    if (selectedDivision !== "") {
      formik.setFieldValue("orgGroupId", "");
    }
  }, [selectedDivision]);

  const GetTeamData = async () => {
    if (!teamId || !tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      setIsLoadingProcess(true);
      const requestData = await GetDetailById(teamId, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as TeamsResponse;
      setTeamData(data);

      // Set current organization selections
      if (data.directorate?.id) {
        setSelectedDirectorate(data.directorate.id);
      }
      if (data.division?.id) {
        setSelectedDivision(data.division.id);
      }
      if (data.group?.id) {
        setSelectedGroup(data.group.id);
      }

      // Update header with team name
      setHeaderDataContent({
        titleName: data.teamName,
        breadCrumb: ["Home", "Teams Center", data.teamName],
      });
    } catch (error) {
      console.error("Error fetching team data:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const GetTeamMembers = async () => {
    if (!teamId || !tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      const payload = {
        search: "",
        teamId: teamId,
        limit: 999,
        page: 0,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc" as const,
      };

      // console.log("Loading team members with payload:", payload);
      const requestData = await ListMembers(payload, tokenData);
      // console.log("Team members response:", requestData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        console.error("Error fetching team members:", requestData?.message);
        return;
      }

      const data = requestData.data as UsersResponse[];
      // console.log("Team members data:", data);
      setMembersData(data);
      setTotalMembers(data.length);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const LoadGroupData = async () => {
    if (!tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      // Load Directorates (always load all)
      const PayloadDirectorate = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: [
          { field: "orgType", operator: "=", value: "DIRECTORATE" },
        ],
      };

      const directorateResponse = await ListOrganizations(
        PayloadDirectorate as any,
        tokenData
      );
      if (
        directorateResponse?.statusCode === RES_CODE_OK &&
        directorateResponse.data
      ) {
        setDirectorateData(directorateResponse.data as OrganizationResponse[]);
      }

      // Load Divisions - if no directorate selected, load current team's division's parent divisions
      let divisionFilter = [
        { field: "orgType", operator: "=", value: "DIVISION" },
      ];
      if (selectedDirectorate) {
        divisionFilter.push({
          field: "parentId",
          operator: "=",
          value: selectedDirectorate,
        });
      } else if (TeamData?.directorate?.id) {
        // Load divisions under current team's directorate
        divisionFilter.push({
          field: "parentId",
          operator: "=",
          value: TeamData.directorate.id,
        });
      }

      const PayloadDivision = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: divisionFilter,
      };

      const divisionResponse = await ListOrganizations(
        PayloadDivision as any,
        tokenData
      );
      if (
        divisionResponse?.statusCode === RES_CODE_OK &&
        divisionResponse.data
      ) {
        setDivisionData(divisionResponse.data as OrganizationResponse[]);
      }

      // Load Groups - if no division selected, load current team's group's parent groups
      let groupFilter = [{ field: "orgType", operator: "=", value: "GROUP" }];
      if (selectedDivision) {
        groupFilter.push({
          field: "parentId",
          operator: "=",
          value: selectedDivision,
        });
      } else if (TeamData?.division?.id) {
        // Load groups under current team's division
        groupFilter.push({
          field: "parentId",
          operator: "=",
          value: TeamData.division.id,
        });
      }

      const PayloadGroup = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: groupFilter,
      };

      const groupResponse = await ListOrganizations(
        PayloadGroup as any,
        tokenData
      );
      if (groupResponse?.statusCode === RES_CODE_OK && groupResponse.data) {
        setGroupData(groupResponse.data as OrganizationResponse[]);
      }
    } catch (error) {
      console.error("Error loading organization data:", error);
    }
  };

  const handleUpdateTeam = async (values: any) => {
    if (!teamId || !tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      setIsUpdating(true);

      // Find selected group to get orgGroupCode
      const selectedGroup = GroupData.find(
        (group) => group.id === values.orgGroupId
      );

      if (!selectedGroup) {
        showToast({
          description: "Please select a valid organization group",
          statusToast: "error",
        });
        return;
      }

      // Build FormData directly to match API expectations
      const formData = new FormData();
      formData.append("Id", teamId);
      formData.append("TeamName", values.teamName || "");
      formData.append("TeamDesc", values.teamDesc || "");
      formData.append("IsActive", values.isActive || "ACTIVE");
      formData.append("deletePict", "false");
      formData.append("orgGroupId", values.orgGroupId);
      formData.append("orgGroupCode", selectedGroup.orgCode);

      // console.log("Update FormData fields:");
      // for (let [key, value] of formData.entries()) {
      //   console.log(key, value);
      // }

      // Call API directly with FormData
      const UrlEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_API_PORT_BASIC}`;
      const PathEndpoint = "/v1/Teams/update";

      const response = await fetch(`${UrlEndpoint}${PathEndpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData}`,
        },
        body: formData,
      });

      const requestData = await response.json();

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Team updated successfully",
        statusToast: "success",
      });

      // Refresh team data and exit edit mode
      await GetTeamData();
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating team:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const loadSpecializations = async () => {
    if (!tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      const payload = {
        search: "",
        limit: 999,
        page: 0,
        fieldOrder: ["specName"],
        orderDir: "asc" as const,
        filterWhere: [],
      };

      const response = await ListSpecializations(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setSpecializations(response.data);
      }
    } catch (error) {
      console.error("Error loading specializations:", error);
    }
  };

  const loadAvailableUsers = async () => {
    if (!tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      const payload = {
        search: "",
        limit: 999,
        page: 0,
        fieldOrder: ["nama"],
        orderDir: "asc" as const,
        filterWhere: [],
      };

      const response = await ListUsers(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        // Filter out users who are already team members
        const currentMemberIds = MembersData.map((member) => member.id);
        const available = response.data.filter(
          (user) => !currentMemberIds.includes(user.id)
        );
        setAvailableUsers(available);
        setFilteredUsers(available);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Filter users based on search
  useEffect(() => {
    if (searchUser.trim() === "") {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(
        (user) =>
          user.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
          (user.email &&
            user.email.toLowerCase().includes(searchUser.toLowerCase())) ||
          user.userId.toLowerCase().includes(searchUser.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchUser, availableUsers]);

  const handleAddMember = () => {
    loadAvailableUsers();
    loadSpecializations();
    setSearchUser("");
    setSelectedUserIds([]);
    setSelectedRoleId("");
    onAddModalOpen();
  };

  const confirmAddMember = async () => {
    if (
      selectedUserIds.length === 0 ||
      !selectedRoleId ||
      !teamId ||
      !tokenData
    )
      return;

    setIsAddingMember(true);
    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      // Add members one by one
      for (const userId of selectedUserIds) {
        const payload = {
          userId: userId,
          teamId: teamId,
          teamRoleId: selectedRoleId,
        };

        const response = await InsertTeamMember(payload, tokenData);

        if (!response || response.statusCode !== RES_CODE_OK) {
          const userName =
            availableUsers.find((u) => u.id === userId)?.nama || "User";
          showToast({
            description: `Failed to add ${userName}: ${response?.message || RES_GENERIC_ERROR_MSG
              }`,
            statusToast: "error",
          });
          continue;
        }
      }

      showToast({
        description: `${selectedUserIds.length} member(s) added successfully`,
        statusToast: "success",
      });

      // Refresh team members
      await GetTeamMembers();
      onAddModalClose();
      setSelectedUserIds([]);
      setSelectedRoleId("");
    } catch (error) {
      console.error("Error adding members:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    setMemberToRemove({ id: userId, name: memberName });
    onOpen();
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !teamId || !tokenData) return;

    try {
      // Get a default specialization ID if available, otherwise use placeholder
      const defaultRoleId = specializations.length > 0 ? specializations[0].id : "default-role";
      const payload = {
        userId: memberToRemove.id,
        teamId: teamId,
        teamRoleId: defaultRoleId,
      };

      const response = await RemoveTeamMember(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: `${memberToRemove.name} removed successfully`,
        statusToast: "success",
      });

      // Refresh team members
      await GetTeamMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      onClose();
      setMemberToRemove(null);
    }
  };

  // Reload divisions when directorate changes
  useEffect(() => {
    if (selectedDirectorate) {
      setSelectedDivision("");
      setSelectedGroup("");
      setSelectedGroup("");
      LoadGroupData();
    }
  }, [selectedDirectorate]);

  // Reload groups when division changes
  useEffect(() => {
    if (selectedDivision) {
      setSelectedGroup("");
      LoadGroupData();
    }
  }, [selectedDivision]);

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset selections
    setSelectedDirectorate("");
    setSelectedDivision("");
    setSelectedGroup("");
    // Reset form to original values
    if (TeamData) {
      formik.setValues({
        teamName: TeamData.teamName,
        teamDesc: TeamData.teamDesc || "",
        orgGroupId: TeamData.orgGroupId,
        isActive: TeamData.isActive,
      });
    }
  };

  if (IsLoadingProcess) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Loading..."
          breadCrumb={["Home", "Teams Center", "Team Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Loading team details...</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  if (!TeamData) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Team Not Found"
          breadCrumb={["Home", "Teams Center", "Team Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Team not found or error loading data.</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        {/* Elegant Modern Header */}
        <Card
          rounded="2xl"
          overflow="hidden"
          mb={8}
          shadow="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <CardBody p={8} bg="secondary.500">
            {/* Back Button */}
            <Button
              variant="ghost"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => router.push("/teams-center")}
              mb={6}
              color="whiteAlpha.800"
              size="sm"
              _hover={{
                bg: "whiteAlpha.200",
              }}
            >
              Back to Teams Center
            </Button>

            <HStack spacing={6} align="start" justify="space-between">
              {/* Left Section - Avatar & Info */}
              <HStack spacing={6} align="center" flex="1">
                {/* Team Avatar with Elegant Status */}
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    name={TeamData.teamCode}
                    bg="secondary.500"
                    color="white"
                    fontSize="3xl"
                    fontWeight="bold"
                    shadow="lg"
                    border="3px solid"
                    borderColor="white"
                  />
                  {/* Status Indicator */}
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    w="24px"
                    h="24px"
                    rounded="full"
                    bg={
                      TeamData.isActive === "ACTIVE" ? "green.400" : "red.400"
                    }
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "gray.800"}
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box w="8px" h="8px" rounded="full" bg="white" />
                  </Box>
                </Box>

                {/* Team Information */}
                <VStack align="start" spacing={3} flex="1">
                  <VStack align="start" spacing={1}>
                    <Heading
                      size="xl"
                      color="white"
                      fontWeight="bold"
                      letterSpacing="tight"
                    >
                      {TeamData.teamName}
                    </Heading>
                    <HStack spacing={3}>
                      <Text
                        fontSize="md"
                        color="whiteAlpha.800"
                        fontWeight="medium"
                        fontFamily="mono"
                      >
                        #{TeamData.teamCode}
                      </Text>
                      <Badge
                        colorScheme={
                          TeamData.isActive === "ACTIVE" ? "green" : "red"
                        }
                        variant="subtle"
                        px={3}
                        py={1}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="capitalize"
                      >
                        {TeamData.isActive.toLowerCase()}
                      </Badge>
                    </HStack>
                  </VStack>

                  {/* Organization Info */}
                  {/* <VStack align="start" spacing={1}>
                    <Text
                      fontSize="sm"
                      color="whiteAlpha.700"
                      fontWeight="medium"
                    >
                      Organization
                    </Text>
                    <Text
                      fontSize="sm"
                      color="whiteAlpha.900"
                      fontWeight="medium"
                    >
                      {TeamData.group?.orgName} ({TeamData.group?.orgCode})
                    </Text>
                  </VStack> */}

                  {/* Team Stats */}
                  <HStack spacing={6} mt={2}>
                    <VStack spacing={0} align="start">
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {MembersData.length}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Members
                      </Text>
                    </VStack>
                    <Box w="1px" h="30px" bg="whiteAlpha.300" />
                    <VStack spacing={0} align="start">
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {TeamData.createdAt
                          ? new Date(TeamData.createdAt).getFullYear()
                          : "N/A"}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Since
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </HStack>

              {/* Right Section - Action Buttons */}
              <VStack spacing={3} align="center" justify="center">
                {isEditMode ? (
                  <HStack spacing={3}>
                    <Button
                      colorScheme="green"
                      leftIcon={<Icon as={FiSave} />}
                      rounded="xl"
                      size="md"
                      fontWeight="semibold"
                      shadow="lg"
                      px={6}
                      py={6}
                      onClick={() => formik.handleSubmit()}
                      isLoading={isUpdating}
                      _hover={{
                        transform: "translateY(-2px)",
                        shadow: "xl",
                      }}
                      transition="all 0.2s"
                    >
                      Save Changes
                    </Button>
                    <Button
                      bg="white"
                      color="gray.700"
                      border="2px"
                      borderColor="white"
                      leftIcon={<Icon as={FiX} />}
                      rounded="xl"
                      size="md"
                      fontWeight="semibold"
                      px={6}
                      py={6}
                      onClick={handleCancelEdit}
                      _hover={{
                        bg: "gray.100",
                        transform: "translateY(-2px)",
                        shadow: "lg",
                      }}
                      transition="all 0.2s"
                    >
                      Cancel
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    bg="white"
                    color="secondary.600"
                    border="2px"
                    borderColor="white"
                    leftIcon={<Icon as={FiEdit} />}
                    rounded="xl"
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    py={6}
                    fontSize="md"
                    onClick={handleEditMode}
                    isDisabled={false}
                    _hover={{
                      bg: "whiteAlpha.900",
                      transform: "translateY(-2px)",
                      shadow: "xl",
                    }}
                    transition="all 0.2s"
                  >
                    Edit Team
                  </Button>
                )}

                {/* Last Updated Info */}
                <Text fontSize="xs" color="whiteAlpha.600" textAlign="right">
                  Last updated{" "}
                  {TeamData.updatedAt
                    ? new Date(TeamData.updatedAt).toLocaleDateString()
                    : new Date(TeamData.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Left Column - Main Content */}
          <GridItem>
            <VStack spacing={8} align="stretch">
              {/* Description Card */}
              <Card
                rounded="3xl"
                shadow="xl"
                border="0"
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  h: "4px",
                  bgGradient: "linear(to-r, secondary.400, purple.400)",
                }}
              >
                <CardHeader
                  bgGradient={
                    colorMode === "light"
                      ? "linear(135deg, gray.50, blue.50)"
                      : "linear(135deg, gray.700, gray.600)"
                  }
                  py={8}
                >
                  <HStack spacing={3}>
                    <Box w="8px" h="8px" rounded="full" bg="secondary.400" />
                    <Heading
                      size="sm"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >
                      Team Description
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={8}>
                  {isEditMode ? (
                    <VStack spacing={6} align="stretch">
                      <FormControl isInvalid={!!formik.errors.teamName}>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Team Name
                        </FormLabel>
                        <Input
                          name="teamName"
                          value={formik.values.teamName}
                          onChange={formik.handleChange}
                          placeholder="Enter team name"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.teamName}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.teamDesc}>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Team Description
                        </FormLabel>
                        <Textarea
                          name="teamDesc"
                          value={formik.values.teamDesc}
                          onChange={formik.handleChange}
                          placeholder="Enter team description"
                          rows={4}
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.teamDesc}
                        </FormErrorMessage>
                      </FormControl>

                      {/* Directorate Selection */}
                      <FormControl>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Directorate
                        </FormLabel>
                        <Select
                          value={selectedDirectorate}
                          onChange={(e) =>
                            setSelectedDirectorate(e.target.value)
                          }
                          placeholder="Select directorate"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          {DirectorateData.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.orgName} ({org.orgCode})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Division Selection */}
                      <FormControl>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Division
                        </FormLabel>
                        <Select
                          value={selectedDivision}
                          onChange={(e) => setSelectedDivision(e.target.value)}
                          placeholder="Select division"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          {DivisionData.filter((division) => {
                            // Always include current team's division
                            if (TeamData?.division?.id === division.id)
                              return true;
                            // Filter by selected directorate
                            return selectedDirectorate
                              ? division.parentId === selectedDirectorate
                              : true;
                          }).map((division) => (
                            <option key={division.id} value={division.id}>
                              {division.orgName} ({division.orgCode})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.orgGroupId}>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Group
                        </FormLabel>
                        <Select
                          name="orgGroupId"
                          value={formik.values.orgGroupId}
                          onChange={formik.handleChange}
                          placeholder="Select organization group"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          {GroupData.filter((group) => {
                            // Always include current team's group
                            if (TeamData?.group?.id === group.id) return true;
                            // Filter by selected division
                            return selectedDivision
                              ? group.parentId === selectedDivision
                              : false;
                          }).map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.orgName} ({group.orgCode})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>
                          {formik.errors.orgGroupId}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.isActive}>
                        <FormLabel
                          fontWeight="bold"
                          color={
                            colorMode === "light" ? "gray.700" : "gray.300"
                          }
                        >
                          Status
                        </FormLabel>
                        <Select
                          name="isActive"
                          value={formik.values.isActive}
                          onChange={formik.handleChange}
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow:
                              "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </Select>
                        <FormErrorMessage>
                          {formik.errors.isActive}
                        </FormErrorMessage>
                      </FormControl>
                    </VStack>
                  ) : (
                    <Text
                      fontSize="lg"
                      color={colorMode === "light" ? "gray.600" : "gray.300"}
                      lineHeight="1.8"
                      fontWeight="medium"
                    >
                      {TeamData.teamDesc ||
                        "No description available for this team."}
                    </Text>
                  )}
                </CardBody>
              </Card>

              {/* Team Members Management Card */}
              <Card
                rounded="3xl"
                shadow="xl"
                border="0"
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
                position="relative"
              >
                <CardHeader
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  py={8}
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Box w="8px" h="8px" rounded="full" bg="secondary.400" />
                      <Heading
                        size="sm"
                        color={colorMode === "light" ? "gray.800" : "white"}
                      >
                        Team Members ({MembersData.length})
                      </Heading>
                    </HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={false}
                      colorScheme="secondary"
                      leftIcon={<Icon as={FiPlus} />}
                      rounded="xl"
                      fontWeight="medium"
                      onClick={handleAddMember}
                      _hover={{
                        transform: "translateY(-1px)",
                        bg: "secondary.50",
                      }}
                      transition="all 0.2s"
                    >
                      Add Member
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody p={8}>
                  {MembersData.length === 0 ? (
                    <VStack spacing={4} py={8}>
                      <Icon as={FiUsers} fontSize="4xl" color="gray.400" />
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        No members assigned to this team
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        isDisabled={false}
                        colorScheme="secondary"
                        leftIcon={<Icon as={FiPlus} />}
                        rounded="xl"
                        onClick={handleAddMember}
                      >
                        Add First Member
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={6} align="stretch">
                      {/* Members List - Scrollable */}
                      <VStack
                        spacing={4}
                        align="stretch"
                        maxH="400px"
                        overflowY="auto"
                        pr={2}
                        css={{
                          "&::-webkit-scrollbar": {
                            width: "6px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background:
                              colorMode === "light" ? "#f1f1f1" : "#2d3748",
                            borderRadius: "10px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background:
                              colorMode === "light" ? "#c1c1c1" : "#4a5568",
                            borderRadius: "10px",
                          },
                          "&::-webkit-scrollbar-thumb:hover": {
                            background:
                              colorMode === "light" ? "#a8a8a8" : "#2d3748",
                          },
                        }}
                      >
                        {MembersData.map((member) => (
                          <HStack
                            key={member.id}
                            p={6}
                            rounded="2xl"
                            bg={colorMode === "light" ? "gray.50" : "gray.700"}
                            border="2px"
                            borderColor={
                              colorMode === "light" ? "gray.100" : "gray.600"
                            }
                            justify="space-between"
                            shadow="sm"
                            _hover={{
                              shadow: "md",
                              transform: "translateY(-2px)",
                              borderColor: "secondary.300",
                            }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={4} flex="1">
                              <Avatar
                                size="md"
                                name={member.nama}
                                src={member.profilePict || undefined}
                                bg="secondary.400"
                                color="white"
                                shadow="md"
                              />
                              <VStack align="start" spacing={1} flex="1">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                >
                                  {member.nama}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {member.email || member.userId}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack spacing={3}>
                              <Badge
                                colorScheme={
                                  member.userStatus === "ACTIVE"
                                    ? "green"
                                    : "red"
                                }
                                px={3}
                                py={1}
                                rounded="full"
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                              >
                                {member.userStatus}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                rounded="xl"
                                onClick={() =>
                                  handleRemoveMember(member.id, member.nama)
                                }
                                _hover={{
                                  bg: "red.50",
                                  transform: "translateY(-1px)",
                                }}
                                transition="all 0.2s"
                              >
                                Remove
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>

                      {/* Member Count Info */}
                      {MembersData.length > 5 && (
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          textAlign="center"
                          pt={2}
                        >
                          Showing all {MembersData.length} members - scroll to
                          see more
                        </Text>
                      )}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Right Column - Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Organization Structure Card */}
              <Card
                rounded="2xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
              >
                <CardHeader
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  borderBottom="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  py={6}
                >
                  <Heading
                    size="sm"
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    Organization Structure
                  </Heading>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={3} align="stretch">
                    {/* Directorate */}
                    <HStack
                      justify="space-between"
                      p={3}
                      bg={colorMode === "light" ? "blue.50" : "blue.900"}
                      rounded="lg"
                    >
                      <HStack spacing={2}>
                        <Box w="3px" h="12px" bg="blue.400" rounded="full" />
                        <Text
                          fontSize="xs"
                          color="blue.600"
                          fontWeight="medium"
                        >
                          Directorate
                        </Text>
                      </HStack>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        noOfLines={1}
                      >
                        {TeamData.directorate?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>

                    {/* Division */}
                    <HStack
                      justify="space-between"
                      p={3}
                      bg={colorMode === "light" ? "purple.50" : "purple.900"}
                      rounded="lg"
                    >
                      <HStack spacing={2}>
                        <Box w="3px" h="12px" bg="purple.400" rounded="full" />
                        <Text
                          fontSize="xs"
                          color="purple.600"
                          fontWeight="medium"
                        >
                          Division
                        </Text>
                      </HStack>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        noOfLines={1}
                      >
                        {TeamData.division?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>

                    {/* Group */}
                    <HStack
                      justify="space-between"
                      p={3}
                      bg={
                        colorMode === "light" ? "secondary.50" : "secondary.900"
                      }
                      rounded="lg"
                    >
                      <HStack spacing={2}>
                        <Box
                          w="3px"
                          h="12px"
                          bg="secondary.400"
                          rounded="full"
                        />
                        <Text
                          fontSize="xs"
                          color="secondary.600"
                          fontWeight="medium"
                        >
                          Group
                        </Text>
                      </HStack>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        noOfLines={1}
                      >
                        {TeamData.group?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Team Information Card */}
              <Card
                rounded="2xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
              >
                <CardHeader
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  borderBottom="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  py={6}
                >
                  <Heading
                    size="sm"
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    Team Information
                  </Heading>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Team ID
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.id}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Initial Team
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.teamCode}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Created
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.createdAt
                          ? new Date(TeamData.createdAt).getFullYear()
                          : "N/A"}
                      </Text>
                    </HStack>

                    {/* <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Org Group ID
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.orgGroupId}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Org Group Code
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.orgGroupCode}
                      </Text>
                    </HStack> */}
                  </VStack>
                </CardBody>
              </Card>

              {/* Timestamps Card */}
              <Card
                rounded="2xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
              >
                <CardHeader
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  borderBottom="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  py={6}
                >
                  <HStack spacing={3}>
                    <Icon as={FiCalendar} color="secondary.500" fontSize="xl" />
                    <Heading
                      size="sm"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >
                      Timeline
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} color="green.500" />
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          fontWeight="medium"
                        >
                          Created At
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {new Date(TeamData.createdAt).toLocaleString()}
                      </Text>
                    </VStack>

                    <Divider />

                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Icon as={FiUser} color="blue.500" />
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          fontWeight="medium"
                        >
                          Created By
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.createdBy}
                      </Text>
                    </VStack>

                    {TeamData.updatedAt && (
                      <>
                        <Divider />
                        <VStack align="start" spacing={2}>
                          <HStack spacing={2}>
                            <Icon as={FiCalendar} color="orange.500" />
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              fontWeight="medium"
                            >
                              Updated At
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {new Date(TeamData.updatedAt).toLocaleString()}
                          </Text>
                        </VStack>
                      </>
                    )}

                    {TeamData.updatedBy && (
                      <>
                        <Divider />
                        <VStack align="start" spacing={2}>
                          <HStack spacing={2}>
                            <Icon as={FiUser} color="purple.500" />
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              fontWeight="medium"
                            >
                              Updated By
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {TeamData.updatedBy}
                          </Text>
                        </VStack>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Modern Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent
            mx={4}
            rounded="2xl"
            shadow="2xl"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            bg={colorMode === "light" ? "white" : "gray.800"}
          >
            <AlertDialogHeader
              fontSize="xl"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
              pb={4}
            >
              <HStack spacing={3}>
                <Box w="12px" h="12px" rounded="full" bg="red.400" />
                <Text>Remove Team Member</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody pb={6}>
              <VStack spacing={4} align="start">
                <Text
                  color={colorMode === "light" ? "gray.600" : "gray.300"}
                  lineHeight="1.6"
                >
                  Are you sure you want to remove{" "}
                  <Text
                    as="span"
                    fontWeight="bold"
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    {memberToRemove?.name}
                  </Text>{" "}
                  from this team?
                </Text>
                <Text fontSize="sm" color="red.500" fontWeight="medium">
                  This action cannot be undone.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter
              pt={4}
              borderTop="1px"
              borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
            >
              <HStack spacing={3} w="full" justify="end">
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="outline"
                  colorScheme="gray"
                  rounded="xl"
                  px={6}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmRemoveMember}
                  rounded="xl"
                  px={6}
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Remove Member
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

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
                Select users and assign a role to add to this team:
              </Text>

              {/* Role Selection */}
              <FormControl>
                <FormLabel
                  fontWeight="medium"
                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                >
                  Team Role
                </FormLabel>
                <Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  placeholder="Select a role"
                  bg={colorMode === "light" ? "white" : "gray.700"}
                  border="2px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  rounded="xl"
                  _focus={{
                    borderColor: "secondary.500",
                    shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                  }}
                >
                  {specializations.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.specName}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel
                  fontWeight="medium"
                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                >
                  Search Users
                </FormLabel>
                <Input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search by name, email, or user ID..."
                  bg={colorMode === "light" ? "white" : "gray.700"}
                  border="2px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  rounded="xl"
                  _focus={{
                    borderColor: "secondary.500",
                    shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                  }}
                />
              </FormControl>

              {/* User List */}
              <Box
                maxH="300px"
                overflowY="auto"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                rounded="xl"
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
              >
                {filteredUsers.length === 0 ? (
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    textAlign="center"
                    py={8}
                  >
                    {searchUser
                      ? "No users found matching your search"
                      : "No available users to add"}
                  </Text>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <HStack
                          key={user.id}
                          p={4}
                          cursor="pointer"
                          bg={isSelected ? "secondary.100" : "transparent"}
                          _hover={{
                            bg: isSelected
                              ? "secondary.200"
                              : colorMode === "light"
                                ? "gray.100"
                                : "gray.600",
                          }}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUserIds((prev) =>
                                prev.filter((id) => id !== user.id)
                              );
                            } else {
                              setSelectedUserIds((prev) => [...prev, user.id]);
                            }
                          }}
                          borderBottom="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          _last={{ borderBottom: "none" }}
                        >
                          <Avatar
                            size="sm"
                            name={user.nama}
                            src={user.profilePict || undefined}
                            bg="secondary.400"
                            color="white"
                          />
                          <VStack align="start" spacing={0} flex="1">
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={
                                colorMode === "light" ? "gray.800" : "white"
                              }
                            >
                              {user.nama}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {user.email || user.userId}
                            </Text>
                          </VStack>
                          {isSelected && <Icon as={FiX} color="red.500" />}
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            pt={4}
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          >
            <HStack spacing={3} w="full" justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {selectedUserIds.length} user(s) selected
              </Text>
              <HStack spacing={3}>
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
                  onClick={confirmAddMember}
                  isLoading={isAddingMember}
                  isDisabled={selectedUserIds.length === 0 || !selectedRoleId}
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Add{" "}
                  {selectedUserIds.length > 0
                    ? `${selectedUserIds.length} `
                    : ""}
                  Member{selectedUserIds.length !== 1 ? "s" : ""}
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

export default TeamDetailView;
