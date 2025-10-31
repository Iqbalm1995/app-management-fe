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

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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
                  <CardHeader
                    bg={colorMode == "light" ? "blue.50" : "blue.900"}
                    roundedTop="xl"
                  >
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
                          Karakteristik:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
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
                          Sub Karakteristik:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
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
