"use client";

import { useState } from "react";
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
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiDollarSign,
  FiLock,
  FiPlus,
  FiSave,
  FiShield,
  FiSliders,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { useFormik } from "formik";
import * as yup from "yup";

import useVendor, {
  ContractTopInsertPayload,
  VendorContractInsertPayload,
  VendorContractResponse,
} from "@/app/services/useVendor";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import ModalTopAutoAdjust from "../../register/components/ModalTopAutoAdjust";

interface ContractEditTabPanelProps {
  contract: VendorContractResponse;
  tokenData: string;
  onRefreshData: () => void;
}

const validationSchema = yup.object({
  corpNumber: yup.string().required("Corporate SPK Number is required"),
  corpName: yup.string().required("Project Title is required"),
  contractNumber: yup.string().required("Contract Number is required"),
  contractDate: yup.string().required("Contract Date is required"),
  workValue: yup.number().min(0, "Work value cannot be negative"),
});

export const ContractEditTabPanel = ({
  contract,
  tokenData,
  onRefreshData,
}: ContractEditTabPanelProps) => {
  const { colorMode } = useColorMode();
  const { InsertContract } = useVendor();
  const showToast = useToastHelper();

  const confirmModal = useDisclosure();
  const topAutoAdjustModal = useDisclosure();

  const [showTopDates, setShowTopDates] = useState<boolean>(
    (contract.topList || []).some((t) => !!t.topDate)
  );
  const [countdown, setCountdown] = useState<number>(5);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialTopList: ContractTopInsertPayload[] = (contract.topList || []).map((t) => ({
    stepOrder: t.stepOrder,
    topValues: t.topValues || 0,
    topDate: t.topDate ? t.topDate.split("T")[0] : "",
    topDescriptions: t.topDescriptions || "",
    topStatus: t.topStatus || "ACTIVE",
  }));

  const formik = useFormik<VendorContractInsertPayload>({
    initialValues: {
      id: contract.id,
      vendorId: contract.vendorId,
      corpNumber: contract.corpNumber || "",
      corpName: contract.corpName || "",
      contractNumber: contract.contractNumber || "",
      contractDate: contract.contractDate ? contract.contractDate.split("T")[0] : new Date().toISOString().split("T")[0],
      workValue: contract.workValue || 0,
      note: contract.note || "",
      contractStartDate: contract.contractStartDate ? contract.contractStartDate.split("T")[0] : "",
      contractEndDate: contract.contractEndDate ? contract.contractEndDate.split("T")[0] : "",
      worksStartDate: contract.worksStartDate ? contract.worksStartDate.split("T")[0] : "",
      worksEndDate: contract.worksEndDate ? contract.worksEndDate.split("T")[0] : "",
      warrantyStartDate: contract.warrantyStartDate ? contract.warrantyStartDate.split("T")[0] : "",
      warrantyEndDate: contract.warrantyEndDate ? contract.warrantyEndDate.split("T")[0] : "",
      maintenanceStartDate: contract.maintenanceStartDate ? contract.maintenanceStartDate.split("T")[0] : "",
      maintenanceEndDate: contract.maintenanceEndDate ? contract.maintenanceEndDate.split("T")[0] : "",
      othersTimeline: contract.othersTimeline || "",
      termOfPayment: contract.termOfPayment || "",
      performanceGuaranteeStartDate: contract.performanceGuaranteeStartDate ? contract.performanceGuaranteeStartDate.split("T")[0] : "",
      performanceGuaranteeEndDate: contract.performanceGuaranteeEndDate ? contract.performanceGuaranteeEndDate.split("T")[0] : "",
      performanceGuaranteeValues: contract.performanceGuaranteeValues || 0,
      maintenanceWarrantyStartDate: contract.maintenanceWarrantyStartDate ? contract.maintenanceWarrantyStartDate.split("T")[0] : "",
      maintenanceWarrantyEndDate: contract.maintenanceWarrantyEndDate ? contract.maintenanceWarrantyEndDate.split("T")[0] : "",
      maintenanceWarrantyValues: contract.maintenanceWarrantyValues || 0,
      cavexValues: contract.cavexValues || 0,
      capexPercentage: contract.capexPercentage || 0,
      ovexValues: contract.ovexValues || 0,
      ovexPercentage: contract.ovexPercentage || 0,
      status: contract.status || "ACTIVE",
      items: [],
      topList: initialTopList.length > 0 ? initialTopList : [{ stepOrder: 1, topValues: 0, topDate: "", topDescriptions: "", topStatus: "ACTIVE" }],
    },
    validationSchema,
    onSubmit: async () => {
      setCountdown(5);
      setCanSubmit(false);
      confirmModal.onOpen();
    },
  });

  // Countdown handler for safety confirmation modal
  const handleOpenConfirm = () => {
    setCountdown(5);
    setCanSubmit(false);
    confirmModal.onOpen();

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setCanSubmit(true);
      }
    }, 1000);
  };

  // Synchronized CAPEX/OPEX Calculations
  const handleTotalWorkValueChange = (newWorkValue: number) => {
    formik.setFieldValue("workValue", newWorkValue);
    const capexPct = formik.values.capexPercentage || 0;
    const cavexVal = (capexPct / 100) * newWorkValue;
    const ovexVal = Math.max(0, newWorkValue - cavexVal);
    formik.setFieldValue("cavexValues", cavexVal);
    formik.setFieldValue("ovexValues", ovexVal);
  };

  const handleCapexValueChange = (inputVal: number) => {
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

  const totalTopValues = (formik.values.topList || []).reduce((acc, curr) => acc + (curr.topValues || 0), 0);
  const isTopMatch = totalTopValues === (formik.values.workValue || 0);

  const handleExecuteSave = async () => {
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
      topList: (formik.values.topList || []).map((t) => ({
        ...t,
        topDate: cleanDate(t.topDate),
      })),
    };

    const res = await InsertContract(sanitizedPayload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Contract updated successfully! Audit history snapshot recorded.", statusToast: "success" });
      confirmModal.onClose();
      onRefreshData();
    } else {
      showToast({ description: res?.message || "Failed to update contract", statusToast: "error" });
    }
    setIsSubmitting(false);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* SECTION 1: Vendor Partner (Readonly) & Basic Contract Info */}
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <HStack spacing={3}>
            <Box w={9} h={9} bg="secondary.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiBriefcase} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">1. Corporate Vendor & Basic Header Information</Heading>
              <Text fontSize="xs" color="gray.500">Vendor entity is locked to maintain contract audit integrity</Text>
            </VStack>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={5} align="stretch">
            {/* Vendor Partner Readonly Banner */}
            <Box p={4} rounded="xl" border="1px" borderColor="purple.300" bg={colorMode === "light" ? "purple.50/40" : "gray.700"}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="purple.500" rounded="xl" display="flex" alignItems="center" justifyContent="center" color="white">
                    <Icon as={FiUserCheck} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple" fontSize="2xs">Locked Vendor Partner</Badge>
                      <Badge colorScheme="blue" fontSize="2xs">{contract.vendorCode || "VEN-CODE"}</Badge>
                    </HStack>
                    <Text fontSize="md" fontWeight="bold">
                      {contract.vendorName || contract.vendor?.vendorName || "Vendor Company"}
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={1.5} fontSize="xs" color="gray.500" bg={colorMode === "light" ? "white" : "gray.800"} px={3} py={1.5} rounded="lg" border="1px" borderColor="gray.200">
                  <Icon as={FiLock} color="purple.500" />
                  <Text fontWeight="600">Vendor Entity Cannot Be Changed</Text>
                </HStack>
              </Flex>
            </Box>

            {/* Basic Contract Fields */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isReadOnly isDisabled>
                  <FormLabel fontSize="xs" fontWeight="bold">
                    <HStack spacing={1}>
                      <Text>SPK / Corporate Ref Number *</Text>
                      <Icon as={FiLock} color="gray.400" boxSize={3} />
                    </HStack>
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="md"
                    name="corpNumber"
                    value={formik.values.corpNumber}
                    isReadOnly
                    isDisabled
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    cursor="not-allowed"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={!!formik.errors.corpName && formik.touched.corpName}>
                  <FormLabel fontSize="xs" fontWeight="bold">Project / Contract Title *</FormLabel>
                  <Input
                    size="sm"
                    rounded="md"
                    placeholder="e.g. Enterprise Solution Development 2026"
                    name="corpName"
                    value={formik.values.corpName}
                    onChange={formik.handleChange}
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isReadOnly isDisabled>
                  <FormLabel fontSize="xs" fontWeight="bold">
                    <HStack spacing={1}>
                      <Text>Contract Official Number *</Text>
                      <Icon as={FiLock} color="gray.400" boxSize={3} />
                    </HStack>
                  </FormLabel>
                  <Input
                    size="sm"
                    rounded="md"
                    name="contractNumber"
                    value={formik.values.contractNumber}
                    isReadOnly
                    isDisabled
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    cursor="not-allowed"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={!!formik.errors.contractDate && formik.touched.contractDate}>
                  <FormLabel fontSize="xs" fontWeight="bold">Contract Signing Date *</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    rounded="md"
                    name="contractDate"
                    value={formik.values.contractDate}
                    onChange={formik.handleChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* SECTION 2: Monetary Work Value & CAPEX / OPEX Allocation */}
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <HStack spacing={3}>
            <Box w={9} h={9} bg="secondary.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiDollarSign} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">2. Contract Monetary Value & CAPEX / OPEX Allocation</Heading>
              <Text fontSize="xs" color="gray.500">Configure total work value (IDR) and financial category breakdown</Text>
            </VStack>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Total Work Value */}
            <FormControl isInvalid={!!formik.errors.workValue && formik.touched.workValue}>
              <FormLabel fontSize="xs" fontWeight="bold">Total Contract Work Value (Rp.) *</FormLabel>
              <CurrencyInput
                size="md"
                rounded="md"
                name="workValue"
                value={formik.values.workValue}
                onChange={(_, val) => handleTotalWorkValueChange(val)}
              />
            </FormControl>

            {/* CAPEX Allocation */}
            <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "blue.50/30" : "gray.800"}>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" fontWeight="bold" color="blue.600">CAPEX (Capital Expenditure)</Text>
                  <Badge colorScheme="blue" fontSize="2xs">{formik.values.capexPercentage || 0}%</Badge>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "1fr 140px" }} gap={3} alignItems="center">
                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="2xs">CAPEX Amount (Rp.)</FormLabel>
                      <CurrencyInput
                        size="sm"
                        rounded="md"
                        name="cavexValues"
                        value={formik.values.cavexValues || 0}
                        onChange={(_, val) => handleCapexValueChange(val)}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="2xs">CAPEX %</FormLabel>
                      <NumberInput
                        size="sm"
                        min={0}
                        max={100}
                        precision={1}
                        value={formik.values.capexPercentage || 0}
                        onChange={(_, val) => handleCapexPercentageChange(isNaN(val) ? 0 : val)}
                      >
                        <NumberInputField rounded="md" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Slider
                  value={formik.values.capexPercentage || 0}
                  min={0}
                  max={100}
                  step={0.5}
                  colorScheme="blue"
                  onChange={(val) => handleCapexPercentageChange(val)}
                >
                  <SliderTrack rounded="full">
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </VStack>
            </Box>

            {/* OPEX Allocation */}
            <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "purple.50/30" : "gray.800"}>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" fontWeight="bold" color="purple.600">OPEX (Operational Expenditure)</Text>
                  <Badge colorScheme="purple" fontSize="2xs">{formik.values.ovexPercentage || 0}%</Badge>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "1fr 140px" }} gap={3} alignItems="center">
                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="2xs">OPEX Amount (Rp.)</FormLabel>
                      <CurrencyInput
                        size="sm"
                        rounded="md"
                        name="ovexValues"
                        value={formik.values.ovexValues || 0}
                        onChange={(_, val) => handleOvexValueChange(val)}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="2xs">OPEX %</FormLabel>
                      <NumberInput
                        size="sm"
                        min={0}
                        max={100}
                        precision={1}
                        value={formik.values.ovexPercentage || 0}
                        onChange={(_, val) => handleOvexPercentageChange(isNaN(val) ? 0 : val)}
                      >
                        <NumberInputField rounded="md" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* SECTION 3: Execution Timelines & SLA Periods */}
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <HStack spacing={3}>
            <Box w={9} h={9} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiCalendar} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">3. Execution Timelines & SLA Periods</Heading>
              <Text fontSize="xs" color="gray.500">Contract validity range, project execution works, and warranty/maintenance SLAs</Text>
            </VStack>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={5} align="stretch">
            {/* Contract Validity */}
            <Heading size="xs" color="gray.600" textTransform="uppercase">Contract Validity Period</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isInvalid={!!formik.errors.contractStartDate && formik.touched.contractStartDate}>
                  <FormLabel fontSize="xs" fontWeight="bold">Contract Start Date *</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("contractStartDate")} />
                  <FormErrorMessage>{formik.errors.contractStartDate}</FormErrorMessage>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={!!formik.errors.contractEndDate && formik.touched.contractEndDate}>
                  <FormLabel fontSize="xs" fontWeight="bold">Contract End Date *</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("contractEndDate")} />
                  <FormErrorMessage>{formik.errors.contractEndDate}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Works Execution */}
            <Heading size="xs" color="gray.600" textTransform="uppercase">Project Works Execution Period</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Works Start Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("worksStartDate")} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Works End Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("worksEndDate")} />
                </FormControl>
              </GridItem>
            </Grid>

            {/* Warranty & Maintenance SLAs */}
            <Heading size="xs" color="gray.600" textTransform="uppercase">Warranty & Maintenance SLA Periods</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Warranty SLA Start Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("warrantyStartDate")} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Warranty SLA End Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("warrantyEndDate")} />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Maintenance SLA Start Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("maintenanceStartDate")} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Maintenance SLA End Date</FormLabel>
                  <Input size="sm" type="date" rounded="md" {...formik.getFieldProps("maintenanceEndDate")} />
                </FormControl>
              </GridItem>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* SECTION 4: Financial Guarantees & Bonds */}
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <HStack spacing={3}>
            <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiShield} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">4. Financial Guarantees & Bonds</Heading>
              <Text fontSize="xs" color="gray.500">Configure Performance Bond and Maintenance Warranty Bond values & validity dates</Text>
            </VStack>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Maintenance Warranty Bond */}
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

            <Divider />

            {/* Performance Guarantee Bond */}
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
          </VStack>
        </CardBody>
      </Card>

      {/* SECTION 5: Terms of Payment (TOP) Schedule */}
      <Card rounded="2xl" shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} py={4} roundedTop="2xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Box w={9} h={9} bg="teal.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiDollarSign} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md">5. Terms of Payment (TOP) Schedule</Heading>
                <Text fontSize="xs" color="gray.500">Define payment milestones, descriptions, and optional due dates</Text>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              <FormControl display="flex" alignItems="center" w="auto">
                <FormLabel htmlFor="toggle-edit-top-dates" mb="0" fontSize="xs" fontWeight="bold" color="gray.600" cursor="pointer" mr={2}>
                  Include Due Dates
                </FormLabel>
                <Switch
                  id="toggle-edit-top-dates"
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
          <VStack spacing={4} align="stretch">
            {/* Validation Alert comparing TOP sum vs workValue */}
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

            {(formik.values.topList || []).map((top, idx) => (
              <Box key={idx} p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme="teal" rounded="md" px={2.5} py={0.5} fontSize="2xs">
                      Step #{top.stepOrder}
                    </Badge>

                    <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleRemoveTopStep(idx)} title="Remove step">
                      <FiTrash2 />
                    </Button>
                  </Flex>

                  <Grid
                    templateColumns={
                      showTopDates
                        ? { base: "1fr", md: "1fr 1fr 1fr" }
                        : { base: "1fr", md: "1fr 2fr" }
                    }
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

                    {showTopDates && (
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
                    )}
                  </Grid>
                </VStack>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Save Button Bar */}
      <Flex justify="flex-end" pt={2}>
        <Button
          size="md"
          colorScheme="teal"
          leftIcon={<FiSave />}
          px={8}
          rounded="xl"
          shadow="lg"
          onClick={handleOpenConfirm}
        >
          Save Contract & TOP Changes
        </Button>
      </Flex>

      {/* 5-second Safety Confirmation Modal */}
      <Modal isOpen={confirmModal.isOpen} onClose={confirmModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent rounded="2xl">
          <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
            <HStack spacing={2}>
              <Icon as={FiSave} color="teal.500" />
              <Text fontSize="md" fontWeight="bold">Confirm Contract Edit</Text>
            </HStack>
          </ModalHeader>
          <ModalBody p={5}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="xs">
                Are you sure you want to save changes to this contract? A historical revision snapshot will automatically be archived in the contract audit logs.
              </Text>

              <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.700"} fontSize="xs">
                <VStack align="start" spacing={1.5}>
                  <Text><strong>SPK / Corp Ref:</strong> {formik.values.corpNumber}</Text>
                  <Text><strong>Project Title:</strong> {formik.values.corpName}</Text>
                  <Text><strong>Contract No:</strong> {formik.values.contractNumber}</Text>
                  <Text><strong>Total Work Value:</strong> <span style={{ color: "#319795", fontWeight: "bold" }}>{formatIDR(formik.values.workValue)}</span></Text>
                  <Text><strong>TOP Steps:</strong> {formik.values.topList?.length || 0} steps ({formatIDR(totalTopValues)})</Text>
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
                colorScheme="teal"
                isDisabled={!canSubmit}
                isLoading={isSubmitting}
                onClick={handleExecuteSave}
                leftIcon={<FiCheck />}
              >
                {canSubmit ? "Confirm Save Changes" : `Confirm Save (${countdown}s)`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Auto Adjust TOP Generator Modal */}
      <ModalTopAutoAdjust
        isOpen={topAutoAdjustModal.isOpen}
        onClose={topAutoAdjustModal.onClose}
        workValue={formik.values.workValue || 0}
        onApplySchedule={(generated) => formik.setFieldValue("topList", generated)}
      />
    </VStack>
  );
};

export default ContractEditTabPanel;
