"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  HStack,
  VStack,
  useColorMode,
  Button,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

interface EnhancedApproverSectionProps {
  DataProject: ProjectDataResponse;
  canApprove: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

export const EnhancedApproverSection = ({ 
  DataProject, 
  canApprove, 
  onApprove, 
  onDecline 
}: EnhancedApproverSectionProps) => {
  const { colorMode } = useColorMode();

  if (!canApprove) {
    return null;
  }

  return (
    <Card 
      shadow="xl" 
      rounded="xl" 
      border="2px" 
      borderColor="orange.400"
      bg={colorMode === "light" ? "orange.50" : "orange.900"}
    >
      <CardHeader 
        bgGradient={colorMode === "light" ? "linear(to-r, orange.400, orange.500)" : "linear(to-r, orange.600, orange.700)"}
        roundedTop="xl" 
        py={4}
      >
        <HStack spacing={3}>
          <Box
            w={12}
            h={12}
            bg="white"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="md"
          >
            <FiAlertCircle size={24} color="orange" />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Heading size="md" color="white">
              Approval Required
            </Heading>
            <Text fontSize="sm" color="white" opacity={0.9}>
              This project is waiting for your approval decision
            </Text>
          </VStack>
          <Badge 
            colorScheme="yellow" 
            fontSize="sm" 
            px={3} 
            py={1} 
            rounded="full"
            bg="yellow.400"
            color="gray.800"
          >
            Pending
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.200"} mb={2}>
              Project Details:
            </Text>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Project Code:</Text>
                <Text fontSize="sm" fontWeight="medium">{DataProject.projectCode}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Project Type:</Text>
                <Badge colorScheme="blue" fontSize="xs">{DataProject.projectType}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Status:</Text>
                <Badge colorScheme="purple" fontSize="xs">{DataProject.projectStatus}</Badge>
              </HStack>
            </VStack>
          </Box>

          <Divider />

          <Box>
            <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.200"} mb={3}>
              Take Action:
            </Text>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiCheckCircle />}
                colorScheme="green"
                size="md"
                flex={1}
                onClick={onApprove}
                shadow="md"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Approve Project
              </Button>
              <Button
                leftIcon={<FiXCircle />}
                colorScheme="red"
                size="md"
                flex={1}
                onClick={onDecline}
                shadow="md"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Decline Project
              </Button>
            </HStack>
          </Box>

          <Box 
            p={3} 
            bg={colorMode === "light" ? "orange.100" : "orange.800"} 
            rounded="lg"
            border="1px"
            borderColor="orange.300"
          >
            <Text fontSize="xs" color={colorMode === "light" ? "orange.800" : "orange.200"}>
              <strong>Note:</strong> Please review all project details carefully before making your approval decision. 
              Your action will be recorded in the project status history.
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
