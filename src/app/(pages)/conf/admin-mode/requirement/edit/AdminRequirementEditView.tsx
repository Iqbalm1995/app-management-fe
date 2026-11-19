"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFile,
  FiFileText,
  FiGlobe,
  FiHardDrive,
  FiInfo,
  FiLayers,
  FiList,
  FiLock,
  FiPaperclip,
  FiRefreshCcw,
  FiServer,
  FiShield,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useRequirements, {
  BacklogDataResponse,
  RequirementApprovalDataResponse,
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
} from "@/app/services/useRequirements";
import { CustomTabItem, CustomTabList } from "@/app/components/TabsCustom";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { PaggingListPayload, PaggingListPayloadCustom } from "@/app/types/masterTypes";
import {
  REQUIREMENT_STATUSES,
  getStatusColor,
} from "@/app/constants/masterStatusConstants";

// Helper: Format Currency IDR
function formatCurrency(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

// Helper: Format Date for Display
function formatDateDisplay(val?: string | null): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

// Helper: Format Date Time for Display
function formatDateTimeDisplay(val?: string | null): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

// Helper: Format File Size
function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Helper: Calculate Day Duration
function calcDurationDays(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  try {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = d2.getTime() - d1.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

interface UploadedFileItem {
  id: string;
  name: string;
  extension: string;
  size: number;
  url: string;
  createdAt?: string;
}

export default function AdminRequirementEditView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reqId = searchParams.get("id");
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Colors
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.850");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtleBg = useColorModeValue("gray.50", "gray.800");
  const headerBg = useColorModeValue("white", "gray.800");
  const editableCardBg = useColorModeValue("blue.50", "gray.800");
  const editableBorderColor = useColorModeValue("blue.200", "blue.700");

  // Hooks Services
  const { GetDetailById, ListBacklog, ListReqMedia, AdminUpdateRequirement } = useRequirements();

  // Auth Token
  const tokenData = typeof window !== "undefined" ? localStorage.getItem("tokenData") || "" : "";

  // State: Loading & Error
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Raw Requirement Data
  const [reqData, setReqData] = useState<RequirementsResponse | null>(null);
  const [backlogs, setBacklogs] = useState<BacklogDataResponse[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);

  // ==========================================================================
  // THE 4 EDITABLE FIELDS (ONLY THESE 4 CAN BE EDITED)
  // ==========================================================================
  const [reqNumber, setReqNumber] = useState<string>("");
  const [reqNarative, setReqNarative] = useState<string>("");
  const [reqStatus, setReqStatus] = useState<string>("DRAFT");
  const [isHaveMemo, setIsHaveMemo] = useState<string>("Y");

  // Load All Requirement Data
  const loadFullRequirement = useCallback(async () => {
    if (!reqId) {
      setErrorMsg("ID Requirement tidak ditemukan dalam URL parameter.");
      setIsLoading(false);
      return;
    }

    if (!tokenData) {
      setErrorMsg("Sesi autentikasi tidak ditemukan. Silakan login kembali.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch Requirement Detail
      const detailRes = await GetDetailById(reqId, tokenData);
      if (detailRes?.statusCode !== RES_CODE_OK || !detailRes?.data) {
        throw new Error(detailRes?.message || "Gagal mengambil data requirement dari server.");
      }

      const data = detailRes.data;
      setReqData(data);

      // Hydrate the 4 Editable Fields
      setReqNumber(data.reqNumber || "");
      setReqNarative(data.reqNarative || "");
      setReqStatus(data.reqStatus || "DRAFT");
      setIsHaveMemo(data.isHaveMemo || "Y");

      // 2. Concurrently Fetch Backlog Features
      const backlogPayload: PaggingListPayload = {
        search: "",
        limit: 1000,
        page: 0,
        filterWhere: [{ field: "reqId", operator: "=", value: reqId }],
        fieldOrder: ["posOrder", "createdAt"],
        orderDir: "asc",
      };
      const backlogRes = await ListBacklog(backlogPayload, tokenData);
      if (backlogRes?.statusCode === RES_CODE_OK && backlogRes.data) {
        setBacklogs(backlogRes.data);
      }

      // 3. Concurrently Fetch Attached Media Files
      const mediaPayload: PaggingListPayloadCustom = {
        search: "",
        reqId: reqId,
        limit: 100,
        page: 0,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };
      const mediaRes = await ListReqMedia(mediaPayload, tokenData);
      if (mediaRes?.statusCode === RES_CODE_OK && mediaRes.data) {
        setUploadedFiles(
          mediaRes.data.map((f) => ({
            id: f.id,
            name: f.objectRawName || f.objectName,
            extension: f.objectExtension,
            size: f.objectSize,
            url: f.objectFullPath || f.objectData,
            createdAt: f.createdAt,
          }))
        );
      }
    } catch (err: any) {
      console.error("Error loading requirement:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memuat data requirement.");
      toast({
        title: "Gagal Memuat Data",
        description: err.message || "Gagal mengambil data requirement.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [reqId, tokenData]);

  // Handler: Save Administrator Changes
  const handleSaveAdminChanges = async () => {
    if (!reqData?.id) {
      toast({
        title: "Peringatan",
        description: "Data requirement belum selesai dimuat.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!reqNumber.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nomor Memo / Req Code tidak boleh kosong.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!reqNarative.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Perihal / Narasi Requirement tidak boleh kosong.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await AdminUpdateRequirement(
        {
          id: reqData.id,
          reqNumber: reqNumber.trim().toUpperCase(),
          reqNarative: reqNarative.trim(),
          reqStatus,
          isHaveMemo,
        },
        tokenData
      );

      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Berhasil Disimpan",
          description: "Perubahan data requirement berhasil diperbarui oleh Administrator.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        await loadFullRequirement();
      } else {
        toast({
          title: "Gagal Menyimpan",
          description: res?.message || "Terjadi kendala saat memperbarui requirement.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error("Save admin changes error:", err);
      toast({
        title: "Kesalahan Sistem",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadFullRequirement();
  }, [loadFullRequirement]);

  // Read-only calculated duration
  const calculatedMemoDays = useMemo(() => {
    return calcDurationDays(reqData?.reqInititateDate, reqData?.reqAcceptedDate);
  }, [reqData?.reqInititateDate, reqData?.reqAcceptedDate]);

  // Read-only Work Programs split
  const workPrograms = useMemo(() => {
    return reqData?.workPrograms || [];
  }, [reqData?.workPrograms]);

  const externalWPs = useMemo(() => {
    return workPrograms.filter((wp) => wp.workProgramSource === "EXTERNAL");
  }, [workPrograms]);

  const internalWPs = useMemo(() => {
    return workPrograms.filter((wp) => wp.workProgramSource === "INTERNAL");
  }, [workPrograms]);

  // Work Programs Financial Summaries
  const totalUserBudget = useMemo(() => {
    return externalWPs.reduce((sum, wp) => sum + (wp.workProgramBudget || 0), 0);
  }, [externalWPs]);

  const totalUserReal = useMemo(() => {
    return externalWPs.reduce((sum, wp) => sum + (wp.workProgramReal || 0), 0);
  }, [externalWPs]);

  const totalITBudget = useMemo(() => {
    return internalWPs.reduce((sum, wp) => sum + (wp.workProgramBudget || 0), 0);
  }, [internalWPs]);

  const totalITReal = useMemo(() => {
    return internalWPs.reduce((sum, wp) => sum + (wp.workProgramReal || 0), 0);
  }, [internalWPs]);

  // Operational Days array helper
  const operationalDaysList = useMemo(() => {
    if (!reqData?.appOperationalDays) return [];
    return reqData.appOperationalDays.split(",").map((s) => s.trim());
  }, [reqData?.appOperationalDays]);

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgMain} py={8}>
        <Container maxW="7xl">
          <Card bg={cardBg} borderColor={borderColor} p={8} rounded="2xl" shadow="sm">
            <VStack spacing={6} align="stretch">
              <Skeleton h="40px" w="40%" rounded="lg" />
              <HStack spacing={4}>
                <Skeleton h="28px" w="100px" rounded="full" />
                <Skeleton h="28px" w="140px" rounded="full" />
                <Skeleton h="28px" w="120px" rounded="full" />
              </HStack>
              <Skeleton h="180px" w="100%" rounded="2xl" />
              <Skeleton h="350px" w="100%" rounded="2xl" />
            </VStack>
          </Card>
        </Container>
      </Box>
    );
  }

  if (errorMsg || !reqData) {
    return (
      <Box minH="100vh" bg={bgMain} py={12}>
        <Container maxW="3xl">
          <Card bg={cardBg} borderColor={borderColor} p={8} rounded="2xl" shadow="md" textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiAlertTriangle} boxSize={12} color="red.500" />
              <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                Tidak Dapat Memuat Requirement
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {errorMsg || "Requirement tidak ditemukan atau ID tidak valid."}
              </Text>
              <HStack spacing={3} pt={4}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  onClick={() => router.push("/conf/admin-mode")}
                  variant="outline"
                  size="sm"
                >
                  Kembali ke Console
                </Button>
                <Button
                  leftIcon={<FiRefreshCcw />}
                  onClick={loadFullRequirement}
                  colorScheme="blue"
                  size="sm"
                >
                  Coba Muat Ulang
                </Button>
              </HStack>
            </VStack>
          </Card>
        </Container>
      </Box>
    );
  }

  const currentStatusColor = getStatusColor(reqStatus);

  return (
    <Box minH="100vh" bg={bgMain} py={6}>
      <Container maxW="7xl">
        {/* Navigation Breadcrumb & Header Bar */}
        <VStack spacing={4} align="stretch" mb={6}>
          <HStack justify="space-between" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Link href="/conf/admin-mode">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiArrowLeft />}
                  colorScheme="gray"
                  rounded="lg"
                >
                  Kembali ke Admin Console
                </Button>
              </Link>
              <HStack spacing={2}>
                <Badge
                  colorScheme={reqData.requirementType === "RFC" ? "purple" : "blue"}
                  variant="solid"
                  fontSize="xs"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {reqData.requirementType || "BRD"}
                </Badge>
                <Badge
                  colorScheme={currentStatusColor}
                  variant="subtle"
                  fontSize="xs"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {reqStatus}
                </Badge>
                {reqData.isCarryOver === "Y" && (
                  <Badge colorScheme="teal" variant="outline" fontSize="xs" px={2.5} py={0.5} rounded="full">
                    Carry Over
                  </Badge>
                )}
              </HStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiRefreshCcw />}
                onClick={loadFullRequirement}
                isLoading={isLoading}
                rounded="lg"
              >
                Muat Ulang
              </Button>
              <Link
                href={`/requirements/detail?reqId=${reqData.id}&type=${reqData.requirementType || "BRD"}`}
                target="_blank"
              >
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  rightIcon={<FiExternalLink />}
                  rounded="lg"
                >
                  Detail Standar
                </Button>
              </Link>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiCheck />}
                onClick={handleSaveAdminChanges}
                isLoading={isSaving}
                loadingText="Menyimpan..."
                rounded="lg"
                shadow="sm"
              >
                Simpan Perubahan Admin
              </Button>
            </HStack>
          </HStack>

          {/* ============================================================ */}
          {/* THE 4 EDITABLE FIELDS (ADMIN OVERRIDE CARD) */}
          {/* ============================================================ */}
          <Card
            bg={cardBg}
            borderColor={editableBorderColor}
            borderWidth="2px"
            rounded="2xl"
            p={6}
            shadow="md"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" wrap="wrap">
                <HStack spacing={2}>
                  <Icon as={FiEdit3} color="blue.500" boxSize={5} />
                  <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                    Panel Penyuntingan Administrator
                  </Heading>
                </HStack>
                <Badge colorScheme="blue" variant="solid" fontSize="2xs" px={2.5} py={0.5} rounded="full">
                  4 Field Aktif Dapat Diedit
                </Badge>
              </HStack>

              <Text fontSize="xs" color="gray.500">
                Hanya 4 input di bawah ini yang dapat disunting oleh Admin. Seluruh data lainnya di bawah ini
                disajikan sebagai referensi informasi lengkap (read-only).
              </Text>

              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} pt={2}>
                {/* 1. Nomor Memo (Req Number) */}
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700">
                      1. Nomor Memo / Req Code
                    </FormLabel>
                    <Input
                      size="sm"
                      rounded="lg"
                      placeholder="0000/XXX-XXX/X/YYYY"
                      value={reqNumber}
                      onChange={(e) => setReqNumber(e.target.value.toUpperCase())}
                      fontWeight="600"
                      bg={colorMode === "light" ? "white" : "gray.900"}
                    />
                    <FormHelperText fontSize="3xs" color="gray.500">
                      ID Sistem: {reqData.id}
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                {/* 2. Status Requirement */}
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700">
                      2. Status Requirement
                    </FormLabel>
                    <Select
                      size="sm"
                      rounded="lg"
                      value={reqStatus}
                      onChange={(e) => setReqStatus(e.target.value)}
                      fontWeight="700"
                      color={`${currentStatusColor}.600`}
                      bg={colorMode === "light" ? "white" : "gray.900"}
                    >
                      {REQUIREMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText fontSize="3xs" color="gray.500">
                      Bebas memilih status tanpa pembatasan alur workflow
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                {/* 3. Sudah Memiliki Memo Pengantar */}
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700">
                      3. Sudah Ada Memo Pengantar?
                    </FormLabel>
                    <Select
                      size="sm"
                      rounded="lg"
                      value={isHaveMemo}
                      onChange={(e) => setIsHaveMemo(e.target.value)}
                      fontWeight="600"
                      bg={colorMode === "light" ? "white" : "gray.900"}
                    >
                      <option value="Y">Y - Sudah Memiliki Memo</option>
                      <option value="N">N - Belum Memiliki Memo</option>
                    </Select>
                    <FormHelperText fontSize="3xs" color="gray.500">
                      Status kepemilikan memo pengantar resmi
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                {/* 4. Perihal / Narasi Requirement */}
                <GridItem colSpan={{ base: 1, md: 3 }}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="700">
                      4. Perihal / Narasi Requirement
                    </FormLabel>
                    <Textarea
                      size="sm"
                      rounded="lg"
                      rows={3}
                      placeholder="Tuliskan perihal atau deskripsi naratif requirement..."
                      value={reqNarative}
                      onChange={(e) => setReqNarative(e.target.value)}
                      bg={colorMode === "light" ? "white" : "gray.900"}
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <Divider borderColor={editableBorderColor} />

              <HStack justify="flex-end" spacing={3}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => {
                    if (reqData) {
                      setReqNumber(reqData.reqNumber || "");
                      setReqNarative(reqData.reqNarative || "");
                      setReqStatus(reqData.reqStatus || "DRAFT");
                      setIsHaveMemo(reqData.isHaveMemo || "Y");
                    }
                  }}
                  isDisabled={isSaving}
                  rounded="lg"
                >
                  Reset Form
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FiCheck />}
                  onClick={handleSaveAdminChanges}
                  isLoading={isSaving}
                  loadingText="Menyimpan..."
                  rounded="lg"
                  shadow="sm"
                >
                  Simpan Perubahan Admin
                </Button>
              </HStack>
            </VStack>
          </Card>
        </VStack>

        {/* ============================================================ */}
        {/* READ-ONLY MASTER-DETAIL INFORMATION CONSOLE (TABS 1 - 6) */}
        {/* ============================================================ */}
        <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="sm" overflow="hidden">
          <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} variant="unstyled">
            <Box borderBottom="1px solid" borderColor={borderColor} px={5} pt={4} pb={2} bg={headerBg}>
              <CustomTabList variant="pills" fullWidth={false}>
                <CustomTabItem icon={FiFileText} label="Memo & Info" />
                <CustomTabItem
                  icon={FiUsers}
                  label="Personil & Penugasan"
                  badge={reqData.approvalDatas?.length || 0}
                />
                <CustomTabItem
                  icon={FiBriefcase}
                  label="Program Kerja"
                  badge={workPrograms.length}
                />
                <CustomTabItem
                  icon={FiServer}
                  label="Aplikasi & Arsitektur"
                  badge={reqData.appInitialCode || "App"}
                />
                <CustomTabItem
                  icon={FiList}
                  label="Backlog Features"
                  badge={backlogs.length}
                />
                <CustomTabItem
                  icon={FiPaperclip}
                  label="Dokumen Lampiran"
                  badge={uploadedFiles.length}
                />
              </CustomTabList>
            </Box>

            <TabPanels p={{ base: 4, md: 6 }}>
              {/* ============================================================ */}
              {/* TAB 1: MEMO & INFORMASI UMUM (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Panel 1: Memo Detail Info */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Informasi Tanggal & Referensi Memo (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          TANGGAL MEMO
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {formatDateDisplay(reqData.reqInititateDate)}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          TANGGAL MEMO DITERIMA
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {formatDateDisplay(reqData.reqAcceptedDate)}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DURASI HARI PENERIMAAN
                        </Text>
                        <Badge colorScheme={calculatedMemoDays > 0 ? "teal" : "gray"} fontSize="xs" px={2.5}>
                          {calculatedMemoDays} Hari Kalender
                        </Badge>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          STATUS CARRY OVER
                        </Text>
                        <Badge colorScheme={reqData.isCarryOver === "Y" ? "teal" : "gray"} fontSize="xs">
                          {reqData.isCarryOver === "Y" ? "Carry Over Lintas Tahun" : "Bukan Carry Over"}
                        </Badge>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          REFERENSI PARENT MEMO (REFF ID)
                        </Text>
                        <Text fontSize="xs" fontFamily="mono" color={reqData.reffParentId ? "blue.600" : "gray.400"}>
                          {reqData.reffParentId || "(Tidak ada referensi memo parent)"}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 2: Unit Pengirim */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Unit Pengirim Requirement (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DIVISI PENGIRIM
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {reqData.senderDivisionName || reqData.senderDivisionCode || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DIREKTORAT PENGIRIM
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {reqData.senderDirectorateName || reqData.senderDirectorateCode || "-"}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 3: Unit Pengelola TI */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Unit Pengelola TI (Managed By TI - Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DIREKTORAT TI
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {reqData.reqManageByDirectorateName || reqData.reqManageByDirectorateCode || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DIVISI TI
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {reqData.reqManageByDivisionName || reqData.reqManageByDivisionCode || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          GROUP TI
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {reqData.reqManageByGroupName || reqData.reqManageByGroupCode || "-"}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>
                </VStack>
              </TabPanel>

              {/* ============================================================ */}
              {/* TAB 2: PERSONIL & PENUGASAN (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Panel 1: Penugasan Unit / Manager */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Informasi Penugasan Manager (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DITUGASKAN OLEH
                        </Text>
                        <HStack spacing={2} pt={1}>
                          <Avatar size="xs" name={reqData.assignedFromName || "Manager"} />
                          <Text fontSize="sm" fontWeight="600">
                            {reqData.assignedFromName || reqData.assignedFromId || "-"}
                          </Text>
                        </HStack>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          TANGGAL PENUGASAN
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1}>
                          {formatDateDisplay(reqData.assignedToDate)}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 2: Person In Charge (PIC) */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Informasi Person In Charge (PIC User - Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          NAMA PIC
                        </Text>
                        <HStack spacing={2} pt={1}>
                          <Avatar size="xs" name={reqData.userPicName || "PIC"} />
                          <Text fontSize="sm" fontWeight="600">
                            {reqData.userPicName || "-"}
                          </Text>
                        </HStack>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          NRP / NIP PIC
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1}>
                          {reqData.userPicIdentityNumber || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          EMAIL PIC
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1} color="blue.600">
                          {reqData.userPicEmail || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          KONTAK / TELEPON PIC
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1}>
                          {reqData.userPicContanct || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          DIVISI PIC
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1}>
                          {reqData.userPicDivisionName || reqData.userPicDivisionCode || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          GROUP PIC
                        </Text>
                        <Text fontSize="sm" fontWeight="600" pt={1}>
                          {reqData.userPicGroupName || reqData.userPicGroupCode || "-"}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 3: Reviewer & Approver Matrix Table */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Reviewer & Approver Matrix ({reqData.approvalDatas?.length || 0} Anggota - Read-Only)
                    </Heading>

                    {!reqData.approvalDatas || reqData.approvalDatas.length === 0 ? (
                      <Box bg={subtleBg} p={6} rounded="xl" textAlign="center" border="1px dashed" borderColor={borderColor}>
                        <Icon as={FiUsers} boxSize={8} color="gray.400" mb={2} />
                        <Text fontSize="xs" color="gray.500">
                          Belum ada personil approver / reviewer yang ditugaskan pada requirement ini.
                        </Text>
                      </Box>
                    ) : (
                      <Box overflowX="auto" border="1px solid" borderColor={borderColor} rounded="xl">
                        <Table size="sm" variant="simple">
                          <Thead bg={subtleBg}>
                            <Tr>
                              <Th fontSize="3xs" w="50px">
                                #
                              </Th>
                              <Th fontSize="3xs">NAMA APPROVER</Th>
                              <Th fontSize="3xs">USER ID</Th>
                              <Th fontSize="3xs">EMAIL</Th>
                              <Th fontSize="3xs">TELEPON</Th>
                              <Th fontSize="3xs">STATUS PERSETUJUAN</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reqData.approvalDatas.map((item, idx) => {
                              const isApproved = item.isChecked === "Y" || !!item.approvedAt;
                              const statusLabel = isApproved
                                ? "APPROVED"
                                : item.nextAction || "PENDING";
                              const statusColor = isApproved
                                ? "green"
                                : statusLabel.includes("REJECT")
                                ? "red"
                                : "yellow";

                              return (
                                <Tr key={item.id || idx}>
                                  <Td fontSize="xs" fontWeight="bold">
                                    {idx + 1}
                                  </Td>
                                  <Td fontSize="xs" fontWeight="600">
                                    <HStack spacing={2}>
                                      <Avatar size="xs" name={item.approverUserFirstName} />
                                      <Text>{item.approverUserFirstName || "-"}</Text>
                                    </HStack>
                                  </Td>
                                  <Td fontSize="xs" fontFamily="mono">
                                    {item.approverUserCode || "-"}
                                  </Td>
                                  <Td fontSize="xs">{item.approverUserEmail || "-"}</Td>
                                  <Td fontSize="xs">{item.approverUserPhoneNumber || "-"}</Td>
                                  <Td>
                                    <Badge
                                      colorScheme={statusColor}
                                      variant="subtle"
                                      fontSize="3xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      {statusLabel}
                                    </Badge>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Card>
                </VStack>
              </TabPanel>

              {/* ============================================================ */}
              {/* TAB 3: PROGRAM KERJA (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Financial KPI Cards */}
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TOTAL PAGU USER
                        </StatLabel>
                        <StatNumber fontSize="sm" color="blue.600" fontWeight="700">
                          {formatCurrency(totalUserBudget)}
                        </StatNumber>
                      </Stat>
                    </Card>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TOTAL REALISASI USER
                        </StatLabel>
                        <StatNumber fontSize="sm" color="teal.600" fontWeight="700">
                          {formatCurrency(totalUserReal)}
                        </StatNumber>
                      </Stat>
                    </Card>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TOTAL PAGU IT
                        </StatLabel>
                        <StatNumber fontSize="sm" color="purple.600" fontWeight="700">
                          {formatCurrency(totalITBudget)}
                        </StatNumber>
                      </Stat>
                    </Card>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TOTAL REALISASI IT
                        </StatLabel>
                        <StatNumber fontSize="sm" color="orange.600" fontWeight="700">
                          {formatCurrency(totalITReal)}
                        </StatNumber>
                      </Stat>
                    </Card>
                  </SimpleGrid>

                  {/* Panel 1: Program Kerja User (Eksternal) */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Program Kerja User ({externalWPs.length} Item - Read-Only)
                    </Heading>

                    {externalWPs.length === 0 ? (
                      <Box bg={subtleBg} p={5} rounded="xl" textAlign="center" border="1px dashed" borderColor={borderColor}>
                        <Text fontSize="xs" color="gray.500">
                          Tidak ada Program Kerja User yang terdaftar pada requirement ini.
                        </Text>
                      </Box>
                    ) : (
                      <Box overflowX="auto" border="1px solid" borderColor={borderColor} rounded="xl">
                        <Table size="sm" variant="simple">
                          <Thead bg={subtleBg}>
                            <Tr>
                              <Th fontSize="3xs">KODE WP</Th>
                              <Th fontSize="3xs">NAMA PROGRAM KERJA</Th>
                              <Th fontSize="3xs">NAMA REKENING</Th>
                              <Th fontSize="3xs">NO REK / CC</Th>
                              <Th fontSize="3xs">DIVISI PEMILIK</Th>
                              <Th fontSize="3xs" isNumeric>
                                PAGU (IDR)
                              </Th>
                              <Th fontSize="3xs" isNumeric>
                                REALISASI (IDR)
                              </Th>
                              <Th fontSize="3xs" isNumeric>
                                SISA (IDR)
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {externalWPs.map((wp, idx) => (
                              <Tr key={wp.id || idx}>
                                <Td fontSize="xs" fontWeight="bold">
                                  {wp.workProgramCode || "-"}
                                </Td>
                                <Td fontSize="xs">{wp.workProgramName || "-"}</Td>
                                <Td fontSize="xs">{wp.workProgramAccName || "-"}</Td>
                                <Td fontSize="xs" fontFamily="mono">
                                  {wp.workProgramAccNumber || "-"}
                                  {wp.workProgramAccCc ? ` (${wp.workProgramAccCc})` : ""}
                                </Td>
                                <Td fontSize="xs">{wp.divisionName || "-"}</Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="blue.600">
                                  {formatCurrency(wp.workProgramBudget)}
                                </Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="teal.600">
                                  {formatCurrency(wp.workProgramReal)}
                                </Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="gray.600">
                                  {formatCurrency(wp.workProgramLeftovers)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Card>

                  {/* Panel 2: Program Kerja IT (Internal) */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Program Kerja IT ({internalWPs.length} Item - Read-Only)
                    </Heading>

                    {internalWPs.length === 0 ? (
                      <Box bg={subtleBg} p={5} rounded="xl" textAlign="center" border="1px dashed" borderColor={borderColor}>
                        <Text fontSize="xs" color="gray.500">
                          Tidak ada Program Kerja IT yang terdaftar pada requirement ini.
                        </Text>
                      </Box>
                    ) : (
                      <Box overflowX="auto" border="1px solid" borderColor={borderColor} rounded="xl">
                        <Table size="sm" variant="simple">
                          <Thead bg={subtleBg}>
                            <Tr>
                              <Th fontSize="3xs">KODE WP</Th>
                              <Th fontSize="3xs">NAMA PROGRAM KERJA</Th>
                              <Th fontSize="3xs">NAMA REKENING</Th>
                              <Th fontSize="3xs">NO REK / CC</Th>
                              <Th fontSize="3xs">DIVISI PEMILIK</Th>
                              <Th fontSize="3xs" isNumeric>
                                PAGU (IDR)
                              </Th>
                              <Th fontSize="3xs" isNumeric>
                                REALISASI (IDR)
                              </Th>
                              <Th fontSize="3xs" isNumeric>
                                SISA (IDR)
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {internalWPs.map((wp, idx) => (
                              <Tr key={wp.id || idx}>
                                <Td fontSize="xs" fontWeight="bold">
                                  {wp.workProgramCode || "-"}
                                </Td>
                                <Td fontSize="xs">{wp.workProgramName || "-"}</Td>
                                <Td fontSize="xs">{wp.workProgramAccName || "-"}</Td>
                                <Td fontSize="xs" fontFamily="mono">
                                  {wp.workProgramAccNumber || "-"}
                                  {wp.workProgramAccCc ? ` (${wp.workProgramAccCc})` : ""}
                                </Td>
                                <Td fontSize="xs">{wp.divisionName || "-"}</Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="blue.600">
                                  {formatCurrency(wp.workProgramBudget)}
                                </Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="teal.600">
                                  {formatCurrency(wp.workProgramReal)}
                                </Td>
                                <Td fontSize="xs" fontWeight="600" isNumeric color="gray.600">
                                  {formatCurrency(wp.workProgramLeftovers)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Card>
                </VStack>
              </TabPanel>

              {/* ============================================================ */}
              {/* TAB 4: APLIKASI & ARSITEKTUR (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Panel 1: Aplikasi Terkait */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Aplikasi Terkait (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          KODE APPS (INITIAL)
                        </Text>
                        <Badge colorScheme="blue" fontSize="sm" px={2.5} py={0.5} mt={1} rounded="md">
                          {reqData.appInitialCode || "-"}
                        </Badge>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          NAMA LENGKAP APLIKASI
                        </Text>
                        <Text fontSize="sm" fontWeight="600" mt={1}>
                          {reqData.appInitialName || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          TARGET PENGGUNA
                        </Text>
                        <Badge colorScheme="purple" fontSize="xs" mt={1}>
                          {reqData.appTargetUsers || "INTERNAL"}
                        </Badge>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 2: Jaringan & Domain */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Akses Jaringan & Domain (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          FRONTSITE DNS
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="blue.600">
                          {reqData.appAccessFrontsiteDns || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          FRONTSITE IP
                        </Text>
                        <Text fontSize="sm" fontFamily="mono">
                          {reqData.appAccessFrontsiteIp || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          BACKSITE DNS
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="blue.600">
                          {reqData.appAccessBacksiteDns || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          BACKSITE IP
                        </Text>
                        <Text fontSize="sm" fontFamily="mono">
                          {reqData.appAccessBacksiteIp || "-"}
                        </Text>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          MEDIA AKSES JARINGAN
                        </Text>
                        <Badge colorScheme="teal" fontSize="xs" mt={1}>
                          {reqData.appAccessMedia || "INTERNAL (INTRANET)"}
                        </Badge>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 3: Jam Operasional & Rilis */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Jam Operasional & Target Rilis (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          LAYANAN 24 JAM?
                        </Text>
                        <Badge colorScheme={reqData.appOperational24hrs === "Y" ? "green" : "gray"} fontSize="xs" mt={1}>
                          {reqData.appOperational24hrs === "Y" ? "Ya (24 Jam Non-stop)" : "Jam Kerja Tertentu"}
                        </Badge>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          JAM BUKA OPERASIONAL
                        </Text>
                        <Text fontSize="sm" fontWeight="600" mt={1}>
                          {reqData.appOperationalHourOpen || "-"}
                        </Text>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          JAM TUTUP OPERASIONAL
                        </Text>
                        <Text fontSize="sm" fontWeight="600" mt={1}>
                          {reqData.appOperationalHourClosed || "-"}
                        </Text>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600" mb={1}>
                          HARI OPERASIONAL
                        </Text>
                        <HStack spacing={2} wrap="wrap">
                          {operationalDaysList.length === 0 ? (
                            <Text fontSize="xs" color="gray.500">
                              -
                            </Text>
                          ) : (
                            operationalDaysList.map((day) => (
                              <Tag key={day} size="sm" colorScheme="blue" variant="subtle">
                                <TagLabel>{day}</TagLabel>
                              </Tag>
                            ))
                          )}
                        </HStack>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          TARGET TANGGAL GO-LIVE
                        </Text>
                        <Text fontSize="sm" fontWeight="700" color="teal.600" mt={1}>
                          {formatDateDisplay(reqData.appLiveTargetDate)}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Card>

                  {/* Panel 4: Infrastruktur & Keamanan */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Karakteristik, Infrastruktur & Keamanan (Read-Only)
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          LOKASI ENVIRONMENT
                        </Text>
                        <Badge colorScheme="blue" fontSize="xs" mt={1}>
                          {reqData.appEnvLocations || "-"}
                        </Badge>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          PRIVATE AUTHENTICATION
                        </Text>
                        <Badge colorScheme={reqData.appPrivateAuth === "Y" ? "green" : "gray"} fontSize="xs" mt={1}>
                          {reqData.appPrivateAuth === "Y" ? "Ya (Private Auth)" : "Tidak"}
                        </Badge>
                      </GridItem>

                      <GridItem>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          HIGH AVAILABILITY
                        </Text>
                        <Badge colorScheme={reqData.appHightAvailability === "Y" ? "green" : "gray"} fontSize="xs" mt={1}>
                          {reqData.appHightAvailability === "Y" ? "Ya (High Availability)" : "Tidak"}
                        </Badge>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          INTEGRASI DENGAN APLIKASI LAIN
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          {reqData.appIntegrationOthersApps || "(Tidak ada integrasi tercatat)"}
                        </Text>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <Text fontSize="2xs" color="gray.500" fontWeight="600">
                          CATATAN ARSITEKTUR / SCOPE SISTEM
                        </Text>
                        <Box bg={subtleBg} p={3} rounded="lg" mt={1} border="1px solid" borderColor={borderColor}>
                          <Text fontSize="xs" color="gray.600">
                            {reqData.note || "(Tidak ada catatan)"}
                          </Text>
                        </Box>
                      </GridItem>
                    </Grid>
                  </Card>
                </VStack>
              </TabPanel>

              {/* ============================================================ */}
              {/* TAB 5: BACKLOG FEATURES (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {/* Summary Counter Cards */}
                  <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TOTAL BACKLOG FEATURES
                        </StatLabel>
                        <StatNumber fontSize="lg" fontWeight="700">
                          {backlogs.length}
                        </StatNumber>
                      </Stat>
                    </Card>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          TERSEDIA (BELUM KE PROYEK)
                        </StatLabel>
                        <StatNumber fontSize="lg" color="teal.600" fontWeight="700">
                          {backlogs.filter((b) => !b.projectId).length}
                        </StatNumber>
                      </Stat>
                    </Card>
                    <Card variant="outline" borderColor={borderColor} p={4} rounded="xl">
                      <Stat>
                        <StatLabel fontSize="2xs" color="gray.500" fontWeight="600">
                          SUDAH MASUK PROYEK
                        </StatLabel>
                        <StatNumber fontSize="lg" color="blue.600" fontWeight="700">
                          {backlogs.filter((b) => !!b.projectId).length}
                        </StatNumber>
                      </Stat>
                    </Card>
                  </SimpleGrid>

                  {/* Backlogs Table Card */}
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Daftar Backlog Features ({backlogs.length} Fitur - Read-Only)
                    </Heading>

                    {backlogs.length === 0 ? (
                      <Box bg={subtleBg} p={6} rounded="xl" textAlign="center" border="1px dashed" borderColor={borderColor}>
                        <Icon as={FiList} boxSize={8} color="gray.400" mb={2} />
                        <Text fontSize="xs" color="gray.500">
                          Belum ada item backlog features yang tercatat pada requirement ini.
                        </Text>
                      </Box>
                    ) : (
                      <Box overflowX="auto" border="1px solid" borderColor={borderColor} rounded="xl">
                        <Table size="sm" variant="simple">
                          <Thead bg={subtleBg}>
                            <Tr>
                              <Th fontSize="3xs" w="50px">
                                #
                              </Th>
                              <Th fontSize="3xs">KODE</Th>
                              <Th fontSize="3xs">NAMA FITUR</Th>
                              <Th fontSize="3xs">DESKRIPSI</Th>
                              <Th fontSize="3xs">URGENCY</Th>
                              <Th fontSize="3xs">IMPACT</Th>
                              <Th fontSize="3xs">PRIORITY</Th>
                              <Th fontSize="3xs">STATUS PROYEK</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {backlogs.map((b, idx) => {
                              const prio = (b.priority || "LOW").toUpperCase();
                              let prioColor = "gray";
                              if (prio.includes("CRIT")) prioColor = "red";
                              else if (prio.includes("HIGH")) prioColor = "orange";
                              else if (prio.includes("MED")) prioColor = "yellow";
                              else if (prio.includes("LOW")) prioColor = "teal";

                              return (
                                <Tr key={b.id || idx}>
                                  <Td fontSize="xs" fontWeight="bold">
                                    {b.posOrder || idx + 1}
                                  </Td>
                                  <Td fontSize="xs" fontFamily="mono" color="gray.500">
                                    {b.backlogCode || "-"}
                                  </Td>
                                  <Td fontSize="xs" fontWeight="600" maxW="200px">
                                    <Text noOfLines={2}>{b.backlogName}</Text>
                                  </Td>
                                  <Td fontSize="xs" color="gray.600" maxW="280px">
                                    <Text noOfLines={2}>{b.backlogDesc || "-"}</Text>
                                  </Td>
                                  <Td fontSize="3xs">
                                    <Badge variant="outline" colorScheme="gray">
                                      {b.urgency || "LOW"}
                                    </Badge>
                                  </Td>
                                  <Td fontSize="3xs">
                                    <Badge variant="outline" colorScheme="gray">
                                      {b.impact || "LOW"}
                                    </Badge>
                                  </Td>
                                  <Td fontSize="3xs">
                                    <Badge colorScheme={prioColor} variant="solid" px={2} py={0.5} rounded="md">
                                      {prio}
                                    </Badge>
                                  </Td>
                                  <Td fontSize="3xs">
                                    {b.projectId ? (
                                      <Badge colorScheme="purple" variant="subtle">
                                        ID: {b.projectId.slice(0, 8)}...
                                      </Badge>
                                    ) : (
                                      <Badge colorScheme="gray" variant="outline">
                                        Tersedia
                                      </Badge>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Card>
                </VStack>
              </TabPanel>

              {/* ============================================================ */}
              {/* TAB 6: DOKUMEN LAMPIRAN (READ-ONLY) */}
              {/* ============================================================ */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={4}>
                      Dokumen Lampiran ({uploadedFiles.length} File - Read-Only)
                    </Heading>

                    {uploadedFiles.length === 0 ? (
                      <Box bg={subtleBg} p={6} rounded="xl" textAlign="center" border="1px dashed" borderColor={borderColor}>
                        <Icon as={FiPaperclip} boxSize={8} color="gray.400" mb={2} />
                        <Text fontSize="xs" color="gray.500">
                          Tidak ada dokumen atau lampiran yang diunggah pada requirement ini.
                        </Text>
                      </Box>
                    ) : (
                      <Box overflowX="auto" border="1px solid" borderColor={borderColor} rounded="xl">
                        <Table size="sm" variant="simple">
                          <Thead bg={subtleBg}>
                            <Tr>
                              <Th fontSize="3xs" w="50px">
                                #
                              </Th>
                              <Th fontSize="3xs">NAMA DOKUMEN</Th>
                              <Th fontSize="3xs">EKSTENSI</Th>
                              <Th fontSize="3xs">UKURAN</Th>
                              <Th fontSize="3xs">WAKTU UNGGAH</Th>
                              <Th fontSize="3xs" textAlign="right">
                                AKSI
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {uploadedFiles.map((f, idx) => (
                              <Tr key={f.id || idx}>
                                <Td fontSize="xs" fontWeight="bold">
                                  {idx + 1}
                                </Td>
                                <Td fontSize="xs" fontWeight="600">
                                  <HStack spacing={2}>
                                    <Icon as={FiFile} color="blue.500" />
                                    <Text noOfLines={1}>{f.name}</Text>
                                  </HStack>
                                </Td>
                                <Td fontSize="xs">
                                  <Badge variant="subtle" colorScheme="gray" textTransform="uppercase">
                                    {f.extension || "-"}
                                  </Badge>
                                </Td>
                                <Td fontSize="xs" color="gray.500">
                                  {formatFileSize(f.size)}
                                </Td>
                                <Td fontSize="xs" color="gray.500">
                                  {formatDateTimeDisplay(f.createdAt)}
                                </Td>
                                <Td textAlign="right">
                                  {f.url ? (
                                    <Link href={f.url} target="_blank">
                                      <IconButton
                                        aria-label="Download / Preview File"
                                        icon={<FiExternalLink />}
                                        size="xs"
                                        variant="outline"
                                        colorScheme="blue"
                                        rounded="md"
                                      />
                                    </Link>
                                  ) : (
                                    <Text fontSize="3xs" color="gray.400">
                                      -
                                    </Text>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}
