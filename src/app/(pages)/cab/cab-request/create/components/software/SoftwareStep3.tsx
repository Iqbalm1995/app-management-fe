"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
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
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import { CabSoftwareStep3, CabSoftwareStep4 } from "@/app/types/cabTypes";
import RadioGroupField, { RadioAdaTidak, RadioAdaTidakSimple, RadioYaTidak } from "../RadioGroupField";
import { CreatableSelect } from "chakra-react-select";
import ProjectFilesModal, { getProjectRouteUrl } from "../ProjectFilesModal";
import { ProjectFileItem } from "@/app/json/cabRequestMock";

interface SoftwareStep3Props {
  dataStep3: CabSoftwareStep3;
  dataStep4: CabSoftwareStep4;
  onChangeStep3: (data: CabSoftwareStep3) => void;
  onChangeStep4: (data: CabSoftwareStep4) => void;
  mainProjectId?: string;
  mainProjectCode?: string;
  mainProjectName?: string;
  tokenData?: string;
}

interface SoftwareActiveFieldTarget {
  fieldKey: keyof CabSoftwareStep4 | "ceklistMigrasiFile";
  label: string;
  category: string;
}

const SoftwareStep3 = ({
  dataStep3,
  dataStep4,
  onChangeStep3,
  onChangeStep4,
  mainProjectId,
  mainProjectCode,
  mainProjectName,
  tokenData,
}: SoftwareStep3Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();

  const [activeFieldTarget, setActiveFieldTarget] = useState<SoftwareActiveFieldTarget | null>(null);

  const handleSelectFileForField = (file: ProjectFileItem) => {
    if (!activeFieldTarget) return;

    if (activeFieldTarget.fieldKey === "ceklistMigrasiFile") {
      onChangeStep3({
        ...dataStep3,
        ceklistMigrasi: "ADA",
        ceklistMigrasiFile: file.fileName,
      });
    } else {
      const updatedStep4 = { ...dataStep4, [activeFieldTarget.fieldKey]: file.fileName };
      if (activeFieldTarget.fieldKey === "sastFile") updatedStep4.sast = "ADA";
      else if (activeFieldTarget.fieldKey === "dokumenArsitekturFile") updatedStep4.dokumenArsitektur = "ADA";
      else if (activeFieldTarget.fieldKey === "kesiapanInfrastrukturFile") updatedStep4.kesiapanInfrastruktur = "YA";
      else if (activeFieldTarget.fieldKey === "sourceAplikasiFile") updatedStep4.sourceAplikasi = "ADA";
      else if (activeFieldTarget.fieldKey === "userMatriksFile") updatedStep4.userMatriks = "ADA";
      else if (activeFieldTarget.fieldKey === "rollbackPlanFile") updatedStep4.rollbackPlan = "ADA";
      else if (activeFieldTarget.fieldKey === "toolsMonitoringFile") updatedStep4.toolsMonitoring = "ADA";
      else if (activeFieldTarget.fieldKey === "securityChecklistFile") updatedStep4.securityChecklist = "ADA";
      else if (activeFieldTarget.fieldKey === "persetujuanItSecurityFile") updatedStep4.persetujuanItSecurity = "YA";
      else if (activeFieldTarget.fieldKey === "petunjukTeknisFile") updatedStep4.petunjukTeknis = "ADA";

      onChangeStep4(updatedStep4);
    }

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

  const projectContextLabel = mainProjectName || mainProjectCode || "Proyek Terpilih";
  const projectRouteUrl = getProjectRouteUrl(
    mainProjectId || mainProjectCode || mainProjectName,
    "documentation"
  );

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* ─── Rencana Migrasi ─── */}
      <InputGroupPanel headerTitle="Rencana Migrasi">
        <RadioGroupField
          label="Downtime"
          name="downtime"
          value={dataStep3.downtime}
          onChange={(val) => onChangeStep3({ ...dataStep3, downtime: val as any })}
          options={[
            { label: "Ada", value: "ADA" },
            { label: "Tidak", value: "TIDAK" },
          ]}
          isRequired
          showChildren={dataStep3.downtime === "ADA"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Durasi Downtime</FormLabel>
            <InputGroup>
              <Input
                placeholder="30"
                value={dataStep3.downtimeDurasi || ""}
                onChange={(e) => onChangeStep3({ ...dataStep3, downtimeDurasi: e.target.value })}
              />
              <InputRightAddon>Menit</InputRightAddon>
            </InputGroup>
          </FormControl>
        </RadioGroupField>

        <RadioAdaTidak
          label="Risiko Konflik dengan Aplikasi Lain"
          name="risikoKonflik"
          value={dataStep3.risikoKonflik}
          onChange={(val) => onChangeStep3({ ...dataStep3, risikoKonflik: val as any })}
          isRequired
          showChildren={dataStep3.risikoKonflik === "ADA"}
        >
          <FormControl isRequired pt={1}>
            <FormLabel fontSize="xs" color="gray.500" mb={1}>
              Daftar Aplikasi yang Berpotensi Terkena Dampak / Konflik
            </FormLabel>
            <CreatableSelect
              isMulti
              isSearchable
              isClearable
              placeholder="Pilih atau ketik nama aplikasi (tekan Enter)..."
              noOptionsMessage={() => "Ketik nama aplikasi dan tekan Enter"}
              formatCreateLabel={(inputValue) => `+ Tambah aplikasi "${inputValue}"`}
              options={[
                { label: "Core Banking System (CBS)", value: "Core Banking System (CBS)" },
                { label: "DIGI Mobile Banking", value: "DIGI Mobile Banking" },
                { label: "Corporate Internet Banking (IBC)", value: "Corporate Internet Banking (IBC)" },
                { label: "Payment Gateway (BI-FAST / RTGS / SKN)", value: "Payment Gateway (BI-FAST / RTGS / SKN)" },
                { label: "ATM Switching & ISO8583 Gateway", value: "ATM Switching & ISO8583 Gateway" },
                { label: "Card Management System (CMS)", value: "Card Management System (CMS)" },
                { label: "Loan Origination System (LOS)", value: "Loan Origination System (LOS)" },
                { label: "Treasury System (Kondor+)", value: "Treasury System (Kondor+)" },
                { label: "Customer Relationship Management (CRM)", value: "Customer Relationship Management (CRM)" },
                { label: "Enterprise Data Warehouse (DWH)", value: "Enterprise Data Warehouse (DWH)" },
                { label: "Anti-Money Laundering (AML)", value: "Anti-Money Laundering (AML)" },
                { label: "Enterprise Service Bus (ESB / API Gateway)", value: "Enterprise Service Bus (ESB / API Gateway)" },
              ]}
              value={(dataStep3.risikoKonflikAplikasi || []).map((app) => ({ label: app, value: app }))}
              onChange={(newValue: any) => {
                const selectedApps = (newValue || []).map((item: any) => item.value);
                onChangeStep3({ ...dataStep3, risikoKonflikAplikasi: selectedApps });
              }}
              chakraStyles={{
                control: (provided: any) => ({
                  ...provided,
                  bg: isDark ? "gray.700" : "white",
                  borderColor: isDark ? "gray.600" : "gray.200",
                  rounded: "lg",
                  minH: "38px",
                }),
                multiValue: (provided: any) => ({
                  ...provided,
                  bg: isDark ? "blue.900" : "blue.50",
                  color: isDark ? "blue.200" : "blue.700",
                  border: "1px solid",
                  borderColor: isDark ? "blue.700" : "blue.200",
                  rounded: "md",
                }),
                multiValueLabel: (provided: any) => ({
                  ...provided,
                  color: isDark ? "blue.200" : "blue.700",
                  fontWeight: "semibold",
                  fontSize: "xs",
                }),
                multiValueRemove: (provided: any) => ({
                  ...provided,
                  color: isDark ? "blue.300" : "blue.600",
                  ":hover": {
                    bg: isDark ? "blue.800" : "blue.100",
                    color: "blue.500",
                  },
                }),
                menu: (provided: any) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
              menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Pilih dari daftar rekomendasi sistem atau ketik nama aplikasi lain lalu tekan <b>Enter</b> untuk menambahkan tag.
            </Text>
          </FormControl>
        </RadioAdaTidak>

        <RadioYaTidak
          label="Instalasi Area DRC"
          name="instalasiAreaDrc"
          value={dataStep3.instalasiAreaDrc}
          onChange={(val) => onChangeStep3({ ...dataStep3, instalasiAreaDrc: val as any })}
          isRequired
        />

        <RadioAdaTidakSimple
          label="Ceklist Migrasi (SW) & Rundown"
          name="ceklistMigrasi"
          value={dataStep3.ceklistMigrasi}
          onChange={(val) => onChangeStep3({ ...dataStep3, ceklistMigrasi: val as any })}
          fileAttachment={dataStep3.ceklistMigrasiFile}
          onFileChange={(file) => onChangeStep3({ ...dataStep3, ceklistMigrasiFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "ceklistMigrasiFile",
              label: "Ceklist Migrasi (SW) & Rundown",
              category: "Manual & Runbook",
            })
          }
          isRequired
          // showChildren={dataStep3.ceklistMigrasi === "ADA"}
        >
          {/* <FormControl isRequired pt={1}>
            <FormLabel fontSize="xs" color="gray.500" mb={1}>
              Detail Ceklist dan Rundown Migrasi
            </FormLabel>
            <Textarea
              placeholder="Tuliskan detail urutan langkah dan rundown migrasi..."
              rows={4}
              value={dataStep3.ceklistMigrasiRundown}
              onChange={(e) => onChangeStep3({ ...dataStep3, ceklistMigrasiRundown: e.target.value })}
            />
          </FormControl> */}
        </RadioAdaTidakSimple>
      </InputGroupPanel>

      {/* ─── Kesiapan Teknis & Compliance ─── */}
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        {/* Header Action: Tarik Dokumen dari Project Sebelumnya */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={3}
          pb={3}
          borderBottom="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
          mb={2}
        >
          <VStack align="start" spacing={0.5}>
            <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"} fontWeight="medium">
              Lengkapi data kepatuhan teknis atau pilih dokumen dari repositori proyek terkait:
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} rounded="md">
                Proyek: {projectContextLabel}
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
          </VStack>

          {/* <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<FiDownloadCloud />}
            onClick={onOpen}
            rounded="lg"
            fontWeight="medium"
          >
            Ambil File dari Project Sebelumnya
          </Button> */}
        </Flex>

        {/* 1. SAST */}
        <RadioAdaTidakSimple
          label="SAST"
          name="sast"
          value={dataStep4.sast}
          onChange={(val) => onChangeStep4({ ...dataStep4, sast: val as any })}
          fileAttachment={dataStep4.sastFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, sastFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "sastFile",
              label: "SAST",
              category: "Security & SAST",
            })
          }
          isRequired
        />

        {/* 2. Dokumen Arsitektur */}
        <RadioAdaTidakSimple
          label="Dokumen Arsitektur"
          name="dokumenArsitektur"
          value={dataStep4.dokumenArsitektur}
          onChange={(val) => onChangeStep4({ ...dataStep4, dokumenArsitektur: val as any })}
          fileAttachment={dataStep4.dokumenArsitekturFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, dokumenArsitekturFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "dokumenArsitekturFile",
              label: "Dokumen Arsitektur",
              category: "Arsitektur",
            })
          }
          isRequired
          showChildren={dataStep4.dokumenArsitektur === "ADA"}
        >
          <VStack spacing={2} align="stretch" pt={1}>
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                Link Dokumen Arsitektur (opsional)
              </FormLabel>
              <Input
                size="sm"
                rounded="md"
                type="url"
                placeholder="https://drive.google.com/... atau tautan dokumen arsitektur"
                value={dataStep4.dokumenArsitekturLink || ""}
                onChange={(e) => onChangeStep4({ ...dataStep4, dokumenArsitekturLink: e.target.value })}
              />
            </FormControl>
          </VStack>
        </RadioAdaTidakSimple>

        {/* 3. Kesiapan Infrastruktur */}
        <RadioYaTidak
          label="Kesiapan Infrastruktur"
          name="kesiapanInfrastruktur"
          value={dataStep4.kesiapanInfrastruktur}
          onChange={(val) => onChangeStep4({ ...dataStep4, kesiapanInfrastruktur: val as any })}
          fileAttachment={dataStep4.kesiapanInfrastrukturFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, kesiapanInfrastrukturFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "kesiapanInfrastrukturFile",
              label: "Kesiapan Infrastruktur",
              category: "Arsitektur",
            })
          }
          isRequired
        />

        {/* 4. Source Aplikasi */}
        <RadioAdaTidakSimple
          label="Source Aplikasi"
          name="sourceAplikasi"
          value={dataStep4.sourceAplikasi}
          onChange={(val) => onChangeStep4({ ...dataStep4, sourceAplikasi: val as any })}
          fileAttachment={dataStep4.sourceAplikasiFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, sourceAplikasiFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "sourceAplikasiFile",
              label: "Source Aplikasi",
              category: "Manual & Runbook",
            })
          }
          isRequired
        />

        {/* 5. User Matriks */}
        <RadioAdaTidakSimple
          label="User Matriks"
          name="userMatriks"
          value={dataStep4.userMatriks}
          onChange={(val) => onChangeStep4({ ...dataStep4, userMatriks: val as any })}
          fileAttachment={dataStep4.userMatriksFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, userMatriksFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "userMatriksFile",
              label: "User Matriks",
              category: "Security & SAST",
            })
          }
          isRequired
        />

        {/* 6. Rollback / Fallback Plan */}
        <RadioAdaTidak
          label="Rollback / Fallback Plan"
          name="rollbackPlan"
          value={dataStep4.rollbackPlan}
          onChange={(val) => onChangeStep4({ ...dataStep4, rollbackPlan: val as any })}
          fileAttachment={dataStep4.rollbackPlanFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, rollbackPlanFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "rollbackPlanFile",
              label: "Rollback / Fallback Plan",
              category: "Manual & Runbook",
            })
          }
          isRequired
        />

        {/* 7. Tools / Cara Monitoring */}
        <RadioAdaTidak
          label="Tools / Cara Monitoring"
          name="toolsMonitoring"
          value={dataStep4.toolsMonitoring}
          onChange={(val) => onChangeStep4({ ...dataStep4, toolsMonitoring: val as any })}
          fileAttachment={dataStep4.toolsMonitoringFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, toolsMonitoringFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "toolsMonitoringFile",
              label: "Tools / Cara Monitoring",
              category: "Manual & Runbook",
            })
          }
          isRequired
        />

        {/* 8. Security Checklist */}
        <RadioAdaTidak
          label="Security Checklist"
          name="securityChecklist"
          value={dataStep4.securityChecklist}
          onChange={(val) => onChangeStep4({ ...dataStep4, securityChecklist: val as any })}
          fileAttachment={dataStep4.securityChecklistFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, securityChecklistFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "securityChecklistFile",
              label: "Security Checklist",
              category: "Security & SAST",
            })
          }
          isRequired
        />

        {/* 9. Persetujuan Divisi IT Security */}
        <RadioYaTidak
          label="Persetujuan Divisi IT Security"
          name="persetujuanItSecurity"
          value={dataStep4.persetujuanItSecurity}
          onChange={(val) => onChangeStep4({ ...dataStep4, persetujuanItSecurity: val as any })}
          fileAttachment={dataStep4.persetujuanItSecurityFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, persetujuanItSecurityFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "persetujuanItSecurityFile",
              label: "Persetujuan Divisi IT Security",
              category: "Security & SAST",
            })
          }
          isRequired
          showChildren={dataStep4.persetujuanItSecurity === "TIDAK"}
        >
          <FormControl isRequired pt={1}>
            <FormLabel fontSize="xs" color="gray.500" mb={1}>
              Alasan Tidak Ada Persetujuan
            </FormLabel>
            <Textarea
              size="sm"
              rounded="md"
              placeholder="Tuliskan alasan persetujuan IT Security belum ada..."
              rows={2}
              value={dataStep4.persetujuanItSecurityAlasan || ""}
              onChange={(e) => onChangeStep4({ ...dataStep4, persetujuanItSecurityAlasan: e.target.value })}
            />
          </FormControl>
        </RadioYaTidak>

        {/* 10. Petunjuk Teknis */}
        <RadioAdaTidak
          label="Petunjuk Teknis"
          name="petunjukTeknis"
          value={dataStep4.petunjukTeknis}
          onChange={(val) => onChangeStep4({ ...dataStep4, petunjukTeknis: val as any })}
          fileAttachment={dataStep4.petunjukTeknisFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, petunjukTeknisFile: file })}
          onOpenProjectFilesModal={() =>
            setActiveFieldTarget({
              fieldKey: "petunjukTeknisFile",
              label: "Petunjuk Teknis",
              category: "Manual & Runbook",
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

export default SoftwareStep3;
