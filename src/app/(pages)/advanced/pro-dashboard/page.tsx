"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  Badge,
  Progress,
  Avatar,
  AvatarGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorMode,
  Icon,
  Button,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { 
  FiTrendingUp, 
  FiUsers, 
  FiFolder, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiPlus,
  FiDownload,
  FiCalendar,
  FiActivity,
  FiTarget,
  FiAward
} from "react-icons/fi";
import { motion } from "framer-motion";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { radiusStyle } from "@/app/constants/applicationConstants";
import dynamic from "next/dynamic";

// Dynamically import charts to prevent SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MotionCard = motion(Card);
const MotionBox = motion(Box);

// Mock data for prototype
const mockData = {
  metrics: {
    totalProjects: 24,
    activeProjects: 18,
    completedTasks: 156,
    pendingApprovals: 7,
    teamMembers: 32,
    upcomingDeadlines: 5
  },
  projectStatus: [
    { name: "Active", value: 18, color: "#10B981" },
    { name: "Completed", value: 12, color: "#3B82F6" },
    { name: "On Hold", value: 3, color: "#F59E0B" },
    { name: "Cancelled", value: 2, color: "#EF4444" }
  ],
  recentActivities: [
    { user: "John Doe", action: "completed task", project: "KOBRA Mobile", time: "2 hours ago" },
    { user: "Jane Smith", action: "approved BRD", project: "API Gateway", time: "4 hours ago" },
    { user: "Mike Johnson", action: "created project", project: "Data Migration", time: "1 day ago" },
    { user: "Sarah Wilson", action: "updated requirements", project: "User Portal", time: "2 days ago" }
  ],
  teamMembers: [
    { name: "John Doe", avatar: "", role: "Developer" },
    { name: "Jane Smith", avatar: "", role: "Manager" },
    { name: "Mike Johnson", avatar: "", role: "Analyst" },
    { name: "Sarah Wilson", avatar: "", role: "Designer" }
  ],
  monthlyProgress: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [
      { name: "Completed Projects", data: [4, 6, 8, 5, 9, 7] },
      { name: "Started Projects", data: [6, 8, 10, 7, 12, 9] },
      { name: "Cancelled Projects", data: [1, 2, 1, 3, 1, 2] }
    ]
  }
};

export default function ProDashboardPage() {
  useDocumentTitle("Pro Dashboard");
  const { colorMode } = useColorMode();
  const [timeStatus, setTimeStatus] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeStatus("Morning Overview");
    else if (hour < 17) setTimeStatus("Afternoon Summary");
    else setTimeStatus("Evening Report");
  }, []);

  const chartOptions = {
    chart: { type: 'donut' as const },
    labels: mockData.projectStatus.map(item => item.name),
    colors: mockData.projectStatus.map(item => item.color),
    legend: { position: 'bottom' as const },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' as const }
      }
    }]
  };

  const chartSeries = mockData.projectStatus.map(item => item.value);

  const barChartOptions = {
    chart: { type: 'bar' as const },
    xaxis: { categories: mockData.monthlyProgress.categories },
    colors: ['#10B981', '#3B82F6', '#EF4444'],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    legend: { position: 'top' as const },
    responsive: [{
      breakpoint: 480,
      options: { chart: { width: 200 } }
    }]
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Pro Dashboard"
        breadCrumb={["Advanced", "Pro Dashboard"]}
      />

      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            bgGradient={
              colorMode === "light"
                ? "linear(135deg, secondary.400, secondary.700, secondary.900)"
                : "linear(135deg, secondary.600, secondary.800, secondary.900)"
            }
            color="white"
            rounded={radiusStyle}
            shadow="2xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-50%"
              right="-20%"
              w="300px"
              h="300px"
              bgGradient="radial(circle, whiteAlpha.200, transparent)"
              rounded="full"
            />
            <CardBody p={8}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={4}>
                  <MotionBox
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Text fontSize="sm" fontWeight="medium" opacity={0.8} textTransform="uppercase" letterSpacing="wide">
                      {timeStatus}
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" mt={1}>
                      Dashboard Analytics
                    </Text>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Text fontSize="lg" opacity={0.9}>
                      Real-time insights and project performance metrics at a glance.
                    </Text>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <HStack spacing={4} mt={2}>
                      <Badge bg="whiteAlpha.200" color="white" px={3} py={1} rounded="full">
                        <Icon as={FiActivity} mr={1} />
                        {mockData.metrics.activeProjects} Active Projects
                      </Badge>
                      <Badge bg="whiteAlpha.200" color="white" px={3} py={1} rounded="full">
                        <Icon as={FiTarget} mr={1} />
                        {mockData.metrics.completedTasks} Tasks Done
                      </Badge>
                    </HStack>
                  </MotionBox>
                </VStack>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<FiPlus />}
                      bg="whiteAlpha.200"
                      color="white"
                      size="lg"
                      rounded="xl"
                      _hover={{ bg: "whiteAlpha.300", transform: "translateY(-2px)" }}
                      _active={{ transform: "translateY(0px)" }}
                      transition="all 0.2s"
                      backdropFilter="blur(10px)"
                    >
                      New Project
                    </Button>
                    <Button
                      leftIcon={<FiDownload />}
                      variant="outline"
                      borderColor="whiteAlpha.300"
                      color="white"
                      size="lg"
                      rounded="xl"
                      _hover={{ bg: "whiteAlpha.200", transform: "translateY(-2px)" }}
                      _active={{ transform: "translateY(0px)" }}
                      transition="all 0.2s"
                    >
                      Export
                    </Button>
                  </HStack>
                </MotionBox>
              </HStack>
            </CardBody>
          </MotionCard>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
            {[
              { label: "Total Projects", value: mockData.metrics.totalProjects, color: "blue", icon: FiFolder, trend: 12 },
              { label: "Active Projects", value: mockData.metrics.activeProjects, color: "green", icon: FiActivity, trend: 8 },
              { label: "Completed Tasks", value: mockData.metrics.completedTasks, color: "purple", icon: FiCheckCircle, trend: 23 },
              { label: "Pending Approvals", value: mockData.metrics.pendingApprovals, color: "orange", icon: FiClock, trend: -5 },
              { label: "Team Members", value: mockData.metrics.teamMembers, color: "teal", icon: FiUsers, trend: 3 },
              { label: "Deadlines", value: mockData.metrics.upcomingDeadlines, color: "red", icon: FiAlertCircle, trend: 0 }
            ].map((metric, index) => (
              <MotionCard
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, shadow: "xl" }}
                bg={colorMode === "light" ? "white" : "gray.800"}
                rounded={radiusStyle}
                shadow="lg"
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  h="4px"
                  bgGradient={`linear(to-r, ${metric.color}.400, ${metric.color}.600)`}
                />
                <CardBody p={6}>
                  <HStack justify="space-between" mb={4}>
                    <Box
                      p={3}
                      bg={`${metric.color}.50`}
                      color={`${metric.color}.500`}
                      rounded="xl"
                    >
                      <Icon as={metric.icon} boxSize={6} />
                    </Box>
                    {metric.trend !== 0 && (
                      <Badge
                        colorScheme={metric.trend > 0 ? "green" : "red"}
                        rounded="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        {metric.trend > 0 ? "+" : ""}{metric.trend}%
                      </Badge>
                    )}
                  </HStack>
                  <Stat>
                    <StatNumber fontSize="2xl" color={`${metric.color}.500`} fontWeight="bold">
                      {metric.value}
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500" mt={1}>
                      {metric.label}
                    </StatLabel>
                  </Stat>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>

          {/* Charts and Activities */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={6}>
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <Heading size="md">Project Status</Heading>
              </CardHeader>
              <CardBody>
                <Box h="300px">
                  <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                    height="100%"
                  />
                </Box>
              </CardBody>
            </Card>

            {/* Monthly Progress Bar Chart */}
            <Card>
              <CardHeader>
                <Heading size="md">Monthly Progress</Heading>
              </CardHeader>
              <CardBody>
                <Box h="300px">
                  <Chart
                    options={barChartOptions}
                    series={mockData.monthlyProgress.series}
                    type="bar"
                    height="100%"
                  />
                </Box>
              </CardBody>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <Heading size="md">Recent Activities</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {mockData.recentActivities.map((activity, index) => (
                    <HStack key={index} spacing={3}>
                      <Avatar size="sm" name={activity.user} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">{activity.user}</Text>
                          {" "}{activity.action} in{" "}
                          <Text as="span" color="blue.500">{activity.project}</Text>
                        </Text>
                        <Text fontSize="xs" color="gray.500">{activity.time}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Team Overview and Quick Actions */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Team Performance */}
            <Card>
              <CardHeader>
                <Heading size="md">Team Performance</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {mockData.teamMembers.map((member, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack spacing={3}>
                        <Avatar size="sm" name={member.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold">{member.name}</Text>
                          <Text fontSize="xs" color="gray.500">{member.role}</Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <Progress value={Math.random() * 100} size="sm" w="100px" colorScheme="green" />
                        <Text fontSize="xs" color="gray.500">{Math.floor(Math.random() * 20 + 80)}% efficiency</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <Heading size="md">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Button leftIcon={<FiFolder />} variant="outline" size="sm">
                    Create New Project
                  </Button>
                  <Button leftIcon={<FiUsers />} variant="outline" size="sm">
                    Manage Teams
                  </Button>
                  <Button leftIcon={<FiCheckCircle />} variant="outline" size="sm">
                    Review Approvals
                  </Button>
                  <Button leftIcon={<FiCalendar />} variant="outline" size="sm">
                    View Calendar
                  </Button>
                  <Button leftIcon={<FiDownload />} variant="outline" size="sm">
                    Generate Reports
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <Heading size="md">Alerts & Notifications</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack spacing={3} p={3} bg="red.50" rounded="md" border="1px" borderColor="red.200">
                  <Icon as={FiAlertCircle} color="red.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="red.700">
                      5 projects have upcoming deadlines this week
                    </Text>
                    <Text fontSize="xs" color="red.600">
                      Review and prioritize tasks to meet deadlines
                    </Text>
                  </VStack>
                  <Badge colorScheme="red">Urgent</Badge>
                </HStack>

                <HStack spacing={3} p={3} bg="orange.50" rounded="md" border="1px" borderColor="orange.200">
                  <Icon as={FiClock} color="orange.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                      7 approval requests pending
                    </Text>
                    <Text fontSize="xs" color="orange.600">
                      BRD and RFC documents waiting for your review
                    </Text>
                  </VStack>
                  <Badge colorScheme="orange">Pending</Badge>
                </HStack>

                <HStack spacing={3} p={3} bg="green.50" rounded="md" border="1px" borderColor="green.200">
                  <Icon as={FiCheckCircle} color="green.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="green.700">
                      System backup completed successfully
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      All project data has been backed up at 2:00 AM
                    </Text>
                  </VStack>
                  <Badge colorScheme="green">Success</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </LayoutAdmin>
  );
}
