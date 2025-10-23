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
import { FiActivity, FiClock, FiMonitor, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useLogActivityUsers, {
  LogActivityUserSummaryResponse,
} from "@/app/services/useLogActivityUsers";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailByUserId, isLoading } = useUsers();
  const { GetPagedList: GetAuditTrail, isLoading: isLoadingAudit } =
    useLogActivityUsers();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [UserDetail, setUserDetail] = useState<UsersResponse | null>(null);
  const [AuditTrailData, setAuditTrailData] = useState<
    LogActivityUserSummaryResponse[]
  >([]);
  const [RefreshAudit, setRefreshAudit] = useState<number>(0);

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
      rounded="xl"
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
          rounded="2xl"
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

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            bg={colorMode === "light" ? "white" : "gray.800"}
            rounded="xl"
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
            rounded="xl"
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
            rounded="xl"
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

        {/* Contact Information */}
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
                <Skeleton key={i} height="80px" rounded="xl" />
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

        {/* Recent Activity Section */}
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
            rounded="xl"
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
      </Container>
    </LayoutAdmin>
  );
}
