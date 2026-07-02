"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReporting, {
  AppsCriticalReportingDocumentResponse,
  AppsCriticalReportingPeriodDetailResponse,
} from "@/app/services/useAppsCriticalReporting";
import {
  Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex,
  FormControl, FormErrorMessage, FormLabel, Grid, GridItem, Heading,
  HStack, Icon, IconButton, Input, InputGroup, InputLeftElement,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, Radio, RadioGroup, Spacer, Spinner,
  Stack, Text, Textarea, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaArrowLeft } from "react-icons/fa6";
import { FiCalendar, FiDownload, FiEdit, FiFile, FiFileText, FiHash, FiLink, FiPlus, FiSave, FiTrash2, FiUpload } from "react-icons/fi";
import * as Yup from "yup";

export default function ReportingPeriodDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodId = searchParams.get("id");

  const { GetDetail, Update, Delete, UploadDocument, UpdateDocument, DeleteDocument } = useAppsCriticalReporting();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<AppsCriticalReportingPeriodDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditPeriod, setIsEditPeriod] = useState(false);

  const [attachMethod, setAttachMethod] = useState<"file" | "link">("file");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState("");

  const MAX_SIZE = 120 * 1024 * 1024; // 120MB

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setUploadFile(accepted[0]); setFilePreviewName(accepted[0].name); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: { "application/pdf": [], "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [], "application/vnd.ms-excel": [], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], "application/vnd.ms-powerpoint": [], "application/vnd.openxmlformats-officedocument.presentationml.presentation": [], "application/zip": [], "application/x-rar-compressed": [], "text/csv": [] },
    multiple: false,
    onDropRejected: (files) => showToast({ description: files[0]?.errors?.[0]?.message || "File rejected", statusToast: "error" }),
  });

  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isEditDocOpen, onOpen: onEditDocOpen, onClose: onEditDocClose } = useDisclosure();
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false);
  const [isDeletePeriodOpen, setIsDeletePeriodOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  const loadData = async () => {
    if (!tokenData || !periodId) return;
    setLoading(true);
    const res = await GetDetail(periodId, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) setData(res.data);
    else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    setLoading(false);
  };

  useEffect(() => { if (tokenData) loadData(); }, [tokenData, periodId]);

  // Edit period note formik
  const editPeriodFormik = useFormik({
    initialValues: { note: data?.note || "" },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!periodId) return;
      setActionLoading(true);
      const res = await Update({ id: periodId, note: values.note || undefined }, tokenData);
      setActionLoading(false);
      if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Period updated", statusToast: "success" }); setIsEditPeriod(false); loadData(); }
      else showToast({ description: res?.message || "Failed", statusToast: "error" });
    },
  });

  // Upload document formik
  const uploadFormik = useFormik({
    initialValues: { reportName: "", reportDesc: "", reportNumber: "", reportVersion: "1.0", reportUploadDate: new Date().toISOString().split("T")[0], linkAttachment: "" },
    validationSchema: Yup.object({ reportName: Yup.string().required("Document name is required"), reportVersion: Yup.string().required("Version is required") }),
    onSubmit: async (values, { resetForm }) => {
      if (attachMethod === "file" && !uploadFile) { showToast({ description: "Please select a file", statusToast: "error" }); return; }
      if (attachMethod === "link" && !values.linkAttachment) { showToast({ description: "Please provide a link", statusToast: "error" }); return; }
      setActionLoading(true);
      const fd = new FormData();
      fd.append("reportPeriodId", periodId || "");
      fd.append("reportName", values.reportName);
      if (values.reportDesc) fd.append("reportDesc", values.reportDesc);
      if (values.reportNumber) fd.append("reportNumber", values.reportNumber);
      fd.append("reportVersion", values.reportVersion);
      fd.append("reportUploadDate", new Date(values.reportUploadDate).toISOString());
      if (attachMethod === "file" && uploadFile) fd.append("file", uploadFile);
      if (attachMethod === "link") fd.append("linkAttachment", values.linkAttachment);
      const res = await UploadDocument(fd, tokenData);
      setActionLoading(false);
      if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Document uploaded", statusToast: "success" }); resetForm(); setUploadFile(null); setFilePreviewName(""); onUploadClose(); loadData(); }
      else showToast({ description: res?.message || "Upload failed", statusToast: "error" });
    },
  });

  // Edit document formik
  const editDocFormik = useFormik({
    initialValues: { id: "", reportName: "", reportDesc: "", reportNumber: "", reportVersion: "", reportUploadDate: "", linkAttachment: "" },
    enableReinitialize: true,
    validationSchema: Yup.object({ reportName: Yup.string().required("Document name is required"), reportVersion: Yup.string().required("Version is required") }),
    onSubmit: async (values) => {
      setActionLoading(true);
      const res = await UpdateDocument({ id: values.id, reportName: values.reportName, reportDesc: values.reportDesc || undefined, reportNumber: values.reportNumber || undefined, reportVersion: values.reportVersion, reportUploadDate: new Date(values.reportUploadDate).toISOString(), linkAttachment: values.linkAttachment || undefined }, tokenData);
      setActionLoading(false);
      if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Document updated", statusToast: "success" }); onEditDocClose(); loadData(); }
      else showToast({ description: res?.message || "Failed", statusToast: "error" });
    },
  });

  const handleEditDoc = (doc: AppsCriticalReportingDocumentResponse) => {
    editDocFormik.setValues({ id: doc.id, reportName: doc.reportName, reportDesc: doc.reportDesc || "", reportNumber: doc.reportNumber || "", reportVersion: doc.reportVersion, reportUploadDate: doc.reportUploadDate?.split("T")[0] || "", linkAttachment: doc.linkAttachment || "" });
    onEditDocOpen();
  };

  if (loading) return <LayoutAdmin><Box p={10} textAlign="center"><Spinner size="xl" color="purple.500" /></Box></LayoutAdmin>;

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Reporting Period Detail" breadCrumb={["Home", "Report", "Upload Report Assessments", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Page Header */}
          <HStack spacing={3}>
            <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm" onClick={() => router.push("/report/upload-report-assessments-apps")} />
            <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiFileText} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={isDark ? "white" : "gray.800"}>
                {data?.reportQuartal} {data?.reportYear}
              </Heading>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{data?.documentCount} document(s) uploaded</Text>
            </VStack>
            <Spacer />
            <Button colorScheme="red" variant="outline" size="sm" leftIcon={<FiTrash2 />} onClick={() => setIsDeletePeriodOpen(true)}>
              Delete Period
            </Button>
          </HStack>

          {/* Period Info Card */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={4} px={6}>
              <HStack justify="space-between">
                <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Period Information</Heading>
                {!isEditPeriod ? (
                  <Button size="sm" colorScheme="blue" leftIcon={<FiEdit />} onClick={() => setIsEditPeriod(true)}>Edit</Button>
                ) : (
                  <HStack>
                    <Button size="sm" colorScheme="green" leftIcon={<FiSave />} isLoading={actionLoading} onClick={() => editPeriodFormik.handleSubmit()}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { editPeriodFormik.resetForm(); setIsEditPeriod(false); }}>Cancel</Button>
                  </HStack>
                )}
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              <Flex as={Stack} spacing={4} p={2}>
                <FormControl>
                  <InputLayout>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"} mt={2}>Quarter</FormLabel>
                    <HStack><Badge colorScheme="purple" fontSize="sm" px={2}>{data?.reportQuartal}</Badge><Badge colorScheme="blue" variant="outline">{data?.reportYear}</Badge></HStack>
                  </InputLayout>
                </FormControl>
                <FormControl>
                  <InputLayout>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"} mt={2}>Report Time</FormLabel>
                    <Text fontSize="sm">{data?.reportTime ? new Date(data.reportTime).toLocaleString("id-ID") : "-"}</Text>
                  </InputLayout>
                </FormControl>
                <FormControl>
                  <InputLayoutFull>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"} mt={2}>Note</FormLabel>
                    {isEditPeriod ? (
                      <Textarea name="note" value={editPeriodFormik.values.note} onChange={editPeriodFormik.handleChange} rows={3} variant="filled" bg={isDark ? "gray.700" : "gray.50"} />
                    ) : (
                      <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>{data?.note || "-"}</Text>
                    )}
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </CardBody>
          </Card>

          {/* Documents Card */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={4} px={6}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Uploaded Documents</Heading>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{data?.documents?.length || 0} document(s)</Text>
                </VStack>
                <Button size="sm" colorScheme="purple" leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload Document</Button>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              {(data?.documents || []).length === 0 ? (
                <Box textAlign="center" py={8} color={isDark ? "gray.400" : "gray.500"}>
                  <Icon as={FiFile} boxSize={8} mb={3} opacity={0.4} />
                  <Text fontSize="sm">No documents uploaded yet. Click "Upload Document" to add one.</Text>
                </Box>
              ) : (
                <Stack spacing={3} p={2}>
                  {(data?.documents || []).map((doc, i) => (
                    <Flex key={doc.id} p={4} bg={isDark ? "gray.750" : "gray.50"} rounded="lg"
                      border="1px" borderColor={isDark ? "gray.600" : "gray.200"} gap={4} align="center">
                      <Flex w={10} h={10} bg={isDark ? "purple.900" : "purple.50"} rounded="lg"
                        alignItems="center" justifyContent="center" flexShrink={0}>
                        <Icon as={FiFile} color="purple.500" boxSize={5} />
                      </Flex>
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <HStack>
                          <Badge colorScheme="gray" variant="outline" fontSize="xs">#{i + 1}</Badge>
                          <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{doc.reportName}</Text>
                        </HStack>
                        <HStack spacing={2} flexWrap="wrap">
                          {doc.reportNumber && (
                            <HStack spacing={1}><Icon as={FiHash} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{doc.reportNumber}</Text></HStack>
                          )}
                          <Badge colorScheme="blue" variant="outline" fontSize="xs">v{doc.reportVersion}</Badge>
                          <HStack spacing={1}><Icon as={FiCalendar} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{new Date(doc.reportUploadDate).toLocaleDateString("id-ID")}</Text></HStack>
                        </HStack>
                        {doc.reportDesc && <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} noOfLines={1}>{doc.reportDesc}</Text>}
                      </VStack>
                      <HStack spacing={1} flexShrink={0}>
                        {(doc.fileUrl || doc.linkAttachment) && (
                          <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FiDownload />}
                            onClick={() => window.open(doc.linkAttachment || doc.fileUrl || "", "_blank")}>
                            Download
                          </Button>
                        )}
                        <IconButton aria-label="Edit" icon={<FiEdit />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleEditDoc(doc)} />
                        <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost"
                          onClick={() => { setDeletingDocId(doc.id); setIsDeleteDocOpen(true); }} />
                      </HStack>
                    </Flex>
                  ))}
                </Stack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => { uploadFormik.resetForm(); setUploadFile(null); setFilePreviewName(""); setAttachMethod("file"); onUploadClose(); }} size="lg">
        <ModalOverlay /><ModalContent rounded={radiusStyle} m={2} maxH="90vh">
          <form onSubmit={uploadFormik.handleSubmit}>
            <ModalHeader>Upload New Document</ModalHeader><ModalCloseButton color="red.500" />
            <ModalBody maxH="70vh" overflowY="auto" p={6}>
              <Flex as={Stack} w="full">
                <VStack spacing={4} align="stretch" w="full">
                  <FormControl isInvalid={!!(uploadFormik.errors.reportName && uploadFormik.touched.reportName)} isRequired>
                    <FormLabel>Document Name</FormLabel>
                    <Input name="reportName" placeholder="Enter document name" value={uploadFormik.values.reportName} onChange={uploadFormik.handleChange} onBlur={uploadFormik.handleBlur} isDisabled={actionLoading} />
                    <FormErrorMessage>{uploadFormik.errors.reportName}</FormErrorMessage>
                  </FormControl>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Document Number</FormLabel>
                        <Input name="reportNumber" placeholder="Optional" value={uploadFormik.values.reportNumber} onChange={uploadFormik.handleChange} isDisabled={actionLoading} />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Upload Date</FormLabel>
                        <Input type="date" name="reportUploadDate" value={uploadFormik.values.reportUploadDate} onChange={uploadFormik.handleChange} isDisabled={actionLoading} />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl isInvalid={!!(uploadFormik.errors.reportVersion && uploadFormik.touched.reportVersion)} isRequired>
                        <FormLabel>Version</FormLabel>
                        <Input name="reportVersion" placeholder="e.g. 1.0" value={uploadFormik.values.reportVersion} onChange={uploadFormik.handleChange} onBlur={uploadFormik.handleBlur} isDisabled={actionLoading} />
                        <FormErrorMessage>{uploadFormik.errors.reportVersion}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Input name="reportDesc" placeholder="Optional" value={uploadFormik.values.reportDesc} onChange={uploadFormik.handleChange} isDisabled={actionLoading} />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  {/* Attachment Method */}
                  <FormControl isRequired>
                    <FormLabel>Attachment Method</FormLabel>
                    <RadioGroup value={attachMethod} onChange={(v: "file" | "link") => {
                      setAttachMethod(v);
                      if (v === "file") uploadFormik.setFieldValue("linkAttachment", "");
                      else { setUploadFile(null); setFilePreviewName(""); }
                    }}>
                      <Stack direction="row" spacing={6}>
                        <Radio value="file" colorScheme="purple"><HStack spacing={2}><Icon as={FiUpload} /><Text>Upload File</Text></HStack></Radio>
                        <Radio value="link" colorScheme="purple"><HStack spacing={2}><Icon as={FiLink} /><Text>External Link</Text></HStack></Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  {/* Dropzone / Link input */}
                  {attachMethod === "file" ? (
                    <FormControl isRequired>
                      <FormLabel>Upload File</FormLabel>
                      <Flex {...getRootProps()} p={8} border="3px dashed" borderColor={isDragActive ? "purple.400" : isDark ? "gray.600" : "gray.300"}
                        rounded={radiusStyle} cursor="pointer" bg={isDragActive ? (isDark ? "purple.900" : "purple.50") : (isDark ? "gray.700" : "gray.50")}
                        textAlign="center" color={isDragActive ? "purple.600" : isDark ? "gray.300" : "gray.600"}
                        _hover={{ bg: isDark ? "purple.900" : "purple.50", borderColor: "purple.400", color: "purple.600" }}
                        w="full" minH="150px" justifyContent="center" alignItems="center" transition="all 0.2s" direction="column">
                        <input {...getInputProps()} />
                        <VStack spacing={2}>
                          <Icon as={FiUpload} boxSize={10} />
                          <Text fontSize="md" fontWeight="semibold">{isDragActive ? "Drop file here..." : "Drag & drop or click to select file"}</Text>
                          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, CSV (Max 120MB)</Text>
                        </VStack>
                      </Flex>
                      {uploadFile && (
                        <Box mt={3} p={3} border="1px" borderColor="green.200" rounded={radiusStyle} bg={isDark ? "green.900" : "green.50"}>
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Icon as={FiFile} boxSize={5} color="green.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">{uploadFile.name}</Text>
                                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>{(uploadFile.size / 1024).toFixed(2)} KB</Text>
                              </VStack>
                            </HStack>
                            <IconButton aria-label="Remove" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost"
                              onClick={() => { setUploadFile(null); setFilePreviewName(""); }} />
                          </HStack>
                        </Box>
                      )}
                    </FormControl>
                  ) : (
                    <FormControl isRequired>
                      <FormLabel>Link Attachment</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none"><Icon as={FiLink} color="gray.400" /></InputLeftElement>
                        <Input name="linkAttachment" value={uploadFormik.values.linkAttachment} onChange={uploadFormik.handleChange} placeholder="https://..." isDisabled={actionLoading} />
                      </InputGroup>
                    </FormControl>
                  )}
                </VStack>
              </Flex>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={() => { uploadFormik.resetForm(); setUploadFile(null); setFilePreviewName(""); setAttachMethod("file"); onUploadClose(); }}>Cancel</Button>
              <Button type="submit" colorScheme="purple" leftIcon={<FiUpload />} isLoading={actionLoading}>Upload</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Document Modal */}
      <Modal isOpen={isEditDocOpen} onClose={onEditDocClose} size="lg">
        <ModalOverlay /><ModalContent rounded={radiusStyle}>
          <form onSubmit={editDocFormik.handleSubmit}>
            <ModalHeader>Edit Document</ModalHeader><ModalCloseButton />
            <ModalBody><Stack spacing={4}>
              <FormControl isInvalid={!!(editDocFormik.errors.reportName && editDocFormik.touched.reportName)}>
                <FormLabel fontSize="sm">Document Name <Text as="span" color="red.400">*</Text></FormLabel>
                <Input name="reportName" value={editDocFormik.values.reportName} onChange={editDocFormik.handleChange} variant="filled" bg={isDark ? "gray.700" : "gray.50"} />
                <FormErrorMessage>{editDocFormik.errors.reportName}</FormErrorMessage>
              </FormControl>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem><FormControl><FormLabel fontSize="sm">Document Number</FormLabel><Input name="reportNumber" value={editDocFormik.values.reportNumber} onChange={editDocFormik.handleChange} variant="filled" bg={isDark ? "gray.700" : "gray.50"} /></FormControl></GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(editDocFormik.errors.reportVersion && editDocFormik.touched.reportVersion)}>
                    <FormLabel fontSize="sm">Version <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input name="reportVersion" value={editDocFormik.values.reportVersion} onChange={editDocFormik.handleChange} variant="filled" bg={isDark ? "gray.700" : "gray.50"} />
                    <FormErrorMessage>{editDocFormik.errors.reportVersion}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              <FormControl><FormLabel fontSize="sm">Upload Date</FormLabel><Input type="date" name="reportUploadDate" value={editDocFormik.values.reportUploadDate} onChange={editDocFormik.handleChange} variant="filled" bg={isDark ? "gray.700" : "gray.50"} /></FormControl>
              <FormControl><FormLabel fontSize="sm">Description</FormLabel><Textarea name="reportDesc" value={editDocFormik.values.reportDesc} onChange={editDocFormik.handleChange} rows={2} variant="filled" bg={isDark ? "gray.700" : "gray.50"} /></FormControl>
              <FormControl><FormLabel fontSize="sm">Link Attachment</FormLabel><Input name="linkAttachment" value={editDocFormik.values.linkAttachment} onChange={editDocFormik.handleChange} placeholder="https://..." variant="filled" bg={isDark ? "gray.700" : "gray.50"} /></FormControl>
            </Stack></ModalBody>
            <ModalFooter gap={2}><Button variant="ghost" onClick={onEditDocClose}>Cancel</Button><Button type="submit" colorScheme="blue" leftIcon={<FiEdit />} isLoading={actionLoading}>Update</Button></ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmationDialog isOpenTrigger={isDeleteDocOpen} trigger={setIsDeleteDocOpen}
        action={async () => { const res = await DeleteDocument(deletingDocId, tokenData); if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Document deleted", statusToast: "success" }); loadData(); } else showToast({ description: res?.message || "Failed", statusToast: "error" }); }}
        captionMsg="Delete Document" questionMsg="Are you sure you want to delete this document?" />

      <ConfirmationDialog isOpenTrigger={isDeletePeriodOpen} trigger={setIsDeletePeriodOpen}
        action={async () => { const res = await Delete(periodId!, tokenData); if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Period deleted", statusToast: "success" }); router.push("/report/upload-report-assessments-apps"); } else showToast({ description: res?.message || "Failed", statusToast: "error" }); }}
        captionMsg="Delete Reporting Period" questionMsg="Are you sure you want to delete this entire reporting period and all its documents?" />
    </LayoutAdmin>
  );
}
