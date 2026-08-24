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
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FiCheckCircle, FiDownloadCloud, FiFileText } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import { CabSoftwareStep3, CabSoftwareStep4 } from "@/app/types/cabTypes";
import RadioGroupField, { RadioAdaTidak, RadioAdaTidakSimple, RadioYaTidak } from "../RadioGroupField";
import { CreatableSelect } from "chakra-react-select";

interface SoftwareStep3Props {
  dataStep3: CabSoftwareStep3;
  dataStep4: CabSoftwareStep4;
  onChangeStep3: (data: CabSoftwareStep3) => void;
  onChangeStep4: (data: CabSoftwareStep4) => void;
}

interface ProjectDocItem {
  id: string;
  targetField: keyof CabSoftwareStep4;
  label: string;
  fileName: string;
  fileSize: string;
  sourceProject: string;
  positiveVal: "ADA" | "YA";
}

const AVAILABLE_PROJECT_DOCS: ProjectDocItem[] = [
  {
    id: "doc-sast",
    targetField: "sastFile",
    label: "SAST",
    fileName: "SAST_SonarQube_Security_Report_Passed.pdf",
    fileSize: "1.4 MB",
    sourceProject: "Project BRD-2026-0812 (Core Banking)",
    positiveVal: "ADA",
  },
  {
    id: "doc-arsitektur",
    targetField: "dokumenArsitekturFile",
    label: "Dokumen Arsitektur",
    fileName: "High_Level_Architecture_Design_v2.2.pdf",
    fileSize: "3.8 MB",
    sourceProject: "Project BRD-2026-0812 (Core Banking)",
    positiveVal: "ADA",
  },
  {
    id: "doc-infrastruktur",
    targetField: "kesiapanInfrastrukturFile",
    label: "Kesiapan Infrastruktur",
    fileName: "Infrastructure_Readiness_Checklist_DRC.pdf",
    fileSize: "840 KB",
    sourceProject: "RFC Infra-DRC-2026-004",
    positiveVal: "YA",
  },
  {
    id: "doc-source",
    targetField: "sourceAplikasiFile",
    label: "Source Aplikasi",
    fileName: "Application_Source_Code_Hash_Verification.pdf",
    fileSize: "420 KB",
    sourceProject: "Gitlab Release Tag v2.4.0",
    positiveVal: "ADA",
  },
  {
    id: "doc-matriks",
    targetField: "userMatriksFile",
    label: "User Matriks",
    fileName: "User_Access_Matrix_Roles_Production.xlsx",
    fileSize: "260 KB",
    sourceProject: "Project BRD-2026-0812 (Core Banking)",
    positiveVal: "ADA",
  },
  {
    id: "doc-rollback",
    targetField: "rollbackPlanFile",
    label: "Rollback / Fallback Plan",
    fileName: "Disaster_Recovery_Rollback_Execution_Plan.docx",
    fileSize: "680 KB",
    sourceProject: "Project BRD-2026-0812 (Core Banking)",
    positiveVal: "ADA",
  },
  {
    id: "doc-monitoring",
    targetField: "toolsMonitoringFile",
    label: "Tools / Cara Monitoring",
    fileName: "Monitoring_APM_Grafana_Prometheus_Guide.pdf",
    fileSize: "1.1 MB",
    sourceProject: "Monitoring Standard Ops 2026",
    positiveVal: "ADA",
  },
  {
    id: "doc-security",
    targetField: "securityChecklistFile",
    label: "Security Checklist",
    fileName: "Security_Hardening_Checklist_Compliant.pdf",
    fileSize: "920 KB",
    sourceProject: "IT Security Baseline Assessment",
    positiveVal: "ADA",
  },
  {
    id: "doc-approval",
    targetField: "persetujuanItSecurityFile",
    label: "Persetujuan Divisi IT Security",
    fileName: "Approval_Memo_Divisi_IT_Security_Signed.pdf",
    fileSize: "510 KB",
    sourceProject: "IT Sec Ticket #SEC-2026-891",
    positiveVal: "YA",
  },
  {
    id: "doc-juknis",
    targetField: "petunjukTeknisFile",
    label: "Petunjuk Teknis",
    fileName: "Standard_Operating_Procedure_Juknis_Deployment.pdf",
    fileSize: "1.8 MB",
    sourceProject: "Standard Release Procedures v3",
    positiveVal: "ADA",
  },
];

const SoftwareStep3 = ({ dataStep3, dataStep4, onChangeStep3, onChangeStep4 }: SoftwareStep3Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    AVAILABLE_PROJECT_DOCS.map((d) => d.id)
  );

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.length === AVAILABLE_PROJECT_DOCS.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(AVAILABLE_PROJECT_DOCS.map((d) => d.id));
    }
  };

  const handleApplyImportedDocs = () => {
    const updatedStep4 = { ...dataStep4 };

    AVAILABLE_PROJECT_DOCS.forEach((doc) => {
      if (selectedDocIds.includes(doc.id)) {
        // Set positive value (ADA or YA)
        if (doc.targetField === "sastFile") {
          updatedStep4.sast = "ADA";
          updatedStep4.sastFile = doc.fileName;
        } else if (doc.targetField === "dokumenArsitekturFile") {
          updatedStep4.dokumenArsitektur = "ADA";
          updatedStep4.dokumenArsitekturFile = doc.fileName;
        } else if (doc.targetField === "kesiapanInfrastrukturFile") {
          updatedStep4.kesiapanInfrastruktur = "YA";
          updatedStep4.kesiapanInfrastrukturFile = doc.fileName;
        } else if (doc.targetField === "sourceAplikasiFile") {
          updatedStep4.sourceAplikasi = "ADA";
          updatedStep4.sourceAplikasiFile = doc.fileName;
        } else if (doc.targetField === "userMatriksFile") {
          updatedStep4.userMatriks = "ADA";
          updatedStep4.userMatriksFile = doc.fileName;
        } else if (doc.targetField === "rollbackPlanFile") {
          updatedStep4.rollbackPlan = "ADA";
          updatedStep4.rollbackPlanFile = doc.fileName;
        } else if (doc.targetField === "toolsMonitoringFile") {
          updatedStep4.toolsMonitoring = "ADA";
          updatedStep4.toolsMonitoringFile = doc.fileName;
        } else if (doc.targetField === "securityChecklistFile") {
          updatedStep4.securityChecklist = "ADA";
          updatedStep4.securityChecklistFile = doc.fileName;
        } else if (doc.targetField === "persetujuanItSecurityFile") {
          updatedStep4.persetujuanItSecurity = "YA";
          updatedStep4.persetujuanItSecurityFile = doc.fileName;
        } else if (doc.targetField === "petunjukTeknisFile") {
          updatedStep4.petunjukTeknis = "ADA";
          updatedStep4.petunjukTeknisFile = doc.fileName;
        }
      }
    });

    onChangeStep4(updatedStep4);
    onClose();

    toast({
      title: "Dokumen Berhasil Ditarik",
      description: `${selectedDocIds.length} berkas dari project terkait berhasil dilampirkan ke formulir.`,
      status: "success",
      duration: 3500,
      isClosable: true,
      position: "top-right",
    });
  };

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
            <Text fontSize="2xs" color="gray.500" mt={1}>
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
          isRequired
          showChildren={dataStep3.ceklistMigrasi === "ADA"}
        >
          <FormControl isRequired pt={1}>
            <FormLabel fontSize="xs" color="gray.500" mb={1}>
              Detail Ceklist dan Rundown Migrasi
            </FormLabel>
            <Textarea
              placeholder="Tuliskan detail urutan langkah dan rundown migrasi..."
              rows={4}
              value={dataStep3.ceklistMigrasiRundown}
              onChange={(e) => onChangeStep3({ ...dataStep3, ceklistMigrasiRundown: e.target.value })}
            />
          </FormControl>
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
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
            Lengkapi data kepatuhan teknis dan lampirkan dokumen pendukung untuk setiap butir persyaratan.
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<FiDownloadCloud />}
            onClick={onOpen}
            rounded="lg"
            fontWeight="medium"
          >
            Ambil File dari Project Sebelumnya
          </Button>
        </Flex>

        {/* 1. SAST */}
        <RadioAdaTidakSimple
          label="SAST"
          name="sast"
          value={dataStep4.sast}
          onChange={(val) => onChangeStep4({ ...dataStep4, sast: val as any })}
          fileAttachment={dataStep4.sastFile}
          onFileChange={(file) => onChangeStep4({ ...dataStep4, sastFile: file })}
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
          isRequired
        />
      </InputGroupPanel>

      {/* ─── Modal Tarik Dokumen dari Project Sebelumnya ─── */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="xl" bg={isDark ? "gray.800" : "white"}>
          <ModalHeader pb={2}>
            <HStack spacing={2.5}>
              <Icon as={FiDownloadCloud} color="blue.500" fontSize="lg" />
              <Text fontSize="md" fontWeight="bold">
                Tarik Dokumen dari Project Sebelumnya
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
              Pilih dokumen arsitektur, SAST, dan kepatuhan dari berkas project sebelumnya untuk dilampirkan otomatis ke formulir CAB.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />

          <ModalBody py={4}>
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                Dokumen Tersedia ({AVAILABLE_PROJECT_DOCS.length} Berkas)
              </Text>
              <Button size="xs" variant="ghost" colorScheme="blue" onClick={toggleSelectAll}>
                {selectedDocIds.length === AVAILABLE_PROJECT_DOCS.length ? "Hapus Semua Pilihan" : "Pilih Semua"}
              </Button>
            </Flex>

            <Box border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} rounded="lg" overflow="hidden">
              <Table size="sm" variant="simple">
                <Thead bg={isDark ? "gray.750" : "gray.50"}>
                  <Tr>
                    <Th w="40px">
                      <Checkbox
                        isChecked={selectedDocIds.length === AVAILABLE_PROJECT_DOCS.length}
                        isIndeterminate={selectedDocIds.length > 0 && selectedDocIds.length < AVAILABLE_PROJECT_DOCS.length}
                        onChange={toggleSelectAll}
                      />
                    </Th>
                    <Th fontSize="2xs">Item Kepatuhan</Th>
                    <Th fontSize="2xs">Nama Dokumen</Th>
                    <Th fontSize="2xs">Sumber Project</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {AVAILABLE_PROJECT_DOCS.map((doc) => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <Tr
                        key={doc.id}
                        _hover={{ bg: isDark ? "gray.700" : "blue.50" }}
                        cursor="pointer"
                        onClick={() => toggleSelectDoc(doc.id)}
                        bg={isChecked ? (isDark ? "blue.950" : "blue.50") : undefined}
                      >
                        <Td onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            isChecked={isChecked}
                            onChange={() => toggleSelectDoc(doc.id)}
                          />
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle" fontSize="2xs" rounded="md">
                            {doc.label}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1.5}>
                            <Icon as={FiFileText} color="blue.500" fontSize="xs" />
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" isTruncated maxW="200px">
                                {doc.fileName}
                              </Text>
                              <Text fontSize="2xs" color="gray.500">
                                {doc.fileSize}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td fontSize="2xs" color="gray.500">
                          {doc.sourceProject}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={onClose}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiCheckCircle />}
                isDisabled={selectedDocIds.length === 0}
                onClick={handleApplyImportedDocs}
              >
                Terapkan Dokumen ({selectedDocIds.length})
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default SoftwareStep3;
