"use client";

import {
  Box, Button, ButtonGroup, Card, CardBody, Divider, Flex, FormControl,
  FormErrorMessage, FormLabel, Grid, GridItem, Heading, HStack,
  Icon, Input, Select as SelectC, Switch, Badge, Text, Textarea,
  VStack, useColorMode,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft, FiBriefcase, FiUser, FiTag, FiFileText, FiCheckCircle,
} from "react-icons/fi";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useVendor, { VendorInsertPayload } from "@/app/services/useVendor";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, VENDOR_TYPE_OPTIONS } from "@/app/constants/applicationConstants";

const DEPENDENCY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const IMPACT_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLACKLIST"];
const TDR_TYPE_OPTIONS = ["PERMANENT", "TEMPORARY"];

const ValidationSchema = Yup.object().shape({
  vendorCode: Yup.string().required("Vendor code is required").max(50),
  vendorName: Yup.string().required("Vendor name is required").max(200),
  vendorType: Yup.string().required("Vendor type is required"),
  address1: Yup.string().required("Address is required").max(200),
  city: Yup.string().required("City is required").max(200),
  country: Yup.string().required("Country is required").max(200),
  picBusinessName: Yup.string().required("Business PIC name is required"),
  picBusinessEmail: Yup.string().required("Business PIC email is required").email("Invalid email"),
  picTechnicalName: Yup.string().required("Technical PIC name is required"),
  picTechnicalEmail: Yup.string().required("Technical PIC email is required").email("Invalid email"),
  status: Yup.string().required("Status is required"),
  // TDR conditional
  tdrTrdNumber: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("TDR number is required") }),
  tdrTdrType: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("TDR type is required") }),
  tdrNpwpNumber: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("NPWP number is required") }),
  tdrYearRegistered: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Year registered is required") }),
  tdrBusinessType: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Business type is required") }),
  tdrBusinessSectorCode: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Business sector code is required") }),
  tdrBusinessSectorName: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Business sector name is required") }),
  tdrTimeInEffect: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Time in effect is required") }),
  tdrExpiredAt: Yup.string().when("hasTdr", { is: true, then: (s) => s.required("Expiry date is required") }),
});

interface FormValues {
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  country: string;
  postalCode: string;
  website: string;
  picBusinessName: string;
  picBusinessEmail: string;
  picBusinessNumberHotline: string;
  picTechnicalName: string;
  picTechnicalEmail: string;
  picTechnicalNumberHotline: string;
  status: string;
  reasonStatus: string;
  depedencyLevel: string;
  businessImpact: string;
  hasTdr: boolean;
  tdrTrdNumber: string;
  tdrTdrType: string;
  tdrNpwpNumber: string;
  tdrYearRegistered: string;
  tdrBusinessType: string;
  tdrBusinessSectorCode: string;
  tdrBusinessSectorName: string;
  tdrSubBusinessSector: string;
  tdrQualifications: string;
  tdrTimeInEffect: string;
  tdrExpiredAt: string;
}

const initialValues: FormValues = {
  vendorCode: "", vendorName: "", vendorType: "",
  address1: "", address2: "", address3: "",
  city: "", country: "", postalCode: "", website: "",
  picBusinessName: "", picBusinessEmail: "", picBusinessNumberHotline: "",
  picTechnicalName: "", picTechnicalEmail: "", picTechnicalNumberHotline: "",
  status: "ACTIVE", reasonStatus: "",
  depedencyLevel: "LOW", businessImpact: "LOW",
  hasTdr: false,
  tdrTrdNumber: "", tdrTdrType: "PERMANENT", tdrNpwpNumber: "",
  tdrYearRegistered: "", tdrBusinessType: "", tdrBusinessSectorCode: "",
  tdrBusinessSectorName: "", tdrSubBusinessSector: "", tdrQualifications: "",
  tdrTimeInEffect: "", tdrExpiredAt: "",
};

function VendorRegisterPage() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { Register } = useVendor();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [openConfirmRegister, setOpenConfirmRegister] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!tokenData) {
        showToast({ description: "Authentication required", statusToast: "error" });
        return;
      }
      try {
        setIsLoadingProcess(true);
        const payload: VendorInsertPayload = {
          vendorCode: values.vendorCode,
          vendorName: values.vendorName,
          vendorType: values.vendorType,
          address1: values.address1,
          address2: values.address2 || null,
          address3: values.address3 || null,
          city: values.city,
          country: values.country,
          postalCode: values.postalCode || null,
          website: values.website || null,
          picBusinessName: values.picBusinessName,
          picBusinessEmail: values.picBusinessEmail,
          picBusinessNumberHotline: values.picBusinessNumberHotline || null,
          picTechnicalName: values.picTechnicalName,
          picTechnicalEmail: values.picTechnicalEmail,
          picTechnicalNumberHotline: values.picTechnicalNumberHotline || null,
          status: values.status,
          reasonStatus: values.reasonStatus || null,
          depedencyLevel: values.depedencyLevel,
          businessImpact: values.businessImpact,
          tdr: values.hasTdr ? [{
            trdNumber: values.tdrTrdNumber,
            tdrType: values.tdrTdrType,
            npwpNumber: values.tdrNpwpNumber,
            yearRegistered: values.tdrYearRegistered,
            businessType: values.tdrBusinessType,
            businessSectorCode: values.tdrBusinessSectorCode,
            businessSectorName: values.tdrBusinessSectorName,
            subBusinessSector: values.tdrSubBusinessSector || null,
            qualifications: values.tdrQualifications || null,
            timeInEffect: values.tdrTimeInEffect,
            expiredAt: values.tdrExpiredAt,
          }] : [],
        };
        const res = await Register(payload, tokenData);
        if (!res || res.statusCode !== RES_CODE_OK) {
          showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
          return;
        }
        showToast({ description: "Vendor registered successfully", statusToast: "success" });
        router.push("/vendor-management");
      } catch {
        showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
      } finally {
        setIsLoadingProcess(false);
      }
    },
  });

  const handleUpperCase = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(field, e.target.value.toUpperCase());

  const inputStyle = {
    border: "1px",
    borderColor: colorMode === "light" ? "gray.300" : "gray.600",
    rounded: "xl",
    _focus: { borderColor: "blue.500" },
  };

  const sectionCard = {
    rounded: "xl", shadow: "sm", border: "1px",
    borderColor: colorMode === "light" ? "gray.200" : "gray.600",
    bg: colorMode === "light" ? "white" : "gray.800",
  };

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Register Vendor" breadCrumb={["Home", "Vendor Management", "Register"]} />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        <Button variant="ghost" leftIcon={<Icon as={FiArrowLeft} />}
          onClick={() => router.push("/vendor-management")} mb={6}
          color={colorMode === "light" ? "gray.600" : "gray.400"}>
          Back to Vendor List
        </Button>

        <form onSubmit={formik.handleSubmit}>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>

            {/* ── Main Form ── */}
            <GridItem>
              <VStack spacing={5} align="stretch">

                {/* Section: Basic Information */}
                <Card {...sectionCard}>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} mb={1}>
                        <Box w={9} h={9} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                          <Icon as={FiBriefcase} boxSize={4} />
                        </Box>
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>Basic Information</Heading>
                      </HStack>
                      <Divider />

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl isRequired isInvalid={!!(formik.errors.vendorCode && formik.touched.vendorCode)}>
                          <FormLabel fontWeight="semibold">Vendor Code</FormLabel>
                          <Input name="vendorCode" value={formik.values.vendorCode} onChange={handleUpperCase("vendorCode")} onBlur={formik.handleBlur} placeholder="e.g. VND-001" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.vendorCode}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!(formik.errors.vendorType && formik.touched.vendorType)}>
                          <FormLabel fontWeight="semibold">Vendor Type</FormLabel>
                          <ButtonGroup size="sm" isAttached variant="outline" w="full">
                            {VENDOR_TYPE_OPTIONS.map((type) => (
                              <Button
                                key={type}
                                flex={1}
                                colorScheme={formik.values.vendorType === type ? "blue" : "gray"}
                                variant={formik.values.vendorType === type ? "solid" : "outline"}
                                onClick={() => formik.setFieldValue("vendorType", type)}
                              >
                                {type}
                              </Button>
                            ))}
                          </ButtonGroup>
                          <FormErrorMessage>{formik.errors.vendorType}</FormErrorMessage>
                        </FormControl>
                      </Grid>

                      <FormControl isRequired isInvalid={!!(formik.errors.vendorName && formik.touched.vendorName)}>
                        <FormLabel fontWeight="semibold">Vendor Name</FormLabel>
                        <Input name="vendorName" value={formik.values.vendorName} onChange={handleUpperCase("vendorName")} onBlur={formik.handleBlur} placeholder="Full vendor company name" {...inputStyle} />
                        <FormErrorMessage>{formik.errors.vendorName}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold">Website</FormLabel>
                        <Input name="website" value={formik.values.website} onChange={formik.handleChange} placeholder="https://example.com" {...inputStyle} />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Section: Address */}
                <Card {...sectionCard}>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} mb={1}>
                        <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                          <Icon as={FiTag} boxSize={4} />
                        </Box>
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>Address</Heading>
                      </HStack>
                      <Divider />

                      <FormControl isRequired isInvalid={!!(formik.errors.address1 && formik.touched.address1)}>
                        <FormLabel fontWeight="semibold">Address Line 1</FormLabel>
                        <Input name="address1" value={formik.values.address1} onChange={handleUpperCase("address1")} onBlur={formik.handleBlur} placeholder="Street address" {...inputStyle} />
                        <FormErrorMessage>{formik.errors.address1}</FormErrorMessage>
                      </FormControl>

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl>
                          <FormLabel fontWeight="semibold">Address Line 2</FormLabel>
                          <Input name="address2" value={formik.values.address2} onChange={handleUpperCase("address2")} placeholder="Floor, unit, etc." {...inputStyle} />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="semibold">Address Line 3</FormLabel>
                          <Input name="address3" value={formik.values.address3} onChange={handleUpperCase("address3")} placeholder="Additional info" {...inputStyle} />
                        </FormControl>
                      </Grid>

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                        <FormControl isRequired isInvalid={!!(formik.errors.city && formik.touched.city)}>
                          <FormLabel fontWeight="semibold">City</FormLabel>
                          <Input name="city" value={formik.values.city} onChange={handleUpperCase("city")} onBlur={formik.handleBlur} placeholder="City" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.city}</FormErrorMessage>
                        </FormControl>
                        <FormControl isRequired isInvalid={!!(formik.errors.country && formik.touched.country)}>
                          <FormLabel fontWeight="semibold">Country</FormLabel>
                          <Input name="country" value={formik.values.country} onChange={handleUpperCase("country")} onBlur={formik.handleBlur} placeholder="Country" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.country}</FormErrorMessage>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="semibold">Postal Code</FormLabel>
                          <Input name="postalCode" value={formik.values.postalCode} onChange={formik.handleChange} placeholder="Postal code" {...inputStyle} />
                        </FormControl>
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Section: PIC */}
                <Card {...sectionCard}>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} mb={1}>
                        <Box w={9} h={9} bg="green.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                          <Icon as={FiUser} boxSize={4} />
                        </Box>
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>Person In Charge (PIC)</Heading>
                      </HStack>
                      <Divider />

                      <Text fontSize="xs" fontWeight="bold" color="blue.500" textTransform="uppercase">Business PIC</Text>
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl isRequired isInvalid={!!(formik.errors.picBusinessName && formik.touched.picBusinessName)}>
                          <FormLabel fontWeight="semibold">Name</FormLabel>
                          <Input name="picBusinessName" value={formik.values.picBusinessName} onChange={handleUpperCase("picBusinessName")} onBlur={formik.handleBlur} placeholder="Business PIC name" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.picBusinessName}</FormErrorMessage>
                        </FormControl>
                        <FormControl isRequired isInvalid={!!(formik.errors.picBusinessEmail && formik.touched.picBusinessEmail)}>
                          <FormLabel fontWeight="semibold">Email</FormLabel>
                          <Input name="picBusinessEmail" value={formik.values.picBusinessEmail} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="business@example.com" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.picBusinessEmail}</FormErrorMessage>
                        </FormControl>
                      </Grid>
                      <FormControl>
                        <FormLabel fontWeight="semibold">Hotline</FormLabel>
                        <Input name="picBusinessNumberHotline" value={formik.values.picBusinessNumberHotline} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 15); formik.setFieldValue("picBusinessNumberHotline", val); }} placeholder="Business hotline number" maxLength={15} inputMode="numeric" {...inputStyle} />
                      </FormControl>

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color="orange.500" textTransform="uppercase">Technical PIC</Text>
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl isRequired isInvalid={!!(formik.errors.picTechnicalName && formik.touched.picTechnicalName)}>
                          <FormLabel fontWeight="semibold">Name</FormLabel>
                          <Input name="picTechnicalName" value={formik.values.picTechnicalName} onChange={handleUpperCase("picTechnicalName")} onBlur={formik.handleBlur} placeholder="Technical PIC name" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.picTechnicalName}</FormErrorMessage>
                        </FormControl>
                        <FormControl isRequired isInvalid={!!(formik.errors.picTechnicalEmail && formik.touched.picTechnicalEmail)}>
                          <FormLabel fontWeight="semibold">Email</FormLabel>
                          <Input name="picTechnicalEmail" value={formik.values.picTechnicalEmail} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="technical@example.com" {...inputStyle} />
                          <FormErrorMessage>{formik.errors.picTechnicalEmail}</FormErrorMessage>
                        </FormControl>
                      </Grid>
                      <FormControl>
                        <FormLabel fontWeight="semibold">Hotline</FormLabel>
                        <Input name="picTechnicalNumberHotline" value={formik.values.picTechnicalNumberHotline} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 15); formik.setFieldValue("picTechnicalNumberHotline", val); }} placeholder="Technical hotline number" maxLength={15} inputMode="numeric" {...inputStyle} />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Section: Classification */}
                <Card {...sectionCard}>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} mb={1}>
                        <Box w={9} h={9} bg="orange.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                          <Icon as={FiTag} boxSize={4} />
                        </Box>
                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>Classification & Status</Heading>
                      </HStack>
                      <Divider />

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                        <FormControl isRequired isInvalid={!!(formik.errors.status && formik.touched.status)}>
                          <FormLabel fontWeight="semibold">Status</FormLabel>
                          <SelectC name="status" value={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur} {...inputStyle}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </SelectC>
                          <FormErrorMessage>{formik.errors.status}</FormErrorMessage>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="semibold">Dependency Level</FormLabel>
                          <SelectC name="depedencyLevel" value={formik.values.depedencyLevel} onChange={formik.handleChange} {...inputStyle}>
                            {DEPENDENCY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </SelectC>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="semibold">Business Impact</FormLabel>
                          <SelectC name="businessImpact" value={formik.values.businessImpact} onChange={formik.handleChange} {...inputStyle}>
                            {IMPACT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </SelectC>
                        </FormControl>
                      </Grid>

                      <FormControl>
                        <FormLabel fontWeight="semibold">Reason Status</FormLabel>
                        <Textarea name="reasonStatus" value={formik.values.reasonStatus} onChange={formik.handleChange} placeholder="Optional reason for current status" rows={2} resize="none" {...inputStyle} />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Section: TDR (Optional) — Hidden for now */}
                {false && <Card {...sectionCard}>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Box w={9} h={9} bg="teal.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FiFileText} boxSize={4} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>TDR Registration</Heading>
                            <Text fontSize="xs" color="gray.500">Tanda Daftar Rekanan (optional)</Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={3}>
                          <Text fontSize="sm" color="gray.500">{formik.values.hasTdr ? "Included" : "Skip"}</Text>
                          <Switch colorScheme="teal" isChecked={formik.values.hasTdr}
                            onChange={(e) => formik.setFieldValue("hasTdr", e.target.checked)} size="lg" />
                        </HStack>
                      </HStack>

                      {formik.values.hasTdr && (
                        <>
                          <Divider />
                          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTrdNumber && formik.touched.tdrTrdNumber)}>
                              <FormLabel fontWeight="semibold">TDR Number</FormLabel>
                              <Input name="tdrTrdNumber" value={formik.values.tdrTrdNumber} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="TDR registration number" {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrTrdNumber}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTdrType && formik.touched.tdrTdrType)}>
                              <FormLabel fontWeight="semibold">TDR Type</FormLabel>
                              <SelectC name="tdrTdrType" value={formik.values.tdrTdrType} onChange={formik.handleChange} onBlur={formik.handleBlur} {...inputStyle}>
                                {TDR_TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                              </SelectC>
                              <FormErrorMessage>{formik.errors.tdrTdrType}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrNpwpNumber && formik.touched.tdrNpwpNumber)}>
                              <FormLabel fontWeight="semibold">NPWP Number</FormLabel>
                              <Input name="tdrNpwpNumber" value={formik.values.tdrNpwpNumber} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Tax ID number" {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrNpwpNumber}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrYearRegistered && formik.touched.tdrYearRegistered)}>
                              <FormLabel fontWeight="semibold">Year Registered</FormLabel>
                              <Input name="tdrYearRegistered" value={formik.values.tdrYearRegistered} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 2024" maxLength={4} {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrYearRegistered}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessType && formik.touched.tdrBusinessType)}>
                              <FormLabel fontWeight="semibold">Business Type</FormLabel>
                              <Input name="tdrBusinessType" value={formik.values.tdrBusinessType} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. PT, CV" {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrBusinessType}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessSectorCode && formik.touched.tdrBusinessSectorCode)}>
                              <FormLabel fontWeight="semibold">Business Sector Code</FormLabel>
                              <Input name="tdrBusinessSectorCode" value={formik.values.tdrBusinessSectorCode} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Sector code" {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrBusinessSectorCode}</FormErrorMessage>
                            </FormControl>
                          </Grid>

                          <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessSectorName && formik.touched.tdrBusinessSectorName)}>
                            <FormLabel fontWeight="semibold">Business Sector Name</FormLabel>
                            <Input name="tdrBusinessSectorName" value={formik.values.tdrBusinessSectorName} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Sector name" {...inputStyle} />
                            <FormErrorMessage>{formik.errors.tdrBusinessSectorName}</FormErrorMessage>
                          </FormControl>

                          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                            <FormControl>
                              <FormLabel fontWeight="semibold">Sub Business Sector</FormLabel>
                              <Input name="tdrSubBusinessSector" value={formik.values.tdrSubBusinessSector} onChange={formik.handleChange} placeholder="Optional" {...inputStyle} />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontWeight="semibold">Qualifications</FormLabel>
                              <Input name="tdrQualifications" value={formik.values.tdrQualifications} onChange={formik.handleChange} placeholder="e.g. ISO 9001" {...inputStyle} />
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTimeInEffect && formik.touched.tdrTimeInEffect)}>
                              <FormLabel fontWeight="semibold">Time In Effect</FormLabel>
                              <Input name="tdrTimeInEffect" type="date" value={formik.values.tdrTimeInEffect} onChange={formik.handleChange} onBlur={formik.handleBlur} {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrTimeInEffect}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrExpiredAt && formik.touched.tdrExpiredAt)}>
                              <FormLabel fontWeight="semibold">Expired At</FormLabel>
                              <Input name="tdrExpiredAt" type="date" value={formik.values.tdrExpiredAt} onChange={formik.handleChange} onBlur={formik.handleBlur} {...inputStyle} />
                              <FormErrorMessage>{formik.errors.tdrExpiredAt}</FormErrorMessage>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>}

                {/* Action Buttons */}
                <HStack justify="end" spacing={4} pt={2}>
                  <Button variant="outline" colorScheme="gray" rounded="xl" px={8} size="lg"
                    onClick={() => router.push("/vendor-management")}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" rounded="xl" px={8} size="lg"
                    isLoading={IsLoadingProcess} loadingText="Registering..."
                    leftIcon={<Icon as={FiCheckCircle} />}
                    onClick={() => {
                      formik.validateForm().then((errors) => {
                        if (Object.keys(errors).length === 0) {
                          setOpenConfirmRegister(true);
                        } else {
                          formik.handleSubmit();
                        }
                      });
                    }}
                    _hover={{ transform: "translateY(-1px)", shadow: "lg" }} transition="all 0.2s">
                    Register Vendor
                  </Button>
                </HStack>

              </VStack>
            </GridItem>

            {/* ── Sidebar ── */}
            <GridItem>
              <VStack spacing={5} align="stretch" position="sticky" top="20px">

                {/* Summary Card */}
                <Card rounded={radiusStyle} shadow="lg" border="1px"
                  borderColor={colorMode === "light" ? "blue.300" : "blue.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"} overflow="hidden">
                  <Box bgGradient="linear(to-br, blue.600, blue.400)" p={4} color="white">
                    <HStack spacing={3}>
                      <Box w={10} h={10} bg="whiteAlpha.200" rounded="xl" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={FiBriefcase} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="sm">Vendor Summary</Heading>
                        <Text fontSize="xs" opacity={0.9}>Preview of your input</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <CardBody p={5}>
                    <VStack spacing={3} align="stretch" fontSize="sm">
                      {[
                        { label: "Code", value: formik.values.vendorCode },
                        { label: "Name", value: formik.values.vendorName },
                        { label: "Type", value: formik.values.vendorType },
                        { label: "City", value: formik.values.city },
                        { label: "Country", value: formik.values.country },
                      ].map(({ label, value }) => (
                        <Flex key={label} justify="space-between" align="center">
                          <Text color="gray.500">{label}</Text>
                          <Text fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"} noOfLines={1} maxW="60%">
                            {value || "—"}
                          </Text>
                        </Flex>
                      ))}
                      <Divider />
                      <Flex justify="space-between" align="center">
                        <Text color="gray.500">Status</Text>
                        <Badge colorScheme={formik.values.status === "ACTIVE" ? "green" : formik.values.status === "BLACKLIST" ? "red" : "orange"}
                          rounded="full" px={2}>
                          {formik.values.status}
                        </Badge>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text color="gray.500">Impact</Text>
                        <Badge colorScheme={formik.values.businessImpact === "HIGH" ? "red" : formik.values.businessImpact === "MEDIUM" ? "orange" : "gray"}
                          rounded="full" px={2}>
                          {formik.values.businessImpact}
                        </Badge>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text color="gray.500">TDR</Text>
                        <Badge colorScheme={formik.values.hasTdr ? "teal" : "gray"} rounded="full" px={2}>
                          {formik.values.hasTdr ? "Included" : "Not included"}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Tips Card */}
                <Card rounded={radiusStyle} shadow="md" border="1px"
                  borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                  bg={colorMode === "light" ? "blue.50" : "blue.900"}>
                  <CardBody p={5}>
                    <VStack spacing={2} align="start">
                      <Heading size="sm" color={colorMode === "light" ? "blue.800" : "blue.200"}>Tips</Heading>
                      {[
                        "Vendor code must be unique",
                        "Use a valid email for PIC contacts",
                        "TDR can be added later if not available now",
                        "Set status to ACTIVE for operational vendors",
                      ].map((tip) => (
                        <Text key={tip} fontSize="sm" color={colorMode === "light" ? "blue.700" : "blue.300"}>• {tip}</Text>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

              </VStack>
            </GridItem>

          </Grid>
        </form>
      </Box>

      <ConfirmationDialog
        key={"confirmRegisterVendor"}
        isOpenTrigger={openConfirmRegister}
        action={() => formik.handleSubmit()}
        trigger={setOpenConfirmRegister}
        questionMsg={"Apakah Anda yakin ingin mendaftarkan vendor ini?\n\nPastikan semua data yang diisi sudah benar sebelum melanjutkan."}
        captionMsg={"Register Vendor"}
      />
    </LayoutAdmin>
  );
}

export default VendorRegisterPage;
