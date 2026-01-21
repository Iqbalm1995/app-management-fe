"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FiBarChart,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiTarget,
} from "react-icons/fi";

interface AnalyticsTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const AnalyticsTabPreview = ({ DataProject }: AnalyticsTabPreviewProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Project Analytics
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Track project performance and progress metrics
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="blue.50" roundedTop="xl">
              <HStack spacing={3}>
                <Box
                  w={8}
                  h={8}
                  bgGradient="linear(135deg, blue.400, blue.600)"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiTrendingUp size={16} color="white" />
                </Box>
                <Text fontWeight="bold" color="blue.700">
                  Progress
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber color="blue.600">
                  {DataProject?.projectStatusPercentage || 0}%
                </StatNumber>
                <StatLabel>Completion Rate</StatLabel>
                <StatHelpText>
                  <FiTrendingUp />
                  +2.3% from last week
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="green.50" roundedTop="xl">
              <HStack spacing={3}>
                <Box
                  w={8}
                  h={8}
                  bgGradient="linear(135deg, green.400, green.600)"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiActivity size={16} color="white" />
                </Box>
                <Text fontWeight="bold" color="green.700">
                  Team
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber color="green.600">
                  {DataProject?.userAssignment?.length || 0}
                </StatNumber>
                <StatLabel>Active Members</StatLabel>
                <StatHelpText>
                  <FiActivity />
                  All members active
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="orange.50" roundedTop="xl">
              <HStack spacing={3}>
                <Box
                  w={8}
                  h={8}
                  bgGradient="linear(135deg, orange.400, orange.600)"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiClock size={16} color="white" />
                </Box>
                <Text fontWeight="bold" color="orange.700">
                  Time
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber color="orange.600">24h</StatNumber>
                <StatLabel>Time Logged</StatLabel>
                <StatHelpText>
                  <FiClock />
                  This week
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="purple.50" roundedTop="xl">
              <HStack spacing={3}>
                <Box
                  w={8}
                  h={8}
                  bgGradient="linear(135deg, purple.400, purple.600)"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiTarget size={16} color="white" />
                </Box>
                <Text fontWeight="bold" color="purple.700">
                  Goals
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber color="purple.600">3/5</StatNumber>
                <StatLabel>Milestones</StatLabel>
                <StatHelpText>
                  <FiTarget />
                  60% achieved
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="gray.50" roundedTop="xl">
              <HStack spacing={3}>
                <FiBarChart size={20} />
                <Heading size="md">Performance Chart</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <Box
                h="300px"
                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px dashed"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
              >
                <Text color="gray.500">Chart will be implemented here</Text>
              </Box>
            </CardBody>
          </Card>

          <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
            <CardHeader bg="gray.50" roundedTop="xl">
              <HStack spacing={3}>
                <FiTrendingUp size={20} />
                <Heading size="md">Trend Analysis</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <Box
                h="300px"
                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px dashed"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
              >
                <Text color="gray.500">
                  Trend chart will be implemented here
                </Text>
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </TabPanel>
  );
};

export default AnalyticsTabPreview;
