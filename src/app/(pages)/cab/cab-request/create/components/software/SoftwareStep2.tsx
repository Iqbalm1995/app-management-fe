"use client";

import {
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Select as ChakraReactSelect } from "chakra-react-select";
import { AnimatePresence, motion } from "framer-motion";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { CabSoftwareStep2 } from "@/app/types/cabTypes";
import RadioGroupField from "../RadioGroupField";

interface SoftwareStep2Props {
  data: CabSoftwareStep2;
  onChange: (data: CabSoftwareStep2) => void;
}

const DIVISION_DIRECTORATE_MAP: Record<string, string> = {
  "Divisi Information Technology": "Direktorat IT & Operasional",
  "Divisi IT Digital Banking": "Direktorat IT & Operasional",
  "Divisi Digital Banking": "Direktorat Konsumer dan Ritel",
  "Divisi Komersial": "Direktorat Komersial & UMKM",
  "Divisi Operasional": "Direktorat Operasional",
  "Divisi Kepatuhan": "Direktorat Kepatuhan",
  "Divisi Manajemen Risiko": "Direktorat Manajemen Risiko",
  "Divisi Keuangan & Akuntansi": "Direktorat Keuangan",
  "Divisi Treasury": "Direktorat Keuangan",
};

const DIVISION_OPTIONS = Object.keys(DIVISION_DIRECTORATE_MAP).map((name) => ({
  label: name,
  value: name,
}));

const DIRECTORATE_OPTIONS = Array.from(
  new Set(Object.values(DIVISION_DIRECTORATE_MAP))
).map((name) => ({
  label: name,
  value: name,
}));

const SoftwareStep2 = ({ data, onChange }: SoftwareStep2Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const currentHasilUat = Array.isArray(data.hasilUat)
    ? data.hasilUat[0] || ""
    : (data.hasilUat as any) || "";

  const handleDivisionChange = (divisionName: string) => {
    const directorateName = DIVISION_DIRECTORATE_MAP[divisionName] || "Direktorat IT & Operasional";
    onChange({
      ...data,
      memoDivisiPengirim: divisionName,
      memoDirektoratPengirim: directorateName,
    });
  };

  const memoDuration =
    data.memoTanggal && data.memoTanggalDiterima
      ? calculateDurationInDays(data.memoTanggal, data.memoTanggalDiterima)
      : null;

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.700" : "white",
      borderColor: isDark ? "gray.600" : "gray.200",
      rounded: "lg",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* ─── Panel 1: Hasil UAT ─── */}
      <InputGroupPanel headerTitle="Hasil UAT">
        <RadioGroupField
          label="Hasil UAT"
          name="hasilUat"
          value={currentHasilUat}
          onChange={(val) =>
            onChange({
              ...data,
              hasilUat: val ? [val as any] : [],
            })
          }
          options={[
            { label: "Berhasil Baik", value: "BERHASIL_BAIK" },
            { label: "Berhasil (dengan catatan)", value: "BERHASIL_CATATAN" },
            // { label: "Tidak Berhasil", value: "TIDAK_BERHASIL" },
          ]}
          isRequired
          showChildren={currentHasilUat === "BERHASIL_CATATAN"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Catatan Hasil UAT</FormLabel>
            <Textarea
              placeholder="Tuliskan catatan hasil pengujian UAT..."
              size="sm"
              rounded="lg"
              rows={3}
              value={data.hasilUatCatatan || ""}
              onChange={(e) => onChange({ ...data, hasilUatCatatan: e.target.value })}
            />
          </FormControl>
        </RadioGroupField>

        <RadioGroupField
          label="Rekomendasi Hasil UAT"
          name="rekomendasiUat"
          value={data.rekomendasiUat}
          onChange={(val) => onChange({ ...data, rekomendasiUat: val as any })}
          options={[
            { label: "Rekomendasi Migrasi", value: "REKOMENDASI_MIGRASI" },
            // { label: "Pengujian Ulang", value: "PENGUJIAN_ULANG" },
          ]}
          isRequired
        />
      </InputGroupPanel>

      {/* ─── Panel 2: Informasi Umum (Memo Permohonan Migrasi) ─── */}
      {data.rekomendasiUat === "REKOMENDASI_MIGRASI" && (
        <InputGroupPanel headerTitle="Permohonan Migrasi">
          {/* Sudah Memiliki Memo Pengantar */}
          <FormControl isRequired>
            <InputLayout>
              <FormLabel h="full" mt={2}>
                Sudah Memiliki Memo Pengantar
              </FormLabel>
              <Stack spacing={0} h="full">
                <RadioGroup
                  onChange={(val) => {
                    onChange({
                      ...data,
                      isHaveMemo: val as "Y" | "N",
                    });
                  }}
                  value={data.isHaveMemo || ""}
                >
                  <Flex w="full" as={HStack} spacing={8}>
                    <Radio value="Y">Sudah</Radio>
                    <Radio value="N">Belum</Radio>
                  </Flex>
                </RadioGroup>
                <FormHelperText as="i" fontSize="xs" color="gray.500" mt={1}>
                  Jika belum memiliki Memo pengantar, ada beberapa informasi yang akan diinputkan lain waktu jika Memo pengantar sudah ada.*
                </FormHelperText>
              </Stack>
            </InputLayout>
          </FormControl>

          {/* Smooth Animated Container for Conditional Memo Sections */}
          <AnimatePresence mode="wait">
            {data.isHaveMemo === "N" && (
              <motion.div
                key="memo-belum"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <VStack spacing={4} align="stretch" pt={1}>
                  <Divider borderColor={isDark ? "gray.650" : "gray.200"} my={1} />
                  {/* Perihal Sementara */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Perihal Sementara*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Textarea
                          placeholder="Perihal Sementara"
                          maxLength={300}
                          rows={2}
                          value={data.perihalSementara || data.memoPerihal || ""}
                          onChange={(e) =>
                            onChange({
                              ...data,
                              perihalSementara: e.target.value.toUpperCase(),
                              memoPerihal: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  {/* Tanggal Permohonan Migrasi */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Tanggal Permohonan Migrasi*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Input
                          type="date"
                          value={data.tanggalPermohonanMigrasi || ""}
                          onChange={(e) =>
                            onChange({ ...data, tanggalPermohonanMigrasi: e.target.value })
                          }
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>
                </VStack>
              </motion.div>
            )}

            {data.isHaveMemo === "Y" && (
              <motion.div
                key="memo-sudah"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <VStack spacing={4} align="stretch" pt={1}>
                  <Divider borderColor={isDark ? "gray.650" : "gray.200"} my={1} />
                  {/* Divisi Pengirim with 2 Columns: Direktorat Pengirim & Divisi Pengirim */}
                  <FormControl isRequired>
                    <InputLayoutFull>
                      <FormLabel h="full" mt={2}>
                        Divisi Pengirim
                      </FormLabel>
                      <Stack spacing={0} w="full">
                        <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                          <GridItem colSpan={{ base: 2, md: 1 }} w="full">
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" color="gray.500">
                                Direktorat Pengirim*
                              </FormLabel>
                              <ChakraReactSelect
                                options={DIRECTORATE_OPTIONS}
                                isSearchable={true}
                                placeholder="Direktorat (Auto)"
                                value={
                                  data.memoDirektoratPengirim
                                    ? { label: data.memoDirektoratPengirim, value: data.memoDirektoratPengirim }
                                    : { label: "Direktorat IT & Operasional", value: "Direktorat IT & Operasional" }
                                }
                                isDisabled={true}
                                chakraStyles={{
                                  control: (provided: any) => ({
                                    ...provided,
                                    bg: isDark ? "gray.800" : "gray.100",
                                    borderColor: isDark ? "gray.600" : "gray.200",
                                    rounded: "lg",
                                  }),
                                }}
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem colSpan={{ base: 2, md: 1 }} w="full">
                            <FormControl isRequired>
                              <FormLabel fontSize="xs" color="gray.500">
                                Divisi Pengirim*
                              </FormLabel>
                              <ChakraReactSelect
                                options={DIVISION_OPTIONS}
                                isSearchable={true}
                                isClearable
                                placeholder="Pilih Divisi Pengirim"
                                value={
                                  data.memoDivisiPengirim
                                    ? { label: data.memoDivisiPengirim, value: data.memoDivisiPengirim }
                                    : null
                                }
                                onChange={(opt: any) => {
                                  if (opt) {
                                    handleDivisionChange(opt.value);
                                  } else {
                                    onChange({ ...data, memoDivisiPengirim: "", memoDirektoratPengirim: "" });
                                  }
                                }}
                                chakraStyles={selectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  {/* Nomor Memo */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Nomor Memo*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Input
                          placeholder="0000/XXX-XXX/X/YYYY"
                          value={data.memoNomor || ""}
                          onChange={(e) => onChange({ ...data, memoNomor: e.target.value.toUpperCase() })}
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  {/* Perihal */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Perihal*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Textarea
                          placeholder="Perihal"
                          maxLength={300}
                          rows={2}
                          value={data.memoPerihal || ""}
                          onChange={(e) => onChange({ ...data, memoPerihal: e.target.value.toUpperCase() })}
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  {/* Tanggal Memo */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Tanggal Memo*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Input
                          type="date"
                          value={data.memoTanggal || ""}
                          onChange={(e) => onChange({ ...data, memoTanggal: e.target.value })}
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  {/* Tanggal Memo Diterima */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Tanggal Memo Diterima*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Input
                          type="date"
                          value={data.memoTanggalDiterima || ""}
                          onChange={(e) => onChange({ ...data, memoTanggalDiterima: e.target.value })}
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  {/* Durasi Memo */}
                  <FormControl>
                    <InputLayoutFull>
                      <FormLabel h="full" mt={2}>
                        Durasi Memo
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Text px={2} fontWeight={600}>
                          {memoDuration !== null && memoDuration >= 0
                            ? `${memoDuration} Hari Kalendar`
                            : "-"}
                        </Text>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  {/* Tanggal Permohonan Migrasi */}
                  <FormControl isRequired>
                    <InputLayout>
                      <FormLabel h="full" mt={2}>
                        Tanggal Permohonan Migrasi*
                      </FormLabel>
                      <Stack spacing={0} h="full">
                        <Input
                          type="date"
                          value={data.tanggalPermohonanMigrasi || ""}
                          onChange={(e) => onChange({ ...data, tanggalPermohonanMigrasi: e.target.value })}
                        />
                      </Stack>
                    </InputLayout>
                  </FormControl>
                </VStack>
              </motion.div>
            )}
          </AnimatePresence>
        </InputGroupPanel>
      )}
    </VStack>
  );
};

export default SoftwareStep2;
