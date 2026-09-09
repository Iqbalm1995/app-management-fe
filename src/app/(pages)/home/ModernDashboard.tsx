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
import { FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiBarChart, FiFolder } from "react-icons/fi";
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
            <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("gray.900", "white")}>
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
            bg={useColorModeValue(`${color}.50`, `${color}.900`)} 
            borderRadius="lg"
          >
            <Icon as={icon} w={6} h={6} color={useColorModeValue(`${color}.500`, `${color}.300`)} />
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
  const headingColor = useColorModeValue("gray.700", "gray.100");
  const itemBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const itemHoverBg = useColorModeValue("blue.50", "whiteAlpha.200");

  const actions = [
    { label: "New Project", icon: FiFolder, href: "/projects/new" },
    { label: "Assign Task", icon: FiCheckCircle, href: "/tasks/assign" },
    { label: "Team Members", icon: FiUsers, href: "/teams" },
    { label: "Calendar", icon: FiClock, href: "/calendar" },
  ];

  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color={headingColor}>Quick Actions</Heading>
        <VStack spacing={3} align="stretch">
          {actions.map((action, idx) => (
            <Flex 
              key={idx}
              as="a"
              href={action.href}
              p={3}
              borderRadius="md"
              bg={itemBg}
              _hover={{ bg: itemHoverBg, cursor: "pointer" }}
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
  const headingColor = useColorModeValue("gray.700", "gray.100");
  
  const activities = [
    { user: "John Doe", action: "completed task", project: "Project Alpha", time: "2 hours ago" },
    { user: "Jane Smith", action: "created new", project: "Project Beta", time: "4 hours ago" },
    { user: "Mike Johnson", action: "updated", project: "Project Gamma", time: "6 hours ago" },
  ];

  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color={headingColor}>Recent Activity</Heading>
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
