"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select as ChakraSelect,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
  FiFolder,
  FiGrid,
  FiLayers,
  FiList,
  FiRotateCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { PROJECT_STATUSES } from "@/app/constants/masterStatusConstants";
import { ListSearchByParam, PaggingListPayload } from "@/app/types/masterTypes";

export interface ProjectPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectDataResponse) => void;
  tokenData: string;
  appId?: string | null;
  appName?: string | null;
  selectedProjectId?: string | null;
  title?: string;
  defaultViewMode?: "grid" | "table";
}

// Highlight matching search query inside text
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Box
            as="mark"
            key={i}
            bg="yellow.200"
            color="gray.900"
            px={0.5}
            borderRadius="xs"
            fontWeight="bold"
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
}

export const getProjectStatusBadgeColor = (status?: string) => {
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

export default function ProjectPickerModal({
  isOpen,
  onClose,
  onSelectProject,
  tokenData,
  appId = null,
  appName = null,
  selectedProjectId = null,
  title = "Pilih Project Terkait",
  defaultViewMode = "grid",
}: ProjectPickerModalProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();

  const { List: ListProjects, ListByApp: ListProjectsByApp } = useProjects();

  // View Mode: Grid (Default) vs Table
  const [viewMode, setViewMode] = useState<"grid" | "table">(defaultViewMode);

  // Data & State
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tempSelectedProject, setTempSelectedProject] =
    useState<ProjectDataResponse | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pagination State
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pageIndex when filters or modal change
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, statusFilter, pageSize, appId]);

  // Fetch Projects (scoped to app if appId is provided, otherwise all projects)
  const loadProjects = useCallback(async () => {
    if (!tokenData || !isOpen) return;
    setIsLoading(true);

    try {
      const filterWhere: ListSearchByParam[] = [];

      if (statusFilter) {
        filterWhere.push({
          field: "projectStatus",
          operator: "=",
          value: statusFilter,
        });
      }

      const payload: PaggingListPayload = {
        search: debouncedSearch,
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere,
      };

      let res;
      if (appId && ListProjectsByApp) {
        res = await ListProjectsByApp(appId, payload, tokenData);
      } else {
        res = await ListProjects(payload, tokenData);
      }

      if (res?.statusCode === RES_CODE_OK && res.data) {
        const loadedProjects = res.data as ProjectDataResponse[];
        setProjects(loadedProjects);
        setTotalCount(res.countTotal || loadedProjects.length);

        // Pre-select if selectedProjectId matches
        if (selectedProjectId) {
          const match = loadedProjects.find(
            (p) =>
              p.id === selectedProjectId ||
              p.projectNo === selectedProjectId ||
              p.projectCode === selectedProjectId
          );
          if (match) setTempSelectedProject(match);
        }
      } else {
        setProjects([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load projects for picker:", err);
      showToast({
        description: "Gagal memuat daftar project",
        statusToast: "error",
      });
      setProjects([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    tokenData,
    isOpen,
    appId,
    debouncedSearch,
    statusFilter,
    pageIndex,
    pageSize,
    selectedProjectId,
  ]);

  useEffect(() => {
    if (isOpen && tokenData) {
      loadProjects();
    }
  }, [isOpen, tokenData, loadProjects]);

  // Derived Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;
  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  const isFiltered = debouncedSearch !== "" || statusFilter !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("");
  };

  const handleSelectProject = (project: ProjectDataResponse) => {
    setTempSelectedProject(project);
  };

  const handleConfirmSelect = () => {
    if (!tempSelectedProject) return;
    onSelectProject(tempSelectedProject);
    onClose();
  };

  const cardBg = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent
        bg={cardBg}
        borderColor={borderColor}
        borderRadius={radiusStyle}
        boxShadow="2xl"
        maxH="90vh"
      >
        {/* Modal Header */}
        <ModalHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          py={4}
          px={6}
        >
          <Flex justify="space-between" align="center" pr={6}>
            <HStack spacing={3}>
              <Box
                p={2}
                bg={isDark ? "blue.900" : "blue.50"}
                color="secondary.500"
                borderRadius="md"
              >
                <Icon as={FiBriefcase} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                  {title}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {appName
                    ? `Menampilkan proyek yang terhubung dengan aplikasi "${appName}"`
                    : "Pilih project korporat untuk dihubungkan ke pengajuan CAB"}
                </Text>
              </VStack>
            </HStack>

            {totalCount > 0 && (
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                {totalCount} Project Tersedia
              </Badge>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        {/* Modal Body */}
        <ModalBody py={5} px={6}>
          <VStack spacing={4} align="stretch">
            {/* Filter & Toolbar Bar */}
            <Card
              bg={isDark ? "gray.900" : "gray.50"}
              border="1px solid"
              borderColor={borderColor}
              borderRadius={radiusStyle}
              p={3.5}
            >
              <Flex gap={3} align="center" wrap="wrap">
                {/* Search Input */}
                <InputGroup size="sm" flex={1} minW={{ base: "100%", md: "260px" }}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color={isDark ? "#718096" : "#A0AEC0"} />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari kode proyek, nama proyek, atau SPK..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={isDark ? "gray.800" : "white"}
                    borderRadius="md"
                    fontSize="xs"
                    _focus={{
                      borderColor: "secondary.500",
                      boxShadow: "0 0 0 1px #2B6CB0",
                    }}
                  />
                  {searchTerm && (
                    <InputRightElement>
                      <IconButton
                        size="xs"
                        aria-label="Clear search"
                        icon={<FiX />}
                        variant="ghost"
                        onClick={() => setSearchTerm("")}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                {/* Status Filter */}
                <Box minW={{ base: "100%", sm: "170px" }}>
                  <ChakraSelect
                    size="sm"
                    borderRadius="md"
                    bg={isDark ? "gray.800" : "white"}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Semua Status Project</option>
                    {PROJECT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </ChakraSelect>
                </Box>

                {/* Reset Filters */}
                {isFiltered && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<FiRotateCcw />}
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                )}

                {/* View Switcher */}
                <HStack spacing={1} bg={isDark ? "gray.800" : "white"} p={1} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <Tooltip label="Tampilan Grid (Kartu)" fontSize="xs">
                    <IconButton
                      size="xs"
                      aria-label="Grid view"
                      icon={<FiGrid />}
                      colorScheme={viewMode === "grid" ? "secondary" : "gray"}
                      variant={viewMode === "grid" ? "solid" : "ghost"}
                      onClick={() => setViewMode("grid")}
                    />
                  </Tooltip>
                  <Tooltip label="Tampilan Tabel (Daftar)" fontSize="xs">
                    <IconButton
                      size="xs"
                      aria-label="Table view"
                      icon={<FiList />}
                      colorScheme={viewMode === "table" ? "secondary" : "gray"}
                      variant={viewMode === "table" ? "solid" : "ghost"}
                      onClick={() => setViewMode("table")}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </Card>

            {/* Projects Presentation */}
            <Box minH="360px" position="relative">
              {isLoading ? (
                <Center h="360px">
                  <VStack spacing={3}>
                    <Spinner size="xl" color="secondary.500" thickness="3px" />
                    <Text fontSize="sm" color="gray.500">
                      Memuat daftar project...
                    </Text>
                  </VStack>
                </Center>
              ) : projects.length === 0 ? (
                <Center h="360px" flexDirection="column" gap={3}>
                  <Box
                    p={4}
                    bg={isDark ? "gray.800" : "gray.100"}
                    borderRadius="full"
                    color="gray.400"
                  >
                    <Icon as={FiFolder} boxSize={8} />
                  </Box>
                  <VStack spacing={1}>
                    <Heading size="xs" color={isDark ? "gray.300" : "gray.700"}>
                      Project Tidak Ditemukan
                    </Heading>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      {isFiltered
                        ? "Tidak ada project yang sesuai dengan filter pencarian."
                        : appName
                        ? `Belum ada project yang terhubung dengan aplikasi "${appName}".`
                        : "Belum ada data project terdaftar."}
                    </Text>
                  </VStack>
                  {isFiltered && (
                    <Button
                      size="xs"
                      colorScheme="secondary"
                      variant="outline"
                      onClick={handleResetFilters}
                    >
                      Reset Filter
                    </Button>
                  )}
                </Center>
              ) : viewMode === "grid" ? (
                /* GRID VIEW */
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
                  {projects.map((p) => {
                    const isSelected =
                      tempSelectedProject?.id === p.id ||
                      tempSelectedProject?.projectNo === p.projectNo ||
                      tempSelectedProject?.projectCode === p.projectCode;
                    const projectCode = p.projectNo || p.projectCode || "NO-CODE";

                    return (
                      <Card
                        key={p.id}
                        cursor="pointer"
                        onClick={() => handleSelectProject(p)}
                        borderRadius={radiusStyle}
                        bg={
                          isSelected
                            ? isDark
                              ? "secondary.900"
                              : "blue.50"
                            : isDark
                            ? "gray.800"
                            : "white"
                        }
                        border="2px solid"
                        borderColor={
                          isSelected
                            ? "secondary.500"
                            : isDark
                            ? "gray.700"
                            : "gray.200"
                        }
                        transition="all 0.2s ease"
                        _hover={{
                          transform: "translateY(-2px)",
                          borderColor: isSelected ? "secondary.500" : "secondary.300",
                          boxShadow: "md",
                        }}
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Selected Checkmark */}
                        {isSelected && (
                          <Box
                            position="absolute"
                            top={2}
                            right={2}
                            bg="secondary.500"
                            color="white"
                            borderRadius="full"
                            p={1}
                            boxShadow="sm"
                            zIndex={2}
                          >
                            <Icon as={FiCheck} boxSize={3.5} />
                          </Box>
                        )}

                        <CardBody p={4}>
                          <VStack spacing={2.5} align="start">
                            {/* Badges Row */}
                            <HStack spacing={1.5} wrap="wrap">
                              <Badge
                                colorScheme="purple"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                                fontFamily="mono"
                              >
                                {projectCode}
                              </Badge>

                              {p.projectType && (
                                <Badge
                                  colorScheme="blue"
                                  variant="subtle"
                                  fontSize="2xs"
                                  px={1.5}
                                  borderRadius="md"
                                >
                                  {p.projectType}
                                </Badge>
                              )}

                              {p.sdlcStageName && (
                                <Badge
                                  colorScheme="teal"
                                  variant="outline"
                                  fontSize="2xs"
                                  px={1.5}
                                  borderRadius="md"
                                >
                                  {p.sdlcStageName}
                                </Badge>
                              )}

                              <Badge
                                colorScheme={getProjectStatusBadgeColor(p.projectStatus)}
                                fontSize="2xs"
                                px={1.5}
                                borderRadius="full"
                              >
                                {p.projectStatus || "ACTIVE"}
                              </Badge>
                            </HStack>

                            {/* Project Name */}
                            <Text
                              fontWeight="bold"
                              fontSize="xs"
                              color={isDark ? "white" : "gray.800"}
                              noOfLines={2}
                              lineHeight="short"
                            >
                              <HighlightText text={p.projectName || "Unnamed Project"} query={debouncedSearch} />
                            </Text>

                            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />

                            {/* Unit Owner & Directorate Meta */}
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacingX={3} spacingY={1} w="full" fontSize="2xs" color="gray.500">
                              <HStack spacing={1} isTruncated>
                                <Icon as={FiFolder} />
                                <Text isTruncated title={p.proOwnerDivisionName || "Division not set"}>
                                  {p.proOwnerDivisionName || "Divisi tidak diatur"}
                                </Text>
                              </HStack>
                              <HStack spacing={1} isTruncated>
                                <Icon as={FiLayers} />
                                <Text isTruncated title={p.proOwnerDirectorateName || "Directorate not set"}>
                                  {p.proOwnerDirectorateName || "Direktorat tidak diatur"}
                                </Text>
                              </HStack>
                            </SimpleGrid>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ) : (
                /* TABLE VIEW */
                <Card
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius={radiusStyle}
                  overflow="hidden"
                >
                  <Table size="sm" variant="simple">
                    <Thead bg={isDark ? "gray.900" : "gray.50"}>
                      <Tr>
                        <Th w="40px" textAlign="center">
                          #
                        </Th>
                        <Th>Kode Project</Th>
                        <Th>Nama Project</Th>
                        <Th>SDLC Stage</Th>
                        <Th>Status</Th>
                        <Th w="100px" textAlign="center">
                          Aksi
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {projects.map((p, idx) => {
                        const isSelected =
                          tempSelectedProject?.id === p.id ||
                          tempSelectedProject?.projectNo === p.projectNo ||
                          tempSelectedProject?.projectCode === p.projectCode;
                        const rowNum = pageIndex * pageSize + idx + 1;
                        const projectCode = p.projectNo || p.projectCode || "NO-CODE";

                        return (
                          <Tr
                            key={p.id}
                            bg={
                              isSelected
                                ? isDark
                                  ? "secondary.900"
                                  : "blue.50"
                                : undefined
                            }
                            _hover={{
                              bg: isDark ? "whiteAlpha.50" : "gray.50",
                            }}
                            cursor="pointer"
                            onClick={() => handleSelectProject(p)}
                          >
                            <Td textAlign="center" fontSize="xs" color="gray.500">
                              {rowNum}
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" fontSize="xs" fontFamily="mono">
                                {projectCode}
                              </Badge>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold" fontSize="xs">
                                  <HighlightText text={p.projectName} query={debouncedSearch} />
                                </Text>
                                <Text fontSize="3xs" color="gray.500">
                                  {p.proOwnerDivisionName || "—"}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              {p.sdlcStageName ? (
                                <Badge colorScheme="teal" variant="outline" fontSize="2xs">
                                  {p.sdlcStageName}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getProjectStatusBadgeColor(p.projectStatus)}
                                fontSize="2xs"
                                rounded="full"
                              >
                                {p.projectStatus || "ACTIVE"}
                              </Badge>
                            </Td>
                            <Td textAlign="center">
                              {isSelected ? (
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  leftIcon={<FiCheckCircle />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmSelect();
                                  }}
                                >
                                  Terpilih
                                </Button>
                              ) : (
                                <Button
                                  size="xs"
                                  colorScheme="secondary"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectProject(p);
                                  }}
                                >
                                  Pilih
                                </Button>
                              )}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Card>
              )}
            </Box>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <Flex
                justify="space-between"
                align="center"
                pt={2}
                borderTop="1px solid"
                borderColor={borderColor}
                wrap="wrap"
                gap={3}
              >
                {/* Info Text & Page Size */}
                <HStack spacing={3}>
                  <Text fontSize="xs" color="gray.500">
                    Menampilkan <b>{startItem}-{endItem}</b> dari <b>{totalCount}</b> project
                  </Text>
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">
                      Per Halaman:
                    </Text>
                    <ChakraSelect
                      size="xs"
                      borderRadius="md"
                      w="70px"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </ChakraSelect>
                  </HStack>
                </HStack>

                {/* Navigation Buttons */}
                <HStack spacing={1}>
                  <IconButton
                    size="sm"
                    aria-label="First page"
                    icon={<FiChevronsLeft />}
                    variant="outline"
                    isDisabled={!canPrev}
                    onClick={() => setPageIndex(0)}
                  />
                  <IconButton
                    size="sm"
                    aria-label="Previous page"
                    icon={<FiChevronLeft />}
                    variant="outline"
                    isDisabled={!canPrev}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  />
                  <HStack spacing={1} px={2}>
                    <Text fontSize="xs" fontWeight="bold">
                      {pageIndex + 1}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      / {totalPages}
                    </Text>
                  </HStack>
                  <IconButton
                    size="sm"
                    aria-label="Next page"
                    icon={<FiChevronRight />}
                    variant="outline"
                    isDisabled={!canNext}
                    onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                  />
                  <IconButton
                    size="sm"
                    aria-label="Last page"
                    icon={<FiChevronsRight />}
                    variant="outline"
                    isDisabled={!canNext}
                    onClick={() => setPageIndex(totalPages - 1)}
                  />
                </HStack>
              </Flex>
            )}
          </VStack>
        </ModalBody>

        {/* Modal Footer */}
        <ModalFooter
          borderTop="1px solid"
          borderColor={borderColor}
          py={3.5}
          px={6}
          justifyContent="space-between"
        >
          {/* Selected Project Indicator */}
          <HStack spacing={2}>
            {tempSelectedProject ? (
              <HStack spacing={2} bg={isDark ? "blue.900" : "blue.50"} px={3} py={1.5} borderRadius="md" border="1px solid" borderColor="blue.300">
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="xs" fontWeight="semibold" color={isDark ? "blue.200" : "blue.800"}>
                  Terpilih: {tempSelectedProject.projectNo || tempSelectedProject.projectCode} — {tempSelectedProject.projectName}
                </Text>
              </HStack>
            ) : (
              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                Belum ada project yang dipilih
              </Text>
            )}
          </HStack>

          <HStack spacing={3}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              colorScheme="secondary"
              size="sm"
              leftIcon={<FiCheck />}
              isDisabled={!tempSelectedProject}
              onClick={handleConfirmSelect}
            >
              Pilih Project
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
