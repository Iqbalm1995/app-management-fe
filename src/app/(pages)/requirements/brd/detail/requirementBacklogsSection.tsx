"use client";

import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants from "@/app/services/useConstants";
import useDivision from "@/app/services/useDivisions";
import useRequirements, {
  BacklogDataResponse,
  BacklogUpdatePayload,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useUsers from "@/app/services/useUsers";

import { ListSearchByParam, PaggingListPayload } from "@/app/types/masterTypes";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Wrap,
  FormControl,
  Input,
  Textarea,
  useColorMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
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
import { useEffect, useMemo, useState } from "react";
import { FiPlusCircle, FiRefreshCcw } from "react-icons/fi";
import * as Yup from "yup";

interface RequirementBacklogsProps {
  RefreshAction: () => void;
  RefreshData: number;
  ReqData: RequirementsResponse;
}

const FormSchemeBacklog = Yup.object().shape({
  backlogName: Yup.string().required(),
});

const initialValuesBackLog = {
  id: null,
  reqId: "",
  backlogName: "",
  backlogDesc: "",
  envSide: null,
  maintenanceCategory: null,
  maintenanceType: null,
  rppb: "N",
  licensing: "N",
  backogRegistered: null,
  backlogStartdate: null,
  backlogEnddate: null,
  urgency: "LOW",
  impact: "LOW",
  priority: "LOW",
  developmentStatus: null,
  reffId: null,
};

const RequirementBacklogsSection = ({
  ReqData,
  RefreshData,
  RefreshAction,
}: RequirementBacklogsProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { ListBacklog, GetDetailBacklogById } = useRequirements();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListDivisions } = useDivision();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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
  // End SetUp auth data on current page

  const [DataReqbacklog, setDataReqbacklog] = useState<BacklogDataResponse[]>(
    []
  );
  const [RefreshDataLocale, setRefreshDataLocale] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const RefreshActionLocale = () => {
    setTotalPageData(0);
    setDataReqbacklog([]);
    setRefreshDataLocale(RefreshDataLocale + 1);
  };

  const columnsData = useMemo<ColumnDef<BacklogDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"}>{info.row.index + 1}.</Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogCode,
        id: "backlogCode",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>{info.row.original.backlogName}</Text>
              <Text fontSize={"small"}>
                No. {info.row.original.backlogCode}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Fitur</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogDesc,
        id: "backlogDesc",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={0}>
              <Text>{info.row.original.backlogDesc}</Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Deskripsi</span>,
        footer: (props) => props.column.id,
      },
      // {
      //   accessorFn: (row) => row.id,
      //   id: "backlogId",
      //   cell: (info) => (
      //     <Flex as={HStack} justifyContent={"end"}>
      //       <Button
      //         colorScheme="teal"
      //         size="xs"
      //         variant="ghost"
      //         // onClick={() => logBacklog(info.row.index)}
      //       >
      //         Edit
      //       </Button>
      //       <Button
      //         colorScheme="teal"
      //         size="xs"
      //         variant="ghost"
      //         // onClick={() => removeBacklog(info.row.index)}
      //       >
      //         Remove
      //       </Button>
      //     </Flex>
      //   ),
      //   header: () => <Flex justifyContent={"end"}>Action</Flex>,
      //   footer: (props) => props.column.id,
      // },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember && tokenData && ReqData) {
      const filterWhereData: ListSearchByParam[] = [
        {
          field: "reqId",
          operator: "=",
          value: ReqData.id,
        },
      ];

      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhereData,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListBacklog(PayloadList, tokenData);
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

          const itemsData: BacklogDataResponse[] =
            requestData.data as BacklogDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataReqbacklog(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [
    DataAuth,
    RefreshData,
    RefreshDataLocale,
    pageIndex,
    pageSize,
    globalFilter,
  ]);

  const table = useReactTable({
    data: DataReqbacklog,
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

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] =
    useState<BacklogUpdatePayload | null>(null);

  // FILTER SHOW HIDE
  const [BoxFilter, setBoxFilter] = useState(false);

  // FORM
  const ModalForm = useDisclosure();
  const [FormMode, setFormMode] = useState<"Add" | "Edit">("Add");

  const formik = useFormik({
    initialValues: initialValuesBackLog,
    validationSchema: FormSchemeBacklog,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  const handleOpenFormBacklog = () => {
    ModalForm.onOpen();
  };

  return (
    <Flex w={"full"} as={Stack} spacing={4}>
      <Heading as="h5" size="md" w={"full"}>
        Data Fitur {ReqData.requirementType}
      </Heading>

      <Modal
        size={"xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`${FormMode} Backlog Feature`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"}>
              <FormControl>
                <Input
                  id="backlogFeatureName"
                  name="backlogFeatureName"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.backlogName}
                  placeholder={`Backlog Feature Name`}
                  minLength={3}
                  maxLength={200}
                  isDisabled={ActionLoading}
                />
              </FormControl>
              <FormControl>
                <Textarea
                  id="backlogFeatureDesc"
                  name="backlogFeatureDesc"
                  onChange={formik.handleChange}
                  value={formik.values.backlogDesc}
                  placeholder={`backlog Descriptions`}
                  maxLength={300}
                  isDisabled={ActionLoading}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              w={"full"}
              leftIcon={<FiPlusCircle />}
              colorScheme={"secondary"}
              type={"submit"}
              // onClick={() => handleSaveBacklog()}
            >
              {FormMode} Features
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }} w={"full"}>
          {/* BUTTON ACTION */}
          <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
            <Button
              size={"sm"}
              leftIcon={<FiRefreshCcw />}
              isLoading={ActionLoading}
              onClick={() => RefreshActionLocale()}
            >
              Muat Ulang
            </Button>
            {/* <Button
              size={"sm"}
              colorScheme={"secondary"}
              leftIcon={<FiPlusSquare />}
              isLoading={ActionLoading}
              onClick={() => handleOpenFormBacklog()}
            >
              Add New
            </Button> */}
          </Flex>
        </GridItem>
      </Grid>
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <TableComponentFull table={table} />
      )}
    </Flex>
  );
};

export default RequirementBacklogsSection;
