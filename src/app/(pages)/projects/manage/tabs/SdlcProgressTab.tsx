"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Box,
  Badge,
  Icon,
  Divider,
  Spinner,
  Stack,
  Progress,
  SimpleGrid,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectDataResponse, ProjectSdlcStageResponse } from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import { FiGitBranch, FiAlertCircle, FiSettings, FiCalendar, FiCheckCircle, FiCircle } from "react-icons/fi";
import SetupSdlcModal from "../components/SetupSdlcModal";
import UpdateStageDatesModal from "../components/UpdateStageDatesModal";


interface SdlcProgressTabProps {
  DataProject: ProjectDataResponse | null;
  canMake: boolean;
  onProjectUpdate?: () => void;
}

const SdlcProgressTab = ({ DataProject, canMake, onProjectUpdate }: SdlcProgressTabProps) => {
  const { colorMode } = useColorMode();
  const { GetProjectSdlcStages } = useProjects();
  
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isUpdateDatesModalOpen, setIsUpdateDatesModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProjectSdlcStageResponse | null>(null);
  const [stages, setStages] = useState<ProjectSdlcStageResponse[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");

  const hasSdlcSetup = DataProject?.sdlcId != null;

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (hasSdlcSetup && tokenData && DataProject?.id) {
      loadStages();
    }
  }, [hasSdlcSetup, tokenData, DataProject?.id]);

  const loadStages = async () => {
    if (!DataProject?.id || !tokenData) return;
    
    setIsLoadingStages(true);
    const response = await GetProjectSdlcStages(DataProject.id, tokenData);
    if (response && response.statusCode === RES_CODE_OK && response.data) {
      setStages(response.data);
      const activeStage = response.data.find(s => s.isActive);
      if (activeStage) {
        setSelectedStage(activeStage);
      }
    }
    setIsLoadingStages(false);
  };

  const handleSetupSuccess = () => {
    setIsSetupModalOpen(false);
    onProjectUpdate?.(); // Refresh project data in parent
    loadStages(); // Load stages for the newly setup SDLC
  };

  const handleUpdateDatesSuccess = () => {
    setIsUpdateDatesModalOpen(false);
    loadStages();
    onProjectUpdate?.(); // Refresh project data in parent
  };

  const openUpdateDatesModal = (stage: ProjectSdlcStageResponse) => {
    setSelectedStage(stage);
    setIsUpdateDatesModalOpen(true);
  };

  // Calculate progression
  const stageProgression = useMemo(() => {
    const totalStages = stages.length;
    const completedStages = stages.filter(
      (stage) => stage.startDate !== null && stage.endDate !== null
    ).length;
    const inProgressStages = stages.filter(
      (stage) => stage.startDate !== null && stage.endDate === null
    ).length;
    const notStartedStages = stages.filter(
      (stage) => stage.startDate === null
    ).length;
    const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return {
      totalStages,
      completedStages,
      inProgressStages,
      notStartedStages,
      percentage,
    };
  }, [stages]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!hasSdlcSetup) {
    return (
      <TabPanel>
        <VStack spacing={6} align="stretch">
          <Card
            shadow="lg"
            rounded={radiusStyle}
            border="1px"
            borderColor={colorMode === "light" ? "orange.200" : "orange.700"}
            bg={colorMode === "light" ? "orange.50" : "gray.800"}
          >
            <CardBody>
              <VStack spacing={6} align="center" py={8}>
                <Icon
                  as={FiAlertCircle}
                  boxSize={16}
                  color={colorMode === "light" ? "orange.500" : "orange.300"}
                />
                
                <VStack spacing={2}>
                  <Heading size="md" color={colorMode === "light" ? "orange.700" : "orange.300"}>
                    SDLC is not setup yet
                  </Heading>
                  <Text
                    textAlign="center"
                    color={colorMode === "light" ? "gray.600" : "gray.400"}
                    maxW="500px"
                  >
                    Setup SDLC methodology to track project stages and progression.
                  </Text>
                </VStack>

                {canMake && (
                  <Button
                    leftIcon={<FiSettings />}
                    colorScheme="orange"
                    size="lg"
                    onClick={() => setIsSetupModalOpen(true)}
                  >
                    Setup SDLC
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        <SetupSdlcModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          projectId={DataProject?.id || ""}
          projectType={DataProject?.projectType || ""}
          onSuccess={handleSetupSuccess}
        />
      </TabPanel>
    );
  }

  return (
    <TabPanel>
      <VStack spacing={6} align="stretch">
        {/* SDLC Info Header */}
        <Card shadow="md" rounded={radiusStyle}>
          <CardBody>
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Icon as={FiGitBranch} boxSize={6} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.500">SDLC Flow</Text>
                  <Heading size="md">{DataProject?.sdlcName}</Heading>
                </VStack>
              </HStack>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                {stages.length} Stages
              </Badge>
            </HStack>
          </CardBody>
        </Card>

        {/* Stage Progression */}
        <Card 
          shadow="md" 
          rounded={radiusStyle}
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderWidth="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="sm">
                  SDLC Progression - {DataProject?.sdlcStageName || "N/A"}
                </Heading>
                <Badge colorScheme="blue" fontSize="md">
                  {stageProgression.percentage}%
                </Badge>
              </HStack>
              <Progress
                value={stageProgression.percentage}
                size="lg"
                colorScheme="blue"
                rounded="full"
              />
              <Text fontSize="sm" color="gray.500">
                {stageProgression.completedStages} of {stageProgression.totalStages} stages completed
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">Completed Stages</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {stageProgression.completedStages}/{stageProgression.totalStages}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">In Progress</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {stageProgression.inProgressStages}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Stages Timeline */}
        <Card shadow="md" rounded={radiusStyle}>
          <CardHeader>
            <Heading size="md">Stage Timeline</Heading>
          </CardHeader>
          <CardBody>
            {isLoadingStages ? (
              <HStack justify="center" py={8}>
                <Spinner />
                <Text>Loading stages...</Text>
              </HStack>
            ) : (
              <VStack spacing={4} align="stretch">
                {stages.map((stage, index) => (
                  <Box key={stage.id}>
                    <Card
                      variant="outline"
                      bg={stage.isActive ? (colorMode === "light" ? "blue.50" : "blue.900") : undefined}
                      borderColor={stage.isActive ? "blue.500" : undefined}
                      borderWidth={stage.isActive ? 2 : 1}
                    >
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <HStack spacing={4} flex={1}>
                            <Icon
                              as={stage.isCompleted ? FiCheckCircle : stage.isActive ? FiCircle : FiCircle}
                              boxSize={6}
                              color={stage.isCompleted ? "green.500" : stage.isActive ? "blue.500" : "gray.400"}
                            />
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack>
                                <Text fontWeight="bold">{stage.stageName}</Text>
                                {stage.isActive && <Badge colorScheme="blue">Active</Badge>}
                                {stage.isCompleted && <Badge colorScheme="green">Completed</Badge>}
                              </HStack>
                              <HStack spacing={4} fontSize="sm" color="gray.600">
                                <Text>Start: {formatDate(stage.startDate)}</Text>
                                <Text>End: {formatDate(stage.endDate)}</Text>
                                {stage.durationDays && <Text>({stage.durationDays} days)</Text>}
                              </HStack>
                            </VStack>
                          </HStack>
                          {canMake && (
                            <Button
                              size="sm"
                              leftIcon={<FiCalendar />}
                              onClick={(e) => {
                                e.stopPropagation();
                                openUpdateDatesModal(stage);
                              }}
                            >
                              Manage Dates
                            </Button>
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                    {index < stages.length - 1 && <Divider />}
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      <SetupSdlcModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        projectId={DataProject?.id || ""}
        projectType={DataProject?.projectType || ""}
        onSuccess={handleSetupSuccess}
      />

      {selectedStage && (
        <UpdateStageDatesModal
          isOpen={isUpdateDatesModalOpen}
          onClose={() => setIsUpdateDatesModalOpen(false)}
          stage={selectedStage}
          onSuccess={handleUpdateDatesSuccess}
        />
      )}
    </TabPanel>
  );
};

export default SdlcProgressTab;
