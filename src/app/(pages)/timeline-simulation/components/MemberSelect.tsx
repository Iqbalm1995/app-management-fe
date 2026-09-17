"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  AvatarGroup,
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
  Spinner,
  Text,
  Tooltip,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiCheck, FiPlus, FiSearch, FiTrash2, FiUser, FiX } from "react-icons/fi";
import useProjects from "@/app/services/useProjects";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import { SimulationMember } from "../types";
import { getRuleForProjectCount, UserWorkloadRecord } from "../utils/workloadHelper";

interface MemberSelectProps {
  token: string;
  projectId?: string | null;
  value: SimulationMember[];
  onChange: (members: SimulationMember[]) => void;
  workloadMap?: Map<string, UserWorkloadRecord>;
  placeholder?: string;
}

/**
 * Lightweight type-to-search member selector matching the Requirement module pattern.
 * Does NOT preload large user lists upfront. Only queries when typing >= 2 characters.
 */
const MemberSelect = ({
  token,
  projectId,
  value = [],
  onChange,
  workloadMap,
  placeholder = "Cari nama atau ID personel (ketik min. 2 karakter)...",
}: MemberSelectProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { GetProjectMembers } = useProjects();
  const { List: ListUsers } = useUsers();

  const listUsersRef = useRef(ListUsers);
  listUsersRef.current = ListUsers;
  const getProjectMembersRef = useRef(GetProjectMembers);
  getProjectMembersRef.current = GetProjectMembers;
  const workloadMapRef = useRef(workloadMap);
  workloadMapRef.current = workloadMap;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SimulationMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input by 300ms to avoid flooding API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Execute search strictly when debouncedQuery changes and has at least 2 chars
  useEffect(() => {
    let cancelled = false;

    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    if (!activeToken) return;

    setIsSearching(true);

    const executeSearch = async () => {
      try {
        let projectResults: SimulationMember[] = [];
        if (projectId) {
          const pRes = await getProjectMembersRef.current(projectId, activeToken);
          if (!cancelled && pRes?.statusCode === RES_CODE_OK && Array.isArray(pRes.data)) {
            projectResults = pRes.data
              .map((ua) => {
                const u = ua.userData;
                const uid = u?.id || ua.userId || ua.id;
                const uName = u?.nama || ua.userId || "Member";
                const wl = workloadMapRef.current?.get(uid);
                return {
                  id: uid,
                  name: uName,
                  email: u?.email,
                  nip: u?.nip,
                  role: u?.jabatan,
                  profilePict: u?.profilePict,
                  activeProjectCount: wl?.projectCount ?? 1,
                  assignedProjectNames: wl?.projectNames ?? [],
                };
              })
              .filter(
                (m) =>
                  m.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                  (m.nip && m.nip.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
                  (m.role && m.role.toLowerCase().includes(debouncedQuery.toLowerCase()))
              );
          }
        }

        const userRes = await listUsersRef.current(
          {
            search: debouncedQuery,
            limit: 8,
            page: 0,
            filterWhere: [],
            fieldOrder: ["nama"],
            orderDir: "asc",
          },
          activeToken
        );

        if (cancelled) return;

        let globalResults: SimulationMember[] = [];
        if (userRes?.statusCode === RES_CODE_OK && Array.isArray(userRes.data)) {
          globalResults = userRes.data.map((u: UsersResponse) => {
            const wl = workloadMapRef.current?.get(u.id);
            return {
              id: u.id,
              name: u.nama,
              email: u.email,
              nip: u.nip,
              role: u.jabatan || undefined,
              profilePict: u.profilePict,
              activeProjectCount: wl?.projectCount ?? 1,
              assignedProjectNames: wl?.projectNames ?? [],
            };
          });
        }

        const seenIds = new Set<string>();
        const combined: SimulationMember[] = [];
        for (const m of [...projectResults, ...globalResults]) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            combined.push(m);
          }
        }

        if (!cancelled) {
          setSearchResults(combined);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    executeSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, projectId, token]);

  const isSelected = (id: string) => value.some((v) => v.id === id);

  const handleAddMember = (m: SimulationMember) => {
    if (!isSelected(m.id)) {
      onChange([...value, m]);
    }
  };

  const handleRemoveMember = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  return (
    <Box w="100%">
      {/* Header and Source indicator */}
      <HStack justify="space-between" mb={1.5}>
        <HStack spacing={2}>
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={isDark ? "gray.300" : "gray.700"}>
            Assigned Members
          </Text>
          <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} fontSize="3xs">
            {value.length} Terpilih
          </Badge>
        </HStack>
        <Text fontSize="3xs" color="gray.500">
          Ketik nama untuk mencari
        </Text>
      </HStack>

      {/* Selected Members Section */}
      {value.length > 0 && (
        <Box
          p={2.5}
          mb={2.5}
          bg={isDark ? "whiteAlpha.50" : "gray.50"}
          border="1px solid"
          borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
          rounded="lg"
        >
          {/* Header: if > 1 make it AvatarGroup, else single avatar */}
          <HStack justify="space-between" align="center" mb={2}>
            <HStack spacing={2} minW="0">
              {value.length > 1 ? (
                <AvatarGroup size="2xs" max={5} spacing="-2">
                  {value.map((m) => (
                    <Tooltip
                      key={m.id}
                      label={`${m.name}${m.role ? ` (${m.role})` : ""}${
                        (m.activeProjectCount ?? 1) >= 2
                          ? ` • ${m.activeProjectCount} Proyek Aktif`
                          : ""
                      }`}
                      hasArrow
                      placement="top"
                    >
                      <Avatar
                        size="2xs"
                        boxSize="18px"
                        fontSize="8px"
                        name={m.name}
                        src={m.profilePict || undefined}
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              ) : (
                <Tooltip
                  label={`${value[0].name}${value[0].role ? ` (${value[0].role})` : ""}`}
                  hasArrow
                  placement="top"
                >
                  <Avatar
                    size="2xs"
                    boxSize="18px"
                    fontSize="8px"
                    name={value[0].name}
                    src={value[0].profilePict || undefined}
                  />
                </Tooltip>
              )}
              <Text fontSize="2xs" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"} isTruncated>
                {value.length > 1 ? `${value.length} Personel Terpilih` : value[0].name}
              </Text>
            </HStack>

            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              fontSize="3xs"
              h="20px"
              px={1.5}
              onClick={() => onChange([])}
            >
              {value.length > 1 ? "Hapus Semua" : "Hapus"}
            </Button>
          </HStack>

          {/* Member chips with compact mini-avatar icons */}
          <Wrap spacing={1.5}>
            {value.map((m) => {
              const pCount = m.activeProjectCount ?? 1;
              const rule = getRuleForProjectCount(pCount);
              return (
                <WrapItem key={m.id}>
                  <HStack
                    bg={isDark ? "gray.750" : "white"}
                    border="1px solid"
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    rounded="full"
                    pl={1}
                    pr={1.5}
                    py={0.5}
                    spacing={1.5}
                    shadow="xs"
                  >
                    <Avatar
                      size="2xs"
                      boxSize="18px"
                      fontSize="8px"
                      name={m.name}
                      src={m.profilePict || undefined}
                    />
                    <Text fontSize="xs" fontWeight="semibold" maxW="120px" isTruncated>
                      {m.name}
                    </Text>
                    {pCount >= 2 && (
                      <Badge colorScheme={rule.color} fontSize="4xs" rounded="xs" px={1}>
                        {pCount}P
                      </Badge>
                    )}
                    <IconButton
                      aria-label="Remove member"
                      icon={<FiX size={10} />}
                      size="xs"
                      w="16px"
                      h="16px"
                      minW="16px"
                      rounded="full"
                      variant="ghost"
                      colorScheme="gray"
                      onClick={() => handleRemoveMember(m.id)}
                    />
                  </HStack>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>
      )}

      {/* Type-to-Search Input */}
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" boxSize={3.5} />
        </InputLeftElement>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          rounded="lg"
          focusBorderColor="blue.500"
          borderColor={isDark ? "gray.600" : "gray.300"}
          fontSize="xs"
        />
        {searchTerm && (
          <InputRightElement>
            {isSearching ? (
              <Spinner size="xs" color="blue.500" />
            ) : (
              <IconButton
                aria-label="Clear search"
                icon={<FiX size={12} />}
                size="xs"
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
              />
            )}
          </InputRightElement>
        )}
      </InputGroup>

      {/* Search Results Dropdown (Type first then load) */}
      {searchTerm.trim().length >= 2 && (
        <Box
          mt={1.5}
          maxH="220px"
          overflowY="auto"
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          rounded="lg"
          bg={isDark ? "gray.800" : "white"}
          shadow="lg"
          p={1.5}
        >
          {isSearching ? (
            <HStack justify="center" p={4} spacing={2}>
              <Spinner size="xs" color="blue.500" />
              <Text fontSize="xs" color="gray.500">
                Mencari personel di direktori...
              </Text>
            </HStack>
          ) : searchResults.length === 0 ? (
            <Box p={3} textAlign="center">
              <Text fontSize="xs" color="gray.500">
                Tidak ada personel yang cocok dengan &ldquo;{searchTerm}&rdquo;
              </Text>
            </Box>
          ) : (
            <VStack spacing={1} align="stretch">
              {searchResults.map((user) => {
                const selected = isSelected(user.id);
                const pCount = user.activeProjectCount ?? 1;
                const rule = getRuleForProjectCount(pCount);
                return (
                  <Flex
                    key={user.id}
                    justify="space-between"
                    align="center"
                    p={2}
                    rounded="md"
                    _hover={{ bg: isDark ? "whiteAlpha.100" : "blue.50" }}
                    transition="background 0.15s ease"
                    border="1px solid"
                    borderColor={selected ? (isDark ? "blue.600" : "blue.200") : "transparent"}
                    bg={selected ? (isDark ? "blue.950" : "blue.50") : undefined}
                  >
                    <HStack spacing={2.5} minW="0">
                      <Avatar
                        size="2xs"
                        boxSize="20px"
                        fontSize="9px"
                        name={user.name}
                        src={user.profilePict || undefined}
                      />
                      <VStack align="start" spacing={0} minW="0">
                        <HStack spacing={1.5}>
                          <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                            {user.name}
                          </Text>
                          <Badge
                            colorScheme={rule.color}
                            fontSize="4xs"
                            rounded="xs"
                            px={1.5}
                            title={user.assignedProjectNames?.join(", ")}
                          >
                            {rule.badgeLabel}
                          </Badge>
                        </HStack>
                        <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                          {user.role || user.nip || user.email || "Personel"}
                        </Text>
                      </VStack>
                    </HStack>

                    {selected ? (
                      <HStack spacing={1.5}>
                        <Badge colorScheme="green" fontSize="3xs" rounded="md" px={2} py={0.5}>
                          <HStack spacing={1}>
                            <Icon as={FiCheck} />
                            <Text>Terpilih</Text>
                          </HStack>
                        </Badge>
                        <IconButton
                          aria-label="Remove"
                          icon={<FiTrash2 size={12} />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveMember(user.id)}
                        />
                      </HStack>
                    ) : (
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="solid"
                        leftIcon={<FiPlus />}
                        rounded="md"
                        onClick={() => handleAddMember(user)}
                      >
                        Tambah
                      </Button>
                    )}
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>
      )}

      {/* Typing helper prompt when typing only 1 character */}
      {searchTerm.trim().length === 1 && (
        <Text fontSize="3xs" color="gray.500" mt={1} pl={1}>
          Ketik minimal 2 karakter untuk memulai pencarian...
        </Text>
      )}
    </Box>
  );
};

export default MemberSelect;
