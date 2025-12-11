"use client";

import { useEffect, useState } from "react";
import useProjects, {
  ProjectDataResponse,
  ProjectQuickStatsResponse,
} from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Box,
  Text,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import {
  FiUsers,
  FiAlertCircle,
  FiFileText,
  FiShoppingCart,
  FiLayers,
} from "react-icons/fi";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";

interface OverviewTabProps {
  DataProject: ProjectDataResponse | null;
}

const OverviewTab = ({ DataProject }: OverviewTabProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { GetProjectQuickStats } = useProjects();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Quick Stats State
  const [QuickStats, setQuickStats] =
    useState<ProjectQuickStatsResponse | null>(null);
  const [IsLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch Quick Stats
  useEffect(() => {
    if (DataAuth && DataProject && tokenData) {
      setIsLoadingStats(true);
      const FetchQuickStats = async () => {
        try {
          const response = await GetProjectQuickStats(
            DataProject.id,
            tokenData
          );

          if (response?.statusCode === RES_CODE_OK && response.data) {
            setQuickStats(response.data);
          } else {
            showToast({
              description: response?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching quick stats:", error);
          showToast({
            description: "Failed to load quick stats",
            statusToast: "error",
          });
        } finally {
          setIsLoadingStats(false);
        }
      };

      FetchQuickStats();
    }
  }, [DataAuth, DataProject, tokenData]);

  // Check if project is procurement type
  const isProcurement = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT;

  return (
    <TabPanel>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Project Overview
          </Heading>
          <Badge colorScheme="blue" px={4} py={2} rounded="full" fontSize="md">
            Dashboard
          </Badge>
        </HStack>

        {/* Quick Stats Section */}
        <Box>
          <Heading
            size="md"
            mb={4}
            color={colorMode === "light" ? "gray.700" : "gray.200"}
          >
            Quick Stats
          </Heading>

          {IsLoadingStats ? (
            <Box textAlign="center" py={12}>
              <LoadingMiniSignature />
              <Text mt={4} color="gray.500">
                Loading quick stats...
              </Text>
            </Box>
          ) : QuickStats ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: isProcurement ? 5 : 4 }} spacing={4}>
              {/* Total Backlogs */}
              <Card
                rounded={radiusStyle}
                shadow="md"
                bg={colorMode === "light" ? "white" : "gray.800"}
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <Icon
                        as={FiLayers}
                        boxSize={6}
                        color="blue.500"
                      />
                    </HStack>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                      {QuickStats.totalBacklogs}
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500">
                      Total Backlogs
                    </StatLabel>
                  </Stat>
                </CardBody>
              </Card>

              {/* Documentation Progress */}
              <Card
                rounded={radiusStyle}
                shadow="md"
                bg={colorMode === "light" ? "white" : "gray.800"}
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <Icon
                        as={FiFileText}
                        boxSize={6}
                        color="purple.500"
                      />
                    </HStack>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
                      {QuickStats.documentationProgressPercentage}%
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500">
                      Documentation
                    </StatLabel>
                    <StatHelpText fontSize="xs" color="gray.400">
                      {QuickStats.completedDocumentations}/{QuickStats.totalDocumentations} completed
                    </StatHelpText>
                    <Progress
                      value={QuickStats.documentationProgressPercentage}
                      size="sm"
                      colorScheme="purple"
                      rounded="full"
                      mt={2}
                    />
                  </Stat>
                </CardBody>
              </Card>

              {/* Procurement Progress - Only show for procurement projects */}
              {isProcurement && (
                <Card
                  rounded={radiusStyle}
                  shadow="md"
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  borderWidth="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" mb={2}>
                        <Icon
                          as={FiShoppingCart}
                          boxSize={6}
                          color="green.500"
                        />
                      </HStack>
                      <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                        {QuickStats.procurementProgressPercentage}%
                      </StatNumber>
                      <StatLabel fontSize="sm" color="gray.500">
                        Procurement
                      </StatLabel>
                      <StatHelpText fontSize="xs" color="gray.400">
                        {QuickStats.completedProcurementStages}/{QuickStats.totalProcurementStages} stages
                      </StatHelpText>
                      <Progress
                        value={QuickStats.procurementProgressPercentage}
                        size="sm"
                        colorScheme="green"
                        rounded="full"
                        mt={2}
                      />
                    </Stat>
                  </CardBody>
                </Card>
              )}

              {/* Active Members */}
              <Card
                rounded={radiusStyle}
                shadow="md"
                bg={colorMode === "light" ? "white" : "gray.800"}
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <Icon
                        as={FiUsers}
                        boxSize={6}
                        color="cyan.500"
                      />
                    </HStack>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="cyan.500">
                      {QuickStats.activeMembers}
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500">
                      Active Members
                    </StatLabel>
                  </Stat>
                </CardBody>
              </Card>

              {/* Near Deadline */}
              <Card
                rounded={radiusStyle}
                shadow="md"
                bg={colorMode === "light" ? "white" : "gray.800"}
                borderWidth="1px"
                borderColor={
                  QuickStats.backlogsNearDeadline > 0
                    ? "orange.300"
                    : colorMode === "light"
                    ? "gray.200"
                    : "gray.700"
                }
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <HStack justify="space-between" mb={2}>
                      <Icon
                        as={FiAlertCircle}
                        boxSize={6}
                        color={
                          QuickStats.backlogsNearDeadline > 0
                            ? "orange.500"
                            : "gray.400"
                        }
                      />
                    </HStack>
                    <StatNumber
                      fontSize="3xl"
                      fontWeight="bold"
                      color={
                        QuickStats.backlogsNearDeadline > 0
                          ? "orange.500"
                          : "gray.400"
                      }
                    >
                      {QuickStats.backlogsNearDeadline}
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500">
                      Near Deadline
                    </StatLabel>
                    {QuickStats.backlogsNearDeadline > 0 && (
                      <StatHelpText fontSize="xs" color="orange.500">
                        Requires attention
                      </StatHelpText>
                    )}
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={12}>
              <Text color="gray.500">No stats available</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </TabPanel>
  );
};

export default OverviewTab;
