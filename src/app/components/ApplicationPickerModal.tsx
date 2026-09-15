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
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
  FiGrid,
  FiInfo,
  FiLayers,
  FiList,
  FiRotateCcw,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";

import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import { StatusBadge } from "@/app/components/StatusBadge";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  DIVISION_ID_IT_BJB,
  ORG_CATEGORY_KEY_GROUP,
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload, PaggingListPayloadCustom } from "@/app/types/masterTypes";

export interface ApplicationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ApplicationMasterResponse | null;
  onAppSelect: (app: ApplicationMasterResponse | null) => void;
  tokenData: string;
  title?: string;
  defaultViewMode?: "grid" | "table";
  allowOtherCategory?: boolean;
  lockByGroupId?: string | null;
}

// Highlight matching search query inside text
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
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

export default function ApplicationPickerModal({
  isOpen,
  onClose,
  selectedApp,
  onAppSelect,
  tokenData,
  title = "Pilih Product / Aplikasi",
  defaultViewMode = "grid",
  allowOtherCategory = false,
  lockByGroupId = null,
}: ApplicationPickerModalProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();

  const { List: ListApps } = useApps();
  const { List: ListOrganization } = useOrganization();

  // View Mode: Grid (Default) vs Table
  const [viewMode, setViewMode] = useState<"grid" | "table">(defaultViewMode);

  // Data & State
  const [apps, setApps] = useState<ApplicationMasterResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tempSelectedApp, setTempSelectedApp] =
    useState<ApplicationMasterResponse | null>(selectedApp);

  // Group Reference Options
  const [itGroupOptions, setItGroupOptions] = useState<OrganizationResponse[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<string>(lockByGroupId || "ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState<string>("ALL");

  // Pagination State
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync tempSelectedApp when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedApp(selectedApp);
    }
  }, [isOpen, selectedApp]);

  // Reset pageIndex to 0 when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, groupFilter, statusFilter, criticalityFilter, pageSize]);

  // Fetch IT Group options for filtering
  useEffect(() => {
    if (!tokenData || !isOpen) return;
    ListOrganization(
      {
        search: "",
        limit: 100,
        page: 0,
        filterWhere: [
          { field: "orgType", operator: "=", value: ORG_CATEGORY_KEY_GROUP },
          { field: "parentId", operator: "=", value: DIVISION_ID_IT_BJB },
        ],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      } as PaggingListPayload,
      tokenData
    ).then((res) => {
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setItGroupOptions(res.data);
      }
    });
  }, [tokenData, isOpen]);

  // Fetch Applications List with Filters
  const loadApps = useCallback(async () => {
    if (!tokenData || !isOpen) return;
    setIsLoading(true);

    try {
      const filterWhere: any[] = [];

      // Locked group or group filter
      const effectiveGroup = lockByGroupId || (groupFilter !== "ALL" ? groupFilter : null);
      if (effectiveGroup) {
        filterWhere.push({
          field: "appManageByGroupId",
          operator: "=",
          value: effectiveGroup,
        });
      }

      // Status filter
      if (statusFilter !== "ALL") {
        filterWhere.push({
          field: "appsStatus",
          operator: "=",
          value: statusFilter,
        });
      }

      // Criticality filter
      if (criticalityFilter === "CRITICAL") {
        filterWhere.push({
          field: "appIsCritical",
          operator: "in",
          value: "Y,true,1,TRUE",
        });
      } else if (criticalityFilter === "NON-CRITICAL") {
        filterWhere.push({
          field: "appIsCritical",
          operator: "in",
          value: "N,false,0,FALSE",
        });
      }

      const payload: PaggingListPayloadCustom = {
        search: debouncedSearch,
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["appName"],
        orderDir: "asc",
        filterWhere,
      };

      const res = await ListApps(payload as any, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setApps(res.data);
        setTotalCount(res.countTotal || 0);
      } else {
        setApps([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load applications for picker:", err);
      showToast({
        description: "Gagal memuat daftar aplikasi",
        statusToast: "error",
      });
      setApps([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    tokenData,
    isOpen,
    debouncedSearch,
    groupFilter,
    statusFilter,
    criticalityFilter,
    lockByGroupId,
    pageIndex,
    pageSize,
  ]);

  useEffect(() => {
    if (isOpen && tokenData) {
      loadApps();
    }
  }, [isOpen, tokenData, loadApps]);

  // Derived Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;
  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

  // Check if any filter active
  const isFiltered =
    debouncedSearch !== "" ||
    (groupFilter !== "ALL" && !lockByGroupId) ||
    statusFilter !== "ALL" ||
    criticalityFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    if (!lockByGroupId) setGroupFilter("ALL");
    setStatusFilter("ALL");
    setCriticalityFilter("ALL");
  };

  const handleSelectApp = (app: ApplicationMasterResponse) => {
    const isOtherApp =
      app.appCode?.toUpperCase().includes("OTHER") ||
      app.appShortName?.toUpperCase().includes("OTHER");

    if (isOtherApp && !allowOtherCategory) {
      showToast({
        description:
          "Aplikasi dengan kategori 'OTHER' tidak dapat dipilih untuk modul ini.",
        statusToast: "warning",
      });
      return;
    }

    setTempSelectedApp(app);
  };

  const handleConfirmSelect = () => {
    if (!tempSelectedApp) return;
    onAppSelect(tempSelectedApp);
    onClose();
  };

  const cardBg = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
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
                <Icon as={HiOutlineDesktopComputer} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                  {title}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Cari dan pilih aplikasi portofolio untuk dihubungkan ke data formulir
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
                {totalCount} Aplikasi Tersedia
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
              <VStack spacing={3} align="stretch">
                {/* Search Bar & View Switcher */}
                <Flex gap={3} align="center" wrap={{ base: "wrap", md: "nowrap" }}>
                  <InputGroup size="md" flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color={isDark ? "#718096" : "#A0AEC0"} />
                    </InputLeftElement>
                    <Input
                      placeholder="Cari nama aplikasi atau kode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      bg={isDark ? "gray.800" : "white"}
                      borderRadius="md"
                      fontSize="sm"
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

                  {/* Dual View Toggle Button */}
                  <HStack spacing={1} bg={isDark ? "gray.800" : "white"} p={1} borderRadius="md" border="1px solid" borderColor={borderColor}>
                    <Tooltip label="Tampilan Grid (Kartu)" fontSize="xs">
                      <IconButton
                        size="sm"
                        aria-label="Grid view"
                        icon={<FiGrid />}
                        colorScheme={viewMode === "grid" ? "secondary" : "gray"}
                        variant={viewMode === "grid" ? "solid" : "ghost"}
                        onClick={() => setViewMode("grid")}
                      />
                    </Tooltip>
                    <Tooltip label="Tampilan Tabel (Daftar)" fontSize="xs">
                      <IconButton
                        size="sm"
                        aria-label="Table view"
                        icon={<FiList />}
                        colorScheme={viewMode === "table" ? "secondary" : "gray"}
                        variant={viewMode === "table" ? "solid" : "ghost"}
                        onClick={() => setViewMode("table")}
                      />
                    </Tooltip>
                  </HStack>
                </Flex>

                {/* Secondary Filters: Group, Status, Criticality */}
                <Flex gap={3} align="center" wrap="wrap">
                  {/* Group Filter */}
                  {!lockByGroupId && (
                    <Box minW={{ base: "100%", sm: "200px" }} flex={1}>
                      <ChakraSelect
                        size="sm"
                        borderRadius="md"
                        bg={isDark ? "gray.800" : "white"}
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                      >
                        <option value="ALL">Semua Group Pengelola</option>
                        {itGroupOptions.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.orgName}
                          </option>
                        ))}
                      </ChakraSelect>
                    </Box>
                  )}

                  {/* Criticality Filter */}
                  <Box minW={{ base: "100%", sm: "160px" }}>
                    <ChakraSelect
                      size="sm"
                      borderRadius="md"
                      bg={isDark ? "gray.800" : "white"}
                      value={criticalityFilter}
                      onChange={(e) => setCriticalityFilter(e.target.value)}
                    >
                      <option value="ALL">Semua Kritikalitas</option>
                      <option value="CRITICAL">Tier 1 / Critical</option>
                      <option value="NON-CRITICAL">Non-Critical</option>
                    </ChakraSelect>
                  </Box>

                  {/* Status Filter */}
                  <Box minW={{ base: "100%", sm: "140px" }}>
                    <ChakraSelect
                      size="sm"
                      borderRadius="md"
                      bg={isDark ? "gray.800" : "white"}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
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
                </Flex>
              </VStack>
            </Card>

            {/* Application Data Presentation */}
            <Box minH="380px" position="relative">
              {isLoading ? (
                <Center h="380px">
                  <VStack spacing={3}>
                    <Spinner size="xl" color="secondary.500" thickness="3px" />
                    <Text fontSize="sm" color="gray.500">
                      Memuat daftar aplikasi...
                    </Text>
                  </VStack>
                </Center>
              ) : apps.length === 0 ? (
                <Center h="380px" flexDirection="column" gap={3}>
                  <Box
                    p={4}
                    bg={isDark ? "gray.800" : "gray.100"}
                    borderRadius="full"
                    color="gray.400"
                  >
                    <Icon as={FiSearch} boxSize={8} />
                  </Box>
                  <VStack spacing={1}>
                    <Heading size="xs" color={isDark ? "gray.300" : "gray.700"}>
                      Aplikasi Tidak Ditemukan
                    </Heading>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      {isFiltered
                        ? "Tidak ada aplikasi yang sesuai dengan filter pencarian Anda. Coba ubah kata kunci atau reset filter."
                        : "Belum ada data aplikasi yang terdaftar."}
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
                /* GRID VIEW (Default) */
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3.5}>
                  {apps.map((app) => {
                    const isSelected = tempSelectedApp?.id === app.id;
                    const isOtherApp =
                      app.appCode?.toUpperCase().includes("OTHER") ||
                      app.appShortName?.toUpperCase().includes("OTHER");
                    const isCritical =
                      app.appIsCritical?.toUpperCase() === "Y" ||
                      app.appIsCritical?.toUpperCase() === "TRUE" ||
                      app.appIsCritical === "1";

                    return (
                      <Card
                        key={app.id}
                        cursor={isOtherApp && !allowOtherCategory ? "not-allowed" : "pointer"}
                        onClick={() => handleSelectApp(app)}
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
                        opacity={isOtherApp && !allowOtherCategory ? 0.5 : 1}
                        transition="all 0.2s ease"
                        _hover={
                          isOtherApp && !allowOtherCategory
                            ? {}
                            : {
                                transform: "translateY(-2px)",
                                borderColor: isSelected ? "secondary.500" : "secondary.300",
                                boxShadow: "md",
                              }
                        }
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Selection Checkmark Badge */}
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

                        <CardBody p={3.5}>
                          <VStack spacing={3} align="start">
                            {/* Avatar & Badges */}
                            <HStack spacing={2.5} w="full" align="center">
                              <Avatar
                                size="md"
                                name={app.appShortName || app.appName || "APP"}
                                src={app.iconApps || undefined}
                                bg={isCritical ? "red.600" : "secondary.600"}
                                color="white"
                                icon={<HiOutlineDesktopComputer fontSize="1.2rem" />}
                                borderRadius="md"
                              />
                              <VStack align="start" spacing={0.5} flex={1} minW={0}>
                                <HStack spacing={1.5} wrap="wrap">
                                  <Badge
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.2}
                                    borderRadius="md"
                                    colorScheme="blue"
                                    variant="subtle"
                                  >
                                    {app.appCode || app.appShortName || "NO CODE"}
                                  </Badge>
                                  {isCritical && (
                                    <Badge
                                      colorScheme="red"
                                      variant="solid"
                                      fontSize="2xs"
                                      px={1.5}
                                      py={0.2}
                                      borderRadius="md"
                                    >
                                      Tier 1
                                    </Badge>
                                  )}
                                </HStack>
                                <StatusBadge status={app.appsStatus || "ACTIVE"} fontSize="2xs" />
                              </VStack>
                            </HStack>

                            {/* Application Name */}
                            <VStack align="start" spacing={0.5} w="full">
                              <Text
                                fontWeight="bold"
                                fontSize="xs"
                                noOfLines={2}
                                color={isDark ? "white" : "gray.800"}
                                title={app.appName}
                                lineHeight="shorter"
                              >
                                <HighlightText text={app.appName || "Unnamed App"} query={debouncedSearch} />
                              </Text>
                              {app.appShortName && (
                                <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                                  Alias: <HighlightText text={app.appShortName} query={debouncedSearch} />
                                </Text>
                              )}
                            </VStack>

                            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />

                            {/* Group & Projects Meta */}
                            <HStack justify="space-between" w="full" fontSize="2xs" color="gray.500">
                              <HStack spacing={1} maxW="70%">
                                <Icon as={FiUsers} />
                                <Text noOfLines={1} title={app.appManageByGroupName || "-"}>
                                  {app.appManageByGroupName || "Unassigned"}
                                </Text>
                              </HStack>

                              {typeof app.countProjectAll === "number" && (
                                <HStack spacing={1}>
                                  <Icon as={FiLayers} />
                                  <Text>{app.countProjectAll} Proyek</Text>
                                </HStack>
                              )}
                            </HStack>

                            {isOtherApp && !allowOtherCategory && (
                              <Badge colorScheme="red" variant="subtle" fontSize="2xs" w="full" textAlign="center">
                                Tidak dapat dipilih
                              </Badge>
                            )}
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
                        <Th>Aplikasi</Th>
                        <Th>Group Pengelola</Th>
                        <Th>Kritikalitas</Th>
                        <Th>Status</Th>
                        <Th w="100px" textAlign="center">
                          Aksi
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {apps.map((app, idx) => {
                        const isSelected = tempSelectedApp?.id === app.id;
                        const isOtherApp =
                          app.appCode?.toUpperCase().includes("OTHER") ||
                          app.appShortName?.toUpperCase().includes("OTHER");
                        const isCritical =
                          app.appIsCritical?.toUpperCase() === "Y" ||
                          app.appIsCritical?.toUpperCase() === "TRUE" ||
                          app.appIsCritical === "1";
                        const rowNum = pageIndex * pageSize + idx + 1;

                        return (
                          <Tr
                            key={app.id}
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
                            cursor={isOtherApp && !allowOtherCategory ? "not-allowed" : "pointer"}
                            onClick={() => handleSelectApp(app)}
                          >
                            <Td textAlign="center" fontSize="xs" color="gray.500">
                              {rowNum}
                            </Td>
                            <Td>
                              <HStack spacing={2.5}>
                                <Avatar
                                  size="xs"
                                  name={app.appShortName || app.appName}
                                  src={app.iconApps || undefined}
                                  bg={isCritical ? "red.600" : "secondary.600"}
                                  color="white"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" fontSize="xs">
                                    <HighlightText text={app.appName} query={debouncedSearch} />
                                  </Text>
                                  <HStack spacing={1}>
                                    <Badge fontSize="2xs" colorScheme="blue" variant="subtle">
                                      {app.appCode || "NO CODE"}
                                    </Badge>
                                    {app.appShortName && (
                                      <Text fontSize="2xs" color="gray.500">
                                        ({app.appShortName})
                                      </Text>
                                    )}
                                  </HStack>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td fontSize="xs">
                              {app.appManageByGroupName || "—"}
                            </Td>
                            <Td>
                              {isCritical ? (
                                <Badge colorScheme="red" variant="solid" fontSize="2xs">
                                  Tier 1 / Critical
                                </Badge>
                              ) : (
                                <Badge colorScheme="gray" variant="subtle" fontSize="2xs">
                                  Standard
                                </Badge>
                              )}
                            </Td>
                            <Td>
                              <StatusBadge status={app.appsStatus || "ACTIVE"} fontSize="2xs" />
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
                                  isDisabled={isOtherApp && !allowOtherCategory}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectApp(app);
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
                    Menampilkan <b>{startItem}-{endItem}</b> dari <b>{totalCount}</b> aplikasi
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
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
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
          {/* Selected App Indicator */}
          <HStack spacing={2}>
            {tempSelectedApp ? (
              <HStack spacing={2} bg={isDark ? "blue.900" : "blue.50"} px={3} py={1.5} borderRadius="md" border="1px solid" borderColor="blue.300">
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="xs" fontWeight="semibold" color={isDark ? "blue.200" : "blue.800"}>
                  Terpilih: {tempSelectedApp.appName} ({tempSelectedApp.appShortName || tempSelectedApp.appCode || "No Code"})
                </Text>
              </HStack>
            ) : (
              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                Belum ada aplikasi yang dipilih
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
              isDisabled={!tempSelectedApp}
              onClick={handleConfirmSelect}
            >
              Pilih Product
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
