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
import { FiCalendar, FiUser, FiEdit, FiUsers, FiHome } from "react-icons/fi";

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

  // Header content
  const [HeaderDataContent, setHeaderDataContent] =
    useState<HeaderContentProps>({
      titleName: "Team Details",
      breadCrumb: ["Home", "Teams Center", "Team Details"],
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
    }
  }, [teamId, tokenData, DataAuth]);

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
        {/* Modern Hero Header */}
        <Box
          position="relative"
          rounded="3xl"
          overflow="hidden"
          mb={8}
          bgGradient="linear(135deg, secondary.500, secondary.600, purple.500)"
          shadow="2xl"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            right={0}
            w="400px"
            h="200px"
            opacity={0.1}
            bgGradient="radial(circle, white 1px, transparent 1px)"
            bgSize="20px 20px"
          />

          <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
            {/* Back Button */}
            <Button
              variant="ghost"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => router.push("/teams-center")}
              mb={6}
              color={colorMode === "light" ? "white.600" : "white.400"}
            >
              Back to Teams Center
            </Button>

            <HStack spacing={6} align="start">
              {/* Team Avatar with Status Indicator */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  name={TeamData.teamCode}
                  bg="white"
                  color="secondary.600"
                  fontSize="3xl"
                  fontWeight="black"
                  shadow="2xl"
                  border="4px solid"
                  borderColor="whiteAlpha.300"
                />
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  w="20px"
                  h="20px"
                  rounded="full"
                  bg={TeamData.isActive === "ACTIVE" ? "green.400" : "red.400"}
                  border="3px solid white"
                  shadow="lg"
                />
              </Box>

              {/* Team Info */}
              <VStack align="start" spacing={3} flex="1">
                <VStack align="start" spacing={1}>
                  <Heading
                    size="2xl"
                    color="white"
                    fontWeight="black"
                    letterSpacing="tight"
                  >
                    {TeamData.teamName}
                  </Heading>
                  <HStack spacing={4}>
                    <Text
                      fontSize="xl"
                      color="whiteAlpha.800"
                      fontWeight="medium"
                    >
                      #{TeamData.teamCode}
                    </Text>
                    <Badge
                      colorScheme={
                        TeamData.isActive === "ACTIVE" ? "green" : "red"
                      }
                      px={4}
                      py={2}
                      rounded="full"
                      fontSize="sm"
                      fontWeight="bold"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      {TeamData.isActive}
                    </Badge>
                  </HStack>
                </VStack>

                {/* Quick Stats */}
                {/* <HStack spacing={6} mt={4}>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="black" color="white">
                      {MembersData.length}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.700" fontWeight="medium">
                      Members
                    </Text>
                  </VStack>
                  {/* <Box w="1px" h="40px" bg="whiteAlpha.300" /> */}
                {/* <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="black" color="white">
                      {TeamData.directorate?.orgName ? "3" : "0"}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.700" fontWeight="medium">
                      Org Levels
                    </Text>
                  </VStack> */}
                {/* </HStack> */}
              </VStack>

              {/* Action Button */}
              <Button
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                color="white"
                leftIcon={<Icon as={FiEdit} />}
                rounded="xl"
                size="sm"
                fontWeight="medium"
                shadow="lg"
                _hover={{
                  bg: "whiteAlpha.300",
                  transform: "translateY(-1px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                Edit
              </Button>
            </HStack>
          </Box>
        </Box>

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
                  <Text
                    fontSize="lg"
                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                    lineHeight="1.8"
                    fontWeight="medium"
                  >
                    {TeamData.teamDesc ||
                      "No description available for this team."}
                  </Text>
                </CardBody>
              </Card>

              {/* Organization Structure Card */}
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
                  bgGradient:
                    "linear(to-r, blue.400, purple.400, secondary.400)",
                }}
              >
                <CardHeader
                  bgGradient={
                    colorMode === "light"
                      ? "linear(135deg, gray.50, purple.50)"
                      : "linear(135deg, gray.700, gray.600)"
                  }
                  py={8}
                >
                  <HStack spacing={3}>
                    <Box w="8px" h="8px" rounded="full" bg="blue.400" />
                    <Heading
                      size="sm"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >
                      Structures
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    {/* Directorate */}
                    <Box
                      p={6}
                      rounded="2xl"
                      bgGradient={
                        colorMode === "light"
                          ? "linear(135deg, blue.50, blue.100)"
                          : "linear(135deg, blue.900, blue.800)"
                      }
                      border="2px"
                      borderColor="blue.200"
                      position="relative"
                      overflow="hidden"
                      shadow="md"
                      _hover={{
                        shadow: "lg",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="4px"
                        bgGradient="linear(to-r, blue.400, blue.500)"
                      />
                      <HStack spacing={4}>
                        <Box
                          w="60px"
                          h="60px"
                          rounded="2xl"
                          bgGradient="linear(135deg, blue.400, blue.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="lg"
                        >
                          <Text fontSize="2xl" fontWeight="black" color="white">
                            D
                          </Text>
                        </Box>
                        <VStack align="start" spacing={2} flex="1">
                          <Text
                            fontSize="sm"
                            color="blue.600"
                            fontWeight="bold"
                            textTransform="uppercase"
                          >
                            Directorate
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="blue.700"
                          >
                            {TeamData.directorate?.orgName || "Not Assigned"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.directorate?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Division */}
                    <Box
                      p={6}
                      rounded="2xl"
                      bgGradient={
                        colorMode === "light"
                          ? "linear(135deg, purple.50, purple.100)"
                          : "linear(135deg, purple.900, purple.800)"
                      }
                      border="2px"
                      borderColor="purple.200"
                      position="relative"
                      overflow="hidden"
                      shadow="md"
                      _hover={{
                        shadow: "lg",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="4px"
                        bgGradient="linear(to-r, purple.400, purple.500)"
                      />
                      <HStack spacing={4}>
                        <Box
                          w="60px"
                          h="60px"
                          rounded="2xl"
                          bgGradient="linear(135deg, purple.400, purple.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="lg"
                        >
                          <Text fontSize="2xl" fontWeight="black" color="white">
                            D
                          </Text>
                        </Box>
                        <VStack align="start" spacing={2} flex="1">
                          <Text
                            fontSize="sm"
                            color="purple.600"
                            fontWeight="bold"
                            textTransform="uppercase"
                          >
                            Division
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="purple.700"
                          >
                            {TeamData.division?.orgName || "Not Assigned"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.division?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Group */}
                    <Box
                      p={6}
                      rounded="2xl"
                      bgGradient={
                        colorMode === "light"
                          ? "linear(135deg, secondary.50, secondary.100)"
                          : "linear(135deg, secondary.900, secondary.800)"
                      }
                      border="2px"
                      borderColor="secondary.200"
                      position="relative"
                      overflow="hidden"
                      shadow="md"
                      _hover={{
                        shadow: "lg",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="4px"
                        bgGradient="linear(to-r, secondary.400, secondary.500)"
                      />
                      <HStack spacing={4}>
                        <Box
                          w="60px"
                          h="60px"
                          rounded="2xl"
                          bgGradient="linear(135deg, secondary.400, secondary.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="lg"
                        >
                          <Text fontSize="2xl" fontWeight="black" color="white">
                            G
                          </Text>
                        </Box>
                        <VStack align="start" spacing={2} flex="1">
                          <Text
                            fontSize="sm"
                            color="secondary.600"
                            fontWeight="bold"
                            textTransform="uppercase"
                          >
                            Group
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="secondary.700"
                          >
                            {TeamData.group?.orgName || "Not Assigned"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {TeamData.group?.orgCode || "N/A"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
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
                        Team Code
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {TeamData.teamCode}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
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
                    </HStack>
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
