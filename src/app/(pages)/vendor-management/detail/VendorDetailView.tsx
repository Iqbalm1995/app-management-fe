"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, { VendorResponse, VendorTdrResponse, VendorUpdatePayload } from "@/app/services/useVendor";
import useMediaObject from "@/app/services/useMediaObject";
import { TabButtonCustomStyle, TabButtonCustomStyleHighLight } from "@/app/components/TabsCustom";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  TabPanels,
  TabPanel,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  RadioGroup,
  Radio,
  TabList,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiGlobe,
  FiInfo,
  FiFileText,
  FiMapPin,
  FiRefreshCcw,
  FiShield,
  FiTag,
  FiUser,
  FiPlus,
  FiUpload,
  FiLink,
  FiLayers,
  FiClock,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiEye,
  FiCalendar,
  FiSettings,
  FiEdit3,
  FiSlash,
  FiAlertCircle,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";
import { useDropzone } from "react-dropzone";

const HeaderDataContent = {
  titleName: "Vendor Detail",
  breadCrumb: ["Home", "Vendor Management", "Detail"],
};

const VendorDetailView = () => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("id");
  const showToast = useToastHelper();
  const { GetDetailById, InsertTdr, UpdateTdr, DeleteTdrMedia, ListTdr, Update } = useVendor();

  const [tokenData, setTokenData] = useState<string>("");
  const [DataVendor, setDataVendor] = useState<VendorResponse | null>(null);
  const [IsLoading, setIsLoading] = useState(true);

  // TDR list state
  const [TdrList, setTdrList] = useState<VendorTdrResponse[]>([]);
  const [TdrSortDir, setTdrSortDir] = useState<"desc" | "asc">("desc");
  const [IsTdrLoading, setIsTdrLoading] = useState(false);

  // Edit Vendor Master Data State
  const [editVendorForm, setEditVendorForm] = useState<VendorUpdatePayload>({
    id: "",
    vendorCode: "",
    vendorName: "",
    vendorType: "PT",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    country: "",
    postalCode: "",
    website: "",
    picBusinessName: "",
    picBusinessEmail: "",
    picBusinessNumberHotline: "",
    picTechnicalName: "",
    picTechnicalEmail: "",
    picTechnicalNumberHotline: "",
    status: "ACTIVE",
    reasonStatus: "",
    depedencyLevel: "LOW",
    businessImpact: "LOW",
  });
  const [isUpdatingVendor, setIsUpdatingVendor] = useState(false);

  // Vendor Status Change Modal State
  const statusConfirmModal = useDisclosure();
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [statusReasonInput, setStatusReasonInput] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTdrList = async (sortDir: "desc" | "asc" = TdrSortDir) => {
    if (!tokenData || !vendorId) return;
    setIsTdrLoading(true);
    const res = await ListTdr(
      {
        page: 1,
        limit: 100,
        search: "",
        filterWhere: [{ field: "vendorId", operator: "=", value: vendorId }],
        fieldOrder: ["createdAt"],
        orderDir: sortDir,
      },
      tokenData
    );
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setTdrList(res.data);
    }
    setIsTdrLoading(false);
  };

  const toggleTdrSort = () => {
    const newDir = TdrSortDir === "desc" ? "asc" : "desc";
    setTdrSortDir(newDir);
    loadTdrList(newDir);
  };

  // Horizontal Tab Scroll Ref
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // TDR Modal state
  const tdrModal = useDisclosure();
  const [tdrForm, setTdrForm] = useState({
    trdNumber: "", tdrType: "PERMANENT", npwpNumber: "", yearRegistered: "",
    businessType: "", businessSectorCode: "", businessSectorName: "",
    subBusinessSector: "", qualifications: "", timeInEffect: "", expiredAt: "",
  });
  const [attachmentMethod, setAttachmentMethod] = useState<"file" | "link">("file");
  const [tdrFile, setTdrFile] = useState<File | null>(null);
  const [tdrLink, setTdrLink] = useState("");
  const [isSubmittingTdr, setIsSubmittingTdr] = useState(false);

  // TDR Detail/Edit Modal
  const tdrDetailModal = useDisclosure();
  const [selectedTdr, setSelectedTdr] = useState<VendorTdrResponse | null>(null);
  const [isEditingTdr, setIsEditingTdr] = useState(false);
  const [editTdrForm, setEditTdrForm] = useState<any>({});
  const [isUpdatingTdr, setIsUpdatingTdr] = useState(false);
  const [isDownloadingTdr, setIsDownloadingTdr] = useState(false);
  const { SecureDownloadFiles } = useMediaObject();

  const handleOpenTdrDetail = (tdr: VendorTdrResponse) => {
    setSelectedTdr(tdr);
    setEditTdrForm({
      trdNumber: tdr.trdNumber, tdrType: tdr.tdrType, npwpNumber: tdr.npwpNumber,
      yearRegistered: tdr.yearRegistered, businessType: tdr.businessType,
      businessSectorCode: tdr.businessSectorCode, businessSectorName: tdr.businessSectorName,
      subBusinessSector: tdr.subBusinessSector || "", qualifications: tdr.qualifications || "",
      timeInEffect: tdr.timeInEffect?.split("T")[0] || "", expiredAt: tdr.expiredAt?.split("T")[0] || "",
    });
    setIsEditingTdr(false);
    tdrDetailModal.onOpen();
  };

  const handleUpdateTdr = async () => {
    if (!selectedTdr || !tokenData) return;
    setIsUpdatingTdr(true);
    const formData = new FormData();
    formData.append("Id", selectedTdr.id);
    formData.append("TrdNumber", editTdrForm.trdNumber);
    formData.append("TdrType", editTdrForm.tdrType);
    formData.append("NpwpNumber", editTdrForm.npwpNumber);
    formData.append("YearRegistered", editTdrForm.yearRegistered);
    formData.append("BusinessType", editTdrForm.businessType);
    formData.append("BusinessSectorCode", editTdrForm.businessSectorCode);
    formData.append("BusinessSectorName", editTdrForm.businessSectorName);
    if (editTdrForm.subBusinessSector) formData.append("SubBusinessSector", editTdrForm.subBusinessSector);
    if (editTdrForm.qualifications) formData.append("Qualifications", editTdrForm.qualifications);
    formData.append("TimeInEffect", editTdrForm.timeInEffect);
    formData.append("ExpiredAt", editTdrForm.expiredAt);
    if (editTdrFile) formData.append("File", editTdrFile);

    const res = await UpdateTdr(formData, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "TDR updated successfully", statusToast: "success" });
      setIsEditingTdr(false);
      setEditTdrFile(null);
      tdrDetailModal.onClose();
      loadVendorDetail();
      loadTdrList();
    } else {
      showToast({ description: res?.message || "Failed to update TDR", statusToast: "error" });
    }
    setIsUpdatingTdr(false);
  };

  const handleDownloadTdrFile = async (mediaId: string, fileName: string) => {
    if (!tokenData) return;
    setIsDownloadingTdr(true);
    const blob = await SecureDownloadFiles([mediaId], tokenData, selectedTdr?.id, "Vendor_TDR", `${fileName}.zip`);
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast({ description: "File successfully downloaded. Password sent to your email.", statusToast: "success" });
    } else {
      showToast({ description: "Failed to download file", statusToast: "error" });
    }
    setIsDownloadingTdr(false);
  };

  // Edit-mode file for TDR detail modal
  const [editTdrFile, setEditTdrFile] = useState<File | null>(null);
  const editDropzone = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    onDrop: (accepted) => { if (accepted.length > 0) setEditTdrFile(accepted[0]); },
  });

  const handleDeleteTdrMedia = async (relId: string) => {
    if (!tokenData) return;
    const res = await DeleteTdrMedia(relId, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Attachment deleted", statusToast: "success" });
      loadVendorDetail();
      loadTdrList();
      if (selectedTdr) {
        setSelectedTdr({ ...selectedTdr, mediaList: selectedTdr.mediaList.filter(m => m.relId !== relId) });
      }
    } else {
      showToast({ description: res?.message || "Failed to delete", statusToast: "error" });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    onDrop: (accepted) => { if (accepted.length > 0) setTdrFile(accepted[0]); },
  });

  const handleSubmitTdr = async () => {
    if (!tokenData || !DataVendor) return;
    setIsSubmittingTdr(true);
    const formData = new FormData();
    formData.append("VendorId", DataVendor.id);
    formData.append("TrdNumber", tdrForm.trdNumber);
    formData.append("TdrType", tdrForm.tdrType);
    formData.append("NpwpNumber", tdrForm.npwpNumber);
    formData.append("YearRegistered", tdrForm.yearRegistered);
    formData.append("BusinessType", tdrForm.businessType);
    formData.append("BusinessSectorCode", tdrForm.businessSectorCode);
    formData.append("BusinessSectorName", tdrForm.businessSectorName);
    if (tdrForm.subBusinessSector) formData.append("SubBusinessSector", tdrForm.subBusinessSector);
    if (tdrForm.qualifications) formData.append("Qualifications", tdrForm.qualifications);
    formData.append("TimeInEffect", tdrForm.timeInEffect);
    formData.append("ExpiredAt", tdrForm.expiredAt);
    if (attachmentMethod === "file" && tdrFile) formData.append("File", tdrFile);
    if (attachmentMethod === "link" && tdrLink) formData.append("LinkAttachment", tdrLink);

    const res = await InsertTdr(formData, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "TDR registered successfully", statusToast: "success" });
      tdrModal.onClose();
      setTdrForm({ trdNumber: "", tdrType: "PERMANENT", npwpNumber: "", yearRegistered: "", businessType: "", businessSectorCode: "", businessSectorName: "", subBusinessSector: "", qualifications: "", timeInEffect: "", expiredAt: "" });
      setTdrFile(null);
      setTdrLink("");
      loadVendorDetail();
      loadTdrList();
    } else {
      showToast({ description: res?.message || "Failed to register TDR", statusToast: "error" });
    }
    setIsSubmittingTdr(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  useEffect(() => {
    if (tokenData && vendorId) {
      loadVendorDetail();
      loadTdrList();
    }
  }, [tokenData, vendorId]);

  const loadVendorDetail = async () => {
    setIsLoading(true);
    const response = await GetDetailById(vendorId!, tokenData);
    if (response?.statusCode === RES_CODE_OK && response.data) {
      setDataVendor(response.data);
      // Initialize edit form
      setEditVendorForm({
        id: response.data.id,
        vendorCode: response.data.vendorCode,
        vendorName: response.data.vendorName,
        vendorType: response.data.vendorType || "PT",
        address1: response.data.address1,
        address2: response.data.address2 || "",
        address3: response.data.address3 || "",
        city: response.data.city,
        country: response.data.country,
        postalCode: response.data.postalCode || "",
        website: response.data.website || "",
        picBusinessName: response.data.picBusinessName,
        picBusinessEmail: response.data.picBusinessEmail,
        picBusinessNumberHotline: response.data.picBusinessNumberHotline || "",
        picTechnicalName: response.data.picTechnicalName,
        picTechnicalEmail: response.data.picTechnicalEmail,
        picTechnicalNumberHotline: response.data.picTechnicalNumberHotline || "",
        status: response.data.status,
        reasonStatus: response.data.reasonStatus || "",
        depedencyLevel: response.data.depedencyLevel || "LOW",
        businessImpact: response.data.businessImpact || "LOW",
      });
      if (response.data.tdrList && response.data.tdrList.length > 0) {
        setTdrList(response.data.tdrList);
      }
    } else {
      showToast({ description: response?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    }
    setIsLoading(false);
  };

  const handleUpdateVendorMaster = async () => {
    if (!tokenData || !editVendorForm.id) return;
    setIsUpdatingVendor(true);
    const res = await Update(editVendorForm, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Vendor master details updated successfully", statusToast: "success" });
      loadVendorDetail();
    } else {
      showToast({ description: res?.message || "Failed to update vendor", statusToast: "error" });
    }
    setIsUpdatingVendor(false);
  };

  const handleOpenStatusConfirm = (newStatus: string) => {
    setTargetStatus(newStatus);
    setStatusReasonInput(DataVendor?.reasonStatus || "");
    statusConfirmModal.onOpen();
  };

  const handleConfirmStatusChange = async () => {
    if (!tokenData || !DataVendor || !targetStatus) return;
    setIsUpdatingStatus(true);
    const payload: VendorUpdatePayload = {
      ...editVendorForm,
      id: DataVendor.id,
      status: targetStatus,
      reasonStatus: statusReasonInput,
    };

    const res = await Update(payload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: `Vendor status successfully changed to ${targetStatus}`, statusToast: "success" });
      statusConfirmModal.onClose();
      loadVendorDetail();
    } else {
      showToast({ description: res?.message || "Failed to change vendor status", statusToast: "error" });
    }
    setIsUpdatingStatus(false);
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "green";
      case "INACTIVE": return "gray";
      case "BLACKLIST": return "red";
      default: return "blue";
    }
  };

  if (IsLoading) {
    return (
      <LayoutAdmin>
        <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />
        <Flex justify="center" align="center" minH="450px">
          <LoadingMiniSignature />
        </Flex>
      </LayoutAdmin>
    );
  }

  if (!DataVendor) {
    return (
      <LayoutAdmin>
        <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />
        <Flex justify="center" align="center" minH="450px" direction="column" gap={4}>
          <Text color="gray.500" fontSize="lg" fontWeight="500">Vendor record not found</Text>
          <Button colorScheme="blue" onClick={() => router.push("/vendor-management")} leftIcon={<FiArrowLeft />}>
            Return to Vendor List
          </Button>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Hero Header Banner */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
        mt={{ base: 2, md: 3 }}
        mb={{ base: 5, md: 6 }}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="xl"
        _before={{
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          bgGradient: "linear(45deg, whiteAlpha.100 0%, transparent 50%, whiteAlpha.150 100%)",
          zIndex: 0,
        }}
      >
        {/* BJB Logo Watermark */}
        <Box
          position="absolute"
          bottom={{ base: 2, md: 4 }}
          right={{ base: 4, md: 6 }}
          zIndex={3}
          opacity={0.65}
        >
          <Box
            as="img"
            src="/img/logo-bjb-black-wing.svg"
            alt="BJB Logo"
            w={{ base: "45px", md: "65px" }}
            h="auto"
            filter="brightness(0) invert(1)"
          />
        </Box>

        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          {/* Top Navigation Bar */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Link href="/vendor-management">
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.300", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={4}
                  transition="all 0.2s ease"
                >
                  Back to List
                </Button>
              </Link>
            </HStack>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiRefreshCcw />}
                variant="outline"
                size="sm"
                onClick={loadVendorDetail}
                isLoading={IsLoading}
                borderColor="whiteAlpha.300"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.400", transform: "translateY(-1px)" }}
                rounded="full"
                px={3.5}
                transition="all 0.2s ease"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Vendor Banner Info Header */}
          <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 4, md: 6 }} align="center">
            <Box
              w="75px"
              h="75px"
              bgGradient="linear(to-br, secondary.100, secondary.50)"
              rounded="30%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="lg"
              color="secondary.800"
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s ease"
            >
              <FiBriefcase size={32} />
            </Box>

            <Box flex={1}>
              <VStack spacing={2} align="start">
                <Heading
                  size="xl"
                  fontWeight="700"
                  bgGradient="linear(to-r, white, whiteAlpha.900)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  {DataVendor.vendorName}
                </Heading>

                <HStack spacing={2.5} wrap="wrap">
                  <Badge colorScheme="blue" variant="solid" px={2.5} py={0.5} rounded="full" fontSize="xs" fontWeight="semibold" shadow="sm">
                    Code: {DataVendor.vendorCode}
                  </Badge>
                  <Badge colorScheme="purple" variant="solid" px={2.5} py={0.5} rounded="full" fontSize="xs" fontWeight="semibold" shadow="sm">
                    {DataVendor.vendorType}
                  </Badge>
                  <Badge colorScheme={statusColor(DataVendor.status)} variant="solid" px={2.5} py={0.5} rounded="full" fontSize="xs" fontWeight="semibold" shadow="sm">
                    {DataVendor.status}
                  </Badge>
                </HStack>

                <HStack spacing={4} fontSize="sm" opacity={0.9} wrap="wrap">
                  <HStack spacing={1}>
                    <Icon as={FiMapPin} boxSize={3.5} />
                    <Text>{DataVendor.city}, {DataVendor.country}</Text>
                  </HStack>
                  {DataVendor.website && (
                    <HStack spacing={1}>
                      <Icon as={FiGlobe} boxSize={3.5} />
                      <Text>{DataVendor.website}</Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Box>
          </Stack>
        </VStack>
      </Box>

      {/* Main Grid Content Area */}
      <Box w="full" overflow="hidden">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          {/* Main Content — Left Canvas (9 Cols) */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w="full">
            <Tabs variant="unstyled" colorScheme="secondary" size="lg">
              {/* Tab Bar Header Container — Styled like Project Manage Page */}
              <Box mb={4}>
                <TabList
                  ref={tabsRef}
                  gap={2}
                  p={2}
                  overflowX="auto"
                  justifyContent="start"
                  sx={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  <TabButtonCustomStyle>
                    <HStack spacing={2}>
                      <FiInfo size={16} />
                      <Text>Overview</Text>
                    </HStack>
                  </TabButtonCustomStyle>

                  <TabButtonCustomStyleHighLight>
                    <HStack spacing={2}>
                      <FiFileText size={16} />
                      <Text>TDR Records</Text>
                      <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="2xs" px={1.5}>
                        {TdrList.length}
                      </Badge>
                    </HStack>
                  </TabButtonCustomStyleHighLight>

                  <TabButtonCustomStyle>
                    <HStack spacing={2}>
                      <FiLayers size={16} />
                      <Text>Applications Engaged</Text>
                    </HStack>
                  </TabButtonCustomStyle>

                  <TabButtonCustomStyle>
                    <HStack spacing={2}>
                      <FiClock size={16} />
                      <Text>Audit Log</Text>
                    </HStack>
                  </TabButtonCustomStyle>

                  <TabButtonCustomStyleHighLight>
                    <HStack spacing={2}>
                      <FiSettings size={16} />
                      <Text>Vendor Settings</Text>
                    </HStack>
                  </TabButtonCustomStyleHighLight>
                </TabList>

                {/* Tab Scroll Control Buttons — Styled like Project Manage Page */}
                <Flex justify="flex-end" mt={2}>
                  <HStack spacing={1}>
                    <Button
                      size="xs"
                      onClick={() => scrollTabs("left")}
                      bg={colorMode === "light" ? "secondary.500" : "secondary.700"}
                      shadow="md"
                      _hover={{ bg: colorMode === "light" ? "secondary.400" : "secondary.600" }}
                      color="white"
                    >
                      <FiChevronLeft />
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => scrollTabs("right")}
                      bg={colorMode === "light" ? "secondary.500" : "secondary.700"}
                      shadow="md"
                      _hover={{ bg: colorMode === "light" ? "secondary.400" : "secondary.600" }}
                      color="white"
                    >
                      <FiChevronRight />
                    </Button>
                  </HStack>
                </Flex>
              </Box>

              {/* Master Body Context Area Card Wrapper — Styled like Project Manage Page */}
              <Card
                shadow="xl"
                rounded={radiusStyle}
                border="1px"
                bgColor={colorMode === "light" ? "white" : "gray.800"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                p={4}
              >
                <TabPanels>
                  {/* Tab 1 Panel: Overview */}
                  <TabPanel px={0} py={1}>
                    <VStack spacing={5} align="stretch">
                      {/* Basic Information */}
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, blue.400, blue.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiTag size={16} color="white" />
                            </Box>
                            <Heading size="sm" color={colorMode === "light" ? "blue.700" : "blue.300"}>Basic Information</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem label="Vendor Code" value={DataVendor.vendorCode} />
                            <InfoItem label="Vendor Name" value={DataVendor.vendorName} />
                            <InfoItem label="Vendor Type" value={DataVendor.vendorType} />
                            <InfoItem label="Website" value={DataVendor.website || "-"} />
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Address Details */}
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "green.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, green.400, green.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiMapPin size={16} color="white" />
                            </Box>
                            <Heading size="sm" color={colorMode === "light" ? "green.700" : "green.300"}>Location & Address</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem label="Address Line 1" value={DataVendor.address1} />
                            <InfoItem label="Address Line 2" value={DataVendor.address2 || "-"} />
                            <InfoItem label="City" value={DataVendor.city} />
                            <InfoItem label="Country" value={DataVendor.country} />
                            <InfoItem label="Postal Code" value={DataVendor.postalCode || "-"} />
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* PIC Contacts (2 Columns) */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                          <CardHeader bg={colorMode === "light" ? "orange.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                            <HStack spacing={3}>
                              <Box w={8} h={8} bgGradient="linear(135deg, orange.400, orange.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                <FiUser size={16} color="white" />
                              </Box>
                              <Heading size="sm" color={colorMode === "light" ? "orange.700" : "orange.300"}>PIC Business Contact</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody px={5} py={4}>
                            <VStack spacing={3} align="stretch">
                              <InfoItem label="Contact Person Name" value={DataVendor.picBusinessName} />
                              <InfoItem label="Email Address" value={DataVendor.picBusinessEmail} />
                              <InfoItem label="Direct Hotline" value={DataVendor.picBusinessNumberHotline || "-"} />
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                          <CardHeader bg={colorMode === "light" ? "cyan.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                            <HStack spacing={3}>
                              <Box w={8} h={8} bgGradient="linear(135deg, cyan.400, cyan.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                <FiUser size={16} color="white" />
                              </Box>
                              <Heading size="sm" color={colorMode === "light" ? "cyan.700" : "cyan.300"}>PIC Technical Contact</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody px={5} py={4}>
                            <VStack spacing={3} align="stretch">
                              <InfoItem label="Contact Person Name" value={DataVendor.picTechnicalName} />
                              <InfoItem label="Email Address" value={DataVendor.picTechnicalEmail} />
                              <InfoItem label="Direct Hotline" value={DataVendor.picTechnicalNumberHotline || "-"} />
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Classification & Impact */}
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "purple.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, purple.400, purple.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiShield size={16} color="white" />
                            </Box>
                            <Heading size="sm" color={colorMode === "light" ? "purple.700" : "purple.300"}>Risk Classification & Impact</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <InfoItem label="Dependency Level" value={DataVendor.depedencyLevel} />
                            <InfoItem label="Business Impact Rating" value={DataVendor.businessImpact} />
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Tab 2 Panel: TDR */}
                  <TabPanel px={0} py={1}>
                    <VStack spacing={5} align="stretch">
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader
                          bg={colorMode === "light" ? "blue.50" : "gray.800"}
                          roundedTop={radiusStyle}
                          borderBottom="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          py={3}
                          px={5}
                        >
                          <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} spacing={3}>
                            <HStack spacing={3}>
                              <Box w={8} h={8} bgGradient="linear(135deg, blue.400, blue.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                <FiFileText size={16} color="white" />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Heading size="sm" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                                  Tanda Daftar Rekanan (TDR) List
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  Total {TdrList.length} registration record{TdrList.length !== 1 ? "s" : ""}
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                onClick={toggleTdrSort}
                                isLoading={IsTdrLoading}
                              >
                                Sort: {TdrSortDir === "desc" ? "Newest ↓" : "Oldest ↑"}
                              </Button>
                              <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} onClick={tdrModal.onOpen} rounded="md">
                                Add New TDR
                              </Button>
                            </HStack>
                          </Stack>
                        </CardHeader>
                        <CardBody p={4}>
                          {TdrList.length > 0 ? (
                            <Box overflowX="auto">
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                    <Th py={3}>No.</Th>
                                    <Th py={3}>TDR Number</Th>
                                    <Th py={3}>Type</Th>
                                    <Th py={3}>NPWP</Th>
                                    <Th py={3}>Year</Th>
                                    <Th py={3}>Business Sector</Th>
                                    <Th py={3}>Valid From</Th>
                                    <Th py={3}>Expired Date</Th>
                                    <Th py={3}>Status</Th>
                                    <Th py={3} textAlign="right">Action</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {TdrList.map((tdr, index) => {
                                    const isExpired = new Date(tdr.expiredAt) < new Date();
                                    return (
                                      <Tr key={tdr.id} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}>
                                        <Td py={3}>{index + 1}.</Td>
                                        <Td py={3}>
                                          <Text fontSize="sm" fontWeight="semibold" color="secondary.700">{tdr.trdNumber}</Text>
                                        </Td>
                                        <Td py={3}>
                                          <Badge colorScheme={tdr.tdrType === "PERMANENT" ? "emerald" : "orange"} fontSize="xs" rounded="md" px={2}>
                                            {tdr.tdrType}
                                          </Badge>
                                        </Td>
                                        <Td py={3}><Text fontSize="sm">{tdr.npwpNumber}</Text></Td>
                                        <Td py={3}><Text fontSize="sm">{tdr.yearRegistered}</Text></Td>
                                        <Td py={3}><Text fontSize="sm" noOfLines={1}>{tdr.businessSectorName}</Text></Td>
                                        <Td py={3}>
                                          <Text fontSize="sm">{new Date(tdr.timeInEffect).toLocaleDateString("id-ID")}</Text>
                                        </Td>
                                        <Td py={3}>
                                          <Text fontSize="sm" color={isExpired ? "red.500" : "green.600"} fontWeight="semibold">
                                            {new Date(tdr.expiredAt).toLocaleDateString("id-ID")}
                                          </Text>
                                        </Td>
                                        <Td py={3}>
                                          <Badge colorScheme={isExpired ? "red" : "green"} fontSize="xs" rounded="md" px={2}>
                                            {isExpired ? "EXPIRED" : "ACTIVE"}
                                          </Badge>
                                        </Td>
                                        <Td py={3} textAlign="right">
                                          <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FiEye />} onClick={() => handleOpenTdrDetail(tdr)}>
                                            View
                                          </Button>
                                        </Td>
                                      </Tr>
                                    );
                                  })}
                                </Tbody>
                              </Table>
                            </Box>
                          ) : (
                            <Flex justify="center" align="center" py={10} direction="column" gap={3}>
                              <Icon as={FiFileText} boxSize={8} color="gray.400" />
                              <Text color="gray.500" fontSize="sm">No TDR records registered for this vendor</Text>
                            </Flex>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Tab 3 Panel: Applications Engaged */}
                  <TabPanel px={0} py={1}>
                    <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <CardHeader bg={colorMode === "light" ? "purple.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bgGradient="linear(135deg, purple.400, purple.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <FiLayers size={16} color="white" />
                          </Box>
                          <Heading size="sm" color={colorMode === "light" ? "purple.700" : "purple.300"}>Application Engagements</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody p={6}>
                        <Flex justify="center" align="center" direction="column" gap={3} py={6}>
                          <Box w={12} h={12} bg="purple.50" rounded="full" display="flex" alignItems="center" justifyContent="center" color="purple.500">
                            <FiLayers size={24} />
                          </Box>
                          <Text fontWeight="600" color="gray.700">Vendor Application Integrations</Text>
                          <Text color="gray.500" fontSize="sm" textAlign="center" maxW="450px">
                            This vendor is currently linked to IT portfolio applications and procurement projects. Engagement mapping details will populate automatically during active project lifecycle steps.
                          </Text>
                        </Flex>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Tab 4 Panel: Audit & Activity Log */}
                  <TabPanel px={0} py={1}>
                    <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <CardHeader bg={colorMode === "light" ? "gray.100" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bgGradient="linear(135deg, gray.500, gray.700)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <FiClock size={16} color="white" />
                          </Box>
                          <Heading size="sm" color={colorMode === "light" ? "gray.700" : "gray.200"}>Vendor Audit History</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody p={5}>
                        <VStack spacing={4} align="stretch">
                          <HStack spacing={4} align="start" p={3} bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded="md">
                            <Icon as={FiCheckCircle} color="green.500" boxSize={5} mt={0.5} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="600">Vendor Created</Text>
                              <Text fontSize="xs" color="gray.500">Created on {new Date(DataVendor.createdAt).toLocaleDateString("id-ID")} by {DataVendor.createdBy}</Text>
                            </VStack>
                          </HStack>
                          {DataVendor.updatedAt && (
                            <HStack spacing={4} align="start" p={3} bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded="md">
                              <Icon as={FiActivity} color="blue.500" boxSize={5} mt={0.5} />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="600">Vendor Metadata Updated</Text>
                                <Text fontSize="xs" color="gray.500">Last updated on {new Date(DataVendor.updatedAt).toLocaleDateString("id-ID")} by {DataVendor.updatedBy || "System"}</Text>
                              </VStack>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Tab 5 Panel: Vendor Settings (Edit Master Data & Status Transition) */}
                  <TabPanel px={0} py={1}>
                    <VStack spacing={6} align="stretch">
                      {/* Form 1: Master Vendor Data Editor */}
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, secondary.500, secondary.700)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiEdit3 size={16} color="white" />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="sm" color={colorMode === "light" ? "secondary.800" : "secondary.100"}>Edit Master Vendor Data</Heading>
                              <Text fontSize="xs" color="gray.500">Update general information, address, contacts, and risk ratings</Text>
                            </VStack>
                          </HStack>
                        </CardHeader>
                        <CardBody p={5}>
                          <VStack spacing={5} align="stretch">
                            {/* General Information */}
                            <Heading size="xs" color="secondary.700" borderBottom="1px" borderColor="gray.100" pb={1}>General Information</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Vendor Code</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.vendorCode} onChange={(e) => setEditVendorForm({ ...editVendorForm, vendorCode: e.target.value })} />
                              </FormControl>

                              <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl isRequired>
                                  <FormLabel fontSize="xs" fontWeight="600">Vendor Corporate Name</FormLabel>
                                  <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.vendorName} onChange={(e) => setEditVendorForm({ ...editVendorForm, vendorName: e.target.value })} />
                                </FormControl>
                              </GridItem>

                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Vendor Legal Type</FormLabel>
                                <ButtonGroup size="sm" isAttached variant="outline" w="full">
                                  {["PT", "CV", "INDIVIDUAL"].map((type) => (
                                    <Button
                                      key={type}
                                      flex={1}
                                      colorScheme={editVendorForm.vendorType === type ? "blue" : "gray"}
                                      variant={editVendorForm.vendorType === type ? "solid" : "outline"}
                                      onClick={() => setEditVendorForm({ ...editVendorForm, vendorType: type })}
                                    >
                                      {type}
                                    </Button>
                                  ))}
                                </ButtonGroup>
                              </FormControl>

                              <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl>
                                  <FormLabel fontSize="xs" fontWeight="600">Official Website URL</FormLabel>
                                  <Input size="sm" rounded="md" focusBorderColor="secondary.500" placeholder="https://..." value={editVendorForm.website || ""} onChange={(e) => setEditVendorForm({ ...editVendorForm, website: e.target.value })} />
                                </FormControl>
                              </GridItem>
                            </SimpleGrid>

                            {/* Location & Address */}
                            <Heading size="xs" color="secondary.700" borderBottom="1px" borderColor="gray.100" pb={1} pt={2}>Location & Address</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Address Line 1</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.address1} onChange={(e) => setEditVendorForm({ ...editVendorForm, address1: e.target.value })} />
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Address Line 2 (Optional)</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.address2 || ""} onChange={(e) => setEditVendorForm({ ...editVendorForm, address2: e.target.value })} />
                              </FormControl>

                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">City</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.city} onChange={(e) => setEditVendorForm({ ...editVendorForm, city: e.target.value })} />
                              </FormControl>

                              <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="600">Country</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.country} onChange={(e) => setEditVendorForm({ ...editVendorForm, country: e.target.value })} />
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Postal Code</FormLabel>
                                <Input size="sm" rounded="md" focusBorderColor="secondary.500" value={editVendorForm.postalCode || ""} onChange={(e) => setEditVendorForm({ ...editVendorForm, postalCode: e.target.value })} />
                              </FormControl>
                            </SimpleGrid>

                            {/* PIC Contacts */}
                            <Heading size="xs" color="secondary.700" borderBottom="1px" borderColor="gray.100" pb={1} pt={2}>Person in Charge (PIC) Contacts</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <Card variant="outline" p={3} rounded="md">
                                <VStack spacing={3} align="stretch">
                                  <Text fontSize="xs" fontWeight="700" color="orange.600">PIC Business Contact</Text>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs">Name</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picBusinessName} onChange={(e) => setEditVendorForm({ ...editVendorForm, picBusinessName: e.target.value })} />
                                  </FormControl>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs">Email</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picBusinessEmail} onChange={(e) => setEditVendorForm({ ...editVendorForm, picBusinessEmail: e.target.value })} />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel fontSize="xs">Hotline</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picBusinessNumberHotline || ""} onChange={(e) => setEditVendorForm({ ...editVendorForm, picBusinessNumberHotline: e.target.value })} />
                                  </FormControl>
                                </VStack>
                              </Card>

                              <Card variant="outline" p={3} rounded="md">
                                <VStack spacing={3} align="stretch">
                                  <Text fontSize="xs" fontWeight="700" color="cyan.600">PIC Technical Contact</Text>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs">Name</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picTechnicalName} onChange={(e) => setEditVendorForm({ ...editVendorForm, picTechnicalName: e.target.value })} />
                                  </FormControl>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="xs">Email</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picTechnicalEmail} onChange={(e) => setEditVendorForm({ ...editVendorForm, picTechnicalEmail: e.target.value })} />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel fontSize="xs">Hotline</FormLabel>
                                    <Input size="sm" rounded="md" value={editVendorForm.picTechnicalNumberHotline || ""} onChange={(e) => setEditVendorForm({ ...editVendorForm, picTechnicalNumberHotline: e.target.value })} />
                                  </FormControl>
                                </VStack>
                              </Card>
                            </SimpleGrid>

                            {/* Classification & Impact */}
                            <Heading size="xs" color="secondary.700" borderBottom="1px" borderColor="gray.100" pb={1} pt={2}>Dependency & Risk Rating</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Dependency Level</FormLabel>
                                <ChakraSelect size="sm" rounded="md" value={editVendorForm.depedencyLevel} onChange={(e) => setEditVendorForm({ ...editVendorForm, depedencyLevel: e.target.value })}>
                                  <option value="LOW">LOW</option>
                                  <option value="MEDIUM">MEDIUM</option>
                                  <option value="HIGH">HIGH</option>
                                  <option value="CRITICAL">CRITICAL</option>
                                </ChakraSelect>
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="xs" fontWeight="600">Business Impact</FormLabel>
                                <ChakraSelect size="sm" rounded="md" value={editVendorForm.businessImpact} onChange={(e) => setEditVendorForm({ ...editVendorForm, businessImpact: e.target.value })}>
                                  <option value="LOW">LOW</option>
                                  <option value="MEDIUM">MEDIUM</option>
                                  <option value="HIGH">HIGH</option>
                                  <option value="CRITICAL">CRITICAL</option>
                                </ChakraSelect>
                              </FormControl>
                            </SimpleGrid>

                            <Flex justify="flex-end" pt={2}>
                              <Button
                                colorScheme="blue"
                                bg="secondary.500"
                                _hover={{ bg: "secondary.600" }}
                                onClick={handleUpdateVendorMaster}
                                isLoading={isUpdatingVendor}
                                leftIcon={<FiCheckCircle />}
                              >
                                Save Master Vendor Changes
                              </Button>
                            </Flex>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Form 2: Vendor Account Status Management */}
                      <Card shadow="sm" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "red.100" : "red.900"}>
                        <CardHeader bg={colorMode === "light" ? "red.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "red.200" : "red.800"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, red.500, red.700)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiShield size={16} color="white" />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="sm" color={colorMode === "light" ? "red.800" : "red.200"}>Account Status & Access Control</Heading>
                              <Text fontSize="xs" color="gray.500">Manage vendor operational status (ACTIVE, INACTIVE, BLACKLIST)</Text>
                            </VStack>
                          </HStack>
                        </CardHeader>
                        <CardBody p={5}>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between" align="center" p={4} bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded="lg" border="1px" borderColor="gray.200">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.500" fontWeight="600">Current Status</Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme={statusColor(DataVendor.status)} fontSize="sm" px={3} py={1} rounded="full">
                                    {DataVendor.status}
                                  </Badge>
                                  {DataVendor.reasonStatus && (
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">({DataVendor.reasonStatus})</Text>
                                  )}
                                </HStack>
                              </VStack>

                              {/* Status Action Buttons */}
                              <HStack spacing={2} wrap="wrap">
                                {DataVendor.status === "ACTIVE" && (
                                  <>
                                    <Button size="sm" colorScheme="yellow" variant="outline" leftIcon={<FiSlash />} onClick={() => handleOpenStatusConfirm("INACTIVE")}>
                                      Set INACTIVE
                                    </Button>
                                    <Button size="sm" colorScheme="red" leftIcon={<FiXCircle />} onClick={() => handleOpenStatusConfirm("BLACKLIST")}>
                                      BLACKLIST Vendor
                                    </Button>
                                  </>
                                )}

                                {DataVendor.status === "INACTIVE" && (
                                  <>
                                    <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => handleOpenStatusConfirm("ACTIVE")}>
                                      RE-ACTIVE Vendor
                                    </Button>
                                    <Button size="sm" colorScheme="red" leftIcon={<FiXCircle />} onClick={() => handleOpenStatusConfirm("BLACKLIST")}>
                                      BLACKLIST Vendor
                                    </Button>
                                  </>
                                )}

                                {DataVendor.status === "BLACKLIST" && (
                                  <>
                                    <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => handleOpenStatusConfirm("ACTIVE")}>
                                      UN-BLACKLIST & Activate
                                    </Button>
                                    <Button size="sm" colorScheme="yellow" variant="outline" leftIcon={<FiSlash />} onClick={() => handleOpenStatusConfirm("INACTIVE")}>
                                      Set INACTIVE
                                    </Button>
                                  </>
                                )}
                              </HStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Card>
            </Tabs>
          </GridItem>

          {/* Sticky Sidebar — Right (3 Cols) */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w="full">
            <Box w="full" position="sticky" top="80px">
              <VStack spacing={4}>
                {/* Quick Vendor Summary Card */}
                <Card
                  w="full"
                  shadow="sm"
                  rounded={radiusStyle}
                  border="1px"
                  bgColor={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                >
                  <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={4}>
                    <HStack spacing={2.5}>
                      <Box w={7} h={7} bgGradient="linear(135deg, blue.400, blue.600)" rounded="md" display="flex" alignItems="center" justifyContent="center">
                        <FiInfo size={14} color="white" />
                      </Box>
                      <Heading size="xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>Vendor Summary</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Account Status</Text>
                        <Badge colorScheme={statusColor(DataVendor.status)} fontSize="xs" rounded="md" px={2}>{DataVendor.status}</Badge>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Dependency Level</Text>
                        <Badge colorScheme="blue" fontSize="xs" rounded="md" px={2}>{DataVendor.depedencyLevel}</Badge>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Business Impact</Text>
                        <Badge colorScheme="orange" fontSize="xs" rounded="md" px={2}>{DataVendor.businessImpact}</Badge>
                      </VStack>
                      {DataVendor.reasonStatus && (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500">Status Reason</Text>
                          <Text fontSize="xs" fontWeight="500">{DataVendor.reasonStatus}</Text>
                        </VStack>
                      )}
                      <Divider />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Created At</Text>
                        <Text fontSize="xs" fontWeight="500">{new Date(DataVendor.createdAt).toLocaleDateString("id-ID")}</Text>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Created By</Text>
                        <Text fontSize="xs" fontWeight="500">{DataVendor.createdBy}</Text>
                      </VStack>
                      {DataVendor.updatedAt && (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500">Last Updated</Text>
                          <Text fontSize="xs" fontWeight="500">{new Date(DataVendor.updatedAt).toLocaleDateString("id-ID")}</Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>

      {/* Confirmation Modal Dialog for Status Change */}
      <Modal isOpen={statusConfirmModal.isOpen} onClose={statusConfirmModal.onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader borderBottom="1px" borderColor="gray.100" py={4}>
            <HStack spacing={3}>
              <Box
                w={8} h={8}
                bg={targetStatus === "BLACKLIST" ? "red.500" : targetStatus === "INACTIVE" ? "yellow.500" : "green.500"}
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <FiAlertCircle size={18} />
              </Box>
              <Heading size="sm">
                Confirm Status Transition to {targetStatus}
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Are you sure you want to change vendor <strong>{DataVendor.vendorName}</strong> status from <strong>{DataVendor.status}</strong> to <Badge colorScheme={statusColor(targetStatus)}>{targetStatus}</Badge>?
              </Text>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600">Reason for Status Change</FormLabel>
                <Textarea
                  size="sm"
                  rounded="md"
                  placeholder="Provide justification note for audit log..."
                  value={statusReasonInput}
                  onChange={(e) => setStatusReasonInput(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor="gray.100" py={3}>
            <Button variant="ghost" mr={3} onClick={statusConfirmModal.onClose}>Cancel</Button>
            <Button
              colorScheme={targetStatus === "BLACKLIST" ? "red" : targetStatus === "INACTIVE" ? "yellow" : "green"}
              onClick={handleConfirmStatusChange}
              isLoading={isUpdatingStatus}
              isDisabled={!statusReasonInput.trim()}
            >
              Confirm {targetStatus} Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Enhanced Add TDR Modal */}
      <Modal isOpen={tdrModal.isOpen} onClose={tdrModal.onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent rounded={radiusStyle} maxH="92vh">
          <ModalHeader borderBottom="1px" borderColor="gray.100" py={4} bg={colorMode === "light" ? "blue.50" : "gray.800"}>
            <HStack spacing={3}>
              <Box w={8} h={8} bgGradient="linear(135deg, secondary.500, secondary.700)" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                <FiFileText size={18} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" color={colorMode === "light" ? "secondary.800" : "secondary.100"}>
                  Add New TDR Registration
                </Heading>
                <Text fontSize="xs" color="gray.500">Enter Tanda Daftar Rekanan details and upload supporting documents</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={5}>
            <VStack spacing={6} align="stretch">
              {/* Form Section 1: Identification & Registration */}
              <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                    <Icon as={FiTag} color="secondary.500" boxSize={4} />
                    <Heading size="xs" color="secondary.700">1. Registration & Identification</Heading>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">TDR Number</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.trdNumber}
                        onChange={(e) => setTdrForm({ ...tdrForm, trdNumber: e.target.value })}
                        placeholder="e.g. TDR-2026-00918"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Registration Type</FormLabel>
                      <ChakraSelect
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.tdrType}
                        onChange={(e) => setTdrForm({ ...tdrForm, tdrType: e.target.value })}
                      >
                        <option value="PERMANENT">PERMANENT (Permanen)</option>
                        <option value="TEMPORARY">TEMPORARY (Sementara)</option>
                      </ChakraSelect>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">NPWP Tax Number</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.npwpNumber}
                        onChange={(e) => setTdrForm({ ...tdrForm, npwpNumber: e.target.value })}
                        placeholder="00.000.000.0-000.000"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Year Registered</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.yearRegistered}
                        onChange={(e) => setTdrForm({ ...tdrForm, yearRegistered: e.target.value })}
                        placeholder="e.g. 2026"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Card>

              {/* Form Section 2: Business & Sector Details */}
              <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                    <Icon as={FiBriefcase} color="purple.500" boxSize={4} />
                    <Heading size="xs" color="purple.700">2. Business Sector & Qualifications</Heading>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Business Entity Type</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.businessType}
                        onChange={(e) => setTdrForm({ ...tdrForm, businessType: e.target.value })}
                        placeholder="e.g. PT / CV / Koperasi"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Business Sector Code</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.businessSectorCode}
                        onChange={(e) => setTdrForm({ ...tdrForm, businessSectorCode: e.target.value })}
                        placeholder="e.g. IT-DEV-01"
                      />
                    </FormControl>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="600">Business Sector Name</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          focusBorderColor="secondary.500"
                          bg={colorMode === "light" ? "white" : "gray.700"}
                          value={tdrForm.businessSectorName}
                          onChange={(e) => setTdrForm({ ...tdrForm, businessSectorName: e.target.value })}
                          placeholder="e.g. Teknologi Informasi & Pengembangan Perangkat Lunak"
                        />
                      </FormControl>
                    </GridItem>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Sub Business Sector</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.subBusinessSector}
                        onChange={(e) => setTdrForm({ ...tdrForm, subBusinessSector: e.target.value })}
                        placeholder="Optional sub-category"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Qualifications & Certification</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.qualifications}
                        onChange={(e) => setTdrForm({ ...tdrForm, qualifications: e.target.value })}
                        placeholder="e.g. ISO 27001 / High Risk Grade"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Card>

              {/* Form Section 3: Validity Period */}
              <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                    <Icon as={FiCalendar} color="emerald.500" boxSize={4} />
                    <Heading size="xs" color="emerald.700">3. Validity & Expiration Period</Heading>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Valid From Date</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        type="date"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.timeInEffect}
                        onChange={(e) => setTdrForm({ ...tdrForm, timeInEffect: e.target.value })}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="600">Expired Date</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        type="date"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrForm.expiredAt}
                        onChange={(e) => setTdrForm({ ...tdrForm, expiredAt: e.target.value })}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Card>

              {/* Form Section 4: Document Attachment */}
              <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" pb={1} borderBottom="1px" borderColor="gray.200">
                    <HStack spacing={2}>
                      <Icon as={FiUpload} color="blue.500" boxSize={4} />
                      <Heading size="xs" color="blue.700">4. Supporting Document Attachment</Heading>
                    </HStack>

                    <RadioGroup value={attachmentMethod} onChange={(v) => setAttachmentMethod(v as "file" | "link")}>
                      <HStack spacing={4}>
                        <Radio value="file" size="sm"><HStack spacing={1}><FiUpload size={12} /><Text fontSize="xs" fontWeight="600">Upload File</Text></HStack></Radio>
                        <Radio value="link" size="sm"><HStack spacing={1}><FiLink size={12} /><Text fontSize="xs" fontWeight="600">External Link</Text></HStack></Radio>
                      </HStack>
                    </RadioGroup>
                  </HStack>

                  {attachmentMethod === "file" ? (
                    <Box
                      {...getRootProps()}
                      p={6}
                      border="2px dashed"
                      borderColor={isDragActive ? "secondary.500" : tdrFile ? "green.400" : "gray.300"}
                      rounded="lg"
                      bg={isDragActive ? "secondary.50" : tdrFile ? "green.50" : colorMode === "light" ? "white" : "gray.700"}
                      cursor="pointer"
                      textAlign="center"
                      transition="all 0.2s"
                      _hover={{ borderColor: "secondary.500", bg: "secondary.50" }}
                    >
                      <input {...getInputProps()} />
                      {tdrFile ? (
                        <VStack spacing={2}>
                          <Icon as={FiFileText} boxSize={8} color="green.500" />
                          <Text fontSize="sm" fontWeight="600" color="green.700">{tdrFile.name}</Text>
                          <Badge colorScheme="green" fontSize="2xs">{(tdrFile.size / 1024).toFixed(1)} KB • Ready to upload</Badge>
                        </VStack>
                      ) : (
                        <VStack spacing={2}>
                          <Icon as={FiUpload} boxSize={8} color="secondary.400" />
                          <Text fontSize="sm" color="gray.700" fontWeight="600">Drag and drop document file here, or click to browse</Text>
                          <Text fontSize="xs" color="gray.400">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10 MB)</Text>
                        </VStack>
                      )}
                    </Box>
                  ) : (
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="600">Document URL Link</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        focusBorderColor="secondary.500"
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        value={tdrLink}
                        onChange={(e) => setTdrLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                      />
                    </FormControl>
                  )}
                </VStack>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor="gray.100" py={3}>
            <Button variant="ghost" mr={3} onClick={tdrModal.onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              bg="secondary.500"
              _hover={{ bg: "secondary.600" }}
              onClick={handleSubmitTdr}
              isLoading={isSubmittingTdr}
              isDisabled={!tdrForm.trdNumber || !tdrForm.npwpNumber || !tdrForm.timeInEffect || !tdrForm.expiredAt}
            >
              Submit TDR Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Enhanced TDR Detail/Edit Modal */}
      <Modal isOpen={tdrDetailModal.isOpen} onClose={() => { tdrDetailModal.onClose(); setIsEditingTdr(false); }} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent rounded={radiusStyle} maxH="92vh">
          <ModalHeader borderBottom="1px" borderColor="gray.100" py={4} bg={colorMode === "light" ? "blue.50" : "gray.800"}>
            <HStack justify="space-between" w="full" pr={8}>
              <HStack spacing={3}>
                <Box w={8} h={8} bgGradient="linear(135deg, secondary.500, secondary.700)" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                  <FiFileText size={18} />
                </Box>
                <Heading size="md" color={colorMode === "light" ? "secondary.800" : "secondary.100"}>
                  {isEditingTdr ? "Edit TDR Registration Record" : "TDR Detail View"}
                </Heading>
              </HStack>
              <Button size="xs" colorScheme={isEditingTdr ? "red" : "blue"} variant="outline" onClick={() => setIsEditingTdr(!isEditingTdr)}>
                {isEditingTdr ? "Cancel Edit" : "Edit Record"}
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={5}>
            {selectedTdr && (
              <VStack spacing={6} align="stretch">
                {/* Section 1: Identification */}
                <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                      <Icon as={FiTag} color="secondary.500" boxSize={4} />
                      <Heading size="xs" color="secondary.700">1. Registration & Identification</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">TDR Number</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.trdNumber} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, trdNumber: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Registration Type</FormLabel>
                        <ChakraSelect size="sm" rounded="md" value={editTdrForm.tdrType} isDisabled={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, tdrType: e.target.value })}>
                          <option value="PERMANENT">PERMANENT</option>
                          <option value="TEMPORARY">TEMPORARY</option>
                        </ChakraSelect>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">NPWP Tax Number</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.npwpNumber} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, npwpNumber: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Year Registered</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.yearRegistered} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, yearRegistered: e.target.value })} />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </Card>

                {/* Section 2: Business & Sector */}
                <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                      <Icon as={FiBriefcase} color="purple.500" boxSize={4} />
                      <Heading size="xs" color="purple.700">2. Business Sector & Details</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Business Entity Type</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.businessType} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, businessType: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Sector Code</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.businessSectorCode} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, businessSectorCode: e.target.value })} />
                      </FormControl>
                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600">Sector Name</FormLabel>
                          <Input size="sm" rounded="md" value={editTdrForm.businessSectorName} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, businessSectorName: e.target.value })} />
                        </FormControl>
                      </GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Sub Sector</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.subBusinessSector} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, subBusinessSector: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Qualifications</FormLabel>
                        <Input size="sm" rounded="md" value={editTdrForm.qualifications} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, qualifications: e.target.value })} />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </Card>

                {/* Section 3: Validity Period */}
                <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                      <Icon as={FiCalendar} color="emerald.500" boxSize={4} />
                      <Heading size="xs" color="emerald.700">3. Validity Period</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Valid From Date</FormLabel>
                        <Input size="sm" rounded="md" type="date" value={editTdrForm.timeInEffect} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, timeInEffect: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="600">Expired Date</FormLabel>
                        <Input size="sm" rounded="md" type="date" value={editTdrForm.expiredAt} isReadOnly={!isEditingTdr} bg={isEditingTdr ? "white" : "gray.100"} onChange={(e) => setEditTdrForm({ ...editTdrForm, expiredAt: e.target.value })} />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </Card>

                {/* Document Attachments */}
                {selectedTdr.mediaList && selectedTdr.mediaList.length > 0 && (
                  <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2} pb={1} borderBottom="1px" borderColor="gray.200">
                        <Icon as={FiUpload} color="blue.500" boxSize={4} />
                        <Heading size="xs" color="blue.700">Attached Media & Documents</Heading>
                      </HStack>

                      <VStack spacing={2} align="stretch">
                        {selectedTdr.mediaList.map((media) => (
                          <HStack key={media.relId} p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="md" justify="space-between" shadow="xs">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="600">{media.objectRawName}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {media.objectName === "EXTERNAL_LINK" ? "External Link" : `${media.objectExtension?.replace(".", "").toUpperCase()} • ${media.objectSize ? (media.objectSize).toFixed(0) + " KB" : ""}`}
                              </Text>
                            </VStack>
                            <HStack spacing={2}>
                              {media.objectName === "EXTERNAL_LINK" ? (
                                <Button size="xs" colorScheme="blue" variant="outline" as="a" href={media.objectData} target="_blank" leftIcon={<FiLink />}>
                                  Open Link
                                </Button>
                              ) : (
                                <Button size="xs" colorScheme="green" leftIcon={<FiFileText />} isLoading={isDownloadingTdr} onClick={() => handleDownloadTdrFile(media.mediaId, media.objectRawName)}>
                                  Download File
                                </Button>
                              )}
                              {isEditingTdr && (
                                <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleDeleteTdrMedia(media.relId)}>✕</Button>
                              )}
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Card>
                )}

                {/* Upload new file in edit mode */}
                {isEditingTdr && (
                  <Card variant="outline" rounded="lg" p={4} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="xs" color="blue.700">Upload Replacement Attachment</Heading>
                      <Box
                        {...editDropzone.getRootProps()}
                        p={5}
                        border="2px dashed"
                        borderColor={editDropzone.isDragActive ? "blue.400" : editTdrFile ? "green.400" : "gray.300"}
                        rounded="lg"
                        bg={editDropzone.isDragActive ? "blue.50" : editTdrFile ? "green.50" : "white"}
                        cursor="pointer"
                        textAlign="center"
                        transition="all 0.2s"
                        _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                      >
                        <input {...editDropzone.getInputProps()} />
                        {editTdrFile ? (
                          <HStack justify="center" spacing={2}>
                            <Icon as={FiFileText} color="green.500" />
                            <Text fontSize="sm" fontWeight="600">{editTdrFile.name}</Text>
                            <Text fontSize="xs" color="gray.500">({(editTdrFile.size / 1024).toFixed(1)} KB)</Text>
                          </HStack>
                        ) : (
                          <VStack spacing={1}>
                            <Icon as={FiUpload} boxSize={6} color="gray.400" />
                            <Text fontSize="xs" color="gray.600" fontWeight="500">Drop replacement file here or click to browse</Text>
                          </VStack>
                        )}
                      </Box>
                    </VStack>
                  </Card>
                )}
              </VStack>
            )}
          </ModalBody>
          {isEditingTdr && (
            <ModalFooter borderTop="1px" borderColor="gray.100" py={3}>
              <Button variant="ghost" mr={3} onClick={() => setIsEditingTdr(false)}>Cancel</Button>
              <Button colorScheme="blue" bg="secondary.500" _hover={{ bg: "secondary.600" }} onClick={handleUpdateTdr} isLoading={isUpdatingTdr}>
                Save TDR Changes
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
};

// Reusable info item component
const InfoItem = ({ label, value }: { label: string; value: string }) => {
  const { colorMode } = useColorMode();
  return (
    <VStack align="start" spacing={0.5}>
      <Text fontSize="xs" color="gray.500" fontWeight="500">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.100"}>
        {value || "-"}
      </Text>
    </VStack>
  );
};

export default VendorDetailView;
