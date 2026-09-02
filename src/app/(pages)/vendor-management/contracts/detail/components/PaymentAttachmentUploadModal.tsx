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

interface PaymentAttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  tokenData: string;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: "BAST", label: "Berita Acara Serah Terima (BAST)" },
  { value: "INVOICE", label: "Invoice / Payment Billing" },
  { value: "SPP", label: "Payment Request Letter (SPP)" },
  { value: "SPTJB", label: "Expenditure Responsibility Statement (SPTJB)" },
  { value: "FAKTUR_PAJAK", label: "Tax Invoice (e-Faktur)" },
  { value: "OTHER", label: "Other Supporting Documents" },
];

export default function PaymentAttachmentUploadModal({
  isOpen,
  onClose,
  paymentId,
  tokenData,
  onSuccess,
}: PaymentAttachmentUploadModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UploadPaymentAttachment, isLoading } = useVendor();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documentType, setDocumentType] = useState<string>("BAST");
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
    setDocumentType("BAST");
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
    if (!documentNumber.trim()) errs.documentNumber = "Document number is required";
    if (!documentDate) errs.documentDate = "Document date is required";
    if (!selectedFile && !linkAttachment.trim()) {
      errs.file = "Please upload a document file or provide a valid external URL";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("ContractPaymentId", paymentId);
    formData.append("DocumentType", documentType);
    formData.append("DocumentName", documentName);
    formData.append("DocumentNumber", documentNumber);
    formData.append("DocumentDate", new Date(documentDate).toISOString());
    formData.append("DocumentVersion", documentVersion || "V.0");
    if (linkAttachment) {
      formData.append("LinkAttachment", linkAttachment);
    }
    if (selectedFile) {
      formData.append("File", selectedFile);
    }

    const res = await UploadPaymentAttachment(formData, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Payment work document uploaded successfully",
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
              bg={colorMode === "light" ? "blue.50" : "blue.900"}
              color="blue.500"
            >
              <Icon as={FiUploadCloud} boxSize={5} />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">
                Upload Payment Work Document
              </Text>
              <Text fontSize="xs" color="gray.500">
                Attach mandatory verification documents (BAST, Invoice, SPP, Tax)
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={2} />

        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            {/* Document Type & Version */}
            <Flex gap={3} direction={{ base: "column", md: "row" }}>
              <FormControl isRequired isInvalid={!!errors.documentType} flex={2}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  <HStack spacing={1}>
                    <Icon as={FiTag} />
                    <Text>Document Classification</Text>
                  </HStack>
                </FormLabel>
                <Select
                  size="sm"
                  rounded="lg"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </Select>
                {errors.documentType && (
                  <FormErrorMessage fontSize="2xs">{errors.documentType}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Version Tag
                </FormLabel>
                <Input
                  size="sm"
                  rounded="lg"
                  value={documentVersion}
                  onChange={(e) => setDocumentVersion(e.target.value)}
                  placeholder="e.g. V.0, Rev.1"
                />
              </FormControl>
            </Flex>

            {/* Document Name */}
            <FormControl isRequired isInvalid={!!errors.documentName}>
              <FormLabel fontSize="xs" fontWeight="bold">
                <HStack spacing={1}>
                  <Icon as={FiFileText} />
                  <Text>Document Title / Description</Text>
                </HStack>
              </FormLabel>
              <Input
                size="sm"
                rounded="lg"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. BAST Milestone 1 API Integration"
              />
              {errors.documentName && (
                <FormErrorMessage fontSize="2xs">{errors.documentName}</FormErrorMessage>
              )}
            </FormControl>

            {/* Document Number & Date */}
            <Flex gap={3} direction={{ base: "column", md: "row" }}>
              <FormControl isRequired isInvalid={!!errors.documentNumber} flex={1}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  <HStack spacing={1}>
                    <Icon as={FiHash} />
                    <Text>Document Number / Reference</Text>
                  </HStack>
                </FormLabel>
                <Input
                  size="sm"
                  rounded="lg"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. BAST/BJB/2026/08/001"
                />
                {errors.documentNumber && (
                  <FormErrorMessage fontSize="2xs">{errors.documentNumber}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.documentDate} flex={1}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  <HStack spacing={1}>
                    <Icon as={FiCalendar} />
                    <Text>Official Document Date</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="date"
                  size="sm"
                  rounded="lg"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
                {errors.documentDate && (
                  <FormErrorMessage fontSize="2xs">{errors.documentDate}</FormErrorMessage>
                )}
              </FormControl>
            </Flex>

            {/* File Drag and Drop Zone */}
            <FormControl isInvalid={!!errors.file}>
              <FormLabel fontSize="xs" fontWeight="bold">
                <HStack spacing={1}>
                  <Icon as={FiUploadCloud} />
                  <Text>Attachment File (PDF, DOCX, XLSX, Images up to 25MB)</Text>
                </HStack>
              </FormLabel>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
              />

              <Box
                p={5}
                rounded="xl"
                border="2px dashed"
                borderColor={
                  dragActive
                    ? "blue.500"
                    : errors.file
                    ? "red.400"
                    : colorMode === "light"
                    ? "gray.300"
                    : "gray.600"
                }
                bg={
                  dragActive
                    ? colorMode === "light"
                      ? "blue.50"
                      : "blue.900"
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
                  borderColor: "blue.500",
                  bg: colorMode === "light" ? "blue.50" : "gray.750",
                }}
              >
                {selectedFile ? (
                  <Flex align="center" justify="space-between" px={2}>
                    <HStack spacing={3}>
                      <Icon as={FiFileText} boxSize={6} color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                          {selectedFile.name}
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </Flex>
                ) : (
                  <VStack spacing={2}>
                    <Icon as={FiUploadCloud} boxSize={8} color="blue.500" />
                    <Text fontSize="xs" fontWeight="semibold">
                      Drag and drop your file here, or click to browse
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      Supports PDF, Word, Excel, and scan formats
                    </Text>
                  </VStack>
                )}
              </Box>
              {errors.file && (
                <FormErrorMessage fontSize="2xs">{errors.file}</FormErrorMessage>
              )}
            </FormControl>

            {/* External URL alternative */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="bold">
                <HStack spacing={1}>
                  <Icon as={FiLink} />
                  <Text>External Storage Link / SharePoint URL (Optional)</Text>
                </HStack>
              </FormLabel>
              <Input
                size="sm"
                rounded="lg"
                value={linkAttachment}
                onChange={(e) => setLinkAttachment(e.target.value)}
                placeholder="https://..."
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
              variant="ghost"
              rounded="lg"
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
              colorScheme="blue"
              rounded="lg"
              leftIcon={<FiCheck />}
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Uploading..."
            >
              Upload Document
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
