"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiEye,
  FiFilter,
  FiLayers,
  FiRefreshCcw,
  FiRotateCcw,
  FiSearch,
  FiShield,
  FiSliders,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { AppTabList, AppTabItem } from "@/app/components/TabsCustom";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { StatusBadge } from "@/app/components/StatusBadge";
import {
  ColumnMetaCustom,
  ListSearchByParamProps,
  addParamFilterUpdate,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { CabRequestItem } from "@/app/types/cabTypes";
import useCabRequest from "@/app/services/useCabRequest";
import {
  useToastError,
  useToastSuccess,
  useToastWarning,
} from "@/app/helper/ToastMessagesHelper";
import BulkRatificationModal from "./BulkRatificationModal";

export type EmergencySubFilter =
  | "ALL"
  | "WAITING_RATIFICATION"
  | "RATIFIED"
  | "IN_PROGRESS";

interface CabEmergencyTabProps {
  items: CabRequestItem[];
  onRefresh?: () => void;
  tokenData?: string;
}

const formatDateIndo = (dateStr?: string | null): string => {
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

export const CabEmergencyTab = ({
  items,
  onRefresh,
  tokenData = "",
}: CabEmergencyTabProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  const { ActionCabRequest } = useCabRequest();
  const showToastSuccess = useToastSuccess();
  const showToastError = useToastError();
  const showToastWarning = useToastWarning();

  // Local synced emergency items
  const emergencyItems = useMemo(() => {
    return items.filter(
      (item) => String(item.jenisCab || "").toUpperCase() === "EMERGENCY"
    );
  }, [items]);

  // Sub Filter: ALL | WAITING_RATIFICATION | RATIFIED | IN_PROGRESS
  const [subFilter, setSubFilter] = useState<EmergencySubFilter>("ALL");

  // Search, Column Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const {
    isOpen: isFilterPopoverOpen,
    onOpen: onFilterPopoverOpen,
    onClose: onFilterPopoverClose,
  } = useDisclosure();

  // Row selection for bulk ratification
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Single Ratification Modal state
  const singleRatifyModal = useDisclosure();
  const [targetSingleItem, setTargetSingleItem] = useState<CabRequestItem | null>(
    null
  );
  const [singleNote, setSingleNote] = useState<string>(
    "Ratifikasi Mengetahui Emergency CAB"
  );
  const [isSingleLoading, setIsSingleLoading] = useState<boolean>(false);
  const cancelRef = useRef<any>(null);

  // Bulk Ratification Modal state
  const bulkRatifyModal = useDisclosure();
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // Filter Handlers
  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );
    setParamFilter(updatedFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const removeFilterData = (target: ListSearchByParamProps) => {
    const updated = removeParamFilter(ParamFilter, target);
    setParamFilter(updated);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Status check helper
  const isItemRatified = (item: CabRequestItem): boolean => {
    const status = String(item.status || "").toUpperCase();
    return status === "COMPLETED" || status === "APPROVED";
  };

  const isItemInProgress = (item: CabRequestItem): boolean => {
    const status = String(item.status || "").toUpperCase();
    return (
      status === "IMPLEMENTASI" ||
      status === "IMPLEMENT" ||
      status === "CONFIRM" ||
      status === "PENJADWALAN" ||
      status === "SCHEDULED"
    );
  };

  // Sub-filter counts
  const counts = useMemo(() => {
    const total = emergencyItems.length;
    const waiting = emergencyItems.filter(
      (i) =>
        !isItemRatified(i) &&
        [
          "WAITING APPROVAL",
          "WAITING APPROVE",
          "SEND TO APPROVAL",
          "REQUEST",
          "PENGAJUAN",
          "DRAFT",
        ].includes(String(i.status || "").toUpperCase())
    ).length;
    const ratified = emergencyItems.filter(isItemRatified).length;
    const inProgress = emergencyItems.filter(isItemInProgress).length;

    return { total, waiting, ratified, inProgress };
  }, [emergencyItems]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let result = emergencyItems;

    // 1. Sub-filter tab
    if (subFilter === "WAITING_RATIFICATION") {
      result = result.filter(
        (i) =>
          !isItemRatified(i) &&
          [
            "WAITING APPROVAL",
            "WAITING APPROVE",
            "SEND TO APPROVAL",
            "REQUEST",
            "PENGAJUAN",
            "DRAFT",
          ].includes(String(i.status || "").toUpperCase())
      );
    } else if (subFilter === "RATIFIED") {
      result = result.filter(isItemRatified);
    } else if (subFilter === "IN_PROGRESS") {
      result = result.filter(isItemInProgress);
    }

    // 2. Global search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return (
          item.requestNo?.toLowerCase().includes(q) ||
          item.requestTitle?.toLowerCase().includes(q) ||
          item.applicationName?.toLowerCase().includes(q) ||
          item.projectName?.toLowerCase().includes(q) ||
          item.requesterName?.toLowerCase().includes(q) ||
          item.alasanEmergency?.toLowerCase().includes(q) ||
          item.jenisCabEmergencyAlasan?.toLowerCase().includes(q) ||
          item.unitKerja?.toLowerCase().includes(q)
        );
      });
    }

    // 3. Column Param Filter
    if (ParamFilter.length > 0) {
      result = result.filter((item) => {
        return ParamFilter.every((f) => {
          const itemRecord = item as unknown as Record<string, unknown>;
          const val = String(itemRecord[f.field] ?? "").toLowerCase();
          const target = String(f.value ?? "").toLowerCase();
          return val.includes(target);
        });
      });
    }

    return result;
  }, [emergencyItems, subFilter, searchQuery, ParamFilter]);

  // Selected items array
  const selectedItems = useMemo(() => {
    return filteredData.filter((item) => !!rowSelection[item.id]);
  }, [filteredData, rowSelection]);

  // Handle Single Ratification
  const handleOpenSingleRatify = (item: CabRequestItem) => {
    setTargetSingleItem(item);
    setSingleNote("Ratifikasi Mengetahui Emergency CAB");
    singleRatifyModal.onOpen();
  };

  const handleConfirmSingleRatify = async () => {
    if (!targetSingleItem) return;
    setIsSingleLoading(true);
    try {
      const success = await ActionCabRequest(tokenData, targetSingleItem.id, {
        action: "APPROVE",
        note: singleNote.trim() || "Ratifikasi Mengetahui Emergency CAB",
      });

      if (success) {
        showToastSuccess({
          description: `Permohonan Emergency CAB ${targetSingleItem.requestNo} telah berhasil diratifikasi (Mengetahui).`,
        });
        singleRatifyModal.onClose();
        if (onRefresh) onRefresh();
      } else {
        showToastError({
          description: "Terjadi kesalahan saat memproses ratifikasi permohonan.",
        });
      }
    } catch {
      showToastError({
        description: "Gagal memproses ratifikasi emergency CAB.",
      });
    } finally {
      setIsSingleLoading(false);
    }
  };

  // Handle Bulk Ratification
  const handleConfirmBulkRatify = async (ids: string[], note?: string) => {
    if (ids.length === 0) return;
    setIsBulkLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const id of ids) {
        const res = await ActionCabRequest(tokenData, id, {
          action: "APPROVE",
          note: note || "Ratifikasi Mengetahui Emergency CAB",
        });
        if (res) successCount++;
        else failCount++;
      }

      if (successCount > 0) {
        showToastSuccess({
          description: `${successCount} permohonan Emergency CAB berhasil diratifikasi (Mengetahui).${
            failCount > 0 ? ` (${failCount} gagal)` : ""
          }`,
        });
      } else {
        showToastError({
          description: "Seluruh permohonan yang dipilih gagal diratifikasi.",
        });
      }

      setRowSelection({});
      bulkRatifyModal.onClose();
      if (onRefresh) onRefresh();
    } catch {
      showToastError({
        description: "Terjadi kesalahan saat memproses ratifikasi masal.",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Sub-filter tab index mapping
  const subFilterIndex = useMemo(() => {
    switch (subFilter) {
      case "ALL":
        return 0;
      case "WAITING_RATIFICATION":
        return 1;
      case "RATIFIED":
        return 2;
      case "IN_PROGRESS":
        return 3;
      default:
        return 0;
    }
  }, [subFilter]);

  // TanStack Table Columns
  const columns = useMemo<ColumnDef<CabRequestItem>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            isChecked={table.getIsAllPageRowsSelected()}
            isIndeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            colorScheme="red"
            size="sm"
            aria-label="Pilih Semua di Halaman"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            isChecked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            colorScheme="red"
            size="sm"
            aria-label="Pilih Baris"
          />
        ),
        meta: {
          style: {
            width: "40px",
            textAlign: "center",
          },
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "requestNo",
        id: "requestNo",
        header: "No. Permohonan",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <VStack align="start" spacing={1}>
              <HStack spacing={1.5}>
                <Badge
                  colorScheme="red"
                  variant="solid"
                  fontSize="2xs"
                  px={1.5}
                  py={0.5}
                  rounded="sm"
                >
                  EMERGENCY
                </Badge>
                <Text
                  fontWeight="bold"
                  fontSize="xs"
                  color={isDark ? "blue.300" : "blue.600"}
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                  onClick={() =>
                    router.push(`/cab/cab-request/detail?id=${item.id}`)
                  }
                >
                  {item.requestNo || "—"}
                </Text>
              </HStack>
              <Text fontSize="2xs" color="gray.500">
                Tgl: {formatDateIndo(item.requestDate)}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requestNo",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "No. Permohonan",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "requestTitle",
        id: "requestTitle",
        header: "Judul & Target Sistem",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <VStack align="start" spacing={0.5} maxW="280px">
              <Text fontSize="xs" fontWeight="semibold" noOfLines={2}>
                {item.requestTitle || "—"}
              </Text>
              <HStack spacing={1} color="gray.500">
                <Icon as={FiZap} boxSize={3} color="orange.400" />
                <Text fontSize="2xs" noOfLines={1}>
                  {item.applicationName || item.projectName || "Sistem IT"}
                </Text>
              </HStack>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requestTitle",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Judul Permohonan",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "alasanEmergency",
        header: "Alasan Emergency",
        cell: ({ row }) => {
          const item = row.original;
          const reason =
            item.alasanEmergency || item.jenisCabEmergencyAlasan || "—";
          return (
            <Box
              bg={isDark ? "red.950" : "red.50"}
              borderLeftWidth="3px"
              borderLeftColor="red.500"
              p={2}
              rounded="sm"
              maxW="260px"
            >
              <HStack spacing={1} mb={0.5}>
                <Icon as={FiAlertTriangle} color="red.500" boxSize={3} />
                <Text
                  fontSize="2xs"
                  fontWeight="bold"
                  color={isDark ? "red.300" : "red.700"}
                >
                  Urgensi / Insiden
                </Text>
              </HStack>
              <Text
                fontSize="2xs"
                color={isDark ? "gray.200" : "gray.700"}
                noOfLines={3}
                title={reason}
              >
                {reason}
              </Text>
            </Box>
          );
        },
      },
      {
        accessorKey: "requesterName",
        id: "requesterName",
        header: "Pemohon & Unit Kerja",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <VStack align="start" spacing={0.5}>
              <HStack spacing={1}>
                <Icon as={FiUser} boxSize={3} color="gray.400" />
                <Text fontSize="xs" fontWeight="medium">
                  {item.requesterName || "—"}
                </Text>
              </HStack>
              <Text fontSize="2xs" color="gray.500">
                {item.unitKerja || "Unit Pemohon"}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requesterName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Pemohon",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "targetDate",
        id: "targetDate",
        header: "Waktu Pelaksanaan",
        cell: ({ row }) => {
          const item = row.original;
          const execDate =
            item.targetDate ||
            item.tanggalImplementasi ||
            item.tanggalPermohonanMigrasi ||
            item.requestDate;
          return (
            <HStack spacing={1.5} color={isDark ? "gray.300" : "gray.700"}>
              <Icon as={FiCalendar} boxSize={3.5} color="blue.400" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="medium">
                  {formatDateIndo(execDate)}
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  Target Live
                </Text>
              </VStack>
            </HStack>
          );
        },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status Ratifikasi",
        cell: ({ row }) => {
          const item = row.original;
          const ratified = isItemRatified(item);
          return (
            <VStack align="start" spacing={1}>
              <StatusBadge status={item.status} />
              {ratified ? (
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="2xs"
                  px={1.5}
                  rounded="full"
                >
                  ✓ Diratifikasi
                </Badge>
              ) : (
                <Badge
                  colorScheme="orange"
                  variant="subtle"
                  fontSize="2xs"
                  px={1.5}
                  rounded="full"
                >
                  Menunggu Ratifikasi
                </Badge>
              )}
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "status",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Status CAB",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          const ratified = isItemRatified(item);
          return (
            <HStack spacing={1}>
              <Tooltip label="Lihat Detail Permohonan">
                <IconButton
                  aria-label="Detail"
                  icon={<Icon as={FiEye} />}
                  size="xs"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() =>
                    router.push(`/cab/cab-request/detail?id=${item.id}`)
                  }
                />
              </Tooltip>

              {!ratified && (
                <Tooltip label="Ratifikasi (Mengetahui)">
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<Icon as={FiCheck} />}
                    onClick={() => handleOpenSingleRatify(item)}
                  >
                    Ratifikasi
                  </Button>
                </Tooltip>
              )}
            </HStack>
          );
        },
        meta: {
          style: {
            textAlign: "center",
          },
        } as ColumnMetaCustom,
      },
    ];
  }, [isDark, router, rowSelection]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* ─── Top Info Card: Emergency CAB Explanation ─── */}
      <Card
        variant="outline"
        rounded={radiusStyle}
        bg={isDark ? "red.950" : "red.50"}
        borderColor={isDark ? "red.800" : "red.200"}
      >
        <CardBody p={4}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={3}
          >
            <HStack spacing={3}>
              <Flex
                w={10}
                h={10}
                align="center"
                justify="center"
                rounded="lg"
                bg={isDark ? "red.900" : "red.100"}
                color={isDark ? "red.300" : "red.600"}
                flexShrink={0}
              >
                <Icon as={FiAlertTriangle} boxSize={5} />
              </Flex>
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    Modul Emergency Change Advisory Board (CAB)
                  </Text>
                  <Badge colorScheme="red" variant="solid" rounded="full" px={2}>
                    FAST TRACK
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                  Permohonan perubahan mendesak untuk mengatasi insiden kritis atau pemulihan operasional. Berdasarkan governance TI, persetujuan dilakukan dalam mekanisme <strong>Ratifikasi (&ldquo;Mengetahui / As Known By&rdquo;)</strong>.
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                colorScheme="red"
                leftIcon={<Icon as={FiRefreshCcw} />}
                onClick={() => {
                  if (onRefresh) onRefresh();
                }}
              >
                Refresh Data
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* ─── Sub-filters & Search Bar ─── */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={3}
        wrap="wrap"
      >
        {/* Segmented Sub-filter tabs */}
        <Tabs
          variant="unstyled"
          size="sm"
          index={subFilterIndex}
          onChange={(idx) => {
            const modes: EmergencySubFilter[] = [
              "ALL",
              "WAITING_RATIFICATION",
              "RATIFIED",
              "IN_PROGRESS",
            ];
            setSubFilter(modes[idx]);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        >
          <AppTabList variant="segmented">
            <AppTabItem
              label="Semua Emergency"
              badge={counts.total || undefined}
              badgeColorScheme="gray"
            />
            <AppTabItem
              label="Menunggu Ratifikasi"
              badge={counts.waiting || undefined}
              badgeColorScheme="red"
            />
            <AppTabItem
              label="Sudah Diratifikasi"
              badge={counts.ratified || undefined}
              badgeColorScheme="green"
            />
            <AppTabItem
              label="Dalam Pelaksanaan"
              badge={counts.inProgress || undefined}
              badgeColorScheme="blue"
            />
          </AppTabList>
        </Tabs>

        {/* Search & Filter Trigger */}
        <HStack spacing={2} w={{ base: "full", md: "auto" }}>
          <InputGroup size="sm" w={{ base: "full", md: "260px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari No, Judul, Alasan..."
              rounded={radiusStyle}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            />
          </InputGroup>

          {/* Column Filter Popover */}
          <Popover
            isOpen={isFilterPopoverOpen}
            onOpen={onFilterPopoverOpen}
            onClose={onFilterPopoverClose}
            placement="bottom-end"
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <Button
                size="sm"
                variant={ParamFilter.length > 0 ? "solid" : "outline"}
                colorScheme={ParamFilter.length > 0 ? "red" : "gray"}
                rounded={radiusStyle}
                leftIcon={<Icon as={FiFilter} />}
              >
                Filter {ParamFilter.length > 0 && `(${ParamFilter.length})`}
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent
                rounded={radiusStyle}
                p={4}
                w="320px"
                shadow="xl"
                zIndex={1400}
              >
                <PopoverArrow />
                <PopoverCloseButton />
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" fontWeight="bold">
                    Filter Kolom Emergency CAB
                  </Text>
                  <Divider />
                  <TableComponentWithFilterCTX
                    dataLength={filteredData.length}
                    table={table}
                    columnsFilterData={columns}
                    paramFilter={ParamFilter}
                    onFilterChange={handleFilterChange}
                    removeFilterData={removeFilterData}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<Icon as={FiRotateCcw} />}
                    onClick={() => {
                      setParamFilter([]);
                      setPagination((p) => ({ ...p, pageIndex: 0 }));
                    }}
                  >
                    Reset Filter
                  </Button>
                </VStack>
              </PopoverContent>
            </Portal>
          </Popover>
        </HStack>
      </Flex>

      {/* ─── Active Filter Badges ─── */}
      {ParamFilter.length > 0 && (
        <Flex gap={2} wrap="wrap" align="center">
          <Text fontSize="xs" color="gray.500">
            Filter aktif:
          </Text>
          {ParamFilter.map((f, i) => (
            <Badge
              key={i}
              colorScheme="red"
              variant="subtle"
              rounded="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
            >
              {f.field}: {f.value}
              <IconButton
                aria-label="Hapus filter"
                icon={<Icon as={FiX} />}
                size="2xs"
                variant="ghost"
                ml={1}
                onClick={() => removeFilterData(f)}
              />
            </Badge>
          ))}
          <Button
            size="2xs"
            variant="link"
            colorScheme="red"
            onClick={() => setParamFilter([])}
          >
            Hapus Semua
          </Button>
        </Flex>
      )}

      {/* ─── Table ─── */}
      <Box
        borderWidth="1px"
        rounded={radiusStyle}
        borderColor={isDark ? "gray.700" : "gray.200"}
        overflow="hidden"
        bg={isDark ? "gray.850" : "white"}
      >
        <TableComponentWithFilterCTX
          dataLength={filteredData.length}
          table={table}
          columnsFilterData={columns}
          paramFilter={ParamFilter}
          onFilterChange={handleFilterChange}
          removeFilterData={removeFilterData}
        />
      </Box>

      {/* ─── Floating Bottom Action Bar for Bulk Ratification ─── */}
      {selectedItems.length > 0 && (
        <Box
          position="fixed"
          bottom={6}
          left="50%"
          transform="translateX(-50%)"
          zIndex={1000}
          bg={isDark ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={isDark ? "gray.600" : "red.300"}
          shadow="2xl"
          rounded="full"
          px={5}
          py={3}
          maxW="90vw"
        >
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Badge
                colorScheme="red"
                variant="solid"
                rounded="full"
                px={3}
                py={1}
                fontSize="xs"
              >
                {selectedItems.length} Terpilih
              </Badge>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                display={{ base: "none", sm: "block" }}
              >
                Emergency CAB terpilih untuk diratifikasi
              </Text>
            </HStack>

            <Divider orientation="vertical" h={6} />

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="ghost"
                rounded="full"
                onClick={() => setRowSelection({})}
              >
                Batal Pilihan
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                rounded="full"
                leftIcon={<Icon as={FiCheckCircle} />}
                onClick={bulkRatifyModal.onOpen}
              >
                Ratifikasi Masal ({selectedItems.length})
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      {/* ─── Single Ratification Confirmation Dialog ─── */}
      <AlertDialog
        isOpen={singleRatifyModal.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={singleRatifyModal.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent rounded={radiusStyle}>
            <AlertDialogHeader fontSize="md" fontWeight="bold" pb={2}>
              <HStack spacing={2}>
                <Icon as={FiShield} color="red.500" />
                <Text>Ratifikasi Emergency CAB (Mengetahui)</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={3} align="stretch">
                <Text fontSize="xs">
                  Anda akan meratifikasi permohonan{" "}
                  <strong>{targetSingleItem?.requestNo}</strong> (&ldquo;
                  {targetSingleItem?.requestTitle}&rdquo;) dengan status
                  pernyataan <strong>Mengetahui / As Known By</strong>.
                </Text>

                {targetSingleItem?.alasanEmergency && (
                  <Box
                    bg={isDark ? "red.950" : "red.50"}
                    p={2.5}
                    rounded="md"
                    borderLeftWidth="3px"
                    borderLeftColor="red.500"
                  >
                    <Text fontSize="2xs" fontWeight="bold" color="red.500">
                      Alasan Emergency:
                    </Text>
                    <Text fontSize="2xs">
                      {targetSingleItem.alasanEmergency ||
                        targetSingleItem.jenisCabEmergencyAlasan}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text fontSize="xs" fontWeight="semibold" mb={1}>
                    Catatan Ratifikasi (Opsional):
                  </Text>
                  <Textarea
                    size="sm"
                    rounded={radiusStyle}
                    fontSize="xs"
                    value={singleNote}
                    onChange={(e) => setSingleNote(e.target.value)}
                    placeholder="Catatan pengesahan ratifikasi..."
                  />
                </Box>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter pt={2}>
              <Button
                ref={cancelRef}
                size="sm"
                variant="outline"
                rounded={radiusStyle}
                onClick={singleRatifyModal.onClose}
                isDisabled={isSingleLoading}
              >
                Batal
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                rounded={radiusStyle}
                ml={3}
                onClick={handleConfirmSingleRatify}
                isLoading={isSingleLoading}
                loadingText="Meratifikasi..."
                leftIcon={<Icon as={FiCheck} />}
              >
                Konfirmasi Ratifikasi
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ─── Bulk Ratification Modal ─── */}
      <BulkRatificationModal
        isOpen={bulkRatifyModal.isOpen}
        onClose={bulkRatifyModal.onClose}
        selectedRequests={selectedItems}
        onConfirmRatify={handleConfirmBulkRatify}
        isLoading={isBulkLoading}
      />
    </VStack>
  );
};

export default CabEmergencyTab;
