"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Textarea,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiUploadCloud,
  FiFileText,
  FiCalendar,
  FiHash,
  FiDollarSign,
  FiTag,
  FiLink,
  FiX,
  FiCheck,
  FiLayers,
  FiInfo,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, { ContractTopResponse } from "@/app/services/useVendor";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import { renderFileIconSTR, formatKBMB } from "@/app/helper/MasterHelper";

interface TopAttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  contractTop: ContractTopResponse | null;
  tokenData: string;
  onSuccess: () => void;
}

const TOP_DOCUMENT_TYPES = [
  { value: "BAST", label: "Berita Acara Serah Terima (BAST)" },
  { value: "INVOICE", label: "Invoice / Tagihan Termin" },
  { value: "BUKTI_TRANSFER", label: "Bukti Transfer / Pembayaran Bank" },
  { value: "FAKTUR_PAJAK", label: "Faktur Pajak (e-Faktur)" },
  { value: "SPP", label: "Surat Permohonan Pembayaran (SPP)" },
  { value: "SPTJB", label: "Surat Pernyataan Tanggung Jawab Belanja (SPTJB)" },
  { value: "OTHER", label: "Dokumen Pendukung Lainnya" },
];

export default function TopAttachmentUploadModal({
  isOpen,
  onClose,
  paymentId,
  contractTop,
  tokenData,
  onSuccess,
}: TopAttachmentUploadModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UploadTopAttachment, isLoading } = useVendor();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documentType, setDocumentType] = useState<string>("BAST");
  const [documentName, setDocumentName] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [documentVersion, setDocumentVersion] = useState<string>("V.0");
  const [topRealizationAmount, setTopRealizationAmount] = useState<number>(0);
  const [taxInvoiceNumber, setTaxInvoiceNumber] = useState<string>("");
  const [linkAttachment, setLinkAttachment] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (contractTop) {
      setTopRealizationAmount(contractTop.topValues || 0);
      setDocumentName(
        `Dokumen Realisasi Termin #${contractTop.stepOrder}`
      );
    }
  }, [contractTop]);

  const handleReset = () => {
    setDocumentType("BAST");
    setDocumentName("");
    setDocumentNumber("");
    setDocumentDate(new Date().toISOString().split("T")[0]);
    setDocumentVersion("V.0");
    setTopRealizationAmount(contractTop?.topValues || 0);
    setTaxInvoiceNumber("");
    setLinkAttachment("");
    setNote("");
    setSelectedFile(null);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName || documentName.startsWith("Dokumen Realisasi")) {
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
      if (!documentName || documentName.startsWith("Dokumen Realisasi")) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!documentType) errs.documentType = "Document type is required";
    if (!documentName.trim()) errs.documentName = "Document title is required";
    if (!documentNumber.trim()) errs.documentNumber = "Document / reference number is required";
    if (!documentDate) errs.documentDate = "Document date is required";
    if (!selectedFile && !linkAttachment.trim()) {
      errs.file = "Please upload a document file or provide a valid link URL";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!contractTop || !paymentId || !validate()) return;

    const formData = new FormData();
    formData.append("ContractPaymentId", paymentId);
    formData.append("ContractTopId", contractTop.id);
    formData.append("DocumentType", documentType);
    formData.append("DocumentName", documentName.trim());
    formData.append("DocumentNumber", documentNumber.trim());
    formData.append("DocumentDate", new Date(documentDate).toISOString());
    formData.append("DocumentVersion", documentVersion || "V.0");
    if (topRealizationAmount > 0) {
      formData.append("TopRealizationAmount", topRealizationAmount.toString());
    }
    if (taxInvoiceNumber.trim()) {
      formData.append("TaxInvoiceNumber", taxInvoiceNumber.trim());
    }
    if (linkAttachment.trim()) {
      formData.append("LinkAttachment", linkAttachment.trim());
    }
    if (note.trim()) {
      formData.append("Note", note.trim());
    }
    if (selectedFile) {
      formData.append("File", selectedFile);
    }

    const res = await UploadTopAttachment(formData, tokenData);
    if (res && res.statusCode === RES_CODE_OK) {
      showToast({
        description: `Document for Termin #${contractTop.stepOrder} uploaded and master payment recalculated.`,
        statusToast: "success",
      });
      handleReset();
      onSuccess();
      onClose();
    } else {
      showToast({
        description: res?.message || "An error occurred while uploading the document.",
        statusToast: "error",
      });
    }
  };

  const isDark = colorMode === "dark";
  const bgCard = isDark ? "gray.800" : "gray.50";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      size="2xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={isDark ? "gray.900" : "white"}
        borderRadius={radiusStyle}
        borderColor={borderColor}
        borderWidth="1px"
        shadow="2xl"
      >
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={4}>
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="md"
              bg={isDark ? "blue.900" : "blue.50"}
              color={isDark ? "blue.200" : "blue.600"}
            >
              <Icon as={FiUploadCloud} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Upload Termin Payment Document
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                Termin #{contractTop?.stepOrder ?? 1} &bull; Nilai: Rp{" "}
                {(contractTop?.topValues ?? 0).toLocaleString("id-ID")}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            {/* Step snapshot banner */}
            <Box
              p={3}
              borderRadius={radiusStyle}
              bg={bgCard}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Icon as={FiLayers} color="blue.500" />
                  <Text fontSize="sm" fontWeight="bold">
                    Tahap Realisasi Termin #{contractTop?.stepOrder}
                  </Text>
                </HStack>
                <Badge colorScheme="blue" borderRadius="full" px={2.5}>
                  Alokasi: Rp {(contractTop?.topValues ?? 0).toLocaleString("id-ID")}
                </Badge>
              </Flex>
            </Box>

            {/* Document Type & Version */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.documentType}>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  DOCUMENT TYPE
                </FormLabel>
                <Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                >
                  {TOP_DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </Select>
                {errors.documentType && (
                  <FormErrorMessage fontSize="xs">
                    {errors.documentType}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  DOCUMENT VERSION
                </FormLabel>
                <Input
                  value={documentVersion}
                  onChange={(e) => setDocumentVersion(e.target.value)}
                  placeholder="e.g. V.0, V.1, Final"
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
              </FormControl>
            </SimpleGrid>

            {/* Document Name & Document Number */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.documentName}>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  DOCUMENT TITLE / NAME
                </FormLabel>
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. BAST Termin 1 Pekerjaan..."
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
                {errors.documentName && (
                  <FormErrorMessage fontSize="xs">
                    {errors.documentName}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.documentNumber}>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  DOCUMENT / REF NUMBER
                </FormLabel>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. BAST/001/ENG/2026"
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
                {errors.documentNumber && (
                  <FormErrorMessage fontSize="xs">
                    {errors.documentNumber}
                  </FormErrorMessage>
                )}
              </FormControl>
            </SimpleGrid>

            {/* Document Date & Realization Amount */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.documentDate}>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  DOCUMENT DATE
                </FormLabel>
                <Input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
                {errors.documentDate && (
                  <FormErrorMessage fontSize="xs">
                    {errors.documentDate}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  REALIZATION AMOUNT (IDR)
                </FormLabel>
                <Input
                  type="number"
                  value={topRealizationAmount}
                  onChange={(e) =>
                    setTopRealizationAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
              </FormControl>
            </SimpleGrid>

            {/* Tax Invoice Number & Link */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  TAX INVOICE NO. (FAKTUR PAJAK)
                </FormLabel>
                <Input
                  value={taxInvoiceNumber}
                  onChange={(e) => setTaxInvoiceNumber(e.target.value)}
                  placeholder="e.g. 010.000-26.12345678"
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="semibold">
                  EXTERNAL DOCUMENT LINK (OPTIONAL)
                </FormLabel>
                <Input
                  value={linkAttachment}
                  onChange={(e) => setLinkAttachment(e.target.value)}
                  placeholder="https://..."
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
              </FormControl>
            </SimpleGrid>

            {/* Notes */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="semibold">
                DESCRIPTION / NOTES
              </FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan dokumen pendukung..."
                borderRadius={radiusStyle}
                fontSize="sm"
                rows={2}
                bg={isDark ? "gray.800" : "white"}
              />
            </FormControl>

            {/* File Upload Drag & Drop Area */}
            <FormControl isInvalid={!!errors.file}>
              <FormLabel fontSize="xs" fontWeight="semibold">
                UPLOAD DOCUMENT FILE
              </FormLabel>
              <Box
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={
                  errors.file
                    ? "red.400"
                    : dragActive
                    ? "blue.400"
                    : borderColor
                }
                borderRadius={radiusStyle}
                p={5}
                textAlign="center"
                bg={
                  dragActive
                    ? isDark
                      ? "blue.950"
                      : "blue.50"
                    : isDark
                    ? "gray.800"
                    : "gray.50"
                }
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.400",
                  bg: isDark ? "gray.750" : "blue.50",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg"
                />

                {selectedFile ? (
                  <VStack spacing={2}>
                    <HStack spacing={3} align="center">
                      <Box flexShrink={0}>
                        {renderFileIconSTR(
                          selectedFile.name.split(".").pop() || "file"
                        )}
                      </Box>
                      <VStack align="start" spacing={0.5}>
                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                          {selectedFile.name}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="gray" fontSize="3xs">
                            {(selectedFile.name.split(".").pop() || "").toUpperCase()}
                          </Badge>
                          <Badge colorScheme="blue" fontSize="3xs">
                            {formatKBMB(selectedFile.size / 1024)}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      Click or drag to replace file
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<Icon as={FiX} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove File
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={1}>
                    <Icon as={FiUploadCloud} boxSize={8} color="blue.500" />
                    <Text fontSize="sm" fontWeight="semibold">
                      Drag and drop document here, or browse
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Supports PDF, Office (Word/Excel/PPT), ZIP, RAR, Images (Max 120MB)
                    </Text>
                  </VStack>
                )}
              </Box>
              {errors.file && (
                <FormErrorMessage fontSize="xs">{errors.file}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={borderColor}
          justifyContent="flex-end"
          py={3}
        >
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              borderRadius={radiusStyle}
              onClick={() => {
                handleReset();
                onClose();
              }}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              borderRadius={radiusStyle}
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Uploading..."
              leftIcon={<Icon as={FiUploadCloud} />}
            >
              Upload Document
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
