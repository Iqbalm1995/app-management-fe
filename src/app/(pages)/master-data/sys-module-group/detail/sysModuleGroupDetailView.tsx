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
} from "@/app/services/useSysModuleGroup";
import useMenus, { MenuResponse } from "@/app/services/useMenus";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
  MAX_SIZE_TABLE,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
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
  IconButton,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("id");

  const { GetDetailById, Update, GetAssignedMenus, AssignMenus, GetStatusFlows, InsertStatusFlow, UpdateStatusFlow, DeleteStatusFlow, GetUserApprovers, AddUserApprover, RemoveUserApprover } = useSysModuleGroup();
  const { List: GetMenuList } = useMenus();
  const { List: GetUserList } = useUsers();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ModuleGroupData, setModuleGroupData] = useState<SysModuleGroupResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [menuList, setMenuList] = useState<MenuResponse[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isSavingMenus, setIsSavingMenus] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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

  const [HeaderDataContent, setHeaderDataContent] = useState<HeaderContentProps>({
    titleName: "Module Group Details",
    breadCrumb: ["Home", "Master Data", "System Module Group", "Details"],
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
      await handleUpdate(values);
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
  }, [DataAuth]);

  useEffect(() => {
    if (DataAuth && tokenData && moduleId) {
      fetchModuleGroupData();
      fetchMenuList();
      fetchAssignedMenus();
      fetchStatusFlows();
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
    } catch (error) {
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
    } catch (error) {
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
          description: "Menus assigned successfully",
          statusToast: "success",
        });
        fetchAssignedMenus();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
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
            // Check grandparent
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
    setUserApprovers([]);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setIsStatusFlowModalOpen(true);
  };

  const handleEditStatusFlow = (flow: SysModuleStatusFlowResponse) => {
    setEditingStatusFlow(flow);
    
    // When editing, keep the existing previousCodeStatus and nextCodeStatus
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
    
    // Load user approvers if requires approval
    if (flow.isConfirmApproval === "Y") {
      fetchUserApprovers(flow.id);
    }
    
    setIsStatusFlowModalOpen(true);
  };

  const handleSaveStatusFlow = async () => {
    if (!moduleId || !statusFlowForm.codeStatus || !statusFlowForm.nameStatus) {
      showToast({
        description: "Code and Name are required",
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
          userApproverIds: statusFlowForm.isConfirmApproval === "Y" ? userApprovers.map(a => a.userSysId) : undefined,
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
    } catch (error) {
      showToast({
        description: "Error saving status flow",
        statusToast: "error",
      });
    } finally {
      setIsSavingStatusFlow(false);
    }
  };

  const handleDeleteStatusFlow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this status flow?")) {
      return;
    }

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
    } catch (error) {
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
        description: "User already added as approver",
        statusToast: "warning",
      });
      return;
    }

    // If editing existing status flow, call API immediately
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
            description: "User approver added successfully",
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
      } catch (error) {
        showToast({
          description: "Error adding user approver",
          statusToast: "error",
        });
      }
    } else {
      // If creating new status flow, just add to local state
      const newApprover: SysModuleStatusUserApproverResponse = {
        id: `temp-${Date.now()}`, // Temporary ID
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
    // If creating new status flow, just remove from local state
    if (!editingStatusFlow?.id) {
      setUserApprovers(userApprovers.filter((a) => a.id !== approverId));
      return;
    }

    // If editing, call API
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
    } catch (error) {
      showToast({
        description: "Error removing user approver",
        statusToast: "error",
      });
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => router.push("/master-data/sys-module-group")}
            >
              Back to List
            </Button>
          </HStack>

          <Tabs index={activeTabIndex} onChange={setActiveTabIndex} colorScheme="blue">
            <TabList>
              <Tab>
                <HStack>
                  <FiInfo />
                  <Text>General</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <FiMenu />
                  <Text>Menu Module Contains</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <FiGitBranch />
                  <Text>Status Flow</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* General Tab */}
              <TabPanel>
                <Card shadow="sm" rounded={radiusStyle}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Module Group Information</Heading>
                      {!isEditMode ? (
                        <Button
                          leftIcon={<FiEdit />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => setIsEditMode(true)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <HStack>
                          <Button
                            leftIcon={<FiSave />}
                            colorScheme="green"
                            size="sm"
                            onClick={() => formik.handleSubmit()}
                            isLoading={isUpdating}
                          >
                            Save
                          </Button>
                          <Button
                            leftIcon={<FiX />}
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      )}
                    </HStack>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <form onSubmit={formik.handleSubmit}>
                      <Stack spacing={4}>
                        <FormControl isInvalid={!!formik.errors.modCode && formik.touched.modCode}>
                          <FormLabel>Module Code</FormLabel>
                          <Input
                            name="modCode"
                            value={formik.values.modCode}
                            onChange={formik.handleChange}
                            isDisabled={!isEditMode}
                          />
                          <FormErrorMessage>{formik.errors.modCode}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!formik.errors.modName && formik.touched.modName} isRequired>
                          <FormLabel>Module Name</FormLabel>
                          <Input
                            name="modName"
                            value={formik.values.modName}
                            onChange={formik.handleChange}
                            isDisabled={!isEditMode}
                          />
                          <FormErrorMessage>{formik.errors.modName}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!formik.errors.modDescriptions && formik.touched.modDescriptions}>
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            name="modDescriptions"
                            value={formik.values.modDescriptions}
                            onChange={formik.handleChange}
                            isDisabled={!isEditMode}
                            rows={4}
                          />
                          <FormErrorMessage>{formik.errors.modDescriptions}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Status</FormLabel>
                          <Select
                            name="isActive"
                            value={formik.values.isActive}
                            onChange={formik.handleChange}
                            isDisabled={!isEditMode}
                          >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                          </Select>
                        </FormControl>
                      </Stack>
                    </form>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Menu Module Contains Tab */}
              <TabPanel>
                <Card shadow="sm" rounded={radiusStyle}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Menu Access</Heading>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleSaveMenus}
                        isLoading={isSavingMenus}
                      >
                        Save Menu Access
                      </Button>
                    </HStack>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text fontSize="sm" color="gray.600">
                        Select menus to assign to this module group. Parent menus will be automatically selected when children are checked.
                      </Text>
                      <Box
                        maxH="500px"
                        overflowY="auto"
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        rounded="md"
                        p={3}
                      >
                        {menuList.length === 0 ? (
                          <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                            No menus available
                          </Text>
                        ) : (
                          <VStack spacing={2} align="stretch">
                            {buildMenuTree(menuList).map((menu) => {
                              const childCount = countAllChildren(menu.id);
                              const isExpanded = expandedMenus.has(menu.id);
                              const hasChildren = getMenuChildren(menu.id).length > 0;

                              return (
                                <Box key={menu.id}>
                                  <Box p={2} bg={colorMode === "light" ? "blue.50" : "blue.900"} border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.700"} rounded="md">
                                    <HStack spacing={2}>
                                      <Checkbox
                                        isChecked={selectedMenus.has(menu.id)}
                                        onChange={(e) => toggleMenu(menu.id, e.target.checked)}
                                        colorScheme="blue"
                                        size="sm"
                                      />
                                      <Text fontSize="sm" fontWeight="semibold" flex={1}>
                                        {menu.menuName}
                                        {childCount > 0 && (
                                          <Badge ml={2} colorScheme="blue" fontSize="xs">
                                            {childCount} sub
                                          </Badge>
                                        )}
                                      </Text>
                                      {hasChildren && (
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          onClick={() => toggleExpand(menu.id)}
                                        >
                                          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                        </Button>
                                      )}
                                    </HStack>
                                  </Box>
                                  {isExpanded && hasChildren && (
                                    <VStack spacing={1} align="stretch" pl={4} mt={1}>
                                      {getMenuChildren(menu.id).map((child) => {
                                        const grandChildCount = countAllChildren(child.id);
                                        const isChildExpanded = expandedMenus.has(child.id);
                                        const hasGrandChildren = getMenuChildren(child.id).length > 0;

                                        return (
                                          <Box key={child.id}>
                                            <Box p={2} bg={colorMode === "light" ? "green.50" : "green.900"} border="1px" borderColor={colorMode === "light" ? "green.200" : "green.700"} rounded="md">
                                              <HStack spacing={2}>
                                                <Checkbox
                                                  isChecked={selectedMenus.has(child.id)}
                                                  onChange={(e) => toggleMenu(child.id, e.target.checked)}
                                                  colorScheme="green"
                                                  size="sm"
                                                />
                                                <Text fontSize="sm" fontWeight="medium" flex={1}>
                                                  {child.menuName}
                                                  {grandChildCount > 0 && (
                                                    <Badge ml={2} colorScheme="green" fontSize="xs">
                                                      {grandChildCount} sub
                                                    </Badge>
                                                  )}
                                                </Text>
                                                {hasGrandChildren && (
                                                  <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => toggleExpand(child.id)}
                                                  >
                                                    {isChildExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                                  </Button>
                                                )}
                                              </HStack>
                                            </Box>
                                            {isChildExpanded && hasGrandChildren && (
                                              <VStack spacing={1} align="stretch" pl={4} mt={1}>
                                                {getMenuChildren(child.id).map((grandChild) => (
                                                  <Box key={grandChild.id} p={2} bg={colorMode === "light" ? "purple.50" : "purple.900"} border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.700"} rounded="md">
                                                    <HStack spacing={2}>
                                                      <Checkbox
                                                        isChecked={selectedMenus.has(grandChild.id)}
                                                        onChange={(e) => toggleMenu(grandChild.id, e.target.checked)}
                                                        colorScheme="purple"
                                                        size="sm"
                                                      />
                                                      <Text fontSize="sm" flex={1}>{grandChild.menuName}</Text>
                                                    </HStack>
                                                  </Box>
                                                ))}
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

              {/* Status Flow Tab */}
              <TabPanel>
                <Card shadow="sm" rounded={radiusStyle}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Status Flow</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleOpenStatusFlowModal}
                      >
                        Add Status
                      </Button>
                    </HStack>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    {(() => {
                      const finishCount = statusFlows.filter(f => f.isFinish === "Y").length;
                      const hasWarning = finishCount === 0;
                      
                      return (
                        <VStack align="stretch" spacing={4}>
                          {hasWarning && statusFlows.length > 0 && (
                            <Box
                              p={4}
                              bg="orange.50"
                              border="2px"
                              borderColor="orange.400"
                              rounded="md"
                            >
                              <HStack>
                                <Badge colorScheme="orange" fontSize="md">WARNING</Badge>
                                <Text color="orange.700" fontWeight="medium">
                                  No finish status defined. Please mark at least one status as finish.
                                </Text>
                              </HStack>
                            </Box>
                          )}
                          {statusFlows.length === 0 ? (
                            <Flex justify="center" align="center" minH="300px">
                              <VStack spacing={4}>
                                <Text color="gray.500" fontSize="lg">
                                  No status flows defined yet
                                </Text>
                                <Button
                                  leftIcon={<FiPlus />}
                                  colorScheme="blue"
                                  size="lg"
                                  onClick={handleOpenStatusFlowModal}
                                >
                                  Create Status Flow
                                </Button>
                              </VStack>
                            </Flex>
                          ) : (
                            statusFlows.map((flow, index) => {
                              const nextFlows = statusFlows.filter(f => f.nextCodeStatus === flow.codeStatus);
                              const hasBranching = flow.isConfirmApproval === "Y";
                              
                              return (
                                <Box key={flow.id}>
                                  <HStack
                                    p={4}
                                    bg={colorMode === "light" ? "blue.50" : "blue.900"}
                                    border="2px"
                                    borderColor={flow.isFinish === "Y" ? "green.500" : "blue.500"}
                                    rounded="md"
                                    justify="space-between"
                                  >
                                    <HStack spacing={4} flex={1}>
                                      <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                                        {index + 1}
                                      </Badge>
                                      <VStack align="start" spacing={1}>
                                        <HStack>
                                          <Text fontWeight="bold" fontSize="lg">
                                            {flow.nameStatus}
                                          </Text>
                                          {flow.isFinish === "Y" && (
                                            <Badge colorScheme="green">FINISH</Badge>
                                          )}
                                          {hasBranching && (
                                            <Badge colorScheme="orange">APPROVAL POINT</Badge>
                                          )}
                                          {flow.isDisplayOnChoice === "Y" && (
                                            <Badge colorScheme="blue">DISPLAY ON CHOICE</Badge>
                                          )}
                                        </HStack>
                                        {flow.descriptions && (
                                          <Text fontSize="sm" color="gray.600">
                                            {flow.descriptions}
                                          </Text>
                                        )}
                                        {flow.nextCodeStatus && (
                                          <HStack spacing={2}>
                                            <Badge colorScheme="purple" variant="outline">
                                              Next: {statusFlows.find(f => f.codeStatus === flow.nextCodeStatus)?.nameStatus || flow.nextCodeStatus}
                                            </Badge>
                                          </HStack>
                                        )}
                                      </VStack>
                                    </HStack>
                                    <HStack>
                                      <Button
                                        size="sm"
                                        leftIcon={<FiEdit />}
                                        onClick={() => handleEditStatusFlow(flow)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        colorScheme="red"
                                        leftIcon={<FiTrash2 />}
                                        onClick={() => handleDeleteStatusFlow(flow.id)}
                                      >
                                        Delete
                                      </Button>
                                    </HStack>
                                  </HStack>
                                  {hasBranching && nextFlows.length > 0 && (
                                    <Flex justify="center" py={2}>
                                      <VStack spacing={1}>
                                        <Text fontSize="xs" color="gray.500">Branching Flow</Text>
                                        <HStack spacing={4}>
                                          <Badge colorScheme="green">Approved →</Badge>
                                          <Badge colorScheme="red">Declined →</Badge>
                                        </HStack>
                                      </VStack>
                                    </Flex>
                                  )}
                                  {!hasBranching && flow.nextCodeStatus && flow.isFinish === "N" && (
                                    <Flex justify="center" py={2}>
                                      <FiChevronDown size={24} color="gray" />
                                    </Flex>
                                  )}
                                </Box>
                              );
                            })
                          )}
                    </VStack>
                      );
                    })()}

                    {/* Flow Diagram Section */}
                    {statusFlows.length > 0 && (
                      <>
                        <Divider my={6} />
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Flow Diagram</Heading>
                          <Box
                            p={6}
                            bg={colorMode === "light" ? "gray.50" : "gray.800"}
                            rounded="md"
                            border="1px"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                          >
                            {(() => {
                              // Build map by codeStatus
                              const flowMap = new Map<string, SysModuleStatusFlowResponse>();
                              statusFlows.forEach(f => flowMap.set(f.codeStatus, f));

                              // Find start node (no previous)
                              const startNode = statusFlows.find(f => !f.previousCodeStatus);

                              if (!startNode) {
                                return (
                                  <Text color="gray.500" textAlign="center">
                                    No start node found. Set one status without Previous Status.
                                  </Text>
                                );
                              }

                              // Build flow sections
                              const sections: Array<{
                                label: string;
                                node: SysModuleStatusFlowResponse;
                                color: string;
                              }> = [];

                              const visited = new Set<string>();

                              const buildSections = (currentCode: string, context: string = "Main Flow") => {
                                if (visited.has(currentCode)) return;
                                visited.add(currentCode);

                                const current = flowMap.get(currentCode);
                                if (!current) return;

                                const isApproval = current.isConfirmApproval === "Y";
                                const isFinish = current.isFinish === "Y";

                                // Determine color
                                let color = "blue";
                                if (isFinish) color = "green";
                                else if (isApproval) color = "orange";

                                sections.push({
                                  label: context,
                                  node: current,
                                  color: color
                                });

                                // Find next node
                                const approvedNext = current.nextCodeStatus ? flowMap.get(current.nextCodeStatus) : null;
                                
                                // Find declined branches
                                const declinedBranches = statusFlows.filter(f => 
                                  f.previousCodeStatus === current.codeStatus && 
                                  f.codeStatus !== current.nextCodeStatus
                                );

                                // Continue main/approved flow
                                if (approvedNext) {
                                  const nextContext = isApproval ? "Approved Path" : context;
                                  buildSections(approvedNext.codeStatus, nextContext);
                                }

                                // Process declined branches
                                declinedBranches.forEach(declined => {
                                  buildSections(declined.codeStatus, "Declined Path");
                                });
                              };

                              buildSections(startNode.codeStatus);

                              return (
                                <VStack align="stretch" spacing={0} divider={<Divider />}>
                                  {sections.map((section, index) => (
                                    <HStack
                                      key={`${section.node.codeStatus}-${index}`}
                                      spacing={0}
                                      align="stretch"
                                      minH="80px"
                                    >
                                      {/* Context Label Column */}
                                      <Box
                                        w="150px"
                                        bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                        borderRight="2px solid"
                                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        p={2}
                                      >
                                        <Text
                                          fontSize="sm"
                                          fontWeight="semibold"
                                          color={
                                            section.label === "Approved Path" ? "green.600" :
                                            section.label === "Declined Path" ? "red.600" :
                                            "gray.600"
                                          }
                                          textAlign="center"
                                        >
                                          {section.label}
                                        </Text>
                                      </Box>

                                      {/* Node Content Column */}
                                      <Box flex={1} p={4} display="flex" alignItems="center">
                                        <HStack
                                          w="full"
                                          p={3}
                                          bg={colorMode === "light" ? "white" : "gray.600"}
                                          border="2px solid"
                                          borderColor={`${section.color}.500`}
                                          rounded="lg"
                                          shadow="sm"
                                          spacing={3}
                                        >
                                          <Box
                                            w="40px"
                                            h="40px"
                                            bg={`${section.color}.500`}
                                            color="white"
                                            rounded="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontWeight="bold"
                                            flexShrink={0}
                                          >
                                            {section.node.statusOrder}
                                          </Box>
                                          <VStack align="start" spacing={0} flex={1}>
                                            <Text fontWeight="bold">{section.node.nameStatus}</Text>
                                            <Text fontSize="xs" color="gray.500">
                                              {section.node.codeStatus}
                                            </Text>
                                          </VStack>
                                          <HStack spacing={1}>
                                            {section.node.isFinish === "Y" && (
                                              <Badge colorScheme="green" fontSize="xs">FINISH</Badge>
                                            )}
                                            {section.node.isConfirmApproval === "Y" && (
                                              <Badge colorScheme="orange" fontSize="xs">APPROVAL</Badge>
                                            )}
                                          </HStack>
                                        </HStack>
                                      </Box>
                                    </HStack>
                                  ))}
                                </VStack>
                              );
                            })()}
                          </Box>
                        </VStack>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>

      {/* Status Flow Modal */}
      <Modal 
        isOpen={isStatusFlowModalOpen} 
        onClose={() => {
          setIsStatusFlowModalOpen(false);
          setUserApprovers([]);
          setUserSearchQuery("");
          setUserSearchResults([]);
        }} 
        size={statusFlowForm.isConfirmApproval === "Y" ? "6xl" : "lg"}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} rounded={radiusStyle} shadow="2xl">
          <ModalHeader fontSize="xl" fontWeight="bold">
            {editingStatusFlow ? "Edit Status Flow" : "Add New Status Flow"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={statusFlowForm.isConfirmApproval === "Y" ? { base: 1, lg: 2 } : 1} spacing={6}>
              {/* Left: Form Fields */}
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Name Status</FormLabel>
                  <Input
                    value={statusFlowForm.nameStatus}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setStatusFlowForm({ 
                        ...statusFlowForm, 
                        nameStatus: value,
                        codeStatus: value 
                      });
                    }}
                    placeholder="e.g., DRAFT STATUS"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={statusFlowForm.descriptions}
                    onChange={(e) =>
                      setStatusFlowForm({ ...statusFlowForm, descriptions: e.target.value })
                    }
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>

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
                  >
                    Requires Approval? (Creates branching flow)
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
                  >
                    Is Finish Status?
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
                  >
                    Display on Choice?
                  </Checkbox>
                </FormControl>

                <FormControl>
                  <FormLabel>Previous Status (Incoming From)</FormLabel>
                  <Select
                    value={statusFlowForm.previousCodeStatus}
                    onChange={(e) =>
                      setStatusFlowForm({ ...statusFlowForm, previousCodeStatus: e.target.value })
                    }
                    placeholder="Select previous status"
                  >
                    {statusFlows
                      .filter((f) => f.id !== editingStatusFlow?.id)
                      .map((flow) => (
                        <option key={flow.id} value={flow.codeStatus}>
                          {flow.nameStatus}
                        </option>
                      ))}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Which status flows into this one
                  </Text>
                </FormControl>

                {statusFlowForm.isFinish === "N" && (
                  <FormControl>
                    <FormLabel>Next Status (Approved Path)</FormLabel>
                    <Select
                      value={statusFlowForm.nextCodeStatus}
                      onChange={(e) =>
                        setStatusFlowForm({ ...statusFlowForm, nextCodeStatus: e.target.value })
                      }
                      placeholder="Select next status"
                    >
                      {statusFlows
                        .filter((f) => f.id !== editingStatusFlow?.id)
                        .map((flow) => (
                          <option key={flow.id} value={flow.codeStatus}>
                            {flow.nameStatus}
                          </option>
                        ))}
                    </Select>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {statusFlowForm.isConfirmApproval === "Y" 
                        ? "This is the approved path. Declined items can branch to other statuses."
                        : "Standard next status in the flow"
                      }
                    </Text>
                  </FormControl>
                )}
              </VStack>

              {/* Right: User Approvers Management */}
              {statusFlowForm.isConfirmApproval === "Y" && (
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="semibold">User Approvers Management</Text>
                  
                  {/* Search */}
                  <FormControl>
                    <FormLabel fontSize="sm">Search Users (min 2 characters)</FormLabel>
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray" />
                      </InputLeftElement>
                      <Input
                        value={userSearchQuery}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                        placeholder="Search by User ID or Name"
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Search Results */}
                  {userSearchQuery.length >= 2 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Search Results</Text>
                      <Box 
                        maxH="150px" 
                        overflowY="auto"
                        border="1px"
                        borderColor="gray.200"
                        rounded="md"
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                      >
                        {isSearchingUsers ? (
                          <VStack py={4}>
                            <Spinner size="sm" color="orange.500" />
                            <Text fontSize="xs" color="gray.500">Searching...</Text>
                          </VStack>
                        ) : userSearchResults.length > 0 ? (
                          <VStack spacing={0} align="stretch">
                            {userSearchResults.map((user) => {
                              const isAlreadyAdded = userApprovers.some((a) => a.userSysId === user.id);
                              return (
                                <HStack
                                  key={user.id}
                                  p={2}
                                  spacing={2}
                                  cursor={isAlreadyAdded ? "not-allowed" : "pointer"}
                                  opacity={isAlreadyAdded ? 0.5 : 1}
                                  _hover={!isAlreadyAdded ? {
                                    bg: colorMode === "light" ? "gray.50" : "gray.600"
                                  } : {}}
                                  onClick={() => !isAlreadyAdded && handleAddUserApprover(user)}
                                  borderBottom="1px"
                                  borderColor="gray.100"
                                >
                                  <Avatar name={user.nama} size="xs" src={user.profilePict || undefined} />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="xs" fontWeight={600}>{user.nama}</Text>
                                    <Text fontSize="2xs" color="gray.500">{user.userId}</Text>
                                  </VStack>
                                  {isAlreadyAdded && (
                                    <Badge colorScheme="green" fontSize="2xs">Added</Badge>
                                  )}
                                </HStack>
                              );
                            })}
                          </VStack>
                        ) : (
                          <Text textAlign="center" fontSize="xs" color="gray.500" py={4}>
                            No users found
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Assigned Approvers */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">Assigned Approvers</Text>
                      <Badge colorScheme="orange">{userApprovers.length}</Badge>
                    </HStack>
                    <Box
                      maxH="250px"
                      overflowY="auto"
                      border="1px"
                      borderColor="orange.200"
                      rounded="md"
                      bg={colorMode === "dark" ? "gray.700" : "orange.50"}
                      p={2}
                    >
                      {userApprovers.length === 0 ? (
                        <Text textAlign="center" fontSize="xs" color="gray.500" py={4}>
                          No approvers assigned
                        </Text>
                      ) : (
                        <VStack spacing={2} align="stretch">
                          {userApprovers.map((approver) => (
                            <HStack
                              key={approver.id}
                              p={2}
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              rounded="md"
                              border="1px"
                              borderColor="gray.200"
                              spacing={2}
                            >
                              <Avatar 
                                name={approver.userData?.nama || "User"} 
                                size="xs"
                                src={approver.userData?.profilePict || undefined}
                              />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontSize="xs" fontWeight={600}>
                                  {approver.userData?.nama || "Unknown"}
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                  {approver.userData?.userId || approver.userSysId}
                                </Text>
                              </VStack>
                              <IconButton
                                aria-label="Remove approver"
                                icon={<FiTrash2 />}
                                colorScheme="red"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleRemoveUserApprover(approver.id)}
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
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsStatusFlowModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveStatusFlow}
              isLoading={isSavingStatusFlow}
            >
              {editingStatusFlow ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

export default SysModuleGroupDetailView;
