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
  useColorMode,
} from "@chakra-ui/react";
import { FiSearch, FiRefreshCw, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import DevFloatingTopbar from "./components/DevFloatingTopbar";
import DevProjectCard from "./components/DevProjectCard";
import { radiusStyle } from "@/app/constants/applicationConstants";

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
    const selectedPayload = {
      id: project.id,
      projectNo: project.projectNo,
      projectName: project.projectName,
      projectStatus: project.projectStatus,
      backlogId: null,
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
      bg={isDark ? "#090514" : "#f8fafc"}
      color={isDark ? "gray.100" : "gray.800"}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* 1. Multi-tier Ambient Glows (Top Aurora + Bottom Side Glows) */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        zIndex={0}
        overflow="hidden"
      >
        {/* Top-Center Aurora Glow */}
        <Box
          position="absolute"
          top="-140px"
          left="50%"
          transform="translateX(-50%)"
          w={{ base: "480px", md: "860px" }}
          h={{ base: "360px", md: "520px" }}
          bg={
            isDark
              ? "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.10) 40%, transparent 72%)"
              : "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.08) 42%, transparent 72%)"
          }
          filter="blur(65px)"
        />

        {/* Bottom-Left Indigo Glow */}
        <Box
          position="absolute"
          bottom="-120px"
          left="-80px"
          w={{ base: "300px", md: "520px" }}
          h={{ base: "300px", md: "520px" }}
          bg={
            isDark
              ? "radial-gradient(circle at center, rgba(99, 102, 241, 0.14) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(99, 102, 241, 0.10) 0%, transparent 70%)"
          }
          filter="blur(75px)"
        />

        {/* Bottom-Right Fuchsia Glow */}
        <Box
          position="absolute"
          bottom="-100px"
          right="-80px"
          w={{ base: "280px", md: "460px" }}
          h={{ base: "280px", md: "460px" }}
          bg={
            isDark
              ? "radial-gradient(circle at center, rgba(236, 72, 153, 0.12) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%)"
          }
          filter="blur(70px)"
        />
      </Box>

      {/* 2. Concentric Architectural Radar Rings (Centered behind Hero) */}
      <Box
        position="absolute"
        top="180px"
        left="50%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
        zIndex={0}
        opacity={isDark ? 0.5 : 0.75}
      >
        {/* Outer Ring */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={{ base: "640px", md: "960px" }}
          h={{ base: "640px", md: "960px" }}
          borderRadius="full"
          border="1px dashed"
          borderColor={isDark ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.14)"}
        />
        {/* Mid Ring */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={{ base: "440px", md: "680px" }}
          h={{ base: "440px", md: "680px" }}
          borderRadius="full"
          border="1px solid"
          borderColor={isDark ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.18)"}
        />
        {/* Inner Ring */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={{ base: "260px", md: "400px" }}
          h={{ base: "260px", md: "400px" }}
          borderRadius="full"
          border="1px dashed"
          borderColor={isDark ? "rgba(139, 92, 246, 0.16)" : "rgba(139, 92, 246, 0.22)"}
        />
      </Box>

      {/* 3. Modern Dual SaaS Grid (Orthogonal Grid Lines + Dot Matrix Intersections) */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        zIndex={0}
        opacity={isDark ? 0.45 : 0.7}
        sx={{
          maskImage:
            "radial-gradient(ellipse 95% 85% at 50% 35%, black 30%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 85% at 50% 35%, black 30%, transparent 95%)",
        }}
        backgroundImage={
          isDark
            ? `linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
               radial-gradient(circle, rgba(139, 92, 246, 0.3) 1.2px, transparent 1.2px)`
            : `linear-gradient(to right, rgba(139, 92, 246, 0.08) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(139, 92, 246, 0.08) 1px, transparent 1px),
               radial-gradient(circle, rgba(139, 92, 246, 0.28) 1.3px, transparent 1.3px)`
        }
        backgroundSize="48px 48px, 48px 48px, 24px 24px"
      />

      {/* 4. Diagonal Tech Stripe Corner Accents */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="280px"
        h="280px"
        pointerEvents="none"
        zIndex={0}
        opacity={isDark ? 0.25 : 0.4}
        backgroundImage={
          isDark
            ? "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(139, 92, 246, 0.12) 12px, rgba(139, 92, 246, 0.12) 13px)"
            : "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(139, 92, 246, 0.16) 12px, rgba(139, 92, 246, 0.16) 13px)"
        }
        sx={{
          maskImage: "radial-gradient(circle at 100% 0%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 100% 0%, black 20%, transparent 75%)",
        }}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        w="280px"
        h="280px"
        pointerEvents="none"
        zIndex={0}
        opacity={isDark ? 0.2 : 0.35}
        backgroundImage={
          isDark
            ? "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(139, 92, 246, 0.10) 12px, rgba(139, 92, 246, 0.10) 13px)"
            : "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(139, 92, 246, 0.14) 12px, rgba(139, 92, 246, 0.14) 13px)"
        }
        sx={{
          maskImage: "radial-gradient(circle at 0% 100%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 0% 100%, black 20%, transparent 75%)",
        }}
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
              color={isDark ? "white" : "gray.900"}
            >
              Select Your Project
            </Text>
            <Text
              fontSize={{ base: "xs", sm: "sm" }}
              color={isDark ? "gray.400" : "gray.600"}
              maxW="540px"
              lineHeight="tall"
            >
              Choose a project to enter its developer workspace and unlock your Kanban sprint board.
            </Text>
          </VStack>

          {/* Glass Search Bar */}
          <Box maxW="640px" w="full" mx="auto">
            <InputGroup size="lg">
              <InputLeftElement
                pointerEvents="none"
                color={isDark ? "gray.500" : "purple.400"}
                pl={4}
              >
                <FiSearch size={18} />
              </InputLeftElement>
              <Input
                placeholder="Search project name, code (#FE-2024), or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={isDark ? "rgba(255, 255, 255, 0.03)" : "white"}
                border="1px solid"
                borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "purple.100"}
                boxShadow={isDark ? "none" : "0 2px 10px rgba(139, 92, 246, 0.06)"}
                borderRadius={radiusStyle}
                color={isDark ? "white" : "gray.900"}
                pl="48px"
                fontSize="sm"
                _placeholder={{ color: isDark ? "gray.500" : "gray.400" }}
                backdropFilter={isDark ? "blur(16px)" : undefined}
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "purple.500",
                  boxShadow: isDark
                    ? "0 0 0 1px #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.25)"
                    : "0 0 0 1px #8b5cf6, 0 0 15px rgba(139, 92, 246, 0.15)",
                  bg: isDark ? "rgba(255, 255, 255, 0.05)" : "white",
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
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
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
              borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "purple.100"}
              bg={isDark ? "rgba(255, 255, 255, 0.02)" : "white"}
              boxShadow={isDark ? "none" : "0 4px 20px rgba(0, 0, 0, 0.04)"}
              backdropFilter={isDark ? "blur(16px)" : undefined}
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
                bg={isDark ? "rgba(139, 92, 246, 0.12)" : "purple.50"}
                border="1px solid"
                borderColor={isDark ? "rgba(139, 92, 246, 0.25)" : "purple.200"}
                align="center"
                justify="center"
                color={isDark ? "purple.300" : "purple.600"}
                mb={3}
              >
                <FiLayers size={24} />
              </Flex>
              <Text fontWeight={700} fontSize="md" color={isDark ? "white" : "gray.900"} mb={1}>
                {searchTerm ? "No matching projects found" : "No projects assigned yet"}
              </Text>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"} maxW="400px" mb={4}>
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
            <Text fontSize="xs" color={isDark ? "gray.500" : "gray.600"}>
              Don&apos;t see your project?{" "}
              <Button
                variant="link"
                color={isDark ? "purple.400" : "purple.600"}
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
