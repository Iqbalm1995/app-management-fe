"use client";

import { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  Stack,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { AnimatePresence, motion } from "framer-motion";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { RequirementsResponse } from "@/app/services/useRequirements";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { CabHardwareStep1 } from "@/app/types/cabTypes";
import RadioGroupField from "../RadioGroupField";

interface HardwareStep1Props {
  data: CabHardwareStep1;
  onChange: (data: CabHardwareStep1) => void;
  fetchRequirements: (search: string, token: string, reqType?: string) => Promise<RequirementsResponse[]>;
  fetchProjects: (search: string, token: string) => Promise<ProjectDataResponse[]>;
  tokenData: string;
}

const HardwareStep1 = ({ data, onChange, fetchRequirements, fetchProjects, tokenData }: HardwareStep1Props) => {
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);
  const [projectSearching, setProjectSearching] = useState(false);

  const handleProjectTypeChange = async (type: string) => {
    onChange({ ...data, kodeProjectType: type as any, kodeProject: "" });
    if (!type) { setProjectOptions([]); return; }

    setProjectSearching(true);
    if (type === "PROCUREMENT") {
      const projects = await fetchProjects("", tokenData);
      setProjectOptions(projects.map((p) => ({ label: `${p.projectCode} — ${p.projectName}`, value: p.projectCode })));
    } else {
      const reqs = await fetchRequirements("", tokenData, type);
      setProjectOptions(reqs.map((r) => ({ label: r.reqNumber, value: r.reqNumber })));
    }
    setProjectSearching(false);
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Identitas Request Hardware">
        {/* <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Day</FormLabel>
            <Stack spacing={0}>
              <Input type="date" value={data.dayDate} onChange={(e) => onChange({ ...data, dayDate: e.target.value })} />
            </Stack>
          </InputLayout>
        </FormControl> */}

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tipe Kode Project</FormLabel>
            <Stack spacing={0}>
              <ChakraSelect placeholder="Pilih tipe..." value={data.kodeProjectType} onChange={(e) => handleProjectTypeChange(e.target.value)}>
                <option value="BRD">BRD</option>
                <option value="RFC">RFC</option>
                <option value="PROCUREMENT">Procurement</option>
              </ChakraSelect>
            </Stack>
          </InputLayout>
        </FormControl>

        <AnimatePresence>
          {data.kodeProjectType && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <FormControl isRequired>
                <InputLayoutFull>
                  <FormLabel h="full" mt={2}>Kode Project</FormLabel>
                  <Stack spacing={0}>
                    <Select
                      placeholder="Pilih kode project..."
                      options={projectOptions}
                      isLoading={projectSearching}
                      onChange={(opt: any) => onChange({ ...data, kodeProject: opt?.value || "" })}
                      value={data.kodeProject ? { label: data.kodeProject, value: data.kodeProject } : null}
                      isClearable
                    />
                  </Stack>
                </InputLayoutFull>
              </FormControl>
            </motion.div>
          )}
        </AnimatePresence>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Nama Hardware / Perangkat</FormLabel>
            <Stack spacing={0}>
              <Input placeholder="Nama perangkat" value={data.namaHardware} onChange={(e) => onChange({ ...data, namaHardware: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Deskripsi Perubahan</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Jelaskan perubahan..." rows={3} value={data.deskripsiPerubahan} onChange={(e) => onChange({ ...data, deskripsiPerubahan: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dampak Terhadap Operasional</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Dampak operasional..." rows={3} value={data.dampakOperasional} onChange={(e) => onChange({ ...data, dampakOperasional: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dasar Upgrade</FormLabel>
            <Stack spacing={0}>
              <Textarea placeholder="Alasan/dasar upgrade..." rows={3} value={data.dasarUpgrade} onChange={(e) => onChange({ ...data, dasarUpgrade: e.target.value })} />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan CAB</FormLabel>
            <Stack spacing={0}>
              <Input type="datetime-local" value={data.requestedCabDate} onChange={(e) => onChange({ ...data, requestedCabDate: e.target.value })} />
            </Stack>
          </InputLayout>
        </FormControl>

        <RadioGroupField
          label="Jenis CAB"
          name="jenisCab"
          value={data.jenisCab}
          onChange={(val) => onChange({ ...data, jenisCab: val as any })}
          options={[{ label: "Weekly", value: "WEEKLY" }, { label: "Emergency", value: "EMERGENCY" }]}
          isRequired
          showChildren={data.jenisCab === "EMERGENCY"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Alasan Emergency</FormLabel>
            <Textarea placeholder="Jelaskan alasan emergency..." rows={3} value={data.jenisCabEmergencyAlasan || ""} onChange={(e) => onChange({ ...data, jenisCabEmergencyAlasan: e.target.value })} />
          </FormControl>
        </RadioGroupField>
      </InputGroupPanel>
    </VStack>
  );
};

export default HardwareStep1;
