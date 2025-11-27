"use client";

import LayoutAdminWorkspace from "@/app/components/layoutAdminWorkspace";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Progress,
  Avatar,
  AvatarGroup,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  Flex,
  Divider,
} from "@chakra-ui/react";
import {
  MdCode,
  MdTask,
  MdCheckCircle,
  MdPending,
  MdWarning,
} from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";

export default function WorkspaceDevelopmentPage() {
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // 7. Count Statistics
  const stats = [
    {
      label: "Total Active Work (By Apps)",
      value: "4",
      icon: MdCode,
      gradient: "linear(to-r, blue.400, blue.600)",
    },
    {
      label: "Total Active Tasks",
      value: "156",
      icon: MdTask,
      gradient: "linear(to-r, orange.400, orange.600)",
    },
    {
      label: "Total In Progress",
      value: "24",
      icon: MdPending,
      gradient: "linear(to-r, green.400, green.600)",
    },
    {
      label: "Pending Overdue Task",
      value: "5",
      icon: MdWarning,
      gradient: "linear(to-r, red.400, red.600)",
    },
  ];

  // 1. Latest Working Project Apps Development
  const latestApps = [
    {
      name: "CRM System",
      code: "CRM-001",
      progress: 75,
      tasks: 12,
      team: [1, 2, 3, 4, 5],
    },
    {
      name: "Analytics Dashboard",
      code: "ANA-002",
      progress: 60,
      tasks: 8,
      team: [1, 2, 3],
    },
    {
      name: "Mobile App",
      code: "MOB-003",
      progress: 90,
      tasks: 15,
      team: [1, 2, 3, 4, 5, 6, 7],
    },
  ];

  // 2. Latest Working Features Development
  const latestFeatures = [
    {
      name: "User Authentication",
      app: "CRM System",
      status: "In Progress",
      assignee: "John Doe",
      progress: 60,
    },
    {
      name: "Report Generator",
      app: "Analytics Dashboard",
      status: "Testing",
      assignee: "Jane Smith",
      progress: 85,
    },
    {
      name: "Push Notifications",
      app: "Mobile App",
      status: "Completed",
      assignee: "Mike Johnson",
      progress: 100,
    },
    {
      name: "Data Export",
      app: "CRM System",
      status: "In Progress",
      assignee: "Sarah Lee",
      progress: 40,
    },
  ];

  // 3 & 4. My Project Work - By Apps & By Projects
  const myProjectsByApps = [
    {
      appCode: "CRM-001",
      appName: "CRM System",
      projects: 3,
      tasks: 45,
      progress: 65,
    },
    {
      appCode: "ANA-002",
      appName: "Analytics Dashboard",
      projects: 2,
      tasks: 28,
      progress: 70,
    },
  ];

  const myProjectsByProjects = [
    {
      projectCode: "PRJ-001",
      projectName: "Customer Portal",
      app: "CRM System",
      tasks: 25,
      progress: 60,
    },
    {
      projectCode: "PRJ-002",
      projectName: "Dashboard V2",
      app: "Analytics Dashboard",
      tasks: 18,
      progress: 75,
    },
    {
      projectCode: "PRJ-003",
      projectName: "Mobile Redesign",
      app: "Mobile App",
      tasks: 30,
      progress: 50,
    },
  ];

  // 5. List Action Work (User Activity Tasks)
  const actionTasks = [
    {
      task: "Review PR #234",
      type: "Code Review",
      priority: "High",
      dueDate: "2025-11-26",
    },
    {
      task: "Update API Documentation",
      type: "Documentation",
      priority: "Medium",
      dueDate: "2025-11-27",
    },
    {
      task: "Fix Bug #456",
      type: "Bug Fix",
      priority: "High",
      dueDate: "2025-11-26",
    },
  ];

  // 6. Pending Review Requirements
  const pendingRequirements = [
    {
      reqNo: "BRD-2024-001",
      name: "Customer Portal Enhancement",
      type: "BRD",
      submittedBy: "Alice Brown",
      date: "2025-11-20",
      status: "Pending",
    },
    {
      reqNo: "RFC-2024-015",
      name: "API Rate Limiting",
      type: "RFC",
      submittedBy: "Bob Wilson",
      date: "2025-11-22",
      status: "Pending",
    },
  ];

  const completedRequirements = [
    {
      reqNo: "BRD-2024-002",
      name: "Offline Mode",
      type: "BRD",
      submittedBy: "Carol Davis",
      date: "2025-11-15",
      status: "Completed",
    },
  ];

  return (
    <LayoutAdminWorkspace>
      <VStack spacing={6} align="stretch">
        {/* 7. Count Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {stats.map((stat, idx) => (
            <Box
              key={idx}
              bg={bgCard}
              p={5}
              borderRadius={radiusStyle}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <HStack spacing={4}>
                <Box
                  bgGradient={stat.gradient}
                  p={3}
                  borderRadius={radiusStyle}
                >
                  <Icon as={stat.icon} boxSize={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {stat.label}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* 8. Statistic Card Progression Current Quartal Task & 9. Project Progression */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box
            bg={bgCard}
            p={5}
            borderRadius={radiusStyle}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Text fontSize="md" fontWeight="bold" mb={4}>
              Current Quartal Task
            </Text>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontSize="sm">Completed/Done</Text>
                <Text fontWeight="bold" color="green.500">
                  45
                </Text>
              </HStack>
              <Progress value={60} colorScheme="green" borderRadius="full" />
              <HStack justify="space-between">
                <Text fontSize="sm">In Progress</Text>
                <Text fontWeight="bold" color="blue.500">
                  24
                </Text>
              </HStack>
              <Progress value={32} colorScheme="blue" borderRadius="full" />
              <HStack justify="space-between">
                <Text fontSize="sm">To Do</Text>
                <Text fontWeight="bold" color="gray.500">
                  6
                </Text>
              </HStack>
              <Progress value={8} colorScheme="gray" borderRadius="full" />
            </VStack>
          </Box>

          <Box
            bg={bgCard}
            p={5}
            borderRadius={radiusStyle}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Text fontSize="md" fontWeight="bold" mb={4}>
              Project Progression
            </Text>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontSize="sm">Active</Text>
                <Text fontWeight="bold" color="blue.500">
                  12
                </Text>
              </HStack>
              <Progress value={75} colorScheme="blue" borderRadius="full" />
              <HStack justify="space-between">
                <Text fontSize="sm">Closed</Text>
                <Text fontWeight="bold" color="green.500">
                  8
                </Text>
              </HStack>
              <Progress value={50} colorScheme="green" borderRadius="full" />
              <HStack justify="space-between">
                <Text fontSize="sm">Total</Text>
                <Text fontWeight="bold">20</Text>
              </HStack>
            </VStack>
          </Box>

          {/* 11. Current Date Calendar Active Activity Task */}
          <Box
            bg={bgCard}
            p={5}
            borderRadius={radiusStyle}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <HStack mb={4}>
              <Icon as={FiCalendar} />
              <Text fontSize="md" fontWeight="bold">
                Today's Activity
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              <Box
                p={3}
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius={radiusStyle}
              >
                <Text fontWeight="bold" fontSize="sm">
                  Sprint Planning
                </Text>
                <Text fontSize="xs" color="gray.500">
                  09:00 AM - 10:30 AM
                </Text>
              </Box>
              <Box
                p={3}
                bg={useColorModeValue("green.50", "green.900")}
                borderRadius={radiusStyle}
              >
                <Text fontWeight="bold" fontSize="sm">
                  Code Review
                </Text>
                <Text fontSize="xs" color="gray.500">
                  02:00 PM - 03:00 PM
                </Text>
              </Box>
              <Box
                p={3}
                bg={useColorModeValue("orange.50", "orange.900")}
                borderRadius={radiusStyle}
              >
                <Text fontWeight="bold" fontSize="sm">
                  Team Sync
                </Text>
                <Text fontSize="xs" color="gray.500">
                  04:00 PM - 04:30 PM
                </Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* 1. Latest Working Project Apps Development */}
        <Box
          bg={bgCard}
          p={5}
          borderRadius={radiusStyle}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Latest Working Project Apps Development
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {latestApps.map((app, idx) => (
              <Box
                key={idx}
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                transition="all 0.2s"
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{app.name}</Text>
                    <Badge colorScheme="blue">{app.code}</Badge>
                  </HStack>
                  <Progress
                    value={app.progress}
                    colorScheme="blue"
                    borderRadius="full"
                  />
                  <HStack
                    justify="space-between"
                    fontSize="sm"
                    color="gray.500"
                  >
                    <Text>{app.tasks} tasks</Text>
                    <AvatarGroup size="xs" max={3}>
                      {app.team.map((_, i) => (
                        <Avatar key={i} name={`User ${i}`} />
                      ))}
                    </AvatarGroup>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* 2. Latest Working Features Development */}
        <Box
          bg={bgCard}
          p={5}
          borderRadius={radiusStyle}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Latest Working Features Development
          </Text>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Feature Name</Th>
                <Th>App</Th>
                <Th>Assignee</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
              </Tr>
            </Thead>
            <Tbody>
              {latestFeatures.map((feature, idx) => (
                <Tr key={idx}>
                  <Td>{feature.name}</Td>
                  <Td>{feature.app}</Td>
                  <Td>{feature.assignee}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        feature.status === "Completed"
                          ? "green"
                          : feature.status === "Testing"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {feature.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Progress
                      value={feature.progress}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                      w="100px"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Main Content Grid */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Left & Center - 2 columns */}
          <Box gridColumn={{ base: "span 1", lg: "span 2" }}>
            <VStack spacing={6} align="stretch">
              {/* 3 & 4. My Project Work */}
              <Box
                bg={bgCard}
                p={5}
                borderRadius={radiusStyle}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  My Project Work
                </Text>
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList>
                    <Tab>By Apps</Tab>
                    <Tab>By Projects</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>App Code</Th>
                            <Th>App Name</Th>
                            <Th>Projects</Th>
                            <Th>Tasks</Th>
                            <Th>Progress</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myProjectsByApps.map((item, idx) => (
                            <Tr key={idx}>
                              <Td>
                                <Badge colorScheme="blue">{item.appCode}</Badge>
                              </Td>
                              <Td>{item.appName}</Td>
                              <Td>{item.projects}</Td>
                              <Td>{item.tasks}</Td>
                              <Td>
                                <Progress
                                  value={item.progress}
                                  size="sm"
                                  colorScheme="blue"
                                  borderRadius="full"
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TabPanel>
                    <TabPanel px={0}>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Project Code</Th>
                            <Th>Project Name</Th>
                            <Th>App</Th>
                            <Th>Tasks</Th>
                            <Th>Progress</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myProjectsByProjects.map((item, idx) => (
                            <Tr key={idx}>
                              <Td>
                                <Badge colorScheme="purple">
                                  {item.projectCode}
                                </Badge>
                              </Td>
                              <Td>{item.projectName}</Td>
                              <Td>{item.app}</Td>
                              <Td>{item.tasks}</Td>
                              <Td>
                                <Progress
                                  value={item.progress}
                                  size="sm"
                                  colorScheme="blue"
                                  borderRadius="full"
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {/* 6. Pending Review Requirements */}
              <Box
                bg={bgCard}
                p={5}
                borderRadius={radiusStyle}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Pending Review Requirements (BRD & RFC)
                </Text>
                <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                  <TabList>
                    <Tab>Pending</Tab>
                    <Tab>Completed</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Req No</Th>
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Submitted By</Th>
                            <Th>Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {pendingRequirements.map((req, idx) => (
                            <Tr key={idx}>
                              <Td>
                                <Badge colorScheme="orange">{req.reqNo}</Badge>
                              </Td>
                              <Td>{req.name}</Td>
                              <Td>
                                <Badge variant="outline">{req.type}</Badge>
                              </Td>
                              <Td>{req.submittedBy}</Td>
                              <Td fontSize="xs">{req.date}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TabPanel>
                    <TabPanel px={0}>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Req No</Th>
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Submitted By</Th>
                            <Th>Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {completedRequirements.map((req, idx) => (
                            <Tr key={idx}>
                              <Td>
                                <Badge colorScheme="green">{req.reqNo}</Badge>
                              </Td>
                              <Td>{req.name}</Td>
                              <Td>
                                <Badge variant="outline">{req.type}</Badge>
                              </Td>
                              <Td>{req.submittedBy}</Td>
                              <Td fontSize="xs">{req.date}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Sidebar - 1 column */}
          <VStack spacing={6}>
            {/* 5. List Action Work (User Activity Tasks) */}
            <Box
              bg={bgCard}
              p={5}
              borderRadius={radiusStyle}
              borderWidth="1px"
              borderColor={borderColor}
              w="full"
            >
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Action Work
              </Text>
              <VStack align="stretch" spacing={3}>
                {actionTasks.map((task, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius={radiusStyle}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" fontSize="sm">
                        {task.task}
                      </Text>
                      <Badge
                        colorScheme={
                          task.priority === "High" ? "red" : "orange"
                        }
                        fontSize="xs"
                      >
                        {task.priority}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {task.type}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Due: {task.dueDate}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* 10. Summary Works */}
            <Box
              bg={bgCard}
              p={5}
              borderRadius={radiusStyle}
              borderWidth="1px"
              borderColor={borderColor}
              w="full"
            >
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Summary Works
              </Text>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm">Tasks Completed</Text>
                  <Text fontWeight="bold">45/75</Text>
                </HStack>
                <Progress value={60} colorScheme="green" borderRadius="full" />
                <HStack justify="space-between">
                  <Text fontSize="sm">Code Reviews</Text>
                  <Text fontWeight="bold">8/10</Text>
                </HStack>
                <Progress value={80} colorScheme="blue" borderRadius="full" />
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="sm">This Week</Text>
                  <Text fontWeight="bold" color="green.500">
                    +12 tasks
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    </LayoutAdminWorkspace>
  );
}
