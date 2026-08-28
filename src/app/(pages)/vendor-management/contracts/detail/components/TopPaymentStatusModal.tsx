"use client";

import React, { useState, useEffect } from "react";
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
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiInfo,
  FiLayers,
} from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, {
  ContractTopResponse,
  ContractTopStatusUpdatePayload,
} from "@/app/services/useVendor";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";

interface TopPaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractTop: ContractTopResponse | null;
  tokenData: string;
  onSuccess: () => void;
}

const TOP_STATUS_OPTIONS = [
  { value: "PENDING", label: "PENDING - Belum Diajukan", color: "gray" },
  { value: "SUBMITTED", label: "SUBMITTED - Berkas Diajukan", color: "purple" },
  { value: "VERIFIED", label: "VERIFIED - Terverifikasi Keuangan", color: "blue" },
  { value: "APPROVED", label: "APPROVED - Disetujui Pencairan", color: "teal" },
  { value: "PAID", label: "PAID - Dana Sudah Cair / Dibayar", color: "green" },
  { value: "REJECTED", label: "REJECTED - Ditolak / Perlu Revisi", color: "red" },
];

export default function TopPaymentStatusModal({
  isOpen,
  onClose,
  contractTop,
  tokenData,
  onSuccess,
}: TopPaymentStatusModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { UpdateContractTopStatus, isLoading } = useVendor();

  const [topStatus, setTopStatus] = useState<string>("SUBMITTED");
  const [topDate, setTopDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (contractTop) {
      setTopStatus(contractTop.topStatus?.toUpperCase() || "SUBMITTED");
      if (contractTop.topDate) {
        setTopDate(new Date(contractTop.topDate).toISOString().split("T")[0]);
      } else {
        setTopDate(new Date().toISOString().split("T")[0]);
      }
      setNote(contractTop.topDescriptions || "");
    }
  }, [contractTop]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!topStatus) errs.topStatus = "Status is required";
    if (!topDate) errs.topDate = "Status date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!contractTop || !validate()) return;

    const payload: ContractTopStatusUpdatePayload = {
      contractTopId: contractTop.id,
      topStatus: topStatus,
      topDescriptions: note.trim() || undefined,
      topDate: new Date(topDate).toISOString(),
      note: note.trim() || undefined,
    };

    const res = await UpdateContractTopStatus(payload, tokenData);
    if (res && res.statusCode === RES_CODE_OK) {
      showToast({
        description: `Termin #${contractTop.stepOrder} status updated to ${topStatus}. Master payment recalculated.`,
        statusToast: "success",
      });
      onSuccess();
      onClose();
    } else {
      showToast({
        description: res?.message || "Failed to update milestone status.",
        statusToast: "error",
      });
    }
  };

  const isDark = colorMode === "dark";
  const bgCard = isDark ? "gray.800" : "gray.50";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
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
              <Icon as={FiLayers} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Update Termin Milestone Status
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                Termin #{contractTop?.stepOrder ?? 1} &bull; Rp{" "}
                {(contractTop?.topValues ?? 0).toLocaleString("id-ID")}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            {/* Step Snapshot Summary */}
            <Box
              p={3}
              borderRadius={radiusStyle}
              bg={bgCard}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                  CURRENT MILESTONE
                </Text>
                <Badge
                  colorScheme={
                    TOP_STATUS_OPTIONS.find(
                      (o) => o.value === contractTop?.topStatus?.toUpperCase()
                    )?.color || "gray"
                  }
                  fontSize="xs"
                  borderRadius="full"
                  px={2}
                >
                  {contractTop?.topStatus || "PENDING"}
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                Tahap {contractTop?.stepOrder} &mdash; Nilai Termin: Rp{" "}
                {(contractTop?.topValues ?? 0).toLocaleString("id-ID")}
              </Text>
              {contractTop?.topDescriptions && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Catatan: {contractTop.topDescriptions}
                </Text>
              )}
            </Box>

            {/* Target Status Select */}
            <FormControl isRequired isInvalid={!!errors.topStatus}>
              <FormLabel fontSize="xs" fontWeight="semibold">
                TARGET MILESTONE STATUS
              </FormLabel>
              <Select
                value={topStatus}
                onChange={(e) => setTopStatus(e.target.value)}
                borderRadius={radiusStyle}
                fontSize="sm"
                bg={isDark ? "gray.800" : "white"}
              >
                {TOP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {errors.topStatus && (
                <FormErrorMessage fontSize="xs">
                  {errors.topStatus}
                </FormErrorMessage>
              )}
            </FormControl>

            {/* Status Date */}
            <FormControl isRequired isInvalid={!!errors.topDate}>
              <FormLabel fontSize="xs" fontWeight="semibold">
                STATUS DATE / REALIZATION DATE
              </FormLabel>
              <HStack>
                <Icon as={FiCalendar} color="gray.400" />
                <Input
                  type="date"
                  value={topDate}
                  onChange={(e) => setTopDate(e.target.value)}
                  borderRadius={radiusStyle}
                  fontSize="sm"
                  bg={isDark ? "gray.800" : "white"}
                />
              </HStack>
              {errors.topDate && (
                <FormErrorMessage fontSize="xs">
                  {errors.topDate}
                </FormErrorMessage>
              )}
            </FormControl>

            {/* Note / Remarks */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="semibold">
                APPROVAL / VERIFICATION NOTES
              </FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masukkan catatan verifikasi atau nomor referensi persetujuan..."
                borderRadius={radiusStyle}
                fontSize="sm"
                rows={3}
                bg={isDark ? "gray.800" : "white"}
              />
            </FormControl>

            {/* Info Notice Box */}
            <Box
              p={3}
              borderRadius={radiusStyle}
              bg={isDark ? "blue.950" : "blue.50"}
              borderWidth="1px"
              borderColor={isDark ? "blue.800" : "blue.200"}
            >
              <HStack align="flex-start" spacing={2}>
                <Icon as={FiInfo} color="blue.500" mt={0.5} />
                <Text fontSize="xs" color={isDark ? "blue.200" : "blue.700"}>
                  Memperbarui status termin ini akan secara otomatis memperbarui
                  metrik pada Master Payment (Nomor Step Aktif, Akumulasi Nilai
                  Realisasi, Status Pembayaran Kontrak, dan Tanggal Status).
                </Text>
              </HStack>
            </Box>
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
              onClick={onClose}
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
              loadingText="Updating..."
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Confirm Update
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
