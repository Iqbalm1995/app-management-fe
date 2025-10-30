"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorMode,
  Badge,
  Box,
} from "@chakra-ui/react";
import { FiEdit3, FiSave, FiX, FiSettings, FiRefreshCcw } from "react-icons/fi";
import { useState } from "react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { getStatusColor } from "@/app/utils/statusUtils";

interface ProjectEditSectionProps {
  DataProject: ProjectDataResponse | null;
}

const ProjectEditSection = ({ DataProject }: ProjectEditSectionProps) => {
  const { colorMode } = useColorMode();
  const [isEditing, setIsEditing] = useState(false);

  if (!DataProject) {
    return (
      <Text color="gray.500">
        No project data available.
      </Text>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Edit Project
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project information and settings
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      {/* Project Information Card */}
      <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
        <CardHeader bg="blue.50" roundedTop="xl">
          <HStack justify="space-between" align="center">
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
                <FiSettings size={20} color="white" />
              </Box>
              <Heading size="md" color="blue.700">
                Project Information
              </Heading>
            </HStack>
            <Button
              size="sm"
              colorScheme={isEditing ? "red" : "blue"}
              leftIcon={isEditing ? <FiX /> : <FiEdit3 />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "solid"}
              rounded="full"
            >
              {isEditing ? "Cancel" : "Edit Project"}
            </Button>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Number */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Project Number
              </FormLabel>
              <Input
                value={DataProject.projectNo || ""}
                isReadOnly={!isEditing}
                bg={isEditing ? (colorMode === "light" ? "white" : "gray.600") : (colorMode === "light" ? "gray.50" : "gray.800")}
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                rounded="lg"
                _readOnly={{
                  cursor: "default",
                  _focus: { boxShadow: "none" }
                }}
              />
            </FormControl>

            {/* Project Name */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Project Name
              </FormLabel>
              <Input
                value={DataProject.projectName || ""}
                isReadOnly={!isEditing}
                bg={isEditing ? (colorMode === "light" ? "white" : "gray.600") : (colorMode === "light" ? "gray.50" : "gray.800")}
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                rounded="lg"
                _readOnly={{
                  cursor: "default",
                  _focus: { boxShadow: "none" }
                }}
              />
            </FormControl>

            {/* Project Status */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Project Status
              </FormLabel>
              {isEditing ? (
                <Select
                  defaultValue={DataProject.projectStatus}
                  bg={colorMode === "light" ? "white" : "gray.600"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                  rounded="lg"
                  maxW="250px"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ONHOLD">ONHOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              ) : (
                <Badge
                  colorScheme={getStatusColor(DataProject.projectStatus)}
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                  display="inline-block"
                  cursor="default"
                >
                  {DataProject.projectStatus}
                </Badge>
              )}
            </FormControl>

            {/* Save Button - Only show when editing */}
            {isEditing && (
              <HStack justify="flex-end" pt={4}>
                <Button
                  colorScheme="green"
                  leftIcon={<FiSave />}
                  size="md"
                  rounded="full"
                  onClick={() => {
                    // TODO: Implement save functionality
                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProjectEditSection;
