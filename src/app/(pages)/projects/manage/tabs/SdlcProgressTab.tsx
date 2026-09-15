"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  Box,
  Badge,
  Icon,
  Spinner,
  Progress,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectDataResponse, ProjectSdlcStageResponse } from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import {
  FiGitBranch,
  FiAlertCircle,
  FiSettings,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCircle,
  FiActivity,
  FiZap,
} from "react-icons/fi";
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
      const activeStage = response.data.find((s) => s.isActive);
      if (activeStage) {
        setSelectedStage(activeStage);
      }
    }
    setIsLoadingStages(false);
  };

  const handleSetupSuccess = () => {
    setIsSetupModalOpen(false);
    onProjectUpdate?.();
    loadStages();
  };

  const handleUpdateDatesSuccess = () => {
    setIsUpdateDatesModalOpen(false);
    loadStages();
    onProjectUpdate?.();
  };

  const openUpdateDatesModal = (stage: ProjectSdlcStageResponse) => {
    setSelectedStage(stage);
    setIsUpdateDatesModalOpen(true);
  };

  // Calculate progression statistics
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
    const percentage =
      totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return {
      totalStages,
      completedStages,
      inProgressStages,
      notStartedStages,
      percentage,
    };
  }, [stages]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper calculating individual stage details
  const getStageStatusInfo = (stage: ProjectSdlcStageResponse) => {
    if (!stage.startDate) {
      return {
        statusKey: "NOT_STARTED",
        badgeLabel: "Belum Dimulai",
        badgeColor: "gray",
        icon: FiCircle,
        iconColor: "gray.400",
        durationLabel: "Belum terjadwal",
      };
    }

    if (stage.startDate && !stage.endDate) {
      const start = new Date(stage.startDate);
      const today = new Date();
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        statusKey: "IN_PROGRESS",
        badgeLabel: "Sedang Berjalan",
        badgeColor: "blue",
        icon: FiClock,
        iconColor: "blue.500",
        durationLabel: `Berjalan ${diffDays} hari`,
      };
    }

    // Both start & end date exist
    if (stage.startDate && stage.endDate) {
      const start = new Date(stage.startDate);
      const end = new Date(stage.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        statusKey: "COMPLETED",
        badgeLabel: "Selesai",
        badgeColor: "green",
        icon: FiCheckCircle,
        iconColor: "green.500",
        durationLabel: `${diffDays} hari kerja`,
      };
    }

    return {
      statusKey: "NOT_STARTED",
      badgeLabel: "Belum Dimulai",
      badgeColor: "gray",
      icon: FiCircle,
      iconColor: "gray.400",
      durationLabel: "Belum terjadwal",
    };
  };

  if (!hasSdlcSetup) {
    return (
      <TabPanel px={0} py={4}>
        <VStack spacing={6} align="stretch">
          <Card
            shadow="sm"
            rounded={radiusStyle}
            border="1px dashed"
            borderColor={colorMode === "light" ? "orange.300" : "orange.700"}
            bg={colorMode === "light" ? "orange.50" : "gray.850"}
          >
            <CardBody>
              <VStack spacing={5} align="center" py={10}>
                <Box
                  p={4}
                  rounded="full"
                  bg={colorMode === "light" ? "orange.100" : "orange.900"}
                >
                  <Icon
                    as={FiAlertCircle}
                    boxSize={10}
                    color={colorMode === "light" ? "orange.500" : "orange.300"}
                  />
                </Box>

                <VStack spacing={2} textAlign="center">
                  <Heading size="md" color={colorMode === "light" ? "orange.800" : "orange.200"}>
                    SDLC Methodology Belum Dikonfigurasi
                  </Heading>
                  <Text
                    color={colorMode === "light" ? "gray.600" : "gray.400"}
                    maxW="500px"
                    fontSize="sm"
                  >
                    Setup alur metodologi SDLC untuk melacak tahapan progres proyek, jadwal milestone, dan otomatisasi status pengerjaan.
                  </Text>
                </VStack>

                {canMake && (
                  <Button
                    leftIcon={<FiSettings />}
                    colorScheme="orange"
                    size="md"
                    rounded={radiusStyle}
                    onClick={() => setIsSetupModalOpen(true)}
                  >
                    Setup Metodologi SDLC
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
    <TabPanel px={0} py={4}>
      <VStack spacing={5} align="stretch">
        {/* Full-Width Overall Progress Card */}
        <Card
          variant="outline"
          rounded={radiusStyle}
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <CardBody py={4} px={5}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <HStack spacing={3}>
                  <Box
                    p={2.5}
                    bg={colorMode === "light" ? "green.50" : "green.900"}
                    color="green.500"
                    rounded={radiusStyle}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiActivity} boxSize={5} />
                  </Box>
                  <Box>
                    <Heading size="sm">SDLC Progression Overview</Heading>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {stageProgression.completedStages} dari {stageProgression.totalStages} tahapan telah selesai
                    </Text>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <HStack spacing={1.5} fontSize="xs">
                    <Box w={2.5} h={2.5} rounded="full" bg="green.500" />
                    <Text color="gray.500">Selesai: <b>{stageProgression.completedStages}</b></Text>
                  </HStack>
                  <HStack spacing={1.5} fontSize="xs">
                    <Box w={2.5} h={2.5} rounded="full" bg="blue.500" />
                    <Text color="gray.500">Berjalan: <b>{stageProgression.inProgressStages}</b></Text>
                  </HStack>
                  <HStack spacing={1.5} fontSize="xs">
                    <Box w={2.5} h={2.5} rounded="full" bg="gray.400" />
                    <Text color="gray.500">Belum: <b>{stageProgression.notStartedStages}</b></Text>
                  </HStack>
                  <Badge colorScheme="green" fontSize="sm" px={3} py={1} rounded="full">
                    {stageProgression.percentage}%
                  </Badge>
                </HStack>
              </HStack>

              <Progress
                value={stageProgression.percentage}
                size="md"
                colorScheme="green"
                rounded="full"
              />
            </VStack>
          </CardBody>
        </Card>

        {/* 2-Column Info Cards for Flow & Current Stage */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card
            variant="outline"
            rounded={radiusStyle}
            bg={colorMode === "light" ? "white" : "gray.800"}
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <CardBody py={3.5} px={4}>
              <HStack spacing={3} align="center">
                <Box
                  p={2.5}
                  bg={colorMode === "light" ? "blue.50" : "blue.900"}
                  color="blue.500"
                  rounded={radiusStyle}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiGitBranch} boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                    SDLC Flow Pattern
                  </Text>
                  <Heading size="sm" noOfLines={1}>
                    {DataProject?.sdlcName || "Standard Flow"}
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Total {stages.length} Tahapan Terkonfigurasi
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            variant="outline"
            rounded={radiusStyle}
            bg={colorMode === "light" ? "white" : "gray.800"}
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <CardBody py={3.5} px={4}>
              <HStack spacing={3} align="center">
                <Box
                  p={2.5}
                  bg={colorMode === "light" ? "purple.50" : "purple.900"}
                  color="purple.500"
                  rounded={radiusStyle}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiClock} boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                    Tahapan Aktif Saat Ini
                  </Text>
                  <Heading size="sm" color="purple.500" noOfLines={1}>
                    {DataProject?.sdlcStageName || "Belum Ditentukan"}
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {stageProgression.inProgressStages} tahapan sedang berjalan
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Stage Timeline List */}
        <Card
          variant="outline"
          rounded={radiusStyle}
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <CardBody p={5}>
            <HStack justify="space-between" mb={5} pb={3} borderBottomWidth="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
              <HStack spacing={2}>
                <Icon as={FiCalendar} boxSize={5} color="blue.500" />
                <Heading size="sm">Stage Timeline</Heading>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Pilih <b>Manage Stage</b> untuk memperbarui jadwal & aktivitas catatan.
              </Text>
            </HStack>

            {isLoadingStages ? (
              <HStack justify="center" py={12}>
                <Spinner size="md" color="blue.500" />
                <Text fontSize="sm" color="gray.500">Memuat tahapan SDLC...</Text>
              </HStack>
            ) : stages.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color="gray.500" fontSize="sm">Belum ada tahapan SDLC yang terdaftar.</Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {stages.map((stage, index) => {
                  const statusInfo = getStageStatusInfo(stage);
                  const isCurrentActive =
                    stage.isActive ||
                    stage.stageName === DataProject?.sdlcStageName ||
                    stage.id === DataProject?.sdlcStageId;

                  return (
                    <Card
                      key={stage.id}
                      variant="outline"
                      rounded={radiusStyle}
                      bg={
                        isCurrentActive
                          ? colorMode === "light"
                            ? "blue.50"
                            : "blue.950"
                          : colorMode === "light"
                          ? "white"
                          : "gray.750"
                      }
                      borderColor={
                        isCurrentActive
                          ? "blue.400"
                          : colorMode === "light"
                          ? "gray.200"
                          : "gray.700"
                      }
                      borderWidth={isCurrentActive ? "1.5px" : "1px"}
                      shadow={isCurrentActive ? "xs" : "none"}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: "blue.400",
                        shadow: "xs",
                      }}
                    >
                      <CardBody py={3.5} px={4}>
                        <HStack justify="space-between" align="center" spacing={4}>
                          {/* Left: Step indicator & Stage Info */}
                          <HStack spacing={3.5} flex={1} align="center">
                            {/* Circle Panel with Centered Icon */}
                            <Box
                              w="40px"
                              h="40px"
                              minW="40px"
                              minH="40px"
                              rounded="full"
                              bg={
                                statusInfo.statusKey === "COMPLETED"
                                  ? "green.100"
                                  : statusInfo.statusKey === "IN_PROGRESS"
                                  ? "blue.100"
                                  : "gray.100"
                              }
                              _dark={{
                                bg:
                                  statusInfo.statusKey === "COMPLETED"
                                    ? "green.900"
                                    : statusInfo.statusKey === "IN_PROGRESS"
                                    ? "blue.900"
                                    : "gray.700",
                              }}
                              color={statusInfo.iconColor}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Icon as={statusInfo.icon} boxSize={5} />
                            </Box>

                            <VStack align="start" spacing={1} flex={1}>
                              <HStack spacing={2} flexWrap="wrap" align="center">
                                <Text fontWeight="bold" fontSize="sm">
                                  {stage.stageName}
                                </Text>
                                <Badge colorScheme={statusInfo.badgeColor} fontSize="2xs" rounded="sm">
                                  {statusInfo.badgeLabel}
                                </Badge>
                                {isCurrentActive && (
                                  <Badge colorScheme="purple" variant="solid" fontSize="2xs" rounded="sm">
                                    CURRENT STAGE
                                  </Badge>
                                )}
                                {stage.stageTriggerStatus === "Y" && (
                                  <Tooltip
                                    label={`Memicu update status ke: ${stage.stageStatusAfterTriggerChange || "Status Berikutnya"}`}
                                    hasArrow
                                  >
                                    <Badge
                                      colorScheme="yellow"
                                      fontSize="2xs"
                                      rounded="sm"
                                      display="flex"
                                      alignItems="center"
                                      gap={0.5}
                                    >
                                      <Icon as={FiZap} boxSize={2.5} /> Trigger Auto
                                    </Badge>
                                  </Tooltip>
                                )}
                              </HStack>

                              {/* Date and Duration Pills */}
                              <HStack spacing={3} fontSize="xs" color="gray.500" flexWrap="wrap" align="center">
                                <HStack spacing={1}>
                                  <Icon as={FiCalendar} boxSize={3.5} />
                                  <Text>
                                    {formatDate(stage.startDate)} ➔ {formatDate(stage.endDate)}
                                  </Text>
                                </HStack>
                                <Text>•</Text>
                                <HStack spacing={1}>
                                  <Icon as={FiClock} boxSize={3.5} />
                                  <Text fontWeight="medium">{statusInfo.durationLabel}</Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </HStack>

                          {/* Right Action Button */}
                          {canMake && (
                            <Button
                              size="sm"
                              variant={isCurrentActive ? "solid" : "outline"}
                              colorScheme={isCurrentActive ? "blue" : "gray"}
                              leftIcon={<FiCalendar />}
                              onClick={() => openUpdateDatesModal(stage)}
                              rounded={radiusStyle}
                              fontSize="xs"
                              flexShrink={0}
                            >
                              Manage Stage
                            </Button>
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
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
