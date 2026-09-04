"use client";

import { useEffect, useRef, useState } from "react";
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
  Spinner,
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
  Tooltip,
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
  FiInfo,
  FiLayers,
  FiPlus,
  FiRepeat,
  FiRefreshCw,
  FiSave,
  FiSliders,
  FiTrash2,
  FiUserCheck,
  FiCreditCard,
  FiPaperclip,
  FiUploadCloud,
  FiX,
  FiTag,
  FiHash,
  FiLink,
} from "react-icons/fi";
import { useFormik } from "formik";
import * as yup from "yup";

// Components & Services
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
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

const DATE_EXTEND_PRESETS = [
  { label: "+6 Mo", months: 6, years: 0 },
  { label: "+1 Yr", months: 0, years: 1 },
  { label: "+2 Yr", months: 0, years: 2 },
  { label: "+3 Yr", months: 0, years: 3 },
  { label: "+4 Yr", months: 0, years: 4 },
  { label: "+5 Yr", months: 0, years: 5 },
];

const validationSchema = yup.object({
  projectId: yup.string().required("Corporate Procurement Project is required"),
  vendorId: yup.string().required("Please select a vendor partner"),
  corpNumber: yup
    .string()
    .required("PKS Number / Agreement Number is required"),
  corpName: yup.string().required("Contract Narrative is required"),
  contractDate: yup.string().required("Contract Register Date is required"),
  workValue: yup
    .number()
    .min(0, "Work value cannot be negative")
    .required("Work Value is required"),
  contractStartDate: yup.string().required("Contract Start Date is required"),
  contractEndDate: yup.string().required("Contract End Date is required"),
});

const VendorContractRegisterView = () => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { InsertContract, UploadContractAttachment } = useVendor();

  const [tokenData, setTokenData] = useState<string>("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectDataResponse | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorResponse | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Contract Document Attachment state (Optional initial upload during register)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractFileCategory, setContractFileCategory] = useState<string>("PKS_MAIN");
  const [contractDocName, setContractDocName] = useState<string>("");
  const [contractDocNumber, setContractDocNumber] = useState<string>("");
  const [contractLinkAttachment, setContractLinkAttachment] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

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
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
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
        {
          stepOrder: 1,
          topValues: 0,
          topDate: "",
          topDescriptions: "",
          topStatus: "ACTIVE",
        },
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
      formik.setFieldValue(
        "corpName",
        (project.projectName || "").toUpperCase(),
      );
    }
  };

  const handleClearProject = () => {
    setSelectedProject(null);
    formik.setFieldValue("projectId", "");
  };

  const handleExecuteSubmit = async () => {
    if (!tokenData) return;
    setIsSubmitting(true);

    const cleanDate = (val?: string) =>
      val && val.trim() !== "" ? val : undefined;

    const sanitizedPayload: VendorContractInsertPayload = {
      ...formik.values,
      worksStartDate: cleanDate(formik.values.worksStartDate),
      worksEndDate: cleanDate(formik.values.worksEndDate),
      warrantyStartDate: cleanDate(formik.values.warrantyStartDate),
      warrantyEndDate: cleanDate(formik.values.warrantyEndDate),
      maintenanceStartDate: cleanDate(formik.values.maintenanceStartDate),
      maintenanceEndDate: cleanDate(formik.values.maintenanceEndDate),
      performanceGuaranteeStartDate: cleanDate(
        formik.values.performanceGuaranteeStartDate,
      ),
      performanceGuaranteeEndDate: cleanDate(
        formik.values.performanceGuaranteeEndDate,
      ),
      maintenanceWarrantyStartDate: cleanDate(
        formik.values.maintenanceWarrantyStartDate,
      ),
      maintenanceWarrantyEndDate: cleanDate(
        formik.values.maintenanceWarrantyEndDate,
      ),
      performanceGuaranteeValues: formik.values.performanceGuaranteeValues || 0,
      maintenanceWarrantyValues: formik.values.maintenanceWarrantyValues || 0,
      cavexValues: formik.values.cavexValues || 0,
      capexPercentage: formik.values.capexPercentage || 0,
      ovexValues: formik.values.ovexValues || 0,
      ovexPercentage: formik.values.ovexPercentage || 0,
      contractBillingType: formik.values.contractBillingType || "MILESTONE",
      subscriptionPeriodValue:
        formik.values.subscriptionPeriodValue || undefined,
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
      const createdContractId = res.data;

      // Upload initial contract document if file or link was attached during registration
      if (createdContractId && (contractFile || contractLinkAttachment.trim())) {
        try {
          const fileFormData = new FormData();
          fileFormData.append("ContractId", createdContractId);
          fileFormData.append("DocumentType", contractFileCategory || "PKS_MAIN");
          fileFormData.append(
            "DocumentName",
            contractDocName.trim() ||
              (contractFile
                ? contractFile.name.replace(/\.[^/.]+$/, "")
                : "PKS Contract Document")
          );
          fileFormData.append(
            "DocumentNumber",
            contractDocNumber.trim() || formik.values.contractNumber || ""
          );
          fileFormData.append(
            "DocumentDate",
            formik.values.contractDate
              ? new Date(formik.values.contractDate).toISOString()
              : new Date().toISOString()
          );
          fileFormData.append("DocumentVersion", "V.0");
          if (contractFile) {
            fileFormData.append("File", contractFile);
          }
          if (contractLinkAttachment.trim()) {
            fileFormData.append("LinkAttachment", contractLinkAttachment.trim());
          }

          await UploadContractAttachment(fileFormData, tokenData);
        } catch {
          // non-blocking for registration flow
        }
      }

      showToast({
        description: "Vendor Contract and attachments registered successfully!",
        statusToast: "success",
      });
      confirmModal.onClose();
      router.push("/vendor-management/contracts");
    } else {
      showToast({
        description: res?.message || "Failed to register contract",
        statusToast: "error",
      });
    }
    setIsSubmitting(false);
  };

  // Helper to extend any End Date based on paired Start Date (or current date if empty)
  const handleExtendEndDate = (
    baseDateStr: string | undefined | null,
    targetFieldPath: string,
    months: number,
    years: number,
  ) => {
    let baseDate: Date;
    if (baseDateStr && !isNaN(new Date(baseDateStr).getTime())) {
      baseDate = new Date(baseDateStr);
    } else {
      baseDate = new Date();
    }

    const targetDate = new Date(baseDate.getTime());
    if (months > 0) {
      targetDate.setMonth(targetDate.getMonth() + months);
    }
    if (years > 0) {
      targetDate.setFullYear(targetDate.getFullYear() + years);
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;

    formik.setFieldValue(targetFieldPath, formatted);
    formik.setFieldTouched(targetFieldPath, true, false);
  };

  // Quick 1-Click Subscription Schedule Generator
  const handleQuickGenerateSubscriptionTop = (billingType?: string) => {
    const type =
      billingType ||
      formik.values.contractBillingType ||
      "SUBSCRIPTION_MONTHLY";
    let start = formik.values.contractStartDate
      ? new Date(formik.values.contractStartDate)
      : new Date();
    let end = formik.values.contractEndDate
      ? new Date(formik.values.contractEndDate)
      : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

    if (isNaN(start.getTime())) start = new Date();
    if (isNaN(end.getTime()) || end <= start) {
      end = new Date(
        start.getFullYear() + 1,
        start.getMonth(),
        start.getDate(),
      );
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
        ? "Year"
        : type === "SUBSCRIPTION_SEMI_ANNUAL"
          ? "Semester"
          : type === "SUBSCRIPTION_QUARTERLY"
            ? "Quarter"
            : "Month";

    while (currentPeriodStart < end && step <= 120) {
      const nextMonthTarget = new Date(
        currentPeriodStart.getFullYear(),
        currentPeriodStart.getMonth() + stepMonths,
        0,
      );
      const periodEnd = nextMonthTarget > end ? new Date(end) : nextMonthTarget;

      const monthName = currentPeriodStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      list.push({
        stepOrder: step,
        topValues: formik.values.subscriptionPeriodValue || 0,
        topDescriptions: `Subscription ${freqLabel} #${step} (${monthName})`,
        topStatus: "ACTIVE",
        topDate: formatYMD(periodEnd),
        billingPeriodStart: formatYMD(currentPeriodStart),
        billingPeriodEnd: formatYMD(periodEnd),
        isAutoGenerated: true,
      });

      currentPeriodStart = new Date(
        periodEnd.getFullYear(),
        periodEnd.getMonth(),
        periodEnd.getDate() + 1,
      );
      step++;
    }

    const totalWV = formik.values.workValue || 0;
    if (
      totalWV > 0 &&
      (!formik.values.subscriptionPeriodValue ||
        formik.values.subscriptionPeriodValue === 0)
    ) {
      const totalSteps = Math.max(1, list.length);
      const baseAmount = Number((Math.floor((totalWV / totalSteps) * 100) / 100).toFixed(2));
      const remainder = Number((totalWV - baseAmount * (totalSteps - 1)).toFixed(2));
      list.forEach((item, idx) => {
        item.topValues =
          idx === totalSteps - 1 ? remainder : baseAmount;
      });
      formik.setFieldValue("subscriptionPeriodValue", baseAmount);
    } else if (
      formik.values.subscriptionPeriodValue &&
      formik.values.subscriptionPeriodValue > 0
    ) {
      const sum = Number(list.reduce((a, b) => a + (b.topValues || 0), 0).toFixed(2));
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
      {
        stepOrder: nextOrder,
        topValues: 0,
        topDate: "",
        topDescriptions: "",
        topStatus: "ACTIVE",
      },
    ]);
  };

  const handleRemoveTopStep = (index: number) => {
    const updated = [...(formik.values.topList || [])];
    updated.splice(index, 1);
    formik.setFieldValue("topList", updated);
  };

  const totalTopValues = (formik.values.topList || []).reduce(
    (acc, t) => acc + (t.topValues || 0),
    0,
  );
  const isTopMatch = Math.abs(totalTopValues - (formik.values.workValue || 0)) < 0.01;

  // Linked CAPEX / OPEX calculations relative to Total Work Value
  const handleWorkValueChange = (newWorkValue: number) => {
    formik.setFieldValue("workValue", newWorkValue);
    const capexPct = formik.values.capexPercentage || 0;
    const cavexVal = Number(((capexPct / 100) * newWorkValue).toFixed(2));
    const ovexVal = Number(Math.max(0, newWorkValue - cavexVal).toFixed(2));
    const ovexPct = parseFloat((100 - capexPct).toFixed(2));

    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
  };

  // Debounce timers & adjusting indicators for manual CAPEX and OPEX nominal input
  const [isCapexAdjusting, setIsCapexAdjusting] = useState(false);
  const [isOvexAdjusting, setIsOvexAdjusting] = useState(false);
  const capexDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const ovexDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (capexDebounceTimer.current) clearTimeout(capexDebounceTimer.current);
      if (ovexDebounceTimer.current) clearTimeout(ovexDebounceTimer.current);
    };
  }, []);

  // Sync CAPEX allocation with full validation and counterpart OPEX calculations
  const syncCavexAllocation = (inputVal: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedVal = Number(Math.min(Math.max(0, inputVal), totalWV).toFixed(2));
    const capexPct =
      totalWV > 0 ? parseFloat(((boundedVal / totalWV) * 100).toFixed(2)) : 0;
    const ovexVal = Number(Math.max(0, totalWV - boundedVal).toFixed(2));
    const ovexPct = parseFloat((100 - capexPct).toFixed(2));

    formik.setFieldValue("cavexValues", boundedVal);
    formik.setFieldValue("capexPercentage", capexPct);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
    setIsCapexAdjusting(false);
  };

  const handleCavexValueChange = (inputVal: number) => {
    // 1. Immediately update the input field so typing is responsive and smooth without jumping
    formik.setFieldValue("cavexValues", inputVal);
    setIsCapexAdjusting(true);

    // 2. Clear previous timer
    if (capexDebounceTimer.current) {
      clearTimeout(capexDebounceTimer.current);
    }

    // 3. Delay recalculation and cross-field adjustment by 3 seconds after user stops typing
    capexDebounceTimer.current = setTimeout(() => {
      syncCavexAllocation(inputVal);
    }, 3000);
  };

  const handleCavexBlur = () => {
    if (capexDebounceTimer.current) {
      clearTimeout(capexDebounceTimer.current);
    }
    syncCavexAllocation(formik.values.cavexValues || 0);
  };

  const handleCapexPercentageChange = (inputPct: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedPct = Math.min(Math.max(0, inputPct), 100);
    const cavexVal = Number(((boundedPct / 100) * totalWV).toFixed(2));
    const ovexPct = parseFloat((100 - boundedPct).toFixed(2));
    const ovexVal = Number(Math.max(0, totalWV - cavexVal).toFixed(2));

    formik.setFieldValue("capexPercentage", boundedPct);
    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
    formik.setFieldValue("ovexValues", ovexVal);
  };

  // Sync OPEX allocation with full validation and counterpart CAPEX calculations
  const syncOvexAllocation = (inputVal: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedVal = Number(Math.min(Math.max(0, inputVal), totalWV).toFixed(2));
    const ovexPct =
      totalWV > 0 ? parseFloat(((boundedVal / totalWV) * 100).toFixed(2)) : 0;
    const cavexVal = Number(Math.max(0, totalWV - boundedVal).toFixed(2));
    const capexPct = parseFloat((100 - ovexPct).toFixed(2));

    formik.setFieldValue("ovexValues", boundedVal);
    formik.setFieldValue("ovexPercentage", ovexPct);
    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("capexPercentage", capexPct);
    setIsOvexAdjusting(false);
  };

  const handleOvexValueChange = (inputVal: number) => {
    // 1. Immediately update the input field so typing is responsive and smooth without jumping
    formik.setFieldValue("ovexValues", inputVal);
    setIsOvexAdjusting(true);

    // 2. Clear previous timer
    if (ovexDebounceTimer.current) {
      clearTimeout(ovexDebounceTimer.current);
    }

    // 3. Delay recalculation and cross-field adjustment by 3 seconds after user stops typing
    ovexDebounceTimer.current = setTimeout(() => {
      syncOvexAllocation(inputVal);
    }, 3000);
  };

  const handleOvexBlur = () => {
    if (ovexDebounceTimer.current) {
      clearTimeout(ovexDebounceTimer.current);
    }
    syncOvexAllocation(formik.values.ovexValues || 0);
  };

  const handleOvexPercentageChange = (inputPct: number) => {
    const totalWV = formik.values.workValue || 0;
    const boundedPct = Math.min(Math.max(0, inputPct), 100);
    const ovexVal = Number(((boundedPct / 100) * totalWV).toFixed(2));
    const capexPct = parseFloat((100 - boundedPct).toFixed(2));
    const cavexVal = Number(Math.max(0, totalWV - ovexVal).toFixed(2));

    formik.setFieldValue("ovexPercentage", boundedPct);
    formik.setFieldValue("ovexValues", ovexVal);
    formik.setFieldValue("capexPercentage", capexPct);
    formik.setFieldValue("cavexValues", cavexVal);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

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
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardHeader
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
                py={4}
                roundedTop="2xl"
              >
                <HStack spacing={3}>
                  <Box
                    w={9}
                    h={9}
                    bg="blue.500"
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                  >
                    <FiBriefcase size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">
                      1. Corporate Vendor & Header Contract Data
                    </Heading>
                    <Text fontSize="xs" color="gray.500">
                      Select mandatory corporate procurement project and vendor
                      partner entity
                    </Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Corporate Procurement Project Selector Card (MANDATORY) */}
                  <FormControl
                    isInvalid={
                      !!formik.errors.projectId && !!formik.touched.projectId
                    }
                    isRequired
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <FormLabel fontSize="sm" fontWeight="bold" m={0}>
                        Corporate Procurement Project *
                      </FormLabel>
                      {selectedProject && (
                        <Badge
                          colorScheme="purple"
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          rounded="md"
                        >
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
                        <Flex
                          justify="space-between"
                          align="center"
                          wrap="wrap"
                          gap={3}
                        >
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
                                  {selectedProject.projectCode ||
                                    selectedProject.projectNo ||
                                    "NO-CODE"}
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
                                {selectedProject.proOwnerDivisionName ||
                                  "Division not set"}{" "}
                                •{" "}
                                {selectedProject.proOwnerDirectorateName ||
                                  "Directorate not set"}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              onClick={projectModal.onOpen}
                            >
                              Change Project
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={handleClearProject}
                            >
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
                        borderColor={
                          formik.errors.projectId && formik.touched.projectId
                            ? "red.400"
                            : colorMode === "light"
                              ? "purple.300"
                              : "purple.600"
                        }
                        color={
                          formik.errors.projectId && formik.touched.projectId
                            ? "red.500"
                            : colorMode === "light"
                              ? "purple.600"
                              : "purple.300"
                        }
                        leftIcon={<FiBriefcase size={20} />}
                        onClick={() => {
                          formik.setFieldTouched("projectId", true);
                          projectModal.onOpen();
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "purple.50" : "gray.700",
                        }}
                      >
                        Click to Search & Select Corporate Procurement Project
                        (Mandatory)
                      </Button>
                    )}
                    <FormErrorMessage>
                      {formik.errors.projectId}
                    </FormErrorMessage>
                  </FormControl>

                  {/* Vendor Selector Card */}
                  <FormControl
                    isInvalid={
                      !!formik.errors.vendorId && !!formik.touched.vendorId
                    }
                    isRequired
                  >
                    <FormLabel fontSize="sm" fontWeight="bold">
                      Vendor Partner *
                    </FormLabel>
                    {selectedVendor ? (
                      <Box
                        p={4}
                        rounded="xl"
                        border="1px"
                        borderColor="secondary.500"
                        bg={colorMode === "light" ? "secondary.50" : "gray.700"}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          wrap="wrap"
                          gap={3}
                        >
                          <HStack spacing={3}>
                            <Box
                              w={10}
                              h={10}
                              bg="secondary.500"
                              rounded="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                            >
                              <FiUserCheck size={20} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Badge colorScheme="blue">
                                  {selectedVendor.vendorCode}
                                </Badge>
                                <Badge colorScheme="purple">
                                  {selectedVendor.vendorType}
                                </Badge>
                              </HStack>
                              <Text fontSize="md" fontWeight="bold">
                                {selectedVendor.vendorName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {selectedVendor.city}, {selectedVendor.country}{" "}
                                • PIC: {selectedVendor.picBusinessName}
                              </Text>
                            </VStack>
                          </HStack>

                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={vendorModal.onOpen}
                          >
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
                        borderColor={
                          formik.errors.vendorId && formik.touched.vendorId
                            ? "red.400"
                            : "secondary.400"
                        }
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
                    <FormErrorMessage>
                      {formik.errors.vendorId}
                    </FormErrorMessage>
                  </FormControl>

                  {/* PKS Number & Contract Narrative */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 2fr" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.corpNumber &&
                          !!formik.touched.corpNumber
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          PKS Number / Agreement No. *
                        </FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          textTransform="uppercase"
                          placeholder="e.g. SPK/BJB/2026/089"
                          name="corpNumber"
                          value={formik.values.corpNumber}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "corpNumber",
                              e.target.value.toUpperCase(),
                            )
                          }
                          onBlur={formik.handleBlur}
                        />
                        <FormErrorMessage>
                          {formik.errors.corpNumber}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.corpName && !!formik.touched.corpName
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Contract Narrative *
                        </FormLabel>
                        <Textarea
                          size="sm"
                          rounded="md"
                          rows={2}
                          textTransform="uppercase"
                          placeholder="e.g. PENGADAAN PERANGKAT SERVER DAN INFRASTRUKTUR DATA CENTER..."
                          name="corpName"
                          value={formik.values.corpName}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "corpName",
                              e.target.value.toUpperCase(),
                            )
                          }
                          onBlur={formik.handleBlur}
                        />
                        <FormErrorMessage>
                          {formik.errors.corpName}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 2: Budget Allocation */}
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardHeader
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
                py={4}
                roundedTop="2xl"
              >
                <HStack spacing={3}>
                  <Box
                    w={9}
                    h={9}
                    bg="purple.500"
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                  >
                    <FiCalendar size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">2. Budget Allocation</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Configure contract billing model, register date, total
                      work value, and duration
                    </Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* Contract Billing Model & Recurring Setup */}
                  <Box
                    p={4}
                    rounded="xl"
                    border="1px solid"
                    borderColor={
                      colorMode === "light" ? "teal.200" : "teal.800"
                    }
                    bg={colorMode === "light" ? "teal.50/30" : "gray.800"}
                  >
                    <VStack align="stretch" spacing={3}>
                      <Flex
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={2}
                      >
                        <HStack spacing={2}>
                          <Icon as={FiRepeat} color="teal.500" />
                          <Text fontSize="xs" fontWeight="bold">
                            Contract Billing Model & Schedule Type
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={
                            formik.values.contractBillingType === "MILESTONE"
                              ? "blue"
                              : "purple"
                          }
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          rounded="md"
                        >
                          {formik.values.contractBillingType || "MILESTONE"}
                        </Badge>
                      </Flex>

                      <Grid
                        templateColumns={{
                          base: "1fr",
                          md:
                            formik.values.contractBillingType !== "MILESTONE"
                              ? "repeat(3, 1fr)"
                              : "1fr",
                        }}
                        gap={4}
                        alignItems="center"
                      >
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="2xs" fontWeight="bold">
                              Billing Model Type
                            </FormLabel>
                            <ChakraSelect
                              size="sm"
                              rounded="md"
                              name="contractBillingType"
                              value={
                                formik.values.contractBillingType || "MILESTONE"
                              }
                              onChange={(e) => {
                                const newType = e.target.value;
                                formik.setFieldValue(
                                  "contractBillingType",
                                  newType,
                                );
                              }}
                            >
                              <option value="MILESTONE">
                                Milestone / Deliverable Progress TOP
                              </option>
                              <option value="SUBSCRIPTION_MONTHLY">
                                Monthly Subscription
                              </option>
                              <option value="SUBSCRIPTION_QUARTERLY">
                                Quarterly Subscription (3 Months)
                              </option>
                              <option value="SUBSCRIPTION_SEMI_ANNUAL">
                                Semi-Annual Subscription (6 Months)
                              </option>
                              <option value="SUBSCRIPTION_ANNUAL">
                                Annual Subscription (Yearly)
                              </option>
                              <option value="CUSTOM_RECURRING">
                                Custom Recurring Period
                              </option>
                            </ChakraSelect>
                          </FormControl>
                        </GridItem>

                        {formik.values.contractBillingType !== "MILESTONE" && (
                          <>
                            <GridItem>
                              <FormControl>
                                <FormLabel fontSize="2xs" fontWeight="bold">
                                  Periodic Rate (Rp. per cycle)
                                </FormLabel>
                                <CurrencyInput
                                  size="sm"
                                  rounded="md"
                                  name="subscriptionPeriodValue"
                                  value={
                                    formik.values.subscriptionPeriodValue || 0
                                  }
                                  onChange={(_, val) => {
                                    formik.setFieldValue(
                                      "subscriptionPeriodValue",
                                      val,
                                    );
                                  }}
                                />
                              </FormControl>
                            </GridItem>

                            <GridItem>
                              <FormControl
                                display="flex"
                                alignItems="center"
                                pt={4}
                              >
                                <Switch
                                  id="subscriptionAutoRenew"
                                  colorScheme="teal"
                                  isChecked={
                                    !!formik.values.subscriptionAutoRenew
                                  }
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "subscriptionAutoRenew",
                                      e.target.checked,
                                    )
                                  }
                                  mr={2}
                                />
                                <FormLabel
                                  htmlFor="subscriptionAutoRenew"
                                  mb="0"
                                  fontSize="xs"
                                  fontWeight="bold"
                                  cursor="pointer"
                                >
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
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.contractDate &&
                          !!formik.touched.contractDate
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Contract Register Date *
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          isDisabled
                          {...formik.getFieldProps("contractDate")}
                        />
                        <FormErrorMessage>
                          {formik.errors.contractDate}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.workValue &&
                          !!formik.touched.workValue
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Total Work Value (Rp.) *
                        </FormLabel>
                        <CurrencyInput
                          size="sm"
                          rounded="md"
                          name="workValue"
                          value={formik.values.workValue}
                          onChange={(_, val) => handleWorkValueChange(val)}
                        />
                        {formik.values.contractBillingType !== "MILESTONE" ? (
                          <Text fontSize="2xs" color="purple.500" mt={1}>
                            Note: For subscription/recurring models without a
                            fixed total upfront, total value can be estimated or
                            auto-generated from the TOP schedule below.
                          </Text>
                        ) : null}
                        <FormErrorMessage>
                          {formik.errors.workValue}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Contract Start Date & Contract End Date */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.contractStartDate &&
                          !!formik.touched.contractStartDate
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Contract Start Date *
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps("contractStartDate")}
                        />
                        <FormErrorMessage>
                          {formik.errors.contractStartDate}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!formik.errors.contractEndDate &&
                          !!formik.touched.contractEndDate
                        }
                        isRequired
                      >
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Contract End Date *
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps("contractEndDate")}
                        />
                        <HStack spacing={1.5} mt={2} wrap="wrap">
                          <Text
                            fontSize="2xs"
                            color="gray.500"
                            fontWeight="bold"
                            mr={1}
                          >
                            Quick Extend:
                          </Text>
                          {DATE_EXTEND_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              size="xs"
                              variant="outline"
                              colorScheme="purple"
                              rounded="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              h="22px"
                              px={2}
                              onClick={() =>
                                handleExtendEndDate(
                                  formik.values.contractStartDate,
                                  "contractEndDate",
                                  preset.months,
                                  preset.years,
                                )
                              }
                              _hover={{
                                bg: "purple.500",
                                color: "white",
                              }}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </HStack>
                        <FormErrorMessage>
                          {formik.errors.contractEndDate}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 3: Terms of Payment (TOP) Schedule */}
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardHeader
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
                py={4}
                roundedTop="2xl"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <HStack spacing={3}>
                    <Box
                      w={9}
                      h={9}
                      bg="teal.500"
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                    >
                      <FiCreditCard size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Heading size="md">
                          3. Terms of Payment (TOP) Schedule
                        </Heading>
                        {formik.values.contractBillingType !== "MILESTONE" && (
                          <Badge
                            colorScheme="purple"
                            fontSize="2xs"
                            px={2}
                            py={0.5}
                            rounded="md"
                          >
                            {formik.values.contractBillingType}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        CAPEX/OPEX budget allocation, payment milestones, and
                        recurring schedule
                      </Text>
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
                      <FormLabel
                        htmlFor="toggle-top-dates"
                        mb="0"
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.600"
                        cursor="pointer"
                        mr={2}
                      >
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

                    <Button
                      size="sm"
                      colorScheme="teal"
                      leftIcon={<FiPlus />}
                      onClick={handleAddTopStep}
                    >
                      Add Payment Step
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  {/* CAPEX / OPEX Allocation inside Section 3 */}
                  <Box
                    p={4}
                    rounded="xl"
                    border="1px"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.700"
                    }
                    bg={colorMode === "light" ? "gray.50/60" : "gray.900"}
                  >
                    <VStack align="stretch" spacing={4}>
                      <Flex
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={2}
                      >
                        <HStack spacing={2}>
                          <Icon as={FiLayers} color="teal.500" />
                          <Heading
                            size="xs"
                            color="gray.600"
                            textTransform="uppercase"
                          >
                            Budget Allocation (CAPEX / OPEX)
                          </Heading>
                        </HStack>
                        <HStack spacing={2} wrap="wrap">
                          {(isCapexAdjusting || isOvexAdjusting) && (
                            <Badge
                              colorScheme="orange"
                              variant="solid"
                              px={2.5}
                              py={1}
                              rounded="lg"
                              fontSize="2xs"
                              display="flex"
                              alignItems="center"
                              gap={1.5}
                            >
                              <Spinner size="xs" color="white" />
                              Auto-adjusting allocations in 3s...
                            </Badge>
                          )}
                          <Badge
                            colorScheme="blue"
                            px={2.5}
                            py={1}
                            rounded="lg"
                            fontSize="2xs"
                          >
                            CAPEX: {formik.values.capexPercentage || 0}% (
                            {formatIDR(formik.values.cavexValues || 0)})
                          </Badge>
                          <Badge
                            colorScheme="purple"
                            px={2.5}
                            py={1}
                            rounded="lg"
                            fontSize="2xs"
                          >
                            OPEX: {formik.values.ovexPercentage || 0}% (
                            {formatIDR(formik.values.ovexValues || 0)})
                          </Badge>
                        </HStack>
                      </Flex>

                      {/* 3 Synced Allocation Helpers Info Banner */}
                      <HStack
                        spacing={2.5}
                        bg={colorMode === "light" ? "blue.50/70" : "gray.800"}
                        border="1px solid"
                        borderColor={
                          colorMode === "light" ? "blue.100" : "blue.900"
                        }
                        p={2.5}
                        rounded="lg"
                        fontSize="xs"
                        color={colorMode === "light" ? "blue.800" : "blue.200"}
                      >
                        <Icon as={FiInfo} color="blue.500" flexShrink={0} />
                        <Text>
                          <strong>3 Input Allocation Methods:</strong> You can
                          adjust budget distribution using{" "}
                          <strong>(1) Direct Percentage (%)</strong>,{" "}
                          <strong>(2) Interactive Slider</strong>, or{" "}
                          <strong>(3) Exact Nominal (Rp.)</strong>. All inputs
                          are bidirectional and automatically sync.
                        </Text>
                      </HStack>

                      <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={4}
                      >
                        {/* CAPEX Card */}
                        <Box
                          p={4}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "blue.200" : "blue.800"
                          }
                          bg={colorMode === "light" ? "blue.50/40" : "gray.800"}
                        >
                          <VStack align="stretch" spacing={3.5}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Box w={3} h={3} rounded="full" bg="blue.500" />
                                <VStack align="start" spacing={0}>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={
                                      colorMode === "light"
                                        ? "blue.700"
                                        : "blue.300"
                                    }
                                  >
                                    CAPEX Allocation
                                  </Text>
                                  <Text fontSize="2xs" color="gray.500">
                                    Method 1: Direct % Input
                                  </Text>
                                </VStack>
                              </HStack>

                              <Tooltip
                                label="Method 1: Enter exact percentage (0-100%)"
                                placement="top"
                                hasArrow
                              >
                                <HStack spacing={1}>
                                  <NumberInput
                                    size="sm"
                                    maxW="90px"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={formik.values.capexPercentage || 0}
                                    onChange={(_, valNum) =>
                                      handleCapexPercentageChange(
                                        isNaN(valNum) ? 0 : valNum,
                                      )
                                    }
                                  >
                                    <NumberInputField
                                      rounded="md"
                                      textAlign="right"
                                      fontWeight="bold"
                                      fontSize="xs"
                                    />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color="gray.500"
                                  >
                                    %
                                  </Text>
                                </HStack>
                              </Tooltip>
                            </Flex>

                            {/* Method 2: Slider */}
                            <VStack
                              align="stretch"
                              spacing={1}
                              pt={1}
                              pb={1}
                              px={1}
                            >
                              <Flex justify="space-between" align="center">
                                <HStack spacing={1}>
                                  <Icon
                                    as={FiSliders}
                                    fontSize="2xs"
                                    color="blue.500"
                                  />
                                  <Text
                                    fontSize="2xs"
                                    color="gray.500"
                                    fontWeight="bold"
                                  >
                                    Method 2: Slide to Adjust Ratio
                                  </Text>
                                </HStack>
                                <Text
                                  fontSize="2xs"
                                  color="blue.600"
                                  fontWeight="bold"
                                >
                                  {formik.values.capexPercentage || 0}%
                                </Text>
                              </Flex>
                              <Slider
                                min={0}
                                max={100}
                                step={0.5}
                                colorScheme="blue"
                                value={formik.values.capexPercentage || 0}
                                onChange={(val) =>
                                  handleCapexPercentageChange(val)
                                }
                              >
                                <SliderTrack h="6px" rounded="full">
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb
                                  boxSize={5}
                                  shadow="md"
                                  bg="blue.500"
                                />
                              </Slider>
                            </VStack>

                            {/* Method 3: Nominal Currency Input */}
                            <FormControl>
                              <Flex
                                justify="space-between"
                                align="center"
                                mb={1}
                              >
                                <FormLabel
                                  fontSize="2xs"
                                  color="gray.500"
                                  fontWeight="bold"
                                  mb={0}
                                >
                                  CAPEX Value (Rp.)
                                </FormLabel>
                                {isCapexAdjusting ? (
                                  <Badge
                                    colorScheme="orange"
                                    variant="subtle"
                                    fontSize="3xs"
                                    rounded="md"
                                    px={1.5}
                                    py={0.5}
                                    display="inline-flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Spinner size="xs" color="orange.500" />{" "}
                                    Auto-adjusting in 3s...
                                  </Badge>
                                ) : (
                                  <Text fontSize="2xs" color="gray.400">
                                    Method 3: Exact Nominal
                                  </Text>
                                )}
                              </Flex>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name="cavexValues"
                                value={formik.values.cavexValues || 0}
                                onChange={(_, val) =>
                                  handleCavexValueChange(val)
                                }
                                onBlur={handleCavexBlur}
                              />
                            </FormControl>
                          </VStack>
                        </Box>

                        {/* OPEX Card */}
                        <Box
                          p={4}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "purple.200" : "purple.800"
                          }
                          bg={
                            colorMode === "light" ? "purple.50/40" : "gray.800"
                          }
                        >
                          <VStack align="stretch" spacing={3.5}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Box
                                  w={3}
                                  h={3}
                                  rounded="full"
                                  bg="purple.500"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={
                                      colorMode === "light"
                                        ? "purple.700"
                                        : "purple.300"
                                    }
                                  >
                                    OPEX Allocation
                                  </Text>
                                  <Text fontSize="2xs" color="gray.500">
                                    Method 1: Direct % Input
                                  </Text>
                                </VStack>
                              </HStack>

                              <Tooltip
                                label="Method 1: Enter exact percentage (0-100%)"
                                placement="top"
                                hasArrow
                              >
                                <HStack spacing={1}>
                                  <NumberInput
                                    size="sm"
                                    maxW="90px"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={formik.values.ovexPercentage || 0}
                                    onChange={(_, valNum) =>
                                      handleOvexPercentageChange(
                                        isNaN(valNum) ? 0 : valNum,
                                      )
                                    }
                                  >
                                    <NumberInputField
                                      rounded="md"
                                      textAlign="right"
                                      fontWeight="bold"
                                      fontSize="xs"
                                    />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color="gray.500"
                                  >
                                    %
                                  </Text>
                                </HStack>
                              </Tooltip>
                            </Flex>

                            {/* Method 2: Slider */}
                            <VStack
                              align="stretch"
                              spacing={1}
                              pt={1}
                              pb={1}
                              px={1}
                            >
                              <Flex justify="space-between" align="center">
                                <HStack spacing={1}>
                                  <Icon
                                    as={FiSliders}
                                    fontSize="2xs"
                                    color="purple.500"
                                  />
                                  <Text
                                    fontSize="2xs"
                                    color="gray.500"
                                    fontWeight="bold"
                                  >
                                    Method 2: Slide to Adjust Ratio
                                  </Text>
                                </HStack>
                                <Text
                                  fontSize="2xs"
                                  color="purple.600"
                                  fontWeight="bold"
                                >
                                  {formik.values.ovexPercentage || 0}%
                                </Text>
                              </Flex>
                              <Slider
                                min={0}
                                max={100}
                                step={0.5}
                                colorScheme="purple"
                                value={formik.values.ovexPercentage || 0}
                                onChange={(val) =>
                                  handleOvexPercentageChange(val)
                                }
                              >
                                <SliderTrack h="6px" rounded="full">
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb
                                  boxSize={5}
                                  shadow="md"
                                  bg="purple.500"
                                />
                              </Slider>
                            </VStack>

                            {/* Method 3: Nominal Currency Input */}
                            <FormControl>
                              <Flex
                                justify="space-between"
                                align="center"
                                mb={1}
                              >
                                <FormLabel
                                  fontSize="2xs"
                                  color="gray.500"
                                  fontWeight="bold"
                                  mb={0}
                                >
                                  OPEX Value (Rp.)
                                </FormLabel>
                                {isOvexAdjusting ? (
                                  <Badge
                                    colorScheme="orange"
                                    variant="subtle"
                                    fontSize="3xs"
                                    rounded="md"
                                    px={1.5}
                                    py={0.5}
                                    display="inline-flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Spinner size="xs" color="orange.500" />{" "}
                                    Auto-adjusting in 3s...
                                  </Badge>
                                ) : (
                                  <Text fontSize="2xs" color="gray.400">
                                    Method 3: Exact Nominal
                                  </Text>
                                )}
                              </Flex>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name="ovexValues"
                                value={formik.values.ovexValues || 0}
                                onChange={(_, val) =>
                                  handleOvexValueChange(val)
                                }
                                onBlur={handleOvexBlur}
                              />
                            </FormControl>
                          </VStack>
                        </Box>
                      </Grid>
                    </VStack>
                  </Box>

                  {/* Validation Card comparing TOP sum vs workValue */}
                  <Alert
                    status={isTopMatch ? "success" : "warning"}
                    rounded="xl"
                  >
                    <AlertIcon />
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight="bold">
                        Total TOP Schedule: {formatIDR(totalTopValues)} / Work
                        Value: {formatIDR(formik.values.workValue)}
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
                    <Box
                      key={idx}
                      p={4}
                      rounded="xl"
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.700"
                      }
                      bg={colorMode === "light" ? "white" : "gray.800"}
                    >
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2}>
                            <Badge
                              colorScheme="teal"
                              rounded="md"
                              px={2.5}
                              py={0.5}
                              fontSize="xs"
                            >
                              Step #{top.stepOrder}
                            </Badge>
                            {top.billingPeriodStart && top.billingPeriodEnd && (
                              <Badge
                                colorScheme="purple"
                                rounded="md"
                                px={2}
                                py={0.5}
                                fontSize="xs"
                              >
                                Period: {top.billingPeriodStart} &rarr;{" "}
                                {top.billingPeriodEnd}
                              </Badge>
                            )}
                          </HStack>

                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveTopStep(idx)}
                            title="Remove step"
                          >
                            <FiTrash2 />
                          </Button>
                        </Flex>

                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md:
                              formik.values.contractBillingType !== "MILESTONE"
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
                              <FormLabel fontSize="2xs" fontWeight="bold">
                                Payment Amount (Rp.) *
                              </FormLabel>
                              <CurrencyInput
                                size="sm"
                                rounded="md"
                                name={`topList[${idx}].topValues`}
                                fieldCustom={`topList[${idx}].topValues`}
                                value={top.topValues || 0}
                                onChange={(field, val) =>
                                  formik.setFieldValue(field, val)
                                }
                              />
                            </FormControl>
                          </GridItem>

                          <GridItem>
                            <FormControl>
                              <FormLabel fontSize="2xs" fontWeight="bold">
                                TOP Description / Milestone Note
                              </FormLabel>
                              <Textarea
                                size="sm"
                                rounded="md"
                                rows={1}
                                placeholder="e.g. DP 30% after signing contract..."
                                value={top.topDescriptions || ""}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `topList[${idx}].topDescriptions`,
                                    e.target.value,
                                  )
                                }
                              />
                            </FormControl>
                          </GridItem>

                          {formik.values.contractBillingType !== "MILESTONE" ? (
                            <>
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">
                                    Period Start
                                  </FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={
                                      top.billingPeriodStart
                                        ? top.billingPeriodStart.split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `topList[${idx}].billingPeriodStart`,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </FormControl>
                              </GridItem>
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">
                                    Period End
                                  </FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={
                                      top.billingPeriodEnd
                                        ? top.billingPeriodEnd.split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `topList[${idx}].billingPeriodEnd`,
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <HStack spacing={1} mt={1.5} wrap="wrap">
                                    <Text
                                      fontSize="2xs"
                                      color="gray.500"
                                      fontWeight="bold"
                                      mr={0.5}
                                    >
                                      Quick:
                                    </Text>
                                    {DATE_EXTEND_PRESETS.map((preset) => (
                                      <Button
                                        key={preset.label}
                                        size="xs"
                                        variant="outline"
                                        colorScheme="purple"
                                        rounded="md"
                                        fontSize="2xs"
                                        fontWeight="bold"
                                        h="20px"
                                        px={1.5}
                                        onClick={() =>
                                          handleExtendEndDate(
                                            top.billingPeriodStart,
                                            `topList[${idx}].billingPeriodEnd`,
                                            preset.months,
                                            preset.years,
                                          )
                                        }
                                        _hover={{
                                          bg: "purple.500",
                                          color: "white",
                                        }}
                                      >
                                        {preset.label}
                                      </Button>
                                    ))}
                                  </HStack>
                                </FormControl>
                              </GridItem>
                            </>
                          ) : (
                            showTopDates && (
                              <GridItem>
                                <FormControl>
                                  <FormLabel fontSize="2xs" fontWeight="bold">
                                    Scheduled Due Date (Optional)
                                  </FormLabel>
                                  <Input
                                    size="sm"
                                    type="date"
                                    rounded="md"
                                    value={
                                      top.topDate
                                        ? top.topDate.split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `topList[${idx}].topDate`,
                                        e.target.value,
                                      )
                                    }
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
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardHeader
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
                py={4}
                roundedTop="2xl"
              >
                <HStack spacing={3}>
                  <Box
                    w={9}
                    h={9}
                    bg="orange.500"
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                  >
                    <FiFileText size={18} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">
                      4. Additional Guarantees, Budget Allocation, & Information
                    </Heading>
                    <Text fontSize="xs" color="gray.500">
                      Maintenance warranty, performance bonds, and general
                      contract remarks
                    </Text>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                  {/* Maintenance Warranty */}
                  <Heading size="xs" color="gray.600" textTransform="uppercase">
                    Maintenance Warranty Bond (Jaminan Pemeliharaan)
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Warranty Bond Value (Rp.)
                        </FormLabel>
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
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Warranty Bond Start Date
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps(
                            "maintenanceWarrantyStartDate",
                          )}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Warranty Bond End Date
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps(
                            "maintenanceWarrantyEndDate",
                          )}
                        />
                        <HStack spacing={1.5} mt={2} wrap="wrap">
                          <Text
                            fontSize="2xs"
                            color="gray.500"
                            fontWeight="bold"
                            mr={1}
                          >
                            Quick Extend:
                          </Text>
                          {DATE_EXTEND_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              size="xs"
                              variant="outline"
                              colorScheme="purple"
                              rounded="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              h="22px"
                              px={2}
                              onClick={() =>
                                handleExtendEndDate(
                                  formik.values.maintenanceWarrantyStartDate,
                                  "maintenanceWarrantyEndDate",
                                  preset.months,
                                  preset.years,
                                )
                              }
                              _hover={{
                                bg: "purple.500",
                                color: "white",
                              }}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </HStack>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Performance Guarantee */}
                  <Heading size="xs" color="gray.600" textTransform="uppercase">
                    Performance Bond (Jaminan Pelaksanaan)
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Performance Bond Value (Rp.)
                        </FormLabel>
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
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Performance Bond Start Date
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps(
                            "performanceGuaranteeStartDate",
                          )}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Performance Bond End Date
                        </FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          rounded="md"
                          {...formik.getFieldProps(
                            "performanceGuaranteeEndDate",
                          )}
                        />
                        <HStack spacing={1.5} mt={2} wrap="wrap">
                          <Text
                            fontSize="2xs"
                            color="gray.500"
                            fontWeight="bold"
                            mr={1}
                          >
                            Quick Extend:
                          </Text>
                          {DATE_EXTEND_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              size="xs"
                              variant="outline"
                              colorScheme="purple"
                              rounded="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              h="22px"
                              px={2}
                              onClick={() =>
                                handleExtendEndDate(
                                  formik.values.performanceGuaranteeStartDate,
                                  "performanceGuaranteeEndDate",
                                  preset.months,
                                  preset.years,
                                )
                              }
                              _hover={{
                                bg: "purple.500",
                                color: "white",
                              }}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </HStack>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Divider />

                  {/* General Contract Remarks */}
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">
                      General Contract Remarks / Note
                    </FormLabel>
                    <Textarea
                      size="sm"
                      rounded="md"
                      rows={3}
                      textTransform="uppercase"
                      placeholder="ADD GENERAL CONTRACT NOTES, SLA COMMITMENTS, OR SPECIAL TERMS..."
                      name="note"
                      value={formik.values.note}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "note",
                          e.target.value.toUpperCase(),
                        )
                      }
                      onBlur={formik.handleBlur}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 4: Contract Document & Supporting Files (MinIO Object Storage) */}
            <Card
              rounded="2xl"
              shadow="md"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <CardHeader
                borderBottom="1px"
                borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                py={4}
              >
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack spacing={3}>
                    <Flex
                      p={2}
                      rounded="lg"
                      bg={colorMode === "light" ? "teal.50" : "teal.900"}
                      color="teal.500"
                    >
                      <Icon as={FiPaperclip} boxSize={5} />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Heading size="sm">
                          SECTION 4: Contract Documents & Legal Files
                        </Heading>
                        <Badge colorScheme="teal" rounded="full" px={2} fontSize="2xs">
                          Optional Initial Upload
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Attach signed PKS agreements, SPK, or bank guarantees during registration (stored directly in MinIO Object Storage)
                      </Text>
                    </VStack>
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody p={6}>
                <VStack spacing={5} align="stretch">
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={4}
                    alignItems="flex-start"
                  >
                    <FormControl>
                      <FormLabel
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        fontSize="xs"
                        fontWeight="bold"
                        mb={1.5}
                        minH="20px"
                      >
                        <Icon as={FiTag} />
                        <span>Document Category</span>
                      </FormLabel>
                      <ChakraSelect
                        size="sm"
                        rounded="md"
                        value={contractFileCategory}
                        onChange={(e) => setContractFileCategory(e.target.value)}
                      >
                        <option value="PKS_MAIN">Perjanjian Kerjasama Utama (PKS / Contract Agreement)</option>
                        <option value="SPK">Surat Perintah Kerja (SPK / Purchase Order)</option>
                        <option value="ADDENDUM">Addendum / Contract Amendment Document</option>
                        <option value="PERFORMANCE_GUARANTEE">Performance Guarantee (Jaminan Pelaksanaan)</option>
                        <option value="WARRANTY_CERTIFICATE">Maintenance Warranty Certificate</option>
                        <option value="SLA_DOCUMENT">Service Level Agreement (SLA) & Terms</option>
                        <option value="OTHER">Other Legal / Supporting Document</option>
                      </ChakraSelect>
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        fontSize="xs"
                        fontWeight="bold"
                        mb={1.5}
                        minH="20px"
                      >
                        <Icon as={FiFileText} />
                        <span>Document Title</span>
                      </FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        placeholder="e.g. Surat Perjanjian Kerjasama Pengadaan Server 2026"
                        value={contractDocName}
                        onChange={(e) => setContractDocName(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        fontSize="xs"
                        fontWeight="bold"
                        mb={1.5}
                        minH="20px"
                      >
                        <Icon as={FiHash} />
                        <span>Document Reference Number</span>
                      </FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        placeholder="e.g. PKS/IT/2026/089"
                        value={contractDocNumber}
                        onChange={(e) => setContractDocNumber(e.target.value)}
                      />
                    </FormControl>
                  </Grid>

                  {/* Drag and Drop Box */}
                  <FormControl>
                    <FormLabel
                      display="inline-flex"
                      alignItems="center"
                      gap={1.5}
                      fontSize="xs"
                      fontWeight="bold"
                      mb={1.5}
                      minH="20px"
                    >
                      <Icon as={FiUploadCloud} />
                      <span>Attach Document File (PDF, DOCX, XLSX, Images, max 25MB)</span>
                    </FormLabel>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setContractFile(file);
                          if (!contractDocName) {
                            setContractDocName(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />

                    {!contractFile ? (
                      <Box
                        p={6}
                        border="2px dashed"
                        borderColor={
                          dragActive
                            ? "teal.400"
                            : colorMode === "light"
                            ? "gray.300"
                            : "gray.600"
                        }
                        rounded="xl"
                        bg={
                          dragActive
                            ? colorMode === "light"
                              ? "teal.50"
                              : "teal.900"
                            : colorMode === "light"
                            ? "gray.50"
                            : "gray.800"
                        }
                        textAlign="center"
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(false);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(true);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            setContractFile(file);
                            if (!contractDocName) {
                              setContractDocName(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          }
                        }}
                        transition="all 0.2s ease"
                        _hover={{
                          borderColor: "teal.400",
                          bg: colorMode === "light" ? "teal.50/50" : "gray.750",
                        }}
                      >
                        <VStack spacing={2}>
                          <Flex
                            p={3}
                            rounded="full"
                            bg={colorMode === "light" ? "teal.100" : "teal.800"}
                            color="teal.500"
                          >
                            <Icon as={FiUploadCloud} boxSize={6} />
                          </Flex>
                          <Text fontSize="sm" fontWeight="semibold">
                            Click to browse or drag and drop file here
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Supports PDF, DOCX, XLSX, Scanned Images (Up to 25 MB)
                          </Text>
                        </VStack>
                      </Box>
                    ) : (
                      <Box
                        p={3.5}
                        border="1px solid"
                        borderColor="teal.300"
                        rounded="xl"
                        bg={colorMode === "light" ? "teal.50/60" : "teal.950/40"}
                      >
                        <Flex justify="space-between" align="center">
                          <HStack spacing={3}>
                            <Flex
                              p={2}
                              rounded="lg"
                              bg="teal.500"
                              color="white"
                            >
                              <Icon as={FiFileText} boxSize={5} />
                            </Flex>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="bold" isTruncated maxW="280px">
                                {contractFile.name}
                              </Text>
                              <HStack spacing={2}>
                                <Badge colorScheme="teal" fontSize="3xs" rounded="md">
                                  {(contractFile.size / 1024).toFixed(1)} KB
                                </Badge>
                                <Text fontSize="3xs" color="gray.500">
                                  Will be stored in MinIO Object Storage upon submitting
                                </Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setContractFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            leftIcon={<FiX />}
                          >
                            Remove
                          </Button>
                        </Flex>
                      </Box>
                    )}
                  </FormControl>

                  {/* Alternative External Link */}
                  <FormControl>
                    <FormLabel
                      display="inline-flex"
                      alignItems="center"
                      gap={1.5}
                      fontSize="xs"
                      fontWeight="bold"
                      mb={1.5}
                      minH="20px"
                    >
                      <Icon as={FiLink} />
                      <span>Or External Cloud Document Link (Google Drive / SharePoint)</span>
                    </FormLabel>
                    <Input
                      size="sm"
                      rounded="md"
                      placeholder="https://drive.google.com/... or https://sharepoint.com/..."
                      value={contractLinkAttachment}
                      onChange={(e) => setContractLinkAttachment(e.target.value)}
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
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <Link href="/vendor-management/contracts">
                    <Button
                      size="md"
                      variant="outline"
                      leftIcon={<FiArrowLeft />}
                    >
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
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.onClose}
        isCentered
        size="md"
      >
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent rounded="2xl">
          <ModalHeader
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          >
            <HStack spacing={2}>
              <Box
                w={8}
                h={8}
                bg="blue.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <FiCheckCircle size={18} />
              </Box>
              <Text fontSize="md" fontWeight="bold">
                Confirm Contract Registration
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            <VStack spacing={3} align="stretch">
              <Text fontSize="xs" color="gray.600">
                Please verify the registration parameters before finalizing:
              </Text>

              <Box
                p={3}
                rounded="xl"
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                fontSize="xs"
              >
                <VStack align="start" spacing={1.5}>
                  {selectedProject && (
                    <Text>
                      <strong>Linked Project:</strong>{" "}
                      {selectedProject.projectName} (
                      {selectedProject.projectCode || selectedProject.projectNo}
                      )
                    </Text>
                  )}
                  <Text>
                    <strong>Vendor:</strong> {selectedVendor?.vendorName} (
                    {selectedVendor?.vendorCode})
                  </Text>
                  <Text>
                    <strong>SPK / Corp Ref:</strong> {formik.values.corpNumber}
                  </Text>
                  <Text>
                    <strong>Contract Narrative:</strong>{" "}
                    {formik.values.corpName}
                  </Text>
                  <Text>
                    <strong>Billing Model:</strong>{" "}
                    <Badge colorScheme="purple" fontSize="2xs">
                      {formik.values.contractBillingType || "MILESTONE"}
                    </Badge>
                  </Text>
                  <Text>
                    <strong>Total Work Value:</strong>{" "}
                    <span style={{ color: "#319795", fontWeight: "bold" }}>
                      {formatIDR(formik.values.workValue)}
                    </span>
                  </Text>
                  <Text>
                    <strong>TOP Steps:</strong>{" "}
                    {formik.values.topList?.length || 0} payment steps (
                    {formatIDR(totalTopValues)})
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
          >
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
                {canSubmit
                  ? "Confirm Submit"
                  : `Confirm Submit (${countdown}s)`}
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
        excludeHavingContract={true}
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
        onApplySchedule={(generated) =>
          formik.setFieldValue("topList", generated)
        }
      />
    </LayoutAdmin>
  );
};

export default VendorContractRegisterView;
