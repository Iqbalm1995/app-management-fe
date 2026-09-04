"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Badge,
  useColorMode,
  Flex,
  Button,
} from "@chakra-ui/react";
import { FiSearch, FiRefreshCw, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import DevFloatingTopbar from "./components/DevFloatingTopbar";
import DevProjectCard from "./components/DevProjectCard";

export default function DevProjectPickerPage() {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const { GetAssignedProjects, isLoading } = useProjects();
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  const fetchProjects = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("tokenData") || "";
      if (!token) {
        setIsFetching(false);
        return;
      }

      const payload = {
        search: "",
        limit: 100,
        page: 0,
        filterWhere: [],
        fieldOrder: ["projectName"],
        orderDir: "asc" as const,
      };

      const response = await GetAssignedProjects(payload, token);
      if (response?.statusCode === 200 && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch assigned projects:", err);
      setProjects([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const lower = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(lower) ||
        p.projectNo?.toLowerCase().includes(lower) ||
        p.proManageByTeamName?.toLowerCase().includes(lower) ||
        p.projectStatus?.toLowerCase().includes(lower)
    );
  }, [projects, searchTerm]);

  const handleSelectProject = (project: ProjectDataResponse) => {
    const backlogId =
      project.requirementData?.id || project.reqParentId || null;

    const selectedPayload = {
      id: project.id,
      projectNo: project.projectNo,
      projectName: project.projectName,
      projectStatus: project.projectStatus,
      backlogId: backlogId,
    };

    localStorage.setItem(
      "dev_selected_project",
      JSON.stringify(selectedPayload)
    );

    router.push("/dev/kanban");
  };

  return (
    <Box minH="100vh" pb={16}>
      <DevFloatingTopbar />

      <Container maxW="1200px" pt={{ base: "84px", md: "96px" }} px={6}>
        <VStack spacing={6} align="stretch">
          {/* Header section */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "start", sm: "center" }}
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Text
                  fontSize="2xl"
                  fontWeight={700}
                  letterSpacing="-0.02em"
                  color={isDark ? "white" : "gray.900"}
                >
                  Projects
                </Text>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="xs"
                >
                  {projects.length} available
                </Badge>
              </HStack>
              <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                Select a project to enter its developer kanban and backlog view
              </Text>
            </VStack>

            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiRefreshCw />}
              onClick={fetchProjects}
              isLoading={isFetching}
            >
              Refresh
            </Button>
          </Flex>

          {/* Search bar */}
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Filter projects by name, code, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={isDark ? "gray.900" : "white"}
              border="1px solid"
              borderColor={isDark ? "gray.800" : "gray.200"}
              borderRadius="xl"
              _focus={{
                borderColor: "purple.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
              }}
            />
          </InputGroup>

          {/* Projects Grid */}
          {isFetching ? (
            <Flex justify="center" align="center" minH="300px" direction="column" gap={3}>
              <Spinner size="lg" color="purple.500" thickness="3px" />
              <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                Loading your assigned projects...
              </Text>
            </Flex>
          ) : filteredProjects.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={12}
              borderRadius="2xl"
              border="1px dashed"
              borderColor={isDark ? "gray.800" : "gray.200"}
              bg={isDark ? "gray.900" : "white"}
              minH="260px"
              textAlign="center"
            >
              <Flex
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={isDark ? "gray.800" : "gray.100"}
                align="center"
                justify="center"
                color="gray.400"
                mb={3}
              >
                <FiLayers size={22} />
              </Flex>
              <Text fontWeight={600} fontSize="md" mb={1}>
                {searchTerm ? "No matching projects found" : "No projects assigned"}
              </Text>
              <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"} maxW="400px">
                {searchTerm
                  ? `No project matches "${searchTerm}". Try adjusting your keywords.`
                  : "You do not have any assigned projects in this workspace yet."}
              </Text>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
              {filteredProjects.map((project) => (
                <DevProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleSelectProject}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
