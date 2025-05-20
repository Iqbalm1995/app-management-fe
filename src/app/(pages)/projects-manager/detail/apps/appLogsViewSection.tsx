"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_ACTION,
  DELAY_MEDIUM,
  OptionChangeLogsCategory,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  convertToCustomDateFormat,
  generateTimestamp,
  generateUniqueCode,
  TextLabelProps,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsLogsInsertPayload,
  AppsLogsPayload,
  AppsLogsResponse,
  AppsLogsUpdatePayload,
} from "@/app/services/useProjects";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Wrap,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
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
  Icon,
  StackDivider,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEdit3,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import * as Yup from "yup";
import { OptionListProps, PaggingListPayload } from "@/app/types/masterTypes";
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
import { TableComponentFullHeadless } from "@/app/components/tableComponents";

const FormSchemaLogsApps = Yup.object().shape({
  categoryChange: Yup.string().required("Required"),
  logTitle: Yup.string().required("Required"),
  logCode: Yup.string().required("Required"),
  logDesc: Yup.string().required("Required"),
});

const AppChangeLogSection = ({ AppsId }: { AppsId: string }) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const {
    ListLogsApps,
    GetDetailLogAppsById,
    InsertAppsLog,
    UpdateAppsLog,
    DeleteAppsLog,
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

  const [DataAppsLogs, setDataAppsLogs] = useState<AppsLogsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [ActionLoading, setActionLoading] = useState(false);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<AppsLogsResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.logCode,
        id: "logCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Box
              w={"full"}
              p={4}
              rounded={radiusStyle}
              bg={colorMode == "light" ? "gray.100" : "gray.800"}
            >
              <Flex as={HStack} alignItems={"center"} w={"full"}>
                <Flex as={HStack} alignItems={"start"} w={"full"}>
                  <Icon as={FiCheckCircle} color="green.500" mt={1} />
                  <Flex as={Stack} spacing={1}>
                    <Flex as={HStack} alignItems={"center"}>
                      <Heading as="h5" size="sm">
                        {info.row.original.logTitle}
                      </Heading>
                      <TextLabelProps
                        statusData={info.row.original.categoryChange}
                      />
                    </Flex>
                    <Text
                      fontSize="xs"
                      color={colorMode == "light" ? "gray.500" : "gray.400"}
                    >
                      Changed on:{" "}
                      {convertToCustomDateFormat(info.row.original.createdAt)}
                    </Text>
                  </Flex>
                </Flex>
                <Flex as={HStack} justifyContent={"end"} spacing={1}>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    colorScheme={"secondary"}
                    onClick={() => handleEditData(info.row.original.id)}
                    isLoading={ActionLoading}
                  >
                    <FiEdit3 />
                  </Button>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    colorScheme={"red"}
                    onClick={() => handleConfirmDeleteData(info.row.original)}
                    isLoading={ActionLoading}
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>
              </Flex>
              <Text
                fontSize="sm"
                color={colorMode == "light" ? "gray.600" : "gray.400"}
                pt={2}
              >
                {info.row.original.logDesc}
              </Text>
            </Box>
          </Stack>
        ),
        header: () => <span>Log Tittle</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember) {
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
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListLogsApps(PayloadList, tokenData);
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

          const itemsData: AppsLogsResponse[] =
            requestData.data as AppsLogsResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataAppsLogs(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, AppsId]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataAppsLogs([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: DataAppsLogs,
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

  const formik = useFormik<AppsLogsPayload>({
    initialValues: {
      id: null,
      appsId: AppsId,
      logTitle: "",
      categoryChange: "INFO",
      changeDate: generateTimestamp(),
      logCode: generateUniqueCode("LG"),
      logDesc: "",
    },
    validationSchema: FormSchemaLogsApps,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // console.log(values);
      if (AppsId == null) {
        showToast({
          description: "Apps ID is invalid",
          statusToast: "error",
        });
        setActionLoading(false);
        return;
      } else {
        setActionLoading(true);
        await delay(DELAY_ACTION);
        if (values.id != null && values.id.length > 0) {
          // Update Action
          await EditAppsLogServ({
            id: values.id,
            categoryChange: values.categoryChange,
            changeDate: values.changeDate,
            logCode: values.logCode,
            logDesc: values.logDesc,
            logTitle: values.logTitle,
          });
        } else {
          // Insert Action
          await AddAppsLogServ({
            appsId: AppsId,
            logTitle: values.logTitle,
            categoryChange: values.categoryChange,
            changeDate: values.changeDate,
            logCode: values.logCode,
            logDesc: values.logDesc,
          });
        }
      }
    },
  });

  //OptionChangeLogsCategory
  const [DataOptions1, setDataOptions1] = useState<OptionListProps[]>(
    OptionChangeLogsCategory
  );
  const [SelectedOption1, setSelectedOption1] =
    useState<OptionListProps | null>(null);
  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedOption1(data);
    formik.setFieldValue("categoryChange", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedOption1(null);
    formik.setFieldValue("categoryChange", "INACTIVE");
  };

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if ((DataAuth && DataAuth.teamMember, AppsId)) {
      formik.setFieldValue("id", null);
      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("logTitle", "");
      formik.setFieldValue("categoryChange", "INFO");
      formik.setFieldValue("changeDate", generateTimestamp());
      formik.setFieldValue("logCode", generateUniqueCode("LG"));
      formik.setFieldValue("logDesc", "");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleEditData = async (id: string) => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.teamMember) {
      const GetData: AppsLogsResponse | null = await GetDetailLogAppsServ(id);
      if (GetData == null) return;
      formik.setFieldValue("id", GetData.id);

      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("logTitle", GetData.logTitle);
      // formik.setFieldValue("categoryChange", GetData.categoryChange);
      formik.setFieldValue("changeDate", GetData.changeDate);
      formik.setFieldValue("logCode", GetData.logCode);
      formik.setFieldValue("logDesc", GetData.logDesc);

      const dataOption: OptionListProps | undefined = DataOptions1.find(
        (x) => x.value === GetData.categoryChange
      );
      if (dataOption != undefined) {
        handleSelectedOption(dataOption);
      }

      ModalForm.onOpen();
      setActionLoading(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [detailData, setdetailData] = useState<AppsLogsResponse | null>(null);

  const GetDetailLogAppsServ = async (
    id: string
  ): Promise<AppsLogsResponse | null> => {
    const requestData = await GetDetailLogAppsById(id, tokenData);
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

      const itemsData: AppsLogsResponse = requestData.data as AppsLogsResponse;

      return itemsData;
    }
  };

  const AddAppsLogServ = async (data: AppsLogsInsertPayload) => {
    const requestData = await InsertAppsLog(data, tokenData);
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
        description: "Adding data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      return;
    }
  };

  const EditAppsLogServ = async (data: AppsLogsUpdatePayload) => {
    const requestData = await UpdateAppsLog(data, tokenData);
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
        description: "Update data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      return;
    }
  };

  const DeleteAppsLogServ = async (data: AppsLogsResponse) => {
    const requestData = await DeleteAppsLog(data.id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);

      showToast({
        description: "Delete data successfully",
        statusToast: "success",
      });

      RefreshAction();
      setActionLoading(false);
      return;
    }
  };

  const handleConfirmDeleteData = (data: AppsLogsResponse) => {
    setCaptionDialog("Confirm Delete");
    setQuestionMsgDialog(`Are you sure want to delete "${data.logTitle}"?`);
    setOpenConfirmDeleteDialog(true);
    setdetailData(data);
  };

  const handleDeleteData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.teamMember && detailData) {
      await DeleteAppsLogServ(detailData);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setdetailData(null);
    }
  };

  const handleDialogDeleteTrigger = () => {
    setOpenConfirmDeleteDialog(!openConfirmDeleteDialog);
  };

  return (
    <Box as={Stack} w={"full"} spacing={6} minH={"40vh"}>
      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDeleteDialog}
        action={handleDeleteData}
        trigger={handleDialogDeleteTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
      <Modal
        size={"2xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={useColorModeValue("white", "gray.900")}
          >
            <ModalHeader>
              {formik.values.id != null && formik.values.id.length > 0
                ? "Edit Data"
                : "Add Data"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"} pt={4}>
                <FormControl
                  id="logTitle"
                  isInvalid={formik.errors.logTitle ? true : false}
                  isRequired
                >
                  <FormLabel>Log Tittle</FormLabel>
                  <Stack spacing={0}>
                    <Input
                      id="logTitle"
                      name="logTitle"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.logTitle ?? ""}
                      placeholder="Tittle"
                      minLength={3}
                      maxLength={80}
                    />
                    <FormErrorMessage>
                      {formik.errors.logTitle}
                    </FormErrorMessage>
                  </Stack>
                </FormControl>

                <FormControl
                  id={"categoryChange"}
                  isInvalid={formik.errors.categoryChange ? true : false}
                  isRequired
                >
                  <FormLabel h={"full"}>Label</FormLabel>
                  <Stack spacing={0}>
                    <Select
                      id={"categoryChange"}
                      options={DataOptions1}
                      isSearchable={true}
                      onChange={(e) => {
                        e
                          ? handleSelectedOption({
                              label: e.label,
                              value: e.value,
                            })
                          : handleUnselectedOption();
                      }}
                      value={SelectedOption1}
                    />
                    <FormErrorMessage>
                      {formik.errors.categoryChange}
                    </FormErrorMessage>
                  </Stack>
                </FormControl>

                <FormControl
                  id="logDesc"
                  isInvalid={formik.errors.logDesc ? true : false}
                  isRequired
                >
                  <FormLabel h={"full"}>Descriptions</FormLabel>
                  <Stack spacing={0}>
                    <Textarea
                      id="logDesc"
                      name="logDesc"
                      onChange={formik.handleChange}
                      defaultValue={formik.values.logDesc ?? ""}
                      placeholder={"Descriptions"}
                      minH={"20vh"}
                    />
                    <FormErrorMessage>{formik.errors.logDesc}</FormErrorMessage>
                  </Stack>
                </FormControl>

                <Box overflowY={"auto"}>
                  {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                </Box>
              </Flex>
            </ModalBody>

            <ModalFooter>
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
      <Flex w={"full"} p={2} as={HStack} justifyContent={"space-between"}>
        <Heading as="h5" size="md" w={"full"}>
          Data Change Log
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
            onClick={() => handleAddNew()}
            isLoading={ActionLoading}
          >
            Add
          </Button>
        </Flex>
      </Flex>
      <Flex as={Stack} w={"full"}>
        {IsLoadingProcess ? (
          <LoadingMiniSignature />
        ) : (
          <TableComponentFullHeadless table={table} />
        )}
      </Flex>
    </Box>
  );
};

export default AppChangeLogSection;
