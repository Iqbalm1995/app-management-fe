"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarBadge,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCheck,
  FiCpu,
  FiGlobe,
  FiPlusCircle,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { UsersResponse } from "@/app/services/useUsers";
import { CabCommitteeMember } from "@/app/types/cabTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "blue.500",
  "teal.500",
  "purple.500",
  "cyan.500",
  "green.500",
  "orange.500",
  "pink.500",
  "indigo.500",
];

const getAvatarColor = (name: string): string => {
  if (!name) return "gray.400";
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
};

type TabType = "IT" | "BJB" | "EXTERNAL";

interface CommitteeCabFieldProps {
  value: CabCommitteeMember[];
  onChange: (members: CabCommitteeMember[]) => void;
  fetchUsers: (search: string, token: string) => Promise<UsersResponse[]>;
  tokenData: string;
}

const CommitteeCabField = ({
  value = [],
  onChange,
  fetchUsers,
  tokenData,
}: CommitteeCabFieldProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Palette styling
  const bgCard = isDark ? "gray.800" : "white";
  const bgInner = isDark ? "gray.850" : "gray.50";
  const bgSubtle = isDark ? "gray.750" : "gray.100";
  const borderCol = isDark ? "gray.700" : "gray.200";
  const borderHighlight = isDark ? "blue.600" : "blue.300";
  const textMuted = isDark ? "gray.400" : "gray.500";
  const textHeading = isDark ? "white" : "gray.800";

  const [activeTab, setActiveTab] = useState<TabType>("IT");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UsersResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Forms for non-IT
  const [bjbForm, setBjbForm] = useState({ userName: "", asalDivisi: "" });
  const [externalForm, setExternalForm] = useState({ userName: "", asalInstitusi: "" });

  // Safe committee member list
  const memberList: CabCommitteeMember[] = Array.isArray(value) ? value : [];

  // Categorized counts
  const itCount = memberList.filter((m) => m.type === "INTERNAL_IT").length;
  const bjbCount = memberList.filter((m) => m.type === "INTERNAL_BJB").length;
  const externalCount = memberList.filter((m) => m.type === "EXTERNAL").length;

  const isAlreadyAdded = (id?: string, name?: string) =>
    memberList.some(
      (m) =>
        (id && m.userId === id) ||
        (name && m.userName.toLowerCase() === name.toLowerCase())
    );

  // Search IT users (real API)
  const handleSearchIT = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await fetchUsers(text, tokenData);
      setSearchResults(users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleIT = (user: UsersResponse) => {
    if (isAlreadyAdded(user.id, user.nama)) {
      // Deselect
      onChange(memberList.filter((m) => m.userId !== user.id && m.userName !== user.nama));
    } else {
      // Select
      onChange([
        ...memberList,
        {
          type: "INTERNAL_IT",
          userId: user.id,
          userName: user.nama,
          asalDivisi: user.namaUnitKerja || user.namaGroupKerja || "Divisi IT",
        },
      ]);
    }
  };

  // Add Free Text Internal BJB Member
  const handleAddBJB = () => {
    if (!bjbForm.userName.trim()) return;
    onChange([
      ...memberList,
      {
        type: "INTERNAL_BJB",
        userId: `bjb-${Date.now()}`,
        userName: bjbForm.userName.trim(),
        asalDivisi: bjbForm.asalDivisi.trim() || "-",
      },
    ]);
    setBjbForm({ userName: "", asalDivisi: "" });
  };

  // Add Free Text External Member
  const handleAddExternal = () => {
    if (!externalForm.userName.trim() || !externalForm.asalInstitusi.trim()) return;
    onChange([
      ...memberList,
      {
        type: "EXTERNAL",
        userName: externalForm.userName.trim(),
        asalInstitusi: externalForm.asalInstitusi.trim(),
      },
    ]);
    setExternalForm({ userName: "", asalInstitusi: "" });
  };

  const handleRemove = (idx: number) => {
    onChange(memberList.filter((_, i) => i !== idx));
  };

  const tabs: { key: TabType; label: string; icon: any; count: number; color: string }[] = [
    { key: "IT", label: "Internal IT", icon: FiCpu, count: itCount, color: "blue" },
    { key: "BJB", label: "Internal BJB", icon: FiBriefcase, count: bjbCount, color: "green" },
    { key: "EXTERNAL", label: "Eksternal", icon: FiGlobe, count: externalCount, color: "purple" },
  ];

  return (
    <Box
      bg={bgCard}
      borderRadius={radiusStyle}
      p={{ base: 4, md: 6 }}
      borderWidth={1}
      borderColor={borderCol}
      shadow="sm"
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} wrap="wrap" gap={3} mb={2}>
        <HStack spacing={2.5}>
          <Box
            p={2}
            borderRadius="lg"
            bg={isDark ? "purple.900" : "purple.50"}
            color={isDark ? "purple.300" : "purple.600"}
          >
            <Icon as={FiUsers} boxSize={5} />
          </Box>
          <Box>
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="md" color={textHeading}>
                Committee CAB
              </Text>
              <Badge colorScheme="purple" variant="solid" rounded="full" px={2.5} fontSize="2xs">
                {memberList.length} Terpilih
              </Badge>
            </HStack>
            <Text fontSize="xs" color={textMuted}>
              Pilih panelis / tim penilai yang hadir dan mengevaluasi permohonan dalam sidang CAB
            </Text>
          </Box>
        </HStack>

        {/* Quick Category Badges */}
        {memberList.length > 0 && (
          <HStack spacing={1.5} wrap="wrap">
            {itCount > 0 && (
              <Tag size="sm" colorScheme="blue" variant="subtle" rounded="full">
                <TagLeftIcon as={FiCpu} boxSize="10px" />
                <TagLabel fontSize="2xs">{itCount} IT</TagLabel>
              </Tag>
            )}
            {bjbCount > 0 && (
              <Tag size="sm" colorScheme="green" variant="subtle" rounded="full">
                <TagLeftIcon as={FiBriefcase} boxSize="10px" />
                <TagLabel fontSize="2xs">{bjbCount} BJB</TagLabel>
              </Tag>
            )}
            {externalCount > 0 && (
              <Tag size="sm" colorScheme="purple" variant="subtle" rounded="full">
                <TagLeftIcon as={FiGlobe} boxSize="10px" />
                <TagLabel fontSize="2xs">{externalCount} Eksternal</TagLabel>
              </Tag>
            )}
          </HStack>
        )}
      </Flex>

      {/* ─── Source Tab Selector (Card Pill Segment) ──────────────────────── */}
      <Box mt={4} mb={5}>
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2.5}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <Box
                key={tab.key}
                as="button"
                type="button"
                p={{ base: 3, md: 3.5 }}
                borderRadius="xl"
                borderWidth={1.5}
                w="full"
                borderColor={
                  isSelected
                    ? tab.color === "blue"
                      ? "blue.500"
                      : tab.color === "green"
                      ? "green.500"
                      : "purple.500"
                    : borderCol
                }
                bg={
                  isSelected
                    ? isDark
                      ? tab.color === "blue"
                        ? "blue.950"
                        : tab.color === "green"
                        ? "green.950"
                        : "purple.950"
                      : tab.color === "blue"
                      ? "blue.50"
                      : tab.color === "green"
                      ? "green.50"
                      : "purple.50"
                    : isDark
                    ? "gray.850"
                    : "gray.50"
                }
                cursor="pointer"
                transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                _hover={{
                  borderColor: isSelected
                    ? undefined
                    : isDark
                    ? "gray.500"
                    : "gray.300",
                  transform: "translateY(-1px)",
                }}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                textAlign="left"
              >
                <Flex justify="space-between" align="center" w="full" gap={2.5}>
                  <HStack spacing={3} flex={1} minW={0} align="center">
                    {/* 1. Icon Container Wrapper (Locked Size & Protected from Shrinking) */}
                    <Flex
                      w="42px"
                      h="42px"
                      minW="42px"
                      minH="42px"
                      maxW="42px"
                      maxH="42px"
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="xl"
                      borderWidth={1}
                      borderColor={
                        isSelected
                          ? isDark
                            ? `${tab.color}.400`
                            : `${tab.color}.300`
                          : isDark
                          ? "gray.700"
                          : `${tab.color}.200`
                      }
                      bg={
                        isSelected
                          ? `${tab.color}.500`
                          : isDark
                          ? "gray.800"
                          : `${tab.color}.50`
                      }
                      color={
                        isSelected
                          ? "white"
                          : isDark
                          ? `${tab.color}.300`
                          : `${tab.color}.600`
                      }
                    >
                      <Icon as={tab.icon} boxSize={5} flexShrink={0} />
                    </Flex>

                    {/* 2. Text Container */}
                    <Box flex={1} minW={0}>
                      <Text
                        fontSize="sm"
                        fontWeight={isSelected ? "bold" : "semibold"}
                        color={
                          isSelected
                            ? isDark
                              ? "white"
                              : `${tab.color}.700`
                            : textHeading
                        }
                        isTruncated
                      >
                        {tab.label}
                      </Text>
                      <Text fontSize="2xs" color={textMuted} isTruncated mt={0.5}>
                        {tab.key === "IT"
                          ? "Pencarian Master Pegawai"
                          : tab.key === "BJB"
                          ? "Personel Unit Non-IT"
                          : "Regulator / Vendor"}
                      </Text>
                    </Box>
                  </HStack>

                  {tab.count > 0 && (
                    <Badge
                      colorScheme={tab.color}
                      variant={isSelected ? "solid" : "subtle"}
                      rounded="full"
                      px={2}
                      fontSize="2xs"
                      flexShrink={0}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* ─── Tab Content (Selection Cards / Forms) ────────────────────────── */}
      <Box mb={6}>
        {/* ─── TAB 1: INTERNAL IT (Interactive Card Selection) ─── */}
        {activeTab === "IT" && (
          <VStack spacing={3.5} align="stretch">
            <FormControl>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Ketik nama atau ID pegawai IT untuk memilih kartu personel..."
                  value={searchQuery}
                  onChange={(e) => handleSearchIT(e.target.value)}
                  rounded="xl"
                  bg={isDark ? "gray.850" : "white"}
                  borderColor={borderCol}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
                {searchQuery && (
                  <InputRightElement>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<Icon as={FiX} />}
                      aria-label="Bersihkan pencarian"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    />
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>

            {isSearching && (
              <HStack px={2} py={1} spacing={2}>
                <Icon as={FiSearch} color="blue.400" />
                <Text fontSize="xs" color={textMuted}>
                  Mencari data personel IT di master database...
                </Text>
              </HStack>
            )}

            {/* Search Results as Selectable Cards Grid */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Box
                    p={3.5}
                    borderRadius="xl"
                    borderWidth={1}
                    borderColor={borderHighlight}
                    bg={isDark ? "gray.850" : "blue.50/40"}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack spacing={1.5}>
                        <Icon as={FiUserCheck} color="blue.400" boxSize={3.5} />
                        <Text fontSize="xs" fontWeight="bold" color={textHeading}>
                          Hasil Pencarian Personel ({searchResults.length} Kartu)
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color={textMuted}>
                        Klik pada kartu untuk memilih / membatalkan
                      </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
                      {searchResults.map((u) => {
                        const selected = isAlreadyAdded(u.id, u.nama);
                        return (
                          <Box
                            key={u.id}
                            as="button"
                            type="button"
                            onClick={() => handleToggleIT(u)}
                            p={3.5}
                            borderRadius="xl"
                            borderWidth={1.5}
                            borderColor={
                              selected
                                ? "blue.500"
                                : isDark
                                ? "gray.700"
                                : "gray.200"
                            }
                            bg={
                              selected
                                ? isDark
                                  ? "blue.900/60"
                                  : "blue.50"
                                : isDark
                                ? "gray.800"
                                : "white"
                            }
                            shadow={selected ? "md" : "xs"}
                            cursor="pointer"
                            transition="all 0.18s ease"
                            _hover={{
                              transform: "translateY(-2px)",
                              borderColor: selected ? "blue.600" : "blue.300",
                              shadow: "sm",
                            }}
                            textAlign="left"
                            position="relative"
                            overflow="hidden"
                          >
                            {/* Selected Indicator Top Strip */}
                            {selected && (
                              <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                h="3px"
                                bg="blue.500"
                              />
                            )}

                            <Flex justify="space-between" align="flex-start" mb={2}>
                              <Avatar
                                size="sm"
                                name={u.nama}
                                bg={getAvatarColor(u.nama)}
                                color="white"
                              >
                                {selected && (
                                  <AvatarBadge
                                    boxSize="1.15em"
                                    bg="blue.500"
                                    borderWidth="2px"
                                    borderColor={isDark ? "gray.800" : "white"}
                                  >
                                    <Icon as={FiCheck} color="white" boxSize="8px" />
                                  </AvatarBadge>
                                )}
                              </Avatar>

                              <Badge
                                colorScheme={selected ? "blue" : "gray"}
                                variant={selected ? "solid" : "outline"}
                                fontSize="2xs"
                                rounded="full"
                                px={2}
                                py={0.5}
                              >
                                {selected ? "✓ Terpilih" : "+ Pilih"}
                              </Badge>
                            </Flex>

                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color={textHeading}
                              noOfLines={1}
                              title={u.nama}
                            >
                              {u.nama}
                            </Text>

                            <HStack spacing={1.5} mt={1} color={textMuted}>
                              <Icon as={FiCpu} boxSize="10px" />
                              <Text fontSize="3xs" noOfLines={1} title={u.namaUnitKerja || u.namaGroupKerja || "Divisi IT"}>
                                {u.namaUnitKerja || u.namaGroupKerja || "Divisi IT"}
                              </Text>
                            </HStack>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <Box
                p={4}
                borderRadius="xl"
                border="1px dashed"
                borderColor={borderCol}
                textAlign="center"
                bg={bgInner}
              >
                <Text fontSize="xs" color={textMuted}>
                  Tidak ditemukan personel IT dengan kata kunci &quot;{searchQuery}&quot;. Pastikan nama atau NIP sesuai.
                </Text>
              </Box>
            )}
          </VStack>
        )}

        {/* ─── TAB 2: INTERNAL BJB (Card Form) ─── */}
        {activeTab === "BJB" && (
          <Card
            variant="outline"
            borderRadius="xl"
            borderColor={isDark ? "green.800" : "green.200"}
            bg={isDark ? "gray.850" : "green.50/30"}
          >
            <CardBody p={4}>
              <Flex justify="space-between" align="center" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FiBriefcase} color="green.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" color={textHeading}>
                    Form Kartu Komite Internal Bank BJB (Non-IT)
                  </Text>
                </HStack>
                <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                  Internal BJB
                </Badge>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5} mb={3.5}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="semibold">
                    Nama Personel
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="lg"
                    placeholder="Contoh: Budi Santoso, S.E."
                    value={bjbForm.userName}
                    onChange={(e) => setBjbForm({ ...bjbForm, userName: e.target.value })}
                    bg={bgCard}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="semibold">
                    Asal Divisi / Unit Kerja
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="lg"
                    placeholder="Contoh: Divisi Operasional / SKAI / Kepatuhan"
                    value={bjbForm.asalDivisi}
                    onChange={(e) => setBjbForm({ ...bjbForm, asalDivisi: e.target.value })}
                    bg={bgCard}
                  />
                </FormControl>
              </SimpleGrid>

              <Flex justify="flex-end">
                <Button
                  colorScheme="green"
                  size="sm"
                  rounded="lg"
                  leftIcon={<Icon as={FiPlusCircle} />}
                  onClick={handleAddBJB}
                  isDisabled={!bjbForm.userName.trim()}
                  fontWeight="semibold"
                >
                  Add
                </Button>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* ─── TAB 3: EKSTERNAL (Card Form) ─── */}
        {activeTab === "EXTERNAL" && (
          <Card
            variant="outline"
            borderRadius="xl"
            borderColor={isDark ? "purple.800" : "purple.200"}
            bg={isDark ? "gray.850" : "purple.50/30"}
          >
            <CardBody p={4}>
              <Flex justify="space-between" align="center" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FiGlobe} color="purple.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" color={textHeading}>
                    Form Kartu Komite Eksternal (Regulator / Partner / Vendor)
                  </Text>
                </HStack>
                <Badge colorScheme="purple" variant="subtle" fontSize="2xs">
                  Eksternal
                </Badge>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5} mb={3.5}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="semibold">
                    Nama Lengkap
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="lg"
                    placeholder="Nama anggota eksternal..."
                    value={externalForm.userName}
                    onChange={(e) => setExternalForm({ ...externalForm, userName: e.target.value })}
                    bg={bgCard}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="semibold">
                    Asal Institusi / Perusahaan
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="lg"
                    placeholder="Contoh: Bank Indonesia, OJK, Vendor PT XYZ"
                    value={externalForm.asalInstitusi}
                    onChange={(e) => setExternalForm({ ...externalForm, asalInstitusi: e.target.value })}
                    bg={bgCard}
                  />
                </FormControl>
              </SimpleGrid>

              <Flex justify="flex-end">
                <Button
                  colorScheme="purple"
                  size="sm"
                  rounded="lg"
                  leftIcon={<Icon as={FiPlusCircle} />}
                  onClick={handleAddExternal}
                  isDisabled={!externalForm.userName.trim() || !externalForm.asalInstitusi.trim()}
                  fontWeight="semibold"
                >
                  Add
                </Button>
              </Flex>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* ─── Selected Members Grid (Card-Based Display) ───────────────────── */}
      <Box pt={4} borderTopWidth={1} borderColor={borderCol}>
        <Flex justify="space-between" align="center" mb={3.5}>
          <HStack spacing={2}>
            <Text fontWeight="bold" fontSize="sm" color={textHeading}>
              Daftar Kartu Komite CAB Terpilih
            </Text>
            {memberList.length > 0 && (
              <Badge colorScheme="purple" variant="solid" rounded="full" px={2} fontSize="2xs">
                {memberList.length}
              </Badge>
            )}
          </HStack>
          <Text fontSize="2xs" color={textMuted}>
            {memberList.length > 0 ? "Seluruh anggota di bawah akan tercatat dalam notulen sidang" : "Minimal 1 anggota disarankan"}
          </Text>
        </Flex>

        {memberList.length === 0 ? (
          <Box
            py={8}
            px={4}
            borderWidth={1.5}
            borderRadius="xl"
            borderStyle="dashed"
            borderColor={borderCol}
            bg={bgInner}
            textAlign="center"
          >
            <VStack spacing={2.5}>
              <Box p={3} borderRadius="full" bg={bgSubtle} color={textMuted}>
                <Icon as={FiUsers} boxSize={6} />
              </Box>
              <Text fontWeight="semibold" fontSize="sm" color={textHeading}>
                Belum Ada Anggota Komite yang Dipilih
              </Text>
              <Text fontSize="xs" color={textMuted} maxW="420px">
                Gunakan tab pilihan di atas (Internal IT, Internal BJB, atau Eksternal) untuk mencari dan menambahkan kartu panelis sidang CAB.
              </Text>
            </VStack>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3.5}>
            <AnimatePresence>
              {memberList.map((member, idx) => {
                const isIT = member.type === "INTERNAL_IT";
                const isBJB = member.type === "INTERNAL_BJB";
                const accentColor = isIT ? "blue" : isBJB ? "green" : "purple";
                const TypeIcon = isIT ? FiCpu : isBJB ? FiBriefcase : FiGlobe;
                const orgLabel = isIT
                  ? member.asalDivisi || "Divisi IT"
                  : isBJB
                  ? member.asalDivisi || "Internal BJB"
                  : member.asalInstitusi || "Eksternal";

                return (
                  <motion.div
                    key={`${member.type}-${member.userId || member.userName}-${idx}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Box
                      p={3.5}
                      borderRadius="xl"
                      borderWidth={1.5}
                      borderColor={
                        isDark
                          ? `${accentColor}.800`
                          : `${accentColor}.200`
                      }
                      bg={
                        isDark
                          ? `${accentColor}.950/40`
                          : `${accentColor}.50/40`
                      }
                      position="relative"
                      overflow="hidden"
                      shadow="xs"
                      _hover={{
                        shadow: "md",
                        borderColor: `${accentColor}.400`,
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.18s ease"
                    >
                      {/* Top Color Accent */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="3px"
                        bg={`${accentColor}.500`}
                      />

                      <Flex justify="space-between" align="flex-start" mb={2.5}>
                        <HStack spacing={2.5}>
                          <Avatar
                            size="sm"
                            name={member.userName}
                            bg={getAvatarColor(member.userName)}
                            color="white"
                          />
                          <VStack align="start" spacing={0}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color={textHeading}
                              noOfLines={1}
                              title={member.userName}
                            >
                              {member.userName}
                            </Text>
                            <Badge
                              colorScheme={accentColor}
                              variant="subtle"
                              fontSize="3xs"
                              rounded="md"
                              px={1.5}
                              py={0.2}
                            >
                              {isIT ? "Internal IT" : isBJB ? "Internal BJB" : "Eksternal"}
                            </Badge>
                          </VStack>
                        </HStack>

                        <Tooltip label={`Hapus ${member.userName}`} hasArrow placement="top">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            rounded="full"
                            icon={<Icon as={FiTrash2} />}
                            aria-label={`Hapus ${member.userName}`}
                            onClick={() => handleRemove(idx)}
                            _hover={{ bg: isDark ? "red.900" : "red.100" }}
                          />
                        </Tooltip>
                      </Flex>

                      {/* Info Row */}
                      <HStack
                        spacing={1.5}
                        pt={2}
                        borderTopWidth={1}
                        borderColor={isDark ? "gray.750" : "gray.200/80"}
                        color={textMuted}
                      >
                        <Icon as={TypeIcon} boxSize="11px" color={`${accentColor}.400`} />
                        <Text fontSize="2xs" noOfLines={1} title={orgLabel}>
                          {orgLabel}
                        </Text>
                      </HStack>
                    </Box>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default CommitteeCabField;
