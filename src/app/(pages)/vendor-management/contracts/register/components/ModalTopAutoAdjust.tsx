"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
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
  Progress,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiSliders,
  FiZap,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiPieChart,
  FiLayers,
  FiRepeat,
  FiCalendar,
} from "react-icons/fi";
import { ContractTopInsertPayload } from "@/app/services/useVendor";

interface ModalTopAutoAdjustProps {
  isOpen: boolean;
  onClose: () => void;
  workValue: number;
  contractStartDate?: string;
  contractEndDate?: string;
  initialBillingType?: string;
  onApplySchedule: (generatedList: ContractTopInsertPayload[]) => void;
}

export const formatIDR = (value: number) => {
  if (value === undefined || value === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const ModalTopAutoAdjust = ({
  isOpen,
  onClose,
  workValue,
  contractStartDate,
  contractEndDate,
  initialBillingType,
  onApplySchedule,
}: ModalTopAutoAdjustProps) => {
  const { colorMode } = useColorMode();

  const [mode, setMode] = useState<"PERCENTAGE" | "EQUAL" | "SUBSCRIPTION">("PERCENTAGE");

  // Equal division state
  const [equalStepsCount, setEqualStepsCount] = useState<number>(3);

  // Subscription frequency state
  const [subFrequency, setSubFrequency] = useState<"MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL">("MONTHLY");

  // Percentage division state
  const [percentageSteps, setPercentageSteps] = useState<
    { pct: number; desc: string }[]
  >([
    { pct: 30, desc: "DP / Termin 1 (30%)" },
    { pct: 40, desc: "Termin 2 (40%) BAST 1" },
    { pct: 30, desc: "Pelunasan (30%) BAST 2" },
  ]);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      if (initialBillingType && initialBillingType.startsWith("SUBSCRIPTION")) {
        setMode("SUBSCRIPTION");
        if (initialBillingType === "SUBSCRIPTION_ANNUAL") {
          setSubFrequency("ANNUAL");
        } else if (initialBillingType === "SUBSCRIPTION_QUARTERLY") {
          setSubFrequency("QUARTERLY");
        } else if (initialBillingType === "SUBSCRIPTION_SEMI_ANNUAL") {
          setSubFrequency("SEMI_ANNUAL");
        } else {
          setSubFrequency("MONTHLY");
        }
      } else {
        setMode("PERCENTAGE");
      }
      setEqualStepsCount(3);
      setPercentageSteps([
        { pct: 30, desc: "DP / Termin 1 (30%)" },
        { pct: 40, desc: "Termin 2 (40%) BAST 1" },
        { pct: 30, desc: "Pelunasan (30%) BAST 2" },
      ]);
    }
  }, [isOpen, initialBillingType]);

  // Preset Handlers
  const handleApplyPreset = (preset: { pct: number; desc: string }[]) => {
    setPercentageSteps(preset);
  };

  const handleAddPercentageStep = () => {
    setPercentageSteps((prev) => [
      ...prev,
      { pct: 0, desc: `Termin ${prev.length + 1}` },
    ]);
  };

  const handleRemovePercentageStep = (index: number) => {
    setPercentageSteps((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdatePercentagePct = (index: number, val: number) => {
    setPercentageSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], pct: Math.max(0, val) };
      return updated;
    });
  };

  const handleUpdatePercentageDesc = (index: number, desc: string) => {
    setPercentageSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], desc };
      return updated;
    });
  };

  // Calculations
  const totalPercentage = percentageSteps.reduce((acc, c) => acc + (c.pct || 0), 0);
  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;

  // Build final generated list
  const buildGeneratedList = (): ContractTopInsertPayload[] => {
    if (mode === "SUBSCRIPTION") {
      let start = contractStartDate ? new Date(contractStartDate) : new Date();
      let end = contractEndDate
        ? new Date(contractEndDate)
        : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

      if (isNaN(start.getTime())) start = new Date();
      if (isNaN(end.getTime()) || end <= start) {
        end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
      }

      const list: ContractTopInsertPayload[] = [];
      let currentPeriodStart = new Date(start);
      let step = 1;

      const stepMonths =
        subFrequency === "ANNUAL"
          ? 12
          : subFrequency === "SEMI_ANNUAL"
          ? 6
          : subFrequency === "QUARTERLY"
          ? 3
          : 1;

      const pad = (n: number) => n.toString().padStart(2, "0");
      const formatYMD = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      while (currentPeriodStart < end && step <= 120) {
        // Calculate period end
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
        const freqLabel =
          subFrequency === "ANNUAL"
            ? "Tahun"
            : subFrequency === "SEMI_ANNUAL"
            ? "Semester"
            : subFrequency === "QUARTERLY"
            ? "Triwulan"
            : "Bulan";

        list.push({
          stepOrder: step,
          topValues: 0,
          topDescriptions: `Langganan ${freqLabel} #${step} (${monthName})`,
          topStatus: "ACTIVE",
          topDate: formatYMD(periodEnd),
          billingPeriodStart: formatYMD(currentPeriodStart),
          billingPeriodEnd: formatYMD(periodEnd),
          isAutoGenerated: true,
        });

        // Advance to next day after periodEnd
        currentPeriodStart = new Date(
          periodEnd.getFullYear(),
          periodEnd.getMonth(),
          periodEnd.getDate() + 1
        );
        step++;
      }

      const totalSteps = Math.max(1, list.length);
      const baseAmount = Math.floor(workValue / totalSteps);
      const remainder = workValue - baseAmount * totalSteps;

      return list.map((item, idx) => ({
        ...item,
        topValues: idx === totalSteps - 1 ? baseAmount + remainder : baseAmount,
      }));
    } else if (mode === "EQUAL") {
      const count = Math.max(1, equalStepsCount);
      const baseAmount = Math.floor(workValue / count);
      const remainder = workValue - baseAmount * count;

      const list: ContractTopInsertPayload[] = [];
      for (let i = 0; i < count; i++) {
        // Add remainder to the last step so total sum equals workValue perfectly
        const amount = i === count - 1 ? baseAmount + remainder : baseAmount;
        const pctStr = workValue > 0 ? ((amount / workValue) * 100).toFixed(1) : "0";
        list.push({
          stepOrder: i + 1,
          topValues: amount,
          topDescriptions: `Termin ${i + 1} (${pctStr}%)`,
          topStatus: "ACTIVE",
          topDate: "",
          isAutoGenerated: true,
        });
      }
      return list;
    } else {
      let accumulatedAmount = 0;
      const list: ContractTopInsertPayload[] = percentageSteps.map((step, i) => {
        let amount = Math.round(((step.pct || 0) / 100) * workValue);
        accumulatedAmount += amount;

        // If it's the last step and total percentage is 100%, adjust rounding difference
        if (i === percentageSteps.length - 1 && isPercentageValid) {
          const diff = workValue - accumulatedAmount;
          amount += diff;
        }

        return {
          stepOrder: i + 1,
          topValues: amount,
          topDescriptions: step.desc || `Termin ${i + 1} (${step.pct}%)`,
          topStatus: "ACTIVE",
          topDate: "",
          isAutoGenerated: false,
        };
      });
      return list;
    }
  };

  const handleApply = () => {
    const generated = buildGeneratedList();
    onApplySchedule(generated);
    onClose();
  };

  const currentPreviewList = buildGeneratedList();
  const currentPreviewSum = currentPreviewList.reduce((acc, c) => acc + c.topValues, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent rounded="2xl" shadow="2xl">
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <HStack spacing={3}>
            <Box w={10} h={10} bg="teal.500" rounded="xl" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiZap} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md">Auto TOP Payment Generator</Heading>
              <Text fontSize="xs" color="gray.500">
                Automatically calculate step values, percentages, and periodic cycles from Total Work Value ({formatIDR(workValue)})
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Calculation Mode Selector */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                Generation Mode
              </FormLabel>
              <RadioGroup value={mode} onChange={(val) => setMode(val as "PERCENTAGE" | "EQUAL" | "SUBSCRIPTION")}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3}>
                  <Box
                    p={3.5}
                    rounded="xl"
                    border="2px solid"
                    borderColor={mode === "PERCENTAGE" ? "teal.500" : colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={mode === "PERCENTAGE" ? (colorMode === "light" ? "teal.50/50" : "gray.700") : "transparent"}
                    cursor="pointer"
                    onClick={() => setMode("PERCENTAGE")}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2.5} align="flex-start">
                      <Radio value="PERCENTAGE" colorScheme="teal" mt={1} />
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Icon as={FiPieChart} color="teal.500" />
                          <Text fontSize="xs" fontWeight="bold">Percentage Split</Text>
                        </HStack>
                        <Text fontSize="2xs" color="gray.500">
                          Milestone % allocation
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Box
                    p={3.5}
                    rounded="xl"
                    border="2px solid"
                    borderColor={mode === "EQUAL" ? "teal.500" : colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={mode === "EQUAL" ? (colorMode === "light" ? "teal.50/50" : "gray.700") : "transparent"}
                    cursor="pointer"
                    onClick={() => setMode("EQUAL")}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2.5} align="flex-start">
                      <Radio value="EQUAL" colorScheme="teal" mt={1} />
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Icon as={FiLayers} color="teal.500" />
                          <Text fontSize="xs" fontWeight="bold">Equal Split</Text>
                        </HStack>
                        <Text fontSize="2xs" color="gray.500">
                          Divide into N steps
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Box
                    p={3.5}
                    rounded="xl"
                    border="2px solid"
                    borderColor={mode === "SUBSCRIPTION" ? "teal.500" : colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={mode === "SUBSCRIPTION" ? (colorMode === "light" ? "teal.50/50" : "gray.700") : "transparent"}
                    cursor="pointer"
                    onClick={() => setMode("SUBSCRIPTION")}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2.5} align="flex-start">
                      <Radio value="SUBSCRIPTION" colorScheme="teal" mt={1} />
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Icon as={FiRepeat} color="teal.500" />
                          <Text fontSize="xs" fontWeight="bold">Subscription Cycle</Text>
                        </HStack>
                        <Text fontSize="2xs" color="gray.500">
                          Monthly / Annual recurring
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Grid>
              </RadioGroup>
            </FormControl>

            {/* MODE 1: PERCENTAGE SPLIT CONFIGURATION */}
            {mode === "PERCENTAGE" && (
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" fontWeight="bold">Quick Percentage Presets</Text>
                    <Text fontSize="2xs" color="gray.500">Click to apply common payment structures</Text>
                  </VStack>

                  <HStack spacing={2} wrap="wrap">
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="outline"
                      onClick={() =>
                        handleApplyPreset([
                          { pct: 30, desc: "DP / Termin 1 (30%)" },
                          { pct: 40, desc: "Termin 2 (40%) BAST 1" },
                          { pct: 30, desc: "Pelunasan (30%) BAST 2" },
                        ])
                      }
                    >
                      30% - 40% - 30%
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="outline"
                      onClick={() =>
                        handleApplyPreset([
                          { pct: 50, desc: "DP / Termin 1 (50%)" },
                          { pct: 50, desc: "Pelunasan (50%) BAST" },
                        ])
                      }
                    >
                      50% - 50%
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="outline"
                      onClick={() =>
                        handleApplyPreset([
                          { pct: 20, desc: "DP / Termin 1 (20%)" },
                          { pct: 30, desc: "Termin 2 (30%) BAST 1" },
                          { pct: 50, desc: "Pelunasan (50%) BAST 2" },
                        ])
                      }
                    >
                      20% - 30% - 50%
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="teal"
                      variant="outline"
                      onClick={() =>
                        handleApplyPreset([
                          { pct: 25, desc: "Termin 1 (25%)" },
                          { pct: 25, desc: "Termin 2 (25%)" },
                          { pct: 25, desc: "Termin 3 (25%)" },
                          { pct: 25, desc: "Termin 4 (25%)" },
                        ])
                      }
                    >
                      4x 25%
                    </Button>
                  </HStack>
                </Flex>

                {/* Percentage validation alert */}
                <Alert status={isPercentageValid ? "success" : "warning"} rounded="xl" py={2.5}>
                  <AlertIcon boxSize={4} />
                  <Box flex={1}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontWeight="bold">
                        Total Allocation: {totalPercentage}% / 100%
                      </Text>
                      <Badge colorScheme={isPercentageValid ? "green" : "orange"} fontSize="2xs">
                        {isPercentageValid ? "100% Balanced" : `${(100 - totalPercentage).toFixed(1)}% Remaining`}
                      </Badge>
                    </Flex>
                    <Progress
                      value={Math.min(100, totalPercentage)}
                      size="xs"
                      colorScheme={isPercentageValid ? "green" : "orange"}
                      rounded="full"
                      mt={1.5}
                    />
                  </Box>
                </Alert>

                {/* Custom percentage list */}
                <VStack spacing={2.5} align="stretch">
                  {percentageSteps.map((step, idx) => {
                    const stepAmount = Math.round(((step.pct || 0) / 100) * workValue);
                    return (
                      <HStack key={idx} spacing={3} align="center">
                        <Badge colorScheme="teal" px={2} py={1} rounded="md" fontSize="2xs">
                          #{idx + 1}
                        </Badge>

                        <NumberInput
                          size="sm"
                          w="110px"
                          min={0}
                          max={100}
                          precision={1}
                          value={step.pct}
                          onChange={(_, val) => handleUpdatePercentagePct(idx, isNaN(val) ? 0 : val)}
                        >
                          <NumberInputField rounded="md" placeholder="%" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>

                        <Input
                          size="sm"
                          flex={1}
                          rounded="md"
                          placeholder={`Step #${idx + 1} Description...`}
                          value={step.desc}
                          onChange={(e) => handleUpdatePercentageDesc(idx, e.target.value)}
                        />

                        <Text fontSize="xs" fontWeight="bold" w="140px" textAlign="right" color="secondary.700">
                          {formatIDR(stepAmount)}
                        </Text>

                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemovePercentageStep(idx)}
                          isDisabled={percentageSteps.length <= 1}
                        >
                          <FiTrash2 />
                        </Button>
                      </HStack>
                    );
                  })}

                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant="dashed"
                    leftIcon={<FiPlus />}
                    onClick={handleAddPercentageStep}
                    alignSelf="flex-start"
                    mt={1}
                  >
                    Add Allocation Step
                  </Button>
                </VStack>
              </VStack>
            )}

            {/* MODE 2: EQUAL DIVISION CONFIGURATION */}
            {mode === "EQUAL" && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">
                    Number of Payment Steps
                  </FormLabel>
                  <HStack spacing={3}>
                    <NumberInput
                      size="sm"
                      w="140px"
                      min={1}
                      max={20}
                      value={equalStepsCount}
                      onChange={(_, val) => setEqualStepsCount(isNaN(val) || val < 1 ? 1 : val)}
                    >
                      <NumberInputField rounded="md" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>

                    <Text fontSize="xs" color="gray.500">
                      Amount per step: ~{formatIDR(Math.floor(workValue / Math.max(1, equalStepsCount)))}
                    </Text>
                  </HStack>
                </FormControl>
              </VStack>
            )}

            {/* MODE 3: SUBSCRIPTION RECURRING CONFIGURATION */}
            {mode === "SUBSCRIPTION" && (
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">
                      Billing Cycle Frequency
                    </FormLabel>
                    <HStack spacing={2} wrap="wrap">
                      <Button
                        size="xs"
                        colorScheme={subFrequency === "MONTHLY" ? "teal" : "gray"}
                        variant={subFrequency === "MONTHLY" ? "solid" : "outline"}
                        onClick={() => setSubFrequency("MONTHLY")}
                      >
                        Monthly (Bulanan)
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={subFrequency === "QUARTERLY" ? "teal" : "gray"}
                        variant={subFrequency === "QUARTERLY" ? "solid" : "outline"}
                        onClick={() => setSubFrequency("QUARTERLY")}
                      >
                        Quarterly (3 Bulan)
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={subFrequency === "SEMI_ANNUAL" ? "teal" : "gray"}
                        variant={subFrequency === "SEMI_ANNUAL" ? "solid" : "outline"}
                        onClick={() => setSubFrequency("SEMI_ANNUAL")}
                      >
                        Semi-Annual (6 Bulan)
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={subFrequency === "ANNUAL" ? "teal" : "gray"}
                        variant={subFrequency === "ANNUAL" ? "solid" : "outline"}
                        onClick={() => setSubFrequency("ANNUAL")}
                      >
                        Annual (Tahunan)
                      </Button>
                    </HStack>
                  </FormControl>

                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.800"} border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} color="teal.500" />
                      <Text fontSize="2xs" fontWeight="bold">Contract Duration Reference:</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {contractStartDate || "Start Date"} &rarr; {contractEndDate || "End Date"}
                    </Text>
                    <Text fontSize="2xs" color="teal.600" fontWeight="semibold" mt={0.5}>
                      {currentPreviewList.length} billing periods will be generated automatically.
                    </Text>
                  </Box>
                </Grid>
              </VStack>
            )}

            {/* Generated Steps Live Preview Table */}
            <VStack align="stretch" spacing={2} pt={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Generated Schedule Preview ({currentPreviewList.length} Steps)
              </Text>

              <Box overflowX="auto" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} rounded="xl" maxH="280px">
                <Table size="sm" variant="simple">
                  <Thead bg={colorMode === "light" ? "gray.50" : "gray.900"} position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th>Step</Th>
                      <Th>Description</Th>
                      {mode === "SUBSCRIPTION" && <Th>Billing Period Coverage</Th>}
                      <Th textAlign="right">Calculated Amount (IDR)</Th>
                      <Th textAlign="right">% Share</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentPreviewList.map((step, idx) => {
                      const pctShare = workValue > 0 ? ((step.topValues / workValue) * 100).toFixed(1) : "0";
                      return (
                        <Tr key={idx}>
                          <Td fontWeight="bold">Step #{step.stepOrder}</Td>
                          <Td fontSize="xs">{step.topDescriptions}</Td>
                          {mode === "SUBSCRIPTION" && (
                            <Td fontSize="2xs" color="gray.500">
                              <HStack spacing={1}>
                                <Icon as={FiCalendar} />
                                <Text>{step.billingPeriodStart} &rarr; {step.billingPeriodEnd}</Text>
                              </HStack>
                            </Td>
                          )}
                          <Td fontWeight="bold" textAlign="right" color="secondary.700">
                            {formatIDR(step.topValues)}
                          </Td>
                          <Td textAlign="right">
                            <Badge colorScheme="blue" fontSize="2xs">
                              {pctShare}%
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" px={2} pt={1}>
                <Text fontSize="2xs" color="gray.500">
                  Total Work Value: {formatIDR(workValue)}
                </Text>
                <HStack spacing={1}>
                  <Text fontSize="xs" fontWeight="bold">Calculated Sum:</Text>
                  <Text fontSize="xs" fontWeight="bold" color={currentPreviewSum === workValue ? "teal.600" : "orange.500"}>
                    {formatIDR(currentPreviewSum)}
                  </Text>
                </HStack>
              </Flex>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <HStack spacing={3}>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              leftIcon={<FiSliders />}
              isDisabled={mode === "PERCENTAGE" && !isPercentageValid}
              onClick={handleApply}
            >
              Apply Generated TOP Schedule
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalTopAutoAdjust;
