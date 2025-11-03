"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import useProjects, { ProjectUpdatePayload } from "@/app/services/useProjects";
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
  Textarea,
  useColorMode,
  Box,
} from "@chakra-ui/react";
import { FiEdit3, FiSave, FiX, FiSettings, FiRefreshCcw } from "react-icons/fi";
import { useState, useEffect } from "react";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";

interface ProjectEditSectionProps {
  DataProject: ProjectDataResponse | null;
  onRefresh?: () => void;
}

const ProjectEditSection = ({ DataProject, onRefresh }: ProjectEditSectionProps) => {
  const { colorMode } = useColorMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToastHelper();
  const { UpdateProjects } = useProjects();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    projectNo: "",
    projectName: "",
    projectDesc: "",
  });

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    
    if (token) setTokenData(token);
  }, [DataAuth]);

  // Initialize form data when DataProject changes
  useEffect(() => {
    if (DataProject) {
      setFormData({
        projectNo: DataProject.projectNo || "",
        projectName: DataProject.projectName || "",
        projectDesc: DataProject.projectDesc || "",
      });
    }
  }, [DataProject]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleSave = async () => {
    if (!DataProject || !tokenData) return;

    setIsSaving(true);
    try {
      const payload: ProjectUpdatePayload = {
        id: DataProject.id,
        projectNo: formData.projectNo,
        projectName: formData.projectName,
        projectDesc: formData.projectDesc,
        note: DataProject.note,
        projectCategory: DataProject.projectCategory,
        projectType: DataProject.projectType,
        projectRegisterDate: DataProject.projectRegisterDate,
        projectClosedDate: null,
        proOwnerDivisionId: DataProject.proOwnerDivisionId,
        proOwnerGroupId: DataProject.proOwnerGroupId,
        proManageByDivisionId: DataProject.proManageByDivisionId,
        proManageByGroupId: DataProject.proManageByGroupId,
        proManageByTeamId: DataProject.proManageByTeamId,
      };

      const response = await UpdateProjects(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Project updated successfully",
          statusToast: "success",
        });
        setIsEditing(false);
        // Refresh project data
        handleRefresh();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast({
        description: "Failed to update project",
        statusToast: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            onClick={handleRefresh}
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
              isDisabled={isSaving}
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
                value={formData.projectNo}
                onChange={(e) => setFormData(prev => ({ ...prev, projectNo: e.target.value }))}
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
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
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

            {/* Project Description */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Project Description
              </FormLabel>
              <Textarea
                value={formData.projectDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDesc: e.target.value }))}
                isReadOnly={!isEditing}
                bg={isEditing ? (colorMode === "light" ? "white" : "gray.600") : (colorMode === "light" ? "gray.50" : "gray.800")}
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                rounded="lg"
                rows={4}
                placeholder="Enter project description..."
                _readOnly={{
                  cursor: "default",
                  _focus: { boxShadow: "none" }
                }}
              />
            </FormControl>

            {/* Save Button - Only show when editing */}
            {isEditing && (
              <HStack justify="flex-end" pt={4}>
                <Button
                  colorScheme="green"
                  leftIcon={<FiSave />}
                  size="md"
                  rounded="full"
                  onClick={handleSave}
                  isLoading={isSaving}
                  loadingText="Saving..."
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
