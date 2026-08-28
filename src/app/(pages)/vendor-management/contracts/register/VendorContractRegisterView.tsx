"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select as ChakraSelect,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiPlus,
  FiRepeat,
  FiRefreshCw,
  FiSave,
  FiSliders,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { useFormik } from "formik";
import * as yup from "yup";

// Components & Services
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useVendor, {
  ContractItemInsertPayload,
  ContractTopInsertPayload,
  VendorContractInsertPayload,
  VendorResponse,
} from "@/app/services/useVendor";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import ModalVendorSelector from "./components/ModalVendorSelector";
import ModalProjectSelector from "./components/ModalProjectSelector";
import ModalTopAutoAdjust from "./components/ModalTopAutoAdjust";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import { ProjectDataResponse } from "@/app/services/useProjects";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Register Vendor Contract",
  breadCrumb: ["Home", "Vendor Management", "Contracts", "Register"],
};

const validationSchema = yup.object({
  projectId: yup.string().required("Corporate Procurement Project is required"),
  vendorId: yup.string().required("Please select a vendor partner"),
  corpNumber: yup.string().required("Corporate SPK / Agreement Number is required"),
  corpName: yup.string().required("Contract Narrative is required"),
  contractDate: yup.string().required("Contract Register Date is required"),
  workValue: yup.number().min(0, "Work value cannot be negative").required("Work Value is required"),
  contractStartDate: yup.string().required("Contract Start Date is required"),
  contractEndDate: yup.string().required("Contract End Date is required"),
});

const VendorContractRegisterView = () => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { InsertContract } = useVendor();

  const [tokenData, setTokenData] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectDataResponse | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals & Safety 5s countdown
  const projectModal = useDisclosure();
  const vendorModal = useDisclosure();
  const confirmModal = useDisclosure();
  const topAutoAdjustModal = useDisclosure();
  const [showTopDates, setShowTopDates] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  // 5-second interval timer for submission safety
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmModal.isOpen) {
      setCountdown(5);
      setCanSubmit(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirmModal.isOpen]);

  const formik = useFormik<VendorContractInsertPayload>({
    initialValues: {
      projectId: "",
      vendorId: "",
      corpNumber: "",
      corpName: "",
      contractNumber: "-",
      contractDate: new Date().toISOString().split("T")[0],
      workValue: 0,
      note: "",
      contractStartDate: new Date().toISOString().split("T")[0],
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      worksStartDate: "",
      worksEndDate: "",
      warrantyStartDate: "",
      warrantyEndDate: "",
      maintenanceStartDate: "",
      maintenanceEndDate: "",
      othersTimeline: "",
      termOfPayment: "TERMIN 30% DP, 40% PROGRESS BAST 1, 30% FINAL BAST 2",
      performanceGuaranteeStartDate: "",
      performanceGuaranteeEndDate: "",
      performanceGuaranteeValues: 0,
      maintenanceWarrantyStartDate: "",
      maintenanceWarrantyEndDate: "",
      maintenanceWarrantyValues: 0,
      cavexValues: 0,
      capexPercentage: 100,
      ovexValues: 0,
      ovexPercentage: 0,
      status: "ACTIVE",
      contractBillingType: "MILESTONE",
      subscriptionPeriodValue: 0,
      subscriptionAutoRenew: false,
      items: [],
      topList: [
        { stepOrder: 1, topValues: 0, topDate: "", topDescriptions: "", topStatus: "ACTIVE" },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      confirmModal.onOpen();
    },
  });

  const handleSelectProject = (project: ProjectDataResponse) => {
    setSelectedProject(project);
    formik.setFieldValue("projectId", project.id);
    if (!formik.values.corpName || formik.values.corpName.trim() === "") {
      formik.setFieldValue("corpName", (project.projectName || "").toUpperCase());
    }
  };

  const handleClearProject = () => {
    setSelectedProject(null);
    formik.setFieldValue("projectId", "");
  };

  const handleExecuteSubmit = async () => {
    if (!tokenData) return;
    setIsSubmitting(true);

    const cleanDate = (val?: string) => (val && val.trim() !== "" ? val : undefined);

    const sanitizedPayload: VendorContractInsertPayload = {
      ...formik.values,
      worksStartDate: cleanDate(formik.values.worksStartDate),
      worksEndDate: cleanDate(formik.values.worksEndDate),
      warrantyStartDate: cleanDate(formik.values.warrantyStartDate),
      warrantyEndDate: cleanDate(formik.values.warrantyEndDate),
      maintenanceStartDate: cleanDate(formik.values.maintenanceStartDate),
      maintenanceEndDate: cleanDate(formik.values.maintenanceEndDate),
      performanceGuaranteeStartDate: cleanDate(formik.values.performanceGuaranteeStartDate),
      performanceGuaranteeEndDate: cleanDate(formik.values.performanceGuaranteeEndDate),
      maintenanceWarrantyStartDate: cleanDate(formik.values.maintenanceWarrantyStartDate),
      maintenanceWarrantyEndDate: cleanDate(formik.values.maintenanceWarrantyEndDate),
      performanceGuaranteeValues: formik.values.performanceGuaranteeValues || 0,
      maintenanceWarrantyValues: formik.values.maintenanceWarrantyValues || 0,
      cavexValues: formik.values.cavexValues || 0,
      capexPercentage: formik.values.capexPercentage || 0,
      ovexValues: formik.values.ovexValues || 0,
      ovexPercentage: formik.values.ovexPercentage || 0,
      contractBillingType: formik.values.contractBillingType || "MILESTONE",
      subscriptionPeriodValue: formik.values.subscriptionPeriodValue || undefined,
      subscriptionAutoRenew: !!formik.values.subscriptionAutoRenew,
      topList: (formik.values.topList || []).map((t) => ({
        ...t,
        topDate: cleanDate(t.topDate),
        billingPeriodStart: cleanDate(t.billingPeriodStart),
        billingPeriodEnd: cleanDate(t.billingPeriodEnd),
        isAutoGenerated: !!t.isAutoGenerated,
      })),
    };

    const res = await InsertContract(sanitizedPayload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Vendor Contract registered successfully!", statusToast: "success" });
      confirmModal.onClose();
      router.push("/vendor-management/contracts");
    } else {
      showToast({ description: res?.message || "Failed to register contract", statusToast: "error" });
    }
    setIsSubmitting(false);
  };

  // Quick 1-Click Subscription Schedule Generator
  const handleQuickGenerateSubscriptionTop = (billingType?: string) => {
    const type = billingType || formik.values.contractBillingType || "SUBSCRIPTION_MONTHLY";
    let start = formik.values.contractStartDate ? new Date(formik.values.contractStartDate) : new Date();
    let end = formik.values.contractEndDate
      ? new Date(formik.values.contractEndDate)
      : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

    if (isNaN(start.getTime())) start = new Date();
    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
    }

    const stepMonths =
      type === "SUBSCRIPTION_ANNUAL"
        ? 12
        : type === "SUBSCRIPTION_SEMI_ANNUAL"
        ? 6
        : type === "SUBSCRIPTION_QUARTERLY"
        ? 3
        : 1;

    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatYMD = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const list: ContractTopInsertPayload[] = [];
    let currentPeriodStart = new Date(start);
    let step = 1;

    const freqLabel =
      type === "SUBSCRIPTION_ANNUAL"
        ? "Tahun"
        : type === "SUBSCRIPTION_SEMI_ANNUAL"
        ? "Semester"
        : type === "SUBSCRIPTION_QUARTERLY"
        ? "Triwulan"
        : "Bulan";

    while (currentPeriodStart < end && step <= 120) {
      const nextMonthTarget = new Date(
        currentPeriodStart.getFullYear(),
        currentPeriodStart.getMonth() + stepMonths,
        0
      );
      const periodEnd = nextMonthTarget > end ? new Date(end) : nextMonthTarget;

      const monthName = currentPeriodStart.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });

      list.push({
        stepOrder: step,
        topValues: formik.values.subscriptionPeriodValue || 0,
        topDescriptions: `Langganan ${freqLabel} #${step} (${monthName})`,
        topStatus: "ACTIVE",
        topDate: formatYMD(periodEnd),
        billingPeriodStart: formatYMD(currentPeriodStart),
        billingPeriodEnd: formatYMD(periodEnd),
        isAutoGenerated: true,
      });

      currentPeriodStart = new Date(
        periodEnd.getFullYear(),
        periodEnd.getMonth(),
        periodEnd.getDate() + 1
      );
      step++;
    }

    const totalWV = formik.values.workValue || 0;
    if (
      totalWV > 0 &&
      (!formik.values.subscriptionPeriodValue || formik.values.subscriptionPeriodValue === 0)
    ) {
      const totalSteps = Math.max(1, list.length);
      const baseAmount = Math.floor(totalWV / totalSteps);
      const remainder = totalWV - baseAmount * totalSteps;
      list.forEach((item, idx) => {
        item.topValues = idx === totalSteps - 1 ? baseAmount + remainder : baseAmount;
      });
      formik.setFieldValue("subscriptionPeriodValue", baseAmount);
    } else if (
      formik.values.subscriptionPeriodValue &&
      formik.values.subscriptionPeriodValue > 0
    ) {
      const sum = list.reduce((a, b) => a + b.topValues, 0);
      handleWorkValueChange(sum);
    }

    formik.setFieldValue("topList", list);
    setShowTopDates(true);
    showToast({
      description: `Generated ${list.length} recurring billing periods successfully!`,
      statusToast: "success",
    });
  };

  // TOP schedule helpers
  const handleAddTopStep = () => {
    const nextOrder = (formik.values.topList?.length || 0) + 1;
    formik.setFieldValue("topList", [
      ...(formik.values.topList || []),
      { stepOrder: nextOrder, topValues: 0, topDate: "", topDescriptions: "", topStatus: "ACTIVE" },
    ]);
  };

  const handleRemoveTopStep = (index: number) => {
    const updated = [...(formik.values.topList || [])];
    updated.splice(index, 1);
    formik.setFieldValue("topList", updated);
  };

  const totalTopValues = (formik.values.topList || []).reduce((acc, t) => acc + (t.topValues || 0), 0);
  const isTopMatch = totalTopValues === formik.values.workValue;

  // Linked CAPEX / OPEX calculations relative to Total Work Value
  const handleWorkValueChange = (newWorkValue: number) => {
    formik.setFieldValue("workValue", newWorkValue);
    const capexPct = formik.values.capexPercentage || 0;
    const cavexVal = (capexPct / 100) * newWorkValue;
    const ovexVal = Math.max(0, newWorkValue - cavexVal);
    const ovexPct = parseFloat((100 - capexPct).toFixed(2));

    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
  };

  const handleCavexValueChange = (inputVal: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedVal = Math.min(Math.max(0, inputVal), totalWV);
    const capexPct = totalWV > 0 ? parseFloat(((boundedVal / totalWV) * 100).toFixed(2)) : 0;
    const ovexVal = Math.max(0, totalWV - boundedVal);
    const ovexPct = parseFloat((100 - capexPct).toFixed(2));

    formik.setFieldValue("cavexValues", boundedVal);
    formik.setFieldValue("capexPercentage", capexPct);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
  };

  const handleCapexPercentageChange = (inputPct: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedPct = Math.min(Math.max(0, inputPct), 100);
    const cavexVal = (boundedPct / 100) * totalWV;
    const ovexPct = parseFloat((100 - boundedPct).toFixed(2));
    const ovexVal = Math.max(0, totalWV - cavexVal);

    formik.setFieldValue("capexPercentage", boundedPct);
    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
    formik.setFieldValue("ovexValues", ovexVal);
  };

  const handleOvexValueChange = (inputVal: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedVal = Math.min(Math.max(0, inputVal), totalWV);
    const ovexPct = totalWV > 0 ? parseFloat(((boundedVal / totalWV) * 100).toFixed(2)) : 0;
    const cavexVal = Math.max(0, totalWV - boundedVal);
    const capexPct = parseFloat((100 - ovexPct).toFixed(2));

    formik.setFieldValue("ovexValues", boundedVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("capexPercentage", capexPct);
  };

  const handleOvexPercentageChange = (inputPct: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedPct = Math.min(Math.max(0, inputPct), 100);
    const ovexVal = (boundedPct / 100) * totalWV;
    const capexPct = parseFloat((100 - boundedPct).toFixed(2));
    const cavexVal = Math.max(0, totalWV - ovexVal);

    formik.setFieldValue("ovexPercentage", boundedPct);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("capexPercentage", capexPct);
    formik.setFieldValue("cavexValues", cavexVal);
  };

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      <Box px={{ base: 2, md: 4 }} py={4} maxW="1400px" mx="auto">
        {/* Back Link Header */}
        <HStack mb={4}>
          <Link href="/vendor-management/contracts">
            <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />}>
              Back to Contracts Hub
            </Button>
          </Link>
        </HStack>

        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* SECTION 1: Corporate Vendor & Header Contract Data */}
            <Card rounded="2xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
                <HStack spacing={3}>
                  <Box w={9} h={9} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <FiBriefcase size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">1. Corporate Vendor & Header Contract Data</Heading>
                    <Text fontSize="xs" color="gray.500">Select mandatory corporate procurement project and vendor partner entity</Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Corporate Procurement Project Selector Card (MANDATORY) */}
                  <FormControl isInvalid={!!formik.errors.projectId && !!formik.touched.projectId} isRequired>
                    <Flex justify="space-between" align="center" mb={1}>
                      <FormLabel fontSize="sm" fontWeight="bold" m={0}>
                        Corporate Procurement Project *
                      </FormLabel>
                      {selectedProject && (
                        <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                          Linked Project
                        </Badge>
                      )}
                    </Flex>
                    {selectedProject ? (
                      <Box
                        p={4}
                        rounded="xl"
                        border="1px"
                        borderColor="purple.400"
                        bg={colorMode === "light" ? "purple.50/50" : "gray.800"}
                      >
                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                          <HStack spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              bg="purple.500"
                              rounded="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                            >
                              <FiBriefcase size={20} />
                            </Box>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2} wrap="wrap">
                                <Badge colorScheme="purple">
                                  {selectedProject.projectCode || selectedProject.projectNo || "NO-CODE"}
                                </Badge>
                                <Badge colorScheme="blue">
                                  {selectedProject.projectType || "PROCUREMENT"}
                                </Badge>
                                {selectedProject.sdlcStageName && (
                                  <Badge colorScheme="teal" variant="outline">
                                    {selectedProject.sdlcStageName}
                                  </Badge>
                                )}
                                <Badge colorScheme="green">
                                  {selectedProject.projectStatus || "ACTIVE"}
                                </Badge>
                              </HStack>
                              <Text fontSize="md" fontWeight="bold">
                                {selectedProject.projectName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {selectedProject.proOwnerDivisionName || "Division not set"} • {selectedProject.proOwnerDirectorateName || "Directorate not set"}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={2}>
                            <Button size="sm" variant="outline" colorScheme="purple" onClick={projectModal.onOpen}>
                              Change Project
                            </Button>
                            <Button size="sm" variant="ghost" colorScheme="red" onClick={handleClearProject}>
                              Clear
                            </Button>
                          </HStack>
                        </Flex>
                      </Box>
                    ) : (
                      <Button
                        size="md"
                        w="full"
                        h="54px"
                        variant="dashed"
                        border="2px dashed"
                        borderColor={formik.errors.projectId && formik.touched.projectId ? "red.400" : colorMode === "light" ? "purple.300" : "purple.600"}
                        color={formik.errors.projectId && formik.touched.projectId ? "red.500" : colorMode === "light" ? "purple.600" : "purple.300"}
                        leftIcon={<FiBriefcase size={20} />}
                        onClick={() => {
                          formik.setFieldTouched("projectId", true);
                          projectModal.onOpen();
                        }}
                        _hover={{ bg: colorMode === "light" ? "purple.50" : "gray.700" }}
                      >
                        Click to Search & Select Corporate Procurement Project (Mandatory)
                      </Button>
                    )}
                    <FormErrorMessage>{formik.errors.projectId}</FormErrorMessage>
                  </FormControl>

                  {/* Vendor Selector Card */}
                  <FormControl isInvalid={!!formik.errors.vendorId && !!formik.touched.vendorId} isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold">Vendor Partner *</FormLabel>
                    {selectedVendor ? (
                      <Box p={4} rounded="xl" border="1px" borderColor="secondary.500" bg={colorMode === "light" ? "secondary.50" : "gray.700"}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                          <HStack spacing={3}>
                            <Box w={10} h={10} bg="secondary.500" rounded="xl" display="flex" alignItems="center" justifyContent="center" color="white">
                              <FiUserCheck size={20} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Badge colorScheme="blue">{selectedVendor.vendorCode}</Badge>
                                <Badge colorScheme="purple">{selectedVendor.vendorType}</Badge>
                              </HStack>
                              <Text fontSize="md" fontWeight="bold">{selectedVendor.vendorName}</Text>
                              <Text fontSize="xs" color="gray.500">{selectedVendor.city}, {selectedVendor.country} • PIC: {selectedVendor.picBusinessName}</Text>
                            </VStack>
                          </HStack>

                          <Button size="sm" variant="outline" colorScheme="blue" onClick={vendorModal.onOpen}>
                            Change Vendor
                          </Button>
                        </Flex>
                      </Box>
                    ) : (
                      <Button
                        size="md"
                        w="full"
                        h="54px"
                        variant="dashed"
                        border="2px dashed"
                        borderColor={formik.errors.vendorId && formik.touched.vendorId ? "red.400" : "secondary.400"}
                        color="secondary.600"
                        leftIcon={<FiUserCheck size={20} />}
                        onClick={() => {
                          formik.setFieldTouched("vendorId", true);
                          vendorModal.onOpen();
                        }}
                        _hover={{ bg: "secondary.50" }}
                      >
                        Click to Search & Select Vendor Partner
                      </Button>
                    )}
                    <FormErrorMessage>{formik.errors.vendorId}</FormErrorMessage>
                  </FormControl>

                  {/* Corporate SPK & Contract Narrative */}
                  <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={4}>
                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.corpNumber && !!formik.touched.corpNumber} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Corporate SPK / Agreement No. *</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          textTransform="uppercase"
                          placeholder="e.g. SPK/BJB/2026/089"
                          name="corpNumber"
                          value={formik.values.corpNumber}
                          onChange={(e) => formik.setFieldValue("corpNumber", e.target.value.toUpperCase())}
                          onBlur={formik.handleBlur}
                        />
                        <FormErrorMessage>{formik.errors.corpNumber}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.corpName && !!formik.touched.corpName} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Contract Narrative *</FormLabel>
                        <Textarea
                          size="sm"
                          rounded="md"
                          rows={2}
                          textTransform="uppercase"
                          placeholder="e.g. PENGADAAN PERANGKAT SERVER DAN INFRASTRUKTUR DATA CENTER..."
                          name="corpName"
                          value={formik.values.corpName}
                          onChange={(e) => formik.setFieldValue("corpName", e.target.value.toUpperCase())}
                          onBlur={formik.handleBlur}
                        />
                        <FormErrorMessage>{formik.errors.corpName}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 2: Budget Allocation */}
            <Card rounded="2xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
                <HStack spacing={3}>
                  <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <FiCalendar size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">2. Budget Allocation</Heading>
                    <Text fontSize="xs" color="gray.500">Configure contract billing model, register date, total work value, and duration</Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Contract Billing Model & Recurring Setup */}
                  <Box p={4} rounded="xl" border="1px solid" borderColor={colorMode === "light" ? "teal.200" : "teal.800"} bg={colorMode === "light" ? "teal.50/30" : "gray.800"}>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={2}>
                          <Icon as={FiRepeat} color="teal.500" />
                          <Text fontSize="xs" fontWeight="bold">Contract Billing Model & Schedule Type</Text>
                        </HStack>
                        <Badge colorScheme={formik.values.contractBillingType === "MILESTONE" ? "blue" : "purple"} fontSize="2xs" px={2} py={0.5} rounded="md">
                          {formik.values.contractBillingType || "MILESTONE"}
                        </Badge>
                      </Flex>

                      <Grid templateColumns={{ base: "1fr", md: formik.values.contractBillingType !== "MILESTONE" ? "repeat(3, 1fr)" : "1fr" }} gap={4} alignItems="center">
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="2xs" fontWeight="bold">Billing Model Type</FormLabel>
                            <ChakraSelect
                              size="sm"
                              rounded="md"
                              name="contractBillingType"
                              value={formik.values.contractBillingType || "MILESTONE"}
                              onChange={(e) => {
                                const newType = e.target.value;
                                formik.setFieldValue("contractBillingType", newType);
                              }}
                            >
                              <option value="MILESTONE">Milestone / Deliverable Progress TOP</option>
                              <option value="SUBSCRIPTION_MONTHLY">Monthly Subscription (Bulanan)</option>
                              <option value="SUBSCRIPTION_QUARTERLY">Quarterly Subscription (3 Bulan)</option>
                              <option value="SUBSCRIPTION_SEMI_ANNUAL">Semi-Annual Subscription (6 Bulan)</option>
                              <option value="SUBSCRIPTION_ANNUAL">Annual Subscription (Tahunan)</option>
                              <option value="CUSTOM_RECURRING">Custom Recurring Period</option>
                            </ChakraSelect>
                          </FormControl>
                        </GridItem>

                        {formik.values.contractBillingType !== "MILESTONE" && (
                          <>
                            <GridItem>
                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">Periodic Rate (Rp. per cycle)</FormLabel>
                                <CurrencyInput
                                  size="sm"
                                  rounded="md"
                                  name="subscriptionPeriodValue"
                                  value={formik.values.subscriptionPeriodValue || 0}
                                  onChange={(_, val) => {
                                    formik.setFieldValue("subscriptionPeriodValue", val);
                                  }}
                                />
                              </FormControl>
                            </GridItem>

                            <GridItem>
                              <FormControl display="flex" alignItems="center" pt={4}>
                                <Switch
                                  id="subscriptionAutoRenew"
                                  colorScheme="teal"
                                  isChecked={!!formik.values.subscriptionAutoRenew}
                                  onChange={(e) => formik.setFieldValue("subscriptionAutoRenew", e.target.checked)}
                                  mr={2}
                                />
                                <FormLabel htmlFor="subscriptionAutoRenew" mb="0" fontSize="xs" fontWeight="bold" cursor="pointer">
                                  Auto-Renew Contract
                                </FormLabel>
                              </FormControl>
                            </GridItem>
                          </>
                        )}
                      </Grid>
                    </VStack>
                  </Box>

                  {/* Contract Register Date & Total Work Value */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.contractDate && !!formik.touched.contractDate} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Contract Register Date *</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("contractDate")} />
                        <FormErrorMessage>{formik.errors.contractDate}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.workValue && !!formik.touched.workValue} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Total Work Value (Rp.) *</FormLabel>
                        <CurrencyInput
                          size="sm"
                          rounded="md"
                          name="workValue"
                          value={formik.values.workValue}
                          onChange={(_, val) => handleWorkValueChange(val)}
                        />
                        {formik.values.contractBillingType !== "MILESTONE" ? (
                          <Text fontSize="2xs" color="purple.500" mt={1}>
                            Note: Untuk model langganan/subscription tanpa total pasti di muka, nilai total dapat diperkirakan atau digenerate otomatis dari jadwal TOP di bawah.
                          </Text>
                        ) : null}
                        <FormErrorMessage>{formik.errors.workValue}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Contract Start Date & Contract End Date */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.contractStartDate && !!formik.touched.contractStartDate} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Contract Start Date *</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("contractStartDate")} />
                        <FormErrorMessage>{formik.errors.contractStartDate}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl isInvalid={!!formik.errors.contractEndDate && !!formik.touched.contractEndDate} isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Contract End Date *</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("contractEndDate")} />
                        <FormErrorMessage>{formik.errors.contractEndDate}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 3: Terms of Payment (TOP) Schedule */}
            <Card rounded="2xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack spacing={3}>
                    <Box w={9} h={9} bg="teal.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                      <FiDollarSign size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Heading size="md">3. Terms of Payment (TOP) Schedule</Heading>
                        {formik.values.contractBillingType !== "MILESTONE" && (
                          <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                            {formik.values.contractBillingType}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">CAPEX/OPEX budget allocation, payment milestones, and recurring schedule</Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} wrap="wrap">
                    {formik.values.contractBillingType !== "MILESTONE" && (
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="solid"
                        leftIcon={<FiRepeat />}
                        onClick={() => handleQuickGenerateSubscriptionTop()}
                        title="Auto-generate periodic subscription schedule based on contract duration"
                      >
                        1-Click Generate Schedule
                      </Button>
                    )}

                    <FormControl display="flex" alignItems="center" w="auto">
                      <FormLabel htmlFor="toggle-top-dates" mb="0" fontSize="xs" fontWeight="bold" color="gray.600" cursor="pointer" mr={2}>
                        Include Due Dates
                      </FormLabel>
                      <Switch
                        id="toggle-top-dates"
                        size="sm"
                        colorScheme="teal"
                        isChecked={showTopDates}
                        onChange={(e) => setShowTopDates(e.target.checked)}
                      />
                    </FormControl>

                    <Button
                      size="sm"
                      colorScheme="teal"
                      variant="outline"
                      leftIcon={<FiSliders />}
                      onClick={topAutoAdjustModal.onOpen}
                      title="Auto calculate and adjust TOP payment schedule"
                    >
                      Auto Schedule
                    </Button>

                    <Button size="sm" colorScheme="teal" leftIcon={<FiPlus />} onClick={handleAddTopStep}>
                      Add Payment Step
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* CAPEX / OPEX Allocation inside Section 3 */}
                  <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50/60" : "gray.900"}>
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={2}>
                          <Icon as={FiLayers} color="teal.500" />
                          <Heading size="xs" color="gray.600" textTransform="uppercase">Budget Allocation (CAPEX / OPEX)</Heading>
                        </HStack>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" px={2.5} py={1} rounded="lg" fontSize="2xs">
                            CAPEX: {formik.values.capexPercentage || 0}% ({formatIDR(formik.values.cavexValues || 0)})
                          </Badge>
                          <Badge colorScheme="purple" px={2.5} py={1} rounded="lg" fontSize="2xs">
                            OPEX: {formik.values.ovexPercentage || 0}% ({formatIDR(formik.values.ovexValues || 0)})
                          </Badge>
                        </HStack>
                      </Flex>

                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        {/* CAPEX Card */}
                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.800"} bg={colorMode === "light" ? "blue.50/40" : "gray.800"}>
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Box w={3} h={3} rounded="full" bg="blue.500" />
                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "blue.700" : "blue.300"}>
                                  CAPEX Allocation
                                </Text>
                              </HStack>

                              <HStack spacing={1}>
                                <NumberInput
                                  size="sm"
                                  maxW="90px"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={formik.values.capexPercentage || 0}
                                  onChange={(_, valNum) => handleCapexPercentageChange(isNaN(valNum) ? 0 : valNum)}
                                >
                                  <NumberInputField rounded="md" textAlign="right" fontWeight="bold" fontSize="xs" />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">%</Text>
                              </HStack>
                            </Flex>

                            <Box pt={1} pb={1} px={1}>
                              <Slider
                                min={0}
                                max={100}
                                step={0.5}
                                colorScheme="blue"
                                value={formik.values.capexPercentage || 0}
                                onChange={(val) => handleCapexPercentageChange(val)}
                              >
                                <SliderTrack h="6px" rounded="full">
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb boxSize={5} shadow="md" bg="blue.500" />
                              </Slider>
                            </Box>

                            <FormControl>
                              <FormLabel fontSize="2xs" color="gray.500" fontWeight="bold">CAPEX Value (Rp.)</FormLabel>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name="cavexValues"
                                value={formik.values.cavexValues || 0}
                                onChange={(_, val) => handleCavexValueChange(val)}
                              />
                            </FormControl>
                          </VStack>
                        </Box>

                        {/* OPEX Card */}
                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.800"} bg={colorMode === "light" ? "purple.50/40" : "gray.800"}>
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Box w={3} h={3} rounded="full" bg="purple.500" />
                                <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "purple.700" : "purple.300"}>
                                  OPEX Allocation
                                </Text>
                              </HStack>

                              <HStack spacing={1}>
                                <NumberInput
                                  size="sm"
                                  maxW="90px"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={formik.values.ovexPercentage || 0}
                                  onChange={(_, valNum) => handleOvexPercentageChange(isNaN(valNum) ? 0 : valNum)}
                                >
                                  <NumberInputField rounded="md" textAlign="right" fontWeight="bold" fontSize="xs" />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">%</Text>
                              </HStack>
                            </Flex>

                            <Box pt={1} pb={1} px={1}>
                              <Slider
                                min={0}
                                max={100}
                                step={0.5}
                                colorScheme="purple"
                                value={formik.values.ovexPercentage || 0}
                                onChange={(val) => handleOvexPercentageChange(val)}
                              >
                                <SliderTrack h="6px" rounded="full">
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb boxSize={5} shadow="md" bg="purple.500" />
                              </Slider>
                            </Box>

                            <FormControl>
                              <FormLabel fontSize="2xs" color="gray.500" fontWeight="bold">OPEX Value (Rp.)</FormLabel>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name="ovexValues"
                                value={formik.values.ovexValues || 0}
                                onChange={(_, val) => handleOvexValueChange(val)}
                              />
                            </FormControl>
                          </VStack>
                        </Box>
                      </Grid>
                    </VStack>
                  </Box>

                  {/* Validation Card comparing TOP sum vs workValue */}
                  <Alert status={isTopMatch ? "success" : "warning"} rounded="xl">
                    <AlertIcon />
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight="bold">
                        Total TOP Schedule: {formatIDR(totalTopValues)} / Work Value: {formatIDR(formik.values.workValue)}
                      </Text>
                      <Text fontSize="2xs" opacity={0.85}>
                        {isTopMatch
                          ? "✓ Payment schedule sum perfectly matches the total contract work value."
                          : "⚠️ TOP schedule sum does not equal total work value. Adjust step amounts."}
                      </Text>
                    </Box>
                  </Alert>

                  {/* List TOP */}
                  {(formik.values.topList || []).map((top, idx) => (
                    <Box key={idx} p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"}>
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2}>
                            <Badge colorScheme="teal" rounded="md" px={2.5} py={0.5} fontSize="2xs">
                              Step #{top.stepOrder}
                            </Badge>
                            {top.billingPeriodStart && top.billingPeriodEnd && (
                              <Badge colorScheme="purple" rounded="md" px={2} py={0.5} fontSize="2xs">
                                Period: {top.billingPeriodStart} &rarr; {top.billingPeriodEnd}
                              </Badge>
                            )}
                          </HStack>

                          <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleRemoveTopStep(idx)} title="Remove step">
                            <FiTrash2 />
                          </Button>
                        </Flex>

                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: formik.values.contractBillingType !== "MILESTONE"
                              ? "1.2fr 1.8fr 1fr 1fr"
                              : showTopDates
                              ? "1fr 1fr 1fr"
                              : "1fr 2fr",
                          }}
                          gap={3}
                          alignItems="flex-start"
                        >
                          <GridItem>
                            <FormControl>
                              <FormLabel fontSize="2xs" fontWeight="bold">Payment Amount (Rp.) *</FormLabel>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name={`topList[${idx}].topValues`}
                                fieldCustom={`topList[${idx}].topValues`}
                                value={top.topValues || 0}
                                onChange={(field, val) => formik.setFieldValue(field, val)}
                              />
                            </FormControl>
                          </GridItem>

                          <GridItem>
                            <FormControl>
                              <FormLabel fontSize="2xs" fontWeight="bold">TOP Description / Milestone Note</FormLabel>
                              <Textarea
                                size="sm"
                                rounded="md"
                                rows={1}
                                placeholder="e.g. DP 30% after signing contract..."
                                value={top.topDescriptions || ""}
                                onChange={(e) => formik.setFieldValue(`topList[${idx}].topDescriptions`, e.target.value)}
                              />
                            </FormControl>
                          </GridItem>

                          {formik.values.contractBillingType !== "MILESTONE" ? (
                            <>
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">Period Start</FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={top.billingPeriodStart ? top.billingPeriodStart.split("T")[0] : ""}
                                    onChange={(e) => formik.setFieldValue(`topList[${idx}].billingPeriodStart`, e.target.value)}
                                  />
                                </FormControl>
                              </GridItem>
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">Period End</FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={top.billingPeriodEnd ? top.billingPeriodEnd.split("T")[0] : ""}
                                    onChange={(e) => formik.setFieldValue(`topList[${idx}].billingPeriodEnd`, e.target.value)}
                                  />
                                </FormControl>
                              </GridItem>
                            </>
                          ) : (
                            showTopDates && (
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">Scheduled Due Date (Optional)</FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={top.topDate ? top.topDate.split("T")[0] : ""}
                                    onChange={(e) => formik.setFieldValue(`topList[${idx}].topDate`, e.target.value)}
                                  />
                                </FormControl>
                              </GridItem>
                            )
                          )}
                        </Grid>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 4: Additional Guarantees & Contract Information */}
            <Card rounded="2xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
                <HStack spacing={3}>
                  <Box w={9} h={9} bg="orange.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <FiFileText size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">4. Additional Guarantees, Budget Allocation, & Information</Heading>
                    <Text fontSize="xs" color="gray.500">Maintenance warranty, performance bonds, and general contract remarks</Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                  {/* Maintenance Warranty */}
                  <Heading size="xs" color="gray.600" textTransform="uppercase">Maintenance Warranty Bond (Jaminan Pemeliharaan)</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Warranty Bond Value (Rp.)</FormLabel>
                        <CurrencyInput
                          size="sm"
                          rounded="md"
                          name="maintenanceWarrantyValues"
                          value={formik.values.maintenanceWarrantyValues || 0}
                          onChange={formik.setFieldValue}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Warranty Bond Start Date</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("maintenanceWarrantyStartDate")} />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Warranty Bond End Date</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("maintenanceWarrantyEndDate")} />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Performance Guarantee */}
                  <Heading size="xs" color="gray.600" textTransform="uppercase">Performance Bond (Jaminan Pelaksanaan)</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Performance Bond Value (Rp.)</FormLabel>
                        <CurrencyInput
                          size="sm"
                          rounded="md"
                          name="performanceGuaranteeValues"
                          value={formik.values.performanceGuaranteeValues || 0}
                          onChange={formik.setFieldValue}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Performance Bond Start Date</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("performanceGuaranteeStartDate")} />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Performance Bond End Date</FormLabel>
                        <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("performanceGuaranteeEndDate")} />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Divider />

                  {/* General Contract Remarks */}
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">General Contract Remarks / Note</FormLabel>
                    <Textarea
                      size="sm"
                      rounded="md"
                      rows={3}
                      textTransform="uppercase"
                      placeholder="ADD GENERAL CONTRACT NOTES, SLA COMMITMENTS, OR SPECIAL TERMS..."
                      name="note"
                      value={formik.values.note}
                      onChange={(e) => formik.setFieldValue("note", e.target.value.toUpperCase())}
                      onBlur={formik.handleBlur}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Footer Form Submission Action Bar inside Card */}
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <CardBody p={4}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <Link href="/vendor-management/contracts">
                    <Button size="md" variant="outline" leftIcon={<FiArrowLeft />}>
                      Cancel & Return
                    </Button>
                  </Link>

                  <Button
                    size="md"
                    colorScheme="teal"
                    leftIcon={<FiSave />}
                    type="submit"
                    isLoading={isSubmitting}
                    shadow="sm"
                  >
                    Submit Contract Registration
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </VStack>
        </form>
      </Box>

      {/* Modal 1: Vendor Selector Modal */}
      <ModalVendorSelector
        isOpen={vendorModal.isOpen}
        onClose={vendorModal.onClose}
        tokenData={tokenData}
        onSelectVendor={(vendor) => {
          setSelectedVendor(vendor);
          formik.setFieldValue("vendorId", vendor.id);
        }}
      />

      {/* Modal 2: Safety Confirmation Dialog with 5s Interval Countdown */}
      <Modal isOpen={confirmModal.isOpen} onClose={confirmModal.onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent rounded="2xl">
          <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
            <HStack spacing={2}>
              <Box w={8} h={8} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                <FiCheckCircle size={18} />
              </Box>
              <Text fontSize="md" fontWeight="bold">Confirm Contract Registration</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            <VStack spacing={3} align="stretch">
              <Text fontSize="xs" color="gray.600">
                Please verify the registration parameters before finalizing:
              </Text>

              <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.700"} fontSize="xs">
                <VStack align="start" spacing={1.5}>
                  {selectedProject && (
                    <Text><strong>Linked Project:</strong> {selectedProject.projectName} ({selectedProject.projectCode || selectedProject.projectNo})</Text>
                  )}
                  <Text><strong>Vendor:</strong> {selectedVendor?.vendorName} ({selectedVendor?.vendorCode})</Text>
                  <Text><strong>SPK / Corp Ref:</strong> {formik.values.corpNumber}</Text>
                  <Text><strong>Contract Narrative:</strong> {formik.values.corpName}</Text>
                  <Text><strong>Billing Model:</strong> <Badge colorScheme="purple" fontSize="2xs">{formik.values.contractBillingType || "MILESTONE"}</Badge></Text>
                  <Text><strong>Total Work Value:</strong> <span style={{ color: "#319795", fontWeight: "bold" }}>{formatIDR(formik.values.workValue)}</span></Text>
                  <Text><strong>TOP Steps:</strong> {formik.values.topList?.length || 0} payment steps ({formatIDR(totalTopValues)})</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={confirmModal.onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                bg="secondary.500"
                _hover={{ bg: "secondary.600" }}
                isDisabled={!canSubmit}
                isLoading={isSubmitting}
                onClick={handleExecuteSubmit}
                leftIcon={<FiCheck />}
              >
                {canSubmit ? "Confirm Submit" : `Confirm Submit (${countdown}s)`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Project Selector */}
      <ModalProjectSelector
        isOpen={projectModal.isOpen}
        onClose={projectModal.onClose}
        onSelectProject={handleSelectProject}
        tokenData={tokenData}
        selectedProjectId={formik.values.projectId}
      />

      {/* Modal Vendor Selector */}
      <ModalVendorSelector
        isOpen={vendorModal.isOpen}
        onClose={vendorModal.onClose}
        onSelectVendor={(v) => {
          setSelectedVendor(v);
          formik.setFieldValue("vendorId", v.id);
        }}
        tokenData={tokenData}
      />

      {/* Modal Auto Adjust TOP Schedule */}
      <ModalTopAutoAdjust
        isOpen={topAutoAdjustModal.isOpen}
        onClose={topAutoAdjustModal.onClose}
        workValue={formik.values.workValue || 0}
        contractStartDate={formik.values.contractStartDate}
        contractEndDate={formik.values.contractEndDate}
        initialBillingType={formik.values.contractBillingType}
        onApplySchedule={(generated) => formik.setFieldValue("topList", generated)}
      />
    </LayoutAdmin>
  );
};

export default VendorContractRegisterView;
