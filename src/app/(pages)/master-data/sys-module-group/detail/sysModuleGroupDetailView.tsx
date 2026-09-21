"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSysModuleGroup, {
  SysModuleGroupResponse,
  SysModuleGroupUpdatePayload,
  ModuleMenuAssignPayload,
  SysModuleStatusFlowResponse,
  SysModuleStatusFlowInsertPayload,
  SysModuleStatusFlowUpdatePayload,
  SysModuleStatusUserApproverResponse,
  SysModuleFeatureResponse,
  SysModuleFeatureWhitelistResponse,
  SysModuleFeatureInsertPayload,
  SysModuleFeatureUpdatePayload,
  SysModuleFeatureWhitelistInsertPayload,
} from "@/app/services/useSysModuleGroup";
import useMenus, { MenuResponse } from "@/app/services/useMenus";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
  MAX_SIZE_TABLE,
  WORKER_QUEUE_PASSKEY,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  TabButtonCustomStyle,
  TabButtonCustomStyleHighLight,
} from "@/app/components/TabsCustom";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Text,
  VStack,
  useColorMode,
  Badge,
  Button,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Flex,
  SimpleGrid,
  Avatar,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Tooltip,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import {
  FiEdit,
  FiSave,
  FiX,
  FiInfo,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiGitBranch,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiCornerDownRight,
  FiShield,
  FiCheck,
  FiFolder,
  FiFileText,
  FiRefreshCw,
  FiCode,
  FiArrowRight,
  FiCopy,
  FiCheckSquare,
  FiSquare,
  FiKey,
  FiUnlock,
  FiLock,
  FiTerminal,
  FiSliders,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from "react-icons/fi";
import { PaggingListPayload } from "@/app/types/masterTypes";

interface ModuleGroupFormValues {
  modCode: string;
  modName: string;
  modDescriptions: string;
  isActive: string;
}

function SysModuleGroupDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("id");

  const {
    GetDetailById,
    Update,
    GetAssignedMenus,
    AssignMenus,
    GetStatusFlows,
    InsertStatusFlow,
    UpdateStatusFlow,
    DeleteStatusFlow,
    GetUserApprovers,
    AddUserApprover,
    RemoveUserApprover,
    GetFeatures,
    InsertFeature,
    UpdateFeature,
    DeleteFeature,
    AddFeatureWhitelist,
    RemoveFeatureWhitelist,
  } = useSysModuleGroup();
  const { List: GetMenuList } = useMenus();
  const { List: GetUserList } = useUsers();
  const { List: GetOrganizationList } = useOrganization();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ModuleGroupData, setModuleGroupData] = useState<SysModuleGroupResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Menu tab state
  const [menuList, setMenuList] = useState<MenuResponse[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isSavingMenus, setIsSavingMenus] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  // Status flow tab state
  const [statusFlows, setStatusFlows] = useState<SysModuleStatusFlowResponse[]>([]);
  const [isStatusFlowModalOpen, setIsStatusFlowModalOpen] = useState(false);
  const [editingStatusFlow, setEditingStatusFlow] = useState<SysModuleStatusFlowResponse | null>(null);
  const [statusFlowForm, setStatusFlowForm] = useState({
    codeStatus: "",
    nameStatus: "",
    descriptions: "",
    previousCodeStatus: "",
    nextCodeStatus: "",
    isFinish: "N",
    isConfirmApproval: "N",
    isDisplayOnChoice: "N",
  });
  const [isSavingStatusFlow, setIsSavingStatusFlow] = useState(false);
  const [userApprovers, setUserApprovers] = useState<SysModuleStatusUserApproverResponse[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UsersResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Feature & Whitelist tab state
  const [features, setFeatures] = useState<SysModuleFeatureResponse[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<SysModuleFeatureResponse | null>(null);
  const [featureForm, setFeatureForm] = useState({
    featureCode: "",
    featureName: "",
    pageUrl: "",
    featureCategory: "DATA_ACCESS",
    descriptions: "",
    isActive: "Y",
  });
  const [isSavingFeature, setIsSavingFeature] = useState(false);

  // Whitelist management state
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [targetFeatureForWhitelist, setTargetFeatureForWhitelist] = useState<SysModuleFeatureResponse | null>(null);
  const [whitelistForm, setWhitelistForm] = useState<{
    principalType: "ORG_GROUP" | "USER";
    orgGroupId: string;
    userSysId: string;
    accessLevel: string;
    remarks: string;
  }>({
    principalType: "ORG_GROUP",
    orgGroupId: "",
    userSysId: "",
    accessLevel: "ALLOW",
    remarks: "",
  });
  const [isSavingWhitelist, setIsSavingWhitelist] = useState(false);
  const [organizationsList, setOrganizationsList] = useState<OrganizationResponse[]>([]);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [wlUserSearchQuery, setWlUserSearchQuery] = useState("");
  const [wlUserSearchResults, setWlUserSearchResults] = useState<UsersResponse[]>([]);
  const [isSearchingWlUsers, setIsSearchingWlUsers] = useState(false);
  const [expandedFeatureAccordions, setExpandedFeatureAccordions] = useState<Set<string>>(new Set());

  // ─── Developer Mode State & Auth PIN ─────────────────────────────────────
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // ─── Universal Action PIN Confirmation Modal State ───────────────────────
  const [actionPinModalOpen, setActionPinModalOpen] = useState<boolean>(false);
  const [actionPinTitle, setActionPinTitle] = useState<string>("");
  const [actionPinDescription, setActionPinDescription] = useState<string>("");
  const [actionPinBtnText, setActionPinBtnText] = useState<string>("Konfirmasi");
  const [actionPinColorScheme, setActionPinColorScheme] = useState<string>("blue");
  const [actionPinInput, setActionPinInput] = useState<string>("");
  const [showActionPin, setShowActionPin] = useState<boolean>(false);
  const [actionPinError, setActionPinError] = useState<string | null>(null);
  const [actionPinLoading, setActionPinLoading] = useState<boolean>(false);
  const [pendingActionFn, setPendingActionFn] = useState<(() => Promise<void> | void) | null>(null);

  // ─── Embedded PIN Inputs in Dedicated Form Modals ────────────────────────
  const [statusFlowPinInput, setStatusFlowPinInput] = useState<string>("");
  const [showStatusFlowPin, setShowStatusFlowPin] = useState<boolean>(false);
  const [statusFlowPinError, setStatusFlowPinError] = useState<string | null>(null);

  const [featurePinInput, setFeaturePinInput] = useState<string>("");
  const [showFeaturePin, setShowFeaturePin] = useState<boolean>(false);
  const [featurePinError, setFeaturePinError] = useState<string | null>(null);

  const [whitelistPinInput, setWhitelistPinInput] = useState<string>("");
  const [showWhitelistPin, setShowWhitelistPin] = useState<boolean>(false);
  const [whitelistPinError, setWhitelistPinError] = useState<string | null>(null);

  const [HeaderDataContent] = useState<HeaderContentProps>({
    titleName: "Module Group Configuration",
    breadCrumb: ["Home", "Master Data", "System Module Group", "Console Detail"],
  });

  const ValidationSchema = Yup.object().shape({
    modName: Yup.string()
      .required("Name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    modDescriptions: Yup.string().max(500, "Maximum 500 characters"),
  });

  const formik = useFormik<ModuleGroupFormValues>({
    initialValues: {
      modCode: "",
      modName: "",
      modDescriptions: "",
      isActive: "Y",
    },
    validationSchema: ValidationSchema,
    onSubmit: async (values) => {
      triggerActionWithPin(
        "Konfirmasi Simpan Modul",
        `Simpan perubahan spesifikasi modul "${values.modName}" (${values.modCode}) ke database.`,
        "Simpan Modul",
        "blue",
        () => handleUpdate(values)
      );
    },
  });

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

  useEffect(() => {
    if (DataAuth && tokenData && moduleId) {
      fetchModuleGroupData();
      fetchMenuList();
      fetchAssignedMenus();
      fetchStatusFlows();
      fetchFeatures();
      fetchOrganizations();
    }
  }, [DataAuth, tokenData, moduleId]);

  const fetchModuleGroupData = async () => {
    if (!moduleId) return;

    setIsLoadingProcess(true);
    try {
      const response = await GetDetailById(moduleId, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setModuleGroupData(response.data);
        formik.setValues({
          modCode: response.data.modCode,
          modName: response.data.modName,
          modDescriptions: response.data.modDescriptions || "",
          isActive: response.data.isActive,
        });
      } else {
        showToast({
          description: response?.message || "Failed to load module group data",
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error loading module group data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const fetchMenuList = async () => {
    try {
      const PayloadList: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [],
        fieldOrder: ["menuName"],
        orderDir: "asc",
      };

      const response = await GetMenuList(PayloadList, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setMenuList(response.data);
        // Expand all top parents by default
        const topIds = response.data.filter((m) => !m.parentId).map((m) => m.id);
        setExpandedMenus(new Set(topIds));
      }
    } catch (error) {
      console.error("Error loading menu list:", error);
    }
  };

  const fetchAssignedMenus = async () => {
    if (!moduleId) return;

    try {
      const response = await GetAssignedMenus(moduleId, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setSelectedMenus(new Set(response.data));
      }
    } catch (error) {
      console.error("Error loading assigned menus:", error);
    }
  };

  const handleUpdate = async (values: ModuleGroupFormValues) => {
    if (!moduleId) return;

    setIsUpdating(true);
    try {
      const payload: SysModuleGroupUpdatePayload = {
        id: moduleId,
        modCode: values.modCode,
        modName: values.modName,
        modDescriptions: values.modDescriptions || null,
        isActive: values.isActive,
      };

      const response = await Update(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Module group updated successfully",
          statusToast: "success",
        });
        setIsEditMode(false);
        fetchModuleGroupData();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error updating module group",
        statusToast: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveMenus = async () => {
    if (!moduleId) return;

    setIsSavingMenus(true);
    try {
      const payload: ModuleMenuAssignPayload = {
        moduleId: moduleId,
        menuIds: Array.from(selectedMenus),
      };

      const response = await AssignMenus(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Menu access configuration saved successfully",
          statusToast: "success",
        });
        fetchAssignedMenus();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error assigning menus",
        statusToast: "error",
      });
    } finally {
      setIsSavingMenus(false);
    }
  };

  const toggleMenu = (menuId: string, checked: boolean) => {
    setSelectedMenus((prev) => {
      const newSet = new Set(prev);
      const menu = menuList.find((m) => m.id === menuId);
      if (!menu) return newSet;

      if (checked) {
        newSet.add(menuId);
        // Add all children
        const addChildren = (parentId: string) => {
          menuList.filter((m) => m.parentId === parentId).forEach((child) => {
            newSet.add(child.id);
            addChildren(child.id);
          });
        };
        addChildren(menuId);
        // Add parent if exists
        if (menu.parentId) {
          newSet.add(menu.parentId);
          const parent = menuList.find((m) => m.id === menu.parentId);
          if (parent?.parentId) {
            newSet.add(parent.parentId);
          }
        }
      } else {
        newSet.delete(menuId);
        // Remove all children
        const removeChildren = (parentId: string) => {
          menuList.filter((m) => m.parentId === parentId).forEach((child) => {
            newSet.delete(child.id);
            removeChildren(child.id);
          });
        };
        removeChildren(menuId);
        // Remove parent if no siblings are checked
        if (menu.parentId) {
          const siblings = menuList.filter((m) => m.parentId === menu.parentId);
          const hasCheckedSibling = siblings.some((s) => newSet.has(s.id));
          if (!hasCheckedSibling) {
            newSet.delete(menu.parentId);
            const parent = menuList.find((m) => m.id === menu.parentId);
            if (parent?.parentId) {
              const parentSiblings = menuList.filter((m) => m.parentId === parent.parentId);
              const hasCheckedParentSibling = parentSiblings.some((s) => newSet.has(s.id));
              if (!hasCheckedParentSibling) {
                newSet.delete(parent.parentId);
              }
            }
          }
        }
      }

      return newSet;
    });
  };

  const toggleExpand = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = menuList.map((m) => m.id);
    setExpandedMenus(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedMenus(new Set());
  };

  const selectAll = () => {
    const allIds = menuList.map((m) => m.id);
    setSelectedMenus(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedMenus(new Set());
  };

  const countAllChildren = (parentId: string): number => {
    const children = menuList.filter((m) => m.parentId === parentId);
    let count = children.length;
    children.forEach((child) => {
      count += countAllChildren(child.id);
    });
    return count;
  };

  const buildMenuTree = (menus: MenuResponse[]): MenuResponse[] => {
    return menus.filter((m) => !m.parentId).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
  };

  const getMenuChildren = (parentId: string): MenuResponse[] => {
    return menuList.filter((m) => m.parentId === parentId).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
  };

  const filteredTreeRoots = useMemo(() => {
    if (!menuSearchQuery.trim()) {
      return buildMenuTree(menuList);
    }
    const q = menuSearchQuery.toLowerCase();
    // Return menus that match or have children that match
    const matches = (menu: MenuResponse): boolean => {
      if (menu.menuName?.toLowerCase().includes(q)) return true;
      const children = menuList.filter((m) => m.parentId === menu.id);
      return children.some((c) => matches(c));
    };
    return menuList.filter((m) => !m.parentId && matches(m)).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
  }, [menuList, menuSearchQuery]);

  const handleCancel = () => {
    setIsEditMode(false);
    if (ModuleGroupData) {
      formik.setValues({
        modCode: ModuleGroupData.modCode,
        modName: ModuleGroupData.modName,
        modDescriptions: ModuleGroupData.modDescriptions || "",
        isActive: ModuleGroupData.isActive,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedCode(true);
    showToast({
      description: `Copied "${text}" to clipboard`,
      statusToast: "info",
    });
    setTimeout(() => setHasCopiedCode(false), 2000);
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
          description: "Developer Mode Unlocked: Hak akses konfigurasi & mutasi modul sistem telah diaktifkan.",
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
      description: "Console Locked: Developer Mode dinonaktifkan. Mode dialihkan ke Read-Only.",
      statusToast: "info",
    });
  };

  // ─── Universal Action PIN Confirmation Trigger ───────────────────────────
  const triggerActionWithPin = (
    title: string,
    description: string,
    btnText: string,
    colorScheme: string,
    action: () => Promise<void> | void
  ) => {
    setActionPinTitle(title);
    setActionPinDescription(description);
    setActionPinBtnText(btnText);
    setActionPinColorScheme(colorScheme);
    setActionPinInput("");
    setActionPinError(null);
    setShowActionPin(false);
    setPendingActionFn(() => action);
    setActionPinModalOpen(true);
  };

  const handleActionPinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (actionPinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setActionPinError("Passkey PIN konfirmasi salah.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk mengonfirmasi tindakan.",
        statusToast: "error",
      });
      return;
    }

    if (pendingActionFn) {
      setActionPinLoading(true);
      try {
        await pendingActionFn();
        setActionPinModalOpen(false);
        setPendingActionFn(null);
        setActionPinInput("");
        setActionPinError(null);
      } catch (err) {
        console.error("Action execution error:", err);
      } finally {
        setActionPinLoading(false);
      }
    }
  };

  // Status Flow Handlers
  const fetchStatusFlows = async () => {
    if (!moduleId) return;

    try {
      const response = await GetStatusFlows(moduleId, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setStatusFlows(response.data);
      }
    } catch (error) {
      console.error("Error loading status flows:", error);
    }
  };

  const handleOpenStatusFlowModal = () => {
    if (!isDevMode) {
      handleOpenPinModal();
      return;
    }
    setEditingStatusFlow(null);
    setStatusFlowForm({
      codeStatus: "",
      nameStatus: "",
      descriptions: "",
      previousCodeStatus: "",
      nextCodeStatus: "",
      isFinish: "N",
      isConfirmApproval: "N",
      isDisplayOnChoice: "N",
    });
    setStatusFlowPinInput("");
    setShowStatusFlowPin(false);
    setStatusFlowPinError(null);
    setUserApprovers([]);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setIsStatusFlowModalOpen(true);
  };

  const handleEditStatusFlow = (flow: SysModuleStatusFlowResponse) => {
    if (!isDevMode) {
      handleOpenPinModal();
      return;
    }
    setEditingStatusFlow(flow);
    setStatusFlowForm({
      codeStatus: flow.codeStatus,
      nameStatus: flow.nameStatus,
      descriptions: flow.descriptions || "",
      previousCodeStatus: flow.previousCodeStatus || "",
      nextCodeStatus: flow.nextCodeStatus || "",
      isFinish: flow.isFinish,
      isConfirmApproval: flow.isConfirmApproval,
      isDisplayOnChoice: flow.isDisplayOnChoice || "N",
    });
    setStatusFlowPinInput("");
    setShowStatusFlowPin(false);
    setStatusFlowPinError(null);

    if (flow.isConfirmApproval === "Y") {
      fetchUserApprovers(flow.id);
    }

    setIsStatusFlowModalOpen(true);
  };

  const handleSaveStatusFlow = async () => {
    if (!moduleId || !statusFlowForm.codeStatus || !statusFlowForm.nameStatus) {
      showToast({
        description: "Status Code and Name are required",
        statusToast: "error",
      });
      return;
    }

    if (statusFlowPinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setStatusFlowPinError("Passkey PIN konfirmasi tidak valid.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk konfirmasi perubahan status stage.",
        statusToast: "error",
      });
      return;
    }

    setIsSavingStatusFlow(true);
    try {
      let result;

      if (editingStatusFlow) {
        const payload: SysModuleStatusFlowUpdatePayload = {
          id: editingStatusFlow.id,
          codeStatus: statusFlowForm.codeStatus,
          nameStatus: statusFlowForm.nameStatus,
          descriptions: statusFlowForm.descriptions || null,
          previousCodeStatus: statusFlowForm.previousCodeStatus || null,
          nextCodeStatus: statusFlowForm.isFinish === "Y" ? null : statusFlowForm.nextCodeStatus || null,
          isFinish: statusFlowForm.isFinish,
          isConfirmApproval: statusFlowForm.isConfirmApproval,
          isDisplayOnChoice: statusFlowForm.isDisplayOnChoice,
        };
        result = await UpdateStatusFlow(payload, tokenData);
      } else {
        const payload: SysModuleStatusFlowInsertPayload = {
          moduleId: moduleId,
          codeStatus: statusFlowForm.codeStatus,
          nameStatus: statusFlowForm.nameStatus,
          descriptions: statusFlowForm.descriptions || null,
          previousCodeStatus: statusFlowForm.previousCodeStatus || null,
          nextCodeStatus: statusFlowForm.isFinish === "Y" ? null : statusFlowForm.nextCodeStatus || null,
          isFinish: statusFlowForm.isFinish,
          isConfirmApproval: statusFlowForm.isConfirmApproval,
          isDisplayOnChoice: statusFlowForm.isDisplayOnChoice,
          userApproverIds: statusFlowForm.isConfirmApproval === "Y" ? userApprovers.map((a) => a.userSysId) : undefined,
        };
        result = await InsertStatusFlow(payload, tokenData);
      }

      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Status flow ${editingStatusFlow ? "updated" : "created"} successfully`,
          statusToast: "success",
        });
        setIsStatusFlowModalOpen(false);
        fetchStatusFlows();
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error saving status flow",
        statusToast: "error",
      });
    } finally {
      setIsSavingStatusFlow(false);
    }
  };

  const handleDeleteStatusFlow = async (id: string) => {
    try {
      const result = await DeleteStatusFlow(id, tokenData);

      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Status flow deleted successfully",
          statusToast: "success",
        });
        fetchStatusFlows();
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error deleting status flow",
        statusToast: "error",
      });
    }
  };

  const fetchUserApprovers = async (statusId: string) => {
    try {
      const response = await GetUserApprovers(statusId, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setUserApprovers(response.data);
      }
    } catch (error) {
      console.error("Error loading user approvers:", error);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const response = await GetUserList(
        {
          page: 0,
          limit: 10,
          search: query,
          fieldOrder: ["nama"],
          orderDir: "asc",
          filterWhere: [],
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setUserSearchResults(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleAddUserApprover = async (user: UsersResponse) => {
    const exists = userApprovers.some((a) => a.userSysId === user.id);
    if (exists) {
      showToast({
        description: "User is already in the approver matrix",
        statusToast: "warning",
      });
      return;
    }

    if (editingStatusFlow?.id) {
      try {
        const result = await AddUserApprover(
          {
            moduleStatusId: editingStatusFlow.id,
            userSysId: user.id,
          },
          tokenData
        );

        if (result?.statusCode === RES_CODE_OK) {
          showToast({
            description: "User approver assigned successfully",
            statusToast: "success",
          });
          fetchUserApprovers(editingStatusFlow.id);
          setUserSearchQuery("");
          setUserSearchResults([]);
        } else {
          showToast({
            description: result?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      } catch {
        showToast({
          description: "Error assigning user approver",
          statusToast: "error",
        });
      }
    } else {
      const newApprover: SysModuleStatusUserApproverResponse = {
        id: `temp-${Date.now()}`,
        moduleStatusId: "",
        userSysId: user.id,
        userData: {
          id: user.id,
          nrp: user.nrp,
          nama: user.nama,
          nip: user.nip,
          userId: user.userId,
          email: user.email,
          jabatan: user.jabatan,
          namaUnitKerja: user.namaUnitKerja,
          profilePict: user.profilePict,
        },
        createdAt: new Date().toISOString(),
        createdBy: "SYSTEM",
      };
      setUserApprovers([...userApprovers, newApprover]);
      setUserSearchQuery("");
      setUserSearchResults([]);
    }
  };

  const handleRemoveUserApprover = async (approverId: string) => {
    if (!editingStatusFlow?.id) {
      setUserApprovers(userApprovers.filter((a) => a.id !== approverId));
      return;
    }

    try {
      const result = await RemoveUserApprover(approverId, tokenData);

      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: "User approver removed successfully",
          statusToast: "success",
        });
        if (editingStatusFlow?.id) {
          fetchUserApprovers(editingStatusFlow.id);
        }
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error removing user approver",
        statusToast: "error",
      });
    }
  };

  // ==========================================
  // FEATURE & WHITELIST HANDLERS
  // ==========================================

  const fetchFeatures = async () => {
    if (!moduleId) return;
    setIsLoadingFeatures(true);
    try {
      const response = await GetFeatures(moduleId, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setFeatures(response.data);
        const allIds = response.data.map((f) => f.id);
        setExpandedFeatureAccordions(new Set(allIds));
      }
    } catch (error) {
      console.error("Error loading features:", error);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const payload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [],
        fieldOrder: ["orgCode"],
        orderDir: "asc",
      };
      const response = await GetOrganizationList(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setOrganizationsList(response.data);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    }
  };

  const handleOpenFeatureModal = (feature?: SysModuleFeatureResponse) => {
    if (!isDevMode) {
      handleOpenPinModal();
      return;
    }
    setFeaturePinInput("");
    setShowFeaturePin(false);
    setFeaturePinError(null);
    if (feature) {
      setEditingFeature(feature);
      setFeatureForm({
        featureCode: feature.featureCode,
        featureName: feature.featureName,
        pageUrl: feature.pageUrl || "",
        featureCategory: feature.featureCategory || "DATA_ACCESS",
        descriptions: feature.descriptions || "",
        isActive: feature.isActive || "Y",
      });
    } else {
      setEditingFeature(null);
      setFeatureForm({
        featureCode: "",
        featureName: "",
        pageUrl: "",
        featureCategory: "DATA_ACCESS",
        descriptions: "",
        isActive: "Y",
      });
    }
    setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = async () => {
    if (!moduleId) return;

    if (!featureForm.featureCode.trim() || !featureForm.featureName.trim()) {
      showToast({
        description: "Feature code and name are required",
        statusToast: "warning",
      });
      return;
    }

    if (featurePinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setFeaturePinError("Passkey PIN konfirmasi tidak valid.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk konfirmasi perubahan feature contract.",
        statusToast: "error",
      });
      return;
    }

    setIsSavingFeature(true);
    try {
      if (editingFeature) {
        const payload: SysModuleFeatureUpdatePayload = {
          id: editingFeature.id,
          featureCode: featureForm.featureCode.trim().toUpperCase(),
          featureName: featureForm.featureName.trim(),
          pageUrl: featureForm.pageUrl.trim() || null,
          featureCategory: featureForm.featureCategory,
          descriptions: featureForm.descriptions.trim() || null,
          isActive: featureForm.isActive,
        };
        const response = await UpdateFeature(payload, tokenData);
        if (response?.statusCode === RES_CODE_OK) {
          showToast({
            description: "Feature contract updated successfully",
            statusToast: "success",
          });
          setIsFeatureModalOpen(false);
          fetchFeatures();
        } else {
          showToast({
            description: response?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      } else {
        const payload: SysModuleFeatureInsertPayload = {
          moduleId,
          featureCode: featureForm.featureCode.trim().toUpperCase(),
          featureName: featureForm.featureName.trim(),
          pageUrl: featureForm.pageUrl.trim() || null,
          featureCategory: featureForm.featureCategory,
          descriptions: featureForm.descriptions.trim() || null,
          isActive: featureForm.isActive,
        };
        const response = await InsertFeature(payload, tokenData);
        if (response?.statusCode === RES_CODE_OK) {
          showToast({
            description: "Feature contract registered successfully",
            statusToast: "success",
          });
          setIsFeatureModalOpen(false);
          fetchFeatures();
        } else {
          showToast({
            description: response?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
        }
      }
    } catch {
      showToast({
        description: "Error saving feature contract",
        statusToast: "error",
      });
    } finally {
      setIsSavingFeature(false);
    }
  };

  const handleOpenWhitelistModal = (feature: SysModuleFeatureResponse) => {
    if (!isDevMode) {
      handleOpenPinModal();
      return;
    }
    setWhitelistPinInput("");
    setShowWhitelistPin(false);
    setWhitelistPinError(null);
    setTargetFeatureForWhitelist(feature);
    setWhitelistForm({
      principalType: "ORG_GROUP",
      orgGroupId: "",
      userSysId: "",
      accessLevel: "ALLOW",
      remarks: "",
    });
    setOrgSearchQuery("");
    setWlUserSearchQuery("");
    setWlUserSearchResults([]);
    setIsWhitelistModalOpen(true);
  };

  const handleSearchWlUsers = async (query: string) => {
    setWlUserSearchQuery(query);
    if (!query || query.length < 2) {
      setWlUserSearchResults([]);
      return;
    }

    setIsSearchingWlUsers(true);
    try {
      const payload: PaggingListPayload = {
        page: 0,
        limit: 10,
        search: query,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc",
      };
      const response = await GetUserList(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setWlUserSearchResults(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearchingWlUsers(false);
    }
  };

  const handleSaveWhitelist = async () => {
    if (!targetFeatureForWhitelist) return;

    if (whitelistForm.principalType === "ORG_GROUP" && !whitelistForm.orgGroupId) {
      showToast({
        description: "Please select an organization group",
        statusToast: "warning",
      });
      return;
    }

    if (whitelistForm.principalType === "USER" && !whitelistForm.userSysId) {
      showToast({
        description: "Please select a user account",
        statusToast: "warning",
      });
      return;
    }

    if (whitelistPinInput.trim() !== WORKER_QUEUE_PASSKEY) {
      setWhitelistPinError("Passkey PIN konfirmasi tidak valid.");
      showToast({
        description: "Akses Ditolak: Masukkan Passkey PIN yang valid untuk konfirmasi penambahan whitelist.",
        statusToast: "error",
      });
      return;
    }

    setIsSavingWhitelist(true);
    try {
      const payload: SysModuleFeatureWhitelistInsertPayload = {
        moduleFeatureId: targetFeatureForWhitelist.id,
        principalType: whitelistForm.principalType,
        orgGroupId: whitelistForm.principalType === "ORG_GROUP" ? whitelistForm.orgGroupId : null,
        userSysId: whitelistForm.principalType === "USER" ? whitelistForm.userSysId : null,
        accessLevel: whitelistForm.accessLevel,
        remarks: whitelistForm.remarks.trim() || null,
      };

      const response = await AddFeatureWhitelist(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Whitelist entry added successfully",
          statusToast: "success",
        });
        setIsWhitelistModalOpen(false);
        fetchFeatures();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error adding whitelist entry",
        statusToast: "error",
      });
    } finally {
      setIsSavingWhitelist(false);
    }
  };

  const handleRemoveWhitelist = async (whitelistId: string) => {
    try {
      const response = await RemoveFeatureWhitelist(whitelistId, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Whitelist entry removed",
          statusToast: "success",
        });
        fetchFeatures();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch {
      showToast({
        description: "Error removing whitelist entry",
        statusToast: "error",
      });
    }
  };

  const toggleFeatureAccordion = (featureId: string) => {
    const next = new Set(expandedFeatureAccordions);
    if (next.has(featureId)) {
      next.delete(featureId);
    } else {
      next.add(featureId);
    }
    setExpandedFeatureAccordions(next);
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box p={{ base: 4, md: 6 }} maxW="1600px" mx="auto">
        <VStack spacing={6} align="stretch">
          {/* Top Bar Actions & Back */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3} wrap="wrap">
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                size="md"
                rounded={radiusStyle}
                onClick={() => router.push("/master-data/sys-module-group")}
              >
                Back to Console
              </Button>

              {/* Dev Mode Status Tag */}
              <HStack
                spacing={2}
                px={3}
                py={1.5}
                rounded="md"
                bg={isDevMode ? (isDark ? "purple.950" : "purple.50") : (isDark ? "gray.800" : "gray.100")}
                border="1px solid"
                borderColor={isDevMode ? (isDark ? "purple.700" : "purple.200") : (isDark ? "gray.700" : "gray.200")}
              >
                <Icon as={isDevMode ? FiUnlock : FiLock} color={isDevMode ? "purple.400" : "gray.500"} />
                <Text fontSize="xs" fontWeight="bold" color={isDevMode ? (isDark ? "purple.300" : "purple.700") : "gray.500"}>
                  {isDevMode ? "Developer Mode: Unlocked" : "Read-Only Console"}
                </Text>
              </HStack>
            </HStack>

            <HStack spacing={2}>
              {isDevMode ? (
                <Button
                  leftIcon={<FiLock />}
                  size="md"
                  variant="outline"
                  colorScheme="purple"
                  rounded={radiusStyle}
                  onClick={handleLockConsole}
                >
                  Lock Console
                </Button>
              ) : (
                <Button
                  leftIcon={<FiUnlock />}
                  size="md"
                  colorScheme="purple"
                  rounded={radiusStyle}
                  onClick={handleOpenPinModal}
                >
                  Unlock Dev Mode
                </Button>
              )}

              <Button
                leftIcon={<FiRefreshCw />}
                variant="ghost"
                size="md"
                isLoading={IsLoadingProcess}
                onClick={() => {
                  fetchModuleGroupData();
                  fetchMenuList();
                  fetchAssignedMenus();
                  fetchStatusFlows();
                  fetchFeatures();
                  fetchOrganizations();
                }}
              >
                Refresh Data
              </Button>
            </HStack>
          </Flex>

          {/* Module Banner Hero Card */}
          <Card
            variant="outline"
            rounded={radiusStyle}
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.850" : "white"}
            shadow="sm"
          >
            <CardBody p={{ base: 4, md: 5 }}>
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                gap={4}
              >
                {/* Left: Icon & Module Identity */}
                <HStack spacing={4} align="flex-start" flex={1}>
                  <Box
                    p={3}
                    rounded="lg"
                    bg={isDark ? "cyan.950" : "cyan.50"}
                    border="1px solid"
                    borderColor={isDark ? "cyan.800" : "cyan.200"}
                    color={isDark ? "cyan.300" : "cyan.700"}
                    flexShrink={0}
                  >
                    <FiLayers size={24} />
                  </Box>

                  <VStack align="flex-start" spacing={1}>
                    <HStack spacing={2} wrap="wrap">
                      <Heading size="md" fontWeight="bold">
                        {ModuleGroupData?.modName || "Loading..."}
                      </Heading>
                      {ModuleGroupData?.modCode && (
                        <Tooltip label="Click to copy Module Code" hasArrow>
                          <Tag
                            size="md"
                            variant="subtle"
                            colorScheme="blue"
                            fontFamily="mono"
                            fontSize="xs"
                            cursor="pointer"
                            onClick={() => copyToClipboard(ModuleGroupData.modCode)}
                          >
                            <TagLabel>{ModuleGroupData.modCode}</TagLabel>
                            <Box ml={1} as="span">
                              {hasCopiedCode ? <FiCheck size={12} /> : <FiCopy size={12} />}
                            </Box>
                          </Tag>
                        </Tooltip>
                      )}
                      <HStack
                        spacing={1.5}
                        px={2.5}
                        py={0.5}
                        rounded="full"
                        bg={
                          ModuleGroupData?.isActive === "Y"
                            ? isDark
                              ? "green.950"
                              : "green.50"
                            : isDark
                            ? "gray.800"
                            : "gray.100"
                        }
                        border="1px solid"
                        borderColor={
                          ModuleGroupData?.isActive === "Y"
                            ? isDark
                              ? "green.800"
                              : "green.200"
                            : isDark
                            ? "gray.700"
                            : "gray.300"
                        }
                      >
                        <Box
                          w="6px"
                          h="6px"
                          rounded="full"
                          bg={ModuleGroupData?.isActive === "Y" ? "green.500" : "gray.400"}
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color={
                            ModuleGroupData?.isActive === "Y"
                              ? isDark
                                ? "green.300"
                                : "green.700"
                              : "gray.500"
                          }
                        >
                          {ModuleGroupData?.isActive === "Y" ? "Active" : "Inactive"}
                        </Text>
                      </HStack>
                    </HStack>

                    <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
                      {ModuleGroupData?.modDescriptions || "No module description specified."}
                    </Text>
                  </VStack>
                </HStack>

                {/* Right: Technical Stats Badges */}
                <HStack spacing={3} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
                  <Box
                    px={3}
                    py={1.5}
                    rounded="md"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    bg={isDark ? "gray.800" : "gray.50"}
                  >
                    <HStack spacing={2}>
                      <FiMenu size={14} color="gray" />
                      <Text fontSize="xs" color="gray.500">
                        Assigned Menus:
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" fontFamily="mono">
                        {selectedMenus.size} / {menuList.length}
                      </Text>
                    </HStack>
                  </Box>

                  <Box
                    px={3}
                    py={1.5}
                    rounded="md"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    bg={isDark ? "gray.800" : "gray.50"}
                  >
                    <HStack spacing={2}>
                      <FiGitBranch size={14} color="gray" />
                      <Text fontSize="xs" color="gray.500">
                        Status Stages:
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" fontFamily="mono">
                        {statusFlows.length}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Navigation Tabs */}
          <Tabs
            index={activeTabIndex}
            onChange={(idx) => setActiveTabIndex(idx)}
            variant={"unstyled"}
            colorScheme={"secondary"}
            size={"lg"}
          >
            <Box mb={4}>
              <TabList
                gap={2}
                p={2}
                overflowX={"auto"}
                justifyContent="start"
                sx={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiInfo size={16} />
                    <Text>General Configuration</Text>
                  </HStack>
                </TabButtonCustomStyle>
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiMenu size={16} />
                    <Text>Menu Hierarchy</Text>
                    <Tag
                      size="sm"
                      variant="solid"
                      bg={activeTabIndex === 1 ? "whiteAlpha.300" : isDark ? "secondary.900" : "secondary.50"}
                      color={activeTabIndex === 1 ? "white" : isDark ? "secondary.200" : "secondary.700"}
                      fontFamily="mono"
                      fontSize="xs"
                      rounded="full"
                    >
                      {selectedMenus.size}
                    </Tag>
                  </HStack>
                </TabButtonCustomStyle>
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiGitBranch size={16} />
                    <Text>Status Workflow Pipeline</Text>
                    <Tag
                      size="sm"
                      variant="solid"
                      bg={activeTabIndex === 2 ? "whiteAlpha.300" : isDark ? "secondary.900" : "secondary.50"}
                      color={activeTabIndex === 2 ? "white" : isDark ? "secondary.200" : "secondary.700"}
                      fontFamily="mono"
                      fontSize="xs"
                      rounded="full"
                    >
                      {statusFlows.length}
                    </Tag>
                  </HStack>
                </TabButtonCustomStyle>
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiShield size={16} />
                    <Text>Feature & Page Access Matrix</Text>
                    <Tag
                      size="sm"
                      variant="solid"
                      bg={activeTabIndex === 3 ? "whiteAlpha.300" : isDark ? "secondary.900" : "secondary.50"}
                      color={activeTabIndex === 3 ? "white" : isDark ? "secondary.200" : "secondary.700"}
                      fontFamily="mono"
                      fontSize="xs"
                      rounded="full"
                    >
                      {features.length}
                    </Tag>
                  </HStack>
                </TabButtonCustomStyle>
              </TabList>
            </Box>

            <TabPanels>
              {/* TAB 1: General Configuration Inspector */}
              <TabPanel px={0} pt={4}>
                <Card
                  variant="outline"
                  rounded={radiusStyle}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="sm"
                >
                  <CardHeader pb={3}>
                    <Flex justify="space-between" align="center">
                      <VStack align="flex-start" spacing={0.5}>
                        <Heading size="sm" fontWeight="bold">
                          Technical Specification
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                          Inspect and modify runtime configuration parameters for this module.
                        </Text>
                      </VStack>

                      {!isEditMode ? (
                        <Button
                          leftIcon={<FiEdit />}
                          colorScheme="blue"
                          size="md"
                          rounded={radiusStyle}
                          onClick={() => {
                            if (!isDevMode) {
                              handleOpenPinModal();
                              return;
                            }
                            setIsEditMode(true);
                          }}
                        >
                          Edit Specification
                        </Button>
                      ) : (
                        <HStack spacing={2}>
                          <Button
                            leftIcon={<FiSave />}
                            colorScheme="blue"
                            size="md"
                            rounded={radiusStyle}
                            onClick={() => formik.handleSubmit()}
                            isLoading={isUpdating}
                          >
                            Save Changes
                          </Button>
                          <Button
                            leftIcon={<FiX />}
                            variant="outline"
                            size="md"
                            rounded={radiusStyle}
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </CardHeader>
                  <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                  <CardBody p={6}>
                    {IsLoadingProcess ? (
                      <Flex justify="center" py={12}>
                        <Spinner size="lg" color="blue.500" />
                      </Flex>
                    ) : !isEditMode ? (
                      /* READ-ONLY TECHNICAL SPEC SHEET */
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box
                          p={4}
                          rounded="md"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                            Module Identification
                          </Text>
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="sm" color="gray.500">
                              System Code:
                            </Text>
                            <Tag size="md" variant="solid" colorScheme="blue" fontFamily="mono" fontSize="xs">
                              {ModuleGroupData?.modCode || "-"}
                            </Tag>
                          </HStack>
                          <Divider my={2.5} borderColor={isDark ? "gray.700" : "gray.200"} />
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              Module Name:
                            </Text>
                            <Text fontSize="md" fontWeight="bold">
                              {ModuleGroupData?.modName || "-"}
                            </Text>
                          </HStack>
                          <Divider my={2.5} borderColor={isDark ? "gray.700" : "gray.200"} />
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              Record ID:
                            </Text>
                            <Text fontSize="xs" fontFamily="mono" color="gray.500">
                              {ModuleGroupData?.id || "-"}
                            </Text>
                          </HStack>
                        </Box>

                        <Box
                          p={4}
                          rounded="md"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                            Runtime & Status
                          </Text>
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="sm" color="gray.500">
                              Operational Status:
                            </Text>
                            <HStack spacing={1.5}>
                              <Box
                                w="8px"
                                h="8px"
                                rounded="full"
                                bg={ModuleGroupData?.isActive === "Y" ? "green.500" : "gray.400"}
                              />
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={ModuleGroupData?.isActive === "Y" ? "green.500" : "gray.500"}
                              >
                                {ModuleGroupData?.isActive === "Y" ? "ACTIVE / ENABLED" : "INACTIVE / DISABLED"}
                              </Text>
                            </HStack>
                          </HStack>
                          <Divider my={2.5} borderColor={isDark ? "gray.700" : "gray.200"} />
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              Total Menu Access:
                            </Text>
                            <Text fontSize="md" fontWeight="bold" fontFamily="mono">
                              {selectedMenus.size} assigned
                            </Text>
                          </HStack>
                          <Divider my={2.5} borderColor={isDark ? "gray.700" : "gray.200"} />
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              Workflow Stages:
                            </Text>
                            <Text fontSize="md" fontWeight="bold" fontFamily="mono">
                              {statusFlows.length} stages configured
                            </Text>
                          </HStack>
                        </Box>

                        <Box
                          gridColumn={{ base: "1", md: "1 / -1" }}
                          p={4}
                          rounded="md"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.850" : "gray.50"}
                        >
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                            Description / Functional Scope
                          </Text>
                          <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"} whiteSpace="pre-wrap">
                            {ModuleGroupData?.modDescriptions || "No descriptive functional scope provided."}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    ) : (
                      /* EDIT MODE FORM */
                      <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={5} maxW="700px">
                          <FormControl isInvalid={!!formik.errors.modCode && formik.touched.modCode}>
                            <FormLabel fontSize="sm" fontWeight="semibold">
                              Module Code (Immutable)
                            </FormLabel>
                            <Input
                              name="modCode"
                              value={formik.values.modCode}
                              onChange={formik.handleChange}
                              isDisabled
                              bg={isDark ? "gray.900" : "gray.100"}
                              fontFamily="mono"
                              size="md"
                            />
                            <FormErrorMessage fontSize="sm">{formik.errors.modCode}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!formik.errors.modName && formik.touched.modName} isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">
                              Module Name
                            </FormLabel>
                            <Input
                              name="modName"
                              value={formik.values.modName}
                              onChange={formik.handleChange}
                              placeholder="e.g., MASTER_DATA_ENGINE"
                              size="md"
                            />
                            <FormErrorMessage fontSize="sm">{formik.errors.modName}</FormErrorMessage>
                          </FormControl>

                          <FormControl
                            isInvalid={!!formik.errors.modDescriptions && formik.touched.modDescriptions}
                          >
                            <FormLabel fontSize="sm" fontWeight="semibold">
                              Description & Scope
                            </FormLabel>
                            <Textarea
                              name="modDescriptions"
                              value={formik.values.modDescriptions}
                              onChange={formik.handleChange}
                              placeholder="Provide technical scope and architectural responsibilities for this module group..."
                              rows={4}
                              size="md"
                            />
                            <FormErrorMessage fontSize="sm">{formik.errors.modDescriptions}</FormErrorMessage>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold">
                              Module Active State
                            </FormLabel>
                            <Select
                              name="isActive"
                              value={formik.values.isActive}
                              onChange={formik.handleChange}
                              size="md"
                            >
                              <option value="Y">Active (Enabled for Routing & Workflows)</option>
                              <option value="N">Inactive (Suspended from Execution)</option>
                            </Select>
                          </FormControl>
                        </Stack>
                      </form>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* TAB 2: Menu Module Contains Hierarchy */}
              <TabPanel px={0} pt={4}>
                <Card
                  variant="outline"
                  rounded={radiusStyle}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="sm"
                >
                  <CardHeader pb={3}>
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "flex-start", sm: "center" }}
                      gap={3}
                    >
                      <VStack align="flex-start" spacing={0.5}>
                        <Heading size="sm" fontWeight="bold">
                          Assigned Menu Hierarchy
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                          Toggle which frontend navigation routes and submenus belong to this module group.
                        </Text>
                      </VStack>

                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="blue"
                        size="md"
                        rounded={radiusStyle}
                        onClick={() => {
                          if (!isDevMode) {
                            handleOpenPinModal();
                            return;
                          }
                          triggerActionWithPin(
                            "Konfirmasi Mapping Menu",
                            `Simpan konfigurasi ${selectedMenus.size} menu yang dipilih untuk modul ini ke database.`,
                            "Simpan Menu",
                            "blue",
                            handleSaveMenus
                          );
                        }}
                        isLoading={isSavingMenus}
                      >
                        Save Menu Access
                      </Button>
                    </Flex>
                  </CardHeader>
                  <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      {/* Tree Controls & Search Bar */}
                      <Flex
                        direction={{ base: "column", md: "row" }}
                        justify="space-between"
                        align={{ base: "stretch", md: "center" }}
                        gap={3}
                        p={3}
                        rounded="md"
                        bg={isDark ? "gray.850" : "gray.50"}
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                      >
                        <InputGroup size="md" maxW={{ base: "full", md: "360px" }}>
                          <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray" />
                          </InputLeftElement>
                          <Input
                            placeholder="Filter menus by name..."
                            value={menuSearchQuery}
                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                            bg={isDark ? "gray.800" : "white"}
                          />
                          {menuSearchQuery && (
                            <InputRightElement>
                              <IconButton
                                aria-label="Clear filter"
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                onClick={() => setMenuSearchQuery("")}
                              />
                            </InputRightElement>
                          )}
                        </InputGroup>

                        <HStack spacing={2} wrap="wrap">
                          <Button size="sm" variant="outline" onClick={expandAll}>
                            Expand All
                          </Button>
                          <Button size="sm" variant="outline" onClick={collapseAll}>
                            Collapse All
                          </Button>
                          <Button size="sm" variant="ghost" colorScheme="blue" onClick={selectAll}>
                            Select All
                          </Button>
                          <Button size="sm" variant="ghost" colorScheme="red" onClick={deselectAll}>
                            Clear Selection
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Tree Container */}
                      <Box
                        maxH="580px"
                        overflowY="auto"
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        rounded="md"
                        p={3}
                        bg={isDark ? "gray.900" : "white"}
                      >
                        {menuList.length === 0 ? (
                          <Flex justify="center" align="center" py={12}>
                            <VStack spacing={2}>
                              <FiMenu size={28} color="gray" />
                              <Text fontSize="sm" color="gray.500">
                                No menu items found in the registry.
                              </Text>
                            </VStack>
                          </Flex>
                        ) : filteredTreeRoots.length === 0 ? (
                          <Flex justify="center" align="center" py={12}>
                            <Text fontSize="sm" color="gray.500">
                              No menus matching filter &quot;{menuSearchQuery}&quot;
                            </Text>
                          </Flex>
                        ) : (
                          <VStack spacing={1.5} align="stretch">
                            {filteredTreeRoots.map((menu) => {
                              const childCount = countAllChildren(menu.id);
                              const isExpanded = expandedMenus.has(menu.id);
                              const children = getMenuChildren(menu.id);
                              const hasChildren = children.length > 0;
                              const isChecked = selectedMenus.has(menu.id);

                              return (
                                <Box key={menu.id}>
                                  {/* Level 1 Item */}
                                  <Flex
                                    p={2.5}
                                    rounded="md"
                                    align="center"
                                    justify="space-between"
                                    bg={
                                      isChecked
                                        ? isDark
                                          ? "blue.950"
                                          : "blue.50"
                                        : isDark
                                        ? "gray.800"
                                        : "gray.50"
                                    }
                                    border="1px solid"
                                    borderColor={
                                      isChecked
                                        ? isDark
                                          ? "blue.800"
                                          : "blue.200"
                                        : isDark
                                        ? "gray.700"
                                        : "gray.200"
                                    }
                                    _hover={{
                                      borderColor: isDark ? "blue.500" : "blue.300",
                                    }}
                                    transition="all 0.15s"
                                  >
                                    <HStack spacing={3} flex={1}>
                                      <Checkbox
                                        isChecked={isChecked}
                                        onChange={(e) => toggleMenu(menu.id, e.target.checked)}
                                        colorScheme="blue"
                                        size="md"
                                      />
                                      <Box color={isChecked ? "blue.500" : "gray.400"}>
                                        <FiFolder size={18} />
                                      </Box>
                                      <Text fontSize="md" fontWeight="semibold">
                                        {menu.menuName}
                                      </Text>
                                      {childCount > 0 && (
                                        <Tag size="sm" variant="subtle" colorScheme="blue" fontFamily="mono" fontSize="xs">
                                          {childCount} sub-items
                                        </Tag>
                                      )}
                                    </HStack>

                                    {hasChildren && (
                                      <IconButton
                                        aria-label="Toggle children"
                                        icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleExpand(menu.id)}
                                      />
                                    )}
                                  </Flex>

                                  {/* Level 2 Children */}
                                  {isExpanded && hasChildren && (
                                    <VStack spacing={1} align="stretch" pl={6} mt={1} position="relative">
                                      <Box
                                        position="absolute"
                                        left="12px"
                                        top="0"
                                        bottom="8px"
                                        w="1px"
                                        bg={isDark ? "gray.700" : "gray.300"}
                                      />
                                      {children.map((child) => {
                                        const grandChildCount = countAllChildren(child.id);
                                        const isChildExpanded = expandedMenus.has(child.id);
                                        const grandChildren = getMenuChildren(child.id);
                                        const hasGrandChildren = grandChildren.length > 0;
                                        const isChildChecked = selectedMenus.has(child.id);

                                        return (
                                          <Box key={child.id}>
                                            <Flex
                                              p={2}
                                              rounded="md"
                                              align="center"
                                              justify="space-between"
                                              bg={
                                                isChildChecked
                                                  ? isDark
                                                    ? "cyan.950"
                                                    : "cyan.50"
                                                  : isDark
                                                  ? "gray.850"
                                                  : "gray.50"
                                              }
                                              border="1px solid"
                                              borderColor={
                                                isChildChecked
                                                  ? isDark
                                                    ? "cyan.800"
                                                    : "cyan.200"
                                                  : isDark
                                                  ? "gray.750"
                                                  : "gray.200"
                                              }
                                            >
                                              <HStack spacing={2.5} flex={1}>
                                                <Checkbox
                                                  isChecked={isChildChecked}
                                                  onChange={(e) => toggleMenu(child.id, e.target.checked)}
                                                  colorScheme="cyan"
                                                  size="md"
                                                />
                                                <Box color={isChildChecked ? "cyan.500" : "gray.400"}>
                                                  {hasGrandChildren ? <FiFolder size={15} /> : <FiFileText size={15} />}
                                                </Box>
                                                <Text fontSize="sm" fontWeight="medium">
                                                  {child.menuName}
                                                </Text>
                                                {grandChildCount > 0 && (
                                                  <Tag size="sm" variant="subtle" colorScheme="cyan" fontFamily="mono" fontSize="xs">
                                                    {grandChildCount} sub
                                                  </Tag>
                                                )}
                                              </HStack>

                                              {hasGrandChildren && (
                                                <IconButton
                                                  aria-label="Toggle grandchildren"
                                                  icon={isChildExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => toggleExpand(child.id)}
                                                />
                                              )}
                                            </Flex>

                                            {/* Level 3 Children */}
                                            {isChildExpanded && hasGrandChildren && (
                                              <VStack spacing={1} align="stretch" pl={6} mt={1} position="relative">
                                                <Box
                                                  position="absolute"
                                                  left="12px"
                                                  top="0"
                                                  bottom="8px"
                                                  w="1px"
                                                  bg={isDark ? "gray.700" : "gray.300"}
                                                />
                                                {grandChildren.map((grandChild) => {
                                                  const isGrandChecked = selectedMenus.has(grandChild.id);
                                                  return (
                                                    <Flex
                                                      key={grandChild.id}
                                                      p={2}
                                                      px={2.5}
                                                      rounded="md"
                                                      align="center"
                                                      bg={
                                                        isGrandChecked
                                                          ? isDark
                                                            ? "purple.950"
                                                            : "purple.50"
                                                          : isDark
                                                          ? "gray.850"
                                                          : "white"
                                                      }
                                                      border="1px solid"
                                                      borderColor={
                                                        isGrandChecked
                                                          ? isDark
                                                            ? "purple.800"
                                                            : "purple.200"
                                                          : isDark
                                                          ? "gray.700"
                                                          : "gray.200"
                                                      }
                                                    >
                                                      <HStack spacing={2}>
                                                        <Checkbox
                                                          isChecked={isGrandChecked}
                                                          onChange={(e) => toggleMenu(grandChild.id, e.target.checked)}
                                                          colorScheme="purple"
                                                          size="sm"
                                                        />
                                                        <Box color={isGrandChecked ? "purple.400" : "gray.400"}>
                                                          <FiFileText size={14} />
                                                        </Box>
                                                        <Text fontSize="sm" fontWeight="normal">
                                                          {grandChild.menuName}
                                                        </Text>
                                                      </HStack>
                                                    </Flex>
                                                  );
                                                })}
                                              </VStack>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </VStack>
                                  )}
                                </Box>
                              );
                            })}
                          </VStack>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* TAB 3: Status Flow & State Machine Pipeline */}
              <TabPanel px={0} pt={4}>
                <Card
                  variant="outline"
                  rounded={radiusStyle}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.800" : "white"}
                  shadow="sm"
                >
                  <CardHeader pb={3}>
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "flex-start", sm: "center" }}
                      gap={3}
                    >
                      <VStack align="flex-start" spacing={0.5}>
                        <Heading size="sm" fontWeight="bold">
                          Status Workflow & State Machine
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                          Configure state transitions, approval gates, and terminal finish criteria.
                        </Text>
                      </VStack>

                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="md"
                        rounded={radiusStyle}
                        onClick={handleOpenStatusFlowModal}
                      >
                        Add Status Stage
                      </Button>
                    </Flex>
                  </CardHeader>
                  <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                  <CardBody p={6}>
                    <VStack align="stretch" spacing={6}>
                      {/* Warning Notice if no terminal finish status */}
                      {statusFlows.length > 0 && statusFlows.filter((f) => f.isFinish === "Y").length === 0 && (
                        <Box
                          p={3.5}
                          rounded="md"
                          bg={isDark ? "orange.950" : "orange.50"}
                          border="1px solid"
                          borderColor={isDark ? "orange.800" : "orange.200"}
                        >
                          <HStack spacing={3}>
                            <Box color="orange.500">
                              <FiShield size={20} />
                            </Box>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontSize="sm" fontWeight="bold" color={isDark ? "orange.300" : "orange.800"}>
                                Missing Terminal Finish State
                              </Text>
                              <Text fontSize="sm" color={isDark ? "orange.400" : "orange.700"}>
                                No stage is currently designated as a Finish status. Please mark at least one stage as
                                Finish to terminate workflow execution.
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )}

                      {/* Status Flow Pipeline Stages */}
                      {statusFlows.length === 0 ? (
                        <Flex
                          direction="column"
                          justify="center"
                          align="center"
                          py={16}
                          border="1px dashed"
                          borderColor={isDark ? "gray.700" : "gray.300"}
                          rounded="lg"
                        >
                          <Box color="gray.400" mb={3}>
                            <FiGitBranch size={40} />
                          </Box>
                          <Heading size="sm" color="gray.500" mb={1}>
                            No Workflow Stages Configured
                          </Heading>
                          <Text fontSize="sm" color="gray.500" mb={4} maxW="400px" textAlign="center">
                            Start designing the lifecycle by registering initial, approval, and terminal status stages.
                          </Text>
                          <Button
                            leftIcon={<FiPlus />}
                            colorScheme="blue"
                            size="md"
                            rounded={radiusStyle}
                            onClick={handleOpenStatusFlowModal}
                          >
                            Create First Status Stage
                          </Button>
                        </Flex>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {statusFlows.map((flow, index) => {
                            const isApproval = flow.isConfirmApproval === "Y";
                            const isFinish = flow.isFinish === "Y";
                            const isInitial = !flow.previousCodeStatus;

                            return (
                              <Box key={flow.id} position="relative">
                                <Box
                                  p={4}
                                  rounded="lg"
                                  bg={isDark ? "gray.850" : "white"}
                                  border="1px solid"
                                  borderColor={
                                    isFinish
                                      ? isDark
                                        ? "green.700"
                                        : "green.300"
                                      : isApproval
                                      ? isDark
                                        ? "orange.700"
                                        : "orange.300"
                                      : isDark
                                      ? "gray.700"
                                      : "gray.200"
                                  }
                                  shadow="sm"
                                  transition="all 0.15s"
                                >
                                  <Flex
                                    direction={{ base: "column", md: "row" }}
                                    justify="space-between"
                                    align={{ base: "flex-start", md: "center" }}
                                    gap={4}
                                  >
                                    {/* Left Info */}
                                    <HStack spacing={3.5} align="flex-start" flex={1}>
                                      {/* Order Indicator */}
                                      <Box
                                        w="36px"
                                        h="36px"
                                        rounded="md"
                                        bg={
                                          isFinish
                                            ? "green.500"
                                            : isApproval
                                            ? "orange.500"
                                            : isInitial
                                            ? "blue.500"
                                            : isDark
                                            ? "gray.700"
                                            : "gray.200"
                                        }
                                        color="white"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold"
                                        fontSize="sm"
                                        fontFamily="mono"
                                        flexShrink={0}
                                      >
                                        #{index + 1}
                                      </Box>

                                      <VStack align="flex-start" spacing={1.5} flex={1}>
                                        <HStack spacing={2} wrap="wrap">
                                          <Text fontWeight="bold" fontSize="md">
                                            {flow.nameStatus}
                                          </Text>
                                          <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme="gray"
                                            fontFamily="mono"
                                            fontSize="xs"
                                          >
                                            {flow.codeStatus}
                                          </Tag>

                                          {/* State Type Tags */}
                                          {isInitial && (
                                            <Tag size="sm" colorScheme="blue" variant="solid" fontSize="xs">
                                              ENTRYPOINT
                                            </Tag>
                                          )}
                                          {isApproval && (
                                            <Tag size="sm" colorScheme="orange" variant="solid" fontSize="xs">
                                              APPROVAL GATE
                                            </Tag>
                                          )}
                                          {isFinish && (
                                            <Tag size="sm" colorScheme="green" variant="solid" fontSize="xs">
                                              TERMINAL FINISH
                                            </Tag>
                                          )}
                                          {flow.isDisplayOnChoice === "Y" && (
                                            <Tag size="sm" colorScheme="purple" variant="outline" fontSize="xs">
                                              DISPLAY ON CHOICE
                                            </Tag>
                                          )}
                                        </HStack>

                                        {flow.descriptions && (
                                          <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
                                            {flow.descriptions}
                                          </Text>
                                        )}

                                        {/* Routing Transitions */}
                                        <HStack spacing={3} pt={1} wrap="wrap">
                                          <HStack spacing={1.5} fontSize="sm" color="gray.500">
                                            <Text fontWeight="medium">Inbound:</Text>
                                            <Tag size="sm" variant="outline" fontFamily="mono" fontSize="xs">
                                              {flow.previousCodeStatus || "ROOT_ENTRY"}
                                            </Tag>
                                          </HStack>

                                          <FiArrowRight size={14} color="gray" />

                                          <HStack spacing={1.5} fontSize="sm" color="gray.500">
                                            <Text fontWeight="medium">Outbound:</Text>
                                            <Tag
                                              size="sm"
                                              variant="outline"
                                              colorScheme={isFinish ? "green" : "blue"}
                                              fontFamily="mono"
                                              fontSize="xs"
                                            >
                                              {isFinish ? "TERMINATED" : flow.nextCodeStatus || "UNLINKED"}
                                            </Tag>
                                          </HStack>
                                        </HStack>
                                      </VStack>
                                    </HStack>

                                    {/* Right Actions */}
                                    <HStack spacing={2} alignSelf={{ base: "flex-end", md: "center" }}>
                                      <Button
                                        size="sm"
                                        leftIcon={<FiEdit />}
                                        variant="outline"
                                        rounded={radiusStyle}
                                        onClick={() => handleEditStatusFlow(flow)}
                                      >
                                        Edit
                                      </Button>
                                      <IconButton
                                        aria-label="Delete status flow"
                                        size="sm"
                                        icon={<FiTrash2 />}
                                        colorScheme="red"
                                        variant="ghost"
                                        rounded={radiusStyle}
                                        onClick={() => {
                                          if (!isDevMode) {
                                            handleOpenPinModal();
                                            return;
                                          }
                                          triggerActionWithPin(
                                            "Konfirmasi Hapus Status Stage",
                                            `Hapus status stage "${flow.nameStatus}" (${flow.codeStatus})? Tindakan ini tidak dapat dibatalkan.`,
                                            "Hapus Stage",
                                            "red",
                                            () => handleDeleteStatusFlow(flow.id)
                                          );
                                        }}
                                      />
                                    </HStack>
                                  </Flex>
                                </Box>

                                {/* Connecting Line to Next Step */}
                                {index < statusFlows.length - 1 && (
                                  <Flex justify="center" py={1.5}>
                                    <Box color={isDark ? "gray.600" : "gray.400"}>
                                      <FiChevronDown size={18} />
                                    </Box>
                                  </Flex>
                                )}
                              </Box>
                            );
                          })}
                        </VStack>
                      )}

                      {/* State Machine Diagram Matrix */}
                      {statusFlows.length > 0 && (
                        <>
                          <Divider borderColor={isDark ? "gray.700" : "gray.200"} pt={2} />

                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="sm" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                                Flow Execution Graph
                              </Heading>
                              <Tag size="sm" variant="subtle" colorScheme="blue" fontSize="xs">
                                Sequential & Branch View
                              </Tag>
                            </HStack>

                            <Box
                              p={5}
                              rounded="md"
                              bg={isDark ? "gray.900" : "gray.50"}
                              border="1px solid"
                              borderColor={isDark ? "gray.700" : "gray.200"}
                            >
                              {(() => {
                                const flowMap = new Map<string, SysModuleStatusFlowResponse>();
                                statusFlows.forEach((f) => flowMap.set(f.codeStatus, f));

                                const startNode = statusFlows.find((f) => !f.previousCodeStatus);

                                if (!startNode) {
                                  return (
                                    <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                                      No root start node identified. Set one stage without an Inbound / Previous Status.
                                    </Text>
                                  );
                                }

                                const sections: Array<{
                                  label: string;
                                  node: SysModuleStatusFlowResponse;
                                  colorScheme: string;
                                }> = [];
                                const visited = new Set<string>();

                                const buildSections = (currentCode: string, context: string = "Main Pipeline") => {
                                  if (visited.has(currentCode)) return;
                                  visited.add(currentCode);

                                  const current = flowMap.get(currentCode);
                                  if (!current) return;

                                  const isApprovalNode = current.isConfirmApproval === "Y";
                                  const isFinishNode = current.isFinish === "Y";

                                  let scheme = "blue";
                                  if (isFinishNode) scheme = "green";
                                  else if (isApprovalNode) scheme = "orange";

                                  sections.push({
                                    label: context,
                                    node: current,
                                    colorScheme: scheme,
                                  });

                                  const approvedNext = current.nextCodeStatus
                                    ? flowMap.get(current.nextCodeStatus)
                                    : null;
                                  const declinedBranches = statusFlows.filter(
                                    (f) =>
                                      f.previousCodeStatus === current.codeStatus &&
                                      f.codeStatus !== current.nextCodeStatus
                                  );

                                  if (approvedNext) {
                                    const nextContext = isApprovalNode ? "Approved Path" : context;
                                    buildSections(approvedNext.codeStatus, nextContext);
                                  }

                                  declinedBranches.forEach((declined) => {
                                    buildSections(declined.codeStatus, "Alternative / Reject Path");
                                  });
                                };

                                buildSections(startNode.codeStatus);

                                return (
                                  <VStack align="stretch" spacing={2.5}>
                                    {sections.map((section, idx) => (
                                      <Flex
                                        key={`${section.node.codeStatus}-${idx}`}
                                        p={3}
                                        rounded="md"
                                        align="center"
                                        justify="space-between"
                                        bg={isDark ? "gray.850" : "white"}
                                        border="1px solid"
                                        borderColor={
                                          section.colorScheme === "green"
                                            ? isDark
                                              ? "green.800"
                                              : "green.200"
                                            : section.colorScheme === "orange"
                                            ? isDark
                                              ? "orange.800"
                                              : "orange.200"
                                            : isDark
                                            ? "gray.700"
                                            : "gray.200"
                                        }
                                      >
                                        <HStack spacing={3}>
                                          <Tag
                                            size="sm"
                                            variant="solid"
                                            colorScheme={section.colorScheme}
                                            fontSize="xs"
                                            fontFamily="mono"
                                          >
                                            Step {idx + 1}
                                          </Tag>
                                          <Text fontSize="sm" fontWeight="bold">
                                            {section.node.nameStatus}
                                          </Text>
                                          <Tag size="sm" variant="subtle" fontFamily="mono" fontSize="xs">
                                            {section.node.codeStatus}
                                          </Tag>
                                        </HStack>

                                        <Tag
                                          size="sm"
                                          variant="outline"
                                          colorScheme={
                                            section.label.includes("Approved")
                                               ? "green"
                                               : section.label.includes("Alternative")
                                               ? "red"
                                               : "gray"
                                           }
                                           fontSize="xs"
                                         >
                                           {section.label}
                                         </Tag>
                                       </Flex>
                                     ))}
                                   </VStack>
                                 );
                               })()}
                             </Box>
                           </VStack>
                         </>
                       )}
                     </VStack>
                   </CardBody>
                 </Card>
               </TabPanel>

               {/* TAB 4: Feature & Page Access Matrix */}
               <TabPanel px={0} pt={4}>
                 <Card
                   variant="outline"
                   rounded={radiusStyle}
                   border="1px solid"
                   borderColor={isDark ? "gray.700" : "gray.200"}
                   bg={isDark ? "gray.800" : "white"}
                   shadow="sm"
                 >
                   <CardHeader pb={3}>
                     <Flex
                       direction={{ base: "column", sm: "row" }}
                       justify="space-between"
                       align={{ base: "flex-start", sm: "center" }}
                       gap={3}
                     >
                       <VStack align="flex-start" spacing={0.5}>
                         <Heading size="sm" fontWeight="bold">
                           Feature Contracts & Page Authorization Matrix
                         </Heading>
                         <Text fontSize="sm" color="gray.500">
                           Manage programmatic feature codes, page URLs, and whitelisted organization groups or user accounts.
                         </Text>
                       </VStack>

                       <Button
                         leftIcon={<FiPlus />}
                         colorScheme="blue"
                         size="md"
                         rounded={radiusStyle}
                         onClick={() => handleOpenFeatureModal()}
                       >
                         Add Feature Contract
                       </Button>
                     </Flex>
                   </CardHeader>
                   <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                   <CardBody p={6}>
                     <VStack align="stretch" spacing={6}>
                       {/* Search and Filters */}
                       <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                         <InputGroup maxW={{ base: "100%", md: "400px" }} size="md">
                           <InputLeftElement pointerEvents="none">
                             <FiSearch color="gray" />
                           </InputLeftElement>
                           <Input
                             value={featureSearchQuery}
                             onChange={(e) => setFeatureSearchQuery(e.target.value)}
                             placeholder="Search by feature name, code, or URL..."
                             rounded={radiusStyle}
                             bg={isDark ? "gray.900" : "gray.50"}
                           />
                           {featureSearchQuery && (
                             <InputRightElement>
                               <IconButton
                                 aria-label="Clear search"
                                 icon={<FiX />}
                                 size="xs"
                                 variant="ghost"
                                 onClick={() => setFeatureSearchQuery("")}
                               />
                             </InputRightElement>
                           )}
                         </InputGroup>

                         <HStack spacing={2}>
                           <Tag size="md" colorScheme="purple" variant="subtle" rounded="full">
                             {features.length} Features Defined
                           </Tag>
                         </HStack>
                       </Flex>

                       {/* Features List */}
                       {isLoadingFeatures ? (
                         <VStack py={16} spacing={3}>
                           <Spinner size="lg" color="blue.500" thickness="3px" />
                           <Text fontSize="sm" color="gray.500">
                             Loading feature contracts and access matrix...
                           </Text>
                         </VStack>
                       ) : features.length === 0 ? (
                         <Flex
                           direction="column"
                           justify="center"
                           align="center"
                           py={16}
                           border="1px dashed"
                           borderColor={isDark ? "gray.700" : "gray.300"}
                           rounded={radiusStyle}
                           bg={isDark ? "gray.850" : "gray.50"}
                         >
                           <Box
                             p={4}
                             rounded="full"
                             bg={isDark ? "gray.700" : "gray.200"}
                             color={isDark ? "gray.300" : "gray.600"}
                             mb={3}
                           >
                             <FiShield size={32} />
                           </Box>
                           <Heading size="sm" fontWeight="bold" mb={1}>
                             No Feature Contracts Registered
                           </Heading>
                           <Text fontSize="sm" color="gray.500" maxW="450px" textAlign="center" mb={4}>
                             Register your first system feature contract to configure fine-grained permissions and page URL whitelisting.
                           </Text>
                           <Button
                             leftIcon={<FiPlus />}
                             colorScheme="blue"
                             size="md"
                             rounded={radiusStyle}
                             onClick={() => handleOpenFeatureModal()}
                           >
                             Add Feature Contract
                           </Button>
                         </Flex>
                       ) : (
                         <VStack spacing={5} align="stretch">
                           {features
                             .filter((f) => {
                               if (!featureSearchQuery) return true;
                               const q = featureSearchQuery.toLowerCase();
                               return (
                                 f.featureName.toLowerCase().includes(q) ||
                                 f.featureCode.toLowerCase().includes(q) ||
                                 (f.pageUrl && f.pageUrl.toLowerCase().includes(q)) ||
                                 (f.featureCategory && f.featureCategory.toLowerCase().includes(q))
                               );
                             })
                             .map((feat) => {
                               const isExpanded = expandedFeatureAccordions.has(feat.id);
                               const categoryColor =
                                 feat.featureCategory === "DATA_ACCESS"
                                   ? "blue"
                                   : feat.featureCategory === "ACTION_OVERRIDE"
                                   ? "orange"
                                   : feat.featureCategory === "FIELD_PERMISSION"
                                   ? "purple"
                                   : "teal";

                               return (
                                 <Card
                                   key={feat.id}
                                   variant="outline"
                                   rounded={radiusStyle}
                                   border="1px solid"
                                   borderColor={isDark ? "gray.700" : "gray.200"}
                                   bg={isDark ? "gray.850" : "white"}
                                   shadow="xs"
                                   overflow="hidden"
                                 >
                                   <Box p={4} bg={isDark ? "gray.800" : "gray.50"}>
                                     <Flex
                                       direction={{ base: "column", md: "row" }}
                                       justify="space-between"
                                       align={{ base: "flex-start", md: "center" }}
                                       gap={3}
                                     >
                                       <VStack align="flex-start" spacing={1.5} flex={1}>
                                         <HStack spacing={2} wrap="wrap">
                                           <Tag size="sm" colorScheme={categoryColor} fontWeight="bold">
                                             {feat.featureCategory || "GENERAL"}
                                           </Tag>
                                           <Heading size="xs" fontWeight="bold">
                                             {feat.featureName}
                                           </Heading>
                                           <Tag
                                             size="sm"
                                             variant="solid"
                                             colorScheme="gray"
                                             fontFamily="mono"
                                             fontSize="xs"
                                           >
                                             {feat.featureCode}
                                           </Tag>
                                           <Tag
                                             size="sm"
                                             colorScheme={feat.isActive === "Y" ? "green" : "red"}
                                             variant="subtle"
                                           >
                                             {feat.isActive === "Y" ? "ACTIVE" : "INACTIVE"}
                                           </Tag>
                                         </HStack>

                                         {feat.pageUrl && (
                                           <HStack spacing={1.5} color="gray.500" fontSize="xs">
                                             <FiFolder size={13} />
                                             <Text fontWeight="medium" color={isDark ? "blue.300" : "blue.600"}>
                                               {feat.pageUrl}
                                             </Text>
                                           </HStack>
                                         )}

                                         {feat.descriptions && (
                                           <Text fontSize="xs" color="gray.500">
                                             {feat.descriptions}
                                           </Text>
                                         )}
                                       </VStack>

                                       <HStack spacing={2} alignSelf={{ base: "flex-end", md: "center" }}>
                                         <Button
                                           size="xs"
                                           leftIcon={<FiEdit />}
                                           variant="outline"
                                           colorScheme="blue"
                                           onClick={() => handleOpenFeatureModal(feat)}
                                         >
                                           Edit
                                         </Button>
                                         <IconButton
                                           aria-label="Delete feature"
                                           icon={<FiTrash2 />}
                                           size="xs"
                                           variant="ghost"
                                           colorScheme="red"
                                           onClick={() => {
                                             if (!isDevMode) {
                                               handleOpenPinModal();
                                               return;
                                             }
                                             triggerActionWithPin(
                                               "Konfirmasi Hapus Feature Contract",
                                               `Hapus feature contract "${feat.featureCode}" (${feat.featureName}) beserta seluruh data whitelist (${feat.whitelists?.length || 0} entitas)? Tindakan ini tidak dapat dibatalkan.`,
                                               "Hapus Feature",
                                               "red",
                                               async () => {
                                                 const response = await DeleteFeature(feat.id, tokenData);
                                                 if (response?.statusCode === RES_CODE_OK) {
                                                   showToast({
                                                     description: `Feature ${feat.featureCode} berhasil dihapus`,
                                                     statusToast: "success",
                                                   });
                                                   fetchFeatures();
                                                 } else {
                                                   showToast({
                                                     description: response?.message || RES_GENERIC_ERROR_MSG,
                                                     statusToast: "error",
                                                   });
                                                 }
                                               }
                                             );
                                           }}
                                         />
                                       </HStack>
                                     </Flex>
                                   </Box>

                                   <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                                   {/* Whitelist Panel */}
                                   <Box p={4}>
                                     <Flex justify="space-between" align="center" mb={3}>
                                       <HStack spacing={2} cursor="pointer" onClick={() => toggleFeatureAccordion(feat.id)}>
                                         {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                         <Text fontSize="sm" fontWeight="bold">
                                           Whitelisted Principals ({feat.whitelists?.length || 0})
                                         </Text>
                                       </HStack>

                                       <Button
                                         size="xs"
                                         leftIcon={<FiPlus />}
                                         colorScheme="purple"
                                         onClick={() => handleOpenWhitelistModal(feat)}
                                       >
                                         Add Target
                                       </Button>
                                     </Flex>

                                     {isExpanded && (
                                       <Box>
                                         {!feat.whitelists || feat.whitelists.length === 0 ? (
                                           <Box
                                             py={6}
                                             textAlign="center"
                                             rounded="md"
                                             border="1px dashed"
                                             borderColor={isDark ? "gray.700" : "gray.200"}
                                             bg={isDark ? "gray.900" : "gray.50"}
                                           >
                                             <Text fontSize="xs" color="gray.500">
                                               No organization group or user whitelisted yet. Click "+ Add Target" to bind access.
                                             </Text>
                                           </Box>
                                         ) : (
                                           <VStack spacing={2} align="stretch">
                                             {feat.whitelists.map((wl) => (
                                               <HStack
                                                 key={wl.id}
                                                 p={2.5}
                                                 bg={isDark ? "gray.900" : "gray.50"}
                                                 border="1px solid"
                                                 borderColor={isDark ? "gray.700" : "gray.200"}
                                                 rounded="md"
                                                 justify="space-between"
                                                 wrap="wrap"
                                                 gap={2}
                                               >
                                                 <HStack spacing={3} flex={1} minW="220px">
                                                   <Tag
                                                     size="sm"
                                                     colorScheme={wl.principalType === "ORG_GROUP" ? "purple" : "teal"}
                                                     fontWeight="bold"
                                                   >
                                                     {wl.principalType === "ORG_GROUP" ? "ORG GROUP" : "USER UIM"}
                                                   </Tag>

                                                   <VStack align="flex-start" spacing={0}>
                                                     <Text fontSize="sm" fontWeight="semibold">
                                                       {wl.principalType === "ORG_GROUP"
                                                         ? `${wl.orgCode || "-"} - ${wl.orgName || "Organization"}`
                                                         : `${wl.userName || "User"} (${wl.userId || "-"})`}
                                                     </Text>
                                                     {wl.principalType === "USER" && wl.userGroupKerja && (
                                                       <Text fontSize="xs" color="gray.500">
                                                         {wl.userGroupKerja}
                                                       </Text>
                                                     )}
                                                     {wl.remarks && (
                                                       <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                         Note: {wl.remarks}
                                                       </Text>
                                                     )}
                                                   </VStack>
                                                 </HStack>

                                                 <HStack spacing={3}>
                                                   <Tag size="sm" variant="subtle" colorScheme="green" fontWeight="bold">
                                                     {wl.accessLevel || "ALLOW"}
                                                   </Tag>

                                                   <IconButton
                                                     aria-label="Remove whitelist"
                                                     icon={<FiTrash2 />}
                                                     size="xs"
                                                     colorScheme="red"
                                                     variant="ghost"
                                                     onClick={() => {
                                                       if (!isDevMode) {
                                                         handleOpenPinModal();
                                                         return;
                                                       }
                                                       const targetName =
                                                         wl.principalType === "ORG_GROUP"
                                                           ? `${wl.orgCode || ""} - ${wl.orgName || "Org Group"}`
                                                           : `${wl.userName || "User"} (${wl.userId || ""})`;

                                                       triggerActionWithPin(
                                                         "Konfirmasi Cabut Whitelist",
                                                         `Cabut hak akses whitelist untuk ${wl.principalType === "ORG_GROUP" ? "Org Group" : "User"} [${targetName}]?`,
                                                         "Cabut Akses",
                                                         "red",
                                                         () => handleRemoveWhitelist(wl.id)
                                                       );
                                                     }}
                                                   />
                                                 </HStack>
                                               </HStack>
                                             ))}
                                           </VStack>
                                         )}
                                       </Box>
                                     )}
                                   </Box>
                                 </Card>
                               );
                             })}
                         </VStack>
                       )}
                     </VStack>
                   </CardBody>
                 </Card>
               </TabPanel>
             </TabPanels>
           </Tabs>
         </VStack>
       </Box>

       {/* Add / Edit Feature Contract Modal */}
       <Modal
         isOpen={isFeatureModalOpen}
         onClose={() => setIsFeatureModalOpen(false)}
         size="lg"
         isCentered
       >
         <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
         <ModalContent mx={4} rounded={radiusStyle} shadow="2xl" bg={isDark ? "gray.850" : "white"}>
           <ModalHeader fontSize="md" fontWeight="bold" borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
             <HStack spacing={2}>
               <FiShield color="#805AD5" />
               <Text>{editingFeature ? "Edit Feature Contract" : "Register Feature Contract"}</Text>
             </HStack>
           </ModalHeader>
           <ModalCloseButton />

           <ModalBody py={6}>
             <VStack spacing={4} align="stretch">
               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Feature Code (Contract Identifier)
                 </FormLabel>
                 <Input
                   value={featureForm.featureCode}
                   onChange={(e) =>
                     setFeatureForm({
                       ...featureForm,
                       featureCode: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                     })
                   }
                   placeholder="e.g., ALL_ACCESS, FULL_OVERRIDE, RTO_EDIT"
                   fontFamily="mono"
                   size="md"
                 />
               </FormControl>

               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Feature Name
                 </FormLabel>
                 <Input
                   value={featureForm.featureName}
                   onChange={(e) => setFeatureForm({ ...featureForm, featureName: e.target.value })}
                   placeholder="e.g., Bypass Org Group Filter Lockdown"
                   size="md"
                 />
               </FormControl>

               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Target Page URL
                 </FormLabel>
                 <Input
                   value={featureForm.pageUrl}
                   onChange={(e) => setFeatureForm({ ...featureForm, pageUrl: e.target.value })}
                   placeholder="e.g., /report/apps-assessments/detail"
                   size="md"
                 />
               </FormControl>

               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Feature Category
                 </FormLabel>
                 <Select
                   value={featureForm.featureCategory}
                   onChange={(e) => setFeatureForm({ ...featureForm, featureCategory: e.target.value })}
                   size="md"
                 >
                   <option value="DATA_ACCESS">DATA_ACCESS (Data Filtering & Visibility)</option>
                   <option value="ACTION_OVERRIDE">ACTION_OVERRIDE (Actions, Buttons & Overrides)</option>
                   <option value="FIELD_PERMISSION">FIELD_PERMISSION (Granular Field Edits)</option>
                   <option value="GENERAL">GENERAL (General Purpose Feature)</option>
                 </Select>
               </FormControl>

               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Description
                 </FormLabel>
                 <Textarea
                   value={featureForm.descriptions}
                   onChange={(e) => setFeatureForm({ ...featureForm, descriptions: e.target.value })}
                   placeholder="Explain what authority or bypass this feature grants..."
                   rows={3}
                   size="md"
                 />
               </FormControl>

               <FormControl>
                 <Checkbox
                   isChecked={featureForm.isActive === "Y"}
                   onChange={(e) =>
                     setFeatureForm({
                       ...featureForm,
                       isActive: e.target.checked ? "Y" : "N",
                     })
                   }
                   colorScheme="green"
                   size="md"
                 >
                   <Text fontSize="sm" fontWeight="semibold">
                     Feature Contract is Active
                   </Text>
                 </Checkbox>
               </FormControl>

               {/* Security PIN Confirmation for Feature */}
               <Box
                 w="full"
                 p={3.5}
                 bg={isDark ? "gray.900" : "gray.50"}
                 borderRadius="md"
                 border="1px solid"
                 borderColor={isDark ? "purple.800" : "purple.100"}
               >
                 <FormControl isRequired isInvalid={!!featurePinError}>
                   <FormLabel
                     fontSize="sm"
                     fontWeight="semibold"
                     color={isDark ? "purple.300" : "purple.700"}
                     mb={1}
                   >
                     Konfirmasi Security Passkey PIN
                   </FormLabel>
                   <InputGroup size="md">
                     <InputLeftElement pointerEvents="none">
                       <Icon as={FiKey} color="purple.400" />
                     </InputLeftElement>
                     <Input
                       type={showFeaturePin ? "text" : "password"}
                       placeholder="Masukkan 6-digit Passkey PIN konfirmasi"
                       value={featurePinInput}
                       onChange={(e) => {
                         setFeaturePinInput(e.target.value);
                         if (featurePinError) setFeaturePinError(null);
                       }}
                       letterSpacing={showFeaturePin ? "normal" : "widest"}
                       borderColor={featurePinError ? "red.400" : undefined}
                       bg={isDark ? "gray.800" : "white"}
                     />
                     <InputRightElement>
                       <IconButton
                         aria-label="Toggle password view"
                         icon={showFeaturePin ? <FiEyeOff /> : <FiEye />}
                         size="sm"
                         variant="ghost"
                         onClick={() => setShowFeaturePin(!showFeaturePin)}
                       />
                     </InputRightElement>
                   </InputGroup>
                   {featurePinError && (
                     <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                       {featurePinError}
                     </Text>
                   )}
                 </FormControl>
               </Box>
             </VStack>
           </ModalBody>

           <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
           <ModalFooter py={3}>
             <Button variant="ghost" mr={3} size="md" rounded={radiusStyle} onClick={() => setIsFeatureModalOpen(false)}>
               Cancel
             </Button>
             <Button
               colorScheme="blue"
               size="md"
               rounded={radiusStyle}
               onClick={handleSaveFeature}
               isLoading={isSavingFeature}
               px={5}
             >
               {editingFeature ? "Update Feature" : "Register Feature"}
             </Button>
           </ModalFooter>
         </ModalContent>
       </Modal>

       {/* Add Whitelist Target Modal */}
       <Modal
         isOpen={isWhitelistModalOpen}
         onClose={() => setIsWhitelistModalOpen(false)}
         size="lg"
         isCentered
       >
         <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
         <ModalContent mx={4} rounded={radiusStyle} shadow="2xl" bg={isDark ? "gray.850" : "white"}>
           <ModalHeader fontSize="md" fontWeight="bold" borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
             <HStack spacing={2}>
               <FiUsers color="#805AD5" />
               <Text>
                 Add Whitelist Target: {targetFeatureForWhitelist?.featureCode}
               </Text>
             </HStack>
           </ModalHeader>
           <ModalCloseButton />

           <ModalBody py={6}>
             <VStack spacing={4} align="stretch">
               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Target Principal Type
                 </FormLabel>
                 <HStack spacing={4}>
                   <Button
                     size="sm"
                     variant={whitelistForm.principalType === "ORG_GROUP" ? "solid" : "outline"}
                     colorScheme="purple"
                     onClick={() => setWhitelistForm({ ...whitelistForm, principalType: "ORG_GROUP", userSysId: "" })}
                   >
                     Organization Group
                   </Button>
                   <Button
                     size="sm"
                     variant={whitelistForm.principalType === "USER" ? "solid" : "outline"}
                     colorScheme="teal"
                     onClick={() => setWhitelistForm({ ...whitelistForm, principalType: "USER", orgGroupId: "" })}
                   >
                     Individual User (UIM)
                   </Button>
                 </HStack>
               </FormControl>

               {/* Target Selection: ORG_GROUP */}
               {whitelistForm.principalType === "ORG_GROUP" && (
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold">
                     Select Organization Group
                   </FormLabel>
                   <Input
                     mb={2}
                     size="sm"
                     placeholder="Filter organizations by code or name..."
                     value={orgSearchQuery}
                     onChange={(e) => setOrgSearchQuery(e.target.value)}
                   />
                   <Select
                     value={whitelistForm.orgGroupId}
                     onChange={(e) => setWhitelistForm({ ...whitelistForm, orgGroupId: e.target.value })}
                     placeholder="-- Choose Organization --"
                     size="md"
                   >
                     {organizationsList
                       .filter((org) => {
                         if (!orgSearchQuery) return true;
                         const q = orgSearchQuery.toLowerCase();
                         return (
                           org.orgCode.toLowerCase().includes(q) ||
                           org.orgName.toLowerCase().includes(q)
                         );
                       })
                       .map((org) => (
                         <option key={org.id} value={org.id}>
                           {org.orgCode} - {org.orgName} ({org.orgType || "ORG"})
                         </option>
                       ))}
                   </Select>
                 </FormControl>
               )}

               {/* Target Selection: USER */}
               {whitelistForm.principalType === "USER" && (
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold">
                     Search and Select User
                   </FormLabel>
                   <InputGroup size="md">
                     <InputLeftElement pointerEvents="none">
                       <FiSearch color="gray" />
                     </InputLeftElement>
                     <Input
                       value={wlUserSearchQuery}
                       onChange={(e) => handleSearchWlUsers(e.target.value)}
                       placeholder="Search user by name or ID..."
                     />
                   </InputGroup>

                   {wlUserSearchQuery.length >= 2 && (
                     <Box
                       mt={2}
                       maxH="150px"
                       overflowY="auto"
                       border="1px solid"
                       borderColor={isDark ? "gray.700" : "gray.200"}
                       rounded="md"
                       bg={isDark ? "gray.900" : "gray.50"}
                     >
                       {isSearchingWlUsers ? (
                         <VStack py={4}>
                           <Spinner size="sm" color="teal.500" />
                           <Text fontSize="xs" color="gray.500">
                             Searching users...
                           </Text>
                         </VStack>
                       ) : wlUserSearchResults.length > 0 ? (
                         <VStack spacing={0} align="stretch">
                           {wlUserSearchResults.map((user) => {
                             const isSelected = whitelistForm.userSysId === user.id;
                             return (
                               <HStack
                                 key={user.id}
                                 p={2}
                                 cursor="pointer"
                                 bg={isSelected ? (isDark ? "teal.900" : "teal.50") : undefined}
                                 _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                                 onClick={() => setWhitelistForm({ ...whitelistForm, userSysId: user.id })}
                                 justify="space-between"
                               >
                                 <HStack spacing={2.5}>
                                   <Avatar name={user.nama} size="xs" src={user.profilePict || undefined} />
                                   <VStack align="flex-start" spacing={0}>
                                     <Text fontSize="xs" fontWeight="bold">
                                       {user.nama}
                                     </Text>
                                     <Text fontSize="2xs" color="gray.500">
                                       {user.userId} • {user.namaGroupKerja || user.namaUnitKerja || "-"}
                                     </Text>
                                   </VStack>
                                 </HStack>
                                 {isSelected && <Tag size="sm" colorScheme="teal">Selected</Tag>}
                               </HStack>
                             );
                           })}
                         </VStack>
                       ) : (
                         <Text textAlign="center" fontSize="xs" color="gray.500" py={3}>
                           No users matched.
                         </Text>
                       )}
                     </Box>
                   )}
                 </FormControl>
               )}

               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Access Level
                 </FormLabel>
                 <Select
                   value={whitelistForm.accessLevel}
                   onChange={(e) => setWhitelistForm({ ...whitelistForm, accessLevel: e.target.value })}
                   size="md"
                 >
                   <option value="ALLOW">ALLOW (Standard Feature Authorization)</option>
                   <option value="FULL">FULL (Full Access & Override Control)</option>
                   <option value="READ_ALL">READ_ALL (Bypass Filter / View All Datasets)</option>
                   <option value="WRITE">WRITE (Direct Field Editing Authority)</option>
                 </Select>
               </FormControl>

               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold">
                   Remarks / Justification
                 </FormLabel>
                 <Input
                   value={whitelistForm.remarks}
                   onChange={(e) => setWhitelistForm({ ...whitelistForm, remarks: e.target.value })}
                   placeholder="e.g., Audit role exception per IT security memo"
                   size="md"
                 />
               </FormControl>

               {/* Security PIN Confirmation for Whitelist */}
               <Box
                 w="full"
                 p={3.5}
                 bg={isDark ? "gray.900" : "gray.50"}
                 borderRadius="md"
                 border="1px solid"
                 borderColor={isDark ? "purple.800" : "purple.100"}
               >
                 <FormControl isRequired isInvalid={!!whitelistPinError}>
                   <FormLabel
                     fontSize="sm"
                     fontWeight="semibold"
                     color={isDark ? "purple.300" : "purple.700"}
                     mb={1}
                   >
                     Konfirmasi Security Passkey PIN
                   </FormLabel>
                   <InputGroup size="md">
                     <InputLeftElement pointerEvents="none">
                       <Icon as={FiKey} color="purple.400" />
                     </InputLeftElement>
                     <Input
                       type={showWhitelistPin ? "text" : "password"}
                       placeholder="Masukkan 6-digit Passkey PIN konfirmasi"
                       value={whitelistPinInput}
                       onChange={(e) => {
                         setWhitelistPinInput(e.target.value);
                         if (whitelistPinError) setWhitelistPinError(null);
                       }}
                       letterSpacing={showWhitelistPin ? "normal" : "widest"}
                       borderColor={whitelistPinError ? "red.400" : undefined}
                       bg={isDark ? "gray.800" : "white"}
                     />
                     <InputRightElement>
                       <IconButton
                         aria-label="Toggle password view"
                         icon={showWhitelistPin ? <FiEyeOff /> : <FiEye />}
                         size="sm"
                         variant="ghost"
                         onClick={() => setShowWhitelistPin(!showWhitelistPin)}
                       />
                     </InputRightElement>
                   </InputGroup>
                   {whitelistPinError && (
                     <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                       {whitelistPinError}
                     </Text>
                   )}
                 </FormControl>
               </Box>
             </VStack>
           </ModalBody>

           <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
           <ModalFooter py={3}>
             <Button variant="ghost" mr={3} size="md" rounded={radiusStyle} onClick={() => setIsWhitelistModalOpen(false)}>
               Cancel
             </Button>
             <Button
               colorScheme="purple"
               size="md"
               rounded={radiusStyle}
               onClick={handleSaveWhitelist}
               isLoading={isSavingWhitelist}
               px={5}
             >
               Add Whitelist Target
             </Button>
           </ModalFooter>
         </ModalContent>
       </Modal>

      {/* Add / Edit Status Flow Modal */}
      <Modal
        isOpen={isStatusFlowModalOpen}
        onClose={() => {
          setIsStatusFlowModalOpen(false);
          setUserApprovers([]);
          setUserSearchQuery("");
          setUserSearchResults([]);
        }}
        size={statusFlowForm.isConfirmApproval === "Y" ? "4xl" : "xl"}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent mx={4} rounded={radiusStyle} shadow="2xl" bg={isDark ? "gray.850" : "white"}>
          <ModalHeader fontSize="md" fontWeight="bold" borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack spacing={2}>
              <FiGitBranch color="#3182CE" />
              <Text>{editingStatusFlow ? "Edit Status Stage" : "Register New Status Stage"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <SimpleGrid columns={statusFlowForm.isConfirmApproval === "Y" ? { base: 1, lg: 2 } : 1} spacing={6}>
              {/* Left Column: Form Controls */}
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Status Name & System Identifier
                  </FormLabel>
                  <Input
                    value={statusFlowForm.nameStatus}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setStatusFlowForm({
                        ...statusFlowForm,
                        nameStatus: value,
                        codeStatus: value,
                      });
                    }}
                    placeholder="e.g., TECH_REVIEW_PENDING"
                    size="md"
                    fontFamily="mono"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Stage Description
                  </FormLabel>
                  <Textarea
                    value={statusFlowForm.descriptions}
                    onChange={(e) => setStatusFlowForm({ ...statusFlowForm, descriptions: e.target.value })}
                    placeholder="Describe condition and criteria for this status stage..."
                    rows={3}
                    size="md"
                  />
                </FormControl>

                <Box
                  p={3.5}
                  rounded="md"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.900" : "gray.50"}
                >
                  <VStack align="stretch" spacing={3}>
                    <FormControl>
                      <Checkbox
                        isChecked={statusFlowForm.isConfirmApproval === "Y"}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStatusFlowForm({
                            ...statusFlowForm,
                            isConfirmApproval: checked ? "Y" : "N",
                          });
                          if (checked && editingStatusFlow?.id) {
                            fetchUserApprovers(editingStatusFlow.id);
                          } else {
                            setUserApprovers([]);
                          }
                        }}
                        colorScheme="orange"
                        size="md"
                      >
                        <Text fontSize="sm" fontWeight="semibold">
                          Requires Approval Matrix Gate?
                        </Text>
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        isChecked={statusFlowForm.isFinish === "Y"}
                        onChange={(e) =>
                          setStatusFlowForm({
                            ...statusFlowForm,
                            isFinish: e.target.checked ? "Y" : "N",
                            nextCodeStatus: e.target.checked ? "" : statusFlowForm.nextCodeStatus,
                          })
                        }
                        colorScheme="green"
                        size="md"
                      >
                        <Text fontSize="sm" fontWeight="semibold">
                          Is Terminal Finish State?
                        </Text>
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        isChecked={statusFlowForm.isDisplayOnChoice === "Y"}
                        onChange={(e) =>
                          setStatusFlowForm({
                            ...statusFlowForm,
                            isDisplayOnChoice: e.target.checked ? "Y" : "N",
                          })
                        }
                        colorScheme="blue"
                        size="md"
                      >
                        <Text fontSize="sm" fontWeight="semibold">
                          Display On Dropdown Selection?
                        </Text>
                      </Checkbox>
                    </FormControl>
                  </VStack>
                </Box>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Inbound Transition (Previous Status)
                  </FormLabel>
                  <Select
                    value={statusFlowForm.previousCodeStatus}
                    onChange={(e) => setStatusFlowForm({ ...statusFlowForm, previousCodeStatus: e.target.value })}
                    placeholder="None (Root Entry Stage)"
                    size="md"
                  >
                    {statusFlows
                      .filter((f) => f.id !== editingStatusFlow?.id)
                      .map((flow) => (
                        <option key={flow.id} value={flow.codeStatus}>
                          {flow.nameStatus} ({flow.codeStatus})
                        </option>
                      ))}
                  </Select>
                </FormControl>

                {statusFlowForm.isFinish === "N" && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Outbound Transition (Next / Approved Path)
                    </FormLabel>
                    <Select
                      value={statusFlowForm.nextCodeStatus}
                      onChange={(e) => setStatusFlowForm({ ...statusFlowForm, nextCodeStatus: e.target.value })}
                      placeholder="Select next stage"
                      size="md"
                    >
                      {statusFlows
                        .filter((f) => f.id !== editingStatusFlow?.id)
                        .map((flow) => (
                          <option key={flow.id} value={flow.codeStatus}>
                            {flow.nameStatus} ({flow.codeStatus})
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                )}

                {/* Security PIN Confirmation for Status Flow */}
                <Box
                  w="full"
                  p={3.5}
                  bg={isDark ? "gray.900" : "gray.50"}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={isDark ? "purple.800" : "purple.100"}
                >
                  <FormControl isRequired isInvalid={!!statusFlowPinError}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="semibold"
                      color={isDark ? "purple.300" : "purple.700"}
                      mb={1}
                    >
                      Konfirmasi Security Passkey PIN
                    </FormLabel>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiKey} color="purple.400" />
                      </InputLeftElement>
                      <Input
                        type={showStatusFlowPin ? "text" : "password"}
                        placeholder="Masukkan 6-digit Passkey PIN konfirmasi"
                        value={statusFlowPinInput}
                        onChange={(e) => {
                          setStatusFlowPinInput(e.target.value);
                          if (statusFlowPinError) setStatusFlowPinError(null);
                        }}
                        letterSpacing={showStatusFlowPin ? "normal" : "widest"}
                        borderColor={statusFlowPinError ? "red.400" : undefined}
                        bg={isDark ? "gray.800" : "white"}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Toggle password view"
                          icon={showStatusFlowPin ? <FiEyeOff /> : <FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowStatusFlowPin(!showStatusFlowPin)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {statusFlowPinError && (
                      <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                        {statusFlowPinError}
                      </Text>
                    )}
                  </FormControl>
                </Box>
              </VStack>

              {/* Right Column: User Approver Selection (Only when requires approval) */}
              {statusFlowForm.isConfirmApproval === "Y" && (
                <VStack
                  align="stretch"
                  spacing={4}
                  p={4}
                  rounded="md"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.900" : "gray.50"}
                >
                  <VStack align="flex-start" spacing={0}>
                    <Heading size="sm" fontWeight="bold">
                      Designated Approvers Matrix
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      Search and bind authorized users who can approve items at this stage.
                    </Text>
                  </VStack>

                  {/* Search Input */}
                  <FormControl>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray" />
                      </InputLeftElement>
                      <Input
                        value={userSearchQuery}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                        placeholder="Search user by Name or ID..."
                        bg={isDark ? "gray.800" : "white"}
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Search Results Dropdown/Box */}
                  {userSearchQuery.length >= 2 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                        Search Results
                      </Text>
                      <Box
                        maxH="140px"
                        overflowY="auto"
                        border="1px solid"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        rounded="md"
                        bg={isDark ? "gray.800" : "white"}
                      >
                        {isSearchingUsers ? (
                          <VStack py={4}>
                            <Spinner size="sm" color="blue.500" />
                            <Text fontSize="xs" color="gray.500">
                              Searching directory...
                            </Text>
                          </VStack>
                        ) : userSearchResults.length > 0 ? (
                          <VStack spacing={0} align="stretch">
                            {userSearchResults.map((user) => {
                              const isAlreadyAdded = userApprovers.some((a) => a.userSysId === user.id);
                              return (
                                <HStack
                                  key={user.id}
                                  p={2}
                                  spacing={2.5}
                                  cursor={isAlreadyAdded ? "not-allowed" : "pointer"}
                                  opacity={isAlreadyAdded ? 0.5 : 1}
                                  _hover={
                                    !isAlreadyAdded
                                      ? {
                                          bg: isDark ? "gray.700" : "gray.100",
                                        }
                                      : {}
                                  }
                                  onClick={() => {
                                    if (isAlreadyAdded) return;
                                    if (editingStatusFlow?.id) {
                                      triggerActionWithPin(
                                        "Konfirmasi Tambah Approver",
                                        `Tambahkan ${user.nama} (${user.userId}) sebagai approver untuk stage "${editingStatusFlow.nameStatus}"?`,
                                        "Tambah Approver",
                                        "blue",
                                        () => handleAddUserApprover(user)
                                      );
                                    } else {
                                      handleAddUserApprover(user);
                                    }
                                  }}
                                  borderBottom="1px solid"
                                  borderColor={isDark ? "gray.700" : "gray.100"}
                                >
                                  <Avatar name={user.nama} size="xs" src={user.profilePict || undefined} />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="semibold">
                                      {user.nama}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                      {user.userId}
                                    </Text>
                                  </VStack>
                                  {isAlreadyAdded && (
                                    <Tag size="sm" colorScheme="green" fontSize="xs">
                                      Bound
                                    </Tag>
                                  )}
                                </HStack>
                              );
                            })}
                          </VStack>
                        ) : (
                          <Text textAlign="center" fontSize="sm" color="gray.500" py={4}>
                            No users found.
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Bound Approvers List */}
                  <Box flex={1}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Assigned Approvers
                      </Text>
                      <Tag size="sm" colorScheme="orange" fontSize="xs" fontFamily="mono">
                        {userApprovers.length} Selected
                      </Tag>
                    </HStack>

                    <Box
                      maxH="200px"
                      overflowY="auto"
                      border="1px solid"
                      borderColor={isDark ? "gray.700" : "gray.200"}
                      rounded="md"
                      p={2}
                      bg={isDark ? "gray.850" : "white"}
                    >
                      {userApprovers.length === 0 ? (
                        <Text textAlign="center" fontSize="sm" color="gray.500" py={6}>
                          No approvers assigned to this approval gate yet.
                        </Text>
                      ) : (
                        <VStack spacing={2} align="stretch">
                          {userApprovers.map((approver) => (
                            <HStack
                              key={approver.id}
                              p={2}
                              bg={isDark ? "gray.800" : "gray.50"}
                              rounded="md"
                              border="1px solid"
                              borderColor={isDark ? "gray.700" : "gray.200"}
                              justify="space-between"
                            >
                              <HStack spacing={2.5}>
                                <Avatar
                                  name={approver.userData?.nama || "User"}
                                  size="xs"
                                  src={approver.userData?.profilePict || undefined}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="semibold">
                                    {approver.userData?.nama || "Unknown User"}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                    {approver.userData?.userId || approver.userSysId}
                                  </Text>
                                </VStack>
                              </HStack>

                              <IconButton
                                aria-label="Remove approver"
                                icon={<FiTrash2 />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (editingStatusFlow?.id) {
                                    triggerActionWithPin(
                                      "Konfirmasi Hapus Approver",
                                      `Hapus approver ${approver.userData?.nama || "ini"} dari daftar approval gate?`,
                                      "Hapus Approver",
                                      "red",
                                      () => handleRemoveUserApprover(approver.id)
                                    );
                                  } else {
                                    handleRemoveUserApprover(approver.id);
                                  }
                                }}
                              />
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </VStack>
              )}
            </SimpleGrid>
          </ModalBody>

          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
          <ModalFooter py={3}>
            <Button variant="ghost" mr={3} size="md" rounded={radiusStyle} onClick={() => setIsStatusFlowModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              size="md"
              rounded={radiusStyle}
              onClick={handleSaveStatusFlow}
              isLoading={isSavingStatusFlow}
              px={5}
            >
              {editingStatusFlow ? "Update Stage" : "Create Stage"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── UNIVERSAL ACTION PIN CONFIRMATION MODAL ─── */}
      <Modal
        isOpen={actionPinModalOpen}
        onClose={() => {
          if (!actionPinLoading) {
            setActionPinModalOpen(false);
            setPendingActionFn(null);
            setActionPinInput("");
            setActionPinError(null);
          }
        }}
        size="md"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          borderRadius={radiusStyle}
          mx={4}
        >
          <ModalHeader pb={2}>
            <HStack spacing={2.5}>
              <Icon
                as={actionPinColorScheme === "red" ? FiAlertTriangle : FiKey}
                color={`${actionPinColorScheme}.400`}
                boxSize={5}
              />
              <Heading size="sm">{actionPinTitle || "Konfirmasi Tindakan Keamanan"}</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={actionPinLoading} />
          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

          <form onSubmit={handleActionPinSubmit}>
            <ModalBody py={5}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>
                  {actionPinDescription || "Masukkan Security Passkey PIN untuk mengonfirmasi operasi ini."}
                </Text>

                <Box
                  p={3.5}
                  bg={isDark ? "gray.900" : "gray.50"}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={isDark ? "purple.800" : "purple.100"}
                >
                  <FormControl isRequired isInvalid={!!actionPinError}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="semibold"
                      color={isDark ? "purple.300" : "purple.700"}
                      mb={1}
                    >
                      Security Passkey PIN (6-Digit)
                    </FormLabel>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiKey} color="purple.400" />
                      </InputLeftElement>
                      <Input
                        type={showActionPin ? "text" : "password"}
                        placeholder="Masukkan 6-digit Passkey PIN"
                        value={actionPinInput}
                        onChange={(e) => {
                          setActionPinInput(e.target.value);
                          if (actionPinError) setActionPinError(null);
                        }}
                        autoFocus
                        letterSpacing={showActionPin ? "normal" : "widest"}
                        borderColor={actionPinError ? "red.400" : undefined}
                        bg={isDark ? "gray.800" : "white"}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Toggle password view"
                          icon={showActionPin ? <FiEyeOff /> : <FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowActionPin(!showActionPin)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {actionPinError && (
                      <Text fontSize="sm" color="red.500" mt={1.5} fontWeight="600">
                        {actionPinError}
                      </Text>
                    )}
                  </FormControl>
                </Box>
              </VStack>
            </ModalBody>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
            <ModalFooter py={3}>
              <Button
                variant="ghost"
                mr={3}
                size="md"
                isDisabled={actionPinLoading}
                onClick={() => {
                  setActionPinModalOpen(false);
                  setPendingActionFn(null);
                  setActionPinInput("");
                  setActionPinError(null);
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                colorScheme={actionPinColorScheme}
                size="md"
                isLoading={actionPinLoading}
                px={5}
                rounded={radiusStyle}
              >
                {actionPinBtnText || "Konfirmasi"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* ─── DEVELOPER MODE AUTH PIN MODAL ─── */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent
          bg={isDark ? "gray.850" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          borderRadius={radiusStyle}
          mx={4}
        >
          <ModalHeader pb={2}>
            <HStack spacing={2.5}>
              <Icon as={FiTerminal} color="purple.400" boxSize={5} />
              <Heading size="sm">Developer Security Verification</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

          <form onSubmit={handleUnlockSubmit}>
            <ModalBody py={5}>
              <VStack spacing={4} align="stretch">
                <Box
                  p={3}
                  bg={isDark ? "purple.950" : "purple.50"}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={isDark ? "purple.800" : "purple.200"}
                >
                  <Text fontSize="xs" color={isDark ? "purple.200" : "purple.800"} lineHeight="tall">
                    Fitur konfigurasi teknis & mutasi modul sistem dilindungi oleh protokol keamanan internal.
                    Masukkan 6-digit Passkey PIN otorisasi untuk membuka Developer Mode.
                  </Text>
                </Box>

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
                rounded={radiusStyle}
              >
                Buka Kunci Developer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

export default SysModuleGroupDetailView;
