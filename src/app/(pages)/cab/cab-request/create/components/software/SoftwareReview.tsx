"use client";

import {
  Badge,
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
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
      {/* Identitas Permohonan CAB */}
      <InputGroupPanel headerTitle="Informasi Permohonan CAB">
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan</FormLabel>
            <Stack spacing={0}>
              <Text fontWeight={600}>
                {step1.requestedCabDate
                  ? new Date(step1.requestedCabDate).toLocaleString("id-ID")
                  : step1.dayDate || "N/A"}
              </Text>
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kode ITSP (General)</FormLabel>
            <Stack spacing={0}><Text>{step1.itspKode || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tipe CAB</FormLabel>
            <Stack spacing={0}>
              <Badge colorScheme="purple" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="xs">
                {step1.tipeCab || "N/A"}
              </Badge>
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kategori Aplikasi</FormLabel>
            <Stack spacing={0}>
              <Badge colorScheme="blue" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="xs">
                {step1.aplikasiKategori || "N/A"}
              </Badge>
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Sisi Aplikasi</FormLabel>
            <Stack spacing={0}>
              <Badge colorScheme="teal" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="xs">
                {step1.appSide === "OTHER"
                  ? `OTHER: ${step1.appSideOther || "-"}`
                  : step1.appSide || "N/A"}
              </Badge>
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Jenis CAB</FormLabel>
            <Stack spacing={0}><Badge colorScheme={step1.jenisCab === "EMERGENCY" ? "red" : "blue"} variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="xs">{step1.jenisCab || "N/A"}</Badge></Stack>
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

      {/* Standalone: Daftar Aplikasi & Proyek Terkait */}
      <InputGroupPanel headerTitle="Daftar Aplikasi & Proyek Terkait">
        <VStack spacing={3} align="stretch" w="full">
          {(() => {
            const appsList =
              step1.applications && step1.applications.length > 0
                ? step1.applications.filter((a) => a.applicationName || a.applicationId)
                : step1.applicationName
                ? [
                    {
                      applicationId: step1.applicationId,
                      applicationName: step1.applicationName,
                      aplikasiKategori: step1.aplikasiKategori,
                      rfcKodeProject: step1.rfcKodeProject,
                      itspKode: step1.itspKode,
                    },
                  ]
                : [];

            if (appsList.length === 0) {
              return (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  Belum ada aplikasi yang dipilih.
                </Text>
              );
            }

            return appsList.map((app, idx) => {
              const isMainApp = idx === 0;
              return (
                <Box
                  key={idx}
                  p={3.5}
                  rounded="md"
                  border="1px solid"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  bg={colorMode === "dark" ? "gray.750" : "gray.50"}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={isMainApp ? "blue" : "gray"}
                        variant={isMainApp ? "solid" : "subtle"}
                        rounded="md"
                        px={2}
                        fontSize="2xs"
                        fontWeight="semibold"
                      >
                        {isMainApp ? "Aplikasi Utama" : `Aplikasi Terkait #${idx}`}
                      </Badge>
                      <Text fontSize="sm" fontWeight="bold">
                        {app.applicationName || "Aplikasi"}
                      </Text>
                    </HStack>
                    {app.aplikasiKategori && (
                      <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} py={0.5} fontSize="3xs" fontWeight="semibold">
                        {app.aplikasiKategori}
                      </Badge>
                    )}
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} fontSize="xs">
                    <HStack>
                      <Text color="gray.500">Project / RFC / BRD:</Text>
                      <Text fontWeight="medium">{app.rfcKodeProject || "-"}</Text>
                    </HStack>
                    {app.itspKode && (
                      <HStack>
                        <Text color="gray.500">Kode ITSP:</Text>
                        <Text fontWeight="medium">{app.itspKode}</Text>
                      </HStack>
                    )}
                  </SimpleGrid>
                </Box>
              );
            });
          })()}
        </VStack>
      </InputGroupPanel>

      {/* Hasil UAT */}
      <InputGroupPanel headerTitle="Hasil UAT">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Hasil UAT</FormLabel>
            <Stack spacing={0}>
              <Text>
                {(() => {
                  const val = Array.isArray(step2.hasilUat) ? step2.hasilUat[0] : (step2.hasilUat as any);
                  if (val === "BERHASIL_BAIK") return "Berhasil Baik";
                  if (val === "BERHASIL_CATATAN") return "Berhasil (dengan catatan)";
                  if (val === "TIDAK_BERHASIL") return "Tidak Berhasil";
                  return val || "N/A";
                })()}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
        {step2.hasilUatCatatan && (
          <FormControl>
            <InputLayoutFull>
              <FormLabel h="full" mt={2}>Catatan UAT</FormLabel>
              <Stack spacing={0}><Text whiteSpace="pre-wrap">{step2.hasilUatCatatan}</Text></Stack>
            </InputLayoutFull>
          </FormControl>
        )}
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rekomendasi</FormLabel>
            <Stack spacing={0}><Text>{step2.rekomendasiUat === "REKOMENDASI_MIGRASI" ? "Rekomendasi Migrasi" : step2.rekomendasiUat === "PENGUJIAN_ULANG" ? "Pengujian Ulang" : step2.rekomendasiUat || "N/A"}</Text></Stack>
          </InputLayout>
        </FormControl>
      </InputGroupPanel>

      {/* Informasi Umum / Memo Permohonan Migrasi */}
      {step2.rekomendasiUat === "REKOMENDASI_MIGRASI" && (
        <InputGroupPanel headerTitle="Informasi Umum (Memo Permohonan Migrasi)">
          <FormControl>
            <InputLayout>
              <FormLabel h="full" mt={2}>Status Memo</FormLabel>
              <Stack spacing={0}>
                <Badge colorScheme={step2.isHaveMemo === "N" ? "orange" : "green"} variant="subtle" w="fit-content" px={2} py={0.5} rounded="full">
                  {step2.isHaveMemo === "N" ? "Belum Memiliki Memo" : "Sudah Memiliki Memo"}
                </Badge>
              </Stack>
            </InputLayout>
          </FormControl>

          {step2.isHaveMemo === "N" ? (
            <>
              <FormControl>
                <InputLayoutFull>
                  <FormLabel h="full" mt={2}>Perihal Sementara</FormLabel>
                  <Stack spacing={0}><Text>{step2.perihalSementara || step2.memoPerihal || "-"}</Text></Stack>
                </InputLayoutFull>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Tanggal Permohonan Migrasi</FormLabel>
                  <Stack spacing={0}><Text fontWeight={600}>{step2.tanggalPermohonanMigrasi || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
            </>
          ) : (
            <>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Direktorat Pengirim</FormLabel>
                  <Stack spacing={0}><Text>{step2.memoDirektoratPengirim || "Direktorat IT & Operasional"}</Text></Stack>
                </InputLayout>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Divisi Pengirim</FormLabel>
                  <Stack spacing={0}><Text fontWeight={600}>{step2.memoDivisiPengirim || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Nomor Memo</FormLabel>
                  <Stack spacing={0}><Text fontWeight={600}>{step2.memoNomor || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
              <FormControl>
                <InputLayoutFull>
                  <FormLabel h="full" mt={2}>Perihal</FormLabel>
                  <Stack spacing={0}><Text>{step2.memoPerihal || "-"}</Text></Stack>
                </InputLayoutFull>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Tanggal Memo</FormLabel>
                  <Stack spacing={0}><Text>{step2.memoTanggal || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Tanggal Memo Diterima</FormLabel>
                  <Stack spacing={0}><Text>{step2.memoTanggalDiterima || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
              <FormControl>
                <InputLayoutFull>
                  <FormLabel h="full" mt={2}>Durasi Memo</FormLabel>
                  <Stack spacing={0}>
                    <Text fontWeight={600}>
                      {step2.memoTanggal && step2.memoTanggalDiterima
                        ? `${calculateDurationInDays(step2.memoTanggal, step2.memoTanggalDiterima)} Hari Kalendar`
                        : "-"}
                    </Text>
                  </Stack>
                </InputLayoutFull>
              </FormControl>
              <FormControl>
                <InputLayout>
                  <FormLabel h="full" mt={2}>Tanggal Permohonan Migrasi</FormLabel>
                  <Stack spacing={0}><Text fontWeight={600}>{step2.tanggalPermohonanMigrasi || "-"}</Text></Stack>
                </InputLayout>
              </FormControl>
            </>
          )}
        </InputGroupPanel>
      )}

      {/* Rencana Migrasi */}
      <InputGroupPanel headerTitle="Rencana Migrasi">
        <FormControl>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Ceklist Migrasi (SW) & Rundown</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step3.ceklistMigrasi || (step3.ceklistMigrasiRundown ? "ADA" : "TIDAK"))}</Text>
              {step3.ceklistMigrasiFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step3.ceklistMigrasiFile === "string" ? step3.ceklistMigrasiFile : step3.ceklistMigrasiFile.name}</Text>
                </HStack>
              )}
              {step3.ceklistMigrasiRundown && (
                <Text fontSize="xs" whiteSpace="pre-wrap" color="gray.600" mt={1}>
                  {step3.ceklistMigrasiRundown}
                </Text>
              )}
            </Stack>
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
            <Stack spacing={1.5}>
              <Text>{renderYesNo(step3.risikoKonflik)}</Text>
              {step3.risikoKonflik === "ADA" && step3.risikoKonflikAplikasi && step3.risikoKonflikAplikasi.length > 0 && (
                <Wrap spacing={1.5} pt={1}>
                  {step3.risikoKonflikAplikasi.map((app, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="sm" colorScheme="blue" variant="subtle" rounded="md">
                        <TagLabel fontSize="xs">{app}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </Stack>
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
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.sast)}</Text>
              {step4.sastFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.sastFile === "string" ? step4.sastFile : step4.sastFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Dokumen Arsitektur</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.dokumenArsitektur)}</Text>
              {step4.dokumenArsitekturFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.dokumenArsitekturFile === "string" ? step4.dokumenArsitekturFile : step4.dokumenArsitekturFile.name}</Text>
                </HStack>
              )}
              {step4.dokumenArsitekturLink && (
                <Text fontSize="xs" color="blue.500">{step4.dokumenArsitekturLink}</Text>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kesiapan Infrastruktur</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.kesiapanInfrastruktur)}</Text>
              {step4.kesiapanInfrastrukturFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.kesiapanInfrastrukturFile === "string" ? step4.kesiapanInfrastrukturFile : step4.kesiapanInfrastrukturFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Source Aplikasi</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.sourceAplikasi)}</Text>
              {step4.sourceAplikasiFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.sourceAplikasiFile === "string" ? step4.sourceAplikasiFile : step4.sourceAplikasiFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>User Matriks</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.userMatriks)}</Text>
              {step4.userMatriksFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.userMatriksFile === "string" ? step4.userMatriksFile : step4.userMatriksFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Rollback / Fallback Plan</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.rollbackPlan)}</Text>
              {step4.rollbackPlanFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.rollbackPlanFile === "string" ? step4.rollbackPlanFile : step4.rollbackPlanFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tools / Cara Monitoring</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.toolsMonitoring)}</Text>
              {step4.toolsMonitoringFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.toolsMonitoringFile === "string" ? step4.toolsMonitoringFile : step4.toolsMonitoringFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Security Checklist</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.securityChecklist)}</Text>
              {step4.securityChecklistFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.securityChecklistFile === "string" ? step4.securityChecklistFile : step4.securityChecklistFile.name}</Text>
                </HStack>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Persetujuan IT Security</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.persetujuanItSecurity)}</Text>
              {step4.persetujuanItSecurityFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.persetujuanItSecurityFile === "string" ? step4.persetujuanItSecurityFile : step4.persetujuanItSecurityFile.name}</Text>
                </HStack>
              )}
              {step4.persetujuanItSecurityAlasan && (
                <Text fontSize="xs" color="red.500">Alasan: {step4.persetujuanItSecurityAlasan}</Text>
              )}
            </Stack>
          </InputLayout>
        </FormControl>
        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Petunjuk Teknis</FormLabel>
            <Stack spacing={1}>
              <Text>{renderYesNo(step4.petunjukTeknis)}</Text>
              {step4.petunjukTeknisFile && (
                <HStack spacing={1.5} color="blue.500" fontSize="xs">
                  <Icon as={FiFileText} />
                  <Text fontWeight="medium">{typeof step4.petunjukTeknisFile === "string" ? step4.petunjukTeknisFile : step4.petunjukTeknisFile.name}</Text>
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
              PIC Migrasi ({Array.isArray(step5.picMigrasi) ? step5.picMigrasi.length : step5.picMigrasi ? 1 : 0})
            </FormLabel>
            <Stack spacing={2}>
              {Array.isArray(step5.picMigrasi) && step5.picMigrasi.length > 0 ? (
                <Wrap spacing={2}>
                  {step5.picMigrasi.map((pic, idx) => (
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
            <FormLabel h="full" mt={2}>Committee CAB ({step5.committeeCab.length})</FormLabel>
            <Stack spacing={2}>
              {step5.committeeCab.length > 0 ? (
                <Wrap spacing={2}>
                  {step5.committeeCab.map((m, idx) => (
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

export default SoftwareReview;
