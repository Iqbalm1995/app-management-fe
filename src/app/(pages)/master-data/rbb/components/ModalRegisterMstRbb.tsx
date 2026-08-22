"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
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
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  Stack,
  Text,
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiTarget,
  FiCalendar,
  FiDollarSign,
  FiLayers,
  FiClock,
} from "react-icons/fi";

// Services & Helpers
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useMstRbb, { MstRbbWorkProgramInsertPayload } from "@/app/services/useMstRbb";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";

interface ModalRegisterMstRbbProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WorkProgramFormItem {
  id: string; // temporary key
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

const emptyWorkProgramItem = (): WorkProgramFormItem => ({
  id: Math.random().toString(36).substring(2, 9),
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
const formatRupiahString = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(digitsOnly, 10));
};

const parseRupiahNumber = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return 0;
  return parseInt(digitsOnly, 10);
};

export default function ModalRegisterMstRbb({ isOpen, onClose, onSuccess }: ModalRegisterMstRbbProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { RegisterMstRbb, isLoading: isSubmitting } = useMstRbb();
  const { List: ListOrganization } = useOrganization();

  const [tokenData, setTokenData] = useState<string>("");
  const [orgList, setOrgList] = useState<OrganizationResponse[]>([]);

  // Section 1 - Master RBB Target Form State
  const [selectedDirectorateId, setSelectedDirectorateId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [targetCode, setTargetCode] = useState<string>("");
  const [targetName, setTargetName] = useState<string>("");
  const [policyCode, setPolicyCode] = useState<string>("");
  const [policyName, setPolicyName] = useState<string>("");

  // Section 2 - Work Programs List State
  const [workPrograms, setWorkPrograms] = useState<WorkProgramFormItem[]>([emptyWorkProgramItem()]);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token && isOpen) {
      setTokenData(token);
      loadOrganizations(token);
    }
  }, [isOpen]);

  const loadOrganizations = async (token: string) => {
    try {
      const res = await ListOrganization(
        { page: 0, limit: 1000, search: "", filterWhere: [], fieldOrder: ["orgName"], orderDir: "asc" },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOrgList(res.data);
      }
    } catch (err) {
      console.error("Error loading organizations:", err);
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

  // Selected Group Data object
  const selectedGroupObj = useMemo(() => {
    return orgList.find((org) => org.id === selectedGroupId);
  }, [orgList, selectedGroupId]);

  // Dynamic Work Program List Handlers
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

  const updateWorkProgramField = (index: number, field: keyof WorkProgramFormItem, value: any) => {
    setWorkPrograms((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Submit Handler
  const handleSubmit = async () => {
    // Section 1 Validation
    if (!selectedDirectorateId || !selectedDivisionId) {
      showToast({ description: "Please select Directorate and Division", statusToast: "warning" });
      return;
    }
    if (!targetCode || !targetName || !policyCode || !policyName) {
      showToast({ description: "Please fill all required Master RBB Target fields", statusToast: "warning" });
      return;
    }

    const selectedDirObj = orgList.find((o) => o.id === selectedDirectorateId);
    const selectedDivObj = orgList.find((o) => o.id === selectedDivisionId);

    // Section 2 Work Programs Validation & Formatting
    const formattedWorkPrograms: MstRbbWorkProgramInsertPayload[] = [];
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
        itspCode: wp.itspCode.toUpperCase(),
        itspName: wp.itspName.toUpperCase(),
        itspInit: wp.itspInit.toUpperCase(),
        initOrgGroupId: selectedGroupObj?.id || "",
        initOrgGroupCode: selectedGroupObj?.orgCode || "",
        initOrgGroupName: selectedGroupObj?.orgName || "",
        workProgramCode: wp.workProgramCode.toUpperCase(),
        workProgramDesc: wp.workProgramDesc, // mixed case allowed
        budgetValue: parseRupiahNumber(wp.budgetValueRaw),
        budgetType: wp.budgetType.toUpperCase(),
        note: wp.note, // mixed case allowed
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

    const payload = {
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
      strategyCode: targetCode.toUpperCase(),
      strategyName: targetName.toUpperCase(),
      workPrograms: formattedWorkPrograms,
    };

    const res = await RegisterMstRbb(payload, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Master RBB target & Work Programs registered successfully", statusToast: "success" });
      onSuccess();
      onClose();
    } else {
      showToast({ description: res?.message || "Failed to register Master RBB", statusToast: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
      <ModalContent rounded="2xl" shadow="2xl" bg={colorMode === "light" ? "white" : "gray.900"}>
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
          <HStack spacing={3}>
            <Box w={10} h={10} bg="secondary.500" rounded="xl" display="flex" alignItems="center" justifyContent="center" color="white">
              <FiTarget size={20} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">Register New Master RBB Target</Heading>
              <Text fontSize="xs" color="gray.500">
                Define Corporate RBB Target, Strategic Policy & ITSP Work Programs Allocation
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={8} align="stretch">
            {/* SECTION 1 - MASTER RBB TARGET & POLICY */}
            <Card rounded="xl" border="1px" borderColor="blue.200" bg={colorMode === "light" ? "blue.50/20" : "gray.800"}>
              <CardBody p={5}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} color="secondary.600">
                    <Icon as={FiLayers} boxSize={5} />
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider">
                      Section 1 - Data Master RBB Target & Organization
                    </Heading>
                  </HStack>
                  <Divider />

                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                    {/* Directorate Select */}
                    <GridItem>
                      <FormControl isRequired size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold">Directorate</FormLabel>
                        <ChakraSelect
                          size="sm"
                          rounded="md"
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

                    {/* Division Select */}
                    <GridItem>
                      <FormControl isRequired size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold">Division</FormLabel>
                        <ChakraSelect
                          size="sm"
                          rounded="md"
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

                    {/* Group Select */}
                    <GridItem>
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold">Group (Optional)</FormLabel>
                        <ChakraSelect
                          size="sm"
                          rounded="md"
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
                          size="sm"
                          rounded="md"
                          placeholder="1.1.1.1"
                          value={targetCode}
                          onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
                        />
                        <FormHelperText fontSize="3xs">Format example: 1.1.1.1</FormHelperText>
                      </FormControl>
                    </GridItem>

                    {/* Target Name */}
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl isRequired size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold">Target Name / Description</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
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
                          size="sm"
                          rounded="md"
                          placeholder="1.1.1.1"
                          value={policyCode}
                          onChange={(e) => setPolicyCode(e.target.value.toUpperCase())}
                        />
                        <FormHelperText fontSize="3xs">Format example: 1.1.1.1</FormHelperText>
                      </FormControl>
                    </GridItem>

                    {/* Policy Name */}
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl isRequired size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold">Policy Name / Strategic Goal</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          placeholder="ENTER STRATEGIC POLICY NAME IN UPPERCASE"
                          value={policyName}
                          onChange={(e) => setPolicyName(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* SECTION 2 - DYNAMIC WORK PROGRAMS */}
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <HStack spacing={2} color="secondary.600">
                  <Icon as={FiBriefcase} boxSize={5} />
                  <Heading size="xs" textTransform="uppercase" letterSpacing="wider">
                    Section 2 - Work Programs Allocation ({workPrograms.length})
                  </Heading>
                </HStack>

                <Button size="xs" colorScheme="blue" leftIcon={<FiPlus />} onClick={addWorkProgramItem}>
                  Add Work Program
                </Button>
              </Flex>

              {workPrograms.map((wp, index) => (
                <Card
                  key={wp.id}
                  rounded="xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.850"}
                  shadow="sm"
                >
                  <CardBody p={5}>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Badge colorScheme="blue" rounded="md" px={3} py={1} fontSize="xs" fontWeight="bold">
                          Work Program #{index + 1}
                        </Badge>
                        {workPrograms.length > 1 && (
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            leftIcon={<FiTrash2 />}
                            onClick={() => removeWorkProgramItem(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </Flex>

                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                        {/* ITSP Code */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">ITSP Code</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="TECHXX"
                              value={wp.itspCode}
                              onChange={(e) => updateWorkProgramField(index, "itspCode", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* ITSP Name */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">ITSP Name</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="TEKNOLOGI INFORMASI"
                              value={wp.itspName}
                              onChange={(e) => updateWorkProgramField(index, "itspName", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* ITSP Initials */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">ITSP Initials</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="TECHXX"
                              value={wp.itspInit}
                              onChange={(e) => updateWorkProgramField(index, "itspInit", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* Locked Init Org Group Data */}
                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <FormControl size="sm" isDisabled>
                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">
                              Init Org Group (Locked from Section 1 Selection)
                            </FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              bg={colorMode === "light" ? "gray.100" : "gray.800"}
                              value={selectedGroupObj ? `${selectedGroupObj.orgName} (${selectedGroupObj.orgCode})` : "NO GROUP SELECTED IN SECTION 1"}
                            />
                          </FormControl>
                        </GridItem>

                        {/* Work Program Code */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Work Program Code</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="WP-001"
                              value={wp.workProgramCode}
                              onChange={(e) => updateWorkProgramField(index, "workProgramCode", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* Work Program Description (Mixed Case Allowed) */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Work Program Description</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="Enter work program details..."
                              value={wp.workProgramDesc}
                              onChange={(e) => updateWorkProgramField(index, "workProgramDesc", e.target.value)}
                            />
                          </FormControl>
                        </GridItem>

                        {/* Budget Value (Rp Format) */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Budget Value (IDR)</FormLabel>
                            <InputGroup size="sm">
                              <InputLeftAddon children="Rp" />
                              <Input
                                placeholder="1.000.000"
                                value={wp.budgetValueRaw}
                                onChange={(e) => updateWorkProgramField(index, "budgetValueRaw", formatRupiahString(e.target.value))}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>

                        {/* Bundling Input Rembis (Rp Format) */}
                        <GridItem>
                          <FormControl size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Bundling Input Rembis</FormLabel>
                            <InputGroup size="sm">
                              <InputLeftAddon children="Rp" />
                              <Input
                                placeholder="0"
                                value={wp.bundlingInputRembisRaw}
                                onChange={(e) => updateWorkProgramField(index, "bundlingInputRembisRaw", formatRupiahString(e.target.value))}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>

                        {/* Bundling Budget (Rp Format) */}
                        <GridItem>
                          <FormControl size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Bundling Budget</FormLabel>
                            <InputGroup size="sm">
                              <InputLeftAddon children="Rp" />
                              <Input
                                placeholder="0"
                                value={wp.bundlingBudgetRaw}
                                onChange={(e) => updateWorkProgramField(index, "bundlingBudgetRaw", formatRupiahString(e.target.value))}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>

                        {/* Budget Type Checkbox/Radio */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Budget Type</FormLabel>
                            <RadioGroup
                              size="sm"
                              value={wp.budgetType}
                              onChange={(val) => updateWorkProgramField(index, "budgetType", val)}
                            >
                              <HStack spacing={4} pt={1}>
                                <Radio value="CAPEX" colorScheme="blue">CAPEX</Radio>
                                <Radio value="OPEX" colorScheme="purple">OPEX</Radio>
                              </HStack>
                            </RadioGroup>
                          </FormControl>
                        </GridItem>

                        {/* Work Program Type */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Work Program Type</FormLabel>
                            <RadioGroup
                              size="sm"
                              value={wp.workProgramType}
                              onChange={(val) => updateWorkProgramField(index, "workProgramType", val)}
                            >
                              <HStack spacing={3} wrap="wrap" pt={1}>
                                <Radio value="PROGRAM KERJA BARU" colorScheme="teal">PROGRAM KERJA BARU</Radio>
                                <Radio value="PEKERJAAN RUTIN" colorScheme="blue">PEKERJAAN RUTIN</Radio>
                                <Radio value="CARRY OVER" colorScheme="orange">CARRY OVER</Radio>
                                <Radio value="SISA BAYAR" colorScheme="red">SISA BAYAR</Radio>
                              </HStack>
                            </RadioGroup>
                          </FormControl>
                        </GridItem>

                        {/* Data Center Checkboxes */}
                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <FormControl size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Data Center Options</FormLabel>
                            <HStack spacing={4} align="center" wrap="wrap">
                              <CheckboxGroup
                                value={wp.dataCenterOption}
                                onChange={(val) => updateWorkProgramField(index, "dataCenterOption", val as string[])}
                              >
                                <HStack spacing={4}>
                                  <Checkbox value="DC1">DC1</Checkbox>
                                  <Checkbox value="DC2">DC2</Checkbox>
                                  <Checkbox value="Other">Other</Checkbox>
                                </HStack>
                              </CheckboxGroup>

                              {wp.dataCenterOption.includes("Other") && (
                                <Input
                                  size="xs"
                                  w="200px"
                                  rounded="md"
                                  placeholder="Specify Other Data Center..."
                                  value={wp.dataCenterOtherText}
                                  onChange={(e) => updateWorkProgramField(index, "dataCenterOtherText", e.target.value.toUpperCase())}
                                />
                              )}
                            </HStack>
                          </FormControl>
                        </GridItem>

                        {/* LG Account Number */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">LG Account Number</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="LG-1002938"
                              value={wp.lgAccountNumber}
                              onChange={(e) => updateWorkProgramField(index, "lgAccountNumber", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* LG Account Name */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">LG Account Name</FormLabel>
                            <Input
                              size="sm"
                              rounded="md"
                              placeholder="BEBAN OPERASIONAL TEKNOLOGI INFORMASI"
                              value={wp.lgAccountName}
                              onChange={(e) => updateWorkProgramField(index, "lgAccountName", e.target.value.toUpperCase())}
                            />
                          </FormControl>
                        </GridItem>

                        {/* Period Year */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Period Year</FormLabel>
                            <ChakraSelect
                              size="sm"
                              rounded="md"
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

                        {/* Period Quartal */}
                        <GridItem>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Period Quartal</FormLabel>
                            <RadioGroup
                              size="sm"
                              value={wp.periodQuartal}
                              onChange={(val) => updateWorkProgramField(index, "periodQuartal", val)}
                            >
                              <HStack spacing={3} pt={1}>
                                <Radio value="Q1">Q1</Radio>
                                <Radio value="Q2">Q2</Radio>
                                <Radio value="Q3">Q3</Radio>
                                <Radio value="Q4">Q4</Radio>
                              </HStack>
                            </RadioGroup>
                          </FormControl>
                        </GridItem>

                        {/* Period Time (Days) & Quick Fill Presets */}
                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <FormControl isRequired size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">
                              Period Time SLA (Number of Days)
                            </FormLabel>
                            <VStack align="stretch" spacing={2}>
                              <HStack spacing={3}>
                                <Input
                                  size="sm"
                                  type="number"
                                  rounded="md"
                                  w="150px"
                                  placeholder="365"
                                  value={wp.periodTime}
                                  onChange={(e) => updateWorkProgramField(index, "periodTime", e.target.value)}
                                />
                                <Text fontSize="xs" color="gray.500">Days</Text>
                              </HStack>

                              {/* Quick Fill Buttons */}
                              <HStack spacing={2} pt={1}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">Quick Fill SLA Presets:</Text>
                                <Button
                                  size="2xs"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => updateWorkProgramField(index, "periodTime", "30")}
                                >
                                  1 Month (30d)
                                </Button>
                                <Button
                                  size="2xs"
                                  variant="outline"
                                  colorScheme="teal"
                                  onClick={() => updateWorkProgramField(index, "periodTime", "90")}
                                >
                                  3 Months (90d)
                                </Button>
                                <Button
                                  size="2xs"
                                  variant="outline"
                                  colorScheme="purple"
                                  onClick={() => updateWorkProgramField(index, "periodTime", "180")}
                                >
                                  6 Months (180d)
                                </Button>
                                <Button
                                  size="2xs"
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

                        {/* Note (Mixed Case Allowed) */}
                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <FormControl size="sm">
                            <FormLabel fontSize="xs" fontWeight="bold">Note / Additional Remarks</FormLabel>
                            <Textarea
                              size="sm"
                              rows={2}
                              rounded="md"
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
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiCheckCircle />}
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Register Master RBB Target
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
