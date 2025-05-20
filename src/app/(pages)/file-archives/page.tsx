"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  DELAY_LONG,
  DELAY_LOW,
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMediaObject, {
  InsertMediaObjectPayload,
  MediaObjectResponse,
} from "@/app/services/useMediaObject";
import {
  AttachmentProps,
  FileDetails,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  Grid,
  GridItem,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
  Wrap,
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
import { useDropzone } from "react-dropzone";
import {
  FiPlusSquare,
  FiRefreshCcw,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { AiFillFileExcel, AiFillFilePdf, AiFillFileWord } from "react-icons/ai";
import { FaFileAlt } from "react-icons/fa";
import { ImagePreviewSM, truncateText } from "@/app/helper/MasterHelper";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import { Search2Icon } from "@chakra-ui/icons";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";

const HeaderDataContent: HeaderContentProps = {
  titleName: "File Archives Team",
  breadCrumb: ["Home", "File Archives"],
};

function HomePage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const {
    List,
    GetDetailById,
    GetDetailByCode,
    InsertMediaObject,
    DeleteMediaObject,
    isLoading,
    error,
  } = useMediaObject();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

  const [MediaObjectData, setMediaObjectData] = useState<MediaObjectResponse[]>(
    []
  );
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
                info.row.original.objectExtension.toLowerCase().endsWith(ext)
            ) ? (
              <ImagePreviewSM
                data={{
                  id: info.row.original.id,
                  alt: info.row.original.objectRawName,
                  name: info.row.original.objectRawName,
                  src: info.row.original.objectFullPath,
                  extension: info.row.original.objectExtension,
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
                {renderFileIconSTR(info.row.original.objectExtension)}
              </Box>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>File</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectCode,
        id: "objectCode",
        cell: (info) => (
          <Stack spacing={0}>
            {/* <Text>{info.row.original.objectName}</Text> */}
            <Link href={info.row.original.objectFullPath}>
              <Text>{info.row.original.objectRawName}</Text>
            </Link>

            <Text
              fontWeight={600}
              fontSize={"xx-small"}
              color={"secondary.700"}
            >
              {info.row.original.objectCode}
            </Text>
          </Stack>
        ),
        header: () => <span>NAME</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectSize,
        id: "objectSize",
        cell: (info) => (
          <Text fontWeight={500}>{info.row.original.objectSize} KB</Text>
        ),
        header: () => <span>SIZE</span>,
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
        header: () => <span>Extension</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} as={Wrap} justifyContent={"center"}>
            <Button
              size={"sm"}
              colorScheme={"red"}
              onClick={() => handleConfirmDeleteData(info.row.original)}
              isLoading={ActionLoading}
            >
              <FiTrash2 />
            </Button>
          </Flex>
        ),
        header: () => (
          <Flex w={"full"} justifyContent={"center"}>
            Actions
          </Flex>
        ),
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "teamId",
            operator: "=",
            value: DataAuth.teamMember.id,
          },
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await List(PayloadList, tokenData);
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
          setMediaObjectData(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setProgressUpload(0);
    setMediaObjectData([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: MediaObjectData,
    columns: columnsData,
    pageCount: totalPages ?? 0,
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

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if (DataAuth && DataAuth.teamMember) {
      setProgressUpload(0);
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [detailData, setdetailData] = useState<MediaObjectResponse | null>(
    null
  );

  // Upload Config
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileDetails[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [], // Accept all images
      "application/pdf": [], // Accept PDFs
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // XLSX
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // DOCX
    },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  useEffect(() => {
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return () =>
        newPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    }
  }, [files]);

  const [ProgressUpload, setProgressUpload] = useState(0);
  const handleUpload = async () => {
    if (DataAuth && DataAuth.teamMember) {
      setActionLoading(true);
      // const fileDetails = files.map((file) => {
      //   const [name, extension] = file.name.split(".");
      //   return { name, extension, size: file.size, file };
      // });
      // setUploadedFiles(fileDetails);
      // const formData = new FormData();
      // uploadedFiles.forEach((uploadedFile) =>
      //   formData.append("files", uploadedFile.file)
      // );
      // console.log("Form Data Payload:", formData);
      // console.log("Uploaded Files:", fileDetails);

      console.log(files);
      const totalFiles: number = files.length;
      const progressTotal: number = 100;
      const numberPerProgress: number = progressTotal / totalFiles;
      console.log("totalFiles : ", totalFiles);
      console.log("progressTotal : ", progressTotal);
      console.log("numberPerProgress : ", numberPerProgress);

      if (totalFiles > 0) {
        // Reset the progress before starting
        setProgressUpload(0);

        for (const [index, dt] of files.entries()) {
          await delay(DELAY_MEDIUM); // Simulate upload delay
          await ActionUploadServ({
            TeamId: DataAuth.teamMember.id,
            file: dt,
          });
          // Update the progress state with the callback function
          setProgressUpload((prevProgress) => prevProgress + numberPerProgress);

          console.log(`Uploading file ${index + 1}:`, dt);
        }
      }
      await delay(DELAY_MEDIUM);
      showToast({
        description: `${files.length} Files is uploaded`,
        statusToast: "success",
      });
      handleResetListUpload();
      ModalForm.onClose();
      RefreshAction();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
      handleResetListUpload();
      ModalForm.onClose();
    }
  };

  const ActionUploadServ = async (data: InsertMediaObjectPayload) => {
    const requestData = await InsertMediaObject(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }
  };

  const ActionDeleteMediaServ = async (data: MediaObjectResponse) => {
    const requestData = await DeleteMediaObject(data.id, tokenData);
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

  const renderFileIcon = (file: File) => {
    const ext = file.name.split(".").pop();
    switch (ext) {
      case "pdf":
        return <Icon as={AiFillFilePdf} w={12} h={12} color="red.500" />;
      case "xlsx":
        return <Icon as={AiFillFileExcel} w={12} h={12} color="green.500" />;
      case "docx":
        return <Icon as={AiFillFileWord} w={12} h={12} color="blue.500" />;
      default:
        return <Icon as={FaFileAlt} w={12} h={12} color="gray.500" />;
    }
  };

  const renderFileIconSTR = (extFile: string) => {
    const ext = extFile.replace(".", "");
    switch (ext) {
      case "pdf":
        return <Icon as={AiFillFilePdf} w={8} h={8} color="red.500" />;
      case "xlsx":
        return <Icon as={AiFillFileExcel} w={8} h={8} color="green.500" />;
      case "docx":
        return <Icon as={AiFillFileWord} w={8} h={8} color="blue.500" />;
      default:
        return <Icon as={FaFileAlt} w={8} h={8} color="gray.500" />;
    }
  };

  const handleResetListUpload = () => {
    setFiles([]);
    setProgressUpload(0);
    setActionLoading(false);
  };

  const handleConfirmDeleteData = (data: MediaObjectResponse) => {
    setCaptionDialog("Confirm Delete");
    setQuestionMsgDialog(
      `Are you sure want to delete "${data.objectRawName}"?`
    );
    setOpenConfirmDeleteDialog(true);
    setdetailData(data);
  };

  const handleDeleteData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.teamMember && detailData) {
      await ActionDeleteMediaServ(detailData);
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
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"} pb={2}>
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
      {/* <Card rounded={radiusStyle}>
        <CardBody>
          <Flex as={Stack} w={"full"} spacing={2} pb={5}></Flex>
        </CardBody>
      </Card> */}
      <Flex
        w={"full"}
        rounded={radiusStyle}
        bg={colorMode == "light" ? "white" : "gray.800"}
        boxShadow={"md"}
        minH={"60vh"}
      >
        <VStack w={"full"} p={0} align={"start"} spacing={2}>
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={4}
            px={5}
            pt={5}
            w={"full"}
          >
            <GridItem
              colSpan={{ base: 2, md: 2 }}
              textAlign={{ base: "center", md: "start" }}
              alignContent={"center"}
            ></GridItem>
            <GridItem
              colSpan={{ base: 2, md: 1 }}
              textAlign={{ base: "center", md: "end" }}
              w={"full"}
            >
              <Flex w={"full"} justifyContent={"left"}>
                <InputGroup w={{ base: "full", md: "65%" }}>
                  <InputLeftElement
                    pointerEvents="none"
                    boxSize={12}
                    h={"full"}
                  >
                    <Search2Icon color={"secondary.500"} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeContent={"center"}
                    placeholder="Cari data..."
                    size={"md"}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    value={globalFilter}
                  />
                </InputGroup>
              </Flex>
            </GridItem>
          </Grid>
          {IsLoadingProcess ? (
            <LoadingMiniSignature />
          ) : (
            <TableComponentFull table={table} />
          )}
        </VStack>
      </Flex>
      <Modal
        size={"2xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          <ModalHeader>{"Upload Data"}</ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} pt={4}>
              {/* Upload area */}
              <Flex
                display={ActionLoading ? "none" : "flex"}
                {...getRootProps()}
                p={6}
                border={"3px dashed"}
                rounded={radiusStyle}
                cursor={"pointer"}
                bg={colorMode == "light" ? "gray.50" : "gray.900"}
                textAlign={"center"}
                color={"primary.300"}
                _hover={{
                  bg: colorMode == "light" ? "primary.50" : "primary.900",
                  color: "primary.400",
                }}
                w={"full"}
                minH={"200px"} // Set a minimum height for better UX
                justifyContent={"center"} // Center the content horizontally
                alignItems={"center"} // Center the content vertically
              >
                <input {...getInputProps()} disabled={ActionLoading} />
                <Text fontSize="xl" fontWeight={"semibold"} color="gray.600">
                  Drag & drop files here, or click to select files
                </Text>
              </Flex>
              <Grid templateColumns="repeat(3, 1fr)" gap={2} w={"full"} p={3}>
                {files.map((file, index) => (
                  <GridItem
                    colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                    key={index}
                    w={"full"}
                  >
                    <Tooltip
                      hasArrow
                      label={file.name}
                      bg={"primary.300"}
                      color={"primary.900"}
                      placement={"auto-start"}
                      rounded={radiusStyle}
                    >
                      <Flex
                        as={HStack}
                        border={"1px solid"}
                        borderColor={
                          colorMode == "light" ? "gray.300" : "gray.700"
                        }
                        p={2}
                        rounded={radiusStyle}
                        alignItems={"center"}
                        justifyContent={"start"}
                        w={"full"}
                        boxShadow={"md"}
                        bgColor={colorMode == "light" ? "white" : "gray.800"}
                      >
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={previews[index]}
                            alt={file.name}
                            boxSize="50px"
                            objectFit="contain"
                            rounded={radiusStyle}
                            onLoad={() =>
                              URL.revokeObjectURL(URL.createObjectURL(file))
                            }
                          />
                        ) : (
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            boxSize="50px"
                          >
                            {renderFileIcon(file)}
                          </Box>
                        )}
                        <Text fontSize="sm" mt={2} textAlign="center">
                          {truncateText(file.name, 20)}
                        </Text>
                      </Flex>
                    </Tooltip>
                  </GridItem>
                ))}
              </Grid>
              {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
              {/* <Text>{ProgressUpload}</Text> */}
              {ProgressUpload > 0 && (
                <Progress
                  hasStripe
                  value={ProgressUpload}
                  rounded={radiusStyle}
                />
              )}
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex w={"full"} justifyContent={"end"} as={HStack}>
              <Button
                colorScheme={"gray"}
                leftIcon={<FiX />}
                onClick={ModalForm.onClose}
                isDisabled={ActionLoading}
              >
                Close
              </Button>
              <Button
                leftIcon={<FiRotateCcw />}
                colorScheme={"gray"}
                onClick={handleResetListUpload}
                isDisabled={ActionLoading}
              >
                Reset
              </Button>
              <Button
                leftIcon={<FiSave />}
                onClick={handleUpload}
                colorScheme={"secondary"}
                isLoading={ActionLoading}
              >
                Upload Files
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDeleteDialog}
        action={handleDeleteData}
        trigger={handleDialogDeleteTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
    </LayoutAdmin>
  );
}

export default HomePage;
