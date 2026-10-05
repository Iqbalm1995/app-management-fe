"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
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
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiLayers,
  FiSearch,
  FiShield,
  FiStar,
  FiX,
} from "react-icons/fi";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ApplicationOption, EosIncidentItem, INITIAL_APPLICATIONS } from "../types";

const FETCH_ALL_LIMIT = 500;
const STORAGE_KEY_FAVORITES = "eos_favorite_app_ids";

type FilterCriticality = "ALL" | "FAVORITES" | "CRITICAL" | "NOT_CRITICAL";

interface ApplicationSearchDropdownProps {
  selectedAppId: string;
  onSelectApp: (app: ApplicationOption) => void;
  incidentsList?: EosIncidentItem[];
  triggerVariant?: "header" | "form";
  minW?: any;
  w?: any;
  onSelectedAppLoaded?: (app: ApplicationOption) => void;
  tokenData?: string;
}

export default function ApplicationSearchDropdown({
  selectedAppId,
  onSelectApp,
  incidentsList = [],
  triggerVariant = "header",
  minW,
  w,
  onSelectedAppLoaded,
  tokenData,
}: ApplicationSearchDropdownProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const {
    isOpen: isPopoverOpen,
    onOpen: onOpenPopover,
    onClose: onClosePopover,
  } = useDisclosure();

  const { List: ListApps } = useApps();
  const listAppsRef = useRef(ListApps);
  listAppsRef.current = ListApps;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const [applications, setApplications] = useState<ApplicationOption[]>(INITIAL_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [criticalityFilter, setCriticalityFilter] = useState<FilterCriticality>("ALL");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Favorite App IDs with localStorage persistence
  const [favoriteAppIds, setFavoriteAppIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.error("Failed to parse favorite apps from localStorage:", err);
      }
    }
    return ["1"]; // Default initial favorite app
  });

  const toggleFavorite = (appId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setFavoriteAppIds((prev) => {
      const isFav = prev.includes(appId);
      const next = isFav ? prev.filter((id) => id !== appId) : [...prev, appId];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(next));
        } catch (err) {
          console.error("Failed to save favorite apps to localStorage:", err);
        }
      }
      return next;
    });
  };

  // Map API response to ApplicationOption format
  const mapApiAppsToOptions = useCallback(
    (apiApps: ApplicationMasterResponse[]): ApplicationOption[] => {
      return apiApps.map((app) => {
        const openCount = incidentsList.filter(
          (i) =>
            (i.appId === app.id || i.appCode === app.appShortName || i.appCode === app.appCode) &&
            i.statusIncident === "Open"
        ).length;
        const totalCount = incidentsList.filter(
          (i) => i.appId === app.id || i.appCode === app.appShortName || i.appCode === app.appCode
        ).length;

        const isCritical =
          app.appIsCritical?.toUpperCase() === "Y" ||
          app.appIsCritical?.toUpperCase() === "TRUE" ||
          app.appIsCritical === "1";

        return {
          id: app.id,
          name: app.appName,
          code: app.appShortName || app.appCode || "APP",
          tier: isCritical ? "Critical" : "Not Critical",
          division: app.appManageByDivisionName || app.appOwnerDivisionName || "Divisi TI",
          owner: (app as any).appManagePicName || (app as any).appOwnerPicName || "IT PIC",
          openIncidentsCount: openCount,
          totalIncidentsCount: totalCount,
        };
      });
    },
    [incidentsList]
  );

  // Core search execution function calling v1/Application/list
  const executeSearch = useCallback(
    async (searchTerm: string) => {
      const token =
        tokenData ||
        (typeof window !== "undefined"
          ? localStorage.getItem("tokenData") || localStorage.getItem("token") || ""
          : "");

      if (!token) {
        const fallback = INITIAL_APPLICATIONS.filter(
          (a) =>
            !searchTerm.trim() ||
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.division.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (isMountedRef.current) {
          setApplications(fallback);
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);
      try {
        const payload: PaggingListPayload = {
          search: searchTerm.trim(),
          limit: FETCH_ALL_LIMIT,
          page: 0,
          filterWhere: [],
          fieldOrder: ["appName"],
          orderDir: "asc",
        };

        const res = await listAppsRef.current(payload, token);

        if (!isMountedRef.current) return;

        if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = mapApiAppsToOptions(res.data);
          setApplications(mapped);
        } else {
          const fallback = INITIAL_APPLICATIONS.filter(
            (a) =>
              !searchTerm.trim() ||
              a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.code.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setApplications(fallback);
        }
      } catch (err) {
        console.error("Failed to fetch applications with debouncer:", err);
        if (isMountedRef.current) {
          const fallback = INITIAL_APPLICATIONS.filter(
            (a) =>
              !searchTerm.trim() ||
              a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.code.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setApplications(fallback);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSearching(false);
        }
      }
    },
    [mapApiAppsToOptions, tokenData]
  );

  // Initial fetch on mount & cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    executeSearch("");

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [executeSearch]);

  // Debounced input change handler (350ms delay)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(value);
    }, 350);
  };

  // Immediate clear handler
  const handleClearSearch = () => {
    setSearchQuery("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeSearch("");
  };

  // Find currently selected app or default
  const selectedApp: ApplicationOption = useMemo(() => {
    return (
      applications.find((a) => a.id === selectedAppId) ||
      INITIAL_APPLICATIONS.find((a) => a.id === selectedAppId) ||
      applications[0] ||
      INITIAL_APPLICATIONS[0]
    );
  }, [applications, selectedAppId]);

  // Notify parent of selected app whenever it changes/loads
  useEffect(() => {
    if (selectedApp && onSelectedAppLoaded) {
      onSelectedAppLoaded(selectedApp);
    }
  }, [selectedApp, onSelectedAppLoaded]);

  const handleSelect = (app: ApplicationOption) => {
    onSelectApp(app);
    onClosePopover();
  };

  // Filtered applications based on search + favorite + criticality chips
  const displayedApps = useMemo(() => {
    const filtered = applications.filter((app) => {
      if (criticalityFilter === "FAVORITES") {
        return favoriteAppIds.includes(app.id);
      }
      if (criticalityFilter === "CRITICAL") {
        return app.tier === "Critical";
      }
      if (criticalityFilter === "NOT_CRITICAL") {
        return app.tier !== "Critical";
      }
      return true;
    });

    // When viewing "ALL", sort favorites to the top
    if (criticalityFilter === "ALL") {
      return [...filtered].sort((a, b) => {
        const aFav = favoriteAppIds.includes(a.id);
        const bFav = favoriteAppIds.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    }

    return filtered;
  }, [applications, criticalityFilter, favoriteAppIds]);

  const favoriteCount = useMemo(() => {
    return applications.filter((a) => favoriteAppIds.includes(a.id)).length;
  }, [applications, favoriteAppIds]);

  const criticalCount = useMemo(() => {
    return applications.filter((a) => a.tier === "Critical").length;
  }, [applications]);

  const nonCriticalCount = useMemo(() => {
    return applications.filter((a) => a.tier !== "Critical").length;
  }, [applications]);

  // Generate 2-letter monogram for avatar
  const getAppInitials = (name: string, code: string) => {
    if (code && code.length >= 2 && code !== "APP") {
      return code.slice(0, 2).toUpperCase();
    }
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isCriticalApp = selectedApp.tier === "Critical";
  const isSelectedFav = favoriteAppIds.includes(selectedApp.id);

  return (
    <Popover
      isOpen={isPopoverOpen}
      onClose={onClosePopover}
      placement="bottom-start"
      closeOnBlur={true}
      isLazy
    >
      <PopoverTrigger>
        {triggerVariant === "header" ? (
          /* ════════════════════════════════════════════════════════════
             COMPACT FROSTED GLASS HEADER TRIGGER
             ════════════════════════════════════════════════════════════ */
          <Box
            as="button"
            type="button"
            minW={minW || { base: "auto", sm: "200px", md: "240px" }}
            maxW={{ base: "full", md: "300px" }}
            h="32px"
            w={w}
            bg="whiteAlpha.150"
            color="white"
            backdropFilter="blur(8px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
            rounded="lg"
            px={2.5}
            shadow="xs"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            textAlign="left"
            transition="all 0.15s ease"
            _hover={{
              bg: "whiteAlpha.250",
              borderColor: "whiteAlpha.450",
            }}
            _active={{
              bg: "whiteAlpha.300",
              transform: "scale(0.98)",
            }}
            onClick={onOpenPopover}
            aria-label="Pilih Aplikasi EOS"
          >
            <HStack spacing={2} overflow="hidden" align="center" flex={1}>
              {/* Star Indicator if selected app is favorite */}
              {isSelectedFav && (
                <Icon
                  as={FiStar}
                  boxSize={3}
                  fill="#ECC94B"
                  color="yellow.300"
                  flexShrink={0}
                  title="Aplikasi Favorit"
                />
              )}

              {/* App Monogram Avatar */}
              <Flex
                align="center"
                justify="center"
                boxSize="20px"
                rounded="md"
                bg={isCriticalApp ? "red.500" : "whiteAlpha.250"}
                color="white"
                flexShrink={0}
                fontWeight="800"
                fontSize="9px"
                fontFamily="mono"
              >
                {getAppInitials(selectedApp.name, selectedApp.code)}
              </Flex>

              <Text
                fontSize="xs"
                fontWeight="bold"
                color="white"
                noOfLines={1}
                title={selectedApp.name}
              >
                {selectedApp.name}
              </Text>

              <Text
                fontSize="9px"
                fontWeight="semibold"
                color="whiteAlpha.900"
                fontFamily="mono"
                bg="whiteAlpha.200"
                px={1.5}
                py={0.2}
                rounded="sm"
                flexShrink={0}
              >
                {selectedApp.code}
              </Text>
            </HStack>

            <HStack spacing={1.5} flexShrink={0} ml={2}>
              <Badge
                bg={isCriticalApp ? "red.500" : "whiteAlpha.250"}
                color="white"
                fontSize="9px"
                px={1.5}
                py={0.2}
                rounded="full"
                fontWeight="bold"
                letterSpacing="tight"
              >
                {selectedApp.tier}
              </Badge>
              <Icon
                as={FiChevronDown}
                color="whiteAlpha.800"
                boxSize={3.5}
                transition="transform 0.2s ease"
                transform={isPopoverOpen ? "rotate(180deg)" : "rotate(0deg)"}
              />
            </HStack>
          </Box>
        ) : (
          /* ════════════════════════════════════════════════════════════
             ELEVATED FORM TRIGGER (Designed for Create / Edit Forms)
             ════════════════════════════════════════════════════════════ */
          <Box
            as="button"
            type="button"
            w={w || "full"}
            bg={isDark ? "secondary.800" : "white"}
            color={isDark ? "white" : "gray.800"}
            border="1px solid"
            borderColor={isDark ? "secondary.700" : "blue.200"}
            rounded="xl"
            p={2.5}
            shadow="xs"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            textAlign="left"
            transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            _hover={{
              borderColor: "blue.400",
              shadow: "sm",
              bg: isDark ? "secondary.750" : "blue.50",
            }}
            _active={{
              transform: "scale(0.99)",
            }}
            onClick={onOpenPopover}
            aria-label="Pilih Aplikasi EOS"
          >
            <HStack spacing={3} overflow="hidden" align="center" flex={1}>
              {isSelectedFav && (
                <Icon
                  as={FiStar}
                  boxSize={3.5}
                  fill="#ECC94B"
                  color="yellow.400"
                  flexShrink={0}
                  title="Aplikasi Favorit"
                />
              )}

              <Flex
                align="center"
                justify="center"
                boxSize="36px"
                rounded="lg"
                bg={isCriticalApp ? (isDark ? "red.900" : "red.50") : (isDark ? "blue.900" : "blue.50")}
                color={isCriticalApp ? (isDark ? "red.200" : "red.600") : (isDark ? "blue.200" : "blue.600")}
                border="1px solid"
                borderColor={isCriticalApp ? "red.200" : "blue.200"}
                flexShrink={0}
                fontWeight="800"
                fontSize="xs"
                fontFamily="mono"
              >
                {getAppInitials(selectedApp.name, selectedApp.code)}
              </Flex>

              <VStack align="start" spacing={0.5} overflow="hidden" flex={1}>
                <HStack spacing={2} w="full" align="center">
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={isDark ? "white" : "gray.800"}
                    noOfLines={1}
                  >
                    {selectedApp.name}
                  </Text>
                  <Text
                    fontSize="10px"
                    fontWeight="semibold"
                    color={isDark ? "gray.400" : "gray.500"}
                    fontFamily="mono"
                    bg={isDark ? "secondary.700" : "gray.100"}
                    px={1.5}
                    py={0.2}
                    rounded="md"
                    flexShrink={0}
                  >
                    {selectedApp.code}
                  </Text>
                </HStack>
                <Text fontSize="11px" color="gray.500" noOfLines={1}>
                  Owner: {selectedApp.owner} • {selectedApp.division}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2} flexShrink={0} ml={2}>
              <Badge
                colorScheme={isCriticalApp ? "red" : "blue"}
                fontSize="10px"
                px={2.5}
                py={0.5}
                rounded="full"
                variant="subtle"
                fontWeight="bold"
              >
                {selectedApp.tier}
              </Badge>
              <Icon
                as={FiChevronDown}
                color="gray.400"
                boxSize={4}
                transition="transform 0.2s ease"
                transform={isPopoverOpen ? "rotate(180deg)" : "rotate(0deg)"}
              />
            </HStack>
          </Box>
        )}
      </PopoverTrigger>

      {/* ════════════════════════════════════════════════════════════
         PORTALED COMMAND-PALETTE POPOVER CONTENT
         ════════════════════════════════════════════════════════════ */}
      <Portal>
        <PopoverContent
          zIndex={9999}
          w={{ base: "320px", sm: "460px", md: "520px" }}
          bg={isDark ? "secondary.900" : "white"}
          borderColor={isDark ? "secondary.700" : "blue.200"}
          shadow="2xl"
          rounded="2xl"
          overflow="hidden"
          _focus={{ outline: "none", boxShadow: "2xl" }}
        >
          <PopoverArrow bg={isDark ? "secondary.900" : "white"} />

          {/* Search Bar + Quick Filter Ribbon Header */}
          <PopoverHeader
            pt={3.5}
            pb={3}
            px={3.5}
            borderBottom="1px solid"
            borderColor={isDark ? "secondary.800" : "gray.100"}
            bg={isDark ? "secondary.850" : "gray.50"}
          >
            <VStack align="stretch" spacing={2.5}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="blue.500" boxSize={3.5} />
                </InputLeftElement>
                <Input
                  autoFocus
                  rounded="lg"
                  bg={isDark ? "secondary.900" : "white"}
                  borderColor={isDark ? "secondary.700" : "gray.200"}
                  fontSize="xs"
                  placeholder="Cari nama aplikasi, kode shortname, divisi..."
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <InputRightElement>
                  {isSearching ? (
                    <Spinner size="xs" color="blue.500" speed="0.6s" />
                  ) : searchQuery ? (
                    <IconButton
                      aria-label="Hapus pencarian"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "gray.700" }}
                      onClick={handleClearSearch}
                    />
                  ) : (
                    <Text
                      fontSize="9px"
                      color="gray.400"
                      fontWeight="bold"
                      fontFamily="mono"
                      bg={isDark ? "secondary.800" : "gray.100"}
                      px={1.5}
                      py={0.5}
                      rounded="sm"
                      mr={1}
                    >
                      ESC
                    </Text>
                  )}
                </InputRightElement>
              </InputGroup>

              {/* Quick Filter Segmented Pills (Semua, Favorit, Critical, Not Critical) */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <HStack spacing={1.5} wrap="wrap">
                  <Button
                    size="xs"
                    rounded="full"
                    px={2.5}
                    h="22px"
                    fontSize="10px"
                    fontWeight="bold"
                    variant={criticalityFilter === "ALL" ? "solid" : "ghost"}
                    colorScheme={criticalityFilter === "ALL" ? "blue" : "gray"}
                    onClick={() => setCriticalityFilter("ALL")}
                  >
                    Semua ({applications.length})
                  </Button>
                  <Button
                    size="xs"
                    rounded="full"
                    px={2.5}
                    h="22px"
                    fontSize="10px"
                    fontWeight="bold"
                    variant={criticalityFilter === "FAVORITES" ? "solid" : "ghost"}
                    colorScheme={criticalityFilter === "FAVORITES" ? "yellow" : "gray"}
                    leftIcon={
                      <Icon
                        as={FiStar}
                        boxSize={2.5}
                        fill={criticalityFilter === "FAVORITES" ? "#ECC94B" : "transparent"}
                        color={criticalityFilter === "FAVORITES" ? "yellow.500" : "gray.400"}
                      />
                    }
                    onClick={() => setCriticalityFilter("FAVORITES")}
                  >
                    Favorit ({favoriteCount})
                  </Button>
                  <Button
                    size="xs"
                    rounded="full"
                    px={2.5}
                    h="22px"
                    fontSize="10px"
                    fontWeight="bold"
                    variant={criticalityFilter === "CRITICAL" ? "solid" : "ghost"}
                    colorScheme={criticalityFilter === "CRITICAL" ? "red" : "gray"}
                    onClick={() => setCriticalityFilter("CRITICAL")}
                  >
                    Critical ({criticalCount})
                  </Button>
                  <Button
                    size="xs"
                    rounded="full"
                    px={2.5}
                    h="22px"
                    fontSize="10px"
                    fontWeight="bold"
                    variant={criticalityFilter === "NOT_CRITICAL" ? "solid" : "ghost"}
                    colorScheme={criticalityFilter === "NOT_CRITICAL" ? "teal" : "gray"}
                    onClick={() => setCriticalityFilter("NOT_CRITICAL")}
                  >
                    Not Critical ({nonCriticalCount})
                  </Button>
                </HStack>

                <Text fontSize="10px" color="gray.500" fontWeight="medium">
                  {isSearching ? "Sinkronisasi..." : `${displayedApps.length} item`}
                </Text>
              </Flex>
            </VStack>
          </PopoverHeader>

          {/* Application List Container with custom scrollbar */}
          <PopoverBody
            maxH="340px"
            overflowY="auto"
            p={2}
            css={{
              "&::-webkit-scrollbar": {
                width: "5px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: isDark ? "#2D3748" : "#CBD5E0",
                borderRadius: "4px",
              },
            }}
          >
            {isSearching ? (
              <VStack py={10} spacing={3} align="center">
                <Spinner size="md" color="blue.500" thickness="3px" speed="0.7s" />
                <VStack spacing={0.5}>
                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.700"}>
                    Mengambil master aplikasi...
                  </Text>
                  <Text fontSize="11px" color="gray.500">
                    Memuat data real-time dari database
                  </Text>
                </VStack>
              </VStack>
            ) : displayedApps.length === 0 ? (
              <VStack py={10} spacing={3} align="center" textAlign="center" px={4}>
                <Box
                  p={3}
                  rounded="full"
                  bg={isDark ? "secondary.800" : "gray.100"}
                  color="gray.400"
                >
                  <Icon as={criticalityFilter === "FAVORITES" ? FiStar : FiLayers} boxSize={5} />
                </Box>
                <VStack spacing={1}>
                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.700"}>
                    {criticalityFilter === "FAVORITES"
                      ? "Belum Ada Aplikasi Favorit"
                      : "Aplikasi Tidak Ditemukan"}
                  </Text>
                  <Text fontSize="11px" color="gray.500">
                    {criticalityFilter === "FAVORITES"
                      ? "Klik ikon bintang (☆) pada aplikasi untuk menambahkan ke daftar favorit Anda."
                      : `Tidak ada aplikasi yang cocok dengan kata kunci "${searchQuery}"`}
                  </Text>
                </VStack>
                {(searchQuery || criticalityFilter !== "ALL") && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    rounded="md"
                    mt={1}
                    onClick={() => {
                      setSearchQuery("");
                      setCriticalityFilter("ALL");
                      executeSearch("");
                    }}
                  >
                    Reset Filter &amp; Pencarian
                  </Button>
                )}
              </VStack>
            ) : (
              <VStack align="stretch" spacing={1.5}>
                {displayedApps.map((app) => {
                  const isSelected = app.id === selectedAppId;
                  const isCritical = app.tier === "Critical";
                  const isFav = favoriteAppIds.includes(app.id);

                  return (
                    <Box
                      key={app.id}
                      p={2.5}
                      rounded="xl"
                      cursor="pointer"
                      position="relative"
                      transition="all 0.15s ease"
                      bg={
                        isSelected
                          ? isDark
                            ? "blue.950"
                            : "blue.50"
                          : isDark
                          ? "secondary.900"
                          : "white"
                      }
                      border="1px solid"
                      borderColor={
                        isSelected
                          ? isDark
                            ? "blue.600"
                            : "blue.300"
                          : isDark
                          ? "secondary.800"
                          : "transparent"
                      }
                      _hover={{
                        bg: isDark
                          ? "secondary.800"
                          : isSelected
                          ? "blue.100"
                          : "gray.50",
                        borderColor: isSelected
                          ? isDark
                            ? "blue.500"
                            : "blue.400"
                          : isDark
                          ? "secondary.700"
                          : "gray.200",
                        transform: "translateX(2px)",
                      }}
                      _active={{
                        transform: "scale(0.99)",
                      }}
                      onClick={() => handleSelect(app)}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2.5} overflow="hidden" align="center" flex={1}>
                          {/* Star Favorite Button (Transparent when not favorited, Gold when favorited) */}
                          <IconButton
                            aria-label={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
                            icon={
                              <Icon
                                as={FiStar}
                                boxSize={3.5}
                                fill={isFav ? "#ECC94B" : "transparent"}
                                color={isFav ? "yellow.400" : isDark ? "gray.500" : "gray.300"}
                                strokeWidth={isFav ? 1.5 : 2}
                              />
                            }
                            size="xs"
                            variant="ghost"
                            colorScheme={isFav ? "yellow" : "gray"}
                            rounded="full"
                            minW="24px"
                            h="24px"
                            _hover={{
                              bg: isDark ? "whiteAlpha.150" : "yellow.50",
                              color: "yellow.400",
                              transform: "scale(1.15)",
                            }}
                            onClick={(e) => toggleFavorite(app.id, e)}
                            title={isFav ? "Favorit (klik untuk hapus)" : "Tambah ke favorit"}
                          />

                          {/* App Monogram Avatar */}
                          <Flex
                            align="center"
                            justify="center"
                            boxSize="34px"
                            rounded="lg"
                            bg={isCritical ? (isDark ? "red.950" : "red.50") : (isDark ? "blue.950" : "blue.50")}
                            color={isCritical ? (isDark ? "red.300" : "red.600") : (isDark ? "blue.300" : "blue.600")}
                            border="1px solid"
                            borderColor={isCritical ? (isDark ? "red.800" : "red.200") : (isDark ? "blue.800" : "blue.200")}
                            flexShrink={0}
                            fontWeight="800"
                            fontSize="xs"
                            fontFamily="mono"
                          >
                            {getAppInitials(app.name, app.code)}
                          </Flex>

                          <VStack align="start" spacing={0.5} overflow="hidden" flex={1}>
                            <HStack spacing={1.5} w="full" align="center">
                              <Text
                                fontSize="xs"
                                fontWeight={isSelected ? "800" : "semibold"}
                                color={isSelected ? (isDark ? "blue.300" : "blue.700") : isDark ? "white" : "gray.800"}
                                noOfLines={1}
                              >
                                {app.name}
                              </Text>
                              <Text
                                fontSize="10px"
                                fontWeight="semibold"
                                color="gray.500"
                                fontFamily="mono"
                                bg={isDark ? "secondary.800" : "gray.100"}
                                px={1.5}
                                py={0.2}
                                rounded="md"
                                flexShrink={0}
                              >
                                {app.code}
                              </Text>
                            </HStack>

                            <Text fontSize="10px" color="gray.500" noOfLines={1}>
                              PIC: <Text as="span" fontWeight="medium" color={isDark ? "gray.300" : "gray.600"}>{app.owner}</Text> • {app.division}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Right Meta (Tier Badge + Open Incidents + Selected Check) */}
                        <HStack spacing={2} flexShrink={0} ml={2}>
                          <Badge
                            colorScheme={isCritical ? "red" : "blue"}
                            fontSize="10px"
                            px={2}
                            py={0.5}
                            rounded="full"
                            variant="subtle"
                            fontWeight="bold"
                          >
                            {app.tier}
                          </Badge>

                          {app.openIncidentsCount > 0 && (
                            <Badge
                              colorScheme="red"
                              variant="solid"
                              rounded="full"
                              fontSize="9px"
                              px={1.5}
                              py={0.2}
                              title={`${app.openIncidentsCount} insiden open aktif`}
                            >
                              {app.openIncidentsCount} Open
                            </Badge>
                          )}

                          {isSelected ? (
                            <Flex
                              align="center"
                              justify="center"
                              boxSize="20px"
                              rounded="full"
                              bg="blue.500"
                              color="white"
                              flexShrink={0}
                            >
                              <Icon as={FiCheck} boxSize={3} strokeWidth={3} />
                            </Flex>
                          ) : (
                            <Box boxSize="20px" />
                          )}
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </PopoverBody>

          {/* Minimalist Command Palette Footer */}
          <PopoverFooter
            py={2}
            px={3.5}
            borderTop="1px solid"
            borderColor={isDark ? "secondary.800" : "gray.100"}
            bg={isDark ? "secondary.900" : "gray.50"}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={1.5} color="gray.400">
                <Icon as={FiActivity} boxSize={3} />
                <Text fontSize="10px">
                  Menampilkan {displayedApps.length} aplikasi operasional EOS
                </Text>
              </HStack>
              <Text fontSize="10px" color="gray.400" fontFamily="mono">
                Tekan <b>ESC</b> untuk batal
              </Text>
            </Flex>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
