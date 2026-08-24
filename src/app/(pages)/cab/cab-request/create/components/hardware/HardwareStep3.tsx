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
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FiCheckCircle, FiDownloadCloud, FiFileText } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { CabHardwareStep3 } from "@/app/types/cabTypes";
import { RadioAdaTidak, RadioYaTidak } from "../RadioGroupField";

interface HardwareStep3Props {
  data: CabHardwareStep3;
  onChange: (data: CabHardwareStep3) => void;
}

interface HardwareProjectDocItem {
  id: string;
  targetField: keyof CabHardwareStep3;
  label: string;
  fileName: string;
  fileSize: string;
  sourceProject: string;
  positiveVal: "ADA" | "YA";
}

const AVAILABLE_HARDWARE_PROJECT_DOCS: HardwareProjectDocItem[] = [
  {
    id: "hdoc-checklist",
    targetField: "checklistFile",
    label: "Checklist",
    fileName: "Hardware_Deployment_PreChecklist_DC_v2.pdf",
    fileSize: "1.1 MB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "ADA",
  },
  {
    id: "hdoc-arsitektur",
    targetField: "dokumenArsitekturFile",
    label: "Dokumen Arsitektur",
    fileName: "Topology_Hardware_Network_Storage_v3.1.pdf",
    fileSize: "3.2 MB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "ADA",
  },
  {
    id: "hdoc-test",
    targetField: "testFungsionalFile",
    label: "Test Fungsional",
    fileName: "Hardware_Diagnostic_Functional_Test_Passed.xlsx",
    fileSize: "890 KB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "ADA",
  },
  {
    id: "hdoc-rollback",
    targetField: "rollbackPlanFile",
    label: "Rollback Plan",
    fileName: "Hardware_Fallback_HotSpare_SOP_v1.0.pdf",
    fileSize: "1.3 MB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "ADA",
  },
  {
    id: "hdoc-monitoring",
    targetField: "perangkatMonitoringFile",
    label: "Perangkat Monitoring",
    fileName: "Zabbix_Grafana_HW_Monitoring_Dashboard_Spec.pdf",
    fileSize: "750 KB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "YA",
  },
  {
    id: "hdoc-approval",
    targetField: "persetujuanItSecurityFile",
    label: "Persetujuan Divisi IT Security",
    fileName: "IT_Security_Hardening_Clearance_SignOff.pdf",
    fileSize: "620 KB",
    sourceProject: "Project HW-2026-0410 (Server Blade Upgrade)",
    positiveVal: "YA",
  },
];

const HardwareStep3 = ({ data, onChange }: HardwareStep3Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    AVAILABLE_HARDWARE_PROJECT_DOCS.map((d) => d.id)
  );

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === AVAILABLE_HARDWARE_PROJECT_DOCS.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(AVAILABLE_HARDWARE_PROJECT_DOCS.map((d) => d.id));
    }
  };

  const handleApplyDocs = () => {
    const updatedData = { ...data };

    AVAILABLE_HARDWARE_PROJECT_DOCS.forEach((doc) => {
      if (selectedDocIds.includes(doc.id)) {
        if (doc.targetField === "checklistFile") {
          updatedData.checklist = "ADA";
          updatedData.checklistFile = doc.fileName;
        } else if (doc.targetField === "dokumenArsitekturFile") {
          updatedData.dokumenArsitektur = "ADA";
          updatedData.dokumenArsitekturFile = doc.fileName;
        } else if (doc.targetField === "testFungsionalFile") {
          updatedData.testFungsional = "ADA";
          updatedData.testFungsionalFile = doc.fileName;
        } else if (doc.targetField === "rollbackPlanFile") {
          updatedData.rollbackPlan = "ADA";
          updatedData.rollbackPlanFile = doc.fileName;
        } else if (doc.targetField === "perangkatMonitoringFile") {
          updatedData.perangkatMonitoring = "YA";
          updatedData.perangkatMonitoringFile = doc.fileName;
          if (!updatedData.perangkatMonitoringDetail) {
            updatedData.perangkatMonitoringDetail = "Zabbix & Grafana HW Sensor Monitoring";
          }
        } else if (doc.targetField === "persetujuanItSecurityFile") {
          updatedData.persetujuanItSecurity = "YA";
          updatedData.persetujuanItSecurityFile = doc.fileName;
        }
      }
    });

    onChange(updatedData);
    onClose();

    toast({
      title: "Dokumen Berhasil Ditarik",
      description: `${selectedDocIds.length} berkas hardware dari project terkait berhasil dilampirkan ke formulir.`,
      status: "success",
      duration: 3500,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        {/* Header Action: Tarik Dokumen dari Project Sebelumnya */}
        <Flex
          justify="space-between"
          align="center"
          p={3}
          bg={isDark ? "blue.900" : "blue.50"}
          border="1px solid"
          borderColor={isDark ? "blue.700" : "blue.200"}
          rounded="lg"
          mb={2}
        >
          <HStack spacing={3}>
            <Icon as={FiDownloadCloud} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="bold" color={isDark ? "blue.200" : "blue.800"}>
                Kelengkapan Berkas Otomatis
              </Text>
              <Text fontSize="2xs" color={isDark ? "blue.300" : "blue.600"}>
                Tersedia 6 berkas teknis hardware dari project terkait yang siap dilampirkan.
              </Text>
            </VStack>
          </HStack>

          <Button
            size="xs"
            colorScheme="blue"
            variant="solid"
            leftIcon={<FiDownloadCloud />}
            onClick={onOpen}
          >
            Ambil File dari Project Sebelumnya
          </Button>
        </Flex>

        <RadioAdaTidak
          label="Checklist"
          name="checklist"
          value={data.checklist}
          onChange={(val) => onChange({ ...data, checklist: val as any })}
          fileAttachment={data.checklistFile}
          onFileChange={(file) => onChange({ ...data, checklistFile: file })}
          isRequired
        />

        <RadioAdaTidak
          label="Dokumen Arsitektur"
          name="dokumenArsitektur"
          value={data.dokumenArsitektur}
          onChange={(val) => onChange({ ...data, dokumenArsitektur: val as any })}
          fileAttachment={data.dokumenArsitekturFile}
          onFileChange={(file) => onChange({ ...data, dokumenArsitekturFile: file })}
          isRequired
        />

        <RadioAdaTidak
          label="Test Fungsional"
          name="testFungsional"
          value={data.testFungsional}
          onChange={(val) => onChange({ ...data, testFungsional: val as any })}
          fileAttachment={data.testFungsionalFile}
          onFileChange={(file) => onChange({ ...data, testFungsionalFile: file })}
          isRequired
        />

        <RadioAdaTidak
          label="Rollback Plan"
          name="rollbackPlan"
          value={data.rollbackPlan}
          onChange={(val) => onChange({ ...data, rollbackPlan: val as any })}
          fileAttachment={data.rollbackPlanFile}
          onFileChange={(file) => onChange({ ...data, rollbackPlanFile: file })}
          isRequired
        />

        <RadioYaTidak
          label="Perangkat Monitoring"
          name="perangkatMonitoring"
          value={data.perangkatMonitoring}
          onChange={(val) => onChange({ ...data, perangkatMonitoring: val as any })}
          fileAttachment={data.perangkatMonitoringFile}
          onFileChange={(file) => onChange({ ...data, perangkatMonitoringFile: file })}
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
          isRequired
        />
      </InputGroupPanel>

      {/* Modal Import Project Documents */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="xl" bg={isDark ? "gray.800" : "white"}>
          <ModalHeader pb={2}>
            <HStack spacing={2}>
              <Icon as={FiDownloadCloud} color="blue.500" />
              <Text fontSize="md" fontWeight="bold">
                Tarik Dokumen Hardware dari Project Sebelumnya
              </Text>
            </HStack>
            <Text fontSize="xs" fontWeight="normal" color="gray.500" mt={1}>
              Pilih dokumen kesiapan hardware yang ingin digunakan langsung pada formulir CAB ini.
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={2}>
            <Box
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              rounded="lg"
              overflow="hidden"
            >
              <Table size="sm" variant="simple">
                <Thead bg={isDark ? "gray.750" : "gray.50"}>
                  <Tr>
                    <Th w="40px" textAlign="center">
                      <Checkbox
                        isChecked={
                          selectedDocIds.length === AVAILABLE_HARDWARE_PROJECT_DOCS.length &&
                          AVAILABLE_HARDWARE_PROJECT_DOCS.length > 0
                        }
                        isIndeterminate={
                          selectedDocIds.length > 0 &&
                          selectedDocIds.length < AVAILABLE_HARDWARE_PROJECT_DOCS.length
                        }
                        onChange={handleSelectAll}
                        colorScheme="blue"
                      />
                    </Th>
                    <Th fontSize="2xs">Item Compliance</Th>
                    <Th fontSize="2xs">Nama Berkas</Th>
                    <Th fontSize="2xs">Asal Project</Th>
                    <Th fontSize="2xs" isNumeric>Ukuran</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {AVAILABLE_HARDWARE_PROJECT_DOCS.map((doc) => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <Tr
                        key={doc.id}
                        cursor="pointer"
                        _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                        onClick={() => handleToggleDoc(doc.id)}
                      >
                        <Td textAlign="center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            isChecked={isChecked}
                            onChange={() => handleToggleDoc(doc.id)}
                            colorScheme="blue"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={1.5}>
                            <Badge
                              colorScheme={doc.positiveVal === "ADA" ? "blue" : "teal"}
                              variant="subtle"
                              fontSize="2xs"
                              rounded="md"
                            >
                              {doc.positiveVal}
                            </Badge>
                            <Text fontSize="xs" fontWeight="semibold">
                              {doc.label}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={1.5}>
                            <Icon as={FiFileText} color="blue.500" />
                            <Text fontSize="xs" color={isDark ? "gray.200" : "gray.800"} noOfLines={1}>
                              {doc.fileName}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="2xs" color="gray.500">
                            {doc.sourceProject}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="2xs" color="gray.400">
                            {doc.fileSize}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>

          <ModalFooter pt={2} pb={4} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <Flex justify="space-between" align="center" w="full">
              <Text fontSize="xs" color="gray.500">
                {selectedDocIds.length} dari {AVAILABLE_HARDWARE_PROJECT_DOCS.length} dokumen terpilih
              </Text>
              <HStack spacing={2}>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FiCheckCircle />}
                  onClick={handleApplyDocs}
                  isDisabled={selectedDocIds.length === 0}
                >
                  Terapkan Dokumen ({selectedDocIds.length})
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default HardwareStep3;
