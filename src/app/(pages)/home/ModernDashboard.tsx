"use client";

import {
  Box,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  useColorModeValue,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import { FiUsers, FiBarChart3, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import { MdAssignment } from "react-icons/md";

// Modern Stat Card Component
const ModernStatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue" 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color?: string;
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Card 
      bg={bg} 
      border="1px solid" 
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody p={6}>
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              {value}
            </Text>
            {change && (
              <HStack spacing={1} mt={2}>
                <StatArrow type="increase" />
                <Text fontSize="sm" color="green.500" fontWeight="medium">
                  {change}
                </Text>
              </HStack>
            )}
          </Box>
          <Box 
            p={3} 
            bg={`${color}.50`} 
            borderRadius="lg"
          >
            <Icon as={icon} w={6} h={6} color={`${color}.500`} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

// Quick Actions Card
const QuickActionsCard = () => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  const actions = [
    { label: "Kanban Board", icon: FiBarChart3, href: "/kanban" },
    { label: "Projects", icon: MdAssignment, href: "/projects-manager" },
    { label: "Teams", icon: FiUsers, href: "/teams" },
    { label: "Calendar", icon: FiClock, href: "/calendar" },
  ];

  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color="gray.700">Quick Actions</Heading>
        <VStack spacing={3} align="stretch">
          {actions.map((action, idx) => (
            <Flex 
              key={idx}
              as="a"
              href={action.href}
              p={3}
              borderRadius="md"
              bg="gray.50"
              _hover={{ bg: "blue.50", cursor: "pointer" }}
              align="center"
              transition="all 0.2s"
            >
              <Icon as={action.icon} w={5} h={5} color="blue.500" mr={3} />
              <Text fontWeight="medium">{action.label}</Text>
            </Flex>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Recent Activity Card
const RecentActivityCard = () => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  const activities = [
    { user: "John Doe", action: "completed task", project: "Project Alpha", time: "2 hours ago" },
    { user: "Jane Smith", action: "created new", project: "Project Beta", time: "4 hours ago" },
    { user: "Mike Johnson", action: "updated", project: "Project Gamma", time: "6 hours ago" },
  ];

  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color="gray.700">Recent Activity</Heading>
        <VStack spacing={4} align="stretch">
          {activities.map((activity, idx) => (
            <Flex key={idx} align="center">
              <Avatar size="sm" name={activity.user} mr={3} />
              <Box flex={1}>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="medium">{activity.user}</Text>
                  {` ${activity.action} `}
                  <Text as="span" fontWeight="medium" color="blue.500">{activity.project}</Text>
                </Text>
                <Text fontSize="xs" color="gray.500">{activity.time}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export { ModernStatCard, QuickActionsCard, RecentActivityCard };
