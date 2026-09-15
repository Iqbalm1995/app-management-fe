"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
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
import { FiBriefcase, FiEdit2, FiGrid, FiLayers, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout } from "@/app/components/layoutContentBody";
import { ApplicationMasterResponse } from "@/app/services/useApps";
import { RequirementsResponse } from "@/app/services/useRequirements";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { CabSoftwareApplicationItem, CabSoftwareStep1 } from "@/app/types/cabTypes";
import ApplicationPickerModal from "@/app/components/ApplicationPickerModal";
import ProjectPickerModal from "@/app/components/ProjectPickerModal";
import RadioGroupField from "../RadioGroupField";

interface SoftwareStep1Props {
  data: CabSoftwareStep1;
  onChange: (data: CabSoftwareStep1) => void;
  fetchApplications: (search: string, token: string) => Promise<ApplicationMasterResponse[]>;
  fetchRequirements?: (search: string, token: string, reqType?: string) => Promise<RequirementsResponse[]>;
  fetchProjects?: (search: string, token: string, reqParentId?: string) => Promise<ProjectDataResponse[]>;
  fetchProjectsByApp: (appId: string, search: string, token: string) => Promise<ProjectDataResponse[]>;
  fetchRequirementsByApp: (appInitialCode: string, search: string, token: string, reqType?: string) => Promise<RequirementsResponse[]>;
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
  fetchProjectsByApp,
  fetchRequirementsByApp,
  tokenData,
}: SoftwareStep1Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // App options
  const [appList, setAppList] = useState<ApplicationMasterResponse[]>([]);
  const [appLoading, setAppLoading] = useState(false);

  // Application Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activePickingIndex, setActivePickingIndex] = useState<number>(0);

  // Project Picker Modal State
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [activeProjectPickingIndex, setActiveProjectPickingIndex] = useState<number>(0);

  // Map of per-app specific project options
  const [appProjectMap, setAppProjectMap] = useState<Record<string, ProjectOption[]>>({});
  const [appProjectLoading, setAppProjectLoading] = useState<Record<string, boolean>>({});

  const handleProjectSelectedFromModal = (
    index: number,
    project: ProjectDataResponse
  ) => {
    const projectNum = project.projectNo || project.projectCode || project.id;
    const newList = [...rawApplications];
    newList[index] = {
      ...newList[index],
      rfcKodeProject: projectNum,
      projectId: project.id || projectNum,
    };
    updateApplications(newList);
  };

  const handleAppSelectedFromModal = (index: number, app: ApplicationMasterResponse) => {
    const newList = [...rawApplications];
    const appName = app.appName || app.appShortName || "";
    const category = app.appTypes || app.appTypeCustom || "";

    newList[index] = {
      ...newList[index],
      applicationId: app.id,
      applicationName: appName,
      aplikasiKategori: category,
      rfcKodeProject: "",
      projectId: "",
    };
    updateApplications(newList);

    // On-demand fetch projects specifically for this selected application
    loadProjectsForApp(app.id);
  };

  // Load apps on mount (fast lightweight POST)
  useEffect(() => {
    if (tokenData) {
      loadAppsOnly();
    }
  }, [tokenData]);

  const loadAppsOnly = async () => {
    setAppLoading(true);
    try {
      const apps = await fetchApplications("", tokenData);
      setAppList(apps || []);

      // If initial data has applications selected, fetch their projects on demand
      const initialAppIds = (data.applications || [])
        .map((a) => a.applicationId)
        .filter(Boolean);
      if (data.applicationId && !initialAppIds.includes(data.applicationId)) {
        initialAppIds.push(data.applicationId);
      }

      for (const appId of initialAppIds) {
        loadProjectsForApp(appId);
      }
    } catch (err) {
      console.error("Failed loading apps", err);
    } finally {
      setAppLoading(false);
    }
  };

  const loadProjectsForApp = async (appId: string) => {
    if (!appId || appProjectMap[appId]?.length > 0) return;

    setAppProjectLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      const projects = await fetchProjectsByApp(appId, "", tokenData);
      const pOptions: ProjectOption[] = [];

      (projects || []).forEach((p) => {
        const projectNum = p.projectNo || p.projectCode || p.id;
        pOptions.push({
          label: `${projectNum} — ${p.projectName}`,
          value: projectNum,
          projectId: p.id,
          type: "PROJECT",
        });
      });

      setAppProjectMap((prev) => ({ ...prev, [appId]: pOptions }));
    } catch (err) {
      console.error(`Failed loading projects for app ${appId}`, err);
    } finally {
      setAppProjectLoading((prev) => ({ ...prev, [appId]: false }));
    }
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

  // Get project options for a specific application row
  const getProjectOptionsForRow = (appId: string): ProjectOption[] => {
    if (!appId) return [];
    return appProjectMap[appId] || [];
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
                        <HStack spacing={1}>
                          {String(appCategory)
                            .split(/[,/]+/)
                            .map((c: string) => c.trim())
                            .filter(Boolean)
                            .map((cat: string, idx: number) => (
                              <Badge
                                key={idx}
                                colorScheme="blue"
                                variant="subtle"
                                rounded="full"
                                px={2}
                                py={0.5}
                                fontSize="3xs"
                                fontWeight="semibold"
                              >
                                {cat}
                              </Badge>
                            ))}
                        </HStack>
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

                      {appItem.applicationId ? (
                        <Card
                          p={2.5}
                          bg={isDark ? "gray.800" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "blue.600" : "blue.200"}
                          borderRadius="md"
                          shadow="xs"
                        >
                          <Flex justify="space-between" align="center" gap={2}>
                            <HStack spacing={2.5} flex={1} minW={0}>
                              <Avatar
                                size="sm"
                                name={appItem.applicationName || "APP"}
                                bg="secondary.600"
                                color="white"
                                icon={<HiOutlineDesktopComputer fontSize="1rem" />}
                                borderRadius="md"
                              />
                              <VStack align="start" spacing={0} flex={1} minW={0}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  noOfLines={1}
                                  title={appItem.applicationName}
                                  color={isDark ? "white" : "gray.800"}
                                >
                                  {appItem.applicationName}
                                </Text>
                                <HStack spacing={1.5}>
                                  <Badge
                                    fontSize="3xs"
                                    colorScheme="blue"
                                    variant="subtle"
                                    px={1.5}
                                    borderRadius="sm"
                                  >
                                    {appList.find((a) => a.id === appItem.applicationId)?.appCode ||
                                      appList.find((a) => a.id === appItem.applicationId)?.appShortName ||
                                      "CONNECTED"}
                                  </Badge>
                                  {appCategory && (
                                    <Badge
                                      colorScheme="teal"
                                      variant="subtle"
                                      fontSize="3xs"
                                      rounded="full"
                                      px={1.5}
                                    >
                                      {appCategory}
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>

                            <HStack spacing={1}>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                leftIcon={<FiEdit2 />}
                                onClick={() => {
                                  setActivePickingIndex(index);
                                  setIsPickerOpen(true);
                                }}
                              >
                                Ganti
                              </Button>
                              {!isMainApp && (
                                <IconButton
                                  size="xs"
                                  aria-label="Clear"
                                  icon={<FiX />}
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => {
                                    const newList = [...rawApplications];
                                    newList[index] = {
                                      ...newList[index],
                                      applicationId: "",
                                      applicationName: "",
                                      aplikasiKategori: "",
                                      rfcKodeProject: "",
                                      projectId: "",
                                    };
                                    updateApplications(newList);
                                  }}
                                />
                              )}
                            </HStack>
                          </Flex>
                        </Card>
                      ) : (
                        <Button
                          size="md"
                          w="full"
                          h="42px"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiGrid />}
                          onClick={() => {
                            setActivePickingIndex(index);
                            setIsPickerOpen(true);
                          }}
                          justifyContent="space-between"
                          px={3.5}
                          borderStyle="dashed"
                          borderWidth="1.5px"
                          bg={isDark ? "whiteAlpha.50" : "blue.50"}
                          _hover={{
                            bg: isDark ? "whiteAlpha.100" : "blue.100",
                            borderColor: "blue.400",
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon as={HiOutlineDesktopComputer} />
                            <Text fontSize="xs" fontWeight="medium">
                              {isMainApp ? "Cari & Pilih dari Katalog Aplikasi..." : "Cari & Pilih Aplikasi Terkait..."}
                            </Text>
                          </HStack>
                          <Badge colorScheme="blue" variant="solid" fontSize="3xs" px={2} py={0.5} rounded="md">
                            Buka Katalog
                          </Badge>
                        </Button>
                      )}
                    </FormControl>

                    {/* 2. Related Project */}
                    <FormControl isRequired={isMainApp}>
                      <FormLabel fontSize="xs" fontWeight="medium" color={isDark ? "gray.300" : "gray.600"} mb={1}>
                        {isMainApp ? "Project Terkait*" : "Project Terkait"}
                      </FormLabel>

                      {appItem.rfcKodeProject ? (
                        <Card
                          p={2.5}
                          bg={isDark ? "gray.800" : "white"}
                          border="1px solid"
                          borderColor={isDark ? "purple.600" : "purple.200"}
                          borderRadius="md"
                          shadow="xs"
                        >
                          <Flex justify="space-between" align="center" gap={2}>
                            <HStack spacing={2.5} flex={1} minW={0}>
                              <Box
                                p={1.5}
                                bg={isDark ? "purple.900" : "purple.50"}
                                color="purple.500"
                                borderRadius="md"
                              >
                                <Icon as={FiBriefcase} boxSize={4} />
                              </Box>
                              <VStack align="start" spacing={0} flex={1} minW={0}>
                                <HStack spacing={1.5} maxW="full">
                                  <Badge
                                    colorScheme="purple"
                                    fontSize="2xs"
                                    px={1.5}
                                    borderRadius="sm"
                                    fontFamily="mono"
                                  >
                                    {appItem.rfcKodeProject}
                                  </Badge>
                                </HStack>
                                {selectedProjectOpt?.label && (
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    noOfLines={1}
                                    title={selectedProjectOpt.label}
                                    color={isDark ? "white" : "gray.800"}
                                  >
                                    {String(selectedProjectOpt.label).replace(/^\[PROJECT\]\s*/, "")}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>

                            <HStack spacing={1}>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="purple"
                                leftIcon={<FiEdit2 />}
                                onClick={() => {
                                  setActiveProjectPickingIndex(index);
                                  setIsProjectPickerOpen(true);
                                }}
                              >
                                Ganti
                              </Button>
                              <IconButton
                                size="xs"
                                aria-label="Clear project"
                                icon={<FiX />}
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => {
                                  const newList = [...rawApplications];
                                  newList[index] = {
                                    ...newList[index],
                                    rfcKodeProject: "",
                                    projectId: "",
                                  };
                                  updateApplications(newList);
                                }}
                              />
                            </HStack>
                          </Flex>
                        </Card>
                      ) : (
                        <Button
                          size="md"
                          w="full"
                          h="42px"
                          colorScheme="purple"
                          variant="outline"
                          leftIcon={<FiBriefcase />}
                          isDisabled={!appItem.applicationId}
                          onClick={() => {
                            setActiveProjectPickingIndex(index);
                            setIsProjectPickerOpen(true);
                          }}
                          justifyContent="space-between"
                          px={3.5}
                          borderStyle="dashed"
                          borderWidth="1.5px"
                          bg={isDark ? "whiteAlpha.50" : "purple.50"}
                          _hover={{
                            bg: isDark ? "whiteAlpha.100" : "purple.100",
                            borderColor: "purple.400",
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon as={FiBriefcase} />
                            <Text fontSize="xs" fontWeight="medium">
                              {!appItem.applicationId
                                ? "Pilih aplikasi terlebih dahulu..."
                                : isMainApp
                                ? "Cari & Pilih Project Terkait..."
                                : "Cari & Pilih Project..."}
                            </Text>
                          </HStack>
                          {appItem.applicationId && (
                            <Badge colorScheme="purple" variant="solid" fontSize="3xs" px={2} py={0.5} rounded="md">
                              Buka Project
                            </Badge>
                          )}
                        </Button>
                      )}
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

      {/* Application Picker Modal (Full Server-side search & pagination) */}
      <ApplicationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedApp={
          rawApplications[activePickingIndex]?.applicationId
            ? ({
                id: rawApplications[activePickingIndex].applicationId,
                appName: rawApplications[activePickingIndex].applicationName,
                appTypes: rawApplications[activePickingIndex].aplikasiKategori,
              } as ApplicationMasterResponse)
            : null
        }
        onAppSelect={(app) => {
          if (app) {
            handleAppSelectedFromModal(activePickingIndex, app);
          }
        }}
        tokenData={tokenData}
        title={
          activePickingIndex === 0
            ? "Pilih Aplikasi Utama"
            : `Pilih Aplikasi Terkait #${activePickingIndex}`
        }
        allowOtherCategory={true}
      />

      {/* Project Picker Modal (Scoped by application ID) */}
      <ProjectPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectProject={(proj) => {
          handleProjectSelectedFromModal(activeProjectPickingIndex, proj);
        }}
        tokenData={tokenData}
        appId={rawApplications[activeProjectPickingIndex]?.applicationId || null}
        appName={rawApplications[activeProjectPickingIndex]?.applicationName || null}
        selectedProjectId={
          rawApplications[activeProjectPickingIndex]?.projectId ||
          rawApplications[activeProjectPickingIndex]?.rfcKodeProject ||
          null
        }
        title={
          activeProjectPickingIndex === 0
            ? "Pilih Project Terkait Aplikasi Utama"
            : `Pilih Project Terkait Aplikasi #${activeProjectPickingIndex}`
        }
      />
    </VStack>
  );
};

export default SoftwareStep1;
