"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAuthorizeGroups, {
  AuthorizeGroupResponse,
  AuthorizeGroupUpdatePayload,
  UserAssignResponse,
  UserAssignPayload,
  MenuAssignPayload,
} from "@/app/services/useAuthorizeGroups";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import useMenus, { MenuResponse } from "@/app/services/useMenus";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  useColorMode,
  Icon,
  Badge,
  Avatar,
  Button,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Checkbox,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import {
  FiEdit,
  FiSave,
  FiX,
  FiShield,
  FiInfo,
  FiUsers,
  FiMenu,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { TbUsersGroup } from "react-icons/tb";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";

interface AuthorizeGroupFormValues {
  agCode: string;
  agName: string;
  agDescriptions: string;
  isActive: string;
  agAccessMaker: string;
  agAccessReview: string;
  agAccessApprove: string;
}

function AuthorizeGroupDetailView() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agId = searchParams.get("id");
  const toast = useToast();
  const cancelRef = useRef<any>(null);

  const { GetDetailById, Update, GetAssignedUsers, AssignUsers, UnassignUsers, GetAssignedMenus, AssignMenus } = useAuthorizeGroups();
  const { List: ListUsers } = useUsers();
  const { List: GetMenuList } = useMenus();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [AuthorizeGroupData, setAuthorizeGroupData] = useState<AuthorizeGroupResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // User assignment states
  const [assignedUsers, setAssignedUsers] = useState<UserAssignResponse[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UsersResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{ id: string; name: string } | null>(null);

  // Menu assignment states
  const [menuList, setMenuList] = useState<MenuResponse[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [isSavingMenus, setIsSavingMenus] = useState(false);

  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isRemoveDialogOpen, onOpen: onRemoveDialogOpen, onClose: onRemoveDialogClose } = useDisclosure();

  const [HeaderDataContent, setHeaderDataContent] = useState<HeaderContentProps>({
    titleName: "Authorize Group Details",
    breadCrumb: ["Home", "Master Data", "Authorize Groups", "Details"],
  });

  const ValidationSchema = Yup.object().shape({
    agName: Yup.string()
      .required("Name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    agDescriptions: Yup.string().max(500, "Maximum 500 characters"),
  });

  const formik = useFormik<AuthorizeGroupFormValues>({
    initialValues: {
      agCode: "",
      agName: "",
      agDescriptions: "",
      isActive: "1",
      agAccessMaker: "0",
      agAccessReview: "0",
      agAccessApprove: "0",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleUpdateAuthorizeGroup(values);
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
    if (agId && tokenData && DataAuth) {
      GetAuthorizeGroupData();
    }
  }, [agId, tokenData, DataAuth]);

  useEffect(() => {
    if (AuthorizeGroupData) {
      formik.setValues({
        agCode: AuthorizeGroupData.agCode,
        agName: AuthorizeGroupData.agName,
        agDescriptions: AuthorizeGroupData.agDescriptions || "",
        isActive: AuthorizeGroupData.isActive,
        agAccessMaker: AuthorizeGroupData.agAccessMaker,
        agAccessReview: AuthorizeGroupData.agAccessReview,
        agAccessApprove: AuthorizeGroupData.agAccessApprove,
      });
    }
  }, [AuthorizeGroupData]);

  const GetAuthorizeGroupData = async () => {
    if (!agId || !tokenData) return;

    try {
      setIsLoadingProcess(true);
      const requestData = await GetDetailById(agId, tokenData);

      if (!requestData || requestData.statusCode !== 200) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as AuthorizeGroupResponse;
      setAuthorizeGroupData(data);

      setHeaderDataContent({
        titleName: data.agName,
        breadCrumb: ["Home", "Master Data", "Authorize Groups", data.agName],
      });
    } catch (error) {
      console.error("Error fetching authorize group data:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const handleUpdateAuthorizeGroup = async (values: AuthorizeGroupFormValues) => {
    if (!agId || !tokenData) return;

    try {
      setIsUpdating(true);

      const payload: AuthorizeGroupUpdatePayload = {
        id: agId,
        agCode: values.agCode,
        agName: values.agName,
        agDescriptions: values.agDescriptions || null,
        functionIdLink: null,
        isActive: values.isActive,
        agAccessMaker: values.agAccessMaker,
        agAccessReview: values.agAccessReview,
        agAccessApprove: values.agAccessApprove,
      };

      const response = await Update(payload, tokenData);

      if (!response || response.statusCode !== 200) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Authorize Group updated successfully",
        statusToast: "success",
      });

      setIsEditMode(false);
      await GetAuthorizeGroupData();
    } catch (error) {
      console.error("Error updating authorize group:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setActiveTabIndex(0); // Switch to General tab
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (AuthorizeGroupData) {
      formik.setValues({
        agCode: AuthorizeGroupData.agCode,
        agName: AuthorizeGroupData.agName,
        agDescriptions: AuthorizeGroupData.agDescriptions || "",
        isActive: AuthorizeGroupData.isActive,
        agAccessMaker: AuthorizeGroupData.agAccessMaker,
        agAccessReview: AuthorizeGroupData.agAccessReview,
        agAccessApprove: AuthorizeGroupData.agAccessApprove,
      });
    }
  };

  const GetAssignedUsersData = async () => {
    if (!agId || !tokenData) return;
    const result = await GetAssignedUsers(agId, tokenData);
    if (result?.statusCode === 200 && result.data) {
      setAssignedUsers(result.data);
    }
  };

  const LoadAvailableUsers = async () => {
    if (!tokenData) return;
    const payload: PaggingListPayload = {
      search: "",
      limit: 999,
      page: 0,
      filterWhere: [],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const result = await ListUsers(payload, tokenData);
    if (result?.statusCode === 200 && result.data) {
      setAvailableUsers(result.data);
    }
  };

  const handleAddMember = () => {
    LoadAvailableUsers();
    setSelectedUserIds([]);
    setSearchUser("");
    onAddModalOpen();
  };

  const confirmAddMember = async () => {
    if (!agId || !tokenData || selectedUserIds.length === 0) return;

    try {
      setIsAddingMember(true);
      const payload: UserAssignPayload = {
        authGroupId: agId,
        userUimSysIds: selectedUserIds,
      };

      const response = await AssignUsers(payload, tokenData);
      if (response?.statusCode === 200) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 3000,
        });
        await GetAssignedUsersData();
        onAddModalClose();
        setSelectedUserIds([]);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to assign users",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error assigning users:", error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setUserToRemove({ id: userId, name: userName });
    onRemoveDialogOpen();
  };

  const confirmRemoveMember = async () => {
    if (!userToRemove || !agId || !tokenData) return;

    try {
      const payload: UserAssignPayload = {
        authGroupId: agId,
        userUimSysIds: [userToRemove.id],
      };

      const response = await UnassignUsers(payload, tokenData);
      if (response?.statusCode === 200) {
        toast({
          title: "Success",
          description: `${userToRemove.name} removed successfully`,
          status: "success",
          duration: 3000,
        });
        await GetAssignedUsersData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to remove user",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error removing user:", error);
    } finally {
      onRemoveDialogClose();
      setUserToRemove(null);
    }
  };

  useEffect(() => {
    if (agId && tokenData && DataAuth && activeTabIndex === 1) {
      GetAssignedUsersData();
    }
  }, [agId, tokenData, DataAuth, activeTabIndex]);

  const filteredUsers = availableUsers.filter((user) => {
    const isAlreadyAssigned = assignedUsers.some((au) => au.userUimSysId === user.id);
    if (isAlreadyAssigned) return false;

    if (!searchUser) return true;
    const searchLower = searchUser.toLowerCase();
    return (
      user.nama?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.userId?.toLowerCase().includes(searchLower)
    );
  });

  // Menu functions
  const LoadMenuList = async () => {
    if (!tokenData) return;
    const payload: PaggingListPayload = {
      search: "",
      limit: 999,
      page: 0,
      filterWhere: [],
      fieldOrder: ["menuPos"],
      orderDir: "asc",
    };
    const result = await GetMenuList(payload, tokenData);
    if (result?.statusCode === 200 && result.data) {
      setMenuList(result.data);
    }
  };

  const GetAssignedMenusData = async () => {
    if (!agId || !tokenData) return;
    const result = await GetAssignedMenus(agId, tokenData);
    if (result?.statusCode === 200 && result.data) {
      setSelectedMenus(new Set(result.data));
    }
  };

  const handleMenuCheckboxChange = (menuId: string, checked: boolean) => {
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

  const handleSaveMenus = async () => {
    if (!agId || !tokenData) return;
    try {
      setIsSavingMenus(true);
      const payload: MenuAssignPayload = {
        authGroupId: agId,
        menuIds: Array.from(selectedMenus),
      };
      const response = await AssignMenus(payload, tokenData);
      if (response?.statusCode === 200) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to assign menus",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error assigning menus:", error);
    } finally {
      setIsSavingMenus(false);
    }
  };

  useEffect(() => {
    if (agId && tokenData && DataAuth && activeTabIndex === 2) {
      LoadMenuList();
      GetAssignedMenusData();
    }
  }, [agId, tokenData, DataAuth, activeTabIndex]);

  const buildMenuTree = (menus: MenuResponse[]): MenuResponse[] => {
    return menus.filter((m) => !m.parentId).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
  };

  const getMenuChildren = (parentId: string): MenuResponse[] => {
    return menuList.filter((m) => m.parentId === parentId).sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
  };

  if (IsLoadingProcess) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Loading..."
          breadCrumb={["Home", "Master Data", "Authorize Groups", "Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Loading authorize group details...</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  if (!AuthorizeGroupData) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Authorize Group Not Found"
          breadCrumb={["Home", "Master Data", "Authorize Groups", "Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Authorize Group not found or error loading data.</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        {/* Header Card */}
        <Card
          rounded="2xl"
          overflow="hidden"
          mb={8}
          shadow="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <CardBody p={8} bg="secondary.500">
            <Button
              variant="ghost"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => router.push("/master-data/authorize-groups")}
              mb={6}
              color="whiteAlpha.800"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Back to Authorize Groups
            </Button>

            <HStack spacing={6} align="start" justify="space-between">
              <HStack spacing={6} align="center" flex="1">
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    icon={<Icon as={TbUsersGroup} fontSize="3xl" />}
                    bg="secondary.500"
                    color="white"
                    shadow="lg"
                    border="3px solid"
                    borderColor="white"
                  />
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    w="24px"
                    h="24px"
                    rounded="full"
                    bg={AuthorizeGroupData.isActive === "1" ? "green.400" : "red.400"}
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "gray.800"}
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box w="8px" h="8px" rounded="full" bg="white" />
                  </Box>
                </Box>

                <VStack align="start" spacing={3} flex="1">
                  <VStack align="start" spacing={1}>
                    <Heading size="xl" color="white" fontWeight="bold" letterSpacing="tight">
                      {AuthorizeGroupData.agName}
                    </Heading>
                    <HStack spacing={3}>
                      <Text fontSize="md" color="whiteAlpha.800" fontWeight="medium" fontFamily="mono">
                        #{AuthorizeGroupData.agCode}
                      </Text>
                      <Badge
                        colorScheme={AuthorizeGroupData.isActive === "1" ? "green" : "red"}
                        variant="subtle"
                        px={3}
                        py={1}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {AuthorizeGroupData.isActive === "1" ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                  </VStack>

                  <HStack spacing={6} mt={2}>
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessMaker === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Maker
                        </Text>
                      </HStack>
                    </VStack>
                    <Box w="1px" h="20px" bg="whiteAlpha.300" />
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessReview === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Review
                        </Text>
                      </HStack>
                    </VStack>
                    <Box w="1px" h="20px" bg="whiteAlpha.300" />
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessApprove === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Approve
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </VStack>
              </HStack>

              <VStack spacing={2} align="end">
                {!isEditMode ? (
                  <Button
                    leftIcon={<Icon as={FiEdit} />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="md"
                    onClick={handleEditMode}
                    shadow="md"
                  >
                    Edit
                  </Button>
                ) : (
                  <HStack>
                    <Button
                      leftIcon={<Icon as={FiSave} />}
                      colorScheme="green"
                      size="md"
                      onClick={() => formik.handleSubmit()}
                      isLoading={isUpdating}
                      shadow="md"
                    >
                      Save
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiX} />}
                      colorScheme="whiteAlpha"
                      variant="outline"
                      size="md"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Details Grid */}
        <Tabs orientation="vertical" variant="unstyled" w="full" index={activeTabIndex} onChange={setActiveTabIndex}>
          <Grid templateColumns="repeat(12, 1fr)" gap={6} w="full">
            {/* Main Content */}
            <GridItem colSpan={{ base: 12, md: 9 }} w="full">
              <TabPanels w="full">
                {/* General Tab */}
                <TabPanel px={0}>
                  <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                    {/* Basic Information */}
                    <GridItem>
                      <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                        <CardHeader pb={3}>
                          <Heading size="md">Basic Information</Heading>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                Code
                              </FormLabel>
                              {isEditMode ? (
                                <Input value={formik.values.agCode} isReadOnly bg="gray.50" />
                              ) : (
                                <Text fontWeight="medium">{AuthorizeGroupData.agCode}</Text>
                              )}
                            </FormControl>

                            <FormControl isInvalid={!!(formik.errors.agName && formik.touched.agName)}>
                              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                Name
                              </FormLabel>
                              {isEditMode ? (
                                <>
                                  <Input
                                    name="agName"
                                    value={formik.values.agName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                  />
                                  <FormErrorMessage>{formik.errors.agName}</FormErrorMessage>
                                </>
                              ) : (
                                <Text fontWeight="medium">{AuthorizeGroupData.agName}</Text>
                              )}
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                Description
                              </FormLabel>
                              {isEditMode ? (
                                <Textarea
                                  name="agDescriptions"
                                  value={formik.values.agDescriptions}
                                  onChange={formik.handleChange}
                                  rows={3}
                                  maxLength={500}
                                />
                              ) : (
                                <Text>{AuthorizeGroupData.agDescriptions || "-"}</Text>
                              )}
                            </FormControl>

                            <FormControl display="flex" alignItems="center" justifyContent="space-between">
                              <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                                Is Active
                              </FormLabel>
                              {isEditMode ? (
                                <Switch
                                  isChecked={formik.values.isActive === "1"}
                                  onChange={(e) => formik.setFieldValue("isActive", e.target.checked ? "1" : "0")}
                                />
                              ) : (
                                <Badge colorScheme={AuthorizeGroupData.isActive === "1" ? "green" : "red"}>
                                  {AuthorizeGroupData.isActive === "1" ? "Active" : "Inactive"}
                                </Badge>
                              )}
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Access Permissions */}
                    <GridItem>
                      <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                        <CardHeader pb={3}>
                          <Heading size="md">Access Permissions</Heading>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <FormControl display="flex" alignItems="center" justifyContent="space-between">
                              <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                                Access Maker
                              </FormLabel>
                              {isEditMode ? (
                                <Switch
                                  isChecked={formik.values.agAccessMaker === "1"}
                                  onChange={(e) => formik.setFieldValue("agAccessMaker", e.target.checked ? "1" : "0")}
                                />
                              ) : (
                                <Badge colorScheme={AuthorizeGroupData.agAccessMaker === "1" ? "green" : "gray"}>
                                  {AuthorizeGroupData.agAccessMaker === "1" ? "Yes" : "No"}
                                </Badge>
                              )}
                            </FormControl>

                            <FormControl display="flex" alignItems="center" justifyContent="space-between">
                              <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                                Access Review
                              </FormLabel>
                              {isEditMode ? (
                                <Switch
                                  isChecked={formik.values.agAccessReview === "1"}
                                  onChange={(e) => formik.setFieldValue("agAccessReview", e.target.checked ? "1" : "0")}
                                />
                              ) : (
                                <Badge colorScheme={AuthorizeGroupData.agAccessReview === "1" ? "green" : "gray"}>
                                  {AuthorizeGroupData.agAccessReview === "1" ? "Yes" : "No"}
                                </Badge>
                              )}
                            </FormControl>

                            <FormControl display="flex" alignItems="center" justifyContent="space-between">
                              <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                                Access Approve
                              </FormLabel>
                              {isEditMode ? (
                                <Switch
                                  isChecked={formik.values.agAccessApprove === "1"}
                                  onChange={(e) => formik.setFieldValue("agAccessApprove", e.target.checked ? "1" : "0")}
                                />
                              ) : (
                                <Badge colorScheme={AuthorizeGroupData.agAccessApprove === "1" ? "green" : "gray"}>
                                  {AuthorizeGroupData.agAccessApprove === "1" ? "Yes" : "No"}
                                </Badge>
                              )}
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </TabPanel>

                {/* User Assign Tab */}
                <TabPanel px={0}>
                  <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader pb={3}>
                      <HStack justify="space-between">
                        <Heading size="md">Assigned Users</Heading>
                        <Button
                          size="sm"
                          colorScheme="secondary"
                          leftIcon={<Icon as={FiPlus} />}
                          rounded="xl"
                          onClick={handleAddMember}
                        >
                          Add User
                        </Button>
                      </HStack>
                    </CardHeader>
                    <Divider />
                    <CardBody p={8}>
                      {assignedUsers.length === 0 ? (
                        <VStack spacing={4} py={8}>
                          <Icon as={FiUsers} fontSize="4xl" color="gray.400" />
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            No users assigned to this authorize group
                          </Text>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="secondary"
                            leftIcon={<Icon as={FiPlus} />}
                            rounded="xl"
                            onClick={handleAddMember}
                          >
                            Add First User
                          </Button>
                        </VStack>
                      ) : (
                        <VStack spacing={6} align="stretch">
                          <VStack
                            spacing={4}
                            align="stretch"
                            maxH="400px"
                            overflowY="auto"
                            pr={2}
                            css={{
                              "&::-webkit-scrollbar": {
                                width: "6px",
                              },
                              "&::-webkit-scrollbar-track": {
                                background: colorMode === "light" ? "#f1f1f1" : "#2d3748",
                                borderRadius: "10px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: colorMode === "light" ? "#c1c1c1" : "#4a5568",
                                borderRadius: "10px",
                              },
                              "&::-webkit-scrollbar-thumb:hover": {
                                background: colorMode === "light" ? "#a8a8a8" : "#2d3748",
                              },
                            }}
                          >
                            {assignedUsers.map((user) => (
                              <HStack
                                key={user.id}
                                p={3}
                                rounded="lg"
                                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                justify="space-between"
                                _hover={{
                                  borderColor: "secondary.300",
                                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                                }}
                                transition="all 0.2s"
                              >
                                <HStack spacing={3} flex="1">
                                  <Avatar
                                    size="sm"
                                    name={user.nama || ""}
                                    bg="secondary.400"
                                    color="white"
                                  />
                                  <VStack align="start" spacing={0} flex="1">
                                    <Text
                                      fontSize="sm"
                                      fontWeight="semibold"
                                      color={colorMode === "light" ? "gray.800" : "white"}
                                    >
                                      {user.nama}
                                    </Text>
                                    <HStack spacing={2} fontSize="xs" color="gray.500" flexWrap="wrap">
                                      {user.userId && <Text>{user.userId}</Text>}
                                      {user.jabatan && (
                                        <>
                                          <Text>•</Text>
                                          <Text>{user.jabatan}</Text>
                                        </>
                                      )}
                                      {user.orgName && (
                                        <>
                                          <Text>•</Text>
                                          <Text>{user.orgName}</Text>
                                        </>
                                      )}
                                    </HStack>
                                  </VStack>
                                </HStack>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveMember(user.userUimSysId, user.nama || "")}
                                  _hover={{ bg: "red.50" }}
                                >
                                  Remove
                                </Button>
                              </HStack>
                            ))}
                          </VStack>
                          {assignedUsers.length > 5 && (
                            <Text fontSize="sm" color="gray.500" textAlign="center" pt={2}>
                              Showing all {assignedUsers.length} users - scroll to see more
                            </Text>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Menu Access Tab */}
                <TabPanel px={0}>
                  <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <CardHeader pb={3}>
                      <HStack justify="space-between">
                        <Heading size="md">Menu Access Configuration</Heading>
                        <HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => {
                              if (selectedMenus.size === menuList.length) {
                                setSelectedMenus(new Set());
                              } else {
                                setSelectedMenus(new Set(menuList.map((m) => m.id)));
                              }
                            }}
                          >
                            {selectedMenus.size === menuList.length ? "Unselect All" : "Select All"}
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<Icon as={FiCheck} />}
                            onClick={handleSaveMenus}
                            isLoading={isSavingMenus}
                          >
                            Save Changes
                          </Button>
                        </HStack>
                      </HStack>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" color="gray.600">
                          Select menus to grant access to this authorize group. Parent menus will be automatically selected when children are checked.
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
                              Loading menus...
                            </Text>
                          ) : (
                            <VStack spacing={2} align="stretch">
                              {buildMenuTree(menuList).map((menu) => (
                                <Box key={menu.id}>
                                  <Box p={2} bg={colorMode === "light" ? "blue.50" : "blue.900"} border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.700"} rounded="md">
                                    <HStack spacing={2}>
                                      <Checkbox
                                        isChecked={selectedMenus.has(menu.id)}
                                        onChange={(e) => handleMenuCheckboxChange(menu.id, e.target.checked)}
                                        colorScheme="blue"
                                        size="sm"
                                      />
                                      <Text fontSize="sm" fontWeight="semibold" flex={1}>{menu.menuName}</Text>
                                    </HStack>
                                  </Box>
                                  {getMenuChildren(menu.id).length > 0 && (
                                    <VStack spacing={1} align="stretch" pl={4} mt={1}>
                                      {getMenuChildren(menu.id).map((child) => (
                                        <Box key={child.id}>
                                          <Box p={2} bg={colorMode === "light" ? "green.50" : "green.900"} border="1px" borderColor={colorMode === "light" ? "green.200" : "green.700"} rounded="md">
                                            <HStack spacing={2}>
                                              <Checkbox
                                                isChecked={selectedMenus.has(child.id)}
                                                onChange={(e) => handleMenuCheckboxChange(child.id, e.target.checked)}
                                                colorScheme="green"
                                                size="sm"
                                              />
                                              <Text fontSize="sm" fontWeight="medium" flex={1}>{child.menuName}</Text>
                                            </HStack>
                                          </Box>
                                          {getMenuChildren(child.id).length > 0 && (
                                            <VStack spacing={1} align="stretch" pl={4} mt={1}>
                                              {getMenuChildren(child.id).map((grandChild) => (
                                                <Box key={grandChild.id} p={2} bg={colorMode === "light" ? "purple.50" : "purple.900"} border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.700"} rounded="md">
                                                  <HStack spacing={2}>
                                                    <Checkbox
                                                      isChecked={selectedMenus.has(grandChild.id)}
                                                      onChange={(e) => handleMenuCheckboxChange(grandChild.id, e.target.checked)}
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
                                      ))}
                                    </VStack>
                                  )}
                                </Box>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </GridItem>

            {/* Sidebar Tabs */}
            <GridItem colSpan={{ base: 12, md: 3 }} w="full">
              <Card
                rounded="xl"
                shadow="md"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                overflow="hidden"
              >
                <CardHeader pb={3} bg={colorMode === "light" ? "gray.50" : "gray.700"}>
                  <Heading as="h5" size="sm">
                    Options
                  </Heading>
                </CardHeader>
                <Divider />
                <CardBody p={4}>
                  <TabList w="full" gap={3}>
                    <Tab
                      rounded={radiusStyle}
                      px={4}
                      py={3}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        boxShadow: "md",
                      }}
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.600",
                      }}
                      justifyContent="start"
                      transition="all 0.2s"
                    >
                      <Icon as={FiInfo} />
                      <Text pl={3} fontSize="sm" fontWeight="medium">General</Text>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      px={4}
                      py={3}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        boxShadow: "md",
                      }}
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.600",
                      }}
                      justifyContent="start"
                      transition="all 0.2s"
                    >
                      <Icon as={FiUsers} />
                      <Text pl={3} fontSize="sm" fontWeight="medium">User Assign</Text>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      px={4}
                      py={3}
                      _selected={{
                        color: "white",
                        bg: "secondary.500",
                        boxShadow: "md",
                      }}
                      _hover={{
                        bg: colorMode === "light" ? "gray.100" : "gray.600",
                      }}
                      justifyContent="start"
                      transition="all 0.2s"
                    >
                      <Icon as={FiMenu} />
                      <Text pl={3} fontSize="sm" fontWeight="medium">Menu Access</Text>
                    </Tab>
                  </TabList>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Tabs>
      </Box>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          mx={4}
          rounded="2xl"
          shadow="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader fontSize="xl" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} pb={4}>
            <HStack spacing={3}>
              <Box w="12px" h="12px" rounded="full" bg="secondary.400" />
              <Text>Add Users to Authorize Group</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color={colorMode === "light" ? "gray.600" : "gray.300"}>
                Select users to add to this authorize group:
              </Text>

              <FormControl>
                <FormLabel fontWeight="medium" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                  Search Users
                </FormLabel>
                <Input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search by name, email, or user ID..."
                  bg={colorMode === "light" ? "white" : "gray.700"}
                  border="2px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  rounded="xl"
                  _focus={{
                    borderColor: "secondary.500",
                    shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                  }}
                />
              </FormControl>

              <Box
                maxH="300px"
                overflowY="auto"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                rounded="xl"
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
              >
                {filteredUsers.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                    {searchUser ? "No users found matching your search" : "No available users to add"}
                  </Text>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <HStack
                          key={user.id}
                          p={4}
                          cursor="pointer"
                          bg={isSelected ? "secondary.100" : "transparent"}
                          _hover={{
                            bg: isSelected ? "secondary.200" : colorMode === "light" ? "gray.100" : "gray.600",
                          }}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                            } else {
                              setSelectedUserIds((prev) => [...prev, user.id]);
                            }
                          }}
                          borderBottom="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          _last={{ borderBottom: "none" }}
                        >
                          <Avatar size="sm" name={user.nama} bg="secondary.400" color="white" />
                          <VStack align="start" spacing={0} flex="1">
                            <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                              {user.nama}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {user.userId}
                            </Text>
                            {user.jabatan && (
                              <Text fontSize="xs" color="gray.500">
                                {user.jabatan}
                              </Text>
                            )}
                            {user.namaPenempatan && (
                              <Text fontSize="xs" color="gray.500">
                                {user.namaPenempatan}
                              </Text>
                            )}
                          </VStack>
                          {isSelected && <Icon as={FiX} color="red.500" />}
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter pt={4} borderTop="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
            <HStack spacing={3} w="full" justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {selectedUserIds.length} user(s) selected
              </Text>
              <HStack spacing={3}>
                <Button variant="outline" colorScheme="gray" rounded="xl" px={6} onClick={onAddModalClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="secondary"
                  rounded="xl"
                  px={6}
                  onClick={confirmAddMember}
                  isLoading={isAddingMember}
                  isDisabled={selectedUserIds.length === 0}
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Add {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ""}
                  User{selectedUserIds.length !== 1 ? "s" : ""}
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove User Confirmation Dialog */}
      <AlertDialog isOpen={isRemoveDialogOpen} leastDestructiveRef={cancelRef} onClose={onRemoveDialogClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent mx={4} rounded="2xl" shadow="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to remove <strong>{userToRemove?.name}</strong> from this authorize group?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRemoveDialogClose} rounded="xl">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmRemoveMember} ml={3} rounded="xl">
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </LayoutAdmin>
  );
}

export default AuthorizeGroupDetailView;
