"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Flex,
  Icon,
  useColorMode,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Progress,
  Divider,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiFileText,
  FiUploadCloud,
  FiRefreshCw,
  FiDownload,
  FiTrash2,
  FiCalendar,
  FiCheckCircle,
  FiLayers,
  FiPlus,
  FiBriefcase,
  FiUser,
  FiShield,
  FiEdit2,
  FiExternalLink,
  FiClock,
  FiTag,
  FiCheck,
  FiPieChart,
  FiInfo,
} from "react-icons/fi";
import useVendor, {
  VendorContractResponse,
  ContractPaymentResponse,
  ContractTopResponse,
  ContractPaymentAttachmentResponse,
  ContractPaymentTopAttachmentResponse,
  ContractPaymentUpdatePayload,
} from "@/app/services/useVendor";
import useMediaObject from "@/app/services/useMediaObject";
import { renderFileIconSTR, formatKBMB } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { formatIDR } from "@/app/components/CardContract";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import GeneratePaymentModal from "./GeneratePaymentModal";
import PaymentAttachmentUploadModal from "./PaymentAttachmentUploadModal";
import TopPaymentStatusModal from "./TopPaymentStatusModal";
import TopAttachmentUploadModal from "./TopAttachmentUploadModal";

interface ContractPaymentTabPanelProps {
  contract: VendorContractResponse;
  tokenData: string;
  onRefreshContract?: () => void;
}

export default function ContractPaymentTabPanel({
  contract,
  tokenData,
  onRefreshContract,
}: ContractPaymentTabPanelProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const {
    GetPaymentByContractId,
    UpdatePayment,
    DeletePaymentAttachment,
    DeleteTopAttachment,
    RecalculateMasterPayment,
    isLoading,
  } = useVendor();

  const { SecureDownloadFiles, error: secureDownloadError } = useMediaObject();
  const [downloadingIds, setDownloadingIds] = useState<{ [key: string]: boolean }>({});

  const [payment, setPayment] = useState<ContractPaymentResponse | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  // Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // TOP Step Modals state
  const [selectedTopForStatus, setSelectedTopForStatus] =
    useState<ContractTopResponse | null>(null);
  const [selectedTopForUpload, setSelectedTopForUpload] =
    useState<ContractTopResponse | null>(null);

  // Edit Payment State
  const [editMemoNo, setEditMemoNo] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("DRAFT");
  const [editStatusDate, setEditStatusDate] = useState<string>("");

  const fetchPayment = useCallback(async () => {
    if (!tokenData || !contract?.id) return;
    setIsFetching(true);
    try {
      const res = await GetPaymentByContractId(contract.id, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setPayment(res.data);
      } else {
        setPayment(null);
      }
    } catch {
      setPayment(null);
    } finally {
      setIsFetching(false);
    }
  }, [contract?.id, tokenData]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleRefreshAll = useCallback(async () => {
    await fetchPayment();
    if (onRefreshContract) {
      onRefreshContract();
    }
  }, [fetchPayment, onRefreshContract]);

  const handleSecureDownload = async (
    mediaObjectId: string,
    fileName: string,
    itemId: string
  ) => {
    if (!tokenData) return;
    setDownloadingIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      const blob = await SecureDownloadFiles(
        [mediaObjectId],
        tokenData,
        contract.id,
        "Vendor_TOP_Payment",
        `${fileName || "document"}.zip`
      );
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName || "document"}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({
          description: "File berhasil diunduh. Password dikirim ke email Anda.",
          statusToast: "success",
        });
      } else {
        showToast({
          description: secureDownloadError || "Gagal mengunduh file",
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Terjadi kesalahan saat mengunduh file",
        statusToast: "error",
      });
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleOpenEdit = () => {
    if (!payment) return;
    setEditMemoNo(payment.paymentMemoNo || "");
    setEditStatus(payment.paymentStatus || "DRAFT");
    setEditStatusDate(
      payment.paymentStatusDate
        ? new Date(payment.paymentStatusDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!payment) return;
    const payload: ContractPaymentUpdatePayload = {
      id: payment.id,
      paymentNo: payment.paymentNo ?? undefined,
      paymentMemoNo: editMemoNo || undefined,
      paymentContractWorkValue: payment.paymentContractWorkValue,
      paymentContractChangeValue: payment.paymentContractChangeValue,
      paymentContractStepChangeNumber: payment.paymentContractStepChangeNumber,
      paymentStatus: editStatus,
      paymentStatusDate: new Date(editStatusDate).toISOString(),
    };

    const res = await UpdatePayment(payload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Payment status updated successfully",
        statusToast: "success",
      });
      setIsEditModalOpen(false);
      handleRefreshAll();
    } else {
      showToast({
        description: res?.message || "Failed to update payment",
        statusToast: "error",
      });
    }
  };

  const handleRecalculate = async () => {
    if (!payment) return;
    setIsRecalculating(true);
    const res = await RecalculateMasterPayment(payment.id, tokenData);
    setIsRecalculating(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Master payment metrics recalculated successfully",
        statusToast: "success",
      });
      handleRefreshAll();
    } else {
      showToast({
        description: res?.message || "Recalculation failed",
        statusToast: "error",
      });
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;
    const res = await DeletePaymentAttachment(attId, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Attachment deleted successfully",
        statusToast: "success",
      });
      handleRefreshAll();
    } else {
      showToast({
        description: res?.message || "Failed to delete attachment",
        statusToast: "error",
      });
    }
  };

  const handleDeleteTopAttachment = async (topAttId: string) => {
    if (!confirm("Are you sure you want to delete this TOP attachment?")) return;
    const res = await DeleteTopAttachment(topAttId, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: "TOP attachment deleted and metrics recalculated",
        statusToast: "success",
      });
      handleRefreshAll();
    } else {
      showToast({
        description: res?.message || "Failed to delete TOP attachment",
        statusToast: "error",
      });
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "FULLY_PAID":
      case "PAID":
        return "green";
      case "PARTIALLY_PAID":
        return "teal";
      case "APPROVED":
        return "blue";
      case "VERIFIED":
        return "cyan";
      case "ON_PROGRESS":
      case "SUBMITTED":
        return "purple";
      case "REJECTED":
        return "red";
      case "DRAFT":
      case "PENDING":
      default:
        return "gray";
    }
  };

  const getTopStatusColor = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "green";
      case "APPROVED":
        return "teal";
      case "VERIFIED":
        return "blue";
      case "SUBMITTED":
        return "purple";
      case "REJECTED":
        return "red";
      case "PENDING":
      default:
        return "gray";
    }
  };

  if (isFetching) {
    return (
      <VStack spacing={4} align="stretch" py={4}>
        <Skeleton height="140px" rounded="2xl" />
        <Skeleton height="200px" rounded="2xl" />
        <Skeleton height="200px" rounded="2xl" />
      </VStack>
    );
  }

  // ─── STATE A: Payment Record Not Yet Generated (1:1 Empty State) ───────────
  if (!payment) {
    return (
      <Box py={6}>
        <Box
          p={8}
          textAlign="center"
          rounded="2xl"
          border="1px dashed"
          borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
        >
          <VStack spacing={4} maxW="540px" mx="auto">
            <Flex
              p={4}
              rounded="2xl"
              bg={colorMode === "light" ? "blue.100" : "blue.900"}
              color="blue.500"
            >
              <Icon as={FiLayers} boxSize={8} />
            </Flex>

            <VStack spacing={1}>
              <Text fontSize="md" fontWeight="bold">
                Payment & Disbursement Record Not Generated
              </Text>
              <Text fontSize="xs" color="gray.500">
                This vendor contract has not been linked to a master payment
                record. Generate the payment record to confirm parent project
                RBB budget lines and enable Term of Payment (TOP) tracking and
                document verification.
              </Text>
            </VStack>

            <Button
              colorScheme="blue"
              size="sm"
              rounded="xl"
              leftIcon={<FiPlus />}
              onClick={() => setIsGenerateOpen(true)}
            >
              Confirm & Generate Payment Record
            </Button>
          </VStack>
        </Box>

        {/* Generate Payment Modal */}
        {isGenerateOpen && (
          <GeneratePaymentModal
            isOpen={isGenerateOpen}
            onClose={() => setIsGenerateOpen(false)}
            contract={contract}
            tokenData={tokenData}
            onSuccess={fetchPayment}
          />
        )}
      </Box>
    );
  }

  // ─── Calculations for Progress Metrics ──────────────────────────────────────
  const workValue = payment.paymentContractWorkValue || contract.workValue || 1;
  const changeValue = payment.paymentContractChangeValue || 0;
  const percentPaid = Math.min(
    100,
    Math.max(0, (changeValue / workValue) * 100)
  );
  const totalTopSteps = (contract.topList || []).length;
  const activeStep = payment.paymentContractStepChangeNumber || 1;

  // TOP Analytics & Health Metrics for Right Widget
  const topList = contract.topList || [];
  const totalTopCount = topList.length;
  const paidTops = topList.filter(
    (t: ContractTopResponse) => t.topStatus?.toUpperCase() === "PAID"
  );
  const paidTopCount = paidTops.length;
  const totalPaidValue = paidTops.reduce(
    (sum: number, t: ContractTopResponse) => sum + (t.topValues || 0),
    0
  );
  const pendingTops = topList.filter(
    (t: ContractTopResponse) => t.topStatus?.toUpperCase() !== "PAID"
  );
  const pendingTopValue = pendingTops.reduce(
    (sum: number, t: ContractTopResponse) => sum + (t.topValues || 0),
    0
  );
  const topPaidPercentage =
    workValue > 0 ? (totalPaidValue / workValue) * 100 : 0;
  const nextUpcomingTop =
    pendingTops
      .slice()
      .sort(
        (a: ContractTopResponse, b: ContractTopResponse) =>
          (a.stepOrder || 0) - (b.stepOrder || 0)
      )[0] || null;

  const allTopAttachments = payment.topAttachments || [];
  const totalTopAttachments = allTopAttachments.length;
  const bastDocCount = allTopAttachments.filter(
    (a: ContractPaymentTopAttachmentResponse) =>
      a.documentType?.toUpperCase().includes("BAST")
  ).length;
  const invoiceDocCount = allTopAttachments.filter(
    (a: ContractPaymentTopAttachmentResponse) =>
      a.documentType?.toUpperCase().includes("INVOICE")
  ).length;
  const taxDocCount = allTopAttachments.filter(
    (a: ContractPaymentTopAttachmentResponse) =>
      !!a.taxInvoiceNumber || a.documentType?.toUpperCase().includes("PAJAK")
  ).length;

  // ─── STATE B: Payment Record Generated (Active Dashboard) ───────────────────
  return (
    <VStack spacing={6} align="stretch">
      {/* Header Summary Card */}
      <Box
        p={6}
        rounded="2xl"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
      >
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          wrap="wrap"
          gap={4}
          mb={4}
        >
          <HStack spacing={4}>
            <Flex
              p={3.5}
              rounded="xl"
              bg={colorMode === "light" ? "blue.50" : "blue.900"}
              color="blue.500"
            >
              <Icon as={FiDollarSign} boxSize={6} />
            </Flex>
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <Text fontSize="md" fontWeight="bold">
                  {payment.paymentNo || "PAY-RECORD"}
                </Text>
                <Badge
                  colorScheme={getStatusColor(payment.paymentStatus)}
                  variant="solid"
                  px={2.5}
                  py={0.5}
                  rounded="md"
                  fontSize="2xs"
                  fontWeight="bold"
                >
                  {payment.paymentStatus}
                </Badge>
                <Badge
                  colorScheme="blue"
                  variant="outline"
                  px={2}
                  py={0.5}
                  rounded="md"
                  fontSize="2xs"
                >
                  Tahap Realisasi #{activeStep} dari {totalTopSteps}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Memo No: <strong>{payment.paymentMemoNo || "N/A"}</strong> &bull;
                Status Date:{" "}
                {payment.paymentStatusDate
                  ? new Date(payment.paymentStatusDate).toLocaleDateString(
                      "id-ID"
                    )
                  : "-"}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Button
              size="xs"
              variant="outline"
              colorScheme="blue"
              rounded="lg"
              leftIcon={<FiRefreshCw />}
              onClick={handleRecalculate}
              isLoading={isRecalculating}
            >
              Recalculate Metrik
            </Button>

            <Button
              size="xs"
              variant="outline"
              rounded="lg"
              leftIcon={<FiEdit2 />}
              onClick={handleOpenEdit}
            >
              Edit Memo / Status
            </Button>

            <IconButton
              aria-label="Refresh payment"
              icon={<FiRefreshCw />}
              size="xs"
              variant="ghost"
              onClick={fetchPayment}
              isLoading={isLoading}
            />
          </HStack>
        </Flex>

        {/* Progress & Value Realization Bar */}
        <Box
          p={4}
          rounded="xl"
          bg={colorMode === "light" ? "gray.50" : "gray.850"}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <VStack align="start" spacing={0}>
              <Text
                fontSize="2xs"
                color="gray.500"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Realisasi Pembayaran (Disbursed Value)
              </Text>
              <Text fontSize="md" fontWeight="bold" color="teal.500">
                {formatIDR(changeValue)}{" "}
                <Text
                  as="span"
                  fontSize="xs"
                  fontWeight="normal"
                  color="gray.500"
                >
                  ({percentPaid.toFixed(1)}%)
                </Text>
              </Text>
            </VStack>

            <VStack align="end" spacing={0}>
              <Text
                fontSize="2xs"
                color="gray.500"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Total Nilai Kontrak Pekerjaan
              </Text>
              <Text fontSize="md" fontWeight="bold" color="blue.500">
                {formatIDR(workValue)}
              </Text>
            </VStack>
          </Flex>

          <Progress
            value={percentPaid}
            size="sm"
            colorScheme={percentPaid >= 100 ? "green" : "teal"}
            rounded="full"
            bg={colorMode === "light" ? "gray.200" : "gray.700"}
          />
        </Box>
      </Box>

      {/* Tripartite Snapshot Details (3 Columns) */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {/* Card 1: Project Information Snapshot */}
        <Box
          p={5}
          rounded="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
        >
          <VStack align="start" spacing={2}>
            <HStack spacing={2} color="blue.500">
              <Icon as={FiBriefcase} />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                Project Information
              </Text>
            </HStack>

            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="bold">
                {payment.projectName || "Parent Project"}
              </Text>
              <Text color="gray.500">Code: {payment.projectCode || "-"}</Text>
              <Text color="gray.500">
                Category: {payment.projectCategory || "-"}
              </Text>
              <Text color="gray.500">
                Owner Division:{" "}
                <strong>{payment.proOwnerDivisionName || "-"}</strong>
              </Text>
              <Text color="gray.500">
                Directorate: {payment.proOwnerDirectorateName || "-"}
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Card 2: Vendor Partner Snapshot */}
        <Box
          p={5}
          rounded="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
        >
          <VStack align="start" spacing={2}>
            <HStack spacing={2} color="purple.500">
              <Icon as={FiUser} />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                Vendor Partner
              </Text>
            </HStack>

            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="bold">
                {payment.vendorName || "Vendor Partner"}
              </Text>
              <Text color="gray.500">Code: {payment.vendorCode || "-"}</Text>
              <Text color="gray.500">Type: {payment.vendorType || "-"}</Text>
              <Text color="gray.500">
                PIC Business: {payment.vendorPicBusinessName || "-"} (
                {payment.vendorPicBusinessEmail || "-"})
              </Text>
              <Text color="gray.500">
                PIC Technical: {payment.vendorPicTechnicalName || "-"} (
                {payment.vendorPicTechnicalEmail || "-"})
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Card 3: Contract Summary */}
        <Box
          p={5}
          rounded="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
        >
          <VStack align="start" spacing={2}>
            <HStack spacing={2} color="teal.500">
              <Icon as={FiShield} />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                Contract Summary
              </Text>
            </HStack>

            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="bold">SPK: {contract.corpNumber}</Text>
              <Text color="gray.500">Corp: {contract.corpName}</Text>
              <Text color="teal.500" fontWeight="bold">
                Contract Value: {formatIDR(contract.workValue)}
              </Text>
              <HStack spacing={1}>
                <Badge colorScheme={contract.contractBillingType && contract.contractBillingType !== "MILESTONE" ? "purple" : "blue"} fontSize="2xs">
                  {contract.contractBillingType || "MILESTONE"}
                </Badge>
                {contract.subscriptionAutoRenew && <Badge colorScheme="green" fontSize="2xs">Auto-Renew</Badge>}
              </HStack>
              {contract.contractBillingType && contract.contractBillingType !== "MILESTONE" && (
                <Text color="purple.500" fontWeight="bold" fontSize="2xs">
                  Rate: {formatIDR(contract.subscriptionPeriodValue || 0)} / cycle
                </Text>
              )}
              <Text color="gray.500">
                Period:{" "}
                {new Date(contract.contractStartDate).toLocaleDateString(
                  "id-ID"
                )}{" "}
                &ndash;{" "}
                {new Date(contract.contractEndDate).toLocaleDateString("id-ID")}
              </Text>
              <Text color="gray.500">
                Capex: {formatIDR(contract.cavexValues || 0)}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* SECTION 1: Term of Payment (TOP) Schedule & Step Realization (70% - 30% Split Layout) */}
      <Box
        p={{ base: 4, md: 6 }}
        rounded="2xl"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        shadow="sm"
      >
        {/* Section Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          pb={4}
          borderBottom="1px"
          borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          wrap="wrap"
          gap={3}
        >
          <VStack align="start" spacing={0.5}>
            <HStack spacing={2}>
              <Icon as={FiLayers} color="purple.500" boxSize={5} />
              <Text fontSize="md" fontWeight="bold">
                Term of Payment (TOP) Milestones & Document Verification
              </Text>
              <Badge
                colorScheme="purple"
                fontSize="xs"
                px={2.5}
                py={0.5}
                rounded="full"
              >
                {totalTopCount} Milestones
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Lacak setiap tahapan termin, ubah status pembayaran termin, dan kelola dokumen verifikasi pendukung (BAST, Invoice, Faktur Pajak, Bukti Transfer).
            </Text>
          </VStack>
        </Flex>

        {/* 70% / 30% Flex Split Layout */}
        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="start">
          {/* LEFT 70%: TOP Milestones List with Dividers */}
          <Box flex={{ base: "1", lg: "7" }} w={{ base: "100%", lg: "70%" }}>
            {totalTopCount === 0 ? (
              <Box
                p={8}
                textAlign="center"
                rounded="xl"
                border="1px dashed"
                borderColor="gray.300"
                bg={colorMode === "light" ? "gray.50" : "gray.850"}
              >
                <Icon as={FiLayers} boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  Belum Ada Jadwal Termin (TOP)
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Kontrak ini belum memiliki daftar tahapan pembayaran TOP.
                </Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {contract.topList.map((top: ContractTopResponse, idx: number) => {
                  const stepAttachments = (payment.topAttachments || []).filter(
                    (a: ContractPaymentTopAttachmentResponse) =>
                      a.contractTopId === top.id
                  );
                  const topPercentage =
                    contract.workValue > 0
                      ? ((top.topValues / contract.workValue) * 100).toFixed(1)
                      : "0";
                  const isPaid = top.topStatus?.toUpperCase() === "PAID";
                  const isLastItem = idx === contract.topList.length - 1;

                  return (
                    <Box key={top.id} position="relative">
                      {/* Milestone Item Content */}
                      <Box
                        p={4}
                        rounded="xl"
                        transition="all 0.2s"
                        bg={
                          isPaid
                            ? colorMode === "light"
                              ? "green.50/60"
                              : "rgba(16, 185, 129, 0.05)"
                            : colorMode === "light"
                            ? "gray.50/80"
                            : "gray.850"
                        }
                        border="1px"
                        borderColor={
                          isPaid
                            ? colorMode === "light"
                              ? "green.200"
                              : "green.800"
                            : colorMode === "light"
                            ? "gray.200"
                            : "gray.700"
                        }
                      >
                        {/* Top Summary Bar */}
                        <Flex
                          justify="space-between"
                          align={{ base: "start", md: "center" }}
                          wrap="wrap"
                          gap={3}
                          mb={3}
                        >
                          <HStack spacing={3} align="center">
                            <Box
                              w={8}
                              h={8}
                              rounded="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontWeight="bold"
                              fontSize="xs"
                              bg={isPaid ? "green.500" : "blue.500"}
                              color="white"
                              flexShrink={0}
                            >
                              {isPaid ? <Icon as={FiCheck} boxSize={4} /> : `#${top.stepOrder}`}
                            </Box>

                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2} wrap="wrap" align="center">
                                <Text fontSize="md" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                  {formatIDR(top.topValues)}
                                </Text>
                                <Badge colorScheme="teal" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                                  {topPercentage}% Kontrak
                                </Badge>
                                <Badge
                                  colorScheme={getTopStatusColor(top.topStatus)}
                                  variant="solid"
                                  fontSize="2xs"
                                  px={2.5}
                                  py={0.5}
                                  rounded="full"
                                >
                                  {top.topStatus || "PENDING"}
                                </Badge>
                                {top.billingPeriodStart && top.billingPeriodEnd && (
                                  <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                                    Periode: {new Date(top.billingPeriodStart).toLocaleDateString("id-ID")} &rarr; {new Date(top.billingPeriodEnd).toLocaleDateString("id-ID")}
                                  </Badge>
                                )}
                                {top.isAutoGenerated && (
                                  <Badge colorScheme="cyan" variant="outline" fontSize="2xs" px={1.5} py={0.2} rounded="md">
                                    Auto
                                  </Badge>
                                )}
                              </HStack>

                              <HStack spacing={3} fontSize="xs" color="gray.500" wrap="wrap">
                                <HStack spacing={1}>
                                  <Icon as={FiCalendar} boxSize={3.5} />
                                  <Text>
                                    Target: {top.topDate ? new Date(top.topDate).toLocaleDateString("id-ID") : "-"}
                                  </Text>
                                </HStack>
                                {top.topDescriptions && (
                                  <HStack spacing={1}>
                                    <Icon as={FiFileText} boxSize={3.5} />
                                    <Text noOfLines={1}>
                                      {top.topDescriptions}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>

                          {/* Action Buttons */}
                          <HStack spacing={2} flexShrink={0}>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="blue"
                              rounded="lg"
                              leftIcon={<FiEdit2 />}
                              onClick={() => setSelectedTopForStatus(top)}
                            >
                              Update Status
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="teal"
                              rounded="lg"
                              leftIcon={<FiUploadCloud />}
                              onClick={() => setSelectedTopForUpload(top)}
                            >
                              Upload Dokumen
                            </Button>
                          </HStack>
                        </Flex>

                        {/* Documents Section inside this TOP Milestone */}
                        <Box
                          mt={2}
                          pt={3}
                          borderTop="1px dashed"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <HStack spacing={2}>
                              <Icon as={FiFileText} color="gray.400" boxSize={3.5} />
                              <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                Dokumen Verifikasi ({stepAttachments.length})
                              </Text>
                            </HStack>
                          </Flex>

                          {stepAttachments.length === 0 ? (
                            <Text fontSize="2xs" color="gray.400" fontStyle="italic" py={1}>
                              Belum ada dokumen yang diunggah untuk termin ini. Klik "Upload Dokumen" untuk melampirkan BAST, Invoice, Faktur Pajak, atau Bukti Bayar.
                            </Text>
                          ) : (
                            <Box
                              rounded="lg"
                              overflowX="auto"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                              bg={colorMode === "light" ? "white" : "gray.900"}
                            >
                              <Table size="sm" variant="simple">
                                <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                                  <Tr>
                                    <Th fontSize="2xs" py={2}>Jenis Dokumen</Th>
                                    <Th fontSize="2xs" py={2}>Nama & Nomor Ref</Th>
                                    <Th fontSize="2xs" py={2}>Realisasi (Rp)</Th>
                                    <Th fontSize="2xs" py={2}>Faktur Pajak</Th>
                                    <Th fontSize="2xs" py={2}>Tanggal</Th>
                                    <Th fontSize="2xs" py={2}>Versi</Th>
                                    <Th fontSize="2xs" py={2} textAlign="right">Aksi</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {stepAttachments.map((att: ContractPaymentTopAttachmentResponse) => (
                                    <Tr key={att.id}>
                                      <Td py={2}>
                                        <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                                          {att.documentType}
                                        </Badge>
                                      </Td>
                                      <Td py={2}>
                                        <VStack align="start" spacing={0.5}>
                                          <HStack spacing={1.5} align="center">
                                            {att.mediaObject && (
                                              <Box flexShrink={0}>
                                                {renderFileIconSTR(
                                                  att.mediaObject.objectExtension?.replace(".", "") || "file"
                                                )}
                                              </Box>
                                            )}
                                            <Text fontSize="xs" fontWeight="bold">
                                              {att.documentName}
                                            </Text>
                                          </HStack>
                                          <HStack spacing={1.5} flexWrap="wrap">
                                            <Text fontSize="3xs" color="gray.500">
                                              Ref: {att.documentNumber || "-"}
                                            </Text>
                                            {att.mediaObject?.objectExtension && (
                                              <Badge colorScheme="gray" fontSize="3xs" px={1} rounded="sm">
                                                {att.mediaObject.objectExtension.replace(".", "").toUpperCase()}
                                              </Badge>
                                            )}
                                            {att.mediaObject?.objectSize && (
                                              <Badge colorScheme="blue" fontSize="3xs" px={1} rounded="sm">
                                                {formatKBMB(att.mediaObject.objectSize)}
                                              </Badge>
                                            )}
                                          </HStack>
                                          {att.note && (
                                            <Text fontSize="3xs" color="gray.400">
                                              Note: {att.note}
                                            </Text>
                                          )}
                                        </VStack>
                                      </Td>
                                      <Td py={2} fontSize="xs" fontWeight="semibold">
                                        {att.topRealizationAmount ? formatIDR(att.topRealizationAmount) : "-"}
                                      </Td>
                                      <Td py={2} fontSize="xs">
                                        {att.taxInvoiceNumber ? (
                                          <Badge variant="outline" colorScheme="orange" fontSize="3xs">
                                            {att.taxInvoiceNumber}
                                          </Badge>
                                        ) : (
                                          "-"
                                        )}
                                      </Td>
                                      <Td py={2} fontSize="xs">
                                        {att.documentDate ? new Date(att.documentDate).toLocaleDateString("id-ID") : "-"}
                                      </Td>
                                      <Td py={2} fontSize="xs">
                                        <Badge variant="outline" fontSize="3xs">
                                          {att.documentVersion || "V.0"}
                                        </Badge>
                                      </Td>
                                      <Td py={2} textAlign="right">
                                        <HStack spacing={1} justify="flex-end">
                                          {att.linkAttachment && (
                                            <Tooltip label="Buka External Link" fontSize="2xs">
                                              <a href={att.linkAttachment} target="_blank" rel="noopener noreferrer">
                                                <IconButton
                                                  aria-label="Open link"
                                                  icon={<FiExternalLink />}
                                                  size="xs"
                                                  variant="ghost"
                                                />
                                              </a>
                                            </Tooltip>
                                          )}
                                          {att.mediaObjectId && (
                                            <Tooltip label="Download File (Secure OTP)" fontSize="2xs">
                                              <IconButton
                                                aria-label="Download attachment"
                                                icon={<FiDownload />}
                                                size="xs"
                                                colorScheme="blue"
                                                variant="ghost"
                                                isLoading={!!downloadingIds[att.id]}
                                                onClick={() =>
                                                  handleSecureDownload(
                                                    att.mediaObjectId!,
                                                    att.documentName || att.mediaObject?.objectRawName || "document",
                                                    att.id
                                                  )
                                                }
                                              />
                                            </Tooltip>
                                          )}
                                          <Tooltip label="Hapus Dokumen" fontSize="2xs">
                                            <IconButton
                                              aria-label="Delete attachment"
                                              icon={<FiTrash2 />}
                                              size="xs"
                                              colorScheme="red"
                                              variant="ghost"
                                              onClick={() => handleDeleteTopAttachment(att.id)}
                                            />
                                          </Tooltip>
                                        </HStack>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Divider between items */}
                      {!isLastItem && (
                        <Divider my={4} borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>

          {/* RIGHT 30%: Additional Info & Summary Widgets */}
          <Box flex={{ base: "1", lg: "3" }} w={{ base: "100%", lg: "30%" }}>
            <VStack spacing={4} align="stretch" position={{ lg: "sticky" }} top="20px">
              
              {/* Widget 1: TOP Financial & Realization Progress */}
              <Box
                p={4}
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "gray.50" : "gray.850"}
              >
                <HStack spacing={2} mb={3} color="purple.500">
                  <Icon as={FiPieChart} boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    TOP Realization Summary
                  </Text>
                </HStack>

                <VStack spacing={3} align="stretch">
                  <Box>
                    <Flex justify="space-between" align="center" mb={1} fontSize="xs">
                      <Text color="gray.500">Disbursed ({paidTopCount}/{totalTopCount} Termin)</Text>
                      <Text fontWeight="bold" color="teal.500">
                        {topPaidPercentage.toFixed(1)}%
                      </Text>
                    </Flex>
                    <Progress
                      value={topPaidPercentage}
                      size="xs"
                      colorScheme={topPaidPercentage >= 100 ? "green" : "teal"}
                      rounded="full"
                      bg={colorMode === "light" ? "gray.200" : "gray.700"}
                    />
                  </Box>

                  <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                  <VStack spacing={2} align="stretch" fontSize="xs">
                    <Flex justify="space-between">
                      <Text color="gray.500">Total TOP Terbayar:</Text>
                      <Text fontWeight="bold" color="green.500">
                        {formatIDR(totalPaidValue)}
                      </Text>
                    </Flex>

                    <Flex justify="space-between">
                      <Text color="gray.500">Sisa TOP Belum Cair:</Text>
                      <Text fontWeight="bold" color="orange.500">
                        {formatIDR(pendingTopValue)}
                      </Text>
                    </Flex>

                    <Flex justify="space-between">
                      <Text color="gray.500">Total Nilai Kontrak:</Text>
                      <Text fontWeight="bold" color="blue.500">
                        {formatIDR(contract.workValue)}
                      </Text>
                    </Flex>
                  </VStack>
                </VStack>
              </Box>

              {/* Widget 2: Next Upcoming Milestone Focus */}
              {nextUpcomingTop ? (
                <Box
                  p={4}
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
                  bg={colorMode === "light" ? "blue.50/50" : "rgba(59, 130, 246, 0.05)"}
                >
                  <HStack spacing={2} mb={2} color="blue.500">
                    <Icon as={FiClock} boxSize={4} />
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                      Next Pending Milestone
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={1.5} fontSize="xs">
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="bold">Termin #{nextUpcomingTop.stepOrder}</Text>
                      <Badge colorScheme={getTopStatusColor(nextUpcomingTop.topStatus)} fontSize="3xs" px={2} rounded="full">
                        {nextUpcomingTop.topStatus || "PENDING"}
                      </Badge>
                    </HStack>

                    <Text fontSize="sm" fontWeight="bold" color="blue.500">
                      {formatIDR(nextUpcomingTop.topValues)}
                    </Text>

                    <HStack spacing={1} color="gray.500" fontSize="2xs">
                      <Icon as={FiCalendar} boxSize={3} />
                      <Text>
                        Target: {nextUpcomingTop.topDate ? new Date(nextUpcomingTop.topDate).toLocaleDateString("id-ID") : "Belum ditentukan"}
                      </Text>
                    </HStack>

                    <HStack spacing={2} w="100%" mt={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        w="100%"
                        rounded="md"
                        leftIcon={<FiEdit2 />}
                        onClick={() => setSelectedTopForStatus(nextUpcomingTop)}
                      >
                        Update #{nextUpcomingTop.stepOrder}
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ) : (
                <Box
                  p={4}
                  rounded="xl"
                  border="1px"
                  borderColor="green.200"
                  bg={colorMode === "light" ? "green.50/50" : "rgba(16, 185, 129, 0.05)"}
                >
                  <HStack spacing={2} color="green.500">
                    <Icon as={FiCheckCircle} boxSize={4} />
                    <Text fontSize="xs" fontWeight="bold">
                      Semua Termin Selesai
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Seluruh tahapan TOP pada kontrak ini telah berstatus PAID.
                  </Text>
                </Box>
              )}

              {/* Widget 3: Document Verification & Audit Health */}
              <Box
                p={4}
                rounded="xl"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "gray.50" : "gray.850"}
              >
                <HStack spacing={2} mb={2.5} color="teal.500">
                  <Icon as={FiShield} boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    Document Compliance
                  </Text>
                </HStack>

                <VStack spacing={2} align="stretch" fontSize="xs">
                  <Flex justify="space-between">
                    <Text color="gray.500">Total Dokumen TOP:</Text>
                    <Badge colorScheme="purple" fontSize="2xs" rounded="md">
                      {totalTopAttachments} File
                    </Badge>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">BAST Terlampir:</Text>
                    <Text fontWeight="semibold">{bastDocCount} Dokumen</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Invoice / Tagihan:</Text>
                    <Text fontWeight="semibold">{invoiceDocCount} Dokumen</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Faktur Pajak:</Text>
                    <Text fontWeight="semibold">{taxDocCount} Dokumen</Text>
                  </Flex>

                  <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} my={1} />

                  <HStack spacing={1.5} color="gray.400" fontSize="3xs">
                    <Icon as={FiInfo} boxSize={3} />
                    <Text>Unduhan file dilindungi OTP Secure Password ke email.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Widget 4: Billing Cadence Summary */}
              {contract.contractBillingType && (
                <Box
                  p={4}
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "gray.50" : "gray.850"}
                >
                  <HStack spacing={2} mb={2} color="blue.500">
                    <Icon as={FiTag} boxSize={4} />
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                      Billing Cadence
                    </Text>
                  </HStack>

                  <VStack spacing={1.5} align="stretch" fontSize="xs">
                    <Flex justify="space-between" align="center">
                      <Text color="gray.500">Model Skema:</Text>
                      <Badge colorScheme={contract.contractBillingType !== "MILESTONE" ? "purple" : "blue"} fontSize="2xs">
                        {contract.contractBillingType}
                      </Badge>
                    </Flex>
                    {contract.subscriptionPeriodValue && contract.subscriptionPeriodValue > 0 && (
                      <Flex justify="space-between">
                        <Text color="gray.500">Rate Siklus:</Text>
                        <Text fontWeight="bold" color="purple.500">
                          {formatIDR(contract.subscriptionPeriodValue)}
                        </Text>
                      </Flex>
                    )}
                    {contract.subscriptionAutoRenew && (
                      <Flex justify="space-between">
                        <Text color="gray.500">Perpanjangan:</Text>
                        <Badge colorScheme="green" fontSize="3xs">Auto-Renew</Badge>
                      </Flex>
                    )}
                  </VStack>
                </Box>
              )}

            </VStack>
          </Box>
        </Flex>
      </Box>

      {/* SECTION 2: RBB Work Program Allocation & Realization */}
      <Box
        p={6}
        rounded="2xl"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        shadow="sm"
      >
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          wrap="wrap"
          gap={2}
        >
          <VStack align="start" spacing={0.5}>
            <HStack spacing={2}>
              <Icon as={FiLayers} color="blue.500" />
              <Text fontSize="sm" fontWeight="bold">
                RBB Work Program Realization
              </Text>
              <Badge
                colorScheme="blue"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="md"
              >
                {(payment.workPrograms || []).length} Lines
              </Badge>
            </HStack>
            <Text fontSize="2xs" color="gray.500">
              Budget lines allocated from project RBB accounts
            </Text>
          </VStack>
        </Flex>

        {(payment.workPrograms || []).length === 0 ? (
          <Box
            p={6}
            textAlign="center"
            rounded="xl"
            border="1px dashed"
            borderColor="gray.300"
          >
            <Text fontSize="xs" color="gray.500">
              No RBB work program lines recorded for this payment.
            </Text>
          </Box>
        ) : (
          <Box
            rounded="xl"
            overflow="hidden"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <Table size="sm" variant="simple">
              <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Tr>
                  <Th fontSize="2xs">RBB Source / Code</Th>
                  <Th fontSize="2xs">Account Name / Cost Center</Th>
                  <Th fontSize="2xs">Division</Th>
                  <Th fontSize="2xs" isNumeric>
                    Budget
                  </Th>
                  <Th fontSize="2xs" isNumeric>
                    Debit Realization
                  </Th>
                  <Th fontSize="2xs" isNumeric>
                    Leftovers
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {(payment.workPrograms || []).map((wp, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Badge colorScheme="blue" fontSize="2xs">
                          {wp.workProgramSource}
                        </Badge>
                        <Text fontSize="xs" fontWeight="bold">
                          {wp.workProgramCode || "N/A"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="semibold">
                          {wp.workProgramAccName || wp.workProgramName}
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          Acc: {wp.workProgramAccNumber || "-"} &bull; CC:{" "}
                          {wp.workProgramAccCc || "-"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td fontSize="xs">{wp.divisionName || "-"}</Td>
                    <Td isNumeric fontSize="xs" fontWeight="bold">
                      {formatIDR(wp.workProgramBudget)}
                    </Td>
                    <Td
                      isNumeric
                      fontSize="xs"
                      fontWeight="bold"
                      color="teal.500"
                    >
                      {formatIDR(wp.workProgramReal)}
                    </Td>
                    <Td
                      isNumeric
                      fontSize="xs"
                      fontWeight="bold"
                      color={
                        wp.workProgramLeftovers < 0 ? "red.400" : "gray.600"
                      }
                    >
                      {formatIDR(wp.workProgramLeftovers)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* SECTION 3: General Contract Payment Attachments */}
      <Box
        p={6}
        rounded="2xl"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        shadow="sm"
      >
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          wrap="wrap"
          gap={2}
        >
          <VStack align="start" spacing={0.5}>
            <HStack spacing={2}>
              <Icon as={FiFileText} color="teal.500" />
              <Text fontSize="sm" fontWeight="bold">
                General Contract Payment Documents
              </Text>
              <Badge
                colorScheme="teal"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="md"
              >
                {(payment.attachments || []).length} Files
              </Badge>
            </HStack>
            <Text fontSize="2xs" color="gray.500">
              Supporting verification files at master contract payment level
            </Text>
          </VStack>

          <Button
            size="xs"
            colorScheme="blue"
            rounded="lg"
            leftIcon={<FiUploadCloud />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload General Document
          </Button>
        </Flex>

        {(payment.attachments || []).length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            rounded="xl"
            border="1px dashed"
            borderColor="gray.300"
          >
            <VStack spacing={2}>
              <Icon as={FiUploadCloud} boxSize={6} color="gray.400" />
              <Text fontSize="xs" color="gray.500">
                No master-level documents attached. Click "Upload General
                Document" to add supporting files.
              </Text>
            </VStack>
          </Box>
        ) : (
          <Box
            rounded="xl"
            overflow="hidden"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <Table size="sm" variant="simple">
              <Thead bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Tr>
                  <Th fontSize="2xs">Document Type</Th>
                  <Th fontSize="2xs">Document Name / Ref Number</Th>
                  <Th fontSize="2xs">Date</Th>
                  <Th fontSize="2xs">Version</Th>
                  <Th fontSize="2xs">File Size</Th>
                  <Th fontSize="2xs" textAlign="right">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {(payment.attachments || []).map(
                  (att: ContractPaymentAttachmentResponse) => (
                    <Tr key={att.id}>
                      <Td>
                        <Badge
                          colorScheme="purple"
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          rounded="md"
                        >
                          {att.documentType}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2} align="center">
                            {att.mediaObject && (
                              <Box flexShrink={0}>
                                {renderFileIconSTR(
                                  att.mediaObject.objectExtension?.replace(".", "") || "file"
                                )}
                              </Box>
                            )}
                            <Text fontSize="xs" fontWeight="bold">
                              {att.documentName}
                            </Text>
                          </HStack>
                          <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize="2xs" color="gray.500">
                              Ref: {att.documentNumber}
                            </Text>
                            {att.mediaObject?.objectExtension && (
                              <Badge colorScheme="gray" fontSize="3xs" px={1} rounded="sm">
                                {att.mediaObject.objectExtension.replace(".", "").toUpperCase()}
                              </Badge>
                            )}
                            {att.mediaObject?.objectSize && (
                              <Badge colorScheme="blue" fontSize="3xs" px={1} rounded="sm">
                                {formatKBMB(att.mediaObject.objectSize)}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </Td>
                      <Td fontSize="xs">
                        {att.documentDate
                          ? new Date(att.documentDate).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </Td>
                      <Td fontSize="xs">
                        <Badge variant="outline" fontSize="2xs">
                          {att.documentVersion || "V.0"}
                        </Badge>
                      </Td>
                      <Td fontSize="2xs" color="gray.500">
                        {att.mediaObject?.objectSize
                          ? `${(att.mediaObject.objectSize / 1024).toFixed(
                              1
                            )} KB`
                          : "-"}
                      </Td>
                      <Td textAlign="right">
                        <HStack spacing={1} justify="flex-end">
                          {att.linkAttachment && (
                            <Tooltip
                              label="Open External Link"
                              fontSize="2xs"
                            >
                              <a
                                href={att.linkAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconButton
                                  aria-label="Open link"
                                  icon={<FiExternalLink />}
                                  size="xs"
                                  variant="ghost"
                                />
                              </a>
                            </Tooltip>
                          )}
                          {att.mediaObjectId && (
                            <Tooltip label="Download File (Secure OTP)" fontSize="2xs">
                              <IconButton
                                aria-label="Download attachment"
                                icon={<FiDownload />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                isLoading={!!downloadingIds[att.id]}
                                onClick={() =>
                                  handleSecureDownload(
                                    att.mediaObjectId!,
                                    att.documentName ||
                                      att.mediaObject?.objectRawName ||
                                      "document",
                                    att.id
                                  )
                                }
                              />
                            </Tooltip>
                          )}
                          <Tooltip label="Delete Document" fontSize="2xs">
                            <IconButton
                              aria-label="Delete attachment"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteAttachment(att.id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  )
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Upload General Attachment Modal */}
      {isUploadOpen && payment && (
        <PaymentAttachmentUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          paymentId={payment.id}
          tokenData={tokenData}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* TOP Step Status Modal */}
      {selectedTopForStatus && (
        <TopPaymentStatusModal
          isOpen={!!selectedTopForStatus}
          onClose={() => setSelectedTopForStatus(null)}
          contractTop={selectedTopForStatus}
          tokenData={tokenData}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* TOP Step Attachment Upload Modal */}
      {selectedTopForUpload && payment && (
        <TopAttachmentUploadModal
          isOpen={!!selectedTopForUpload}
          onClose={() => setSelectedTopForUpload(null)}
          paymentId={payment.id}
          contractTop={selectedTopForUpload}
          tokenData={tokenData}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* Edit Payment Memo / Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="md"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          rounded={radiusStyle}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <ModalHeader
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          >
            <Text fontSize="md" fontWeight="bold">
              Edit Payment Details
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Payment Memo Number
                </FormLabel>
                <Input
                  size="sm"
                  rounded="lg"
                  value={editMemoNo}
                  onChange={(e) => setEditMemoNo(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Payment Status
                </FormLabel>
                <Select
                  size="sm"
                  rounded="lg"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ON_PROGRESS">ON_PROGRESS</option>
                  <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                  <option value="FULLY_PAID">FULLY_PAID</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Status Date
                </FormLabel>
                <Input
                  type="date"
                  size="sm"
                  rounded="lg"
                  value={editStatusDate}
                  onChange={(e) => setEditStatusDate(e.target.value)}
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
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                rounded="lg"
                onClick={handleSaveEdit}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
