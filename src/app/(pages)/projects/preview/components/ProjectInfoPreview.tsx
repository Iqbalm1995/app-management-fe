"use client";

import { ProjectDataResponse, AppsResponse } from "@/app/services/useProjects";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  Divider,
  SimpleGrid,
  Box,
  useColorMode,
  IconButton,
  Progress,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
import { FiInfo, FiCalendar, FiUsers, FiTarget, FiArrowLeft, FiLayers, FiCheck, FiArrowRight, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { UserAssignmentsSection, OrganizationSection } from "./OrganizationSections";
import { BacklogsSection } from "./BacklogsSection";
import { WorkStagesSection } from "./WorkStagesSection";
import { ProcurementStagesSection } from "./ProcurementStagesSection";
import { WorkProgramsSection } from "./WorkProgramsSection";
import { StatusHistorySection } from "./StatusHistorySection";
import { EnhancedApproverSection } from "./EnhancedApproverSection";
import { ApplicationSection } from "./ApplicationSection";
import { RequirementWorkProgramSection } from "./RequirementWorkProgramSection";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import { ProjectUserAssignmentResponse } from "@/app/services/useProjects";

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
  onApprove?: (isApproved: boolean, note?: string) => Promise<void>;
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
  onApprove 
}: ProjectInfoPreviewProps) => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [approvalAction, setApprovalAction] = useState<boolean | null>(null);

  const handleApprovalClick = (isApproved: boolean) => {
    setApprovalAction(isApproved);
    onOpen();
  };

  const handleConfirmApproval = async () => {
    if (approvalAction === null || !onApprove) return;
    setIsApproving(true);
    await onApprove(approvalAction, approvalNote);
    setIsApproving(false);
    setApprovalNote("");
    onClose();
  };

  // Debug: Check what data is available
  if (!DataProject) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500">No project data available</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Hero Section */}
      <Box
        bgGradient="linear(135deg, secondary.600 0%, blue.500 50%, secondary.400 100%)"
        rounded="2xl"
        p={8}
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgImage="radial-gradient(circle at 20% 50%, white 1px, transparent 1px)"
          bgSize="20px 20px"
        />

        <Box position="relative" zIndex={1}>
          <Box mb={3}>
            <IconButton
              aria-label="Back"
              icon={<FiArrowLeft />}
              onClick={() => router.push("/projects/pending-approve")}
              bg="whiteAlpha.300"
              color="white"
              size="md"
              rounded="lg"
              _hover={{ bg: "whiteAlpha.400" }}
            />
          </Box>
          <Badge
            bg="whiteAlpha.300"
            color="white"
            fontSize="xs"
            px={3}
            py={1}
            rounded="full"
            mb={3}
            display="inline-block"
          >
            {DataProject.projectType || "Project"}
          </Badge>
          <Heading size="xl" mb={2}>
            {DataProject.projectName}
          </Heading>
          <Text fontSize="md" opacity={0.9}>
            {DataProject.projectDesc || "No description available"}
          </Text>
        </Box>
      </Box>

      {/* Enhanced Approver Section */}
      {approvalMode && canApprove && (
        <EnhancedApproverSection
          DataProject={DataProject}
          canApprove={canApprove}
          onApprove={() => handleApprovalClick(true)}
          onDecline={() => handleApprovalClick(false)}
        />
      )}

      {/* General Information Section */}
      <GeneralInfoSection DataProject={DataProject} />

      {/* Requirement & Work Program Section */}
      <RequirementWorkProgramSection DataProject={DataProject} />

      {/* User Assignments Section */}
      <UserAssignmentsSection projectMembers={projectMembers} />

      {/* Organization Sections */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <OrganizationSection 
          DataProject={DataProject} 
          title="Project Initiated By" 
          colorScheme="purple"
          type="initiated"
        />
        <OrganizationSection 
          DataProject={DataProject} 
          title="Project Managed By" 
          colorScheme="orange"
          type="managed"
        />
      </SimpleGrid>

      {/* Application Section */}
      <ApplicationSection DataProject={DataProject} />

      {/* Backlogs Section */}
      {backlogList && backlogList.length > 0 && (
        <BacklogsSection 
          backlogList={backlogList} 
          backlogStats={backlogStats} 
        />
      )}

      {/* Work Programs Section */}
      <WorkProgramsSection DataProject={DataProject} />

      {/* Work Stages Section */}
      <WorkStagesSection DataProject={DataProject} />

      {/* Procurement Stages Section (conditional) */}
      <ProcurementStagesSection DataProject={DataProject} />

      {/* Status History Section */}
      {statusHistory && statusHistory.length > 0 && (
        <StatusHistorySection statusHistory={statusHistory} />
      )}



      {/* Approval Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {approvalAction ? "Approve Project" : "Decline Project"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Project Information</Text>
                <VStack align="stretch" spacing={2} fontSize="sm">
                  {/* <HStack>
                    <Text color="gray.500">Code:</Text>
                    <Text fontWeight="semibold">{DataProject?.projectCode}</Text>
                  </HStack> */}
                  <HStack>
                    <Text color="gray.500">Name:</Text>
                    <Text fontWeight="semibold">{DataProject?.projectName}</Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.500">Type:</Text>
                    <Badge colorScheme="blue">{DataProject?.projectType}</Badge>
                  </HStack>
                  <HStack>
                    <Text color="gray.500">Status:</Text>
                    <Badge colorScheme="orange">{DataProject?.approvalStatus}</Badge>
                  </HStack>
                </VStack>
              </Box>
              <Divider />
              <FormControl>
                <FormLabel>Note (Optional)</FormLabel>
                <Textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={approvalAction ? "Add approval note..." : "Add reason for declining..."}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isApproving}>
              Cancel
            </Button>
            <Button
              colorScheme={approvalAction ? "green" : "red"}
              onClick={handleConfirmApproval}
              isLoading={isApproving}
              leftIcon={approvalAction ? <FiCheckCircle /> : <FiXCircle />}
            >
              {approvalAction ? "Confirm Approval" : "Confirm Decline"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProjectInfoPreview;
