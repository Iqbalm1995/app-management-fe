"use client";

import {
  Flex,
  FormControl,
  FormLabel,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorMode,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

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
            <Stack spacing={0}><Text>{renderYesNo(step3.checklist)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Dokumen Arsitektur</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.dokumenArsitektur)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Test Fungsional</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.testFungsional)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rollback Plan</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.rollbackPlan)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Perangkat Monitoring</FormLabel>
            <Stack spacing={0}><Text>{step3.perangkatMonitoring === "YA" ? `Ada — ${step3.perangkatMonitoringDetail || ""}` : renderYesNo(step3.perangkatMonitoring)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Persetujuan IT Security</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.persetujuanItSecurity)}</Text></Stack>
          </InputLayout>
        </FormControl>
      </InputGroupPanel>

      {/* PIC & Komite */}
      <InputGroupPanel headerTitle="PIC & Komite">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>PIC Migrasi</FormLabel>
            <Stack spacing={0}>
              <Text fontWeight={600}>
                {step4.picMigrasi
                  ? step4.picMigrasi.type === "VENDOR"
                    ? `Vendor: ${step4.picMigrasi.namaVendor} (PIC: ${step4.picMigrasi.namaPicVendor})`
                    : step4.picMigrasi.type === "INTERNAL_IT"
                      ? `Internal IT: ${step4.picMigrasi.userName} — ${step4.picMigrasi.divisi}`
                      : `Internal BJB: ${step4.picMigrasi.userName} — ${step4.picMigrasi.asalDivisi}`
                  : "N/A"}
              </Text>
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
                        <TagLabel fontSize="xs">{m.userName}{m.asalDivisi ? ` (${m.asalDivisi})` : ""}</TagLabel>
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
