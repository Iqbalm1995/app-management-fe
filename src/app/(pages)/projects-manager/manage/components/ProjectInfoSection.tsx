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
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
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
  const { GetDetailByInitial } = useApps();
  const { GetDetailById: GetRequirementDetailById } = useRequirements();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [RequirementData, setRequirementData] = useState<RequirementsResponse | null>(null);
  const [AppDetailData, setAppDetailData] = useState<ApplicationMasterResponse | null>(null);

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
          const response = await GetRequirementDetailById(DataProject.reqParentId, tokenData);
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

  // Fetch app detail data when requirement data has appInitialCode
  useEffect(() => {
    const fetchAppDetailData = async () => {
      if (RequirementData?.appInitialCode && tokenData) {
        try {
          console.log("Fetching app details for:", RequirementData.appInitialCode);
          const response = await GetDetailByInitial(RequirementData.appInitialCode, tokenData);
          console.log("App detail response:", response);
          if (response && response.statusCode === RES_CODE_OK) {
            setAppDetailData(response.data);
          } else {
            console.log("App not found or error:", response?.message);
            setAppDetailData(null);
          }
        } catch (error) {
          console.error("Error fetching app detail data:", error);
          setAppDetailData(null);
        }
      }
    };

    fetchAppDetailData();
  }, [RequirementData?.appInitialCode, tokenData]);

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
                        <Badge
                          colorScheme="blue"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectNo || "N/A"}
                        </Badge>
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
                          Status:
                        </Text>
                        <Badge
                          colorScheme={
                            DataProject.projectStatus === "ACTIVE"
                              ? "green"
                              : "red"
                          }
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectStatus || "N/A"}
                        </Badge>
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
                        <Badge
                          colorScheme="purple"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectCategory || "N/A"}
                        </Badge>
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
                        <Badge
                          colorScheme="cyan"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                        >
                          {DataProject.projectType || "N/A"}
                        </Badge>
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
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Register Date:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {DataProject.projectRegisterDate
                            ? new Date(
                                DataProject.projectRegisterDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Description Card */}
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
                shadow="2xl"
                rounded="3xl"
                border="0"
                overflow="hidden"
                bg={colorMode === "light" ? "white" : "gray.800"}
                mt={6}
                _hover={{ transform: "translateY(-4px)", transition: "all 0.3s ease" }}
              >
                <CardHeader 
                  bgGradient="linear(135deg, orange.400, orange.600)" 
                  color="white"
                  py={6}
                >
                  <HStack spacing={4}>
                    <Box
                      w={12}
                      h={12}
                      bg="white"
                      rounded="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                    >
                      <FiActivity size={24} color="#EA580C" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" color="white">
                        Requirements & Work Programs
                      </Heading>
                      <Text fontSize="sm" color="orange.100">
                        Detailed requirement specifications and associated work programs
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody p={8} bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                  {RequirementData ? (
                    <VStack spacing={8} align="stretch">
                      {/* Base Requirement Information */}
                      <Box
                        p={6}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        rounded="xl"
                        border="1px"
                        borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                        shadow="md"
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          bgGradient: "linear(to-r, blue.400, blue.600)",
                          roundedTop: "xl"
                        }}
                      >
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between" align="center">
                            <Text fontSize="lg" fontWeight="bold" color={colorMode === "light" ? "blue.800" : "blue.200"}>
                              {RequirementData.reqNumber || "Requirement"}
                            </Text>
                            <HStack spacing={3}>
                              <Badge 
                                colorScheme={RequirementData.reqStatus === "ACTIVE" ? "green" : "gray"} 
                                fontSize="sm" 
                                px={3} 
                                py={1} 
                                rounded="full"
                              >
                                {RequirementData.reqStatus || "N/A"}
                              </Badge>
                              <Badge 
                                colorScheme="purple" 
                                fontSize="sm" 
                                px={3} 
                                py={1} 
                                rounded="full"
                              >
                                {RequirementData.requirementType || "N/A"}
                              </Badge>
                            </HStack>
                          </HStack>
                          
                          {RequirementData.reqNarative && (
                            <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                              {RequirementData.reqNarative}
                            </Text>
                          )}
                          
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <VStack spacing={1} align="start">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Initiate Date:
                              </Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqInititateDate ? 
                                  new Date(RequirementData.reqInititateDate).toLocaleDateString() : 
                                  "Not specified"
                                }
                              </Text>
                            </VStack>
                            
                            <VStack spacing={1} align="start">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Duration:
                              </Text>
                              <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                {RequirementData.reqDurationDay ? `${RequirementData.reqDurationDay} days` : "Not specified"}
                              </Text>
                            </VStack>
                            
                            <VStack spacing={1} align="start">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Carry Over:
                              </Text>
                              <Badge colorScheme={RequirementData.isCarryOver === "Y" ? "orange" : "gray"} fontSize="xs">
                                {RequirementData.isCarryOver === "Y" ? "Yes" : "No"}
                              </Badge>
                            </VStack>
                          </SimpleGrid>
                        </VStack>
                      </Box>

                      {/* Sender Information */}
                      {RequirementData.senderDirectorateName && (
                        <Box
                          p={4}
                          bg={colorMode === "light" ? "green.50" : "green.900"}
                          rounded="lg"
                          border="1px"
                          borderColor={colorMode === "light" ? "green.200" : "green.700"}
                        >
                          <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "green.800" : "green.200"}>
                              Sender Information
                            </Text>
                            
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Directorate:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.senderDirectorateName}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Division:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.senderDivisionName || "Not specified"}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </VStack>
                        </Box>
                      )}

                      {/* PIC Information */}
                      {RequirementData.userPicName && (
                        <Box
                          p={4}
                          bg={colorMode === "light" ? "purple.50" : "purple.900"}
                          rounded="lg"
                          border="1px"
                          borderColor={colorMode === "light" ? "purple.200" : "purple.700"}
                        >
                          <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "purple.800" : "purple.200"}>
                              Person In Charge (PIC)
                            </Text>
                            
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Name:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.userPicName}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Email:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.userPicEmail || "Not specified"}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Division:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.userPicDivisionName || "Not specified"}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Contact:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.userPicContanct || "Not specified"}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </VStack>
                        </Box>
                      )}

                      {/* Application Information */}
                      {RequirementData.appInitialName && (
                        <Box
                          p={4}
                          bg={colorMode === "light" ? "orange.50" : "orange.900"}
                          rounded="lg"
                          border="1px"
                          borderColor={colorMode === "light" ? "orange.200" : "orange.700"}
                        >
                          <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "orange.800" : "orange.200"}>
                              Application Information
                            </Text>
                            
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  App Name:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appInitialName}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  App Code:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appInitialCode || "Not specified"}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Target Users:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appTargetUsers || "Not specified"}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  App Type:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appTypes || RequirementData.appTypeCustom || "Not specified"}
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Live Target Date:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appLiveTargetDate ? 
                                    new Date(RequirementData.appLiveTargetDate).toLocaleDateString() : 
                                    "Not specified"
                                  }
                                </Text>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Access Media:
                                </Text>
                                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                  {RequirementData.appAccessMedia || "Not specified"}
                                </Text>
                              </VStack>
                            </SimpleGrid>

                            {/* Access Information */}
                            {(RequirementData.appAccessFrontsiteDns || RequirementData.appAccessBacksiteDns) && (
                              <VStack spacing={3} align="stretch">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Access Information:
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  {RequirementData.appAccessFrontsiteDns && (
                                    <VStack spacing={1} align="start">
                                      <Text fontSize="xs" color="gray.500">Frontend DNS:</Text>
                                      <Text fontSize="sm" color="blue.600">{RequirementData.appAccessFrontsiteDns}</Text>
                                    </VStack>
                                  )}
                                  {RequirementData.appAccessBacksiteDns && (
                                    <VStack spacing={1} align="start">
                                      <Text fontSize="xs" color="gray.500">Backend DNS:</Text>
                                      <Text fontSize="sm" color="blue.600">{RequirementData.appAccessBacksiteDns}</Text>
                                    </VStack>
                                  )}
                                </SimpleGrid>
                              </VStack>
                            )}

                            {/* Operational Information */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  24/7 Operation:
                                </Text>
                                <Badge colorScheme={RequirementData.appOperational24hrs === "Y" ? "green" : "gray"} fontSize="xs">
                                  {RequirementData.appOperational24hrs === "Y" ? "Yes" : "No"}
                                </Badge>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Transactional:
                                </Text>
                                <Badge colorScheme={RequirementData.appTransactionals === "Y" ? "blue" : "gray"} fontSize="xs">
                                  {RequirementData.appTransactionals === "Y" ? "Yes" : "No"}
                                </Badge>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  High Availability:
                                </Text>
                                <Badge colorScheme={RequirementData.appHightAvailability === "Y" ? "purple" : "gray"} fontSize="xs">
                                  {RequirementData.appHightAvailability === "Y" ? "Yes" : "No"}
                                </Badge>
                              </VStack>
                              
                              <VStack spacing={1} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                  Integration with Others:
                                </Text>
                                <Badge colorScheme={RequirementData.appIntegrationOthersApps === "Y" ? "orange" : "gray"} fontSize="xs">
                                  {RequirementData.appIntegrationOthersApps === "Y" ? "Yes" : "No"}
                                </Badge>
                              </VStack>
                            </SimpleGrid>

                            {/* Environment & Security */}
                            {(RequirementData.appEnvLocations || RequirementData.appPrivateAuth) && (
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <VStack spacing={1} align="start">
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                    Environment Location:
                                  </Text>
                                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                    {RequirementData.appEnvLocations || RequirementData.appEnvLocationsOthers || "Not specified"}
                                  </Text>
                                </VStack>
                                
                                <VStack spacing={1} align="start">
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                    Private Auth:
                                  </Text>
                                  <Badge colorScheme={RequirementData.appPrivateAuth === "Y" ? "red" : "gray"} fontSize="xs">
                                    {RequirementData.appPrivateAuth === "Y" ? "Required" : "Not Required"}
                                  </Badge>
                                </VStack>
                              </SimpleGrid>
                            )}
                          </VStack>
                        </Box>
                      )}

                      {/* Work Programs */}
                      {RequirementData.workPrograms && RequirementData.workPrograms.length > 0 && (
                        <VStack spacing={4} align="stretch">
                          <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            Work Programs:
                          </Text>
                          {RequirementData.workPrograms.map((workProgram, index) => (
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
                                  <Badge colorScheme="green" fontSize="xs">
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
                      )}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="md">
                        No requirements data available for this project
                      </Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>
                        Requirements and work programs will appear here when available
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>

              {/* Application Detail Information from Apps Service */}
              <Card
                shadow="2xl"
                rounded="3xl"
                border="0"
                overflow="hidden"
                bg={colorMode === "light" ? "white" : "gray.800"}
                mt={6}
                _hover={{ transform: "translateY(-4px)", transition: "all 0.3s ease" }}
              >
                <CardHeader 
                  bgGradient="linear(135deg, teal.400, teal.600)" 
                  color="white"
                  py={6}
                >
                  <HStack spacing={4}>
                    <Box
                      w={12}
                      h={12}
                      bg="white"
                      rounded="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                    >
                      <FiActivity size={24} color="#0F766E" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" color="white">
                        Application Master Details
                      </Heading>
                      <Text fontSize="sm" color="teal.100">
                        Official application information from master database
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody p={8} bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                  {AppDetailData ? (
                    <Box
                      p={6}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      rounded="xl"
                      border="1px"
                      borderColor={colorMode === "light" ? "teal.200" : "teal.700"}
                      shadow="md"
                      position="relative"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        bgGradient: "linear(to-r, teal.400, teal.600)",
                        roundedTop: "xl"
                      }}
                    >
                      <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Application Name:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.appName || "Not specified"}
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            App Short Name:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.appShortName || "Not specified"}
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Status:
                          </Text>
                          <Badge colorScheme={AppDetailData.appsStatus === "ACTIVE" ? "green" : "gray"} fontSize="xs">
                            {AppDetailData.appsStatus || "N/A"}
                          </Badge>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Category:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {"Not specified"}
                          </Text>
                        </VStack>
                      </SimpleGrid>

                      {AppDetailData.appsDesc && (
                        <VStack spacing={1} align="start" mt={4}>
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Description:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.appsDesc}
                          </Text>
                        </VStack>
                      )}

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Owner Directorate:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {"Not specified"}
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Owner Division:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.appOwnerDivisionName || "Not specified"}
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Created Date:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.createdAt ? 
                              new Date(AppDetailData.createdAt).toLocaleDateString() : 
                              "Not specified"
                            }
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            Created By:
                          </Text>
                          <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {AppDetailData.createdBy || "Not specified"}
                          </Text>
                        </VStack>
                      </SimpleGrid>
                      </VStack>
                    </Box>
                  ) : RequirementData?.appInitialCode ? (
                    <Box textAlign="center" py={8}>
                      <Text color="orange.500" fontSize="md">
                        Application with code "{RequirementData.appInitialCode}" not found in system
                      </Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>
                        Application details will appear here when available
                      </Text>
                    </Box>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="md">
                        No application code available in requirement data
                      </Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>
                        Application details will appear here when available
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
