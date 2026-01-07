"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import InvalidLoadPageView from "@/app/components/InvalidLoadPageView";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMenus, {
  MenuResponse,
  MenuInsertPayload,
  MenuUpdatePayload,
} from "@/app/services/useMenus";
import { LinkItems, LinkItemProps } from "@/app/constants/menuApplication";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  VStack,
  Wrap,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  useToast,
  Select,
  Switch,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiFrown,
  FiRefreshCcw,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiChevronRight,
  FiCloud,
} from "react-icons/fi";
import * as FiIcons from "react-icons/fi";
import * as BiIcons from "react-icons/bi";
import * as MdIcons from "react-icons/md";

import { IconType } from "react-icons";
import { AiOutlineVideoCamera, AiOutlineVideoCameraAdd } from "react-icons/ai";
import { BiAnalyse, BiSolidReport } from "react-icons/bi";
import {
  BsChatDots,
  BsCloudUpload,
  BsDatabaseGear,
  BsRocketTakeoff,
} from "react-icons/bs";
import { CiMobile2, CiMoneyCheck1 } from "react-icons/ci";
import {
  FaChess,
  FaCode,
  FaDraftingCompass,
  FaRegHeart,
  FaRegStar,
  FaVial,
} from "react-icons/fa";
import { FaDiagramProject, FaO, FaUsersRays } from "react-icons/fa6";
import {
  FiDatabase,
  FiKey,
  FiLayers,
  FiUmbrella,
  FiUpload,
  FiUsers,
} from "react-icons/fi";
import { GrHelpBook } from "react-icons/gr";
import {
  HiOutlineDesktopComputer,
  HiOutlineDocumentReport,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { ImUserTie } from "react-icons/im";
import { IoIosCodeDownload, IoMdBookmarks } from "react-icons/io";
import {
  IoCalendarNumberOutline,
  IoCalendarOutline,
  IoChatbubblesOutline,
  IoKeyOutline,
} from "react-icons/io5";
import { LiaFileContractSolid } from "react-icons/lia";
import { LuBookHeart, LuServer } from "react-icons/lu";
import {
  MdChangeHistory,
  MdOutlineCircle,
  MdOutlineCode,
  MdOutlinePermMedia,
  MdOutlineSystemUpdateAlt,
  MdOutlineWorkOutline,
  MdWebAsset,
} from "react-icons/md";
import { PiCertificate, PiFlowArrow } from "react-icons/pi";
import {
  RiApps2AiLine,
  RiCodeBlock,
  RiMegaphoneLine,
  RiOrganizationChart,
} from "react-icons/ri";
import { RxActivityLog } from "react-icons/rx";
import {
  TbAdjustmentsCog,
  TbArrowsExchange,
  TbBellShare,
  TbBolt,
  TbCalendarTime,
  TbCategory,
  TbChartInfographic,
  TbClipboardList,
  TbClockExclamation,
  TbCode,
  TbContract,
  TbFileReport,
  TbFolders,
  TbHourglassHigh,
  TbLanguage,
  TbLayoutDashboardFilled,
  TbListDetails,
  TbMoodShare,
  TbNavigationShare,
  TbProgressCheck,
  TbServerCog,
  TbSettingsCog,
  TbShare,
  TbTimeline,
  TbUserBolt,
  TbUserHeart,
  TbUsers,
  TbUsersGroup,
  TbUserShare,
} from "react-icons/tb";
import { TiThMenuOutline } from "react-icons/ti";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master Menu",
  breadCrumb: ["Home", "Master Data", "Menus"],
};

interface MenuTreeItem extends MenuResponse {
  children?: MenuTreeItem[];
}

function MenusManagementPage() {
  const showToast = useToastHelper();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isSyncModalOpen,
    onOpen: onSyncModalOpen,
    onClose: onSyncModalClose,
  } = useDisclosure();

  const [HeaderContentState] = useState<HeaderContentProps>(HeaderDataContent);
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  const { List, Insert, Update, Delete } = useMenus();

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [IsLoadingPage, setIsLoadingPage] = useState(true);
  const [DataMenus, setDataMenus] = useState<MenuResponse[]>([]);
  const [MenuTree, setMenuTree] = useState<MenuTreeItem[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [editingInline, setEditingInline] = useState<{
    id: string;
    field: "name" | "desc" | "code" | "icon" | "link" | "pos";
  } | null>(null);
  const [inlineValues, setInlineValues] = useState<{
    name: string;
    desc: string;
    code: string;
    icon: string;
    link: string;
    pos: string;
  }>({ name: "", desc: "", code: "", icon: "", link: "", pos: "" });

  const [addingChild, setAddingChild] = useState<{
    parentId: string;
    level: number;
  } | null>(null);
  const [newChildValues, setNewChildValues] = useState<{
    code: string;
    name: string;
    desc: string;
    icon: string;
    link: string;
  }>({ code: "", name: "", desc: "", icon: "", link: "" });

  const [editingItem, setEditingItem] = useState<MenuTreeItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const RefreshAction = () => {
    setDataMenus([]);
    setMenuTree([]);
    setRefreshData(RefreshData + 1);
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const generateMenuCode = (existingMenus: MenuResponse[]): string => {
    const existingCodes = new Set(existingMenus.map((m) => m.menuCode));
    let newCode: string;

    do {
      const randomNum = Math.floor(Math.random() * 10000);
      newCode = `mn${String(randomNum).padStart(4, "0")}`;
    } while (existingCodes.has(newCode));

    return newCode;
  };

  const capitalizeEachWord = (str: string): string => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getIconComponent = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    const IconComponent = (FiIcons as any)[iconName] || (BiIcons as any)[iconName] || (MdIcons as any)[iconName];
    return IconComponent ? IconComponent : null;
  };

  const ValidationSchema = Yup.object().shape({
    menuName: Yup.string()
      .required("Menu name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    menuDesc: Yup.string().max(300, "Maximum 300 characters"),
    menuIcon: Yup.string().max(50, "Maximum 50 characters"),
    menuLink: Yup.string().max(200, "Maximum 200 characters"),
  });

  const formik = useFormik<{
    menuCode: string;
    menuName: string;
    menuDesc: string;
    menuIcon: string;
    menuLink: string;
    parentId: string;
    isDisable: boolean;
    isHide: boolean;
    isPro: boolean;
    menuPos: string;
  }>({
    initialValues: {
      menuCode: "",
      menuName: "",
      menuDesc: "",
      menuIcon: "",
      menuLink: "",
      parentId: "",
      isDisable: false,
      isHide: false,
      isPro: false,
      menuPos: "1",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setPendingFormValues(values);
      setShowConfirmDialog(true);
    },
  });

  const handleConfirmedSubmit = async () => {
    if (!pendingFormValues) return;

    const payload: MenuInsertPayload = {
      menuCode: pendingFormValues.menuCode,
      menuName: capitalizeEachWord(pendingFormValues.menuName),
      menuDesc: pendingFormValues.menuDesc || null,
      menuIcon: pendingFormValues.menuIcon || "",
      menuLink: pendingFormValues.menuLink || "",
      parentId: pendingFormValues.parentId || null,
      isDisable: pendingFormValues.isDisable ? "1" : "0",
      isHide: pendingFormValues.isHide ? "1" : "0",
      isPro: pendingFormValues.isPro ? "Y" : "N",
      menuPos: pendingFormValues.menuPos
        ? parseFloat(pendingFormValues.menuPos)
        : 1,
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await Insert(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      onClose();
      formik.resetForm();
      RefreshAction();
      toast({
        title: "Success",
        description: "Menu successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to add menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingFormValues(null);
  };

  const editFormik = useFormik<{
    id: string;
    menuCode: string;
    menuName: string;
    menuDesc: string;
    menuIcon: string;
    menuLink: string;
    parentId: string;
    isDisable: boolean;
    isHide: boolean;
    isPro: boolean;
    menuPos: string;
  }>({
    initialValues: {
      id: "",
      menuCode: "",
      menuName: "",
      menuDesc: "",
      menuIcon: "",
      menuLink: "",
      parentId: "",
      isDisable: false,
      isHide: false,
      isPro: false,
      menuPos: "1",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setPendingFormValues(values);
      setShowEditDialog(true);
    },
  });

  const handleConfirmedEdit = async () => {
    if (!pendingFormValues) return;

    const payload: MenuUpdatePayload = {
      id: pendingFormValues.id,
      menuCode: pendingFormValues.menuCode,
      menuName: capitalizeEachWord(pendingFormValues.menuName),
      menuDesc: pendingFormValues.menuDesc || null,
      menuIcon: pendingFormValues.menuIcon || "",
      menuLink: pendingFormValues.menuLink || "",
      parentId: pendingFormValues.parentId || null,
      isDisable: pendingFormValues.isDisable ? "1" : "0",
      isHide: pendingFormValues.isHide ? "1" : "0",
      isPro: pendingFormValues.isPro ? "Y" : "N",
      menuPos: pendingFormValues.menuPos
        ? parseFloat(pendingFormValues.menuPos)
        : 1,
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await Update(payload, token);

    if (result?.statusCode === RES_CODE_OK) {
      onEditClose();
      editFormik.resetForm();
      RefreshAction();
      toast({
        title: "Success",
        description: "Menu successfully updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to update menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingFormValues(null);
  };

  const findItemById = (
    items: MenuTreeItem[],
    id: string
  ): MenuTreeItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getNextMenuPosition = (existingMenus: MenuResponse[]): number => {
    if (existingMenus.length === 0) return 1;
    const maxPos = Math.max(...existingMenus.map(m => m.menuPos || 0));
    return maxPos + 1;
  };

  const openAddModal = () => {
    const newCode = generateMenuCode(DataMenus);
    const nextPos = getNextMenuPosition(DataMenus);
    formik.resetForm();
    formik.setFieldValue("menuCode", newCode);
    formik.setFieldValue("menuPos", String(nextPos));
    onOpen();
  };

  const openEditModal = (item: MenuTreeItem) => {
    setEditingItem(item);
    const nextPos = getNextMenuPosition(DataMenus);
    editFormik.setValues({
      id: item.id,
      menuCode: item.menuCode,
      menuName: item.menuName,
      menuDesc: item.menuDesc || "",
      menuIcon: item.menuIcon || "",
      menuLink: item.menuLink || "",
      parentId: item.parentId || "",
      isDisable: item.isDisable === "1",
      isHide: item.isHide === "1",
      isPro: item.isPro === "Y",
      menuPos: String(item.menuPos || nextPos),
    });
    onEditOpen();
  };

  const startInlineEdit = (
    item: MenuTreeItem,
    field: "name" | "desc" | "code" | "icon" | "link" | "pos"
  ) => {
    setEditingInline({ id: item.id, field });
    setInlineValues({
      name: item.menuName,
      desc: item.menuDesc || "",
      code: item.menuCode,
      icon: item.menuIcon || "",
      link: item.menuLink || "",
      pos: String(item.menuPos || ""),
    });
  };

  const cancelInlineEdit = () => {
    setEditingInline(null);
    setInlineValues({ name: "", desc: "", code: "", icon: "", link: "", pos: "" });
  };

  const saveInlineEdit = async () => {
    if (!editingInline) return;

    const item = findItemById(MenuTree, editingInline.id);
    if (!item) return;

    const token = localStorage.getItem("tokenData") as string;

    // Handle position shifting if editing pos field
    if (editingInline.field === "pos") {
      // Validate empty input
      if (!inlineValues.pos || inlineValues.pos.trim() === "") {
        toast({
          title: "Invalid Position",
          description: "Position cannot be empty",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        setEditingInline(null);
        setInlineValues({ name: "", desc: "", code: "", icon: "", link: "", pos: "" });
        return;
      }

      let newPos = Number(inlineValues.pos) || 1;
      const currentPos = item.menuPos || 1;

      // Validate position range - prevent jumps
      const maxPos = Math.max(...DataMenus.map(m => m.menuPos || 0));
      if (newPos > maxPos + 1) {
        newPos = maxPos + 1;
        toast({
          title: "Position adjusted",
          description: `Position cannot exceed ${maxPos + 1}. Adjusted automatically.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
      if (newPos < 1) newPos = 1;

      // If position changed and new position exists
      if (newPos !== currentPos) {
        const conflictingMenu = DataMenus.find(
          m => m.menuPos === newPos && m.id !== item.id
        );

        if (conflictingMenu) {
          // Determine shift direction
          if (newPos < currentPos) {
            // Moving up: shift items from newPos to currentPos-1 down by 1
            const menusToShift = DataMenus.filter(
              m => (m.menuPos || 0) >= newPos && (m.menuPos || 0) < currentPos && m.id !== item.id
            ).sort((a, b) => (b.menuPos || 0) - (a.menuPos || 0)); // Sort descending

            for (const menu of menusToShift) {
              const shiftPayload: MenuUpdatePayload = {
                id: menu.id,
                menuCode: menu.menuCode,
                menuName: menu.menuName,
                menuDesc: menu.menuDesc,
                menuIcon: menu.menuIcon || "",
                menuLink: menu.menuLink || "",
                parentId: menu.parentId,
                isDisable: menu.isDisable,
                isHide: menu.isHide,
                isPro: menu.isPro || "N",
                menuPos: (menu.menuPos || 0) + 1,
              };
              await Update(shiftPayload, token);
            }
          } else {
            // Moving down: shift items from currentPos+1 to newPos up by 1
            const menusToShift = DataMenus.filter(
              m => (m.menuPos || 0) > currentPos && (m.menuPos || 0) <= newPos && m.id !== item.id
            ).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0)); // Sort ascending

            for (const menu of menusToShift) {
              const shiftPayload: MenuUpdatePayload = {
                id: menu.id,
                menuCode: menu.menuCode,
                menuName: menu.menuName,
                menuDesc: menu.menuDesc,
                menuIcon: menu.menuIcon || "",
                menuLink: menu.menuLink || "",
                parentId: menu.parentId,
                isDisable: menu.isDisable,
                isHide: menu.isHide,
                isPro: menu.isPro || "N",
                menuPos: (menu.menuPos || 0) - 1,
              };
              await Update(shiftPayload, token);
            }
          }
        }
      }

      // Update with validated position
      const payload: MenuUpdatePayload = {
        id: editingInline.id,
        menuCode: item.menuCode,
        menuName: item.menuName,
        menuDesc: item.menuDesc,
        menuIcon: item.menuIcon || "",
        menuLink: item.menuLink || "",
        parentId: item.parentId,
        isDisable: item.isDisable,
        isHide: item.isHide,
        isPro: item.isPro || "N",
        menuPos: newPos,
      };

      const result = await Update(payload, token);

      if (result?.statusCode === RES_CODE_OK) {
        RefreshAction();
        toast({
          title: "Success",
          description: "Menu position updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed",
          description: result?.message || "Failed to update menu",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      setEditingInline(null);
      setInlineValues({ name: "", desc: "", code: "", icon: "", link: "", pos: "" });
      return;
    }

    // Handle other fields
    const payload: MenuUpdatePayload = {
      id: editingInline.id,
      menuCode:
        editingInline.field === "code" ? inlineValues.code : item.menuCode,
      menuName:
        editingInline.field === "name"
          ? capitalizeEachWord(inlineValues.name)
          : item.menuName,
      menuDesc:
        editingInline.field === "desc" ? inlineValues.desc : item.menuDesc,
      menuIcon:
        editingInline.field === "icon"
          ? inlineValues.icon || ""
          : item.menuIcon || "",
      menuLink:
        editingInline.field === "link"
          ? inlineValues.link || ""
          : item.menuLink || "",
      parentId: item.parentId,
      isDisable: item.isDisable,
      isHide: item.isHide,
      isPro: item.isPro || "N",
      menuPos: item.menuPos || 1,
    };

    const result = await Update(payload, token);

    if (result?.statusCode === RES_CODE_OK) {
      RefreshAction();
      toast({
        title: "Success",
        description: "Menu successfully updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to update menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setEditingInline(null);
    setInlineValues({ name: "", desc: "", code: "", icon: "", link: "", pos: "" });
  };

  const startAddChild = (parentId: string, level: number) => {
    const newCode = generateMenuCode(DataMenus);
    setAddingChild({ parentId, level });
    setNewChildValues({
      code: newCode,
      name: "",
      desc: "",
      icon: "",
      link: "",
    });
    setExpandedItems((prev) => new Set([...prev, parentId]));
  };

  const cancelAddChild = () => {
    setAddingChild(null);
    setNewChildValues({ code: "", name: "", desc: "", icon: "", link: "" });
  };

  const saveNewChild = async () => {
    if (
      !addingChild ||
      !newChildValues.name.trim() ||
      !newChildValues.code.trim()
    )
      return;

    const payload: MenuInsertPayload = {
      menuCode: newChildValues.code.trim(),
      menuName: capitalizeEachWord(newChildValues.name.trim()),
      menuDesc: newChildValues.desc.trim() || null,
      menuIcon: newChildValues.icon.trim() || "",
      menuLink: newChildValues.link.trim() || "",
      parentId: addingChild.parentId,
      isDisable: "0",
      isHide: "0",
      isPro: "N",
      menuPos: 1,
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await Insert(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      RefreshAction();
      toast({
        title: "Success",
        description: "Child menu successfully added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      cancelAddChild();
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to add child menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteItem = (itemId: string, itemName: string) => {
    setPendingDeleteItem({ id: itemId, name: itemName });
    setShowDeleteDialog(true);
  };

  const handleConfirmedDelete = async () => {
    if (!pendingDeleteItem) return;

    const token = localStorage.getItem("tokenData") as string;
    const result = await Delete(pendingDeleteItem.id, token);

    if (result?.statusCode === RES_CODE_OK) {
      RefreshAction();
      toast({
        title: "Success",
        description: "Menu successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to delete menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingDeleteItem(null);
  };

  const moveItemOrder = async (
    itemId: string,
    direction: "up" | "down",
    parentId?: string
  ) => {
    const findSiblings = (
      items: MenuTreeItem[],
      targetParentId?: string
    ): MenuTreeItem[] => {
      if (!targetParentId) return items;

      for (const item of items) {
        if (item.id === targetParentId) return item.children || [];
        if (item.children) {
          const found = findSiblings(item.children, targetParentId);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    const siblings = findSiblings(MenuTree, parentId);
    const itemIndex = siblings.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;

    const item1 = siblings[itemIndex];
    const item2 = siblings[newIndex];

    const token = localStorage.getItem("tokenData") as string;

    try {
      const payload1: MenuUpdatePayload = {
        id: item1.id,
        menuCode: item1.menuCode,
        menuName: item1.menuName,
        menuDesc: item1.menuDesc,
        menuIcon: item1.menuIcon || "",
        menuLink: item1.menuLink || "",
        parentId: item1.parentId,
        isDisable: item1.isDisable,
        isHide: item1.isHide,
        isPro: item1.isPro || "N",
        menuPos: item2.menuPos || 1,
      };

      const payload2: MenuUpdatePayload = {
        id: item2.id,
        menuCode: item2.menuCode,
        menuName: item2.menuName,
        menuDesc: item2.menuDesc,
        menuIcon: item2.menuIcon || "",
        menuLink: item2.menuLink || "",
        parentId: item2.parentId,
        isDisable: item2.isDisable,
        isHide: item2.isHide,
        isPro: item2.isPro || "N",
        menuPos: item1.menuPos || 1,
      };

      await Promise.all([Update(payload1, token), Update(payload2, token)]);

      RefreshAction();
      toast({
        title: "Success",
        description: "Menu order successfully updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed",
        description: "Failed to update menu order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const buildMenuTree = (menus: MenuResponse[]): MenuTreeItem[] => {
    const menuMap = new Map<string, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

    const sortByMenuPos = (items: MenuTreeItem[]) => {
      items.sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortByMenuPos(item.children);
        }
      });
    };

    sortByMenuPos(rootMenus);
    return rootMenus;
  };

  const handleSynchronize = async () => {
    onSyncModalClose();
    setIsSynchronizing(true);
    const token = localStorage.getItem("tokenData") as string;
    let inserted = 0;
    let skipped = 0;

    try {
      const syncMenu = async (
        menuItem: LinkItemProps,
        parentId: string | null = null,
        position: number = 1
      ): Promise<void> => {
        // Check if menu already exists by link
        const exists = DataMenus.find((m) => m.menuLink === menuItem.link);

        if (exists) {
          skipped++;
          // Still process children with existing parent
          if (menuItem.children && menuItem.children.length > 0) {
            for (let i = 0; i < menuItem.children.length; i++) {
              await syncMenu(menuItem.children[i], exists.id, i + 1);
            }
          }
          return;
        }

        // Extract icon name from component
        const iconName = menuItem.icon?.name || "";

        // Generate unique menu code
        const menuCode = generateMenuCode(DataMenus);

        // Prepare payload
        const payload: MenuInsertPayload = {
          menuCode,
          menuName: menuItem.name,
          menuDesc: null,
          menuIcon: iconName,
          menuLink: menuItem.link,
          parentId,
          isDisable: "0",
          isHide: "0",
          isPro: menuItem.isPro ? "Y" : "N",
          menuPos: position,
        };

        // Insert menu
        const result = await Insert(payload, token);

        if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
          inserted++;

          // Get the newly inserted menu ID
          const newMenuId = result.data;

          // Process children
          if (menuItem.children && menuItem.children.length > 0) {
            for (let i = 0; i < menuItem.children.length; i++) {
              await syncMenu(menuItem.children[i], newMenuId, i + 1);
            }
          }
        }
      };

      // Process all root menus
      for (let i = 0; i < LinkItems.length; i++) {
        await syncMenu(LinkItems[i], null, i + 1);
      }

      toast({
        title: "Synchronization Complete",
        description: `Inserted: ${inserted}, Skipped (duplicates): ${skipped}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      RefreshAction();
    } catch (error) {
      console.error("Synchronization error:", error);
      toast({
        title: "Synchronization Failed",
        description: "An error occurred during synchronization",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  const handleDeleteAllSynced = async () => {
    onSyncModalClose();
    setIsDeleting(true);
    const token = localStorage.getItem("tokenData") as string;
    let deleted = 0;
    let failed = 0;

    try {
      // Get all menus from LinkItems to identify synced menus
      const syncedLinks = new Set<string>();

      const collectLinks = (items: LinkItemProps[]) => {
        items.forEach(item => {
          syncedLinks.add(item.link);
          if (item.children && item.children.length > 0) {
            collectLinks(item.children);
          }
        });
      };

      collectLinks(LinkItems);

      // Find and delete menus that match synced links
      const menusToDelete = DataMenus.filter(menu => menu.menuLink && syncedLinks.has(menu.menuLink));

      for (const menu of menusToDelete) {
        const result = await Delete(menu.id, token);
        if (result?.statusCode === RES_CODE_OK) {
          deleted++;
        } else {
          failed++;
        }
      }

      toast({
        title: "Deletion Complete",
        description: `Deleted: ${deleted}, Failed: ${failed}`,
        status: deleted > 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });

      RefreshAction();
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        title: "Deletion Failed",
        description: "An error occurred during deletion",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const GetDataMenus = async (): Promise<MenuResponse[]> => {
    setIsLoadingProcess(true);

    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: "",
      filterWhere: [],
      fieldOrder: ["menuPos"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await List(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      setIsLoadingPage(false);
      return [];
    } else {
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setIsLoadingPage(false);
        return [];
      }

      const itemsData: MenuResponse[] = requestData.data as MenuResponse[];
      setDataMenus(itemsData);
      const tree = buildMenuTree(itemsData);
      setMenuTree(tree);
      setIsLoadingProcess(false);
      setIsLoadingPage(false);

      return itemsData;
    }
  };

  useEffect(() => {
    setIsLoadingPage(true);
    GetDataMenus();
  }, [RefreshData]);

  const renderMenuItem = (item: MenuTreeItem, level: number = 1) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const canAddChild = level < 3;
    const iconComponent = getIconComponent(item.menuIcon);

    return (
      <Box key={item.id} w="full">
        <HStack
          p={level === 1 ? 3 : 2}
          bg={colorMode === "light" ? "white" : "gray.800"}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          rounded={level === 1 ? "md" : "sm"}
          justify="space-between"
          align="center"
        >
          <HStack spacing={3} flex={1} maxW="70%">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => toggleExpand(item.id)}
              p={0}
              minW="auto"
              isDisabled={!hasChildren}
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </Button>
            {editingInline?.id === item.id && editingInline?.field === "pos" ? (
              <Input
                value={inlineValues.pos}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setInlineValues((prev) => ({
                      ...prev,
                      pos: value,
                    }));
                  }
                }}
                onBlur={saveInlineEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveInlineEdit();
                  if (e.key === "Escape") cancelInlineEdit();
                }}
                size="sm"
                autoFocus
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                w="16"
              />
            ) : (
              <Text
                fontSize={level === 1 ? "sm" : "xs"}
                color="gray.600"
                fontWeight="bold"
                minW="8"
                w="8"
                cursor="pointer"
                onClick={() => startInlineEdit(item, "pos")}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.700",
                }}
                p={1}
                rounded="sm"
              >
                {item.menuPos || "-"}
              </Text>
            )}
            {iconComponent && (
              <Icon
                as={iconComponent}
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                fontSize="lg"
              />
            )}
            {/* <Text
              fontWeight={level === 1 ? "semibold" : "medium"}
              fontSize={level === 1 ? "md" : "sm"}
              color={colorMode === "light" ? "gray.800" : "white"}
              minW="150px"
              w="150px"
            >
              {editingInline?.id === item.id &&
                editingInline?.field === "code" ? (
                <Input
                  value={inlineValues.code}
                  onChange={(e) =>
                    setInlineValues((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  onBlur={saveInlineEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveInlineEdit();
                    if (e.key === "Escape") cancelInlineEdit();
                  }}
                  size="sm"
                  autoFocus
                  maxLength={50}
                />
              ) : (
                <HStack spacing={1} alignItems="center" role="group">
                  <Text
                    noOfLines={1}
                    cursor="pointer"
                    onClick={() => startInlineEdit(item, "code")}
                    _hover={{
                      bg: colorMode === "light" ? "gray.100" : "gray.700",
                    }}
                    p={1}
                    rounded="sm"
                    flex={1}
                  >
                    {item.menuCode}
                  </Text>
                  <Box
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                    color="gray.500"
                    fontSize="xs"
                  >
                    <FiEdit3 />
                  </Box>
                </HStack>
              )}
            </Text> */}
            <Text
              fontWeight={level === 1 ? "semibold" : "medium"}
              fontSize={level === 1 ? "md" : "sm"}
              color={colorMode === "light" ? "gray.800" : "white"}
              minW="180px"
              w="180px"
            >
              {editingInline?.id === item.id &&
                editingInline?.field === "name" ? (
                <Input
                  value={inlineValues.name}
                  onChange={(e) =>
                    setInlineValues((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  onBlur={saveInlineEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveInlineEdit();
                    if (e.key === "Escape") cancelInlineEdit();
                  }}
                  size="sm"
                  autoFocus
                  maxLength={100}
                />
              ) : (
                <HStack spacing={1} alignItems="center" role="group">
                  <Text
                    noOfLines={1}
                    cursor="pointer"
                    onClick={() => startInlineEdit(item, "name")}
                    _hover={{
                      bg: colorMode === "light" ? "gray.100" : "gray.700",
                    }}
                    p={1}
                    rounded="sm"
                    flex={1}
                  >
                    {item.menuName}
                  </Text>
                  {hasChildren && (
                    <Badge colorScheme="blue" fontSize="xs" ml={1}>
                      {item.children!.length}
                    </Badge>
                  )}
                  <Box
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                    color="gray.500"
                    fontSize="xs"
                  >
                    <FiEdit3 />
                  </Box>
                </HStack>
              )}
            </Text>
            {item.menuDesc && (
              <Text
                fontSize="xs"
                color="gray.500"
                flex={1}
                noOfLines={1}
                fontStyle="italic"
              >
                {editingInline?.id === item.id &&
                  editingInline?.field === "desc" ? (
                  <Input
                    value={inlineValues.desc}
                    onChange={(e) =>
                      setInlineValues((prev) => ({
                        ...prev,
                        desc: e.target.value,
                      }))
                    }
                    onBlur={saveInlineEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveInlineEdit();
                      if (e.key === "Escape") cancelInlineEdit();
                    }}
                    size="sm"
                    autoFocus
                    maxLength={300}
                  />
                ) : (
                  <HStack spacing={1} alignItems="center" role="group">
                    <Text
                      noOfLines={1}
                      cursor="pointer"
                      onClick={() => startInlineEdit(item, "desc")}
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.700",
                      }}
                      p={1}
                      rounded="sm"
                      flex={1}
                    >
                      - {item.menuDesc}
                    </Text>
                    <Box
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                      color="gray.500"
                      fontSize="xs"
                    >
                      <FiEdit3 />
                    </Box>
                  </HStack>
                )}
              </Text>
            )}
          </HStack>
          <HStack spacing={1} minW="280px" justify="flex-end">
            <Button
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={() =>
                moveItemOrder(item.id, "up", item.parentId || undefined)
              }
            >
              <FiChevronUp />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={() =>
                moveItemOrder(item.id, "down", item.parentId || undefined)
              }
            >
              <FiChevronDown />
            </Button>
            <Button
              size="xs"
              leftIcon={<FiEdit3 />}
              colorScheme="blue"
              variant="ghost"
              onClick={() => openEditModal(item)}
            >
              Edit
            </Button>
            {canAddChild && (
              <Button
                size="xs"
                leftIcon={<FiPlus />}
                colorScheme="green"
                variant="ghost"
                onClick={() => startAddChild(item.id, level + 1)}
              >
                Add
              </Button>
            )}
            {!hasChildren && (
              <Button
                size="xs"
                leftIcon={<FiTrash2 />}
                colorScheme="red"
                variant="ghost"
                onClick={() => deleteItem(item.id, item.menuName)}
              >
                Delete
              </Button>
            )}
          </HStack>
        </HStack>

        {addingChild?.parentId === item.id && (
          <VStack spacing={1} align="stretch" pl={level * 4} mt={1}>
            <HStack
              p={2}
              bg={colorMode === "light" ? "green.50" : "green.900"}
              border="2px dashed"
              borderColor="green.300"
              rounded="md"
              spacing={2}
            >
              <Input
                placeholder="Code..."
                value={newChildValues.code}
                isReadOnly
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                size="sm"
                maxLength={50}
                w="120px"
              />
              <Input
                placeholder="Name..."
                value={newChildValues.name}
                onChange={(e) => {
                  const capitalized = capitalizeEachWord(e.target.value);
                  setNewChildValues((prev) => ({ ...prev, name: capitalized }));
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    newChildValues.name.trim() &&
                    newChildValues.code.trim()
                  )
                    saveNewChild();
                  if (e.key === "Escape") cancelAddChild();
                }}
                size="sm"
                maxLength={100}
                w="150px"
              />
              <Input
                placeholder="Description..."
                value={newChildValues.desc}
                onChange={(e) =>
                  setNewChildValues((prev) => ({
                    ...prev,
                    desc: e.target.value,
                  }))
                }
                size="sm"
                maxLength={300}
                flex={1}
              />
              <Button
                size="xs"
                colorScheme="green"
                onClick={saveNewChild}
                isDisabled={
                  !newChildValues.name.trim() || !newChildValues.code.trim()
                }
              >
                Save
              </Button>
              <Button size="xs" variant="ghost" onClick={cancelAddChild}>
                Cancel
              </Button>
            </HStack>
          </VStack>
        )}

        {hasChildren && isExpanded && (
          <VStack spacing={1} align="stretch" pl={level * 4} mt={1}>
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} pt={3}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
            minH={"500px"}
          >
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                Master Menu Management
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  ></GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    <Flex
                      as={Wrap}
                      justifyContent={"end"}
                      px={0}
                      w={"full"}
                      gap={2}
                    >
                      <Button
                        size={"md"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Reload
                      </Button>
                      <Button
                        size="md"
                        leftIcon={<FiRefreshCcw />}
                        colorScheme="purple"
                        onClick={onSyncModalOpen}
                        isLoading={isSynchronizing}
                        loadingText="Synchronizing..."
                      >
                        Synchronize
                      </Button>
                      <Button
                        size="md"
                        leftIcon={<FiPlus />}
                        colorScheme="secondary"
                        onClick={openAddModal}
                      >
                        Add New Menu
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>

                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : MenuTree.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <FiFrown
                      size={32}
                      color="gray.400"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <Text color="gray.500" fontSize="sm">
                      No menus found
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={4} align="stretch" w="full">
                    {MenuTree.map((menu) => renderMenuItem(menu, 1))}
                  </VStack>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Menu</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Menu Code</FormLabel>
                <Input
                  name="menuCode"
                  value={formik.values.menuCode}
                  isReadOnly
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  cursor="not-allowed"
                />
              </FormControl>

              <FormControl
                isInvalid={
                  !!(formik.errors.menuName && formik.touched.menuName)
                }
                isRequired
              >
                <FormLabel>Menu Name</FormLabel>
                <Input
                  name="menuName"
                  value={formik.values.menuName}
                  onChange={(e) => {
                    const capitalized = capitalizeEachWord(e.target.value);
                    formik.setFieldValue("menuName", capitalized);
                  }}
                  onBlur={formik.handleBlur}
                  placeholder="Enter menu name"
                />
                <FormErrorMessage>{formik.errors.menuName}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={
                  !!(formik.errors.menuDesc && formik.touched.menuDesc)
                }
              >
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  name="menuDesc"
                  value={formik.values.menuDesc}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter menu description"
                  rows={3}
                  maxLength={300}
                />
                <FormErrorMessage>{formik.errors.menuDesc}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>
                  Icon (Optional){" "}
                  <Tooltip
                    label="For Further References, follow this link"
                    placement="top"
                    hasArrow
                  >
                    <Text
                      as="a"
                      href="https://react-icons.github.io/react-icons/"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      fontSize="xs"
                      textDecoration="underline"
                      cursor="pointer"
                      _hover={{ color: "blue.600" }}
                    >
                      (?)
                    </Text>
                  </Tooltip>
                </FormLabel>
                <Input
                  name="menuIcon"
                  value={formik.values.menuIcon}
                  onChange={formik.handleChange}
                  placeholder="Example: FiHome"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Link (Optional)</FormLabel>
                <Input
                  name="menuLink"
                  value={formik.values.menuLink}
                  onChange={formik.handleChange}
                  placeholder="Example: /dashboard"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Parent Menu (Optional)</FormLabel>
                <Select
                  name="parentId"
                  value={formik.values.parentId}
                  onChange={formik.handleChange}
                  placeholder="Select parent menu"
                >
                  {DataMenus.filter((m) => !m.parentId).map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.menuName}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Disable</FormLabel>
                  <Switch
                    name="isDisable"
                    isChecked={formik.values.isDisable}
                    onChange={(e) =>
                      formik.setFieldValue("isDisable", e.target.checked)
                    }
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Hide</FormLabel>
                  <Switch
                    name="isHide"
                    isChecked={formik.values.isHide}
                    onChange={(e) =>
                      formik.setFieldValue("isHide", e.target.checked)
                    }
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Pro</FormLabel>
                  <Switch
                    name="isPro"
                    isChecked={formik.values.isPro}
                    onChange={(e) =>
                      formik.setFieldValue("isPro", e.target.checked)
                    }
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Menu Position</FormLabel>
                <Input
                  name="menuPos"
                  type="number"
                  value={formik.values.menuPos}
                  onChange={formik.handleChange}
                  placeholder="1"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => formik.handleSubmit()}
              isLoading={formik.isSubmitting}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Menu</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Menu Code</FormLabel>
                <Input
                  name="menuCode"
                  value={editFormik.values.menuCode}
                  isReadOnly
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  cursor="not-allowed"
                />
              </FormControl>

              <FormControl
                isInvalid={
                  !!(editFormik.errors.menuName && editFormik.touched.menuName)
                }
                isRequired
              >
                <FormLabel>Menu Name</FormLabel>
                <Input
                  name="menuName"
                  value={editFormik.values.menuName}
                  onChange={(e) => {
                    const capitalized = capitalizeEachWord(e.target.value);
                    editFormik.setFieldValue("menuName", capitalized);
                  }}
                  onBlur={editFormik.handleBlur}
                  placeholder="Enter menu name"
                />
                <FormErrorMessage>
                  {editFormik.errors.menuName}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={
                  !!(editFormik.errors.menuDesc && editFormik.touched.menuDesc)
                }
              >
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  name="menuDesc"
                  value={editFormik.values.menuDesc}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  placeholder="Enter menu description"
                  rows={3}
                  maxLength={300}
                />
                <FormErrorMessage>
                  {editFormik.errors.menuDesc}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>
                  Icon (Optional){" "}
                  <Tooltip
                    label="For Further References, follow this link"
                    placement="top"
                    hasArrow
                  >
                    <Text
                      as="a"
                      href="https://react-icons.github.io/react-icons/"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      fontSize="xs"
                      textDecoration="underline"
                      cursor="pointer"
                      _hover={{ color: "blue.600" }}
                    >
                      (?)
                    </Text>
                  </Tooltip>
                </FormLabel>
                <Input
                  name="menuIcon"
                  value={editFormik.values.menuIcon}
                  onChange={editFormik.handleChange}
                  placeholder="Example: FiHome"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Link (Optional)</FormLabel>
                <Input
                  name="menuLink"
                  value={editFormik.values.menuLink}
                  onChange={editFormik.handleChange}
                  placeholder="Example: /dashboard"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Parent Menu (Optional)</FormLabel>
                <Select
                  name="parentId"
                  value={editFormik.values.parentId}
                  onChange={editFormik.handleChange}
                  placeholder="Select parent menu"
                >
                  {DataMenus.filter(
                    (m) => !m.parentId && m.id !== editFormik.values.id
                  ).map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.menuName}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Disable</FormLabel>
                  <Switch
                    name="isDisable"
                    isChecked={editFormik.values.isDisable}
                    onChange={(e) =>
                      editFormik.setFieldValue("isDisable", e.target.checked)
                    }
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Hide</FormLabel>
                  <Switch
                    name="isHide"
                    isChecked={editFormik.values.isHide}
                    onChange={(e) =>
                      editFormik.setFieldValue("isHide", e.target.checked)
                    }
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Pro</FormLabel>
                  <Switch
                    name="isPro"
                    isChecked={editFormik.values.isPro}
                    onChange={(e) =>
                      editFormik.setFieldValue("isPro", e.target.checked)
                    }
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Menu Position</FormLabel>
                <Input
                  name="menuPos"
                  type="number"
                  value={editFormik.values.menuPos}
                  onChange={editFormik.handleChange}
                  placeholder="1"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => editFormik.handleSubmit()}
              isLoading={editFormik.isSubmitting}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        isOpenTrigger={showConfirmDialog}
        action={handleConfirmedSubmit}
        trigger={setShowConfirmDialog}
        questionMsg={`Are you sure you want to add menu "${pendingFormValues?.menuName}"?`}
        captionMsg="Confirm Save"
      />

      <ConfirmationDialog
        isOpenTrigger={showEditDialog}
        action={handleConfirmedEdit}
        trigger={setShowEditDialog}
        questionMsg={`Are you sure you want to update menu "${pendingFormValues?.menuName}"?`}
        captionMsg="Confirm Update"
      />

      <ConfirmationDialog
        isOpenTrigger={showDeleteDialog}
        action={handleConfirmedDelete}
        trigger={setShowDeleteDialog}
        questionMsg={`Are you sure you want to delete menu "${pendingDeleteItem?.name}"?`}
        captionMsg="Confirm Delete"
      />

      {/* Synchronize Confirmation Modal */}
      <Modal isOpen={isSyncModalOpen} onClose={onSyncModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Synchronize Menus</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>
                This will synchronize menus from <strong>menuApplication.ts</strong> to the database.
              </Text>
              <Text color="orange.500" fontWeight="medium">
                ⚠️ Existing menus with the same link will be skipped.
              </Text>
              <Text fontSize="sm" color="gray.500">
                New menus will be inserted with their hierarchical structure.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              colorScheme="red"
              mr="auto"
              onClick={handleDeleteAllSynced}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Delete All Synced
            </Button>
            <Button variant="ghost" mr={3} onClick={onSyncModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSynchronize}
              isLoading={isSynchronizing}
            >
              Synchronize
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

export default MenusManagementPage;
