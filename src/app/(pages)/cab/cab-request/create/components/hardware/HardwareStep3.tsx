"use client";

import {
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";

import { InputGroupPanel } from "@/app/components/customPanels";
import { CabHardwareStep3 } from "@/app/types/cabTypes";
import { RadioAdaTidak, RadioYaTidak } from "../RadioGroupField";

interface HardwareStep3Props {
  data: CabHardwareStep3;
  onChange: (data: CabHardwareStep3) => void;
}

const HardwareStep3 = ({ data, onChange }: HardwareStep3Props) => {
  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        <RadioAdaTidak label="Checklist" name="checklist" value={data.checklist} onChange={(val) => onChange({ ...data, checklist: val as any })} isRequired />

        <RadioAdaTidak label="Dokumen Arsitektur" name="dokumenArsitektur" value={data.dokumenArsitektur} onChange={(val) => onChange({ ...data, dokumenArsitektur: val as any })} isRequired />

        <RadioAdaTidak label="Test Fungsional" name="testFungsional" value={data.testFungsional} onChange={(val) => onChange({ ...data, testFungsional: val as any })} isRequired />

        <RadioAdaTidak label="Rollback Plan" name="rollbackPlan" value={data.rollbackPlan} onChange={(val) => onChange({ ...data, rollbackPlan: val as any })} isRequired />

        <RadioYaTidak
          label="Perangkat Monitoring"
          name="perangkatMonitoring"
          value={data.perangkatMonitoring}
          onChange={(val) => onChange({ ...data, perangkatMonitoring: val as any })}
          isRequired
          showChildren={data.perangkatMonitoring === "YA"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Detail Perangkat Monitoring</FormLabel>
            <Input placeholder="Sebutkan perangkat monitoring..." value={data.perangkatMonitoringDetail || ""} onChange={(e) => onChange({ ...data, perangkatMonitoringDetail: e.target.value })} />
          </FormControl>
        </RadioYaTidak>

        <RadioYaTidak label="Persetujuan Divisi IT Security" name="persetujuanItSecurity" value={data.persetujuanItSecurity} onChange={(val) => onChange({ ...data, persetujuanItSecurity: val as any })} isRequired />
      </InputGroupPanel>
    </VStack>
  );
};

export default HardwareStep3;
