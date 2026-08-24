"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Tag,
  Text,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiFile,
  FiFileText,
  FiFolder,
  FiImage,
  FiSearch,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { MOCK_PROJECT_FILES, ProjectFileItem } from "@/app/json/cabRequestMock";

interface ProjectFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: ProjectFileItem) => void;
  selectedFileId?: string;
  projectContext?: string;
  categoryFilter?: string;
}

const CATEGORIES = [
  "Semua",
  "Arsitektur",
  "Security & SAST",
  "UAT & QA",
  "BRD & RFC",
  "Manual & Runbook",
];

export const ProjectFilesModal = ({
  isOpen,
  onClose,
  onSelectFile,
  selectedFileId,
  projectContext,
  categoryFilter: initialCategory,
}: ProjectFilesModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "Semua"
  );

  const filteredFiles = useMemo(() => {
    return MOCK_PROJECT_FILES.filter((file) => {
      const matchCategory =
        activeCategory === "Semua" || file.category === activeCategory;
      const matchSearch =
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description &&
          file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <Icon as={FiFileText} boxSize={5} color="red.500" />;
      case "png":
      case "jpg":
        return <Icon as={FiImage} boxSize={5} color="purple.500" />;
      default:
        return <Icon as={FiFile} boxSize={5} color="blue.500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <ModalContent
        rounded={radiusStyle}
        bg={isDark ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"} py={4}>
          <HStack spacing={3}>
            <Icon as={FiFolder} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                Pilih Dokumen dari Proyek Terkait
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                {projectContext
                  ? `Referensi Proyek: ${projectContext}`
                  : "Daftar dokumen & artefak proyek yang telah terunggah pada sistem"}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            {/* Search & Category Filter */}
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={3}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
            >
              <InputGroup maxW={{ base: "full", md: "340px" }} size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Cari nama dokumen atau pengunggah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  rounded="md"
                />
              </InputGroup>

              <Wrap spacing={2}>
                {CATEGORIES.map((cat) => (
                  <WrapItem key={cat}>
                    <Button
                      size="xs"
                      variant={activeCategory === cat ? "solid" : "outline"}
                      colorScheme="blue"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Flex>

            {/* Document List */}
            {filteredFiles.length === 0 ? (
              <Box
                py={12}
                textAlign="center"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor={isDark ? "gray.700" : "gray.300"}
                rounded="lg"
              >
                <Icon as={FiFile} boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Tidak ada dokumen yang sesuai dengan pencarian
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={3}>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <Box
                      key={file.id}
                      p={4}
                      rounded="lg"
                      borderWidth="1px"
                      borderColor={
                        isSelected
                          ? "blue.500"
                          : isDark
                          ? "gray.700"
                          : "gray.200"
                      }
                      bg={
                        isSelected
                          ? isDark
                            ? "blue.900"
                            : "blue.50"
                          : isDark
                          ? "gray.750"
                          : "white"
                      }
                      transition="all 0.15s ease-in-out"
                      _hover={{
                        borderColor: "blue.400",
                        bg: isDark ? "gray.700" : "gray.50",
                      }}
                    >
                      <Flex
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                        gap={3}
                      >
                        <HStack spacing={3} align="start" flex={1}>
                          <Box mt={1}>{getFileIcon(file.fileType)}</Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={isDark ? "gray.100" : "gray.800"}
                              wordBreak="break-word"
                            >
                              {file.fileName}
                            </Text>
                            {file.description && (
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                noOfLines={2}
                              >
                                {file.description}
                              </Text>
                            )}
                            <HStack spacing={2} wrap="wrap" pt={1}>
                              <Badge
                                size="sm"
                                colorScheme="blue"
                                fontSize="2xs"
                                px={1.5}
                                rounded="sm"
                              >
                                {file.category}
                              </Badge>
                              <Tag size="sm" variant="subtle" fontSize="2xs">
                                {file.fileSize}
                              </Tag>
                              <Text fontSize="2xs" color="gray.500">
                                Diunggah {file.uploadedAt} oleh {file.uploadedBy}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <Button
                          size="sm"
                          colorScheme={isSelected ? "green" : "blue"}
                          variant={isSelected ? "solid" : "outline"}
                          leftIcon={isSelected ? <FiCheck /> : undefined}
                          onClick={() => {
                            onSelectFile(file);
                            onClose();
                          }}
                          flexShrink={0}
                        >
                          {isSelected ? "Terpilih" : "Gunakan Dokumen Ini"}
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"} py={3}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectFilesModal;
