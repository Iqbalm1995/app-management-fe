"use client";

import {
  ProjectDataResponse,
  AppsResponse,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Divider,
  Box,
  Flex,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FiInfo,
  FiLayers,
  FiCpu,
  FiPlayCircle,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useState, useRef } from "react";
import {
  radiusStyle,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import {
  TabButtonCustomStyle,
  TabButtonCustomStyleHighLight,
} from "@/app/components/TabsCustom";
import { ProjectPreviewHeader } from "./ProjectPreviewHeader";
import { ProjectRequirementCard } from "./ProjectRequirementCard";
import { BacklogsSection } from "./BacklogsSection";
import { GovernanceMatrixSection } from "./GovernanceMatrixSection";
import { UserAssignmentsSection } from "./OrganizationSections";
import { WorkStagesSection } from "./WorkStagesSection";
import { ProcurementStagesSection } from "./ProcurementStagesSection";
import { WorkProgramsSection } from "./WorkProgramsSection";
import { StatusHistorySection } from "./StatusHistorySection";
import { ProjectPreviewSidebar } from "./ProjectPreviewSidebar";

interface ProjectInfoPreviewProps {
  DataProject: ProjectDataResponse | null;
  DataApps?: AppsResponse | null;
  statusHistory?: any[];
  workflowBacklogs?: any[];
  backlogStats?: any;
  backlogList?: BacklogDataResponse[];
  projectMembers?: ProjectUserAssignmentResponse[];
  canApprove?: boolean;
  approvalMode?: boolean;
  onApprove?: (
    isApproved: boolean,
    note?: string,
    action?: string
  ) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const ProjectInfoPreview = ({
  DataProject,
  DataApps,
  statusHistory = [],
  workflowBacklogs = [],
  backlogStats,
  backlogList = [],
  projectMembers = [],
  canApprove = false,
  approvalMode = false,
  onApprove,
  onRefresh,
  isLoading = false,
}: ProjectInfoPreviewProps) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [approvalAction, setApprovalAction] = useState<string | null>(null);

  // Tab scroll reference & controls matching /projects/manage
  const tabsRef = useRef<HTMLDivElement>(null);
  const isProcurement = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT;

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 260;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleApprovalClick = (isApproved: boolean) => {
    setApprovalAction(isApproved ? "APPROVE" : "DECLINE");
    onOpen();
  };

  const handleConfirmApproval = async () => {
    if (approvalAction === null || !onApprove) return;
    setIsApproving(true);
    const isApproved = approvalAction === "APPROVE";
    await onApprove(isApproved, approvalNote, approvalAction);
    setIsApproving(false);
    setApprovalNote("");
    onClose();
  };

  if (!DataProject) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500">Project data not found</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* 1. Hero Section matching /projects/manage (No Premature Progress Bar) */}
      <ProjectPreviewHeader
        DataProject={DataProject}
        DataApps={DataApps}
        projectId={DataProject.id}
        IsLoadingProcess={isLoading}
        onRefresh={onRefresh}
        approvalMode={approvalMode}
        projectMembers={projectMembers}
      />

      {/* 2. 12-Column Grid Layout */}
      <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
        {/* Left Column: Proposal Evaluation Tabs (9 Columns on Desktop) */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w="full">
          <Tabs
            index={selectedTabIndex}
            onChange={(idx) => setSelectedTabIndex(idx)}
            variant="unstyled"
            colorScheme="secondary"
            size="lg"
          >
            {/* Tab Navigation Ribbon matching /projects/manage */}
            <Box mb={4}>
              <TabList
                ref={tabsRef}
                gap={2}
                p={2}
                overflowX="auto"
                justifyContent="start"
                sx={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {/* 1. Details */}
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiInfo size={16} />
                    <Text>Details</Text>
                  </HStack>
                </TabButtonCustomStyle>

                {/* 2. Project Scope (Backlogs) */}
                <TabButtonCustomStyleHighLight>
                  <HStack spacing={2}>
                    <FiLayers size={16} />
                    <Text>Project Scope</Text>
                  </HStack>
                </TabButtonCustomStyleHighLight>

                {/* 3. Procurements (for PROCUREMENT projects matching /projects/manage) */}
                {isProcurement && (
                  <TabButtonCustomStyleHighLight>
                    <HStack spacing={2}>
                      <FiPlayCircle size={16} />
                      <Text>Procurements</Text>
                    </HStack>
                  </TabButtonCustomStyleHighLight>
                )}

                {/* 4. Team */}
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiUsers size={16} />
                    <Text>Team</Text>
                  </HStack>
                </TabButtonCustomStyle>

                {/* 5. Work Programs */}
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiBriefcase size={16} />
                    <Text>Work Programs</Text>
                  </HStack>
                </TabButtonCustomStyle>

                {/* 6. Timeline */}
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiCalendar size={16} />
                    <Text>Timeline</Text>
                  </HStack>
                </TabButtonCustomStyle>
              </TabList>

              {/* Scroll buttons matching /projects/manage */}
              <Flex justify="flex-end" mt={1}>
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("left")}
                    bg={
                      colorMode === "light"
                        ? "secondary.500"
                        : "secondary.700"
                    }
                    shadow="md"
                    _hover={{
                      bg:
                        colorMode === "light"
                          ? "secondary.400"
                          : "secondary.600",
                    }}
                    color="white"
                  >
                    <FiChevronLeft />
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("right")}
                    bg={
                      colorMode === "light"
                        ? "secondary.500"
                        : "secondary.700"
                    }
                    shadow="md"
                    _hover={{
                      bg:
                        colorMode === "light"
                          ? "secondary.400"
                          : "secondary.600",
                    }}
                    color="white"
                  >
                    <FiChevronRight />
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* Elevated Main Card Wrapper matching /projects/manage (minH="600px") */}
            <Card
              shadow="xl"
              rounded={radiusStyle}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              overflow="hidden"
              _hover={{
                shadow: "2xl",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s ease"
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <TabPanels minH="600px">
                  {/* TAB 1: Details */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      <ProjectRequirementCard DataProject={DataProject} />
                      <GovernanceMatrixSection DataProject={DataProject} />
                    </VStack>
                  </TabPanel>

                  {/* TAB 2: Project Scope (Backlogs) */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      {backlogList && backlogList.length > 0 ? (
                        <BacklogsSection
                          backlogList={backlogList}
                          backlogStats={backlogStats}
                          requirementType={
                            DataProject.requirementData?.requirementType
                          }
                        />
                      ) : (
                        <Box textAlign="center" py={12}>
                          <Text color="gray.500">
                            No scope backlog items defined for this project
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB 3: Procurements (if isProcurement matching /projects/manage) */}
                  {isProcurement && (
                    <TabPanel p={0}>
                      <VStack spacing={6} align="stretch">
                        <ProcurementStagesSection DataProject={DataProject} />
                      </VStack>
                    </TabPanel>
                  )}

                  {/* TAB: Team */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      {projectMembers && projectMembers.length > 0 && (
                        <UserAssignmentsSection
                          projectMembers={projectMembers}
                        />
                      )}
                      <WorkStagesSection DataProject={DataProject} />
                      {!isProcurement && (
                        <ProcurementStagesSection DataProject={DataProject} />
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB: Work Programs */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      <WorkProgramsSection DataProject={DataProject} />
                    </VStack>
                  </TabPanel>

                  {/* TAB: Timeline */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      {statusHistory && statusHistory.length > 0 ? (
                        <StatusHistorySection statusHistory={statusHistory} />
                      ) : (
                        <Box textAlign="center" py={12}>
                          <Text color="gray.500">
                            No timeline history recorded yet
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </CardBody>
            </Card>
          </Tabs>
        </GridItem>

        {/* Right Column: Actions & Summary Sidebar (3 Columns on Desktop) */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w="full">
          <ProjectPreviewSidebar
            DataProject={DataProject}
            DataApps={DataApps}
            canApprove={canApprove}
            approvalMode={approvalMode}
            onApproveClick={() => handleApprovalClick(true)}
            onDeclineClick={() => handleApprovalClick(false)}
            backlogCount={backlogList.length}
            teamMemberCount={projectMembers.length}
            statusHistory={statusHistory}
          />
        </GridItem>
      </Grid>

      {/* Modal Confirmation for Approval / Decline */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            {approvalAction === "APPROVE"
              ? "Confirm Project Approval"
              : "Decline / Request Revision"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box
                p={4}
                rounded="md"
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
              >
                <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={2}>
                  PROJECT INFORMATION
                </Text>
                <VStack align="stretch" spacing={2} fontSize="sm">
                  <HStack justify="space-between">
                    <Text color="gray.500">Project Name:</Text>
                    <Text fontWeight="semibold" textAlign="right" noOfLines={1}>
                      {DataProject.projectName}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Project Type:</Text>
                    <Badge colorScheme="purple">{DataProject.projectType}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Current Stage:</Text>
                    <Badge colorScheme="orange">
                      {DataProject.approvalStatus || DataProject.projectStatus}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              <Divider />

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">
                  Evaluation Note / Reason{" "}
                  {approvalAction !== "APPROVE" ? "(Required)" : "(Optional)"}
                </FormLabel>
                <Textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={
                    approvalAction === "APPROVE"
                      ? "Add approval note if any..."
                      : "Please describe items that need correction or revision by applicant..."
                  }
                  rows={4}
                  rounded="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              colorScheme={approvalAction === "APPROVE" ? "green" : "red"}
              onClick={handleConfirmApproval}
              isLoading={isApproving}
              leftIcon={
                approvalAction === "APPROVE" ? (
                  <FiCheckCircle />
                ) : (
                  <FiXCircle />
                )
              }
            >
              {approvalAction === "APPROVE"
                ? "Confirm Approval"
                : "Confirm Decline"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProjectInfoPreview;
