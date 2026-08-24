"use client";

import {
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorMode,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import {
  CabHardwareStep1,
  CabHardwareStep2,
  CabHardwareStep3,
  CabHardwareStep4,
} from "@/app/types/cabTypes";

interface HardwareReviewProps {
  step1: CabHardwareStep1;
  step2: CabHardwareStep2;
  step3: CabHardwareStep3;
  step4: CabHardwareStep4;
}

const renderYesNo = (val: string) => val === "ADA" || val === "YA" ? "Ada" : val === "TIDAK" || val === "TIDAK_ADA" ? "Tidak Ada" : "N/A";

const HardwareReview = ({ step1, step2, step3, step4 }: HardwareReviewProps) => {
  const { colorMode } = useColorMode();

  return (
    <Flex as={Stack} w="full" spacing={5}>
      {/* Identitas Request */}
      <InputGroupPanel headerTitle="Identitas Request Hardware">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal</FormLabel>
            <Stack spacing={0}><Text>{step1.dayDate || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tipe Kode Project</FormLabel>
            <Stack spacing={0}><Text>{step1.kodeProjectType || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kode Project</FormLabel>
            <Stack spacing={0}><Text fontWeight={600}>{step1.kodeProject || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Nama Hardware</FormLabel>
            <Stack spacing={0}><Text fontWeight={600}>{step1.namaHardware || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Deskripsi Perubahan</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step1.deskripsiPerubahan || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dampak Operasional</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step1.dampakOperasional || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dasar Upgrade</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step1.dasarUpgrade || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Jenis CAB</FormLabel>
            <Stack spacing={0}><Text fontWeight={600}>{step1.jenisCab || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        {step1.jenisCab === "EMERGENCY" && (
          <FormControl>
            <InputLayoutFull>
              <FormLabel h="full" mt={2}>Alasan Emergency</FormLabel>
              <Stack spacing={0}><Text>{step1.jenisCabEmergencyAlasan || "N/A"}</Text></Stack>
            </InputLayoutFull>
          </FormControl>
        )}
      </InputGroupPanel>

      {/* Jadwal Implementasi */}
      <InputGroupPanel headerTitle="Jadwal & Kesepakatan Implementasi">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tgl Permohonan Implementasi</FormLabel>
            <Stack spacing={0}><Text>{step2.tanggalPermohonanImplementasi || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Ketersediaan Waktu Migrasi</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step2.ketersediaanWaktuMigrasiData || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Keputusan Migrasi</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step2.keputusanMigrasi)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Kesepakatan Waktu Pelaksanaan</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step2.kesepakatanWaktuPelaksanaan || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>

      {/* Kesiapan Teknis */}
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Checklist</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.checklist)}</Text>
              {step3.checklistFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.checklistFile === "string" ? step3.checklistFile : step3.checklistFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Dokumen Arsitektur</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.dokumenArsitektur)}</Text>
              {step3.dokumenArsitekturFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.dokumenArsitekturFile === "string" ? step3.dokumenArsitekturFile : step3.dokumenArsitekturFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Test Fungsional</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.testFungsional)}</Text>
              {step3.testFungsionalFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.testFungsionalFile === "string" ? step3.testFungsionalFile : step3.testFungsionalFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rollback Plan</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.rollbackPlan)}</Text>
              {step3.rollbackPlanFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.rollbackPlanFile === "string" ? step3.rollbackPlanFile : step3.rollbackPlanFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Perangkat Monitoring</FormLabel>
            <Stack spacing={1}>
              <Text>{step3.perangkatMonitoring === "YA" ? `Ada — ${step3.perangkatMonitoringDetail || ""}` : renderYesNo(step3.perangkatMonitoring)}</Text>
              {step3.perangkatMonitoringFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.perangkatMonitoringFile === "string" ? step3.perangkatMonitoringFile : step3.perangkatMonitoringFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Persetujuan IT Security</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.persetujuanItSecurity)}</Text>
              {step3.persetujuanItSecurityFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.persetujuanItSecurityFile === "string" ? step3.persetujuanItSecurityFile : step3.persetujuanItSecurityFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
      </InputGroupPanel>

      {/* PIC & Komite */}
      <InputGroupPanel headerTitle="PIC & Komite">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>
              PIC Migrasi ({Array.isArray(step4.picMigrasi) ? step4.picMigrasi.length : step4.picMigrasi ? 1 : 0})
            </FormLabel>
            <Stack spacing={2}>
              {Array.isArray(step4.picMigrasi) && step4.picMigrasi.length > 0 ? (
                <Wrap spacing={2}>
                  {step4.picMigrasi.map((pic, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="md" rounded="full" colorScheme="blue" variant="subtle">
                        <TagLabel fontSize="xs">
                          {pic.userName} {pic.divisi ? `(${pic.divisi})` : ""}
                        </TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text color="gray.400">Belum ada PIC yang dipilih</Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Committee CAB ({step4.committeeCab.length})</FormLabel>
            <Stack spacing={2}>
              {step4.committeeCab.length > 0 ? (
                <Wrap spacing={2}>
                  {step4.committeeCab.map((m, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="md" rounded="full" colorScheme={m.type === "INTERNAL_IT" ? "blue" : m.type === "INTERNAL_BJB" ? "green" : "purple"} variant="subtle">
                        <TagLabel fontSize="xs">{m.userName}{m.type === "EXTERNAL" ? (m.asalInstitusi ? ` (${m.asalInstitusi})` : "") : (m.asalDivisi ? ` (${m.asalDivisi})` : "")}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text color="gray.400">Belum ada anggota</Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>
    </Flex>
  );
};

export default HardwareReview;
