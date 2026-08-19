"use client";

import {
  Badge,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import {
  CabSoftwareStep1,
  CabSoftwareStep2,
  CabSoftwareStep3,
  CabSoftwareStep4,
  CabSoftwareStep5,
} from "@/app/types/cabTypes";

interface SoftwareReviewProps {
  step1: CabSoftwareStep1;
  step2: CabSoftwareStep2;
  step3: CabSoftwareStep3;
  step4: CabSoftwareStep4;
  step5: CabSoftwareStep5;
}

const renderYesNo = (val: string) => val === "ADA" || val === "YA" ? "Ada" : val === "TIDAK" || val === "TIDAK_ADA" ? "Tidak Ada" : "N/A";

const SoftwareReview = ({ step1, step2, step3, step4, step5 }: SoftwareReviewProps) => {
  const { colorMode } = useColorMode();

  return (
    <Flex as={Stack} w="full" spacing={5}>
      {/* Identitas Request */}
      <InputGroupPanel headerTitle="Identitas Request">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal</FormLabel>
            <Stack spacing={0}><Text>{step1.dayDate || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Aplikasi</FormLabel>
            <Stack spacing={0}><Text fontWeight={600}>{step1.applicationName || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>RFC / Kode Project</FormLabel>
            <Stack spacing={0}><Text>{step1.rfcKodeProject || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>ITSP Kode</FormLabel>
            <Stack spacing={0}><Text>{step1.itspKode || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kategori Aplikasi</FormLabel>
            <Stack spacing={0}><Text>{step1.aplikasiKategori || "N/A"}</Text></Stack>
          </InputLayout>
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

      {/* Hasil UAT */}
      <InputGroupPanel headerTitle="Hasil UAT">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Hasil UAT</FormLabel>
            <Stack spacing={0}><Text>{step2.hasilUat.length > 0 ? step2.hasilUat.join(", ") : "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rekomendasi</FormLabel>
            <Stack spacing={0}><Text>{step2.rekomendasiUat || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        {step2.tanggalPermohonanMigrasi && (
          <FormControl>
            <InputLayout>
              <FormLabel h="full" mt={2}>Tgl Permohonan Migrasi</FormLabel>
              <Stack spacing={0}><Text>{step2.tanggalPermohonanMigrasi}</Text></Stack>
            </InputLayout>
          </FormControl>
        )}
      </InputGroupPanel>

      {/* Rencana Migrasi */}
      <InputGroupPanel headerTitle="Rencana Migrasi">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Ceklist Migrasi & Rundown</FormLabel>
            <Stack spacing={0}><Text whiteSpace="pre-wrap">{step3.ceklistMigrasiRundown || "N/A"}</Text></Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Downtime</FormLabel>
            <Stack spacing={0}><Text>{step3.downtime === "ADA" ? `Ada — ${step3.downtimeDurasi || "?"} Menit` : step3.downtime === "TIDAK" ? "Tidak" : "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Risiko Konflik</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.risikoKonflik)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Instalasi Area DRC</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step3.instalasiAreaDrc)}</Text></Stack>
          </InputLayout>
        </FormControl>
      </InputGroupPanel>

      {/* Kesiapan Teknis */}
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>SAST</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.sast)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Dokumen Arsitektur</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.dokumenArsitektur)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kesiapan Infrastruktur</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.kesiapanInfrastruktur)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Source Aplikasi</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.sourceAplikasi)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>User Matriks</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.userMatriks)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rollback / Fallback Plan</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.rollbackPlan)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tools / Cara Monitoring</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.toolsMonitoring)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Security Checklist</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.securityChecklist)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Persetujuan IT Security</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.persetujuanItSecurity)}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Petunjuk Teknis</FormLabel>
            <Stack spacing={0}><Text>{renderYesNo(step4.petunjukTeknis)}</Text></Stack>
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
                {step5.picMigrasi
                  ? step5.picMigrasi.type === "VENDOR"
                    ? `Vendor: ${step5.picMigrasi.namaVendor} (PIC: ${step5.picMigrasi.namaPicVendor})`
                    : step5.picMigrasi.type === "INTERNAL_IT"
                      ? `Internal IT: ${step5.picMigrasi.userName} — ${step5.picMigrasi.divisi}`
                      : `Internal BJB: ${step5.picMigrasi.userName} — ${step5.picMigrasi.asalDivisi}`
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Committee CAB ({step5.committeeCab.length})</FormLabel>
            <Stack spacing={2}>
              {step5.committeeCab.length > 0 ? (
                <Wrap spacing={2}>
                  {step5.committeeCab.map((m, idx) => (
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

export default SoftwareReview;
