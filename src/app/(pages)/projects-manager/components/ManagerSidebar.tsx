"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Stack,
  Text,
  useColorMode,
  VStack,
  Heading,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
  Flex,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  FiSearch,
  FiFilter,
  FiTarget,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiSettings,
  FiAward,
  FiBriefcase,
  FiZap,
} from "react-icons/fi";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { PROJECT_STATUS_LIST } from "@/app/constants/applicationConstants";

interface ManagerSidebarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  DataProjects: ProjectDataResponse[];
  colorMode: "light" | "dark";
}

const ManagerSidebar = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  DataProjects,
  colorMode,
}: ManagerSidebarProps) => {
  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "COMPLETED":
        return "blue";
      case "ONHOLD":
        return "orange";
      case "INACTIVE":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return FiZap;
      case "COMPLETED":
        return FiCheckCircle;
      case "ONHOLD":
        return FiClock;
      case "INACTIVE":
        return FiAlertCircle;
      default:
        return FiTarget;
    }
  };

  // Calculate project statistics
  const totalProjects = DataProjects.length;
  const activeProjects = DataProjects.filter(
    (p) => p.projectStatus === "ACTIVE"
  ).length;
  const completedProjects = DataProjects.filter(
    (p) => p.projectStatus === "COMPLETED"
  ).length;
  const onHoldProjects = DataProjects.filter(
    (p) => p.projectStatus === "ONHOLD"
  ).length;
  const avgProgress =
    totalProjects > 0
      ? Math.round(
          DataProjects.reduce((acc, p) => acc + p.projectStatusPercentage, 0) /
            totalProjects
        )
      : 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Manager Dashboard Card */}
      <Card
        rounded="2xl"
        shadow="xl"
        border="1px"
        borderColor={colorMode === "light" ? "secondary.500" : "secondary.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        overflow="hidden"
      >
        <Box
          bgGradient={"linear(to-br, secondary.700, secondary.400)"}
          p={4}
          color="white"
        >
          <HStack spacing={3} align="center">
            <Box
              w={12}
              h={12}
              bg="whiteAlpha.200"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
            >
              <Icon as={FiBriefcase} boxSize={6} />
            </Box>
            <VStack align="start" spacing={1}>
              <Heading size="md" fontWeight="bold">
                Manager Dashboard
              </Heading>
              <Text fontSize="sm" opacity={0.9}>
                Project Overview & Control
              </Text>
            </VStack>
          </HStack>
        </Box>

        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Key Metrics */}
            <SimpleGrid columns={2} spacing={3}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {totalProjects}
                </Text>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Projects
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {activeProjects}
                </Text>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Active Now
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Progress Overview */}
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Overall Progress
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {avgProgress}%
                </Text>
              </HStack>
              <Progress
                value={avgProgress}
                colorScheme="blue"
                size="lg"
                rounded="full"
                w="full"
                bg="gray.100"
              />
            </VStack>

            {/* Quick Actions */}
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                Quick Actions
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="ghost"
                leftIcon={<Icon as={FiActivity} />}
                justifyContent="flex-start"
              >
                View Analytics
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                variant="ghost"
                leftIcon={<Icon as={FiUsers} />}
                justifyContent="flex-start"
              >
                Team Performance
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                variant="ghost"
                leftIcon={<Icon as={FiAward} />}
                justifyContent="flex-start"
              >
                Project Reports
              </Button>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Enhanced Search Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center">
              <Box
                w={10}
                h={10}
                bg="blue.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiSearch} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                  Project Search
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Find projects quickly
                </Text>
              </VStack>
            </HStack>

            <InputGroup>
              <InputLeftElement pointerEvents="none" h="full">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by name, code, or description..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                border="1px"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                rounded="xl"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px blue.500",
                }}
              />
            </InputGroup>
          </VStack>
        </CardBody>
      </Card>

      {/* Enhanced Status Filters Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center">
              <Box
                w={10}
                h={10}
                bg="purple.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiFilter} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                  Status Filters
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Filter by project status
                </Text>
              </VStack>
            </HStack>

            <Flex
              as={Stack}
              spacing={3}
              w={"full"}
              h={"20vh"}
              overflowY={"auto"}
            >
              {PROJECT_STATUS_LIST.map((status) => {
                const isSelected = statusFilter.includes(status);
                const count = DataProjects.filter(
                  (p) => p.projectStatus === status
                ).length;
                const colorScheme = getStatusColor(status);
                const StatusIcon = getStatusIcon(status);

                return (
                  <Button
                    key={status}
                    variant={isSelected ? "solid" : "ghost"}
                    colorScheme={colorScheme}
                    size="md"
                    justifyContent="space-between"
                    onClick={() => handleStatusToggle(status)}
                    leftIcon={<Icon as={StatusIcon} />}
                    rounded="xl"
                    _hover={{
                      transform: "translateY(-1px)",
                      bgColor: "secondary.100",
                      // shadow: "md",
                    }}
                    py={1}
                    transition="all 0.2s ease"
                  >
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium">{status}</Text>
                      <Badge
                        colorScheme={colorScheme}
                        variant={isSelected ? "solid" : "subtle"}
                        rounded="full"
                        px={2}
                      >
                        {count}
                      </Badge>
                    </HStack>
                  </Button>
                );
              })}
            </Flex>

            {statusFilter.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={() => setStatusFilter([])}
                rounded="xl"
              >
                Clear Filters
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Project Performance Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center">
              <Box
                w={10}
                h={10}
                bg="green.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiPieChart} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                  Performance Metrics
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Project health overview
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={4}>
              {/* Completion Rate */}
              <Box textAlign="center" w="full">
                <CircularProgress
                  value={
                    totalProjects > 0
                      ? (completedProjects / totalProjects) * 100
                      : 0
                  }
                  size="80px"
                  color="green.500"
                  thickness="8px"
                >
                  <CircularProgressLabel fontSize="sm" fontWeight="bold">
                    {totalProjects > 0
                      ? Math.round((completedProjects / totalProjects) * 100)
                      : 0}
                    %
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs" color="gray.600" mt={2} fontWeight="medium">
                  Completion Rate
                </Text>
              </Box>

              {/* Status Breakdown */}
              <VStack spacing={2} w="full">
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={3} h={3} bg="green.500" rounded="full" />
                    <Text fontSize="xs" color="gray.600">
                      Active
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold" color="green.600">
                    {activeProjects}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={3} h={3} bg="blue.500" rounded="full" />
                    <Text fontSize="xs" color="gray.600">
                      Completed
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold" color="blue.600">
                    {completedProjects}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={3} h={3} bg="orange.500" rounded="full" />
                    <Text fontSize="xs" color="gray.600">
                      On Hold
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold" color="orange.600">
                    {onHoldProjects}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Manager Tools Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center">
              <Box
                w={10}
                h={10}
                bg="orange.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiSettings} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                  Manager Tools
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Management utilities
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={2} align="stretch">
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<Icon as={FiCalendar} />}
                justifyContent="flex-start"
                rounded="xl"
              >
                Schedule Review
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                leftIcon={<Icon as={FiBarChart2} />}
                justifyContent="flex-start"
                rounded="xl"
              >
                Generate Report
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                leftIcon={<Icon as={FiTrendingUp} />}
                justifyContent="flex-start"
                rounded="xl"
              >
                Performance Analysis
              </Button>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ManagerSidebar;
