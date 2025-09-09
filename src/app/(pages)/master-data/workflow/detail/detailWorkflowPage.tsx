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
import useWorkflow, { WorkflowGroupResponse, WorkflowGroupUpdatePayload, WorkflowGroupInsertPayload } from "@/app/services/useWorkflow";
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
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // hook services
  const { GetWorkflowCategoryById } = useWorkflowCategory();
  const { ListWorkflowGroups, UpdateWorkflowGroup, InsertWorkflowGroup, DeleteWorkflowGroup } = useWorkflow();

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
  const [localWorkflowData, setLocalWorkflowData] = useState<WorkflowGroupResponse[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedItems, setChangedItems] = useState<{
    updated: Set<string>;
    added: Set<string>;
    deleted: Set<string>;
  }>({
    updated: new Set(),
    added: new Set(),
    deleted: new Set()
  });

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<{wfgName: string; wfgDesc: string} | null>(null);
  
  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{id: string; name: string} | null>(null);
  
  // Edit confirmation dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingEditValues, setPendingEditValues] = useState<{id: string; wfgName: string; wfgDesc: string} | null>(null);
  const [editingItem, setEditingItem] = useState<WorkflowGroupResponse | null>(null);

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

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
        const findItem = (items: WorkflowGroupResponse[]): WorkflowGroupResponse | null => {
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
          wfgOrder: item.wfgOrder
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
          deleted: new Set()
        });
        
        // Refresh data from server
        setRefreshData(prev => prev + 1);
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
    wfgDesc: Yup.string()
      .max(300, "Maksimal 300 karakter"),
  });

  // Formik form handling
  const formik = useFormik<{wfgName: string; wfgDesc: string}>({
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
  const editFormik = useFormik<{wfgName: string; wfgDesc: string}>({
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
        wfgDesc: values.wfgDesc
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
      wfgOrder: editingItem?.wfgOrder || 1
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
      wfgDesc: item.wfgDesc || ""
    });
    onEditOpen();
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

  // Move item up/down within same level
  const moveItemOrder = (itemId: string, direction: 'up' | 'down', parentId?: string) => {
    const newData = [...localWorkflowData];
    
    // Find the target array to work with
    let targetItems: WorkflowGroupResponse[];
    
    if (!parentId) {
      // Root level items
      targetItems = newData;
    } else {
      // Find parent and get its children
      const findParent = (items: WorkflowGroupResponse[]): WorkflowGroupResponse[] | null => {
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
    const itemIndex = targetItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    // Calculate new index
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= targetItems.length) return;

    // Swap items
    const temp = targetItems[itemIndex];
    targetItems[itemIndex] = targetItems[newIndex];
    targetItems[newIndex] = temp;

    // Update wfgOrder values
    targetItems[itemIndex].wfgOrder = itemIndex + 1;
    targetItems[newIndex].wfgOrder = newIndex + 1;

    // Mark items as changed
    setChangedItems(prev => ({
      ...prev,
      updated: new Set([...prev.updated, targetItems[itemIndex].id, targetItems[newIndex].id])
    }));

    setLocalWorkflowData(newData);
    setHasChanges(true);
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

  const RefreshAction = () => {
    setDataWorkflowCategory(null);
    setDataWorkflowGroups([]);
    setRefreshData(RefreshData + 1);
  };

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
                  ></GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                      <Button
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Muat Ulang
                      </Button>
                      <Button
                        size={"sm"}
                        colorScheme={"secondary"}
                        leftIcon={<FiSave />}
                        isLoading={ActionLoading}
                        onClick={saveChanges}
                        isDisabled={!hasChanges}
                      >
                        Simpan Perubahan
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
                {/* RENDER DATA */}
                {hasChanges && (
                  <Alert status="warning" rounded="md" mb={4}>
                    <AlertIcon />
                    <AlertTitle>Perubahan Belum Disimpan!</AlertTitle>
                    <AlertDescription>
                      Anda memiliki perubahan yang belum disimpan. Klik "Simpan Perubahan" untuk menyimpan.
                    </AlertDescription>
                  </Alert>
                )}
                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : DataWorkflowCategory == null ? (
                  <InvalidLoadPageView />
                ) : (
                  <VStack spacing={4} align="stretch" w="full">
                    {/* Add New Root Item Button */}
                    <Box mb={4}>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={openAddModal}
                      >
                        Tambah Item Baru
                      </Button>
                    </Box>

                    {localWorkflowData.map((group, groupIdx) => (
                      <Box key={groupIdx} w="full">
                        {/* Level 1 - Main Group */}
                        <HStack
                          p={3}
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          border="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          rounded="md"
                          justify="space-between"
                          align="center"
                        >
                          <HStack spacing={3} flex={1} maxW="70%">
                            {group.workflowChild && group.workflowChild.length > 0 && (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => toggleExpand(group.id)}
                                p={0}
                                minW="auto"
                              >
                                {expandedItems.has(group.id) ? <FiChevronDown /> : <FiChevronRight />}
                              </Button>
                            )}
                            <Text fontSize="sm" color="gray.600" fontWeight="bold" minW="8" w="8">
                              {group.wfgOrder}
                            </Text>
                            <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"} minW="200px" w="200px" noOfLines={1}>
                              {group.wfgName}
                            </Text>
                            {group.wfgDesc && (
                              <Text fontSize="sm" color="gray.500" noOfLines={1} flex={1}>
                                - {group.wfgDesc}
                              </Text>
                            )}
                          </HStack>
                          <HStack spacing={1} minW="300px" justify="flex-end">
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              colorScheme="gray"
                              onClick={() => moveItemOrder(group.id, 'up')}
                              isDisabled={groupIdx === 0}
                            >
                              <FiChevronUp />
                            </Button>
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              colorScheme="gray"
                              onClick={() => moveItemOrder(group.id, 'down')}
                              isDisabled={groupIdx === localWorkflowData.length - 1}
                            >
                              <FiChevronDown />
                            </Button>
                            <Button size="xs" leftIcon={<FiPlus />} colorScheme="gray" variant="solid">
                              Add
                            </Button>
                            <Button 
                              size="xs" 
                              leftIcon={<FiEdit3 />} 
                              colorScheme="gray" 
                              variant="ghost"
                              onClick={() => openEditModal(group)}
                            >
                              Edit
                            </Button>
                            {(!group.workflowChild || group.workflowChild.length === 0) && (
                              <Button 
                                size="xs" 
                                leftIcon={<FiTrash2 />} 
                                colorScheme="red" 
                                variant="ghost"
                                onClick={() => deleteItem(group.id, group.wfgName)}
                              >
                                Delete
                              </Button>
                            )}
                          </HStack>
                        </HStack>

                        {/* Level 2 - Children */}
                        {group.workflowChild && group.workflowChild.length > 0 && expandedItems.has(group.id) && (
                          <VStack spacing={1} align="stretch" pl={4} mt={1}>
                            {group.workflowChild.map((child, childIdx) => (
                              <Box key={childIdx}>
                                <HStack
                                  p={2}
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="sm"
                                  justify="space-between"
                                  align="center"
                                >
                                  <HStack spacing={3} flex={1} maxW="70%">
                                    {child.workflowChild && child.workflowChild.length > 0 && (
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => toggleExpand(child.id)}
                                        p={0}
                                        minW="auto"
                                      >
                                        {expandedItems.has(child.id) ? <FiChevronDown /> : <FiChevronRight />}
                                      </Button>
                                    )}
                                    <Text fontSize="xs" color="gray.600" fontWeight="bold" minW="6" w="6">
                                      {child.wfgOrder}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.200"} minW="180px" w="180px" noOfLines={1}>
                                      {child.wfgName}
                                    </Text>
                                    {child.wfgDesc && (
                                      <Text fontSize="xs" color="gray.500" noOfLines={1} flex={1}>
                                        - {child.wfgDesc}
                                      </Text>
                                    )}
                                  </HStack>
                                  <HStack spacing={1} minW="280px" justify="flex-end">
                                    <Button 
                                      size="xs" 
                                      variant="ghost" 
                                      colorScheme="gray"
                                      onClick={() => moveItemOrder(child.id, 'up', group.id)}
                                      isDisabled={childIdx === 0}
                                    >
                                      <FiChevronUp />
                                    </Button>
                                    <Button 
                                      size="xs" 
                                      variant="ghost" 
                                      colorScheme="gray"
                                      onClick={() => moveItemOrder(child.id, 'down', group.id)}
                                      isDisabled={childIdx === group.workflowChild.length - 1}
                                    >
                                      <FiChevronDown />
                                    </Button>
                                    <Button size="xs" leftIcon={<FiPlus />} colorScheme="gray" variant="solid">
                                      Add
                                    </Button>
                                    <Button 
                                      size="xs" 
                                      leftIcon={<FiEdit3 />} 
                                      colorScheme="gray" 
                                      variant="ghost"
                                      onClick={() => openEditModal(child)}
                                    >
                                      Edit
                                    </Button>
                                    {(!child.workflowChild || child.workflowChild.length === 0) && (
                                      <Button 
                                        size="xs" 
                                        leftIcon={<FiTrash2 />} 
                                        colorScheme="red" 
                                        variant="ghost"
                                        onClick={() => deleteItem(child.id, child.wfgName)}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </HStack>
                                </HStack>

                                {/* Level 3 - Grandchildren */}
                                {child.workflowChild && child.workflowChild.length > 0 && expandedItems.has(child.id) && (
                                  <VStack spacing={1} align="stretch" pl={8} mt={1}>
                                    {child.workflowChild.map((grandChild, grandChildIdx) => (
                                      <HStack
                                        key={grandChildIdx}
                                        p={2}
                                        bg={colorMode === "light" ? "gray.50" : "gray.600"}
                                        rounded="sm"
                                        justify="space-between"
                                        align="center"
                                      >
                                        <HStack spacing={3} flex={1} maxW="70%">
                                          <Text fontSize="xs" color="gray.600" fontWeight="bold" minW="6" w="6">
                                            {grandChild.wfgOrder}
                                          </Text>
                                          <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.300"} minW="160px" w="160px" noOfLines={1}>
                                            {grandChild.wfgName}
                                          </Text>
                                          {grandChild.wfgDesc && (
                                            <Text fontSize="xs" color="gray.500" noOfLines={1} flex={1}>
                                              - {grandChild.wfgDesc}
                                            </Text>
                                          )}
                                        </HStack>
                                        <HStack spacing={1} minW="220px" justify="flex-end">
                                          <Button 
                                            size="xs" 
                                            variant="ghost" 
                                            colorScheme="gray"
                                            onClick={() => moveItemOrder(grandChild.id, 'up', child.id)}
                                            isDisabled={grandChildIdx === 0}
                                          >
                                            <FiChevronUp />
                                          </Button>
                                          <Button 
                                            size="xs" 
                                            variant="ghost" 
                                            colorScheme="gray"
                                            onClick={() => moveItemOrder(grandChild.id, 'down', child.id)}
                                            isDisabled={grandChildIdx === child.workflowChild.length - 1}
                                          >
                                            <FiChevronDown />
                                          </Button>
                                          <Button 
                                            size="xs" 
                                            leftIcon={<FiEdit3 />} 
                                            colorScheme="gray" 
                                            variant="ghost"
                                            onClick={() => openEditModal(grandChild)}
                                          >
                                            Edit
                                          </Button>
                                          <Button 
                                            size="xs" 
                                            leftIcon={<FiTrash2 />} 
                                            colorScheme="red" 
                                            variant="ghost"
                                            onClick={() => deleteItem(grandChild.id, grandChild.wfgName)}
                                          >
                                            Delete
                                          </Button>
                                        </HStack>
                                      </HStack>
                                    ))}
                                  </VStack>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    ))}
                    
                    {localWorkflowData.length === 0 && (
                      <Box textAlign="center" py={8}>
                        <FiFrown size={32} color="gray.400" style={{ margin: "0 auto 8px" }} />
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
                <FormControl isInvalid={!!(formik.errors.wfgName && formik.touched.wfgName)}>
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

                <FormControl isInvalid={!!(formik.errors.wfgDesc && formik.touched.wfgDesc)}>
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
                <FormControl isInvalid={!!(editFormik.errors.wfgName && editFormik.touched.wfgName)}>
                  <FormLabel>Nama Workflow</FormLabel>
                  <Input
                    name="wfgName"
                    value={editFormik.values.wfgName}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    placeholder="Masukkan nama workflow"
                  />
                  <FormErrorMessage>{editFormik.errors.wfgName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!(editFormik.errors.wfgDesc && editFormik.touched.wfgDesc)}>
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
                  <FormErrorMessage>{editFormik.errors.wfgDesc}</FormErrorMessage>
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
    </LayoutAdmin>
  );
}

export default WorkflowDetailView;
