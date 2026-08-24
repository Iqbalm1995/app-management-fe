"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
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
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiLayers,
  FiList,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { BulkScheduleCabItemPayload, CabRequestItem } from "@/app/types/cabTypes";

export interface BulkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests: CabRequestItem[];
  onConfirmSchedule: (items: BulkScheduleCabItemPayload[]) => Promise<void>;
  isLoading?: boolean;
  initialDate?: string;
}

type SchedulingMode = "UNIFIED" | "STAGGERED";

interface StaggeredSlot {
  startTime: string;
  endTime: string;
  customLocation?: string;
}

// Helper: Add minutes to HH:mm string
const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  if (!timeStr || !timeStr.includes(":")) return "09:30";
  const [h, m] = timeStr.split(":").map(Number);
  const totalMinutes = (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m) + minutesToAdd;
  const wrappedMinutes = totalMinutes % (24 * 60);
  const newH = Math.floor(wrappedMinutes / 60);
  const newM = wrappedMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
};

export const BulkScheduleModal = ({
  isOpen,
  onClose,
  selectedRequests,
  onConfirmSchedule,
  isLoading = false,
  initialDate,
}: BulkScheduleModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();

  const [mode, setMode] = useState<SchedulingMode>("UNIFIED");

  // Shared state
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [cabLocation, setCabLocation] = useState<string>("Ruang Rapat CAB Lt. 5 & Microsoft Teams");

  // Mode A: Unified Slot State
  const [unifiedStartTime, setUnifiedStartTime] = useState<string>("09:00");
  const [unifiedEndTime, setUnifiedEndTime] = useState<string>("10:30");

  // Mode B: Staggered Slot State
  const [staggerBaseStartTime, setStaggerBaseStartTime] = useState<string>("09:00");
  const [staggerDuration, setStaggerDuration] = useState<number>(30);
  const [staggerSlots, setStaggerSlots] = useState<Record<string, StaggeredSlot>>({});

  // Reset & initialize form when opened
  useEffect(() => {
    if (isOpen) {
      const defaultDate =
        initialDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      setScheduledDate(defaultDate);
      setCabLocation("Ruang Rapat CAB Lt. 5 & Microsoft Teams");
      setUnifiedStartTime("09:00");
      setUnifiedEndTime("10:30");
      setStaggerBaseStartTime("09:00");
      setStaggerDuration(30);

      // Initialize staggered slots
      const initialSlots: Record<string, StaggeredSlot> = {};
      let currentStart = "09:00";
      selectedRequests.forEach((req) => {
        const nextEnd = addMinutesToTime(currentStart, 30);
        initialSlots[req.id] = {
          startTime: currentStart,
          endTime: nextEnd,
        };
        currentStart = nextEnd;
      });
      setStaggerSlots(initialSlots);
    }
  }, [isOpen, initialDate, selectedRequests]);

  // Handler: Auto-generate staggered slots sequentially
  const handleAutoGenerateStaggered = () => {
    let currentStart = staggerBaseStartTime || "09:00";
    const updated: Record<string, StaggeredSlot> = {};

    selectedRequests.forEach((req) => {
      const nextEnd = addMinutesToTime(currentStart, Number(staggerDuration) || 30);
      updated[req.id] = {
        startTime: currentStart,
        endTime: nextEnd,
        customLocation: staggerSlots[req.id]?.customLocation,
      };
      currentStart = nextEnd;
    });

    setStaggerSlots(updated);
    toast({
      title: "Urutan Jadwal Dibuat",
      description: `Jadwal berhasil di-stagger setiap ${staggerDuration} menit untuk ${selectedRequests.length} permohonan.`,
      status: "info",
      duration: 2500,
      position: "top",
      isClosable: true,
    });
  };

  // Handler: Update individual staggered slot
  const handleSlotChange = (
    reqId: string,
    field: "startTime" | "endTime" | "customLocation",
    val: string
  ) => {
    setStaggerSlots((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        [field]: val,
      },
    }));
  };

  // Validation
  const isValid = useMemo(() => {
    if (!scheduledDate) return false;
    if (selectedRequests.length === 0) return false;

    if (mode === "UNIFIED") {
      if (!unifiedStartTime || !unifiedEndTime) return false;
      return unifiedStartTime < unifiedEndTime;
    } else {
      for (const req of selectedRequests) {
        const slot = staggerSlots[req.id];
        if (!slot?.startTime || !slot?.endTime) return false;
        if (slot.startTime >= slot.endTime) return false;
      }
      return true;
    }
  }, [mode, scheduledDate, unifiedStartTime, unifiedEndTime, selectedRequests, staggerSlots]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: "Periksa Isian Jadwal",
        description: "Pastikan tanggal dan jam mulai lebih awal dari jam selesai.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    const payloadItems: BulkScheduleCabItemPayload[] = selectedRequests.map((req) => {
      if (mode === "UNIFIED") {
        return {
          id: req.id,
          scheduledDate: `${scheduledDate}T${unifiedStartTime}:00`,
          scheduledEndDate: `${scheduledDate}T${unifiedEndTime}:00`,
          cabLocation: cabLocation.trim() || undefined,
        };
      } else {
        const slot = staggerSlots[req.id] || {
          startTime: unifiedStartTime,
          endTime: unifiedEndTime,
        };
        return {
          id: req.id,
          scheduledDate: `${scheduledDate}T${slot.startTime}:00`,
          scheduledEndDate: `${scheduledDate}T${slot.endTime}:00`,
          cabLocation: (slot.customLocation || cabLocation).trim() || undefined,
        };
      }
    });

    await onConfirmSchedule(payloadItems);
  };

  const formattedTargetDate = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <ModalContent
        rounded={radiusStyle}
        bg={isDark ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
      >
        <ModalHeader
          borderBottomWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          py={4}
        >
          <HStack spacing={3}>
            <Box
              w={10}
              h={10}
              rounded="lg"
              bg="blue.500"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCalendar} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Heading size="md" color={isDark ? "white" : "gray.800"}>
                  Bulk Schedule
                </Heading>
                <Badge colorScheme="blue" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="xs">
                  {selectedRequests.length} Permohonan Terpilih
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                Tetapkan tanggal, waktu pelaksanaan rapat, dan lokasi sidang CAB untuk permohonan yang dipilih.
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={5}>
          <VStack spacing={5} align="stretch">
            {/* Mode Switcher */}
            <Box
              p={3}
              rounded="lg"
              bg={isDark ? "gray.750" : "gray.50"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={3}
              >
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.200" : "gray.700"}>
                    Metode Penjadwalan:
                  </Text>
                  <Text fontSize="2xs" color="gray.500">
                    {mode === "UNIFIED"
                      ? "Seluruh permohonan dibahas dalam satu sesi rapat gabungan yang sama."
                      : "Setiap permohonan memiliki slot waktu tersendiri secara berurutan."}
                  </Text>
                </VStack>

                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    leftIcon={<FiLayers />}
                    colorScheme={mode === "UNIFIED" ? "blue" : "gray"}
                    variant={mode === "UNIFIED" ? "solid" : "outline"}
                    onClick={() => setMode("UNIFIED")}
                  >
                    Sesi Serentak (Satu Waktu)
                  </Button>
                  <Button
                    leftIcon={<FiList />}
                    colorScheme={mode === "STAGGERED" ? "blue" : "gray"}
                    variant={mode === "STAGGERED" ? "solid" : "outline"}
                    onClick={() => setMode("STAGGERED")}
                  >
                    Sesi Berurutan (Slot Terpisah)
                  </Button>
                </ButtonGroup>
              </Flex>
            </Box>

            {/* Shared Fields: Tanggal & Lokasi */}
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Tanggal Sidang CAB
                </FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiCalendar} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    rounded="md"
                  />
                </InputGroup>
              </FormControl>

              <FormControl flex={1.5}>
                <FormLabel fontSize="xs" fontWeight="bold">
                  Ruangan / Link Pertemuan
                </FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMapPin} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Contoh: Ruang Rapat CAB Lt. 5 / Link MS Teams"
                    value={cabLocation}
                    onChange={(e) => setCabLocation(e.target.value)}
                    rounded="md"
                  />
                </InputGroup>
              </FormControl>
            </Flex>

            <Divider />

            {/* ─── Mode A: Unified Scheduling Form ─── */}
            {mode === "UNIFIED" && (
              <Box
                p={4}
                rounded="lg"
                bg={isDark ? "gray.750" : "blue.50"}
                border="1px solid"
                borderColor={isDark ? "blue.900" : "blue.200"}
              >
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="blue.500" />
                    <Heading size="xs" color={isDark ? "blue.300" : "blue.800"}>
                      Waktu Pelaksanaan Sesi Rapat Gabungan
                    </Heading>
                  </HStack>

                  <Flex direction={{ base: "column", sm: "row" }} gap={4}>
                    <FormControl isRequired flex={1}>
                      <FormLabel fontSize="xs">Jam Mulai</FormLabel>
                      <Input
                        type="time"
                        size="sm"
                        value={unifiedStartTime}
                        onChange={(e) => setUnifiedStartTime(e.target.value)}
                        rounded="md"
                        bg={isDark ? "gray.800" : "white"}
                      />
                    </FormControl>

                    <FormControl isRequired flex={1}>
                      <FormLabel fontSize="xs">Jam Selesai</FormLabel>
                      <Input
                        type="time"
                        size="sm"
                        value={unifiedEndTime}
                        onChange={(e) => setUnifiedEndTime(e.target.value)}
                        rounded="md"
                        bg={isDark ? "gray.800" : "white"}
                      />
                    </FormControl>
                  </Flex>

                  <HStack
                    p={2.5}
                    rounded="md"
                    bg={isDark ? "blue.950" : "white"}
                    border="1px dashed"
                    borderColor="blue.300"
                    spacing={2}
                  >
                    <Icon as={FiCheckCircle} color="blue.500" boxSize={4} />
                    <Text fontSize="2xs" color={isDark ? "blue.200" : "blue.900"}>
                      Semua <b>{selectedRequests.length} permohonan</b> akan dijadwalkan pada hari{" "}
                      <b>{formattedTargetDate}</b> pukul <b>{unifiedStartTime} - {unifiedEndTime} WIB</b>.
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            {/* ─── Mode B: Staggered Scheduling Form ─── */}
            {mode === "STAGGERED" && (
              <Box
                p={4}
                rounded="lg"
                bg={isDark ? "gray.750" : "blue.50"}
                border="1px solid"
                borderColor={isDark ? "blue.900" : "blue.200"}
              >
                <VStack spacing={4} align="stretch">
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "start", md: "center" }}
                    gap={3}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="blue.500" />
                      <Heading size="xs" color={isDark ? "blue.300" : "blue.800"}>
                        Konfigurasi Slot Berurutan
                      </Heading>
                    </HStack>

                    <HStack spacing={2} wrap="wrap">
                      <FormControl maxW="120px" size="xs">
                        <FormLabel fontSize="2xs" mb={0.5}>
                          Mulai Sesi 1
                        </FormLabel>
                        <Input
                          type="time"
                          size="xs"
                          value={staggerBaseStartTime}
                          onChange={(e) => setStaggerBaseStartTime(e.target.value)}
                          rounded="md"
                          bg={isDark ? "gray.800" : "white"}
                        />
                      </FormControl>

                      <FormControl maxW="130px" size="xs">
                        <FormLabel fontSize="2xs" mb={0.5}>
                          Durasi / Permohonan
                        </FormLabel>
                        <Select
                          size="xs"
                          value={staggerDuration}
                          onChange={(e) => setStaggerDuration(Number(e.target.value))}
                          rounded="md"
                          bg={isDark ? "gray.800" : "white"}
                        >
                          <option value={15}>15 Menit</option>
                          <option value={20}>20 Menit</option>
                          <option value={30}>30 Menit</option>
                          <option value={45}>45 Menit</option>
                          <option value={60}>60 Menit</option>
                        </Select>
                      </FormControl>

                      <Button
                        size="xs"
                        colorScheme="blue"
                        leftIcon={<FiZap />}
                        mt={4}
                        onClick={handleAutoGenerateStaggered}
                      >
                        Auto-Urutkan
                      </Button>
                    </HStack>
                  </Flex>

                  <Text fontSize="2xs" color="gray.500">
                    Anda dapat mengubah jam mulai dan selesai masing-masing permohonan secara langsung pada tabel daftar permohonan di bawah ini.
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Selected Requests List & Time Slot Table */}
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.200" : "gray.700"}>
                  Daftar Permohonan yang Dijadwalkan ({selectedRequests.length}):
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  Tanggal: {formattedTargetDate}
                </Text>
              </Flex>

              <Box
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
                rounded="lg"
                overflow="hidden"
                maxH="280px"
                overflowY="auto"
              >
                <Table size="sm" variant="simple">
                  <Thead bg={isDark ? "gray.900" : "gray.50"}>
                    <Tr>
                      <Th fontSize="2xs" w="40px" textAlign="center">No</Th>
                      <Th fontSize="2xs">Permohonan CAB</Th>
                      <Th fontSize="2xs">Pemohon / Aplikasi</Th>
                      <Th fontSize="2xs" w={mode === "STAGGERED" ? "240px" : "160px"}>
                        Slot Waktu (WIB)
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedRequests.map((req, idx) => {
                      const slot = staggerSlots[req.id] || {
                        startTime: unifiedStartTime,
                        endTime: unifiedEndTime,
                      };

                      return (
                        <Tr key={req.id} _hover={{ bg: isDark ? "gray.750" : "gray.50" }}>
                          <Td fontSize="xs" textAlign="center" fontWeight="medium">
                            {idx + 1}.
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={1.5}>
                                <Text fontSize="xs" fontWeight="bold" color="purple.500">
                                  {req.requestNo}
                                </Text>
                                <Badge
                                  colorScheme={
                                    req.requestType?.toUpperCase().includes("INFRA") ||
                                    req.requestType?.toUpperCase().includes("HARDWARE")
                                      ? "blue"
                                      : "purple"
                                  }
                                  variant="subtle"
                                  fontSize="3xs"
                                  px={1.5}
                                  rounded="full"
                                >
                                  {req.requestType}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                                {req.requestTitle}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="semibold">
                                {req.projectName || "-"}
                              </Text>
                              <Text fontSize="2xs" color="gray.500">
                                {req.requesterName}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            {mode === "UNIFIED" ? (
                              <Badge
                                colorScheme="blue"
                                variant="outline"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {unifiedStartTime} - {unifiedEndTime} WIB
                              </Badge>
                            ) : (
                              <HStack spacing={1.5}>
                                <Input
                                  type="time"
                                  size="xs"
                                  value={slot.startTime}
                                  onChange={(e) =>
                                    handleSlotChange(req.id, "startTime", e.target.value)
                                  }
                                  rounded="md"
                                  w="90px"
                                />
                                <Text fontSize="xs" color="gray.400">-</Text>
                                <Input
                                  type="time"
                                  size="xs"
                                  value={slot.endTime}
                                  onChange={(e) =>
                                    handleSlotChange(req.id, "endTime", e.target.value)
                                  }
                                  rounded="md"
                                  w="90px"
                                />
                              </HStack>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          py={3.5}
        >
          <Flex justify="space-between" align="center" w="full">
            <HStack spacing={2}>
              {!isValid && (
                <HStack spacing={1.5} color="red.500">
                  <Icon as={FiAlertCircle} boxSize={4} />
                  <Text fontSize="xs">Lengkapi tanggal dan slot waktu yang valid.</Text>
                </HStack>
              )}
            </HStack>

            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={onClose} isDisabled={isLoading}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiCheckCircle />}
                onClick={handleSubmit}
                isLoading={isLoading}
                isDisabled={!isValid || selectedRequests.length === 0}
                px={5}
              >
                Simpan Jadwal ({selectedRequests.length})
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkScheduleModal;
