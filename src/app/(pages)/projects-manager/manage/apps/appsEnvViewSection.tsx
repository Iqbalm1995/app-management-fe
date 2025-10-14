"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputLayout } from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { truncateText } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsEnvDataResponse,
  AppsEnvInsertPayload,
  AppsEnvUpdateAccountAllPayload,
  AppsEnvUpdateAllPayload,
  AppsEnvUpdateLinkAllPayload,
} from "@/app/services/useProjects";
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
  Wrap,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Tooltip,
  useColorModeValue,
  VStack,
  useDisclosure,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  StackDivider,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiEye,
  FiMinus,
  FiPlus,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import * as Yup from "yup";
import { PaggingListPayload } from "@/app/types/masterTypes";
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
import { TableComponentFullHeadlessAlternate1 } from "@/app/components/tableComponents";

const FormSchemaEnvUpdateAll = Yup.object().shape({
  id: Yup.string().required("ID is required"),
  envName: Yup.string().required("Environment name is required"),
  envDesc: Yup.string().nullable(), // Allow null for description
  isActive: Yup.string().required("Status is required"),
});

const FormSchemaEnvAccount = Yup.object().shape({
  id: Yup.string().nullable(),
  accountsName: Yup.string().required("Account name is required"),
  accountsDesc: Yup.string().required("Descriptions is required"),
});

const AppsEnvirontmentSection = ({ AppsId }: { AppsId: string }) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const {
    ListAppsEnv,
    ListAppsEnvLink,
    ListAppsEnvAccount,
    GetDetailAppsEnvById,
    GetDetailAppsEnvLinkById,
    GetDetailAppsEnvAccountById,
    InsertAppsEnv,
    InsertAppsEnvLink,
    InsertAppsEnvAccount,
    UpdateAppsEnv,
    UpdateAppsEnvLink,
    UpdateAppsEnvAccount,
    DeleteAppsEnv,
    DeleteAppsEnvLink,
    DeleteAppsEnvAccount,
    UpdateAppsEnvAll,
  } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const storedData = localStorage.getItem("authData");
  const tokenData: string = localStorage.getItem("tokenData") as string;
  useEffect(() => {
    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }
  }, [DataAuth]);

  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataAppsEnv, setDataAppsEnv] = useState<AppsEnvDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [DetailEnv, setDetailEnv] = useState<AppsEnvDataResponse | null>(null);
  const [LinkData, setLinkData] = useState<AppsEnvUpdateLinkAllPayload[]>([]);
  const [AccountData, setAccountData] = useState<
    AppsEnvUpdateAccountAllPayload[]
  >([]);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<AppsEnvDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "logCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Box
              w={"full"}
              p={4}
              rounded={radiusStyle}
              bg={colorMode == "light" ? "gray.100" : "gray.800"}
            >
              <Flex
                as={HStack}
                alignItems={"center"}
                w={"full"}
                divider={
                  <StackDivider
                    borderColor={
                      colorMode == "light" ? "secondary.200" : "secondary.600"
                    }
                  />
                }
              >
                <Flex as={HStack} alignItems={"start"} w={"full"}>
                  <Heading as="h5" size="sm">
                    {info.row.original.envName}
                  </Heading>
                </Flex>
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Button
                    size={"md"}
                    variant={"ghost"}
                    colorScheme={"secondary"}
                    isActive={info.row.original.id === DetailEnv?.id}
                    onClick={() => handleEditData(info.row.original)}
                    isLoading={ActionLoading}
                  >
                    <FiChevronRight size={"1.5em"} />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Stack>
        ),
        header: () => <span></span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode, DetailEnv]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "appsId",
            operator: "=",
            value: AppsId || "-",
          },
        ],
        fieldOrder: ["envName"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListAppsEnv(PayloadList, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: AppsEnvDataResponse[] =
            requestData.data as AppsEnvDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataAppsEnv(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, AppsId]);

  const RefreshAction = () => {
    setTextNewEnvName("");
    setTotalPageData(0);
    setDataAppsEnv([]);
    setDetailEnv(null);
    setLinkData([]);
    setAccountData([]);
    setRefreshData(RefreshData + 1);
    formik.resetForm();
  };

  const table = useReactTable({
    data: DataAppsEnv,
    columns: columnsData,
    pageCount: totalPages ?? 1,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  const formik = useFormik<AppsEnvUpdateAllPayload>({
    initialValues: {
      id: "",
      envName: "",
      envDesc: null,
      isActive: "ACTIVE",
      links: [
        {
          id: null,
          linksSource: "",
        },
      ],
      accounts: [
        {
          id: null,
          accountsName: "",
          accountsDesc: null,
        },
      ],
    },
    validationSchema: FormSchemaEnvUpdateAll,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log("onSubmit triggered");
      console.log(values); // Log the form data
      await SaveEnvData(values);
    },
  });

  const handleButtonClick = () => {
    console.log("Submit button clicked");
    console.log("Formik errors: ", formik.errors); // Check for validation errors

    formik.setFieldValue("links", LinkData);
    formik.setFieldValue("accounts", AccountData);

    formik.handleSubmit(); // Trigger form submission
  };

  const handleEditData = async (data: AppsEnvDataResponse) => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (AppsId) {
      const GetData: AppsEnvDataResponse | null = await GetDetailAppsEnvServ(
        data.id
      );
      console.log(GetData);
      if (GetData == null) return;

      setDetailEnv(data);
      setInputLinkText("");

      formik.setFieldValue("id", GetData.id);
      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("envName", GetData.envName);
      formik.setFieldValue("envDesc", GetData.envDesc);
      formik.setFieldValue("isActive", "ACTIVE");

      setLinkData(GetData.links);
      setAccountData(GetData.accounts);

      // ModalForm.onOpen();
      setActionLoading(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const GetDetailAppsEnvServ = async (
    id: string
  ): Promise<AppsEnvDataResponse | null> => {
    const requestData = await GetDetailAppsEnvById(id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return null;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return null;
      }

      const itemsData: AppsEnvDataResponse =
        requestData.data as AppsEnvDataResponse;

      return itemsData;
    }
  };

  const SaveEnvData = async (data: AppsEnvUpdateAllPayload) => {
    const requestData = await UpdateAppsEnvAll(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Save data environtment successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  const SaveNewEnvData = async (data: AppsEnvInsertPayload) => {
    const requestData = await InsertAppsEnv(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Create new environtment successfully",
        statusToast: "success",
      });
      ModalFormNewEnv.onClose();
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  const DeleteEnvDataServ = async (id: string) => {
    const requestData = await DeleteAppsEnv(id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Delete environtment successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  // LINK OPERATIONS
  // Function to add a new item
  const addLinkItem = () => {
    if (InputLinkText.length <= 3) {
      showToast({
        description: "Link cannot be empty or too short",
        statusToast: "warning",
      });
      return;
    }
    const newItem: AppsEnvUpdateLinkAllPayload = {
      id: null,
      linksSource: InputLinkText,
    };
    setLinkData([...LinkData, newItem]); // Add new item to the state
    setInputLinkText("");
  };

  // Function to remove an item by its index
  const removeItem = (index: number) => {
    const updatedItems = [...LinkData];
    updatedItems.splice(index, 1); // Remove the item at the given index
    setLinkData(updatedItems); // Update state after removing the item
  };

  // Function to edit an item's name by its index
  const editItem = (index: number, linkText: string) => {
    const updatedItems = [...LinkData];
    updatedItems[index] = { ...updatedItems[index], linksSource: linkText }; // Update name at the index
    setLinkData(updatedItems); // Update state with the edited item
  };

  const [InputLinkText, setInputLinkText] = useState<string>("");

  // ACCOUNT OPERATIONS

  const [EditModeAccount, setEditModeAccount] = useState(false);
  const [IndexSelectedAccount, setIndexSelectedAccount] = useState(0);
  const formikAccountENV = useFormik<AppsEnvUpdateAccountAllPayload>({
    initialValues: {
      id: null,
      accountsName: "",
      accountsDesc: null,
    },
    validationSchema: FormSchemaEnvAccount,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values); // Log the form data
      console.log(EditModeAccount);
      console.log(IndexSelectedAccount);
      if (EditModeAccount) {
        // Edit Operation
        editItemAccount(IndexSelectedAccount, values);
      } else {
        addLinkItemAccount(values);
      }
    },
  });

  const ModalForm = useDisclosure();

  const handleAddNewAccount = () => {
    if ((DataAuth && DataAuth.team, AppsId)) {
      setEditModeAccount(false);
      formikAccountENV.setFieldValue("id", null);
      formikAccountENV.setFieldValue("accountsName", "");
      formikAccountENV.setFieldValue("accountsDesc", "");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleEditDataAccount = async (
    data: AppsEnvUpdateAccountAllPayload,
    index: number
  ) => {
    setEditModeAccount(true);
    setIndexSelectedAccount(index);
    formikAccountENV.setFieldValue("id", data.id);
    formikAccountENV.setFieldValue("accountsName", data.accountsName);
    formikAccountENV.setFieldValue("accountsDesc", data.accountsDesc);

    ModalForm.onOpen();
  };

  const addLinkItemAccount = (data: AppsEnvUpdateAccountAllPayload) => {
    setAccountData([...AccountData, data]); // Add new item to the state

    setEditModeAccount(false);
    ModalForm.onClose();
  };
  // Function to edit an item's name by its index
  const editItemAccount = (
    index: number,
    data: AppsEnvUpdateAccountAllPayload
  ) => {
    const updatedItems = [...AccountData];
    updatedItems[index] = {
      ...updatedItems[index],
      accountsName: data.accountsName,
      accountsDesc: data.accountsDesc,
    }; // Update name at the index
    setAccountData(updatedItems); // Update state with the edited item

    setEditModeAccount(false);
    ModalForm.onClose();
  };

  // Function to remove an item by its index
  const removeItemAccount = (index: number) => {
    const updatedItems = [...AccountData];
    updatedItems.splice(index, 1); // Remove the item at the given index
    setAccountData(updatedItems); // Update state after removing the item
    setEditModeAccount(false);
    ModalForm.onClose();
  };

  // Function to add new Environtment
  const ModalFormNewEnv = useDisclosure();
  const [TextNewEnvName, setTextNewEnvName] = useState<string>("");
  const handleAddNewEnv = () => {
    setTextNewEnvName("");
    ModalFormNewEnv.onOpen();
  };

  const handleSaveNewEnv = async () => {
    if (TextNewEnvName.length <= 3) {
      showToast({
        description: "Link cannot be empty or too short",
        statusToast: "warning",
      });
      return;
    }

    if ((DataAuth && DataAuth.team, AppsId)) {
      setEditModeAccount(false);
      const PayloadNewData: AppsEnvInsertPayload = {
        appsId: AppsId,
        envName: TextNewEnvName,
        envDesc: "",
        isActive: "ACTIVE",
      };
      setActionLoading(true);
      await SaveNewEnvData(PayloadNewData);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  // Funtion delete env
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");

  const handleDeleteEnv = () => {
    if (DetailEnv && AppsId) {
      console.log(DetailEnv);
      handleConfirmDeleteData(DetailEnv);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleConfirmDeleteData = (data: AppsEnvDataResponse) => {
    setCaptionDialog("Confirm Delete Data");
    setQuestionMsgDialog(
      `Are you sure want to delete environtment "${data.envName}"?`
    );
    setOpenConfirmDialog(true);
  };

  const DeleteDataEnv = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && DetailEnv) {
      await DeleteEnvDataServ(DetailEnv.id);
    } else {
      showToast({
        description: "Data is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setDetailEnv(null);
    }
  };

  const handleDialogTrigger = () => {
    setOpenConfirmDialog(!openConfirmDialog);
  };

  return (
    <Box as={Stack} w={"full"} spacing={6} minH={"40vh"}>
      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDialog}
        action={DeleteDataEnv}
        trigger={handleDialogTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <Modal
        size={"2xl"}
        isOpen={ModalFormNewEnv.isOpen}
        isCentered
        onClose={ModalFormNewEnv.onClose}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          <ModalHeader>Create New Environtment</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} pt={4}>
              <FormControl id="envName" isRequired>
                {/* <FormLabel>Environtment Name</FormLabel> */}
                <Stack spacing={0}>
                  <Input
                    id="envName"
                    name="envName"
                    type="text"
                    onChange={(e) => {
                      const uppercaseValue = e.target.value.toUpperCase();
                      setTextNewEnvName(uppercaseValue);
                    }}
                    value={TextNewEnvName}
                    variant={"flushed"}
                    placeholder="New Environtment Name here..."
                    size={"lg"}
                    minLength={3}
                    maxLength={80}
                  />
                </Stack>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme={"gray"}
              leftIcon={<FiX />}
              mr={3}
              onClick={ModalFormNewEnv.onClose}
              isLoading={ActionLoading}
            >
              Close
            </Button>
            <Button
              leftIcon={<FiPlusSquare />}
              type={"button"}
              colorScheme={"secondary"}
              isLoading={ActionLoading}
              onClick={() => handleSaveNewEnv()}
            >
              Create New
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex w={"full"} p={2} as={HStack} justifyContent={"space-between"}>
        <Heading as="h5" size="sm" w={"full"}>
          Apps Environtment Management
        </Heading>
        <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
          <Button
            size={"sm"}
            leftIcon={<FiRefreshCcw />}
            onClick={() => RefreshAction()}
          >
            Refresh
          </Button>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            leftIcon={<FiPlusSquare />}
            onClick={() => handleAddNewEnv()}
            isLoading={ActionLoading}
          >
            Add
          </Button>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(12, 1fr)" gap={2}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 5, lg: 5 }} w={"full"}>
          <VStack w={"full"} p={0} align={"start"} spacing={2}>
            {IsLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <TableComponentFullHeadlessAlternate1 table={table} />
            )}
          </VStack>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 7, lg: 7 }} w={"full"}>
          <Card
            rounded={radiusStyle}
            boxShadow={"md"}
            bgGradient={"linear(to-br, secondary.500, secondary.800)"}
            color={"white"}
          >
            <CardHeader pb={1}>
              <Flex justifyContent={"space-between"}>
                <Flex as={HStack}>
                  {DetailEnv && (
                    <Button
                      size={"sm"}
                      variant={"ghost"}
                      colorScheme={"white"}
                      onClick={() => setDetailEnv(null)}
                      isLoading={ActionLoading}
                    >
                      <FiX />
                    </Button>
                  )}
                  <Heading as="h5" size="sm">
                    Detail Environtment
                  </Heading>
                </Flex>
                {DetailEnv && (
                  <Flex as={Wrap} justifyContent={"end"} px={0}>
                    <Button
                      size={"sm"}
                      leftIcon={<FiSave />}
                      variant={"solid"}
                      colorScheme={"green"}
                      onClick={() => handleButtonClick()}
                      isLoading={ActionLoading}
                    >
                      Save Update
                    </Button>
                    <Button
                      size={"sm"}
                      variant={"solid"}
                      colorScheme={"red"}
                      onClick={() => handleDeleteEnv()}
                      isLoading={ActionLoading}
                    >
                      <FiTrash2 />
                    </Button>
                  </Flex>
                )}
              </Flex>
            </CardHeader>
            <CardBody pt={2} w={"full"}>
              <Flex
                minH={"420px"}
                justifyContent={DetailEnv ? "start" : "center"}
                alignItems={DetailEnv ? "start" : "center"}
                w={"full"}
                as={Stack}
              >
                {ActionLoading ? (
                  <LoadingMiniSignature />
                ) : DetailEnv ? (
                  <Tabs variant="unstyled" w={"full"}>
                    <TabList>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Detail Env
                      </Tab>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Link Apps
                      </Tab>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Account Apps
                      </Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Flex as={Stack} w={"full"} pt={4}>
                          <form
                            onSubmit={formik.handleSubmit}
                            onReset={formik.handleReset}
                          >
                            <FormControl
                              id="envName"
                              isInvalid={formik.errors.envName ? true : false}
                              isRequired
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Environtment Name
                                </FormLabel>
                                <Stack spacing={0}>
                                  <Input
                                    id="envName"
                                    name="envName"
                                    type="text"
                                    onChange={formik.handleChange}
                                    value={formik.values.envName ?? ""}
                                    placeholder="Team Name"
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    minLength={3}
                                    maxLength={80}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    // isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.envName}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="envDesc"
                              isInvalid={formik.errors.envDesc ? true : false}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Environtment Descriptions
                                </FormLabel>
                                <Stack spacing={0}>
                                  <Textarea
                                    id="envDesc"
                                    name="envDesc"
                                    onChange={formik.handleChange}
                                    defaultValue={formik.values.envDesc ?? ""}
                                    placeholder="Descriptions"
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    // isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.envDesc}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          </form>
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <Flex as={Stack} w={"full"} pt={4}>
                          <Flex
                            w={"full"}
                            bgColor={
                              colorMode == "light" ? "white" : "gray.800"
                            }
                            color={colorMode == "light" ? "gray.800" : "white"}
                            p={3}
                            rounded={radiusStyle}
                          >
                            <FormControl id="InputLinkText" isRequired>
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  New Link Apps
                                </FormLabel>
                                <HStack spacing={2}>
                                  <Input
                                    id="InputLinkText"
                                    name="InputLinkText"
                                    type="text"
                                    onChange={(e) =>
                                      setInputLinkText(e.target.value)
                                    }
                                    value={InputLinkText}
                                    placeholder="https://..."
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    minLength={3}
                                    maxLength={80}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    isDisabled={ActionLoading}
                                  />
                                  <Button
                                    size={"sm"}
                                    variant={"solid"}
                                    colorScheme={"secondary"}
                                    onClick={() => addLinkItem()}
                                    isLoading={ActionLoading}
                                  >
                                    <FiPlus />
                                  </Button>
                                </HStack>
                              </InputLayout>
                            </FormControl>
                          </Flex>
                        </Flex>
                        <Flex
                          as={Stack}
                          w={"full"}
                          spacing={2}
                          pt={3}
                          px={4}
                          divider={<StackDivider />}
                        >
                          {LinkData.map((dt, index) => (
                            <FormControl
                              id={`InputLinkText${index}`}
                              key={index}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} py={2}>
                                  Link - {index + 1}
                                </FormLabel>
                                <Stack spacing={1}>
                                  <HStack spacing={2}>
                                    <Input
                                      id={`InputLinkText${index}`}
                                      name={`InputLinkText${index}`}
                                      type="text"
                                      onChange={(e) =>
                                        editItem(index, e.target.value)
                                      }
                                      value={dt.linksSource}
                                      placeholder="https://..."
                                      // readOnly={!IsEditMode}
                                      // variant={IsEditMode ? "outline" : "filled"}
                                      minLength={3}
                                      maxLength={80}
                                      color={"gray.800"}
                                      bgColor={"gray.100"}
                                      isDisabled={ActionLoading}
                                    />
                                    <Button
                                      size={"sm"}
                                      variant={"solid"}
                                      colorScheme={"red"}
                                      onClick={() => removeItem(index)}
                                      isLoading={ActionLoading}
                                    >
                                      <FiMinus />
                                    </Button>
                                  </HStack>
                                  <Link
                                    href={
                                      dt.linksSource.length > 0
                                        ? dt.linksSource
                                        : "#"
                                    }
                                    target={"_blank"}
                                  >
                                    <Tooltip
                                      hasArrow
                                      rounded={radiusStyle}
                                      colorScheme={"secondary"}
                                      label={`${dt.linksSource}`}
                                    >
                                      <Button
                                        variant={"link"}
                                        size={"sm"}
                                        colorScheme={"white"}
                                      >
                                        {truncateText(dt.linksSource, 120)}
                                      </Button>
                                    </Tooltip>
                                  </Link>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          ))}
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <Flex as={Stack} w={"full"}>
                          <Flex
                            as={Wrap}
                            justifyContent={"end"}
                            py={4}
                            w={"full"}
                          >
                            <Button
                              size={"sm"}
                              colorScheme={"secondary"}
                              leftIcon={<FiPlusSquare />}
                              onClick={() => handleAddNewAccount()}
                              isLoading={ActionLoading}
                            >
                              Add
                            </Button>
                          </Flex>

                          <Flex as={Stack} w={"full"}>
                            {AccountData.map((dt, index) => (
                              <Flex
                                key={index}
                                w={"full"}
                                as={HStack}
                                bgColor={"white"}
                                rounded={radiusStyle}
                                p={4}
                                px={5}
                                color={"gray.900"}
                                divider={
                                  <StackDivider
                                    borderColor={
                                      colorMode == "light"
                                        ? "secondary.200"
                                        : "secondary.600"
                                    }
                                  />
                                }
                              >
                                <Flex
                                  w={"full"}
                                  justifyContent={"start"}
                                  gap={2}
                                  pl={4}
                                >
                                  <Text>{index + 1}.</Text>
                                  <Text>{dt.accountsName}</Text>
                                </Flex>
                                <Button
                                  size={"sm"}
                                  variant={"ghost"}
                                  colorScheme={"secondary"}
                                  onClick={() =>
                                    handleEditDataAccount(dt, index)
                                  }
                                >
                                  <FiEye />
                                </Button>
                              </Flex>
                            ))}
                          </Flex>
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                ) : (
                  <Text>No data preview</Text>
                )}
              </Flex>

              <Modal
                size={"2xl"}
                isOpen={ModalForm.isOpen}
                isCentered
                onClose={ModalForm.onClose}
              >
                <form
                  onSubmit={formikAccountENV.handleSubmit}
                  onReset={formikAccountENV.handleReset}
                >
                  <ModalOverlay bg="blackAlpha.300" />
                  <ModalContent
                    rounded={radiusStyle}
                    m={2}
                    bg={useColorModeValue("white", "gray.900")}
                  >
                    <ModalHeader>
                      {formikAccountENV.values.id != null &&
                      formikAccountENV.values.id.length > 0
                        ? "Edit Data"
                        : "Add Data"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody w={"full"}>
                      <Flex as={Stack} w={"full"} pt={4}>
                        <FormControl
                          id="accountsName"
                          isInvalid={
                            formikAccountENV.errors.accountsName ? true : false
                          }
                          isRequired
                        >
                          <FormLabel>Account Name</FormLabel>
                          <Stack spacing={0}>
                            <Input
                              id="accountsName"
                              name="accountsName"
                              type="text"
                              onChange={formikAccountENV.handleChange}
                              value={formikAccountENV.values.accountsName ?? ""}
                              placeholder="Account Name"
                              minLength={3}
                              maxLength={80}
                            />
                            <FormErrorMessage>
                              {formikAccountENV.errors.accountsName}
                            </FormErrorMessage>
                          </Stack>
                        </FormControl>
                        <FormControl
                          id="accountsDesc"
                          isInvalid={
                            formikAccountENV.errors.accountsDesc ? true : false
                          }
                          isRequired
                        >
                          <FormLabel h={"full"}>Descriptions</FormLabel>
                          <Stack spacing={0}>
                            <Textarea
                              id="accountsDesc"
                              name="accountsDesc"
                              onChange={formikAccountENV.handleChange}
                              defaultValue={
                                formikAccountENV.values.accountsDesc ?? ""
                              }
                              placeholder={"Descriptions"}
                              minH={"20vh"}
                            />
                            <FormErrorMessage>
                              {formikAccountENV.errors.accountsDesc}
                            </FormErrorMessage>
                          </Stack>
                        </FormControl>
                      </Flex>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        colorScheme={"red"}
                        leftIcon={<FiTrash2 />}
                        mr={3}
                        onClick={() => removeItemAccount(IndexSelectedAccount)}
                        isLoading={ActionLoading}
                      >
                        Delete
                      </Button>
                      <Button
                        colorScheme={"gray"}
                        leftIcon={<FiX />}
                        mr={3}
                        onClick={ModalForm.onClose}
                        isLoading={ActionLoading}
                      >
                        Close
                      </Button>
                      <Button
                        leftIcon={<FiSave />}
                        type={"submit"}
                        colorScheme={"secondary"}
                        isLoading={ActionLoading}
                      >
                        Save
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </form>
              </Modal>

              <Box overflowY={"auto"}>
                {/* <pre>{JSON.stringify(AccountData, null, 2)}</pre> */}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AppsEnvirontmentSection;
