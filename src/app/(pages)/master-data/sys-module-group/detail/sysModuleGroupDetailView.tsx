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
} from "@/app/services/useSysModuleGroup";
import useMenus, { MenuResponse } from "@/app/services/useMenus";
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

  const { GetDetailById, Update, GetAssignedMenus, AssignMenus } = useSysModuleGroup();
  const { List: GetMenuList } = useMenus();

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

      if (checked) {
        newSet.add(menuId);
        // Add all children recursively
        const addChildren = (parentId: string) => {
          menuList.filter((m) => m.parentId === parentId).forEach((child) => {
            newSet.add(child.id);
            addChildren(child.id);
          });
        };
        addChildren(menuId);
      } else {
        newSet.delete(menuId);
        // Remove all children recursively
        const removeChildren = (parentId: string) => {
          menuList.filter((m) => m.parentId === parentId).forEach((child) => {
            newSet.delete(child.id);
            removeChildren(child.id);
          });
        };
        removeChildren(menuId);
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
                        Select root menus to assign to this module group. All sub-menus will be automatically included.
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
                                                  isDisabled
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
                                                        isDisabled
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
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </LayoutAdmin>
  );
}

export default SysModuleGroupDetailView;
