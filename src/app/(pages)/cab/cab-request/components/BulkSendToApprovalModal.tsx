"use client";

import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiEye,
  FiSend,
  FiXCircle,
} from "react-icons/fi";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { CabRequestItem } from "@/app/types/cabTypes";

export interface BulkSendToApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests: CabRequestItem[];
  onConfirmSend: (ids: string[], note?: string) => Promise<void>;
  isLoading?: boolean;
}

export const BulkSendToApprovalModal = ({
  isOpen,
  onClose,
  selectedRequests,
  onConfirmSend,
  isLoading = false,
}: BulkSendToApprovalModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const [note, setNote] = useState<string>("");

  const handleConfirm = async () => {
    const ids = selectedRequests.map((r) => r.id);
    await onConfirmSend(ids, note.trim() || undefined);
    setNote("");
  };

  const formatImplementationDate = (item: CabRequestItem): string => {
    const rawDate =
      item.targetDate ||
      item.scheduledDate ||
      item.tanggalPermohonanMigrasi ||
      item.tanggalImplementasi ||
      item.requestDate;
    if (!rawDate) return "—";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return rawDate;
    }
  };

  const getMigrationRecommendation = (
    item: CabRequestItem
  ): { isYes: boolean; label: string } => {
    const rek = String(
      item.rekomendasiUat || item.rekomendasiMigrasi || ""
    )
      .toUpperCase()
      .trim();

    if (
      rek === "REKOMENDASI_MIGRASI" ||
      rek === "YA" ||
      rek === "Y" ||
      rek === "TRUE"
    ) {
      return { isYes: true, label: "Ya" };
    }
    if (
      rek === "PENGUJIAN_ULANG" ||
      rek === "TIDAK" ||
      rek === "N" ||
      rek === "FALSE"
    ) {
      return { isYes: false, label: "Tidak" };
    }
    return { isYes: true, label: "Ya" };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        rounded={radiusStyle}
        bg={isDark ? "gray.850" : "white"}
        border="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        shadow="2xl"
        maxW={{ base: "95vw", md: "880px", lg: "960px" }}
      >
        {/* Header */}
        <ModalHeader pb={3} pt={5} px={6}>
          <HStack spacing={3} align="center">
            <Box
              w={10}
              h={10}
              rounded="lg"
              bg="green.500"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={FiCheckCircle} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Heading size="md" color={isDark ? "white" : "gray.800"}>
                Selesaikan Permohonan CAB Massal
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Penyelesaian implementasi berkas CAB secara massal (Status: COMPLETED)
              </Text>
            </VStack>
          </HStack>
          <ModalCloseButton top={4} right={4} />
        </ModalHeader>

        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

        {/* Body */}
        <ModalBody py={5} px={6}>
          <VStack spacing={4} align="stretch">
            {/* Info Box */}
            <Box
              p={3.5}
              bg={isDark ? "green.950" : "green.50"}
              border="1px solid"
              borderColor={isDark ? "green.800" : "green.200"}
              rounded="lg"
            >
              <HStack spacing={2.5} align="start">
                <Icon as={FiCheckSquare} color="green.500" boxSize={4} mt={0.5} />
                <Text fontSize="xs" color={isDark ? "green.200" : "green.800"} lineHeight="tall">
                  Sebanyak <b>{selectedRequests.length}</b> permohonan akan diselesaikan implementasinya secara resmi (Status ➔ <b>COMPLETED</b>).
                </Text>
              </HStack>
            </Box>

            {/* List Table */}
            <Box
              maxH="280px"
              overflowY="auto"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              rounded="lg"
            >
              <Table size="sm" variant="simple">
                <Thead
                  bg={isDark ? "gray.800" : "gray.50"}
                  position="sticky"
                  top={0}
                  zIndex={1}
                >
                  <Tr>
                    <Th width="35px" fontSize="2xs" textAlign="center">
                      NO.
                    </Th>
                    <Th fontSize="2xs">REQUEST NO</Th>
                    <Th fontSize="2xs">APLIKASI / JUDUL</Th>
                    <Th fontSize="2xs" width="135px">
                      TGL IMPLEMENTASI
                    </Th>
                    <Th fontSize="2xs" width="140px" textAlign="center">
                      REKOMENDASI MIGRASI
                    </Th>
                    <Th fontSize="2xs">PEMOHON</Th>
                    <Th width="80px" fontSize="2xs" textAlign="center">
                      AKSI
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedRequests.map((item, idx) => {
                    const migrasi = getMigrationRecommendation(item);
                    return (
                      <Tr
                        key={item.id}
                        _hover={{ bg: isDark ? "gray.800" : "gray.50" }}
                      >
                        <Td fontSize="xs" color="gray.500" textAlign="center">
                          {idx + 1}.
                        </Td>
                        <Td>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            fontFamily="mono"
                            color="secondary.600"
                          >
                            {item.requestNo}
                          </Text>
                          <Badge
                            fontSize="3xs"
                            colorScheme="purple"
                            variant="subtle"
                            rounded="sm"
                          >
                            {item.requestType}
                          </Badge>
                        </Td>
                        <Td maxW="220px">
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            noOfLines={1}
                            color={isDark ? "white" : "gray.800"}
                          >
                            {item.requestTitle}
                          </Text>
                          <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                            {item.projectName}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1.5}>
                            <Icon
                              as={FiCalendar}
                              boxSize={3}
                              color="blue.500"
                              flexShrink={0}
                            />
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={isDark ? "gray.200" : "gray.750"}
                            >
                              {formatImplementationDate(item)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td textAlign="center">
                          <Badge
                            colorScheme={migrasi.isYes ? "green" : "red"}
                            variant="subtle"
                            rounded="full"
                            px={2.5}
                            py={0.5}
                            fontSize="3xs"
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Icon
                              as={migrasi.isYes ? FiCheckCircle : FiXCircle}
                              boxSize={2.5}
                            />
                            {migrasi.label}
                          </Badge>
                        </Td>
                        <Td fontSize="xs" color={isDark ? "gray.300" : "gray.700"}>
                          {item.requesterName}
                        </Td>
                        <Td textAlign="center">
                          <Tooltip
                            label="Lihat Rincian Permohonan"
                            hasArrow
                            placement="top"
                          >
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="blue"
                              leftIcon={<FiEye />}
                              fontWeight="medium"
                              onClick={() => {
                                onClose();
                                router.push(
                                  `/cab/cab-request/detail?id=${item.id}`
                                );
                              }}
                            >
                              Detail
                            </Button>
                          </Tooltip>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Optional Note Field */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"}>
                Catatan Pengiriman (Opsional)
              </FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tambahkan catatan ringkas untuk Approver..."
                size="sm"
                rounded="lg"
                rows={3}
                fontSize="xs"
                bg={isDark ? "gray.800" : "white"}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

        {/* Footer */}
        <ModalFooter py={3.5} px={6} gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} isDisabled={isLoading}>
            Batal
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            bg="green.600"
            color="white"
            _hover={{ bg: "green.700" }}
            leftIcon={<FiCheckCircle />}
            isLoading={isLoading}
            loadingText="Memproses..."
            onClick={handleConfirm}
          >
            Selesaikan Permohonan ({selectedRequests.length})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkSendToApprovalModal;
