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
import useWorkflow, {
  WorkflowGroupResponse,
  WorkflowGroupUpdatePayload,
  WorkflowGroupInsertPayload,
} from "@/app/services/useWorkflow";
import useWorkflowCategory, {
  WorkflowCategoryResponse,
} from "@/app/services/useWorkflowCategories";
import {
  ListSearchByParamProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useColorMode,
  VStack,
  Wrap,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiFilter,
  FiFrown,
  FiList,
  FiPlusSquare,
  FiRefreshCcw,
  FiTarget,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiSave,
  FiHeart,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Data Workflow",
  breadCrumb: ["Home", "Master Data", "Workflow", "Kategori ..."],
};

function WorkflowDetailView() {
  const showToast = useToastHelper();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isAddChildOpen,
    onOpen: onAddChildOpen,
    onClose: onAddChildClose,
  } = useDisclosure();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // hook services
  const { GetWorkflowCategoryById } = useWorkflowCategory();
  const {
    ListWorkflowGroups,
    UpdateWorkflowGroup,
    InsertWorkflowGroup,
    DeleteWorkflowGroup,
  } = useWorkflow();

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [IsLoadingPage, setIsLoadingPage] = useState(true);
  const [CategoryId, setCategoryId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("categoryId");
    if (id) {
      setCategoryId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataWorkflowCategory, setDataWorkflowCategory] =
    useState<WorkflowCategoryResponse | null>(null);
  const [DataWorkflowGroups, setDataWorkflowGroups] = useState<
    WorkflowGroupResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Local data management for changes tracking
  const [localWorkflowData, setLocalWorkflowData] = useState<
    WorkflowGroupResponse[]
  >([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedItems, setChangedItems] = useState<{
    updated: Set<string>;
    added: Set<string>;
    deleted: Set<string>;
  }>({
    updated: new Set(),
    added: new Set(),
    deleted: new Set(),
  });

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<{
    wfgName: string;
    wfgDesc: string;
  } | null>(null);

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Edit confirmation dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingEditValues, setPendingEditValues] = useState<{
    id: string;
    wfgName: string;
    wfgDesc: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<WorkflowGroupResponse | null>(
    null
  );

  // Inline editing state
  const [editingInline, setEditingInline] = useState<{
    id: string;
    field: "name" | "desc";
  } | null>(null);
  const [inlineValues, setInlineValues] = useState<{
    name: string;
    desc: string;
  }>({ name: "", desc: "" });

  // Dynamic add child state
  const [addingChild, setAddingChild] = useState<{
    parentId: string;
    level: number;
  } | null>(null);
  const [newChildValues, setNewChildValues] = useState<{
    name: string;
    desc: string;
  }>({ name: "", desc: "" });

  // Add child confirmation dialog state
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [pendingAddChildValues, setPendingAddChildValues] = useState<{
    parentId: string;
    wfgName: string;
    wfgDesc: string;
    level: number;
  } | null>(null);
  const [addingChildParent, setAddingChildParent] =
    useState<WorkflowGroupResponse | null>(null);

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Refresh function
  const RefreshAction = () => {
    setDataWorkflowCategory(null);
    setDataWorkflowGroups([]);
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

  // Save all changes to API
  const saveChanges = async () => {
    if (!hasChanges || changedItems.updated.size === 0) return;

    setActionLoading(true);
    const token = localStorage.getItem("tokenData") as string;
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process all updated items
      for (const itemId of changedItems.updated) {
        const findItem = (
          items: WorkflowGroupResponse[]
        ): WorkflowGroupResponse | null => {
          for (const item of items) {
            if (item.id === itemId) return item;
            if (item.workflowChild) {
              const found = findItem(item.workflowChild);
              if (found) return found;
            }
          }
          return null;
        };

        const item = findItem(localWorkflowData);
        if (!item) continue;

        const payload: WorkflowGroupUpdatePayload = {
          id: item.id,
          wfgName: item.wfgName,
          wfgDesc: item.wfgDesc || null,
          wfgOrder: item.wfgOrder,
        };

        const result = await UpdateWorkflowGroup(payload, token);
        if (result?.statusCode === RES_CODE_OK) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Show result message
      if (errorCount === 0) {
        showToast({
          description: `Berhasil menyimpan ${successCount} perubahan`,
          statusToast: "success",
        });

        // Reset change tracking
        setHasChanges(false);
        setChangedItems({
          updated: new Set(),
          added: new Set(),
          deleted: new Set(),
        });

        // Refresh data from server
        setRefreshData((prev) => prev + 1);
      } else {
        showToast({
          description: `${successCount} berhasil, ${errorCount} gagal disimpan`,
          statusToast: "warning",
        });
      }
    } catch (error) {
      showToast({
        description: "Terjadi kesalahan saat menyimpan perubahan",
        statusToast: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Form validation schema
  const ValidationSchema = Yup.object().shape({
    wfgName: Yup.string()
      .required("Nama workflow wajib diisi")
      .min(3, "Minimal 3 karakter")
      .max(100, "Maksimal 100 karakter"),
    wfgDesc: Yup.string().max(300, "Maksimal 300 karakter"),
  });

  // Formik form handling
  const formik = useFormik<{ wfgName: string; wfgDesc: string }>({
    initialValues: {
      wfgName: "",
      wfgDesc: "",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // Show confirmation dialog instead of direct submit
      setPendingFormValues(values);
      setShowConfirmDialog(true);
    },
  });

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    if (!pendingFormValues) return;

    const payload: WorkflowGroupInsertPayload = {
      parentId: null,
      wfgOrder: localWorkflowData.length + 1,
      wfgName: pendingFormValues.wfgName,
      wfgDesc: pendingFormValues.wfgDesc || null,
      wfgLevel: 1,
      wfgCategoryId: CategoryId || "",
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await InsertWorkflowGroup(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      onClose();
      formik.resetForm();
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Workflow baru berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal menambah workflow",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingFormValues(null);
  };

  // Formik form handling for edit
  const editFormik = useFormik<{ wfgName: string; wfgDesc: string }>({
    initialValues: {
      wfgName: "",
      wfgDesc: "",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!editingItem) return;
      setPendingEditValues({
        id: editingItem.id,
        wfgName: values.wfgName,
        wfgDesc: values.wfgDesc,
      });
      setShowEditDialog(true);
    },
  });

  // Handle confirmed edit submission
  const handleConfirmedEdit = async () => {
    if (!pendingEditValues) return;

    const payload: WorkflowGroupUpdatePayload = {
      id: pendingEditValues.id,
      wfgName: pendingEditValues.wfgName,
      wfgDesc: pendingEditValues.wfgDesc || null,
      wfgOrder: editingItem?.wfgOrder || 1,
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await UpdateWorkflowGroup(payload, token);

    if (result?.statusCode === RES_CODE_OK) {
      onEditClose();
      editFormik.resetForm();
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Workflow berhasil diubah",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal mengubah workflow",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingEditValues(null);
  };

  // Formik form handling for add child
  const addChildFormik = useFormik<{ wfgName: string; wfgDesc: string }>({
    initialValues: {
      wfgName: "",
      wfgDesc: "",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!addingChildParent) return;
      setPendingAddChildValues({
        parentId: addingChildParent.id,
        wfgName: values.wfgName,
        wfgDesc: values.wfgDesc,
        level: addingChildParent.wfgLevel + 1,
      });
      setShowAddChildDialog(true);
    },
  });

  // Handle confirmed add child submission
  const handleConfirmedAddChild = async () => {
    if (!pendingAddChildValues) return;

    // Calculate order for new child
    const parentItem = findItemById(
      localWorkflowData,
      pendingAddChildValues.parentId
    );
    const childCount = parentItem?.workflowChild?.length || 0;

    const payload: WorkflowGroupInsertPayload = {
      parentId: pendingAddChildValues.parentId,
      wfgOrder: childCount + 1,
      wfgName: pendingAddChildValues.wfgName,
      wfgDesc: pendingAddChildValues.wfgDesc || null,
      wfgLevel: pendingAddChildValues.level,
      wfgCategoryId: CategoryId || "",
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await InsertWorkflowGroup(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      onAddChildClose();
      addChildFormik.resetForm();
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Item child berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal menambah item child",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingAddChildValues(null);
  };

  // Helper function to find item by ID
  const findItemById = (
    items: WorkflowGroupResponse[],
    id: string
  ): WorkflowGroupResponse | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.workflowChild) {
        const found = findItemById(item.workflowChild, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Open add modal
  const openAddModal = () => {
    formik.resetForm();
    onOpen();
  };

  // Open edit modal
  const openEditModal = (item: WorkflowGroupResponse) => {
    setEditingItem(item);
    editFormik.setValues({
      wfgName: item.wfgName,
      wfgDesc: item.wfgDesc || "",
    });
    onEditOpen();
  };

  // Open add child modal
  const openAddChildModal = (parentItem: WorkflowGroupResponse) => {
    setAddingChildParent(parentItem);
    addChildFormik.resetForm();
    onAddChildOpen();
  };

  // Inline editing functions
  const startInlineEdit = (
    item: WorkflowGroupResponse,
    field: "name" | "desc"
  ) => {
    setEditingInline({ id: item.id, field });
    setInlineValues({
      name: item.wfgName,
      desc: item.wfgDesc || "",
    });
  };

  const cancelInlineEdit = () => {
    setEditingInline(null);
    setInlineValues({ name: "", desc: "" });
  };

  const saveInlineEdit = async () => {
    if (!editingInline) return;

    const item = findItemById(localWorkflowData, editingInline.id);
    if (!item) return;

    const newName =
      editingInline.field === "name" ? inlineValues.name : item.wfgName;
    const newDesc =
      editingInline.field === "desc" ? inlineValues.desc : item.wfgDesc;

    // Direct API call without confirmation
    const payload: WorkflowGroupUpdatePayload = {
      id: editingInline.id,
      wfgName: newName,
      wfgDesc: newDesc || null,
      wfgOrder: item.wfgOrder,
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await UpdateWorkflowGroup(payload, token);

    if (result?.statusCode === RES_CODE_OK) {
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Workflow berhasil diubah",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal mengubah workflow",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Reset inline editing state
    setEditingInline(null);
    setInlineValues({ name: "", desc: "" });
  };

  // Dynamic add child functions
  const startAddChild = (parentId: string, level: number) => {
    setAddingChild({ parentId, level });
    setNewChildValues({ name: "", desc: "" });
    // Auto-expand parent when adding child
    setExpandedItems((prev) => new Set([...prev, parentId]));
  };

  const cancelAddChild = () => {
    setAddingChild(null);
    setNewChildValues({ name: "", desc: "" });
  };

  const saveNewChild = async () => {
    if (!addingChild || !newChildValues.name.trim()) return;

    // Calculate order for new child
    const parentItem = findItemById(localWorkflowData, addingChild.parentId);
    const childCount = parentItem?.workflowChild?.length || 0;

    const payload: WorkflowGroupInsertPayload = {
      parentId: addingChild.parentId,
      wfgOrder: childCount + 1,
      wfgName: newChildValues.name.trim(),
      wfgDesc: newChildValues.desc.trim() || null,
      wfgLevel: addingChild.level,
      wfgCategoryId: CategoryId || "",
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await InsertWorkflowGroup(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Item child berhasil ditambahkan",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      cancelAddChild();
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal menambah item child",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete item function
  const deleteItem = (itemId: string, itemName: string) => {
    setPendingDeleteItem({ id: itemId, name: itemName });
    setShowDeleteDialog(true);
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!pendingDeleteItem) return;

    const token = localStorage.getItem("tokenData") as string;
    const result = await DeleteWorkflowGroup(pendingDeleteItem.id, token);

    if (result?.statusCode === RES_CODE_OK) {
      RefreshAction();
      toast({
        title: "Berhasil",
        description: "Workflow berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Gagal",
        description: result?.message || "Gagal menghapus workflow",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingDeleteItem(null);
  };

  // Initialize local data when server data changes
  useEffect(() => {
    if (DataWorkflowGroups.length > 0) {
      setLocalWorkflowData(JSON.parse(JSON.stringify(DataWorkflowGroups)));
    }
  }, [DataWorkflowGroups]);

  // Move item up/down within same level - Auto save
  const moveItemOrder = async (
    itemId: string,
    direction: "up" | "down",
    parentId?: string
  ) => {
    const newData = [...localWorkflowData];

    // Find the target array to work with
    let targetItems: WorkflowGroupResponse[];

    if (!parentId) {
      // Root level items
      targetItems = newData;
    } else {
      // Find parent and get its children
      const findParent = (
        items: WorkflowGroupResponse[]
      ): WorkflowGroupResponse[] | null => {
        for (const item of items) {
          if (item.id === parentId) {
            return item.workflowChild;
          }
          if (item.workflowChild && item.workflowChild.length > 0) {
            const found = findParent(item.workflowChild);
            if (found) return found;
          }
        }
        return null;
      };

      const foundItems = findParent(newData);
      if (!foundItems) return;
      targetItems = foundItems;
    }

    // Find item index in target array
    const itemIndex = targetItems.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    // Calculate new index
    const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= targetItems.length) return;

    // Swap items
    const temp = targetItems[itemIndex];
    targetItems[itemIndex] = targetItems[newIndex];
    targetItems[newIndex] = temp;

    // Update wfgOrder values
    targetItems[itemIndex].wfgOrder = itemIndex + 1;
    targetItems[newIndex].wfgOrder = newIndex + 1;

    // Update local data immediately
    setLocalWorkflowData(newData);

    // Auto save both items to API
    const token = localStorage.getItem("tokenData") as string;

    try {
      // Update first item
      const payload1: WorkflowGroupUpdatePayload = {
        id: targetItems[itemIndex].id,
        wfgName: targetItems[itemIndex].wfgName,
        wfgDesc: targetItems[itemIndex].wfgDesc,
        wfgOrder: targetItems[itemIndex].wfgOrder,
      };

      // Update second item
      const payload2: WorkflowGroupUpdatePayload = {
        id: targetItems[newIndex].id,
        wfgName: targetItems[newIndex].wfgName,
        wfgDesc: targetItems[newIndex].wfgDesc,
        wfgOrder: targetItems[newIndex].wfgOrder,
      };

      await Promise.all([
        UpdateWorkflowGroup(payload1, token),
        UpdateWorkflowGroup(payload2, token),
      ]);

      toast({
        title: "Berhasil",
        description: "Urutan workflow berhasil diubah",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert changes on error
      RefreshAction();
      toast({
        title: "Gagal",
        description: "Gagal mengubah urutan workflow",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function Detail Data Load Services Workflow Categories
  const GetDetailWorkflowCategory = async (
    id: string = ""
  ): Promise<WorkflowCategoryResponse | null> => {
    setIsLoadingProcess(true);

    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await GetWorkflowCategoryById(id, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      setIsLoadingPage(false);
      return null;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setIsLoadingPage(false);
        return null;
      }

      const itemsData: WorkflowCategoryResponse =
        requestData.data as WorkflowCategoryResponse;

      setDataWorkflowCategory(itemsData);
      setIsLoadingProcess(false);
      setIsLoadingPage(false);

      return itemsData;
    }
  };

  // Function Detail Data Load Services Workflow Group
  const GetDataWorkflowGroup = async (
    searchValue: string = ""
  ): Promise<WorkflowGroupResponse[]> => {
    setIsLoadingProcess(true);

    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: searchValue,
      filterWhere: [
        {
          field: "parentId",
          operator: "=",
          value: "",
        },
        {
          field: "wfgLevel",
          operator: "=",
          value: "1",
        },
        {
          field: "wfgCategoryId",
          operator: "=",
          value: CategoryId || "",
        },
      ],
      fieldOrder: ["wfgOrder"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListWorkflowGroups(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return [];
      }

      const itemsData: WorkflowGroupResponse[] =
        requestData.data as WorkflowGroupResponse[];

      setDataWorkflowGroups(itemsData);
      setIsLoadingProcess(false);

      return itemsData;
    }
  };

  // END - Function Detail Data Load Services Workflow Group

  // ON LOAD STATE
  useEffect(() => {
    setIsLoadingPage(true);
    if (CategoryId) {
      GetDetailWorkflowCategory(CategoryId);
      GetDataWorkflowGroup("");
    }
  }, [RefreshData, CategoryId]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Link href={"/master-data/workflow/"}>
            <Button leftIcon={<FiArrowLeft />} size={"md"}>
              Kembali
            </Button>
          </Link>
        </GridItem>
        <GridItem
          colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
          w={"full"}
        ></GridItem>
      </Grid>

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} pt={3}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          {/* Category Information */}
          {DataWorkflowCategory && (
            <Card shadow="sm" rounded="lg" mb={4}>
              <CardBody>
                <HStack spacing={4} align="center">
                  <Box
                    w={12}
                    h={12}
                    bg="purple.500"
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {DataWorkflowCategory.wfcName.charAt(0).toUpperCase()}
                    </Text>
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Text fontSize="lg" fontWeight="bold">
                        {DataWorkflowCategory.wfcName}
                      </Text>
                      <Badge colorScheme="purple" fontSize="xs">
                        {DataWorkflowCategory.wfcCode}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {DataWorkflowCategory.wfcDesc ||
                        "No description available"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Category ID: {DataWorkflowCategory.id}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          )}

          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
            minH={"500px"}
          >
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                {DataWorkflowCategory != null && DataWorkflowCategory.wfcName}
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER DATA */}
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <Flex
                      as={Wrap}
                      justifyContent={"start"}
                      px={0}
                      w={"full"}
                      gap={2}
                    >
                      <Link href={`preset-workflow?categoryId=${CategoryId}`}>
                        <Button
                          size={"md"}
                          colorScheme={"pink"}
                          leftIcon={<FiHeart />}
                        >
                          Template Workflow
                        </Button>
                      </Link>
                    </Flex>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
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
                        Refresh
                      </Button>
                      <Button
                        size="md"
                        leftIcon={<FiPlus />}
                        colorScheme="secondary"
                        onClick={openAddModal}
                      >
                        Tambah Item Baru
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
                {/* RENDER DATA */}
                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : DataWorkflowCategory == null ? (
                  <InvalidLoadPageView />
                ) : (
                  <VStack spacing={4} align="stretch" w="full">
                    {localWorkflowData.map((group, groupIdx) => (
                      <Box key={groupIdx} w="full">
                        {/* Level 1 - Main Group */}
                        <HStack
                          p={3}
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          rounded="md"
                          justify="space-between"
                          align="center"
                        >
                          <HStack spacing={3} flex={1} maxW="70%">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => toggleExpand(group.id)}
                              p={0}
                              minW="auto"
                              isDisabled={
                                !group.workflowChild ||
                                group.workflowChild.length === 0
                              }
                            >
                              {expandedItems.has(group.id) ? (
                                <FiChevronDown />
                              ) : (
                                <FiChevronRight />
                              )}
                            </Button>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              fontWeight="bold"
                              minW="8"
                              w="8"
                            >
                              {group.wfgOrder}
                            </Text>
                            <Text
                              fontWeight="semibold"
                              color={
                                colorMode === "light" ? "gray.800" : "white"
                              }
                              minW="200px"
                              w="200px"
                            >
                              {editingInline?.id === group.id &&
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
                                <HStack
                                  spacing={1}
                                  alignItems="center"
                                  position="relative"
                                  role="group"
                                >
                                  <Text
                                    noOfLines={1}
                                    cursor="pointer"
                                    onClick={() =>
                                      startInlineEdit(group, "name")
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "light"
                                          ? "gray.100"
                                          : "gray.700",
                                    }}
                                    p={1}
                                    rounded="sm"
                                    flex={1}
                                  >
                                    {group.wfgName}
                                  </Text>
                                  {group.workflowChild &&
                                    group.workflowChild.length > 0 && (
                                      <Badge
                                        colorScheme="blue"
                                        fontSize="xs"
                                        ml={2}
                                      >
                                        {group.workflowChild.length}
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
                            {group.wfgDesc && (
                              <Text fontSize="sm" color="gray.500" flex={1}>
                                {editingInline?.id === group.id &&
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
                                      if (e.key === "Escape")
                                        cancelInlineEdit();
                                    }}
                                    size="sm"
                                    autoFocus
                                    maxLength={300}
                                  />
                                ) : (
                                  <HStack
                                    spacing={1}
                                    alignItems="center"
                                    position="relative"
                                    role="group"
                                  >
                                    <Text
                                      noOfLines={1}
                                      cursor="pointer"
                                      onClick={() =>
                                        startInlineEdit(group, "desc")
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "light"
                                            ? "gray.100"
                                            : "gray.700",
                                      }}
                                      p={1}
                                      rounded="sm"
                                      flex={1}
                                    >
                                      - {group.wfgDesc}
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
                          <HStack spacing={1} minW="300px" justify="flex-end">
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => moveItemOrder(group.id, "up")}
                              isDisabled={groupIdx === 0}
                            >
                              <FiChevronUp />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => moveItemOrder(group.id, "down")}
                              isDisabled={
                                groupIdx === localWorkflowData.length - 1
                              }
                            >
                              <FiChevronDown />
                            </Button>
                            <Button
                              size="xs"
                              leftIcon={<FiPlus />}
                              colorScheme="green"
                              variant="ghost"
                              onClick={() =>
                                startAddChild(group.id, group.wfgLevel + 1)
                              }
                            >
                              Add
                            </Button>
                            {(!group.workflowChild ||
                              group.workflowChild.length === 0) && (
                                <Button
                                  size="xs"
                                  leftIcon={<FiTrash2 />}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() =>
                                    deleteItem(group.id, group.wfgName)
                                  }
                                >
                                  Delete
                                </Button>
                              )}
                          </HStack>
                        </HStack>

                        {/* Level 2 - Children */}
                        {group.workflowChild &&
                          group.workflowChild.length > 0 &&
                          expandedItems.has(group.id) && (
                            <VStack spacing={1} align="stretch" pl={4} mt={1}>
                              {group.workflowChild.map((child, childIdx) => (
                                <Box key={childIdx}>
                                  <HStack
                                    p={2}
                                    bg={
                                      colorMode === "light"
                                        ? "white"
                                        : "gray.800"
                                    }
                                    border="1px"
                                    borderColor={
                                      colorMode === "light"
                                        ? "gray.200"
                                        : "gray.600"
                                    }
                                    rounded="sm"
                                    justify="space-between"
                                    align="center"
                                  >
                                    <HStack spacing={3} flex={1} maxW="70%">
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => toggleExpand(child.id)}
                                        p={0}
                                        minW="auto"
                                        isDisabled={
                                          !child.workflowChild ||
                                          child.workflowChild.length === 0
                                        }
                                      >
                                        {expandedItems.has(child.id) ? (
                                          <FiChevronDown />
                                        ) : (
                                          <FiChevronRight />
                                        )}
                                      </Button>
                                      <Text
                                        fontSize="xs"
                                        color="gray.600"
                                        fontWeight="bold"
                                        minW="6"
                                        w="6"
                                      >
                                        {child.wfgOrder}
                                      </Text>
                                      <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        color={
                                          colorMode === "light"
                                            ? "gray.700"
                                            : "gray.200"
                                        }
                                        minW="180px"
                                        w="180px"
                                      >
                                        {editingInline?.id === child.id &&
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
                                              if (e.key === "Enter")
                                                saveInlineEdit();
                                              if (e.key === "Escape")
                                                cancelInlineEdit();
                                            }}
                                            size="sm"
                                            autoFocus
                                            maxLength={100}
                                          />
                                        ) : (
                                          <HStack
                                            spacing={1}
                                            alignItems="center"
                                            position="relative"
                                            role="group"
                                          >
                                            <Text
                                              noOfLines={1}
                                              cursor="pointer"
                                              onClick={() =>
                                                startInlineEdit(child, "name")
                                              }
                                              _hover={{
                                                bg:
                                                  colorMode === "light"
                                                    ? "gray.100"
                                                    : "gray.700",
                                              }}
                                              p={1}
                                              rounded="sm"
                                              flex={1}
                                            >
                                              {child.wfgName}
                                            </Text>
                                            {child.workflowChild &&
                                              child.workflowChild.length >
                                              0 && (
                                                <Badge
                                                  colorScheme="green"
                                                  fontSize="xs"
                                                  ml={1}
                                                >
                                                  {child.workflowChild.length}
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
                                      {child.wfgDesc && (
                                        <HStack
                                          spacing={1}
                                          alignItems="center"
                                          position="relative"
                                          role="group"
                                          flex={1}
                                        >
                                          {editingInline?.id === child.id &&
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
                                                if (e.key === "Enter")
                                                  saveInlineEdit();
                                                if (e.key === "Escape")
                                                  cancelInlineEdit();
                                              }}
                                              size="sm"
                                              autoFocus
                                              maxLength={300}
                                              placeholder="Description..."
                                            />
                                          ) : (
                                            <>
                                              <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                noOfLines={1}
                                                flex={1}
                                                cursor="pointer"
                                                onClick={() =>
                                                  startInlineEdit(child, "desc")
                                                }
                                                _hover={{
                                                  bg:
                                                    colorMode === "light"
                                                      ? "gray.100"
                                                      : "gray.700",
                                                }}
                                                p={1}
                                                rounded="sm"
                                              >
                                                - {child.wfgDesc}
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
                                            </>
                                          )}
                                        </HStack>
                                      )}
                                    </HStack>
                                    <HStack
                                      spacing={1}
                                      minW="280px"
                                      justify="flex-end"
                                    >
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={() =>
                                          moveItemOrder(
                                            child.id,
                                            "up",
                                            group.id
                                          )
                                        }
                                        isDisabled={childIdx === 0}
                                      >
                                        <FiChevronUp />
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={() =>
                                          moveItemOrder(
                                            child.id,
                                            "down",
                                            group.id
                                          )
                                        }
                                        isDisabled={
                                          childIdx ===
                                          group.workflowChild.length - 1
                                        }
                                      >
                                        <FiChevronDown />
                                      </Button>
                                      <Button
                                        size="xs"
                                        leftIcon={<FiPlus />}
                                        colorScheme="green"
                                        variant="ghost"
                                        onClick={() =>
                                          startAddChild(
                                            child.id,
                                            child.wfgLevel + 1
                                          )
                                        }
                                      >
                                        Add
                                      </Button>
                                      {(!child.workflowChild ||
                                        child.workflowChild.length === 0) && (
                                          <Button
                                            size="xs"
                                            leftIcon={<FiTrash2 />}
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() =>
                                              deleteItem(child.id, child.wfgName)
                                            }
                                          >
                                            Delete
                                          </Button>
                                        )}
                                    </HStack>
                                  </HStack>

                                  {/* Dynamic Add Child for Level 3 */}
                                  {addingChild?.parentId === child.id && (
                                    <HStack
                                      p={2}
                                      bg={
                                        colorMode === "light"
                                          ? "blue.50"
                                          : "blue.900"
                                      }
                                      border="2px dashed"
                                      borderColor="blue.300"
                                      rounded="md"
                                      ml={8}
                                      mt={1}
                                      spacing={3}
                                    >
                                      <Text
                                        fontSize="xs"
                                        color="gray.600"
                                        fontWeight="bold"
                                        minW="4"
                                        w="4"
                                      >
                                        {(child.workflowChild?.length || 0) + 1}
                                      </Text>
                                      <Input
                                        placeholder="Nama workflow..."
                                        value={newChildValues.name}
                                        onChange={(e) =>
                                          setNewChildValues((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            newChildValues.name.trim()
                                          )
                                            saveNewChild();
                                          if (e.key === "Escape")
                                            cancelAddChild();
                                        }}
                                        size="sm"
                                        autoFocus
                                        maxLength={100}
                                        minW="140px"
                                        w="140px"
                                      />
                                      <Input
                                        placeholder="Deskripsi (opsional)..."
                                        value={newChildValues.desc}
                                        onChange={(e) =>
                                          setNewChildValues((prev) => ({
                                            ...prev,
                                            desc: e.target.value,
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            newChildValues.name.trim()
                                          )
                                            saveNewChild();
                                          if (e.key === "Escape")
                                            cancelAddChild();
                                        }}
                                        size="sm"
                                        maxLength={300}
                                        flex={1}
                                      />
                                      <Button
                                        size="xs"
                                        colorScheme="green"
                                        onClick={saveNewChild}
                                        isDisabled={!newChildValues.name.trim()}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={cancelAddChild}
                                      >
                                        Cancel
                                      </Button>
                                    </HStack>
                                  )}

                                  {/* Level 3 - Grandchildren */}
                                  {child.workflowChild &&
                                    child.workflowChild.length > 0 &&
                                    expandedItems.has(child.id) && (
                                      <VStack
                                        spacing={1}
                                        align="stretch"
                                        pl={8}
                                        mt={1}
                                      >
                                        {child.workflowChild.map(
                                          (grandChild, grandChildIdx) => (
                                            <HStack
                                              key={grandChildIdx}
                                              p={2}
                                              bg={
                                                colorMode === "light"
                                                  ? "gray.50"
                                                  : "gray.600"
                                              }
                                              rounded="sm"
                                              justify="space-between"
                                              align="center"
                                            >
                                              <HStack
                                                spacing={3}
                                                flex={1}
                                                maxW="70%"
                                              >
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.600"
                                                  fontWeight="bold"
                                                  minW="6"
                                                  w="6"
                                                >
                                                  {grandChild.wfgOrder}
                                                </Text>
                                                <Text
                                                  fontSize="sm"
                                                  color={
                                                    colorMode === "light"
                                                      ? "gray.600"
                                                      : "gray.300"
                                                  }
                                                  minW="160px"
                                                  w="160px"
                                                >
                                                  {editingInline?.id ===
                                                    grandChild.id &&
                                                    editingInline?.field ===
                                                    "name" ? (
                                                    <Input
                                                      value={inlineValues.name}
                                                      onChange={(e) =>
                                                        setInlineValues(
                                                          (prev) => ({
                                                            ...prev,
                                                            name: e.target
                                                              .value,
                                                          })
                                                        )
                                                      }
                                                      onBlur={saveInlineEdit}
                                                      onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                          saveInlineEdit();
                                                        if (e.key === "Escape")
                                                          cancelInlineEdit();
                                                      }}
                                                      size="sm"
                                                      autoFocus
                                                      maxLength={100}
                                                    />
                                                  ) : (
                                                    <HStack
                                                      spacing={1}
                                                      alignItems="center"
                                                      position="relative"
                                                      role="group"
                                                    >
                                                      <Text
                                                        noOfLines={1}
                                                        cursor="pointer"
                                                        onClick={() =>
                                                          startInlineEdit(
                                                            grandChild,
                                                            "name"
                                                          )
                                                        }
                                                        _hover={{
                                                          bg:
                                                            colorMode ===
                                                              "light"
                                                              ? "gray.100"
                                                              : "gray.700",
                                                        }}
                                                        p={1}
                                                        rounded="sm"
                                                        flex={1}
                                                      >
                                                        {grandChild.wfgName}
                                                      </Text>
                                                      <Box
                                                        opacity={0}
                                                        _groupHover={{
                                                          opacity: 1,
                                                        }}
                                                        transition="opacity 0.2s"
                                                        color="gray.500"
                                                        fontSize="xs"
                                                      >
                                                        <FiEdit3 />
                                                      </Box>
                                                    </HStack>
                                                  )}
                                                </Text>
                                                {grandChild.wfgDesc && (
                                                  <HStack
                                                    spacing={1}
                                                    alignItems="center"
                                                    position="relative"
                                                    role="group"
                                                    flex={1}
                                                  >
                                                    {editingInline?.id ===
                                                      grandChild.id &&
                                                      editingInline?.field ===
                                                      "desc" ? (
                                                      <Input
                                                        value={
                                                          inlineValues.desc
                                                        }
                                                        onChange={(e) =>
                                                          setInlineValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              desc: e.target
                                                                .value,
                                                            })
                                                          )
                                                        }
                                                        onBlur={saveInlineEdit}
                                                        onKeyDown={(e) => {
                                                          if (e.key === "Enter")
                                                            saveInlineEdit();
                                                          if (
                                                            e.key === "Escape"
                                                          )
                                                            cancelInlineEdit();
                                                        }}
                                                        size="sm"
                                                        autoFocus
                                                        maxLength={300}
                                                        placeholder="Description..."
                                                      />
                                                    ) : (
                                                      <>
                                                        <Text
                                                          fontSize="xs"
                                                          color="gray.500"
                                                          noOfLines={1}
                                                          flex={1}
                                                          cursor="pointer"
                                                          onClick={() =>
                                                            startInlineEdit(
                                                              grandChild,
                                                              "desc"
                                                            )
                                                          }
                                                          _hover={{
                                                            bg:
                                                              colorMode ===
                                                                "light"
                                                                ? "gray.100"
                                                                : "gray.700",
                                                          }}
                                                          p={1}
                                                          rounded="sm"
                                                        >
                                                          - {grandChild.wfgDesc}
                                                        </Text>
                                                        <Box
                                                          opacity={0}
                                                          _groupHover={{
                                                            opacity: 1,
                                                          }}
                                                          transition="opacity 0.2s"
                                                          color="gray.500"
                                                          fontSize="xs"
                                                        >
                                                          <FiEdit3 />
                                                        </Box>
                                                      </>
                                                    )}
                                                  </HStack>
                                                )}
                                              </HStack>
                                              <HStack
                                                spacing={1}
                                                minW="220px"
                                                justify="flex-end"
                                              >
                                                <Button
                                                  size="xs"
                                                  variant="ghost"
                                                  colorScheme="gray"
                                                  onClick={() =>
                                                    moveItemOrder(
                                                      grandChild.id,
                                                      "up",
                                                      child.id
                                                    )
                                                  }
                                                  isDisabled={
                                                    grandChildIdx === 0
                                                  }
                                                >
                                                  <FiChevronUp />
                                                </Button>
                                                <Button
                                                  size="xs"
                                                  variant="ghost"
                                                  colorScheme="gray"
                                                  onClick={() =>
                                                    moveItemOrder(
                                                      grandChild.id,
                                                      "down",
                                                      child.id
                                                    )
                                                  }
                                                  isDisabled={
                                                    grandChildIdx ===
                                                    child.workflowChild.length -
                                                    1
                                                  }
                                                >
                                                  <FiChevronDown />
                                                </Button>
                                                <Button
                                                  size="xs"
                                                  leftIcon={<FiTrash2 />}
                                                  colorScheme="red"
                                                  variant="ghost"
                                                  onClick={() =>
                                                    deleteItem(
                                                      grandChild.id,
                                                      grandChild.wfgName
                                                    )
                                                  }
                                                >
                                                  Delete
                                                </Button>
                                              </HStack>
                                            </HStack>
                                          )
                                        )}
                                      </VStack>
                                    )}
                                </Box>
                              ))}

                              {/* Dynamic Add Child for Level 2 */}
                              {addingChild?.parentId === group.id && (
                                <HStack
                                  p={2}
                                  bg={
                                    colorMode === "light"
                                      ? "green.50"
                                      : "green.900"
                                  }
                                  border="2px dashed"
                                  borderColor="green.300"
                                  rounded="md"
                                  spacing={3}
                                >
                                  <Text
                                    fontSize="xs"
                                    color="gray.600"
                                    fontWeight="bold"
                                    minW="6"
                                    w="6"
                                  >
                                    {(group.workflowChild?.length || 0) + 1}
                                  </Text>
                                  <Input
                                    placeholder="Nama workflow..."
                                    value={newChildValues.name}
                                    onChange={(e) =>
                                      setNewChildValues((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        newChildValues.name.trim()
                                      )
                                        saveNewChild();
                                      if (e.key === "Escape") cancelAddChild();
                                    }}
                                    size="sm"
                                    autoFocus
                                    maxLength={100}
                                    minW="160px"
                                    w="160px"
                                  />
                                  <Input
                                    placeholder="Deskripsi (opsional)..."
                                    value={newChildValues.desc}
                                    onChange={(e) =>
                                      setNewChildValues((prev) => ({
                                        ...prev,
                                        desc: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        newChildValues.name.trim()
                                      )
                                        saveNewChild();
                                      if (e.key === "Escape") cancelAddChild();
                                    }}
                                    size="sm"
                                    maxLength={300}
                                    flex={1}
                                  />
                                  <Button
                                    size="xs"
                                    colorScheme="green"
                                    onClick={saveNewChild}
                                    isDisabled={!newChildValues.name.trim()}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={cancelAddChild}
                                  >
                                    Cancel
                                  </Button>
                                </HStack>
                              )}
                            </VStack>
                          )}

                        {/* Dynamic Add Child for Level 2 - Always show when adding */}
                        {addingChild?.parentId === group.id && (
                          <VStack spacing={1} align="stretch" pl={4} mt={1}>
                            <HStack
                              p={2}
                              bg={
                                colorMode === "light" ? "green.50" : "green.900"
                              }
                              border="2px dashed"
                              borderColor="green.300"
                              rounded="md"
                              spacing={3}
                            >
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                fontWeight="bold"
                                minW="6"
                                w="6"
                              >
                                {(group.workflowChild?.length || 0) + 1}
                              </Text>
                              <Input
                                placeholder="Nama workflow..."
                                value={newChildValues.name}
                                onChange={(e) =>
                                  setNewChildValues((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newChildValues.name.trim()
                                  )
                                    saveNewChild();
                                  if (e.key === "Escape") cancelAddChild();
                                }}
                                size="sm"
                                autoFocus
                                maxLength={100}
                                minW="160px"
                                w="160px"
                              />
                              <Input
                                placeholder="Deskripsi (opsional)..."
                                value={newChildValues.desc}
                                onChange={(e) =>
                                  setNewChildValues((prev) => ({
                                    ...prev,
                                    desc: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newChildValues.name.trim()
                                  )
                                    saveNewChild();
                                  if (e.key === "Escape") cancelAddChild();
                                }}
                                size="sm"
                                maxLength={300}
                                flex={1}
                              />
                              <Button
                                size="xs"
                                colorScheme="green"
                                onClick={saveNewChild}
                                isDisabled={!newChildValues.name.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={cancelAddChild}
                              >
                                Cancel
                              </Button>
                            </HStack>
                          </VStack>
                        )}
                      </Box>
                    ))}

                    {localWorkflowData.length === 0 && (
                      <Box textAlign="center" py={8}>
                        <FiFrown
                          size={32}
                          color="gray.400"
                          style={{ margin: "0 auto 8px" }}
                        />
                        <Text color="gray.500" fontSize="sm">
                          No workflow groups found
                        </Text>
                      </Box>
                    )}
                  </VStack>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Add Workflow Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={formik.handleSubmit}>
            <ModalHeader>Tambah Workflow Baru</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl
                  isInvalid={
                    !!(formik.errors.wfgName && formik.touched.wfgName)
                  }
                >
                  <FormLabel>Nama Workflow</FormLabel>
                  <Input
                    name="wfgName"
                    value={formik.values.wfgName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Masukkan nama workflow"
                  />
                  <FormErrorMessage>{formik.errors.wfgName}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(formik.errors.wfgDesc && formik.touched.wfgDesc)
                  }
                >
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <Textarea
                    name="wfgDesc"
                    value={formik.values.wfgDesc}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Masukkan deskripsi workflow"
                    rows={3}
                    maxLength={300}
                  />
                  <FormErrorMessage>{formik.errors.wfgDesc}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Batal
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={formik.isSubmitting}
              >
                Simpan
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Workflow Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={editFormik.handleSubmit}>
            <ModalHeader>Edit Workflow</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl
                  isInvalid={
                    !!(editFormik.errors.wfgName && editFormik.touched.wfgName)
                  }
                >
                  <FormLabel>Nama Workflow</FormLabel>
                  <Input
                    name="wfgName"
                    value={editFormik.values.wfgName}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    placeholder="Masukkan nama workflow"
                  />
                  <FormErrorMessage>
                    {editFormik.errors.wfgName}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(editFormik.errors.wfgDesc && editFormik.touched.wfgDesc)
                  }
                >
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <Textarea
                    name="wfgDesc"
                    value={editFormik.values.wfgDesc}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    placeholder="Masukkan deskripsi workflow"
                    rows={3}
                    maxLength={300}
                  />
                  <FormErrorMessage>
                    {editFormik.errors.wfgDesc}
                  </FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Batal
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={editFormik.isSubmitting}
              >
                Simpan
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Add Child Workflow Modal */}
      <Modal isOpen={isAddChildOpen} onClose={onAddChildClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={addChildFormik.handleSubmit}>
            <ModalHeader>Tambah Item Child</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl
                  isInvalid={
                    !!(
                      addChildFormik.errors.wfgName &&
                      addChildFormik.touched.wfgName
                    )
                  }
                >
                  <FormLabel>Nama Workflow</FormLabel>
                  <Input
                    name="wfgName"
                    value={addChildFormik.values.wfgName}
                    onChange={addChildFormik.handleChange}
                    onBlur={addChildFormik.handleBlur}
                    placeholder="Masukkan nama workflow"
                  />
                  <FormErrorMessage>
                    {addChildFormik.errors.wfgName}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(
                      addChildFormik.errors.wfgDesc &&
                      addChildFormik.touched.wfgDesc
                    )
                  }
                >
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <Textarea
                    name="wfgDesc"
                    value={addChildFormik.values.wfgDesc}
                    onChange={addChildFormik.handleChange}
                    onBlur={addChildFormik.handleBlur}
                    placeholder="Masukkan deskripsi workflow"
                    rows={3}
                    maxLength={300}
                  />
                  <FormErrorMessage>
                    {addChildFormik.errors.wfgDesc}
                  </FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddChildClose}>
                Batal
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={addChildFormik.isSubmitting}
              >
                Simpan
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpenTrigger={showConfirmDialog}
        action={handleConfirmedSubmit}
        trigger={setShowConfirmDialog}
        questionMsg={`Apakah Anda yakin akan menambahkan workflow "${pendingFormValues?.wfgName}"?`}
        captionMsg="Konfirmasi Simpan"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpenTrigger={showDeleteDialog}
        action={handleConfirmedDelete}
        trigger={setShowDeleteDialog}
        questionMsg={`Apakah Anda yakin akan menghapus workflow "${pendingDeleteItem?.name}"?`}
        captionMsg="Konfirmasi Hapus"
      />

      {/* Edit Confirmation Dialog */}
      <ConfirmationDialog
        isOpenTrigger={showEditDialog}
        action={handleConfirmedEdit}
        trigger={setShowEditDialog}
        questionMsg={`Apakah Anda yakin akan mengubah workflow "${pendingEditValues?.wfgName}"?`}
        captionMsg="Konfirmasi Ubah"
      />

      {/* Add Child Confirmation Dialog */}
      <ConfirmationDialog
        isOpenTrigger={showAddChildDialog}
        action={handleConfirmedAddChild}
        trigger={setShowAddChildDialog}
        questionMsg={`Apakah Anda yakin akan menambahkan item child "${pendingAddChildValues?.wfgName}"?`}
        captionMsg="Konfirmasi Simpan"
      />
    </LayoutAdmin>
  );
}

export default WorkflowDetailView;
