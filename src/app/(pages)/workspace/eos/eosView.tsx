"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Select,
  SimpleGrid,
  Spacer,
  Tab,
  Table,
  TableContainer,
  TabList,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCpu,
  FiEye,
  FiFilter,
  FiHelpCircle,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { radiusStyle } from "@/app/constants/applicationConstants";
import ApplicationSearchDropdown from "./components/ApplicationSearchDropdown";
import {
  ApplicationOption,
  EosIncidentItem,
  IncidentStatus,
  INITIAL_APPLICATIONS,
  INITIAL_INCIDENTS_DATA,
  ProblemCategory,
  STATUS_INCIDENT_CONFIG,
} from "./types";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Engineer on Support (EOS)",
  breadCrumb: ["Home", "Workspace", "EOS"],
};

export default function EosView() {
  useDocumentTitle("Engineer on Support (EOS) — Workspace");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();

  const toast = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    const param = searchParams.get("appId");
    if (param && INITIAL_APPLICATIONS.some((a) => a.id === param)) {
      return param;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eos_selected_app_id");
      if (saved && INITIAL_APPLICATIONS.some((a) => a.id === saved)) {
        return saved;
      }
    }
    return INITIAL_APPLICATIONS[0].id;
  });

  const [selectedApp, setSelectedApp] = useState<ApplicationOption>(() => {
    const match = INITIAL_APPLICATIONS.find((a) => a.id === selectedAppId);
    return match || INITIAL_APPLICATIONS[0];
  });

  React.useEffect(() => {
    const param = searchParams.get("appId");
    if (param) {
      setSelectedAppId(param);
      const match = INITIAL_APPLICATIONS.find((a) => a.id === param);
      if (match) setSelectedApp(match);
    }
  }, [searchParams]);

  const handleSelectApp = (app: ApplicationOption) => {
    setSelectedAppId(app.id);
    setSelectedApp(app);
    if (typeof window !== "undefined") {
      localStorage.setItem("eos_selected_app_id", app.id);
    }
    setCurrentPage(1);
    toast({
      title: "Aplikasi Aktif",
      description: `${app.name} (${app.code})`,
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [pendingFilter, setPendingFilter] = useState<"ALL" | "PENDING" | "NON_PENDING">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [incidentsList] = useState<EosIncidentItem[]>(INITIAL_INCIDENTS_DATA);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Incidents belonging to the selected application
  const appIncidents = useMemo(() => {
    return incidentsList.filter(
      (i) =>
        i.appId === selectedAppId ||
        i.appCode === selectedApp.code ||
        i.appName.toLowerCase() === selectedApp.name.toLowerCase()
    );
  }, [incidentsList, selectedAppId, selectedApp]);

  // App-specific incident statistics
  const appStats = useMemo(() => {
    const total = appIncidents.length;
    const open = appIncidents.filter((i) => i.statusIncident === "Open").length;
    const inProgress = appIncidents.filter((i) => i.statusIncident === "In Progress").length;
    const pending = appIncidents.filter((i) => i.statusIncident === "Pending").length;
    const tempSolved = appIncidents.filter((i) => i.statusIncident === "Temporary Solved").length;
    const solved = appIncidents.filter((i) => i.statusIncident === "Solved").length;

    return { total, open, inProgress, pending, tempSolved, solved };
  }, [appIncidents]);

  // Filtered incidents based on search & filter
  const filteredIncidents = useMemo(() => {
    return appIncidents.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.problem.errorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.problem.errorDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.problem.jenisSurrounding.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.picPelapor.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.picEos.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusTab === "ALL" || item.statusIncident === statusTab;

      const matchPending =
        pendingFilter === "ALL" ||
        (pendingFilter === "PENDING" && item.statusIncident === "Pending") ||
        (pendingFilter === "NON_PENDING" && item.statusIncident !== "Pending");

      const matchCategory =
        categoryFilter === "ALL" || item.problem.problemCategory === categoryFilter;

      const matchPriority =
        priorityFilter === "ALL" || item.priorityIncident === priorityFilter;

      return matchSearch && matchStatus && matchPending && matchCategory && matchPriority;
    });
  }, [appIncidents, searchQuery, statusTab, pendingFilter, categoryFilter, priorityFilter]);

  // Paginated incidents
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredIncidents.length / pageSize) || 1;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusTab("ALL");
    setPendingFilter("ALL");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <LayoutAdmin>
      <Box p={{ base: 3, md: 5 }}>
        <HeaderContent {...HeaderDataContent} />

        {/* ════════════════════════════════════════════════════════════
            BLUE HEADER SECTION (SIMPLER, SLEEK & COMPACT)
            ════════════════════════════════════════════════════════════ */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.600)"
          color="white"
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 5 }}
          mt={3}
          mb={4}
          rounded="xl"
          position="relative"
          shadow="md"
        >
          {/* Subtle Ambient Decorative Glow (isolated in clipped background) */}
          <Box position="absolute" inset={0} overflow="hidden" rounded="xl" pointerEvents="none">
            <Box
              position="absolute"
              top="-35px"
              right="-35px"
              w="130px"
              h="130px"
              bg="whiteAlpha.100"
              rounded="full"
            />
          </Box>

          <VStack align="stretch" spacing={3.5} position="relative" zIndex={1}>
            {/* Row 1: Title, Subtitle & Primary CTA */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "start", sm: "center" }}
              gap={3}
            >
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg="whiteAlpha.200"
                  backdropFilter="blur(8px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  rounded="lg"
                  color="white"
                >
                  <Icon as={FiZap} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="white" fontWeight="800">
                    Engineer on Support (EOS)
                  </Heading>
                  <Text fontSize="xs" color="whiteAlpha.800">
                    Pemantauan kendala operasional, tracking error surrounding &amp; solusi incident aplikasi
                  </Text>
                </VStack>
              </HStack>

              <Button
                bg="white"
                color="secondary.800"
                _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                _active={{ transform: "scale(0.98)" }}
                size="sm"
                rounded="md"
                px={4}
                leftIcon={<FiPlus />}
                fontWeight="bold"
                shadow="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("eos_selected_app_id", selectedApp.id);
                  }
                  router.push(`/workspace/eos/create?appId=${selectedApp.id}`);
                }}
              >
                Input Log
              </Button>
            </Flex>

            {/* Row 2: Sleek Searchable App Selector + Compact Metric Ribbon */}
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              gap={3}
              pt={1}
            >
              {/* Searchable Application Selector Dropdown (Lazy Loaded on Search & Portaled) */}
              <HStack spacing={2} align="center">
                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.900" whiteSpace="nowrap">
                  Aplikasi:
                </Text>
                <ApplicationSearchDropdown
                  selectedAppId={selectedAppId}
                  onSelectApp={handleSelectApp}
                  incidentsList={incidentsList}
                  triggerVariant="header"
                  onSelectedAppLoaded={(app) => {
                    if (app.id === selectedAppId && selectedApp.id !== app.id) {
                      setSelectedApp(app);
                    }
                  }}
                />
              </HStack>

              {/* Compact Functional KPI Metric Ribbon (Replaces the bulky cards!) */}
              <HStack
                spacing={1.5}
                wrap="wrap"
                bg="whiteAlpha.150"
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={1.5}
                rounded="lg"
                align="center"
              >
                {/* Total */}
                <Button
                  size="xs"
                  variant={statusTab === "ALL" && pendingFilter === "ALL" ? "solid" : "ghost"}
                  bg={statusTab === "ALL" && pendingFilter === "ALL" ? "white" : "transparent"}
                  color={statusTab === "ALL" && pendingFilter === "ALL" ? "secondary.800" : "white"}
                  _hover={{ bg: "whiteAlpha.300" }}
                  rounded="md"
                  px={2.5}
                  onClick={handleResetFilters}
                >
                  Total: {appStats.total}
                </Button>

                <Divider orientation="vertical" h="16px" borderColor="whiteAlpha.400" />

                {/* Open */}
                <Button
                  size="xs"
                  variant={statusTab === "Open" ? "solid" : "ghost"}
                  bg={statusTab === "Open" ? "red.500" : "whiteAlpha.200"}
                  color="white"
                  _hover={{ bg: "red.600" }}
                  rounded="md"
                  px={2}
                  onClick={() => {
                    setStatusTab(statusTab === "Open" ? "ALL" : "Open");
                    setPendingFilter("ALL");
                    setCurrentPage(1);
                  }}
                >
                  <HStack spacing={1}>
                    <Box w="6px" h="6px" rounded="full" bg="red.200" />
                    <Text fontSize="xs">Open ({appStats.open})</Text>
                  </HStack>
                </Button>

                {/* In Progress */}
                <Button
                  size="xs"
                  variant={statusTab === "In Progress" ? "solid" : "ghost"}
                  bg={statusTab === "In Progress" ? "blue.500" : "whiteAlpha.200"}
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  rounded="md"
                  px={2}
                  onClick={() => {
                    setStatusTab(statusTab === "In Progress" ? "ALL" : "In Progress");
                    setPendingFilter("ALL");
                    setCurrentPage(1);
                  }}
                >
                  <HStack spacing={1}>
                    <Box w="6px" h="6px" rounded="full" bg="blue.200" />
                    <Text fontSize="xs">In Progress ({appStats.inProgress})</Text>
                  </HStack>
                </Button>

                {/* Pending (Prominently Highlighted) */}
                <Button
                  size="xs"
                  variant={statusTab === "Pending" || pendingFilter === "PENDING" ? "solid" : "ghost"}
                  bg={statusTab === "Pending" || pendingFilter === "PENDING" ? "yellow.400" : "yellow.500"}
                  color={statusTab === "Pending" || pendingFilter === "PENDING" ? "gray.900" : "white"}
                  _hover={{ bg: "yellow.400", color: "gray.900" }}
                  rounded="md"
                  px={2.5}
                  fontWeight="bold"
                  shadow={statusTab === "Pending" || pendingFilter === "PENDING" ? "md" : "none"}
                  onClick={() => {
                    const next = statusTab === "Pending" ? "ALL" : "Pending";
                    setStatusTab(next);
                    setPendingFilter(next === "Pending" ? "PENDING" : "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <HStack spacing={1}>
                    <Icon as={FiClock} boxSize={3} />
                    <Text fontSize="xs">Pending ({appStats.pending})</Text>
                  </HStack>
                </Button>

                {/* Temp Solved */}
                <Button
                  size="xs"
                  variant={statusTab === "Temporary Solved" ? "solid" : "ghost"}
                  bg={statusTab === "Temporary Solved" ? "purple.500" : "whiteAlpha.200"}
                  color="white"
                  _hover={{ bg: "purple.600" }}
                  rounded="md"
                  px={2}
                  onClick={() => {
                    setStatusTab(statusTab === "Temporary Solved" ? "ALL" : "Temporary Solved");
                    setPendingFilter("ALL");
                    setCurrentPage(1);
                  }}
                >
                  <Text fontSize="xs">Temp ({appStats.tempSolved})</Text>
                </Button>

                {/* Solved */}
                <Button
                  size="xs"
                  variant={statusTab === "Solved" ? "solid" : "ghost"}
                  bg={statusTab === "Solved" ? "green.500" : "whiteAlpha.200"}
                  color="white"
                  _hover={{ bg: "green.600" }}
                  rounded="md"
                  px={2}
                  onClick={() => {
                    setStatusTab(statusTab === "Solved" ? "ALL" : "Solved");
                    setPendingFilter("ALL");
                    setCurrentPage(1);
                  }}
                >
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} boxSize={3} />
                    <Text fontSize="xs">Solved ({appStats.solved})</Text>
                  </HStack>
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </Box>

        {/* ════════════════════════════════════════════════════════════
            STEP 2: FILTER BAR & STATUS TOGGLE (PENDING OR NO)
            ════════════════════════════════════════════════════════════ */}
        <Card
          bg={isDark ? "gray.800" : "white"}
          rounded={radiusStyle}
          shadow="sm"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "blue.100"}
          mb={4}
        >
          <CardBody p={3.5}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap">
              {/* Left: Search & Dropdown Filters */}
              <HStack spacing={2.5} wrap="wrap" flex={1}>
                {/* Search */}
                <InputGroup size="sm" maxW="260px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    rounded="md"
                    placeholder="Cari no. incident, error code, PIC..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>

                {/* Status Incident Filter */}
                <Select
                  size="sm"
                  maxW="160px"
                  rounded="md"
                  value={statusTab}
                  onChange={(e) => {
                    setStatusTab(e.target.value);
                    if (e.target.value === "Pending") {
                      setPendingFilter("PENDING");
                    } else if (pendingFilter === "PENDING") {
                      setPendingFilter("ALL");
                    }
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Temporary Solved">Temporary Solved</option>
                  <option value="Solved">Solved</option>
                </Select>

                {/* Pending or No Filter (Explicit Requirement) */}
                <Select
                  size="sm"
                  maxW="170px"
                  rounded="md"
                  value={pendingFilter}
                  onChange={(e) => {
                    const val = e.target.value as "ALL" | "PENDING" | "NON_PENDING";
                    setPendingFilter(val);
                    if (val === "PENDING") {
                      setStatusTab("Pending");
                    } else if (statusTab === "Pending") {
                      setStatusTab("ALL");
                    }
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Status: Semua</option>
                  <option value="PENDING">Status: Hanya Pending</option>
                  <option value="NON_PENDING">Status: Non-Pending</option>
                </Select>

                {/* Category Filter */}
                <Select
                  size="sm"
                  maxW="180px"
                  rounded="md"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Error App">Error App</option>
                  <option value="Error Surrounding">Error Surrounding</option>
                  <option value="Human Error">Human Error</option>
                  <option value="Other">Other</option>
                </Select>

                {/* Priority Filter */}
                <Select
                  size="sm"
                  maxW="160px"
                  rounded="md"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Priority</option>
                  <option value="HIGH">Priority: HIGH</option>
                  <option value="MEDIUM">Priority: MEDIUM</option>
                  <option value="LOW">Priority: LOW</option>
                </Select>

                {(searchQuery || statusTab !== "ALL" || pendingFilter !== "ALL" || categoryFilter !== "ALL" || priorityFilter !== "ALL") && (
                  <Button size="xs" variant="ghost" colorScheme="blue" leftIcon={<FiRefreshCw />} onClick={handleResetFilters}>
                    Reset
                  </Button>
                )}
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            STEP 3: TABLE (NO GRAY COLUMN BACKGROUND)
            ════════════════════════════════════════════════════════════ */}
        <Box overflowX="auto" w="full">
          <Box
            overflow="hidden"
            border="1px solid"
            borderRadius={radiusStyle}
            borderColor={isDark ? "blue.900" : "blue.100"}
            w="full"
            boxShadow="sm"
            bg={isDark ? "gray.800" : "white"}
          >
            <Table size="sm" variant="simple">
              <Thead bg={isDark ? "secondary.900" : "secondary.50"}>
                <Tr bg={isDark ? "secondary.900" : "secondary.50"}>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                    w="50px"
                  >
                    <Heading as="h5" size="xs">No.</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">No. Incident &amp; Waktu</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                    textAlign="center"
                  >
                    <Heading as="h5" size="xs">Priority</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">Error Code &amp; Surrounding</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">Problem Detail</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">PIC Pelapor / EoS</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">Runtime</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                  >
                    <Heading as="h5" size="xs">Jenis Solusi</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                    textAlign="center"
                  >
                    <Heading as="h5" size="xs">Status Incident</Heading>
                  </Th>
                  <Th
                    py={3.5}
                    bg={isDark ? "secondary.900" : "secondary.50"}
                    color={isDark ? "blue.200" : "secondary.800"}
                    borderBottom="2px solid"
                    borderColor={isDark ? "secondary.700" : "secondary.200"}
                    textAlign="center"
                  >
                    <Heading as="h5" size="xs">Actions</Heading>
                  </Th>
                </Tr>
              </Thead>

              <Tbody>
                {paginatedIncidents.length === 0 ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py={12}>
                      <VStack spacing={3}>
                        <Icon as={FiAlertCircle} boxSize={8} color="blue.300" />
                        <Text fontWeight="bold" color={isDark ? "gray.300" : "gray.600"} fontSize="sm">
                          Tidak ada data incident yang sesuai untuk aplikasi ini.
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<FiPlus />}
                          onClick={() => router.push(`/workspace/eos/create?appId=${selectedApp.id}`)}
                        >
                          Catat Incident Baru Sekarang
                        </Button>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  paginatedIncidents.map((item, index) => {
                    const statusCfg = STATUS_INCIDENT_CONFIG[item.statusIncident];
                    const rowNumber = (currentPage - 1) * pageSize + index + 1;
                    const isPending = item.statusIncident === "Pending";

                    return (
                      <Tr
                        key={item.id}
                        _hover={{ bg: isDark ? "whiteAlpha.100" : "blue.50" }}
                        transition="background 0.15s ease"
                        bg={isPending ? (isDark ? "rgba(236, 201, 75, 0.12)" : "yellow.50") : undefined}
                      >
                        {/* No. */}
                        <Td py={3.5} fontSize="xs" fontWeight="bold" color="gray.500">
                          {rowNumber}
                        </Td>

                        {/* Incident Number & Date */}
                        <Td py={3.5}>
                          <VStack align="start" spacing={0.5}>
                            <Text fontWeight="extrabold" fontSize="xs" color="blue.600">
                              {item.incidentNumber}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {item.problem.reportDate.replace("T", " ")}
                            </Text>
                          </VStack>
                        </Td>

                        {/* Priority */}
                        <Td py={3.5} textAlign="center">
                          <Badge
                            colorScheme={
                              item.priorityIncident === "HIGH"
                                ? "red"
                                : item.priorityIncident === "MEDIUM"
                                ? "orange"
                                : "green"
                            }
                            fontSize="xs"
                            px={2.5}
                            py={0.5}
                            rounded="full"
                            fontWeight="extrabold"
                          >
                            {item.priorityIncident || "MEDIUM"}
                          </Badge>
                        </Td>

                        {/* Error Code & Surrounding */}
                        <Td py={3.5}>
                          <VStack align="start" spacing={0.5}>
                            <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} rounded="md">
                              {item.problem.errorCode}
                            </Badge>
                            <Text fontSize="xs" fontWeight="semibold" noOfLines={1} maxW="200px">
                              {item.problem.jenisSurrounding}
                            </Text>
                          </VStack>
                        </Td>

                        {/* Problem Detail */}
                        <Td py={3.5}>
                          <VStack align="start" spacing={0.5} maxW="260px">
                            <HStack spacing={1}>
                              <Badge
                                colorScheme={
                                  item.problem.problemCategory === "Error App"
                                    ? "red"
                                    : item.problem.problemCategory === "Error Surrounding"
                                    ? "orange"
                                    : "gray"
                                }
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {item.problem.problemCategory}
                              </Badge>
                            </HStack>
                            <Tooltip
                              label={item.problem.problemDescription}
                              hasArrow
                              placement="top"
                              rounded="lg"
                              px={3}
                              py={2}
                              fontSize="xs"
                              maxW="400px"
                              bg={isDark ? "secondary.850" : "gray.900"}
                              color="white"
                              shadow="xl"
                              closeOnClick={false}
                            >
                              <Text
                                fontSize="xs"
                                color={isDark ? "gray.300" : "gray.700"}
                                noOfLines={2}
                                cursor="help"
                                _hover={{
                                  color: isDark ? "blue.300" : "blue.600",
                                }}
                                transition="color 0.15s ease"
                              >
                                {item.problem.problemDescription}
                              </Text>
                            </Tooltip>
                          </VStack>
                        </Td>

                        {/* PIC Pelapor / EoS */}
                        <Td py={3.5}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="bold">
                              {item.picPelapor.namaLengkap}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              EoS: {item.picEos.namaLengkap}
                            </Text>
                          </VStack>
                        </Td>

                        {/* Runtime */}
                        <Td py={3.5}>
                          <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2.5} py={0.5} rounded="md">
                            {item.problem.runtimeHours}j {item.problem.runtimeMinutes}m
                          </Badge>
                        </Td>

                        {/* Jenis Solusi */}
                        <Td py={3.5}>
                          {item.solution.jenisSolution ? (
                            <VStack align="start" spacing={0.5}>
                              <Badge
                                colorScheme={item.solution.jenisSolution === "Permanent" ? "green" : "purple"}
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {item.solution.jenisSolution}
                              </Badge>
                              {item.solution.tindakLanjut && (
                                <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="150px">
                                  {item.solution.tindakLanjut}
                                </Text>
                              )}
                            </VStack>
                          ) : (
                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                              Belum ada
                            </Text>
                          )}
                        </Td>

                        {/* Status Incident (Pending or No highlighted) */}
                        <Td py={3.5} textAlign="center">
                          <VStack spacing={1} align="center">
                            <Badge
                              colorScheme={statusCfg.colorScheme}
                              fontSize="xs"
                              px={2.5}
                              py={0.5}
                              rounded="full"
                              fontWeight="bold"
                            >
                              {statusCfg.label}
                            </Badge>
                            {isPending && (
                              <Badge colorScheme="yellow" variant="solid" fontSize="xs" px={2} py={0.5} rounded="md">
                                Pending Follow-up
                              </Badge>
                            )}
                          </VStack>
                        </Td>

                        {/* Action */}
                        <Td py={3.5} textAlign="center">
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<FiEye />}
                            onClick={() => router.push(`/workspace/eos/detail?id=${item.id}`)}
                          >
                            Detail
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>

            {/* Pagination Controls matching TableComponentFull / Application Page Pattern */}
            <Flex
              px={4}
              py={3}
              bg={isDark ? "gray.800" : "white"}
              borderTop="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={2}
            >
              <HStack spacing={2} fontSize="xs" color="gray.500">
                <Text>Menampilkan</Text>
                <Select
                  size="xs"
                  w="70px"
                  rounded="md"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
                <Text>
                  dari <b>{filteredIncidents.length}</b> data (Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>)
                </Text>
              </HStack>

              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  isDisabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  isDisabled={currentPage === 1}
                >
                  Prev
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p) => (
                    <Button
                      key={p}
                      size="xs"
                      colorScheme={currentPage === p ? "blue" : "gray"}
                      variant={currentPage === p ? "solid" : "outline"}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Button>
                  ))}

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  isDisabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </Box>
    </LayoutAdmin>
  );
}
