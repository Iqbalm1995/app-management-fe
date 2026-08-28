"use client";

import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  VStack,
} from "@chakra-ui/react";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { CabHardwareStep2 } from "@/app/types/cabTypes";
import { RadioYaTidak } from "../RadioGroupField";

interface HardwareStep2Props {
  data: CabHardwareStep2;
  onChange: (data: CabHardwareStep2) => void;
}

const HardwareStep2 = ({ data, onChange }: HardwareStep2Props) => {
  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Jadwal & Kesepakatan Implementasi">
        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan Implementasi</FormLabel>
            <Stack spacing={0}>
              <Input type="datetime-local" value={data.tanggalPermohonanImplementasi} onChange={(e) => onChange({ ...data, tanggalPermohonanImplementasi: e.target.value })} />
            </Stack>
          </InputLayout>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Ketersediaan Waktu Migrasi Data</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Jelaskan ketersediaan waktu..." rows={2} value={data.ketersediaanWaktuMigrasiData} onChange={(e) => onChange({ ...data, ketersediaanWaktuMigrasiData: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <RadioYaTidak
          label="Keputusan Migrasi"
          name="keputusanMigrasi"
          value={data.keputusanMigrasi}
          onChange={(val) => onChange({ ...data, keputusanMigrasi: val as any })}
          isRequired
        />

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Kesepakatan Waktu Pelaksanaan</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Jelaskan kesepakatan waktu..." rows={2} value={data.kesepakatanWaktuPelaksanaan} onChange={(e) => onChange({ ...data, kesepakatanWaktuPelaksanaan: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>
    </VStack>
  );
};

export default HardwareStep2;
