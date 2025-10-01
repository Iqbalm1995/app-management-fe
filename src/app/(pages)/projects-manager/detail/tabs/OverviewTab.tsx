"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Box,
  Text,
  Button,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiActivity,
  FiBarChart,
  FiTarget,
  FiZap,
  FiFileText,
  FiCpu,
  FiSettings,
} from "react-icons/fi";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import LoadingMiniSignature from "@/app/components/loadingMini";
import dynamic from "next/dynamic";

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

interface OverviewTabProps {
  DataProject: ProjectDataResponse | null;
}

const OverviewTab = ({ DataProject }: OverviewTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Project Overview
          </Heading>
          <Badge colorScheme="blue" px={4} py={2} rounded="full" fontSize="md">
            Dashboard
          </Badge>
        </HStack>

        {DataProject ? (
          <>
            {/* Enhanced Quick Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              {/* Progress Card */}
              <Card
                bg="blue.50"
                textAlign="center"
                shadow="lg"
                rounded="xl"
                border="2px"
                borderColor="blue.200"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody py={6}>
                  <Box
                    w={12}
                    h={12}
                    bgGradient="linear(135deg, blue.400, blue.600)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={3}
                  >
                    <FiTrendingUp size={24} color="white" />
                  </Box>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {DataProject.projectStatusPercentage || 0}%
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Progress
                  </Text>
                </CardBody>
              </Card>

              {/* Team Card */}
              <Card
                bg="green.50"
                textAlign="center"
                shadow="lg"
                rounded="xl"
                border="2px"
                borderColor="green.200"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody py={6}>
                  <Box
                    w={12}
                    h={12}
                    bgGradient="linear(135deg, green.400, green.600)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={3}
                  >
                    <FiUsers size={24} color="white" />
                  </Box>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {DataProject.userAssignment?.length || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Team Members
                  </Text>
                </CardBody>
              </Card>

              {/* Duration Card */}
              <Card
                bg="orange.50"
                textAlign="center"
                shadow="lg"
                rounded="xl"
                border="2px"
                borderColor="orange.200"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody py={6}>
                  <Box
                    w={12}
                    h={12}
                    bgGradient="linear(135deg, orange.400, orange.600)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={3}
                  >
                    <FiClock size={24} color="white" />
                  </Box>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                    {DataProject.projectRegisterDate
                      ? calculateDurationInDays(
                          DataProject.projectRegisterDate,
                          new Date().toISOString()
                        )
                      : 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Days Active
                  </Text>
                </CardBody>
              </Card>

              {/* Status Card */}
              <Card
                bg="purple.50"
                textAlign="center"
                shadow="lg"
                rounded="xl"
                border="2px"
                borderColor="purple.200"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody py={6}>
                  <Box
                    w={12}
                    h={12}
                    bgGradient="linear(135deg, purple.400, purple.600)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={3}
                  >
                    <FiActivity size={24} color="white" />
                  </Box>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                    {DataProject.projectStatus === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Status
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Charts Section */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Progress Chart */}
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
                      <FiBarChart size={20} color="white" />
                    </Box>
                    <Heading size="md" color="blue.700">
                      Project Progress
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <Box h="300px">
                    <Chart
                      type="radialBar"
                      height="100%"
                      options={{
                        chart: {
                          type: "radialBar",
                          toolbar: { show: false },
                        },
                        plotOptions: {
                          radialBar: {
                            startAngle: -90,
                            endAngle: 90,
                            hollow: {
                              margin: 15,
                              size: "70%",
                            },
                            dataLabels: {
                              name: {
                                offsetY: -10,
                                show: true,
                                color: "#888",
                                fontSize: "17px",
                              },
                              value: {
                                offsetY: 16,
                                color: "#111",
                                fontSize: "36px",
                                show: true,
                              },
                            },
                          },
                        },
                        fill: {
                          type: "gradient",
                          gradient: {
                            shade: "light",
                            shadeIntensity: 0.4,
                            inverseColors: false,
                            opacityFrom: 1,
                            opacityTo: 1,
                            stops: [0, 50, 53, 91],
                          },
                        },
                        labels: ["Progress"],
                        colors: ["#3182CE"],
                      }}
                      series={[
                        Number(DataProject?.projectStatusPercentage || 0),
                      ]}
                    />
                  </Box>
                </CardBody>
              </Card>

              {/* Task Distribution Chart (Dummy Data) */}
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
                      <FiTarget size={20} color="white" />
                    </Box>
                    <Heading size="md" color="green.700">
                      Task Distribution
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={6}>
                  <Box h="300px">
                    <Chart
                      type="donut"
                      height="100%"
                      options={{
                        chart: {
                          type: "donut",
                          toolbar: { show: false },
                        },
                        labels: [
                          "Completed",
                          "In Progress",
                          "Pending",
                          "On Hold",
                        ],
                        colors: ["#38A169", "#3182CE", "#ED8936", "#E53E3E"],
                        legend: {
                          position: "bottom",
                          horizontalAlign: "center",
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "65%",
                            },
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: function (val: number) {
                            return Math.round(val) + "%";
                          },
                        },
                        responsive: [
                          {
                            breakpoint: 480,
                            options: {
                              chart: {
                                width: 200,
                              },
                              legend: {
                                position: "bottom",
                              },
                            },
                          },
                        ],
                      }}
                      series={[45, 30, 15, 10]} // Dummy data
                    />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Additional Information Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* Recent Activity Card */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
              >
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
                      <FiActivity size={16} color="white" />
                    </Box>
                    <Heading size="sm" color="orange.700">
                      Recent Activity
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Box w={2} h={2} bg="green.400" rounded="full" />
                      <Text fontSize="sm" color="gray.600">
                        Task completed
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Box w={2} h={2} bg="blue.400" rounded="full" />
                      <Text fontSize="sm" color="gray.600">
                        Team member added
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Box w={2} h={2} bg="orange.400" rounded="full" />
                      <Text fontSize="sm" color="gray.600">
                        Status updated
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Box w={2} h={2} bg="purple.400" rounded="full" />
                      <Text fontSize="sm" color="gray.600">
                        Feature deployed
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Milestones Card */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
              >
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
                    <Heading size="sm" color="purple.700">
                      Milestones
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Planning
                      </Text>
                      <Badge colorScheme="green" size="sm">
                        Done
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Development
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        Active
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Testing
                      </Text>
                      <Badge colorScheme="orange" size="sm">
                        Pending
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Deployment
                      </Text>
                      <Badge colorScheme="gray" size="sm">
                        Waiting
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Actions Card */}
              <Card
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
              >
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
                      <FiZap size={16} color="white" />
                    </Box>
                    <Heading size="sm" color="blue.700">
                      Quick Actions
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody p={4}>
                  <VStack spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiUsers />}
                    >
                      Add Team Member
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiCpu />}
                    >
                      Create Feature
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiBarChart />}
                    >
                      View Reports
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      leftIcon={<FiSettings />}
                    >
                      Project Settings
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Project Description - Enhanced */}
            <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
              <CardHeader bg="gray.50" roundedTop="xl">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(135deg, gray.400, gray.600)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiFileText size={20} color="white" />
                  </Box>
                  <Heading size="md" color="gray.700">
                    Project Description
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody p={6}>
                <Text color="gray.600" lineHeight="tall" fontSize="md">
                  {DataProject.projectDesc ||
                    "No description available for this project. Consider adding a detailed description to help team members understand the project goals and objectives."}
                </Text>
                {DataProject.projectDesc && (
                  <HStack mt={4} spacing={4}>
                    <Badge colorScheme="blue" px={3} py={1} rounded="full">
                      {DataProject.projectCategory}
                    </Badge>
                    <Badge colorScheme="purple" px={3} py={1} rounded="full">
                      {DataProject.projectType}
                    </Badge>
                  </HStack>
                )}
              </CardBody>
            </Card>
          </>
        ) : (
          <Box textAlign="center" py={12}>
            <LoadingMiniSignature />
            <Text mt={4} color="gray.500">
              Loading project overview...
            </Text>
          </Box>
        )}
      </VStack>
    </TabPanel>
  );
};

export default OverviewTab;
