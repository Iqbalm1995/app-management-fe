"use client";

import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  ENDPOINT_API_BASEURL_OBJECT,
  ENDPOINT_PORT_BASIC_OBJECT,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  buildUrlPort,
  ImagePreviewSM,
  renderFileIconSTR,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants from "@/app/services/useConstants";
import useDivision from "@/app/services/useDivisions";
import { MediaObjectResponse } from "@/app/services/useMediaObject";
import useRequirements, {
  BacklogUpdatePayload,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useUsers from "@/app/services/useUsers";

import {
  ListSearchByParam,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Wrap,
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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEye, FiRefreshCcw } from "react-icons/fi";
import * as Yup from "yup";

interface RequirementFilesProps {
  RefreshAction: () => void;
  RefreshData: number;
  ReqData: RequirementsResponse;
}

const RequirementFilesSection = ({
  ReqData,
  RefreshData,
  RefreshAction,
}: RequirementFilesProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { ListReqMedia } = useRequirements();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListDivisions } = useDivision();

  const UrlEndpoint: string = buildUrlPort(
    ENDPOINT_API_BASEURL_OBJECT,
    ENDPOINT_PORT_BASIC_OBJECT
  );

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

  const [DataFileReq, setDataFileReq] = useState<MediaObjectResponse[]>([]);
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
    setDataFileReq([]);
    setRefreshDataLocale(RefreshDataLocale + 1);
  };

  const columnsData = useMemo<ColumnDef<MediaObjectResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            {pageIndex * pageSize + info.row.index + 1}.
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectData,
        id: "objectData",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            {[".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].some(
              (ext) =>
                info.row.original.objectExtension
                  .trim()
                  .toLowerCase()
                  .endsWith(ext)
            ) ? (
              <ImagePreviewSM
                data={{
                  id: info.row.original.id,
                  alt: info.row.original.objectRawName,
                  name: info.row.original.objectRawName,
                  src: info.row.original.objectFullPath,
                  extension: info.row.original.objectExtension.trim(),
                  // size:info.row.original.objectSize
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                boxSize="50px"
              >
                {renderFileIconSTR(info.row.original.objectExtension.trim())}
              </Box>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}></Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectCode,
        id: "objectCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Text fontWeight={600}>{info.row.original.objectRawName}</Text>
            {/* <Link href={info.row.original.objectFullPath}> */}
            {/* <Text>{info.row.original.objectData}</Text> */}
            {/* </Link> */}
            <Text
              fontWeight={600}
              fontSize={"xx-small"}
              color={"secondary.700"}
            >
              {info.row.original.objectCode}
            </Text>
          </Stack>
        ),
        header: () => <span>Nama File</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectSize,
        id: "objectSize",
        cell: (info) => (
          <Text fontWeight={500}>{info.row.original.objectSize} KB</Text>
        ),
        header: () => <span>Ukuran</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectExtension,
        id: "objectExtension",
        cell: (info) => (
          <Text fontWeight={500}>
            {info.row.original.objectExtension.replace(".", "")}
          </Text>
        ),
        header: () => <span>Tipe</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} as={Wrap} justifyContent={"start"}>
            <Link
              href={`${UrlEndpoint}${info.row.original.objectData}`}
              target="_blank"
            >
              <Button
                size={"sm"}
                colorScheme={"blue"}
                leftIcon={<FiDownload />}
              >
                Unggah
              </Button>
            </Link>
            {info.row.original.objectExtension.replace(".", "").trim() ==
              "pdf" && (
              <Button
                size={"sm"}
                colorScheme={"blue"}
                onClick={() => {
                  handleOpenPreview(
                    `${UrlEndpoint}${info.row.original.objectData}`
                  );
                }}
                leftIcon={<FiEye />}
              >
                Pratinjau
              </Button>
            )}

            {/* <Button
                size={"sm"}
                colorScheme={"red"}
                onClick={() => handleConfirmDeleteData(info.row.original)}
                isLoading={ActionLoading}
              >
                <FiTrash2 />
              </Button> */}
          </Flex>
        ),
        header: () => (
          <Flex w={"full"} justifyContent={"center"}>
            Aksi
          </Flex>
        ),
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.team && tokenData && ReqData) {
      const filterWhereData: ListSearchByParam[] = [
        {
          field: "reqId",
          operator: "=",
          value: ReqData.id,
        },
      ];

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        reqId: ReqData.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListReqMedia(PayloadList, tokenData);
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

          const itemsData: MediaObjectResponse[] =
            requestData.data as MediaObjectResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataFileReq(itemsData);
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
    data: DataFileReq,
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

  // const formik = useFormik({
  //   initialValues: initialValuesBackLog,
  //   validationSchema: FormSchemeBacklog,
  //   validateOnChange: false,
  //   validateOnBlur: false,
  //   onSubmit: async (values) => {
  //     console.log(values);
  //   },
  // });

  const handleOpenFormBacklog = () => {
    ModalForm.onOpen();
  };

  // MODAL PREVIEW
  const ModalPreview = useDisclosure();
  const [UrlFilePDF, setUrlFilePDF] = useState<string>("");

  const handleOpenPreview = (urlData: string) => {
    setUrlFilePDF(urlData);
    ModalPreview.onOpen();
  };

  return (
    <Flex w={"full"} as={Stack} spacing={4}>
      <Heading as="h5" size="md" w={"full"}>
        Data Lampiran {ReqData.requirementType}
      </Heading>

      <Modal
        size={"6xl"}
        isOpen={ModalPreview.isOpen}
        isCentered
        onClose={ModalPreview.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`Pratinjau File`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"}>
              {/* <Text>{UrlFilePDF}</Text> */}
              <iframe
                src={`/api/proxy-pdf?url=${encodeURIComponent(UrlFilePDF)}`}
                width="100%"
                height="600px"
                style={{ border: "none" }}
              />
              {/* <ExcelViewer
                  fileUrl={`/api/proxy-pdf?url=${encodeURIComponent(UrlFilePDF)}`}
                /> */}
            </Flex>
          </ModalBody>
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

export default RequirementFilesSection;
