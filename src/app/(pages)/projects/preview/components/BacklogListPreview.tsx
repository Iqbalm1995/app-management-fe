"use client";

import { useEffect, useState } from "react";
import { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, { BacklogDataResponse } from "@/app/services/useRequirements";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  Box,
  useColorMode,
  Progress,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { FiLayers } from "react-icons/fi";

interface BacklogListPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const BacklogListPreview = ({ DataProject }: BacklogListPreviewProps) => {
  const { colorMode } = useColorMode();
  const { ListBacklog } = useRequirements();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [backlogs, setBacklogs] = useState<BacklogDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  useEffect(() => {
    if (DataProject?.reqParentId && tokenData) {
      loadBacklogs();
    }
  }, [DataProject, tokenData]);

  const loadBacklogs = async () => {
    if (!DataProject?.reqParentId) return;
    
    setIsLoading(true);
    try {
      const payload = {
        page: 0,
        limit: 100,
        search: "",
        filterWhere: [
          { field: "reqId", operator: "=" as const, value: DataProject.reqParentId }
        ],
        fieldOrder: ["backlogPos"],
        orderDir: "asc" as const,
      };

      const response = await ListBacklog(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setBacklogs(response.data);
      }
    } catch (error) {
      console.error("Error loading backlogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "red";
      case "HIGH": return "red";
      case "MEDIUM": return "orange";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={colorMode === "light" ? "gray.800" : "white"}>
            Work Progress - Backlogs
          </Heading>
          <Text fontSize="sm" color="gray.500">
            View project backlogs and features
          </Text>
        </VStack>
        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
          {backlogs.length} Backlogs
        </Badge>
      </HStack>

      {isLoading ? (
        <Box textAlign="center" py={12}>
          <LoadingMiniSignature />
          <Text mt={4} color="gray.500">Loading backlogs...</Text>
        </Box>
      ) : backlogs.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {backlogs.map((backlog) => (
            <Card
              key={backlog.id}
              shadow="md"
              rounded={radiusStyle}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="start">
                    <Badge colorScheme={getPriorityColor(backlog.priority)} size="sm">
                      {backlog.priority}
                    </Badge>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={2}>
                      {backlog.backlogName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {backlog.backlogDesc || "No description"}
                    </Text>
                  </VStack>

                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.500">Progress</Text>
                      <Text fontSize="xs" fontWeight="bold">
                        {backlog.progressionPercentage || 0}%
                      </Text>
                    </HStack>
                    <Progress
                      value={backlog.progressionPercentage || 0}
                      size="sm"
                      colorScheme="blue"
                      rounded="full"
                    />
                  </Box>

                  {backlog.backlogEnddate && (
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.500">Deadline:</Text>
                      <Text fontSize="xs" fontWeight="medium">
                        {new Date(backlog.backlogEnddate).toLocaleDateString()}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card shadow="md" rounded={radiusStyle} border="1px" borderColor="gray.200">
          <CardBody p={12}>
            <VStack spacing={4}>
              <FiLayers size={48} color="gray" />
              <Text color="gray.500" fontSize="lg">No backlogs found</Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                This project doesn't have any backlogs yet
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default BacklogListPreview;
