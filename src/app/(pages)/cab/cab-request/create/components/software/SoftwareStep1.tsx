"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Text,
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { AnimatePresence, motion } from "framer-motion";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { ApplicationMasterResponse } from "@/app/services/useApps";
import { RequirementsResponse } from "@/app/services/useRequirements";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { CabSoftwareStep1 } from "@/app/types/cabTypes";
import RadioGroupField from "../RadioGroupField";

interface SoftwareStep1Props {
  data: CabSoftwareStep1;
  onChange: (data: CabSoftwareStep1) => void;
  fetchApplications: (search: string, token: string) => Promise<ApplicationMasterResponse[]>;
  fetchRequirements: (search: string, token: string, reqType?: string) => Promise<RequirementsResponse[]>;
  fetchProjects: (search: string, token: string, reqParentId?: string) => Promise<ProjectDataResponse[]>;
  tokenData: string;
}

interface ProjectOption {
  label: string;
  value: string;
  type: string;
}

const SoftwareStep1 = ({ data, onChange, fetchApplications, fetchRequirements, fetchProjects, tokenData }: SoftwareStep1Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // App options
  const [appList, setAppList] = useState<ApplicationMasterResponse[]>([]);
  const [appLoading, setAppLoading] = useState(false);

  // Project/RFC options
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Load apps on mount
  useEffect(() => {
    if (tokenData) loadApps();
  }, [tokenData]);

  const loadApps = async () => {
    setAppLoading(true);
    const apps = await fetchApplications("", tokenData);
    setAppList(apps);
    setAppLoading(false);
  };

  // Map apps to chakra-react-select options
  const appOptions = appList.map((a) => ({
    label: `${a.appShortName} — ${a.appName}`,
    value: a.id,
  }));

  // When app is selected, load related projects
  const handleAppSelect = async (option: { label: string; value: string } | null) => {
    if (!option) {
      onChange({ ...data, applicationId: "", applicationName: "", aplikasiKategori: "", rfcKodeProject: "" });
      setProjectOptions([]);
      return;
    }

    const app = appList.find((a) => a.id === option.value);
    if (!app) return;

    onChange({
      ...data,
      applicationId: app.id,
      applicationName: app.appName,
      aplikasiKategori: app.appTypes || "",
      rfcKodeProject: "",
    });

    // Load related BRD/RFC/Projects
    setProjectLoading(true);
    const options: ProjectOption[] = [];

    const [brdReqs, rfcReqs, projects] = await Promise.all([
      fetchRequirements("", tokenData, "BRD"),
      fetchRequirements("", tokenData, "RFC"),
      app.reqParentId ? fetchProjects("", tokenData, app.reqParentId) : Promise.resolve([]),
    ]);

    brdReqs.forEach((r) => options.push({ label: `[BRD] ${r.reqNumber}`, value: r.reqNumber, type: "BRD" }));
    rfcReqs.forEach((r) => options.push({ label: `[RFC] ${r.reqNumber}`, value: r.reqNumber, type: "RFC" }));
    projects.forEach((p) => options.push({ label: `[PROJECT] ${p.projectCode} — ${p.projectName}`, value: p.projectCode, type: "PROJECT" }));

    setProjectOptions(options);
    setProjectLoading(false);
  };

  // Styles for chakra-react-select
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.700" : "white",
      borderColor: isDark ? "gray.600" : "gray.200",
    }),
    menu: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.700" : "white",
    }),
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Identitas Request">
        {/* <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan CAB</FormLabel>
            <Stack spacing={0}>
              <Input type="date" value={data.dayDate} onChange={(e) => onChange({ ...data, dayDate: e.target.value })} />
            </Stack>
          </InputLayout>
        </FormControl> */}

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Pilih Aplikasi</FormLabel>
            <Stack spacing={0}>
              <ChakraSelect
                placeholder="Pilih"
                options={appOptions}
                isLoading={appLoading}
                value={data.applicationId ? appOptions.find((o) => o.value === data.applicationId) || null : null}
                onChange={(opt) => handleAppSelect(opt as { label: string; value: string } | null)}
                isClearable
                isSearchable
                chakraStyles={selectStyles}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
              />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <AnimatePresence>
          {data.applicationId && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <FormControl isRequired>
                <InputLayoutFull>
                  <FormLabel h="full" mt={2}>Related Project / RFC / BRD</FormLabel>
                  <Stack spacing={0}>
                    <ChakraSelect
                      placeholder="Pilih project terkait..."
                      options={projectOptions}
                      isLoading={projectLoading}
                      value={data.rfcKodeProject ? projectOptions.find((o) => o.value === data.rfcKodeProject) || null : null}
                      onChange={(opt) => onChange({ ...data, rfcKodeProject: (opt as ProjectOption | null)?.value || "" })}
                      isClearable
                      isSearchable
                      chakraStyles={selectStyles}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                      formatOptionLabel={(opt: any) => (
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={opt.type === "BRD" ? "blue" : opt.type === "RFC" ? "orange" : "green"}
                            fontSize="2xs"
                            rounded="sm"
                          >
                            {opt.type}
                          </Badge>
                          <Text fontSize="sm">
                            {String(opt.label || "").replace(/^\[(BRD|RFC|PROJECT)\]\s*/, "")}
                          </Text>
                        </HStack>
                      )}
                    />
                    {projectOptions.length > 0 && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {projectOptions.filter((o) => o.type === "BRD").length} BRD • {projectOptions.filter((o) => o.type === "RFC").length} RFC • {projectOptions.filter((o) => o.type === "PROJECT").length} Project
                      </Text>
                    )}
                  </Stack>
                </InputLayoutFull>
              </FormControl>
            </motion.div>
          )}
        </AnimatePresence>

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>ITSP Kode</FormLabel>
            <Stack spacing={0}>
              <Input placeholder="Masukkan kode ITSP" value={data.itspKode} onChange={(e) => onChange({ ...data, itspKode: e.target.value })} />
            </Stack>
          </InputLayout>
        </FormControl>

        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kategori Aplikasi</FormLabel>
            <Stack spacing={0}>
              <Input value={data.aplikasiKategori} isReadOnly bg={isDark ? "gray.600" : "gray.100"} placeholder="Auto-fill dari aplikasi" />
            </Stack>
          </InputLayout>
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

export default SoftwareStep1;
