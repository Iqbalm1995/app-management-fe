"use client";

import { useMemo } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
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
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiZap } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SimulationMember, SimulationParty, SimulationStage } from "../types";
import { computeDuration, computeEndDate } from "../utils/weekBucket";
import {
  calculateStageContention,
  UserWorkloadRecord,
} from "../utils/workloadHelper";
import { radiusStyle } from "@/app/constants/applicationConstants";
import PartySelect from "./PartySelect";
import MemberSelect from "./MemberSelect";
import BacklogSelect from "./BacklogSelect";

interface StageFormValues {
  stageName: string;
  parties: SimulationParty[];
  members: SimulationMember[];
  startDate: string;
  endDate: string;
  durationDays: number | "";
  extendedDays: number | "";
  backlogId: string | null;
  backlogName: string | null;
}

interface StageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  projectId?: string | null;
  workloadMap?: Map<string, UserWorkloadRecord>;
  /** When present, the modal edits this stage; otherwise it creates a new one. */
  stage: SimulationStage | null;
  /** Pre-filled start date (e.g. end date of previous stage) */
  defaultStartDate?: string | null;
  onSubmit: (values: {
    stageName: string;
    parties: SimulationParty[];
    members: SimulationMember[];
    startDate: string | null;
    endDate: string | null;
    durationDays: number | null;
    extendedDays: number | null;
    backlogId: string | null;
    backlogName: string | null;
  }) => void;
}

const ValidationSchema = Yup.object().shape({
  stageName: Yup.string()
    .trim()
    .required("Stage name is required")
    .max(150, "Maximum 150 characters"),
  startDate: Yup.string(),
  endDate: Yup.string().test(
    "end-after-start",
    "End date must be on or after start date",
    function (value) {
      const { startDate } = this.parent as StageFormValues;
      if (!startDate || !value) return true;
      return new Date(value) >= new Date(startDate);
    }
  ),
  durationDays: Yup.number()
    .transform((v, o) => (o === "" ? undefined : v))
    .min(1, "Base duration must be at least 1 day")
    .nullable(),
  extendedDays: Yup.number()
    .transform((v, o) => (o === "" ? undefined : v))
    .min(0, "Extended days cannot be negative")
    .nullable(),
});

const StageFormModal = ({
  isOpen,
  onClose,
  token,
  projectId,
  workloadMap,
  stage,
  defaultStartDate,
  onSubmit,
}: StageFormModalProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const initialValues = useMemo<StageFormValues>(() => {
    const defaultStart = stage?.startDate ?? defaultStartDate ?? "";
    const defaultDur = stage?.durationDays ?? (defaultStart ? 7 : "");
    const defaultExt = stage?.extendedDays ?? 0;
    const effectiveDur =
      defaultDur !== "" ? Number(defaultDur) + Number(defaultExt) : "";

    const defaultEnd =
      stage?.endDate ??
      (defaultStart && effectiveDur !== ""
        ? computeEndDate(defaultStart, Number(effectiveDur)) ?? ""
        : "");

    return {
      stageName: stage?.stageName ?? "",
      parties: stage?.parties ?? [],
      members: stage?.members ?? [],
      startDate: defaultStart,
      endDate: defaultEnd,
      durationDays: defaultDur,
      extendedDays: defaultExt,
      backlogId: stage?.backlogId ?? null,
      backlogName: stage?.backlogName ?? null,
    };
  }, [stage, defaultStartDate]);

  const formik = useFormik<StageFormValues>({
    initialValues,
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({
        stageName: values.stageName.trim(),
        parties: values.parties,
        members: values.members,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        durationDays:
          values.durationDays === "" ? null : Number(values.durationDays),
        extendedDays:
          values.extendedDays === "" ? 0 : Number(values.extendedDays),
        backlogId: values.backlogId,
        backlogName: values.backlogName,
      });
      onClose();
    },
  });

  // Calculate realistic contention based on assigned members and base duration
  const baseDur = Number(formik.values.durationDays) || 7;
  const contentionAnalysis = useMemo(() => {
    return calculateStageContention(baseDur, formik.values.members);
  }, [baseDur, formik.values.members]);

  const effectiveDurationDays = useMemo(() => {
    const b = Number(formik.values.durationDays) || 0;
    const e = Number(formik.values.extendedDays) || 0;
    return b + e;
  }, [formik.values.durationDays, formik.values.extendedDays]);

  /** Recalculate end date whenever start date, base duration, or extended buffer changes */
  const syncEndDate = (start: string, base: number | "", ext: number | "") => {
    if (!start) return;
    const b = base === "" ? 0 : Number(base);
    const e = ext === "" ? 0 : Number(ext);
    const total = b + e;
    if (total > 0) {
      const computedEnd = computeEndDate(start, total);
      if (computedEnd) formik.setFieldValue("endDate", computedEnd);
    }
  };

  const handleStartChange = (v: string) => {
    formik.setFieldValue("startDate", v);
    syncEndDate(v, formik.values.durationDays, formik.values.extendedDays);
  };

  const handleEndChange = (v: string) => {
    formik.setFieldValue("endDate", v);
    if (formik.values.startDate && v) {
      const rawDiff = computeDuration(formik.values.startDate, v) ?? 1;
      const ext = Number(formik.values.extendedDays) || 0;
      const base = Math.max(1, rawDiff - ext);
      formik.setFieldValue("durationDays", base);
    }
  };

  const handleDurationChange = (v: string) => {
    const num = v === "" ? "" : Number(v);
    formik.setFieldValue("durationDays", num);
    syncEndDate(formik.values.startDate, num, formik.values.extendedDays);
  };

  const handleExtendedDaysChange = (v: string | number) => {
    const num = v === "" ? "" : Math.max(0, Number(v));
    formik.setFieldValue("extendedDays", num);
    syncEndDate(formik.values.startDate, formik.values.durationDays, num);
  };

  const applySuggestedBuffer = () => {
    handleExtendedDaysChange(contentionAnalysis.suggestedBufferDays);
  };

  const clearBuffer = () => {
    handleExtendedDaysChange(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        rounded="2xl"
        bg={isDark ? "gray.850" : "white"}
        border="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        shadow="2xl"
        maxW="680px"
      >
        <ModalHeader
          fontSize="md"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor={isDark ? "gray.700" : "gray.100"}
          py={4}
        >
          <HStack justify="space-between" pr={6}>
            <HStack spacing={2}>
              <Icon as={FiClock} color="secondary.500" />
              <Text>{stage ? "Edit Stage & Contention" : "Add Stage & Contention"}</Text>
            </HStack>
            {effectiveDurationDays > 0 && (
              <Badge colorScheme="blue" variant="subtle" rounded="md" px={2.5} py={0.5} fontSize="xs">
                Total: {effectiveDurationDays} Hari
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <form onSubmit={formik.handleSubmit}>
          <ModalBody py={5}>
            <VStack spacing={4} align="stretch">
              {/* Stage Name */}
              <FormControl isInvalid={!!formik.errors.stageName} isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  Stage Name
                </FormLabel>
                <Input
                  value={formik.values.stageName}
                  onChange={(e) => formik.setFieldValue("stageName", e.target.value)}
                  placeholder="e.g. Analisis & Perancangan Sistem"
                  rounded="lg"
                  focusBorderColor="blue.500"
                  borderColor={isDark ? "gray.600" : "gray.300"}
                />
                <FormErrorMessage>{formik.errors.stageName}</FormErrorMessage>
              </FormControl>

              {/* Members Field with Project Workload Context */}
              <FormControl>
                <MemberSelect
                  token={token}
                  projectId={projectId}
                  value={formik.values.members}
                  workloadMap={workloadMap}
                  onChange={(members) => {
                    formik.setFieldValue("members", members);
                    // Re-evaluate contention buffer if newly selected members have contention
                    const analysis = calculateStageContention(baseDur, members);
                    if (analysis.hasContention && (!formik.values.extendedDays || Number(formik.values.extendedDays) === 0)) {
                      handleExtendedDaysChange(analysis.suggestedBufferDays);
                    }
                  }}
                  placeholder="Pilih anggota tim yang bertugas pada stage ini..."
                />
              </FormControl>

              {/* Contention Alert Box (Triggers when 1+1+1 or multi-project is detected) */}
              {contentionAnalysis.hasContention && contentionAnalysis.bottleneckMember && (
                <Box
                  p={3.5}
                  bg={isDark ? "orange.900" : "orange.50"}
                  border="1px solid"
                  borderColor={isDark ? "orange.700" : "orange.200"}
                  rounded="xl"
                  shadow="xs"
                >
                  <VStack align="stretch" spacing={2.5}>
                    <Flex justify="space-between" align="start">
                      <HStack spacing={2}>
                        <Icon as={FiAlertTriangle} color="orange.400" boxSize={4} />
                        <Text fontSize="xs" fontWeight="bold" color={isDark ? "orange.200" : "orange.800"}>
                          Multi-Project Resource Contention Terdeteksi ({contentionAnalysis.maxProjectCount} Proyek Aktif)
                        </Text>
                      </HStack>
                      <Badge colorScheme="orange" fontSize="3xs" rounded="md" px={2} py={0.5}>
                        {contentionAnalysis.primaryRule.badgeLabel}
                      </Badge>
                    </Flex>

                    <Text fontSize="2xs" color={isDark ? "gray.300" : "gray.700"} lineHeight="tall">
                      <strong>{contentionAnalysis.bottleneckMember.name}</strong> sedang aktif pada{" "}
                      <strong>{contentionAnalysis.maxProjectCount} proyek concurrent</strong>{" "}
                      {contentionAnalysis.bottleneckMember.assignedProjectNames &&
                      contentionAnalysis.bottleneckMember.assignedProjectNames.length > 0
                        ? `(${contentionAnalysis.bottleneckMember.assignedProjectNames.slice(0, 3).join(", ")})`
                        : ""}
                      . Berdasarkan aturan Weinberg / PMO, kapasitas efektif tersisa{" "}
                      <strong>~{contentionAnalysis.primaryRule.effectiveProductiveCapacityPct}%</strong> (
                      {contentionAnalysis.primaryRule.contextSwitchingLossPct}% terdisrupsi context-switching).
                    </Text>

                    <HStack justify="space-between" align="center" pt={1}>
                      <Text fontSize="2xs" fontWeight="semibold" color={isDark ? "orange.300" : "orange.700"}>
                        Simulasi buffer: <strong>+{contentionAnalysis.suggestedBufferDays} hari</strong> ({Math.round(contentionAnalysis.primaryRule.overheadFactor * 100)}% dari durasi dasar {baseDur} hari).
                      </Text>

                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          colorScheme="orange"
                          leftIcon={<FiZap />}
                          rounded="md"
                          onClick={applySuggestedBuffer}
                        >
                          Terapkan (+{contentionAnalysis.suggestedBufferDays}h)
                        </Button>
                        {Number(formik.values.extendedDays) > 0 && (
                          <Button size="xs" variant="ghost" colorScheme="gray" rounded="md" onClick={clearBuffer}>
                            Reset
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Involved Parties */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  Involved Parties (Divisi / Grup / Roles)
                </FormLabel>
                <PartySelect
                  token={token}
                  value={formik.values.parties}
                  onChange={(parties) => formik.setFieldValue("parties", parties)}
                />
              </FormControl>

              {/* Schedule Inputs: Start Date, Base Duration, Extended Days, End Date */}
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr" }} gap={3}>
                <GridItem>
                  <FormControl isInvalid={!!formik.errors.startDate}>
                    <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                      Start Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={formik.values.startDate}
                      onChange={(e) => handleStartChange(e.target.value)}
                      rounded="lg"
                      size="sm"
                      focusBorderColor="blue.500"
                      borderColor={isDark ? "gray.600" : "gray.300"}
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={!!formik.errors.durationDays}>
                    <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                      Base Days
                    </FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={formik.values.durationDays}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      rounded="lg"
                      size="sm"
                      focusBorderColor="blue.500"
                      borderColor={isDark ? "gray.600" : "gray.300"}
                    />
                    <FormErrorMessage>{formik.errors.durationDays as string}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={!!formik.errors.extendedDays}>
                    <HStack justify="space-between">
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" mb={0}>
                        Ext. Buffer
                      </FormLabel>
                      {Number(formik.values.extendedDays) > 0 && (
                        <Badge colorScheme="orange" fontSize="4xs" rounded="xs">
                          +{formik.values.extendedDays}d
                        </Badge>
                      )}
                    </HStack>
                    <Input
                      type="number"
                      min={0}
                      value={formik.values.extendedDays}
                      onChange={(e) => handleExtendedDaysChange(e.target.value)}
                      placeholder="0"
                      rounded="lg"
                      size="sm"
                      focusBorderColor="orange.500"
                      borderColor={Number(formik.values.extendedDays) > 0 ? "orange.400" : isDark ? "gray.600" : "gray.300"}
                    />
                    <FormErrorMessage>{formik.errors.extendedDays as string}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={!!formik.errors.endDate}>
                    <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                      End Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={formik.values.endDate}
                      onChange={(e) => handleEndChange(e.target.value)}
                      rounded="lg"
                      size="sm"
                      focusBorderColor="blue.500"
                      borderColor={isDark ? "gray.600" : "gray.300"}
                    />
                    <FormErrorMessage>{formik.errors.endDate}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Live Duration Calculation Banner */}
              <Box
                p={2.5}
                bg={isDark ? "whiteAlpha.50" : "gray.50"}
                rounded="lg"
                border="1px dashed"
                borderColor={isDark ? "gray.700" : "gray.300"}
              >
                <Flex justify="space-between" align="center" fontSize="xs">
                  <HStack spacing={2}>
                    <Text color="gray.500">Perhitungan Durasi:</Text>
                    <Badge colorScheme="blue" variant="outline" rounded="md">
                      Dasar: {formik.values.durationDays || 0} hari
                    </Badge>
                    <Text fontWeight="bold">+</Text>
                    <Badge colorScheme={Number(formik.values.extendedDays) > 0 ? "orange" : "gray"} rounded="md">
                      Buffer: {formik.values.extendedDays || 0} hari
                    </Badge>
                    <Text fontWeight="bold">=</Text>
                    <Badge colorScheme="purple" variant="solid" rounded="md" px={2}>
                      Efektif: {effectiveDurationDays} hari
                    </Badge>
                  </HStack>
                  {formik.values.endDate && (
                    <Text fontSize="2xs" color="gray.500">
                      Selesai: <strong>{formik.values.endDate}</strong>
                    </Text>
                  )}
                </Flex>
              </Box>

              {/* Kanban Backlog */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  Kanban Backlog (Reuse)
                </FormLabel>
                <BacklogSelect
                  token={token}
                  value={{
                    backlogId: formik.values.backlogId,
                    backlogName: formik.values.backlogName,
                  }}
                  onChange={(b) => {
                    formik.setFieldValue("backlogId", b.backlogId);
                    formik.setFieldValue("backlogName", b.backlogName);
                    if (b.startDate && !formik.values.startDate) {
                      handleStartChange(b.startDate);
                    }
                    if (b.endDate && !formik.values.endDate) {
                      handleEndChange(b.endDate);
                    }
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor={isDark ? "gray.700" : "gray.100"}
            py={3}
          >
            <Button variant="ghost" mr={3} onClick={onClose} rounded={radiusStyle} size="sm">
              Cancel
            </Button>
            <Button
              colorScheme="secondary"
              type="submit"
              rounded={radiusStyle}
              size="sm"
              px={5}
              _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
              transition="all 0.2s ease"
            >
              {stage ? "Save Changes" : "Add Stage"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default StageFormModal;
