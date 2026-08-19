"use client";

import {
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { CabSoftwareStep2 } from "@/app/types/cabTypes";
import RadioGroupField from "../RadioGroupField";

interface SoftwareStep2Props {
  data: CabSoftwareStep2;
  onChange: (data: CabSoftwareStep2) => void;
}

const SoftwareStep2 = ({ data, onChange }: SoftwareStep2Props) => {
  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Hasil UAT">
        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Hasil UAT</FormLabel>
            <Stack spacing={0}>
              <CheckboxGroup
                value={data.hasilUat}
                onChange={(vals) => onChange({ ...data, hasilUat: vals as any[] })}
              >
                <Flex w="full" as={HStack} spacing={8}>
                  <Checkbox value="BERHASIL_BAIK">Berhasil Baik</Checkbox>
                  <Checkbox value="BERHASIL_CATATAN">Berhasil (dengan catatan)</Checkbox>
                  <Checkbox value="TIDAK_BERHASIL">Tidak Berhasil</Checkbox>
                </Flex>
              </CheckboxGroup>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <RadioGroupField
          label="Rekomendasi UAT"
          name="rekomendasiUat"
          value={data.rekomendasiUat}
          onChange={(val) => onChange({ ...data, rekomendasiUat: val as any })}
          options={[
            { label: "Rekomendasi Migrasi", value: "REKOMENDASI_MIGRASI" },
            { label: "Pengujian Ulang", value: "PENGUJIAN_ULANG" },
          ]}
          isRequired
          showChildren={data.rekomendasiUat === "REKOMENDASI_MIGRASI"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Tanggal Permohonan Migrasi</FormLabel>
            <Input type="datetime-local" value={data.tanggalPermohonanMigrasi || ""} onChange={(e) => onChange({ ...data, tanggalPermohonanMigrasi: e.target.value })} />
          </FormControl>
        </RadioGroupField>
      </InputGroupPanel>
    </VStack>
  );
};

export default SoftwareStep2;
