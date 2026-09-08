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
  Flex,
  Button,
} from "@chakra-ui/react";
import { FiSearch, FiRefreshCw, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import DevFloatingTopbar from "./components/DevFloatingTopbar";
import DevProjectCard from "./components/DevProjectCard";
import { radiusStyle } from "@/app/constants/applicationConstants";

export default function DevProjectPickerPage() {
  const router = useRouter();
  // Dev Mode is a developer hub — always dark, regardless of the app-wide color mode.

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
    // Check if project is already selected in localStorage -> skip directly to board
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dev_selected_project");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.id) {
            router.replace("/dev/kanban");
            return;
          }
        } catch (e) {
          console.error("Invalid saved project in localStorage:", e);
        }
      }
    }
    fetchProjects();
  }, [router]);

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

    window.dispatchEvent(
      new CustomEvent("dev_project_switched", { detail: selectedPayload })
    );

    router.push("/dev/kanban");
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      bg="#090514"
      color="gray.100"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Subtle ambient aura/glow in background */}
      <Box
        position="absolute"
        top="-120px"
        left="50%"
        transform="translateX(-50%)"
        w={{ base: "360px", md: "720px" }}
        h={{ base: "300px", md: "460px" }}
        bg="radial-gradient(ellipse at center, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.06) 45%, transparent 75%)"
        filter="blur(70px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Minimal Navbar */}
      <DevFloatingTopbar isSelectionMode />

      {/* Main Area: Centered, Focused, Gated - matching topbar maxW="1400px" */}
      <Container
        maxW="1400px"
        w={{ base: "calc(100% - 24px)", md: "calc(100% - 48px)" }}
        pt={{ base: "110px", md: "130px" }}
        pb={12}
        px={{ base: 2, sm: 4 }}
        position="relative"
        zIndex={1}
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <VStack spacing={7} align="stretch" w="full">
          {/* Header */}
          <VStack spacing={2} textAlign="center" px={4}>
            <Text
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              fontWeight={800}
              letterSpacing="-0.03em"
              color="white"
            >
              Select Your Project
            </Text>
            <Text
              fontSize={{ base: "xs", sm: "sm" }}
              color="gray.400"
              maxW="540px"
              lineHeight="tall"
            >
              Choose a project to enter its developer workspace and unlock your Kanban sprint board.
            </Text>
          </VStack>

          {/* Glass Search Bar */}
          <Box maxW="640px" w="full" mx="auto">
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" color="gray.500" pl={4}>
                <FiSearch size={18} />
              </InputLeftElement>
              <Input
                placeholder="Search project name, code (#FE-2024), or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="rgba(255, 255, 255, 0.03)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
                borderRadius={radiusStyle}
                color="white"
                pl="48px"
                fontSize="sm"
                _placeholder={{ color: "gray.500" }}
                backdropFilter="blur(16px)"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "purple.500",
                  boxShadow: "0 0 0 1px #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.25)",
                  bg: "rgba(255, 255, 255, 0.05)",
                }}
              />
            </InputGroup>
          </Box>

          {/* Project Cards Grid / Loading / Empty */}
          {isFetching ? (
            <Flex
              justify="center"
              align="center"
              minH="260px"
              direction="column"
              gap={3}
            >
              <Spinner size="lg" color="purple.400" thickness="2.5px" />
              <Text fontSize="xs" color="gray.400">
                Fetching assigned projects...
              </Text>
            </Flex>
          ) : filteredProjects.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={10}
              borderRadius="2xl"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.06)"
              bg="rgba(255, 255, 255, 0.02)"
              backdropFilter="blur(16px)"
              minH="260px"
              textAlign="center"
              maxW="560px"
              mx="auto"
              w="full"
            >
              <Flex
                w="52px"
                h="52px"
                borderRadius="xl"
                bg="rgba(139, 92, 246, 0.12)"
                border="1px solid"
                borderColor="rgba(139, 92, 246, 0.25)"
                align="center"
                justify="center"
                color="purple.300"
                mb={3}
              >
                <FiLayers size={24} />
              </Flex>
              <Text fontWeight={700} fontSize="md" color="white" mb={1}>
                {searchTerm ? "No matching projects found" : "No projects assigned yet"}
              </Text>
              <Text fontSize="xs" color="gray.400" maxW="400px" mb={4}>
                {searchTerm
                  ? `No project matches "${searchTerm}". Try adjusting your keywords.`
                  : "You have not been added to any workspace projects yet. Contact your administrator or project lead."}
              </Text>
              <Button
                size="xs"
                variant="outline"
                colorScheme="purple"
                leftIcon={<FiRefreshCw />}
                onClick={fetchProjects}
                isLoading={isFetching}
                fontSize="xs"
                borderRadius="lg"
              >
                Refresh
              </Button>
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

          {/* Secondary helper link at bottom */}
          <Flex justify="center" pt={4}>
            <Text fontSize="xs" color="gray.500">
              Don&apos;t see your project?{" "}
              <Button
                variant="link"
                color="purple.400"
                fontSize="xs"
                fontWeight={500}
                onClick={fetchProjects}
              >
                Refresh assignments
              </Button>
            </Text>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
