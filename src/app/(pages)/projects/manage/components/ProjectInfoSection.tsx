"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import {
  FiRefreshCcw,
  FiAlertTriangle,
  FiInfo,
  FiCalendar,
  FiTag,
  FiActivity,
  FiFileText,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse, ProjectSdlcStageReportResponse } from "@/app/services/useProjects";
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
  const { GetDetailById, ListProjectSdlcStageReports, GetProjectSdlcStages } = useProjects();
  const { GetDetailById: GetRequirementDetailById } = useRequirements();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [RequirementData, setRequirementData] = useState<RequirementsResponse | null>(null);
  const [StageReports, setStageReports] = useState<ProjectSdlcStageReportResponse[]>([]);
  const [IsLoadingReports, setIsLoadingReports] = useState(false);
  const [NextStageName, setNextStageName] = useState<string | null>(null);
  const [IsLoadingNextStage, setIsLoadingNextStage] = useState(false);

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

  // Fetch SDLC stage reports for current stage
  useEffect(() => {
    const fetchStageReports = async () => {
      if (!DataProject?.sdlcStageId || !tokenData) return;

      setIsLoadingReports(true);
      try {
        const response = await ListProjectSdlcStageReports(
          DataProject.sdlcStageId,
          1,
          5,
          tokenData
        );

        if (response && response.statusCode === RES_CODE_OK && response.data) {
          setStageReports(response.data);
        }
      } catch (error) {
        console.error("Error fetching stage reports:", error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchStageReports();
  }, [DataProject?.sdlcStageId, tokenData]);

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

  // Fetch next SDLC stage
  useEffect(() => {
    const fetchNextStage = async () => {
      if (!DataProject?.sdlcStageId || !DataProject?.id || !tokenData) {
        setNextStageName(null);
        return;
      }

      setIsLoadingNextStage(true);
      try {
        const response = await GetProjectSdlcStages(DataProject.id, tokenData);

        if (response?.statusCode === RES_CODE_OK && response.data) {
          const stages = response.data;
          const currentStage = stages.find(s => s.id === DataProject.sdlcStageId);
          
          if (currentStage) {
            const nextStage = stages
              .filter(s => s.stagePosOrder > currentStage.stagePosOrder)
              .sort((a, b) => a.stagePosOrder - b.stagePosOrder)[0];
            
            setNextStageName(nextStage?.stageName || null);
          } else {
            setNextStageName(null);
          }
        }
      } catch (error) {
        console.error("Error fetching next stage:", error);
        setNextStageName(null);
      } finally {
        setIsLoadingNextStage(false);
      }
    };

    fetchNextStage();
  }, [DataProject?.sdlcStageId, DataProject?.id, tokenData]);

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
                          Project Status:
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
                          SDLC Status:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          {DataProject.sdlcStageName || "Not Set"}
                        </Text>
                      </HStack>
                      {DataProject.sdlcStageId && (
                        <>
                          <Divider />
                          <HStack justify="space-between">
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              fontWeight="medium"
                            >
                              Next SDLC Stage:
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">
                              {IsLoadingNextStage ? "..." : (NextStageName || "None (Final Stage)")}
                            </Text>
                          </HStack>
                        </>
                      )}
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

                    {/* SDLC Stage Reports Subsection */}
                    {DataProject.sdlcStageId && (
                      <>
                        <Divider my={4} />
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Icon as={FiFileText} color="blue.500" />
                              <Heading size="sm" color="gray.700">
                                Current Stage Reports
                              </Heading>
                              <Badge colorScheme="blue" fontSize="xs">
                                {DataProject.sdlcStageName}
                              </Badge>
                            </HStack>
                          </HStack>

                          {IsLoadingReports ? (
                            <HStack justify="center" py={4}>
                              <Spinner size="sm" />
                              <Text fontSize="sm" color="gray.500">Loading reports...</Text>
                            </HStack>
                          ) : StageReports.length === 0 ? (
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                              No reports for this stage yet.
                            </Text>
                          ) : (
                            <VStack spacing={2} align="stretch">
                              {StageReports.map((report) => (
                                <Card key={report.id} variant="outline" size="sm">
                                  <CardBody>
                                    <VStack align="stretch" spacing={2}>
                                      <HStack justify="space-between">
                                        <Badge 
                                          colorScheme={
                                            report.statusLabel.toLowerCase().includes("progress") ? "blue" :
                                            report.statusLabel.toLowerCase().includes("complete") ? "green" :
                                            report.statusLabel.toLowerCase().includes("block") ? "red" : "gray"
                                          }
                                          fontSize="xs"
                                        >
                                          {report.statusLabel}
                                        </Badge>
                                        <Text fontSize="xs" color="gray.500">
                                          {new Date(report.createdAt).toLocaleDateString()}
                                        </Text>
                                      </HStack>
                                      <Text fontSize="sm" noOfLines={2}>
                                        {report.reportNote}
                                      </Text>
                                      {report.tagsReport && (
                                        <HStack spacing={1} flexWrap="wrap">
                                          {report.tagsReport.split(",").slice(0, 3).map((tag, i) => (
                                            <Badge key={i} variant="subtle" colorScheme="gray" fontSize="xs">
                                              {tag.trim()}
                                            </Badge>
                                          ))}
                                        </HStack>
                                      )}
                                      <Text fontSize="xs" color="gray.500">
                                        By: {report.createdByName}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      </>
                    )}
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
                      {DataProject.isImported === "Y" && 
                       !(RequirementData && RequirementData.isHaveMemo === "Y") && (
                        <Alert
                          status="error"
                          variant="left-accent"
                          rounded="lg"
                          bg={colorMode === "light" ? "red.50" : "red.900"}
                          borderColor={colorMode === "light" ? "red.200" : "red.700"}
                        >
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle fontSize="sm" fontWeight="bold">
                              Imported Project
                            </AlertTitle>
                            <AlertDescription fontSize="xs">
                              Some project features are currently limited. Complete the Requirements Details to get the best experience.
                            </AlertDescription>
                          </Box>
                          {RequirementData && (
                            <Link target="_blank" rel="noopener noreferrer" href={`/requirements/${RequirementData.requirementType?.toLowerCase() || 'brd'}/register?id=${RequirementData.id}`}>
                              <Button size="xs" colorScheme="red" variant="solid">
                                Edit Requirement
                              </Button>
                            </Link>
                          )}
                        </Alert>
                      )}
                      {RequirementData && (
                        <Alert
                          status="info"
                          variant="left-accent"
                          rounded="lg"
                          bg={colorMode === "light" ? "blue.50" : "blue.900"}
                          borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                        >
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle fontSize="sm" fontWeight="bold">
                              Requirement Information
                            </AlertTitle>
                            <AlertDescription fontSize="xs">
                              View complete requirement details and documentation.
                            </AlertDescription>
                          </Box>
                          <Link 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            href={`/requirements/detail?reqId=${RequirementData.id}&type=${RequirementData.requirementType}`}
                          >
                            <Button size="xs" colorScheme="blue" variant="solid">
                              View Requirement
                            </Button>
                          </Link>
                        </Alert>
                      )}
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
