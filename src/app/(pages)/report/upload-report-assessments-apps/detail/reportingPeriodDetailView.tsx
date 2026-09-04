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
import useMediaObject from "@/app/services/useMediaObject";
import { useDownloadManagerModal } from "@/app/context/DownloadManagerContext";
import {
  Badge, Box, Button, Card, CardBody, Divider, Flex, FormControl,
  FormErrorMessage, FormLabel, Grid, GridItem, HStack, Icon, IconButton,
  Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup,
  Spinner, Stack, Text, Textarea, Heading, useColorMode, useDisclosure, VStack,
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
  const { SecureDownloadFiles, error: secureDownloadError } = useMediaObject();
  const { openDownloadManager, activeJobsCount } = useDownloadManagerModal();

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
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
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
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setData(res.data);
      setNoteValue(res.data.note || "");
    }
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

  const handleDownloadDocument = async (doc: AppsCriticalReportingDocumentResponse) => {
    // If it's an external link attachment, open in new tab
    if (doc.linkAttachment) {
      window.open(doc.linkAttachment, "_blank");
      return;
    }

    if (!doc.mediaObjectId) {
      if (doc.fileUrl) {
        window.open(doc.fileUrl, "_blank");
      } else {
        showToast({
          description: "Tidak ada file yang dapat diunduh",
          statusToast: "warning",
        });
      }
      return;
    }

    if (!tokenData) {
      showToast({
        description: "Autentikasi diperlukan. Silakan login kembali.",
        statusToast: "error",
      });
      return;
    }

    setDownloadingDocId(doc.id);
    try {
      const rawName = doc.fileName || doc.reportName || "document";
      const baseName = rawName.replace(/\.[^/.]+$/, "");
      const zipFileName = `${baseName}.zip`;

      const blob = await SecureDownloadFiles(
        [doc.mediaObjectId],
        tokenData,
        doc.id,
        "AppsCriticalReporting",
        zipFileName
      );

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast({
          description: "File berhasil diunduh. Password ZIP telah dikirim ke email Anda.",
          statusToast: "success",
        });
      } else {
        showToast({
          description: secureDownloadError || "Gagal mengunduh file",
          statusToast: "error",
        });
      }
    } catch (err: any) {
      showToast({
        description: err?.message || "Terjadi kesalahan saat mengunduh file",
        statusToast: "error",
      });
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (loading) return <LayoutAdmin><Box p={10} textAlign="center"><Spinner size="xl" color="secondary.500" /></Box></LayoutAdmin>;

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Reporting Period Detail" breadCrumb={["Home", "Report", "Upload Report Assessments", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Colored Header Card — same as batch detail */}
          <Card rounded={radiusStyle} overflow="hidden" shadow="md" border="0">
            <Box bg="secondary.500" px={6} py={5}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm" color="white"
                    _hover={{ bg: "whiteAlpha.200" }} onClick={() => router.push("/report/upload-report-assessments-apps")} />
                  <VStack align="start" spacing={2}>
                    <Box bg="white" px={4} py={1.5} rounded="lg">
                      <Text fontSize="lg" fontWeight="bold" color="secondary.600" letterSpacing="-0.5px">
                        {data?.reportQuartal} {data?.reportYear}
                      </Text>
                    </Box>
                    <HStack spacing={3}>
                      <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} rounded="md" fontSize="xs">
                        <Text as="span" color="whiteAlpha.700" mr={1}>Uploaded:</Text>{data?.documentCount || 0} file(s)
                      </Badge>
                      <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} rounded="md" fontSize="xs">
                        <Text as="span" color="whiteAlpha.700" mr={1}>Created:</Text>
                        {data?.reportTime ? new Date(data.reportTime).toLocaleDateString("id-ID") : "-"}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    leftIcon={<FiDownload />}
                    onClick={openDownloadManager}
                  >
                    Download Manager
                    {activeJobsCount > 0 && (
                      <Badge colorScheme="blue" rounded="full" ml={2} px={1.5}>
                        {activeJobsCount}
                      </Badge>
                    )}
                  </Button>
                  <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload Document</Button>
                  <Button size="sm" bg="red.400" color="white" _hover={{ bg: "red.500" }} leftIcon={<FiTrash2 />} onClick={() => setIsDeletePeriodOpen(true)}>Delete Period</Button>
                </HStack>
              </Flex>
            </Box>
          </Card>

          {/* Note Card */}
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardBody px={6} py={5}>
              <Flex justify="space-between" align="start" mb={3}>
                <HStack spacing={2}>
                  <Box w="4px" h="20px" bg="secondary.400" rounded="full" />
                  <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.700"}>Description / Note</Text>
                </HStack>
                {!isEditNote ? (
                  <Button size="xs" variant="outline" colorScheme="blue" leftIcon={<FiEdit />} onClick={() => setIsEditNote(true)}>Edit</Button>
                ) : (
                  <HStack spacing={2}>
                    <Button size="xs" colorScheme="green" leftIcon={<FiSave />} isLoading={actionLoading} onClick={handleSaveNote}>Save</Button>
                    <Button size="xs" variant="ghost" leftIcon={<FiX />} onClick={() => { setIsEditNote(false); setNoteValue(data?.note || ""); }}>Cancel</Button>
                  </HStack>
                )}
              </Flex>
              {isEditNote ? (
                <Textarea value={noteValue} onChange={e => setNoteValue(e.target.value)} rows={4} size="sm" bg={isDark ? "gray.700" : "gray.50"} rounded="lg" borderColor={isDark ? "gray.600" : "gray.200"} _focus={{ borderColor: "secondary.400", boxShadow: "0 0 0 1px var(--chakra-colors-secondary-400)" }} />
              ) : (
                <Box bg={isDark ? "gray.750" : "secondary.50"} rounded="lg" px={5} py={4}>
                  {data?.note ? (
                    <Text fontSize="sm" color={isDark ? "gray.200" : "gray.700"} lineHeight="1.7" whiteSpace="pre-wrap">{data.note}</Text>
                  ) : (
                    <Text fontSize="sm" fontStyle="italic" color={isDark ? "gray.500" : "gray.400"}>No note added — click Edit to add a description for this reporting period.</Text>
                  )}
                </Box>
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
                <Button size="sm" colorScheme="blue" variant="outline" leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload</Button>
              </Flex>

              {(data?.documents || []).length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={12} color={isDark ? "gray.500" : "gray.400"}>
                  <Icon as={FiFileText} boxSize={12} mb={3} opacity={0.4} />
                  <Text fontSize="sm">No documents uploaded yet.</Text>
                  <Button mt={3} size="sm" colorScheme="blue" variant="ghost" leftIcon={<FiPlus />} onClick={onUploadOpen}>Upload First Document</Button>
                </Flex>
              ) : (
                <Box px={6} py={4}>
                  {(data?.documents || []).map((doc, i) => (
                    <Grid key={doc.id} templateColumns="48px 1fr 130px" gap={0} position="relative"
                      minH="72px" py={3} alignItems="flex-start"
                      _hover={{ bg: isDark ? "gray.750" : "gray.50" }} rounded="md" transition="background 0.15s">
                      {/* Left: Icon column (48px) */}
                      <Flex direction="column" align="center" h="full" position="relative">
                        {i < (data?.documents?.length || 0) - 1 && (
                          <Box position="absolute" top="36px" bottom="-12px" w="2px" bg={isDark ? "gray.600" : "gray.200"} />
                        )}
                        <Flex w="32px" h="32px" rounded="full" bg={isDark ? "secondary.900" : "secondary.50"} border="2px" borderColor="secondary.400"
                          alignItems="center" justifyContent="center" flexShrink={0} zIndex={1}>
                          <Icon as={FiFile} color="secondary.500" boxSize={3.5} />
                        </Flex>
                      </Flex>
                      {/* Center: Content column (flex: 1), gap 16px from icon */}
                      <Box pl={2}>
                        <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>{doc.reportName}</Text>
                        <HStack spacing={2} mt={1} flexWrap="wrap">
                          {doc.reportNumber && <HStack spacing={1}><Icon as={FiHash} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{doc.reportNumber}</Text></HStack>}
                          <Badge colorScheme="blue" variant="subtle" fontSize="xs">v{doc.reportVersion}</Badge>
                          <HStack spacing={1}><Icon as={FiCalendar} boxSize={3} color="gray.400" /><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{new Date(doc.reportUploadDate).toLocaleDateString("id-ID")}</Text></HStack>
                        </HStack>
                        {doc.reportDesc && <Text fontSize="xs" color={isDark ? "gray.500" : "gray.400"} mt="4px">{doc.reportDesc}</Text>}
                        {doc.fileName && <Text fontSize="2xs" color={isDark ? "gray.500" : "gray.400"} fontFamily="mono" mt="2px">{doc.fileName}</Text>}
                      </Box>
                      {/* Right: Action group (fixed 130px, vertically centered, right-aligned) */}
                      <HStack spacing="10px" justify="flex-end" align="center" minH="32px" w="130px">
                        {(doc.mediaObjectId || doc.fileUrl || doc.linkAttachment) && (
                          <IconButton
                            aria-label="Download"
                            icon={<FiDownload />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            isLoading={downloadingDocId === doc.id}
                            isDisabled={downloadingDocId !== null}
                            onClick={() => handleDownloadDocument(doc)}
                          />
                        )}
                        <IconButton aria-label="Edit" icon={<FiEdit />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleEditDoc(doc)} />
                        <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost"
                          onClick={() => { setDeletingDocId(doc.id); setIsDeleteDocOpen(true); }} />
                      </HStack>
                    </Grid>
                  ))}
                </Box>
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
                      <Radio value="file" colorScheme="blue"><HStack spacing={2}><Icon as={FiUpload} /><Text>Upload File</Text></HStack></Radio>
                      <Radio value="link" colorScheme="blue"><HStack spacing={2}><Icon as={FiLink} /><Text>External Link</Text></HStack></Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                {attachMethod === "file" ? (
                  <FormControl isRequired>
                    <FormLabel>Upload File</FormLabel>
                    <Flex {...getRootProps()} p={8} border="3px dashed" borderColor={isDragActive ? "secondary.400" : isDark ? "gray.600" : "gray.300"}
                      rounded={radiusStyle} cursor="pointer" bg={isDragActive ? (isDark ? "secondary.900" : "secondary.50") : (isDark ? "gray.700" : "gray.50")}
                      textAlign="center" color={isDragActive ? "secondary.500" : isDark ? "gray.300" : "gray.600"}
                      _hover={{ bg: isDark ? "secondary.900" : "secondary.50", borderColor: "secondary.400", color: "secondary.500" }}
                      w="full" minH="150px" justifyContent="center" alignItems="center" transition="all 0.2s" direction="column">
                      <input {...getInputProps()} />
                      <VStack spacing={2}>
                        <Icon as={FiUpload} boxSize={10} />
                        <Text fontSize="md" fontWeight="semibold">{isDragActive ? "Drop file here..." : "Drag & drop or click to select file"}</Text>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, CSV (Max 120MB)</Text>
                      </VStack>
                    </Flex>
                    {uploadFile && (
                      <Flex mt={3} p={3} border="1px" borderColor="secondary.200" rounded={radiusStyle} bg={isDark ? "secondary.900" : "secondary.50"} align="center" justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={FiFile} boxSize={5} color="secondary.500" />
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
              <Button type="submit" colorScheme="blue" leftIcon={<FiUpload />} isLoading={actionLoading}>Upload</Button>
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
