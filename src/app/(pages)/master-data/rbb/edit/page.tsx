"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  Spinner,
  Stack,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiTrash2,
  FiTarget,
  FiCalendar,
  FiDollarSign,
  FiLayers,
  FiLock,
  FiSave,
  FiShield,
  FiInfo,
  FiClock,
} from "react-icons/fi";

// Services & Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useMstRbb, { MstRbbUpdatePayload, MstRbbWorkProgramUpdatePayload, MstRbbResponse } from "@/app/services/useMstRbb";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";

interface WorkProgramEditFormItem {
  id?: string; // DB ID if editing existing WP
  tempKey: string;
  itspCode: string;
  itspName: string;
  itspInit: string;
  workProgramCode: string;
  workProgramDesc: string;
  budgetValueRaw: string; // formatted Rp string
  budgetType: string;
  note: string;
  workProgramType: string;
  lgAccountNumber: string;
  lgAccountName: string;
  dataCenterOption: string[]; // DC1, DC2, Other
  dataCenterOtherText: string;
  bundlingInputRembisRaw: string;
  bundlingBudgetRaw: string;
  periodYear: string;
  periodQuartal: string;
  periodTime: string; // number of days
}

const emptyWorkProgramItem = (): WorkProgramEditFormItem => ({
  tempKey: Math.random().toString(36).substring(2, 9),
  itspCode: "",
  itspName: "",
  itspInit: "",
  workProgramCode: "",
  workProgramDesc: "",
  budgetValueRaw: "",
  budgetType: "CAPEX",
  note: "",
  workProgramType: "PROGRAM KERJA BARU",
  lgAccountNumber: "",
  lgAccountName: "",
  dataCenterOption: ["DC1"],
  dataCenterOtherText: "",
  bundlingInputRembisRaw: "",
  bundlingBudgetRaw: "",
  periodYear: new Date().getFullYear().toString(),
  periodQuartal: "Q1",
  periodTime: "365",
});

// Rp Formatting Helpers
const formatRupiahString = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";
  const digitsOnly = value.toString().replace(/\D/g, "");
  if (!digitsOnly) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(digitsOnly, 10));
};

const parseRupiahNumber = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return 0;
  return parseInt(digitsOnly, 10);
};

export default function EditMasterRbbPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { GetDetailMstRbb, UpdateMstRbb, isLoading: isSubmitting } = useMstRbb();
  const { List: ListOrganization } = useOrganization();

  const rbbId = searchParams.get("id") || "";
  const [tokenData, setTokenData] = useState<string>("");
  const [orgList, setOrgList] = useState<OrganizationResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Section 1 - Master RBB Target Form State
  const [selectedDirectorateId, setSelectedDirectorateId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [targetCode, setTargetCode] = useState<string>("");
  const [targetName, setTargetName] = useState<string>("");
  const [policyCode, setPolicyCode] = useState<string>("");
  const [policyName, setPolicyName] = useState<string>("");
  const [strategyCode, setStrategyCode] = useState<string>("");
  const [strategyName, setStrategyName] = useState<string>("");

  // Confirmation Modal & Countdown Interval States
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [submitCountdown, setSubmitCountdown] = useState<number>(3);
  const [validatedPayload, setValidatedPayload] = useState<MstRbbUpdatePayload | null>(null);

  // Section 2 - Dynamic Work Programs List State
  const [workPrograms, setWorkPrograms] = useState<WorkProgramEditFormItem[]>([]);

  // Timer interval countdown for confirmation submit safety
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConfirmOpen) {
      setSubmitCountdown(3);
      timer = setInterval(() => {
        setSubmitCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConfirmOpen]);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
      loadInitialData(rbbId, token);
    }
  }, [rbbId]);

  const loadInitialData = async (id: string, token: string) => {
    setIsInitialLoading(true);
    try {
      const orgRes = await ListOrganization(
        { page: 0, limit: 1000, search: "", filterWhere: [], fieldOrder: ["orgName"], orderDir: "asc" },
        token
      );
      if (orgRes?.statusCode === RES_CODE_OK && orgRes.data) {
        setOrgList(orgRes.data);
      }

      if (id) {
        const detailRes = await GetDetailMstRbb(id, token);
        if (detailRes?.statusCode === RES_CODE_OK && detailRes.data) {
          populateForm(detailRes.data);
        } else {
          showToast({ description: detailRes?.message || "Failed to load Master RBB details", statusToast: "error" });
        }
      }
    } catch (err) {
      console.error("Error loading initial edit data:", err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const populateForm = (data: MstRbbResponse) => {
    setSelectedDirectorateId(data.orgDirectorateId || "");
    setSelectedDivisionId(data.orgDivisionId || "");
    setSelectedGroupId(data.orgGroupId || "");
    setTargetCode(data.targetCode || "");
    setTargetName(data.targetName || "");
    setPolicyCode(data.policyCode || "");
    setPolicyName(data.policyName || "");
    setStrategyCode(data.strategyCode || "");
    setStrategyName(data.strategyName || "");

    if (data.workPrograms && data.workPrograms.length > 0) {
      const mappedWps: WorkProgramEditFormItem[] = data.workPrograms.map((wp) => {
        const dcSplitted = (wp.dataCenter || "").split(",").map((s) => s.trim());
        const hasDC1 = dcSplitted.includes("DC1");
        const hasDC2 = dcSplitted.includes("DC2");
        const customOptions: string[] = [];
        let customText = "";

        if (hasDC1) customOptions.push("DC1");
        if (hasDC2) customOptions.push("DC2");
        const otherItems = dcSplitted.filter((s) => s !== "DC1" && s !== "DC2" && s.length > 0);
        if (otherItems.length > 0) {
          customOptions.push("Other");
          customText = otherItems.join(", ");
        }
        if (customOptions.length === 0) customOptions.push("DC1");

        return {
          id: wp.id,
          tempKey: Math.random().toString(36).substring(2, 9),
          itspCode: wp.itspCode || "",
          itspName: wp.itspName || "",
          itspInit: wp.itspInit || "",
          workProgramCode: wp.workProgramCode || "",
          workProgramDesc: wp.workProgramDesc || "",
          budgetValueRaw: formatRupiahString(wp.budgetValue || 0),
          budgetType: wp.budgetType || "CAPEX",
          note: wp.note || "",
          workProgramType: wp.workProgramType || "PROGRAM KERJA BARU",
          lgAccountNumber: wp.lgAccountNumber || "",
          lgAccountName: wp.lgAccountName || "",
          dataCenterOption: customOptions,
          dataCenterOtherText: customText,
          bundlingInputRembisRaw: wp.bundlingInputRembis || "",
          bundlingBudgetRaw: formatRupiahString(wp.bundlingBudget || 0),
          periodYear: wp.periodYear || new Date().getFullYear().toString(),
          periodQuartal: wp.periodQuartal || "Q1",
          periodTime: wp.periodTime || "365",
        };
      });
      setWorkPrograms(mappedWps);
    } else {
      setWorkPrograms([emptyWorkProgramItem()]);
    }
  };

  // Organization Cascading Select Options
  const directorateOptions = useMemo(() => {
    return orgList.filter((org) => org.orgType?.toUpperCase() === "DIRECTORATE");
  }, [orgList]);

  const divisionOptions = useMemo(() => {
    return orgList.filter((org) => {
      if (org.orgType?.toUpperCase() !== "DIVISION") return false;
      if (!selectedDirectorateId) return true;
      return org.parentId === selectedDirectorateId || org.orgParentCode === selectedDirectorateId;
    });
  }, [orgList, selectedDirectorateId]);

  const groupOptions = useMemo(() => {
    return orgList.filter((org) => {
      if (org.orgType?.toUpperCase() !== "GROUP") return false;
      if (!selectedDivisionId) return true;
      return org.parentId === selectedDivisionId || org.orgParentCode === selectedDivisionId;
    });
  }, [orgList, selectedDivisionId]);

  const selectedGroupObj = useMemo(() => {
    return orgList.find((org) => org.id === selectedGroupId);
  }, [orgList, selectedGroupId]);

  const totalBudgetValueSum = useMemo(() => {
    return workPrograms.reduce((acc, wp) => acc + parseRupiahNumber(wp.budgetValueRaw), 0);
  }, [workPrograms]);

  const addWorkProgramItem = () => {
    setWorkPrograms((prev) => [...prev, emptyWorkProgramItem()]);
  };

  const removeWorkProgramItem = (index: number) => {
    if (workPrograms.length === 1) {
      showToast({ description: "At least one Work Program is required", statusToast: "warning" });
      return;
    }
    setWorkPrograms((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkProgramField = (index: number, field: keyof WorkProgramEditFormItem, value: any) => {
    setWorkPrograms((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOpenConfirmation = () => {
    if (!selectedDirectorateId || !selectedDivisionId) {
      showToast({ description: "Please select Directorate and Division", statusToast: "warning" });
      return;
    }
    if (!targetCode || !targetName || !policyCode || !policyName || !strategyCode || !strategyName) {
      showToast({ description: "Please fill all required Master RBB Target, Policy, and Strategy fields", statusToast: "warning" });
      return;
    }

    const selectedDirObj = orgList.find((o) => o.id === selectedDirectorateId);
    const selectedDivObj = orgList.find((o) => o.id === selectedDivisionId);

    const formattedWorkPrograms: MstRbbWorkProgramUpdatePayload[] = [];
    for (let i = 0; i < workPrograms.length; i++) {
      const wp = workPrograms[i];
      if (!wp.itspCode || !wp.itspName || !wp.workProgramCode) {
        showToast({ description: `Please fill required fields for Work Program #${i + 1}`, statusToast: "warning" });
        return;
      }

      let dataCenterStr = wp.dataCenterOption.filter((d) => d !== "Other").join(", ");
      if (wp.dataCenterOption.includes("Other") && wp.dataCenterOtherText) {
        dataCenterStr = dataCenterStr ? `${dataCenterStr}, ${wp.dataCenterOtherText.toUpperCase()}` : wp.dataCenterOtherText.toUpperCase();
      }

      formattedWorkPrograms.push({
        id: wp.id,
        itspCode: wp.itspCode.toUpperCase(),
        itspName: wp.itspName.toUpperCase(),
        itspInit: wp.itspInit.toUpperCase(),
        initOrgGroupId: selectedGroupObj?.id || "",
        initOrgGroupCode: selectedGroupObj?.orgCode || "",
        initOrgGroupName: selectedGroupObj?.orgName || "",
        workProgramCode: wp.workProgramCode.toUpperCase(),
        workProgramDesc: wp.workProgramDesc,
        budgetValue: parseRupiahNumber(wp.budgetValueRaw),
        budgetType: wp.budgetType.toUpperCase(),
        note: wp.note,
        workProgramType: wp.workProgramType.toUpperCase(),
        lgAccountNumber: wp.lgAccountNumber.toUpperCase(),
        lgAccountName: wp.lgAccountName.toUpperCase(),
        dataCenter: dataCenterStr || "DC1",
        bundlingInputRembis: wp.bundlingInputRembisRaw.toUpperCase(),
        bundlingBudget: parseRupiahNumber(wp.bundlingBudgetRaw),
        periodYear: wp.periodYear,
        periodQuartal: wp.periodQuartal,
        periodTime: wp.periodTime || "365",
      });
    }

    const payload: MstRbbUpdatePayload = {
      id: rbbId,
      orgDirectorateId: selectedDirObj?.id || "",
      orgDirectorateCode: selectedDirObj?.orgCode || "",
      orgDirectorateName: selectedDirObj?.orgName || "",
      orgDivisionId: selectedDivObj?.id || "",
      orgDivisionCode: selectedDivObj?.orgCode || "",
      orgDivisionName: selectedDivObj?.orgName || "",
      orgGroupId: selectedGroupObj?.id || null,
      orgGroupCode: selectedGroupObj?.orgCode || null,
      orgGroupName: selectedGroupObj?.orgName || null,
      targetCode: targetCode.toUpperCase(),
      targetName: targetName.toUpperCase(),
      policyCode: policyCode.toUpperCase(),
      policyName: policyName.toUpperCase(),
      strategyCode: strategyCode.toUpperCase(),
      strategyName: strategyName.toUpperCase(),
      workPrograms: formattedWorkPrograms,
    };

    setValidatedPayload(payload);
    onConfirmOpen();
  };

  const handleConfirmSubmit = async () => {
    if (!validatedPayload) return;
    const res = await UpdateMstRbb(validatedPayload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Master RBB target & Work Programs updated successfully. History snapshot created!", statusToast: "success" });
      onConfirmClose();
      router.push(`/master-data/rbb/detail?id=${rbbId}`);
    } else {
      showToast({ description: res?.message || "Failed to update Master RBB", statusToast: "error" });
    }
  };

  const HeaderDataContent: HeaderContentProps = {
    titleName: `Edit Master RBB Target — ${targetCode || "Edit"}`,
    breadCrumb: ["Home", "Master Data", "Master RBB", "Edit Target"],
  };

  if (isInitialLoading) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="500px" w="full">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="sm" color="gray.500">Loading Master RBB Target for editing...</Text>
          </VStack>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Hero Header Section */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="xl"
        mx={{ base: 2, md: 4 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        p={{ base: 5, md: 6 }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push(`/master-data/rbb/detail?id=${rbbId}`)}
            >
              Cancel & Return to Detail
            </Button>
            <Box w="1px" h="30px" bg="gray.300" />
            <VStack align="start" spacing={0}>
              <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                Edit Master RBB Target & Work Programs
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Updating this form will automatically generate an audit history snapshot in MST_RBB_HISTORY
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4}>
            <Badge colorScheme="blue" rounded="xl" px={3} py={1.5} fontSize="xs" fontWeight="bold">
              Programs: {workPrograms.length}
            </Badge>
            <Badge colorScheme="purple" rounded="xl" px={3} py={1.5} fontSize="xs" fontWeight="bold">
              Total Budget: {formatIDR(totalBudgetValueSum)}
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {/* Main Form Body Container */}
      <Box px={{ base: 2, md: 4 }} pb={12} w="full">
        <VStack spacing={8} w="full" align="stretch">
          {/* SECTION 1 - MASTER RBB TARGET & POLICY CARD */}
          <Card
            rounded="2xl"
            shadow="xl"
            border="1px"
            borderColor={colorMode === "light" ? "blue.200" : "blue.900"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            w="full"
          >
            <CardBody p={{ base: 5, md: 7 }}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
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
                      shadow="md"
                    >
                      <FiTarget size={22} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm" color="blue.600">
                        SECTION 1 — Data Master RBB Target & Organization Mappings
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Select Organization hierarchy and specify Corporate Target, Policy & Strategy identifiers
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="blue" rounded="full" px={3} py={1} fontSize="xs">
                    Required Fields (*)
                  </Badge>
                </Flex>

                <Divider />

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5}>
                  {/* Directorate Selector */}
                  <GridItem>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Directorate</FormLabel>
                      <ChakraSelect
                        size="md"
                        rounded="lg"
                        value={selectedDirectorateId}
                        onChange={(e) => {
                          setSelectedDirectorateId(e.target.value);
                          setSelectedDivisionId("");
                          setSelectedGroupId("");
                        }}
                      >
                        <option value="">Select Directorate...</option>
                        {directorateOptions.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.orgName} ({dir.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Division Selector */}
                  <GridItem>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Division</FormLabel>
                      <ChakraSelect
                        size="md"
                        rounded="lg"
                        value={selectedDivisionId}
                        onChange={(e) => {
                          setSelectedDivisionId(e.target.value);
                          setSelectedGroupId("");
                        }}
                      >
                        <option value="">Select Division...</option>
                        {divisionOptions.map((div) => (
                          <option key={div.id} value={div.id}>
                            {div.orgName} ({div.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Group Selector */}
                  <GridItem>
                    <FormControl size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Group (Optional)</FormLabel>
                      <ChakraSelect
                        size="md"
                        rounded="lg"
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                      >
                        <option value="">Select Group...</option>
                        {groupOptions.map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {grp.orgName} ({grp.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Target Code */}
                  <GridItem>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Target Code</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="1.1.1.1"
                        value={targetCode}
                        onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Target Name */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Target Name / Description</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="ENTER RBB TARGET NAME IN UPPERCASE"
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Policy Code */}
                  <GridItem>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Policy Code</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="1.1.1.1"
                        value={policyCode}
                        onChange={(e) => setPolicyCode(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Policy Name */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Policy Name / Strategic Goal</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="ENTER STRATEGIC POLICY NAME IN UPPERCASE"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Strategy Code */}
                  <GridItem>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Strategy Code</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="1.1.1.1"
                        value={strategyCode}
                        onChange={(e) => setStrategyCode(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Strategy Name */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl isRequired size="sm">
                      <FormLabel fontSize="xs" fontWeight="bold">Strategy Name</FormLabel>
                      <Input
                        size="md"
                        rounded="lg"
                        placeholder="ENTER STRATEGY NAME IN UPPERCASE"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* SECTION 2 - DYNAMIC WORK PROGRAMS HEADER CARD */}
          <Card
            rounded="2xl"
            shadow="xl"
            border="1px"
            borderColor={colorMode === "light" ? "teal.200" : "teal.900"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            w="full"
          >
            <CardBody p={{ base: 5, md: 7 }}>
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
                    shadow="md"
                  >
                    <FiBriefcase size={22} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="sm" color="teal.600">
                      SECTION 2 — Dynamic Work Programs & Financial Allocations ({workPrograms.length})
                    </Heading>
                    <Text fontSize="xs" color="gray.500">
                      Add ITSP Work Programs, Budget Types (CAPEX/OPEX), SLA Timelines & Data Center Allocations
                    </Text>
                  </VStack>
                </HStack>

                <Button size="md" colorScheme="teal" leftIcon={<FiPlus />} onClick={addWorkProgramItem} shadow="md">
                  Add Work Program Item
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* WORK PROGRAM ITEMS CARDS LIST */}
          <VStack spacing={5} align="stretch" w="full">
            {workPrograms.map((wp, index) => (
              <Card
                key={wp.tempKey}
                rounded="2xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                w="full"
              >
                <CardBody p={{ base: 5, md: 6 }}>
                  <VStack spacing={5} align="stretch">
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <HStack spacing={3}>
                        <Badge colorScheme="blue" rounded="lg" px={3} py={1} fontSize="xs" fontWeight="bold">
                          Work Program #{index + 1} {wp.id ? "(Existing)" : "(New)"}
                        </Badge>
                        {wp.budgetValueRaw && (
                          <Badge colorScheme="purple" rounded="lg" px={3} py={1} fontSize="xs" fontWeight="bold">
                            Budget: Rp. {wp.budgetValueRaw}
                          </Badge>
                        )}
                        <Badge colorScheme="teal" rounded="lg" px={2.5} py={1} fontSize="2xs">
                          {wp.budgetType}
                        </Badge>
                      </HStack>

                      {workPrograms.length > 1 && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<FiTrash2 />}
                          onClick={() => removeWorkProgramItem(index)}
                        >
                          Remove Item
                        </Button>
                      )}
                    </Flex>

                    <Divider />

                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5}>
                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">ITSP Code</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="TECHXX"
                            value={wp.itspCode}
                            onChange={(e) => updateWorkProgramField(index, "itspCode", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">ITSP Name</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="TEKNOLOGI INFORMASI"
                            value={wp.itspName}
                            onChange={(e) => updateWorkProgramField(index, "itspName", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">ITSP Initials</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="TECHXX"
                            value={wp.itspInit}
                            onChange={(e) => updateWorkProgramField(index, "itspInit", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <FormControl size="sm" isDisabled>
                          <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" display="flex" alignItems="center" gap={1}>
                            <Icon as={FiLock} /> Init Org Group Data (Locked from Section 1 Selection)
                          </FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            fontWeight="bold"
                            bg={colorMode === "light" ? "gray.100" : "gray.900"}
                            value={selectedGroupObj ? `${selectedGroupObj.orgName} (${selectedGroupObj.orgCode})` : "NO GROUP SELECTED IN SECTION 1"}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Work Program Code</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="WP-001"
                            value={wp.workProgramCode}
                            onChange={(e) => updateWorkProgramField(index, "workProgramCode", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Work Program Description</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="Enter work program description..."
                            value={wp.workProgramDesc}
                            onChange={(e) => updateWorkProgramField(index, "workProgramDesc", e.target.value)}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Budget Value (IDR)</FormLabel>
                          <InputGroup size="md">
                            <InputLeftAddon children="Rp." bg="gray.100" fontWeight="bold" />
                            <Input
                              placeholder="1.000.000"
                              value={wp.budgetValueRaw}
                              onChange={(e) => updateWorkProgramField(index, "budgetValueRaw", formatRupiahString(e.target.value))}
                            />
                          </InputGroup>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Bundling Input Rembis</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="REMBIS-001"
                            value={wp.bundlingInputRembisRaw}
                            onChange={(e) => updateWorkProgramField(index, "bundlingInputRembisRaw", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Bundling Budget</FormLabel>
                          <InputGroup size="md">
                            <InputLeftAddon children="Rp." bg="gray.100" fontWeight="bold" />
                            <Input
                              placeholder="0"
                              value={wp.bundlingBudgetRaw}
                              onChange={(e) => updateWorkProgramField(index, "bundlingBudgetRaw", formatRupiahString(e.target.value))}
                            />
                          </InputGroup>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Budget Type</FormLabel>
                          <RadioGroup
                            size="md"
                            value={wp.budgetType}
                            onChange={(val) => updateWorkProgramField(index, "budgetType", val)}
                          >
                            <HStack spacing={5} pt={1}>
                              <Radio value="CAPEX" colorScheme="blue">CAPEX</Radio>
                              <Radio value="OPEX" colorScheme="purple">OPEX</Radio>
                            </HStack>
                          </RadioGroup>
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Work Program Category Type</FormLabel>
                          <RadioGroup
                            size="md"
                            value={wp.workProgramType}
                            onChange={(val) => updateWorkProgramField(index, "workProgramType", val)}
                          >
                            <HStack spacing={4} wrap="wrap" pt={1}>
                              <Radio value="PROGRAM KERJA BARU" colorScheme="teal">PROGRAM KERJA BARU</Radio>
                              <Radio value="PEKERJAAN RUTIN" colorScheme="blue">PEKERJAAN RUTIN</Radio>
                              <Radio value="CARRY OVER" colorScheme="orange">CARRY OVER</Radio>
                              <Radio value="SISA BAYAR" colorScheme="red">SISA BAYAR</Radio>
                            </HStack>
                          </RadioGroup>
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <FormControl size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Data Center Options</FormLabel>
                          <HStack spacing={6} align="center" wrap="wrap">
                            <CheckboxGroup
                              value={wp.dataCenterOption}
                              onChange={(val) => updateWorkProgramField(index, "dataCenterOption", val as string[])}
                            >
                              <HStack spacing={6}>
                                <Checkbox value="DC1" colorScheme="blue">DC1</Checkbox>
                                <Checkbox value="DC2" colorScheme="blue">DC2</Checkbox>
                                <Checkbox value="Other" colorScheme="blue">Other Custom DC</Checkbox>
                              </HStack>
                            </CheckboxGroup>

                            {wp.dataCenterOption.includes("Other") && (
                              <Input
                                size="sm"
                                w="240px"
                                rounded="lg"
                                placeholder="Specify Custom Data Center..."
                                value={wp.dataCenterOtherText}
                                onChange={(e) => updateWorkProgramField(index, "dataCenterOtherText", e.target.value.toUpperCase())}
                              />
                            )}
                          </HStack>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">LG Account Number</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="LG-1002938"
                            value={wp.lgAccountNumber}
                            onChange={(e) => updateWorkProgramField(index, "lgAccountNumber", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">LG Account Name</FormLabel>
                          <Input
                            size="md"
                            rounded="lg"
                            placeholder="BEBAN OPERASIONAL TEKNOLOGI INFORMASI"
                            value={wp.lgAccountName}
                            onChange={(e) => updateWorkProgramField(index, "lgAccountName", e.target.value.toUpperCase())}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Period Year</FormLabel>
                          <ChakraSelect
                            size="md"
                            rounded="lg"
                            value={wp.periodYear}
                            onChange={(e) => updateWorkProgramField(index, "periodYear", e.target.value)}
                          >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                          </ChakraSelect>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Period Quartal</FormLabel>
                          <RadioGroup
                            size="md"
                            value={wp.periodQuartal}
                            onChange={(val) => updateWorkProgramField(index, "periodQuartal", val)}
                          >
                            <HStack spacing={4} pt={1}>
                              <Radio value="Q1">Q1</Radio>
                              <Radio value="Q2">Q2</Radio>
                              <Radio value="Q3">Q3</Radio>
                              <Radio value="Q4">Q4</Radio>
                            </HStack>
                          </RadioGroup>
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <FormControl isRequired size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">
                            Period Time SLA (Number of Days)
                          </FormLabel>
                          <VStack align="stretch" spacing={2}>
                            <HStack spacing={3}>
                              <Input
                                size="md"
                                type="number"
                                rounded="lg"
                                w="180px"
                                placeholder="365"
                                value={wp.periodTime}
                                onChange={(e) => updateWorkProgramField(index, "periodTime", e.target.value)}
                              />
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">Days</Text>
                            </HStack>

                            <HStack spacing={2} pt={1} wrap="wrap">
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">Quick Fill Presets:</Text>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => updateWorkProgramField(index, "periodTime", "30")}
                              >
                                1 Month (30d)
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="teal"
                                onClick={() => updateWorkProgramField(index, "periodTime", "90")}
                              >
                                3 Months (90d)
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="purple"
                                onClick={() => updateWorkProgramField(index, "periodTime", "180")}
                              >
                                6 Months (180d)
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="secondary"
                                onClick={() => updateWorkProgramField(index, "periodTime", "365")}
                              >
                                1 Year (365d)
                              </Button>
                            </HStack>
                          </VStack>
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 3 }}>
                        <FormControl size="sm">
                          <FormLabel fontSize="xs" fontWeight="bold">Note / Remarks</FormLabel>
                          <Textarea
                            size="sm"
                            rows={2}
                            rounded="lg"
                            placeholder="Enter additional remarks or notes..."
                            value={wp.note}
                            onChange={(e) => updateWorkProgramField(index, "note", e.target.value)}
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            ))}

            {/* SECTION 3 — FORM SUBMISSION & SUMMARY ACTION CARD */}
            <Card
              rounded="2xl"
              shadow="lg"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              w="full"
            >
              <CardBody p={{ base: 5, md: 6 }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    size="lg"
                    onClick={() => router.push(`/master-data/rbb/detail?id=${rbbId}`)}
                    isDisabled={isSubmitting}
                  >
                    Cancel & Return to Detail
                  </Button>

                  <HStack spacing={6} wrap="wrap">
                    <VStack align="end" spacing={0} display={{ base: "none", sm: "flex" }}>
                      <Text fontSize="xs" color="gray.500">
                        {workPrograms.length} Work Program(s) Configured
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="purple.600">
                        Total Budget: {formatIDR(totalBudgetValueSum)}
                      </Text>
                    </VStack>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<FiSave />}
                      onClick={handleOpenConfirmation}
                      isLoading={isSubmitting}
                      shadow="lg"
                      px={8}
                    >
                      Save & Update Master RBB Target
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          </VStack>
        </VStack>
      </Box>

      {/* Registration Confirmation Modal with Interval Timer Countdown */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent rounded="2xl" shadow="2xl">
          <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
            <HStack spacing={3}>
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
              <Heading size="sm">Confirm Master RBB Target Update</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <Alert status="warning" rounded="xl">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="xs" fontWeight="bold">Audit History Snapshot Generation</AlertTitle>
                  <AlertDescription fontSize="2xs">
                    Updating this target will record the pre-edit snapshot into MST_RBB_HISTORY & MST_RBB_WORK_PROGRAMS_HISTORY.
                  </AlertDescription>
                </Box>
              </Alert>

              {validatedPayload && (
                <Card rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} p={4} variant="outline">
                  <VStack align="stretch" spacing={3} fontSize="xs">
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Directorate / Division:</Text>
                      <Text fontWeight="bold">{validatedPayload.orgDirectorateName} / {validatedPayload.orgDivisionName}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Target Code & Name:</Text>
                      <Text fontWeight="bold">{validatedPayload.targetCode} — {validatedPayload.targetName}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Policy Code & Name:</Text>
                      <Text fontWeight="bold">{validatedPayload.policyCode} — {validatedPayload.policyName}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Strategy Code & Name:</Text>
                      <Text fontWeight="bold">{validatedPayload.strategyCode} — {validatedPayload.strategyName}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Work Programs Count:</Text>
                      <Badge colorScheme="blue" rounded="md" px={2}>{validatedPayload.workPrograms.length} Items</Badge>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.500" fontWeight="bold">Total Allocated Budget:</Text>
                      <Text fontWeight="bold" color="purple.600" fontSize="sm">{formatIDR(totalBudgetValueSum)}</Text>
                    </Flex>
                  </VStack>
                </Card>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onConfirmClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<FiSave />}
                onClick={handleConfirmSubmit}
                isLoading={isSubmitting}
                isDisabled={submitCountdown > 0 || isSubmitting}
                shadow="md"
              >
                {submitCountdown > 0 ? `Wait ${submitCountdown}s to Confirm` : "Confirm & Save Updates"}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
