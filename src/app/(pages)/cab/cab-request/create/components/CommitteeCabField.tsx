"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { FiPlusCircle, FiSearch, FiUsers, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { UsersResponse } from "@/app/services/useUsers";
import { CabCommitteeMember } from "@/app/types/cabTypes";

// ─── Helper ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["blue.400", "green.400", "purple.400", "orange.400", "teal.400", "red.400", "pink.400", "cyan.400"];
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

const CommitteeCabField = ({ value, onChange, fetchUsers, tokenData }: CommitteeCabFieldProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgCard = isDark ? "gray.800" : "white";
  const bgPage = isDark ? "gray.900" : "gray.50";
  const bgHover = isDark ? "gray.700" : "gray.50";
  const borderCol = isDark ? "gray.600" : "gray.200";
  const textMuted = isDark ? "gray.400" : "gray.500";

  const [activeTab, setActiveTab] = useState<TabType>("IT");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UsersResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Free text form for Internal BJB
  const [bjbForm, setBjbForm] = useState({ userName: "", asalDivisi: "" });

  // Free text form for External (only userName and asalInstitusi)
  const [externalForm, setExternalForm] = useState({ userName: "", asalInstitusi: "" });

  // Search IT users (real API)
  const handleSearchIT = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const users = await fetchUsers(text, tokenData);
    setSearchResults(users || []);
    setIsSearching(false);
  };

  const isAlreadyAdded = (id?: string, name?: string) =>
    value.some((m) => (id && m.userId === id) || (name && m.userName.toLowerCase() === name.toLowerCase()));

  const handleAddIT = (user: UsersResponse) => {
    if (isAlreadyAdded(user.id, user.nama)) return;
    onChange([
      ...value,
      {
        type: "INTERNAL_IT",
        userId: user.id,
        userName: user.nama,
        asalDivisi: user.namaUnitKerja || user.namaGroupKerja || "",
      },
    ]);
  };

  // Add Free Text Internal BJB Member
  const handleAddBJB = () => {
    if (!bjbForm.userName.trim()) return;
    onChange([
      ...value,
      {
        type: "INTERNAL_BJB",
        userId: `bjb-${Date.now()}`,
        userName: bjbForm.userName.trim(),
        asalDivisi: bjbForm.asalDivisi.trim() || "-",
      },
    ]);
    setBjbForm({ userName: "", asalDivisi: "" });
  };

  // Add Free Text External Member (without asalDivisi)
  const handleAddExternal = () => {
    if (!externalForm.userName.trim() || !externalForm.asalInstitusi.trim()) return;
    onChange([
      ...value,
      {
        type: "EXTERNAL",
        userName: externalForm.userName.trim(),
        asalInstitusi: externalForm.asalInstitusi.trim(),
      },
    ]);
    setExternalForm({ userName: "", asalInstitusi: "" });
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "IT", label: "Internal IT" },
    { key: "BJB", label: "Internal BJB" },
    { key: "EXTERNAL", label: "Eksternal" },
  ];

  return (
    <Box bg={bgCard} borderRadius={radiusStyle} p={6} borderWidth={1} borderColor={borderCol}>
      {/* Header */}
      <HStack mb={5}>
        <Icon as={FiUsers} color="purple.400" boxSize={5} />
        <Text fontWeight="bold" fontSize="md">Committee CAB</Text>
        {value.length > 0 && <Badge colorScheme="purple" borderRadius="full">{value.length} anggota</Badge>}
      </HStack>

      {/* Tab Selector */}
      <HStack spacing={0} borderWidth={1} borderColor={borderCol} borderRadius="xl" p={1} bg={bgPage}>
        {tabs.map((tab) => (
          <Box
            key={tab.key}
            px={4}
            py={2}
            fontSize="sm"
            cursor="pointer"
            borderRadius="lg"
            transition="all 0.15s"
            fontWeight={activeTab === tab.key ? "semibold" : "normal"}
            bg={activeTab === tab.key ? (isDark ? "blue.700" : "blue.500") : "transparent"}
            color={activeTab === tab.key ? "white" : textMuted}
            shadow={activeTab === tab.key ? "sm" : "none"}
            _hover={activeTab !== tab.key ? { bg: bgHover, color: "inherit" } : {}}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchQuery("");
              setSearchResults([]);
            }}
          >
            {tab.label}
          </Box>
        ))}
      </HStack>

      {/* Tab Contents */}
      <Box mt={4}>
        {/* ─── TAB 1: INTERNAL IT (Pencarian Master Pegawai IT) ─── */}
        {activeTab === "IT" && (
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari ID Personel / Nama Personel IT..."
                value={searchQuery}
                onChange={(e) => handleSearchIT(e.target.value)}
                rounded="md"
              />
            </InputGroup>
            {isSearching && (
              <Text fontSize="xs" color={textMuted} px={2}>Mencari personil IT...</Text>
            )}
            {searchResults.length > 0 && (
              <Box borderWidth={1} borderRadius="lg" borderColor={borderCol} maxH="220px" overflowY="auto">
                <VStack spacing={0} align="stretch">
                  {searchResults.map((u) => {
                    const added = isAlreadyAdded(u.id, u.nama);
                    return (
                      <HStack
                        key={u.id}
                        px={4}
                        py={3}
                        cursor={added ? "default" : "pointer"}
                        borderRadius="md"
                        opacity={added ? 0.4 : 1}
                        _hover={!added ? { bg: bgHover, transform: "translateX(3px)" } : {}}
                        transition="all 0.15s"
                        onClick={() => !added && handleAddIT(u)}
                      >
                        <Avatar size="sm" name={u.nama} bg={getAvatarColor(u.nama)} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold">{u.nama}</Text>
                          <Text fontSize="xs" color={textMuted}>{u.namaUnitKerja || u.namaGroupKerja || "-"}</Text>
                        </VStack>
                        {added ? (
                          <Badge colorScheme="green" fontSize="2xs">✓ Ditambahkan</Badge>
                        ) : (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<Icon as={FiPlusCircle} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddIT(u);
                            }}
                          >
                            Tambah
                          </Button>
                        )}
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </VStack>
        )}

        {/* ─── TAB 2: INTERNAL BJB (Free Text Input) ─── */}
        {activeTab === "BJB" && (
          <VStack
            spacing={4}
            align="stretch"
            p={4}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderCol}
            bg={bgPage}
          >
            <Text fontSize="sm" color={textMuted} fontWeight="medium">
              Tambah Personel Internal Bank BJB (Non-IT)
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="semibold">Nama Personel</FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="Contoh: Budi Santoso..."
                  value={bjbForm.userName}
                  onChange={(e) => setBjbForm({ ...bjbForm, userName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="semibold">Asal Divisi / Unit Kerja</FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="Contoh: Divisi Operasional, Divisi Kepatuhan..."
                  value={bjbForm.asalDivisi}
                  onChange={(e) => setBjbForm({ ...bjbForm, asalDivisi: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>
            <Button
              colorScheme="green"
              size="sm"
              alignSelf="flex-end"
              rounded="md"
              leftIcon={<Icon as={FiPlusCircle} />}
              onClick={handleAddBJB}
              isDisabled={!bjbForm.userName.trim()}
            >
              Tambah Anggota BJB
            </Button>
          </VStack>
        )}

        {/* ─── TAB 3: EKSTERNAL (Free Text Input: Nama & Asal Institusi saja) ─── */}
        {activeTab === "EXTERNAL" && (
          <VStack
            spacing={4}
            align="stretch"
            p={4}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderCol}
            bg={bgPage}
          >
            <Text fontSize="sm" color={textMuted} fontWeight="medium">
              Tambah Anggota Komite dari Luar BJB (Regulator / Partner / Vendor)
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="semibold">Nama Lengkap</FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="Nama anggota eksternal..."
                  value={externalForm.userName}
                  onChange={(e) => setExternalForm({ ...externalForm, userName: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="semibold">Asal Institusi / Perusahaan</FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="Contoh: Bank Indonesia, OJK, Vendor PT XYZ..."
                  value={externalForm.asalInstitusi}
                  onChange={(e) => setExternalForm({ ...externalForm, asalInstitusi: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>
            <Button
              colorScheme="purple"
              size="sm"
              alignSelf="flex-end"
              rounded="md"
              leftIcon={<Icon as={FiPlusCircle} />}
              onClick={handleAddExternal}
              isDisabled={!externalForm.userName.trim() || !externalForm.asalInstitusi.trim()}
            >
              Tambah Anggota Eksternal
            </Button>
          </VStack>
        )}
      </Box>

      {/* Selected Members */}
      <Box mt={5} pt={5} borderTopWidth={1} borderColor={borderCol}>
        <HStack mb={3}>
          <Text fontWeight="semibold" fontSize="sm">Committee CAB List</Text>
          {value.length > 0 && <Badge colorScheme="gray" borderRadius="full">{value.length}</Badge>}
        </HStack>

        {value.length === 0 ? (
          <VStack py={6} spacing={2} borderWidth={1} borderRadius="lg" borderStyle="dashed" borderColor={borderCol} bg={bgPage}>
            <Icon as={FiUsers} boxSize={6} color={textMuted} />
            <Text fontWeight="medium" color={textMuted} fontSize="xs">Belum ada anggota committee</Text>
          </VStack>
        ) : (
          <VStack spacing={2} align="stretch">
            <AnimatePresence>
              {value.map((member, idx) => (
                <motion.div
                  key={`${member.type}-${member.userId || member.userName}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HStack
                    p={3}
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={borderCol}
                    bg={isDark ? "gray.750" : "gray.50"}
                  >
                    <Avatar size="xs" name={member.userName} bg={getAvatarColor(member.userName)} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="xs" fontWeight="semibold">{member.userName}</Text>
                      <Text fontSize="3xs" color={textMuted}>
                        {member.type === "EXTERNAL"
                          ? member.asalInstitusi || "-"
                          : member.asalDivisi || "-"}
                      </Text>
                    </VStack>
                    <Badge
                      fontSize="3xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      colorScheme={
                        member.type === "INTERNAL_IT"
                          ? "blue"
                          : member.type === "INTERNAL_BJB"
                          ? "green"
                          : "purple"
                      }
                    >
                      {member.type === "INTERNAL_IT"
                        ? "Internal IT"
                        : member.type === "INTERNAL_BJB"
                        ? "Internal BJB"
                        : "Eksternal"}
                    </Badge>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      borderRadius="full"
                      icon={<Icon as={FiX} />}
                      aria-label={`Hapus ${member.userName}`}
                      onClick={() => handleRemove(idx)}
                    />
                  </HStack>
                </motion.div>
              ))}
            </AnimatePresence>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default CommitteeCabField;
