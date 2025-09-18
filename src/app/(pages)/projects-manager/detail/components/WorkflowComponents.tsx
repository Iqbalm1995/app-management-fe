"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { convertToCustomDateFormat } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectWorkflowResponse,
  ProjectWorkflowValueInsertPayload,
} from "@/app/services/useProjects";
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
  Input,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import * as yup from "yup";

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
  LinkAttachment: yup.string().nullable(),
  ReffParentId: yup.string().nullable(),
  file: yup
    .mixed<File>()
    .nullable()
    .test("fileRequired", "File is required", (value) => value != null),
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
  const { InsertProjectWorkflowValue } = useProjects();

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
  const [files, setFiles] = useState<File | null>(null);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  const InsertAttchmentWFVServ = async (
    data: ProjectWorkflowValueInsertPayload
  ) => {
    const requestData = await InsertProjectWorkflowValue(data, tokenData);
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
        description: "Creating new requirement data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      ModalForm.onClose();
      if (onRefresh) {
        onRefresh();
      }
      RefreshAction();
      return;
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
                {/* COMPLETE FORM UI FROM FORMIK HERE */}
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

                  {/* Link Attachment */}
                  <FormControl isInvalid={!!formik.errors.LinkAttachment}>
                    <FormLabel>Link Attachment (Opsional)</FormLabel>
                    <Input
                      id="LinkAttachment"
                      name="LinkAttachment"
                      placeholder="https://example.com/document"
                      value={formik.values.LinkAttachment || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isDisabled={ActionLoading}
                    />
                    <FormErrorMessage>
                      {formik.errors.LinkAttachment}
                    </FormErrorMessage>
                  </FormControl>

                  {/* File Upload */}
                  <FormControl isInvalid={!!formik.errors.file} isRequired>
                    <FormLabel>Upload File</FormLabel>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFiles(file);
                        formik.setFieldValue("file", file);
                      }}
                      p={1}
                      isDisabled={ActionLoading}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                    </Text>
                    <FormErrorMessage>{formik.errors.file}</FormErrorMessage>
                  </FormControl>

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
                <Th py={3}>Tanggal Upload</Th>
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
                          level3.workflowValues[0].documentDate
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
