"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Code,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spacer,
  Spinner,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiKey,
  FiLayers,
  FiList,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSliders,
  FiTerminal,
  FiTrash2,
  FiUnlock,
  FiX,
} from "react-icons/fi";

import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  DELAY_LOW,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  WORKER_QUEUE_PASSKEY,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSysModuleGroup, {
  SysModuleGroupInsertPayload,
  SysModuleGroupResponse,
} from "@/app/services/useSysModuleGroup";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

function SysModuleGroupPage() {
  useDocumentTitle("System Module Group Configuration");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  // ─── Auth & Token State ──────────────────────────────────────────────────
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // ─── Data & Pagination State ─────────────────────────────────────────────
  const [Data, setData] = useState<SysModuleGroupResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { List, Insert, Delete } = useSysModuleGroup();

  // ─── Developer Mode State & Auth PIN ─────────────────────────────────────
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // ─── Add Module Modal State & Confirmation PIN ───────────────────────────
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [formData, setFormData] = useState<SysModuleGroupInsertPayload>({
    modCode: "",
    modName: "",
    modDescriptions: "",
  });
  const [addPinInput, setAddPinInput] = useState<string>("");
  const [showAddPin, setShowAddPin] = useState<boolean>(false);
  const [addPinError, setAddPinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Delete Confirmation Dialog State & Confirmation PIN ─────────────────
  const [deleteTarget, setDeleteTarget] = useState<SysModuleGroupResponse | null>(null);
  const [deletePinInput, setDeletePinInput] = useState<string>("");
  const [showDeletePin, setShowDeletePin] = useState<boolean>(false);
  const [deletePinError, setDeletePinError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const cancelDeleteRef = React.useRef<any>(null);

  // ─── Initialize Auth & Dev Mode from Session ─────────────────────────────
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);

    const savedDevMode = sessionStorage.getItem("sys_mod_dev_unlocked");
    if (savedDevMode === "true") {
      setIsDevMode(true);
    }
  }, [DataAuth]);

  // ─── Fetch Data on change ────────────────────────────────────────────────
  useEffect(() => {
    if (DataAuth && tokenData) {
      fetchData();
    }
  }, [DataAuth, tokenData, RefreshData, pageIndex, pageSize, globalFilter]);

  const fetchData = async () => {
    if (!DataAuth || !tokenData) return;

    setIsLoadingProcess(true);

    try {
      const PayloadList: PaggingListPayload = {
        page: pageIndex,
        limit: pageSize,
        search: globalFilter,
        filterWhere: [],
        fieldOrder: ["modName"],
        orderDir: "asc",
      };

      const requestData = await List(PayloadList, tokenData);

      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setData(requestData.data);
        setTotalCount(requestData.countTotal || requestData.data.length);
        setTotalPageData(Math.ceil((requestData.countTotal || 0) / pageSize));
      } else {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching module groups:", error);
      showToast({
        description: "Failed to fetch module group data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const refreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  // ─── Developer Mode Auth Handlers ────────────────────────────────────────
  const handleOpenPinModal = () => {
    setPinInput("");
    setPinError(null);
    setShowPin(false);
    setIsPinModalOpen(true);
  };

  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifyingPin(true);
    setPinError(null);

    setTimeout(() => {
      if (pinInput.trim() === WORKER_QUEUE_PASSKEY) {
        setIsDevMode(true);
        sessionStorage.setItem("sys_mod_dev_unlocked", "true");
        setIsPinModalOpen(false);
        setPinInput("");
        setPinError(null);
        showToast({
          description: "Developer Mode Unlocked: Hak akses konfigurasi & write permissions modul sistem telah diaktifkan.",
          statusToast: "success",
        });
      } else {
        setPinError("Passkey PIN tidak valid. Akses developer ditolak.");
        showToast({
          description: "Akses Ditolak: Passkey PIN yang Anda masukkan salah.",
          statusToast: "error",
        });
      }
      setIsVerifyingPin(false);
    }, 250);
  };

  const handleLockConsole = () => {
    setIsDevMode(false);
    sessionStorage.removeItem("sys_mod_dev_unlocked");
    showToast({
      description: "Console Locked: Developer Mode dinonaktifkan. Mode dialihkan kembali ke Read-Only.",
      statusToast: "info",
    });
  };

  // ─── Add Module Group Handler with PIN Confirmation ──────────────────────
  const handleOpenAddModal = () => {
    if (!isDevMode) {
      handleOpenPinModal();
      return;
    }
    setFormData({
      modCode: "",
      modName: "",
      modDescriptions: "",
    });
    setAddPinInput("");
    setAddPinError(null);
    setShowAddPin(false);
    onAddOpen();
  };

  const handleAddSubmit = async () => {
    if (!formData.modCode || !formData.modName) {
      showToast({
        description: "Code dan Name wajib diisi",
        statusToast: "error",
      });
      return;
    }

    if (addPinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setAddPinError("Passkey PIN konfirmasi tidak valid.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk konfirmasi pembuatan modul.",
        statusToast: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await Insert(formData, tokenData);

      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Modul Berhasil Ditambahkan: Module group [${formData.modCode}] berhasil dibuat.`,
          statusToast: "success",
        });
        onAddClose();
        refreshAction();
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error creating module group:", error);
      showToast({
        description: "Failed to create module group",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Handler with PIN Confirmation ────────────────────────────────
  const handleOpenDeleteDialog = (item: SysModuleGroupResponse) => {
    setDeleteTarget(item);
    setDeletePinInput("");
    setDeletePinError(null);
    setShowDeletePin(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deletePinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setDeletePinError("Passkey PIN konfirmasi salah. Penghapusan dibatalkan.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk mengonfirmasi penghapusan modul.",
        statusToast: "error",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await Delete(deleteTarget.id, tokenData);

      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Modul Dihapus: Module group [${deleteTarget.modCode}] berhasil dihapus.`,
          statusToast: "success",
        });
        setDeleteTarget(null);
        refreshAction();
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting module group:", error);
      showToast({
        description: "Failed to delete module group",
        statusToast: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    setPageIndex(0);
    refreshAction();
  };

  const handleClearFilters = () => {
    setGlobalFilter("");
    setPageIndex(0);
    setTimeout(() => refreshAction(), DELAY_LOW);
  };

  const HeaderContentData: HeaderContentProps = {
    titleName: "System Module Group Configuration",
    breadCrumb: ["Dashboard", "Master Data", "System Module Group"],
  };

  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderContentData} />

      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={5} align="stretch">
          {/* ─── SYSTEM CONSOLE HEADER ─── */}
          <Card
            bg={isDark ? "gray.850" : "white"}
            border="1px solid"
            borderColor={isDevMode ? (isDark ? "teal.600" : "teal.300") : isDark ? "gray.700" : "gray.200"}
            borderRadius={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                <HStack spacing={3.5} align="center">
                  <Box
                    p={2.5}
                    bg={isDevMode ? (isDark ? "teal.900" : "teal.50") : isDark ? "blue.900" : "blue.50"}
                    color={isDevMode ? "teal.400" : "blue.500"}
                    borderRadius="lg"
                  >
                    <Icon as={isDevMode ? FiTerminal : FiLayers} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={3}>
                      <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                        System Architecture Module Groups
                      </Heading>
                      {/* Subtle status indicator */}
                      <HStack spacing={1.5}>
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg={isDevMode ? "teal.400" : "gray.400"}
                        />
                        <Text fontSize="xs" fontWeight="semibold" color={isDevMode ? "teal.400" : "gray.500"} letterSpacing="wider">
                          {isDevMode ? "DEV MODE ACTIVE" : "READ-ONLY INSPECTION"}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Kelola registrasi modul sistem, workflow status matrix, dan hak approval untuk arsitektur teknis portal.
                    </Text>
                  </VStack>
                </HStack>

                {/* Developer Mode Security Toggle */}
                <HStack spacing={2.5}>
                  {isDevMode ? (
                    <Button
                      size="md"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiLock />}
                      onClick={handleLockConsole}
                    >
                      Lock Console
                    </Button>
                  ) : (
                    <Button
                      size="md"
                      colorScheme="purple"
                      variant="solid"
                      leftIcon={<FiKey />}
                      onClick={handleOpenPinModal}
                    >
                      Enable Developer Mode
                    </Button>
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* ─── MAIN SETTINGS & CONFIGURATION CONSOLE ─── */}
          <Card
            shadow="sm"
            rounded={radiusStyle}
            bgColor={isDark ? "gray.800" : "white"}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
          >
            <CardBody p={5}>
              {/* Filter & Toolbar */}
              <Flex gap={3} wrap="wrap" align="center" mb={5}>
                <InputGroup size="md" maxW={{ base: "full", md: "340px" }}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color={isDark ? "#718096" : "#A0AEC0"} />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari kode atau nama modul..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {globalFilter && (
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        aria-label="Clear search"
                        icon={<FiX />}
                        variant="ghost"
                        onClick={handleClearFilters}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                <Button
                  size="md"
                  colorScheme="blue"
                  onClick={handleSearch}
                  leftIcon={<FiSearch />}
                >
                  Search
                </Button>

                <Button
                  size="md"
                  variant="outline"
                  onClick={handleClearFilters}
                  leftIcon={<FiX />}
                >
                  Reset
                </Button>

                <Button
                  size="md"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={refreshAction}
                  leftIcon={<FiRefreshCw />}
                  isLoading={IsLoadingProcess}
                >
                  Refresh
                </Button>

                <Spacer />

                {/* Layout View Switcher */}
                <HStack spacing={1} bg={isDark ? "gray.900" : "gray.100"} p={1} borderRadius="md">
                  <Tooltip label="Tampilan Settings List" fontSize="xs">
                    <IconButton
                      size="sm"
                      aria-label="List view"
                      icon={<FiList />}
                      colorScheme={viewMode === "list" ? "blue" : "gray"}
                      variant={viewMode === "list" ? "solid" : "ghost"}
                      onClick={() => setViewMode("list")}
                    />
                  </Tooltip>
                  <Tooltip label="Tampilan Grid Cards" fontSize="xs">
                    <IconButton
                      size="sm"
                      aria-label="Grid view"
                      icon={<FiGrid />}
                      colorScheme={viewMode === "grid" ? "blue" : "gray"}
                      variant={viewMode === "grid" ? "solid" : "ghost"}
                      onClick={() => setViewMode("grid")}
                    />
                  </Tooltip>
                </HStack>

                {/* Add Module Group (Protected behind Dev Mode) */}
                {isDevMode ? (
                  <Button
                    size="md"
                    colorScheme="green"
                    leftIcon={<FiPlus />}
                    onClick={handleOpenAddModal}
                  >
                    Add Module Group
                  </Button>
                ) : (
                  <Tooltip label="Aktifkan Developer Mode untuk menambah module baru" hasArrow>
                    <Button
                      size="md"
                      colorScheme="gray"
                      variant="outline"
                      leftIcon={<FiLock />}
                      onClick={handleOpenPinModal}
                    >
                      Add Module Group (Locked)
                    </Button>
                  </Tooltip>
                )}
              </Flex>

              {/* Status Header Meta */}
              <Flex justify="space-between" align="center" py={2} mb={3} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                <Text fontSize="sm" color="gray.500">
                  Menampilkan <b>{startItem}-{endItem}</b> dari <b>{totalCount}</b> system module groups
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Halaman <b>{pageIndex + 1}</b> dari <b>{Math.max(1, totalPages)}</b>
                </Text>
              </Flex>

              {/* Data Content */}
              {IsLoadingProcess ? (
                <Center minH="240px">
                  <VStack spacing={3}>
                    <Spinner size="lg" color="blue.500" thickness="3px" />
                    <Text fontSize="sm" color="gray.500">Memuat konfigurasi modul sistem...</Text>
                  </VStack>
                </Center>
              ) : Data.length === 0 ? (
                <Center minH="240px" flexDirection="column" gap={3}>
                  <Box p={3} bg={isDark ? "gray.700" : "gray.100"} borderRadius="full" color="gray.400">
                    <Icon as={FiLayers} boxSize={8} />
                  </Box>
                  <VStack spacing={0.5}>
                    <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                      Module Group Tidak Ditemukan
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {globalFilter ? "Tidak ada module group yang sesuai dengan pencarian." : "Belum ada module group terdaftar."}
                    </Text>
                  </VStack>
                  {globalFilter && (
                    <Button size="sm" variant="outline" onClick={handleClearFilters}>
                      Reset Pencarian
                    </Button>
                  )}
                </Center>
              ) : viewMode === "list" ? (
                /* ─── ENTERPRISE SETTINGS LIST (RECOMMENDED) ─── */
                <VStack spacing={0} align="stretch" divider={<Divider borderColor={isDark ? "gray.750" : "gray.100"} />}>
                  {Data.map((item, idx) => {
                    const isActive = item.isActive === "Y";
                    const rowNumber = pageIndex * pageSize + idx + 1;

                    return (
                      <Box
                        key={item.id}
                        py={4}
                        px={3}
                        borderRadius="md"
                        transition="all 0.15s ease"
                        _hover={{
                          bg: isDark ? "gray.750" : "gray.50",
                        }}
                      >
                        <Flex
                          justify="space-between"
                          align={{ base: "start", md: "center" }}
                          direction={{ base: "column", md: "row" }}
                          gap={3}
                        >
                          {/* Left: Code, Name, Description */}
                          <HStack spacing={4} align="start" flex={1} minW={0}>
                            <Text fontSize="sm" color="gray.400" fontWeight="semibold" minW="24px" pt={0.5}>
                              {rowNumber}.
                            </Text>

                            <VStack align="start" spacing={1} flex={1} minW={0}>
                              <HStack spacing={2.5} wrap="wrap">
                                <Code
                                  colorScheme="purple"
                                  fontSize="xs"
                                  fontWeight="bold"
                                  px={2}
                                  py={0.5}
                                  borderRadius="md"
                                  fontFamily="mono"
                                >
                                  {item.modCode}
                                </Code>
                                <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                  {item.modName}
                                </Text>
                              </HStack>

                              {item.modDescriptions ? (
                                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                  {item.modDescriptions}
                                </Text>
                              ) : (
                                <Text fontSize="sm" color="gray.400" fontStyle="italic">
                                  Tidak ada deskripsi arsitektur.
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          {/* Right: Status Dot & Actions */}
                          <HStack spacing={4} align="center" flexShrink={0}>
                            {/* Subtle Status Dot */}
                            <HStack spacing={1.5} minW="80px">
                              <Box
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg={isActive ? "green.400" : "gray.400"}
                              />
                              <Text fontSize="sm" fontWeight="medium" color={isActive ? (isDark ? "green.300" : "green.600") : "gray.500"}>
                                {isActive ? "Active" : "Inactive"}
                              </Text>
                            </HStack>

                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FiSliders />}
                              rightIcon={<FiArrowRight />}
                              onClick={() => router.push(`/master-data/sys-module-group/detail?id=${item.id}`)}
                            >
                              Configure
                            </Button>

                            {/* Delete Button (Dev Mode only) */}
                            {isDevMode && (
                              <Tooltip label="Hapus Module Group (Dev Mode Active)" hasArrow>
                                <IconButton
                                  aria-label="Delete module group"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleOpenDeleteDialog(item)}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                /* ─── GRID CARDS VIEW ─── */
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Data.map((item) => {
                    const isActive = item.isActive === "Y";

                    return (
                      <Card
                        key={item.id}
                        bg={isDark ? "gray.750" : "gray.50"}
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        borderRadius="md"
                        p={4}
                        transition="all 0.2s ease"
                        _hover={{
                          borderColor: isDark ? "blue.500" : "blue.300",
                          shadow: "sm",
                        }}
                      >
                        <VStack align="stretch" spacing={3}>
                          <Flex justify="space-between" align="start">
                            <Code
                              colorScheme="purple"
                              fontSize="xs"
                              fontWeight="bold"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                              fontFamily="mono"
                            >
                              {item.modCode}
                            </Code>

                            {/* Status Dot */}
                            <HStack spacing={1.5}>
                              <Box
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg={isActive ? "green.400" : "gray.400"}
                              />
                              <Text fontSize="xs" fontWeight="medium" color={isActive ? "green.500" : "gray.500"}>
                                {isActive ? "Active" : "Inactive"}
                              </Text>
                            </HStack>
                          </Flex>

                          <VStack align="start" spacing={1} minH="54px">
                            <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                              {item.modName}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {item.modDescriptions || "Tidak ada deskripsi arsitektur."}
                            </Text>
                          </VStack>

                          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                          <Flex justify="space-between" align="center">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FiSliders />}
                              rightIcon={<FiArrowRight />}
                              onClick={() => router.push(`/master-data/sys-module-group/detail?id=${item.id}`)}
                            >
                              Configure Module
                            </Button>

                            {isDevMode && (
                              <IconButton
                                aria-label="Delete"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleOpenDeleteDialog(item)}
                              />
                            )}
                          </Flex>
                        </VStack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <Flex
                  justify="space-between"
                  align="center"
                  pt={4}
                  mt={4}
                  borderTop="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  wrap="wrap"
                  gap={3}
                >
                  <Text fontSize="sm" color="gray.500">
                    Menampilkan <b>{startItem}-{endItem}</b> dari <b>{totalCount}</b> data
                  </Text>

                  <HStack spacing={1}>
                    <IconButton
                      size="sm"
                      aria-label="First page"
                      icon={<FiChevronsLeft />}
                      variant="outline"
                      isDisabled={!canPrev}
                      onClick={() => setPageIndex(0)}
                    />
                    <IconButton
                      size="sm"
                      aria-label="Previous page"
                      icon={<FiChevronLeft />}
                      variant="outline"
                      isDisabled={!canPrev}
                      onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    />
                    <Text fontSize="sm" px={2} color={isDark ? "white" : "gray.800"}>
                      Hal <b>{pageIndex + 1}</b> / {Math.max(1, totalPages)}
                    </Text>
                    <IconButton
                      size="sm"
                      aria-label="Next page"
                      icon={<FiChevronRight />}
                      variant="outline"
                      isDisabled={!canNext}
                      onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                    />
                    <IconButton
                      size="sm"
                      aria-label="Last page"
                      icon={<FiChevronsRight />}
                      variant="outline"
                      isDisabled={!canNext}
                      onClick={() => setPageIndex(totalPages - 1)}
                    />
                  </HStack>
                </Flex>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* ─── PIN AUTHENTICATION MODAL ─── */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "purple.600" : "purple.200"}
          borderRadius="xl"
        >
          <ModalHeader pb={2}>
            <HStack spacing={3}>
              <Box
                p={2}
                bg={isDark ? "purple.900" : "purple.50"}
                color="purple.400"
                borderRadius="lg"
              >
                <Icon as={FiShield} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                  Developer Authentication
                </Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="normal">
                  Masukkan Security Passkey untuk mengaktifkan write permissions.
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

          <form onSubmit={handleUnlockSubmit}>
            <ModalBody py={5}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"} mb={1.5}>
                    Security Passkey PIN (6-Digit)
                  </Text>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiKey} color="purple.400" />
                    </InputLeftElement>
                    <Input
                      type={showPin ? "text" : "password"}
                      placeholder="Masukkan 6-digit Passkey PIN"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        if (pinError) setPinError(null);
                      }}
                      autoFocus
                      letterSpacing={showPin ? "normal" : "widest"}
                      borderColor={pinError ? "red.400" : undefined}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Toggle password view"
                        icon={showPin ? <FiEyeOff /> : <FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPin(!showPin)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {pinError && (
                    <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                      {pinError}
                    </Text>
                  )}
                </Box>
              </VStack>
            </ModalBody>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
            <ModalFooter py={3}>
              <Button
                variant="ghost"
                mr={3}
                size="md"
                onClick={() => setIsPinModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                size="md"
                leftIcon={<FiUnlock />}
                isLoading={isVerifyingPin}
                px={5}
              >
                Buka Kunci Developer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* ─── ADD NEW MODULE GROUP MODAL (WITH PIN CONFIRMATION) ─── */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
        <ModalContent
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          borderRadius={radiusStyle}
        >
          <ModalHeader pb={2}>
            <HStack spacing={2.5}>
              <Icon as={FiPlus} color="green.400" boxSize={5} />
              <Heading size="sm">Add New System Module Group</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

          <ModalBody py={5}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Module Code (Unique Identifier)</FormLabel>
                <Input
                  placeholder="e.g., MOD_CAB, FINANCE_CORE"
                  value={formData.modCode}
                  onChange={(e) =>
                    setFormData({ ...formData, modCode: e.target.value.toUpperCase() })
                  }
                  fontFamily="mono"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Module Name</FormLabel>
                <Input
                  placeholder="e.g., CAB Management, User Authentication"
                  value={formData.modName}
                  onChange={(e) =>
                    setFormData({ ...formData, modName: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">Architecture & Description</FormLabel>
                <Textarea
                  placeholder="Jelaskan fungsionalitas dan domain servis modul ini..."
                  value={formData.modDescriptions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modDescriptions: e.target.value,
                    })
                  }
                  rows={3}
                />
              </FormControl>

              {/* Security PIN Confirmation for Creation */}
              <Box w="full" p={3.5} bg={isDark ? "gray.900" : "gray.50"} borderRadius="md" border="1px solid" borderColor={isDark ? "purple.800" : "purple.100"}>
                <FormControl isRequired isInvalid={!!addPinError}>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "purple.300" : "purple.700"} mb={1}>
                    Konfirmasi Security Passkey PIN
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiKey} color="purple.400" />
                    </InputLeftElement>
                    <Input
                      type={showAddPin ? "text" : "password"}
                      placeholder="Masukkan 6-digit Passkey PIN konfirmasi"
                      value={addPinInput}
                      onChange={(e) => {
                        setAddPinInput(e.target.value);
                        if (addPinError) setAddPinError(null);
                      }}
                      letterSpacing={showAddPin ? "normal" : "widest"}
                      borderColor={addPinError ? "red.400" : undefined}
                      bg={isDark ? "gray.800" : "white"}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Toggle password view"
                        icon={showAddPin ? <FiEyeOff /> : <FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddPin(!showAddPin)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {addPinError && (
                    <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                      {addPinError}
                    </Text>
                  )}
                </FormControl>
              </Box>
            </VStack>
          </ModalBody>

          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
          <ModalFooter py={3}>
            <Button variant="ghost" mr={3} size="md" onClick={onAddClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              size="md"
              leftIcon={<FiPlus />}
              onClick={handleAddSubmit}
              isLoading={isSubmitting}
              px={5}
            >
              Create Module Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── DELETE CONFIRMATION ALERT DIALOG (WITH PIN CONFIRMATION) ─── */}
      <AlertDialog
        isOpen={!!deleteTarget}
        leastDestructiveRef={cancelDeleteRef}
        onClose={() => setDeleteTarget(null)}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(3px)">
          <AlertDialogContent
            bg={isDark ? "gray.850" : "white"}
            border="1px solid"
            borderColor="red.500"
            borderRadius="xl"
            mx={4}
          >
            <AlertDialogHeader fontSize="md" fontWeight="bold" pb={2}>
              <HStack spacing={2} color="red.500">
                <Icon as={FiAlertTriangle} boxSize={5} />
                <Text>Konfirmasi Hapus Module Group</Text>
              </HStack>
            </AlertDialogHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
            <AlertDialogBody py={4} fontSize="sm">
              <VStack align="stretch" spacing={3.5}>
                <Text color={isDark ? "gray.300" : "gray.700"}>
                  Apakah Anda yakin ingin menghapus module group berikut dari arsitektur sistem?
                </Text>

                {deleteTarget && (
                  <Box
                    p={3}
                    rounded="md"
                    bg={isDark ? "gray.900" : "gray.50"}
                    border="1px"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                  >
                    <HStack spacing={2} mb={1}>
                      <Code colorScheme="purple" fontFamily="mono" fontSize="sm">
                        {deleteTarget.modCode}
                      </Code>
                      <Text fontWeight="bold" fontSize="md">
                        {deleteTarget.modName}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {deleteTarget.modDescriptions || "Tanpa deskripsi"}
                    </Text>
                  </Box>
                )}

                {/* Security PIN Confirmation for Deletion */}
                <Box p={3.5} bg={isDark ? "gray.900" : "red.50"} borderRadius="md" border="1px solid" borderColor={isDark ? "red.800" : "red.200"}>
                  <FormControl isRequired isInvalid={!!deletePinError}>
                    <FormLabel fontSize="sm" fontWeight="semibold" color="red.500" mb={1}>
                      Konfirmasi Passkey PIN untuk Hapus Modul
                    </FormLabel>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiKey} color="red.400" />
                      </InputLeftElement>
                      <Input
                        type={showDeletePin ? "text" : "password"}
                        placeholder="Masukkan 6-digit Passkey PIN untuk konfirmasi"
                        value={deletePinInput}
                        onChange={(e) => {
                          setDeletePinInput(e.target.value);
                          if (deletePinError) setDeletePinError(null);
                        }}
                        letterSpacing={showDeletePin ? "normal" : "widest"}
                        borderColor={deletePinError ? "red.400" : undefined}
                        bg={isDark ? "gray.800" : "white"}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Toggle password view"
                          icon={showDeletePin ? <FiEyeOff /> : <FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowDeletePin(!showDeletePin)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {deletePinError && (
                      <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                        {deletePinError}
                      </Text>
                    )}
                  </FormControl>
                </Box>

                <Text color="red.400" fontSize="sm">
                  Peringatan: Seluruh konfigurasi menu assignment dan status flow yang terhubung ke modul ini dapat terpengaruh.
                </Text>
              </VStack>
            </AlertDialogBody>
            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
            <AlertDialogFooter py={3}>
              <Button
                ref={cancelDeleteRef}
                onClick={() => setDeleteTarget(null)}
                size="md"
                variant="ghost"
                mr={3}
              >
                Batal
              </Button>
              <Button
                colorScheme="red"
                size="md"
                leftIcon={<FiTrash2 />}
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                px={5}
              >
                Ya, Hapus Modul
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </LayoutAdmin>
  );
}

export default SysModuleGroupPage;
