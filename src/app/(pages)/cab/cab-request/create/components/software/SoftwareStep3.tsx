"use client";

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { CabSoftwareStep3, CabSoftwareStep4 } from "@/app/types/cabTypes";
import RadioGroupField, { RadioAdaTidak, RadioAdaTidakSimple, RadioYaTidak } from "../RadioGroupField";

interface SoftwareStep3Props {
  dataStep3: CabSoftwareStep3;
  dataStep4: CabSoftwareStep4;
  onChangeStep3: (data: CabSoftwareStep3) => void;
  onChangeStep4: (data: CabSoftwareStep4) => void;
}

const SoftwareStep3 = ({ dataStep3, dataStep4, onChangeStep3, onChangeStep4 }: SoftwareStep3Props) => {
  const { colorMode } = useColorMode();

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* Rencana Migrasi */}
      <InputGroupPanel headerTitle="Rencana Migrasi">
        <RadioGroupField
          label="Downtime"
          name="downtime"
          value={dataStep3.downtime}
          onChange={(val) => onChangeStep3({ ...dataStep3, downtime: val as any })}
          options={[{ label: "Ada", value: "ADA" }, { label: "Tidak", value: "TIDAK" }]}
          isRequired
          showChildren={dataStep3.downtime === "ADA"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Durasi Downtime</FormLabel>
            <InputGroup>
              <Input placeholder="30" value={dataStep3.downtimeDurasi || ""} onChange={(e) => onChangeStep3({ ...dataStep3, downtimeDurasi: e.target.value })} />
              <InputRightAddon>Menit</InputRightAddon>
            </InputGroup>
          </FormControl>
        </RadioGroupField>

        <RadioAdaTidak label="Risiko Konflik dengan Aplikasi Lain" name="risikoKonflik" value={dataStep3.risikoKonflik} onChange={(val) => onChangeStep3({ ...dataStep3, risikoKonflik: val as any })} isRequired />

        <RadioYaTidak label="Instalasi Area DRC" name="instalasiAreaDrc" value={dataStep3.instalasiAreaDrc} onChange={(val) => onChangeStep3({ ...dataStep3, instalasiAreaDrc: val as any })} isRequired />
              <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Ceklist Migrasi (SW) & Rundown</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Detail ceklist dan rundown migrasi..." rows={4} value={dataStep3.ceklistMigrasiRundown} onChange={(e) => onChangeStep3({ ...dataStep3, ceklistMigrasiRundown: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

      </InputGroupPanel>

      {/* Kesiapan Teknis */}
      <InputGroupPanel headerTitle="Kesiapan Teknis & Compliance">
        <RadioAdaTidakSimple label="SAST" name="sast" value={dataStep4.sast} onChange={(val) => onChangeStep4({ ...dataStep4, sast: val as any })} isRequired />

        <RadioAdaTidakSimple
          label="Dokumen Arsitektur"
          name="dokumenArsitektur"
          value={dataStep4.dokumenArsitektur}
          onChange={(val) => onChangeStep4({ ...dataStep4, dokumenArsitektur: val as any })}
          isRequired
          showChildren={dataStep4.dokumenArsitektur === "ADA"}
        >
          <VStack spacing={3} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Link Dokumen (opsional)</FormLabel>
              <Input type="url" placeholder="https://..." value={dataStep4.dokumenArsitekturLink || ""} onChange={(e) => onChangeStep4({ ...dataStep4, dokumenArsitekturLink: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Upload Dokumen (opsional)</FormLabel>
              <Input type="file" accept=".pdf,.doc,.docx" pt={1} onChange={(e) => onChangeStep4({ ...dataStep4, dokumenArsitekturFile: e.target.files?.[0] || null })} />
            </FormControl>
          </VStack>
        </RadioAdaTidakSimple>

        <RadioYaTidak label="Kesiapan Infrastruktur" name="kesiapanInfrastruktur" value={dataStep4.kesiapanInfrastruktur} onChange={(val) => onChangeStep4({ ...dataStep4, kesiapanInfrastruktur: val as any })} isRequired />

        <RadioAdaTidakSimple label="Source Aplikasi" name="sourceAplikasi" value={dataStep4.sourceAplikasi} onChange={(val) => onChangeStep4({ ...dataStep4, sourceAplikasi: val as any })} isRequired />

        <RadioAdaTidakSimple label="User Matriks" name="userMatriks" value={dataStep4.userMatriks} onChange={(val) => onChangeStep4({ ...dataStep4, userMatriks: val as any })} isRequired />

        <RadioAdaTidak label="Rollback / Fallback Plan" name="rollbackPlan" value={dataStep4.rollbackPlan} onChange={(val) => onChangeStep4({ ...dataStep4, rollbackPlan: val as any })} isRequired />

        <RadioAdaTidak label="Tools / Cara Monitoring" name="toolsMonitoring" value={dataStep4.toolsMonitoring} onChange={(val) => onChangeStep4({ ...dataStep4, toolsMonitoring: val as any })} isRequired />

        <RadioAdaTidak label="Security Checklist" name="securityChecklist" value={dataStep4.securityChecklist} onChange={(val) => onChangeStep4({ ...dataStep4, securityChecklist: val as any })} isRequired />

        <RadioYaTidak
          label="Persetujuan Divisi IT Security"
          name="persetujuanItSecurity"
          value={dataStep4.persetujuanItSecurity}
          onChange={(val) => onChangeStep4({ ...dataStep4, persetujuanItSecurity: val as any })}
          isRequired
          showChildren={dataStep4.persetujuanItSecurity === "TIDAK"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Alasan</FormLabel>
            <Textarea placeholder="Alasan tidak ada persetujuan..." rows={3} value={dataStep4.persetujuanItSecurityAlasan || ""} onChange={(e) => onChangeStep4({ ...dataStep4, persetujuanItSecurityAlasan: e.target.value })} />
          </FormControl>
        </RadioYaTidak>

        <RadioAdaTidak label="Petunjuk Teknis" name="petunjukTeknis" value={dataStep4.petunjukTeknis} onChange={(val) => onChangeStep4({ ...dataStep4, petunjukTeknis: val as any })} isRequired />
      </InputGroupPanel>
    </VStack>
  );
};

export default SoftwareStep3;
