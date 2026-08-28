"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select as ChakraSelect,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiBriefcase, FiCheck, FiFolder, FiLayers } from "react-icons/fi";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { PROJECT_STATUSES } from "@/app/constants/masterStatusConstants";
import { ListSearchByParam } from "@/app/types/masterTypes";

interface ModalProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectDataResponse) => void;
  tokenData: string;
  selectedProjectId?: string | null;
}

const ModalProjectSelector = ({
  isOpen,
  onClose,
  onSelectProject,
  tokenData,
  selectedProjectId,
}: ModalProjectSelectorProps) => {
  const { colorMode } = useColorMode();
  const { List: ListProjects } = useProjects();

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    if (!tokenData || !isOpen) return;
    setIsLoading(true);

    // Strictly filter by projectType = "PROCUREMENT" and default to PROJECT_STATUSES
    const filterWhere: ListSearchByParam[] = [
      { field: "projectType", operator: "=", value: "PROCUREMENT" },
      { field: "projectStatus", operator: "=", value: statusFilter || "PROJECT_STATUSES" },
    ];

    const res = await ListProjects(
      {
        page: 0,
        limit: 10,
        search: debouncedSearch,
        filterWhere,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      },
      tokenData
    );

    if (res?.statusCode === RES_CODE_OK && res.data) {
      setProjects(res.data);
    }
    setIsLoading(false);
  }, [tokenData, isOpen, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "RUNNING":
      case "ACTIVE":
      case "EXECUTING":
        return "green";
      case "INITIATING":
      case "INITIATION":
      case "PLANNING":
        return "blue";
      case "TEMPORARY CLOSED":
        return "yellow";
      case "CLOSED":
      case "COMPLETED":
        return "purple";
      case "ON HOLD":
      case "ON_HOLD":
        return "orange";
      case "CANCELED":
      case "DECLINED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent rounded="2xl" shadow="2xl">
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <HStack spacing={3}>
            <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiBriefcase} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">Select Corporate Procurement Project</Text>
              <Text fontSize="xs" color="gray.500">Choose a procurement project to link with this vendor contract</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Search & Status Filter Bar */}
            <Flex gap={3} wrap="wrap">
              <InputGroup size="sm" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search project by code, name, or SPK..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rounded="lg"
                  focusBorderColor="purple.500"
                />
              </InputGroup>

              <ChakraSelect
                size="sm"
                w="180px"
                rounded="lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </ChakraSelect>
            </Flex>

            {/* Project List */}
            {isLoading ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner color="purple.500" />
              </Flex>
            ) : projects.length > 0 ? (
              <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto" pr={1}>
                {projects.map((p) => {
                  const isSelected = selectedProjectId === p.id;
                  return (
                    <Box
                      key={p.id}
                      p={4}
                      borderWidth="1px"
                      borderColor={
                        isSelected
                          ? "purple.400"
                          : colorMode === "light"
                            ? "gray.200"
                            : "gray.700"
                      }
                      bg={
                        isSelected
                          ? colorMode === "light"
                            ? "purple.50"
                            : "purple.900"
                          : colorMode === "light"
                            ? "white"
                            : "gray.800"
                      }
                      rounded="xl"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: "purple.300",
                        shadow: "sm",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        onSelectProject(p);
                        onClose();
                      }}
                    >
                      <Flex justify="space-between" align="start" gap={3}>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2} wrap="wrap">
                            <Badge
                              colorScheme="purple"
                              fontSize="xs"
                              px={2}
                              py={0.5}
                              rounded="md"
                            >
                              {p.projectNo || p.projectCode || "NO-CODE"}
                            </Badge>
                            <Badge
                              colorScheme="blue"
                              fontSize="xs"
                              px={2}
                              py={0.5}
                              rounded="md"
                            >
                              {p.projectType || "PROCUREMENT"}
                            </Badge>
                            {p.sdlcStageName && (
                              <Badge
                                colorScheme="teal"
                                variant="outline"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {p.sdlcStageName}
                              </Badge>
                            )}
                            <Badge
                              colorScheme={getStatusBadgeColor(p.projectStatus)}
                              fontSize="2xs"
                              px={1.5}
                              rounded="full"
                            >
                              {p.projectStatus || "ACTIVE"}
                            </Badge>
                          </HStack>

                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={colorMode === "light" ? "gray.800" : "white"}
                          >
                            {p.projectName}
                          </Text>

                          <SimpleGrid
                            columns={{ base: 1, sm: 2 }}
                            spacingX={4}
                            spacingY={1}
                            fontSize="xs"
                            color="gray.500"
                            w="full"
                            pt={1}
                          >
                            <HStack spacing={1}>
                              <Icon as={FiFolder} />
                              <Text isTruncated>
                                {p.proOwnerDivisionName || "Division not set"}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon as={FiLayers} />
                              <Text isTruncated>
                                {p.proOwnerDirectorateName ||
                                  "Directorate not set"}
                              </Text>
                            </HStack>
                          </SimpleGrid>
                        </VStack>

                        <Button
                          size="xs"
                          colorScheme="purple"
                          variant={isSelected ? "solid" : "outline"}
                          leftIcon={isSelected ? <FiCheck /> : undefined}
                          rounded="lg"
                          flexShrink={0}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={10}
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="gray.200"
                rounded="xl"
              >
                <Icon as={FiBriefcase} boxSize={8} color="gray.300" mb={2} />
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  No procurement projects found
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Try adjusting search or status filter
                </Text>
              </Flex>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalProjectSelector;
