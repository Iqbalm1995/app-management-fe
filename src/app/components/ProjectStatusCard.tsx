"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Spinner,
  useColorModeValue,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";
import useWorkspace, { ProjectStatusViewModel } from "../services/useWorkspace";
import { radiusStyle } from "../constants/applicationConstants";

interface ProjectStatusCardProps {
  tokenData: string;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({ tokenData }) => {
  const [projectStatus, setProjectStatus] =
    useState<ProjectStatusViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { GetProjectStatus } = useWorkspace();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");

  useEffect(() => {
    const fetchProjectStatus = async () => {
      if (tokenData) {
        setIsLoading(true);
        try {
          const result = await GetProjectStatus(tokenData);
          if (result?.statusCode === 200) {
            setProjectStatus(result.data);
          }
        } catch (error) {
          console.error("Error fetching project status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (tokenData) {
      fetchProjectStatus();
    }
  }, [tokenData]);

  if (isLoading) {
    return (
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderRadius={radiusStyle}
        shadow="sm"
        transition="all 0.2s"
      >
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text fontSize="sm" color={textColor}>
              Loading project status...
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (!projectStatus) {
    return (
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderRadius={radiusStyle}
        shadow="sm"
        transition="all 0.2s"
      >
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Text fontSize="sm" color={textColor}>
              No project data available
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderRadius={radiusStyle}
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
      overflow="hidden"
    >
      <CardBody p={0}>
        {/* Header with gradient */}
        <Box
          // bgGradient="linear(to-br, secondary.400, secondary.800)"
          // color="white"
          p={4}
          position="relative"
        >
          <HStack justify="space-between" mb={3}>
            <VStack align="start" spacing={0}>
              <Heading size="sm" color={"secondary.500"}>
                Project Status
              </Heading>
              <Text fontSize="xs" opacity={0.9}>
                {projectStatus.activeProjects} active /{" "}
                {projectStatus.closedProjects} closed
              </Text>
            </VStack>
            <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
              <Icon color={"secondary.500"} as={FiFolder} boxSize={5} />
            </Box>
          </HStack>

          {/* Project Status Overview */}
          <HStack spacing={4} align="center">
            <Box position="relative" w="60px" h="60px">
              <Progress
                value={projectStatus.activePercentage}
                size="lg"
                colorScheme="purple"
                bg="blackAlpha.300"
                borderRadius="full"
                sx={{
                  "& > div": {
                    background: "linear-gradient(90deg, #0077fe, #0051ad)",
                  },
                }}
              />
              <Box
                position="absolute"
                top="65%"
                left="50%"
                transform="translate(-50%, -50%)"
                textAlign="center"
              >
                <Text fontSize="lg" fontWeight="bold">
                  {projectStatus.closedPercentage}%
                </Text>
                <Text fontSize="xs" opacity={0.9}>
                  Closed
                </Text>
              </Box>
            </Box>

            <VStack align="start" spacing={2} flex="1">
              <HStack w="full" justify="space-between">
                <Text fontSize="xs" opacity={0.9}>
                  Active
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {projectStatus.activeProjects}
                </Text>
              </HStack>
              <HStack w="full" justify="space-between">
                <Text fontSize="xs" opacity={0.9}>
                  Closed
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {projectStatus.closedProjects}
                </Text>
              </HStack>
              <HStack w="full" justify="space-between">
                <Text fontSize="xs" opacity={0.9}>
                  Total
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {projectStatus.totalProjects}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Project Status Distribution Bar */}
          <Box mt={4}>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="xs" opacity={0.9}>
                Project Distribution
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                {projectStatus.totalProjects} projects
              </Text>
            </HStack>
            <Box
              position="relative"
              h="8px"
              bg="whiteAlpha.300"
              borderRadius="full"
              overflow="hidden"
            >
              <HStack spacing={0} h="full">
                <Box
                  w={`${projectStatus.activePercentage}%`}
                  h="full"
                  bg="secondary.600"
                />
                <Box
                  w={`${projectStatus.closedPercentage}%`}
                  h="full"
                  bg="gray.400"
                />
              </HStack>
            </Box>
            <HStack justify="space-between" mt={2} fontSize="xs">
              <HStack spacing={1}>
                <Box w="8px" h="8px" bg="secondary.600" borderRadius="full" />
                <Text opacity={0.9}>
                  {projectStatus.activePercentage}% Active
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Box w="8px" h="8px" bg="gray.400" borderRadius="full" />
                <Text opacity={0.9}>
                  {projectStatus.closedPercentage}% Closed
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};

export default ProjectStatusCard;
