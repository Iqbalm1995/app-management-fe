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
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
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
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUsersRays, FaArrowLeft } from "react-icons/fa6";
import { FiCalendar, FiUser, FiEdit, FiUsers, FiHome, FiSave, FiX } from "react-icons/fi";

interface TeamDetailViewProps {}

function TeamDetailView({}: TeamDetailViewProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("id");

  const { GetDetailById, ListMembers, UpdateTeams } = useTeams();
  const { List: ListOrganizations } = useOrganization();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Team data
  const [TeamData, setTeamData] = useState<TeamsResponse | null>(null);
  const [MembersData, setMembersData] = useState<UsersResponse[]>([]);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [GroupData, setGroupData] = useState<OrganizationResponse[]>([]);

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
    teamDesc: Yup.string()
      .max(500, "Maximum 500 characters"),
    orgGroupId: Yup.string()
      .required("Organization group is required"),
    isActive: Yup.string()
      .required("Status is required"),
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

  const GetTeamData = async () => {
    if (!teamId || !tokenData) return;

    try {
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
      const payload = {
        search: "",
        teamId: teamId,
        limit: 100,
        page: 0,
        filterWhere: [],
        fieldOrder: ["userFirstName"],
        orderDir: "asc" as const,
      };

      const requestData = await ListMembers(payload, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        console.error("Error fetching team members:", requestData?.message);
        return;
      }

      const data = requestData.data as UsersResponse[];
      setMembersData(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const LoadGroupData = async () => {
    if (!tokenData) return;

    try {
      const PayloadGroup = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: [
          { field: "orgType", operator: "=", value: "GROUP" }
        ],
      };

      const groupResponse = await ListOrganizations(PayloadGroup as any, tokenData);
      if (groupResponse?.statusCode === RES_CODE_OK && groupResponse.data) {
        setGroupData(groupResponse.data as OrganizationResponse[]);
      }
    } catch (error) {
      console.error("Error loading group data:", error);
    }
  };

  const handleUpdateTeam = async (values: any) => {
    if (!teamId || !tokenData) return;

    try {
      setIsUpdating(true);
      
      // Find selected group to get orgGroupCode
      const selectedGroup = GroupData.find(group => group.id === values.orgGroupId);
      
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

      console.log("Update FormData fields:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Call API directly with FormData
      const UrlEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_API_PORT_BASIC}`;
      const PathEndpoint = "/v1/Teams/update";

      const response = await fetch(`${UrlEndpoint}${PathEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData}`,
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

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
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
                    bg={TeamData.isActive === "ACTIVE" ? "green.400" : "red.400"}
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "gray.800"}
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      w="8px"
                      h="8px"
                      rounded="full"
                      bg="white"
                    />
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
                        colorScheme={TeamData.isActive === "ACTIVE" ? "green" : "red"}
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
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                      >
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
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                      >
                        {TeamData.createdAt ? new Date(TeamData.createdAt).getFullYear() : "N/A"}
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
                <Text
                  fontSize="xs"
                  color="whiteAlpha.600"
                  textAlign="right"
                >
                  Last updated{" "}
                  {TeamData.updatedAt 
                    ? new Date(TeamData.updatedAt).toLocaleDateString()
                    : new Date(TeamData.createdAt).toLocaleDateString()
                  }
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
                        <FormLabel fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                          Team Name
                        </FormLabel>
                        <Input
                          name="teamName"
                          value={formik.values.teamName}
                          onChange={formik.handleChange}
                          placeholder="Enter team name"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        />
                        <FormErrorMessage>{formik.errors.teamName}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.teamDesc}>
                        <FormLabel fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
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
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        />
                        <FormErrorMessage>{formik.errors.teamDesc}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.orgGroupId}>
                        <FormLabel fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                          Organization Group
                        </FormLabel>
                        <Select
                          name="orgGroupId"
                          value={formik.values.orgGroupId}
                          onChange={formik.handleChange}
                          placeholder="Select organization group"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          {GroupData.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.orgName} ({group.orgCode})
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{formik.errors.orgGroupId}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formik.errors.isActive}>
                        <FormLabel fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                          Status
                        </FormLabel>
                        <Select
                          name="isActive"
                          value={formik.values.isActive}
                          onChange={formik.handleChange}
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          border="2px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          rounded="xl"
                          _focus={{
                            borderColor: "secondary.500",
                            shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                          }}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </Select>
                        <FormErrorMessage>{formik.errors.isActive}</FormErrorMessage>
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

              {/* Organization Structure Card */}
              <Card
                rounded="xl"
                shadow="md"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardHeader py={4} px={6}>
                  <Heading
                    size="md"
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    Organization Structure
                  </Heading>
                </CardHeader>
                <CardBody px={6} pb={6}>
                  <VStack spacing={4} align="stretch">
                    {/* Directorate */}
                    <HStack justify="space-between" p={4} bg={colorMode === "light" ? "blue.50" : "blue.900"} rounded="lg">
                      <HStack spacing={3}>
                        <Box w="3px" h="16px" bg="blue.400" rounded="full" />
                        <Text fontSize="sm" color="blue.600" fontWeight="medium">
                          Directorate
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color={colorMode === "light" ? "purple.900" : "white"}>
                        {TeamData.directorate?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>

                    {/* Division */}
                    <HStack justify="space-between" p={4} bg={colorMode === "light" ? "purple.50" : "purple.900"} rounded="lg">
                      <HStack spacing={3}>
                        <Box w="3px" h="16px" bg="purple.400" rounded="full" />
                        <Text fontSize="sm" color="purple.600" fontWeight="medium">
                          Division
                        </Text>
                      </HStack>
                      <Text fontSize="sm"  color={colorMode === "light" ? "purple.900" : "white"}>
                        {TeamData.division?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>

                    {/* Group */}
                    <HStack justify="space-between" p={4} bg={colorMode === "light" ? "secondary.50" : "secondary.900"} rounded="lg">
                      <HStack spacing={3}>
                        <Box w="3px" h="16px" bg="secondary.400" rounded="full" />
                        <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                          Group
                        </Text>
                      </HStack>
                      <Text fontSize="sm"  color={colorMode === "light" ? "purple.900" : "white"}>
                        {TeamData.group?.orgName || "Not Assigned"}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Right Column - Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Team Members Card */}
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
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={FiUsers} color="secondary.500" fontSize="xl" />
                      <Heading
                        size="sm"
                        color={colorMode === "light" ? "gray.800" : "white"}
                      >
                        Team Members
                      </Heading>
                    </HStack>
                    <Badge
                      colorScheme="secondary"
                      rounded="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                    >
                      {MembersData.length}
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  {MembersData.length === 0 ? (
                    <VStack spacing={4} py={8}>
                      <Icon as={FiUsers} fontSize="4xl" color="gray.400" />
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        No members assigned to this team
                      </Text>
                    </VStack>
                  ) : (
                    <VStack
                      spacing={4}
                      align="stretch"
                      maxH="400px"
                      overflowY="auto"
                    >
                      {MembersData.map((member) => (
                        <Box
                          key={member.id}
                          p={4}
                          rounded="xl"
                          bg={colorMode === "light" ? "gray.50" : "gray.700"}
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          _hover={{
                            shadow: "md",
                            transform: "translateY(-1px)",
                          }}
                          transition="all 0.2s"
                        >
                          <HStack spacing={3}>
                            <Avatar
                              size="md"
                              name={member.nama}
                              src={member.profilePict || undefined}
                              bg="secondary.400"
                              color="white"
                            />
                            <VStack align="start" spacing={1} flex="1">
                              <Text fontSize="md" fontWeight="bold">
                                {member.nama}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {member.email || member.userId}
                              </Text>
                            </VStack>
                            <Badge
                              colorScheme="secondary"
                              rounded="full"
                              px={2}
                              py={1}
                              fontSize="xs"
                            >
                              {member.userStatus}
                            </Badge>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
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
                        {TeamData.createdAt ? new Date(TeamData.createdAt).getFullYear() : "N/A"}
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
    </LayoutAdmin>
  );
}

export default TeamDetailView;
