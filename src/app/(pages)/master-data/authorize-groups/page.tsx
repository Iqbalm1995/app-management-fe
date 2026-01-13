"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAuthorizeGroups, {
  AuthorizeGroupResponse,
} from "@/app/services/useAuthorizeGroups";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Text,
  useColorMode,
  VStack,
  IconButton,
  Tooltip,
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
  Textarea,
  FormErrorMessage,
  Switch,
  useToast,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { FiRefreshCw, FiSearch, FiX, FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import Link from "next/link";

const HeaderDataContent: HeaderContentProps = {
  titleName: "User Authorize Groups",
  breadCrumb: ["Home", "Master Data", "Authorize Groups"],
};

function AuthorizeGroupsPage() {
  useDocumentTitle("User Authorize Groups");
  const showToast = useToastHelper();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [Data, setData] = useState<AuthorizeGroupResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  const { List, Insert, Delete } = useAuthorizeGroups();

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

  const ValidationSchema = Yup.object().shape({
    agName: Yup.string()
      .required("Name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    agDescriptions: Yup.string().max(500, "Maximum 500 characters"),
  });

  const generateCodeFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const formik = useFormik<{
    agCode: string;
    agName: string;
    agDescriptions: string;
    isActive: boolean;
    agAccessMaker: boolean;
    agAccessReview: boolean;
    agAccessApprove: boolean;
  }>({
    initialValues: {
      agCode: "",
      agName: "",
      agDescriptions: "",
      isActive: true,
      agAccessMaker: false,
      agAccessReview: false,
      agAccessApprove: false,
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

    const payload = {
      agCode: pendingFormValues.agCode,
      agName: pendingFormValues.agName,
      agDescriptions: pendingFormValues.agDescriptions || null,
      functionIdLink: null,
      isActive: pendingFormValues.isActive ? "Y" : "N",
      agAccessMaker: pendingFormValues.agAccessMaker ? "Y" : "N",
      agAccessReview: pendingFormValues.agAccessReview ? "Y" : "N",
      agAccessApprove: pendingFormValues.agAccessApprove ? "Y" : "N",
    };

    const token = localStorage.getItem("tokenData") as string;
    const result = await Insert(payload, token);

    if (result?.statusCode === RES_CODE_OK || result?.statusCode === 201) {
      onClose();
      formik.resetForm();
      setRefreshData((prev) => prev + 1);
      toast({
        title: "Success",
        description: "Authorize Group successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to add Authorize Group",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingFormValues(null);
  };

  const handleDelete = (id: string, name: string) => {
    setPendingDeleteItem({ id, name });
    setShowDeleteDialog(true);
  };

  const handleConfirmedDelete = async () => {
    if (!pendingDeleteItem) return;

    const token = localStorage.getItem("tokenData") as string;
    const result = await Delete(pendingDeleteItem.id, token);

    if (result?.statusCode === RES_CODE_OK) {
      setRefreshData((prev) => prev + 1);
      toast({
        title: "Success",
        description: "Authorize Group successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed",
        description: result?.message || "Failed to delete Authorize Group",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setPendingDeleteItem(null);
  };

  const columnsData = useMemo<ColumnDef<AuthorizeGroupResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text>{pageIndex * pageSize + info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agCode",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium">
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Code</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agName",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="semibold">
            {info.getValue() as string}
          </Text>
        ),
        header: () => <Text>Name</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agDescriptions",
        cell: (info) => (
          <Text fontSize="sm" noOfLines={2}>
            {info.getValue() as string || "-"}
          </Text>
        ),
        header: () => <Text>Description</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "isActive",
        cell: (info) => (
          <Badge colorScheme={info.getValue() === "Y" ? "green" : "red"}>
            {info.getValue() === "Y" ? "Active" : "Inactive"}
          </Badge>
        ),
        header: () => <Text>Status</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agAccessMaker",
        cell: (info) => (
          <Badge colorScheme={info.getValue() === "Y" ? "blue" : "gray"} variant="subtle">
            {info.getValue() === "Y" ? "Yes" : "No"}
          </Badge>
        ),
        header: () => <Text>Maker</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agAccessReview",
        cell: (info) => (
          <Badge colorScheme={info.getValue() === "Y" ? "purple" : "gray"} variant="subtle">
            {info.getValue() === "Y" ? "Yes" : "No"}
          </Badge>
        ),
        header: () => <Text>Review</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "agAccessApprove",
        cell: (info) => (
          <Badge colorScheme={info.getValue() === "Y" ? "orange" : "gray"} variant="subtle">
            {info.getValue() === "Y" ? "Yes" : "No"}
          </Badge>
        ),
        header: () => <Text>Approve</Text>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "actions",
        cell: (info) => (
          <HStack spacing={2}>
            <Link href={`/master-data/authorize-groups/detail?id=${info.row.original.id}`}>
              <Tooltip label="View Detail">
                <IconButton
                  aria-label="View"
                  icon={<FiEye />}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                />
              </Tooltip>
            </Link>
            <Tooltip label="Delete">
              <IconButton
                aria-label="Delete"
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(info.row.original.id, info.row.original.agName)}
              />
            </Tooltip>
          </HStack>
        ),
        header: () => <Text>Actions</Text>,
        footer: (props) => props.column.id,
      },
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: Data,
    columns: columnsData,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const GetDataList = async (searchValue: string = "") => {
    setIsLoadingProcess(true);

    const PayloadList: PaggingListPayload = {
      limit: pageSize,
      page: pageIndex,
      search: searchValue,
      filterWhere: [],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
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
      return;
    }

    if (requestData.data == null) {
      showToast({
        description: "Data return error",
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return;
    }

    const itemsData: AuthorizeGroupResponse[] =
      requestData.data as AuthorizeGroupResponse[];

    setData(itemsData);
    setTotalPageData(Math.ceil((requestData.countTotal || 0) / pageSize));
    setIsLoadingProcess(false);
  };

  useEffect(() => {
    if (tokenData) {
      GetDataList(globalFilter);
    }
  }, [RefreshData, pageIndex, pageSize, tokenData]);

  const handleSearch = () => {
    setPagination({ pageIndex: 0, pageSize });
    GetDataList(globalFilter);
  };

  const handleClearSearch = () => {
    setGlobalFilter("");
    setPagination({ pageIndex: 0, pageSize });
    GetDataList("");
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Card rounded={radiusStyle} bgColor={colorMode === "light" ? "white" : "gray.800"}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex gap={3} flexWrap="wrap">
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search by code or name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
              </InputGroup>
              <Button
                leftIcon={<FiSearch />}
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={IsLoadingProcess}
              >
                Search
              </Button>
              {globalFilter && (
                <Button
                  leftIcon={<FiX />}
                  variant="ghost"
                  onClick={handleClearSearch}
                >
                  Clear
                </Button>
              )}
              <Spacer />
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                onClick={() => setRefreshData((prev) => prev + 1)}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="secondary"
                onClick={onOpen}
              >
                Add New
              </Button>
            </Flex>

            <Box>
              <TableComponentFull
                table={table}
                isLoading={IsLoadingProcess}
                totalPages={totalPages}
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Authorize Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!(formik.errors.agName && formik.touched.agName)} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="agName"
                  value={formik.values.agName}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue("agCode", generateCodeFromName(e.target.value));
                  }}
                  onBlur={formik.handleBlur}
                  placeholder="Enter name"
                />
                <FormErrorMessage>{formik.errors.agName}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Code (Auto-generated)</FormLabel>
                <Input
                  name="agCode"
                  value={formik.values.agCode}
                  isReadOnly
                  bg="gray.50"
                  placeholder="Auto-generated from name"
                />
              </FormControl>

              <FormControl isInvalid={!!(formik.errors.agDescriptions && formik.touched.agDescriptions)}>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  name="agDescriptions"
                  value={formik.values.agDescriptions}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter description"
                  rows={3}
                  maxLength={500}
                />
                <FormErrorMessage>{formik.errors.agDescriptions}</FormErrorMessage>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Is Active</FormLabel>
                <Switch
                  name="isActive"
                  isChecked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Access Maker</FormLabel>
                <Switch
                  name="agAccessMaker"
                  isChecked={formik.values.agAccessMaker}
                  onChange={(e) => formik.setFieldValue("agAccessMaker", e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Access Review</FormLabel>
                <Switch
                  name="agAccessReview"
                  isChecked={formik.values.agAccessReview}
                  onChange={(e) => formik.setFieldValue("agAccessReview", e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Access Approve</FormLabel>
                <Switch
                  name="agAccessApprove"
                  isChecked={formik.values.agAccessApprove}
                  onChange={(e) => formik.setFieldValue("agAccessApprove", e.target.checked)}
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

      <ConfirmationDialog
        isOpenTrigger={showConfirmDialog}
        action={handleConfirmedSubmit}
        trigger={setShowConfirmDialog}
        questionMsg={`Are you sure you want to add authorize group "${pendingFormValues?.agName}"?`}
        captionMsg="Confirm Save"
      />

      <ConfirmationDialog
        isOpenTrigger={showDeleteDialog}
        action={handleConfirmedDelete}
        trigger={setShowDeleteDialog}
        questionMsg={`Are you sure you want to delete authorize group "${pendingDeleteItem?.name}"?`}
        captionMsg="Confirm Delete"
      />
    </LayoutAdmin>
  );
}

export default AuthorizeGroupsPage;
