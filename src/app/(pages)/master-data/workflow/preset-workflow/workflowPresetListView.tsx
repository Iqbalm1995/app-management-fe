"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableComponentFull } from "@/app/components/tableComponents";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import InvalidLoadPageView from "@/app/components/InvalidLoadPageView";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useWorkflowPreset, {
  WorkflowPresetResponse,
} from "@/app/services/useWorkflowPreset";
import useWorkflowCategory, {
  WorkflowCategoryResponse,
} from "@/app/services/useWorkflowCategories";
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
  IconButton,
  Stack,
  Text,
  useColorMode,
  VStack,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  Select,
  Checkbox,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiCalendar,
  FiArrowLeft,
} from "react-icons/fi";
import Link from "next/link";
import useWorkflow, { WorkflowGroupResponse } from "@/app/services/useWorkflow";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Workflow Preset Management`,
  breadCrumb: ["Home", "Master Data", "Workflow", "Preset Management"],
};

// Table column helper
const columnHelper = createColumnHelper<WorkflowPresetResponse>();

function WorkflowPresetListView() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [CategoryId, setCategoryId] = useState<string | null>(null);

  const {
    ListWorkflowPreset,
    InsertWorkflowPreset,
    UpdateWorkflowPreset,
    DeleteWorkflowPreset,
  } = useWorkflowPreset();
  const { ListWorkflowCategory } = useWorkflowCategory();
  const { ListWorkflowGroups } = useWorkflow();

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

  const [DataPresets, setDataPresets] = useState<WorkflowPresetResponse[]>([]);
  const [DataCategories, setDataCategories] = useState<
    WorkflowCategoryResponse[]
  >([]);
  const [DataWorkflowGroups, setDataWorkflowGroups] = useState<
    WorkflowGroupResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [IsValidCategory, setIsValidCategory] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState("");
  const [CategoryDetail, setCategoryDetail] =
    useState<WorkflowCategoryResponse | null>(null);

  // Modal states
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: "",
    wfPresetName: "",
    wfPresetDesc: "",
    wfgCategoryId: "",
  });
  const [selectedPreset, setSelectedPreset] =
    useState<WorkflowPresetResponse | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(
    new Set()
  );

  // Get CategoryId from searchParams
  useEffect(() => {
    const id = searchParams.get("categoryId");
    if (id) {
      setCategoryId(id);
      setIsValidCategory(true);
    } else {
      setIsValidCategory(false);
    }
  }, [searchParams]);

  // Load presets
  const GetDataPresets = async () => {
    setIsLoadingProcess(true);
    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: "",
      filterWhere: [
        {
          field: "wfCategoryId",
          operator: "=",
          value: CategoryId || "",
        },
      ],
      fieldOrder: ["wfPresetName"],
      orderDir: "asc",
    };

    const requestData = await ListWorkflowPreset(PayloadList, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setDataPresets(requestData.data);
    } else {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }
    setIsLoadingProcess(false);
  };

  // Load workflows for category
  const GetDataWorkflowGroups = async (categoryId: string) => {
    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: "",
      filterWhere: [
        { field: "parentId", operator: "=", value: "" },
        { field: "wfgLevel", operator: "=", value: "1" },
        { field: "wfgCategoryId", operator: "=", value: categoryId },
      ],
      fieldOrder: ["wfgOrder"],
      orderDir: "asc",
    };

    const requestData = await ListWorkflowGroups(PayloadList, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setDataWorkflowGroups(requestData.data);
    }
  };

  // Checkbox handler for workflows with hierarchical logic
  const handleWorkflowCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedWorkflows((prev) => {
      const newSet = new Set(prev);

      if (checked) {
        newSet.add(itemId);
        // Auto-check parents when child is checked
        DataWorkflowGroups.forEach((group) => {
          // Check if this is a level 2 item, then check level 1 parent
          group.workflowChild?.forEach((child) => {
            if (child.id === itemId) {
              newSet.add(group.id);
            }
            // Check if this is a level 3 item, then check level 2 and level 1 parents
            child.workflowChild?.forEach((grandChild) => {
              if (grandChild.id === itemId) {
                newSet.add(child.id);
                newSet.add(group.id);
              }
            });
          });
        });
      } else {
        newSet.delete(itemId);
        // Auto-uncheck parents if no children are selected
        DataWorkflowGroups.forEach((group) => {
          if (group.id === itemId) {
            // Uncheck all children when parent is unchecked
            group.workflowChild?.forEach((child) => {
              newSet.delete(child.id);
              child.workflowChild?.forEach((grandChild) => {
                newSet.delete(grandChild.id);
              });
            });
          } else {
            // Check if this is a level 2 item being unchecked
            group.workflowChild?.forEach((child) => {
              if (child.id === itemId) {
                // Uncheck all level 3 children
                child.workflowChild?.forEach((grandChild) => {
                  newSet.delete(grandChild.id);
                });
                // Check if level 1 parent should be unchecked
                const hasOtherSelectedChildren = group.workflowChild?.some(
                  (sibling) => sibling.id !== itemId && newSet.has(sibling.id)
                );
                if (!hasOtherSelectedChildren) {
                  newSet.delete(group.id);
                }
              }
              // Check if this is a level 3 item being unchecked
              child.workflowChild?.forEach((grandChild) => {
                if (grandChild.id === itemId) {
                  // Check if level 2 parent should be unchecked
                  const hasOtherSelectedGrandChildren =
                    child.workflowChild?.some(
                      (sibling) =>
                        sibling.id !== itemId && newSet.has(sibling.id)
                    );
                  if (!hasOtherSelectedGrandChildren) {
                    newSet.delete(child.id);
                    // Check if level 1 parent should be unchecked
                    const hasOtherSelectedChildren = group.workflowChild?.some(
                      (sibling) => newSet.has(sibling.id)
                    );
                    if (!hasOtherSelectedChildren) {
                      newSet.delete(group.id);
                    }
                  }
                }
              });
            });
          }
        });
      }

      return newSet;
    });
  };

  // Get all workflow IDs from tree (recursive)
  const getAllWorkflowIds = (workflows: WorkflowGroupResponse[]): string[] => {
    const ids: string[] = [];
    workflows.forEach((workflow) => {
      ids.push(workflow.id);
      if (workflow.workflowChild && workflow.workflowChild.length > 0) {
        ids.push(...getAllWorkflowIds(workflow.workflowChild));
      }
    });
    return ids;
  };
  const GetDataCategories = async () => {
    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: "",
      filterWhere: [],
      fieldOrder: ["wfcName"],
      orderDir: "asc",
    };

    const requestData = await ListWorkflowCategory(PayloadList, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setDataCategories(requestData.data);
    }
  };

  // Refresh function
  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  // Table columns
  const columns = [
    columnHelper.display({
      id: "number",
      header: "No",
      cell: (info) => (
        <Text fontWeight="medium" textAlign="center">
          {info.row.index + 1}
        </Text>
      ),
    }),
    columnHelper.accessor("wfPresetName", {
      header: "Preset Name",
      cell: (info) => (
        <Text fontWeight="medium" color="blue.600">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("wfPresetDesc", {
      header: "Description",
      cell: (info) => (
        <Text fontSize="sm" color="gray.600" noOfLines={2}>
          {info.getValue() || "-"}
        </Text>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created Date",
      cell: (info) => (
        <Text fontSize="sm">
          {new Date(info.getValue()).toLocaleDateString()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const preset = info.row.original;
        return (
          <HStack spacing={2}>
            <Link
              href={`/master-data/workflow/preset-workflow/detail?presetId=${preset.id}`}
            >
              <IconButton
                icon={<FiSettings />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                aria-label="Configure"
              />
            </Link>
            <IconButton
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleDelete(preset)}
              aria-label="Delete"
            />
          </HStack>
        );
      },
    }),
  ];

  // Table setup
  const table = useReactTable({
    data: DataPresets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchValue,
    },
    onGlobalFilterChange: setSearchValue,
  });

  // Handle create
  const handleCreate = async () => {
    setFormData({
      id: "",
      wfPresetName: "",
      wfPresetDesc: "",
      wfgCategoryId: CategoryId || "",
    });
    setSelectedWorkflows(new Set());
    if (CategoryId && tokenData) {
      await GetDataWorkflowGroups(CategoryId);
    }
    onCreateOpen();
  };

  // Handle delete
  const handleDelete = (preset: WorkflowPresetResponse) => {
    setSelectedPreset(preset);
    setIsDeleteDialogOpen(true);
  };

  // Save preset (create only)
  const savePreset = async () => {
    if (!formData.wfPresetName.trim()) {
      showToast({
        description: "Please enter preset name",
        statusToast: "error",
      });
      return;
    }

    if (selectedWorkflows.size === 0) {
      showToast({
        description: "Please select at least one workflow",
        statusToast: "error",
      });
      return;
    }

    setIsLoadingProcess(true);

    try {
      const result = await InsertWorkflowPreset(
        {
          wfPresetName: formData.wfPresetName,
          wfPresetDesc: formData.wfPresetDesc,
          wfgCategoryId: CategoryId || "",
          workflowGroupDataInsert: Array.from(selectedWorkflows),
        },
        tokenData
      );

      if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
        showToast({
          description: "Workflow preset created successfully!",
          statusToast: "success",
        });
        onCreateClose();
        RefreshAction();
      } else {
        showToast({
          description: result?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while saving preset",
        statusToast: "error",
      });
    }

    setIsLoadingProcess(false);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedPreset) return;

    setIsLoadingProcess(true);
    const result = await DeleteWorkflowPreset(selectedPreset.id, tokenData);

    if (result?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Workflow preset deleted successfully!",
        statusToast: "success",
      });
      RefreshAction();
    } else {
      showToast({
        description: result?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }

    setIsLoadingProcess(false);
  };

  // Load data on mount
  useEffect(() => {
    if (tokenData && CategoryId) {
      GetDataPresets();
      GetDataCategories();
      GetCategoryDetail();
    }
  }, [RefreshData, tokenData, CategoryId]);

  // Get category detail
  const GetCategoryDetail = async () => {
    if (!CategoryId || !tokenData) return;

    const category = DataCategories.find((cat) => cat.id === CategoryId);
    if (category) {
      setCategoryDetail(category);
    } else {
      // If not in list, fetch from API or set from existing data
      const PayloadList: PaggingListPayload = {
        limit: 1,
        page: 0,
        search: "",
        filterWhere: [{ field: "id", operator: "=", value: CategoryId }],
        fieldOrder: ["wfcName"],
        orderDir: "asc",
      };

      const requestData = await ListWorkflowCategory(PayloadList, tokenData);
      if (
        requestData?.statusCode === RES_CODE_OK &&
        requestData.data &&
        requestData.data.length > 0
      ) {
        setCategoryDetail(requestData.data[0]);
      }
    }
  };

  // Load categories when DataCategories changes
  useEffect(() => {
    if (DataCategories.length > 0 && CategoryId && !CategoryDetail) {
      GetCategoryDetail();
    }
  }, [DataCategories, CategoryId]);

  // Load workflows when create modal opens
  useEffect(() => {
    if (
      isCreateOpen &&
      CategoryId &&
      tokenData &&
      DataWorkflowGroups.length === 0
    ) {
      GetDataWorkflowGroups(CategoryId);
    }
  }, [isCreateOpen, CategoryId, tokenData]);

  return (
    <LayoutAdmin>
      {!IsValidCategory || !CategoryId ? (
        <InvalidLoadPageView />
      ) : (
        <>
          <HeaderContent
            titleName={HeaderDataContent.titleName}
            breadCrumb={HeaderDataContent.breadCrumb}
          />

          <Grid templateColumns="repeat(2, 1fr)" gap={5} w="full">
            <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w="full">
              <Link
                href={`/master-data/workflow/detail?categoryId=${CategoryId}`}
              >
                <Button leftIcon={<FiArrowLeft />} size="md">
                  Back to Workflow Detail
                </Button>
              </Link>
            </GridItem>
            <GridItem
              colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
              w="full"
            ></GridItem>
          </Grid>

          <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full" pt={2}>
            <GridItem colSpan={12}>
              {/* Category Information */}
              {CategoryDetail && (
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
                          {CategoryDetail.wfcName.charAt(0).toUpperCase()}
                        </Text>
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={2}>
                          <Text fontSize="lg" fontWeight="bold">
                            {CategoryDetail.wfcName}
                          </Text>
                          <Badge colorScheme="purple" fontSize="xs">
                            {CategoryDetail.wfcCode}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {CategoryDetail.wfcDesc || "No description available"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Category ID: {CategoryDetail.id}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              )}

              <Card
                w="full"
                rounded={radiusStyle}
                bg={colorMode === "light" ? "white" : "gray.800"}
                shadow="sm"
              >
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Heading as="h5" size="md">
                        Workflow Presets
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        Manage workflow templates and presets
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      onClick={handleCreate}
                      size="sm"
                    >
                      Create Preset
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Input
                      placeholder="Search presets..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      maxW="300px"
                    />
                  </HStack>

                  {IsLoadingProcess ? (
                    <LoadingMiniSignature />
                  ) : DataPresets.length === 0 ? (
                    <VStack spacing={4} py={8}>
                      <Text color="gray.500">No presets found</Text>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        onClick={handleCreate}
                      >
                        Create Your First Preset
                      </Button>
                    </VStack>
                  ) : (
                    <TableComponentFull table={table} />
                  )}
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Create Modal */}
          <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="6xl">
            <ModalOverlay />
            <ModalContent maxH="90vh">
              <ModalHeader>Create New Preset</ModalHeader>
              <ModalCloseButton />
              <ModalBody overflowY="auto">
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  {/* Left Column - Form */}
                  <GridItem>
                    <VStack spacing={4}>
                      <Box w="full">
                        <Text mb={2} fontSize="sm" fontWeight="medium">
                          Preset Name *
                        </Text>
                        <Input
                          value={formData.wfPresetName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              wfPresetName: e.target.value,
                            }))
                          }
                          placeholder="Enter preset name"
                        />
                      </Box>

                      <Box w="full">
                        <Text mb={2} fontSize="sm" fontWeight="medium">
                          Description
                        </Text>
                        <Textarea
                          value={formData.wfPresetDesc}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              wfPresetDesc: e.target.value,
                            }))
                          }
                          placeholder="Enter preset description"
                          rows={3}
                        />
                      </Box>

                      {!formData.id && (
                        <Box w="full">
                          <Text mb={2} fontSize="sm" fontWeight="medium">
                            Selected Workflows: {selectedWorkflows.size}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Select workflows from the tree on the right
                          </Text>
                          {DataWorkflowGroups.length === 0 && (
                            <Text fontSize="xs" color="red.500">
                              No workflows loaded. CategoryId: {CategoryId}
                            </Text>
                          )}
                        </Box>
                      )}

                      {/* Debug Section */}
                      {!formData.id && (
                        <Box w="full" mt={4}>
                          <Text mb={2} fontSize="sm" fontWeight="medium">
                            Debug - Selected Workflows JSON:
                          </Text>
                          <Box
                            p={3}
                            bg={colorMode === "light" ? "gray.50" : "gray.700"}
                            border="1px solid"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.600"
                            }
                            rounded="md"
                            maxH="200px"
                            overflowY="auto"
                          >
                            <Text
                              fontSize="xs"
                              fontFamily="mono"
                              whiteSpace="pre-wrap"
                            >
                              {JSON.stringify(
                                {
                                  selectedWorkflowIds:
                                    Array.from(selectedWorkflows),
                                  selectedCount: selectedWorkflows.size,
                                  categoryId: CategoryId,
                                  availableWorkflows: DataWorkflowGroups.length,
                                },
                                null,
                                2
                              )}
                            </Text>
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>

                  {/* Right Column - Workflow Tree (only for create) */}
                  {!formData.id && (
                    <GridItem>
                      <Box>
                        <Text mb={3} fontSize="sm" fontWeight="medium">
                          Select Workflows * ({DataWorkflowGroups.length}{" "}
                          available)
                        </Text>
                        {DataWorkflowGroups.length === 0 ? (
                          <Box
                            p={4}
                            border="1px solid"
                            borderColor="gray.300"
                            rounded="md"
                            textAlign="center"
                          >
                            <Text color="gray.500">Loading workflows...</Text>
                          </Box>
                        ) : (
                          <Box
                            maxH="400px"
                            overflowY="auto"
                            border="1px solid"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.600"
                            }
                            rounded="md"
                            p={3}
                          >
                            <VStack spacing={3} align="stretch">
                              {DataWorkflowGroups.map((group) => (
                                <Box key={group.id} w="full">
                                  {/* Level 1 - Main Group */}
                                  <Box
                                    p={2}
                                    bg={
                                      colorMode === "light"
                                        ? "blue.50"
                                        : "blue.900"
                                    }
                                    border="1px solid"
                                    borderColor={
                                      colorMode === "light"
                                        ? "blue.200"
                                        : "blue.700"
                                    }
                                    rounded="md"
                                  >
                                    <HStack spacing={2} align="center">
                                      <Checkbox
                                        isChecked={selectedWorkflows.has(
                                          group.id
                                        )}
                                        onChange={(e) =>
                                          handleWorkflowCheckboxChange(
                                            group.id,
                                            e.target.checked
                                          )
                                        }
                                        colorScheme="blue"
                                        size="sm"
                                      />
                                      <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="blue.600"
                                        minW="4"
                                      >
                                        {group.wfgOrder}
                                      </Text>
                                      <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        flex={1}
                                        noOfLines={1}
                                      >
                                        {group.wfgName}
                                      </Text>
                                    </HStack>
                                  </Box>

                                  {/* Level 2 - Children */}
                                  {group.workflowChild &&
                                    group.workflowChild.length > 0 && (
                                      <VStack
                                        spacing={1}
                                        align="stretch"
                                        pl={4}
                                        mt={1}
                                      >
                                        {group.workflowChild.map((child) => (
                                          <Box key={child.id}>
                                            <Box
                                              p={2}
                                              bg={
                                                colorMode === "light"
                                                  ? "green.50"
                                                  : "green.900"
                                              }
                                              border="1px solid"
                                              borderColor={
                                                colorMode === "light"
                                                  ? "green.200"
                                                  : "green.700"
                                              }
                                              rounded="sm"
                                            >
                                              <HStack
                                                spacing={2}
                                                align="center"
                                              >
                                                <Checkbox
                                                  isChecked={selectedWorkflows.has(
                                                    child.id
                                                  )}
                                                  onChange={(e) =>
                                                    handleWorkflowCheckboxChange(
                                                      child.id,
                                                      e.target.checked
                                                    )
                                                  }
                                                  colorScheme="green"
                                                  size="sm"
                                                />
                                                <Text
                                                  fontSize="xs"
                                                  fontWeight="bold"
                                                  color="green.600"
                                                  minW="4"
                                                >
                                                  {child.wfgOrder}
                                                </Text>
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="medium"
                                                  flex={1}
                                                  noOfLines={1}
                                                >
                                                  {child.wfgName}
                                                </Text>
                                              </HStack>
                                            </Box>

                                            {/* Level 3 - Grandchildren */}
                                            {child.workflowChild &&
                                              child.workflowChild.length >
                                                0 && (
                                                <VStack
                                                  spacing={1}
                                                  align="stretch"
                                                  pl={4}
                                                  mt={1}
                                                >
                                                  {child.workflowChild.map(
                                                    (grandChild) => (
                                                      <Box
                                                        key={grandChild.id}
                                                        p={1}
                                                        bg={
                                                          colorMode === "light"
                                                            ? "gray.50"
                                                            : "gray.700"
                                                        }
                                                        border="1px solid"
                                                        borderColor={
                                                          colorMode === "light"
                                                            ? "gray.200"
                                                            : "gray.600"
                                                        }
                                                        rounded="sm"
                                                      >
                                                        <HStack
                                                          spacing={2}
                                                          align="center"
                                                        >
                                                          <Checkbox
                                                            isChecked={selectedWorkflows.has(
                                                              grandChild.id
                                                            )}
                                                            onChange={(e) =>
                                                              handleWorkflowCheckboxChange(
                                                                grandChild.id,
                                                                e.target.checked
                                                              )
                                                            }
                                                            colorScheme="gray"
                                                            size="sm"
                                                          />
                                                          <Text
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            color="gray.600"
                                                            minW="4"
                                                          >
                                                            {
                                                              grandChild.wfgOrder
                                                            }
                                                          </Text>
                                                          <Text
                                                            fontSize="xs"
                                                            color="gray.700"
                                                            flex={1}
                                                            noOfLines={1}
                                                          >
                                                            {grandChild.wfgName}
                                                          </Text>
                                                        </HStack>
                                                      </Box>
                                                    )
                                                  )}
                                                </VStack>
                                              )}
                                          </Box>
                                        ))}
                                      </VStack>
                                    )}
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </Box>
                    </GridItem>
                  )}
                </Grid>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onCreateClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={savePreset}
                  isLoading={IsLoadingProcess}
                >
                  Create
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Delete Confirmation */}
          <ConfirmationDialog
            isOpenTrigger={isDeleteDialogOpen}
            trigger={setIsDeleteDialogOpen}
            action={confirmDelete}
            captionMsg="Delete Preset"
            questionMsg={`Are you sure you want to delete "${selectedPreset?.wfPresetName}"?\nThis action cannot be undone.`}
          />
        </>
      )}
    </LayoutAdmin>
  );
}

export default WorkflowPresetListView;
