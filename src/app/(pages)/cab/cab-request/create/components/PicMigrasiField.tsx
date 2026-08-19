"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
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
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { FiBriefcase, FiCheck, FiMonitor, FiPlusCircle, FiSearch, FiUsers, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { UsersResponse } from "@/app/services/useUsers";
import { CabPic } from "@/app/types/cabTypes";
import { MOCK_INTERNAL_BJB_USERS } from "@/app/json/cabRequestMock";

// ─── Helper ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["blue.400", "green.400", "purple.400", "orange.400", "teal.400", "red.400", "pink.400", "cyan.400"];
const getAvatarColor = (name: string): string => {
  if (!name) return "gray.400";
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
};

type PicScenario = "INTERNAL_IT" | "INTERNAL_BJB" | "VENDOR" | null;

interface PicMigrasiFieldProps {
  value: CabPic | null;
  onChange: (pic: CabPic | null) => void;
  fetchUsers: (search: string, token: string) => Promise<UsersResponse[]>;
  tokenData: string;
}

const PicMigrasiField = ({ value, onChange, fetchUsers, tokenData }: PicMigrasiFieldProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgCard = isDark ? "gray.800" : "white";
  const borderCol = isDark ? "gray.600" : "gray.200";
  const bgHover = isDark ? "gray.700" : "gray.50";
  const bgSelected = isDark ? "blue.900" : "blue.50";
  const textMuted = isDark ? "gray.400" : "gray.500";

  const [scenario, setScenario] = useState<PicScenario>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UsersResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vendorForm, setVendorForm] = useState({ namaVendor: "", alamatVendor: "", namaPicVendor: "" });

  // Sync scenario from existing value
  useEffect(() => {
    if (value?.type === "INTERNAL_IT") setScenario("INTERNAL_IT");
    else if (value?.type === "INTERNAL_BJB") setScenario("INTERNAL_BJB");
    else if (value?.type === "VENDOR") { setScenario("VENDOR"); setVendorForm({ namaVendor: value.namaVendor, alamatVendor: value.alamatVendor, namaPicVendor: value.namaPicVendor }); }
  }, []);

  const handleSelectScenario = (type: PicScenario) => {
    setScenario(type);
    setSearchQuery("");
    setSearchResults([]);
    onChange(null);
  };

  // Search users (real API)
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    const users = await fetchUsers(text, tokenData);
    setSearchResults(users);
    setIsSearching(false);
  };

  const handleSelectUser = (user: UsersResponse) => {
    if (scenario === "INTERNAL_IT") {
      onChange({ type: "INTERNAL_IT", userId: user.id, userName: user.nama, divisi: user.namaUnitKerja || user.namaGroupKerja || "" });
    } else if (scenario === "INTERNAL_BJB") {
      onChange({ type: "INTERNAL_BJB", userId: user.id, userName: user.nama, asalDivisi: user.namaUnitKerja || user.namaGroupKerja || "" });
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectBJBMock = (user: { id: string; name: string; divisi: string }) => {
    onChange({ type: "INTERNAL_BJB", userId: user.id, userName: user.name, asalDivisi: user.divisi });
    setSearchQuery("");
  };

  const handleVendorChange = (field: string, val: string) => {
    const updated = { ...vendorForm, [field]: val };
    setVendorForm(updated);
    if (updated.namaVendor && updated.alamatVendor && updated.namaPicVendor) {
      onChange({ type: "VENDOR", ...updated });
    }
  };

  // Filter BJB mock by search
  const filteredBJB = MOCK_INTERNAL_BJB_USERS.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.divisi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scenarios = [
    { type: "INTERNAL_IT" as const, icon: FiMonitor, label: "Internal IT", desc: "Personil dari Divisi IT", color: "blue" },
    { type: "INTERNAL_BJB" as const, icon: FiBriefcase, label: "Internal BJB", desc: "Personil divisi lain BJB", color: "green" },
    { type: "VENDOR" as const, icon: FiUsers, label: "Vendor", desc: "Pihak ketiga / mitra", color: "purple" },
  ];

  return (
    <Box bg={bgCard} borderRadius={radiusStyle} p={6} borderWidth={1} borderColor={borderCol}>
      {/* Header */}
      <HStack mb={4}>
        <Icon as={FiUsers} color="blue.400" boxSize={5} />
        <Text fontWeight="bold" fontSize="md">PIC Migrasi</Text>
      </HStack>

      {/* 3 Card Selector */}
      <Text fontSize="sm" color={textMuted} mb={3}>Pilih tipe PIC Migrasi</Text>
      <SimpleGrid columns={3} spacing={3}>
        {scenarios.map((s) => {
          const isActive = scenario === s.type;
          return (
            <Box
              key={s.type}
              position="relative"
              borderWidth={2}
              borderColor={isActive ? `${s.color}.500` : borderCol}
              borderRadius="xl"
              p={4}
              cursor="pointer"
              textAlign="center"
              transition="all 0.2s"
              bg={isActive ? (isDark ? `${s.color}.900` : `${s.color}.50`) : "transparent"}
              shadow={isActive ? "md" : "none"}
              _hover={{ borderColor: `${s.color}.400`, bg: isDark ? `${s.color}.900` : `${s.color}.50`, transform: "translateY(-2px)", shadow: "md" }}
              onClick={() => handleSelectScenario(s.type)}
            >
              {isActive && (
                <Box position="absolute" top={-2} right={-2} bg={`${s.color}.500`} borderRadius="full" p={0.5}>
                  <Icon as={FiCheck} color="white" boxSize={3} />
                </Box>
              )}
              <Icon as={s.icon} boxSize={8} color={`${s.color}.400`} mb={2} />
              <Text fontWeight="semibold" fontSize="sm">{s.label}</Text>
              <Text fontSize="xs" color={textMuted}>{s.desc}</Text>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Form per scenario */}
      <AnimatePresence mode="wait">
        {scenario && (
          <motion.div key={scenario} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Box mt={5} pt={5} borderTopWidth={1} borderColor={borderCol}>

              {/* Internal IT — real API search */}
              {scenario === "INTERNAL_IT" && (
                <VStack spacing={3} align="stretch">
                  <FormLabel fontSize="sm" mb={0}>Pilih PIC Internal IT</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                    <Input placeholder="Cari nama..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                  </InputGroup>
                  {searchResults.length > 0 && (
                    <Box borderWidth={1} borderRadius="xl" borderColor={borderCol} maxH="200px" overflowY="auto">
                      <VStack spacing={0} align="stretch">
                        {searchResults.map((u) => (
                          <HStack key={u.id} p={3} cursor="pointer" borderRadius="lg" _hover={{ bg: bgHover }} transition="all 0.15s" onClick={() => handleSelectUser(u)}>
                            <Avatar size="sm" name={u.nama} bg={getAvatarColor(u.nama)} />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight="semibold">{u.nama}</Text>
                              <Text fontSize="xs" color={textMuted}>{u.namaUnitKerja || u.namaGroupKerja || ""}</Text>
                            </VStack>
                            <Icon as={FiPlusCircle} color="blue.400" />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  {/* Selected chip */}
                  {value?.type === "INTERNAL_IT" && (
                    <HStack mt={2} p={3} borderRadius="xl" borderWidth={2} borderColor="blue.300" bg={bgSelected}>
                      <Avatar size="sm" name={value.userName} bg={getAvatarColor(value.userName)} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{value.userName}</Text>
                        <Text fontSize="xs" color={textMuted}>{value.divisi}</Text>
                      </VStack>
                      <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} borderRadius="full">Internal IT</Badge>
                      <IconButton size="xs" variant="ghost" colorScheme="red" icon={<Icon as={FiX} />} aria-label="Hapus" onClick={() => { onChange(null); setSearchQuery(""); }} />
                    </HStack>
                  )}
                </VStack>
              )}

              {/* Internal BJB — mock list with search */}
              {scenario === "INTERNAL_BJB" && (
                <VStack spacing={3} align="stretch">
                  <FormLabel fontSize="sm" mb={0}>Pilih PIC Internal BJB</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                    <Input placeholder="Cari nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </InputGroup>
                  <Box borderWidth={1} borderRadius="xl" borderColor={borderCol} maxH="200px" overflowY="auto">
                    <VStack spacing={0} align="stretch">
                      {filteredBJB.map((u) => (
                        <HStack key={u.id} p={3} cursor="pointer" borderRadius="lg" _hover={{ bg: bgHover }} transition="all 0.15s" onClick={() => handleSelectBJBMock(u)}>
                          <Avatar size="sm" name={u.name} bg={getAvatarColor(u.name)} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="semibold">{u.name}</Text>
                            <Text fontSize="xs" color={textMuted}>{u.divisi}</Text>
                          </VStack>
                          <Icon as={FiPlusCircle} color="green.400" />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                  {/* Selected chip */}
                  {value?.type === "INTERNAL_BJB" && (
                    <HStack mt={2} p={3} borderRadius="xl" borderWidth={2} borderColor="green.300" bg={isDark ? "green.900" : "green.50"}>
                      <Avatar size="sm" name={value.userName} bg={getAvatarColor(value.userName)} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{value.userName}</Text>
                        <Text fontSize="xs" color={textMuted}>{value.asalDivisi}</Text>
                      </VStack>
                      <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5} borderRadius="full">Internal BJB</Badge>
                      <IconButton size="xs" variant="ghost" colorScheme="red" icon={<Icon as={FiX} />} aria-label="Hapus" onClick={() => { onChange(null); setSearchQuery(""); }} />
                    </HStack>
                  )}
                </VStack>
              )}

              {/* Vendor form */}
              {scenario === "VENDOR" && (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color={textMuted}>Informasi Vendor / Pihak Ketiga</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Nama Vendor</FormLabel>
                      <Input placeholder="PT. Contoh Vendor Indonesia" value={vendorForm.namaVendor} onChange={(e) => handleVendorChange("namaVendor", e.target.value)} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Nama PIC Vendor</FormLabel>
                      <Input placeholder="Nama lengkap PIC" value={vendorForm.namaPicVendor} onChange={(e) => handleVendorChange("namaPicVendor", e.target.value)} />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Alamat Vendor</FormLabel>
                    <Textarea placeholder="Alamat lengkap vendor..." rows={2} value={vendorForm.alamatVendor} onChange={(e) => handleVendorChange("alamatVendor", e.target.value)} />
                  </FormControl>
                </VStack>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PicMigrasiField;
