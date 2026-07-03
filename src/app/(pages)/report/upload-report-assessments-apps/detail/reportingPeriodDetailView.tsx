"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReporting, {
  AppsCriticalReportingDocumentResponse,
  AppsCriticalReportingPeriodDetailResponse,
} from "@/app/services/useAppsCriticalReporting";
import {
  Badge, Box, Button, Card, CardBody, Divider, Flex, FormControl,
  FormErrorMessage, FormLabel, Grid, GridItem, HStack, Icon, IconButton,
  Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup,
  Spinner, Stack, Text, Textarea, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaArrowLeft } from "react-icons/fa6";
import { FiCalendar, FiDownload, FiEdit, FiFile, FiFileText, FiHash, FiLink, FiPlus, FiSave, FiTrash2, FiUpload, FiX } from "react-icons/fi";
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
  const [isEditNote, setIsEditNote] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [attachMethod, setAttachMethod] = useState<"file" | "link">("file");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false);
  const [isDeletePeriodOpen, setIsDeletePeriodOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState("");
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isEditDocOpen, onOpen: onEditDocOpen, onClose: onEditDocClose } = useDisclosure();

  const MAX_SIZE = 120 * 1024 * 1024;
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) setUploadFile(accepted[0]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxSize: MAX_SIZE, multiple: false,
    accept: { "application/pdf": [], "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [], "application/vnd.ms-excel": [], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], "application/vnd.ms-powerpoint": [], "application/vnd.openxmlformats-officedocument.presentationml.presentation": [], "application/zip": [], "application/x-rar-compressed": [], "text/csv": [] },
    onDropRejected: (f) => showToast({ description: f[0]?.errors?.[0]?.message || "File rejected", statusToast: "error" }),
  });

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
    if (res?.statusCode === RES_CODE_OK && res.data) { setData(res.data); setNoteValue(res.data.note || ""); }
    else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    setLoading(false);
  };

  useEffect(() => { if (tokenData) loadData(); }, [tokenData, periodId]);

  const handleSaveNote = async () => {
    if (!periodId) return;
    setActionLoading(true);
    const res = await Update({ id: periodId, note: noteValue || undefined }, tokenData);
    setActionLoading(false);
    if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Note updated", statusToast: "success" }); setIsEditNote(false); loadData(); }
    else showToast({ description: res?.message || "Failed", statusToast: "error" });
  };

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
      if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Document uploaded", statusToast: "success" }); resetForm(); setUploadFile(null); setAttachMethod("file"); onUploadClose(); loadData(); }
      else showToast({ description: res?.message || "Upload failed", statusToast: "error" });
    },
  });

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

  if (loading) return <LayoutAdmin><Box p={10} textAlign="center"><Spinner size="xl" color="teal.500" /></Box></LayoutAdmin>;

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Reporting Period Detail" breadCrumb={["Home", "Report", "Upload Report Assessments", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Colored Header Card — same as batch detail */}
          <Card rounded={radiusStyle} overflow="hidden" shadow="md" border="0">
            <Box bg="teal.600" px={6} py={5}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm" color="white"
                    _hover={{ bg: "whiteAlpha.200" }} onClick={() => router.push("/report/upload-report-assessments-apps")} />
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Badge bg="whiteAlpha.300" color="white" fontSize="md" px={3} py={1} rounded="md" fontWeight="bold">
                        {data?.reportQuartal} {data?.reportYear}
                      </Badge>
                    </HStack>
                    <HStack spacing={3}>
                      <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} rounded="md" fontSize="xs">
                        <Text as="span" color="whiteAlpha.700" mr={1}>Documents:</Text>{data?.documentCount || 0}
                      </Badge>
                      <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} rounded="md" fontSize="xs">
                        <Text as="span" color="whiteAlpha.700" mr={1}>Created:</Text>
                        {data?.reportTime ? new Date(data.reportTime).toLocaleDateString("id-ID") : "-"}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
                <HStack spacing={2}>
                  <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload Document</Button>
                  <Button size="sm" bg="red.400" color="white" _hover={{ bg: "red.500" }} leftIcon={<FiTrash2 />} onClick={() => setIsDeletePeriodOpen(true)}>Delete Period</Button>
                </HStack>
              </Flex>
            </Box>
          </Card>

          {/* Note Card */}
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardBody px={6} py={4}>
              <HStack justify="space-between" mb={isEditNote ? 3 : 0}>
                <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>Note</Text>
                {!isEditNote ? (
                  <Button size="xs" variant="ghost" colorScheme="teal" leftIcon={<FiEdit />} onClick={() => setIsEditNote(true)}>Edit</Button>
                ) : (
                  <HStack><Button size="xs" colorScheme="green" leftIcon={<FiSave />} isLoading={actionLoading} onClick={handleSaveNote}>Save</Button><Button size="xs" variant="ghost" leftIcon={<FiX />} onClick={() => { setIsEditNote(false); setNoteValue(data?.note || ""); }}>Cancel</Button></HStack>
                )}
              </HStack>
              {isEditNote ? (
                <Textarea value={noteValue} onChange={e => setNoteValue(e.target.value)} rows={3} size="sm" bg={isDark ? "gray.700" : "gray.50"} variant="filled" />
              ) : (
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{data?.note || <Text as="span" fontStyle="italic" color="gray.400">No note added</Text>}</Text>
              )}
            </CardBody>
          </Card>

          {/* Documents Card */}
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardBody p={0}>
              <Flex px={6} py={4} align="center" justify="space-between" borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold" fontSize="md" color={isDark ? "white" : "gray.800"}>Uploaded Documents</Text>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{data?.documents?.length || 0} document(s) in this period</Text>
                </VStack>
                <Button size="sm" colorScheme="teal" variant="outline" leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload</Button>
              </Flex>

              {(data?.documents || []).length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={12} color={isDark ? "gray.500" : "gray.400"}>
                  <Icon as={FiFileText} boxSize={12} mb={3} opacity={0.4} />
                  <Text fontSize="sm">No documents uploaded yet.</Text>
                  <Button mt={3} size="sm" colorScheme="teal" variant="ghost" leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload First Document</Button>
                </Flex>
              ) : (
                <Stack spacing={0} divider={<Divider borderColor={isDark ? "gray.700" : "gray.100"} />}>
                  {(data?.documents || []).map((doc, i) => (
                    <Flex key={doc.id} px={6} py={4} align="center" gap={4}
                      _hover={{ bg: isDark ? "gray.750" : "gray.50" }} transition="background 0.15s">
                      <Flex w={10} h={10} bg={isDark ? "teal.900" : "teal.50"} rounded="lg"
                        alignItems="center" justifyContent="center" flexShrink={0}>
                        <Icon as={FiFile} color="teal.500" boxSize={5} />
                      </Flex>
                      <VStack align="start" spacing={0.5} flex={1} minW={0}>
                        <HStack spacing={2}>
                          <Badge colorScheme="gray" variant="subtle" fontSize="2xs">#{i + 1}</Badge>
                          <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{doc.reportName}</Text>
                        </HStack>
                        <HStack spacing={3} flexWrap="wrap">
                          {doc.reportNumber && <HStack spacing={1}><Icon as={FiHash} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{doc.reportNumber}</Text></HStack>}
                          <Badge colorScheme="teal" variant="outline" fontSize="xs">v{doc.reportVersion}</Badge>
                          <HStack spacing={1}><Icon as={FiCalendar} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{new Date(doc.reportUploadDate).toLocaleDateString("id-ID")}</Text></HStack>
                          {doc.reportDesc && <Text fontSize="xs" color={isDark ? "gray.500" : "gray.400"} noOfLines={1} maxW="200px">— {doc.reportDesc}</Text>}
                        </HStack>
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
      <Modal isOpen={isUploadOpen} onClose={() => { uploadFormik.resetForm(); setUploadFile(null); setAttachMethod("file"); onUploadClose(); }} size="lg">
        <ModalOverlay /><ModalContent rounded={radiusStyle} m={2} maxH="90vh">
          <form onSubmit={uploadFormik.handleSubmit}>
            <ModalHeader>Upload New Document</ModalHeader><ModalCloseButton color="red.500" />
            <ModalBody maxH="70vh" overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch" w="full">
                <FormControl isInvalid={!!(uploadFormik.errors.reportName && uploadFormik.touched.reportName)} isRequired>
                  <FormLabel>Document Name</FormLabel>
                  <Input name="reportName" placeholder="Enter document name" value={uploadFormik.values.reportName} onChange={uploadFormik.handleChange} onBlur={uploadFormik.handleBlur} />
                  <FormErrorMessage>{uploadFormik.errors.reportName}</FormErrorMessage>
                </FormControl>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem><FormControl><FormLabel>Document Number</FormLabel><Input name="reportNumber" placeholder="Optional" value={uploadFormik.values.reportNumber} onChange={uploadFormik.handleChange} /></FormControl></GridItem>
                  <GridItem><FormControl><FormLabel>Upload Date</FormLabel><Input type="date" name="reportUploadDate" value={uploadFormik.values.reportUploadDate} onChange={uploadFormik.handleChange} /></FormControl></GridItem>
                </Grid>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl isInvalid={!!(uploadFormik.errors.reportVersion && uploadFormik.touched.reportVersion)} isRequired>
                      <FormLabel>Version</FormLabel>
                      <Input name="reportVersion" placeholder="e.g. 1.0" value={uploadFormik.values.reportVersion} onChange={uploadFormik.handleChange} onBlur={uploadFormik.handleBlur} />
                      <FormErrorMessage>{uploadFormik.errors.reportVersion}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem><FormControl><FormLabel>Description</FormLabel><Input name="reportDesc" placeholder="Optional" value={uploadFormik.values.reportDesc} onChange={uploadFormik.handleChange} /></FormControl></GridItem>
                </Grid>
                <FormControl isRequired>
                  <FormLabel>Attachment Method</FormLabel>
                  <RadioGroup value={attachMethod} onChange={(v: "file" | "link") => { setAttachMethod(v); if (v === "file") uploadFormik.setFieldValue("linkAttachment", ""); else setUploadFile(null); }}>
                    <Stack direction="row" spacing={6}>
                      <Radio value="file" colorScheme="teal"><HStack spacing={2}><Icon as={FiUpload} /><Text>Upload File</Text></HStack></Radio>
                      <Radio value="link" colorScheme="teal"><HStack spacing={2}><Icon as={FiLink} /><Text>External Link</Text></HStack></Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                {attachMethod === "file" ? (
                  <FormControl isRequired>
                    <FormLabel>Upload File</FormLabel>
                    <Flex {...getRootProps()} p={8} border="3px dashed" borderColor={isDragActive ? "teal.400" : isDark ? "gray.600" : "gray.300"}
                      rounded={radiusStyle} cursor="pointer" bg={isDragActive ? (isDark ? "teal.900" : "teal.50") : (isDark ? "gray.700" : "gray.50")}
                      textAlign="center" color={isDragActive ? "teal.600" : isDark ? "gray.300" : "gray.600"}
                      _hover={{ bg: isDark ? "teal.900" : "teal.50", borderColor: "teal.400", color: "teal.600" }}
                      w="full" minH="150px" justifyContent="center" alignItems="center" transition="all 0.2s" direction="column">
                      <input {...getInputProps()} />
                      <VStack spacing={2}>
                        <Icon as={FiUpload} boxSize={10} />
                        <Text fontSize="md" fontWeight="semibold">{isDragActive ? "Drop file here..." : "Drag & drop or click to select file"}</Text>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, CSV (Max 120MB)</Text>
                      </VStack>
                    </Flex>
                    {uploadFile && (
                      <Flex mt={3} p={3} border="1px" borderColor="teal.200" rounded={radiusStyle} bg={isDark ? "teal.900" : "teal.50"} align="center" justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={FiFile} boxSize={5} color="teal.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm">{uploadFile.name}</Text>
                            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>{(uploadFile.size / 1024).toFixed(2)} KB</Text>
                          </VStack>
                        </HStack>
                        <IconButton aria-label="Remove" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => setUploadFile(null)} />
                      </Flex>
                    )}
                  </FormControl>
                ) : (
                  <FormControl isRequired>
                    <FormLabel>Link Attachment</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none"><Icon as={FiLink} color="gray.400" /></InputLeftElement>
                      <Input name="linkAttachment" value={uploadFormik.values.linkAttachment} onChange={uploadFormik.handleChange} placeholder="https://..." />
                    </InputGroup>
                  </FormControl>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={() => { uploadFormik.resetForm(); setUploadFile(null); setAttachMethod("file"); onUploadClose(); }}>Cancel</Button>
              <Button type="submit" colorScheme="teal" leftIcon={<FiUpload />} isLoading={actionLoading}>Upload</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Document Modal */}
      <Modal isOpen={isEditDocOpen} onClose={onEditDocClose} size="lg">
        <ModalOverlay /><ModalContent rounded={radiusStyle}>
          <form onSubmit={editDocFormik.handleSubmit}>
            <ModalHeader>Edit Document</ModalHeader><ModalCloseButton />
            <ModalBody><VStack spacing={4}>
              <FormControl isInvalid={!!(editDocFormik.errors.reportName && editDocFormik.touched.reportName)} isRequired>
                <FormLabel>Document Name</FormLabel>
                <Input name="reportName" value={editDocFormik.values.reportName} onChange={editDocFormik.handleChange} />
                <FormErrorMessage>{editDocFormik.errors.reportName}</FormErrorMessage>
              </FormControl>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem><FormControl><FormLabel>Document Number</FormLabel><Input name="reportNumber" value={editDocFormik.values.reportNumber} onChange={editDocFormik.handleChange} /></FormControl></GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(editDocFormik.errors.reportVersion && editDocFormik.touched.reportVersion)} isRequired>
                    <FormLabel>Version</FormLabel>
                    <Input name="reportVersion" value={editDocFormik.values.reportVersion} onChange={editDocFormik.handleChange} />
                    <FormErrorMessage>{editDocFormik.errors.reportVersion}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem><FormControl><FormLabel>Upload Date</FormLabel><Input type="date" name="reportUploadDate" value={editDocFormik.values.reportUploadDate} onChange={editDocFormik.handleChange} /></FormControl></GridItem>
                <GridItem><FormControl><FormLabel>Description</FormLabel><Input name="reportDesc" value={editDocFormik.values.reportDesc} onChange={editDocFormik.handleChange} /></FormControl></GridItem>
              </Grid>
              <FormControl><FormLabel>Link Attachment</FormLabel><InputGroup><InputLeftElement pointerEvents="none"><Icon as={FiLink} color="gray.400" /></InputLeftElement><Input name="linkAttachment" value={editDocFormik.values.linkAttachment} onChange={editDocFormik.handleChange} placeholder="https://..." /></InputGroup></FormControl>
            </VStack></ModalBody>
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
