"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { 
  radiusStyle, 
  ENDPOINT_API_BASEURL, 
  ENDPOINT_PORT_BASIC 
} from "@/app/constants/applicationConstants";
import { 
  getProjectHealthRating, 
  truncateText, 
  buildUrlPort 
} from "@/app/helper/MasterHelper";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { 
  FiCode, 
  FiUsers, 
  FiCalendar, 
  FiTrendingUp, 
  FiGitBranch,
  FiActivity,
  FiExternalLink,
  FiPlay
} from "react-icons/fi";
import { BsKanban } from "react-icons/bs";
import Link from "next/link";
import { memo, useState } from "react";

interface CardProjectProps {
  data: ProjectDataResponse;
}

const CardProject = memo(({ data }: CardProjectProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "green";
      case "COMPLETED": return "blue";
      case "ONHOLD": return "orange";
      case "INACTIVE": return "red";
      default: return "gray";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "orange";
    return "red";
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      w="full"
      h="auto"
      minH="420px"
      bg={useColorModeValue("white", "gray.800")}
      border="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      rounded="2xl"
      shadow={isHovered ? "2xl" : "lg"}
      transition="all 0.3s ease"
      transform={isHovered ? "translateY(-8px)" : "translateY(0)"}
      _hover={{
        cursor: "pointer",
        borderColor: "secondary.300",
      }}
      overflow="hidden"
      position="relative"
    >
      {/* Header with App Icon and Status */}
      <CardHeader
        p={0}
        position="relative"
        bgGradient="linear(135deg, secondary.600 0%, blue.500 50%, secondary.400 100%)"
        color="white"
        h="140px"
        display="flex"
        alignItems="center"
        justifyContent="center"
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
        
        {/* App Icon */}
        <VStack spacing={2} position="relative" zIndex={1}>
          <Box
            w={16}
            h={16}
            bg="whiteAlpha.200"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2xl"
            fontWeight="bold"
            border="2px"
            borderColor="whiteAlpha.300"
          >
            {data.appsProject?.appShortName?.charAt(0) || data.projectName.charAt(0)}
          </Box>
          <Text fontSize="sm" fontWeight="medium" opacity="0.9">
            {data.projectType}
          </Text>
        </VStack>

        {/* Status Badge */}
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme={getStatusColor(data.projectStatus)}
          rounded="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="bold"
        >
          {data.projectStatus}
        </Badge>

        {/* Project Category */}
        <Badge
          position="absolute"
          bottom={4}
          left={4}
          bg="whiteAlpha.200"
          color="white"
          rounded="full"
          px={3}
          py={1}
          fontSize="xs"
        >
          {data.projectCategory}
        </Badge>
      </CardHeader>

      {/* Card Body */}
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Project Info */}
          <VStack spacing={2} align="start">
            <HStack spacing={2} w="full" justify="space-between">
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                #{data.projectCode}
              </Text>
              <HStack spacing={1}>
                <Icon as={FiActivity} size="12px" color="gray.400" />
                <Text fontSize="xs" color="gray.500">
                  {getProjectHealthRating(data.projectStatusPercentage)}
                </Text>
              </HStack>
            </HStack>
            
            <Tooltip
              label={data.projectName}
              hasArrow
              placement="top"
              isDisabled={data.projectName.length <= 45}
            >
              <Heading 
                size="md" 
                color={useColorModeValue("gray.800", "white")}
                noOfLines={2}
                minH="48px"
                display="flex"
                alignItems="center"
              >
                {data.projectName}
              </Heading>
            </Tooltip>
          </VStack>

          {/* Progress Section */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Progress
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={`${getProgressColor(data.projectStatusPercentage)}.500`}>
                {data.projectStatusPercentage}%
              </Text>
            </HStack>
            <Progress
              value={data.projectStatusPercentage}
              colorScheme={getProgressColor(data.projectStatusPercentage)}
              rounded="full"
              size="md"
              bg={useColorModeValue("gray.100", "gray.700")}
            />
          </VStack>

          {/* Team Section */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FiUsers} size="14px" color="gray.500" />
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Team
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {data.userAssignment?.length || 0} members
              </Text>
            </HStack>
            
            <HStack justify="space-between" align="center">
              <AvatarGroup size="sm" max={4} spacing="-8px">
                {data.userAssignment?.map((user, idx) => (
                  <Avatar 
                    key={idx} 
                    name={user.userData?.nama || "Unknown"} 
                    size="sm"
                    border="2px"
                    borderColor={useColorModeValue("white", "gray.800")}
                  />
                )) || []}
              </AvatarGroup>
              
              {data.userAssignment && data.userAssignment.length > 4 && (
                <Text fontSize="xs" color="gray.500">
                  +{data.userAssignment.length - 4} more
                </Text>
              )}
            </HStack>
          </VStack>

          {/* Quick Actions */}
          <HStack spacing={2} pt={2}>
            <Link href={`/projects-manager/detail?projectId=${data.id}`} style={{ flex: 1 }}>
              <Button
                size="md"
                variant="outline"
                colorScheme="gray"
                leftIcon={<FiExternalLink />}
                w="full"
                rounded="lg"
                _hover={{
                  bg: "gray.50",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
              >
                Detail
              </Button>
            </Link>
            
            <Link href={`project-development/development?projectId=${data.id}`} style={{ flex: 1 }}>
              <Button
                size="md"
                colorScheme="secondary"
                leftIcon={<FiCode />}
                w="full"
                rounded="lg"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
                fontWeight="bold"
                bgGradient="linear(to-r, secondary.500, blue.500)"
                _active={{
                  bgGradient: "linear(to-r, secondary.600, blue.600)",
                }}
              >
                Development
              </Button>
            </Link>
          </HStack>
        </VStack>
      </CardBody>

      {/* Hover Overlay */}
      {isHovered && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="secondary.500"
          opacity="0.05"
          rounded="2xl"
          pointerEvents="none"
        />
      )}
    </Card>
  );
});

CardProject.displayName = "CardProject";

export default CardProject;
