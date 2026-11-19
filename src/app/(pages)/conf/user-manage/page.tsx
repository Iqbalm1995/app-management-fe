"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
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
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tab,
  TabList,
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
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiKey,
  FiLayers,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPower,
  FiRefreshCcw,
  FiRotateCcw,
  FiRepeat,
  FiSave,
  FiSearch,
  FiShare2,
  FiShield,
  FiSlash,
  FiTrash2,
  FiUnlock,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import useUsers, {
  UsersResponse,
  UserAdminUpdatePayload,
  UserCascadeRenamePreviewResponse,
  TableBreakdownItem,
} from "@/app/services/useUsers";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import useSpecialization, { SpecializationResponse } from "@/app/services/useSpecialization";
import { ListSearchByParam, PaggingListPayload } from "@/app/types/masterTypes";
import { RES_CODE_OK, DEFAULT_PWD_SETTINGS } from "@/app/constants/applicationConstants";
import { useAdminConsoleAuth } from "@/app/context/AdminConsoleAuthContext";

// Helper: Safely resolve authentication token from localStorage
function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const directToken = localStorage.getItem("tokenData");
    if (directToken && directToken.trim()) return directToken.trim();

    const authDataStr = localStorage.getItem("authData");
    if (authDataStr) {
      const parsed = JSON.parse(authDataStr);
      const key =
        parsed?.dataAuth?.apiKey ||
        parsed?.dataAuth?.token ||
        parsed?.token ||
        parsed?.apiKey ||
        "";
      if (key && key.trim()) return key.trim();
    }
  } catch (err) {
    console.error("Failed to parse auth token:", err);
  }
  return "";
}

// Helper: Format DateTime for display
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
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

export default function ConfUserManagePage() {
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Service Hooks
  const {
    List: GetUsersList,
    AdminUpdateUser,
    EditUserStatus,
    ContainUser,
    RestoreUser,
    SoftDeleteUser,
    PreviewCascadeRenameUser,
    ExecuteCascadeRenameUser,
  } = useUsers();
  const { List: GetOrganizationsList } = useOrganization();
  const { List: GetTeamsList } = useTeams();
  const { List: GetSpecializationsList } = useSpecialization();

  // Dynamic theme colors
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const hoverRowBg = useColorModeValue("blue.50", "gray.800");
  const modalHeaderBg = useColorModeValue("gray.50", "gray.800");

  // ==========================================================================
  // Special Auth Passkey Protection (Unified Console Context)
  // ==========================================================================
  const { isUnlocked, lockConsole } = useAdminConsoleAuth();

  // ==========================================================================
  // Master Data State: Organizations, Teams, Specializations (Lazy-Loaded)
  // ==========================================================================
  const [divisions, setDivisions] = useState<OrganizationResponse[]>([]);
  const [groups, setGroups] = useState<OrganizationResponse[]>([]);
  const [teams, setTeams] = useState<TeamsResponse[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationResponse[]>([]);
  const [isMasterDataLoaded, setIsMasterDataLoaded] = useState<boolean>(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState<boolean>(false);

  // Lazy-load master data only when opening the edit modal
  const ensureMasterDataLoaded = async () => {
    if (isMasterDataLoaded || isLoadingMasterData) {
      return { loadedTeams: teams, loadedGroups: groups };
    }
    const token = getAuthToken();
    if (!token) return null;

    setIsLoadingMasterData(true);
    try {
      const [divRes, grpRes, teamRes, specRes] = await Promise.all([
        GetOrganizationsList(
          { search: "", limit: 1000, page: 0, filterWhere: [{ field: "orgType", operator: "=", value: "DIVISION" }], fieldOrder: ["orgName"], orderDir: "asc" },
          token
        ),
        GetOrganizationsList(
          { search: "", limit: 1000, page: 0, filterWhere: [{ field: "orgType", operator: "=", value: "GROUP" }], fieldOrder: ["orgName"], orderDir: "asc" },
          token
        ),
        GetTeamsList(
          { search: "", limit: 1000, page: 0, filterWhere: [], fieldOrder: ["teamName"], orderDir: "asc" },
          token
        ),
        GetSpecializationsList(
          { search: "", limit: 1000, page: 0, filterWhere: [], fieldOrder: ["specName"], orderDir: "asc" },
          token
        ),
      ]);

      let loadedTeams: TeamsResponse[] = [];
      let loadedGroups: OrganizationResponse[] = [];

      if (divRes?.statusCode === RES_CODE_OK && Array.isArray(divRes.data)) {
        setDivisions(divRes.data);
      }
      if (grpRes?.statusCode === RES_CODE_OK && Array.isArray(grpRes.data)) {
        setGroups(grpRes.data);
        loadedGroups = grpRes.data;
      }
      if (teamRes?.statusCode === RES_CODE_OK && Array.isArray(teamRes.data)) {
        setTeams(teamRes.data);
        loadedTeams = teamRes.data;
      }
      if (specRes?.statusCode === RES_CODE_OK && Array.isArray(specRes.data)) {
        setSpecializations(specRes.data);
      }
      setIsMasterDataLoaded(true);
      return { loadedTeams, loadedGroups };
    } catch (err) {
      console.error("Error loading master organizations & teams:", err);
      return null;
    } finally {
      setIsLoadingMasterData(false);
    }
  };

  // ==========================================================================
  // Table Data State & Filters
  // ==========================================================================
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [pwdFilter, setPwdFilter] = useState<string>("ALL"); // "ALL" | "CONTAINED" | "NORMAL"

  // Containment Statistics State
  const [containedCount, setContainedCount] = useState<number>(0);
  const [isLoadingContainedCount, setIsLoadingContainedCount] = useState<boolean>(false);

  // Status Change Modal State
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();
  const [statusTargetUser, setStatusTargetUser] = useState<UsersResponse | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("ACTIVE");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState<boolean>(false);

  // Permanent Suspend / Contain Alert State
  const {
    isOpen: isContainAlertOpen,
    onOpen: onContainAlertOpen,
    onClose: onContainAlertClose,
  } = useDisclosure();
  const [containTargetUser, setContainTargetUser] = useState<UsersResponse | null>(null);
  const [containReason, setContainReason] = useState<string>("");
  const [isSubmittingContain, setIsSubmittingContain] = useState<boolean>(false);
  const containCancelRef = useRef<any>(null);

  // Restore Contained Modal State
  const {
    isOpen: isRestoreModalOpen,
    onOpen: onRestoreModalOpen,
    onClose: onRestoreModalClose,
  } = useDisclosure();
  const [restoreTargetUser, setRestoreTargetUser] = useState<UsersResponse | null>(null);
  const [isSubmittingRestore, setIsSubmittingRestore] = useState<boolean>(false);
  const restoreCancelRef = useRef<any>(null);

  // Soft Delete Alert State
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure();
  const [deleteTargetUser, setDeleteTargetUser] = useState<UsersResponse | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);
  const deleteCancelRef = useRef<any>(null);

  // Cascade Rename USER_ID Modal State
  const {
    isOpen: isCascadeModalOpen,
    onOpen: onCascadeModalOpen,
    onClose: onCascadeModalClose,
  } = useDisclosure();
  const [cascadeTargetUser, setCascadeTargetUser] = useState<UsersResponse | null>(null);
  const [cascadeStep, setCascadeStep] = useState<1 | 2>(1);
  const [newUserIdInput, setNewUserIdInput] = useState<string>("");
  const [cascadeReasonInput, setCascadeReasonInput] = useState<string>("");
  const [cascadeAuditFields, setCascadeAuditFields] = useState<boolean>(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isExecutingCascade, setIsExecutingCascade] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<UserCascadeRenamePreviewResponse | null>(null);
  const [isConfirmedAgreement, setIsConfirmedAgreement] = useState<boolean>(false);

  // TanStack Pagination State
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Detail Modal State
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  const handleViewDetail = (user: UsersResponse) => {
    setSelectedUser(user);
    onDetailOpen();
  };

  // ==========================================================================
  // Edit Modal Form State
  // ==========================================================================
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<UsersResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields: 1. Identity & Contact
  const [formNama, setFormNama] = useState<string>("");
  const [formNrp, setFormNrp] = useState<string>("");
  const [formNip, setFormNip] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("ACTIVE");

  // Form Fields: 2. Cascading Organization & Team Selection
  const [formDivisionId, setFormDivisionId] = useState<string>("");
  const [formGroupId, setFormGroupId] = useState<string>("");
  const [formTeamId, setFormTeamId] = useState<string>("");
  const [formTeamRoleId, setFormTeamRoleId] = useState<string>("");
  const [formKodeGroupKerja, setFormKodeGroupKerja] = useState<string>("");
  const [formNamaGroupKerja, setFormNamaGroupKerja] = useState<string>("");

  // Form Fields: 3. Position & Work Unit
  const [formJabatan, setFormJabatan] = useState<string>("");
  const [formKodeJabatan, setFormKodeJabatan] = useState<string>("");
  const [formNamaUnitKerja, setFormNamaUnitKerja] = useState<string>("");
  const [formKodeUnitKerja, setFormKodeUnitKerja] = useState<string>("");
  const [formCostCentre, setFormCostCentre] = useState<string>("");
  const [formIsApproval, setFormIsApproval] = useState<string>("N");

  // Form Fields: 4. Office & Location
  const [formKodeCabang, setFormKodeCabang] = useState<string>("");
  const [formNamaCabang, setFormNamaCabang] = useState<string>("");
  const [formKodeInduk, setFormKodeInduk] = useState<string>("");
  const [formNamaInduk, setFormNamaInduk] = useState<string>("");
  const [formKodeKanwil, setFormKodeKanwil] = useState<string>("");
  const [formNamaKanwil, setFormNamaKanwil] = useState<string>("");
  const [formIdFungsi, setFormIdFungsi] = useState<string>("");
  const [formNamaFungsi, setFormNamaFungsi] = useState<string>("");
  const [formKodePenempatan, setFormKodePenempatan] = useState<string>("");
  const [formNamaPenempatan, setFormNamaPenempatan] = useState<string>("");

  // Filtered Groups based on selected Division
  const availableGroups = useMemo(() => {
    if (!formDivisionId) return [];
    return groups.filter((g) => g.parentId === formDivisionId);
  }, [groups, formDivisionId]);

  // Filtered Teams based on selected Group
  const availableTeams = useMemo(() => {
    if (!formGroupId) return [];
    return teams.filter((t) => t.orgGroupId === formGroupId);
  }, [teams, formGroupId]);

  // Cascading Selection Handlers
  const handleDivisionChange = (newDivId: string) => {
    setFormDivisionId(newDivId);
    setFormGroupId("");
    setFormTeamId("");
    setFormTeamRoleId("");
    setFormKodeGroupKerja("");
    setFormNamaGroupKerja("");
  };

  const handleGroupChange = (newGrpId: string) => {
    setFormGroupId(newGrpId);
    setFormTeamId("");
    setFormTeamRoleId("");
    const matchedGroup = groups.find((g) => g.id === newGrpId);
    if (matchedGroup) {
      setFormKodeGroupKerja(matchedGroup.orgCode);
      setFormNamaGroupKerja(matchedGroup.orgName);
    } else {
      setFormKodeGroupKerja("");
      setFormNamaGroupKerja("");
    }
  };

  const handleTeamChange = (newTeamId: string) => {
    setFormTeamId(newTeamId);
    if (!newTeamId) {
      setFormTeamRoleId("");
    }
  };

  // Open Edit Modal with Pre-populated Data
  const handleOpenEdit = async (user: UsersResponse) => {
    setEditingUser(user);

    // 1. Identity & Contact
    setFormNama(user.nama || "");
    setFormNrp(user.nrp || "");
    setFormNip(user.nip || "");
    setFormEmail(user.email || "");
    setFormPhone(user.phoneNumber || "");
    const rawSt = (user.userStatus || "ACTIVE").toUpperCase();
    setFormStatus(rawSt === "1" ? "ACTIVE" : rawSt);

    // 3. Position & Work Unit
    setFormJabatan(user.jabatan || "");
    setFormKodeJabatan(user.kodeJabatan || "");
    setFormNamaUnitKerja(user.namaUnitKerja || "");
    setFormKodeUnitKerja(user.kodeUnitKerja || "");
    setFormCostCentre(user.costCentre || "");
    setFormIsApproval(user.isApproval === "Y" ? "Y" : "N");

    // 4. Office & Location
    setFormKodeCabang(user.kodeCabang || "");
    setFormNamaCabang(user.namaCabang || "");
    setFormKodeInduk(user.kodeInduk || "");
    setFormNamaInduk(user.namaInduk || "");
    setFormKodeKanwil(user.kodeKanwil || "");
    setFormNamaKanwil(user.namaKanwil || "");
    setFormIdFungsi(user.idFungsi || "");
    setFormNamaFungsi(user.namaFungsi || "");
    setFormKodePenempatan(user.kodePenempatan || "");
    setFormNamaPenempatan(user.namaPenempatan || "");

    setFormKodeGroupKerja(user.kodeGroupKerja || "");
    setFormNamaGroupKerja(user.namaGroupKerja || "");

    onEditOpen();

    // Lazy load master data on-demand if not yet loaded
    let activeTeams = teams;
    let activeGroups = groups;
    if (!isMasterDataLoaded) {
      const res = await ensureMasterDataLoaded();
      if (res) {
        activeTeams = res.loadedTeams;
        activeGroups = res.loadedGroups;
      }
    }

    // 2. Organization & Team Pre-population
    let resolvedDivId = "";
    let resolvedGrpId = "";
    const resolvedTeamId = user.team?.id || "";
    const resolvedRoleId = user.teamRole?.id || "";

    if (user.team?.id) {
      const t = activeTeams.find((item) => item.id === user.team?.id);
      const grpId = t?.orgGroupId || user.team.orgGroupId || "";
      resolvedGrpId = grpId;
      if (grpId) {
        const g = activeGroups.find((item) => item.id === grpId);
        resolvedDivId = g?.parentId || user.team.organization?.division?.id || "";
      }
    } else if (user.kodeGroupKerja) {
      const g = activeGroups.find((item) => item.orgCode === user.kodeGroupKerja);
      if (g) {
        resolvedGrpId = g.id;
        resolvedDivId = g.parentId || "";
      }
    }

    setFormDivisionId(resolvedDivId);
    setFormGroupId(resolvedGrpId);
    setFormTeamId(resolvedTeamId);
    setFormTeamRoleId(resolvedRoleId);
  };

  // Submit Edit Form Handler
  const handleSaveUser = async () => {
    if (!editingUser) return;
    if (!formNama.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Lengkap pengguna wajib diisi.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }
    if (!formEmail.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Email resmi pengguna wajib diisi.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const payload: UserAdminUpdatePayload = {
        id: editingUser.id,
        nama: formNama.trim(),
        nrp: formNrp.trim(),
        nip: formNip.trim(),
        email: formEmail.trim(),
        phoneNumber: formPhone.trim(),
        userStatus: formStatus,
        kodeGroupKerja: formKodeGroupKerja,
        namaGroupKerja: formNamaGroupKerja,
        teamId: formTeamId || null,
        teamRoleId: formTeamRoleId || null,
        jabatan: formJabatan.trim(),
        kodeJabatan: formKodeJabatan.trim(),
        namaUnitKerja: formNamaUnitKerja.trim(),
        kodeUnitKerja: formKodeUnitKerja.trim(),
        costCentre: formCostCentre.trim(),
        isApproval: formIsApproval,
        kodeCabang: formKodeCabang.trim(),
        namaCabang: formNamaCabang.trim(),
        kodeInduk: formKodeInduk.trim(),
        namaInduk: formNamaInduk.trim(),
        kodeKanwil: formKodeKanwil.trim(),
        namaKanwil: formNamaKanwil.trim(),
        idFungsi: formIdFungsi.trim(),
        namaFungsi: formNamaFungsi.trim(),
        kodePenempatan: formKodePenempatan.trim(),
        namaPenempatan: formNamaPenempatan.trim(),
      };

      const res = await AdminUpdateUser(payload, token);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Berhasil Disimpan",
          description: `Profil pengguna ${formNama} dan penugasan tim berhasil diperbarui.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        onEditClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Menyimpan",
          description: res?.message || "Terjadi kendala saat memperbarui profil pengguna.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error("Save user error:", err);
      toast({
        title: "Kesalahan Sistem",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset pagination to page 0 whenever search or filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [appliedSearch, statusFilter, pwdFilter]);

  // Fetch Contained Count for Security Metrics
  useEffect(() => {
    if (!isUnlocked) return;
    const token = getAuthToken();
    if (!token) return;

    let isSubscribed = true;
    setIsLoadingContainedCount(true);

    GetUsersList(
      {
        search: "",
        limit: 1,
        page: 0,
        filterWhere: [{ field: "MainPwd", operator: "=", value: "CONTAINED" }],
        fieldOrder: ["Nama"],
        orderDir: "asc",
      },
      token
    )
      .then((res) => {
        if (!isSubscribed) return;
        if (res?.statusCode === RES_CODE_OK) {
          setContainedCount(res.countTotal ?? 0);
        }
      })
      .catch((err) => console.error("Error fetching contained count:", err))
      .finally(() => {
        if (isSubscribed) setIsLoadingContainedCount(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isUnlocked, refreshTrigger]);

  // ==========================================================================
  // Data Fetching: Isolated Pattern (No Circular Dependency Loops)
  // ==========================================================================
  useEffect(() => {
    if (!isUnlocked) return;

    const token = getAuthToken();
    if (!token) {
      console.warn("User Management: No authentication token found.");
      return;
    }

    let isSubscribed = true;
    setIsLoadingUsers(true);

    // Build filter query for backend
    const filterWhere: ListSearchByParam[] = [];
    if (statusFilter === "ACTIVE") {
      filterWhere.push({
        field: "UserStatus",
        operator: "like",
        value: "ACTIV",
      });
    } else if (statusFilter === "INACTIVE") {
      filterWhere.push({
        field: "UserStatus",
        operator: "like",
        value: "INACT",
      });
    }

    if (pwdFilter === "CONTAINED") {
      filterWhere.push({
        field: "MainPwd",
        operator: "=",
        value: "CONTAINED",
      });
    } else if (pwdFilter === "NORMAL") {
      filterWhere.push({
        field: "MainPwd",
        operator: "!=",
        value: "CONTAINED",
      });
    }

    const payload: PaggingListPayload = {
      search: appliedSearch.trim(),
      limit: pageSize,
      page: pageIndex,
      filterWhere,
      fieldOrder: ["Nama"],
      orderDir: "asc",
    };

    GetUsersList(payload, token)
      .then((res) => {
        if (!isSubscribed) return;
        if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
          setUsers(res.data);
          const total = res.countTotal ?? res.data.length ?? 0;
          setTotalCount(total);
        } else {
          setUsers([]);
          setTotalCount(0);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Error loading user management data:", err);
        setUsers([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingUsers(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [
    isUnlocked,
    pageIndex,
    pageSize,
    appliedSearch,
    statusFilter,
    pwdFilter,
    refreshTrigger,
  ]);

  // Status Change Actions
  const handleOpenChangeStatus = (user: UsersResponse) => {
    setStatusTargetUser(user);
    const currentSt = (user.userStatus || "INACTIVE").toUpperCase();
    setSelectedNewStatus(currentSt === "ACTIVE" || currentSt === "1" ? "INACTIVE" : "ACTIVE");
    onStatusOpen();
  };

  const handleSaveChangeStatus = async () => {
    if (!statusTargetUser) return;
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingStatus(true);
    try {
      const res = await EditUserStatus(statusTargetUser.userId, selectedNewStatus, token);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Status Berhasil Diperbarui",
          description: `Status pengguna ${statusTargetUser.nama} diubah menjadi ${selectedNewStatus}.`,
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        onStatusClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Mengubah Status",
          description: res?.message || "Terjadi kendala saat memperbarui status pengguna.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Permanent Suspend / Contain Actions
  const handleOpenContain = (user: UsersResponse) => {
    setContainTargetUser(user);
    setContainReason("");
    onContainAlertOpen();
  };

  const handleExecuteContain = async () => {
    if (!containTargetUser) return;
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingContain(true);
    try {
      const res = await ContainUser(containTargetUser.userId, containReason.trim(), token);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Akun Dikarantina (CONTAINED)",
          description: `Akun ${containTargetUser.nama} berhasil di-suspend permanen (MAIN_PWD diubah menjadi CONTAINED & status INACTIVE).`,
          status: "warning",
          duration: 4500,
          isClosable: true,
        });
        onContainAlertClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Mengkarantina Akun",
          description: res?.message || "Terjadi kendala saat proses containment.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingContain(false);
    }
  };

  // Restore Contained Actions
  const handleOpenRestore = (user: UsersResponse) => {
    setRestoreTargetUser(user);
    onRestoreModalOpen();
  };

  const handleExecuteRestore = async () => {
    if (!restoreTargetUser) return;
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingRestore(true);
    try {
      const res = await RestoreUser(restoreTargetUser.userId, DEFAULT_PWD_SETTINGS, token);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Akun Berhasil Dipulihkan",
          description: `Password akun ${restoreTargetUser.nama} berhasil di-reset ke default dan status diaktifkan kembali (ACTIVE).`,
          status: "success",
          duration: 4500,
          isClosable: true,
        });
        onRestoreModalClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Memulihkan Akun",
          description: res?.message || "Terjadi kendala saat proses pemulihan akun.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingRestore(false);
    }
  };

  // Soft Delete Actions
  const handleOpenDelete = (user: UsersResponse) => {
    setDeleteTargetUser(user);
    setDeleteReason("");
    onDeleteAlertOpen();
  };

  const handleExecuteDelete = async () => {
    if (!deleteTargetUser) return;
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingDelete(true);
    try {
      const res = await SoftDeleteUser(deleteTargetUser.userId, deleteReason.trim(), token);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Pengguna Berhasil Dihapus",
          description: `Pengguna ${deleteTargetUser.nama} (${deleteTargetUser.userId}) berhasil di-soft delete dari sistem.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        onDeleteAlertClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Menghapus Pengguna",
          description: res?.message || "Terjadi kendala saat menghapus pengguna.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan",
        description: err.message || "Gagal menghubungi server.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Cascade Rename Actions
  const handleOpenCascadeRename = (user: UsersResponse) => {
    setCascadeTargetUser(user);
    setNewUserIdInput("");
    setCascadeReasonInput("");
    setCascadeAuditFields(true);
    setCascadeStep(1);
    setPreviewData(null);
    setIsConfirmedAgreement(false);
    onCascadeModalOpen();
  };

  const handleRunCascadePreview = async () => {
    if (!cascadeTargetUser) return;
    const cleanNewId = newUserIdInput.trim();
    if (!cleanNewId) {
      toast({
        title: "USER_ID Baru Wajib Diisi",
        description: "Silakan masukkan USER_ID baru pengganti.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (cleanNewId.toUpperCase() === cascadeTargetUser.userId.toUpperCase()) {
      toast({
        title: "USER_ID Sama",
        description: "USER_ID baru tidak boleh sama dengan USER_ID lama.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setIsLoadingPreview(true);
    try {
      const res = await PreviewCascadeRenameUser(
        { oldUserId: cascadeTargetUser.userId, newUserId: cleanNewId },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setPreviewData(res.data);
        setCascadeStep(2);
      } else {
        toast({
          title: "Gagal Meninjau Dampak",
          description: res?.message || "Tidak dapat memverifikasi relasi data.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan Server",
        description: err.message || "Gagal menghubungi server backend.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteCascadeRename = async () => {
    if (!cascadeTargetUser || !isConfirmedAgreement) return;
    const cleanNewId = newUserIdInput.trim();
    if (!cleanNewId) return;

    const token = getAuthToken();
    if (!token) return;

    setIsExecutingCascade(true);
    try {
      const res = await ExecuteCascadeRenameUser(
        {
          oldUserId: cascadeTargetUser.userId,
          newUserId: cleanNewId,
          reason: cascadeReasonInput.trim(),
          cascadeAuditFields,
        },
        token
      );
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Migrasi USER_ID Berhasil",
          description: res.message || `USER_ID berhasil diubah menjadi ${cleanNewId} dan terupdate ke seluruh relasi database.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onCascadeModalClose();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast({
          title: "Gagal Eksekusi Migrasi",
          description: res?.message || "Terjadi kegagalan saat migrasi relasi data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: "Kesalahan Eksekusi",
        description: err.message || "Gagal memproses migrasi ke server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecutingCascade(false);
    }
  };

  // Search actions
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearch("");
  };

  // Quick stats computed
  const activeCount = useMemo(() => {
    return users.filter((u) => {
      const s = (u.userStatus || "").toUpperCase();
      return s === "ACTIVE" || s === "1";
    }).length;
  }, [users]);

  // ==========================================================================
  // Table Columns Definition
  // ==========================================================================
  const columns = useMemo<ColumnDef<UsersResponse>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: (info) => (
          <Text fontSize="xs" fontWeight="700" color="gray.500" textAlign="center">
            {pageIndex * pageSize + info.row.index + 1}
          </Text>
        ),
        size: 50,
      },
      {
        accessorKey: "nama",
        header: "PENGGUNA / USER IDENTITY",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <HStack spacing={3} align="center" minW="220px">
              <Avatar
                size="sm"
                name={user.nama || user.userId || "User"}
                src={user.profilePict || undefined}
                bg="blue.500"
                color="white"
                fontWeight="700"
              />
              <VStack align="start" spacing={0.5}>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color={colorMode === "light" ? "gray.800" : "white"}
                  noOfLines={1}
                >
                  {user.nama || "-"}
                </Text>
                <HStack spacing={1.5} fontSize="2xs" color="gray.500">
                  <Badge variant="subtle" colorScheme="blue" fontSize="3xs" px={1.5} rounded="md">
                    {user.userId || "-"}
                  </Badge>
                  {(user.nrp || user.nip) && (
                    <Text noOfLines={1}>
                      NRP: {user.nrp || "-"} | NIP: {user.nip || "-"}
                    </Text>
                  )}
                </HStack>
              </VStack>
            </HStack>
          );
        },
      },
      {
        id: "organization",
        header: "TIM & SPESIALISASI",
        cell: ({ row }) => {
          const team = row.original.team;
          const role = row.original.teamRole;
          return (
            <VStack align="start" spacing={1} minW="180px">
              {team?.teamName ? (
                <Badge colorScheme="purple" variant="solid" fontSize="3xs" px={2} py={0.5} rounded="full">
                  {team.teamName}
                </Badge>
              ) : (
                <Text fontSize="xs" color="gray.400" fontStyle="italic">
                  Belum Ditugaskan Tim
                </Text>
              )}
              {role?.specName && (
                <Badge colorScheme="teal" variant="subtle" fontSize="3xs" px={2} rounded="md">
                  {role.specName}
                </Badge>
              )}
              {row.original.namaGroupKerja && (
                <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                  Group: {row.original.namaGroupKerja}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        id: "position",
        header: "JABATAN & UNIT KERJA",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <VStack align="start" spacing={0.5} minW="190px">
              <Text fontSize="xs" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                {user.jabatan || "-"}
              </Text>
              <HStack spacing={1} fontSize="2xs" color="gray.500">
                <Icon as={FiBriefcase} boxSize={3} />
                <Text noOfLines={1}>
                  {user.namaUnitKerja || user.kodeUnitKerja || "-"}
                </Text>
              </HStack>
            </VStack>
          );
        },
      },
      {
        id: "branch",
        header: "KANTOR / WILAYAH",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <VStack align="start" spacing={0.5} minW="150px">
              <HStack spacing={1} fontSize="xs" fontWeight="500">
                <Icon as={FiMapPin} boxSize={3} color="orange.400" />
                <Text noOfLines={1}>{user.namaCabang || user.kodeCabang || "-"}</Text>
              </HStack>
              {user.namaKanwil && (
                <Text fontSize="3xs" color="gray.500" pl={4} noOfLines={1}>
                  Kanwil: {user.namaKanwil}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        id: "contact",
        header: "KONTAK",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <VStack align="start" spacing={0.5} minW="170px">
              <HStack spacing={1} fontSize="xs" color="blue.500">
                <Icon as={FiMail} boxSize={3} />
                <Text noOfLines={1} title={user.email}>
                  {user.email || "-"}
                </Text>
              </HStack>
              {user.phoneNumber && (
                <HStack spacing={1} fontSize="2xs" color="gray.500">
                  <Icon as={FiPhone} boxSize={3} />
                  <Text>{user.phoneNumber}</Text>
                </HStack>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "userStatus",
        header: "STATUS & KEAMANAN",
        cell: ({ row }) => {
          const user = row.original;
          const rawStatus = (user.userStatus || "INACTIVE").toUpperCase();
          const isActive = rawStatus === "ACTIVE" || rawStatus === "1";
          const isContained =
            user.isContained === true ||
            (typeof user.mainPwd === "string" &&
              user.mainPwd.trim().toUpperCase() === "CONTAINED");
          return (
            <VStack align="start" spacing={1.5}>
              <Badge
                colorScheme={isActive ? "green" : "gray"}
                variant="subtle"
                fontSize="2xs"
                px={2.5}
                py={0.5}
                rounded="full"
                fontWeight="700"
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
              {isContained && (
                <Tag
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  rounded="full"
                  px={2}
                  py={0.5}
                >
                  <TagLabel fontSize="3xs" fontWeight="800" letterSpacing="tight">
                    CONTAINED
                  </TagLabel>
                </Tag>
              )}
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: "AKSI",
        cell: ({ row }) => {
          const user = row.original;
          const isContained =
            user.isContained === true ||
            (typeof user.mainPwd === "string" &&
              user.mainPwd.trim().toUpperCase() === "CONTAINED");
          return (
            <HStack spacing={1}>
              <Tooltip label="Lihat Profil Lengkap" placement="top" hasArrow>
                <IconButton
                  aria-label="Detail Profil"
                  icon={<FiEye />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  rounded="lg"
                  onClick={() => handleViewDetail(user)}
                />
              </Tooltip>
              <Tooltip label="Edit Profil & Penugasan Tim" placement="top" hasArrow>
                <IconButton
                  aria-label="Edit Profil"
                  icon={<FiEdit2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="orange"
                  rounded="lg"
                  onClick={() => handleOpenEdit(user)}
                />
              </Tooltip>
              <Tooltip label="Ubah Status (Aktif / Nonaktif)" placement="top" hasArrow>
                <IconButton
                  aria-label="Ubah Status"
                  icon={<FiPower />}
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  rounded="lg"
                  onClick={() => handleOpenChangeStatus(user)}
                />
              </Tooltip>
              <Tooltip label="Migrasi USER_ID (Cascade)" placement="top" hasArrow>
                <IconButton
                  aria-label="Migrasi USER_ID"
                  icon={<FiShare2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="cyan"
                  rounded="lg"
                  onClick={() => handleOpenCascadeRename(user)}
                />
              </Tooltip>
              {!isContained ? (
                <Tooltip label="Permanent Suspend & Contain Akun" placement="top" hasArrow>
                  <IconButton
                    aria-label="Suspend & Contain"
                    icon={<FiAlertTriangle />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    rounded="lg"
                    onClick={() => handleOpenContain(user)}
                  />
                </Tooltip>
              ) : (
                <Tooltip label="Restore Akun (Default Password & Aktifkan)" placement="top" hasArrow>
                  <IconButton
                    aria-label="Restore Akun"
                    icon={<FiRotateCcw />}
                    size="sm"
                    variant="solid"
                    colorScheme="teal"
                    rounded="lg"
                    onClick={() => handleOpenRestore(user)}
                  />
                </Tooltip>
              )}
              <Tooltip label="Hapus Pengguna (Soft Delete)" placement="top" hasArrow>
                <IconButton
                  aria-label="Hapus Pengguna"
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  rounded="lg"
                  onClick={() => handleOpenDelete(user)}
                />
              </Tooltip>
            </HStack>
          );
        },
      },
    ],
    [pageIndex, pageSize, colorMode]
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const table = useReactTable({
    data: users,
    columns,
    pageCount: totalPages > 0 ? totalPages : 1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <Box position="relative" bg={pageBg} minH="100vh" py={6}>
      <Container maxW="7xl">
          {/* Header Bar */}
          <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="sm" p={5} mb={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <HStack spacing={3}>
                <Link href="/conf/admin-mode">
                  <IconButton
                    aria-label="Kembali ke Admin Console"
                    icon={<FiArrowLeft />}
                    variant="outline"
                    size="sm"
                    rounded="xl"
                  />
                </Link>
                <Flex
                  w={10}
                  h={10}
                  rounded="xl"
                  bg="blue.500"
                  color="white"
                  align="center"
                  justify="center"
                  shadow="sm"
                >
                  <Icon as={FiUsers} boxSize={5} />
                </Flex>
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Heading size="md" letterSpacing="tight">
                      User Management Console
                    </Heading>
                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px={2} rounded="full">
                      /conf/user-manage
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Katalog dan administrasi data pengguna terintegrasi UIM & Organisasi
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2} align="center">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => setRefreshTrigger((prev) => prev + 1)}
                  isLoading={isLoadingUsers}
                  loadingText="Memuat..."
                  rounded="xl"
                >
                  Muat Ulang
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  leftIcon={<FiLock />}
                  onClick={lockConsole}
                  rounded="xl"
                >
                  Kunci Sesi
                </Button>
              </HStack>
            </Flex>
          </Card>

          {/* Quick Metrics Bar */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
            <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="xs" p={4}>
              <Stat>
                <StatLabel fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Total Terdaftar
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="800" color="blue.500">
                  {totalCount.toLocaleString("id-ID")}
                </StatNumber>
              </Stat>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="xs" p={4}>
              <Stat>
                <StatLabel fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Aktif di Halaman Ini
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="800" color="green.500">
                  {activeCount}
                </StatNumber>
              </Stat>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="xs" p={4}>
              <Stat>
                <StatLabel fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Nonaktif di Halaman Ini
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="800" color="gray.500">
                  {Math.max(0, users.length - activeCount)}
                </StatNumber>
              </Stat>
            </Card>

            <Tooltip label="Klik untuk memfilter daftar akun terkarantina (CONTAINED)" hasArrow>
              <Card
                bg={pwdFilter === "CONTAINED" ? (colorMode === "light" ? "red.50" : "red.950") : cardBg}
                borderColor={pwdFilter === "CONTAINED" ? "red.400" : borderColor}
                borderWidth={pwdFilter === "CONTAINED" ? "2px" : "1px"}
                rounded="2xl"
                shadow="xs"
                p={4}
                cursor="pointer"
                onClick={() => setPwdFilter(pwdFilter === "CONTAINED" ? "ALL" : "CONTAINED")}
                transition="all 0.2s"
                _hover={{ shadow: "md", borderColor: "red.400" }}
              >
                <Stat>
                  <HStack justify="space-between" align="center">
                    <StatLabel fontSize="2xs" color={pwdFilter === "CONTAINED" ? "red.600" : "gray.500"} textTransform="uppercase" fontWeight="700">
                      Terkarantina (CONTAINED)
                    </StatLabel>
                    <Icon as={FiAlertTriangle} color="red.500" boxSize={4} />
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="800" color="red.500">
                    {isLoadingContainedCount ? "..." : containedCount.toLocaleString("id-ID")}
                  </StatNumber>
                  <HStack spacing={1} mt={1}>
                    <Tag size="sm" colorScheme="red" variant="solid" rounded="full" fontSize="3xs" px={1.5} py={0}>
                      <TagLabel>MAIN_PWD = CONTAINED</TagLabel>
                    </Tag>
                  </HStack>
                </Stat>
              </Card>
            </Tooltip>
          </Grid>

          {/* Search & Filter Toolbar */}
          <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="sm" p={4} mb={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={3}
            >
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari berdasarkan Nama, User ID, NRP, atau NIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    rounded="xl"
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  />
                  {searchQuery && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Bersihkan pencarian"
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        onClick={handleClearSearch}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </form>

              {/* Status & Password Filter & Page Size */}
              <HStack spacing={3} wrap="wrap">
                <HStack spacing={1}>
                  <Icon as={FiFilter} color="gray.400" boxSize={3.5} />
                  <Text fontSize="xs" fontWeight="600" color="gray.500">
                    Status:
                  </Text>
                  <Select
                    size="sm"
                    w="125px"
                    rounded="xl"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  >
                    <option value="ALL">Semua</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </Select>
                </HStack>

                <HStack spacing={1}>
                  <Icon as={FiShield} color={pwdFilter === "CONTAINED" ? "red.500" : "gray.400"} boxSize={3.5} />
                  <Text fontSize="xs" fontWeight="600" color="gray.500">
                    Password:
                  </Text>
                  <Select
                    size="sm"
                    w="165px"
                    rounded="xl"
                    value={pwdFilter}
                    onChange={(e) => {
                      setPwdFilter(e.target.value);
                    }}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    borderColor={pwdFilter === "CONTAINED" ? "red.400" : undefined}
                    color={pwdFilter === "CONTAINED" ? "red.500" : undefined}
                    fontWeight={pwdFilter === "CONTAINED" ? "700" : "normal"}
                  >
                    <option value="ALL">Semua Password</option>
                    <option value="CONTAINED">CONTAINED (Karantina)</option>
                    <option value="NORMAL">Normal (Non-Contained)</option>
                  </Select>
                </HStack>

                <HStack spacing={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">
                    Baris:
                  </Text>
                  <Select
                    size="sm"
                    w="80px"
                    rounded="xl"
                    value={pageSize}
                    onChange={(e) => {
                      setPagination({ pageIndex: 0, pageSize: Number(e.target.value) });
                    }}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Select>
                </HStack>

                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSearchSubmit}
                  rounded="xl"
                  leftIcon={<FiSearch />}
                >
                  Cari
                </Button>
              </HStack>
            </Flex>
          </Card>

          {/* Active Containment Filter Banner */}
          {pwdFilter === "CONTAINED" && (
            <Flex
              mb={4}
              align="center"
              justify="space-between"
              gap={3}
              p={3}
              bg={colorMode === "light" ? "red.50" : "red.950"}
              border="1px"
              borderColor={colorMode === "light" ? "red.200" : "red.800"}
              rounded="2xl"
              shadow="xs"
            >
              <HStack spacing={2.5}>
                <Flex
                  w={7}
                  h={7}
                  rounded="lg"
                  bg="red.500"
                  color="white"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiAlertTriangle} boxSize={4} />
                </Flex>
                <Box>
                  <HStack spacing={2}>
                    <Text fontSize="xs" fontWeight="700" color="red.600">
                      Filter Aktif: Akun Terkarantina (MAIN_PWD = &quot;CONTAINED&quot;)
                    </Text>
                    <Badge colorScheme="red" variant="solid" fontSize="3xs" rounded="full" px={1.5}>
                      {containedCount} Akun
                    </Badge>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500">
                    Menampilkan daftar pengguna yang akunnya di-suspend permanen dan dikarantina dari sistem.
                  </Text>
                </Box>
              </HStack>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                rounded="lg"
                onClick={() => setPwdFilter("ALL")}
              >
                Hapus Filter
              </Button>
            </Flex>
          )}

          {/* User Data Table */}
          <Card bg={cardBg} borderColor={borderColor} rounded="2xl" shadow="sm" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <Th
                          key={header.id}
                          fontSize="2xs"
                          fontWeight="700"
                          letterSpacing="wider"
                          color="gray.500"
                          py={3.5}
                          borderColor={borderColor}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </Th>
                      ))}
                    </Tr>
                  ))}
                </Thead>

                <Tbody>
                  {isLoadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Tr key={`skel-${i}`}>
                        <Td colSpan={columns.length} py={4}>
                          <HStack spacing={4}>
                            <Skeleton h="36px" w="36px" rounded="full" />
                            <VStack align="start" flex={1} spacing={2}>
                              <Skeleton h="14px" w="30%" rounded="md" />
                              <Skeleton h="10px" w="50%" rounded="md" />
                            </VStack>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : users.length === 0 ? (
                    <Tr>
                      <Td colSpan={columns.length} textAlign="center" py={12}>
                        <VStack spacing={3}>
                          <Icon as={FiUsers} boxSize={10} color="gray.400" />
                          <Text fontWeight="600" color="gray.500">
                            Tidak ada data pengguna ditemukan
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            Coba ubah kata kunci pencarian atau sesuaikan filter status.
                          </Text>
                          {appliedSearch && (
                            <Button size="xs" variant="outline" onClick={handleClearSearch} rounded="lg">
                              Reset Filter Pencarian
                            </Button>
                          )}
                        </VStack>
                      </Td>
                    </Tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <Tr
                        key={row.id}
                        _hover={{ bg: hoverRowBg }}
                        transition="background-color 0.15s ease"
                        borderColor={borderColor}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <Td key={cell.id} py={3} borderColor={borderColor}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        ))}
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination Controls */}
            <Divider borderColor={borderColor} />
            <Flex
              px={5}
              py={3.5}
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={3}
              bg={tableHeaderBg}
            >
              <Text fontSize="xs" color="gray.500">
                Menampilkan{" "}
                <Text as="span" fontWeight="700" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                  {totalCount > 0 ? pageIndex * pageSize + 1 : 0}
                </Text>{" "}
                -{" "}
                <Text as="span" fontWeight="700" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                  {Math.min((pageIndex + 1) * pageSize, totalCount)}
                </Text>{" "}
                dari{" "}
                <Text as="span" fontWeight="700" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                  {totalCount}
                </Text>{" "}
                pengguna
              </Text>

              <HStack spacing={1.5}>
                <IconButton
                  aria-label="First page"
                  icon={<FiChevronsLeft />}
                  size="sm"
                  variant="outline"
                  rounded="lg"
                  isDisabled={pageIndex === 0 || isLoadingUsers}
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                />
                <IconButton
                  aria-label="Previous page"
                  icon={<FiChevronLeft />}
                  size="sm"
                  variant="outline"
                  rounded="lg"
                  isDisabled={pageIndex === 0 || isLoadingUsers}
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
                />
                <Text fontSize="xs" px={2} fontWeight="600">
                  {pageIndex + 1} / {totalPages > 0 ? totalPages : 1}
                </Text>
                <IconButton
                  aria-label="Next page"
                  icon={<FiChevronRight />}
                  size="sm"
                  variant="outline"
                  rounded="lg"
                  isDisabled={pageIndex >= totalPages - 1 || isLoadingUsers}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
                    }))
                  }
                />
                <IconButton
                  aria-label="Last page"
                  icon={<FiChevronsRight />}
                  size="sm"
                  variant="outline"
                  rounded="lg"
                  isDisabled={pageIndex >= totalPages - 1 || isLoadingUsers}
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, totalPages - 1) }))}
                />
              </HStack>
            </Flex>
          </Card>
        </Container>

      {/* ==================================================================== */}
      {/* 3. Detailed User Profile Modal (View Detail)                         */}
      {/* ==================================================================== */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" bg={cardBg} borderColor={borderColor} borderWidth="1px" overflow="hidden">
          <ModalHeader bg={modalHeaderBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={selectedUser?.nama || selectedUser?.userId || "User"}
                src={selectedUser?.profilePict || undefined}
                bg="blue.500"
                color="white"
                fontWeight="700"
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="sm">{selectedUser?.nama || "Detail Pengguna"}</Heading>
                  <Badge
                    colorScheme={(selectedUser?.userStatus || "").toUpperCase() === "ACTIVE" ? "green" : "gray"}
                    fontSize="3xs"
                    px={2}
                    rounded="full"
                  >
                    {selectedUser?.userStatus || "INACTIVE"}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  User ID: {selectedUser?.userId || "-"} | NRP: {selectedUser?.nrp || "-"} | NIP:{" "}
                  {selectedUser?.nip || "-"}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={5}>
            {selectedUser && (
              <VStack spacing={5} align="stretch">
                {/* 1. Organisasi & Tim */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Icon as={FiLayers} color="blue.500" />
                    <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                      Organisasi & Penugasan Tim
                    </Heading>
                  </HStack>
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={3.5} bg={pageBg}>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Nama Tim
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.team?.teamName || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode: {selectedUser.team?.teamCode || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Spesialisasi Role
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.teamRole?.specName || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kategori: {selectedUser.teamRole?.category || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Group Kerja
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.namaGroupKerja || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode: {selectedUser.kodeGroupKerja || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Hierarki Divisi
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.team?.organization?.division?.orgName || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Direktorat: {selectedUser.team?.organization?.directorate?.orgName || "-"}
                        </Text>
                      </Box>
                    </Grid>
                  </Card>
                </Box>

                {/* 2. Jabatan & Unit Kerja */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Icon as={FiBriefcase} color="teal.500" />
                    <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                      Jabatan & Unit Kerja
                    </Heading>
                  </HStack>
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={3.5} bg={pageBg}>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Jabatan
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.jabatan || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode Jabatan: {selectedUser.kodeJabatan || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Unit Kerja
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.namaUnitKerja || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode Unit: {selectedUser.kodeUnitKerja || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Cost Centre
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.costCentre || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Kewenangan Approval
                        </Text>
                        <Badge
                          colorScheme={selectedUser.isApproval === "Y" ? "green" : "gray"}
                          fontSize="3xs"
                          px={2}
                          rounded="md"
                        >
                          {selectedUser.isApproval === "Y" ? "Memiliki Hak Approval" : "Bukan Approver"}
                        </Badge>
                      </Box>
                    </Grid>
                  </Card>
                </Box>

                {/* 3. Kantor, Cabang & Penempatan */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Icon as={FiMapPin} color="orange.500" />
                    <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                      Kantor, Cabang & Wilayah
                    </Heading>
                  </HStack>
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={3.5} bg={pageBg}>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Kantor Cabang
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.namaCabang || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode Cabang: {selectedUser.kodeCabang || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Kantor Wilayah (Kanwil)
                        </Text>
                        <Text fontSize="xs" fontWeight="700">
                          {selectedUser.namaKanwil || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode Kanwil: {selectedUser.kodeKanwil || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Kantor Induk
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.namaInduk || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          Kode Induk: {selectedUser.kodeInduk || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Penempatan & Fungsi
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.namaPenempatan || selectedUser.namaFungsi || "-"}
                        </Text>
                        <Text fontSize="3xs" color="gray.400">
                          ID Fungsi: {selectedUser.idFungsi || "-"}
                        </Text>
                      </Box>
                    </Grid>
                  </Card>
                </Box>

                {/* 4. Kontak & Audit Metadata */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Icon as={FiShield} color="purple.500" />
                    <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                      Kontak & Sinkronisasi Sistem
                    </Heading>
                  </HStack>
                  <Card variant="outline" borderColor={borderColor} rounded="xl" p={3.5} bg={pageBg}>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Email Resmi
                        </Text>
                        <Text fontSize="xs" fontWeight="700" color="blue.500">
                          {selectedUser.email || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Nomor Telepon
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {selectedUser.phoneNumber || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          Sinkronisasi Terakhir (UIM)
                        </Text>
                        <Text fontSize="xs" fontWeight="600">
                          {formatDateTime(selectedUser.lastSync)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="2xs" color="gray.500">
                          ID Sistem
                        </Text>
                        <Text fontSize="3xs" color="gray.400" fontFamily="mono">
                          {selectedUser.id}
                        </Text>
                      </Box>
                    </Grid>
                  </Card>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg={modalHeaderBg} borderTop="1px" borderColor={borderColor} py={3}>
            <Button size="sm" variant="outline" onClick={onDetailClose} rounded="xl">
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ==================================================================== */}
      {/* 4. Modal Form Edit Pengguna & Cascading Penugasan Tim                */}
      {/* ==================================================================== */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" bg={cardBg} borderColor={borderColor} borderWidth="1px" overflow="hidden">
          <ModalHeader bg={modalHeaderBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={formNama || editingUser?.userId || "User"}
                src={editingUser?.profilePict || undefined}
                bg="orange.500"
                color="white"
                fontWeight="700"
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading size="sm">Sunting Profil Pengguna</Heading>
                  <Badge colorScheme="orange" fontSize="3xs" px={2} rounded="full">
                    ADMIN OVERRIDE
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  User ID: {editingUser?.userId || "-"} (Password dienkripsi & aman)
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={4}>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList mb={4} borderColor={borderColor} overflowX="auto" overflowY="hidden">
                <Tab fontSize="xs" fontWeight="600">
                  1. Identitas & Kontak
                </Tab>
                <Tab fontSize="xs" fontWeight="600">
                  2. Organisasi & Tim
                </Tab>
                <Tab fontSize="xs" fontWeight="600">
                  3. Jabatan & Unit Kerja
                </Tab>
                <Tab fontSize="xs" fontWeight="600">
                  4. Kantor & Lokasi
                </Tab>
              </TabList>

              <TabPanels>
                {/* TAB 1: IDENTITAS & KONTAK */}
                <TabPanel p={1}>
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Lengkap
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNama}
                          onChange={(e) => setFormNama(e.target.value)}
                          placeholder="Nama lengkap..."
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Email Resmi
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="email@perusahaan.co.id"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nomor NRP
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNrp}
                          onChange={(e) => setFormNrp(e.target.value)}
                          placeholder="NRP pegawai..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nomor NIP
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNip}
                          onChange={(e) => setFormNip(e.target.value)}
                          placeholder="NIP pegawai..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nomor Telepon
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Status Pengguna
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value)}
                          fontWeight="600"
                        >
                          <option value="ACTIVE">ACTIVE (Aktif)</option>
                          <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                        </Select>
                      </FormControl>
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* TAB 2: ORGANISASI & PENUGASAN TIM (CASCADING DIVISION -> GROUP -> TEAM -> ROLE) */}
                <TabPanel p={1}>
                  <VStack spacing={4} align="stretch">
                    <Box p={3} rounded="xl" bg={useColorModeValue("purple.50", "gray.800")} borderWidth="1px" borderColor={borderColor}>
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiLayers} color="purple.500" />
                        <Text fontSize="xs" fontWeight="700" color={useColorModeValue("purple.700", "purple.300")}>
                          Alur Hierarki Penugasan Tim
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color="gray.500">
                        Pilih Divisi $\rightarrow$ Group Kerja $\rightarrow$ Tim Pengembang $\rightarrow$ Spesialisasi Peran.
                        Field Group Kerja pada pengguna akan otomatis tersinkronisasi.
                      </Text>
                    </Box>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      {/* Step 1: Divisi */}
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          1. Divisi Induk
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formDivisionId}
                          onChange={(e) => handleDivisionChange(e.target.value)}
                          placeholder="-- Pilih Divisi --"
                        >
                          {divisions.map((div) => (
                            <option key={div.id} value={div.id}>
                              {div.orgName} ({div.orgCode})
                            </option>
                          ))}
                        </Select>
                        <FormHelperText fontSize="3xs" color="gray.400">
                          Level 1 hierarki organisasi TI
                        </FormHelperText>
                      </FormControl>

                      {/* Step 2: Group Kerja */}
                      <FormControl isDisabled={!formDivisionId}>
                        <FormLabel fontSize="xs" fontWeight="700">
                          2. Group Kerja
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formGroupId}
                          onChange={(e) => handleGroupChange(e.target.value)}
                          placeholder={
                            !formDivisionId
                              ? "-- Pilih Divisi terlebih dahulu --"
                              : availableGroups.length === 0
                              ? "-- Tidak ada group di divisi ini --"
                              : "-- Pilih Group Kerja --"
                          }
                        >
                          {availableGroups.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                              {grp.orgName} ({grp.orgCode})
                            </option>
                          ))}
                        </Select>
                        <FormHelperText fontSize="3xs" color="gray.400">
                          {formKodeGroupKerja ? `Kode Aktif: ${formKodeGroupKerja}` : "Level 2 hierarki"}
                        </FormHelperText>
                      </FormControl>

                      {/* Step 3: Tim Pengembang (UsrTeam) */}
                      <FormControl isDisabled={!formGroupId}>
                        <FormLabel fontSize="xs" fontWeight="700">
                          3. Tim Pengembang (Scrum/Dev Team)
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formTeamId}
                          onChange={(e) => handleTeamChange(e.target.value)}
                          placeholder={
                            !formGroupId
                              ? "-- Pilih Group terlebih dahulu --"
                              : availableTeams.length === 0
                              ? "-- Tidak ada tim di group ini --"
                              : "-- Pilih Tim Pengembang --"
                          }
                        >
                          <option value="">(Tanpa Tim / Kosongkan Penugasan)</option>
                          {availableTeams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.teamName} ({t.teamCode})
                            </option>
                          ))}
                        </Select>
                        <FormHelperText fontSize="3xs" color="gray.400">
                          Level 3: Penugasan tim operasional
                        </FormHelperText>
                      </FormControl>

                      {/* Step 4: Spesialisasi Role (MstSpecialization) */}
                      <FormControl isDisabled={!formTeamId}>
                        <FormLabel fontSize="xs" fontWeight="700">
                          4. Peran / Spesialisasi Tim
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formTeamRoleId}
                          onChange={(e) => setFormTeamRoleId(e.target.value)}
                          placeholder={!formTeamId ? "-- Pilih Tim terlebih dahulu --" : "-- Pilih Spesialisasi --"}
                        >
                          {specializations.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                              {spec.specName} ({spec.category})
                            </option>
                          ))}
                        </Select>
                        <FormHelperText fontSize="3xs" color="gray.400">
                          Peran teknis spesifik dalam tim
                        </FormHelperText>
                      </FormControl>
                    </Grid>

                    <Divider borderColor={borderColor} />

                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Group Kerja (Sinkronisasi)
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaGroupKerja}
                          onChange={(e) => setFormNamaGroupKerja(e.target.value)}
                          placeholder="Auto-sync saat memilih Group..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Group Kerja
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeGroupKerja}
                          onChange={(e) => setFormKodeGroupKerja(e.target.value)}
                          placeholder="Kode Group..."
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* TAB 3: JABATAN & UNIT KERJA */}
                <TabPanel p={1}>
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Jabatan Struktural
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formJabatan}
                          onChange={(e) => setFormJabatan(e.target.value)}
                          placeholder="Jabatan..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Jabatan
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeJabatan}
                          onChange={(e) => setFormKodeJabatan(e.target.value)}
                          placeholder="Kode Jabatan..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Unit Kerja
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaUnitKerja}
                          onChange={(e) => setFormNamaUnitKerja(e.target.value)}
                          placeholder="Nama Unit Kerja..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Unit Kerja
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeUnitKerja}
                          onChange={(e) => setFormKodeUnitKerja(e.target.value)}
                          placeholder="Kode Unit Kerja..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Cost Centre
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formCostCentre}
                          onChange={(e) => setFormCostCentre(e.target.value)}
                          placeholder="Cost centre..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kewenangan Approval (Approver)
                        </FormLabel>
                        <Select
                          size="sm"
                          rounded="lg"
                          value={formIsApproval}
                          onChange={(e) => setFormIsApproval(e.target.value)}
                        >
                          <option value="Y">Y - Memiliki Kewenangan Approval</option>
                          <option value="N">N - Bukan Approver</option>
                        </Select>
                      </FormControl>
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* TAB 4: KANTOR & PENEMPATAN */}
                <TabPanel p={1}>
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Cabang
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaCabang}
                          onChange={(e) => setFormNamaCabang(e.target.value)}
                          placeholder="Nama Kantor Cabang..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Cabang
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeCabang}
                          onChange={(e) => setFormKodeCabang(e.target.value)}
                          placeholder="Kode Cabang..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Kantor Wilayah (Kanwil)
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaKanwil}
                          onChange={(e) => setFormNamaKanwil(e.target.value)}
                          placeholder="Kanwil..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Kanwil
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeKanwil}
                          onChange={(e) => setFormKodeKanwil(e.target.value)}
                          placeholder="Kode Kanwil..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Kantor Induk
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaInduk}
                          onChange={(e) => setFormNamaInduk(e.target.value)}
                          placeholder="Kantor Induk..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Kode Induk
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formKodeInduk}
                          onChange={(e) => setFormKodeInduk(e.target.value)}
                          placeholder="Kode Induk..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Penempatan
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaPenempatan}
                          onChange={(e) => setFormNamaPenempatan(e.target.value)}
                          placeholder="Penempatan..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700">
                          Nama Fungsi / ID Fungsi
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={formNamaFungsi}
                          onChange={(e) => setFormNamaFungsi(e.target.value)}
                          placeholder="Fungsi..."
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter bg={modalHeaderBg} borderTop="1px" borderColor={borderColor} py={3}>
            <HStack spacing={3}>
              <Button size="sm" variant="outline" onClick={onEditClose} rounded="xl" isDisabled={isSubmitting}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiSave />}
                onClick={handleSaveUser}
                isLoading={isSubmitting}
                loadingText="Menyimpan..."
                rounded="xl"
                shadow="sm"
              >
                Simpan Perubahan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ==================================================================== */}
      {/* 5. Ubah Status Pengguna Modal (ACTIVE / INACTIVE)                    */}
      {/* ==================================================================== */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" bg={cardBg} borderColor={borderColor} borderWidth="1px" overflow="hidden">
          <ModalHeader bg={modalHeaderBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <HStack spacing={2.5}>
              <Flex w={8} h={8} rounded="lg" bg="purple.500" color="white" align="center" justify="center">
                <Icon as={FiPower} boxSize={4} />
              </Flex>
              <Box>
                <Heading size="xs">Ubah Status Pengguna</Heading>
                <Text fontSize="2xs" color="gray.500">
                  Perbarui status operasional akun (ACTIVE / INACTIVE)
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            {statusTargetUser && (
              <VStack align="stretch" spacing={4}>
                <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} border="1px" borderColor={borderColor}>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={statusTargetUser.nama} src={statusTargetUser.profilePict || undefined} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700">
                        {statusTargetUser.nama}
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        ID: {statusTargetUser.userId} • NRP: {statusTargetUser.nrp || "-"}
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Pilih Status Baru
                  </FormLabel>
                  <RadioGroup value={selectedNewStatus} onChange={(val) => setSelectedNewStatus(val)}>
                    <Stack direction="row" spacing={5}>
                      <Radio value="ACTIVE" colorScheme="green">
                        <HStack spacing={1.5}>
                          <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                            ACTIVE
                          </Badge>
                          <Text fontSize="xs">Pengguna Aktif</Text>
                        </HStack>
                      </Radio>
                      <Radio value="INACTIVE" colorScheme="gray">
                        <HStack spacing={1.5}>
                          <Badge colorScheme="gray" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                            INACTIVE
                          </Badge>
                          <Text fontSize="xs">Nonaktifkan</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Box p={3} rounded="xl" bg={selectedNewStatus === "INACTIVE" ? "orange.50" : "green.50"} border="1px" borderColor={selectedNewStatus === "INACTIVE" ? "orange.200" : "green.200"}>
                  <HStack spacing={2} align="start">
                    <Icon as={FiAlertTriangle} color={selectedNewStatus === "INACTIVE" ? "orange.500" : "green.500"} boxSize={4} mt={0.5} />
                    <Text fontSize="2xs" color={selectedNewStatus === "INACTIVE" ? "orange.700" : "green.700"} fontWeight="500">
                      {selectedNewStatus === "INACTIVE"
                        ? "Pengguna dengan status INACTIVE tidak dapat login ke aplikasi hingga status diubah kembali menjadi ACTIVE."
                        : "Pengguna dengan status ACTIVE memiliki hak login normal ke dalam sistem."}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg={modalHeaderBg} borderTop="1px" borderColor={borderColor} py={3}>
            <HStack spacing={3}>
              <Button size="sm" variant="outline" onClick={onStatusClose} rounded="xl" isDisabled={isSubmittingStatus}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<FiSave />}
                onClick={handleSaveChangeStatus}
                isLoading={isSubmittingStatus}
                loadingText="Menyimpan..."
                rounded="xl"
              >
                Simpan Status
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ==================================================================== */}
      {/* 6. Permanent Suspend & Contain Alert Dialog                          */}
      {/* ==================================================================== */}
      <AlertDialog
        isOpen={isContainAlertOpen}
        leastDestructiveRef={containCancelRef}
        onClose={onContainAlertClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(6px)">
          <AlertDialogContent rounded="2xl" bg={cardBg} borderColor="red.400" borderWidth="2px" shadow="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold" color="red.500">
              <HStack spacing={2.5}>
                <Flex w={8} h={8} rounded="lg" bg="red.500" color="white" align="center" justify="center">
                  <Icon as={FiAlertTriangle} boxSize={4} />
                </Flex>
                <Text>Konfirmasi Permanent Suspend &amp; Containment</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="xs">
              {containTargetUser && (
                <VStack align="stretch" spacing={3}>
                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "red.50" : "red.950"} border="1px" borderColor="red.300">
                    <Text fontWeight="700" color="red.600" mb={1}>
                      PERHATIAN TINDAKAN KEAMANAN TINGKAT TINGGI!
                    </Text>
                    <Text color={colorMode === "light" ? "gray.700" : "gray.200"} fontSize="2xs">
                      Tindakan ini akan mengisolasi/mengkarantina akun pengguna secara permanen:
                    </Text>
                    <VStack align="start" spacing={1} mt={2} pl={2} fontSize="2xs" color="red.600" fontWeight="600">
                      <Text>• Field MAIN_PWD akan diubah menjadi &quot;CONTAINED&quot; (Password asli hangus/dinetralkan)</Text>
                      <Text>• Status Akun akan diubah menjadi &quot;INACTIVE&quot;</Text>
                      <Text>• Pengguna tidak akan dapat melakukan otentikasi login dengan metode apapun</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} border="1px" borderColor={borderColor}>
                    <Text fontWeight="700" fontSize="xs">
                      Target Pengguna:
                    </Text>
                    <Text fontSize="xs" color="blue.500" fontWeight="600">
                      {containTargetUser.nama} ({containTargetUser.userId})
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      NRP: {containTargetUser.nrp || "-"} • Email: {containTargetUser.email}
                    </Text>
                  </Box>

                  <FormControl>
                    <FormLabel fontSize="2xs" fontWeight="700" textTransform="uppercase" color="gray.500">
                      Alasan Containment (Opsional)
                    </FormLabel>
                    <Textarea
                      size="sm"
                      rounded="xl"
                      value={containReason}
                      onChange={(e) => setContainReason(e.target.value)}
                      placeholder="Contoh: Terindikasi pelanggaran keamanan / investigasi insiden..."
                      rows={2}
                    />
                  </FormControl>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={containCancelRef} onClick={onContainAlertClose} size="sm" rounded="xl" isDisabled={isSubmittingContain}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={handleExecuteContain}
                ml={3}
                size="sm"
                rounded="xl"
                leftIcon={<FiSlash />}
                isLoading={isSubmittingContain}
                loadingText="Mengeksekusi..."
                shadow="sm"
              >
                Eksekusi Suspend &amp; Contain
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ==================================================================== */}
      {/* 7. Restore Contained Account Dialog                                 */}
      {/* ==================================================================== */}
      <AlertDialog
        isOpen={isRestoreModalOpen}
        leastDestructiveRef={restoreCancelRef}
        onClose={onRestoreModalClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(6px)">
          <AlertDialogContent rounded="2xl" bg={cardBg} borderColor="teal.400" borderWidth="2px" shadow="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold" color="teal.500">
              <HStack spacing={2.5}>
                <Flex w={8} h={8} rounded="lg" bg="teal.500" color="white" align="center" justify="center">
                  <Icon as={FiRotateCcw} boxSize={4} />
                </Flex>
                <Text>Pulihkan Akun Terkarantina (Restore)</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="xs">
              {restoreTargetUser && (
                <VStack align="stretch" spacing={3}>
                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "teal.50" : "teal.950"} border="1px" borderColor="teal.300">
                    <Text fontWeight="700" color="teal.700" mb={1}>
                      PEMULIHAN AKUN DARI STATUS CONTAINED
                    </Text>
                    <Text color={colorMode === "light" ? "gray.700" : "gray.200"} fontSize="2xs">
                      Proses pemulihan ini akan melakukan normalisasi akun:
                    </Text>
                    <VStack align="start" spacing={1} mt={2} pl={2} fontSize="2xs" color="teal.700" fontWeight="600">
                      <Text>• Field MAIN_PWD akan di-reset ke Default Password aplikasi (DEFAULT_PWD_SETTINGS)</Text>
                      <Text>• Status Pengguna akan diubah kembali menjadi &quot;ACTIVE&quot;</Text>
                      <Text>• Pengguna dapat login kembali menggunakan password default</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} border="1px" borderColor={borderColor}>
                    <Text fontWeight="700" fontSize="xs">
                      Pengguna yang Dipulihkan:
                    </Text>
                    <Text fontSize="xs" color="blue.500" fontWeight="600">
                      {restoreTargetUser.nama} ({restoreTargetUser.userId})
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      NRP: {restoreTargetUser.nrp || "-"} • Email: {restoreTargetUser.email}
                    </Text>
                  </Box>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={restoreCancelRef} onClick={onRestoreModalClose} size="sm" rounded="xl" isDisabled={isSubmittingRestore}>
                Batal
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleExecuteRestore}
                ml={3}
                size="sm"
                rounded="xl"
                leftIcon={<FiCheckCircle />}
                isLoading={isSubmittingRestore}
                loadingText="Memulihkan..."
                shadow="sm"
              >
                Pulihkan Akun Sekarang
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ==================================================================== */}
      {/* 8. Soft Delete User Alert Dialog                                     */}
      {/* ==================================================================== */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={onDeleteAlertClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(6px)">
          <AlertDialogContent rounded="2xl" bg={cardBg} borderColor="red.500" borderWidth="2px" shadow="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold" color="red.500">
              <HStack spacing={2.5}>
                <Flex w={8} h={8} rounded="lg" bg="red.500" color="white" align="center" justify="center">
                  <Icon as={FiTrash2} boxSize={4} />
                </Flex>
                <Text>Konfirmasi Hapus Pengguna (Soft Delete)</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="xs">
              {deleteTargetUser && (
                <VStack align="stretch" spacing={3}>
                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "red.50" : "red.950"} border="1px" borderColor="red.300">
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiAlertTriangle} color="red.500" boxSize={4} />
                      <Text fontWeight="700" color="red.600">
                        PERINGATAN TINDAKAN PENGHAPUSAN (SOFT DELETE)
                      </Text>
                    </HStack>
                    <Text color={colorMode === "light" ? "gray.700" : "gray.200"} fontSize="2xs">
                      Tindakan ini akan menonaktifkan dan menyembunyikan akun pengguna dari sistem operasional:
                    </Text>
                    <VStack align="start" spacing={1} mt={2} pl={2} fontSize="2xs" color="red.600" fontWeight="600">
                      <Text>• Field DeletedAt akan diisi timestamp penghapusan ({new Date().toLocaleDateString("id-ID")})</Text>
                      <Text>• Status pengguna akan diubah menjadi &quot;DELETED&quot;</Text>
                      <Text>• Pengguna tidak akan tampil pada daftar aktif, pencarian, maupun dropdown penugasan tim</Text>
                      <Text>• Tindakan ini tercatat secara permanen di audit trail log keamanan (LogActivityUser)</Text>
                    </VStack>
                  </Box>

                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} border="1px" borderColor={borderColor}>
                    <Text fontWeight="700" fontSize="xs">
                      Target Pengguna yang Akan Dihapus:
                    </Text>
                    <Text fontSize="xs" color="red.500" fontWeight="600" mt={0.5}>
                      {deleteTargetUser.nama} ({deleteTargetUser.userId})
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      NRP: {deleteTargetUser.nrp || "-"} • Email: {deleteTargetUser.email}
                    </Text>
                    {deleteTargetUser.namaUnitKerja && (
                      <Text fontSize="2xs" color="gray.500">
                        Unit Kerja: {deleteTargetUser.namaUnitKerja}
                      </Text>
                    )}
                  </Box>

                  <FormControl>
                    <FormLabel fontSize="2xs" fontWeight="700" color="gray.600">
                      Alasan Penghapusan (Audit Trail)
                    </FormLabel>
                    <Textarea
                      size="sm"
                      rounded="xl"
                      fontSize="xs"
                      rows={2}
                      placeholder="Contoh: Pegawai telah mutasi keluar / pensiun / restrukturisasi tim..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                    <FormHelperText fontSize="2xs">
                      Alasan ini akan disimpan di riwayat log aktivitas administrator.
                    </FormHelperText>
                  </FormControl>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={onDeleteAlertClose} size="sm" rounded="xl" isDisabled={isSubmittingDelete}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={handleExecuteDelete}
                ml={3}
                size="sm"
                rounded="xl"
                leftIcon={<FiTrash2 />}
                isLoading={isSubmittingDelete}
                loadingText="Menghapus..."
                shadow="sm"
              >
                Ya, Hapus Pengguna
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ==================================================================== */}
      {/* 9. Cascade Rename USER_ID Two-Step Modal                             */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isCascadeModalOpen}
        onClose={onCascadeModalClose}
        size={cascadeStep === 2 ? "4xl" : "2xl"}
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
        <ModalContent
          rounded="2xl"
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          overflow="hidden"
          shadow="2xl"
        >
          <ModalHeader bg={modalHeaderBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <Flex justify="space-between" align="center" pr={8}>
              <HStack spacing={3}>
                <Flex
                  w={10}
                  h={10}
                  rounded="xl"
                  bg="cyan.500"
                  color="white"
                  align="center"
                  justify="center"
                  shadow="md"
                >
                  <Icon as={FiShare2} boxSize={5} />
                </Flex>
                <Box>
                  <HStack spacing={2}>
                    <Heading size="sm" fontWeight="700">
                      Migrasi & Cascade Rename USER_ID
                    </Heading>
                    <Badge colorScheme="cyan" variant="solid" fontSize="3xs" rounded="full" px={2}>
                      ATOMIC TRANSACTION
                    </Badge>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500" mt={0.5}>
                    Perubahan Business Key USER_ID secara atomik pada seluruh relasi tabel database enterprise
                  </Text>
                </Box>
              </HStack>
              <Badge
                colorScheme={cascadeStep === 1 ? "blue" : "purple"}
                variant="subtle"
                fontSize="xs"
                px={3}
                py={1}
                rounded="full"
                fontWeight="700"
              >
                {cascadeStep === 1 ? "Langkah 1: Konfigurasi" : "Langkah 2: Dampak & Eksekusi"}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={5}>
            {cascadeTargetUser && (
              <VStack align="stretch" spacing={4}>
                {/* User Identity Banner */}
                <Box
                  p={3.5}
                  rounded="xl"
                  bg={colorMode === "light" ? "gray.50" : "gray.800"}
                  border="1px"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={cascadeTargetUser.nama}
                        src={cascadeTargetUser.profilePict || undefined}
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="700">
                          {cascadeTargetUser.nama}
                        </Text>
                        <HStack spacing={2} fontSize="2xs" color="gray.500">
                          <Text>USER_ID Saat Ini:</Text>
                          <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md" fontWeight="700">
                            {cascadeTargetUser.userId}
                          </Badge>
                          <Text>• NRP: {cascadeTargetUser.nrp || "-"}</Text>
                          <Text>• Email: {cascadeTargetUser.email}</Text>
                        </HStack>
                      </Box>
                    </HStack>
                    <Badge colorScheme={cascadeTargetUser.userStatus === "ACTIVE" ? "green" : "gray"} variant="subtle" rounded="full">
                      {cascadeTargetUser.userStatus}
                    </Badge>
                  </Flex>
                </Box>

                {/* STEP 1: CONFIGURATION */}
                {cascadeStep === 1 && (
                  <VStack align="stretch" spacing={4}>
                    <Box
                      p={3.5}
                      rounded="xl"
                      bg={colorMode === "light" ? "blue.50" : "blue.950"}
                      border="1px"
                      borderColor="blue.300"
                    >
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiShield} color="blue.500" boxSize={4} />
                        <Text fontWeight="700" color="blue.700" fontSize="xs">
                          PANDUAN MIGRASI BUSINESS KEY
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                        Fitur ini mengupdate string <strong>USER_ID</strong> ke seluruh relasi database Oracle (penugasan proyek PRJ, PIC aplikasi, approval flow REQ, antrean export SYS, log aktivitas, dan laporan RPT). System GUID (ID) pengguna dipertahankan tetap sama untuk integritas referensial.
                      </Text>
                    </Box>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="700">
                        USER_ID Baru
                      </FormLabel>
                      <Input
                        size="md"
                        rounded="xl"
                        placeholder="Contoh: M291 / USR_NEW_CODE"
                        value={newUserIdInput}
                        onChange={(e) => setNewUserIdInput(e.target.value.toUpperCase())}
                        autoFocus
                      />
                      <FormHelperText fontSize="2xs">
                        ID baru harus unik dan belum pernah digunakan oleh pengguna lain di sistem.
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700">
                        Alasan Migrasi / Catatan Perubahan
                      </FormLabel>
                      <Textarea
                        size="sm"
                        rounded="xl"
                        placeholder="Contoh: Penyesuaian standar NIK/NRP organisasi, pengalihan kode user legacy..."
                        rows={2}
                        value={cascadeReasonInput}
                        onChange={(e) => setCascadeReasonInput(e.target.value)}
                      />
                    </FormControl>

                    <Box
                      p={3.5}
                      rounded="xl"
                      bg={colorMode === "light" ? "gray.50" : "gray.800"}
                      border="1px"
                      borderColor={borderColor}
                    >
                      <Checkbox
                        isChecked={cascadeAuditFields}
                        onChange={(e) => setCascadeAuditFields(e.target.checked)}
                        colorScheme="cyan"
                        size="sm"
                      >
                        <Text fontSize="xs" fontWeight="600">
                          Sertakan Kolom Audit Trail (CREATED_BY, UPDATED_BY)
                        </Text>
                      </Checkbox>
                      <Text fontSize="2xs" color="gray.500" mt={1} pl={6}>
                        Jika dicentang, rekam jejak pembuat dan pengubah data di seluruh tabel operasional juga akan disesuaikan ke USER_ID baru secara seragam.
                      </Text>
                    </Box>
                  </VStack>
                )}

                {/* STEP 2: DRY RUN & IMPACT BREAKDOWN */}
                {cascadeStep === 2 && previewData && (
                  <VStack align="stretch" spacing={4}>
                    {/* Metrics Summary */}
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
                      <Card p={3} rounded="xl" bg={colorMode === "light" ? "cyan.50" : "cyan.950"} border="1px" borderColor="cyan.200">
                        <Stat>
                          <StatLabel fontSize="2xs" color="cyan.700" fontWeight="600">
                            TOTAL TABEL TERDAMPAK
                          </StatLabel>
                          <StatNumber fontSize="xl" fontWeight="800" color="cyan.700">
                            {previewData.totalAffectedTables} <Text as="span" fontSize="xs" fontWeight="normal">Tabel</Text>
                          </StatNumber>
                        </Stat>
                      </Card>
                      <Card p={3} rounded="xl" bg={colorMode === "light" ? "purple.50" : "purple.950"} border="1px" borderColor="purple.200">
                        <Stat>
                          <StatLabel fontSize="2xs" color="purple.700" fontWeight="600">
                            TOTAL BARIS DATA BERUBAH
                          </StatLabel>
                          <StatNumber fontSize="xl" fontWeight="800" color="purple.700">
                            {previewData.totalAffectedRows} <Text as="span" fontSize="xs" fontWeight="normal">Baris</Text>
                          </StatNumber>
                        </Stat>
                      </Card>
                      <Card p={3} rounded="xl" bg={colorMode === "light" ? "green.50" : "green.950"} border="1px" borderColor="green.200">
                        <Stat>
                          <StatLabel fontSize="2xs" color="green.700" fontWeight="600">
                            INTEGRITAS TRANSAKSI
                          </StatLabel>
                          <StatNumber fontSize="sm" fontWeight="800" color="green.700" mt={1}>
                            ACID Transactional
                          </StatNumber>
                          <Text fontSize="3xs" color="green.600">Atomic Commit / Safe Rollback</Text>
                        </Stat>
                      </Card>
                    </Grid>

                    {/* Breakdown Table */}
                    <Box>
                      <Text fontSize="xs" fontWeight="700" mb={2}>
                        Rincian Baris Terdampak Berdasarkan Tabel Database:
                      </Text>
                      <Box
                        maxH="280px"
                        overflowY="auto"
                        border="1px"
                        borderColor={borderColor}
                        rounded="xl"
                      >
                        <Table size="sm" variant="simple">
                          <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
                            <Tr>
                              <Th fontSize="3xs">TABEL</Th>
                              <Th fontSize="3xs">KOLOM</Th>
                              <Th fontSize="3xs" isNumeric>JUMLAH BARIS</Th>
                              <Th fontSize="3xs">KATEGORI DOMAIN</Th>
                              <Th fontSize="3xs">PERAN ARSITEKTUR</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {previewData.tableBreakdown.map((item, idx) => (
                              <Tr key={idx} _hover={{ bg: hoverRowBg }}>
                                <Td fontSize="2xs" fontWeight="700" color="blue.500">
                                  {item.tableName}
                                </Td>
                                <Td fontSize="2xs" fontFamily="mono">
                                  {item.columnName}
                                </Td>
                                <Td fontSize="2xs" fontWeight="700" isNumeric color="purple.600">
                                  {item.affectedRows}
                                </Td>
                                <Td fontSize="3xs">
                                  <Badge
                                    colorScheme={
                                      item.domainCategory.startsWith("PRJ") ? "teal" :
                                      item.domainCategory.startsWith("REQ") ? "blue" :
                                      item.domainCategory.startsWith("RPT") ? "purple" :
                                      item.domainCategory.startsWith("SYS") ? "orange" : "gray"
                                    }
                                    variant="subtle"
                                    fontSize="3xs"
                                    rounded="md"
                                  >
                                    {item.domainCategory}
                                  </Badge>
                                </Td>
                                <Td fontSize="3xs" color="gray.500">
                                  {item.roleDescription}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>

                    {/* Warning Callout */}
                    <Box
                      p={3.5}
                      rounded="xl"
                      bg={colorMode === "light" ? "orange.50" : "orange.950"}
                      border="1px"
                      borderColor="orange.300"
                    >
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} />
                        <Text fontWeight="700" color="orange.700" fontSize="xs">
                          KONFIRMASI EKSEKUSI PERUBAHAN DATA
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                        Operasi ini akan mengubah data <strong>{previewData.oldUserId}</strong> menjadi <strong>{previewData.newUserId}</strong> pada {previewData.totalAffectedTables} tabel di atas secara serentak. Jika terdapat anomali atau kegagalan saat eksekusi, seluruh perubahan akan di-rollback secara otomatis tanpa meninggalkan data parsial.
                      </Text>
                    </Box>

                    {/* Agreement Checkbox */}
                    <Box
                      p={3}
                      rounded="xl"
                      bg={colorMode === "light" ? "gray.50" : "gray.800"}
                      border="1px"
                      borderColor={borderColor}
                    >
                      <Checkbox
                        isChecked={isConfirmedAgreement}
                        onChange={(e) => setIsConfirmedAgreement(e.target.checked)}
                        colorScheme="cyan"
                        size="sm"
                      >
                        <Text fontSize="xs" fontWeight="700" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                          Saya telah memeriksa seluruh rincian dampak di atas dan menyetujui eksekusi migrasi USER_ID ini.
                        </Text>
                      </Checkbox>
                    </Box>
                  </VStack>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg={modalHeaderBg} borderTop="1px" borderColor={borderColor} py={3}>
            {cascadeStep === 1 ? (
              <HStack spacing={3}>
                <Button onClick={onCascadeModalClose} size="sm" rounded="xl" variant="ghost">
                  Batal
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleRunCascadePreview}
                  size="sm"
                  rounded="xl"
                  leftIcon={<FiSearch />}
                  isLoading={isLoadingPreview}
                  loadingText="Menganalisis Relasi Data..."
                  shadow="sm"
                >
                  Cek Dampak Perubahan (Dry Run)
                </Button>
              </HStack>
            ) : (
              <HStack spacing={3} w="full" justify="space-between">
                <Button
                  onClick={() => setCascadeStep(1)}
                  size="sm"
                  rounded="xl"
                  variant="outline"
                  leftIcon={<FiArrowLeft />}
                  isDisabled={isExecutingCascade}
                >
                  Kembali ke Konfigurasi
                </Button>
                <HStack spacing={2}>
                  <Button
                    onClick={onCascadeModalClose}
                    size="sm"
                    rounded="xl"
                    variant="ghost"
                    isDisabled={isExecutingCascade}
                  >
                    Batal
                  </Button>
                  <Button
                    colorScheme="cyan"
                    onClick={handleExecuteCascadeRename}
                    size="sm"
                    rounded="xl"
                    leftIcon={<FiCheckCircle />}
                    isLoading={isExecutingCascade}
                    loadingText="Mengeksekusi Migrasi..."
                    isDisabled={!isConfirmedAgreement}
                    shadow="sm"
                  >
                    Eksekusi Migrasi USER_ID Sekarang
                  </Button>
                </HStack>
              </HStack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
