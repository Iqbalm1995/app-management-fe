"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { FiCheck, FiDownload, FiFileText, FiFolder, FiPaperclip, FiSearch, FiUploadCloud } from "react-icons/fi";
import useProjects, { ProjectWorkflowResponse, ProjectWorkflowValueResponse } from "../services/useProjects";
import useMediaObject from "../services/useMediaObject";
import { RES_CODE_OK } from "../constants/applicationConstants";

export interface SelectedProjectDocument {
  mediaObjectId: string;
  documentName: string;
  documentType: string;
  documentVersion?: string;
  documentNumber?: string;
  filePathMinio?: string;
  fileSize?: number;
}

interface ProjectDocumentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  tokenData: string;
  filterDocumentType?: string | string[]; // e.g. "SAST" or ["DOKUMEN_ARSITEKTUR", "FSD"]
  title?: string;
  onSelectDocument: (doc: SelectedProjectDocument) => void;
}

export const ProjectDocumentPickerModal: React.FC<ProjectDocumentPickerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  tokenData,
  filterDocumentType,
  title = "Pilih Dokumen dari Proyek Aktif",
  onSelectDocument,
}) => {
  const { colorMode } = useColorMode();
  const { ListProjectWorkflow } = useProjects();
  const { SecureDownloadFiles } = useMediaObject();

  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<ProjectWorkflowValueResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId && tokenData) {
      loadProjectDocuments();
    }
  }, [isOpen, projectId, tokenData]);

  const loadProjectDocuments = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await ListProjectWorkflow(projectId, tokenData);

      if (res?.statusCode === RES_CODE_OK && res.data) {
        const allValues: ProjectWorkflowValueResponse[] = [];
        res.data.forEach((wf) => {
          if (wf.workflowValues && wf.workflowValues.length > 0) {
            wf.workflowValues.forEach((val) => {
              if (val.mediaObjectId) {
                allValues.push(val);
              }
            });
          }
        });
        setDocuments(allValues);
      }
    } catch (err) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Filter by type if specified
      if (filterDocumentType) {
        const allowedTypes = Array.isArray(filterDocumentType) ? filterDocumentType : [filterDocumentType];
        const docType = (doc.documentType || "").toUpperCase();
        const matchesType = allowedTypes.some((t) => docType.includes(t.toUpperCase()) || t.toUpperCase().includes(docType));
        if (!matchesType && allowedTypes.length > 0) return false;
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const name = (doc.documentName || "").toLowerCase();
        const type = (doc.documentType || "").toLowerCase();
        const num = (doc.documentNumber || "").toLowerCase();
        return name.includes(s) || type.includes(s) || num.includes(s);
      }

      return true;
    });
  }, [documents, filterDocumentType, searchTerm]);

  const handleConfirmSelection = () => {
    const chosen = documents.find((d) => d.id === selectedDocId);
    if (chosen && chosen.mediaObjectId) {
      onSelectDocument({
        mediaObjectId: chosen.mediaObjectId,
        documentName: chosen.documentName || "Dokumen Proyek",
        documentType: chosen.documentType || "DOCUMENT",
        documentVersion: chosen.documentVersion || "v1.0",
        documentNumber: chosen.documentNumber || "-",
        filePathMinio: chosen.linkAttachment || "",
      });
      onClose();
    }
  };

  const handlePreviewDownload = async (mediaObjectId: string) => {
    if (!mediaObjectId || !tokenData) return;
    try {
      const blob = await SecureDownloadFiles([mediaObjectId], tokenData, undefined, "PROJECT_DOC");
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Document_${mediaObjectId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {
      // Download error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} rounded="xl" shadow="2xl">
        <ModalHeader borderBottom="1px solid" borderColor={colorMode === "light" ? "gray.100" : "gray.700"} pb={3}>
          <HStack spacing={2.5}>
            <Icon as={FiFolder} color="blue.500" boxSize={5} />
            <Text fontSize="md" fontWeight="bold">
              {title}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari nama dokumen, nomor dokumen, atau tipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                rounded="lg"
              />
            </InputGroup>

            {isLoading ? (
              <Flex justify="center" align="center" py={12}>
                <VStack spacing={3}>
                  <Spinner color="blue.500" size="lg" thickness="3px" />
                  <Text fontSize="xs" color="gray.500">
                    Memuat daftar dokumentasi proyek...
                  </Text>
                </VStack>
              </Flex>
            ) : filteredDocs.length === 0 ? (
              <Box p={8} textAlign="center" rounded="lg" bg={colorMode === "light" ? "gray.50" : "gray.750"} border="1px dashed" borderColor="gray.300">
                <Icon as={FiFileText} boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  Tidak ada dokumen proyek yang sesuai
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Pastikan proyek memiliki file dokumentasi yang telah diunggah pada tahapan SDLC/workflow terkait.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={1} spacing={2.5} maxH="360px" overflowY="auto" pr={1}>
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <Box
                      key={doc.id}
                      p={3.5}
                      rounded="lg"
                      border="1.5px solid"
                      borderColor={isSelected ? "blue.500" : colorMode === "light" ? "gray.200" : "gray.700"}
                      bg={isSelected ? (colorMode === "light" ? "blue.50" : "blue.900") : colorMode === "light" ? "white" : "gray.750"}
                      cursor="pointer"
                      onClick={() => setSelectedDocId(doc.id)}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: "blue.400", shadow: "sm" }}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3} align="center" flex={1}>
                          <Box
                            p={2}
                            rounded="md"
                            bg={isSelected ? "blue.500" : colorMode === "light" ? "gray.100" : "gray.700"}
                            color={isSelected ? "white" : "gray.600"}
                          >
                            <Icon as={FiPaperclip} boxSize={4} />
                          </Box>
                          <VStack align="start" spacing={0.5} flex={1}>
                            <HStack spacing={2}>
                              <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                {doc.documentName || "Dokumen Tanpa Nama"}
                              </Text>
                              <Badge colorScheme="blue" variant="subtle" fontSize="2xs" rounded="full">
                                {doc.documentType || "DOCUMENT"}
                              </Badge>
                              {doc.documentVersion && (
                                <Badge colorScheme="purple" variant="outline" fontSize="2xs" rounded="full">
                                  {doc.documentVersion}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              No. Dokumen: {doc.documentNumber || "-"} | Tgl: {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString("id-ID") : "-"}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={2}>
                          {doc.mediaObjectId && (
                            <Button
                              size="xs"
                              variant="ghost"
                              leftIcon={<Icon as={FiDownload} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewDownload(doc.mediaObjectId!);
                              }}
                            >
                              Unduh
                            </Button>
                          )}
                          {isSelected && <Icon as={FiCheck} color="blue.500" boxSize={5} />}
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={colorMode === "light" ? "gray.100" : "gray.700"} py={3}>
          <HStack spacing={3}>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              isDisabled={!selectedDocId}
              onClick={handleConfirmSelection}
            >
              Gunakan Dokumen Ini
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectDocumentPickerModal;
