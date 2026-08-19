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
import { MOCK_INTERNAL_BJB_USERS } from "@/app/json/cabRequestMock";

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
  const [externalForm, setExternalForm] = useState({ userName: "", asalInstitusi: "", asalDivisi: "" });

  // Search IT users (real API)
  const handleSearchIT = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    const users = await fetchUsers(text, tokenData);
    setSearchResults(users);
    setIsSearching(false);
  };

  // Filter BJB mock
  const filteredBJB = MOCK_INTERNAL_BJB_USERS.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.divisi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAlreadyAdded = (id: string) => value.some((m) => m.userId === id);

  const handleAddIT = (user: UsersResponse) => {
    if (isAlreadyAdded(user.id)) return;
    onChange([...value, { type: "INTERNAL_IT", userId: user.id, userName: user.nama, asalDivisi: user.namaUnitKerja || user.namaGroupKerja || "" }]);
  };

  const handleAddBJB = (user: { id: string; name: string; divisi: string }) => {
    if (isAlreadyAdded(user.id)) return;
    onChange([...value, { type: "INTERNAL_BJB", userId: user.id, userName: user.name, asalDivisi: user.divisi }]);
  };

  const handleAddExternal = () => {
    if (!externalForm.userName || !externalForm.asalInstitusi) return;
    onChange([...value, { type: "EXTERNAL", userName: externalForm.userName, asalInstitusi: externalForm.asalInstitusi, asalDivisi: externalForm.asalDivisi }]);
    setExternalForm({ userName: "", asalInstitusi: "", asalDivisi: "" });
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
            onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setSearchResults([]); }}
          >
            {tab.label}
          </Box>
        ))}
      </HStack>

      {/* Search + List */}
      <Box mt={4}>
        {activeTab === "IT" && (
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
              <Input placeholder="Cari ID Personel / Nama Personel..." value={searchQuery} onChange={(e) => handleSearchIT(e.target.value)} />
            </InputGroup>
            {searchResults.length > 0 && (
              <Box borderWidth={1} borderRadius="xl" borderColor={borderCol} maxH="220px" overflowY="auto">
                <VStack spacing={0} align="stretch">
                  {searchResults.map((u) => {
                    const added = isAlreadyAdded(u.id);
                    return (
                      <HStack key={u.id} px={4} py={3} cursor={added ? "default" : "pointer"} borderRadius="lg" opacity={added ? 0.4 : 1} _hover={!added ? { bg: bgHover, transform: "translateX(3px)" } : {}} transition="all 0.15s" onClick={() => !added && handleAddIT(u)}>
                        <Avatar size="sm" name={u.nama} bg={getAvatarColor(u.nama)} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold">{u.nama}</Text>
                          <Text fontSize="xs" color={textMuted}>{u.namaUnitKerja || u.namaGroupKerja || ""}</Text>
                        </VStack>
                        {added
                          ? <Badge colorScheme="green" fontSize="2xs">✓ Ditambahkan</Badge>
                          : <Button size="xs" colorScheme="blue" variant="outline" leftIcon={<Icon as={FiPlusCircle} />} onClick={(e) => { e.stopPropagation(); handleAddIT(u); }}>Tambah</Button>
                        }
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </VStack>
        )}

        {activeTab === "BJB" && (
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
              <Input placeholder="Cari nama BJB..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </InputGroup>
            <Box borderWidth={1} borderRadius="xl" borderColor={borderCol} maxH="220px" overflowY="auto">
              <VStack spacing={0} align="stretch">
                {filteredBJB.map((u) => {
                  const added = isAlreadyAdded(u.id);
                  return (
                    <HStack key={u.id} px={4} py={3} cursor={added ? "default" : "pointer"} borderRadius="lg" opacity={added ? 0.4 : 1} _hover={!added ? { bg: bgHover, transform: "translateX(3px)" } : {}} transition="all 0.15s" onClick={() => !added && handleAddBJB(u)}>
                      <Avatar size="sm" name={u.name} bg={getAvatarColor(u.name)} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="semibold">{u.name}</Text>
                        <Text fontSize="xs" color={textMuted}>{u.divisi}</Text>
                      </VStack>
                      {added
                        ? <Badge colorScheme="green" fontSize="2xs">✓ Ditambahkan</Badge>
                        : <Button size="xs" colorScheme="green" variant="outline" leftIcon={<Icon as={FiPlusCircle} />} onClick={(e) => { e.stopPropagation(); handleAddBJB(u); }}>Tambah</Button>
                      }
                    </HStack>
                  );
                })}
              </VStack>
            </Box>
          </VStack>
        )}

        {activeTab === "EXTERNAL" && (
          <VStack spacing={4} align="stretch" mt={2} p={4} borderRadius="xl" borderWidth={1} borderColor={borderCol} bg={bgPage}>
            <Text fontSize="sm" color={textMuted} fontWeight="medium">Tambah Anggota dari Luar BJB</Text>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Nama Lengkap</FormLabel>
              <Input placeholder="Nama anggota..." value={externalForm.userName} onChange={(e) => setExternalForm({ ...externalForm, userName: e.target.value })} />
            </FormControl>
            <SimpleGrid columns={2} spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Asal Institusi</FormLabel>
                <Input placeholder="Contoh: Bank BRI, OJK..." value={externalForm.asalInstitusi} onChange={(e) => setExternalForm({ ...externalForm, asalInstitusi: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Asal Divisi</FormLabel>
                <Input placeholder="Divisi / Departemen..." value={externalForm.asalDivisi} onChange={(e) => setExternalForm({ ...externalForm, asalDivisi: e.target.value })} />
              </FormControl>
            </SimpleGrid>
            <Button colorScheme="purple" size="sm" alignSelf="flex-end" leftIcon={<Icon as={FiPlusCircle} />} onClick={handleAddExternal} isDisabled={!externalForm.userName || !externalForm.asalInstitusi}>
              Tambah Anggota
            </Button>
          </VStack>
        )}
      </Box>

      {/* Selected Members */}
      <Box mt={5} pt={5} borderTopWidth={1} borderColor={borderCol}>
        <HStack mb={3}>
          <Text fontWeight="semibold" fontSize="sm">Committee CAB</Text>
          {value.length > 0 && <Badge colorScheme="gray" borderRadius="full">{value.length}</Badge>}
        </HStack>

        {value.length === 0 ? (
          <VStack py={8} spacing={3} borderWidth={1} borderRadius="xl" borderStyle="dashed" borderColor={borderCol} bg={bgPage}>
            <Box p={3} borderRadius="full" bg={isDark ? "gray.700" : "gray.100"}>
              <Icon as={FiUsers} boxSize={7} color={textMuted} />
            </Box>
            <Text fontWeight="semibold" color={textMuted} fontSize="sm">Belum ada anggota committee</Text>
            <Text fontSize="xs" color={textMuted} textAlign="center" maxW="220px">Cari dan tambahkan personil menggunakan tab di atas</Text>
          </VStack>
        ) : (
          <VStack spacing={2} align="stretch">
            <AnimatePresence>
              {value.map((member, idx) => (
                <motion.div key={`${member.type}-${member.userId || member.userName}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }} transition={{ duration: 0.2 }}>
                  <HStack
                    p={3}
                    borderRadius="xl"
                    borderWidth={1}
                    borderColor={member.type === "INTERNAL_IT" ? "blue.200" : member.type === "INTERNAL_BJB" ? "green.200" : "purple.200"}
                    bg={member.type === "INTERNAL_IT" ? (isDark ? "blue.900" : "blue.50") : member.type === "INTERNAL_BJB" ? (isDark ? "green.900" : "green.50") : (isDark ? "purple.900" : "purple.50")}
                  >
                    <Avatar size="xs" name={member.userName} bg={getAvatarColor(member.userName)} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold">{member.userName}</Text>
                      <Text fontSize="xs" color={textMuted}>{member.asalDivisi || member.asalInstitusi || "-"}</Text>
                    </VStack>
                    <Badge fontSize="2xs" px={2} py={0.5} borderRadius="full" colorScheme={member.type === "INTERNAL_IT" ? "blue" : member.type === "INTERNAL_BJB" ? "green" : "purple"}>
                      {member.type === "INTERNAL_IT" ? "Internal IT" : member.type === "INTERNAL_BJB" ? "Internal BJB" : "Eksternal"}
                    </Badge>
                    <IconButton size="xs" variant="ghost" colorScheme="red" borderRadius="full" icon={<Icon as={FiX} />} aria-label={`Hapus ${member.userName}`} onClick={() => handleRemove(idx)} />
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
