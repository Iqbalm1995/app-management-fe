"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout } from "@/app/components/layoutContentBody";
import { ApplicationMasterResponse } from "@/app/services/useApps";
import { RequirementsResponse } from "@/app/services/useRequirements";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { CabSoftwareApplicationItem, CabSoftwareStep1 } from "@/app/types/cabTypes";
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
  projectId?: string;
}

const SoftwareStep1 = ({
  data,
  onChange,
  fetchApplications,
  fetchRequirements,
  fetchProjects,
  tokenData,
}: SoftwareStep1Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // App options
  const [appList, setAppList] = useState<ApplicationMasterResponse[]>([]);
  const [appLoading, setAppLoading] = useState(false);

  // Global Project/RFC/BRD options pool
  const [globalProjectOptions, setGlobalProjectOptions] = useState<ProjectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Map of per-app specific project options
  const [appProjectMap, setAppProjectMap] = useState<Record<string, ProjectOption[]>>({});

  // Load apps & global projects on mount
  useEffect(() => {
    if (tokenData) {
      loadAppsAndProjects();
    }
  }, [tokenData]);

  const loadAppsAndProjects = async () => {
    setAppLoading(true);
    setProjectLoading(true);
    try {
      const [apps, brdReqs, rfcReqs, projects] = await Promise.all([
        fetchApplications("", tokenData),
        fetchRequirements("", tokenData, "BRD"),
        fetchRequirements("", tokenData, "RFC"),
        fetchProjects("", tokenData),
      ]);

      setAppList(apps || []);

      const pOptions: ProjectOption[] = [];
      (brdReqs || []).forEach((r) =>
        pOptions.push({
          label: `[BRD] ${r.reqNumber} — ${r.reqNarative || r.appInitialName || "BRD Document"}`,
          value: r.reqNumber,
          projectId: r.id || r.reqNumber,
          type: "BRD",
        })
      );
      (rfcReqs || []).forEach((r) =>
        pOptions.push({
          label: `[RFC] ${r.reqNumber} — ${r.reqNarative || r.appInitialName || "RFC Change Request"}`,
          value: r.reqNumber,
          projectId: r.id || r.reqNumber,
          type: "RFC",
        })
      );
      (projects || []).forEach((p) =>
        pOptions.push({
          label: `[PROJECT] ${p.projectCode} — ${p.projectName}`,
          value: p.projectCode,
          projectId: p.id,
          type: "PROJECT",
        })
      );

      setGlobalProjectOptions(pOptions);
    } catch (err) {
      console.error("Failed loading apps or project requirements", err);
    } finally {
      setAppLoading(false);
      setProjectLoading(false);
    }
  };

  // Map apps to chakra-react-select options
  const appOptions = appList.map((a) => ({
    label: `${a.appShortName} — ${a.appName}`,
    value: a.id,
    data: a,
  }));

  // Multi-field smart filter for application dropdown to handle large list of apps
  const filterAppOption = (candidate: any, input: string) => {
    if (!input) return true;
    const search = input.toLowerCase().trim();
    const app = candidate.data?.data;
    const label = (candidate.label || "").toLowerCase();
    const shortName = (app?.appShortName || "").toLowerCase();
    const appName = (app?.appName || "").toLowerCase();
    const appInitial = (app?.appInitialName || "").toLowerCase();
    const appTypes = (app?.appTypes || "").toLowerCase();
    const appCode = (app?.appCode || "").toLowerCase();
    return (
      label.includes(search) ||
      shortName.includes(search) ||
      appName.includes(search) ||
      appInitial.includes(search) ||
      appTypes.includes(search) ||
      appCode.includes(search)
    );
  };

  // Applications list from state or initialized with 1 item
  const rawApplications: CabSoftwareApplicationItem[] =
    data.applications && data.applications.length > 0
      ? data.applications
      : data.applicationId
        ? [
          {
            id: `app-item-0`,
            applicationId: data.applicationId,
            applicationName: data.applicationName,
            aplikasiKategori: data.aplikasiKategori,
            rfcKodeProject: data.rfcKodeProject,
            projectId: data.projectId || data.rfcKodeProject || "",
            itspKode: data.itspKode,
          },
        ]
        : [
          {
            id: `app-item-0`,
            applicationId: "",
            applicationName: "",
            aplikasiKategori: "",
            rfcKodeProject: "",
            projectId: "",
            itspKode: "",
          },
        ];

  // Helper to commit application list updates & sync primary fields
  const updateApplications = (newList: CabSoftwareApplicationItem[]) => {
    const firstApp = newList[0] || {
      applicationId: "",
      applicationName: "",
      aplikasiKategori: "",
      rfcKodeProject: "",
      projectId: "",
      itspKode: "",
    };

    onChange({
      ...data,
      applications: newList,
      applicationId: firstApp.applicationId,
      applicationName: firstApp.applicationName,
      aplikasiKategori: data.aplikasiKategori || firstApp.aplikasiKategori || "",
      rfcKodeProject: firstApp.rfcKodeProject || "",
      projectId: firstApp.projectId || firstApp.rfcKodeProject || "",
      itspKode: firstApp.itspKode || data.itspKode || "",
    });
  };

  // Add new application item
  const handleAddApplication = () => {
    const newItem: CabSoftwareApplicationItem = {
      id: `app-item-${Date.now()}`,
      applicationId: "",
      applicationName: "",
      aplikasiKategori: "",
      rfcKodeProject: "",
      itspKode: data.itspKode || "",
    };
    updateApplications([...rawApplications, newItem]);
  };

  // Remove application item
  const handleRemoveApplication = (index: number) => {
    if (rawApplications.length <= 1) {
      updateApplications([
        {
          id: `app-item-0`,
          applicationId: "",
          applicationName: "",
          aplikasiKategori: "",
          rfcKodeProject: "",
          itspKode: "",
        },
      ]);
      return;
    }
    const newList = rawApplications.filter((_, idx) => idx !== index);
    updateApplications(newList);
  };

  // Change single application item field
  const handleAppItemChange = async (
    index: number,
    field: keyof CabSoftwareApplicationItem,
    value: string
  ) => {
    const newList = [...rawApplications];
    newList[index] = { ...newList[index], [field]: value };
    updateApplications(newList);
  };

  // When application select changes for an item
  const handleSelectApp = async (index: number, selectedOpt: any) => {
    const newList = [...rawApplications];
    if (!selectedOpt) {
      newList[index] = {
        ...newList[index],
        applicationId: "",
        applicationName: "",
        aplikasiKategori: "",
        rfcKodeProject: "",
      };
      updateApplications(newList);
      return;
    }

    const app = appList.find((a) => a.id === selectedOpt.value);
    const appName = app?.appName || selectedOpt.label;
    const category = app?.appTypes || "";

    newList[index] = {
      ...newList[index],
      applicationId: selectedOpt.value,
      applicationName: appName,
      aplikasiKategori: category,
      rfcKodeProject: "",
    };
    updateApplications(newList);

    // If app has specific reqParentId, fetch its specific project options
    if (app?.reqParentId && !appProjectMap[app.id]) {
      try {
        const specificProjects = await fetchProjects("", tokenData, app.reqParentId);
        const mappedSpecific: ProjectOption[] = specificProjects.map((p) => ({
          label: `[PROJECT] ${p.projectCode} — ${p.projectName}`,
          value: p.projectCode,
          projectId: p.id,
          type: "PROJECT",
        }));
        setAppProjectMap((prev) => ({ ...prev, [app.id]: mappedSpecific }));
      } catch (e) {
        console.error("Failed fetching app-specific projects", e);
      }
    }
  };

  // Get project options for a specific application row
  const getProjectOptionsForRow = (appId: string): ProjectOption[] => {
    if (!appId) return globalProjectOptions;
    const specific = appProjectMap[appId];
    if (specific && specific.length > 0) {
      const specificValues = new Set(specific.map((s) => s.value));
      const rest = globalProjectOptions.filter((g) => !specificValues.has(g.value));
      return [...specific, ...rest];
    }
    return globalProjectOptions;
  };

  // Styles for chakra-react-select
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.700" : "white",
      borderColor: isDark ? "gray.600" : "gray.200",
      rounded: "md",
    }),
    menu: (provided: any) => ({
      ...provided,
      bg: isDark ? "gray.700" : "white",
      zIndex: 9999,
    }),
  };

  const selectedAppsCount = rawApplications.filter((a) => a.applicationId).length;

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* ─── SECTION 1: APLIKASI & PROJECT TERKAIT ─── */}
      <Card
        rounded="lg"
        border="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
        shadow="none"
      >
        {/* Section Header with Blue Background */}
        <Box
          px={5}
          py={3.5}
          bg={isDark ? "#1E3A8A" : "#1D4ED8"}
          borderTopRadius="lg"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Icon as={FiLayers} color="white" fontSize="md" />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    Aplikasi & Project Terkait
                  </Text>
                  <Badge
                    bg="whiteAlpha.250"
                    color="white"
                    border="1px solid"
                    borderColor="whiteAlpha.400"
                    rounded="full"
                    px={2}
                    py={0.5}
                    fontSize="3xs"
                  >
                    {selectedAppsCount} Terpilih
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="blue.100">
                  Pilih aplikasi utama yang diajukan beserta sistem terkait lainnya.
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </Box>

        {/* Applications List */}
        <CardBody p={5}>
          <VStack spacing={3.5} align="stretch">
            {rawApplications.map((appItem, index) => {
              const isMainApp = index === 0;
              const currentProjectOptions = getProjectOptionsForRow(appItem.applicationId);
              const selectedAppOpt = appItem.applicationId
                ? appOptions.find((o) => o.value === appItem.applicationId) || {
                  label: appItem.applicationName,
                  value: appItem.applicationId,
                }
                : null;
              const selectedProjectOpt = appItem.rfcKodeProject
                ? currentProjectOptions.find((o) => o.value === appItem.rfcKodeProject) || {
                  label: appItem.rfcKodeProject,
                  value: appItem.rfcKodeProject,
                  type: "RFC",
                }
                : null;
              const appCategory =
                appItem.aplikasiKategori ||
                appList.find((a) => a.id === appItem.applicationId)?.appTypes ||
                appList.find((a) => a.id === appItem.applicationId)?.appTypeCustom ||
                "";

              return (
                <Box
                  key={appItem.id || index}
                  p={4}
                  rounded="md"
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.750" : "gray.50"}
                >
                  {/* Row Header */}
                  <Flex justify="space-between" align="center" mb={3}>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={isMainApp ? "blue" : "gray"}
                        variant={isMainApp ? "solid" : "subtle"}
                        rounded="md"
                        px={2}
                        py={0.5}
                        fontSize="2xs"
                        fontWeight="semibold"
                      >
                        {isMainApp ? "Aplikasi Utama" : `Aplikasi Terkait #${index}`}
                      </Badge>

                      {appItem.applicationName && (
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color={isDark ? "gray.200" : "gray.800"}
                        >
                          {appItem.applicationName}
                        </Text>
                      )}
                      {appCategory && (
                        <Badge colorScheme="blue" variant="subtle" rounded="full" px={2} py={0.5} fontSize="3xs" fontWeight="semibold">
                          {appCategory}
                        </Badge>
                      )}
                    </HStack>

                    {!isMainApp && (
                      <Tooltip label="Hapus baris ini" placement="top" hasArrow>
                        <IconButton
                          aria-label="Hapus aplikasi"
                          icon={<FiTrash2 />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveApplication(index)}
                        />
                      </Tooltip>
                    )}
                  </Flex>

                  {/* Clean 2-Field Grid: Pilih Aplikasi & Related Project */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
                    {/* 1. Pilih Aplikasi */}
                    <FormControl isRequired={isMainApp}>
                      <FormLabel fontSize="xs" fontWeight="medium" color={isDark ? "gray.300" : "gray.600"} mb={1}>
                        {isMainApp ? "Aplikasi Utama*" : "Aplikasi Terkait"}
                      </FormLabel>
                      <ChakraSelect
                        placeholder={
                          appLoading
                            ? "Memuat data aplikasi..."
                            : isMainApp
                              ? `Cari & pilih aplikasi utama (${appList.length} tersedia)...`
                              : `Cari & pilih aplikasi terkait (${appList.length} tersedia)...`
                        }
                        options={appOptions}
                        isLoading={appLoading}
                        value={selectedAppOpt}
                        onChange={(opt) => handleSelectApp(index, opt)}
                        isClearable={!isMainApp}
                        isSearchable
                        filterOption={filterAppOption}
                        chakraStyles={selectStyles}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        noOptionsMessage={({ inputValue }) =>
                          inputValue
                            ? `Aplikasi "${inputValue}" tidak ditemukan`
                            : "Tidak ada data aplikasi"
                        }
                        formatOptionLabel={(opt: any) => {
                          const app = opt.data;
                          return (
                            <Flex justify="space-between" align="center" w="full" py={0.5}>
                              <VStack align="start" spacing={0} maxW="80%">
                                <HStack spacing={2}>
                                  <Text fontSize="xs" fontWeight="bold">
                                    {app?.appShortName || opt.label}
                                  </Text>
                                  {app?.appTypes && (
                                    <Badge
                                      colorScheme="blue"
                                      variant="subtle"
                                      fontSize="3xs"
                                      rounded="full"
                                      px={1.5}
                                    >
                                      {app.appTypes}
                                    </Badge>
                                  )}
                                </HStack>
                                {app?.appName && app?.appName !== app?.appShortName && (
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.600"}
                                    noOfLines={1}
                                  >
                                    {app.appName}
                                  </Text>
                                )}
                              </VStack>
                            </Flex>
                          );
                        }}
                      />
                    </FormControl>

                    {/* 2. Related Project / RFC / BRD */}
                    <FormControl isRequired={isMainApp}>
                      <FormLabel fontSize="xs" fontWeight="medium" color={isDark ? "gray.300" : "gray.600"} mb={1}>
                        {isMainApp ? "Project / RFC / BRD*" : "Project / RFC / BRD"}
                      </FormLabel>
                      <ChakraSelect
                        placeholder={
                          appItem.applicationId
                            ? "Pilih project terkait..."
                            : "Pilih aplikasi terlebih dahulu..."
                        }
                        options={currentProjectOptions}
                        isLoading={projectLoading}
                        value={selectedProjectOpt}
                        onChange={(opt: any) => {
                          const newList = [...rawApplications];
                          newList[index] = {
                            ...newList[index],
                            rfcKodeProject: opt?.value || "",
                            projectId: opt?.projectId || opt?.value || "",
                          };
                          updateApplications(newList);
                        }}
                        isClearable
                        isSearchable
                        chakraStyles={selectStyles}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                        formatOptionLabel={(opt: any) => (
                          <HStack spacing={2}>
                            <Badge
                              colorScheme={
                                opt.type === "BRD"
                                  ? "blue"
                                  : opt.type === "RFC"
                                    ? "orange"
                                    : "green"
                              }
                              fontSize="3xs"
                              rounded="sm"
                              px={1}
                            >
                              {opt.type || "RFC"}
                            </Badge>
                            <Text fontSize="xs">
                              {String(opt.label || "").replace(/^\[(BRD|RFC|PROJECT)\]\s*/, "")}
                            </Text>
                          </HStack>
                        )}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              );
            })}

            {/* Bottom Add Button */}
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              rounded="md"
              leftIcon={<FiPlus />}
              onClick={handleAddApplication}
              w="full"
            >
              Tambah Aplikasi Terkait
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* ─── SECTION 2: INFORMASI PERMOHONAN CAB ─── */}
      <InputGroupPanel headerTitle="Informasi Permohonan CAB">
        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan CAB</FormLabel>
            <Stack spacing={0}>
              <Input
                type="datetime-local"
                rounded="md"
                value={data.requestedCabDate}
                onChange={(e) => onChange({ ...data, requestedCabDate: e.target.value })}
              />
            </Stack>
          </InputLayout>
        </FormControl>

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kategori Aplikasi</FormLabel>
            <Stack spacing={0}>
              <Select
                placeholder="Pilih Kategori Aplikasi"
                rounded="md"
                value={data.aplikasiKategori || ""}
                onChange={(e) => onChange({ ...data, aplikasiKategori: e.target.value })}
              >
                <option value="Monitoring">Monitoring</option>
                <option value="Transaksional">Transaksional</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Pelaporan">Pelaporan</option>
              </Select>
            </Stack>
          </InputLayout>
        </FormControl>
        
        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tipe CAB</FormLabel>
            <Stack spacing={0}>
              <Select
                placeholder="Pilih Tipe CAB"
                rounded="md"
                value={data.tipeCab || ""}
                onChange={(e) => onChange({ ...data, tipeCab: e.target.value })}
              >
                <option value="NEW FEATURE">New Feature</option>
                <option value="ENHANCEMENT">Enhancement</option>
                <option value="BUG FIXING">Bug Fixing</option>
                <option value="TOOLS">Tools</option>
              </Select>
            </Stack>
          </InputLayout>
        </FormControl>

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>App Side</FormLabel>
            <Stack spacing={2}>
              <Select
                placeholder="Pilih App Side"
                rounded="md"
                value={data.appSide || ""}
                onChange={(e) => onChange({ ...data, appSide: e.target.value })}
              >
                <option value="WEB">WEB</option>
                <option value="APP">APP</option>
                <option value="DB">DB</option>
                <option value="ALL">ALL</option>
                <option value="OTHER">OTHER (Lainnya)</option>
              </Select>
              {data.appSide === "OTHER" && (
                <Input
                  placeholder="Tuliskan app side"
                  rounded="md"
                  size="sm"
                  value={data.appSideOther || ""}
                  onChange={(e) => onChange({ ...data, appSideOther: e.target.value })}
                />
              )}
            </Stack>
          </InputLayout>
        </FormControl>

        <FormControl>
          <InputLayout>
            <FormLabel h="full" mt={2}>Kode ITSP</FormLabel>
            <Stack spacing={0}>
              <Input
                placeholder="Contoh: ITSP-BJB-990"
                rounded="md"
                value={data.itspKode}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...data,
                    itspKode: val,
                    applications: rawApplications.map((app) => ({
                      ...app,
                      itspKode: app.itspKode || val,
                    })),
                  });
                }}
              />
            </Stack>
          </InputLayout>
        </FormControl>

        <RadioGroupField
          label="Jenis CAB"
          name="jenisCab"
          value={data.jenisCab}
          onChange={(val) => onChange({ ...data, jenisCab: val as any })}
          options={[
            { label: "Normal", value: "NORMAL" },
            { label: "Emergency", value: "EMERGENCY" },
          ]}
          isRequired
          showChildren={data.jenisCab === "EMERGENCY"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Alasan Emergency</FormLabel>
            <Textarea
              placeholder="Jelaskan alasan pengajuan emergency..."
              rows={3}
              rounded="md"
              value={data.jenisCabEmergencyAlasan || ""}
              onChange={(e) =>
                onChange({ ...data, jenisCabEmergencyAlasan: e.target.value })
              }
            />
          </FormControl>
        </RadioGroupField>
      </InputGroupPanel>
    </VStack>
  );
};

export default SoftwareStep1;
