"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Heading,
  Button,
  Box,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import {
  FiRefreshCcw,
  FiAlertTriangle,
  FiInfo,
  FiCalendar,
  FiTag,
  FiActivity,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { CustomPanelAlert } from "@/app/components/customPanels";
import LoadingMiniSignature from "@/app/components/loadingMini";

interface ProjectInfoSectionProps {
  DataProject: ProjectDataResponse | null;
}

const ProjectInfoSection = ({ DataProject }: ProjectInfoSectionProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailById } = useProjects();
  const { GetDetailById: GetRequirementDetailById } = useRequirements();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [RequirementData, setRequirementData] = useState<RequirementsResponse | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Fetch requirement data when project data is available
  useEffect(() => {
    const fetchRequirementData = async () => {
      if (DataProject?.reqParentId && tokenData) {
        try {
          const response = await GetRequirementDetailById(
            DataProject.reqParentId,
            tokenData
          );
          if (response && response.statusCode === RES_CODE_OK) {
            setRequirementData(response.data);
          }
        } catch (error) {
          console.error("Error fetching requirement data:", error);
        }
      }
    };

    fetchRequirementData();
  }, [DataProject?.reqParentId, tokenData]);

  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  return (
    <VStack spacing={6} align="stretch">
      {!DataProject ? (
        <CustomPanelAlert type={"error"}>
          <FiAlertTriangle color={"red"} size={70} />
          <Text>No project ID found in the URL</Text>
        </CustomPanelAlert>
      ) : (
        <>
          {IsLoadingProcess ? (
            <Box textAlign="center" py={12}>
              <LoadingMiniSignature />
              <Text mt={4} color="gray.500">
                Loading project information...
              </Text>
            </Box>
          ) : DataProject ? (
            <>
              {/* Header Section */}
              <HStack justify="space-between" align="center">
                <Heading
                  size="lg"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  Project Information
                </Heading>
                <Button
                  leftIcon={<FiRefreshCcw />}
                  variant="outline"
                  size="sm"
                  onClick={RefreshAction}
                  colorScheme="blue"
                  rounded="full"
                >
                  Refresh
                </Button>
              </HStack>

              {/* Beautiful Information Cards */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Basic Information Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                        <FiInfo size={20} color="white" />
                      </Box>
                      <Heading size="md" color="blue.700">
                        Basic Information
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Project Number:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="blue.600"
                        >
                          {DataProject.projectNo || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Project Name:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="gray.800"
                          textAlign="right"
                          maxW="200px"
                        >
                          {DataProject.projectName || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Karakteristik:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectCharasteristicName || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Sub Karakteristik:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectSubCharasteristicName || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Status:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={
                            DataProject.projectStatus === "ACTIVE"
                              ? "green.600"
                              : "red.600"
                          }
                        >
                          {DataProject.projectStatus || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Progress:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectStatusPercentage || 0}%
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Project Categories Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
                  <CardHeader bg="purple.50" roundedTop="xl">
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
                        <FiTag size={20} color="white" />
                      </Box>
                      <Heading size="md" color="purple.700">
                        Categories
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Category:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="purple.600"
                          textAlign="right"
                        >
                          {DataProject.projectCategory || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Type:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="cyan.600"
                          textAlign="right"
                        >
                          {DataProject.projectType || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Acquisition Code:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="orange.600"
                          textAlign="right"
                        >
                          {DataProject.projectAcquisitionCode || "N/A"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Acquisition Name:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="teal.600"
                          textAlign="right"
                        >
                          {DataProject.projectAcquisitionName || "N/A"}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Timeline Card */}
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
                  <CardHeader bg="orange.50" roundedTop="xl">
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bgGradient="linear(135deg, orange.400, orange.600)"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiCalendar size={20} color="white" />
                      </Box>
                      <Heading size="md" color="orange.700">
                        Timeline
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Tanggal Memo:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {RequirementData?.reqInititateDate ? new Date(RequirementData.reqInititateDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Tanggal Memo Diterima:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {RequirementData?.reqAcceptedDate ? new Date(RequirementData.reqAcceptedDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Durasi Memo:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {RequirementData?.reqDurationDay ? `${RequirementData.reqDurationDay} hari` : "-"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Tanggal Register Project:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate ? new Date(DataProject.projectRegisterDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Tanggal Closed Project:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectClosedDate ? new Date(DataProject.projectClosedDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          Durasi Project:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectDurationDays ? `${DataProject.projectDurationDays} hari` : "-"}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>

                </Card>
                <Card
                  shadow="lg"
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                >
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
                        <FiActivity size={20} color="white" />
                      </Box>
                      <Heading size="md" color="green.700">
                        Description
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      lineHeight="tall"
                      minH="60px"
                    >
                      {DataProject.projectDesc ||
                        "No description available for this project."}
                    </Text>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Requirements Information Section */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
                mt={6}
              >
                <CardHeader bg="orange.50" roundedTop="xl">
                  <HStack spacing={3}>
                    <Box
                      w={10}
                      h={10}
                      bgGradient="linear(135deg, orange.400, orange.600)"
                      rounded="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FiActivity size={20} color="white" />
                    </Box>
                    <Heading size="md" color="orange.700">
                      Requirements & Work Programs
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  {RequirementData ? (
                    <VStack spacing={6} align="stretch">
                      {/* Requirement Details */}
                      <Box
                        p={5}
                        bg={colorMode === "light" ? "blue.50" : "gray.700"}
                        rounded="lg"
                        border="1px"
                        borderColor={colorMode === "light" ? "blue.200" : "blue.600"}
                      >
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold" color={colorMode === "light" ? "blue.800" : "blue.200"}>
                              {RequirementData.reqNumber || "Requirement"}
                            </Text>
                            <Badge colorScheme="blue" fontSize="xs">
                              {RequirementData.requirementType || "N/A"}
                            </Badge>
                          </HStack>
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Perihal:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqNarative || "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Divisi Pengirim:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.senderDivisionName || "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Tanggal Memo:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqInititateDate 
                                  ? new Date(RequirementData.reqInititateDate).toLocaleDateString()
                                  : "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Tanggal Diterima:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqAcceptedDate 
                                  ? new Date(RequirementData.reqAcceptedDate).toLocaleDateString()
                                  : "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Durasi:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqDurationDay 
                                  ? `${RequirementData.reqDurationDay} Hari kalender`
                                  : "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">CarryOver:</Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.isCarryOver === "Y" ? "YA" : RequirementData.isCarryOver === "N" ? "TIDAK" : "N/A"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </VStack>
                      </Box>

                      {/* Work Programs */}
                      {DataProject.workPrograms && DataProject.workPrograms.length > 0 && (
                        <>
                          <Divider />
                          <Text fontSize="sm" fontWeight="bold" color="gray.600">Work Programs</Text>
                          {DataProject.workPrograms.map((workProgram, index) => (
                            <Box
                              key={index}
                              p={4}
                              bg={colorMode === "light" ? "gray.50" : "gray.700"}
                              rounded="lg"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                            >
                              <VStack spacing={3} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                    {workProgram.workProgramName || "Work Program"}
                                  </Text>
                                  <Badge colorScheme="blue" fontSize="xs">
                                    {workProgram.workProgramCode || "N/A"}
                                  </Badge>
                                </HStack>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                  <VStack spacing={1} align="start">
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                      Budget:
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                      {workProgram.workProgramBudget ?
                                        `Rp ${workProgram.workProgramBudget.toLocaleString()}` :
                                        "Not specified"
                                      }
                                    </Text>
                                  </VStack>

                                  <VStack spacing={1} align="start">
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                      Division:
                                    </Text>
                                    <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                      {workProgram.divisionName || "Not assigned"}
                                    </Text>
                                  </VStack>

                                  <VStack spacing={1} align="start">
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                      Source:
                                    </Text>
                                    <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                      {workProgram.workProgramSource || "Not specified"}
                                    </Text>
                                  </VStack>
                                </SimpleGrid>
                              </VStack>
                            </Box>
                          ))}
                        </>
                      )}
                    </VStack>
                  ) : DataProject.workPrograms && DataProject.workPrograms.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {DataProject.workPrograms.map((workProgram, index) => (
                        <Box
                          key={index}
                          p={4}
                          bg={colorMode === "light" ? "gray.50" : "gray.700"}
                          rounded="lg"
                          border="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        >
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                {workProgram.workProgramName || "Work Program"}
                              </Text>
                              <Badge colorScheme="blue" fontSize="xs">
                                {workProgram.workProgramCode || "N/A"}
                              </Badge>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Budget:
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                  {workProgram.workProgramBudget ?
                                    `Rp ${workProgram.workProgramBudget.toLocaleString()}` :
                                    "Not specified"
                                  }
                                </Text>
                              </VStack>

                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Division:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {workProgram.divisionName || "Not assigned"}
                                </Text>
                              </VStack>

                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Source:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {workProgram.workProgramSource || "Not specified"}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="md">
                        No requirements data available for this project
                      </Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>
                        Work programs and requirements will appear here when available
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </>
          ) : (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                No project data available
              </Text>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};

export default ProjectInfoSection;
