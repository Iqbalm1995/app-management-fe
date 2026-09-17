"use client";

import { useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
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
  FiDownload,
  FiExternalLink,
  FiFile,
  FiFileText,
  FiFolder,
  FiImage,
  FiInfo,
  FiSearch,
} from "react-icons/fi";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectFileItem } from "@/app/json/cabRequestMock";
import useProjects, { ProjectWorkflowResponse } from "@/app/services/useProjects";
import useMediaObject from "@/app/services/useMediaObject";

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
  tokenData?: string;
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
  tokenData,
}: ProjectFilesModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { ListProjectWorkflow } = useProjects();
  const { SecureDownloadFiles } = useMediaObject();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "Semua"
  );
  const [liveProjectFiles, setLiveProjectFiles] = useState<ProjectFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch and extract real project documents recursively
  useEffect(() => {
    if (!isOpen) {
      setLoadingFiles(false);
      return;
    }

    const token =
      tokenData ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");

    if (!projectId || !token) {
      setLiveProjectFiles([]);
      setLoadingFiles(false);
      return;
    }

    let isMounted = true;
    setLoadingFiles(true);

    const fetchDocs = async () => {
      try {
        const res = await ListProjectWorkflow(projectId, token);
        if (!isMounted) return;

        if (res?.statusCode === RES_CODE_OK && res.data) {
          const extractedDocs: ProjectFileItem[] = [];

          // Recursive helper to extract all documents from Level 1, Level 2, and child workflows
          const traverseWorkflows = (wfList: ProjectWorkflowResponse[]) => {
            if (!wfList || !Array.isArray(wfList)) return;

            wfList.forEach((wf) => {
              // 1. Process documents attached at this level
              if (wf.workflowValues && Array.isArray(wf.workflowValues)) {
                wf.workflowValues.forEach((val) => {
                  if (val.mediaObjectId || val.documentName) {
                    let cat = "BRD & RFC";
                    const dt = (
                      (val.documentType || "") +
                      " " +
                      (wf.wfCategoryName || "") +
                      " " +
                      (wf.wfgName || "")
                    ).toUpperCase();

                    if (
                      dt.includes("ARSI") ||
                      dt.includes("ARCH") ||
                      dt.includes("FSD") ||
                      dt.includes("TSD") ||
                      dt.includes("TOPOLOGI") ||
                      dt.includes("INFRA")
                    ) {
                      cat = "Arsitektur";
                    } else if (
                      dt.includes("SAST") ||
                      dt.includes("SEC") ||
                      dt.includes("PEN_TEST") ||
                      dt.includes("VA") ||
                      dt.includes("VULN") ||
                      dt.includes("MATRIKS")
                    ) {
                      cat = "Security & SAST";
                    } else if (
                      dt.includes("UAT") ||
                      dt.includes("QA") ||
                      dt.includes("TEST") ||
                      dt.includes("SIT") ||
                      dt.includes("PENGUJIAN")
                    ) {
                      cat = "UAT & QA";
                    } else if (
                      dt.includes("SOP") ||
                      dt.includes("MANUAL") ||
                      dt.includes("RUNDOWN") ||
                      dt.includes("RUNBOOK") ||
                      dt.includes("JUKNIS") ||
                      dt.includes("MIGRASI") ||
                      dt.includes("ROLLBACK")
                    ) {
                      cat = "Manual & Runbook";
                    }

                    const formattedDate = val.documentDate
                      ? new Date(val.documentDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : val.createdAt
                      ? new Date(val.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";

                    const docDescParts = [];
                    if (val.documentVersion) docDescParts.push(`Versi: ${val.documentVersion}`);
                    if (val.documentNumber && val.documentNumber !== "-")
                      docDescParts.push(`No: ${val.documentNumber}`);
                    if (wf.wfgName) docDescParts.push(`Tahapan: ${wf.wfgName}`);

                    extractedDocs.push({
                      id: val.id || `doc-${extractedDocs.length + 1}`,
                      fileName: val.documentName || "Dokumen Proyek",
                      fileSize: val.documentType || wf.wfgName || "Dokumen SDLC",
                      fileType: (val.documentName || "").toLowerCase().endsWith(".pdf")
                        ? "pdf"
                        : (val.documentName || "").toLowerCase().endsWith(".png") ||
                          (val.documentName || "").toLowerCase().endsWith(".jpg") ||
                          (val.documentName || "").toLowerCase().endsWith(".jpeg")
                        ? "png"
                        : (val.documentName || "").toLowerCase().endsWith(".xls") ||
                          (val.documentName || "").toLowerCase().endsWith(".xlsx")
                        ? "xlsx"
                        : (val.documentName || "").toLowerCase().endsWith(".zip") ||
                          (val.documentName || "").toLowerCase().endsWith(".rar") ||
                          (val.documentName || "").toLowerCase().endsWith(".tar.gz")
                        ? "zip"
                        : (val.documentName || "").toLowerCase().endsWith(".drawio")
                        ? "drawio"
                        : "docx",
                      uploadedBy: val.createdBy || "Project Team",
                      uploadedAt: formattedDate,
                      category: cat,
                      description: docDescParts.join(" | "),
                      sourceUrl: val.linkAttachment || undefined,
                      mediaObjectId: val.mediaObjectId || undefined,
                      projectCode: projectCode,
                    });
                  }
                });
              }

              // 2. Recursively process child workflows
              if (
                wf.workflowChild &&
                Array.isArray(wf.workflowChild) &&
                wf.workflowChild.length > 0
              ) {
                traverseWorkflows(wf.workflowChild);
              }
            });
          };

          traverseWorkflows(res.data);
          setLiveProjectFiles(extractedDocs);
        } else {
          setLiveProjectFiles([]);
        }
      } catch {
        if (isMounted) setLiveProjectFiles([]);
      } finally {
        if (isMounted) setLoadingFiles(false);
      }
    };

    fetchDocs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId, tokenData, projectCode]);

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
    return liveProjectFiles.filter((file) => {
      const matchCategory =
        activeCategory === "Semua" || file.category === activeCategory;
      const matchSearch =
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description &&
          file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [liveProjectFiles, activeCategory, searchTerm]);

  const handleDownloadPreview = async (mediaObjectId: string, fileName: string) => {
    const token =
      tokenData ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    if (!mediaObjectId || !token) return;

    setDownloadingId(mediaObjectId);
    try {
      const blob = await SecureDownloadFiles([mediaObjectId], token, undefined, "PROJECT_DOC");
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || `Document_${mediaObjectId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {
      // Ignore preview failure
    } finally {
      setDownloadingId(null);
    }
  };

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
                Pilih berkas yang telah terunggah pada tahapan SDLC/workflow proyek terpilih untuk dilampirkan ke formulir permohonan CAB.
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
                      <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} rounded="md">
                        {displayProjectName}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={isDark ? "blue.300" : "blue.600"}>
                      Berkas di bawah diambil langsung secara otomatis dari repositori artefak & dokumen SDLC proyek ini.
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
                    h="28px"
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
                  placeholder="Cari nama dokumen atau tahapan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  rounded="md"
                  fontSize="xs"
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
                      fontSize="xs"
                    >
                      {cat}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Flex>

            {/* Loading State */}
            {loadingFiles ? (
              <Flex justify="center" align="center" py={12}>
                <VStack spacing={3}>
                  <Spinner color="blue.500" size="lg" thickness="3px" />
                  <Text fontSize="xs" color="gray.500">
                    Memuat daftar dokumentasi proyek...
                  </Text>
                </VStack>
              </Flex>
            ) : filteredFiles.length === 0 ? (
              /* Empty State */
              <Box
                py={12}
                px={4}
                textAlign="center"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor={isDark ? "gray.700" : "gray.300"}
                rounded="lg"
              >
                <Icon as={FiFile} boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="sm" color={isDark ? "gray.200" : "gray.700"} fontWeight="medium">
                  {liveProjectFiles.length === 0
                    ? `Belum ada dokumen yang diunggah pada proyek "${displayProjectName}".`
                    : `Tidak ada dokumen yang sesuai dengan filter kategori "${activeCategory}".`}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1} maxW="480px" mx="auto">
                  {liveProjectFiles.length === 0
                    ? "Anda dapat mengunggah berkas arsitektur, SAST, atau pengujian terlebih dahulu melalui menu Work Documentation proyek atau mengunggah berkas secara manual."
                    : "Silakan pilih kategori 'Semua' atau gunakan kata kunci pencarian yang berbeda."}
                </Text>
                <HStack spacing={2} justify="center" mt={3}>
                  {liveProjectFiles.length > 0 && (
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => {
                        setActiveCategory("Semua");
                        setSearchTerm("");
                      }}
                      fontSize="xs"
                    >
                      Tampilkan Semua Dokumen
                    </Button>
                  )}
                  <Button
                    as="a"
                    href={targetProjectRoute}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    variant="solid"
                    colorScheme="blue"
                    rightIcon={<FiExternalLink />}
                    fontSize="xs"
                  >
                    Unggah Dokumen di Halaman Proyek ↗
                  </Button>
                </HStack>
              </Box>
            ) : (
              /* Document List */
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={2.5}>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  const isDownloading = downloadingId === file.mediaObjectId;

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
                                fontSize="xs"
                                px={1.5}
                                rounded="sm"
                              >
                                {file.category}
                              </Badge>
                              <Tag size="sm" variant="subtle" fontSize="xs">
                                {file.fileSize}
                              </Tag>
                              <Text fontSize="xs" color="gray.500">
                                Diunggah {file.uploadedAt} oleh {file.uploadedBy}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <HStack spacing={2} flexShrink={0}>
                          {file.mediaObjectId && (
                            <Tooltip label="Unduh berkas untuk pratinjau" placement="top">
                              <IconButton
                                aria-label="Unduh Dokumen"
                                icon={isDownloading ? <Spinner size="xs" /> : <FiDownload />}
                                size="xs"
                                variant="outline"
                                colorScheme="gray"
                                isDisabled={isDownloading}
                                onClick={() =>
                                  handleDownloadPreview(file.mediaObjectId!, file.fileName)
                                }
                                h="32px"
                                w="32px"
                              />
                            </Tooltip>
                          )}
                          <Button
                            size="xs"
                            colorScheme={isSelected ? "green" : "blue"}
                            variant={isSelected ? "solid" : "outline"}
                            leftIcon={isSelected ? <FiCheck /> : undefined}
                            onClick={() => {
                              onSelectFile(file);
                              onClose();
                            }}
                            h="32px"
                            px={3}
                            fontSize="xs"
                            fontWeight="semibold"
                          >
                            {isSelected ? "Terpilih" : "Gunakan Dokumen Ini"}
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={isDark ? "gray.700" : "gray.200"} py={3}>
          <Button size="sm" variant="ghost" onClick={onClose} fontSize="xs">
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectFilesModal;
