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
  IconButton,
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
  FiChevronUp,
  FiChevronDown,
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
  date?: string;
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

// Helper: Extract date and time from requested CAB fields
const getRequestedCabDateTimeInfo = (req: CabRequestItem) => {
  const source = req.requestedCabDate || req.requestDate || "";
  let datePart = "-";
  let timePart = "";

  if (source.includes("T")) {
    const [d, t] = source.split("T");
    datePart = d;
    timePart = t ? t.slice(0, 5) : "";
  } else if (source) {
    datePart = source;
  }

  // If timePart is still empty but requestedCabDate has time
  if (!timePart && req.requestedCabDate && req.requestedCabDate.includes("T")) {
    timePart = req.requestedCabDate.split("T")[1]?.slice(0, 5) || "";
  }

  return { datePart, timePart, targetDate: req.targetDate };
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

  // Ordered list state to allow moving items up and down
  const [orderedRequests, setOrderedRequests] = useState<CabRequestItem[]>([]);

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
      setOrderedRequests([...selectedRequests]);

      // Initialize staggered slots with date
      const initialSlots: Record<string, StaggeredSlot> = {};
      let currentStart = "09:00";
      selectedRequests.forEach((req) => {
        const nextEnd = addMinutesToTime(currentStart, 30);
        initialSlots[req.id] = {
          date: defaultDate,
          startTime: currentStart,
          endTime: nextEnd,
        };
        currentStart = nextEnd;
      });
      setStaggerSlots(initialSlots);
    }
  }, [isOpen, initialDate, selectedRequests]);

  // Check if there are different requested CAB dates among selected items
  const uniqueRequestedDates = useMemo(() => {
    const dates = orderedRequests
      .map((r) => getRequestedCabDateTimeInfo(r).datePart)
      .filter((d) => d && d !== "-");
    return Array.from(new Set(dates));
  }, [orderedRequests]);

  // Check if slots currently have different dates assigned
  const uniqueSlotDates = useMemo(() => {
    const dates = orderedRequests
      .map((r) => staggerSlots[r.id]?.date || scheduledDate)
      .filter(Boolean);
    return Array.from(new Set(dates));
  }, [orderedRequests, staggerSlots, scheduledDate]);

  const hasDifferentDates = uniqueRequestedDates.length > 1 || uniqueSlotDates.length > 1;

  // Handler: Auto-generate staggered slots sequentially based on orderedRequests
  const handleAutoGenerateStaggered = (customList?: CabRequestItem[]) => {
    if (hasDifferentDates && !customList) {
      toast({
        title: "Tidak Dapat Auto-Urutkan",
        description:
          "Terdapat perbedaan tanggal pada permohonan yang dipilih. Auto-urutkan hanya dapat digunakan jika seluruh permohonan berada pada tanggal yang sama.",
        status: "warning",
        duration: 3500,
        position: "top",
        isClosable: true,
      });
      return;
    }

    const list = customList || orderedRequests;
    let currentStart = staggerBaseStartTime || "09:00";
    const updated: Record<string, StaggeredSlot> = {};

    list.forEach((req) => {
      const nextEnd = addMinutesToTime(currentStart, Number(staggerDuration) || 30);
      updated[req.id] = {
        date: staggerSlots[req.id]?.date || scheduledDate,
        startTime: currentStart,
        endTime: nextEnd,
        customLocation: staggerSlots[req.id]?.customLocation,
      };
      currentStart = nextEnd;
    });

    setStaggerSlots(updated);
    if (!customList) {
      toast({
        title: "Urutan Jadwal Dibuat",
        description: `Jadwal diurutkan setiap ${staggerDuration} menit untuk ${list.length} permohonan.`,
        status: "info",
        duration: 2500,
        position: "top",
        isClosable: true,
      });
    }
  };

  // Handler: Move request UP in schedule index
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextList = [...orderedRequests];
    const temp = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = temp;
    setOrderedRequests(nextList);

    if (mode === "STAGGERED" && !hasDifferentDates) {
      handleAutoGenerateStaggered(nextList);
    }
  };

  // Handler: Move request DOWN in schedule index
  const handleMoveDown = (index: number) => {
    if (index >= orderedRequests.length - 1) return;
    const nextList = [...orderedRequests];
    const temp = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = temp;
    setOrderedRequests(nextList);

    if (mode === "STAGGERED" && !hasDifferentDates) {
      handleAutoGenerateStaggered(nextList);
    }
  };

  // Handler: Update individual staggered slot
  const handleSlotChange = (
    reqId: string,
    field: "date" | "startTime" | "endTime" | "customLocation",
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
    if (orderedRequests.length === 0) return false;

    if (mode === "UNIFIED") {
      if (!scheduledDate) return false;
      if (!unifiedStartTime || !unifiedEndTime) return false;
      return unifiedStartTime < unifiedEndTime;
    } else {
      for (const req of orderedRequests) {
        const slot = staggerSlots[req.id];
        const itemDate = slot?.date || scheduledDate;
        if (!itemDate) return false;
        if (!slot?.startTime || !slot?.endTime) return false;
        if (slot.startTime >= slot.endTime) return false;
      }
      return true;
    }
  }, [mode, scheduledDate, unifiedStartTime, unifiedEndTime, orderedRequests, staggerSlots]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: "Periksa Isian Jadwal",
        description: "Pastikan tanggal dan jam mulai lebih awal dari jam selesai pada setiap permohonan.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    const payloadItems: BulkScheduleCabItemPayload[] = orderedRequests.map((req) => {
      if (mode === "UNIFIED") {
        return {
          id: req.id,
          scheduledDate: `${scheduledDate}T${unifiedStartTime}:00`,
          scheduledEndDate: `${scheduledDate}T${unifiedEndTime}:00`,
          cabLocation: cabLocation.trim() || undefined,
        };
      } else {
        const slot = staggerSlots[req.id] || {
          date: scheduledDate,
          startTime: unifiedStartTime,
          endTime: unifiedEndTime,
        };
        const itemDate = slot.date || scheduledDate;
        return {
          id: req.id,
          scheduledDate: `${itemDate}T${slot.startTime}:00`,
          scheduledEndDate: `${itemDate}T${slot.endTime}:00`,
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
                  Tanggal CAB
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

                      <Tooltip
                        label={
                          hasDifferentDates
                            ? "Auto-Urutkan dinonaktifkan karena permohonan memiliki tanggal yang berbeda."
                            : "Urutkan jam pelaksanaan secara otomatis berdasarkan durasi"
                        }
                        hasArrow
                      >
                        <Box mt={4}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            leftIcon={<FiZap />}
                            isDisabled={hasDifferentDates}
                            onClick={() => handleAutoGenerateStaggered()}
                          >
                            Auto-Urutkan
                          </Button>
                        </Box>
                      </Tooltip>
                    </HStack>
                  </Flex>

                  {hasDifferentDates && (
                    <HStack
                      p={2.5}
                      bg={isDark ? "orange.950" : "orange.50"}
                      border="1px solid"
                      borderColor={isDark ? "orange.800" : "orange.200"}
                      rounded="md"
                      spacing={2.5}
                    >
                      <Icon as={FiAlertCircle} color="orange.500" boxSize={4} flexShrink={0} />
                      <Text fontSize="2xs" color={isDark ? "orange.200" : "orange.900"}>
                        <b>Perhatian:</b> Permohonan memiliki tanggal yang berbeda ({uniqueRequestedDates.length > 1 ? `Tanggal Pengajuan: ${uniqueRequestedDates.join(", ")}` : `Tanggal Jadwal: ${uniqueSlotDates.join(", ")}`}). Fitur <b>Auto-Urutkan</b> dinonaktifkan. Silakan sesuaikan tanggal dan jam masing-masing secara manual pada tabel di bawah.
                      </Text>
                    </HStack>
                  )}

                  <Text fontSize="2xs" color="gray.500">
                    Anda dapat mengubah tanggal serta jam mulai dan selesai masing-masing permohonan secara langsung pada tabel daftar permohonan di bawah ini.
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Selected Requests List & Time Slot Table */}
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.200" : "gray.700"}>
                  Daftar Urutan Permohonan ({orderedRequests.length}):
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  Tanggal Utama: {formattedTargetDate}
                </Text>
              </Flex>

              <Box
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
                rounded="lg"
                overflow="hidden"
                maxH="300px"
                overflowY="auto"
              >
                <Table size="sm" variant="simple">
                  <Thead bg={isDark ? "gray.900" : "gray.50"}>
                    <Tr>
                      <Th fontSize="2xs" w="75px" textAlign="center">
                        URUTAN
                      </Th>
                      <Th fontSize="2xs">Permohonan CAB</Th>
                      <Th fontSize="2xs">Pemohon / Aplikasi</Th>
                      <Th fontSize="2xs" w="140px">
                        Waktu Request CAB
                      </Th>
                      <Th fontSize="2xs" w={mode === "STAGGERED" ? "240px" : "180px"}>
                        Tanggal & Waktu Jadwal
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orderedRequests.map((req, idx) => {
                      const slot = staggerSlots[req.id] || {
                        date: scheduledDate,
                        startTime: unifiedStartTime,
                        endTime: unifiedEndTime,
                      };

                      const dtInfo = getRequestedCabDateTimeInfo(req);
                      const itemDate = slot.date || scheduledDate;

                      return (
                        <Tr key={req.id} _hover={{ bg: isDark ? "gray.750" : "gray.50" }}>
                          <Td textAlign="center">
                            <HStack spacing={1} justify="center">
                              <Badge
                                colorScheme="blue"
                                variant="subtle"
                                rounded="md"
                                px={1.5}
                                py={0.5}
                                fontSize="2xs"
                                fontWeight="bold"
                                minW="26px"
                                textAlign="center"
                              >
                                #{idx + 1}
                              </Badge>
                              <VStack spacing={0}>
                                <Tooltip label="Pindah ke atas" hasArrow placement="top">
                                  <IconButton
                                    aria-label="Geser ke atas"
                                    icon={<FiChevronUp />}
                                    size="2xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    h="14px"
                                    minW="16px"
                                    isDisabled={idx === 0}
                                    onClick={() => handleMoveUp(idx)}
                                  />
                                </Tooltip>
                                <Tooltip label="Pindah ke bawah" hasArrow placement="bottom">
                                  <IconButton
                                    aria-label="Geser ke bawah"
                                    icon={<FiChevronDown />}
                                    size="2xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    h="14px"
                                    minW="16px"
                                    isDisabled={idx === orderedRequests.length - 1}
                                    onClick={() => handleMoveDown(idx)}
                                  />
                                </Tooltip>
                              </VStack>
                            </HStack>
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
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={1.5}>
                                <Icon as={FiCalendar} boxSize={3} color="blue.500" />
                                <Text
                                  fontSize="xs"
                                  fontWeight="medium"
                                  color={isDark ? "gray.200" : "gray.700"}
                                >
                                  {dtInfo.datePart}
                                </Text>
                              </HStack>
                              {dtInfo.timePart && (
                                <HStack spacing={1}>
                                  <Icon as={FiClock} boxSize={3} color="orange.500" />
                                  <Text fontSize="2xs" fontWeight="semibold" color="orange.500">
                                    {dtInfo.timePart} WIB
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            {mode === "UNIFIED" ? (
                              <VStack align="start" spacing={1}>
                                <HStack spacing={1}>
                                  <Icon as={FiCalendar} boxSize={3} color="purple.500" />
                                  <Text fontSize="2xs" fontWeight="bold" color={isDark ? "purple.300" : "purple.700"}>
                                    {scheduledDate || "-"}
                                  </Text>
                                </HStack>
                                <Badge
                                  colorScheme="blue"
                                  variant="outline"
                                  fontSize="2xs"
                                  px={1.5}
                                  py={0.5}
                                  rounded="md"
                                >
                                  {unifiedStartTime} - {unifiedEndTime} WIB
                                </Badge>
                              </VStack>
                            ) : (
                              <VStack align="start" spacing={1.5} py={0.5}>
                                <InputGroup size="xs" w="140px">
                                  <InputLeftElement pointerEvents="none" h="24px">
                                    <Icon as={FiCalendar} boxSize={3} color="blue.500" />
                                  </InputLeftElement>
                                  <Input
                                    type="date"
                                    size="xs"
                                    h="24px"
                                    pl="26px"
                                    value={itemDate}
                                    onChange={(e) =>
                                      handleSlotChange(req.id, "date", e.target.value)
                                    }
                                    rounded="md"
                                    bg={isDark ? "gray.800" : "white"}
                                    fontSize="2xs"
                                  />
                                </InputGroup>
                                <HStack spacing={1}>
                                  <Input
                                    type="time"
                                    size="xs"
                                    h="24px"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                      handleSlotChange(req.id, "startTime", e.target.value)
                                    }
                                    rounded="md"
                                    w="75px"
                                    bg={isDark ? "gray.800" : "white"}
                                    fontSize="2xs"
                                  />
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                  <Input
                                    type="time"
                                    size="xs"
                                    h="24px"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                      handleSlotChange(req.id, "endTime", e.target.value)
                                    }
                                    rounded="md"
                                    w="75px"
                                    bg={isDark ? "gray.800" : "white"}
                                    fontSize="2xs"
                                  />
                                </HStack>
                              </VStack>
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
                isDisabled={!isValid || orderedRequests.length === 0}
                px={5}
              >
                Simpan Jadwal ({orderedRequests.length})
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkScheduleModal;
