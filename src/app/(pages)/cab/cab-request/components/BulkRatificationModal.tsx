"use client";

import React, { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiShield,
  FiXCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { CabRequestItem } from "@/app/types/cabTypes";

export interface BulkRatificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests: CabRequestItem[];
  onConfirmRatify: (ids: string[], note?: string) => Promise<void>;
  isLoading?: boolean;
}

export const BulkRatificationModal = ({
  isOpen,
  onClose,
  selectedRequests,
  onConfirmRatify,
  isLoading = false,
}: BulkRatificationModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const [note, setNote] = useState<string>("Ratifikasi Mengetahui Emergency CAB");

  const handleConfirm = async () => {
    const ids = selectedRequests.map((r) => r.id);
    await onConfirmRatify(ids, note.trim() || undefined);
    setNote("Ratifikasi Mengetahui Emergency CAB");
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      isCentered
      closeOnOverlayClick={!isLoading}
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent
        rounded={radiusStyle}
        bg={isDark ? "gray.800" : "white"}
        borderColor={isDark ? "gray.700" : "gray.200"}
        borderWidth="1px"
        shadow="2xl"
        maxH="90vh"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader pb={2} pt={5} px={6}>
          <HStack spacing={3}>
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              rounded="lg"
              bg={isDark ? "red.900" : "red.50"}
              color={isDark ? "red.300" : "red.600"}
            >
              <Icon as={FiAlertTriangle} boxSize={5} />
            </Flex>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Heading size="md" fontWeight="bold">
                  Ratifikasi Emergency CAB (Mengetahui)
                </Heading>
                <Badge colorScheme="red" variant="solid" rounded="full" px={2.5}>
                  EMERGENCY
                </Badge>
              </HStack>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                Konfirmasi persetujuan & pencatatan formal (&ldquo;Mengetahui / As Known By&rdquo;) untuk permohonan emergency terpilih
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} top={4} right={4} />

        <Divider />

        <ModalBody py={4} px={6} overflowY="auto" flex="1">
          <VStack spacing={4} align="stretch">
            {/* Informational Banner */}
            <Alert
              status="info"
              variant="left-accent"
              rounded={radiusStyle}
              colorScheme="orange"
              py={3}
            >
              <AlertIcon as={FiShield} />
              <AlertDescription fontSize="xs">
                Perubahan berstatus <strong>Emergency</strong> dapat langsung dikerjakan demi menjaga kontinuitas layanan operasional. Ratifikasi ini mencatat pernyataan <strong>Mengetahui</strong> dari komite/approver berwenang untuk audit trail dan kepatuhan governance TI.
              </AlertDescription>
            </Alert>

            {/* Selected Items Summary Count */}
            <Flex
              justify="space-between"
              align="center"
              bg={isDark ? "gray.750" : "gray.50"}
              p={3}
              rounded={radiusStyle}
              borderWidth="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm" fontWeight="semibold">
                  Jumlah Permohonan Terpilih:
                </Text>
              </HStack>
              <Badge
                colorScheme="red"
                fontSize="sm"
                px={3}
                py={0.5}
                rounded="full"
                variant="subtle"
              >
                {selectedRequests.length} Permohonan
              </Badge>
            </Flex>

            {/* Table of Selected Items */}
            <Box
              borderWidth="1px"
              rounded={radiusStyle}
              borderColor={isDark ? "gray.700" : "gray.200"}
              overflow="hidden"
            >
              <Box maxH="220px" overflowY="auto">
                <Table size="sm" variant="simple">
                  <Thead
                    bg={isDark ? "gray.700" : "gray.50"}
                    position="sticky"
                    top={0}
                    zIndex={1}
                  >
                    <Tr>
                      <Th width="40px">#</Th>
                      <Th>No. Permohonan</Th>
                      <Th>Judul & Sistem</Th>
                      <Th>Alasan Emergency</Th>
                      <Th>Pemohon</Th>
                      <Th>Waktu</Th>
                      <Th width="40px" textAlign="center">Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedRequests.map((item, index) => (
                      <Tr
                        key={item.id}
                        _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                      >
                        <Td fontSize="xs" color="gray.500">
                          {index + 1}
                        </Td>
                        <Td fontSize="xs" fontWeight="semibold">
                          <HStack spacing={1}>
                            <Text>{item.requestNo || "—"}</Text>
                          </HStack>
                        </Td>
                        <Td fontSize="xs" maxW="200px">
                          <Text fontWeight="medium" noOfLines={1}>
                            {item.requestTitle || "—"}
                          </Text>
                          <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                            {item.applicationName || item.projectName || "—"}
                          </Text>
                        </Td>
                        <Td fontSize="xs" maxW="200px">
                          <Text
                            noOfLines={2}
                            color={isDark ? "red.300" : "red.700"}
                            fontSize="2xs"
                            bg={isDark ? "red.900" : "red.50"}
                            px={2}
                            py={1}
                            rounded="md"
                          >
                            {item.alasanEmergency ||
                              item.jenisCabEmergencyAlasan ||
                              "—"}
                          </Text>
                        </Td>
                        <Td fontSize="xs">
                          <Text noOfLines={1}>{item.requesterName || "—"}</Text>
                          <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                            {item.unitKerja || "—"}
                          </Text>
                        </Td>
                        <Td fontSize="xs" whiteSpace="nowrap">
                          <HStack spacing={1} color="gray.500">
                            <Icon as={FiCalendar} boxSize={3} />
                            <Text fontSize="2xs">
                              {formatDate(
                                item.targetDate ||
                                  item.tanggalImplementasi ||
                                  item.requestDate
                              )}
                            </Text>
                          </HStack>
                        </Td>
                        <Td textAlign="center">
                          <Tooltip label="Lihat Detail Permohonan">
                            <Button
                              size="2xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => {
                                window.open(
                                  `/cab/cab-request/detail?id=${item.id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <Icon as={FiEye} />
                            </Button>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Ratification Note Field */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="semibold">
                Catatan Ratifikasi / Keterangan Mengetahui
              </FormLabel>
              <Textarea
                size="sm"
                rounded={radiusStyle}
                rows={3}
                placeholder="Masukkan catatan atau pengesahan ratifikasi (opsional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                bg={isDark ? "gray.900" : "white"}
                borderColor={isDark ? "gray.600" : "gray.300"}
                fontSize="xs"
              />
              <Text fontSize="2xs" color="gray.500" mt={1}>
                Catatan ini akan direkam dalam log approval audit trail sebagai bukti pengesahan permohonan.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <Divider />

        <ModalFooter py={3} px={6}>
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              rounded={radiusStyle}
              onClick={onClose}
              isDisabled={isLoading}
              leftIcon={<Icon as={FiXCircle} />}
            >
              Batal
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              rounded={radiusStyle}
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText="Memproses Ratifikasi..."
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Ratifikasi Mengetahui ({selectedRequests.length})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkRatificationModal;
