"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
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
} from "@chakra-ui/react";
import { FiInfo, FiCalendar, FiUsers, FiTarget, FiArrowLeft, FiLayers, FiCheck, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface ProjectInfoPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const ProjectInfoPreview = ({ DataProject }: ProjectInfoPreviewProps) => {
  const { colorMode } = useColorMode();
  const router = useRouter();

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

      {/* Preview Mode Alert */}
      <Alert
        status="info"
        variant="left-accent"
        rounded="lg"
        bg={colorMode === "light" ? "blue.50" : "blue.900"}
        borderColor="blue.500"
      >
        <AlertIcon color="blue.500" />
        <Box flex="1">
          <AlertTitle fontSize="sm" color={colorMode === "light" ? "blue.800" : "blue.200"}>
            Preview Mode
          </AlertTitle>
          <AlertDescription fontSize="xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>
            You are viewing this project in preview mode. Review the details and use the approval button to proceed.
          </AlertDescription>
        </Box>
        <Button
          leftIcon={<FiArrowRight />}
          colorScheme="blue"
          size="sm"
          onClick={() => router.push("/projects/approval")}
        >
          Approve Now
        </Button>
      </Alert>

      {/* Info Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* Project Details */}
        <Card
          shadow="sm"
          rounded="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          transition="all 0.3s"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        >
          <CardBody p={6}>
            <HStack spacing={3} mb={4}>
              <Box
                w={10}
                h={10}
                color="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiInfo size={24} />
              </Box>
              <Heading size="sm" color={colorMode === "light" ? "gray.700" : "white"}>
                Project Details
              </Heading>
            </HStack>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Project Number
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {DataProject.projectNo || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Project Code
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {DataProject.projectCode || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Category
                </Text>
                <Badge colorScheme="purple" fontSize="xs">
                  {DataProject.projectCategory || "N/A"}
                </Badge>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Status & Progress */}
        <Card
          shadow="sm"
          rounded="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          transition="all 0.3s"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        >
          <CardBody p={6}>
            <HStack spacing={3} mb={4}>
              <Box
                w={10}
                h={10}
                color="green.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiTarget size={24} />
              </Box>
              <Heading size="sm" color={colorMode === "light" ? "gray.700" : "white"}>
                Status & Progress
              </Heading>
            </HStack>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Status
                </Text>
                <Badge
                  colorScheme={
                    DataProject.projectStatus === "RUNNING"
                      ? "green"
                      : DataProject.projectStatus === "COMPLETED"
                        ? "blue"
                        : "orange"
                  }
                  fontSize="md"
                  px={4}
                  py={2}
                  rounded="lg"
                >
                  {DataProject.projectStatus || "N/A"}
                </Badge>
              </Box>
              <Divider />
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="xs" color="gray.500">
                    Progress
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="green.500">
                    {DataProject.projectStatusPercentage || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={DataProject.projectStatusPercentage || 0}
                  colorScheme="green"
                  size="lg"
                  rounded="full"
                  hasStripe
                  isAnimated
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Organization */}
        <Card
          shadow="sm"
          rounded="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          transition="all 0.3s"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        >
          <CardBody p={6}>
            <HStack spacing={3} mb={4}>
              <Box
                w={10}
                h={10}
                color="purple.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiUsers size={24} />
              </Box>
              <Heading size="sm" color={colorMode === "light" ? "gray.700" : "white"}>
                Project Managed By
              </Heading>
            </HStack>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Directorate
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {DataProject.proOwnerDirectorateName || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Division
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {DataProject.proOwnerDivisionName || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Group
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {DataProject.proOwnerGroupName || "N/A"}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Characteristics Section */}
      <Card
        shadow="sm"
        rounded="xl"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <CardBody p={6}>
          <HStack spacing={3} mb={4}>
            <Box
              w={10}
              h={10}
              color="orange.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLayers size={24} />
            </Box>
            <Heading size="sm" color={colorMode === "light" ? "gray.700" : "white"}>
              Project Overview
            </Heading>
          </HStack>

          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Characteristic</Tab>
              <Tab>Scope of Work</Tab>
              <Tab>Requirements</Tab>
            </TabList>

            <TabPanels>
              {/* Characteristic Tab */}
              <TabPanel px={0} py={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Characteristic
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {DataProject.projectCharasteristicName || "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Sub-Characteristic
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {DataProject.projectSubCharasteristicName || "N/A"}
                    </Text>
                  </Box>
                  {DataProject.projectSubCharasteristicDesc && (
                    <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Description
                      </Text>
                      <Text fontSize="sm">
                        {DataProject.projectSubCharasteristicDesc}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* <Button
                  leftIcon={<FiArrowRight />}
                  colorScheme="green"
                  size="md"
                  mt={6}
                  w="full"
                  onClick={() => router.push("/projects/approval")}
                >
                  Go To Approval Page
                </Button> */}
              </TabPanel>

              {/* Scope of Work Tab */}
              <TabPanel px={0} py={4}>
                {DataProject.workPrograms && DataProject.workPrograms.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {DataProject.workPrograms.map((wp, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        rounded="lg"
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <HStack justify="space-between" mb={2}>
                          <Badge colorScheme="blue" fontSize="xs">
                            Work Program {index + 1}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" fontWeight="semibold" mb={1}>
                          {wp.workProgramName || "N/A"}
                        </Text>
                        {wp.workProgramDesc && (
                          <Text fontSize="xs" color="gray.500">
                            {wp.workProgramDesc}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    No scope of work data available
                  </Text>
                )}

                {/* <Button
                  leftIcon={<FiArrowRight />}
                  colorScheme="green"
                  size="md"
                  mt={6}
                  w="full"
                  onClick={() => router.push("/projects/approval")}
                >
                  Go To Approval Page
                </Button> */}
              </TabPanel>

              {/* Requirements Tab */}
              <TabPanel px={0} py={4}>
                {DataProject.requirementData ? (
                  <Box
                    p={4}
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    rounded="lg"
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Requirement Type
                        </Text>
                        <Badge colorScheme="purple" fontSize="xs">
                          {DataProject.requirementData.requirementType}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Requirement Number
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {DataProject.requirementData.reqNumber}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Status
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">
                          {DataProject.requirementData.reqStatus || "N/A"}
                        </Badge>
                      </Box>
                    </SimpleGrid>
                  </Box>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    No requirements data available
                  </Text>
                )}

                {/* <Button
                  leftIcon={<FiArrowRight />}
                  colorScheme="green"
                  size="md"
                  mt={6}
                  w="full"
                  onClick={() => router.push("/projects/approval")}
                >
                  Go To Approval Page
                </Button> */}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProjectInfoPreview;
