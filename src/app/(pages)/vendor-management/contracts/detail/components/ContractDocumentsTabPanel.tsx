"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  IconButton,
  Tooltip,
  useColorMode,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiUploadCloud,
  FiDownload,
  FiTrash2,
  FiExternalLink,
  FiPaperclip,
  FiHardDrive,
  FiFile,
  FiImage,
  FiShield,
  FiLock,
  FiArchive,
} from "react-icons/fi";
import { VendorMediaResponse } from "@/app/services/useVendor";
import useVendor from "@/app/services/useVendor";
import useMediaObject from "@/app/services/useMediaObject";
import { useDownloadManagerModal } from "@/app/context/DownloadManagerContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import ContractAttachmentUploadModal from "./ContractAttachmentUploadModal";

interface ContractDocumentsTabPanelProps {
  contractId: string;
  mediaList: VendorMediaResponse[];
  tokenData: string;
  onRefresh: () => void;
}

export default function ContractDocumentsTabPanel({
  contractId,
  mediaList,
  tokenData,
  onRefresh,
}: ContractDocumentsTabPanelProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { openDownloadManager, activeJobsCount } = useDownloadManagerModal();
  const { DeleteContractAttachment, isLoading: isDeleting } = useVendor();
  const { SecureDownloadFiles, error: secureDownloadError } = useMediaObject();

  const uploadModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = React.useRef<any>(null);

  const [selectedRelId, setSelectedRelId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [downloadingIds, setDownloadingIds] = useState<{ [key: string]: boolean }>({});
  const [isBatchDownloading, setIsBatchDownloading] = useState<boolean>(false);

  const downloadableCount = mediaList.filter(
    (m) => m.objectName !== "EXTERNAL_LINK" && m.mediaId
  ).length;

  const getDocTypeBadge = (code?: string) => {
    switch (code?.toUpperCase()) {
      case "PKS_MAIN":
        return <Badge colorScheme="blue" rounded="md" fontSize="3xs" px={2} py={0.5}>PKS Utama</Badge>;
      case "SPK":
        return <Badge colorScheme="teal" rounded="md" fontSize="3xs" px={2} py={0.5}>SPK / PO</Badge>;
      case "ADDENDUM":
        return <Badge colorScheme="purple" rounded="md" fontSize="3xs" px={2} py={0.5}>Addendum</Badge>;
      case "PERFORMANCE_GUARANTEE":
        return <Badge colorScheme="green" rounded="md" fontSize="3xs" px={2} py={0.5}>Jaminan Pelaksanaan</Badge>;
      case "WARRANTY_CERTIFICATE":
        return <Badge colorScheme="orange" rounded="md" fontSize="3xs" px={2} py={0.5}>Jaminan Pemeliharaan</Badge>;
      case "SLA_DOCUMENT":
        return <Badge colorScheme="cyan" rounded="md" fontSize="3xs" px={2} py={0.5}>SLA Terms</Badge>;
      default:
        return <Badge colorScheme="gray" rounded="md" fontSize="3xs" px={2} py={0.5}>{code || "Document"}</Badge>;
    }
  };

  const getFileIcon = (ext?: string | null) => {
    const cleanExt = (ext || "").toLowerCase().replace(".", "");
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(cleanExt)) {
      return <Icon as={FiImage} color="pink.500" boxSize={4} />;
    }
    if (["pdf"].includes(cleanExt)) {
      return <Icon as={FiFileText} color="red.500" boxSize={4} />;
    }
    if (["doc", "docx"].includes(cleanExt)) {
      return <Icon as={FiFileText} color="blue.500" boxSize={4} />;
    }
    if (["xls", "xlsx", "csv"].includes(cleanExt)) {
      return <Icon as={FiFileText} color="green.500" boxSize={4} />;
    }
    return <Icon as={FiFile} color="gray.500" boxSize={4} />;
  };

  const handleSecureDownload = async (
    mediaObjectId: string,
    fileName: string,
    relId: string
  ) => {
    if (!tokenData) {
      showToast({
        description: "Authentication session expired. Please re-login.",
        statusToast: "error",
      });
      return;
    }

    setDownloadingIds((prev) => ({ ...prev, [relId]: true }));
    try {
      const cleanFileName = fileName.replace(/\.[^/.]+$/, "");
      const blob = await SecureDownloadFiles(
        [mediaObjectId],
        tokenData,
        contractId,
        "VENDOR_CONTRACT_DOCUMENTS",
        `${cleanFileName || "contract-document"}.zip`
      );

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cleanFileName || "contract-document"}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({
          description: "File downloaded successfully. OTP password has been sent to your email.",
          statusToast: "success",
        });
      } else {
        showToast({
          description: secureDownloadError || "Failed to download document",
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "An error occurred while downloading the document",
        statusToast: "error",
      });
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [relId]: false }));
    }
  };

  const handleBatchDownload = async () => {
    if (!tokenData) return;
    const downloadableFiles = mediaList.filter(
      (m) => m.objectName !== "EXTERNAL_LINK" && m.mediaId
    );
    if (downloadableFiles.length === 0) {
      showToast({
        description: "No downloadable files available.",
        statusToast: "warning",
      });
      return;
    }

    setIsBatchDownloading(true);
    try {
      const mediaIds = downloadableFiles.map((m) => m.mediaId);
      const zipName = `Contract-Docs-${new Date().toISOString().split("T")[0]}.zip`;
      const blob = await SecureDownloadFiles(
        mediaIds,
        tokenData,
        contractId,
        "VENDOR_CONTRACT_DOCUMENTS_BUNDLE",
        zipName
      );

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({
          description: `Bundle of ${downloadableFiles.length} files downloaded. OTP password sent to your email.`,
          statusToast: "success",
        });
      } else {
        showToast({
          description: secureDownloadError || "Failed to download documents bundle",
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "An error occurred while downloading documents bundle",
        statusToast: "error",
      });
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRelId) return;
    const res = await DeleteContractAttachment(selectedRelId, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Document attachment deleted successfully",
        statusToast: "success",
      });
      deleteDialog.onClose();
      setSelectedRelId(null);
      onRefresh();
    } else {
      showToast({
        description: res?.message || "Failed to delete attachment",
        statusToast: "error",
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Security Info Banner */}
      <Alert
        status="info"
        variant="left-accent"
        rounded="xl"
        bg={colorMode === "light" ? "blue.50/80" : "blue.950/40"}
        borderColor="blue.500"
        py={3}
      >
        <AlertIcon as={FiShield} color="blue.500" boxSize={5} />
        <AlertDescription fontSize="xs" color={colorMode === "light" ? "gray.700" : "gray.300"}>
          <strong>Secure Document Delivery (Watermark & Password Protected):</strong> All PDF files are automatically applied with official confidentiality watermarks and packaged into an encrypted ZIP file. The 6-digit access password will be dispatched to your registered corporate email.
        </AlertDescription>
      </Alert>

      {/* Header Card with Metrics & Action Buttons */}
      <Card
        rounded="2xl"
        shadow="md"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <CardHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"} py={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Flex
                p={2}
                rounded="lg"
                bg={colorMode === "light" ? "teal.50" : "teal.900"}
                color="teal.500"
              >
                <Icon as={FiPaperclip} boxSize={5} />
              </Flex>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="sm">Contract Files & Legal Attachments</Heading>
                  <Badge colorScheme="teal" rounded="full" px={2} fontSize="2xs">
                    {mediaList.length} Files
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Primary PKS agreements, SPK, addenda, and bank guarantee certificates stored securely in MinIO
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiDownload />}
                onClick={openDownloadManager}
              >
                Download Manager
                {activeJobsCount > 0 && (
                  <Badge
                    colorScheme="blue"
                    rounded="full"
                    ml={1.5}
                    px={1.5}
                    fontSize="2xs"
                  >
                    {activeJobsCount}
                  </Badge>
                )}
              </Button>
              {downloadableCount > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<FiArchive />}
                  onClick={handleBatchDownload}
                  isLoading={isBatchDownloading}
                  loadingText="Preparing ZIP..."
                >
                  Download All ({downloadableCount} Files)
                </Button>
              )}
              <Button
                size="sm"
                colorScheme="teal"
                leftIcon={<FiUploadCloud />}
                onClick={uploadModal.onOpen}
              >
                Upload Document
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody p={0}>
          {mediaList.length === 0 ? (
            <Box py={12} px={4} textAlign="center">
              <VStack spacing={3}>
                <Flex
                  p={4}
                  rounded="full"
                  bg={colorMode === "light" ? "gray.100" : "gray.800"}
                  color="gray.400"
                >
                  <Icon as={FiHardDrive} boxSize={8} />
                </Flex>
                <VStack spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">
                    No contract documents attached yet
                  </Text>
                  <Text fontSize="xs" color="gray.500" maxW="420px">
                    Attach signed PKS agreements, addenda, or warranty guarantee documents to keep complete audit trails.
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<FiUploadCloud />}
                  onClick={uploadModal.onOpen}
                  mt={2}
                >
                  Upload First Document
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={colorMode === "light" ? "gray.50" : "gray.850"}>
                  <Tr>
                    <Th fontSize="2xs" textTransform="uppercase" py={3}>Category</Th>
                    <Th fontSize="2xs" textTransform="uppercase" py={3}>Document Name / Ref</Th>
                    <Th fontSize="2xs" textTransform="uppercase" py={3}>Size / Type</Th>
                    <Th fontSize="2xs" textTransform="uppercase" py={3}>Uploaded Date</Th>
                    <Th fontSize="2xs" textTransform="uppercase" py={3}>Uploader</Th>
                    <Th fontSize="2xs" textTransform="uppercase" py={3} textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mediaList.map((item) => {
                    const downloadUrl = item.fileUrl || item.objectData;
                    const isLink = item.objectName === "EXTERNAL_LINK" || !item.objectExtension;
                    const isPdf = (item.objectExtension || "").toLowerCase() === ".pdf";

                    return (
                      <Tr key={item.relId} _hover={{ bg: colorMode === "light" ? "gray.50/70" : "gray.750" }}>
                        <Td>{getDocTypeBadge(item.objectCode)}</Td>
                        <Td>
                          <HStack spacing={2.5}>
                            {getFileIcon(item.objectExtension)}
                            <VStack align="start" spacing={0}>
                              <HStack spacing={1.5}>
                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                                  {item.objectRawName || item.objectName || "Unnamed File"}
                                </Text>
                                {isPdf && (
                                  <Tooltip label="Watermark & OTP protected" fontSize="3xs" hasArrow>
                                    <Badge colorScheme="blue" fontSize="3xs" rounded="full" px={1.5}>
                                      <HStack spacing={0.5}>
                                        <Icon as={FiLock} boxSize={2.5} />
                                        <span>OTP</span>
                                      </HStack>
                                    </Badge>
                                  </Tooltip>
                                )}
                              </HStack>
                              {item.objectName && item.objectName !== "EXTERNAL_LINK" && (
                                <Text fontSize="3xs" color="gray.400" isTruncated maxW="280px">
                                  {item.objectName}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="semibold">
                              {item.objectSize && item.objectSize > 0 ? `${item.objectSize.toFixed(1)} KB` : isLink ? "Cloud Link" : "< 1 KB"}
                            </Text>
                            <Text fontSize="3xs" color="gray.400" textTransform="uppercase">
                              {item.objectExtension ? item.objectExtension.replace(".", "") : "URL"}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.600">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "-"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.500">
                            {item.createdBy || "SYSTEM"}
                          </Text>
                        </Td>
                        <Td textAlign="right">
                          <HStack spacing={1} justify="flex-end">
                            {/* Secure Download for stored files */}
                            {!isLink && item.mediaId ? (
                              <Tooltip label="Secure Download (Watermarked PDF + Encrypted ZIP + OTP Email)" placement="top" hasArrow>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  aria-label="Secure Download File"
                                  icon={<FiDownload />}
                                  isLoading={!!downloadingIds[item.relId]}
                                  onClick={() =>
                                    handleSecureDownload(
                                      item.mediaId,
                                      item.objectRawName || item.objectName || "contract-document",
                                      item.relId
                                    )
                                  }
                                />
                              </Tooltip>
                            ) : isLink && downloadUrl ? (
                              <Tooltip label="Open External Cloud Document Link" placement="top" hasArrow>
                                <IconButton
                                  as="a"
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="teal"
                                  aria-label="Open Link"
                                  icon={<FiExternalLink />}
                                />
                              </Tooltip>
                            ) : null}

                            <Tooltip label="Delete Attachment" placement="top" hasArrow>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Delete document"
                                icon={<FiTrash2 />}
                                onClick={() => {
                                  setSelectedRelId(item.relId);
                                  setSelectedFileName(item.objectRawName || item.objectName);
                                  deleteDialog.onOpen();
                                }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Upload Modal */}
      <ContractAttachmentUploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.onClose}
        contractId={contractId}
        tokenData={tokenData}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent
            rounded="xl"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              Delete Contract Attachment
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm">
              Are you sure you want to delete <strong>{selectedFileName}</strong>? This action will remove the document reference and file from object storage.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDialog.onClose} size="sm" variant="outline">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                size="sm"
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete File
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
