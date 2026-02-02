"use client";

import { ProjectDataResponse, ProjectStatusHistoryResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Box,
  Badge,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { FiCalendar, FiPlus, FiRefreshCcw, FiClock, FiCheckCircle, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";
import useProjects from "@/app/services/useProjects";
import { AuthDataResponse } from "@/app/services/useAuthentications";

interface TimelineTabProps {
  DataProject: ProjectDataResponse | null;
  authData: AuthDataResponse | null;
}

const TimelineTab = ({ DataProject, authData }: TimelineTabProps) => {
  const { colorMode } = useColorMode();
  const { GetProjectStatusHistory } = useProjects();
  const [statusHistory, setStatusHistory] = useState<ProjectStatusHistoryResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");

  // Auth effect
  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Load status history
  useEffect(() => {
    console.log("[TimelineTab] useEffect triggered", {
      hasProjectId: !!DataProject?.id,
      projectId: DataProject?.id,
      hasToken: !!tokenData,
      tokenLength: tokenData?.length,
    });

    if (DataProject?.id && tokenData) {
      console.log("[TimelineTab] Calling loadStatusHistory");
      loadStatusHistory();
    } else {
      console.log("[TimelineTab] Skipping loadStatusHistory - missing requirements");
    }
  }, [DataProject?.id, tokenData]);

  const loadStatusHistory = async () => {
    console.log("[loadStatusHistory] Starting", {
      projectId: DataProject?.id,
      hasToken: !!tokenData,
    });

    if (!DataProject?.id || !tokenData) {
      console.log("[loadStatusHistory] Aborted - missing data");
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      console.log("[loadStatusHistory] Calling API...");
      const response = await GetProjectStatusHistory(DataProject.id, tokenData);
      console.log("[loadStatusHistory] API Response:", response);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        console.log("[loadStatusHistory] Setting status history:", response.data);
        setStatusHistory(response.data);
      } else {
        console.log("[loadStatusHistory] Response not OK or no data:", response);
      }
    } catch (error) {
      console.error("[loadStatusHistory] Error:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              Project Timeline
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Track project milestones and important dates
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiRefreshCcw />}
              colorScheme="gray"
              rounded="full"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Calendar/Timeline Content */}
        <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="blue.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, blue.400, blue.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiCalendar size={20} color="white" />
              </Box>
              <Heading size="md" color="blue.700">
                Project Calendar
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <Box
              h="500px"
              bg={colorMode === "light" ? "gray.50" : "gray.800"}
              rounded="lg"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="2px dashed"
              borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
            >
              <FiCalendar size={48} color="gray" />
              <Text color="gray.500" fontSize="lg" fontWeight="medium" mt={4}>
                Calendar Component
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center" mt={2}>
                FullCalendar integration will be implemented here
                <br />
                to show project timeline and milestones
              </Text>
            </Box>
          </CardBody>
        </Card>

        {/* Timeline Events */}
        <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="green.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, green.400, green.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiClock size={20} color="white" />
              </Box>
              <Heading size="md" color="green.700">
                Recent Timeline Events
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {/* Sample Timeline Events */}
              <HStack spacing={4}>
                <Box w={3} h={3} bg="blue.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Project Started</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.projectRegisterDate
                      ? new Date(
                          DataProject.projectRegisterDate
                        ).toLocaleDateString()
                      : "Date not available"}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4}>
                <Box w={3} h={3} bg="green.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Team Assembled</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.userAssignment?.length || 0} members assigned
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4}>
                <Box w={3} h={3} bg="orange.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Current Progress</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.projectStatusPercentage || 0}% completed
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Project Status History */}
        <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="purple.50" roundedTop="xl">
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Box
                  w={10}
                  h={10}
                  bgGradient="linear(135deg, purple.400, purple.600)"
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiCheckCircle size={20} color="white" />
                </Box>
                <Heading size="md" color="purple.700">
                  Project Status History
                </Heading>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiRefreshCcw />}
                colorScheme="purple"
                onClick={loadStatusHistory}
                isLoading={isLoadingHistory}
              >
                Refresh
              </Button>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            {isLoadingHistory ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="purple.500" />
                <Text mt={4} color="gray.600">Loading status history...</Text>
              </Box>
            ) : statusHistory.length === 0 ? (
              <Box textAlign="center" py={8}>
                <FiClock size={48} color="gray" />
                <Text color="gray.500" fontSize="lg" fontWeight="medium" mt={4}>
                  No Status History
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Status changes will appear here
                </Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {statusHistory.map((history, index) => (
                  <Box key={history.id}>
                    <HStack spacing={4} align="start" py={4}>
                      {/* Timeline Dot */}
                      <VStack spacing={0}>
                        <Box
                          w={4}
                          h={4}
                          bg={history.isApprovalPhase ? "green.500" : "blue.400"}
                          rounded="full"
                          border="3px solid"
                          borderColor={colorMode === "light" ? "white" : "gray.800"}
                          shadow="md"
                        />
                        {index < statusHistory.length - 1 && (
                          <Box
                            w="2px"
                            h="full"
                            minH="60px"
                            bg={colorMode === "light" ? "gray.200" : "gray.600"}
                          />
                        )}
                      </VStack>

                      {/* Content */}
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={3} wrap="wrap">
                          <Badge
                            colorScheme={history.isApprovalPhase ? "green" : "blue"}
                            fontSize="sm"
                            px={3}
                            py={1}
                            rounded="full"
                          >
                            {history.projectStatus}
                          </Badge>
                          {history.isApprovalPhase && (
                            <Badge colorScheme="purple" fontSize="xs" px={2} py={1} rounded="full">
                              Approval Phase
                            </Badge>
                          )}
                        </HStack>

                        <Text fontSize="sm" color="gray.600">
                          {formatDate(history.createdAt)}
                        </Text>

                        {/* Approval Details */}
                        {history.isApprovalPhase && history.approvalNama && (
                          <Box
                            mt={2}
                            p={3}
                            bg={colorMode === "light" ? "green.50" : "green.900"}
                            rounded="lg"
                            border="1px"
                            borderColor="green.200"
                            w="full"
                          >
                            <VStack align="start" spacing={2}>
                              <HStack spacing={2}>
                                <FiUser size={16} color="green" />
                                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                  Approved by: {history.approvalNama}
                                </Text>
                              </HStack>
                              
                              {history.approvalJabatan && (
                                <Text fontSize="xs" color="gray.600">
                                  Position: {history.approvalJabatan}
                                </Text>
                              )}
                              
                              {history.approvalOrgDivisionName && (
                                <Text fontSize="xs" color="gray.600">
                                  Division: {history.approvalOrgDivisionName}
                                </Text>
                              )}
                              
                              {history.approvalNote && (
                                <Box mt={2} pt={2} borderTop="1px" borderColor="green.200" w="full">
                                  <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                                    Note:
                                  </Text>
                                  <Text fontSize="sm" color="gray.700" mt={1}>
                                    {history.approvalNote}
                                  </Text>
                                </Box>
                              )}
                              
                              {history.approvalAt && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  Approved at: {formatDate(history.approvalAt)}
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </HStack>
                    {index < statusHistory.length - 1 && <Divider />}
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </TabPanel>
  );
};

export default TimelineTab;
