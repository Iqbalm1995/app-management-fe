"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiPlusCircle, FiSearch, FiTrash2, FiUserCheck, FiUsers, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { UsersResponse } from "@/app/services/useUsers";
import { CabPicInternalIT } from "@/app/types/cabTypes";

// ─── Helper ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["blue.400", "green.400", "purple.400", "orange.400", "teal.400", "red.400", "pink.400", "cyan.400"];
const getAvatarColor = (name: string): string => {
  if (!name) return "gray.400";
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
};

interface PicMigrasiFieldProps {
  value: CabPicInternalIT[] | null;
  onChange: (pics: CabPicInternalIT[]) => void;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UsersResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Normalize value to array
  const picList: CabPicInternalIT[] = Array.isArray(value)
    ? value
    : value
    ? [value as any]
    : [];

  const isAlreadyAdded = (userId: string) =>
    picList.some((p) => p.userId === userId);

  // Search users (real API)
  const handleSearch = async (text: string) => {
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

  const handleAddUser = (user: UsersResponse) => {
    if (isAlreadyAdded(user.id)) return;
    const newPic: CabPicInternalIT = {
      type: "INTERNAL_IT",
      userId: user.id,
      userName: user.nama,
      divisi: user.namaUnitKerja || user.namaGroupKerja || "Divisi IT",
    };
    onChange([...picList, newPic]);
  };

  const handleRemoveUser = (userId: string) => {
    onChange(picList.filter((p) => p.userId !== userId));
  };

  return (
    <Box bg={bgCard} borderRadius={radiusStyle} p={6} borderWidth={1} borderColor={borderCol}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Icon as={FiUsers} color="blue.400" boxSize={5} />
          <Text fontWeight="bold" fontSize="md">
            PIC Pelaksana Migrasi (Internal IT)
          </Text>
        </HStack>
        {picList.length > 0 && (
          <Badge colorScheme="blue" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="xs">
            {picList.length} Personel Terpilih
          </Badge>
        )}
      </Flex>
      <Text fontSize="xs" color={textMuted} mb={4}>
        Pilih personel pelaksana migrasi dari Internal IT. Anda dapat memilih lebih dari satu personel.
      </Text>

      {/* Search Bar */}
      <VStack spacing={3} align="stretch">
        <FormControl>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari ID Personel / Nama Personel Internal IT..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              rounded="lg"
            />
          </InputGroup>
        </FormControl>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                borderWidth={1}
                borderRadius="xl"
                borderColor={borderCol}
                maxH="220px"
                overflowY="auto"
                bg={isDark ? "gray.750" : "white"}
                shadow="sm"
              >
                <VStack spacing={0} align="stretch">
                  {searchResults.map((u) => {
                    const added = isAlreadyAdded(u.id);
                    return (
                      <HStack
                        key={u.id}
                        px={4}
                        py={2.5}
                        cursor={added ? "default" : "pointer"}
                        borderBottomWidth={1}
                        borderColor={borderCol}
                        opacity={added ? 0.5 : 1}
                        _hover={!added ? { bg: bgHover } : {}}
                        transition="all 0.15s"
                        onClick={() => !added && handleAddUser(u)}
                      >
                        <Avatar size="sm" name={u.nama} bg={getAvatarColor(u.nama)} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {u.nama}
                          </Text>
                          <Text fontSize="2xs" color={textMuted}>
                            {u.namaUnitKerja || u.namaGroupKerja || "Divisi IT"}
                          </Text>
                        </VStack>
                        {added ? (
                          <Badge colorScheme="green" fontSize="2xs" rounded="md" px={2} py={0.5}>
                            ✓ Ditambahkan
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<Icon as={FiPlusCircle} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddUser(u);
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected PIC Personnel Cards */}
        <Box mt={2}>
          <Text fontSize="xs" fontWeight="semibold" color={textMuted} mb={2}>
            Daftar PIC Migrasi Terpilih:
          </Text>

          {picList.length === 0 ? (
            <Box
              p={4}
              rounded="lg"
              border="1px dashed"
              borderColor={borderCol}
              textAlign="center"
              bg={isDark ? "gray.750" : "gray.50"}
            >
              <Text fontSize="xs" color={textMuted}>
                Belum ada PIC Migrasi yang dipilih. Gunakan kolom pencarian di atas untuk menambahkan personel Internal IT.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <AnimatePresence>
                {picList.map((pic) => (
                  <motion.div
                    key={pic.userId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <HStack
                      p={3}
                      borderRadius="xl"
                      borderWidth={1}
                      borderColor={isDark ? "blue.700" : "blue.200"}
                      bg={bgSelected}
                      justify="space-between"
                    >
                      <HStack spacing={3} flex={1}>
                        <Avatar size="sm" name={pic.userName} bg={getAvatarColor(pic.userName)} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="bold">
                            {pic.userName}
                          </Text>
                          <Text fontSize="2xs" color={textMuted}>
                            {pic.divisi}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={1.5}>
                        <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                          Internal IT
                        </Badge>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Icon as={FiTrash2} />}
                          aria-label="Hapus PIC"
                          onClick={() => handleRemoveUser(pic.userId)}
                        />
                      </HStack>
                    </HStack>
                  </motion.div>
                ))}
              </AnimatePresence>
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default PicMigrasiField;
