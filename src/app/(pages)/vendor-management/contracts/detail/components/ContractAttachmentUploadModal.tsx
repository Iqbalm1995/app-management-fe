"use client";

import React, { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Box,
  Icon,
  useColorMode,
  Badge,
  Flex,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  FiUploadCloud,
  FiFileText,
  FiCalendar,
  FiHash,
  FiTag,
  FiLink,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor from "@/app/services/useVendor";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";

interface ContractAttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  tokenData: string;
  onSuccess: () => void;
}

const CONTRACT_DOCUMENT_TYPES = [
  { value: "PKS_MAIN", label: "Perjanjian Kerjasama Utama (PKS / Contract Agreement)" },
  { value: "SPK", label: "Surat Perintah Kerja (SPK / Purchase Order)" },
  { value: "ADDENDUM", label: "Addendum / Contract Amendment Document" },
  { value: "PERFORMANCE_GUARANTEE", label: "Performance Guarantee (Jaminan Pelaksanaan)" },
  { value: "WARRANTY_CERTIFICATE", label: "Maintenance Warranty Certificate (Jaminan Pemeliharaan)" },
  { value: "SLA_DOCUMENT", label: "Service Level Agreement (SLA) & Terms" },
  { value: "OTHER", label: "Other Legal / Supporting Document" },
];

export default function ContractAttachmentUploadModal({
  isOpen,
  onClose,
  contractId,
  tokenData,
  onSuccess,
}: ContractAttachmentUploadModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UploadContractAttachment, isLoading } = useVendor();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documentType, setDocumentType] = useState<string>("PKS_MAIN");
  const [documentName, setDocumentName] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [documentVersion, setDocumentVersion] = useState<string>("V.0");
  const [linkAttachment, setLinkAttachment] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleReset = () => {
    setDocumentType("PKS_MAIN");
    setDocumentName("");
    setDocumentNumber("");
    setDocumentDate(new Date().toISOString().split("T")[0]);
    setDocumentVersion("V.0");
    setLinkAttachment("");
    setSelectedFile(null);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!documentType) errs.documentType = "Document type is required";
    if (!documentName.trim()) errs.documentName = "Document title is required";
    if (!selectedFile && !linkAttachment.trim()) {
      errs.file = "Please upload a document file or provide a valid external URL";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("ContractId", contractId);
    formData.append("DocumentType", documentType);
    formData.append("DocumentName", documentName);
    formData.append("DocumentNumber", documentNumber || "");
    formData.append("DocumentDate", documentDate ? new Date(documentDate).toISOString() : new Date().toISOString());
    formData.append("DocumentVersion", documentVersion || "V.0");
    if (linkAttachment) {
      formData.append("LinkAttachment", linkAttachment);
    }
    if (selectedFile) {
      formData.append("File", selectedFile);
    }

    const res = await UploadContractAttachment(formData, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Contract document uploaded successfully",
        statusToast: "success",
      });
      handleReset();
      onSuccess();
      onClose();
    } else {
      showToast({
        description: res?.message || "Failed to upload document",
        statusToast: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        rounded={radiusStyle}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"} py={4}>
          <HStack spacing={3}>
            <Flex
              p={2}
              rounded="lg"
              bg={colorMode === "light" ? "teal.50" : "teal.900"}
              color="teal.500"
            >
              <Icon as={FiUploadCloud} boxSize={5} />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">
                Upload Contract Document
              </Text>
              <Text fontSize="xs" color="gray.500">
                Attach PKS, SPK, Addendum, or Performance Guarantee files to Object Storage
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={2} />

        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            {/* Document Type & Version */}
            <Flex gap={3} direction={{ base: "column", md: "row" }} align="flex-start">
              <FormControl isRequired isInvalid={!!errors.documentType} flex={2}>
                <FormLabel
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                  fontSize="xs"
                  fontWeight="bold"
                  mb={1.5}
                  minH="20px"
                >
                  <Icon as={FiTag} />
                  <span>Document Category</span>
                </FormLabel>
                <Select
                  size="sm"
                  rounded="md"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  {CONTRACT_DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </Select>
                {errors.documentType && (
                  <FormErrorMessage fontSize="xs">{errors.documentType}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl flex={1}>
                <FormLabel
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                  fontSize="xs"
                  fontWeight="bold"
                  mb={1.5}
                  minH="20px"
                >
                  <span>Version Tag</span>
                </FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="e.g. V.1, V.2"
                  value={documentVersion}
                  onChange={(e) => setDocumentVersion(e.target.value)}
                />
              </FormControl>
            </Flex>

            {/* Document Title */}
            <FormControl isRequired isInvalid={!!errors.documentName}>
              <FormLabel
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                fontSize="xs"
                fontWeight="bold"
                mb={1.5}
                minH="20px"
              >
                <Icon as={FiFileText} />
                <span>Document Title / Description</span>
              </FormLabel>
              <Input
                size="sm"
                rounded="md"
                placeholder="e.g. Surat Perjanjian Kerjasama Pengadaan Server 2026"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
              {errors.documentName && (
                <FormErrorMessage fontSize="xs">{errors.documentName}</FormErrorMessage>
              )}
            </FormControl>

            {/* Document Number & Date */}
            <Flex gap={3} direction={{ base: "column", md: "row" }} align="flex-start">
              <FormControl flex={1}>
                <FormLabel
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                  fontSize="xs"
                  fontWeight="bold"
                  mb={1.5}
                  minH="20px"
                >
                  <Icon as={FiHash} />
                  <span>Document Reference Number</span>
                </FormLabel>
                <Input
                  size="sm"
                  rounded="md"
                  placeholder="e.g. PKS/IT/2026/089"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                  fontSize="xs"
                  fontWeight="bold"
                  mb={1.5}
                  minH="20px"
                >
                  <Icon as={FiCalendar} />
                  <span>Document Date</span>
                </FormLabel>
                <Input
                  size="sm"
                  type="date"
                  rounded="md"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </FormControl>
            </Flex>

            {/* File Drag and Drop Zone */}
            <FormControl isInvalid={!!errors.file}>
              <FormLabel
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                fontSize="xs"
                fontWeight="bold"
                mb={1.5}
                minH="20px"
              >
                <Icon as={FiUploadCloud} />
                <span>Attach File (PDF, DOCX, XLSX, max 25MB)</span>
              </FormLabel>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />

              {!selectedFile ? (
                <Box
                  p={6}
                  border="2px dashed"
                  borderColor={
                    dragActive
                      ? "teal.400"
                      : colorMode === "light"
                      ? "gray.300"
                      : "gray.600"
                  }
                  rounded="xl"
                  bg={
                    dragActive
                      ? colorMode === "light"
                        ? "teal.50"
                        : "teal.900"
                      : colorMode === "light"
                      ? "gray.50"
                      : "gray.800"
                  }
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: "teal.400",
                    bg: colorMode === "light" ? "teal.50/50" : "gray.750",
                  }}
                >
                  <VStack spacing={2}>
                    <Flex
                      p={3}
                      rounded="full"
                      bg={colorMode === "light" ? "teal.100" : "teal.800"}
                      color="teal.500"
                    >
                      <Icon as={FiUploadCloud} boxSize={6} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="semibold">
                      Click to browse or drag and drop file here
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Supports PDF, DOCX, XLSX, Scanned Images (Up to 25 MB)
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <Box
                  p={3.5}
                  border="1px solid"
                  borderColor="teal.300"
                  rounded="xl"
                  bg={colorMode === "light" ? "teal.50/60" : "teal.950/40"}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Flex
                        p={2}
                        rounded="lg"
                        bg="teal.500"
                        color="white"
                      >
                        <Icon as={FiFileText} boxSize={5} />
                      </Flex>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" isTruncated maxW="280px">
                          {selectedFile.name}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="teal" fontSize="3xs" rounded="md">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Badge>
                          <Text fontSize="3xs" color="gray.500">
                            Ready for MinIO Object Storage
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      leftIcon={<FiX />}
                    >
                      Remove
                    </Button>
                  </Flex>
                </Box>
              )}
              {errors.file && (
                <FormErrorMessage fontSize="xs">{errors.file}</FormErrorMessage>
              )}
            </FormControl>

            {/* Alternative External Link */}
            <FormControl>
              <FormLabel
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                fontSize="xs"
                fontWeight="bold"
                mb={1.5}
                minH="20px"
              >
                <Icon as={FiLink} />
                <span>Or External Cloud Document Link (Google Drive / SharePoint)</span>
              </FormLabel>
              <Input
                size="sm"
                rounded="md"
                placeholder="https://drive.google.com/... or https://sharepoint.com/..."
                value={linkAttachment}
                onChange={(e) => setLinkAttachment(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="1px"
          borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          py={3}
        >
          <HStack spacing={3}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleReset();
                onClose();
              }}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              leftIcon={<FiCheck />}
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Uploading to MinIO..."
            >
              Upload Document
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
