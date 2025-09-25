"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
  ConstantInsertDataPayload,
  ConstantUpdateDataPayload,
} from "@/app/services/useConstants";
import {
  addParamFilter,
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { Select } from "chakra-react-select";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiEdit,
  FiEye,
  FiFilter,
  FiPlusSquare,
  FiRefreshCcw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import * as Yup from "yup";
import { BsDiagram3 } from "react-icons/bs";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Constants`,
  breadCrumb: ["Home", "Master Data", "Constants"],
};

const parentFilter: ListSearchByParamProps = {
  field: "parentGroupCode",
  operator: "=",
  value: null,
  filterLabel: "Parent Data",
};

const MotionCardBody = motion(CardBody);

function MasterDataConstantPage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  const {
    ListConstantData,
    ListConstantGroupCodeData,
    InsertConstantData,
    UpdateConstantData,
    DeleteConstantData,
  } = useConstants();

  // Data state
  const [dataConstants, setDataConstants] = useState<ConstantDataResponse[]>(
    []
  );
  const [refreshData, setRefreshData] = useState<number>(0);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalData, setTotalData] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Filter state
  const [paramFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Modal states
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewGroupOpen,
    onOpen: onViewGroupOpen,
    onClose: onViewGroupClose,
  } = useDisclosure();

  // Delete confirmation state
  const [isDeleteTrigger, setIsDeleteTrigger] = useState(false);

  // Form states
  const [editingConstant, setEditingConstant] =
    useState<ConstantDataResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [prefilledGroupCode, setPrefilledGroupCode] = useState<string>("");
  const [prefilledParentGroupCode, setPrefilledParentGroupCode] = useState<
    string | null
  >(null);
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>("");
  const [selectedEntity, setSelectedEntity] =
    useState<ConstantDataResponse | null>(null);
  const [groupConstants, setGroupConstants] = useState<ConstantDataResponse[]>(
    []
  );

  // GroupCode filter options
  const [groupCodeOptions, setGroupCodeOptions] = useState<OptionListProps[]>(
    []
  );
  const [isLoadingGroupCodes, setIsLoadingGroupCodes] = useState(false);
  const [selectedGroupCodeFilter, setSelectedGroupCodeFilter] =
    useState<OptionListProps | null>(null);

  // Auth setup
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (dataAuth == null && storedData) {
      const storageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const userData: AuthDataResponse =
        storageAuth.dataLogin as AuthDataResponse;
      setDataAuth(userData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [dataAuth]);

  // Load GroupCode options when component mounts
  useEffect(() => {
    if (dataAuth && tokenData) {
      loadGroupCodeOptions();
    }
  }, [dataAuth, tokenData]);

  // Data loading function
  const getDataConstants = async (
    searchValue: string = ""
  ): Promise<ConstantDataResponse[]> => {
    setIsLoadingProcess(true);

    const whereDataParam: ListSearchByParam[] = [
      ...paramFilter,
      {
        field: "parentGroupCode",
        operator: "is null",
        value: "null",
      },
    ];

    const payloadList: PaggingListPayload = {
      search: searchValue,
      limit: pagination.pageSize,
      page: pagination.pageIndex,
      filterWhere: whereDataParam,
      fieldOrder: ["groupCode"],
      orderDir: "asc",
    };

    const requestData = await ListConstantData(payloadList, tokenData);

    if (requestData?.statusCode !== RES_CODE_OK || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return [];
    }

    if (!requestData.data) {
      showToast({
        description: "Data return error",
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return [];
    }

    const itemsData = requestData.data as ConstantDataResponse[];
    setDataConstants(itemsData);
    setTotalData(requestData.countTotal || 0);
    setTotalPages(
      Math.ceil((requestData.countTotal || 0) / pagination.pageSize)
    );
    setIsLoadingProcess(false);
    return itemsData;
  };

  // CRUD handlers (moved here for proper scope)
  const handleEdit = (constant: ConstantDataResponse) => {
    setEditingConstant(constant);
    onEditOpen();
  };

  const handleDelete = (id: string) => {
    console.log("DELETE BUTTON CLICKED! ID:", id);
    setDeletingId(id);
    setIsDeleteTrigger(true);
  };

  const handleAddToGroup = (groupCode: string) => {
    setPrefilledGroupCode(groupCode);
    onAddOpen();
  };

  const handleViewGroup = async (entity: ConstantDataResponse) => {
    setSelectedGroupCode(entity.value);
    setSelectedEntity(entity);
    setGroupConstants([]);
    onViewGroupOpen();

    // Load data with API filter
    await loadGroupConstants(entity.value);
  };

  const loadGroupConstants = async (groupCodeValue: string) => {
    try {
      const payloadList: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "parentGroupCode",
            operator: "=",
            value: groupCodeValue,
          },
        ],
        fieldOrder: ["index"],
        orderDir: "asc",
      };

      const response = await ListConstantData(payloadList, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        const data = response.data as ConstantDataResponse[];
        setGroupConstants(data);
      }
    } catch (error) {
      console.error("Error loading group constants:", error);
    }
  };

  // Load GroupCode options for filter
  const loadGroupCodeOptions = async (forceReload: boolean = false) => {
    if ((groupCodeOptions.length <= 0 || forceReload) && tokenData) {
      setIsLoadingGroupCodes(true);
      try {
        const response = await ListConstantGroupCodeData(tokenData);
        if (response?.statusCode === RES_CODE_OK) {
          const data = response.data as ConstantDataResponse[];
          const options: OptionListProps[] = data.map((item) => ({
            label: item.groupCode.replace(/_/g, " "),
            value: item.groupCode,
          }));
          setGroupCodeOptions(options);
        }
      } catch (error) {
        console.error("Error loading group codes:", error);
      } finally {
        setIsLoadingGroupCodes(false);
      }
    }
  };

  // Handle GroupCode filter change
  const handleGroupCodeFilterChange = (
    selectedOption: OptionListProps | null
  ) => {
    setSelectedGroupCodeFilter(selectedOption);

    // Remove existing groupCode filter
    const updatedParams = removeParamFilter(paramFilter, {
      field: "groupCode",
      operator: "=",
      value: "",
      filterLabel: "Group Code",
    });

    if (selectedOption) {
      // Add new groupCode filter
      const newParams = addParamFilter(updatedParams, {
        field: "groupCode",
        operator: "=",
        value: selectedOption.value,
        filterLabel: `Group Code: ${selectedOption.label}`,
      });
      setParamFilter(newParams);
    } else {
      setParamFilter(updatedParams);
    }

    // Reset pagination and refresh data
    setPagination({ pageIndex: 0, pageSize: MAX_SIZE_TABLE });
  };

  // Handle edit constant from View Group Modal
  const handleEditConstant = (constant: ConstantDataResponse) => {
    setEditingConstant(constant);
    editFormik.setValues({
      id: constant.id,
      label: constant.label,
      value: constant.value,
      desc: constant.desc || "",
    });
    onEditOpen();
  };

  // Handle delete constant from View Group Modal
  const handleDeleteConstant = (constantId: string) => {
    setDeletingId(constantId);
    setIsDeleteTrigger(true);
  };

  const removeFilterData = (filterToRemove: ListSearchByParamProps) => {
    setParamFilter(removeParamFilter(paramFilter, filterToRemove));
  };

  const generateValueFromLabel = (label: string): string => {
    return label.toUpperCase().replace(/\s+/g, "_");
  };
  const columns = useMemo<ColumnDef<ConstantDataResponse>[]>(
    () => [
      {
        accessorKey: "groupCode",
        header: "Group Code",
        cell: (info) => (
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="subtle">
              {info.getValue() as string}
            </Badge>
            <IconButton
              aria-label="Add to this group"
              icon={<FiPlusSquare />}
              size="xs"
              variant="ghost"
              colorScheme="green"
              onClick={() => handleAddToGroup(info.getValue() as string)}
            />
          </HStack>
        ),
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "groupCode",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Group Code",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "label",
        header: "Label",
        cell: (info) => (
          <Text fontWeight="medium">{info.getValue() as string}</Text>
        ),
        meta: { filterVariant: "text" } as ColumnMetaCustom,
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: (info) => (
          <HStack spacing={2}>
            <Text color="gray.600">{info.getValue() as string}</Text>
          </HStack>
        ),
        meta: { filterVariant: "text" } as ColumnMetaCustom,
      },
      {
        accessorKey: "desc",
        header: "Description",
        cell: (info) => (
          <Text fontSize="sm" color="gray.500" noOfLines={2}>
            {(info.getValue() as string) || "-"}
          </Text>
        ),
        meta: { filterVariant: "text" } as ColumnMetaCustom,
      },
      {
        accessorKey: "parentGroupCode",
        header: "Child Data",
        cell: (info) => (
          <HStack spacing={2}>
            <Text color="gray.600">{info.getValue() as string}</Text>
            <Button
              aria-label="View child group data"
              leftIcon={<BsDiagram3 />}
              size="xs"
              variant="outline"
              colorScheme="secondary"
              onClick={() => handleViewGroup(info.row.original)}
            >
              Child Data
            </Button>
          </HStack>
        ),

        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "parentGroupCode",
              operator: "=",
              value: "",
              filterType: "text",
              filterLabel: "Group Code",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <HStack spacing={1}>
            <IconButton
              aria-label="Edit"
              icon={<FiEdit />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => handleEdit(info.row.original)}
            />
            <IconButton
              aria-label="Delete"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleDelete(info.row.original.id)}
            />
          </HStack>
        ),
      },
    ],
    [handleEdit, handleDelete, handleAddToGroup]
  );

  // Table instance
  const table = useReactTable({
    data: dataConstants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPages,
  });

  // Filter handling
  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);

    // Use reduce to merge all new filters at once
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      paramFilter
    );

    setParamFilter(updatedFilters);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    const response = await DeleteConstantData(deletingId, tokenData);

    if (response?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Constant deleted successfully",
        statusToast: "success",
      });
      setRefreshData((prev) => prev + 1);
      // Refresh group constants if View Group Modal is open
      if (selectedEntity) {
        loadGroupConstants(selectedEntity.value);
      }
      setDeletingId("");
    } else {
      showToast({
        description: response?.message || "Failed to delete constant",
        statusToast: "error",
      });
    }
    setActionLoading(false);
  };

  const refreshAction = () => {
    setRefreshData(refreshData + 1);
    // Force reload GroupCode options
    loadGroupCodeOptions(true);
  };

  // Form validation
  const ValidationSchema = Yup.object().shape({
    groupCode: Yup.string().required("Group code is required"),
    label: Yup.string().required("Label is required"),
    value: Yup.string().required("Value is required"),
    desc: Yup.string().nullable(),
  });

  // Add form
  const addFormik = useFormik<ConstantInsertDataPayload>({
    initialValues: {
      parentGroupCode: prefilledParentGroupCode,
      groupCode: prefilledGroupCode,
      label: "",
      value: "",
      desc: null,
    },
    enableReinitialize: true,
    validationSchema: ValidationSchema,
    onSubmit: async (values) => {
      setActionLoading(true);
      const response = await InsertConstantData(values, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Constant added successfully",
          statusToast: "success",
        });
        addFormik.resetForm();
        setRefreshData((prev) => prev + 1);
        
        // If adding sub constant, refresh and reopen View Group modal
        if (prefilledParentGroupCode && selectedEntity) {
          loadGroupConstants(selectedEntity.value);
          onAddClose();
          onViewGroupOpen();
        } else {
          onAddClose();
        }
        
        setPrefilledGroupCode("");
        setPrefilledParentGroupCode(null);
      } else {
        showToast({
          description: response?.message || "Failed to add constant",
          statusToast: "error",
        });
      }
      setActionLoading(false);
    },
  });

  // Edit form
  const editFormik = useFormik<ConstantUpdateDataPayload>({
    initialValues: {
      id: editingConstant?.id || "",
      label: editingConstant?.label || "",
      value: editingConstant?.value || "",
      desc: editingConstant?.desc || null,
    },
    enableReinitialize: true,
    validationSchema: ValidationSchema.omit(["groupCode"]),
    onSubmit: async (values) => {
      setActionLoading(true);
      const response = await UpdateConstantData(values, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Constant updated successfully",
          statusToast: "success",
        });
        setRefreshData((prev) => prev + 1);
        // Refresh group constants if View Group Modal is open
        if (selectedEntity) {
          loadGroupConstants(selectedEntity.value);
        }
        onEditClose();
      } else {
        showToast({
          description: response?.message || "Failed to update constant",
          statusToast: "error",
        });
      }
      setActionLoading(false);
    },
  });

  useEffect(() => {
    if (tokenData) {
      getDataConstants();
    }
  }, [
    tokenData,
    refreshData,
    pagination.pageIndex,
    pagination.pageSize,
    paramFilter,
  ]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={12}>
          <Card
            rounded={radiusStyle}
            shadow={"md"}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <HStack justifyContent={"space-between"} w="full">
                {/* GroupCode Filter - Left Side */}
                <Box minW="250px">
                  <Select
                    placeholder="Filter by Group Code"
                    options={groupCodeOptions}
                    isSearchable={true}
                    isClearable={true}
                    isLoading={isLoadingGroupCodes}
                    value={selectedGroupCodeFilter}
                    onChange={handleGroupCodeFilterChange}
                    // size="sm"
                  />
                </Box>

                {/* Action Buttons - Right Side */}
                <HStack>
                  <Popover closeOnBlur={false} placement="bottom">
                    <PopoverTrigger>
                      <Button
                        leftIcon={<FiFilter />}
                        colorScheme="gray"
                        variant="outline"
                        // size="sm"
                      >
                        Filter
                        {paramFilter.length > 0 && (
                          <Badge ml={2} colorScheme="red" variant="solid">
                            {paramFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <Portal>
                      <PopoverContent width="auto" minW="xs">
                        <PopoverBody>
                          <Flex as={Stack} w="full">
                            <Text fontWeight={600}>Filter Data</Text>
                            <Divider />

                            {paramFilter.length === 0 ? (
                              <Text fontSize="sm" color="gray.500">
                                No active filters
                              </Text>
                            ) : (
                              <Stack spacing={2}>
                                {paramFilter.map((filter, idx) => (
                                  <Flex
                                    key={idx}
                                    w="full"
                                    alignItems="center"
                                    as={HStack}
                                    spacing={2}
                                  >
                                    <Text fontSize="sm">
                                      {filter.filterLabel}:{" "}
                                      <Text as="span" fontWeight={600}>
                                        {filter.value}
                                      </Text>
                                    </Text>
                                    <IconButton
                                      aria-label="Remove filter"
                                      icon={<FiX />}
                                      size="xs"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => removeFilterData(filter)}
                                    />
                                  </Flex>
                                ))}
                              </Stack>
                            )}
                          </Flex>
                        </PopoverBody>
                      </PopoverContent>
                    </Portal>
                  </Popover>

                  <Button
                    leftIcon={<FiRefreshCcw />}
                    colorScheme="gray"
                    variant="outline"
                    // size="sm"
                    onClick={refreshAction}
                    isLoading={isLoadingProcess}
                  >
                    Refresh
                  </Button>
                  <Button
                    leftIcon={<FiPlusSquare />}
                    colorScheme="blue"
                    // size="sm"
                    onClick={() => {
                      setPrefilledGroupCode("");
                      onAddOpen();
                    }}
                  >
                    Add New
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>

            <MotionCardBody
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isLoadingProcess ? (
                <LoadingMiniSignature />
              ) : (
                <TableComponentWithFilterCTX
                  table={table}
                  handleFilterChange={handleFilterChange}
                />
              )}
            </MotionCardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setPrefilledGroupCode("");
          onAddClose();
        }}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={addFormik.handleSubmit}>
            <ModalHeader>Add New Constant</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl
                  isInvalid={
                    !!(
                      addFormik.errors.groupCode && addFormik.touched.groupCode
                    )
                  }
                >
                  <FormLabel>Group Code</FormLabel>
                  <Input
                    name="groupCode"
                    value={addFormik.values.groupCode}
                    onChange={(e) =>
                      addFormik.setFieldValue(
                        "groupCode",
                        e.target.value.toUpperCase().replace(/\s+/g, "_")
                      )
                    }
                    onBlur={addFormik.handleBlur}
                  />
                  <FormErrorMessage>
                    {addFormik.errors.groupCode}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(addFormik.errors.label && addFormik.touched.label)
                  }
                >
                  <FormLabel>Label</FormLabel>
                  <Input
                    name="label"
                    value={addFormik.values.label}
                    onChange={(e) =>
                      addFormik.setFieldValue(
                        "label",
                        e.target.value.toUpperCase()
                      )
                    }
                    onBlur={addFormik.handleBlur}
                  />
                  <FormErrorMessage>{addFormik.errors.label}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(addFormik.errors.value && addFormik.touched.value)
                  }
                >
                  <FormLabel>Value</FormLabel>
                  <Input
                    name="value"
                    value={addFormik.values.value}
                    onChange={(e) =>
                      addFormik.setFieldValue(
                        "value",
                        e.target.value.toUpperCase()
                      )
                    }
                    onBlur={addFormik.handleBlur}
                  />
                  {addFormik.values.label && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      mt={1}
                      onClick={() =>
                        addFormik.setFieldValue(
                          "value",
                          generateValueFromLabel(addFormik.values.label)
                        )
                      }
                    >
                      Use: {generateValueFromLabel(addFormik.values.label)}
                    </Button>
                  )}
                  <FormErrorMessage>{addFormik.errors.value}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="desc"
                    value={addFormik.values.desc || ""}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  setPrefilledGroupCode("");
                  onAddClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={actionLoading}
              >
                Add Constant
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={editFormik.handleSubmit}>
            <ModalHeader>Edit Constant</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Group Code</FormLabel>
                  <Input
                    value={editingConstant?.groupCode || ""}
                    isReadOnly
                    bg="gray.50"
                  />
                  <Text fontSize="xs" color="gray.500">
                    Group code cannot be changed
                  </Text>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(editFormik.errors.label && editFormik.touched.label)
                  }
                >
                  <FormLabel>Label</FormLabel>
                  <Input
                    name="label"
                    value={editFormik.values.label}
                    onChange={(e) =>
                      editFormik.setFieldValue(
                        "label",
                        e.target.value.toUpperCase()
                      )
                    }
                    onBlur={editFormik.handleBlur}
                  />
                  <FormErrorMessage>{editFormik.errors.label}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    !!(editFormik.errors.value && editFormik.touched.value)
                  }
                >
                  <FormLabel>Value</FormLabel>
                  <Input
                    name="value"
                    value={editFormik.values.value}
                    onChange={(e) =>
                      editFormik.setFieldValue(
                        "value",
                        e.target.value.toUpperCase()
                      )
                    }
                    onBlur={editFormik.handleBlur}
                  />
                  {editFormik.values.label && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      mt={1}
                      onClick={() =>
                        editFormik.setFieldValue(
                          "value",
                          generateValueFromLabel(editFormik.values.label)
                        )
                      }
                    >
                      Use: {generateValueFromLabel(editFormik.values.label)}
                    </Button>
                  )}
                  <FormErrorMessage>{editFormik.errors.value}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="desc"
                    value={editFormik.values.desc || ""}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={actionLoading}
              >
                Update Constant
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Group Modal */}
      <Modal isOpen={isViewGroupOpen} onClose={onViewGroupClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group: {selectedGroupCode}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4} fontSize="sm" color="gray.600">
              Showing {groupConstants.length} constants in this group
            </Text>
            <Box overflowX="auto">
              <Table size="xs" variant="striped">
                <Thead>
                  <Tr>
                    <Th fontSize="xs">Group Code</Th>
                    <Th fontSize="xs">Label</Th>
                    <Th fontSize="xs">Value</Th>
                    <Th fontSize="xs">Description</Th>
                    <Th fontSize="xs" textAlign="center">
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groupConstants.map((constant) => (
                    <Tr key={constant.id}>
                      <Td fontSize="xs">
                        <Badge colorScheme="secondary" variant="subtle">
                          {constant.groupCode}
                        </Badge>
                      </Td>
                      <Td fontSize="xs">{constant.label}</Td>
                      <Td>
                        <Badge
                          colorScheme="green"
                          variant="subtle"
                          fontSize="xs"
                        >
                          {constant.value}
                        </Badge>
                      </Td>
                      <Td fontSize="xs">{constant.desc || "-"}</Td>
                      <Td>
                        <HStack spacing={1} justify="center">
                          <IconButton
                            aria-label="Edit constant"
                            icon={<FiEdit />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => {
                              handleEditConstant(constant);
                              onViewGroupClose();
                            }}
                          />
                          <IconButton
                            aria-label="Delete constant"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteConstant(constant.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              leftIcon={<FiPlusSquare />}
              colorScheme="blue"
              size="sm"
              mr={3}
              onClick={() => {
                if (selectedEntity) {
                  setPrefilledParentGroupCode(selectedEntity.value); // parentGroupCode = entity.value
                  setPrefilledGroupCode(selectedEntity.groupCode); // groupCode = entity.groupCode
                }
                onViewGroupClose();
                onAddOpen();
              }}
            >
              Add New
            </Button>
            <Button size="sm" onClick={onViewGroupClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpenTrigger={isDeleteTrigger}
        trigger={setIsDeleteTrigger}
        action={handleDeleteConfirm}
        captionMsg="Delete Constant"
        questionMsg="Are you sure you want to delete this constant? This action cannot be undone."
      />
    </LayoutAdmin>
  );
}

export default MasterDataConstantPage;
