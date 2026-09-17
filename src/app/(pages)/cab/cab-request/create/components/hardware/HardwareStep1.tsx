"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
  Textarea,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { FiBriefcase, FiEdit2, FiX } from "react-icons/fi";

import { InputGroupPanel } from "@/app/components/customPanels";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { RequirementsResponse } from "@/app/services/useRequirements";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { CabHardwareStep1 } from "@/app/types/cabTypes";
import ProjectPickerModal from "@/app/components/ProjectPickerModal";
import RadioGroupField from "../RadioGroupField";

interface HardwareStep1Props {
  data: CabHardwareStep1;
  onChange: (data: CabHardwareStep1) => void;
  fetchRequirements?: (search: string, token: string, reqType?: string) => Promise<RequirementsResponse[]>;
  fetchProjects?: (search: string, token: string) => Promise<ProjectDataResponse[]>;
  tokenData: string;
}

const HardwareStep1 = ({
  data,
  onChange,
  fetchProjects,
  tokenData,
}: HardwareStep1Props) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");

  // If initial data has projectId or kodeProject, fetch project details if needed
  useEffect(() => {
    let isMounted = true;
    const loadProjectName = async () => {
      if ((data.projectId || data.kodeProject) && !selectedProjectName && fetchProjects && tokenData) {
        try {
          const projects = await fetchProjects(data.kodeProject || data.projectId || "", tokenData);
          if (isMounted && projects && projects.length > 0) {
            const match = projects.find(
              (p) =>
                p.id === data.projectId ||
                p.projectNo === data.kodeProject ||
                p.projectCode === data.kodeProject
            );
            if (match) {
              setSelectedProjectName(match.projectName || match.projectNo || match.projectCode || "");
            }
          }
        } catch (err) {
          console.error("Failed to load hardware project name:", err);
        }
      }
    };
    loadProjectName();
    return () => {
      isMounted = false;
    };
  }, [data.projectId, data.kodeProject, tokenData]);

  const handleSelectProject = (project: ProjectDataResponse) => {
    const projectCode = project.projectNo || project.projectCode || project.id;
    setSelectedProjectName(project.projectName || projectCode);
    onChange({
      ...data,
      kodeProject: projectCode,
      projectId: project.id || projectCode,
      kodeProjectType: (project.projectCategory as any) || "PROCUREMENT",
    });
  };

  const handleClearProject = () => {
    setSelectedProjectName("");
    onChange({
      ...data,
      kodeProject: "",
      projectId: "",
      kodeProjectType: "",
    });
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <InputGroupPanel headerTitle="Identitas Request Hardware">
        {/* Project Selector Modal Trigger & Selected Card */}
        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>
              Project Terkait
            </FormLabel>
            <Stack spacing={0}>
              {data.kodeProject || data.projectId ? (
                <Card
                  p={3}
                  bg={isDark ? "gray.800" : "white"}
                  border="1px solid"
                  borderColor={isDark ? "purple.600" : "purple.200"}
                  borderRadius="md"
                  shadow="xs"
                >
                  <Flex justify="space-between" align="center" gap={2}>
                    <HStack spacing={2.5} flex={1} minW={0}>
                      <Box
                        p={2}
                        bg={isDark ? "purple.900" : "purple.50"}
                        color="purple.500"
                        borderRadius="md"
                      >
                        <Icon as={FiBriefcase} boxSize={4} />
                      </Box>
                      <VStack align="start" spacing={0.5} flex={1} minW={0}>
                        <HStack spacing={1.5} maxW="full">
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="sm"
                            fontFamily="mono"
                          >
                            {data.kodeProject || data.projectId}
                          </Badge>
                          {data.kodeProjectType && (
                            <Badge
                              colorScheme="blue"
                              variant="subtle"
                              fontSize="xs"
                              px={1.5}
                              borderRadius="sm"
                            >
                              {data.kodeProjectType}
                            </Badge>
                          )}
                        </HStack>
                        {selectedProjectName && (
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            noOfLines={1}
                            title={selectedProjectName}
                            color={isDark ? "white" : "gray.800"}
                          >
                            {selectedProjectName}
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
                        onClick={() => setIsProjectPickerOpen(true)}
                      >
                        Ganti
                      </Button>
                      <IconButton
                        size="xs"
                        aria-label="Hapus project"
                        icon={<FiX />}
                        variant="ghost"
                        colorScheme="gray"
                        onClick={handleClearProject}
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
                  onClick={() => setIsProjectPickerOpen(true)}
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
                      Cari & Pilih Project Terkait Hardware...
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                  >
                    Buka Project
                  </Badge>
                </Button>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Nama Hardware / Perangkat</FormLabel>
            <Stack spacing={0}>
              <Input
                placeholder="Nama perangkat / hardware"
                value={data.namaHardware}
                onChange={(e) => onChange({ ...data, namaHardware: e.target.value })}
              />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Deskripsi Perubahan</FormLabel>
            <Stack spacing={0}>
              <Textarea
                placeholder="Jelaskan perubahan..."
                rows={3}
                value={data.deskripsiPerubahan}
                onChange={(e) => onChange({ ...data, deskripsiPerubahan: e.target.value })}
              />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dampak Terhadap Operasional</FormLabel>
            <Stack spacing={0}>
              <Textarea
                placeholder="Dampak operasional..."
                rows={3}
                value={data.dampakOperasional}
                onChange={(e) => onChange({ ...data, dampakOperasional: e.target.value })}
              />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayoutFull>
            <FormLabel h="full" mt={2}>Dasar Upgrade</FormLabel>
            <Stack spacing={0}>
              <Textarea
                placeholder="Alasan/dasar upgrade..."
                rows={3}
                value={data.dasarUpgrade}
                onChange={(e) => onChange({ ...data, dasarUpgrade: e.target.value })}
              />
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl isRequired>
          <InputLayout>
            <FormLabel h="full" mt={2}>Tanggal Permohonan CAB</FormLabel>
            <Stack spacing={0}>
              <Input
                type="datetime-local"
                value={data.requestedCabDate}
                onChange={(e) => onChange({ ...data, requestedCabDate: e.target.value })}
              />
            </Stack>
          </InputLayout>
        </FormControl>

        <RadioGroupField
          label="Jenis CAB"
          name="jenisCab"
          value={data.jenisCab}
          onChange={(val) => onChange({ ...data, jenisCab: val as any })}
          options={[{ label: "Normal", value: "NORMAL" }, { label: "Emergency", value: "EMERGENCY" }]}
          isRequired
          showChildren={data.jenisCab === "EMERGENCY"}
        >
          <FormControl isRequired>
            <FormLabel fontSize="sm">Alasan Emergency</FormLabel>
            <Textarea
              placeholder="Jelaskan alasan emergency..."
              rows={3}
              value={data.jenisCabEmergencyAlasan || ""}
              onChange={(e) => onChange({ ...data, jenisCabEmergencyAlasan: e.target.value })}
            />
          </FormControl>
        </RadioGroupField>
      </InputGroupPanel>

      {/* Standalone Project Picker Modal */}
      <ProjectPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectProject={handleSelectProject}
        tokenData={tokenData}
        selectedProjectId={data.projectId || data.kodeProject || null}
        title="Pilih Project Terkait Hardware"
      />
    </VStack>
  );
};

export default HardwareStep1;
