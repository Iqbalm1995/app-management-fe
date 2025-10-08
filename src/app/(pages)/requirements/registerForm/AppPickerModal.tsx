"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  HStack,
  VStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { FiCheckCircle, FiArrowRightCircle, FiX, FiSearch } from "react-icons/fi";
import {
  MAX_SIZE_TABLE,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { ColumnMetaCustom, PaggingListPayload } from "@/app/types/masterTypes";

interface AppPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp?: ApplicationMasterResponse | null;
  onAppSelect: (app: ApplicationMasterResponse | null) => void;
  tokenData: string;
}

export default function AppPickerModal({
  isOpen,
  onClose,
  selectedApp,
  onAppSelect,
  tokenData,
}: AppPickerModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { List: ListApps } = useApps();

  const [apps, setApps] = useState<ApplicationMasterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalData, setTotalData] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (isOpen && tokenData) {
      loadApps();
    }
  }, [isOpen, tokenData, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const payload: PaggingListPayload = {
        search: debouncedSearch,
        limit: pagination.pageSize,
        page: pagination.pageIndex, // 0-based page as requested
        filterWhere: [],
        fieldOrder: ["appName"],
        orderDir: "asc",
      };
      const response = await ListApps(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        setApps(response.data || []);
        setTotalData(response.countTotal || 0);
      } else {
        showToast({
          description: "Failed to load applications",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Error loading applications",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<ApplicationMasterResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => <Text textAlign="center">{info.row.index + 1}.</Text>,
        header: () => <Text textAlign="center">No.</Text>,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.appName,
        id: "appName",
        cell: (info) => (
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">{info.row.original.appName}</Text>
            <Text fontSize="xs" color="gray.600">
              #{info.row.original.appCode}
            </Text>
          </VStack>
        ),
        header: () => <span>Application</span>,
        meta: { isFilterable: true } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.appsDesc,
        id: "appsDesc",
        cell: (info) => (
          <Text fontSize="sm">{info.row.original.appsDesc || "-"}</Text>
        ),
        header: () => <span>Description</span>,
        meta: { isFilterable: true } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "action",
        cell: (info) => (
          <Button
            size="sm"
            colorScheme="blue"
            variant={
              selectedApp?.id === info.row.original.id ? "solid" : "outline"
            }
            onClick={() => {
              const app = info.row.original;
              onAppSelect(selectedApp?.id === app.id ? null : app);
            }}
            rightIcon={
              selectedApp?.id === info.row.original.id ? (
                <FiCheckCircle />
              ) : (
                <FiArrowRightCircle />
              )
            }
          >
            {selectedApp?.id === info.row.original.id ? "Selected" : "Select"}
          </Button>
        ),
        header: () => <Text textAlign="center">Action</Text>,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
    ],
    [selectedApp, onAppSelect]
  );

  const table = useReactTable({
    data: apps,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalData / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent
        bg={colorMode === "light" ? "white" : "gray.900"}
        rounded="2xl"
      >
        <ModalHeader>Pilih Aplikasi</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Cari aplikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Box minH="400px">
              <TableComponentWithFilterCTX
                table={table}
                isLoading={isLoading}
                showPagination={true}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" leftIcon={<FiX />} onClick={onClose}>
            Kembali
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
