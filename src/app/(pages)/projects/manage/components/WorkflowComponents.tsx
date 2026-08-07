"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  DELAY_MEDIUM,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ENDPOINT_API_BASEURL_OBJECT,
  ENDPOINT_PORT_BASIC_OBJECT,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  convertToCustomDateFormat,
  buildUrlPort,
  renderFileIconSTR,
  formatKBMB,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { downloadWatermarkedPdf } from "@/app/helper/PdfWatermarkHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMediaObject from "@/app/services/useMediaObject";
import useProjects, {
  ProjectWorkflowResponse,
  ProjectWorkflowValueInsertPayload,
  ProjectWorkflowValueResponse,
} from "@/app/services/useProjects";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Text,
  Button,
  Collapse,
  useDisclosure,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Stack,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Link,
  RadioGroup,
  Radio,
  IconButton,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiLink,
  FiInfo,
  FiFile,
  FiTrash2,
  FiExternalLink,
  FiMoreVertical,
} from "react-icons/fi";
import * as yup from "yup";
import { useDropzone } from "react-dropzone";

// Workflow Level 2 Component
interface WorkflowLevel2Props {
  workflow: ProjectWorkflowResponse;
  onRefresh?: () => void;
}

const initValuePayloadWFV: ProjectWorkflowValueInsertPayload = {
  DocumentName: "",
  DocumentDate: "",
  DocumentNumber: "",
  DocumentType: "",
  DocumentVersion: "",
  ProjectWorkflowId: "",
  LinkAttachment: null,
  ReffParentId: null,
  file: null, // is type FILE
};

const FormSchemaWFV = yup.object().shape({
  DocumentName: yup.string().required("Document Name is required"),
  DocumentDate: yup
    .date()
    .typeError("Document Date must be a valid date")
    .required("Document Date is required"),
  DocumentNumber: yup.string().required("Document Number is required"),
  DocumentType: yup.string().required("Document Type is required"),
  DocumentVersion: yup.string().required("Document Version is required"),
  ProjectWorkflowId: yup.string().required("Project Workflow ID is required"),
  ReffParentId: yup.string().nullable(),
  file: yup.mixed<File>().nullable(),
  LinkAttachment: yup.string().nullable(),
});

export const WorkflowLevel2Box = ({
  workflow,
  onRefresh,
}: WorkflowLevel2Props) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Build URL for file downloads
  const UrlEndpoint: string = buildUrlPort(
    ENDPOINT_API_BASEURL_OBJECT,
    ENDPOINT_PORT_BASIC_OBJECT
  );

  const { SecureDownloadFiles, error: secureDownloadError } = useMediaObject();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSecureDownload = async (mediaObjectId: string, fileName: string) => {
    if (!tokenData) return;
    setIsDownloading(true);
    try {
      const blob = await SecureDownloadFiles(
        [mediaObjectId],
        tokenData,
        workflow.projectId,
        "Project_Workflow",
        `${fileName || "document"}.zip`
      );
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName || "document"}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({ description: "File berhasil diunduh. Password dikirim ke email Anda.", statusToast: "success" });
      } else {
        showToast({ description: secureDownloadError || "Gagal mengunduh file", statusToast: "error" });
      }
    } catch {
      showToast({ description: "Terjadi kesalahan saat mengunduh file", statusToast: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const { InsertProjectWorkflowValue, ListProjectWorkflowValue } =
    useProjects();

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

  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [attachmentMethod, setAttachmentMethod] = useState<"file" | "link">("file");
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [files, setFiles] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/vnd.rar": [".rar"],
    },
    maxSize: 120 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFiles(file);
        formik.setFieldValue("file", file);
        setFilePreview({
          name: file.name,
          size: file.size,
        });
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        showToast({
          description: "File size exceeds 120MB",
          statusToast: "error",
        });
      } else if (rejection.errors[0].code === "file-invalid-type") {
        showToast({
          description: "File type not supported",
          statusToast: "error",
        });
      }
    },
  });

  const RefreshAction = () => {
    setListProjectWFValue([]);
    setRefreshData(RefreshData + 1);
  };

  const InsertAttchmentWFVServ = async (
    data: ProjectWorkflowValueInsertPayload
  ) => {
    // Validate based on attachment method
    if (attachmentMethod === "file" && !files) {
      showToast({
        description: "Please upload a file",
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    if (attachmentMethod === "link" && !data.LinkAttachment) {
      showToast({
        description: "Please provide a link",
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    // Convert datetime-local to ISO format for backend
    const isoDate = data.DocumentDate ? new Date(data.DocumentDate).toISOString() : new Date().toISOString();
    const dataWithIsoDate = { ...data, DocumentDate: isoDate };

    const requestData = await InsertProjectWorkflowValue(dataWithIsoDate, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || "Failed to save document",
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    showToast({
      description: "Document uploaded and saved successfully",
      statusToast: "success",
    });

    setActionLoading(false);
    ModalForm.onClose();

    if (onRefresh) {
      onRefresh();
    }

    RefreshAction();
  };

  const [IsLoadingWFV, setIsLoadingWFV] = useState(false);
  const [ListProjectWFValue, setListProjectWFValue] = useState<
    ProjectWorkflowValueResponse[]
  >([]);

  const GetDataProjectWorkflowValue = async (
    searchValue: string = "",
    projectWorkflowId: string,
    limit: number = 1
  ): Promise<ProjectWorkflowValueResponse[]> => {
    setIsLoadingWFV(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [
        {
          field: "projectWorkflowId",
          operator: "=",
          value: projectWorkflowId,
        },
      ],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListProjectWorkflowValue(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingWFV(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingWFV(false);
        return [];
      }

      const itemsData: ProjectWorkflowValueResponse[] =
        requestData.data as ProjectWorkflowValueResponse[];

      setListProjectWFValue(itemsData);
      setIsLoadingWFV(false);

      return itemsData;
    }
  };

  const formik = useFormik<ProjectWorkflowValueInsertPayload>({
    initialValues: initValuePayloadWFV,
    validationSchema: FormSchemaWFV,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // if (files.length <= 0) {
      //   showToast({
      //     description: "File upload attachments, cannot be empty.",
      //     statusToast: "warning",
      //   });
      //   return;
      // }
      await handleConfirmSaveData(values);
      console.log(values);
    },
  });

  const [openConfirmSaveDialog, setOpenConfirmSaveDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [SaveAsDraft, setSaveAsDraft] = useState<boolean>(false);

  const handleConfirmSaveData = (data: ProjectWorkflowValueInsertPayload) => {
    setCaptionDialog("Konfirmasi Simpan");
    setQuestionMsgDialog(`Apakah ada yakin akan submit data?`);
    setOpenConfirmSaveDialog(true);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth) {
      await InsertAttchmentWFVServ(formik.values);
      console.log(formik.values);

      // // Call refresh after successful save
      // if (onRefresh) {
      //   onRefresh();
      // }

      // Close modal and reset form
      // ModalForm.onClose();
      // formik.resetForm();
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
    setActionLoading(false);
  };

  const handleDialogSaveTrigger = () => {
    setOpenConfirmSaveDialog(!openConfirmSaveDialog);
  };

  // modal form
  const ModalForm = useDisclosure();

  const handleOpenForm = (wfData: ProjectWorkflowResponse) => {
    formik.resetForm();
    ModalForm.onOpen();
    formik.setFieldValue("DocumentType", wfData.wfgName);
    formik.setFieldValue("ProjectWorkflowId", wfData.id);
    
    // Set current datetime
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    formik.setFieldValue("DocumentDate", localDateTime);
  };

  // detail wf
  const ModalDetailWF = useDisclosure();

  const handleOpenDetail = async (wfData: ProjectWorkflowResponse) => {
    await GetDataProjectWorkflowValue("", wfData.id, MAX_SIZE_TABLE);
    ModalDetailWF.onOpen();
  };

  return (
    <Box
      // border="1px solid"
      // borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
      rounded={radiusStyle}
      overflow="hidden"
    >
      {/* Confirmation */}
      <ConfirmationDialog
        key={"confirmSaveData"}
        isOpenTrigger={openConfirmSaveDialog}
        action={handleSaveData}
        trigger={handleDialogSaveTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      {/* MODAL FORM */}
      <Modal
        size={"xl"}
        isOpen={ModalForm.isOpen}
        // isCentered
        onClose={ModalForm.onClose}
        closeOnOverlayClick={false}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
          maxH="90vh"
        >
          <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
            <ModalHeader>{`Upload New Document`}</ModalHeader>
            <ModalCloseButton color={"red.500"} />
            <ModalBody w={"full"} maxH="70vh" overflowY="auto" p={6}>
              <Flex as={Stack} w={"full"}>
                <VStack spacing={4} align="stretch" w="full">
                  {/* Document Name */}
                  <FormControl
                    isInvalid={!!formik.errors.DocumentName}
                    isRequired
                  >
                    <FormLabel>Nama Dokumen</FormLabel>
                    <Input
                      id="DocumentName"
                      name="DocumentName"
                      placeholder="Masukkan nama dokumen"
                      value={formik.values.DocumentName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isDisabled={ActionLoading}
                    />
                    <FormErrorMessage>
                      {formik.errors.DocumentName}
                    </FormErrorMessage>
                  </FormControl>

                  {/* Document Number and Date */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl
                        isInvalid={!!formik.errors.DocumentNumber}
                        isRequired
                      >
                        <FormLabel>Nomor Dokumen</FormLabel>
                        <Input
                          id="DocumentNumber"
                          name="DocumentNumber"
                          placeholder="Masukkan nomor dokumen"
                          value={formik.values.DocumentNumber}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.DocumentNumber}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl
                        isInvalid={!!formik.errors.DocumentDate}
                        isRequired
                      >
                        <FormLabel>Tanggal Dokumen</FormLabel>
                        <Input
                          id="DocumentDate"
                          name="DocumentDate"
                          type={"datetime-local"}
                          value={formik.values.DocumentDate}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.DocumentDate}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Document Type and Version */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl
                        isInvalid={!!formik.errors.DocumentType}
                        isRequired
                      >
                        <FormLabel>Jenis Dokumen</FormLabel>
                        <Input
                          id="DocumentType"
                          name="DocumentType"
                          placeholder="Jenis dokumen"
                          value={formik.values.DocumentType}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isReadOnly
                          bg={colorMode === "light" ? "gray.100" : "gray.700"}
                        />
                        <FormErrorMessage>
                          {formik.errors.DocumentType}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl
                        isInvalid={!!formik.errors.DocumentVersion}
                        isRequired
                      >
                        <FormLabel>Versi Dokumen</FormLabel>
                        <Input
                          id="DocumentVersion"
                          name="DocumentVersion"
                          placeholder="v1.0"
                          value={formik.values.DocumentVersion}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isDisabled={ActionLoading}
                        />
                        <FormErrorMessage>
                          {formik.errors.DocumentVersion}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Method Selection */}
                  <FormControl isRequired>
                    <FormLabel>Metode Lampiran</FormLabel>
                    <RadioGroup
                      value={attachmentMethod}
                      onChange={(value: "file" | "link") => {
                        setAttachmentMethod(value);
                        if (value === "file") {
                          formik.setFieldValue("LinkAttachment", null);
                        } else {
                          setFiles(null);
                          setFilePreview(null);
                          formik.setFieldValue("file", null);
                        }
                      }}
                    >
                      <Stack direction="row" spacing={6}>
                        <Radio value="file" colorScheme="blue">
                          <HStack spacing={2}>
                            <Icon as={FiUpload} />
                            <Text>Upload File</Text>
                          </HStack>
                        </Radio>
                        <Radio value="link" colorScheme="blue">
                          <HStack spacing={2}>
                            <Icon as={FiLink} />
                            <Text>Link Eksternal</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {/* Conditional Input based on selection */}
                  {attachmentMethod === "file" ? (
                    <FormControl isRequired>
                      <FormLabel>Upload File</FormLabel>

                      {/* Dropzone Area */}
                      <Flex
                        {...getRootProps()}
                        p={8}
                        border="3px dashed"
                        borderColor={isDragActive ? "blue.400" : "gray.300"}
                        rounded={radiusStyle}
                        cursor="pointer"
                        bg={isDragActive ? "blue.50" : "gray.50"}
                        textAlign="center"
                        color={isDragActive ? "blue.600" : "gray.600"}
                        _hover={{
                          bg: "blue.50",
                          borderColor: "blue.400",
                          color: "blue.600",
                        }}
                        w="full"
                        minH="200px"
                        justifyContent="center"
                        alignItems="center"
                        transition="all 0.2s"
                      >
                        <input {...getInputProps()} />
                        <VStack spacing={3}>
                          <Icon as={FiUpload} boxSize={12} />
                          <Text fontSize="lg" fontWeight="semibold">
                            {isDragActive
                              ? "Lepaskan file di sini..."
                              : "Seret & letakkan file di sini, atau klik untuk memilih file"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP,
                            RAR, CSV (Max 120MB)
                          </Text>
                        </VStack>
                      </Flex>

                      {/* File Preview */}
                      {filePreview && (
                        <Box
                          mt={4}
                          p={4}
                          border="1px"
                          borderColor="green.200"
                          rounded={radiusStyle}
                          bg="green.50"
                        >
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Icon as={FiFile} boxSize={6} color="green.600" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {filePreview.name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {(filePreview.size / 1024).toFixed(2)} KB
                                </Text>
                              </VStack>
                            </HStack>
                            <IconButton
                              aria-label="Remove file"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => {
                                setFiles(null);
                                setFilePreview(null);
                                formik.setFieldValue("file", null);
                              }}
                            />
                          </HStack>
                        </Box>
                      )}
                    </FormControl>
                  ) : (
                    <FormControl isRequired>
                      <FormLabel>Link Attachment</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLink} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          id="LinkAttachment"
                          name="LinkAttachment"
                          placeholder="https://bjbdrive/drive/example"
                          value={formik.values.LinkAttachment || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isDisabled={ActionLoading}
                        />
                      </InputGroup>
                      <FormHelperText>
                        <HStack spacing={2}>
                          <Icon as={FiInfo} color="blue.500" />
                          <Text fontSize="xs">
                            Masukkan URL lengkap dokumen (Google Drive,
                            OneDrive, SharePoint, dll)
                          </Text>
                        </HStack>
                      </FormHelperText>
                    </FormControl>
                  )}

                  {/* Action Buttons */}
                  <HStack spacing={3} justify="flex-end" pt={4}>
                    <Button
                      variant="outline"
                      onClick={ModalForm.onClose}
                      isDisabled={ActionLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={ActionLoading}
                      loadingText="Menyimpan..."
                    >
                      Simpan Dokumen
                    </Button>
                  </HStack>
                </VStack>

                <Box
                  w={"full"}
                  overflowX={"auto"}
                  p={4}
                  mt={2}
                  bgColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  rounded={radiusStyle}
                  display={"none"}
                >
                  <Text fontWeight={600}>Debug Formik</Text>
                  <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                </Box>
              </Flex>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal
        size={"xl"}
        isOpen={ModalDetailWF.isOpen}
        // isCentered
        onClose={ModalDetailWF.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
          maxH="90vh"
        >
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"} maxH="70vh" overflowY="auto" p={6}>
            <Flex as={Stack} w={"full"}>
              {ListProjectWFValue && ListProjectWFValue.length > 0 ? (
                <VStack spacing={6} align="stretch" w="full">
                  {/* Header */}
                  <Box
                    p={4}
                    bg={colorMode === "light" ? "blue.500" : "blue.600"}
                    rounded={radiusStyle}
                    color="white"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={FiFile} boxSize={6} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xl" fontWeight="bold">
                            Document History
                          </Text>
                          <Text fontSize="sm" opacity={0.9}>
                            {ListProjectWFValue.length} document
                            {ListProjectWFValue.length > 1 ? "s" : ""} uploaded
                          </Text>
                        </VStack>
                      </HStack>
                    </HStack>
                  </Box>

                  {/* Timeline Cards */}
                  <VStack
                    spacing={4}
                    align="stretch"
                    position="relative"
                    pl={8}
                  >
                    {/* Timeline Line */}
                    <Box
                      position="absolute"
                      left="15px"
                      top="20px"
                      bottom="20px"
                      width="2px"
                      bg={colorMode === "light" ? "gray.300" : "gray.600"}
                    />

                    {ListProjectWFValue.map((item, index) => (
                      <Box key={item.id} position="relative">
                        {/* Timeline Dot */}
                        <Box
                          position="absolute"
                          left="-23px"
                          top="20px"
                          width="16px"
                          height="16px"
                          rounded="full"
                          bg={
                            item.mediaObjectData
                              ? "green.500"
                              : item.linkAttachment
                                ? "blue.500"
                                : "gray.400"
                          }
                          border="3px solid"
                          borderColor={
                            colorMode === "light" ? "white" : "gray.900"
                          }
                          zIndex={1}
                        />

                        {/* Card */}
                        <Box
                          p={5}
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          rounded={radiusStyle}
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          boxShadow="md"
                          _hover={{
                            boxShadow: "lg",
                            transform: "translateY(-2px)",
                          }}
                          transition="all 0.2s"
                        >
                          {/* Card Header */}
                          <HStack justify="space-between" mb={3}>
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontSize="lg" fontWeight="bold">
                                {item.documentName}
                              </Text>
                              <HStack spacing={2} flexWrap="wrap">
                                <Badge colorScheme="purple" fontSize="xs">
                                  {item.documentType}
                                </Badge>
                                <Badge colorScheme="gray" fontSize="xs">
                                  {item.documentNumber}
                                </Badge>
                              </HStack>
                            </VStack>
                            <Badge
                              colorScheme="green"
                              fontSize="sm"
                              px={3}
                              py={1}
                            >
                              v{item.documentVersion}
                            </Badge>
                          </HStack>

                          {/* Card Body */}
                          <VStack spacing={3} align="stretch">
                            {/* Document Info Grid */}
                            <Grid
                              templateColumns="repeat(2, 1fr)"
                              gap={3}
                              fontSize="sm"
                            >
                              <GridItem>
                                <Text color="gray.500" fontSize="xs">
                                  Document Date
                                </Text>
                                <Text fontWeight="medium">
                                  {new Date(
                                    item.documentDate,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </Text>
                              </GridItem>
                              <GridItem>
                                <Text color="gray.500" fontSize="xs">
                                  Uploaded By
                                </Text>
                                <Text fontWeight="medium">
                                  {item.createdBy}
                                </Text>
                              </GridItem>
                              <GridItem>
                                <Text color="gray.500" fontSize="xs">
                                  Created At
                                </Text>
                                <Text fontWeight="medium">
                                  {new Date(item.createdAt).toLocaleDateString(
                                    "id-ID",
                                  )}{" "}
                                  {new Date(item.createdAt).toLocaleTimeString(
                                    "id-ID",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </Text>
                              </GridItem>
                              <GridItem>
                                <Text color="gray.500" fontSize="xs">
                                  Document Type
                                </Text>
                                <Text fontWeight="medium">
                                  {item.documentType}
                                </Text>
                              </GridItem>
                            </Grid>

                            <Divider />

                            {/* Attachments */}
                            <VStack spacing={3} align="stretch">
                              {/* File Attachment */}
                              {item.mediaObjectData && (
                                <Box>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color="green.600"
                                    mb={2}
                                  >
                                    📎 FILE ATTACHMENT
                                  </Text>
                                  <HStack
                                    p={4}
                                    bg={
                                      colorMode === "light"
                                        ? "green.50"
                                        : "green.900"
                                    }
                                    rounded="md"
                                    border="2px"
                                    borderColor="green.200"
                                    spacing={3}
                                    justify="space-between"
                                  >
                                    <HStack spacing={3} flex={1} minW={0}>
                                      <Box flexShrink={0}>
                                        {renderFileIconSTR(
                                          item.mediaObjectData.objectExtension?.trim() ||
                                            "file",
                                        )}
                                      </Box>
                                      <VStack
                                        align="start"
                                        spacing={1}
                                        flex={1}
                                        minW={0}
                                      >
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          noOfLines={1}
                                        >
                                          {item.mediaObjectData.objectRawName ||
                                            item.documentName}
                                        </Text>
                                        <HStack spacing={2}>
                                          <Badge
                                            colorScheme="gray"
                                            fontSize="xs"
                                          >
                                            {item.mediaObjectData.objectExtension
                                              ?.replace(".", "")
                                              .toUpperCase()}
                                          </Badge>
                                          {item.mediaObjectData.objectSize && (
                                            <Badge
                                              colorScheme="blue"
                                              fontSize="xs"
                                            >
                                              {formatKBMB(
                                                item.mediaObjectData.objectSize,
                                              )}
                                            </Badge>
                                          )}
                                        </HStack>
                                      </VStack>
                                    </HStack>
                                    <Button
                                      size="md"
                                      colorScheme="green"
                                      leftIcon={<FiDownload />}
                                      isLoading={isDownloading}
                                      onClick={() => {
                                        if (item.mediaObjectId) {
                                          handleSecureDownload(
                                            item.mediaObjectId,
                                            item.mediaObjectData?.objectRawName || item.mediaObjectData?.objectName || "document",
                                          );
                                        }
                                      }}
                                      flexShrink={0}
                                    >
                                      Download
                                    </Button>
                                  </HStack>
                                </Box>
                              )}

                              {/* Link Attachment */}
                              {item.linkAttachment && (
                                <Box>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color="blue.600"
                                    mb={2}
                                  >
                                    🔗 EXTERNAL LINK
                                  </Text>
                                  <HStack
                                    p={4}
                                    bg={
                                      colorMode === "light"
                                        ? "blue.50"
                                        : "blue.900"
                                    }
                                    rounded="md"
                                    border="2px"
                                    borderColor="blue.200"
                                    spacing={3}
                                    justify="space-between"
                                  >
                                    <HStack spacing={3} flex={1} minW={0}>
                                      <Icon
                                        as={FiLink}
                                        boxSize={6}
                                        color="blue.500"
                                        flexShrink={0}
                                      />
                                      <VStack
                                        align="start"
                                        spacing={1}
                                        flex={1}
                                        minW={0}
                                      >
                                        <Text fontSize="sm" fontWeight="bold">
                                          External Document Link
                                        </Text>
                                        <Text
                                          fontSize="xs"
                                          color="blue.700"
                                          noOfLines={2}
                                          wordBreak="break-all"
                                        >
                                          {item.linkAttachment}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <Button
                                      size="md"
                                      colorScheme="blue"
                                      leftIcon={<FiExternalLink />}
                                      onClick={() => {
                                        if (item.linkAttachment) {
                                          window.open(
                                            item.linkAttachment,
                                            "_blank",
                                          );
                                        }
                                      }}
                                      flexShrink={0}
                                    >
                                      Open Link
                                    </Button>
                                  </HStack>
                                </Box>
                              )}

                              {/* No Attachments */}
                              {!item.mediaObjectData &&
                                !item.linkAttachment && (
                                  <Box
                                    p={4}
                                    bg="gray.100"
                                    rounded="md"
                                    textAlign="center"
                                  >
                                    <Text fontSize="sm" color="gray.500">
                                      No attachments available
                                    </Text>
                                  </Box>
                                )}
                            </VStack>
                          </VStack>
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={FiFile} boxSize={12} color="gray.400" mb={3} />
                  <Text color="gray.500" fontSize="lg">
                    No document history available
                  </Text>
                </Box>
              )}

              <Box
                w={"full"}
                overflowX={"auto"}
                p={4}
                mt={2}
                bgColor={colorMode === "light" ? "gray.200" : "gray.700"}
                rounded={radiusStyle}
                display={"none"}
              >
                <Text fontWeight={600}>Debug DATA</Text>
                <pre>{JSON.stringify(ListProjectWFValue, null, 2)}</pre>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Box
        p={4}
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: colorMode === "light" ? "gray.100" : "gray.700" }}
      >
        <HStack justify="space-between">
          <Text fontWeight={600} fontSize="sm">
            {workflow.wfgName} ({workflow.workflowChild.length})
          </Text>
          <Text fontSize="xs" color="gray.500">
            {isOpen ? "−" : "+"}
          </Text>
        </HStack>
      </Box>
      <Collapse in={isOpen}>
        <Flex
          mt={2}
          overflowX={"auto"}
          w={"full"}
          border={"1px solid"}
          borderRadius={radiusStyle}
          borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
          boxShadow={"md"}
        >
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr
                bg={colorMode == "light" ? "secondary.50" : "gray.900"}
                color={colorMode == "light" ? "secondary.800" : "secondary.500"}
              >
                <Th py={3}>Jenis Dokumen</Th>
                <Th py={3}>Nama Dokumen</Th>
                <Th py={3}>Nomor Dokumen</Th>
                <Th py={3}>Tanggal Dokumen</Th>
                <Th py={3}>Versi</Th>
                <Th py={3}>Status</Th>
                <Th width="200px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workflow.workflowChild?.map((level3) => (
                <Tr key={level3.id} fontWeight="medium" fontSize="sm">
                  {/* Type Of Doc */}
                  <Td>
                    <Text>{level3.wfgName}</Text>
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>{level3.workflowValues[0].documentName}</Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>{level3.workflowValues[0].documentNumber}</Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>
                        {convertToCustomDateFormat(
                          level3.workflowValues[0].documentDate,
                        )}
                      </Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text textAlign={"center"}>
                        {level3.workflowValues[0].documentVersion}
                      </Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    <Flex
                      as={Stack}
                      textAlign={"center"}
                      justifyContent={"center"}
                      align={"center"}
                      w={"full"}
                    >
                      {level3.workflowValues.length > 0 ? (
                        <Tooltip
                          rounded={"md"}
                          hasArrow
                          label={"File sudah di upload"}
                          bg={"secondary.500"}
                          color={"white"}
                        >
                          <Icon as={FiCheckCircle} color={"green.500"} />
                        </Tooltip>
                      ) : (
                        <Tooltip
                          rounded={"md"}
                          hasArrow
                          label={"Belum ada upload files"}
                          bg={"yellow.300"}
                          color={"gray.800"}
                        >
                          <Icon as={FiAlertTriangle} color={"yellow.300"} />
                        </Tooltip>
                      )}
                    </Flex>
                  </Td>
                  {/* ACTION */}
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<FiUpload />}
                        onClick={() => handleOpenForm(level3)}
                      >
                        Upload
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="gray"
                        variant="outline"
                        leftIcon={<FiEye />}
                        onClick={() => handleOpenDetail(level3)}
                      >
                        Detail
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      </Collapse>
    </Box>
  );
};

// Workflow Level 1 Component
interface WorkflowLevel1Props {
  workflow: ProjectWorkflowResponse;
  onRefresh?: () => void;
}

export const WorkflowLevel1Box = ({
  workflow,
  onRefresh,
}: WorkflowLevel1Props) => {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <Card
      shadow="md"
      rounded={radiusStyle}
      bgColor={colorMode === "light" ? "white" : "gray.800"}
    >
      <CardHeader
        p={4}
        cursor="pointer"
        onClick={onToggle}
        _hover={{
          rounded: radiusStyle,
          bg: colorMode === "light" ? "gray.50" : "secondary.200",
        }}
        mb={2}
      >
        <HStack justify="space-between">
          <Text fontWeight={600} color="secondary.600">
            {workflow.wfgName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {isOpen ? "−" : "+"}
          </Text>
        </HStack>
      </CardHeader>
      <Collapse in={isOpen}>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {workflow.workflowChild?.map((level2: any) => (
              <WorkflowLevel2Box
                key={level2.id}
                workflow={level2}
                onRefresh={onRefresh}
              />
            ))}
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
};

// Dynamic Workflow Component - Handles any level (1, 2, or 3)
interface DynamicWorkflowProps {
  workflow: ProjectWorkflowResponse;
  onRefresh?: () => void;
  level?: number;
}

export const DynamicWorkflowBox = ({
  workflow,
  onRefresh,
  level = 1,
}: DynamicWorkflowProps) => {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: level < 3 });

  const hasChildren =
    workflow.workflowChild && workflow.workflowChild.length > 0;
  const isLeafNode = !hasChildren;

  if (isLeafNode) {
    // Render as table row for leaf nodes (any level can be leaf)
    return <WorkflowTableRow workflow={workflow} onRefresh={onRefresh} />;
  }

  // Render as container for parent nodes
  return (
    <Card
      shadow="md"
      rounded={radiusStyle}
      bgColor={colorMode === "light" ? "white" : "gray.800"}
      ml={level > 1 ? 4 : 0}
    >
      <CardHeader
        p={4}
        cursor="pointer"
        onClick={onToggle}
        _hover={{
          rounded: radiusStyle,
          bg: colorMode === "light" ? "gray.50" : "secondary.200",
        }}
        mb={2}
      >
        <HStack justify="space-between">
          <Text fontWeight={600} color="secondary.600">
            {workflow.wfgName} ({workflow.workflowChild.length})
          </Text>
          <Text fontSize="sm" color="gray.500">
            {isOpen ? "−" : "+"}
          </Text>
        </HStack>
      </CardHeader>
      <Collapse in={isOpen}>
        <CardBody pt={0}>
          {/* Check if children are leaf nodes to render table */}
          {workflow.workflowChild.some(
            (child) => !child.workflowChild || child.workflowChild.length === 0
          ) ? (
            // Render table if children are leaf nodes
            <Flex
              mt={2}
              overflowX={"auto"}
              w={"full"}
              border={"1px solid"}
              borderRadius={radiusStyle}
              borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
              boxShadow={"md"}
            >
              <Table size="sm" variant="unstyled">
                <Thead>
                  <Tr
                    bg={colorMode == "light" ? "secondary.50" : "gray.900"}
                    color={
                      colorMode == "light" ? "secondary.800" : "secondary.500"
                    }
                  >
                    <Th py={3}>Jenis Dokumen</Th>
                    <Th py={3}>Nama Dokumen</Th>
                    <Th py={3}>Nomor Dokumen</Th>
                    <Th py={3}>Tanggal Dokumen</Th>
                    <Th py={3}>Versi</Th>
                    <Th py={3}>Status</Th>
                    <Th width="200px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {workflow.workflowChild?.map((child) => (
                    <DynamicWorkflowBox
                      key={child.id}
                      workflow={child}
                      onRefresh={onRefresh}
                      level={level + 1}
                    />
                  ))}
                </Tbody>
              </Table>
            </Flex>
          ) : (
            // Render nested containers if children have their own children
            <VStack spacing={3} align="stretch">
              {workflow.workflowChild?.map((child) => (
                <DynamicWorkflowBox
                  key={child.id}
                  workflow={child}
                  onRefresh={onRefresh}
                  level={level + 1}
                />
              ))}
            </VStack>
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
};

// Reusable Table Row Component for leaf nodes
interface WorkflowTableRowProps {
  workflow: ProjectWorkflowResponse;
  onRefresh?: () => void;
}

const WorkflowTableRow = ({ workflow, onRefresh }: WorkflowTableRowProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ActionLoading, setActionLoading] = useState(false);
  const [ListProjectWFValue, setListProjectWFValue] = useState<
    ProjectWorkflowValueResponse[]
  >([]);
  const [files, setFiles] = useState<File | null>(null);
  const [attachmentMethod, setAttachmentMethod] = useState<"file" | "link">("file");
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const UrlEndpoint: string = buildUrlPort(
    ENDPOINT_API_BASEURL_OBJECT,
    ENDPOINT_PORT_BASIC_OBJECT
  );

  const { SecureDownloadFiles: SecureDownloadFiles2, error: secureDownloadError2 } = useMediaObject();
  const [isDownloading2, setIsDownloading2] = useState(false);

  const handleSecureDownload2 = async (mediaObjectId: string, fileName: string) => {
    if (!tokenData) return;
    setIsDownloading2(true);
    try {
      const blob = await SecureDownloadFiles2(
        [mediaObjectId],
        tokenData,
        workflow.projectId,
        "Project_Workflow",
        `${fileName || "document"}.zip`
      );
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName || "document"}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({ description: "File berhasil diunduh. Password dikirim ke email Anda.", statusToast: "success" });
      } else {
        showToast({ description: secureDownloadError2 || "Gagal mengunduh file", statusToast: "error" });
      }
    } catch {
      showToast({ description: "Terjadi kesalahan saat mengunduh file", statusToast: "error" });
    } finally {
      setIsDownloading2(false);
    }
  };

  const { InsertProjectWorkflowValue, ListProjectWorkflowValue, CompleteDocumentationProgression, DeleteProjectWorkflow } =
    useProjects();

  const [isCompleting, setIsCompleting] = useState(false);
  const [openConfirmComplete, setOpenConfirmComplete] = useState(false);

  const handleCompleteDocumentation = async () => {
    if (!tokenData || !workflow.id) return;
    setIsCompleting(true);
    try {
      const response = await CompleteDocumentationProgression(workflow.id, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({ description: "Progression berhasil ditandai selesai", statusToast: "success" });
        if (onRefresh) onRefresh();
      } else {
        showToast({ description: response?.message || "Gagal menyelesaikan progression", statusToast: "error" });
      }
    } catch {
      showToast({ description: "Terjadi kesalahan", statusToast: "error" });
    } finally {
      setIsCompleting(false);
    }
  };

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWorkflow = async () => {
    if (!tokenData || !workflow.id) return;
    setIsDeleting(true);
    try {
      const response = await DeleteProjectWorkflow(workflow.id, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        showToast({ description: "Workstage berhasil dihapus", statusToast: "success" });
        if (onRefresh) onRefresh();
      } else {
        showToast({ description: response?.message || "Gagal menghapus workstage", statusToast: "error" });
      }
    } catch {
      showToast({ description: "Terjadi kesalahan", statusToast: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/vnd.rar": [".rar"],
    },
    maxSize: 120 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFiles(file);
        formik.setFieldValue("file", file);
        setFilePreview({
          name: file.name,
          size: file.size,
        });
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        showToast({
          description: "File size exceeds 120MB",
          statusToast: "error",
        });
      } else if (rejection.errors[0].code === "file-invalid-type") {
        showToast({
          description: "File type not supported",
          statusToast: "error",
        });
      }
    },
  });

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Modal states
  const ModalForm = useDisclosure();
  const ModalDetailWF = useDisclosure();

  // Form setup (reuse existing form logic)
  const formik = useFormik<ProjectWorkflowValueInsertPayload>({
    initialValues: initValuePayloadWFV,
    validationSchema: FormSchemaWFV,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // Validate based on attachment method
      if (attachmentMethod === "file" && !files) {
        showToast({
          description: "Please upload a file",
          statusToast: "error",
        });
        return;
      }

      if (attachmentMethod === "link" && !values.LinkAttachment) {
        showToast({
          description: "Please provide a link",
          statusToast: "error",
        });
        return;
      }

      setActionLoading(true);
      const requestData = await InsertProjectWorkflowValue(values, tokenData);

      if (requestData?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Document uploaded and saved successfully",
          statusToast: "success",
        });
        formik.resetForm();
        setFiles(null);
        setFilePreview(null);
        ModalForm.onClose();
        if (onRefresh) onRefresh();
      } else {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
      setActionLoading(false);
    },
  });

  const handleOpenForm = () => {
    formik.resetForm();
    ModalForm.onOpen();
    formik.setFieldValue("DocumentType", workflow.wfgName);
    formik.setFieldValue("ProjectWorkflowId", workflow.id);
    
    // Set current datetime
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    formik.setFieldValue("DocumentDate", localDateTime);
  };

  const handleOpenDetail = async () => {
    const PayloadList: PaggingListPayload = {
      search: "",
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [
        { field: "projectWorkflowId", operator: "=", value: workflow.id },
      ],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    const requestData = await ListProjectWorkflowValue(PayloadList, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setListProjectWFValue(requestData.data as ProjectWorkflowValueResponse[]);
      ModalDetailWF.onOpen();
    }
  };

  return (
    <>
      <Tr fontWeight="medium" fontSize="sm">
        <Td>
          <Text>{workflow.wfgName}</Text>
        </Td>
        <Td>
          {workflow.workflowValues?.length > 0 ? (
            <Text>{workflow.workflowValues[0].documentName}</Text>
          ) : (
            <Text textAlign={"center"}>{"-"}</Text>
          )}
        </Td>
        <Td>
          {workflow.workflowValues?.length > 0 ? (
            <Text>{workflow.workflowValues[0].documentNumber}</Text>
          ) : (
            <Text textAlign={"center"}>{"-"}</Text>
          )}
        </Td>
        <Td>
          {workflow.workflowValues?.length > 0 ? (
            <Text>
              {convertToCustomDateFormat(
                workflow.workflowValues[0].documentDate
              )}
            </Text>
          ) : (
            <Text textAlign={"center"}>{"-"}</Text>
          )}
        </Td>
        <Td>
          {workflow.workflowValues?.length > 0 ? (
            <Text textAlign={"center"}>
              {workflow.workflowValues[0].documentVersion}
            </Text>
          ) : (
            <Text textAlign={"center"}>{"-"}</Text>
          )}
        </Td>
        <Td>
          <Flex
            as={Stack}
            textAlign={"center"}
            justifyContent={"center"}
            align={"center"}
            w={"full"}
          >
            {workflow.workflowValues?.length > 0 ? (
              <Tooltip
                rounded={"md"}
                hasArrow
                label={"File sudah di upload"}
                bg={"secondary.500"}
                color={"white"}
              >
                <Icon as={FiCheckCircle} color={"green.500"} />
              </Tooltip>
            ) : (
              <Tooltip
                rounded={"md"}
                hasArrow
                label={"Belum ada upload files"}
                bg={"yellow.300"}
                color={"gray.800"}
              >
                <Icon as={FiAlertTriangle} color={"yellow.300"} />
              </Tooltip>
            )}
          </Flex>
        </Td>
        <Td>
          <HStack spacing={2}>
            <Button
              size="xs"
              colorScheme="blue"
              variant="outline"
              leftIcon={<FiUpload />}
              onClick={handleOpenForm}
            >
              Upload
            </Button>
            <Button
              size="xs"
              colorScheme="gray"
              variant="outline"
              leftIcon={<FiEye />}
              onClick={handleOpenDetail}
            >
              Detail
            </Button>
            {workflow.workflowValues?.length > 0 && workflow.progressionStatus !== "DONE" && (
              <Button
                size="xs"
                colorScheme="green"
                variant="solid"
                leftIcon={<FiCheckCircle />}
                isLoading={isCompleting}
                onClick={() => setOpenConfirmComplete(true)}
              >
                Force Done Progression
              </Button>
            )}
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <IconButton
                  aria-label="More actions"
                  icon={<FiMoreVertical />}
                  size="xs"
                  variant="ghost"
                />
              </PopoverTrigger>
              <PopoverContent w="180px">
                <PopoverBody p={1}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<FiTrash2 />}
                    w="full"
                    justifyContent="start"
                    isLoading={isDeleting}
                    onClick={() => setOpenConfirmDelete(true)}
                  >
                    Delete Workstage
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
        </Td>
      </Tr>

      {/* Confirmation Dialog for Force Done Progression */}
      <ConfirmationDialog
        key={"confirmCompleteDocProgression"}
        isOpenTrigger={openConfirmComplete}
        action={handleCompleteDocumentation}
        trigger={setOpenConfirmComplete}
        questionMsg={"Apakah Anda yakin ingin menandai progression ini sebagai selesai?\n\nPerhatian: Aksi ini akan membuat progression selesai tanpa melalui Kanban. User tidak akan ter-assign pada task sehingga tidak akan tercatat pada laporan kerja user."}
        captionMsg={"Force Done Progression"}
      />

      {/* Confirmation Dialog for Delete Workstage */}
      <ConfirmationDialog
        key={"confirmDeleteWorkstage"}
        isOpenTrigger={openConfirmDelete}
        action={handleDeleteWorkflow}
        trigger={setOpenConfirmDelete}
        questionMsg={"Apakah Anda yakin ingin menghapus workstage ini?\n\nPerhatian: Menghapus workstage akan menghapus seluruh data terkait termasuk:\n- Dokumen yang telah diupload\n- Data progression dan backlog\n- Task dan Kanban board\n- Riwayat perubahan\n\nAksi ini tidak dapat dibatalkan."}
        captionMsg={"Delete Workstage"}
      />

      {/* Reuse existing modals from WorkflowLevel2Box */}
      <Modal
        size={"xl"}
        isOpen={ModalForm.isOpen}
        onClose={ModalForm.onClose}
        closeOnOverlayClick={false}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
          maxH="90vh"
        >
          <form onSubmit={formik.handleSubmit}>
            <ModalHeader>Upload New Document</ModalHeader>
            <ModalCloseButton color={"red.500"} />
            <ModalBody w={"full"} maxH="70vh" overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch" w="full">
                <FormControl
                  isInvalid={!!formik.errors.DocumentName}
                  isRequired
                >
                  <FormLabel>Nama Dokumen</FormLabel>
                  <Input
                    name="DocumentName"
                    placeholder="Masukkan nama dokumen"
                    value={formik.values.DocumentName}
                    onChange={formik.handleChange}
                    isDisabled={ActionLoading}
                  />
                  <FormErrorMessage>
                    {formik.errors.DocumentName}
                  </FormErrorMessage>
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl
                      isInvalid={!!formik.errors.DocumentNumber}
                      isRequired
                    >
                      <FormLabel>Nomor Dokumen</FormLabel>
                      <Input
                        name="DocumentNumber"
                        placeholder="Masukkan nomor dokumen"
                        value={formik.values.DocumentNumber}
                        onChange={formik.handleChange}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.DocumentNumber}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl
                      isInvalid={!!formik.errors.DocumentDate}
                      isRequired
                    >
                      <FormLabel>Tanggal Dokumen</FormLabel>
                      <Input
                        name="DocumentDate"
                        type="date"
                        value={formik.values.DocumentDate}
                        onChange={formik.handleChange}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.DocumentDate}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl
                  isInvalid={!!formik.errors.DocumentVersion}
                  isRequired
                >
                  <FormLabel>Versi Dokumen</FormLabel>
                  <Input
                    name="DocumentVersion"
                    placeholder="Contoh: 1.0"
                    value={formik.values.DocumentVersion}
                    onChange={formik.handleChange}
                    isDisabled={ActionLoading}
                  />
                  <FormErrorMessage>
                    {formik.errors.DocumentVersion}
                  </FormErrorMessage>
                </FormControl>

                {/* Method Selection */}
                <FormControl isRequired>
                  <FormLabel>Metode Lampiran</FormLabel>
                  <RadioGroup
                    value={attachmentMethod}
                    onChange={(value: "file" | "link") => {
                      setAttachmentMethod(value);
                      if (value === "file") {
                        formik.setFieldValue("LinkAttachment", null);
                      } else {
                        setFiles(null);
                        setFilePreview(null);
                        formik.setFieldValue("file", null);
                      }
                    }}
                  >
                    <Stack direction="row" spacing={6}>
                      <Radio value="file" colorScheme="blue">
                        <HStack spacing={2}>
                          <Icon as={FiUpload} />
                          <Text>Upload File</Text>
                        </HStack>
                      </Radio>
                      <Radio value="link" colorScheme="blue">
                        <HStack spacing={2}>
                          <Icon as={FiLink} />
                          <Text>Link Eksternal</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Conditional Input based on selection */}
                {attachmentMethod === "file" ? (
                  <FormControl isRequired>
                    <FormLabel>Upload File</FormLabel>

                    {/* Dropzone Area */}
                    <Flex
                      {...getRootProps()}
                      p={8}
                      border="3px dashed"
                      borderColor={isDragActive ? "blue.400" : "gray.300"}
                      rounded={radiusStyle}
                      cursor="pointer"
                      bg={isDragActive ? "blue.50" : "gray.50"}
                      textAlign="center"
                      color={isDragActive ? "blue.600" : "gray.600"}
                      _hover={{
                        bg: "blue.50",
                        borderColor: "blue.400",
                        color: "blue.600",
                      }}
                      w="full"
                      minH="200px"
                      justifyContent="center"
                      alignItems="center"
                      transition="all 0.2s"
                    >
                      <input {...getInputProps()} />
                      <VStack spacing={3}>
                        <Icon as={FiUpload} boxSize={12} />
                        <Text fontSize="lg" fontWeight="semibold">
                          {isDragActive
                            ? "Lepaskan file di sini..."
                            : "Seret & letakkan file di sini, atau klik untuk memilih file"}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR (Max 120MB)
                        </Text>
                      </VStack>
                    </Flex>

                    {/* File Preview */}
                    {filePreview && (
                      <Box
                        mt={4}
                        p={4}
                        border="1px"
                        borderColor="green.200"
                        rounded={radiusStyle}
                        bg="green.50"
                      >
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Icon as={FiFile} boxSize={6} color="green.600" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {filePreview.name}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {(filePreview.size / 1024).toFixed(2)} KB
                              </Text>
                            </VStack>
                          </HStack>
                          <IconButton
                            aria-label="Remove file"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              setFiles(null);
                              setFilePreview(null);
                              formik.setFieldValue("file", null);
                            }}
                          />
                        </HStack>
                      </Box>
                    )}
                  </FormControl>
                ) : (
                  <FormControl isRequired>
                    <FormLabel>Link Attachment</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiLink} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        id="LinkAttachment"
                        name="LinkAttachment"
                        placeholder="https://bjbdrive/drive/example"
                        value={formik.values.LinkAttachment || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isDisabled={ActionLoading}
                      />
                    </InputGroup>
                    <FormHelperText>
                      <HStack spacing={2}>
                        <Icon as={FiInfo} color="blue.500" />
                        <Text fontSize="xs">
                          Masukkan URL lengkap dokumen (Google Drive, OneDrive, SharePoint, dll)
                        </Text>
                      </HStack>
                    </FormHelperText>
                  </FormControl>
                )}

                <HStack spacing={3} justify="flex-end" pt={4}>
                  <Button
                    variant="outline"
                    onClick={ModalForm.onClose}
                    isDisabled={ActionLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={ActionLoading}
                    loadingText="Menyimpan..."
                  >
                    Simpan Dokumen
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>

      <Modal
        size={"xl"}
        isOpen={ModalDetailWF.isOpen}
        onClose={ModalDetailWF.onClose}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
          maxH="90vh"
        >
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"} maxH="70vh" overflowY="auto" p={6}>
            {ListProjectWFValue?.length > 0 ? (
              <VStack spacing={6} align="stretch" w="full">
                {/* Header */}
                <Box
                  p={4}
                  bg={colorMode === "light" ? "blue.500" : "blue.600"}
                  rounded={radiusStyle}
                  color="white"
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={FiFile} boxSize={6} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xl" fontWeight="bold">
                          Document History
                        </Text>
                        <Text fontSize="sm" opacity={0.9}>
                          {ListProjectWFValue.length} document{ListProjectWFValue.length > 1 ? "s" : ""} uploaded
                        </Text>
                      </VStack>
                    </HStack>
                  </HStack>
                </Box>

                {/* Timeline Cards */}
                <VStack spacing={4} align="stretch" position="relative" pl={8}>
                  {/* Timeline Line */}
                  <Box
                    position="absolute"
                    left="15px"
                    top="20px"
                    bottom="20px"
                    width="2px"
                    bg={colorMode === "light" ? "gray.300" : "gray.600"}
                  />

                  {ListProjectWFValue.map((item, index) => (
                    <Box key={item.id} position="relative">
                      {/* Timeline Dot */}
                      <Box
                        position="absolute"
                        left="-23px"
                        top="20px"
                        width="16px"
                        height="16px"
                        rounded="full"
                        bg={item.mediaObjectData ? "green.500" : item.linkAttachment ? "blue.500" : "gray.400"}
                        border="3px solid"
                        borderColor={colorMode === "light" ? "white" : "gray.900"}
                        zIndex={1}
                      />

                      {/* Card */}
                      <Box
                        p={5}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        rounded={radiusStyle}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        boxShadow="md"
                        _hover={{
                          boxShadow: "lg",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s"
                      >
                        {/* Card Header */}
                        <HStack justify="space-between" mb={3}>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="lg" fontWeight="bold">
                              {item.documentName}
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              <Badge colorScheme="purple" fontSize="xs">
                                {item.documentType}
                              </Badge>
                              <Badge colorScheme="gray" fontSize="xs">
                                {item.documentNumber}
                              </Badge>
                            </HStack>
                          </VStack>
                          <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                            v{item.documentVersion}
                          </Badge>
                        </HStack>

                        {/* Card Body */}
                        <VStack spacing={3} align="stretch">
                          {/* Document Info Grid */}
                          <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                            <GridItem>
                              <Text color="gray.500" fontSize="xs">Document Date</Text>
                              <Text fontWeight="medium">
                                {new Date(item.documentDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Text>
                            </GridItem>
                            <GridItem>
                              <Text color="gray.500" fontSize="xs">Uploaded By</Text>
                              <Text fontWeight="medium">{item.createdBy}</Text>
                            </GridItem>
                            <GridItem>
                              <Text color="gray.500" fontSize="xs">Created At</Text>
                              <Text fontWeight="medium">
                                {new Date(item.createdAt).toLocaleDateString("id-ID")} {new Date(item.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </Text>
                            </GridItem>
                            <GridItem>
                              <Text color="gray.500" fontSize="xs">Document Type</Text>
                              <Text fontWeight="medium">{item.documentType}</Text>
                            </GridItem>
                          </Grid>

                          <Divider />

                          {/* Attachments */}
                          <VStack spacing={3} align="stretch">
                            {/* File Attachment */}
                            {item.mediaObjectData && (
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="green.600" mb={2}>
                                  📎 FILE ATTACHMENT
                                </Text>
                                <HStack
                                  p={4}
                                  bg={colorMode === "light" ? "green.50" : "green.900"}
                                  rounded="md"
                                  border="2px"
                                  borderColor="green.200"
                                  spacing={3}
                                  justify="space-between"
                                >
                                  <HStack spacing={3} flex={1} minW={0}>
                                    <Box flexShrink={0}>
                                      {renderFileIconSTR(
                                        item.mediaObjectData.objectExtension?.trim() || "file"
                                      )}
                                    </Box>
                                    <VStack align="start" spacing={1} flex={1} minW={0}>
                                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                        {item.mediaObjectData.objectRawName || item.documentName}
                                      </Text>
                                      <HStack spacing={2}>
                                        <Badge colorScheme="gray" fontSize="xs">
                                          {item.mediaObjectData.objectExtension?.replace(".", "").toUpperCase()}
                                        </Badge>
                                        {item.mediaObjectData.objectSize && (
                                          <Badge colorScheme="blue" fontSize="xs">
                                            {formatKBMB(item.mediaObjectData.objectSize)}
                                          </Badge>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </HStack>
                                  <Button
                                    size="md"
                                    colorScheme="green"
                                    leftIcon={<FiDownload />}
                                    isLoading={isDownloading2}
                                    onClick={() => {
                                      if (item.mediaObjectId) {
                                        handleSecureDownload2(
                                          item.mediaObjectId,
                                          item.mediaObjectData?.objectRawName || item.mediaObjectData?.objectName || "document",
                                        );
                                      }
                                    }}
                                    flexShrink={0}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Box>
                            )}

                            {/* Link Attachment */}
                            {item.linkAttachment && (
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="blue.600" mb={2}>
                                  🔗 EXTERNAL LINK
                                </Text>
                                <HStack
                                  p={4}
                                  bg={colorMode === "light" ? "blue.50" : "blue.900"}
                                  rounded="md"
                                  border="2px"
                                  borderColor="blue.200"
                                  spacing={3}
                                  justify="space-between"
                                >
                                  <HStack spacing={3} flex={1} minW={0}>
                                    <Icon as={FiLink} boxSize={6} color="blue.500" flexShrink={0} />
                                    <VStack align="start" spacing={1} flex={1} minW={0}>
                                      <Text fontSize="sm" fontWeight="bold">
                                        External Document Link
                                      </Text>
                                      <Text fontSize="xs" color="blue.700" noOfLines={2} wordBreak="break-all">
                                        {item.linkAttachment}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <Button
                                    size="md"
                                    colorScheme="blue"
                                    leftIcon={<FiExternalLink />}
                                    onClick={() => {
                                      if (item.linkAttachment) {
                                        window.open(item.linkAttachment, "_blank");
                                      }
                                    }}
                                    flexShrink={0}
                                  >
                                    Open Link
                                  </Button>
                                </HStack>
                              </Box>
                            )}

                            {/* No Attachments */}
                            {!item.mediaObjectData && !item.linkAttachment && (
                              <Box p={4} bg="gray.100" rounded="md" textAlign="center">
                                <Text fontSize="sm" color="gray.500">
                                  No attachments available
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </VStack>
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiFile} boxSize={12} color="gray.400" mb={3} />
                <Text color="gray.500" fontSize="lg">No document history available</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
