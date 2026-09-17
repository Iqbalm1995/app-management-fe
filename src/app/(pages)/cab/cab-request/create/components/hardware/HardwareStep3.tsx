"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FiCheckCircle, FiDownloadCloud, FiExternalLink, FiFileText, FiFolder, FiInfo } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { CabHardwareStep3 } from "@/app/types/cabTypes";
import { RadioAdaTidak, RadioYaTidak } from "../RadioGroupField";
import ProjectFilesModal, { getProjectRouteUrl } from "../ProjectFilesModal";
import { ProjectFileItem } from "@/app/json/cabRequestMock";

interface HardwareStep3Props {
  data: CabHardwareStep3;
  onChange: (data: CabHardwareStep3) => void;
  mainProjectId?: string;
  mainProjectCode?: string;
  mainProjectName?: string;
  tokenData?: string;
}

interface HardwareActiveFieldTarget {
  fieldKey: keyof CabHardwareStep3;
  label: string;
  category: string;
}

const HardwareStep3 = ({
  data,
  onChange,
  mainProjectId,
  mainProjectCode,
  mainProjectName,
  tokenData,
}: HardwareStep3Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();

  const [activeFieldTarget, setActiveFieldTarget] = useState<HardwareActiveFieldTarget | null>(null);

  const projectContextLabel = mainProjectName || mainProjectCode || "Proyek Hardware Terpilih";
  const projectRouteUrl = getProjectRouteUrl(
    mainProjectId || mainProjectCode || mainProjectName,
    "documentation"
  );

  const handleSelectFileForField = (file: ProjectFileItem) => {
    if (!activeFieldTarget) return;

    const updatedData = { ...data, [activeFieldTarget.fieldKey]: file.fileName };
    if (activeFieldTarget.fieldKey === "checklistFile") updatedData.checklist = "ADA";
    else if (activeFieldTarget.fieldKey === "dokumenArsitekturFile") updatedData.dokumenArsitektur = "ADA";
    else if (activeFieldTarget.fieldKey === "testFungsionalFile") updatedData.testFungsional = "ADA";
    else if (activeFieldTarget.fieldKey === "rollbackPlanFile") updatedData.rollbackPlan = "ADA";
    else if (activeFieldTarget.fieldKey === "perangkatMonitoringFile") {
      updatedData.perangkatMonitoring = "YA";
      if (!updatedData.perangkatMonitoringDetail) {
        updatedData.perangkatMonitoringDetail = "Zabbix & Grafana HW Sensor Monitoring";
      }
    } else if (activeFieldTarget.fieldKey === "persetujuanItSecurityFile") updatedData.persetujuanItSecurity = "YA";

    onChange(updatedData);

    toast({
      title: "Dokumen Berhasil Dipilih",
      description: `Berkas "${file.fileName}" berhasil dilampirkan untuk ${activeFieldTarget.label}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    setActiveFieldTarget(null);
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        {/* Header Action: Tarik Dokumen dari Project Sebelumnya */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={3}
          p={3.5}
          bg={isDark ? "blue.950" : "blue.50"}
          border="1px solid"
          borderColor={isDark ? "blue.800" : "blue.200"}
          rounded="lg"
          mb={2}
        >
          <VStack align="start" spacing={0.5}>
            <HStack spacing={2} wrap="wrap">
              <Text fontSize="xs" fontWeight="bold" color={isDark ? "blue.200" : "blue.800"}>
                Proyek Hardware:
              </Text>
              <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} rounded="md">
                {projectContextLabel}
              </Badge>
              <Tooltip label="Buka halaman proyek di tab baru">
                <Button
                  as="a"
                  href={projectRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="link"
                  colorScheme="blue"
                  rightIcon={<FiExternalLink />}
                >
                  Buka Proyek
                </Button>
              </Tooltip>
            </HStack>
            <Text fontSize="xs" color={isDark ? "blue.300" : "blue.600"}>
              Tersedia 6 berkas teknis hardware dari repositori proyek terkait yang siap dilampirkan otomatis atau dipilih per butir.
            </Text>
          </VStack>

          {/* <Button
            size="xs"
            colorScheme="blue"
            variant="solid"
            leftIcon={<FiDownloadCloud />}
            onClick={onOpen}
          >
            Ambil File dari Project Sebelumnya
          </Button> */}
        </Flex>

        <RadioAdaTidak
          label="Checklist"
          name="checklist"
          value={data.checklist}
          onChange={(val) => onChange({ ...data, checklist: val as any })}
          fileAttachment={data.checklistFile}
          onFileChange={(file) => onChange({ ...data, checklistFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "checklistFile",
              label: "Checklist Hardware",
              category: "Manual & Runbook",
            })
          }
          isRequired
        />

        <RadioAdaTidak
          label="Dokumen Arsitektur"
          name="dokumenArsitektur"
          value={data.dokumenArsitektur}
          onChange={(val) => onChange({ ...data, dokumenArsitektur: val as any })}
          fileAttachment={data.dokumenArsitekturFile}
          onFileChange={(file) => onChange({ ...data, dokumenArsitekturFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "dokumenArsitekturFile",
              label: "Dokumen Arsitektur Hardware",
              category: "Arsitektur",
            })
          }
          isRequired
        />

        <RadioAdaTidak
          label="Test Fungsional"
          name="testFungsional"
          value={data.testFungsional}
          onChange={(val) => onChange({ ...data, testFungsional: val as any })}
          fileAttachment={data.testFungsionalFile}
          onFileChange={(file) => onChange({ ...data, testFungsionalFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "testFungsionalFile",
              label: "Test Fungsional Hardware",
              category: "UAT & QA",
            })
          }
          isRequired
        />

        <RadioAdaTidak
          label="Rollback Plan"
          name="rollbackPlan"
          value={data.rollbackPlan}
          onChange={(val) => onChange({ ...data, rollbackPlan: val as any })}
          fileAttachment={data.rollbackPlanFile}
          onFileChange={(file) => onChange({ ...data, rollbackPlanFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "rollbackPlanFile",
              label: "Rollback Plan Hardware",
              category: "Manual & Runbook",
            })
          }
          isRequired
        />

        <RadioYaTidak
          label="Perangkat Monitoring"
          name="perangkatMonitoring"
          value={data.perangkatMonitoring}
          onChange={(val) => onChange({ ...data, perangkatMonitoring: val as any })}
          fileAttachment={data.perangkatMonitoringFile}
          onFileChange={(file) => onChange({ ...data, perangkatMonitoringFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "perangkatMonitoringFile",
              label: "Perangkat Monitoring",
              category: "Manual & Runbook",
            })
          }
          isRequired
          showChildren={data.perangkatMonitoring === "YA"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Detail Perangkat Monitoring</FormLabel>
            <Input
              placeholder="Sebutkan perangkat monitoring..."
              value={data.perangkatMonitoringDetail || ""}
              onChange={(e) => onChange({ ...data, perangkatMonitoringDetail: e.target.value })}
            />
          </FormControl>
        </RadioYaTidak>

        <RadioYaTidak
          label="Persetujuan Divisi IT Security"
          name="persetujuanItSecurity"
          value={data.persetujuanItSecurity}
          onChange={(val) => onChange({ ...data, persetujuanItSecurity: val as any })}
          fileAttachment={data.persetujuanItSecurityFile}
          onFileChange={(file) => onChange({ ...data, persetujuanItSecurityFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "persetujuanItSecurityFile",
              label: "Persetujuan Divisi IT Security",
              category: "Security & SAST",
            })
          }
          isRequired
        />
      </InputGroupPanel>

      {/* ─── Modal Pilih Dokumen Spesifik Per Pertanyaan ─── */}
      <ProjectFilesModal
        isOpen={!!activeFieldTarget}
        onClose={() => setActiveFieldTarget(null)}
        onSelectFile={handleSelectFileForField}
        projectContext={projectContextLabel}
        projectCode={mainProjectCode}
        projectId={mainProjectId}
        categoryFilter={activeFieldTarget?.category}
        fieldTitle={activeFieldTarget?.label}
        projectUrl={projectRouteUrl}
        tokenData={tokenData}
      />
    </VStack>
  );
};

export default HardwareStep3;
