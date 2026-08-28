"use client";

import { useEffect, useMemo, useState } from "react";
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
  Tooltip,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiExternalLink,
  FiFile,
  FiFileText,
  FiFolder,
  FiImage,
  FiInfo,
  FiSearch,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { MOCK_PROJECT_FILES, ProjectFileItem } from "@/app/json/cabRequestMock";

export interface ProjectFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: ProjectFileItem) => void;
  selectedFileId?: string;
  projectContext?: string;
  projectCode?: string;
  projectId?: string;
  categoryFilter?: string;
  fieldTitle?: string;
  projectUrl?: string;
}

const CATEGORIES = [
  "Semua",
  "Arsitektur",
  "Security & SAST",
  "UAT & QA",
  "BRD & RFC",
  "Manual & Runbook",
];

export const getProjectRouteUrl = (
  projectIdOrCode?: string,
  tab: string = "documentation"
): string => {
  if (!projectIdOrCode) return `/projects/manage?tab=${tab}`;
  const clean = projectIdOrCode.replace(/^\[(BRD|RFC|PROJECT)\]\s*/i, "").trim();
  return `/projects/manage?projectId=${encodeURIComponent(clean)}&tab=${tab}`;
};

export const ProjectFilesModal = ({
  isOpen,
  onClose,
  onSelectFile,
  selectedFileId,
  projectContext,
  projectCode,
  projectId,
  categoryFilter: initialCategory,
  fieldTitle,
  projectUrl,
}: ProjectFilesModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "Semua"
  );

  // Sync category filter when modal opens with a new initialCategory
  useEffect(() => {
    if (isOpen) {
      setActiveCategory(initialCategory || "Semua");
      setSearchTerm("");
    }
  }, [isOpen, initialCategory]);

  const targetProjectRoute = useMemo(() => {
    return (
      projectUrl ||
      getProjectRouteUrl(projectId || projectCode || projectContext, "documentation")
    );
  }, [projectUrl, projectId, projectCode, projectContext]);

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

  const displayProjectName = projectContext || projectCode || "Proyek Terpilih";

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
              <HStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  Pilih Dokumen dari Proyek Terkait
                </Text>
                {fieldTitle && (
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={0.5} rounded="md">
                    Untuk: {fieldTitle}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                Pilih berkas yang telah terunggah pada proyek terpilih untuk dilampirkan ke formulir permohonan CAB.
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            {/* Project Context & Direct Routing Banner */}
            <Box
              p={3.5}
              rounded="lg"
              bg={isDark ? "blue.950" : "blue.50"}
              border="1px solid"
              borderColor={isDark ? "blue.800" : "blue.200"}
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={3}
              >
                <HStack spacing={3} align="start" flex={1}>
                  <Icon as={FiInfo} color="blue.500" boxSize={5} mt={0.5} />
                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={2} wrap="wrap">
                      <Text fontSize="xs" fontWeight="bold" color={isDark ? "blue.200" : "blue.800"}>
                        Proyek Utama Terpilih:
                      </Text>
                      <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} rounded="md">
                        {displayProjectName}
                      </Badge>
                    </HStack>
                    <Text fontSize="2xs" color={isDark ? "blue.300" : "blue.600"}>
                      Berkas di bawah berasal dari repositori artefak & dokumen proyek ini.
                    </Text>
                  </VStack>
                </HStack>

                <Tooltip
                  label="Buka tab Work Documentation proyek ini di tab baru untuk mengunggah atau melihat dokumen"
                  placement="top"
                >
                  <Button
                    as="a"
                    href={targetProjectRoute}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    colorScheme="blue"
                    variant="solid"
                    rightIcon={<FiExternalLink />}
                    fontWeight="semibold"
                    flexShrink={0}
                  >
                    Buka Work Documentation ↗
                  </Button>
                </Tooltip>
              </Flex>
            </Box>

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

              <Wrap spacing={1.5}>
                {CATEGORIES.map((cat) => (
                  <WrapItem key={cat}>
                    <Button
                      size="xs"
                      variant={activeCategory === cat ? "solid" : "outline"}
                      colorScheme="blue"
                      rounded="full"
                      px={3}
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
                  Tidak ada dokumen yang sesuai dengan pencarian / kategori &ldquo;{activeCategory}&rdquo;
                </Text>
                <Button
                  size="xs"
                  mt={2}
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => {
                    setActiveCategory("Semua");
                    setSearchTerm("");
                  }}
                >
                  Tampilkan Semua Dokumen
                </Button>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={2.5}>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <Box
                      key={file.id}
                      p={3.5}
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
                          <VStack align="start" spacing={0.5} flex={1}>
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
                          size="xs"
                          colorScheme={isSelected ? "green" : "blue"}
                          variant={isSelected ? "solid" : "outline"}
                          leftIcon={isSelected ? <FiCheck /> : undefined}
                          onClick={() => {
                            onSelectFile(file);
                            onClose();
                          }}
                          flexShrink={0}
                          h="32px"
                          px={3}
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
