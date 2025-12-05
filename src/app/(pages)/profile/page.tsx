"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Avatar,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Grid,
  GridItem,
  Skeleton,
  useColorMode,
  Flex,
  Icon,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  IconButton,
} from "@chakra-ui/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiUsers,
  FiTag,
  FiEdit3,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import { FiActivity, FiClock, FiMonitor, FiRefreshCw, FiGrid, FiList, FiSave, FiXCircle } from "react-icons/fi";
import { Input, Textarea, FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { motion } from "framer-motion";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useTeams, { TeamsResponse, TeamUpdatePayload } from "@/app/services/useTeams";
import { useFormik } from "formik";
import * as yup from "yup";
import useLogActivityUsers, {
  LogActivityUserSummaryResponse,
} from "@/app/services/useLogActivityUsers";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload, PaggingListPayloadCustom } from "@/app/types/masterTypes";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailByUserId, isLoading } = useUsers();
  const { GetDetailById: GetTeamDetail, UpdateTeams, ListMembers } = useTeams();
  const { GetPagedList: GetAuditTrail, isLoading: isLoadingAudit } =
    useLogActivityUsers();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [UserDetail, setUserDetail] = useState<UsersResponse | null>(null);
  const [AuditTrailData, setAuditTrailData] = useState<
    LogActivityUserSummaryResponse[]
  >([]);
  const [RefreshAudit, setRefreshAudit] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [TeamData, setTeamData] = useState<TeamsResponse | null>(null);
  const [TeamMembers, setTeamMembers] = useState<UsersResponse[]>([]);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [TeamRefresh, setTeamRefresh] = useState<number>(0);
  const [ActionLoading, setActionLoading] = useState(false);

  // Auth Effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    console.log("Auth Effect - storedData:", storedData);
    console.log("Auth Effect - token:", token);

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      console.log("Parsed UserData:", UserData);
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, []);

  // Fetch User Detail
  useEffect(() => {
    const fetchUserDetail = async () => {
      console.log("Fetch effect triggered", {
        DataAuth,
        username: DataAuth?.username,
        userId: DataAuth?.userId,
        hasToken: !!tokenData,
      });

      const userIdToUse = DataAuth?.userId || DataAuth?.username;

      if (userIdToUse && tokenData) {
        console.log("Calling API with userId:", userIdToUse);
        try {
          const response = await GetDetailByUserId(userIdToUse, tokenData);
          console.log("API Response:", response);

          if (response?.statusCode !== RES_CODE_OK || !response) {
            showToast({
              description: response?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            return;
          }

          setUserDetail(response.data);
        } catch (error) {
          console.error("API Error:", error);
          showToast({
            description: "Failed to load user details",
            statusToast: "error",
          });
        }
      }
    };

    fetchUserDetail();
  }, [DataAuth, tokenData]);

  // Fetch Audit Trail
  useEffect(() => {
    const fetchAuditTrail = async () => {
      const userIdToUse = DataAuth?.userId || DataAuth?.username;

      if (userIdToUse && tokenData) {
        try {
          const payload: PaggingListPayload = {
            search: "",
            page: 1,
            limit: 5,
            filterWhere: [
              { field: "userIdUim", operator: "=", value: userIdToUse },
            ],
            fieldOrder: ["timestampAct"],
            orderDir: "desc",
          };

          const response = await GetAuditTrail(payload, tokenData);

          if (response?.statusCode === RES_CODE_OK && response.data) {
            setAuditTrailData(response.data);
          }
        } catch (error) {
          console.error("Failed to load audit trail:", error);
        }
      }
    };

    fetchAuditTrail();
  }, [DataAuth, tokenData, RefreshAudit]);

  const handleRefreshAudit = () => {
    setRefreshAudit((prev) => prev + 1);
  };


  // Team formik
  const teamFormik = useFormik<TeamUpdatePayload>({
    initialValues: {
      id: "",
      teamCode: "",
      teamName: "",
      teamDesc: null,
      uploadPict: null,
      isActive: "ACTIVE",
      deletePict: false,
      orgGroupId: "",
      orgGroupCode: "",
    },
    validationSchema: yup.object({
      teamName: yup.string().required("Team name is required"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setActionLoading(true);
      const response = await UpdateTeams(values, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Team updated successfully",
          statusToast: "success",
        });
        setTeamRefresh(TeamRefresh + 1);
        setIsEditMode(false);
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
      setActionLoading(false);
    },
  });

  // Load Team Data
  useEffect(() => {
    const fetchTeamData = async () => {
      if (DataAuth?.team?.id && tokenData) {
        const response = await GetTeamDetail(DataAuth.team.id, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          const teamData = response.data as TeamsResponse;
          setTeamData(teamData);
          teamFormik.setValues({
            id: teamData.id,
            teamCode: teamData.teamCode,
            teamName: teamData.teamName,
            teamDesc: teamData.teamDesc || null,
            uploadPict: null,
            isActive: "ACTIVE",
            deletePict: false,
            orgGroupId: teamData.orgGroupId || "",
            orgGroupCode: teamData.orgGroupCode || "",
          });
        }
      }
    };
    fetchTeamData();
  }, [DataAuth, tokenData, TeamRefresh]);

  // Load Team Members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      console.log("=== LOADING TEAM MEMBERS ===");
      console.log("Team ID:", DataAuth?.team?.id);
      console.log("Token:", !!tokenData);
      if (DataAuth?.team?.id && tokenData) {
        const payload: PaggingListPayloadCustom = {
          search: "",
          teamId: DataAuth.team.id,
          limit: 100,
          page: 0,
          fieldOrder: ["nama"],
          orderDir: "asc",
          filterWhere: [],
        };
        console.log("Payload:", payload);
        const response = await ListMembers(payload, tokenData);
        console.log("Response:", response);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          console.log("Members loaded:", response.data.length);
          setTeamMembers(response.data as UsersResponse[]);
        }
      }
    };
    fetchTeamMembers();
  }, [DataAuth, tokenData, TeamRefresh]);

  const InfoCard = ({
    icon,
    label,
    value,
    colorScheme = "blue",
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
    colorScheme?: string;
  }) => (
    <MotionCard
      whileHover={{ y: -2, shadow: "xl" }}
      transition={{ duration: 0.2 }}
      bg={colorMode === "light" ? "white" : "gray.800"}
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      borderWidth="1px"
      rounded={radiusStyle}
      overflow="hidden"
    >
      <CardBody p={4}>
        <HStack spacing={3}>
          <Flex
            w={10}
            h={10}
            rounded="lg"
            bg={`${colorScheme}.100`}
            color={`${colorScheme}.600`}
            align="center"
            justify="center"
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
          <VStack align="start" spacing={0} flex={1}>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color={colorMode === "light" ? "gray.500" : "gray.400"}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {label}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={colorMode === "light" ? "gray.800" : "white"}
              noOfLines={1}
            >
              {value || "Not specified"}
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </MotionCard>
  );

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="My Profile"
        breadCrumb={["Dashboard", "Profile"]}
      />

      <Container maxW="7xl" py={8}>
        {/* Header Section with Gradient */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bgGradient={
            colorMode === "light"
              ? "linear(135deg, secondary.500, secondary.700, secondary.800)"
              : "linear(135deg, secondary.600, secondary.800, secondary.900)"
          }
          rounded={radiusStyle}
          p={8}
          mb={8}
          position="relative"
          overflow="hidden"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            right={0}
            w="200px"
            h="200px"
            bgGradient="radial(circle, whiteAlpha.400, transparent)"
            rounded="full"
            transform="translate(50%, -50%)"
          />

          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            gap={6}
          >
            <MotionBox
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar
                size="2xl"
                name={DataAuth?.nama || UserDetail?.nama || "User"}
                src={DataAuth?.profilePict || undefined}
                border="4px solid"
                borderColor="secondary.300"
                shadow="xl"
              />
            </MotionBox>

            <VStack
              align={{ base: "center", md: "start" }}
              spacing={3}
              flex={1}
            >
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="white"
                textAlign={{ base: "center", md: "left" }}
              >
                {UserDetail?.nama || DataAuth?.nama || "Loading..."}
              </Text>

              <HStack spacing={3}>
                <Text fontSize="lg" color="whiteAlpha.900" fontWeight="medium">
                  USER ID :{" "}
                  <Text as={"span"} fontWeight={600}>
                    {DataAuth?.userId || "username"}
                  </Text>
                </Text>

                <Badge
                  colorScheme={"secondary"}
                  rounded="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                >
                  {DataAuth?.userStatus}
                </Badge>
              </HStack>

              {UserDetail?.team && (
                <HStack spacing={2}>
                  <Icon as={FiUsers} color="whiteAlpha.800" />
                  <Text color="whiteAlpha.900" fontWeight="medium">
                    {UserDetail.team.teamName}
                  </Text>
                </HStack>
              )}
            </VStack>

            <VStack spacing={2}>
              <IconButton
                aria-label="Edit Profile"
                icon={<FiEdit3 />}
                colorScheme="whiteAlpha"
                variant="ghost"
                size="lg"
                rounded="full"
                _hover={{ bg: "whiteAlpha.200" }}
              />
              <IconButton
                aria-label="Settings"
                icon={<FiSettings />}
                colorScheme="whiteAlpha"
                variant="ghost"
                size="lg"
                rounded="full"
                _hover={{ bg: "whiteAlpha.200" }}
              />
            </VStack>
          </Flex>
        </MotionBox>

        {/* View Mode Toggle Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          rounded={radiusStyle}
          p={4}
          mb={8}
          shadow="lg"
          borderWidth="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <Flex justify="space-between" align="center">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              {viewMode === "grid" ? "About Me" : "My Team"}
            </Text>
            <HStack
              spacing={1}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              rounded="lg"
              p={1}
            >
              <Button
                size="sm"
                variant={viewMode === "grid" ? "solid" : "ghost"}
                colorScheme={viewMode === "grid" ? "blue" : "gray"}
                onClick={() => setViewMode("grid")}
                leftIcon={<Icon as={FiUser} boxSize={3} />}
                fontSize="xs"
                px={3}
                h={8}
                _hover={{
                  bg:
                    viewMode === "grid"
                      ? "blue.500"
                      : colorMode === "light"
                        ? "gray.200"
                        : "gray.600",
                }}
                transition="all 0.2s"
              >
                Personal
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "solid" : "ghost"}
                colorScheme={viewMode === "list" ? "blue" : "gray"}
                onClick={() => setViewMode("list")}
                leftIcon={<Icon as={FiUsers} boxSize={3} />}
                fontSize="xs"
                px={3}
                h={8}
                _hover={{
                  bg:
                    viewMode === "list"
                      ? "blue.500"
                      : colorMode === "light"
                        ? "gray.200"
                        : "gray.600",
                }}
                transition="all 0.2s"
              >
                Team
              </Button>
            </HStack>
          </Flex>
        </MotionBox>

        {/* Stats Cards - Only show in Personal view */}
        {viewMode === "grid" && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <MotionCard
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardBody>
                <Stat>
                  <StatLabel
                    color={colorMode === "light" ? "gray.600" : "gray.400"}
                  >
                    Employee ID
                  </StatLabel>
                  <StatNumber
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    {UserDetail?.nrp || DataAuth?.nrp || "N/A"}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiTag} mr={1} />
                    NRP Number
                  </StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardBody>
                <Stat>
                  <StatLabel
                    color={colorMode === "light" ? "gray.600" : "gray.400"}
                  >
                    Position
                  </StatLabel>
                  <StatNumber
                    color={colorMode === "light" ? "gray.800" : "white"}
                    fontSize="lg"
                  >
                    {UserDetail?.jabatan || "Not specified"}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiShield} mr={1} />
                    Current Role
                  </StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardBody>
                <Stat>
                  <StatLabel
                    color={colorMode === "light" ? "gray.600" : "gray.400"}
                  >
                    Team Role
                  </StatLabel>
                  <StatNumber
                    color={colorMode === "light" ? "gray.800" : "white"}
                    fontSize="lg"
                  >
                    {UserDetail?.teamRole?.specName || "Not assigned"}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiUsers} mr={1} />
                    Specialization
                  </StatHelpText>
                </Stat>
              </CardBody>
            </MotionCard>
          </SimpleGrid>
        )}

        {/* Personal View - Contact Information */}
        {viewMode === "grid" && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.800" : "white"}
              mb={6}
            >
              Contact Information
            </Text>

            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} height="80px" rounded={radiusStyle} />
                ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                <InfoCard
                  icon={FiUser}
                  label="Full Name"
                  value={UserDetail?.nama || DataAuth?.nama || "Not available"}
                  colorScheme="blue"
                />

                <InfoCard
                  icon={FiMail}
                  label="Email Address"
                  value={UserDetail?.email || DataAuth?.userEmail}
                  colorScheme="green"
                />

                <InfoCard
                  icon={FiPhone}
                  label="Phone Number"
                  value={UserDetail?.phoneNumber || DataAuth?.userPhoneNumber}
                  colorScheme="purple"
                />

                <InfoCard
                  icon={FiTag}
                  label="NIP"
                  value={UserDetail?.nip}
                  colorScheme="orange"
                />

                <InfoCard
                  icon={FiTag}
                  label="User ID"
                  value={UserDetail?.userId || DataAuth?.userId}
                  colorScheme="pink"
                />

                <InfoCard
                  icon={FiUsers}
                  label="Organization"
                  value={UserDetail?.namaUnitKerja}
                  colorScheme="teal"
                />
              </SimpleGrid>
            )}
          </MotionBox>
        )}

        {/* Team View - Team Profile */}
        {viewMode === "list" && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!DataAuth?.team?.id ? (
              <MotionCard
                bg={colorMode === "light" ? "white" : "gray.800"}
                rounded={radiusStyle}
                shadow="lg"
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              >
                <CardBody>
                  <VStack spacing={6} py={12}>
                    <Icon
                      as={FiUsers}
                      boxSize={16}
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
                    />
                    <VStack spacing={2}>
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                      >
                        No Team Assigned
                      </Text>
                      <Text
                        fontSize="md"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        textAlign="center"
                      >
                        You are not currently assigned to any team. Please contact your administrator.
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>
            ) : (
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                <GridItem>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* Team Name Card */}
                    <MotionCard
                      whileHover={{ y: -2, shadow: "xl" }}
                      transition={{ duration: 0.2 }}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      borderWidth="1px"
                      rounded={radiusStyle}
                      overflow="hidden"
                    >
                      <CardBody p={4}>
                        <HStack spacing={3}>
                          <Flex
                            w={10}
                            h={10}
                            rounded="lg"
                            bg="blue.100"
                            color="blue.600"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiTag} boxSize={5} />
                          </Flex>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={colorMode === "light" ? "gray.500" : "gray.400"}
                              textTransform="uppercase"
                              letterSpacing="wide"
                            >
                              Team Name
                            </Text>
                            {IsEditMode ? (
                              <Input
                                value={teamFormik.values.teamName}
                                onChange={(e) => teamFormik.setFieldValue("teamName", e.target.value)}
                                size="sm"
                                variant="outline"
                                mt={1}
                              />
                            ) : (
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color={colorMode === "light" ? "gray.800" : "white"}
                                noOfLines={1}
                              >
                                {teamFormik.values.teamName || "Not specified"}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>

                    {/* Team Initial Card */}
                    <MotionCard
                      whileHover={{ y: -2, shadow: "xl" }}
                      transition={{ duration: 0.2 }}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      borderWidth="1px"
                      rounded={radiusStyle}
                      overflow="hidden"
                    >
                      <CardBody p={4}>
                        <HStack spacing={3}>
                          <Flex
                            w={10}
                            h={10}
                            rounded="lg"
                            bg="purple.100"
                            color="purple.600"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiTag} boxSize={5} />
                          </Flex>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={colorMode === "light" ? "gray.500" : "gray.400"}
                              textTransform="uppercase"
                              letterSpacing="wide"
                            >
                              Team Initial
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              noOfLines={1}
                            >
                              {teamFormik.values.teamCode || "Not specified"}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>

                    {/* Description Card */}
                    <MotionCard
                      whileHover={{ y: -2, shadow: "xl" }}
                      transition={{ duration: 0.2 }}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      borderWidth="1px"
                      rounded={radiusStyle}
                      overflow="hidden"
                    >
                      <CardBody p={4}>
                        <HStack spacing={3} align="start">
                          <Flex
                            w={10}
                            h={10}
                            rounded="lg"
                            bg="green.100"
                            color="green.600"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiTag} boxSize={5} />
                          </Flex>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={colorMode === "light" ? "gray.500" : "gray.400"}
                              textTransform="uppercase"
                              letterSpacing="wide"
                            >
                              Description
                            </Text>
                            {IsEditMode ? (
                              <Textarea
                                value={teamFormik.values.teamDesc || ""}
                                onChange={(e) => teamFormik.setFieldValue("teamDesc", e.target.value)}
                                size="sm"
                                variant="outline"
                                rows={2}
                                mt={1}
                              />
                            ) : (
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color={colorMode === "light" ? "gray.800" : "white"}
                                noOfLines={2}
                              >
                                {teamFormik.values.teamDesc || "Not specified"}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>

                    {/* Group Card */}
                    <MotionCard
                      whileHover={{ y: -2, shadow: "xl" }}
                      transition={{ duration: 0.2 }}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      borderWidth="1px"
                      rounded={radiusStyle}
                      overflow="hidden"
                    >
                      <CardBody p={4}>
                        <HStack spacing={3}>
                          <Flex
                            w={10}
                            h={10}
                            rounded="lg"
                            bg="orange.100"
                            color="orange.600"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiTag} boxSize={5} />
                          </Flex>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={colorMode === "light" ? "gray.500" : "gray.400"}
                              textTransform="uppercase"
                              letterSpacing="wide"
                            >
                              Group
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              noOfLines={1}
                            >
                              {TeamData?.group?.orgName || "Not assigned"}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  </SimpleGrid>

                  {/* Team Members Section */}
                  <MotionCard
                    mt={4}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    rounded={radiusStyle}
                    shadow="lg"
                    borderWidth="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  >
                    <CardBody>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        mb={4}
                      >
                        Team Members ({TeamMembers.length})
                      </Text>
                      <VStack spacing={3} align="stretch">
                        {TeamMembers.length > 0 ? (
                          TeamMembers.map((member) => (
                            <Flex
                              key={member.id}
                              p={3}
                              bg={colorMode === "light" ? "gray.50" : "gray.700"}
                              rounded="lg"
                              align="center"
                              gap={3}
                            >
                              <Avatar
                                size="sm"
                                name={member.nama}
                                src={member.profilePict || undefined}
                              />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={colorMode === "light" ? "gray.800" : "white"}
                                >
                                  {member.nama}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color={colorMode === "light" ? "gray.600" : "gray.400"}
                                >
                                  {member.userId} • {member.teamRole?.specName || "Member"}
                                </Text>
                              </VStack>
                              <Badge
                                colorScheme={member.userStatus === "ACTIVE" ? "green" : "gray"}
                                fontSize="xs"
                              >
                                {member.userStatus}
                              </Badge>
                            </Flex>
                          ))
                        ) : (
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            py={8}
                          >
                            <Icon
                              as={FiUsers}
                              boxSize={12}
                              color={colorMode === "light" ? "gray.400" : "gray.600"}
                              mb={3}
                            />
                            <Text
                              fontSize="md"
                              color={colorMode === "light" ? "gray.600" : "gray.400"}
                            >
                              No team members yet
                            </Text>
                          </Flex>
                        )}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                <GridItem>
                  <MotionCard
                    bgGradient={
                      colorMode === "light"
                        ? "linear(135deg, secondary.500, secondary.700, secondary.800)"
                        : "linear(135deg, secondary.600, secondary.800, secondary.900)"
                    }
                    rounded={radiusStyle}
                    shadow="lg"
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Background Pattern */}
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      w="150px"
                      h="150px"
                      bgGradient="radial(circle, whiteAlpha.400, transparent)"
                      rounded="full"
                      transform="translate(50%, -50%)"
                    />
                    <CardBody position="relative" zIndex={1}>
                      <VStack spacing={4}>
                        <Avatar
                          size="2xl"
                          name={TeamData?.teamName || "Team"}
                          src={TeamData?.teamPict || undefined}
                          bg="whiteAlpha.300"
                          border="4px solid"
                          borderColor="whiteAlpha.400"
                        />
                        <VStack spacing={1}>
                          <Text fontWeight="bold" fontSize="lg" color="white">
                            {TeamData?.teamName || "Loading..."}
                          </Text>
                          <Text fontSize="sm" color="whiteAlpha.800">
                            {TeamData?.teamCode || ""}
                          </Text>
                          <Badge colorScheme="green">
                            {TeamData?.isActive || "ACTIVE"}
                          </Badge>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>
              </Grid>
            )}
          </MotionBox>
        )}

        {/* Recent Activity Section - Only show in Personal view */}
        {viewMode === "grid" && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            mt={8}
          >
            <HStack justify="space-between" align="center" mb={6}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Recent Activity
              </Text>
              <Button
                leftIcon={<FiRefreshCw />}
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={handleRefreshAudit}
                isLoading={isLoadingAudit}
                loadingText="Refreshing"
              >
                Refresh
              </Button>
            </HStack>

            <MotionCard
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
              borderWidth="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardBody p={0}>
                {isLoadingAudit ? (
                  <VStack spacing={0}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box
                        key={i}
                        w="full"
                        p={4}
                        borderBottomWidth={i < 5 ? "1px" : "0"}
                      >
                        <Skeleton height="60px" rounded="md" />
                      </Box>
                    ))}
                  </VStack>
                ) : AuditTrailData.length > 0 ? (
                  <VStack spacing={0} align="stretch">
                    {AuditTrailData.map((activity, index) => (
                      <MotionBox
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        p={4}
                        borderBottomWidth={
                          index < AuditTrailData.length - 1 ? "1px" : "0"
                        }
                        borderColor={
                          colorMode === "light" ? "gray.100" : "gray.700"
                        }
                        _hover={{
                          bg: colorMode === "light" ? "gray.50" : "gray.700",
                        }}
                        cursor="pointer"
                      >
                        <HStack spacing={4} align="start">
                          <Flex
                            w={10}
                            h={10}
                            rounded="lg"
                            bg={
                              activity.status === "SUCCESS"
                                ? "green.100"
                                : "red.100"
                            }
                            color={
                              activity.status === "SUCCESS"
                                ? "green.600"
                                : "red.600"
                            }
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            <Icon as={FiActivity} boxSize={5} />
                          </Flex>

                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2} w="full" justify="space-between">
                              <Text
                                fontWeight="semibold"
                                color={
                                  colorMode === "light" ? "gray.800" : "white"
                                }
                                fontSize="sm"
                              >
                                {activity.actoinType}
                              </Text>
                              <Badge
                                colorScheme={
                                  activity.status === "SUCCESS" ? "green" : "red"
                                }
                                size="sm"
                                rounded="full"
                              >
                                {activity.status}
                              </Badge>
                            </HStack>

                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "light" ? "gray.600" : "gray.400"
                              }
                              noOfLines={2}
                            >
                              {activity.descriptions}
                            </Text>

                            <HStack
                              spacing={4}
                              fontSize="xs"
                              color={
                                colorMode === "light" ? "gray.500" : "gray.500"
                              }
                            >
                              <HStack spacing={1}>
                                <Icon as={FiClock} />
                                <Text>
                                  {new Date(
                                    activity.timestampAct
                                  ).toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={FiMonitor} />
                                <Text>{activity.moduleName}</Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </HStack>
                      </MotionBox>
                    ))}
                  </VStack>
                ) : (
                  <Box p={8} textAlign="center">
                    <Icon
                      as={FiActivity}
                      boxSize={12}
                      color={colorMode === "light" ? "gray.300" : "gray.600"}
                      mb={4}
                    />
                    <Text
                      color={colorMode === "light" ? "gray.500" : "gray.400"}
                      fontSize="sm"
                    >
                      No recent activity found
                    </Text>
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </MotionBox>
        )}
      </Container>
    </LayoutAdmin>
  );
}
