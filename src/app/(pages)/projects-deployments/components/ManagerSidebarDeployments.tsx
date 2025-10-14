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
  FiServer,
  FiCloud,
  FiGitBranch,
  FiFileText,
  FiPackage,
  FiMonitor,
} from "react-icons/fi";
import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  PROJECT_STATUS_LIST,
  radiusStyle,
} from "@/app/constants/applicationConstants";

interface ManagerSidebarDeploymentsProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  DataProjects: ProjectDataResponse[];
  colorMode: "light" | "dark";
}

const ManagerSidebarDeployments = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  DataProjects,
  colorMode,
}: ManagerSidebarDeploymentsProps) => {
  // Deployment-specific calculations
  const totalProjects = DataProjects.length;
  const activeProjects = DataProjects.filter(
    (p) => p.projectStatus === "ACTIVE"
  ).length;
  const completedProjects = DataProjects.filter(
    (p) => p.projectStatus === "COMPLETED"
  ).length;
  const avgProgress = Math.round(
    DataProjects.reduce((acc, p) => acc + p.projectStatusPercentage, 0) /
      (totalProjects || 1)
  );

  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  return (
    <VStack spacing={4} w="full">
      {/* Deployment Overview Card */}
      <Card
        w="full"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
        rounded={radiusStyle}
      >
        <CardBody p={4}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3}>
              <Box
                w="40px"
                h="40px"
                bgGradient="linear(to-br, secondary.600, secondary.500)"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiServer} boxSize={5} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading
                  size="sm"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  Deployment Hub
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Infrastructure Portfolio
                </Text>
              </VStack>
            </HStack>

            <SimpleGrid columns={2} spacing={3}>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {totalProjects}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Total Projects
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                  {activeProjects}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Active
                </Text>
              </VStack>
            </SimpleGrid>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Deployment Progress
                </Text>
                <Text fontSize="sm" color="green.600" fontWeight="bold">
                  {avgProgress}%
                </Text>
              </HStack>
              <Progress
                value={avgProgress}
                colorScheme="green"
                size="sm"
                rounded="full"
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Search & Filters */}
      <Card
        w="full"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
        rounded={radiusStyle}
      >
        <CardBody p={4}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiSearch} boxSize={4} color="gray.500" />
              <Heading
                size="sm"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Search & Filter
              </Heading>
            </HStack>

            <InputGroup size="sm">
              <InputLeftElement>
                <Search2Icon color="gray.400" boxSize={3} />
              </InputLeftElement>
              <Input
                placeholder="Search projects..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                rounded="lg"
                fontSize="sm"
              />
            </InputGroup>

            <Divider />

            <VStack spacing={2} align="stretch">
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
              >
                Project Status
              </Text>
              {PROJECT_STATUS_LIST.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter.includes(status) ? "solid" : "ghost"}
                  colorScheme={statusFilter.includes(status) ? "green" : "gray"}
                  onClick={() => handleStatusToggle(status)}
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiCheckCircle} boxSize={3} />}
                  fontSize="xs"
                  h="32px"
                >
                  {status}
                </Button>
              ))}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Deployment Metrics */}
      <Card
        w="full"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
        rounded={radiusStyle}
      >
        <CardBody p={4}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiBarChart2} boxSize={4} color="gray.500" />
              <Heading
                size="sm"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Deployment Metrics
              </Heading>
            </HStack>

            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiServer} boxSize={3} color="blue.500" />
                  <Text fontSize="sm">In Progress</Text>
                </HStack>
                <Badge
                  colorScheme="blue"
                  fontSize="xs"
                  px={2}
                  py={1}
                  rounded="full"
                >
                  {
                    DataProjects.filter((p) => p.projectStatus === "ACTIVE")
                      .length
                  }
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} boxSize={3} color="green.500" />
                  <Text fontSize="sm">Deployed</Text>
                </HStack>
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={1}
                  rounded="full"
                >
                  {completedProjects}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiClock} boxSize={3} color="orange.500" />
                  <Text fontSize="sm">Pending</Text>
                </HStack>
                <Badge
                  colorScheme="orange"
                  fontSize="xs"
                  px={2}
                  py={1}
                  rounded="full"
                >
                  {
                    DataProjects.filter((p) => p.projectStatus === "ONHOLD")
                      .length
                  }
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiCloud} boxSize={3} color="teal.500" />
                  <Text fontSize="sm">Cloud Services</Text>
                </HStack>
                <Badge
                  colorScheme="teal"
                  fontSize="xs"
                  px={2}
                  py={1}
                  rounded="full"
                >
                  {DataProjects.reduce(
                    (total, project) =>
                      total + (project.userAssignment?.length || 0),
                    0
                  )}
                </Badge>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card
        w="full"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
        rounded={radiusStyle}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiZap} boxSize={4} color="gray.500" />
              <Heading
                size="sm"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Quick Actions
              </Heading>
            </HStack>

            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<Icon as={FiServer} boxSize={3} />}
              fontSize="xs"
              h="32px"
            >
              New Deployment
            </Button>

            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={FiMonitor} boxSize={3} />}
              fontSize="xs"
              h="32px"
            >
              Monitor Status
            </Button>

            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={FiSettings} boxSize={3} />}
              fontSize="xs"
              h="32px"
            >
              Settings
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ManagerSidebarDeployments;
