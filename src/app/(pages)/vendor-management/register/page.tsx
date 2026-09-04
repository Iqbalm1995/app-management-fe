"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
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
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Progress,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiBriefcase,
  FiUser,
  FiTag,
  FiFileText,
  FiCheckCircle,
  FiShield,
  FiMapPin,
  FiMail,
  FiPhone,
  FiGlobe,
  FiActivity,
  FiAlertCircle,
  FiHelpCircle,
  FiCheck,
  FiClock,
  FiSlash,
  FiPlusSquare,
  FiRefreshCw,
} from "react-icons/fi";

// Components & Services
import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useVendor, { VendorInsertPayload } from "@/app/services/useVendor";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  VENDOR_TYPE_OPTIONS,
} from "@/app/constants/applicationConstants";
import {
  Select as ChakraReactSelect,
  CreatableSelect as ChakraCreatableSelect,
} from "chakra-react-select";
import {
  getProvinceSelectOptions,
  getRegencySelectOptions,
  getDistrictSelectOptions,
  fetchSubDistrictsByDistrict,
  getPostalCodeForDistrict,
  getPostalCodeForSubDistrict,
  SelectItemOption,
} from "@/app/constants/locations/indonesiaAddressHelper";

const DEPENDENCY_OPTIONS = [
  { value: "LOW", label: "LOW (Low)" },
  { value: "MEDIUM", label: "MEDIUM (Moderate)" },
  { value: "HIGH", label: "HIGH (Critical / High)" },
];

const IMPACT_OPTIONS = [
  { value: "LOW", label: "LOW (Minor)" },
  { value: "MEDIUM", label: "MEDIUM (Moderate)" },
  { value: "HIGH", label: "HIGH (Significant / Critical)" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE (Active)", color: "green" },
  { value: "INACTIVE", label: "INACTIVE (Inactive / Review)", color: "orange" },
  { value: "BLACKLIST", label: "BLACKLIST (Suspended)", color: "red" },
];

const TDR_TYPE_OPTIONS = ["PERMANENT", "TEMPORARY"];

// ─── Yup Validation Schema ────────────────────────────────────────────────────
const ValidationSchema = Yup.object().shape({
  vendorCode: Yup.string()
    .required("Vendor code is required")
    .max(50, "Maximum 50 characters"),
  vendorName: Yup.string()
    .required("Vendor company name is required")
    .max(200, "Maximum 200 characters"),
  vendorType: Yup.string().required("Business entity type is required"),
  address1: Yup.string()
    .required("Primary address is required")
    .max(200, "Maximum 200 characters"),
  city: Yup.string()
    .required("City / Regency is required")
    .max(200, "Maximum 200 characters"),
  province: Yup.string()
    .max(200, "Maximum 200 characters")
    .optional(),
  district: Yup.string()
    .max(200, "Maximum 200 characters")
    .optional(),
  subDistrict: Yup.string()
    .max(200, "Maximum 200 characters")
    .optional(),
  country: Yup.string()
    .required("Country is required")
    .max(200, "Maximum 200 characters"),
  picBusinessName: Yup.string().required("Business PIC name is required"),
  picBusinessEmail: Yup.string()
    .required("Business PIC email is required")
    .email("Invalid email format"),
  picTechnicalName: Yup.string().required("Technical PIC name is required"),
  picTechnicalEmail: Yup.string()
    .required("Technical PIC email is required")
    .email("Invalid email format"),
  status: Yup.string().required("Status is required"),
  // TDR conditional validation
  tdrTrdNumber: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("TDR registration number is required"),
  }),
  tdrTdrType: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("TDR type is required"),
  }),
  tdrNpwpNumber: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Tax ID (NPWP) number is required"),
  }),
  tdrYearRegistered: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Registration year is required"),
  }),
  tdrBusinessType: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Business type is required"),
  }),
  tdrBusinessSectorCode: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Business sector code is required"),
  }),
  tdrBusinessSectorName: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Business sector name is required"),
  }),
  tdrTimeInEffect: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Start effective date is required"),
  }),
  tdrExpiredAt: Yup.string().when("hasTdr", {
    is: true,
    then: (s) => s.required("Expiry date is required"),
  }),
});

interface FormValues {
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  province: string;
  district: string;
  subDistrict: string;
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
  vendorCode: "",
  vendorName: "PT. ",
  vendorType: "PT",
  address1: "",
  address2: "",
  address3: "",
  city: "",
  province: "",
  district: "",
  subDistrict: "",
  country: "INDONESIA",
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
  hasTdr: false,
  tdrTrdNumber: "",
  tdrTdrType: "PERMANENT",
  tdrNpwpNumber: "",
  tdrYearRegistered: new Date().getFullYear().toString(),
  tdrBusinessType: "PT",
  tdrBusinessSectorCode: "",
  tdrBusinessSectorName: "",
  tdrSubBusinessSector: "",
  tdrQualifications: "",
  tdrTimeInEffect: "",
  tdrExpiredAt: "",
};

export default function VendorRegisterPage() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { Register, GenerateVendorCode } = useVendor();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [openConfirmRegister, setOpenConfirmRegister] = useState(false);

  const fetchVendorCode = async (token?: string) => {
    const t = token || tokenData;
    if (!t) return;
    try {
      setIsGeneratingCode(true);
      const res = await GenerateVendorCode(t);
      if (res && res.statusCode === RES_CODE_OK && res.data) {
        formik.setFieldValue("vendorCode", res.data);
      }
    } catch (err) {
      console.error("Error generating vendor code:", err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
    }
    if (token) {
      setTokenData(token);
      fetchVendorCode(token);
    }
  }, []);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!tokenData) {
        showToast({ description: "Authorization token not found. Please log in again.", statusToast: "error" });
        return;
      }
      try {
        setIsLoadingProcess(true);
        const payload: VendorInsertPayload = {
          vendorCode: values.vendorCode.trim(),
          vendorName: values.vendorName.trim(),
          vendorType: values.vendorType,
          address1: values.address1.trim(),
          address2: values.address2?.trim() || null,
          address3: values.address3?.trim() || null,
          city: values.city.trim().toUpperCase(),
          province: values.province?.trim().toUpperCase() || null,
          district: values.district?.trim().toUpperCase() || null,
          subDistrict: values.subDistrict?.trim().toUpperCase() || null,
          country: values.country.trim().toUpperCase(),
          postalCode: values.postalCode?.trim() || null,
          website: values.website?.trim() || null,
          picBusinessName: values.picBusinessName.trim(),
          picBusinessEmail: values.picBusinessEmail.trim(),
          picBusinessNumberHotline: values.picBusinessNumberHotline?.trim() || null,
          picTechnicalName: values.picTechnicalName.trim(),
          picTechnicalEmail: values.picTechnicalEmail.trim(),
          picTechnicalNumberHotline: values.picTechnicalNumberHotline?.trim() || null,
          status: values.status,
          reasonStatus: values.reasonStatus?.trim() || null,
          depedencyLevel: values.depedencyLevel,
          businessImpact: values.businessImpact,
          tdr: values.hasTdr
            ? [
                {
                  trdNumber: values.tdrTrdNumber.trim(),
                  tdrType: values.tdrTdrType,
                  npwpNumber: values.tdrNpwpNumber.trim(),
                  yearRegistered: values.tdrYearRegistered.trim(),
                  businessType: values.tdrBusinessType.trim(),
                  businessSectorCode: values.tdrBusinessSectorCode.trim(),
                  businessSectorName: values.tdrBusinessSectorName.trim(),
                  subBusinessSector: values.tdrSubBusinessSector?.trim() || null,
                  qualifications: values.tdrQualifications?.trim() || null,
                  timeInEffect: values.tdrTimeInEffect,
                  expiredAt: values.tdrExpiredAt,
                },
              ]
            : [],
        };

        const res = await Register(payload, tokenData);
        if (!res || res.statusCode !== RES_CODE_OK) {
          showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
          return;
        }
        showToast({ description: "Vendor partner successfully registered", statusToast: "success" });
        router.push("/vendor-management");
      } catch {
        showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
      } finally {
        setIsLoadingProcess(false);
      }
    },
  });

  const formatVendorNameWithPrefix = (name: string, entityType: string) => {
    const clean = name.replace(/^(PT\.?|CV\.?)\s*/i, "").trimStart();
    if (entityType === "PT") {
      return clean ? `PT. ${clean}` : "PT. ";
    }
    if (entityType === "CV") {
      return clean ? `CV. ${clean}` : "CV. ";
    }
    return clean;
  };

  const handleEntityTypeChange = (type: string) => {
    formik.setFieldValue("vendorType", type);
    // Sync default TDR business type
    formik.setFieldValue("tdrBusinessType", type);
    const currentName = formik.values.vendorName || "";
    const updatedName = formatVendorNameWithPrefix(currentName, type);
    formik.setFieldValue("vendorName", updatedName);
  };

  const handleVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    const entityType = formik.values.vendorType;
    if (entityType === "PT") {
      if (!val.startsWith("PT. ")) {
        const clean = val.replace(/^(PT\.?|PT\s*|\.?)\s*/i, "");
        val = `PT. ${clean}`;
      }
    } else if (entityType === "CV") {
      if (!val.startsWith("CV. ")) {
        const clean = val.replace(/^(CV\.?|CV\s*|\.?)\s*/i, "");
        val = `CV. ${clean}`;
      }
    }
    formik.setFieldValue("vendorName", val);
  };

  const handleUpperCase = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(field, e.target.value.toUpperCase());

  // Indonesian NPWP input mask formatter (e.g. 01.234.567.8-901.000)
  const formatIndonesianNPWP = (val: string): string => {
    const digits = val.replace(/\D/g, "").slice(0, 15);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12, 15)}`;
  };

  // Helper to extend TDR expiry date by months / years
  const handleExtendTdrExpiry = (months: number, years: number) => {
    const baseDateStr = formik.values.tdrTimeInEffect;
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

    formik.setFieldValue("tdrExpiredAt", formatted);
  };

  // Reusable input styling for clean focus and elevation
  const inputStyle = {
    bg: isDark ? "gray.750" : "gray.50",
    border: "1px",
    borderColor: isDark ? "gray.600" : "gray.300",
    rounded: "xl",
    h: "44px",
    fontSize: "md",
    _focus: {
      borderColor: "secondary.500",
      bg: isDark ? "gray.700" : "white",
      boxShadow: "0 0 0 1px #805ad5",
    },
  };

  // Styles for chakra-react-select with custom theme and dark mode
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      bg: isDark ? "gray.750" : "gray.50",
      borderColor: state.isFocused
        ? "#805ad5"
        : isDark
        ? "gray.600"
        : "gray.300",
      borderRadius: "0.75rem",
      minHeight: "44px",
      height: "44px",
      fontSize: "sm",
      boxShadow: state.isFocused ? "0 0 0 1px #805ad5" : "none",
      "&:hover": {
        borderColor: isDark ? "gray.500" : "gray.400",
      },
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 99999,
    }),
    menu: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.800" : "white",
      borderColor: isDark ? "gray.700" : "gray.200",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
      zIndex: 99999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      bg: state.isSelected
        ? "purple.500"
        : state.isFocused
        ? isDark
          ? "gray.700"
          : "purple.50"
        : "transparent",
      color: state.isSelected
        ? "white"
        : isDark
        ? "gray.100"
        : "gray.800",
      fontSize: "xs",
      fontWeight: state.isSelected ? "bold" : "normal",
      cursor: "pointer",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? "white" : "gray.800",
      fontSize: "sm",
      fontWeight: "500",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDark ? "gray.400" : "gray.500",
      fontSize: "sm",
    }),
  };

  // Regional Cascading Data & Handlers
  const isIndonesia = useMemo(() => {
    return (formik.values.country || "").trim().toUpperCase() === "INDONESIA";
  }, [formik.values.country]);

  const [subDistrictOptions, setSubDistrictOptions] = useState<SelectItemOption[]>([]);
  const [isLoadingSubDistricts, setIsLoadingSubDistricts] = useState<boolean>(false);

  const provinceOptions = useMemo(() => getProvinceSelectOptions(), []);

  const regencyOptions = useMemo(() => {
    if (!formik.values.province) return [];
    return getRegencySelectOptions(formik.values.province);
  }, [formik.values.province]);

  const districtOptions = useMemo(() => {
    if (!formik.values.province || !formik.values.city) return [];
    return getDistrictSelectOptions(formik.values.province, formik.values.city);
  }, [formik.values.province, formik.values.city]);

  useEffect(() => {
    let isMounted = true;
    if (formik.values.province && formik.values.city && formik.values.district && isIndonesia) {
      setIsLoadingSubDistricts(true);
      fetchSubDistrictsByDistrict(
        formik.values.province,
        formik.values.city,
        formik.values.district
      )
        .then((options) => {
          if (isMounted) {
            setSubDistrictOptions(options);
          }
        })
        .catch(() => {
          if (isMounted) {
            setSubDistrictOptions([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingSubDistricts(false);
          }
        });
    } else {
      setSubDistrictOptions([]);
    }
    return () => {
      isMounted = false;
    };
  }, [formik.values.province, formik.values.city, formik.values.district, isIndonesia]);

  const handleProvinceSelect = (option: SelectItemOption | null) => {
    const selected = option ? option.value : "";
    formik.setFieldValue("province", selected);
    formik.setFieldValue("city", "");
    formik.setFieldValue("district", "");
    formik.setFieldValue("subDistrict", "");
    formik.setFieldValue("postalCode", "");
  };

  const handleCitySelect = (option: SelectItemOption | null) => {
    const selected = option ? option.value : "";
    formik.setFieldValue("city", selected);
    formik.setFieldValue("district", "");
    formik.setFieldValue("subDistrict", "");
    formik.setFieldValue("postalCode", "");
  };

  const handleDistrictSelect = (option: SelectItemOption | null) => {
    const selected = option ? option.value : "";
    formik.setFieldValue("district", selected);
    formik.setFieldValue("subDistrict", "");
    if (selected && formik.values.province && formik.values.city) {
      const autoPostal = getPostalCodeForDistrict(
        formik.values.province,
        formik.values.city,
        selected
      );
      if (autoPostal) {
        formik.setFieldValue("postalCode", autoPostal);
      }
    }
  };

  const handleSubDistrictSelect = (option: SelectItemOption | null) => {
    const selected = option ? option.value.trim().toUpperCase() : "";
    formik.setFieldValue("subDistrict", selected);
    if (selected && formik.values.province && formik.values.city && formik.values.district) {
      const specificPostal = getPostalCodeForSubDistrict(
        formik.values.province,
        formik.values.city,
        formik.values.district,
        selected
      );
      if (specificPostal) {
        formik.setFieldValue("postalCode", specificPostal);
      }
    }
  };

  const sectionCardProps = {
    rounded: radiusStyle,
    shadow: "lg",
    border: "1px",
    borderColor: isDark ? "gray.700" : "gray.200",
    bg: isDark ? "gray.800" : "white",
  };

  // Live initials calculation
  const liveInitials = useMemo(() => {
    if (!formik.values.vendorName) return "VN";
    return formik.values.vendorName
      .replace(/^(PT|CV|UD|Firma|Koperasi)\.?\s*/i, "")
      .trim()
      .substring(0, 2)
      .toUpperCase() || "VN";
  }, [formik.values.vendorName]);

  // Form completion calculation
  const completionProgress = useMemo(() => {
    let completed = 0;
    const totalSteps = 5;

    // Step 1: Basic info
    if (formik.values.vendorCode && formik.values.vendorName && formik.values.vendorType) completed++;
    // Step 2: Address
    if (formik.values.address1 && formik.values.city && formik.values.country) completed++;
    // Step 3: PIC Business
    if (formik.values.picBusinessName && formik.values.picBusinessEmail) completed++;
    // Step 4: PIC Technical
    if (formik.values.picTechnicalName && formik.values.picTechnicalEmail) completed++;
    // Step 5: Classification
    if (formik.values.status && formik.values.depedencyLevel && formik.values.businessImpact) completed++;

    return Math.round((completed / totalSteps) * 100);
  }, [formik.values]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Register Master Vendor"
        breadCrumb={["Home", "Vendor Management", "Register"]}
      />

      {/* ── Modern Hero Banner ── */}
      <Box
        position="relative"
        bgColor={isDark ? "gray.800" : "white"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 4, sm: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "auto", md: "170px" }}
        py={{ base: 6, md: 0 }}
      >
        {/* Abstract Geometric Accents */}
        <Box
          position="absolute"
          top="-20px"
          right="20px"
          w="80px"
          h="80px"
          bg={isDark ? "whiteAlpha.200" : "secondary.100"}
          rounded="full"
        />
        <Box
          position="absolute"
          bottom="-10px"
          left="30px"
          w="60px"
          h="60px"
          bg={isDark ? "whiteAlpha.300" : "secondary.200"}
          transform="rotate(45deg)"
        />

        <VStack
          h="full"
          justify="center"
          align="stretch"
          px={{ base: 5, md: 8 }}
          position="relative"
          zIndex={1}
          spacing={3}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box
                w="56px"
                h="56px"
                bgGradient="linear(to-br, secondary.600, secondary.400)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="md"
              >
                <Icon as={FiPlusSquare} boxSize={7} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading
                  size="lg"
                  color={isDark ? "white" : "gray.900"}
                  fontWeight="800"
                  letterSpacing="tight"
                >
                  Register Master Vendor Partner
                </Heading>
                <Text
                  fontSize="md"
                  color={isDark ? "whiteAlpha.800" : "gray.600"}
                  fontWeight="500"
                >
                  Complete the registration form for corporate identity, domicile, PIC contacts, risk classification, and vendor legality
                </Text>
              </VStack>
            </HStack>

            {/* Quick Action / Back Button */}
            <Button
              variant="outline"
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push("/vendor-management")}
              rounded="xl"
              size="md"
              fontSize="sm"
              fontWeight="semibold"
              borderColor={isDark ? "gray.600" : "gray.300"}
              _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
            >
              Back to Vendors Directory
            </Button>
          </Flex>
        </VStack>
      </Box>

      {/* ── Main Layout Container ── */}
      <Box px={{ base: 4, sm: 5, md: 6 }} pb={12} w="full">
        <form onSubmit={formik.handleSubmit}>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={6}>
            {/* ── Left Form Canvas (8 Cols / ~67%) ── */}
            <GridItem colSpan={{ base: 12, lg: 8 }}>
              <VStack spacing={6} align="stretch">
                {/* ── SECTION 1: Identitas & Legalitas Perusahaan ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={5} align="stretch">
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
                          shadow="sm"
                        >
                          <Icon as={FiBriefcase} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={isDark ? "white" : "gray.800"}>
                            Identity & Business Entity Type
                          </Heading>
                          <Text fontSize="xs" color="gray.500">
                            Official vendor code, legal entity structure, and registered company name
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {/* Vendor Code */}
                        <FormControl isRequired isInvalid={!!(formik.errors.vendorCode && formik.touched.vendorCode)}>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Vendor Code
                          </FormLabel>
                          <InputGroup>
                            <Input
                              {...inputStyle}
                              name="vendorCode"
                              value={formik.values.vendorCode}
                              isReadOnly
                              isDisabled
                              bg={isDark ? "gray.750" : "gray.100"}
                              color={isDark ? "purple.300" : "purple.700"}
                              fontWeight="bold"
                              cursor="not-allowed"
                              placeholder={isGeneratingCode ? "Generating code..." : "e.g. VND-26-0001"}
                            />
                            <InputRightElement h="44px" pr={2}>
                              <Tooltip label="Refresh / Re-generate Vendor Code" placement="top" hasArrow>
                                <IconButton
                                  aria-label="Generate vendor code"
                                  icon={<FiRefreshCw className={isGeneratingCode ? "animate-spin" : ""} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="purple"
                                  isLoading={isGeneratingCode}
                                  onClick={() => fetchVendorCode()}
                                />
                              </Tooltip>
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>{formik.errors.vendorCode}</FormErrorMessage>
                        </FormControl>

                        {/* Vendor Type */}
                        <FormControl isRequired isInvalid={!!(formik.errors.vendorType && formik.touched.vendorType)}>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Business Entity Type
                          </FormLabel>
                          <ButtonGroup size="md" isAttached variant="outline" w="full">
                            {VENDOR_TYPE_OPTIONS.map((type) => {
                              const isSelected = formik.values.vendorType === type;
                              return (
                                <Button
                                  key={type}
                                  flex={1}
                                  h="44px"
                                  colorScheme={isSelected ? "purple" : "gray"}
                                  bg={isSelected ? "secondary.500" : isDark ? "gray.750" : "gray.50"}
                                  color={isSelected ? "white" : isDark ? "gray.200" : "gray.700"}
                                  borderColor={isSelected ? "secondary.500" : isDark ? "gray.600" : "gray.300"}
                                  onClick={() => handleEntityTypeChange(type)}
                                  fontSize="sm"
                                  fontWeight="bold"
                                  _hover={{
                                    bg: isSelected ? "secondary.600" : isDark ? "gray.700" : "gray.100",
                                  }}
                                >
                                  {type}
                                </Button>
                              );
                            })}
                          </ButtonGroup>
                          <FormErrorMessage>{formik.errors.vendorType}</FormErrorMessage>
                        </FormControl>
                      </SimpleGrid>

                      {/* Vendor Legal Name */}
                      <FormControl isRequired isInvalid={!!(formik.errors.vendorName && formik.touched.vendorName)}>
                        <FormLabel fontSize="sm" fontWeight="bold">
                          Company Legal Name / Vendor Name
                        </FormLabel>
                        <Input
                          name="vendorName"
                          value={formik.values.vendorName}
                          onChange={handleVendorNameChange}
                          onBlur={formik.handleBlur}
                          placeholder="Full company name (e.g. PT. MITRA SOLUSI TEKNOLOGI)"
                          {...inputStyle}
                        />
                        <FormErrorMessage>{formik.errors.vendorName}</FormErrorMessage>
                      </FormControl>

                      {/* Website */}
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="bold">
                          Official Website
                        </FormLabel>
                        <Input
                          name="website"
                          value={formik.values.website}
                          onChange={formik.handleChange}
                          placeholder="https://www.company-website.com (Optional)"
                          {...inputStyle}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── SECTION 2: Alamat & Domisili ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={5} align="stretch">
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
                          shadow="sm"
                        >
                          <Icon as={FiMapPin} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={isDark ? "white" : "gray.800"}>
                            Company Address & Domicile
                          </Heading>
                          <Text fontSize="xs" color="gray.500">
                            Operational headquarters location and vendor domicile region
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                      {/* Primary Address Line 1 */}
                      <FormControl isRequired isInvalid={!!(formik.errors.address1 && formik.touched.address1)}>
                        <FormLabel fontSize="sm" fontWeight="bold">
                          Primary Address (Line 1)
                        </FormLabel>
                        <Input
                          name="address1"
                          value={formik.values.address1}
                          onChange={handleUpperCase("address1")}
                          onBlur={formik.handleBlur}
                          placeholder="Street name, building number, or industrial estate"
                          {...inputStyle}
                        />
                        <FormErrorMessage>{formik.errors.address1}</FormErrorMessage>
                      </FormControl>

                      {/* Address Line 2 & 3 */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Address Line 2 (Optional)
                          </FormLabel>
                          <Input
                            name="address2"
                            value={formik.values.address2}
                            onChange={handleUpperCase("address2")}
                            placeholder="Floor, unit / block number"
                            {...inputStyle}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Address Line 3 (Optional)
                          </FormLabel>
                          <Input
                            name="address3"
                            value={formik.values.address3}
                            onChange={handleUpperCase("address3")}
                            placeholder="Complex / Landmark"
                            {...inputStyle}
                          />
                        </FormControl>
                      </SimpleGrid>

                      {/* Country */}
                      <FormControl isRequired isInvalid={!!(formik.errors.country && formik.touched.country)}>
                        <FormLabel fontSize="sm" fontWeight="bold">
                          Country / Negara
                        </FormLabel>
                        <Input
                          name="country"
                          value={formik.values.country}
                          onChange={handleUpperCase("country")}
                          onBlur={formik.handleBlur}
                          placeholder="INDONESIA"
                          {...inputStyle}
                        />
                        <FormErrorMessage>{formik.errors.country}</FormErrorMessage>
                      </FormControl>

                      {/* Cascading Regional Details */}
                      {isIndonesia ? (
                        <>
                          {/* Row 1: Province & City Searchable Select */}
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {/* Province */}
                            <FormControl isInvalid={!!(formik.errors.province && formik.touched.province)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Province / Provinsi
                              </FormLabel>
                              <ChakraReactSelect
                                id="select-province"
                                instanceId="select-province"
                                isSearchable
                                isClearable
                                placeholder="Pilih / Cari Provinsi..."
                                options={provinceOptions}
                                value={
                                  formik.values.province
                                    ? { value: formik.values.province, label: formik.values.province }
                                    : null
                                }
                                onChange={(opt: any) => handleProvinceSelect(opt as SelectItemOption | null)}
                                chakraStyles={selectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                menuPosition="fixed"
                              />
                              <FormErrorMessage>{formik.errors.province}</FormErrorMessage>
                            </FormControl>

                            {/* City / Regency */}
                            <FormControl isRequired isInvalid={!!(formik.errors.city && formik.touched.city)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                City / Regency (Kota / Kabupaten)
                              </FormLabel>
                              <ChakraReactSelect
                                id="select-city"
                                instanceId="select-city"
                                isSearchable
                                isClearable
                                isDisabled={!formik.values.province}
                                placeholder={
                                  !formik.values.province
                                    ? "Pilih Provinsi terlebih dahulu"
                                    : "Pilih / Cari Kota atau Kabupaten..."
                                }
                                options={regencyOptions}
                                value={
                                  formik.values.city
                                    ? { value: formik.values.city, label: formik.values.city }
                                    : null
                                }
                                onChange={(opt: any) => handleCitySelect(opt as SelectItemOption | null)}
                                chakraStyles={selectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                menuPosition="fixed"
                              />
                              <FormErrorMessage>{formik.errors.city}</FormErrorMessage>
                            </FormControl>
                          </SimpleGrid>

                          {/* Row 2: District (Kecamatan), Sub-District (Kelurahan), & Postal Code */}
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            {/* District / Kecamatan */}
                            <FormControl isInvalid={!!(formik.errors.district && formik.touched.district)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                District (Kecamatan)
                              </FormLabel>
                              <ChakraReactSelect
                                id="select-district"
                                instanceId="select-district"
                                isSearchable
                                isClearable
                                isDisabled={!formik.values.city}
                                placeholder={
                                  !formik.values.city
                                    ? "Pilih Kota terlebih dahulu"
                                    : "Pilih / Cari Kecamatan..."
                                }
                                options={districtOptions}
                                value={
                                  formik.values.district
                                    ? { value: formik.values.district, label: formik.values.district }
                                    : null
                                }
                                onChange={(opt: any) => handleDistrictSelect(opt as SelectItemOption | null)}
                                chakraStyles={selectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                menuPosition="fixed"
                              />
                              <FormErrorMessage>{formik.errors.district}</FormErrorMessage>
                            </FormControl>

                            {/* Sub-District / Kelurahan / Desa */}
                            <FormControl isInvalid={!!(formik.errors.subDistrict && formik.touched.subDistrict)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Sub-District (Kelurahan / Desa)
                              </FormLabel>
                              <ChakraCreatableSelect
                                id="select-subdistrict"
                                instanceId="select-subdistrict"
                                isSearchable
                                isClearable
                                isDisabled={!formik.values.district}
                                isLoading={isLoadingSubDistricts}
                                placeholder={
                                  !formik.values.district
                                    ? "Pilih Kecamatan terlebih dahulu"
                                    : isLoadingSubDistricts
                                    ? "Memuat kelurahan/desa..."
                                    : "Pilih / Ketik Kelurahan..."
                                }
                                options={subDistrictOptions}
                                value={
                                  formik.values.subDistrict
                                    ? { value: formik.values.subDistrict, label: formik.values.subDistrict }
                                    : null
                                }
                                onChange={(opt: any) => handleSubDistrictSelect(opt as SelectItemOption | null)}
                                chakraStyles={selectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                menuPosition="fixed"
                                formatCreateLabel={(inputValue) => `Gunakan "${inputValue.toUpperCase()}"`}
                              />
                              <FormErrorMessage>{formik.errors.subDistrict}</FormErrorMessage>
                            </FormControl>

                            {/* Postal Code */}
                            <FormControl isInvalid={!!(formik.errors.postalCode && formik.touched.postalCode)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Postal Code (Kode Pos)
                              </FormLabel>
                              <Input
                                name="postalCode"
                                value={formik.values.postalCode}
                                onChange={formik.handleChange}
                                placeholder="e.g. 40132"
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.postalCode}</FormErrorMessage>
                            </FormControl>
                          </SimpleGrid>
                        </>
                      ) : (
                        /* International Address Fallback */
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                          <FormControl isInvalid={!!(formik.errors.province && formik.touched.province)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              State / Province
                            </FormLabel>
                            <Input
                              name="province"
                              value={formik.values.province}
                              onChange={handleUpperCase("province")}
                              placeholder="e.g. California"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.province}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired isInvalid={!!(formik.errors.city && formik.touched.city)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              City / Municipality
                            </FormLabel>
                            <Input
                              name="city"
                              value={formik.values.city}
                              onChange={handleUpperCase("city")}
                              placeholder="e.g. San Francisco"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.city}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!(formik.errors.district && formik.touched.district)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              District / County
                            </FormLabel>
                            <Input
                              name="district"
                              value={formik.values.district}
                              onChange={handleUpperCase("district")}
                              placeholder="e.g. Bay Area"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.district}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!(formik.errors.subDistrict && formik.touched.subDistrict)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Sub-District / Locality
                            </FormLabel>
                            <Input
                              name="subDistrict"
                              value={formik.values.subDistrict}
                              onChange={handleUpperCase("subDistrict")}
                              placeholder="e.g. Downtown"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.subDistrict}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!(formik.errors.postalCode && formik.touched.postalCode)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Postal Code / ZIP
                            </FormLabel>
                            <Input
                              name="postalCode"
                              value={formik.values.postalCode}
                              onChange={formik.handleChange}
                              placeholder="94105"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.postalCode}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── SECTION 3: Person In Charge (PIC) ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={5} align="stretch">
                      <HStack spacing={3}>
                        <Box
                          w={10}
                          h={10}
                          bg="blue.500"
                          rounded="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          shadow="sm"
                        >
                          <Icon as={FiUser} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={isDark ? "white" : "gray.800"}>
                            Person In Charge (PIC) Contacts
                          </Heading>
                          <Text fontSize="xs" color="gray.500">
                            Official contact persons for commercial/business and technical operations
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                      {/* Sub-Section: PIC Bisnis */}
                      <Box>
                        <HStack spacing={2} mb={3}>
                          <Badge colorScheme="blue" variant="solid" rounded="md" px={2.5} py={0.5} fontSize="xs">
                            Business / Commercial PIC
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            (Quotations, contracts & administrative correspondence)
                          </Text>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isRequired isInvalid={!!(formik.errors.picBusinessName && formik.touched.picBusinessName)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Business PIC Full Name
                            </FormLabel>
                            <Input
                              name="picBusinessName"
                              value={formik.values.picBusinessName}
                              onChange={handleUpperCase("picBusinessName")}
                              onBlur={formik.handleBlur}
                              placeholder="Business contact full name"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.picBusinessName}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired isInvalid={!!(formik.errors.picBusinessEmail && formik.touched.picBusinessEmail)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Business PIC Email
                            </FormLabel>
                            <Input
                              name="picBusinessEmail"
                              type="email"
                              value={formik.values.picBusinessEmail}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder="business.contact@vendor.com"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.picBusinessEmail}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>

                        <FormControl mt={3}>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Phone Number/Whatsapp (Optional)
                          </FormLabel>
                          <Input
                            name="picBusinessNumberHotline"
                            value={formik.values.picBusinessNumberHotline}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                              formik.setFieldValue("picBusinessNumberHotline", val);
                            }}
                            placeholder="081234567890"
                            maxLength={15}
                            inputMode="numeric"
                            {...inputStyle}
                          />
                        </FormControl>
                      </Box>

                      <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                      {/* Sub-Section: PIC Teknis */}
                      <Box>
                        <HStack spacing={2} mb={3}>
                          <Badge colorScheme="orange" variant="solid" rounded="md" px={2.5} py={0.5} fontSize="xs">
                            Technical PIC / Field Support
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            (System implementation, support, & technical escalation)
                          </Text>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isRequired isInvalid={!!(formik.errors.picTechnicalName && formik.touched.picTechnicalName)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Technical PIC Full Name
                            </FormLabel>
                            <Input
                              name="picTechnicalName"
                              value={formik.values.picTechnicalName}
                              onChange={handleUpperCase("picTechnicalName")}
                              onBlur={formik.handleBlur}
                              placeholder="Technical contact full name"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.picTechnicalName}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired isInvalid={!!(formik.errors.picTechnicalEmail && formik.touched.picTechnicalEmail)}>
                            <FormLabel fontSize="sm" fontWeight="bold">
                              Technical PIC Email
                            </FormLabel>
                            <Input
                              name="picTechnicalEmail"
                              type="email"
                              value={formik.values.picTechnicalEmail}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder="technical.contact@vendor.com"
                              {...inputStyle}
                            />
                            <FormErrorMessage>{formik.errors.picTechnicalEmail}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>

                        <FormControl mt={3}>
                          <FormLabel fontSize="sm" fontWeight="bold">
                            Technical Hotline / Phone Number (Optional)
                          </FormLabel>
                          <Input
                            name="picTechnicalNumberHotline"
                            value={formik.values.picTechnicalNumberHotline}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                              formik.setFieldValue("picTechnicalNumberHotline", val);
                            }}
                            placeholder="081234567890"
                            maxLength={15}
                            inputMode="numeric"
                            {...inputStyle}
                          />
                        </FormControl>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── SECTION 4: Klasifikasi Risiko & Status ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={5} align="stretch">
                      <HStack spacing={3}>
                        <Box
                          w={10}
                          h={10}
                          bg="orange.500"
                          rounded="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          shadow="sm"
                        >
                          <Icon as={FiActivity} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={isDark ? "white" : "gray.800"}>
                            Risk Profile Classification & Status
                          </Heading>
                          <Text fontSize="xs" color="gray.500">
                            System dependency assessment, business impact rating, and vendor status
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {/* Status */}
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="bold" mb={1}>
                            <HStack spacing={1}>
                              <Text>Vendor Status</Text>
                              <Tooltip label="Status awal aktif untuk vendor partner baru yang terdaftar." placement="top" hasArrow>
                                <Box as="span" display="inline-flex" cursor="pointer">
                                  <Icon as={FiHelpCircle} color="gray.400" boxSize={3.5} />
                                </Box>
                              </Tooltip>
                            </HStack>
                          </FormLabel>
                          <Text fontSize="xs" color="gray.500" mb={2} noOfLines={1}>
                            Terkunci aktif untuk registrasi vendor baru.
                          </Text>
                          <InputGroup>
                            <Input
                              {...inputStyle}
                              value="ACTIVE (Active)"
                              isReadOnly
                              isDisabled
                              bg={isDark ? "gray.750" : "gray.100"}
                              color={isDark ? "green.300" : "green.600"}
                              fontWeight="bold"
                              cursor="not-allowed"
                              pr="36px"
                            />
                            <InputRightElement h="44px" pr={3}>
                              <Tooltip label="Status aktif terkunci" placement="top" hasArrow>
                                <Box color="green.500">
                                  <Icon as={FiCheckCircle} boxSize={4} />
                                </Box>
                              </Tooltip>
                            </InputRightElement>
                          </InputGroup>
                        </FormControl>

                        {/* Dependency Level */}
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="bold" mb={1}>
                            <HStack spacing={1}>
                              <Text>Dependency Level</Text>
                              <Tooltip label="Berdasarkan jumlah project yang akan dikerjakan." placement="top" hasArrow>
                                <Box as="span" display="inline-flex" cursor="pointer">
                                  <Icon as={FiHelpCircle} color="gray.400" boxSize={3.5} />
                                </Box>
                              </Tooltip>
                            </HStack>
                          </FormLabel>
                          <Text fontSize="xs" color="gray.500" mb={2} noOfLines={1}>
                            Berdasarkan jumlah project yang akan dikerjakan.
                          </Text>
                          <ChakraSelect
                            name="depedencyLevel"
                            value={formik.values.depedencyLevel}
                            onChange={formik.handleChange}
                            {...inputStyle}
                          >
                            {DEPENDENCY_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </ChakraSelect>
                        </FormControl>

                        {/* Business Impact */}
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="bold" mb={1}>
                            <HStack spacing={1}>
                              <Text>Business Impact</Text>
                              <Tooltip label="Impact karena banyak project yang terlibat" placement="top" hasArrow>
                                <Box as="span" display="inline-flex" cursor="pointer">
                                  <Icon as={FiHelpCircle} color="gray.400" boxSize={3.5} />
                                </Box>
                              </Tooltip>
                            </HStack>
                          </FormLabel>
                          <Text fontSize="xs" color="gray.500" mb={2} noOfLines={1}>
                            Impact karena banyak project yang terlibat.
                          </Text>
                          <ChakraSelect
                            name="businessImpact"
                            value={formik.values.businessImpact}
                            onChange={formik.handleChange}
                            {...inputStyle}
                          >
                            {IMPACT_OPTIONS.map((i) => (
                              <option key={i.value} value={i.value}>
                                {i.label}
                              </option>
                            ))}
                          </ChakraSelect>
                        </FormControl>
                      </SimpleGrid>

                      {/* Reason Status */}
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="bold">
                          Status Notes / Rationale (Optional)
                        </FormLabel>
                        <Textarea
                          name="reasonStatus"
                          value={formik.values.reasonStatus}
                          onChange={formik.handleChange}
                          placeholder="Provide additional notes regarding status decision or vendor qualification..."
                          rows={2}
                          resize="none"
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          rounded="xl"
                          fontSize="md"
                          _focus={{ borderColor: "secondary.500", bg: isDark ? "gray.700" : "white" }}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── SECTION 5: Sertifikasi & TDR (Optional Toggle) ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={5} align="stretch">
                      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                        <HStack spacing={3}>
                          <Box
                            w={10}
                            h={10}
                            bg="teal.500"
                            rounded="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            shadow="sm"
                          >
                            <Icon as={FiShield} boxSize={5} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Heading size="md" color={isDark ? "white" : "gray.800"}>
                              Vendor Registration Certificate (TDR)
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              Official vendor registration certification (optional, can be completed later)
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={3} bg={isDark ? "gray.750" : "gray.100"} px={4} py={2} rounded="xl">
                          <Text fontSize="sm" fontWeight="bold" color={formik.values.hasTdr ? "teal.500" : "gray.500"}>
                            {formik.values.hasTdr ? "Include TDR Document" : "Skip TDR For Now"}
                          </Text>
                          <Switch
                            colorScheme="teal"
                            size="lg"
                            isChecked={formik.values.hasTdr}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              formik.setFieldValue("hasTdr", isChecked);
                              if (isChecked && !formik.values.tdrBusinessType) {
                                formik.setFieldValue("tdrBusinessType", formik.values.vendorType || "PT");
                              }
                            }}
                          />
                        </HStack>
                      </Flex>

                      {formik.values.hasTdr && (
                        <>
                          <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTrdNumber && formik.touched.tdrTrdNumber)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                TDR Registration Number
                              </FormLabel>
                              <Input
                                name="tdrTrdNumber"
                                value={formik.values.tdrTrdNumber}
                                onChange={handleUpperCase("tdrTrdNumber")}
                                onBlur={formik.handleBlur}
                                placeholder="e.g. TDR/2026/VND/0091"
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrTrdNumber}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTdrType && formik.touched.tdrTdrType)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                TDR Certification Type
                              </FormLabel>
                              <RadioGroup
                                name="tdrTdrType"
                                value={formik.values.tdrTdrType}
                                onChange={(val) => formik.setFieldValue("tdrTdrType", val)}
                              >
                                <Stack direction="row" spacing={6} h="44px" align="center">
                                  {TDR_TYPE_OPTIONS.map((t) => (
                                    <Radio key={t} value={t} colorScheme="teal" size="md">
                                      <Text fontSize="sm" fontWeight="semibold">
                                        {t}
                                      </Text>
                                    </Radio>
                                  ))}
                                </Stack>
                              </RadioGroup>
                              <FormErrorMessage>{formik.errors.tdrTdrType}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrNpwpNumber && formik.touched.tdrNpwpNumber)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Tax Identification Number (NPWP)
                              </FormLabel>
                              <Input
                                name="tdrNpwpNumber"
                                value={formik.values.tdrNpwpNumber}
                                onChange={(e) => {
                                  const formatted = formatIndonesianNPWP(e.target.value);
                                  formik.setFieldValue("tdrNpwpNumber", formatted);
                                }}
                                onBlur={formik.handleBlur}
                                placeholder="00.000.000.0-000.000"
                                maxLength={20}
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrNpwpNumber}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrYearRegistered && formik.touched.tdrYearRegistered)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Registration Year
                              </FormLabel>
                              <Input
                                name="tdrYearRegistered"
                                value={formik.values.tdrYearRegistered}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="2026"
                                maxLength={4}
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrYearRegistered}</FormErrorMessage>
                            </FormControl>
                          </SimpleGrid>

                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessType && formik.touched.tdrBusinessType)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                TDR Business Entity Type
                              </FormLabel>
                              <ButtonGroup size="md" isAttached variant="outline" w="full">
                                {VENDOR_TYPE_OPTIONS.map((type) => {
                                  const isSelected = formik.values.tdrBusinessType === type;
                                  return (
                                    <Button
                                      key={type}
                                      flex={1}
                                      h="44px"
                                      colorScheme={isSelected ? "teal" : "gray"}
                                      bg={isSelected ? "teal.500" : isDark ? "gray.750" : "gray.50"}
                                      color={isSelected ? "white" : isDark ? "gray.200" : "gray.700"}
                                      borderColor={isSelected ? "teal.500" : isDark ? "gray.600" : "gray.300"}
                                      onClick={() => formik.setFieldValue("tdrBusinessType", type)}
                                      fontSize="sm"
                                      fontWeight="bold"
                                      _hover={{
                                        bg: isSelected ? "teal.600" : isDark ? "gray.700" : "gray.100",
                                      }}
                                    >
                                      {type}
                                    </Button>
                                  );
                                })}
                              </ButtonGroup>
                              <FormErrorMessage>{formik.errors.tdrBusinessType}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessSectorCode && formik.touched.tdrBusinessSectorCode)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Business Sector Code
                              </FormLabel>
                              <Input
                                name="tdrBusinessSectorCode"
                                value={formik.values.tdrBusinessSectorCode}
                                onChange={handleUpperCase("tdrBusinessSectorCode")}
                                onBlur={formik.handleBlur}
                                placeholder="TIK-01"
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrBusinessSectorCode}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrBusinessSectorName && formik.touched.tdrBusinessSectorName)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Business Sector Name
                              </FormLabel>
                              <Input
                                name="tdrBusinessSectorName"
                                value={formik.values.tdrBusinessSectorName}
                                onChange={handleUpperCase("tdrBusinessSectorName")}
                                onBlur={formik.handleBlur}
                                placeholder="Information Technology"
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrBusinessSectorName}</FormErrorMessage>
                            </FormControl>
                          </SimpleGrid>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Sub-Business Sector (Optional)
                              </FormLabel>
                              <Input
                                name="tdrSubBusinessSector"
                                value={formik.values.tdrSubBusinessSector}
                                onChange={handleUpperCase("tdrSubBusinessSector")}
                                placeholder="Software Development / Security"
                                {...inputStyle}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Qualifications / Quality Certifications
                              </FormLabel>
                              <Input
                                name="tdrQualifications"
                                value={formik.values.tdrQualifications}
                                onChange={formik.handleChange}
                                placeholder="ISO 27001, ISO 9001 (Optional)"
                                {...inputStyle}
                              />
                            </FormControl>
                          </SimpleGrid>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired isInvalid={!!(formik.errors.tdrTimeInEffect && formik.touched.tdrTimeInEffect)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Start Effective Date
                              </FormLabel>
                              <Input
                                name="tdrTimeInEffect"
                                type="date"
                                value={formik.values.tdrTimeInEffect}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                {...inputStyle}
                              />
                              <FormErrorMessage>{formik.errors.tdrTimeInEffect}</FormErrorMessage>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!(formik.errors.tdrExpiredAt && formik.touched.tdrExpiredAt)}>
                              <FormLabel fontSize="sm" fontWeight="bold">
                                Expiry Date
                              </FormLabel>
                              <Input
                                name="tdrExpiredAt"
                                type="date"
                                value={formik.values.tdrExpiredAt}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                {...inputStyle}
                              />
                              <HStack spacing={1.5} mt={2} wrap="wrap">
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold" mr={1}>
                                  Quick Extend:
                                </Text>
                                {[
                                  { label: "+6 Mo", months: 6, years: 0 },
                                  { label: "+1 Yr", months: 0, years: 1 },
                                  { label: "+2 Yr", months: 0, years: 2 },
                                  { label: "+3 Yr", months: 0, years: 3 },
                                  { label: "+4 Yr", months: 0, years: 4 },
                                  { label: "+5 Yr", months: 0, years: 5 },
                                ].map((preset) => (
                                  <Button
                                    key={preset.label}
                                    size="xs"
                                    variant="outline"
                                    colorScheme="teal"
                                    rounded="md"
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    h="24px"
                                    px={2}
                                    onClick={() => handleExtendTdrExpiry(preset.months, preset.years)}
                                    _hover={{
                                      bg: "teal.500",
                                      color: "white",
                                    }}
                                  >
                                    {preset.label}
                                  </Button>
                                ))}
                              </HStack>
                              <FormErrorMessage>{formik.errors.tdrExpiredAt}</FormErrorMessage>
                            </FormControl>
                          </SimpleGrid>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── Action Footer Bar ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={5}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                      <Button
                        variant="outline"
                        colorScheme="gray"
                        rounded="xl"
                        px={6}
                        size="lg"
                        fontSize="md"
                        onClick={() => router.push("/vendor-management")}
                      >
                        Cancel
                      </Button>

                      <Button
                        colorScheme="blue"
                        bg="secondary.500"
                        _hover={{ bg: "secondary.600" }}
                        rounded="xl"
                        px={8}
                        size="lg"
                        fontSize="md"
                        fontWeight="bold"
                        isLoading={IsLoadingProcess}
                        loadingText="Registering..."
                        leftIcon={<Icon as={FiCheckCircle} boxSize={5} />}
                        onClick={() => {
                          formik.validateForm().then((errors) => {
                            if (Object.keys(errors).length === 0) {
                              setOpenConfirmRegister(true);
                            } else {
                              formik.handleSubmit();
                              showToast({
                                description: "Please fill in all required form fields.",
                                statusToast: "error",
                              });
                            }
                          });
                        }}
                      >
                        Register Vendor Partner
                      </Button>
                    </Flex>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>

            {/* ── Right Sidebar Canvas (4 Cols / ~33%) ── */}
            <GridItem colSpan={{ base: 12, lg: 4 }}>
              <VStack spacing={5} align="stretch" position="sticky" top="20px">
                {/* ── Widget 1: Real-time Live Card Preview ── */}
                <Card {...sectionCardProps}>
                  <Box
                    bgGradient="linear(to-br, secondary.700, secondary.500)"
                    p={4}
                    color="white"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top="-10px"
                      right="-10px"
                      w="50px"
                      h="50px"
                      bg="whiteAlpha.200"
                      rounded="full"
                    />
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        bg="whiteAlpha.250"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backdropFilter="blur(10px)"
                      >
                        <Icon as={FiBriefcase} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="sm" fontWeight="bold">
                          Live Card Preview
                        </Heading>
                        <Text fontSize="xs" opacity={0.9}>
                          Simulated appearance in the vendor directory
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <CardBody p={4}>
                    {/* Simulated Mini Card Vendor */}
                    <Box
                      rounded="xl"
                      border="1px"
                      borderColor={isDark ? "gray.700" : "gray.200"}
                      bg={isDark ? "gray.750" : "gray.50"}
                      overflow="hidden"
                      shadow="md"
                    >
                      {/* Mini Hero Header */}
                      <Box
                        bgGradient="linear(to-br, secondary.800, secondary.500)"
                        color="white"
                        p={3.5}
                        position="relative"
                      >
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2.5}>
                            <Box
                              w="38px"
                              h="38px"
                              bg="whiteAlpha.250"
                              rounded="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="sm"
                              fontWeight="extrabold"
                            >
                              {liveInitials}
                            </Box>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={1}>
                                <Badge bg="whiteAlpha.300" color="white" fontSize="3xs" px={1.5} rounded="md">
                                  {formik.values.vendorCode || "VENDOR-CODE"}
                                </Badge>
                                <Badge bg="blackAlpha.400" color="white" fontSize="3xs" px={1.5} rounded="md">
                                  {formik.values.vendorType || "PT"}
                                </Badge>
                              </HStack>
                              <Text fontSize="3xs" color="whiteAlpha.800">
                                Master Vendor
                              </Text>
                            </VStack>
                          </HStack>

                          <Badge
                            colorScheme={
                              formik.values.status === "ACTIVE"
                                ? "green"
                                : formik.values.status === "BLACKLIST"
                                ? "red"
                                : "orange"
                            }
                            fontSize="3xs"
                            px={2}
                            py={0.5}
                            rounded="full"
                          >
                            {formik.values.status}
                          </Badge>
                        </Flex>
                      </Box>

                      {/* Mini Body */}
                      <VStack align="stretch" spacing={2.5} p={3.5}>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={isDark ? "white" : "gray.800"}
                            noOfLines={1}
                          >
                            {formik.values.vendorName || "Vendor Company Name"}
                          </Text>
                          <HStack spacing={1.5} color="gray.500" fontSize="xs" mt={0.5}>
                            <Icon as={FiMapPin} color="red.400" boxSize={3} />
                            <Text noOfLines={1}>
                              {[
                                formik.values.district,
                                formik.values.city,
                                formik.values.province,
                                formik.values.country,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Domicile location"}
                            </Text>
                          </HStack>
                        </Box>

                        <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                        {/* PIC Preview */}
                        <HStack spacing={2} align="center">
                          <Icon as={FiUser} color="secondary.500" boxSize={3.5} />
                          <VStack align="start" spacing={0} overflow="hidden">
                            <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                              {formik.values.picBusinessName || "Business PIC Name"}
                            </Text>
                            <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                              {formik.values.picBusinessEmail || "email.pic@vendor.com"}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Risk Badges */}
                        <HStack spacing={1.5} fontSize="3xs">
                          <Badge colorScheme="purple" variant="subtle" px={1.5} py={0.5} rounded="md">
                            Dep: {formik.values.depedencyLevel}
                          </Badge>
                          <Badge colorScheme="orange" variant="subtle" px={1.5} py={0.5} rounded="md">
                            Impact: {formik.values.businessImpact}
                          </Badge>
                          <Badge
                            colorScheme={formik.values.hasTdr ? "teal" : "gray"}
                            variant="subtle"
                            px={1.5}
                            py={0.5}
                            rounded="md"
                          >
                            {formik.values.hasTdr ? "TDR Ready" : "No TDR"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  </CardBody>
                </Card>

                {/* ── Widget 2: Form Completion Progress ── */}
                <Card {...sectionCardProps}>
                  <CardBody p={5}>
                    <VStack spacing={3.5} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                          Data Completion
                        </Heading>
                        <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                          {completionProgress}% Completed
                        </Text>
                      </Flex>

                      <Progress
                        value={completionProgress}
                        colorScheme={completionProgress >= 80 ? "green" : completionProgress >= 50 ? "blue" : "orange"}
                        rounded="full"
                        size="sm"
                        bg={isDark ? "gray.700" : "gray.100"}
                      />

                      <VStack spacing={2} align="stretch" pt={1}>
                        {[
                          {
                            label: "Business Entity Identity",
                            done: Boolean(formik.values.vendorCode && formik.values.vendorName),
                          },
                          {
                            label: "Domicile Address",
                            done: Boolean(formik.values.address1 && formik.values.city),
                          },
                          {
                            label: "Business PIC Contact",
                            done: Boolean(formik.values.picBusinessName && formik.values.picBusinessEmail),
                          },
                          {
                            label: "Technical PIC Contact",
                            done: Boolean(formik.values.picTechnicalName && formik.values.picTechnicalEmail),
                          },
                          {
                            label: "Risk Profile Classification",
                            done: Boolean(formik.values.status && formik.values.depedencyLevel),
                          },
                        ].map((step, idx) => (
                          <HStack key={idx} justify="space-between" fontSize="xs">
                            <Text color={step.done ? (isDark ? "white" : "gray.800") : "gray.500"}>
                              {step.label}
                            </Text>
                            <Icon
                              as={step.done ? FiCheckCircle : FiClock}
                              color={step.done ? "green.500" : "gray.400"}
                              boxSize={3.5}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* ── Widget 3: Governance & Helpdesk ── */}
                <Card
                  rounded={radiusStyle}
                  shadow="lg"
                  border="1px"
                  borderColor={isDark ? "blue.800" : "blue.100"}
                  bg={isDark ? "blue.950" : "blue.50"}
                >
                  <CardBody p={5}>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2.5}>
                        <Icon as={FiHelpCircle} color="blue.500" boxSize={5} />
                        <Heading size="xs" color={isDark ? "blue.200" : "blue.800"}>
                          Registration Governance
                        </Heading>
                      </HStack>

                      <VStack spacing={2} align="start" fontSize="xs" color={isDark ? "blue.300" : "blue.700"}>
                        <Text>• Vendor code is unique and cannot be changed once registered.</Text>
                        <Text>• Ensure PIC email addresses are active for official correspondence.</Text>
                        <Text>• TDR certificates can be updated or uploaded anytime via the vendor details page.</Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </form>
      </Box>

      {/* ── Confirmation Dialog ── */}
      <ConfirmationDialog
        key="confirmRegisterVendor"
        isOpenTrigger={openConfirmRegister}
        action={() => formik.handleSubmit()}
        trigger={setOpenConfirmRegister}
        questionMsg={
          "Are you sure you want to register this vendor partner?\n\nPlease confirm that legality details, PIC contacts, and risk parameters are correct before proceeding."
        }
        captionMsg="Confirm Vendor Registration"
      />
    </LayoutAdmin>
  );
}
