"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, { TeamsResponse, TeamsUserMemberResponse } from "@/app/services/useTeams";
import { UsersResponse } from "@/app/services/useUsers";
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
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUsersRays, FaArrowLeft } from "react-icons/fa6";
import { FiCalendar, FiUser, FiEdit } from "react-icons/fi";

interface TeamDetailViewProps {}

function TeamDetailView({}: TeamDetailViewProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("id");
  const { GetDetailById, ListMembers } = useTeams();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Team data
  const [TeamData, setTeamData] = useState<TeamsResponse | null>(null);
  const [MembersData, setMembersData] = useState<UsersResponse[]>([]);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Header data
  const HeaderDataContent: HeaderContentProps = {
    titleName: TeamData?.teamName || "Team Details",
    breadCrumb: ["Home", "Teams Center", "Team Details"],
  };

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Load team data
  const GetTeamData = async () => {
    if (!tokenData || !DataAuth || !teamId) return;

    try {
      setIsLoadingProcess(true);

      const response = await GetDetailById(teamId, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = response.data as TeamsResponse;
      setTeamData(data);

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

  // Load team members
  const GetMembersData = async () => {
    if (!tokenData || !DataAuth || !teamId) return;

    try {
      const PayloadMembers = {
        search: "",
        limit: 1000,
        page: 0,
        fieldOrder: ["userFirstName"],
        orderDir: "asc",
        filterWhere: [
          { field: "teamId", operator: "=", value: teamId }
        ],
      };

      const response = await ListMembers(PayloadMembers as any, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setMembersData(response.data as UsersResponse[]);
      }
    } catch (error) {
      console.error("Error fetching members data:", error);
    }
  };

  // Load data effect
  useEffect(() => {
    if (DataAuth && tokenData && teamId) {
      GetTeamData();
      GetMembersData();
    }
  }, [DataAuth, tokenData, teamId]);

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
        {/* Team Header Card */}
        <Card
          rounded="2xl"
          shadow="lg"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
          mb={6}
          overflow="hidden"
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            h: "4px",
            bg: TeamData.isActive === "ACTIVE" ? "green.400" : "red.400",
          }}
        >
          <CardHeader
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            py={6}
          >
            <HStack spacing={4} justify="space-between">
              <HStack spacing={4}>
                <Avatar
                  size="xl"
                  name={TeamData.teamCode}
                  bg="secondary.500"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                />
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color={colorMode === "light" ? "gray.800" : "white"}>
                    {TeamData.teamName}
                  </Heading>
                  <HStack spacing={3}>
                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                      #{TeamData.teamCode}
                    </Text>
                    <Badge
                      colorScheme={TeamData.isActive === "ACTIVE" ? "green" : "red"}
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {TeamData.isActive}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              <HStack spacing={3}>
                <Button
                  colorScheme="secondary"
                  leftIcon={<Icon as={FiEdit} />}
                  rounded="xl"
                >
                  Edit Team
                </Button>
              </HStack>
            </HStack>
          </CardHeader>

          <CardBody p={8}>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
              {/* Left Column - Main Info */}
              <GridItem>
                <VStack spacing={6} align="stretch" h="full">
                  {/* Description */}
                  <Box>
                    <Heading size="md" mb={3} color={colorMode === "light" ? "gray.800" : "white"}>
                      Description
                    </Heading>
                    <Text
                      fontSize="md"
                      color={colorMode === "light" ? "gray.600" : "gray.400"}
                      lineHeight="1.6"
                    >
                      {TeamData.teamDesc || "No description available"}
                    </Text>
                  </Box>

                  <Divider />

                  {/* Organization Structure */}
                  <Box flex="1">
                    <Heading size="md" mb={4} color={colorMode === "light" ? "gray.800" : "white"}>
                      Organization Structure
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {/* Directorate */}
                      <HStack spacing={4}>
                        <Box w="4px" h="60px" bg="blue.400" rounded="full" />
                        <VStack align="start" spacing={1} flex="1">
                          <Text fontSize="sm" color="gray.500" fontWeight="medium">
                            DIRECTORATE
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            {TeamData.directorate?.orgName || "N/A"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.directorate?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Division */}
                      <HStack spacing={4}>
                        <Box w="4px" h="60px" bg="purple.400" rounded="full" />
                        <VStack align="start" spacing={1} flex="1">
                          <Text fontSize="sm" color="gray.500" fontWeight="medium">
                            DIVISION
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {TeamData.division?.orgName || "N/A"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.division?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Group */}
                      <HStack spacing={4}>
                        <Box w="4px" h="60px" bg="secondary.400" rounded="full" />
                        <VStack align="start" spacing={1} flex="1">
                          <Text fontSize="sm" color="gray.500" fontWeight="medium">
                            GROUP
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="secondary.600">
                            {TeamData.group?.orgName || "N/A"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.group?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Back Button - Aligned with bottom */}
                  <Box>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      leftIcon={<Icon as={FaArrowLeft} />}
                      onClick={() => router.push("/teams-center")}
                      rounded="xl"
                      size="lg"
                    >
                      Back to Teams
                    </Button>
                  </Box>
                </VStack>
              </GridItem>

              {/* Right Column - Metadata */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Team Members */}
                  <Card
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                            Team Members
                          </Heading>
                          <Badge colorScheme="secondary" rounded="full" px={2}>
                            {MembersData.length}
                          </Badge>
                        </HStack>
                        
                        {MembersData.length === 0 ? (
                          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                            No members assigned
                          </Text>
                        ) : (
                          <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">
                            {MembersData.map((member) => (
                              <HStack key={member.id} spacing={3} p={3} rounded="lg" 
                                bg={colorMode === "light" ? "white" : "gray.600"}
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.500"}
                              >
                                <Avatar
                                  size="sm"
                                  name={`${member.userFirstName} ${member.userLastName}`}
                                  src={member.profilePict || undefined}
                                />
                                <VStack align="start" spacing={0} flex="1">
                                  <Text fontSize="sm" fontWeight="medium">
                                    {member.userFirstName} {member.userLastName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {member.userEmail || member.username}
                                  </Text>
                                </VStack>
                                <Badge
                                  colorScheme={member.isActive === "ACTIVE" ? "green" : "red"}
                                  size="sm"
                                  rounded="full"
                                >
                                  {member.isActive}
                                </Badge>
                              </HStack>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Team Information */}
                  <Card
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                          Team Information
                        </Heading>
                        
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Team ID</Text>
                            <Text fontSize="sm" fontWeight="medium">{TeamData.id}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Team Code</Text>
                            <Text fontSize="sm" fontWeight="medium">{TeamData.teamCode}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Organization Group ID</Text>
                            <Text fontSize="sm" fontWeight="medium">{TeamData.orgGroupId}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Organization Group Code</Text>
                            <Text fontSize="sm" fontWeight="medium">{TeamData.orgGroupCode}</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Timestamps */}
                  <Card
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                          Timestamps
                        </Heading>
                        
                        <VStack spacing={3} align="stretch">
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Icon as={FiCalendar} color="gray.500" />
                              <Text fontSize="sm" color="gray.500">Created At</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium">
                              {new Date(TeamData.createdAt).toLocaleString()}
                            </Text>
                          </VStack>
                          
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Icon as={FiUser} color="gray.500" />
                              <Text fontSize="sm" color="gray.500">Created By</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium">{TeamData.createdBy}</Text>
                          </VStack>
                          
                          {TeamData.updatedAt && (
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Icon as={FiCalendar} color="gray.500" />
                                <Text fontSize="sm" color="gray.500">Updated At</Text>
                              </HStack>
                              <Text fontSize="sm" fontWeight="medium">
                                {new Date(TeamData.updatedAt).toLocaleString()}
                              </Text>
                            </VStack>
                          )}
                          
                          {TeamData.updatedBy && (
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Icon as={FiUser} color="gray.500" />
                                <Text fontSize="sm" color="gray.500">Updated By</Text>
                              </HStack>
                              <Text fontSize="sm" fontWeight="medium">{TeamData.updatedBy}</Text>
                            </VStack>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}

export default TeamDetailView;
